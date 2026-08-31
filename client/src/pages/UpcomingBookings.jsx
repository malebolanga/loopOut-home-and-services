import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ClockIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import RatingModal from '../components/RatingModal';

export default function UpcomingBookings() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [closingId, setClosingId] = useState(null);

  // Filters & Search
  const [filterType, setFilterType] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, {
          signal: controller.signal
        });

        if (!res.ok) throw new Error('Failed to load upcoming bookings');
        const data = await res.json();

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const formatted = (Array.isArray(data) ? data : [])
          .filter((b) => {
            const d = new Date(b.startDate || b.date || b.createdAt);
            d.setHours(0, 0, 0, 0);
            return d >= now && !['cancelled', 'declined'].includes(b.status);
          })
          .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date))
          .map((b) => {
            const due = new Date(b.startDate || b.date || b.createdAt);
            const diffMs = due - new Date();
            const diffDays = Math.floor(diffMs / 86400000);
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const isToday = diffDays === 0;
            const isTomorrow = diffDays === 1;
            const urgency = isToday ? 'today' : isTomorrow ? 'tomorrow' : diffDays <= 3 ? 'soon' : 'upcoming';

            const type = b.listing ? 'listing' : b.helper ? 'helper' : b.event ? 'event' : 'service';
            const targetItem = b.listing || b.helper || b.service || b.event || {};

            return {
              id: b._id,
              title: targetItem.name || targetItem.title || 'Booking Request',
              image: targetItem.imageUrls?.[0] || targetItem.images?.[0] || targetItem.image || null,
              status: b.status || 'pending',
              dateStr: due.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
              timeStr: due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              diffDays,
              diffHrs,
              urgency,
              isToday,
              isTomorrow,
              type,
              itemId: targetItem._id || b.itemId,
              emoji: type === 'listing' ? '🏡' : type === 'helper' ? '🧹' : type === 'event' ? '🎟️' : '🛠️',
              proName: type === 'listing' ? (targetItem.userRef?.username || targetItem.name || 'Host') : (targetItem.name || 'Professional'),
              proAvatar: targetItem.userRef?.avatar || targetItem.imageUrls?.[0] || 'https://i.pravatar.cc/150?u=pro',
              proWhatsapp: b.phone || targetItem.phone || targetItem.contact || '',
              proPhone: b.phone || targetItem.phone || targetItem.contact || '',
              address: b.address || targetItem.address || targetItem.location || 'Polokwane, Limpopo',
              price: b.totalPrice || b.totalAmount || b.price || targetItem.price || null,
              notes: b.notes || b.specialInstructions || '',
              raw: b
            };
          });

        setBookings(formatted);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    return () => controller.abort();
  }, [currentUser]);

  const handleCloseWork = async (booking) => {
    if (!booking) return;
    try {
      setClosingId(booking.id);
      const res = await authenticatedFetch(`/api/bookings/update/${booking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: 'completed' } : b))
        );
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking((prev) => ({ ...prev, status: 'completed' }));
        }
        // Immediately pop up the Rating Modal for user feedback
        setRatingBooking(booking);
      }
    } catch (err) {
      console.error('Failed to close work:', err);
    } finally {
      setClosingId(null);
    }
  };

  const urgencyStyles = {
    today: { pill: 'bg-rose-500 text-white', bar: 'bg-rose-500', label: 'TODAY' },
    tomorrow: { pill: 'bg-amber-500 text-white', bar: 'bg-amber-500', label: 'TOMORROW' },
    soon: { pill: 'bg-blue-500 text-white', bar: 'bg-blue-500', label: 'SOON' },
    upcoming: { pill: 'bg-slate-700 text-white', bar: 'bg-slate-400', label: 'UPCOMING' }
  };

  const statusColors = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    confirmed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    approved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    assigned: 'text-blue-600 bg-blue-50 border-blue-200',
    enroute: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    ongoing: 'text-rose-600 bg-rose-50 border-rose-200',
    work_completed: 'text-purple-700 bg-purple-50 border-purple-200',
    completed: 'text-slate-600 bg-slate-50 border-slate-200'
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterType !== 'all' && b.type !== filterType) return false;
      if (filterUrgency === 'today' && !b.isToday) return false;
      if (filterUrgency === 'tomorrow' && !b.isTomorrow) return false;
      if (filterUrgency === 'soon' && (b.isToday || b.isTomorrow || b.diffDays > 3)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(query);
        const matchAddress = b.address.toLowerCase().includes(query);
        const matchPro = b.proName.toLowerCase().includes(query);
        if (!matchTitle && !matchAddress && !matchPro) return false;
      }

      return true;
    });
  }, [bookings, filterType, filterUrgency, searchQuery]);

  return (
    <div className="min-h-screen bg-white pb-28">
      <Helmet>
        <title>Your Upcoming Bookings | loopOut</title>
        <meta name="description" content="View and manage all your upcoming stays, helpers, services and event bookings." />
      </Helmet>

      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-100 transition-all text-slate-700 active:scale-95 cursor-pointer"
              aria-label="Go Back"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-rose-500" />
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                  Your Upcoming
                </h1>
                {bookings.length > 0 && (
                  <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    {bookings.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-0.5 hidden sm:block">
                Manage your reservations, scheduled services &amp; appointments
              </p>
            </div>
          </div>

          {/* Search Input in Top Bar */}
          <div className="relative flex-1 max-w-xs hidden md:block">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings or address..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Category & Urgency Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-gray-100">
          {/* Type Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: 'all', label: 'All ', emoji: '✨' },
              { id: 'listing', label: 'Stays ', emoji: '🏡' },
              { id: 'service', label: 'Services', emoji: '🛠️' },
              { id: 'helper', label: 'Helpers', emoji: '🧹' },
              { id: 'event', label: 'Events', emoji: '🎟️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Urgency Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: '⚡ Today' },
              { id: 'tomorrow', label: '⏰ Tomorrow' },
              { id: 'soon', label: '🗓️ Next 3 Days' }
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setFilterUrgency(u.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filterUrgency === u.id
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs font-extrabold'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-4 md:hidden">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings, address or provider..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 pt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-2.5" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : !currentUser ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🔒
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Sign in to view your upcoming bookings</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Track your confirmed stays, scheduled helpers, and experience appointments in one place.
            </p>
            <button
              onClick={() => navigate('/sign-in')}
              className="px-6 py-3 bg-slate-950 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all"
            >
              Sign In Now
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              📅
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1.5">No upcoming bookings found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {searchQuery || filterType !== 'all' || filterUrgency !== 'all'
                ? 'Try adjusting your filters or search query to find your reservations.'
                : 'Discover top stays, hire trusted domestic helpers, or schedule daily services today.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 transition-all cursor-pointer"
            >
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
            {filteredBookings.map((b, i) => {
              const u = urgencyStyles[b.urgency];
              const sc = statusColors[b.status] || 'text-gray-500 bg-gray-50 border-gray-200';

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedBooking(b)}
                  className="cursor-pointer flex flex-col bg-transparent border-0 shadow-none rounded-none group"
                >
                  {/* Borderless Airbnb aspect-[4/3] image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 mb-2">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
                        {b.emoji}
                      </div>
                    )}

                    {/* Urgency Pill */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${u.pill}`}>
                      {b.isToday ? 'Today' : b.isTomorrow ? 'Tomorrow' : `${b.diffDays}d left`}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <span>{b.emoji}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider capitalize">{b.type}</span>
                    </div>

                    {/* Urgency Accent Bottom Line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${u.bar}`} />
                  </div>

                  {/* Clean Info Section */}
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 truncate text-[14px] leading-tight mb-0.5">
                      {b.title}
                    </p>

                    <p className="text-gray-500 text-[13px] truncate leading-tight">
                      {b.dateStr} · {b.timeStr}
                    </p>

                    <p className="text-gray-400 text-[12px] truncate leading-tight mt-0.5">
                      {b.address?.split(',')[0] || b.proName}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100/80">
                      <span className="font-semibold text-gray-900 text-[14px]">
                        {b.price ? (typeof b.price === 'number' ? `R${b.price.toLocaleString()}` : `R${b.price}`) : 'Confirmed'}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${sc}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Details Modal Popup */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[88vh] flex flex-col"
            >
              {/* Header Image Area */}
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 flex-shrink-0">
                {selectedBooking.image ? (
                  <img
                    src={selectedBooking.image}
                    alt={selectedBooking.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {selectedBooking.emoji}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Controls */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${urgencyStyles[selectedBooking.urgency]?.pill || 'bg-rose-500 text-white'}`}>
                      {selectedBooking.isToday ? '⚡ Due Today' : selectedBooking.isTomorrow ? '⏰ Due Tomorrow' : `🗓️ Due in ${selectedBooking.diffDays} days`}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest">
                      {selectedBooking.type}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Title in Header */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-black text-lg leading-tight line-clamp-1">{selectedBooking.title}</h3>
                  <p className="text-xs text-white/70 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPinIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">{selectedBooking.address}</span>
                  </p>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-hide text-sm">
                {/* Schedule Card */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Scheduled Date &amp; Time</p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{selectedBooking.dateStr}</p>
                      <p className="text-xs text-gray-500 font-semibold">{selectedBooking.timeStr}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[selectedBooking.status] || 'bg-slate-100'}`}>
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Provider Card */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedBooking.proAvatar}
                      alt={selectedBooking.proName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Service Host / Pro</p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{selectedBooking.proName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedBooking.proWhatsapp && (
                      <a
                        href={`https://wa.me/${selectedBooking.proWhatsapp.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedBooking.proName)},%20I'm%20inquiring%20about%20my%20booking%20for%20${encodeURIComponent(selectedBooking.title)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all"
                        title="Chat on WhatsApp"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </a>
                    )}
                    {selectedBooking.proPhone && (
                      <a
                        href={`tel:${selectedBooking.proPhone}`}
                        className="p-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
                        title="Call Host"
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Price & Escrow Protection */}
                {selectedBooking.price && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Total Amount</p>
                      <p className="font-black text-emerald-900 text-base">
                        {typeof selectedBooking.price === 'number' ? `R${selectedBooking.price.toLocaleString()}` : `R${selectedBooking.price}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                      <span>Escrow Protected</span>
                    </div>
                  </div>
                )}

                {/* Work Completion Banner for Client Closure */}
                {selectedBooking.status === 'work_completed' && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-rose-50 border-2 border-purple-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow-md">
                        <SparklesIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-purple-950 uppercase tracking-tight">Work Marked Complete by Pro</p>
                        <p className="text-[11px] text-purple-700 font-semibold">Please inspect the work, close the job to release payment, and leave a review.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCloseWork(selectedBooking)}
                      disabled={closingId === selectedBooking.id}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {closingId === selectedBooking.id ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          <span>Close Work &amp; Rate Provider</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* If already completed, give quick access to rate */}
                {selectedBooking.status === 'completed' && (
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Service Closed</p>
                      <p className="text-xs font-bold text-amber-900">Share your rating and feedback</p>
                    </div>
                    <button
                      onClick={() => setRatingBooking(selectedBooking)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <StarIcon className="w-3.5 h-3.5" />
                      <span>Rate Pro</span>
                    </button>
                  </div>
                )}

                {/* Notes if present */}
                {selectedBooking.notes && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Special Instructions</p>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
                {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'work_completed' && (
                  <button
                    onClick={() => handleCloseWork(selectedBooking)}
                    disabled={closingId === selectedBooking.id}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Close Work &amp; Rate</span>
                  </button>
                )}
                {selectedBooking.itemId && (
                  <button
                    onClick={() => {
                      const type = selectedBooking.type === 'listing' ? 'listing' : selectedBooking.type;
                      navigate(`/${type}/${selectedBooking.itemId}`);
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rating & Review Pop-up Modal */}
      <RatingModal
        isOpen={Boolean(ratingBooking)}
        onClose={() => setRatingBooking(null)}
        booking={ratingBooking}
        onReviewSubmitted={() => {
          // Refresh list or update status
          if (ratingBooking) {
            setBookings((prev) =>
              prev.map((b) => (b.id === ratingBooking.id ? { ...b, status: 'completed' } : b))
            );
          }
        }}
      />
    </div>
  );
}
