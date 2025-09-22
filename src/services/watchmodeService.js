import axios from 'axios';

const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

// Simplified axios instance
const watchmodeApi = axios.create({
  baseURL: WATCHMODE_BASE_URL,
  timeout: 10000,
  params: {
    apikey: WATCHMODE_API_KEY
  }
});

// Simplified streaming services (major ones only)
const STREAMING_SERVICES = {
  // Major subscription services
  'netflix': { name: 'Netflix', color: '#E50914', icon: '🎬', type: 'subscription', priority: 10 },
  'amazon-prime': { name: 'Amazon Prime Video', color: '#00A8E1', icon: '📦', type: 'subscription', priority: 9 },
  'disney-plus': { name: 'Disney+', color: '#113CCF', icon: '🏰', type: 'subscription', priority: 8 },
  'hulu': { name: 'Hulu', color: '#1CE783', icon: '📺', type: 'subscription', priority: 7 },
  'apple-tv-plus': { name: 'Apple TV+', color: '#000000', icon: '🍎', type: 'subscription', priority: 6 },
  'hbo-max': { name: 'HBO Max', color: '#B82FD1', icon: '👑', type: 'subscription', priority: 8 },
  'paramount-plus': { name: 'Paramount+', color: '#0068FF', icon: '⭐', type: 'subscription', priority: 5 },
  
  // Rental/Purchase services
  'amazon-video': { name: 'Amazon Video', color: '#FF9900', icon: '📦', type: 'rent', priority: 10 },
  'apple-itunes': { name: 'Apple iTunes', color: '#000000', icon: '🍎', type: 'rent', priority: 9 },
  'google-play': { name: 'Google Play Movies', color: '#4285F4', icon: '🔍', type: 'rent', priority: 8 },
  'vudu': { name: 'Vudu', color: '#3399FF', icon: '🎥', type: 'rent', priority: 7 },
  
  // Free services
  'tubi': { name: 'Tubi', color: '#FA541C', icon: '📺', type: 'free', priority: 10 },
  'crackle': { name: 'Crackle', color: '#F6A623', icon: '⚡', type: 'free', priority: 8 },
  'pluto-tv': { name: 'Pluto TV', color: '#00D4AA', icon: '🚀', type: 'free', priority: 6 }
};

