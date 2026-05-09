import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import NeuralLoader from '../components/NeuralLoader';
import ImageWithFallback from '../components/ImageWithFallback';
import useLocationCoords from '../hooks/useGeolocation';
import MapView from '../components/MapView';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  Squares2X2Icon,
  Bars3Icon,
  ChevronUpDownIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  MapPinIcon,
  HomeIcon,
  ArrowPathIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  XMarkIcon,
  CameraIcon,
  TruckIcon,
  WrenchIcon,
  ScissorsIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  BeakerIcon,
  BoltIcon,
  MusicalNoteIcon,
  CheckIcon,
  ArrowLeftIcon,
  PuzzlePieceIcon,
  SunIcon,
  CloudIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import {
  MapPin,
  Home,
  Tag,
  Heart,
  User,
  Sparkles,
  Key,
  Building,
  Moon,
  LayoutGrid,
  Star,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  Calendar as CalendarIconLucide,
  Search as SearchIconLucide,
  Navigation
} from 'lucide-react';
import NeighborhoodInsights from '../components/NeighborhoodInsights';


const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

// Enhanced Categories Configuration with all user requested categories
const ALL_CATEGORIES = [
  // Properties & Accommodation
  { id: 'guesthouse', label: 'Guest House', type: 'properties', icon: HomeIcon, color: 'bg-purple-100 text-purple-800', description: 'Guest houses & B&Bs' },
  { id: 'rental', label: 'For Rent', type: 'properties', icon: HomeIcon, color: 'bg-blue-100 text-blue-800', description: 'Rental properties' },
  { id: 'for_sale', label: 'Hotel', type: 'properties', icon: BuildingOfficeIcon, color: 'bg-emerald-100 text-emerald-800', description: 'Hotel rentals' },
  { id: 'vacation', label: 'Vacation Rental', type: 'properties', icon: Sparkles, color: 'bg-pink-100 text-pink-800', description: 'Short-term stays' },

  // Services
  { id: 'photography', label: 'Photography', type: 'services', icon: CameraIcon, color: 'bg-indigo-100 text-indigo-800', description: 'Photo & video services' },
  { id: 'carwash', label: 'Car Wash', type: 'services', icon: BoltIcon, color: 'bg-cyan-100 text-cyan-800', description: 'Vehicle cleaning' },
  { id: 'landscaping', label: 'Landscaping', type: 'services', icon: SunIcon, color: 'bg-green-100 text-green-800', description: 'Garden & lawn care' },
  { id: 'electrician', label: 'Electrician', type: 'services', icon: BoltIcon, color: 'bg-yellow-100 text-yellow-800', description: 'Electrical services' },
  { id: 'handyman', label: 'Handyman', type: 'services', icon: WrenchIcon, color: 'bg-gray-100 text-gray-800', description: 'Repair & maintenance' },
  { id: 'catering', label: 'Catering', type: 'services', icon: BriefcaseIcon, color: 'bg-orange-100 text-orange-800', description: 'Event catering' },
  { id: 'moving', label: 'Moving & Transport', type: 'services', icon: TruckIcon, color: 'bg-amber-100 text-amber-800', description: 'Relocation services' },

  // Helpers
  { id: 'domestic', label: 'Domestic Help', type: 'helper', icon: HomeIcon, color: 'bg-teal-100 text-teal-800', description: 'Household assistance' },
  { id: 'tattoo', label: 'Tattoo Artist', type: 'helper', icon: PuzzlePieceIcon, color: 'bg-red-100 text-red-800', description: 'Tattoo & piercing' },
  { id: 'tutor', label: 'Private Tutor', type: 'helper', icon: AcademicCapIcon, color: 'bg-blue-100 text-blue-800', description: 'Personal teaching' },
  { id: 'hair', label: 'Hair & Beauty', type: 'helper', icon: ScissorsIcon, color: 'bg-rose-100 text-rose-800', description: 'Salon services' },
  { id: 'nail', label: 'Nail Services', type: 'helper', icon: Sparkles, color: 'bg-pink-100 text-pink-800', description: 'Manicure & pedicure' },
  { id: 'chef', label: 'Private Chef', type: 'helper', icon: BriefcaseIcon, color: 'bg-amber-100 text-amber-800', description: 'Personal cooking' },
  { id: 'barber', label: 'Barber', type: 'helper', icon: ScissorsIcon, color: 'bg-sky-100 text-sky-800', description: 'Men\'s grooming' },
  { id: 'nanny', label: 'Nanny', type: 'helper', icon: Sparkles, color: 'bg-pink-100 text-pink-800', description: 'Childcare assistance' },
  { id: 'sneaker', label: 'Sneaker Cleaner', type: 'helper', icon: BoltIcon, color: 'bg-indigo-100 text-indigo-800', description: 'Premium shoe cleaning' },
  { id: 'washingmat', label: 'Washing Mat', type: 'helper', icon: HomeModernIcon, color: 'bg-cyan-100 text-cyan-800', description: 'Expert mat cleaning' },
  { id: 'animals', label: 'Animal Care', type: 'helper', icon: Sparkles, color: 'bg-amber-100 text-amber-800', description: 'Pet & animal services' },

  // Transport
  { id: 'transport', label: 'Transport', type: 'services', icon: TruckIcon, color: 'bg-blue-100 text-blue-800', description: 'Transportation services' },
  
  // Specific requested categories
  { id: 'resort', label: 'Resort', type: 'properties', icon: Sparkles, color: 'bg-amber-100 text-amber-800', description: 'Luxury resort stays' },
  { id: 'maid', label: 'Maid Services', type: 'helper', icon: HomeModernIcon, color: 'bg-cyan-100 text-cyan-800', description: 'Cleaning & maid help' },

  // Daily Essentials (for Homepage consistency)
  { id: 'daily', label: 'Daily Loop', type: 'services', icon: Sparkles, color: 'bg-green-100 text-green-800', description: 'Essentials & daily needs' },
];

