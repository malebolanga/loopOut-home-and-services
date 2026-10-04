import React, { useState } from 'react';
import { 
  Check, 
  ShieldCheck, 
  Lock, 
  Users, 
  Headphones, 
  Sparkles, 
  Monitor, 
  Wifi, 
  Signal,
  Smartphone
} from 'lucide-react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { BrandIcon } from './BrandLogo';

const LoopOutPulse = () => {
  const [downloadToast, setDownloadToast] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleDownloadClick = (platform) => {
    setDownloadToast(`LoopOut for ${platform} will launch soon. Opening web app!`);
    setTimeout(() => setDownloadToast(''), 3500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-3 sm:px-6 font-sans relative">
      {/* Ambient background studio glow behind the phone showcase */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-tr from-rose-500/25 via-amber-500/20 to-purple-600/25 blur-[120px] rounded-full opacity-70" />
      </div>

      {/* Showcase Device Container */}
      <div 
        className="relative mx-auto w-full max-w-[365px] sm:max-w-[400px] perspective-[1200px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Surface shadow beneath phone */}
        <div className="absolute -bottom-8 inset-x-8 h-10 bg-black/80 blur-2xl rounded-full -z-10" />

        {/* ── REALISTIC HARDWARE CHASSIS ── */}
        {/* Left Hardware Buttons */}
        {/* Alert / Mute Switch */}
        <div className="absolute -left-[4px] top-[92px] w-[4px] h-[26px] bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 rounded-l-sm shadow-md" />
        {/* Volume Up */}
        <div className="absolute -left-[4px] top-[132px] w-[4px] h-[52px] bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 rounded-l-sm shadow-md" />
        {/* Volume Down */}
        <div className="absolute -left-[4px] top-[196px] w-[4px] h-[52px] bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 rounded-l-sm shadow-md" />
        {/* Right Power / Lock Key */}
        <div className="absolute -right-[4px] top-[148px] w-[4px] h-[72px] bg-gradient-to-l from-slate-400 via-slate-600 to-slate-800 rounded-r-sm shadow-md" />

        {/* Outer Titanium Frame with Chamfered Edge */}
        <div className="relative rounded-[50px] sm:rounded-[56px] p-[3px] bg-gradient-to-b from-slate-500/70 via-slate-700/40 to-slate-800/80 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.25),0_0_50px_rgba(244,63,94,0.18)] ring-1 ring-black">
          
          {/* Inner Titanium Bezel with Antenna Inset Bands */}
          <div className="relative rounded-[47px] sm:rounded-[53px] bg-[#0b0f19] p-[9px] sm:p-[11px] border border-slate-700/80">
            {/* Top antenna bands */}
            <div className="absolute top-7 -left-[3px] w-[3px] h-[3px] bg-slate-500/80" />
            <div className="absolute top-7 -right-[3px] w-[3px] h-[3px] bg-slate-500/80" />
            {/* Bottom antenna bands */}
            <div className="absolute bottom-7 -left-[3px] w-[3px] h-[3px] bg-slate-500/80" />
            <div className="absolute bottom-7 -right-[3px] w-[3px] h-[3px] bg-slate-500/80" />

            {/* ── 2.5D CURVED GLASS DISPLAY PANEL ── */}
            <div className="relative rounded-[39px] sm:rounded-[44px] overflow-hidden bg-gradient-to-b from-[#070b14] via-[#0a101f] to-[#050811] text-white flex flex-col border border-white/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
              
              {/* ── REALISTIC GLASS LAYER & LIGHT REFLECTIONS ── */}
              {/* 1. Curved 2.5D Glass Perimeter Highlight Rim (Catches light along the beveled glass edge) */}
              <div className="absolute inset-0 rounded-[39px] sm:rounded-[44px] pointer-events-none z-40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.7),inset_1.5px_0_3px_rgba(255,255,255,0.2),inset_-1.5px_0_3px_rgba(255,255,255,0.1)]" />

              {/* 2. Primary High-Gloss Diagonal Glass Sheen */}
              <div 
                className={`absolute -inset-x-20 -inset-y-20 pointer-events-none z-30 transition-transform duration-700 ease-out ${
                  isHovered ? 'translate-x-6 -translate-y-4' : 'translate-x-0 translate-y-0'
                }`}
              >
                {/* Sharp Primary Glass Ray */}
                <div className="absolute -top-12 -left-12 w-80 sm:w-96 h-[720px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent rotate-[32deg] transform pointer-events-none" />
                {/* Secondary Soft Ambient Glass Glare */}
                <div className="absolute top-10 -left-6 w-64 h-[350px] bg-gradient-to-br from-white/[0.09] via-white/[0.02] to-transparent rotate-[20deg] transform pointer-events-none" />
                {/* Top Glass Specular Arc */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/[0.16] via-white/[0.04] to-transparent rounded-t-[39px] sm:rounded-t-[44px] pointer-events-none" />
              </div>

              {/* 3. Subtle glass texture & depth gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/[0.03] via-transparent to-blue-500/[0.04] pointer-events-none z-20" />

              {/* ── PHONE TOP BEZEL: SPEAKER & DYNAMIC ISLAND ── */}
              {/* Ear-piece speaker micro-mesh */}
              <div className="pt-1.5 pb-0.5 relative z-20 flex justify-center">
                <div className="w-12 h-1 bg-black rounded-full border border-white/10 shadow-inner" />
              </div>

              {/* Top Phone Status Bar & Dynamic Island */}
              <div className="pt-1 px-6 pb-2 flex items-center justify-between relative z-20">
                {/* Left: Clock */}
                <span className="text-[11px] font-bold tracking-tight text-white/95 drop-shadow-sm">9:41</span>

                {/* Center: Dynamic Island with glass optics */}
                <div className="relative w-24 sm:w-28 h-5 sm:h-5.5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] ring-1 ring-white/10">
                  {/* Camera lens with sapphire glass reflection */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f1d] ring-1 ring-blue-900/60 flex items-center justify-center relative">
                    <div className="w-1 h-1 rounded-full bg-blue-500/80 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
                  </div>
                  {/* Ambient sensor indicator */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#161c28]" />
                </div>

                {/* Right: Signal, Wifi, Battery */}
                <div className="flex items-center gap-1.5 text-white/90">
                  <Signal className="w-3 h-3 drop-shadow-xs" />
                  <Wifi className="w-3 h-3 drop-shadow-xs" />
                  <div className="w-4 h-2 rounded-[2px] border border-white/80 p-[0.5px] flex items-center shadow-xs">
                    <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* ── SCROLLABLE APP CONTENT BENEATH GLASS ── */}
              <div className="px-4 pt-2 pb-5 space-y-4 relative z-10">

                {/* App Brand Header inside glass screen */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2">
                    <BrandIcon className="w-6 h-6" />
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-base font-black tracking-tight text-rose-500 drop-shadow-sm">loop</span>
                      <span className="text-base font-black tracking-tight text-orange-400 drop-shadow-sm">Out</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Official App</span>
                  </div>
                </div>

                {/* Why LoopOut? Banner inside phone */}
                <div className="space-y-1.5 text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-black uppercase tracking-widest shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Why LoopOut?</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                    Your Trusted Local Hub
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-normal">
                    LoopOut is a trusted platform connecting you with verified providers of homes, services, and local help. Enjoy seamless bookings, secure payments, and community quality.
                  </p>
                </div>

                {/* 4 Pillars with Frosted Glassmorphic styling */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  {/* 1. Secure Payments */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 p-2.5 flex flex-col gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-emerald-400/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-sm">
                      <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white leading-tight">
                        Secure Payments
                      </span>
                      <span className="block text-[9px] text-slate-300 mt-0.5 leading-tight font-medium">
                        Safe escrow &amp; fraud defense
                      </span>
                    </div>
                  </motion.div>

                  {/* 2. Verification */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 p-2.5 flex flex-col gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-blue-400/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white leading-tight">
                        Verification
                      </span>
                      <span className="block text-[9px] text-slate-300 mt-0.5 leading-tight font-medium">
                        100% ID-checked profiles
                      </span>
                    </div>
                  </motion.div>

                  {/* 3. Community Driven */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 p-2.5 flex flex-col gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-purple-400/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-500/25 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-sm">
                      <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white leading-tight">
                        Community Driven
                      </span>
                      <span className="block text-[9px] text-slate-300 mt-0.5 leading-tight font-medium">
                        Real local reviews &amp; trust
                      </span>
                    </div>
                  </motion.div>

                  {/* 4. Expert Support */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 p-2.5 flex flex-col gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-amber-400/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
                      <Headphones className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white leading-tight">
                        Expert Support
                      </span>
                      <span className="block text-[9px] text-slate-300 mt-0.5 leading-tight font-medium">
                        Dedicated local assistance
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Download LoopOut on iOS & Android - Glass Pod inside phone */}
                <div className="rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-md border border-white/20 p-3 text-center space-y-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white tracking-tight drop-shadow-xs">
                      Download LoopOut App
                    </h4>
                    <p className="text-[9.5px] text-slate-200 font-medium">
                      Available for iOS &amp; Android smartphones
                    </p>
                  </div>

                  {/* iOS and Android Download Glass Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* iOS Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleDownloadClick('iOS')}
                      className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 transition-all font-sans cursor-pointer shadow-lg border border-white/40"
                    >
                      <FaApple className="w-4 h-4 text-black shrink-0" />
                      <div className="text-left leading-none">
                        <span className="block text-[7.5px] font-semibold text-slate-600 uppercase tracking-tight">Download for</span>
                        <span className="block text-[10px] font-black text-slate-950">iOS (Apple)</span>
                      </div>
                    </motion.button>

                    {/* Android Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleDownloadClick('Android')}
                      className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white hover:bg-slate-800 transition-all font-sans cursor-pointer shadow-lg"
                    >
                      <FaGooglePlay className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="text-left leading-none">
                        <span className="block text-[7.5px] font-semibold text-slate-300 uppercase tracking-tight">Get it on</span>
                        <span className="block text-[10px] font-black text-white">Android</span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Computer Browser Access */}
                  <div className="pt-1 flex items-center justify-center gap-1.5 text-[9px] text-slate-300 font-medium">
                    <Monitor className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Or use directly in computer browser</span>
                  </div>
                </div>

                {/* Toast Feedback */}
                {downloadToast && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 rounded-xl py-1.5 px-3 text-center shadow-lg"
                  >
                    {downloadToast}
                  </motion.div>
                )}

                {/* iOS Home Indicator Bar at bottom of screen */}
                <div className="pt-1">
                  <div className="w-24 sm:w-28 h-1 bg-white/50 rounded-full mx-auto shadow-xs" />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopOutPulse;
