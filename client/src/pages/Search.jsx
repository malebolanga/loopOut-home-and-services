import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [searchType, setSearchType] = useState('rent');
  const [searchData, setSearchData] = useState({
    searchTerm: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    type: 'all',
    priceMin: '',
    priceMax: '',
    bedroomsMin: '',
    bedroomsMax: ''
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartFilters, setSmartFilters] = useState({});
  const [showSearchBox, setShowSearchBox] = useState(true);

  // Categories configuration
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

  // Get types based on selected category
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
    const priceMinParam = urlParams.get('priceMin');
    const priceMaxParam = urlParams.get('priceMax');
    const bedroomsMinParam = urlParams.get('bedroomsMin');
    const bedroomsMaxParam = urlParams.get('bedroomsMax');
    
    const newSearchData = { ...searchData };
    
    if (searchTermParam) {
      newSearchData.searchTerm = searchTermParam;
    }
    
    if (locationParam) {
      newSearchData.location = locationParam;
    }
    
    if (checkInParam) {
      newSearchData.checkIn = checkInParam;
    }
    
    if (checkOutParam) {
      newSearchData.checkOut = checkOutParam;
    }
    
    if (guestsParam) {
      newSearchData.guests = parseInt(guestsParam);
    }
    
    if (priceMinParam) {
      newSearchData.priceMin = priceMinParam;
    }
    
    if (priceMaxParam) {
      newSearchData.priceMax = priceMaxParam;
    }
    
    if (bedroomsMinParam) {
      newSearchData.bedroomsMin = bedroomsMinParam;
    }
    
    if (bedroomsMaxParam) {
      newSearchData.bedroomsMax = bedroomsMaxParam;
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
    
    setSearchData(newSearchData);
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
      if (searchData.searchTerm.length < 3) {
        setAiSuggestions(null);
        return;
      }

      setIsAnalyzing(true);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const extractedFilters = extractFiltersFromQuery(searchData.searchTerm);
      setSmartFilters(extractedFilters);
      
      if (Object.keys(extractedFilters).length > 0) {
        setAiSuggestions({
          searchTerm: searchData.searchTerm,
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
  }, [searchData.searchTerm]);

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
        
        console.log('Fetching from:', `${endpoint}?${urlParams.toString()}`);
        
        const res = await fetch(`${endpoint}?${urlParams.toString()}`);
        const data = await res.json();
        
        console.log('Fetched data:', data);
        
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
        setListings([]);
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
    const { id, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const urlParams = new URLSearchParams();
    
    // Include all non-empty values
    Object.entries(searchData).forEach(([key, value]) => {
      if (value !== '' && value !== 0) {
        urlParams.set(key, value.toString());
      }
    });

    // Add category and type
    urlParams.set('category', selectedCategory);
    urlParams.set('subType', searchType);
    
    // For backward compatibility, also add old type
    urlParams.set('type', getOldTypeFromCategory(selectedCategory));
    
    // Save to recent searches
    saveRecentSearch(searchData);
    
    // Navigate
    const urlString = urlParams.toString();
    console.log('Navigating to:', `/search?${urlString}`);
    navigate(`/search?${urlString}`);
    setShowSearchBox(false);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestions) {
      const newData = {
        ...searchData,
        ...aiSuggestions.filters
      };
      setSearchData(newData);
      setAiSuggestions(prev => ({ ...prev, applied: true }));
      setSmartFilters(aiSuggestions.filters);
    }
  };

  const clearSearch = () => {
    setSearchData({
      searchTerm: '',
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      type: 'all',
      priceMin: '',
      priceMax: '',
      bedroomsMin: '',
      bedroomsMax: ''
    });
    setSmartFilters({});
    setAiSuggestions(null);
    setSelectedCategory('stays');
    setSearchType('rent');
    setListings([]);
    setShowSearchBox(true);
    navigate('/search');
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
  const currentType = currentTypes.find(t => t.id === searchType);

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Hero Section with Search Box */}
      {showSearchBox && (
        <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-gray-900">Find your perfect stay</h1>
              <p className="text-xl text-gray-600">Search across properties, services, helpers, and events</p>
            </div>

            {/* Main Search Box */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center">
                  {/* Search Term */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="searchTerm"
                        value={searchData.searchTerm}
                        onChange={handleChange}
                        placeholder="Try '2 bed apartment in Cape Town' or 'Cleaning service'"
                        className="w-full text-lg border-none focus:ring-0 outline-none placeholder-gray-500"
                      />
                      <MagnifyingGlassIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                  {/* Location */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="location"
                        value={searchData.location}
                        onChange={handleChange}
                        placeholder="Search destinations"
                        className="w-full text-lg border-none focus:ring-0 outline-none placeholder-gray-500"
                      />
                      <MapPinIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  onClick={clearSearch}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions && !aiSuggestions.applied && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 animate-fadeIn">
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
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  // Update URL with new category
                  const urlParams = new URLSearchParams(location.search);
                  urlParams.set('category', category.id);
                  navigate(`/search?${urlParams.toString()}`);
                }}
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
                  onClick={() => {
                    setSearchType(type.id);
                    // Update URL with new type
                    const urlParams = new URLSearchParams(location.search);
                    urlParams.set('subType', type.id);
                    navigate(`/search?${urlParams.toString()}`);
                  }}
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

        {/* Results Section */}
        <div>
          {/* Results count */}
          {!loading && listings.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-700">
                Showing <span className="font-bold text-gray-900">{listings.length}</span> {currentType?.label?.toLowerCase() || selectedCategory}
                {searchData.searchTerm && (
                  <span> for "<span className="font-semibold">{searchData.searchTerm}</span>"</span>
                )}
                {searchData.location && (
                  <span> in <span className="font-semibold">{searchData.location}</span></span>
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
          ) : location.search ? (
            /* Empty state when search has params but no results */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No {currentType?.label?.toLowerCase() || selectedCategory} found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchData.searchTerm ? (
                  `We couldn't find any ${currentType?.label?.toLowerCase() || selectedCategory} matching "${searchData.searchTerm}". Try adjusting your search or try a different category.`
                ) : (
                  `No ${currentType?.label?.toLowerCase() || selectedCategory} available with the current search. Try adjusting your search criteria.`
                )}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => setShowSearchBox(true)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  New Search
                </button>
              </div>
            </div>
          ) : (
            /* Initial state - no search yet */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Start your search
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Use the search box above to find properties, services, helpers, or events. Select a category and type to refine your search.
              </p>
              <button
                onClick={() => setShowSearchBox(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Show Search Box
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;