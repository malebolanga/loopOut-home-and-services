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
  FireIcon
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
    { id: 'hotel', label: 'Hotel', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
    { id: 'motel', label: 'Motel', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
    { id: 'guesthouse', label: 'Guest House', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'resort', label: 'Resort', icon: <SparklesIcon className="w-5 h-5" /> }
  ];

  const longTermOptions = [
    { id: 'room', label: 'Rooms', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'apartment', label: 'Apartment', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
    { id: 'penthouse', label: 'Penthouse', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'fullhouse', label: 'Full House', icon: <HomeModernIcon className="w-5 h-5" /> },
    { id: 'bachelor', label: 'Bachelors', icon: <UserIcon className="w-5 h-5" /> }
  ];

  const serviceOptions = [
    { id: 'shuttle', label: 'Transport', icon: <TruckIcon className="w-5 h-5" /> },
    { id: 'domestic', label: 'Helper', icon: <PaintBrushIcon className="w-5 h-5" /> },
    { id: 'salon', label: 'Beauty', icon: <ScissorsIcon className="w-5 h-5" /> },
    { id: 'massage', label: 'Massage', icon: <BoltIcon className="w-5 h-5" /> },
    { id: 'carwash', label: 'Car Wash', icon: <TruckIcon className="w-5 h-5" /> },
    { id: 'chef', label: 'Private Chef', icon: <FireIcon className="w-5 h-5" /> },
    { id: 'photo', label: 'Photographer', icon: <CameraIcon className="w-5 h-5" /> },
    { id: 'sneaker', label: 'Sneaker Cleaner', icon: <SparklesIcon className="w-5 h-5" /> }
  ];

  const lifestyleOptions = [
    { id: 'gym', label: 'Gym', icon: <BoltIcon className="w-5 h-5" /> },
    { id: 'soccer', label: 'Sports', icon: <TrophyIcon className="w-5 h-5" /> },
    { id: 'pub', label: 'Clubs', icon: <MusicalNoteIcon className="w-5 h-5" /> },
    { id: 'restaurant', label: 'Dining', icon: <ShoppingBagIcon className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <CalendarDaysIcon className="w-5 h-5" /> }
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
    total += dbResults.services.length * 250;
    total += dbResults.helpers.length * 300;
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
      await new Promise(resolve => setTimeout(resolve, 600));
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

      const firstStop = {
        location: destination,
        date: start,
        listings: dbResults.accommodation.map(item => item._id || item.id).filter(id => id?.length === 24),
        helpers: dbResults.helpers.map(item => item._id || item.id).filter(id => id?.length === 24),
        events: dbResults.entertainment.map(item => item._id || item.id).filter(id => id?.length === 24)
      };

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
          stops: [firstStop]
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
    <div className="min-h-screen bg-[#F9F9F9] pt-20 pb-10 overflow-x-hidden font-inter text-[#222222]">
      <div className="max-w-4xl mx-auto px-4">
        
        {!showResults && !isSearching && (
           <div className="flex justify-center mb-10 overflow-hidden">
             <div className="flex items-center gap-2">
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i, idx) => (
                 <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-[#FF385C]' : 'w-2.5 bg-gray-200'}`} />
               ))}
             </div>
           </div>
        )}

        {isSearching && (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="relative mb-8">
                <CpuChipIcon className="w-20 h-20 text-[#FF385C] animate-pulse" />
                <div className="absolute inset-0 bg-[#FF385C] blur-[50px] opacity-10" />
             </div>
             <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-black mb-2 tracking-tighter">{searchStatus}</motion.h2>
             <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">LoopOut Intelligence Unit</p>
           </div>
        )}

        {!isSearching && (
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="text-center">
              <h1 className="text-4xl sm:text-5xl font-black mb-8 tracking-tighter">Where to, next?</h1>
              <div className="relative max-w-lg mx-auto ">
                <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-6 w-7 h-7 text-[#FF385C] pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="The next adventure starts here..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && destination && setStep(2)}
                  className="w-full pl-16 pr-6 py-6 bg-white border-0 rounded-3xl shadow-2xl focus:ring-8 focus:ring-[#FF385C]/5 outline-none text-2xl font-bold transition-all relative z-0"
                />
                <button onClick={() => setStep(2)} disabled={!destination} className="mt-10 w-full py-5 bg-[#FF385C] text-white rounded-2xl font-black text-xl shadow-[0_20px_50px_-15px_rgba(255,56,92,0.4)] hover:bg-rose-600 transition-all disabled:opacity-20 uppercase tracking-widest">Architect My Plan</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
              <h2 className="text-4xl font-black mb-10">Traveling with?</h2>
              <div className="flex items-center justify-center gap-12 mt-12 bg-white p-12 rounded-[3.5rem] shadow-xl inline-flex">
                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="text-7xl font-black text-gray-200 hover:text-[#FF385C] transition-colors">-</button>
                <div className="flex flex-col">
                  <span className="text-7xl sm:text-[8rem] font-black leading-none">{guests}</span>
                  <span className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-[0.5em] mt-2">Guests</span>
                </div>
                <button onClick={() => setGuests(guests + 1)} className="text-7xl font-black text-gray-200 hover:text-[#FF385C] transition-colors">+</button>
              </div>
              <div className="mt-14"><button onClick={() => setStep(3)} className="px-16 py-5 bg-[#222222] text-white rounded-2xl font-black text-xl shadow-lg">Next Perspective</button></div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
              <h2 className="text-4xl font-black mb-12 tracking-tight">Investment Cap</h2>
              <div className="max-w-md mx-auto space-y-16">
                <div className="relative">
                  <CurrencyDollarIcon className="absolute top-1/2 -translate-y-1/2 left-8 w-10 h-10 text-[#FF385C]" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-20 pr-8 py-7 bg-white border-0 shadow-2xl rounded-[2.5rem] text-4xl font-black text-center focus:outline-none"
                  />
                </div>
                <input type="range" min="1000" max="150000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#FF385C]" />
                <div className="flex justify-between font-black text-gray-400 text-xs tracking-widest"><span>R 1K</span><span>R 150K+</span></div>
              </div>
              <div className="mt-16 flex items-center justify-center gap-6">
                <button onClick={() => setStep(2)} className="text-gray-400 font-bold text-xs uppercase underline underline-offset-8">Go Back</button>
                <button onClick={() => setStep(4)} className="px-14 py-5 bg-[#FF385C] text-white rounded-2xl font-black text-xl shadow-xl">Define Budget</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <h2 className="text-4xl font-black mb-16 tracking-tighter">Stay Strategy</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div onClick={() => { setRentalDurationType('short'); setStep(5); }} className={`p-10 rounded-[3rem] cursor-pointer border-4 transition-all relative overflow-hidden group ${rentalDurationType === 'short' ? 'bg-white border-[#FF385C] shadow-2xl scale-105' : 'bg-white border-transparent hover:border-gray-100'}`}>
                   <ClockIcon className={`w-14 h-14 mb-6 mx-auto ${rentalDurationType === 'short' ? 'text-[#FF385C]' : 'text-gray-300'}`} />
                   <h3 className="text-3xl font-black italic tracking-tighter">Short Stay</h3>
                   <p className="text-gray-400 font-bold mt-2 text-xs uppercase tracking-widest underline decoration-[#FF385C]/30">Vacation Mode</p>
                </div>
                <div onClick={() => { setRentalDurationType('long'); setStep(5); }} className={`p-10 rounded-[3rem] cursor-pointer border-4 transition-all relative overflow-hidden group ${rentalDurationType === 'long' ? 'bg-white border-[#FF385C] shadow-2xl scale-105' : 'bg-white border-transparent hover:border-gray-100'}`}>
                   <HomeModernIcon className={`w-14 h-14 mb-6 mx-auto ${rentalDurationType === 'long' ? 'text-[#FF385C]' : 'text-gray-300'}`} />
                   <h3 className="text-3xl font-black italic tracking-tighter">Long Rental</h3>
                   <p className="text-gray-400 font-bold mt-2 text-xs uppercase tracking-widest underline decoration-[#FF385C]/30">Home Away</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h2 className="text-4xl font-black mb-12 tracking-tight">Vibe Architecture</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {(rentalDurationType === 'short' ? shortTermOptions : longTermOptions).map((opt, idx) => (
                  <button key={idx} onClick={() => handleToggle(setAccommodationType, opt.id)} className={`p-8 rounded-3xl border-4 transition-all flex flex-col items-center justify-center ${accommodationType.includes(opt.id) ? 'bg-[#FF385C] border-[#FF385C] text-white shadow-xl' : 'bg-white border-transparent text-gray-400 hover:bg-gray-50'}`}>
                    <div className="mb-4">{opt.icon}</div>
                    <span className="font-black text-xs uppercase tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-16 flex items-center justify-center gap-6">
                 <button onClick={() => setStep(4)} className="text-gray-400 font-bold text-xs uppercase italic">Back</button>
                 <button onClick={() => setStep(6)} className="px-14 py-5 bg-[#222222] text-white rounded-2xl font-black text-xl shadow-lg">Lock Style</button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-4xl font-black mb-14 italic underline decoration-[#FF385C] decoration-4 underline-offset-8">Critical Services</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                 {serviceOptions.map((opt, idx) => (
                   <div key={idx} onClick={() => handleToggle(setSelectedServices, opt.id)} className={`p-8 rounded-[2.5rem] cursor-pointer border-4 transition-all ${selectedServices.includes(opt.id) ? 'bg-[#FF385C] border-[#FF385C] text-white shadow-2xl scale-105' : 'bg-white border-transparent text-gray-400 shadow-sm'}`}>
                      <div className="mb-4 flex justify-center">{opt.icon}</div>
                      <span className="font-black text-[11px] uppercase tracking-tighter">{opt.label}</span>
                   </div>
                 ))}
              </div>
              <button onClick={() => setStep(7)} className="mt-16 px-20 py-5 bg-[#FF385C] text-white rounded-2xl font-black text-xl shadow-2xl">Confirm Services</button>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-4xl font-black mb-14 tracking-tighter uppercase italic">Social & Vibe</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                 {lifestyleOptions.map((opt, idx) => (
                   <div key={idx} onClick={() => handleToggle(setSelectedEntertainment, opt.id)} className={`p-8 rounded-[2.5rem] cursor-pointer border-4 transition-all ${selectedEntertainment.includes(opt.id) ? 'bg-[#222222] border-[#222222] text-white shadow-2xl' : 'bg-white border-transparent text-gray-400'}`}>
                      <div className="mb-4 flex justify-center">{opt.icon}</div>
                      <span className="font-black text-[11px] uppercase tracking-widest">{opt.label}</span>
                   </div>
                 ))}
              </div>
              <button onClick={() => setStep(8)} className="mt-16 px-20 py-5 bg-black text-white rounded-2xl font-black text-xl shadow-2xl tracking-[0.2em]">Final Intelligence Stage</button>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div key="step8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <h2 className="text-5xl font-black mb-14 italic tracking-tighter">Stay Duration?</h2>
              <div className="flex items-center justify-center gap-12 bg-white p-12 rounded-[4rem] shadow-2xl inline-flex relative group">
                <button onClick={() => setDuration(Math.max(1, duration - 1))} className="text-8xl font-black text-gray-100 hover:text-[#FF385C] transition-all transform hover:scale-110">-</button>
                <div className="flex flex-col mx-4">
                   <span className="text-7xl sm:text-[10rem] font-black text-[#222222] leading-none tracking-tighter">{duration}</span>
                   <span className="text-[10px] sm:text-xs font-black text-gray-300 uppercase tracking-widest mt-2">{rentalDurationType === 'short' ? 'Days' : 'Months'}</span>
                </div>
                <button onClick={() => setDuration(duration + 1)} className="text-8xl font-black text-gray-100 hover:text-[#FF385C] transition-all transform hover:scale-110">+</button>
              </div>
              <div className="mt-20">
                <button onClick={startSearch} className="px-24 py-7 bg-gradient-to-r from-[#FF385C] to-[#BD1E59] text-white rounded-[2rem] font-black text-2xl shadow-[0_30px_90px_-20px_rgba(255,56,92,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-6 mx-auto uppercase italic tracking-tighter">
                   <CpuChipIcon className="w-10 h-10" /> Compile Masterplan
                </button>
              </div>
            </motion.div>
          )}

          {step === 9 && showResults && (
            <motion.div key="results" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
               {/* Result Header */}
               <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF385C]/5 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none" />
                  <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                       <div className="w-32 h-32 bg-[#FF385C] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#FF385C]/30 transform rotate-3">
                          <SparklesIcon className="w-16 h-16 text-white" />
                       </div>
                       <div>
                          <h1 className="text-5xl sm:text-7xl font-black text-[#222222] tracking-tighter italic lowercase leading-none">{destination} <br/> Masterplan</h1>
                          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                             <button onClick={handleSaveTrip} disabled={isSaving} className="px-8 py-3 bg-white border-2 border-gray-100 rounded-full flex items-center gap-2.5 font-black text-xs uppercase tracking-widest hover:border-[#FF385C] transition-all">
                                {isSaving ? "Saving..." : <BookmarkIcon className="w-5 h-5" />} Save Plan
                             </button>
                             <button onClick={handleShareWhatsApp} className="px-8 py-3 bg-[#25D366] text-white rounded-full flex items-center gap-2.5 font-black text-xs uppercase tracking-widest hover:scale-110 transition-transform">
                                <ChatBubbleBottomCenterIcon className="w-5 h-5" /> Share
                             </button>
                          </div>
                       </div>
                    </div>
                     <div className="lg:text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-2 italic">Est. Investment</span>
                        <div className="text-5xl sm:text-7xl font-black text-[#222222] tracking-tighter shrink-0">R {calculateEstimation().toLocaleString()}</div>
                       <div className={`inline-flex items-center gap-3 mt-6 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest ${calculateEstimation() <= budget ? 'bg-green-50 text-green-600 shadow-md ring-2 ring-green-100' : 'bg-rose-50 text-[#FF385C] ring-2 ring-rose-100'}`}>
                          {calculateEstimation() <= budget ? 'Budget Matched' : 'Exceeds Goal'}
                       </div>
                    </div>
                  </div>
               </div>

               {/* Video Vibe Section */}
               <section className="px-2">
                  <div className="flex items-center gap-4 mb-6 font-black italic"><PlayIcon className="w-6 h-6 text-[#FF385C]" /><h2 className="text-2xl uppercase tracking-tighter">Experience {destination}</h2></div>
                  <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-black group relative">
                     <iframe 
                        className="w-full h-full pointer-events-auto"
                        src={`https://www.youtube.com/embed?listType=search&list=${destination}+travel+guide+tour+4k&autoplay=0&mute=1&controls=1&modestbranding=1&rel=0`}
                        title="Destination Highlight"
                        allowFullScreen
                     />
                     <div className="absolute top-8 right-8 bg-white/90 backdrop-blur px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-[#FF385C] shadow-xl">Live Cinematic Hub</div>
                  </div>
               </section>

               {/* AI Accommodations */}
               <section>
                <h2 className="text-2xl sm:text-3xl font-black text-[#222222] tracking-tighter italic uppercase mb-8 px-6 flex items-center justify-between underline decoration-[#FF385C] decoration-4 underline-offset-[12px]">
                  AI Stays <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase italic">LoopOut Verified</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 sm:px-4">
                  {dbResults.accommodation.length > 0 ? dbResults.accommodation.map((item, idx) => (
                    <div key={item._id || item.id || `acc-${idx}`} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-50 flex flex-col h-[380px] sm:h-[420px]">
                      <div className="h-[240px] sm:h-[280px] overflow-hidden relative">
                         <img src={item.imageUrls?.[0] || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[1px]">
                            <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mb-2">Hosted by {item.host || 'LoopOut Elite'}</p>
                            <h3 className="text-white text-2xl sm:text-3xl font-black mb-2 leading-none tracking-tighter italic">{item.name}</h3>
                            <div className="text-[#FF385C] text-3xl sm:text-4xl font-black tracking-tight">R {item.regularPrice?.toLocaleString() || item.price?.toLocaleString()}</div>
                         </div>
                      </div>
                      <div className="p-6 sm:p-8 flex items-center justify-between bg-white border-t border-gray-50 flex-grow">
                         <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 italic">
                               <HomeIcon className="w-4 h-4 text-[#FF385C]"/> {item.bedrooms || '1'} Bedrooms
                            </span>
                         </div>
                         <button onClick={() => navigate(`/listing/${item._id || item.id}`)} className="px-6 sm:px-10 py-3 sm:py-4 bg-[#222222] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#FF385C] hover:shadow-lg transition-all active:scale-95 shadow-lg">Reserve</button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-24 text-center text-gray-400 text-2xl font-black italic tracking-widest">Searching deep-vault for compatible stays...</div>
                  )}
                </div>
              </section>

               {/* Insider Feed */}
               <section>
                  <div className="flex items-center gap-4 mb-12 px-6 font-black italic"><NewspaperIcon className="w-10 h-10 text-[#FF385C]" /><h2 className="text-4xl uppercase tracking-tighter">Live Insider Feed</h2></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                     {dbResults.news.map((item, idx) => (
                       <div key={item.id || `news-${idx}`} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 flex flex-col h-full hover:bg-gray-950 transition-all group overflow-hidden relative">
                          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-[#FF385C]/5 rounded-full group-hover:w-80 group-hover:h-80 transition-all duration-700" />
                          <span className="px-4 py-1.5 bg-rose-50 text-[#FF385C] rounded-full text-[9px] font-black uppercase self-start mb-6 tracking-widest z-10 group-hover:bg-[#FF385C] group-hover:text-white">{item.tag}</span>
                          <h4 className="text-2xl font-black text-[#222222] leading-tight mb-auto z-10 group-hover:text-white transition-colors">{item.title}</h4>
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-10 z-10 group-hover:text-gray-500">{item.date}</span>
                       </div>
                     ))}
                  </div>
               </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4">
                  <section>
                    <div className="flex items-center gap-4 mb-10 font-black italic"><UserGroupIcon className="w-10 h-10 text-[#FF385C]" /><h2 className="text-4xl uppercase tracking-tighter">Local Crew</h2></div>
                    <div className="grid grid-cols-1 gap-6">
                       {dbResults.helpers.concat(dbResults.services).slice(0, 4).map((item, idx) => (
                         <div key={item._id || item.id || `helper-sr-${idx}`} className="bg-white p-8 rounded-[3rem] shadow-2xl flex items-center gap-8 border border-gray-50 hover:scale-105 transition-all group">
                            <div className="relative w-24 h-24 flex-shrink-0">
                               <img 
                                 src={item.image || (item.type?.toLowerCase().includes('car') ? "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=400" : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400")} 
                                 className="w-full h-full rounded-3xl object-cover shadow-xl ring-4 ring-gray-50 group-hover:ring-[#FF385C]/20 transition-all" 
                               />
                               <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-lg border border-gray-50">
                                  <BoltIcon className="w-4 h-4 text-[#FF385C]" />
                               </div>
                            </div>
                            <div>
                               <h4 className="font-black text-[#222222] leading-none text-xl group-hover:text-[#FF385C] transition-colors">{item.name || 'Pro Personnel'}</h4>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3 italic">{item.type || item.category || 'Expert Service'}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </section>
                  <section className="space-y-12">
                    <div>
                      <div className="flex items-center gap-4 mb-10 font-black italic"><MusicalNoteIcon className="w-10 h-10 text-[#FF385C]" /><h2 className="text-4xl uppercase tracking-tighter">Vibe Hub</h2></div>
                      <div className="grid grid-cols-1 gap-6">
                         {dbResults.entertainment.map((item, idx) => (
                           <div key={item._id || item.id || `event-sr-${idx}`} className="bg-white overflow-hidden rounded-[3rem] shadow-2xl border border-gray-50 flex h-36 group">
                              <img src={item.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400"} className="w-40 h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="p-8 flex flex-col justify-center"><h4 className="font-black text-[#222222] leading-tight text-2xl group-hover:text-[#FF385C] transition-colors">{item.name}</h4><p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-3 italic">{item.type}</p></div>
                           </div>
                         ))}
                      </div>
                    </div>

                    {dbResults.aiPick && (
                      <div className="bg-gradient-to-br from-[#222222] to-black rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="h-64 overflow-hidden relative">
                           <img src={dbResults.aiPick.image} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[3s]" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                           <div className="absolute top-0 right-0 p-8">
                             <SparklesIcon className="w-12 h-12 text-[#FF385C] animate-pulse" />
                           </div>
                        </div>
                        <div className="p-10 -mt-20 relative z-10">
                          <span className="text-[10px] font-black text-[#FF385C] uppercase tracking-[0.4em] mb-4 block italic">AI Social Pick</span>
                          <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2 leading-none">{dbResults.aiPick.name}</h3>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">{dbResults.aiPick.vibe}</p>
                          <p className="text-gray-300 text-sm leading-relaxed mb-10 line-clamp-2">{dbResults.aiPick.description}</p>
                          <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF385C] hover:text-white transition-all shadow-xl">Reserve Social Experience</button>
                        </div>
                      </div>
                    )}

                    {dbResults.safety && (
                      <div className={`p-10 rounded-[3rem] border-4 border-dashed relative overflow-hidden transition-all ${dbResults.safety.level === 'Moderate' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                         <div className="flex items-center gap-6 mb-6">
                            <BoltIcon className={`w-10 h-10 ${dbResults.safety.level === 'Moderate' ? 'text-orange-500' : 'text-green-500'}`} />
                            <div>
                               <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Safety Analytics</h4>
                               <span className={`text-[10px] font-black uppercase tracking-widest mt-2 block ${dbResults.safety.level === 'Moderate' ? 'text-orange-600' : 'text-green-600'}`}>
                                  Risk Level: {dbResults.safety.level}
                               </span>
                            </div>
                         </div>
                         <p className="text-gray-600 text-sm leading-relaxed italic font-bold">"{dbResults.safety.tip}"</p>
                      </div>
                    )}
                  </section>
               </div>

               <div className="flex justify-center pt-16">
                  <button onClick={() => { setStep(1); setShowResults(false); }} className="px-16 py-6 border-4 border-gray-100 rounded-[2.5rem] font-black text-gray-300 hover:border-[#FF385C] hover:text-[#FF385C] transition-all uppercase text-xs tracking-[0.6em] italic shadow-sm">Restart Architect</button>
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
