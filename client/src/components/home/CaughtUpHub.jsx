import React from 'react';
import PropTypes from 'prop-types';

const CaughtUpHub = () => {
  return (
    <div className="flex justify-center mt-6 mb-8">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200/60 dark:border-white/5"
      >
        Back to top
      </button>
    </div>
  );
};

CaughtUpHub.propTypes = {
  navigate: PropTypes.func,
  stats: PropTypes.object
};

export default CaughtUpHub;
