import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon, GiftIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';
import { Sparkles, Flame, CheckCircle, Wallet, ArrowRight, Zap, RefreshCw, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Prize options for the daily spin
const PRIZES = [
  { id: 'p1', label: 'R25 OFF Lunch', type: 'voucher', discount: 25, code: 'DAILYLUNCH25', bg: 'from-amber-500 to-orange-600', icon: '🍔' },
  { id: 'p2', label: '150 Loop Points', type: 'points', amount: 150, code: '', bg: 'from-purple-500 to-indigo-600', icon: '💎' },
  { id: 'p3', label: 'Free Delivery', type: 'voucher', discount: 'Free Shipping', code: 'FREEDELIVERY', bg: 'from-emerald-500 to-teal-600', icon: '🚚' },
  { id: 'p4', label: 'R50 Service Off', type: 'voucher', discount: 50, code: 'PROSPOIL50', bg: 'from-rose-500 to-pink-600', icon: '🛠️' },
  { id: 'p5', label: '300 Loop Points', type: 'points', amount: 300, code: '', bg: 'from-blue-500 to-cyan-600', icon: '⭐' },
  { id: 'p6', label: '10% OFF Booking', type: 'voucher', discount: '10%', code: 'VIPLOOP10', bg: 'from-amber-400 to-yellow-600', icon: '🎉' },
];

const STREAK_DAYS = [
  { day: 1, reward: '+50 pts', icon: '💎' },
  { day: 2, reward: 'R20 Off', icon: '🍔' },
  { day: 3, reward: 'R50 Off', icon: '🛠️' },
  { day: 4, reward: '+150 pts', icon: '⭐' },
  { day: 5, reward: '15% Off', icon: '🎉' },
  { day: 6, reward: 'R100 Spoil', icon: '🎁' },
  { day: 7, reward: 'VIP Pass', icon: '👑' },
];

export default function DailySpinWheelModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [streakCount, setStreakCount] = useState(3); // Demo streak count
  const [walletVouchers, setWalletVouchers] = useState([]);

  // Check localStorage for today's spin status
  useEffect(() => {
    const lastSpinDate = localStorage.getItem('loopout_last_spin_date');
    const today = new Date().toDateString();
    if (lastSpinDate === today) {
      setHasSpunToday(true);
      const savedPrize = localStorage.getItem('loopout_today_prize');
      if (savedPrize) {
        try { setWonPrize(JSON.parse(savedPrize)); } catch (e) {}
      }
    }
    const savedVouchers = JSON.parse(localStorage.getItem('loopout_user_vouchers') || '[]');
    setWalletVouchers(savedVouchers);
  }, [isOpen]);

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    // Pick a random prize index
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const selectedPrize = PRIZES[prizeIndex];

    // Compute rotation (minimum 5 full spins = 1800deg + segment angle)
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 1800 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));

    setRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      setHasSpunToday(true);

      const today = new Date().toDateString();
      localStorage.setItem('loopout_last_spin_date', today);
      localStorage.setItem('loopout_today_prize', JSON.stringify(selectedPrize));

      // Save voucher to user wallet
      if (selectedPrize.type === 'voucher') {
        const existing = JSON.parse(localStorage.getItem('loopout_user_vouchers') || '[]');
        const updated = [
          {
            id: Date.now().toString(),
            title: selectedPrize.label,
            code: selectedPrize.code,
            icon: selectedPrize.icon,
            date: new Date().toLocaleDateString(),
          },
          ...existing,
        ];
        localStorage.setItem('loopout_user_vouchers', JSON.stringify(updated));
        setWalletVouchers(updated);
      }
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-gray-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            className="bg-gradient-to-b from-gray-900 via-gray-900 to-slate-950 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white/10 relative text-white overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10 z-20"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Header: Title & Daily Streak Counter */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                  🎁
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tight text-white flex items-center gap-2">
                    Daily Spoil Wheel <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80">Spin once daily for free discounts</p>
                </div>
              </div>

              {/* Flame Streak Badge */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
                <span className="text-xs font-black text-amber-300">{streakCount} Day Streak!</span>
              </div>
            </div>

            {/* 7-Day Streak Timeline */}
            <div className="mb-6 bg-white/5 rounded-2xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Weekly Login Streak</span>
                <span className="text-[10px] font-extrabold text-amber-400">Come back daily!</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {STREAK_DAYS.map((st) => {
                  const isCurrent = st.day === streakCount;
                  const isPassed = st.day < streakCount;
                  return (
                    <div
                      key={st.day}
                      className={`flex flex-col items-center p-2 rounded-xl text-center border transition ${
                        isCurrent
                          ? 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-300 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50'
                          : isPassed
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      <span className="text-xs">{isPassed ? '✅' : st.icon}</span>
                      <span className="text-[9px] font-black mt-1">D{st.day}</span>
                      <span className="text-[7px] font-bold opacity-80">{st.reward}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SPIN WHEEL SECTION */}
            <div className="relative flex flex-col items-center justify-center py-2">

              {/* Wheel Pointer Needle */}
              <div className="absolute top-0 z-30 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_4px_10px_rgba(251,191,36,0.8)]" />
              </div>

              {/* Wheel Container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-amber-400/60 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex items-center justify-center overflow-hidden my-4 bg-gray-950">
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4, ease: [0.15, 0.9, 0.25, 1] }}
                  className="w-full h-full relative"
                >
                  {/* Wheel Segments */}
                  {PRIZES.map((pz, idx) => {
                    const angle = 360 / PRIZES.length;
                    const rotate = idx * angle;
                    return (
                      <div
                        key={pz.id}
                        className="absolute inset-0 origin-center flex justify-center items-start pt-3"
                        style={{ transform: `rotate(${rotate}deg)` }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <span className="text-2xl drop-shadow-md">{pz.icon}</span>
                          <span className="text-[10px] font-black uppercase text-white tracking-wider max-w-[65px] leading-tight mt-1 drop-shadow-sm">
                            {pz.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Center Hub Button */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || hasSpunToday}
                  className={`absolute z-20 w-20 h-20 rounded-full flex flex-col items-center justify-center font-black uppercase text-xs tracking-wider shadow-2xl transition-transform active:scale-95 border-2 border-white/20 ${
                    hasSpunToday
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white cursor-default'
                      : isSpinning
                      ? 'bg-gray-800 text-amber-300 animate-pulse cursor-wait'
                      : 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-amber-500/50 hover:scale-105'
                  }`}
                >
                  {hasSpunToday ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-white mb-0.5" />
                      <span className="text-[8px]">SPUN</span>
                    </>
                  ) : isSpinning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin mb-0.5" />
                      <span className="text-[8px]">SPINNING</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-yellow-200 animate-bounce mb-0.5" />
                      <span>SPIN!</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status or Claimed Banner */}
              {wonPrize && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-3 w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-400/50 rounded-2xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-amber-300 text-sm font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>You Won: {wonPrize.icon} {wonPrize.label}!</span>
                  </div>
                  {wonPrize.code ? (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs font-bold text-gray-300">Voucher Code:</span>
                      <span className="bg-amber-400 text-gray-950 px-3 py-1 rounded-lg text-xs font-black tracking-widest">
                        {wonPrize.code}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 mt-1 font-medium">Added to your LoopOut Rewards Points balance!</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-5 border-t border-white/10 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>My Vouchers ({walletVouchers.length})</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/rewards');
                }}
                className="inline-flex items-center gap-1 text-xs font-black text-amber-400 hover:underline"
              >
                View Rewards Hub <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
