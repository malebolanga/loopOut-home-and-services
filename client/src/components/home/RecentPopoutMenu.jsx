import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  House,
  Wrench,
  HandHeart,
  CalendarDays,
  Tags,
  Check,
  X
} from 'lucide-react';

const RECENT_OPTIONS = [
  { id: 'all', label: 'All Recent', emoji: '✨', icon: Sparkles, desc: 'Default · All newly added listings' },
  { id: 'property', label: 'Property', emoji: '🏡', icon: House, desc: 'Rooms, stays & accommodation' },
  { id: 'service', label: 'Services', emoji: '🛠️', icon: Wrench, desc: 'Verified local pros & services' },
  { id: 'helper', label: 'Helper', emoji: '🧹', icon: HandHeart, desc: 'Domestic, tutors, beauty & care' },
  { id: 'event', label: 'Events', emoji: '🎟️', icon: CalendarDays, desc: 'Upcoming events & shows' },
  { id: 'selling', label: 'Item for Sale', emoji: '🏷️', icon: Tags, desc: 'Marketplace goods & deals' },
];

export default function RecentPopoutMenu({
  isOpen,
  onClose,
  activeSubcategory = 'all',
  onSelect,
  recentlyAddedItems = [],
  isDesktop = false
}) {
  const menuRef = useRef(null);

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
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getItemCount = (id) => {
    if (!recentlyAddedItems || recentlyAddedItems.length === 0) return 0;
    if (id === 'all') return recentlyAddedItems.length;
    return recentlyAddedItems.filter((item) => {
      const type = item.itemType === 'listing' ? 'property' : (item.itemType || '');
      return type === id;
    }).length;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="recent-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          {/* Feather-in bottom sheet card */}
          <motion.div
            key="recent-sheet-content"
            ref={menuRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240, mass: 0.85 }}
            drag="y"
            dragDirectionLock={true}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.08, bottom: 0.7 }}
            dragSnapToOrigin={true}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 90 || info.velocity.y > 350) {
                onClose?.();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-950 rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col touch-pan-y will-change-transform border-t border-slate-100 dark:border-gray-800 text-left"
          >
            {/* Mobile Drag Pill Handle */}
            <div className="flex flex-col items-center justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none select-none">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-base">
                  ✨
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Recent Filter
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Filter newly added listings by category
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 transition-colors"
                aria-label="Take down"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-3 sm:p-4 space-y-1.5 overflow-y-auto max-h-[calc(85vh-130px)] pb-8 sm:pb-4">
              {RECENT_OPTIONS.map((opt) => {
                const isSelected = activeSubcategory === opt.id;
                const count = getItemCount(opt.id);

                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect?.(opt.id);
                      onClose?.();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-50/70 dark:bg-gray-900/60 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white dark:bg-gray-800 shadow-2xs'
                        }`}
                      >
                        <span className="leading-none">{opt.emoji}</span>
                      </div>
                      <div className="text-left flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm font-black tracking-tight ${
                              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {opt.label}
                          </span>
                          {opt.id === 'all' && (
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                              }`}
                            >
                              Default
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] leading-tight break-words ${
                            isSelected ? 'text-white/90' : 'text-slate-400 dark:text-gray-500 font-medium'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-2 shrink-0">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white text-rose-600'
                            : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 border border-slate-200/60 dark:border-gray-700'
                        }`}
                      >
                        {count}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </div>
                  </motion.button>
                );
              })}

              {/* Reset to Default if filtered */}
              {activeSubcategory !== 'all' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect?.('all');
                      onClose?.();
                    }}
                    className="w-full py-2.5 text-center text-xs font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors bg-rose-50/60 dark:bg-rose-950/20 rounded-xl"
                  >
                    Reset to All Recent Listings
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
