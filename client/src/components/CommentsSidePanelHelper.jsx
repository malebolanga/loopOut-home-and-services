import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import HelperComments from './HelperComments';
import { FaChevronDown, FaChevronUp,  } from 'react-icons/fa';

const CommentsSidePanel = ({ helperId, onClose, onTotalComments, onRatingsChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  // Trigger slide-in animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };


  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointerEvents: isClosing ? 'none' : 'auto'
      }}
      onClick={handleClose}
    >
      <div 
        className={`w-full max-w-md h-full bg-white overflow-y-auto p-6 transform transition-transform duration-300 ease-in-out ${
          isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Reviews</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
            aria-label="Close panel"
          >
            &times;
          </button>
        </div>
        
        {/* Toggle button for summary */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showSummary ? 'Hide Summary' : 'Show Summary'}
            {showSummary ? (
              <FaChevronUp className="ml-1 text-xs" />
            ) : (
              <FaChevronDown className="ml-1 text-xs" />
            )}
          </button>
        </div>
        
        {/* Comments with card styling - show all comments without limit */}
        <HelperComments 
          helperId={helperId} 
          showSummary={showSummary}
          cardStyle={true}
          maxComments={0} // 0 means no limit - show all comments
          onTotalComments={onTotalComments}
          onRatingsChange={onRatingsChange}
        />
      </div>
    </div>
  );
};

export default CommentsSidePanel;