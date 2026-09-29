import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Zap,
  Clock,
  BadgeCheck,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoopPoints, POINTS_PER_BOOKING, FREE_SERVICE_THRESHOLD } from '../hooks/useLoopPoints';

// ─── Tier config ────────────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Explorer',  threshold: 0,     color: 'from-slate-400 to-slate-600',   glow: 'shadow-slate-400/20',  emoji: '🌍' },
  { name: 'Scout',     threshold: 500,   color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-400/25', emoji: '🔭' },
  { name: 'Pioneer',   threshold: 2000,  color: 'from-amber-400 to-yellow-500',  glow: 'shadow-amber-400/30',  emoji: '⭐' },
  { name: 'Elite',     threshold: 5000,  color: 'from-cyan-400 to-sky-500',      glow: 'shadow-cyan-400/30',   emoji: '💎' },
  { name: 'Luminary',  threshold: 12000, color: 'from-purple-500 to-pink-500',   glow: 'shadow-purple-500/35', emoji: '🌟' },
  { name: 'Infinity',  threshold: 20000, color: 'from-rose-500 to-fuchsia-500',  glow: 'shadow-rose-500/40',   emoji: '♾️' },
];

function getCurrentTier(total) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (total >= t.threshold) tier = t;
  }
  return tier;
}

function getNextTier(total) {
  for (const t of TIERS) {
    if (total < t.threshold) return t;
  }
  return TIERS[TIERS.length - 1];
}

// ─── Points stat card ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${gradient} text-white shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-xl" />
      <Icon className="w-7 h-7 mb-3 opacity-80" />
      <p className="text-3xl font-black leading-none mb-1">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      {sub && <p className="text-[9px] mt-1 opacity-50 font-bold">{sub}</p>}
    </motion.div>
  );
}

