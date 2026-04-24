import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Briefcase, 
  UserPlus, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Star,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function HostYourHome() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('listing');
  const [calculateValue, setCalculateValue] = useState(1500);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hostTypes = [
    {
      id: 'listing',
      title: 'Host Your Space',
      description: 'Share your home, room, or unique space with travelers.',
      icon: <Home className="w-8 h-8" />,
      color: 'from-rose-500 to-orange-400',
      tag: 'Property',
      potential: 'R15,000 /mo',
      path: currentUser ? `/${currentUser._id}/create-listing` : '/sign-in'
    },
    {
      id: 'service',
      title: 'Offer a Service',
      description: 'Photography, cleaning, tours, or specialized skills.',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'from-blue-600 to-indigo-400',
      tag: 'Professional',
      potential: 'R8,000 /mo',
      path: '/create-service'
    },
    {
      id: 'helper',
      title: 'Become a Helper',
      description: 'Lend a hand with physical tasks, deliveries, or help.',
      icon: <UserPlus className="w-8 h-8" />,
      color: 'from-emerald-500 to-teal-400',
      tag: 'Support',
      potential: 'R5,000 /mo',
      path: '/create-helper'
    },
    {
      id: 'event',
      title: 'Host an Event',
      description: 'Organize workshops, meetups, or exclusive experiences.',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-purple-600 to-pink-400',
      tag: 'Experience',
      potential: 'R12,000 /event',
      path: '/create-event'
    }
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Master Protection",
      content: "Complete damage protection for your assets and peace of mind."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Payouts",
      content: "Secure, automated payment processing after every successful booking."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Analytics",
      content: "AI-driven insights to optimize your pricing and visibility."
    }
  ];

  return (
    <div className="bg-white min-h-screen font-inter selection:bg-rose-100 selection:text-rose-600">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section - The Masterpiece */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">The Ultimate Hosting Portal</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9]">
              loopOut Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500">World</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Transform your property, skills, time, or experiences into a professional legacy. 
              The world is waiting for your unique hosting perspective.
            </p>
          </motion.div>

          {/* Core Paths - Dynamic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hostTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative h-[450px] bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${type.color}`} />
                <div className="p-10 flex flex-col h-full">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">{type.tag}</span>
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-8 shadow-xl`}>
                    {type.icon}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{type.title}</h3>
                  <p className="text-sm text-gray-400 font-medium mb-auto leading-relaxed">{type.description}</p>
                  
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black uppercase text-gray-400">Potential Earnings</span>
                      <span className="text-sm font-black text-gray-900">{type.potential}</span>
                    </div>
                    <button 
                      onClick={() => navigate(type.path)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-rose-500 transition-all duration-300 shadow-xl shadow-gray-100"
                    >
                      Initialize
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Estimation Hub - Glassmorphism */}
      <section className="py-24 px-6 sm:px-12 relative">
        <div className="max-w-[1200px] mx-auto bg-gray-900 rounded-[3rem] overflow-hidden relative shadow-2xl">
           {/* Mesh gradient inside black card */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] -z-0" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-0" />

           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
             <div className="p-12 lg:p-20 flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
                  Calculate Your <br />
                  <span className="text-rose-500 italic">Financial Legacy.</span>
                </h2>
                <div className="space-y-8">
                   <div className="flex flex-wrap gap-3">
                      {['listing', 'service', 'helper', 'event'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setActiveTab(t)}
                          className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeTab === t ? 'bg-white text-gray-900 border-white' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase text-white/40 tracking-widest">
                         <span>Engagement Level</span>
                         <span>{calculateValue} pts</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="5000" 
                        value={calculateValue}
                        onChange={(e) => setCalculateValue(e.target.value)}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
                      />
                   </div>
                </div>
             </div>

             <div className="p-12 lg:p-20 bg-white/5 backdrop-blur-3xl border-l border-white/5 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Projected Monthly Volume</p>
                <div className="text-7xl md:text-8xl font-black text-white mb-4 tracking-tighter">
                  R{(calculateValue * 12).toLocaleString()}
                </div>
                <p className="text-sm text-white/30 font-medium max-w-xs mx-auto">
                  Based on current market demand and professional host averages in your region.
                </p>
                <button className="mt-12 px-10 py-5 bg-white text-gray-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-2xl">
                   Start Hosting Now
                </button>
             </div>
           </div>
        </div>
      </section>

      {/* Global Protection - Clean Icons */}
      <section className="py-24 px-6 sm:px-12 bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center group translate-y-0 hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                    {React.cloneElement(benefit.icon, { className: 'w-7 h-7 text-rose-500' })}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">{benefit.title}</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs">{benefit.content}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Master Class - Visual Teaser */}
      <section className="py-32 px-6 sm:px-12 relative overflow-hidden">
         <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-[1px] bg-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Host Recognition</span>
               </div>
               <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
                 Elevate to <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Master Level</span>
               </h2>
               <div className="space-y-8">
                  <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4" />
                     </div>
                     <div>
                        <h4 className="font-black text-gray-900 text-sm mb-1">SuperHost Status</h4>
                        <p className="text-xs text-gray-400 font-medium">Auto-unlocked after 5 consistent 5-star experiences.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4" />
                     </div>
                     <div>
                        <h4 className="font-black text-gray-900 text-sm mb-1">Priority Support</h4>
                        <p className="text-xs text-gray-400 font-medium">Dedicated mission control staff for premium hosts.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-400/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative aspect-video bg-gray-900 rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=80" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    alt="Host Experience"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-gray-900 fill-gray-900" />
                     </button>
                  </div>
                  <div className="absolute bottom-10 left-10">
                     <p className="text-white text-lg font-black tracking-tight">Watch Masterclass</p>
                     <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">3:42 Minutes</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Final Action Hub */}
      <section className="py-40 px-6 sm:px-12 text-center bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-500/20 rounded-full blur-[150px] -z-0" />
        <div className="max-w-4xl mx-auto relative z-10">
           <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
             Ready to <br />
             loopOut?
           </h2>
           <p className="text-xl text-white/40 mb-14 font-medium max-w-2xl mx-auto">
             Join the definitive community of professionals and visionaries shaping the future of global hosting.
           </p>
           <button 
             onClick={() => navigate('/sign-up')}
             className="px-16 py-7 bg-white text-gray-900 rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-95"
           >
              Initialization Started
           </button>
        </div>
      </section>

      {/* Master Footer Area */}
      <footer className="py-12 px-6 sm:px-12 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2026 loopOut Global</span>
              <div className="w-[1px] h-4 bg-gray-100" />
              <button className="text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-rose-500 transition-colors">Privacy Ethics</button>
              <button className="text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-rose-500 transition-colors">Safety Protocols</button>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Mission Control Online</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
