import React from 'react';
import { motion } from 'framer-motion';

/**
 * 3D SVG Icon: Recent Added
 * Features multi-layered dimensional badge, rich gold star with depth,
 * specular radial glints, bevel lighting and cast shadows.
 */
export const RecentAdded3DIcon = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_6px_8px_rgba(225,29,72,0.35)]`}>
    <defs>
      <linearGradient id="recBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="35%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#9F1239" />
      </linearGradient>
      <linearGradient id="recStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <radialGradient id="recHighlight" cx="30%" cy="25%" r="55%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="recRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE4E6" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#881337" stopOpacity="0.6" />
      </linearGradient>
    </defs>

    {/* 3D Extrusion base shadow layer */}
    <rect x="12" y="18" width="76" height="70" rx="24" fill="#881337" />
    
    {/* 3D Bevel Rim */}
    <rect x="12" y="12" width="76" height="70" rx="24" fill="url(#recRimGrad)" />
    
    {/* Main Dimensional Pill Body */}
    <rect x="13" y="13" width="74" height="68" rx="23" fill="url(#recBadgeGrad)" />

    {/* Specular curved gloss sheen */}
    <path 
      d="M14 36 C14 23.5 24 13.5 36.5 13.5 L63.5 13.5 C76 13.5 86 23.5 86 36 C78 44 60 48 50 48 C40 48 22 44 14 36 Z" 
      fill="url(#recHighlight)" 
    />

    {/* 3D Star / Sparkle Shadow */}
    <path 
      d="M50 28 L55 42 L69 47 L55 52 L50 66 L45 52 L31 47 L45 42 Z" 
      fill="#4C0519" 
      opacity="0.35" 
      transform="translate(1, 2.5)" 
    />
    
    {/* 3D Star / Sparkle Body */}
    <path 
      d="M50 26 L55 40 L69 45 L55 50 L50 64 L45 50 L31 45 L45 40 Z" 
      fill="url(#recStarGrad)" 
      stroke="#FFFBEB" 
      strokeWidth="1" 
    />

    {/* Center 3D Gem Highlight */}
    <circle cx="50" cy="45" r="4.5" fill="#FFFFFF" opacity="0.95" />
    <circle cx="48.5" cy="43.5" r="1.5" fill="#FFFFFF" />

    {/* Top-Right Secondary Sparkle */}
    <path 
      d="M71 22 L73 28 L79 30 L73 32 L71 38 L69 32 L63 30 L69 28 Z" 
      fill="#FEF08A" 
      opacity="0.9"
    />
  </svg>
);

/**
 * 3D SVG Icon: More Categories
 * Features isometric 3D stacked app cubes with illuminated top faces,
 * shaded side extrusions, glossy specular glints and ambient shadows.
 */
export const MoreCategories3DIcon = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_6px_8px_rgba(79,70,229,0.35)]`}>
    <defs>
      {/* Indigo Cube */}
      <linearGradient id="cubeTopInd" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C7D2FE" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
      <linearGradient id="cubeLeftInd" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="cubeRightInd" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338CA" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>

      {/* Rose/Pink Hero Cube */}
      <linearGradient id="cubeTopRose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FECDD3" />
        <stop offset="100%" stopColor="#FB7185" />
      </linearGradient>
      <linearGradient id="cubeLeftRose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
      <linearGradient id="cubeRightRose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BE123C" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>

      {/* Amber/Gold Accent Cube */}
      <linearGradient id="cubeTopAmb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
      <linearGradient id="cubeLeftAmb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="cubeRightAmb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>

      <radialGradient id="cubeGloss" cx="30%" cy="30%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Drop shadows of cubes */}
    <ellipse cx="50" cy="85" rx="36" ry="8" fill="#1E1B4B" opacity="0.25" />

    {/* Top Center Hero Cube (Rose) */}
    <g transform="translate(0, -6)">
      {/* Top Face */}
      <polygon points="50,14 70,25 50,36 30,25" fill="url(#cubeTopRose)" />
      <polygon points="50,14 70,25 50,36 30,25" fill="url(#cubeGloss)" />
      {/* Left Face */}
      <polygon points="30,25 50,36 50,56 30,45" fill="url(#cubeLeftRose)" />
      {/* Right Face */}
      <polygon points="50,36 70,25 70,45 50,56" fill="url(#cubeRightRose)" />
      {/* Edges */}
      <line x1="30" y1="25" x2="50" y2="36" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1" />
      <line x1="50" y1="36" x2="70" y2="25" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1" />
    </g>

    {/* Bottom Left Cube (Indigo) */}
    <g transform="translate(-18, 22)">
      <polygon points="50,18 66,27 50,36 34,27" fill="url(#cubeTopInd)" />
      <polygon points="50,18 66,27 50,36 34,27" fill="url(#cubeGloss)" />
      <polygon points="34,27 50,36 50,52 34,43" fill="url(#cubeLeftInd)" />
      <polygon points="50,36 66,27 66,43 50,52" fill="url(#cubeRightInd)" />
    </g>

    {/* Bottom Right Cube (Amber) */}
    <g transform="translate(18, 22)">
      <polygon points="50,18 66,27 50,36 34,27" fill="url(#cubeTopAmb)" />
      <polygon points="50,18 66,27 50,36 34,27" fill="url(#cubeGloss)" />
      <polygon points="34,27 50,36 50,52 34,43" fill="url(#cubeLeftAmb)" />
      <polygon points="50,36 66,27 66,43 50,52" fill="url(#cubeRightAmb)" />
    </g>
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
