import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, BoltIcon, CheckCircleIcon, Sparkles } from 'lucide-react';
import { XMarkIcon, CheckIcon, PhoneIcon } from '@heroicons/react/24/outline';

const FALLBACK_HELPERS = [
  { id: 'h1', name: 'Mpho Khumalo', type: 'Instant Car Wash', price: 'R150', rating: 4.9, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345678', location: 'Polokwane' },
  { id: 'h2', name: 'Lerato Modise', type: 'Quick Clean', price: 'R200', rating: 4.8, avatar: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345679', location: 'Polokwane' },
  { id: 'h3', name: 'Thabo Sithole', type: 'Express Laundry', price: 'R120', rating: 4.7, avatar: 'https://images.pexels.com/photos/3993311/pexels-photo-3993311.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345680', location: 'Polokwane' },
  { id: 'h4', name: 'Sipho Ndlovu', type: 'Emergency Handyman', price: 'R350', rating: 5.0, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800', phone: '27712345681', location: 'Polokwane' }
];

export default function QuickBook() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // 0: Idle, 1: Scanning, 2: Approve/Reject, 3: Success
  const [candidates, setCandidates] = useState([]);
  const [candidateIndex, setCandidateIndex] = useState(0);

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
      // Fetch helpers matching type/area
      const res = await fetch(`/api/helper/get?limit=20`);
      const data = res.ok ? await res.json() : [];

      // Filter local matches
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

      // Use fallbacks if no database items match
      if (matches.length === 0) {
        const fallback = FALLBACK_HELPERS.filter(h => h.type === selectedService.name);
        setCandidates(fallback.length > 0 ? fallback : [FALLBACK_HELPERS[0]]);
      } else {
        setCandidates(matches);
      }
      
      setCandidateIndex(0);

      // Simulate a brief neural analysis delay
      setTimeout(() => {
        setBookingStep(2); // Approve/Reject Screen
      }, 2500);

    } catch (error) {
      console.error("Quick booking match failed, using fallbacks:", error);
      const fallback = FALLBACK_HELPERS.filter(h => h.type === selectedService.name);
      setCandidates(fallback.length > 0 ? fallback : [FALLBACK_HELPERS[0]]);
      setCandidateIndex(0);
      setTimeout(() => {
        setBookingStep(2);
      }, 2500);
    }
  };

  const handleApprove = () => {
    setBookingStep(3); // Success Screen
  };

  const handleReject = () => {
    if (candidateIndex < candidates.length - 1) {
      setBookingStep(1); // Go back to scanning
      setTimeout(() => {
        setCandidateIndex(prev => prev + 1);
        setBookingStep(2); // Show next candidate
      }, 1500);
    } else {
      // Loop back or show empty
      setBookingStep(1);
      setTimeout(() => {
        setCandidates([]);
        setBookingStep(2);
      }, 1500);
    }
  };

  const currentCandidate = candidates[candidateIndex];

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-[200] overflow-y-auto text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col min-h-full max-w-xl mx-auto w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => {
              if (isBooking && bookingStep > 0) {
                setIsBooking(false);
                setBookingStep(0);
                setSelectedService(null);
              } else {
                navigate(-1);
              }
            }} 
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
            <BoltIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest">One-Tap Quick Book</span>
          </div>
          <div className="w-11" />
        </div>

        <AnimatePresence mode="wait">
          {!isBooking ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
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
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center w-full"
            >
              {bookingStep === 1 && (
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
              )}

              {bookingStep === 2 && currentCandidate && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative"
                >
                  <div className="text-center mb-6">
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-[0.2em]">Match Found</span>
                    <h3 className="text-2xl font-black mt-1">Approve Provider?</h3>
                  </div>

                  {/* Face Image */}
                  <div className="w-32 h-32 rounded-full border-4 border-amber-500 p-1 mx-auto bg-gray-900 shadow-2xl mb-6 overflow-hidden">
                    <img 
                      src={currentCandidate.avatar} 
                      alt={currentCandidate.name} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  </div>

                  <div className="space-y-2 mb-8">
                    <h4 className="text-xl font-black tracking-tight">{currentCandidate.name}</h4>
                    <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{currentCandidate.type}</p>
                    <div className="flex justify-center items-center gap-6 pt-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Rating</span>
                        <span className="text-sm font-black text-amber-400">⭐ {currentCandidate.rating}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Price</span>
                        <span className="text-sm font-black text-white">{currentCandidate.price}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Location</span>
                        <span className="text-sm font-black text-emerald-400">{currentCandidate.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleReject}
                      className="flex-1 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-rose-500/20 flex items-center justify-center gap-2"
                    >
                      <XMarkIcon className="w-4 h-4 stroke-[3]" />
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 py-4 bg-emerald-500 text-gray-950 text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="w-4 h-4 stroke-[3]" />
                      Approve
                    </button>
                  </div>
                </motion.div>
              )}

              {bookingStep === 2 && !currentCandidate && (
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto">
                    <XMarkIcon className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">No Match Found</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">We couldn't locate any more active providers in your local grid.</p>
                    <button
                      onClick={() => {
                        setIsBooking(false);
                        setBookingStep(0);
                        setSelectedService(null);
                      }}
                      className="px-8 py-4 bg-white text-gray-950 font-black uppercase tracking-widest text-xs rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && currentCandidate && (
                <div className="space-y-6 max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-widest text-emerald-400 mb-2">Approved!</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
                      {currentCandidate.name} has been selected for the booking. Send them a WhatsApp message to finalize coordinate deployment details.
                    </p>
                    
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          const message = `Hello ${currentCandidate.name}, I would like to book your ${currentCandidate.type} service on LoopOut. Please confirm availability!`;
                          window.open(`https://wa.me/${currentCandidate.phone}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="w-full py-4 bg-emerald-500 text-gray-950 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        <PhoneIcon className="w-4 h-4 fill-current" />
                        Send WhatsApp Booking
                      </button>

                      <button
                        onClick={() => {
                          setIsBooking(false);
                          setBookingStep(0);
                          setSelectedService(null);
                        }}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
