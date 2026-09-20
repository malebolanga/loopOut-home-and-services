import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { UtensilsCrossed } from 'lucide-react';
import { FaTimes, FaCalendarCheck, FaWhatsapp, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

const urgencyStyles = {
  today:    { pill: 'bg-rose-500 text-white',   dot: 'bg-rose-500',   label: 'TODAY' },
  tomorrow: { pill: 'bg-amber-500 text-white',  dot: 'bg-amber-500',  label: 'TOMORROW' },
  soon:     { pill: 'bg-blue-500 text-white',   dot: 'bg-blue-500',   label: 'SOON' },
  upcoming: { pill: 'bg-slate-600 text-white',  dot: 'bg-slate-400',  label: 'UPCOMING' },
};

const statusColors = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  approved:  'bg-emerald-100 text-emerald-700',
  assigned:  'bg-blue-100 text-blue-700',
  enroute:   'bg-indigo-100 text-indigo-700',
  ongoing:   'bg-rose-100 text-rose-700',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Food Specials Strip (Shown when there is NO "Your Upcoming") ─────────────
export const FALLBACK_FOOD_SPECIALS = [
  { id: 'special-1', name: 'Flame BBQ Ribs',         price: 145, tag: 'Chef Special',  image: '🍖', shopId: 'urban-grill',   shopName: 'Urban Grill',      shopImage: '🥙', shopCuisine: 'Grill & Flame' },
  { id: 'special-2', name: 'Beef Stew & Pap',         price: 115, tag: 'Special',       image: '🥘', shopId: 'mamas-kitchen', shopName: "Mama's Kitchen",   shopImage: '🍛', shopCuisine: 'Local Favourites' },
  { id: 'special-3', name: 'Chicken Caesar Salad',   price: 105, tag: 'Fresh Special', image: '🥗', shopId: 'green-table',   shopName: 'The Green Table',  shopImage: '🥗', shopCuisine: 'Healthy & Fresh' },
  { id: 'special-4', name: 'Steak & Chakalaka Pap',  price:  99, tag: 'Special',       image: '🥩', shopId: 'mapho',         shopName: 'Mapho Kitchen',    shopImage: '🏪', shopCuisine: 'Traditional' },
  { id: 'special-5', name: 'Special Dagwood Kota',   price:  55, tag: 'Popular',       image: '🥪', shopId: 'lungile-food',  shopName: 'Lungile & Son',    shopImage: '🥙', shopCuisine: 'Street Food' },
  { id: 'special-6', name: 'Loaded Kota Special',    price:  50, tag: 'Special',       image: '🥪', shopId: 'kota-joint',    shopName: 'Kota Joint',       shopImage: '🥪', shopCuisine: 'Fast Food' },
  { id: 'special-7', name: 'Crispy Seasoned Chips',  price:  35, tag: 'Special',       image: '🍟', shopId: 'lungile-food',  shopName: 'Lungile & Son',    shopImage: '🍿', shopCuisine: 'Fast Food' },
];

export const FoodSpecialsStrip = ({ navigate }) => {
  const [foodItems, setFoodItems] = useState(FALLBACK_FOOD_SPECIALS);

  useEffect(() => {
    let isMounted = true;
    const fetchShops = async () => {
      try {
        const res = await fetch('/api/lunch/shops');
        if (!res.ok) return;
        const shops = await res.json();
        if (!Array.isArray(shops) || shops.length === 0) return;
        const collected = [];
        shops.forEach((shop) => {
          if (!shop.meals?.length) return;
          const available = shop.meals.filter((m) => m.isAvailable !== false);
          if (!available.length) return;
          const sorted = [...available].sort((a, b) => {
            const aSpec = /(special|popular|hot|chef)/i.test(a.tag || '');
            const bSpec = /(special|popular|hot|chef)/i.test(b.tag || '');
            return aSpec && !bSpec ? -1 : !aSpec && bSpec ? 1 : 0;
          });
          sorted.slice(0, 2).forEach((meal) => {
            collected.push({ id: meal.id, name: meal.name, price: meal.price, tag: meal.tag || 'Special', image: meal.image || '🍱', shopId: shop.id || shop._id, shopName: shop.name, shopImage: shop.image || '🏪', shopCuisine: shop.cuisine || 'Local' });
          });
        });
        if (isMounted && collected.length > 0) setFoodItems(collected);
      } catch { /* keep fallback */ }
    };
    fetchShops();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="mb-6 -mx-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Food Specials</span>
          <span className="text-[9px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">Specials</span>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/lunch')} className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider cursor-pointer hover:underline flex items-center gap-1">
          See All Food <span aria-hidden="true">→</span>
        </motion.button>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1.5 snap-x snap-mandatory">
        {foodItems.map((item, i) => (
          <motion.div
            key={`${item.shopId}-${item.id || i}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/lunch', { state: { selectedShopId: item.shopId, highlightMealId: item.id } })}
            className="snap-start shrink-0 w-[140px] sm:w-[160px] cursor-pointer flex flex-col group bg-transparent border-0 shadow-none rounded-none"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-gray-800 dark:to-gray-900 mb-1.5 border border-amber-100/70 dark:border-gray-800 shadow-2xs">
              {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl select-none group-hover:scale-110 transition-transform duration-300">{item.image || '🍱'}</div>
              )}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-rose-500 text-white">{item.tag || 'SPECIAL'}</div>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/65 backdrop-blur-md text-white rounded-md text-[8px] font-bold flex items-center gap-1 shadow-sm max-w-[90px] truncate">
                <span className="text-[9px]">{item.shopImage || '🏪'}</span>
                <span className="text-[7.5px] font-black uppercase tracking-wider truncate">{item.shopName}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-gray-900 dark:text-white truncate text-[12px] sm:text-[13px] leading-tight mb-0.5 group-hover:text-amber-600 transition-colors">{item.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-[10.5px] truncate leading-tight flex items-center gap-1">
                <span className="truncate font-medium text-gray-700 dark:text-gray-300">{item.shopName}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="truncate text-gray-400">{item.shopCuisine}</span>
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-black text-gray-900 dark:text-white text-[11.5px] sm:text-[12px]">R{item.price}</span>
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 group-hover:bg-amber-500 group-hover:text-white transition-colors">Order</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── Mini Calendar Component ──────────────────────────────────────────────────
const MiniCalendar = ({ bookings, onDaySelect, selectedDate, currentMonth, setCurrentMonth }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a set of booked dates for fast lookup
  const bookedDates = {};
  bookings.forEach(b => {
    const d = new Date(b.startDateRaw);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    if (!bookedDates[key]) bookedDates[key] = [];
    bookedDates[key].push(b);
  });

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white active:scale-95">
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="text-[12px] font-black text-white uppercase tracking-[0.15em]">
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white active:scale-95">
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-600 py-2">
            {d[0]}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 p-2 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateObj = new Date(year, month, day);
          dateObj.setHours(0, 0, 0, 0);
          const key = dateObj.toDateString();
          const isToday = dateObj.getTime() === today.getTime();
          const hasBooking = !!bookedDates[key];
          const bookingList = bookedDates[key] || [];
          const isSelected = selectedDate && new Date(selectedDate).setHours(0,0,0,0) === dateObj.getTime();
          const isPast = dateObj < today;

          // Get urgency for dot color
          const urgency = hasBooking ? (bookingList[0]?.urgency || 'upcoming') : null;
          const dotColor = urgency ? urgencyStyles[urgency]?.dot : null;

          return (
            <motion.button
              key={day}
              whileTap={{ scale: 0.9 }}
              onClick={() => hasBooking && onDaySelect(key, bookingList)}
              className={`
                relative flex flex-col items-center justify-center aspect-square rounded-xl text-[11px] font-bold transition-all
                ${isSelected ? 'bg-rose-500 text-white shadow-md shadow-rose-200' :
                  isToday ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-800' :
                  isPast ? 'text-gray-300 dark:text-gray-700' :
                  hasBooking ? 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer' :
                  'text-gray-500 dark:text-gray-500 cursor-default'}
              `}
            >
              {day}
              {hasBooking && !isSelected && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${dotColor || 'bg-rose-500'}`} />
              )}
              {isSelected && hasBooking && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white/70" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Booking Details Popup ────────────────────────────────────────────────────
const BookingDetailModal = ({ booking, onClose, navigate }) => {
  if (!booking) return null;
  const u = urgencyStyles[booking.urgency] || urgencyStyles.upcoming;
  const sc = statusColors[booking.status] || 'bg-slate-100 text-slate-600';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-slate-100 dark:border-gray-800 max-h-[88vh] flex flex-col"
        >
          {/* Header Image */}
          <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 flex-shrink-0">
            {booking.image ? (
              <img src={booking.image} alt={booking.title} className="w-full h-full object-cover opacity-85" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">{booking.emoji}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${u.pill}`}>
                  {booking.isToday ? '⚡ Due Today' : booking.isTomorrow ? '⏰ Due Tomorrow' : `🗓️ Due in ${booking.diffDays} days`}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest">{booking.type}</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer">
                <FaTimes className="text-xs" />
              </button>
            </div>
            <div className="absolute bottom-3.5 left-4 right-4 text-white">
              <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-0.5">Booking Details</p>
              <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-1">{booking.title}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-hide">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg"><FaCalendarCheck /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Due Date</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{booking.dateStr} &bull; {booking.timeStr}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sc}`}>{booking.status}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={booking.selectedPerformer ? (booking.performerImage || booking.proAvatar) : booking.proAvatar} alt={booking.proName} className="w-11 h-11 rounded-full object-cover border-2 border-slate-100" onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=pro'; }} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{booking.selectedPerformer ? 'Assigned Pro' : 'Provider / Host'}</p>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{booking.selectedPerformer || booking.proName}</h4>
                    {booking.performerExperience && <span className="text-[9px] text-rose-500 font-bold uppercase">{booking.performerExperience} Exp</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {booking.proWhatsapp && (
                    <a href={`https://wa.me/${booking.proWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-md shadow-emerald-200 active:scale-95 transition-all"><FaWhatsapp className="text-base" /></a>
                  )}
                  {booking.proPhone && (
                    <a href={`tel:${booking.proPhone}`} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"><FaPhone className="text-xs" /></a>
                  )}
                </div>
              </div>
              {booking.address && (
                <div className="flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-gray-800 text-slate-600 dark:text-gray-400 text-xs">
                  <FaMapMarkerAlt className="text-rose-500 text-xs mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{booking.address}</span>
                </div>
              )}
            </div>

            {(booking.price || booking.notes) && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-gray-900 rounded-2xl text-xs">
                {booking.price && (
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Price</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">R{booking.price}</span>
                  </div>
                )}
                {booking.notes && <p className="text-[11px] text-slate-500 italic max-w-[200px] truncate">{booking.notes}</p>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => { const r = `/${booking.type === 'listing' ? 'listing' : booking.type}/${booking.itemId}`; onClose(); navigate(r); }}
              className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-98 transition-all cursor-pointer"
            >
              View Item Details
            </button>
            <button
              onClick={() => { onClose(); navigate('/profile?tab=bookings'); }}
              className="py-3 px-4 bg-white dark:bg-gray-800 hover:bg-slate-100 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-700 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
            >
              All Bookings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Main Upcoming Booking Strip (now a Calendar) ────────────────────────────
export const UpcomingBookingStrip = ({ navigate }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDayBookings, setSelectedDayBookings] = useState(null); // list of bookings for tapped day
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  useEffect(() => {
    if (!currentUser?._id) { setLoading(false); return; }
    const controller = new AbortController();
    const fetch_ = async () => {
      try {
        const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const active = data
          .filter(b => {
            const d = new Date(b.startDate); d.setHours(0, 0, 0, 0);
            return d >= now && !['cancelled', 'completed', 'declined'].includes(b.status);
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 20)
          .map(b => {
            const due = new Date(b.startDate);
            const diffMs = due - new Date();
            const diffDays = Math.floor(diffMs / 86400000);
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
              startDateRaw: b.startDate,
              diffDays, urgency, isToday, isTomorrow,
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
              notes: b.notes || b.specialInstructions || '',
            };
          });
        setBookings(active);
      } catch (e) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
    return () => controller.abort();
  }, [currentUser?._id]);

  // No user or no bookings → food specials
  if (!loading && (!currentUser || bookings.length === 0)) {
    return <FoodSpecialsStrip navigate={navigate} />;
  }

  // Upcoming bookings list for the next few (sidebar)
  const nextBookings = bookings.slice(0, 3);

  const handleDaySelect = (key, dayBookings) => {
    if (dayBookings.length === 1) {
      setSelectedBooking(dayBookings[0]);
    } else {
      setSelectedDayBookings(dayBookings);
    }
  };

  return (
    <>
      <section className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-rose-500" />
            <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Your Calendar</span>
            {bookings.length > 0 && (
              <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{bookings.length}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upcoming-bookings')}
            className="text-[10px] font-black text-rose-500 uppercase tracking-wider cursor-pointer hover:underline"
          >
            See All
          </motion.button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 animate-pulse h-64" />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Mini Calendar */}
            <MiniCalendar
              bookings={bookings}
              onDaySelect={handleDaySelect}
              selectedDate={selectedBooking?.startDateRaw || null}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />

            {/* Next Up — compact list of upcoming bookings */}
            {nextBookings.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-1">Next Up</p>
                {nextBookings.map((b, i) => {
                  const u = urgencyStyles[b.urgency] || urgencyStyles.upcoming;
                  const sc = statusColors[b.status] || 'bg-slate-100 text-slate-600';
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBooking(b)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-rose-200 dark:hover:border-rose-900 transition-colors shadow-xs"
                    >
                      {/* Image / Emoji */}
                      <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                        {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" /> : b.emoji}
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-950 ${u.dot}`} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-gray-900 dark:text-white truncate leading-tight">{b.title}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {b.isToday ? '⚡ Today' : b.isTomorrow ? '⏰ Tomorrow' : `🗓️ ${b.dateStr.replace(/, \d{4}/, '')}`}
                          {' · '}{b.timeStr}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sc}`}>{b.status}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Multi-booking day picker */}
      <AnimatePresence>
        {selectedDayBookings && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDayBookings(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-950 rounded-t-3xl rounded-b-3xl shadow-2xl z-10 overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" /></div>
              <div className="px-5 pb-2 pt-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Multiple bookings on this day</p>
              </div>
              <div className="px-4 pb-5 space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
                {selectedDayBookings.map((b) => {
                  const sc = statusColors[b.status] || 'bg-slate-100 text-slate-600';
                  return (
                    <motion.div
                      key={b.id} whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedDayBookings(null); setSelectedBooking(b); }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-rose-300 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
                        {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" /> : b.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-gray-900 dark:text-white truncate">{b.title}</p>
                        <p className="text-[10px] text-gray-500 truncate">{b.timeStr}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sc}`}>{b.status}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          navigate={navigate}
        />
      )}
    </>
  );
};

export default UpcomingBookingStrip;
