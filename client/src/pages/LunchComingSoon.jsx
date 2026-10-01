import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Users,
  PlusCircle,
  ChefHat,
  Phone,
  ShieldCheck,
  CreditCard,
  Bell,
  Sparkles,
  X,
  Building2,
  Calendar,
  AlertCircle,
  Star,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Lightbulb,
  ListPlus,
  Search,
  Edit3,
  Trash2,
  Filter,
  Check,
  ExternalLink
} from 'lucide-react';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  subscribeToShops,
  subscribeToOrders,
  createLunchOrder,
  createShop,
  addMealToShop,
  updateOrderStatus,
  createTableBooking,
  updateShop,
  updateMealInShop,
  deleteMealFromShop,
  rateShop
} from '../services/lunchService';
import {
  FOOD_EMOJIS,
  generateVendorMealAI
} from '../utils/aiLunchAssistant';

const formatPrice = (price) => `R${Number(price || 0).toFixed(2)}`;

const PRESET_MOODS = [
  { id: 'quick', label: '⚡ Quick Lunch' },
  { id: 'budget', label: '💰 Under R100' },
  { id: 'healthy', label: '🥗 Healthy & Fresh' },
  { id: 'comfort', label: '🍲 Comfort Food' },
];

export const VENDOR_DEFAULT_SIDES = [
  'Chakalaka',
  'Potatoes',
  'Spinach',
  'Sweet Potato',
  'Beets',
  'Cabbage',
  'Pumpkin',
  'Atchar',
  'Pap',
  'Salad'
];

export const getAvailableSides = (meal) => {
  if (!meal) return [];
  if (meal.sides && Array.isArray(meal.sides) && meal.sides.length > 0) {
    return meal.sides;
  }
  const text = ((meal.name || '') + ' ' + (meal.description || '')).trim();

  const found = new Set();
  const sideMatchers = [
    { name: 'Spinach', pattern: /spinach/i },
    { name: 'Beets', pattern: /beet|bedro[ts]/i },
    { name: 'Cabbage', pattern: /cabbage/i },
    { name: 'Pumpkin', pattern: /pumpkin/i },
    { name: 'Sweet Potatoes', pattern: /sweet\s*potato/i },
    { name: 'Mash Potatoes', pattern: /mash(?:ed)?\s*potato/i },
    { name: 'Potatoes', pattern: /(?<!sweet\s*)(?<!mash(?:ed)?\s*)potato(?:es)?|chips/i },
    { name: 'Chakalaka', pattern: /ch[au]k[au]laka/i },
    { name: 'Atchar', pattern: /at?char/i },
    { name: 'Salad', pattern: /salad/i },
    { name: 'Coleslaw', pattern: /coleslaw/i }
  ];

  sideMatchers.forEach((m) => {
    if (m.pattern.test(text)) found.add(m.name);
  });

  const nameHasPap = /\bpap\b/i.test(meal.name || '');
  if (!nameHasPap && /\bpap\b/i.test(text)) {
    found.add('Pap');
  }

  if (found.size >= 2) return Array.from(found);
  return [...VENDOR_DEFAULT_SIDES];
};

export const getMaxSides = (meal) => {
  if (!meal) return 3;
  const text = ((meal.name || '') + ' ' + (meal.description || '')).toLowerCase();
  if (/four\s*side/i.test(text)) return 4;
  if (/two\s*side/i.test(text)) return 2;
  return 3;
};

const SHOP_THEMES = [
  {
    id: 'amber',
    badge: 'bg-amber-500 text-white',
    badgeLight: 'bg-amber-100 text-amber-900 border border-amber-300',
    cardActive: 'border-amber-500 bg-gradient-to-br from-amber-50 via-white to-orange-50 ring-2 ring-amber-400 shadow-amber-500/25 shadow-lg',
    cardNormal: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-300',
    heroBg: 'from-amber-500 via-orange-500 to-rose-600 border-amber-400/50 text-white',
    heroGlow: 'bg-amber-300/35',
    btnPrimary: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 shadow-amber-500/30',
    tabActive: 'bg-amber-500 text-white shadow-md',
    accentText: 'text-amber-600',
    priceText: 'text-amber-700 font-black',
    accentBg: 'bg-amber-500'
  },
  {
    id: 'emerald',
    badge: 'bg-emerald-600 text-white',
    badgeLight: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    cardActive: 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-teal-50 ring-2 ring-emerald-400 shadow-emerald-500/25 shadow-lg',
    cardNormal: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300',
    heroBg: 'from-emerald-600 via-teal-600 to-cyan-600 border-emerald-400/50 text-white',
    heroGlow: 'bg-emerald-300/35',
    btnPrimary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30',
    tabActive: 'bg-emerald-600 text-white shadow-md',
    accentText: 'text-emerald-600',
    priceText: 'text-emerald-700 font-black',
    accentBg: 'bg-emerald-500'
  },
  {
    id: 'rose',
    badge: 'bg-rose-600 text-white',
    badgeLight: 'bg-rose-100 text-rose-900 border border-rose-300',
    cardActive: 'border-rose-500 bg-gradient-to-br from-rose-50 via-white to-orange-50 ring-2 ring-rose-400 shadow-rose-500/25 shadow-lg',
    cardNormal: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-rose-300',
    heroBg: 'from-rose-600 via-red-600 to-amber-500 border-rose-400/50 text-white',
    heroGlow: 'bg-rose-300/35',
    btnPrimary: 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 shadow-rose-500/30',
    tabActive: 'bg-rose-600 text-white shadow-md',
    accentText: 'text-rose-600',
    priceText: 'text-rose-700 font-black',
    accentBg: 'bg-rose-500'
  },
  {
    id: 'purple',
    badge: 'bg-purple-600 text-white',
    badgeLight: 'bg-purple-100 text-purple-900 border border-purple-300',
    cardActive: 'border-purple-500 bg-gradient-to-br from-purple-50 via-white to-pink-50 ring-2 ring-purple-400 shadow-purple-500/25 shadow-lg',
    cardNormal: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-300',
    heroBg: 'from-purple-600 via-indigo-600 to-rose-500 border-purple-400/50 text-white',
    heroGlow: 'bg-purple-300/35',
    btnPrimary: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-purple-500/30',
    tabActive: 'bg-purple-600 text-white shadow-md',
    accentText: 'text-purple-600',
    priceText: 'text-purple-700 font-black',
    accentBg: 'bg-purple-500'
  },
  {
    id: 'cyan',
    badge: 'bg-cyan-600 text-white',
    badgeLight: 'bg-cyan-100 text-cyan-900 border border-cyan-300',
    cardActive: 'border-cyan-500 bg-gradient-to-br from-cyan-50 via-white to-sky-50 ring-2 ring-cyan-400 shadow-cyan-500/25 shadow-lg',
    cardNormal: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-cyan-300',
    heroBg: 'from-sky-500 via-blue-600 to-teal-500 border-sky-400/50 text-white',
    heroGlow: 'bg-sky-300/35',
    btnPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/30',
    tabActive: 'bg-cyan-600 text-white shadow-md',
    accentText: 'text-cyan-600',
    priceText: 'text-cyan-700 font-black',
    accentBg: 'bg-cyan-500'
  }
];

function getShopTheme(shop) {
  if (!shop) return SHOP_THEMES[0];
  const str = String(shop.id || shop.name || 'default');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return SHOP_THEMES[hash % SHOP_THEMES.length];
}

// Visual Picture / Avatar resolver for Food Items on Receipts
export const getItemVisual = (it) => {
  if (!it) return { emoji: '🍱', isImage: false, src: '' };
  if (it.image && (typeof it.image === 'string') && (it.image.startsWith('http') || it.image.startsWith('/') || it.image.startsWith('data:'))) {
    return { emoji: '', isImage: true, src: it.image };
  }
  if (it.imageUrl && (typeof it.imageUrl === 'string') && (it.imageUrl.startsWith('http') || it.imageUrl.startsWith('/'))) {
    return { emoji: '', isImage: true, src: it.imageUrl };
  }
  if (it.image && typeof it.image === 'string' && it.image.length <= 4) {
    return { emoji: it.image, isImage: false, src: '' };
  }
  const name = String(it.name || '').toLowerCase();
  if (name.includes('kota') || name.includes('quarter') || name.includes('sphatlo') || name.includes('sandwich') || name.includes('dagwood')) {
    return { emoji: '🥪', isImage: false, src: '' };
  }
  if (name.includes('burger') || name.includes('patty') || name.includes('cheeseburger')) {
    return { emoji: '🍔', isImage: false, src: '' };
  }
  if (name.includes('pizza') || name.includes('slice')) {
    return { emoji: '🍕', isImage: false, src: '' };
  }
  if (name.includes('wing') || name.includes('chicken') || name.includes('drumstick') || name.includes('grilled chicken')) {
    return { emoji: '🍗', isImage: false, src: '' };
  }
  if (name.includes('chip') || name.includes('fries') || name.includes('slap chips')) {
    return { emoji: '🍟', isImage: false, src: '' };
  }
  if (name.includes('wrap') || name.includes('shawarma') || name.includes('burrito')) {
    return { emoji: '🌯', isImage: false, src: '' };
  }
  if (name.includes('drink') || name.includes('coke') || name.includes('soda') || name.includes('juice') || name.includes('beverage') || name.includes('water')) {
    return { emoji: '🥤', isImage: false, src: '' };
  }
  if (name.includes('steak') || name.includes('beef') || name.includes('ribs') || name.includes('pork') || name.includes('wors') || name.includes('braai')) {
    return { emoji: '🥩', isImage: false, src: '' };
  }
  if (name.includes('fish') || name.includes('hake') || name.includes('seafood') || name.includes('prawn')) {
    return { emoji: '🐟', isImage: false, src: '' };
  }
  if (name.includes('pap') || name.includes('stew') || name.includes('curry') || name.includes('mogodu') || name.includes('mala') || name.includes('samp')) {
    return { emoji: '🍲', isImage: false, src: '' };
  }
  if (name.includes('salad') || name.includes('greens') || name.includes('veg')) {
    return { emoji: '🥗', isImage: false, src: '' };
  }
  if (name.includes('cake') || name.includes('dessert') || name.includes('ice cream') || name.includes('waffle') || name.includes('donut')) {
    return { emoji: '🍰', isImage: false, src: '' };
  }
  return { emoji: it.image || '🍱', isImage: false, src: '' };
};