// ─── History item ──────────────────────────────────────────────────────────────
function HistoryRow({ entry, idx }) {
  const date = new Date(entry.date);
  const timeAgo = (() => {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="flex items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{entry.label}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{timeAgo}</p>
        </div>
      </div>
      <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
        +{entry.amount.toFixed(2)} pts
      </span>
    </motion.div>
  );
}

// ─── Main Rewards Page ─────────────────────────────────────────────────────────
export default function Rewards() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { getPoints, getFreeServices, getProgress } = useLoopPoints();
  const [tab, setTab] = useState('overview'); // 'overview' | 'history' | 'perks'

  // Live re-read every time tab changes or page mounts
  const [pointsData, setPointsData] = useState({ total: 0, history: [] });
  useEffect(() => {
    setPointsData(getPoints());
  }, [getPoints, tab]);

  const { total, history } = pointsData;
  const freeServices = getFreeServices();
  const progressPercent = getProgress();
  const currentTier = getCurrentTier(total);
  const nextTier = getNextTier(total);
  const ptsToNextTier = nextTier.threshold > total ? nextTier.threshold - total : 0;
  const tierProgress = nextTier.threshold === currentTier.threshold
    ? 100
    : ((total - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100;

  const bookingsCount = history.filter(h => h.label === 'Property Booking').length;
  const servicesCount = history.filter(h => h.label === 'Service Booking').length;

  const perks = [
    { title: 'Priority Matching',       reqTier: 'Scout',    desc: 'Skip the queue for helper matching', emoji: '⚡' },
    { title: '5% Off Any Booking',      reqTier: 'Pioneer',  desc: 'Applied automatically at checkout',   emoji: '🎁' },
    { title: 'Verified Elite Badge',     reqTier: 'Elite',    desc: 'Displayed on your public profile',    emoji: '💎' },
    { title: 'Free Service Redemption', reqTier: 'Luminary', desc: '1 free booking per milestone',         emoji: '🎉' },
    { title: 'Infinity Concierge',      reqTier: 'Infinity', desc: 'Dedicated personal account manager',   emoji: '♾️' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history',  label: `History (${history.length})` },
    { id: 'perks',    label: 'Perks' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-24">

      {/* ── Hero ── */}
      <div className="relative bg-gray-950 pt-28 pb-28 px-6 overflow-hidden">
        {/* Animated glows */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            LoopOut Rewards
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4 leading-none"
          >
            EARN WHILE YOU{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
              BOOK
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed"
          >
            Every booking earns <span className="text-amber-400 font-black">{POINTS_PER_BOOKING} pts</span>.
            Reach <span className="text-rose-400 font-black">{FREE_SERVICE_THRESHOLD.toLocaleString()} pts</span> and redeem a completely <span className="text-white font-black">free service</span>.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-14 relative z-20 space-y-6">

        {/* ── Tier Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-2xl ${currentTier.glow} border border-gray-100 dark:border-gray-800`}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Tier badge */}
            <div className={`shrink-0 w-28 h-28 rounded-full bg-gradient-to-br ${currentTier.color} flex flex-col items-center justify-center shadow-2xl`}>
              <span className="text-4xl leading-none">{currentTier.emoji}</span>
              <span className="text-[9px] text-white/70 font-black uppercase tracking-widest mt-1">{currentTier.name}</span>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Tier</p>
              <h2 className={`text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r ${currentTier.color} leading-none mb-1`}>
                {currentTier.name} Member
              </h2>

              {/* Points counter */}
              <div className="flex items-end gap-1.5 justify-center md:justify-start mt-3 mb-5">
                <span className="text-5xl font-black text-gray-900 dark:text-white leading-none tabular-nums">
                  {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-black text-gray-400 mb-1 uppercase tracking-widest">pts</span>
              </div>

              {/* Tier progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {ptsToNextTier > 0 ? `${ptsToNextTier.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts to ${nextTier.name}` : `${currentTier.name} — Max Tier`}
                  </span>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    {nextTier.name} {nextTier.emoji}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
                    className={`h-full rounded-full bg-gradient-to-r ${currentTier.color}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Free service progress */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-black text-gray-900 dark:text-white">Free Service Meter</span>
              </div>
              <span className="text-xs font-black text-gray-400">
                {(total % FREE_SERVICE_THRESHOLD).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {FREE_SERVICE_THRESHOLD.toLocaleString()} pts
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 1.8, ease: 'easeOut', delay: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500"
              />
            </div>
            {freeServices > 0 ? (
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                <BadgeCheck className="w-4 h-4" />
                🎉 {freeServices} free service{freeServices > 1 ? 's' : ''} available to redeem!
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 font-bold">
                {(FREE_SERVICE_THRESHOLD - (total % FREE_SERVICE_THRESHOLD)).toLocaleString(undefined, { maximumFractionDigits: 0 })} more points for your next free service
                · earning <span className="text-amber-500 font-black">{POINTS_PER_BOOKING} pts</span> per booking
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Points Earned"     value={total.toLocaleString(undefined, { maximumFractionDigits: 2 })} icon={Star}     gradient="from-amber-500 to-orange-600" delay={0.35} />
          <StatCard label="Pts / Booking"     value={`${POINTS_PER_BOOKING}`} sub="every booking"                     icon={Zap}      gradient="from-rose-500 to-pink-600"   delay={0.4}  />
          <StatCard label="Free Services"     value={freeServices || '—'} sub={`${FREE_SERVICE_THRESHOLD.toLocaleString()} pts each`} icon={Gift} gradient="from-purple-500 to-fuchsia-600" delay={0.45} />
          <StatCard label="Total Bookings"    value={history.length}  sub={`${bookingsCount}prop · ${servicesCount}svc`} icon={TrendingUp} gradient="from-slate-700 to-slate-900" delay={0.5} />
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-gray-950 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Earning rules */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-7 shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <TrendingUp className="text-rose-500 w-5 h-5" />
                  How to Earn
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Book a property',    pts: `+${POINTS_PER_BOOKING}`,  done: bookingsCount > 0, icon: '🏡' },
                    { label: 'Book a service',     pts: `+${POINTS_PER_BOOKING}`,  done: servicesCount > 0, icon: '🛠️' },
                    { label: 'Quick Book a helper',pts: `+${POINTS_PER_BOOKING}`,  done: servicesCount > 0, icon: '⚡' },
                    { label: 'Complete verification', pts: '+500',                 done: !!currentUser?.isVerified, icon: '✅' },
                    { label: 'Add profile photo',  pts: '+100',                    done: !!currentUser?.avatar, icon: '📸' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${item.done ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{item.icon}</span>
                        <span className={`font-bold text-sm ${item.done ? 'text-emerald-700' : 'text-gray-700 dark:text-white'}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.done ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="font-black text-rose-500 text-sm shrink-0">{item.pts} pts</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Free service milestone */}
              <div className="bg-gray-950 rounded-[2rem] p-7 shadow-2xl border border-gray-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />

                <h3 className="text-lg font-black mb-1 relative z-10 flex items-center gap-2">
                  <Gift className="text-amber-400 w-5 h-5" />
                  Free Service Milestone
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-white font-bold uppercase tracking-widest mb-6">
                  Redeem at {FREE_SERVICE_THRESHOLD.toLocaleString()} pts
                </p>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs font-black text-gray-300 uppercase tracking-wider">Points per booking</p>
                      <p className="text-3xl font-black text-amber-400 mt-0.5">{POINTS_PER_BOOKING}</p>
                    </div>
                    <Star className="w-8 h-8 text-amber-400/30" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs font-black text-gray-300 uppercase tracking-wider">Free service at</p>
                      <p className="text-3xl font-black text-rose-400 mt-0.5">{FREE_SERVICE_THRESHOLD.toLocaleString()}</p>
                    </div>
                    <Gift className="w-8 h-8 text-rose-400/30" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs font-black text-gray-300 uppercase tracking-wider">Bookings needed</p>
                      <p className="text-3xl font-black text-purple-400 mt-0.5">
                        {Math.ceil(FREE_SERVICE_THRESHOLD / POINTS_PER_BOOKING).toLocaleString()}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-400/30" />
                  </div>
                </div>

                <button
                  onClick={() => navigate('/search')}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-amber-400 to-rose-500 text-gray-950 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 relative z-10"
                >
                  Book Now to Earn
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] p-7 shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Clock className="text-rose-500 w-5 h-5" />
                Points History
              </h3>
              {history.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <span className="text-5xl mb-4">🌟</span>
                  <p className="font-black text-gray-700 dark:text-white text-lg mb-1">No points yet</p>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Make your first booking to start earning {POINTS_PER_BOOKING} pts!
                  </p>
                  <button
                    onClick={() => navigate('/search')}
                    className="mt-6 px-7 py-3.5 bg-gray-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                  >
                    Explore Listings
                  </button>
                </div>
              ) : (
                <div>
                  {history.map((entry, i) => (
                    <HistoryRow key={i} entry={entry} idx={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'perks' && (
            <motion.div
              key="perks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {perks.map((perk, i) => {
                const reqTierIdx = TIERS.findIndex(t => t.name === perk.reqTier);
                const curTierIdx = TIERS.findIndex(t => t.name === currentTier.name);
                const isUnlocked = curTierIdx >= reqTierIdx;
                const reqTierObj = TIERS[reqTierIdx];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-100'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <div className="text-2xl leading-none">{perk.emoji}</div>
                    <div className="flex-1">
                      <p className={`font-black text-sm ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white'}`}>
                        {perk.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{perk.desc}</p>
                    </div>
                    {isUnlocked ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{reqTierObj?.name}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
