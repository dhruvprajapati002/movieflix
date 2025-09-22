import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tmdbService } from '../services/tmdbService';

// Simple cache
const discoveryCache = new Map();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const MAX_CACHE_SIZE = 30;

// Basic filter presets
const FILTER_PRESETS = {
  popular: {
    name: 'Popular Movies',
    sortBy: 'popularity.desc',
    'vote_count.gte': 1000
  },
  highRated: {
    name: 'Highly Rated',
    sortBy: 'vote_average.desc',
    'vote_average.gte': 7.5,
    'vote_count.gte': 500
  },
  recent: {
    name: 'Recent Releases',
    sortBy: 'primary_release_date.desc',
    'primary_release_date.gte': new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  classics: {
    name: 'Classic Films',
    sortBy: 'vote_average.desc',
    'primary_release_date.lte': '2000-12-31',
    'vote_average.gte': 7.0,
    'vote_count.gte': 1000
  },
  action: {
    name: 'Action Movies',
    with_genres: '28',
    sortBy: 'popularity.desc'
  },
  family: {
    name: 'Family Movies',
    with_genres: '10751,16',
    sortBy: 'popularity.desc'
  }
};

// Default filters
const DEFAULT_FILTERS = {
  sortBy: 'popularity.desc',
  with_genres: '',
  'primary_release_date.gte': '',
  'primary_release_date.lte': '',
  'vote_average.gte': '',
  'vote_count.gte': '',
  include_adult: false,
  page: 1
};

// Cache utilities
const getCachedData = (key) => {
  const cached = discoveryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  discoveryCache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  if (discoveryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = discoveryCache.keys().next().value;
    discoveryCache.delete(firstKey);
  }
  
  discoveryCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Main movie discovery hook
export const useMovieDiscovery = (initialFilters = {}, options = {}) => {
  const {
    enableCache = true,
    enableRetry = true,
    maxRetries = 2,
    retryDelay = 1000
  } = options;

  // Core state
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Filter management
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  const [activePreset, setActivePreset] = useState(null);

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

  // Discovery function
  const discoverMovies = useCallback(async (
    targetFilters = filters,
    page = 1,
    append = false,
    isRetry = false
  ) => {
    // Clean filters (remove empty values)
    const cleanFilters = Object.keys(targetFilters).reduce((acc, key) => {
      const value = targetFilters[key];
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const filtersWithPage = { ...cleanFilters, page };
    const cacheKey = JSON.stringify(filtersWithPage);

    // Check cache first
    if (enableCache && !isRetry) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        if (append && page > 1) {
          setMovies(prev => [...prev, ...cached.results]);
        } else {
          setMovies(cached.results);
        }
        setCurrentPage(page);
        setTotalPages(cached.total_pages);
        setTotalResults(cached.total_results);
        setError(null);
        return;
      }
    }

    // Cancel previous request
    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }

      const response = await tmdbService.discoverMovies(filtersWithPage);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const results = response.data.results || [];
      const totalPagesCount = response.data.total_pages || 0;
      const totalResultsCount = response.data.total_results || 0;

      // Cache the results
      if (enableCache) {
        setCachedData(cacheKey, {
          results,
          total_pages: totalPagesCount,
          total_results: totalResultsCount
        });
      }

      // Update movies
      if (append && page > 1) {
        setMovies(prev => [...prev, ...results]);
      } else {
        setMovies(results);
      }

      setCurrentPage(page);
      setTotalPages(totalPagesCount);
      setTotalResults(totalResultsCount);
      setError(null);
      setRetryCount(0);

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('Discovery error:', err);

      // Simple retry logic
      if (enableRetry && !isRetry && retryCount < maxRetries) {
        console.log(`Retrying discovery (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          discoverMovies(targetFilters, page, append, true);
        }, retryDelay);
        return;
      }

      setError(err.message || 'Failed to discover movies');
      if (page === 1) {
        setMovies([]);
        setTotalResults(0);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, enableCache, enableRetry, maxRetries, retryDelay, retryCount, cleanup]);

  // Update filters and trigger discovery
  const updateFilters = useCallback((newFilters, immediate = true) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    setCurrentPage(1);
    setActivePreset(null);
    
    if (immediate) {
      discoverMovies(updatedFilters, 1, false);
    }
  }, [filters, discoverMovies]);

  // Apply preset filters
  const applyPreset = useCallback((presetKey) => {
    const preset = FILTER_PRESETS[presetKey];
    if (!preset) return;

    setActivePreset(presetKey);
    
    const presetFilters = { ...DEFAULT_FILTERS, ...preset };
    delete presetFilters.name; // Remove name from filters
    
    setFilters(presetFilters);
    discoverMovies(presetFilters, 1, false);
  }, [discoverMovies]);

  // Load more results
  const loadMore = useCallback(() => {
    if (!loading && currentPage < totalPages) {
      discoverMovies(filters, currentPage + 1, true);
    }
  }, [loading, currentPage, totalPages, filters, discoverMovies]);

  // Reset to default filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActivePreset(null);
    setCurrentPage(1);
    discoverMovies(DEFAULT_FILTERS, 1, false);
  }, [discoverMovies]);

  // Manual retry
  const retry = useCallback(() => {
    setRetryCount(0);
    discoverMovies(filters, currentPage, false);
  }, [filters, currentPage, discoverMovies]);

  // Refresh current results
  const refresh = useCallback(() => {
    discoverMovies(filters, 1, false);
  }, [filters, discoverMovies]);

  // Initial discovery on mount
  useEffect(() => {
    discoverMovies(filters, 1, false);
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Computed values
  const computedValues = useMemo(() => ({
    hasMore: currentPage < totalPages,
    isEmpty: !loading && movies.length === 0 && !error,
    hasResults: movies.length > 0,
    isLoadingMore: loading && currentPage > 1,
    hasActiveFilters: JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS),
    filterCount: Object.keys(filters).filter(key => 
      filters[key] !== '' && 
      filters[key] !== null && 
      filters[key] !== undefined &&
      filters[key] !== DEFAULT_FILTERS[key]
    ).length
  }), [currentPage, totalPages, loading, movies.length, error, filters]);

  return {
    // Core data
    movies,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    retryCount,

    // Filter management
    filters,
    updateFilters,

    // Preset management
    presets: FILTER_PRESETS,
    activePreset,
    applyPreset,

    // Actions
    loadMore,
    resetFilters,
    retry,
    refresh,

    // Computed values
    ...computedValues,

    // Cache management
    clearCache: () => discoveryCache.clear()
  };
};

// Specialized hooks for common use cases
export const useGenreDiscovery = (genreIds = []) => {
  const genreFilter = Array.isArray(genreIds) ? genreIds.join(',') : genreIds;
  
  return useMovieDiscovery({
    with_genres: genreFilter,
    sortBy: 'popularity.desc'
  });
};

export const useYearDiscovery = (year) => {
  return useMovieDiscovery({
    primary_release_year: year,
    sortBy: 'vote_average.desc'
  });
};

export const useRatingDiscovery = (minRating = 7.0, minVotes = 500) => {
  return useMovieDiscovery({
    'vote_average.gte': minRating,
    'vote_count.gte': minVotes,
    sortBy: 'vote_average.desc'
  });
};

// Cache utilities
export const discoveryCacheUtils = {
  clear: () => discoveryCache.clear(),
  size: () => discoveryCache.size
};

export default useMovieDiscovery;
