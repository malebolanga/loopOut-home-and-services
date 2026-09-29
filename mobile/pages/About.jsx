import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  House,
  ShieldCheck,
  Sparkles,
  Users,
  Compass,
  Building2,
  HeartHandshake,
  UtensilsCrossed,
  Wrench,
  BedDouble,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  Award
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

const STATS = [
  { label: 'Verified Listings', value: '1,500+', icon: Building2 },
  { label: 'Active Users', value: '10,000+', icon: Users },
  { label: 'Quality Stays & Services', value: '99.4%', icon: Star },
  { label: 'Local Communities', value: '50+', icon: MapPin },
];

const OFFERINGS = [
  {
    icon: House,
    title: 'Property Sales & Rentals',
    desc: 'Explore an extensive collection of verified homes for sale, long-term rentals, apartments, and commercial spaces with crystal-clear pricing and high-res tours.',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'Properties'
  },
  {
    icon: BedDouble,
    title: 'Short-Term Stays & BNB',
    desc: 'Find guesthouses, cozy BnBs, holiday homes, and hourly suites designed for weekend getaways, business trips, or restful vacations across South Africa.',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'Hospitality'
  },
  {
    icon: Wrench,
    title: 'Local Services & Helpers',
    desc: 'Connect directly with reliable domestic helpers, beauty professionals, certified technicians, tutors, cleaners, and automotive care experts.',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Services'
  },
  {
    icon: UtensilsCrossed,
    title: 'Food & Lunch Hub',
    desc: 'Discover fresh local meals, hot platters, and artisanal food kitchens. Order ahead for quick pickup or register your own culinary shop to reach local customers.',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badge: 'Food Hub'
  }
];

const PILLARS = [
  {
    title: 'Verified Listings',
    desc: 'Every stay, property, and service provider is screened to ensure authenticity, safety, and reliability for total peace of mind.',
    icon: ShieldCheck
  },
  {
    title: 'Transparent Pricing',
    desc: 'No hidden surprise fees. Clear booking costs, honest estimates, and direct connections between customers and hosts.',
    icon: Award
  },
  {
    title: 'Real-Time Connections',
    desc: 'Instant messaging, live availability calendars, and direct WhatsApp support facilitate effortless communication.',
    icon: Clock
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
          content="Learn about LoopOut: our mission, our story, and how we empower communities through verified property rentals, local services, BnBs, and food hubs."
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
            LoopOut is an all-in-one local marketplace built to connect verified properties, BnB getaways, skilled service providers, and neighborhood food kitchens with the people who need them.
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

      {/* ── STATS STRIP ── */}
      <section className="py-12 bg-white dark:bg-gray-900/60 border-b border-gray-200/70 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
              Making real estate, local services & food accessible to everyone.
            </h2>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              Founded on the belief that finding a place to stay, renting a property, or securing trusted local help should never be stressful, LoopOut brings modern technology to local South African communities.
            </p>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              Whether you are an independent property owner showcasing a guesthouse, a domestic specialist building your business, or a traveler looking for a comfortable weekend lodge, LoopOut delivers an intuitive, secure platform tailored to your needs.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Zero Hidden Fees</span>
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
                To bridge the gap between high-demand local services, verified accommodation, and community convenience through AI-powered search, fair opportunities, and transparent booking.
              </p>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs">01</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Empower Local Hosts & Workers</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Direct monetization tools without unfair middleman cuts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                  <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 font-bold text-xs">02</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Seamless User Experience</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fast, responsive browsing with instant GPS radius discovery.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs">03</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Trust & Verification</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rigorous validation for properties, helpers, and listings.</p>
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
              Join thousands of community members across the country finding stays, hiring local helpers, and enjoying fresh local food today.
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
