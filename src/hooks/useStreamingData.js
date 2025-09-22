import { useState, useEffect, useCallback, useRef } from 'react';
import { watchmodeService } from '../services/watchmodeService';

// Simple cache for streaming data
const streamingCache = new Map();
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

const getCachedData = (movieId) => {
  const cached = streamingCache.get(movieId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  streamingCache.delete(movieId);
  return null;
};

const setCachedData = (movieId, data) => {
  streamingCache.set(movieId, { data, timestamp: Date.now() });
};

export const useStreamingData = (movie, options = {}) => {
  const {
    enableRetry = true,
    maxRetries = 2,
    retryDelay = 1000
  } = options;

  const [streamingData, setStreamingData] = useState({
    subscriptions: [],
    rentals: [],
    free: [],
    loading: true,
    error: null,
    retryCount: 0,
    lastUpdated: null
  });

  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  // Fetch streaming data with retry logic
  const fetchStreamingData = useCallback(async (movieData, retryCount = 0) => {
    if (!movieData?.id) return;

    // Check cache first
    const cached = getCachedData(movieData.id);
    if (cached && retryCount === 0) {
      setStreamingData(prev => ({
        ...prev,
        ...cached,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));
      return;
    }

    // Create new abort controller
    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      setStreamingData(prev => ({ 
        ...prev, 
        loading: true, 
        error: retryCount > 0 ? prev.error : null,
        retryCount
      }));

      const result = await watchmodeService.getStreamingAvailability(movieData);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const finalData = {
        subscriptions: result.subscriptions || [],
        rentals: result.rentals || [],
        free: result.free || [],
        loading: false,
        error: null,
        retryCount,
        lastUpdated: new Date()
      };

      // Cache the result
      setCachedData(movieData.id, finalData);
      setStreamingData(prev => ({ ...prev, ...finalData }));

    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('Error fetching streaming data:', error);
      
      // Retry logic
      if (enableRetry && retryCount < maxRetries) {
        console.log(`Retrying streaming data fetch (attempt ${retryCount + 1}/${maxRetries})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchStreamingData(movieData, retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount));
        
        return;
      }

      // Final error state
      setStreamingData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load streaming information',
        retryCount
      }));
    }
  }, [enableRetry, maxRetries, retryDelay, cleanup]);

  // Manual retry function
  const retry = useCallback(() => {
    if (movie) {
      fetchStreamingData(movie, 0);
    }
  }, [movie, fetchStreamingData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (movie?.id) {
      streamingCache.delete(movie.id);
    }
  }, [movie?.id]);

  // Refresh data function
  const refresh = useCallback(() => {
    clearCache();
    retry();
  }, [clearCache, retry]);

  // Main effect
  useEffect(() => {
    if (movie?.id) {
      fetchStreamingData(movie);
    } else {
      // Reset state when no movie
      setStreamingData({
        subscriptions: [],
        rentals: [],
        free: [],
        loading: false,
        error: null,
        retryCount: 0,
        lastUpdated: null
      });
    }

    return cleanup;
  }, [movie?.id, fetchStreamingData, cleanup]);

  // Return data with utility functions
  return {
    ...streamingData,
    retry,
    refresh,
    clearCache,
    isStale: streamingData.lastUpdated ? 
      Date.now() - streamingData.lastUpdated.getTime() > CACHE_DURATION : false,
    hasData: streamingData.subscriptions.length > 0 || 
             streamingData.rentals.length > 0 || 
             streamingData.free.length > 0,
    isConfigured: watchmodeService.isConfigured()
  };
};

// Simple theater data hook
export const useTheaterData = (movie) => {
  const [theaterData, setTheaterData] = useState({
    theaters: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!movie?.id) {
      setTheaterData({ theaters: [], loading: false, error: null });
      return;
    }

    const fetchTheaterData = async () => {
      try {
        setTheaterData(prev => ({ ...prev, loading: true, error: null }));

        // Simple theater simulation
        const theaters = await simulateTheaterData(movie);
        
        setTheaterData({
          theaters,
          loading: false,
          error: null
        });
      } catch (error) {
        setTheaterData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchTheaterData();
  }, [movie?.id]);

  return theaterData;
};

// Simplified theater simulation
const simulateTheaterData = async (movie) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const currentYear = new Date().getFullYear();
  const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  
  // Only show theaters for recent movies
  if (!movieYear || movieYear < currentYear - 1) {
    return [];
  }

  const baseTheaters = [
    {
      id: 'amc_1',
      chain: 'AMC',
      name: 'AMC Theater 24',
      address: '123 Cinema Boulevard, Downtown',
      distance: '2.1 miles',
      phone: '(555) 123-4567',
      ticketPrice: '$12.99',
      amenities: ['IMAX', 'Dolby Digital', 'Reclining Seats'],
      showtimes: ['2:00 PM', '5:30 PM', '8:15 PM', '10:45 PM'],
      bookingUrl: `https://www.fandango.com/search/${encodeURIComponent(movie.title)}`
    },
    {
      id: 'regal_1',
      chain: 'Regal',
      name: 'Regal Cinemas Downtown',
      address: '456 Movie Street, City Center',
      distance: '3.5 miles',
      phone: '(555) 234-5678',
      ticketPrice: '$11.50',
      amenities: ['Dolby Atmos', 'Premium Seating'],
      showtimes: ['1:45 PM', '4:30 PM', '7:15 PM', '10:00 PM'],
      bookingUrl: `https://www.fandango.com/search/${encodeURIComponent(movie.title)}`
    },
    {
      id: 'cinemark_1',
      chain: 'Cinemark',
      name: 'Cinemark XD',
      address: '789 Entertainment Ave, Mall Plaza',
      distance: '4.2 miles',
      phone: '(555) 345-6789',
      ticketPrice: '$14.75',
      amenities: ['XD Premium', 'Luxury Loungers'],
      showtimes: ['12:30 PM', '3:45 PM', '6:30 PM', '9:45 PM'],
      bookingUrl: `https://www.fandango.com/search/${encodeURIComponent(movie.title)}`
    }
  ];

  return baseTheaters;
};

// Simple preferences hook
export const useStreamingPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('streamingPreferences');
      return saved ? JSON.parse(saved) : {
        preferredServices: [],
        maxRentalPrice: 10,
        showFreeOnly: false
      };
    } catch {
      return {
        preferredServices: [],
        maxRentalPrice: 10,
        showFreeOnly: false
      };
    }
  });

  const updatePreferences = useCallback((newPreferences) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    try {
      localStorage.setItem('streamingPreferences', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save streaming preferences:', error);
    }
  }, [preferences]);

  return { preferences, updatePreferences };
};

// Cache utilities
export const streamingCacheUtils = {
  clear: () => streamingCache.clear(),
  size: () => streamingCache.size,
  has: (movieId) => streamingCache.has(movieId)
};

export default useStreamingData;
