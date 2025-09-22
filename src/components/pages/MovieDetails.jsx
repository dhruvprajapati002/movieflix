import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, Calendar, Clock, DollarSign, Globe, Play, 
  Heart, Bookmark, Share2, ArrowLeft, User, Award, Film,
  Info, TrendingUp, Users
} from 'lucide-react';
import { useMovieDetails } from '../../hooks/useMovieDetails';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { 
  getImageUrl, 
  getYouTubeUrl, 
  formatRuntime, 
  formatCurrency 
} from '../../services/tmdbService';
import Loading from '../common/Loading';
import WhereToWatch from '../ui/WhereToWatch';

// Simple Loading State
const SimpleLoading = () => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4">
      <div className="mb-6">
        <div className="relative">
          <Film className="h-12 w-12 text-blue-500 mx-auto animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Loading Movie Details...
      </h2>
      
      <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
        <div className="h-full bg-blue-500 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// Simple Error State
const SimpleError = ({ error, onClose }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
        <Film className="h-8 w-8 text-red-500" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {error ? 'Error Loading Movie' : 'Movie Not Found'}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {error || 'The movie you\'re looking for could not be found.'}
      </p>
      
      <button
        onClick={onClose}
        className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Go Back</span>
      </button>
    </div>
  </div>
);

