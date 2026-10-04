import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Plus, MessageCircle, Send, CheckCircle, Clock, MapPin, Zap, X, Sparkles, Loader2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

export default function GigRadarSection({ currentUser, navigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [myOfferText, setMyOfferText] = useState('');
  const [offerSent, setOfferSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('roommate');
  const [newLocation, setNewLocation] = useState('Polokwane, South Africa');
  const [newBudget, setNewBudget] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Fetch real looking-for requests from the database
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/looking-for/get');
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching real radar tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'urgent') return t.urgency === 'immediate' || t.budget >= 300;
    if (filter === 'highpay') return Number(t.budget || t.price || 0) >= 400;
    return true;
  });

  const handleSendOffer = () => {
    if (!myOfferText.trim()) return;
    setOfferSent(true);
    setTimeout(() => {
      setOfferSent(false);
      setSelectedTask(null);
      setMyOfferText('');
    }, 2200);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentUser) {
      if (!currentUser && navigate) {
        navigate('/sign-in');
        return;
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authenticatedFetch('/api/looking-for/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          location: newLocation,
          budget: Number(newBudget) || 0,
          description: newDesc,
          userRef: currentUser._id,
        }),
      });

      if (res.ok) {
        setShowPostModal(false);
        setNewTitle('');
        setNewBudget('');
        setNewDesc('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to post task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="gig-radar-section" className="mb-14 w-full">
      {/* Header with Live Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
              Live Gig Radar • Real-Time Community Requests
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Neighborhood Micro-Gigs
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            Real live requests from neighbors and clients near you. Claim quick paid tasks or post what you need.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (!currentUser && navigate) {
                navigate('/sign-in');
              } else {
                setShowPostModal(true);
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Post a Request
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {[
          { id: 'all', label: `All Gigs (${tasks.length})` },
          { id: 'urgent', label: '🔥 Urgent Needs' },
          { id: 'highpay', label: '💰 High Budget' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
              filter === tab.id
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Syncing live neighborhood gigs...</span>
        </div>
      )}

      {/* Gig Feed Cards Grid */}
      {!loading && filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTasks.map((task) => {
            const userObj = typeof task.userRef === 'object' ? task.userRef : null;
            const username = userObj?.username || task.name || 'Neighbor';
            const avatar = userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
            const budget = task.budget || task.price || 200;
            const phone = userObj?.phone || '27712345678';

            return (
              <motion.div
                key={task._id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
                onClick={() => navigate ? navigate(`/micro-gigs`) : null}
              >
                <div>
                  {/* Card Top: Poster & Budget */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={avatar}
                        alt={username}
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {username}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{task.location || 'Polokwane'}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-[9px]">{task.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800 px-3 py-1 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                        Payout
                      </span>
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                        R{budget}
                      </span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Card Footer: Urgency & Actions */}
                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Live Request</span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${username}, I saw your live request on LoopOut: "${task.title}". I am available to help you right now!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-500 hover:text-white transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => setSelectedTask(task)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      Make Offer
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : !loading && (
        <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm font-bold text-gray-500">No open requests currently in this filter.</p>
          <button
            onClick={() => setShowPostModal(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Post First Request
          </button>
        </div>
      )}

      {/* Make Offer Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white relative"
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <Zap className="w-4 h-4 fill-emerald-500" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                  Instant Proposal
                </span>
              </div>

              <h3 className="text-lg font-black leading-snug">{selectedTask.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Offering <strong className="text-emerald-600 font-black">R{selectedTask.budget || selectedTask.price || 200}</strong> in {selectedTask.location || 'Polokwane'}
              </p>

              {offerSent ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 fill-emerald-500 text-white" />
                  </div>
                  <h4 className="text-lg font-black">Offer Sent!</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    The requester has been notified with your offer details.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                      Your Offer / Availability Note:
                    </label>
                    <textarea
                      rows={3}
                      value={myOfferText}
                      onChange={(e) => setMyOfferText(e.target.value)}
                      placeholder="e.g. I am available right now and can assist immediately..."
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="flex-1 py-3 rounded-2xl text-xs font-black uppercase border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendOffer}
                      className="flex-1 py-3 rounded-2xl text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Offer
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post a Task Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-teal-500/20 text-teal-500">
                  <Plus className="w-4 h-4 stroke-[3px]" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-teal-500">
                  Post Live Request
                </span>
              </div>

              <h3 className="text-xl font-black">Broadcast Your Need to Neighbors</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Helpers and verified pros will be able to see and respond to your request immediately.
              </p>

              <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                    What do you need?
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Need someone to help jumpstart car / emergency cleaner"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                      Your Area / Town:
                    </label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Bendor, Polokwane"
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                      Budget (ZAR):
                    </label>
                    <input
                      type="number"
                      min="50"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="e.g. 200"
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                    Details / Timing:
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide any specific timing or tool requirements..."
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 py-3 rounded-2xl text-xs font-black uppercase border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-2xl text-xs font-black uppercase bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Post Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
