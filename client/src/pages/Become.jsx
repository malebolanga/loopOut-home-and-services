import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileCheck2,
  ArrowLeft
} from 'lucide-react';
import { updateUserSuccess } from '../redux/user/userSlice';
import { getServiceProviderVerificationStatus } from '../utils/offeringPermissions';

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
    actionText: 'Enable Property Host tools',
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
    actionText: 'Enable Service Provider tools',
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
    actionText: 'Enable Food Shop tools',
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
    actionText: 'Enable Goods Seller tools',
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
  const [searchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state.user);

  const roleParam = searchParams.get('role');
  const initialRole = PROVIDER_ROLES.some((r) => r.id === roleParam) ? roleParam : PROVIDER_ROLES[0].id;

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [converting, setConverting] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  React.useEffect(() => {
    if (roleParam && PROVIDER_ROLES.some((r) => r.id === roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const currentRoleInfo = PROVIDER_ROLES.find((r) => r.id === selectedRole) || PROVIDER_ROLES[0];
  const isAlreadyThisRole = currentUser?.offeringType === selectedRole;
  const verificationStatus = getServiceProviderVerificationStatus(currentUser);

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
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.token || '';
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
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
              <h1 className="text-base sm:text-lg font-bold leading-tight">Start offering on LoopOut</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose what you want to list</p>
            </div>
          </div>
          <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">Provider options</span>
        </div>
      </header>

      {/* ── Hero Advisory Banner ── */}
      <section className="border-b border-slate-200 bg-white px-4 py-7 dark:border-gray-800 dark:bg-gray-900 sm:px-6 sm:py-9">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Account setup</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Choose what you want to offer</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Select the category that fits what you want to list. You can still browse, book, and make requests with any category.
            </p>
          </div>

          {/* Current Status Box */}
          {currentUser && (
            <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300">
              <span>Signed in as <strong className="font-semibold text-slate-900 dark:text-white">{currentUser.username}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Current option: <strong className="font-semibold text-slate-900 dark:text-white">{PROVIDER_ROLES.find((role) => role.id === currentUser.offeringType)?.name || 'Browse and request'}</strong></span>
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
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white mb-1">
            Available categories
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Select a category to review what you can list and what you will need. Your account changes only after you confirm.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PROVIDER_ROLES.map((role) => {
              const active = selectedRole === role.id;
              const isCurrent = currentUser?.offeringType === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  aria-pressed={active}
                  className={`min-h-28 rounded-xl border p-4 text-left transition-colors relative flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
                    active
                    ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500 dark:border-rose-400 dark:bg-rose-950/20 dark:ring-rose-400'
                      : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-rose-300 hover:shadow-sm dark:hover:border-rose-800'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      <CheckCircleIcon className="w-3 h-3" /> Active
                    </span>
                  )}
                  <div>
                    <span className="mb-3 block text-2xl" aria-hidden="true">{role.emoji}</span>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{role.name}</h4>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">{role.badge}</span>
                  </div>
                  {active && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <span>Selected</span>
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
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Header Banner */}
          <div className="border-b border-slate-100 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><span className="text-xl" aria-hidden="true">{currentRoleInfo.emoji}</span>{currentRoleInfo.badge}</p>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{currentRoleInfo.name}</h3>
                <p className="max-w-xl text-sm leading-5 text-slate-600 dark:text-slate-300">{currentRoleInfo.tagline}</p>
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
                      className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Open Provider Workspace</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConvertRole(currentRoleInfo.id)}
                      disabled={converting}
                      className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
                    >
                      <span>{converting ? 'Converting...' : currentRoleInfo.actionText}</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate('/sign-up')}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    <span>Sign Up to {currentRoleInfo.name}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="space-y-6 p-5 sm:p-7">
            {/* Overview */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">About this category</h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentRoleInfo.description}
              </p>
            </div>

            {/* What you can list */}
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-gray-800/50">
              <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                What you can list
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentRoleInfo.whatYouCanList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm leading-5 text-slate-700 dark:text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live KYC Verification Status (Service Providers) */}
            {currentRoleInfo.id === 'services' && currentUser && (
              <div className={`rounded-lg border p-4 ${
                verificationStatus.isCompliant
                  ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30'
                  : 'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30'
              }`}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheckIcon className={`w-5 h-5 ${verificationStatus.isCompliant ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Your Service Provider Verification Status
                    </h4>
                  </div>
                  <span className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${
                    verificationStatus.isCompliant
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}>
                    {verificationStatus.isCompliant ? 'Verified & Ready' : `${verificationStatus.missingCount} requirement${verificationStatus.missingCount > 1 ? 's' : ''} left`}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    verificationStatus.hasIdDocument ? 'bg-white dark:bg-gray-900 border-emerald-200 text-emerald-700' : 'bg-white/80 dark:bg-gray-900 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-medium">ID / Passport</span>
                    {verificationStatus.hasIdDocument ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] text-amber-600 font-bold">Needed</span>}
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    verificationStatus.hasFaceScan ? 'bg-white dark:bg-gray-900 border-emerald-200 text-emerald-700' : 'bg-white/80 dark:bg-gray-900 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-medium">Live Face Scan</span>
                    {verificationStatus.hasFaceScan ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] text-amber-600 font-bold">Needed</span>}
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    verificationStatus.hasProfilePicture ? 'bg-white dark:bg-gray-900 border-emerald-200 text-emerald-700' : 'bg-white/80 dark:bg-gray-900 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-medium">Profile Picture</span>
                    {verificationStatus.hasProfilePicture ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] text-amber-600 font-bold">Needed</span>}
                  </div>
                </div>

                {!verificationStatus.isCompliant && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Complete ID verification so clients can hire you with 100% confidence.
                    </p>
                    <button
                      onClick={() => navigate('/verification')}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      <span>Complete Verification</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* What you need to prepare (Requirements) */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <FileCheck2 className="h-4 w-4 text-slate-500" /> What you will need
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentRoleInfo.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="space-y-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-semibold text-slate-600 dark:bg-gray-800 dark:text-slate-400">
                        {idx + 1}
                      </span>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{req.title}</h5>
                    </div>
                    <p className="pl-7 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{req.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500 dark:border-gray-800 dark:text-slate-400">
              {isAlreadyThisRole ? 'This is already your active option. Open your provider workspace whenever you are ready.' : 'Choosing an option adds its listing tools to your account. Browsing and booking remain available.'}
            </p>
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
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900"
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
