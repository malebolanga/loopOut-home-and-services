import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  PlusIcon,
  HomeIcon,
  BriefcaseIcon,
  TicketIcon,
  CheckCircleIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  XMarkIcon,
  MapPinIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { updateUserSuccess } from "../redux/user/userSlice";
import NeighborhoodInsights from "../components/NeighborhoodInsights";

// Live clock hook
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const STATUS_MAP = {
  confirmed:  { label: 'Confirmed',  color: 'text-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  approved:   { label: 'Approved',   color: 'text-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  pending:    { label: 'Pending',    color: 'text-amber-400',   dot: 'bg-amber-400',   badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  cancelled:  { label: 'Cancelled', color: 'text-rose-400',    dot: 'bg-rose-400',    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
  declined:   { label: 'Declined',  color: 'text-rose-400',    dot: 'bg-rose-400',    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
  completed:  { label: 'Completed', color: 'text-blue-400',    dot: 'bg-blue-400',    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
};

const TYPE_MAP = {
  listing: { label: 'Stay',    color: 'bg-rose-500',    icon: HomeIcon },
  helper:  { label: 'Helper',  color: 'bg-blue-600',    icon: UserIcon },
  service: { label: 'Service', color: 'bg-violet-500',  icon: BriefcaseIcon },
  event:   { label: 'Event',   color: 'bg-amber-500',   icon: TicketIcon },
};

function getBookingMeta(booking) {
  if (booking.listing) return { ...TYPE_MAP.listing, item: booking.listing };
  if (booking.helper)  return { ...TYPE_MAP.helper,  item: booking.helper };
  if (booking.service) return { ...TYPE_MAP.service, item: booking.service };
  if (booking.event)   return { ...TYPE_MAP.event,   item: booking.event };
  return { label: 'Plan', color: 'bg-gray-500', icon: CalendarIcon, item: null };
}

export default function Planner() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const now = useClock();

  const [activeTab, setActiveTab] = useState("schedule");
  const [calendarMode, setCalendarMode] = useState("month"); // "month" | "week" | "day" | "list"
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");

  const [tripLocation, setTripLocation] = useState("");
  const [tripBudget, setTripBudget] = useState("");
  const [tripResults, setTripResults] = useState(null);
  const [isSearchingTrip, setIsSearchingTrip] = useState(false);

  const tasks = currentUser?.plannerTasks || [];
  const completedCount = tasks.filter(t => t.completed).length;

  // Month Grid Calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthGridDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1; // 0 = Mon
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        dayNum: prevMonthLastDay - i,
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
        dayNum: d,
      });
    }

    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNum: i,
      });
    }

    return days;
  }, [year, month]);

  // Week Calculation (Monday to Sunday)
  const currentWeekDays = useMemo(() => {
    const curr = new Date(selectedCalendarDate);
    let dayOfWeek = curr.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;

    const mon = new Date(curr);
    mon.setDate(curr.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      week.push(d);
    }
    return week;
  }, [selectedCalendarDate]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handlePrevWeek = () => {
    const prev = new Date(selectedCalendarDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedCalendarDate(prev);
    setCurrentMonthDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedCalendarDate);
    next.setDate(next.getDate() + 7);
    setSelectedCalendarDate(next);
    setCurrentMonthDate(next);
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedCalendarDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedCalendarDate(prev);
    setCurrentMonthDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedCalendarDate);
    next.setDate(next.getDate() + 1);
    setSelectedCalendarDate(prev);
    setCurrentMonthDate(prev);
  };

  const handleTodayReset = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    setSelectedCalendarDate(today);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/user/${currentUser._id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        if (Array.isArray(data)) setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentUser?._id]);

  const handleAddTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTaskText.trim() || !currentUser) return;
    try {
      const updated = [...(currentUser.plannerTasks || []), { task: newTaskText, completed: false, createdAt: new Date() }];
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerTasks: updated }),
      });
      const data = await res.json();
      if (res.ok) { dispatch(updateUserSuccess(data)); setNewTaskText(""); }
    } catch (err) { console.error(err); }
  };

  const handleToggleTask = async (idx) => {
    if (!currentUser) return;
    try {
      const updated = currentUser.plannerTasks.map((t, i) => i === idx ? { ...t, completed: !t.completed } : t);
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerTasks: updated }),
      });
      const data = await res.json();
      if (res.ok) dispatch(updateUserSuccess(data));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (idx) => {
    if (!currentUser) return;
    try {
      const updated = currentUser.plannerTasks.filter((_, i) => i !== idx);
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerTasks: updated }),
      });
      const data = await res.json();
      if (res.ok) dispatch(updateUserSuccess(data));
    } catch (err) { console.error(err); }
  };

  const handleTripSearch = async (e) => {
    e.preventDefault();
    if (!tripLocation || !tripBudget) return;
    setIsSearchingTrip(true);
    setTripResults(null);
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/trips/search?location=${encodeURIComponent(tripLocation)}&date=${new Date().toISOString()}`);
        const data = await res.json();
        setTripResults({
          realData: data.success ? data : { events: [] },
          internetSuggestions: [
            { type: 'restaurant', title: 'Fine Dining & Restaurants', desc: `Avg meal cost near ${tripLocation}: R150 – R350`, priceEstimate: 250, icon: '🍽️' },
            { type: 'groceries',  title: 'Fresh Produce & Snacks',    desc: 'Quick local snacks & fruit: R50 – R150',           priceEstimate: 100, icon: '🍎' },
            { type: 'activity',  title: 'Transport & City Explore',   desc: 'Estimated per-person cost: R100 – R300',           priceEstimate: 200, icon: '🚕' },
          ],
        });
      } catch (err) { console.error(err); }
      finally { setIsSearchingTrip(false); }
    }, 2200);
  };

  /* ---- Not logged in ---- */
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute top-[-15%] left-[20%] w-[50%] h-[50%] bg-rose-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-violet-500/8 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-sm">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CalendarIcon className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase mb-4">Your Planner</h1>
          <p className="text-white/40 font-medium leading-relaxed mb-10">Sign in to manage your schedule, track tasks, and plan your next trip.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/sign-in')} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(225,29,72,0.3)]">
              Sign In
            </button>
            <button onClick={() => navigate('/')} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
              Explore
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { key: 'schedule', label: 'Schedule', count: bookings.filter(b => b.status !== 'cancelled' && b.status !== 'declined').length },
    { key: 'tasks',    label: 'Tasks',    count: tasks.length - completedCount },
    { key: 'trip_planner', label: 'AI Trip', special: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 selection:bg-rose-500/30 overflow-x-hidden">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-rose-500/6 rounded-full blur-[130px]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-violet-500/6 rounded-full blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 pt-20 pb-28">

        {/* ── Header ── */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-7">
          {/* Left: title + date */}
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">
              My <span className="text-rose-500">Planner</span>
            </h1>
            <p className="text-gray-500 dark:text-white text-[11px] font-medium mt-1">
              {now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Right: inline clock pill + add button */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-500/5 border border-white/8 rounded-xl px-4 py-2 flex items-center gap-2">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-sm font-black tabular-nums tracking-tighter leading-none">
                {now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              aria-label="Add plan or booking"
              className="w-10 h-10 bg-rose-500 hover:bg-rose-400 text-white rounded-xl flex items-center justify-center shadow-[0_8px_20px_rgba(225,29,72,0.4)] hover:scale-110 active:scale-95 transition-all"
            >
              <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </div>
        </motion.header>

        {/* ── Quick Stats Row ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: 'Active', value: bookings.filter(b => !['cancelled','declined','completed'].includes(b.status)).length, color: 'text-rose-400' },
            { label: 'Done', value: `${completedCount}/${tasks.length || 0}`, color: 'text-emerald-400' },
            { label: 'Upcoming', value: bookings.filter(b => new Date(b.startDate) > new Date() && b.status !== 'cancelled').length, color: 'text-violet-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-2xl px-4 py-3 hover:bg-white/5 transition-colors">
              <div className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Tab Bar & View Toggle Row ── */}
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="flex gap-1.5 bg-white/3 border border-white/5 p-1 rounded-2xl w-fit">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? tab.special ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-[0_6px_16px_rgba(225,29,72,0.35)]'
                                  : 'bg-white dark:bg-gray-900 text-gray-950 shadow-md'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {tab.special && <SparklesIcon className="w-3.5 h-3.5" />}
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-black/10' : 'bg-white/10'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Schedule View Mode Switcher (Month, Week, Day, List) */}
          {activeTab === 'schedule' && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
              {[
                { key: 'month', label: 'Month', icon: CalendarDaysIcon },
                { key: 'week',  label: 'Week',  icon: CalendarIcon },
                { key: 'day',   label: 'Day',   icon: ClockIcon },
                { key: 'list',  label: 'List',  icon: ListBulletIcon },
              ].map((mode) => {
                const ModeIcon = mode.icon;
                return (
                  <button
                    key={mode.key}
                    onClick={() => setCalendarMode(mode.key)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      calendarMode === mode.key
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-white/40 hover:text-white'
                    }`}
                    title={`${mode.label} View`}
                  >
                    <ModeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline text-[9px] font-black uppercase tracking-wider">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
              className="space-y-6">

              {/* ── 1. CALENDAR MONTH GRID VIEW ── */}
              {calendarMode === 'month' && (
                <div className="bg-white/3 border border-white/8 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
                  {/* Calendar Month Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-white capitalize">
                        {currentMonthDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                      </h2>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                        Selected: {selectedCalendarDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTodayReset}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all"
                      >
                        Today
                      </button>
                      <button
                        onClick={handlePrevMonth}
                        className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all"
                        aria-label="Previous Month"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all"
                        aria-label="Next Month"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday Names Header */}
                  <div className="grid grid-cols-7 text-center border-b border-white/5 pb-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
                      <span key={idx} className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        {dayName}
                      </span>
                    ))}
                  </div>

                  {/* Month Grid Cells */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {monthGridDays.map((cell, idx) => {
                      const isToday = cell.date.toDateString() === new Date().toDateString();
                      const isSelected = cell.date.toDateString() === selectedCalendarDate.toDateString();

                      // Find bookings on this date
                      const dayBookings = bookings.filter((b) => {
                        if (!b.startDate || b.status === 'cancelled' || b.status === 'declined') return false;
                        const bDate = new Date(b.startDate);
                        return bDate.toDateString() === cell.date.toDateString();
                      });

                      const hasStay = dayBookings.some((b) => b.listing);
                      const hasHelper = dayBookings.some((b) => b.helper);
                      const hasService = dayBookings.some((b) => b.service);
                      const hasEvent = dayBookings.some((b) => b.event);

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedCalendarDate(cell.date)}
                          className={`relative h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-between p-2 transition-all border ${
                            isSelected
                              ? 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] scale-[1.03] z-10 font-black'
                              : isToday
                              ? 'bg-white/10 border-white/40 text-white font-bold'
                              : cell.isCurrentMonth
                              ? 'bg-white/3 border-white/5 hover:border-white/20 text-white/80 hover:bg-white/5'
                              : 'bg-transparent border-transparent text-white/15 hover:text-white/30'
                          }`}
                        >
                          <span className={`text-xs ${isToday ? 'text-rose-400 font-black' : ''}`}>
                            {cell.dayNum}
                          </span>

                          {/* Event / Booking Colored Indicator Dots */}
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {hasStay && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]" title="Stay booked" />}
                            {hasHelper && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" title="Helper booked" />}
                            {hasService && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" title="Service booked" />}
                            {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" title="Event ticket" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/5 text-[10px] font-bold text-white/40">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Stays</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Helpers</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" /> Services</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Events</span>
                  </div>

                  {/* Selected Date Agenda Section */}
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-rose-400" />
                        Agenda for {selectedCalendarDate.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </h3>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Book on this date
                      </button>
                    </div>

                    {/* Filter bookings for selected date */}
                    {(() => {
                      const selectedBookings = bookings.filter((b) => {
                        if (!b.startDate || b.status === 'cancelled' || b.status === 'declined') return false;
                        return new Date(b.startDate).toDateString() === selectedCalendarDate.toDateString();
                      });

                      if (selectedBookings.length === 0) {
                        return (
                          <div className="p-6 bg-white/2 border border-dashed border-white/10 rounded-2xl text-center">
                            <p className="text-xs text-white/40 font-medium">No bookings or events scheduled for this date.</p>
                            <button
                              onClick={() => setShowAddModal(false)}
                              className="mt-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10 transition-all"
                            >
                              Explore Available Services
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {selectedBookings.map((booking) => {
                            const meta = getBookingMeta(booking);
                            const status = STATUS_MAP[booking.status] || { label: booking.status, badge: 'bg-white/5 text-white/40' };
                            const Icon = meta.icon;
                            if (!meta.item) return null;

                            return (
                              <div
                                key={booking._id}
                                onClick={() => setSelectedBookingModal(booking)}
                                className="flex items-center justify-between p-4 bg-white/4 border border-white/8 hover:border-rose-500/40 rounded-2xl cursor-pointer transition-all"
                              >
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-10 h-10 ${meta.color} rounded-xl flex items-center justify-center text-white shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-white text-sm leading-tight">{meta.item.name || meta.item.eventName}</h4>
                                    <p className="text-[10px] text-white/40 font-medium mt-0.5">{meta.item.address || meta.item.location}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.badge}`}>
                                    {status.label}
                                  </span>
                                  <p className="text-xs font-black text-white mt-1">R{Number(booking.totalPrice || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── 2. CALENDAR WEEKLY VIEW ── */}
              {calendarMode === 'week' && (
                <div className="bg-white/3 border border-white/8 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
                  {/* Week Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-white capitalize">
                        Week of {currentWeekDays[0]?.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} – {currentWeekDays[6]?.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </h2>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                        Selected: {selectedCalendarDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={handleTodayReset} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all">
                        Today
                      </button>
                      <button onClick={handlePrevWeek} className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all" aria-label="Previous Week">
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button onClick={handleNextWeek} className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all" aria-label="Next Week">
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 7 Columns Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                    {currentWeekDays.map((wDate, idx) => {
                      const isToday = wDate.toDateString() === new Date().toDateString();
                      const isSelected = wDate.toDateString() === selectedCalendarDate.toDateString();

                      const dayBookings = bookings.filter(b => {
                        if (!b.startDate || b.status === 'cancelled' || b.status === 'declined') return false;
                        return new Date(b.startDate).toDateString() === wDate.toDateString();
                      });

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedCalendarDate(wDate)}
                          className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                            isSelected
                              ? 'bg-rose-500/15 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                              : isToday
                              ? 'bg-white/10 border-white/30'
                              : 'bg-white/3 border-white/5 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-rose-400' : 'text-white/40'}`}>
                                {wDate.toLocaleDateString('en-ZA', { weekday: 'short' })}
                              </span>
                              <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${isToday ? 'bg-rose-500 text-white' : 'text-white'}`}>
                                {wDate.getDate()}
                              </span>
                            </div>

                            {/* Booking chips in column */}
                            <div className="space-y-1.5 mt-2">
                              {dayBookings.map((b) => {
                                const meta = getBookingMeta(b);
                                if (!meta.item) return null;
                                return (
                                  <div
                                    key={b._id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedBookingModal(b); }}
                                    className={`p-1.5 rounded-lg text-[9px] font-bold text-white truncate flex items-center gap-1 ${meta.color} bg-opacity-80 hover:bg-opacity-100 transition-all`}
                                  >
                                    <span className="truncate">{meta.item.name || meta.item.eventName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {dayBookings.length === 0 && (
                            <p className="text-[9px] font-bold text-white/20 text-center py-2 italic">+ Open</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 3. CALENDAR DAILY TIMELINE VIEW ── */}
              {calendarMode === 'day' && (
                <div className="bg-white/3 border border-white/8 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-white capitalize">
                        {selectedCalendarDate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </h2>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                        {selectedCalendarDate.toDateString() === new Date().toDateString() ? 'Today Schedule' : 'Daily Timeline'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={handleTodayReset} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all">
                        Today
                      </button>
                      <button onClick={handlePrevDay} className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all" aria-label="Previous Day">
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button onClick={handleNextDay} className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all" aria-label="Next Day">
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day Agenda Timeline */}
                  <div className="space-y-3 pt-2">
                    {(() => {
                      const dayBookings = bookings.filter(b => {
                        if (!b.startDate || b.status === 'cancelled' || b.status === 'declined') return false;
                        return new Date(b.startDate).toDateString() === selectedCalendarDate.toDateString();
                      });

                      if (dayBookings.length === 0) {
                        return (
                          <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                            <CalendarIcon className="w-10 h-10 mx-auto text-white/20 mb-3" />
                            <p className="text-white/50 font-bold text-sm">No bookings scheduled for this date</p>
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="mt-4 px-6 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-400 transition-all shadow-[0_6px_16px_rgba(225,29,72,0.3)]"
                            >
                              + Add Booking
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {dayBookings.map(b => {
                            const meta = getBookingMeta(b);
                            const status = STATUS_MAP[b.status] || { label: b.status, badge: 'bg-white/5 text-white/40' };
                            const Icon = meta.icon;
                            if (!meta.item) return null;

                            return (
                              <div
                                key={b._id}
                                onClick={() => setSelectedBookingModal(b)}
                                className="group flex items-center justify-between p-5 bg-white/4 border border-white/8 hover:border-rose-500/40 rounded-2xl cursor-pointer transition-all"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 ${meta.color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
                                    <Icon className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{meta.label}</span>
                                      <span className="text-xs text-white/30">•</span>
                                      <span className="text-xs font-bold text-white/50">{new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h4 className="font-black text-white text-base leading-tight group-hover:text-rose-300 transition-colors mt-0.5">{meta.item.name || meta.item.eventName}</h4>
                                    <p className="text-xs text-white/40 font-medium mt-0.5">{meta.item.address || meta.item.location}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${status.badge}`}>
                                    {status.label}
                                  </span>
                                  <p className="text-base font-black text-white mt-1.5">R{Number(b.totalPrice || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── 4. LINEAR LIST VIEW ── */}
              {calendarMode === 'list' && (
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-36 bg-white/5 border border-white/5 rounded-[2rem] animate-pulse" />
                    ))
                  ) : bookings.filter(b => Math.round((new Date(b.startDate) - new Date()) / 86400000) >= 0).length > 0 ? (
                    bookings
                      .filter(b => Math.round((new Date(b.startDate) - new Date()) / 86400000) >= 0)
                      .map((booking, idx) => {
                      const meta = getBookingMeta(booking);
                      const status = STATUS_MAP[booking.status] || { label: booking.status, dot: 'bg-gray-400', badge: 'bg-white/5 border-white/10 text-white/40' };
                      const Icon = meta.icon;
                      if (!meta.item) return null;
                      const startDate = new Date(booking.startDate);
                      const msPerDay  = 86400000;
                      const diffDays  = Math.round((startDate - new Date()) / msPerDay);
                      const countdown = diffDays > 0
                        ? { label: `in ${diffDays}d`, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
                        : diffDays === 0
                        ? { label: 'Today!',          cls: 'text-amber-400  bg-amber-500/10  border-amber-500/20'  }
                        : { label: `${Math.abs(diffDays)}d ago`, cls: 'text-white/30 bg-white/5 border-white/10' };
                      const fmtDate   = (d) => d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
                      return (
                        <motion.div key={booking._id}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedBookingModal(booking)}
                          className="group relative bg-white/3 border border-white/5 hover:border-white/15 hover:bg-white/[0.06] rounded-[2rem] cursor-pointer transition-all duration-300 overflow-hidden">

                          {/* X Button to hide/cancel booking */}
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to remove this booking from your schedule?')) {
                                try {
                                  const res = await fetch(`/api/bookings/update/${booking._id}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'cancelled', cancelledBy: 'user' })
                                  });
                                  if (res.ok) {
                                    setBookings(prev => prev.filter(b => b._id !== booking._id));
                                  }
                                } catch (err) {
                                  console.error('Failed to cancel booking:', err);
                                }
                              }
                            }}
                            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-rose-500/80 text-white/40 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>

                      <div className={`h-1.5 w-full ${meta.color} opacity-70`} />

                      <div className="flex items-center gap-6 p-6">
                        <div className={`w-16 h-16 ${meta.color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl group-hover:scale-105 transition-transform`}>
                          <Icon className="w-7 h-7" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{meta.label}</span>
                            <span className="w-1 h-1 rounded-full bg-white/15" />
                            <span className="text-[10px] font-bold text-white/40">{fmtDate(startDate)}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${countdown.cls}`}>
                              {countdown.label}
                            </span>
                          </div>

                          <h3 className="font-black text-white text-lg leading-tight truncate group-hover:text-rose-300 transition-colors mb-1.5">
                            {meta.item.name || meta.item.eventName || 'Untitled'}
                          </h3>

                          <div className="flex items-center gap-1.5">
                            <MapPinIcon className="w-3.5 h-3.5 text-white/25 shrink-0" />
                            <p className="text-xs text-white/30 truncate font-medium">{meta.item.address || meta.item.location || 'Location TBD'}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${status.badge} flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                          <div>
                            <p className="text-xl font-black text-white leading-none">R{Number(booking.totalPrice || 0).toLocaleString()}</p>
                            <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mt-0.5">Total</p>
                          </div>
                          <ArrowRightIcon className="w-4 h-4 text-white/15 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <CalendarIcon className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/60 font-bold text-lg">No active bookings</p>
                  <p className="text-white/30 mt-2 text-sm">Book stays and services to see them here.</p>
                  <button onClick={() => navigate('/')}
                    className="mt-8 px-8 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-400 transition-colors shadow-[0_10px_25px_rgba(225,29,72,0.3)]">
                    Start Booking
                  </button>
                </motion.div>
              )}
                </div>
              )}
            </motion.div>
          )}

          {/* TASKS */}
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
              className="space-y-5">
              {/* Add task input */}
              <form onSubmit={handleAddTask} className="relative">
                <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Add a new task…"
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500/60 rounded-2xl py-5 px-6 pr-16 text-sm font-bold text-white placeholder:text-white/20 outline-none transition-all" />
                <button type="submit" disabled={!newTaskText.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-rose-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_8px_20px_rgba(225,29,72,0.3)] disabled:shadow-none">
                  <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </form>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Progress</span>
                    <span className="text-[9px] font-black text-emerald-400">{completedCount}/{tasks.length} done</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                  </div>
                </div>
              )}

              {/* Task list */}
              <div className="space-y-3">
                {tasks.length > 0 ? (
                  [...tasks].reverse().map((task, idx) => {
                    const originalIdx = tasks.length - 1 - idx;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                        className="group flex items-center gap-4 bg-white/3 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all">
                        <button onClick={() => handleToggleTask(originalIdx)}
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            task.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.4)]' : 'border-white/15 hover:border-white/30'
                          }`}>
                          {task.completed && <CheckIcon className="w-4 h-4 text-white stroke-[3px]" />}
                        </button>
                        <span className={`flex-1 text-sm font-bold transition-all ${task.completed ? 'text-white/20 line-through' : 'text-white'}`}>
                          {task.task}
                        </span>
                        <button onClick={() => handleDeleteTask(originalIdx)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 opacity-40">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="font-bold text-white/40 italic">No tasks yet. Add one above.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* AI TRIP PLANNER */}
          {activeTab === 'trip_planner' && (
            <motion.div key="trip" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
              className="space-y-8">
              {/* Search card */}
              <div className="bg-white/3 border border-white/8 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-500/10 to-transparent blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter">AI Trip Finder</h2>
                  </div>
                  <p className="text-white/30 text-sm font-medium mb-8">
                    Enter a destination and budget to discover local events, stays, and estimated costs.
                  </p>

                  <form onSubmit={handleTripSearch} className="space-y-4">
                    {/* Location */}
                    <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 mb-2 block">Destination</label>
                      <div className="relative">
                        <MapPinIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type="text" required value={tripLocation} onChange={e => setTripLocation(e.target.value)}
                          placeholder="e.g. Pretoria, Gauteng"
                          className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-2xl py-4 pl-11 pr-5 text-sm font-bold text-white placeholder:text-white/20 outline-none transition-all" />
                      </div>
                    </div>
                    {/* Budget */}
                    <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 mb-2 block">Budget (ZAR)</label>
                      <div className="relative">
                        <span className="font-black absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">R</span>
                        <input type="number" required value={tripBudget} onChange={e => setTripBudget(e.target.value)}
                          placeholder="5 000"
                          className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-2xl py-4 pl-10 pr-5 text-sm font-bold text-white placeholder:text-white/20 outline-none transition-all" />
                      </div>
                    </div>
                    <button type="submit" disabled={isSearchingTrip}
                      className="w-full mt-2 bg-gradient-to-r from-rose-500 to-violet-600 text-white rounded-2xl py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(225,29,72,0.25)]">
                      {isSearchingTrip ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Scanning loopOut network…
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          Analyze Trip
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Results */}
              <AnimatePresence>
                {tripResults && !isSearchingTrip && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                    {/* Neighborhood Insights */}
                    <NeighborhoodInsights location={tripLocation} />

                    {/* Budget breakdown */}
                    <div>
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                        🌐 Web Estimates · {tripLocation}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {tripResults.internetSuggestions?.map((sug, i) => (
                          <div key={i} className="bg-white/3 border border-white/5 p-6 rounded-[1.75rem] hover:bg-white/5 transition-colors">
                            <div className="text-3xl mb-4">{sug.icon}</div>
                            <h4 className="font-black text-white text-sm mb-2 leading-tight">{sug.title}</h4>
                            <p className="text-[11px] text-white/40 font-medium leading-relaxed">{sug.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Events */}
                    {tripResults.realData?.events?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">🎪 Events Found</h3>
                        <div className="space-y-3">
                          {tripResults.realData.events.map(ev => (
                            <div key={ev._id} onClick={() => navigate(`/event/${ev._id}`)}
                              className="flex items-center gap-4 p-4 bg-rose-500/5 border border-rose-500/15 rounded-2xl cursor-pointer hover:bg-rose-500/10 transition-colors">
                              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0">
                                <TicketIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-white text-sm">{ev.eventName || ev.name || 'Event'}</h4>
                                <p className="text-xs text-rose-400 font-bold mt-0.5">{ev.address}</p>
                              </div>
                              <p className="text-sm font-black text-white">R{ev.ticketPrice || ev.regularPrice || 0}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stays */}
                    {tripResults.realData?.listings?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">🏠 Local Stays</h3>
                        <div className="space-y-3">
                          {tripResults.realData.listings.map(item => (
                            <div key={item._id} onClick={() => navigate(`/listing/${item._id}`)}
                              className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl cursor-pointer hover:bg-blue-500/10 transition-colors">
                              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                <HomeIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-white text-sm">{item.name}</h4>
                                <p className="text-xs text-blue-400 font-bold mt-0.5">{item.address}</p>
                              </div>
                              <p className="text-sm font-black text-white">R{item.regularPrice}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results */}
                    {!tripResults.realData?.events?.length && !tripResults.realData?.listings?.length && !tripResults.realData?.helpers?.length && (
                      <div className="bg-white/3 border border-white/5 p-8 rounded-3xl text-center">
                        <p className="text-sm font-bold text-white/30 italic">No loopOut listings found in this area yet — but local meals & activities fit your budget!</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Add Booking Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-[1000]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0d0d14] border-t border-white/8 rounded-t-[3.5rem] z-[1001] p-10 shadow-2xl">
              <div className="max-w-lg mx-auto">
                {/* Handle */}
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5">
                    <PlusIcon className="w-7 h-7 text-rose-500" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2">Book Something</h2>
                  <p className="text-white/30 font-medium text-sm">Where would you like to go next?</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { label: 'Book a Stay', sub: 'Elite accommodation', icon: HomeIcon, color: 'hover:bg-rose-500', path: '/search?type=properties' },
                    { label: 'Book a Helper', sub: 'Pro assistant flow', icon: UserIcon, color: 'hover:bg-blue-600', path: '/search?type=helpers' },
                    { label: 'Add a Service', sub: 'Vetted tasks', icon: BriefcaseIcon, color: 'hover:bg-violet-600', path: '/search?type=services' },
                    { label: 'Find an Event', sub: 'Curated experiences', icon: TicketIcon, color: 'hover:bg-amber-500', path: '/search?type=events' },
                  ].map((item, i) => (
                    <button key={i} onClick={() => { navigate(item.path); setShowAddModal(false); }}
                      className={`group flex flex-col items-start gap-3 p-6 bg-white/5 border border-white/5 rounded-[1.75rem] text-left transition-all hover:border-transparent hover:scale-[1.02] hover:text-white ${item.color}`}>
                      <div className="w-11 h-11 bg-white/5 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-widest text-[10px]">{item.label}</p>
                        <p className="text-[10px] opacity-50 font-medium mt-0.5">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowAddModal(false)}
                  className="w-full py-4 text-[10px] font-black text-white/20 hover:text-white/40 uppercase tracking-[0.3em] transition-colors">
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Booking Details Popup Modal ── */}
      <AnimatePresence>
        {selectedBookingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBookingModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-[1001]"
            >
              {(() => {
                const booking = selectedBookingModal;
                const meta = getBookingMeta(booking);
                const status = STATUS_MAP[booking.status] || { label: booking.status, badge: 'bg-white/5 border-white/10 text-white/40' };
                const Icon = meta.icon;
                const targetItem = meta.item || {};

                const startDate = booking.startDate ? new Date(booking.startDate) : null;
                const endDate = booking.endDate ? new Date(booking.endDate) : null;
                const fmtDate = (d) => d ? d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
                const fmtTime = (d) => d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                const providerName = targetItem.userRef?.username || targetItem.hostName || targetItem.providerName || targetItem.name || 'Service Provider';
                const contactPhone = booking.phone || targetItem.phone || targetItem.contact || targetItem.userRef?.phone || '';
                
                let cleanedPhone = contactPhone.toString().replace(/\D/g, '');
                if (cleanedPhone.startsWith('0')) cleanedPhone = '27' + cleanedPhone.substring(1);

                const mapsUrl = (targetItem.address || targetItem.location) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetItem.address || targetItem.location)}` : null;

                return (
                  <div>
                    {/* Header Gradient Banner */}
                    <div className={`relative p-6 ${meta.color} text-white flex items-start justify-between`}>
                      <div className="flex items-center gap-3.5 pr-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-black/20 px-2.5 py-0.5 rounded-full border border-white/15">
                            {meta.label} Booking
                          </span>
                          <h2 className="text-xl font-black leading-tight mt-1 truncate max-w-[240px] sm:max-w-[300px]">
                            {targetItem.name || targetItem.eventName || 'Untitled Booking'}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedBookingModal(null)}
                        className="w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all shrink-0"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide text-gray-200">
                      {/* Status & Price Row */}
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/8 rounded-2xl">
                        <div>
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Booking Status</p>
                          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${status.badge} mt-1`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Price</p>
                          <p className="text-xl font-black text-white mt-0.5">R{Number(booking.totalPrice || booking.totalAmount || targetItem.regularPrice || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Date & Time Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1">
                          <div className="flex items-center gap-1.5 text-rose-400">
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Check-In / Date</span>
                          </div>
                          <p className="text-sm font-black text-white">{fmtDate(startDate)}</p>
                          {startDate && <p className="text-xs text-white/40 font-medium">{fmtTime(startDate)}</p>}
                        </div>

                        {endDate ? (
                          <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <ClockIcon className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Check-Out Date</span>
                            </div>
                            <p className="text-sm font-black text-white">{fmtDate(endDate)}</p>
                            <p className="text-xs text-white/40 font-medium">{fmtTime(endDate)}</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <ClockIcon className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Reference ID</span>
                            </div>
                            <p className="text-xs font-mono font-bold text-white/70 truncate">{booking._id}</p>
                          </div>
                        )}
                      </div>

                      {/* People Details (Booked By & Provider) */}
                      <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-3">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">People Details</span>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                              {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-[10px] text-white/40 font-bold uppercase">Booked By (Inquirer)</p>
                              <p className="text-xs font-black text-white">{currentUser?.username || 'Guest Inquirer'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
                              {providerName[0]?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <p className="text-[10px] text-white/40 font-bold uppercase">Host / Provider</p>
                              <p className="text-xs font-black text-white">{providerName}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {(targetItem.address || targetItem.location) && (
                        <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <MapPinIcon className="w-5 h-5 text-rose-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Location</p>
                              <p className="text-xs font-bold text-white truncate">{targetItem.address || targetItem.location}</p>
                            </div>
                          </div>
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 transition-all"
                            >
                              Map <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 space-y-2.5">
                        {cleanedPhone && (
                          <a
                            href={`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(`Hi ${providerName}, I'm inquiring about my booking for ${targetItem.name || 'the service'} on ${fmtDate(startDate)}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            <span>Contact Provider on WhatsApp</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setSelectedBookingModal(null);
                            navigate(`/${meta.label.toLowerCase()}/${targetItem._id}`);
                          }}
                          className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                          <span>View Full {meta.label} Details</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to remove this booking from your schedule?')) {
                              try {
                                const res = await fetch(`/api/bookings/update/${booking._id}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'cancelled', cancelledBy: 'user' })
                                });
                                if (res.ok) {
                                  setBookings(prev => prev.filter(b => b._id !== booking._id));
                                  setSelectedBookingModal(null);
                                }
                              } catch (err) {
                                console.error('Failed to cancel booking:', err);
                              }
                            }
                          }}
                          className="w-full py-2 text-[10px] font-black text-rose-400/60 hover:text-rose-400 uppercase tracking-widest transition-colors text-center"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
