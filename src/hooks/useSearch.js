import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tmdbService } from '../services/tmdbService';

// Simple search cache
const searchCache = new Map();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const MAX_CACHE_SIZE = 50;

const getCachedData = (key) => {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  searchCache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  // Simple cache size management
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  
  searchCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Search history management
const SEARCH_HISTORY_KEY = 'movieflix_search_history';
const MAX_HISTORY_ITEMS = 20;

const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = history ? JSON.parse(history) : [];
    // Ensure it's always an array
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToSearchHistory = (query, resultCount = 0) => {
  if (!query?.trim() || query.trim().length < 2) return;
  
  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim();
    
    const historyEntry = {
      query: trimmedQuery,
      timestamp: Date.now(),
      resultCount
    };
    
    // Remove if already exists (to move to top) - FIXED THIS LINE
    const filtered = history.filter(item => 
      (typeof item === 'string' ? item : item.query) !== trimmedQuery
    );
    
    const newHistory = [historyEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
};

// Popular searches
const getPopularSearches = () => [
  'Spider-Man', 'Batman', 'Avengers', 'Marvel', 'Disney', 
  'Horror movies', 'Comedy', 'Action', 'Thriller', 'Sci-fi',
  'Christopher Nolan', 'Martin Scorsese'
];

// Main search hook
export const useSearch = (initialQuery = '', options = {}) => {
  const {
    debounceDelay = 300,
    minQueryLength = 2,
    enableHistory = true,
    enableCache = true,
    maxRetries = 2,
    retryDelay = 1000
  } = options;

  // Core state
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Additional state - FIXED: Ensure searchHistory is always an array
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [suggestions, setSuggestions] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [searchMetrics, setSearchMetrics] = useState({
    totalSearches: 0,
    responseTime: 0
  });

  // Refs
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  // Popular searches
  const popularSearches = useMemo(() => getPopularSearches(), []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceDelay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, debounceDelay]);

  // Generate suggestions - FIXED: Added safety checks
  const generateSuggestions = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase().trim();
    
    // History suggestions - FIXED: Added safety checks
    const historySuggestions = Array.isArray(searchHistory)
      ? searchHistory
          .filter(item => {
            const itemQuery = typeof item === 'string' ? item : item.query;
            return itemQuery && itemQuery.toLowerCase().includes(queryLower);
          })
          .slice(0, 5)
          .map(item => ({ 
            ...(typeof item === 'string' ? { query: item } : item), 
            type: 'history' 
          }))
      : [];

    // Popular suggestions
    const popularSuggestions = popularSearches
      .filter(search => search.toLowerCase().includes(queryLower))
      .slice(0, 4)
      .map(search => ({ query: search, type: 'popular' }));

    const allSuggestions = [...historySuggestions, ...popularSuggestions]
      .slice(0, 8);

    setSuggestions(allSuggestions);
  }, [searchHistory, popularSearches]);

  // Search function
  const searchMovies = useCallback(async (searchQuery, page = 1, isRetry = false) => {
    if (!searchQuery?.trim() || searchQuery.trim().length < minQueryLength) return;

    const trimmedQuery = searchQuery.trim();
    startTimeRef.current = performance.now();

    // Check cache first
    const cacheKey = `${trimmedQuery.toLowerCase()}_${page}`;
    if (enableCache && !isRetry && page === 1) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setResults(cached.results || []);
        setTotalResults(cached.totalResults || 0);
        setCurrentPage(page);
        setLoading(false);
        setError(null);
        return cached;
      }
    }

    // Cancel previous request
    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      if (page === 1) {
        setError(null);
        setRetryCount(0);
      }

      const response = await tmdbService.searchMovies(trimmedQuery, page);
      const responseTime = performance.now() - startTimeRef.current;
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const newResults = response.data.results || [];
      const totalCount = response.data.total_results || 0;

      // Cache results for first page
      if (enableCache && page === 1) {
        setCachedData(cacheKey, {
          results: newResults,
          totalResults: totalCount
        });
      }

      if (page === 1) {
        setResults(newResults);
        
        // Save to search history
        if (enableHistory && newResults.length > 0) {
          saveToSearchHistory(trimmedQuery, totalCount);
          setSearchHistory(getSearchHistory());
        }
      } else {
        setResults(prev => [...prev, ...newResults]);
      }

      setTotalResults(totalCount);
      setCurrentPage(page);
      setError(null);
      setRetryCount(0);

      // Update metrics
      setSearchMetrics(prev => ({
        totalSearches: prev.totalSearches + (page === 1 ? 1 : 0),
        responseTime
      }));

      return { results: newResults, totalResults: totalCount };

    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      console.error('Search error:', err);
      
      // Simple retry logic
      if (!isRetry && retryCount < maxRetries) {
        console.log(`Retrying search (attempt ${retryCount + 1}/${maxRetries})`);
        
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          searchMovies(trimmedQuery, page, true);
        }, retryDelay);
        return null;
      }

      // Set error
      const errorMessage = err.message || 'Failed to search movies';
      setError(errorMessage);
      
      if (page === 1) {
        setResults([]);
        setTotalResults(0);
      }

    } finally {
      setLoading(false);
    }
  }, [minQueryLength, enableCache, enableHistory, retryCount, maxRetries, retryDelay, cleanup]);

  // Search execution effect
  useEffect(() => {
    if (debouncedQuery.trim().length >= minQueryLength) {
      searchMovies(debouncedQuery, 1);
    } else {
      setResults([]);
      setTotalResults(0);
      setCurrentPage(1);
      setError(null);
      setSuggestions([]);
    }
  }, [debouncedQuery, searchMovies, minQueryLength]);

  // Generate suggestions effect
  useEffect(() => {
    generateSuggestions(query);
  }, [query, generateSuggestions]);

  // Load more function
  const loadMore = useCallback(() => {
    if (debouncedQuery.trim() && !loading && hasMore && currentPage < 20) {
      searchMovies(debouncedQuery, currentPage + 1);
    }
  }, [debouncedQuery, currentPage, loading, searchMovies]);

  // Retry function
  const retry = useCallback(() => {
    if (debouncedQuery.trim()) {
      setRetryCount(0);
      setError(null);
      searchMovies(debouncedQuery, 1);
    }
  }, [debouncedQuery, searchMovies]);

  // Clear search function
  const clearSearch = useCallback(() => {
    cleanup();
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError(null);
    setRetryCount(0);
    setSuggestions([]);
  }, [cleanup]);

  // Clear history function
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  // Search by suggestion
  const searchBySuggestion = useCallback((suggestion) => {
    const searchQuery = typeof suggestion === 'string' ? suggestion : suggestion.query;
    setQuery(searchQuery);
    setSuggestions([]);
  }, []);

  // Computed values
  const hasMore = currentPage * 20 < totalResults && currentPage < 20;
  const isSearching = loading && currentPage === 1;
  const isLoadingMore = loading && currentPage > 1;
  const hasResults = results.length > 0;
  const isEmpty = !loading && !hasResults && debouncedQuery.length >= minQueryLength;

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Core search state
    query,
    setQuery,
    results,
    loading,
    error,
    totalResults,
    currentPage,
    
    // Additional state
    searchHistory,
    suggestions,
    popularSearches,
    searchMetrics,
    retryCount,
    
    // Actions
    loadMore,
    clearSearch,
    retry,
    clearHistory,
    searchBySuggestion,
    
    // Computed values
    hasMore,
    isSearching,
    isLoadingMore,
    hasResults,
    isEmpty,
    
    // Utility functions
    clearCache: () => searchCache.clear(),
    getCacheSize: () => searchCache.size
  };
};

export default useSearch;
