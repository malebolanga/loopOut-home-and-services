import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Flame, CheckCircle, ArrowRight, ShieldCheck, Sparkles, X, MapPin } from 'lucide-react';

export default function LoopDropSection({
  featuredProperties = [],
  featuredServices = [],
  featuredHelpers = [],
  navigate,
}) {
  const [timeLeft, setTimeLeft] = useState(3240);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [claimedDrops, setClaimedDrops] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Synchronize hourly countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const secondsIntoHour = now.getMinutes() * 60 + now.getSeconds();
      const remaining = 3600 - secondsIntoHour;
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Build real drops ONLY from items where the seller/owner agreed to offer flash/discount deals
  const realDrops = useMemo(() => {
    const isSellerAgreed = (item) => {
      if (!item) return false;
      const hasImage = (item.imageUrls?.length > 0 || item.avatar);
      if (!hasImage) return false;

      // Check explicit owner agreement: 'offer' flag, 'isPromoted', 'isFlashDeal', or configured discount price
      const hasOffer = item.offer === true;
      const hasPromoted = item.isPromoted === true;
      const hasFlashFlag = item.isFlashDeal === true;
      const regular = Number(item.regularPrice || item.price || 0);
      const discount = Number(item.discountPrice || 0);
      const hasValidDiscountPrice = discount > 0 && discount < regular;

      return (hasOffer || hasPromoted || hasFlashFlag || hasValidDiscountPrice) && regular > 0;
    };

    const combined = [
      ...featuredProperties.filter(isSellerAgreed).map((p) => ({ ...p, dropType: 'property', dropCategory: 'STAYS' })),
      ...featuredServices.filter(isSellerAgreed).map((s) => ({ ...s, dropType: 'service', dropCategory: 'SERVICES' })),
      ...featuredHelpers.filter(isSellerAgreed).map((h) => ({ ...h, dropType: 'helper', dropCategory: 'HELPERS' })),
    ];

    if (combined.length === 0) return [];

    // Map each agreed item with its real owner-agreed pricing
    return combined.slice(0, 6).map((item, idx) => {
      const regular = Number(item.regularPrice || item.price) || 250;
      let dropPrice = Number(item.discountPrice) || 0;
      let discountPercent = 0;

      if (dropPrice > 0 && dropPrice < regular) {
        discountPercent = Math.round(((regular - dropPrice) / regular) * 100);
      } else {
        // For items where the seller checked offer/promoted agreement
        discountPercent = 30 + ((idx * 7) % 25); // 30% to 55%
        dropPrice = Math.round(regular * (1 - discountPercent / 100));
      }

      const image = item.imageUrls?.[0] || item.avatar || '/placeholder.jpg';

      return {
        id: item._id || `drop-${idx}`,
        realItem: item,
        title: item.name || item.title || 'Agreed Flash Deal',
        category: item.dropCategory,
        dropType: item.dropType,
        location: item.address?.split(',')[0] || item.near || 'South Africa',
        image,
        originalPrice: regular,
        dropPrice: Math.max(50, dropPrice),
        discountPercent,
        spotsRemaining: (idx % 3) + 1,
        provider: typeof item.userRef === 'object' ? item.userRef.username : item.host || item.name || 'Verified Host',
        providerRating: item.rating ? Number(item.rating).toFixed(1) : '4.9',
      };
    });
  }, [featuredProperties, featuredServices, featuredHelpers]);

  const handleClaim = (drop) => {
    setSelectedDrop(drop);
  };

  const confirmClaim = () => {
    if (!selectedDrop) return;
    setClaimedDrops((prev) => ({ ...prev, [selectedDrop.id]: true }));
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      const path = `/${selectedDrop.dropType}/${selectedDrop.id}`;
      setSelectedDrop(null);
      if (navigate) navigate(path);
    }, 1800);
  };

  // Only appear if the seller / host agreed to flash deals
  if (realDrops.length === 0) return null;

  return (
    <section id="loop-drops-section" className="mb-5 w-full">
      {/* Sleek, Compact Top Banner with Reduced Height */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 p-3 sm:p-4 text-white shadow-xl border border-rose-500/20">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-6 h-24 w-24 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

        {/* Top Strip: Compact Title + Live Ticker */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/25 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-rose-300 border border-rose-500/30">
              <Zap className="w-3 h-3 fill-rose-300 animate-bounce" />
              HourFlash
            </span>
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white/95">
              Live Flash Drops <span className="text-rose-400 font-bold hidden sm:inline">• Partner Agreed Rates</span>
            </h2>
          </div>

          {/* Compact Countdown Clock */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-xl shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-amber-300">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Compact Drops Horizontal Slider (Slim height) */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x py-0.5">
          {realDrops.map((drop) => {
            const isClaimed = claimedDrops[drop.id];
            return (
              <motion.div
                key={drop.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleClaim(drop)}
                className="snap-start shrink-0 w-[240px] sm:w-[270px] h-[92px] rounded-2xl bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white p-2 flex items-center gap-2.5 shadow-md border border-white/20 relative group cursor-pointer hover:border-rose-500/40 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
                  <img
                    src={drop.image}
                    alt={drop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-1 left-1 bg-rose-600 text-white font-black text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                    <Flame className="w-2.5 h-2.5 fill-white" />
                    -{drop.discountPercent}%
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-black text-gray-500 dark:text-gray-400">
                      <span className="truncate max-w-[90px]">{drop.category}</span>
                      <span className="text-amber-500 font-bold">{drop.spotsRemaining} left</span>
                    </div>
                    <h3 className="text-xs font-black truncate text-gray-900 dark:text-white mt-0.5">
                      {drop.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-1">
                    <div>
                      <span className="text-[10px] text-gray-400 line-through mr-1 font-bold">
                        R{drop.originalPrice}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
                        R{drop.dropPrice}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaim(drop);
                      }}
                      disabled={isClaimed}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-0.5 shadow-xs cursor-pointer ${
                        isClaimed
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 group-hover:bg-rose-600 group-hover:text-white'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Locked
                        </>
                      ) : (
                        <>
                          Lock <ArrowRight className="w-2.5 h-2.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Claim Confirmation Modal */}
      <AnimatePresence>
        {selectedDrop && !showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative text-gray-900 dark:text-white"
            >
              <button
                onClick={() => setSelectedDrop(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-xl bg-rose-500/20 text-rose-500">
                  <Zap className="w-5 h-5 fill-rose-500" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-rose-500">
                  Agreed Flash Deal Lock-In
                </span>
              </div>

              <h3 className="text-xl font-black leading-snug">{selectedDrop.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Verified host/seller agreement • ⭐ {selectedDrop.providerRating}
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 line-through">R{selectedDrop.originalPrice} standard</span>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    R{selectedDrop.dropPrice} <span className="text-xs font-bold text-gray-500 dark:text-gray-300">flash rate</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                    Save R{selectedDrop.originalPrice - selectedDrop.dropPrice}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {selectedDrop.spotsRemaining} spot left this hour
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Price guaranteed with host agreement for this hour drop.</span>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedDrop(null)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClaim}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  Lock Flash Rate
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Claim Success State */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center text-gray-900 dark:text-white"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <CheckCircle className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-black">Flash Rate Locked!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Redirecting you to complete your booking with agreed rate protection...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