// Dynamic Receipt Themes (Distinct colored paper backgrounds for receipts)
export const RECEIPT_THEMES = [
  {
    id: 'amber',
    bg: 'bg-gradient-to-b from-[#fffbf2] via-[#ffffff] to-[#fff7e6] dark:from-[#211a10] dark:via-[#19150e] dark:to-[#14100b]',
    border: 'border-amber-400/90 dark:border-amber-700/80',
    barcodeText: 'text-amber-900/60 dark:text-amber-300/60',
    accentText: 'text-amber-950 dark:text-amber-200',
    stampBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
    codeBg: 'from-amber-600 via-orange-500 to-amber-600',
    headerBg: 'bg-amber-100/90 dark:bg-amber-900/40 text-amber-950 dark:text-amber-200 border-amber-300/60',
    priceText: 'text-amber-700 dark:text-amber-400',
    pill: 'bg-amber-500 text-white',
    ring: 'ring-amber-400/40'
  },
  {
    id: 'emerald',
    bg: 'bg-gradient-to-b from-[#f3fbf7] via-[#ffffff] to-[#e7f8ef] dark:from-[#0d1f16] dark:via-[#091710] dark:to-[#07130d]',
    border: 'border-emerald-400/90 dark:border-emerald-700/80',
    barcodeText: 'text-emerald-900/60 dark:text-emerald-300/60',
    accentText: 'text-emerald-950 dark:text-emerald-200',
    stampBg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
    codeBg: 'from-emerald-600 via-teal-500 to-emerald-600',
    headerBg: 'bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 border-emerald-300/60',
    priceText: 'text-emerald-700 dark:text-emerald-400',
    pill: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-400/40'
  },
  {
    id: 'terracotta',
    bg: 'bg-gradient-to-b from-[#fff6f0] via-[#ffffff] to-[#ffede0] dark:from-[#24150e] dark:via-[#1a0e08] dark:to-[#140b06]',
    border: 'border-orange-400/90 dark:border-orange-700/80',
    barcodeText: 'text-orange-900/60 dark:text-orange-300/60',
    accentText: 'text-orange-950 dark:text-orange-200',
    stampBg: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700',
    codeBg: 'from-orange-600 via-rose-500 to-orange-600',
    headerBg: 'bg-orange-100/90 dark:bg-orange-900/40 text-orange-950 dark:text-orange-200 border-orange-300/60',
    priceText: 'text-orange-700 dark:text-orange-400',
    pill: 'bg-orange-500 text-white',
    ring: 'ring-orange-400/40'
  },
  {
    id: 'violet',
    bg: 'bg-gradient-to-b from-[#fbf5ff] via-[#ffffff] to-[#f4e8ff] dark:from-[#1b1026] dark:via-[#130b1c] dark:to-[#0d0714]',
    border: 'border-purple-400/90 dark:border-purple-700/80',
    barcodeText: 'text-purple-900/60 dark:text-purple-300/60',
    accentText: 'text-purple-950 dark:text-purple-200',
    stampBg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
    codeBg: 'from-purple-600 via-indigo-500 to-purple-600',
    headerBg: 'bg-purple-100/90 dark:bg-purple-900/40 text-purple-950 dark:text-purple-200 border-purple-300/60',
    priceText: 'text-purple-700 dark:text-purple-400',
    pill: 'bg-purple-600 text-white',
    ring: 'ring-purple-400/40'
  },
  {
    id: 'cyan',
    bg: 'bg-gradient-to-b from-[#f0faff] via-[#ffffff] to-[#e0f4ff] dark:from-[#0e1d24] dark:via-[#09151c] dark:to-[#060f14]',
    border: 'border-sky-400/90 dark:border-sky-700/80',
    barcodeText: 'text-sky-900/60 dark:text-sky-300/60',
    accentText: 'text-sky-950 dark:text-sky-200',
    stampBg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700',
    codeBg: 'from-sky-600 via-blue-500 to-sky-600',
    headerBg: 'bg-sky-100/90 dark:bg-sky-900/40 text-sky-950 dark:text-sky-200 border-sky-300/60',
    priceText: 'text-sky-700 dark:text-sky-400',
    pill: 'bg-sky-600 text-white',
    ring: 'ring-sky-400/40'
  }
];

export const getReceiptTheme = (ord) => {
  if (!ord) return RECEIPT_THEMES[0];
  const str = String(ord.id || ord._id || ord.orderCode || 'receipt');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return RECEIPT_THEMES[hash % RECEIPT_THEMES.length];
};

// 1-Hour Preparation Countdown for Kitchen & Store Owner
export const isOneHourPrepRush = (ord) => {
  if (!ord || ord.status === 'Completed' || ord.status === 'Cancelled') return false;
  const now = Date.now();
  if (ord.scheduledFor) {
    const scheduledTime = new Date(ord.scheduledFor).getTime();
    if (!Number.isNaN(scheduledTime)) {
      const diffMinutes = (scheduledTime - now) / (1000 * 60);
      return diffMinutes <= 60 && diffMinutes >= -30;
    }
  }
  const createdTime = new Date(ord.createdAt || ord.date || now).getTime();
  const elapsedMinutes = (now - createdTime) / (1000 * 60);
  return ord.status === 'Pending' || (ord.status === 'Preparing' && elapsedMinutes >= 15);
};

// Overdue Collection Reminder (Customer collection prompt)
export const isCollectionOverdue = (ord) => {
  if (!ord || ord.status === 'Completed' || ord.status === 'Cancelled') return false;
  const now = Date.now();
  if (ord.scheduledFor) {
    const scheduledTime = new Date(ord.scheduledFor).getTime();
    if (!Number.isNaN(scheduledTime) && now > scheduledTime) {
      return true;
    }
  }
  if (ord.status === 'Ready for Collection') {
    const readyTime = new Date(ord.updatedAt || ord.createdAt || now).getTime();
    const elapsedMinutes = (now - readyTime) / (1000 * 60);
    return elapsedMinutes > 15;
  }
  return false;
};

