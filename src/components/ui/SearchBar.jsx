import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const SearchBar = ({ 
  query, 
  setQuery, 
  onSearch, 
  suggestions = [], 
  recentSearches = [], 
  onClearRecent,
  placeholder = "Search movies, actors, directors..."
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionRefs = useRef({});

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 || recentSearches.length > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Handle different suggestion formats
    let searchQuery;
    if (typeof suggestion === 'string') {
      searchQuery = suggestion;
    } else if (suggestion && typeof suggestion === 'object') {
      searchQuery = suggestion.query || suggestion.text || suggestion.name || '';
    } else {
      searchQuery = String(suggestion);
    }

    if (searchQuery) {
      setQuery(searchQuery);
      onSearch(searchQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsExpanded(true);
    setShowSuggestions(query.length > 0 || recentSearches.length > 0);
  };

  const handleBlur = (e) => {
    // Don't close if clicking on suggestions
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setTimeout(() => {
        setShowSuggestions(false);
        if (!query) {
          setIsExpanded(false);
        }
      }, 150);
    }
  };

  // Normalize suggestions to ensure they're renderable
  const normalizedSuggestions = Array.isArray(suggestions) 
    ? suggestions.map(suggestion => {
        if (typeof suggestion === 'string') {
          return { query: suggestion, type: 'suggestion' };
        } else if (suggestion && typeof suggestion === 'object') {
          return {
            query: suggestion.query || suggestion.text || suggestion.name || String(suggestion),
            type: suggestion.type || 'suggestion'
          };
        } else {
          return { query: String(suggestion), type: 'suggestion' };
        }
      }).filter(item => item.query && item.query.length > 0)
    : [];

  // Normalize recent searches
  const normalizedRecentSearches = Array.isArray(recentSearches)
    ? recentSearches.map(search => {
        if (typeof search === 'string') {
          return { query: search, type: 'recent' };
        } else if (search && typeof search === 'object') {
          return {
            query: search.query || search.text || String(search),
            type: 'recent'
          };
        } else {
          return { query: String(search), type: 'recent' };
        }
      }).filter(item => item.query && item.query.length > 0)
    : [];

  const displaySuggestions = query.length > 0 ? normalizedSuggestions : normalizedRecentSearches;

  return (
    <div className="relative w-full max-w-2xl mx-auto" onBlur={handleBlur}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative overflow-hidden transition-all duration-300 ${
          isExpanded 
            ? 'bg-white dark:bg-gray-800 shadow-2xl border-2 border-blue-500' 
            : 'bg-gray-100 dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700'
        } rounded-2xl`}>
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search className={`h-5 w-5 transition-colors ${
              isExpanded ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={`w-full pl-12 pr-12 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-300 ${
              isExpanded ? 'text-lg' : 'text-base'
            }`}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 ${
            query.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && displaySuggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                {query.length > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Suggestions
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Recent Searches
                  </>
                )}
              </h3>
              
              {!query && recentSearches.length > 0 && onClearRecent && (
                <button
                  onClick={onClearRecent}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Suggestions List */}
            <div className="max-h-64 overflow-y-auto">
              {displaySuggestions.slice(0, 8).map((item, index) => (
                <motion.button
                  key={`${item.type}-${item.query}-${index}`}
                  ref={el => suggestionRefs.current[index] = el}
                  onClick={() => handleSuggestionClick(item.query)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-lg ${
                      item.type === 'recent' 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {item.type === 'recent' ? (
                        <Clock className="h-3 w-3 text-gray-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    
                    <span className="text-gray-900 dark:text-white truncate font-medium">
                      {item.query}
                    </span>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                <Zap className="h-3 w-3 mr-1" />
                Press Enter to search
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
