import React from 'react';
import { motion } from 'framer-motion';

const BrandLogo = ({ className = "h-8 w-auto", showText = true, textColor = "text-[#222222]" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-2.5 ${className} select-none cursor-pointer `}
        >
            <div className="relative flex items-center justify-center h-full aspect-square">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#E61E4D] opacity-20 blur-lg rounded-full group-hover:opacity-30 transition-opacity duration-500" />

                <svg
                    viewBox="0 0 44 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-auto relative z-10 drop-shadow-sm"
                >
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E61E4D" />
                            <stop offset="100%" stopColor="#D70466" />
                        </linearGradient>
                        <filter id="innerShadow">
                            <feOffset dx="0" dy="1" />
                            <feGaussianBlur stdDeviation="0.5" result="offset-blur" />
                            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                            <feFlood floodColor="black" floodOpacity="0.2" result="color" />
                            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                            <feComponentAlpha in="shadow" result="alpha" />
                            <feActive desc="shadow" in="shadow" />
                        </filter>
                    </defs>

                    {/* Background Shape */}
                    <rect width="44" height="44" rx="14" fill="url(#logoGradient)" />

                    {/* Infinite Loop Icon */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d="M14 26C14 21.5817 17.5817 18 22 18C26.4183 18 30 21.5817 30 26C30 30.4183 26.4183 34 22 34C19.5 34 17.5 32.5 16.5 31"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    />
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
                        d="M30 18L30 10M30 10L22 10M30 10L24 16"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col -gap-1">
                    <span className={`text-[26px] font-black tracking-[-0.04em] leading-none ${textColor}`}>
                        loop<span className="text-[#E61E4D]">Out</span>
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-40 translate-x-[2px]">
                        Premium Services
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default BrandLogo;

