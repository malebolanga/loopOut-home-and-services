import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Wallet } from 'lucide-react';
import LoopStreakModal, { getStreakData } from './LoopStreakModal';

export default function LoopStreakWidget() {
  const [streakData, setStreakData] = useState(getStreakData());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = streakData.lastClaimDate === todayStr;

  const handleClaimSuccess = (updated) => {
    setStreakData(updated);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all shadow-sm cursor-pointer ${
          hasClaimedToday
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            : 'bg-gradient-to-r from-rose-500 to-amber-500 border-transparent text-white shadow-rose-500/25 animate-pulse'
        }`}
      >
        <span className="flex items-center gap-1 text-xs font-black">
          <Flame className={`w-3.5 h-3.5 ${hasClaimedToday ? 'fill-amber-500 text-amber-500' : 'fill-white text-white animate-bounce'}`} />
          <span>{streakData.streak}d Streak</span>
        </span>

        <span className="text-[11px] font-extrabold opacity-90 border-l border-current pl-2">
          R{streakData.balance} credits
        </span>

        {!hasClaimedToday && (
          <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
        )}
      </motion.button>

      <LoopStreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClaimSuccess={handleClaimSuccess}
      />
    </>
  );
}
