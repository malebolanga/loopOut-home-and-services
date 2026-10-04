import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandIcon } from './BrandLogo';
import { Sparkles, Megaphone, X, CheckCircle, ShieldAlert, Award, FileText, Check } from 'lucide-react';

/**
 * A highly interactive, professional, high-end banner component.
 * Features category-specific co-branding campaign lists.
 * Clicking the banner opens a premium glassmorphic modal with campaign details and tasks.
 */
const LoopOutBanner = ({ className = "", type = "all" }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Category-specific campaign lists
  const campaignData = {
    stay: {
      title: "Hotel & Stay Campaign",
      badge: "🏨 Hospitality Partner",
      description: "This overnight stay or hotel is verified under the loopOut co-branding partnership, ensuring verified comfort, premium aesthetics, and exclusive perks.",
      banners: [
        "LoopOut Logo on the Bedding",
        "LoopOut on Room Curtains",
        "LoopOut Logos on the Mirror",
        "LoopOut at Hotel Gate & Reception"
      ],
      tasks: [
        "Display premium loopOut cotton bedding covers.",
        "Ensure loopOut branding is visible on main styling mirrors.",
        "Mount loopOut metallic partner badge at reception."
      ]
    },
    helper: {
      title: "Elite Helper & Salon Campaign",
      badge: "💇 Care & Styling Partner",
      description: "This helper/salon has integrated premium loopOut styling items, guaranteeing elite service standards and social proof branding.",
      banners: [
        "LoopOut on the Salon Chairs",
        "LoopOut on the Barber Cape",
        "LoopOut Logos on the Mirror",
        "LoopOut Branded Team Aprons"
      ],
      tasks: [
        "Use official loopOut water-resistant barber capes.",
        "Brand style mirrors with custom vinyl decals.",
        "Wear loopOut verified partner aprons during operations."
      ]
    },
    service: {
      title: "Premium Machinery & Service Campaign",
      badge: "⚙️ Heavy-Duty Partner",
      description: "This specialized service incorporates loopOut branding across machinery, heavy-duty washing units, and operational areas.",
      banners: [
        "LoopOut Logo on Washing Machines",
        "LoopOut Branding on Service Equipment",
        "LoopOut Branded Team Uniforms",
        "LoopOut Service Vehicles & Signage"
      ],
      tasks: [
        "Mount loopOut machine plaque on washing stations.",
        "Ensure all service technicians wear branded uniforms.",
        "Affix loopOut partner emblems on mobile service vans."
      ]
    },
    event: {
      title: "Elite Event & Experience Campaign",
      badge: "🎪 Experience Partner",
      description: "This event features unified loopOut digital ticketing, stage placement, and lounge aesthetics to maximize guest prestige.",
      banners: [
        "LoopOut Logos on Stage Banners",
        "LoopOut Branded Entrance Gates",
        "LoopOut Digital Passes & Tickets",
        "LoopOut VIP Lounge Branding"
      ],
      tasks: [
        "Integrate loopOut brand logo in digital pass headers.",
        "Feature custom co-branded entrance arches.",
        "Display loopOut banners on the main stage."
      ]
    },
    all: {
      title: "loopOut Unified Campaign",
      badge: "✨ Global Network Partner",
      description: "A comprehensive brand-exposure initiative connecting premium stays, services, helpers, and events across South Africa.",
      banners: [
        "LoopOut Logos on the Mirror",
        "LoopOut on the Salon Chairs",
        "LoopOut on the Barber Cape",
        "LoopOut on Room Curtains",
        "LoopOut Logo on the Bedding",
        "LoopOut at Hotel Gate & Reception"
      ],
      tasks: [
        "Ensure active co-branding elements are clean and visible.",
        "Take a verification picture of loopOut logo placement.",
        "Submit ad placement log inside provider tools."
      ]
    }
  };

  const activeCampaign = campaignData[type] || campaignData.all;
  const banners = activeCampaign.banners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`absolute bottom-20 left-0 right-0 z-30 px-6 ${className}`}
        onClick={handleBannerClick}
      >
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-2xl group/banner cursor-pointer hover:bg-black/70 hover:border-rose-500/30 transition-all duration-300">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-rose-500 blur-md opacity-25 rounded-full animate-pulse group-hover/banner:opacity-50 transition-opacity"></div>
            <BrandIcon className="w-8 h-8 relative z-10" />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
                Featured <span className="text-rose-500">Campaign</span>
              </span>
              <span className="inline-flex w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-auto" />
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
                    className="text-[8px] font-black text-white/80 uppercase tracking-widest truncate w-full"
                  >
                    {banners[currentBannerIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Glassmorphic Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative max-w-lg w-full bg-gray-950 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/20 to-orange-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Badge */}
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-2xl shadow-lg">
                  <BrandIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">
                    Verified Ad Placement
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {activeCampaign.title}
                  </h3>
                </div>
              </div>

              {/* Status & Sub-badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active Ad Campaign
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-[9px] font-bold uppercase tracking-wider rounded-full">
                  {activeCampaign.badge}
                </span>
              </div>

              {/* Campaign Description */}
              <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">
                {activeCampaign.description}
              </p>

              {/* Dynamic Visual Preview Illustration */}
              {(type === 'stay' || type === 'helper' || type === 'all') && (
                <div className="relative aspect-[16/9] w-full rounded-[1.5rem] overflow-hidden mb-6 border border-white/10 shadow-2xl">
                  <img
                    src={
                      type === 'stay'
                        ? '/soweto_bg.png'
                        : type === 'helper'
                        ? '/barber_loopout_campaign.png'
                        : '/soweto_bg.png'
                    }
                    alt="loopOut Campaign Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Brand Visual Standard</span>
                  </div>
                </div>
              )}

              {/* Placement Details */}
              <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6">
                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                  Brand Touchpoints Cycle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {banners.map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 p-2 bg-black/40 border border-white/5 rounded-xl">
                      <CheckCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wide truncate">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="bg-gradient-to-br from-rose-950/20 to-orange-950/20 border border-rose-500/10 rounded-3xl p-5">
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Campaign Guidelines & Tasks
                </h4>
                <div className="space-y-3">
                  {activeCampaign.tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mt-0.5 shrink-0 text-[10px] font-black text-rose-400">
                        {index + 1}
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed font-semibold">
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partner Call to Action */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-white hover:bg-gray-100 text-gray-950 font-black uppercase text-xs tracking-widest rounded-2xl transition-colors shadow-2xl flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4 text-rose-500" />
                  Confirm Ad Placement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoopOutBanner;
