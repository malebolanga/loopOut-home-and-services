import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const CatalogDiscoveryStream = ({
  visibleCount,
  totalCount,
  categoryName,
  onLoadMore,
  onSearchClick
}) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (visibleCount >= totalCount) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            onLoadMore();
            setLoadingMore(false);
          }, 450);
        }
      },
      { rootMargin: '160px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [visibleCount, totalCount, loadingMore, onLoadMore]);

  const percentage = Math.min(100, Math.round((visibleCount / Math.max(1, totalCount)) * 100));

  if (totalCount === 0) return null;

  return (
    <div className="mt-8 mb-4 px-1">
      {visibleCount < totalCount ? (
        <div 
          ref={sentinelRef}
          onClick={() => {
            if (!loadingMore) {
              setLoadingMore(true);
              setTimeout(() => {
                onLoadMore();
                setLoadingMore(false);
              }, 250);
            }
          }}
          className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 border border-slate-200/80 dark:border-white/10 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
        >
          {/* Progress row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                {loadingMore ? `Discovering more ${categoryName}...` : `Showing ${visibleCount} of ${totalCount} ${categoryName}`}
              </span>
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
              {percentage}% explored
            </span>
          </div>

          {/* Progress bar track */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-700/60 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Auto-scroll prompt with animated indicator */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 dark:text-gray-400">
            {loadingMore ? (
              <div className="flex items-center gap-2 py-0.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                <span className="text-slate-600 dark:text-gray-300 font-bold">Revealing next listings...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600 animate-pulse" />
                <span>Scroll to reveal more automatically</span>
                <ChevronDown className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* All caught up state */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-2xl bg-slate-50/70 dark:bg-gray-900/60 border border-slate-200/60 dark:border-white/5 p-4 text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700 dark:text-gray-300">
            <span>✨</span>
            <span>You&apos;ve reached the end of {categoryName}</span>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
          <p className="text-[11px] text-slate-400 dark:text-gray-400">
            Showing all {totalCount} verified listings. Explore more categories below or search.
          </p>
          <button
            onClick={onSearchClick}
            className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <MagnifyingGlassIcon className="w-3 h-3 stroke-[2.5]" />
            <span>Search All LoopOut</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CatalogDiscoveryStream;