// Property Types Configuration
const PROPERTY_TYPE_CONFIG = {
  rent: { label: 'For Rent', color: 'bg-blue-100 text-blue-800', icon: '🏠', endpoint: 'listing' },
  sale: { label: 'Hotel', color: 'bg-emerald-100 text-emerald-800', icon: '🏨', endpoint: 'listing' },
  over: { label: 'Vacation Rental', color: 'bg-purple-100 text-purple-800', icon: '🌙', endpoint: 'listing' },
  land: { label: 'Self Catering', color: 'bg-amber-100 text-amber-800', icon: '🍳', endpoint: 'listing' },
  resort: { label: 'Resort', color: 'bg-amber-100 text-amber-800', icon: '🏖️', endpoint: 'listing' },
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
  nail: { label: 'Nail Services', color: 'bg-pink-100 text-pink-800', icon: '💅', endpoint: 'helper' },
  sneaker: { label: 'Sneaker Cleaner', color: 'bg-indigo-100 text-indigo-800', icon: '👟', endpoint: 'helper' },
  washingmat: { label: 'Washing Mat', color: 'bg-cyan-100 text-cyan-800', icon: '🧼', endpoint: 'helper' },
  animals: { label: 'Animal Care', color: 'bg-amber-100 text-amber-800', icon: '🐾', endpoint: 'helper' },
  cleaner: { label: 'Cleaning', color: 'bg-cyan-100 text-cyan-800', icon: '🧼', endpoint: 'helper' }
};

