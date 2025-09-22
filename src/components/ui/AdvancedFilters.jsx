import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, X, Calendar, Star, Clock, 
  ChevronDown, RotateCcw, Search, Filter, TrendingUp
} from 'lucide-react';

// Filter Section Component
const FilterSection = ({ title, icon: Icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-2">
      <div className="p-1 bg-blue-500 rounded-lg">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </label>
    </div>
    {children}
  </div>
);

// Simple Select Component
const StyledSelect = ({ value, onChange, options, placeholder = "Select..." }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white"
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Simple Input Component
const StyledInput = ({ type = "text", value, onChange, placeholder, min, max }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    max={max}
    className="w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400"
  />
);

// Range Section Component
const RangeSection = ({ title, icon: Icon, minValue, maxValue, onMinChange, onMaxChange, minOptions, maxOptions, minPlaceholder, maxPlaceholder, type = "select" }) => (
  <FilterSection title={title} icon={Icon}>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Minimum
        </label>
        {type === "select" ? (
          <StyledSelect
            value={minValue}
            onChange={onMinChange}
            options={minOptions}
            placeholder={minPlaceholder}
          />
        ) : (
          <StyledInput
            type="number"
            value={minValue}
            onChange={onMinChange}
            placeholder={minPlaceholder}
            min="1"
            max="300"
          />
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Maximum
        </label>
        {type === "select" ? (
          <StyledSelect
            value={maxValue}
            onChange={onMaxChange}
            options={maxOptions}
            placeholder={maxPlaceholder}
          />
        ) : (
          <StyledInput
            type="number"
            value={maxValue}
            onChange={onMaxChange}
            placeholder={maxPlaceholder}
            min="1"
            max="300"
          />
        )}
      </div>
    </div>
  </FilterSection>
);

// Main AdvancedFilters Component
const AdvancedFilters = ({ filters, onFiltersChange, onApply, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`
  }));

  const sortOptions = [
    { value: 'popularity.desc', label: '🔥 Most Popular' },
    { value: 'popularity.asc', label: '📉 Least Popular' },
    { value: 'vote_average.desc', label: '⭐ Highest Rated' },
    { value: 'vote_average.asc', label: '⭐ Lowest Rated' },
    { value: 'primary_release_date.desc', label: '🆕 Newest First' },
    { value: 'primary_release_date.asc', label: '📅 Oldest First' },
    { value: 'revenue.desc', label: '💰 Highest Grossing' },
    { value: 'vote_count.desc', label: '👥 Most Voted' },
  ];

  const ratingOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}.0${i === 9 ? '' : '+'}`
  }));

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      sortBy: 'popularity.desc',
      'primary_release_date.gte': '',
      'primary_release_date.lte': '',
      'vote_average.gte': '',
      'vote_average.lte': '',
      'with_runtime.gte': '',
      'with_runtime.lte': '',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  // Count active filters
  const activeFiltersCount = Object.values(localFilters).filter(value => 
    value !== '' && value !== 'popularity.desc'
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-medium transition-all ${
          hasActiveFilters
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span className="hidden md:inline">Advanced Filters</span>
        <span className="md:hidden">Filters</span>
        
        {hasActiveFilters && (
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              className="absolute top-full left-0 w-full md:w-96 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Advanced Filters
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Refine your movie search
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Active filters indicator */}
                {hasActiveFilters && (
                  <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                    {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Filters Content */}
              <div className="p-4 md:p-6 space-y-6 max-h-80 overflow-y-auto">
                {/* Sort By */}
                <FilterSection title="Sort Movies" icon={TrendingUp}>
                  <StyledSelect
                    value={localFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    options={sortOptions}
                  />
                </FilterSection>

                {/* Release Year Range */}
                <RangeSection
                  title="Release Year"
                  icon={Calendar}
                  minValue={localFilters['primary_release_date.gte'] ? new Date(localFilters['primary_release_date.gte']).getFullYear() : ''}
                  maxValue={localFilters['primary_release_date.lte'] ? new Date(localFilters['primary_release_date.lte']).getFullYear() : ''}
                  onMinChange={(e) => handleFilterChange('primary_release_date.gte', e.target.value ? `${e.target.value}-01-01` : '')}
                  onMaxChange={(e) => handleFilterChange('primary_release_date.lte', e.target.value ? `${e.target.value}-12-31` : '')}
                  minOptions={years}
                  maxOptions={years}
                  minPlaceholder="Any year"
                  maxPlaceholder="Any year"
                />

                {/* Rating Range */}
                <RangeSection
                  title="IMDb Rating"
                  icon={Star}
                  minValue={localFilters['vote_average.gte']}
                  maxValue={localFilters['vote_average.lte']}
                  onMinChange={(e) => handleFilterChange('vote_average.gte', e.target.value)}
                  onMaxChange={(e) => handleFilterChange('vote_average.lte', e.target.value)}
                  minOptions={ratingOptions}
                  maxOptions={ratingOptions}
                  minPlaceholder="Any rating"
                  maxPlaceholder="Any rating"
                />

                {/* Runtime Range */}
                <RangeSection
                  title="Runtime (minutes)"
                  icon={Clock}
                  minValue={localFilters['with_runtime.gte']}
                  maxValue={localFilters['with_runtime.lte']}
                  onMinChange={(e) => handleFilterChange('with_runtime.gte', e.target.value)}
                  onMaxChange={(e) => handleFilterChange('with_runtime.lte', e.target.value)}
                  minPlaceholder="60"
                  maxPlaceholder="180"
                  type="input"
                />
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset All</span>
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleApply}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-lg transition-all"
                    >
                      <Search className="h-4 w-4" />
                      <span>Apply Filters</span>
                    </button>
                  </div>
                </div>
                
                {/* Filter summary */}
                {hasActiveFilters && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} will be applied
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;
