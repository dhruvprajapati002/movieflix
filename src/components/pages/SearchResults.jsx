import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search as SearchIcon, Film, AlertCircle, TrendingUp, 
  Globe, Users, Target, Zap, Eye, Loader2
} from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import SearchBar from '../ui/SearchBar';
import MovieGrid from '../ui/MovieGrid';
import Loading from '../common/Loading';

// Simple Search Header
const SearchHeader = ({ 
  query, 
  setQuery, 
  onSearch, 
  suggestions, 
  recentSearches, 
  onClearRecent,
  searchMetrics 
}) => (
  <div className="text-center py-12 md:py-16">
    {/* Search Icon */}
    <div className="flex items-center justify-center mb-8">
      <div className="relative">
        <div className="bg-blue-500 p-4 rounded-full shadow-lg">
          <SearchIcon className="h-10 w-10 text-white" />
        </div>
        
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
    </div>

    {/* Title */}
    <div className="space-y-4 mb-8">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
        <span className="text-gray-900 dark:text-white">Find Your </span>
        <span className="text-blue-600">Perfect Movie</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Discover amazing movies from our vast collection of cinema
      </p>
      
      {searchMetrics && searchMetrics.totalSearches > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {searchMetrics.totalSearches} searches • 
          {searchMetrics.responseTime > 0 && ` ${Math.round(searchMetrics.responseTime)}ms response`}
        </div>
      )}
    </div>

    {/* Search Bar */}
    <div className="max-w-2xl mx-auto mb-8">
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearch={onSearch}
        suggestions={suggestions}
        recentSearches={recentSearches}
        onClearRecent={onClearRecent}
        searchMetrics={searchMetrics}
      />
    </div>

    {/* Search Stats */}
    <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
      {[
        { icon: Globe, text: '1M+ Movies', color: 'text-blue-500' },
        { icon: Users, text: 'Real-time Search', color: 'text-green-500' },
        { icon: Target, text: 'Smart Results', color: 'text-purple-500' },
        { icon: Zap, text: 'Instant Suggestions', color: 'text-yellow-500' }
      ].map((stat) => (
        <div
          key={stat.text}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full"
        >
          <stat.icon className={`h-4 w-4 ${stat.color}`} />
          <span className="font-medium">{stat.text}</span>
        </div>
      ))}
    </div>
  </div>
);

// Auto-scroll hook for infinite loading
const useAutoLoadMore = (hasMore, loading, loadMore, results) => {
  const targetRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading || results.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [hasMore, loading, loadMore, results.length]);

  return targetRef;
};

// Utility function to normalize search history
const normalizeSearchHistory = (history) => {
  // Always ensure we return an array
  if (!history) return [];
  if (!Array.isArray(history)) return [];
  
  return history
    .map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.query || item.text || String(item);
      }
      return String(item);
    })
    .filter(item => item && item.length > 0)
    .slice(0, 15); // Limit to 15 items
};


// Main SearchResults Component
const SearchResults = ({ initialQuery = '', onMovieClick }) => {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    totalResults,
    loadMore,
    hasMore,
    clearSearch,
    searchMetrics,
    retry
  } = useSearch(initialQuery);

  const [rawSearchHistory, setRawSearchHistory] = useLocalStorage('movieflix_search_history', []);
  const [favorites, setFavorites] = useLocalStorage('movieflix_favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage('movieflix_watchlist', []);

  // Auto-load more trigger
  const autoLoadRef = useAutoLoadMore(hasMore, loading, loadMore, results);

  // Normalize search history
  const searchHistory = useMemo(() => normalizeSearchHistory(rawSearchHistory), [rawSearchHistory]);

  const trendingSuggestions = useMemo(() => [
    'Spider-Man', 'Batman', 'Avengers', 'Marvel', 'Disney', 
    'Horror movies', 'Comedy', 'Action', 'Sci-fi', 'Thriller',
    'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino'
  ], []);

  const handleSearch = useCallback((searchQuery) => {
  if (searchQuery && searchQuery.trim()) {
    const trimmedQuery = searchQuery.trim();
    
    // Ensure searchHistory is always an array
    const safeSearchHistory = Array.isArray(searchHistory) ? searchHistory : [];
    
    const newHistory = [
      trimmedQuery, 
      ...safeSearchHistory.filter(h => h !== trimmedQuery)
    ].slice(0, 15);
    
    setRawSearchHistory(newHistory);
  }
}, [searchHistory, setRawSearchHistory]);

  const handleClearHistory = useCallback(() => {
    setRawSearchHistory([]);
  }, [setRawSearchHistory]);

  const handleSuggestionClick = useCallback((suggestion) => {
    const suggestionString = typeof suggestion === 'string' ? suggestion : suggestion.query || String(suggestion);
    setQuery(suggestionString);
    handleSearch(suggestionString);
  }, [setQuery, handleSearch]);

  const handleAddToFavorites = useCallback((movie) => {
    if (!movie || !movie.id) return;
    
    const isAlreadyFavorite = favorites.find(fav => fav.id === movie.id);
    if (isAlreadyFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, { 
        ...movie, 
        dateAdded: Date.now()
      }]);
    }
  }, [favorites, setFavorites]);

  const handleAddToWatchlist = useCallback((movie) => {
    if (!movie || !movie.id) return;
    
    const isAlreadyInWatchlist = watchlist.find(item => item.id === movie.id);
    if (isAlreadyInWatchlist) {
      setWatchlist(watchlist.filter(item => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, { 
        ...movie, 
        dateAdded: Date.now()
      }]);
    }
  }, [watchlist, setWatchlist]);

  return (
    <div className="space-y-8 min-h-screen">
      {/* Search Header */}
      <SearchHeader
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        suggestions={trendingSuggestions}
        recentSearches={searchHistory}
        onClearRecent={handleClearHistory}
        searchMetrics={searchMetrics}
      />

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {query ? (
          <motion.div
            key="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Loading State */}
            {loading && results.length === 0 && (
              <Loading 
                count={12} 
                showMessage={true} 
                variant="movie"
                className="mt-8"
              />
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Search Error
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={retry}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && results.length === 0 && query.length >= 2 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Film className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Movies Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  We couldn't find any movies matching "
                  <span className="font-semibold text-blue-600">{query}</span>
                  ". Try different keywords.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {trendingSuggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Grid */}
            {results.length > 0 && (
              <>
                {/* Results Header */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    {totalResults > 0 && (
                      <>Found {totalResults.toLocaleString()} results for "<span className="font-semibold text-blue-600">{query}</span>"</>
                    )}
                  </p>
                </div>

                <MovieGrid
                  movies={results}
                  favorites={favorites}
                  watchlist={watchlist}
                  onFavorite={handleAddToFavorites}
                  onWatchlist={handleAddToWatchlist}
                  onMovieClick={onMovieClick}
                />

                {/* Auto-load trigger */}
                <div ref={autoLoadRef} className="h-4" />

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-2xl shadow-lg transition-colors disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-2">
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading More...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-5 w-5" />
                            <span>Load More Movies</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
                <SearchIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Start Your Movie Discovery
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                Type in the search box above to discover amazing movies, actors, and directors
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {trendingSuggestions.slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-lg font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SearchResults);
