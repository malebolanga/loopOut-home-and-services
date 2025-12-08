import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
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
  MapPinIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  ArrowsPointingOutIcon,
  SparklesIcon,
  FunnelIcon,
  CheckIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

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
    case 'sale':
      return 'for sale';
    case 'rent-short':
    case 'rent-long':
      return 'night';
    case 'office':
      return 'per hour';
    case 'land':
      return 'for sale';
    default:
      return 'night';
  }
};

const getTypeBadge = (type) => {
  switch (type) {
    case 'sale':
      return { label: 'For Sale', color: 'bg-blue-100 text-blue-800' };
    case 'rent-short':
      return { label: 'Short Term', color: 'bg-green-100 text-green-800' };
    case 'rent-long':
      return { label: 'Long Term', color: 'bg-emerald-100 text-emerald-800' };
    case 'office':
      return { label: 'Office Space', color: 'bg-purple-100 text-purple-800' };
    case 'land':
      return { label: 'Land Plot', color: 'bg-amber-100 text-amber-800' };
    default:
      return { label: 'Property', color: 'bg-gray-100 text-gray-800' };
  }
};

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
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

// Airbnb-style Listing Card Component
const AirbnbCard = ({ listing }) => {
  const navigate = useNavigate();
  const typeBadge = getTypeBadge(listing.type);
  const priceLabel = getPriceLabel(listing.type);

  const handleClick = () => {
    navigate(`/listing/${listing._id}`);
  };

  return (
    <div 
      className="cursor-pointer p-2"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-2xl mb-3">
        <img
          src={listing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={listing.name}
          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <button 
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite
          }}
        >
          <HeartIcon className="w-5 h-5" />
        </button>
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium px-2 py-1 rounded ${typeBadge.color}`}>
            {typeBadge.label}
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 truncate">{listing.name || listing.title}</h3>
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{listing.rating || 4.9}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 truncate">{listing.description || listing.location}</p>
        
        {listing.type !== 'land' && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>{listing.bedrooms || 2} beds</span>
            <span>·</span>
            <span>{listing.bathrooms || 1} baths</span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="font-bold text-gray-900">R{listing.price || listing.regularPrice || 8698}</span>
            <span className="text-gray-500"> {priceLabel}</span>
          </div>
          {listing.offer && (
            <span className="text-xs font-medium bg-rose-100 text-rose-800 px-2 py-1 rounded transition-all duration-300 hover:scale-105">Instant Book</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Map Component for showing listings
const MapView = ({ listings, address = 'Johannesburg' }) => {
  const mapRef = useRef(null);

  // Static map image for demonstration
  const getStaticMapUrl = () => {
    return `https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
  };

  return (
    <div className="relative h-full rounded-2xl overflow-hidden">
      <img
        src={getStaticMapUrl()}
        alt="Map view"
        className="w-full h-full object-cover"
      />
      
      {/* Map markers overlay */}
      <div className="absolute inset-0">
        {listings.slice(0, 10).map((listing, index) => {
          const typeBadge = getTypeBadge(listing.type);
          return (
            <div 
              key={listing._id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${30 + (index % 5) * 15}%`,
                top: `${40 + Math.floor(index / 5) * 25}%`
              }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-125 transition-transform duration-300 cursor-pointer group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeBadge.color.replace('text-', 'bg-').split(' ')[0]}`}>
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <div className="text-xs font-medium">R{listing.price || listing.regularPrice}</div>
                  <div className="text-xs text-gray-500">{getPriceLabel(listing.type)}</div>
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
            <p className="text-sm text-gray-600">{listings.length} properties available</p>
          </div>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Show all on map
          </button>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialSearchType = () => {
    const urlParams = new URLSearchParams(location.search);
    const typeFromUrl = urlParams.get('searchType');
    return ['properties', 'services', 'helpers', 'events'].includes(typeFromUrl) 
      ? typeFromUrl 
      : 'properties';
  };

  const [searchType, setSearchType] = useState(getInitialSearchType());
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
    laundry: false,
    address: 'Johannesburg',
    name: '',
    description: '',
    category: 'all',
    location: '',
    date: '',
    availability: 'all'
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [isMobile, setIsMobile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('recommended');

  // Property types based on your requirements
  const propertyTypes = [
    { id: 'all', label: 'Any type', icon: '🏠', description: 'All properties' },
    { id: 'sale', label: 'For Sale', icon: '💰', description: 'Buy property' },
    { id: 'rent-short', label: 'Short Term', icon: '🏡', description: 'Nightly stays' },
    { id: 'rent-long', label: 'Long Term', icon: '🏘️', description: 'Monthly rental' },
    { id: 'office', label: 'Office', icon: '🏢', description: 'Per hour' },
    { id: 'land', label: 'Land', icon: '🌳', description: 'For sale' }
  ];

  // Airbnb-style filter categories
  const filterCategories = [
    {
      id: 'recommended',
      title: 'Recommended for you',
      filters: [
        { id: 'parking', label: 'Free parking', icon: '🅿️' },
        { id: 'offer', label: 'Instant Book', icon: '⚡' },
        { id: 'wifi', label: 'Wifi', icon: '📶' }
      ]
    },
    {
      id: 'type',
      title: 'Type of place',
      items: propertyTypes
    },
    {
      id: 'price',
      title: 'Price range',
      description: 'Trip price, includes all fees'
    }
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
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

  useEffect(() => {
    const newSearchType = getInitialSearchType();
    setSearchType(newSearchType);
  }, [location.search]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const cleanParams = new URLSearchParams();
        urlParams.forEach((value, key) => {
          if (value && value !== 'false' && value !== '0') {
            cleanParams.set(key, value);
          }
        });

        cleanParams.set('searchType', searchType);
        
        const q = urlParams.get('q');
        if (q) {
          cleanParams.set('searchTerm', q);
        }
        
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
        
        const res = await fetch(`${endpoint}?${cleanParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const data = await res.json();
        
        // Add mock location data for map
        const typedData = data.map((item, index) => {
          const types = ['sale', 'rent-short', 'rent-long', 'office', 'land'];
          const type = types[index % types.length];
          
          return {
            ...item,
            itemType: searchType,
            type: type,
            price: item.price || item.regularPrice || item.fee || Math.floor(Math.random() * 5000) + 1000,
            imageUrls: item.imageUrls || [item.image] || [],
            rating: Math.floor(Math.random() * 2 + 3.5) + Math.random(),
            bedrooms: type !== 'land' ? (Math.floor(Math.random() * 4) + 1) : undefined,
            bathrooms: type !== 'land' ? (Math.floor(Math.random() * 3) + 1) : undefined,
            latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
            longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
            offer: Math.random() > 0.5
          };
        });
        
        setListings(typedData);
        setShowMore(typedData.length >= DEFAULT_LISTING_LIMIT);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Mock data for demo
        const types = ['sale', 'rent-short', 'rent-long', 'office', 'land'];
        const mockData = Array.from({ length: 12 }, (_, i) => {
          const type = types[i % types.length];
          return {
            _id: `mock-${i}`,
            name: `${type === 'sale' ? 'Modern ' : type === 'rent-short' ? 'Luxury ' : type === 'rent-long' ? 'Spacious ' : type === 'office' ? 'Professional ' : 'Prime '}${getPropertyTypeName(type)} ${i + 1}`,
            description: `Premium ${getPropertyTypeName(type).toLowerCase()} in ${sidebarData.address}`,
            type: type,
            price: Math.floor(Math.random() * 5000) + 1000,
            rating: Math.floor(Math.random() * 2 + 3.5) + Math.random(),
            bedrooms: type !== 'land' ? Math.floor(Math.random() * 4) + 1 : undefined,
            bathrooms: type !== 'land' ? Math.floor(Math.random() * 3) + 1 : undefined,
            offer: Math.random() > 0.5,
            latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
            longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
            imageUrls: [`https://images.unsplash.com/photo-${1566073771259 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`]
          };
        });
        setListings(mockData);
        setShowMore(mockData.length >= DEFAULT_LISTING_LIMIT);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search, searchType]);

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

    const updatedSearches = saveRecentSearch(sidebarData, searchType);
    setRecentSearches(updatedSearches);
    
    navigate(`/search?${urlParams.toString()}`);
  };

  const saveRecentSearch = (params, searchType) => {
    try {
      const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
      const searchEntry = { 
        params, 
        searchType,
        timestamp: new Date().toISOString(), 
        score: Object.keys(params).filter(k => params[k] && k !== 'searchTerm').length 
      };
      
      const filtered = searches.filter(
        item => !(JSON.stringify(item.params) === JSON.stringify(params) && item.searchType === searchType)
      );
      
      const newSearches = [searchEntry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      return newSearches;
    } catch (error) {
      console.error('Failed to save recent search:', error);
      return [];
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
      laundry: false,
      address: 'Johannesburg',
      name: '',
      description: '',
      category: 'all',
      location: '',
      date: '',
      availability: 'all'
    });
    
    if (isMobile) {
      setShowFilters(false);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 max-w-7xl mx-auto">
      {/* Mobile Search Header */}
      {isMobile && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="text-gray-600">{sidebarData.address || 'Search places...'}</span>
              </div>
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowMap(!showMap)}
              className="p-3 border border-gray-300 rounded-full"
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {sidebarData.address ? `Properties near ${sidebarData.address}` : 'Explore properties'}
          </h1>
          <p className="text-gray-600 text-sm">
            Dec 9-10 · Add guests · Prices include all fees
          </p>
        </div>
      )}

      {/* Airbnb-style Filter Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {filterCategories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilterTab(tab.id);
                if (isMobile) setShowFilters(true);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilterTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && isMobile && (
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Recommended Filters */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Recommended for you</h3>
                <div className="space-y-3">
                  {filterCategories[0].filters.map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{filter.icon}</span>
                        <span className="text-gray-700">{filter.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        id={filter.id}
                        checked={sidebarData[filter.id]}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Type of Place */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Type of place</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filterCategories[1].items.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => setSidebarData(prev => ({ ...prev, type: place.id }))}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        sidebarData.type === place.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{place.icon}</span>
                        <span className="font-medium">{place.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{place.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Price range</h3>
                  <span className="text-sm text-gray-500">Trip price, includes all fees</span>
                </div>
                
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
                  
                  <div className="relative py-4">
                    <div className="h-1 bg-gray-300 rounded-full"></div>
                    <div className="absolute top-4 left-0 right-0 flex justify-between">
                      <div className="w-4 h-4 bg-white border-2 border-black rounded-full -translate-y-1.5"></div>
                      <div className="w-4 h-4 bg-white border-2 border-black rounded-full -translate-y-1.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fixed Bottom Buttons */}
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
                className="flex-1 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
              >
                Show {listings.length}+ places
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {(!isMobile || (isMobile && !showFilters)) && (
        <>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            {!isMobile && !showMap && (
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl p-6 sticky top-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Recommended Filters */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Recommended for you</h3>
                      <div className="space-y-3">
                        {filterCategories[0].filters.map((filter) => (
                          <div key={filter.id} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={filter.id}
                              checked={sidebarData[filter.id]}
                              onChange={handleChange}
                              className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor={filter.id} className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-lg">{filter.icon}</span>
                              {filter.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Type of Place */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Type of place</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {filterCategories[1].items.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => setSidebarData(prev => ({ ...prev, type: place.id }))}
                            className={`p-4 border rounded-lg text-left transition-all ${
                              sidebarData.type === place.id
                                ? 'border-black bg-gray-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{place.icon}</span>
                              <span className="font-medium text-sm">{place.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{place.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Price range</h3>
                        <span className="text-sm text-gray-600">
                          Trip price, includes all fees
                        </span>
                      </div>
                      
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
                                className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
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
                                className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                                placeholder="Any price"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative py-4">
                          <div className="h-1 bg-gray-300 rounded-full"></div>
                          <div className="absolute top-4 left-0 right-0 flex justify-between">
                            <div className="w-4 h-4 bg-white border-2 border-black rounded-full -translate-y-1.5"></div>
                            <div className="w-4 h-4 bg-white border-2 border-black rounded-full -translate-y-1.5"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
                    >
                      Show {listings.length}+ places
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Main Content Area - List View or Map View */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {listings.length}+ properties available
                  </h2>
                  {sidebarData.address && (
                    <p className="text-gray-600 text-sm">in {sidebarData.address} · Prices include all fees</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  {isMobile && (
                    <button
                      onClick={() => setShowFilters(true)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400"
                    >
                      <FunnelIcon className="w-4 h-4" />
                      Filters
                    </button>
                  )}
                  
                  {/* Map Toggle */}
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
                  
                  {/* Sort Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400">
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
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}>
                              Recommended
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}>
                              Price: Low to high
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}>
                              Price: High to low
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>

              {/* Map View */}
              {showMap ? (
                <div className="h-[600px] rounded-2xl overflow-hidden">
                  <MapView listings={listings} address={sidebarData.address} />
                </div>
              ) : (
                /* List View */
                loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                    {[...Array(6)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                      {listings.map((item) => (
                        <AirbnbCard key={item._id} listing={item} />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {showMore && (
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={() => {
                            const startIndex = listings.length;
                            const urlParams = new URLSearchParams(location.search);
                            urlParams.set('startIndex', startIndex);
                            navigate(`/search?${urlParams.toString()}`);
                          }}
                          className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          Show more
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center">
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
                      className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg text-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Floating Filter Button for Mobile */}
      {isMobile && !showFilters && (
        <div className="fixed bottom-6 right-4 z-40">
          <button
            onClick={() => setShowFilters(true)}
            className="bg-black text-white p-4 rounded-full shadow-xl hover:bg-gray-800"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;