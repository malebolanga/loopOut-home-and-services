import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MapIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  UserIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { FaCar } from "react-icons/fa";

// --- Constants ---
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENTLY_VIEWED = 12;
const DATA_FETCH_LIMIT = 8;
const AI_RECOMMENDATION_LIMIT = 6;
const USER_PREFERENCE_KEY = 'userPreferences';
const API_TIMEOUT = 3000;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// --- Mock Data (Preserved) ---
const MOCK_PROPERTIES = [
  { _id: 'prop-1', name: 'Modern Apartment in City Center', price: 2500, regularPrice: 2500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5, address: 'Johannesburg' },
  { _id: 'prop-2', name: 'Luxury Villa with Pool', price: 8500000, regularPrice: 8500000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Cape Town' },
  { _id: 'prop-3', name: 'Cozy Studio near University', price: 1200, regularPrice: 1200, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.3, address: 'Pretoria' },
  { _id: 'prop-4', name: 'Modern Office Space', price: 500, regularPrice: 500, type: 'office', imageUrls: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6, address: 'Sandton' },
  { _id: 'prop-5', name: 'Family House in Suburbs', price: 3500, regularPrice: 3500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7, address: 'Durban' },
  { _id: 'prop-6', name: 'Vacation Beach House', price: 1800, regularPrice: 1800, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9, address: 'Port Elizabeth' },
  { _id: 'prop-7', name: 'Commercial Land Plot', price: 250000, regularPrice: 250000, type: 'land', imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.4, address: 'Bloemfontein' },
  { _id: 'prop-8', name: 'Penthouse with View', price: 12000000, regularPrice: 12000000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Johannesburg' }
];

const MOCK_SERVICES = [
  { _id: 'serv-1', name: 'Professional Cleaning Service', price: 200, regularPrice: 200, description: 'Deep cleaning service for your home or office', imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7 },
  { _id: 'serv-2', name: 'Moving & Relocation Assistance', price: 350, regularPrice: 350, description: 'Help with packing and moving to your new home', imageUrls: ['https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8 },
  { _id: 'serv-3', name: 'Landscaping & Garden Design', price: 450, regularPrice: 450, description: 'Garden maintenance and landscape design services', imageUrls: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6 },
  { _id: 'serv-4', name: 'Home Repair & Maintenance', price: 300, regularPrice: 300, description: 'Professional home repair and maintenance services', imageUrls: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9 },
  { _id: 'serv-5', name: 'Car Wash & Detailing', price: 150, regularPrice: 150, description: 'Professional car washing and detailing services', imageUrls: ['https://images.unsplash.com/photo-1565689221354-d87f85d4aee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5 }
];

const MOCK_HELPERS = [
  { _id: 'help-1', name: 'John Doe', type: 'Math Tutor', rating: 4.8, price: 120, regularPrice: 120, imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-2', name: 'Jane Smith', type: 'Elderly Caregiver', rating: 4.9, price: 150, regularPrice: 150, imageUrls: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-3', name: 'Mike Johnson', type: 'Certified Handyman', rating: 4.7, price: 200, regularPrice: 200, imageUrls: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-4', name: 'Sarah Wilson', type: 'Professional Cleaner', rating: 4.6, price: 180, regularPrice: 180, imageUrls: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-5', name: 'David Brown', type: 'IT Support Specialist', rating: 4.8, price: 250, regularPrice: 250, imageUrls: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-6', name: 'Emily Davis', type: 'Personal Trainer', rating: 4.9, price: 300, regularPrice: 300, imageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] }
];

const MOCK_EVENTS = [
  { _id: 'ev-1', name: 'Local Music Festival 2024', price: 50, regularPrice: 50, date: '2024-03-15', address: 'City Park, Johannesburg', attendingCount: 120, imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-2', name: 'Art & Craft Workshop', price: 30, regularPrice: 30, date: '2024-03-20', address: 'Art Center, Cape Town', attendingCount: 45, imageUrls: ['https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-3', name: 'Food & Wine Tasting Experience', price: 75, regularPrice: 75, date: '2024-03-25', address: 'Downtown Square, Durban', attendingCount: 89, imageUrls: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-4', name: 'Tech Startup Conference', price: 100, regularPrice: 100, date: '2024-04-05', address: 'Convention Center, Pretoria', attendingCount: 210, imageUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] }
];

// --- AI Recommendation Engine (Preserved) ---
class AIRecommendationEngine {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
  }
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_KEY);
      return stored ? JSON.parse(stored) : {
        viewedCategories: [],
        likedItems: [],
        priceRange: { min: 0, max: 10000 },
        preferredLocations: [],
        interests: [],
        searchHistory: []
      };
    } catch (error) {
      return { viewedCategories: [], likedItems: [], priceRange: { min: 0, max: 10000 }, preferredLocations: [], interests: [], searchHistory: [] };
    }
  }
  saveUserPreferences() {
    try { localStorage.setItem(USER_PREFERENCE_KEY, JSON.stringify(this.userPreferences)); } catch (error) { console.error('Failed to save user preferences:', error); }
  }
  updatePreferences(item, action) {
    switch (action) {
      case 'view': this.userPreferences.viewedCategories.push(item.type || item.category); break;
      case 'like': this.userPreferences.likedItems.push(item._id); break;
      case 'search': this.userPreferences.searchHistory.push(item); break;
    }
    this.saveUserPreferences();
  }
  smartFilterItems(items, userContext = {}) {
    if (!items.length) return items;
    const scores = items.map(item => ({ item, score: this.calculateRelevanceScore(item, userContext) }));
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, AI_RECOMMENDATION_LIMIT).map(s => s.item);
  }
  calculateRelevanceScore(item, userContext) {
    let score = 0;
    const preferences = this.userPreferences;
    if (item.price) {
      const price = Number(item.price) || Number(item.regularPrice) || 0;
      const { min, max } = preferences.priceRange;
      if (price >= min && price <= max) score += 30;
      else score -= Math.abs(price - (min + max) / 2) / 100;
    }
    if (item.address && preferences.preferredLocations.length > 0) {
      const locationMatch = preferences.preferredLocations.some(loc => item.address.toLowerCase().includes(loc.toLowerCase()));
      if (locationMatch) score += 25;
    }
    const itemCategory = item.type || item.category;
    if (preferences.viewedCategories.includes(itemCategory)) score += 20;
    if (preferences.likedItems.includes(item._id)) score += 15;
    if (item.createdAt) {
      const daysOld = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 10 * (1 - daysOld / 7);
    }
    if (item.rating && item.rating >= 4.5) score += 5;
    return Math.max(0, score);
  }
  analyzeTrends(items) {
    const trends = { popularCategories: {}, priceTrends: {}, locationDistribution: {} };
    items.forEach(item => {
      const category = item.type || item.category || 'general';
      trends.popularCategories[category] = (trends.popularCategories[category] || 0) + 1;
      if (item.address) {
        const location = item.address.split(',')[0]?.trim();
        if (location) trends.locationDistribution[location] = (trends.locationDistribution[location] || 0) + 1;
      }
      if (item.price) {
        const priceRange = Math.floor(item.price / 1000) * 1000;
        trends.priceTrends[priceRange] = (trends.priceTrends[priceRange] || 0) + 1;
      }
    });
    return trends;
  }
  generatePersonalizedRecommendations(items, userContext) {
    const filtered = this.smartFilterItems(items, userContext);
    const trends = this.analyzeTrends(items);
    return { recommendations: filtered, insights: this.generateInsights(trends), suggestedCategories: this.suggestCategories(trends) };
  }
  generateInsights(trends) {
    const insights = [];
    const mostPopularCategory = Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1])[0];
    if (mostPopularCategory) insights.push({ type: 'popular', text: `${mostPopularCategory[0]} properties are trending in your area`, icon: '🔥' });
    const priceRanges = Object.keys(trends.priceTrends).map(Number);
    if (priceRanges.length > 0) {
      const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;
      insights.push({ type: 'price', text: `Average price in your area: R${Math.round(avgPrice).toLocaleString()}`, icon: '💰' });
    }
    return insights;
  }
  suggestCategories(trends) {
    return Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category]) => category);
  }
}

