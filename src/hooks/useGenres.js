import { useState, useEffect, useCallback, useMemo } from 'react';
import { tmdbService } from '../services/tmdbService';

// Simple genre cache
const GENRE_CACHE_KEY = 'movieflix_genres';
const GENRE_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Basic genre colors for UI
const GENRE_COLORS = {
  28: '#FF6B6B',    // Action
  12: '#4ECDC4',    // Adventure
  16: '#45B7D1',    // Animation
  35: '#FFA726',    // Comedy
  80: '#8E24AA',    // Crime
  99: '#6D4C41',    // Documentary
  18: '#F06292',    // Drama
  10751: '#81C784', // Family
  14: '#BA68C8',    // Fantasy
  36: '#A1887F',    // History
  27: '#E57373',    // Horror
  10402: '#FFB74D', // Music
  9648: '#7986CB',  // Mystery
  10749: '#F48FB1', // Romance
  878: '#64B5F6',   // Science Fiction
  53: '#FF8A65',    // Thriller
  10752: '#8D6E63', // War
  37: '#D4B896'     // Western
};

// Cache utilities
const getCachedGenres = () => {
  try {
    const cached = localStorage.getItem(GENRE_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < GENRE_CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to read genres cache:', error);
  }
  return null;
};

const setCachedGenres = (genres) => {
  try {
    localStorage.setItem(GENRE_CACHE_KEY, JSON.stringify({
      data: genres,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to cache genres:', error);
  }
};

// Main useGenres hook
export const useGenres = (options = {}) => {
  const {
    enableCache = true,
    enableRetry = true,
    maxRetries = 2,
    retryDelay = 1000
  } = options;

  // Core state
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch genres with caching and retry logic
  const fetchGenres = useCallback(async (isRetry = false) => {
    // Check cache first
    if (enableCache && !isRetry) {
      const cached = getCachedGenres();
      if (cached) {
        setGenres(cached);
        setLoading(false);
        setError(null);
        setLastUpdated(new Date());
        return;
      }
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
        setRetryCount(0);
      }

      const response = await tmdbService.getGenres();
      const fetchedGenres = response.data.genres || [];

      // Add basic color information
      const enhancedGenres = fetchedGenres.map(genre => ({
        ...genre,
        color: GENRE_COLORS[genre.id] || '#90A4AE'
      }));

      setGenres(enhancedGenres);
      setError(null);
      setRetryCount(0);
      setLastUpdated(new Date());

      // Cache the genres
      if (enableCache) {
        setCachedGenres(enhancedGenres);
      }

    } catch (err) {
      console.error('Error fetching genres:', err);

      // Simple retry logic
      if (enableRetry && !isRetry && retryCount < maxRetries) {
        console.log(`Retrying genres fetch (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          fetchGenres(true);
        }, retryDelay);
        return;
      }

      const errorMessage = err.message || 'Failed to fetch genres';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [enableCache, enableRetry, maxRetries, retryDelay, retryCount]);

  // Initialize
  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Utility functions with memoization
  const utilities = useMemo(() => {
    return {
      // Get single genre by ID
      getGenreById: (id) => {
        return genres.find(genre => genre.id === parseInt(id));
      },

      // Get multiple genres by IDs
      getGenresByIds: (ids) => {
        const numericIds = ids.map(id => parseInt(id));
        return genres.filter(genre => numericIds.includes(genre.id));
      },

      // Format genre list as string
      formatGenreList: (genreIds, separator = ', ', maxItems = 3) => {
        const genreNames = utilities.getGenresByIds(genreIds)
          .map(genre => genre.name);

        if (genreNames.length <= maxItems) {
          return genreNames.join(separator);
        }

        const displayed = genreNames.slice(0, maxItems);
        const remaining = genreNames.length - maxItems;
        return `${displayed.join(separator)} +${remaining} more`;
      },

      // Search genres by name
      searchGenres: (query) => {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return [];
        
        return genres.filter(genre =>
          genre.name.toLowerCase().includes(lowerQuery)
        );
      }
    };
  }, [genres]);

  // Action functions
  const actions = useMemo(() => ({
    retry: () => {
      setRetryCount(0);
      fetchGenres(false);
    },

    refresh: () => {
      if (enableCache) {
        localStorage.removeItem(GENRE_CACHE_KEY);
      }
      fetchGenres(false);
    },

    clearCache: () => {
      localStorage.removeItem(GENRE_CACHE_KEY);
    }
  }), [fetchGenres, enableCache]);

  return {
    // Core data
    genres,
    loading,
    error,
    retryCount,
    lastUpdated,

    // Utilities
    ...utilities,

    // Actions
    ...actions,

    // Computed values
    hasGenres: genres.length > 0,
    isEmpty: !loading && genres.length === 0,
    totalGenres: genres.length
  };
};

// Simple hook for popular genres (commonly used ones)
export const usePopularGenres = () => {
  const { genres, loading, error } = useGenres();
  
  // Popular genre IDs based on general movie popularity
  const popularIds = [28, 35, 18, 878, 12, 53, 10749, 16, 27, 14];
  
  const popularGenres = useMemo(() => {
    return genres.filter(genre => popularIds.includes(genre.id));
  }, [genres]);

  return {
    popularGenres,
    loading,
    error
  };
};

// Simple genre search hook
export const useGenreSearch = () => {
  const [query, setQuery] = useState('');
  const { genres, searchGenres } = useGenres();
  
  const results = useMemo(() => {
    return searchGenres(query);
  }, [query, searchGenres]);

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0
  };
};

// Cache utilities
export const genreCacheUtils = {
  clear: () => localStorage.removeItem(GENRE_CACHE_KEY),
  has: () => !!getCachedGenres()
};

export default useGenres;
