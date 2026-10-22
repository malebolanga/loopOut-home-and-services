import React from 'react';
import { motion } from 'framer-motion';

/** Clear clock-and-plus symbol for recently added listings. */
export const RecentAdded3DIcon = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 48 48" className={`${className} text-rose-600`} fill="none" aria-hidden="true">
    <circle cx="21" cy="24" r="16" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />
    <path d="M21 14v10l7 4" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="35" cy="34" r="9" fill="#E11D48" stroke="white" strokeWidth="2" />
    <path d="M35 30v8M31 34h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Familiar grid symbol for browsing all categories. */
export const MoreCategories3DIcon = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 48 48" className={`${className} text-indigo-600`} fill="none" aria-hidden="true">
    <rect x="5" y="5" width="38" height="38" rx="12" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
    <rect x="12" y="12" width="9" height="9" rx="2.5" fill="#4F46E5" />
    <rect x="27" y="12" width="9" height="9" rx="2.5" fill="#818CF8" />
    <rect x="12" y="27" width="9" height="9" rx="2.5" fill="#818CF8" />
    <rect x="27" y="27" width="9" height="9" rx="2.5" fill="#4F46E5" />
  </svg>
);

/**
 * 3D SVG Icons for specific category types (Homes, Services, Helpers, Events, etc.)
 */
export const Category3DIcon = ({ type, className = "w-7 h-7" }) => {
  switch (type) {
    case 'Property':
    case 'Properties':
    case 'homes':
      return (
        <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_6px_8px_rgba(244,63,94,0.35)]`}>
          <defs>
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FECDD3" />
            </linearGradient>
            <radialGradient id="houseShine" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Base Shadow */}
          <ellipse cx="50" cy="88" rx="36" ry="7" fill="#881337" opacity="0.25" />
          {/* Wall base with thickness */}
          <path d="M22 46 L78 46 L78 84 L22 84 Z" fill="#9F1239" />
          <path d="M22 42 L78 42 L78 80 L22 80 Z" fill="url(#wallGrad)" />
          {/* Door */}
          <rect x="42" y="54" width="16" height="26" rx="4" fill="#E11D48" />
          <circle cx="53" cy="68" r="1.5" fill="#FFE4E6" />
          {/* Windows */}
          <rect x="28" y="52" width="10" height="10" rx="2" fill="#E11D48" opacity="0.4" />
          <rect x="62" y="52" width="10" height="10" rx="2" fill="#E11D48" opacity="0.4" />
          {/* 3D Roof with overhang */}
          <polygon points="50,14 88,44 78,44 50,22 22,44 12,44" fill="#881337" transform="translate(0, 4)" />
          <polygon points="50,14 88,44 12,44" fill="url(#roofGrad)" />
          <polygon points="50,14 88,44 12,44" fill="url(#houseShine)" />
        </svg>
      );

    case 'Services':
    case 'services':
      return (
        <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_6px_8px_rgba(59,130,246,0.35)]`}>
          <defs>
            <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <radialGradient id="gearHighlight" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* 3D Orb/Shield Base */}
          <circle cx="50" cy="54" r="38" fill="#1E3A8A" />
          <circle cx="50" cy="48" r="38" fill="url(#gearGrad)" />
          <circle cx="50" cy="48" r="38" fill="url(#gearHighlight)" />
          {/* Wrench / Tool mark */}
          <path 
            d="M32 64 L54 42 M54 42 L64 32 C68 28 74 30 76 34 C78 38 76 44 72 48 L62 58 M44 52 L36 60 C33 63 29 63 27 61 C25 59 25 55 28 52 L36 44" 
            stroke="#FFFFFF" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
        </svg>
      );

    case 'Helper':
    case 'Helpers':
    case 'helpers':
      return (
        <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_6px_8px_rgba(16,185,129,0.35)]`}>
          <defs>
            <linearGradient id="helpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <radialGradient id="helpHighlight" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* 3D Base */}
          <circle cx="50" cy="54" r="38" fill="#064E3B" />
          <circle cx="50" cy="48" r="38" fill="url(#helpGrad)" />
          <circle cx="50" cy="48" r="38" fill="url(#helpHighlight)" />
          {/* Friendly Helper Figure */}
          <circle cx="50" cy="36" r="12" fill="#FFFFFF" />
          <path d="M28 72 C28 56 72 56 72 72" fill="#FFFFFF" />
        </svg>
      );

    case 'Events':
    case 'events':
      return (
        <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_6px_8px_rgba(245,158,11,0.35)]`}>
          <defs>
            <linearGradient id="eventGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <radialGradient id="eventHighlight" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="18" y="26" width="64" height="56" rx="14" fill="#78350F" />
          <rect x="18" y="20" width="64" height="56" rx="14" fill="url(#eventGrad)" />
          <rect x="18" y="20" width="64" height="56" rx="14" fill="url(#eventHighlight)" />
          {/* Ticket perforations */}
          <circle cx="18" cy="48" r="6" fill="#FFFFFF" />
          <circle cx="82" cy="48" r="6" fill="#FFFFFF" />
          <line x1="30" y1="48" x2="70" y2="48" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="5,4" />
          {/* Star in ticket */}
          <polygon points="50,30 53,38 61,39 55,44 57,52 50,47 43,52 45,44 39,39 47,38" fill="#FFFFFF" />
        </svg>
      );

    default:
      return null;
  }
};

