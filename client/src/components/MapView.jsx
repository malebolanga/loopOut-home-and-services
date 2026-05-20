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
    // Load Leaflet from CDN dynamically
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

    function initMap() {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      const L = window.L;
      if (!L) return;

      const startCenter = center ? [center.lat, center.lng] : [defaultCenter.lat, defaultCenter.lng];
      
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(startCenter, 13);

      // Elite Silver Theme Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Helper to create custom price icons
      const createPriceIcon = (item, isSelected) => {
        const type = (item.itemType || item.type || 'listing').toLowerCase();
        const price = item.regularPrice || item.price || 0;
        
        let bgColor = 'bg-gray-950'; // Default
        if (type.includes('service')) bgColor = 'bg-orange-500';
        else if (type.includes('listing')) bgColor = 'bg-rose-600';
        else if (type.includes('helper') || type.includes('maid') || type.includes('cleaning')) bgColor = 'bg-emerald-500';
        else if (type.includes('event')) bgColor = 'bg-gray-950';

        return L.divIcon({
          className: 'custom-price-marker',
          html: `
            <div class="relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-[1000]' : 'z-[100]'}">
              ${isSelected ? `<div class="absolute w-12 h-12 ${bgColor.replace('bg-', 'bg-')}/20 rounded-full animate-ping"></div>` : ''}
              <div class="relative px-3 py-1.5 ${bgColor} text-white rounded-full border-2 border-white shadow-2xl flex items-center justify-center whitespace-nowrap">
                 <span class="text-[10px] font-black tracking-tight">R${price.toLocaleString()}</span>
              </div>
              <div class="absolute -bottom-1 w-2 h-2 ${bgColor} rotate-45 border-r-2 border-b-2 border-white"></div>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 30]
        });
      };

      // Function to add markers for a given item list
      const addMarkers = (data) => {
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

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [center, items]);

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
        .leaflet-container { background: #0a0a0a; cursor: crosshair !important; }
      `}</style>

      {/* HUD: Search Summary Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[500] hidden md:block pointer-events-none">
         <div className="bg-gray-950/90 backdrop-blur-2xl border border-white/10 px-8 py-3 rounded-3xl shadow-2xl flex items-center gap-4">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Neural Scan: {items.length} Masterpieces Found
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
            className="absolute bottom-10 left-6 right-6 md:left-10 md:right-auto md:w-96 z-[600]"
          >
             <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/20 relative group overflow-hidden">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex gap-4">
                   <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                      <img src={selectedItem.imageUrls?.[0] || selectedItem.image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=400&q=80'} alt={selectedItem.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <div className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">{selectedItem.itemType || 'Listing'}</div>
                      <h4 className="text-lg font-black text-gray-950 leading-tight mb-1">{selectedItem.name || selectedItem.title}</h4>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                         <span className="text-gray-950 font-black">R{(selectedItem.regularPrice || selectedItem.price || 0).toLocaleString()}</span>
                         <span>•</span>
                         <span>{selectedItem.type || selectedItem.category}</span>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => onItemClick(selectedItem)}
                  className="w-full mt-6 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  Inspect Masterpiece <ChevronRight className="w-4 h-4 text-rose-500" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neural Discovery Legend (Color Guidelines) */}
      <div className="absolute bottom-10 left-6 md:left-8 z-[500]">
         <div className="bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-[2rem] shadow-2xl border border-gray-100 space-y-3 md:space-y-4">
            <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Guidelines</div>
            <div className="flex flex-col gap-2 md:gap-3">
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-950">Homes</span>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-950">Services</span>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-950">Helpers</span>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-2.5 h-2.5 bg-gray-950 rounded-full" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-950">Events</span>
               </div>
            </div>
         </div>
      </div>

      {/* Floating HUD Controls */}
      <div className="absolute bottom-10 right-8 flex flex-col gap-4 z-[500]">
         <button onClick={toggleFullscreen} className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl flex items-center justify-center text-gray-950 active:scale-90 transition-all border border-gray-100">
           {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
         </button>
         <button onClick={handleLocateMe} className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl flex items-center justify-center text-gray-950 active:scale-90 transition-all border border-gray-100">
           <Navigation className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

export default MapView;
