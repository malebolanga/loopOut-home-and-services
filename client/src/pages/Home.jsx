import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { FaCar, FaBreadSlice, FaHouseUser, FaCut, FaTruckMoving, FaGraduationCap, FaHandsWash, FaBroom, FaChalkboardTeacher, FaHome, FaBed, FaUtensils, FaLeaf, FaBolt, FaShoePrints, FaWater, FaPaw } from "react-icons/fa";
import ImageGallery from '../components/ImageGallery';
import useLocationCoords from '../hooks/useGeolocation';

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
    image: 'https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg',
    count: '1,234',
    color: 'from-gray-900 to-gray-700'
  },
  {
    id: 'baker',
    name: 'Baker',
    image: 'https://plus.unsplash.com/premium_photo-1759145128249-96ba5361d5d9?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '856',
    color: 'from-amber-600 to-orange-500'
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    image: 'https://images.pexels.com/photos/6873098/pexels-photo-6873098.jpeg',
    count: '23',
    color: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'delivery',
    name: 'Delivery',
    image: 'https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '3,567',
    color: 'from-green-600 to-emerald-500'
  },
  {
    id: 'photograph',
    name: 'Photography',
    image: 'https://images.pexels.com/photos/1088491/pexels-photo-1088491.jpeg',
    count: '892',
    color: 'from-indigo-600 to-purple-500'
  },
  {
    id: 'transport',
    name: 'Transport',
    image: 'https://plus.unsplash.com/premium_photo-1661963219843-f1a50a6cfcd3?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,567',
    color: 'from-red-600 to-rose-500'
  },
  {
    id: 'tattor Artise',
    name: 'Tattoo artist',
    image: 'https://images.pexels.com/photos/1304469/pexels-photo-1304469.jpeg',
    count: '2,109',
    color: 'from-teal-600 to-cyan-500'
  },
  {
    id: 'domestic',
    name: 'Domestic Work',
    image: 'https://plus.unsplash.com/premium_photo-1667520405114-47d3677f966e?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,445',
    color: 'from-pink-600 to-rose-500'
  },
  {
    id: 'tutor',
    name: 'Private Tutor',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '678',
    color: 'from-violet-600 to-purple-500'
  },
  {
    id: 'rental',
    name: 'Rental',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '4,321',
    color: 'from-orange-600 to-amber-500'
  },
  {
    id: 'guesthouse',
    name: 'Guest House',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,234',
    color: 'from-cyan-600 to-blue-500'
  },
  {
    id: 'hair',
    name: 'Hair & Style',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '3,890',
    color: 'from-fuchsia-600 to-pink-500'
  },
  {
    id: 'nails',
    name: 'Nails',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '2,456',
    color: 'from-rose-400 to-pink-400'
  },
  {
    id: 'massage',
    name: 'Massage',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,678',
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'tattoo',
    name: 'Tattoo Artist',
    image: 'https://images.unsplash.com/photo-1552627019-947c3789ffb5?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '445',
    color: 'from-slate-800 to-gray-900'
  },
  {
    id: 'chef',
    name: 'Private Chef',
    image: 'https://plus.unsplash.com/premium_photo-1682097301631-902c29a12a21?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '334',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    image: 'https://images.unsplash.com/photo-1597201278257-3687be27d954?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '889',
    color: 'from-green-700 to-emerald-600'
  },
  {
    id: 'electrician',
    name: 'Electrician',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '1,123',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    id: 'nanny',
    name: 'Nanny',
    image: 'https://images.unsplash.com/photo-1581579135012-7ff8957bd0ae?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '642',
    color: 'from-rose-400 to-pink-400'
  },
  // New helper types
  {
    id: 'sneaker',
    name: 'Sneaker Cleaner',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '567',
    color: 'from-indigo-600 to-purple-600',
    icon: <FaShoePrints />
  },
  {
    id: 'washingmat',
    name: 'Mat Washer',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '234',
    color: 'from-cyan-600 to-blue-600',
    icon: <FaWater />
  },
  {
    id: 'animals',
    name: 'Animal Care',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?fm=jpg&q=60&w=800&auto=format&fit=crop',
    count: '789',
    color: 'from-amber-600 to-orange-500',
    icon: <FaPaw />
  }
];

