import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, Search, Filter, Calendar, Star, Trash2, 
  Clock, SortAsc, SortDesc, Grid, List, Play,
  Eye, CheckCircle, Film, Activity
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MovieGrid from '../ui/MovieGrid';
import MovieList from '../ui/MovieList';

// Simple Header Component
const WatchlistHeader = ({ watchlistCount }) => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center mb-6">
      <div className="relative">
        <div className="bg-blue-500 p-4 rounded-full shadow-lg">
          <Bookmark className="h-10 w-10 text-white fill-current" />
        </div>
        
        {watchlistCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {watchlistCount}
          </div>
        )}
      </div>
    </div>

    <h1 className="text-4xl md:text-6xl font-bold mb-4">
      <span className="text-gray-900 dark:text-white">Your </span>
      <span className="text-blue-600">Watchlist</span>
    </h1>

    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
      Movies saved for your next movie night
    </p>
  </div>
);

// Simple Stats Card Component
const WatchlistStatsCard = ({ title, value, icon: Icon, color, description, suffix = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <div className={`text-3xl font-bold mb-2 ${color}`}>
          {value}{suffix}
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
          {title}
        </div>
        <div className="text-xs text-gray-500">
          {description}
        </div>
      </div>
      
      <div className={`p-3 ${color.replace('text-', 'bg-')} rounded-xl`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
);

// Controls Section Component
const ControlsSection = ({ 
  searchQuery, 
  setSearchQuery, 
  filterBy, 
  setFilterBy,
  sortBy, 
  setSortBy,
  sortOrder, 
  setSortOrder,
  viewMode, 
  setViewMode,
  selectedMovies,
  onSelectAll,
  onBulkDelete,
  onMarkAsWatched,
  totalMovies
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    {/* Section Header */}
    <div className="flex items-center space-x-2 mb-6">
      <Filter className="h-5 w-5 text-blue-500" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Watchlist Controls
      </h3>
    </div>

    {/* Search and Controls */}
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your watchlist..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Movies</option>
          <option value="recent">Recent (2019+)</option>
          <option value="classic">Classic (Pre-2000)</option>
          <option value="highRated">High Rated (7.5+)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
        >
          <option value="dateAdded">Date Added</option>
          <option value="title">Title</option>
          <option value="rating">Rating</option>
          <option value="year">Release Year</option>
        </select>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          {sortOrder === 'asc' ? 
            <SortAsc className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : 
            <SortDesc className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          }
        </button>

        {/* View Mode Toggle */}
        <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Grid View"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="List View"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Activity className="h-4 w-4" />
        <span>Total: {totalMovies}</span>
      </div>
    </div>

    {/* Bulk Actions */}
    <AnimatePresence>
      {selectedMovies.size > 0 && (
        <motion.div 
          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Bookmark className="h-4 w-4 text-blue-600 fill-current" />
                <span className="text-sm font-medium text-blue-600">
                  {selectedMovies.size} selected
                </span>
              </div>
              
              <button
                onClick={onSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {selectedMovies.size === totalMovies ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onMarkAsWatched}
                className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Watched
              </button>
              
              <button
                onClick={onBulkDelete}
                className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Selected
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Empty State Component
const EmptyWatchlistState = () => (
  <div className="text-center py-20">
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <Bookmark className="h-12 w-12 text-gray-400" />
    </div>
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Your Watchlist is Empty
    </h3>
    
    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
      Start planning your movie nights by adding movies to your watchlist
    </p>
    
    <button
      onClick={() => window.history.back()}
      className="flex items-center space-x-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-2xl shadow-lg transition-colors mx-auto"
    >
      <Film className="h-5 w-5" />
      <span>Browse Movies</span>
    </button>
  </div>
);

// Main Watchlist Component
const Watchlist = ({ onMovieClick }) => {
  const [watchlist, setWatchlist] = useLocalStorage('movieflix_watchlist', []);
  const [favorites, setFavorites] = useLocalStorage('movieflix_favorites', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMovies, setSelectedMovies] = useState(new Set());

  // Filter and sort watchlist
  const filteredAndSortedWatchlist = useMemo(() => {
    let filtered = [...watchlist];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.overview?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      const currentYear = new Date().getFullYear();
      switch (filterBy) {
        case 'recent':
          filtered = filtered.filter(movie => {
            const year = new Date(movie.release_date).getFullYear();
            return year >= currentYear - 6; // 2019+
          });
          break;
        case 'classic':
          filtered = filtered.filter(movie => {
            const year = new Date(movie.release_date).getFullYear();
            return year < 2000;
          });
          break;
        case 'highRated':
          filtered = filtered.filter(movie => movie.vote_average >= 7.5);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'rating':
          aValue = a.vote_average || 0;
          bValue = b.vote_average || 0;
          break;
        case 'year':
          aValue = new Date(a.release_date || '1900-01-01').getFullYear();
          bValue = new Date(b.release_date || '1900-01-01').getFullYear();
          break;
        default:
          aValue = a.dateAdded || 0;
          bValue = b.dateAdded || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [watchlist, searchQuery, sortBy, sortOrder, filterBy]);

  // Calculate statistics
  const totalRuntime = watchlist.reduce((sum, movie) => sum + (movie.runtime || 120), 0);
  const avgRating = watchlist.length > 0 
    ? (watchlist.reduce((sum, movie) => sum + (movie.vote_average || 0), 0) / watchlist.length).toFixed(1)
    : '0.0';
  const movieNights = Math.ceil(totalRuntime / 60 / 2.5); // 2.5 hour sessions

  // Event handlers
  const handleRemoveFromWatchlist = (movie) => {
    setWatchlist(watchlist.filter(item => item.id !== movie.id));
    setSelectedMovies(prev => {
      const newSet = new Set(prev);
      newSet.delete(movie.id);
      return newSet;
    });
  };

  const handleAddToFavorites = (movie) => {
    const isAlreadyFavorite = favorites.some(fav => fav.id === movie.id);
    if (isAlreadyFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, { ...movie, dateAdded: Date.now() }]);
    }
  };

  const handleSelectMovie = (movieId) => {
    setSelectedMovies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMovies.size === filteredAndSortedWatchlist.length) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(filteredAndSortedWatchlist.map(movie => movie.id)));
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedMovies);
    setWatchlist(watchlist.filter(movie => !selectedIds.includes(movie.id)));
    setSelectedMovies(new Set());
  };

  const handleMarkAsWatched = () => {
    const selectedIds = Array.from(selectedMovies);
    const watchedMovies = watchlist.filter(movie => selectedIds.includes(movie.id));
    
    // Add to favorites if not already there
    const newFavorites = [...favorites];
    watchedMovies.forEach(movie => {
      if (!favorites.some(fav => fav.id === movie.id)) {
        newFavorites.push({ ...movie, dateAdded: Date.now() });
      }
    });
    setFavorites(newFavorites);
    
    // Remove from watchlist
    setWatchlist(watchlist.filter(movie => !selectedIds.includes(movie.id)));
    setSelectedMovies(new Set());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <WatchlistHeader watchlistCount={watchlist.length} />

      {watchlist.length === 0 ? (
        <EmptyWatchlistState />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <WatchlistStatsCard
              title="Movies to Watch"
              value={watchlist.length}
              icon={Bookmark}
              color="text-blue-600"
              description="Ready for movie night"
            />
            <WatchlistStatsCard
              title="Total Watch Time"
              value={Math.round(totalRuntime / 60)}
              suffix="h"
              icon={Clock}
              color="text-green-600"
              description="Hours of entertainment"
            />
            <WatchlistStatsCard
              title="Average Rating"
              value={avgRating}
              icon={Star}
              color="text-yellow-600"
              description="Quality selection"
            />
            <WatchlistStatsCard
              title="Movie Nights"
              value={movieNights}
              icon={Play}
              color="text-purple-600"
              description="Planned sessions"
            />
          </div>

          {/* Controls */}
          <ControlsSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedMovies={selectedMovies}
            onSelectAll={handleSelectAll}
            onBulkDelete={handleBulkDelete}
            onMarkAsWatched={handleMarkAsWatched}
            totalMovies={filteredAndSortedWatchlist.length}
          />

          {/* Results */}
          <div>
            {filteredAndSortedWatchlist.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No movies match your search
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <MovieGrid
                movies={filteredAndSortedWatchlist}
                favorites={favorites}
                watchlist={watchlist}
                onFavorite={handleAddToFavorites}
                onWatchlist={handleRemoveFromWatchlist}
                onMovieClick={onMovieClick}
              />
            ) : (
              <MovieList
                movies={filteredAndSortedWatchlist}
                favorites={favorites}
                watchlist={watchlist}
                onFavorite={handleAddToFavorites}
                onWatchlist={handleRemoveFromWatchlist}
                onMovieClick={onMovieClick}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Watchlist;
