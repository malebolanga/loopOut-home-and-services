import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, MapIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function Radar() {
  const navigate = useNavigate();
  const [activePin, setActivePin] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState({ latitude: -23.8962, longitude: 29.4486 });

  // Get User Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation permission denied, using Polokwane coords");
        }
      );
    }
  }, []);

  // Fetch listings, services, helpers from the database
  const fetchRadarData = async () => {
    setLoading(true);
    try {
      const [listingsRes, servicesRes, helpersRes] = await Promise.all([
        fetch('/api/listing/get?limit=8'),
        fetch('/api/service/get?limit=8'),
        fetch('/api/helper/get?limit=8')
      ]);

      const listings = listingsRes.ok ? await listingsRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const helpers = helpersRes.ok ? await helpersRes.json() : [];

      const combinedPins = [
        ...listings.map(item => ({
          id: item._id,
          title: item.name,
          type: 'Property',
          link: `/listing/${item._id}`,
          isLive: Math.random() > 0.5, // Simulates active session
          x: 15 + Math.random() * 70,  // Keep within radar screen boundaries (15% to 85%)
          y: 15 + Math.random() * 70,
          distance: (0.2 + Math.random() * 4).toFixed(1) + ' km'
        })),
        ...services.map(item => ({
          id: item._id,
          title: item.name,
          type: 'Service',
          link: `/service/${item._id}`,
          isLive: Math.random() > 0.4,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          distance: (0.1 + Math.random() * 3).toFixed(1) + ' km'
        })),
        ...helpers.map(item => ({
          id: item._id,
          title: item.name,
          type: 'Helper',
          link: `/helper/${item._id}`,
          isLive: Math.random() > 0.3,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          distance: (0.3 + Math.random() * 5).toFixed(1) + ' km'
        }))
      ];

      setPins(combinedPins);
    } catch (error) {
      console.error("Failed to load radar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadarData();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-[200] overflow-hidden">
      {/* Header - Z-Index 30 to hover above interactive map area */}
      <div className="relative z-30 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors text-white backdrop-blur-md cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
          <MapIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black text-white uppercase tracking-widest">Live Radar</span>
        </div>
        <button 
          onClick={fetchRadarData} 
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors text-white backdrop-blur-md"
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Radar Map Rings & Scanner */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full border border-emerald-500/10" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-emerald-500/15" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-emerald-500/20" />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/25" />
        
        {/* Sweeping Scanner */}
        <div className="absolute w-[800px] h-[800px] rounded-full overflow-hidden animate-[spin_6s_linear_infinite]">
          <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/15 to-transparent origin-top-left" />
        </div>
        
        {/* User Center Dot */}
        <div className="absolute w-5 h-5 bg-emerald-500 rounded-full shadow-[0_0_25px_#10b981] border-2 border-white animate-pulse" />
      </div>

      {/* Interactive Map Area (Clickable Pins) - Z-Index 20 */}
      <div className="absolute inset-0 z-20">
        {pins.map(pin => (
          <motion.div
            key={pin.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 1.5 }}
            onClick={() => setActivePin(pin)}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {/* Pulsing signal halo */}
            <div className={`absolute inset-0 w-6 h-6 -left-1 -top-1 rounded-full animate-ping ${
              pin.isLive ? 'bg-green-500/40' : 'bg-emerald-500/20'
            }`} />
            
            {/* Pin Node */}
            <div className={`w-4 h-4 rounded-full border-2 shadow-xl transition-transform group-hover:scale-125 ${
              pin.isLive 
                ? 'bg-green-400 border-white shadow-[0_0_15px_#22c55e]' 
                : 'bg-emerald-500 border-white shadow-[0_0_10px_#10b981]'
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Bottom Panel (Active Pin Info) - Z-Index 30 */}
      <AnimatePresence>
        {activePin && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 p-6 z-30"
          >
            <div className="max-w-md mx-auto bg-gray-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative text-white">
              <button 
                onClick={() => setActivePin(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                &times;
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activePin.isLive ? 'bg-green-500/20' : 'bg-emerald-500/20'
                }`}>
                  <MapPinIcon className={`w-6 h-6 ${
                    activePin.isLive ? 'text-green-400' : 'text-emerald-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{activePin.type}</span>
                    {activePin.isLive && (
                      <span className="text-[9px] px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-black rounded-full uppercase tracking-wider animate-pulse">
                        Live Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight mt-0.5">{activePin.title}</h3>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">Approx. {activePin.distance} away</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(activePin.link)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors active:scale-98"
              >
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Pinging local servers...</p>
        </div>
      )}
    </div>
  );
}
