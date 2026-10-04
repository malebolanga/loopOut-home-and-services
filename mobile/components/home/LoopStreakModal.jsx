import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Check, Gift, Wallet, ShieldCheck, X, Award } from 'lucide-react';

const REWARD_LADDER = [
  { day: 1, credit: 5, label: 'Day 1' },
  { day: 2, credit: 10, label: 'Day 2' },
  { day: 3, credit: 15, label: 'Day 3' },
  { day: 4, credit: 20, label: 'Day 4' },
  { day: 5, credit: 30, label: 'Day 5' },
  { day: 6, credit: 40, label: 'Day 6' },
  { day: 7, credit: 75, label: 'Day 7 👑', isJackpot: true },
];

export const getStreakData = () => {
  try {
    const raw = localStorage.getItem('loop_streak_data');
    if (!raw) return { streak: 1, balance: 25, lastClaimDate: null };
    return JSON.parse(raw);
  } catch {
    return { streak: 1, balance: 25, lastClaimDate: null };
  }
};

export const saveStreakData = (data) => {
  try {
    localStorage.setItem('loop_streak_data', JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save streak data', err);
  }
};

export default function LoopStreakModal({ isOpen, onClose, onClaimSuccess }) {
  const [streakData, setStreakData] = useState(getStreakData());
  const [justClaimed, setJustClaimed] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = streakData.lastClaimDate === todayStr;
  const currentDayIndex = ((streakData.streak - 1) % 7);
  const todayReward = REWARD_LADDER[currentDayIndex];

  useEffect(() => {
    setStreakData(getStreakData());
  }, [isOpen]);

  const handleClaim = () => {
    if (hasClaimedToday) return;

    const newStreak = streakData.streak + 1;
    const newBalance = (streakData.balance || 0) + todayReward.credit;
    const updated = {
      streak: newStreak,
      balance: newBalance,
      lastClaimDate: todayStr,
    };

    saveStreakData(updated);
    setStreakData(updated);
    setJustClaimed(true);

    if (onClaimSuccess) {
      onClaimSuccess(updated);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/25 mb-3 text-white"
          >
            <Flame className="w-9 h-9 fill-white" />
          </motion.div>

          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500">
            Daily Check-In Streak
          </span>
          <h3 className="text-2xl font-black tracking-tight mt-0.5">
            {streakData.streak} Day Streak! 🔥
          </h3>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
            Check in every 24 hours to earn real LoopCredits for bookings and services.
          </p>
        </div>

        {/* 7-Day Reward Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {REWARD_LADDER.map((item, idx) => {
            const isCompleted = idx < currentDayIndex;
            const isCurrent = idx === currentDayIndex;

            return (
              <div
                key={item.day}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                  item.isJackpot ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isCurrent
                    ? 'bg-gradient-to-b from-rose-500 to-amber-500 text-white ring-2 ring-rose-500/50 shadow-lg scale-105'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-gray-400'
                }`}
              >
                <span className="text-[9px] font-black uppercase">{item.label}</span>
                <div className="my-1">
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3px] mx-auto" />
                  ) : item.isJackpot ? (
                    <Award className="w-5 h-5 text-amber-300 mx-auto" />
                  ) : (
                    <Gift className="w-4 h-4 mx-auto" />
                  )}
                </div>
                <span className="text-[10px] font-black">
                  +R{item.credit}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Wallet Balance */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total LoopCredits</span>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                R{streakData.balance || 0}.00
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/40">
            Auto-Applies at Checkout
          </span>
        </div>

        {/* Action Button */}
        {hasClaimedToday ? (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1">
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Today's R{todayReward?.credit || 10} Claimed!</span>
            </div>
            <p className="text-[11px] font-semibold text-gray-400">
              Next reward unlocks tomorrow at 00:00.
            </p>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-rose-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Claim Today's +R{todayReward?.credit} LoopCredits
          </button>
        )}
      </motion.div>
    </div>
  );
}
