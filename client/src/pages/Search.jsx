import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Map,
  Grid3X3,
  List,
  ArrowUpDown,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  MapPin,
  Bed,
  Bath,
  Sparkles,
  RotateCcw,
  Compass,
  Home,
  Wrench,
  Users,
  Calendar,
  DollarSign,
  Tag,
  Building,
  Search,
  ChevronDown,
  X
} from 'lucide-react';

// Import Leaflet for map functionality
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different types
const createCustomIcon = (type, isHovered = false) => {
  const colors = {
    properties: '#f43f5e', // rose-500
    services: '#3b82f6',   // blue-500
    helpers: '#f59e0b',    // amber-500
    events: '#10b981',     // emerald-500
    default: '#6b7280'     // gray-500
  };
  
  const color = colors[type] || colors.default;
  const size = isHovered ? 40 : 32;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        transition: all 0.2s;
        transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};
      ">
        ${type === 'properties' ? '🏠' : type === 'services' ? '🔧' : type === 'helpers' ? '👤' : '📍'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Property Types Configuration
const PROPERTY_TYPE_CONFIG = {
  rent: { label: 'For Rent', color: 'bg-blue-100 text-blue-800', icon: '🏠', endpoint: 'listing' },
  sale: { label: 'For Sale', color: 'bg-emerald-100 text-emerald-800', icon: '💰', endpoint: 'listing' },
  over: { label: 'Vacation Rental', color: 'bg-purple-100 text-purple-800', icon: '🌙', endpoint: 'listing' },
  land: { label: 'Land', color: 'bg-amber-100 text-amber-800', icon: '🪨', endpoint: 'listing' },
  office: { label: 'Office Space', color: 'bg-orange-100 text-orange-800', icon: '🏢', endpoint: 'listing' }
};

// Helper Categories Configuration
const HELPER_CATEGORY_CONFIG = {
  beauty: { label: 'Beauty & Spa', color: 'bg-pink-100 text-pink-800', icon: '💅', endpoint: 'helper' },
  spa: { label: 'Spa Services', color: 'bg-purple-100 text-purple-800', icon: '🧖', endpoint: 'helper' },
  barber: { label: 'Barber', color: 'bg-blue-100 text-blue-800', icon: '💇', endpoint: 'helper' },
  barbar: { label: 'Barber', color: 'bg-blue-100 text-blue-800', icon: '💇', endpoint: 'helper' },
  chef: { label: 'Personal Chef', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳', endpoint: 'helper' },
  cooking: { label: 'Cooking Services', color: 'bg-amber-100 text-amber-800', icon: '🍳', endpoint: 'helper' },
  tattoo: { label: 'Tattoo Artist', color: 'bg-red-100 text-red-800', icon: '💉', endpoint: 'helper' },
  tutor: { label: 'Tutoring', color: 'bg-green-100 text-green-800', icon: '📚', endpoint: 'helper' },
  photography: { label: 'Photography', color: 'bg-indigo-100 text-indigo-800', icon: '📸', endpoint: 'helper' },
  domestic: { label: 'Domestic Help', color: 'bg-teal-100 text-teal-800', icon: '🧹', endpoint: 'helper' },
  maid: { label: 'Maid Services', color: 'bg-cyan-100 text-cyan-800', icon: '🧼', endpoint: 'helper' }
};

// Main Search Type Configuration
const SEARCH_TYPE_CONFIG = {
  all: {
    label: 'All',
    icon: Sparkles,
    color: 'from-gray-900 to-gray-800',
    bgColor: 'bg-gray-900',
    textColor: 'text-gray-900',
    endpoint: 'all'
  },
  properties: {
    label: 'Properties',
    icon: Home,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    endpoint: 'listing',
    subTypes: PROPERTY_TYPE_CONFIG
  },
  services: {
    label: 'Services',
    icon: Wrench,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    endpoint: 'service'
  },
  helpers: {
    label: 'Helpers',
    icon: Users,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    endpoint: 'helper',
    subTypes: HELPER_CATEGORY_CONFIG
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// Map Bounds Fitter Component
const MapBoundsFitter = ({ listings }) => {
  const map = useMap();
  
  useEffect(() => {
    if (listings.length > 0) {
      const bounds = L.latLngBounds();
      listings.forEach(item => {
        if (item.coordinates || (item.lat && item.lng)) {
          const lat = item.coordinates?.lat || item.lat;
          const lng = item.coordinates?.lng || item.lng;
          bounds.extend([lat, lng]);
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [listings, map]);
  
  return null;
};

// Map Component
const ResultsMap = ({ listings, hoveredItem, onMarkerClick }) => {
  // Default center (South Africa)
  const defaultCenter = [-26.2041, 28.0473];
  
  // Generate mock coordinates for items without them
  const listingsWithCoords = useMemo(() => {
    return listings.map((item, index) => {
      if (item.coordinates || (item.lat && item.lng)) return item;
      
      // Generate pseudo-random coordinates around default center for demo
      const offset = index * 0.01;
      return {
        ...item,
        lat: defaultCenter[0] + (Math.random() - 0.5) * 0.1 + offset,
        lng: defaultCenter[1] + (Math.random() - 0.5) * 0.1 + offset,
      };
    });
  }, [listings]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsFitter listings={listingsWithCoords} />
        
        {listingsWithCoords.map((item) => {
          const lat = item.coordinates?.lat || item.lat;
          const lng = item.coordinates?.lng || item.lng;
          const isHovered = hoveredItem === item._id;
          
          if (!lat || !lng) return null;
          
          return (
            <Marker
              key={item._id}
              position={[lat, lng]}
              icon={createCustomIcon(item.itemType, isHovered)}
              eventHandlers={{
                click: () => onMarkerClick(item),
                mouseover: () => onMarkerClick(item._id),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <img 
                    src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'} 
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold text-gray-900 truncate">{item.name || item.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.address || item.location}</p>
                  <p className="font-semibold text-rose-600 mt-1">
                    R{item.price || item.regularPrice || item.hourlyRate || 'Contact'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

const ResultCard = ({ item, index, viewMode, onClick, isHovered, onHover }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const getItemType = () => {
    const type = item.itemType || item.type || 'properties';
    if (type === 'listing') return 'properties';
    if (type === 'property') return 'properties';
    if (type === 'service') return 'services';
    if (type === 'helper') return 'helpers';
    if (type === 'event') return 'events';
    return type;
  };
  
  const getItemSubType = () => {
    return item.subType || item.type || item.category || item.serviceType || '';
  };
  
  const itemType = getItemType();
  const itemSubType = getItemSubType();
  
  const mainConfig = SEARCH_TYPE_CONFIG[itemType] || {
    label: itemType.charAt(0).toUpperCase() + itemType.slice(1),
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    endpoint: itemType
  };
  
  let subConfig = null;
  if (mainConfig?.subTypes && itemSubType) {
    subConfig = mainConfig.subTypes[itemSubType];
  }
  if (!subConfig && itemType === 'helpers' && itemSubType) {
    subConfig = HELPER_CATEGORY_CONFIG[itemSubType];
  }
  if (!subConfig && itemType === 'properties' && itemSubType) {
    subConfig = PROPERTY_TYPE_CONFIG[itemSubType];
  }

  const getImageUrl = () => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
    if (item.images && item.images.length > 0) return item.images[0];
    if (item.imageUrl) return item.imageUrl;
    const defaultImages = {
      properties: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      services: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      helpers: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      events: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
    };
    return defaultImages[itemType] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
  };

  const getPrice = () => {
    if (item.price) return `R${item.price}`;
    if (item.regularPrice) return `R${item.regularPrice}`;
    if (item.hourlyRate) return `R${item.hourlyRate}/hr`;
    if (item.dailyRate) return `R${item.dailyRate}/day`;
    return 'Contact for price';
  };

  const getRating = () => item.rating || item.averageRating || 4.5;
  const getLocation = () => item.address || item.location || item.city || 'Location not specified';

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 5 }}
        onClick={onClick}
        onMouseEnter={() => onHover?.(item._id)}
        onMouseLeave={() => onHover?.(null)}
        className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border ${
          isHovered ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-100'
        } flex gap-4`}
      >
        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img src={getImageUrl()} alt={item.name || item.title} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{item.name || item.title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 truncate">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{getLocation()}</span>
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
              className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              {isLiked ? <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> : <Heart className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 flex-wrap">
            {item.bedrooms !== undefined && <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {item.bedrooms}</span>}
            {item.bathrooms !== undefined && <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {item.bathrooms}</span>}
            {item.skills && <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">{Array.isArray(item.skills) ? item.skills[0] : item.skills}</span>}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{getRating().toFixed(1)}</span>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">{getPrice()}</span>
            <div className="flex gap-1">
              {subConfig && <span className={`text-xs px-2 py-1 rounded-full ${subConfig.color || 'bg-gray-100 text-gray-700'}`}>{subConfig.label || itemSubType}</span>}
              <span className={`text-xs px-2 py-1 rounded-full ${mainConfig.bgColor || 'bg-gray-100'} ${mainConfig.textColor || 'text-gray-700'}`}>{mainConfig.label || itemType}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      onMouseEnter={() => onHover?.(item._id)}
      onMouseLeave={() => onHover?.(null)}
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col group ${
        isHovered ? 'ring-2 ring-rose-500' : ''
      }`}
    >
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img src={getImageUrl()} alt={item.name || item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
        >
          {isLiked ? <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> : <Heart className="w-4 h-4 text-gray-600" />}
        </button>
        {isHovered && (
          <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-rose-600 shadow-lg">View on map</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate text-base">{item.name || item.title}</h3>
          <div className="flex items-center gap-1 text-sm flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-gray-900 fill-current" />
            <span className="text-gray-900">{getRating().toFixed(1)}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm truncate mt-1">{getLocation()}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-gray-900 text-lg">{getPrice()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onClear }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-12 text-center border border-gray-100">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Search className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
    <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
    <button onClick={onClear} className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
      Clear all filters
    </button>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden">
    <div className="h-64 bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
    </div>
  </div>
);

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchType, setSearchType] = useState('all');
  const [searchSubType, setSearchSubType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'map'
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setSearchTerm(urlParams.get('searchTerm') || '');
    setSearchType(urlParams.get('type') || 'all');
    setSearchSubType(urlParams.get('subType') || '');
    setFilters({
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
      minRating: urlParams.get('minRating') || '',
      location: urlParams.get('location') || ''
    });
  }, [location.search]);

  const fetchData = useCallback(async () => {
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.toString()) {
      setListings([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const type = urlParams.get('type') || 'all';
      const subType = urlParams.get('subType') || '';
      const searchTerm = urlParams.get('searchTerm') || '';
      const minPrice = urlParams.get('minPrice');
      const maxPrice = urlParams.get('maxPrice');
      const location = urlParams.get('location') || '';
      const minRating = urlParams.get('minRating');
      
      let endpoints = [];
      
      if (type === 'all') {
        endpoints = ['listing', 'service', 'helper'];
      } else {
        const config = SEARCH_TYPE_CONFIG[type];
        if (config) endpoints = [config.endpoint];
      }
      
      const fetchPromises = endpoints.map(async (endpoint) => {
        let url = `/api/${endpoint}/get?limit=${DEFAULT_LISTING_LIMIT}`;
        
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (location) {
          if (endpoint === 'listing' || endpoint === 'helper') {
            url += `&address=${encodeURIComponent(location)}`;
          } else {
            url += `&location=${encodeURIComponent(location)}`;
          }
        }
        
        if (endpoint === 'listing') {
          if (minPrice) url += `&minPrice=${minPrice}`;
          if (maxPrice) url += `&maxPrice=${maxPrice}`;
          if (subType && PROPERTY_TYPE_CONFIG[subType]) url += `&type=${subType}`;
        }
        
        if (endpoint === 'helper' && subType && HELPER_CATEGORY_CONFIG[subType]) {
          url += `&category=${subType}`;
        }
        
        if (endpoint === 'service' && subType) url += `&category=${subType}`;
        
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            return data.map(item => ({ 
              ...item, 
              itemType: endpoint === 'listing' ? 'properties' : endpoint,
              subType: item.type || item.category || subType
            }));
          }
        } catch (err) {
          console.error(`Error fetching from ${endpoint}:`, err);
        }
        return [];
      });
      
      const results = await Promise.all(fetchPromises);
      let combinedResults = results.flat();
      
      if (minRating) {
        const ratingThreshold = parseFloat(minRating);
        combinedResults = combinedResults.filter(item => (item.rating || 4.5) >= ratingThreshold);
      }
      
      setListings(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
      const mockData = generateMockData(urlParams);
      setListings(mockData);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  const generateMockData = (urlParams) => {
    const type = urlParams.get('type') || 'all';
    const subType = urlParams.get('subType') || '';
    const mockData = [];
    
    if (type === 'all' || type === 'properties') {
      const propertyTypes = subType ? [subType] : ['rent', 'sale', 'over', 'land', 'office'];
      propertyTypes.forEach((propType, index) => {
        if (PROPERTY_TYPE_CONFIG[propType]) {
          mockData.push({
            _id: `p${index}`,
            name: `${PROPERTY_TYPE_CONFIG[propType].label} in Sandton`,
            price: 5000 + (index * 2000),
            itemType: 'properties',
            subType: propType,
            imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
            rating: 4.5 + (index * 0.1),
            address: 'Sandton, Johannesburg',
            bedrooms: 2 + index,
            bathrooms: 1 + index,
            lat: -26.2041 + (Math.random() - 0.5) * 0.1,
            lng: 28.0473 + (Math.random() - 0.5) * 0.1,
          });
        }
      });
    }
    
    if (type === 'all' || type === 'helpers') {
      const helperTypes = subType ? [subType] : ['beauty', 'barber', 'chef', 'tattoo', 'tutor', 'photography', 'domestic'];
      helperTypes.forEach((helperType, index) => {
        if (HELPER_CATEGORY_CONFIG[helperType]) {
          mockData.push({
            _id: `h${index}`,
            name: `Professional ${HELPER_CATEGORY_CONFIG[helperType].label}`,
            price: 300 + (index * 100),
            itemType: 'helpers',
            subType: helperType,
            imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
            rating: 4.7 + (index * 0.05),
            address: 'Cape Town',
            skills: [HELPER_CATEGORY_CONFIG[helperType].label],
            lat: -33.9249 + (Math.random() - 0.5) * 0.1,
            lng: 18.4241 + (Math.random() - 0.5) * 0.1,
          });
        }
      });
    }
    
    if (type === 'all' || type === 'services') {
      mockData.push({
        _id: 's1',
        name: 'Professional Cleaning Service',
        price: 350,
        itemType: 'services',
        imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
        rating: 4.9,
        address: 'Cape Town',
        lat: -33.9249,
        lng: 18.4241,
      });
    }
    
    return mockData;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    const urlParams = new URLSearchParams();
    if (searchTerm) urlParams.set('searchTerm', searchTerm);
    if (searchType !== 'all') urlParams.set('type', searchType);
    if (searchSubType) urlParams.set('subType', searchSubType);
    if (filters.minPrice) urlParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) urlParams.set('maxPrice', filters.maxPrice);
    if (filters.minRating) urlParams.set('minRating', filters.minRating);
    if (filters.location) urlParams.set('location', filters.location);
    
    navigate(`/search?${urlParams.toString()}`);
  }, [searchTerm, searchType, searchSubType, filters, navigate]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchType('all');
    setSearchSubType('');
    setFilters({ minPrice: '', maxPrice: '', minRating: '', location: '' });
    navigate('/search');
  };

  const addToRecentlyViewed = (item, itemType) => {
    navigate(`/${itemType}/${item._id}`);
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchSubType('');
    handleSearch();
  };

  const handleSubTypeChange = (subType) => {
    setSearchSubType(subType);
    handleSearch();
  };

  const getSubTypes = () => {
    if (searchType === 'properties') return PROPERTY_TYPE_CONFIG;
    if (searchType === 'helpers') return HELPER_CATEGORY_CONFIG;
    return {};
  };

  const subTypes = getSubTypes();
  const hasSubTypes = Object.keys(subTypes).length > 0;

  // Toggle between map and list views
  const toggleMapView = () => {
    setViewMode(prev => prev === 'map' ? 'grid' : 'map');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <button className="flex-1 px-6 py-3.5 text-left hover:bg-gray-100 rounded-full transition-colors border-r border-gray-300">
                    <div className="text-xs font-bold text-gray-900">Where</div>
                    <div className="text-sm text-gray-500 truncate">{filters.location || searchTerm || 'Search destinations'}</div>
                  </button>
                  
                  <button className="px-6 py-3.5 text-left hover:bg-gray-100 rounded-full transition-colors border-r border-gray-300 hidden sm:block">
                    <div className="text-xs font-bold text-gray-900">Type</div>
                    <div className="text-sm text-gray-500">{SEARCH_TYPE_CONFIG[searchType].label}</div>
                  </button>
                  
                  <button onClick={handleSearch} className="m-1.5 p-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors flex items-center gap-2">
                    <SearchIcon className="w-5 h-5" />
                    <span className="hidden sm:inline font-semibold text-sm pr-1">Search</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="font-medium text-sm hidden sm:inline">Filters</span>
                </button>
                
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={toggleMapView} className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    <Map className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-1">
              {Object.entries(SEARCH_TYPE_CONFIG).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`flex flex-col items-center gap-2 min-w-[64px] group pb-2 border-b-2 transition-all ${
                    searchType === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <value.icon className={`w-6 h-6 ${searchType === key ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="text-xs font-medium whitespace-nowrap">{value.label}</span>
                </button>
              ))}
            </div>

            {hasSubTypes && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={() => handleSubTypeChange('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    !searchSubType ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                  }`}
                >
                  All {SEARCH_TYPE_CONFIG[searchType].label}
                </button>
                {Object.entries(subTypes).slice(0, 6).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleSubTypeChange(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                      searchSubType === key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Results Count & Mobile Map Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {listings.length} {listings.length === 1 ? 'result' : 'results'}
            {filters.location && <span className="text-gray-500 font-normal"> in {filters.location}</span>}
          </h1>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort by: Recommended
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Mobile Map Toggle Button */}
            <button
              onClick={toggleMapView}
              className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Map className="w-4 h-4" />
              {viewMode === 'map' ? 'Show list' : 'Show map'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length > 0 ? (
          <>
            {viewMode === 'map' ? (
              // Map View
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)] min-h-[600px]">
                {/* List Side - Scrollable */}
                <div className="lg:w-1/2 xl:w-5/12 overflow-y-auto pr-2 space-y-4 max-h-[600px] lg:max-h-none">
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {listings.map((item, index) => (
                      <ResultCard
                        key={`${item._id}-${index}`}
                        item={item}
                        index={index}
                        viewMode="list"
                        onClick={() => addToRecentlyViewed(item, item.itemType)}
                        isHovered={hoveredItem === item._id}
                        onHover={setHoveredItem}
                      />
                    ))}
                  </motion.div>
                </div>
                
                {/* Map Side - Sticky */}
                <div className="lg:w-1/2 xl:w-7/12 lg:sticky lg:top-24 h-[400px] lg:h-auto">
                  <ResultsMap 
                    listings={listings} 
                    hoveredItem={hoveredItem}
                    onMarkerClick={(item) => {
                      if (typeof item === 'string') {
                        setHoveredItem(item);
                      } else {
                        addToRecentlyViewed(item, item.itemType);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              // Grid/List View
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid ${
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
                } gap-6`}
              >
                {listings.map((item, index) => (
                  <ResultCard
                    key={`${item._id}-${index}`}
                    item={item}
                    index={index}
                    viewMode={viewMode}
                    onClick={() => addToRecentlyViewed(item, item.itemType)}
                  />
                ))}
              </motion.div>
            )}
          </>
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </main>

      {/* Floating Map Toggle Button (Mobile) */}
      {viewMode !== 'map' && listings.length > 0 && (
        <button
          onClick={toggleMapView}
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 hover:bg-gray-800 transition-colors"
        >
          <Map className="w-5 h-5" />
          <span className="font-medium">Show results on map</span>
        </button>
      )}

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 md:inset-0 md:left-auto md:w-full md:max-w-md bg-white z-50 md:h-full md:shadow-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setFilters({ minPrice: '', maxPrice: '', minRating: '', location: '' })} className="text-sm font-medium underline">
                  Clear all
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      placeholder="Where are you looking?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Price range</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 mb-1 block">Minimum</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 mb-1 block">Maximum</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                        <input
                          type="number"
                          placeholder="Any"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Minimum rating</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, minRating: filters.minRating === rating.toString() ? '' : rating.toString() })}
                        className={`flex-1 py-3 rounded-xl border transition-all ${
                          filters.minRating === rating.toString() 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">{rating}+</span>
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Search term</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, description..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowFilters(false)} 
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { handleSearch(); setShowFilters(false); }}
                    className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
                  >
                    Show results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;