// --- Mock Data with specific IDs for testing ---
const MOCK_PROPERTIES = [
  { _id: 'prop-1', name: 'Modern Apartment in City Center', price: 2500, regularPrice: 2500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5, address: 'Johannesburg' },
  { _id: 'prop-2', name: 'Luxury Villa with Pool', price: 8500000, regularPrice: 8500000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Cape Town' },
  { _id: 'prop-3', name: 'Cozy Studio near University', price: 1200, regularPrice: 1200, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.3, address: 'Pretoria' },
  { _id: 'prop-4', name: 'Modern Office Space', price: 500, regularPrice: 500, type: 'office', imageUrls: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6, address: 'Sandton' },
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(category)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <ImageGallery
          imageUrls={[category.image]}
          alt={category.name}
          type="category"
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg mb-1 group-hover:translate-y-0 transition-transform">
            {category.name}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-medium">
              {category.count} providers
            </span>
          </div>
        </div>

        {/* Hover Icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-full">
            <ArrowTrendingUpIcon className="w-4 h-4 text-gray-900" />
          </div>
        </div>
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
      className="cursor-pointer flex flex-col gap-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 group">
        <ImageGallery
          imageUrls={item.imageUrls || []}
          alt={item.name}
          type={type === 'property' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : type}
        />

        <button
          onClick={(e) => { e.stopPropagation(); onLike && onLike(item._id, !isLiked); }}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform z-20"
        >
          {isLiked ? (
            <HeartIconSolid className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-md" />
          ) : (
            <HeartIcon className="w-6 h-6 text-white drop-shadow-md hover:text-rose-500 transition-colors" />
          )}
        </button>

        {isGuestFavorite && type === 'property' && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md shadow-sm z-20">
            <span className="text-xs font-bold text-gray-900">Guest favorite</span>
          </div>
        )}

        {type === 'property' && item.type && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded-md shadow-sm z-20">
            <span className="text-xs font-bold text-white">{getPropertyTypeLabel()}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 truncate pr-2 text-[15px]">{item.address || 'South Africa'}</h3>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <StarIconSolid className="w-3.5 h-3.5 text-gray-900" />
            <span className="text-gray-900">{item.rating?.toFixed(2) || '4.5'}</span>
          </div>
        </div>
        <p className="text-gray-500 text-[15px] truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-gray-900 text-[15px]">{formatPrice()}</span>
            {type === 'property' && <span className="text-gray-900 text-[15px]">{getPriceSuffix()}</span>}
          </div>
          {item._distance && item._distance !== Infinity && !hideDistance && (
            <div className="flex items-center gap-1 text-[#FF385C] font-medium text-xs">
              <MapPinIcon className="w-3 h-3" />
              <span>
                {item._distance < 1 
                  ? "Near you" 
                  : `${Math.round(item._distance)} km away`}
              </span>
            </div>
          )}
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

    if (helpers.includes(category.id)) {
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

// --- Main Views ---

const DesktopHeroSearch = ({ searchTerm, setSearchTerm, handleSearchSubmit, navigate, currentLocation }) => {
  const searchCategories = [
    { key: 'properties', label: 'Rent', icon: '🏠', subtext: 'over 1,000+ options' },
    { key: 'properties', label: 'Long stays', icon: '⏳', subtext: '30+ days minimum' },
    { key: 'helpers', label: 'Helpers', icon: '👷', subtext: 'Professional services' },
    { key: 'services', label: 'Services', icon: '✨', subtext: 'Various offerings' }
  ];

  return (
    <motion.div key="desktop-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-rose-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>

      <div className="relative max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl font-semibold text-white mb-4 tracking-tight">
            Find your next stay
          </motion.h1>
          <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl text-white/90 max-w-2xl mx-auto font-light">
            Discover homes, services, and experiences around you
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} onSubmit={handleSearchSubmit} className="relative">
            <div className="bg-white rounded-full shadow-2xl flex items-center p-2">
              <div className="flex-1 flex items-center px-6 border-r border-gray-200">
                <MapIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-900">Where</label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    className="outline-none text-sm text-gray-600 placeholder-gray-400 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full p-4 ml-2 transition-colors">
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
            </div>
          </motion.form>

          <div className="grid grid-cols-4 gap-4 mt-8">
            {searchCategories.map((category, idx) => (
              <motion.button
                key={`search-cat-${category.label}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => navigate(`/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`)}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white hover:bg-white/20 transition-all border border-white/20 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{category.icon}</span>
                  <div>
                    <div className="font-semibold text-lg">{category.label}</div>
                    <div className="text-sm opacity-80 font-light">{category.subtext}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
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
  recentlyAddedItems, locationStatus
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Homes');
  const [showAIInsights, setShowAIInsights] = useState(true);

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
    { icon: '🏖️', label: 'Beachfront', type: 'properties' },
    { icon: '🏕️', label: 'Cabins', type: 'properties' },
    { icon: '🏰', label: 'Trending', type: 'all' },
  ];

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

        <DesktopHeroSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearchSubmit={handleSearchSubmit} navigate={navigate} currentLocation={currentLocation} />

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

          <div className="flex items-center gap-8 overflow-x-auto pb-4 mb-8 border-b border-gray-200 scrollbar-hide">
            {categories.map((cat) => (
              <CategoryFilter key={cat.label} {...cat} isActive={activeCategory === cat.label} onClick={() => {
                setActiveCategory(cat.label);
                navigate(cat.category ? `/search?type=${cat.type}&category=${cat.category}` : `/search?type=${cat.type}`);
              }} />
            ))}
          </div>

          {showAIInsights && aiRecommendations && (
            <SmartRecommendations recommendations={aiRecommendations} insights={aiInsights} loading={loadingProperties && loadingServices} onItemClick={onItemClick} />
          )}

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
                  <AirbnbCard
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

          <section className="mb-16">
            <SectionTitle title="Verified helpers" actionText="View all" onAction={() => navigate('/helper-home-page')} />
            {loadingHelpers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-6 gap-y-12">
                {featuredHelpers.slice(0, 8).map((helper) => (
                  <div key={helper._id} onClick={() => navigate(`/helper/${helper._id}`)} className="cursor-pointer flex flex-col gap-3 ">
                    <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-200 w-48 h-48 mx-auto border-2 border-gray-100 group-hover:border-rose-200 transition-all duration-300">
                      <ImageGallery
                        imageUrls={helper.imageUrls || []}
                        alt={helper.name}
                        type="avatar"
                      />
                      <div className="absolute bottom-2 right-2 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">{helper.name}</h3>
                      <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">{helper.type}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <StarIconSolid className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-sm font-semibold">{helper.rating}</span>
                        <span className="text-gray-300 px-1">|</span>
                        <span className="font-bold text-sm text-gray-900">R{helper.regularPrice}</span>
                      </div>
                    </div>
                  </div>
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
        </main>
      </div>
    );
  }

  // Mobile View
  return (
    <div className="min-h-screen bg-white pb-32">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500 rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Search</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Find your perfect space</h2>
            <p className="text-white/80 text-sm mb-4">Discover homes, services, and experiences</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {['Smart homes', 'Best deals', 'Near me', 'Trending'].map((tag) => (
                <button key={tag} onClick={() => navigate(`/search?searchTerm=${tag}&type=all`)} className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors">
                  {tag}
                </button>
              ))}
            </div>

            <button onClick={() => navigate('/search?ai=1')} className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 w-fit">
              <SparklesIcon className="w-4 h-4" />
              AI Explore
            </button>
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
          {categories.map((cat) => (
            <button key={cat.label} onClick={() => navigate(cat.category ? `/search?type=${cat.type}&category=${cat.category}` : `/search?type=${cat.type}`)} className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>

        {showAIInsights && aiRecommendations && (
          <SmartRecommendations recommendations={aiRecommendations} insights={aiInsights} loading={loadingProperties && loadingServices} onItemClick={onItemClick} />
        )}

        {recentlyAddedItems.length > 0 && (
          <section className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Recently added</h2>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {recentlyAddedItems.slice(0, 5).map((item) => (
                <div key={item._id} onClick={() => onItemClick(item, item.itemType)} className="flex-shrink-0 w-36 cursor-pointer">
                  <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-2 bg-gray-200">
                    <ImageGallery
                      imageUrls={item.imageUrls || []}
                      alt={item.name}
                      type={item.itemType === 'listing' ? 'property' : item.itemType}
                    />
                  </div>
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">R{item.price || item.regularPrice}</p>
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
              <div key={helper._id} onClick={() => navigate(`/helper/${helper._id}`)} className="flex-shrink-0 w-32 text-center cursor-pointer">
                <div className="relative w-32 h-32 mx-auto mb-2 aspect-square rounded-2xl overflow-hidden border-2 border-gray-50 bg-gray-100">
                  <ImageGallery
                    imageUrls={helper.imageUrls || []}
                    alt={helper.name}
                    type="avatar"
                  />
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                <p className="font-medium text-sm truncate">{helper.name}</p>
                <p className="text-xs text-gray-500 truncate">{helper.type}</p>
                <div className="flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold">R{helper.regularPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button onClick={() => {/* Open chat */ }} className="fixed bottom-24 right-4 bg-gray-900 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform z-50">
        <SparklesIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- Main Component ---
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiEngine = useRef(new AIRecommendationEngine());

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
      location: currentLocation,
      preferences: aiEngine.current.userPreferences
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

      // Determine search location
      const searchCoords = coords || POLOKWANE_COORDS;
      const detectedCity = city || (coords ? null : "Polokwane");
      const radius = DISTANCE_TIERS.EVERYWHERE; // Fetch all to allow frontend tiered filtering

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
                  title: `Showing listings in ${detectedCity || "your area"}`,
                  description: "Found immediate matches in your local area."
                });
              } else {
                const nearby = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.NEARBY, detectedCity);
                if (nearby.length > 0) {
                  setFeaturedProperties(nearby.slice(0, DATA_FETCH_LIMIT));
                  setLocationStatus({
                    title: `Showing listings within 50km of ${detectedCity || "your location"}`,
                    description: "No direct city matches found, showing nearby results."
                  });
                } else {
                  const regional = filterByDistanceTier(data, searchCoords, DISTANCE_TIERS.REGIONAL, detectedCity);
                  setFeaturedProperties(regional.slice(0, DATA_FETCH_LIMIT));
                  setLocationStatus({
                    title: `Showing results near ${detectedCity || "your location"}`,
                    description: "No local matches found, expanded search radius to 100km."
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
    />
  );
};

export default Home;