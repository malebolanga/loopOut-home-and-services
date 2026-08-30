import React, { useEffect, useState } from 'react';
import { FaBolt, FaStar, FaUserCheck, FaMapMarkerAlt } from 'react-icons/fa';

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

  const cards = [
    stats?.verifiedHosts?.value && { icon: <FaUserCheck className="text-blue-500" />, label: 'Verified providers', value: stats.verifiedHosts.value },
    stats?.avgRating?.value && { icon: <FaStar className="text-amber-500" />, label: 'Average rating', value: stats.avgRating.value },
    stats?.totalUsers?.value && { icon: <FaMapMarkerAlt className="text-rose-500" />, label: 'LoopOut community', value: stats.totalUsers.value },
  ].filter(Boolean);

  if (!stats && !error) return <div className="w-full py-4"><div className="h-16 rounded-2xl bg-gray-100 animate-pulse" /></div>;

  return (
    <section aria-label="Live LoopOut activity" className="w-full py-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" /></span>
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">Live Pulse</span>
        {updatedAt && <span className="text-[10px] text-gray-400">Updated just now</span>}
      </div>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map((card) => (
            <div key={card.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">{card.icon}</div>
              <div className="min-w-0"><div className="text-base font-black text-gray-900 truncate">{card.value}</div><div className="text-[11px] text-gray-500 truncate">{card.label}</div></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600"><FaBolt className="text-rose-500" /> LoopOut activity is updating. Check back shortly.</div>
      )}
    </section>
  );
};

export default LoopOutPulse;
