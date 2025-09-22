import { useState, useEffect, useCallback, useRef } from 'react';
import { tmdbService } from '../services/tmdbService';
import { watchmodeService } from '../services/watchmodeService';

// Simple movie details cache
const movieDetailsCache = new Map();
const CACHE_DURATION = 1000 * 60 * 20; // 20 minutes
const MAX_CACHE_SIZE = 30;

const getCachedMovie = (movieId) => {
  const cached = movieDetailsCache.get(movieId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  movieDetailsCache.delete(movieId);
  return null;
};

const setCachedMovie = (movieId, data) => {
  if (movieDetailsCache.size >= MAX_CACHE_SIZE) {
    const firstKey = movieDetailsCache.keys().next().value;
    movieDetailsCache.delete(firstKey);
  }
  
  movieDetailsCache.set(movieId, {
    data,
    timestamp: Date.now()
  });
};

// Main movie details hook
export const useMovieDetails = (movieId, options = {}) => {
  const {
    enableCache = true,
    enableRetry = true,
    maxRetries = 2,
    retryDelay = 1000,
    fetchStreamingData = false
  } = options;

  // Core state
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Additional data
  const [streamingData, setStreamingData] = useState({
    subscriptions: [],
    rentals: [],
    free: [],
    loading: false,
    error: null
  });

  // Refs
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Process movie data with essential fields only
  const processMovieData = useCallback((rawMovie) => {
    if (!rawMovie) return null;

    return {
      ...rawMovie,
      // Basic computed fields
      year: rawMovie.release_date ? new Date(rawMovie.release_date).getFullYear() : null,
      formattedRuntime: rawMovie.runtime ? 
        `${Math.floor(rawMovie.runtime / 60)}h ${rawMovie.runtime % 60}m` : null,
      
      // Image URLs
      poster_url: rawMovie.poster_path ? 
        `https://image.tmdb.org/t/p/w500${rawMovie.poster_path}` : null,
      backdrop_url: rawMovie.backdrop_path ? 
        `https://image.tmdb.org/t/p/original${rawMovie.backdrop_path}` : null,
      
      // Rating info
      ratingFormatted: rawMovie.vote_average ? 
        `${rawMovie.vote_average.toFixed(1)}/10` : 'No rating',
      ratingPercentage: rawMovie.vote_average ? 
        Math.round(rawMovie.vote_average * 10) : 0,
      
      // Cast and crew
      director: rawMovie.credits?.crew?.find(person => person.job === 'Director'),
      mainCast: rawMovie.credits?.cast?.slice(0, 8) || [],
      
      // Trailer
      trailer: rawMovie.videos?.results?.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ),
      
      // Release info
      isReleased: rawMovie.release_date ? 
        new Date(rawMovie.release_date) <= new Date() : false,
      releaseDateFormatted: rawMovie.release_date ? 
        new Date(rawMovie.release_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null
    };
  }, []);

  // Fetch streaming data separately
  const fetchMovieStreamingData = useCallback(async (movieData) => {
    if (!fetchStreamingData || !movieData) return;

    try {
      setStreamingData(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await watchmodeService.getStreamingAvailability(movieData);
      
      setStreamingData({
        ...result,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching streaming data:', error);
      setStreamingData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [fetchStreamingData]);

  // Main fetch function
  const fetchMovieDetails = useCallback(async (id, isRetry = false) => {
    if (!id) return;

    // Check cache first
    if (enableCache && !isRetry) {
      const cached = getCachedMovie(id);
      if (cached) {
        const processedMovie = processMovieData(cached);
        setMovie(processedMovie);
        setLoading(false);
        setError(null);
        
        // Fetch streaming data if enabled
        if (fetchStreamingData) {
          fetchMovieStreamingData(processedMovie);
        }
        return;
      }
    }

    // Cancel previous request
    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
        setRetryCount(0);
      }

      const response = await tmdbService.getMovieDetails(id);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const processedMovie = processMovieData(response.data);
      
      // Cache the result
      if (enableCache) {
        setCachedMovie(id, response.data);
      }

      setMovie(processedMovie);
      setError(null);
      setRetryCount(0);

      // Fetch streaming data if enabled
      if (fetchStreamingData) {
        fetchMovieStreamingData(processedMovie);
      }

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('Error fetching movie details:', err);

      // Simple retry logic
      if (enableRetry && !isRetry && retryCount < maxRetries) {
        console.log(`Retrying movie details (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchMovieDetails(id, true);
        }, retryDelay);
        return;
      }

      const errorMessage = err.message || 'Failed to fetch movie details';
      setError(errorMessage);
      setMovie(null);

    } finally {
      setLoading(false);
    }
  }, [
    enableCache, enableRetry, maxRetries, retryDelay, retryCount,
    processMovieData, fetchStreamingData, fetchMovieStreamingData, cleanup
  ]);

  // Manual retry
  const retry = useCallback(() => {
    if (movieId) {
      setRetryCount(0);
      fetchMovieDetails(movieId, false);
    }
  }, [movieId, fetchMovieDetails]);

  // Refresh data (clear cache and refetch)
  const refresh = useCallback(() => {
    if (movieId) {
      movieDetailsCache.delete(movieId);
      fetchMovieDetails(movieId, false);
    }
  }, [movieId, fetchMovieDetails]);

  // Main effect
  useEffect(() => {
    if (movieId) {
      fetchMovieDetails(movieId);
    } else {
      setMovie(null);
      setError(null);
      setStreamingData({
        subscriptions: [],
        rentals: [],
        free: [],
        loading: false,
        error: null
      });
    }
  }, [movieId, fetchMovieDetails]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Core data
    movie,
    loading,
    error,
    retryCount,
    
    // Streaming data
    streamingData,
    
    // Actions
    retry,
    refresh,
    
    // Computed values
    isLoaded: !!movie,
    hasTrailer: !!movie?.trailer,
    hasBackdrop: !!movie?.backdrop_url,
    hasPoster: !!movie?.poster_url,
    isReleased: movie?.isReleased || false,
    
    // Cache utilities
    clearCache: () => movieDetailsCache.clear()
  };
};

// Simple hook for movie credits
export const useMovieCredits = (movieId) => {
  const [credits, setCredits] = useState({
    cast: [],
    crew: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!movieId) {
      setCredits({ cast: [], crew: [], loading: false, error: null });
      return;
    }

    const fetchCredits = async () => {
      try {
        setCredits(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await tmdbService.getMovieDetails(movieId);
        
        setCredits({
          cast: response.data.credits?.cast || [],
          crew: response.data.credits?.crew || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setCredits({
          cast: [],
          crew: [],
          loading: false,
          error: error.message
        });
      }
    };

    fetchCredits();
  }, [movieId]);

  return credits;
};

// Simple hook for movie videos
export const useMovieVideos = (movieId) => {
  const [videos, setVideos] = useState({
    trailers: [],
    teasers: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!movieId) {
      setVideos({ trailers: [], teasers: [], loading: false, error: null });
      return;
    }

    const fetchVideos = async () => {
      try {
        setVideos(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await tmdbService.getMovieDetails(movieId);
        const videoList = response.data.videos?.results || [];
        
        setVideos({
          trailers: videoList.filter(video => video.type === 'Trailer' && video.site === 'YouTube'),
          teasers: videoList.filter(video => video.type === 'Teaser' && video.site === 'YouTube'),
          loading: false,
          error: null
        });
      } catch (error) {
        setVideos({
          trailers: [],
          teasers: [],
          loading: false,
          error: error.message
        });
      }
    };

    fetchVideos();
  }, [movieId]);

  return videos;
};

// Cache utilities
export const movieDetailsCacheUtils = {
  clear: () => movieDetailsCache.clear(),
  size: () => movieDetailsCache.size,
  has: (movieId) => movieDetailsCache.has(movieId)
};

export default useMovieDetails;
