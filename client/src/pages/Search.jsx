import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '../components/ImageWithFallback';
import useLocationCoords from '../hooks/useGeolocation';
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
  SparklesIcon,
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
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_LISTING_LIMIT = 12;

// Enhanced Categories Configuration with all user requested categories
const ALL_CATEGORIES = [
  // Properties & Accommodation
  { id: 'guest_house', label: 'Guest House', type: 'properties', icon: HomeIcon, color: 'bg-purple-100 text-purple-800', description: 'Guest houses & B&Bs' },
  { id: 'for_rent', label: 'For Rent', type: 'properties', icon: HomeIcon, color: 'bg-blue-100 text-blue-800', description: 'Rental properties' },
  { id: 'for_sale', label: 'For Sale', type: 'properties', icon: TagIcon, color: 'bg-emerald-100 text-emerald-800', description: 'Properties for sale' },
  { id: 'vacation', label: 'Vacation Rental', type: 'properties', icon: SparklesIcon, color: 'bg-pink-100 text-pink-800', description: 'Short-term stays' },

  // Services
  { id: 'photography', label: 'Photography', type: 'services', icon: CameraIcon, color: 'bg-indigo-100 text-indigo-800', description: 'Photo & video services' },
  { id: 'car_wash', label: 'Car Wash', type: 'services', icon: BoltIcon, color: 'bg-cyan-100 text-cyan-800', description: 'Vehicle cleaning' },
  { id: 'landscaping', label: 'Landscaping', type: 'services', icon: SunIcon, color: 'bg-green-100 text-green-800', description: 'Garden & lawn care' },
  { id: 'electrician', label: 'Electrician', type: 'services', icon: BoltIcon, color: 'bg-yellow-100 text-yellow-800', description: 'Electrical services' },
  { id: 'maintenance', label: 'Maintenance', type: 'services', icon: WrenchIcon, color: 'bg-gray-100 text-gray-800', description: 'Repair & maintenance' },
  { id: 'catering', label: 'Catering', type: 'services', icon: BriefcaseIcon, color: 'bg-orange-100 text-orange-800', description: 'Event catering' },
  { id: 'moving', label: 'Moving & Transport', type: 'services', icon: TruckIcon, color: 'bg-amber-100 text-amber-800', description: 'Relocation services' },

  // Helpers
  { id: 'domestic', label: 'Domestic Help', type: 'helpers', icon: HomeIcon, color: 'bg-teal-100 text-teal-800', description: 'Household assistance' },
  { id: 'tattoo', label: 'Tattoo Artist', type: 'helpers', icon: PuzzlePieceIcon, color: 'bg-red-100 text-red-800', description: 'Tattoo & piercing' },
  { id: 'tutor', label: 'Private Tutor', type: 'helpers', icon: AcademicCapIcon, color: 'bg-blue-100 text-blue-800', description: 'Personal teaching' },
  { id: 'hair', label: 'Hair & Beauty', type: 'helpers', icon: ScissorsIcon, color: 'bg-rose-100 text-rose-800', description: 'Salon services' },
  { id: 'nail', label: 'Nail Services', type: 'helpers', icon: SparklesIcon, color: 'bg-pink-100 text-pink-800', description: 'Manicure & pedicure' },
  { id: 'chef', label: 'Private Chef', type: 'helpers', icon: BriefcaseIcon, color: 'bg-amber-100 text-amber-800', description: 'Personal cooking' },
  { id: 'barber', label: 'Barber', type: 'helpers', icon: ScissorsIcon, color: 'bg-sky-100 text-sky-800', description: 'Men\'s grooming' },

  // Transport
  { id: 'transport', label: 'Transport', type: 'services', icon: TruckIcon, color: 'bg-blue-100 text-blue-800', description: 'Transportation services' },

  // Daily Essentials (for Homepage consistency)
  { id: 'daily', label: 'Daily Loop', type: 'services', icon: SparklesIcon, color: 'bg-green-100 text-green-800', description: 'Essentials & daily needs' },
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
    icon: SparklesIcon,
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
    label: 'Local Helpers',
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
                    <div className={`p-2 rounded-lg ${category.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
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
    if (type === 'looking-for') return 'looking-for';
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
    let p = item.price || item.regularPrice || item.hourlyRate || item.dailyRate;
    if (!p) return 'Contact for price';
    
    const formattedPrice = `R${p.toLocaleString()}`;

    if (itemType === 'properties') {
      if (itemSubType === 'rent') return `${formattedPrice} /month`;
      if (itemSubType === 'over' || itemSubType === 'guest_house') return `${formattedPrice}  /night`;
      if (itemSubType === 'office') return `${formattedPrice} /hour`;
      if (itemSubType === 'sale' || itemSubType === 'land') return `${formattedPrice} /Sale`;
    }
    
    if (itemType === 'services' || itemType === 'helpers') {
      if (item.dailyRate) return `${formattedPrice} /day`;
      if (item.hourlyRate) return `${formattedPrice} /hour`;
    }

    if (itemType === 'events') return `${formattedPrice} per guest`;

    return formattedPrice;
  };

  const getRating = () => item.rating || item.averageRating || 4.5;
  const getLocation = () => item.address || item.location || item.city || 'Location not specified';

  if (itemType === 'looking-for') {
     return (
       <motion.div
         variants={itemVariants}
         whileHover={{ y: -4 }}
         onClick={onClick}
         className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col gap-4"
       >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 p-0.5">
                <img src={item.userRef?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} className="w-full h-full object-cover rounded-[0.9rem]" />
             </div>
             <div>
                <h4 className="text-[13px] font-black text-gray-900 leading-tight truncate w-32">{item.userRef?.username || "Neighbor"}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
             </div>
          </div>
          <h3 className="font-black text-gray-900 text-base leading-tight truncate">{item.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 font-medium leading-relaxed">{item.description}</p>
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
             <div className="flex items-center gap-1.5 text-gray-400">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[80px]">{getLocation()}</span>
             </div>
             <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Active Need</span>
          </div>
       </motion.div>
     );
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 4, y: -2, backgroundColor: '#f9fafb' }}
        onClick={onClick}
        className=" rounded-2xl p-3 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 flex gap-4  overflow-hidden"
      >
        <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 bg-neutral-100">
          <ImageWithFallback
            src={getImageUrl()}
            imageUrls={getAllImages()}
            type={itemType === 'listing' ? 'property' : (itemType === 'helper' ? 'helper' : (itemType === 'event' ? 'event' : 'service'))}
            alt={item.name || item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate tracking-tight group-hover:text-rose-600 transition-colors">
                {item.name || item.title}
              </h3>
              <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                <MapPinIcon className="w-3 h-3" />
                <p className="text-[11px] font-medium truncate">{getLocation()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-gray-50 px-2 py-1 rounded-lg">
              <StarIcon className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-gray-900">{getRating().toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 flex-wrap">
            {item.bedrooms !== undefined && (
              <span className="bg-gray-50 px-2 py-0.5 rounded-md">{item.bedrooms} bed</span>
            )}
            {item.bathrooms !== undefined && (
              <span className="bg-gray-50 px-2 py-0.5 rounded-md">{item.bathrooms} bath</span>
            )}
            {itemType !== 'properties' && subConfig && (
              <span className="bg-gray-50 px-2 py-0.5 rounded-md">{subConfig.label}</span>
            )}
          </div>

          <div className="mt-auto flex justify-between items-end">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starting from</span>
                <span className="text-base font-black text-gray-900">{getPrice()}</span>
             </div>
             <button
               onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
               className={`p-2 rounded-full transition-all ${isLiked ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500'}`}
             >
               <HeartIcon className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="
      cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-2xl mb-3 shadow-sm group-hover:shadow-md transition-shadow">
        <ImageWithFallback
          src={getImageUrl()}
          imageUrls={getAllImages()}
          type={itemType === 'listing' ? 'property' : (itemType === 'helper' ? 'helper' : (itemType === 'event' ? 'event' : 'service'))}
          alt={item.name || item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Type Badge */}
        {mainConfig && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-sm">
              <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
                 {mainConfig.label}
              </span>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all active:scale-90"
        >
          <HeartIcon className={`w-4 h-4 stroke-[2.5px] ${isLiked ? 'text-rose-500 fill-rose-500 stroke-rose-500' : 'text-white'}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-rose-600 transition-colors">
            {item.name || item.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarIcon className="w-3 h-3 text-gray-900 fill-gray-900" />
            <span className="text-xs font-bold text-gray-900">{getRating().toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 mt-0.5">
          <MapPinIcon className="w-3 h-3 flex-shrink-0" />
          <p className="text-xs font-medium truncate">{getLocation()}</p>
        </div>
        
        <div className="text-[11px] text-gray-400 mt-1 flex gap-1 items-center flex-wrap uppercase font-bold tracking-tight">
           {itemType === 'properties' ? (
             <>
               <span>{item.bedrooms || 0} Beds</span>
               <span className="text-gray-300">•</span>
               <span>{item.bathrooms || 0} Baths</span>
             </>
           ) : (
             subConfig && <span>{subConfig.label}</span>
           )}
        </div>

        <div className="mt-2 text-sm font-black text-gray-900 uppercase">
           {getPrice()}
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
  <div className="space-y-3">
    <div className="aspect-[4/3] bg-gray-200 animate-pulse rounded-2xl" />
    <div className="space-y-2">
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
        endpoints = ['listing', 'service', 'helper', 'event', 'looking-for'];
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
    <div className="min-h-screen bg-slate-50">
      {/* Airbnb Style Persistent Header */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
           
           {/* Search Pill Trigger */}
           <button 
             onClick={() => setShowFilters(true)}
             className="flex-1 flex items-center gap-4 bg-white border border-slate-200/50 rounded-full px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all active:scale-98 group"
           >
              <MagnifyingGlassIcon className="w-5 h-5 text-rose-500" />
              <div className="flex flex-col items-start overflow-hidden">
                 <span className="text-sm font-black text-gray-900 truncate leading-none mb-1">
                    {searchTerm || 'Where to?'}
                 </span>
                 <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest whitespace-nowrap">
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
             className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200/50 bg-white shadow-sm hover:shadow-md transition-all active:scale-90"
           >
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
           </button>
        </div>
      </div>

      <main className="pt-24 pb-32 px-4 md:px-10 lg:px-20 max-w-[2520px] mx-auto">
         {/* Categories Bar */}
         <div className="mb-12 overflow-x-auto no-scrollbar py-2">
            <div className="flex gap-8 items-center">
               <button 
                 onClick={() => { setSelectedCategory('all'); fetchData(); }}
                 className={`flex flex-col items-center gap-3 min-w-fit transition-all ${!selectedCategory || selectedCategory === 'all' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <SparklesIcon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">All Vibes</span>
                  {(!selectedCategory || selectedCategory === 'all') && <div className="w-6 h-0.5 bg-gray-950 rounded-full" />}
               </button>
               
               {ALL_CATEGORIES.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => handleCategorySelect(cat)}
                   className={`flex flex-col items-center gap-3 min-w-fit transition-all ${selectedCategory === cat.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <cat.icon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                    {selectedCategory === cat.id && <div className="w-6 h-0.5 bg-gray-950 rounded-full" />}
                 </button>
               ))}
            </div>
         </div>

         {/* Results Area */}
         <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">
                  {listings.length} Results Found
               </h2>
               {searchType !== 'all' && (
                 <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                    {searchType}
                 </span>
               )}
            </div>
            
            <div className="flex items-center gap-2 bg-white/50 border border-slate-200/50 p-1 rounded-full shadow-sm">
               <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-gray-950 text-white' : 'text-gray-400'}`}
               >
                  <Squares2X2Icon className="w-4 h-4" />
               </button>
               <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-gray-950 text-white' : 'text-gray-400'}`}
               >
                  <Bars3Icon className="w-4 h-4" />
               </button>
               <button 
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-all ${viewMode === 'map' ? 'bg-gray-950 text-white' : 'text-gray-400'}`}
               >
                  <MapIcon className="w-4 h-4" />
               </button>
            </div>
         </div>

         {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-8">
             {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
           </div>
         ) : listings.length > 0 ? (
           <motion.div 
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className={`grid gap-x-8 gap-y-12 ${
               viewMode === 'grid' 
                 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5' 
                 : 'grid-cols-1'
             }`}
           >
             {listings.map((item, idx) => (
               <ResultCard 
                 key={item._id || item.id || idx} 
                 item={item} 
                 viewMode={viewMode}
                 onClick={() => addToRecentlyViewed(item, item.itemType)}
               />
             ))}
           </motion.div>
         ) : (
           <EmptyState onClear={clearFilters} />
         )}
      </main>

      {/* Map Toggle Floating Button (Mobile) */}
      <button 
        onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 bg-gray-950 text-white px-6 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-110 active:scale-95 border border-white/20"
      >
        {viewMode === 'map' ? (
          <><Bars3Icon className="w-4 h-4" /> List View</>
        ) : (
          <><MapIcon className="w-4 h-4" /> Show Map View</>
        )}
      </button>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowFilters(false)} 
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[100]" 
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-slate-50 z-[101] flex flex-col md:max-w-md md:left-auto md:right-0 md:shadow-2xl overflow-hidden"
            >
              <div className="flex-shrink-0 bg-white/80 backdrop-blur-md px-6 pt-12 pb-4 border-b border-slate-200/50 flex items-center justify-between">
                <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2">
                  {[
                    { id: 'properties', label: 'Homes', icon: HomeIcon, color: 'rose' },
                    { id: 'events', label: 'Experiences', icon: TicketIcon, color: 'rose' },
                    { id: 'services', label: 'Services', icon: UserGroupIcon, color: 'rose' },
                    { id: 'helpers', label: 'Helpers', icon: BriefcaseIcon, color: 'rose' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = searchType === item.id;
                    
                    return (
                      <button 
                        key={item.id}
                        onClick={() => setSearchType(item.id)}
                        className="flex flex-col items-center gap-2 relative outline-none"
                      >
                         <motion.div 
                           animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
                           transition={{ duration: 0.4, ease: "backOut" }}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-gray-400 border border-slate-100'}`}
                         >
                            <Icon className="w-6 h-6" />
                         </motion.div>
                         
                         <motion.span 
                           animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1.05 : 1 }}
                           className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
                         >
                           {item.label}
                         </motion.span>
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200/50 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-950" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
                 {/* Section: WHERE? */}
                 <div className="bg-transparent rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 border border-slate-200/50">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter italic uppercase">Where to?</h2>
                    
                    <div className="relative mb-8">
                       <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                       <input 
                         type="text"
                         placeholder="Neural destination..."
                         value={filters.location}
                         onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                         className="w-full bg-slate-50/50 border border-slate-200/50 rounded-2xl py-5 pl-12 pr-4 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none font-black text-sm uppercase tracking-widest placeholder:text-slate-300"
                       />
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Suggested Hubs</p>
                       
                       <button 
                         onClick={() => setFilters(prev => ({ ...prev, location: 'Nearby' }))}
                         className="w-full flex items-center gap-5 p-4 rounded-3xl hover:bg-white/50 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                       >
                          <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                             <MapPinIcon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Nearby</p>
                             <p className="text-[10px] font-bold text-gray-400">SYNC WITH LOCAL COORDINATES</p>
                          </div>
                       </button>

                       <button 
                         onClick={() => setFilters(prev => ({ ...prev, location: 'Cape Town, Western Cape' }))}
                         className="w-full flex items-center gap-5 p-4 rounded-3xl hover:bg-white/50 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                       >
                          <div className="w-12 h-12 bg-teal-50/50 rounded-2xl flex items-center justify-center text-teal-500 shadow-inner">
                             <BuildingOfficeIcon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Cape Town</p>
                             <p className="text-[10px] font-bold text-gray-400">COASTAL EXPEDITION HUB</p>
                          </div>
                       </button>

                       <button 
                         onClick={() => setFilters(prev => ({ ...prev, location: 'Durban, KwaZulu-Natal' }))}
                         className="w-full flex items-center gap-5 p-4 rounded-3xl hover:bg-white/50 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                       >
                          <div className="w-12 h-12 bg-orange-50/50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                             <HomeIcon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Durban</p>
                             <p className="text-[10px] font-bold text-gray-400">SUBTROPICAL ADVENTURE MATRIX</p>
                          </div>
                       </button>
                    </div>
                 </div>

                 {/* Collapsed Sections: WHEN and WHO */}
                 <div className="bg-white/50 rounded-[2rem] p-6 flex items-center justify-between border border-slate-100 opacity-60">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-900">Neural Timeframe</span>
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest underline underline-offset-4">Configure</span>
                 </div>

                 <div className="bg-white/50 rounded-[2rem] p-6 flex items-center justify-between border border-slate-100 opacity-60">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-900">Entity Count</span>
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest underline underline-offset-4">Assign</span>
                 </div>
              </div>

              {/* Footer - Search Button */}
              <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-t border-slate-200/50 p-8 flex items-center justify-between">
                 <button 
                   onClick={() => setFilters({ minPrice: '', maxPrice: '', minRating: '', location: '' })}
                   className="text-[10px] font-black text-gray-400 underline underline-offset-8 hover:text-rose-600 transition-colors uppercase tracking-[0.2em]"
                 >
                   Clear Loop
                 </button>
                 
                 <button 
                   onClick={() => { handleSearch(); setShowFilters(false); }}
                   className="bg-gray-950 text-white px-10 py-5 rounded-[1.5rem] flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-rose-500 transition-all active:scale-95 group"
                 >
                   <MagnifyingGlassIcon className="w-5 h-5 text-rose-500 group-hover:text-white transition-colors" />
                   <span className="text-xs font-black uppercase tracking-widest">Execute Scan</span>
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