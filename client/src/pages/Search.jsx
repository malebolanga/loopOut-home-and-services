// src/pages/Search.jsx
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
  SparklesIcon,
  MapPinIcon,
  FunnelIcon,
  FireIcon,
  ComputerDesktopIcon,
  TicketIcon,
  MagnifyingGlassIcon
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

  const [selectedCategory, setSelectedCategory] = useState('stays');
  const [searchType, setSearchType] = useState('rent');
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
  const [searchHistory, setSearchHistory] = useState(getSearchHistory());
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

  // Popular destinations (hardcoded for demo)
  const popularDestinations = [
    { name: "Temblsa", dates: "Jan 1–2, 2026", icon: "🏙️" },
    { name: "Modimolle-Mookgophong", dates: "Jan 2–3, 2026", icon: "⛰️" },
    { name: "Johannesburg", dates: "Jan 3–4, 2026", icon: "🏙️" },
    { name: "Cape Town", dates: "Jan 4–5, 2026", icon: "🏖️" },
    { name: "Durban", dates: "Jan 5–6, 2026", icon: "🌊" },
    { name: "Pretoria", dates: "Jan 6–7, 2026", icon: "🏛️" },
  ];

  // Recent searches (from localStorage)
  const recentDestinations = recentSearches.map((search, index) => ({
    name: search.params?.location || search.params?.searchTerm || `Search ${index + 1}`,
    dates: search.timestamp ? new Date(search.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Dates not set",
    icon: search.category === 'stays' ? '🏠' : search.category === 'experiences' ? '🔧' : '👥'
  }));

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

  // Fetch data
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      if (!urlParams.toString()) return;
      
      try {
        setLoading(true);
        
        // Convert to old type for API compatibility
        const oldType = getOldTypeFromCategory(selectedCategory);
        const endpoint = SEARCH_TYPE_CONFIG[oldType]?.endpoint || '/api/listing/get';
        
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
      
      // Also save to general search history
      saveSearchHistory(params.searchTerm, selectedCategory, params);
      setSearchHistory(getSearchHistory());
      
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
    clearSearchHistoryUtil();
    setSearchHistory([]);
  };

  const handleDestinationClick = (destination) => {
    setSidebarData(prev => ({
      ...prev,
      location: destination.name,
      searchTerm: destination.name
    }));
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Search Box */}
      {showSearchBox && (
          <div className="relative bg-gradient-to-r from-rose-50 to-blue-50 rounded-3xl overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-blue-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4">Find your perfect stay</h1>
              <p className="text-xl text-gray/90">Search across properties, services, helpers, and events</p>
            </div>

            {/* Main Search Box - Screenshot Style */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center">
                  {/* Destination */}
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

                  {/* Check-in */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">When?</label>
                    <div className="relative">
                      <input
                        type="date"
                        id="checkIn"
                        value={sidebarData.checkIn}
                        onChange={handleChange}
                        className="w-full text-lg border-none focus:ring-0 outline-none"
                      />
                    </div>
                  </div>

                  <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                  {/* Check-out */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">When?</label>
                    <div className="relative">
                      <input
                        type="date"
                        id="checkOut"
                        value={sidebarData.checkOut}
                        onChange={handleChange}
                        className="w-full text-lg border-none focus:ring-0 outline-none"
                      />
                    </div>
                  </div>

                  <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                  {/* Guests */}
                  <div className="flex-1 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Who?</label>
                    <div className="relative">
                      <input
                        type="number"
                        id="guests"
                        value={sidebarData.guests}
                        onChange={handleChange}
                        min="1"
                        max="16"
                        className="w-full text-lg border-none focus:ring-0 outline-none"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                        guests
                      </span>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="p-4">
                    <button
                      type="submit"
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                  className="text-white/90 hover:text-white text-sm font-medium"
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
        {/* Recent Searches & Suggested Destinations */}
        {showSearchBox && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Recent Searches */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <ClockIcon className="w-6 h-6 text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">Recent searches</h2>
              </div>
              <div className="space-y-4">
                {recentDestinations.map((dest, index) => (
                  <button
                    key={index}
                    onClick={() => handleDestinationClick(dest)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dest.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                            {dest.name}
                          </h3>
                          <p className="text-sm text-gray-600">{dest.dates}</p>
                        </div>
                      </div>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 rotate-90" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Destinations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Suggested destinations</h2>
              </div>
              <div className="space-y-4">
                {popularDestinations.map((dest, index) => (
                  <button
                    key={index}
                    onClick={() => handleDestinationClick(dest)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dest.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                            {dest.name}
                          </h3>
                          <p className="text-sm text-gray-600">{dest.dates}</p>
                        </div>
                      </div>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 rotate-90" />
                    </div>
                  </button>
                ))}
              </div>
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
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
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

        {/* Results Section */}
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

              {/* Search Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Apply Filters
              </button>

              <button
                onClick={clearFilters}
                className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {/* Mobile filters toggle */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {sidebarData.searchTerm ? `Results for "${sidebarData.searchTerm}"` : `${currentType?.label || categories.find(c => c.id === selectedCategory)?.label}`}
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
                  Showing <span className="font-bold text-gray-900">{listings.length}</span> {currentType?.label?.toLowerCase() || selectedCategory}
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
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No {currentType?.label?.toLowerCase() || selectedCategory} found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {sidebarData.searchTerm ? (
                    `We couldn't find any ${currentType?.label?.toLowerCase() || selectedCategory} matching "${sidebarData.searchTerm}". Try adjusting your search or try a different category.`
                  ) : (
                    `No ${currentType?.label?.toLowerCase() || selectedCategory} available with the current filters. Try adjusting your search criteria.`
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