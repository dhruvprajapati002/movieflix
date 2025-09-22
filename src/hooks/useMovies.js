import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tmdbService } from '../services/tmdbService';

// Simple cache
const movieCache = new Map();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const MAX_CACHE_SIZE = 50;

const getCachedData = (key) => {
  const cached = movieCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  movieCache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  // Simple cache size management
  if (movieCache.size >= MAX_CACHE_SIZE) {
    const firstKey = movieCache.keys().next().value;
    movieCache.delete(firstKey);
  }
  
  movieCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Main useMovies hook
export const useMovies = (endpoint, params = {}, options = {}) => {
  const {
    enableCache = true,
    enableRetry = true,
    maxRetries = 2,
    retryDelay = 1000
  } = options;

  // Core state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Refs
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Memoize params to avoid unnecessary re-renders
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

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

  // API caller
  const callAPI = useCallback(async (apiEndpoint, apiParams) => {
    switch (apiEndpoint) {
      case 'trending':
        return await tmdbService.getTrending(apiParams.timeWindow || 'day');
      case 'popular':
        return await tmdbService.getPopular(apiParams.page || 1);
      case 'top-rated':
        return await tmdbService.getTopRated(apiParams.page || 1);
      case 'upcoming':
        return await tmdbService.getUpcoming(apiParams.page || 1);
      case 'now-playing':
        return await tmdbService.getNowPlaying(apiParams.page || 1);
      case 'discover':
        return await tmdbService.discoverMovies(apiParams);
      case 'by-genre':
        return await tmdbService.getMoviesByGenre(apiParams.genreId, apiParams.page || 1);
      default:
        throw new Error(`Unsupported endpoint: ${apiEndpoint}`);
    }
  }, []);

  // Main fetch function
  const fetchData = useCallback(async (isRetry = false, pageNumber = null) => {
    if (!endpoint) return;

    const targetPage = pageNumber || memoizedParams.page || 1;
    const fetchParams = { ...memoizedParams, page: targetPage };
    const cacheKey = `${endpoint}_${JSON.stringify(fetchParams)}`;

    // Check cache first
    if (enableCache && !isRetry && targetPage === 1) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached.results || cached);
        setTotalResults(cached.total_results || 0);
        setTotalPages(cached.total_pages || 0);
        setCurrentPage(targetPage);
        setLoading(false);
        setError(null);
        setLastUpdated(new Date());
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

      const response = await callAPI(endpoint, fetchParams);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const results = response.data.results || response.data || [];

      // Cache the response for first page
      if (enableCache && targetPage === 1) {
        setCachedData(cacheKey, response.data);
      }

      // Handle pagination
      if (targetPage > 1) {
        setData(prev => [...prev, ...results]);
      } else {
        setData(results);
      }

      setTotalResults(response.data.total_results || 0);
      setTotalPages(response.data.total_pages || 0);
      setCurrentPage(targetPage);
      setError(null);
      setRetryCount(0);
      setLastUpdated(new Date());

    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error(`Error fetching ${endpoint}:`, err);

      // Simple retry logic
      if (enableRetry && !isRetry && retryCount < maxRetries) {
        console.log(`Retrying ${endpoint} request (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchData(true, pageNumber);
        }, retryDelay);
        return;
      }

      const errorMessage = err.message || `Failed to fetch ${endpoint}`;
      setError(errorMessage);
      
      // Clear data on error for first page
      if (targetPage === 1) {
        setData([]);
        setTotalResults(0);
        setTotalPages(0);
      }

    } finally {
      setLoading(false);
    }
  }, [endpoint, memoizedParams, enableCache, enableRetry, maxRetries, retryDelay, retryCount, callAPI, cleanup]);

  // Load more data (for pagination)
  const loadMore = useCallback(() => {
    if (!loading && currentPage < totalPages) {
      fetchData(false, currentPage + 1);
    }
  }, [loading, currentPage, totalPages, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(false, 1);
  }, [fetchData]);

  // Manual retry function
  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData(false, currentPage);
  }, [fetchData, currentPage]);

  // Main effect
  useEffect(() => {
    fetchData();
  }, [endpoint, JSON.stringify(memoizedParams)]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Computed values
  const isEmpty = !loading && data.length === 0 && !error;
  const hasData = data.length > 0;
  const hasMore = currentPage < totalPages;
  const isLoadingMore = loading && currentPage > 1;

  return {
    // Core data
    data,
    loading,
    error,
    
    // Pagination info
    totalResults,
    totalPages,
    currentPage,
    hasMore,
    
    // Additional state
    lastUpdated,
    retryCount,
    isEmpty,
    hasData,
    isLoadingMore,
    
    // Actions
    loadMore,
    refresh,
    retry
  };
};

// Specialized hooks for common use cases
export const useTrendingMovies = (timeWindow = 'day') => {
  return useMovies('trending', { timeWindow });
};

export const usePopularMovies = (page = 1) => {
  return useMovies('popular', { page });
};

export const useTopRatedMovies = (page = 1) => {
  return useMovies('top-rated', { page });
};

export const useUpcomingMovies = (page = 1) => {
  return useMovies('upcoming', { page });
};

export const useNowPlayingMovies = (page = 1) => {
  return useMovies('now-playing', { page });
};

export const useDiscoverMovies = (filters = {}) => {
  return useMovies('discover', filters);
};

export const useMoviesByGenre = (genreId, page = 1) => {
  return useMovies('by-genre', { genreId, page });
};

// Simple dashboard hook that fetches basic data
export const useMovieDashboard = () => {
  const trending = useTrendingMovies();
  const popular = usePopularMovies();
  const upcoming = useUpcomingMovies();

  const isLoading = trending.loading || popular.loading || upcoming.loading;
  const hasError = trending.error || popular.error || upcoming.error;

  const refresh = useCallback(() => {
    trending.refresh();
    popular.refresh();
    upcoming.refresh();
  }, [trending.refresh, popular.refresh, upcoming.refresh]);

  return {
    trending: trending.data,
    popular: popular.data,
    upcoming: upcoming.data,
    loading: isLoading,
    error: hasError,
    refresh
  };
};

// Simple cache utilities
export const movieCacheUtils = {
  clear: () => movieCache.clear(),
  size: () => movieCache.size,
  has: (key) => movieCache.has(key)
};

export default useMovies;
