import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Intersection Observer API
 * @param {Object} options - Configuration options
 * @param {React.RefObject} options.target - Target element ref
 * @param {Function} options.onIntersect - Callback when intersection occurs
 * @param {boolean} options.enabled - Whether the observer is enabled
 * @param {string} options.rootMargin - Root margin for observer
 * @param {number} options.threshold - Intersection threshold
 * @param {Element} options.root - Root element for intersection
 */
export const useIntersectionObserver = ({
  target,
  onIntersect,
  enabled = true,
  rootMargin = '0px',
  threshold = 0.1,
  root = null
}) => {
  const observerRef = useRef(null);

  const handleIntersect = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && onIntersect) {
        onIntersect(entry);
      }
    });
  }, [onIntersect]);

  useEffect(() => {
    if (!enabled || !target?.current || !onIntersect) {
      return;
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root,
      rootMargin,
      threshold
    });

    // Start observing
    observerRef.current.observe(target.current);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [target, enabled, rootMargin, threshold, root, handleIntersect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return observerRef.current;
};

export default useIntersectionObserver;
