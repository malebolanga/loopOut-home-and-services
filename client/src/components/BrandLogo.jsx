import React from 'react';
import { motion } from 'framer-motion';

export const BrandIcon = ({ className = "h-12 w-12", color = "url(#logoGradient)" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full relative z-10 drop-shadow-sm"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E61E4D" />
                        <stop offset="100%" stopColor="#D70466" />
                    </linearGradient>
                </defs>

                {/* Magnifying Glass Lens (The Big O) */}
                <motion.circle
                    cx="20"
                    cy="18"
                    r="12"
                    stroke={color}
                    strokeWidth="4.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />

                {/* Inner Lens Shine */}
                <motion.circle
                    cx="16"
                    cy="14"
                    r="3"
                    fill="white"
                    className="opacity-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 1 }}
                />

                {/* Magnifying Glass Handle */}
                <motion.path
                    d="M29 27L38 36"
                    stroke={color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "backOut" }}
                />

                {/* Subtle Loop Accent inside the O */}
                <motion.path
                    d="M16 18C16 18 18 22 24 18"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-40"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.5 }}
                />
            </svg>
        </div>
    );
};

const BrandLogo = ({ className = "h-8 w-auto", showText = true, textColor = "text-[#222222]" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-2.5 ${className} select-none cursor-pointer `}
        >
            <BrandIcon className="h-12 w-12" />

            {showText && (
                <div className="hidden lg:flex flex-col -gap-1">
                    <span className={`text-[28px] font-black tracking-[-0.04em] leading-none ${textColor}`}>
                        loop<span className="text-rose-600">Out</span>
                    </span>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 translate-x-[2px] text-gray-400">
                        Elite Discovery
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default BrandLogo;


