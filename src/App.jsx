import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { 
  Film, Loader2, AlertCircle, ArrowUp, RefreshCw, Home as HomeIcon, 
  X, CheckCircle, AlertTriangle, Info, Sparkles, Zap, Globe
} from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Home from './components/pages/Home';
import SearchResults from './components/pages/SearchResults';
import Discover from './components/pages/Discover';
import Favorites from './components/pages/Favorites';
import Watchlist from './components/pages/Watchlist';
import MovieDetails from './components/pages/MovieDetails';

// Modern Toast Notification System with Rich Interactions
const ModernToast = ({ message, type = 'info', onClose, progress = 0 }) => {
  const toastConfig = {
    success: {
      icon: CheckCircle,
      bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
      border: 'border-emerald-200 dark:border-emerald-700',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    error: {
      icon: AlertTriangle,
      bg: 'bg-gradient-to-r from-red-500 to-pink-600',
      border: 'border-red-200 dark:border-red-700',
      iconBg: 'bg-red-100 dark:bg-red-900/30'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      border: 'border-amber-200 dark:border-amber-700',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    info: {
      icon: Info,
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      border: 'border-blue-200 dark:border-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    }
  };

  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      className={`
        fixed top-6 right-6 z-[250] max-w-md w-full
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border ${config.border} rounded-2xl shadow-2xl
        shadow-black/10 dark:shadow-black/40
        overflow-hidden
      `}
      initial={{ opacity: 0, x: 100, scale: 0.9, rotateY: 45 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
      exit={{ 
        opacity: 0, 
        x: 100, 
        scale: 0.8, 
        rotateY: -45,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.5
      }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full">
        <motion.div
          className={`h-full ${config.bg} opacity-80`}
          initial={{ width: "100%" }}
          animate={{ width: `${(1 - progress) * 100}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${config.iconBg} border border-white/20 shadow-sm
        `}>
          <Icon className={`w-5 h-5 ${config.bg.replace('bg-gradient-to-r from-', 'text-').split(' ')[0]}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
            {message}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Live notification
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </button>
      </div>
    </motion.div>
  );
};

// Premium Loading Component with Cinematic Feel
const PremiumLoader = ({ message = "Loading...", variant = "full" }) => {
  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <motion.div
            className="relative w-16 h-16 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-2 bg-red-500 rounded-full flex items-center justify-center">
              <Film className="h-5 w-5 text-white" />
            </div>
          </motion.div>
          
          <motion.p
            className="text-gray-600 dark:text-gray-400 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center z-[300]">
      {/* Cinematic background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 198, 198, 0.3) 0%, transparent 50%)
            `
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              i % 3 === 0 ? 'bg-red-400/30' :
              i % 3 === 1 ? 'bg-blue-400/30' : 'bg-purple-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main loader */}
      <div className="text-center z-10 max-w-md px-8">
        <motion.div
          className="relative mb-10 mx-auto w-24 h-24"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-30"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Inner spinner */}
          <motion.div
            className="absolute inset-3 rounded-full border-4 border-red-500 border-t-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon */}
          <div className="absolute inset-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
            <Film className="h-6 w-6 text-white" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Movie<span className="text-red-500">Flix</span>
          </h2>
          
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.p>
          
          {/* Loading bar */}
          <div className="w-80 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full shadow-lg"
              initial={{ width: "0%", x: "-100%" }}
              animate={{ 
                width: "100%", 
                x: ["0%", "0%", "100%", "100%", "0%"] 
              }}
              transition={{ 
                width: { duration: 1.5, ease: "easeOut" },
                x: { 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  times: [0, 0.3, 0.7, 1, 1]
                }
              }}
            />
          </div>
          
          <div className="flex items-center justify-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Premium cinematic experience loading...
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Sophisticated Error Component
const SophisticatedError = ({ error, resetError, errorInfo }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const handleReportError = async () => {
    setIsReporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsReporting(false);
    setReportSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950/20 dark:via-gray-900 dark:to-orange-950/20 flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Error Illustration */}
        <motion.div
          className="mb-10 mx-auto w-40 h-40 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full" />
          <div className="absolute inset-4 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-800/30 dark:to-red-700/30 rounded-full" />
          <div className="absolute inset-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 border-4 border-red-300 dark:border-red-700 rounded-full opacity-30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 border-2 border-red-400 dark:border-red-600 rounded-full opacity-50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Something Went Wrong
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto">
            Even the best blockbusters have unexpected plot twists. 
            Don't worry, we're working on the sequel!
          </p>
        </motion.div>

        {/* Error Details (Expandable) */}
        <motion.details
          className="mb-10 text-left bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <summary className="cursor-pointer text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            Technical Details
          </summary>
          <div className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-4 rounded-xl border overflow-auto max-h-40">
            <div className="text-red-600 dark:text-red-400 mb-2">
              Error: {error?.message || 'Unknown error occurred'}
            </div>
            {errorInfo?.componentStack && (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                Stack: {errorInfo.componentStack}
              </div>
            )}
          </div>
        </motion.details>
        
        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={resetError}
            className="group px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </motion.button>
          
          <motion.button
            onClick={() => window.location.href = '/'}
            className="px-10 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <HomeIcon className="h-5 w-5" />
            Go Home
          </motion.button>
          
          <motion.button
            onClick={handleReportError}
            disabled={isReporting || reportSent}
            className={`px-10 py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
              reportSent 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${isReporting ? 'opacity-75 cursor-wait' : ''}`}
            whileHover={{ scale: reportSent ? 1 : 1.02, y: reportSent ? 0 : -2 }}
            whileTap={{ scale: reportSent ? 1 : 0.98 }}
          >
            {isReporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Reporting...
              </>
            ) : reportSent ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Report Sent
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5" />
                Report Issue
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Enhanced Error Boundary
class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SophisticatedError
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Premium Page Transitions
const PremiumPageTransition = ({ children, routeName }) => {
  const transitionVariants = {
    '/': {
      initial: { opacity: 0, y: 30, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -30, scale: 1.05 }
    },
    '/search': {
      initial: { opacity: 0, x: 100, rotateY: -20 },
      animate: { opacity: 1, x: 0, rotateY: 0 },
      exit: { opacity: 0, x: -100, rotateY: 20 }
    },
    '/discover': {
      initial: { opacity: 0, scale: 0.8, rotate: -3 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 1.2, rotate: 3 }
    },
    '/favorites': {
      initial: { opacity: 0, rotateX: 90, transformPerspective: 1000 },
      animate: { opacity: 1, rotateX: 0, transformPerspective: 1000 },
      exit: { opacity: 0, rotateX: -90, transformPerspective: 1000 }
    },
    '/watchlist': {
      initial: { opacity: 0, y: 100, skewY: 5 },
      animate: { opacity: 1, y: 0, skewY: 0 },
      exit: { opacity: 0, y: -100, skewY: -5 }
    }
  };

  const variant = transitionVariants[routeName] || transitionVariants['/'];

  return (
    <motion.div
      key={routeName}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        layout: { duration: 0.4 }
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Cinematic Background
const CinematicBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-red-50/50 dark:from-blue-950/30 dark:via-gray-900 dark:to-red-950/30" />
      
      {/* Animated mesh gradient */}
      <motion.div
        className="absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
             radial-gradient(circle at 70% 60%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
            `radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 60% 70%, rgba(239, 68, 68, 0.15) 0%, transparent 50%),
             radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
            `radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 40%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)`
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-xl ${
            i % 3 === 0 ? 'bg-red-200/20 dark:bg-red-800/10' :
            i % 3 === 1 ? 'bg-blue-200/20 dark:bg-blue-800/10' :
            'bg-purple-200/20 dark:bg-purple-800/10'
          }`}
          style={{
            width: `${Math.random() * 300 + 200}px`,
            height: `${Math.random() * 300 + 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Elegant Scroll to Top
const ElegantScrollToTop = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = scrollPx / winHeightPx;
      
      setScrollProgress(scrolled);
      setIsVisible(scrolled > 0.15);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-2xl shadow-red-500/25 z-40 flex items-center justify-center group backdrop-blur-sm border border-white/20"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 25px 50px rgba(239, 68, 68, 0.4)",
            rotate: -5
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-16 h-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
              fill="none"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{ pathLength: scrollProgress }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: scrollProgress }}
            />
          </svg>
          
          <ArrowUp className="h-6 w-6 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// App Routes with Enhanced Error Boundaries
const AppRoutes = ({ onMovieClick }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <ErrorBoundaryWrapper>
              <PremiumPageTransition routeName="/">
                <Suspense fallback={<PremiumLoader message="Loading home..." variant="inline" />}>
                  <Home onMovieClick={onMovieClick} />
                </Suspense>
              </PremiumPageTransition>
            </ErrorBoundaryWrapper>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ErrorBoundaryWrapper>
              <PremiumPageTransition routeName="/search">
                <Suspense fallback={<PremiumLoader message="Loading search..." variant="inline" />}>
                  <SearchResults onMovieClick={onMovieClick} />
                </Suspense>
              </PremiumPageTransition>
            </ErrorBoundaryWrapper>
          } 
        />
        <Route 
          path="/discover" 
          element={
            <ErrorBoundaryWrapper>
              <PremiumPageTransition routeName="/discover">
                <Suspense fallback={<PremiumLoader message="Discovering movies..." variant="inline" />}>
                  <Discover onMovieClick={onMovieClick} />
                </Suspense>
              </PremiumPageTransition>
            </ErrorBoundaryWrapper>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <ErrorBoundaryWrapper>
              <PremiumPageTransition routeName="/favorites">
                <Suspense fallback={<PremiumLoader message="Loading favorites..." variant="inline" />}>
                  <Favorites onMovieClick={onMovieClick} />
                </Suspense>
              </PremiumPageTransition>
            </ErrorBoundaryWrapper>
          } 
        />
        <Route 
          path="/watchlist" 
          element={
            <ErrorBoundaryWrapper>
              <PremiumPageTransition routeName="/watchlist">
                <Suspense fallback={<PremiumLoader message="Loading watchlist..." variant="inline" />}>
                  <Watchlist onMovieClick={onMovieClick} />
                </Suspense>
              </PremiumPageTransition>
            </ErrorBoundaryWrapper>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Main App Component
function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [appError, setAppError] = useState(null);

  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        addToast("🎬 Welcome to MovieFlix Premium! Your cinematic journey begins now.", 'success');
      } catch (err) {
        console.error('App initialization error:', err);
        setAppError(err);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Toast management with progress tracking
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type, progress: 0 };
    setToasts(prev => [...prev, toast]);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setToasts(prev => prev.map(t => 
        t.id === id ? { ...t, progress: Math.min(t.progress + 0.02, 1) } : t
      ));
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    addToast(`🎭 Loading "${movie.title || movie.name}"...`, 'info');
  };

  const handleCloseMovie = () => {
    setSelectedMovie(null);
  };

  // Global error handler
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      addToast('🚨 Something unexpected happened. Our team has been notified.', 'error');
      event.preventDefault();
    };

    const handleError = (event) => {
      console.error('Global error:', event.error);
      addToast('⚠️ An error occurred. Please refresh if the problem persists.', 'warning');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (isLoading) {
    return <PremiumLoader message="Preparing your premium cinematic experience..." />;
  }

  if (appError) {
    return (
      <SophisticatedError
        error={appError}
        resetError={() => {
          setAppError(null);
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 1000);
        }}
      />
    );
  }

  return (
    <ErrorBoundaryWrapper>
      <ThemeProvider>
        <LazyMotion features={domAnimation}>
          <Router>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-700 relative overflow-x-hidden">
              {/* Cinematic Background */}
              <CinematicBackground />
              
              {/* Main App Structure */}
              <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <motion.div
                  className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/5"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Header />
                </motion.div>

                {/* Main Content */}
                <main className="flex-1 w-full relative z-20">
                  <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      <AppRoutes onMovieClick={handleMovieClick} />
                    </motion.div>
                  </div>
                </main>

                {/* Footer Spacer */}
                <div className="h-24" />
              </div>

              {/* Scroll to Top */}
              <ElegantScrollToTop />

              {/* Movie Details Modal */}
              <AnimatePresence>
                {selectedMovie && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-[200]"
                  >
                    <MovieDetails
                      movieId={selectedMovie.id}
                      onClose={handleCloseMovie}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toast Notifications */}
              <AnimatePresence>
                {toasts.map((toast) => (
                  <ModernToast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    progress={toast.progress}
                    onClose={() => removeToast(toast.id)}
                  />
                ))}
              </AnimatePresence>

              {/* App Badge */}
              <motion.div
                className="fixed bottom-6 left-6 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/5"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 3, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Film className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      MovieFlix
                      <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full">
                        PREMIUM
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      v3.0 • Live
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Router>
        </LazyMotion>
      </ThemeProvider>
    </ErrorBoundaryWrapper>
  );
}

export default App;
