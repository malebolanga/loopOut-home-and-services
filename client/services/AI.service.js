/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { FiUser } from 'react-icons/fi';

const AI = {
  // Color scheme generation
  generateColorScheme(userPreference) {
    const defaultColors = {
      headerBg: '#ffffff',
      logo: '#1f2937',
      icon: '#4b5563',
      text: '#1f2937',
      accent: '#ef4444',
      menuBg: '#ffffff'
    };
    return defaultColors;
  },

  // Menu prioritization
  prioritizeMenuItems(items) {
    return [...items].sort((a, b) => {
      const priority = {
        'for-rent': 4,
        'for-sale': 3,
        'overnight': 2,
        'office-space': 1,
        'land': 0
      };
      return priority[b.path] - priority[a.path];
    });
  },

  // Components
  MenuIcon: ({ color }) => (
    <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),

  SmartAvatar: ({ src, className }) => (
    src ? 
    <img src={src} className={className} alt="Profile" /> :
    <div className={`${className} bg-gray-100 flex items-center justify-center`}>
      <FiUser className="w-4 h-4 text-gray-500" />
    </div>
  ),

  RecommendationBadge: () => (
    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
      AI Pick
    </span>
  ),

  // Throttle implementation
  throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }
};

// Prop type validations
AI.MenuIcon.propTypes = {
  color: PropTypes.string
};

AI.SmartAvatar.propTypes = {
  src: PropTypes.string,
  className: PropTypes.string.isRequired
};

AI.RecommendationBadge.propTypes = {
  userId: PropTypes.string
};

export default AI;