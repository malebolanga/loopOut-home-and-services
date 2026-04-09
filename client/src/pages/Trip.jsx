// src/pages/Trip.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MapPinIcon, 
  SparklesIcon, 
  UserGroupIcon,
  CalendarDaysIcon,
  TruckIcon,
  ScissorsIcon,
  BoltIcon,
  StarIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  HomeIcon,
  BuildingLibraryIcon,
  PaintBrushIcon,
  TrophyIcon,
  MusicalNoteIcon,
  BookmarkIcon,
  ChatBubbleBottomCenterIcon,
  NewspaperIcon,
  CpuChipIcon,
  PlayIcon,
  CameraIcon,
  HandThumbUpIcon,
  FireIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Trip = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState(1);
  const [budget, setBudget] = useState(5000);
  const [rentalDurationType, setRentalDurationType] = useState('short');
  const [accommodationType, setAccommodationType] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedEntertainment, setSelectedEntertainment] = useState([]);
  const [duration, setDuration] = useState(3);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbResults, setDbResults] = useState({ 
    accommodation: [], 
    helpers: [], 
    entertainment: [], 
    services: [], 
    news: [], 
    aiPick: null,
    safety: null 
  });

  const newsData = {
    'polokwane': [
      { id: 1, title: "Meropa Casino Night Market", date: "Tonight", tag: "Social" },
      { id: 2, title: "Peter Mokaba Stadium Soccer Finals", date: "Sat", tag: "Sports" },
      { id: 3, title: "Water Shortage Notice: Westburg", date: "Alert", tag: "Alert" }
    ],
    'global': [
      { id: 1, title: "New Transport Hub Opens", date: "Today", tag: "Logistics" },
      { id: 2, title: "Weekend Weather Forecast", date: "Upcoming", tag: "Weather" }
    ]
  };

  const shortTermOptions = [
    { id: 'hotel', label: 'Hotel', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
    { id: 'motel', label: 'Motel', icon: <BuildingLibraryIcon className="w-8 h-8" /> },
    { id: 'guesthouse', label: 'Guest House', icon: <HomeIcon className="w-8 h-8" /> },
    { id: 'resort', label: 'Resort', icon: <SparklesIcon className="w-8 h-8" /> }
  ];

  const longTermOptions = [
    { id: 'room', label: 'Rooms', icon: <HomeIcon className="w-8 h-8" /> },
    { id: 'apartment', label: 'Apartment', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
    { id: 'penthouse', label: 'Penthouse', icon: <SparklesIcon className="w-8 h-8" /> },
    { id: 'fullhouse', label: 'Full House', icon: <HomeModernIcon className="w-8 h-8" /> },
    { id: 'bachelor', label: 'Bachelors', icon: <UserIcon className="w-8 h-8" /> }
  ];

  const serviceOptions = [
    { id: 'shuttle', label: 'Transport', icon: <TruckIcon className="w-7 h-7" /> },
    { id: 'domestic', label: 'Helper', icon: <PaintBrushIcon className="w-7 h-7" /> },
    { id: 'salon', label: 'Beauty', icon: <ScissorsIcon className="w-7 h-7" /> },
    { id: 'massage', label: 'Massage', icon: <BoltIcon className="w-7 h-7" /> },
    { id: 'carwash', label: 'Car Wash', icon: <TruckIcon className="w-7 h-7" /> },
    { id: 'chef', label: 'Private Chef', icon: <FireIcon className="w-7 h-7" /> },
    { id: 'photo', label: 'Photographer', icon: <CameraIcon className="w-7 h-7" /> },
    { id: 'sneaker', label: 'Sneaker Cleaner', icon: <SparklesIcon className="w-7 h-7" /> }
  ];

  const lifestyleOptions = [
    { id: 'gym', label: 'Gym', icon: <BoltIcon className="w-7 h-7" /> },
    { id: 'soccer', label: 'Sports', icon: <TrophyIcon className="w-7 h-7" /> },
    { id: 'pub', label: 'Clubs', icon: <MusicalNoteIcon className="w-7 h-7" /> },
    { id: 'restaurant', label: 'Dining', icon: <ShoppingBagIcon className="w-7 h-7" /> },
    { id: 'events', label: 'Events', icon: <CalendarDaysIcon className="w-7 h-7" /> }
  ];

  const handleToggle = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const calculateEstimation = () => {
    let total = 0;
    const accItem = dbResults.accommodation[0];
    if (accItem) {
      total += rentalDurationType === 'short' ? ((accItem.regularPrice || accItem.price) * duration * Math.ceil(guests / 2)) : (accItem.regularPrice || accItem.price);
    } else {
      total += 1200 * duration;
    }
    total += dbResults.services.length * 450;
    total += dbResults.helpers.length * 350;
    return total;
  };

  const startSearch = async () => {
    setIsSearching(true);
    const statuses = [
       "Connecting to Location Intelligence hub...",
       `Streaming ${destination} cinematic data...`,
       "Matching architectural vibes...",
       "Indexing local news feeds...",
       "Finalizing your LoopOut Masterplan..."
    ];

    for (const status of statuses) {
      setSearchStatus(status);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    try {
      const [listingsRes, helpersRes, servicesRes, eventsRes] = await Promise.all([
        fetch(`/api/listing/get?address=${destination}&limit=6`),
        fetch(`/api/helper/get?limit=5`),
        fetch(`/api/service/get?limit=5`),
        fetch(`/api/event/get?limit=5`)
      ]);

      const [listings, helpers, services, events] = await Promise.all([
         listingsRes.ok ? listingsRes.json() : [],
         helpersRes.ok ? helpersRes.json() : [],
         servicesRes.ok ? servicesRes.json() : [],
         eventsRes.ok ? eventsRes.json() : []
      ]);

      const restaurantPicks = {
        'polokwane': { 
          name: "Saskia Restaurant", 
          vibe: "Upscale Fusion", 
          image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
          description: "The crown jewel of Polokwane dining. Perfect for that 'Social Vibe' with a touch of elegance." 
        },
        'global': { 
          name: "Skyline Lounge", 
          vibe: "Urban Chic", 
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
          description: "Top-rated social spot for the best city views and vibes." 
        }
      };

      const safetyData = {
        'polokwane': { level: 'Moderate', color: 'orange', tip: "AI Advisory: Stick to secure precincts like Meropa; exercise caution in Westburg after dusk." },
        'global': { level: 'Low', color: 'green', tip: "AI Advisory: General safety standards apply. Stay within verified zones." }
      };

      setDbResults({
        accommodation: listings.filter(l => rentalDurationType === 'long' ? l.type === 'rent' : l.type !== 'rent').slice(0, 4),
        helpers: helpers.slice(0, 4),
        services: services.slice(0, 4),
        entertainment: events.slice(0, 4),
        news: newsData[destination.toLowerCase()] ? [
          ...newsData[destination.toLowerCase()],
          { id: 99, title: `AI UPDATE: New ${destination} Social Vibe trending at ${restaurantPicks[destination.toLowerCase()]?.name || 'Local Bistro'}`, date: "Just Now", tag: "AI Trend" }
        ] : newsData.global,
        aiPick: restaurantPicks[destination.toLowerCase()] || restaurantPicks.global,
        safety: safetyData[destination.toLowerCase()] || safetyData.global
      });

      setIsSearching(false);
      setShowResults(true);
      setStep(9);
    } catch (error) {
       console.error("Search failed", error);
       setIsSearching(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!currentUser) { navigate('/sign-in'); return; }
    setIsSaving(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + (rentalDurationType === 'short' ? duration : duration * 30));

      const res = await fetch('/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${destination} Masterplan`,
          destination,
          userRef: currentUser._id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          description: `Masterplan for ${guests} guests. Type: ${rentalDurationType}.`,
          stops: [{
            location: destination,
            date: start,
            listings: dbResults.accommodation.map(item => item._id || item.id).filter(id => id?.length === 24),
            helpers: dbResults.helpers.map(item => item._id || item.id).filter(id => id?.length === 24),
            events: dbResults.entertainment.map(item => item._id || item.id).filter(id => id?.length === 24)
          }]
        })
      });
      if (res.ok) alert("Masterplan saved!");
      setIsSaving(false);
    } catch (error) {
      console.error("Save failed", error);
      setIsSaving(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Hey! View my ${destination} plan on LoopOut:\n\n📍 ${destination}\n👥 ${guests} Guests\n💰 Est: R ${calculateEstimation().toLocaleString()}\n\nExplore at ${window.location.origin}/trip`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 overflow-x-hidden font-inter text-[#222222] relative">
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Progress Bar Container */}
        {!showResults && !isSearching && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-center mb-16"
           >
             <div className="glass px-8 py-3 rounded-full flex items-center gap-3 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mr-2">Architect Phase</span>
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                 <div 
                   key={i} 
                   className={`h-2 rounded-full transition-all duration-700 ${step >= i ? 'w-8 bg-[#FF385C]' : 'w-2 bg-gray-200'}`} 
                 />
               ))}
             </div>
           </motion.div>
        )}

        {/* Searching / Intelligence Mode */}
        {isSearching && (
           <div className="flex flex-col items-center justify-center py-32 text-center">
             <div className="relative mb-12">
                <div className="w-32 h-32 bg-rose-500/10 rounded-full flex items-center justify-center animate-pulse">
                   <CpuChipIcon className="w-16 h-16 text-[#FF385C]" />
                </div>
                <div className="absolute inset-0 bg-[#FF385C] blur-[60px] opacity-20 animate-pulse-slow" />
             </div>
             <motion.div
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
                <h2 className="text-4xl font-black mb-4 tracking-tighter text-gradient">{searchStatus}</h2>
                <p className="text-gray-400 font-black uppercase tracking-[0.6em] text-[10px]">Neural Processing Unit active</p>
             </motion.div>
           </div>
        )}

        {!isSearching && (
        <AnimatePresence mode="wait">
          {/* Step 1: Destination */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.05 }} 
              className="glass p-12 sm:p-20 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
              <h1 className="text-5xl sm:text-7xl font-black mb-12 tracking-tighter leading-none">Where to? <br/><span className="text-gradient underline decoration-rose-500/20 underline-offset-8 italic">Masterplan awaits.</span></h1>
              <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-0 bg-rose-500/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-8 w-8 h-8 text-[#FF385C] z-10" />
                  <input
                    type="text"
                    placeholder="Enter city or retreat..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && destination && setStep(2)}
                    className="w-full pl-20 pr-10 py-8 bg-white/80 border-2 border-transparent focus:border-rose-500/50 rounded-[2.5rem] shadow-xl focus:ring-[15px] focus:ring-rose-500/5 outline-none text-2xl font-bold transition-all"
                  />
                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!destination} 
                    className="mt-12 w-full py-6 bg-[#222222] text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 uppercase tracking-[0.2em] flex items-center justify-center gap-4"
                  >
                    Next Logic <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Guests */}
          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 80 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -80 }} 
              className="text-center"
            >
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Exploration Squad</h2>
              <div className="flex flex-col items-center">
                <div className="glass p-16 rounded-[4.5rem] shadow-2xl inline-flex items-center gap-16 relative overflow-hidden">
                   <button 
                     onClick={() => setGuests(Math.max(1, guests - 1))} 
                     className="w-20 h-20 rounded-full flex items-center justify-center text-5xl font-black text-gray-200 hover:bg-rose-50 hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all"
                   >-</button>
                   <div className="flex flex-col items-center relative z-10">
                      <span className="text-[10rem] font-black leading-none text-gradient">{guests}</span>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-[0.8em] mt-4">Expeditionists</span>
                   </div>
                   <button 
                     onClick={() => setGuests(guests + 1)} 
                     className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black text-gray-200 hover:bg-rose-50 hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all"
                   >+</button>
                </div>
                
                <div className="mt-20 flex flex-col sm:flex-row items-center gap-8">
                   <button onClick={() => setStep(1)} className="text-gray-400 font-black uppercase tracking-widest text-xs flex items-center gap-2 px-10 py-5 hover:text-gray-950 transition-colors"><ArrowLeftIcon className="w-4 h-4"/> Back</button>
                   <button onClick={() => setStep(3)} className="px-16 py-6 bg-[#222222] text-white rounded-3xl font-black text-xl shadow-2xl hover:shadow-[#222222]/30 uppercase tracking-widest btn-premium">Continue Intelligence</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-2xl mx-auto">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Strategic Investment</h2>
              <div className="glass p-16 rounded-[4rem] shadow-2xl space-y-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <CurrencyDollarIcon className="absolute top-1/2 -translate-y-1/2 left-10 w-12 h-12 text-[#FF385C]" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-24 pr-10 py-10 bg-white/60 border-2 border-transparent focus:border-rose-500/50 rounded-[3rem] text-6xl font-black text-center focus:outline-none transition-all shadow-inner"
                  />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Target Budget (R)</span>
                </div>
                <div className="px-6">
                  <input 
                    type="range" 
                    min="1000" 
                    max="150000" 
                    step="1000" 
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))} 
                    className="w-full h-4 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#FF385C]" 
                  />
                  <div className="flex justify-between font-black text-gray-400 text-xs tracking-widest mt-6 italic">
                    <span>MIN R 1K</span>
                    <span className="text-[#FF385C]">ELITE MODE R 150K+</span>
                  </div>
                </div>
              </div>
              <div className="mt-20 flex justify-center gap-10">
                <button onClick={() => setStep(2)} className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-black">Modify Squad</button>
                <button onClick={() => setStep(4)} className="px-16 py-6 bg-[#FF385C] text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-rose-600 transition-all uppercase tracking-widest">Apply Strategy</button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Stay Strategy */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Stay Architecture</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl mx-auto px-4">
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => { setRentalDurationType('short'); setStep(5); }} 
                  className={`p-16 rounded-[4rem] cursor-pointer border-4 transition-all relative overflow-hidden group ${rentalDurationType === 'short' ? 'bg-white border-[#FF385C] shadow-3xl' : 'glass border-transparent hover:border-gray-200'}`}
                >
                   <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-10 mx-auto transition-all ${rentalDurationType === 'short' ? 'bg-[#FF385C] text-white' : 'bg-gray-100 text-gray-300'}`}>
                      <ClockIcon className="w-12 h-12" />
                   </div>
                   <h3 className="text-4xl font-black italic tracking-tighter mb-4">Short-Stay</h3>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Cinematic Escapes</p>
                   {rentalDurationType === 'short' && <motion.div layoutId="stayType" className="absolute top-8 right-8 w-4 h-4 bg-[#FF385C] rounded-full" />}
                </motion.div>

                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => { setRentalDurationType('long'); setStep(5); }} 
                  className={`p-16 rounded-[4rem] cursor-pointer border-4 transition-all relative overflow-hidden group ${rentalDurationType === 'long' ? 'bg-white border-[#FF385C] shadow-3xl' : 'glass border-transparent hover:border-gray-200'}`}
                >
                   <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-10 mx-auto transition-all ${rentalDurationType === 'long' ? 'bg-[#FF385C] text-white' : 'bg-gray-100 text-gray-300'}`}>
                      <HomeModernIcon className="w-12 h-12" />
                   </div>
                   <h3 className="text-4xl font-black italic tracking-tighter mb-4">Long-Rental</h3>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Elite Foundations</p>
                   {rentalDurationType === 'long' && <motion.div layoutId="stayType" className="absolute top-8 right-8 w-4 h-4 bg-[#FF385C] rounded-full" />}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Specific Vibe */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Atmospheric Signature</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {(rentalDurationType === 'short' ? shortTermOptions : longTermOptions).map((opt, idx) => (
                  <motion.button 
                    key={idx} 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggle(setAccommodationType, opt.id)} 
                    className={`p-12 rounded-[3.5rem] border-4 transition-all flex flex-col items-center justify-center shadow-xl relative overflow-hidden ${accommodationType.includes(opt.id) ? 'bg-[#222222] border-[#222222] text-white shadow-[#222222]/30' : 'glass border-transparent text-gray-400 hover:border-gray-100'}`}
                  >
                    <div className={`mb-6 transition-transform group-hover:scale-110 ${accommodationType.includes(opt.id) ? 'text-rose-500' : ''}`}>{opt.icon}</div>
                    <span className="font-black text-xs uppercase tracking-[0.4em]">{opt.label}</span>
                    {accommodationType.includes(opt.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-4 w-2 h-2 bg-rose-500 rounded-full" />}
                  </motion.button>
                ))}
              </div>
              <div className="mt-24 flex items-center justify-center gap-10">
                 <button onClick={() => setStep(4)} className="text-gray-400 font-black uppercase tracking-widest text-[10px] italic border-b border-gray-200">Reset Strategy</button>
                 <button onClick={() => setStep(6)} className="px-20 py-7 bg-black text-white rounded-[2rem] font-black text-xl shadow-2xl uppercase tracking-widest">Seal Vibe</button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Critical Support */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <h2 className="text-5xl font-black mb-4 tracking-tighter">Mission Critical Support</h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-16 italic">Deploy personnel to your coordinate</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                 {serviceOptions.map((opt, idx) => (
                   <div 
                    key={idx} 
                    onClick={() => handleToggle(setSelectedServices, opt.id)} 
                    className={`p-10 rounded-[3rem] cursor-pointer border-4 transition-all flex flex-col items-center group relative overflow-hidden ${selectedServices.includes(opt.id) ? 'bg-white border-rose-500 text-[#222222] shadow-2xl scale-105' : 'glass border-transparent text-gray-300'}`}
                   >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all ${selectedServices.includes(opt.id) ? 'bg-rose-500 text-white rotate-6' : 'bg-gray-50'}`}>
                        {opt.icon}
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-widest text-center">{opt.label}</span>
                      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-gray-200 ${selectedServices.includes(opt.id) ? 'bg-rose-500 border-rose-500 shadow-sm' : ''}`} />
                   </div>
                 ))}
              </div>
              <button onClick={() => setStep(7)} className="mt-24 px-24 py-7 bg-[#FF385C] text-white rounded-[2.5rem] font-black text-2xl shadow-[0_20px_60px_-15px_rgba(255,56,92,0.4)] hover:shadow-[0_30px_80px_-20px_rgba(255,56,92,0.6)] uppercase italic tracking-tighter">Deploy Agents</button>
            </motion.div>
          )}

          {/* Step 7: Social Dynamics */}
          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h1 className="text-6xl font-black mb-4 tracking-tight italic">Social Dynamics</h1>
              <p className="text-gray-400 font-bold uppercase tracking-[0.5em] text-[10px] mb-16">Intelligence-driven atmosphere curation</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                 {lifestyleOptions.map((opt, idx) => (
                   <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleToggle(setSelectedEntertainment, opt.id)} 
                    className={`p-12 rounded-[4rem] cursor-pointer border-4 transition-all flex flex-col items-center justify-center ${selectedEntertainment.includes(opt.id) ? 'bg-[#222222] border-[#222222] text-white shadow-3xl' : 'glass border-transparent text-gray-300'}`}
                   >
                      <div className="mb-6 scale-150">{opt.icon}</div>
                      <span className="font-black text-[9px] uppercase tracking-[0.3em] text-center mt-4">{opt.label}</span>
                   </motion.div>
                 ))}
              </div>
              <button onClick={() => setStep(8)} className="mt-24 px-24 py-7 bg-black text-white rounded-[2.5rem] font-black text-2xl shadow-3xl tracking-[0.3em] uppercase italic">Finalize Intelligence</button>
            </motion.div>
          )}

          {/* Step 8: Time Scope */}
          {step === 8 && (
            <motion.div key="step8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <h2 className="text-6xl font-black mb-2 tracking-tighter italic">Temporal Scope</h2>
              <p className="text-gray-400 font-black uppercase tracking-[0.8em] text-[10px] mb-16 italic">Defining stay trajectory</p>
              
              <div className="flex flex-col items-center">
                <div className="glass p-20 rounded-[5rem] shadow-3xl inline-flex items-center gap-20 relative px-28">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-orange-500/5 pointer-events-none" />
                  <button 
                    onClick={() => setDuration(Math.max(1, duration - 1))} 
                    className="text-9xl font-black text-gray-100 hover:text-rose-500 transition-all transform hover:scale-125 hover:-translate-x-4"
                  >-</button>
                  <div className="flex flex-col items-center relative z-10">
                     <span className="text-[12rem] font-black text-gradient leading-none tracking-tighter px-4">{duration}</span>
                     <span className="text-xs font-black text-gray-300 uppercase tracking-[1em] mt-8">{rentalDurationType === 'short' ? 'Days' : 'Months'} Scope</span>
                  </div>
                  <button 
                    onClick={() => setDuration(duration + 1)} 
                    className="text-9xl font-black text-gray-100 hover:text-rose-500 transition-all transform hover:scale-125 hover:translate-x-4"
                  >+</button>
                </div>
                
                <div className="mt-28">
                  <button onClick={startSearch} className="px-32 py-10 bg-gradient-to-br from-[#222222] to-black text-white rounded-[3rem] font-black text-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-8 mx-auto uppercase italic tracking-tighter">
                     <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center animate-spin animation-delay-4000" style={{ animationDuration: '10s' }}><CpuChipIcon className="w-8 h-8"/></div>
                     Synthesize Masterplan
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 9: Results Dashboard */}
          {step === 9 && showResults && (
            <motion.div key="results" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="space-y-20 pb-40">
               {/* Result Header - Cinematic */}
               <div className="glass rounded-[4rem] p-10 sm:p-20 shadow-3xl relative overflow-hidden border border-white/60">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full -mr-60 -mt-60 blur-[120px] pointer-events-none animate-pulse-slow" />
                  <div className="relative flex flex-col xl:flex-row items-center justify-between gap-16 text-center xl:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-14">
                       <div className="w-40 h-40 bg-gradient-to-br from-rose-500 to-orange-500 rounded-[3.5rem] flex items-center justify-center shadow-[0_30px_90px_-15px_rgba(255,56,92,0.6)] transform rotate-6 animate-float">
                          <SparklesIcon className="w-20 h-20 text-white" />
                       </div>
                       <div className="flex-1">
                          <h1 className="text-6xl sm:text-8xl font-black text-[#222222] tracking-tighter italic lowercase leading-none mb-6 underline decoration-rose-500/10 decoration-[15px] underline-offset-[2px]">{destination} <br/> Masterplan</h1>
                           <div className="flex flex-wrap justify-center md:justify-start gap-5">
                              <button onClick={handleSaveTrip} disabled={isSaving} className="px-10 py-5 bg-white rounded-full flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100">
                                 {isSaving ? "Finalizing Vault..." : <><BookmarkIcon className="w-5 h-5 text-rose-500" /> Save Intelligence</>}
                              </button>
                              <button onClick={handleShareWhatsApp} className="px-10 py-5 bg-[#25D366] text-white rounded-full flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all shadow-xl">
                                 <ChatBubbleBottomCenterIcon className="w-5 h-5 fill-white" /> Deploy to WhatsApp
                              </button>
                           </div>
                       </div>
                    </div>
                     <div className="xl:text-right glass-dark px-12 py-12 rounded-[3.5rem] border-white/5 shadow-2xl scale-110">
                        <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-[0.4em] block mb-4 italic">Neural Financial Estimate</span>
                        <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter mb-4">R {calculateEstimation().toLocaleString()}</div>
                        <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl ${calculateEstimation() <= budget ? 'bg-green-500 text-white animate-pulse' : 'bg-rose-500 text-white'}`}>
                           {calculateEstimation() <= budget ? 'Matched Objective' : 'Financial Overflow'}
                        </div>
                    </div>
                  </div>
               </div>

               {/* Video Vibe - Immersive */}
               <section className="px-2">
                  <div className="flex items-center gap-4 mb-10 font-black italic px-6"><div className="w-10 h-1 bg-rose-500 rounded-full" /><h2 className="text-3xl uppercase tracking-tighter">Cinematic Scouting</h2></div>
                  <div className="aspect-video w-full rounded-[4rem] overflow-hidden shadow-3xl border-[8px] border-white glass bg-black group relative transform hover:scale-[1.01] transition-transform duration-700">
                     <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed?listType=search&list=${destination}+travel+4k+luxury+vibe&autoplay=0&mute=1&controls=1`}
                        title="Vibe Stream"
                        allowFullScreen
                     />
                     <div className="absolute top-10 right-10 glass px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest text-[#FF385C] shadow-2xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#FF385C] rounded-full animate-ping" /> Live Coordinate Hub
                     </div>
                  </div>
               </section>

               {/* Accommodations - Premium Cards */}
               <section>
                 <div className="flex items-center justify-between mb-12 px-6">
                    <h2 className="text-4xl font-black text-[#222222] tracking-tighter italic uppercase underline decoration-rose-500/40 decoration-[10px] underline-offset-[5px]">AI Stays</h2>
                    <span className="text-[10px] font-black text-gray-400 tracking-[0.5em] uppercase italic">LoopOut Premium Selection</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {dbResults.accommodation.length > 0 ? dbResults.accommodation.map((item, idx) => (
                     <motion.div 
                       key={item._id || item.id || `acc-${idx}`} 
                       whileHover={{ y: -15 }}
                       className="group bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-white flex flex-col h-[520px] relative pointer-events-auto"
                     >
                        <div className="h-[340px] overflow-hidden relative">
                           <img src={item.imageUrls?.[0] || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="Property" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-12">
                              <p className="text-rose-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic">Luxury Level: Elite</p>
                              <h3 className="text-white text-4xl font-black leading-tight tracking-tighter mb-6">{item.name}</h3>
                              <button onClick={() => navigate(`/listing/${item._id || item.id}`)} className="w-full py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Vault Access</button>
                           </div>
                           <div className="absolute top-8 left-8 glass px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest text-black shadow-xl">Verified Architect Choice</div>
                        </div>
                        <div className="p-10 flex items-center justify-between bg-white flex-grow relative">
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-3">
                                <HomeIcon className="w-5 h-5 text-rose-500" /> {item.bedrooms || 'Premium'} Unit
                              </span>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Managed by {item.host || 'Global Host'}</p>
                           </div>
                           <div className="text-right">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] block mb-1">Nightly Rate</span>
                              <div className="text-4xl font-black text-[#222222] tracking-tighter leading-none">R {item.regularPrice?.toLocaleString() || item.price?.toLocaleString()}</div>
                           </div>
                        </div>
                     </motion.div>
                   )) : (
                     <div className="col-span-full py-32 text-center text-gray-300 text-3xl font-black italic tracking-[0.2em] uppercase">Deep Scanning...</div>
                   )}
                 </div>
               </section>

               {/* Insider Feed - Grid */}
               <section>
                  <div className="flex items-center gap-6 mb-16 px-6 font-black italic"><div className="w-14 h-1 bg-[#222222] rounded-full"/><h2 className="text-4xl uppercase tracking-tighter">Satellite Insider Feed</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                     {dbResults.news.map((item, idx) => (
                       <div key={item.id || `news-${idx}`} className="glass p-12 rounded-[3.5rem] shadow-2xl border border-white hover:bg-[#222222] transition-all group h-[320px] flex flex-col justify-between cursor-pointer">
                          <span className="px-5 py-2 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase self-start tracking-widest group-hover:bg-white group-hover:text-black transition-all shadow-lg shadow-rose-500/20">{item.tag}</span>
                          <h4 className="text-3xl font-black text-[#222222] leading-none tracking-tighter group-hover:text-white transition-colors">{item.title}</h4>
                          <div className="flex items-center gap-3 text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-500">
                             <ClockIcon className="w-4 h-4" /> {item.date}
                          </div>
                       </div>
                     ))}
                  </div>
               </section>

               {/* Support & Vibe Split */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 px-4">
                  <section>
                    <div className="flex items-center gap-4 mb-12 font-black italic"><div className="w-10 h-1 bg-rose-500 rounded-full" /><h2 className="text-4xl uppercase tracking-tighter">Tactical Crew</h2></div>
                    <div className="grid grid-cols-1 gap-8">
                       {dbResults.helpers.concat(dbResults.services).slice(0, 4).map((item, idx) => (
                         <div key={idx} className="glass p-10 rounded-[3.5rem] shadow-2xl flex items-center gap-10 border border-white hover:translate-x-4 transition-all group cursor-pointer">
                            <div className="relative w-32 h-32 flex-shrink-0">
                               <img 
                                 src={item.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400"} 
                                 className="w-full h-full rounded-[2.5rem] object-cover shadow-2xl ring-8 ring-white/50 group-hover:ring-rose-500/20 transition-all" 
                               />
                               <div className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-2xl border border-gray-100 rotate-6 group-hover:rotate-12">
                                  <BoltIcon className="w-6 h-6 text-[#FF385C]" />
                               </div>
                            </div>
                            <div>
                               <h4 className="font-black text-[#222222] text-2xl group-hover:text-rose-600 transition-colors uppercase tracking-tight italic">{item.name || 'Pro Personnel'}</h4>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic underline decoration-rose-500/20 underline-offset-4">{item.type || item.category || 'Specialist'}</p>
                               <button className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 italic opacity-0 group-hover:opacity-100 transition-all">Request Deployment <ChevronRightIcon className="w-3 h-3"/></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </section>

                  <section className="space-y-20">
                    <div>
                      <div className="flex items-center justify-between mb-12">
                         <h2 className="text-4xl font-black italic uppercase tracking-tighter underline decoration-black decoration-[10px] underline-offset-4">Atmospheric Hub</h2>
                         <MusicalNoteIcon className="w-12 h-12 text-[#222222]" />
                      </div>
                      <div className="grid grid-cols-1 gap-8">
                         {dbResults.entertainment.map((item, idx) => (
                           <div key={idx} className="glass overflow-hidden rounded-[3.5rem] shadow-2xl border border-white flex items-center h-44 group hover:bg-black transition-all cursor-pointer">
                              <img src={item.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400"} className="w-48 h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" />
                              <div className="p-10 flex flex-col justify-center flex-1">
                                 <h4 className="font-black text-[#222222] group-hover:text-white transition-all text-3xl tracking-tighter leading-none mb-4 italic">{item.name}</h4>
                                 <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em] italic">{item.type}</span>
                                    <div className="w-8 h-8 rounded-full border border-gray-100 group-hover:border-rose-500 flex items-center justify-center transition-all">
                                       <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-rose-500" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    {/* AI Social Highlight */}
                    {dbResults.aiPick && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#222222] rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group border border-white/5"
                      >
                        <div className="h-80 overflow-hidden relative">
                           <img src={dbResults.aiPick.image} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[5s]" alt="AI Highlight" />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-transparent to-transparent" />
                           <div className="absolute top-12 right-12">
                             <div className="w-20 h-20 bg-white shadow-2xl rounded-[1.8rem] flex items-center justify-center animate-bounce">
                                <SparklesIcon className="w-10 h-10 text-rose-500" />
                             </div>
                           </div>
                        </div>
                        <div className="p-14 -mt-24 relative z-10">
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.6em] mb-6 block italic">Neural Social Protocol</span>
                          <h3 className="text-5xl font-black text-white italic tracking-tighter mb-4 leading-none">{dbResults.aiPick.name}</h3>
                          <div className="flex items-center gap-4 mb-10">
                             <span className="text-gray-400 font-black uppercase tracking-widest text-[11px] px-6 py-2 border border-white/10 rounded-full">{dbResults.aiPick.vibe}</span>
                          </div>
                          <p className="text-gray-400 text-lg leading-relaxed mb-12 italic font-medium px-2 border-l-4 border-rose-500">"{dbResults.aiPick.description}"</p>
                          <button className="w-full py-7 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all shadow-3xl btn-premium">Initiate Social Reservation</button>
                        </div>
                      </motion.div>
                    )}

                    {/* Safety Analytics */}
                    {dbResults.safety && (
                      <div className={`p-14 rounded-[4rem] border-4 border-dashed relative overflow-hidden transition-all shadow-2xl ${dbResults.safety.level === 'Moderate' ? 'bg-orange-50/50 border-orange-200' : 'bg-green-50/50 border-green-200'}`}>
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/50 rounded-full blur-[40px]" />
                         <div className="flex items-center gap-8 mb-8 relative z-10">
                            <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center shadow-lg ${dbResults.safety.level === 'Moderate' ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-green-500 text-white shadow-green-500/30'}`}>
                               <BoltIcon className="w-10 h-10" />
                            </div>
                            <div>
                               <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">Neural Safety Analytics</h4>
                               <span className={`text-[11px] font-black uppercase tracking-widest block underline decoration-[3px] underline-offset-4 ${dbResults.safety.level === 'Moderate' ? 'text-orange-600 decoration-orange-300' : 'text-green-600 decoration-green-300'}`}>
                                  Threat Level: {dbResults.safety.level}
                               </span>
                            </div>
                         </div>
                         <p className="text-[#222222]/70 text-lg leading-relaxed italic font-bold relative z-10 bg-white/40 p-6 rounded-3xl border border-white/60">"{dbResults.safety.tip}"</p>
                      </div>
                    )}
                  </section>
               </div>

               {/* Footer Action */}
               <div className="flex justify-center pt-24">
                  <button 
                    onClick={() => { setStep(1); setShowResults(false); }} 
                    className="group px-20 py-8 glass rounded-[3rem] font-black text-gray-400 hover:text-rose-500 hover:border-rose-500 transition-all uppercase text-[11px] tracking-[0.8em] italic shadow-2xl flex items-center gap-8"
                  >
                    <div className="w-2 h-2 bg-gray-200 group-hover:bg-rose-500 rounded-full animate-ping" />
                    Reset Neural Architect
                    <div className="w-2 h-2 bg-gray-200 group-hover:bg-rose-500 rounded-full animate-ping" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Trip;