/**
 * 3D Physical Button Wrapper
 * Gives buttons a tangible, tactile, beveled 3D look with physical depression on press
 */
export const ThreeDButton = ({
  children,
  onClick,
  isActive = false,
  variant = 'rose', // 'rose', 'indigo', 'amber', 'slate'
  className = '',
  ariaLabel,
}) => {
  const variantStyles = {
    rose: isActive
      ? 'bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 text-white border-t border-rose-300/60 shadow-[0_5px_0_0_#9f1239,0_10px_20px_-3px_rgba(225,29,72,0.4)] active:shadow-[0_1px_0_0_#9f1239]'
      : 'bg-gradient-to-b from-white via-rose-50/50 to-rose-50/90 text-rose-950 border border-rose-200/90 shadow-[0_4px_0_0_#fecdd3,0_8px_16px_rgba(244,63,94,0.12)] active:shadow-[0_1px_0_0_#fecdd3]',
    indigo: isActive
      ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white border-t border-indigo-300/60 shadow-[0_5px_0_0_#3730a3,0_10px_20px_-3px_rgba(79,70,229,0.4)] active:shadow-[0_1px_0_0_#3730a3]'
      : 'bg-gradient-to-b from-white via-indigo-50/50 to-indigo-50/90 text-indigo-950 border border-indigo-200/90 shadow-[0_4px_0_0_#c7d2fe,0_8px_16px_rgba(99,102,241,0.15)] active:shadow-[0_1px_0_0_#c7d2fe]',
    amber: isActive
      ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-white border-t border-amber-200/60 shadow-[0_5px_0_0_#b45309,0_10px_20px_-3px_rgba(245,158,11,0.4)] active:shadow-[0_1px_0_0_#b45309]'
      : 'bg-gradient-to-b from-white via-amber-50/50 to-amber-50/90 text-amber-950 border border-amber-200/90 shadow-[0_4px_0_0_#fde68a,0_8px_16px_rgba(245,158,11,0.15)] active:shadow-[0_1px_0_0_#fde68a]',
    slate: isActive
      ? 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-white border-t border-slate-500/60 shadow-[0_5px_0_0_#0f172a,0_10px_20px_-3px_rgba(15,23,42,0.4)] active:shadow-[0_1px_0_0_#0f172a]'
      : 'bg-gradient-to-b from-white via-slate-50/50 to-slate-100 text-slate-900 border border-slate-200/90 shadow-[0_4px_0_0_#cbd5e1,0_8px_16px_rgba(15,23,42,0.08)] active:shadow-[0_1px_0_0_#cbd5e1]'
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ y: 3, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`relative inline-flex items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-150 ${variantStyles[variant] || variantStyles.rose} ${className}`}
    >
      {/* Specular gloss top highlight */}
      <span className="absolute inset-x-2 top-0.5 h-2 bg-gradient-to-b from-white/60 to-transparent rounded-t-xl pointer-events-none" />
      {children}
    </motion.button>
  );
};
