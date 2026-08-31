import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  HomeIcon, 
  UserGroupIcon, 
  CalendarDaysIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';

const ForBusiness = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const businessCategories = [
    {
      id: 'property',
      title: 'Property Hosting',
      description: 'List your luxury apartments, homes, or commercial spaces. Manage bookings with AI-powered yield optimization.',
      icon: <HomeIcon className="w-8 h-8 text-rose-500" />,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      action: () => navigate('/list'),
      tag: 'Real Estate'
    },
    {
      id: 'service',
      title: 'Professional Services',
      description: 'Scale your beauty salon, car wash, or maintenance business. Automated scheduling and POS integration.',
      icon: <SparklesIcon className="w-8 h-8 text-blue-500" />,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      action: () => navigate('/become'),
      tag: 'B2C Services'
    },
    {
      id: 'helper',
      title: 'Expert Helpers',
      description: 'Offer your skills as a tutor, cleaner, or personal chef. Control your schedule and earn securely.',
      icon: <UserGroupIcon className="w-8 h-8 text-amber-500" />,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      action: () => navigate('/become'),
      tag: 'Individual Professional'
    },
    {
      id: 'event',
      title: 'Event Excellence',
      description: 'Organize concerts, workshops, or exhibitions. Managed tickets and attendee engagement tools.',
      icon: <CalendarDaysIcon className="w-8 h-8 text-purple-500" />,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      action: () => navigate(currentUser ? `/${currentUser._id}/create-listing?tab=events` : '/sign-in'),
      tag: 'Entertainment'
    }
  ];

  const features = [
    {
      title: 'AI Insights',
      description: 'Powerful analytics to predict demand and optimize your pricing in real-time.',
      icon: <Sparkles className="w-6 h-6 text-rose-500" />
    },
    {
      title: 'Neural Dashboard',
      description: 'A cinematic command center to track every detail of your business operations.',
      icon: <ChartBarIcon className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Verified Trust',
      description: 'Secure identity protocols for both providers and customers to ensure safety.',
      icon: <ShieldCheckIcon className="w-6 h-6 text-green-500" />
    },
    {
      title: 'Global Reach',
      description: 'Put your brand in front of thousands of daily active users looking for excellence.',
      icon: <GlobeAltIcon className="w-6 h-6 text-purple-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800" 
            className="w-full h-full object-cover opacity-40"
            alt="Business Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div 
              variants={fadeIn}
              className="flex items-center gap-2 mb-6"
            >
              <div className="w-10 h-[1px] bg-rose-500" />
              <span className="text-rose-500 text-xs font-black tracking-[0.3em] uppercase">Scale Your Vision</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8"
            >
              EVERYTHING YOU NEED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-white to-blue-400 italic">
                TO DOMINATE.
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-xl"
            >
              Join the world's most sophisticated platform for properties, professional services, and local experts.
            </motion.p>

            <motion.div 
              variants={fadeIn}
              className="flex flex-wrap items-center gap-6"
            >
              <button 
                onClick={() => navigate('/become')}
                className="px-10 py-5 bg-white dark:bg-gray-900 text-gray-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-2xl flex items-center gap-3 group"
              >
                Start for Free
                <RocketLaunchIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                Request Demo
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col gap-4">
           {[
             { label: 'Active Businesses', value: '25k+' },
             { label: 'Daily Bookings', value: '180k+' },
             { label: 'Verified Reach', value: '1.2M+' }
           ].map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 1 + (i * 0.2) }}
               className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl min-w-[200px]"
             >
               <div className="text-2xl font-black text-white">{stat.value}</div>
               <div className="text-[10px] text-gray-500 dark:text-white font-bold uppercase tracking-widest">{stat.label}</div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-gray-950 tracking-tighter mb-4">Choose Your Path</h2>
          <p className="text-gray-500 dark:text-white max-w-lg mx-auto">Tailored professional experiences for every business model on the loopOut ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {businessCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1 } }
              }}
              whileHover={{ y: -10 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] overflow-hidden group border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all"
            >
              <div className="relative h-48">
                <img src={cat.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={cat.title} />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{cat.tag}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="mb-6 bg-white dark:bg-gray-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-950 tracking-tighter mb-4 leading-none">{cat.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white leading-relaxed mb-8">
                  {cat.description}
                </p>
                <button 
                  onClick={cat.action}
                  className="w-full py-4 bg-gray-950 text-white rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                >
                  Join the loop
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="bg-gray-50 dark:bg-gray-800 py-24 px-6 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative"
           >
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
                 <img src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Analytics" />
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent" />
              </div>
              {/* Overlay UI elements */}
              <div className="absolute -bottom-8 -right-8 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 hidden md:block">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                       <CurrencyDollarIcon className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="text-2xl font-black text-gray-950">R42,500</div>
                       <div className="text-[10px] text-gray-500 dark:text-white font-bold uppercase tracking-widest">Yield This Week</div>
                    </div>
                 </div>
                 <div className="w-48 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      transition={{ duration: 2 }}
                      className="h-full bg-green-500" 
                    />
                 </div>
              </div>
           </motion.div>

           <div>
              <div className="flex items-center gap-2 mb-4">
                 <BriefcaseIcon className="w-5 h-5 text-rose-500" />
                 <span className="text-rose-500 text-[10px] font-black tracking-[0.2em] uppercase">Intelligence First</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter mb-8 leading-[1.1]">
                 WE DON'T JUST LIST. <br />
                 <span className="text-gray-400">WE ACCELERATE.</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                 {features.map((feature, i) => (
                   <div key={i} className="flex flex-col gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                         {feature.icon}
                      </div>
                      <h4 className="text-lg font-black text-gray-950 tracking-tight">{feature.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-white leading-relaxed font-medium">{feature.description}</p>
                   </div>
                 ))}
              </div>

              <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
                 <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                       {[1,2,3,4].map(i => (
                         <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-4 border-white object-cover" alt="Partner" />
                       ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-white font-medium italic">"The transition to loopOut helped us increase our booking rate by 40% in just two months."</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
           <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 italic">READY TO LOOP IN?</h2>
           <p className="text-xl text-gray-400 mb-12 font-medium">Join the elite network of professional providers in South Africa.</p>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/become')}
                className="w-full md:w-auto px-12 py-6 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 active:scale-95 transition-all shadow-[0_0_40px_rgba(225,29,72,0.3)]"
              >
                Sign Up Your Business
              </button>
              <button className="w-full md:w-auto px-12 py-6 bg-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                Contact Sales
              </button>
           </div>

           <div className="mt-12 flex items-center justify-center gap-12 text-gray-500 dark:text-white grayscale opacity-50">
              <div className="font-black text-xl italic tracking-tighter">ELITE PARTNERS</div>
              <div className="font-black text-xl italic tracking-tighter">GLOBAL REACH</div>
              <div className="font-black text-xl italic tracking-tighter">AI POWERED</div>
           </div>
        </div>
      </section>
      
      {/* Mini Footer */}
      <footer className="py-12 bg-gray-950 border-t border-white/5 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black">L</span>
               </div>
               <span className="text-white font-black tracking-tighter text-xl uppercase">loopOut <span className="text-rose-600">Business</span></span>
            </div>
            <div className="flex gap-8 text-[10px] font-black text-gray-500 dark:text-white uppercase tracking-widest">
               <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
               <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
               <button onClick={() => navigate('/help-center')} className="hover:text-white transition-colors">Help Center</button>
               <button onClick={() => navigate('/trust')} className="hover:text-white transition-colors">Safety</button>
            </div>
            <p className="text-gray-600 dark:text-white text-[10px] font-medium tracking-tight">© 2026 loopOut South Africa. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
};

export default ForBusiness;
