import { useEffect, useState, useRef } from 'react';
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
} from '@heroicons/react/24/outline';
import "../styles/ListingDetails.scss";
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";


const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

// Search types configuration
const SEARCH_TYPES = [
  { 
    id: 'properties', 
    label: 'Properties', 
    icon: HomeIcon,
    description: 'Homes, apartments, offices, land',
    color: 'bg-blue-100 text-blue-800',
    endpoint: '/api/listing/get'
  },
  { 
    id: 'services', 
    label: 'Services', 
    icon: SparklesIcon,
    description: 'Cleaning, maintenance, moving, etc.',
    color: 'bg-green-100 text-green-800',
    endpoint: '/api/service/get'
  },
  { 
    id: 'helpers', 
    label: 'Helpers', 
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

// Helper function for helper types
const getHelperTypeName = (type) => {
  switch (type) {
    case 'domestic': return 'Maid';
    case 'tutor': return 'Tutor';
    case 'chef': return 'Chef';
    case 'handyman': return 'Handyman';
    case 'tattoo': return 'Tattoo Artist';
    case 'beauty': return 'Beauty';
    case 'barber': return 'Barber';
    case 'photography': return 'Photographer';
    default: return 'Helper';
  }
};

// Helper function for service types
const getServiceTypeName = (type) => {
  switch (type) {
    case 'cleaning': return 'Cleaning';
    case 'maintenance': return 'Maintenance';
    case 'moving': return 'Moving';
    case 'landscaping': return 'Landscaping';
    case 'catering': return 'Catering';
    case 'other': return 'Other';
    case 'daycare': return 'DayCare';
    case 'schoolTransport': return 'School Transport';
    default: return 'Service';
  }
};

// Helper function for event types
const getEventTypeName = (type) => {
  switch (type) {
    case 'concert': return 'Concert';
    case 'workshop': return 'Workshop';
    case 'sports': return 'Sports';
    case 'community': return 'Community';
    case 'festival': return 'Festival';
    default: return 'Event';
  }
};

const getPriceLabel = (type) => {
  switch (type) {
    case 'sale':
      return 'for sale';
    case 'rent-short':
      return 'night';
    case 'rent-long':
      return 'month';
    case 'office':
      return 'per hour';
    case 'land':
      return 'for sale';
    default:
      return 'night';
  }
};

const getTypeBadge = (type, searchType) => {
  // For properties
  switch (searchType) {
    case 'properties':
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
    
    case 'services':
      return { 
        label: getServiceTypeName(type), 
        color: 'bg-green-100 text-green-800' 
      };
    
    case 'helpers':
      return { 
        label: getHelperTypeName(type), 
        color: 'bg-purple-100 text-purple-800' 
      };
    
    case 'events':
      return { 
        label: getEventTypeName(type), 
        color: 'bg-amber-100 text-amber-800' 
      };
    
    default:
      return { label: 'Item', color: 'bg-gray-100 text-gray-800' };
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

// Item Card Wrapper Component
const ItemCard = ({ item, searchType }) => {
  switch (searchType) {
    case 'properties':
      return <ListingItem listing={item} />;
    case 'services':
      return <ServiceItem service={item} />;
    case 'helpers':
      return <HelperItem helper={item} />;
    default:
      // Generic card for events or other types
      return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="aspect-[4/3] bg-gray-100 relative">
            <img
              src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                getTypeBadge(item.type, searchType).color
              }`}>
                {getTypeBadge(item.type, searchType).label}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 truncate mb-2">{item.name || item.title}</h3>
            <p className="text-sm text-gray-600 truncate mb-3">{item.description || item.location}</p>
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

// Map Component for showing listings
const MapView = ({ items, searchType, address = 'Polokwane' }) => {
  const mapRef = useRef(null);

  // Static map image for demonstration
  const getStaticMapUrl = () => {
    return `https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
  };

  const getTypeColor = (type) => {
    switch(searchType) {
      case 'properties':
        return getTypeBadge(type, searchType).color.split(' ')[0]; // Get just the background color
      case 'services':
        return 'bg-green-500';
      case 'helpers':
        return 'bg-purple-500';
      case 'events':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
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

// Airbnb-style Sliding Tabs Component
const SlidingTabs = ({ tabs, activeTab, onTabClick }) => {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const checkArrows = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, []);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkArrows, 300);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkArrows, 300);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
      checkArrows();
    }
  };

  return (
    <div className="relative mb-6">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:shadow-lg transition-shadow"
        >
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:shadow-lg transition-shadow"
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

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
  const [sidebarData, setSidebarData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Property types
  const propertyTypes = [
    { id: 'all', label: 'Any type', icon: '🏠', description: 'All properties' },
    { id: 'sale', label: 'For Sale', icon: '💰', description: 'Buy property' },
    { id: 'rent-short', label: 'Short Term', icon: '🏡', description: 'Nightly stays' },
    { id: 'rent-long', label: 'Long Term', icon: '🏘️', description: 'Monthly rental' },
    { id: 'office', label: 'Office', icon: '🏢', description: 'Per hour' },
    { id: 'land', label: 'Land', icon: '🌳', description: 'For sale' }
  ];

  // Service types - updated to match getServiceTypeName
  const serviceTypes = [
    { id: 'all', label: 'All Services', icon: '✨', description: 'All service types' },
    { id: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'Home & office cleaning' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', description: 'Repairs & fixes' },
    { id: 'moving', label: 'Moving', icon: '🚚', description: 'Moving services' },
    { id: 'landscaping', label: 'Landscaping', icon: '🌿', description: 'Garden & lawn care' },
    { id: 'catering', label: 'Catering', icon: '🍽️', description: 'Food & catering' },
    { id: 'daycare', label: 'DayCare', icon: '👶', description: 'Child care services' },
    { id: 'schoolTransport', label: 'School Transport', icon: '🚌', description: 'School transport' },
    { id: 'other', label: 'Other', icon: '🔧', description: 'Other services' }
  ];

  // Helper types - updated to match getHelperTypeName
  const helperTypes = [
    { id: 'all', label: 'All Helpers', icon: '👥', description: 'All helper types' },
    { id: 'tutor', label: 'Tutor', icon: '📚', description: 'Academic tutoring' },
    { id: 'chef', label: 'Chef', icon: '👨‍🍳', description: 'Cooking & catering' },
    { id: 'handyman', label: 'Handyman', icon: '🛠️', description: 'Home repairs' },
    { id: 'domestic', label: 'Maid', icon: '🧽', description: 'House helper' },
    { id: 'beauty', label: 'Beauty', icon: '💄', description: 'Beauty services' },
    { id: 'barber', label: 'Barber', icon: '✂️', description: 'Haircut & grooming' },
    { id: 'photography', label: 'Photographer', icon: '📷', description: 'Photography services' },
    { id: 'tattoo', label: 'Tattoo Artist', icon: '🖋️', description: 'Tattoo services' }
  ];

  // Event types
  const eventTypes = [
    { id: 'all', label: 'All Events', icon: '🎉', description: 'All event types' },
    { id: 'concert', label: 'Concert', icon: '🎵', description: 'Music concerts' },
    { id: 'workshop', label: 'Workshop', icon: '🎨', description: 'Learning workshops' },
    { id: 'sports', label: 'Sports', icon: '⚽', description: 'Sports events' },
    { id: 'community', label: 'Community', icon: '🤝', description: 'Community events' },
    { id: 'festival', label: 'Festival', icon: '🎪', description: 'Festivals & fairs' }
  ];

  // Get active type array based on searchType
  const getActiveTypeArray = () => {
    switch(searchType) {
      case 'properties': return propertyTypes;
      case 'services': return serviceTypes;
      case 'helpers': return helperTypes;
      case 'events': return eventTypes;
      default: return propertyTypes;
    }
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize sidebar data from URL params
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

  // Update search type when URL changes
  useEffect(() => {
    const newSearchType = getInitialSearchType();
    setSearchType(newSearchType);
  }, [location.search]);

  // Fetch data based on search type and filters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchData = async () => {
      try {
        setLoading(true);
        
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
        
        // Add mock data for demonstration
        const typedData = data.map((item, index) => {
          // Add type-specific mock data
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
              const serviceTypes = ['cleaning', 'maintenance', 'moving', 'landscaping', 'catering', 'daycare', 'schoolTransport', 'other'];
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
              const helperTypes = ['tutor', 'domestic', 'handyman', 'chef', 'beauty', 'barber', 'photography', 'tattoo'];
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
        // Generate mock data for demo
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
          
          // Add type-specific fields
          switch(searchType) {
            case 'properties':
              const propertyTypes = ['sale', 'rent-short', 'rent-long', 'office', 'land'];
              item.type = propertyTypes[i % propertyTypes.length];
              item.bedrooms = item.type !== 'land' ? Math.floor(Math.random() * 4) + 1 : undefined;
              item.bathrooms = item.type !== 'land' ? Math.floor(Math.random() * 3) + 1 : undefined;
              item.offer = Math.random() > 0.5;
              break;
            case 'services':
              const serviceTypes = ['cleaning', 'maintenance', 'moving', 'landscaping', 'catering', 'daycare', 'schoolTransport', 'other'];
              item.type = serviceTypes[i % serviceTypes.length];
              break;
            case 'helpers':
              const helperTypes = ['tutor', 'domestic', 'handyman', 'chef', 'beauty', 'barber', 'photography', 'tattoo'];
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
    
    // Add all non-empty, non-default values to URL params
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

    // Save to recent searches
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
      // Common fields
      searchTerm: '',
      address: 'Johannesburg',
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
    
    if (isMobile) {
      setShowFilters(false);
    }
  };

  // Filter functions for different search types
  const getFilteredItems = () => {
    let filtered = [...items];
    
    // Filter by type
    if (sidebarData.type !== 'all' && searchType === 'properties') {
      filtered = filtered.filter(item => item.type === sidebarData.type);
    }
    if (sidebarData.serviceType !== 'all' && searchType === 'services') {
      filtered = filtered.filter(item => item.type === sidebarData.serviceType);
    }
    if (sidebarData.helperType !== 'all' && searchType === 'helpers') {
      filtered = filtered.filter(item => item.type === sidebarData.helperType);
    }
    if (sidebarData.eventType !== 'all' && searchType === 'events') {
      filtered = filtered.filter(item => item.type === sidebarData.eventType);
    }
    
    // Filter by price
    filtered = filtered.filter(item => {
      const price = item.price || item.regularPrice || 0;
      return price >= sidebarData.priceMin && price <= sidebarData.priceMax;
    });
    
    // Filter by search term
    if (sidebarData.searchTerm) {
      const term = sidebarData.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.address && item.address.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();

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
                <MagnifyingGlassIcon className="w-4 h-4 " />
                <span className="text-gray-600">{sidebarData.address || 'Search...'}</span>
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {sidebarData.address 
                ? `${SEARCH_TYPES.find(t => t.id === searchType)?.label} in ${sidebarData.address}` 
                : `Explore ${SEARCH_TYPES.find(t => t.id === searchType)?.label}`}
            </h1>
            
            {/* Search Type Selector */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 bg-white">
                <span>{SEARCH_TYPES.find(t => t.id === searchType)?.label}</span>
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
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20">
                  {SEARCH_TYPES.map((type) => (
                    <Menu.Item key={type.id}>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setSearchType(type.id);
                            navigate(`/search?searchType=${type.id}`);
                          }}
                          className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''} ${
                            searchType === type.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          
          <p className="text-gray-600 text-sm">
            {filteredItems.length}+ {SEARCH_TYPES.find(t => t.id === searchType)?.label?.toLowerCase()} available • {sidebarData.address || 'All locations'}
          </p>
        </div>
      )}

      {/* Airbnb-style Sliding Tabs */}
      <SlidingTabs
        tabs={SEARCH_TYPES}
        activeTab={searchType}
        onTabClick={(tabId) => {
          setSearchType(tabId);
          navigate(`/search?searchType=${tabId}`);
        }}
      />

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
              {/* Search Input in Mobile Filter */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Search</h3>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="searchTerm"
                    value={sidebarData.searchTerm}
                    onChange={handleChange}
                    placeholder={`Search ${SEARCH_TYPES.find(t => t.id === searchType)?.label?.toLowerCase()}...`}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {getActiveTypeArray().map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const typeField = searchType === 'properties' ? 'type' : 
                                        searchType === 'services' ? 'serviceType' : 
                                        searchType === 'helpers' ? 'helperType' : 'eventType';
                        setSidebarData(prev => ({ ...prev, [typeField]: item.id }));
                      }}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        sidebarData[searchType === 'properties' ? 'type' : 
                                   searchType === 'services' ? 'serviceType' : 
                                   searchType === 'helpers' ? 'helperType' : 'eventType'] === item.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Price range</h3>
                  <span className="text-sm text-gray-500">
                    {searchType === 'properties' ? 'Trip price, includes all fees' : 
                     searchType === 'services' ? 'Service price' : 
                     searchType === 'helpers' ? 'Work price' : 'Ticket price'}
                  </span>
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
                Show {filteredItems.length}+ results
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
                    {/* Search Input in Desktop Filter */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Search</h3>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          id="searchTerm"
                          value={sidebarData.searchTerm}
                          onChange={handleChange}
                          placeholder={`Search ${SEARCH_TYPES.find(t => t.id === searchType)?.label?.toLowerCase()}...`}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Type</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {getActiveTypeArray().map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const typeField = searchType === 'properties' ? 'type' : 
                                              searchType === 'services' ? 'serviceType' : 
                                              searchType === 'helpers' ? 'helperType' : 'eventType';
                              setSidebarData(prev => ({ ...prev, [typeField]: item.id }));
                            }}
                            className={`p-4 border rounded-lg text-left transition-all ${
                              sidebarData[searchType === 'properties' ? 'type' : 
                                        searchType === 'services' ? 'serviceType' : 
                                        searchType === 'helpers' ? 'helperType' : 'eventType'] === item.id
                                ? 'border-black bg-gray-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{item.icon}</span>
                              <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Price range</h3>
                        <span className="text-sm text-gray-600">
                          {searchType === 'properties' ? 'Trip price, includes all fees' : 
                           searchType === 'services' ? 'Service price' : 
                           searchType === 'helpers' ? 'Work price' : 'Ticket price'}
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
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
                    >
                      Show {filteredItems.length}+ results
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
                    {filteredItems.length}+ {SEARCH_TYPES.find(t => t.id === searchType)?.label?.toLowerCase()} available
                  </h2>
                  {sidebarData.address && (
                    <p className="text-gray-600 text-sm">in {sidebarData.address} • Prices include all fees</p>
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
                            <button 
                              onClick={() => setSidebarData(prev => ({ ...prev, sort: 'createdAt', order: 'desc' }))}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                            >
                              Recommended
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button 
                              onClick={() => setSidebarData(prev => ({ ...prev, sort: 'price', order: 'asc' }))}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                            >
                              Price: Low to high
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button 
                              onClick={() => setSidebarData(prev => ({ ...prev, sort: 'price', order: 'desc' }))}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                            >
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
                  <MapView items={filteredItems} searchType={searchType} address={sidebarData.address} />
                </div>
              ) : (
                /* List View */
                loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                    {[...Array(6)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                      {filteredItems.map((item) => (
                        <ItemCard key={item._id} item={item} searchType={searchType} />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {showMore && (
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={() => {
                            const startIndex = filteredItems.length;
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

export default UniversalSearch;