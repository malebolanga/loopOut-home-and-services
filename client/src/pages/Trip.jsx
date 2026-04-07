import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  SparklesIcon, 
  UserGroupIcon,
  CalendarDaysIcon,
  TruckIcon,
  ScissorsIcon,
  BoltIcon,
  HeartIcon as HeartOutline,
  StarIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Trip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [accommodationType, setAccommodationType] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [duration, setDuration] = useState(3);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock Recommendation Data for Polokwane and others
  const recommendations = {
    'polokwane': {
      accommodation: [
        { id: 1, name: "Meropa Casino & Hotel", type: "Hotel", price: 1200, rating: 4.7, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400" },
        { id: 2, name: "Cycad Guest House", type: "Guest House", price: 850, rating: 4.8, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400" },
        { id: 3, name: "Polokwane Nature Apartment", type: "Apartment", price: 600, rating: 4.5, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400" }
      ],
      helpers: [
        { id: 1, name: "Thembani M.", type: "Helper", price: 300, rating: 4.9, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
        { id: 2, name: "Sarah J.", type: "Errand Runner", price: 200, rating: 4.6, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
        { id: 3, name: "Gentleman's Choice", type: "Barber", price: 150, rating: 4.8, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400" },
        { id: 4, name: "Polokwane Zen Spa", type: "Massage", price: 450, rating: 4.9, image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400" },
        { id: 5, name: "Swift Shuttle Services", type: "Transport Shuttle", price: 200, rating: 4.7, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400" }
      ],
      events: [
        { id: 1, name: "Limpompo Summer Fest", type: "Festival", date: "Dec 15", status: "Trending", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400" },
        { id: 2, name: "Polokwane City vs Kaizer Chiefs", type: "Soccer Tournament", date: "Nov 20", status: "Selling Fast", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400" }
      ]
    },
    'default': {
      accommodation: [
        { id: 1, name: "City Center Hotel", type: "Hotel", price: 1500, rating: 4.5, image: "https://images.unsplash.com/photo-1551882547-ff43c61f3c2d?auto=format&fit=crop&q=80&w=400" }
      ],
      helpers: [
        { id: 1, name: "Professional Helper", type: "Helper", price: 350, rating: 4.7, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }
      ],
      events: [
        { id: 1, name: "The Night Owl", type: "Club", date: "Tonight", status: "Open", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=400" }
      ]
    }
  };

  const accommodationOptions = [
    { id: 'hotel', label: 'Hotels', icon: <BuildingOfficeIcon className="w-6 h-6" /> },
    { id: 'guesthouse', label: 'Guest Houses', icon: <HomeModernIcon className="w-6 h-6" /> },
    { id: 'rental', label: 'Rental Homes', icon: <MapPinIcon className="w-6 h-6" /> },
    { id: 'apartment', label: 'Apartments', icon: <SparklesIcon className="w-6 h-6" /> }
  ];

  const helperOptions = [
    { id: 'helper', label: 'Helper', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'errands', label: 'Errands', icon: <ShoppingBagIcon className="w-6 h-6" /> },
    { id: 'beauty', label: 'Beauty Salon', icon: <BoltIcon className="w-6 h-6" /> },
    { id: 'massage', label: 'Massage', icon: <SparklesIcon className="w-6 h-6" /> },
    { id: 'barber', label: 'Barbers', icon: <ScissorsIcon className="w-6 h-6" /> },
    { id: 'shuttle', label: 'Transport Shuttle', icon: <TruckIcon className="w-6 h-6" /> }
  ];

  const eventOptions = [
    { id: 'club', label: 'Clubs', icon: '🍸' },
    { id: 'festival', label: 'Festivals', icon: '🎉' },
    { id: 'tournament', label: 'Soccer Tournaments', icon: '⚽' }
  ];

  const handleToggle = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const calculateEstimation = () => {
    const accBase = recommendations[destination.toLowerCase()]?.accommodation[0]?.price || 800;
    const helperBase = recommendations[destination.toLowerCase()]?.helpers[0]?.price || 300;
    
    let total = (accBase * duration);
    if (selectedHelpers.length > 0) total += (helperBase * selectedHelpers.length * duration);
    
    return total;
  };

  const startSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      setStep(6);
    }, 2000);
  };

  const currentResults = recommendations[destination.toLowerCase()] || recommendations.default;

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Progress indicator */}
        {!showResults && (
           <div className="flex justify-center mb-12">
             <div className="flex items-center gap-2">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div 
                   key={i}
                   className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-12 bg-[#FF385C]' : 'w-2 bg-gray-200'}`}
                 />
               ))}
             </div>
           </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-6">Where do you want to visit?</h1>
              <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <MapPinIcon className="w-6 h-6 text-[#FF385C]" />
                </div>
                <input
                  type="text"
                  placeholder="Try 'Polokwane'"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && destination && setStep(2)}
                  className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-2xl shadow-xl focus:ring-2 focus:ring-[#FF385C] outline-none text-xl transition-all"
                />
                <button onClick={() => setStep(2)} disabled={!destination} className="mt-8 px-12 py-4 bg-[#FF385C] text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-[#222222] mb-4 text-center">Are you going to need hotels, guest houses, rental homes or apartments in {destination}?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {accommodationOptions.map((opt) => (
                  <button key={opt.id} onClick={() => handleToggle(setAccommodationType, opt.id)} className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all ${accommodationType.includes(opt.id) ? 'border-[#FF385C] bg-rose-50 text-[#FF385C] scale-105' : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'}`}>
                    <div className="mb-4">{opt.icon}</div>
                    <span className="font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(1)} className="px-8 py-4 font-bold text-gray-500">Back</button>
                <button onClick={() => setStep(3)} className="px-12 py-4 bg-[#FF385C] text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-[#222222] mb-4 text-center">Are you going to need a helper, someone to run errands, beauty saloon, massage, barbers or transport shuttle?</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12 text-center">
                {helperOptions.map((opt) => (
                  <button key={opt.id} onClick={() => handleToggle(setSelectedHelpers, opt.id)} className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${selectedHelpers.includes(opt.id) ? 'border-[#FF385C] bg-rose-50 text-[#FF385C] scale-105' : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'}`}>
                    <div className="mb-3">{opt.icon}</div>
                    <span className="font-semibold text-sm leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(2)} className="px-8 py-4 font-bold text-gray-500">Back</button>
                <button onClick={() => setStep(4)} className="px-12 py-4 bg-[#FF385C] text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-[#222222] mb-4 text-center">Any specific events or activities you're interested in?</h2>
              <div className="grid grid-cols-3 gap-6 mb-12 text-center">
                {eventOptions.map((opt) => (
                  <button key={opt.id} onClick={() => handleToggle(setSelectedEvents, opt.id)} className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all ${selectedEvents.includes(opt.id) ? 'border-[#FF385C] bg-rose-50 text-[#FF385C] scale-105' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'}`}>
                    <div className="text-3xl mb-4">{opt.icon}</div>
                    <span className="font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(3)} className="px-8 py-4 font-bold text-gray-500">Back</button>
                <button onClick={() => setStep(5)} className="px-12 py-4 bg-[#FF385C] text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-4xl font-bold text-[#222222] mb-4">How many days are you staying?</h2>
              <div className="flex items-center justify-center gap-8 mb-12">
                <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center text-3xl font-bold hover:border-[#FF385C] transition-colors">-</button>
                <span className="text-6xl font-black text-[#222222] min-w-[100px]">{duration}</span>
                <button onClick={() => setDuration(duration + 1)} className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center text-3xl font-bold hover:border-[#FF385C] transition-colors">+</button>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(4)} className="px-8 py-4 font-bold text-gray-500">Back</button>
                <button onClick={startSearch} className="px-12 py-4 bg-[#FF385C] text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Calculate & Generate"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && showResults && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[#222222]">Your {destination} Master Plan</h1>
                  <p className="text-gray-600 mt-1">Based on your {duration}-day stay and personal preferences.</p>
                </div>
                <div className="text-center md:text-right">
                  <span className="text-sm font-bold text-rose-500 uppercase tracking-widest block mb-1">Estimated Budget</span>
                  <div className="text-4xl font-black text-[#222222]">R {calculateEstimation().toLocaleString()}</div>
                </div>
              </div>

              {/* Accommodation Section */}
              <section>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><BuildingOfficeIcon className="w-7 h-7 text-[#FF385C]" /> Recommended Stays</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentResults.accommodation.map((item) => (
                    <motion.div key={item.id} whileHover={{ y: -5 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer">
                      <div className="aspect-[4/3] overflow-hidden"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-duration-500" /></div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1"><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.type}</span><div className="flex items-center gap-1 text-sm font-semibold"><StarIcon className="w-4 h-4 text-[#FF385C]" /> {item.rating}</div></div>
                        <h3 className="font-bold text-[#222222]">{item.name}</h3>
                        <p className="text-rose-500 font-bold mt-2">R {item.price}/night</p>
                      </div>
                    </motion.div>
                   ))}
                </div>
              </section>

              {/* Helpers Section */}
              <section>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><UserGroupIcon className="w-7 h-7 text-[#FF385C]" /> Local Helpers & Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentResults.helpers.map((item) => (
                    <motion.div key={item.id} whileHover={{ y: -5 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer">
                      <div className="aspect-video overflow-hidden"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-duration-500" /></div>
                      <div className="p-4 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white -mt-10 mx-auto relative z-10 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div>
                        <h3 className="font-bold text-[#222222] mt-2">{item.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.type}</p>
                        <p className="text-sm font-bold text-[#222222] mt-2">R {item.price} / session</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Events Section */}
              <section>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><CalendarDaysIcon className="w-7 h-7 text-[#FF385C]" /> Local Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentResults.events.map((item) => (
                    <motion.div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-lg transition-all group">
                      <div className="w-1/3 aspect-square overflow-hidden"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-duration-500" /></div>
                      <div className="p-6 flex flex-col justify-center bg-white w-2/3">
                        <span className="text-[#FF385C] font-bold text-sm">{item.date}</span>
                        <h3 className="text-xl font-bold text-[#222222] mt-1">{item.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{item.type}</p>
                        <div className="mt-4"><span className="px-3 py-1 bg-rose-50 text-[#FF385C] rounded-full text-xs font-bold">{item.status}</span></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <div className="flex justify-center pt-8">
                <button onClick={() => { setStep(1); setShowResults(false); }} className="px-12 py-4 border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors">Plan Another Journey</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Trip;
