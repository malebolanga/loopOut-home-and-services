import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  CalendarDaysIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid
} from '@heroicons/react/24/solid';
import { Sparkles, BookOpen, Check } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import {
  FaApple,
  FaGooglePlay,
  FaWhatsapp,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarCheck,
  FaTimes
} from 'react-icons/fa';
import ImageGallery from '../components/ImageGallery';
import useLocationCoords from '../hooks/useGeolocation';
import LoopOutPulse from '../components/LoopOutPulse';
import { useWishlist } from '../hooks/useWishlist';
import MyBookingsConsumer from '../components/MyBookingsConsumer';
import LookingForItem from '../components/LookingForItem';
import HelperItem from '../components/HelperItem';
import { authenticatedFetch } from '../utils/authenticatedFetch';


import {
  NeuralPicksSection,
  SellItemsSection,
  SmartRecommendations,
  ServicesToYourDoor,
  WeeklySpecialsSection,
  UpcomingBookingsSection,
  CompareRecommendedSection
} from '../components/home/HomeSections';
import DailyLoopHub from '../components/home/DailyLoopHub';
import ContinueSearchingCard from '../components/home/ContinueSearchingCard';
import FoodCollectionReadyBanner from '../components/home/FoodCollectionReadyBanner';
import CaughtUpHub from '../components/home/CaughtUpHub';
import { TOP_CATEGORIES } from '../data/categories';
import { CategoriesSlider } from '../components/home/CategoriesSlider';
import { HomeHero } from '../components/home/HomeHero';
import { AirbnbCard, AirbnbCardSkeleton } from '../components/home/AirbnbCard';

import {
  calculateDistance,
  POLOKWANE_COORDS,
  DISTANCE_TIERS,
  filterByDistanceTier
} from '../utils/locationUtils';

// --- Constants ---
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENTLY_VIEWED = 12;
const DATA_FETCH_LIMIT = 50;
const AI_RECOMMENDATION_LIMIT = 6;
const USER_PREFERENCE_KEY = 'userPreferences';
const API_TIMEOUT = 15000;

// --- Framer Motion Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const CATEGORY_ICON_DETAILS = {
  Universe: {
    main: '🪐',
    details: ['✨', '🌙', '🚀'],
    bg: 'from-slate-950 via-indigo-950 to-fuchsia-900'
  },
  Homes: {
    main: '🏡',
    details: ['🔑', '🪴', '📍'],
    bg: 'from-emerald-600 via-teal-500 to-sky-500'
  },
  Services: {
    main: '🛠️',
    details: ['⚡', '🧽', '🔧'],
    bg: 'from-amber-500 via-orange-500 to-rose-500'
  },
  Helper: {
    main: '🧹',
    details: ['💅', '💈', '🍳'],
    bg: 'from-sky-500 via-blue-600 to-violet-600'
  },
  Events: {
    main: '🎟️',
    details: ['🎪', '🎭', '🎉'],
    bg: 'from-purple-600 via-fuchsia-600 to-rose-500'
  }
};

const CategoryIcon = ({ type, size = "w-6 h-6" }) => {
  const icon = CATEGORY_ICON_DETAILS[type] || {
    main: '✨',
    details: ['•', '•', '•']
  };

  return (
    <div className={`${size} relative flex items-center justify-center`}>
      <motion.div
        animate={{ y: [0, -1, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <span className="relative z-10 text-[1.25rem] leading-none select-none">
          {icon.main}
        </span>
        <span className="absolute -top-1.5 -right-1.5 text-[0.45rem] leading-none rounded-full bg-white shadow-sm p-0.5 border border-gray-100 select-none">
          {icon.details[0]}
        </span>
        <span className="absolute -bottom-1.5 -left-1.5 text-[0.45rem] leading-none rounded-full bg-white shadow-sm p-0.5 border border-gray-100 select-none">
          {icon.details[1]}
        </span>
      </motion.div>
    </div>
  );
};

// --- AI Recommendation Engine (Preserved) ---
class AIRecommendationEngine {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
  }
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_KEY);
      return stored ? JSON.parse(stored) : {
        viewedCategories: [],
        likedItems: [],
        priceRange: { min: 0, max: 10000 },
        preferredLocations: [],
        interests: [],
        searchHistory: []
      };
    } catch (error) {
      return { viewedCategories: [], likedItems: [], priceRange: { min: 0, max: 10000 }, preferredLocations: [], interests: [], searchHistory: [] };
    }
  }
  saveUserPreferences() {
    try { localStorage.setItem(USER_PREFERENCE_KEY, JSON.stringify(this.userPreferences)); } catch (error) { console.error('Failed to save user preferences:', error); }
  }
  updatePreferences(item, action) {
    switch (action) {
      case 'view': this.userPreferences.viewedCategories.push(item.type || item.category); break;
      case 'like': this.userPreferences.likedItems.push(item._id); break;
      case 'search': this.userPreferences.searchHistory.push(item); break;
    }
    this.saveUserPreferences();
  }
  smartFilterItems(items, userContext = {}) {
    if (!items.length) return items;
    const scores = items.map(item => ({ item, score: this.calculateRelevanceScore(item, userContext) }));
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, AI_RECOMMENDATION_LIMIT).map(s => s.item);
  }
  calculateRelevanceScore(item, userContext) {
    let score = 0;
    const preferences = this.userPreferences;
    if (item.price) {
      const price = Number(item.price) || Number(item.regularPrice) || 0;
      const { min, max } = preferences.priceRange;
      if (price >= min && price <= max) score += 30;
      else score -= Math.abs(price - (min + max) / 2) / 100;
    }
    if (item.address && preferences.preferredLocations.length > 0) {
      const locationMatch = preferences.preferredLocations.some(loc => item.address.toLowerCase().includes(loc.toLowerCase()));
      if (locationMatch) score += 25;
    }
    const itemCategory = item.type || item.category;
    if (preferences.viewedCategories.includes(itemCategory)) score += 20;
    if (preferences.likedItems.includes(item._id)) score += 15;
    if (item.createdAt) {
      const daysOld = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 10 * (1 - daysOld / 7);
    }
    if (item.rating && item.rating >= 4.5) score += 5;
    return Math.max(0, score);
  }
  analyzeTrends(items) {
    const trends = { popularCategories: {}, priceTrends: {}, locationDistribution: {} };
    items.forEach(item => {
      const category = item.type || item.category || 'general';
      trends.popularCategories[category] = (trends.popularCategories[category] || 0) + 1;
      if (item.address) {
        const location = item.address.split(',')[0]?.trim();
        if (location) trends.locationDistribution[location] = (trends.locationDistribution[location] || 0) + 1;
      }
      if (item.price) {
        const priceRange = Math.floor(item.price / 1000) * 1000;
        trends.priceTrends[priceRange] = (trends.priceTrends[priceRange] || 0) + 1;
      }
    });
    return trends;
  }
  generatePersonalizedRecommendations(items, userContext) {
    const filtered = this.smartFilterItems(items, userContext);
    const trends = this.analyzeTrends(items);
    return { recommendations: filtered, insights: this.generateInsights(trends), suggestedCategories: this.suggestCategories(trends) };
  }
  generateInsights(trends) {
    const insights = [];
    const mostPopularCategory = Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1])[0];
    if (mostPopularCategory) insights.push({ type: 'popular', text: `${mostPopularCategory[0]} properties are trending in your area`, icon: '🔥' });
    const priceRanges = Object.keys(trends.priceTrends).map(Number);
    if (priceRanges.length > 0) {
      const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;
      insights.push({ type: 'price', text: `Average price in your area: R${Math.round(avgPrice).toLocaleString()}`, icon: '💰' });
    }
    return insights;
  }
  suggestCategories(trends) {
    return Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category]) => category);
  }
}

