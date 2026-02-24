import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Map,
  Grid3X3,
  List,
  ArrowUpDown,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  MapPin,
  Bed,
  Bath,
  Sparkles,
  RotateCcw,
  Compass,
  Home,
  Wrench,
  Users,
  Calendar,
  DollarSign,
  Tag,
  Building,
  Search
} from 'lucide-react';

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

// Property Types Configuration
const PROPERTY_TYPE_CONFIG = {
  rent: { label: 'For Rent', color: 'bg-blue-100 text-blue-800', icon: '🏠', endpoint: 'listing' },
  sale: { label: 'For Sale', color: 'bg-emerald-100 text-emerald-800', icon: '💰', endpoint: 'listing' },
  over: { label: 'Vacation Rental', color: 'bg-purple-100 text-purple-800', icon: '🌙', endpoint: 'listing' },
  land: { label: 'Land', color: 'bg-amber-100 text-amber-800', icon: '🪨', endpoint: 'listing' },
  office: { label: 'Office Space', color: 'bg-orange-100 text-orange-800', icon: '🏢', endpoint: 'listing' }
};

// Helper Categories Configuration
const HELPER_CATEGORY_CONFIG = {
  beauty: { label: 'Beauty & Spa', color: 'bg-pink-100 text-pink-800', icon: '💅', endpoint: 'helper' },
  spa: { label: 'Spa Services', color: 'bg-purple-100 text-purple-800', icon: '🧖', endpoint: 'helper' },
  barber: { label: 'Barber', color: 'bg-blue-100 text-blue-800', icon: '💇', endpoint: 'helper' },
  barbar: { label: 'Barber', color: 'bg-blue-100 text-blue-800', icon: '💇', endpoint: 'helper' },
  chef: { label: 'Personal Chef', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳', endpoint: 'helper' },
  cooking: { label: 'Cooking Services', color: 'bg-amber-100 text-amber-800', icon: '🍳', endpoint: 'helper' },
  tattoo: { label: 'Tattoo Artist', color: 'bg-red-100 text-red-800', icon: '💉', endpoint: 'helper' },
  tutor: { label: 'Tutoring', color: 'bg-green-100 text-green-800', icon: '📚', endpoint: 'helper' },
  photography: { label: 'Photography', color: 'bg-indigo-100 text-indigo-800', icon: '📸', endpoint: 'helper' },
  domestic: { label: 'Domestic Help', color: 'bg-teal-100 text-teal-800', icon: '🧹', endpoint: 'helper' },
  maid: { label: 'Maid Services', color: 'bg-cyan-100 text-cyan-800', icon: '🧼', endpoint: 'helper' }
};

// Main Search Type Configuration
const SEARCH_TYPE_CONFIG = {
  all: {
    label: 'All',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    endpoint: 'all'
  },
  properties: {
    label: 'Properties',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    endpoint: 'listing',
    subTypes: PROPERTY_TYPE_CONFIG
  },
  services: {
    label: 'Services',
    icon: Wrench,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    endpoint: 'service'
  },
  helpers: {
    label: 'Helpers',
    icon: Users,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    endpoint: 'helper',
    subTypes: HELPER_CATEGORY_CONFIG
  },
  events: {
    label: 'Events',
    icon: Calendar,
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    endpoint: 'event'
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const ResultCard = ({ item, index, viewMode, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const getItemType = () => {
    // Map different possible type values to our expected types
    const type = item.itemType || item.type || 'properties';
    
    // Handle special cases
    if (type === 'listing') return 'properties';
    if (type === 'property') return 'properties';
    if (type === 'service') return 'services';
    if (type === 'helper') return 'helpers';
    if (type === 'event') return 'events';
    
    return type;
  };
  
  const getItemSubType = () => {
    return item.subType || item.type || item.category || item.serviceType || '';
  };
  
  const itemType = getItemType();
  const itemSubType = getItemSubType();
  
  // Get main config with fallback
  const mainConfig = SEARCH_TYPE_CONFIG[itemType] || {
    label: itemType.charAt(0).toUpperCase() + itemType.slice(1),
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    endpoint: itemType
  };
  
  // Get sub config if available
  let subConfig = null;
  if (mainConfig?.subTypes && itemSubType) {
    subConfig = mainConfig.subTypes[itemSubType];
  }
  
  // If no subConfig found in main config, check helper categories directly
  if (!subConfig && itemType === 'helpers' && itemSubType) {
    subConfig = HELPER_CATEGORY_CONFIG[itemSubType];
  }
  
  // If no subConfig found in main config, check property types directly
  if (!subConfig && itemType === 'properties' && itemSubType) {
    subConfig = PROPERTY_TYPE_CONFIG[itemSubType];
  }

  const getItemIcon = () => {
    if (subConfig?.icon) return subConfig.icon;
    if (itemType === 'properties') return '🏠';
    if (itemType === 'services') return '🔧';
    if (itemType === 'helpers') return '👤';
    if (itemType === 'events') return '📅';
    return '📍';
  };

  // Safely get image URL
  const getImageUrl = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    if (item.imageUrl) {
      return item.imageUrl;
    }
    // Default images based on type
    const defaultImages = {
      properties: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      services: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      helpers: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      events: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
    };
    return defaultImages[itemType] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
  };

  // Safely get price
  const getPrice = () => {
    if (item.price) return `R${item.price}`;
    if (item.regularPrice) return `R${item.regularPrice}`;
    if (item.hourlyRate) return `R${item.hourlyRate}/hr`;
    if (item.dailyRate) return `R${item.dailyRate}/day`;
    return 'Contact for price';
  };

  // Safely get rating
  const getRating = () => {
    return item.rating || item.averageRating || 4.5;
  };

  // Safely get location/address
  const getLocation = () => {
    return item.address || item.location || item.city || 'Location not specified';
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 5 }}
        onClick={onClick}
        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex gap-4"
      >
        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={getImageUrl()} 
            alt={item.name || item.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{item.name || item.title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 truncate">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{getLocation()}</span>
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
              className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              {isLiked ? <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> : <Heart className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 flex-wrap">
            {item.bedrooms !== undefined && (
              <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {item.bedrooms}</span>
            )}
            {item.bathrooms !== undefined && (
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {item.bathrooms}</span>
            )}
            {item.skills && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {Array.isArray(item.skills) ? item.skills[0] : item.skills}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{getRating().toFixed(1)}</span>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">{getPrice()}</span>
            <div className="flex gap-1">
              {subConfig && (
                <span className={`text-xs px-2 py-1 rounded-full ${subConfig.color || 'bg-gray-100 text-gray-700'}`}>
                  {subConfig.label || itemSubType}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${mainConfig.bgColor || 'bg-gray-100'} ${mainConfig.textColor || 'text-gray-700'}`}>
                {mainConfig.label || itemType}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={item.name || item.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {subConfig && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${subConfig.color || 'bg-gray-100 text-gray-700'}`}>
              {getItemIcon()} {subConfig.label || itemSubType}
            </span>
          )}
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${mainConfig.bgColor || 'bg-gray-100'} ${mainConfig.textColor || 'text-gray-700'}`}>
            {mainConfig.label || itemType}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          {isLiked ? <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> : <Heart className="w-4 h-4 text-gray-600" />}
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 truncate">{item.name || item.title}</h3>
        <p className="text-gray-500 text-sm truncate flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {getLocation()}
        </p>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">{getPrice()}</span>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{getRating().toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-12 text-center border border-gray-100"
  >
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Search className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
    <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
    <div className="flex gap-3 justify-center flex-wrap">
      <button
        onClick={onClear}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Clear Filters
      </button>
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden h-80">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
    </div>
  </div>
);

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchType, setSearchType] = useState('all');
  const [searchSubType, setSearchSubType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setSearchTerm(urlParams.get('searchTerm') || '');
    setSearchType(urlParams.get('type') || 'all');
    setSearchSubType(urlParams.get('subType') || '');
    setFilters({
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
      minRating: urlParams.get('minRating') || '',
      location: urlParams.get('location') || ''
    });
  }, [location.search]);

  const fetchData = useCallback(async () => {
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.toString()) {
      setListings([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const type = urlParams.get('type') || 'all';
      const subType = urlParams.get('subType') || '';
      const searchTerm = urlParams.get('searchTerm') || '';
      const minPrice = urlParams.get('minPrice');
      const maxPrice = urlParams.get('maxPrice');
      const location = urlParams.get('location') || '';
      const minRating = urlParams.get('minRating');
      
      let endpoints = [];
      
      // Determine which endpoints to fetch based on type
      if (type === 'all') {
        endpoints = ['listing', 'service', 'helper', 'event'];
      } else {
        const config = SEARCH_TYPE_CONFIG[type];
        if (config) {
          endpoints = [config.endpoint];
        }
      }
      
      // Fetch from all relevant endpoints
      const fetchPromises = endpoints.map(async (endpoint) => {
        let url = `/api/${endpoint}/get?limit=${DEFAULT_LISTING_LIMIT}`;
        
        // Add search term
        if (searchTerm) {
          url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        }
        
        // Add location
        if (location) {
          if (endpoint === 'listing' || endpoint === 'helper') {
            url += `&address=${encodeURIComponent(location)}`;
          } else {
            url += `&location=${encodeURIComponent(location)}`;
          }
        }
        
        // Add price filters for listings
        if (endpoint === 'listing') {
          if (minPrice) url += `&minPrice=${minPrice}`;
          if (maxPrice) url += `&maxPrice=${maxPrice}`;
          
          // Add property subtype filter
          if (subType && PROPERTY_TYPE_CONFIG[subType]) {
            url += `&type=${subType}`;
          }
        }
        
        // Add helper category filter
        if (endpoint === 'helper' && subType && HELPER_CATEGORY_CONFIG[subType]) {
          url += `&category=${subType}`;
        }
        
        // Add service category filter
        if (endpoint === 'service' && subType) {
          url += `&category=${subType}`;
        }
        
        // Add event filters
        if (endpoint === 'event') {
          if (subType) url += `&category=${subType}`;
        }
        
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            // Add itemType to each result for identification
            return data.map(item => ({ 
              ...item, 
              itemType: endpoint === 'listing' ? 'properties' : endpoint,
              subType: item.type || item.category || subType
            }));
          }
        } catch (err) {
          console.error(`Error fetching from ${endpoint}:`, err);
        }
        return [];
      });
      
      const results = await Promise.all(fetchPromises);
      let combinedResults = results.flat();
      
      // Apply rating filter if specified
      if (minRating) {
        const ratingThreshold = parseFloat(minRating);
        combinedResults = combinedResults.filter(item => (item.rating || 4.5) >= ratingThreshold);
      }
      
      setListings(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data for demonstration
      const mockData = generateMockData(urlParams);
      setListings(mockData);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  // Generate mock data for demonstration
  const generateMockData = (urlParams) => {
    const type = urlParams.get('type') || 'all';
    const subType = urlParams.get('subType') || '';
    const mockData = [];
    
    // Properties
    if (type === 'all' || type === 'properties') {
      const propertyTypes = subType ? [subType] : ['rent', 'sale', 'over', 'land', 'office'];
      propertyTypes.forEach((propType, index) => {
        if (PROPERTY_TYPE_CONFIG[propType]) {
          mockData.push({
            _id: `p${index}`,
            name: `${PROPERTY_TYPE_CONFIG[propType].label} in Sandton`,
            price: 5000 + (index * 2000),
            itemType: 'properties',
            subType: propType,
            imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
            rating: 4.5 + (index * 0.1),
            address: 'Sandton, Johannesburg',
            bedrooms: 2 + index,
            bathrooms: 1 + index
          });
        }
      });
    }
    
    // Helpers
    if (type === 'all' || type === 'helpers') {
      const helperTypes = subType ? [subType] : ['beauty', 'barber', 'chef', 'tattoo', 'tutor', 'photography', 'domestic'];
      helperTypes.forEach((helperType, index) => {
        if (HELPER_CATEGORY_CONFIG[helperType]) {
          mockData.push({
            _id: `h${index}`,
            name: `Professional ${HELPER_CATEGORY_CONFIG[helperType].label}`,
            price: 300 + (index * 100),
            itemType: 'helpers',
            subType: helperType,
            imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
            rating: 4.7 + (index * 0.05),
            address: 'Cape Town',
            skills: [HELPER_CATEGORY_CONFIG[helperType].label]
          });
        }
      });
    }
    
    // Services
    if (type === 'all' || type === 'services') {
      mockData.push({
        _id: 's1',
        name: 'Professional Cleaning Service',
        price: 350,
        itemType: 'services',
        imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
        rating: 4.9,
        address: 'Cape Town'
      });
    }
    
    // Events
    if (type === 'all' || type === 'events') {
      mockData.push({
        _id: 'e1',
        name: 'Music Festival 2024',
        price: 250,
        itemType: 'events',
        imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'],
        rating: 4.5,
        address: 'Johannesburg'
      });
    }
    
    return mockData;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    const urlParams = new URLSearchParams();
    if (searchTerm) urlParams.set('searchTerm', searchTerm);
    if (searchType !== 'all') urlParams.set('type', searchType);
    if (searchSubType) urlParams.set('subType', searchSubType);
    if (filters.minPrice) urlParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) urlParams.set('maxPrice', filters.maxPrice);
    if (filters.minRating) urlParams.set('minRating', filters.minRating);
    if (filters.location) urlParams.set('location', filters.location);
    
    navigate(`/search?${urlParams.toString()}`);
  }, [searchTerm, searchType, searchSubType, filters, navigate]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchType('all');
    setSearchSubType('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      location: ''
    });
    navigate('/search');
  };

  const addToRecentlyViewed = (item, itemType) => {
    navigate(`/${itemType}/${item._id}`);
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchSubType(''); // Reset subtype when main type changes
    handleSearch();
  };

  const handleSubTypeChange = (subType) => {
    setSearchSubType(subType);
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for properties, services, helpers, events..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Type Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {Object.entries(SEARCH_TYPE_CONFIG).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleTypeChange(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  searchType === key 
                    ? `bg-gradient-to-r ${value.color} text-white` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <value.icon className="w-4 h-4" />
                {value.label}
              </button>
            ))}
          </div>

          {/* Sub Type Pills (for properties and helpers) */}
          {searchType === 'properties' && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleSubTypeChange('')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  !searchSubType 
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Properties
              </button>
              {Object.entries(PROPERTY_TYPE_CONFIG).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSubTypeChange(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    searchSubType === key 
                      ? value.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{value.icon}</span>
                  {value.label}
                </button>
              ))}
            </div>
          )}

          {searchType === 'helpers' && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleSubTypeChange('')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  !searchSubType 
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Helpers
              </button>
              {Object.entries(HELPER_CATEGORY_CONFIG).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSubTypeChange(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    searchSubType === key 
                      ? value.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{value.icon}</span>
                  {value.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-gray-600">
            <span className="font-bold text-gray-900">{listings.length}</span> results
            {searchSubType && (
              <span className="ml-2 text-sm">
                {searchType === 'properties' && PROPERTY_TYPE_CONFIG[searchSubType]?.label}
                {searchType === 'helpers' && HELPER_CATEGORY_CONFIG[searchSubType]?.label}
              </span>
            )}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            } gap-4`}
          >
            {listings.map((item, index) => (
              <ResultCard
                key={`${item._id}-${index}`}
                item={item}
                index={index}
                viewMode={viewMode}
                onClick={() => addToRecentlyViewed(item, item.itemType)}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </main>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button 
                    onClick={() => setShowFilters(false)} 
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      placeholder="Enter city or area"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price Range Filter - Show for properties and all */}
                  {(searchType === 'all' || searchType === 'properties') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Price Range (R)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                    <div className="flex gap-2">
                      {[4.5, 4, 3.5, 3].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFilters({ ...filters, minRating: rating.toString() })}
                          className={`flex-1 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                            filters.minRating === rating.toString() 
                              ? 'bg-blue-500 text-white border-blue-500' 
                              : 'border-gray-300'
                          }`}
                        >
                          {rating}+
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => {
                      setFilters({
                        minPrice: '',
                        maxPrice: '',
                        minRating: '',
                        location: ''
                      });
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      handleSearch();
                      setShowFilters(false);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;