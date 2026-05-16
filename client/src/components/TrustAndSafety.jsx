import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  UserPlusIcon, 
  VideoCameraIcon, 
  LockClosedIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Sparkles, ShieldAlert, Fingerprint, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrustAndSafety = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Verified Partners', value: '99.9%' },
    { label: 'Safety Response', value: '8 Mins' },
    { label: 'Protection Coverage', value: 'R1M' }
  ];

  const pillars = [
    {
      title: 'Multilayer Verification',
      desc: 'Every business partner and guest undergoes a rigorous identity sync involving biometric validation and background screening.',
      icon: <Fingerprint className="w-8 h-8" />,
      color: 'bg-rose-50'
    },
    {
      title: 'Encrypted Interactions',
      desc: 'All communications and payment data are protected by bank-level neural encryption, keeping your financial signals secure.',
      icon: <LockClosedIcon className="w-8 h-8" />,
      color: 'bg-blue-50'
    },
    {
      title: '24/7 Guardian Support',
      desc: 'Our dedicated safety team is available around the clock to manage incidents and coordinate with local South African authorities.',
      icon: <LifeBuoy className="w-8 h-8" />,
      color: 'bg-emerald-50'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Cinematic Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-950 text-center">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/80 to-white" />
         </div>

         <div className="relative z-10 px-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 mb-8">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.4em] uppercase">Security Standard 2026</span>
               </div>
               <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-10">
                  TRUSTED <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-white to-gray-500 italic">BEYOND CODE.</span>
               </h1>
               <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex flex-col items-center">
                       <span className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">{m.value}</span>
                       <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{m.label}</span>
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      {/* Verification Layer */}
      <section className="max-w-7xl mx-auto px-6 py-24">
         <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-gray-950 tracking-tighter mb-4">Verification Layer</h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">Our rigorous verification protocol ensures that every member of the loopOut community is authenticated and accountable.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-12 bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col gap-8 group"
              >
                 <div className={`w-20 h-20 ${pillar.color} rounded-[2rem] flex items-center justify-center text-gray-950 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-lg`}>
                    {pillar.icon}
                 </div>
                 <h3 className="text-2xl font-black text-gray-950 tracking-tighter leading-none">{pillar.title}</h3>
                 <p className="text-sm text-gray-500 leading-relaxed font-medium">{pillar.desc}</p>
              </motion.div>
            ))}
         </div>

         {/* Emergency Response Section */}
         <div className="bg-gray-950 rounded-[4rem] overflow-hidden relative shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
               <div className="p-12 lg:p-20 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-8">
                     <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center">
                        <PhoneIcon className="w-6 h-6 text-rose-500" />
                     </div>
                     <span className="text-rose-500 text-xs font-black uppercase tracking-widest">Global Safety Line</span>
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter m-0 mb-8 leading-none">
                     8-MINUTE <br />
                     <span className="italic text-gray-400">RESPONSE.</span>
                  </h2>
                  <p className="text-gray-400 text-lg mb-12">Our emergency team is stationed strategically to provide immediate assistance whenever a protocol alert is triggered.</p>
                  <div className="flex flex-wrap gap-4">
                     <button className="px-10 py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-950/20 hover:bg-rose-500 transition-all">
                        Call Safety HQ
                     </button>
                     <button className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                        Safety Checklist
                     </button>
                  </div>
               </div>
               <div className="relative h-96 lg:h-auto overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                    alt="Operations Center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/20 to-transparent" />
               </div>
            </div>
         </div>
      </section>

      {/* Community Standards Matrix */}
      <section className="bg-gray-50 py-32 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
               <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter mb-8 leading-tight">
                  ELITE STANDARDS <br />
                  <span className="text-gray-400">FOR ELITE SERVICES.</span>
               </h2>
               <div className="space-y-6">
                  {[
                    { label: 'Proactive Monitoring', desc: 'AI-driven detection of anomalous booking behaviors.' },
                    { label: 'Asset Protection', desc: 'R1M liability shield for all verified property hosts.' },
                    { label: 'Dispute Resolution', desc: 'Neural-arbitration to ensure fair and rapid outcomes.' }
                  ].map((std, i) => (
                    <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-start gap-6">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs">
                          {i+1}
                       </div>
                       <div>
                          <h4 className="font-black text-gray-950 text-lg mb-1">{std.label}</h4>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed">{std.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-rose-500/20 rounded-[3.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative space-y-4">
                  <div className="p-8 bg-gray-950 rounded-[2.5rem] text-white">
                     <DocumentCheckIcon className="w-10 h-10 text-rose-500 mb-6" />
                     <h4 className="text-xl font-black mb-3 italic tracking-tighter text-white">The Guarantee.</h4>
                     <p className="text-gray-400 text-sm leading-relaxed">loopOut ensures that every stay and service meets our high-fidelity quality protocols or your financial commitment is protected.</p>
                  </div>
                  <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl">
                     <ExclamationCircleIcon className="w-10 h-10 text-rose-500 mb-6" />
                     <h4 className="text-xl font-black mb-3 tracking-tighter text-gray-950">Report an Incident.</h4>
                     <p className="text-gray-500 text-sm leading-relaxed mb-6">Immediate protocol trigger for any safety or property concerns.</p>
                     <button onClick={() => navigate('/contact')} className="w-full py-4 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
                        Launch Alert
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-12 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
         <button onClick={() => navigate('/terms')} className="hover:text-rose-500 transition-colors">Terms of Service</button>
         <div className="w-[1px] h-4 bg-gray-200" />
         <button onClick={() => navigate('/privacy')} className="hover:text-rose-500 transition-colors">Privacy Policy</button>
         <div className="w-[1px] h-4 bg-gray-200" />
         <button onClick={() => navigate('/')} className="hover:text-rose-500 transition-colors">Safety Dashboard</button>
      </footer>
    </div>
  );
};

export default TrustAndSafety;
