import { useState, useEffect } from "react";
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
  ChevronRightIcon,
  XMarkIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { updateUserSuccess } from "../redux/user/userSlice";

export default function Planner() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("schedule");
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");

  // Fetch real bookings for the user
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/user/${currentUser._id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentUser]);

  // Handle adding a new task to persistence
  const handleAddTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTaskText.trim() || !currentUser) return;

    try {
      const updatedTasks = [
        ...(currentUser.plannerTasks || []),
        { task: newTaskText, completed: false, createdAt: new Date() }
      ];

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerTasks: updatedTasks }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserSuccess(data));
        setNewTaskText("");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  // Handle toggling task completion
  const handleToggleTask = async (taskIndex) => {
    if (!currentUser) return;
    try {
      const updatedTasks = currentUser.plannerTasks.map((t, i) => 
        i === taskIndex ? { ...t, completed: !t.completed } : t
      );

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerTasks: updatedTasks }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserSuccess(data));
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskIndex) => {
    if (!currentUser) return;
    try {
      const updatedTasks = currentUser.plannerTasks.filter((_, i) => i !== taskIndex);

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerTasks: updatedTasks }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserSuccess(data));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': case 'declined': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getItemIcon = (booking) => {
    if (booking.listing) return <HomeIcon className="w-5 h-5" />;
    if (booking.helper) return <BriefcaseIcon className="w-5 h-5" />;
    if (booking.service) return <BriefcaseIcon className="w-5 h-5" />;
    return <CalendarIcon className="w-5 h-5" />;
  };

  const getItemColorClass = (booking) => {
    if (booking.listing) return 'bg-rose-500';
    if (booking.helper) return 'bg-blue-600';
    if (booking.service) return 'bg-indigo-500';
    return 'bg-gray-500';
  };

  const getBookingTypeLabel = (booking) => {
    if (booking.listing) return 'Stay';
    if (booking.helper) return 'Helper';
    if (booking.service) return 'Service';
    return 'Plan';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8">
          <CalendarIcon className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">Elite Planner</h1>
        <p className="text-gray-500 max-w-sm mb-10 font-medium leading-relaxed">Sign in to your account to manage your surgical schedule, track tasks, and optimize your journey.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/sign-in')}
            className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-4 border-2 border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
          >
            Go Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Today's Plan</h1>
            <p className="text-gray-500 mt-2">Manage your bookings and schedule simply.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <PlusIcon className="w-6 h-6 stroke-[3px]" />
          </button>
        </header>

        {/* Simple Navigation */}
        <div className="flex gap-4 mb-10 bg-gray-50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("schedule")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "schedule" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab("tasks")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "tasks" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Tasks
          </button>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {activeTab === "schedule" ? (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-3xl" />
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => {
                  const item = booking.listing || booking.helper || booking.service;
                  if (!item) return null;
                  
                  return (
                    <div key={booking._id} className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center gap-5 hover:shadow-md transition-shadow group">
                      <div className={`w-12 h-12 ${getItemColorClass(booking)} text-white rounded-2xl flex items-center justify-center`}>
                        {getItemIcon(booking)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getBookingTypeLabel(booking)}</p>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-black transition-colors">{item.name || 'Untitled Booking'}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="w-3 h-3 text-gray-400" />
                          <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{item.address || item.location || 'Location TBD'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CalendarIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-950 font-bold text-lg">No active bookings</p>
                  <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">Explore and book stays or services to see them here.</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="mt-8 px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
                  >
                    Start Booking
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
               <div className="mb-8">
                  <form onSubmit={handleAddTask} className="relative">
                    <input 
                      type="text" 
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add a new task..."
                      className="w-full bg-gray-50 border-none rounded-2xl py-6 px-8 pr-16 text-sm font-bold outline-none focus:ring-4 focus:ring-black/5 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newTaskText.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                  </form>
               </div>

               <div className="space-y-3">
                 {currentUser?.plannerTasks?.length > 0 ? (
                   [...currentUser.plannerTasks].reverse().map((task, idx) => {
                     // We need the original index for toggling because we reversed for UI
                     const originalIndex = currentUser.plannerTasks.length - 1 - idx;
                     
                     return (
                       <div key={idx} className="group flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-gray-300 transition-all cursor-pointer">
                          <div 
                            onClick={() => handleToggleTask(originalIndex)}
                            className="flex items-center gap-5 flex-1"
                          >
                             <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.3)]' : 'border-gray-200'}`}>
                                {task.completed && <CheckCircleIcon className="w-5 h-5 text-white" />}
                             </div>
                             <span className={`text-base font-bold transition-all ${task.completed ? 'text-gray-300 line-through' : 'text-gray-900'}`}>{task.task}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteTask(originalIndex)}
                            className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                       </div>
                     );
                   })
                 ) : (
                   <div className="text-center py-20 opacity-40">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-bold text-gray-500 italic">Your to-do list is empty</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Modal for Adding Items (Contextual Routing) */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[1000]" 
              />
              <motion.div 
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                exit={{ y: "100%" }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[4rem] z-[1001] p-12 shadow-2xl"
              >
                <div className="max-w-md mx-auto text-center">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <PlusIcon className="w-8 h-8 text-black" />
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter mb-4 italic uppercase">Bookings hub</h2>
                   <p className="text-gray-500 font-medium mb-10 leading-relaxed">Where would you like to begin your next surgical trip?</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                      <button 
                        onClick={() => { navigate('/search?type=properties'); setShowAddModal(false); }}
                        className="flex items-center gap-5 p-6 bg-gray-50 rounded-3xl hover:bg-rose-500 hover:text-white transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-white group-hover:bg-white/20 text-rose-500 group-hover:text-white rounded-2xl flex items-center justify-center shadow-sm"><HomeIcon className="w-6 h-6" /></div>
                        <div>
                          <p className="font-black uppercase tracking-widest text-[11px]">Book a Stay</p>
                          <p className="text-xs opacity-60">Elite accommodation</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => { navigate('/search?type=helpers'); setShowAddModal(false); }}
                        className="flex items-center gap-5 p-6 bg-gray-50 rounded-3xl hover:bg-blue-600 hover:text-white transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-white group-hover:bg-white/20 text-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center shadow-sm"><BriefcaseIcon className="w-6 h-6" /></div>
                        <div>
                          <p className="font-black uppercase tracking-widest text-[11px]">Book a Helper</p>
                          <p className="text-xs opacity-60">Pro assistant flow</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => { navigate('/search?type=services'); setShowAddModal(false); }}
                        className="flex items-center gap-5 p-6 bg-gray-50 rounded-3xl hover:bg-indigo-500 hover:text-white transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-white group-hover:bg-white/20 text-indigo-500 group-hover:text-white rounded-2xl flex items-center justify-center shadow-sm"><BriefcaseIcon className="w-6 h-6" /></div>
                        <div>
                          <p className="font-black uppercase tracking-widest text-[11px]">Add a Service</p>
                          <p className="text-xs opacity-60">Vetted tasks</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => { navigate('/search?type=events'); setShowAddModal(false); }}
                        className="flex items-center gap-5 p-6 bg-gray-50 rounded-3xl hover:bg-amber-500 hover:text-white transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-white group-hover:bg-white/20 text-amber-500 group-hover:text-white rounded-2xl flex items-center justify-center shadow-sm"><TicketIcon className="w-6 h-6" /></div>
                        <div>
                          <p className="font-black uppercase tracking-widest text-[11px]">Find an Event</p>
                          <p className="text-xs opacity-60">Curated experiences</p>
                        </div>
                      </button>
                   </div>
                   
                   <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-sm font-bold text-gray-400 hover:text-black transition-colors"
                   >
                     Dismiss
                   </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
