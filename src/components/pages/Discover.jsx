import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, TrendingUp, Award, Clock, Search, Star, Zap, Film, 
  Globe, Users, Target, X, Grid, SlidersHorizontal
} from 'lucide-react';
import { useMovieDiscovery } from '../../hooks/useMovieDiscovery';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useGenres } from '../../hooks/useGenres';
import MovieGrid from '../ui/MovieGrid';
import Loading from '../common/Loading';

// Simple Header Component
const DiscoveryHeader = () => (
  <div className="text-center mb-12">
    <div className="flex items-center justify-center mb-6">
      <div className="relative">
        <div className="bg-purple-500 p-4 rounded-full shadow-lg">
          <Compass className="h-10 w-10 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full" />
      </div>
    </div>

    <h1 className="text-4xl md:text-6xl font-bold mb-4">
      <span className="text-gray-900 dark:text-white">Discover </span>
      <span className="text-purple-600">Movies</span>
    </h1>

    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
      Find your next favorite movie by exploring different genres and categories
    </p>

    <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center space-x-1">
        <Globe className="h-4 w-4" />
        <span>Global Database</span>
      </div>
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4" />
        <span>AI Powered</span>
      </div>
      <div className="flex items-center space-x-1">
        <Target className="h-4 w-4" />
        <span>Smart Discovery</span>
      </div>
    </div>
  </div>
);

