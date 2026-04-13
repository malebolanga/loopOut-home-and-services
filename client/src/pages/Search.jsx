import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '../components/ImageWithFallback';
import useLocationCoords from '../hooks/useGeolocation';
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
  ArrowLeft,
  Briefcase
} from 'lucide-react';

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

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

  // Daily Essentials (for Homepage consistency)
  { id: 'daily', label: 'Daily Loop', type: 'services', icon: Sparkles, color: 'bg-green-100 text-green-800', description: 'Essentials & daily needs' },
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
  transport: { label: 'Transport', color: 'bg-blue-100 text-blue-800', icon: '🚕', endpoint: 'service' },
  daily: { label: 'Daily Loop', color: 'bg-green-100 text-green-800', icon: '✨', endpoint: 'service' }
};

// Events Categories Configuration
const EVENTS_CATEGORY_CONFIG = {
  music: { label: 'Music', color: 'bg-purple-100 text-purple-800', icon: '🎵', endpoint: 'event' },
  art: { label: 'Art', color: 'bg-pink-100 text-pink-800', icon: '🎨', endpoint: 'event' },
  food: { label: 'Food & Wine', color: 'bg-red-100 text-red-800', icon: '🍷', endpoint: 'event' },
  tech: { label: 'Tech', color: 'bg-blue-100 text-blue-800', icon: '💻', endpoint: 'event' },
};

