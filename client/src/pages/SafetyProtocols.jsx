import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, HeartHandshake, Bell, UserCheck, AlertOctagon } from 'lucide-react';

export default function SafetyProtocols() {
  const protocols = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Identity Verification",
      description: "Every user on loopOut undergoes a multi-layer identity check to foster a trusted environment."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "24/7 Incident Response",
      description: "Our dedicated Trust & Safety team is online globally, ready to intervene at a moment's notice."
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: "In-Person Security",
      description: "Guidelines and real-time tracking options designed specifically for physical services and overnight stays."
    },
    {
      icon: <AlertOctagon className="w-6 h-6" />,
      title: "Zero-Tolerance Enforcement",
      description: "Immediate removal and reporting of any user violating our explicit community safety standards."
    }
  ];

  return (
    <div className="bg-white min-h-screen font-inter">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 sm:px-12 max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-8">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">loopOut Security</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9]">
            Safety <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Protocols.</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
            The physical and digital safety of our community is non-negotiable. 
            We deploy military-grade protocols to ensure every interaction on loopOut is secure, respectful, and verified.
          </p>
        </motion.div>
      </section>

      {/* Protocols Grid */}
      <section className="py-20 px-6 sm:px-12 bg-gray-900">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {protocols.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 shadow-inner">
                  {p.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{p.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact Hub */}
      <section className="py-32 px-6 sm:px-12 max-w-[800px] mx-auto text-center">
        <div className="bg-rose-50 p-12 rounded-[3rem] border border-rose-100">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Need Immediate Assistance?</h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-8 max-w-lg mx-auto">
            If you are in an emergency situation, please contact your local emergency services immediately. For urgent loopOut matters, our critical response team is standing by.
          </p>
          <button className="px-10 py-5 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl">
             Contact Critical Response
          </button>
        </div>
      </section>
    </div>
  );
}
