import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, ShoppingCart, MapPin, DollarSign, 
  ExternalLink, Star, Ticket, AlertCircle,
  Gift, Sparkles, Wifi, WifiOff, Loader2
} from 'lucide-react';
import { useStreamingData } from '../../hooks/useStreamingData';

// Simple Loading Component
const StreamingLoading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48" />
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      ))}
    </div>
  </div>
);

// Error State Component
const StreamingError = ({ error, onRetry }) => (
  <motion.div 
    className="text-center py-12"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="h-8 w-8 text-red-500" />
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      Unable to Load Streaming Data
    </h3>
    
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {error}
    </p>
    
    <button 
      onClick={onRetry}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg transition-all"
    >
      Try Again
    </button>
  </motion.div>
);

// API Status Badge
const ApiStatusBadge = ({ isConfigured }) => (
  <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium ${
    isConfigured
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  }`}>
    {isConfigured ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
    <span>{isConfigured ? 'Live Data' : 'Demo Mode'}</span>
  </div>
);

// Tab Button Component
const TabButton = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`relative p-4 rounded-xl font-medium transition-all ${
        isActive
          ? 'bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600'
          : 'hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent'
      }`}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={`p-2 rounded-lg ${
          isActive 
            ? `bg-gradient-to-r ${tab.gradient} text-white` 
            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="text-center">
          <div className={`text-sm font-semibold ${
            isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {tab.label}
          </div>
          {tab.count > 0 && (
            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mt-1 ${
              isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Service Card Component
const ServiceCard = ({ service, type = "subscription" }) => {
  const typeConfigs = {
    subscription: {
      gradient: "from-red-600 to-red-700",
      actionText: "Watch Now",
      icon: Play
    },
    rental: {
      gradient: "from-blue-600 to-blue-700",
      actionText: service.rentPrice || "Rent/Buy",
      icon: ShoppingCart
    },
    free: {
      gradient: "from-green-600 to-green-700",
      actionText: "Watch Free",
      icon: Gift
    },
    theater: {
      gradient: "from-purple-600 to-purple-700",
      actionText: "Get Tickets",
      icon: Ticket
    }
  };
  
  const config = typeConfigs[type] || typeConfigs.subscription;
  const ActionIcon = config.icon;
  
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Service Icon */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: service.service.color }}
          >
            {service.service.icon || service.service.name.charAt(0)}
          </div>
          
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              {service.service.name}
            </h4>
            
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="capitalize font-medium">{service.type || type}</span>
              
              {service.quality && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span>{service.quality}</span>
                  </div>
                </>
              )}
              
              {service.rentPrice && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1 font-bold text-blue-600">
                    <DollarSign className="h-3 w-3" />
                    <span>{service.rentPrice}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Theater specific info */}
            {type === 'theater' && service.address && (
              <div className="mt-2 flex items-start space-x-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{service.address}</div>
                  {service.distance && <div>{service.distance}</div>}
                  {service.showtimes && (
                    <div className="mt-1">
                      <span className="text-xs">Showtimes: </span>
                      <span className="text-xs">{service.showtimes.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white rounded-xl font-bold shadow-lg transition-all`}
        >
          <ActionIcon className="h-5 w-5" />
          <span>{config.actionText}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ type, onSwitchTab }) => {
  const configs = {
    subscription: {
      icon: Play,
      title: "Not Available on Subscription",
      subtitle: "Try checking rental options instead",
      switchText: "Check Rentals",
      switchTo: "rent",
      color: "text-red-500"
    },
    rental: {
      icon: ShoppingCart,
      title: "No Rental Options",
      subtitle: "This movie isn't available for rent or purchase",
      switchText: "Check Free Options",
      switchTo: "free",
      color: "text-blue-500"
    },
    free: {
      icon: Gift,
      title: "No Free Options",
      subtitle: "This movie isn't available on free platforms",
      switchText: "Check Subscriptions",
      switchTo: "streaming",
      color: "text-green-500"
    },
    theater: {
      icon: Ticket,
      title: "Not in Theaters",
      subtitle: "This movie isn't currently playing in theaters",
      switchText: "Check Streaming",
      switchTo: "streaming",
      color: "text-purple-500"
    }
  };
  
  const config = configs[type] || configs.subscription;
  const Icon = config.icon;
  
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className={`h-8 w-8 ${config.color}`} />
      </div>
      
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {config.title}
      </h4>
      
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {config.subtitle}
      </p>
      
      <button
        onClick={() => onSwitchTab(config.switchTo)}
        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl shadow-lg transition-all"
      >
        {config.switchText}
      </button>
    </div>
  );
};

// Tab Content Components
const TabContent = ({ data, type, onSwitchTab }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    {data.length === 0 ? (
      <EmptyState type={type} onSwitchTab={onSwitchTab} />
    ) : (
      data.map((item, index) => (
        <ServiceCard
          key={index}
          service={item}
          type={type}
        />
      ))
    )}
  </motion.div>
);

// Main WhereToWatch Component
const WhereToWatch = ({ movie }) => {
  const [activeTab, setActiveTab] = useState('streaming');
  
  const { 
    subscriptions, 
    rentals, 
    free,
    loading, 
    error, 
    retry,
    isConfigured 
  } = useStreamingData(movie, { fetchStreamingData: true });

  const tabs = [
    { 
      id: 'streaming', 
      label: 'Streaming', 
      icon: Play, 
      count: subscriptions.length,
      gradient: 'from-red-500 to-red-600'
    },
    { 
      id: 'rent', 
      label: 'Rent/Buy', 
      icon: ShoppingCart, 
      count: rentals.length,
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'free', 
      label: 'Free', 
      icon: Gift, 
      count: free.length,
      gradient: 'from-green-500 to-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Where to Watch
          </h3>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <StreamingLoading />
      </div>
    );
  }

  if (error) {
    return <StreamingError error={error} onRetry={retry} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Where to Watch
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Find "{movie?.title}" across streaming platforms
          </p>
        </div>
        
        <ApiStatusBadge isConfigured={isConfigured} />
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'streaming' && (
          <TabContent 
            key="streaming"
            data={subscriptions} 
            type="subscription"
            onSwitchTab={setActiveTab}
          />
        )}
        
        {activeTab === 'rent' && (
          <TabContent 
            key="rental"
            data={rentals} 
            type="rental"
            onSwitchTab={setActiveTab}
          />
        )}
        
        {activeTab === 'free' && (
          <TabContent 
            key="free"
            data={free} 
            type="free"
            onSwitchTab={setActiveTab}
          />
        )}
      </AnimatePresence>
      
      {/* Info Footer */}
      {isConfigured && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Live Streaming Data</p>
              <p>Links open directly in streaming apps when available. Data updates in real-time.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhereToWatch;
