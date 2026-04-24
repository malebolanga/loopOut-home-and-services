import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  HandRaisedIcon, 
  ChartPieIcon, 
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Cookie, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
  const navigate = useNavigate();

  const cookieTypes = [
    {
      type: "Essential Tokens",
      icon: <ShieldCheckIcon className="w-8 h-8 text-rose-500" />,
      purpose: "Critical for platform stability and authentication protocols. These cannot be disabled.",
      details: ["User Authentication", "Secure Session Management", "CSRF Protection"]
    },
    {
      type: "Neural Analytics",
      icon: <ChartPieIcon className="w-8 h-8 text-blue-500" />,
      purpose: "Helping us optimize the marketplace flow through anonymized usage data.",
      details: ["Performance Metrics", "Page Affinity Tracking", "A/B Signal Testing"]
    },
    {
      type: "UX Personalization",
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      purpose: "Remembering your unique preferences to curate your loopOut experience.",
      details: ["Currency Preferences", "Search Filters", "Interface Customization"]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Cinematic Header */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-gray-950 text-center">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1471')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950 to-white" />
         </div>

         <div className="relative z-10 px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 mb-8">
                  <Cookie className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase underline underline-offset-4">Token Protocol v2.4</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-8">
                  TOKEN <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-200 to-white italic">MANAGEMENT.</span>
               </h1>
               <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                  Transparent disclosure of our digital identifiers and how they optimize your journey through the loopOut ecosystem.
               </p>
            </motion.div>
         </div>
      </section>

      {/* Main Framework */}
      <main className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-32">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {cookieTypes.map((cookie, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col gap-6"
              >
                 <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner">
                    {cookie.icon}
                 </div>
                 <h3 className="text-2xl font-black text-gray-950 tracking-tighter">{cookie.type}</h3>
                 <p className="text-sm text-gray-500 leading-relaxed font-medium">{cookie.purpose}</p>
                 <div className="mt-4 pt-6 border-t border-gray-100 space-y-3">
                    {cookie.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                         {detail}
                      </div>
                    ))}
                 </div>
              </motion.div>
            ))}
         </div>

         {/* Detailed Matrix */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            <div className="lg:col-span-12">
               <div className="flex items-center gap-3 mb-8">
                  <Settings2 className="w-6 h-6 text-rose-500" />
                  <h2 className="text-4xl font-black text-gray-950 tracking-tighter m-0">Protocol Matrix</h2>
               </div>
               
               <div className="overflow-hidden bg-gray-50 rounded-[3rem] border border-gray-100">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-gray-200/60">
                           <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Identifier</th>
                           <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Service Purpose</th>
                           <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Lifespan</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {[
                          { name: 'loop_auth_v2', purpose: 'Encrypted user session and secure route authorization.', duration: '12 Months' },
                          { name: 'neural_pref_id', purpose: 'Localized storage for interface and search optimization.', duration: '30 Days' },
                          { name: 'signal_consent', purpose: 'Persistent record of your privacy and token choices.', duration: 'Permanent' },
                          { name: 'stripe_token_v4', purpose: 'Fraud prevention and payment processing stabilization.', duration: '24 Hours' }
                        ].map((row, i) => (
                          <tr key={i} className="group hover:bg-white transition-colors">
                             <td className="p-8">
                                <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">{row.name}</span>
                             </td>
                             <td className="p-8 font-medium text-gray-600 leading-relaxed max-w-md">{row.purpose}</td>
                             <td className="p-8">
                                <div className="flex items-center gap-2">
                                   <ClockIcon className="w-4 h-4 text-gray-300" />
                                   <span className="text-sm font-black text-gray-950">{row.duration}</span>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </main>

      {/* Control Panel */}
      <section className="py-24 px-6 bg-gray-950 text-white relative overflow-hidden">
         <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            <div className="text-center lg:text-left">
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 italic leading-none">TAKE CONTROL.</h2>
               <p className="text-gray-400 font-medium max-w-md">Adjust your neural signals and token preferences through our decentralized consent manager.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
               <button className="px-12 py-6 bg-white text-gray-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-2xl">
                  Update Settings
               </button>
               <button onClick={() => navigate('/privacy')} className="px-12 py-6 bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  Privacy Policy
               </button>
            </div>
         </div>
         {/* Decorative light beam */}
         <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-rose-500/20 to-transparent" />
      </section>

      {/* Mini Footer */}
      <footer className="py-12 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
         <div className="flex items-center gap-6">
            <span className="text-gray-300">© 2026 loopOut Global</span>
            <div className="w-[1px] h-4 bg-gray-200" />
            <button onClick={() => navigate('/contact')} className="hover:text-rose-500 transition-colors">Safety Officer</button>
            <button onClick={() => navigate('/')} className="hover:text-rose-500 transition-colors">Back to Home</button>
         </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;
