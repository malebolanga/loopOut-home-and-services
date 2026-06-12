import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp, 
  ShieldCheck,
  Camera,
  CheckCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rewards() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  // Mock points logic if not in DB
  const userPoints = currentUser?.points || 1250; 
  
  // Tier Definitions
  const tiers = [
    { name: 'Bronze', threshold: 0, color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/20' },
    { name: 'Silver', threshold: 1000, color: 'from-slate-300 to-slate-500', shadow: 'shadow-slate-500/20' },
    { name: 'Gold', threshold: 2500, color: 'from-yellow-400 to-yellow-600', shadow: 'shadow-yellow-500/20' },
    { name: 'Platinum', threshold: 5000, color: 'from-cyan-400 to-blue-600', shadow: 'shadow-cyan-500/20' },
    { name: 'Elite', threshold: 10000, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20' }
  ];

  const currentTierIndex = tiers.findIndex((t, i) => 
    userPoints >= t.threshold && (i === tiers.length - 1 || userPoints < tiers[i + 1].threshold)
  );
  const currentTier = tiers[currentTierIndex];
  const nextTier = tiers[currentTierIndex + 1] || tiers[tiers.length - 1];
  
  const progressPercent = nextTier.threshold === currentTier.threshold ? 100 : 
    ((userPoints - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100;

  const earnWays = [
    { title: 'Complete Verification', points: '+500', icon: ShieldCheck, done: currentUser?.isVerified },
    { title: 'Add Profile Photo', points: '+100', icon: Camera, done: !!currentUser?.avatar },
    { title: 'Book a Service', points: '+250', icon: Sparkles, done: false },
    { title: 'Leave a Review', points: '+50', icon: Star, done: false }
  ];

  const perks = [
    { title: '5% Off Service Bookings', reqTier: 'Silver' },
    { title: 'Priority Customer Support', reqTier: 'Gold' },
    { title: 'Free Event Listing Feature', reqTier: 'Platinum' },
    { title: 'Exclusive Elite Concierge', reqTier: 'Elite' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-gray-950 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-500/20 to-transparent blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-md"
          >
            <Trophy className="w-4 h-4 text-rose-400" />
            LoopOut Rewards
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4"
          >
            ELEVATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500">EXPERIENCE</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Earn points for every booking, unlock exclusive perks, and gain access to Masterpiece Elite status.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
        {/* Tier Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl ${currentTier.shadow} border border-gray-100`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left flex-1">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Current Status</p>
              <h2 className={`text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r ${currentTier.color}`}>
                {currentTier.name} Member
              </h2>
              <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-black text-gray-900">{userPoints.toLocaleString()} <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">pts</span></span>
                  {nextTier.name !== currentTier.name && (
                    <span className="text-sm font-bold text-gray-400">{nextTier.threshold.toLocaleString()} pts for {nextTier.name}</span>
                  )}
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${currentTier.color}`}
                  />
                </div>
              </div>
            </div>
            
            <div className={`w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br ${currentTier.color} shadow-2xl text-white`}>
              <Trophy className="w-16 h-16 drop-shadow-md" />
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Ways to Earn */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100"
          >
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-rose-500" />
              Ways to Earn
            </h3>
            <div className="space-y-4">
              {earnWays.map((way, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${way.done ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${way.done ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 shadow-sm'}`}>
                      <way.icon className="w-5 h-5" />
                    </div>
                    <span className={`font-bold ${way.done ? 'text-emerald-700' : 'text-gray-700'}`}>{way.title}</span>
                  </div>
                  {way.done ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="font-black text-rose-500 text-sm">{way.points}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Perks */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-950 rounded-[2rem] p-8 shadow-xl shadow-gray-900/50 border border-gray-800 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px]" />
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
              <Gift className="text-purple-400" />
              Elite Perks
            </h3>
            <div className="space-y-4 relative z-10">
              {perks.map((perk, idx) => {
                const reqIndex = tiers.findIndex(t => t.name === perk.reqTier);
                const isUnlocked = currentTierIndex >= reqIndex;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${isUnlocked ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gray-700'}`} />
                    <div className="flex-1">
                      <p className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{perk.title}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Unlocks at {perk.reqTier}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => navigate('/search')}
              className="mt-8 w-full py-4 bg-white text-gray-950 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Book Now to Earn
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
