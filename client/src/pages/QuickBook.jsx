import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ChevronLeftIcon, BoltIcon, CheckCircleIcon, XMarkIcon, CheckIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const FALLBACK_HELPERS = [
  { id: 'h1', name: 'Mpho Khumalo', type: 'Instant Car Wash', price: 'R150', rating: 4.9, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345678', location: 'Polokwane' },
  { id: 'h2', name: 'Lerato Modise', type: 'Quick Clean', price: 'R200', rating: 4.8, avatar: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345679', location: 'Polokwane' },
  { id: 'h3', name: 'Thabo Sithole', type: 'Express Laundry', price: 'R120', rating: 4.7, avatar: 'https://images.pexels.com/photos/3993311/pexels-photo-3993311.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345680', location: 'Polokwane' },
  { id: 'h4', name: 'Sipho Ndlovu', type: 'Emergency Handyman', price: 'R350', rating: 5.0, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345681', location: 'Polokwane' }
];

const OrbitNode = ({ candidate, index, total, radius, center, onClick, isActive }) => {
  const angle = (index / total) * Math.PI * 2;
  const x = center.x + Math.cos(angle) * radius;
  const y = center.y + Math.sin(angle) * radius;
  const score = Math.floor(80 + Math.random() * 20);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x: x - 40, y: y - 40 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      className={`absolute w-20 h-20 rounded-full border-4 cursor-pointer flex items-center justify-center z-20 ${
        isActive 
          ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.8)] z-30' 
          : 'border-white/20 shadow-xl hover:border-white/50'
      }`}
      onClick={() => onClick(candidate)}
    >
      <div className="absolute top-[-10px] right-[-10px] bg-amber-500 text-[10px] font-black text-gray-900 px-2 py-0.5 rounded-full border border-amber-300 shadow-md">
        {score}%
      </div>
      <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover rounded-full p-1" />
    </motion.div>
  );
};

export default function QuickBook() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // 0: Idle, 1: Scanning, 2: Approve/Reject Matrix, 3: Success
  const [candidates, setCandidates] = useState([]);
  const [activeNode, setActiveNode] = useState(null);

  const services = [
    { id: 'wash', name: 'Instant Car Wash', price: 'R150', icon: '🚗', query: 'carwash' },
    { id: 'clean', name: 'Quick Clean', price: 'R200', icon: '🧹', query: 'maid' },
    { id: 'laundry', name: 'Express Laundry', price: 'R120', icon: '🧺', query: 'washingmat' },
    { id: 'handy', name: 'Emergency Handyman', price: 'R350', icon: '🔧', query: 'handyman' },
  ];

  const handleQuickBook = async () => {
    setIsBooking(true);
    setBookingStep(1); // Scanning

    try {
      const res = await fetch(`/api/helper/get?limit=20`);
      const data = res.ok ? await res.json() : [];

      const matches = data.filter(h => 
        h.type?.toLowerCase().includes(selectedService.query) || 
        h.name?.toLowerCase().includes(selectedService.query)
      ).map(item => ({
        id: item._id,
        name: item.name,
        type: selectedService.name,
        price: selectedService.price,
        rating: item.rating || 5.0,
        avatar: item.imageUrls?.[0] || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        phone: item.contact || '27712345678',
        location: item.address || 'Polokwane'
      }));

      if (matches.length === 0) {
        const fallback = FALLBACK_HELPERS.filter(h => h.type === selectedService.name);
        setCandidates(fallback.length > 0 ? fallback : FALLBACK_HELPERS);
      } else {
        setCandidates(matches);
      }
      
      setTimeout(() => {
        setBookingStep(2); // Show Smart Matrix
      }, 2500);

    } catch (error) {
      console.error("Quick booking match failed, using fallbacks:", error);
      const fallback = FALLBACK_HELPERS.filter(h => h.type === selectedService.name);
      setCandidates(fallback.length > 0 ? fallback : FALLBACK_HELPERS);
      setTimeout(() => {
        setBookingStep(2);
      }, 2500);
    }
  };

  const handleApprove = () => {
    if (activeNode) {
      setBookingStep(3); // Success Screen
    }
  };

  const removeCandidate = (id) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    if (activeNode?.id === id) setActiveNode(null);
  };

  // SVG Center Coordinates
  const center = { x: 300, y: 300 };
  const radius = 180;
  const displayedNodes = candidates.slice(0, 6); // Max 6 for clear orbit in QuickBook

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-[200] overflow-hidden text-white font-sans">
      {/* Dynamic Background */}
      {bookingStep === 2 && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(-100px)',
          transformOrigin: 'top center'
        }}></div>
      )}
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button 
          onClick={() => {
            if (isBooking && bookingStep > 0 && bookingStep !== 3) {
              setIsBooking(false);
              setBookingStep(0);
              setSelectedService(null);
              setActiveNode(null);
            } else if (bookingStep === 3) {
              setIsBooking(false);
              setBookingStep(0);
              setSelectedService(null);
              setActiveNode(null);
            } else {
              navigate(-1);
            }
          }} 
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors cursor-pointer backdrop-blur-md"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
          <BoltIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest">One-Tap Quick Book</span>
        </div>
        <div className="w-11" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!isBooking ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-6 max-w-xl mx-auto w-full overflow-y-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black italic tracking-tight mb-2">NEURAL MATCHMAKING</h2>
                <p className="text-gray-400 text-sm">Select a priority service. Our AI will instantly deploy the nearest 5-star professional to your geolocation.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden ${
                      selectedService?.id === service.id
                        ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-4xl">{service.icon}</span>
                    <h3 className="font-bold text-sm leading-tight">{service.name}</h3>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">{service.price}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedService}
                onClick={handleQuickBook}
                className="w-full py-5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-black uppercase tracking-widest text-sm rounded-[2rem] shadow-2xl transition-all active:scale-95 mt-auto flex items-center justify-center gap-2"
              >
                <BoltIcon className="w-4 h-4 fill-current" />
                Deploy Provider
              </button>
            </motion.div>
          ) : (
            <>
              {bookingStep === 1 && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center w-full p-6"
                >
                  <div className="space-y-6">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-widest text-amber-400 mb-2">Scanning Area</h3>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto">Locking coords and checking nearest verified {selectedService?.name} professionals in your area...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {bookingStep === 2 && displayedNodes.length > 0 && (
                <>
                  {/* Smart Matrix Node Web */}
                  <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                    <div className="relative w-[600px] h-[600px] flex items-center justify-center scale-75 md:scale-100">
                      
                      {/* SVG Connections */}
                      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                        {displayedNodes.map((candidate, index) => {
                          const angle = (index / displayedNodes.length) * Math.PI * 2;
                          const x = center.x + Math.cos(angle) * radius;
                          const y = center.y + Math.sin(angle) * radius;
                          const isActive = activeNode?.id === candidate.id;

                          return (
                            <motion.line
                              key={`line-${candidate.id}`}
                              x1={center.x}
                              y1={center.y}
                              x2={x}
                              y2={y}
                              stroke={isActive ? '#f59e0b' : '#374151'}
                              strokeWidth={isActive ? 3 : 1.5}
                              strokeDasharray="5,5"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: isActive ? 1 : 0.4 }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={isActive ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" : ""}
                            />
                          );
                        })}
                        {/* Central AI Node */}
                        <circle cx={center.x} cy={center.y} r="35" fill="rgba(245,158,11,0.2)" className="animate-ping" />
                      </svg>

                      {/* Central QuickBook Node */}
                      <div className="absolute z-20 w-16 h-16 rounded-full bg-gray-900 border-4 border-amber-500 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.8)]">
                        <BoltIcon className="w-8 h-8 text-amber-400 fill-amber-400" />
                      </div>

                      {/* Orbiting Candidate Nodes */}
                      <AnimatePresence>
                        {displayedNodes.map((candidate, index) => (
                          <OrbitNode 
                            key={candidate.id}
                            candidate={candidate}
                            index={index}
                            total={displayedNodes.length}
                            radius={radius}
                            center={center}
                            onClick={setActiveNode}
                            isActive={activeNode?.id === candidate.id}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Glassmorphism Detail Panel */}
                  <AnimatePresence>
                    {activeNode && (
                      <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="w-full md:w-[400px] h-[50vh] md:h-full bg-gray-900/80 backdrop-blur-xl border-l border-white/10 flex flex-col z-30 shadow-2xl"
                      >
                        <div className="p-6 flex-1 overflow-y-auto">
                          <div className="flex justify-between items-start mb-6">
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">
                              Candidate Found
                            </span>
                            <button onClick={() => setActiveNode(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                              <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                          
                          <img src={activeNode.avatar} alt={activeNode.name} className="w-full h-48 object-cover rounded-2xl mb-6 shadow-lg border border-white/5" />
                          
                          <h2 className="text-3xl font-black text-white leading-tight mb-2">{activeNode.name}</h2>
                          
                          <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                              <HeartSolidIcon className="w-4 h-4" /> {activeNode.rating}
                            </div>
                            <div className="text-gray-300 font-medium text-sm px-3 py-1 bg-white/5 rounded-full border border-white/10">
                              {activeNode.location}
                            </div>
                            <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                              {activeNode.type}
                            </div>
                          </div>

                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-6">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Standard Rate</p>
                            <p className="text-2xl font-black text-white">{activeNode.price}</p>
                          </div>

                          <div className="space-y-4">
                            <button 
                              onClick={handleApprove}
                              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
                            >
                              <CheckIcon className="w-5 h-5 stroke-[3]" /> Approve & Connect
                            </button>
                            <button 
                              onClick={() => removeCandidate(activeNode.id)}
                              className="w-full py-4 bg-transparent hover:bg-rose-500/10 text-rose-400 border border-rose-500/30 font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                            >
                              Dismiss Candidate
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {bookingStep === 2 && displayedNodes.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto text-center">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
                    <XMarkIcon className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">No Candidates Left</h3>
                  <p className="text-gray-400 text-sm mb-8">We couldn't locate any more active providers in your local grid.</p>
                  <button
                    onClick={() => {
                      setIsBooking(false);
                      setBookingStep(0);
                      setSelectedService(null);
                    }}
                    className="px-8 py-4 bg-white text-gray-950 font-black uppercase tracking-widest text-xs rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              )}

              {bookingStep === 3 && activeNode && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto"
                >
                  <div className="space-y-6 w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-widest text-emerald-400 mb-2">Approved!</h3>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
                        {activeNode.name} has been selected. Send them a WhatsApp message to finalize coordinate deployment details.
                      </p>
                      
                      <div className="space-y-4">
                        <button
                          onClick={() => {
                            const message = `Hello ${activeNode.name}, I would like to book your ${activeNode.type} service on LoopOut. Please confirm availability!`;
                            window.open(`https://wa.me/${activeNode.phone}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="w-full py-4 bg-emerald-500 text-gray-950 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                          <PhoneIcon className="w-4 h-4 fill-current" />
                          Send WhatsApp Booking
                        </button>

                        <button
                          onClick={() => {
                            setIsBooking(false);
                            setBookingStep(0);
                            setSelectedService(null);
                            setActiveNode(null);
                          }}
                          className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