// Formats Collection Date, Collection Time, and Placed Date/Time for receipts
export const formatCollectionDateTime = (ord) => {
  if (!ord) {
    return {
      dateStr: 'Today',
      timeStr: 'ASAP',
      placedStr: 'Recently',
      full: 'Today ASAP',
      label: 'Collection Time',
      badgeTone: 'bg-amber-100 text-amber-900 border-amber-300',
      isScheduled: false
    };
  }

  // If customer scheduled a specific future date and time
  if (ord.scheduledFor) {
    const scheduledDate = new Date(ord.scheduledFor);
    if (!Number.isNaN(scheduledDate.getTime())) {
      const dateStr = scheduledDate.toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const placedStr = ord.createdAt
        ? new Date(ord.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        : 'Earlier';

      return {
        dateStr,
        timeStr,
        placedStr,
        full: `${dateStr} at ${timeStr}`,
        label: 'Scheduled Collection',
        badgeTone: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200',
        isScheduled: true
      };
    }
  }

  // Default immediate pickup (calc ~20-30 min prep)
  const created = new Date(ord.createdAt || ord.date || Date.now());
  const dateStr = created.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const estPickup = new Date(created.getTime() + 25 * 60 * 1000);
  const timeStr = `~${estPickup.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const placedStr = `${dateStr}, ${created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return {
    dateStr,
    timeStr,
    placedStr,
    full: `${dateStr} at ${timeStr} (Est. ~25 min prep)`,
    label: 'Estimated Collection',
    badgeTone: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200',
    isScheduled: false
  };
};

export default function LunchComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user || {});

  // Ref for the horizontal shop slider
  const shopSliderRef = useRef(null);
  const scrollShops = (dir) => {
    if (shopSliderRef.current) {
      shopSliderRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  // Track whether we've auto-set the initial shop selection (prevents stale-closure reset)
  const hasInitializedShopRef = useRef(false);

  // Ref for the horizontal meals/menu slider
  const menuSliderRef = useRef(null);
  const scrollMenu = (dir) => {
    if (menuSliderRef.current) {
      menuSliderRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
    }
  };

  // ── 3 Primary Navigation Tabs: 'orders' (Customer Order Food Manager) | 'my-menu' (Your Menus) | 'other-shops' (Other Shops & Menus)
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.tab) return location.state.tab;
    if (location.state?.selectedShopId) return 'other-shops';
    return 'explore'; // Default: Customer-first food browsing & ordering!
  });

  // Filter & Search states for orders & menus
  const [orderFilterTab, setOrderFilterTab] = useState('all'); // 'all' | 'pending' | 'preparing' | 'ready' | 'completed'
  const [orderSearchText, setOrderSearchText] = useState('');
  const [myMenuSearchText, setMyMenuSearchText] = useState('');
  const [myMenuTagFilter, setMyMenuTagFilter] = useState('All');

  // Customer state
  const [orderMode, setOrderMode] = useState('order'); // 'order' or 'table'
  const [fulfilment] = useState('pickup');
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedMealSides, setSelectedMealSides] = useState({});
  const [orders, setOrders] = useState([]);
  const [notice, setNotice] = useState(null);

  // AI Matchmaker states
  const [showAiLunchSection, setShowAiLunchSection] = useState(false);
  const [selectedMood, setSelectedMood] = useState('quick');
  const [customFoodQuery, setCustomFoodQuery] = useState('');
  const [aiMealMatches, setAiMealMatches] = useState([]);
  const [aiRecommendationIndex, setAiRecommendationIndex] = useState(0);

  const handleRunAiMatchmaker = (mood, query = '') => {
    setSelectedMood(mood);
    if (query) setCustomFoodQuery(query);
    setAiRecommendationIndex(0);
  };

  // Form states for checkout & delivery
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showBasketPreview, setShowBasketPreview] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customerName: currentUser?.username || currentUser?.name || '',
    customerPhone: currentUser?.phone || '',
    deliveryAddress: currentUser?.address || '',
    deliveryNotes: '',
    orderComments: '',
    scheduledFor: '',
    paymentMethod: 'counter' // 'counter' | 'delivery' | 'online'
  });

  // Table booking state
  const [booking, setBooking] = useState({ date: '', time: '12:30', guests: '2', name: currentUser?.username || '', phone: '' });

  // Shop Owner Modals
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopForm, setNewShopForm] = useState({
    name: '',
    cuisine: '',
    distance: '1.5 km',
    time: '20–30 min',
    image: '🥙',
    address: '',
    phone: '',
    whatsapp: '',
    operatingHours: {
      openTime: '08:00',
      closeTime: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    isOpen: true
  });

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMealForm, setNewMealForm] = useState({
    name: '',
    description: '',
    price: '',
    tag: 'Popular',
    image: '🍱',
    sides: [...VENDOR_DEFAULT_SIDES]
  });

  // Edit states
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [editShopForm, setEditShopForm] = useState({
    id: '',
    name: '',
    cuisine: '',
    distance: '',
    time: '',
    image: '',
    address: '',
    phone: '',
    whatsapp: '',
    operatingHours: {
      openTime: '08:00',
      closeTime: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    isOpen: true
  });

  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [editMealForm, setEditMealForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    tag: 'Popular',
    image: '🍱',
    sides: [...VENDOR_DEFAULT_SIDES]
  });

  // Selected Order for Receipt Modal
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

  // Contact Card Modal
  const [showContactCard, setShowContactCard] = useState(false);

  // Rating states
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingTargetOrder, setRatingTargetOrder] = useState(null);
  const [shopRating, setShopRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showReviewsTab, setShowReviewsTab] = useState(false);

  // "View More" toggles for orders
  const [showAllKitchenQueue, setShowAllKitchenQueue] = useState(false);
  const [showAllCompletedOrders, setShowAllCompletedOrders] = useState(false);
  const [showAllCustomerReceipts, setShowAllCustomerReceipts] = useState(false);
  const [showPastCustomerReceipts, setShowPastCustomerReceipts] = useState(false);

  // Customer menu discovery controls
  const [menuSearch, setMenuSearch] = useState('');
  const [menuTagFilter, setMenuTagFilter] = useState('All');

  const handleAiAutoFillMeal = (isEdit = false) => {
    const targetForm = isEdit ? editMealForm : newMealForm;
    const aiResult = generateVendorMealAI(targetForm.name);
    if (isEdit) {
      setEditMealForm(prev => ({
        ...prev,
        name: aiResult.name,
        description: aiResult.description,
        price: aiResult.price,
        tag: aiResult.tag,
        image: aiResult.image
      }));
    } else {
      setNewMealForm(prev => ({
        ...prev,
        name: aiResult.name,
        description: aiResult.description,
        price: aiResult.price,
        tag: aiResult.tag,
        image: aiResult.image
      }));
    }
  };

  // Handle Submit Rating
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingTargetOrder) return;
    const orderId = ratingTargetOrder.id || ratingTargetOrder._id;
    try {
      if (ratingTargetOrder.status !== 'Completed') {
        try {
          await updateOrderStatus(orderId, 'Completed');
        } catch {
          // ignore if already completed
        }
      }
      await rateShop(ratingTargetOrder.shopId, {
        orderId: orderId,
        shopRating,
        foodRating,
        comment: ratingComment,
        userName: currentUser?.username || currentUser?.name || 'Valued Customer'
      });
      setShowRateModal(false);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, isRated: true, status: 'Completed' } : o));
      // Close receipt modal so it completely disappears from the screen
      setActiveReceiptOrder(null);
      setNotice({ type: 'success', message: '⭐ Thank you for rating! Receipt archived to Dashboard & Order History.' });
      setRatingComment('');
    } catch (err) {
      console.error("Rate shop error:", err);
      // Ensure rating modal closes and receipt modal closes so user isn't trapped
      setShowRateModal(false);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, isRated: true, status: 'Completed' } : o));
      setActiveReceiptOrder(null);
      setNotice({ type: 'success', message: '⭐ Thank you! Your review has been saved and archived.' });
      setRatingComment('');
    }
  };

  // Handle Order Status Progression (Received -> Preparing Food -> Ready for Collection -> Collected)
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!orderId) return;
    try {
      await updateOrderStatus(orderId, newStatus);
      // Optimistically update orders in local state
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === orderId || o._id === orderId)
            ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
            : o
        )
      );
      if (activeReceiptOrder && (activeReceiptOrder.id === orderId || activeReceiptOrder._id === orderId)) {
        setActiveReceiptOrder((prev) =>
          prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null
        );
      }
      if (newStatus === 'Completed') {
        setNotice({
          type: 'success',
          message: '🎉 Order confirmed as Collected! Hope you enjoy your meal.'
        });
        const target = orders.find((o) => o.id === orderId || o._id === orderId) || activeReceiptOrder;
        if (target && !target.isRated) {
          setRatingTargetOrder({ ...target, status: 'Completed' });
          setShowRateModal(true);
        }
      } else {
        setNotice({
          type: 'success',
          message: `Order status updated to "${newStatus}".`
        });
      }
    } catch (err) {
      console.error("Update order status error:", err);
      // Optimistic fallback for immediate UX
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === orderId || o._id === orderId)
            ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
            : o
        )
      );
      if (activeReceiptOrder && (activeReceiptOrder.id === orderId || activeReceiptOrder._id === orderId)) {
        setActiveReceiptOrder((prev) =>
          prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null
        );
      }
      if (newStatus === 'Completed') {
        const target = orders.find((o) => o.id === orderId || o._id === orderId) || activeReceiptOrder;
        if (target && !target.isRated) {
          setRatingTargetOrder({ ...target, status: 'Completed' });
          setShowRateModal(true);
        }
      }
    }
  };

  // Public menu polling and authenticated, private order polling.
  useEffect(() => {
    const unsubscribeShops = subscribeToShops((fetchedShops) => {
      setShops(fetchedShops);
      // Only auto-select the first shop once on initial load.
      // Using a ref avoids the stale-closure bug where selectedShopId
      // would always read '' inside this callback, resetting the user's pick.
      if (fetchedShops.length > 0 && !hasInitializedShopRef.current) {
        hasInitializedShopRef.current = true;
        const targetId = location.state?.selectedShopId;
        const matched = targetId && fetchedShops.find(s => String(s.id || s._id) === String(targetId));
        setSelectedShopId(matched ? (matched.id || matched._id) : fetchedShops[0].id);
      }
    });

    const unsubscribeOrders = currentUser ? subscribeToOrders((fetchedOrders) => setOrders(fetchedOrders)) : () => setOrders([]);

    return () => {
      unsubscribeShops();
      unsubscribeOrders();
    };
  }, [currentUser?._id]);

  // Sync default user details when available
  useEffect(() => {
    if (currentUser) {
      setCheckoutData((prev) => ({
        ...prev,
        customerName: prev.customerName || currentUser.username || currentUser.name || 'Valued Customer',
        customerPhone: prev.customerPhone || currentUser.phone || ''
      }));
      setBooking((prev) => ({
        ...prev,
        name: prev.name || currentUser.username || currentUser.name || ''
      }));
    }
  }, [currentUser?._id]);

  // Handle direct navigation to register route or action parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isRegister =
      location.pathname.endsWith('/register') ||
      searchParams.get('action') === 'register' ||
      searchParams.get('register') === 'true';

    if (isRegister) {
      if (currentUser) {
        setShowAddShopModal(true);
      } else {
        navigate('/sign-in?redirect=' + encodeURIComponent(location.pathname + location.search));
      }
    }
  }, [location.pathname, location.search, currentUser, navigate]);

  // Selected active shop
  const currentShop = useMemo(() => {
    return shops.find((s) => s.id === selectedShopId) || shops[0] || null;
  }, [shops, selectedShopId]);

  // A closed shop remains visible, but customers cannot change or submit an order.
  const isCurrentShopClosed = currentShop?.isOpen === false;

  const menuTags = useMemo(() => ['All', ...new Set((currentShop?.meals || []).map((meal) => meal.tag).filter(Boolean))], [currentShop]);
  const visibleMeals = useMemo(() => {
    const search = menuSearch.trim().toLowerCase();
    return (currentShop?.meals || []).filter((meal) => {
      const matchesTag = menuTagFilter === 'All' || meal.tag === menuTagFilter;
      const matchesSearch = !search || `${meal.name || ''} ${meal.description || ''} ${meal.tag || ''}`.toLowerCase().includes(search);
      return matchesTag && matchesSearch;
    });
  }, [currentShop, menuSearch, menuTagFilter]);

  // Unique Color Theme for the active selected shop
  const activeTheme = useMemo(() => {
    return getShopTheme(currentShop);
  }, [currentShop]);

  // Total cart calculation
  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Shops that belong to the currently logged-in user
  const myShops = useMemo(() => {
    if (!currentUser) return [];
    const uid = String(currentUser._id || currentUser.id || 'guest');
    return shops.filter((s) => String(s.ownerId || '') === uid);
  }, [shops, currentUser]);

  // Whether the current user owns at least one shop
  const isShopOwner = myShops.length > 0;

  // The shop selected on the dashboard (only owner's shops if owner, else fallback to selected or first shop)
  const dashboardShop = useMemo(() => {
    if (myShops.length > 0) {
      return myShops.find((s) => (s.id || s._id) === selectedShopId) || myShops[0];
    }
    return shops.find((s) => (s.id || s._id) === selectedShopId) || shops[0] || null;
  }, [myShops, selectedShopId, shops]);

  // Whether the current user is the owner/manager of the active dashboard shop
  const isCurrentShopOwner = useMemo(() => {
    if (!currentUser || !dashboardShop) return false;
    const uid = String(currentUser._id || currentUser.id || '');
    return Boolean(uid && (String(dashboardShop.ownerId || '') === uid || currentUser.isAdmin || currentUser.role === 'admin'));
  }, [currentUser, dashboardShop]);

  // Other shops (excluding the current user's active dashboard shop)
  const otherShops = useMemo(() => {
    if (!dashboardShop) return shops;
    const shopIdStr = String(dashboardShop.id || dashboardShop._id || '');
    const filtered = shops.filter((s) => String(s.id || s._id || '') !== shopIdStr);
    return filtered.length > 0 ? filtered : shops;
  }, [shops, dashboardShop]);

  // Filter active (uncompleted) orders for customer view receipt section
  const myCustomerOrders = useMemo(() => {
    if (!currentUser) return [];
    const uid = String(currentUser?._id || currentUser?.id || '');
    return orders.filter((o) => {
      const matchId = uid && String(o.customerId || o.customer?._id || o.userId || '') === uid;
      const matchPhone = currentUser?.phone && o.customerPhone && o.customerPhone === currentUser.phone;
      return (matchId || matchPhone) && o.status !== 'Completed';
    });
  }, [orders, currentUser]);

  // Completed orders for customer past history / receipts
  const myCompletedCustomerOrders = useMemo(() => {
    if (!currentUser) return [];
    const uid = String(currentUser?._id || currentUser?.id || '');
    return orders.filter((o) => {
      const matchId = uid && String(o.customerId || o.customer?._id || o.userId || '') === uid;
      const matchPhone = currentUser?.phone && o.customerPhone && o.customerPhone === currentUser.phone;
      return (matchId || matchPhone) && o.status === 'Completed';
    });
  }, [orders, currentUser]);

  // All orders for the current dashboard shop
  const activeShopOrders = useMemo(() => {
    if (!dashboardShop) return [];
    const shopIdStr = String(dashboardShop.id || dashboardShop._id || '');
    return orders.filter((o) => String(o.shopId || '') === shopIdStr);
  }, [orders, dashboardShop]);

  const pendingOrders = useMemo(() => activeShopOrders.filter((o) => o.status === 'Pending'), [activeShopOrders]);
  const preparingOrders = useMemo(() => activeShopOrders.filter((o) => o.status === 'Preparing'), [activeShopOrders]);
  const readyOrders = useMemo(() => activeShopOrders.filter((o) => o.status === 'Ready for Collection'), [activeShopOrders]);
  const completedOrders = useMemo(() => activeShopOrders.filter((o) => o.status === 'Completed'), [activeShopOrders]);

  const pendingOrdersCount = pendingOrders.length;
  const preparingOrdersCount = preparingOrders.length;
  const readyOrdersCount = readyOrders.length;
  const completedOrdersCount = completedOrders.length;

  const filteredShopOrders = useMemo(() => {
    let list = activeShopOrders;
    if (orderFilterTab === 'pending') {
      list = pendingOrders;
    } else if (orderFilterTab === 'preparing') {
      list = preparingOrders;
    } else if (orderFilterTab === 'ready') {
      list = readyOrders;
    } else if (orderFilterTab === 'completed') {
      list = completedOrders;
    }
    if (orderSearchText.trim()) {
      const q = orderSearchText.toLowerCase();
      list = list.filter((o) =>
        (o.orderCode || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q) ||
        (o.items || []).some((it) => (it.name || '').toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeShopOrders, orderFilterTab, orderSearchText, pendingOrders, preparingOrders, readyOrders, completedOrders]);

  const myMenuTags = useMemo(() => {
    const tags = new Set((dashboardShop?.meals || []).map((m) => m.tag).filter(Boolean));
    return ['All', ...tags];
  }, [dashboardShop]);

  const visibleMyMeals = useMemo(() => {
    const search = myMenuSearchText.trim().toLowerCase();
    return (dashboardShop?.meals || []).filter((meal) => {
      const matchesTag = myMenuTagFilter === 'All' || meal.tag === myMenuTagFilter;
      const matchesSearch = !search || `${meal.name || ''} ${meal.description || ''} ${meal.tag || ''}`.toLowerCase().includes(search);
      return matchesTag && matchesSearch;
    });
  }, [dashboardShop, myMenuSearchText, myMenuTagFilter]);

  // Live kitchen queue for shop owner (uncompleted orders)
  const liveKitchenQueue = useMemo(() => {
    return activeShopOrders.filter((o) => o.status !== 'Completed');
  }, [activeShopOrders]);

  // Active kitchen queue for currently selected shop (visible to all customers)
  const activeKitchenOrders = useMemo(() => {
    if (!currentShop) return [];
    return orders.filter((o) => o.shopId === currentShop.id && o.status !== 'Completed');
  }, [orders, currentShop]);

  // Completed orders history for shop owner
  const completedStoreOrders = completedOrders;

  // 1-Hour Preparation Rush Orders for Chef & Store Owner
  const rushOrdersCount = useMemo(() => {
    return liveKitchenQueue.filter(isOneHourPrepRush).length;
  }, [liveKitchenQueue]);

  // Customer orders waiting at counter past collection time
  const customerOverdueOrders = useMemo(() => {
    return myCustomerOrders.filter(isCollectionOverdue);
  }, [myCustomerOrders]);

  // Turn the owner's real menu, order and review data into a short, actionable plan.
  const shopInsights = useMemo(() => {
    if (!dashboardShop) return [];

    const meals = dashboardShop.meals || [];
    const completedOrders = activeShopOrders.filter((order) => order.status === 'Completed');
    const mealSales = completedOrders.flatMap((order) => order.items || []).reduce((totals, item) => {
      totals[item.name] = (totals[item.name] || 0) + Number(item.quantity || 0);
      return totals;
    }, {});
    const bestSeller = Object.entries(mealSales).sort(([, a], [, b]) => b - a)[0];
    const reviews = dashboardShop.reviews || [];
    const averageRating = reviews.length
      ? reviews.reduce((total, review) => total + Number(review.shopRating || review.rating || 0), 0) / reviews.length
      : Number(dashboardShop.rating || 0);
    const insights = [];

    if (dashboardShop.isOpen === false) {
      insights.push({ title: 'Reopen when you can serve orders', detail: 'Your menu remains visible, but customers cannot buy while the shop is closed.', tone: 'amber' });
    }
    if (meals.length < 4) {
      insights.push({ title: 'Expand your menu to at least 4 choices', detail: 'Add a value meal, a popular main, a vegetarian option and a drink or side so more customers find something suitable.', tone: 'violet' });
    }
    if (meals.some((meal) => !meal.description?.trim())) {
      insights.push({ title: 'Add descriptions to every menu item', detail: 'Briefly name the key ingredients, portion or heat level to make customers more confident before ordering.', tone: 'sky' });
    }
    if (bestSeller) {
      insights.push({ title: `Promote ${bestSeller[0]}`, detail: `It is your top completed-order item (${bestSeller[1]} sold). Feature it as “Popular” and pair it with a drink or side.`, tone: 'emerald' });
    } else {
      insights.push({ title: 'Create your first repeatable bestseller', detail: 'Start with one clearly priced signature meal, keep it available daily and ask early customers for feedback.', tone: 'emerald' });
    }
    if (!reviews.length) {
      insights.push({ title: 'Ask customers for a quick review', detail: 'After each completed order, invite feedback. Reviews build trust and show what to improve next.', tone: 'rose' });
    } else if (averageRating > 0 && averageRating < 4) {
      insights.push({ title: 'Follow up on customer feedback', detail: `Your average rating is ${averageRating.toFixed(1)}/5. Check recent comments for recurring issues with quality, portions or delivery time.`, tone: 'rose' });
    }

    return insights.slice(0, 4);
  }, [dashboardShop, activeShopOrders]);

  // Revenue belongs only to the selected shop and is counted when an order is completed.
  const revenueSummary = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Weeks run Monday through Sunday.
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueSince = (startDate) => completedStoreOrders.reduce((total, order) => {
      const completedAt = new Date(order.completedAt || order.updatedAt || order.createdAt);
      return !Number.isNaN(completedAt.getTime()) && completedAt >= startDate
        ? total + Number(order.total || 0)
        : total;
    }, 0);

    return {
      daily: revenueSince(startOfToday),
      weekly: revenueSince(startOfWeek),
      monthly: revenueSince(startOfMonth)
    };
  }, [completedStoreOrders]);


  // Sides operations
  const getActiveSides = (meal, availableSides, maxSides = 3) => {
    if (selectedMealSides[meal.id] !== undefined) {
      return selectedMealSides[meal.id];
    }
    return availableSides.slice(0, maxSides);
  };

  const toggleSideForMeal = (mealId, side, availableSides, maxSides = 3) => {
    setSelectedMealSides((prev) => {
      const current = prev[mealId] !== undefined ? prev[mealId] : availableSides.slice(0, maxSides);
      if (current.includes(side)) {
        return { ...prev, [mealId]: current.filter((s) => s !== side) };
      }
      if (current.length < maxSides) {
        return { ...prev, [mealId]: [...current, side] };
      }
      return { ...prev, [mealId]: [...current.slice(1), side] };
    });
  };

  // Cart operations
  const addToCart = (meal) => {
    if (currentShop?.isOpen === false) {
      setNotice({ type: 'error', message: `${currentShop.name} is currently closed and cannot accept orders.` });
      return;
    }
    if (meal.isAvailable === false) {
      setNotice({ type: 'error', message: `${meal.name} is sold out.` });
      return;
    }

    const availableSides = getAvailableSides(meal);
    const maxSides = getMaxSides(meal);
    const chosenSides = availableSides.length > 0
      ? getActiveSides(meal, availableSides, maxSides)
      : (meal.sides || []);

    const cartKey = meal.id + (chosenSides.length ? '-' + chosenSides.slice().sort().join('-') : '');

    setCart((items) => {
      const existingIndex = items.findIndex((item) => (item.cartKey && item.cartKey === cartKey) || (item.id === meal.id && JSON.stringify(item.sides || []) === JSON.stringify(chosenSides)));
      if (existingIndex > -1) {
        return items.map((item, idx) => idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { ...meal, sides: chosenSides, cartKey, quantity: 1 }];
    });
    // Auto-show basket preview popup
    setShowBasketPreview(true);
  };

  const updateQuantity = (cartKeyOrId, change) => {
    if (isCurrentShopClosed) return;

    setCart((items) =>
      items
        .map((item) => {
          const isMatch = (item.cartKey && item.cartKey === cartKeyOrId) || item.id === cartKeyOrId;
          return isMatch ? { ...item, quantity: item.quantity + change } : item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Submit Food Order to Firestore
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart.length || !currentShop) return;
    if (!currentUser) { navigate('/sign-in'); return; }

    if (currentShop.isOpen === false) {
      setNotice({ type: 'error', message: `${currentShop.name} is currently closed and cannot accept orders.` });
      setShowCheckoutModal(false);
      return;
    }
    const unavailableItem = cart.find((item) =>
      currentShop.meals?.find((meal) => meal.id === item.id)?.isAvailable === false
    );
    if (unavailableItem) {
      setNotice({ type: 'error', message: `${unavailableItem.name} is sold out. Remove it from your basket before ordering.` });
      setShowCheckoutModal(false);
      return;
    }

    if (!checkoutData.customerPhone) {
      alert("Please provide a contact phone number so the shop and delivery driver can reach you.");
      return;
    }

    try {
      const orderPayload = {
        customerName: checkoutData.customerName || 'Valued Customer',
        customerPhone: checkoutData.customerPhone,
        shopId: currentShop.id,
        shopName: currentShop.name,
        shopImage: currentShop.image || '🍱',
        items: cart,
        total: totalCartPrice,
        fulfilment,
        orderComments: checkoutData.orderComments,
        scheduledFor: checkoutData.scheduledFor || null
      };

      const created = await createLunchOrder(orderPayload);
      setCart([]);
      setCheckoutData((previous) => ({ ...previous, orderComments: '' }));
      setShowCheckoutModal(false);
      setActiveReceiptOrder(created);

      setNotice({
        type: 'success',
        message: `Order #${created.orderCode} placed successfully! ${'Pay at the store counter upon pickup.'
          }`
      });
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  // Submit Table Reservation
  const handleTableBooking = async (e) => {
    e.preventDefault();
    if (!booking.name || !booking.date || !currentShop) return;
    if (!currentUser) { navigate('/sign-in'); return; }
    if (isCurrentShopClosed) {
      setNotice({ type: 'error', message: `${currentShop.name} is currently closed and cannot accept table requests.` });
      return;
    }
    try {
      await createTableBooking({
        ...booking,
        shopId: currentShop.id,
        shopName: currentShop.name,
      });
      setNotice({
        type: 'success',
        message: `Table request submitted to ${currentShop.name} for ${booking.guests} guests on ${booking.date} at ${booking.time}.`
      });
      setBooking({ date: '', time: '12:30', guests: '2', name: currentUser?.username || '', phone: '' });
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  // Handle Add Shop Modal Submit
  const handleCreateShopSubmit = async (e) => {
    e.preventDefault();
    if (!newShopForm.name) return;
    if (!currentUser) { navigate('/sign-in'); return; }
    try {
      const newShopId = await createShop({
        ...newShopForm,
        ownerName: currentUser?.username || 'Store Manager'
      });
      setShowAddShopModal(false);
      setSelectedShopId(newShopId);
      setNotice({ type: 'success', message: `Shop "${newShopForm.name.trim()}" created successfully!` });
      setNewShopForm({ name: '', cuisine: '', distance: '1.5 km', time: '20–30 min', image: '🥙', address: '', phone: '', whatsapp: '' });
    } catch (err) {
      console.error("Create shop error:", err);
      setNotice({
        type: 'error',
        message: err.message || `A shop with the name "${newShopForm.name}" already exists.`
      });
    }
  };

  // Handle Add Meal Modal Submit
  const handleAddMealSubmit = async (e) => {
    e.preventDefault();
    const targetShopId = dashboardShop ? (dashboardShop.id || dashboardShop._id) : selectedShopId;
    if (!newMealForm.name || !newMealForm.price || !targetShopId) return;
    try {
      const added = await addMealToShop(targetShopId, newMealForm);
      if (added) {
        setShops((prev) =>
          prev.map((s) => {
            if ((s.id || s._id) === targetShopId) {
              return {
                ...s,
                meals: [...(s.meals || []), added]
              };
            }
            return s;
          })
        );
      }
      setShowAddMealModal(false);
      setNewMealForm({ name: '', description: '', price: '', tag: 'Popular', image: '🍱', sides: [...VENDOR_DEFAULT_SIDES] });
      setNotice({ type: 'success', message: `Meal "${newMealForm.name}" added to menu!` });
    } catch (err) {
      console.error("Add meal error:", err);
      setNotice({ type: 'error', message: err.message || 'Error adding meal' });
    }
  };

  // Handle Edit Shop Submit
  const handleEditShopSubmit = async (e) => {
    e.preventDefault();
    if (!editShopForm.name || !editShopForm.id) return;
    try {
      await updateShop(editShopForm.id, editShopForm);
      setShops((prev) =>
        prev.map((s) => (s.id || s._id) === editShopForm.id ? { ...s, ...editShopForm } : s)
      );
      setShowEditShopModal(false);
      setNotice({ type: 'success', message: `Shop "${editShopForm.name}" updated successfully!` });
    } catch (err) {
      console.error("Edit shop error:", err);
      setNotice({ type: 'error', message: err.message || 'Error updating shop' });
    }
  };

  // Handle Edit Meal Submit
  const handleEditMealSubmit = async (e) => {
    e.preventDefault();
    const targetShopId = dashboardShop ? (dashboardShop.id || dashboardShop._id) : selectedShopId;
    if (!editMealForm.name || !editMealForm.id || !targetShopId) return;
    try {
      await updateMealInShop(targetShopId, editMealForm.id, editMealForm);
      setShops((prev) =>
        prev.map((s) => {
          if ((s.id || s._id) === targetShopId) {
            return {
              ...s,
              meals: (s.meals || []).map((m) =>
                m.id === editMealForm.id ? { ...m, ...editMealForm } : m
              )
            };
          }
          return s;
        })
      );
      setShowEditMealModal(false);
      setNotice({ type: 'success', message: `Meal "${editMealForm.name}" updated successfully!` });
    } catch (err) {
      console.error("Edit meal error:", err);
      setNotice({ type: 'error', message: err.message || 'Error updating meal' });
    }
  };

  // Handle Delete Meal
  const handleDeleteMeal = async (mealId, mealName) => {
    if (!window.confirm(`Are you sure you want to delete "${mealName}" from the menu?`)) return;
    const targetShopId = dashboardShop ? (dashboardShop.id || dashboardShop._id) : selectedShopId;
    try {
      await deleteMealFromShop(targetShopId, mealId);
      setShops((prev) =>
        prev.map((s) => {
          if ((s.id || s._id) === targetShopId) {
            return {
              ...s,
              meals: (s.meals || []).filter((m) => m.id !== mealId)
            };
          }
          return s;
        })
      );
      setNotice({ type: 'success', message: `Meal "${mealName}" deleted from menu.` });
    } catch (err) {
      console.error("Delete meal error:", err);
      setNotice({ type: 'error', message: err.message || 'Error deleting meal' });
    }
  };

  // Toggle meal availability (In Stock / Sold Out)
  const handleToggleMealAvailability = async (meal) => {
    if (!dashboardShop || !meal) return;
    const newIsAvailable = meal.isAvailable === false;
    const shopId = dashboardShop.id || dashboardShop._id;
    try {
      await updateMealInShop(shopId, meal.id, {
        isAvailable: newIsAvailable
      });
      setShops((prev) =>
        prev.map((s) => {
          if ((s.id || s._id) === shopId) {
            return {
              ...s,
              meals: (s.meals || []).map((m) =>
                m.id === meal.id ? { ...m, isAvailable: newIsAvailable } : m
              )
            };
          }
          return s;
        })
      );
      setNotice({
        type: 'success',
        message: `Meal "${meal.name}" marked as ${newIsAvailable ? 'Available' : 'Sold Out'}.`
      });
    } catch (err) {
      console.error('Toggle meal availability error:', err);
      setNotice({ type: 'error', message: 'Failed to update meal availability.' });
    }
  };

  // Toggle shop Open / Closed
  const handleToggleShopOpen = async (shop) => {
    if (!shop) return;
    const uid = String(currentUser?._id || currentUser?.id || '');
    const isOwnerOfShop = Boolean(
      uid && (String(shop.ownerId || '') === uid || currentUser?.isAdmin || currentUser?.role === 'admin')
    );
    if (!isOwnerOfShop) {
      setNotice({
        type: 'error',
        message: `You do not manage "${shop.name || 'this shop'}". Only the registered owner can change its open/closed status.`
      });
      return;
    }

    const shopId = shop.id || shop._id;
    // Existing shops without an explicit value are treated as open by the UI.
    const newIsOpen = shop.isOpen === false;
    try {
      await updateShop(shopId, { isOpen: newIsOpen });
      setShops((prev) =>
        prev.map((s) => ((s.id || s._id) === shopId ? { ...s, isOpen: newIsOpen } : s))
      );
      setNotice({
        type: 'success',
        message: newIsOpen
          ? `✅ ${shop.name} is now OPEN — customers can place orders!`
          : `🔴 ${shop.name} is now CLOSED — orders paused.`
      });
    } catch (err) {
      console.error('Toggle open error:', err);
      setNotice({ type: 'error', message: err.message || 'Failed to update shop status. Please try again.' });
    }
  };

  return (
    <main className={`app-safe-top min-h-screen app-safe-content-bottom ${cart.length > 0 ? 'pb-28 sm:pb-24' : 'pb-12 sm:pb-8'} bg-gray-50 dark:bg-gray-950 px-3 py-4 sm:px-6 w-full max-w-full overflow-x-hidden`}>
      <div className="mx-auto max-w-5xl w-full">

        {/* ── CLEAN HEADER ── */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-500" />
                Food Hub
              </h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Browse menus · Order food · Track orders</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (currentUser) setShowAddShopModal(true);
              else navigate('/sign-in?redirect=' + encodeURIComponent(location.pathname));
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Register Shop
          </button>
        </div>

        {/* ── NOTICE BANNER ── */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-4 flex items-center justify-between gap-3 rounded-xl p-3 text-sm font-medium shadow-sm ring-1 ${
                notice.type === 'error'
                  ? 'bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800'
                  : notice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800'
                    : 'bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span>{notice.message}</span>
              </div>
              <button type="button" onClick={() => setNotice(null)} className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 rounded-xl p-1 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 mb-5 overflow-x-auto">
          {[
            { key: 'explore', label: 'Browse Food', icon: <Store className="h-4 w-4" /> },
            { key: 'orders', label: 'My Orders', icon: <ShoppingBag className="h-4 w-4" />, badge: myCustomerOrders.length || null },
            ...(isShopOwner ? [{ key: 'my-shop', label: 'My Shop', icon: <ChefHat className="h-4 w-4" />, badge: liveKitchenQueue.length || null }] : [])
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB: BROWSE FOOD (explore / other-shops)             */}
        {/* ══════════════════════════════════════════════════════ */}
        {(activeTab === 'explore' || activeTab === 'other-shops') && (
          <div className="space-y-5">

            {/* Shop Selector — Horizontal scroll */}
            {shops.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                  <Store className="h-4 w-4 text-amber-500" /> Restaurants & Food Shops
                  <span className="text-[10px] font-medium text-gray-400">({shops.length})</span>
                </h2>
                <div
                  ref={shopSliderRef}
                  className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {shops.map((shop) => {
                    const isSelected = (shop.id || shop._id) === selectedShopId;
                    const isClosed = shop.isOpen === false;
                    return (
                      <button
                        key={shop.id || shop._id}
                        type="button"
                        onClick={() => setSelectedShopId(shop.id || shop._id)}
                        className={`relative shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-xl px-4 py-3 min-w-[120px] transition border ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-300 shadow-md'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-amber-300 shadow-sm'
                        } ${isClosed ? 'opacity-60' : ''}`}
                      >
                        <span className="text-3xl">{shop.image || '🏪'}</span>
                        <span className={`text-xs font-semibold truncate max-w-[100px] ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          {shop.name}
                        </span>
                        {shop.cuisine && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[100px]">{shop.cuisine}</span>
                        )}
                        {isClosed && (
                          <span className="absolute top-1 right-1 text-[8px] font-bold bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 px-1.5 py-0.5 rounded-full">Closed</span>
                        )}
                        {!isClosed && (
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-gray-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {shops.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🍽️</div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No food shops yet</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Be the first to register your food business and start receiving orders.</p>
                <button
                  type="button"
                  onClick={() => currentUser ? setShowAddShopModal(true) : navigate('/sign-in')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow transition"
                >
                  <PlusCircle className="h-4 w-4" /> Register Your Shop
                </button>
              </div>
            )}

            {/* Selected Shop Info Bar */}
            {currentShop && (
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-xl p-3.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0">{currentShop.image || '🏪'}</span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{currentShop.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                      {currentShop.cuisine && <span>{currentShop.cuisine}</span>}
                      {currentShop.distance && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{currentShop.distance}</span>}
                      {currentShop.time && <span className="flex items-center gap-0.5"><Clock3 className="h-3 w-3" />{currentShop.time}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCurrentShopClosed ? (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 px-2.5 py-1 rounded-full">Closed</span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Open
                    </span>
                  )}
                  {(currentShop.phone || currentShop.whatsapp) && (
                    <button
                      type="button"
                      onClick={() => setShowContactCard(true)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-amber-500 transition"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Active Customer Orders (on browse tab) */}
            {myCustomerOrders.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" /> Active Orders
                  <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{myCustomerOrders.length}</span>
                </h3>
                <div className="space-y-2">
                  {(showAllCustomerReceipts ? myCustomerOrders : myCustomerOrders.slice(0, 3)).map((order) => {
                    const statusColors = {
                      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                      'Preparing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                      'Ready for Collection': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                    };
                    return (
                      <button
                        key={order.id || order._id}
                        type="button"
                        onClick={() => setActiveReceiptOrder(order)}
                        className="w-full flex items-center justify-between gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{order.shopImage || '🍱'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                              #{order.orderCode} · {order.shopName || 'Food Order'}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''} · {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </button>
                    );
                  })}
                  {myCustomerOrders.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCustomerReceipts(!showAllCustomerReceipts)}
                      className="w-full text-center text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 py-1.5"
                    >
                      {showAllCustomerReceipts ? 'Show less' : `View all ${myCustomerOrders.length} orders`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Order / Table Mode Toggle */}
            {currentShop && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrderMode('order')}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    orderMode === 'order'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-50'
                  }`}
                >
                  🍔 Order Food
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('table')}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    orderMode === 'table'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-50'
                  }`}
                >
                  🪑 Book Table
                </button>
              </div>
            )}

            {/* ── MENU GRID (Order Mode) ── */}
            {currentShop && orderMode === 'order' && (
              <div>
                {/* Search & Filter */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      placeholder="Search menu..."
                      className="w-full rounded-lg bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-amber-400 focus:outline-none transition placeholder:text-gray-400"
                    />
                  </div>
                  {menuTags.length > 2 && (
                    <select
                      value={menuTagFilter}
                      onChange={(e) => setMenuTagFilter(e.target.value)}
                      className="rounded-lg bg-white dark:bg-gray-900 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-amber-400 focus:outline-none"
                    >
                      {menuTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                  )}
                </div>

                {/* Menu Items Grid */}
                {visibleMeals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visibleMeals.map((meal) => {
                      const availableSides = getAvailableSides(meal);
                      const maxSides = getMaxSides(meal);
                      const activeSides = availableSides.length > 0 ? getActiveSides(meal, availableSides, maxSides) : [];
                      const cartKey = meal.id + (activeSides.length ? '-' + activeSides.slice().sort().join('-') : '');
                      const inCart = cart.find((c) => (c.cartKey && c.cartKey === cartKey) || c.id === meal.id);
                      const soldOut = meal.isAvailable === false;
                      const visual = getItemVisual(meal);
                      return (
                        <div
                          key={meal.id}
                          className={`relative bg-white dark:bg-gray-900 rounded-xl p-3.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 transition hover:shadow-md ${soldOut ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 h-14 w-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                              {visual.isImage ? (
                                <img src={visual.src} alt={meal.name} className="h-full w-full object-cover rounded-lg" />
                              ) : (
                                <span className="text-2xl">{visual.emoji}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{meal.name}</h4>
                                  {meal.tag && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{meal.tag}</span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">{formatPrice(meal.price)}</span>
                              </div>
                              {meal.description && (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{meal.description}</p>
                              )}
                            </div>
                          </div>

                          {/* ── SIDES SELECTOR ── */}
                          {availableSides.length > 0 && !soldOut && (
                            <div className="mt-2.5">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                                Choose sides <span className="text-amber-500">({activeSides.length}/{maxSides})</span>
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {availableSides.map((side) => {
                                  const isSelected = activeSides.includes(side);
                                  return (
                                    <button
                                      key={side}
                                      type="button"
                                      onClick={() => toggleSideForMeal(meal.id, side, availableSides, maxSides)}
                                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                        isSelected
                                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-300'
                                      }`}
                                    >
                                      {isSelected && <Check className="h-2.5 w-2.5" />}
                                      {side}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Add to cart */}
                          <div className="mt-2.5 flex items-center justify-end gap-2">
                            {soldOut ? (
                              <span className="text-[10px] font-bold text-red-500">Sold Out</span>
                            ) : inCart ? (
                              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-1">
                                <button type="button" onClick={() => updateQuantity(inCart.cartKey || meal.id, -1)} className="p-1 text-gray-500 hover:text-red-500 transition">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 min-w-[20px] text-center">{inCart.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(inCart.cartKey || meal.id, 1)} className="p-1 text-gray-500 hover:text-emerald-500 transition">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(meal)}
                                disabled={isCurrentShopClosed}
                                className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition"
                              >
                                <Plus className="h-3 w-3" /> Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="text-3xl">🍽️</span>
                    <p className="text-sm text-gray-400 mt-2">{menuSearch ? 'No menu items match your search' : 'No menu items yet'}</p>
                  </div>
                )}

                {/* Kitchen Queue (visible to customers) */}
                {activeKitchenOrders.length > 0 && (
                  <div className="mt-4 bg-amber-50/80 dark:bg-amber-950/20 rounded-xl p-3.5 ring-1 ring-amber-200/60 dark:ring-amber-800/40">
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                      <Clock3 className="h-3.5 w-3.5" /> Kitchen Queue ({activeKitchenOrders.length} order{activeKitchenOrders.length !== 1 ? 's' : ''})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeKitchenOrders.slice(0, 8).map((o) => (
                        <span key={o.id || o._id} className="text-[10px] font-mono font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md ring-1 ring-gray-200 dark:ring-gray-800">
                          #{o.orderCode} · {o.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shop Reviews Summary */}
                {currentShop?.reviews?.length > 0 && (
                  <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl p-3.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-2">
                      <Star className="h-3.5 w-3.5 text-amber-500" /> Reviews ({currentShop.reviews.length})
                    </h4>
                    <div className="space-y-2">
                      {currentShop.reviews.slice(0, 3).map((review, i) => (
                        <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= (review.shopRating || review.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">{review.userName || 'Customer'}</p>
                            {review.comment && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{review.comment}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TABLE BOOKING MODE ── */}
            {currentShop && orderMode === 'table' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" /> Reserve a Table at {currentShop.name}
                </h3>
                <form onSubmit={handleTableBooking} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => setBooking({...booking, date: e.target.value})}
                        required
                        className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Time</label>
                      <input
                        type="time"
                        value={booking.time}
                        onChange={(e) => setBooking({...booking, time: e.target.value})}
                        className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Guests</label>
                      <select
                        value={booking.guests}
                        onChange={(e) => setBooking({...booking, guests: e.target.value})}
                        className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,10,12].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                      <input
                        type="text"
                        value={booking.name}
                        onChange={(e) => setBooking({...booking, name: e.target.value})}
                        required
                        className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isCurrentShopClosed}
                    className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-bold text-white shadow transition"
                  >
                    {isCurrentShopClosed ? 'Shop is Closed' : 'Request Table'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB: MY ORDERS (Customer order history)              */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-500" /> My Orders
            </h2>

            {/* Active orders */}
            {myCustomerOrders.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</h3>
                {myCustomerOrders.map((order) => {
                  const statusColors = {
                    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    'Preparing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    'Ready for Collection': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                  };
                  const collectionInfo = formatCollectionDateTime(order);
                  return (
                    <motion.div
                      key={order.id || order._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 cursor-pointer hover:shadow-md transition"
                      onClick={() => setActiveReceiptOrder(order)}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{order.shopImage || '🍱'}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">#{order.orderCode}</p>
                            <p className="text-[10px] text-gray-400">{order.shopName}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</span>
                        <span className="font-bold text-amber-600">{formatPrice(order.total)}</span>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock3 className="h-3 w-3" /> {collectionInfo.label}: {collectionInfo.full}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Completed orders */}
            {myCompletedCustomerOrders.length > 0 && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowPastCustomerReceipts(!showPastCustomerReceipts)}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  Completed ({myCompletedCustomerOrders.length})
                  <span className="text-[10px]">{showPastCustomerReceipts ? '▲' : '▼'}</span>
                </button>
                {showPastCustomerReceipts && myCompletedCustomerOrders.map((order) => (
                  <div
                    key={order.id || order._id}
                    className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 cursor-pointer hover:shadow-md transition opacity-70"
                    onClick={() => setActiveReceiptOrder(order)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{order.shopImage || '🍱'}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">#{order.orderCode} · {order.shopName}</p>
                          <p className="text-[10px] text-gray-400">{(order.items || []).length} items · {formatPrice(order.total)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No orders */}
            {myCustomerOrders.length === 0 && myCompletedCustomerOrders.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl">📋</span>
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-3">No orders yet</h3>
                <p className="text-xs text-gray-400 mt-1">Browse food shops and place your first order!</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('explore')}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow transition"
                >
                  <Store className="h-3.5 w-3.5" /> Browse Food
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB: MY SHOP (Vendor Dashboard — orders + menu)      */}
        {/* ══════════════════════════════════════════════════════ */}
        {(activeTab === 'my-shop' || activeTab === 'my-menu') && isShopOwner && (
          <div className="space-y-5">

            {/* Shop Header Card */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl bg-white/20 p-2 rounded-xl">{dashboardShop?.image || '🏪'}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Your Shop</p>
                    <h3 className="text-lg font-bold truncate">{dashboardShop?.name || 'My Shop'}</h3>
                    {dashboardShop?.cuisine && <p className="text-xs text-amber-100">{dashboardShop.cuisine}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCurrentShopOwner && dashboardShop && (
                    <button
                      type="button"
                      onClick={() => handleToggleShopOpen(dashboardShop)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition ${
                        dashboardShop.isOpen !== false
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-red-600/80 text-white hover:bg-red-700'
                      }`}
                    >
                      {dashboardShop.isOpen !== false ? '🟢 Open' : '🔴 Closed'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (dashboardShop) {
                        setEditShopForm({
                          id: dashboardShop.id || dashboardShop._id,
                          name: dashboardShop.name || '',
                          cuisine: dashboardShop.cuisine || '',
                          distance: dashboardShop.distance || '',
                          time: dashboardShop.time || '',
                          image: dashboardShop.image || '🏪',
                          address: dashboardShop.address || '',
                          phone: dashboardShop.phone || '',
                          whatsapp: dashboardShop.whatsapp || '',
                          operatingHours: dashboardShop.operatingHours || { openTime: '08:00', closeTime: '20:00', days: ['Mon','Tue','Wed','Thu','Fri'] },
                          isOpen: dashboardShop.isOpen !== false
                        });
                        setShowEditShopModal(true);
                      }
                    }}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Today', value: formatPrice(revenueSummary.daily), sub: 'Revenue' },
                { label: 'This Week', value: formatPrice(revenueSummary.weekly), sub: 'Revenue' },
                { label: 'Queue', value: liveKitchenQueue.length, sub: `order${liveKitchenQueue.length !== 1 ? 's' : ''}` }
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
                  <p className="text-[10px] text-gray-400">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Kitchen Queue (Live Orders) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" /> Kitchen Queue
                  {liveKitchenQueue.length > 0 && (
                    <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">{liveKitchenQueue.length}</span>
                  )}
                </h3>
                {/* Search */}
                <div className="relative w-40">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearchText}
                    onChange={(e) => setOrderSearchText(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 pl-7 pr-2 py-1.5 text-[10px] ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 mb-3 overflow-x-auto">
                {[
                  { key: 'all', label: 'All', count: activeShopOrders.length },
                  { key: 'pending', label: 'Pending', count: pendingOrdersCount },
                  { key: 'preparing', label: 'Preparing', count: preparingOrdersCount },
                  { key: 'ready', label: 'Ready', count: readyOrdersCount },
                  { key: 'completed', label: 'Done', count: completedOrdersCount }
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setOrderFilterTab(f.key)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                      orderFilterTab === f.key
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {f.label} {f.count > 0 ? `(${f.count})` : ''}
                  </button>
                ))}
              </div>

              {/* Order List */}
              {filteredShopOrders.length > 0 ? (
                <div className="space-y-2">
                  {(showAllKitchenQueue ? filteredShopOrders : filteredShopOrders.slice(0, 8)).map((order) => {
                    const statusConfig = {
                      'Pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', next: 'Preparing', label: 'Start Preparing' },
                      'Preparing': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', next: 'Ready for Collection', label: 'Mark Ready' },
                      'Ready for Collection': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', next: 'Completed', label: 'Collected' },
                      'Completed': { color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', next: null, label: 'Done' }
                    };
                    const config = statusConfig[order.status] || statusConfig['Pending'];
                    return (
                      <div key={order.id || order._id} className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2.5 min-w-0" onClick={() => setActiveReceiptOrder(order)} style={{ cursor: 'pointer' }}>
                          <span className="text-lg">{order.shopImage || '🍱'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                              #{order.orderCode} · {order.customerName || 'Customer'}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {(order.items || []).map(i => i.name).join(', ')} · {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${config.color}`}>
                            {order.status}
                          </span>
                          {config.next && isCurrentShopOwner && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(order.id || order._id, config.next)}
                              className="text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg transition"
                            >
                              {config.label}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredShopOrders.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowAllKitchenQueue(!showAllKitchenQueue)}
                      className="w-full text-center text-xs font-semibold text-amber-600 py-1.5"
                    >
                      {showAllKitchenQueue ? 'Show less' : `View all ${filteredShopOrders.length} orders`}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-2xl">✅</span>
                  <p className="text-xs text-gray-400 mt-1.5">No orders in queue</p>
                </div>
              )}
            </div>

            {/* Menu Management */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-500" /> Your Menu
                  <span className="text-[10px] text-gray-400">({(dashboardShop?.meals || []).length} items)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition"
                >
                  <Plus className="h-3 w-3" /> Add Meal
                </button>
              </div>

              {/* Search & Tags */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    value={myMenuSearchText}
                    onChange={(e) => setMyMenuSearchText(e.target.value)}
                    placeholder="Search your menu..."
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 pl-8 pr-3 py-1.5 text-[11px] ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                {myMenuTags.length > 2 && (
                  <select
                    value={myMenuTagFilter}
                    onChange={(e) => setMyMenuTagFilter(e.target.value)}
                    className="rounded-lg bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-[11px] ring-1 ring-gray-200 dark:ring-gray-700"
                  >
                    {myMenuTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                )}
              </div>

              {/* Meal Items */}
              {visibleMyMeals.length > 0 ? (
                <div className="space-y-2">
                  {visibleMyMeals.map((meal) => {
                    const visual = getItemVisual(meal);
                    return (
                      <div key={meal.id} className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {visual.isImage ? (
                              <img src={visual.src} alt={meal.name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-xl">{visual.emoji}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{meal.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="font-bold text-amber-600">{formatPrice(meal.price)}</span>
                              {meal.tag && <span>· {meal.tag}</span>}
                              <span className={meal.isAvailable === false ? 'text-red-500 font-bold' : 'text-emerald-500'}>{meal.isAvailable === false ? 'Sold Out' : 'In Stock'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleMealAvailability(meal)}
                            className={`p-1.5 rounded-lg transition ${meal.isAvailable === false ? 'bg-red-100 text-red-500 hover:bg-red-200' : 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200'}`}
                            title={meal.isAvailable === false ? 'Mark Available' : 'Mark Sold Out'}
                          >
                            {meal.isAvailable === false ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditMealForm({ ...meal, id: meal.id });
                              setShowEditMealModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-amber-500 hover:bg-amber-50 transition"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMeal(meal.id, meal.name)}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-2xl">🍽️</span>
                  <p className="text-xs text-gray-400 mt-1.5">No menu items yet. Add your first meal!</p>
                </div>
              )}
            </div>

            {/* Shop Insights */}
            {shopInsights.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-500" /> Tips to Grow
                </h3>
                <div className="space-y-2">
                  {shopInsights.map((insight, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{insight.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{insight.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* MODALS                                                */}
        {/* ══════════════════════════════════════════════════════ */}

        {/* CHECKOUT MODAL */}
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckoutModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-500" /> Checkout
                </h3>
                <button type="button" onClick={() => setShowCheckoutModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handlePlaceOrder} className="p-4 space-y-4">
                {/* Cart Items */}
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.cartKey || item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{getItemVisual(item).emoji || '🍱'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => updateQuantity(item.cartKey || item.id, -1)} className="p-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold min-w-[16px] text-center text-gray-700 dark:text-gray-200">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.cartKey || item.id, 1)} className="p-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-500">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {item.sides && item.sides.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.sides.map((side) => (
                            <span key={side} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                              <Check className="h-2 w-2" />
                              {side}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total</span>
                    <span className="text-lg font-bold text-amber-600">{formatPrice(totalCartPrice)}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      type="text"
                      value={checkoutData.customerName}
                      onChange={(e) => setCheckoutData({...checkoutData, customerName: e.target.value})}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={checkoutData.customerPhone}
                      onChange={(e) => setCheckoutData({...checkoutData, customerPhone: e.target.value})}
                      required
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                      placeholder="0XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Order Notes (Optional)</label>
                    <textarea
                      value={checkoutData.orderComments}
                      onChange={(e) => setCheckoutData({...checkoutData, orderComments: e.target.value})}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none resize-none"
                      rows={2}
                      placeholder="Any special requests..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Schedule for Later (Optional)</label>
                    <input
                      type="datetime-local"
                      value={checkoutData.scheduledFor}
                      onChange={(e) => setCheckoutData({...checkoutData, scheduledFor: e.target.value})}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Pay at counter when you collect
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!cart.length || isCurrentShopClosed}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed py-3 text-sm font-bold text-white shadow-md transition"
                >
                  {isCurrentShopClosed ? 'Shop is Closed' : `Place Order · ${formatPrice(totalCartPrice)}`}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* ORDER RECEIPT MODAL */}
        {activeReceiptOrder && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setActiveReceiptOrder(null)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const ord = activeReceiptOrder;
                const ordId = ord.id || ord._id;
                const collectionInfo = formatCollectionDateTime(ord);
                const statusColors = {
                  'Pending': 'bg-yellow-100 text-yellow-800',
                  'Preparing': 'bg-blue-100 text-blue-800',
                  'Ready for Collection': 'bg-emerald-100 text-emerald-800',
                  'Completed': 'bg-gray-200 text-gray-600',
                };
                const isMyOrder = currentUser && (
                  String(ord.customerId || ord.userId || '') === String(currentUser._id || currentUser.id || '') ||
                  (currentUser.phone && ord.customerPhone === currentUser.phone)
                );
                const ownsShopOrder = isCurrentShopOwner && String(ord.shopId || '') === String(dashboardShop?.id || dashboardShop?._id || '');

                return (
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Order Receipt</h3>
                      <button type="button" onClick={() => setActiveReceiptOrder(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Order Code */}
                    <div className="text-center py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-100">Order Code</p>
                      <p className="text-3xl font-black tracking-widest mt-1">{ord.orderCode || '----'}</p>
                      <p className="text-[10px] text-amber-100 mt-1">Show this code at pickup</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[ord.status] || 'bg-gray-100 text-gray-600'}`}>
                        {ord.status}
                      </span>
                    </div>

                    {/* Shop & Customer */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Restaurant</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{ord.shopName || 'Food Shop'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{ord.customerName || 'Customer'}</p>
                        {ord.customerPhone && <p className="text-[10px] text-gray-400 font-mono">{ord.customerPhone}</p>}
                      </div>
                    </div>

                    {/* Collection */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{collectionInfo.label}</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{collectionInfo.full}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Items</p>
                      {(ord.items || []).map((item, i) => {
                        const iv = getItemVisual(item);
                        return (
                          <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{iv.emoji || '🍱'}</span>
                              <div>
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.name}</p>
                                <p className="text-[10px] text-gray-400">× {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-amber-600">{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total</span>
                        <span className="text-lg font-bold text-amber-600">{formatPrice(ord.total)}</span>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {ord.orderComments && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Notes</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{ord.orderComments}</p>
                      </div>
                    )}

                    {/* Status Update Buttons (Shop Owner) */}
                    {ownsShopOrder && ord.status !== 'Completed' && (
                      <div className="flex gap-2">
                        {ord.status === 'Pending' && (
                          <button type="button" onClick={() => handleStatusUpdate(ordId, 'Preparing')} className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 py-2 text-xs font-bold text-white shadow transition">
                            Start Preparing
                          </button>
                        )}
                        {ord.status === 'Preparing' && (
                          <button type="button" onClick={() => handleStatusUpdate(ordId, 'Ready for Collection')} className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 py-2 text-xs font-bold text-white shadow transition">
                            Mark Ready
                          </button>
                        )}
                        {ord.status === 'Ready for Collection' && (
                          <button type="button" onClick={() => handleStatusUpdate(ordId, 'Completed')} className="flex-1 rounded-lg bg-gray-700 hover:bg-gray-800 py-2 text-xs font-bold text-white shadow transition">
                            Confirm Collected
                          </button>
                        )}
                      </div>
                    )}

                    {/* Rate Button (Customer, Completed) */}
                    {isMyOrder && ord.status === 'Completed' && !ord.isRated && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingTargetOrder(ord);
                          setShowRateModal(true);
                        }}
                        className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 py-2.5 text-xs font-bold text-white shadow transition flex items-center justify-center gap-1.5"
                      >
                        <Star className="h-3.5 w-3.5" /> Rate this Order
                      </button>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* CONTACT CARD MODAL */}
        {showContactCard && currentShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowContactCard(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-500" /> Contact
                </h3>
                <button type="button" onClick={() => setShowContactCard(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="text-center mb-4">
                <span className="text-4xl">{currentShop.image || '🏪'}</span>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2">{currentShop.name}</h4>
                {currentShop.address && <p className="text-xs text-gray-400 mt-0.5">{currentShop.address}</p>}
              </div>
              <div className="space-y-2.5">
                {currentShop.phone && (
                  <a
                    href={`tel:${currentShop.phone}`}
                    className="flex items-center gap-3 w-full rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition"
                  >
                    <FaPhone className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-bold">Call</p>
                      <p className="text-[11px] font-mono">{currentShop.phone}</p>
                    </div>
                  </a>
                )}
                {currentShop.whatsapp && (
                  <a
                    href={`https://wa.me/${(currentShop.whatsapp || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full rounded-xl bg-green-50 dark:bg-green-950/30 p-3 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50 transition"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-bold">WhatsApp</p>
                      <p className="text-[11px] font-mono">{currentShop.whatsapp}</p>
                    </div>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* ADD SHOP MODAL */}
        {showAddShopModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddShopModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-500" /> Register Food Shop
                </h3>
                <button type="button" onClick={() => setShowAddShopModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleCreateShopSubmit} className="p-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Shop Name *</label>
                  <input type="text" required value={newShopForm.name} onChange={(e) => setNewShopForm({...newShopForm, name: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="e.g. Mama's Kitchen" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuisine Type</label>
                    <input type="text" value={newShopForm.cuisine} onChange={(e) => setNewShopForm({...newShopForm, cuisine: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="e.g. Traditional" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Emoji Icon</label>
                    <select value={newShopForm.image} onChange={(e) => setNewShopForm({...newShopForm, image: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none">
                      {FOOD_EMOJIS.map((em) => <option key={em} value={em}>{em}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                  <input type="text" value={newShopForm.address} onChange={(e) => setNewShopForm({...newShopForm, address: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="Street address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                    <input type="tel" value={newShopForm.phone} onChange={(e) => setNewShopForm({...newShopForm, phone: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="0XX XXX XXXX" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">WhatsApp</label>
                    <input type="tel" value={newShopForm.whatsapp} onChange={(e) => setNewShopForm({...newShopForm, whatsapp: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="27XX XXX XXXX" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Distance</label>
                    <input type="text" value={newShopForm.distance} onChange={(e) => setNewShopForm({...newShopForm, distance: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="e.g. 1.5 km" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prep Time</label>
                    <input type="text" value={newShopForm.time} onChange={(e) => setNewShopForm({...newShopForm, time: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="e.g. 20-30 min" />
                  </div>
                </div>
                <button type="submit" className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-3 text-sm font-bold text-white shadow-md transition">
                  Register Shop
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADD MEAL MODAL */}
        {showAddMealModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMealModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-500" /> Add Menu Item
                </h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleAiAutoFillMeal(false)} className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full hover:bg-purple-200 transition flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Fill
                  </button>
                  <button type="button" onClick={() => setShowAddMealModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleAddMealSubmit} className="p-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Meal Name *</label>
                  <input type="text" required value={newMealForm.name} onChange={(e) => setNewMealForm({...newMealForm, name: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="e.g. Grilled Chicken Pap" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea value={newMealForm.description} onChange={(e) => setNewMealForm({...newMealForm, description: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none resize-none" rows={2} placeholder="Brief description..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (R) *</label>
                    <input type="number" required step="0.01" value={newMealForm.price} onChange={(e) => setNewMealForm({...newMealForm, price: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" placeholder="55.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tag</label>
                    <select value={newMealForm.tag} onChange={(e) => setNewMealForm({...newMealForm, tag: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none">
                      {['Popular', 'New', 'Spicy', 'Healthy', 'Value', 'Special', 'Vegetarian', 'Vegan'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Icon</label>
                    <select value={newMealForm.image} onChange={(e) => setNewMealForm({...newMealForm, image: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none">
                      {FOOD_EMOJIS.map((em) => <option key={em} value={em}>{em}</option>)}
                    </select>
                  </div>
                </div>
                {/* Sides */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sides (comma separated)</label>
                  <input
                    type="text"
                    value={(newMealForm.sides || []).join(', ')}
                    onChange={(e) => setNewMealForm({...newMealForm, sides: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                    placeholder="Pap, Chakalaka, Salad..."
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-3 text-sm font-bold text-white shadow-md transition">
                  Add to Menu
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT SHOP MODAL */}
        {showEditShopModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditShopModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-amber-500" /> Edit Shop
                </h3>
                <button type="button" onClick={() => setShowEditShopModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleEditShopSubmit} className="p-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Shop Name *</label>
                  <input type="text" required value={editShopForm.name} onChange={(e) => setEditShopForm({...editShopForm, name: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuisine</label>
                    <input type="text" value={editShopForm.cuisine} onChange={(e) => setEditShopForm({...editShopForm, cuisine: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Icon</label>
                    <select value={editShopForm.image} onChange={(e) => setEditShopForm({...editShopForm, image: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none">
                      {FOOD_EMOJIS.map((em) => <option key={em} value={em}>{em}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                  <input type="text" value={editShopForm.address} onChange={(e) => setEditShopForm({...editShopForm, address: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                    <input type="tel" value={editShopForm.phone} onChange={(e) => setEditShopForm({...editShopForm, phone: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">WhatsApp</label>
                    <input type="tel" value={editShopForm.whatsapp} onChange={(e) => setEditShopForm({...editShopForm, whatsapp: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Distance</label>
                    <input type="text" value={editShopForm.distance} onChange={(e) => setEditShopForm({...editShopForm, distance: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prep Time</label>
                    <input type="text" value={editShopForm.time} onChange={(e) => setEditShopForm({...editShopForm, time: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-3 text-sm font-bold text-white shadow-md transition">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT MEAL MODAL */}
        {showEditMealModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditMealModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-amber-500" /> Edit Meal
                </h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleAiAutoFillMeal(true)} className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full hover:bg-purple-200 transition flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Fill
                  </button>
                  <button type="button" onClick={() => setShowEditMealModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleEditMealSubmit} className="p-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Meal Name *</label>
                  <input type="text" required value={editMealForm.name} onChange={(e) => setEditMealForm({...editMealForm, name: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea value={editMealForm.description} onChange={(e) => setEditMealForm({...editMealForm, description: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none resize-none" rows={2} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (R) *</label>
                    <input type="number" required step="0.01" value={editMealForm.price} onChange={(e) => setEditMealForm({...editMealForm, price: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tag</label>
                    <select value={editMealForm.tag} onChange={(e) => setEditMealForm({...editMealForm, tag: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none">
                      {['Popular', 'New', 'Spicy', 'Healthy', 'Value', 'Special', 'Vegetarian', 'Vegan'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Icon</label>
                    <select value={editMealForm.image} onChange={(e) => setEditMealForm({...editMealForm, image: e.target.value})} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none">
                      {FOOD_EMOJIS.map((em) => <option key={em} value={em}>{em}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sides (comma separated)</label>
                  <input
                    type="text"
                    value={(editMealForm.sides || []).join(', ')}
                    onChange={(e) => setEditMealForm({...editMealForm, sides: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-3 text-sm font-bold text-white shadow-md transition">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* RATE MODAL */}
        {showRateModal && ratingTargetOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={() => setShowRateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" /> Rate Your Experience
                </h3>
                <button type="button" onClick={() => setShowRateModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleRatingSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Shop Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setShopRating(s)}
                        className="p-1 transition hover:scale-110"
                      >
                        <Star className={`h-7 w-7 ${s <= shopRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Food Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFoodRating(s)}
                        className="p-1 transition hover:scale-110"
                      >
                        <Star className={`h-7 w-7 ${s <= foodRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Comment (Optional)</label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-amber-400 focus:outline-none resize-none"
                    rows={3}
                    placeholder="How was your experience?"
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-3 text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-1.5">
                  <Star className="h-4 w-4" /> Submit Rating
                </button>
              </form>
            </motion.div>
          </div>
        )}

      </div>

      {/* ── BASKET PREVIEW POPUP (auto-shows on add) ── */}
      <AnimatePresence>
        {showBasketPreview && cart.length > 0 && (
          <motion.div
            key="basket-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowBasketPreview(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-md mx-0 sm:mx-4 bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5 text-amber-500" />
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Your Basket</h3>
                  {currentShop && (
                    <span className="text-[10px] text-gray-400 font-semibold">· {currentShop.name}</span>
                  )}
                </div>
                <button onClick={() => setShowBasketPreview(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Cart items list */}
              <div className="px-5 py-3 space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartKey || item.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{getItemVisual(item).emoji || '🍱'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" onClick={() => updateQuantity(item.cartKey || item.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-black text-gray-900 dark:text-white min-w-[16px] text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.cartKey || item.id, 1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-500 transition">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {item.sides && item.sides.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-8">
                        {item.sides.map((side) => (
                          <span key={side} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                            <Check className="h-2 w-2" />
                            {side}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total + Confirm button */}
              <div className="px-5 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-xl font-black text-amber-600">{formatPrice(totalCartPrice)}</span>
                </div>
                <button
                  type="button"
                  disabled={isCurrentShopClosed}
                  onClick={() => {
                    setShowBasketPreview(false);
                    currentUser ? setShowCheckoutModal(true) : navigate('/sign-in');
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 text-sm font-black shadow-lg hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isCurrentShopClosed ? 'Shop Closed' : currentUser ? `Confirm Order · ${formatPrice(totalCartPrice)}` : 'Sign in to Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBasketPreview(false)}
                  className="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold py-1"
                >
                  Continue browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING CART BAR ── */}
      {cart.length > 0 && (activeTab === 'explore' || activeTab === 'other-shops') && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-gray-950/90 to-transparent backdrop-blur-md safe-area-bottom mobile-booking-bar">
          <div className="mx-auto max-w-3xl rounded-2xl bg-amber-500 p-3 text-white shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <ShoppingBag className="h-5 w-5 text-white" />
                <span className="absolute -top-1.5 -right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-amber-300 shadow">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 block">Your Basket</span>
                <span className="text-base font-bold">{formatPrice(totalCartPrice)}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={isCurrentShopClosed}
              onClick={() => {
                currentUser ? setShowBasketPreview(true) : navigate('/sign-in');
              }}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-gray-800 transition shadow-lg flex items-center gap-1.5 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <span>{isCurrentShopClosed ? 'Closed' : currentUser ? 'View Basket' : 'Sign in'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
