import { useEffect, useState, } from 'react';
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
  WrenchIcon
} from '@heroicons/react/24/outline';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
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

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchExamples, setSearchExamples] = useState([
    'Beachfront villa in Cape Town',
    '3 bedroom apartment in Sandton',
    'Office space in Johannesburg CBD',
    'Pet-friendly home with garden',
    'Luxury penthouse with pool',
    'Cleaning service for office',
    'Personal chef for dinner party',
    'Weekend music festival tickets'
  ]);

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

  // Initialize search term from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermParam = urlParams.get('searchTerm');
    
    if (searchTermParam) {
      setSidebarData(prev => ({
        ...prev,
        searchTerm: searchTermParam
      }));
    }
  }, [location.search]);

  // Fetch listings when search params change
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch based on search type
        let endpoint = '';
        switch(searchType) {
          case 'services':
            endpoint = '/api/service/get';
            break;
          case 'helpers':
            endpoint = '/api/helper/get';
            break;
          case 'events':
            endpoint = '/api/event/get';
            break;
          default:
            endpoint = '/api/listing/get';
        }
        
        const res = await fetch(`${endpoint}?${urlParams.toString()}`);
        const data = await res.json();
        
        // Add type to each item
        const typedData = data.map(item => ({
          ...item,
          itemType: searchType,
          // Normalize price for all types
          price: item.price || item.regularPrice || 0
        }));
        
        setListings(typedData);
        setShowMore(typedData.length >= DEFAULT_LISTING_LIMIT);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (urlParams.toString()) {
      fetchData();
    }
  }, [location.search, searchType]);

  // AI analysis effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (sidebarData.searchTerm.length > 2) {
        const suggestions = await analyzeSearchTerm(sidebarData.searchTerm);
        setAiSuggestions(suggestions);
      } else {
        setAiSuggestions(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [sidebarData.searchTerm]);

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
      if (value && value !== 'all' && value !== false) {
        urlParams.set(key, value);
      }
    });

    const updatedSearches = saveRecentSearch(sidebarData);
    setRecentSearches(updatedSearches);
    navigate(`/search?${urlParams.toString()}`);
  };

  // AI analysis simulation
  const analyzeSearchTerm = async (term) => {
    if (term.length < 3) return null;
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const suggestions = { searchTerm: term, filters: {} };
    let hasSuggestion = false;

    const typePatterns = [
      { patterns: ['apartment', 'flat', 'studio', 'house'], type: 'properties' },
      { patterns: ['clean', 'service', 'maintain'], type: 'services' },
      { patterns: ['helper', 'chef', 'tutor', 'maid'], type: 'helpers' },
      { patterns: ['event', 'festival', 'concert', 'show'], type: 'events' }
    ];

    typePatterns.forEach(({ patterns, type }) => {
      if (patterns.some(p => term.toLowerCase().includes(p))) {
        suggestions.filters.type = type;
        hasSuggestion = true;
      }
    });

    const locationContexts = [
      { patterns: ['near beach', 'waterfront', 'ocean view'], filters: { view: true } },
      { patterns: ['city center', 'downtown'], filters: { furnished: true } },
      { patterns: ['secure estate', 'gated community'], filters: { security: true } }
    ];

    locationContexts.forEach(({ patterns, filters }) => {
      if (patterns.some(p => term.toLowerCase().includes(p))) {
        Object.assign(suggestions.filters, filters);
        hasSuggestion = true;
      }
    });

    const numberExtractors = [
      { 
        regex: /(\d+)\s*(bed|bedroom|beds|bd)/i, 
        handler: (num) => { suggestions.filters.bedroomsMin = num; }
      },
      {
        regex: /(under|below|up to|max)\s*(R|€|£|¥|₹|\$)?\s*(\d+[\d,]*)/i,
        handler: (num) => { suggestions.filters.priceMax = num; }
      }
    ];

    numberExtractors.forEach(({ regex, handler }) => {
      const match = term.match(regex);
      if (match) {
        const num = parseInt(match[3].replace(/,/g, ''));
        if (!isNaN(num)) {
          handler(num);
          hasSuggestion = true;
        }
      }
    });

    const amenityKeywords = [
      { patterns: ['wifi', 'internet'], key: 'wifi' },
      { patterns: ['parking', 'garage'], key: 'parking' },
      { patterns: ['pool', 'swimming'], key: 'pool' },
      { patterns: ['furnished'], key: 'furnished' },
      { patterns: ['pet friendly'], key: 'pets' },
      { patterns: ['gym', 'fitness'], key: 'gym' },
      { patterns: ['view', 'scenic'], key: 'view' }
    ];

    amenityKeywords.forEach(({ patterns, key }) => {
      if (patterns.some(p => new RegExp(p, 'i').test(term))) {
        suggestions.filters[key] = true;
        hasSuggestion = true;
      }
    });

    setIsAnalyzing(false);
    return hasSuggestion ? suggestions : null;
  };

  const applyAiSuggestion = () => {
    if (aiSuggestions) {
      setSidebarData(prev => ({
        ...prev,
        ...aiSuggestions.filters,
        searchTerm: aiSuggestions.searchTerm
      }));
      setAiSuggestions(prev => ({ ...prev, applied: true }));
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find exactly what you need</h1>
        <p className="text-gray-600">
          Search through properties, services, helpers, and events with our AI-powered search
        </p>
      </div>

      {/* Search type selector with horizontal scrolling */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex space-x-4 min-w-max">
          {['properties', 'services', 'helpers', 'events'].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                searchType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search sidebar */}
        <div className={`lg:w-80 lg:sticky lg:top-8 h-fit ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Search Filters</h2>
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
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <LightBulbIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-800">AI Suggestions</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on your search, we recommend:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(aiSuggestions.filters).map(([key, value]) => (
                          <span key={key} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {key}: {value.toString()}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={applyAiSuggestion}
                        className="mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Apply Suggestions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search input */}
              <div>
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                  What are you looking for?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="searchTerm"
                    value={sidebarData.searchTerm}
                    onChange={handleChange}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    placeholder="Try '2 bed apartment in Cape Town' or 'Cleaning service'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {sidebarData.searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSidebarData(prev => ({ ...prev, searchTerm: '' }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Search examples */}
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Try searching for:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchExamples.map((example, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSidebarData(prev => ({ ...prev, searchTerm: example }))}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
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
                  <Menu.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCurrentTypes().find(t => t.value === sidebarData.type)?.icon}
                      <span>{getCurrentTypes().find(t => t.value === sidebarData.type)?.label}</span>
                    </div>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  </Menu.Button>
                  <Menu.Items className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
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
                                checked={sidebarData[item.id]}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor={item.id} className="ml-2 text-sm flex items-center gap-1">
                                <span>{item.icon}</span>
                                {item.label}
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
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </form>
          </div>

          {/* Recent searches panel */}
          {recentSearches.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Recent Searches</h3>
                <button
                  onClick={() => {
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                    setRecentSearches([]);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
              <ul className="space-y-3">
                {recentSearches.map((search, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSidebarData(search.params);
                      const urlParams = new URLSearchParams();
                      Object.entries(search.params).forEach(([key, value]) => {
                        if (value) urlParams.set(key, value);
                      });
                      navigate(`/search?${urlParams.toString()}`);
                    }}
                  >
                    <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {search.params.searchTerm || 'Anywhere'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {Object.entries(search.params)
                          .filter(([k, v]) => k !== 'searchTerm' && v)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
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
            <h2 className="text-xl font-bold text-gray-900">
              {sidebarData.searchTerm ? `Results for "${sidebarData.searchTerm}"` : `All ${searchType}`}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Results count */}
          {!loading && listings.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-medium">{listings.length}</span> {searchType}
                {sidebarData.searchTerm && ` matching "${sidebarData.searchTerm}"`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
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
                    className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No {searchType} found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search filters or search for a different location
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;