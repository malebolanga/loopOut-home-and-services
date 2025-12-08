import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import "../styles/ListingDetails.scss";
import EventItem from "../components/EventItem";
import ServiceItem from "../components/ServiceItem";
import ListingItem from "../components/ListingItem";
import HelperItem from "../components/HelperItem";

// Constants
const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;
const DATA_FETCH_LIMIT = 8; // Number of items to fetch for each category

// Search types configuration
const SEARCH_TYPES = [
  { 
    id: 'properties', 
    label: 'Homes', 
    icon: HomeIcon,
    description: 'Homes, apartments, offices, land',
    color: 'bg-rose-100 text-rose-800',
    endpoint: '/api/listing/get'
  },
  { 
    id: 'services', 
    label: 'Experiences', 
    icon: SparklesIcon,
    description: 'Cleaning, maintenance, moving, etc.',
    color: 'bg-emerald-100 text-emerald-800',
    endpoint: '/api/service/get'
  },
  { 
    id: 'helpers', 
    label: 'Services', 
    icon: UserGroupIcon,
    description: 'Tutors, caregivers, handymen, etc.',
    color: 'bg-purple-100 text-purple-800',
    endpoint: '/api/helper/get'
  },
  { 
    id: 'events', 
    label: 'Events', 
    icon: CalendarDaysIcon,
    description: 'Local events and activities',
    color: 'bg-amber-100 text-amber-800',
    endpoint: '/api/event/get'
  }
];

// Helper functions for property types
const getPropertyTypeName = (type) => {
  switch (type) {
    case 'sale': return 'Sale';
    case 'rent-short': return 'Short Term';
    case 'rent-long': return 'Long Term';
    case 'office': return 'Office';
    case 'land': return 'Land Plot';
    default: return 'Property';
  }
};

const getPriceLabel = (type) => {
  switch (type) {
    case 'sale': return 'for sale';
    case 'rent-short': return 'night';
    case 'rent-long': return 'month';
    case 'office': return 'per hour';
    case 'land': return 'for sale';
    default: return 'night';
  }
};

const getTypeBadge = (type) => {
  switch (type) {
    case 'sale': return { label: 'For Sale', color: 'bg-blue-100 text-blue-800' };
    case 'rent-short': return { label: 'Short Term', color: 'bg-green-100 text-green-800' };
    case 'rent-long': return { label: 'Long Term', color: 'bg-emerald-100 text-emerald-800' };
    case 'office': return { label: 'Office Space', color: 'bg-purple-100 text-purple-800' };
    case 'land': return { label: 'Land Plot', color: 'bg-amber-100 text-amber-800' };
    default: return { label: 'Property', color: 'bg-gray-100 text-gray-800' };
  }
};

// Initial sidebar data state
const getInitialSidebarData = () => ({
  // Common fields
  searchTerm: '',
  address: '',
  name: '',
  description: '',
  location: '',
  priceMin: 0,
  priceMax: 100000000,
  sort: 'createdAt',
  order: 'desc',
  
  // Property specific fields
  type: 'all',
  parking: false,
  furnished: false,
  wifi: false,
  pool: false,
  tv: false,
  offer: false,
  bedroomsMin: '',
  bedroomsMax: '',
  breakfast: false,
  pets: false,
  security: false,
  aircon: false,
  gym: false,
  view: false,
  kitchen: false,
  laundry: false,
  
  // Service specific fields
  category: 'all',
  serviceType: 'all',
  
  // Helper specific fields
  helperType: 'all',
  availability: 'all',
  
  // Event specific fields
  date: '',
  eventType: 'all'
});

// ==================== COMPONENTS ====================

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
    <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 to-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-8"></div>
      </div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
    </div>
  </div>
);