// Movie Header Component
const MovieHeader = ({ movie, trailer, onPlayTrailer, onClose, isFavorite, isInWatchlist, onToggleFavorite, onToggleWatchlist }) => (
  <div className="relative">
    {/* Backdrop */}
    <div className="h-[50vh] md:h-[60vh] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
      {movie.backdrop_path && (
        <>
          <img
            src={getImageUrl(movie.backdrop_path, 'w1280')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </>
      )}
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Play Trailer Button */}
      {trailer && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={onPlayTrailer}
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full shadow-2xl transition-colors border-4 border-white/20"
          >
            <Play className="h-12 w-12 ml-1 fill-current" />
          </button>
          
          <p className="text-center text-white font-medium mt-4 text-lg">
            Watch Trailer
          </p>
        </div>
      )}
    </div>

    {/* Movie Info Overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Poster */}
        <div className="w-48 h-72 bg-gray-300 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white/20">
          {movie.poster_path && (
            <img
              src={getImageUrl(movie.poster_path, 'w342')}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Movie Details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              {movie.title}
              {movie.release_date && (
                <span className="text-xl md:text-2xl font-normal text-gray-300 ml-3">
                  ({new Date(movie.release_date).getFullYear()})
                </span>
              )}
            </h1>

            {movie.tagline && (
              <p className="text-lg text-gray-200 italic mb-6">
                "{movie.tagline}"
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
            <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-2" />
              <span className="font-semibold">{movie.vote_average?.toFixed(1)}/10</span>
            </div>
            
            <div className="flex items-center bg-blue-500/20 px-3 py-1 rounded-full">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}</span>
            </div>
            
            <div className="flex items-center bg-green-500/20 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatRuntime(movie.runtime)}</span>
            </div>

            <div className="flex items-center bg-purple-500/20 px-3 py-1 rounded-full">
              <Users className="h-4 w-4 mr-2" />
              <span>{movie.vote_count?.toLocaleString()} votes</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-3">
            {movie.genres?.map((genre) => (
              <span
                key={genre.id}
                className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/20"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={onToggleFavorite}
              className={`flex items-center px-6 py-3 rounded-2xl font-medium transition-colors border border-white/20 ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>
            
            <button
              onClick={onToggleWatchlist}
              className={`flex items-center px-6 py-3 rounded-2xl font-medium transition-colors border border-white/20 ${
                isInWatchlist
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className={`h-5 w-5 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
              <span>{isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: movie.title,
                    text: movie.overview,
                    url: window.location.href,
                  });
                }
              }}
              className="flex items-center px-6 py-3 bg-white/10 text-white hover:bg-white/20 rounded-2xl font-medium transition-colors border border-white/20"
            >
              <Share2 className="h-5 w-5 mr-2" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tab Navigation Component
const TabNavigation = ({ tabs, activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
    <div className="flex space-x-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-4 font-medium transition-colors rounded-t-2xl ${
              isActive
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="h-5 w-5 mr-2" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, bgColor }) => (
  <div className={`${bgColor} rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center`}>
    <div className="flex items-center justify-center mb-4">
      <div className="p-3 bg-white/20 rounded-xl">
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    
    <div className="text-2xl font-bold text-white mb-1">
      {value}
    </div>
    
    <div className="text-sm text-white/80 font-medium">
      {title}
    </div>
  </div>
);

// Trailer Modal Component
const TrailerModal = ({ trailer, movie, onClose }) => (
  <div
    className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-6xl aspect-video mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={getYouTubeUrl(trailer.key)}
          title={`${movie.title} Trailer`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Movie title overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-bold">
            {movie.title} - Official Trailer
          </h3>
        </div>
      </div>
    </div>
  </div>
);

// Main MovieDetails Component
const MovieDetails = ({ movieId, onClose }) => {
  const { movie, loading, error } = useMovieDetails(movieId);
  const [favorites, setFavorites] = useLocalStorage('movieflix_favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage('movieflix_watchlist', []);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!movieId) return null;

  if (loading) {
    return <SimpleLoading />;
  }

  if (error || !movie) {
    return <SimpleError error={error} onClose={onClose} />;
  }

  const isFavorite = favorites.some(fav => fav.id === movie.id);
  const isInWatchlist = watchlist.some(item => item.id === movie.id);
  const trailer = movie.videos?.results?.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );
  const mainCast = movie.credits?.cast?.slice(0, 12) || [];
  const director = movie.credits?.crew?.find(person => person.job === 'Director');
  const similarMovies = movie.similar?.results?.slice(0, 8) || [];

  const handleToggleFavorite = () => {
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, { ...movie, dateAdded: Date.now() }]);
    }
  };

  const handleToggleWatchlist = () => {
    if (isInWatchlist) {
      setWatchlist(watchlist.filter(item => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, { ...movie, dateAdded: Date.now() }]);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Film },
    { id: 'cast', label: 'Cast & Crew', icon: User },
    { id: 'reviews', label: 'Reviews', icon: Award },
    { id: 'watch', label: 'Where to Watch', icon: Play },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl max-w-7xl mx-auto my-8">
          {/* Header */}
          <MovieHeader
            movie={movie}
            trailer={trailer}
            onPlayTrailer={() => setShowTrailer(true)}
            onClose={onClose}
            isFavorite={isFavorite}
            isInWatchlist={isInWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onToggleWatchlist={handleToggleWatchlist}
          />

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Tab Navigation */}
            <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Plot Summary */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Info className="h-6 w-6 mr-3 text-blue-500" />
                      Plot Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {movie.overview || 'No plot summary available.'}
                    </p>
                  </div>

                  {/* Movie Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatsCard
                      title="Budget"
                      value={formatCurrency(movie.budget)}
                      icon={DollarSign}
                      bgColor="bg-green-500"
                    />
                    <StatsCard
                      title="Revenue"
                      value={formatCurrency(movie.revenue)}
                      icon={TrendingUp}
                      bgColor="bg-blue-500"
                    />
                    <StatsCard
                      title="Votes"
                      value={movie.vote_count?.toLocaleString()}
                      icon={Star}
                      bgColor="bg-yellow-500"
                    />
                    <StatsCard
                      title="Popularity"
                      value={movie.popularity?.toFixed(0)}
                      icon={Film}
                      bgColor="bg-purple-500"
                    />
                  </div>

                  {/* Director & Production */}
                  {(director || movie.production_companies?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-8">
                      {director && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-purple-500" />
                            Director
                          </h3>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              {director.profile_path ? (
                                <img
                                  src={getImageUrl(director.profile_path, 'w92')}
                                  alt={director.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{director.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Director</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {movie.production_companies?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Globe className="h-5 w-5 mr-2 text-green-500" />
                            Production Companies
                          </h3>
                          <div className="space-y-3">
                            {movie.production_companies.slice(0, 4).map((company) => (
                              <div key={company.id} className="flex items-center space-x-3">
                                {company.logo_path && (
                                  <div className="w-8 h-8">
                                    <img
                                      src={getImageUrl(company.logo_path, 'w92')}
                                      alt={company.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                  {company.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'cast' && (
                <motion.div
                  key="cast"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {mainCast.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {mainCast.map((actor) => (
                        <div 
                          key={actor.id} 
                          className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {actor.profile_path ? (
                              <img
                                src={getImageUrl(actor.profile_path, 'w185')}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                            {actor.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {actor.character}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl">No cast information available.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {movie.reviews?.results?.length > 0 ? (
                    <div className="space-y-6">
                      {movie.reviews.results.slice(0, 3).map((review) => (
                        <div 
                          key={review.id} 
                          className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  {review.author}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {review.author_details?.rating && (
                              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                  {review.author_details.rating}/10
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {review.content.length > 400 
                              ? `${review.content.substring(0, 400)}...` 
                              : review.content
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl">No reviews available yet.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'watch' && (
                <motion.div
                  key="watch"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <WhereToWatch movie={movie} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Film className="h-6 w-6 mr-3 text-purple-500" />
                Similar Movies
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {similarMovies.map((similarMovie) => (
                  <div 
                    key={similarMovie.id} 
                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                      {similarMovie.poster_path && (
                        <img
                          src={getImageUrl(similarMovie.poster_path)}
                          alt={similarMovie.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                        {similarMovie.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {similarMovie.vote_average?.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(similarMovie.release_date).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <TrailerModal
            trailer={trailer}
            movie={movie}
            onClose={() => setShowTrailer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetails;
