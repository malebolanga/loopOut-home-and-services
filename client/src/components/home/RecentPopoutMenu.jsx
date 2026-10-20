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

  // Esc key and click outside listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
        <>
          {/* Backdrop on mobile for easy dismissal */}
          <motion.div
            key="recent-popout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] sm:bg-transparent"
            onClick={onClose}
          />

          {/* Floating Popout Menu */}
          <motion.div
            key="recent-popout-card"
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md z-50 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2.5 sm:p-3 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Recent Filter
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Filter newly added listings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 text-slate-600 dark:text-gray-300 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-1">
              {RECENT_OPTIONS.map((opt) => {
                const isSelected = activeSubcategory === opt.id;
                const count = getItemCount(opt.id);
                const IconComponent = opt.icon;

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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-50/70 dark:bg-gray-900/60 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white dark:bg-gray-800 shadow-2xs'
                        }`}
                      >
                        <span className="text-base leading-none">{opt.emoji}</span>
                      </div>
                      <div className="text-left truncate">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black tracking-tight ${
                              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {opt.label}
                          </span>
                          {opt.id === 'all' && (
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
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
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-gray-500 font-medium'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-2 shrink-0">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
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
            </div>

            {/* Reset to Default if filtered */}
            {activeSubcategory !== 'all' && (
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    onSelect?.('all');
                    onClose?.();
                  }}
                  className="w-full py-1.5 text-center text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Reset to All Recent Listings
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
