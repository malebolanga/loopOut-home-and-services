import React, { useEffect, useState, useRef, useCallback, useMemo, cloneElement } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRightIcon
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
import BottomNav from '../components/BottomNav';
import useSearchIntelligence from '../hooks/useSearchIntelligence';
import HelperItem from '../components/HelperItem';
import LoopOutBanner from '../components/LoopOutBanner';

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
const API_TIMEOUT = 3000;

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

const CategoryIcon = ({ type, size = "w-10 h-10" }) => {
  const icons = {
    Universe: (
      <svg viewBox="0 0 100 100" className={`${size} drop-shadow-[0_15px_15px_rgba(79,70,229,0.4)]`}>
        <defs>
          <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#312E81" />
          </radialGradient>
          <radialGradient id="nebulaGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
          <filter id="glassBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#sphereGrad)" />
        <circle cx="50" cy="50" r="30" fill="url(#nebulaGrad)" filter="url(#glassBlur)" className="animate-pulse" />
        <path d="M20 50 Q50 20 80 50" fill="none" stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="4 2" />
        <circle cx="40" cy="40" r="2" fill="white" className="animate-ping" />
        <circle cx="60" cy="30" r="1.5" fill="white" opacity="0.8" />
        <circle cx="30" cy="65" r="1" fill="white" opacity="0.6" />
        <path d="M50 5 A45 45 0 0 1 95 50" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
      </svg>
    ),
    Homes: (
      <svg viewBox="0 0 100 100" className={`${size} drop-shadow-[0_15px_15px_rgba(239,68,68,0.3)]`}>
        <defs>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEE2E2" />
            <stop offset="100%" stopColor="#FECACA" />
          </linearGradient>
        </defs>
        <path d="M15 45 L50 15 L85 45 L85 85 L15 85 Z" fill="url(#wallGrad)" />
        <path d="M10 45 L50 10 L90 45 L50 55 Z" fill="url(#roofGrad)" />
        <path d="M50 10 L90 45 L50 55 L10 45 Z" fill="black" opacity="0.1" />
        <rect x="35" y="60" width="30" height="25" fill="#991B1B" rx="2" />
        <rect x="25" y="50" width="15" height="15" fill="white" rx="2" opacity="0.8" />
        <rect x="60" y="50" width="15" height="15" fill="white" rx="2" opacity="0.8" />
        <circle cx="30" cy="30" r="20" fill="white" opacity="0.2" />
      </svg>
    ),
    Services: (
      <svg viewBox="0 0 100 100" className={`${size} drop-shadow-[0_15px_15px_rgba(59,130,246,0.3)]`}>
        <defs>
          <linearGradient id="caseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
        <rect x="15" y="30" width="70" height="55" rx="8" fill="url(#caseGrad)" />
        <path d="M35 30 L35 20 Q35 15 40 15 L60 15 Q65 15 65 20 L65 30" fill="none" stroke="url(#handleGrad)" strokeWidth="6" />
        <rect x="15" y="30" width="70" height="15" rx="8" fill="black" opacity="0.1" />
        <circle cx="30" cy="55" r="5" fill="white" opacity="0.3" />
        <circle cx="70" cy="55" r="5" fill="white" opacity="0.3" />
        <rect x="45" y="45" width="10" height="25" rx="2" fill="white" opacity="0.2" />
      </svg>
    ),
    Helper: (
      <svg viewBox="0 0 100 100" className={`${size} drop-shadow-[0_15px_15px_rgba(16,185,129,0.3)]`}>
        <defs>
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <radialGradient id="highlight" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="35" r="25" fill="url(#headGrad)" />
        <circle cx="50" cy="35" r="25" fill="url(#highlight)" />
        <path d="M20 90 C20 60 80 60 80 90" fill="url(#headGrad)" />
        <path d="M20 90 C20 65 80 65 80 90" fill="url(#highlight)" />
        <circle cx="40" cy="30" r="3" fill="white" opacity="0.6" />
        <circle cx="60" cy="30" r="3" fill="white" opacity="0.6" />
        <path d="M40 45 Q50 55 60 45" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
    Events: (
      <svg viewBox="0 0 100 100" className={`${size} drop-shadow-[0_15px_15px_rgba(245,158,11,0.3)]`}>
        <defs>
          <linearGradient id="ticketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <rect x="15" y="30" width="70" height="45" rx="4" fill="url(#ticketGrad)" transform="rotate(-10 50 50)" />
        <path d="M15 52.5 A5 5 0 0 1 15 42.5 M85 42.5 A5 5 0 0 1 85 52.5" fill="white" transform="rotate(-10 50 50)" />
        <text x="50" y="55" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#92400E" textAnchor="middle" transform="rotate(-10 50 50)">PASS</text>
        <circle cx="30" cy="40" r="15" fill="white" opacity="0.2" />
      </svg>
    )
  };
  return icons[type] || null;
};

// --- TOP CATEGORIES DATA (Fresha Style) ---
const TOP_CATEGORIES = [
  {
    id: 'beauty',
    name: 'Beauty',
    image: 'https://images.pexels.com/photos/3319333/pexels-photo-3319333.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '3,210',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'maid',
    name: 'Maid',
    image: '/loopout_maid_celebration_banner_1778961389258.png',
    count: '1,890',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    image: 'https://images.pexels.com/photos/4098911/pexels-photo-4098911.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '2,145',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'barber',
    name: 'Barbershop',
    image: '/3d_barber_icon_1775252950749.png',
    count: '1,234',
    color: 'from-gray-900 to-gray-700',
    emoji: '💈'
  },
  {
    id: 'baker',
    name: 'Baker',
    image: 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '856',
    color: 'from-amber-600 to-orange-500',
    emoji: '🥐'
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    image: 'https://images.pexels.com/photos/6873098/pexels-photo-6873098.jpeg',
    count: '23',
    color: 'from-blue-600 to-cyan-500',
    emoji: '🧼'
  },
  {
    id: 'delivery',
    name: 'Delivery',
    image: 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '3,567',
    color: 'from-green-600 to-emerald-500',
    emoji: '📦'
  },
  {
    id: 'usedbooks',
    name: 'Used Books',
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    count: '142',
    color: 'from-orange-600 to-amber-500',
    emoji: '📚'
  },
  {
    id: 'photograph',
    name: 'Photography',
    image: '/3d_helper_icon_1775252697443.png',
    count: '892',
    color: 'from-indigo-600 to-purple-600',
    emoji: '📸'
  },
  {
    id: 'transport',
    name: 'Transport',
    image: 'https://images.pexels.com/photos/1051544/pexels-photo-1051544.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '1,567',
    color: 'from-red-600 to-rose-500',
    emoji: '🚕'
  },
  {
    id: 'domestic',
    name: 'Domestic Work',
    image: '/3d_maid_icon_1775252783278.png',
    count: '1,445',
    color: 'from-pink-600 to-rose-500',
    emoji: '🧹'
  },
  {
    id: 'tutor',
    name: 'Private Tutor',
    image: 'https://images.pexels.com/photos/4050312/pexels-photo-4050312.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '678',
    color: 'from-violet-600 to-purple-500',
    emoji: '📖'
  },
  {
    id: 'rental',
    name: 'Rental',
    image: '/3d_home_icon_1775252451792.png',
    count: '4,321',
    color: 'from-orange-600 to-amber-500',
    emoji: '🏠'
  },
  {
    id: 'guesthouse',
    name: 'Guest House',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '1,234',
    color: 'from-cyan-600 to-blue-500',
    emoji: '🏡'
  },
  {
    id: 'hair',
    name: 'Hair & Style',
    image: 'https://images.pexels.com/photos/3993311/pexels-photo-3993311.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '3,890',
    color: 'from-fuchsia-600 to-pink-500',
    emoji: '💇'
  },
  {
    id: 'nails',
    name: 'Nails',
    image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '2,456',
    color: 'from-rose-400 to-pink-400',
    emoji: '💅'
  },
  {
    id: 'massage',
    name: 'Massage',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '1,678',
    color: 'from-emerald-600 to-teal-500',
    emoji: '💆'
  },
  {
    id: 'tattoo',
    name: 'Tattoo Artist',
    image: 'https://images.pexels.com/photos/2183131/pexels-photo-2183131.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '445',
    color: 'from-slate-800 to-gray-900',
    emoji: '💉'
  },
  {
    id: 'chef',
    name: 'Private Chef',
    image: 'https://images.pexels.com/photos/210661/pexels-photo-210661.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '334',
    color: 'from-orange-500 to-red-500',
    emoji: '👨‍🍳'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    image: 'https://images.pexels.com/photos/1012334/pexels-photo-1012334.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '889',
    color: 'from-green-700 to-emerald-600',
    emoji: '🌳'
  },
  {
    id: 'electrician',
    name: 'Electrician',
    image: '/3d_services_icon_1775252517283.png',
    count: '1,123',
    color: 'from-yellow-500 to-amber-500',
    emoji: '⚡'
  },
  {
    id: 'handyman',
    name: 'Handyman',
    image: '/3d_services_icon_1775252517283.png',
    count: '956',
    color: 'from-blue-700 to-indigo-600',
    emoji: '🛠️'
  },
  {
    id: 'nanny',
    name: 'Nanny',
    image: '/3d_helper_icon_1775252697443.png',
    count: '642',
    color: 'from-rose-400 to-pink-400',
    emoji: '🧸'
  },
  // New helper types
  {
    id: 'sneaker',
    name: 'Sneaker Cleaner',
    image: '/3d_cleaning_icon_1775252731929.png',
    count: '567',
    color: 'from-indigo-600 to-purple-600',
    emoji: '👟'
  },
  {
    id: 'washingmat',
    name: 'Mat Washer',
    image: 'https://images.pexels.com/photos/4597284/pexels-photo-4597284.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '234',
    color: 'from-cyan-600 to-blue-600',
    emoji: '🧺'
  },
  {
    id: 'animals',
    name: 'Animal Care',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '789',
    color: 'from-amber-600 to-orange-500',
    emoji: '🐾'
  },
  {
    id: 'grocery',
    name: 'Grocery Runner',
    image: 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '1,200',
    color: 'from-green-500 to-emerald-500',
    emoji: '🍎'
  },
  {
    id: 'laundry',
    name: 'Laundry',
    image: 'https://images.pexels.com/photos/5591581/pexels-photo-5591581.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '850',
    color: 'from-blue-400 to-cyan-400',
    emoji: '🧼'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Drop',
    image: 'https://images.pexels.com/photos/5910953/pexels-photo-5910953.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '430',
    color: 'from-red-400 to-rose-400',
    emoji: '💊'
  },
  {
    id: 'events',
    name: 'Events',
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '120+',
    color: 'from-indigo-600 to-purple-600',
    emoji: '🎟️'
  },
  {
    id: 'beachfront',
    name: 'Beachfront',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '89',
    color: 'from-blue-400 to-cyan-400',
    emoji: '🏖️'
  },
  {
    id: 'cabin',
    name: 'Log Cabin',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '76',
    color: 'from-orange-800 to-brown-600',
    emoji: '🪵'
  },
  {
    id: 'roommate',
    name: 'Finding Roommate',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '340',
    color: 'from-emerald-500 to-teal-400',
    emoji: '👤'
  },
  {
    id: 'nanny-need',
    name: 'Looking for Nanny',
    image: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '120',
    color: 'from-pink-400 to-rose-400',
    emoji: '🍼'
  },
  {
    id: 'catering',
    name: 'Catering',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '345',
    color: 'from-orange-500 to-amber-500',
    emoji: '🍱'
  },
  {
    id: 'schoolTransport',
    name: 'School Transport',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '234',
    color: 'from-yellow-500 to-orange-400',
    emoji: '🚌'
  },
  {
    id: 'daycare',
    name: 'Daycare Centers',
    image: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '156',
    color: 'from-pink-500 to-rose-400',
    emoji: '🧸'
  },
  {
    id: 'daily',
    name: 'Daily Loop',
    image: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: '890',
    color: 'from-emerald-500 to-green-400',
    emoji: '🔄'
  },
  {
    id: 'trending',
    name: 'Trending',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-red-600 to-orange-500',
    emoji: '🚀'
  }
];

const MOCK_PROPERTIES = [
  { _id: '663ad8e5f1e249b49f986025', itemType: 'property', name: 'Elite Modern Apartment', price: 2500, regularPrice: 2500, type: 'rent-long', imageUrls: ['https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.9, address: 'Johannesburg', comments: [1, 2, 3, 4], bookingsCount: 12, createdAt: new Date().toISOString() },
  { _id: '663ad8e5f1e249b49f986026', itemType: 'property', name: 'Grand Presidential Hotel', price: 3500, regularPrice: 3500, type: 'sale', imageUrls: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], rating: 4.8, address: 'Cape Town', comments: [1, 2], bookingsCount: 45, createdAt: new Date().toISOString() },
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

  const onMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - card.left) / card.width;
    const y = (e.clientY - card.top) / card.height;
    setRotate({ x: (y - 0.5) * 30, y: (x - 0.5) * -30 });
  };

  const onMouseLeave = () => setRotate({ x: 0, y: 0 });

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
            <img
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

const AirbnbCard = ({ item, onClick, type = 'property', hideDistance = false, reducedSize = false }) => {
  const isGuestFavorite = item.rating >= 4.8;
  const wishlistType = type === 'property' ? 'listing' : type;
  const { isFavorite, toggleFavorite } = useWishlist(item, wishlistType);

  const getPriceSuffix = () => {
    if (type !== 'property') return '';
    switch (item.type) {
      case 'rent': return '/ month';
      case 'over': return '/ night';
      case 'sale': return '/ night';
      case 'office': return '/ hour';
      case 'land': return '/ night';
      default: return item.type?.includes('rent') ? '/ month' : '';
    }
  };

  const getCategoryLabel = () => {
    if (type === 'property' || type === 'listing') {
      switch (item.type) {
        case 'rent': return 'Rental';
        case 'rent-long': return 'Rental';
        case 'rent-short': return 'Short Stay';
        case 'sale': return 'Hotel';
        case 'resort': return 'Resort';
        case 'office': return 'Office';
        case 'land': return 'Self Catering';
        case 'guest_house': return 'Guest House';
        default: return 'Property';
      }
    }
    if (type === 'service') return item.category || item.type || 'Service';
    if (type === 'helper') return item.type || item.category || 'Helper';
    if (type === 'event') return 'Event';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatPrice = () => {
    const price = item.price || item.regularPrice;
    if (type === 'property' && (item.type === 'sale' || item.type === 'land')) {
      return `R${price?.toLocaleString()}`;
    }
    return `R${price}`;
  };

  const handleClick = () => {
    if (type === 'property' || type === 'listing') {
      onClick(`/listing/${item._id}`);
    } else if (type === 'service') {
      onClick(`/service/${item._id}`);
    } else if (type === 'helper') {
      onClick(`/helper/${item._id}`);
    } else if (type === 'event') {
      onClick(`/event/${item._id}`);
    } else {
      onClick(item._id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`cursor-pointer flex flex-col ${reducedSize ? 'gap-1.5' : 'gap-2'}`}
    >
      <div className={`relative aspect-[3/2] overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-md ${reducedSize ? 'mb-1' : 'mb-0'}`}>
        <ImageGallery
          imageUrls={item.imageUrls || [item.image] || []}
          alt={item.name}
          type={type === 'property' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : type}
        />

        {/* Bookings Counter Overlay */}
        <div className="absolute top-3 right-3 flex items-center justify-center z-20 pointer-events-auto group/booking hover:-translate-y-1 transition-transform cursor-pointer">
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-white transition-all overflow-hidden flex-nowrap whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-black ml-1 shrink-0">{item.bookingsCount || 0}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] hidden group-hover/booking:inline-block transition-all ml-1 text-slate-200">Bookings</span>
          </div>
        </div>

        <button
          onClick={toggleFavorite}
          className="absolute top-3 left-3 p-2 text-white hover:scale-110 transition-transform z-20 drop-shadow-md"
        >
          {isFavorite ? (
            <HeartIconSolid className={`text-rose-500 fill-rose-500 ${reducedSize ? 'w-5 h-5' : 'w-6 h-6'}`} />
          ) : (
            <HeartIcon className={`stroke-[2px] ${reducedSize ? 'w-5 h-5' : 'w-6 h-6'}`} />
          )}
        </button>

        {isGuestFavorite && type === 'property' && (
          <div className="absolute top-14 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-black/5 z-20">
            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Guest favorite</span>
          </div>
        )}
      </div>

      <div className="flex flex-col pt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className={`font-black text-gray-900 truncate tracking-tight ${reducedSize ? 'text-[13px]' : 'text-[15px]'}`}>
            {item.address?.split(',')[0] || item.name || 'South Africa'}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarIconSolid className="w-3 h-3 text-gray-950" />
            <span className={`font-black text-gray-950 flex flex-nowrap items-center gap-1 ${reducedSize ? 'text-[11px]' : 'text-[13px]'}`}>
              <span>{(item.rating || 0).toFixed(1)}</span>
              <span className="text-gray-500 font-normal">({item.comments?.length || 0})</span>
            </span>
          </div>
        </div>

        <h4 className={`text-gray-400 truncate font-bold uppercase tracking-widest ${reducedSize ? 'text-[8px] mt-0' : 'text-[9px] mt-0.5'}`}>
          {getCategoryLabel()}
        </h4>
        <p className={`text-gray-500 truncate font-semibold ${reducedSize ? 'text-[11px] mt-0' : 'text-[14px] mt-0.5'}`}>
          {item.name}
        </p>

        {(type === 'helper' || type === 'service') && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest opacity-60">
              Provided by {item.userRef?.username || 'Pro'}
            </span>
          </div>
        )}

        {item._distance && item._distance !== Infinity && !hideDistance ? (
          <p className="text-[14px] text-gray-500 mt-0.5">
            {item._distance < 1 ? "Near you" : `${Math.round(item._distance)} km away`}
          </p>
        ) : (
          <div className={reducedSize ? "h-0" : "h-[21px] mt-0.5"}></div>
        )}

        <div className={`${reducedSize ? 'mt-1' : 'mt-2'} flex items-baseline gap-1`}>
          <span className={`font-black text-gray-900 tracking-tight ${reducedSize ? 'text-[14px]' : 'text-[16px]'}`}>{formatPrice()}</span>
          <span className={`text-gray-500 font-bold ${reducedSize ? 'text-[11px]' : 'text-[14px]'}`}>{getPriceSuffix()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const AirbnbCardSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-200/60" />
    <div className="flex flex-col pt-2 gap-2">
      <div className="flex justify-between items-start gap-2">
        <div className="h-4 bg-gray-200/60 rounded-md w-2/3" />
        <div className="h-4 bg-gray-200/60 rounded-md w-8" />
      </div>
      <div className="h-3 bg-gray-200/60 rounded-md w-1/3" />
      <div className="h-3 bg-gray-200/60 rounded-md w-1/4 mt-1" />
      <div className="mt-2 flex items-baseline gap-2">
        <div className="h-5 bg-gray-200/60 rounded-md w-20" />
        <div className="h-4 bg-gray-200/60 rounded-md w-16" />
      </div>
    </div>
  </div>
);

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

// --- FRESHA-STYLE TOP CATEGORIES SECTION ---
const TopCategoriesSection = ({ navigate }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => scrollEl.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    const helpers = ['sneaker', 'washingmat', 'animals', 'domestic', 'tutor', 'maid', 'beauty', 'cleaner', 'nanny', 'barber'];
    const services = ['baker', 'carwash', 'photograph', 'transport', 'tattoo', 'hair', 'nails', 'massage', 'chef', 'landscaping', 'electrician', 'handyman', 'catering', 'schoolTransport', 'daily', 'daycare'];
    const properties = ['rental', 'guesthouse'];
    const needs = ['roommate', 'nanny-need'];

    if (needs.includes(category.id)) {
      navigate('/looking-for');
    } else if (helpers.includes(category.id)) {
      navigate(`/search?category=${category.id}&type=helpers`);
    } else if (services.includes(category.id)) {
      navigate(`/search?category=${category.id}&type=services`);
    } else if (properties.includes(category.id)) {
      navigate(`/search?category=${category.id}&type=properties`);
    } else {
      navigate(`/search?category=${category.id}`);
    }
  };

  return (
    <section className="mb-12 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top categories</h2>
          <p className="text-gray-500 mt-1 text-sm">Discover professionals near you</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className={`p-2 rounded-full border transition-all ${canScrollLeft ? 'border-gray-300 hover:bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-2 rounded-full border transition-all ${canScrollRight ? 'border-gray-300 hover:bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            disabled={!canScrollRight}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TOP_CATEGORIES.map((category, index) => (
          <div key={category.id} className="snap-start shrink-0 w-[160px] sm:w-[180px]">
            <FreshaCategoryCard
              category={category}
              onClick={handleCategoryClick}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

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

const RecentlyAddedCard = ({ item, onClick, type = 'property' }) => {
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
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-sm">
        <ImageGallery
          imageUrls={item.imageUrls || []}
          alt={item.name}
          type={type}
        />
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/30 z-20">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">New Listing</span>
        </div>
        <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/30 z-20">
          <span className="text-[8px] font-black text-white uppercase tracking-widest">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
      </div>

      <div className="flex flex-col pt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-[15px] text-gray-900 truncate">
            {item.address || "South Africa"}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarIconSolid className="w-3.5 h-3.5 text-gray-950" />
            <span className="text-[14px] font-medium text-gray-950 flex items-center gap-1">
              <span>{(item.rating || 0).toFixed(1)}</span>
              <span className="text-gray-500 font-normal text-[12px]">({item.comments?.length || 0})</span>
            </span>
          </div>
        </div>
        <p className="text-[14px] text-gray-500 truncate">{item.name}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[15px] font-bold text-gray-900">{formatPrice()}</span>
          <span className="text-[14px] text-gray-900/80">{getPriceSuffix()}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- PREMIUM LOOP OUT HERO (Redesigned: Sliding Neural Network) ---
const LoopOutHomeHero = ({ navigate }) => {
  const slides = [
    {
      id: 1,
      image: '/maskable.png',
      tagIcon: Sparkles,
      tagText: 'Premium Reflections',
      titleLine1: 'LOOPOUT',
      titleLine2: 'MIRROR.',
      titleGradient: 'from-rose-500 via-rose-400 to-amber-500',
      description: 'Reflect your best self in every space. Discover luxury in the details.',
      buttonAction: () => navigate('/explore'),
      buttonText: 'Start Neural Search',
      buttonIcon: MagnifyingGlassIcon
    },
    {
      id: 2,
      image: '/maskable.png',
      tagIcon: ScissorsIcon,
      tagText: 'Elite Salon Experience',
      titleLine1: 'LOOPOUT',
      titleLine2: 'SALON.',
      titleGradient: 'from-amber-400 via-rose-400 to-rose-500',
      description: 'Premium seating, premium styling. Our signature on every chair.',
      buttonAction: () => navigate('/search?category=hair&type=services'),
      buttonText: 'Find Your Salon',
      buttonIcon: ScissorsIcon
    },
    {
      id: 3,
      image: '/barber_loopout_campaign.png',
      tagIcon: UserGroupIcon,
      tagText: 'Professional Grooming',
      titleLine1: 'LOOPOUT',
      titleLine2: 'BARBER.',
      titleGradient: 'from-indigo-400 via-purple-400 to-rose-500',
      description: 'Experience luxury from the moment you sit down. Draped in excellence.',
      buttonAction: () => navigate('/search?category=barber&type=services'),
      buttonText: 'Book a Barber',
      buttonIcon: ScissorsIcon
    },
    {
      id: 4,
      image: '/maskable.png',
      tagIcon: HomeModernIcon,
      tagText: 'Curated Living Spaces',
      titleLine1: 'LOOPOUT',
      titleLine2: 'ROOMS.',
      titleGradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      description: 'Inside the room for rent, every detail is curated for you. Even the curtains.',
      buttonAction: () => navigate('/search?category=rental&type=properties'),
      buttonText: 'Explore Rooms',
      buttonIcon: HomeModernIcon
    },
    {
      id: 5,
      image: '/maskable.png',
      tagIcon: Sparkles,
      tagText: 'Signature Comfort',
      titleLine1: 'LOOPOUT',
      titleLine2: 'BEDDING.',
      titleGradient: 'from-rose-400 via-pink-400 to-purple-500',
      description: 'Rest in luxury with our signature LoopOut logo on your bedding.',
      buttonAction: () => navigate('/search?category=guesthouse&type=properties'),
      buttonText: 'View Guest Houses',
      buttonIcon: Sparkles
    },
    {
      id: 6,
      image: '/hotel_reception_loopout_campaign.png',
      tagIcon: StarIcon,
      tagText: 'Grand Hospitality',
      titleLine1: 'LOOPOUT',
      titleLine2: 'HOTEL.',
      titleGradient: 'from-amber-300 via-yellow-400 to-orange-500',
      description: 'From the banner at the gate to the reception table, welcome to excellence.',
      buttonAction: () => navigate('/search?type=properties'),
      buttonText: 'Discover Hotels',
      buttonIcon: StarIcon
    }
  ];

  return (
    <div className="relative h-[850px] w-full overflow-hidden bg-gray-950">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1500}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-rose-500' }}
        className="h-full w-full hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10 }}
                className="absolute inset-0"
              >
                <img
                  src={slide.image}
                  alt={slide.titleLine1 + ' ' + slide.titleLine2}
                  className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/40 to-transparent" />
              </motion.div>

              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-5xl"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black tracking-[0.3em] uppercase mb-10 shadow-2xl">
                    <slide.tagIcon className="w-4 h-4 text-rose-500" />
                    {slide.tagText}
                  </div>
                  <h1 className="text-7xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.8] drop-shadow-2xl">
                    {slide.titleLine1} <br />
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.titleGradient}`}>
                      {slide.titleLine2}
                    </span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-lg">
                    {slide.description}
                  </p>
                  <button
                    onClick={slide.buttonAction}
                    className="px-12 py-6 bg-rose-500 text-white rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(225,29,72,0.4)] transition-all flex items-center gap-3 text-xs tracking-widest uppercase mx-auto hover:bg-rose-600 hover:scale-105"
                  >
                    <slide.buttonIcon className="w-5 h-5" />
                    {slide.buttonText}
                  </button>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Animated City Indicators (Persistent Overlay) */}
      <div className="absolute bottom-12 left-12 z-20 hidden lg:flex flex-col gap-4">
        {["Pretoria", "PMB", "JHB", "Rustenburg"].map((city, i) => (
          <motion.div
            key={city}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.4, x: 0 }}
            transition={{ delay: 1 + (i * 0.2) }}
            className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {city} Hub Active
          </motion.div>
        ))}
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
            className="snap-start shrink-0 w-[200px] md:w-[240px]"
          >
            <AirbnbCard
              item={item}
              type={type}
              onClick={(id) => navigate(id)}
              hideDistance={true}
              reducedSize={true}
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
            <img
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
          <h2 className="text-4xl font-black text-gray-950 tracking-tighter leading-none">
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
            320: { slidesPerView: 1.15, spaceBetween: 12 },
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

const NeuralPicksSection = ({ navigate }) => {
  const { rankItems, topCategories, interactionMetrics } = useSearchIntelligence();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const res = await fetch('/api/helper/get?limit=20');
        const data = await res.json();
        if (data.success) {
          // Use the neural algorithm to rank fetched items
          setHelpers(rankItems(data.helpers));
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHelpers();
  }, [rankItems]);

  if (loading || helpers.length === 0) return null;

  return (
    <motion.section 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={fadeInUp} 
      className="mb-16"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-rose-500"
                />
              ))}
            </div>
            <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase italic">Alpha Neural Discovery</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">PROMOTED FOR YOU</h2>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Based on your performance and interest history</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-300" />
            Sessions: {interactionMetrics.sessionCount}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-300" />
            Accuracy: 98%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {helpers.slice(0, 4).map((helper, idx) => (
          <motion.div
            key={helper._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative"
          >
            <HelperItem helper={helper} />
            {/* Neural Overlay Tag */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1 bg-gray-950/80 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2 shadow-2xl">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Neural Pick</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

const SmartRecommendations = ({ recommendations, insights, loading, onItemClick }) => {
  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-gray-900">AI Picks for you</h3>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {recommendations.slice(0, 6).map((item, i) => (
          <motion.div key={item._id ? `rec-${item._id}` : `rec-${i}`} whileHover={{ y: -4 }} onClick={() => onItemClick(item, item.routeType || item.type)} className="flex-shrink-0 w-40 cursor-pointer">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-200">
              <ImageGallery
                imageUrls={item.imageUrls || []}
                alt={item.name}
                type={item.routeType === 'listing' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : (item.routeType || 'default')}
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-1 bg-white/90 backdrop-blur rounded-md">AI Pick</span>
              </div>
            </div>
            <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-semibold">R{item.price || item.regularPrice}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- NEW COMPONENT: SERVICES TO YOUR DOOR (SIDE SLIDING) ---
const ServicesToYourDoor = ({ navigate }) => {
  const atHomeServices = [
    { id: 'barber', name: 'Mobile Barber', desc: 'Fresh cuts at your home', emoji: '💈', color: 'from-gray-950 to-gray-800' },
    { id: 'hair', name: 'Home Hair & Style', desc: 'Salon experience at home', emoji: '💇', color: 'from-rose-500 to-pink-500' },
    { id: 'massage', name: 'Home Massage', desc: 'Relaxation brought to you', emoji: '💆', color: 'from-emerald-500 to-teal-500' },
    { id: 'domestic', name: 'House Cleaning', desc: 'Professional cleaning', emoji: '🧹', color: 'from-blue-600 to-indigo-600' },
    { id: 'handyman', name: 'Mobile Handyman', desc: 'Home repairs & maintenance', emoji: '🛠️', color: 'from-orange-600 to-amber-500' },
  ];

  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">THE HOME EXPERIENCE</h2>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Services that travel directly to you</p>
        </div>
        <button
          onClick={() => navigate('/helper-home-page')}
          className="text-xs font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-500/20 hover:border-rose-500 transition-all"
        >
          View All Home Experts
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
        {atHomeServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/search?category=${service.id}&type=helpers`)}
            className="snap-start shrink-0 w-[300px] md:w-[320px] cursor-pointer bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/30 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-[4rem]" />
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-8 shadow-lg hover:rotate-12 transition-transform duration-500`}>
              {service.emoji}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{service.name}</h3>
            <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed h-10">{service.desc}</p>
            <div className="flex items-center text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] gap-3">
              BOOK EXPERT <ArrowRightIcon className="w-4 h-4 hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// --- NEW COMPONENT: WEEKLY SPECIALS (DEFINE YOUR DAY) ---
const WeeklySpecialsSection = ({ navigate, isMobile = false }) => {
  const allSpecials = [
    {
      id: 'promo-verified',
      title: 'Verified Excellence',
      discount: 'PREMIUM',
      desc: 'Trust only the best local experts in your area',
      color: 'bg-indigo-600',
      image: '/special_verified.png'
    },
    {
      id: 'promo-favor',
      title: 'Community Favor',
      discount: 'R50 + R50',
      desc: 'Refer a neighbor and both get credits',
      color: 'bg-emerald-600',
      image: '/special_flavor.png'
    },
    {
      id: 'promo-1',
      title: 'First-Time User Special',
      discount: 'R20 OFF',
      desc: 'On your first home experience booking',
      color: 'bg-rose-600',
      image: '/special_first.png'
    },
    {
      id: 'promo-barber',
      title: 'LoopOut Barber',
      discount: 'EXCELLENCE',
      desc: 'Draped in excellence, styled by premier groomers',
      color: 'bg-indigo-600',
      image: '/barber_loopout_campaign.png'
    },
    {
      id: 'promo-hotel',
      title: 'LoopOut Hotel',
      discount: 'EXCLUSIVE',
      desc: 'Welcome to premium comfort at partner destinations',
      color: 'bg-amber-600',
      image: '/hotel_reception_loopout_campaign.png'
    },
    {
      id: 'promo-rooms',
      title: 'LoopOut Soweto Stay',
      discount: 'SOWETO',
      desc: 'Rest in luxury with co-branded pillows at premier guest houses',
      color: 'bg-emerald-600',
      image: '/student_room_loopout_campaign.svg'
    }
  ];

  const specials = isMobile 
    ? allSpecials.filter(s => s.id === 'promo-favor' || s.id === 'promo-1')
    : allSpecials;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <h2 className="text-xl font-black text-gray-950 tracking-widest uppercase">DEFINE YOUR DAY</h2>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-3 ${isMobile ? 'lg:grid-cols-2' : 'lg:grid-cols-6'} gap-6`}>
        {specials.map((promo, idx) => (
          <motion.div
            key={promo.id}
            whileHover={{ scale: 1.02 }}
            className="relative h-64 rounded-[2.5rem] overflow-hidden  cursor-pointer shadow-xl"
            onClick={() => navigate('/search?filter=special')}
          >
            <img src={promo.image} className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-[5s]" alt={promo.title} />
            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className={`${promo.color} text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-3 tracking-widest`}>
                {promo.discount}
              </div>
              <h3 className="text-white font-bold text-xl leading-tight mb-1">{promo.title}</h3>
              <p className="text-white/80 text-sm font-medium">{promo.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
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

  const bannerImages = [
    "/soweto_bg.png",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
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
      <div className="min-h-screen bg-white">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          body { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
          body::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; -ms-overflow-style: none; }
          *::-webkit-scrollbar { display: none; }
        `}</style>

        <LoopOutHomeHero navigate={navigate} />

        <main className="max-w-7xl mx-auto px-8 py-12">
          {/* FRESHA-STYLE TOP CATEGORIES SECTION */}
          <TopCategoriesSection navigate={navigate} />

          {/* LoopOut Brand Campaign Banner */}
          <div className="relative h-24 mb-16">
            <LoopOutBanner type="all" className="relative !bottom-0 !left-0 !right-0 !px-0" />
          </div>

          {/* NEURAL PICKS SECTION - Alpha Algorithm */}
          <NeuralPicksSection navigate={navigate} />

          {/* Location Status Indicator */}
          {locationStatus && (
            <div className="mb-8 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{locationStatus.title}</h4>
                  <p className="text-sm text-gray-600">{locationStatus.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-rose-600 bg-white px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200 shadow-sm">
                <CheckCircleIcon className="w-4 h-4" />
                ADJUSTED RADIUS
              </div>
            </div>
          )}

          {/* PROMOTED LISTINGS SECTION (SAMPLE) */}
          <section className="mb-16 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-6 rounded-[2.5rem] border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[2px] bg-amber-500" />
                <span className="text-amber-600 text-sm font-black tracking-[0.2em] uppercase flex items-center gap-2">
                  <FireIcon className="w-5 h-5" /> Promoted by Hosts
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { item: MOCK_PROPERTIES[0], type: 'property', path: `/listing/${MOCK_PROPERTIES[0]._id}` },
                  { item: MOCK_SERVICES[0], type: 'service', path: `/service/${MOCK_SERVICES[0]._id}` },
                  { item: MOCK_HELPERS[0], type: 'helper', path: `/helper/${MOCK_HELPERS[0]._id}` },
                  { item: MOCK_EVENTS[0], type: 'event', path: `/event/${MOCK_EVENTS[0]._id}` }
                ].filter(promo => promo.item).map((promo, idx) => (
                  <div key={`promoted-${promo.type}-${idx}`} className="relative">
                    <AirbnbCard item={promo.item} type={promo.type} onClick={() => navigate(promo.path)} hideDistance={true} />
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Ad
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURED DISCOVERY GRID - Advanced selection for quick discovery */}
          <section className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <h2 className="text-[28px] font-black text-gray-900 tracking-tighter uppercase italic">
                  Featured <span className="text-rose-500">{activeFeaturedTab}</span>
                </h2>
                <p className="text-gray-400 text-xs font-black tracking-[0.2em] uppercase mt-1">Handpicked elite experiences</p>
              </div>
              
              {/* Featured Selection Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-[2rem]">
                {['Properties', 'Services', 'Helper', 'Events'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFeaturedTab(tab)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFeaturedTab === tab ? 'bg-white text-gray-950 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
              {(activeFeaturedTab === 'Properties' ? featuredProperties : 
                activeFeaturedTab === 'Services' ? featuredServices : 
                activeFeaturedTab === 'Helper' ? featuredHelpers : featuredEvents)
                .slice(0, 8).map((item, idx) => (
                <motion.div
                  key={`featured-${activeFeaturedTab}-${item._id || idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <AirbnbCard
                    item={item}
                    type={activeFeaturedTab === 'Properties' ? 'property' : activeFeaturedTab.toLowerCase()}
                    onClick={(path) => navigate(path)}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* NEW: WEEKLY SPECIALS SECTION */}
          <WeeklySpecialsSection navigate={navigate} isMobile={false} />



          {/* SERVICES TO YOUR DOOR SECTION */}
          <ServicesToYourDoor navigate={navigate} />



          {recentlyAddedItems.length > 0 && (
            <section className="mb-16">
              <SectionTitle title="Recently added" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentlyAddedItems.slice(0, 8).map((item) => (
                  <RecentlyAddedCard
                    key={item._id}
                    item={item}
                    type={item.itemType === 'listing' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : item.itemType}
                    onClick={() => navigate(`/${item.itemType || 'listing'}/${item._id}`)}
                  />
                ))}
              </div>
            </section>
          )}


          {/* CONSOLIDATED DISCOVER FEED */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-10">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-4 px-8 py-5 rounded-[2.5rem] border relative transition-all duration-500 overflow-hidden ${
                        isActive 
                          ? 'bg-white border-gray-200 shadow-[0_30px_60px_rgba(0,0,0,0.12)] scale-110 z-10' 
                          : 'bg-gray-50/50 border-transparent opacity-50 hover:opacity-100 hover:bg-white/80 hover:shadow-xl'
                      }`}
                    >
                      <motion.div 
                        whileHover={{ rotateY: 180 }}
                        transition={{ duration: 0.6 }}
                        className="flex-shrink-0"
                        style={{ perspective: '1000px' }}
                      >
                        <CategoryIcon type={tab.iconType} size={isActive ? "w-11 h-11" : "w-9 h-9"} />
                      </motion.div>
                      <span className={`text-[11px] font-black uppercase tracking-[0.3em] transition-colors ${isActive ? 'text-gray-950' : 'text-gray-400'}`}>
                        {tab.id}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabUnderline" 
                          className={`absolute bottom-0 left-0 right-0 h-1.5 ${getTabColor(tab.id)}`} 
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50">
                <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-900">Elite Filter</div>
                <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {getFilteredItems().map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, y: 20 }}
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
            
            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => navigate('/search')}
                className="px-12 py-5 bg-gray-950 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-rose-500 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95"
              >
                Expand the Matrix
              </button>
            </div>
          </section>

          {/* LoopOut Pulse (Live Community Feed) */}
          <div className="mb-20">
            <LoopOutPulse />
          </div>

          <CommunityNeedsSection navigate={navigate} />


          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-gray-50 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">loopOut by the numbers</h2>
                <p className="text-gray-500 mt-1">Connecting people with spaces, services, and experiences</p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Live statistics
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8">
              {[
                { value: stats.properties || '1,234', label: 'Properties', growth: '12%' },
                { value: stats.services || '456', label: 'Services', growth: '8%' },
                { value: stats.helpers || '789', label: 'Helper', growth: '15%' },
                { value: stats.events || '321', label: 'Events', growth: '5%' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-semibold text-gray-900 mb-1">{stat.value}+</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                  <div className="text-green-600 text-xs mt-1 font-medium">↑ {stat.growth} this month</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* WHAT IS LOOPOUT SECTION */}
          <section className="mt-20 mb-10 px-4 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-[2rem] p-10 md:p-14 text-center shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-3xl md:text-4xl font-black text-gray-950 leading-tight mb-6 tracking-tight">
                What is <span className="text-rose-500">loopOut?</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium max-w-3xl mx-auto">
                LoopOut is South Africa's premier elite discovery engine. We seamlessly connect you with exclusive properties, professional services, reliable local helpers, and world-class events in your city and beyond. Everything you need, all in one place.
              </p>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section className="mt-20 mb-20 px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How loopOut works</h2>
              <p className="text-gray-500">The easiest way to find and book services in Polokwane</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                {
                  icon: <MagnifyingGlassIcon className="w-10 h-10 text-rose-500" />,
                  title: "1. Discover",
                  desc: "Use our AI-powered search to find the perfect stay, helper, or service near you."
                },
                {
                  icon: <Sparkles className="w-10 h-10 text-amber-500" />,
                  title: "2. Personalize",
                  desc: "Select options that fit your schedule and budget. See verified reviews and ratings."
                },
                {
                  icon: <CheckCircleIcon className="w-10 h-10 text-green-500" />,
                  title: "3. Book & Enjoy",
                  desc: "Book instantly via WhatsApp and enjoy professional services from the best in the city."
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center ">
                  <div className="mb-6 p-6 rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Download App Banner */}
          <section className="mt-16 mb-8 bg-gray-900 rounded-3xl p-10 lg:p-14 overflow-hidden relative flex flex-col md:flex-row items-center justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10 md:w-1/2 text-left mb-10 md:mb-0">
              <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Available Now
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">loopOut is better on the app</h2>
              <p className="text-gray-300 mb-8 max-w-md text-base lg:text-lg leading-relaxed">Get real-time notifications, exclusive app-only deals, and discover exactly what you need with our AI-powered search. Download now for iOS and Android.</p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:-translate-y-1 transform duration-200">
                  <FaApple className="text-3xl" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-semibold leading-none text-gray-500 pb-0.5">Download on the</span>
                    <span className="text-base font-bold leading-none">App Store</span>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:-translate-y-1 transform duration-200">
                  <FaGooglePlay className="text-3xl text-emerald-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-semibold leading-none text-gray-500 pb-0.5">GET IT ON</span>
                    <span className="text-base font-bold leading-none">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
            <div className="relative z-10 md:w-5/12 flex justify-center hidden md:flex">
              <div className="w-[260px] h-[520px] bg-gray-800 rounded-[3rem] border-8 border-gray-700 shadow-2xl overflow-hidden relative -mb-24 lg:-mb-10 mr-4 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 inset-x-0 h-7 bg-gray-700 w-32 mx-auto rounded-b-2xl flex items-center justify-center gap-2 z-20">
                  <div className="w-12 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                </div>
                <div className="w-full h-full bg-gradient-to-br from-rose-500 to-indigo-600 p-6 flex flex-col items-center justify-center text-center relative z-10">
                  <div className="absolute inset-0 bg-black/10"></div>

                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 relative z-10">
                    <span className="text-4xl font-black text-rose-500">L</span>
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-2 relative z-10">loopOut</h3>
                  <p className="text-white/90 text-sm text-center px-4 relative z-10">Discover homes, services, and experiences instantly.</p>

                  <div className="mt-8 w-full space-y-3 relative z-10">
                    <div className="w-full h-24 bg-white/20 backdrop-blur-md rounded-2xl p-3 flex gap-3">
                      <div className="w-12 h-12 bg-white/30 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-3 bg-white/30 rounded-full"></div>
                        <div className="w-2/3 h-3 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                    <div className="w-full h-24 bg-white/20 backdrop-blur-md rounded-2xl p-3 flex gap-3">
                      <div className="w-12 h-12 bg-white/30 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-3 bg-white/30 rounded-full"></div>
                        <div className="w-2/3 h-3 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Floating Smart Concierge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/ai-help-center')}
          className=" fixed bottom-8 right-8 z-[100] cursor-pointer "
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
          <div className="relative bg-rose-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20">
            <Sparkles className="w-8 h-8" />
            <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-2xl shadow-xl text-gray-900 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pointer-events-none">
              Need help finding something? <span>✨</span>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        </motion.div>

        {/* Floating My Bookings Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBookingsOpen(true)}
          className=" fixed bottom-28 right-8 z-[100] cursor-pointer "
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-300 shadow-xl" />
          <div className="relative bg-white text-gray-900 p-4 rounded-full shadow-2xl flex items-center justify-center border border-gray-100">
            <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            <div className="absolute right-full mr-4 bg-gray-900 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pointer-events-none">
              Track your requests <span>🚚</span>
            </div>
          </div>
          {requestCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg z-10 transition-transform duration-300 group-hover:scale-110 animate-pulse">
              {requestCount}
            </div>
          )}
        </motion.div>

        {/* Bookings Modal */}
        <MyBookingsConsumer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
        
        <BottomNav />
      </div>
    );
  }

  // Mobile View
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 relative overflow-x-hidden w-full">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      <main className="px-4 pt-2 pb-4">
        {/* Mobile Elite Slider Banner */}
        <div className="relative h-[550px] -mx-4 overflow-hidden mb-12 shadow-2xl">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 6000 }}
            pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-rose-500' }}
            className="h-full w-full mobile-hero-swiper"
          >
            {/* Mobile Slide 1: LoopOut for Everyone */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/explore')}>
                <img
                  src="/loopout_for_everyone.png"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="LoopOut for Everyone"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                    <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Universal Discovery</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[0.85] mb-6 tracking-tighter">
                    LOOPOUT FOR <br />
                    <span className="text-rose-500">EVERYONE.</span>
                  </h2>
                  <p className="text-white/70 text-[14px] font-medium mb-8 leading-relaxed max-w-[280px]">
                    Active in <span className="text-white">JHB</span>, <span className="text-white">Pretoria</span>, <span className="text-white">PMB</span>, and <span className="text-white">Rustenburg</span>.
                  </p>
                  <button className="w-full py-5 bg-rose-500 text-white rounded-2xl text-[12px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                    Start Your Journey
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 2: LoopOut Maid Celebration */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=maid&type=helper')}>
                <img
                  src="/loopout_maid_celebration.png"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="LoopOut Maid"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartIcon className="w-5 h-5 text-rose-500" />
                    <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Professional Care</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[0.85] mb-6 tracking-tighter">
                    THE PERFECT <br />
                    <span className="text-rose-500">WORK.</span>
                  </h2>
                  <p className="text-white/70 text-[14px] font-medium mb-8 leading-relaxed max-w-[280px]">
                    Celebrating the bond between <span className="text-white">families</span> and their <span className="text-white">trusted helpers</span>.
                  </p>
                  <button className="w-full py-5 bg-white text-gray-950 rounded-2xl text-[12px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                    Find Your Maid
                  </button>
                </div>
              </div>
            </SwiperSlide>
            {/* Mobile Slide 3: LoopOut Removal & Delivery */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=delivery&type=services')}>
                <img
                  src="/loopout_removal_delivery.png"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="LoopOut Delivery"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <TruckIcon className="w-5 h-5 text-rose-500" />
                    <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Elite Logistics</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[0.85] mb-6 tracking-tighter">
                    REMOVAL & <br />
                    <span className="text-rose-500">DELIVERY.</span>
                  </h2>
                  <p className="text-white/70 text-[14px] font-medium mb-8 leading-relaxed max-w-[280px]">
                    Professional removal and delivery services for your home and business.
                  </p>
                  <button className="w-full py-5 bg-rose-500 text-white rounded-2xl text-[12px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                    Book Delivery
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 4: LoopOut Barber Campaign */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=barber&type=services')}>
                <img
                  src="/barber_loopout_campaign.png"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="LoopOut Barber"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <ScissorsIcon className="w-5 h-5 text-rose-500" />
                    <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Professional Grooming</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[0.85] mb-6 tracking-tighter">
                    LOOPOUT <br />
                    <span className="text-rose-500">BARBER.</span>
                  </h2>
                  <p className="text-white/70 text-[14px] font-medium mb-8 leading-relaxed max-w-[280px]">
                    Experience luxury from the moment you sit down. <span className="text-white">Draped in excellence.</span>
                  </p>
                  <button className="w-full py-5 bg-rose-500 text-white rounded-2xl text-[12px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                    Book a Barber
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 5: LoopOut Hotel Campaign */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?type=properties')}>
                <img
                  src="/hotel_reception_loopout_campaign.png"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="LoopOut Hotel"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <StarIcon className="w-5 h-5 text-rose-500" />
                    <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Grand Hospitality</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[0.85] mb-6 tracking-tighter">
                    LOOPOUT <br />
                    <span className="text-rose-500">HOTEL.</span>
                  </h2>
                  <p className="text-white/70 text-[14px] font-medium mb-8 leading-relaxed max-w-[280px]">
                    From the gate to the reception desk, <span className="text-white">welcome to excellence.</span>
                  </p>
                  <button className="w-full py-5 bg-white text-gray-950 rounded-2xl text-[12px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                    Discover Hotels
                  </button>
                </div>
              </div>
            </SwiperSlide>

            {/* Mobile Slide 6: LoopOut Soweto Bedroom Campaign */}
            <SwiperSlide>
              <div className="relative h-full w-full" onClick={() => navigate('/search?category=guesthouse&type=properties')}>
                <img
                  src="/student_room_loopout_campaign.svg"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="LoopOut Soweto Stay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <HomeModernIcon className="w-5 h-5 text-rose-500" />
                    <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Soweto Bedroom</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[0.85] mb-6 tracking-tighter">
                    LOOPOUT <br />
                    <span className="text-rose-500">SOWETO.</span>
                  </h2>
                  <p className="text-white/70 text-[14px] font-medium mb-8 leading-relaxed max-w-[280px]">
                    Boutique guest houses like Twin Beez. <span className="text-white">Rest in luxury with co-branded pillows.</span>
                  </p>
                  <button className="w-full py-5 bg-rose-500 text-white rounded-2xl text-[12px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                    Book Soweto Stay
                  </button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Mobile Top Categories - Horizontal Scroll (Now under the banner) */}
        <section className="mb-8 -mx-4 px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Top categories</h2>
            <button onClick={() => navigate('/categories')} className="text-sm text-rose-500 font-medium">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {TOP_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  const helpers = ['sneaker', 'washingmat', 'animals', 'domestic', 'tutor', 'maid', 'beauty', 'cleaner', 'barber', 'hair', 'nails', 'massage', 'chef', 'tattoo', 'nanny'];
                  const services = ['baker', 'carwash', 'photograph', 'transport', 'landscaping', 'electrician', 'handyman', 'catering', 'schoolTransport', 'daycare', 'daily', 'delivery', 'usedbooks'];
                  const properties = ['rental', 'guesthouse', 'sale', 'overnight', 'vacation', 'office', 'land'];

                  if (helpers.includes(category.id)) {
                    navigate(`/search?category=${category.id}&type=helper`);
                  } else if (services.includes(category.id)) {
                    navigate(`/search?category=${category.id}&type=services`);
                  } else if (properties.includes(category.id)) {
                    navigate(`/search?category=${category.id}&type=properties`);
                  } else {
                    navigate(`/search?category=${category.id}`);
                  }
                }}
                className="snap-start shrink-0 w-[120px] cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                  <ImageGallery
                    imageUrls={[category.image]}
                    alt={category.name}
                    type="category"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-40 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white font-semibold text-sm leading-tight">{category.name}</p>
                    <p className="text-white/80 text-xs">{category.count}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="mb-10">
          <WeeklySpecialsSection navigate={navigate} isMobile={true} />
        </div>

        {/* LoopOut Brand Campaign Banner */}
        <div className="relative h-20 mb-10">
          <LoopOutBanner type="all" className="relative !bottom-0 !left-0 !right-0 !px-0" />
        </div>

        {/* NEURAL PICKS SECTION - Alpha Algorithm (Mobile) */}
        <div className="mb-12">
          <NeuralPicksSection navigate={navigate} />
        </div>


        {/* MOBILE FEATURED DISCOVERY - Tabbed Slider */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Featured</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {['Properties', 'Services', 'Helper', 'Events'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFeaturedTab(tab)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFeaturedTab === tab ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-gray-100 text-gray-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex overflow-x-auto gap-10 pb-6 -mx-4 px-4 scrollbar-hide snap-x">
            {(activeFeaturedTab === 'Properties' ? featuredProperties : 
              activeFeaturedTab === 'Services' ? featuredServices : 
              activeFeaturedTab === 'Helper' ? featuredHelpers : featuredEvents)
              .slice(0, 6).map((item, idx) => (
              <div key={`mobile-featured-${activeFeaturedTab}-${item._id || idx}`} className="snap-start shrink-0 w-[300px]">
                <AirbnbCard
                  item={item}
                  type={activeFeaturedTab === 'Properties' ? 'property' : activeFeaturedTab.toLowerCase()}
                  onClick={(path) => navigate(path)}
                  reducedSize={true}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Location Status Indicator */}
        {locationStatus && (
          <div className="mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shrink-0">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{locationStatus.title}</h4>
              <p className="text-xs text-gray-500">{locationStatus.description}</p>
            </div>
          </div>
        )}





        {recentlyAddedItems.length > 0 && (
          <section className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Recently added</h2>
            <div className="flex overflow-x-auto gap-10 pb-4 -mx-4 px-6 scrollbar-hide snap-x">
              {recentlyAddedItems.slice(0, 5).map((item) => (
                <div key={item._id} className="flex-shrink-0 w-56 snap-start">
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
        <section className="mt-10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Explore {activeTab}</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Live Pulse</span>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-8 border-b border-gray-50 mb-10 scrollbar-hide -mx-4 px-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-500 shrink-0 ${
                    isActive 
                      ? 'bg-white border-gray-200 shadow-xl scale-105' 
                      : 'bg-gray-50/50 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <CategoryIcon type={tab.iconType} size={isActive ? "w-11 h-11" : "w-8 h-8"} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-gray-950' : 'text-gray-400'}`}>
                    {tab.id}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-10">
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
        <div className="mb-10 -mx-4">
          <LoopOutPulse />
        </div>

        <CommunityNeedsSection navigate={navigate} />

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
    const fetchHomepageData = async () => {
      const controllers = {
        properties: new AbortController(),
        services: new AbortController(),
        helpers: new AbortController(),
        events: new AbortController()
      };
      const timeoutId = setTimeout(() => {
        Object.values(controllers).forEach(controller => controller.abort());
      }, API_TIMEOUT);

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

      await Promise.all(fetchPromises);
      clearTimeout(timeoutId);
      setStats({ properties: 1234, services: 456, helpers: 789, events: 321 });
    };

    if (!geoLoading) {
      fetchHomepageData();
    }
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
