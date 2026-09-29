import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  QuestionMarkCircleIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    { title: 'Booking & Stays', icon: HandThumbUpIcon, count: 42, color: 'bg-blue-500' },
    { title: 'Hosting on loopOut', icon: QuestionMarkCircleIcon, count: 28, color: 'bg-rose-500' },
    { title: 'Payments & Refunds', icon: CreditCardIcon, count: 19, color: 'bg-emerald-500' },
    { title: 'Trust & Safety', icon: ShieldCheckIcon, count: 35, color: 'bg-amber-500' },
  ];

  const faqs = [
    { 
      q: "How do I verify my identity established signal?", 
      a: "Go to your profile settings and select 'Identity Verification'. Follow the neural scanning protocol to link your physical ID with your loopOut account." 
    },
    { 
      q: "What is the loopOut cancellation protocol?", 
      a: "Cancellation policies vary by host. You can find the specific protocol for your booking under the 'Trips' tab in your dashboard." 
    },
    { 
      q: "How do I become a Masterpiece Elite host?", 
      a: "Elite status is granted to hosts who maintain a 4.9+ rating and complete the neural trust verification process." 
    },
    { 
      q: "Are operational yields processed immediately?", 
      a: "Yes, once a signal is closed (stay completed), your yield is moved to the 'Financial Grid' for withdrawal within 24-48 hours." 
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-inter">
      {/* Cinematic Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden bg-gray-950 text-center">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950 to-white" />
         </div>

         <div className="relative z-10 px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
               <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white hover:text-rose-500 transition-colors mb-12"
               >
                <ArrowLeftIcon className="w-4 h-4" /> Back to neural grid
               </button>

               <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 mb-8">
                  <LifebuoyIcon className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase underline underline-offset-4">Mission Control v2.0</span>
               </div>

               <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-12">
                  HOW CAN WE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-200 to-white italic">SERVE YOU?</span>
               </h1>

               <div className="relative w-full max-w-2xl mx-auto">
                  <input 
                    type="text"
                    placeholder="Search for articles, protocols, or help..."
                    className="w-full px-8 py-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl text-xl font-medium text-white placeholder:text-gray-500 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all font-inter"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-rose-600 text-white rounded-[1.8rem] shadow-lg">
                    <MagnifyingGlassIcon className="w-6 h-6" />
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="group p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[3rem] shadow-2xl shadow-gray-200/50 cursor-pointer hover:border-rose-200 transition-all"
            >
              <div className={`w-14 h-14 ${cat.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform mb-8`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black uppercase text-gray-950 tracking-widest mb-2">{cat.title}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.count} Articles Available</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ & AI Promotion */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="flex-1 space-y-12">
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.4em] uppercase">Intelligence Base</span>
               </div>
               <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-950 leading-none">
                  FREQUENTLY <br/>
                  <span className="text-gray-300">ASKED QUESTIONS.</span>
               </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden transition-all shadow-sm hover:shadow-md"
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-900 dark:text-white pr-8">{faq.q}</span>
                    <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === i ? 'rotate-90 text-rose-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 text-sm font-medium text-gray-500 dark:text-white leading-relaxed max-w-2xl"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-[400px]">
            <div className="sticky top-32 p-12 bg-gray-950 rounded-[3.5rem] text-white shadow-2xl overflow-hidden group">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[60px] pointer-events-none group-hover:bg-rose-500/30 transition-colors" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />
               
               <div className="relative z-10 space-y-10">
                  <div className="w-14 h-14 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-rose-500 shadow-xl">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic tracking-tighter mb-4 leading-none text-white">LOOPBOT AI <br/>COPILOT</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      Launch LoopBot, our intelligent marketplace concierge, to find rooms, book verified helpers, and answer escrow questions in real-time.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/loopbot')}
                    className="w-full py-6 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
                  >
                    Chat With LoopBot
                    <Zap className="w-4 h-4 fill-current" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="bg-gray-50 dark:bg-gray-800 py-32 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white">Manual Transmission</div>
             <h2 className="text-5xl font-black tracking-tighter text-gray-950 m-0 leading-none italic">STILL NEED SUPPORT?</h2>
             <p className="text-gray-400 text-lg font-medium mx-auto max-w-xl">Our human operators are available for escalated mission-critical inquiries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Neural Chat', icon: ChatBubbleLeftEllipsisIcon, sub: 'Active 24/7' },
              { label: 'Signal Support', icon: PhoneIcon, sub: '+27 00 000 0000' },
              { label: 'Transmission', icon: EnvelopeIcon, sub: 'support@loopout.com' }
            ].map((channel, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 hover:border-rose-200 transition-all group">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-10 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
                  <channel.icon className="w-10 h-10" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-950 mb-3">{channel.label}</h4>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">{channel.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-gray-100 dark:border-gray-800 text-center">
         <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center">
               <span className="text-white font-black">L</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">loopOut Neural Network © 2026</p>
         </div>
      </footer>
    </div>
  );
}
