import React from 'react';
import { motion } from 'framer-motion';
import { 
  ScaleIcon, 
  ShieldCheckIcon, 
  LockClosedIcon, 
  DocumentTextIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Sparkles, Gavel, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'introduction',
      title: 'Foundation & Scope',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      content: 'loopOut Home (Pty) Ltd operates the definitive marketplace for extraordinary stays and elite services. By accessing our neural network, you agree to comply with our high-fidelity community standards and operational protocols.'
    },
    {
      id: 'clients',
      title: 'Partner Obligations',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      content: 'Our business partners are bound by specialized contracts designed to ensure elite service delivery and maintained property excellence. Discrepancies between these terms and individual contracts favor the latter.'
    },
    {
      id: 'privacy',
      title: 'Neural Privacy',
      icon: <LockClosedIcon className="w-6 h-6" />,
      content: 'We process biometric and usage data with absolute precision. Your data is your property, utilized only to enhance your experience and secure your interactions within the loop ecosystem.'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Cinematic Header */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gray-950">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950 to-white" />
         </div>

         <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6"
            >
               <div className="flex items-center gap-2 mb-2">
                  <Gavel className="w-5 h-5 text-rose-500" />
                  <span className="text-rose-500 text-[10px] font-black tracking-[0.4em] uppercase underline underline-offset-8">Legal Framework v2.0</span>
               </div>
               <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                  TERMS OF <br />
                  <span className="text-gray-500 italic">ENGAGEMENT.</span>
               </h1>
               <div className="flex items-center gap-4 text-gray-500 text-xs font-bold uppercase tracking-widest mt-4">
                  <span>Last Updated: April 2026</span>
                  <div className="w-1 h-1 bg-rose-500 rounded-full" />
                  <span>Effective Immediately</span>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 space-y-4">
               <div className="sticky top-24 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest mb-8 flex items-center gap-3">
                     <InformationCircleIcon className="w-5 h-5 text-rose-500" />
                     Quick Access
                  </h3>
                  <nav className="flex flex-col gap-2">
                     {['Foundation', 'Partner Obligations', 'User Conduct', 'Data Encryption', 'Liability Shield', 'Governing Law'].map((item, i) => (
                       <button 
                         key={i} 
                         className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all text-sm font-bold text-gray-400 hover:text-gray-950 group"
                       >
                          {item}
                          <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </button>
                     ))}
                  </nav>
               </div>
            </aside>

            {/* Document Content */}
            <div className="lg:col-span-8 space-y-16">
               
               {/* Highlighted Sections */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sections.map((section, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col gap-6"
                    >
                       <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                          {section.icon}
                       </div>
                       <h3 className="text-xl font-black text-gray-950 tracking-tighter">{section.title}</h3>
                       <p className="text-sm text-gray-500 leading-relaxed font-medium">{section.content}</p>
                    </motion.div>
                  ))}
               </div>

               {/* Detailed Articles */}
               <div className="space-y-12">
                  <section className="prose prose-rose max-w-none">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="px-4 py-1.5 bg-gray-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Article 01</div>
                        <h2 className="text-3xl font-black text-gray-950 tracking-tighter m-0">Website Use & Restrictions</h2>
                     </div>
                     <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        The loopOut ecosystem is a high-fidelity environment. Users are prohibited from using automated scrapers, data harvesting robots, or any neural interference tools that may compromise the integrity of our marketplace. 
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                        {[
                          'No decentralized data mining.',
                          'No unauthorized commercialization.',
                          'No identity masking protocols.',
                          'No direct content injection.'
                        ].map((rule, i) => (
                          <div key={i} className="flex items-center gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-500 text-xs">
                             <ShieldAlert className="w-4 h-4 text-rose-400" />
                             {rule}
                          </div>
                        ))}
                     </div>
                  </section>

                  <section className="bg-gray-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
                     <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/20 blur-[80px] rounded-full" />
                     <h3 className="text-white text-3xl font-black tracking-tighter mb-8 italic">Intellectual Integrity.</h3>
                     <p className="text-gray-400 text-base leading-relaxed mb-12">
                        Every pixel, line of code, and trademark within the loopOut network is protected by international intellectual property laws. Unauthorized reproduction of our neural algorithms or brand identity will result in immediate protocol termination and legal escalation.
                     </p>
                     <div className="flex items-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                        <span>© 2026 loopOut Global</span>
                        <span>IPR-V3-SECURE</span>
                     </div>
                  </section>

                  <section>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="px-4 py-1.5 bg-gray-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Article 02</div>
                        <h2 className="text-3xl font-black text-gray-950 tracking-tighter m-0">Liability Shield</h2>
                     </div>
                     <p className="text-gray-500 font-medium leading-relaxed">
                        To the maximum extent permitted by the laws of the Republic of South Africa, loopOut Home and its directors shall not be held liable for indirect, consequential, or special damages arising out of your engagement with the ecosystem. Our liability is shielded to maintain the equilibrium of the marketplace.
                     </p>
                  </section>
               </div>
            </div>
         </div>
      </main>

      {/* Interactive Footer CTA */}
      <section className="py-24 px-6 bg-gray-50 text-center">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-8 leading-tight">
               CLEAR ON THE RULES? <br />
               <span className="text-gray-400">LET'S START THE SYNC.</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
               <button 
                 onClick={() => navigate('/sign-up')}
                 className="w-full md:w-auto px-12 py-6 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
               >
                 Accept & Continue
                 <Sparkles className="w-5 h-5 fill-white" />
               </button>
               <button 
                 onClick={() => navigate('/contact')}
                 className="w-full md:w-auto px-12 py-6 border-2 border-gray-200 text-gray-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all font-inter"
               >
                 Inquire with Legal
               </button>
            </div>
         </div>
      </section>

      {/* Sub-Footer Mini */}
      <footer className="py-12 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
         <button onClick={() => navigate('/privacy')} className="hover:text-rose-500 transition-colors">Privacy Policy</button>
         <div className="w-1 h-1 bg-gray-200 rounded-full" />
         <button onClick={() => navigate('/trust')} className="hover:text-rose-500 transition-colors">Safety Hub</button>
         <div className="w-1 h-1 bg-gray-200 rounded-full" />
         <button onClick={() => navigate('/')} className="hover:text-rose-500 transition-colors">Back to Home</button>
      </footer>
    </div>
  );
};

export default TermsOfService;
