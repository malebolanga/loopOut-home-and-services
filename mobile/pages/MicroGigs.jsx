import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Plus, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Zap, 
  X, 
  Sparkles, 
  Loader2, 
  Search, 
  Filter, 
  DollarSign, 
  Share2, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  User,
  AlertCircle,
  Timer
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All Micro-Gigs', emoji: '🌐' },
  { id: 'urgent', label: 'Urgent Gigs', emoji: '⚡', isFilter: true },
  { id: 'highpay', label: 'High Pay (R400+)', emoji: '💎', isFilter: true },
  { id: 'roommate', label: 'Room & Sharing', emoji: '🏠' },
  { id: 'room', label: 'Rooms Needed', emoji: '🚪' },
  { id: 'nanny', label: 'Helpers & Nannies', emoji: '🧹' },
  { id: 'errand', label: 'Errands & Tasks', emoji: '📦' },
  { id: 'dog', label: 'Pets & Sitting', emoji: '🐾' },
];

export default function MicroGigs() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Make an Offer modal state
  const [myOfferText, setMyOfferText] = useState('');
  const [myOfferAmount, setMyOfferAmount] = useState('');
  const [offerSent, setOfferSent] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);

  // New Post Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('roommate');
  const [newLocation, setNewLocation] = useState('Polokwane, South Africa');
  const [newBudget, setNewBudget] = useState('');
  const [newUrgency, setNewUrgency] = useState('flexible');
  const [newDesc, setNewDesc] = useState('');
  const [newContact, setNewContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 24-hour remaining time helper
  const getRemainingTime = (createdAt) => {
    if (!createdAt) return '24h Broadcast';
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsed = now - created;
    const remainingMs = 24 * 60 * 60 * 1000 - elapsed;
    if (remainingMs <= 0) return 'Expiring soon';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  // Fetch real looking-for tasks from database (only active within last 24h)
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/looking-for/get');
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching micro-gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    return tasks.filter((t) => {
      // 24-Hour Expiration filter on client
      if (t.createdAt) {
        const created = new Date(t.createdAt).getTime();
        if (created < twentyFourHoursAgo) return false;
      }

      // Category / Filter chip match
      if (selectedCategory === 'urgent') {
        const isUrgent = t.urgency === 'immediate' || t.urgency === 'urgent' || Number(t.budget || t.price || 0) >= 350;
        if (!isUrgent) return false;
      } else if (selectedCategory === 'highpay') {
        const budget = Number(t.budget || t.price || 0);
        if (budget < 400) return false;
      } else if (selectedCategory !== 'all') {
        if (t.category !== selectedCategory) return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (t.title || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const loc = (t.location || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !loc.includes(q) && !cat.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedCategory, searchQuery]);

  const handleSendOffer = async () => {
    if (!myOfferText.trim()) return;
    setSendingOffer(true);
    setTimeout(() => {
      setSendingOffer(false);
      setOfferSent(true);
      setTimeout(() => {
        setOfferSent(false);
        setSelectedTask(null);
        setMyOfferText('');
        setMyOfferAmount('');
      }, 1800);
    }, 600);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newTitle.trim()) return;

    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authenticatedFetch('/api/looking-for/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          location: newLocation.trim(),
          budget: Number(newBudget) || 0,
          description: newDesc.trim(),
          urgency: newUrgency,
          contact: newContact.trim() || currentUser?.phone || currentUser?.email || 'In-app message',
          contactPhone: newContact.trim() || '',
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPostSuccess(true);
        setTimeout(() => {
          setPostSuccess(false);
          setShowPostModal(false);
          setNewTitle('');
          setNewBudget('');
          setNewDesc('');
          setNewContact('');
          fetchTasks();
        }, 1500);
      } else {
        setErrorMessage(data?.message || 'Failed to broadcast task. Please verify your details.');
      }
    } catch (err) {
      console.error('Failed to post micro-gig:', err);
      setErrorMessage(err.message || 'Network error occurred while posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 pb-32">
      <Helmet>
        <title>Neighborhood Micro-Gigs | loopOut</title>
        <meta 
          name="description" 
          content="Explore and claim live 24-hour micro-gigs, short tasks, and neighborhood requests near you on loopOut." 
        />
      </Helmet>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border-b border-emerald-900/30 relative overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back Home
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                Live 24h Radar
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Neighborhood <span className="text-emerald-400">Micro-Gigs</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed">
                Connect with neighbors for urgent tasks, quick paid gigs, and community assistance. Every post is active for <strong>24 hours</strong> to ensure freshness.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (!currentUser) {
                    navigate('/sign-in');
                  } else {
                    setErrorMessage('');
                    setShowPostModal(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Broadcast Micro-Gig / Need
              </motion.button>
            </div>
          </div>

          {/* Search Bar in Banner */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs by keyword, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-2 mb-6 snap-x">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedCategory(chip.id)}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md ring-2 ring-slate-950 dark:ring-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Status Counter Bar */}
        <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {filteredTasks.length} Active 24h Gigs Found
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-amber-500" />
            Each post active for 24 hours
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-1" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">No Active Micro-Gigs Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Gigs disappear automatically after 24 hours to stay fresh. Be the first to broadcast what you need in your neighborhood!
            </p>
            <button
              onClick={() => {
                if (!currentUser) navigate('/sign-in');
                else setShowPostModal(true);
              }}
              className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Broadcast a Micro-Gig
            </button>
          </div>
        ) : (
          /* Gigs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => {
              const userObj = typeof task.userRef === 'object' ? task.userRef : null;
              const username = userObj?.username || task.name || 'Neighbor';
              const avatar = userObj?.avatar || '/default-avatar.png';
              const isUrgent = task.urgency === 'immediate' || task.urgency === 'urgent';
              const budgetVal = Number(task.budget || task.price || 0);
              const remainingText = getRemainingTime(task.createdAt);

              return (
                <motion.div
                  key={task._id || task.id}
                  whileHover={{ y: -3 }}
                  className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: User + 24h Remaining Timer Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={avatar}
                          alt={username}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 shrink-0"
                          onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username); }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {username}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-400 block truncate">
                            {task.location || 'Local Neighbor'}
                          </span>
                        </div>
                      </div>

                      {/* 24h Countdown Badge */}
                      <div className="flex items-center gap-1">
                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-black border border-rose-500/20 shrink-0">
                            <Flame className="w-2.5 h-2.5 fill-rose-500" /> Urgent
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black border border-amber-500/20 shrink-0">
                          <Clock className="w-2.5 h-2.5" /> {remainingText}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                        {task.category || 'General Task'}
                      </span>
                      {task.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span className="truncate max-w-[140px]">{task.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer: Budget + Action */}
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-black text-gray-400">
                        Budget Offer
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {budgetVal > 0 ? `R${budgetVal}` : 'Negotiable'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.contactPhone && (
                        <a
                          href={`https://wa.me/${task.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${username}, I saw your 24h gig "${task.title}" on loopOut and want to help!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors"
                          title="WhatsApp poster"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-600 dark:hover:bg-emerald-400 font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Make Offer
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE MICRO-GIG / NEED MODAL ── */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    Broadcast Micro-Gig (24h)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Broadcasts to neighbors nearby and automatically closes after 24 hours
                  </p>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {postSuccess ? (
                <div className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce mb-3" />
                  <h4 className="text-xl font-black text-gray-900 dark:text-white">Gig Broadcasted!</h4>
                  <p className="text-xs text-gray-500 mt-1">Neighbors in your area are being notified. Post will run for 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Need helper for garden cleanup / Roommate wanted"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="roommate">Roommate / Sharing</option>
                        <option value="room">Room Needed</option>
                        <option value="nanny">Helper / Nanny</option>
                        <option value="errand">Errands & Delivery</option>
                        <option value="dog">Pet Sitting</option>
                        <option value="freelance">Freelance / Tech</option>
                        <option value="other">Other Task</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Budget (ZAR)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 350"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Location / Suburb *
                      </label>
                      <input
                        type="text"
                        required
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g. Polokwane, Limpopo"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Urgency
                      </label>
                      <select
                        value={newUrgency}
                        onChange={(e) => setNewUrgency(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="flexible">Flexible</option>
                        <option value="today">Needed Today</option>
                        <option value="immediate">Immediate / Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      WhatsApp Contact (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +27821234567"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Description & Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe what you need, specific requirements, or timing..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Publishing 24h Gig...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Broadcast Live 24h Gig
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MAKE OFFER / DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Send Offer to Neighbor
                </span>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-black text-gray-900 dark:text-white">
                  {selectedTask.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Budget: <span className="font-bold text-emerald-600">R{selectedTask.budget || selectedTask.price || 0}</span> • Location: {selectedTask.location}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-500">
                  {getRemainingTime(selectedTask.createdAt)}
                </span>
              </div>

              {offerSent ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce mb-2" />
                  <p className="text-sm font-black text-gray-900 dark:text-white">Offer Dispatched!</p>
                  <p className="text-xs text-gray-500 mt-1">The poster has been notified of your proposal.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Your Proposed Rate (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder={`Default: R${selectedTask.budget || selectedTask.price || 0}`}
                      value={myOfferAmount}
                      onChange={(e) => setMyOfferAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Your Message / Availability *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Hi! I am available to help with this right away..."
                      value={myOfferText}
                      onChange={(e) => setMyOfferText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSendOffer}
                    disabled={sendingOffer || !myOfferText.trim()}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sendingOffer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Offer
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
