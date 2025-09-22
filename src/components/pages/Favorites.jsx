import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Search, Filter, Calendar, Star, Trash2, 
  Download, Share2, SortAsc, SortDesc, Grid, List,
  Sparkles, Award, Clock, Users, TrendingUp, Zap,
  BarChart3, PieChart, Activity, Gift
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MovieGrid from '../ui/MovieGrid';
import MovieList from '../ui/MovieList';

// Floating hearts and cinema particles
const FavoritesParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, 0.6, 0],
          rotate: [0, 360],
          scale: [0.5, 1.2, 0.5],
        }}
        transition={{
          duration: Math.random() * 12 + 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 6,
        }}
      >
        {i % 3 === 0 ? (
          <Heart className="h-3 w-3 text-red-400/30 fill-current" />
        ) : i % 3 === 1 ? (
          <Star className="h-2 w-2 text-yellow-400/30 fill-current" />
        ) : (
          <Sparkles className="h-2 w-2 text-pink-400/30" />
        )}
      </motion.div>
    ))}
  </div>
);

// Enhanced Header Component
const FavoritesHeader = ({ favoritesCount }) => (
  <motion.div 
    className="text-center relative"
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {/* Background glow */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-3xl"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <div className="relative z-10">
      {/* Animated heart icon */}
      <motion.div 
        className="flex items-center justify-center mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.1 }}
          animate={{ 
            y: [-5, 5, -5],
          }}
          transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-50" />
          <div className="relative bg-gradient-to-br from-red-600 to-pink-600 p-4 rounded-full shadow-2xl">
            <Heart className="h-10 w-10 text-white fill-current" />
          </div>
          
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 border-2 border-red-400/40 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-pink-400/40 rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Counter badge */}
          {favoritesCount > 0 && (
            <motion.div
              className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            >
              {favoritesCount}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Title with animated gradient */}
      <motion.h1 
        className="text-5xl md:text-7xl font-bold mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="text-gray-900 dark:text-white">Your </span>
        <motion.span 
          className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-rose-600"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          Favorites
        </motion.span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Your personal collection of beloved movies
      </motion.p>

      {/* Decorative elements */}
      <motion.div
        className="mt-8 flex justify-center items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {[Heart, Star, Award].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          >
            <Icon className="h-6 w-6 text-red-400/60" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.div>
);

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, delay, suffix = '' }) => (
  <motion.div
    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 overflow-hidden transition-all duration-500"
    initial={{ opacity: 0, y: 30, rotateX: -15 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
    style={{ transformStyle: 'preserve-3d' }}
  >
    {/* Background gradient */}
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
    
    {/* Animated background pattern */}
    <motion.div
      className="absolute top-0 right-0 w-32 h-32 opacity-5"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
    
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <motion.div 
          className={`text-4xl font-bold mb-2 text-${color.split('-')[1]}-600`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
        >
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {value}{suffix}
          </motion.span>
        </motion.div>
        <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {title}
        </div>
      </div>
      
      <motion.div
        className={`p-3 bg-gradient-to-br ${color} rounded-xl shadow-lg`}
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="h-8 w-8 text-white" />
      </motion.div>
    </div>
    
    {/* Hover glow effect */}
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`}
    />
  </motion.div>
);

// Enhanced Control Section
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
  onExport,
  totalMovies
}) => (
  <motion.div 
    className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    whileHover={{ shadow: "0 25px 50px rgba(0, 0, 0, 0.1)" }}
  >
    {/* Background pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-pink-50/50 dark:from-red-900/10 dark:via-transparent dark:to-pink-900/10" />
    
    <div className="relative z-10">
      {/* Section header */}
      <motion.div 
        className="flex items-center space-x-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="bg-gradient-to-r from-red-600 to-pink-600 p-2 rounded-xl shadow-lg"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
        >
          <Filter className="h-5 w-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Movie Controls
        </h3>
        <motion.div
          className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />
      </motion.div>

      {/* Search and Controls Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Search Section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <motion.input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your favorites..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              whileFocus={{ scale: 1.02 }}
            />
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all"
          >
            <option value="all">All Movies</option>
            <option value="recent">Recent (2019+)</option>
            <option value="classic">Classic (Pre-2000)</option>
            <option value="highRated">High Rated (7.5+)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all"
          >
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
            <option value="year">Release Year</option>
          </select>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sortOrder === 'asc' ? 
              <SortAsc className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : 
              <SortDesc className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            }
          </motion.button>

          <div className="flex border border-gray-200/50 dark:border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-all ${
                viewMode === 'grid' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-all ${
                viewMode === 'list' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <motion.button
          onClick={onExport}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Collection
        </motion.button>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedMovies.size > 0 && (
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100/50 dark:bg-red-900/30 rounded-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Heart className="h-4 w-4 text-red-600 fill-current" />
                  <span className="text-sm font-medium text-red-600">
                    {selectedMovies.size} selected
                  </span>
                </motion.div>
                
                <motion.button
                  onClick={onSelectAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedMovies.size === totalMovies ? 'Deselect All' : 'Select All'}
                </motion.button>
              </div>
              
              <motion.button
                onClick={onBulkDelete}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Selected
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

// Enhanced Empty State
const EmptyState = () => (
  <motion.div 
    className="text-center py-20"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
  >
    <motion.div
      className="relative mb-8"
      animate={{ 
        y: [-10, 10, -10],
        rotate: [0, 5, -5, 0],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
        <Heart className="h-16 w-16 text-red-400" />
      </div>
      
      {/* Floating hearts around empty state */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${20 + Math.cos(i * 60 * Math.PI / 180) * 80}px`,
            left: `${50 + Math.sin(i * 60 * Math.PI / 180) * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          <Heart className="h-4 w-4 text-red-300 fill-current" />
        </motion.div>
      ))}
    </motion.div>
    
    <motion.h3 
      className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      No favorites yet
    </motion.h3>
    
    <motion.p 
      className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      Start building your personal movie collection by clicking the heart icon on any movie
    </motion.p>
    
    <motion.button
      onClick={() => window.history.back()}
      className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5" />
        <span>Discover Movies</span>
      </div>
    </motion.button>
  </motion.div>
);

// Enhanced Genre Statistics - COMPLETED
const GenreStatistics = ({ genreStats }) => (
  <motion.div 
    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.8 }}
  >
    <div className="flex items-center space-x-3 mb-6">
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl shadow-lg"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.8 }}
      >
        <BarChart3 className="h-5 w-5 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Your Favorite Genres
      </h3>
    </div>
    
    <div className="space-y-4">
      {genreStats.map(([genre, count], index) => (
        <motion.div 
          key={genre} 
          className="group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{genre}</span>
            <div className="flex items-center space-x-2">
              <motion.span
                className="text-sm font-bold text-purple-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                {count}
              </motion.span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                movie{count > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${(count / genreStats[0][1]) * 100}%` }}
                transition={{ 
                  duration: 1.5, 
                  delay: index * 0.1 + 0.5,
                  ease: "easeOut"
                }}
              />
            </div>
            
            {/* Sparkle effect */}
            <motion.div
              className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ x: 0, opacity: 0 }}
              animate={{ 
                x: `${(count / genreStats[0][1]) * 100 * 3}px`,
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                delay: index * 0.1 + 1,
                ease: "easeOut"
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Main Favorites Component - COMPLETED
const Favorites = ({ onMovieClick }) => {
  const [favorites, setFavorites] = useLocalStorage('movieflix_favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage('movieflix_watchlist', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMovies, setSelectedMovies] = useState(new Set());

  // Filter and sort favorites
  const filteredAndSortedFavorites = useMemo(() => {
    let filtered = [...favorites];

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
            return year >= currentYear - 5;
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
        default: // dateAdded
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
  }, [favorites, searchQuery, sortBy, sortOrder, filterBy]);

  // Calculate statistics
  const avgRating = favorites.length > 0 
    ? (favorites.reduce((sum, movie) => sum + (movie.vote_average || 0), 0) / favorites.length).toFixed(1)
    : '0.0';

  const genreStats = useMemo(() => {
    const genreCounts = {};
    favorites.forEach(movie => {
      movie.genres?.forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
    });
    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }, [favorites]);

  const totalRuntime = Math.round(favorites.reduce((sum, movie) => 
    sum + (movie.runtime || 120), 0) / 60);

  // Event handlers
  const handleRemoveFromFavorites = (movie) => {
    setFavorites(favorites.filter(fav => fav.id !== movie.id));
    setSelectedMovies(prev => {
      const newSet = new Set(prev);
      newSet.delete(movie.id);
      return newSet;
    });
  };

  const handleAddToWatchlist = (movie) => {
    const isAlreadyInWatchlist = watchlist.some(item => item.id === movie.id);
    if (isAlreadyInWatchlist) {
      setWatchlist(watchlist.filter(item => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, { ...movie, dateAdded: Date.now() }]);
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
    if (selectedMovies.size === filteredAndSortedFavorites.length) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(filteredAndSortedFavorites.map(movie => movie.id)));
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedMovies);
    setFavorites(favorites.filter(movie => !selectedIds.includes(movie.id)));
    setSelectedMovies(new Set());
  };

  const handleExportFavorites = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `movieflix-favorites-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="relative space-y-12">
      {/* Background particles */}
      <FavoritesParticles />
      
      {/* Header */}
      <FavoritesHeader favoritesCount={favorites.length} />

      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatsCard 
              title="Favorite Movies" 
              value={favorites.length} 
              icon={Heart} 
              color="from-red-500 to-pink-500" 
              delay={0.1}
            />
            <StatsCard 
              title="Average Rating" 
              value={avgRating} 
              icon={Star} 
              color="from-yellow-500 to-orange-500" 
              delay={0.2}
            />
            <StatsCard 
              title="Top Genre" 
              value={genreStats.length > 0 ? genreStats[0][0] : 'None'} 
              icon={Award} 
              color="from-blue-500 to-purple-500" 
              delay={0.3}
            />
            <StatsCard 
              title="Total Runtime" 
              value={totalRuntime} 
              suffix="h"
              icon={Clock} 
              color="from-green-500 to-emerald-500" 
              delay={0.4}
            />
          </motion.div>

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
            onExport={handleExportFavorites}
            totalMovies={filteredAndSortedFavorites.length}
          />

          {/* Results */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {filteredAndSortedFavorites.length === 0 ? (
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
                movies={filteredAndSortedFavorites}
                favorites={favorites}
                watchlist={watchlist}
                onFavorite={handleRemoveFromFavorites}
                onWatchlist={handleAddToWatchlist}
                onMovieClick={onMovieClick}
                selectable={true}
                selectedMovies={selectedMovies}
                onSelectMovie={handleSelectMovie}
              />
            ) : (
              <MovieList
                movies={filteredAndSortedFavorites}
                favorites={favorites}
                watchlist={watchlist}
                onFavorite={handleRemoveFromFavorites}
                onWatchlist={handleAddToWatchlist}
                onMovieClick={onMovieClick}
                selectable={true}
                selectedMovies={selectedMovies}
                onSelectMovie={handleSelectMovie}
              />
            )}
          </motion.div>

          {/* Genre Statistics */}
          {genreStats.length > 0 && (
            <GenreStatistics genreStats={genreStats} />
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
