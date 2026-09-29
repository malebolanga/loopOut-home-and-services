import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  PencilSquareIcon, 
  CloudArrowUpIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ChevronRightIcon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Rocket, Zap, Heart } from 'lucide-react';

const Become = () => {
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);

  const steps = [
    {
      id: '01',
      title: 'Initialize Protocol',
      desc: 'Create your elite account in seconds. We verify every identity to maintain our high-fidelity community standards.',
      icon: <UserPlusIcon className="w-8 h-8 text-rose-500" />,
      color: 'bg-rose-50'
    },
    {
      id: '02',
      title: 'Craft Your Presence',
      desc: 'Upload stunning visuals and define your offering. Use our AI tools to optimize your listing for maximum performance.',
      icon: <PencilSquareIcon className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      id: '03',
      title: 'Go Live & Dominate',
      desc: 'Publish your listing to the global marketplace. Start receiving verified bookings and tracking yield in real-time.',
      icon: <CloudArrowUpIcon className="w-8 h-8 text-emerald-500" />,
      color: 'bg-emerald-50'
    }
  ];

  const categories = [
    { name: 'Stays', icon: <HomeIcon className="w-6 h-6" />, path: currentUser ? `/${currentUser._id}/create-listing?tab=stays` : '/sign-in' },
    { name: 'Helpers', icon: <UserGroupIcon className="w-6 h-6" />, path: currentUser ? `/${currentUser._id}/create-listing?tab=online` : '/sign-in' },
    { name: 'Services', icon: <BriefcaseIcon className="w-6 h-6" />, path: currentUser ? `/${currentUser._id}/create-listing?tab=experiences` : '/sign-in' },
    { name: 'Events', icon: <CalendarDaysIcon className="w-6 h-6" />, path: currentUser ? `/${currentUser._id}/create-listing?tab=events` : '/sign-in' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800/50">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-950">
         <div className="absolute inset-0">
            <motion.img 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2 }}
              src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/80 to-gray-950" />
         </div>

         <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6"
            >
               <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-rose-500 fill-rose-500" />
                  <span className="text-rose-500 text-xs font-black tracking-[0.4em] uppercase">The Onboarding Protocol</span>
               </div>
               <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
                  YOUR JOURNEY TO <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-white to-blue-400 italic">ELITE STATUS.</span>
               </h1>
               <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                  Join the world's most sophisticated network. Transform your potential into performance with loopOut Business solutions.
               </p>
            </motion.div>
         </div>
      </section>

      {/* Stepper Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-32 relative z-20 mb-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 dark:border-gray-800 flex flex-col gap-8 group hover:border-gray-950 transition-all duration-500"
              >
                 <div className="flex justify-between items-start">
                    <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                       {step.icon}
                    </div>
                    <span className="text-4xl font-black text-gray-100 group-hover:text-gray-950 transition-colors">{step.id}</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-gray-950 tracking-tighter mb-4">{step.title}</h3>
                    <p className="text-gray-500 dark:text-white font-medium leading-relaxed">{step.desc}</p>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Action Hub */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
         <div className="bg-gray-950 rounded-[3.5rem] p-12 lg:p-20 overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 blur-[150px] rounded-full" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-8 leading-tight">
                     WHAT ARE YOU <br />
                     <span className="text-gray-500 dark:text-white italic">DOMINATING TODAY?</span>
                  </h2>
                  <p className="text-gray-400 mb-12 text-lg font-medium">Choose your sector and begin your listing journey. Our AI will guide you through every optimization.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {categories.map((cat, i) => (
                       <button
                         key={i}
                         onClick={() => navigate(cat.path)}
                         className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 hover:border-white/20 transition-all group"
                       >
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-rose-400 transition-colors">
                            {cat.icon}
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest">{cat.name}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="relative">
                  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] animate-pulse-slow">
                     <div className="flex items-center gap-4 mb-8">
                        <CheckBadgeIcon className="w-8 h-8 text-rose-500" />
                        <div>
                           <div className="text-white font-black uppercase tracking-widest text-xs">Verification Suite</div>
                           <div className="text-emerald-400 text-[10px] font-bold">IDENTITY PROTOCOL ACTIVE</div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        {[
                          { label: 'Biometric Check', status: 'Passed' },
                          { label: 'Security Deposit', status: 'Secured' },
                          { label: 'Community Trust', status: 'Elite Tier' }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 text-sm">
                             <span className="text-gray-500 dark:text-white font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
                             <span className="text-white font-black">{item.status}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Value Prepositions */}
      <section className="max-w-7xl mx-auto px-6 mb-24 grid grid-cols-1 md:grid-cols-3 gap-12">
         {[
           {
             title: 'Neural Payouts',
             desc: 'Automated, instant payouts with full transparency on every transaction fee.',
             icon: <BanknotesIcon className="w-10 h-10 text-rose-600" />
           },
           {
             title: 'Guardian Shield',
             desc: 'R1M in property and liability coverage for all elite hosts and providers.',
             icon: <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
           },
           {
             title: 'Pulse Community',
             desc: 'Join a network of top-tier professionals sharing insights and growing together.',
             icon: <Heart className="w-10 h-10 text-pink-600 shadow-xl" />
           }
         ].map((item, i) => (
           <div key={i} className="flex flex-col gap-6 p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                 {item.icon}
              </div>
              <h4 className="text-xl font-black text-gray-950 tracking-tighter">{item.title}</h4>
              <p className="text-gray-500 dark:text-white font-medium leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </section>

      {/* Global CTA */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900 text-center border-t border-gray-100 dark:border-gray-800">
         <div className="max-w-3xl mx-auto">
            <Zap className="w-12 h-12 text-rose-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter mb-8 leading-none">
               ENOUGH READING. <br />
               <span className="text-gray-400">LET'S BUILD WEALTH.</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
               <button 
                 onClick={() => navigate('/sign-up')}
                 className="w-full md:w-auto px-12 py-6 bg-gray-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
               >
                 Create Your Account
                 <Rocket className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => navigate('/contact')}
                 className="w-full md:w-auto px-12 py-6 border-2 border-gray-200 dark:border-gray-800 text-gray-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
               >
                 Talk to a Growth Expert
               </button>
            </div>
            
            <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">No subscription fees. No hidden costs. Pay as you earn.</p>
         </div>
      </section>
      
      {/* Mini Footer Area */}
      <footer className="py-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">L</span>
               </div>
               <span className="text-gray-950 font-black tracking-tighter text-lg uppercase">loopOut <span className="text-rose-600">Protocol</span></span>
            </div>
            <div className="flex gap-8 text-[10px] font-black text-gray-500 dark:text-white uppercase tracking-widest">
               <button onClick={() => navigate('/privacy')} className="hover:text-rose-600 transition-colors">Privacy</button>
               <button onClick={() => navigate('/terms')} className="hover:text-rose-600 transition-colors">Terms</button>
               <button onClick={() => navigate('/help-center')} className="hover:text-rose-600 transition-colors">Help Center</button>
               <button onClick={() => navigate('/trust')} className="hover:text-rose-600 transition-colors">Safety</button>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">© 2026 loopOut Onboarding Hub.</p>
         </div>
      </footer>
      
      {/* Visual Progress Footer */}
      <div className="h-2 bg-gradient-to-r from-rose-500 via-blue-500 to-emerald-500" />
    </div>
  );
};

export default Become;