// Services Categories Configuration
const SERVICES_CATEGORY_CONFIG = {
  carwash: { label: 'Car Wash', color: 'bg-cyan-100 text-cyan-800', icon: '🚗', endpoint: 'service' },
  landscaping: { label: 'Landscaping', color: 'bg-green-100 text-green-800', icon: '🌿', endpoint: 'service' },
  electrician: { label: 'Electrician', color: 'bg-yellow-100 text-yellow-800', icon: '⚡', endpoint: 'service' },
  handyman: { label: 'Handyman', color: 'bg-gray-100 text-gray-800', icon: '🔧', endpoint: 'service' },
  catering: { label: 'Catering', color: 'bg-orange-100 text-orange-800', icon: '🍽️', endpoint: 'service' },
  moving: { label: 'Moving & Transport', color: 'bg-amber-100 text-amber-800', icon: '🚚', endpoint: 'service' },
  transport: { label: 'Transport', color: 'bg-blue-100 text-blue-800', icon: '🚕', endpoint: 'service' },
  daily: { label: 'Daily Loop', color: 'bg-green-100 text-green-800', icon: '✨', endpoint: 'service' },
  schoolTransport: { label: 'School Transport', color: 'bg-amber-100 text-amber-800', icon: '🚌', endpoint: 'service' },
  daycare: { label: 'Daycare Centers', color: 'bg-pink-100 text-pink-800', icon: '🧸', endpoint: 'service' }
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
    icon: HomeIcon,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    endpoint: 'listing',
    subTypes: PROPERTY_TYPE_CONFIG
  },
  services: {
    label: 'Professional Services',
    icon: WrenchIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    endpoint: 'service',
    subTypes: SERVICES_CATEGORY_CONFIG
  },
  helpers: {
    label: 'Local Helper',
    icon: UserGroupIcon,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    endpoint: 'helper',
    subTypes: HELPER_CATEGORY_CONFIG
  },
  events: {
    label: 'Exclusive Events',
    icon: CalendarIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
    endpoint: 'event',
    subTypes: EVENTS_CATEGORY_CONFIG
  },
  'looking-for': {
    label: 'Community Needs',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    endpoint: 'looking-for'
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
      case 'helper': return '👤 Helper & Professionals';
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
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              <XMarkIcon className="w-3 h-3 text-gray-500" />
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${isSelected
                      ? 'bg-rose-50 border-rose-200 border'
                      : 'hover:bg-gray-50 border border-transparent'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${category.color} hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm truncate ${isSelected ? 'text-rose-700' : 'text-gray-900'}`}>
                          {category.label}
                        </span>
                        {isSelected && <CheckIcon className="w-4 h-4 text-rose-500 flex-shrink-0" />}
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
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No categories found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Quick select footer - Fixed */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredCategories.length} categories</span>
        </div>
      </div>
    </motion.div>
  );
};

const ResultCard = ({ item, index, viewMode, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getItemType = () => {
    const type = item.itemType || item.type || 'properties';
    if (type === 'listing' || type === 'property') return 'properties';
    if (type === 'service') return 'services';
    if (type === 'helper') return 'helper';
    if (type === 'event') return 'events';
    return type;
  };

  const getSubCategoryLabel = () => {
    if (type === 'properties') {
      const config = PROPERTY_TYPE_CONFIG[item.type];
      return config ? config.label : 'Property';
    }
    if (type === 'services') {
      const config = SERVICES_CATEGORY_CONFIG[item.category || item.type];
      return config ? config.label : (item.category || item.type || 'Service');
    }
    if (type === 'helper') {
      const config = HELPER_CATEGORY_CONFIG[item.category || item.type];
      return config ? config.label : (item.category || item.type || 'Helper');
    }
    if (type === 'events') return 'Event';
    return type;
  };

  const type = getItemType();

  const getPrice = () => {
    const val = item.regularPrice || item.price || item.cost || item.pricePerHour || item.ticketPrice;
    if (!val) return 'Contact';
    const formatted = typeof val === 'number' ? `R${val.toLocaleString()}` : val;
    if (type === 'properties' && item.type === 'rent') return `${formatted} / mo`;
    if (type === 'properties' && item.type === 'resort') return `${formatted} / day`;
    if (type === 'properties' && ['over', 'sale', 'land'].includes(item.type)) return `${formatted} / night`;
    return formatted;
  };

  const getRating = () => item.rating || 4.9;

  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
    if (item.images && item.images.length > 0) return item.images[0];
    return 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80';
  };

  const getTitle = () => item.name || item.title || item.eventName || 'Untitled Masterpiece';
  const getLocation = () => item.address || item.location || item.city || 'Private Location';

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (type === 'looking-for') {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={onClick}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(225,29,72,0.3)] transition-all duration-500 h-full flex flex-col gap-6 cursor-pointer overflow-hidden border border-gray-700"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 hover:scale-125 transition-transform duration-1000">
           <LayoutGrid className="w-32 h-32 text-white" />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden border border-white/20 p-1">
              <img src={item.userRef?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} className="w-full h-full object-cover rounded-[0.9rem]" alt="user" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-white leading-tight truncate max-w-[150px] drop-shadow-sm">{item.userRef?.username || "Neighbor"}</h4>
              <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest mt-1">{item.category}</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(225,29,72,0.5)]">
             Active Pulse
          </div>
        </div>

        <div className="relative z-10 my-4 flex-1">
           <h3 className="font-black text-white text-2xl leading-tight mb-3 drop-shadow-md">{item.title}</h3>
           <p className="text-[13px] text-gray-300 line-clamp-3 font-medium leading-relaxed">{item.description}</p>
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-rose-300">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest truncate max-w-[120px] drop-shadow-sm">{getLocation()}</span>
          </div>
          <div className="flex items-baseline gap-1 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
             <span className="text-xl font-black text-white tracking-tighter drop-shadow-md">
               {getPrice()}
             </span>
          </div>
        </div>
      </motion.div>
    );
  }

  const getItemPath = (item) => {
    if (item.itemType === 'listing' || item.type === 'listing') return `/listing/${item._id}`;
    if (item.itemType === 'event' || item.type === 'event') return `/event/${item._id}`;
    
    // Helper specific routes
    if (item.itemType === 'helper') {
      const specializedTypes = ['beauty', 'photography', 'carwash', 'barber', 'tattoo', 'chef'];
      if (specializedTypes.includes(item.type)) return `/${item.type}/${item._id}`;
      if (item.type === 'tutor') return `/privatetutor/${item._id}`;
      return `/helper/${item._id}`;
    }
    
    // Service specific routes
    if (item.itemType === 'service') {
      if (item.type === 'carwash') return `/carwash/${item._id}`;
      return `/service/${item._id}`;
    }
    
    return `/${item.type || 'helper'}/${item._id}`;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
         variants={cardVariants}
         className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden flex items-center p-4 gap-6 hover:shadow-xl transition-all duration-500 cursor-pointer"
         onClick={() => navigate(getItemPath(item))}
      >
        <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0">
           <ImageWithFallback src={getImage()} alt={getTitle()} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{getSubCategoryLabel()}</span>
              <div className="flex items-center gap-1">
                 <Star className="w-3 h-3 text-rose-500 fill-rose-500" />
                 <span className="text-xs font-black">{getRating()}</span>
              </div>
           </div>
           <h3 className="text-lg font-black text-gray-900 truncate mb-1 hover:text-rose-500 transition-colors">{getTitle()}</h3>
           <p className="text-gray-400 text-xs flex items-center gap-1.5 mb-4">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {getLocation()}
           </p>
           {/* Neighborhood Intelligence HUD - User requested area context */}
          <AnimatePresence>
            {detectedLocation && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <NeighborhoodInsights location={detectedLocation} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-black text-gray-900">{getPrice()}</span>
              <div className="flex items-center gap-3">
                 <button 
                   onClick={(e) => { e.stopPropagation(); navigate(getItemPath(item)); }}
                   className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-gray-100"
                 >
                   Inspect
                 </button>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setIsLiked(!isLiked);
                   }}
                   className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-gray-100"
                 >
                   <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} strokeWidth={isLiked ? 0 : 2} />
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative aspect-square bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer h-full"
      onClick={() => navigate(getItemPath(item))}
    >
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      </div>

      {/* Top Overlays */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{getSubCategoryLabel()}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90 pointer-events-auto"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} strokeWidth={isLiked ? 0 : 2} />
        </button>
      </div>

      {/* Permanent Information Overlay (On Image) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-white">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black">{getRating()}</span>
            </div>
            <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
              {getTitle()}
            </h3>
            <p className="text-xs text-white/70 font-medium truncate mb-3">
              {getLocation()}
            </p>

            {/* Provider Profile Badge */}
            {(type === 'helper' || type === 'services') && (
              <div className="flex items-center gap-2 mt-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 w-fit group-hover:bg-white/20 transition-all duration-300">
                <div className="w-7 h-7 rounded-xl overflow-hidden border border-white/30 shadow-inner shrink-0">
                  {item.userRef?.avatar ? (
                    <img 
                      src={item.userRef.avatar} 
                      alt={item.userRef.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-rose-500 flex items-center justify-center text-white text-[9px] font-black">
                      {item.userRef?.username?.charAt(0).toUpperCase() || (type === 'helper' ? 'H' : 'S')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[8px] font-black text-white uppercase tracking-wider truncate">
                    {item.userRef?.username || 'Verified Pro'}
                  </span>
                  <span className="text-[7px] font-bold text-rose-300 uppercase tracking-tight">
                    {item.experience || 'Experienced'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
              {getPrice()}
            </div>
            <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
          </div>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
        <div className="w-full space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <div className="flex gap-2">
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsUp className="w-4 h-4" />
              {item.votes?.up || 0}
            </div>
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsDown className="w-4 h-4" />
              {item.votes?.down || 0}
            </div>
          </div>
          <div className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl" onClick={(e) => { e.stopPropagation(); navigate(getItemPath(item)); }}>
             Inspect Masterpiece
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onClear }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className=" rounded-[3rem] p-16 text-center border border-gray-50 shadow-2xl shadow-rose-100 max-w-2xl mx-auto"
  >
    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
      <MagnifyingGlassIcon className="w-10 h-10 text-rose-500" />
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
  <div className="relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="absolute inset-0 bg-gray-100" />
    <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
      <div className="flex justify-between items-end">
        <div className="space-y-2 flex-1">
          <div className="h-2 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-8 bg-gray-200 rounded-xl w-16" />
      </div>
    </div>
  </div>
);

const generateMockData = (urlParams) => {
  const type = urlParams.get('type') || 'all';
  const subType = urlParams.get('subType') || '';
  const mockData = [];

  if (type === 'all' || type === 'properties') {
    const propertyTypes = subType ? [subType] : ['rent', 'sale', 'over', 'land', 'resort', 'guest_house'];
    propertyTypes.forEach((propType, index) => {
      if (PROPERTY_TYPE_CONFIG[propType]) {
        mockData.push({
          _id: `p${index}`,
          name: `${PROPERTY_TYPE_CONFIG[propType].label} in Polokwane`,
          price: 5000 + (index * 2000),
          itemType: 'properties',
          subType: propType,
          imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
          rating: 4.5 + (index * 0.1),
          address: 'Polokwane, Limpopo',
          bedrooms: 2 + index,
          bathrooms: 1 + index,
        });
      }
    });
  }

  if (type === 'all' || type === 'helper') {
    const helperTypes = subType ? [subType] : ['beauty', 'barber', 'chef', 'tattoo', 'tutor', 'photography', 'domestic', 'hair', 'nail'];
    helperTypes.forEach((helperType, index) => {
      if (HELPER_CATEGORY_CONFIG[helperType]) {
        mockData.push({
          _id: `h${index}`,
          name: `Professional ${HELPER_CATEGORY_CONFIG[helperType].label}`,
          price: 300 + (index * 100),
          itemType: 'helper',
          subType: helperType,
          imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
          rating: 4.7 + (index * 0.05),
          address: 'Johannesburg',
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
  const [viewMode, setViewMode] = useState('map');
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

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Map center state
  const [mapCenter, setMapCenter] = useState({ lat: -26.1076, lng: 28.0567 }); // Default Sandton

  // Recent searches and recently viewed
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [detectedLocation, setDetectedLocation] = useState(null);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recentlyViewedItems');
        if (stored) {
          const items = JSON.parse(stored);
          setRecentlyViewedItems(items.slice(0, 5));
        }
      } catch (error) { console.error('Failed to load recently viewed items:', error); }
    };
    loadRecentlyViewed();
  }, []);

  // Location intelligence detection
  useEffect(() => {
    const queryLocation = filters.location || searchTerm;
    if (queryLocation && queryLocation.length > 3) {
      const cities = ["Tembisa", "Soweto", "Sandton", "Midrand", "Pretoria", "Johannesburg", "Durban", "Cape Town", "Kempton Park", "Polokwane", "Bloemfontein"];
      const found = cities.find(c => queryLocation.toLowerCase().includes(c.toLowerCase()));
      if (found) {
        setDetectedLocation(found);
      } else {
        // Heuristic for other potential locations
        const words = queryLocation.split(' ');
        const caps = words.find(w => w.length > 3 && w[0] === w[0].toUpperCase());
        if (caps) setDetectedLocation(caps);
        else setDetectedLocation(null);
      }
    } else {
      setDetectedLocation(null);
    }
  }, [filters.location, searchTerm]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    let type = urlParams.get('type') || 'all';
    // Handle singular/plural mismatch from different entry points
    if (type === 'helper') type = 'helpers';
    if (type === 'property') type = 'properties';
    
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
      bathroomsMin: urlParams.get('bathroomsMin') || '',
      center: urlParams.get('center') || '',
      distance: urlParams.get('distance') || '',
      mode: urlParams.get('mode') || ''
    });

    if (urlParams.get('mode') === 'map') setViewMode('map');

    const dateParam = urlParams.get('date');
    if (dateParam) setSelectedDate(new Date(dateParam));

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
      let type = urlParams.get('type') || 'all';
      if (type === 'helper') type = 'helpers';
      if (type === 'property') type = 'properties';

      const subType = urlParams.get('subType') || urlParams.get('category') || '';
      const searchTerm = urlParams.get('searchTerm') || '';
      const minPrice = urlParams.get('minPrice');
      const maxPrice = urlParams.get('maxPrice');
      const locationQ = urlParams.get('location') || urlParams.get('address') || '';
      const minRating = urlParams.get('minRating');

      const nearbyLocationsMap = {
        'polokwane': 'seshego|mankweng|lebowakgomo|mokopane|tzaneen|turfloop|turf',
        'turf': 'polokwane|seshego|mankweng|lebowakgomo|mokopane|tzaneen',
        'turfloop': 'polokwane|seshego|mankweng|lebowakgomo|mokopane|tzaneen',
        'soshanguve': 'pretoria|mabopane|garankuwa|hammanskraal|centurion|midrand|rosslyn',
        'tembisa': 'kempton park|boksburg|midrand|edenvale|benoni|germiston|johannesburg|ivory park',
        'pretoria': 'centurion|soshanguve|midrand|mamelodi|johannesburg|atteridgeville',
        'johannesburg': 'sandton|randburg|midrand|soweto|roodepoort|kempton park|boksburg|alberton',
        'cape town': 'bellville|stellenbosch|somerset west|durbanville|milnerton|guguletu|khayelitsha',
        'durban': 'umhlanga|pinetown|westville|chatsworth|amanzimtoti|kwamashu|umlazi',
        'mamelodi': 'pretoria|centurion|silverton|cullinan',
        'soweto': 'johannesburg|langlaagte|roodepoort|krugersdorp'
      };

      const fetchWithParams = async (currentLocation, currentSearchTerm) => {
        let endpoints = [];
        if (type === 'all') {
          endpoints = ['listing', 'service', 'helper', 'event'];
        } else {
          const config = SEARCH_TYPE_CONFIG[type];
          if (config) endpoints = [config.endpoint];
        }

        const fetchPromises = endpoints.map(async (endpoint) => {
          let url = `/api/${endpoint}/get?limit=${DEFAULT_LISTING_LIMIT}`;

          if (currentSearchTerm) url += `&searchTerm=${encodeURIComponent(currentSearchTerm)}`;
          if (currentLocation) {
            // Send both address and location to ensure endpoints pick up the right one
            url += `&address=${encodeURIComponent(currentLocation)}&location=${encodeURIComponent(currentLocation)}`;
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
        return combinedResults;
      };

      let finalResults = await fetchWithParams(locationQ, searchTerm);
      
      // If no results, check for fallback locations
      if (finalResults.length === 0 && (locationQ || searchTerm)) {
        const fullQuery = ((locationQ || '') + ' ' + (searchTerm || '')).toLowerCase();
        let matchedFallback = '';
        
        for (const [key, fallbackStr] of Object.entries(nearbyLocationsMap)) {
          if (fullQuery.includes(key)) {
            matchedFallback = fallbackStr;
            break;
          }
        }
        
        if (matchedFallback) {
          // Re-fetch using the fallback string as the location
          finalResults = await fetchWithParams(matchedFallback, searchTerm);
        }
      }

      setListings(finalResults);
    } catch (error) {
      console.error('Search Database error:', error);
      setListings([]);
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
    urlParams.set('type', searchType || 'all');
    if (searchSubType) urlParams.set('subType', searchSubType);
    if (filters.minPrice) urlParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) urlParams.set('maxPrice', filters.maxPrice);
    if (filters.minRating) urlParams.set('minRating', filters.minRating);
    if (filters.center) urlParams.set('center', filters.center);
    if (filters.distance) urlParams.set('distance', filters.distance);
    if (viewMode === 'map') urlParams.set('mode', 'map');
    else urlParams.delete('mode');
    urlParams.set('date', selectedDate.toISOString().split('T')[0]);

    // Geocode location if searching for a specific place
    if (filters.location) {
      const cityCoords = {
        'polokwane': { lat: -23.9058, lng: 29.4505 },
        'sandton': { lat: -26.1076, lng: 28.0567 },
        'johannesburg': { lat: -26.2041, lng: 28.0473 },
        'cape town': { lat: -33.9249, lng: 18.4241 },
        'durban': { lat: -29.8587, lng: 31.0218 },
        'pretoria': { lat: -25.7479, lng: 28.2293 }
      };

      const lowerLoc = filters.location.toLowerCase();
      const matchedCity = Object.keys(cityCoords).find(city => lowerLoc.includes(city));

      if (matchedCity) {
        setMapCenter(cityCoords[matchedCity]);
      } else {
        import('../utils/geocoding').then(({ geocodeAddress }) => {
          geocodeAddress(filters.location).then(coords => {
            if (coords) setMapCenter(coords);
          });
        });
      }
    }

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
    <div className="min-h-screen bg-white flex flex-col relative overflow-x-hidden no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Fresha-style Split Header */}
      <div className={`sticky top-0 z-[60] bg-white border-b border-gray-100 px-6 py-4 transition-transform duration-500 ${viewMode === 'map' ? 'max-md:-translate-y-full' : 'translate-y-0'}`}>
        <div className="max-w-[2520px] mx-auto flex items-center gap-4">
          
          {/* Brand Logo - Quick return */}
          <div 
            onClick={() => navigate('/')}
            className="hidden md:flex items-center gap-2 cursor-pointer group"
          >
             <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
             <span className="text-xl font-black tracking-tighter uppercase italic">LoopOut</span>
          </div>

          {/* Segmented Search Bar - Fresha Style */}
          <div className="flex-1 max-w-4xl mx-auto flex items-center bg-white border border-gray-200 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden">
            
            {/* Segment: WHAT */}
            <div className="flex-1 relative group/seg border-r border-gray-100">
               <button 
                 onClick={() => setShowFilters(true)}
                 className="w-full px-6 py-3 flex flex-col items-start hover:bg-gray-50 transition-colors"
               >
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Service or Venue</span>
                 <span className="text-sm font-bold text-gray-900 truncate w-full text-left">
                   {searchTerm || 'What are you looking for?'}
                 </span>
               </button>
            </div>

            {/* Segment: WHERE */}
            <div className="flex-1 relative group/seg border-r border-gray-100">
               <button 
                 onClick={() => setShowFilters(true)}
                 className="w-full px-6 py-3 flex flex-col items-start hover:bg-gray-50 transition-colors"
               >
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Where?</span>
                 <span className="text-sm font-bold text-gray-900 truncate w-full text-left">
                   {filters.location || 'Anywhere'}
                 </span>
               </button>
            </div>

            {/* Segment: WHEN */}
            <div className="flex-1 relative group/seg border-r border-gray-100">
               <button 
                 onClick={() => setShowDatePicker(!showDatePicker)}
                 className="w-full px-6 py-3 flex flex-col items-start hover:bg-gray-50 transition-colors"
               >
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">When?</span>
                 <span className="text-sm font-bold text-gray-900 truncate w-full text-left">
                   {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </span>
               </button>
               
               <AnimatePresence>
                 {showDatePicker && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 mt-4 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-[70] min-w-[350px]"
                   >
                     <Calendar 
                       onChange={(date) => { setSelectedDate(date); setShowDatePicker(false); }} 
                       value={selectedDate}
                       className="border-0 font-sans"
                     />
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Search Trigger */}
            <button 
              onClick={handleSearch}
              className="m-2 p-3.5 bg-gray-950 text-white rounded-full hover:bg-rose-500 transition-all active:scale-90 shadow-lg shadow-gray-200"
            >
              <SearchIconLucide className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
             <button
               onClick={() => setShowFilters(true)}
               className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
             >
               <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
             </button>
             <button
               onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
               className={`w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 transition-all hover:scale-110 active:scale-95 ${viewMode === 'map' ? 'bg-gray-950 text-white' : 'bg-white hover:bg-gray-50'}`}
             >
               {viewMode === 'map' ? <Bars3Icon className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
             </button>
          </div>
        </div>
      </div>

      {/* Main Split View Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Column: Results (Hidden or Squeezed in Map Mode) */}
        <div className={`flex-1 overflow-y-auto no-scrollbar pt-6 pb-24 px-6 md:px-12 lg:px-16 transition-all duration-700 ${viewMode === 'map' ? 'lg:max-w-0 lg:px-0 lg:opacity-0' : 'max-w-none opacity-100'}`}>
          
          {/* Breadcrumbs / Summary */}
          <div className="mb-8 flex items-end justify-between">
            <div>
               <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-2">Discovery Portal</p>
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                 {listings.length} {searchType !== 'all' ? searchType : 'Matches'} in {filters.location || 'The Matrix'}
               </h1>
            </div>
            
            {/* View Mode Toggles (Compact) */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl lg:hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-400'}`}>
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-400'}`}>
                  <MapIcon className="w-4 h-4" />
                </button>
            </div>
          </div>

          {/* Cinematic Categories Bar */}
          <div className="mb-12 overflow-x-auto no-scrollbar py-4 border-y border-gray-50">
            <div className="flex gap-8 items-center">
              <button
                onClick={() => { setSelectedCategory('all'); fetchData(); }}
                className={` flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all whitespace-nowrap ${!selectedCategory || selectedCategory === 'all' ? 'bg-gray-950 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Universe</span>
              </button>

              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={` flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-rose-500 text-white shadow-xl shadow-rose-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : listings.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-8 ${viewMode === 'map' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}
            >
              {listings.map((item, idx) => (
                <ResultCard
                  key={item._id || item.id || idx}
                  item={item}
                  viewMode="grid"
                  onClick={() => addToRecentlyViewed(item, item.itemType)}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState onClear={clearFilters} />
          )}

          {/* Recently Viewed Footer Area */}
          {recentlyViewedItems.length > 0 && (
            <section className="mt-24 pt-12 border-t border-gray-100">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic mb-8">Pulse History</h2>
              <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                {recentlyViewedItems.map((item) => (
                  <div key={item._id || Math.random().toString()} onClick={() => navigate(`/${item.itemType || item.type || 'listing'}/${item._id || item.id}`)} className="flex-shrink-0 w-64 cursor-pointer group">
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-gray-50 shadow-sm group-hover:shadow-xl transition-all duration-500">
                      <ImageWithFallback
                        src={item.imageUrls?.[0] || item.images?.[0] || 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800'}
                        alt={item.name || item.title || 'Item'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                        {item.itemType || item.type || 'property'}
                      </div>
                    </div>
                    <h3 className="font-black text-sm text-gray-900 truncate group-hover:text-rose-600 transition-colors px-2">
                      {item.name || item.title || 'Untitled Masterpiece'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest px-2">
                      {typeof (item.regularPrice || item.price) === 'number' ? `R${(item.regularPrice || item.price).toLocaleString()}` : (item.regularPrice || item.price || 'Contact')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Map (Desktop Full Screen or Split) */}
        <div className={`transition-all duration-700 overflow-hidden relative ${viewMode === 'map' ? 'w-full fixed inset-0 z-[150] h-[100dvh] md:z-[110]' : 'w-0 hidden lg:block border-l border-gray-100'}`}>
           {/* Mobile & Desktop Back Button Overlay - Elite Redesign */}
           {viewMode === 'map' && (
             <motion.button 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               onClick={() => setViewMode('grid')}
               className="absolute top-8 left-8 z-[160] w-14 h-14 bg-gray-950/90 backdrop-blur-xl text-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-90 transition-all border border-white/10"
             >
               <ArrowLeftIcon className="w-6 h-6 text-rose-500" />
             </motion.button>
           )}

           <div className="absolute inset-0">
              <MapView 
                items={listings} 
                searchType={searchType} 
                location={filters.location || 'South Africa'} 
                center={mapCenter}
                onItemClick={(item) => navigate(`/${item.itemType || item.type || 'listing'}/${item._id || item.id}`)}
              />
           </div>

           {/* Results Carousel Overlay - Desktop Only (Hidden on Mobile as per request) */}
           <AnimatePresence>
             {viewMode === 'map' && listings.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="hidden md:flex absolute bottom-10 left-0 right-0 z-[115] px-6 justify-center"
               >
                 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 max-w-full lg:max-w-6xl">
                    {listings.map((item, idx) => (
                      <div key={item._id || idx} className="flex-shrink-0 w-80">
                         <ResultCard
                           item={item}
                           viewMode="grid"
                           onClick={() => addToRecentlyViewed(item, item.itemType)}
                         />
                      </div>
                    ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Floating Map Button (Mobile/Tablet) */}
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
          className="lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-3 bg-gray-950 text-white px-8 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-110 active:scale-95 border border-white/20"
        >
          {viewMode === 'map' ? (
            <><Bars3Icon className="w-5 h-5 text-rose-500" /> Show Listings</>
          ) : (
            <><MapIcon className="w-5 h-5 text-rose-500" /> Explore Map</>
          )}
        </button>
      </div>

      {/* Filter Modal (Enhanced) */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[101] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex-shrink-0 px-8 pt-12 pb-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1">Matrix Overrides</p>
                   <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Deep Scan</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-950" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                
                {/* Search Term */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">What?</label>
                  <div className="relative">
                    <SearchIconLucide className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                    <input
                      type="text"
                      placeholder="Neural signal (e.g. Nails, Hair, Spa)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent focus:border-rose-500 rounded-3xl py-5 pl-14 pr-6 focus:ring-0 transition-all outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Where?</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                    <input
                      type="text"
                      placeholder="Location in the loop..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-gray-50 border border-transparent focus:border-rose-500 rounded-3xl py-5 pl-14 pr-6 focus:ring-0 transition-all outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                     {['Sandton', 'Cape Town', 'Durban', 'Polokwane'].map(loc => (
                       <button 
                        key={loc}
                        onClick={() => setFilters(prev => ({ ...prev, location: loc }))}
                        className="px-4 py-2 bg-gray-50 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-rose-600 transition-all"
                       >
                         {loc}
                       </button>
                     ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Category Loop</label>
                  <div className="grid grid-cols-2 gap-4">
                    {ALL_CATEGORIES.slice(0, 8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat)}
                        className={`flex items-center gap-3 p-4 rounded-3xl border transition-all ${selectedCategory === cat.id ? 'bg-gray-950 text-white border-gray-950 shadow-xl' : 'bg-white border-gray-100 hover:border-rose-200'}`}
                      >
                        <cat.icon className={`w-5 h-5 ${selectedCategory === cat.id ? 'text-rose-500' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Price Spectrum (R)</label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="flex-1 bg-gray-50 border border-transparent rounded-2xl py-4 px-6 focus:ring-0 outline-none text-sm font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="flex-1 bg-gray-50 border border-transparent rounded-2xl py-4 px-6 focus:ring-0 outline-none text-sm font-bold"
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 p-8 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline underline-offset-8 hover:text-rose-600 transition-colors"
                >
                  Reset Loop
                </button>
                <button
                  onClick={() => { handleSearch(); setShowFilters(false); }}
                  className="flex-1 bg-gray-950 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-rose-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Navigation className="w-4 h-4 text-rose-500" />
                  Execute Scan
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