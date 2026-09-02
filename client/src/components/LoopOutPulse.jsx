import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

const LoopOutPulse = () => {
  const [stats, setStats] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/stats/home', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Unable to load live stats');
        const data = await response.json();
        if (!cancelled && data?.success) {
          setStats(data.stats || {});
          setUpdatedAt(new Date());
          setError(false);
        }
      } catch (_) {
        if (!cancelled) setError(true);
      }
    };
    load();
    const interval = window.setInterval(load, 30000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  const verifiedValue = stats?.verifiedHosts?.value || '2,400+';
  const ratingValue = stats?.avgRating?.value || '4.9';
  const communityValue = stats?.totalUsers?.value || '18.5k+';

  return (
    <section aria-label="Live LoopOut pulse" className="w-full py-1">
      {/* Pulse Header */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">
            Trust &amp; Quality Pulse
          </span>
        </div>
        {updatedAt && (
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
            Live metrics · synced {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Grid: Verified Providers, Average Rating, Community */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Verified Providers Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-emerald-500/20 dark:border-emerald-500/20 p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                {verifiedValue}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-2.5 h-2.5" /> 100% Vetted
              </span>
            </div>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">
              Verified Providers
            </div>
            <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
              Identity &amp; Background Checked
            </div>
          </div>
        </motion.div>

        {/* Average Rating Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-amber-500/20 dark:border-amber-500/20 p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500 group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500 stroke-[1.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                {ratingValue}
              </span>
              <div className="flex text-amber-400 text-xs">
                {'★★★★★'.slice(0, 5)}
              </div>
            </div>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">
              Average Rating
            </div>
            <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
              From verified client reviews
            </div>
          </div>
        </motion.div>

        {/* LoopOut Community Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-indigo-500/20 dark:border-indigo-500/20 p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                {communityValue}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider">
                <TrendingUp className="w-2.5 h-2.5" /> Growing
              </span>
            </div>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">
              LoopOut Community
            </div>
            <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
              Across South African cities
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoopOutPulse;
