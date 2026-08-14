/**
 * LoopPointsToast — Animated floating toast shown after earning points
 *
 * Usage:
 *   <LoopPointsToast
 *     earned={3.78}
 *     label="Property Booking"
 *     total={47.32}
 *     onDismiss={() => clearLastEarned()}
 *   />
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { FREE_SERVICE_THRESHOLD } from '../hooks/useLoopPoints';

export default function LoopPointsToast({ earned, label, total, onDismiss }) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!earned) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400); // wait for exit animation
    }, 5000);
    return () => clearTimeout(t);
  }, [earned, onDismiss]);

  const progressPercent = ((total % FREE_SERVICE_THRESHOLD) / FREE_SERVICE_THRESHOLD) * 100;
  const freeServicesEarned = Math.floor(total / FREE_SERVICE_THRESHOLD);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[99999] w-[90vw] max-w-sm"
        >
          <div className="bg-gray-950 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden border border-white/10">

            {/* Shimmer top strip */}
            <div className="h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-purple-500 animate-pulse" />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      LoopOut Points Earned
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                      {label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Points display */}
              <div className="flex items-end gap-1 mb-4">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                  className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 leading-none"
                >
                  +{earned.toFixed(2)}
                </motion.span>
                <span className="text-sm font-black text-gray-400 mb-0.5 uppercase tracking-widest">pts</span>
              </div>

              {/* Progress to free service */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Free Service Progress
                  </span>
                  <span className="text-[9px] font-black text-gray-400">
                    {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {FREE_SERVICE_THRESHOLD.toLocaleString()} pts
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500"
                  />
                </div>
              </div>

              {/* Free service unlocked or hint */}
              {freeServicesEarned > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                    🎉 {freeServicesEarned} Free Service{freeServicesEarned > 1 ? 's' : ''} Unlocked!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[9px] font-bold text-gray-500">
                    {(FREE_SERVICE_THRESHOLD - (total % FREE_SERVICE_THRESHOLD)).toLocaleString(undefined, { maximumFractionDigits: 0 })} pts to a free service
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
