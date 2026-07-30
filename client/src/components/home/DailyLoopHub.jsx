import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoopOutVision from './LoopOutVision';
import LoopOutWhisper from './LoopOutWhisper';
import DailySpinWheelModal from './DailySpinWheelModal';
import { UpcomingBookingsSection } from './HomeSections';

// Hub items config: emoji, label, description, color accent
const HUB_ITEMS = [
  {
    id: 'daily-spin',
    emoji: '🎁',
    label: 'Daily Spoil',
    desc: 'Spin & Win',


    textColor: 'text-amber-600',
    action: 'modal-spin',

  },
  {
    id: 'lunch',
    emoji: '🍔',
    label: 'Lunch Hub',
    desc: 'Order food',

    textColor: 'text-amber-700',
    action: '/lunch',
  },
  {
    id: 'vision-scan',
    emoji: '📸',
    label: 'Vision Scan',
    desc: 'Scan with camera',

    textColor: 'text-purple-700',
    action: 'modal-vision',
  },
  {
    id: 'whisper-ai',
    emoji: '🎙️',
    label: 'Whisper AI',
    desc: 'Voice assistant',

    textColor: 'text-cyan-700',
    action: 'modal-whisper',
  },
  {
    id: 'matchmaker',
    emoji: '🔥',
    label: 'Matchmaker',
    desc: 'Find your match',

    textColor: 'text-rose-600',
    action: '/matchmaker',
  },
  {
    id: 'live-radar',
    emoji: '📍',
    label: 'Live Radar',
    desc: 'Nearby activity',

    textColor: 'text-emerald-600',
    action: '/radar',
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
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [hideHub, setHideHub] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Container is stuck at or near top of window
        setIsStuck(rect.top <= 4);
      }

      // Hide Daily Loop Hub when Explore section reaches top of screen
      const exploreEl = document.getElementById('explore-section') || document.getElementById('desktop-categories-bar');
      if (exploreEl) {
        const exploreRect = exploreEl.getBoundingClientRect();
        setHideHub(exploreRect.top <= 90);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    } else if (item.action === 'modal-spin') {
      setShowSpinModal(true);
    } else if (typeof item.action === 'string' && item.action.startsWith('/')) {
      navigate(item.action);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!hideHub && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            ref={containerRef}
            className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md transition-all duration-300 -mx-4 px-4 border-b border-gray-100/80 ${
              isStuck ? 'py-2 shadow-sm' : 'pt-3 pb-2 mb-6 shadow-xs'
            }`}
          >
            {/* Daily Loop Header - collapses smoothly when stuck at top */}
            <AnimatePresence initial={false}>
              {!isStuck && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 animate-ping" />
                    <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-gray-900">Your Daily Loop Hub</h2>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex overflow-x-auto gap-8 pb-2 scrollbar-hide snap-x snap-mandatory">
              {HUB_ITEMS.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ y: -3 }}
                    className="snap-start shrink-0 flex flex-col items-center text-center cursor-pointer focus:outline-none relative "
                  >
                    {/* Feature Badge */}
                    {item.badge && (
                      <span className="absolute -top-2.5 z-10 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-2 py-0.5 text-[8px] font-black text-white shadow-sm border border-white uppercase tracking-wider animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    {/* Colorful Gradient Icon Container */}
                    <motion.div
                      animate={isActive ? { scale: [1, 0.92, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className={`w-14 h-14 md:w-[72px] md:h-[72px] rounded-2xl bg-gradient-to-br ${item.gradient} ${item.shadow} flex items-center justify-center transition-all duration-300 ${item.border}`}
                    >
                      <span className="text-3xl md:text-[34px] leading-none select-none filter drop-shadow-md">
                        {item.emoji}
                      </span>
                    </motion.div>

                    {/* Bold Colorful Label */}
                    <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider mt-2 leading-tight ${item.textColor}`}>
                      {item.label}
                    </span>

                    {/* Small description */}
                    <span className="text-[8px] text-gray-500 font-bold mt-0.5 leading-tight">
                      {item.desc}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Spin & Win Modal */}
      <DailySpinWheelModal isOpen={showSpinModal} onClose={() => setShowSpinModal(false)} />

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
                className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${isBroadcasting || !broadcastMessage.trim()
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
    </>
  );
};


export default DailyLoopHub;
