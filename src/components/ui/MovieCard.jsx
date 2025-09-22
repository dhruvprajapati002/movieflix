import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Heart, Bookmark, Calendar, ImageIcon, Info, Eye, Play, 
  TrendingUp, Clock, Award, Zap, Sparkles
} from 'lucide-react';

// Ultra-Modern Rating Badge with Enhanced Design
const ModernRatingBadge = ({ rating }) => (
  <motion.div
    className="absolute top-4 left-4 z-10"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
  >
    <div className="bg-black/90 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
      <div className="flex items-center space-x-2">
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
        <span className="font-bold text-sm">
          {rating ? rating.toFixed(1) : 'N/A'}
        </span>
        <motion.div
          className="w-1 h-1 bg-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  </motion.div>
);

// Premium Action Button with Enhanced Animations
const PremiumActionButton = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  title, 
  activeColor = "from-red-500 to-red-600",
  hoverColor = "from-blue-500 to-blue-600",
  size = "large"
}) => {
  const sizeClasses = {
    small: "p-3 w-12 h-12",
    large: "p-4 w-14 h-14"
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-2xl backdrop-blur-2xl border transition-all duration-300 relative overflow-hidden group ${
        isActive 
          ? `bg-gradient-to-br ${activeColor} text-white border-white/30 shadow-2xl` 
          : `bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-300 border-white/50 shadow-xl hover:shadow-2xl`
      }`}
      title={title}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
    >
      {/* Hover Background Animation */}
      {!isActive && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${hoverColor} rounded-2xl opacity-0 group-hover:opacity-100`}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      <Icon className="h-6 w-6 relative z-10 group-hover:text-white transition-colors" />
      
      {/* Active Pulse Effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

// Enhanced Image Fallback with Modern Design
const ModernImageFallback = ({ title }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900">
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 opacity-20">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 border border-gray-400/30 rounded-full"
          style={{
            left: `${20 + (i % 3) * 30}%`,
            top: `${30 + Math.floor(i / 3) * 40}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5
          }}
        />
      ))}
    </div>
    
    <div className="flex flex-col items-center justify-center h-full p-8">
      <motion.div
        className="mb-6 p-6 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-3xl shadow-2xl"
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <ImageIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
      </motion.div>
      
      <p className="text-base font-semibold text-gray-600 dark:text-gray-400 text-center line-clamp-3 leading-relaxed">
        {title}
      </p>
      
      <motion.div
        className="mt-4 px-4 py-2 bg-gray-400/20 rounded-full"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          No Image Available
        </span>
      </motion.div>
    </div>
  </div>
);

// Premium Movie Info Section with Better Spacing
const PremiumMovieInfo = ({ title, overview, releaseDate, rating, isFavorite, isInWatchlist }) => (
  <div className="p-6 space-y-5">
    {/* Enhanced Title */}
    <div className="space-y-2">
      <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight">
        {title}
      </h3>
      
      {/* Quality Badge */}
      <div className="flex items-center space-x-2">
        <div className="px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 dark:border-green-700/50 rounded-xl">
          <span className="text-xs font-bold text-green-700 dark:text-green-400">HD</span>
        </div>
        {rating >= 7 && (
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-200/50 dark:border-yellow-700/50 rounded-xl">
            <div className="flex items-center space-x-1">
              <Award className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">Popular</span>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Enhanced Description */}
    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium">
      {overview || 'Experience an incredible journey with this amazing movie. Discover stories that will captivate your imagination and leave you wanting more.'}
    </p>
    
    {/* Enhanced Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
      <div className="flex items-center space-x-4">
        {/* Release Year */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {releaseDate ? new Date(releaseDate).getFullYear() : 'TBA'}
          </span>
        </div>
        
        {/* Runtime Indicator */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
            2h 15m
          </span>
        </div>
      </div>
      
      {/* Enhanced Status Indicators */}
      <div className="flex items-center space-x-3">
        {isFavorite && (
          <motion.div
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-700/50 rounded-xl shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Loved</span>
          </motion.div>
        )}
        
        {isInWatchlist && (
          <motion.div
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <Bookmark className="h-4 w-4 text-blue-500 fill-current" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Saved</span>
          </motion.div>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Hover Overlay with Centered Preview
const ModernHoverOverlay = ({ 
  isHovered, 
  onDetailsClick, 
  onFavoriteClick, 
  onWatchlistClick, 
  isFavorite, 
  isInWatchlist 
}) => (
  <AnimatePresence>
    {isHovered && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Centered Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Play/Details Button - Main Action */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onDetailsClick();
              }}
              className="p-5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Watch Trailer"
            >
              <Play className="h-7 w-7 fill-current" />
            </motion.button>
            
            {/* Secondary Actions */}
            <div className="flex flex-col space-y-3">
              <PremiumActionButton
                icon={Heart}
                isActive={isFavorite}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteClick();
                }}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                activeColor="from-red-500 to-pink-600"
                hoverColor="from-red-400 to-pink-500"
                size="small"
              />
              
              <PremiumActionButton
                icon={Bookmark}
                isActive={isInWatchlist}
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchlistClick();
                }}
                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                activeColor="from-blue-500 to-indigo-600"
                hoverColor="from-blue-400 to-indigo-500"
                size="small"
              />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Click Hint */}
        <motion.div
          className="absolute bottom-4 left-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-black/90 backdrop-blur-xl text-white text-center py-3 px-4 rounded-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center space-x-3">
              <Eye className="h-5 w-5" />
              <span className="font-bold">Click for Details</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main Ultra-Modern MovieCard Component
const MovieCard = ({ 
  movie, 
  isFavorite = false, 
  isInWatchlist = false, 
  onFavorite, 
  onWatchlist,
  onClick,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { title, poster_path, vote_average, release_date, overview } = movie;

  const posterUrl = poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : null;

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  return (
    <motion.div
      className="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer transition-all duration-500"
      whileHover={{ scale: 1.03, y: -8, rotateY: 2 }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Enhanced Poster Section */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        {!imageError && posterUrl ? (
          <>
            {/* Enhanced Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
            
            {/* Enhanced Movie Image */}
            <motion.img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ 
                display: imageLoaded && !imageError ? 'block' : 'none',
                filter: isHovered ? 'brightness(0.8) contrast(1.1)' : 'brightness(1)'
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
          </>
        ) : (
          <ModernImageFallback title={title} />
        )}
        
        {/* Enhanced Rating Badge */}
        <ModernRatingBadge rating={vote_average} />

        {/* Trending Badge */}
        {vote_average >= 8 && (
          <motion.div
            className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-2xl shadow-2xl border border-white/20"
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold">Trending</span>
            </div>
          </motion.div>
        )}

        {/* Modern Hover Overlay */}
        <ModernHoverOverlay
          isHovered={isHovered}
          onDetailsClick={handleCardClick}
          onFavoriteClick={onFavorite}
          onWatchlistClick={onWatchlist}
          isFavorite={isFavorite}
          isInWatchlist={isInWatchlist}
        />
      </div>

      {/* Enhanced Movie Info */}
      <PremiumMovieInfo
        title={title}
        overview={overview}
        releaseDate={release_date}
        rating={vote_average}
        isFavorite={isFavorite}
        isInWatchlist={isInWatchlist}
      />

      {/* Card Glow Effect */}
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 -z-10"
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};

export default MovieCard;
