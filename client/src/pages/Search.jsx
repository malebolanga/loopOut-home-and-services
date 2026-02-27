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
  X,
  Camera,
  Car,
  Hotel,
  Paintbrush,
  GraduationCap,
  Droplets,
  Scissors,
  Flower2,
  Zap,
  ChefHat,
  Truck,
  Settings,
  MoreHorizontal,
  Check,
  ArrowLeft
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

// Enhanced Categories Configuration with all user requested categories
const ALL_CATEGORIES = [
  // Properties & Accommodation
  { id: 'guest_house', label: 'Guest House', type: 'properties', icon: Hotel, color: 'bg-purple-100 text-purple-800', description: 'Guest houses & B&Bs' },
  { id: 'for_rent', label: 'For Rent', type: 'properties', icon: Home, color: 'bg-blue-100 text-blue-800', description: 'Rental properties' },
  { id: 'for_sale', label: 'For Sale', type: 'properties', icon: Tag, color: 'bg-emerald-100 text-emerald-800', description: 'Properties for sale' },
  { id: 'vacation', label: 'Vacation Rental', type: 'properties', icon: Sparkles, color: 'bg-pink-100 text-pink-800', description: 'Short-term stays' },
  
  // Services
  { id: 'photography', label: 'Photography', type: 'services', icon: Camera, color: 'bg-indigo-100 text-indigo-800', description: 'Photo & video services' },
  { id: 'car_wash', label: 'Car Wash', type: 'services', icon: Droplets, color: 'bg-cyan-100 text-cyan-800', description: 'Vehicle cleaning' },
  { id: 'landscaping', label: 'Landscaping', type: 'services', icon: Flower2, color: 'bg-green-100 text-green-800', description: 'Garden & lawn care' },
  { id: 'electrician', label: 'Electrician', type: 'services', icon: Zap, color: 'bg-yellow-100 text-yellow-800', description: 'Electrical services' },
  { id: 'maintenance', label: 'Maintenance', type: 'services', icon: Settings, color: 'bg-gray-100 text-gray-800', description: 'Repair & maintenance' },
  { id: 'catering', label: 'Catering', type: 'services', icon: ChefHat, color: 'bg-orange-100 text-orange-800', description: 'Event catering' },
  { id: 'moving', label: 'Moving & Transport', type: 'services', icon: Truck, color: 'bg-amber-100 text-amber-800', description: 'Relocation services' },
  
  // Helpers
  { id: 'domestic', label: 'Domestic Help', type: 'helpers', icon: Home, color: 'bg-teal-100 text-teal-800', description: 'Household assistance' },
  { id: 'tattoo', label: 'Tattoo Artist', type: 'helpers', icon: Paintbrush, color: 'bg-red-100 text-red-800', description: 'Tattoo & piercing' },
  { id: 'tutor', label: 'Private Tutor', type: 'helpers', icon: GraduationCap, color: 'bg-blue-100 text-blue-800', description: 'Personal teaching' },
  { id: 'hair', label: 'Hair & Beauty', type: 'helpers', icon: Scissors, color: 'bg-rose-100 text-rose-800', description: 'Salon services' },
  { id: 'nail', label: 'Nail Services', type: 'helpers', icon: Sparkles, color: 'bg-pink-100 text-pink-800', description: 'Manicure & pedicure' },
  { id: 'chef', label: 'Private Chef', type: 'helpers', icon: ChefHat, color: 'bg-amber-100 text-amber-800', description: 'Personal cooking' },
  { id: 'barber', label: 'Barber', type: 'helpers', icon: Scissors, color: 'bg-sky-100 text-sky-800', description: 'Men\'s grooming' },
  
  // Transport
  { id: 'transport', label: 'Transport', type: 'services', icon: Car, color: 'bg-blue-100 text-blue-800', description: 'Transportation services' },
];

// Property Types Configuration
const PROPERTY_TYPE_CONFIG = {
  rent: { label: 'For Rent', color: 'bg-blue-100 text-blue-800', icon: '🏠', endpoint: 'listing' },
  sale: { label: 'For Sale', color: 'bg-emerald-100 text-emerald-800', icon: '💰', endpoint: 'listing' },
  over: { label: 'Vacation Rental', color: 'bg-purple-100 text-purple-800', icon: '🌙', endpoint: 'listing' },
  land: { label: 'Land', color: 'bg-amber-100 text-amber-800', icon: '🪨', endpoint: 'listing' },
  office: { label: 'Office Space', color: 'bg-orange-100 text-orange-800', icon: '🏢', endpoint: 'listing' },
  guest_house: { label: 'Guest House', color: 'bg-pink-100 text-pink-800', icon: '🏨', endpoint: 'listing' }
};

