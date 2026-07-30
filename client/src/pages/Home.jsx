import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  MapIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  UserIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
  Bars3Icon,
  ScissorsIcon,
  TruckIcon,
  AcademicCapIcon,
  WrenchIcon,
  FireIcon,
  MapPinIcon,
  CheckCircleIcon,
  HomeModernIcon,
  IdentificationIcon,
  KeyIcon,
  PencilIcon,
  TicketIcon,
  InboxIcon,
  BellIcon,
  ShoppingBagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChatBubbleLeftEllipsisIcon,
  PhoneIcon,
  ArrowRightIcon,
  TagIcon
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
  FaGooglePlay
} from 'react-icons/fa';
import ImageGallery from '../components/ImageGallery';
import useLocationCoords from '../hooks/useGeolocation';
import LoopOutPulse from '../components/LoopOutPulse';
import { useWishlist } from '../hooks/useWishlist';
import MyBookingsConsumer from '../components/MyBookingsConsumer';
import LookingForItem from '../components/LookingForItem';
import HelperItem from '../components/HelperItem';


import { 
  NeuralPicksSection, 
  SellItemsSection, 
  SmartRecommendations, 
  ServicesToYourDoor, 
  WeeklySpecialsSection,
  UpcomingBookingsSection
} from '../components/home/HomeSections';
import DailyLoopHub from '../components/home/DailyLoopHub';
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
const DATA_FETCH_LIMIT = 8;
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