// Item Card Wrapper Component
const ItemCard = ({ item, searchType }) => {
  switch (searchType) {
    case 'properties':
      return <ListingItem listing={item} className="w-full" />;
    case 'services':
      return <ServiceItem service={item} className="w-full" />;
    case 'helpers':
      return <HelperItem helper={item} className="w-full" />;
    case 'events':
      return <EventItem event={item} className="w-full" />;
    default:
      return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
            <img
              src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-medium px-2 py-1 rounded ${SEARCH_TYPES.find(t => t.id === searchType)?.color || 'bg-gray-100 text-gray-800'}`}>
                {SEARCH_TYPES.find(t => t.id === searchType)?.label}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 truncate mb-2">{item.name || item.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description || item.location}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-900">
                {item.price ? `R${item.price}` : 'Free'}
              </div>
              {item.date && (
                <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      );
  }
};

// Map Component
const MapView = ({ items, searchType, address = 'Polokwane' }) => {
  const getStaticMapUrl = () => {
    return `https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
  };

  const getTypeColor = (type) => {
    switch(searchType) {
      case 'properties': return getTypeBadge(type).color;
      case 'services': return 'bg-blue-500';
      case 'helpers': return 'bg-purple-500';
      case 'events': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative h-full rounded-2xl overflow-hidden">
      <img
        src={getStaticMapUrl()}
        alt="Map view"
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0">
        {items.slice(0, 10).map((item, index) => {
          const typeColor = getTypeColor(item.type);
          return (
            <div 
              key={item._id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${30 + (index % 5) * 15}%`,
                top: `${40 + Math.floor(index / 5) * 25}%`
              }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-125 transition-transform duration-300 cursor-pointer group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeColor}`}>
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <div className="text-xs font-medium">R{item.price || item.regularPrice}</div>
                  <div className="text-xs text-gray-500">
                    {searchType === 'properties' ? getPriceLabel(item.type) : searchType === 'services' ? '/service' : '/work'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{address}</h3>
            <p className="text-sm text-gray-600">{items.length} {SEARCH_TYPES.find(t => t.id === searchType)?.label?.toLowerCase()} available</p>
          </div>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Show all on map
          </button>
        </div>
      </div>
    </div>
  );
};

// Airbnb-style Search Bar
const AirbnbSearchBar = ({ onSubmit, searchType }) => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-full shadow-lg p-1 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-1 px-4">
            <div className="text-xs font-medium text-gray-900 mb-1">Start your search</div>
            <input
              type="text"
              placeholder="Search destinations..."
              className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="h-10 w-px bg-gray-300"></div>

          <div className="px-4">
            <div className="text-xs font-medium text-gray-900 mb-1">Type</div>
            <select 
              className="text-sm text-gray-600 outline-none bg-transparent"
              defaultValue={searchType}
              onChange={(e) => navigate(`/search?searchType=${e.target.value}`)}
            >
              {SEARCH_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="h-10 w-px bg-gray-300"></div>

          <button 
            onClick={() => onSubmit && onSubmit(searchValue)}
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-full ml-2 hover:bg-rose-600 transition-colors"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Hero Banner
const HeroBanner = ({ onSearch, searchType }) => {
  return (
    <div className="relative bg-gradient-to-r from-rose-50 to-blue-50 rounded-3xl overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-blue-500/10"></div>
      <div className="relative z-10 px-8 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Find your perfect space
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Discover unique homes, experiences, and services around you
        </p>
       
      </div>
    </div>
  );
};

// Category Grid
const CategoryGrid = ({ onCategoryClick, stats }) => {
  const categories = [
    { icon: '🏠', label: 'Homes', count: stats?.properties || '1,234', color: 'bg-rose-100' },
    { icon: '✨', label: 'Experiences', count: stats?.services || '456', color: 'bg-emerald-100' },
    { icon: '👥', label: 'Services', count: stats?.helpers || '789', color: 'bg-purple-100' },
    { icon: '🎉', label: 'Events', count: stats?.events || '321', color: 'bg-amber-100' },
    { icon: '🏢', label: 'Office', count: '567', color: 'bg-blue-100' },
    { icon: '🌳', label: 'Land', count: '234', color: 'bg-green-100' },
    { icon: '🚚', label: 'Moving', count: '123', color: 'bg-indigo-100' },
    { icon: '🧹', label: 'Cleaning', count: '456', color: 'bg-pink-100' },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => onCategoryClick && onCategoryClick(category.label)}
            className="flex flex-col items-center p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center text-2xl mb-2`}>
              {category.icon}
            </div>
            <span className="font-medium text-gray-900 text-sm">{category.label}</span>
            <span className="text-xs text-gray-500">{category.count}+</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Popular Destinations
const PopularDestinations = () => {
  const destinations = [
    { name: 'Seshego', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Johannesburg', image: 'https://plus.unsplash.com/premium_photo-1742457604656-b9feed9543f1?q=80&w=790&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Soweto', image: 'https://images.unsplash.com/photo-1526583547718-e88dc16de312?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Pretoria', image: 'https://images.unsplash.com/photo-1603553224936-a0466e549586?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Polokwane', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Popular destinations</h2>
        <button className="text-sm font-medium text-gray-900 hover:underline">
          Show all →
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {destinations.map((dest, index) => (
          <div key={index} className="cursor-pointer">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-2">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <h3 className="font-medium text-gray-900">{dest.name}</h3>
            <p className="text-sm text-gray-500">135 properties</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Featured Listings Section
const FeaturedListings = ({ items, searchType, loading, title, showAllLink }) => {
  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button className="text-sm font-medium text-gray-900 hover:underline">
            Show all →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button className="text-sm font-medium text-gray-900 hover:underline">
          Show all →
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} searchType={searchType} />
        ))}
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ isHomePage, onLogoClick, searchType, onSubmitSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onSubmitSearch) {
      onSubmitSearch(searchValue);
    } else {
      navigate(`/search?searchTerm=${searchValue}&searchType=${searchType}`);
    }
  };

 
};

// Homepage Component
const Homepage = ({ 
  onSearch, 
  onCategoryClick, 
  searchType, 
  setSidebarData, 
  setShowHomePage, 
  navigate,
  featuredProperties,
  featuredServices,
  featuredHelpers,
  featuredEvents,
  loadingProperties,
  loadingServices,
  loadingHelpers,
  loadingEvents,
  stats
}) => {
  const handleSearch = (value) => {
    if (setSidebarData) {
      setSidebarData(prev => ({ ...prev, searchTerm: value }));
    }
    if (setShowHomePage) {
      setShowHomePage(false);
    }
    navigate(`/search?searchTerm=${value}&searchType=${searchType}`);
  };

  const handleCategoryClick = (category) => {
    const searchTypeMap = {
      'Homes': 'properties',
      'Experiences': 'services',
      'Services': 'helpers',
      'Events': 'events',
      'Office': 'properties',
      'Land': 'over',
      'Moving': 'services',
      'Cleaning': 'helpers'
    };
    
    const type = searchTypeMap[category] || 'properties';
    if (onSearch) {
      onSearch(type);
    }
    if (setShowHomePage) {
      setShowHomePage(false);
    }
    navigate(`/search?searchType=${type}&category=${category.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        isHomePage={true}
        onLogoClick={() => {}}
        searchType={searchType}
        onSubmitSearch={handleSearch}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <HeroBanner 
          onSearch={handleSearch}
          searchType={searchType}
        />

        <CategoryGrid 
          onCategoryClick={handleCategoryClick}
          stats={stats}
        />

        <PopularDestinations />

        <FeaturedListings 
          items={featuredProperties}
          searchType="properties"
          loading={loadingProperties}
          title="Popular homes in South Africa"
          showAllLink="/search?searchType=properties"
        />

        <FeaturedListings 
          items={featuredServices}
          searchType="services"
          loading={loadingServices}
          title="Top experiences near you"
          showAllLink="/search?searchType=services"
        />

        <FeaturedListings 
          items={featuredHelpers}
          searchType="helpers"
          loading={loadingHelpers}
          title="Recommended service providers"
          showAllLink="/search?searchType=helpers"
        />

        <FeaturedListings 
          items={featuredEvents}
          searchType="events"
          loading={loadingEvents}
          title="Upcoming local events"
          showAllLink="/search?searchType=events"
        />

        <div className="bg-gradient-to-r from-rose-500 to-blue-500 rounded-3xl p-8 md:p-12 text-white mb-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Become a Host</h2>
            <p className="text-lg mb-6">Share your space to earn extra income and meet travelers from around the world.</p>
            <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100">
              Learn more
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Search Results Component
const SearchResults = ({
  searchType,
  sidebarData,
  filteredItems,
  loading,
  showMore,
  showFilters,
  isMobile,
  showMap,
  setShowMap,
  setShowFilters,
  handleChange,
  handleSubmit,
  clearFilters,
  setShowHomePage,
  navigate,
  location
}) => {
  const loadMore = () => {
    const startIndex = filteredItems.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    navigate(`/search?${urlParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        isHomePage={false}
        onLogoClick={() => setShowHomePage(true)}
        searchType={searchType}
        onSubmitSearch={(value) => {
          navigate(`/search?searchTerm=${value}&searchType=${searchType}`);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {sidebarData.address 
              ? `${SEARCH_TYPES.find(t => t.id === searchType)?.label} in ${sidebarData.address}` 
              : `Explore ${SEARCH_TYPES.find(t => t.id === searchType)?.label}`}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {filteredItems.length}+ {SEARCH_TYPES.find(t => t.id === searchType)?.label?.toLowerCase()} available • {sidebarData.address || 'All locations'} • Prices include all fees
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {!isMobile && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 sticky top-24 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Price range</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Min price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                            <input
                              type="number"
                              id="priceMin"
                              value={sidebarData.priceMin}
                              onChange={handleChange}
                              className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Max price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                            <input
                              type="number"
                              id="priceMax"
                              value={sidebarData.priceMax}
                              onChange={handleChange}
                              className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                              placeholder="Any price"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full py-3.5 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filters
                  </button>
                )}
                
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400"
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
              </div>
            </div>

            {showMap ? (
              <div className="h-[600px] rounded-2xl overflow-hidden">
                <MapView items={filteredItems} searchType={searchType} address={sidebarData.address} />
              </div>
            ) : (
              loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <ItemCard key={item._id} item={item} searchType={searchType} />
                    ))}
                  </div>

                  {showMore && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={loadMore}
                        className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Show more
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No exact matches
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Try adjusting your filters or search term
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showFilters && isMobile && (
        <MobileFilterOverlay 
          sidebarData={sidebarData}
          handleChange={handleChange}
          clearFilters={clearFilters}
          handleSubmit={handleSubmit}
          setShowFilters={setShowFilters}
        />
      )}

      {isMobile && !showFilters && (
        <div className="fixed bottom-6 right-4 z-40">
          <button
            onClick={() => setShowFilters(true)}
            className="bg-rose-500 text-white p-4 rounded-full shadow-xl hover:bg-rose-600"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Mobile Filter Overlay
const MobileFilterOverlay = ({ 
  sidebarData, 
  handleChange, 
  clearFilters, 
  handleSubmit, 
  setShowFilters 
}) => (
  <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
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
    
    <div className="p-4 pb-24">
      <div className="space-y-8">
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Price range</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-2">Min price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <input
                    type="number"
                    id="priceMin"
                    value={sidebarData.priceMin}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-2">Max price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <input
                    type="number"
                    id="priceMax"
                    value={sidebarData.priceMax}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm"
                    placeholder="Any price"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={clearFilters}
          className="flex-1 py-3.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => {
            handleSubmit({ preventDefault: () => {} });
            setShowFilters(false);
          }}
          className="flex-1 py-3.5 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
        >
          Show results
        </button>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const UniversalSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialSearchType = () => {
    const urlParams = new URLSearchParams(location.search);
    const typeFromUrl = urlParams.get('searchType');
    return SEARCH_TYPES.map(t => t.id).includes(typeFromUrl) 
      ? typeFromUrl 
      : 'properties';
  };

  const [searchType, setSearchType] = useState(getInitialSearchType());
  const [sidebarData, setSidebarData] = useState(getInitialSidebarData());
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showHomePage, setShowHomePage] = useState(true);

  // Homepage data states
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredHelpers, setFeaturedHelpers] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingHelpers, setLoadingHelpers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [stats, setStats] = useState({});

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch homepage data
  useEffect(() => {
    const fetchHomepageData = async () => {
      // Fetch properties
      setLoadingProperties(true);
      try {
        const propertiesRes = await fetch(`/api/listing/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`);
        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          setFeaturedProperties(propertiesData.slice(0, 4)); // Show 4 featured properties
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoadingProperties(false);
      }

      // Fetch services
      setLoadingServices(true);
      try {
        const servicesRes = await fetch(`/api/service/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`);
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setFeaturedServices(servicesData.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoadingServices(false);
      }

      // Fetch helpers
      setLoadingHelpers(true);
      try {
        const helpersRes = await fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`);
        if (helpersRes.ok) {
          const helpersData = await helpersRes.json();
          setFeaturedHelpers(helpersData.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch helpers:', error);
      } finally {
        setLoadingHelpers(false);
      }

      // Fetch events
      setLoadingEvents(true);
      try {
        const eventsRes = await fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setFeaturedEvents(eventsData.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoadingEvents(false);
      }

      // Fetch stats
      try {
        // You can create a stats endpoint or fetch counts separately
        const statsData = {
          properties: featuredProperties.length * 100 || 1234,
          services: featuredServices.length * 50 || 456,
          helpers: featuredHelpers.length * 75 || 789,
          events: featuredEvents.length * 40 || 321
        };
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (showHomePage) {
      fetchHomepageData();
    }
  }, [showHomePage]);

  // Initialize sidebar data from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hasSearchParams = Array.from(urlParams.keys()).length > 0;
    
    if (hasSearchParams) {
      setShowHomePage(false);
    }

    const initialData = { ...sidebarData };
    
    urlParams.forEach((value, key) => {
      if (key in initialData) {
        if (typeof initialData[key] === 'boolean') {
          initialData[key] = value === 'true';
        } else if (typeof initialData[key] === 'number') {
          initialData[key] = Number(value);
        } else {
          initialData[key] = value;
        }
      }
    });

    const q = urlParams.get('q');
    if (q) {
      initialData.searchTerm = q;
      const name = urlParams.get('name');
      const address = urlParams.get('address');
      const description = urlParams.get('description');
      
      if (name) initialData.name = name;
      if (address) initialData.address = address;
      if (description) initialData.description = description;
    }

    setSidebarData(initialData);
  }, [location.search]);

  // Update search type when URL changes
  useEffect(() => {
    const newSearchType = getInitialSearchType();
    setSearchType(newSearchType);
  }, [location.search]);

  // Fetch search results data
  useEffect(() => {
    if (!showHomePage) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          const urlParams = new URLSearchParams(location.search);
          const cleanParams = new URLSearchParams();
          
          urlParams.forEach((value, key) => {
            if (value && value !== 'false' && value !== '0' && value !== 'all') {
              cleanParams.set(key, value);
            }
          });

          cleanParams.set('searchType', searchType);
          
          const q = urlParams.get('q');
          if (q) {
            cleanParams.set('searchTerm', q);
          }
          
          const endpoint = SEARCH_TYPES.find(t => t.id === searchType)?.endpoint || '/api/listing/get';
          const res = await fetch(`${endpoint}?${cleanParams.toString()}`);
          
          if (!res.ok) throw new Error('Failed to fetch data');
          
          const data = await res.json();
          const typedData = data.map((item, index) => {
            let type = '';
            let mockData = {};
            
            switch(searchType) {
              case 'properties':
                const propertyTypes = ['sale', 'rent-short', 'rent-long', 'office', 'land'];
                type = propertyTypes[index % propertyTypes.length];
                mockData = {
                  type: type,
                  price: item.price || item.regularPrice || Math.floor(Math.random() * 5000) + 1000,
                  imageUrls: item.imageUrls || [item.image] || [],
                  rating: Math.floor(Math.random() * 2 + 3.5) + Math.random(),
                  bedrooms: type !== 'land' ? (Math.floor(Math.random() * 4) + 1) : undefined,
                  bathrooms: type !== 'land' ? (Math.floor(Math.random() * 3) + 1) : undefined,
                  offer: Math.random() > 0.5
                };
                break;
              case 'services':
                const serviceTypes = ['cleaning', 'maintenance', 'moving', 'landscaping', 'catering', 'daycare', 'schoolTransport'];
                type = serviceTypes[index % serviceTypes.length];
                mockData = {
                  type: type,
                  regularPrice: item.regularPrice || item.price || Math.floor(Math.random() * 500) + 50,
                  imageUrls: item.imageUrls || [item.image] || [],
                  capacity: type === 'daycare' ? Math.floor(Math.random() * 20) + 5 : undefined,
                  vehicleType: type === 'schoolTransport' ? ['Bus', 'Van', 'Car'][Math.floor(Math.random() * 3)] : undefined
                };
                break;
              case 'helpers':
                const helperTypes = ['tutor', 'caregiver', 'handyman', 'cleaner', 'beauty', 'barber', 'photography'];
                type = helperTypes[index % helperTypes.length];
                mockData = {
                  type: type,
                  regularPrice: item.regularPrice || item.price || Math.floor(Math.random() * 200) + 20,
                  imageUrls: item.imageUrls || [item.image] || [],
                  reviews: item.reviews || [],
                  address: item.address || 'Johannesburg, South Africa'
                };
                break;
              case 'events':
                const eventTypes = ['concert', 'workshop', 'sports', 'community', 'festival'];
                type = eventTypes[index % eventTypes.length];
                mockData = {
                  type: type,
                  price: item.price || Math.floor(Math.random() * 500) + 50,
                  imageUrls: item.imageUrls || [item.image] || [],
                  date: item.date || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                  location: item.location || 'Various Locations'
                };
                break;
            }
            
            return {
              ...item,
              itemType: searchType,
              ...mockData,
              latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
              longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
            };
          });
          
          setItems(typedData);
          setShowMore(typedData.length >= DEFAULT_LISTING_LIMIT);
        } catch (error) {
          console.error('Failed to fetch data:', error);
          // Generate mock data
          let mockData = [];
          const count = 12;
          
          for (let i = 0; i < count; i++) {
            let item = {
              _id: `mock-${searchType}-${i}`,
              name: `${searchType.charAt(0).toUpperCase() + searchType.slice(1)} Item ${i + 1}`,
              description: `Premium ${searchType.slice(0, -1)} in ${sidebarData.address || 'Johannesburg'}`,
              address: sidebarData.address || 'Johannesburg, South Africa',
              price: Math.floor(Math.random() * 5000) + 1000,
              regularPrice: Math.floor(Math.random() * 5000) + 1000,
              imageUrls: [`https://images.unsplash.com/photo-${1566073771259 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`],
              latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
              longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
            };
            
            switch(searchType) {
              case 'properties':
                const propertyTypes = ['sale', 'rent-short', 'rent-long', 'office', 'land'];
                item.type = propertyTypes[i % propertyTypes.length];
                item.bedrooms = item.type !== 'land' ? Math.floor(Math.random() * 4) + 1 : undefined;
                item.bathrooms = item.type !== 'land' ? Math.floor(Math.random() * 3) + 1 : undefined;
                item.offer = Math.random() > 0.5;
                break;
              case 'services':
                const serviceTypes = ['cleaning', 'maintenance', 'moving', 'landscaping', 'catering', 'daycare', 'schoolTransport'];
                item.type = serviceTypes[i % serviceTypes.length];
                break;
              case 'helpers':
                const helperTypes = ['tutor', 'caregiver', 'handyman', 'cleaner', 'beauty', 'barber', 'photography'];
                item.type = helperTypes[i % helperTypes.length];
                break;
              case 'events':
                const eventTypes = ['concert', 'workshop', 'sports', 'community', 'festival'];
                item.type = eventTypes[i % eventTypes.length];
                item.date = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
                break;
            }
            
            mockData.push(item);
          }
          
          setItems(mockData);
          setShowMore(mockData.length >= DEFAULT_LISTING_LIMIT);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [location.search, searchType, showHomePage]);

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
    
    Object.entries(sidebarData).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== 0 && value !== 'all') {
        if (Array.isArray(value)) {
          value.forEach(v => urlParams.append(key, v));
        } else {
          urlParams.set(key, value.toString());
        }
      }
    });

    urlParams.set('searchType', searchType);
    setShowHomePage(false);
    
    navigate(`/search?${urlParams.toString()}`);
  };

  const clearFilters = () => {
    setSidebarData(getInitialSidebarData());
    setSidebarData(prev => ({ ...prev, address: 'Johannesburg' }));
    
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const filteredItems = items;

  if (showHomePage) {
    return (
      <Homepage 
        onSearch={setSearchType}
        onCategoryClick={(category) => {
          const searchTypeMap = {
            'Homes': 'properties',
            'Experiences': 'services',
            'Services': 'helpers',
            'Events': 'events',
            'Office': 'properties',
            'Land': 'properties',
            'Moving': 'services',
            'Cleaning': 'services'
          };
          
          const type = searchTypeMap[category] || 'properties';
          setSearchType(type);
          setShowHomePage(false);
          navigate(`/search?searchType=${type}&category=${category.toLowerCase()}`);
        }}
        searchType={searchType}
        setSidebarData={setSidebarData}
        setShowHomePage={setShowHomePage}
        navigate={navigate}
        featuredProperties={featuredProperties}
        featuredServices={featuredServices}
        featuredHelpers={featuredHelpers}
        featuredEvents={featuredEvents}
        loadingProperties={loadingProperties}
        loadingServices={loadingServices}
        loadingHelpers={loadingHelpers}
        loadingEvents={loadingEvents}
        stats={stats}
      />
    );
  }

  return (
    <SearchResults 
      searchType={searchType}
      sidebarData={sidebarData}
      filteredItems={filteredItems}
      loading={loading}
      showMore={showMore}
      showFilters={showFilters}
      isMobile={isMobile}
      showMap={showMap}
      setShowMap={setShowMap}
      setShowFilters={setShowFilters}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      clearFilters={clearFilters}
      setShowHomePage={setShowHomePage}
      navigate={navigate}
      location={location}
    />
  );
};

export default UniversalSearch;