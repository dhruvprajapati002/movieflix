import axios from 'axios';

// API Configuration - you should define these in your constants file
const API_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || 'your-api-key-here'
};

// Common endpoints
const ENDPOINTS = {
  POPULAR: '/movie/popular',
  SEARCH: '/search/movie',
  MOVIE_DETAILS: '/movie',
  GENRES: '/genre/movie/list'
};

// Helper function for image URLs (moved up to avoid circular dependency)
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Enhanced API instance with interceptors
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  params: {
    api_key: API_CONFIG.API_KEY,
  },
  timeout: 10000,
});

// Simple request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Simplified response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = getErrorMessage(error);
    console.error('API Error:', errorMessage, error);
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

// Error message helper
const getErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your internet connection.';
  }
  
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }
  
  const status = error.response.status;
  const statusMessages = {
    401: 'Invalid API key. Please check your configuration.',
    404: 'Requested resource not found.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.'
  };
  
  return statusMessages[status] || `An error occurred (${status})`;
};

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Main TMDB service
export const tmdbService = {
  getTrending: async (timeWindow = 'day') => {
    const cacheKey = `trending_${timeWindow}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await api.get(`/trending/movie/${timeWindow}`);
      setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getPopular: async (page = 1) => {
    const cacheKey = `popular_${page}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await api.get(ENDPOINTS.POPULAR, { params: { page } });
      setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  searchMovies: async (query, page = 1) => {
    if (!query?.trim()) {
      throw new Error('Search query is required');
    }
    
    try {
      return await api.get(ENDPOINTS.SEARCH, { 
        params: { 
          query: query.trim(), 
          page,
          include_adult: false
        } 
      });
    } catch (error) {
      throw error;
    }
  },

  getMovieDetails: async (id) => {
    if (!id) {
      throw new Error('Movie ID is required');
    }

    const cacheKey = `movie_details_${id}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await api.get(`${ENDPOINTS.MOVIE_DETAILS}/${id}`, {
        params: { 
          append_to_response: 'videos,credits,reviews,similar,recommendations'
        }
      });
      
      setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getGenres: async () => {
    const cacheKey = 'genres';
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await api.get(ENDPOINTS.GENRES);
      setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  discoverMovies: async (params = {}) => {
    const defaultParams = {
      sort_by: 'popularity.desc',
      include_adult: false,
      page: 1,
      ...params
    };

    try {
      return await api.get('/discover/movie', { params: defaultParams });
    } catch (error) {
      throw error;
    }
  },

  getMoviesByGenre: async (genreId, page = 1) => {
    if (!genreId) {
      throw new Error('Genre ID is required');
    }

    const params = {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
      include_adult: false
    };

    try {
      return await api.get('/discover/movie', { params });
    } catch (error) {
      throw error;
    }
  },

  getUpcoming: async (page = 1) => {
    try {
      return await api.get('/movie/upcoming', { params: { page } });
    } catch (error) {
      throw error;
    }
  },

  getTopRated: async (page = 1) => {
    const cacheKey = `top_rated_${page}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await api.get('/movie/top_rated', { params: { page } });
      setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getNowPlaying: async (page = 1) => {
    try {
      return await api.get('/movie/now_playing', { params: { page } });
    } catch (error) {
      throw error;
    }
  }
};

// Essential utility functions
export const getYouTubeUrl = (key) => {
  if (!key) return null;
  return `https://www.youtube.com/embed/${key}?autoplay=0&rel=0&modestbranding=1`;
};

export const formatRuntime = (minutes) => {
  if (!minutes || minutes === 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getMovieRating = (voteAverage) => {
  if (!voteAverage) return { rating: 'N/A', color: 'gray' };
  
  const rating = voteAverage.toFixed(1);
  let color = 'gray';
  
  if (voteAverage >= 8) color = 'green';
  else if (voteAverage >= 7) color = 'yellow';
  else if (voteAverage >= 6) color = 'orange';
  else color = 'red';
  
  return { rating, color };
};

export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


// Cache utilities
export const cacheUtils = {
  clear: () => cache.clear(),
  size: () => cache.size
};

export default tmdbService;
