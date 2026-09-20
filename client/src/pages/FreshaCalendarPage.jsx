import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { pushPhoneNotification } from '../components/PhoneNotificationManager';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowPathIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  TicketIcon,
  CheckCircleIcon,
  MapPinIcon,
  XMarkIcon,
  PhoneIcon,
  ArrowTopRightOnSquareIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { FaWhatsapp, FaPhone, FaCalendarCheck, FaTimes, FaStar, FaChevronRight, FaCar, FaHandsWash, FaCut, FaMoneyBillWave, FaTag } from 'react-icons/fa';

// ─────────────────────────────────────────────
// Booking Type Meta (Fresha / loopOut Style)
// ─────────────────────────────────────────────
const TYPE_META = {
  listing: {
    label: 'Home Stay',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-l-4 border-orange-500',
    cardBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    icon: HomeIcon,
    dot: 'bg-orange-500',
  },
  helper: {
    label: 'Helper',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-l-4 border-blue-500',
    cardBg: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
    icon: UserIcon,
    dot: 'bg-blue-500',
  },
  service: {
    label: 'Salon / Service',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-l-4 border-purple-500',
    cardBg: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white',
    icon: BriefcaseIcon,
    dot: 'bg-purple-500',
  },
  event: {
    label: 'Event',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-l-4 border-emerald-500',
    cardBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    icon: TicketIcon,
    dot: 'bg-emerald-500',
  },
};

function getBookingType(b) {
  if (b.helper) return 'helper';
  if (b.service) return 'service';
  if (b.event) return 'event';
  return 'listing';
}

function getBookingItem(b) {
  return b.helper || b.service || b.event || b.listing || null;
}

function getBookingTitle(b) {
  const item = getBookingItem(b);
  if (!item) return 'Service Appointment';
  return item.name || item.eventName || item.title || 'Service Appointment';
}

function getBookingAddress(b) {
  const item = getBookingItem(b);
  if (!item) return '';
  return item.address || item.location || item.venue || '';
}

function getBookingCost(b) {
  if (!b) return 'R0';
  const rawCost = b.totalPrice ?? b.price ?? getBookingItem(b)?.price ?? getBookingItem(b)?.cost;
  if (rawCost !== undefined && rawCost !== null && !isNaN(rawCost) && Number(rawCost) > 0) {
    return `R${Number(rawCost).toLocaleString()}`;
  }
  if (rawCost === 0) return 'Free';
  return 'R0';
}

function getBookingImage(b) {
  const item = getBookingItem(b) || {};
  return item.imageUrls?.[0] || item.image || item.imageUrl || item.photo || item.avatar || b.image || b.imageUrl || '';
}

function getBookingStatusLabel(status) {
  const labels = {
    pending: 'Pending', approved: 'Confirmed', confirmed: 'Confirmed', ongoing: 'In progress',
    work_completed: 'Completed', completed: 'Completed', cancelled: 'Cancelled', declined: 'Declined',
  };
  return labels[String(status || 'pending').toLowerCase()] || 'Pending';
}

function getBookingTypeLabel(b) {
  if (!b) return 'Appointment';
  if (b.subtype) return b.subtype;
  const item = getBookingItem(b);
  if (item) {
    if (item.category) return item.category;
    if (item.serviceType) return item.serviceType;
    if (item.type) return item.type;
    if (item.title && item.title.toLowerCase().includes('car wash')) return 'Car Wash';
    if (item.name && item.name.toLowerCase().includes('car wash')) return 'Car Wash';
  }
  const mainType = getBookingType(b);
  switch (mainType) {
    case 'helper': return 'Helper Service';
    case 'service': return 'Salon & Beauty';
    case 'event': return 'Event Ticket';
    case 'listing': return 'Home Stay';
    default: return 'Appointment';
  }
}

function getBookingDetailPath(booking) {
  const item = getBookingItem(booking);
  if (!item?._id) return '/upcoming-bookings';

  switch (getBookingType(booking)) {
    case 'helper': return `/helper/${item._id}`;
    case 'service': return `/service/${item._id}`;
    case 'event': return `/event/${item._id}`;
    default: return `/listing/${item._id}`;
  }
}

// Convert date to minutes from midnight
function toGridMinutes(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
}

