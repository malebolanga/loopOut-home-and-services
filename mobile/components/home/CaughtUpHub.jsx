import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { emoji: '🗺️', label: 'Planner', to: '/planner' },
  { emoji: '🔍', label: 'Search', to: '/search' },
  { emoji: '🎟️', label: 'Events', to: '/event-home-page' },
  { emoji: '🍱', label: 'Lunch', to: '/lunch' },
];

const FLOATS = ['🏡', '🛠️', '🎟️', '🧹', '💫', '⭐'];

const CaughtUpHub = () => {
  return (
    <div className="mt-10 mb-16 flex flex-col items-center text-center px-4">
      {/* Floating emoji strip */}
      <div className="flex items-center gap-2 mb-4 overflow-hidden">
        {FLOATS.map((em, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="text-xl select-none"
          >
            {em}
          </motion.span>
        ))}
      </div>

      {/* Main message */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-2"
      >
        <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] mb-1">
          You're all caught up
        </p>
        <h3 className="text-lg font-black text-gray-900 tracking-tight leading-snug">
          That's everything for now 🎉
        </h3>
        <p className="text-xs text-gray-400 font-medium mt-1 max-w-[240px] mx-auto leading-relaxed">
          Check back later for fresh listings and new opportunities near you.
        </p>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5 w-full max-w-xs">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Explore more</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Quick-access links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="flex items-center gap-3 mb-6 flex-wrap justify-center"
      >
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs font-black text-gray-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all active:scale-95"
          >
            <span>{link.emoji}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Back to top */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-rose-600 transition-all active:scale-95 border border-white/10"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        Back to top
      </motion.button>
    </div>
  );
};

CaughtUpHub.propTypes = {
  navigate: PropTypes.func,
  stats: PropTypes.object,
};

export default CaughtUpHub;
