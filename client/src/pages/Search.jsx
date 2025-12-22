// src/pages/Search.jsx
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
  SparklesIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";
import {
  getSearchUrl,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory as clearSearchHistoryUtil,
  SEARCH_TYPE_CONFIG,
  extractFiltersFromQuery
} from "../utils/searchUtils";

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 10;
const DEFAULT_LISTING_LIMIT = 12;

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchType, setSearchType] = useState('properties');
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
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
  const [searchHistory, setSearchHistory] = useState(getSearchHistory());

  const propertyTypes = [
    { value: 'all', label: 'All Types', icon: <HomeIcon className="w-5 h-5" /> },
    { value: 'rent', label: 'For Rent', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
    { value: 'sale', label: 'For Sale', icon: <TagIcon className="w-5 h-5" /> },
    { value: 'office', label: 'Office', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
    { value: 'land', label: 'Land', icon: <MapIcon className="w-5 h-5" /> },
    { value: 'guesthouse', label: 'Guest House', icon: <UserGroupIcon className="w-5 h-5" /> }
  ];

  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: <WrenchIcon className="w-5 h-5" /> },
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'moving', label: 'Moving', icon: '🚚' },
    { value: 'landscaping', label: 'Landscaping', icon: '🌿' },
    { value: 'catering', label: 'Catering', icon: '🍳' }
  ];

  const helperTypes = [
    { value: 'all', label: 'All Helpers', icon: <UserIcon className="w-5 h-5" /> },
    { value: 'domestic', label: 'General Help', icon: '👨‍💼' },
    { value: 'errand', label: 'Errand Runner', icon: '🛒' },
    { value: 'tutor', label: 'Tutor', icon: '📚' },
    { value: 'chef', label: 'Chef', icon: '👨‍🍳' },
    { value: 'maid', label: 'Maid', icon: '🧹' }
  ];

  const eventTypes = [
    { value: 'all', label: 'All Events', icon: <CalendarIcon className="w-5 h-5" /> },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'art', label: 'Art & Culture', icon: '🎨' },
    { value: 'community', label: 'Community', icon: '👥' },
    { value: 'food', label: 'Food & Drink', icon: '🍔' }
  ];

  const getCurrentTypes = () => {
    switch (searchType) {
      case 'services': return serviceTypes;
      case 'helpers': return helperTypes;
      case 'events': return eventTypes;
      default: return propertyTypes;
    }
  };

  const amenities = [
    { 
      category: 'Essentials',
      items: [
        { id: 'wifi', label: 'WiFi', icon: '📶' },
        { id: 'parking', label: 'Parking', icon: '🚗' },
        { id: 'aircon', label: 'Air Conditioning', icon: '❄️' }
      ]
    },
    {
      category: 'Features',
      items: [
        { id: 'pool', label: 'Pool', icon: '🏊' },
        { id: 'gym', label: 'Gym', icon: '💪' },
        { id: 'view', label: 'Great View', icon: '🌄' }
      ]
    },
    {
      category: 'Living',
      items: [
        { id: 'furnished', label: 'Furnished', icon: '🛋️' },
        { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
        { id: 'laundry', label: 'Laundry', icon: '🧺' }
      ]
    },
    {
      category: 'Rules',
      items: [
        { id: 'pets', label: 'Pets Allowed', icon: '🐾' },
        { id: 'security', label: 'Security', icon: '🔒' }
      ]
    },
    {
      category: 'Deals',
      items: [
        { id: 'offer', label: 'Special Offer', icon: '🎁' },
        { id: 'breakfast', label: 'Breakfast Included', icon: '🍳' }
      ]
    }
  ];

  // Initialize from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermParam = urlParams.get('searchTerm');
    const typeParam = urlParams.get('type');
    
    const newSidebarData = { ...sidebarData };
    
    if (searchTermParam) {
      newSidebarData.searchTerm = searchTermParam;
    }
    
    if (typeParam && ['properties', 'services', 'helpers', 'events'].includes(typeParam)) {
      setSearchType(typeParam);
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
      
      // Determine search type based on keywords
      let suggestedType = searchType;
      const query = sidebarData.searchTerm.toLowerCase();
      
      if (query.includes('service') || query.includes('clean') || query.includes('repair')) {
        suggestedType = 'services';
      } else if (query.includes('helper') || query.includes('chef') || query.includes('tutor')) {
        suggestedType = 'helpers';
      } else if (query.includes('event') || query.includes('festival') || query.includes('concert')) {
        suggestedType = 'events';
      }
      
      setSmartFilters(extractedFilters);
      
      if (Object.keys(extractedFilters).length > 0 || suggestedType !== searchType) {
        setAiSuggestions({
          searchTerm: sidebarData.searchTerm,
          filters: extractedFilters,
          suggestedType,
          applied: false
        });
      } else {
        setAiSuggestions(null);
      }
      
      setIsAnalyzing(false);
    };

    const timer = setTimeout(analyzeQuery, 600);
    return () => clearTimeout(timer);
  }, [sidebarData.searchTerm, searchType]);

  // Fetch data
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      if (!urlParams.toString()) return;
      
      try {
        setLoading(true);
        
        const endpoint = SEARCH_TYPE_CONFIG[searchType]?.endpoint || '/api/listing/get';
        const res = await fetch(`${endpoint}?${urlParams.toString()}`);
        const data = await res.json();
        
        // Add type to each item
        const typedData = data.map(item => ({
          ...item,
          itemType: searchType,
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
  }, [location.search, searchType]);

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
        type: searchType
      };
      
      searches.unshift(newSearch);
      
      // Keep only recent searches
      const limitedSearches = searches.slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limitedSearches));
      setRecentSearches(limitedSearches);
      
      // Also save to general search history
      saveSearchHistory(params.searchTerm, searchType, params);
      setSearchHistory(getSearchHistory());
      
      return limitedSearches;
    } catch (error) {
      console.error('Failed to save recent search:', error);
      return [];
    }
  }, [searchType]);

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
    
    // Merge smart filters with sidebar data
    const allFilters = { ...sidebarData, ...smartFilters };
    
    const urlParams = new URLSearchParams();
    
    // Include all non-default values
    Object.entries(allFilters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== 0 && value !== 'all') {
        urlParams.set(key, value.toString());
      }
    });

    // Add search type
    urlParams.set('type', searchType);
    
    // Save to recent searches
    saveRecentSearch(allFilters);
    
    // Navigate
    navigate(`/search?${urlParams.toString()}`);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestions) {
      const newData = {
        ...sidebarData,
        ...aiSuggestions.filters
      };
      
      if (aiSuggestions.suggestedType !== searchType) {
        setSearchType(aiSuggestions.suggestedType);
      }
      
      setSidebarData(newData);
      setAiSuggestions(prev => ({ ...prev, applied: true }));
      setSmartFilters(aiSuggestions.filters);
    }
  };

  const clearFilters = () => {
    setSidebarData({
      searchTerm: '',
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
  };

  const clearSearchHistory = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
    clearSearchHistoryUtil();
    setSearchHistory([]);
  };

  const handleRecentSearchClick = (search) => {
    const newData = { ...sidebarData, ...search.params };
    setSidebarData(newData);
    
    if (search.type && search.type !== searchType) {
      setSearchType(search.type);
    }
    
    const urlParams = new URLSearchParams();
    Object.entries(search.params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    
    if (search.type) {
      urlParams.set('type', search.type);
    }
    
    navigate(`/search?${urlParams.toString()}`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="w-6 h-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Smart Search</h1>
        </div>
        <p className="text-gray-600">
          Search across properties, services, helpers, and events with AI-powered suggestions
        </p>
      </div>

      {/* Search type selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['properties', 'services', 'helpers', 'events'].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${searchType === type
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span className="text-lg">{SEARCH_TYPE_CONFIG[type]?.icon}</span>
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              {searchType === type && (
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search sidebar */}
        <div className={`lg:w-80 lg:sticky lg:top-8 h-fit ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Smart Filters</h2>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* AI Suggestions */}
              {aiSuggestions && !aiSuggestions.applied && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-start gap-3">
                    <LightBulbIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-purple-800">AI Suggestions</h3>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Smart Search
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">
                        We found these patterns in your search:
                      </p>
                      <div className="space-y-2">
                        {aiSuggestions.suggestedType !== searchType && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Type:</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                              {aiSuggestions.suggestedType}
                            </span>
                          </div>
                        )}
                        {Object.entries(aiSuggestions.filters).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{key}:</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                              {value.toString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={applyAiSuggestion}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-sm transition-all"
                      >
                        Apply Smart Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">
                    What are you looking for?
                  </label>
                  {isAnalyzing && (
                    <span className="text-xs text-purple-600 animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="searchTerm"
                    value={sidebarData.searchTerm}
                    onChange={handleChange}
                    placeholder="Try '2 bed apartment with pool in Cape Town' or 'Cleaning service for office'"
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {sidebarData.searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSidebarData(prev => ({ ...prev, searchTerm: '' }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Try natural language search:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '3 bedroom apartment with pool',
                      'Cleaning service this weekend',
                      'Personal chef for dinner party',
                      'Music festival tickets'
                    ].map((example, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSidebarData(prev => ({ ...prev, searchTerm: example }))}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Type dropdown */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Type
                </label>
                <Menu as="div" className="relative">
                  <Menu.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-3">
                      {getCurrentTypes().find(t => t.value === sidebarData.type)?.icon}
                      <span>{getCurrentTypes().find(t => t.value === sidebarData.type)?.label}</span>
                    </div>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  </Menu.Button>
                  <Menu.Items className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1 max-h-60 overflow-auto">
                    {getCurrentTypes().map((type) => (
                      <Menu.Item key={type.value}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => setSidebarData(prev => ({ ...prev, type: type.value }))}
                            className={`flex items-center gap-3 w-full px-4 py-2 text-left ${active ? 'bg-gray-100' : ''}`}
                          >
                            <span className="text-lg">{type.icon}</span>
                            <span>{type.label}</span>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priceMin" className="block text-xs text-gray-500 mb-1">Min</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center">R</span>
                      <input
                        type="number"
                        id="priceMin"
                        value={sidebarData.priceMin}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="priceMax" className="block text-xs text-gray-500 mb-1">Max</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center">R</span>
                      <input
                        type="number"
                        id="priceMax"
                        value={sidebarData.priceMax}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Any"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bedrooms - only for properties */}
              {searchType === 'properties' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedroomsMin" className="block text-xs text-gray-500 mb-1">Min</label>
                      <input
                        type="number"
                        id="bedroomsMin"
                        value={sidebarData.bedroomsMin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="bedroomsMax" className="block text-xs text-gray-500 mb-1">Max</label>
                      <input
                        type="number"
                        id="bedroomsMax"
                        value={sidebarData.bedroomsMax}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Any"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities - only for properties */}
              {searchType === 'properties' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Amenities</label>
                    {Object.keys(smartFilters).some(key => 
                      ['wifi', 'parking', 'pool', 'furnished', 'pets', 'gym', 'view', 'security'].includes(key)
                    ) && (
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        AI Detected
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {amenities.map((category) => (
                      <div key={category.category}>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          {category.category}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {category.items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={item.id}
                                checked={sidebarData[item.id] || smartFilters[item.id] === true}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <label htmlFor={item.id} className="ml-2 text-sm flex items-center gap-1">
                                <span>{item.icon}</span>
                                {item.label}
                                {smartFilters[item.id] && (
                                  <span className="text-xs text-purple-600 ml-1">•</span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </form>
          </div>

          {/* Recent searches panel */}
          {(recentSearches.length > 0 || searchHistory.length > 0) && (
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  Recent Searches
                </h3>
                <button
                  onClick={clearSearchHistory}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Clear all
                </button>
              </div>
              <ul className="space-y-3">
                {[...recentSearches, ...searchHistory.slice(0, 3)].slice(0, 5).map((search, i) => (
                  <li
                    key={i}
                    className="group p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-sm">{SEARCH_TYPE_CONFIG[search.type]?.icon || '🔍'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {search.params?.searchTerm || search.term || 'Search'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">
                            {search.type || 'all'}
                          </span>
                          {search.timestamp && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-400">
                                {new Date(search.timestamp).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 rotate-90 transition-opacity" />
                    </div>
                  </li>
                ))}
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
                {sidebarData.searchTerm ? `Results for "${sidebarData.searchTerm}"` : `All ${searchType}`}
              </h2>
              {listings.length > 0 && (
                <p className="text-gray-600 text-sm mt-1">
                  {listings.length} results • {searchType}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:border-gray-400 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {Object.keys(smartFilters).length > 0 && (
                <span className="ml-1 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Smart filter tags */}
          {Object.keys(smartFilters).length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Active Smart Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(smartFilters).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full text-sm"
                  >
                    <span className="font-medium">{key}:</span>
                    <span>{value.toString()}</span>
                  </span>
                ))}
                <button
                  onClick={() => setSmartFilters({})}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium px-3 py-1 hover:bg-white/50 rounded-full"
                >
                  Clear AI Filters
                </button>
              </div>
            </div>
          )}

          {/* Results count */}
          {!loading && listings.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-700">
                Showing <span className="font-bold text-gray-900">{listings.length}</span> {searchType}
                {sidebarData.searchTerm && (
                  <span> matching "<span className="font-semibold">{sidebarData.searchTerm}</span>"</span>
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
                  switch(item.itemType) {
                    case 'services':
                      return <ServiceItem key={item._id} service={item} />;
                    case 'helpers':
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
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No {searchType} found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {sidebarData.searchTerm ? (
                  `We couldn't find any ${searchType} matching "${sidebarData.searchTerm}". Try adjusting your search or try a different category.`
                ) : (
                  `No ${searchType} available with the current filters. Try adjusting your search criteria.`
                )}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setSearchType('properties')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Browse Properties
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;