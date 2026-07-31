import React, { useMemo, useState, useEffect } from 'react';
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
  ThumbsUp
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
  PRESET_MOODS, 
  generateVendorMealAI, 
  generateUserLunchAIRecommendation 
} from '../utils/aiLunchAssistant';

const formatPrice = (price) => `R${Number(price || 0).toFixed(2)}`;

const SHOP_THEMES = [
  {
    id: 'amber',
    badge: 'bg-amber-500 text-white',
    badgeLight: 'bg-amber-100 text-amber-900 border border-amber-300',
    cardActive: 'border-amber-500 bg-gradient-to-br from-amber-50 via-white to-amber-100/40 ring-2 ring-amber-400 shadow-amber-500/20 shadow-md',
    cardNormal: 'border-gray-200 bg-white hover:border-amber-300',
    heroBg: 'from-amber-950 via-amber-900 to-slate-950 border-amber-500/40 text-white',
    heroGlow: 'bg-amber-500/20',
    btnPrimary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30',
    tabActive: 'bg-amber-500 text-white shadow-md',
    accentText: 'text-amber-600',
    priceText: 'text-amber-700 font-black',
    accentBg: 'bg-amber-500'
  },
  {
    id: 'emerald',
    badge: 'bg-emerald-600 text-white',
    badgeLight: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    cardActive: 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 ring-2 ring-emerald-400 shadow-emerald-500/20 shadow-md',
    cardNormal: 'border-gray-200 bg-white hover:border-emerald-300',
    heroBg: 'from-emerald-950 via-teal-900 to-slate-950 border-emerald-500/40 text-white',
    heroGlow: 'bg-emerald-500/20',
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
    cardActive: 'border-rose-500 bg-gradient-to-br from-rose-50 via-white to-rose-100/40 ring-2 ring-rose-400 shadow-rose-500/20 shadow-md',
    cardNormal: 'border-gray-200 bg-white hover:border-rose-300',
    heroBg: 'from-rose-950 via-pink-900 to-slate-950 border-rose-500/40 text-white',
    heroGlow: 'bg-rose-500/20',
    btnPrimary: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-rose-500/30',
    tabActive: 'bg-rose-600 text-white shadow-md',
    accentText: 'text-rose-600',
    priceText: 'text-rose-700 font-black',
    accentBg: 'bg-rose-500'
  },
  {
    id: 'purple',
    badge: 'bg-purple-600 text-white',
    badgeLight: 'bg-purple-100 text-purple-900 border border-purple-300',
    cardActive: 'border-purple-500 bg-gradient-to-br from-purple-50 via-white to-purple-100/40 ring-2 ring-purple-400 shadow-purple-500/20 shadow-md',
    cardNormal: 'border-gray-200 bg-white hover:border-purple-300',
    heroBg: 'from-purple-950 via-indigo-900 to-slate-950 border-purple-500/40 text-white',
    heroGlow: 'bg-purple-500/20',
    btnPrimary: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-purple-500/30',
    tabActive: 'bg-purple-600 text-white shadow-md',
    accentText: 'text-purple-600',
    priceText: 'text-purple-700 font-black',
    accentBg: 'bg-purple-500'
  },
  {
    id: 'cyan',
    badge: 'bg-cyan-600 text-white',
    badgeLight: 'bg-cyan-100 text-cyan-900 border border-cyan-300',
    cardActive: 'border-cyan-500 bg-gradient-to-br from-cyan-50 via-white to-cyan-100/40 ring-2 ring-cyan-400 shadow-cyan-500/20 shadow-md',
    cardNormal: 'border-gray-200 bg-white hover:border-cyan-300',
    heroBg: 'from-cyan-950 via-blue-900 to-slate-950 border-cyan-500/40 text-white',
    heroGlow: 'bg-cyan-500/20',
    btnPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-cyan-500/30',
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

export default function LunchComingSoon() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user || {});

  // Main navigation view: 'customer' or 'dashboard'
  const [viewTab, setViewTab] = useState('customer');

  // Customer state
  const [orderMode, setOrderMode] = useState('order'); // 'order' or 'table'
  const [fulfilment, setFulfilment] = useState('pickup'); // 'pickup' or 'delivery'
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notice, setNotice] = useState(null);

  // Form states for checkout & delivery
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customerName: currentUser?.username || currentUser?.name || '',
    customerPhone: currentUser?.phone || '',
    deliveryAddress: currentUser?.address || '',
    deliveryNotes: '',
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
    phone: ''
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
    phone: ''
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

  // Rating states
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingTargetOrder, setRatingTargetOrder] = useState(null);
  const [shopRating, setShopRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showReviewsTab, setShowReviewsTab] = useState(false);

  // AI Lunch Assistant States
  const [showAiLunchSection, setShowAiLunchSection] = useState(true);
  const [selectedMood, setSelectedMood] = useState('comfort');
  const [customFoodQuery, setCustomFoodQuery] = useState('');
  const [aiMealMatches, setAiMealMatches] = useState([]);
  const [aiRecommendationIndex, setAiRecommendationIndex] = useState(0);

  // Auto-run AI matchmaker when shops populate
  useEffect(() => {
    if (shops && shops.length > 0 && aiMealMatches.length === 0) {
      const matches = generateUserLunchAIRecommendation(shops, selectedMood, customFoodQuery);
      setAiMealMatches(matches);
      setAiRecommendationIndex(0);
    }
  }, [shops]);

  const handleRunAiMatchmaker = (mood = selectedMood, query = customFoodQuery) => {
    setSelectedMood(mood);
    const matches = generateUserLunchAIRecommendation(shops, mood, query);
    setAiMealMatches(matches);
    setAiRecommendationIndex(0);
  };

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
    try {
      await rateShop(ratingTargetOrder.shopId, {
        orderId: ratingTargetOrder.id || ratingTargetOrder._id,
        shopRating,
        foodRating,
        comment: ratingComment,
        userName: currentUser?.username || currentUser?.name || 'Valued Customer'
      });
      setShowRateModal(false);
      if (activeReceiptOrder && (activeReceiptOrder.id === ratingTargetOrder.id || activeReceiptOrder._id === ratingTargetOrder._id)) {
        setActiveReceiptOrder(prev => prev ? { ...prev, isRated: true } : null);
      }
      setNotice({ type: 'success', message: '⭐ Thank you for rating your shop & food experience!' });
      setRatingComment('');
    } catch (err) {
      console.error("Rate shop error:", err);
      setNotice({ type: 'error', message: err.message || 'Error submitting rating' });
    }
  };

  // Subscribe to Firestore shops & orders
  useEffect(() => {
    const unsubscribeShops = subscribeToShops((fetchedShops) => {
      setShops(fetchedShops);
      if (fetchedShops.length > 0 && !selectedShopId) {
        setSelectedShopId(fetchedShops[0].id);
      }
    });

    const unsubscribeOrders = subscribeToOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
    });

    return () => {
      unsubscribeShops();
      unsubscribeOrders();
    };
  }, []);

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
  }, [currentUser]);

  // Selected active shop
  const currentShop = useMemo(() => {
    return shops.find((s) => s.id === selectedShopId) || shops[0] || null;
  }, [shops, selectedShopId]);

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
    return shops.filter((s) => s.ownerId === uid || s.ownerId === 'guest');
  }, [shops, currentUser]);

  // Whether the current user owns at least one shop
  const isShopOwner = myShops.length > 0;

  // The shop selected on the dashboard (only owner's shops are valid here)
  const dashboardShop = useMemo(() => {
    return myShops.find((s) => s.id === selectedShopId) || myShops[0] || null;
  }, [myShops, selectedShopId]);

  // Filter active (uncompleted) orders for customer view banner
  const myCustomerOrders = useMemo(() => {
    const uid = currentUser?._id || currentUser?.id || 'guest';
    return orders.filter((o) => (o.customerId === uid || o.customerId === 'guest') && o.status !== 'Completed');
  }, [orders, currentUser]);

  // Completed orders for customer past history
  const myCompletedCustomerOrders = useMemo(() => {
    const uid = currentUser?._id || currentUser?.id || 'guest';
    return orders.filter((o) => (o.customerId === uid || o.customerId === 'guest') && o.status === 'Completed');
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

  // Completed orders history for shop owner
  const completedStoreOrders = useMemo(() => {
    return activeShopOrders.filter((o) => o.status === 'Completed');
  }, [activeShopOrders]);


  // Cart operations
  const addToCart = (meal) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === meal.id);
      if (existing) {
        return items.map((item) => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { ...meal, quantity: 1 }];
    });
  };

  const updateQuantity = (mealId, change) => {
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

    if (!checkoutData.customerPhone) {
      alert("Please provide a contact phone number so the shop and delivery driver can reach you.");
      return;
    }

    if (fulfilment === 'delivery' && !checkoutData.deliveryAddress) {
      alert("Please enter your delivery address.");
      return;
    }

    try {
      const orderPayload = {
        customerId: currentUser?._id || currentUser?.id || 'guest',
        customerName: checkoutData.customerName || 'Valued Customer',
        customerPhone: checkoutData.customerPhone,
        shopId: currentShop.id,
        shopName: currentShop.name,
        shopImage: currentShop.image || '🍱',
        items: cart,
        total: totalCartPrice,
        fulfilment,
        deliveryAddress: checkoutData.deliveryAddress,
        deliveryNotes: checkoutData.deliveryNotes,
        paymentMethod: checkoutData.paymentMethod
      };

      const created = await createLunchOrder(orderPayload);
      setCart([]);
      setShowCheckoutModal(false);
      setActiveReceiptOrder(created);

      setNotice({
        type: 'success',
        message: `Order #${created.orderCode} placed successfully! ${
          checkoutData.paymentMethod === 'counter'
            ? 'Pay at the store counter upon pickup.'
            : 'Confirmation sent.'
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
    try {
      await createTableBooking({
        ...booking,
        shopId: currentShop.id,
        shopName: currentShop.name,
        customerId: currentUser?._id || currentUser?.id || 'guest'
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
    try {
      const newShopId = await createShop({
        ...newShopForm,
        ownerId: currentUser?._id || currentUser?.id || 'guest',
        ownerName: currentUser?.username || 'Store Manager'
      });
      setShowAddShopModal(false);
      setSelectedShopId(newShopId);
      setNotice({ type: 'success', message: `Shop "${newShopForm.name.trim()}" created successfully!` });
      setNewShopForm({ name: '', cuisine: '', distance: '1.5 km', time: '20–30 min', image: '🥙', address: '', phone: '' });
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

  // Handle Order Status Update (By Shop Owner)
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setNotice({
        type: 'info',
        message: `Order status updated to: ${newStatus}`
      });
    } catch (err) {
      console.error("Status update error:", err);
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
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-amber-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
                <UtensilsCrossed className="h-7 w-7 text-amber-600" />
                Lunch & Food Hub
              </h1>
              <p className="text-xs text-gray-500 font-medium">Order food, book tables & manage store orders</p>
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
              {orders.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-950 px-2 py-0.5 text-[10px] text-amber-300">
                  {orders.length}
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

        {/* Active Order Status Notification Banner (For Buyers) */}
        {myCustomerOrders.length > 0 && (
          <div className="mt-4 space-y-3">
            {myCustomerOrders.slice(0, 2).map((ord) => {
              const isReady = ord.status === 'Ready for Collection';
              const isPreparing = ord.status === 'Preparing';
              const isCompleted = ord.status === 'Completed';

              return (
                <div
                  key={ord.id || ord._id}
                  onClick={() => setActiveReceiptOrder(ord)}
                  className={`cursor-pointer rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${
                    isReady
                      ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 ring-2 ring-emerald-400'
                      : isPreparing
                      ? 'border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl rounded-2xl bg-white p-2 shadow-xs border border-amber-100">{ord.shopImage || '🍱'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 text-base">{ord.shopName}</span>
                          <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-black text-amber-950 border border-amber-300">
                            Code: {ord.orderCode}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          {ord.items?.length || 0} items · <span className="font-bold text-amber-800">{formatPrice(ord.total)}</span> · {ord.fulfilment === 'pickup' ? 'Store Pickup (Pay at Counter)' : 'Delivery to Door'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black shadow-xs ${
                        isReady
                          ? 'bg-emerald-600 text-white animate-bounce'
                          : isPreparing
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-800 text-white'
                      }`}>
                        <Bell className="h-3.5 w-3.5" />
                        {isReady ? '🎉 FOOD READY TO COLLECT!' : isPreparing ? '👨‍🍳 CHEF IS COOKING' : `Status: ${ord.status}`}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingTargetOrder(ord);
                          setShowRateModal(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-white hover:bg-amber-600 transition shadow-xs"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {ord.isRated ? 'Rated ⭐' : 'Rate Food'}
                      </button>

                      <span className="text-xs font-extrabold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-full border border-amber-300">
                        View Code 📋
                      </span>
                    </div>
                  </div>

                  {/* Visual 3-Step Progress Bar for 5-Year-Old Level Clarity */}
                  <div className="mt-4 pt-3 border-t border-amber-200/50">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                      {/* Step 1 */}
                      <div className={`rounded-xl p-2 transition flex items-center justify-center gap-1.5 ${
                        !isPreparing && !isReady && !isCompleted
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <span>📝</span> <span>1. Order Placed</span>
                      </div>

                      {/* Step 2 */}
                      <div className={`rounded-xl p-2 transition flex items-center justify-center gap-1.5 ${
                        isPreparing
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 animate-pulse'
                          : isReady || isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span>👨‍🍳</span> <span>2. Cooking</span>
                      </div>

                      {/* Step 3 */}
                      <div className={`rounded-xl p-2 transition flex items-center justify-center gap-1.5 ${
                        isReady
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 animate-bounce'
                          : isCompleted
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span>🎉</span> <span>3. Ready to Collect!</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB CONTENT: CUSTOMER VIEW */}
        {viewTab === 'customer' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section>
              {/* Mode Toggle: Order Lunch vs Book Table */}
              <div className="flex rounded-2xl bg-amber-200/50 p-1.5 ring-1 ring-amber-300/40">
                <button
                  type="button"
                  onClick={() => setOrderMode('order')}
                  className={`flex-1 rounded-xl py-3 text-sm font-black transition ${
                    orderMode === 'order' ? 'bg-white text-amber-800 shadow-sm' : 'text-amber-900/70 hover:text-amber-900'
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-600" /> Order Lunch
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('table')}
                  className={`flex-1 rounded-xl py-3 text-sm font-black transition ${
                    orderMode === 'table' ? 'bg-white text-amber-800 shadow-sm' : 'text-amber-900/70 hover:text-amber-900'
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-amber-600" /> Book a Table
                  </span>
                </button>
              </div>

              {/* AI Lunch Assistant Banner & Matchmaker for Customers */}
              <div className="mt-4 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 p-5 text-white shadow-lg border border-amber-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-amber-200">AI Lunch Matchmaker</h3>
                      <p className="text-[11px] text-amber-100/70">What are you craving today? Let AI find the best meal</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAiLunchSection(prev => !prev)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-200 hover:bg-white/20 transition cursor-pointer"
                  >
                    {showAiLunchSection ? 'Hide AI' : 'Show AI'}
                  </button>
                </div>

                {showAiLunchSection && (
                  <div className="mt-4 space-y-4 pt-3 border-t border-white/10">
                    {/* Preset Mood Pills */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-2">Select Your Mood / Craving:</span>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_MOODS.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleRunAiMatchmaker(m.id)}
                            className={`rounded-full px-3 py-1.5 text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              selectedMood === m.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300'
                                : 'bg-white/10 text-amber-100 hover:bg-white/20'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Craving Search Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customFoodQuery}
                        onChange={(e) => setCustomFoodQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunAiMatchmaker(selectedMood, customFoodQuery)}
                        placeholder="e.g. Spicy chicken under R80 or traditional pap..."
                        className="flex-1 rounded-xl bg-slate-900/80 border border-white/20 px-3.5 py-2 text-xs text-white placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRunAiMatchmaker(selectedMood, customFoodQuery)}
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-black text-white hover:from-amber-600 hover:to-orange-600 transition shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Ask AI
                      </button>
                    </div>

                    {/* Single Featured AI Dish Recommendation (Clean & Neat) */}
                    {aiMealMatches && aiMealMatches.length > 0 && (() => {
                      const featuredMeal = aiMealMatches[aiRecommendationIndex % aiMealMatches.length];
                      if (!featuredMeal) return null;

                      return (
                        <div className="mt-3 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 text-left relative overflow-hidden">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl rounded-2xl bg-white/10 p-2 border border-white/10 shadow-inner">{featuredMeal.image || '🍱'}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                                    ✨ Top AI Pick
                                  </span>
                                  <span className="text-[10px] font-extrabold text-slate-300">
                                    Option { (aiRecommendationIndex % aiMealMatches.length) + 1 } of { aiMealMatches.length }
                                  </span>
                                </div>
                                <h4 className="text-base font-black text-white mt-1 leading-tight">{featuredMeal.name}</h4>
                                <p className="text-xs text-amber-100/80 font-medium mt-0.5">
                                  {featuredMeal.shopName} · {featuredMeal.shopTime || '20 min'} · <span className="text-amber-300 font-bold">★ {featuredMeal.shopRating || '4.9'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-lg font-black text-amber-300 block">R{Number(featuredMeal.price || 0).toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-200 flex items-center gap-2">
                            <span>💡</span> <span>{featuredMeal.aiReason}</span>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                            <button
                              type="button"
                              onClick={() => setAiRecommendationIndex(prev => (prev + 1) % aiMealMatches.length)}
                              className="rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-amber-200 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              Next Recommendation 🎲
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCart(prev => {
                                  const existing = prev.find(i => i.id === featuredMeal.id);
                                  if (existing) {
                                    return prev.map(i => i.id === featuredMeal.id ? { ...i, quantity: i.quantity + 1 } : i);
                                  }
                                  return [...prev, { ...featuredMeal, quantity: 1 }];
                                });
                                setNotice({ type: 'success', message: `✨ Added ${featuredMeal.name} to cart!` });
                              }}
                              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2 text-xs font-black text-white transition shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                              + Add Meal to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Shop List Cards Selector */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Select Restaurant / Shop</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddShopModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Register / Upload Shop
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {shops.map((item) => {
                    const shopTheme = getShopTheme(item);
                    const isSelected = selectedShopId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedShopId(item.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? shopTheme.cardActive
                            : shopTheme.cardNormal
                        }`}
                      >
                        {/* Line 1: Icon at top left, Rate/Rating at top right */}
                        <div className="flex items-center justify-between">
                          <span className="text-3xl filter drop-shadow-xs">{item.image || '🏪'}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1 border ${
                            isSelected ? shopTheme.badge : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                            {item.rating || '4.8'}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1">
                          {/* Line 2: Name of the shop */}
                          <span className="block text-base font-black text-gray-900 tracking-tight leading-snug">
                            {item.name}
                          </span>

                          {/* Line 3: Under name must be Type (Greedy / Local / Local Favorite / Greedy & Flame / Health & Veggie) */}
                          <div className="pt-0.5">
                            <span className="inline-block rounded-md bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                              {item.cuisine || 'Local Favorite'}
                            </span>
                          </div>

                          {/* Line 4: Under Type must be Kilometers (Distance) - Not in one line! */}
                          <p className="flex items-center gap-1 text-xs font-semibold text-gray-500 pt-0.5">
                            <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>{item.distance || '1.0 km'}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Restaurant Hero & Meals Details */}
              {currentShop && (
                <article className="mt-6 rounded-3xl bg-white p-3.5 sm:p-6 shadow-md ring-1 ring-gray-100 min-w-0 max-w-full overflow-hidden">
                  
                  {/* Shop Theme Header Banner */}
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${activeTheme.heroBg} p-4 sm:p-6 text-center shadow-lg border min-w-0 max-w-full`}>
                    <div className={`absolute -top-16 -right-16 w-64 h-64 ${activeTheme.heroGlow} rounded-full blur-3xl pointer-events-none`} />
                    <div className={`absolute -bottom-16 -left-16 w-64 h-64 ${activeTheme.heroGlow} rounded-full blur-3xl pointer-events-none`} />

                    {/* Action Bar (Edit Shop & Add Menu Item) - Responsive flex bar */}
                    {currentUser && (currentShop.ownerId === (currentUser._id || currentUser.id) || currentShop.ownerId === 'guest') && (
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
                              phone: currentShop.phone || ''
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
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-gray-950 hover:bg-amber-100 transition cursor-pointer shadow-sm shrink-0"
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

                      <div>
                        <span className="inline-block rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-200 border border-white/15 max-w-full truncate">
                          {currentShop.cuisine}
                        </span>
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
                    </div>
                  </div>

                  {/* Menu vs Reviews View Switcher Tabs */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 min-w-0 max-w-full">
                    <div className="flex flex-wrap items-center gap-2 max-w-full">
                      <button
                        type="button"
                        onClick={() => setShowReviewsTab(false)}
                        className={`rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          !showReviewsTab
                            ? activeTheme.tabActive
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
                        Customer Reviews ({currentShop.reviews?.length || 0})
                      </button>
                    </div>
                  </div>

                  {!showReviewsTab && orderMode === 'order' ? (
                    <>
                      {/* Fulfillment Method Selector */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 max-w-full overflow-hidden">
                       
                        {['pickup', 'delivery'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFulfilment(option)}
                            className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black capitalize transition flex items-center gap-1.5 shrink-0 ${
                              fulfilment === option
                                ? 'bg-gray-950 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option === 'pickup' ? (
                              <>
                                <Store className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Pickup (Pay on Counter)
                              </>
                            ) : (
                              <>
                                <Bike className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Delivery to Door
                              </>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Meals list */}
                      <div className="mt-5 space-y-3 min-w-0 max-w-full">
                        {currentShop.meals && currentShop.meals.length > 0 ? (
                          currentShop.meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 p-3.5 sm:p-4 ring-1 ring-gray-100 transition hover:ring-amber-200 min-w-0 max-w-full overflow-hidden"
                            >
                              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                                <span className="text-3xl shrink-0 p-1">{meal.image || '🍱'}</span>
                                <div className="min-w-0 flex-1 break-words">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h3 className="font-black text-gray-900 text-sm sm:text-base break-words min-w-0 max-w-full">{meal.name}</h3>
                                    {meal.tag && (
                                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800 shrink-0">
                                        {meal.tag}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500 leading-relaxed break-words">{meal.description}</p>
                                  <p className="mt-1.5 text-sm font-extrabold text-amber-700">{formatPrice(meal.price)}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                {currentShop && currentUser && (currentShop.ownerId === (currentUser._id || currentUser.id) || currentShop.ownerId === 'guest') && (
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
                                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                      title="Edit Meal"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMeal(meal.id, meal.name)}
                                      className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                                      title="Delete Meal"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => addToCart(meal)}
                                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-amber-400 text-gray-950 shadow transition hover:bg-amber-300 active:scale-95 shrink-0"
                                  aria-label={`Add ${meal.name}`}
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-sm text-gray-500">
                            No menu items added yet for this store. Click "Add Menu Item" above to create one!
                          </div>
                        )}
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
                              <p className="text-xs text-gray-600 font-bold mt-0.5">
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
                            <div key={rev.id || idx} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                                    {(rev.userName || 'C')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-gray-900 block">{rev.userName || 'Customer'}</span>
                                    <span className="text-[10px] text-gray-400 block">
                                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent order'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500 bg-white px-2 py-1 rounded-full border text-xs font-black">
                                  <Star className="h-3.5 w-3.5 fill-current" />
                                  {rev.shopRating || 5}/5
                                </div>
                              </div>
                              {rev.comment && (
                                <p className="text-xs text-gray-700 leading-relaxed italic bg-white p-3 rounded-xl border border-gray-100">
                                  "{rev.comment}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-sm text-gray-500 rounded-2xl border border-dashed border-gray-200">
                          <MessageSquare className="h-8 w-8 mx-auto text-amber-400 mb-2 opacity-60" />
                          No customer reviews submitted yet for this store. Place an order to leave the first review!
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Table Booking Form */
                    <form onSubmit={handleTableBooking} className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200/50">
                        <p className="text-sm font-semibold text-amber-900">
                          Reserve a dining table at <span className="font-extrabold">{currentShop.name}</span>.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Your Name
                          <input
                            required
                            value={booking.name}
                            onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="Full name"
                          />
                        </label>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Contact Phone
                          <input
                            required
                            type="tel"
                            value={booking.phone}
                            onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="+27 82 123 4567"
                          />
                        </label>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Date
                          <input
                            required
                            type="date"
                            value={booking.date}
                            onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </label>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Time & Guests
                          <div className="flex gap-2 mt-1.5">
                            <input
                              type="time"
                              value={booking.time}
                              onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                              className="w-1/2 rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <select
                              value={booking.guests}
                              onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                              className="w-1/2 rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-amber-400"
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
                        className="w-full rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-gray-800 shadow"
                      >
                        Request Table Booking
                      </button>
                    </form>
                  )}
                </article>
              )}
            </section>

            {/* Right Sidebar: Order Cart */}
            <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
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
                          <p className="truncate text-sm font-black text-gray-900">{item.name}</p>
                          <p className="text-xs text-amber-700 font-bold">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-full p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="rounded-full bg-white p-1 hover:bg-gray-200 shadow-xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="rounded-full bg-white p-1 hover:bg-gray-200 shadow-xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm font-bold text-gray-700">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Fulfillment</span>
                      <span className="capitalize font-bold text-gray-900">{fulfilment}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-gray-900 border-t border-dashed pt-2">
                      <span>Total Amount</span>
                      <span className="text-amber-600">{formatPrice(totalCartPrice)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(true)}
                    className="mt-5 w-full rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-black text-gray-950 shadow transition hover:bg-amber-300 active:scale-95"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                  <UtensilsCrossed className="mx-auto h-8 w-8 text-amber-300" />
                  <p className="mt-2 text-sm font-bold text-gray-800">Your cart is empty</p>
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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddShopModal(true)}
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
                <h3 className="mt-4 text-xl font-black text-gray-900">You haven't registered a food shop yet</h3>
                <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 shrink-0">My Shops:</span>
                  {myShops.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedShopId(s.id)}
                      className={`rounded-full px-4 py-2 text-xs font-black shrink-0 transition cursor-pointer ${
                        dashboardShop?.id === s.id
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-amber-50'
                      }`}
                    >
                      {s.image} {s.name}
                    </button>
                  ))}
                </div>

                {/* Incoming Orders Cards (Live Kitchen Queue) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">
                      Live Kitchen Queue — {dashboardShop?.name || 'My Shop'} ({liveKitchenQueue.length} Active)
                    </h3>
                  </div>

                  {liveKitchenQueue.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {liveKitchenQueue.map((ord) => (
                        <div
                          key={ord.id || ord._id}
                          className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-amber-100 p-2 text-xl font-bold">{ord.shopImage || '🍱'}</span>
                              <div>
                                <p className="text-sm font-black text-gray-900">{ord.customerName}</p>
                                <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-amber-600" /> {ord.customerPhone || 'No contact provided'}
                                </p>
                              </div>
                            </div>

                            {/* Order Matching Verification Code */}
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-gray-400 block uppercase">Verification Code</span>
                              <span className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-black text-white shadow-xs">
                                {ord.orderCode}
                              </span>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="my-3 space-y-1 rounded-xl bg-gray-50 p-3 text-xs">
                            <div className="font-bold text-gray-600 mb-1">Ordered Items:</div>
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="flex justify-between font-medium text-gray-800">
                                <span>{it.quantity}x {it.name}</span>
                                <span className="font-bold">{formatPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Payment & Delivery Info */}
                          <div className="flex flex-wrap justify-between gap-2 text-xs font-bold text-gray-600 border-t border-gray-100 pt-3">
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
                              <span className="text-gray-900 font-black">{formatPrice(ord.total)}</span>
                            </div>
                          </div>

                          {ord.fulfilment === 'delivery' && ord.deliveryAddress && (
                            <div className="mt-2 rounded-lg bg-orange-50 p-2.5 text-xs text-orange-950 border border-orange-200">
                              <span className="font-bold">Delivery Address:</span> {ord.deliveryAddress}
                              {ord.deliveryNotes && <p className="text-[11px] text-orange-800 mt-0.5">Notes: {ord.deliveryNotes}</p>}
                            </div>
                          )}

                          {/* Order Action Buttons */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${
                              ord.status === 'Ready for Collection'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Preparing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              Current Status: {ord.status}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {ord.status === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(ord.id || ord._id, 'Preparing')}
                                  className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-white shadow hover:bg-amber-600 cursor-pointer"
                                >
                                  👨‍🍳 Start Preparing
                                </button>
                              )}
                              {ord.status === 'Preparing' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(ord.id || ord._id, 'Ready for Collection')}
                                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow hover:bg-emerald-700 animate-pulse cursor-pointer"
                                >
                                  🎉 Mark Ready / Out for Delivery
                                </button>
                              )}
                              {ord.status === 'Ready for Collection' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(ord.id || ord._id, 'Completed')}
                                  className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-black text-white shadow hover:bg-gray-800 cursor-pointer"
                                >
                                  ✅ Complete Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                      No active orders in the kitchen queue for {dashboardShop?.name || 'this shop'}.
                    </div>
                  )}
                </div>

                {/* Completed Orders History Section on Dashboard */}
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Completed & Paid Store Orders ({completedStoreOrders.length})
                    </h3>
                    {completedStoreOrders.length > 0 && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                        Total Revenue: {formatPrice(completedStoreOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                      </span>
                    )}
                  </div>

                  {completedStoreOrders.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {completedStoreOrders.map((ord) => (
                        <div
                          key={ord.id || ord._id}
                          className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 p-4 shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-gray-900">{ord.customerName}</span>
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                              ✅ Code: {ord.orderCode}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-600 space-y-1 my-2">
                            <div><span className="font-bold text-gray-700">Items:</span> {ord.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                            <div className="flex justify-between font-extrabold text-gray-900 border-t pt-1 mt-1">
                              <span>Total Paid:</span>
                              <span className="text-emerald-700">{formatPrice(ord.total)}</span>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-emerald-800 font-bold bg-emerald-100/60 p-1.5 rounded-lg text-center">
                            Order Completed & Customer Collected
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-xs text-gray-400">
                      No completed orders yet. Completed orders will be archived here automatically.
                    </div>
                  )}
                </div>
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
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-600" /> Complete Food Order
              </h3>
              <button type="button" onClick={() => setShowCheckoutModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
              {/* Payment Option Selection */}
              <div>
                <label className="text-xs font-black uppercase text-gray-700 block mb-1.5">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'counter' })}
                    className={`rounded-2xl border p-3 text-center transition ${
                      checkoutData.paymentMethod === 'counter'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 font-black text-amber-900'
                        : 'border-gray-200 text-gray-700 hover:border-amber-200'
                    }`}
                  >
                    <Store className="mx-auto h-5 w-5 mb-1 text-amber-600" />
                    <span className="block text-xs">Pay at Counter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'delivery' })}
                    className={`rounded-2xl border p-3 text-center transition ${
                      checkoutData.paymentMethod === 'delivery'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 font-black text-amber-900'
                        : 'border-gray-200 text-gray-700 hover:border-amber-200'
                    }`}
                  >
                    <Bike className="mx-auto h-5 w-5 mb-1 text-amber-600" />
                    <span className="block text-xs">Pay on Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'online' })}
                    className={`rounded-2xl border p-3 text-center transition ${
                      checkoutData.paymentMethod === 'online'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 font-black text-amber-900'
                        : 'border-gray-200 text-gray-700 hover:border-amber-200'
                    }`}
                  >
                    <CreditCard className="mx-auto h-5 w-5 mb-1 text-amber-600" />
                    <span className="block text-xs">Card / Instant</span>
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Your Full Name</label>
                  <input
                    required
                    value={checkoutData.customerName}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Contact Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={checkoutData.customerPhone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="+27 82 000 0000"
                  />
                </div>
              </div>

              {fulfilment === 'delivery' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Delivery Address *</label>
                    <input
                      required
                      value={checkoutData.deliveryAddress}
                      onChange={(e) => setCheckoutData({ ...checkoutData, deliveryAddress: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Street name, house number & suburb"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Driver Instructions / Notes</label>
                    <input
                      value={checkoutData.deliveryNotes}
                      onChange={(e) => setCheckoutData({ ...checkoutData, deliveryNotes: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Gate code, landmark, etc."
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
                <div className="flex justify-between text-sm font-black text-amber-950">
                  <span>Total to Pay:</span>
                  <span>{formatPrice(totalCartPrice)}</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-800">
                  {checkoutData.paymentMethod === 'counter'
                    ? 'Payment will be made directly at the store counter upon order collection.'
                    : 'Order will be recorded instantly.'}
                </p>
              </div>

              <button
                type="submit"
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
      {activeReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-3 text-xl font-black text-gray-900">Order Confirmed!</h3>
              <p className="text-xs text-gray-500 mt-1">Show this matching verification code at the store counter or driver.</p>
            </div>

            {/* Verification Matching Code Card */}
            <div className="my-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-center text-white shadow-md">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100 block">
                Verification Matching Code
              </span>
              <span className="mt-1 text-3xl font-black tracking-wider block font-mono">
                {activeReceiptOrder.orderCode}
              </span>
              <p className="text-[11px] text-amber-100 mt-1">
                Same code is visible on the store owner's food manager dashboard.
              </p>
            </div>

            <div className="space-y-2 text-xs text-gray-700 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Store:</span>
                <span className="font-bold text-gray-900">{activeReceiptOrder.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Fulfillment:</span>
                <span className="font-bold capitalize">{activeReceiptOrder.fulfilment}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Payment Choice:</span>
                <span className="font-bold text-amber-800">{activeReceiptOrder.paymentStatus || activeReceiptOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t pt-2">
                <span>Total Amount:</span>
                <span className="text-amber-700">{formatPrice(activeReceiptOrder.total)}</span>
              </div>
            </div>

            {/* Rating Trigger inside Receipt */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              {activeReceiptOrder.isRated ? (
                <div className="rounded-xl bg-amber-50 p-2.5 text-center text-xs font-bold text-amber-900 border border-amber-200">
                  ⭐ Thank you! You rated this order experience.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRatingTargetOrder(activeReceiptOrder);
                    setShowRateModal(true);
                  }}
                  className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow-sm hover:bg-amber-600 transition flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4 fill-current" /> Rate Shop & Food Service
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveReceiptOrder(null)}
              className="mt-3 w-full rounded-2xl bg-gray-950 py-3 text-sm font-black text-white hover:bg-gray-800 transition"
            >
              Done & Close
            </button>
          </motion.div>
        </div>
      )}

      {/* UPLOAD / REGISTER SHOP MODAL */}
      {showAddShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" /> Upload New Shop
              </h3>
              <button type="button" onClick={() => setShowAddShopModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShopSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shop Name *</label>
                <input
                  required
                  value={newShopForm.name}
                  onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. Mama's Tasty Bites"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shop Type / Category *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Greedy', 'Local', 'Local Favorite', 'Greedy & Flame', 'Health & Veggie'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewShopForm({ ...newShopForm, cuisine: cat })}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
                        newShopForm.cuisine === cat
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      value={newShopForm.cuisine}
                      onChange={(e) => setNewShopForm({ ...newShopForm, cuisine: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Selected or custom type"
                    />
                  </div>
                  <div>
                    <input
                      value={newShopForm.image}
                      onChange={(e) => setNewShopForm({ ...newShopForm, image: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Cover Emoji 🥙, 🍔, 🥗"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Address / Location</label>
                <input
                  value={newShopForm.address}
                  onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="12 Main Street, Central"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Distance Estimate</label>
                  <input
                    value={newShopForm.distance}
                    onChange={(e) => setNewShopForm({ ...newShopForm, distance: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="1.5 km"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Prep Time</label>
                  <input
                    value={newShopForm.time}
                    onChange={(e) => setNewShopForm({ ...newShopForm, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="20–30 min"
                  />
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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" /> Add Meal to {currentShop?.name}
              </h3>
              <button type="button" onClick={() => setShowAddMealModal(false)} className="rounded-full p-1 hover:bg-gray-100">
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Meal Name *</label>
                <input
                  required
                  value={newMealForm.name}
                  onChange={(e) => setNewMealForm({ ...newMealForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. Deluxe Kota or BBQ Chicken"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  value={newMealForm.description}
                  onChange={(e) => setNewMealForm({ ...newMealForm, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Juicy beef patty with fresh lettuce and sauce"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price (R) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newMealForm.price}
                    onChange={(e) => setNewMealForm({ ...newMealForm, price: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Badge Tag</label>
                  <select
                    value={newMealForm.tag}
                    onChange={(e) => setNewMealForm({ ...newMealForm, tag: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
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
                  <label className="text-xs font-bold text-gray-700 block mb-1">Icon Emoji</label>
                  <input
                    value={newMealForm.image}
                    onChange={(e) => setNewMealForm({ ...newMealForm, image: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="🍔, 🌯, 🥗"
                  />
                </div>
              </div>

              {/* Quick Select Emoji Picker */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Quick Tap Food Emoji Icon:</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-200 max-h-20 overflow-y-auto">
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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" /> Edit Shop Details
              </h3>
              <button type="button" onClick={() => setShowEditShopModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditShopSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shop Name *</label>
                <input
                  required
                  value={editShopForm.name}
                  onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shop Type / Category *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Greedy', 'Local', 'Local Favorite', 'Greedy & Flame', 'Health & Veggie'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditShopForm({ ...editShopForm, cuisine: cat })}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
                        editShopForm.cuisine === cat
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      value={editShopForm.cuisine}
                      onChange={(e) => setEditShopForm({ ...editShopForm, cuisine: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Selected or custom type"
                    />
                  </div>
                  <div>
                    <input
                      value={editShopForm.image}
                      onChange={(e) => setEditShopForm({ ...editShopForm, image: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Cover Emoji"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Address / Location</label>
                <input
                  value={editShopForm.address}
                  onChange={(e) => setEditShopForm({ ...editShopForm, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Distance Estimate</label>
                  <input
                    value={editShopForm.distance}
                    onChange={(e) => setEditShopForm({ ...editShopForm, distance: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Prep Time</label>
                  <input
                    value={editShopForm.time}
                    onChange={(e) => setEditShopForm({ ...editShopForm, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Contact Phone</label>
                <input
                  value={editShopForm.phone}
                  onChange={(e) => setEditShopForm({ ...editShopForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" /> Edit Menu Item
              </h3>
              <button type="button" onClick={() => setShowEditMealModal(false)} className="rounded-full p-1 hover:bg-gray-100">
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Meal Name *</label>
                <input
                  required
                  value={editMealForm.name}
                  onChange={(e) => setEditMealForm({ ...editMealForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  value={editMealForm.description}
                  onChange={(e) => setEditMealForm({ ...editMealForm, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price (R) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editMealForm.price}
                    onChange={(e) => setEditMealForm({ ...editMealForm, price: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Badge Tag</label>
                  <select
                    value={editMealForm.tag}
                    onChange={(e) => setEditMealForm({ ...editMealForm, tag: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
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
                  <label className="text-xs font-bold text-gray-700 block mb-1">Icon Emoji</label>
                  <input
                    value={editMealForm.image}
                    onChange={(e) => setEditMealForm({ ...editMealForm, image: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Quick Select Emoji Picker */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Quick Tap Food Emoji Icon:</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-200 max-h-20 overflow-y-auto">
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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" /> Rate Store & Food Experience
              </h3>
              <button type="button" onClick={() => setShowRateModal(false)} className="rounded-full p-1 hover:bg-gray-100">
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
                <label className="text-xs font-bold text-gray-700 block mb-1 text-center">
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
                <label className="text-xs font-bold text-gray-700 block mb-1 text-center">
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Your Review / Feedback</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
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
              onClick={() => setShowCheckoutModal(true)}
              className="rounded-xl bg-slate-950 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-amber-300 hover:bg-slate-900 transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>View Basket & Checkout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
