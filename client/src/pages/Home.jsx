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
  SparklesIcon,
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
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { 
  FaApple, 
  FaGooglePlay
} from 'react-icons/fa';
import ImageGallery from '../components/ImageGallery';
import useLocationCoords from '../hooks/useGeolocation';
import LoopOutPulse from '../components/LoopOutPulse';
import MyBookingsConsumer from '../components/MyBookingsConsumer';
import LookingForItem from '../components/LookingForItem';

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

// --- TOP CATEGORIES DATA (Fresha Style) ---
const TOP_CATEGORIES = [
  {
    id: 'beauty',
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '3,210',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'maid',
    name: 'Maid',
    image: 'https://images.unsplash.com/photo-1584820927498-cafe3c157921?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,890',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?fm=jpg&q=60&w=800&auto=format&fit=crop',
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
    image: 'https://plus.unsplash.com/premium_photo-1759145128249-96ba5361d5d9?fm=jpg&q=60&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '3,567',
    color: 'from-green-600 to-emerald-500',
    emoji: '📦'
  },
  {
    id: 'usedbooks',
    name: 'Used Books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://plus.unsplash.com/premium_photo-1661963219843-f1a50a6cfcd3?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,567',
    color: 'from-red-600 to-rose-500',
    emoji: '🚕'
  },
  {
    id: 'tattor Artise',
    name: 'Tattoo artist',
    image: 'https://images.pexels.com/photos/1304469/pexels-photo-1304469.jpeg',
    count: '2,109',
    color: 'from-teal-600 to-cyan-500',
    emoji: '🎨'
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
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?fm=jpg&q=60&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,234',
    color: 'from-cyan-600 to-blue-500',
    emoji: '🏡'
  },
  {
    id: 'hair',
    name: 'Hair & Style',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '3,890',
    color: 'from-fuchsia-600 to-pink-500',
    emoji: '💇'
  },
  {
    id: 'nails',
    name: 'Nails',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '2,456',
    color: 'from-rose-400 to-pink-400',
    emoji: '💅'
  },
  {
    id: 'massage',
    name: 'Massage',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,678',
    color: 'from-emerald-600 to-teal-500',
    emoji: '💆'
  },
  {
    id: 'tattoo',
    name: 'Tattoo Artist',
    image: 'https://images.unsplash.com/photo-1552627019-947c3789ffb5?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '445',
    color: 'from-slate-800 to-gray-900',
    emoji: '💉'
  },
  {
    id: 'chef',
    name: 'Private Chef',
    image: 'https://plus.unsplash.com/premium_photo-1682097301631-902c29a12a21?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '334',
    color: 'from-orange-500 to-red-500',
    emoji: '👨‍🍳'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    image: 'https://images.unsplash.com/photo-1597201278257-3687be27d954?fm=jpg&q=60&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '234',
    color: 'from-cyan-600 to-blue-600',
    emoji: '🧺'
  },
  {
    id: 'animals',
    name: 'Animal Care',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '789',
    color: 'from-amber-600 to-orange-500',
    emoji: '🐾'
  },
  {
    id: 'grocery',
    name: 'Grocery Runner',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,200',
    color: 'from-green-500 to-emerald-500',
    emoji: '🍎'
  },
  {
    id: 'laundry',
    name: 'Laundry',
    image: 'https://images.unsplash.com/photo-1545173153-5dd921a1fefc?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '850',
    color: 'from-blue-400 to-cyan-400',
    emoji: '🧼'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Drop',
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '430',
    color: 'from-red-400 to-rose-400',
    emoji: '💊'
  },
  {
    id: 'events',
    name: 'Events',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '120+',
    color: 'from-indigo-600 to-purple-600',
    emoji: '🎟️'
  },
  {
    id: 'beachfront',
    name: 'Beachfront',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '89',
    color: 'from-blue-400 to-cyan-400',
    emoji: '🏖️'
  },
  {
    id: 'cabin',
    name: 'Log Cabin',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '76',
    color: 'from-orange-800 to-brown-600',
    emoji: '🪵'
  },
  {
    id: 'roommate',
    name: 'Finding Roommate',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
    count: '340',
    color: 'from-emerald-500 to-teal-400',
    emoji: '👤'
  },
  {
    id: 'nanny-need',
    name: 'Looking for Nanny',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    count: '120',
    color: 'from-pink-400 to-rose-400',
    emoji: '🍼'
  },
  {
    id: 'trending',
    name: 'Trending',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '210',
    color: 'from-red-600 to-orange-500',
    emoji: '🚀'
  }
];

