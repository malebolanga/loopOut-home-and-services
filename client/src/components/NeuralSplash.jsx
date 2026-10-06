import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BrandIcon } from './BrandLogo';

export default function NeuralSplash() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.24, ease: "easeOut" } }}
          className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative mb-5 w-24 h-24 rounded-[30px] bg-rose-50 flex items-center justify-center">
              <BrandIcon className="w-16 h-16 relative z-10" />
            </div>

            <motion.h1 
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.3 }}
              className="text-3xl font-black tracking-tight text-slate-900"
            >
              loop<span className="text-rose-500">Out</span>
            </motion.h1>
            <p className="mt-1 text-xs font-semibold text-slate-400">Everything around you, in one place</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="absolute bottom-12 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
            <motion.div animate={{ x: ['-100%', '180%'] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} className="h-full w-8 rounded-full bg-rose-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