// --- FRESHA-STYLE CATEGORY CARD COMPONENT ---
const FreshaCategoryCard = ({ category, onClick, index }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRectRef = useRef(null);
  const rafRef = useRef(null);

  const onMouseEnter = (e) => {
    cardRectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const onMouseMove = (e) => {
    if (!cardRectRef.current) {
      cardRectRef.current = e.currentTarget.getBoundingClientRect();
    }
    const card = cardRectRef.current;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const x = (clientX - card.left) / card.width;
      const y = (clientY - card.top) / card.height;
      setRotate({ x: (y - 0.5) * 30, y: (x - 0.5) * -30 });
    });
  };

  const onMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cardRectRef.current = null;
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{
        y: -20,
        scale: 1.08,
        rotate: [0, -1, 1, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.94 }}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(category)}
      style={{
        perspective: 1500,
        rotateX: rotate.x,
        rotateY: rotate.y,
        transformStyle: "preserve-3d"
      }}
      className="cursor-pointer relative overflow-hidden rounded-[3.5rem] shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.18)] transition-all duration-500 border border-gray-100"
    >
      <div className="relative aspect-[4/5] overflow-hidden p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col items-center justify-center">
        {/* Elite 3D Background Shadow - Emotional Pulse */}
        <div className={`absolute -inset-10 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-30 blur-[4rem] transition-opacity duration-700 -z-10 animate-pulse-slow`} />

        {/* Floating 3D Icon Section */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
          className="relative z-10 w-40 h-40 flex items-center justify-center"
          style={{ transform: "translateZ(100px)" }}
        >
          {/* 3D Glass Sphere Backing with Emotional Glow */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-full border border-white/80 shadow-[inset_0_0_20px_white] group-hover:scale-110 group-hover:bg-white/70 transition-all duration-700" />

          <div className="relative z-20 text-7xl drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700">
            {category.emoji || '✨'}
          </div>

          {/* Isometric Overlay Image IF EXISTS */}
          {category.image.startsWith('/') && (
            <img loading="lazy"
              src={category.image}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
            />
          )}
        </motion.div>

        {/* Info Section */}
        <div className="absolute inset-x-0 bottom-0 p-8 text-center bg-gradient-to-t from-white via-white/90 to-transparent z-40">
          <h3 className="text-gray-900 font-black text-xl mb-1 tracking-tight uppercase group-hover:text-rose-600 transition-colors">
            {category.name}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
              {category.count} active
            </span>
          </div>
        </div>

        {/* Interactive Highlight */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.div>
  );
};

// --- Airbnb-Style Components (Preserved) ---

const CategoryFilter = ({ icon, label, onClick, isActive }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-2 min-w-[64px] pb-3 border-b-2 transition-all duration-200 ${isActive ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
      }`}
  >
    <span className="text-2xl filter grayscale hover:grayscale-0 transition-all">{icon}</span>
    <span className="text-xs font-medium whitespace-nowrap">{label}</span>
  </motion.button>
);

const SectionTitle = ({ title, actionText, onAction }) => (
  <div className="flex justify-between items-end mb-6">
    <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">{title}</h2>
    {actionText && (
      <button onClick={onAction} className="text-sm font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors">
        {actionText}
      </button>
    )}
  </div>
);

// --- ELITE HELPER CARD ---
const EliteHelperCard = ({ helper, onClick }) => {
  const formatPrice = () => {
    return `R${helper.regularPrice}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-2 "
    >
      <div className="relative aspect-square overflow-hidden md:rounded-2xl rounded-none -mx-4 md:mx-0 bg-gray-100 ">
        <ImageGallery
          imageUrls={helper.imageUrls || []}
          alt={helper.name}
          type="avatar"
        />

        {/* Verification removed */}
        <div className="absolute bottom-3 left-3 bg-white/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/30 z-20">
          <span className="text-[8px] font-black text-white uppercase tracking-widest">{helper.type || 'Helper'}</span>
        </div>
      </div>

      <div className="flex flex-col pt-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-[15px] text-gray-900 truncate">
              {helper.address || "South Africa"}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <StarIconSolid className="w-3.5 h-3.5 text-gray-950" />
            <span className="text-[14px] font-medium text-gray-950 flex items-center gap-1">
              <span>{(helper.rating || 0).toFixed(1)}</span>
              <span className="text-gray-500 font-normal text-[12px]">({helper.comments?.length || 0})</span>
            </span>
          </div>
        </div>

        <p className="text-[14px] text-gray-500 truncate">{helper.name}</p>


        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[15px] font-bold text-gray-900">{formatPrice()}</span>
        </div>
      </div>
    </motion.div>
  );
};



