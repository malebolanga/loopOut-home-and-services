import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Home,
  Wrench,
  Users,
  Calendar,
  X,
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';

// Simple fallback map view without react-leaflet
const MapView = ({ 
  items = [], 
  searchType = 'properties', 
  location = 'South Africa',
  onItemClick 
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleResetView = () => {
    setSelectedItem(null);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`Your location: ${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case 'properties': return { emoji: '🏠', color: 'bg-blue-500' };
      case 'services': return { emoji: '🔧', color: 'bg-green-500' };
      case 'helpers': return { emoji: '👥', color: 'bg-orange-500' };
      case 'events': return { emoji: '🎪', color: 'bg-red-500' };
      default: return { emoji: '📍', color: 'bg-gray-500' };
    }
  };

  const getItemType = (item) => {
    return item.itemType || searchType;
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2.5 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-700" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-700" />
          )}
        </button>
        
        <button
          onClick={handleResetView}
          className="p-2.5 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Reset View"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={handleLocateMe}
          className="p-2.5 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Locate Me"
        >
          <Navigation className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Map Container (Static Image for now) */}
      <div className={`${isFullscreen ? 'h-screen' : 'h-[600px]'} rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 relative`}>
        {/* Map Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50 via-gray-100 to-gray-200 opacity-50"></div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Items as markers on the map */}
        {items.map((item, index) => {
          const itemType = getItemType(item);
          const icon = getItemIcon(itemType);
          
          // Random position for demo
          const top = 20 + (index % 8) * 60;
          const left = 20 + (Math.floor(index / 8) % 6) * 80;
          
          return (
            <motion.button
              key={item._id || index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleItemClick(item)}
              className={`absolute ${icon.color} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border-2 border-white`}
              style={{ top: `${top}px`, left: `${left}px` }}
            >
              <span className="text-lg">{icon.emoji}</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {item.title || item.name || 'Item'}
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </motion.button>
          );
        })}
        
        {/* Map Center Indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-4 border-red-500 rounded-full animate-ping"></div>
          <div className="w-8 h-8 border-4 border-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Location Label */}
        <div className="absolute bottom-8 left-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">{location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Counter */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              {items.length} {searchType} in {location}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Item Details Panel */}
      {selectedItem && !isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 z-[1000]"
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 border border-gray-200 max-w-md mx-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {selectedItem.title || selectedItem.name || 'Untitled'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedItem.location || selectedItem.city || selectedItem.address || 'Location not specified'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {selectedItem.description || 'No description available'}
            </p>
            
            <div className="flex items-center justify-between">
              {selectedItem.price && (
                <div className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR',
                    maximumFractionDigits: 0
                  }).format(selectedItem.price)}
                </div>
              )}
              
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-md transition-all">
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Map Legend */}
      {!isFullscreen && (
        <div className="absolute bottom-20 left-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-700">Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-700">Services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-700">Helpers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-700">Events</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;