// Format time: "09:30 AM"
function fmtTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Duration in minutes
function durationMins(startStr, endStr) {
  if (!startStr || !endStr) return 60;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 60;
  const diff = end - start;
  return Math.max(30, Math.round(diff / 60000));
}

// Hourly time slots (07:00 AM to 07:00 PM)
const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 7;
  return {
    label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`,
    minutes: h * 60,
  };
});

const START_GRID_MINUTES = 7 * 60; // 07:00 AM
const HOUR_HEIGHT = 90; // Height per 60 minutes in pixels

const STATUS_COLOR = {
  confirmed: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
  approved: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
  pending: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
  ongoing: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
  work_completed: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300',
  completed: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300',
  cancelled: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
  declined: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
};

// ─────────────────────────────────────────────
// Main Fresha Daily & Hourly Calendar Page
// ─────────────────────────────────────────────
export default function FreshaCalendarPage() {
  const { currentUser } = useSelector((s) => s.user);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Day'); // 'Day', 'Week', 'Month'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'clients' (host appointments), 'my_bookings'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch both User Bookings and Host/Provider Client Appointments
  useEffect(() => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();

    const loadBookings = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const [userRes, hostRes] = await Promise.all([
          authenticatedFetch(`/api/bookings/user/${currentUser._id}`, { signal: controller.signal }).catch(() => null),
          authenticatedFetch(`/api/bookings/host/${currentUser._id}`, { signal: controller.signal }).catch(() => null),
        ]);

        let userBookingsData = [];
        let hostBookingsData = [];

        if (userRes && userRes.ok) {
          userBookingsData = await userRes.json();
        }
        if (hostRes && hostRes.ok) {
          hostBookingsData = await hostRes.json();
        }

        const map = new Map();

        // Add Host/Salon Client Appointments
        (Array.isArray(hostBookingsData) ? hostBookingsData : []).forEach((b) => {
          if (b && b._id) {
            map.set(b._id, { ...b, isHostBooking: true });
          }
        });

        // Add User's Personal Bookings
        (Array.isArray(userBookingsData) ? userBookingsData : []).forEach((b) => {
          if (b && b._id) {
            if (map.has(b._id)) {
              const existing = map.get(b._id);
              map.set(b._id, { ...existing, isUserBooking: true });
            } else {
              map.set(b._id, { ...b, isUserBooking: true });
            }
          }
        });

        const combined = Array.from(map.values());
        if (!controller.signal.aborted) {
          setBookings(combined);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setBookings([]);
          setLoadError(error.message || "Couldn't load appointments.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadBookings();
    return () => controller.abort();
  }, [currentUser?._id, refreshKey]);

  // Filter bookings based on selected role filter (All, Clients, My Bookings)
  const roleFilteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (roleFilter === 'clients' && !b.isHostBooking) return false;
      if (roleFilter === 'my_bookings' && !b.isUserBooking) return false;
      return true;
    });
  }, [bookings, roleFilter]);

  // Filter bookings for the selected date
  const dayBookings = useMemo(() => {
    return roleFilteredBookings.filter((b) => {
      if (!b.startDate) return false;
      if (['cancelled', 'declined'].includes(b.status)) return false;
      const bDate = new Date(b.startDate);
      return (
        bDate.getDate() === selectedDate.getDate() &&
        bDate.getMonth() === selectedDate.getMonth() &&
        bDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [roleFilteredBookings, selectedDate]);

  const bookingsForDate = (date) => roleFilteredBookings.filter((booking) => {
    if (!booking.startDate || ['cancelled', 'declined'].includes(booking.status)) return false;
    const bookingDate = new Date(booking.startDate);
    return bookingDate.getFullYear() === date.getFullYear() && bookingDate.getMonth() === date.getMonth() && bookingDate.getDate() === date.getDate();
  });

  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    const weekday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - weekday);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [selectedDate]);

  const upcomingBookings = useMemo(() => roleFilteredBookings
    .filter((booking) => booking.startDate && !['cancelled', 'declined'].includes(booking.status))
    .sort((a, b) => {
      const now = Date.now();
      const aFuture = new Date(a.startDate).getTime() >= now;
      const bFuture = new Date(b.startDate).getTime() >= now;
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      return aFuture ? new Date(a.startDate) - new Date(b.startDate) : new Date(b.startDate) - new Date(a.startDate);
    })
    .slice(0, 6), [roleFilteredBookings]);

  // Unique service columns for the day
  const typeColumns = useMemo(() => {
    const seen = new Set();
    const cols = [];
    dayBookings.forEach((b) => {
      const t = getBookingType(b);
      if (!seen.has(t)) {
        seen.add(t);
        cols.push(t);
      }
    });
    if (cols.length === 0) cols.push('service', 'helper', 'listing', 'event');
    return cols;
  }, [dayBookings]);

  // Stats for today & overall
  const todayClientCount = useMemo(() => {
    return dayBookings.filter((b) => b.isHostBooking).length;
  }, [dayBookings]);

  const activeCount = bookings.filter((b) => !['cancelled', 'declined', 'completed'].includes(b.status)).length;
  const upcomingCount = bookings.filter((b) => new Date(b.startDate) > new Date() && b.status !== 'cancelled').length;

  // Formatted date string
  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'Month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - (viewMode === 'Week' ? 7 : 1));
    setSelectedDate(d);
  };
  const handleNextDay = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'Month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + (viewMode === 'Week' ? 7 : 1));
    setSelectedDate(d);
  };
  const handleToday = () => setSelectedDate(new Date());

  // Handle status update (e.g., Accept/Confirm or Mark Complete)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await authenticatedFetch(`/api/bookings/update/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
        }

        if (newStatus === 'confirmed') {
          pushPhoneNotification({
            title: '📅 Appointment Confirmed',
            message: `Confirmed appointment for "${selectedBooking?.serviceTitle || 'Client'}". Scheduled on your Calendar!`,
            type: 'success',
            link: '/calendar'
          });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('loopout:notification-created'));
          }
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CalendarIcon className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-black mb-2">
          <span className="text-[#FF5A5F]">loop</span>Out Calendar
        </h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to view your daily schedule and client appointments.</p>
        <button
          onClick={() => navigate('/sign-in')}
          className="px-8 py-3.5 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition shadow-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex flex-col pb-24 md:pb-0">
      {/* ── Top Header Toolbar ── */}
      <header className="app-safe-top sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <span><span className="text-[#FF5A5F]">loop</span><span className="text-orange-500">Out</span> Schedule</span>
              {todayClientCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white animate-pulse">
                  {todayClientCount} {todayClientCount === 1 ? 'Client Appointment' : 'Client Appointments'} Today
                </span>
              )}
            </h1>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{formattedDate}</p>
          </div>
        </div>

        {/* Date Navigation & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition shadow-sm"
          >
            Today
          </button>
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
            <button onClick={handlePrevDay} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button onClick={handleNextDay} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Mode Pills */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {['Day', 'Week', 'Month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Role Filter & Stats Bar ── */}
      <div className="bg-white dark:bg-gray-900/80 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs overflow-x-auto scrollbar-hide gap-4">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Appointments' },
            { id: 'clients', label: `💈 Client Appointments (${bookings.filter(b => b.isHostBooking).length})` },
            { id: 'my_bookings', label: `👤 My Personal Bookings (${bookings.filter(b => b.isUserBooking).length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all border ${
                roleFilter === tab.id
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {dayBookings.length} Scheduled Today
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="text-gray-500 font-medium">{activeCount} Total Active</span>
        </div>
      </div>

      {/* ── Main Daily & Hourly Calendar Schedule Grid ── */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
        <section className="mx-auto mb-5 max-w-7xl rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h2 className="font-black text-gray-900 dark:text-white">Upcoming bookings</h2><p className="text-xs text-gray-500 dark:text-gray-400">Tap a card to view the full booking.</p></div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{upcomingBookings.length} upcoming</span>
          </div>
          {upcomingBookings.length ? <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {upcomingBookings.map((booking) => {
              const meta = TYPE_META[getBookingType(booking)] || TYPE_META.service;
              const Icon = meta.icon;
              const image = getBookingImage(booking);
              const status = String(booking.status || 'pending').toLowerCase();
              const statusClass = STATUS_COLOR[status] || STATUS_COLOR.pending;
              return <button key={booking._id} type="button" onClick={() => setSelectedBooking(booking)} className="group min-w-[258px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="relative h-28 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-950 dark:to-gray-800">
                  {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-rose-400" /></div>}
                  <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase shadow-sm ${statusClass}`}>{getBookingStatusLabel(status)}</span>
                  <span className="absolute bottom-3 right-3 rounded-xl bg-black/70 px-2.5 py-1.5 text-xs font-black text-white backdrop-blur-sm">{fmtTime(booking.startDate)}</span>
                </div>
                <div className="p-3"><div className="flex items-start justify-between gap-2"><p className="line-clamp-1 text-sm font-black text-gray-900 dark:text-white">{getBookingTitle(booking)}</p><span className="shrink-0 text-xs font-black text-emerald-600 dark:text-emerald-400">{getBookingCost(booking)}</span></div><p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{new Date(booking.startDate).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="mt-2 text-[10px] font-black uppercase tracking-wider text-rose-500">Tap to view booking</p></div>
              </button>;
            })}
          </div> : <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm font-semibold text-gray-400 dark:border-gray-700">No upcoming bookings yet.</p>}
        </section>

        {viewMode === 'Week' && <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid min-w-[700px] grid-cols-7 divide-x divide-gray-200 dark:divide-gray-800">
            {weekDays.map((day) => { const entries = bookingsForDate(day); const isToday = day.toDateString() === new Date().toDateString(); return <div key={day.toISOString()} className="min-h-[360px] p-3"><button type="button" onClick={() => { setSelectedDate(day); setViewMode('Day'); }} className={`w-full rounded-xl px-2 py-2 text-center transition ${isToday ? 'bg-rose-500 text-white' : 'hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}><span className="block text-[10px] font-black uppercase">{day.toLocaleDateString('en-ZA', { weekday: 'short' })}</span><span className="text-lg font-black">{day.getDate()}</span></button><div className="mt-3 space-y-2">{entries.map((booking) => <button key={booking._id} type="button" onClick={() => setSelectedBooking(booking)} className="w-full rounded-xl border-l-4 border-rose-500 bg-rose-50 p-2 text-left text-xs font-bold text-rose-950 transition hover:shadow-sm dark:bg-rose-950/30 dark:text-rose-100"><span className="block text-[10px] text-rose-600">{fmtTime(booking.startDate)}</span><span className="mt-1 block truncate">{getBookingTitle(booking)}</span></button>)}</div></div>; })}
          </div>
        </section>}

        {viewMode === 'Month' && <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => <div key={label} className="p-3 text-center text-xs font-black text-gray-500">{label}</div>)}</div>
          <div className="grid grid-cols-7">{monthDays.map((day) => { const entries = bookingsForDate(day); const isCurrentMonth = day.getMonth() === selectedDate.getMonth(); const isToday = day.toDateString() === new Date().toDateString(); return <button key={day.toISOString()} type="button" onClick={() => { setSelectedDate(day); setViewMode('Day'); }} className={`min-h-[94px] border-b border-r border-gray-100 p-2 text-left transition hover:bg-rose-50 dark:border-gray-800 dark:hover:bg-rose-500/10 ${isCurrentMonth ? '' : 'bg-gray-50/60 text-gray-400 dark:bg-gray-900/50'} ${isToday ? 'ring-2 ring-inset ring-rose-400' : ''}`}><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${isToday ? 'bg-rose-500 text-white' : ''}`}>{day.getDate()}</span>{entries.slice(0, 2).map((booking) => <span key={booking._id} className="mt-1 block truncate rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-black text-rose-800 dark:bg-rose-500/20 dark:text-rose-200">{fmtTime(booking.startDate)} {getBookingTitle(booking)}</span>)}{entries.length > 2 && <span className="mt-1 block text-[9px] font-black text-rose-600">+{entries.length - 2} more</span>}</button>; })}</div>
        </section>}

        {viewMode === 'Day' && (
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
          
          {/* Column Headers for Booking Categories / Service Types */}
          <div className="grid grid-cols-[80px_1fr] border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-20">
            <div className="p-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400 border-r border-gray-200 dark:border-gray-800">
              Time
            </div>
            
            <div className={`grid grid-cols-${typeColumns.length} divide-x divide-gray-200 dark:divide-gray-800`}>
              {typeColumns.map((colType) => {
                const meta = TYPE_META[colType] || TYPE_META.service;
                const IconComponent = meta.icon;
                const count = dayBookings.filter((b) => getBookingType(b) === colType).length;

                return (
                  <div key={colType} className="p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1.5 rounded-lg ${meta.dot} text-white`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-gray-900 dark:text-white truncate capitalize">
                        {meta.label} Appointments
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Grid & Schedule Canvas */}
          <div className="relative grid grid-cols-[80px_1fr] min-h-[1080px]">
            {/* Left Column: Hours */}
            <div className="border-r border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
              {HOURS.map((h) => (
                <div
                  key={h.minutes}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="border-b border-gray-100 dark:border-gray-800/60 p-2 text-right text-[11px] font-bold text-gray-400"
                >
                  {h.label}
                </div>
              ))}
            </div>

            {/* Right Column: Schedule Canvas Grid */}
            <div className={`relative grid grid-cols-${typeColumns.length} divide-x divide-gray-200 dark:border-gray-800`}>
              
              {/* Horizontal Hour Lines Background */}
              <div className="absolute inset-0 pointer-events-none">
                {HOURS.map((h) => (
                  <div
                    key={h.minutes}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-gray-100 dark:border-gray-800/60 w-full"
                  />
                ))}
              </div>

              {/* Columns for Booking Categories */}
              {typeColumns.map((colType) => {
                const meta = TYPE_META[colType] || TYPE_META.service;
                const colBookings = dayBookings.filter((b) => getBookingType(b) === colType);

                return (
                  <div key={colType} className="relative min-h-[1080px]">
                    {/* Hourly Clickable Time Slots */}
                    {HOURS.map((h) => (
                      <div
                        key={h.minutes}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        onClick={() => navigate('/categories')}
                        className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 cursor-pointer transition group/slot flex items-center justify-center border-b border-transparent"
                      >
                        <span className="opacity-0 group-hover/slot:opacity-100 text-rose-500 text-xs font-semibold flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg shadow border border-rose-200 dark:border-rose-800 transition-all">
                          <PlusIcon className="w-3.5 h-3.5" /> Book Slot
                        </span>
                      </div>
                    ))}

                    {/* Render Booking Cards on Schedule Timeline */}
                    {colBookings.map((booking) => {
                      const startMins = toGridMinutes(booking.startDate);
                      const dur = booking.endDate ? durationMins(booking.startDate, booking.endDate) : 60;

                      if (startMins === null) return null;

                      const topPx = ((startMins - START_GRID_MINUTES) / 60) * HOUR_HEIGHT;
                      const heightPx = (dur / 60) * HOUR_HEIGHT;
                      const title = getBookingTitle(booking);
                      const address = getBookingAddress(booking);
                      const status = STATUS_COLOR[booking.status] || 'bg-gray-100 text-gray-700';

                      // Client name if provider booking
                      const clientName = booking.isHostBooking 
                        ? (booking.user?.username || booking.name || 'Client Appointment')
                        : null;
                      
                      const clientAvatar = booking.isHostBooking
                        ? (booking.user?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')
                        : null;

                      return (
                        <motion.div
                          key={booking._id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          style={{
                            top: `${Math.max(0, topPx) + 3}px`,
                            height: `${Math.max(50, heightPx - 6)}px`,
                            left: '6px',
                            right: '6px',
                          }}
                          className={`absolute rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden z-10 ${meta.bgClass}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider opacity-90">
                                {fmtTime(booking.startDate)} {booking.endDate ? `– ${fmtTime(booking.endDate)}` : ''}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap justify-end">
                                {booking.isHostBooking && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white">
                                    💈 Client
                                  </span>
                                )}
                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${status}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>

                            {/* Booking Type Tag & Cost Pill */}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/20 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 flex items-center gap-1">
                                <FaTag className="text-[8px] opacity-75" />
                                {getBookingTypeLabel(booking)}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                                <FaMoneyBillWave className="text-[10px]" />
                                {getBookingCost(booking)}
                              </span>
                            </div>

                            {/* Client Header if Host Booking */}
                            {clientName ? (
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src={clientAvatar}
                                  alt={clientName}
                                  className="w-5 h-5 rounded-full object-cover border border-white"
                                  onError={(e) => { e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'; }}
                                />
                                <span className="font-black text-xs text-gray-900 dark:text-white truncate">
                                  Client: {clientName}
                                </span>
                              </div>
                            ) : null}

                            <h4 className="font-extrabold text-xs leading-snug truncate text-gray-900 dark:text-white">
                              {title}
                            </h4>

                            {address && (
                              <p className="text-[10px] opacity-75 truncate mt-0.5 flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3 flex-shrink-0" /> {address}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-black/10 dark:border-white/10 mt-1">
                            <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              {getBookingCost(booking)}
                            </span>
                            <span className="text-[10px] font-bold underline flex items-center gap-0.5">
                              View <ChevronRightIcon className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── Slide-Over Booking Details Drawer ── */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 h-full p-6 shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                <div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                    {selectedBooking.isHostBooking ? '💈 Incoming Client Appointment' : '👤 My Personal Booking'}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {getBookingTitle(selectedBooking)}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {/* Client Profile Card (for Salon Owners / Providers) */}
                {selectedBooking.isHostBooking && (
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 space-y-3">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <UserGroupIcon className="w-3.5 h-3.5" /> Arriving Client Info
                    </span>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedBooking.user?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                          alt={selectedBooking.user?.username || 'Client'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                          onError={(e) => { e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'; }}
                        />
                        <div>
                          <p className="font-extrabold text-base text-gray-900 dark:text-white">
                            {selectedBooking.user?.username || selectedBooking.name || 'Client'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                            {selectedBooking.phone || selectedBooking.contact || selectedBooking.user?.email || 'No phone provided'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons for Provider */}
                      <div className="flex gap-2">
                        {(selectedBooking.phone || selectedBooking.contact) && (
                          <a
                            href={`tel:${selectedBooking.phone || selectedBooking.contact}`}
                            className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:text-rose-500 border border-gray-200 dark:border-gray-700 transition shadow-sm"
                            title="Call Client"
                          >
                            <FaPhone className="text-sm" />
                          </a>
                        )}
                        {(selectedBooking.phone || selectedBooking.contact) && (
                          <a
                            href={`https://wa.me/${(selectedBooking.phone || selectedBooking.contact).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-md"
                            title="Chat on WhatsApp"
                          >
                            <FaWhatsapp className="text-lg" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Time & Date Card */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4 text-rose-500" />
                    <span>Appointment Time</span>
                  </div>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">
                    {new Date(selectedBooking.startDate).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm font-semibold text-rose-500">
                    {fmtTime(selectedBooking.startDate)} {selectedBooking.endDate ? `– ${fmtTime(selectedBooking.endDate)}` : ''}
                  </p>
                </div>

                {/* Booking Type & Total Cost Financial Summary Card */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      Booking Type
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                      <TagIcon className="w-4 h-4 text-emerald-500" />
                      {getBookingTypeLabel(selectedBooking)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-400 block mb-0.5">
                      Total Cost
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                      <FaMoneyBillWave className="text-base text-emerald-500" />
                      {getBookingCost(selectedBooking)}
                    </span>
                  </div>
                </div>

                {/* Status Indicator & Management */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Appointment Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize border ${STATUS_COLOR[selectedBooking.status] || 'bg-gray-100 text-gray-800'}`}>
                      {selectedBooking.status}
                    </span>
                  </div>

                  {/* Provider Quick Actions */}
                  {selectedBooking.isHostBooking && selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                    >
                      ✓ Accept &amp; Confirm Client Appointment
                    </button>
                  )}

                  {selectedBooking.isHostBooking && ['confirmed', 'approved', 'assigned', 'ongoing'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'completed')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                    >
                      ✓ Mark Appointment Completed
                    </button>
                  )}
                </div>

                {/* Location */}
                {getBookingAddress(selectedBooking) && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Salon / Location Address
                    </label>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-start gap-2">
                      <MapPinIcon className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      {getBookingAddress(selectedBooking)}
                    </p>
                  </div>
                )}

                {/* View Item Details */}
                <button
                  onClick={() => {
                    const path = getBookingDetailPath(selectedBooking);
                    navigate(path);
                  }}
                  className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <span>View Service / Listing Page</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