// --- ELITE CARD FOR EXPLORE UNIVERSE ---
const EliteCard = ({ item, onClick, type = 'property', reducedSize = false }) => {
  const formatPrice = () => {
    const price = item.price || item.regularPrice;
    if (type === 'property' && (item.type === 'sale' || item.type === 'land')) {
      return `R${price?.toLocaleString()}`;
    }
    return `R${price}`;
  };

  const getPriceSuffix = () => {
    if (type !== 'property') return '';
    switch (item.type) {
      case 'rent': return '/ month';
      case 'over': return '/ night';
      case 'sale': return '';
      case 'office': return '/ hour';
      case 'land': return '';
      default: return item.type?.includes('rent') ? '/ month' : '';
    }
  };

  return (
    <div
      onClick={() => onClick(item._id ? `/${type}/${item._id}` : '#')}
      className="cursor-pointer flex flex-col bg-white w-full rounded-[2rem] overflow-hidden shadow-lg relative border border-gray-200/80 hover:border-rose-500/50 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img loading="lazy" src={item.imageUrls?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={item.name} />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <div className="bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
            <span className="text-[8px] font-black text-white uppercase tracking-widest">{type}</span>
          </div>
          <button className="p-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 hover:bg-rose-500 hover:border-rose-500 transition-colors group/heart shadow-sm">
            <HeartIcon className="w-4 h-4 text-gray-700 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content Info below image */}
      <div className="p-5 flex flex-col justify-end bg-white border-t border-gray-50">
        <div className="flex justify-between items-end gap-2 mb-1">
          <h3 className="font-black text-gray-950 text-base leading-tight line-clamp-1">
            {item.address || "South Africa"}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-gray-100 px-2 py-0.5 rounded-md">
            <StarIconSolid className="w-3 h-3 text-amber-500" />
            <span className="text-[11px] font-black text-gray-700">{(item.rating || 0).toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-2">{item.name}</p>

        <div className="flex items-baseline gap-1 mt-1 bg-rose-50/50 w-fit px-3 py-1 rounded-lg border border-rose-100/30">
          <span className="text-base font-black text-rose-600">{formatPrice()}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{getPriceSuffix()}</span>
        </div>
      </div>
    </div>
  );
};

// --- AIRBNB-STYLE DISCOVER SECTION (SIDE-SLIDING & REDUCED SIZE) ---
const AirbnbDiscoverSection = ({ title, items, type, navigate, actionText, onAction }) => {
  return (
    <section className="mb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">Discovery Engine</span>
          </div>
          <h2 className="text-3xl font-black text-gray-950 tracking-tighter leading-none">{title}</h2>
        </div>
        {actionText && (
          <button
            onClick={onAction}
            className="text-xs font-black text-rose-500 uppercase tracking-widest border-b border-rose-500/20 hover:border-rose-500 transition-all text-[11px]"
          >
            {actionText}
          </button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
        {items.map((item, idx) => (
          <motion.div
            key={item._id || idx}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
            className="snap-start shrink-0 w-[160px] md:w-[200px]"
          >
            <AirbnbCard
              item={item}
              type={type}
              onClick={(path) => navigate(path)}
              reducedSize
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const StatusCard = ({ request, onLike, onDislike, currentUser, navigate }) => {
  const isLiked = currentUser && request.likes?.includes(currentUser._id);
  const isDisliked = currentUser && request.dislikes?.includes(currentUser._id);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/looking-for?id=${request._id}`)}
      className="p-6 flex flex-col gap-5 h-full cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 p-0.5 shadow-sm">
            <img loading="lazy"
              src={request.userRef?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt="user"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-[13px] leading-tight truncate w-32">
              {request.userRef?.username || "Neighbor"}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{request.category}</span>
            </div>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100">
          {request.category === 'roommate' ? '👤' :
            request.category === 'nanny' ? '🍼' :
              request.category === 'pampering' ? '💄' : '✨'}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-black text-gray-900 text-sm leading-tight">{request.title}</h4>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{request.location}</span>
        </div>
      </div>

      <p className="text-gray-600 text-[13px] leading-relaxed line-clamp-3 flex-grow font-medium">
        {request.description}
      </p>

      <div className="flex flex-col gap-3 pt-4 border-t border-gray-50 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
            <PhoneIcon className="w-4 h-4" />
            <span className="text-[11px] font-black tracking-widest">{request.contact || "Not provided"}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-0.5">Bid Price</span>
            <div className="text-[12px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100 shadow-sm">
              {request.budget ? `R${request.budget.toLocaleString()}` : "OPEN BID"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); onLike(request._id); }}
              className={`flex items-center gap-1.5 transition-all ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {isLiked ? <HandThumbUpIconSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
              <span className="text-xs font-black">{request.likes?.length || 0}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); onDislike(request._id); }}
              className={`flex items-center gap-1.5 transition-all ${isDisliked ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {isDisliked ? <HandThumbDownIconSolid className="w-5 h-5" /> : <HandThumbDownIcon className="w-5 h-5" />}
              <span className="text-xs font-black">{request.dislikes?.length || 0}</span>
            </motion.button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${request.contact}`); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 "
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CommunityNeedsSection = () => null;

// ─── Upcoming Bookings Strip ──────────────────────────────────────────────────
const UpcomingBookingStrip = ({ navigate }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!currentUser?._id) { setLoading(false); return; }
    const controller = new AbortController();
    const fetch_ = async () => {
      try {
        const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const active = data
          .filter(b => {
            const d = new Date(b.startDate);
            d.setHours(0, 0, 0, 0);
            return d >= now && !['cancelled', 'completed', 'declined'].includes(b.status);
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 8)
          .map(b => {
            const due = new Date(b.startDate);
            const diffMs = due - new Date();
            const diffDays = Math.floor(diffMs / 86400000);
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const isToday = diffDays === 0;
            const isTomorrow = diffDays === 1;
            const urgency = isToday ? 'today' : isTomorrow ? 'tomorrow' : diffDays <= 3 ? 'soon' : 'upcoming';
            return {
              id: b._id,
              title: b.listing?.name || b.helper?.name || b.service?.name || b.event?.name || 'Booking Request',
              image: b.listing?.imageUrls?.[0] || b.helper?.imageUrls?.[0] || b.service?.imageUrls?.[0] || b.event?.imageUrls?.[0] || null,
              status: b.status || 'pending',
              dateStr: due.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
              timeStr: due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              diffDays, diffHrs, urgency, isToday, isTomorrow,
              type: b.listing ? 'listing' : b.helper ? 'helper' : b.event ? 'event' : 'service',
              itemId: b.listing?._id || b.helper?._id || b.service?._id || b.event?._id,
              emoji: b.listing ? '🏡' : b.helper ? '🧹' : b.event ? '🎟️' : '🛠️',
              proName: b.listing ? (b.listing.userRef?.username || b.listing.name || 'Host') : (b.helper?.name || b.service?.name || b.event?.name || 'Professional'),
              proAvatar: b.listing?.imageUrls?.[0] || b.helper?.imageUrls?.[0] || b.service?.imageUrls?.[0] || b.event?.imageUrls?.[0] || 'https://i.pravatar.cc/150?u=pro',
              proWhatsapp: b.phone || b.helper?.phone || b.service?.phone || '',
              proPhone: b.phone || b.helper?.phone || b.service?.phone || '',
              selectedPerformer: b.selectedPerformer || null,
              performerExperience: b.performerExperience || null,
              performerImage: b.performerImage || null,
              address: b.address || b.listing?.address || b.service?.address || b.event?.address || b.location || '',
              price: b.totalPrice || b.totalAmount || b.price || b.listing?.price || b.service?.price || b.helper?.price || null,
              notes: b.notes || b.specialInstructions || ''
            };
          });
        setBookings(active);
      } catch (e) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
    return () => controller.abort();
  }, [currentUser]);

  if (!currentUser || (!loading && bookings.length === 0)) return null;

  const urgencyStyles = {
    today: { pill: 'bg-rose-500 text-white', bar: 'bg-rose-500', label: 'TODAY' },
    tomorrow: { pill: 'bg-amber-500 text-white', bar: 'bg-amber-500', label: 'TOMORROW' },
    soon: { pill: 'bg-blue-500 text-white', bar: 'bg-blue-500', label: 'SOON' },
    upcoming: { pill: 'bg-slate-700 text-white', bar: 'bg-slate-400', label: 'UPCOMING' },
  };

  const statusColors = {
    pending: 'text-amber-500',
    confirmed: 'text-emerald-500',
    approved: 'text-emerald-500',
    assigned: 'text-blue-500',
    enroute: 'text-indigo-500',
    ongoing: 'text-rose-500',
  };

  return (
    <section className="mb-6 -mx-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-rose-500" />
          <span className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Your Upcoming</span>
          {bookings.length > 0 && (
            <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{bookings.length}</span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile?tab=bookings')}
          className="text-[10px] font-black text-rose-500 uppercase tracking-wider"
        >
          See All
        </motion.button>
      </div>

      {/* Scroll strip */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1 snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0 w-[160px] h-[170px] bg-gray-100 rounded-3xl animate-pulse" />
          ))
          : bookings.map((b, i) => {
            const u = urgencyStyles[b.urgency];
            const sc = statusColors[b.status] || 'text-gray-400';
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedBooking(b)}
                className="snap-start shrink-0 w-[160px] cursor-pointer relative overflow-hidden rounded-3xl shadow-md border border-gray-100 bg-white group hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative h-[80px] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{b.emoji}</div>
                  )}
                  {/* Due date pill */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${u.pill}`}>
                    {b.isToday ? 'Today' : b.isTomorrow ? 'Tomorrow' : `${b.diffDays}d`}
                  </div>
                  {/* urgency bar at bottom of image */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${u.bar}`} />
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[12px] font-black text-gray-900 leading-tight line-clamp-1 mb-1">{b.title}</p>
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[9px] text-gray-400 font-bold">{b.dateStr.replace(/, \d{4}/, '')}</span>
                    <span className="text-[9px] text-gray-300">·</span>
                    <span className="text-[9px] text-gray-400 font-bold">{b.timeStr}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-wider ${sc}`}>
                      {b.status}
                    </span>
                    <span className="text-[9px]">{b.emoji}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        }
      </div>

      {/* Interactive Booking Details Modal Popup */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[88vh] flex flex-col"
            >
              {/* Header Image / Pattern Area */}
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 flex-shrink-0">
                {selectedBooking.image ? (
                  <img
                    src={selectedBooking.image}
                    alt={selectedBooking.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {selectedBooking.emoji}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Controls: Urgency Badge & Close button */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${urgencyStyles[selectedBooking.urgency]?.pill || 'bg-rose-500 text-white'}`}>
                      {selectedBooking.isToday ? '⚡ Due Today' : selectedBooking.isTomorrow ? '⏰ Due Tomorrow' : `🗓️ Due in ${selectedBooking.diffDays} days`}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest">
                      {selectedBooking.type}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>

                {/* Title inside Header */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-0.5">Booking Details</p>
                  <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-1">
                    {selectedBooking.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-hide text-left">
                {/* Date & Time Widget */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg">
                      <FaCalendarCheck />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Due Date</p>
                      <p className="text-sm font-black text-slate-900">{selectedBooking.dateStr} &bull; {selectedBooking.timeStr}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedBooking.status === 'confirmed' || selectedBooking.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      selectedBooking.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        selectedBooking.status === 'enroute' ? 'bg-indigo-100 text-indigo-700' :
                          selectedBooking.status === 'ongoing' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                    }`}>
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Assigned Performer / Pro Contact Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={selectedBooking.selectedPerformer ? (selectedBooking.performerImage || selectedBooking.proAvatar) : selectedBooking.proAvatar}
                          alt={selectedBooking.proName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                          onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=pro'; }}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {selectedBooking.selectedPerformer ? 'Assigned Pro' : 'Provider / Host'}
                        </p>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {selectedBooking.selectedPerformer || selectedBooking.proName}
                        </h4>
                        {selectedBooking.performerExperience && (
                          <span className="text-[9px] text-rose-500 font-bold uppercase">{selectedBooking.performerExperience} Exp</span>
                        )}
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex items-center gap-2">
                      {selectedBooking.proWhatsapp && (
                        <a
                          href={`https://wa.me/${selectedBooking.proWhatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-md shadow-emerald-200 active:scale-95 transition-all"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp className="text-base" />
                        </a>
                      )}
                      {selectedBooking.proPhone && (
                        <a
                          href={`tel:${selectedBooking.proPhone}`}
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                          title="Call"
                        >
                          <FaPhone className="text-xs" />
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedBooking.address && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-100 text-slate-600 text-xs">
                      <FaMapMarkerAlt className="text-rose-500 text-xs mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{selectedBooking.address}</span>
                    </div>
                  )}
                </div>

                {/* Notes or Price Info */}
                {(selectedBooking.price || selectedBooking.notes) && (
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl text-xs">
                    {selectedBooking.price && (
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Price</span>
                        <span className="font-black text-slate-900 text-sm">R{selectedBooking.price}</span>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <p className="text-[11px] text-slate-500 italic max-w-[200px] truncate">{selectedBooking.notes}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons in Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={() => {
                    const itemRoute = `/${selectedBooking.type === 'listing' ? 'listing' : selectedBooking.type}/${selectedBooking.itemId}`;
                    setSelectedBooking(null);
                    navigate(itemRoute);
                  }}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-98 transition-all cursor-pointer"
                >
                  <span>View Item Details</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    navigate('/profile?tab=bookings');
                  }}
                  className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
                >
                  <span>All Bookings</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Pure subcategory matcher (module-scope so both Mobile and Desktop can use it) ---
const matchItemToSubcategory = (item, tab, subId) => {
  if (!item) return false;
  if (subId === 'all') return true;

  const text = `${item.name || ''} ${item.title || ''} ${item.description || ''} ${item.type || ''} ${item.kind || ''} ${item.category || ''} ${item.skills || ''}`.toLowerCase();

  if (tab === 'Property') {
    switch (subId) {
      case 'rooms':
        return item.type === 'rent' || item.type === 'room' || item.kind === 'room' || item.kind === 'house' || item.kind === 'studio' || item.kind === 'cottage' || item.kind === 'townhouse' || item.kind === 'villa' || /room|house to rent|home to rent|cottage|flat|studio|townhouse|villa/i.test(text);
      case 'guesthouse':
        return item.type === 'over' || item.type === 'guesthouse' || item.type === 'guest_house' || item.kind === 'guest_house' || item.kind === 'guesthouse' || /guest\s*house|guesthouse|b&b|bed and breakfast/i.test(text);
      case 'hotel':
        return item.type === 'hotel' || item.kind === 'hotel' || /hotel|motel/i.test(text);
      case 'lodge':
        return item.type === 'lodge' || item.kind === 'lodge' || /lodge/i.test(text);
      case 'apartment':
        return item.type === 'apartment' || item.kind === 'apartment' || item.kind === 'complex' || (Number(item.numberOfApartments) > 0) || /apartment|complex|flat/i.test(text);
      case 'self_catering':
        return item.type === 'land' || item.type === 'self_catering' || item.kind === 'Self Catering' || item.kind === 'self_catering' || item.kind === 'chalet' || /self[-\s]?catering|chalet/i.test(text);
      case 'resort':
        return item.type === 'resort' || item.kind === 'resort' || /resort|holiday park/i.test(text);
      case 'hourly_room':
        return item.type === 'office' || item.type === 'hourly_room' || item.type === 'room_hourly' || item.kind === 'office' || item.kind === 'hourly_room' || /hourly|room per hour|day room|short stay|workspace/i.test(text);
      default: return true;
    }
  }

  if (tab === 'Services') {
    switch (subId) {
      case 'transport': return item.type === 'transport' || item.type === 'schoolTransport' || /transport|shuttle|taxi|driver|ride/i.test(text);
      case 'carwash': return item.type === 'carwash' || /car\s*wash|carwash|valet|auto detail/i.test(text);
      case 'catering': return item.type === 'baker' || item.type === 'catering' || /cater|baker|bakery|cake|food|buffet/i.test(text);
      case 'landscaping': return item.type === 'landscaping' || /landscap|garden|lawn|yard|grass/i.test(text);
      case 'moving': return item.type === 'moving' || /moving|logistics|hauling|bakkie|freight|delivery/i.test(text);
      case 'storage': return item.type === 'storage' || /storage|self storage|vault|container/i.test(text);
      case 'handyman': return item.type === 'handyman' || item.type === 'electrician' || item.type === 'plumber' || /handyman|electric|plumb|pipe|repair|install/i.test(text);
      case 'others': return item.type === 'other' || item.type === 'others' || item.type === 'daily' || item.type === 'daycare' || (!['transport', 'schoolTransport', 'carwash', 'baker', 'catering', 'landscaping', 'moving', 'storage', 'electrician', 'handyman', 'plumber'].includes(item.type));
      default: return true;
    }
  }

  if (tab === 'Helper') {
    switch (subId) {
      case 'domestic': return item.type === 'domestic' || item.type === 'maid' || item.type === 'cleaner' || item.type === 'nanny' || /domestic|clean|maid|housekeep|nanny/i.test(text);
      case 'tutor': return item.type === 'tutor' || /tutor|teach|math|science|english|lesson|academy/i.test(text);
      case 'chef': return item.type === 'chef' || /chef|cook|culinary|catering|food/i.test(text);
      case 'beauty': return item.type === 'beauty' || item.type === 'beauty_specialist' || item.type === 'nails' || item.type === 'hair' || item.type === 'massage' || /beauty|skin|lash|nail|facial|hair|makeup|massage/i.test(text);
      case 'tattoo': return item.type === 'tattoo' || /tattoo|ink|piercing|body art/i.test(text);
      case 'barber': return item.type === 'barber' || /barber|haircut|fade|beard|groom/i.test(text);
      case 'photography': return item.type === 'photograph' || item.type === 'photography' || /photo|photograph|camera|videograph|portrait/i.test(text);
      case 'sneakers':
      case 'sneaker': return item.type === 'sneaker' || item.type === 'sneakers' || /sneaker|kicks|shoe clean/i.test(text);
      case 'animals':
      case 'animal': return item.type === 'animals' || item.type === 'animal' || /animal|dog|pet|cat|vet/i.test(text);
      default: return true;
    }
  }

  if (tab === 'Events') {
    switch (subId) {
      case 'music': return item.category === 'music' || item.type === 'music' || /music|concert|dj|festival|live band|party/i.test(text);
      case 'sports': return item.category === 'sports' || item.category === 'sport' || item.type === 'sports' || item.type === 'sport' || /sport|tournament|match|soccer|football|rugby|marathon/i.test(text);
      case 'arts':
      case 'art': return item.category === 'arts' || item.category === 'art' || item.type === 'arts' || item.type === 'art' || /art|theatre|theater|gallery|exhibition|expo/i.test(text);
      case 'community': return item.category === 'community' || item.type === 'community' || /community|networking|workshop|meetup|church/i.test(text);
      case 'food': return item.category === 'food' || item.type === 'food' || /food|wine|tasting|braai|market|cookout/i.test(text);
      case 'outdoors':
      case 'hiking': return item.category === 'outdoors' || item.category === 'hiking' || item.type === 'hiking' || item.type === 'outdoors' || /hike|hiking|outdoor|trail|camping|safari/i.test(text);
      default: return true;
    }
  }

  if (tab === 'Selling' || tab === 'Sell' || tab === 'Marketplace') {
    switch (subId) {
      case 'furniture': return item.category === 'furniture' || item.type === 'furniture' || /furniture|sofa|bed|table|couch|chair/i.test(text);
      case 'electronics': return item.category === 'electronics' || item.type === 'electronics' || /electronic|phone|laptop|tv|computer|gadget/i.test(text);
      case 'clothes': return item.category === 'clothes' || item.type === 'clothes' || /cloth|shoe|dress|shirt|jacket|wear/i.test(text);
      case 'universities': return item.category === 'universities' || item.type === 'universities' || /uni|university|student|campus/i.test(text);
      case 'books': return item.category === 'books' || item.type === 'books' || /book|textbook|novel|study/i.test(text);
      default: return true;
    }
  }

  return true;
};

function MobileAppHomepage({
  featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems,
  loadingProperties, loadingServices, loadingHelpers, loadingEvents,
  stats, onItemClick, recentlyViewedItems, onRecentlyViewedLike,
  currentLocation = 'South Africa', navigate, aiRecommendations, aiInsights, aiTrendData, onAISuggestionClick,
  recentlyAddedItems, locationStatus, requestCount = 0, geoCity, geoLoading, geoError, onRequestLocation, currentUser
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Homes');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [activeFeaturedTab, setActiveFeaturedTab] = useState('Properties');
  const locationLabel = geoCity || currentLocation || 'your area';

  useEffect(() => {
    const checkScreenSize = () => { setIsDesktop(window.innerWidth >= 1024); };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&type=all&address=${encodeURIComponent(currentLocation)}`);
      setSearchTerm('');
    }
  };

  const [activeTab, setActiveTab] = useState('RecentAdded');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeTab, activeSubcategory]);

  const tabs = [
    {
      id: 'RecentAdded',
      label: 'Recent Added',
      emoji: '⚡',
      desc: 'New listings',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-500',
      subcategories: [
        { id: 'all', label: 'All Recent', emoji: '⚡' },
        { id: 'property', label: 'Properties', emoji: '🏡' },
        { id: 'service', label: 'Services', emoji: '🛠️' },
        { id: 'helper', label: 'Helpers', emoji: '🧹' },
        { id: 'event', label: 'Events', emoji: '🎟️' },
        { id: 'selling', label: 'Items for Sale', emoji: '🏷️' }
      ]
    },
    {
      id: 'Property',
      label: 'Property',
      emoji: '🏡',
      desc: 'Rooms & stays',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      subcategories: [
        { id: 'all', label: 'All Properties', emoji: '🏡' },
        { id: 'rooms', label: 'Rooms / Home to Rent', emoji: '🏠' },
        { id: 'guesthouse', label: 'Guest House & B&B', emoji: '🛌' },
        { id: 'hotel', label: 'Hotels', emoji: '🏨' },
        { id: 'lodge', label: 'Lodges', emoji: '🏡' },
        { id: 'apartment', label: 'Apartment & Complex', emoji: '🏢' },
        { id: 'self_catering', label: 'Self Catering', emoji: '🍳' },
        { id: 'resort', label: 'Resort & Holiday Park', emoji: '🏖️' },
        { id: 'hourly_room', label: 'Room Per Hour', emoji: '🚪' }
      ]
    },
    {
      id: 'Services',
      label: 'Services',
      emoji: '🛠️',
      desc: 'Book pros',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-500',
      subcategories: [
        { id: 'all', label: 'All Services', emoji: '🛠️' },
        { id: 'transport', label: 'Transport & Shuttle', emoji: '🚕' },
        { id: 'carwash', label: 'Car Wash', emoji: '🚗' },
        { id: 'catering', label: 'Catering & Baking', emoji: '🍽️' },
        { id: 'landscaping', label: 'Landscaping & Yard', emoji: '🌿' },
        { id: 'moving', label: 'Moving & Logistics', emoji: '🚚' },
        { id: 'storage', label: 'Booking Storage', emoji: '📦' },
        { id: 'handyman', label: 'Handyman & Repairs', emoji: '🔧' },
        { id: 'others', label: 'Others & General', emoji: '✨' }
      ]
    },
    {
      id: 'Helper',
      label: 'Helper',
      emoji: '🧹',
      desc: 'Chores & care',
      textColor: 'text-sky-600',
      bgColor: 'bg-sky-500',
      subcategories: [
        { id: 'all', label: 'All Helpers', emoji: '🧹' },
        { id: 'domestic', label: 'Domestic Helper', emoji: '🧹' },
        { id: 'tutor', label: 'Private Tutor', emoji: '📚' },
        { id: 'chef', label: 'Private Chef', emoji: '👨‍🍳' },
        { id: 'beauty', label: 'Beauty Specialist', emoji: '💅' },
        { id: 'tattoo', label: 'Tattoo Artist', emoji: '💉' },
        { id: 'barber', label: 'Barbershop', emoji: '💈' },
        { id: 'photography', label: 'Photographer', emoji: '📸' },
        { id: 'sneakers', label: 'Sneaker Cleaner', emoji: '👟' },
        { id: 'animals', label: 'Animal Care', emoji: '🐕' }
      ]
    },
    {
      id: 'Events',
      label: 'Events',
      emoji: '🎟️',
      desc: 'Shows & vibes',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-500',
      subcategories: [
        { id: 'all', label: 'All Events', emoji: '🎟️' },
        { id: 'music', label: 'Music & Concerts', emoji: '🎵' },
        { id: 'sports', label: 'Sports & Matches', emoji: '⚽' },
        { id: 'arts', label: 'Arts & Culture', emoji: '🎨' },
        { id: 'community', label: 'Community & Meetups', emoji: '🤝' },
        { id: 'food', label: 'Food & Markets', emoji: '🍔' },
        { id: 'outdoors', label: 'Outdoors & Safari', emoji: '⛺' }
      ]
    },
    {
      id: 'Selling',
      label: 'Marketplace',
      emoji: '🏷️',
      desc: 'Buy & sell',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-500',
      subcategories: [
        { id: 'all', label: 'All Items', emoji: '🏷️' },
        { id: 'furniture', label: 'Furniture', emoji: '🛋️' },
        { id: 'electronics', label: 'Electronics', emoji: '💻' },
        { id: 'clothes', label: 'Clothes', emoji: '👕' },
        { id: 'universities', label: 'Universities', emoji: '🎓' },
        { id: 'books', label: 'Books', emoji: '📚' }
      ]
    },
    {
      id: 'Lunch',
      label: 'Lunch',
      emoji: '🍱',
      desc: 'Food & eats',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-500',
      route: '/lunch'
    },
    {
      id: 'Matchmaker',
      label: 'Matchmaker',
      emoji: '🎯',
      desc: 'AI matching',
      textColor: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-500',
      route: '/matchmaker'
    },
    {
      id: 'LookingFor',
      label: 'Needs',
      emoji: '📢',
      desc: 'Live requests',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-500',
      route: '/looking-for'
    }
  ];



  const getSourceForTab = useCallback((tab) => {
    if (tab === 'RecentAdded' || tab === 'Recent Added') return recentlyAddedItems || [];
    if (tab === 'Property' || tab === 'Properties') return featuredProperties || [];
    if (tab === 'Services') return featuredServices || [];
    if (tab === 'Helper' || tab === 'Helpers') return featuredHelpers || [];
    if (tab === 'Events') return featuredEvents || [];
    if (tab === 'Selling' || tab === 'Sell' || tab === 'Marketplace') return featuredSellItems || [];
    return [];
  }, [recentlyAddedItems, featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems]);

  const filteredItems = useMemo(() => {
    const source = getSourceForTab(activeTab);
    if (activeTab === 'RecentAdded' || activeTab === 'Recent Added') {
      if (activeSubcategory === 'all') return source;
      return source.filter(item => {
        const type = item.itemType === 'listing' ? 'property' : (item.itemType || '');
        return type === activeSubcategory;
      });
    }
    return source.filter(item => matchItemToSubcategory(item, activeTab, activeSubcategory));
  }, [activeTab, activeSubcategory, getSourceForTab]);

  const getSubcategoryCount = useCallback((tab, subId) => {
    const source = getSourceForTab(tab);
    if (tab === 'RecentAdded' || tab === 'Recent Added') {
      if (subId === 'all') return source.length;
      return source.filter(item => {
        const type = item.itemType === 'listing' ? 'property' : (item.itemType || '');
        return type === subId;
      }).length;
    }
    return source.filter(item => matchItemToSubcategory(item, tab, subId)).length;
  }, [getSourceForTab]);

  const currentCategoryObj = useMemo(() => tabs.find(t => t.id === activeTab) || tabs[0], [activeTab, tabs]);

  const getTabColor = (id) => {
    switch (id) {
      case 'RecentAdded':
      case 'Recent Added': return 'bg-rose-500';
      case 'Property':
      case 'Properties': return 'bg-emerald-500';
      case 'Services': return 'bg-amber-500';
      case 'Helper':
      case 'Helpers': return 'bg-sky-500';
      case 'Events': return 'bg-purple-500';
      case 'Selling':
      case 'Sell':
      case 'Marketplace': return 'bg-teal-500';
      default: return 'bg-gray-900';
    }
  };

  if (isDesktop) {
    return (
      <DesktopHomepage
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
        currentCategoryObj={currentCategoryObj}
        getSubcategoryCount={getSubcategoryCount}
        featuredProperties={featuredProperties}
        featuredServices={featuredServices}
        featuredHelpers={featuredHelpers}
        featuredEvents={featuredEvents}
        featuredSellItems={featuredSellItems}
        recentlyAddedItems={recentlyAddedItems}
        navigate={navigate}
        currentUser={currentUser}
        isBookingsOpen={isBookingsOpen}
        setIsBookingsOpen={setIsBookingsOpen}
        requestCount={requestCount}
        stats={stats}
      />
    );
  }

  // Mobile View
  return (
    <div className="min-h-screen bg-white pb-32 relative overflow-x-clip w-full">
      <Helmet>
        <title>loopOut | Find Homes, Services &amp; Helpers Near You</title>
        <meta name="description" content="Discover verified helpers, book top services, and explore properties in your area with loopOut." />
      </Helmet>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Premium Hero Banner ── */}
      <div className="relative h-[185px] sm:h-[215px] overflow-hidden">
        {/* Deep layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a14] via-[#0f0f1f] to-[#1a0a14]" />

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '18px 18px' }}
        />

        {/* Animated aurora orbs */}
        <div className="absolute -top-10 right-4 w-56 h-56 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" style={{ animation: 'pulse 5s ease-in-out infinite' }} />
        <div className="absolute top-6 -left-10 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" style={{ animation: 'pulse 7s ease-in-out infinite 1.5s' }} />
        <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" style={{ animation: 'pulse 6s ease-in-out infinite 3s' }} />

        <div className="relative h-full flex flex-col justify-between px-4 pt-4 pb-4 sm:pt-5 sm:pb-5">
          {/* Top row: GPS location + trust badge */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onRequestLocation}
              aria-label="Update your location"
              className="inline-flex max-w-[72%] items-center gap-1.5 px-3 py-1 rounded-full border text-left text-white text-[9px] font-black uppercase tracking-[0.18em] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
              <FaMapMarkerAlt className={`shrink-0 ${geoLoading ? 'animate-bounce text-amber-300' : 'text-rose-300'}`} />
              <span className="truncate normal-case tracking-normal">
                {geoLoading ? 'Finding your location…' : geoError ? 'Use my location' : `Near ${locationLabel}`}
              </span>
              <span className="text-white/40 mx-0.5">·</span>
              <span className="shrink-0 text-white/60 normal-case font-semibold tracking-normal">GPS</span>
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-rose-300"
              style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)' }}>
              <span className="text-[11px]">🇿🇦</span>
              SA's #1
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-white font-black leading-[1.1] tracking-tight mb-1.5" style={{ fontSize: 'clamp(1.15rem, 5vw, 1.5rem)' }}>
              Find a{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #fb7185, #fb923c, #fbbf24)' }}>
                Helper, Room
              </span>
              <br />or Service — Near You
            </h1>
            <p className="text-white/55 font-medium leading-snug" style={{ fontSize: '11px', maxWidth: '280px' }}>
              Verified locals · Instant booking · 100% secure
            </p>
          </div>

          {/* Bottom CTA chips */}
          <div className="flex items-center gap-2">
            {[
              { label: '🏠 Rooms', tab: 'Property' },
              { label: '🛠️ Services', tab: 'Services' },
              { label: '👤 Helpers', tab: 'Helper' },
            ].map(({ label, tab }) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveSubcategory('all'); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white font-bold shrink-0 active:scale-95 transition-all duration-200"
                style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <style>{`
        `}</style>
      </div>


      <main className="px-4 pt-4 pb-4 w-full">

        {/* ── UPCOMING BOOKINGS STRIP ── */}
        <UpcomingBookingStrip navigate={navigate} />

        {/* ── EXPLORE SECTION (listings-first) ── */}
        <section id="explore-section" className="mb-8">

          {/* Sticky Categories Bar with horizontal swipe & enlarged icons (Left 0 to Right 0 full width) */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl py-3 mb-4 -mx-4 px-4 border-b border-gray-100/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] w-[calc(100%+2rem)]">
            <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-hide py-1 snap-x snap-mandatory">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      if (tab.route) {
                        navigate(tab.route);
                        return;
                      }
                      setActiveTab(tab.id);
                      setActiveSubcategory('all');
                    }}
                    whileTap={{ scale: 0.92 }}
                    className="snap-start shrink-0 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none min-w-[66px] sm:min-w-[78px] py-1"
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 0.92, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className={`w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${isActive
                          ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20 ring-2 ring-slate-950'
                          : 'bg-slate-50 border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300 shadow-2xs'
                        }`}
                    >
                      <span className="text-2xl sm:text-3xl leading-none select-none drop-shadow-sm">{tab.emoji}</span>
                    </motion.div>
                    <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2 leading-tight truncate w-full ${isActive ? 'text-rose-600 font-extrabold' : (tab.textColor || 'text-slate-800')
                      }`}>
                      {tab.label}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold mt-0.5 leading-tight truncate w-full">{tab.desc}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Pills */}
          {currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5 mb-5 -mx-4 px-4 snap-x">
              {currentCategoryObj.subcategories.map((sub) => {
                const isSubActive = activeSubcategory === sub.id;
                const count = getSubcategoryCount(activeTab, sub.id);
                return (
                  <motion.button
                    key={sub.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubcategory(sub.id)}
                    className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${isSubActive
                        ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                        : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                      }`}
                  >
                    <span className="text-sm">{sub.emoji}</span>
                    <span className="whitespace-nowrap tracking-tight">{sub.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isSubActive ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Section label + live count */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-base text-gray-950 tracking-tight">
              Explore <span className="text-rose-500">{activeTab}</span>
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Live · {filteredItems.length}
              </span>
            </div>
          </div>

          {/* Listing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredItems.slice(0, visibleCount).map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <AirbnbCard
                  item={item}
                  type={
                    activeTab === 'Helper' || activeTab === 'Helpers'
                      ? 'helper'
                      : activeTab === 'Services'
                        ? 'service'
                        : activeTab === 'Events'
                          ? 'event'
                          : activeTab === 'Selling' || activeTab === 'Marketplace'
                            ? 'selling'
                            : (item.itemType === 'listing' ? 'property' : item.itemType) || 'property'
                  }
                  onClick={(path) => navigate(path)}
                />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 my-4">
              <span className="text-4xl mb-3">{currentCategoryObj?.emoji || '🔍'}</span>
              <h3 className="text-base font-black text-slate-800 mb-1">
                No {activeSubcategory !== 'all' ? activeSubcategory.replace('_', ' ') : activeTab} found
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">Be the first to list in this category.</p>
              {activeSubcategory !== 'all' && (
                <button
                  onClick={() => setActiveSubcategory('all')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Show All {activeTab}
                </button>
              )}
            </div>
          )}

          {/* Load More / Search */}
          {visibleCount < filteredItems.length ? (
            <button
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="w-full mt-10 py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              Load More {activeTab}
            </button>
          ) : filteredItems.length > 0 && (
            <div className="flex justify-center mt-12 mb-4">
              <motion.button
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/search')}
                className="text-gray-400 hover:text-rose-500 transition-colors"
              >
                <MagnifyingGlassIcon className="w-10 h-10" />
              </motion.button>
            </div>
          )}
        </section>

        {/* Community Pulse */}
        <div className="mb-10 -mx-4 lg:mx-0">
          <LoopOutPulse />
        </div>

        {/* Sell Items */}
        <SellItemsSection navigate={navigate} />

        {/* End of Feed */}
        <CaughtUpHub stats={stats} navigate={navigate} />

      </main>

      {/* Track Requests FAB */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsBookingsOpen(true)}
        className="fixed bottom-24 right-4 z-[100] cursor-pointer"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-40 transition-opacity duration-300 shadow-xl" />
        <div className="relative bg-white text-gray-900 p-4 rounded-full shadow-2xl flex items-center justify-center border border-gray-100">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
        </div>
        {requestCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-10">
            {requestCount}
          </div>
        )}
      </motion.div>

      {/* Bookings Modal */}
      <MyBookingsConsumer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
    </div>
  );
}


// --- Airbnb-Style Desktop Homepage ---
function DesktopHomepage({
  tabs,
  activeTab,
  setActiveTab,
  activeSubcategory,
  setActiveSubcategory,
  currentCategoryObj,
  getSubcategoryCount,
  featuredProperties,
  featuredServices,
  featuredHelpers,
  featuredEvents,
  featuredSellItems,
  recentlyAddedItems,
  navigate,
  isBookingsOpen,
  setIsBookingsOpen,
  requestCount,
  stats
}) {
  const getSourceForTabDesktop = useCallback((tab) => {
    if (tab === 'RecentAdded' || tab === 'Recent Added') return recentlyAddedItems || [];
    if (tab === 'Property' || tab === 'Properties') return featuredProperties || [];
    if (tab === 'Services') return featuredServices || [];
    if (tab === 'Helper' || tab === 'Helpers') return featuredHelpers || [];
    if (tab === 'Events') return featuredEvents || [];
    if (tab === 'Selling' || tab === 'Sell' || tab === 'Marketplace') return featuredSellItems || [];
    return [];
  }, [recentlyAddedItems, featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems]);

  const getFilteredItems = useCallback(() => {
    const source = getSourceForTabDesktop(activeTab);
    if (activeTab === 'RecentAdded' || activeTab === 'Recent Added') {
      if (activeSubcategory === 'all') return source;
      return source.filter(item => {
        const type = item.itemType === 'listing' ? 'property' : (item.itemType || '');
        return type === activeSubcategory;
      });
    }
    return source.filter(item => matchItemToSubcategory(item, activeTab, activeSubcategory));
  }, [activeTab, activeSubcategory, getSourceForTabDesktop]);
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>loopOut | Premium Marketplace for Properties, Services &amp; Helpers</title>
        <meta name="description" content="Discover verified helpers, book top services, and explore exclusive properties in your area with loopOut." />
      </Helmet>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Sticky Elite Categories Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.route) {
                      navigate(tab.route);
                      return;
                    }
                    setActiveTab(tab.id);
                    setActiveSubcategory('all');
                  }}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ y: -2 }}
                  className="shrink-0 flex items-center gap-3.5 px-3.5 py-2 rounded-2xl cursor-pointer focus:outline-none transition-all duration-200"
                >
                  <motion.div
                    animate={isActive ? { scale: [1, 0.94, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                        ? 'bg-slate-900 shadow-md ring-2 ring-slate-900 text-white'
                        : 'bg-gray-50 border border-gray-100 hover:bg-gray-100/80 shadow-xs'
                      }`}
                  >
                    <span className="text-2xl leading-none select-none">
                      {tab.emoji}
                    </span>
                  </motion.div>

                  <div className="text-left">
                    <span className={`block text-xs font-black uppercase tracking-wider leading-tight ${isActive ? 'text-rose-600' : (tab.textColor || 'text-gray-800')
                      }`}>
                      {tab.label || tab.id}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-semibold mt-0.5 leading-tight">
                      {tab.desc}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Premium Filter Button */}
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-full hover:border-slate-900 hover:bg-slate-50 transition-all font-black uppercase text-[9px] tracking-widest text-slate-600 bg-white shadow-sm hover:shadow-md active:scale-95 shrink-0 ml-4 cursor-pointer"
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Clean Feed Grid */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Subcategories Horizontal Bar */}
        {currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-6 mb-6 border-b border-gray-100">
            {currentCategoryObj.subcategories.map((sub) => {
              const isSubActive = activeSubcategory === sub.id;
              const count = getSubcategoryCount(activeTab, sub.id);
              return (
                <motion.button
                  key={sub.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer shadow-xs ${isSubActive
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900 scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                    }`}
                >
                  <span className="text-sm">{sub.emoji}</span>
                  <span className="whitespace-nowrap tracking-tight">{sub.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-0.5 ${isSubActive
                        ? 'bg-rose-500 text-white'
                        : 'bg-white text-slate-500 border border-slate-200 shadow-2xs'
                      }`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Upcoming Bookings Strip — Desktop */}
        <div className="mb-8">
          <UpcomingBookingStrip navigate={navigate} />
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">
              <span className="text-slate-900">Explore </span>
              <span className="bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">{activeTab}</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-[0.2em]">Curated · South Africa &amp; Beyond</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              Live · {getFilteredItems().length}
            </span>
          </div>
        </div>

        {/* Listings Grid */}
        {getFilteredItems().length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {getFilteredItems().map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03, ease: 'easeOut' }}
              >
                <AirbnbCard
                  item={item}
                  type={
                    activeTab === 'Helper' || activeTab === 'Helpers'
                      ? 'helper'
                      : activeTab === 'Services'
                        ? 'service'
                        : activeTab === 'Events'
                          ? 'event'
                          : (item.itemType === 'listing' ? 'property' : item.itemType) || 'property'
                  }
                  onClick={(path) => navigate(path)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 my-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-60" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl flex items-center justify-center border border-slate-200 shadow-sm">
                <span className="text-3xl">{currentCategoryObj?.emoji || '🔍'}</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
              No {activeSubcategory !== 'all' ? activeSubcategory.replace('_', ' ') : activeTab} available
            </h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-6">
              {activeSubcategory !== 'all'
                ? `No listings found in ${activeSubcategory.replace('_', ' ')} yet. Try viewing all ${activeTab}.`
                : `Try exploring other categories or expanding your search.`}
            </p>
            {activeSubcategory !== 'all' ? (
              <button
                onClick={() => setActiveSubcategory('all')}
                className="px-7 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
              >
                Show All {activeTab}
              </button>
            ) : (
              <button
                onClick={() => navigate('/search')}
                className="px-7 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
              >
                Browse All Listings
              </button>
            )}
          </div>
        )}

        {/* Sell Items Section (Desktop) */}
        <div className="mt-16">
          <SellItemsSection navigate={navigate} />
        </div>

        {/* Caught Up Hub - End of Feed Showcase */}
        <div className="mt-20">
          <CaughtUpHub stats={stats} navigate={navigate} />
        </div>
      </main>

      {/* Floating AI Agent */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/ai-help-center')}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
      >
        <div className="absolute inset-0 bg-rose-500 rounded-full blur-lg opacity-40 animate-pulse" />
        <div className="relative bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center border border-rose-400">
          <Sparkles className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Floating Bookings Tracker */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsBookingsOpen(true)}
        className="fixed bottom-20 right-6 z-50 cursor-pointer"
      >
        <div className="relative bg-white text-slate-950 p-4 rounded-full shadow-xl flex items-center justify-center border border-slate-200 hover:border-slate-400 hover:shadow-2xl transition-all">
          <CalendarDaysIcon className="w-6 h-6 text-slate-700" />
          {requestCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              {requestCount}
            </span>
          )}
        </div>
      </motion.div>

      {/* Bookings Modal */}
      <MyBookingsConsumer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
    </div>
  );
}

// --- Main Component ---
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiEngine = useRef(new AIRecommendationEngine());
  const { currentUser } = useSelector((state) => state.user);

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredHelpers, setFeaturedHelpers] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [featuredSellItems, setFeaturedSellItems] = useState([]);

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingHelpers, setLoadingHelpers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSellItems, setLoadingSellItems] = useState(true);

  const [stats] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('South Africa');
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBookingCount = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, {
          signal: controller.signal
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const activeBookings = data.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'declined');
          setRequestCount(activeBookings.length);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    };

    fetchBookingCount();
    const interval = setInterval(fetchBookingCount, 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [currentUser]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const items = JSON.parse(stored);
          const enhancedItems = items.map(item => ({ ...item, aiScore: Math.floor(Math.random() * 30) + 70 }));
          setRecentlyViewedItems(enhancedItems);
        }
      } catch (error) { console.error('Failed to load recently viewed items:', error); }
    };
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addressFromUrl = urlParams.get('address');
    if (addressFromUrl) setCurrentLocation(decodeURIComponent(addressFromUrl));
  }, [location.search]);

  const addToRecentlyViewed = (item, itemType) => {
    try {
      aiEngine.current.updatePreferences(item, 'view');
      const viewedItem = {
        ...item,
        itemType: itemType,
        viewedAt: new Date().toISOString(),
        isLiked: false,
        aiScore: Math.floor(Math.random() * 30) + 70
      };
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter(i => i._id !== item._id || i.itemType !== itemType);
      items.unshift(viewedItem);
      items = items.slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
      setRecentlyViewedItems(items);
      navigate(`/${itemType}/${item._id}`);
    } catch (error) { console.error('Failed to save to recently viewed:', error); }
  };

  const updateRecentlyViewedLike = (itemId, isLiked) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.map(item => item._id === itemId ? { ...item, isLiked } : item);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setRecentlyViewedItems(items);
        if (isLiked) {
          const likedItem = items.find(item => item._id === itemId);
          if (likedItem) aiEngine.current.updatePreferences(likedItem, 'like');
        }
      }
    } catch (error) { console.error('Failed to update like status:', error); }
  };

  const generateAIRecommendations = (properties, services, helpers, events) => {
    const allItems = [
      ...properties.map(p => ({ ...p, routeType: 'listing' })),
      ...services.map(s => ({ ...s, routeType: 'service' })),
      ...helpers.map(h => ({ ...h, routeType: 'helper' })),
      ...events.map(e => ({ ...e, routeType: 'event' }))
    ].filter(Boolean);
    return aiEngine.current.generatePersonalizedRecommendations(allItems, {
      recentSearch: location.search
    });
  };

  const { coords, city, error: geoError, loading: geoLoading, requestLocation } = useLocationCoords();
  const [locationStatus, setLocationStatus] = useState(null);

  useEffect(() => {
    const controllers = {
      properties: new AbortController(),
      services: new AbortController(),
      helpers: new AbortController(),
      events: new AbortController(),
      sell: new AbortController()
    };
    const timeoutId = setTimeout(() => {
      Object.values(controllers).forEach(controller => controller.abort());
    }, API_TIMEOUT);

    const fetchHomepageData = async () => {
      let searchCoords = coords || null;
      let detectedCity = city || null;

      if (!coords && !city) {
        try {
          const storedSearches = localStorage.getItem('recentPropertySearches');
          if (storedSearches) {
            const searches = JSON.parse(storedSearches);
            if (searches && searches.length > 0) {
              detectedCity = searches[0];
            }
          }
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }

      if (!detectedCity) {
        detectedCity = "Polokwane";
        if (!searchCoords) searchCoords = { latitude: -23.8962, longitude: 29.4486 }; // POLOKWANE_COORDS
      }

      const fetchPromises = [
        fetch(`/api/listing/get?limit=50&sort=createdAt&order=desc`, {
          signal: controllers.properties.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const localMatches = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.POLOKWANE, detectedCity);
              if (localMatches.length > 0) {
                setFeaturedProperties(localMatches.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'property' })));
                setLocationStatus({
                  title: `Top Properties in ${detectedCity}`,
                  description: "Showing the best properties within your immediate area."
                });
              } else {
                const nearby = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.NEARBY, detectedCity);
                if (nearby.length > 0) {
                  setFeaturedProperties(nearby.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'property' })));
                  setLocationStatus({
                    title: `Properties near ${detectedCity}`,
                    description: "No direct matches in your city, showing nearby neighborhoods."
                  });
                } else {
                  const regional = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.REGIONAL, detectedCity);
                  if (regional.length > 0) {
                    setFeaturedProperties(regional.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'property' })));
                    setLocationStatus({
                      title: "Properties in South Africa",
                      description: "Showing trending properties nationwide."
                    });
                  } else {
                    setFeaturedProperties(data.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'property' })));
                  }
                }
              }
            } else {
              setFeaturedProperties([]);
            }
          })
          .catch(() => { setFeaturedProperties([]); }).finally(() => setLoadingProperties(false)),

        fetch(`/api/service/get?limit=50&sort=createdAt&order=desc`, {
          signal: controllers.services.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              if (sorted.length > 0) {
                setFeaturedServices(sorted.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'service' })));
              } else {
                setFeaturedServices(data.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'service' })));
              }
            } else {
              setFeaturedServices([]);
            }
          })
          .catch(() => { setFeaturedServices([]); }).finally(() => setLoadingServices(false)),

        fetch(`/api/helper/get?limit=50&sort=createdAt&order=desc`, {
          signal: controllers.helpers.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              if (sorted.length > 0) {
                setFeaturedHelpers(sorted.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'helper' })));
              } else {
                setFeaturedHelpers(data.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'helper' })));
              }
            } else {
              setFeaturedHelpers([]);
            }
          })
          .catch(() => { setFeaturedHelpers([]); }).finally(() => setLoadingHelpers(false)),

        fetch(`/api/event/get?limit=50&sort=date&order=asc`, {
          signal: controllers.events.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              if (sorted.length > 0) {
                setFeaturedEvents(sorted.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'event' })));
              } else {
                setFeaturedEvents(data.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'event' })));
              }
            } else {
              setFeaturedEvents([]);
            }
          })
          .catch(() => { setFeaturedEvents([]); }).finally(() => setLoadingEvents(false)),

        fetch(`/api/sell?limit=50`, {
          signal: controllers.sell.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            const list = Array.isArray(data) ? data : (data?.data || []);
            if (list?.length > 0) {
              setFeaturedSellItems(list.slice(0, DATA_FETCH_LIMIT).map(i => ({
                ...i,
                itemType: 'selling',
                name: i.title || i.name,
                regularPrice: i.price || i.regularPrice
              })));
            } else {
              setFeaturedSellItems([]);
            }
          })
          .catch(() => { setFeaturedSellItems([]); }).finally(() => setLoadingSellItems(false))
      ];

      try {
        await Promise.all(fetchPromises);
        clearTimeout(timeoutId);
      } catch (err) {
        // Ignored or logged (aborted fetches will fail)
      }
    };

    if (!geoLoading) {
      fetchHomepageData();
    }

    return () => {
      clearTimeout(timeoutId);
      Object.values(controllers).forEach(controller => controller.abort());
    };
  }, [coords, city, geoLoading]);

  const recentlyAddedItems = useMemo(() => {
    const combined = [
      ...(featuredProperties || []).map(p => ({ ...p, itemType: 'listing' })),
      ...(featuredServices || []).map(s => ({ ...s, itemType: 'service' })),
      ...(featuredHelpers || []).map(h => ({ ...h, itemType: 'helper' })),
      ...(featuredEvents || []).map(e => ({ ...e, itemType: 'event' })),
      ...(featuredSellItems || []).map(item => ({
        ...item,
        itemType: 'selling',
        name: item.title || item.name,
        regularPrice: item.price || item.regularPrice
      }))
    ];
    return combined
      .filter(item => item && (item.createdAt || item._id))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems]);

  useEffect(() => {
    if (featuredProperties && featuredServices && featuredHelpers && featuredEvents) {
      const aiResults = generateAIRecommendations(featuredProperties, featuredServices, featuredHelpers, featuredEvents);
      setAiRecommendations(aiResults.recommendations || []);
      setAiInsights(aiResults.insights || []);
    }
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents]);

  return (
    <MobileAppHomepage
      featuredProperties={featuredProperties}
      featuredServices={featuredServices}
      featuredHelpers={featuredHelpers}
      featuredEvents={featuredEvents}
      featuredSellItems={featuredSellItems}
      loadingProperties={loadingProperties}
      loadingServices={loadingServices}
      loadingHelpers={loadingHelpers}
      loadingEvents={loadingEvents}
      loadingSellItems={loadingSellItems}
      stats={stats}
      onItemClick={addToRecentlyViewed}
      recentlyViewedItems={recentlyViewedItems}
      recentlyAddedItems={recentlyAddedItems}
      onRecentlyViewedLike={updateRecentlyViewedLike}
      currentLocation={currentLocation}
      navigate={navigate}
      aiRecommendations={aiRecommendations}
      aiInsights={aiInsights}
      aiTrendData={null}
      onAISuggestionClick={(suggestion) => { navigate(`/search?searchTerm=${encodeURIComponent(suggestion)}&type=all&ai=1`); }}
      locationStatus={locationStatus}
      requestCount={requestCount}
      geoCity={city}
      geoLoading={geoLoading}
      geoError={geoError}
      onRequestLocation={requestLocation}
      currentUser={currentUser}
    />
  );
};

export default Home;
