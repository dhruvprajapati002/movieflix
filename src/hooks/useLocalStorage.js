import { useState, useEffect, useCallback } from 'react';

// Simple storage utilities
const isStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Main localStorage hook
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    syncAcrossTabs = false
  } = options;

  // Get initial value
  const getStoredValue = useCallback(() => {
    if (typeof window === 'undefined' || !isStorageAvailable()) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Update localStorage when state changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs (if enabled)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn('Error syncing localStorage:', error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
};

// Simple persisted state hook (with cross-tab sync)
export const usePersistedState = (key, initialValue) => {
  return useLocalStorage(key, initialValue, { syncAcrossTabs: true });
};

// Hook for managing multiple localStorage items
export const useStorageManager = () => {
  const [storageSize, setStorageSize] = useState(0);

  const getStorageSize = useCallback(() => {
    if (!isStorageAvailable()) return 0;
    
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }, []);

  const clearAll = useCallback(() => {
    if (isStorageAvailable()) {
      localStorage.clear();
      setStorageSize(0);
    }
  }, []);

  const refreshSize = useCallback(() => {
    setStorageSize(getStorageSize());
  }, [getStorageSize]);

  useEffect(() => {
    refreshSize();
  }, [refreshSize]);

  return {
    storageSize,
    refreshSize,
    clearAll,
    isAvailable: isStorageAvailable()
  };
};

export default useLocalStorage;
