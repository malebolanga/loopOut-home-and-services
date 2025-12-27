import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import {
  HomeIcon,
  CurrencyDollarIcon,
  TagIcon,
  BuildingOfficeIcon,
  MapIcon,
  UserGroupIcon,
  ChevronDownIcon,
  XMarkIcon,
  ClockIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  CalendarIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  SparklesIcon,
  FireIcon,
  ComputerDesktopIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 10;
const DEFAULT_LISTING_LIMIT = 12;

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Add fade-in animation state
  const [isVisible, setIsVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('stays');
  const [searchType, setSearchType] = useState('properties');
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    type: 'all',
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
    priceMin: '',
    priceMax: '',
    breakfast: false,
    pets: false,
    security: false,
    aircon: false,
    gym: false,
    view: false,
    kitchen: false,
    laundry: false
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [smartFilters, setSmartFilters] = useState({});
  const [showSearchBox, setShowSearchBox] = useState(true);

  // Categories configuration from first code
  const categories = [
    {
      id: 'stays',
      label: 'Stays & Properties',
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'Rentals, sales, land'
    },
    {
      id: 'experiences',
      label: 'Services & Experiences',
      icon: <FireIcon className="w-5 h-5" />,
      description: 'Cleaning, maintenance, moving'
    },
    {
      id: 'online',
      label: 'Online Helpers',
      icon: <ComputerDesktopIcon className="w-5 h-5" />,
      description: 'Helpers, tutors, chefs'
    },
    {
      id: 'events',
      label: 'Events',
      icon: <TicketIcon className="w-5 h-5" />,
      description: 'Concerts, festivals, meetups'
    }
  ];

  // Get types based on selected category from first code
  const getTypesByCategory = () => {
    switch (selectedCategory) {
      case 'stays':
        return [
          { id: "rent", label: "Room/Home Rent", emoji: "🏠", description: "Monthly rental" },
          { id: "over", label: "Guest House", emoji: "🛌", description: "Nightly stays" },
          { id: "office", label: "Hourly Stay", emoji: "🕒", description: "Per hour accommodation" },
          { id: "land", label: "Land", emoji: "🌳", description: "Plot for sale" },
          { id: "sale", label: "For Sale", emoji: "💰", description: "Property sale" },
        ];
      case 'experiences':
        return [
          { id: "cleaning", label: "Cleaning", emoji: "🧹", description: "Home & office cleaning" },
          { id: "maintenance", label: "Maintenance", emoji: "🔧", description: "Repairs & fixes" },
          { id: "moving", label: "Moving", emoji: "🚚", description: "Relocation services" },
          { id: "landscaping", label: "Landscaping", emoji: "🌿", description: "Garden & yard work" },
          { id: "catering", label: "Catering", emoji: "🍽️", description: "Food & catering" },
          { id: "daycare", label: "Day Care", emoji: "👶", description: "Child care services" },
          { id: "schoolTransport", label: "Transport", emoji: "🚌", description: "School transport" },
          { id: "other", label: "Other", emoji: "✨", description: "Other services" },
        ];
      case 'online':
        return [
          { id: "domestic", label: "Domestic Helper", emoji: "🧹", description: "Cleaning, laundry, chores" },
          { id: "errand", label: "Errand Runner", emoji: "🏃", description: "Shopping, deliveries, tasks" },
          { id: "tutor", label: "Private Tutor", emoji: "📚", description: "Academic tutoring" },
          { id: "chef", label: "Private Chef", emoji: "👨‍🍳", description: "Meal preparation" },
          { id: "beauty", label: "Beauty Specialist", emoji: "💅", description: "Hair, nails, makeup" },
          { id: "tattoo", label: "Tattoo Artist", emoji: "🖌️", description: "Tattoo design" },
          { id: "barber", label: "Barber", emoji: "✂️", description: "Haircuts, grooming" },
          { id: "photography", label: "Photographer", emoji: "📷", description: "Photo sessions" },
          { id: "baker", label: "Baker", emoji: "🍰", description: "Custom baked goods" },
        ];
      case 'events':
        return [
          { id: "music", label: "Music", emoji: "🎵", description: "Concerts, festivals" },
          { id: "sports", label: "Sports", emoji: "⚽", description: "Games, tournaments" },
          { id: "art", label: "Art & Culture", emoji: "🎨", description: "Exhibitions, shows" },
          { id: "community", label: "Community", emoji: "🧑‍🤝‍🧑", description: "Meetups, gatherings" },
          { id: "food", label: "Food & Drink", emoji: "🍔", description: "Food festivals, tastings" },
        ];
      default:
        return [];
    }
  };

  // Map old search types to new categories for backward compatibility
  const getCategoryFromOldType = (oldType) => {
    switch (oldType) {
      case 'properties': return 'stays';
      case 'services': return 'experiences';
      case 'helpers': return 'online';
      case 'events': return 'events';
      default: return 'stays';
    }
  };

  const getOldTypeFromCategory = (category) => {
    switch (category) {
      case 'stays': return 'properties';
      case 'experiences': return 'services';
      case 'online': return 'helpers';
      case 'events': return 'events';
      default: return 'properties';
    }
  };

  // Initialize fade-in effect
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [location.search]);

  // Initialize from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermParam = urlParams.get('searchTerm');
    const categoryParam = urlParams.get('category');
    const typeParam = urlParams.get('type');
    const locationParam = urlParams.get('location');
    const checkInParam = urlParams.get('checkIn');
    const checkOutParam = urlParams.get('checkOut');
    const guestsParam = urlParams.get('guests');
    
    const newSidebarData = { ...sidebarData };
    
    if (searchTermParam) {
      newSidebarData.searchTerm = searchTermParam;
    }
    
    if (locationParam) {
      newSidebarData.location = locationParam;
    }
    
    if (checkInParam) {
      newSidebarData.checkIn = checkInParam;
    }
    
    if (checkOutParam) {
      newSidebarData.checkOut = checkOutParam;
    }
    
    if (guestsParam) {
      newSidebarData.guests = parseInt(guestsParam);
    }
    
    // Handle old type param for backward compatibility
    if (typeParam) {
      const oldType = typeParam;
      const category = getCategoryFromOldType(oldType);
      setSelectedCategory(category);
      
      // Try to map old type to new type
      const types = getTypesByCategory();
      const matchedType = types.find(t => t.id === oldType);
      if (matchedType) {
        setSearchType(matchedType.id);
      }
    }
    
    if (categoryParam && categories.map(c => c.id).includes(categoryParam)) {
      setSelectedCategory(categoryParam);
      
      // Set default type for category
      const types = getTypesByCategory();
      if (types.length > 0) {
        const urlType = urlParams.get('subType') || types[0].id;
        const matchedType = types.find(t => t.id === urlType);
        if (matchedType) {
          setSearchType(matchedType.id);
        } else {
          setSearchType(types[0].id);
        }
      }
    }
    
    // Set all filters from URL
    urlParams.forEach((value, key) => {
      if (key in newSidebarData) {
        if (key === 'parking' || key === 'furnished' || key === 'wifi' || 
            key === 'pool' || key === 'offer' || key === 'breakfast' || 
            key === 'pets' || key === 'security' || key === 'aircon' || 
            key === 'gym' || key === 'view' || key === 'kitchen' || 
            key === 'laundry') {
          newSidebarData[key] = value === 'true';
        } else {
          newSidebarData[key] = value;
        }
      }
    });
    
    setSidebarData(newSidebarData);
  }, [location.search]);

  // Update search type when category changes
  useEffect(() => {
    const types = getTypesByCategory();
    if (types.length > 0 && !types.find(t => t.id === searchType)) {
      setSearchType(types[0].id);
    }
  }, [selectedCategory]);

  // Smart search analysis
  useEffect(() => {
    const analyzeQuery = async () => {
      if (sidebarData.searchTerm.length < 3) {
        setAiSuggestions(null);
        return;
      }

      setIsAnalyzing(true);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const extractedFilters = extractFiltersFromQuery(sidebarData.searchTerm);
      setSmartFilters(extractedFilters);
      
      if (Object.keys(extractedFilters).length > 0) {
        setAiSuggestions({
          searchTerm: sidebarData.searchTerm,
          filters: extractedFilters,
          applied: false
        });
      } else {
        setAiSuggestions(null);
      }
      
      setIsAnalyzing(false);
    };

    const timer = setTimeout(analyzeQuery, 600);
    return () => clearTimeout(timer);
  }, [sidebarData.searchTerm]);

  // Extract filters from query (simplified version)
  const extractFiltersFromQuery = (query) => {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    // Property type detection
    if (lowerQuery.includes('apartment') || lowerQuery.includes('flat')) {
      filters.type = 'rent';
    }
    if (lowerQuery.includes('house') || lowerQuery.includes('villa')) {
      filters.type = 'sale';
    }

    // Bedroom detection
    const bedroomMatch = lowerQuery.match(/(\d+)\s*(?:bed|bedroom|beds)/);
    if (bedroomMatch) {
      filters.bedroomsMin = parseInt(bedroomMatch[1]);
    }

    // Price detection
    const priceMatch = lowerQuery.match(/(?:under|below|up to|max)\s*(?:R|€|£|¥|₹|\$)?\s*(\d+[\d,]*)/);
    if (priceMatch) {
      filters.priceMax = parseInt(priceMatch[1].replace(/,/g, ''));
    }

    // Amenity detection
    const amenities = [
      { patterns: ['wifi', 'internet'], key: 'wifi' },
      { patterns: ['parking', 'garage'], key: 'parking' },
      { patterns: ['pool', 'swimming'], key: 'pool' },
      { patterns: ['furnished'], key: 'furnished' },
      { patterns: ['pet', 'pets'], key: 'pets' },
      { patterns: ['gym', 'fitness'], key: 'gym' },
      { patterns: ['view', 'scenic'], key: 'view' },
      { patterns: ['secure', 'security'], key: 'security' }
    ];

    amenities.forEach(({ patterns, key }) => {
      if (patterns.some(p => lowerQuery.includes(p))) {
        filters[key] = true;
      }
    });

    return filters;
  };

  // Fetch data
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      if (!urlParams.toString()) return;
      
      try {
        setLoading(true);
        
        // Convert to old type for API compatibility
        const oldType = getOldTypeFromCategory(selectedCategory);
        const endpoint = getEndpointForType(oldType);
        
        // Add category and type to params
        urlParams.set('category', selectedCategory);
        urlParams.set('subType', searchType);
        
        const res = await fetch(`${endpoint}?${urlParams.toString()}`);
        const data = await res.json();
        
        // Add type to each item
        const typedData = data.map(item => ({
          ...item,
          itemType: oldType,
          category: selectedCategory,
          subType: searchType,
          price: item.price || item.regularPrice || item.rate || item.ticketPrice || 0
        }));
        
        setListings(typedData);
        setShowMore(typedData.length >= DEFAULT_LISTING_LIMIT);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search, selectedCategory, searchType]);

  const getEndpointForType = (type) => {
    switch(type) {
      case 'services': return '/api/service/get';
      case 'helpers': return '/api/helper/get';
      case 'events': return '/api/event/get';
      default: return '/api/listing/get';
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

  // Save to recent searches
  const saveRecentSearch = useCallback((params) => {
    try {
      const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
      const existingIndex = searches.findIndex(
        s => JSON.stringify(s.params) === JSON.stringify(params)
      );
      
      if (existingIndex > -1) {
        searches.splice(existingIndex, 1);
      }
      
      const newSearch = {
        params,
        timestamp: new Date().toISOString(),
        category: selectedCategory,
        type: searchType
      };
      
      searches.unshift(newSearch);
      
      // Keep only recent searches
      const limitedSearches = searches.slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limitedSearches));
      setRecentSearches(limitedSearches);
      
      return limitedSearches;
    } catch (error) {
      console.error('Failed to save recent search:', error);
      return [];
    }
  }, [selectedCategory, searchType]);

  // Form handlers
  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    setSidebarData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const urlParams = new URLSearchParams();
    
    // Include all non-default values
    Object.entries(sidebarData).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== 0 && value !== 'all') {
        urlParams.set(key, value.toString());
      }
    });

    // Add category and type
    urlParams.set('category', selectedCategory);
    urlParams.set('subType', searchType);
    
    // For backward compatibility, also add old type
    urlParams.set('type', getOldTypeFromCategory(selectedCategory));
    
    // Save to recent searches
    saveRecentSearch(sidebarData);
    
    // Navigate
    navigate(`/search?${urlParams.toString()}`);
    setShowSearchBox(false);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestions) {
      const newData = {
        ...sidebarData,
        ...aiSuggestions.filters
      };
      setSidebarData(newData);
      setAiSuggestions(prev => ({ ...prev, applied: true }));
      setSmartFilters(aiSuggestions.filters);
    }
  };

  const clearFilters = () => {
    setSidebarData({
      searchTerm: '',
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      type: 'all',
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
      priceMin: '',
      priceMax: '',
      breakfast: false,
      pets: false,
      security: false,
      aircon: false,
      gym: false,
      view: false,
      kitchen: false,
      laundry: false
    });
    setSmartFilters({});
    setAiSuggestions(null);
    setSelectedCategory('stays');
    setSearchType('rent');
    setShowSearchBox(true);
  };

  const clearSearchHistory = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
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

  const currentTypes = getTypesByCategory();

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Hero Section with Search Box */}
      {showSearchBox && (
        <div className="relative bg-gradient-to-r from-rose-50 to-blue-50 rounded-3xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-blue-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-gray-900">Find exactly what you need</h1>
              <p className="text-xl text-gray-600">Search across properties, services, helpers, and events</p>
            </div>

            {/* Main Search Box */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center">
                  {/* Location */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Where?</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="location"
                        value={sidebarData.location}
                        onChange={handleChange}
                        placeholder="Search destinations"
                        className="w-full text-lg border-none focus:ring-0 outline-none placeholder-gray-500"
                      />
                      <MapPinIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                  {/* Search Term */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">What?</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="searchTerm"
                        value={sidebarData.searchTerm}
                        onChange={handleChange}
                        placeholder="Try '2 bed apartment' or 'Cleaning service'"
                        className="w-full text-lg border-none focus:ring-0 outline-none placeholder-gray-500"
                      />
                      <MagnifyingGlassIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="p-4">
                    <button
                      type="submit"
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* Clear All Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Suggestions */}
        {aiSuggestions && !aiSuggestions.applied && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 animate-fadeIn">
            <div className="flex items-start gap-3">
              <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-blue-800">AI Suggestions</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Smart Search
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  We found these patterns in your search:
                </p>
                <div className="space-y-2">
                  {Object.entries(aiSuggestions.filters).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{key}:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {value.toString()}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm transition-all"
                >
                  Apply Smart Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Smart filter tags */}
        {Object.keys(smartFilters).length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Active Smart Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(smartFilters).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-sm"
                >
                  <span className="font-medium">{key}:</span>
                  <span>{value.toString()}</span>
                </span>
              ))}
              <button
                onClick={() => setSmartFilters({})}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-white/50 rounded-full"
              >
                Clear AI Filters
              </button>
            </div>
          </div>
        )}

        {/* Category selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <span className="w-5 h-5">{category.icon}</span>
                <span className="font-medium">{category.label}</span>
                {selectedCategory === category.id && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Type selector */}
        {currentTypes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select {selectedCategory} Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSearchType(type.id)}
                  className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg transition-all min-w-[120px] ${searchType === type.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <span className="text-2xl mb-1">{type.emoji}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">{type.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 lg:sticky lg:top-8 h-fit ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Search input */}
              <div className="mb-6">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-2">
                  Search term
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="searchTerm"
                    value={sidebarData.searchTerm}
                    onChange={handleChange}
                    placeholder="Search within results..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R</span>
                      <input
                        type="number"
                        id="priceMin"
                        value={sidebarData.priceMin}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Min"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R</span>
                      <input
                        type="number"
                        id="priceMax"
                        value={sidebarData.priceMax}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bedrooms - only for stays */}
              {selectedCategory === 'stays' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        id="bedroomsMin"
                        value={sidebarData.bedroomsMin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        id="bedroomsMax"
                        value={sidebarData.bedroomsMax}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities - only for stays */}
              {selectedCategory === 'stays' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Amenities</label>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'wifi', label: 'WiFi', icon: '📶' },
                      { id: 'parking', label: 'Parking', icon: '🚗' },
                      { id: 'aircon', label: 'Air Conditioning', icon: '❄️' },
                      { id: 'pool', label: 'Pool', icon: '🏊' },
                      { id: 'gym', label: 'Gym', icon: '💪' },
                      { id: 'furnished', label: 'Furnished', icon: '🛋️' },
                      { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
                      { id: 'laundry', label: 'Laundry', icon: '🧺' },
                      { id: 'pets', label: 'Pets Allowed', icon: '🐾' },
                      { id: 'security', label: 'Security', icon: '🔒' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={item.id}
                          checked={sidebarData[item.id] || smartFilters[item.id] === true}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={item.id} className="ml-2 text-sm flex items-center gap-1">
                          <span>{item.icon}</span>
                          {item.label}
                          {smartFilters[item.id] && (
                            <span className="text-xs text-blue-600 ml-1">•</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Apply Filters
                </button>

                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>

            {/* Recent searches panel */}
            {recentSearches.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="space-y-3">
                  {recentSearches.map((search, i) => {
                    const searchTerm = search?.params?.searchTerm || 
                                    search?.params?.location || 
                                    'Search';
                    
                    const searchCategory = search?.category || 'all';
                    const searchType = search?.type || 'all';
                    const searchParams = search?.params || {};

                    return (
                      <li
                        key={i}
                        className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                        onClick={() => {
                          if (!searchParams || typeof searchParams !== 'object') return;

                          const newData = { ...sidebarData, ...searchParams };
                          setSidebarData(newData);
                          
                          if (searchCategory && searchCategory !== 'all') {
                            setSelectedCategory(searchCategory);
                          }
                          
                          if (searchType && searchType !== 'all') {
                            setSearchType(searchType);
                          }
                          
                          const urlParams = new URLSearchParams();
                          
                          Object.entries(searchParams).forEach(([key, value]) => {
                            if (value !== null && value !== undefined && value !== '') {
                              urlParams.set(key, value.toString());
                            }
                          });
                          
                          if (searchCategory && searchCategory !== 'all') {
                            urlParams.set('category', searchCategory);
                          }
                          
                          if (searchType && searchType !== 'all') {
                            urlParams.set('subType', searchType);
                          }
                          
                          const urlString = urlParams.toString();
                          navigate(`/search?${urlString}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                            <span className="text-sm">
                              {categories.find(c => c.id === searchCategory)?.icon || '🔍'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {searchTerm}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 capitalize">
                                {categories.find(c => c.id === searchCategory)?.label || searchCategory}
                              </span>
                              {search?.timestamp && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(search.timestamp).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronDownIcon className="w-5 h-5 text-gray-400 rotate-90" />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {/* Mobile filters toggle */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {sidebarData.searchTerm ? `Results for "${sidebarData.searchTerm}"` : `${currentTypes.find(t => t.id === searchType)?.label || categories.find(c => c.id === selectedCategory)?.label}`}
                </h2>
                {listings.length > 0 && (
                  <p className="text-gray-600 text-sm mt-1">
                    {listings.length} results • {selectedCategory}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:border-gray-400 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Results count */}
            {!loading && listings.length > 0 && (
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-700">
                  Showing <span className="font-bold text-gray-900">{listings.length}</span> {currentTypes.find(t => t.id === searchType)?.label?.toLowerCase() || selectedCategory}
                  {sidebarData.searchTerm && (
                    <span> for "<span className="font-semibold">{sidebarData.searchTerm}</span>"</span>
                  )}
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                {/* Results grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => {
                    switch(item.category) {
                      case 'experiences':
                        return <ServiceItem key={item._id} service={item} />;
                      case 'online':
                        return <HelperItem key={item._id} helper={item} />;
                      case 'events':
                        return <EventItem key={item._id} event={item} />;
                      default:
                        return <ListingItem key={item._id} listing={item} />;
                    }
                  })}
                </div>

                {/* Load more button */}
                {showMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => {
                        const startIndex = listings.length;
                        const urlParams = new URLSearchParams(location.search);
                        urlParams.set('startIndex', startIndex);
                        navigate(`/search?${urlParams.toString()}`);
                      }}
                      className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md font-medium transition-all"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No {currentTypes.find(t => t.id === searchType)?.label?.toLowerCase() || selectedCategory} found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {sidebarData.searchTerm ? (
                    `We couldn't find any ${currentTypes.find(t => t.id === searchType)?.label?.toLowerCase() || selectedCategory} matching "${sidebarData.searchTerm}". Try adjusting your search or try a different category.`
                  ) : (
                    `No ${currentTypes.find(t => t.id === searchType)?.label?.toLowerCase() || selectedCategory} available with the current filters. Try adjusting your search criteria.`
                  )}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setShowSearchBox(true)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  >
                    New Search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;