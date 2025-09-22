import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, TrendingUp, Star, Heart, Bookmark, PlayCircle, 
  Eye, Calendar, Activity, ChevronRight, Globe, Users, Target
} from 'lucide-react';
import { useMovies } from '../../hooks/useMovies';
import MovieGrid from '../ui/MovieGrid';
import Loading from '../common/Loading';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Simple Hero Section
const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Amazing', 'Incredible', 'Stunning', 'Epic', 'Blockbuster'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="text-center py-16 md:py-20">
      {/* Main title with animated word */}
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
          <span>Discover </span>
          <div className="inline-block relative h-20 md:h-24 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                className="absolute top-0 left-0 text-blue-600"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {words[currentWord]}
              </motion.span>
            </AnimatePresence>
          </div>
          <br />
          <span>Movies</span>
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
        Explore trending movies, build your watchlist, and never miss a great film again.
      </p>

      {/* Stats */}
      <div className="flex justify-center items-center space-x-8 mb-12">
        {[
          { icon: Globe, label: 'Global', value: '50K+' },
          { icon: Users, label: 'Users', value: '1M+' },
          { icon: Target, label: 'Accuracy', value: '99%' }
        ].map((stat, i) => (
          <div key={i} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <stat.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{stat.label}: {stat.value}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <button className="flex items-center space-x-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg transition-colors">
          <PlayCircle className="h-5 w-5" />
          <span>Start Watching</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        
        <button className="flex items-center space-x-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Eye className="h-5 w-5" />
          <span>Browse Collection</span>
        </button>
      </div>
    </section>
  );
};

// Section Header
const SectionHeader = ({ title, subtitle, icon: Icon, gradient }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center space-x-4">
      <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      <Activity className="h-4 w-4" />
      <span>Live Updates</span>
    </div>
  </div>
);

// Enhanced Stats Card
const StatsCard = ({ title, value, icon: Icon, bgColor, description }) => (
  <div className={`${bgColor} rounded-2xl shadow-lg p-8 text-center text-white transform hover:scale-105 transition-transform duration-300`}>
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-white/20 rounded-xl">
        <Icon className="h-8 w-8" />
      </div>
    </div>
    
    <div className="text-4xl font-bold mb-2">
      {value}
    </div>
    
    <h3 className="text-xl font-semibold mb-2">
      {title}
    </h3>
    
    <p className="text-white/80 text-sm">
      {description}
    </p>
  </div>
);

// Simple Error State
const ErrorState = ({ error, retry }) => (
  <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
      <Film className="h-8 w-8 text-red-500" />
    </div>
    
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Oops! Something went wrong
    </h3>
    
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {error}
    </p>
    
    {retry && (
      <button
        onClick={retry}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-lg transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Featured Movie Card for Hero
const FeaturedMovieCard = ({ movie, onMovieClick }) => (
  <motion.div
    className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
    whileHover={{ scale: 1.02, y: -5 }}
    onClick={() => onMovieClick(movie)}
  >
    <div className="aspect-[16/9] relative">
      {movie.backdrop_path && (
        <>
          <img
            src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      )}
      
      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-white/90 p-4 rounded-full">
          <PlayCircle className="h-8 w-8 text-gray-900" />
        </div>
      </div>
      
      {/* Movie Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{movie.title}</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(movie.release_date).getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Quick Stats Section
const QuickStats = ({ favorites, watchlist, totalMovies, avgRating }) => (
  <section className="py-16">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Your Movie <span className="text-blue-600">Journey</span>
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Track your progress and discover your movie preferences
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Movies Available"
        value={totalMovies}
        icon={Film}
        bgColor="bg-gradient-to-br from-blue-500 to-purple-500"
        description="In our database"
      />
      
      <StatsCard
        title="Your Favorites"
        value={favorites.length}
        icon={Heart}
        bgColor="bg-gradient-to-br from-red-500 to-pink-500"
        description="Movies you've loved"
      />
      
      <StatsCard
        title="Watchlist"
        value={watchlist.length}
        icon={Bookmark}
        bgColor="bg-gradient-to-br from-green-500 to-emerald-500"
        description="To watch later"
      />

      <StatsCard
        title="Avg Rating"
        value={avgRating}
        icon={Star}
        bgColor="bg-gradient-to-br from-yellow-500 to-orange-500"
        description="Collection quality"
      />
    </div>
  </section>
);

// Trending Hero Banner
const TrendingBanner = ({ movies, onMovieClick }) => {
  const [currentMovie, setCurrentMovie] = useState(0);
  const topMovies = movies.slice(0, 5);

  useEffect(() => {
    if (topMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentMovie((prev) => (prev + 1) % topMovies.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [topMovies.length]);

  if (topMovies.length === 0) return null;

  const movie = topMovies[currentMovie];

  return (
    <section className="mb-16">
      <div className="relative h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden">
        {movie?.backdrop_path && (
          <>
            <img
              src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </>
        )}
        
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-2xl px-8 md:px-12">
            <motion.div
              key={currentMovie}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {movie.title}
              </h2>
              <p className="text-lg text-white/90 mb-6 line-clamp-3">
                {movie.overview}
              </p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="text-white">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onMovieClick(movie)}
                className="flex items-center space-x-2 px-8 py-4 bg-white/90 hover:bg-white text-gray-900 font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
              >
                <PlayCircle className="h-5 w-5" />
                <span>Watch Now</span>
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Slide indicators */}
        <div className="absolute bottom-6 right-8 flex space-x-2">
          {topMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMovie(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentMovie ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Home Component
const Home = ({ onMovieClick }) => {
  const { data: trendingMovies = [], loading: trendingLoading, error: trendingError } = useMovies('trending');
  const { data: popularMovies = [], loading: popularLoading, error: popularError } = useMovies('popular');
  
  const [favorites, setFavorites] = useLocalStorage('movieflix_favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage('movieflix_watchlist', []);

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

  const totalMovies = trendingMovies.length + popularMovies.length;
  const avgRating = totalMovies > 0 
    ? (([...trendingMovies, ...popularMovies].reduce((sum, movie) => sum + (movie.vote_average || 0), 0)) / totalMovies).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Trending Banner */}
      {trendingMovies.length > 0 && (
        <TrendingBanner movies={trendingMovies} onMovieClick={onMovieClick} />
      )}

      {/* Quick Stats */}
      <QuickStats 
        favorites={favorites}
        watchlist={watchlist}
        totalMovies={totalMovies}
        avgRating={avgRating}
      />

      {/* Trending Movies Section */}
      <section>
        <SectionHeader
          title="🔥 Trending Now"
          subtitle="Hot movies everyone's talking about"
          icon={TrendingUp}
          gradient="from-red-500 to-orange-500"
        />

        {trendingLoading ? (
          <Loading count={8} showMessage={true} />
        ) : trendingError ? (
          <ErrorState error={`Error loading trending movies: ${trendingError}`} />
        ) : (
          <MovieGrid 
            movies={trendingMovies.slice(0, 12)} 
            favorites={favorites}
            watchlist={watchlist}
            onFavorite={handleAddToFavorites}
            onWatchlist={handleAddToWatchlist}
            onMovieClick={onMovieClick} 
          />
        )}
      </section>

      {/* Popular Movies Section */}
      <section>
        <SectionHeader
          title="⭐ Most Popular"
          subtitle="Top-rated movies you can't miss"
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
        />

        {popularLoading ? (
          <Loading count={8} showMessage={true} />
        ) : popularError ? (
          <ErrorState error={`Error loading popular movies: ${popularError}`} />
        ) : (
          <MovieGrid 
            movies={popularMovies.slice(0, 12)} 
            favorites={favorites}
            watchlist={watchlist}
            onFavorite={handleAddToFavorites}
            onWatchlist={handleAddToWatchlist}
            onMovieClick={onMovieClick}
          />
        )}
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready for Your Next <span className="text-blue-600">Adventure?</span>
          </h3>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Explore our vast collection of movies and create your personalized experience
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => window.location.href = '/search'}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Discover More</span>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/favorites'}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>View Favorites</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
