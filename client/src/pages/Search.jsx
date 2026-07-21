import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search as SearchIconLucide,
  Navigation,
  Check
} from 'lucide-react';
import NeighborhoodInsights from '../components/NeighborhoodInsights';
import { AirbnbCard, AirbnbCardSkeleton } from '../components/home/AirbnbCard';


const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

const CITY_COORDS = {
  'polokwane': { lat: -23.9058, lng: 29.4505 },
  'sandton': { lat: -26.1076, lng: 28.0567 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'durban': { lat: -29.8587, lng: 31.0218 },
  'pretoria': { lat: -25.7479, lng: 28.2293 },
  'tembisa': { lat: -25.9964, lng: 28.2268 },
  'soweto': { lat: -26.2678, lng: 27.8585 }
};

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
  { id: 'handyman', label: 'Handyman', type: 'helper', icon: WrenchIcon, color: 'bg-gray-100 text-gray-800', description: 'Repair & maintenance' },
  { id: 'storage', label: 'Booking Storage', type: 'services', icon: BuildingOfficeIcon, color: 'bg-slate-100 text-slate-800', description: 'Secure storage units' },

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
  cleaner: { label: 'Cleaning', color: 'bg-cyan-100 text-cyan-800', icon: '🧼', endpoint: 'helper' },
  handyman: { label: 'Handyman', color: 'bg-gray-100 text-gray-800', icon: '🔧', endpoint: 'helper' },
  maintenance: { label: 'Maintenance', color: 'bg-amber-100 text-amber-800', icon: '🔧', endpoint: 'helper' }
};

