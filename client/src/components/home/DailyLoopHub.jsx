import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon, XMarkIcon, CameraIcon, MicrophoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoopOutVision from './LoopOutVision';
import LoopOutWhisper from './LoopOutWhisper';
import { UpcomingBookingsSection } from './HomeSections';

const DailyLoopHub = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [showWhisperModal, setShowWhisperModal] = useState(false);



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

      <div className="flex overflow-x-auto gap-6 pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {/* Quick-Cast */}
        <button 
          onClick={() => setShowBroadcastModal(true)}
          className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none "
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 flex items-center justify-center shadow-[0_4px_12px_rgba(244,63,94,0.08)] md:shadow-[0_8px_24px_rgba(244,63,94,0.1)] group-hover:scale-105 md:group-hover:scale-110 active:scale-95 transition-all duration-300">
            <BoltIcon className="w-7 h-7 md:w-9 md:h-9 text-rose-500" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mt-2 px-1 leading-tight group-hover:text-rose-600 transition-colors">
            Quick-Cast
          </span>
        </button>

        {/* Vision Scan */}
        <button 
          onClick={() => setShowVisionModal(true)}
          className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none "
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.08)] md:shadow-[0_8px_24px_rgba(99,102,241,0.1)] group-hover:scale-105 md:group-hover:scale-110 active:scale-95 transition-all duration-300">
            <CameraIcon className="w-7 h-7 md:w-9 md:h-9 text-indigo-500" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mt-2 px-1 leading-tight group-hover:text-indigo-600 transition-colors">
            Vision Scan
          </span>
        </button>

        {/* Whisper AI */}
        <button 
          onClick={() => setShowWhisperModal(true)}
          className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-100 flex items-center justify-center shadow-[0_4px_12px_rgba(6,182,212,0.08)] md:shadow-[0_8px_24px_rgba(6,182,212,0.1)] group-hover:scale-105 md:group-hover:scale-110 active:scale-95 transition-all duration-300">
            <MicrophoneIcon className="w-7 h-7 md:w-9 md:h-9 text-cyan-500" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mt-2 px-1 leading-tight group-hover:text-cyan-600 transition-colors">
            Whisper AI
          </span>
        </button>

        {/* Matchmaker */}
        <button 
          onClick={() => navigate('/matchmaker')}
          className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.08)] md:shadow-[0_8px_24px_rgba(249,115,22,0.1)] group-hover:scale-105 md:group-hover:scale-110 active:scale-95 transition-all duration-300">
            <span className="text-3xl md:text-4xl leading-none">🔥</span>
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mt-2 px-1 leading-tight group-hover:text-orange-500 transition-colors">
            Matchmaker
          </span>
        </button>

        {/* Live Radar */}
        <button 
          onClick={() => navigate('/radar')}
          className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none "
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.08)] md:shadow-[0_8px_24px_rgba(16,185,129,0.1)] group-hover:scale-105 md:group-hover:scale-110 active:scale-95 transition-all duration-300">
            <MapPinIcon className="w-7 h-7 md:w-9 md:h-9 text-emerald-500" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mt-2 px-1 leading-tight group-hover:text-emerald-600 transition-colors">
            Live Radar
          </span>
        </button>

        {/* Quick Book */}
        <button 
          onClick={() => navigate('/quick-book')}
          className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none "
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.08)] md:shadow-[0_8px_24px_rgba(245,158,11,0.1)] group-hover:scale-105 md:group-hover:scale-110 active:scale-95 transition-all duration-300">
            <span className="text-3xl md:text-4xl leading-none">⚡</span>
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mt-2 px-1 leading-tight group-hover:text-amber-500 transition-colors">
            Quick Book
          </span>
        </button>
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