// --- Airbnb-Style Components ---

const AirbnbCard = ({ item, onClick, isLiked, onLike, type = 'property' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isGuestFavorite = item.rating >= 4.8;
  
  // Function to determine price suffix based on item type
  const getPriceSuffix = () => {
    if (type !== 'property') return '';
    
    switch (item.type) {
      case 'rent':
        return '/ month';
      case 'over':
        return '/ night';
      case 'sale':
        return ''; // No suffix for sale
      case 'office':
        return '/ hour';
      case 'land':
        return ''; // No suffix for land
      default:
        return item.type?.includes('rent') ? '/ month' : '';
    }
  };

  // Function to get property type label
  const getPropertyTypeLabel = () => {
    switch (item.type) {
      case 'rent-long':
        return 'Long term rental';
      case 'rent-short':
        return 'Short stay';
      case 'sale':
        return 'For sale';
      case 'office':
        return 'Office space';
      case 'land':
        return 'Land plot';
      default:
        return '';
    }
  };

  // Function to format price display
  const formatPrice = () => {
    const price = item.price || item.regularPrice;
    if (type === 'property' && (item.type === 'sale' || item.type === 'land')) {
      return `R${price?.toLocaleString()}`;
    }
    return `R${price}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        <img 
          src={item.imageUrls?.[0]} 
          alt={item.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Heart Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onLike && onLike(item._id, !isLiked); }}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform"
        >
          {isLiked ? (
            <HeartIconSolid className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-md" />
          ) : (
            <HeartIcon className="w-6 h-6 text-white drop-shadow-md hover:text-rose-500 transition-colors" />
          )}
        </button>
        
        {/* Guest Favorite Badge */}
        {isGuestFavorite && type === 'property' && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md shadow-sm">
            <span className="text-xs font-bold text-gray-900">Guest favorite</span>
          </div>
        )}
        
        {/* Property Type Badge */}
        {type === 'property' && item.type && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded-md shadow-sm">
            <span className="text-xs font-bold text-white">
              {getPropertyTypeLabel()}
            </span>
          </div>
        )}
        
        {/* Image Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === 0 ? 'bg-white w-2' : 'bg-white/60'}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 truncate pr-2 text-[15px]">{item.address || 'South Africa'}</h3>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <StarIconSolid className="w-3.5 h-3.5 text-gray-900" />
            <span className="text-gray-900">{item.rating?.toFixed(2) || '4.5'}</span>
          </div>
        </div>
        <p className="text-gray-500 text-[15px] truncate">{item.name}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-semibold text-gray-900 text-[15px]">{formatPrice()}</span>
          {type === 'property' && (
            <span className="text-gray-900 text-[15px]">{getPriceSuffix()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CategoryFilter = ({ icon, label, onClick, isActive }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-2 min-w-[64px] pb-3 border-b-2 transition-all duration-200 ${
      isActive ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
    }`}
  >
    <span className="text-2xl filter grayscale hover:grayscale-0 transition-all">{icon}</span>
    <span className="text-xs font-medium whitespace-nowrap">{label}</span>
  </motion.button>
);

const SectionTitle = ({ title, actionText, onAction }) => (
  <div className="flex justify-between items-end mb-6">
    <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">{title}</h2>
    {actionText && (
      <button 
        onClick={onAction}
        className="text-sm font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

// --- Main Views ---

const DesktopHeroSearch = ({ searchTerm, setSearchTerm, handleSearchSubmit, navigate, currentLocation }) => {
  const searchCategories = [
    { key: 'properties', label: 'Rent', icon: '🏠', subtext: 'over 1,000+ options' }, 
    { key: 'properties', label: 'Long stays', icon: '⏳', subtext: '30+ days minimum' }, 
    { key: 'helpers', label: 'Helpers', icon: '👷', subtext: 'Professional services' }, 
    { key: 'services', label: 'Services', icon: '✨', subtext: 'Various offerings' }
  ];
  
  return (
    <motion.div 
      key="desktop-hero"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="relative bg-rose-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>
      
      <div className="relative max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }} 
            className="text-5xl font-semibold text-white mb-4 tracking-tight"
          >
            Find your next stay
          </motion.h1>
          <motion.p 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.3 }} 
            className="text-xl text-white/90 max-w-2xl mx-auto font-light"
          >
            Discover homes, services, and experiences around you
          </motion.p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <motion.form 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            onSubmit={handleSearchSubmit} 
            className="relative"
          >
            <div className="bg-white rounded-full shadow-2xl p-2 flex items-center">
              <div className="flex-1 pl-6 pr-4 border-r border-gray-200">
                <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider">Where</label>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search destinations" 
                  className="w-full text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent"
                />
              </div>
              <div className="hidden md:block flex-1 px-4 border-r border-gray-200">
                <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider">Check in</label>
                <input 
                  type="text" 
                  placeholder="Add dates" 
                  className="w-full text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent"
                />
              </div>
              <div className="hidden md:block flex-1 px-4 border-r border-gray-200">
                <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider">Check out</label>
                <input 
                  type="text" 
                  placeholder="Add dates" 
                  className="w-full text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent"
                />
              </div>
              <div className="pl-2 pr-2">
                <button 
                  type="submit" 
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3.5 rounded-full font-semibold transition-colors flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </div>
          </motion.form>
          
          <div className="grid grid-cols-4 gap-4 mt-8">
            {searchCategories.map((category, idx) => (
              <motion.button 
                key={`search-cat-${category.label}-${idx}`} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 + idx * 0.1 }} 
                whileHover={{ scale: 1.02, y: -2 }} 
                onClick={() => navigate(`/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`)} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white hover:bg-white/20 transition-all border border-white/20 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{category.icon}</span>
                  <div>
                    <div className="font-semibold text-lg">{category.label}</div>
                    <div className="text-sm opacity-80 font-light">{category.subtext}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DesktopPopularDestinations = ({ navigate }) => {
  const popularDestinations = [
    { name: 'Johannesburg', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Cape Town', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Durban', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Pretoria', image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Port Elizabeth', image: 'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
  ];
  
  return (
    <motion.section 
      key="popular-destinations"
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={containerVariants} 
      className="mb-16"
    >
      <SectionTitle 
        title="Popular destinations" 
        actionText="View all"
        onAction={() => navigate('/explore')}
      />
      <div className="grid grid-cols-5 gap-6">
        {popularDestinations.map((destination) => (
          <motion.div 
            key={`dest-${destination.name}`} 
            variants={itemVariants} 
            onClick={() => navigate(`/search?address=${encodeURIComponent(destination.name)}`)} 
            className="cursor-pointer "
          >
            <div className="relative overflow-hidden rounded-xl mb-3 aspect-[3/4]">
              <img 
                src={destination.image} 
                alt={destination.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg">{destination.name}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

const SmartRecommendations = ({ recommendations, insights, loading, onItemClick }) => {
  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!recommendations || recommendations.length === 0) return null;
  
  return (
    <motion.div 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={fadeInUp} 
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-gray-900">AI Picks for you</h3>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {recommendations.slice(0, 6).map((item, i) => (
          <motion.div 
            key={item._id ? `rec-${item._id}` : `rec-${i}`} 
            whileHover={{ y: -4 }} 
            onClick={() => onItemClick(item, item.type)} 
            className="flex-shrink-0 w-40 cursor-pointer"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-200">
              <img 
                src={item.imageUrls?.[0]} 
                alt={item.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-1 bg-white/90 backdrop-blur rounded-md">AI Pick</span>
              </div>
            </div>
            <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
            <p className="text-sm text-gray-500">R{item.price || item.regularPrice}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const MobileAppHomepage = ({
  featuredProperties, featuredServices, featuredHelpers, featuredEvents,
  loadingProperties, loadingServices, loadingHelpers, loadingEvents,
  stats, onItemClick, recentlyViewedItems, onRecentlyViewedLike,
  currentLocation = 'South Africa', navigate, aiRecommendations, aiInsights, aiTrendData, onAISuggestionClick
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Homes');
  const [showAIInsights, setShowAIInsights] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => { setIsDesktop(window.innerWidth >= 1024); };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearchSubmit = (e) => { 
    if (e) e.preventDefault(); 
    if (searchTerm.trim()) { 
      navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&type=all&address=${encodeURIComponent(currentLocation)}`); 
      setSearchTerm(''); 
    } 
  };

  const categories = [
    { icon: '🏠', label: 'Homes', type: 'properties' },
    { icon: '✨', label: 'Services', type: 'services' },
    { icon: '👷', label: 'Helpers', type: 'helpers' },
    { icon: '🎪', label: 'Events', type: 'events' },
    { icon: '🏖️', label: 'Beachfront', type: 'properties' },
    { icon: '🏕️', label: 'Cabins', type: 'properties' },
    { icon: '🏰', label: 'Trending', type: 'all' },
  ];

  const handleAISuggestionClick = (suggestion) => {
    const suggestionMap = { 
      'View Modern Apartments': 'modern apartments', 
      'See Budget Options': 'budget friendly', 
      'Explore Luxury Homes': 'luxury homes', 
      'Professional Cleaning': 'cleaning services', 
      'Deep Clean Services': 'deep cleaning', 
      'Move-in Cleaning': 'move in cleaning', 
      'Music Events': 'music events', 
      'Food Festivals': 'food festival', 
      'Art Exhibitions': 'art exhibition' 
    };
    const term = suggestionMap[suggestion] || suggestion;
    navigate(`/search?searchTerm=${encodeURIComponent(term)}&type=all`);
  };

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-white">
        {/* Global scrollbar hiding styles */}
        <style jsx global>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          
          /* Hide all scrollbars on the page */
          body {
            overflow-y: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          
          body::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          
          /* Hide scrollbars for all elements */
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          *::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <DesktopHeroSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          handleSearchSubmit={handleSearchSubmit} 
          navigate={navigate} 
          currentLocation={currentLocation} 
        />
        
        <main className="max-w-7xl mx-auto px-8 py-12">
          <DesktopPopularDestinations navigate={navigate} />
          
          {/* Category Filter Bar */}
          <div className="flex items-center gap-8 overflow-x-auto pb-4 mb-8 border-b border-gray-200 scrollbar-hide">
            {categories.map((cat) => (
              <CategoryFilter 
                key={cat.label} 
                {...cat} 
                isActive={activeCategory === cat.label}
                onClick={() => setActiveCategory(cat.label)}
              />
            ))}
          </div>

          {/* AI Recommendations */}
          {showAIInsights && aiRecommendations && (
            <SmartRecommendations 
              recommendations={aiRecommendations} 
              insights={aiInsights} 
              loading={loadingProperties && loadingServices} 
              onItemClick={onItemClick} 
            />
          )}

          {/* Featured Properties - Airbnb Grid Style */}
          <section className="mb-16">
            <SectionTitle 
              title="Featured properties" 
              actionText="View all"
              onAction={() => navigate('/listing-home-page')}
            />
            {loadingProperties ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProperties.slice(0, 8).map((property) => (
                  <AirbnbCard 
                    key={property._id} 
                    item={property} 
                    onClick={() => navigate(`/listing/${property._id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Services Section */}
          <section className="mb-16">
            <SectionTitle 
              title="Professional services" 
              actionText="View all"
              onAction={() => navigate('/service-home-page')}
            />
            {loadingServices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredServices.slice(0, 4).map((service) => (
                  <AirbnbCard 
                    key={service._id} 
                    item={service} 
                    type="service"
                    onClick={() => navigate(`/service/${service._id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Helpers Section */}
          <section className="mb-16">
            <SectionTitle 
              title="Verified helpers" 
              actionText="View all"
              onAction={() => navigate('/helper-home-page')}
            />
            {loadingHelpers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredHelpers.slice(0, 4).map((helper) => (
                  <div 
                    key={helper._id}
                    onClick={() => navigate(`/helper/${helper._id}`)}
                    className="group cursor-pointer flex flex-col gap-3"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-full bg-gray-200 w-32 h-32 mx-auto border-2 border-gray-100 group-hover:border-rose-200 transition-colors">
                      <img 
                        src={helper.imageUrls?.[0]} 
                        alt={helper.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">{helper.name}</h3>
                      <p className="text-gray-500 text-sm">{helper.type}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <StarIconSolid className="w-3.5 h-3.5 text-gray-900" />
                        <span className="text-sm">{helper.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-sm">R{helper.regularPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Events Section */}
          <section className="mb-16">
            <SectionTitle 
              title="Upcoming events" 
              actionText="View all"
              onAction={() => navigate('/search?type=events')}
            />
            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredEvents.slice(0, 4).map((event) => (
                  <motion.div 
                    key={event._id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/event/${event._id}`)}
                    className="group cursor-pointer flex flex-col gap-3"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
                      <img 
                        src={event.imageUrls?.[0]} 
                        alt={event.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md">
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {event.attendingCount > 100 && (
                        <div className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                          Trending
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
                      <p className="text-gray-500 text-sm truncate">{event.address}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold text-gray-900">R{event.regularPrice}</span>
                        <span className="text-sm text-gray-500">{event.attendingCount}+ going</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Stats Section */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp} 
            className="bg-gray-50 rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">LoopOut by the numbers</h2>
                <p className="text-gray-500 mt-1">Connecting people with spaces, services, and experiences</p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Live statistics
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8">
              {[
                { value: stats.properties || '1,234', label: 'Properties', growth: '12%' },
                { value: stats.services || '456', label: 'Services', growth: '8%' },
                { value: stats.helpers || '789', label: 'Helpers', growth: '15%' },
                { value: stats.events || '321', label: 'Events', growth: '5%' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-semibold text-gray-900 mb-1">{stat.value}+</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                  <div className="text-green-600 text-xs mt-1 font-medium">↑ {stat.growth} this month</div>
                </div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  // Mobile View
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Global scrollbar hiding styles */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Hide all scrollbars on the page */
        body {
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        /* Hide scrollbars for all elements */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <main className="px-4 py-4">

           {/* Categories */}
        <div className="flex overflow-x-auto gap-4 pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat.label}
              onClick={() => navigate(`/search?type=${cat.type}`)}
              className="flex flex-col items-center gap-2 min-w-[64px]"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>


        {/* Mobile Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-rose-500 rounded-2xl p-6 mb-6 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Search</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Find your perfect space</h2>
            <p className="text-white/80 text-sm mb-4">Discover homes, services, and experiences</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {['Smart homes', 'Best deals', 'Near me', 'Trending'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => navigate(`/search?searchTerm=${tag}&type=all`)} 
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/search?ai=1')} 
              className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 w-fit"
            >
              <SparklesIcon className="w-4 h-4" />
              AI Explore
            </button>
          </div>
        </motion.div>

     

        {/* AI Recommendations */}
        {showAIInsights && aiRecommendations && (
          <SmartRecommendations 
            recommendations={aiRecommendations} 
            insights={aiInsights} 
            loading={loadingProperties && loadingServices} 
            onItemClick={onItemClick} 
          />
        )}

        {/* Recently Viewed */}
        {recentlyViewedItems.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Recently viewed</h2>
              <button onClick={() => navigate('/recently-viewed')} className="text-sm text-gray-500 underline">
                See all
              </button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {recentlyViewedItems.slice(0, 5).map((item) => (
                <div 
                  key={item._id}
                  onClick={() => navigate(item.type === 'helper' ? `/helper/${item._id}` : `/listing/${item._id}`)}
                  className="flex-shrink-0 w-36 cursor-pointer"
                >
                  <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-2 bg-gray-200">
                    <img src={item.imageUrls?.[0]} alt={item.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRecentlyViewedLike(item._id, !item.isLiked); }}
                      className="absolute top-2 right-2 p-1"
                    >
                      {item.isLiked ? (
                        <HeartIconSolid className="w-5 h-5 text-rose-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  </div>
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">R{item.regularPrice}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Homes */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Popular homes</h2>
            <Link to="/listing-home-page" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          {loadingProperties ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {featuredProperties.slice(0, 4).map((property) => (
                <AirbnbCard 
                  key={property._id} 
                  item={property} 
                  onClick={() => navigate(`/listing/${property._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Services */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Top services</h2>
            <Link to="/service-home-page" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
            {featuredServices.slice(0, 3).map((service) => (
              <div 
                key={service._id}
                onClick={() => navigate(`/service/${service._id}`)}
                className="flex-shrink-0 w-60 cursor-pointer"
              >
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-2 bg-gray-200">
                  <img src={service.imageUrls?.[0]} alt={service.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-medium text-sm truncate">{service.name}</p>
             
                <p className="font-semibold text-sm mt-1">R{service.regularPrice}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming events</h2>
            <Link to="/search?type=events" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          {featuredEvents.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {featuredEvents.slice(0, 3).map((event) => (
                <div 
                  key={event._id}
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="flex-shrink-0 w-72 cursor-pointer"
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2 bg-gray-200">
                    <img src={event.imageUrls?.[0]} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <p className="font-medium text-sm truncate">{event.name}</p>
                  <p className="text-sm text-gray-500 truncate">{event.address}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-sm">R{event.regularPrice}</span>
                    <span className="text-xs text-gray-500">{event.attendingCount}+ going</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming events</p>
            </div>
          )}
        </section>

        {/* Helpers */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Helpers</h2>
            <Link to="/helper-home-page" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
            {featuredHelpers.slice(0, 4).map((helper) => (
              <div 
                key={helper._id}
                onClick={() => navigate(`/helper/${helper._id}`)}
                className="flex-shrink-0 w-32 text-center cursor-pointer"
              >
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <img 
                    src={helper.imageUrls?.[0]} 
                    alt={helper.name} 
                    className="w-full h-full object-cover rounded-full border-2 border-gray-100"
                  />
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="font-medium text-sm truncate">{helper.name}</p>
                <p className="text-xs text-gray-500 truncate">{helper.type}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <StarIconSolid className="w-3 h-3 text-gray-900" />
                  <span className="text-xs">{helper.regularPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* AI Chat Button */}
      <button
        onClick={() => {/* Open chat */}}
        className="fixed bottom-24 right-4 bg-gray-900 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform z-50"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- Main Component ---
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiEngine = useRef(new AIRecommendationEngine());
  
  const [featuredProperties, setFeaturedProperties] = useState(MOCK_PROPERTIES);
  const [featuredServices, setFeaturedServices] = useState(MOCK_SERVICES);
  const [featuredHelpers, setFeaturedHelpers] = useState(MOCK_HELPERS);
  const [featuredEvents, setFeaturedEvents] = useState(MOCK_EVENTS);
  
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingHelpers, setLoadingHelpers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  const [stats, setStats] = useState({ properties: 1234, services: 456, helpers: 789, events: 321 });
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('South Africa');

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const items = JSON.parse(stored);
          const enhancedItems = items.map(item => ({ ...item, aiScore: Math.floor(Math.random() * 30) + 70 }));
          setRecentlyViewedItems(enhancedItems);
        }
      } catch (error) { console.error('Failed to load recently viewed items:', error); }
    };
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addressFromUrl = urlParams.get('address');
    if (addressFromUrl) setCurrentLocation(decodeURIComponent(addressFromUrl));
  }, [location.search]);

  const addToRecentlyViewed = (item, itemType) => {
    try {
      aiEngine.current.updatePreferences(item, 'view');
      const viewedItem = { 
        ...item, 
        itemType: itemType, 
        viewedAt: new Date().toISOString(), 
        isLiked: false, 
        aiScore: Math.floor(Math.random() * 30) + 70 
      };
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter(i => i._id !== item._id || i.itemType !== itemType);
      items.unshift(viewedItem);
      items = items.slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
      setRecentlyViewedItems(items);
      navigate(`/${itemType}/${item._id}`);
    } catch (error) { console.error('Failed to save to recently viewed:', error); }
  };

  const updateRecentlyViewedLike = (itemId, isLiked) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.map(item => item._id === itemId ? { ...item, isLiked } : item);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setRecentlyViewedItems(items);
        if (isLiked) { 
          const likedItem = items.find(item => item._id === itemId); 
          if (likedItem) aiEngine.current.updatePreferences(likedItem, 'like'); 
        }
      }
    } catch (error) { console.error('Failed to update like status:', error); }
  };

  const generateAIRecommendations = (properties, services, helpers, events) => {
    const allItems = [...properties, ...services, ...helpers, ...events].filter(Boolean);
    return aiEngine.current.generatePersonalizedRecommendations(allItems, { 
      location: currentLocation, 
      preferences: aiEngine.current.userPreferences 
    });
  };

  useEffect(() => {
    const fetchHomepageData = async () => {
      const controllers = {
        properties: new AbortController(),
        services: new AbortController(),
        helpers: new AbortController(),
        events: new AbortController()
      };

      const timeoutId = setTimeout(() => {
        Object.values(controllers).forEach(controller => controller.abort());
      }, API_TIMEOUT);

      const fetchPromises = [
        fetch(`/api/listing/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&address=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.properties.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { if (data?.length > 0) setFeaturedProperties(data.slice(0, DATA_FETCH_LIMIT)); })
          .catch(() => {}).finally(() => setLoadingProperties(false)),

        fetch(`/api/service/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&location=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.services.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { if (data?.length > 0) setFeaturedServices(data.slice(0, DATA_FETCH_LIMIT)); })
          .catch(() => {}).finally(() => setLoadingServices(false)),

        fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&address=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.helpers.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { if (data?.length > 0) setFeaturedHelpers(data.slice(0, DATA_FETCH_LIMIT)); })
          .catch(() => {}).finally(() => setLoadingHelpers(false)),

        fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc&location=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.events.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { if (data?.length > 0) setFeaturedEvents(data.slice(0, DATA_FETCH_LIMIT)); })
          .catch(() => {}).finally(() => setLoadingEvents(false))
      ];

      await Promise.all(fetchPromises);
      clearTimeout(timeoutId);
      setStats({ properties: 1234, services: 456, helpers: 789, events: 321 });
    };

    fetchHomepageData();
  }, [currentLocation]);

  useEffect(() => {
    if (featuredProperties && featuredServices && featuredHelpers && featuredEvents) {
      const aiResults = generateAIRecommendations(featuredProperties, featuredServices, featuredHelpers, featuredEvents);
      setAiRecommendations(aiResults.recommendations || []);
      setAiInsights(aiResults.insights || []);
    }
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents]);

  return (
    <MobileAppHomepage
      featuredProperties={featuredProperties} 
      featuredServices={featuredServices} 
      featuredHelpers={featuredHelpers} 
      featuredEvents={featuredEvents}
      loadingProperties={loadingProperties} 
      loadingServices={loadingServices} 
      loadingHelpers={loadingHelpers} 
      loadingEvents={loadingEvents}
      stats={stats} 
      onItemClick={addToRecentlyViewed} 
      recentlyViewedItems={recentlyViewedItems} 
      onRecentlyViewedLike={updateRecentlyViewedLike}
      currentLocation={currentLocation} 
      navigate={navigate} 
      aiRecommendations={aiRecommendations} 
      aiInsights={aiInsights} 
      aiTrendData={null}
      onAISuggestionClick={(suggestion) => { navigate(`/search?searchTerm=${encodeURIComponent(suggestion)}&type=all&ai=1`); }}
    />
  );
};

export default Home;