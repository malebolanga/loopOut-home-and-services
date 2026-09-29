import React from 'react';
import { motion } from 'framer-motion';
import { Lock, EyeOff, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

export default function PrivacyEthics() {
  const principles = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Absolute Data Security",
      description: "Your personal data is encrypted and vaulted. We treat your information as a sacred asset, never to be sold or compromised."
    },
    {
      icon: <EyeOff className="w-6 h-6" />,
      title: "Transparent Usage",
      description: "We only collect what is strictly necessary to power your loopOut experience. You govern your footprint."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Ethical AI",
      description: "Our machine learning models are designed free from bias, ensuring equitable opportunities and unbiased recommendations for every user."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Vetted Ecosystem",
      description: "Every host, service provider, and helper undergoes a strict ethical review to maintain our zero-tolerance policy for discrimination."
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen font-inter">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 sm:px-12 max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8">
            <Lock className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Trust & Transparency</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
            Privacy & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Ethics.</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
            At loopOut, we don't just protect your data—we uphold a rigorous moral framework. 
            Our platform is built on the unwavering foundation of digital dignity and equal opportunity.
          </p>
        </motion.div>
      </section>

      {/* Principles Grid */}
      <section className="py-20 px-6 sm:px-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 p-10 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                {p.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{p.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detailed Policy Text */}
      <section className="py-32 px-6 sm:px-12 max-w-[800px] mx-auto">
        <div className="prose prose-lg prose-gray">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Our Core Commitment</h2>
          <p className="text-gray-500 dark:text-white font-medium leading-relaxed mb-8">
            loopOut operates on a simple principle: your information belongs to you. We employ state-of-the-art encryption protocols across all our services, whether you are booking a home, hiring a professional, or curating an event.
          </p>
          <div className="bg-gray-900 text-white p-8 rounded-[2rem] mb-12">
            <h4 className="text-xl font-black mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              The loopOut Promise
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              We pledge to never monetize your behavioral data, to aggressively combat bias in our algorithms, and to maintain a marketplace where respect and equity are the absolute baseline for participation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
