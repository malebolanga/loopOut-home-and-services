import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { isAndroidApp } from '../../utils/nativeApp';

const CaughtUpHub = () => {
  if (isAndroidApp()) {
    return null;
  }

  return (
    <div className="flex justify-center items-center py-8">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold tracking-wide shadow-sm hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white transition-all active:scale-95 border border-slate-200/50 dark:border-white/10"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        <span>Back to top</span>
      </motion.button>
    </div>
  );
};

CaughtUpHub.propTypes = {
  navigate: PropTypes.func,
  stats: PropTypes.object,
};

export default CaughtUpHub;
