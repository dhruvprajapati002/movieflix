import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, X, ChevronDown, Search, Check, Grid
} from 'lucide-react';
import { useGenres } from '../../hooks/useGenres';

// Simple Loading State
const GenreLoadingSkeleton = () => (
  <div className="space-y-3">
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
    <div className="grid grid-cols-2 gap-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
        />
      ))}
    </div>
  </div>
);

// Popular Genre Button
const PopularGenreButton = ({ genre, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-xl font-medium transition-all ${
      isSelected
        ? 'bg-blue-500 text-white shadow-lg'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
  >
    <span className="text-xl">{genre.icon}</span>
    <span className="font-semibold">{genre.name}</span>
    {isSelected && (
      <div className="ml-auto w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
        <Check className="h-3 w-3" />
      </div>
    )}
  </button>
);

// Genre List Item
const GenreListItem = ({ genre, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
      isSelected
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${
        isSelected ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
      }`} />
      <span className="font-medium">{genre.name}</span>
    </div>
    
    {isSelected && (
      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
        <Check className="h-3 w-3" />
      </div>
    )}
  </button>
);

// Main GenreFilter Component
const GenreFilter = ({ selectedGenres = [], onGenreChange, onApplyFilters }) => {
  const { genres, loading } = useGenres();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Popular genres with simple icons
  const popularGenres = [
    { id: 28, name: 'Action', icon: '💥' },
    { id: 35, name: 'Comedy', icon: '😂' },
    { id: 18, name: 'Drama', icon: '🎭' },
    { id: 27, name: 'Horror', icon: '👻' },
    { id: 10749, name: 'Romance', icon: '💕' },
    { id: 878, name: 'Sci-Fi', icon: '🚀' },
    { id: 53, name: 'Thriller', icon: '⚡' },
    { id: 16, name: 'Animation', icon: '🎨' },
  ].filter(genre => genres.some(g => g.id === genre.id)); // Only show if available

  const handleGenreToggle = (genreId) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    
    onGenreChange(newSelectedGenres);
  };

  const handleClearAll = () => {
    onGenreChange([]);
  };

  const handleApply = () => {
    onApplyFilters();
    setIsOpen(false);
  };

  // Get selected genre names for display
  const getSelectedGenreNames = () => {
    return selectedGenres
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (loading) {
    return <GenreLoadingSkeleton />;
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl font-medium transition-all ${
          selectedGenres.length > 0
            ? 'border-blue-500 text-blue-600 dark:text-blue-400 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            selectedGenres.length > 0 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            <Filter className="h-4 w-4" />
          </div>
          
          <div className="text-left">
            <div className="font-semibold">
              {selectedGenres.length === 0
                ? 'Select Genres'
                : `${selectedGenres.length} Genre${selectedGenres.length > 1 ? 's' : ''}`
              }
            </div>
            {selectedGenres.length > 0 && (
              <div className="text-sm opacity-70">
                {getSelectedGenreNames().join(', ')}
                {selectedGenres.length > 2 && ` +${selectedGenres.length - 2} more`}
              </div>
            )}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Grid className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Movie Genres
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search genres..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Popular Genres */}
              {popularGenres.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Popular Genres
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {popularGenres.map((genre) => (
                      <PopularGenreButton
                        key={genre.id}
                        genre={genre}
                        isSelected={selectedGenres.includes(genre.id)}
                        onClick={() => handleGenreToggle(genre.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Genres */}
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    All Genres
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {filteredGenres.length} available
                  </span>
                </div>
                
                <div className="space-y-1">
                  {filteredGenres.map((genre) => (
                    <GenreListItem
                      key={genre.id}
                      genre={genre}
                      isSelected={selectedGenres.includes(genre.id)}
                      onClick={() => handleGenreToggle(genre.id)}
                    />
                  ))}
                </div>
                
                {filteredGenres.length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No genres found for "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleClearAll}
                    disabled={selectedGenres.length === 0}
                    className="text-sm font-medium text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Clear All ({selectedGenres.length})
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleApply}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-lg transition-all"
                    >
                      Apply Genres
                    </button>
                  </div>
                </div>
                
                {/* Selection summary */}
                {selectedGenres.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected for filtering
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenreFilter;
