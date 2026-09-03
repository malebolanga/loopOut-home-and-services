import React from 'react';
import { Check, Monitor } from 'lucide-react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const LoopOutPulse = () => {
  return (
    <div className="w-full max-w-4xl mx-auto my-3 font-sans">
      <div className="rounded-2xl bg-[#090e18] border border-white/10 p-4 sm:p-6 shadow-lg">
        {/* Main Grid: Why LoopOut? + 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left: Why LoopOut? */}
          <div className="md:col-span-5 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Why LoopOut?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              LoopOut is a trusted platform connecting you with verified providers of homes, services, and local help. Enjoy seamless bookings, secure payments, and community quality.
            </p>
          </div>

          {/* Right: 4-Block (2x2 Grid) */}
          <div className="md:col-span-7 grid grid-cols-2 gap-2.5">
            {/* 1. Secure Payments */}
            <div className="rounded-xl bg-[#131a29] border border-white/10 p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
                <span role="img" aria-label="money bag">💰</span>
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Secure
                </span>
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Payments
                </span>
              </div>
            </div>

            {/* 2. Verified Matches */}
            <div className="rounded-xl bg-[#131a29] border border-white/10 p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Verified
                </span>
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Matches
                </span>
              </div>
            </div>

            {/* 3. Expert Support */}
            <div className="rounded-xl bg-[#131a29] border border-white/10 p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-slate-700/50 border border-slate-600/40 flex items-center justify-center text-lg shrink-0">
                <span role="img" aria-label="telephone">📞</span>
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Expert
                </span>
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Support
                </span>
              </div>
            </div>

            {/* 4. Community Driven */}
            <div className="rounded-xl bg-[#131a29] border border-white/10 p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg shrink-0">
                <span role="img" aria-label="handshake">🤝</span>
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Community
                </span>
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  Driven
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Access / Download Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-xs sm:text-sm font-black text-white tracking-tight">
              Download LoopOut on iOS &amp; Android
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Or access LoopOut directly in your web browser using any computer.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* iOS */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold shadow-xs">
              <FaApple className="w-4 h-4 text-white" />
              <span>iOS</span>
            </span>

            {/* Android */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold shadow-xs">
              <FaGooglePlay className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android</span>
            </span>

            {/* Computer */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold shadow-xs">
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span>Computer</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopOutPulse;


