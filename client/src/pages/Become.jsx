import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  BriefcaseIcon, 
  ShoppingBagIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  UtensilsCrossed, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  BadgePercent, 
  Coins, 
  Zap, 
  HelpCircle,
  Clock,
  MapPin,
  Camera,
  FileCheck2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { updateUserSuccess } from '../redux/user/userSlice';

const PROVIDER_ROLES = [
  {
    id: 'property',
    name: 'Property Host',
    badge: 'Stays & Rentals',
    emoji: '🏡',
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    tagline: 'Host rooms, apartments, holiday villas, or unique stay experiences.',
    description: 'Transform your vacant property, guest suite, or holiday home into steady passive income with LoopOut Stays.',
    whatYouCanList: [
      'Entire apartments, houses, cottages, and holiday villas',
      'Private rooms, student accommodation, and guest suites',
      'Event venues, photography studios, and short-term spaces'
    ],
    requirements: [
      { title: 'Property Details & Address', desc: 'Exact location, street address, and neighborhood details.' },
      { title: 'High-Quality Photos', desc: 'At least 3-5 clear, well-lit photos showing bedrooms, living area, and amenities.' },
      { title: 'Nightly Rate & Deposit', desc: 'Set your base price per night, cleaning fees, and security deposit.' },
      { title: 'House Rules & Policies', desc: 'Check-in/out hours, maximum guests, pet policy, and cancellation terms.' }
    ],
    benefits: [
      'Direct payouts to your bank account upon guest check-in',
      'Verified guest profiles with review histories',
      'Full control over pricing, calendar availability, and booking rules'
    ],
    actionText: 'Convert to Property Host',
    actionRoute: (uid) => `/${uid}/create-listing?tab=stays`
  },
  {
    id: 'services',
    name: 'Service Provider',
    badge: 'Skilled & Pro Services',
    emoji: '🛠️',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    tagline: 'Offer beauty, photography, fitness coaching, repairs, catering, and pro skills.',
    description: 'Get hired by thousands of local clients seeking vetted experts, tradespeople, artists, and personal stylists.',
    whatYouCanList: [
      'Pro services: plumbing, electrical, handyman, car wash, beauty, styling, and photography',
      'Local helpers: domestic cleaning, private tutors, animal care, sneaker care, and personal assistance',
      'Client bookings, hourly/package rates, calendar scheduling, and direct client requests'
    ],
    requirements: [
      { title: 'Identity Verification (ID / Passport)', desc: 'Upload a clear photo of your government-issued ID book, smart card, or passport.' },
      { title: 'Facial Scan & Selfie', desc: 'Complete a live face scan to authenticate your identity against your documents.' },
      { title: 'Real Profile Picture', desc: 'Upload a clear, authentic photo of yourself to establish credibility and trust with clients.' },
      { title: 'Service Menu & Rates', desc: 'Detailed package breakdown, per-hour or fixed pricing, and session duration.' },
      { title: 'Portfolio / Past Work Photos', desc: 'Showcase your real craft, before-and-after photos, and client reviews.' }
    ],
    benefits: [
      'Identity verification badge (KYC verified) for top client trust',
      'In-app chat and scheduling system',
      'Direct client booking requests and secure payments'
    ],
    actionText: 'Convert to Service Provider',
    actionRoute: (uid) => `/${uid}/create-listing?tab=experiences`
  },
  {
    id: 'food',
    name: 'Food Shop Owner',
    badge: 'Food Hub & Culinary',
    emoji: '🍱',
    color: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    tagline: 'Register your kitchen, cafe, braai stand, bakery, or local food business.',
    description: 'Connect with hungry food lovers nearby. Accept pickup orders, manage a live kitchen queue, and offer table bookings.',
    whatYouCanList: [
      'Hot home-cooked platters, braai meals, and African traditional dishes',
      'Bakery goods, custom cakes, pastries, and artisanal desserts',
      'Fast food, burgers, wraps, lunch boxes, and fresh juices',
      'Table reservations for dining guests'
    ],
    requirements: [
      { title: 'Shop Name & Branding', desc: 'Business title, culinary style (e.g. African, Grills, Cafe), and icon or banner.' },
      { title: 'Physical Address & Phone/WhatsApp', desc: 'Pickup collection point for customers and active WhatsApp/phone for order updates.' },
      { title: 'Menu Items & Pricing', desc: 'Dish titles, ingredients, prices, preparation time, and optional side choices.' },
      { title: 'Operating Hours & Open/Closed Status', desc: 'Days of the week and hours open with a 1-tap live kitchen status toggle.' }
    ],
    benefits: [
      'Dedicated Food Hub shop page with custom menu and customer ratings',
      'Live order management system (Pending, Preparing, Ready for Collection)',
      'Table booking requests with guest count and date/time reservations'
    ],
    actionText: 'Convert to Food Shop Owner',
    actionRoute: () => '/food/register'
  },
  {
    id: 'goods',
    name: 'Goods Seller',
    badge: 'Marketplace',
    emoji: '🛍️',
    color: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-800',
    textColor: 'text-pink-600 dark:text-pink-400',
    tagline: 'Sell pre-loved items, electronics, furniture, books, and fashion.',
    description: 'Reach local buyers in your city looking for great bargains, verified goods, and easy pickup options.',
    whatYouCanList: [
      'Electronics, smartphones, laptops, audio equipment, and gaming consoles',
      'Home furniture, kitchen appliances, and decorative items',
      'Clothing, fashion accessories, books, and sports gear'
    ],
    requirements: [
      { title: 'Item Description & Category', desc: 'Accurate title, brand, category, and thorough description of item condition.' },
      { title: 'Real Product Photos', desc: 'Crisp photos showing the actual item from multiple angles and any flaws.' },
      { title: 'Fair Pricing', desc: 'Clear price in ZAR (Rand) with indication of whether price is negotiable.' },
      { title: 'Collection Location', desc: 'Township, suburb, or meeting safe-point for buyer inspection.' }
    ],
    benefits: [
      'Zero listing fees — keep 100% of your selling price',
      'Direct buyer messaging with location privacy protection',
      'Mark items sold with a single tap'
    ],
    actionText: 'Convert to Goods Seller',
    actionRoute: (uid) => `/${uid}/create-listing?tab=selling`
  }
];

