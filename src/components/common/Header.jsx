import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Film, Menu, X, Search, Sparkles,
  Home, Heart, Bookmark, Compass, Bell, Settings, User
} from 'lucide-react';
// Import REAL React Router hooks and components
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Real theme context with localStorage
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newTheme);
      return newTheme;
    });
  }, []);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return { isDark, toggleTheme };
};

// Premium Logo Component - Fixed Navigation
const PremiumLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      to="/" 
      className="flex items-center group focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-xl p-2 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-3 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0, ease: "linear" }}
        />
        
        {/* Logo container */}
        <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg border border-white/10">
          <Film className="h-7 w-7 text-white" />
          
          {/* Premium badge */}
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            ★
          </motion.div>
        </div>
      </motion.div>
      
      {/* Text content */}
      <div className="ml-3">
        <motion.h1 
          className="text-2xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent"
          animate={{
            backgroundPosition: isHovered ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%"
          }}
          transition={{ duration: 3, repeat: isHovered ? Infinity : 0 }}
          style={{ backgroundSize: '200% 200%' }}
        >
          MovieFlix
        </motion.h1>
        
        <motion.div
          className="flex items-center space-x-1.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent font-bold tracking-wide">
            PREMIUM
          </span>
          <Sparkles className="w-3 h-3 text-red-500" />
        </motion.div>
      </div>
    </Link>
  );
};

// Fixed Navigation Item with Real Router Link
const NavItem = ({ item, isActive, isMobile = false, index = 0 }) => {
  const icons = {
    '/': Home,
    '/discover': Compass,
    '/favorites': Heart,
    '/watchlist': Bookmark,
  };
  
  const Icon = icons[item.path] || Film;
  
  return (
    <Link 
      to={item.path} 
      className="group relative focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-lg block"
    >
      <motion.div
        className={`relative flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 overflow-hidden ${
          isMobile 
            ? `w-full ${isActive 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
              }`
            : `${isActive 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`
        }`}
        whileHover={{ scale: isMobile ? 1.02 : 1.03 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.05,
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {/* Background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        />
        
        {/* Icon */}
        <motion.div
          className={`p-1.5 rounded-md transition-all duration-300 ${
            isActive 
              ? 'bg-white/20' 
              : 'group-hover:bg-white/10 dark:group-hover:bg-gray-700/50'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
        
        <span className="relative z-10 text-sm font-medium whitespace-nowrap">
          {item.label}
        </span>
        
        {/* Active dot indicator */}
        {isActive && !isMobile && (
          <motion.div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"
            layoutId="activeIndicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

// Fixed Search Button with Real Navigation
const SearchButton = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Navigate to search page
    navigate('/search');
    
    // Call optional onClick callback
    if (onClick) onClick();
    
    setIsLoading(false);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className="group flex items-center space-x-2.5 px-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={{ 
          rotate: isLoading ? 360 : 0,
          scale: isLoading ? 0.9 : 1
        }}
        transition={{ 
          rotate: { duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" },
          scale: { duration: 0.2 }
        }}
      >
        <Search className="h-4 w-4" />
      </motion.div>
      
      <span className="text-sm font-medium hidden sm:block">
        {isLoading ? 'Opening...' : 'Search'}
      </span>
      
      {/* Keyboard shortcut */}
      <motion.kbd
        className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded text-xs text-gray-500 dark:text-gray-400 border border-gray-300/50 dark:border-gray-600/50 font-mono"
        whileHover={{ scale: 1.05 }}
      >
        <span>⌘K</span>
      </motion.kbd>
    </motion.button>
  );
};

// Theme Toggle Component (unchanged)
const ThemeToggle = ({ isDark, toggleTheme }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-red-500/50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <Sun className="h-5 w-5 text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <Moon className="h-5 w-5 text-blue-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Mobile Menu Button (unchanged)
const MobileMenuButton = ({ isOpen, onClick }) => (
  <motion.button
    onClick={onClick}
    className="md:hidden p-2.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
  >
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="close"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <X className="h-5 w-5" />
        </motion.div>
      ) : (
        <motion.div
          key="menu"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Menu className="h-5 w-5" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

// Fixed Mobile Navigation
const MobileNavigation = ({ navItems, location, onItemClick, onSearch }) => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
    onItemClick(); // Close mobile menu
  };

  return (
    <motion.div
      className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-xl"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4 space-y-3">
        {/* Mobile Search */}
        <motion.button
          onClick={handleSearchClick}
          className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-300 rounded-lg font-medium transition-all duration-300 hover:shadow-md group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="p-2 bg-red-500 rounded-lg text-white">
            <Search className="h-4 w-4" />
          </div>
          <div className="text-left flex-1">
            <span className="block font-semibold">Search Movies</span>
            <span className="text-xs text-red-600/70 dark:text-red-400/70">
              Find your next favorite film
            </span>
          </div>
        </motion.button>

        {/* Navigation Items */}
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onItemClick} // Close menu on item click
          >
            <NavItem
              item={item}
              isActive={location.pathname === item.path}
              isMobile={true}
              index={index}
            />
          </motion.div>
        ))}
        
        {/* Mobile Footer */}
        <motion.div
          className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center space-x-2 py-2">
            <Sparkles className="h-3 w-3 text-red-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Premium Experience
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// MAIN: Fixed Header Component with Real Navigation
const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation(); // Real React Router hook
  const navigate = useNavigate(); // Real React Router hook

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/discover', label: 'Discover' },
    { path: '/favorites', label: 'Favorites' },
    { path: '/watchlist', label: 'Watchlist' },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search'); // Real navigation
      }
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate, mobileMenuOpen]);

  const handleSearchClick = useCallback(() => {
    navigate('/search'); // Real navigation
  }, [navigate]);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <motion.header 
      className="sticky top-0 z-50 relative border-b border-gray-200/20 dark:border-gray-700/20"
      style={{
        backgroundColor: `rgba(${isDark ? '17, 24, 39' : '255, 255, 255'}, 0.95)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PremiumLogo />
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex items-center justify-center flex-1 px-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-1 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              {navItems.map((item, index) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  index={index}
                />
              ))}
            </div>
          </motion.nav>

          {/* Right Actions */}
          <motion.div 
            className="flex items-center space-x-3 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SearchButton onClick={handleSearchClick} />
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <MobileMenuButton 
              isOpen={mobileMenuOpen} 
              onClick={handleMobileMenuToggle} 
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileNavigation
            navItems={navItems}
            location={location}
            onItemClick={handleMobileMenuClose}
            onSearch={handleSearchClick}
          />
        )}
      </AnimatePresence>
      
      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
      />
    </motion.header>
  );
};

export default Header;
