import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  MapIcon,
  ChevronDownIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import "../styles/ListingDetails.scss";
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 10;
const DEFAULT_LISTING_LIMIT = 12;

// Search types configuration
const SEARCH_TYPES = [
  { 
    id: 'properties', 
    label: 'Properties', 
    icon: HomeIcon,
    description: 'Homes, apartments, offices, land',
    color: 'bg-blue-100 text-blue-800',
    endpoint: '/api/listing/search'
  },
  { 
    id: 'services', 
    label: 'Services', 
    icon: SparklesIcon,
    description: 'Cleaning, maintenance, moving, etc.',
    color: 'bg-green-100 text-green-800',
    endpoint: '/api/service/search'
  },
  { 
    id: 'helpers', 
    label: 'Helpers', 
    icon: UserGroupIcon,
    description: 'Tutors, caregivers, handymen, etc.',
    color: 'bg-purple-100 text-purple-800',
    endpoint: '/api/helper/search'
  },
  { 
    id: 'events', 
    label: 'Events', 
    icon: CalendarDaysIcon,
    description: 'Local events and activities',
    color: 'bg-amber-100 text-amber-800',
    endpoint: '/api/event/search'
  }
];

// AI Search Suggestion Component
const AISearchSuggestions = ({ query, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAISuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/ai/search-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            types: ['properties', 'services', 'helpers', 'events']
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        // Fallback to basic suggestions
        setSuggestions(generateFallbackSuggestions(query));
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAISuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const generateFallbackSuggestions = (query) => {
    const baseSuggestions = [
      { text: `Houses for ${query}`, type: 'properties', icon: '🏠' },
      { text: `Services in ${query}`, type: 'services', icon: '🔧' },
      { text: `Helpers near ${query}`, type: 'helpers', icon: '👥' },
      { text: `Events at ${query}`, type: 'events', icon: '🎉' },
      { text: `Properties with ${query}`, type: 'properties', icon: '🏡' },
    ];
    
    return baseSuggestions.map(suggestion => ({
      ...suggestion,
      confidence: 0.8,
      category: suggestion.type
    }));
  };

  if (!query || query.length < 2 || (suggestions.length === 0 && !loading)) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
          </div>
          <span className="text-xs text-gray-500">Powered by AI</span>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        ) : suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3 group"
          >
            <span className="text-lg flex-shrink-0">{suggestion.icon || '💡'}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{suggestion.text}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                  {suggestion.category}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}% match
                </span>
              </div>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Quick Filters Component
const QuickFilters = ({ searchType, onFilterClick }) => {
  const filters = {
    properties: [
      { label: 'Pet friendly', icon: '🐕', filter: 'pets' },
      { label: 'WiFi included', icon: '📶', filter: 'wifi' },
      { label: 'Swimming pool', icon: '🏊', filter: 'pool' },
      { label: 'Gym access', icon: '💪', filter: 'gym' },
      { label: 'Free parking', icon: '🅿️', filter: 'parking' },
      { label: 'Air conditioning', icon: '❄️', filter: 'aircon' },
    ],
    services: [
      { label: 'Same day', icon: '⚡', filter: 'availability' },
      { label: 'Certified', icon: '✅', filter: 'certified' },
      { label: 'Affordable', icon: '💰', filter: 'price_low' },
      { label: 'Top rated', icon: '⭐', filter: 'rating_high' },
      { label: 'Emergency', icon: '🚨', filter: 'emergency' },
    ],
    helpers: [
      { label: 'Available now', icon: '⏰', filter: 'available_now' },
      { label: 'Verified', icon: '🛡️', filter: 'verified' },
      { label: 'Experienced', icon: '🎓', filter: 'experienced' },
      { label: 'Background checked', icon: '🔍', filter: 'background_checked' },
      { label: 'English speaking', icon: '🗣️', filter: 'english' },
    ],
    events: [
      { label: 'Today', icon: '📅', filter: 'today' },
      { label: 'Free entry', icon: '🎫', filter: 'free' },
      { label: 'Family friendly', icon: '👨‍👩‍👧‍👦', filter: 'family_friendly' },
      { label: 'Outdoor', icon: '🌳', filter: 'outdoor' },
      { label: 'Live music', icon: '🎵', filter: 'live_music' },
    ],
  };

  const currentFilters = filters[searchType] || filters.properties;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Quick filters</h3>
        <span className="text-xs text-gray-500">Tap to filter</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {currentFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() => onFilterClick(filter.filter)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all text-sm"
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Search Bar Component
const EnhancedSearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit, 
  onTypeChange, 
  searchType,
  placeholder = "Search properties, services, helpers, or events..."
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  const handleSuggestionSelect = (suggestion) => {
    onSearchChange(suggestion.text);
    setShowSuggestions(false);
    // Navigate to search results
    const searchParams = new URLSearchParams();
    searchParams.set('q', suggestion.text);
    searchParams.set('searchType', suggestion.type || searchType);
    window.location.href = `/search?${searchParams.toString()}`;
  };

  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-2 mb-3">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${searchType === type.id 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <type.icon className="w-4 h-4" />
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setShowSuggestions(false);
              }}
              className="absolute right-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {showSuggestions && searchTerm.length === 0 && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Recent searches</span>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onSearchChange(search.query);
                    onSearchSubmit({ preventDefault: () => {} });
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                >
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{search.query}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{new Date(search.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{search.type}</span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {showSuggestions && searchTerm.length >= 2 && (
          <AISearchSuggestions 
            query={searchTerm} 
            onSelect={handleSuggestionSelect}
          />
        )}
      </form>
    </div>
  );
};

