import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export const CategoryFilterBar = ({
  tabs,
  activeTab,
  setActiveTab,
  activeSubcategory,
  setActiveSubcategory,
  currentCategoryObj,
  getSubcategoryCount,
  showAllCategories,
  setShowAllCategories,
  navigate,
  onTabChange
}) => {
  const hasActiveFilter = activeSubcategory !== 'all';

  const handleTabClick = (tab) => {
    if (tab.route) {
      navigate(tab.route);
      return;
    }
    if (activeTab !== tab.id) {
      if (onTabChange) onTabChange(tab.id);
      setActiveTab(tab.id);
      setActiveSubcategory('all');
    }
  };

  const handleSubcategoryClick = (subId) => {
    if (activeSubcategory !== subId) {
      if (onTabChange) onTabChange(activeTab, subId);
      setActiveSubcategory(subId);
    }
  };

  const handleClearAll = () => {
    setActiveSubcategory('all');
  };

  return (
    <>
      {/* Sticky Categories Bar with horizontal swipe & enlarged icons */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl py-3 mb-4 -mx-4 px-4 border-b border-gray-100/80 dark:border-gray-800/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] w-[calc(100%+2rem)]">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 snap-x snap-mandatory">
          {(showAllCategories ? tabs : tabs.filter(t => t.id === activeTab)).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                layout
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                whileTap={{ scale: 0.92 }}
                className="snap-start shrink-0 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none min-w-[54px] sm:min-w-[62px] py-0.5"
              >
                <motion.div
                  animate={isActive ? { scale: [1, 0.92, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={`w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${
                    isActive
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-lg shadow-slate-950/20 ring-2 ring-slate-950 dark:ring-white'
                      : 'bg-slate-50 dark:bg-gray-800 border border-slate-200/90 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <span className="text-xl sm:text-2xl leading-none select-none drop-shadow-sm">{tab.emoji}</span>
                </motion.div>
                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-1.5 leading-tight truncate w-full ${
                  isActive ? 'text-rose-600 font-extrabold' : (tab.textColor || 'text-slate-800 dark:text-gray-300')
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}

          {/* Toggle 'See more categories' button */}
          <motion.button
            layout
            onClick={() => setShowAllCategories(prev => !prev)}
            whileTap={{ scale: 0.92 }}
            className="snap-start shrink-0 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none min-w-[64px] sm:min-w-[72px] py-0.5"
          >
            <div className={`w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 shadow-2xs ${
              showAllCategories
                ? 'bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700'
                : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200/90 dark:border-rose-500/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20'
            }`}>
              {showAllCategories ? (
                <ChevronUp className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-1.5 leading-tight truncate w-full ${
              showAllCategories ? 'text-slate-700' : 'text-rose-600'
            }`}>
              {showAllCategories ? 'Hide icons' : 'See more'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Subcategory Pills + Clear-All pill */}
      {currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5 mb-5 -mx-4 px-4 snap-x">

          {/* ── Clear all pill (visible when a sub-filter is active) ── */}
          <AnimatePresence>
            {hasActiveFilter && (
              <motion.button
                key="clear-all"
                initial={{ opacity: 0, scale: 0.8, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                whileTap={{ scale: 0.93 }}
                onClick={handleClearAll}
                className="snap-start shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs font-black bg-rose-500 text-white shadow-md ring-2 ring-rose-400 cursor-pointer whitespace-nowrap overflow-hidden"
              >
                <X className="w-3 h-3 stroke-[3]" />
                <span>Clear all</span>
              </motion.button>
            )}
          </AnimatePresence>

          {currentCategoryObj.subcategories.map((sub) => {
            const isSubActive = activeSubcategory === sub.id;
            const count = getSubcategoryCount(activeTab, sub.id);
            return (
              <motion.button
                key={sub.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubcategoryClick(sub.id)}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${
                  isSubActive
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                <span className="text-sm">{sub.emoji}</span>
                <span className="whitespace-nowrap tracking-tight">{sub.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                  isSubActive ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 border border-slate-200'
                }`}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CategoryFilterBar;
