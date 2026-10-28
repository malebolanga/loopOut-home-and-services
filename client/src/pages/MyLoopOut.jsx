import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2,
  AlertTriangle, Clock3, MapPin, MessageCircle, PackageCheck, RefreshCw, ShoppingBag, Sparkles,
  Star, UtensilsCrossed, X
} from 'lucide-react';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { rateShop, subscribeToOrders, updateOrderStatus } from '../services/lunchService';
import RatingModal from '../components/RatingModal';

const BOOKING_STEPS = ['Request sent', 'Confirmed', 'In progress', 'Complete'];
const FOOD_STEPS = ['Order sent', 'Preparing', 'Ready', 'Complete'];
const GOODS_STEPS = ['Requested', 'Accepted', 'Ready', 'Collected'];

const normalizedStatus = (status) => String(status || 'pending').trim().toLowerCase().replace(/[\s-]+/g, '_');
const isCancelled = (status) => ['cancelled', 'canceled', 'declined', 'rejected'].includes(normalizedStatus(status));
const isComplete = (status) => ['completed', 'complete', 'collected', 'delivered', 'done'].includes(normalizedStatus(status));

function bookingStep(status) {
  const value = normalizedStatus(status);
  if (['completed', 'complete'].includes(value)) return 3;
  if (value === 'work_completed') return 3;
  if (['work_completed', 'ongoing', 'in_progress', 'enroute', 'assigned'].includes(value)) return 2;
  if (['confirmed', 'approved', 'accepted'].includes(value)) return 1;
  return 0;
}

function foodStep(status) {
  const value = normalizedStatus(status);
  if (['completed', 'complete', 'collected', 'delivered', 'done'].includes(value)) return 3;
  if (['ready_for_collection', 'ready', 'out_for_delivery', 'enroute', 'driver_assigned'].includes(value)) return 2;
  if (['preparing', 'processing', 'cooking'].includes(value)) return 1;
  return 0;
}

function formatDate(value) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed';
  return date.toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function normalizeBooking(booking) {
  const resourceType = booking.listing ? 'listing' : booking.helper ? 'helper' : booking.event ? 'event' : 'service';
  const resource = booking.listing || booking.helper || booking.service || booking.event || {};
  const owner = resource.userRef || resource.creator || {};
  const status = booking.status || 'pending';
  return {
    id: String(booking._id || booking.id || ''),
    kind: 'booking',
    raw: booking,
    title: resource.name || resource.title || 'Service booking',
    resourceType,
    resourceId: String(resource._id || booking.itemId || ''),
    image: resource.imageUrls?.[0] || resource.images?.[0] || resource.image || '',
    status,
    step: bookingStep(status),
    date: formatDate(booking.startDate || booking.date || booking.createdAt),
    location: booking.address || resource.address || resource.location || '',
    provider: owner.username || resource.ownerName || resource.name || 'Your provider',
    providerId: String(owner._id || owner.id || resource.userRef || resource.creator || ''),
    price: booking.totalPrice || booking.totalAmount || booking.price || resource.regularPrice || resource.price || null,
    needsAction: normalizedStatus(status) === 'work_completed',
    completed: isComplete(status),
    cancelled: isCancelled(status),
  };
}

function isInsideBookingCancellationWindow(booking) {
  const startsAt = new Date(booking?.startDate || booking?.date).getTime();
  return Number.isFinite(startsAt) && Date.now() <= startsAt - 48 * 60 * 60 * 1000;
}

function normalizeFoodOrder(order) {
  const status = order.status || 'Pending';
  const fulfillment = order.fulfilment || order.type || 'pickup';
  const items = order.items || (order.mealName ? [{ name: order.mealName, quantity: order.qty || 1 }] : []);
  return {
    id: String(order._id || order.id || order.orderId || ''),
    kind: 'food',
    raw: order,
    title: order.shopName || order.shop?.name || 'Local food order',
    image: order.shopImage || '',
    status,
    step: foodStep(status),
    date: formatDate(order.createdAt || order.date || order.scheduledFor),
    location: fulfillment === 'delivery' ? order.deliveryAddress : '',
    fulfillment,
    items,
    price: order.totalAmount || order.total || order.grandTotal || order.price || null,
    needsAction: normalizedStatus(status) === 'ready_for_collection',
    completed: isComplete(status),
    cancelled: isCancelled(status),
  };
}

