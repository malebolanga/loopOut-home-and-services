import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';

export default function CategoriesBottomSheet({
  isOpen,
  onClose,
  tabs = [],
  activeTab,
  onSelectCategory,
  navigate
}) {
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
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
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
            className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-950 rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col touch-pan-y will-change-transform border-t border-slate-100 dark:border-gray-800"
          >
            {/* Mobile Drag Pill */}
            <div className="flex flex-col items-center justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none select-none">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  All Categories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Select a category to browse on loopOut
                </p>
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

            {/* Category Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon || Sparkles;

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
                        onSelectCategory?.(tab.id);
                        onClose();
                      }}
                      className={`relative flex flex-col items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 active:scale-95 text-left ${
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
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
