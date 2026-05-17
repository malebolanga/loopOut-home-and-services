import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandIcon } from './BrandLogo';
import { Sparkles, Megaphone } from 'lucide-react';

/**
 * A professional, high-end banner component to be placed on top of listing images.
 * Highlights the expansion across key South African cities and ad campaigns.
 */
const LoopOutBanner = ({ className = "" }) => {
  const banners = [
    "LoopOut Logos on the Mirror",
    "LoopOut on the Salon Chairs",
    "LoopOut on the Barber Cape",
    "LoopOut on Room Curtains",
    "LoopOut Logo on the Bedding",
    "LoopOut at Hotel Gate & Reception"
  ];
  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`absolute bottom-20 left-0 right-0 z-30 px-6 ${className}`}
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-2xl group/banner">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 rounded-full animate-pulse group-hover/banner:opacity-40 transition-opacity"></div>
          <BrandIcon className="w-8 h-8 relative z-10" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
              Featured <span className="text-rose-500">Campaigns</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 mt-0.5">
            <Megaphone className="w-2.5 h-2.5 text-blue-400" />
            <div className="h-4 overflow-hidden w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={banners[currentBannerIndex]}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-[8px] font-black text-white/70 uppercase tracking-widest truncate w-full"
                >
                  {banners[currentBannerIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoopOutBanner;