// --- Mock Data with specific IDs for testing ---
const MOCK_PROPERTIES = [
  { _id: 'prop-1', name: 'Modern Apartment in City Center', price: 2500, regularPrice: 2500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5, address: 'Johannesburg' },
  { _id: 'prop-2', name: 'Luxury Villa with Pool', price: 8500000, regularPrice: 8500000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Cape Town' },
  { _id: 'prop-3', name: 'Cozy Studio near University', price: 1200, regularPrice: 1200, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.3, address: 'Pretoria' },
  { _id: 'prop-4', name: 'Modern Office Space', price: 500, regularPrice: 500, type: 'office', imageUrls: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6, address: 'Polokwane' },
  { _id: 'prop-5', name: 'Family House in Suburbs', price: 3500, regularPrice: 3500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7, address: 'Durban' },
  { _id: 'prop-6', name: 'Vacation Beach House', price: 1800, regularPrice: 1800, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9, address: 'Port Elizabeth' },
  { _id: 'prop-7', name: 'Commercial Land Plot', price: 250000, regularPrice: 250000, type: 'land', imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.4, address: 'Bloemfontein' },
  { _id: 'prop-8', name: 'Penthouse with View', price: 12000000, regularPrice: 12000000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Johannesburg' }
];

const MOCK_SERVICES = [
  { _id: 'serv-1', name: 'Professional Cleaning Service', price: 200, regularPrice: 200, description: 'Deep cleaning service for your home or office', imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7 },
  { _id: 'serv-2', name: 'Moving & Relocation Assistance', price: 350, regularPrice: 350, description: 'Help with packing and moving to your new home', imageUrls: ['https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8 },
  { _id: 'serv-3', name: 'Landscaping & Garden Design', price: 450, regularPrice: 450, description: 'Garden maintenance and landscape design services', imageUrls: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6 },
  { _id: 'serv-4', name: 'Home Repair & Maintenance', price: 300, regularPrice: 300, description: 'Professional home repair and maintenance services', imageUrls: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9 },
  { _id: 'serv-5', name: 'Car Wash & Detailing', price: 150, regularPrice: 150, description: 'Professional car washing and detailing services', imageUrls: ['https://images.unsplash.com/photo-1565689221354-d87f85d4aee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5 },
  { _id: 'serv-6', name: 'Sneaker Cleaning & Restoration', price: 250, regularPrice: 250, description: 'Professional sneaker cleaning and restoration services', imageUrls: ['https://images.unsplash.com/photo-1463100099107-aa0980c362e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8 },
  { _id: 'serv-7', name: 'Professional Mat Washing', price: 180, regularPrice: 180, description: 'Deep cleaning and sanitizing of all types of mats', imageUrls: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7 },
  { _id: 'serv-8', name: 'Pet Grooming & Care', price: 220, regularPrice: 220, description: 'Professional grooming, bathing, and care for your pets', imageUrls: ['https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9 }
];

// Updated MOCK_HELPERS with specific IDs that match your database
const MOCK_HELPERS = [
  { _id: '69a6a956f0c40835a3119612', name: 'John\'s Sneaker Care', type: 'sneaker', rating: 4.8, regularPrice: 250, imageUrls: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Johannesburg', host: 'John Smith', description: 'Professional sneaker cleaning and restoration services using premium products. I restore and clean all types of sneakers with care and attention to detail.', travelFee: 50 },
  { _id: 'help-2', name: 'Jane Smith', type: 'Elderly Caregiver', rating: 4.9, regularPrice: 150, imageUrls: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Cape Town', host: 'Jane Smith', description: 'Experienced caregiver providing compassionate care for elderly individuals.', travelFee: 30 },
  { _id: 'help-3', name: 'Mike Johnson', type: 'barber', rating: 4.7, regularPrice: 200, imageUrls: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Durban', host: 'Mike Johnson', description: 'Professional barber with 10+ years of experience in modern and classic cuts.', travelFee: 40 },
  { _id: 'help-4', name: 'Sarah Wilson', type: 'domestic', rating: 4.6, regularPrice: 180, imageUrls: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Pretoria', host: 'Sarah Wilson', description: 'Reliable domestic helper for cleaning, laundry, and household chores.', travelFee: 25 },
  { _id: 'help-5', name: 'David Brown', type: 'tutor', rating: 4.8, regularPrice: 250, imageUrls: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Johannesburg', host: 'David Brown', description: 'Qualified math and science tutor for high school and university students.', travelFee: 35 },
  { _id: 'help-6', name: 'Emily Davis', type: 'photography', rating: 4.9, regularPrice: 300, imageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Cape Town', host: 'Emily Davis', description: 'Professional photographer specializing in portraits, events, and commercial work.', travelFee: 60 },
  { _id: 'help-7', name: 'Mike\'s Sneaker Care', type: 'sneaker', rating: 4.8, regularPrice: 250, imageUrls: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Johannesburg', host: 'Mike Johnson', description: 'Expert sneaker cleaning and restoration services. I use premium products to restore your sneakers to like-new condition.', travelFee: 45 },
  { _id: 'help-8', name: 'Clean Mats SA', type: 'washingmat', rating: 4.7, regularPrice: 180, imageUrls: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Durban', host: 'Sarah Williams', description: 'Professional mat washing service using industrial machines. I clean all types of mats including doormats, bath mats, and gym mats.', travelFee: 40 },
  { _id: 'help-9', name: 'Paws & Claws Care', type: 'animals', rating: 4.9, regularPrice: 220, imageUrls: ['https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'], address: 'Cape Town', host: 'Dr. James Wilson', description: 'Loving and experienced animal care provider. I offer pet sitting, dog walking, grooming, and medication administration for all types of pets.', travelFee: 35 }
];

const MOCK_EVENTS = [
  { _id: 'ev-1', name: 'Local Music Festival 2024', price: 50, regularPrice: 50, date: '2024-03-15', address: 'City Park, Johannesburg', attendingCount: 120, imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-2', name: 'Art & Craft Workshop', price: 30, regularPrice: 30, date: '2024-03-20', address: 'Art Center, Cape Town', attendingCount: 45, imageUrls: ['https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-3', name: 'Food & Wine Tasting Experience', price: 75, regularPrice: 75, date: '2024-03-25', address: 'Downtown Square, Durban', attendingCount: 89, imageUrls: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-4', name: 'Tech Startup Conference', price: 100, regularPrice: 100, date: '2024-04-05', address: 'Convention Center, Pretoria', attendingCount: 210, imageUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] }
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

const AirbnbCard = ({ item, onClick, isLiked, onLike, type = 'property', hideDistance = false }) => {
  const isGuestFavorite = item.rating >= 4.8;

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

  const getPropertyTypeLabel = () => {
    switch (item.type) {
      case 'rent-long': return 'Long term rental';
      case 'rent-short': return 'Short stay';
      case 'sale': return 'For sale';
      case 'office': return 'Office space';
      case 'land': return 'Land plot';
      default: return '';
    }
  };

  const formatPrice = () => {
    const price = item.price || item.regularPrice;
    if (type === 'property' && (item.type === 'sale' || item.type === 'land')) {
      return `R${price?.toLocaleString()}`;
    }
    return `R${price}`;
  };

  // Handle click with proper navigation based on type
  const handleClick = () => {
    if (type === 'property') {
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
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className="cursor-pointer flex flex-col gap-2 "
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 ">
        <ImageGallery
          imageUrls={item.imageUrls || []}
          alt={item.name}
          type={type === 'property' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : type}
        />

        <button
          onClick={(e) => { e.stopPropagation(); onLike && onLike(item._id, !isLiked); }}
          className="absolute top-3 right-3 p-2 text-white hover:scale-110 transition-transform z-20 drop-shadow-md"
        >
          {isLiked ? (
            <HeartIconSolid className="w-6 h-6 text-rose-500 fill-rose-500" />
          ) : (
            <HeartIcon className="w-6 h-6 stroke-[2px]" />
          )}
        </button>

        {isGuestFavorite && type === 'property' && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-black/5 z-20">
            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Guest favorite</span>
          </div>
        )}
      </div>

      <div className="flex flex-col pt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-[15px] text-gray-900 truncate">
            {item.address || item.name || 'South Africa'}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarIconSolid className="w-3.5 h-3.5 text-gray-950" />
            <span className="text-[14px] font-medium text-gray-950">{item.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>

     

        {item._distance && item._distance !== Infinity && !hideDistance ? (
           <p className="text-[14px] text-gray-500">
             {item._distance < 1 ? "Near you" : `${Math.round(item._distance)} km away`}
           </p>
        ) : (
          <p className="text-[14px] text-gray-500"></p>
        )}

        <div className="mt-1 flex items-baseline gap-1">
           <span className="text-[15px] font-bold text-gray-900">{formatPrice()}</span>
           <span className="text-[14px] text-gray-900/80">{getPriceSuffix()}</span>
        </div>
      </div>
    </motion.div>
  );
};

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
    const helpers = ['sneaker', 'washingmat', 'animals', 'domestic', 'tutor', 'maid', 'beauty', 'cleaner', 'nanny'];
    const services = ['barber', 'baker', 'carwash', 'photograph', 'transport', 'tattor Artise', 'tattoo', 'hair', 'nails', 'massage', 'chef', 'landscaping', 'electrician'];
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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 ">
        <ImageGallery
          imageUrls={helper.imageUrls || []}
          alt={helper.name}
          type="avatar"
        />
        
        {/* Verified Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-black/5 z-20 flex items-center gap-1.5">
          <CheckCircleIcon className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Verified</span>
        </div>
      </div>

      <div className="flex flex-col pt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-[15px] text-gray-900 truncate">
             {helper.address || "South Africa"}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarIconSolid className="w-3.5 h-3.5 text-gray-950" />
            <span className="text-[14px] font-medium text-gray-950">{helper.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>

        <p className="text-[14px] text-gray-500 truncate">{helper.name}</p>
      

        <div className="mt-1 flex items-baseline gap-1">
           <span className="text-[15px] font-bold text-gray-900">{formatPrice()}</span>
           <span className="text-[14px] text-gray-900/80">/ session</span>
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
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-2 "
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 ">
        <ImageGallery
          imageUrls={item.imageUrls || []}
          alt={item.name}
          type={type}
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-black/5 z-20">
          <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">New Listing</span>
        </div>
      </div>

      <div className="flex flex-col pt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-[15px] text-gray-900 truncate">
            {item.address || "South Africa"}
          </h3>
          {item.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <StarIconSolid className="w-3.5 h-3.5 text-gray-950" />
              <span className="text-[14px] font-medium text-gray-950">{item.rating?.toFixed(1)}</span>
            </div>
          )}
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

// --- PREMIUM LOOP OUT HERO ---
const LoopOutHomeHero = ({ navigate }) => {
  return (
    <div className="relative h-[650px] w-full overflow-hidden bg-gray-900">
      {/* Background with Ambient Motion */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img 
          src="/loopout_hero_bg.png" 
          alt="loopOut Elite Experience" 
          className="w-full h-full object-cover"
        />
        {/* Elite Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/40 via-transparent to-indigo-900/40" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
           initial={{ y: 40, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.6, duration: 0.8 }}
           className="max-w-4xl"
        >
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ delay: 0.8, duration: 1 }}
            className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black tracking-[0.25em] uppercase mb-8 shadow-2xl"
          >
            Everything is in the Loop
          </motion.div>

          <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
            EXPERIENCE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 animate-gradient-x">
               INFINITE FLOW
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-lg">
            The elite portal connecting you to premium homes, professional helpers, and world-class daily services.
          </p>
          

          <div className="flex flex-wrap items-center justify-center gap-6">
             <motion.button 
               whileHover={{ scale: 1.05, y: -5 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/listing-home-page')}
               className="relative px-10 py-5 bg-white text-gray-900 rounded-[2rem] font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all overflow-hidden"
             >
                <div className="relative z-10 flex items-center gap-3">
                  <HomeIcon className="w-6 h-6" />
                  EXPLORE HOMES
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
             </motion.button>

             <motion.button 
               whileHover={{ scale: 1.05, y: -5 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/helper-home-page')}
               className=" relative px-10 py-5 bg-rose-600 text-white rounded-[2rem] font-black shadow-[0_20px_40px_rgba(225,29,72,0.3)] transition-all overflow-hidden border border-rose-500/50"
             >
                <div className="relative z-10 flex items-center gap-3">
                  <UserGroupIcon className="w-6 h-6" />
                  FIND HELPERS
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-700 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
             </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Floating 3D Elements Placeholder (Abstract UI) */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 hidden lg:block"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-rose-500/10 backdrop-blur-3xl border border-rose-500/20 hidden lg:block"
      />

      {/* Hero Stats/Features Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-black/20 backdrop-blur-2xl border-t border-white/10 py-8 z-20 hidden md:block">
        <div className="max-w-7xl mx-auto px-12 flex justify-between items-center">
           {[
             { label: "VERIFIED HOMES", value: "1.2k+", icon: <HomeIcon className="w-5 h-5 text-rose-400" /> },
             { label: "EXPERT HELPERS", value: "850+", icon: <UserGroupIcon className="w-5 h-5 text-blue-400" /> },
             { label: "DAILY SERVICES", value: "24/7", icon: <SparklesIcon className="w-5 h-5 text-amber-400" /> },
             { label: "LOCAL EVENTS", value: "100+", icon: <FireIcon className="w-5 h-5 text-orange-400" /> }
           ].map((stat, i) => (
             <div key={i} className="flex items-center gap-4 group">
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">{stat.icon}</div>
                <div>
                   <div className="text-white text-xl font-black leading-tight tracking-tight">{stat.value}</div>
                   <div className="text-white/40 text-[9px] font-black tracking-[0.2em]">{stat.label}</div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};



const DesktopPopularDestinations = ({ navigate }) => {
  const popularDestinations = [
    { name: 'Johannesburg', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Cape Town', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Durban', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Pretoria', image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Port Elizabeth', image: 'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <motion.section key="popular-destinations" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="mb-16">
      <SectionTitle title="Popular destinations" actionText="View all" onAction={() => navigate('/explore')} />
      <div className="grid grid-cols-5 gap-6">
        {popularDestinations.map((destination) => (
          <motion.div key={`dest-${destination.name}`} variants={itemVariants} onClick={() => navigate(`/search?address=${encodeURIComponent(destination.name)}`)} className="cursor-pointer group">
            <div className="relative overflow-hidden rounded-xl mb-3 aspect-[3/4]">
              <ImageGallery
                imageUrls={[destination.image]}
                alt={destination.name}
                type="category"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg">{destination.name}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
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
      className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl shadow-gray-100/30 flex flex-col gap-5 h-full cursor-pointer"
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
             className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 group"
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
    try {
      const res = await fetch(`/api/looking-for/${type}/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        // Optimistic UI update or re-fetch
        fetchNeeds();
      }
    } catch (err) {
      console.error(err);
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
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-500/5 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse-slow-reverse" />

      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black text-rose-500 tracking-[0.3em] uppercase">Intelligence Feed</span>
          </div>
          <h2 className="text-4xl font-black text-gray-950 tracking-tighter leading-none">
             COMMUNITY <br/>
             <span className="text-gray-400">PULSE</span>
          </h2>
        </div>
        <button 
          onClick={() => navigate('/looking-for')} 
          className="group flex items-center gap-3 px-8 py-4 bg-gray-950 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">Sync All Signals</span>
          <ArrowRightIcon className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative -mx-8 px-8 ">
        <Swiper
          modules={[FreeMode]}
          freeMode={true}
          slidesPerView={'auto'}
          spaceBetween={16}
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
        <SparklesIcon className="w-5 h-5 text-rose-500" />
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

  const categories = [
    { icon: '🏠', label: 'Homes', type: 'properties' },
    { icon: '✨', label: 'Services', type: 'services' },
    { icon: '👷', label: 'Helpers', type: 'helpers' },
    { icon: '🧹', label: 'Maid', type: 'helpers', category: 'domestic' },
    { icon: '🧽', label: 'Cleaner', type: 'helpers', category: 'cleaner' },
    { icon: '📚', label: 'Tutor', type: 'helpers', category: 'tutor' },
    { icon: '👨‍🍳', label: 'Chef', type: 'helpers', category: 'chef' },
    { icon: '💄', label: 'Beauty', type: 'helpers', category: 'beauty' },
    { icon: '🖋️', label: 'Tattoos', type: 'helpers', category: 'tattoo' },
    { icon: '✂️', label: 'Barber', type: 'helpers', category: 'barber' },
    { icon: '👶', label: 'Nanny', type: 'helpers', category: 'nanny' },
    { icon: '🎪', label: 'Events', type: 'events' },
    { icon: '🤝', label: 'Needs', type: 'looking-for', path: '/looking-for' },
    { icon: '🏖️', label: 'Beachfront', type: 'properties' },
    { icon: '🏕️', label: 'Cabins', type: 'properties' },
    { icon: '🏰', label: 'Trending', type: 'all' },
  ];

  if (isDesktop) {
    return (
      <div className="min-h-screen">
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

          <DesktopPopularDestinations navigate={navigate} />

          {/* THE DAILY LOOP - NEW FEATURE */}
          <section className="mb-16">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">The Daily Loop</h2>
                <p className="text-gray-500 mt-1">Daily essentials brought to your door</p>
              </div>
              <button 
                onClick={() => navigate('/search?category=daily&type=services')}
                className="text-sm font-semibold underline hover:text-rose-500 transition-colors"
              >
                View all daily
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { id: 'grocery', name: 'Groceries', desc: 'Fresh items in 60m', icon: <ShoppingBagIcon className="w-5 h-5" />, color: 'bg-green-500', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
                { id: 'laundry', name: 'Laundry', desc: 'Wash & Fold service', icon: <SparklesIcon className="w-5 h-5" />, color: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1635274605638-d44babc08a4f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                { id: 'pharmacy', name: 'Pharmacy', desc: 'Medication drop-off', icon: <BoltIcon className="w-5 h-5" />, color: 'bg-rose-500', img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80' },
                { id: 'usedbooks', name: 'Used Books', desc: 'Sell Uni textbooks', icon: <AcademicCapIcon className="w-5 h-5" />, color: 'bg-orange-600', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80' },
                { id: 'water', name: 'Water & Gas', desc: 'Refills delivered', icon: <GlobeAltIcon className="w-5 h-5" />, color: 'bg-cyan-500', img: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=400&q=80' }
              ].map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/search?category=${item.id}&type=services`)}
                  className=" cursor-pointer relative h-48 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img src={item.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg`}>
                       {item.icon}
                    </div>
                    <h3 className="text-white font-bold text-xl">{item.name}</h3>
                    <p className="text-white/70 text-xs">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-8 overflow-x-auto pb-4 mb-8 border-b border-gray-200 scrollbar-hide">
            {categories.map((cat) => (
              <CategoryFilter key={cat.label} {...cat} isActive={activeCategory === cat.label} onClick={() => {
                if (cat.path) {
                   navigate(cat.path);
                   return;
                }
                setActiveCategory(cat.label);
                navigate(cat.category ? `/search?type=${cat.type}&category=${cat.category}` : `/search?type=${cat.type}`);
              }} />
            ))}
          </div>



          {recentlyViewedItems.length > 0 && (
            <section className="mb-16">
              <SectionTitle title="Recently viewed" actionText="See all" onAction={() => navigate('/recently-viewed')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentlyViewedItems.slice(0, 4).map((item) => (
                  <AirbnbCard
                    key={item._id}
                    item={item}
                    type={item.itemType === 'listing' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : item.itemType}
                    onClick={() => onItemClick(item, item.itemType)}
                    isLiked={item.isLiked}
                    onLike={onRecentlyViewedLike}
                  />
                ))}
              </div>
            </section>
          )}

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

          <section className="mb-16">
            <SectionTitle title="Featured properties" actionText="View all" onAction={() => navigate('/listing-home-page')} />
            {loadingProperties ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProperties.slice(0, 8).map((property) => (
                  <AirbnbCard key={property._id} item={property} type="property" onClick={() => navigate(`/listing/${property._id}`)} />
                ))}
              </div>
            )}
          </section>

          <section className="mb-16">
            <SectionTitle title="Professional services" actionText="View all" onAction={() => navigate('/service-home-page')} />
            {loadingServices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredServices.slice(0, 4).map((service) => (
                  <AirbnbCard key={service._id} item={service} type="service" onClick={() => navigate(`/service/${service._id}`)} />
                ))}
              </div>
            )}
          </section>

          {/* LoopOut Pulse (Live Community Feed) */}
          <div className="mb-10 mt-8">
            <LoopOutPulse />
          </div>

          <CommunityNeedsSection navigate={navigate} />

          <section className="mb-16">
            <SectionTitle title="Verified helpers" actionText="View all" onAction={() => navigate('/helper-home-page')} />
            {loadingHelpers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 px-4">
                {featuredHelpers.slice(0, 8).map((helper) => (
                  <EliteHelperCard 
                    key={helper._id} 
                    helper={helper} 
                    onClick={() => navigate(`/helper/${helper._id}`)} 
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mb-16">
            <SectionTitle title="Upcoming events" actionText="View all" onAction={() => navigate('/search?type=events')} />
            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredEvents.slice(0, 4).map((event) => (
                  <motion.div key={event._id} whileHover={{ y: -4 }} onClick={() => navigate(`/event/${event._id}`)} className="cursor-pointer flex flex-col gap-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
                      <ImageGallery
                        imageUrls={event.imageUrls || []}
                        alt={event.name}
                        type="event"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md">
                        <span className="text-xs font-bold text-gray-900">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {event.attendingCount > 100 && (
                        <div className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded-md text-xs font-bold">Trending</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
                      <p className="text-gray-500 text-sm truncate">{event.address}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold text-gray-900">R{event.regularPrice}</span>
                        <span className="text-sm text-gray-500">{event.attendingCount}+ going</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-gray-50 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">LoopOut by the numbers</h2>
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
                { value: stats.helpers || '789', label: 'Helpers', growth: '15%' },
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

          {/* HOW IT WORKS SECTION */}
          <section className="mt-20 mb-20 px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How LoopOut works</h2>
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
                  icon: <SparklesIcon className="w-10 h-10 text-amber-500" />, 
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
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">LoopOut is better on the app</h2>
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
                  <h3 className="text-white font-bold text-2xl mb-2 relative z-10">LoopOut</h3>
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
            <SparklesIcon className="w-8 h-8" />
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

      <main className="px-4 py-4">
        {/* Mobile Top Categories - Horizontal Scroll */}
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
                  const helpers = ['sneaker', 'washingmat', 'animals', 'domestic', 'tutor', 'maid', 'beauty', 'cleaner'];
                  const services = ['barber', 'baker', 'carwash', 'photograph', 'transport', 'tattor Artise', 'tattoo', 'hair', 'nails', 'massage', 'chef', 'landscaping', 'electrician'];
                  const properties = ['rental', 'guesthouse', 'sale', 'overnight'];

                  if (helpers.includes(category.id)) {
                    navigate(`/search?category=${category.id}&type=helpers`);
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
        {/* Mobile Elite Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative h-72 rounded-[2.5rem] overflow-hidden mb-8  shadow-2xl"
          onClick={() => navigate('/ai-help-center')}
        >
          <img 
            src="/loopout_hero_bg.png" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            alt="LoopOut Experience" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
             <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-rose-400" />
                <span className="text-white/60 text-[11px] font-black tracking-[0.2em] uppercase">EXPERIENCE THE LOOP</span>
             </div>
             <h2 className="text-3xl font-black text-white leading-[0.9] mb-3 tracking-tighter">
               YOUR CITY. <br />
               <span className="text-rose-400">YOUR CHOICE.</span>
             </h2>
             <p className="text-white/70 text-sm font-medium mb-6 leading-relaxed max-w-[240px]">
               The elite portal for premium homes and verified professional support.
             </p>
             <div className="flex items-center gap-3">
                <div className="px-6 py-3 bg-white text-gray-900 rounded-2xl text-xs font-black shadow-xl">
                  AI EXPLORE
                </div>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 flex items-center justify-center">
                   <ChevronRightIcon className="w-5 h-5 text-white" />
                </div>
             </div>
          </div>
        </motion.div>


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


        <div className="flex overflow-x-auto gap-4 pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
          {categories.slice(0, 10).map((cat) => (
            <button 
              key={cat.label} 
              onClick={() => {
                if (cat.path) {
                    navigate(cat.path);
                    return;
                }
                navigate(cat.category ? `/search?type=${cat.type}&category=${cat.category}` : `/search?type=${cat.type}`);
              }} 
              className="flex flex-col items-center gap-2 min-w-[64px]"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* THE DAILY LOOP - NEW FEATURE (Mobile) */}
        <section className="mb-10">
          <div className="flex justify-between items-end mb-5">
            <div>
              <h2 className="font-black text-gray-900 text-xl tracking-tight">The Daily Loop</h2>
              <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest opacity-60">Essentials brought to your door</p>
            </div>
            <button 
              onClick={() => navigate('/search?category=daily&type=services')}
              className="text-xs font-semibold text-rose-500 underline"
            >
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'grocery', name: 'Groceries', desc: 'Fresh items in 60m', icon: <ShoppingBagIcon className="w-4 h-4" />, color: 'bg-green-500', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
              { id: 'usedbooks', name: 'Used Books', desc: 'Sell Uni textbooks', icon: <AcademicCapIcon className="w-4 h-4" />, color: 'bg-orange-600', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80' },
              { id: 'laundry', name: 'Laundry', desc: 'Wash & Fold service', icon: <SparklesIcon className="w-4 h-4" />, color: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1635274605638-d44babc08a4f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
              { id: 'pharmacy', name: 'Pharmacy', desc: 'Medication drop-off', icon: <BoltIcon className="w-4 h-4" />, color: 'bg-rose-500', img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80' },
            ].map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/search?category=${item.id}&type=services`)}
                className="cursor-pointer relative h-32 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <img src={item.img} className="absolute inset-0 w-full h-full object-cover" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                  <div className={`${item.color} w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2 shadow-lg`}>
                     {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm">{item.name}</h3>
                  <p className="text-white/70 text-[10px] leading-tight truncate">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>



        {recentlyAddedItems.length > 0 && (
          <section className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Recently added</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
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

        {recentlyViewedItems.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Recently viewed</h2>
              <button onClick={() => navigate('/recently-viewed')} className="text-sm text-gray-500 underline">See all</button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {recentlyViewedItems.slice(0, 5).map((item) => (
                <div key={item._id} onClick={() => onItemClick(item, item.itemType)} className="flex-shrink-0 w-36 cursor-pointer">
                  <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-2 bg-gray-200">
                    <ImageGallery
                      imageUrls={item.imageUrls || []}
                      alt={item.name}
                      type={item.type || 'default'}
                    />
                    <button onClick={(e) => { e.stopPropagation(); onRecentlyViewedLike(item._id, !item.isLiked); }} className="absolute top-2 right-2 p-1 z-20">
                      {item.isLiked ? <HeartIconSolid className="w-5 h-5 text-rose-500" /> : <HeartIcon className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  </div>
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">R{item.regularPrice}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Popular homes</h2>
            <Link to="/listing-home-page" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          {loadingProperties ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {featuredProperties.slice(0, 4).map((property) => (
                <AirbnbCard key={property._id} item={property} type="property" onClick={() => navigate(`/listing/${property._id}`)} hideDistance={true} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Top services</h2>
            <Link to="/service-home-page" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
            {featuredServices.slice(0, 3).map((service) => (
              <div key={service._id} onClick={() => navigate(`/service/${service._id}`)} className="flex-shrink-0 w-60 cursor-pointer">
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-2 bg-gray-200">
                  <ImageGallery
                    imageUrls={service.imageUrls || []}
                    alt={service.name}
                    type="service"
                  />
                </div>
                <p className="font-medium text-sm truncate">{service.name}</p>
                <p className="font-semibold text-sm mt-1">R{service.regularPrice}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LoopOut Pulse (Live Community Feed) - Mobile */}
        <div className="mb-6 -mx-4 mt-6">
          <LoopOutPulse />
        </div>

        <CommunityNeedsSection navigate={navigate} />

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming events</h2>
            <Link to="/search?type=events" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          {featuredEvents.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {featuredEvents.slice(0, 3).map((event) => (
                <div key={event._id} onClick={() => navigate(`/event/${event._id}`)} className="flex-shrink-0 w-72 cursor-pointer">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2 bg-gray-200">
                    <ImageGallery
                      imageUrls={event.imageUrls || []}
                      alt={event.name}
                      type="event"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <p className="font-medium text-sm truncate">{event.name}</p>
                  <p className="text-sm text-gray-500 truncate">{event.address}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-sm">R{event.regularPrice}</span>
                    <span className="text-xs text-gray-500">{event.attendingCount}+ going</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming events</p>
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Helpers</h2>
            <Link to="/helper-home-page" className="text-sm text-gray-500 underline">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
            {featuredHelpers.slice(0, 8).map((helper) => (
              <div key={helper._id} className="flex-shrink-0 w-56 snap-start">
                <EliteHelperCard 
                  helper={helper} 
                  onClick={() => navigate(`/helper/${helper._id}`)} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Promo Banner: Become a Provider */}
        <section className="mb-4 mt-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-3xl p-6 overflow-hidden relative shadow-lg text-white">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                 <HomeModernIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">Earn with LoopOut</h2>
              <p className="text-white/90 mb-6 text-sm px-2 leading-relaxed">Turn your space, skills, or services into extra income. Join thousands of providers today.</p>
              
              <button onClick={() => navigate('/become')} className="w-full bg-white text-rose-600 font-bold py-3.5 px-6 rounded-xl shadow-lg active:scale-95 transition-all duration-150">
                Get Started
              </button>
            </div>
        </section>
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

      const searchCoords = coords || POLOKWANE_COORDS;
      const detectedCity = city || (coords ? null : "Polokwane");

      const fetchPromises = [
        fetch(`/api/listing/get?limit=50&sort=createdAt&order=desc`, {
          signal: controllers.properties.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { 
            if (data?.length > 0) {
              const localMatches = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.POLOKWANE, detectedCity);
              if (localMatches.length > 0) {
                setFeaturedProperties(localMatches.slice(0, DATA_FETCH_LIMIT));
                setLocationStatus({
                  title: `Top Homes in ${detectedCity}`,
                  description: "Showing the best properties within your immediate area."
                });
              } else {
                const nearby = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.NEARBY, detectedCity);
                if (nearby.length > 0) {
                  setFeaturedProperties(nearby.slice(0, DATA_FETCH_LIMIT));
                  setLocationStatus({
                    title: `Homes near ${detectedCity}`,
                    description: "No direct matches in your city, showing nearby neighborhoods."
                  });
                } else {
                  const regional = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.REGIONAL, detectedCity);
                  setFeaturedProperties(regional.slice(0, DATA_FETCH_LIMIT));
                  setLocationStatus({
                    title: "Homes in South Africa",
                    description: "No local matches found, showing trending homes nationwide."
                  });
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
              setFeaturedServices(sorted.slice(0, DATA_FETCH_LIMIT)); 
            }
          })
          .catch(() => { }).finally(() => setLoadingServices(false)),

        fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.helpers.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { 
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              setFeaturedHelpers(sorted.slice(0, DATA_FETCH_LIMIT)); 
            }
          })
          .catch(() => { }).finally(() => setLoadingHelpers(false)),

        fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc`, {
          signal: controllers.events.signal
        }).then(res => res.ok ? res.json() : Promise.reject('Failed'))
          .then(data => { 
            if (data?.length > 0) {
              const sorted = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity);
              setFeaturedEvents(sorted.slice(0, DATA_FETCH_LIMIT)); 
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