// Backend API functions
const SearchAPI = {
  async searchProperties(params) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/listing/search?${queryParams}`);
      
      if (!response.ok) throw new Error('Failed to fetch properties');
      return await response.json();
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },

  async searchServices(params) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/service/search?${queryParams}`);
      
      if (!response.ok) throw new Error('Failed to fetch services');
      return await response.json();
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  async searchHelpers(params) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/helper/search?${queryParams}`);
      
      if (!response.ok) throw new Error('Failed to fetch helpers');
      return await response.json();
    } catch (error) {
      console.error('Error searching helpers:', error);
      throw error;
    }
  },

  async searchEvents(params) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/event/search?${queryParams}`);
      
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  },

  async getAISuggestions(query, types) {
    try {
      const response = await fetch('/api/ai/search-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, types })
      });
      
      if (!response.ok) throw new Error('Failed to get AI suggestions');
      return await response.json();
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      throw error;
    }
  },

  async saveSearchHistory(searchData) {
    try {
      const response = await fetch('/api/search/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(searchData)
      });
      
      if (!response.ok) throw new Error('Failed to save search history');
      return await response.json();
    } catch (error) {
      console.error('Error saving search history:', error);
      throw error;
    }
  }
};

const UniversalSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state from URL
  const getInitialState = () => {
    const urlParams = new URLSearchParams(location.search);
    
    return {
      searchTerm: urlParams.get('q') || '',
      searchType: SEARCH_TYPES.map(t => t.id).includes(urlParams.get('searchType')) 
        ? urlParams.get('searchType') 
        : 'properties',
      location: urlParams.get('location') || '',
      priceMin: urlParams.get('priceMin') || '',
      priceMax: urlParams.get('priceMax') || '',
      sort: urlParams.get('sort') || 'relevance',
      filters: {}
    };
  };

  const [searchState, setSearchState] = useState(getInitialState());
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((query, type) => {
    try {
      const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
      const newSearch = {
        query,
        type,
        timestamp: new Date().toISOString()
      };
      
      const filtered = searches.filter(s => 
        !(s.query === query && s.type === type)
      );
      
      const updatedSearches = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
      
      // Save to backend if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        SearchAPI.saveSearchHistory(newSearch).catch(console.error);
      }
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (params, pageNum = 1) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        q: params.searchTerm,
        location: params.location,
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        sort: params.sort,
        page: pageNum,
        limit: DEFAULT_LISTING_LIMIT,
        ...params.filters
      };

      let results;
      switch (params.searchType) {
        case 'properties':
          results = await SearchAPI.searchProperties(searchParams);
          break;
        case 'services':
          results = await SearchAPI.searchServices(searchParams);
          break;
        case 'helpers':
          results = await SearchAPI.searchHelpers(searchParams);
          break;
        case 'events':
          results = await SearchAPI.searchEvents(searchParams);
          break;
        default:
          results = await SearchAPI.searchProperties(searchParams);
      }

      if (pageNum === 1) {
        setSearchResults(results.items || []);
      } else {
        setSearchResults(prev => [...prev, ...(results.items || [])]);
      }

      setTotalResults(results.total || 0);
      setHasMore((results.items || []).length >= DEFAULT_LISTING_LIMIT);
      
      // Save to recent searches
      if (params.searchTerm) {
        saveRecentSearch(params.searchTerm, params.searchType);
      }

    } catch (error) {
      setError(error.message);
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [saveRecentSearch]);

  // Initial search on mount
  useEffect(() => {
    if (searchState.searchTerm || searchState.location) {
      performSearch(searchState);
    }
  }, [searchState.searchType, location.search]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    
    const urlParams = new URLSearchParams();
    Object.entries(searchState).forEach(([key, value]) => {
      if (value && key !== 'filters') {
        urlParams.set(key, value);
      }
    });

    navigate(`/search?${urlParams.toString()}`);
    performSearch(searchState, 1);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(searchState, nextPage);
  };

  // Render search results
  const renderResults = () => {
    if (loading && searchResults.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => performSearch(searchState)}
            className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (searchResults.length === 0 && !loading) {
      return (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={() => {
              setSearchState(prev => ({ ...prev, searchTerm: '' }));
              setShowFilters(true);
            }}
            className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg text-sm"
          >
            Adjust Filters
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((item) => {
            const props = {
              [searchState.searchType.slice(0, -1)]: item,
              key: item._id || item.id
            };

            switch (searchState.searchType) {
              case 'properties':
                return <ListingItem {...props} />;
              case 'services':
                return <ServiceItem {...props} />;
              case 'helpers':
                return <HelperItem {...props} />;
              case 'events':
                return <EventItem {...props} />;
              default:
                return null;
            }
          })}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Show more'}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <EnhancedSearchBar
            searchTerm={searchState.searchTerm}
            onSearchChange={(value) => setSearchState(prev => ({ ...prev, searchTerm: value }))}
            onSearchSubmit={handleSearchSubmit}
            onTypeChange={(type) => setSearchState(prev => ({ ...prev, searchType: type }))}
            searchType={searchState.searchType}
            placeholder="Search properties, services, helpers, or events..."
          />
          
          {searchState.searchTerm && (
            <QuickFilters
              searchType={searchState.searchType}
              onFilterClick={(filter) => {
                setSearchState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, [filter]: true }
                }));
              }}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchState.searchTerm 
                ? `Results for "${searchState.searchTerm}"`
                : `Browse ${SEARCH_TYPES.find(t => t.id === searchState.searchType)?.label}`
              }
            </h1>
            {totalResults > 0 && (
              <p className="text-gray-600 text-sm mt-1">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                {searchState.location && ` in ${searchState.location}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Map Toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 hover:shadow-sm"
            >
              {showMap ? (
                <>
                  <HomeIcon className="w-4 h-4" />
                  Show list
                </>
              ) : (
                <>
                  <MapIcon className="w-4 h-4" />
                  Show map
                </>
              )}
            </button>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 hover:shadow-sm"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>

            {/* Sort Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 hover:shadow-sm">
                Sort by
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Button>
              <Transition
                enter="transition duration-200 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-150 ease-in"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                  {['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'].map((option) => (
                    <Menu.Item key={option}>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            const sortMap = {
                              'Relevance': 'relevance',
                              'Price: Low to High': 'price_asc',
                              'Price: High to Low': 'price_desc',
                              'Rating': 'rating',
                              'Newest': 'newest'
                            };
                            setSearchState(prev => ({ ...prev, sort: sortMap[option] }));
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''} ${
                            searchState.sort === {
                              'Relevance': 'relevance',
                              'Price: Low to High': 'price_asc',
                              'Price: High to Low': 'price_desc',
                              'Rating': 'rating',
                              'Newest': 'newest'
                            }[option] ? 'text-purple-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {renderResults()}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showFilters && isMobile && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Filter content would go here */}
            <p className="text-gray-500">Filter options would appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;