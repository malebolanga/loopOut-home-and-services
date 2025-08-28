// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaBrain, FaFilter } from 'react-icons/fa';

const AISmartFilter = ({ currentFilters, marketInsights, onUpdate }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // AI-generated filter suggestions based on market insights
    const aiSuggestions = generateAISuggestions(currentFilters, marketInsights);
    setSuggestions(aiSuggestions);
  }, [currentFilters, marketInsights]);

  const generateAISuggestions = () => {
    // Example AI logic - replace with actual implementation
    return [
      { type: 'price', value: 'under-avg', label: 'Below Market Average' },
      { type: 'amenity', value: 'parking', label: 'With Parking' },
      { type: 'type', value: 'trending', label: 'Trending Properties' }
    ];
  };

  return (
    <div className="ai-smart-filter bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-3 text-airbnb-red">
        <FaBrain className="mr-2" />
        <h4 className="font-semibold">AI Filter Suggestions</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onUpdate(suggestion)}
            className="flex items-center px-3 py-1.5 bg-airbnb-50 rounded-full text-sm 
                       hover:bg-airbnb-100 transition-colors"
          >
            <FaFilter className="mr-2 text-xs opacity-70" />
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
};

AISmartFilter.propTypes = {
  currentFilters: PropTypes.object.isRequired,
  marketInsights: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default AISmartFilter;