function normalizeGoodsOrder(order) {
  const status = order.status || 'Requested';
  const step = ['Accepted', 'Ready for Collection', 'Completed'].indexOf(status);
  return {
    id: String(order._id || order.id || ''), kind: 'goods', raw: order,
    title: order.title || 'Marketplace item', image: order.image || '', status,
    step: status === 'Completed' ? 3 : Math.max(0, step), date: formatDate(order.createdAt),
    location: '', price: order.price, role: order.role || 'buyer',
    buyerName: order.buyer?.username || 'Buyer', sellerName: order.seller?.username || 'Seller',
    issueReports: Array.isArray(order.issueReports) ? order.issueReports : [],
    needsAction: (order.role === 'seller' && status === 'Requested') || (order.role === 'buyer' && status === 'Ready for Collection'),
    completed: status === 'Completed', cancelled: status === 'Cancelled',
  };
}

function ProgressSteps({ labels, current, cancelled = false, tone = 'rose' }) {
  if (cancelled) {
    return <p className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">This booking was cancelled.</p>;
  }

  const activeClass = tone === 'amber' ? 'bg-amber-500 ring-amber-500/15' : 'bg-rose-500 ring-rose-500/15';
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label="Progress">
      {labels.map((label, index) => {
        const passed = index < current;
        const selected = index === current;
        return (
          <li key={label} className="min-w-0 text-center">
            <span className={`mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${passed ? 'bg-emerald-500 text-white' : selected ? `${activeClass} text-white ring-4` : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
              {passed ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className={`block truncate text-[9px] font-bold sm:text-[10px] ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ActivityCard({ item, busy, onComplete, onRate, onOpen, onMessage, onCancel, onGoodsStatus, onReportIssue }) {
  const isFood = item.kind === 'food';
  const isGoods = item.kind === 'goods';
  const needsRating = item.completed && (isFood ? !item.raw.isRated : true);
  const actionText = item.needsAction
    ? (isFood ? (item.fulfillment === 'delivery' ? 'Confirm delivery received' : 'I collected this order') : 'Confirm complete & rate')
    : needsRating ? (isFood ? 'Rate this order' : 'Rate your provider') : isFood ? 'View food orders' : isGoods ? 'Item request' : 'View details';

  return (
    <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl ${isFood ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-rose-50 dark:bg-rose-950/50'}`}>
          {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : isFood ? <UtensilsCrossed className="h-5 w-5 text-amber-600" /> : isGoods ? <ShoppingBag className="h-5 w-5 text-rose-600" /> : <CalendarDays className="h-5 w-5 text-rose-600" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-black text-slate-900 dark:text-white">{item.title}</h2>
            <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${isFood ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
              {isFood ? item.fulfillment === 'delivery' ? 'Delivery' : 'Collection' : isGoods ? `Marketplace · ${item.role}` : item.resourceType}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-gray-400">{item.date}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-gray-400">
            {isFood ? (item.items.length ? item.items.map((entry) => `${entry.quantity || entry.qty || 1}× ${entry.name || entry.title || 'Item'}`).join(', ') : `Order #${item.id.slice(-6).toUpperCase()}`) : isGoods ? `With ${item.role === 'seller' ? item.buyerName : item.sellerName}` : `With ${item.provider}`}
          </p>
        </div>
        {item.price != null && <span className="max-w-[38%] shrink-0 truncate text-right text-xs font-black text-slate-800 dark:text-gray-200">R{Number(item.price).toLocaleString('en-ZA', { maximumFractionDigits: 2 })}</span>}
      </div>

      {item.location && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.location}</span></p>}

      {isGoods && item.issueReports.some((issue) => issue.status === 'Open') && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Issue reported · {item.issueReports.find((issue) => issue.status === 'Open')?.category}</span><p className="mt-1 font-medium">This report is saved with the request and shared with both parties.</p></div>}

      <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-gray-950/70">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">{item.cancelled ? 'Status' : 'Progress'}</span>
          <span className={`min-w-0 max-w-[58%] truncate rounded-full px-2.5 py-1 text-right text-[9px] font-black uppercase tracking-wide ${item.cancelled ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : item.needsAction ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300' : item.completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-gray-800 dark:text-gray-300'}`}>
            {item.cancelled ? 'Cancelled' : item.needsAction ? 'Needs your attention' : item.completed ? 'Complete' : item.status}
          </span>
        </div>
        <ProgressSteps labels={isFood ? FOOD_STEPS : isGoods ? GOODS_STEPS : BOOKING_STEPS} current={item.step} cancelled={item.cancelled} tone={isFood ? 'amber' : 'rose'} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {item.needsAction && <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300"><Clock3 className="h-3.5 w-3.5 shrink-0" />{isFood && item.fulfillment !== 'delivery' ? 'Please confirm after collection. Ready orders close automatically after 2 hours.' : isFood ? 'Confirm when your delivery has arrived.' : isGoods ? item.role === 'seller' ? 'Review the buyer’s request.' : 'Confirm after you collect the item.' : 'The provider marked the work complete.'}</p>}
        {isGoods ? <div className="ml-auto flex flex-wrap justify-end gap-2">{item.role === 'seller' && item.status === 'Requested' && <button type="button" disabled={busy} onClick={() => onGoodsStatus(item, 'Accepted')} className="min-h-10 rounded-xl bg-rose-600 px-3 py-2 text-[10px] font-black uppercase text-white">Accept</button>}{item.role === 'seller' && item.status === 'Accepted' && <button type="button" disabled={busy} onClick={() => onGoodsStatus(item, 'Ready for Collection')} className="min-h-10 rounded-xl bg-rose-600 px-3 py-2 text-[10px] font-black uppercase text-white">Mark ready</button>}{item.role === 'buyer' && item.status === 'Ready for Collection' && <button type="button" disabled={busy} onClick={() => onGoodsStatus(item, 'Completed')} className="min-h-10 rounded-xl bg-rose-600 px-3 py-2 text-[10px] font-black uppercase text-white">Confirm collected</button>}{['Requested', 'Accepted'].includes(item.status) && <button type="button" disabled={busy} onClick={() => onCancel(item)} className="min-h-10 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-600 dark:border-gray-700 dark:text-gray-300">Cancel</button>}</div> : <button type="button" disabled={busy} onClick={() => needsRating ? onRate(item) : item.needsAction ? onComplete(item) : onOpen(item)} className={`ml-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95 disabled:opacity-60 ${item.needsAction ? 'bg-rose-600 text-white hover:bg-rose-700' : needsRating ? 'bg-amber-500 text-white hover:bg-amber-600' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'}`}>
          {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : needsRating ? <Star className="h-3.5 w-3.5" /> : item.needsAction ? <CheckCircle2 className="h-3.5 w-3.5" /> : isFood ? <ShoppingBag className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          {actionText}
        </button>}
        {item.kind === 'booking' && (item.needsAction || needsRating) && <button type="button" onClick={() => onOpen(item)} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">View details</button>}
      </div>
      {item.kind === 'booking' && !item.completed && !item.cancelled && <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        {!['ongoing', 'work_completed', 'completed', 'declined'].includes(normalizedStatus(item.status)) && <>
          <span className="mr-auto text-[10px] text-slate-500 dark:text-gray-400">{isInsideBookingCancellationWindow(item.raw) ? 'Cancel up to 48 hours before the scheduled start.' : 'The 48-hour cancellation window has closed.'}</span>
          <button type="button" disabled={!isInsideBookingCancellationWindow(item.raw) || busy} onClick={() => onCancel(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800">{isInsideBookingCancellationWindow(item.raw) ? 'Cancel' : 'Cancel closed'}</button>
        </>}
        {item.providerId && <button type="button" onClick={() => onMessage(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"><MessageCircle className="h-3.5 w-3.5" />Message provider</button>}
      </div>}
      {isFood && ['pending', 'preparing'].includes(normalizedStatus(item.status)) && <div className="mt-2 flex flex-wrap items-center justify-end gap-2"><span className="mr-auto text-[10px] text-slate-500 dark:text-gray-400">Cancel before the shop marks your order ready.</span><button type="button" disabled={busy} onClick={() => onCancel(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800">Cancel order</button></div>}
      {isGoods && <div className="mt-2 flex flex-wrap justify-end gap-1"><button type="button" disabled={busy} onClick={() => onMessage(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"><MessageCircle className="h-3.5 w-3.5" />Message {item.role === 'seller' ? 'buyer' : 'seller'}</button>{!item.cancelled && !item.issueReports.some((issue) => issue.status === 'Open') && <button type="button" disabled={busy} onClick={() => onReportIssue(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-950/30"><AlertTriangle className="h-3.5 w-3.5" />Report a problem</button>}</div>}
    </motion.article>
  );
}

export default function MyLoopOut() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user || {});
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [goodsOrders, setGoodsOrders] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [foodRating, setFoodRating] = useState(5);
  const [foodComment, setFoodComment] = useState('');
  const [foodRatingError, setFoodRatingError] = useState('');
  const [issueOrder, setIssueOrder] = useState(null);
  const [issueCategory, setIssueCategory] = useState('Item not as described');
  const [issueDetails, setIssueDetails] = useState('');
  const [issueError, setIssueError] = useState('');
  const previousStatuses = useRef(null);

  const userId = currentUser?._id || currentUser?.id;

  const loadBookings = useCallback(async (signal) => {
    if (!userId) return;
    setBookingsLoading(true);
    setBookingError('');
    try {
      const response = await authenticatedFetch(`/api/bookings/user/${userId}`, { signal });
      if (!response.ok) throw new Error('Could not load your bookings. Please try again.');
      const data = await response.json();
      const next = (Array.isArray(data) ? data : []).map(normalizeBooking).filter((item) => item.id);
      if (previousStatuses.current) {
        const changed = next.find((item) => previousStatuses.current[`booking:${item.id}`] && previousStatuses.current[`booking:${item.id}`] !== String(item.status));
        if (changed) setNotice(`Update: ${changed.title} is now ${String(changed.status).replaceAll('_', ' ')}.`);
      }
      setBookings(next);
    } catch (error) {
      if (error.name !== 'AbortError') setBookingError(error.message || 'Could not load bookings.');
    } finally {
      if (!signal?.aborted) setBookingsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setBookingsLoading(false);
      setOrdersLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    loadBookings(controller.signal);
    setOrdersLoading(true);
    const unsubscribe = subscribeToOrders((data, error) => {
      if (!active) return;
      if (error) {
        setOrderError(error.message || 'Could not load food orders.');
        setOrders([]);
      } else {
        setOrderError('');
        const next = (Array.isArray(data) ? data : [])
          .filter((order) => String(order.customerId || '') === String(userId))
          .map(normalizeFoodOrder)
          .filter((order) => order.id);
        const changed = next.find((item) => previousStatuses.current?.[`food:${item.id}`] && previousStatuses.current[`food:${item.id}`] !== String(item.status));
        if (changed) setNotice(`Update: your order from ${changed.title} is now ${changed.status}.`);
        setOrders(next);
      }
      setOrdersLoading(false);
    });

    const loadGoods = async () => {
      try {
        const response = await authenticatedFetch('/api/sell/orders');
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'Could not load marketplace requests.');
        const next = (payload.data || []).map(normalizeGoodsOrder).filter((item) => item.id);
        const changed = next.find((item) => previousStatuses.current?.[`goods:${item.id}`] && previousStatuses.current[`goods:${item.id}`] !== String(item.status));
        if (changed) setNotice(`Update: ${changed.title} request is now ${changed.status}.`);
        setGoodsOrders(next);
      } catch (error) { setOrderError((current) => current || error.message); }
    };
    loadGoods();
    const goodsTimer = window.setInterval(loadGoods, 20000);
    const bookingTimer = window.setInterval(() => loadBookings(), 20000);

    return () => {
      active = false;
      controller.abort();
      if (typeof unsubscribe === 'function') unsubscribe();
      window.clearInterval(goodsTimer);
      window.clearInterval(bookingTimer);
    };
  }, [userId, loadBookings]);

  const items = useMemo(() => [...bookings, ...orders, ...goodsOrders].sort((a, b) => {
    const aDate = new Date(a.raw.createdAt || a.raw.startDate || a.raw.date || 0).getTime();
    const bDate = new Date(b.raw.createdAt || b.raw.startDate || b.raw.date || 0).getTime();
    return bDate - aDate;
  }), [bookings, orders, goodsOrders]);

  useEffect(() => {
    previousStatuses.current = Object.fromEntries(items.map((item) => [`${item.kind}:${item.id}`, String(item.status)]));
  }, [items]);

  const counts = useMemo(() => ({
    all: items.length,
    needs: items.filter((item) => item.needsAction).length,
    active: items.filter((item) => !item.completed && !item.cancelled).length,
    completed: items.filter((item) => item.completed).length,
  }), [items]);

  const visibleItems = useMemo(() => items.filter((item) => {
    if (filter === 'needs') return item.needsAction;
    if (filter === 'active') return !item.completed && !item.cancelled;
    if (filter === 'completed') return item.completed || item.cancelled;
    return true;
  }), [items, filter]);

  const finishItem = async (item) => {
    setBusyId(item.id);
    setNotice('');
    try {
      if (item.kind === 'food') {
        const updated = await updateOrderStatus(item.id, 'Completed');
        setOrders((current) => current.map((entry) => entry.id === item.id ? normalizeFoodOrder({ ...entry.raw, ...updated, isRated: entry.raw.isRated }) : entry));
        setRatingOrder({ ...item, raw: { ...item.raw, ...updated } });
        setFoodRating(5);
        setFoodComment('');
        setFoodRatingError('');
      } else {
        const response = await authenticatedFetch(`/api/bookings/update/${item.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || payload.error || 'Could not close this booking.');
        setBookings((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'completed', step: 3, needsAction: false, completed: true, raw: { ...entry.raw, status: 'completed' } } : entry));
        setDetailsBooking(null);
        setRatingBooking({ ...item.raw, id: item.id, type: item.resourceType, itemId: item.resourceId, title: item.title, proName: item.provider });
      }
    } catch (error) {
      setNotice(error.message || 'Could not update this item. Please try again.');
    } finally {
      setBusyId('');
    }
  };

  const submitFoodRating = async (event) => {
    event.preventDefault();
    if (!ratingOrder?.raw?.shopId) {
      setFoodRatingError('This order is missing its shop details.');
      return;
    }
    setBusyId(ratingOrder.id);
    setFoodRatingError('');
    try {
      await rateShop(ratingOrder.raw.shopId, {
        orderId: ratingOrder.id,
        shopRating: foodRating,
        foodRating,
        comment: foodComment,
        userName: currentUser?.username || currentUser?.name || 'Customer',
      });
      setOrders((current) => current.map((entry) => entry.id === ratingOrder.id ? { ...entry, raw: { ...entry.raw, isRated: true } } : entry));
      setRatingOrder(null);
      setNotice('Thanks for sharing your rating.');
    } catch (error) {
      setFoodRatingError(error.message || 'Could not save your rating. Please try again.');
    } finally {
      setBusyId('');
    }
  };

  const changeGoodsStatus = async (item, status) => {
    setBusyId(item.id);
    setNotice('');
    try {
      const response = await authenticatedFetch(`/api/sell/orders/${item.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Could not update this item request.');
      setGoodsOrders((current) => current.map((entry) => entry.id === item.id ? normalizeGoodsOrder({ ...entry.raw, ...payload.data, role: entry.role }) : entry));
      setNotice(`Item request updated: ${status}.`);
    } catch (error) { setNotice(error.message || 'Could not update this item request.'); }
    finally { setBusyId(''); }
  };

  const cancelItem = async (item) => {
    const label = item.kind === 'goods' ? 'item request' : item.kind === 'food' ? 'food order' : 'booking';
    if (!window.confirm(`Cancel this ${label}?`)) return;
    setBusyId(item.id);
    setNotice('');
    try {
      if (item.kind === 'food') {
        const response = await authenticatedFetch(`/api/lunch/orders/${item.id}/status`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Cancelled' }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'Could not cancel this food order.');
        setOrders((current) => current.map((entry) => entry.id === item.id ? normalizeFoodOrder({ ...entry.raw, ...payload }) : entry));
        setNotice('Food order cancelled.');
      } else if (item.kind === 'goods') {
        await changeGoodsStatus(item, 'Cancelled');
      } else {
        const response = await authenticatedFetch(`/api/bookings/update/${item.id}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled', cancelledBy: 'user' }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || payload.error || 'Could not cancel this booking.');
        setBookings((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'cancelled', cancelled: true, needsAction: false, raw: { ...entry.raw, status: 'cancelled' } } : entry));
        setDetailsBooking(null);
        setNotice('Booking cancelled.');
      }
    } catch (error) { setNotice(error.message || `Could not cancel this ${label}.`); }
    finally { setBusyId(''); }
  };

  const messageProvider = async (item) => {
    try {
      const response = await authenticatedFetch('/api/messages/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: item.providerId, content: `Hi, I’m following up about my booking for ${item.title}.` }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Could not start a message.');
      navigate(`/messages/${payload.conversationId || payload._id}`);
    } catch (error) { setNotice(error.message || 'Could not start a message.'); }
  };

  const openGoodsConversation = async (item) => {
    setBusyId(item.id);
    setNotice('');
    try {
      const response = await authenticatedFetch(`/api/sell/orders/${item.id}/conversation`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.data?._id) throw new Error(payload.message || 'Could not open this item conversation.');
      navigate(`/messages/${payload.data._id}`);
    } catch (error) { setNotice(error.message || 'Could not open this item conversation.'); }
    finally { setBusyId(''); }
  };

  const submitIssueReport = async (event) => {
    event.preventDefault();
    if (!issueOrder) return;
    setBusyId(issueOrder.id);
    setIssueError('');
    try {
      const response = await authenticatedFetch(`/api/sell/orders/${issueOrder.id}/issues`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: issueCategory, details: issueDetails }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Could not submit the report.');
      setGoodsOrders((current) => current.map((entry) => entry.id === issueOrder.id ? normalizeGoodsOrder({ ...entry.raw, ...payload.data, role: entry.role }) : entry));
      setIssueOrder(null);
      setIssueDetails('');
      setNotice('Your problem report was saved and shared with the other party. LoopOut administrators were notified.');
    } catch (error) { setIssueError(error.message || 'Could not submit the report.'); }
    finally { setBusyId(''); }
  };

  const openItem = (item) => {
    if (item.kind === 'food') {
      navigate('/my-orders');
      return;
    }
    if (item.kind === 'booking') {
      setDetailsBooking(item);
      return;
    }
    if (item.resourceId) navigate(`/${item.resourceType}/${item.resourceId}`);
    else navigate('/upcoming-bookings');
  };

  const refresh = () => {
    const controller = new AbortController();
    loadBookings(controller.signal);
  };

  const loading = bookingsLoading || ordersLoading;
  const detailRaw = detailsBooking?.raw || {};
  const detailResource = detailRaw.listing || detailRaw.helper || detailRaw.service || detailRaw.event || {};
  const detailServices = String(detailRaw.subtype || detailRaw.functionType || '').split(/[,;]+/).map((service) => service.trim()).filter(Boolean);
  const detailStart = formatDate(detailRaw.startDate || detailRaw.date);
  const detailEnd = detailRaw.endDate && new Date(detailRaw.endDate).getTime() !== new Date(detailRaw.startDate).getTime() ? formatDate(detailRaw.endDate) : '';
  const clientWorkAddress = detailRaw.requestLocation || detailRaw.clientAddress || '';
  const providerVisitAddress = detailResource.businessAddress || detailResource.address || detailResource.location || '';
  // Keep the booking details consistent with the address included in the WhatsApp request.
  const detailLocation = detailRaw.locationOption === 'comeToYou'
    ? clientWorkAddress
    : detailRaw.locationOption === 'goToThem'
      ? providerVisitAddress
      : clientWorkAddress;
  const detailTravelLabel = detailRaw.locationOption === 'comeToYou'
    ? '🚗 Provider comes to you'
    : detailRaw.locationOption === 'goToThem'
      ? '🚶 You go to the provider'
      : '';
  const detailStatus = normalizedStatus(detailsBooking?.status);
  const detailCanCancel = Boolean(detailsBooking && !['cancelled', 'declined', 'completed', 'ongoing', 'work_completed'].includes(detailStatus) && isInsideBookingCancellationWindow(detailRaw));
  const detailMayCancel = Boolean(detailsBooking && !['cancelled', 'declined', 'completed', 'ongoing', 'work_completed'].includes(detailStatus));

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-24 text-slate-900 transition-colors dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100 md:pb-12">
      <Helmet><title>My LoopOut · Bookings and Orders</title><meta name="description" content="Track your LoopOut bookings, food orders, deliveries and collections in one place." /></Helmet>

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"><ArrowLeft className="h-5 w-5" /></button>
            <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">Your activity</p><h1 className="truncate text-lg font-black sm:text-xl">My LoopOut</h1></div>
          </div>
          <button type="button" onClick={refresh} disabled={bookingsLoading} aria-label="Refresh bookings" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"><RefreshCw className={`h-4 w-4 ${bookingsLoading ? 'animate-spin' : ''}`} /></button>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {!userId ? (
          <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><Sparkles className="h-6 w-6" /></div>
            <h2 className="text-xl font-black">Sign in to track your activity</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Your bookings, food orders, and collections will appear here.</p>
            <button type="button" onClick={() => navigate('/sign-in')} className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-rose-700">Sign in</button>
          </section>
        ) : (
          <>
            <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-5 text-white shadow-lg sm:p-7">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div className="max-w-xl"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">One place for every next step</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Your bookings and orders</h2><p className="mt-2 text-sm text-slate-300">Follow service progress, confirm collections, and review completed orders.</p></div>
                <div className="grid grid-cols-3 gap-2 sm:min-w-[300px]">
                  {[['Active', counts.active], ['Needs you', counts.needs], ['Complete', counts.completed]].map(([label, count]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur"><span className="block text-xl font-black">{count}</span><span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-300">{label}</span></div>)}
                </div>
              </div>
            </section>

            {(bookingError || orderError || notice) && <div role="status" className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${notice && !bookingError && !orderError ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'}`}><span>{notice || [bookingError, orderError].filter(Boolean).join(' ')}</span>{(bookingError || orderError) && <button type="button" onClick={refresh} className="shrink-0 underline">Retry</button>}</div>}

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                ['all', `All activity · ${counts.all}`],
                ['needs', `Needs you · ${counts.needs}`],
                ['active', `In progress · ${counts.active}`],
                ['completed', `Complete · ${counts.completed}`],
              ].map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wide transition ${filter === key ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'}`}>{label}</button>)}
            </div>

            {loading && items.length === 0 ? (
              <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((key) => <div key={key} className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900" />)}</div>
            ) : visibleItems.length === 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white px-5 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-300">{filter === 'needs' ? <CheckCircle2 className="h-7 w-7" /> : <PackageCheck className="h-7 w-7" />}</div>
                <h2 className="text-lg font-black">{filter === 'needs' ? 'You’re all caught up' : filter === 'completed' ? 'No completed activity yet' : 'No bookings or orders yet'}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-gray-400">{filter === 'needs' ? 'We’ll show anything that needs your attention here.' : 'When you book a service or order from a local shop, you can follow it here.'}</p>
                {filter === 'all' && <div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={() => navigate('/search')} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white">Explore services</button><button onClick={() => navigate('/food')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black dark:border-gray-700">Browse food</button></div>}
              </section>
            ) : (
          <div className="grid items-start gap-4 md:grid-cols-2">
                <AnimatePresence initial={false}>{visibleItems.map((item) => <ActivityCard key={`${item.kind}-${item.id}`} item={item} busy={busyId === item.id} onComplete={finishItem} onRate={(entry) => entry.kind === 'food' ? (setFoodRating(5), setFoodComment(''), setFoodRatingError(''), setRatingOrder(entry)) : setRatingBooking({ ...entry.raw, id: entry.id, type: entry.resourceType, itemId: entry.resourceId, title: entry.title, proName: entry.provider })} onOpen={openItem} onMessage={item.kind === 'goods' ? openGoodsConversation : messageProvider} onCancel={cancelItem} onGoodsStatus={changeGoodsStatus} onReportIssue={(entry) => { setIssueOrder(entry); setIssueCategory('Item not as described'); setIssueDetails(''); setIssueError(''); }} />)}</AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      <RatingModal isOpen={Boolean(ratingBooking)} onClose={() => setRatingBooking(null)} booking={ratingBooking} onReviewSubmitted={() => setRatingBooking(null)} />

      <AnimatePresence>
        {detailsBooking && <motion.div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsBooking(null); }}
        >
          <motion.section
            role="dialog" aria-modal="true" aria-labelledby="booking-details-title"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="max-h-[90svh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">📋 Booking details · {detailsBooking.resourceType}</p>
                <h2 id="booking-details-title" className="mt-1 truncate text-xl font-black text-slate-900 dark:text-white">{detailsBooking.title}</h2>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-500 dark:text-gray-400">📌 Status: {String(detailsBooking.status).replaceAll('_', ' ')}</p>
              </div>
              <button type="button" onClick={() => setDetailsBooking(null)} aria-label="Close booking details" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-gray-800/70">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">📅 Date &amp; time</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">{detailStart}</p>
                  {detailEnd && <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Until {detailEnd}</p>}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-gray-800/70">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500"><MapPin className="h-3.5 w-3.5" />📍 Location</p>
                  {detailTravelLabel && <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-300">{detailTravelLabel}</p>}
                  <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">{detailLocation || (detailRaw.locationOption === 'comeToYou' ? 'Client work address was not saved with this booking' : detailRaw.locationOption === 'goToThem' ? 'At the provider’s location' : 'Location to be confirmed with the provider')}</p>
                  {detailRaw.locationOption === 'comeToYou' && <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">The provider comes to your address</p>}
                </div>
              </div>

              <section>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">🧰 What you booked</h3>
                {detailServices.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{detailServices.map((service, index) => <span key={`${service}-${index}`} className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{service}</span>)}</div> : <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{detailsBooking.title}</p>}
                {(detailRaw.numberOfGuests || detailRaw.numberOfRooms || detailRaw.selectedPerformer || detailRaw.functionType) && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-gray-300">
                  {detailRaw.numberOfGuests && <span>👥 {detailRaw.numberOfGuests} guest{Number(detailRaw.numberOfGuests) === 1 ? '' : 's'}</span>}
                  {detailRaw.numberOfRooms && <span>🛏️ {detailRaw.numberOfRooms} room{Number(detailRaw.numberOfRooms) === 1 ? '' : 's'}</span>}
                  {detailRaw.selectedPerformer && <span>👤 Requested worker: {detailRaw.selectedPerformer}</span>}
                  {detailRaw.functionType && <span>🎉 {detailRaw.functionType}</span>}
                </div>}
              </section>

              {detailRaw.message && <section className="rounded-2xl border border-slate-200 p-4 dark:border-gray-700">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">📝 Notes for the provider</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-gray-200">{String(detailRaw.message).slice(0, 700)}</p>
              </section>}

              {detailsBooking.price != null && <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-gray-800"><span className="text-sm font-semibold text-slate-600 dark:text-gray-300">💰 Booking total</span><span className="text-lg font-black text-slate-900 dark:text-white">R{Number(detailsBooking.price).toLocaleString('en-ZA', { maximumFractionDigits: 2 })}</span></div>}

              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-gray-400">LoopOut does not collect payment for this service. Confirm the final scope and payment arrangements directly with the provider.</p>
            </div>

            <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
              {detailMayCancel && <button type="button" disabled={!detailCanCancel || busyId === detailsBooking.id} onClick={() => cancelItem(detailsBooking)} className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">{detailCanCancel ? 'Cancel booking' : '48-hour cancellation window closed'}</button>}
              {detailsBooking.needsAction && <button type="button" disabled={busyId === detailsBooking.id} onClick={() => finishItem(detailsBooking)} className="min-h-11 flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-emerald-700 disabled:opacity-50">Complete &amp; rate</button>}
              {detailsBooking.completed && <button type="button" onClick={() => { setRatingBooking({ ...detailRaw, id: detailsBooking.id, type: detailsBooking.resourceType, itemId: detailsBooking.resourceId, title: detailsBooking.title, proName: detailsBooking.provider }); setDetailsBooking(null); }} className="min-h-11 flex-1 rounded-xl bg-amber-500 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-amber-600">Rate provider</button>}
              {detailsBooking.providerId && <button type="button" onClick={() => messageProvider(detailsBooking)} className="min-h-11 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Message provider</button>}
            </div>
          </motion.section>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {issueOrder && <motion.div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setIssueOrder(null); }}>
          <motion.form onSubmit={submitIssueReport} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Marketplace support</p><h2 className="mt-1 text-xl font-black">Report a problem</h2><p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{issueOrder.title}</p></div><button type="button" onClick={() => setIssueOrder(null)} aria-label="Close report form" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button></div>
            <label className="mt-5 block text-xs font-bold text-slate-700 dark:text-gray-200">What happened?<select value={issueCategory} onChange={(event) => setIssueCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-950">{['Item not as described', 'Collection problem', 'Safety concern', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="mt-4 block text-xs font-bold text-slate-700 dark:text-gray-200">Details<textarea value={issueDetails} onChange={(event) => setIssueDetails(event.target.value)} rows={4} minLength={8} maxLength={1000} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-950" placeholder="Tell us what happened (8–1,000 characters)." /></label>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-gray-400">Your report is saved with this request, shared with the other person, and sent to LoopOut administrators. Keep it factual and don’t include payment credentials.</p>
            {issueError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{issueError}</p>}
            <button type="submit" disabled={busyId === issueOrder.id || issueDetails.trim().length < 8} className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-amber-700 disabled:opacity-50">{busyId === issueOrder.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Submit report'}</button>
          </motion.form>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {ratingOrder && <motion.div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setRatingOrder(null); }}>
          <motion.form onSubmit={submitFoodRating} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Order complete</p><h2 className="mt-1 text-xl font-black">Rate {ratingOrder.title}</h2></div><button type="button" onClick={() => setRatingOrder(null)} aria-label="Close rating" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button></div>
            <div className="my-5 flex justify-center gap-2" aria-label={`Selected rating: ${foodRating} stars`}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setFoodRating(value)} aria-label={`Rate ${value} stars`} className="rounded-lg p-1"><Star className={`h-8 w-8 ${value <= foodRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-gray-600'}`} /></button>)}</div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-200">Review (optional)<textarea value={foodComment} onChange={(event) => setFoodComment(event.target.value)} rows={3} maxLength={500} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-950" placeholder="How was the food and service?" /></label>
            {foodRatingError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{foodRatingError}</p>}
            <button type="submit" disabled={busyId === ratingOrder.id} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-amber-600 disabled:opacity-50">{busyId === ratingOrder.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}Submit rating</button>
          </motion.form>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