// Enhanced Genre Filter Component
const PerfectGenreFilter = ({ selectedGenres, onGenreChange, totalResults }) => {
  const { genres, loading } = useGenres();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayGenres = showAll ? filteredGenres : filteredGenres.slice(0, 12);

  const handleGenreToggle = (genreId) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    
    onGenreChange(newSelectedGenres);
  };

  const handleClearAll = () => {
    onGenreChange([]);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Grid className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Movie Genres
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select genres to discover movies you'll love
            </p>
          </div>
        </div>

        {/* Results Count */}
        {totalResults > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Film className="h-4 w-4" />
            <span>{totalResults.toLocaleString()} movies</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search genres..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Selected Genres Count */}
      {selectedGenres.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={handleClearAll}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {displayGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          return (
            <motion.button
              key={genre.id}
              onClick={() => handleGenreToggle(genre.id)}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                isSelected
                  ? 'bg-purple-500 text-white border-purple-500 shadow-lg scale-105'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
              whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {genre.name}
              {isSelected && (
                <motion.div
                  className="ml-2 inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {filteredGenres.length > 12 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            {showAll ? 'Show Less' : `Show ${filteredGenres.length - 12} More`}
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredGenres.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No genres found for "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

// Quick Filter Button
const QuickFilterButton = ({ filter, index, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-purple-500 text-white shadow-lg'
        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
    }`}
  >
    {filter.icon}
    <span>{filter.label}</span>
  </button>
);

// Active Filter Tag Component
const ActiveFilterTag = ({ label, onRemove }) => (
  <motion.div
    className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700 rounded-full text-sm transition-all hover:shadow-md"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    whileHover={{ scale: 1.05 }}
  >
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
    >
      <X className="h-3 w-3" />
    </button>
  </motion.div>
);

// Simple Empty State
const EmptyState = ({ onReset }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <Search className="h-12 w-12 text-gray-400" />
    </div>
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      No movies found
    </h3>
    
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
      Try selecting different genres or adjusting your filters to discover amazing movies!
    </p>
    
    <button
      onClick={onReset}
      className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-2xl shadow-lg transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Zap className="h-5 w-5" />
        <span>Reset Filters</span>
      </div>
    </button>
  </div>
);

// Main Discover Component
const Discover = ({ onMovieClick }) => {
  const [favorites, setFavorites] = useLocalStorage('movieflix_favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage('movieflix_watchlist', []);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  
  const {
    movies,
    loading,
    error,
    totalResults,
    updateFilters,
    loadMore,
    resetFilters,
    hasMore,
    genresList = []
  } = useMovieDiscovery();

  const handleGenreChange = (genres) => {
    setSelectedGenres(genres);
    updateFilters({ with_genres: genres.join(',') });
    setActiveQuickFilter(null);
  };

  const handleAddToFavorites = (movie) => {
    const isAlreadyFavorite = favorites.find(fav => fav.id === movie.id);
    if (isAlreadyFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, { ...movie, dateAdded: Date.now() }]);
    }
  };

  const handleAddToWatchlist = (movie) => {
    const isAlreadyInWatchlist = watchlist.find(item => item.id === movie.id);
    if (isAlreadyInWatchlist) {
      setWatchlist(watchlist.filter(item => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, { ...movie, dateAdded: Date.now() }]);
    }
  };

  const handleQuickFilter = (quickFilter, index) => {
    setSelectedGenres([]);
    updateFilters(quickFilter.filters);
    setActiveQuickFilter(index);
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setActiveQuickFilter(null);
    resetFilters();
  };

  // Quick filter options
  const quickFilters = [
    {
      label: 'Popular Now',
      icon: <TrendingUp className="h-4 w-4" />,
      filters: { sortBy: 'popularity.desc' }
    },
    {
      label: 'Highly Rated',
      icon: <Award className="h-4 w-4" />,
      filters: { sortBy: 'vote_average.desc', 'vote_count.gte': 500 }
    },
    {
      label: 'New Releases',
      icon: <Star className="h-4 w-4" />,
      filters: { 
        sortBy: 'primary_release_date.desc',
        'primary_release_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    },
    {
      label: 'Short Films',
      icon: <Clock className="h-4 w-4" />,
      filters: { 'with_runtime.lte': '90' }
    }
  ];

  // Get active filter labels for display
  const getActiveGenreNames = () => {
    return selectedGenres
      .map(genreId => genresList.find(g => g.id === genreId)?.name)
      .filter(Boolean);
  };

  const activeGenreNames = getActiveGenreNames();

  return (
    <div className="space-y-8">
      {/* Header */}
      <DiscoveryHeader />

      {/* Quick Filters */}
      <div className="flex flex-wrap justify-center gap-4">
        {quickFilters.map((quickFilter, index) => (
          <QuickFilterButton
            key={quickFilter.label}
            filter={quickFilter}
            index={index}
            isActive={activeQuickFilter === index}
            onClick={() => handleQuickFilter(quickFilter, index)}
          />
        ))}
      </div>

      {/* Perfect Genre Filter */}
      <PerfectGenreFilter
        selectedGenres={selectedGenres}
        onGenreChange={handleGenreChange}
        totalResults={totalResults}
      />

      {/* Active Filters Display */}
      <AnimatePresence>
        {(activeGenreNames.length > 0 || activeQuickFilter !== null) && (
          <motion.div
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Filters
              </h4>
              <button
                onClick={handleResetFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Genre filters */}
              <AnimatePresence>
                {activeGenreNames.map((genreName, index) => (
                  <ActiveFilterTag
                    key={`genre-${genreName}`}
                    label={genreName}
                    onRemove={() => {
                      const genreId = genresList.find(g => g.name === genreName)?.id;
                      if (genreId) {
                        handleGenreChange(selectedGenres.filter(id => id !== genreId));
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
              
              {/* Quick filter */}
              {activeQuickFilter !== null && (
                <ActiveFilterTag
                  label={quickFilters[activeQuickFilter].label}
                  onRemove={() => setActiveQuickFilter(null)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <div>
        {loading && movies.length === 0 ? (
          <Loading count={12} showMessage={true} />
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error loading movies
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : movies.length === 0 ? (
          <EmptyState onReset={handleResetFilters} />
        ) : (
          <>
            {/* Movie Grid */}
            <MovieGrid
              movies={movies}
              favorites={favorites}
              watchlist={watchlist}
              onFavorite={handleAddToFavorites}
              onWatchlist={handleAddToWatchlist}
              onMovieClick={onMovieClick}
            />

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium rounded-2xl shadow-lg transition-colors disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <>
                        <Film className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Load More Movies</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
