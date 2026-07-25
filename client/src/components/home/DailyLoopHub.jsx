import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoopOutVision from './LoopOutVision';
import LoopOutWhisper from './LoopOutWhisper';
import { UpcomingBookingsSection } from './HomeSections';

// Hub items config: emoji, label, description, color accent
const HUB_ITEMS = [
  {
    id: 'quick-cast',
    emoji: '⚡',
    label: 'Quick-Cast',
    desc: 'Broadcast a need',
    accent: 'rose',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    activeBg: 'bg-white',
    activeBorder: 'border-rose-300',
    textColor: 'text-rose-500',
    action: 'modal-broadcast',
  },
  {
    id: 'vision-scan',
    emoji: '📷',
    label: 'Vision Scan',
    desc: 'Scan with camera',
    accent: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    activeBg: 'bg-white',
    activeBorder: 'border-indigo-300',
    textColor: 'text-indigo-500',
    action: 'modal-vision',
  },
  {
    id: 'whisper-ai',
    emoji: '🎙️',
    label: 'Whisper AI',
    desc: 'Voice assistant',
    accent: 'cyan',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    activeBg: 'bg-white',
    activeBorder: 'border-cyan-300',
    textColor: 'text-cyan-500',
    action: 'modal-whisper',
  },
  {
    id: 'matchmaker',
    emoji: '🔥',
    label: 'Matchmaker',
    desc: 'Find your match',
    accent: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    activeBg: 'bg-white',
    activeBorder: 'border-orange-300',
    textColor: 'text-orange-500',
    action: '/matchmaker',
  },
  {
    id: 'live-radar',
    emoji: '📍',
    label: 'Live Radar',
    desc: 'Nearby activity',
    accent: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    activeBg: 'bg-white',
    activeBorder: 'border-emerald-300',
    textColor: 'text-emerald-500',
    action: '/radar',
  },
  {
    id: 'quick-book',
    emoji: '🗓️',
    label: 'Quick Book',
    desc: 'Book instantly',
    accent: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    activeBg: 'bg-white',
    activeBorder: 'border-amber-300',
    textColor: 'text-amber-500',
    action: '/quick-book',
  },
  {
    id: 'lunch',
    emoji: '🍔🍟',
    label: 'Lunch',
    desc: 'Coming soon',
    accent: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    activeBg: 'bg-white',
    activeBorder: 'border-amber-300',
    textColor: 'text-amber-500',
    action: '/lunch',
  },
];

const DailyLoopHub = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [activeId, setActiveId] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [showWhisperModal, setShowWhisperModal] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setShowBroadcastModal(false);
      setBroadcastMessage('');
      navigate('/radar');
    }, 1500);
  };

  const handleItemClick = (item) => {
    setActiveId(item.id);
    setTimeout(() => setActiveId(null), 600);

    if (item.action === 'modal-broadcast') {
      setShowBroadcastModal(true);
    } else if (item.action === 'modal-vision') {
      setShowVisionModal(true);
    } else if (item.action === 'modal-whisper') {
      setShowWhisperModal(true);
    } else if (typeof item.action === 'string' && item.action.startsWith('/')) {
      navigate(item.action);
    }
  };

  return (
    <div className="mb-8 mt-2">
      {/* Daily Loop Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-gray-900">Your Daily Loop</h2>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="flex overflow-x-auto gap-8 pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {HUB_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              whileTap={{ scale: 0.93 }}
              whileHover={{ y: -2 }}
              className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none"
            >
              {/* Icon Circle */}
              <motion.div
                animate={isActive ? { scale: [1, 0.92, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-16 h-16 md:w-[72px] md:h-[72px] flex items-center justify-center transition-all duration-300"
              >
                <span className="text-3xl md:text-[34px] leading-none select-none">{item.emoji}</span>
              </motion.div>

              {/* Label */}
              <span className={`
                text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 leading-tight transition-colors
                ${isActive ? item.textColor : 'text-gray-800'}
              `}>
                {item.label}
              </span>

              {/* Small description */}
              <span className="text-[8px] text-gray-400 font-medium mt-0.5 leading-tight">
                {item.desc}
              </span>
            </motion.button>
          );
        })}
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
                  ⚡
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
