import { useState, useEffect, useCallback } from "react";
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
  XMarkIcon,
  MapPinIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  UserIcon,
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

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/user/${currentUser._id}`, { credentials: 'include' });
        const data = await res.json();
        if (Array.isArray(data)) setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentUser]);

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
            <p className="text-gray-500 text-[11px] font-medium mt-1">
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

        {/* ── Tab Bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-1.5 mb-8 bg-white/3 border border-white/5 p-1 rounded-2xl w-fit">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? tab.special ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-[0_6px_16px_rgba(225,29,72,0.35)]'
                                : 'bg-white text-gray-950 shadow-md'
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

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
              className="space-y-4">
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
                      onClick={() => navigate(`/${meta.label.toLowerCase()}/${meta.item._id}`)}
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
    </div>
  );
}
