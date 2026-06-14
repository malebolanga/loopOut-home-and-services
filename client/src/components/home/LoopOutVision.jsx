import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CameraIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Sparkles, ScanLine, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoopOutVision = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState('idle'); // idle, scanning, result
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Mock results that will be randomly selected when an image is scanned
  const mockResults = [
    {
      problem: "Burst Pipe / Severe Leak",
      category: "plumber",
      type: "services",
      confidence: 94,
      costRange: "R450 - R850",
      description: "Water accumulation detected. Requires immediate plumbing intervention."
    },
    {
      problem: "Overgrown Lawn / Yard Work",
      category: "gardener",
      type: "services",
      confidence: 88,
      costRange: "R200 - R400",
      description: "Significant weed and grass overgrowth detected in outdoor area."
    },
    {
      problem: "Deep Clean Required",
      category: "cleaner",
      type: "helper",
      confidence: 91,
      costRange: "R250 - R500",
      description: "High levels of dust and clutter detected in living space."
    }
  ];

  const [scanResult, setScanResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        startScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const startScanning = () => {
    setScanState('scanning');
    
    // Simulate Neural AI processing time (3 seconds)
    setTimeout(() => {
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScanResult(randomResult);
      setScanState('result');
    }, 3000);
  };

  const handleReset = () => {
    setScanState('idle');
    setImagePreview(null);
    setScanResult(null);
  };

  const handleFindHelpers = () => {
    if (scanResult) {
      onClose();
      navigate(`/search?category=${scanResult.category}&type=${scanResult.type}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-gray-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
        >
          {/* Header */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-white font-black tracking-widest text-xs uppercase">LoopOut Vision</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full max-w-sm flex flex-col items-center">
            
            {/* The Scanner Viewport */}
            <motion.div 
              layout
              className="w-full aspect-[4/5] bg-gray-900 rounded-[2.5rem] relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
            >
              {/* Idle State - Prompt to upload/take photo */}
              {scanState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-800 to-gray-900">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <CameraIcon className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Identify Any Problem</h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                    Snap a photo of the mess, the leak, or the task. Our Neural Engine will find the perfect helper instantly.
                  </p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_10px_25px_rgba(79,70,229,0.4)] active:scale-95 transition-all"
                  >
                    Open Camera
                  </button>
                </div>
              )}

              {/* Image Preview & Scanning Overlay */}
              {(scanState === 'scanning' || scanState === 'result') && imagePreview && (
                <div className="absolute inset-0">
                  <img src={imagePreview} alt="Scan target" className="w-full h-full object-cover opacity-80" />
                  
                  {scanState === 'scanning' && (
                    <>
                      {/* Scanning Grid & Laser */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                      <div className="absolute inset-0 border-[4px] border-indigo-500/50 m-4 rounded-[2rem] pointer-events-none" />
                      
                      {/* Animated Scanning Laser */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_5px_rgba(99,102,241,0.6)] z-20"
                      />

                      {/* Scanning HUD Elements */}
                      <div className="absolute top-8 left-8 text-indigo-400 text-[10px] font-mono tracking-widest">
                        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                          ANALYZING IMAGE...
                        </motion.div>
                        <div className="mt-1 opacity-70">NEURAL CORE ACTIVE</div>
                      </div>
                      
                      <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <ScanLine className="w-16 h-16 text-indigo-400 animate-pulse" />
                      </div>
                    </>
                  )}
                  
                  {/* Dark overlay when result is ready */}
                  {scanState === 'result' && (
                    <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm transition-all duration-500" />
                  )}
                </div>
              )}

              {/* Scan Result Overlay */}
              <AnimatePresence>
                {scanState === 'result' && scanResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-x-0 bottom-0 bg-white p-6 rounded-t-[2.5rem] shadow-2xl flex flex-col z-30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Match Found</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight">{scanResult.problem}</h3>
                      </div>
                      <div className="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 flex flex-col items-end">
                        <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">Confidence</span>
                        <span className="text-sm font-black text-emerald-700">{scanResult.confidence}%</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 font-medium mb-5">{scanResult.description}</p>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <MagnifyingGlassIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Action Required</p>
                          <p className="text-sm font-black text-gray-900 capitalize">Find a {scanResult.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Est. Cost</p>
                        <p className="text-sm font-black text-gray-900">{scanResult.costRange}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleReset}
                        className="py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                      >
                        Rescan
                      </button>
                      <button 
                        onClick={handleFindHelpers}
                        className="py-3.5 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-transform"
                      >
                        View Helpers
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoopOutVision;
