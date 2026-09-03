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
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  // Main navigation view: 'customer' or 'dashboard'
  const [viewTab, setViewTab] = useState('customer');

  // Customer state
  const [orderMode, setOrderMode] = useState('order'); // 'order' or 'table'
  const [fulfilment] = useState('pickup');
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [cart, setCart] = useState([]);
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
    image: '🍱'
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
    image: '🍱'
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
        setSelectedShopId(fetchedShops[0].id);
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
    const uid = currentUser._id || currentUser.id || 'guest';
    return shops.filter((s) => s.ownerId === uid);
  }, [shops, currentUser?._id]);

  // Whether the current user owns at least one shop
  const isShopOwner = myShops.length > 0;

  // The shop selected on the dashboard (only owner's shops are valid here)
  const dashboardShop = useMemo(() => {
    return myShops.find((s) => s.id === selectedShopId) || myShops[0] || null;
  }, [myShops, selectedShopId]);

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

  // All orders for the current dashboard shop (only owner's shop)
  const activeShopOrders = useMemo(() => {
    if (!dashboardShop) return [];
    return orders.filter((o) => o.shopId === dashboardShop.id);
  }, [orders, dashboardShop]);

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
  const completedStoreOrders = useMemo(() => {
    return activeShopOrders.filter((o) => o.status === 'Completed');
  }, [activeShopOrders]);

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

    setCart((items) => {
      const existing = items.find((item) => item.id === meal.id);
      if (existing) {
        return items.map((item) => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { ...meal, quantity: 1 }];
    });
  };

  const updateQuantity = (mealId, change) => {
    if (isCurrentShopClosed) return;

    setCart((items) =>
      items
        .map((item) => (item.id === mealId ? { ...item, quantity: item.quantity + change } : item))
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
        message: `Order #${created.orderCode} placed successfully! ${
          'Pay at the store counter upon pickup.'
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
    if (!newMealForm.name || !newMealForm.price || !selectedShopId) return;
    try {
      await addMealToShop(selectedShopId, newMealForm);
      setShowAddMealModal(false);
      setNewMealForm({ name: '', description: '', price: '', tag: 'Popular', image: '🍱' });
      setNotice({ type: 'success', message: `Meal "${newMealForm.name}" added to menu!` });
    } catch (err) {
      console.error("Add meal error:", err);
    }
  };

  // Handle Edit Shop Submit
  const handleEditShopSubmit = async (e) => {
    e.preventDefault();
    if (!editShopForm.name || !editShopForm.id) return;
    try {
      await updateShop(editShopForm.id, editShopForm);
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
    if (!editMealForm.name || !editMealForm.id || !selectedShopId) return;
    try {
      await updateMealInShop(selectedShopId, editMealForm.id, editMealForm);
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
    try {
      await deleteMealFromShop(selectedShopId, mealId);
      setNotice({ type: 'success', message: `Meal "${mealName}" deleted from menu.` });
    } catch (err) {
      console.error("Delete meal error:", err);
      setNotice({ type: 'error', message: err.message || 'Error deleting meal' });
    }
  };

  // Toggle shop Open / Closed
  const handleToggleShopOpen = async (shop) => {
    if (!shop) return;
    // Existing shops without an explicit value are treated as open by the UI.
    const newIsOpen = shop.isOpen === false;
    try {
      await updateShop(shop.id, { isOpen: newIsOpen });
      setNotice({
        type: 'success',
        message: newIsOpen
          ? `✅ ${shop.name} is now OPEN — customers can place orders!`
          : `🔴 ${shop.name} is now CLOSED — orders paused.`
      });
    } catch (err) {
      console.error('Toggle open error:', err);
      setNotice({ type: 'error', message: 'Failed to update shop status. Please try again.' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/30 to-slate-50 px-3 py-6 sm:px-8 w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-6xl w-full">
        
        {/* Top Bar Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 px-4 py-2 text-sm font-bold text-gray-700 dark:text-white shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-amber-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl flex items-center gap-2">
                <UtensilsCrossed className="h-7 w-7 text-amber-600" />
                Lunch & Food Hub
              </h1>
              <p className="text-xs text-gray-500 dark:text-white font-medium">Order food, book tables & manage store orders</p>
            </div>
          </div>

          {/* View Mode Toggle: Customer vs Food Manager Dashboard */}
          <div className="flex items-center gap-2 rounded-full bg-amber-100/80 p-1.5 ring-1 ring-amber-300/40">
            <button
              type="button"
              onClick={() => setViewTab('customer')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
                viewTab === 'customer'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Customer Ordering
            </button>
            <button
              type="button"
              onClick={() => setViewTab('dashboard')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
                viewTab === 'dashboard'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              <ChefHat className="h-4 w-4" /> Food Manager Dashboard
              {isShopOwner && activeShopOrders.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-950 px-2 py-0.5 text-[10px] text-amber-300">
                  {activeShopOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Alert / Notice Banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold shadow-sm ring-1 ${
                notice.type === 'error'
                  ? 'bg-rose-50 text-rose-900 ring-rose-300'
                  : notice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 ring-emerald-300'
                  : 'bg-blue-50 text-blue-900 ring-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {notice.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                )}
                <span>{notice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="rounded-full p-1 hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Receipts & Orders Section (Only Active Uncompleted Orders) */}
        {myCustomerOrders.length > 0 && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 flex items-center gap-2">
                <span className="text-lg">🧾</span>
                <span>My Live Receipts & Orders</span>
                <span className="ml-1 rounded-full bg-amber-200 dark:bg-amber-900/60 px-2.5 py-0.5 text-xs font-black text-amber-900 dark:text-amber-200">
                  {myCustomerOrders.length} In Progress
                </span>
              </h3>
              {myCustomerOrders.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllCustomerReceipts(prev => !prev)}
                  className="text-xs font-extrabold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                >
                  {showAllCustomerReceipts ? '▲ Show Less Receipts' : `▼ View More Active Receipts (${myCustomerOrders.length})`}
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(showAllCustomerReceipts ? myCustomerOrders : myCustomerOrders.slice(0, 2)).map((ord) => {
                const isReady = ord.status === 'Ready for Collection';
                const isPreparing = ord.status === 'Preparing';
                const isCompleted = ord.status === 'Completed';
                const theme = getReceiptTheme(ord);
                const overdue = isCollectionOverdue(ord);
                const timing = formatCollectionDateTime(ord);

                // Find primary food visual for top header
                const firstVisual = getItemVisual(ord.items?.[0] || { name: ord.shopName, image: ord.shopImage });
                const isOwnerOfThisOrder = Boolean(
                  currentUser && myShops.some(s => s.id === ord.shopId || s._id === ord.shopId)
                );

                return (
                  <div
                    key={ord.id || ord._id}
                    className={`relative rounded-3xl border-2 border-dashed shadow-md transition-all hover:shadow-xl p-5 overflow-hidden font-sans ${theme.bg} ${
                      isReady
                        ? 'border-emerald-500/90 ring-2 ring-emerald-400/50'
                        : overdue
                        ? 'border-rose-500/90 ring-2 ring-rose-400/50'
                        : isPreparing
                        ? 'border-amber-400/90 ring-2 ring-amber-300/40'
                        : isCompleted
                        ? 'border-slate-300 dark:border-gray-700 opacity-95'
                        : theme.border
                    }`}
                  >
                    {/* Overdue Collection Alert Banner for Customer */}
                    {overdue && (
                      <div className="mb-3 rounded-2xl bg-rose-500 text-white p-2.5 text-xs font-black flex items-center justify-between shadow-xs animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <span>🔔</span>
                          <span>COLLECTION OVERDUE — Your fresh food is waiting at the counter!</span>
                        </span>
                        <span className="bg-white text-rose-700 px-2 py-0.5 rounded-lg text-[10px] uppercase">
                          Collect Now
                        </span>
                      </div>
                    )}

                    {/* Simulated Receipt Barcode Header */}
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200/80 dark:border-gray-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        {firstVisual.isImage ? (
                          <img
                            src={firstVisual.src}
                            alt={ord.shopName}
                            className="w-12 h-12 object-cover rounded-2xl shadow-xs border border-white/60 dark:border-gray-700 shrink-0"
                          />
                        ) : (
                          <span className="text-3xl p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xs border border-gray-100 dark:border-gray-700 shrink-0">
                            {firstVisual.emoji || ord.shopImage || '🍱'}
                          </span>
                        )}
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 block">
                            OFFICIAL STORE RECEIPT
                          </span>
                          <h4 className="font-black text-gray-950 dark:text-white text-base leading-tight">
                            {ord.shopName}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                            Ref #{String(ord.orderCode || '0000').slice(-4)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Matching Code</span>
                        <span className={`inline-block font-mono font-black text-sm text-white bg-gradient-to-r ${theme.codeBg} px-3 py-1 rounded-xl shadow-xs`}>
                          {ord.orderCode}
                        </span>
                      </div>
                    </div>

                    {/* PROMINENT COLLECTION DATE & TIME BANNER */}
                    <div className="my-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-amber-300/80 dark:border-amber-600/50 p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-base shrink-0">
                          📅
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                            {timing.label} (Date & Time)
                          </span>
                          <p className="font-black text-gray-950 dark:text-white text-xs">
                            {timing.dateStr} at <strong className="text-amber-700 dark:text-amber-400 font-black text-sm">{timing.timeStr}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right pl-2 border-l border-gray-200 dark:border-gray-700">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase">Order Placed</span>
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 font-mono block">
                          {timing.placedStr}
                        </span>
                      </div>
                    </div>

                    {/* Receipt Itemized List with Pictures */}
                    <div className="my-3 space-y-2 rounded-2xl bg-white/70 dark:bg-gray-800/60 p-3.5 text-xs shadow-2xs border border-gray-100 dark:border-gray-700/60">
                      <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1 flex items-center justify-between">
                        <span>Ordered Food Items:</span>
                        <span>{ord.items?.length || 0} item{ord.items?.length === 1 ? '' : 's'}</span>
                      </div>

                      {ord.items?.map((it, idx) => {
                        const itemVisual = getItemVisual(it);
                        return (
                          <div key={idx} className="flex justify-between items-center gap-2 text-gray-800 dark:text-gray-100 py-1 border-b border-dashed border-gray-100 dark:border-gray-700/50 last:border-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {itemVisual.isImage ? (
                                <img
                                  src={itemVisual.src}
                                  alt={it.name}
                                  className="w-8 h-8 object-cover rounded-xl shadow-2xs shrink-0"
                                />
                              ) : (
                                <span className="text-lg p-1 bg-amber-50 dark:bg-gray-700 rounded-lg shadow-2xs shrink-0">
                                  {itemVisual.emoji}
                                </span>
                              )}
                              <div className="min-w-0 flex-1 truncate">
                                <p className="font-bold text-gray-900 dark:text-white truncate">
                                  <span className="text-amber-800 dark:text-amber-300 font-extrabold mr-1">{it.quantity}x</span>
                                  {it.name}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-gray-900 dark:text-white shrink-0">
                              {formatPrice(it.price * it.quantity)}
                            </span>
                          </div>
                        );
                      })}

                      <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-2.5 mt-2 flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-gray-600 dark:text-gray-400">Total Amount</span>
                        <span className="text-base font-black font-mono text-amber-700 dark:text-amber-400">{formatPrice(ord.total)}</span>
                      </div>
                    </div>

                    {/* Fulfillment & Payment Stamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 py-1">
                      <span className="capitalize flex items-center gap-1">
                        📦 {ord.fulfilment === 'pickup' ? 'Counter Pickup' : 'Delivery to Door'}
                      </span>
                      <span className="text-amber-900 dark:text-amber-200 font-extrabold text-[11px] bg-amber-100/90 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300/80 dark:border-amber-700">
                        💵 {ord.paymentStatus || ord.paymentMethod || 'Pay at Counter on Pickup'}
                      </span>
                    </div>

                    {/* Live 4-Step Order Progression Tracker */}
                    <div className="mt-3 pt-2.5 border-t-2 border-dashed border-gray-200/80 dark:border-gray-800">
                      <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {isOwnerOfThisOrder && <span>👑</span>}
                          <span>{isOwnerOfThisOrder ? 'Owner Order Progress (Tap to update):' : 'Order Progress:'}</span>
                        </span>
                        <span className="font-extrabold text-amber-700 dark:text-amber-400">
                          {isCompleted ? 'Step 4 of 4: Collected ✅' : isReady ? 'Step 3 of 4: Ready for Collection' : isPreparing ? 'Step 2 of 4: Preparing Food' : 'Step 1 of 4: Order Received'}
                        </span>
                      </div>

                      {isOwnerOfThisOrder ? (
                        /* Shop Owner: Interactive Clickable Step Buttons */
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] sm:text-[11px] font-black">
                          {/* Step 1: Received */}
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(ord.id || ord._id, 'Pending')}
                            title="Set status to 1. Received"
                            className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                              !isPreparing && !isReady && !isCompleted
                                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 border-amber-600'
                                : 'bg-white hover:bg-amber-50 text-gray-700 dark:bg-gray-850 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <span>📝</span>
                            <span className="leading-tight">1. Received</span>
                            {!isPreparing && !isReady && !isCompleted && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Current</span>}
                          </button>

                          {/* Step 2: Prepare */}
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(ord.id || ord._id, 'Preparing')}
                            title="Set status to 2. Preparing Food"
                            className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                              isPreparing
                                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 animate-pulse border-amber-600'
                                : isReady || isCompleted
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-white hover:bg-amber-50 text-gray-700 dark:bg-gray-850 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <span>👨‍🍳</span>
                            <span className="leading-tight">2. Prepare</span>
                            {isPreparing && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Cooking</span>}
                          </button>

                          {/* Step 3: Ready */}
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(ord.id || ord._id, 'Ready for Collection')}
                            title="Set status to 3. Ready for Collection"
                            className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                              isReady
                                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400 animate-bounce border-emerald-700'
                                : isCompleted
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-white hover:bg-emerald-50 text-gray-700 dark:bg-gray-850 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <span>🛍️</span>
                            <span className="leading-tight">3. Ready</span>
                            {isReady && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Waiting</span>}
                          </button>

                          {/* Step 4: Complete */}
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                            title="Set status to 4. Completed / Collected"
                            className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                              isCompleted
                                ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400 border-emerald-800'
                                : 'bg-white hover:bg-emerald-50 text-gray-700 dark:bg-gray-850 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <span>✅</span>
                            <span className="leading-tight">4. Complete</span>
                            {isCompleted && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Done</span>}
                          </button>
                        </div>
                      ) : (
                        /* Regular Customer Stepper */
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] sm:text-[11px] font-black">
                          {/* Step 1: Received */}
                          <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                            !isPreparing && !isReady && !isCompleted
                              ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}>
                            <span>📝</span>
                            <span className="leading-tight">1. Received</span>
                          </div>

                          {/* Step 2: Preparing Food */}
                          <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                            isPreparing
                              ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 animate-pulse'
                              : isReady || isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}>
                            <span>👨‍🍳</span>
                            <span className="leading-tight">2. Preparing</span>
                          </div>

                          {/* Step 3: Ready for Collection */}
                          <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                            isReady
                              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400 animate-bounce'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}>
                            <span>🛍️</span>
                            <span className="leading-tight">3. Ready</span>
                          </div>

                          {/* Step 4: Collected */}
                          <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                            isCompleted
                              ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}>
                            <span>✅</span>
                            <span className="leading-tight">4. Collected</span>
                          </div>
                        </div>
                      )}

                      {/* User / Owner Collection Confirmation Button */}
                      {isReady && (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-2.5 px-3 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                          >
                            <span>✅</span>
                            <span>{isOwnerOfThisOrder ? 'Confirm Customer Collected (Step 4)' : 'I Have Collected My Order (Press to Confirm)'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Receipt Actions */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveReceiptOrder(ord)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> View / Show Full Receipt
                      </button>

                      {isCompleted && !ord.isRated && (
                        <button
                          type="button"
                          onClick={() => {
                            setRatingTargetOrder(ord);
                            setShowRateModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-300 px-3 py-2 text-xs font-black shadow-xs transition"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" /> Rate Shop
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Active Receipts Toggle */}
            {myCustomerOrders.length > 2 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllCustomerReceipts(prev => !prev)}
                  className="rounded-full bg-white dark:bg-gray-900 border border-amber-300 px-4 py-2 text-xs font-black text-amber-900 dark:text-amber-300 hover:bg-amber-50 transition shadow-xs cursor-pointer"
                >
                  {showAllCustomerReceipts ? '▲ Show Less Active Receipts' : `▼ View More Active Receipts (${myCustomerOrders.length - 2} more)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Discrete Archive for Past Completed Receipts (Customer History) */}
        {myCompletedCustomerOrders.length > 0 && (
          <div className="mt-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-base">📁</span>
                <span className="text-xs font-black uppercase tracking-wide">
                  Past Completed Receipts Archive ({myCompletedCustomerOrders.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPastCustomerReceipts(prev => !prev)}
                className="text-xs font-black text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {showPastCustomerReceipts ? '▲ Hide Past Receipts' : `▼ View Past Receipts (${myCompletedCustomerOrders.length})`}
              </button>
            </div>

            {showPastCustomerReceipts && (
              <div className="mt-3.5 grid gap-3 sm:grid-cols-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                {myCompletedCustomerOrders.map((ord) => {
                  const compTiming = formatCollectionDateTime(ord);
                  return (
                    <div
                      key={ord.id || ord._id}
                      className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 to-white dark:from-gray-900 dark:to-gray-850 p-3.5 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-black text-xs text-gray-900 dark:text-white block">{ord.shopName}</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Code: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{ord.orderCode}</strong> · {formatPrice(ord.total)}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                          ✅ Collected {compTiming.dateStr} {ord.isRated ? '· ⭐ Rated' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!ord.isRated && (
                          <button
                            type="button"
                            onClick={() => {
                              setRatingTargetOrder(ord);
                              setShowRateModal(true);
                            }}
                            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 text-[11px] font-black shadow-2xs transition cursor-pointer"
                          >
                            ⭐ Rate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveReceiptOrder(ord)}
                          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-800 dark:text-gray-200 px-2.5 py-1.5 text-[11px] font-black shadow-2xs transition cursor-pointer"
                        >
                          🧾 View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: CUSTOMER VIEW */}
        {viewTab === 'customer' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] min-w-0">
            <section className="min-w-0 overflow-hidden">
              {/* TOP PROMINENT LIVE KITCHEN QUEUE BOARD (VISIBLE TO EVERYONE) */}
              {activeKitchenOrders.length > 0 && (
                <div className="mt-4 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-750 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/50 dark:to-gray-900 p-5 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-2xl bg-amber-500 text-white shadow-xs">🍳</span>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                          <span>Live Kitchen Queue — {currentShop?.name}</span>
                          <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-mono font-bold animate-pulse shadow-xs">
                            {activeKitchenOrders.length} In Progress
                          </span>
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mt-0.5">
                          Real-time status of meals being prepared & packed right now.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeKitchenOrders.slice(0, 4).map((ord) => {
                      const theme = getReceiptTheme(ord);
                      const timing = formatCollectionDateTime(ord);
                      const isMyOrder = currentUser && (
                        String(ord.customerId || ord.userId || '') === String(currentUser._id || currentUser.id || '') ||
                        (currentUser.phone && ord.customerPhone === currentUser.phone)
                      );
                      const isOwner = Boolean(currentUser && myShops.some(s => s.id === ord.shopId || s._id === ord.shopId));

                      return (
                        <div
                          key={ord.id || ord._id}
                          className={`rounded-2xl border-2 border-dashed ${theme.border} ${theme.bg} p-3.5 shadow-sm relative overflow-hidden ${
                            isMyOrder ? 'ring-2 ring-amber-500 shadow-md' : ''
                          }`}
                        >
                          {isMyOrder && (
                            <div className="absolute top-2 right-2 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                              ⭐ Your Order
                            </div>
                          )}
                          <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-gray-700/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl p-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xs">
                                {ord.shopImage || '🍱'}
                              </span>
                              <div>
                                <span className="text-[9px] font-bold text-gray-400 block uppercase">Matching Code</span>
                                <span className="font-mono font-black text-xs text-gray-950 dark:text-white">
                                  {ord.orderCode}
                                </span>
                              </div>
                            </div>
                            <div className="text-right mr-16 sm:mr-0">
                              <span className="text-[9px] font-bold text-gray-400 block uppercase">Est. Collection</span>
                              <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                                {timing.timeStr}
                              </span>
                            </div>
                          </div>

                          {/* 4-Step Progress Stepper */}
                          <div className="mt-2.5">
                            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black">
                              <div className={`rounded-lg p-1 transition flex flex-col items-center justify-center gap-0.5 ${
                                ord.status === 'Pending'
                                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              }`}>
                                <span>📝</span>
                                <span className="leading-tight text-[9px]">1. Received</span>
                              </div>

                              <div className={`rounded-lg p-1 transition flex flex-col items-center justify-center gap-0.5 ${
                                ord.status === 'Preparing'
                                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 animate-pulse'
                                  : ord.status === 'Ready for Collection' || ord.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                              }`}>
                                <span>👨‍🍳</span>
                                <span className="leading-tight text-[9px]">2. Prepare</span>
                              </div>

                              <div className={`rounded-lg p-1 transition flex flex-col items-center justify-center gap-0.5 ${
                                ord.status === 'Ready for Collection'
                                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400 animate-bounce'
                                  : ord.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                              }`}>
                                <span>🛍️</span>
                                <span className="leading-tight text-[9px]">3. Ready</span>
                              </div>

                              <div className={`rounded-lg p-1 transition flex flex-col items-center justify-center gap-0.5 ${
                                ord.status === 'Completed'
                                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                              }`}>
                                <span>✅</span>
                                <span className="leading-tight text-[9px]">4. Done</span>
                              </div>
                            </div>

                            {/* Customer confirmation button */}
                            {isMyOrder && ord.status === 'Ready for Collection' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                                className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-2 px-3 text-xs font-black text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                              >
                                <span>✅</span> <span>I Have Collected My Meal</span>
                              </button>
                            )}

                            {/* Owner quick status controls */}
                            {isOwner && (
                              <div className="mt-2 flex items-center justify-end gap-1">
                                {ord.status === 'Pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Preparing')}
                                    className="rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1 text-[11px] font-black text-white shadow cursor-pointer"
                                  >
                                    👨‍🍳 Start Preparing
                                  </button>
                                )}
                                {ord.status === 'Preparing' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Ready for Collection')}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-black text-white shadow animate-pulse cursor-pointer"
                                  >
                                    🛍️ Mark Ready
                                  </button>
                                )}
                                {ord.status === 'Ready for Collection' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                                    className="rounded-lg bg-gray-900 hover:bg-gray-800 px-2.5 py-1 text-[11px] font-black text-white shadow cursor-pointer"
                                  >
                                    ✅ Confirm Collected
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}



              {/* Shop List Cards Selector — Horizontal Side-Slide */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-white">Select Restaurant / Shop</h2>
                  <div className="flex items-center gap-2">
                    {/* Left / Right scroll arrows */}
                    {shops.length > 2 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => scrollShops(-1)}
                          className="h-7 w-7 flex items-center justify-center rounded-full bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 transition shadow-sm cursor-pointer"
                          aria-label="Scroll shops left"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollShops(1)}
                          className="h-7 w-7 flex items-center justify-center rounded-full bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 transition shadow-sm cursor-pointer"
                          aria-label="Scroll shops right"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAddShopModal(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Register / Upload Shop
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrollable Snap Row */}
                <div className="overflow-hidden">
                <div
                  ref={shopSliderRef}
                  className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {shops.map((item) => {
                    const shopTheme = getShopTheme(item);
                    const isSelected = selectedShopId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedShopId(item.id)}
                        className={`snap-start shrink-0 w-[46vw] sm:w-[195px] max-w-[195px] rounded-2xl border p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isSelected ? shopTheme.cardActive : shopTheme.cardNormal
                        }`}
                      >
                        {/* Selected accent bar at top */}
                        {isSelected && (
                          <span className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${shopTheme.accentBg}`} />
                        )}

                        {/* Icon & Rating */}
                        <div className="flex items-center justify-between">
                          <span className="text-3xl filter drop-shadow-sm leading-none">{item.image || '🏪'}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-black flex items-center gap-1 border ${
                            isSelected ? shopTheme.badge : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.rating || '4.8'}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1">
                          <span className="block text-sm font-black text-gray-900 dark:text-white tracking-tight leading-snug line-clamp-2">
                            {item.name}
                          </span>
                          <div className="pt-0.5">
                            <span className="inline-block rounded-md bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 text-[10px] font-bold text-amber-900 truncate max-w-full">
                              {item.cuisine || 'Local Favorite'}
                            </span>
                          </div>
                          <p className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-white pt-0.5">
                            <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                            <span className="truncate">{item.distance || '1.0 km'}</span>
                          </p>
                          {/* Open / Closed status */}
                          <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-black ${ item.isOpen !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700' }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${ item.isOpen !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500' }`} />
                            {item.isOpen !== false ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Empty state */}
                  {shops.length === 0 && (
                    <div className="flex items-center justify-center w-full py-10 text-sm text-gray-400 font-medium">
                      No shops registered yet. Be the first to add one!
                    </div>
                  )}
                </div>
                </div>

                {/* Dot indicators */}
                {shops.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {shops.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedShopId(s.id)}
                        className={`rounded-full transition-all duration-200 cursor-pointer ${
                          selectedShopId === s.id
                            ? 'w-5 h-2 bg-amber-500'
                            : 'w-2 h-2 bg-amber-200 hover:bg-amber-300'
                        }`}
                        aria-label={`Select ${s.name}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Restaurant Hero & Meals Details */}
              {currentShop && (
                <article className="mt-6 rounded-3xl bg-white dark:bg-gray-900 shadow-md ring-1 ring-gray-100 min-w-0 max-w-full overflow-hidden">
                  
                  {/* Shop Theme Header Banner with Live Food & Culinary Background */}
                  <div className={`relative overflow-hidden rounded-none sm:rounded-3xl bg-gradient-to-r ${activeTheme.heroBg} p-5 sm:p-7 text-center shadow-xl border-b sm:border min-w-0 max-w-full`}>
                    {/* Ambient Glows */}
                    <div className={`absolute -top-16 -right-16 w-64 h-64 ${activeTheme.heroGlow} rounded-full blur-3xl pointer-events-none`} />
                    <div className={`absolute -bottom-16 -left-16 w-64 h-64 ${activeTheme.heroGlow} rounded-full blur-3xl pointer-events-none`} />

                    {/* Decorative Culinary Background Art (Forks, Plates, Cups, Fresh Meals) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 sm:opacity-25" aria-hidden="true">
                      {/* Floating Food & Cutlery Icons */}
                      <span className="absolute -top-3 -left-3 text-6xl sm:text-7xl transform -rotate-12 filter drop-shadow">🍽️</span>
                      <span className="absolute top-2 left-1/4 text-4xl sm:text-5xl transform rotate-45 filter drop-shadow">🍴</span>
                      <span className="absolute bottom-2 left-6 text-5xl sm:text-6xl transform -rotate-6 filter drop-shadow">☕</span>
                      <span className="absolute -bottom-4 left-1/3 text-6xl sm:text-7xl transform rotate-12 filter drop-shadow">🍕</span>
                      <span className="absolute top-3 right-1/4 text-4xl sm:text-5xl transform -rotate-12 filter drop-shadow">🥤</span>
                      <span className="absolute -top-3 -right-3 text-6xl sm:text-7xl transform rotate-12 filter drop-shadow">🥘</span>
                      <span className="absolute bottom-3 right-8 text-5xl sm:text-6xl transform rotate-45 filter drop-shadow">🍔</span>
                      <span className="absolute top-1/2 right-2 text-4xl sm:text-5xl transform -rotate-45 filter drop-shadow">🥗</span>
                      <span className="absolute top-1/3 left-2 text-4xl sm:text-5xl transform rotate-12 filter drop-shadow">🍳</span>

                      {/* Cutlery & Plate Subtle Pattern Mesh */}
                      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                        <defs>
                          <pattern id="culinaryPattern" width="70" height="70" patternUnits="userSpaceOnUse">
                            {/* Plate */}
                            <circle cx="35" cy="35" r="16" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="3 3" />
                            <circle cx="35" cy="35" r="10" fill="none" stroke="white" strokeWidth="0.8" />
                            {/* Fork */}
                            <path d="M12 20 L12 50 M9 20 L15 20 M9 26 L15 26" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                            {/* Knife / Spoon */}
                            <path d="M58 20 L58 50 M56 20 Q58 14 60 20 L58 30" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                            {/* Cup */}
                            <path d="M30 6 L40 6 L38 16 L32 16 Z M40 8 Q44 10 40 14" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#culinaryPattern)" />
                      </svg>
                    </div>

                    {/* Action Bar (Edit Shop & Add Menu Item) - Responsive flex bar */}
                    {currentUser && currentShop.ownerId === (currentUser._id || currentUser.id) && (
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditShopForm({
                              id: currentShop.id || currentShop._id,
                              name: currentShop.name,
                              cuisine: currentShop.cuisine,
                              distance: currentShop.distance,
                              time: currentShop.time,
                              image: currentShop.image,
                              address: currentShop.address || '',
                              phone: currentShop.phone || '',
                              whatsapp: currentShop.whatsapp || '',
                              operatingHours: currentShop.operatingHours || { openTime: '08:00', closeTime: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
                              isOpen: currentShop.isOpen !== false
                            });
                            setShowEditShopModal(true);
                          }}
                          className="rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-black text-white hover:bg-white/25 transition cursor-pointer border border-white/20 shrink-0"
                        >
                          Edit Shop
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowAddMealModal(true)}
                          className="rounded-full bg-white dark:bg-gray-900 px-3 py-1 text-[11px] font-black text-gray-950 hover:bg-amber-100 transition cursor-pointer shadow-sm shrink-0"
                        >
                          + Add Menu Item
                        </button>
                      </div>
                    )}

                    {/* Centered Avatar, Big Bold Title & Cuisine */}
                    <div className="relative z-0 max-w-xl mx-auto space-y-2 min-w-0">
                      <span className="text-5xl sm:text-7xl block mx-auto text-center filter drop-shadow-md">
                        {currentShop.image || '🏪'}
                      </span>

                      <h2 className="text-2xl sm:text-4xl font-black text-center text-white tracking-tight leading-tight break-words max-w-full">
                        {currentShop.name}
                      </h2>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                        <span className="inline-flex max-w-full items-center rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-200 border border-white/15">
                          {currentShop.cuisine}
                        </span>

                        {/* Open / Closed Status */}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider border ${
                          currentShop.isOpen !== false
                            ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40'
                            : 'bg-red-500/25 text-red-200 border-red-400/40'
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${currentShop.isOpen !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          {currentShop.isOpen !== false ? 'Open Now' : 'Closed'}
                        </span>

                        {currentShop.operatingHours?.openTime && currentShop.operatingHours?.closeTime && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold text-gray-100 backdrop-blur-md">
                            <Clock3 className="h-3.5 w-3.5 text-amber-300" />
                            {currentShop.operatingHours.openTime}–{currentShop.operatingHours.closeTime}
                          </span>
                        )}
                      </div>

                      {/* Centered Rating, Address & Delivery Time */}
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-gray-200 font-medium max-w-full overflow-hidden">
                        <span className="inline-flex items-center gap-1 font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30 shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {currentShop.rating || '5.0'} ({currentShop.reviews?.length || 0})
                        </span>
                        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm max-w-full truncate">
                          <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                          <span className="truncate">{currentShop.address || currentShop.distance}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm shrink-0">
                          <Clock3 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                          {currentShop.time}
                        </span>
                      </div>

                      {/* Contact Person & Phone */}
                      {(currentShop.ownerName || currentShop.phone) && (
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                          {currentShop.ownerName && (
                            <button
                              type="button"
                              onClick={() => setShowContactCard(true)}
                              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white/90 border border-white/15 transition cursor-pointer"
                            >
                              <Users className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                              {currentShop.ownerName}
                              <span className="text-white/50 text-[10px] ml-0.5">· tap</span>
                            </button>
                          )}
                          {currentShop.phone && (
                            <a
                              href={`tel:${currentShop.phone}`}
                              className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-200 border border-emerald-400/30 transition cursor-pointer"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              {currentShop.phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu vs Reviews View Switcher Tabs */}
                  <div className="mt-5 px-3.5 sm:px-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 min-w-0 max-w-full">
                    <div className="flex flex-wrap items-center gap-2 max-w-full">
                      <button
                        type="button"
                        onClick={() => setShowReviewsTab(false)}
                        className={`rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          !showReviewsTab
                            ? activeTheme.tabActive
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200'
                        }`}
                      >
                        <UtensilsCrossed className="h-3.5 w-3.5" /> Food Menu ({currentShop.meals?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewsTab(true)}
                        className={`rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          showReviewsTab
                            ? activeTheme.tabActive
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200'
                        }`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
                        Customer Reviews ({currentShop.reviews?.length || 0})
                      </button>
                    </div>
                  </div>

                  {!showReviewsTab && orderMode === 'order' ? (
                    <>
                      <p className="mt-4 px-3.5 sm:px-0 text-xs font-bold text-gray-600 dark:text-white"><Store className="inline h-4 w-4 text-amber-600" /> Pickup only — pay at the counter. Delivery and online payment are not available yet.</p>

                      {/* Meals Menu — Horizontal Side-Slide */}
                      <div className="mt-5">
                        {/* Arrow controls */}
                        {currentShop.meals && currentShop.meals.length > 2 && (
                          <div className="flex items-center justify-end gap-1 mb-2">
                            <button
                              type="button"
                              onClick={() => scrollMenu(-1)}
                              className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-white hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 transition shadow-sm cursor-pointer"
                              aria-label="Scroll menu left"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => scrollMenu(1)}
                              className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-white hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 transition shadow-sm cursor-pointer"
                              aria-label="Scroll menu right"
                            >
                              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                            </button>
                          </div>
                        )}

                        {/* Horizontal snap scroll row — hidden overflow container prevents page bleed */}
                        <div className="overflow-hidden">
                          <div
                            ref={menuSliderRef}
                            className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                          >
                            {visibleMeals.length > 0 ? (
                              visibleMeals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className={`snap-start shrink-0 w-[78vw] sm:w-[230px] max-w-[290px] rounded-2xl bg-gradient-to-b from-white to-gray-50 ring-1 ring-gray-100 transition-all duration-200 overflow-hidden flex flex-col ${
                                    isCurrentShopClosed ? 'opacity-60 grayscale' : 'hover:ring-amber-200'
                                  }`}
                                >
                                  {/* Meal header */}
                                  <div className="px-4 pt-4 pb-2 flex items-start gap-3">
                                    <span className="text-4xl leading-none shrink-0 p-1">{meal.image || '🍱'}</span>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <h3 className="font-black text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{meal.name}</h3>
                                      </div>
                                      {meal.tag && (
                                        <span className="inline-block mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                                          {meal.tag}
                                        </span>
                                      )}
                                      {meal.isAvailable === false && (
                                        <span className="inline-block mt-1 ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-black uppercase text-gray-600 dark:text-white">
                                          Sold out
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <p className="px-4 text-xs text-gray-500 dark:text-white leading-relaxed line-clamp-2 flex-1">{meal.description}</p>

                                  {/* Price + actions footer */}
                                  <div className="px-4 pb-4 pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-3">
                                    <span className="text-sm font-extrabold text-amber-700">{formatPrice(meal.price)}</span>
                                    <div className="flex items-center gap-1.5">
                                      {currentShop && currentUser && currentShop.ownerId === (currentUser._id || currentUser.id) && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditMealForm({
                                                id: meal.id,
                                                name: meal.name,
                                                description: meal.description || '',
                                                price: meal.price,
                                                tag: meal.tag || 'Popular',
                                                image: meal.image || '🍱'
                                              });
                                              setShowEditMealModal(true);
                                            }}
                                            className="rounded-full bg-slate-100 dark:bg-gray-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-white hover:bg-slate-200 transition cursor-pointer"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteMeal(meal.id, meal.name)}
                                            className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                          >
                                            Del
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => updateMealInShop(currentShop.id, meal.id, { ...meal, isAvailable: meal.isAvailable === false })}
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                              meal.isAvailable === false
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200'
                                            }`}
                                          >
                                            {meal.isAvailable === false ? 'Restock' : 'Sold out'}
                                          </button>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        disabled={isCurrentShopClosed || meal.isAvailable === false}
                                        onClick={() => addToCart(meal)}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-gray-950 shadow transition hover:bg-amber-300 active:scale-95 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:text-white disabled:shadow-none"
                                        aria-label={meal.isAvailable === false ? `${meal.name} is sold out` : `Add ${meal.name}`}
                                      >
                                        <Plus className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center text-sm text-gray-500 dark:text-white w-full">
                                No menu items match your search. Try another word or category.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : showReviewsTab ? (
                    /* Customer Reviews Section */
                    <div className="mt-5 space-y-4">
                      {/* Rating Breakdown Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-5 ring-1 ring-amber-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-4xl font-black text-amber-900">{currentShop.rating || '5.0'}</span>
                            <div>
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.round(parseFloat(currentShop.rating || 5))
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-white font-bold mt-0.5">
                                Based on {currentShop.reviews?.length || 0} customer reviews
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-amber-800 font-medium max-w-xs">
                          Ratings are submitted by verified customers after completing their food orders.
                        </p>
                      </div>

                      {/* List of Reviews */}
                      {currentShop.reviews && currentShop.reviews.length > 0 ? (
                        <div className="space-y-3 mt-4">
                          {currentShop.reviews.map((rev, idx) => (
                            <div key={rev.id || idx} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                                    {(rev.userName || 'C')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white block">{rev.userName || 'Customer'}</span>
                                    <span className="text-[10px] text-gray-400 block">
                                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent order'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500 bg-white dark:bg-gray-900 px-2 py-1 rounded-full border text-xs font-black">
                                  <Star className="h-3.5 w-3.5 fill-current" />
                                  {rev.shopRating || 5}/5
                                </div>
                              </div>
                              {rev.comment && (
                                <p className="text-xs text-gray-700 dark:text-white leading-relaxed italic bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                  "{rev.comment}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-white rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                          <MessageSquare className="h-8 w-8 mx-auto text-amber-400 mb-2 opacity-60" />
                          No customer reviews submitted yet for this store. Place an order to leave the first review!
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Table Booking Form */
                    <form onSubmit={handleTableBooking} className="mt-6 space-y-4">
                      {isCurrentShopClosed && (
                        <p className="rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-500 dark:text-white">
                          This shop is closed. Table bookings are unavailable.
                        </p>
                      )}
                      <fieldset disabled={isCurrentShopClosed} className={isCurrentShopClosed ? 'opacity-60 grayscale' : ''}>
                      <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200/50">
                        <p className="text-sm font-semibold text-amber-900">
                          Reserve a dining table at <span className="font-extrabold">{currentShop.name}</span>.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">
                          Your Name
                          <input
                            required
                            value={booking.name}
                            onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="Full name"
                          />
                        </label>
                        <label className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">
                          Contact Phone
                          <input
                            required
                            type="tel"
                            value={booking.phone}
                            onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="+27 82 123 4567"
                          />
                        </label>
                        <label className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">
                          Date
                          <input
                            required
                            type="date"
                            value={booking.date}
                            onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </label>
                        <label className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">
                          Time & Guests
                          <div className="flex gap-2 mt-1.5">
                            <input
                              type="time"
                              value={booking.time}
                              onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                              className="w-1/2 rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <select
                              value={booking.guests}
                              onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                              className="w-1/2 rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                              ))}
                            </select>
                          </div>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="mt-4 w-full rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-gray-800 shadow disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:text-white"
                      >
                        Request Table Booking
                      </button>
                      </fieldset>
                    </form>
                  )}
                </article>
              )}
            </section>

            {/* Right Sidebar: Order Cart */}
            <aside className="h-fit rounded-3xl bg-white dark:bg-gray-900 p-5 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-amber-600" /> Order Summary
                </h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </span>
              </div>

              {cart.length > 0 ? (
                <>
                  <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-amber-700 font-bold">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                          <button
                            type="button"
                            disabled={isCurrentShopClosed}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="rounded-full bg-white dark:bg-gray-900 p-1 hover:bg-gray-200 shadow-xs disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={isCurrentShopClosed}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="rounded-full bg-white dark:bg-gray-900 p-1 hover:bg-gray-200 shadow-xs disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 text-sm font-bold text-gray-700 dark:text-white">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-white">
                      <span>Fulfillment</span>
                      <span className="capitalize font-bold text-gray-900 dark:text-white">{fulfilment}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-gray-900 dark:text-white border-t border-dashed pt-2">
                      <span>Total Amount</span>
                      <span className="text-amber-600">{formatPrice(totalCartPrice)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isCurrentShopClosed}
                    onClick={() => currentUser ? setShowCheckoutModal(true) : navigate('/sign-in')}
                    className="mt-5 w-full rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-black text-gray-950 shadow transition hover:bg-amber-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:text-white disabled:shadow-none"
                  >
                    {isCurrentShopClosed ? 'Shop is Closed' : currentUser ? 'Proceed to Checkout' : 'Sign in to order'}
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                  <UtensilsCrossed className="mx-auto h-8 w-8 text-amber-300" />
                  <p className="mt-2 text-sm font-bold text-gray-800 dark:text-white">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Select delicious meals from the menu to build your order.</p>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* TAB CONTENT: FOOD MANAGER / SHOP OWNER DASHBOARD */}
        {viewTab === 'dashboard' && (
          <div className="mt-6 space-y-6">
            {/* Dashboard Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-amber-950 p-6 text-white shadow-lg">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                  <ChefHat className="h-3.5 w-3.5" /> Food Manager Dashboard
                </span>
                <h2 className="mt-2 text-2xl font-black text-white">Live Store Orders & Kitchen Queue</h2>
                <p className="mt-1 text-xs text-amber-200/80">
                  {isShopOwner
                    ? `Manage incoming orders for your ${myShops.length} registered shop${myShops.length > 1 ? 's' : ''}.`
                    : 'Register your food shop to start receiving and managing orders.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Shop Open / Closed Toggle */}
                {isShopOwner && dashboardShop && (
                  <button
                    type="button"
                    onClick={() => handleToggleShopOpen(dashboardShop)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black shadow transition cursor-pointer border-2 ${
                      dashboardShop.isOpen !== false
                        ? 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600'
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                    title={dashboardShop.isOpen !== false ? 'Click to CLOSE shop' : 'Click to OPEN shop'}
                  >
                    <span className={`h-2 w-2 rounded-full ${ dashboardShop.isOpen !== false ? 'bg-white dark:bg-gray-900 animate-pulse' : 'bg-gray-500'}`} />
                    {dashboardShop.isOpen !== false ? '🟢 Shop is OPEN' : '🔴 Shop is CLOSED'}
                  </button>
                )}

                <button
                  type="button"
                      onClick={() => currentUser ? setShowAddShopModal(true) : navigate('/sign-in')}
                  className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-gray-950 shadow transition hover:bg-amber-300"
                >
                  + {isShopOwner ? 'Add Another Shop' : 'Register My Shop'}
                </button>
                {isShopOwner && (
                  <button
                    type="button"
                    onClick={() => setShowAddMealModal(true)}
                    className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-black text-white border border-white/20 transition hover:bg-white/20"
                  >
                    + Add Meal
                  </button>
                )}
              </div>
            </div>

            {/* No shop registered — prompt to register */}
            {!isShopOwner ? (
              <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <Store className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="mt-4 text-xl font-black text-gray-900 dark:text-white">You haven't registered a food shop yet</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-white max-w-sm mx-auto">
                  Register your restaurant or food shop to appear on the customer ordering page and start managing live kitchen orders.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddShopModal(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black text-white shadow-md hover:bg-amber-600 transition"
                >
                  <PlusCircle className="h-4 w-4" /> Register My Food Shop
                </button>
                <p className="mt-3 text-xs text-gray-400">
                  Your shop will be visible to customers immediately after registration.
                </p>
              </div>
            ) : (
              <>
                {/* Owner's Shop Selector for Dashboard */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white shrink-0">My Shops:</span>
                  {myShops.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedShopId(s.id)}
                      className={`rounded-full px-4 py-2 text-xs font-black shrink-0 transition cursor-pointer ${
                        dashboardShop?.id === s.id
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-white ring-1 ring-gray-200 hover:bg-amber-50'
                      }`}
                    >
                      {s.image} {s.name}
                    </button>
                  ))}
                </div>

                {/* 🍳 TOP PROMINENT LIVE KITCHEN QUEUE SECTION FOR CHEF & STORE OWNER */}
                <div className="space-y-4 mt-2">
                  {/* 1-Hour Kitchen Rush Alert for Chef & Store Owner */}
                  {rushOrdersCount > 0 && (
                    <div className="rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 border border-red-400/50 animate-pulse">
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl p-2.5 bg-white/20 rounded-2xl">🚨</span>
                        <div>
                          <h4 className="text-base font-black uppercase tracking-wider">1-HOUR KITCHEN PREPARATION RUSH</h4>
                          <p className="text-xs text-white/95 mt-0.5">
                            You have <strong className="underline text-sm font-black">{rushOrdersCount} order(s)</strong> due for collection within 1 hour! Chef & Store Owner please prepare the food now.
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 bg-white text-rose-700 px-4 py-2 rounded-xl font-mono font-black text-xs uppercase shadow-sm">
                        ⚡ Cook Food Now
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b-2 border-amber-200/80 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">🍳</span>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-950 dark:text-white flex items-center gap-2.5">
                          <span>Live Kitchen Queue</span>
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">· {dashboardShop?.name || 'My Shop'}</span>
                          <span className="rounded-full bg-amber-500 text-white px-3 py-0.5 text-xs font-black shadow-xs animate-pulse">
                            {liveKitchenQueue.length} Active Orders
                          </span>
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                          Chefs & store owners: Tap any of the 4 step buttons below to update order progress live.
                        </p>
                      </div>
                    </div>
                    {liveKitchenQueue.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowAllKitchenQueue(prev => !prev)}
                        className="text-xs font-black text-amber-700 dark:text-amber-400 hover:text-amber-800 underline cursor-pointer"
                      >
                        {showAllKitchenQueue ? '▲ Show Less' : `▼ View More (${liveKitchenQueue.length - 4} more)`}
                      </button>
                    )}
                  </div>

                  {liveKitchenQueue.length > 0 ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        {(showAllKitchenQueue ? liveKitchenQueue : liveKitchenQueue.slice(0, 4)).map((ord) => {
                          const isRush = isOneHourPrepRush(ord);
                          const theme = getReceiptTheme(ord);
                          const timing = formatCollectionDateTime(ord);

                          return (
                            <div
                              key={ord.id || ord._id}
                              className={`rounded-3xl border-2 border-dashed ${isRush ? 'border-red-500/90 ring-2 ring-red-400/50' : theme.border} ${theme.bg} p-5 shadow-sm transition hover:shadow-md`}
                            >
                              {/* 1-Hour Prep Alert on Individual Card */}
                              {isRush && (
                                <div className="mb-3 rounded-2xl bg-red-600 text-white px-3 py-1.5 text-xs font-black flex items-center justify-between shadow-2xs animate-pulse">
                                  <span className="flex items-center gap-1.5">
                                    <span>🚨</span>
                                    <span>PREPARE MEAL NOW (Collection in ≤ 1 hour)</span>
                                  </span>
                                  <span className="bg-white text-red-700 px-2 py-0.5 rounded-md text-[10px] uppercase">
                                    Rush
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="rounded-2xl bg-amber-100 dark:bg-gray-800 p-2 text-xl font-bold shadow-2xs">{ord.shopImage || '🍱'}</span>
                                  <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{ord.customerName}</p>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-white flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-amber-600" /> {ord.customerPhone || 'No contact provided'}
                                    </p>
                                  </div>
                                </div>

                                {/* Order Matching Verification Code */}
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Verification Code</span>
                                  <span className={`rounded-lg bg-gradient-to-r ${theme.codeBg} px-2.5 py-1 text-xs font-black text-white shadow-xs font-mono`}>
                                    {ord.orderCode}
                                  </span>
                                </div>
                              </div>

                              {/* Collection Date & Time Banner for Chef / Kitchen Queue */}
                              <div className="my-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-2.5 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-base p-1 bg-amber-100 dark:bg-gray-700 rounded-lg shrink-0">📅</span>
                                  <div>
                                    <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
                                      {timing.label} (Date & Time)
                                    </span>
                                    <span className="font-black text-gray-900 dark:text-white text-xs">
                                      {timing.dateStr} at <strong className="text-amber-700 dark:text-amber-400 font-black">{timing.timeStr}</strong>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-gray-400 font-bold block uppercase">Placed</span>
                                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 font-mono">
                                    {timing.placedStr}
                                  </span>
                                </div>
                              </div>

                              {/* Items List with Pictures */}
                              <div className="my-3 space-y-1.5 rounded-2xl bg-white/70 dark:bg-gray-800/60 p-3 text-xs shadow-2xs border border-gray-100 dark:border-gray-700/60">
                                <div className="font-bold text-gray-600 dark:text-white mb-1 flex items-center justify-between">
                                  <span>Ordered Items:</span>
                                  <span className="text-[10px] text-gray-400">{ord.items?.length || 0} item(s)</span>
                                </div>
                                {ord.items?.map((it, idx) => {
                                  const itemVisual = getItemVisual(it);
                                  return (
                                    <div key={idx} className="flex justify-between items-center gap-2 text-gray-800 dark:text-white py-0.5">
                                      <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                        {itemVisual.isImage ? (
                                          <img
                                            src={itemVisual.src}
                                            alt={it.name}
                                            className="w-7 h-7 object-cover rounded-lg shadow-2xs shrink-0"
                                          />
                                        ) : (
                                          <span className="text-base p-0.5 bg-amber-50 dark:bg-gray-700 rounded-md shrink-0">
                                            {itemVisual.emoji}
                                          </span>
                                        )}
                                        <span className="truncate">
                                          <strong className="text-amber-800 dark:text-amber-300 font-extrabold mr-1">{it.quantity}x</strong>
                                          {it.name}
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold shrink-0">{formatPrice(it.price * it.quantity)}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Payment & Delivery Info */}
                              <div className="flex flex-wrap justify-between gap-2 text-xs font-bold text-gray-600 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-3">
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase">Payment</span>
                                  <span className="text-amber-800 font-extrabold">{ord.paymentStatus || ord.paymentMethod}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase">Fulfillment</span>
                                  <span className="capitalize">{ord.fulfilment}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase">Total</span>
                                  <span className="text-gray-900 dark:text-white font-black">{formatPrice(ord.total)}</span>
                                </div>
                              </div>

                              {ord.fulfilment === 'delivery' && ord.deliveryAddress && (
                                <div className="mt-2 rounded-lg bg-orange-50 p-2.5 text-xs text-orange-950 border border-orange-200">
                                  <span className="font-bold">Delivery Address:</span> {ord.deliveryAddress}
                                  {ord.deliveryNotes && <p className="text-[11px] text-orange-800 mt-0.5">Notes: {ord.deliveryNotes}</p>}
                                </div>
                              )}

                              {ord.orderComments && (
                                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-950">
                                  <span className="font-bold">Order Comments:</span> {ord.orderComments}
                                </div>
                              )}

                              {/* Owner Interactive 4-Step Order Progress Buttons */}
                              <div className="mt-3.5 pt-3 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-2 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span>👑</span>
                                    <span>Order Progress (Tap any button to update):</span>
                                  </span>
                                  <span className="font-extrabold text-xs text-amber-700 dark:text-amber-400">
                                    {ord.status === 'Completed'
                                      ? '✅ Step 4: Completed'
                                      : ord.status === 'Ready for Collection'
                                      ? '🛍️ Step 3: Ready'
                                      : ord.status === 'Preparing'
                                      ? '👨‍🍳 Step 2: Preparing'
                                      : '📝 Step 1: Received'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-black">
                                  {/* Step 1: Received */}
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Pending')}
                                    title="Set status to 1. Received"
                                    className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                                      ord.status === 'Pending'
                                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 border-amber-600'
                                        : 'bg-white hover:bg-amber-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <span className="text-base">📝</span>
                                    <span className="leading-tight text-[11px]">1. Received</span>
                                    {ord.status === 'Pending' && <span className="text-[9px] uppercase font-black bg-white/30 px-1 rounded-sm">Current</span>}
                                  </button>

                                  {/* Step 2: Prepare */}
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Preparing')}
                                    title="Set status to 2. Preparing Food"
                                    className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                                      ord.status === 'Preparing'
                                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 animate-pulse border-amber-600'
                                        : ord.status === 'Ready for Collection' || ord.status === 'Completed'
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-white hover:bg-amber-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <span className="text-base">👨‍🍳</span>
                                    <span className="leading-tight text-[11px]">2. Prepare</span>
                                    {ord.status === 'Preparing' && <span className="text-[9px] uppercase font-black bg-white/30 px-1 rounded-sm">Cooking</span>}
                                  </button>

                                  {/* Step 3: Ready */}
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Ready for Collection')}
                                    title="Set status to 3. Ready for Collection"
                                    className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                                      ord.status === 'Ready for Collection'
                                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 animate-bounce border-emerald-700'
                                        : ord.status === 'Completed'
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-white hover:bg-emerald-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <span className="text-base">🛍️</span>
                                    <span className="leading-tight text-[11px]">3. Ready</span>
                                    {ord.status === 'Ready for Collection' && <span className="text-[9px] uppercase font-black bg-white/30 px-1 rounded-sm">Waiting</span>}
                                  </button>

                                  {/* Step 4: Complete */}
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                                    title="Set status to 4. Completed / Collected"
                                    className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                                      ord.status === 'Completed'
                                        ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400 border-emerald-800'
                                        : 'bg-white hover:bg-emerald-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <span className="text-base">✅</span>
                                    <span className="leading-tight text-[11px]">4. Complete</span>
                                    {ord.status === 'Completed' && <span className="text-[9px] uppercase font-black bg-white/30 px-1 rounded-sm">Done</span>}
                                  </button>
                                </div>
                              </div>

                              {/* Order Action Buttons with Quick Next Step */}
                              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveReceiptOrder(ord)}
                                  className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-gray-800 px-3 py-1.5 text-xs font-black text-amber-900 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                                >
                                  🧾 View Receipt
                                </button>

                                <div className="flex items-center gap-1.5">
                                  {ord.status === 'Pending' && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(ord.id || ord._id, 'Preparing')}
                                      className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-black text-white shadow cursor-pointer transition active:scale-95 flex items-center gap-1"
                                    >
                                      <span>👨‍🍳</span> <span>Start Preparing Meal</span>
                                    </button>
                                  )}
                                  {ord.status === 'Preparing' && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(ord.id || ord._id, 'Ready for Collection')}
                                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-black text-white shadow animate-pulse cursor-pointer transition active:scale-95 flex items-center gap-1"
                                    >
                                      <span>🛍️</span> <span>Mark Ready for Collection</span>
                                    </button>
                                  )}
                                  {ord.status === 'Ready for Collection' && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                                      className="rounded-xl bg-gray-900 hover:bg-gray-800 px-3 py-2 text-xs font-black text-white shadow cursor-pointer transition active:scale-95 flex items-center gap-1"
                                    >
                                      <span>✅</span> <span>Confirm Order Collected</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {liveKitchenQueue.length > 4 && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAllKitchenQueue(prev => !prev)}
                            className="rounded-2xl border border-amber-300 bg-amber-50/80 dark:bg-gray-800 px-6 py-2.5 text-xs font-black text-amber-900 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                          >
                            {showAllKitchenQueue ? '▲ Show Less Orders' : `▼ View More Kitchen Orders (${liveKitchenQueue.length - 4} more)`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-sm text-gray-500 dark:text-white">
                      No active orders in the kitchen queue for {dashboardShop?.name || 'this shop'}.
                    </div>
                  )}
                </div>

                {/* Completed Orders History Section on Dashboard */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Completed & Paid Store Orders ({completedStoreOrders.length})</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      {completedStoreOrders.length > 0 && (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          Total Revenue: {formatPrice(completedStoreOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                        </span>
                      )}
                      {completedStoreOrders.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllCompletedOrders(prev => !prev)}
                          className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 underline cursor-pointer"
                        >
                          {showAllCompletedOrders ? '▲ Show Less' : `▼ View More (${completedStoreOrders.length - 6} more)`}
                        </button>
                      )}
                    </div>
                  </div>

                  {completedStoreOrders.length > 0 ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {(showAllCompletedOrders ? completedStoreOrders : completedStoreOrders.slice(0, 6)).map((ord) => {
                          const compTiming = formatCollectionDateTime(ord);
                          return (
                            <div
                              key={ord.id || ord._id}
                              className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 shadow-xs"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-gray-900 dark:text-white">{ord.customerName}</span>
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                  ✅ Code: {ord.orderCode}
                                </span>
                              </div>

                              <div className="my-1.5 rounded-xl bg-white/80 dark:bg-gray-800/80 p-2 text-[10px] text-gray-600 dark:text-gray-300 border border-emerald-100 dark:border-gray-800 flex justify-between items-center">
                                <span>📅 <strong>Collected:</strong> {compTiming.dateStr}</span>
                                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{compTiming.timeStr}</span>
                              </div>

                              <div className="text-[11px] text-gray-600 dark:text-white space-y-1 my-2">
                                <div><span className="font-bold text-gray-700 dark:text-white">Items:</span> {ord.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                                <div className="flex justify-between font-extrabold text-gray-900 dark:text-white border-t pt-1 mt-1">
                                  <span>Total Paid:</span>
                                  <span className="text-emerald-700 dark:text-emerald-400">{formatPrice(ord.total)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-emerald-100 dark:border-gray-800">
                                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/60 px-2 py-1 rounded-lg">
                                  Collected
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveReceiptOrder(ord)}
                                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-black shadow-2xs transition cursor-pointer"
                                >
                                  🧾 View Receipt
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {completedStoreOrders.length > 6 && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAllCompletedOrders(prev => !prev)}
                            className="rounded-2xl border border-emerald-300 bg-emerald-50/80 dark:bg-gray-800 px-6 py-2.5 text-xs font-black text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                          >
                            {showAllCompletedOrders ? '▲ Show Less Completed Orders' : `▼ View More Completed Orders (${completedStoreOrders.length - 6} more)`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center text-xs text-gray-400">
                      No completed orders yet. Completed orders will be archived here automatically.
                    </div>
                  )}
                </div>

                {/* Revenue Summary Section */}
                <section aria-label="Revenue summary" className="grid gap-3 sm:grid-cols-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  {[
                    { label: 'Today', value: revenueSummary.daily, detail: 'Completed today', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                    { label: 'This week', value: revenueSummary.weekly, detail: 'Mon–Sun', tone: 'border-sky-200 bg-sky-50 text-sky-800' },
                    { label: 'This month', value: revenueSummary.monthly, detail: 'Current calendar month', tone: 'border-violet-200 bg-violet-50 text-violet-800' }
                  ].map((period) => (
                    <div key={period.label} className={`rounded-2xl border p-4 shadow-sm ${period.tone}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-75">{period.label}'s revenue</p>
                      <p className="mt-1 text-2xl font-black">{formatPrice(period.value)}</p>
                      <p className="mt-1 text-xs font-semibold opacity-75">{period.detail}</p>
                    </div>
                  ))}
                </section>

                {/* Shop Improvement Advice Section */}
                <section aria-label="Shop improvement advice" className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm mt-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">Growth advice for {dashboardShop?.name}</h3>
                        <p className="mt-0.5 text-xs text-gray-600 dark:text-white">Based on your menu, completed orders and customer feedback.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddMealModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-3 py-2 text-xs font-black text-white transition hover:bg-gray-800 cursor-pointer"
                    >
                      <ListPlus className="h-3.5 w-3.5" /> Add a menu item
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {shopInsights.map((insight) => (
                      <div
                        key={insight.title}
                        className={`rounded-2xl border p-4 ${
                          insight.tone === 'emerald'
                            ? 'border-emerald-200 bg-emerald-50'
                            : insight.tone === 'rose'
                            ? 'border-rose-200 bg-rose-50'
                            : insight.tone === 'violet'
                            ? 'border-violet-200 bg-violet-50'
                            : insight.tone === 'sky'
                            ? 'border-sky-200 bg-sky-50'
                            : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-gray-700 dark:text-white" />
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{insight.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-white">{insight.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}


      </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl ring-1 ring-gray-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-600" /> Complete Food Order
              </h3>
              <button type="button" onClick={() => setShowCheckoutModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className={`mt-4 space-y-4 ${isCurrentShopClosed ? 'opacity-60 grayscale' : ''}`}>
              {isCurrentShopClosed && (
                <p className="rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-500 dark:text-white">
                  This shop has closed and is not accepting orders.
                </p>
              )}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-950"><Store className="inline h-4 w-4 text-amber-600" /> Payment is made at the counter when you collect your order.</div>

              {/* Customer Contact Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Your Full Name</label>
                  <input
                    required
                    value={checkoutData.customerName}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Contact Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={checkoutData.customerPhone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="+27 82 000 0000"
                  />
                </div>
              </div>


              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Order Comments</label>
                <textarea
                  value={checkoutData.orderComments}
                  onChange={(e) => setCheckoutData({ ...checkoutData, orderComments: e.target.value })}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Add any special requests, allergies, or extra instructions for your food order..."
                />
                <p className="mt-1 text-[11px] text-amber-900">Allergy notes are passed to the shop but cannot guarantee an allergen-free meal. Contact the shop directly for severe allergies.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Schedule for later (optional)</label>
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  value={checkoutData.scheduledFor}
                  onChange={(e) => setCheckoutData({ ...checkoutData, scheduledFor: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
                <div className="flex justify-between text-sm font-black text-amber-950">
                  <span>Total to Pay:</span>
                  <span>{formatPrice(totalCartPrice)}</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-800">
                  Payment will be made directly at the store counter upon order collection.
                </p>
              </div>

              <button
                type="submit"
                disabled={isCurrentShopClosed}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-black text-white shadow-md hover:from-amber-600 hover:to-orange-600 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Confirm Order & Get Code</span>
                <span>→</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ORDER RECEIPT & MATCHING CODE MODAL */}
      {activeReceiptOrder && (() => {
        const theme = getReceiptTheme(activeReceiptOrder);
        const overdue = isCollectionOverdue(activeReceiptOrder);
        const timing = formatCollectionDateTime(activeReceiptOrder);
        const firstVisual = getItemVisual(activeReceiptOrder.items?.[0] || { name: activeReceiptOrder.shopName, image: activeReceiptOrder.shopImage });
        const isOwnerOfActive = Boolean(
          currentUser && (
            myShops.some(s => s.id === activeReceiptOrder.shopId || s._id === activeReceiptOrder.shopId) ||
            (currentShop && currentShop.ownerId === (currentUser._id || currentUser.id)) ||
            (dashboardShop && dashboardShop.ownerId === (currentUser._id || currentUser.id))
          )
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full max-w-md rounded-3xl ${theme.bg} p-6 shadow-2xl border-2 border-dashed ${theme.border} max-h-[90vh] overflow-y-auto font-sans`}
            >
              {/* Overdue Banner if applicable */}
              {overdue && (
                <div className="mb-4 rounded-2xl bg-rose-500 text-white p-3 text-xs font-black flex items-center justify-between shadow-xs animate-pulse">
                  <span className="flex items-center gap-1.5">
                    <span>🔔</span>
                    <span>COLLECTION OVERDUE — Ready for pickup!</span>
                  </span>
                  <span className="bg-white text-rose-700 px-2 py-0.5 rounded-lg text-[10px] uppercase">
                    Waiting
                  </span>
                </div>
              )}

              <div className="text-center">
                {firstVisual.isImage ? (
                  <img
                    src={firstVisual.src}
                    alt={activeReceiptOrder.shopName}
                    className="mx-auto h-16 w-16 object-cover rounded-3xl shadow-md border-2 border-white dark:border-gray-700"
                  />
                ) : (
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white dark:bg-gray-800 text-3xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {firstVisual.emoji || activeReceiptOrder.shopImage || '🍱'}
                  </div>
                )}
                <h3 className="mt-3 text-xl font-black text-gray-950 dark:text-white">Official Food Receipt</h3>
                <p className="text-xs text-gray-500 dark:text-white mt-0.5 font-bold">
                  {activeReceiptOrder.shopName} · #{String(activeReceiptOrder.orderCode || '0000').slice(-4)}
                </p>
              </div>

              {/* Verification Matching Code Card */}
              <div className={`my-3.5 rounded-2xl bg-gradient-to-r ${theme.codeBg} p-4 text-center text-white shadow-md`}>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 block">
                  Verification Matching Code
                </span>
                <span className="mt-1 text-3xl font-black tracking-widest block font-mono">
                  {activeReceiptOrder.orderCode}
                </span>
                <p className="text-[11px] text-white/90 mt-1">
                  Present this code at the counter for fast collection.
                </p>
              </div>

              {/* PROMINENT COLLECTION DATE & TIME BOX */}
              <div className="my-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-amber-300 dark:border-amber-600/60 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-lg font-black shrink-0">
                    📅
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      {timing.label} (Date & Time)
                    </span>
                    <p className="font-black text-gray-950 dark:text-white text-xs">
                      {timing.dateStr} at <strong className="text-amber-700 dark:text-amber-400 font-black text-sm">{timing.timeStr}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-700">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">Order Placed</span>
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 font-mono block">
                    {timing.placedStr}
                  </span>
                </div>
              </div>

              {/* Itemized Food Breakdown with Pictures */}
              <div className="space-y-2 rounded-2xl bg-white/80 dark:bg-gray-800/80 p-3.5 text-xs shadow-2xs border border-gray-100 dark:border-gray-700">
                <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1 flex justify-between">
                  <span>Ordered Meal Items:</span>
                  <span>{activeReceiptOrder.items?.length || 0} item(s)</span>
                </div>
                {activeReceiptOrder.items?.map((it, idx) => {
                  const itVisual = getItemVisual(it);
                  return (
                    <div key={idx} className="flex justify-between items-center gap-2 text-gray-800 dark:text-gray-100 py-1 border-b border-dashed border-gray-100 dark:border-gray-700/50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                        {itVisual.isImage ? (
                          <img src={itVisual.src} alt={it.name} className="w-8 h-8 object-cover rounded-xl shadow-2xs shrink-0" />
                        ) : (
                          <span className="text-xl p-1 bg-amber-50 dark:bg-gray-700 rounded-lg shrink-0">
                            {itVisual.emoji}
                          </span>
                        )}
                        <span className="truncate">
                          <strong className="text-amber-800 dark:text-amber-300 font-extrabold mr-1">{it.quantity}x</strong>
                          {it.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold shrink-0">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  );
                })}

                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between items-center text-sm font-black">
                  <span className="text-gray-700 dark:text-gray-300">Total Charged:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-mono text-base">{formatPrice(activeReceiptOrder.total)}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-gray-700 dark:text-white border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500 dark:text-white">Customer:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{activeReceiptOrder.customerName} ({activeReceiptOrder.customerPhone || 'N/A'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500 dark:text-white">Fulfillment:</span>
                  <span className="font-bold capitalize">{activeReceiptOrder.fulfilment === 'pickup' ? 'Counter Pickup' : 'Delivery to Door'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500 dark:text-white">Payment Method:</span>
                  <span className="font-bold text-amber-800 dark:text-amber-300">{activeReceiptOrder.paymentStatus || activeReceiptOrder.paymentMethod || 'Pay at Counter on Pickup'}</span>
                </div>
                {activeReceiptOrder.orderComments && (
                  <div className="mt-2 rounded-xl bg-amber-50 dark:bg-gray-800 p-2 text-[11px] text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-gray-700">
                    <strong>Comments:</strong> {activeReceiptOrder.orderComments}
                  </div>
                )}
              </div>

              {/* Live 4-Step Order Progression Tracker */}
              <div className="mt-3 pt-2.5 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    {isOwnerOfActive && <span>👑</span>}
                    <span>{isOwnerOfActive ? 'Owner Order Progress (Tap to update):' : 'Order Status:'}</span>
                  </span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400">
                    {activeReceiptOrder.status === 'Completed'
                      ? 'Step 4 of 4: Collected ✅'
                      : activeReceiptOrder.status === 'Ready for Collection'
                      ? 'Step 3 of 4: Ready for Collection'
                      : activeReceiptOrder.status === 'Preparing'
                      ? 'Step 2 of 4: Preparing Food'
                      : 'Step 1 of 4: Order Received'}
                  </span>
                </div>

                {isOwnerOfActive ? (
                  /* Shop Owner: Interactive Step Buttons */
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-black">
                    {/* Step 1: Received */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(activeReceiptOrder.id || activeReceiptOrder._id, 'Pending')}
                      title="Set status to 1. Received"
                      className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                        activeReceiptOrder.status === 'Pending'
                          ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 border-amber-600'
                          : 'bg-white hover:bg-amber-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm">📝</span>
                      <span className="leading-tight text-[10px]">1. Received</span>
                      {activeReceiptOrder.status === 'Pending' && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Current</span>}
                    </button>

                    {/* Step 2: Prepare */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(activeReceiptOrder.id || activeReceiptOrder._id, 'Preparing')}
                      title="Set status to 2. Preparing Food"
                      className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                        activeReceiptOrder.status === 'Preparing'
                          ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 animate-pulse border-amber-600'
                          : activeReceiptOrder.status === 'Ready for Collection' || activeReceiptOrder.status === 'Completed'
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white hover:bg-amber-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm">👨‍🍳</span>
                      <span className="leading-tight text-[10px]">2. Prepare</span>
                      {activeReceiptOrder.status === 'Preparing' && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Cooking</span>}
                    </button>

                    {/* Step 3: Ready */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(activeReceiptOrder.id || activeReceiptOrder._id, 'Ready for Collection')}
                      title="Set status to 3. Ready for Collection"
                      className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                        activeReceiptOrder.status === 'Ready for Collection'
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 animate-bounce border-emerald-700'
                          : activeReceiptOrder.status === 'Completed'
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white hover:bg-emerald-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm">🛍️</span>
                      <span className="leading-tight text-[10px]">3. Ready</span>
                      {activeReceiptOrder.status === 'Ready for Collection' && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Waiting</span>}
                    </button>

                    {/* Step 4: Complete */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(activeReceiptOrder.id || activeReceiptOrder._id, 'Completed')}
                      title="Set status to 4. Completed / Collected"
                      className={`rounded-xl p-2 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                        activeReceiptOrder.status === 'Completed'
                          ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400 border-emerald-800'
                          : 'bg-white hover:bg-emerald-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm">✅</span>
                      <span className="leading-tight text-[10px]">4. Complete</span>
                      {activeReceiptOrder.status === 'Completed' && <span className="text-[8px] uppercase font-bold bg-white/30 px-1 rounded-sm">Done</span>}
                    </button>
                  </div>
                ) : (
                  /* Customer: Visual Stepper */
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black">
                    <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                      activeReceiptOrder.status === 'Pending'
                        ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}>
                      <span>📝</span>
                      <span className="leading-tight">1. Received</span>
                    </div>

                    <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                      activeReceiptOrder.status === 'Preparing'
                        ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 animate-pulse'
                        : activeReceiptOrder.status === 'Ready for Collection' || activeReceiptOrder.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <span>👨‍🍳</span>
                      <span className="leading-tight">2. Preparing</span>
                    </div>

                    <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                      activeReceiptOrder.status === 'Ready for Collection'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400 animate-bounce'
                        : activeReceiptOrder.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <span>🛍️</span>
                      <span className="leading-tight">3. Ready</span>
                    </div>

                    <div className={`rounded-xl p-1.5 transition flex flex-col items-center justify-center gap-0.5 ${
                      activeReceiptOrder.status === 'Completed'
                        ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <span>✅</span>
                      <span className="leading-tight">4. Collected</span>
                    </div>
                  </div>
                )}

                {/* Confirm Collection Button when Ready */}
                {activeReceiptOrder.status === 'Ready for Collection' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(activeReceiptOrder.id || activeReceiptOrder._id, 'Completed')}
                      className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-3 px-4 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                    >
                      <span>✅</span>
                      <span>{isOwnerOfActive ? 'Confirm Customer Collected Order (Step 4)' : 'I Have Collected My Meal (Press to Confirm)'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Rating Trigger inside Receipt */}
              <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                {activeReceiptOrder.isRated ? (
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                    <span>⭐ Thank you! Rated & archived to Dashboard.</span>
                    <button
                      type="button"
                      onClick={() => setActiveReceiptOrder(null)}
                      className="text-[11px] font-black underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                ) : activeReceiptOrder.status !== 'Completed' ? (
                  <div className="rounded-xl bg-white/70 dark:bg-gray-800 p-2.5 text-center text-xs font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">
                    Ratings unlock after your order is collected.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRatingTargetOrder(activeReceiptOrder);
                      setShowRateModal(true);
                    }}
                    className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow-sm hover:bg-amber-600 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Star className="h-4 w-4 fill-current" /> Rate Shop & Food Service
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveReceiptOrder(null)}
                className="mt-3 w-full rounded-2xl bg-gray-950 py-3 text-sm font-black text-white hover:bg-gray-800 transition cursor-pointer"
              >
                {activeReceiptOrder.status === 'Completed'
                  ? '✅ Done — Archive Receipt to History & Close'
                  : 'Done & Close Receipt'}
              </button>
            </motion.div>
          </div>
        );
      })()}

      {/* CONTACT CARD MODAL */}
      <AnimatePresence>
        {showContactCard && currentShop && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setShowContactCard(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header gradient banner */}
              <div className={`relative bg-gradient-to-br ${activeTheme.heroBg} p-6 text-center overflow-hidden`}>
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${activeTheme.heroGlow} rounded-full blur-3xl pointer-events-none`} />
                {/* Close pill */}
                <button
                  type="button"
                  onClick={() => setShowContactCard(false)}
                  className="absolute top-3 right-3 rounded-full bg-white/15 p-1.5 hover:bg-white/30 transition cursor-pointer"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                {/* Avatar */}
                <div className="relative z-10">
                  <div className="mx-auto h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <span className="text-3xl">{currentShop.image || '🏪'}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white tracking-tight">
                    {currentShop.ownerName || 'Shop Contact'}
                  </h3>
                  <p className="text-xs text-white/70 font-medium mt-0.5">
                    {currentShop.name} · Store Manager
                  </p>
                  {/* Rating badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full px-3 py-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-amber-300">
                      {currentShop.rating || '5.0'} rating · {currentShop.reviews?.length || 0} reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div className="p-5 space-y-3">

                {/* Phone — tap to call */}
                {currentShop.phone && (
                  <a
                    href={`tel:${currentShop.phone}`}
                    className="flex items-center gap-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-amber-50 border border-gray-100 dark:border-gray-800 hover:border-amber-200 px-4 py-3.5 transition group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition">
                      <Phone className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone · Tap to Call</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{currentShop.phone}</p>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-amber-400 rotate-180 ml-auto shrink-0" />
                  </a>
                )}

                {/* WhatsApp */}
                {(currentShop.whatsapp || currentShop.phone) && (
                  <a
                    href={`https://wa.me/${(currentShop.whatsapp || currentShop.phone).replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-300 px-4 py-3.5 transition group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition">
                      <span className="text-xl">💬</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">WhatsApp · Tap to Chat</p>
                      <p className="text-sm font-black text-emerald-900 truncate">
                        {currentShop.whatsapp || currentShop.phone}
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-emerald-400 rotate-180 ml-auto shrink-0" />
                  </a>
                )}

                {/* Location */}
                {(currentShop.address || currentShop.distance) && (
                  <div className="flex items-center gap-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-4 py-3.5">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {currentShop.address || currentShop.distance}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom safe area for mobile */}
              <div className="px-5 pb-6">
                <button
                  type="button"
                  onClick={() => setShowContactCard(false)}
                  className="w-full rounded-2xl bg-gray-950 py-3.5 text-sm font-black text-white hover:bg-gray-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD / REGISTER SHOP MODAL */}
      {showAddShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" /> Upload New Shop
              </h3>
              <button type="button" onClick={() => setShowAddShopModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShopSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Shop Name *</label>
                <input
                  required
                  value={newShopForm.name}
                  onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. Mama's Tasty Bites"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Shop Type / Category *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Greedy', 'Local', 'Local Favorite', 'Greedy & Flame', 'Health & Veggie'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewShopForm({ ...newShopForm, cuisine: cat })}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
                        newShopForm.cuisine === cat
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-800 hover:bg-amber-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Custom Type</label>
                    <input
                      value={newShopForm.cuisine}
                      onChange={(e) => setNewShopForm({ ...newShopForm, cuisine: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Selected or custom type"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Cover Icon (Emoji)</label>
                    <input
                      value={newShopForm.image}
                      onChange={(e) => setNewShopForm({ ...newShopForm, image: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Cover Emoji 🥙, 🍺, 🍔"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Tap Cover Emoji Picker for Shop */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider block mb-1">Quick Tap Shop Cover Emoji Icon:</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 max-h-24 overflow-y-auto">
                  {FOOD_EMOJIS.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewShopForm(prev => ({ ...prev, image: item.emoji }))}
                      className={`text-lg p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer ${newShopForm.image === item.emoji ? 'bg-amber-200 ring-2 ring-amber-400' : ''}`}
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Address / Location</label>
                <input
                  value={newShopForm.address}
                  onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="12 Main Street, Central"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Distance Estimate</label>
                  <input
                    value={newShopForm.distance}
                    onChange={(e) => setNewShopForm({ ...newShopForm, distance: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="1.5 km"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Prep Time</label>
                  <input
                    value={newShopForm.time}
                    onChange={(e) => setNewShopForm({ ...newShopForm, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="20–30 min"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-white block">Contact Numbers</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-500 pointer-events-none" />
                    <input
                      type="tel"
                      value={newShopForm.phone}
                      onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Call number"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">💬</span>
                    <input
                      type="tel"
                      value={newShopForm.whatsapp}
                      onChange={(e) => setNewShopForm({ ...newShopForm, whatsapp: e.target.value })}
                      className="w-full rounded-xl border border-emerald-200 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="WhatsApp number"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Enter numbers with country code e.g. 27821234567</p>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <label className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" /> Operating Hours
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 dark:text-white block mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={newShopForm.operatingHours?.openTime || '08:00'}
                      onChange={(e) => setNewShopForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, openTime: e.target.value } }))}
                      className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 dark:text-white block mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={newShopForm.operatingHours?.closeTime || '20:00'}
                      onChange={(e) => setNewShopForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, closeTime: e.target.value } }))}
                      className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-600 dark:text-white block mb-1.5">Open Days</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isSelected = (newShopForm.operatingHours?.days || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = newShopForm.operatingHours?.days || [];
                            const newDays = isSelected ? days.filter(d => d !== day) : [...days, day];
                            setNewShopForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, days: newDays } }));
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black transition cursor-pointer border ${
                            isSelected ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-white border-gray-200 dark:border-gray-800 hover:border-amber-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-200">
                  <div>
                    <span className="text-xs font-black text-gray-800 dark:text-white">Shop Status on Launch</span>
                    <p className="text-[10px] text-gray-500 dark:text-white">You can change this anytime in dashboard</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewShopForm(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 cursor-pointer ${
                      newShopForm.isOpen ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-900 shadow-md transition-transform duration-300 ${
                      newShopForm.isOpen ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-[9px] font-black ${ newShopForm.isOpen ? 'left-1.5 text-white' : 'right-1.5 text-gray-500 dark:text-white'}`}>
                      {newShopForm.isOpen ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow hover:bg-amber-600 transition"
              >
                Register Shop
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ADD MENU ITEM MODAL */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" /> Add Meal to {currentShop?.name}
              </h3>
              <button type="button" onClick={() => setShowAddMealModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMealSubmit} className="mt-4 space-y-3">
              {/* Tuck Shop AI Helper Banner */}
              <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                  <span className="text-xs font-black text-amber-900">Tuck Shop AI Assistant</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAiAutoFillMeal(false)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-black text-white hover:from-amber-600 hover:to-orange-600 transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  ✨ AI Auto-Fill & Emoji
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Meal Name *</label>
                <input
                  required
                  value={newMealForm.name}
                  onChange={(e) => setNewMealForm({ ...newMealForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. Deluxe Kota or BBQ Chicken"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Description</label>
                <textarea
                  value={newMealForm.description}
                  onChange={(e) => setNewMealForm({ ...newMealForm, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Juicy beef patty with fresh lettuce and sauce"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Price (R) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newMealForm.price}
                    onChange={(e) => setNewMealForm({ ...newMealForm, price: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Badge Tag</label>
                  <select
                    value={newMealForm.tag}
                    onChange={(e) => setNewMealForm({ ...newMealForm, tag: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option>Popular</option>
                    <option>New</option>
                    <option>Chef Special</option>
                    <option>Vegetarian</option>
                    <option>Fresh</option>
                    <option>Drinks</option>
                    <option>🔥 Hot Seller</option>
                    <option>👑 Local Classic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Icon Emoji</label>
                  <input
                    value={newMealForm.image}
                    onChange={(e) => setNewMealForm({ ...newMealForm, image: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="🍔, 🌯, 🥗"
                  />
                </div>
              </div>

              {/* Quick Select Emoji Picker */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider block mb-1">Quick Tap Food Emoji Icon:</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 max-h-20 overflow-y-auto">
                  {FOOD_EMOJIS.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewMealForm(prev => ({ ...prev, image: item.emoji }))}
                      className={`text-lg p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer ${newMealForm.image === item.emoji ? 'bg-amber-200 ring-2 ring-amber-400' : ''}`}
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow hover:bg-amber-600 transition"
              >
                Add Meal to Menu
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT SHOP MODAL */}
      {showEditShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" /> Edit Shop Details
              </h3>
              <button type="button" onClick={() => setShowEditShopModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditShopSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Shop Name *</label>
                <input
                  required
                  value={editShopForm.name}
                  onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Shop Type / Category *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Greedy', 'Local', 'Local Favorite', 'Greedy & Flame', 'Health & Veggie'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditShopForm({ ...editShopForm, cuisine: cat })}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
                        editShopForm.cuisine === cat
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-800 hover:bg-amber-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Custom Type</label>
                    <input
                      value={editShopForm.cuisine}
                      onChange={(e) => setEditShopForm({ ...editShopForm, cuisine: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Selected or custom type"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Cover Icon (Emoji)</label>
                    <input
                      value={editShopForm.image}
                      onChange={(e) => setEditShopForm({ ...editShopForm, image: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Cover Emoji"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Tap Cover Emoji Picker for Edit Shop */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider block mb-1">Quick Tap Shop Cover Emoji Icon:</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 max-h-24 overflow-y-auto">
                  {FOOD_EMOJIS.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditShopForm(prev => ({ ...prev, image: item.emoji }))}
                      className={`text-lg p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer ${editShopForm.image === item.emoji ? 'bg-amber-200 ring-2 ring-amber-400' : ''}`}
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Address / Location</label>
                <input
                  value={editShopForm.address}
                  onChange={(e) => setEditShopForm({ ...editShopForm, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Distance Estimate</label>
                  <input
                    value={editShopForm.distance}
                    onChange={(e) => setEditShopForm({ ...editShopForm, distance: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Prep Time</label>
                  <input
                    value={editShopForm.time}
                    onChange={(e) => setEditShopForm({ ...editShopForm, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-white block">Contact Numbers</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-500 pointer-events-none" />
                    <input
                      type="tel"
                      value={editShopForm.phone}
                      onChange={(e) => setEditShopForm({ ...editShopForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Call number"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">💬</span>
                    <input
                      type="tel"
                      value={editShopForm.whatsapp}
                      onChange={(e) => setEditShopForm({ ...editShopForm, whatsapp: e.target.value })}
                      className="w-full rounded-xl border border-emerald-200 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="WhatsApp number"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Enter numbers with country code e.g. 27821234567</p>
              </div>

              {/* Operating Hours – Edit */}
              <div className="space-y-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <label className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" /> Operating Hours
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 dark:text-white block mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={editShopForm.operatingHours?.openTime || '08:00'}
                      onChange={(e) => setEditShopForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, openTime: e.target.value } }))}
                      className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 dark:text-white block mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={editShopForm.operatingHours?.closeTime || '20:00'}
                      onChange={(e) => setEditShopForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, closeTime: e.target.value } }))}
                      className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-600 dark:text-white block mb-1.5">Open Days</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isSelected = (editShopForm.operatingHours?.days || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = editShopForm.operatingHours?.days || [];
                            const newDays = isSelected ? days.filter(d => d !== day) : [...days, day];
                            setEditShopForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, days: newDays } }));
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black transition cursor-pointer border ${
                            isSelected ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-white border-gray-200 dark:border-gray-800 hover:border-amber-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-black text-white shadow hover:bg-slate-800 transition"
              >
                Save Shop Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT MEAL MODAL */}
      {showEditMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" /> Edit Menu Item
              </h3>
              <button type="button" onClick={() => setShowEditMealModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditMealSubmit} className="mt-4 space-y-3">
              {/* Tuck Shop AI Helper Banner */}
              <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                  <span className="text-xs font-black text-amber-900">Tuck Shop AI Assistant</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAiAutoFillMeal(true)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-black text-white hover:from-amber-600 hover:to-orange-600 transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  ✨ AI Auto-Fill & Emoji
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Meal Name *</label>
                <input
                  required
                  value={editMealForm.name}
                  onChange={(e) => setEditMealForm({ ...editMealForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Description</label>
                <textarea
                  value={editMealForm.description}
                  onChange={(e) => setEditMealForm({ ...editMealForm, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Price (R) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editMealForm.price}
                    onChange={(e) => setEditMealForm({ ...editMealForm, price: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Badge Tag</label>
                  <select
                    value={editMealForm.tag}
                    onChange={(e) => setEditMealForm({ ...editMealForm, tag: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option>Popular</option>
                    <option>New</option>
                    <option>Chef Special</option>
                    <option>Vegetarian</option>
                    <option>Fresh</option>
                    <option>Drinks</option>
                    <option>🔥 Hot Seller</option>
                    <option>👑 Local Classic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Icon Emoji</label>
                  <input
                    value={editMealForm.image}
                    onChange={(e) => setEditMealForm({ ...editMealForm, image: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Quick Select Emoji Picker */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider block mb-1">Quick Tap Food Emoji Icon:</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 max-h-20 overflow-y-auto">
                  {FOOD_EMOJIS.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditMealForm(prev => ({ ...prev, image: item.emoji }))}
                      className={`text-lg p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer ${editMealForm.image === item.emoji ? 'bg-amber-200 ring-2 ring-amber-400' : ''}`}
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow hover:bg-amber-600 transition"
              >
                Save Meal Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* RATE SHOP & FOOD SERVICE MODAL */}
      {showRateModal && ratingTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" /> Rate Store & Food Experience
              </h3>
              <button type="button" onClick={() => setShowRateModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-900 block">{ratingTargetOrder.shopName}</span>
                <span className="text-xs text-amber-700">Order Code: {ratingTargetOrder.orderCode}</span>
              </div>

              {/* Shop Service Rating Stars */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1 text-center">
                  Shop Service Rating ({shopRating} / 5 Stars)
                </label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setShopRating(star)}
                      className="p-1 transition transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= shopRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Food & Quality Rating Stars */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1 text-center">
                  Food & Quality Rating ({foodRating} / 5 Stars)
                </label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFoodRating(star)}
                      className="p-1 transition transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= foodRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Comment */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-white block mb-1">Your Review / Feedback</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Tell us about the food quality, speed, or service..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-white shadow hover:bg-amber-600 transition flex items-center justify-center gap-2"
              >
                <ThumbsUp className="h-4 w-4" /> Submit Rating & Review
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* FIXED FLOATING STICKY ORDER BASKET BAR (AT THE BOTTOM OF SCREEN) */}
      {cart.length > 0 && viewTab === 'customer' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/80 to-transparent backdrop-blur-md">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-3.5 sm:p-4 text-white shadow-2xl ring-2 ring-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                <ShoppingBag className="h-6 w-6 text-white" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[11px] font-black text-amber-300 shadow">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 block">Your Food Basket</span>
                <span className="text-lg sm:text-xl font-black text-white">{formatPrice(totalCartPrice)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isCurrentShopClosed}
              onClick={() => currentUser ? setShowCheckoutModal(true) : navigate('/sign-in')}
              className="rounded-xl bg-slate-950 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-amber-300 hover:bg-slate-900 transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-200 disabled:shadow-none"
            >
              <span>{isCurrentShopClosed ? 'Shop is Closed' : currentUser ? 'View Basket & Checkout' : 'Sign in to order'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
