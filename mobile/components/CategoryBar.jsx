import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CategoryIcon = ({ type }) => {
  // Advanced 3D SVGs with lighting effects and depth
  const icons = {
    homes: (
      <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
        <defs>
          <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5A5F" />
            <stop offset="100%" stopColor="#D70466" />
          </linearGradient>
          <radialGradient id="homeHighlight" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path 
          d="M10 40 L50 10 L90 40 L90 85 L10 85 Z" 
          fill="url(#homeGrad)" 
        />
        <path 
          d="M10 40 L50 10 L90 40 L90 45 L50 15 L10 45 Z" 
          fill="black" opacity="0.1"
        />
        <rect x="40" y="55" width="20" height="30" fill="white" opacity="0.8" rx="2" />
        <circle cx="30" cy="30" r="40" fill="url(#homeHighlight)" />
      </svg>
    ),
    services: (
      <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
        <defs>
          <linearGradient id="serviceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <radialGradient id="serviceHighlight" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#serviceGrad)" />
        <circle cx="50" cy="50" r="40" fill="url(#serviceHighlight)" />
        <path d="M35 50 L45 60 L65 40" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    helpers: (
      <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
        <defs>
          <linearGradient id="helperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <radialGradient id="helperHighlight" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="35" r="20" fill="url(#helperGrad)" />
        <circle cx="50" cy="35" r="20" fill="url(#helperHighlight)" />
        <path d="M20 85 C20 60 80 60 80 85" fill="url(#helperGrad)" />
        <path d="M20 85 C20 65 80 65 80 85" fill="url(#helperHighlight)" />
      </svg>
    ),
    events: (
      <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
        <defs>
          <linearGradient id="eventGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <radialGradient id="eventHighlight" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M20 30 L80 30 L80 85 L20 85 Z" fill="url(#eventGrad)" />
        <path d="M20 30 L80 30 L80 35 L20 35 Z" fill="black" opacity="0.1" />
        <path d="M30 20 L30 40 M70 20 L70 40" stroke="white" strokeWidth="6" strokeLinecap="round" />
        <rect x="20" y="30" width="60" height="55" fill="url(#eventHighlight)" />
      </svg>
    )
  };
  return icons[type] || null;
};

const CategoryBar = () => {
  const navigate = useNavigate();
  const categories = [
    { id: 'homes', label: 'Homes', route: '/search?category=homes', icon: 'homes' },
    { id: 'services', label: 'Services', route: '/search?category=services', icon: 'services' },
    { id: 'helpers', label: 'Helpers', route: '/helper-home-page', icon: 'helpers' },
    { id: 'events', label: 'Events', route: '/search?category=events', icon: 'events' },
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur-xl sticky top-0 z-[60] border-b border-gray-100 shadow-sm overflow-x-auto scrollbar-hide py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-4 px-4 min-w-max">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: '#fff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(cat.route)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div 
              whileHover={{ rotateY: 180 }}
              transition={{ duration: 0.6 }}
              className="flex-shrink-0 relative z-10"
              style={{ perspective: '1000px' }}
            >
              <CategoryIcon type={cat.icon} />
            </motion.div>
            <span className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] relative z-10">{cat.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
