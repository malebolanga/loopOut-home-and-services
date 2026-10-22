import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function CategoriesBottomSheet({
  isOpen,
  onClose,
  tabs = [],
  activeTab,
  activeSubcategory = 'all',
  onSelectCategory,
  navigate
}) {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(null);

  // Reset drill-down when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategoryTab(null);
    }
  }, [isOpen]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedCategoryTab) {
          setSelectedCategoryTab(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedCategoryTab, onClose]);

  // Tabs that have drill-down subcategories
  const categoriesWithSubcategories = tabs.filter(
    (t) => t.subcategories && t.subcategories.length > 0 && t.id !== 'RecentAdded' && t.id !== 'Recent'
  );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="categories-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            key="categories-sheet-content"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.85 }}
            drag="y"
            dragDirectionLock={true}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.08, bottom: 0.7 }}
            dragSnapToOrigin={true}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 90 || info.velocity.y > 350) {
                onClose();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-950 rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col touch-pan-y will-change-transform border-t border-slate-100 dark:border-gray-800"
          >
            {/* Mobile Drag Pill */}
            <div className="flex flex-col items-center justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none select-none">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {selectedCategoryTab && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTab(null)}
                    aria-label="Back to categories"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {selectedCategoryTab ? (
                      <>
                        <span>{selectedCategoryTab.emoji || '📂'}</span>
                        <span>Types of {selectedCategoryTab.label}</span>
                      </>
                    ) : (
                      'All Categories'
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedCategoryTab
                      ? `Select a ${selectedCategoryTab.label.toLowerCase()} type to explore`
                      : 'Select a category to browse on loopOut'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close categories"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* If a category is drilled down, show quick category-switching pills */}
            {selectedCategoryTab && (
              <div className="px-6 py-2 bg-slate-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {categoriesWithSubcategories.map((cat) => {
                  const isCurrent = selectedCategoryTab.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryTab(cat)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 border border-slate-200/60 dark:border-gray-700'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Content View */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {selectedCategoryTab ? (
                  /* ── SUB-LEVEL: TYPES OF SELECTED CATEGORY ── */
                  <motion.div
                    key={`subcategories-${selectedCategoryTab.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedCategoryTab.subcategories?.map((sub) => {
                        const isSubActive =
                          activeTab === selectedCategoryTab.id && activeSubcategory === sub.id;

                        return (
                          <motion.button
                            key={sub.id}
                            type="button"
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              onSelectCategory?.(selectedCategoryTab.id, sub.id);
                              onClose();
                            }}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                              isSubActive
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-md ring-2 ring-slate-900 dark:ring-white'
                                : 'bg-slate-50/90 dark:bg-gray-900/80 hover:bg-slate-100 dark:hover:bg-gray-800 border-slate-200/80 dark:border-gray-800 text-slate-800 dark:text-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                  isSubActive
                                    ? 'bg-white/20 dark:bg-slate-900/10'
                                    : 'bg-white dark:bg-gray-800 shadow-2xs'
                                }`}
                              >
                                <span>{sub.emoji || '✨'}</span>
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`block text-xs font-black tracking-tight ${
                                    isSubActive
                                      ? 'text-white dark:text-slate-950'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {sub.label}
                                </span>
                                {sub.desc && (
                                  <span
                                    className={`block text-[10px] font-medium truncate ${
                                      isSubActive
                                        ? 'text-white/80 dark:text-slate-950/70'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    {sub.desc}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pl-2 shrink-0">
                              {isSubActive ? (
                                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                                  <CheckIcon className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  /* ── TOP-LEVEL: ALL CATEGORIES GRID ── */
                  <motion.div
                    key="top-categories"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const TabIcon = tab.icon || Sparkles;
                        const hasSub = tab.subcategories && tab.subcategories.length > 0 && tab.id !== 'RecentAdded' && tab.id !== 'Recent';

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              if (tab.route) {
                                onClose();
                                navigate?.(tab.route);
                                return;
                              }
                              // If it has subcategories, drill down into types!
                              if (hasSub) {
                                setSelectedCategoryTab(tab);
                                return;
                              }
                              onSelectCategory?.(tab.id, 'all');
                              onClose();
                            }}
                            className={`group relative flex flex-col items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 active:scale-95 text-left cursor-pointer ${
                              isActive
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-lg shadow-slate-950/15 ring-2 ring-slate-900 dark:ring-white'
                                : 'bg-slate-50/80 dark:bg-gray-900/80 hover:bg-slate-100 dark:hover:bg-gray-800 border-slate-200/80 dark:border-gray-800'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                                <CheckIcon className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                                isActive
                                  ? 'bg-white/10 dark:bg-slate-950/10 text-white dark:text-slate-950'
                                  : `${tab.bgColor || 'bg-slate-100'} bg-opacity-15 dark:bg-opacity-20`
                              }`}
                            >
                              <TabIcon
                                className={`w-6 h-6 ${
                                  isActive
                                    ? 'text-rose-400 dark:text-rose-500'
                                    : tab.textColor || 'text-slate-700'
                                }`}
                              />
                            </div>

                            <span
                              className={`text-xs font-black uppercase tracking-wider leading-tight text-center ${
                                isActive
                                  ? 'text-white dark:text-slate-950'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {tab.label}
                            </span>
                            {tab.desc && (
                              <span
                                className={`text-[10px] font-medium mt-0.5 text-center line-clamp-1 ${
                                  isActive
                                    ? 'text-white/70 dark:text-slate-950/70'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {tab.desc}
                              </span>
                            )}
                            {hasSub && (
                              <span className="mt-1.5 text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest flex items-center gap-0.5">
                                <span>View Types</span>
                                <ChevronRight className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
