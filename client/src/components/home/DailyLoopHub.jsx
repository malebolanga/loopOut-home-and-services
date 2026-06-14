import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon, CalendarDaysIcon, ArrowPathIcon, XMarkIcon, CameraIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoopOutVision from './LoopOutVision';
import LoopOutWhisper from './LoopOutWhisper';

const DailyLoopHub = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [showWhisperModal, setShowWhisperModal] = useState(false);

  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBooking, setPastBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      try {
        const [userRes, hostRes] = await Promise.all([
          fetch(`/api/bookings/user/${currentUser._id}`),
          fetch(`/api/bookings/host/${currentUser._id}`)
        ]);

        let allData = [];
        if (userRes.ok) {
          const userData = await userRes.json();
          allData = [...allData, ...userData];
        }
        if (hostRes.ok) {
          const hostData = await hostRes.json();
          allData = [...allData, ...hostData];
        }

        // Deduplicate by _id
        const uniqueDataMap = new Map();
        allData.forEach(item => uniqueDataMap.set(item._id, item));
        const combinedData = Array.from(uniqueDataMap.values());

        const now = new Date();
        
        // Sort by start date ascending for upcoming
        const upcoming = combinedData
          .filter(b => new Date(b.startDate) >= now && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'approved'))
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          
        if (upcoming.length > 0) setUpcomingBookings(upcoming.slice(0, 2));

        // Get most recent past booking for rebook (maybe only user bookings for rebook makes sense, but we can use combined)
        const past = combinedData
          .filter(b => b.status === 'completed' || new Date(b.startDate) < now)
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          
        if (past.length > 0) setPastBooking(past[0]);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, [currentUser]);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    // Simulate API call for the broadcast to Radar
    setTimeout(() => {
      setIsBroadcasting(false);
      setShowBroadcastModal(false);
      setBroadcastMessage('');
      // Show success toast or navigate
      navigate('/radar');
    }, 1500);
  };

  return (
    <div className="mb-8 mt-2">
      {/* Daily Loop Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-gray-900">Your Daily Loop</h2>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
        {/* Upcoming Appointment Cards */}
        {upcomingBookings.map((booking, index) => {
          const item = booking.listing || booking.service || booking.helper || booking.event;
          const date = new Date(booking.startDate);
          // Determine if user is host or client
          const isHost = item?.userRef === currentUser._id;
          
          return (
            <motion.div 
              key={booking._id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/${booking.service ? 'service' : booking.helper ? 'helper' : booking.event ? 'event' : 'listing'}/${item?._id}`)}
              className={`snap-start shrink-0 w-[240px] p-4 rounded-3xl relative overflow-hidden shadow-xl cursor-pointer ${isHost ? 'bg-gradient-to-br from-indigo-900 to-indigo-800' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                  <CalendarDaysIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isHost ? 'To Provide' : 'Upcoming'}</p>
                  <h3 className="text-white text-sm font-black truncate max-w-[140px]">{item?.name || item?.title || 'Appointment'}</h3>
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-white font-medium text-xs">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-gray-400 text-[10px] capitalize">Status: {booking.status}</p>
                </div>
                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {booking.status}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Quick Rebook Card */}
        {pastBooking && (() => {
          const item = pastBooking.listing || pastBooking.service || pastBooking.helper || pastBooking.event;
          return (
            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/${pastBooking.service ? 'service' : pastBooking.helper ? 'helper' : pastBooking.event ? 'event' : 'listing'}/${item?._id}`)}
              className="snap-start shrink-0 w-[200px] p-4 bg-white border border-gray-100 rounded-3xl relative overflow-hidden shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <ArrowPathIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rebook</p>
                  <h3 className="text-gray-900 text-sm font-black truncate max-w-[100px]">{item?.name || item?.title || 'Service'}</h3>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-500 text-[11px] font-medium truncate max-w-[80px]">{item?.location || item?.address || 'LoopOut'}</p>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                  Book Now
                </button>
              </div>
            </motion.div>
          );
        })()}

        {/* Lightning Broadcast SOS Button */}
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBroadcastModal(true)}
          className="snap-start shrink-0 w-[180px] p-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl relative overflow-hidden shadow-lg shadow-rose-500/30 flex flex-col justify-center items-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 border border-white/30 backdrop-blur-sm relative z-10 group-hover:animate-pulse">
            <BoltIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white text-sm font-black tracking-wide relative z-10">QUICK-CAST</h3>
          <p className="text-rose-100 text-[9px] font-bold uppercase tracking-widest relative z-10 mt-1">Broadcast Need</p>
        </motion.div>

        {/* LoopOut Vision Scanner Button */}
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowVisionModal(true)}
          className="snap-start shrink-0 w-[180px] p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl relative overflow-hidden shadow-lg shadow-indigo-500/30 flex flex-col justify-center items-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 border border-white/30 backdrop-blur-sm relative z-10 group-hover:animate-pulse">
            <CameraIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white text-sm font-black tracking-wide relative z-10">VISION SCAN</h3>
          <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest relative z-10 mt-1">AI Problem Solver</p>
        </motion.div>

        {/* LoopOut Whisper Voice Assistant Button */}
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWhisperModal(true)}
          className="snap-start shrink-0 w-[180px] p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl relative overflow-hidden shadow-lg shadow-cyan-500/30 flex flex-col justify-center items-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 border border-white/30 backdrop-blur-sm relative z-10 group-hover:animate-pulse">
            <MicrophoneIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white text-sm font-black tracking-wide relative z-10">WHISPER AI</h3>
          <p className="text-cyan-100 text-[9px] font-bold uppercase tracking-widest relative z-10 mt-1">Voice Concierge</p>
        </motion.div>
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-gray-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowBroadcastModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <BoltIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Lightning Broadcast</h3>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Alert nearby helpers instantly</p>
                </div>
              </div>

              <div className="mb-6 relative">
                <textarea 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="E.g. Burst pipe! Need a plumber at my house in the next 30 mins."
                  className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-gray-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Radar Sync</span>
                </div>
              </div>

              <button 
                onClick={handleBroadcast}
                disabled={isBroadcasting || !broadcastMessage.trim()}
                className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${
                  isBroadcasting || !broadcastMessage.trim() 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 hover:bg-rose-600 active:scale-95'
                }`}
              >
                {isBroadcasting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <BoltIcon className="w-5 h-5" />
                    Send Quick-Cast
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LoopOut Vision Modal */}
      <LoopOutVision isOpen={showVisionModal} onClose={() => setShowVisionModal(false)} />

      {/* LoopOut Whisper Modal */}
      <LoopOutWhisper isOpen={showWhisperModal} onClose={() => setShowWhisperModal(false)} />
    </div>
  );
};

export default DailyLoopHub;
