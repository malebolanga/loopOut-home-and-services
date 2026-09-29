import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, MapPinIcon, ChartBarIcon, FireIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Map, Zap, TrendingUp, Navigation, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'radar'
  const [activeFilter, setActiveFilter] = useState('All');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Simulate initial scan
    const timer = setTimeout(() => setIsScanning(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  // Mock "Hot Zones" simulating a heatmap
  const hotZones = [
    { id: 1, top: '30%', left: '45%', size: 'w-64 h-64', intensity: 'from-rose-600/80 to-rose-600/0', label: 'Very High Demand', pulse: true },
    { id: 2, top: '60%', left: '70%', size: 'w-48 h-48', intensity: 'from-orange-500/60 to-orange-500/0', label: 'High Demand', pulse: false },
    { id: 3, top: '20%', left: '80%', size: 'w-40 h-40', intensity: 'from-amber-400/50 to-amber-400/0', label: 'Medium Demand', pulse: false },
    { id: 4, top: '75%', left: '20%', size: 'w-56 h-56', intensity: 'from-rose-500/70 to-rose-500/0', label: 'High Demand', pulse: true }
  ];

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden font-sans text-white">
      
      {/* Background Grid Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(-100px)',
            transformOrigin: 'top center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />
      </div>

      {/* Heatmap Overlays */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {viewMode === 'heatmap' && !isScanning && hotZones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1 }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${zone.size}`}
              style={{ top: zone.top, left: zone.left }}
            >
              <div className={`w-full h-full rounded-full bg-gradient-radial ${zone.intensity} blur-xl ${zone.pulse ? 'animate-pulse' : ''}`} />
              
              {/* Heatmap Core / Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-xl">
                  <FireIcon className="w-3 h-3 text-rose-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/90">{zone.label}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scanning Radar Sweep (When scanning) */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="w-[800px] h-[800px] border border-cyan-500/20 rounded-full relative">
              <div className="absolute inset-0 border border-cyan-500/10 rounded-full scale-75" />
              <div className="absolute inset-0 border border-cyan-500/5 rounded-full scale-50" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(6, 182, 212, 0.2) 360deg)' }}
              >
                <div className="absolute top-0 bottom-1/2 left-1/2 w-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" />
              </motion.div>
            </div>
            <div className="absolute text-cyan-400 font-black tracking-[0.3em] uppercase text-xs animate-pulse bg-gray-950/80 px-4 py-2 rounded-full border border-cyan-500/30">
              Analyzing Demand...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-center bg-gradient-to-b from-gray-950 to-transparent pt-12 sm:pt-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-gray-900/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>

        <div className="flex bg-gray-900/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-2xl">
          <button 
            onClick={() => setViewMode('heatmap')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'heatmap' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Demand Heatmap
          </button>
          <button 
            onClick={() => setViewMode('radar')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'radar' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Live Jobs
          </button>
        </div>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Honesty banner — this view currently shows simulated demand data, not live bookings */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full backdrop-blur-md">
          Preview · Simulated Demand Data
        </span>
      </div>

      {/* Bottom Insights Dashboard */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-8 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent">
        <div className="max-w-md mx-auto">
          
          {/* Smart AI Insight Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-900/90 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-5 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Neural Insight</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-tight mb-2">
                  High demand for <span className="text-rose-400">Plumbers</span> detected 5 mins North.
                </h3>
                <p className="text-gray-400 text-xs">Move to the highlighted red zone to increase your job matches by 40%.</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                disabled
                title="Live navigation isn't available yet — this is a preview"
                className="flex-1 py-3 bg-white/40 text-gray-500 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed"
              >
                Navigate to Zone
              </button>
              <button 
                onClick={handleRescan}
                className="w-12 bg-gray-800 rounded-xl flex items-center justify-center border border-white/10 active:scale-95 transition-all"
              >
                <BoltIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Surge Pricing</span>
              </div>
              <p className="text-2xl font-black text-white">1.5x</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">+R50 per job</p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Requests</span>
              </div>
              <p className="text-2xl font-black text-white">24</p>
              <p className="text-[10px] text-gray-500 dark:text-white font-bold mt-1">In your 10km radius</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProDashboard;
