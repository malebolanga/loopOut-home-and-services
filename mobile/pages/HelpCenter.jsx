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
  ArrowLeftIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Zap, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All topics');

  const categories = [
    { title: 'Bookings', icon: HandThumbUpIcon, color: 'bg-blue-500' },
    { title: 'Listings & services', icon: QuestionMarkCircleIcon, color: 'bg-rose-500' },
    { title: 'Payments', icon: CreditCardIcon, color: 'bg-emerald-500' },
    { title: 'Safety & account', icon: ShieldCheckIcon, color: 'bg-amber-500' },
  ];

  const faqs = [
    { category: 'Bookings', q: 'Where can I find my bookings?', a: 'Open My Bookings or Trips from your profile to review booking information and status. Check Notifications for booking updates.', path: '/my-bookings' },
    { category: 'Bookings', q: 'How do I contact a service provider or host?', a: 'Open the listing and use its available contact or booking options. You can also check your Messages for conversations already started.', path: '/messages' },
    { category: 'Bookings', q: 'How do I cancel or change a booking?', a: 'Open the booking and review its cancellation terms. Contact the host or service provider through the available messaging or contact option to agree on changes.' },
    { category: 'Listings & services', q: 'What can I list on LoopOut?', a: 'LoopOut supports homes and stays, helper and local services, experiences or events, and items for sale. Available listing types depend on the create-listing flow.' },
    { category: 'Listings & services', q: 'How do I offer a service on LoopOut?', a: 'Choose Become a Helper and follow the listing steps to add your service, description, availability, location, and price.' },
    { category: 'Listings & services', q: 'How do I manage a listing?', a: 'Open your profile and go to Manage listings to review and update listings you created.' },
    { category: 'Payments', q: 'How do payments work for bookings?', a: 'Payment arrangements can differ by listing. Read the listing and booking details and agree on the amount and method with the provider before confirming. LoopOut does not automatically hold or refund direct payments made to providers.' },
    { category: 'Payments', q: 'How do I avoid payment misunderstandings?', a: 'Confirm the total price, what is included, and when payment is due before work or a stay begins. Keep messages and proof of payment.' },
    { category: 'Safety & account', q: 'How do I keep my account safe?', a: 'Use a strong password, keep your contact details current, and be cautious with requests for money or sensitive information. Report suspicious listings or messages through the available app controls.' },
    { category: 'Safety & account', q: 'Where can I change my profile or account details?', a: 'Open your profile to update personal information and account settings.' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All topics' || faq.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || `${faq.q} ${faq.a} ${faq.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-inter">
      {/* LoopOut Help Center */}
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
                <ArrowLeftIcon className="w-4 h-4" /> Back
               </button>

               <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 mb-8">
                  <LifebuoyIcon className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase">LoopOut Help Center</span>
               </div>

               <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-12">
                  HOW CAN WE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-200 to-white italic">HELP YOU?</span>
               </h1>

               <div className="relative w-full max-w-2xl mx-auto">
                  <input 
                    type="text"
                    placeholder="Search bookings, listings, payments, or account help..."
                    className="w-full px-8 py-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl text-xl font-medium text-white placeholder:text-gray-500 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all font-inter"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-rose-600 text-white rounded-[1.8rem] shadow-lg pointer-events-none">
                    <MagnifyingGlassIcon className="w-6 h-6" />
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            type="button"
            onClick={() => setActiveCategory('All topics')}
            className={`p-5 text-left bg-white dark:bg-gray-900 border rounded-2xl shadow-sm transition-all ${activeCategory === 'All topics' ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900' : 'border-gray-100 dark:border-gray-800'}`}
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-950 dark:text-white">All topics</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Browse all help articles</p>
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.title}
              onClick={() => setActiveCategory(cat.title)}
              className={`group p-5 text-left bg-white dark:bg-gray-900 border rounded-2xl shadow-sm transition-all hover:border-rose-300 ${activeCategory === cat.title ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900' : 'border-gray-100 dark:border-gray-800'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${cat.color} text-white rounded-xl flex items-center justify-center shadow-sm group-hover:rotate-3 transition-transform`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase text-gray-950 dark:text-white tracking-wider">{cat.title}</h3>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{faqs.filter((faq) => faq.category === cat.title).length} help articles</p>
            </button>
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
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.4em] uppercase">LoopOut guides</span>
               </div>
               <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-950 leading-none">
                  HELP WITH <br/>
                  <span className="text-gray-300">LOOPOUT.</span>
               </h2>
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, i) => (
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
                        <>{faq.a}{faq.path && <button type="button" onClick={() => navigate(faq.path)} className="ml-1 font-bold text-rose-600 underline underline-offset-2">Open {faq.path === '/messages' ? 'Messages' : 'My Bookings'}</button>}</>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {!filteredFaqs.length && <p className="rounded-2xl border border-gray-100 p-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">No help articles match that search. Try another word or choose All topics.</p>}
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
                      Ask LoopBot about LoopOut listings, homes and stays, local services, and how to use the app. It can guide you, but booking changes must be made through the booking or provider contact options.
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

      {/* Useful LoopOut pages */}
      <section className="bg-gray-50 dark:bg-gray-800 py-32 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white">Quick links</div>
             <h2 className="text-4xl font-black tracking-tighter text-gray-950 dark:text-white m-0 leading-none">Need help with something specific?</h2>
             <p className="text-gray-500 dark:text-gray-300 text-base font-medium mx-auto max-w-xl">Go directly to your bookings, notifications, or conversations with providers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'My Bookings', icon: HandThumbUpIcon, sub: 'Review booking details and status', path: '/my-bookings' },
              { label: 'Notifications', icon: LifebuoyIcon, sub: 'See booking and account updates', path: '/notifications' },
              { label: 'Messages', icon: ChatBubbleLeftEllipsisIcon, sub: 'Continue a conversation', path: '/messages' }
            ].map((channel, i) => (
              <button type="button" onClick={() => navigate(channel.path)} key={i} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-rose-300 transition-all group text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-10 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
                  <channel.icon className="w-10 h-10" />
                </div>
                <h4 className="text-sm font-black tracking-wide text-gray-950 dark:text-white mb-3">{channel.label}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{channel.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-gray-100 dark:border-gray-800 text-center">
         <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center">
               <span className="text-white font-black">L</span>
            </div>
            <p className="text-xs text-gray-500">LoopOut Help Center · 2026</p>
         </div>
      </footer>
    </div>
  );
}
