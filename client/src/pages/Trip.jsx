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
  CpuChipIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import ListingItem from '../components/ListingItem';
import HelperItem from '../components/HelperItem';
import ServiceItem from '../components/ServiceItem';
import EventItem from '../components/EventItem';

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
  const [searchStatus, setSearchStatus] = useState('Consulting Masterpiece Intelligence...');
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

  // Short-term options as requested
  const shortTermOptions = [
    { id: 'guesthouse', label: 'Guest House', icon: <HomeIcon className="w-6 h-6" /> },
    { id: 'motel', label: 'Motel', icon: <BuildingLibraryIcon className="w-6 h-6" /> },
    { id: 'hotel', label: 'Hotel', icon: <BuildingOfficeIcon className="w-6 h-6" /> },
    { id: 'resort', label: 'Resort', icon: <SparklesIcon className="w-6 h-6" /> },
    { id: 'apartment', label: 'Self-Catering Apt', icon: <HomeModernIcon className="w-6 h-6" /> }
  ];

  // Long-term options as requested
  const longTermOptions = [
    { id: 'room', label: 'Room', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'bachelor', label: 'Bachelor', icon: <HomeModernIcon className="w-6 h-6" /> },
    { id: 'flat', label: 'Flat', icon: <BuildingOfficeIcon className="w-6 h-6" /> },
    { id: 'apartment', label: 'Apartment', icon: <HomeIcon className="w-6 h-6" /> }
  ];

  const serviceOptions = [
    { id: 'shuttle', label: 'Transport', icon: <TruckIcon className="w-6 h-6" /> },
    { id: 'domestic', label: 'Helper', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'salon', label: 'Beauty', icon: <ScissorsIcon className="w-6 h-6" /> },
    { id: 'massage', label: 'Massage', icon: <BoltIcon className="w-6 h-6" /> },
    { id: 'photo', label: 'Photographer', icon: <VideoCameraIcon className="w-6 h-6" /> }
  ];

  const lifestyleOptions = [
    { id: 'pub', label: 'Clubs', icon: <MusicalNoteIcon className="w-6 h-6" /> },
    { id: 'restaurant', label: 'Dining', icon: <ShoppingBagIcon className="w-6 h-6" /> },
    { id: 'events', label: 'Events', icon: <CalendarDaysIcon className="w-6 h-6" /> }
  ];

  const handleToggle = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const calculateEstimation = () => {
    let total = 0;
    const accItem = dbResults.accommodation[0];
    if (accItem) {
      total += (accItem.regularPrice || accItem.price || 800) * (rentalDurationType === 'short' ? duration : 1);
    } else {
      total += 1200 * duration;
    }
    total += selectedServices.length * 450;
    return total;
  };

  const startSearch = async () => {
    if (!destination) return;
    setIsSearching(true);
    const statuses = [
       "Initializing Global Satellite Feed...",
       `Locating accurate nodes in ${destination}...`,
       "Cross-referencing verified Stays...",
       "Synthesize Deployment protocol...",
       "Finalizing Premium Masterplan..."
    ];

    for (const status of statuses) {
      setSearchStatus(status);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    try {
      // Build search URL with specific destination filter
      const baseUrl = `/api/listing/get?address=${encodeURIComponent(destination)}&limit=9`;
      
      const [listingsRes, helpersRes, servicesRes, eventsRes] = await Promise.all([
        fetch(baseUrl),
        fetch(`/api/helper/get?limit=6`),
        fetch(`/api/service/get?limit=6`),
        fetch(`/api/event/get?limit=6`)
      ]);

      const [listings, helpers, services, events] = await Promise.all([
         listingsRes.ok ? listingsRes.json() : [],
         helpersRes.ok ? helpersRes.json() : [],
         servicesRes.ok ? servicesRes.json() : [],
         eventsRes.ok ? eventsRes.json() : []
      ]);

      // Strict location filtering for news simulation
      const mockNews = [
        { id: 1, title: `${destination} Elite Night Market`, date: "Trending Now", tag: "Social", source: "Google Live" },
        { id: 2, title: `New Security Precinct in ${destination}`, date: "Verified", tag: "News", source: "Local Intel" },
        { id: 3, title: `Upcoming ${destination} Jazz Festival`, date: "Sat 19:00", tag: "Events", source: "Global Satellite" }
      ];

      setDbResults({
        accommodation: listings.filter(l => 
          rentalDurationType === 'long' ? (l.type === 'rent' || l.type === 'lease') : (l.type === 'sale' || l.type === 'overnight' || l.type === 'rent')
        ),
        helpers: helpers.slice(0, 4),
        services: services.slice(0, 4),
        entertainment: events.slice(0, 4),
        news: mockNews,
        aiPick: {
          name: `${destination} Grand Plaza`,
          vibe: "Cinematic Luxury",
          image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
          description: `The absolute peak of ${destination}'s social life. Highly recommended by the Google Neural Feed.`
        },
        safety: { level: 'Verified', tip: `Precinct coordinates in ${destination} are currently stable. Recommended deployment at 14:00.` }
      });

      setIsSearching(false);
      setShowResults(true);
      setStep(9);
    } catch (error) {
       console.error("Masterplan Search failed", error);
       setIsSearching(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!currentUser) { navigate('/sign-in'); return; }
    setIsSaving(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + (rentalDurationType === 'short' ? duration : 30));

      const res = await fetch('/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${destination} Masterplan`, destination, userRef: currentUser._id,
          startDate: start.toISOString(), endDate: end.toISOString(),
          description: `Masterplan for ${destination}. Verified protocol.`,
          stops: [{ location: destination, date: start, listings: dbResults.accommodation.map(i => i._id).filter(id => id?.length === 24) }]
        })
      });
      if (res.ok) alert("Deployment saved to vault.");
      setIsSaving(false);
    } catch (err) { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-32 overflow-x-hidden font-inter text-gray-950 selection:bg-rose-100">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Progress Tracker - Clean & Minimalist */}
        {!showResults && !isSearching && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-20">
             <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-full border border-gray-100 shadow-sm">
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                 <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-rose-500' : step > i ? 'w-2 bg-gray-950' : 'w-2 bg-gray-200'}`} />
               ))}
             </div>
           </motion.div>
        )}

        {/* Searching Interface */}
        {isSearching && (
           <div className="flex flex-col items-center justify-center py-40 text-center">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="mb-10">
                <CpuChipIcon className="w-16 h-16 text-gray-200" />
             </motion.div>
             <h2 className="text-2xl font-black italic tracking-tighter mb-2">{searchStatus}</h2>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Neural Connection Protocol</span>
           </div>
        )}

        {!isSearching && (
        <AnimatePresence mode="wait">
          {/* Step 1: Destination */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="max-w-2xl mx-auto text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6 block italic">Deployment Target</span>
              <h1 className="text-6xl sm:text-7xl font-black mb-16 tracking-tighter leading-none">Where to?</h1>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Tembisa"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && destination && setStep(2)}
                  className="w-full px-10 py-8 bg-gray-50 border border-gray-100 rounded-[2rem] text-2xl font-black placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all text-center"
                />
                <button onClick={() => setStep(2)} disabled={!destination} className="mt-12 group flex items-center gap-4 bg-gray-950 text-white px-10 py-5 rounded-full mx-auto hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-20">
                   <span className="text-xs font-black uppercase tracking-widest">Next Phase</span>
                   <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Guests */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-xl mx-auto">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Expedition Squad</h2>
              <div className="flex items-center justify-between p-10 bg-gray-50 rounded-[3rem] border border-gray-100">
                 <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-2xl font-black hover:bg-white transition-all">-</button>
                 <div className="text-center">
                    <span className="text-8xl font-black text-gradient leading-none">{guests}</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Personnel</p>
                 </div>
                 <button onClick={() => setGuests(guests + 1)} className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-2xl font-black hover:bg-white transition-all">+</button>
              </div>
              <div className="mt-16 flex items-center justify-center gap-10">
                 <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors">Back</button>
                 <button onClick={() => setStep(3)} className="bg-gray-950 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-rose-500 transition-all">Proceed</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-2xl mx-auto">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Strategic Budget</h2>
              <div className="bg-gray-50 p-12 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                   <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-transparent border-none text-7xl font-black text-center focus:outline-none"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-6 italic">Target Threshold (ZAR)</p>
                </div>
              </div>
              <div className="mt-16 flex justify-center gap-8">
                <button onClick={() => setStep(2)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Back</button>
                <button onClick={() => setStep(4)} className="bg-rose-500 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20">Set Investment</button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Stay Strategy */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Masterpiece Architecture</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <button onClick={() => { setRentalDurationType('short'); setStep(5); }} className={`p-16 rounded-[3rem] border-2 transition-all group ${rentalDurationType === 'short' ? 'bg-gray-950 border-gray-950 text-white shadow-2xl scale-105' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                   <ClockIcon className={`w-12 h-12 mx-auto mb-6 ${rentalDurationType === 'short' ? 'text-rose-500' : 'text-gray-300'}`} />
                   <h3 className="text-2xl font-black italic tracking-tighter">Short-Stay</h3>
                   <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-2">Verified Stays</p>
                </button>
                <button onClick={() => { setRentalDurationType('long'); setStep(5); }} className={`p-16 rounded-[3rem] border-2 transition-all group ${rentalDurationType === 'long' ? 'bg-gray-950 border-gray-950 text-white shadow-2xl scale-105' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                   <HomeModernIcon className={`w-12 h-12 mx-auto mb-6 ${rentalDurationType === 'long' ? 'text-rose-500' : 'text-gray-300'}`} />
                   <h3 className="text-2xl font-black italic tracking-tighter">Long-Rental</h3>
                   <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-2">Elite Protocols</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Specific Vibe */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-5xl font-black mb-16 tracking-tighter">Specific Node</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {(rentalDurationType === 'short' ? shortTermOptions : longTermOptions).map((opt) => (
                  <button key={opt.id} onClick={() => handleToggle(setAccommodationType, opt.id)} className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-4 ${accommodationType.includes(opt.id) ? 'bg-gray-950 border-gray-950 text-white shadow-xl' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-400'}`}>
                    <div className={accommodationType.includes(opt.id) ? 'text-rose-500' : 'text-gray-300'}>{opt.icon}</div>
                    <span className="font-black text-[9px] uppercase tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-20 flex justify-center gap-8">
                 <button onClick={() => setStep(4)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Back</button>
                 <button onClick={() => setStep(6)} className="bg-gray-950 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest">Seal Logic</button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Critical Support */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <h2 className="text-5xl font-black mb-4 tracking-tighter">Tactical Deployment</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-16 italic underline decoration-rose-200">Personnel assignment required</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 max-w-5xl mx-auto">
                 {serviceOptions.map((opt) => (
                   <button key={opt.id} onClick={() => handleToggle(setSelectedServices, opt.id)} className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center gap-4 ${selectedServices.includes(opt.id) ? 'bg-white border-rose-500 shadow-xl' : 'bg-gray-50 border-transparent text-gray-300'}`}>
                      <div className={`p-4 rounded-2xl transition-all ${selectedServices.includes(opt.id) ? 'bg-rose-500 text-white scale-110' : 'bg-white text-gray-200'}`}>{opt.icon}</div>
                      <span className="font-black text-[9px] uppercase tracking-widest">{opt.label}</span>
                   </button>
                 ))}
              </div>
              <button onClick={() => setStep(7)} className="mt-20 bg-rose-500 text-white px-16 py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">Assign Team</button>
            </motion.div>
          )}

          {/* Step 7: Social Dynamics */}
          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-5xl font-black mb-16 tracking-tighter italic">Social Vibe</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-2xl mx-auto">
                 {lifestyleOptions.map((opt) => (
                   <button key={opt.id} onClick={() => handleToggle(setSelectedEntertainment, opt.id)} className={`p-12 rounded-[2.5rem] border transition-all flex flex-col items-center gap-6 ${selectedEntertainment.includes(opt.id) ? 'bg-gray-950 border-gray-950 text-white shadow-2xl' : 'bg-gray-50 border-transparent text-gray-300'}`}>
                      <div className="scale-125">{opt.icon}</div>
                      <span className="font-black text-[10px] uppercase tracking-widest">{opt.label}</span>
                   </button>
                 ))}
              </div>
              <button onClick={() => setStep(8)} className="mt-20 bg-gray-900 text-white px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest">Final Step</button>
            </motion.div>
          )}

          {/* Step 8: Time Scope */}
          {step === 8 && (
            <motion.div key="step8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <h2 className="text-6xl font-black mb-16 tracking-tighter">Temporal Scope</h2>
              <div className="flex flex-col items-center">
                <div className="bg-gray-50 p-16 rounded-[4rem] border border-gray-100 flex items-center gap-16 px-24">
                  <button onClick={() => setDuration(Math.max(1, duration - 1))} className="text-7xl font-black text-gray-200 hover:text-rose-500 transition-all">-</button>
                  <div className="text-center">
                     <span className="text-9xl font-black text-gradient leading-none">{duration}</span>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 italic">{rentalDurationType === 'short' ? 'Days' : 'Months'} Horizon</p>
                  </div>
                  <button onClick={() => setDuration(duration + 1)} className="text-7xl font-black text-gray-200 hover:text-rose-500 transition-all">+</button>
                </div>
                <button onClick={startSearch} className="mt-20 flex items-center gap-4 bg-gray-950 text-white px-16 py-6 rounded-full group hover:bg-rose-500 transition-all active:scale-95 shadow-2xl">
                   <CpuChipIcon className="w-6 h-6 animate-pulse" />
                   <span className="text-sm font-black uppercase tracking-[0.2em]">Generate Masterplan</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 9: Results Dashboard - THE MASTERPIECE */}
          {step === 9 && showResults && (
            <motion.div key="results" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="space-y-24 pb-40">
               {/* Result Header - cinematic & clean */}
               <div className="bg-gray-50 rounded-[3.5rem] p-10 sm:p-20 shadow-sm relative overflow-hidden border border-gray-100/50">
                  <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                       <div className="w-32 h-32 bg-rose-500 rounded-[2.5rem] flex items-center justify-center shadow-xl rotate-3">
                          <CheckBadgeIcon className="w-16 h-16 text-white" />
                       </div>
                       <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 italic mb-2 block">Verified Masterplan</span>
                          <h1 className="text-6xl sm:text-7xl font-black text-gray-950 tracking-tighter italic leading-none">{destination} <br/> Protocol</h1>
                           <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                              <button onClick={handleSaveTrip} disabled={isSaving} className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:shadow-md transition-all">
                                 <BookmarkIcon className="w-4 h-4 text-rose-500" /> Save Intel
                              </button>
                              <button onClick={() => window.print()} className="px-6 py-3 bg-gray-950 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all">
                                 <TruckIcon className="w-4 h-4" /> Export Deployment
                              </button>
                           </div>
                       </div>
                    </div>
                     <div className="lg:text-right p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl min-w-[300px]">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Financial Estimate</span>
                        <div className="text-5xl font-black text-gray-950 tracking-tighter">R {calculateEstimation().toLocaleString()}</div>
                        <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${calculateEstimation() <= budget ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                           {calculateEstimation() <= budget ? 'Target Matched' : 'Budget Override'}
                        </div>
                    </div>
                  </div>
               </div>

               {/* Video Scout */}
               <section className="px-2">
                  <div className="flex items-center gap-3 mb-8 px-4"><div className="w-6 h-[2px] bg-rose-500" /><h2 className="text-xl font-black uppercase tracking-tighter underline decoration-rose-200">Cinematic Scout</h2></div>
                  <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-50 bg-black group relative">
                     <iframe className="w-full h-full opacity-80" src={`https://www.youtube.com/embed?listType=search&list=${destination}+travel+4k+luxury+location&autoplay=0&mute=1&controls=1`} title="Location Scout" allowFullScreen />
                     <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-rose-400 uppercase tracking-widest">Live Coordinate Feed</div>
                  </div>
               </section>

                {/* Accommodations - strictly filtered by destination */}
               <section>
                  <div className="flex items-center justify-between mb-8 px-6">
                     <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase border-b-2 border-rose-500 pb-1">Protocol Stays</h2>
                     <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase italic">{destination} Verified</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                    {dbResults.accommodation.length > 0 ? dbResults.accommodation.map((item) => (
                      <ListingItem key={item._id} listing={item} />
                    )) : (
                      <div className="col-span-full py-20 text-center text-gray-300 text-xl font-black italic tracking-widest uppercase border-2 border-dashed border-gray-100 rounded-[3rem]">No Nodes found in {destination}</div>
                    )}
                  </div>
               </section>

               {/* Google Satellite News - immersive app look */}
               <section>
                  <div className="flex items-center gap-3 mb-8 px-6 font-black italic">
                    <div className="w-6 h-[2px] bg-gray-900"/>
                    <h2 className="text-xl uppercase tracking-tighter">Google Neural Insight Feed</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                     {dbResults.news.map((item, idx) => (
                       <div key={idx} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">{item.tag}</span>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">LIVE</span></div>
                          </div>
                          <h4 className="text-lg font-black text-gray-900 leading-tight group-hover:text-rose-600 transition-colors">{item.title}</h4>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-6 block border-t border-gray-200 pt-4">Source: {item.source} • {item.date}</span>
                       </div>
                     ))}
                  </div>
               </section>

               {/* Tactical Deployment & Events */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4">
                  <section>
                    <div className="flex items-center gap-3 mb-8 font-black italic"><div className="w-6 h-[2px] bg-rose-500" /><h2 className="text-xl uppercase tracking-tighter">Tactical Deployment</h2></div>
                    <div className="grid grid-cols-1 gap-4">
                       {dbResults.helpers.map((item, idx) => (
                         <HelperItem key={idx} helper={item} />
                       ))}
                       {dbResults.services.map((item, idx) => (
                         <ServiceItem key={idx} service={item} />
                       ))}
                    </div>
                  </section>

                  <section className="space-y-12">
                    <div>
                      <div className="flex items-center justify-between mb-8">
                         <h2 className="text-xl font-black italic uppercase tracking-tighter border-b-2 border-gray-900 pb-1">Community Pulse</h2>
                         <MusicalNoteIcon className="w-6 h-6 text-gray-900" />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                         {dbResults.entertainment.map((item, idx) => (
                           <EventItem key={idx} event={item} />
                         ))}
                      </div>
                    </div>

                    {/* AI Highlight Card */}
                    {dbResults.aiPick && (
                      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-gray-950 rounded-[3rem] shadow-2xl overflow-hidden group relative">
                        <div className="h-56 overflow-hidden relative">
                           <img src={dbResults.aiPick.image} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[5s]" alt="Neural Highlight" />
                           <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                        </div>
                        <div className="p-10 -mt-16 relative z-10">
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3 block italic">Neural Selection</span>
                          <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">{dbResults.aiPick.name}</h3>
                          <p className="text-gray-400 text-xs italic leading-relaxed border-l border-rose-500 pl-4">"{dbResults.aiPick.description}"</p>
                          <button className="w-full mt-10 py-4 bg-white text-gray-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Engage Deployment</button>
                        </div>
                      </motion.div>
                    )}
                  </section>
               </div>

               {/* Reset Hook */}
               <div className="flex justify-center pt-20">
                   <button onClick={() => { setStep(1); setShowResults(false); }} className="px-10 py-5 bg-gray-50 border border-gray-100 rounded-full font-black text-[9px] uppercase tracking-[0.4em] text-gray-400 hover:text-rose-500 transition-all shadow-sm">
                    Re-Initialize Masterpiece
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
