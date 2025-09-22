import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, Grid, Activity, Target
} from 'lucide-react';
import MovieCard from './MovieCard';

// Simple Loading Skeleton Grid
const MovieGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {/* Poster Skeleton */}
        <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 animate-pulse relative">
          {/* Rating Badge Skeleton */}
          <div className="absolute top-3 left-3 w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
        </div>
        
        {/* Info Skeleton */}
        <div className="p-3 md:p-4 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Simple Empty State
const EmptyGridState = ({ message = "No movies found", subtitle }) => (
  <div className="text-center py-20">
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <Film className="h-12 w-12 text-gray-400" />
    </div>
    
    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
      {message}
    </h3>
    
    {subtitle && (
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

// Grid Stats Component
const GridStats = ({ movieCount, isVisible }) => (
  <AnimatePresence>
    {isVisible && movieCount > 0 && (
      <motion.div
        className="mb-6 md:mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center space-x-3 px-4 md:px-6 py-2 md:py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="p-2 bg-blue-500 rounded-xl">
            <Activity className="h-4 w-4 text-white" />
          </div>
          
          <div className="text-left">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {movieCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              movie{movieCount !== 1 ? 's' : ''} found
            </div>
          </div>
          
          <Grid className="h-5 w-5 text-blue-500" />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main MovieGrid Component
const MovieGrid = ({ 
  movies, 
  favorites = [], 
  watchlist = [], 
  onFavorite, 
  onWatchlist,
  onMovieClick,
  loading = false,
  showStats = true,
  emptyMessage = "No movies found",
  emptySubtitle = "Try adjusting your search or filters"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const gridRef = useRef(null);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Intersection Observer for stats visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, []);

  // Show loading skeleton
  if (loading) {
    return <MovieGridSkeleton count={18} />;
  }

  // Show empty state
  if (!movies || movies.length === 0) {
    return (
      <EmptyGridState 
        message={emptyMessage}
        subtitle={emptySubtitle}
      />
    );
  }

  return (
    <div className="relative" ref={gridRef}>
      {/* Grid Stats */}
      {showStats && (
        <GridStats 
          movieCount={movies.length} 
          isVisible={isVisible}
        />
      )}

      {/* Responsive Movie Grid */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id} 
            variants={itemVariants}
            whileInView={{ 
              opacity: 1,
              transition: { 
                duration: 0.4,
                delay: (index % 12) * 0.03
              }
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <MovieCard 
              movie={movie}
              isFavorite={favorites.some(fav => fav.id === movie.id)}
              isInWatchlist={watchlist.some(item => item.id === movie.id)}
              onFavorite={() => onFavorite(movie)}
              onWatchlist={() => onWatchlist(movie)}
              onClick={onMovieClick}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* End of Results Indicator */}
      {movies.length > 0 && (
        <motion.div
          className="mt-8 md:mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            <Target className="h-4 w-4" />
            <span>End of results</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MovieGrid;
