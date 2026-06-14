import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoopOutWhisper = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [listenState, setListenState] = useState('idle'); // idle, listening, processing, result
  const [transcript, setTranscript] = useState('');
  const [searchIntent, setSearchIntent] = useState(null);

  // Simulated AI intents
  const mockIntents = [
    {
      text: "I need a house cleaner tomorrow under R200",
      category: "cleaner",
      type: "helper",
      budget: 200,
      timing: "tomorrow"
    },
    {
      text: "Looking for a barber who can come to my house",
      category: "barber",
      type: "services",
      budget: null,
      timing: "asap"
    },
    {
      text: "Get me a plumber for a burst pipe right now",
      category: "plumber",
      type: "services",
      budget: null,
      timing: "now"
    }
  ];

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const handleStartListening = () => {
    setListenState('listening');
    setTranscript('');
    transcriptRef.current = '';
    setSearchIntent(null);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition not supported in this browser.");
      setTimeout(() => setListenState('idle'), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      transcriptRef.current = currentTranscript;
    };

    recognition.onend = () => {
      setListenState('processing');
      // Simple intent extraction based on the actual spoken text
      setTimeout(() => {
        analyzeTranscript(transcriptRef.current);
      }, 1500);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setListenState('idle');
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const analyzeTranscript = (text) => {
    if (!text) {
      setListenState('idle');
      return;
    }
    
    const lowerText = text.toLowerCase();
    let intent = {
      text: text,
      category: "service",
      type: "services",
      budget: null,
      timing: "asap"
    };

    // Keyword matching
    if (lowerText.includes("cleaner") || lowerText.includes("cleaning")) {
      intent.category = "cleaner";
      intent.type = "helper";
    } else if (lowerText.includes("barber") || lowerText.includes("hair")) {
      intent.category = "barber";
    } else if (lowerText.includes("plumb") || lowerText.includes("pipe") || lowerText.includes("leak")) {
      intent.category = "plumber";
    } else if (lowerText.includes("garden") || lowerText.includes("lawn")) {
      intent.category = "gardener";
      intent.type = "services";
    } else if (lowerText.includes("electric")) {
      intent.category = "electrician";
      intent.type = "services";
    }

    // Timing extraction
    if (lowerText.includes("tomorrow")) intent.timing = "tomorrow";
    else if (lowerText.includes("now") || lowerText.includes("urgent") || lowerText.includes("today")) intent.timing = "now";
    else if (lowerText.includes("weekend")) intent.timing = "weekend";

    // Budget extraction
    const budgetMatch = lowerText.match(/(?:under|for|around)\s*(?:r|rand|rands)?\s*(\d+)/i) || lowerText.match(/(\d+)\s*(?:r|rand|rands)/i);
    if (budgetMatch) {
      intent.budget = budgetMatch[1];
    }

    setSearchIntent(intent);
    setListenState('result');
  };

  const handleReset = () => {
    setListenState('idle');
    setTranscript('');
    setSearchIntent(null);
  };

  const handleAction = () => {
    if (searchIntent) {
      onClose();
      // Redirect to search with extracted filters
      navigate(`/search?category=${searchIntent.category}&type=${searchIntent.type}&ai=true`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-gray-950/90 backdrop-blur-xl flex flex-col items-center justify-end sm:justify-center p-4 pb-12 sm:pb-4"
        >
          {/* Header */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-white font-black tracking-widest text-xs uppercase">LoopOut Whisper</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Main Interaction Area */}
          <motion.div 
            layout
            className="w-full max-w-sm flex flex-col items-center relative"
          >
            
            {/* Dynamic Status Text */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={listenState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-12 h-16"
              >
                {listenState === 'idle' && (
                  <>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">How can I help?</h3>
                    <p className="text-gray-400 text-sm font-medium">Tap the mic and tell me what you need.</p>
                  </>
                )}
                {listenState === 'listening' && (
                  <h3 className="text-2xl font-black text-cyan-400 mb-2 tracking-tight">Listening...</h3>
                )}
                {listenState === 'processing' && (
                  <h3 className="text-2xl font-black text-cyan-400 mb-2 tracking-tight animate-pulse">Thinking...</h3>
                )}
                {listenState === 'result' && (
                  <h3 className="text-2xl font-black text-emerald-400 mb-2 tracking-tight">I understand.</h3>
                )}
              </motion.div>
            </AnimatePresence>

            {/* The Live Transcript */}
            <div className="w-full text-center h-24 flex items-center justify-center px-4 mb-8">
              {transcript && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl sm:text-2xl font-black text-white/90 leading-tight tracking-wide"
                >
                  "{transcript}"
                </motion.p>
              )}
            </div>

            {/* Microphone Button & Visualizer */}
            <div className="relative flex justify-center items-center h-48 w-full mb-8">
              {/* Background Ripples when listening */}
              {listenState === 'listening' && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-24 h-24 bg-cyan-500 rounded-full mix-blend-screen"
                  />
                  <motion.div 
                    animate={{ scale: [1, 2.5, 3], opacity: [0.8, 0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    className="absolute w-24 h-24 bg-cyan-400 rounded-full mix-blend-screen"
                  />
                  
                  {/* Fake Audio Waveform */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-50 pointer-events-none">
                    {[...Array(9)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: [10, Math.random() * 60 + 20, 10] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror", delay: i * 0.1 }}
                        className="w-1.5 bg-cyan-400 rounded-full"
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* AI Processing Animation */}
              {listenState === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-[3px] border-transparent border-t-cyan-400 border-r-cyan-400"
                  />
                </div>
              )}

              {/* Action Button */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={listenState === 'idle' ? handleStartListening : handleReset}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  listenState === 'idle' 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/50 hover:shadow-cyan-500/80' 
                  : listenState === 'listening' 
                  ? 'bg-white shadow-white/50 text-cyan-600'
                  : 'bg-gray-800 border-2 border-gray-700 text-gray-400'
                }`}
              >
                {listenState === 'idle' ? (
                  <MicrophoneIcon className="w-10 h-10 text-white" />
                ) : listenState === 'listening' ? (
                  <MicrophoneIcon className="w-10 h-10 text-cyan-500 animate-pulse" />
                ) : (
                  <XMarkIcon className="w-8 h-8" />
                )}
              </motion.button>
            </div>

            {/* Neural Extraction Results Card */}
            <AnimatePresence>
              {listenState === 'result' && searchIntent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Intent Extracted</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Category</span>
                      <span className="text-xs font-bold text-gray-900 capitalize">{searchIntent.category}</span>
                    </div>
                    {searchIntent.budget && (
                      <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Budget</span>
                        <span className="text-xs font-bold text-gray-900">Under R{searchIntent.budget}</span>
                      </div>
                    )}
                    <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">Timing</span>
                      <span className="text-xs font-bold text-gray-900 capitalize">{searchIntent.timing}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleAction}
                    className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Find {searchIntent.category}s Now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoopOutWhisper;

