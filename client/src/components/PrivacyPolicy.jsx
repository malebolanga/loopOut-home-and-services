import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EyeIcon, 
  UserCircleIcon,
  CloudIcon,
  BellIcon,
  ArrowPathIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Fingerprint, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const protocols = [
    {
      title: 'Identity Shield',
      desc: 'Your genetic identity and biometrics are encrypted at the edge. We never store raw identifying signals.',
      icon: <Fingerprint className="w-6 h-6" />
    },
    {
      title: 'Neural Encryption',
      desc: 'End-to-end encryption for all messages and booking data. Your interactions are your private property.',
      icon: <LockClosedIcon className="w-6 h-6" />
    },
    {
      title: 'Data Sovereignty',
      desc: 'You own your data. Export or delete your entire digital footprint from the loopOut network at any time.',
      icon: <Database className="w-6 h-6" />
    }
  ];

  const dataCollection = [
    { label: 'Profile Intelligence', detail: 'Name, contact signals, and verified credentials for ecosystem trust.' },
    { label: 'Market Preferences', detail: 'Search history and saved items to train your personalized discovery engine.' },
    { label: 'Secure Payments', detail: 'Encrypted financial tokens handled via global-standard vaulting services.' },
    { label: 'Usage Metrics', detail: 'Telemetry data to optimize marketplace performance and neural matching.' }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Cinematic Header */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-950">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1470')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950 to-white" />
         </div>

         <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center gap-8"
            >
               <div className="flex items-center gap-3 mb-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.4em] uppercase font-inter">Security Protocol Active</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none m-0">
                  NEURAL <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-200 to-white italic">PRIVACY.</span>
               </h1>
               <p className="max-w-xl text-gray-500 text-lg font-medium leading-relaxed">
                  Protecting your digital sovereignty within the loopOut ecosystem through advanced encryption and ethical data governance.
               </p>
            </motion.div>
         </div>
      </section>

      {/* Protocol Dashboard */}
      <section className="max-w-7xl mx-auto px-6 -mt-24 relative z-20 pb-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {protocols.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200 group hover:border-rose-200 transition-colors"
              >
                 <div className="w-16 h-16 bg-gray-950 text-white rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-rose-600 transition-colors shadow-xl">
                    {p.icon}
                 </div>
                 <h3 className="text-2xl font-black text-gray-950 tracking-tighter mb-4">{p.title}</h3>
                 <p className="text-sm text-gray-500 leading-relaxed font-medium">{p.desc}</p>
              </motion.div>
            ))}
         </div>

         {/* Detailed Disclosure */}
         <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-12 h-[2px] bg-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase">Data Intelligence</span>
               </div>
               <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter mb-10 leading-none">
                  What signals do we <br />
                  <span className="text-gray-400">capture?</span>
               </h2>
               <div className="space-y-8">
                  {dataCollection.map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all font-black text-xs">
                          0{i+1}
                       </div>
                       <div>
                          <h4 className="font-black text-gray-950 text-lg mb-2 tracking-tight">{item.label}</h4>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.detail}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gray-50 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden">
               <div className="relative z-10">
                  <Sparkles className="w-12 h-12 text-rose-500 mb-8" />
                  <h3 className="text-3xl font-black text-gray-950 tracking-tighter mb-8 italic">Your Rights, Optimized.</h3>
                  <div className="space-y-6">
                     {[
                       'Right to data portability and extraction.',
                       'Right to neural record rectification.',
                       'Right to protocol termination (Forgotten).',
                       'Right to manual human intervention.'
                     ].map((right, i) => (
                       <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-0 font-bold text-gray-700 text-sm">
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          {right}
                       </div>
                     ))}
                  </div>
                  <button className="mt-12 px-10 py-5 bg-gray-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl">
                     Manage Privacy Dashboard
                  </button>
               </div>
               {/* Decorative background pulse */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full animate-pulse" />
            </div>
         </div>
      </section>

      {/* Global Transparency Commitments */}
      <section className="py-32 px-6 bg-gray-950 text-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-12 text-center mb-20">
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic">TRUST THROUGH CODE.</h2>
            </div>
            
            <div className="lg:col-span-4 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem]">
               <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">Retention Policy</h4>
               <p className="text-gray-200 font-medium leading-relaxed mb-8">We store transaction history for exactly 7 years as per South African financial regulations. All other neural signals are purged 12 months after inactivity.</p>
               <BellIcon className="w-8 h-8 text-rose-500" />
            </div>

            <div className="lg:col-span-4 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem]">
               <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">Edge Hosting</h4>
               <p className="text-gray-200 font-medium leading-relaxed mb-8">Your data resides in secure, local nodes within the Republic of South Africa, ensuring maximum speed and jurisdictional compliance.</p>
               <CloudIcon className="w-8 h-8 text-blue-400" />
            </div>

            <div className="lg:col-span-4 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem]">
               <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">Zero-Knowledge</h4>
               <p className="text-gray-200 font-medium leading-relaxed mb-8">Whenever possible, we use zero-knowledge proofs for verification, allowing us to confirm your identity without ever seeing your private keys.</p>
               <EyeIcon className="w-8 h-8 text-purple-400" />
            </div>
         </div>
      </section>

      {/* Final Action Hub */}
      <section className="py-24 px-6 text-center">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-8 leading-tight">
               QUESTIONS ON YOUR DATA? <br />
               <span className="text-gray-400">OUR SHIELD IS READY.</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
               <button 
                 onClick={() => navigate('/contact')}
                 className="w-full md:w-auto px-12 py-6 bg-gray-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
               >
                 Contact Privacy Hub
                 <LifebuoyIcon className="w-5 h-5 text-rose-500" />
               </button>
               <button 
                 onClick={() => navigate('/terms')}
                 className="w-full md:w-auto px-12 py-6 border-2 border-gray-200 text-gray-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all font-inter"
               >
                 Review Terms of Service
               </button>
            </div>
         </div>
      </section>

      {/* Sub-Footer Mini */}
      <footer className="py-12 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
         <button onClick={() => navigate('/terms')} className="hover:text-rose-500 transition-colors">Terms of Engagement</button>
         <div className="w-1 h-1 bg-gray-200 rounded-full" />
         <button onClick={() => navigate('/trust')} className="hover:text-rose-500 transition-colors">Safety Protocol</button>
         <div className="w-1 h-1 bg-gray-200 rounded-full" />
         <button onClick={() => navigate('/')} className="hover:text-rose-500 transition-colors">Back to Home</button>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;