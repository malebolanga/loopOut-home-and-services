import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  X,
  Maximize2,
  Minimize2,
  Navigation,
  Star,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const defaultCenter = {
  lat: -23.9058, // Polokwane
  lng: 29.4505
};

const MapView = ({ 
  items = [], 
  searchType = 'all', 
  location = 'South Africa',
  center,
  onItemClick 
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  // Keep references to marker layers for easy cleanup on data update
  const markersRef = useRef([]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleLocateMe = () => {
    if (navigator.geolocation && leafletMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          leafletMapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
        }
      );
    }
  };

  useEffect(() => {
    // Track mounted state to prevent async callbacks after unmount
    let mounted = true;

    function initMap() {
      if (!mounted || !mapContainerRef.current || leafletMapRef.current) return;

      const L = window.L;
      if (!L) return;

      const startCenter = center ? [center.lat, center.lng] : [defaultCenter.lat, defaultCenter.lng];
      
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        // Prevent the ScrollWheelZoom setTimeout from firing after unmount
        scrollWheelZoom: true,
      }).setView(startCenter, 13);

      // Light, clean Airbnb-style theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Helper to create custom price icons
      const createPriceIcon = (item, isSelected) => {
        const price = item.regularPrice || item.price || 0;
        
        return L.divIcon({
          className: 'custom-price-marker',
          html: `
            <div class="relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-[1000]' : 'z-[100]'}">
              <div class="relative px-3 py-1.5 ${isSelected ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center whitespace-nowrap font-bold text-[13px] border border-gray-200">
                 R${price.toLocaleString()}
              </div>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 15]
        });
      };

      // Function to add markers for a given item list
      const addMarkers = (data) => {
        if (!leafletMapRef.current) return;
        // Clean up existing markers
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        data.forEach(item => {
          let lat = parseFloat(item.latitude);
          let lng = parseFloat(item.longitude);
          
          if (isNaN(lat)) lat = defaultCenter.lat + (Math.random() - 0.5) * 0.05;
          if (isNaN(lng)) lng = defaultCenter.lng + (Math.random() - 0.5) * 0.05;
          
          const marker = L.marker([lat, lng], { 
            icon: createPriceIcon(item, selectedItem?._id === item._id) 
          })
          .addTo(map)
          .on('click', () => {
            setSelectedItem({ ...item, latitude: lat, longitude: lng });
          });

          markersRef.current.push(marker);
        });
      };

      // Initial marker load
      addMarkers(items);

      leafletMapRef.current = map;

      // Expose a method to refresh markers when items change
      leafletMapRef.current.refreshMarkers = addMarkers;
    }

    // Load Leaflet from CDN dynamically if not already loaded
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        const map = leafletMapRef.current;
        // Null out the ref FIRST so any concurrent callbacks bail early
        leafletMapRef.current = null;
        try {
          // Directly cancel the pending ScrollWheelZoom setTimeout.
          // .disable() only blocks future events — the already-queued timer
          // still fires and crashes on _leaflet_pos. clearTimeout prevents that.
          if (map.scrollWheelZoom && map.scrollWheelZoom._timer != null) {
            clearTimeout(map.scrollWheelZoom._timer);
            map.scrollWheelZoom._timer = null;
          }
          // Also patch _performZoom to a no-op as a second safety net
          if (map.scrollWheelZoom) {
            map.scrollWheelZoom._performZoom = () => {};
          }
        } catch (_) { /* ignore */ }
        try {
          map.remove();
        } catch (_) { /* ignore */ }
      }
    };
  // NOTE: `items` intentionally omitted — markers are refreshed by the effect below.
  // Including `items` here would destroy/recreate the map on every data update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  // Whenever the items prop changes, refresh markers on the existing map
  useEffect(() => {
    if (leafletMapRef.current && typeof leafletMapRef.current.refreshMarkers === 'function') {
      leafletMapRef.current.refreshMarkers(items);
    }
  }, [items]);

  useEffect(() => {
    if (leafletMapRef.current && center && typeof center.lat === 'number' && !isNaN(center.lat) && typeof center.lng === 'number' && !isNaN(center.lng)) {
      try {
        leafletMapRef.current.invalidateSize();
        const size = leafletMapRef.current.getSize();
        
        if (size.x > 0 && size.y > 0) {
           leafletMapRef.current.flyTo([center.lat, center.lng], 13, { duration: 1.5 });
        } else {
           leafletMapRef.current.setView([center.lat, center.lng], 13, { animate: false });
        }
      } catch (e) {
        console.warn("Leaflet map center update recovered:", e);
        leafletMapRef.current.setView([center.lat, center.lng], 13, { animate: false });
      }
    }
  }, [center]);

  return (
    <div className={`relative w-full h-full overflow-hidden p-0 m-0 ${isFullscreen ? 'fixed inset-0 z-[200] bg-black h-[100dvh]' : ''}`}>
      <style>{`
        .custom-price-marker { background: transparent; border: none; }
        .leaflet-container { background: #f8f9fa; cursor: grab; }
        .leaflet-container:active { cursor: grabbing; }
      `}</style>

      {/* HUD: Search Summary Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] hidden md:block pointer-events-none">
         <div className="bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-md border border-gray-100 flex items-center gap-2 transition-all">
            <span className="text-xs font-bold text-gray-900">
              {items.length} places found
            </span>
         </div>
      </div>

      {/* Professional Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Results Carousel Overlay for Mobile/HUD */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-4 right-4 md:left-8 md:right-auto md:w-80 z-[600]"
          >
             <div 
               onClick={() => onItemClick(selectedItem)}
               className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all group flex flex-col gap-3"
             >
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-sm z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative">
                   <img src={selectedItem.imageUrls?.[0] || selectedItem.image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=400&q=80'} alt={selectedItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                   <div className="flex items-center justify-between mb-1">
                     <h4 className="font-bold text-gray-900 truncate">{selectedItem.name || selectedItem.title}</h4>
                     <div className="flex items-center gap-1">
                       <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                       <span className="text-sm font-medium">{selectedItem.rating || 4.9}</span>
                     </div>
                   </div>
                   <p className="text-sm text-gray-500 truncate mb-1">{selectedItem.address || selectedItem.location}</p>
                   <div className="text-sm font-semibold text-gray-900 mt-1">
                      R{(selectedItem.regularPrice || selectedItem.price || 0).toLocaleString()} 
                      <span className="font-normal text-gray-500"> total</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating HUD Controls */}
      <div className="absolute top-24 right-4 flex flex-col gap-2 z-[500]">
         <button onClick={toggleFullscreen} className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all border border-gray-200">
           {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
         </button>
         <button onClick={handleLocateMe} className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all border border-gray-200">
           <Navigation className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

export default MapView;
