import React from 'react';
import PropTypes from 'prop-types';

const AILoadMore = ({ visibleCount, totalCount, onLoadMore }) => {
  const progress = Math.min((visibleCount / totalCount) * 100, 100);
  const remaining = totalCount - visibleCount;
  const estimatedLoadTime = Math.min(remaining * 50, 3000); // AI time estimation

  return (
    <div className="flex flex-col items-center mt-8 space-y-4">
      <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5">
        <div 
          className="bg-airbnb-red h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-sm text-gray-600 text-center">
        <p>
          Showing {visibleCount} of {totalCount} properties •{' '}
          <span className="text-airbnb-red font-medium">
            AI Prediction: {Math.min(remaining, 12)} more relevant matches
          </span>
        </p>
        <p className="text-xs mt-1">
          Estimated load time: {Math.round(estimatedLoadTime / 1000)}s
        </p>
      </div>

      {remaining > 0 && (
        <button
          onClick={onLoadMore}
          className="bg-airbnb-red text-white px-6 py-3 rounded-xl hover:bg-red-600 
                     transition-all duration-300 transform hover:scale-105 focus:outline-none
                     focus:ring-2 focus:ring-airbnb-red focus:ring-opacity-50"
        >
          Load {Math.min(remaining, 12)} More Properties
          <span className="ml-2">⤵</span>
        </button>
      )}
    </div>
  );
};

AILoadMore.propTypes = {
  visibleCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onLoadMore: PropTypes.func.isRequired
};

export default AILoadMore;
