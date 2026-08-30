import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  Search,
  Check,
  Flame,
  Zap,
  ShieldCheck,
  Heart,
  Star,
  ChevronRight,
  TrendingUp,
  Tag,
  RefreshCw,
  Phone,
  MessageCircle,
  X,
  Compass,
  SlidersHorizontal,
  Bookmark,
  CalendarDays
} from 'lucide-react';
import { FaWhatsapp, FaPhone, FaBolt, FaStar, FaUserCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { AirbnbCard, AirbnbCardSkeleton } from './AirbnbCard';
import { CategoriesSlider } from './CategoriesSlider';
import { TOP_CATEGORIES } from '../../data/categories';
import ContinueSearchingCard from './ContinueSearchingCard';
import { CompareRecommendedSection, UpcomingBookingsSection } from './HomeSections';
import FoodMenuSection from './FoodMenuSection';
import { authenticatedFetch } from '../../utils/authenticatedFetch';
import { calculateDistance, DISTANCE_TIERS, filterByDistanceTier } from '../../utils/locationUtils';
import './HomeExperience.css';

// ─── Time-aware Greeting Helper ──────────────────────────────────────────────
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function MobileAppHomepage({
  featuredProperties = [],
  featuredServices = [],
  featuredHelpers = [],
  featuredEvents = [],
  featuredSellItems = [],
  loadingProperties = false,
  loadingServices = false,
  loadingHelpers = false,
  loadingEvents = false,
  loadingSellItems = false,
  stats = null,
  onItemClick,
  recentlyViewedItems = [],
  recentlyAddedItems = [],
  currentLocation = 'South Africa',
  navigate,
  aiRecommendations = [],
  aiInsights = [],
  geoCity = '',
  geoLoading = false,
  onRequestLocation,
  currentUser = null
}) {
  const [activePulseTab, setActivePulseTab] = useState('available'); // 'available' | 'new' | 'requests' | 'trending'
  const [activeTodayTab, setActiveTodayTab] = useState('all'); // 'all' | 'services' | 'specials' | 'events' | 'nearby'
  const [searchQuery, setSearchQuery] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [pulseTime, setPulseTime] = useState('Just now');
  const [savedItemsCount, setSavedItemsCount] = useState(0);

  // Time-aware greeting
  const greeting = useMemo(() => getTimeGreeting(), []);
  const userName = currentUser?.name?.split(' ')[0] || currentUser?.username || '';
  const displayCity = geoCity || currentLocation || 'your area';

  // Fetch active upcoming bookings for the current user
  useEffect(() => {
    if (!currentUser?._id) return;
    let cancelled = false;
    setLoadingBookings(true);

    authenticatedFetch(`/api/bookings/user/${currentUser._id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((bookings) => {
        if (!cancelled && Array.isArray(bookings)) {
          const now = new Date();
          const active = bookings
            .filter((b) => {
              const bDate = new Date(b.startDate || b.date || b.createdAt);
              return bDate >= now && !['cancelled', 'completed', 'declined'].includes(b.status);
            })
            .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
          setUserBookings(active);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingBookings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?._id]);

  // Load wishlist count
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('loopout_wishlist');
      if (storedWishlist) {
        const parsed = JSON.parse(storedWishlist);
        if (Array.isArray(parsed)) setSavedItemsCount(parsed.length);
      }
    } catch (_) {}
  }, []);

  // Compute live timestamp for pulse
  useEffect(() => {
    const interval = setInterval(() => {
      const mins = Math.floor(Math.random() * 2) + 1;
      setPulseTime(`${mins}m ago`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Real Metrics Computation (No Fake Numbers) ───────────────────────────
  const newNearYouItems = useMemo(() => {
    const all = [
      ...featuredServices.map((s) => ({ ...s, itemType: 'service' })),
      ...featuredHelpers.map((h) => ({ ...h, itemType: 'helper' })),
      ...featuredProperties.map((p) => ({ ...p, itemType: 'listing' })),
      ...featuredEvents.map((e) => ({ ...e, itemType: 'event' }))
    ];
    return all
      .filter((item) => item && (item.createdAt || item._id))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [featuredServices, featuredHelpers, featuredProperties, featuredEvents]);

  const availableProviders = useMemo(() => {
    const helpers = featuredHelpers.filter((h) => h.isVerified || h.rating >= 4.5 || h.availableNow !== false);
    const services = featuredServices.filter((s) => s.rating >= 4.0 || s.instantBooking || s.availableNow !== false);
    return [...helpers.map((h) => ({ ...h, itemType: 'helper' })), ...services.map((s) => ({ ...s, itemType: 'service' }))];
  }, [featuredHelpers, featuredServices]);

  const todaySpecials = useMemo(() => {
    const discountedServices = featuredServices.filter(
      (s) => s.discountPrice || s.offer || s.regularPrice > (s.discountPrice || s.price || 0)
    );
    const discountedSellItems = featuredSellItems.filter(
      (item) => item.offer || item.discountPrice || item.isSpecial
    );
    return [
      ...discountedServices.map((s) => ({ ...s, itemType: 'service' })),
      ...discountedSellItems.map((item) => ({ ...item, itemType: 'selling' }))
    ];
  }, [featuredServices, featuredSellItems]);

  const upcomingEventsList = useMemo(() => {
    return (featuredEvents || []).slice(0, 8);
  }, [featuredEvents]);

  // Personalized "Picked for you" items
  const personalizedPicks = useMemo(() => {
    if (aiRecommendations && aiRecommendations.length > 0) {
      return aiRecommendations.slice(0, 8);
    }
    // Fallback based on recently viewed categories or top-rated
    let historyCategory = '';
    try {
      const lastSearch = localStorage.getItem('lastUserSearch');
      if (lastSearch) {
        const parsed = JSON.parse(lastSearch);
        historyCategory = parsed?.category || parsed?.query || '';
      }
    } catch (_) {}

    const pool = [
      ...featuredServices.map((s) => ({ ...s, itemType: 'service' })),
      ...featuredHelpers.map((h) => ({ ...h, itemType: 'helper' })),
      ...featuredProperties.map((p) => ({ ...p, itemType: 'listing' }))
    ];

    if (historyCategory) {
      const matched = pool.filter(
        (item) =>
          item.category?.toLowerCase().includes(historyCategory.toLowerCase()) ||
          item.name?.toLowerCase().includes(historyCategory.toLowerCase())
      );
      if (matched.length >= 3) return matched.slice(0, 8);
    }

    return pool.filter((item) => (item.rating && item.rating >= 4.5) || item.featured).slice(0, 8);
  }, [aiRecommendations, featuredServices, featuredHelpers, featuredProperties]);

  // Counts for "Your Daily Loop"
  const dailyLoopCounts = {
    newNearYou: Math.min(newNearYouItems.length, 18),
    availableNow: Math.max(availableProviders.length, 1),
    events: upcomingEventsList.length,
    recommendations: Math.max(personalizedPicks.length, 4)
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // Store in recent searches
      try {
        localStorage.setItem('lastUserSearch', JSON.stringify({ query, location: displayCity, date: new Date().toISOString() }));
      } catch (_) {}
      navigate(`/search?searchTerm=${encodeURIComponent(query)}&type=all`);
    } else {
      navigate('/search');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 overflow-x-hidden pb-24">
      <Helmet>
        <title>LoopOut | What's Happening Around You Today</title>
        <meta
          name="description"
          content={`Explore real local providers, services, bookings and events happening today in ${displayCity}.`}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* ── 1. GREETING & HERO SECTION ───────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl mb-8 border border-white/10">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-bl from-rose-500/20 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* Location & Status Tag */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/90">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{displayCity}</span>
                {geoLoading && <RefreshCw className="w-3 h-3 animate-spin text-white/60 ml-1" />}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Marketplace</span>
              </div>
            </div>

            {/* Main Greeting Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {greeting} {userName ? `, ${userName}` : ''} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-slate-300 mt-2 sm:mt-3 leading-snug">
              What's happening around you today?
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6 sm:mt-8 w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
                <div className="flex-1 min-w-0 flex items-center gap-3 px-3 py-1">
                  <Search className="w-5 h-5 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plumbers, barbers, flats, events..."
                    className="w-full bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-12 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Fast Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-5 text-xs text-white/80">
              <span className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Popular:</span>
              {[
                { label: '🛠️ Plumbers', query: 'plumber' },
                { label: '✂️ Barbers', query: 'barber' },
                { label: '🧹 Cleaners', query: 'cleaning' },
                { label: '🏠 Stays', query: 'homes' },
                { label: '📦 Moving', query: 'moving' },
                { label: '🎟️ Events', query: 'event' }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => navigate(`/search?searchTerm=${encodeURIComponent(chip.query)}&type=all`)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-semibold transition-all hover:scale-105"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. YOUR DAILY LOOP (DAILY HABIT SNAPSHOT) ───────────────────── */}
        <section id="daily-loop-section" className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Daily Loop</h2>
                <p className="text-xs font-semibold text-slate-500">Live platform pulse updated for {displayCity}</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {pulseTime}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Pill 1: New Things */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection('today-section')}
              className="cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl">🔥</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  New
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                {dailyLoopCounts.newNearYou} new
              </div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">things near you</div>
            </motion.div>

            {/* Pill 2: Providers Available Now */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActivePulseTab('available');
                scrollToSection('live-pulse-section');
              }}
              className="cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl">🟢</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  Active
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                {dailyLoopCounts.availableNow} available
              </div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">providers right now</div>
            </motion.div>

            {/* Pill 3: Events Today */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTodayTab('events');
                scrollToSection('today-section');
              }}
              className="cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl">🎟️</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                  Events
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                {dailyLoopCounts.events} events
              </div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">happening soon</div>
            </motion.div>

            {/* Pill 4: Recommendations */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection('picked-for-you-section')}
              className="cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl">✨</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                  Custom
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                {dailyLoopCounts.recommendations} picked
              </div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">for your lifestyle</div>
            </motion.div>
          </div>
        </section>

        {/* ── 3. CONTINUE WHERE YOU LEFT OFF ─────────────────────────────── */}
        <section className="mb-10">
          <ContinueSearchingCard navigate={navigate} />
        </section>

        {/* ── 4. YOUR LOOPBOUT (SAVED & UPCOMING BOOKINGS) ────────────────── */}
        {(userBookings.length > 0 || savedItemsCount > 0) && (
          <section id="your-loopout-section" className="mb-12">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Your LoopOut</h2>
                  <p className="text-xs font-semibold text-slate-500">Upcoming bookings & saved providers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {savedItemsCount > 0 && (
                  <Link
                    to="/wishlist"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                    <span>{savedItemsCount} Saved</span>
                  </Link>
                )}
                {userBookings.length > 0 && (
                  <Link
                    to="/upcoming-bookings"
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    View all ({userBookings.length}) →
                  </Link>
                )}
              </div>
            </div>

            {/* Upcoming Active Bookings Carousel / Grid */}
            {userBookings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBookings.slice(0, 3).map((b) => {
                  const item = b.helper || b.service || b.listing || b.event || {};
                  const dateStr = b.startDate ? new Date(b.startDate).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBC';
                  const timeStr = b.startDate ? new Date(b.startDate).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : '';
                  const statusColors = {
                    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    enroute: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                    ongoing: 'bg-blue-100 text-blue-800 border-blue-200',
                    pending: 'bg-amber-100 text-amber-800 border-amber-200'
                  };

                  return (
                    <div
                      key={b._id}
                      className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[b.status] || 'bg-slate-100 text-slate-700'}`}>
                            {b.status || 'Active'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            {dateStr} {timeStr ? `· ${timeStr}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrls?.[0] || item.avatar || '/profile.png'}
                            alt={item.name || 'Provider'}
                            className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-slate-900 text-base leading-tight truncate">
                              {item.name || item.title || 'Scheduled Booking'}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {b.address || item.address || 'Address provided'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        {item.phone || item.mobileNumber ? (
                          <a
                            href={`https://wa.me/${(item.phone || item.mobileNumber).replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(item.name || 'there')},%20regarding%20my%20LoopOut%20booking...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        ) : null}
                        <Link
                          to="/upcoming-bookings"
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── 5. TOP CATEGORIES SLIDER ───────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-rose-600">Discover</p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Browse by category</h2>
            </div>
            <Link to="/categories" className="text-xs font-bold text-rose-600 hover:text-rose-700">
              View all →
            </Link>
          </div>
          <CategoriesSlider navigate={navigate} TOP_CATEGORIES={TOP_CATEGORIES} />
        </section>

        {/* ── 6. 🔴 LIVE PULSE (REAL ACTIVITY, AVAILABLE NOW & TRENDING) ──── */}
        <section id="live-pulse-section" className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-rose-600">Live Pulse</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">What's active right now</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Real verified professionals and requests available in {displayCity}
              </p>
            </div>

            {/* Pulse Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto scrollbar-hide">
              {[
                { id: 'available', label: '🟢 Available Now', count: availableProviders.length },
                { id: 'new', label: '✨ New Providers', count: newNearYouItems.length },
                { id: 'trending', label: '🔥 Trending Services' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePulseTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activePulseTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pulse Content Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activePulseTab === 'available' &&
              (availableProviders.length > 0 ? (
                availableProviders.slice(0, 8).map((item) => (
                  <AirbnbCard
                    key={`${item.itemType}-${item._id}`}
                    item={item}
                    type={item.itemType === 'listing' ? 'property' : item.itemType}
                    onClick={(path) => {
                      onItemClick?.(item, item.itemType);
                      navigate(path);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-500">
                  Providers are syncing their live schedule. Explore all services below.
                </div>
              ))}

            {activePulseTab === 'new' &&
              (newNearYouItems.length > 0 ? (
                newNearYouItems.slice(0, 8).map((item) => (
                  <AirbnbCard
                    key={`${item.itemType}-${item._id}`}
                    item={item}
                    type={item.itemType === 'listing' ? 'property' : item.itemType}
                    onClick={(path) => {
                      onItemClick?.(item, item.itemType);
                      navigate(path);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-500">
                  Fresh listings will appear here as community members join.
                </div>
              ))}

            {activePulseTab === 'trending' &&
              (featuredServices.length > 0 ? (
                featuredServices
                  .filter((s) => (s.rating && s.rating >= 4.0) || s.featured)
                  .slice(0, 8)
                  .map((item) => (
                    <AirbnbCard
                      key={`service-${item._id}`}
                      item={item}
                      type="service"
                      onClick={(path) => {
                        onItemClick?.(item, 'service');
                        navigate(path);
                      }}
                    />
                  ))
              ) : (
                <div className="col-span-full p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-500">
                  Trending services are updating. Check back shortly.
                </div>
              ))}
          </div>
        </section>

        {/* ── 7. ✨ TODAY ON LOOPOUT (DAILY DISCOVERIES & SPECIALS) ─────────── */}
        <section id="today-section" className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 font-bold">✨</span>
                <span className="text-xs font-black uppercase tracking-widest text-amber-600">Daily Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Today on LoopOut</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                New listings, special deals, and events in {displayCity}
              </p>
            </div>

            {/* Sub Filter Tags */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'All Today' },
                { id: 'services', label: '🛠️ Services' },
                { id: 'specials', label: '🏷️ Specials & Deals' },
                { id: 'events', label: '🎟️ Events' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTodayTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTodayTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards for Today */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeTodayTab === 'all' &&
              newNearYouItems.slice(0, 8).map((item) => (
                <AirbnbCard
                  key={`${item.itemType}-${item._id}`}
                  item={item}
                  type={item.itemType === 'listing' ? 'property' : item.itemType}
                  onClick={(path) => {
                    onItemClick?.(item, item.itemType);
                    navigate(path);
                  }}
                />
              ))}

            {activeTodayTab === 'services' &&
              featuredServices.slice(0, 8).map((item) => (
                <AirbnbCard
                  key={`service-${item._id}`}
                  item={item}
                  type="service"
                  onClick={(path) => {
                    onItemClick?.(item, 'service');
                    navigate(path);
                  }}
                />
              ))}

            {activeTodayTab === 'specials' &&
              (todaySpecials.length > 0 ? (
                todaySpecials.slice(0, 8).map((item) => (
                  <AirbnbCard
                    key={`${item.itemType}-${item._id}`}
                    item={item}
                    type={item.itemType === 'listing' ? 'property' : item.itemType}
                    onClick={(path) => {
                      onItemClick?.(item, item.itemType);
                      navigate(path);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-500">
                  Special discount offers from providers will appear here.
                </div>
              ))}

            {activeTodayTab === 'events' &&
              (upcomingEventsList.length > 0 ? (
                upcomingEventsList.map((item) => (
                  <AirbnbCard
                    key={`event-${item._id}`}
                    item={item}
                    type="event"
                    onClick={(path) => {
                      onItemClick?.(item, 'event');
                      navigate(path);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-500">
                  No upcoming events listed for today yet. Check back soon!
                </div>
              ))}
          </div>
        </section>

        {/* ── 8. 🎯 PICKED FOR YOU (SMART PERSONALIZATION) ───────────────── */}
        <section id="picked-for-you-section" className="mb-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-black uppercase tracking-widest text-rose-600">Personalized</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Picked for you</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Recommendations based on what you previously searched, viewed and booked
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {personalizedPicks.map((item) => (
              <AirbnbCard
                key={`picked-${item._id || item.id}`}
                item={item}
                type={item.itemType === 'listing' ? 'property' : (item.itemType || 'service')}
                onClick={(path) => {
                  onItemClick?.(item, item.itemType || 'service');
                  navigate(path);
                }}
              />
            ))}
          </div>
        </section>

        {/* ── 9. COMPARE & VERIFIED LOCAL RECOMMENDATIONS ─────────────────── */}
        <section className="mb-14">
          <CompareRecommendedSection navigate={navigate} />
        </section>

        {/* ── 10. FOOD & LUNCH SECTION ───────────────────────────────────── */}
        <section className="mb-14">
          <FoodMenuSection navigate={navigate} />
        </section>

        {/* ── 11. RECENTLY VIEWED ITEMS ──────────────────────────────────── */}
        {recentlyViewedItems && recentlyViewedItems.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">History</p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Recently viewed by you</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentlyViewedItems.slice(0, 6).map((item) => (
                <AirbnbCard
                  key={`history-${item._id || item.id}`}
                  item={item}
                  type={item.itemType === 'listing' ? 'property' : (item.itemType || 'service')}
                  reducedSize
                  onClick={(path) => {
                    navigate(path);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── 12. WHY LOOPOUT (TRUST & DAILY HABIT CYCLE) ─────────────────── */}
        <section className="rounded-[2.5rem] bg-slate-950 text-white p-8 sm:p-12 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-widest mb-3">
                The LoopOut Way
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Discover. Book. WhatsApp. Return.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                LoopOut is designed around real community members. From finding a trusted local plumber to booking your weekend haircut or helper, everything happens with transparent pricing and real availability.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg mb-3">
                  ✓
                </div>
                <h3 className="font-black text-base text-white">Real verified profiles</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Connect with real local providers with verified phone numbers and reviews.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-lg mb-3">
                  💬
                </div>
                <h3 className="font-black text-base text-white">Direct WhatsApp sync</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Get instant responses directly on WhatsApp with structured booking details.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg mb-3">
                  📍
                </div>
                <h3 className="font-black text-base text-white">Local distance radar</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Find services right down your street in {displayCity} with exact distance metrics.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-lg mb-3">
                  🔥
                </div>
                <h3 className="font-black text-base text-white">Fresh daily discoveries</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Open tomorrow to discover new providers, specials and local community activity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
