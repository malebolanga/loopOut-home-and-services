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
  SparklesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    { title: 'Booking & Stays', icon: HandThumbUpIcon, count: 42, color: 'bg-blue-500' },
    { title: 'Hosting on LoopOut', icon: QuestionMarkCircleIcon, count: 28, color: 'bg-rose-500' },
    { title: 'Payments & Refunds', icon: CreditCardIcon, count: 19, color: 'bg-emerald-500' },
    { title: 'Trust & Safety', icon: ShieldCheckIcon, count: 35, color: 'bg-amber-500' },
  ];

  const faqs = [
    { 
      q: "How do I verify my identity established signal?", 
      a: "Go to your profile settings and select 'Identity Verification'. Follow the neural scanning protocol to link your physical ID with your LoopOut account." 
    },
    { 
      q: "What is the LoopOut cancellation protocol?", 
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 -z-10">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-rose-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-600 transition-colors mb-12"
          >
            <ArrowLeftIcon size={14} /> Back to neural grid
          </button>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic text-gray-950 mb-8 leading-none">
            HOW CAN WE <br/>
            <span className="text-gray-300">HELP YOU?</span>
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <input 
              type="text"
              placeholder="Search for articles, protocols, or help..."
              className="w-full px-8 py-7 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-rose-500 text-white rounded-[1.8rem] shadow-lg">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="group p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] cursor-pointer hover:bg-white hover:shadow-2xl hover:border-transparent transition-all"
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
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-50">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1 space-y-10">
            <div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-4">Top Support Intelligence</p>
              <h2 className="text-4xl font-black tracking-tighter italic text-gray-950">FREQUENTLY <span className="text-gray-300">ASKED</span></h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden transition-all"
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-8 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-900 pr-8">{faq.q}</span>
                    <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 text-xs font-medium text-gray-500 leading-relaxed max-w-xl"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-32 p-10 bg-gray-950 rounded-[3rem] text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[60px] pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 blur-[60px] pointer-events-none" />
               
               <div className="relative z-10 space-y-8">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <SparklesIcon className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter mb-4">NEURAL <br/>ASSISTANT</h3>
                    <p className="text-white/50 text-[11px] font-medium leading-relaxed">
                      Need immediate help? Our AI Support Specialist is active and ready to assist with complex inquiries.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/ai-help-center')}
                    className="w-full py-5 bg-white text-gray-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Deploy Assistant
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="bg-gray-50 py-32 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <h2 className="text-4xl font-black tracking-tighter italic text-gray-950 uppercase">Still need <span className="text-gray-300">support?</span></h2>
            <p className="text-gray-400 text-sm font-medium">Contact our specialized agents via your preferred neural channel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Neural Chat', icon: ChatBubbleLeftEllipsisIcon, sub: 'Active 24/7' },
              { label: 'Signal Support', icon: PhoneIcon, sub: '+27 00 000 0000' },
              { label: 'Transmission', icon: EnvelopeIcon, sub: 'support@loopout.com' }
            ].map((channel, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                  <channel.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-950 mb-2">{channel.label}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{channel.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">LoopOut Neural Network © 2026</p>
      </footer>
    </div>
  );
}
