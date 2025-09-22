import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Calendar, Clock, Heart, Bookmark, ImageIcon, Check, 
  Info, Eye, List as ListIcon
} from 'lucide-react';

// Simple Loading Skeleton
const MovieListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex">
          {/* Poster Skeleton */}
          <div className="w-24 md:w-32 flex-shrink-0">
            <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          
          {/* Content Skeleton */}
          <div className="flex-1 p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
            </div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-14" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Simple Empty State
const EmptyListState = ({ message = "No movies found", subtitle }) => (
  <div className="text-center py-20">
    <div className="w-20 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <ListIcon className="h-10 w-10 text-gray-400" />
    </div>
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {message}
    </h3>
    
    {subtitle && (
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

// Selection Checkbox
const SelectionCheckbox = ({ isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 transition-all ${
      isSelected 
        ? 'bg-blue-500 border-blue-500 text-white' 
        : 'border-white bg-black/30 hover:bg-black/50'
    }`}
  >
    {isSelected && <Check className="h-3 w-3" />}
  </button>
);

// Movie Poster Component
const MoviePoster = ({ movie, onMovieClick, isSelected, selectable, onSelectMovie }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div 
      className="w-24 md:w-32 flex-shrink-0 relative group cursor-pointer"
      onClick={() => onMovieClick && onMovieClick(movie)}
    >
      {selectable && (
        <SelectionCheckbox
          isSelected={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onSelectMovie(movie.id);
          }}
        />
      )}
      
      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden relative">
        {!imageError && posterUrl ? (
          <>
            {!imageLoaded && (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded && !imageError ? 'block' : 'none' }}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-xs text-center px-2 line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}
        
        {/* Simple hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white/90 p-2 rounded-full">
            <Eye className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Rating Badge
const RatingBadge = ({ rating }) => (
  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
    <Star className="h-4 w-4 text-yellow-500 fill-current" />
    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
      {rating ? rating.toFixed(1) : 'N/A'}
    </span>
  </div>
);

// Action Button
const ActionButton = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  title,
  activeClass = "bg-blue-500 text-white",
  inactiveClass = "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
}) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl transition-all hover:scale-105 ${
      isActive ? activeClass : inactiveClass
    }`}
    title={title}
  >
    <Icon className="h-4 w-4" />
  </button>
);

// Genre Pills
const GenrePills = ({ genres, maxVisible = 3 }) => (
  <div className="flex flex-wrap gap-2">
    {genres?.slice(0, maxVisible).map((genre) => (
      <span
        key={genre.id}
        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
      >
        {genre.name}
      </span>
    ))}
    {genres && genres.length > maxVisible && (
      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
        +{genres.length - maxVisible}
      </span>
    )}
  </div>
);

// Status Pills
const StatusPills = ({ isFavorite, isInWatchlist }) => (
  <div className="flex items-center space-x-2">
    {isFavorite && (
      <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
        <Heart className="h-3 w-3 text-red-500 fill-current" />
        <span className="text-xs font-medium text-red-600 dark:text-red-400">Loved</span>
      </div>
    )}
    
    {isInWatchlist && (
      <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
        <Bookmark className="h-3 w-3 text-blue-500 fill-current" />
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Saved</span>
      </div>
    )}
  </div>
);

// Helper function to format runtime
const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Main MovieList Component
const MovieList = ({ 
  movies, 
  favorites = [], 
  watchlist = [], 
  onFavorite, 
  onWatchlist,
  onMovieClick,
  selectable = false,
  selectedMovies = new Set(),
  onSelectMovie,
  loading = false,
  emptyMessage = "No movies found",
  emptySubtitle = "Try adjusting your search or filters"
}) => {
  // Show loading skeleton
  if (loading) {
    return <MovieListSkeleton count={6} />;
  }

  // Show empty state
  if (!movies || movies.length === 0) {
    return (
      <EmptyListState 
        message={emptyMessage}
        subtitle={emptySubtitle}
      />
    );
  }

  return (
    <div className="space-y-4">
      {movies.map((movie, index) => {
        const isFavorite = favorites.some(fav => fav.id === movie.id);
        const isInWatchlist = watchlist.some(item => item.id === movie.id);
        const isSelected = selectedMovies.has(movie.id);

        return (
          <motion.div
            key={movie.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border transition-all duration-300 ${
              isSelected 
                ? 'border-blue-500 ring-2 ring-blue-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex">
              {/* Movie Poster */}
              <MoviePoster
                movie={movie}
                onMovieClick={onMovieClick}
                isSelected={isSelected}
                selectable={selectable}
                onSelectMovie={onSelectMovie}
              />

              {/* Movie Content */}
              <div className="flex-1 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between h-full">
                  <div className="flex-1 space-y-4">
                    {/* Title */}
                    <h3 
                      className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      onClick={() => onMovieClick && onMovieClick(movie)}
                    >
                      {movie.title}
                      {movie.release_date && (
                        <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-2">
                          ({new Date(movie.release_date).getFullYear()})
                        </span>
                      )}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {movie.overview || 'No description available for this movie.'}
                    </p>

                    {/* Movie Meta */}
                    <div className="flex flex-wrap items-center gap-4">
                      <RatingBadge rating={movie.vote_average} />
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}</span>
                      </div>
                      
                      {movie.runtime && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{formatRuntime(movie.runtime)}</span>
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    {movie.genres && movie.genres.length > 0 && (
                      <GenrePills genres={movie.genres} maxVisible={4} />
                    )}
                    
                    {/* Status Pills */}
                    <StatusPills 
                      isFavorite={isFavorite}
                      isInWatchlist={isInWatchlist}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-6 lg:mt-0 lg:ml-6">
                    <ActionButton
                      icon={Info}
                      isActive={false}
                      onClick={() => onMovieClick && onMovieClick(movie)}
                      title="View Details"
                      inactiveClass="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                    />
                    
                    <ActionButton
                      icon={Heart}
                      isActive={isFavorite}
                      onClick={() => onFavorite(movie)}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      activeClass="bg-red-500 text-white"
                      inactiveClass="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 hover:text-red-600"
                    />
                    
                    <ActionButton
                      icon={Bookmark}
                      isActive={isInWatchlist}
                      onClick={() => onWatchlist(movie)}
                      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      activeClass="bg-blue-500 text-white"
                      inactiveClass="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default MovieList;
