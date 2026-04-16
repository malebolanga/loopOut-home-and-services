import React from 'react';
import { motion } from 'framer-motion';
import { BrandIcon } from './BrandLogo';

/**
 * NeuralLoader - The official premium loading state for the LoopOut platform.
 * Uses the brand emblem with a glass effect and tactical "Neural" aesthetics.
 */
const NeuralLoader = ({ 
  text = "Looping Out...", 
  fullScreen = false,
  className = "" 
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center" 
    : `flex flex-col items-center justify-center p-12 ${className}`;

  return (
    <div className={containerClasses}>
      {/* Animated Brand Pulse */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
          filter: ["blur(0px)", "blur(1px)", "blur(0px)"]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative mb-8"
      >
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        
        {/* Core Brand Emblem */}
        <div className="relative z-10 drop-shadow-[0_0_25px_rgba(255,56,92,0.4)]">
          <BrandIcon className="w-24 h-24 sm:w-32 sm:h-32" />
        </div>
      </motion.div>

      {/* Tactical Loading Text */}
      <div className="flex flex-col items-center">
        <motion.span 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm sm:text-base font-black text-rose-500 uppercase tracking-[0.6em] ml-[0.6em]"
        >
          {text}
        </motion.span>
        
        {/* HUD Data line */}
        <div className="mt-4 w-32 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500 to-transparent w-1/2"
          />
        </div>
      </div>
    </div>
  );
};

export default NeuralLoader;
