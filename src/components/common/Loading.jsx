import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Loader2, RefreshCw } from 'lucide-react';

// Simple Skeleton Card
const SkeletonCard = ({ index }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
    {/* Poster skeleton */}
    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
    </div>
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
      </div>
      
      {/* Metadata */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
      </div>
    </div>
  </div>
);

// Professional Loading Messages
const LoadingMessage = () => {
  const messages = [
    "Loading movies...",
    "Fetching content...", 
    "Please wait...",
    "Almost ready..."
  ];
  
  const [currentMessage, setCurrentMessage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [messages.length]);
  
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <Film className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin absolute -top-1 -right-1" />
        </div>
      </div>
      
      <motion.p
        key={currentMessage}
        className="text-gray-600 dark:text-gray-400 font-medium"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {messages[currentMessage]}
      </motion.p>
    </div>
  );
};

// Error State Component
const ErrorState = ({ onRetry, error }) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Film className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Unable to load content
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error || "Something went wrong while loading. Please try again."}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  </div>
);

// Main Loading Component
const Loading = ({ 
  count = 12, 
  showMessage = true, 
  className = '',
  onRetry = null,
  error = null,
  timeout = 15000
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  // Handle loading timeout
  useEffect(() => {
    if (!timeout) return;
    
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
  // Show error state
  if (error || hasTimedOut) {
    return (
      <ErrorState 
        onRetry={onRetry} 
        error={error || "Loading is taking longer than expected"} 
      />
    );
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Loading message */}
      {showMessage && <LoadingMessage />}
      
      {/* Skeleton grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {[...Array(count)].map((_, index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>
      
      {/* Loading indicator for screen readers */}
      <div className="sr-only" aria-live="polite">
        Loading content, please wait...
      </div>
    </div>
  );
};

// CSS for shimmer animation (add to your global CSS or component)
const shimmerStyles = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('loading-shimmer-styles')) {
  const style = document.createElement('style');
  style.id = 'loading-shimmer-styles';
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}

export default Loading;
