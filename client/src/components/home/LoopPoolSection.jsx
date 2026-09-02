import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Clock, CheckCircle2, Share2, Tag, ArrowRight, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const SAMPLE_POOLS = [
  {
    id: 'pool-1',
    title: 'Estate Group Mobile Car Wash & Engine Bay Shine',
    category: 'Mobile Detailing',
    area: 'Bendor Ridge / Woodhill Estate',
    singlePrice: 220,
    pooledPrice: 135,
    discountPercent: 38,
    requiredMembers: 5,
    currentMembers: 4,
    endsInMinutes: 38,
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
    joinedUsers: [
      { name: 'Kagiso', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' },
      { name: 'Lerato', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
      { name: 'Sipho', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80' },
      { name: 'Naledi', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    id: 'pool-2',
    title: 'Deep Carpet & Couch Steam Cleaning Pool',
    category: 'Deep Cleaning',
    area: 'Flora Park & Serala View',
    singlePrice: 650,
    pooledPrice: 390,
    discountPercent: 40,
    requiredMembers: 4,
    currentMembers: 3,
    endsInMinutes: 52,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    joinedUsers: [
      { name: 'Thabo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Johan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Precious', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    id: 'pool-3',
    title: 'Weekend Braai Master & Mobile Spitbraai Service',
    category: 'Catering',
    area: 'Polokwane & Surrounds',
    singlePrice: 1200,
    pooledPrice: 750,
    discountPercent: 37,
    requiredMembers: 6,
    currentMembers: 5,
    endsInMinutes: 24,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    joinedUsers: [
      { name: 'David', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
      { name: 'Mandla', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80' },
      { name: 'Bontle', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
      { name: 'Pieter', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Tumi', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    ],
  },
];

export default function LoopPoolSection({ currentUser }) {
  const [pools, setPools] = useState(SAMPLE_POOLS);
  const [joinedMap, setJoinedMap] = useState({});
  const [activeSharePool, setActiveSharePool] = useState(null);

  const handleJoinPool = (pool) => {
    if (joinedMap[pool.id]) return;
    const isCompleted = pool.currentMembers + 1 >= pool.requiredMembers;

    setJoinedMap((prev) => ({ ...prev, [pool.id]: true }));
    setPools((prev) =>
      prev.map((p) =>
        p.id === pool.id
          ? {
              ...p,
              currentMembers: Math.min(p.requiredMembers, p.currentMembers + 1),
              joinedUsers: [
                ...p.joinedUsers,
                {
                  name: currentUser?.username || 'You',
                  avatar:
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
                },
              ],
            }
          : p
      )
    );
  };

  const getWhatsAppShareUrl = (pool) => {
    const text = `Hey neighbors! 🚗💨 Join our group deal on LoopOut for "${pool.title}" in ${pool.area}. Only ${pool.requiredMembers - pool.currentMembers} more spot needed to get ${pool.discountPercent}% OFF (R${pool.pooledPrice} instead of R${pool.singlePrice})! Join the pool here: https://loopout.co.za/pools/${pool.id}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="mb-10 w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
              LoopPool • Group Buying &amp; Estate Power
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Neighborhood Group Deals
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            Band together with neighbors in your estate or suburb to unlock bulk discounts up to 40% OFF.
          </p>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pools.map((pool) => {
          const isJoined = joinedMap[pool.id];
          const remainingNeeded = Math.max(0, pool.requiredMembers - pool.currentMembers);
          const progressPercent = Math.min(100, Math.round((pool.currentMembers / pool.requiredMembers) * 100));

          return (
            <motion.div
              key={pool.id}
              whileHover={{ y: -4 }}
              className="rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={pool.image}
                  alt={pool.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Save {pool.discountPercent}%
                </div>

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{pool.endsInMinutes}m left</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                    {pool.area}
                  </span>
                  <h3 className="text-sm font-black leading-snug line-clamp-1">
                    {pool.title}
                  </h3>
                </div>
              </div>

              {/* Progress & Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Price Comparison */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 line-through block">
                        R{pool.singlePrice} solo rate
                      </span>
                      <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        R{pool.pooledPrice} <span className="text-[10px] text-gray-500 font-bold">/ person</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase block">
                        You Save R{pool.singlePrice - pool.pooledPrice}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        Unlocked on {pool.requiredMembers} spots
                      </span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-gray-900 dark:text-white">
                        {pool.currentMembers} of {pool.requiredMembers} Neighbors Joined
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {remainingNeeded === 0 ? '🎉 POOL UNLOCKED!' : `${remainingNeeded} more needed`}
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          remainingNeeded === 0
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-500 to-rose-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Joined Neighbors Avatars */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden">
                      {pool.joinedUsers.slice(0, 5).map((user, idx) => (
                        <img
                          key={idx}
                          src={user.avatar}
                          alt={user.name}
                          className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
                          title={user.name}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-bold text-gray-400">
                      Verified Estate Group
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <a
                    href={getWhatsAppShareUrl(pool)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center shrink-0 active:scale-95"
                    title="Share with Estate WhatsApp Group"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleJoinPool(pool)}
                    disabled={isJoined}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
                      isJoined
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Pool Joined
                      </>
                    ) : (
                      <>
                        Join Pool <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
