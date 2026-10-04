import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, TrendingUp, RotateCcw } from 'lucide-react';
import { AirbnbCard, AirbnbCardSkeleton } from './AirbnbCard';

// Nearby region suggestions shown in zero-results state
const NEARBY_REGIONS = [
  { label: 'Gauteng', emoji: '🏙️' },
  { label: 'Limpopo', emoji: '🌿' },
  { label: 'Mpumalanga', emoji: '🌄' },
  { label: 'North West', emoji: '🏞️' },
];

// Popular categories to surface when a sub-category yields no results
const POPULAR_CATEGORIES = [
  { emoji: '🏡', label: 'Properties', id: 'Property' },
  { emoji: '🧹', label: 'Cleaning', id: 'Services' },
  { emoji: '🤝', label: 'Helpers', id: 'Helper' },
  { emoji: '🎉', label: 'Events', id: 'Events' },
  { emoji: '🛍️', label: 'Marketplace', id: 'Selling' },
];

export const ExploreFeedGrid = ({
  filteredItems,
  visibleCount,
  activeTab,
  activeSubcategory,
  isLoadingCurrentTab,
  currentCategoryObj,
  setActiveSubcategory,
  setActiveTab,
  navigate,
}) => {
  // Skeleton transition state to prevent sudden layout jumps when switching tabs
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);

  useEffect(() => {
    setIsSwitchingTab(true);
    const timer = setTimeout(() => {
      setIsSwitchingTab(false);
    }, 220); // Smooth 220ms skeleton transition on tab/subcategory switch

    return () => clearTimeout(timer);
  }, [activeTab, activeSubcategory]);

  const showSkeletons = isLoadingCurrentTab || isSwitchingTab;
  const isEmpty = !showSkeletons && filteredItems.length === 0;
  const hasSubcategoryFilter = activeSubcategory !== 'all';

  const getItemType = (item) => {
    if (activeTab === 'Helper' || activeTab === 'Helpers') return 'helper';
    if (activeTab === 'Services') return 'service';
    if (activeTab === 'Events') return 'event';
    if (activeTab === 'Selling' || activeTab === 'Sell' || activeTab === 'Marketplace') return 'selling';
    return (item.itemType === 'listing' ? 'property' : item.itemType) || 'property';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeTab}-${activeSubcategory}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {/* Listing Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {showSkeletons ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <AirbnbCardSkeleton key={`skeleton-${activeTab}-${idx}`} />
            ))
          ) : (
            filteredItems.slice(0, visibleCount).map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(idx * 0.025, 0.2) }}
              >
                <AirbnbCard
                  item={item}
                  type={getItemType(item)}
                  onClick={(path) => navigate(path)}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* ── ZERO-RESULTS STATE ── */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-10 my-4"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm">
              <span className="text-3xl">{currentCategoryObj?.emoji || '🔍'}</span>
            </div>

            <h3 className="text-[15px] font-black text-slate-800 dark:text-gray-100 mb-1">
              Nothing here yet
              {hasSubcategoryFilter && (
                <span className="text-rose-500">
                  {' '}in {activeSubcategory.replace(/_/g, ' ')}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 max-w-xs mb-6">
              {hasSubcategoryFilter
                ? `No listings match this filter yet. Try a different subcategory or browse all ${activeTab}.`
                : `No ${activeTab} listings found in this area. Try a nearby region or explore another category.`}
            </p>

            {/* ── Reset filter pill ── shown when a subcategory is active */}
            {hasSubcategoryFilter && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSubcategory('all')}
                className="inline-flex items-center gap-1.5 mb-6 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Show all {activeTab}
              </motion.button>
            )}

            {/* ── Popular nearby categories ── */}
            <div className="w-full max-w-sm mb-6">
              <div className="flex items-center gap-1.5 mb-3 justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                  Popular categories
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_CATEGORIES.filter(c => c.id !== activeTab).map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      if (setActiveTab) setActiveTab(cat.id);
                      setActiveSubcategory('all');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Try a nearby region ── */}
            <div className="w-full max-w-sm">
              <div className="flex items-center gap-1.5 mb-3 justify-center">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                  Try searching in
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {NEARBY_REGIONS.map((region) => (
                  <motion.button
                    key={region.label}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(activeTab)}&location=${encodeURIComponent(region.label)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 shadow-xs transition-all cursor-pointer"
                  >
                    <span>{region.emoji}</span>
                    <span>{region.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Global search CTA */}
              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[11px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Search all of LoopOut
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ExploreFeedGrid;
