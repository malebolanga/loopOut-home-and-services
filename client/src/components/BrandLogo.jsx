import React from 'react';
import { motion } from 'framer-motion';

/**
 * BrandIcon renders the loopout logo SVG.
 */
export const BrandIcon = ({ className = "h-12 w-12", color = "url(#logoGradient)" }) => (
  <div className={`relative flex items-center justify-center ${className}`}> 
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full relative z-10 drop-shadow-md"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF385C" />
          <stop offset="50%" stopColor="#E61E4D" />
          <stop offset="100%" stopColor="#D70466" />
        </linearGradient>
      </defs>
      {/* 1. The Upside-Down Magnifying Glass Lens (The Base 'O') */}
      <motion.circle
        cx="60"
        cy="60"
        r="26"
        fill="rgba(255, 255, 255, 0.12)"
        stroke={color}
        strokeWidth="9"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      {/* 2. The Internal "Loop" - Smooth glowing spirals */}
      <motion.path
        d="M 60 60 C 46 40, 83 50, 60 76"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-70"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      />
      {/* 3. Decorative inner loop */}
      <motion.path
        d="M 46 60 C 46 48, 68 48, 68 60 C 68 72, 46 72, 46 60"
        stroke="#FF7A8F"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
      />
      {/* 4. The Classic Handle (Tail on the Top-Left Side) */}
      <motion.path
        d="M 42 42 L 18 18"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      />
      {/* 5. Inner Lens Shine */}
      <motion.circle
        cx="52"
        cy="52"
        r="5"
        fill="white"
        className="opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 1 }}
      />
    </svg>
  </div>
);

/**
 * BrandLogo combines the animated BrandIcon with optional gradient text.
 */
const BrandLogo = ({ className = "h-8 w-auto", showText = true, textColor = "text-[#222222]" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-3 ${className} select-none cursor-pointer`}
    >
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466] text-transparent bg-clip-text">
          Out
        </span>
      )}
    </motion.div>
  );
};

export default BrandLogo;
