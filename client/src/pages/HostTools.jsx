import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CpuChipIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  PaintBrushIcon,
  MegaphoneIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  BoltIcon,
  SignalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { FaRobot } from 'react-icons/fa';
import FooterDock from '../components/FooterDock';
import BrandLogo from '../components/BrandLogo';

export default function HostTools() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const toolCategories = [
    {
      title: 'Operational Logic',
      tools: [
        { name: 'Listing Optimizer', desc: 'Neural AI suggestions for better visibility.', icon: SparklesIcon, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { name: 'Pricing Engine', desc: 'Market-driven dynamic rate calculation.', icon: BoltIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { name: 'Sector Analytics', desc: 'Deep dive into regional demand signals.', icon: ChartBarIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      ]
    },
    {
      title: 'Growth & Marketing',
      tools: [
        { name: 'Neural Boost', desc: 'Extract maximum reach via platform spotlight.', icon: MegaphoneIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { name: 'Brand Designer', desc: 'Custom visuals for your hosting portfolio.', icon: PaintBrushIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { name: 'Deployment Logs', desc: 'Archive of all operational history.', icon: SignalIcon, color: 'text-sky-400', bg: 'bg-sky-500/10' },
      ]
    },
    {
      title: 'Security & Protocols',
      tools: [
        { name: 'Verification Hub', desc: 'Verify guest signals and reputation scores.', icon: ShieldCheckIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { name: 'AI Conflict Resolver', desc: 'Automated neural mediation for disputes.', icon: FaRobot, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { name: 'Access Controls', desc: 'Manage your secondary operator nodes.', icon: UserGroupIcon, color: 'text-teal-400', bg: 'bg-teal-500/10' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-rose-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[30%] h-[30%] bg-rose-500/5 rounded-full blur-[100px]" />
        <img 
          src="/neural_command_hub_vfx.png" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] mix-blend-overlay"
          alt="Neural Backdrop"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/host-dashboard')}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white/50 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
            <div className="flex items-center gap-4">
              <BrandLogo showText={true} textColor="text-white" className="h-12 w-auto" />
              <div className="h-8 w-[1px] bg-white/10 hidden lg:block" />
              <div className="hidden lg:block">
                <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic">Operational <span className="text-white/20">Protocols</span></h2>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 p-2 pl-6 rounded-2xl">
             <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Neural Status: Optimized</span>
             <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-rose-500" />
             </div>
          </div>
        </header>

        <section className="space-y-24">
           {toolCategories.map((category, idx) => (
             <div key={idx}>
               <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.5em] mb-10 pl-4 border-l-2 border-rose-500/20">{category.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {category.tools.map((tool, tIdx) => (
                   <motion.button
                     key={tIdx}
                     whileHover={{ scale: 1.02, y: -5 }}
                     whileTap={{ scale: 0.98 }}
                     className="group relative flex flex-col items-start p-8 bg-white/2 border border-white/5 rounded-[2.5rem] text-left hover:bg-white/5 transition-all overflow-hidden"
                   >
                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="relative z-10 flex flex-col h-full w-full">
                        <div className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                           <tool.icon className={`w-7 h-7 ${tool.color}`} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                          {tool.name}
                        </h3>
                        <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors uppercase font-bold tracking-widest mb-6">
                          {tool.desc}
                        </p>
                        <div className="flex items-center justify-between w-full mt-auto">
                           <span className="text-[7px] font-black uppercase text-rose-500 tracking-[0.2em]">{tool.sector} Active</span>
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all shadow-lg active:scale-90">
                              <ArrowRightIcon className="w-4 h-4" />
                           </div>
                        </div>
                     </div>
                   </motion.button>
                 ))}
               </div>
             </div>
           ))}
        </section>

        <section className="mt-32">
           <div className="relative p-12 sm:p-20 rounded-[4rem] bg-gradient-to-br from-rose-500 to-rose-600 overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.1]" />
              <div className="absolute top-0 right-0 w-[50%] h-full bg-white/20 blur-[120px] -rotate-45 translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                 <div className="flex-1">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-950/20 rounded-full mb-8 border border-white/10">
                       <SparklesIcon className="w-5 h-5 text-white" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Assist v2.4</span>
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tighter mb-6 italic uppercase leading-none">Automate your <br className="hidden sm:block" /> operational logic.</h2>
                    <p className="text-sm sm:text-lg font-bold text-gray-950/60 uppercase tracking-widest">Connect with your neural concierge for real-time support.</p>
                 </div>
                 <button className="px-12 py-6 bg-gray-950 text-white text-xs font-black uppercase tracking-[0.4em] rounded-[2rem] hover:scale-105 transition-all shadow-2xl active:scale-95 whitespace-nowrap">
                    Engage Assistant
                 </button>
              </div>
           </div>
        </section>

        <FooterDock unreadCount={unreadCount} />
      </div>
    </div>
  );
}
