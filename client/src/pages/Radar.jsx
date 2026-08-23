import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, MapIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function Radar() {
  const navigate = useNavigate();
  const [activePin, setActivePin] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
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
        fetch('/api/listing/get?limit=50'),
        fetch('/api/service/get?limit=50'),
        fetch('/api/helper/get?limit=50')
      ]);

      const listings = listingsRes.ok ? await listingsRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const helpers = helpersRes.ok ? await helpersRes.json() : [];

      const combinedPins = [
        ...listings.map(item => ({
          id: item._id,
          title: item.name,
          mainType: 'Property',
          type: item.type || 'Property',
          category: item.category || '',
          link: `/listing/${item._id}`,
          price: item.price ? `R${item.price}` : 'Open Bid',
          image: item.imageUrls?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
          isLive: Math.random() > 0.5,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          distance: (0.2 + Math.random() * 4).toFixed(1) + ' km'
        })),
        ...services.map(item => ({
          id: item._id,
          title: item.name,
          mainType: 'Service',
          type: item.category || 'Service',
          category: item.category || '',
          link: `/service/${item._id}`,
          price: item.price ? `R${item.price}` : 'Open Bid',
          image: item.imageUrls?.[0] || 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800',
          isLive: Math.random() > 0.4,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          distance: (0.1 + Math.random() * 3).toFixed(1) + ' km'
        })),
        ...helpers.map(item => ({
          id: item._id,
          title: item.name,
          mainType: 'Helper',
          type: item.type || item.category || 'Helper',
          category: item.category || '',
          link: `/helper/${item._id}`,
          price: item.regularPrice ? `R${item.regularPrice}` : 'Open Bid',
          image: item.imageUrls?.[0] || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
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

  const filteredPins = pins.filter(pin => {
    if (selectedType === 'All') return true;
    if (selectedType === 'Helpers') return pin.mainType === 'Helper';
    if (selectedType === 'Properties') return pin.mainType === 'Property';
    if (selectedType === 'Services') return pin.mainType === 'Service';
    
    const searchStr = `${pin.type} ${pin.category} ${pin.title}`.toLowerCase();
    const sel = selectedType.toLowerCase();
    
    if (sel === 'cleaners' || sel === 'cleaner') return searchStr.includes('clean');
    if (sel === 'barbershops' || sel === 'barber') return searchStr.includes('barber');
    if (sel === 'beauty') return searchStr.includes('beaut') || searchStr.includes('nail') || searchStr.includes('hair');
    if (sel === 'guest house' || sel === 'guesthouse') return searchStr.includes('guest') || searchStr.includes('guesthouse');
    if (sel === 'hotels') return searchStr.includes('hotel');
    if (sel === 'rooms') return searchStr.includes('room');
    if (sel === 'for rent' || sel === 'rental') return searchStr.includes('rent');
    
    return searchStr.includes(sel);
  });

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
          <span className="text-xs font-black text-white uppercase tracking-widest hidden sm:inline">Live Radar</span>
        </div>
        <div className="flex items-center">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setActivePin(null);
            }}
            className="bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 rounded-full px-3 py-2 outline-none appearance-none cursor-pointer backdrop-blur-md"
          >
            <option value="All" className="text-gray-900">All Types</option>
            <optgroup label="General" className="text-gray-900 font-bold">
              <option value="Helpers" className="text-gray-900 font-normal">Helpers</option>
              <option value="Properties" className="text-gray-900 font-normal">Properties</option>
              <option value="Services" className="text-gray-900 font-normal">Services</option>
            </optgroup>
            <optgroup label="Helpers" className="text-gray-900 font-bold">
              <option value="Sneaker" className="text-gray-900 font-normal">Sneaker Cleaning</option>
              <option value="Washingmat" className="text-gray-900 font-normal">Washingmat</option>
              <option value="Animals" className="text-gray-900 font-normal">Pet Care</option>
              <option value="Domestic" className="text-gray-900 font-normal">Domestic</option>
              <option value="Tutor" className="text-gray-900 font-normal">Tutors</option>
              <option value="Maid" className="text-gray-900 font-normal">Maids</option>
              <option value="Beauty" className="text-gray-900 font-normal">Beauty</option>
              <option value="Cleaner" className="text-gray-900 font-normal">Cleaners</option>
              <option value="Barber" className="text-gray-900 font-normal">Barbers</option>
              <option value="Hair" className="text-gray-900 font-normal">Hair</option>
              <option value="Nails" className="text-gray-900 font-normal">Nails</option>
              <option value="Massage" className="text-gray-900 font-normal">Massage</option>
              <option value="Chef" className="text-gray-900 font-normal">Chefs</option>
              <option value="Tattoo" className="text-gray-900 font-normal">Tattoo Artists</option>
              <option value="Nanny" className="text-gray-900 font-normal">Nannies</option>
            </optgroup>
            <optgroup label="Services" className="text-gray-900 font-bold">
              <option value="Baker" className="text-gray-900 font-normal">Bakers</option>
              <option value="Carwash" className="text-gray-900 font-normal">Carwash</option>
              <option value="Photograph" className="text-gray-900 font-normal">Photography</option>
              <option value="Transport" className="text-gray-900 font-normal">Transport</option>
              <option value="Landscaping" className="text-gray-900 font-normal">Landscaping</option>
              <option value="Electrician" className="text-gray-900 font-normal">Electricians</option>
              <option value="Handyman" className="text-gray-900 font-normal">Handyman</option>
              <option value="Catering" className="text-gray-900 font-normal">Catering</option>
              <option value="SchoolTransport" className="text-gray-900 font-normal">School Transport</option>
              <option value="Daycare" className="text-gray-900 font-normal">Daycare</option>
              <option value="Daily" className="text-gray-900 font-normal">Daily Services</option>
              <option value="Delivery" className="text-gray-900 font-normal">Delivery</option>
              <option value="Usedbooks" className="text-gray-900 font-normal">Used Books</option>
            </optgroup>
            <optgroup label="Properties" className="text-gray-900 font-bold">
              <option value="Rental" className="text-gray-900 font-normal">Room / Home to Rent</option>
              <option value="Guest house" className="text-gray-900 font-normal">Guest House & B&B (Per Day)</option>
              <option value="Hotels" className="text-gray-900 font-normal">Hotel & Lodge (Per Day)</option>
              <option value="Land" className="text-gray-900 font-normal">Self Catering (Per Day)</option>
              <option value="Resort" className="text-gray-900 font-normal">Resort & Holiday Park (Per Day)</option>
              <option value="Office" className="text-gray-900 font-normal">Room Per Hour</option>
            </optgroup>
          </select>
        </div>
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
        {filteredPins.map(pin => (
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
              {/* Picture of the Person/Service */}
              <div className="w-full h-48 rounded-2xl mb-4 overflow-hidden border border-white/10 shadow-lg relative">
                <img 
                  src={activePin.image} 
                  alt={activePin.title} 
                  className="w-full h-full object-cover"
                />
                {activePin.isLive && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-green-500/90 text-white text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                    Live Now
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{activePin.type}</span>
                  </div>
                  <h3 className="text-white font-bold text-2xl leading-tight">{activePin.title}</h3>
                  <span className="text-[11px] text-emerald-400 font-bold block mt-1 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" /> Approx. {activePin.distance} away
                  </span>
                </div>
                
                {/* Price Display */}
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Price</span>
                  <span className="text-lg font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">{activePin.price}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setActivePin(null)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => navigate(activePin.link)}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors active:scale-98"
                >
                  View Details
                </button>
              </div>
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