const MOCK_PROPERTIES = [
  { _id: '663ad8e5f1e249b49f986025', itemType: 'property', name: 'Elite Modern Apartment', price: 2500, regularPrice: 2500, type: 'rent-long', imageUrls: ['https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.9, comments: [1, 2, 3, 4], bookingsCount: 12, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986026', itemType: 'property', name: 'Grand Presidential Hotel', price: 3500, regularPrice: 3500, type: 'sale', imageUrls: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.8, comments: [1, 2], bookingsCount: 45, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986027', itemType: 'property', name: 'Neural Guest House', price: 1200, regularPrice: 1200, type: 'rent-short', imageUrls: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.7, address: 'Polokwane', comments: [1, 2, 3], bookingsCount: 8, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986028', itemType: 'property', name: 'Roadside Oasis Motel', price: 800, regularPrice: 800, type: 'rent-short', imageUrls: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.3, address: 'Bloemfontein', comments: [1], bookingsCount: 5, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986029', itemType: 'property', name: 'University Studio Pro', price: 1200, regularPrice: 1200, type: 'rent-short', imageUrls: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.6, address: 'Pretoria', comments: [1, 2, 3, 4, 5], bookingsCount: 15, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986030', itemType: 'property', name: 'Quantum Office Suite', price: 500, regularPrice: 500, type: 'office', imageUrls: ['https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.6, address: 'Polokwane', comments: [1], bookingsCount: 22, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986031', itemType: 'property', name: 'Suburban Family Mansion', price: 3500, regularPrice: 3500, type: 'rent-long', imageUrls: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.7, address: 'Durban', comments: [1, 2], bookingsCount: 4, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986032', itemType: 'property', name: 'Azure Beachfront Villa', price: 1800, regularPrice: 1800, type: 'rent-short', imageUrls: ['https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.9, address: 'Port Elizabeth', comments: [1, 2, 3, 4, 5, 6], bookingsCount: 31, createdAt: new Date().toISOString() }
];

const MOCK_SERVICES = [
  { _id: '663ad8e5f1e249b49f986033', itemType: 'service', name: 'Professional Cleaning Service', price: 200, regularPrice: 200, description: 'Deep cleaning service for your home or office', imageUrls: ['https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.7, comments: [1, 2], createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986034', itemType: 'service', name: 'Moving & Relocation Assistance', price: 350, regularPrice: 350, description: 'Help with packing and moving to your new home', imageUrls: ['https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.8, comments: [1], createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986035', itemType: 'service', name: 'Landscaping & Garden Design', price: 450, regularPrice: 450, description: 'Garden maintenance and landscape design services', imageUrls: ['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.6, comments: [1, 2, 3], createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986036', itemType: 'service', name: 'Home Repair & Maintenance', price: 300, regularPrice: 300, description: 'Professional home repair and maintenance services', imageUrls: ['https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.9, comments: [1, 2, 3, 4], createdAt: new Date().toISOString() }
];

const MOCK_HELPERS = [
  { _id: '69a6a956f0c40835a3119612', itemType: 'helper', name: 'John\'s Sneaker Care', type: 'sneaker', rating: 4.8, regularPrice: 250, imageUrls: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'], address: 'Johannesburg', host: 'John Smith', description: 'Professional sneaker cleaning and restoration services using premium products.', travelFee: 50, comments: [1, 2, 3], createdAt: new Date().toISOString() },
  { _id: '69a6a956f0c40835a3119613', itemType: 'helper', name: 'Jane Smith', type: 'Elderly Caregiver', rating: 4.9, regularPrice: 150, imageUrls: ['https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800'], address: 'Cape Town', host: 'Jane Smith', description: 'Experienced caregiver providing compassionate care for elderly individuals.', travelFee: 30, comments: [1, 2], createdAt: new Date().toISOString() },
  { _id: '69a6a956f0c40835a3119614', itemType: 'helper', name: 'Mike Johnson', type: 'barber', rating: 4.7, regularPrice: 200, imageUrls: ['https://images.pexels.com/photos/3993311/pexels-photo-3993311.jpeg?auto=compress&cs=tinysrgb&w=800'], address: 'Durban', host: 'Mike Johnson', description: 'Professional barber with 10+ years of experience in modern and classic cuts.', travelFee: 40, comments: [1], createdAt: new Date().toISOString() }
];

const MOCK_EVENTS = [
  { _id: '663ad8e5f1e249b49f986040', itemType: 'event', name: 'Local Music Festival 2024', price: 50, regularPrice: 50, date: '2024-03-15', address: 'City Park, Johannesburg', attendingCount: 120, imageUrls: ['https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.8, comments: [1, 2, 3, 4, 5], createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986041', itemType: 'event', name: 'Art & Craft Workshop', price: 30, regularPrice: 30, date: '2024-03-20', address: 'Art Center, Cape Town', attendingCount: 45, imageUrls: ['https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.6, comments: [1, 2], createdAt: new Date().toISOString() }
];

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

// RecentlyAddedCard is now a thin wrapper around AirbnbCard for consistency
const RecentlyAddedCard = ({ item, onClick, type = 'property' }) => {
  return (
    <AirbnbCard
      item={item}
      type={type}
      onClick={onClick ? () => onClick() : undefined}
      reducedSize
      showOwner={false}
    />
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

const CommunityNeedsSection = ({ navigate }) => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const fetchNeeds = async () => {
    try {
      const res = await fetch('/api/looking-for/get?limit=6');
      if (res.ok) {
        const data = await res.json();
        setNeeds(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  const handleInteraction = async (id, type) => {
    if (!currentUser) return navigate('/sign-in');
    
    // Optimistic UI update
    setNeeds(prevNeeds => prevNeeds.map(need => {
      if (need._id === id) {
        let { likes = [], dislikes = [] } = need;
        const userId = currentUser._id;
        
        if (type === 'like') {
          if (likes.includes(userId)) {
            likes = likes.filter(uid => uid !== userId);
          } else {
            likes = [...likes, userId];
            dislikes = dislikes.filter(uid => uid !== userId);
          }
        } else if (type === 'dislike') {
          if (dislikes.includes(userId)) {
            dislikes = dislikes.filter(uid => uid !== userId);
          } else {
            dislikes = [...dislikes, userId];
            likes = likes.filter(uid => uid !== userId);
          }
        }
        return { ...need, likes, dislikes };
      }
      return need;
    }));

    try {
      const res = await fetch(`/api/looking-for/${type}/${id}`, {
        method: 'POST',
      });
      if (!res.ok) {
        fetchNeeds(); // revert on fail
      }
    } catch (err) {
      console.error(err);
      fetchNeeds(); // revert on fail
    }
  };

  if (loading || needs.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="mb-20 mt-10 relative"
    >
      {/* Cinematic Orbital Backdrop */}


      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black text-rose-500 tracking-[0.3em] uppercase">Intelligence Feed</span>
          </div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tighter leading-none">
            COMMUNITY <br />
            <span className="text-gray-400">PULSE</span>
          </h2>
        </div>
        <button
          onClick={() => navigate('/looking-for')}
          className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-500/10 hover:border-rose-500 transition-all pb-1 flex items-center gap-2"
        >
          <span>Sync All Signals</span>
          <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative -mx-8 px-8 ">
        <Swiper
          modules={[FreeMode]}
          freeMode={true}
          slidesPerView={'auto'}
          spaceBetween={16}
          observer={true}
          observeParents={true}
          className="community-feed-swiper !overflow-visible"
          breakpoints={{
            320: { slidesPerView: 2.1, spaceBetween: 12 },
            640: { slidesPerView: 2.2, spaceBetween: 16 },
            1024: { slidesPerView: 3.2, spaceBetween: 20 },
            1280: { slidesPerView: 4, spaceBetween: 24 }
          }}
        >
          {needs.map((need, idx) => (
            <SwiperSlide key={need._id} className="h-full">
              <motion.div
                variants={itemVariants}
                custom={idx}
                className="h-full"
              >
                <StatusCard
                  request={need}
                  currentUser={currentUser}
                  onLike={(id) => handleInteraction(id, 'like')}
                  onDislike={(id) => handleInteraction(id, 'dislike')}
                  navigate={navigate}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.section>
  );
};

const MobileAppHomepage = ({
  featuredProperties, featuredServices, featuredHelpers, featuredEvents,
  loadingProperties, loadingServices, loadingHelpers, loadingEvents,
  stats, onItemClick, recentlyViewedItems, onRecentlyViewedLike,
  currentLocation = 'South Africa', navigate, aiRecommendations, aiInsights, aiTrendData, onAISuggestionClick,
  recentlyAddedItems, locationStatus, requestCount = 0
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Homes');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [activeFeaturedTab, setActiveFeaturedTab] = useState('Properties');
  const [bannerLocationIndex, setBannerLocationIndex] = useState(0);

  const bannerLocations = [
    "SOWETO", "ALEXANDRA", "GAUTENG", "CAPE TOWN", "PRETORIA", "DURBAN", "KZN", "LIMPOPO", "POLOKWANE"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerLocationIndex((prev) => (prev + 1) % bannerLocations.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const [activeTab, setActiveTab] = useState('Universe');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab]);

  const tabs = [
    { id: 'Universe', iconType: 'Universe' },
    { id: 'Properties', iconType: 'Homes' },
    { id: 'Services', iconType: 'Services' },
    { id: 'Helper', iconType: 'Helper' },
    { id: 'Events', iconType: 'Events' }
  ];

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'Properties': return featuredProperties;
      case 'Services': return featuredServices;
      case 'Helper': return featuredHelpers;
      case 'Events': return featuredEvents;
      default: {
        // Universe Tab: Prioritize AI recommendations if available
        if (aiRecommendations && aiRecommendations.recommendations?.length > 0) {
          return aiRecommendations.recommendations;
        }
        
        // Fallback: Smartly combine all types for a diverse discovery feed
        const universeItems = [
          ...featuredProperties.slice(0, 10),
          ...featuredServices.slice(0, 8),
          ...featuredHelpers.slice(0, 8),
          ...featuredEvents.slice(0, 6)
        ];
        
        // Shuffle or sort by something meaningful (e.g. rating)
        return universeItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }
  };

  const getTabColor = (id) => {
    switch (id) {
      case 'Properties': return 'bg-rose-500';
      case 'Services': return 'bg-amber-500';
      case 'Helper': return 'bg-blue-500';
      case 'Events': return 'bg-purple-500';
      default: return 'bg-gray-950';
    }
  };



  if (isDesktop) {
    return (
      <DesktopHomepage
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiInsights={aiInsights}
        showAIInsights={showAIInsights}
        setShowAIInsights={setShowAIInsights}
        getFilteredItems={getFilteredItems}
        navigate={navigate}
        isBookingsOpen={isBookingsOpen}
        setIsBookingsOpen={setIsBookingsOpen}
        requestCount={requestCount}
      />
    );
  }

  // Mobile View
  return (
    <div className="min-h-screen bg-white pb-32 relative overflow-x-clip w-full">
      <Helmet>
        <title>LoopOut | Find Homes, Services & Events Near You</title>
        <meta name="description" content="Discover verified helpers, book top services, and explore exclusive properties and events in your area with loopOut." />
      </Helmet>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      <main className="px-4 pt-2 pb-4 lg:max-w-7xl lg:mx-auto w-full">
        <DailyLoopHub />
        {/* Mobile Elite Slider Banner */}
        <div className="relative h-[560px] -mx-4 lg:mx-0 lg:rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 6500, disableOnInteraction: false }}
            pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-rose-500 !opacity-100', bulletClass: 'swiper-pagination-bullet !bg-white/50 !opacity-100' }}
            className="h-full w-full mobile-hero-swiper"
          >
            {/* Mobile Slide 1: LoopOut for Everyone */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/explore')}>
                <img loading="lazy"
                  src="/loopout_for_everyone.png"
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  alt="LoopOut for Everyone"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-white/90 text-[9px] font-black tracking-[0.25em] uppercase">Universal Discovery</span>
                    </div>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-[0.85] mb-4 tracking-tighter drop-shadow-lg">
                    LOOPOUT <br />
                    <span className="bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent">FOR EVERYONE.</span>
                  </h2>
                  <p className="text-white/60 text-[13px] font-medium mb-7 leading-relaxed max-w-[260px]">
                    Active in <span className="text-white font-semibold">JHB</span>, <span className="text-white font-semibold">Pretoria</span>, <span className="text-white font-semibold">PMB</span>, and <span className="text-white font-semibold">Rustenburg</span>.
                  </p>
                  <button className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl text-[11px] font-black shadow-2xl shadow-rose-500/40 uppercase tracking-widest active:scale-95 transition-all hover:from-rose-600 hover:to-rose-700">
                    Start Your Journey →
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 2: LoopOut Maid Celebration */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=maid&type=helper')}>
                <img loading="lazy"
                  src="/loopout_maid_celebration.png"
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  alt="LoopOut Maid"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <HeartIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-white/90 text-[9px] font-black tracking-[0.25em] uppercase">Professional Care</span>
                    </div>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-[0.85] mb-4 tracking-tighter drop-shadow-lg">
                    THE PERFECT <br />
                    <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">WORK.</span>
                  </h2>
                  <p className="text-white/60 text-[13px] font-medium mb-7 leading-relaxed max-w-[260px]">
                    Celebrating the bond between <span className="text-white font-semibold">families</span> and their <span className="text-white font-semibold">trusted helpers</span>.
                  </p>
                  <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-[11px] font-black shadow-2xl uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-50">
                    Find Your Maid →
                  </button>
                </div>
              </div>
            </SwiperSlide>
            {/* Mobile Slide 3: LoopOut Removal & Delivery */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=delivery&type=services')}>
                <img loading="lazy"
                  src="/loopout_removal_delivery.png"
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  alt="LoopOut Delivery"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <TruckIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-white/90 text-[9px] font-black tracking-[0.25em] uppercase">Elite Logistics</span>
                    </div>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-[0.85] mb-4 tracking-tighter drop-shadow-lg">
                    REMOVAL & <br />
                    <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">DELIVERY.</span>
                  </h2>
                  <p className="text-white/60 text-[13px] font-medium mb-7 leading-relaxed max-w-[260px]">
                    Professional removal and delivery services for your home and business.
                  </p>
                  <button className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl text-[11px] font-black shadow-2xl shadow-rose-500/40 uppercase tracking-widest active:scale-95 transition-all">
                    Book Delivery →
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 4: LoopOut Barber Campaign */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=barber&type=services')}>
                <img loading="lazy"
                  src="/barber_loopout_campaign.png"
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  alt="LoopOut Barber"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <ScissorsIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-white/90 text-[9px] font-black tracking-[0.25em] uppercase">Professional Grooming</span>
                    </div>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-[0.85] mb-4 tracking-tighter drop-shadow-lg">
                    LOOPOUT <br />
                    <span className="bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent">BARBER.</span>
                  </h2>
                  <p className="text-white/60 text-[13px] font-medium mb-7 leading-relaxed max-w-[260px]">
                    Experience luxury from the moment you sit down. <span className="text-white font-semibold">Draped in excellence.</span>
                  </p>
                  <button className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl text-[11px] font-black shadow-2xl shadow-rose-500/40 uppercase tracking-widest active:scale-95 transition-all">
                    Book a Barber →
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 5: LoopOut Soweto Bedroom Campaign */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=guesthouse&type=properties')}>
                <img loading="lazy"
                  src="/soweto_bg.png"
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  alt="loopOut Soweto Stay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <HomeModernIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-white/90 text-[9px] font-black tracking-[0.25em] uppercase">Soweto Bedroom</span>
                    </div>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-[0.85] mb-4 tracking-tighter drop-shadow-lg">
                    loopOut <br />
                    <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">SOWETO.</span>
                  </h2>
                  <p className="text-white/60 text-[13px] font-medium mb-7 leading-relaxed max-w-[260px]">
                    Boutique guest houses like Twin Beez. <span className="text-white font-semibold">Rest in luxury with co-branded pillows.</span>
                  </p>
                  <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl text-[11px] font-black shadow-2xl shadow-amber-500/30 uppercase tracking-widest active:scale-95 transition-all">
                    Book Soweto Stay →
                  </button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* NEURAL PICKS SECTION - Alpha Algorithm (Mobile) */}
        <div className="mb-12">
          <NeuralPicksSection navigate={navigate} />
        </div>


        {/* UPCOMING BOOKINGS */}
        <UpcomingBookingsSection navigate={navigate} />

        {/* Mobile Location Status Indicator */}
        {locationStatus && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-md" />
              <div className="relative w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
                <MapPinIcon className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-slate-900 text-sm leading-tight truncate">{locationStatus.title}</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">{locationStatus.description}</p>
            </div>
            <div className="ml-auto shrink-0">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}





        {recentlyAddedItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="font-black text-sm text-gray-900 uppercase tracking-widest">Recently Added</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{recentlyAddedItems.length} new</span>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-6 lg:mx-0 lg:px-0 scrollbar-hide snap-x">
              {recentlyAddedItems.slice(0, 5).map((item) => (
                <div key={item._id} className="flex-shrink-0 w-44 md:w-52 snap-start">
                  <RecentlyAddedCard
                    item={item}
                    type={item.itemType === 'listing' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : item.itemType}
                    onClick={() => onItemClick(item, item.itemType)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}



        {/* MOBILE CONSOLIDATED FEED */}
        <section id="explore-section" className="mt-10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-xl text-gray-950 tracking-tighter leading-none">Explore <span className="text-rose-500">{activeTab === 'Universe' ? 'All' : activeTab}</span></h2>
              
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">Live · {getFilteredItems().length}</span>
            </div>
          </div>
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl pt-3 flex overflow-x-auto gap-3 pb-3 mb-8 scrollbar-hide -mx-4 px-6 lg:mx-0 lg:px-0 border-b border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.94 }}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-full transition-all duration-300 shrink-0 ${
                    isActive 
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/20' 
                      : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  <div className="flex-shrink-0 filter drop-shadow-sm">
                    <CategoryIcon type={tab.iconType} size={isActive ? "w-5 h-5" : "w-5 h-5"} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${ isActive ? 'text-white' : 'text-slate-600'}`}>
                    {tab.id}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {getFilteredItems().slice(0, visibleCount).map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <AirbnbCard
                  item={item}
                  type={activeTab === 'Universe' ? (item.itemType || 'property') : activeTab === 'Helper' ? 'helper' : activeTab === 'Properties' ? 'property' : activeTab.slice(0, -1).toLowerCase()}
                  onClick={(path) => navigate(path)}
                />
              </motion.div>
            ))} 
          </div>

          {visibleCount < getFilteredItems().length ? (
            <button 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="w-full mt-12 py-5 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              Load More {activeTab}
            </button>
          ) : (
            <div className="flex justify-center mt-16 mb-12">
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

        {/* Mobile Community Highlights */}
        <div className="mb-10 -mx-4 lg:mx-0">
          <LoopOutPulse />
        </div>



        {/* Sell Items Section - moved to bottom of mobile feed */}
        <SellItemsSection navigate={navigate} />

        {/* Catchy & Modern End of Feed — CaughtUpHub */}
        <CaughtUpHub stats={stats} navigate={navigate} />

      </main>

      {/* Floating Track Requests Button - Mobile */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsBookingsOpen(true)}
        className=" fixed bottom-24 right-4 z-[100] cursor-pointer "
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-300 shadow-xl" />
        <div className="relative bg-white text-gray-900 p-4 rounded-full shadow-2xl flex items-center justify-center border border-gray-100">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          {/* Tooltip moved above the button to avoid side-overlapping on mobile */}
          <div className="absolute bottom-full right-0 mb-4 bg-gray-900 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
            Track your requests <span>🚚</span>
          </div>
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
};

// --- Airbnb-Style Desktop Homepage ---
const DesktopHomepage = ({
  tabs,
  activeTab,
  setActiveTab,
  aiInsights,
  showAIInsights,
  setShowAIInsights,
  getFilteredItems,
  navigate,
  isBookingsOpen,
  setIsBookingsOpen,
  requestCount
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>LoopOut | Premium Marketplace for Properties, Services, and Events</title>
        <meta name="description" content="Discover verified helpers, book top services, and explore exclusive properties and events in your area with loopOut." />
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
      <div className="sticky top-0 z-40 bg-white/98 backdrop-blur-2xl py-3 border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                      : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                    <CategoryIcon type={tab.iconType} size="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {tab.id}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Premium Filter Button */}
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-full hover:border-slate-900 hover:bg-slate-50 transition-all font-black uppercase text-[9px] tracking-widest text-slate-600 bg-white shadow-sm hover:shadow-md active:scale-95"
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Clean Feed Grid */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        <DailyLoopHub />
        {/* AI Insights & Recommendations (Subtle & elegant, not busy) */}
        {showAIInsights && aiInsights && aiInsights.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-rose-50 to-amber-50 p-5 rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">AI Pulse Insights</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  {aiInsights[0]?.icon || '✨'} {aiInsights[0]?.text || aiInsights[0]}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowAIInsights(false)} 
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-md relative z-10 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Removed Discovery Hub as per User Request */}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none">
              <span className="text-slate-900">Explore </span>
              <span className="bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">{activeTab === 'Universe' ? 'Top Discoveries' : activeTab}</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-[0.2em]">Curated &middot; South Africa &amp; Beyond</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              Live &middot; {getFilteredItems().length}
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
                  type={activeTab === 'Universe' ? (item.itemType || 'property') : activeTab === 'Helper' ? 'helper' : activeTab === 'Properties' ? 'property' : activeTab.slice(0, -1).toLowerCase()}
                  onClick={(path) => navigate(path)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-36 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-60" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl flex items-center justify-center border border-slate-200 shadow-sm">
                <Sparkles className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Nothing here yet</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">Try switching categories or expanding your search to find what you're looking for.</p>
            <button
              onClick={() => navigate('/search')}
              className="mt-8 px-7 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-300 shadow-lg active:scale-95"
            >Browse All Listings</button>
          </div>
        )}

        {/* Neural Picks */}
        <div className="mt-20">
          <NeuralPicksSection navigate={navigate} />
        </div>

        {/* Sell Items Section (Desktop) */}
        <SellItemsSection navigate={navigate} />

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
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              {requestCount}
            </span>
          )}
        </div>
      </motion.div>

      {/* Bookings Modal */}
      <MyBookingsConsumer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
    </div>
  );
};

// --- Main Component ---
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiEngine = useRef(new AIRecommendationEngine());
  const { currentUser } = useSelector((state) => state.user);

  const [featuredProperties, setFeaturedProperties] = useState(MOCK_PROPERTIES);
  const [featuredServices, setFeaturedServices] = useState(MOCK_SERVICES);
  const [featuredHelpers, setFeaturedHelpers] = useState(MOCK_HELPERS);
  const [featuredEvents, setFeaturedEvents] = useState(MOCK_EVENTS);

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingHelpers, setLoadingHelpers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [stats, setStats] = useState({ properties: 1234, services: 456, helpers: 789, events: 321 });
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('South Africa');
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const fetchBookingCount = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await fetch(`/api/bookings/user/${currentUser._id}`);
        if (res.ok) {
          const data = await res.json();
          const activeBookings = data.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'declined');
          setRequestCount(activeBookings.length);
        }
      } catch (error) {
        console.error('Failed to fetch booking count:', error);
      }
    };
    fetchBookingCount();
    const interval = setInterval(fetchBookingCount, 60000);
    return () => clearInterval(interval);
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

  const { coords, city, error: geoError, loading: geoLoading } = useLocationCoords();
  const [locationStatus, setLocationStatus] = useState(null);

  useEffect(() => {
    const controllers = {
      properties: new AbortController(),
      services: new AbortController(),
      helpers: new AbortController(),
      events: new AbortController()
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
                      description: "No local matches found, showing trending properties nationwide."
                    });
                  } else {
                    // Fallback to MOCK_PROPERTIES if live data returns empty regional matches
                    setFeaturedProperties(MOCK_PROPERTIES);
                  }
                }
              }
            }
          })
          .catch(() => { }).finally(() => setLoadingProperties(false)),

        fetch(`/api/service/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.services.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              if (sorted.length > 0) {
                setFeaturedServices(sorted.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'service' })));
              } else {
                setFeaturedServices(MOCK_SERVICES);
              }
            } else {
              setFeaturedServices(MOCK_SERVICES);
            }
          })
          .catch(() => { }).finally(() => setLoadingServices(false)),

        fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.helpers.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              if (sorted.length > 0) {
                setFeaturedHelpers(sorted.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'helper' })));
              } else {
                setFeaturedHelpers(MOCK_HELPERS);
              }
            } else {
              setFeaturedHelpers(MOCK_HELPERS);
            }
          })
          .catch(() => { }).finally(() => setLoadingHelpers(false)),

        fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc`, {
          signal: controllers.events.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => {
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              if (sorted.length > 0) {
                setFeaturedEvents(sorted.slice(0, DATA_FETCH_LIMIT).map(i => ({ ...i, itemType: 'event' })));
              } else {
                setFeaturedEvents(MOCK_EVENTS);
              }
            } else {
              setFeaturedEvents(MOCK_EVENTS);
            }
          })
          .catch(() => { }).finally(() => setLoadingEvents(false))
      ];

      try {
        await Promise.all(fetchPromises);
        clearTimeout(timeoutId);
        setStats({ properties: 1234, services: 456, helpers: 789, events: 321 });
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
      ...(featuredEvents || []).map(e => ({ ...e, itemType: 'event' }))
    ];
    return combined
      .filter(item => item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents]);

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
      loadingProperties={loadingProperties}
      loadingServices={loadingServices}
      loadingHelpers={loadingHelpers}
      loadingEvents={loadingEvents}
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
    />
  );
};

export default Home;
