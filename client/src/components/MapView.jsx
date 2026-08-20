import React, { useState, useEffect, useRef } from 'react';
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

const isValidCoord = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);
  return (
    typeof numLat === 'number' &&
    typeof numLng === 'number' &&
    Number.isFinite(numLat) &&
    Number.isFinite(numLng) &&
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
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
          if (isValidCoord(latitude, longitude)) {
            try {
              leafletMapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
            } catch (err) {
              console.warn('flyTo failed in locateMe:', err);
            }
          }
        },
        (err) => console.warn('Geolocation error:', err),
        { timeout: 10000 }
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

      const startCenter = (center && isValidCoord(center.lat, center.lng))
        ? [Number(center.lat), Number(center.lng)]
        : [defaultCenter.lat, defaultCenter.lng];
      
      let map;
      try {
        map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
        }).setView(startCenter, 13);
      } catch (err) {
        console.warn('Leaflet map initialization fallback to defaultCenter:', err);
        try {
          map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: true,
          }).setView([defaultCenter.lat, defaultCenter.lng], 13);
        } catch (e) {
          console.error('Leaflet map initialization failed entirely:', e);
          return;
        }
      }

      // Light, clean Airbnb-style theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Helper to create custom price icons
      const createPriceIcon = (item, isSelected) => {
        const price = Number(item.regularPrice ?? item.price);
        const priceLabel = Number.isFinite(price) ? price.toLocaleString() : 'On request';
        
        return L.divIcon({
          className: 'custom-price-marker',
          html: `
            <div class="relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-[1000]' : 'z-[100]'}">
              <div class="relative px-3 py-1.5 ${isSelected ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center whitespace-nowrap font-bold text-[13px] border border-gray-200">
                 ${priceLabel === 'On request' ? priceLabel : `R${priceLabel}`}
              </div>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 15]
        });
      };

      // Function to add markers for a given item list
      const addMarkers = (data) => {
        if (!leafletMapRef.current || !Array.isArray(data)) return;
        // Clean up existing markers
        markersRef.current.forEach(m => {
          try { map.removeLayer(m); } catch (_) {}
        });
        markersRef.current = [];

        data.forEach(item => {
          if (!item) return;
          const rawLat = item.latitude ?? item.lat ?? item.locationCoords?.lat ?? item.coords?.lat;
          const rawLng = item.longitude ?? item.lng ?? item.locationCoords?.lng ?? item.coords?.lng;
          
          if (!isValidCoord(rawLat, rawLng)) return;
          
          const lat = Number(rawLat);
          const lng = Number(rawLng);

          try {
            const marker = L.marker([lat, lng], { 
              icon: createPriceIcon(item, selectedItem?._id === item._id) 
            })
            .addTo(map)
            .on('click', () => {
              setSelectedItem({ ...item, latitude: lat, longitude: lng });
            });

            markersRef.current.push(marker);
          } catch (err) {
            console.warn('Skipping invalid marker creation:', err);
          }
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
          if (map.scrollWheelZoom && map.scrollWheelZoom._timer != null) {
            clearTimeout(map.scrollWheelZoom._timer);
            map.scrollWheelZoom._timer = null;
          }
          if (map.scrollWheelZoom) {
            map.scrollWheelZoom._performZoom = () => {};
          }
        } catch (_) { /* ignore */ }
        try {
          map.remove();
        } catch (_) { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  // Whenever the items prop changes, refresh markers on the existing map
  useEffect(() => {
    if (leafletMapRef.current && typeof leafletMapRef.current.refreshMarkers === 'function') {
      leafletMapRef.current.refreshMarkers(items);
    }
  }, [items]);

  useEffect(() => {
    if (leafletMapRef.current && center && isValidCoord(center.lat, center.lng)) {
      const lat = Number(center.lat);
      const lng = Number(center.lng);
      try {
        leafletMapRef.current.invalidateSize();
        const size = leafletMapRef.current.getSize();
        
        if (size && size.x > 0 && size.y > 0) {
           leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.5 });
        } else {
           leafletMapRef.current.setView([lat, lng], 13, { animate: false });
        }
      } catch (e) {
        console.warn("Leaflet map center update recovered:", e);
        try {
          leafletMapRef.current.setView([lat, lng], 13, { animate: false });
        } catch (_) {}
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
