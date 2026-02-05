import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Home,
  Wrench,
  Users,
  Calendar,
  Sparkles,
  DollarSign,
  Tag,
  Building,
  Map,
  Clock,
  Lightbulb,
  X,
  Bed,
  Bath,
  Car,
  Wifi,
  Snowflake,
  Dumbbell,
  PawPrint,
  Eye,
  Shield,
  ChefHat
} from 'lucide-react';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";
import SearchHeader from "../components/SearchHeader";
import FilterSheet from "../components/FilterSheet";
import ItemCard from "../components/ItemCard";
import MapView from "../components/MapView";

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

const SEARCH_TYPE_CONFIG = {
  all: {
    label: 'All Categories',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    subtypes: [
      { value: 'all', label: 'All Types', icon: Sparkles }
    ]
  },
  properties: {
    label: 'Properties',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
    subtypes: [
      { value: 'all', label: 'All Types', icon: Home },
      { value: 'rent', label: 'For Rent', icon: DollarSign },
      { value: 'sale', label: 'For Sale', icon: Tag },
      { value: 'office', label: 'Office', icon: Building },
      { value: 'land', label: 'Land', icon: Map },
      { value: 'guesthouse', label: 'Guest House', icon: Users }
    ]
  },
  services: {
    label: 'Services',
    icon: Wrench,
    color: 'from-green-500 to-emerald-500',
    subtypes: [
      { value: 'all', label: 'All Services', icon: Wrench },
      { value: 'cleaning', label: 'Cleaning', emoji: '🧹' },
      { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
      { value: 'moving', label: 'Moving', emoji: '🚚' },
      { value: 'landscaping', label: 'Landscaping', emoji: '🌿' },
      { value: 'catering', label: 'Catering', emoji: '🍳' }
    ]
  },
  helpers: {
    label: 'Helpers',
    icon: Users,
    color: 'from-orange-500 to-amber-500',
    subtypes: [
      { value: 'all', label: 'All Helpers', icon: Users },
      { value: 'domestic', label: 'General Help', emoji: '👨‍💼' },
      { value: 'errand', label: 'Errand Runner', emoji: '🛒' },
      { value: 'tutor', label: 'Tutor', emoji: '📚' },
      { value: 'chef', label: 'Chef', emoji: '👨‍🍳' },
      { value: 'maid', label: 'Maid', emoji: '🧹' }
    ]
  },
  events: {
    label: 'Events',
    icon: Calendar,
    color: 'from-red-500 to-rose-500',
    subtypes: [
      { value: 'all', label: 'All Events', icon: Calendar },
      { value: 'music', label: 'Music', emoji: '🎵' },
      { value: 'sports', label: 'Sports', emoji: '⚽' },
      { value: 'art', label: 'Art & Culture', emoji: '🎨' },
      { value: 'community', label: 'Community', emoji: '👥' },
      { value: 'food', label: 'Food & Drink', emoji: '🍔' }
    ]
  }
};

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchType, setSearchType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubType, setSelectedSubType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('South Africa');

  const [filters, setFilters] = useState({
    parking: false,
    furnished: false,
    wifi: false,
    pool: false,
    tv: false,
    offer: false,
    sort: 'createdAt',
    order: 'desc',
    bedroomsMin: '',
    bedroomsMax: '',
    priceMin: 0,
    priceMax: 100000000,
    breakfast: false,
    pets: false,
    security: false,
    aircon: false,
    gym: false,
    view: false,
    kitchen: false,
    laundry: false
  });

  const searchExamples = [
    '3 bedroom apartment in Sandton',
    'Office space in Johannesburg CBD',
    'Cleaning service in Pretoria',
    'Tutor in Cape Town',
    'Music festival this weekend'
  ];

  // Initialize search from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermParam = urlParams.get('searchTerm') || '';
    const typeParam = urlParams.get('type') || 'all';
    const subTypeParam = urlParams.get('subType') || 'all';
    const addressParam = urlParams.get('address');
    
    setSearchTerm(searchTermParam);
    setSearchType(typeParam);
    setSelectedSubType(subTypeParam);
    
    if (addressParam) {
      setCurrentLocation(decodeURIComponent(addressParam));
    }
  }, [location.search]);

  // Fetch all listings when search params change
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const searchTerm = urlParams.get('searchTerm') || '';
        const searchType = urlParams.get('type') || 'all';
        
        // Define endpoints for all types
        const endpoints = [];
        
        // Add endpoints based on search type
        if (searchType === 'all' || searchType === 'properties') {
          endpoints.push({ type: 'properties', endpoint: '/api/listing/get' });
        }
        if (searchType === 'all' || searchType === 'services') {
          endpoints.push({ type: 'services', endpoint: '/api/service/get' });
        }
        if (searchType === 'all' || searchType === 'helpers') {
          endpoints.push({ type: 'helpers', endpoint: '/api/helper/get' });
        }
        if (searchType === 'all' || searchType === 'events') {
          endpoints.push({ type: 'events', endpoint: '/api/event/get' });
        }
        
        // Fetch data from all endpoints
        const fetchPromises = endpoints.map(async ({ type, endpoint }) => {
          try {
            const res = await fetch(`${endpoint}?${urlParams.toString()}`);
            const data = await res.json();
            
            // Add type to each item
            return data.map(item => ({
              ...item,
              itemType: type,
              price: item.price || item.regularPrice || 0,
              location: item.location || item.city || item.address || ''
            }));
          } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
            return [];
          }
        });
        
        const allResults = await Promise.all(fetchPromises);
        const combinedResults = allResults.flat();
        
        // Filter by location if search term contains location keywords
        let filteredResults = combinedResults;
        if (searchTerm) {
          filteredResults = combinedResults.filter(item => {
            const itemLocation = item.location?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            // Check if location matches search term
            const locationKeywords = ['in ', 'at ', 'near ', 'around ', 'close to '];
            const hasLocationPrefix = locationKeywords.some(keyword => 
              searchLower.includes(keyword)
            );
            
            if (hasLocationPrefix) {
              const locationMatch = searchLower.match(/(?:in|at|near|around|close to)\s+([^,]+)/);
              if (locationMatch) {
                const searchLocation = locationMatch[1].trim();
                return itemLocation.includes(searchLocation) || 
                       item.name?.toLowerCase().includes(searchLower) ||
                       item.description?.toLowerCase().includes(searchLower);
              }
            }
            
            // General search across multiple fields
            return itemLocation.includes(searchLower) ||
                   item.name?.toLowerCase().includes(searchLower) ||
                   item.title?.toLowerCase().includes(searchLower) ||
                   item.description?.toLowerCase().includes(searchLower) ||
                   item.address?.toLowerCase().includes(searchLower) ||
                   item.city?.toLowerCase().includes(searchLower);
          });
        }
        
        setListings(filteredResults);
        setShowMore(filteredResults.length >= DEFAULT_LISTING_LIMIT);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (urlParams.toString()) {
      fetchData();
    }
  }, [location.search]);

  // AI analysis effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length > 2) {
        const suggestions = await analyzeSearchTerm(searchTerm);
        setAiSuggestions(suggestions);
      } else {
        setAiSuggestions(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Save recent searches
  const saveRecentSearch = (params) => {
    try {
      const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
      const filtered = searches.filter(
        item => JSON.stringify(item.params) !== JSON.stringify(params)
      );
      const score = Object.keys(params).filter(k => params[k] && k !== 'searchTerm').length;
      const newSearches = [
        { params, timestamp: new Date().toISOString(), score },
        ...filtered
      ].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      return newSearches;
    } catch (error) {
      console.error('Failed to save recent search:', error);
      return [];
    }
  };

  // Load recent searches
  useEffect(() => {
    try {
      const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
      setRecentSearches(searches);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  const handleSearch = () => {
    const urlParams = new URLSearchParams();
    
    if (searchTerm) {
      urlParams.set('searchTerm', searchTerm);
    }
    
    if (searchType !== 'all') {
      urlParams.set('type', searchType);
    }
    
    if (selectedSubType !== 'all') {
      urlParams.set('subType', selectedSubType);
    }
    
    // Add non-default filter values
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== false && value !== '') {
        urlParams.set(key, value);
      }
    });

    const updatedSearches = saveRecentSearch({
      searchTerm,
      searchType,
      selectedSubType,
      ...filters
    });
    setRecentSearches(updatedSearches);
    navigate(`/search?${urlParams.toString()}`);
  };

  const analyzeSearchTerm = async (term) => {
    if (term.length < 3) return null;
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const suggestions = { searchTerm: term, filters: {}, type: 'all' };
    let hasSuggestion = false;

    // Detect location in search term
    const locationKeywords = ['in ', 'at ', 'near ', 'around ', 'close to ', 'within '];
    const locationMatch = term.match(new RegExp(`(${locationKeywords.join('|')})\\s*([^,.!?]+)`, 'i'));
    
    if (locationMatch) {
      const location = locationMatch[2].trim();
      suggestions.filters.location = location;
      hasSuggestion = true;
      suggestions.type = 'all';
    }

    // Type detection patterns
    const typePatterns = [
      { patterns: ['apartment', 'flat', 'studio', 'house', 'property', 'rent', 'sale', 'buy'], type: 'properties' },
      { patterns: ['clean', 'service', 'maintain', 'repair', 'fix'], type: 'services' },
      { patterns: ['helper', 'chef', 'tutor', 'maid', 'assistant', 'staff'], type: 'helpers' },
      { patterns: ['event', 'festival', 'concert', 'show', 'party', 'meetup'], type: 'events' }
    ];

    typePatterns.forEach(({ patterns, type }) => {
      if (patterns.some(p => term.toLowerCase().includes(p))) {
        suggestions.type = type;
        hasSuggestion = true;
      }
    });

    const amenityKeywords = [
      { patterns: ['wifi', 'internet'], key: 'wifi' },
      { patterns: ['parking', 'garage'], key: 'parking' },
      { patterns: ['pool', 'swimming'], key: 'pool' },
      { patterns: ['furnished'], key: 'furnished' },
      { patterns: ['pet friendly', 'pets allowed'], key: 'pets' },
      { patterns: ['gym', 'fitness'], key: 'gym' },
      { patterns: ['view', 'scenic', 'ocean view', 'mountain view'], key: 'view' },
      { patterns: ['security', 'secure', 'gated'], key: 'security' },
      { patterns: ['aircon', 'air conditioning', 'ac'], key: 'aircon' }
    ];

    amenityKeywords.forEach(({ patterns, key }) => {
      if (patterns.some(p => new RegExp(p, 'i').test(term))) {
        suggestions.filters[key] = true;
        hasSuggestion = true;
      }
    });

    // Price detection
    const priceMatch = term.match(/(under|below|up to|max|less than)\s*(\$|€|£|R|¥)?\s*([\d,]+)/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[3].replace(/,/g, ''));
      if (!isNaN(price)) {
        suggestions.filters.priceMax = price;
        hasSuggestion = true;
      }
    }

    // Bedroom detection
    const bedroomMatch = term.match(/(\d+)\s*(bed|bedroom|beds|bd|room)/i);
    if (bedroomMatch) {
      const bedrooms = parseInt(bedroomMatch[1]);
      if (!isNaN(bedrooms)) {
        suggestions.filters.bedroomsMin = bedrooms;
        hasSuggestion = true;
      }
    }

    setIsAnalyzing(false);
    return hasSuggestion ? suggestions : null;
  };

  const applyAiSuggestion = () => {
    if (aiSuggestions) {
      setSearchTerm(aiSuggestions.searchTerm);
      setFilters(prev => ({
        ...prev,
        ...aiSuggestions.filters
      }));
      
      if (aiSuggestions.type && aiSuggestions.type !== 'all') {
        setSearchType(aiSuggestions.type);
      }
      
      setAiSuggestions(prev => ({ ...prev, applied: true }));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubType('all');
    setFilters({
      parking: false,
      furnished: false,
      wifi: false,
      pool: false,
      tv: false,
      offer: false,
      sort: 'createdAt',
      order: 'desc',
      bedroomsMin: '',
      bedroomsMax: '',
      priceMin: 0,
      priceMax: 100000000,
      breakfast: false,
      pets: false,
      security: false,
      aircon: false,
      gym: false,
      view: false,
      kitchen: false,
      laundry: false
    });
    setSearchType('all');
    navigate('/search');
  };

  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-xl shadow-sm overflow-hidden h-80">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSelectedSubType('all');
    navigate(`/search?type=${type}`);
  };

  // Function to add item to recently viewed
  const addToRecentlyViewed = (item, itemType) => {
    try {
      const viewedItem = {
        ...item,
        itemType: itemType,
        viewedAt: new Date().toISOString(),
        isLiked: false
      };

      // Get existing items
      const stored = localStorage.getItem('recentlyViewed');
      let items = stored ? JSON.parse(stored) : [];

      // Remove if already exists (to update timestamp)
      items = items.filter(i => i._id !== item._id || i.itemType !== itemType);
      
      // Add new item to beginning
      items.unshift(viewedItem);
      
      // Keep only 12 items
      items = items.slice(0, 12);
      
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(items));
      
      // Navigate to item details page
      navigate(`/${itemType}/${item._id}`);
    } catch (error) {
      console.error('Failed to save to recently viewed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader
        searchType={searchType}
        onSearchTypeChange={handleSearchTypeChange}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        showMap={showMap}
        onToggleMap={() => setShowMap(!showMap)}
        onOpenFilters={() => setShowFilters(true)}
        resultsCount={listings.length}
        location={currentLocation}
        aiSuggestions={aiSuggestions}
        onApplyAiSuggestion={applyAiSuggestion}
        searchExamples={searchExamples}
        onExampleClick={(example) => {
          setSearchTerm(example);
          handleSearch();
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {showMap ? (
          <MapView items={listings} searchType={searchType} location={currentLocation} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-medium text-gray-900">{listings.length}</span> {searchType === 'all' ? 'items' : searchType}
                {searchTerm && ` matching "${searchTerm}"`}
                {searchType === 'all' && ' across all categories'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-3">
              {listings.map((item, index) => {
                const commonProps = {
                  key: item._id,
                  onClick: () => addToRecentlyViewed(item, item.itemType)
                };

                switch(item.itemType) {
                  case 'services':
                    return <ServiceItem {...commonProps} service={item} />;
                  case 'helpers':
                    return <HelperItem {...commonProps} helper={item} />;
                  case 'events':
                    return <EventItem {...commonProps} event={item} />;
                  default:
                    return <ListingItem {...commonProps} listing={item} />;
                }
              })}
            </div>

            {showMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    const startIndex = listings.length;
                    const urlParams = new URLSearchParams(location.search);
                    urlParams.set('startIndex', startIndex);
                    navigate(`/search?${urlParams.toString()}`);
                  }}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md font-medium transition-all duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {searchType === 'all' ? 'items' : searchType} found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search filters or search for a different location
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-300"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </main>

      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        searchType={searchType}
        selectedSubType={selectedSubType}
        onSubTypeChange={setSelectedSubType}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => {
          handleSearch();
          setShowFilters(false);
        }}
        onClear={clearFilters}
        resultsCount={listings.length}
        recentSearches={recentSearches}
        onRecentSearchClick={(search) => {
          setSearchTerm(search.params.searchTerm || '');
          setSearchType(search.params.searchType || 'all');
          setSelectedSubType(search.params.selectedSubType || 'all');
          setFilters(search.params);
          handleSearch();
        }}
      />
    </div>
  );
};

export default Search;