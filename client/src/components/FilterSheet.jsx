import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import {
  X,
  Filter,
  DollarSign,
  Home,
  BedDouble,
  Wifi,
  Car,
  Snowflake,
  Dumbbell,
  PawPrint,
  Eye,
  Shield,
  ChefHat,
  Calendar,
  Clock,
  ChevronDown,
  Sparkles,
  Users,
  Wrench
} from 'lucide-react';

const SEARCH_TYPE_CONFIG = {
  all: {
    label: 'All Categories',
    icon: Sparkles,
    subtypes: [
      { value: 'all', label: 'All Types', icon: Sparkles }
    ]
  },
  properties: {
    label: 'Properties',
    icon: Home,
    subtypes: [
      { value: 'all', label: 'All Types', icon: Home },
      { value: 'rent', label: 'For Rent', icon: DollarSign },
      { value: 'sale', label: 'For Sale', icon: DollarSign },
      { value: 'office', label: 'Office', icon: Home },
      { value: 'land', label: 'Land', icon: Home },
      { value: 'guesthouse', label: 'Guest House', icon: Home }
    ]
  },
  services: {
    label: 'Services',
    icon: Wrench,
    subtypes: [
      { value: 'all', label: 'All Services', icon: Wrench },
      { value: 'cleaning', label: 'Cleaning', emoji: '🧹' },
      { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
      { value: 'moving', label: 'Moving', emoji: '🚚' },
      { value: 'landscaping', label: 'Landscaping', emoji: '🌿' },
      { value: 'catering', label: 'Catering', emoji: '🍳' }
    ]
  },
  helpers: {
    label: 'Helpers',
    icon: Users,
    subtypes: [
      { value: 'all', label: 'All Helpers', icon: Users },
      { value: 'domestic', label: 'General Help', emoji: '👨‍💼' },
      { value: 'errand', label: 'Errand Runner', emoji: '🛒' },
      { value: 'tutor', label: 'Tutor', emoji: '📚' },
      { value: 'chef', label: 'Chef', emoji: '👨‍🍳' },
      { value: 'maid', label: 'Maid', emoji: '🧹' }
    ]
  },
  events: {
    label: 'Events',
    icon: Calendar,
    subtypes: [
      { value: 'all', label: 'All Events', icon: Calendar },
      { value: 'music', label: 'Music', emoji: '🎵' },
      { value: 'sports', label: 'Sports', emoji: '⚽' },
      { value: 'art', label: 'Art & Culture', emoji: '🎨' },
      { value: 'community', label: 'Community', emoji: '👥' },
      { value: 'food', label: 'Food & Drink', emoji: '🍔' }
    ]
  }
};

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'aircon', label: 'Air Conditioning', icon: Snowflake },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'pets', label: 'Pets Allowed', icon: PawPrint },
  { id: 'view', label: 'Great View', icon: Eye },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'furnished', label: 'Furnished', icon: Home }
];

const FilterSheet = ({
  isOpen = false,
  onClose,
  searchType = 'all',
  selectedSubType = 'all',
  onSubTypeChange,
  filters = {},
  onFiltersChange,
  onApply,
  onClear,
  resultsCount = 0,
  recentSearches = [],
  onRecentSearchClick
}) => {
  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin || 0,
    max: filters.priceMax || 100000000
  });

  const [bedroomsRange, setBedroomsRange] = useState({
    min: filters.bedroomsMin || '',
    max: filters.bedroomsMax || ''
  });

  const handleAmenityChange = (amenityId) => {
    onFiltersChange({
      ...filters,
      [amenityId]: !filters[amenityId]
    });
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value) || 0 };
    setPriceRange(newRange);
    onFiltersChange({
      ...filters,
      priceMin: newRange.min,
      priceMax: newRange.max
    });
  };

  const handleBedroomsChange = (type, value) => {
    const newRange = { ...bedroomsRange, [type]: value };
    setBedroomsRange(newRange);
    onFiltersChange({
      ...filters,
      bedroomsMin: newRange.min,
      bedroomsMax: newRange.max
    });
  };

  const handleApply = () => {
    if (onApply) onApply();
  };

  const handleClear = () => {
    setPriceRange({ min: 0, max: 100000000 });
    setBedroomsRange({ min: '', max: '' });
    if (onClear) onClear();
  };

  const currentConfig = SEARCH_TYPE_CONFIG[searchType] || SEARCH_TYPE_CONFIG.all;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5 text-gray-700" />
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Filters
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {resultsCount > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {resultsCount} results found
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Subtype Selector */}
                  {currentConfig.subtypes && currentConfig.subtypes.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {currentConfig.subtypes.map((subtype) => {
                          const isSelected = selectedSubType === subtype.value;
                          
                          return (
                            <button
                              key={subtype.value}
                              onClick={() => onSubTypeChange(subtype.value)}
                              className={`px-3 py-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {subtype.emoji ? (
                                <span className="text-lg">{subtype.emoji}</span>
                              ) : subtype.icon ? (
                                <subtype.icon className="w-4 h-4" />
                              ) : null}
                              <span className="text-sm font-medium">{subtype.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Min</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R</span>
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Max</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R</span>
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Any"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bedrooms - Only for properties */}
                  {searchType === 'properties' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Bedrooms
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Min</label>
                          <input
                            type="number"
                            value={bedroomsRange.min}
                            onChange={(e) => handleBedroomsChange('min', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max</label>
                          <input
                            type="number"
                            value={bedroomsRange.max}
                            onChange={(e) => handleBedroomsChange('max', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Any"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities - Only for properties */}
                  {searchType === 'properties' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Amenities
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {AMENITIES.map((amenity) => {
                          const Icon = amenity.icon;
                          const isChecked = filters[amenity.id] || false;
                          
                          return (
                            <button
                              key={amenity.id}
                              onClick={() => handleAmenityChange(amenity.id)}
                              className={`px-3 py-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                isChecked
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{amenity.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Searches</h3>
                      <div className="space-y-2">
                        {recentSearches.slice(0, 3).map((search, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (onRecentSearchClick) onRecentSearchClick(search);
                              onClose();
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <Clock className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {search.params.searchTerm || 'Anywhere'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {search.params.searchType && search.params.searchType !== 'all' && `${search.params.searchType} • `}
                                {Object.entries(search.params)
                                  .filter(([k, v]) => !['searchTerm', 'searchType'].includes(k) && v)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={handleClear}
                      className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleApply}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-md transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FilterSheet;
