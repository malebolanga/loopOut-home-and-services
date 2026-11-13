import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  House,
  Sparkles,
  Compass,
  HeartHandshake,
  UtensilsCrossed,
  Wrench,
  BedDouble,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

// Animation variants matching Home.jsx performance patterns
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const OFFERINGS = [
  {
    icon: House,
    title: 'Property Sales & Rentals',
    desc: 'Browse homes and commercial spaces listed for sale or rent. Review each listing’s details, price, location, and terms before you contact or make a request.',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'Properties'
  },
  {
    icon: BedDouble,
    title: 'Short-Term Stays & BNB',
    desc: 'Discover places to stay and review the accommodation details, availability, price, and booking conditions provided by each host.',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'Hospitality'
  },
  {
    icon: Wrench,
    title: 'Local Services & Helpers',
    desc: 'Find local providers across categories such as home help, beauty, tutoring, photography, repairs, and vehicle care.',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Services'
  },
  {
    icon: UtensilsCrossed,
    title: 'Food & Lunch Hub',
    desc: 'Explore food shops and menus in your area, then place an order for collection where the shop offers it.',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badge: 'Food Hub'
  }
];

const PILLARS = [
  {
    title: 'Clear listing details',
    desc: 'Compare the information, prices, and conditions providers publish before you make a booking or request.',
    icon: House
  },
  {
    title: 'Direct communication',
    desc: 'Use LoopOut’s available messaging and contact features to discuss an offering with its provider.',
    icon: Compass
  },
  {
    title: 'Provider verification',
    desc: 'Some provider accounts may complete identity checks. A verification status is not a guarantee of service quality or performance.',
    icon: CheckCircle2
  },
  {
    title: 'Empowering Communities',
    desc: 'We empower local homeowners, domestic workers, artisans, and food entrepreneurs to launch and grow their ventures.',
    icon: HeartHandshake
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Helmet>
        <title>About LoopOut — Redefining Local Stays, Services & Living</title>
        <meta
          name="description"
            content="Learn about LoopOut, a local marketplace for property, stays, services, food, and goods."
        />
        <link rel="canonical" href="https://loupeout-home-7rlt.onrender.com/about" />
      </Helmet>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent pt-24 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200/60 dark:border-gray-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-amber-400/20 to-orange-400/20 blur-3xl -z-10 rounded-full pointer-events-none opacity-60" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover The LoopOut Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-950 dark:text-white leading-[1.15]"
          >
            Connecting People to{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Stays, Services & Living
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            LoopOut is a local marketplace where people can discover property, places to stay, services, food, and goods, and where providers can share what they offer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/food"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800/80 shadow-xs transition-all"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              <span>Food & Lunch Hub</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE & OUR MISSION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>Our Purpose</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white leading-snug">
              Helping people find local offerings and helping providers reach customers.
            </h2>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              LoopOut brings property listings, accommodation, local services, food, and goods together in one place. People can browse offerings, contact providers, and use available booking or order features.
            </p>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              Customers can compare the details providers share before making a request. Providers can create a profile and publish offerings for people in their area to discover.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Review prices before you confirm</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Direct Host & Provider Chat</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-200/80 dark:border-amber-900/40 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Our Mission & Vision
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                To make it easier for people to find local offerings and for independent providers to share their work with nearby customers.
              </p>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs">01</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Empower Local Hosts & Workers</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tools to create profiles and publish offerings on the marketplace.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                  <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 font-bold text-xs">02</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Seamless User Experience</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Search and browse listings by category and location.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs">03</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Trust & Verification</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Some provider accounts can submit identity documents for review.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ── */}
      <section className="py-20 bg-white dark:bg-gray-900/40 border-y border-gray-200/70 dark:border-gray-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
              What You Can Do on LoopOut
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              One platform covering every dimension of local living, stays, and service booking.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {OFFERINGS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${item.color} border transition-all duration-200 shadow-xs hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-xs ${item.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE LOOPOUT ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
            Why Choose LoopOut?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Engineered with integrity, privacy, and speed at the center of every interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to explore LoopOut or list your own service?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
            Browse LoopOut to find an offering, or create a provider account to share what you do.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <Link
                to="/search"
                className="px-6 py-3 rounded-full bg-white text-gray-950 font-bold text-sm shadow-md hover:bg-gray-100 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Browsing
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full bg-black/20 hover:bg-black/30 border border-white/30 text-white font-bold text-sm transition"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