// Helper Categories Configuration
const HELPER_CATEGORY_CONFIG = {
  beauty: { label: 'Beauty & Spa', color: 'bg-pink-100 text-pink-800', icon: '💅', endpoint: 'helper' },
  spa: { label: 'Spa Services', color: 'bg-purple-100 text-purple-800', icon: '🧖', endpoint: 'helper' },
  barber: { label: 'Barber', color: 'bg-blue-100 text-blue-800', icon: '💇', endpoint: 'helper' },
  chef: { label: 'Personal Chef', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳', endpoint: 'helper' },
  cooking: { label: 'Cooking Services', color: 'bg-amber-100 text-amber-800', icon: '🍳', endpoint: 'helper' },
  tattoo: { label: 'Tattoo Artist', color: 'bg-red-100 text-red-800', icon: '💉', endpoint: 'helper' },
  tutor: { label: 'Tutoring', color: 'bg-green-100 text-green-800', icon: '📚', endpoint: 'helper' },
  photography: { label: 'Photography', color: 'bg-indigo-100 text-indigo-800', icon: '📸', endpoint: 'helper' },
  domestic: { label: 'Domestic Help', color: 'bg-teal-100 text-teal-800', icon: '🧹', endpoint: 'helper' },
  maid: { label: 'Maid Services', color: 'bg-cyan-100 text-cyan-800', icon: '🧼', endpoint: 'helper' },
  hair: { label: 'Hair & Beauty', color: 'bg-rose-100 text-rose-800', icon: '💇‍♀️', endpoint: 'helper' },
  nail: { label: 'Nail Services', color: 'bg-pink-100 text-pink-800', icon: '💅', endpoint: 'helper' }
};

// Services Categories Configuration
const SERVICES_CATEGORY_CONFIG = {
  car_wash: { label: 'Car Wash', color: 'bg-cyan-100 text-cyan-800', icon: '🚗', endpoint: 'service' },
  landscaping: { label: 'Landscaping', color: 'bg-green-100 text-green-800', icon: '🌿', endpoint: 'service' },
  electrician: { label: 'Electrician', color: 'bg-yellow-100 text-yellow-800', icon: '⚡', endpoint: 'service' },
  maintenance: { label: 'Maintenance', color: 'bg-gray-100 text-gray-800', icon: '🔧', endpoint: 'service' },
  catering: { label: 'Catering', color: 'bg-orange-100 text-orange-800', icon: '🍽️', endpoint: 'service' },
  moving: { label: 'Moving & Transport', color: 'bg-amber-100 text-amber-800', icon: '🚚', endpoint: 'service' },
  transport: { label: 'Transport', color: 'bg-blue-100 text-blue-800', icon: '🚕', endpoint: 'service' }
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
    endpoint: 'service',
    subTypes: SERVICES_CATEGORY_CONFIG
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

// Slide-Open Search Panel Component
const SlideOpenSearch = ({ 
  isOpen, 
  onClose, 
  searchTerm, 
  setSearchTerm, 
  onSearch,
  selectedCategory,
  onCategoryClick,
  recentSearches = []
}) => {
  const inputRef = useRef(null);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const clearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Slide Panel */}
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-white z-50 shadow-2xl rounded-b-3xl overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 z-10">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onSearch();
                      onClose();
                    }
                  }}
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => { onSearch(); onClose(); }}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Selected Category Badge */}
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Searching in:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                    {(() => {
                      const cat = ALL_CATEGORIES.find(c => c.id === selectedCategory);
                      if (!cat) return selectedCategory;
                      const Icon = cat.icon;
                      return (
                        <>
                          <Icon className="w-3 h-3" />
                          {cat.label}
                        </>
                      );
                    })()}
                  </span>
                  <button 
                    onClick={() => onCategoryClick && onCategoryClick(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !searchTerm && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(search);
                          onSearch();
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                          <Search className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-gray-700 font-medium">{search}</span>
                        <ArrowUpDown className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ALL_CATEGORIES.slice(0, 8).map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          onCategoryClick && onCategoryClick(category);
                          onClose();
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-rose-500 bg-rose-50 text-rose-700' 
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${category.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-center leading-tight">
                          {category.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All Categories List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">All Categories</h3>
                <div className="space-y-1">
                  {ALL_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          onCategoryClick && onCategoryClick(category);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                          isSelected ? 'bg-rose-50 text-rose-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{category.label}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
                    Under R1000
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
                    Top Rated
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
                    Available Now
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
                    Near Me
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Category Dropdown Component (for compact view)
const CategoryDropdown = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedCategory,
  searchQuery,
  setSearchQuery 
}) => {
  const dropdownRef = useRef(null);
  
  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return ALL_CATEGORIES;
    const query = searchQuery.toLowerCase();
    return ALL_CATEGORIES.filter(cat => 
      cat.label.toLowerCase().includes(query) || 
      cat.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group by type
  const groupedCategories = useMemo(() => {
    const groups = {};
    filteredCategories.forEach(cat => {
      if (!groups[cat.type]) groups[cat.type] = [];
      groups[cat.type].push(cat);
    });
    return groups;
  }, [filteredCategories]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getGroupLabel = (type) => {
    switch(type) {
      case 'properties': return '🏠 Properties & Accommodation';
      case 'services': return '🔧 Services';
      case 'helpers': return '👤 Helpers & Professionals';
      default: return 'Other';
    }
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto"
    >
      {/* Search within dropdown */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-3 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Categories list */}
      <div className="p-2">
        {Object.entries(groupedCategories).map(([type, categories]) => (
          <div key={type} className="mb-4">
            <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {getGroupLabel(type)}
            </h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => onSelect(category)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
                      isSelected 
                        ? 'bg-rose-50 border-rose-200 border' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${category.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-rose-700' : 'text-gray-900'}`}>
                          {category.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-rose-500" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No categories found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Quick select footer */}
      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Press ESC to close</span>
          <span>{filteredCategories.length} categories available</span>
        </div>
      </div>
    </motion.div>
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
  if (!subConfig && itemType === 'services' && itemSubType) {
    subConfig = SERVICES_CATEGORY_CONFIG[itemSubType];
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

  // Slide-open search panel state
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  
  // Category dropdown state (for compact view)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  // Recent searches
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const type = urlParams.get('type') || 'all';
    const subType = urlParams.get('subType') || '';
    
    setSearchTerm(urlParams.get('searchTerm') || '');
    setSearchType(type);
    setSearchSubType(subType);
    setFilters({
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
      minRating: urlParams.get('minRating') || '',
      location: urlParams.get('location') || ''
    });

    // Set selected category if subType matches
    if (subType) {
      const category = ALL_CATEGORIES.find(c => c.id === subType);
      if (category) setSelectedCategory(category.id);
    }
    
    // Load recent searches from localStorage
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches');
      }
    }
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
        
        if (endpoint === 'service' && subType && SERVICES_CATEGORY_CONFIG[subType]) {
          url += `&category=${subType}`;
        }
        
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
      const propertyTypes = subType ? [subType] : ['rent', 'sale', 'over', 'land', 'office', 'guest_house'];
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
      const helperTypes = subType ? [subType] : ['beauty', 'barber', 'chef', 'tattoo', 'tutor', 'photography', 'domestic', 'hair', 'nail'];
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
      const serviceTypes = subType ? [subType] : ['car_wash', 'landscaping', 'electrician', 'maintenance', 'catering', 'moving', 'transport'];
      serviceTypes.forEach((serviceType, index) => {
        if (SERVICES_CATEGORY_CONFIG[serviceType]) {
          mockData.push({
            _id: `s${index}`,
            name: `${SERVICES_CATEGORY_CONFIG[serviceType].label} Service`,
            price: 350 + (index * 50),
            itemType: 'services',
            subType: serviceType,
            imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
            rating: 4.8,
            address: 'Cape Town',
            lat: -33.9249 + (Math.random() - 0.5) * 0.05,
            lng: 18.4241 + (Math.random() - 0.5) * 0.05,
          });
        }
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
    
    // Save to recent searches
    if (searchTerm && !recentSearches.includes(searchTerm)) {
      const newRecent = [searchTerm, ...recentSearches.slice(0, MAX_RECENT_SEARCHES - 1)];
      setRecentSearches(newRecent);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
    }
  }, [searchTerm, searchType, searchSubType, filters, navigate, recentSearches]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchType('all');
    setSearchSubType('');
    setSelectedCategory(null);
    setCategorySearchQuery('');
    setFilters({ minPrice: '', maxPrice: '', minRating: '', location: '' });
    navigate('/search');
  };

  const addToRecentlyViewed = (item, itemType) => {
    navigate(`/${itemType}/${item._id}`);
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchSubType('');
    setSelectedCategory(null);
    handleSearch();
  };

  const handleSubTypeChange = (subType) => {
    setSearchSubType(subType);
    handleSearch();
  };

  const handleCategorySelect = (category) => {
    if (!category) {
      setSelectedCategory(null);
      setSearchType('all');
      setSearchSubType('');
      return;
    }
    setSelectedCategory(category.id);
    setSearchType(category.type);
    setSearchSubType(category.id);
    setShowCategoryDropdown(false);
    setCategorySearchQuery('');
    
    // Trigger search immediately
    const urlParams = new URLSearchParams();
    if (searchTerm) urlParams.set('searchTerm', searchTerm);
    urlParams.set('type', category.type);
    urlParams.set('subType', category.id);
    if (filters.location) urlParams.set('location', filters.location);
    
    navigate(`/search?${urlParams.toString()}`);
  };

  // Toggle between map and list views
  const toggleMapView = () => {
    setViewMode(prev => prev === 'map' ? 'grid' : 'map');
  };

  // Get display text for selected category
  const getSelectedCategoryLabel = () => {
    if (selectedCategory) {
      const category = ALL_CATEGORIES.find(c => c.id === selectedCategory);
      return category ? category.label : 'Select category';
    }
    return 'Select category';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Slide-Open Search Panel */}
      <SlideOpenSearch
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategorySelect}
        recentSearches={recentSearches}
      />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#DDDDDD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-3xl relative">
                {/* Enhanced Search Bar with Click-to-Expand */}
                <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow relative">
                  
                  {/* Category Selector Button */}
                  <button 
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex-shrink-0 px-6 py-3.5 text-left hover:bg-gray-100 rounded-l-full transition-colors border-r border-gray-300 flex items-center gap-2 min-w-[140px]"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900">Category</div>
                      <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                        {selectedCategory ? (
                          <>
                            {(() => {
                              const cat = ALL_CATEGORIES.find(c => c.id === selectedCategory);
                              const Icon = cat?.icon || Sparkles;
                              return <Icon className="w-3 h-3" />;
                            })()}
                            <span className="truncate max-w-[100px]">{getSelectedCategoryLabel()}</span>
                          </>
                        ) : (
                          'All categories'
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Search Input - Click to open slide panel */}
                  <div 
                    className="flex-1 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsSearchPanelOpen(true)}
                  >
                    <div className="text-xs font-bold text-gray-900 mb-0.5">Search</div>
                    <div className="w-full text-sm text-gray-700 placeholder-gray-400 truncate">
                      {searchTerm ? searchTerm : 'Search anything...'}
                    </div>
                  </div>

                  {/* Location Quick Button */}
                  <button 
                    onClick={() => setShowFilters(true)}
                    className="flex-shrink-0 px-4 py-3.5 text-left hover:bg-gray-100 transition-colors border-l border-gray-300 hidden sm:block"
                  >
                    <div className="text-xs font-bold text-gray-900">Where</div>
                    <div className="text-sm text-gray-500 truncate max-w-[100px]">
                      {filters.location || 'Anywhere'}
                    </div>
                  </button>
                  
                  {/* Search Button */}
                  <button 
                    onClick={handleSearch} 
                    className="m-1.5 p-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    <SearchIcon className="w-5 h-5" />
                    <span className="hidden sm:inline font-semibold text-sm pr-1">Search</span>
                  </button>
                </div>

                {/* Category Dropdown */}
                <AnimatePresence>
                  {showCategoryDropdown && (
                    <CategoryDropdown
                      isOpen={showCategoryDropdown}
                      onClose={() => setShowCategoryDropdown(false)}
                      onSelect={handleCategorySelect}
                      selectedCategory={selectedCategory}
                      searchQuery={categorySearchQuery}
                      setSearchQuery={setCategorySearchQuery}
                    />
                  )}
                </AnimatePresence>
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

          {/* CATEGORY FILTER TABS SECTION REMOVED */}
          
        </div>
      </div>

      {/* Results Count & Mobile Map Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {listings.length} {listings.length === 1 ? 'result' : 'results'}
            {selectedCategory && (
              <span className="text-gray-500 font-normal"> in {getSelectedCategoryLabel()}</span>
            )}
            {filters.location && <span className="text-gray-500 font-normal"> near {filters.location}</span>}
          </h1>
       
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