const FAQS = [
  {
    q: 'Why does LoopOut have different account roles?',
    a: 'To keep the marketplace clean and trustworthy! Browsing accounts enjoy an uncluttered view focused on exploring and booking. Provider accounts gain powerful tools tailored specifically for their trade — such as live kitchen order queues for food shops or KYC verification for service providers.'
  },
  {
    q: 'Can I still browse and order food if I become a host or provider?',
    a: 'Absolutely! Upgrading your account gives you provider publishing tools on top of your existing browsing and ordering privileges. You can still order food, book stays, and hire helpers anytime.'
  },
  {
    q: 'Is there any fee to convert or list?',
    a: 'No! Converting your account is 100% free with no monthly subscription charges. You only pay standard transaction processing fees when you successfully receive paid customer bookings.'
  },
  {
    q: 'Why do Service Providers need ID verification (KYC)?',
    a: 'Safety and community trust are our highest priorities. Because service providers visit client homes or provide in-person treatments, uploading a government ID and a live selfie ensures every customer feels safe and confident hiring you.'
  },
  {
    q: 'Can I change my role again in the future?',
    a: 'Yes, you can return to this page or your Profile Settings at any time to adjust your account setup.'
  }
];

export default function Become() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [selectedRole, setSelectedRole] = useState(PROVIDER_ROLES[0].id);
  const [converting, setConverting] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const currentRoleInfo = PROVIDER_ROLES.find((r) => r.id === selectedRole) || PROVIDER_ROLES[0];
  const isViewer = !currentUser || currentUser?.offeringType === 'viewer';
  const isAlreadyThisRole = currentUser?.offeringType === selectedRole;

  const handleConvertRole = async (targetRole) => {
    if (!currentUser) {
      navigate('/sign-up');
      return;
    }

    if (currentUser.offeringType === targetRole) {
      const roleObj = PROVIDER_ROLES.find((r) => r.id === targetRole);
      const dest = typeof roleObj.actionRoute === 'function' ? roleObj.actionRoute(currentUser._id) : roleObj.actionRoute;
      navigate(dest);
      return;
    }

    setConverting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ offeringType: targetRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update account role.');
      }

      dispatch(updateUserSuccess(data));
      const roleObj = PROVIDER_ROLES.find((r) => r.id === targetRole);
      setSuccessModal({
        roleName: roleObj.name,
        roleId: targetRole,
        emoji: roleObj.emoji,
        route: typeof roleObj.actionRoute === 'function' ? roleObj.actionRoute(currentUser._id) : roleObj.actionRoute
      });
    } catch (err) {
      console.error('Role conversion error:', err);
      setErrorMsg(err.message || 'Could not convert account. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-600 dark:text-slate-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">Become a Provider</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Upgrade your LoopOut account to start earning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Current Role: {currentUser.offeringType ? (currentUser.offeringType === 'viewer' ? 'Browsing Only' : currentUser.offeringType) : 'Standard'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Advisory Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-rose-950 text-white py-12 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.18),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Provider Transition Guide
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to share your space, skill, or food?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your account is currently set for browsing, booking, and requests. To list properties, offer services, or register a food shop, review the requirements below and convert your account in one click.
          </p>

          {/* Current Status Box */}
          {currentUser && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 text-xs text-slate-200 border border-white/15">
              <span>Signed in as <strong className="text-white font-semibold">{currentUser.username}</strong></span>
              <span className="text-white/40">•</span>
              <span>Account Type: <span className="font-bold text-amber-300 uppercase tracking-wide">{currentUser.offeringType || 'viewer'}</span></span>
              {currentUser.offeringType === 'viewer' && (
                <span className="ml-1 rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold border border-amber-400/30">
                  Ready to upgrade
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto mt-6 px-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1 font-medium">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
          </div>
        </div>
      )}

      {/* ── Main Provider Selection Tabs ── */}
      <main className="max-w-5xl mx-auto mt-8 px-4 sm:px-6 space-y-10">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Select what you would like to offer:
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Review the requirements and process for each role. You can switch to any role that fits your business.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROVIDER_ROLES.map((role) => {
              const active = selectedRole === role.id;
              const isCurrent = currentUser?.offeringType === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    active
                      ? `${role.lightBg} ${role.border} ring-2 ring-rose-500 shadow-md`
                      : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 shadow-sm'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      <CheckCircleIcon className="w-3 h-3" /> Active
                    </span>
                  )}
                  <div>
                    <span className="text-2xl mb-2 block">{role.emoji}</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{role.name}</h4>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">{role.badge}</span>
                  </div>
                  {active && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <span>View details</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Role Deep-Dive Card ── */}
        <motion.div
          key={currentRoleInfo.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className={`p-6 sm:p-8 bg-gradient-to-r ${currentRoleInfo.color} text-white`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-block text-3xl mb-1">{currentRoleInfo.emoji}</span>
                <h3 className="text-2xl sm:text-3xl font-black">{currentRoleInfo.name}</h3>
                <p className="text-sm text-white/90 max-w-xl">{currentRoleInfo.tagline}</p>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                {currentUser ? (
                  isAlreadyThisRole ? (
                    <button
                      onClick={() => {
                        const dest = typeof currentRoleInfo.actionRoute === 'function' ? currentRoleInfo.actionRoute(currentUser._id) : currentRoleInfo.actionRoute;
                        navigate(dest);
                      }}
                      className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-lg transition active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Open Provider Workspace</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConvertRole(currentRoleInfo.id)}
                      disabled={converting}
                      className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-lg transition active:scale-95 disabled:opacity-75 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{converting ? 'Converting...' : currentRoleInfo.actionText}</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate('/sign-up')}
                    className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <span>Sign Up to {currentRoleInfo.name}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Overview */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Role Overview</h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentRoleInfo.description}
              </p>
            </div>

            {/* What you can list */}
            <div className="rounded-2xl p-5 bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-rose-500" /> What You Can List
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentRoleInfo.whatYouCanList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What you need to prepare (Requirements) */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-rose-500" /> What You Need To Prepare
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentRoleInfo.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-gray-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{req.title}</h5>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">{req.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Benefits */}
            <div className="rounded-2xl p-5 border border-emerald-100 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4" /> Provider Perks & Protections
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentRoleInfo.benefits.map((b, i) => (
                  <div key={i} className="text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion CTA Footer Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isAlreadyThisRole ? (
                  <span className="text-emerald-600 font-bold">You already have access to this role. Start listing whenever you are ready!</span>
                ) : (
                  <span>Converting will instantly enable creation tools for <strong className="text-slate-800 dark:text-slate-200">{currentRoleInfo.name}</strong> on your profile.</span>
                )}
              </div>
              <div>
                {currentUser && !isAlreadyThisRole && (
                  <button
                    onClick={() => handleConvertRole(currentRoleInfo.id)}
                    disabled={converting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span>{converting ? 'Converting...' : currentRoleInfo.actionText}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Frequently Asked Questions ── */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-semibold text-sm text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── Success Celebration Modal ── */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-gray-800 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 mx-auto flex items-center justify-center text-3xl">
                {successModal.emoji}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Account Converted!</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Welcome, {successModal.roleName}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your LoopOut account has been upgraded. You now have full access to create and manage listings in your chosen category.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    const dest = successModal.route;
                    setSuccessModal(null);
                    navigate(dest);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-md transition"
                >
                  Start Listing Now
                </button>
                <button
                  onClick={() => {
                    setSuccessModal(null);
                    navigate('/');
                  }}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-gray-800 transition"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