// Simple cache
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const getCachedResult = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedResult = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const watchmodeService = {
  async getStreamingAvailability(movie) {
    if (!movie?.id) {
      console.warn('Movie object or ID missing');
      return this.getSimulatedData(movie);
    }

    const cacheKey = `streaming_${movie.id}`;
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;

    if (!WATCHMODE_API_KEY) {
      console.warn('Watchmode API key not found, using simulation');
      const result = await this.getSimulatedData(movie);
      setCachedResult(cacheKey, result);
      return result;
    }

    try {
      const result = await this.fetchStreamingData(movie);
      setCachedResult(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Watchmode API error:', error);
      return await this.getSimulatedData(movie);
    }
  },

  async fetchStreamingData(movie) {
    let watchmodeId = null;

    // Search by title
    try {
      const response = await watchmodeApi.get('/search/', {
        params: {
          search_field: 'name',
          search_value: movie.title,
          search_type: 'movie'
        }
      });

      if (response.data.title_results?.length > 0) {
        const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
        
        let bestMatch = response.data.title_results[0];
        
        // Try to match by year if available
        if (movieYear) {
          const yearMatch = response.data.title_results.find(result => 
            Math.abs(result.year - movieYear) <= 1
          );
          if (yearMatch) bestMatch = yearMatch;
        }
        
        watchmodeId = bestMatch.id;
      }
    } catch (error) {
      console.warn('Title search failed:', error.message);
    }

    if (!watchmodeId) {
      throw new Error(`Movie not found: ${movie.title}`);
    }

    // Get streaming sources
    const sourcesResponse = await watchmodeApi.get(`/title/${watchmodeId}/sources/`, {
      params: {
        regions: 'US',
        source_types: 'sub,free,buy,rent'
      }
    });

    return this.formatStreamingData(sourcesResponse.data, movie);
  },

  formatStreamingData(apiData, movie) {
    const subscriptions = [];
    const rentals = [];
    const free = [];

    if (!Array.isArray(apiData)) {
      return { subscriptions, rentals, free };
    }

    apiData.forEach(source => {
      const service = this.getServiceConfig(source);
      if (!service) return;

      const streamingOption = {
        service,
        price: this.parsePrice(source.price),
        url: source.web_url || this.generateSearchUrl(service.name, movie.title),
        type: this.mapSourceType(source.type)
      };

      switch (streamingOption.type) {
        case 'subscription':
          subscriptions.push(streamingOption);
          break;
        case 'rent':
        case 'buy':
          rentals.push({
            ...streamingOption,
            rentPrice: streamingOption.price ? `$${streamingOption.price}` : null
          });
          break;
        case 'free':
          free.push(streamingOption);
          break;
      }
    });

    return { subscriptions, rentals, free };
  },

  getServiceConfig(source) {
    if (!source?.name) return null;

    const sourceName = source.name.toLowerCase().trim();
    
    // Simple name matching
    for (const [key, config] of Object.entries(STREAMING_SERVICES)) {
      if (config.name.toLowerCase().includes(sourceName) || 
          sourceName.includes(key.replace('-', ' '))) {
        return config;
      }
    }

    // Return basic config for unknown services
    return {
      name: source.name,
      color: '#666666',
      icon: '🎬',
      type: this.mapSourceType(source.type),
      priority: 1
    };
  },

  parsePrice(price) {
    if (!price) return null;
    if (typeof price === 'string') {
      const match = price.match(/\d+\.?\d*/);
      return match ? parseFloat(match[0]) : null;
    }
    return typeof price === 'number' ? price : null;
  },

  mapSourceType(watchmodeType) {
    const typeMapping = {
      'sub': 'subscription',
      'subscription': 'subscription',
      'buy': 'buy',
      'rent': 'rent',
      'free': 'free',
      'ads': 'free'
    };
    return typeMapping[watchmodeType?.toLowerCase()] || 'subscription';
  },

  // Simplified simulation for fallback
  async getSimulatedData(movie) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!movie) {
      return { subscriptions: [], rentals: [], free: [] };
    }

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 2020;
    const rating = movie.vote_average || 6.0;
    const isRecent = year >= new Date().getFullYear() - 2;
    const isPopular = rating >= 7.0;

    const subscriptions = [];
    const rentals = [];
    const free = [];

    // Add some realistic subscriptions based on movie characteristics
    if (isPopular) {
      subscriptions.push(this.createStreamingOption('netflix', movie));
    }
    
    if (isRecent) {
      subscriptions.push(this.createStreamingOption('amazon-prime', movie));
    }

    if (movie.title?.toLowerCase().includes('disney') || 
        movie.genres?.some(g => g.name === 'Family' || g.name === 'Animation')) {
      subscriptions.push(this.createStreamingOption('disney-plus', movie));
    }

    // Always include major rental services
    const rentalServices = ['amazon-video', 'apple-itunes', 'google-play', 'vudu'];
    rentalServices.forEach(serviceId => {
      const basePrice = 3.99 + (isRecent ? 2 : 0);
      rentals.push({
        service: STREAMING_SERVICES[serviceId],
        rentPrice: `$${basePrice.toFixed(2)}`,
        url: this.generateSearchUrl(STREAMING_SERVICES[serviceId].name, movie.title),
        type: 'rent'
      });
    });

    // Free options for older content
    if (year < 2020 || rating < 7.0) {
      free.push(this.createStreamingOption('tubi', movie));
    }

    return { subscriptions, rentals, free };
  },

  createStreamingOption(serviceId, movie, type = null) {
    const service = STREAMING_SERVICES[serviceId];
    if (!service) return null;

    return {
      service,
      type: type || service.type,
      url: this.generateSearchUrl(service.name, movie.title)
    };
  },

  generateSearchUrl(serviceName, movieTitle) {
    if (!movieTitle) return '#';
    
    const encodedTitle = encodeURIComponent(movieTitle.trim());
    const lowerServiceName = serviceName.toLowerCase();
    
    const searchUrls = {
      'netflix': `https://www.netflix.com/search?q=${encodedTitle}`,
      'amazon': `https://www.amazon.com/s?k=${encodedTitle}&i=prime-instant-video`,
      'disney': `https://www.disneyplus.com/search?q=${encodedTitle}`,
      'hulu': `https://www.hulu.com/search?q=${encodedTitle}`,
      'apple': `https://tv.apple.com/search?term=${encodedTitle}`,
      'google': `https://play.google.com/store/search?q=${encodedTitle}&c=movies`,
      'vudu': `https://www.vudu.com/content/search?q=${encodedTitle}`,
      'tubi': `https://tubitv.com/search/${encodedTitle}`,
      'crackle': `https://www.crackle.com/search?q=${encodedTitle}`,
      'pluto': `https://pluto.tv/search?query=${encodedTitle}`
    };

    // Find matching URL
    for (const [key, url] of Object.entries(searchUrls)) {
      if (lowerServiceName.includes(key)) {
        return url;
      }
    }

    // Fallback to Google search
    return `https://www.google.com/search?q="${encodedTitle}"+watch+online`;
  },

  // Utility methods
  isConfigured() {
    return Boolean(WATCHMODE_API_KEY);
  },

  clearCache() {
    cache.clear();
  },

  getSupportedServices() {
    return Object.entries(STREAMING_SERVICES).map(([key, service]) => ({
      id: key,
      ...service
    }));
  }
};

export default watchmodeService;
