import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Receipt,
  RotateCcw,
  CheckCircle2,
  ChefHat,
  Bike,
  PackageCheck,
  ChevronRight,
  Filter,
  Search,
  ArrowLeft,
  Store,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { subscribeToOrders } from '../services/lunchService';

const STATUS_STEPS = [
  { key: 'received', label: 'Order Received', desc: 'Shop acknowledged order', icon: CheckCircle2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { key: 'preparing', label: 'Preparing Fresh', desc: 'Kitchen is cooking your meal', icon: ChefHat, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  { key: 'ready', label: 'Ready / Out for Delivery', desc: 'Ready for pickup or driver assigned', icon: Bike, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' },
  { key: 'completed', label: 'Completed', desc: 'Order fulfilled successfully', icon: PackageCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
];

const getStepIndex = (status) => {
  const norm = String(status || '').toLowerCase();
  if (norm.includes('done') || norm.includes('complete') || norm.includes('collected') || norm.includes('delivered')) return 3;
  if (norm.includes('ready') || norm.includes('out') || norm.includes('transit') || norm.includes('driver')) return 2;
  if (norm.includes('prep') || norm.includes('cook') || norm.includes('kitchen') || norm.includes('process')) return 1;
  return 0;
};

export default function MyFoodOrders() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user || {});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load orders from API + fallback to localStorage cached orders
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Read any locally stored orders first
    let localOrders = [];
    try {
      const stored = localStorage.getItem('loopout_food_orders');
      if (stored) localOrders = JSON.parse(stored);
    } catch {
      // ignore
    }

    const unsubscribe = subscribeToOrders((apiOrders, error) => {
      if (!isMounted) return;
      setLoading(false);
      
      let merged = [];
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        merged = apiOrders;
      }
      
      // Merge with localStorage orders ensuring uniqueness by _id / id
      const seen = new Set();
      const combined = [];
      [...localOrders, ...merged].forEach((ord) => {
        const id = ord._id || ord.id || ord.orderId;
        if (id && !seen.has(id)) {
          seen.add(id);
          combined.push(ord);
        } else if (!id) {
          combined.push(ord);
        }
      });

      // Sort newest first
      combined.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setOrders(combined);
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [refreshKey]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const stepIdx = getStepIndex(order.status);
      const isCompleted = stepIdx === 3 || order.status === 'cancelled';
      const isActive = !isCompleted;

      if (filter === 'active' && !isActive) return false;
      if (filter === 'completed' && !isCompleted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shop = (order.shopName || order.shop?.name || '').toLowerCase();
        const itemNames = (order.items || []).map((i) => i.name || i.title || '').join(' ').toLowerCase();
        const mealName = (order.mealName || order.name || '').toLowerCase();
        const id = String(order._id || order.id || '').toLowerCase();
        if (!shop.includes(q) && !itemNames.includes(q) && !mealName.includes(q) && !id.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filter, searchQuery]);

  const activeCount = useMemo(() => {
    return orders.filter((o) => getStepIndex(o.status) < 3 && o.status !== 'cancelled').length;
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Helmet>
        <title>My Food Orders · LoopOut</title>
        <meta name="description" content="Track your food orders in real-time, view receipts, and reorder from local Polokwane kitchens and restaurants on LoopOut." />
      </Helmet>

      {/* Top sticky navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/80 dark:border-gray-800/80 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors active:scale-95"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>My Food Orders</span>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">
                    {activeCount} Active
                  </span>
                )}
              </h1>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                Live updates &amp; digital receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/#food-section"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
            >
              <span>Explore Food</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop or meal..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 self-stretch sm:self-auto justify-center">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filter === tab.id
                    ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List / Empty State */}
        {loading && orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-4 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-center text-4xl shadow-inner">
              🍲
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                {searchQuery ? 'No matching orders found' : 'No food orders yet'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery
                  ? `We couldn't find any orders matching "${searchQuery}". Try a different keyword.`
                  : 'Order tasty meals, sides, and refreshing drinks from local shops right on the Home page.'}
              </p>
            </div>
            <Link
              to="/#food-section"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Browse Local Food &amp; Menus →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order, idx) => {
              const orderId = order._id || order.id || `ORD-${idx + 1}`;
              const currentStep = getStepIndex(order.status);
              const isCompleted = currentStep === 3;
              const dateStr = order.createdAt || order.date ? new Date(order.createdAt || order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently placed';
              
              const totalAmount = order.totalAmount || order.price || order.grandTotal || 0;
              const shopName = order.shopName || order.shop?.name || 'Local Kitchen';
              const shopPhone = order.shopPhone || order.shop?.phone || '';
              const fulfilment = order.fulfilment || order.type || 'pickup';
              const items = order.items || (order.mealName ? [{ name: order.mealName, qty: order.qty || 1, price: order.price }] : []);

              return (
                <motion.div
                  key={orderId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5"
                >
                  {/* Top order summary header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-2xl shrink-0">
                        {order.shopImage || '🍲'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-black text-gray-900 dark:text-white">
                            {shopName}
                          </h2>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            fulfilment === 'delivery'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {fulfilment === 'delivery' ? '🛵 Delivery' : '🏪 Counter Pickup'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                          Order #{String(orderId).slice(-6).toUpperCase()} · {dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Total</span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        R{Number(totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Real-time 4-step progress tracker */}
                  <div className="px-2 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {/* Connecting progress line */}
                      <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-gray-200 dark:bg-gray-800 -z-0">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${(currentStep / 3) * 100}%` }}
                        />
                      </div>

                      {STATUS_STEPS.map((step, sIdx) => {
                        const isReached = sIdx <= currentStep;
                        const isCurrent = sIdx === currentStep;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center gap-1.5 z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                isCurrent
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 shadow-md scale-110'
                                  : isReached
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black leading-tight ${
                              isCurrent ? 'text-amber-600 dark:text-amber-400' : isReached ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items List Details */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Ordered Items &amp; Customizations:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                              {item.name || item.title || 'Special Meal'} {item.qty > 1 ? `× ${item.qty}` : ''}
                            </p>
                            {Array.isArray(item.sides) && item.sides.length > 0 && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-0.5 truncate">
                                🥗 {item.sides.join(', ')}
                              </p>
                            )}
                            {Array.isArray(item.drinks) && item.drinks.length > 0 && (
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5 truncate">
                                🥤 {item.drinks.map((d) => `${d.name} x${d.qty}`).join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0">
                            R{Number(item.price || (item.qty * (item.unitPrice || 0))).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.deliveryAddress && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Destination: <strong className="text-gray-800 dark:text-gray-200">{order.deliveryAddress}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      {shopPhone && (
                        <a
                          href={`tel:${shopPhone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-black transition-all active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Shop</span>
                        </a>
                      )}
                      {shopPhone && (
                        <a
                          href={`https://wa.me/${shopPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${shopName}, following up on my LoopOut food order #${String(orderId).slice(-6).toUpperCase()}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-black transition-all active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveReceiptOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-black transition-all active:scale-95"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>

                      <Link
                        to="/#food-section"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Order More</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── DIGITAL RECEIPT MODAL ── */}
      <AnimatePresence>
        {activeReceiptOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Receipt header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Digital Order Receipt
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {activeReceiptOrder.shopName || 'LoopOut Food'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Order #{String(activeReceiptOrder._id || activeReceiptOrder.id || '').slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setActiveReceiptOrder(null)}
                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt lines */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col gap-3 font-mono text-xs">
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                  <span>DATE</span>
                  <span>{new Date(activeReceiptOrder.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                  <span>FULFILMENT</span>
                  <span className="uppercase">{activeReceiptOrder.fulfilment || 'Pickup'}</span>
                </div>

                <div className="flex flex-col gap-1.5 py-1">
                  {(activeReceiptOrder.items || [{ name: activeReceiptOrder.mealName, qty: activeReceiptOrder.qty || 1, price: activeReceiptOrder.price }]).map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-2">{it.name || 'Meal'} x{it.qty || 1}</span>
                      <span>R{Number(it.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between font-black text-sm text-gray-900 dark:text-white">
                  <span>TOTAL PAID</span>
                  <span className="text-amber-600">R{Number(activeReceiptOrder.totalAmount || activeReceiptOrder.price || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-black text-xs uppercase tracking-wider transition-all"
                >
                  Print Receipt 🖨️
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceiptOrder(null)}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