// Main Search Type Configuration
const SEARCH_TYPE_CONFIG = {
  all: {
    label: 'Everything',
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
    label: 'Professional Services',
    icon: Wrench,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    endpoint: 'service',
    subTypes: SERVICES_CATEGORY_CONFIG
  },
  helpers: {
    label: 'Local Helpers',
    icon: Users,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    endpoint: 'helper',
    subTypes: HELPER_CATEGORY_CONFIG
  },
  events: {
    label: 'Exclusive Events',
    icon: Calendar,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
    endpoint: 'event',
    subTypes: EVENTS_CATEGORY_CONFIG
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

// No SlideOpenSearch needed - Using normal header input

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
    switch (type) {
      case 'properties': return '🏠 Properties & Accommodation';
      case 'services': return '🔧 Services';
      case 'helpers': return '👤 Helpers & Professionals';
      case 'events': return '🎪 Events';
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
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[400px] flex flex-col"
    >
      {/* Search within dropdown - Fixed */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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

      {/* Categories list - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2">
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${isSelected
                      ? 'bg-rose-50 border-rose-200 border'
                      : 'hover:bg-gray-50 border border-transparent'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${category.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm truncate ${isSelected ? 'text-rose-700' : 'text-gray-900'}`}>
                          {category.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{category.description}</p>
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

      {/* Quick select footer - Fixed */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Press ESC to close</span>
          <span>{filteredCategories.length} categories</span>
        </div>
      </div>
    </motion.div>
  );
};

const ResultCard = ({ item, index, viewMode, onClick }) => {
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
  if (!subConfig && itemType === 'events' && itemSubType) {
    subConfig = EVENTS_CATEGORY_CONFIG[itemSubType];
  }

  const getImageUrl = () => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
    if (item.images && item.images.length > 0) return item.images[0];
    if (item.imageUrl) return item.imageUrl;
    return null;
  };

  const getAllImages = () => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls;
    if (item.images && item.images.length > 0) return item.images;
    if (item.imageUrl) return [item.imageUrl];
    return [];
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
        whileHover={{ x: 8, scale: 1.01 }}
        onClick={onClick}
        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-100 flex gap-5 group overflow-hidden relative"
      >
        <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
          <ImageWithFallback
            src={getImageUrl()}
            imageUrls={getAllImages()}
            type={itemType === 'listing' ? 'property' : (itemType === 'helper' ? 'helper' : (itemType === 'event' ? 'event' : 'service'))}
            alt={item.name || item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate tracking-tight">{item.name || item.title}</h3>
              <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <p className="text-xs font-medium truncate">{getLocation()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 text-gray-950 fill-gray-950" />
              <span className="text-sm font-medium text-gray-950">{getRating().toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
            {item.bedrooms !== undefined && <span>{item.bedrooms} bedrooms</span>}
            {item.bedrooms !== undefined && item.bathrooms !== undefined && <span className="text-gray-300">•</span>}
            {item.bathrooms !== undefined && <span>{item.bathrooms} bathrooms</span>}
          </div>

          <div className="mt-4 flex justify-between items-end">
             <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Starting from</span>
                <span className="text-lg font-bold text-gray-900">{getPrice()}</span>
             </div>
             <button
               onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
               className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
             >
               {isLiked ? <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> : <Heart className="w-5 h-5 text-gray-400" />}
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col group"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-2xl">
        <ImageWithFallback
          src={getImageUrl()}
          imageUrls={getAllImages()}
          type={itemType === 'listing' ? 'property' : (itemType === 'helper' ? 'helper' : (itemType === 'event' ? 'event' : 'service'))}
          alt={item.name || item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Type Badge */}
        {mainConfig && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-black/5">
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                 {mainConfig.label}
              </span>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute top-3 right-3 z-10 p-2 text-white hover:scale-110 transition-transform active:scale-95 drop-shadow-md"
        >
          <Heart className={`w-6 h-6 stroke-[2.5px] ${isLiked ? 'text-rose-500 fill-rose-500 stroke-rose-500' : 'text-white'}`} />
        </button>

        {/* Image Dots Indicator (Fake for aesthetic) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
           <div className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm" />
           <div className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm" />
        </div>
      </div>

      <div className="py-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-[15px] text-gray-900 truncate flex-1">
            {item.name || item.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-gray-950 fill-gray-950" />
            <span className="text-[14px] font-medium text-gray-950">{getRating().toFixed(1)}</span>
          </div>
        </div>

        <p className="text-[14px] text-gray-500 mt-0.5 truncate">{getLocation()}</p>
        
        <div className="text-[14px] text-gray-500 mt-1 flex gap-1 items-center flex-wrap">
           {itemType === 'properties' && (
             <>
               <span>{item.bedrooms || 0} bedrooms</span>
               <span>•</span>
               <span>{item.bathrooms || 0} bathrooms</span>
             </>
           )}
           {itemType !== 'properties' && subConfig && <span>{subConfig.label}</span>}
        </div>

        <div className="mt-2 flex items-baseline gap-1">
           <span className="text-[15px] font-bold text-gray-900">{getPrice()}</span>
           <span className="text-[14px] text-gray-900/80">
              {itemType === 'properties' ? '/ night' : ''}
           </span>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onClear }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }} 
    animate={{ opacity: 1, scale: 1 }} 
    className="bg-white rounded-[3rem] p-16 text-center border border-gray-50 shadow-2xl shadow-rose-100 max-w-2xl mx-auto"
  >
    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
      <Search className="w-10 h-10 text-rose-500" />
    </div>
    <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No results in this loop</h3>
    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
      We couldn't find exactly what you're looking for. <br />
      Try broadening your search or resetting your filters.
    </p>
    <button 
      onClick={onClear} 
      className="px-10 py-5 bg-gray-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
    >
      Reset all filters
    </button>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
    </div>
  </div>
);

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
        });
      }
    });
  }

  if (type === 'all' || type === 'events') {
    const eventTypes = subType ? [subType] : ['music', 'art', 'food', 'tech'];
    eventTypes.forEach((eventType, index) => {
      if (EVENTS_CATEGORY_CONFIG[eventType]) {
        mockData.push({
          _id: `e${index}`,
          name: `${EVENTS_CATEGORY_CONFIG[eventType].label} Event`,
          price: 150 + (index * 50),
          itemType: 'events',
          subType: eventType,
          imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'],
          rating: 4.9,
          address: 'Durban',
        });
      }
    });
  }

  return mockData;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchType, setSearchType] = useState('all');
  const [searchSubType, setSearchSubType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const { city: detectedCity, loading: geoLoading } = useLocationCoords();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: '',
    bedroomsMin: '',
    bathroomsMin: ''
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
    const subType = urlParams.get('subType') || urlParams.get('category') || '';

    setSearchTerm(urlParams.get('searchTerm') || '');
    setSearchType(type);
    setSearchSubType(subType);
    setFilters({
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || urlParams.get('priceMax') || '',
      minRating: urlParams.get('minRating') || '',
      location: urlParams.get('location') || urlParams.get('address') || '',
      bedroomsMin: urlParams.get('bedroomsMin') || '',
      bathroomsMin: urlParams.get('bathroomsMin') || ''
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

    // Set default location if not provided
    if (!urlParams.get('location') && !urlParams.get('address') && detectedCity) {
      setFilters(prev => ({ ...prev, location: detectedCity }));
    }
  }, [location.search, detectedCity]);

  const fetchData = useCallback(async () => {
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.toString()) {
      setListings([]);
      return;
    }

    setLoading(true);

    try {
      const type = urlParams.get('type') || 'all';
      const subType = urlParams.get('subType') || urlParams.get('category') || '';
      const searchTerm = urlParams.get('searchTerm') || '';
      const minPrice = urlParams.get('minPrice');
      const maxPrice = urlParams.get('maxPrice');
      const location = urlParams.get('location') || '';
      const minRating = urlParams.get('minRating');

      let endpoints = [];

      if (type === 'all') {
        endpoints = ['listing', 'service', 'helper', 'event'];
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
          const maxPriceParam = maxPrice || urlParams.get('priceMax');
          if (maxPriceParam) url += `&maxPrice=${maxPriceParam}`;

          const bedroomsMin = urlParams.get('bedroomsMin');
          if (bedroomsMin) url += `&bedrooms=${bedroomsMin}`;

          const bathroomsMin = urlParams.get('bathroomsMin');
          if (bathroomsMin) url += `&bathrooms=${bathroomsMin}`;

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
              itemType: endpoint,
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
    const id = item._id || item.id;
    navigate(`/${itemType}/${id}`);
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

  const getSelectedCategoryLabel = () => {
    if (selectedCategory) {
      const category = ALL_CATEGORIES.find(c => c.id === selectedCategory);
      return category ? category.label : 'Select category';
    }
    return 'Select category';
  };

  return (
    <div className="min-h-screen">
      {/* Airbnb Style Persistent Header */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-100 shadow-sm px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
           
           {/* Search Pill Trigger */}
           <button 
             onClick={() => setShowFilters(true)}
             className="flex-1 flex items-center gap-4 bg-white border border-gray-200 rounded-full px-5 py-3 shadow-md hover:shadow-lg transition-all active:scale-98 group"
           >
              <SearchIcon className="w-5 h-5 text-rose-500" />
              <div className="flex flex-col items-start overflow-hidden">
                 <span className="text-sm font-bold text-gray-900 truncate">
                    {searchTerm || 'Where to?'}
                 </span>
                 <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    <span>{filters.location || 'Anywhere'}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>Any week</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>Add guests</span>
                 </div>
              </div>
           </button>

           {/* Filter Button */}
           <button 
             onClick={() => setShowFilters(true)}
             className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
           >
              <SlidersHorizontal className="w-5 h-5 text-gray-900" />
           </button>
        </div>
      </div>

      {/* Header Spacer */}
      <div className="h-20 md:h-24"></div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <h1 className="text-lg font-semibold text-gray-900">
          {listings.length} {listings.length === 1 ? 'result' : 'results'}
          {selectedCategory && (
            <span className="text-gray-500 font-normal text-sm ml-1">in {getSelectedCategoryLabel()}</span>
          )}
          {filters.location && <span className="text-gray-500 font-normal text-sm ml-1">near {filters.location}</span>}
        </h1>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
              } gap-4`}
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
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </main>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowFilters(false)} 
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100]" 
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-gray-50 z-[101] flex flex-col md:max-w-md md:left-auto md:right-0 md:shadow-2xl overflow-hidden"
            >
              <div className="flex-shrink-0 bg-white px-6 pt-12 pb-4 flex items-center justify-between">
                <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2">
                  {[
                    { id: 'properties', label: 'Homes', icon: Home, color: 'rose' },
                    { id: 'events', label: 'Experiences', icon: Compass, color: 'rose' },
                    { id: 'services', label: 'Services', icon: Users, color: 'rose' },
                    { id: 'helpers', label: 'Helpers', icon: Briefcase, color: 'rose' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = searchType === item.id;
                    
                    return (
                      <button 
                        key={item.id}
                        onClick={() => setSearchType(item.id)}
                        className="flex flex-col items-center gap-2 group relative outline-none"
                      >
                         <motion.div 
                           animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
                           transition={{ duration: 0.4, ease: "backOut" }}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-900 group-hover:-translate-y-1'}`}
                         >
                            <Icon className="w-6 h-6" />
                         </motion.div>
                         
                         <motion.span 
                           animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1.05 : 1 }}
                           className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
                         >
                           {item.label}
                         </motion.span>
                         
                         {isActive && (
                           <motion.div 
                             layoutId="categoryLineResults" 
                             className="absolute -bottom-1 w-6 h-1 bg-rose-500 rounded-full" 
                           />
                         )}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                 {/* Section: WHERE? */}
                 <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Where to?</h2>
                    
                    <div className="relative mb-8">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                         type="text"
                         placeholder="Search destinations"
                         value={filters.location}
                         onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none font-medium placeholder-gray-400"
                       />
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Suggested destinations</p>
                       
                       <button 
                         onClick={() => setFilters(prev => ({ ...prev, location: 'Nearby' }))}
                         className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                       >
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                             <MapPin className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-bold text-gray-900">Nearby</p>
                             <p className="text-xs text-gray-500">Find what's around you</p>
                          </div>
                       </button>

                       <button 
                         onClick={() => setFilters(prev => ({ ...prev, location: 'Cape Town, Western Cape' }))}
                         className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                       >
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                             <Building className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-bold text-gray-900">Cape Town, Western Cape</p>
                             <p className="text-xs text-gray-500">Popular beach destination</p>
                          </div>
                       </button>

                       <button 
                         onClick={() => setFilters(prev => ({ ...prev, location: 'Durban, KwaZulu-Natal' }))}
                         className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                       >
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                             <Hotel className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-bold text-gray-900">Durban, KwaZulu-Natal</p>
                             <p className="text-xs text-gray-500">For sights like uShaka Marine World</p>
                          </div>
                       </button>
                    </div>
                 </div>

                 {/* Collapsed Sections: WHEN and WHO */}
                 <div className="bg-white rounded-[1.5rem] shadow-sm p-5 flex items-center justify-between border border-gray-100 opacity-60">
                    <span className="text-sm font-bold text-gray-900">When</span>
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Add dates</span>
                 </div>

                 <div className="bg-white rounded-[1.5rem] shadow-sm p-5 flex items-center justify-between border border-gray-100 opacity-60">
                    <span className="text-sm font-bold text-gray-900">Who</span>
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Add guests</span>
                 </div>
              </div>

              {/* Footer - Search Button */}
              <div className="flex-shrink-0 bg-white border-t border-gray-100 p-6 flex items-center justify-between">
                 <button 
                   onClick={() => setFilters({ minPrice: '', maxPrice: '', minRating: '', location: '' })}
                   className="text-sm font-bold text-gray-900 underline underline-offset-4 hover:text-rose-600 transition-colors"
                 >
                   Clear all
                 </button>
                 
                 <button 
                   onClick={() => { handleSearch(); setShowFilters(false); }}
                   className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-[1.2rem] flex items-center gap-3 shadow-xl transition-all active:scale-95"
                 >
                   <Search className="w-5 h-5 text-white" />
                   <span className="text-sm font-black uppercase tracking-widest">Search</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;