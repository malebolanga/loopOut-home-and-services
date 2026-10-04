import { motion } from 'framer-motion';
import {
  Home,
  Wrench,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  BedDouble,
  Bath,
  Square,
  Star,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SEARCH_TYPE_CONFIG = {
  properties: {
    icon: Home,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    label: 'Property'
  },
  services: {
    icon: Wrench,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    label: 'Service'
  },
  helpers: {
    icon: Users,
    color: 'bg-gradient-to-r from-orange-500 to-amber-500',
    label: 'Helper'
  },
  events: {
    icon: Calendar,
    color: 'bg-gradient-to-r from-red-500 to-rose-500',
    label: 'Event'
  }
};

const ItemCard = ({ item, searchType = 'properties', index = 0 }) => {
  const config = SEARCH_TYPE_CONFIG[searchType] || SEARCH_TYPE_CONFIG.properties;
  const Icon = config.icon;
  
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getItemTitle = () => {
    return item.title || item.name || item.eventName || 'Untitled';
  };

  const getItemDescription = () => {
    return item.description || item.bio || item.details || 'No description available';
  };

  const getItemLocation = () => {
    return item.location || item.city || item.address || 'Location not specified';
  };

  const renderPropertyDetails = () => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      {item.bedrooms && (
        <div className="flex items-center gap-1">
          <BedDouble className="w-4 h-4" />
          <span>{item.bedrooms} beds</span>
        </div>
      )}
      {item.bathrooms && (
        <div className="flex items-center gap-1">
          <Bath className="w-4 h-4" />
          <span>{item.bathrooms} baths</span>
        </div>
      )}
      {item.area && (
        <div className="flex items-center gap-1">
          <Square className="w-4 h-4" />
          <span>{item.area} m²</span>
        </div>
      )}
    </div>
  );

  const renderServiceDetails = () => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      {item.duration && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{item.duration}</span>
        </div>
      )}
      {item.rating && (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{item.rating}</span>
        </div>
      )}
    </div>
  );

  const renderHelperDetails = () => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      {item.experience && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{item.experience} years exp</span>
        </div>
      )}
      {item.rating && (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{item.rating}</span>
        </div>
      )}
    </div>
  );

  const renderEventDetails = () => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      {item.date && (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
      )}
      {item.time && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{item.time}</span>
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    switch (searchType) {
      case 'properties':
        return renderPropertyDetails();
      case 'services':
        return renderServiceDetails();
      case 'helpers':
        return renderHelperDetails();
      case 'events':
        return renderEventDetails();
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 "
    >
      {/* Image/Preview Area */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.imageUrls?.[0] ? (
          <img loading="lazy"
            src={item.imageUrls[0]}
            alt={getItemTitle()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${config.color}`}
          style={{ display: item.imageUrls?.[0] ? 'none' : 'flex' }}
        >
          <Icon className="w-12 h-12 text-white" />
        </div>
        
        {/* Price Badge */}
        {item.price && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700">{formatPrice(item.price)}</span>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
            <Icon className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-xs font-medium text-gray-700">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {getItemTitle()}
          </h3>
          {item.category && (
            <p className="text-sm text-gray-500 mt-1">{item.category}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-1">{getItemLocation()}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {getItemDescription()}
        </p>

        {/* Details */}
        {renderDetails()}

        {/* Amenities Tags - For Properties */}
        {searchType === 'properties' && item.amenities && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                {amenity}
              </span>
            ))}
            {item.amenities.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                +{item.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group/btn">
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

// Skeleton Card Component
export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
    </div>
  </div>
);

export default ItemCard;