// Services Categories Configuration
const SERVICES_CATEGORY_CONFIG = {
  carwash: { label: 'Car Wash', color: 'bg-cyan-100 text-cyan-800', icon: '🚗', endpoint: 'service' },
  landscaping: { label: 'Landscaping', color: 'bg-green-100 text-green-800', icon: '🌿', endpoint: 'service' },
  electrician: { label: 'Electrician', color: 'bg-yellow-100 text-yellow-800', icon: '⚡', endpoint: 'service' },
  catering: { label: 'Catering', color: 'bg-orange-100 text-orange-800', icon: '🍽️', endpoint: 'service' },
  moving: { label: 'Moving & Transport', color: 'bg-amber-100 text-amber-800', icon: '🚚', endpoint: 'service' },
  transport: { label: 'Transport', color: 'bg-blue-100 text-blue-800', icon: '🚕', endpoint: 'service' },
  daily: { label: 'Daily Loop', color: 'bg-green-100 text-green-800', icon: '✨', endpoint: 'service' },
  schoolTransport: { label: 'School Transport', color: 'bg-amber-100 text-amber-800', icon: '🚌', endpoint: 'service' },
  daycare: { label: 'Daycare Centers', color: 'bg-pink-100 text-pink-800', icon: '🧸', endpoint: 'service' },
  storage: { label: 'Booking Storage', color: 'bg-slate-100 text-slate-800', icon: '📦', endpoint: 'service' }
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

const normalizeSearchType = (type) => {
  if (type === 'helper') return 'helpers';
  if (type === 'property') return 'properties';
  return type || 'all';
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
  const navigate = useNavigate();

  const getItemType = () => {
    const type = item.itemType || item.type || 'properties';
    if (type === 'listing' || type === 'property') return 'properties';
    if (type === 'service') return 'services';
    if (type === 'helper') return 'helper';
    if (type === 'event') return 'events';
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
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden border border-white/20 p-1">
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

  // Convert types to what AirbnbCard expects
  const airbnbCardType = (() => {
    if (type === 'properties') return 'property';
    if (type === 'services') return 'service';
    if (type === 'helper') return 'helper';
    if (type === 'events') return 'event';
    return type;
  })();

  return (
    <motion.div variants={cardVariants}>
      <AirbnbCard
        item={item}
        type={airbnbCardType}
        onClick={(path) => {
          if (onClick) {
            onClick(path);
            return;
          }
          navigate(path);
        }}
      />
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
  <AirbnbCardSkeleton />
);

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
  const { city: detectedCity } = useLocationCoords();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: '',
    bedroomsMin: '',
    bathroomsMin: ''
  });

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Map center state
  const [mapCenter, setMapCenter] = useState({ lat: -26.1076, lng: 28.0567 }); // Default Sandton

  // Recent searches and recently viewed
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);

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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const type = normalizeSearchType(urlParams.get('type'));
    
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

    // Set selected category if subType matches
    if (subType) {
      const category = ALL_CATEGORIES.find(c => c.id === subType);
      if (category) setSelectedCategory(category.id);
    } else {
      setSelectedCategory(null);
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
      const type = normalizeSearchType(urlParams.get('type'));

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

  // Geocode and update map center whenever the location filter changes
  useEffect(() => {
    if (!filters.location) return;
    
    const lowerLoc = filters.location.toLowerCase();
    const matchedCity = Object.keys(CITY_COORDS).find(city => lowerLoc.includes(city));

    if (matchedCity) {
      setMapCenter(CITY_COORDS[matchedCity]);
    } else {
      import('../utils/geocoding').then(({ geocodeAddress }) => {
        geocodeAddress(filters.location).then(coords => {
          if (coords) setMapCenter(coords);
        });
      });
    }
  }, [filters.location]);

  const buildSearchParams = useCallback((overrides = {}) => {
    const nextSearchTerm = overrides.searchTerm ?? searchTerm;
    const nextSearchType = normalizeSearchType(overrides.searchType ?? searchType);
    const nextSearchSubType = overrides.searchSubType ?? searchSubType;
    const nextFilters = { ...filters, ...(overrides.filters || {}) };
    const nextViewMode = overrides.viewMode ?? viewMode;
    const urlParams = new URLSearchParams();

    if (nextSearchTerm) urlParams.set('searchTerm', nextSearchTerm);
    urlParams.set('type', nextSearchType || 'all');
    if (nextSearchSubType) urlParams.set('subType', nextSearchSubType);
    if (nextFilters.location) urlParams.set('location', nextFilters.location);
    if (nextFilters.minPrice) urlParams.set('minPrice', nextFilters.minPrice);
    if (nextFilters.maxPrice) urlParams.set('maxPrice', nextFilters.maxPrice);
    if (nextFilters.minRating) urlParams.set('minRating', nextFilters.minRating);
    if (nextFilters.bedroomsMin) urlParams.set('bedroomsMin', nextFilters.bedroomsMin);
    if (nextFilters.bathroomsMin) urlParams.set('bathroomsMin', nextFilters.bathroomsMin);
    if (nextFilters.center) urlParams.set('center', nextFilters.center);
    if (nextFilters.distance) urlParams.set('distance', nextFilters.distance);
    if (nextViewMode === 'map') urlParams.set('mode', 'map');

    return urlParams;
  }, [filters, searchSubType, searchTerm, searchType, viewMode]);

  const handleSearch = useCallback(() => {
    const urlParams = buildSearchParams();

    // Geocode location if searching for a specific place
    if (filters.location) {
      const lowerLoc = filters.location.toLowerCase();
      const matchedCity = Object.keys(CITY_COORDS).find(city => lowerLoc.includes(city));

      if (matchedCity) {
        setMapCenter(CITY_COORDS[matchedCity]);
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
  }, [buildSearchParams, filters.location, navigate, recentSearches, searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchType('all');
    setSearchSubType('');
    setSelectedCategory(null);
    setFilters({ minPrice: '', maxPrice: '', minRating: '', location: '', bedroomsMin: '', bathroomsMin: '' });
    navigate('/search');
  };

  const addToRecentlyViewed = (item, itemType, path) => {
    const id = item._id || item.id;
    const nextItem = { ...item, itemType };
    const nextItems = [
      nextItem,
      ...recentlyViewedItems.filter((viewed) => (viewed._id || viewed.id) !== id)
    ].slice(0, 5);

    setRecentlyViewedItems(nextItems);
    localStorage.setItem('recentlyViewedItems', JSON.stringify(nextItems));
    navigate(path || `/${itemType}/${id}`);
  };

  const handleCategorySelect = (category) => {
    if (!category) {
      setSelectedCategory(null);
      setSearchType('all');
      setSearchSubType('');
      navigate(`/search?${buildSearchParams({ searchType: 'all', searchSubType: '' }).toString()}`);
      return;
    }
    const normalizedType = normalizeSearchType(category.type);
    setSelectedCategory(category.id);
    setSearchType(normalizedType);
    setSearchSubType(category.id);

    const urlParams = buildSearchParams({
      searchType: normalizedType,
      searchSubType: category.id
    });
    navigate(`/search?${urlParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-x-hidden no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Clean Airbnb-style Header */}
      <div className="sticky top-0 z-[60] bg-white border-b border-gray-100">
        <div className="max-w-[2520px] mx-auto px-6 py-3 flex items-center gap-4">

          {/* Logo */}
          <div onClick={() => navigate('/')} className="hidden md:flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 bg-gray-950 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter">loopOut</span>
          </div>

          {/* Compact Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <SearchIconLucide className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate block">
                  {searchTerm || filters.location
                    ? `${searchTerm || 'Anywhere'} / ${filters.location || 'Anywhere'}`
                    : 'Search services, venues...'}
                </span>
              </div>
              <div className="flex-shrink-0 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Map Toggle - Desktop */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
              aria-label={viewMode === 'map' ? 'Hide map' : 'Show map'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all"
            >
              <MapIcon className="w-4 h-4" />
              {viewMode === 'map' ? 'Hide map' : 'Show map'}
            </button>
          </div>
        </div>
      </div>

      {/* Airbnb-style Category Bar */}
      <div className="sticky top-[61px] z-[50] bg-white border-b border-gray-100">
        <div className="max-w-[2520px] mx-auto">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 px-6 py-3">
              {/* All / Universe */}
              <button
                onClick={() => handleCategorySelect(null)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all flex-shrink-0 min-w-[60px] ${
                  !selectedCategory
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] font-semibold whitespace-nowrap">All</span>
              </button>

              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all flex-shrink-0 min-w-[60px] ${
                    selectedCategory === cat.id
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-400 hover:text-gray-700 border-b-2 border-transparent'
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold whitespace-nowrap">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: True Split-Screen on Desktop */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Left Column: Results List */}
        <div
          className={`overflow-y-auto no-scrollbar transition-all duration-500 ${
            viewMode === 'map'
              ? 'hidden lg:block lg:w-[45%] xl:w-[40%] flex-shrink-0'
              : 'w-full'
          }`}
        >
          <div className="px-6 md:px-10 pt-6 pb-28">

            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">
                {loading ? 'Searching...' : `${listings.length} ${searchType !== 'all' ? searchType : 'places'} ${filters.location ? `near ${filters.location}` : 'found'}`}
              </p>
              {/* Mobile View Toggle */}
              <div className="flex items-center gap-1 lg:hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${ viewMode === 'grid' ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${ viewMode === 'map' ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className={`grid gap-5 ${ viewMode === 'map' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : listings.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-5 ${ viewMode === 'map' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}
              >
                {listings.map((item, idx) => (
                  <ResultCard
                    key={item._id || item.id || idx}
                    item={item}
                    viewMode="grid"
                    onClick={(path) => addToRecentlyViewed(item, item.itemType, path)}
                  />
                ))}
              </motion.div>
            ) : (
              <EmptyState onClear={clearFilters} />
            )}

            {/* Recently Viewed */}
            {recentlyViewedItems.length > 0 && (
              <section className="mt-16 pt-10 border-t border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-5">Recently viewed</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                  {recentlyViewedItems.map((item) => (
                    <div
                      key={item._id || Math.random().toString()}
                      onClick={() => navigate(`/${item.itemType || item.type || 'listing'}/${item._id || item.id}`)}
                      className="flex-shrink-0 w-48 cursor-pointer"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
                        <ImageWithFallback
                          src={item.imageUrls?.[0] || item.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={item.name || item.title || 'Item'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name || item.title || 'Untitled'}</h3>
                      <p className="text-sm text-gray-500">
                        {typeof (item.regularPrice || item.price) === 'number'
                          ? `R${(item.regularPrice || item.price).toLocaleString()}`
                          : (item.regularPrice || item.price || 'Contact')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Column: Map */}
        <div
          className={`transition-all duration-500 overflow-hidden relative ${
            viewMode === 'map'
              ? 'w-full lg:flex-1 fixed inset-0 lg:relative lg:inset-auto z-[150] lg:z-auto h-[100dvh] lg:h-auto'
              : 'hidden lg:block lg:flex-1 sticky top-[120px] h-[calc(100vh-120px)]'
          }`}
        >
          {/* Back Button for Mobile full-screen map */}
          {viewMode === 'map' && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setViewMode('grid')}
              className="lg:hidden absolute top-6 left-6 z-[160] flex items-center gap-2 px-4 py-3 bg-white rounded-full shadow-lg text-sm font-semibold text-gray-900 active:scale-95 transition-all border border-gray-100"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Show list
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
        </div>

        {/* Floating Show Map Button (Mobile/Tablet) */}
        {viewMode !== 'map' && (
          <button
            onClick={() => setViewMode('map')}
            className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-full text-sm font-semibold shadow-xl transition-all hover:bg-gray-800 active:scale-95"
          >
            <MapIcon className="w-4 h-4" />
            Show map
          </button>
        )}
      </main>

      {/* Filter / Search Slide-over Panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 35, stiffness: 400 }}
              className="fixed bottom-0 inset-x-0 h-[85vh] md:h-full md:inset-y-0 md:right-0 md:left-auto md:w-[480px] bg-white z-[101] flex flex-col shadow-2xl md:rounded-none rounded-t-3xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-6 space-y-8">

                  {/* What */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service or Venue</label>
                    <div className="relative">
                      <SearchIconLucide className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. Nails, Hair, Guest house"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl py-3.5 pl-11 pr-4 focus:ring-0 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Where */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="City or neighbourhood"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl py-3.5 pl-11 pr-4 focus:ring-0 transition-all outline-none text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Sandton', 'Cape Town', 'Durban', 'Polokwane', 'Pretoria', 'Johannesburg'].map(loc => (
                        <button
                          key={loc}
                          onClick={() => setFilters(prev => ({ ...prev, location: loc }))}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            filters.location === loc
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_CATEGORIES.slice(0, 10).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                            selectedCategory === cat.id
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <cat.icon className={`w-4 h-4 flex-shrink-0 ${ selectedCategory === cat.id ? 'text-white' : 'text-gray-400'}`} />
                          <span className="text-xs font-semibold truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price range (R)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-0 outline-none text-sm"
                      />
                      <span className="text-gray-400 font-medium">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-0 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Property Basics */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Property basics</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-gray-500">Bedrooms</span>
                        <select
                          value={filters.bedroomsMin}
                          onChange={(e) => setFilters(prev => ({ ...prev, bedroomsMin: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-gray-900 focus:ring-0 outline-none text-sm"
                        >
                          <option value="">Any</option>
                          {[1, 2, 3, 4, 5].map(count => (
                            <option key={count} value={count}>{count}+</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-gray-500">Bathrooms</span>
                        <select
                          value={filters.bathroomsMin}
                          onChange={(e) => setFilters(prev => ({ ...prev, bathroomsMin: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:border-gray-900 focus:ring-0 outline-none text-sm"
                        >
                          <option value="">Any</option>
                          {[1, 2, 3, 4, 5].map(count => (
                            <option key={count} value={count}>{count}+</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-5 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-gray-900 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={() => { handleSearch(); setShowFilters(false); }}
                  className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <SearchIconLucide className="w-4 h-4" />
                  Search
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
