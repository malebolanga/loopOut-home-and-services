// src/components/FilterSheet.jsx (simplified - no external UI components)
import { motion, AnimatePresence } from "framer-motion";
import { SEARCH_TYPE_CONFIG } from "../utils/searchUtils";

const typeOptions = {
  properties: [
    { id: 'all', label: 'Any type', icon: '🏠', description: 'All properties' },
    { id: 'sale', label: 'For Sale', icon: '💰', description: 'Buy property' },
    { id: 'rent-short', label: 'Short Term', icon: '🏡', description: 'Nightly stays' },
    { id: 'rent-long', label: 'Long Term', icon: '🏘️', description: 'Monthly rental' },
    { id: 'office', label: 'Office', icon: '🏢', description: 'Per hour' },
    { id: 'land', label: 'Land', icon: '🌳', description: 'For sale' }
  ],
  services: [
    { id: 'all', label: 'All Services', icon: '✨', description: 'All types' },
    { id: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'Home & office' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', description: 'Repairs' },
    { id: 'moving', label: 'Moving', icon: '🚚', description: 'Moving help' },
    { id: 'landscaping', label: 'Landscaping', icon: '🌿', description: 'Garden care' },
    { id: 'catering', label: 'Catering', icon: '🍽️', description: 'Food service' },
    { id: 'daycare', label: 'DayCare', icon: '👶', description: 'Child care' },
    { id: 'schoolTransport', label: 'Transport', icon: '🚌', description: 'School transport' }
  ],
  helpers: [
    { id: 'all', label: 'All Helpers', icon: '👥', description: 'All types' },
    { id: 'tutor', label: 'Tutor', icon: '📚', description: 'Tutoring' },
    { id: 'chef', label: 'Chef', icon: '👨‍🍳', description: 'Cooking' },
    { id: 'handyman', label: 'Handyman', icon: '🛠️', description: 'Repairs' },
    { id: 'domestic', label: 'Maid', icon: '🧽', description: 'House help' },
    { id: 'beauty', label: 'Beauty', icon: '💄', description: 'Beauty services' },
    { id: 'barber', label: 'Barber', icon: '✂️', description: 'Grooming' },
    { id: 'photography', label: 'Photographer', icon: '📷', description: 'Photography' }
  ],
  events: [
    { id: 'all', label: 'All Events', icon: '🎉', description: 'All types' },
    { id: 'concert', label: 'Concert', icon: '🎵', description: 'Music' },
    { id: 'workshop', label: 'Workshop', icon: '🎨', description: 'Learning' },
    { id: 'sports', label: 'Sports', icon: '⚽', description: 'Sports events' },
    { id: 'community', label: 'Community', icon: '🤝', description: 'Meetups' },
    { id: 'festival', label: 'Festival', icon: '🎪', description: 'Festivals' }
  ]
};

export const FilterSheet = ({
  isOpen,
  onClose,
  searchType,
  selectedSubType,
  onSubTypeChange,
  priceMin,
  priceMax,
  onPriceChange,
  onApply,
  onClear,
  resultsCount
}) => {
  const options = typeOptions[searchType] || typeOptions.properties;

  const getPriceLabel = () => {
    switch (searchType) {
      case 'properties': return 'Price includes all fees';
      case 'services': return 'Service price';
      case 'helpers': return 'Hourly rate';
      case 'events': return 'Ticket price';
      default: return 'Price';
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg 
                  className="w-5 h-5 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Type Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onSubTypeChange(option.id)}
                      className={`p-4 border rounded-xl text-left transition-all ${selectedSubType === option.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium text-sm text-gray-900">{option.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Price range</h3>
                  <span className="text-sm text-gray-500">{getPriceLabel()}</span>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                      <input
                        type="number"
                        value={priceMin || ''}
                        onChange={(e) => onPriceChange(Number(e.target.value), priceMax)}
                        placeholder="0"
                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                      <input
                        type="number"
                        value={priceMax < 100000000 ? priceMax : ''}
                        onChange={(e) => onPriceChange(priceMin, Number(e.target.value) || 100000000)}
                        placeholder="Any"
                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-4">
              <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-700 underline underline-offset-4"
              >
                Clear all
              </button>
              <button
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Show {resultsCount}+ results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSheet;