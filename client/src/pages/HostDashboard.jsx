import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CpuChipIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CalendarIcon,
  Squares2X2Icon,
  TicketIcon,
  CheckBadgeIcon,
  UserIcon,
  ClockIcon,
  MapPinIcon,
  BellIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  SignalIcon,
  HomeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { FaRobot, FaWhatsapp } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import FooterDock from '../components/FooterDock';
import BrandLogo from '../components/BrandLogo';

// Sub-components moved to top level for stability
const BookingProtocolCard = ({ booking, idx, handleUpdateStatusGlobal }) => {
  const navigate = useNavigate();
  
  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await fetch(`/api/bookings/status/${booking._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        handleUpdateStatusGlobal();
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      
      <div className="p-10 flex flex-col lg:flex-row lg:items-center gap-12">
        {/* Profile Signal */}
        <div className="lg:w-1/4">
           <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                 <div className="w-20 h-20 rounded-full bg-gray-900 border-2 border-white/10 p-1 group-hover:border-rose-500 transition-colors duration-500">
                    <img src={booking.user?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="User" className="w-full h-full rounded-full object-cover" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full border-4 border-[#020617] flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-200">
                    <CheckBadgeIcon className="w-3.5 h-3.5 text-white" />
                 </div>
              </div>
              <div className="min-w-0">
                 <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Neural Verified
                 </div>
                 <h4 className="text-xl font-black text-white leading-tight truncate">{booking.user?.username || 'GUEST-01'}</h4>
                 <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-black text-white/40 uppercase tracking-tighter">Score: 99.5</div>
                    <FaWhatsapp className="text-emerald-400 w-3 h-3 cursor-pointer hover:scale-125 transition-transform" />
                 </div>
              </div>
           </div>
        </div>

        {/* Operational Context */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
           <div>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Subject Node</p>
               <h5 className="text-xs font-black text-white uppercase tracking-tight truncate">{booking.listing?.name || booking.helper?.name || 'Manual Deploy'}</h5>
               <p className="text-[8px] font-bold text-rose-500/60 uppercase mt-1">Sector: {booking.type?.toUpperCase() || 'GENERAL'}</p>
               {booking.selectedPerformer && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const id = booking.listing?._id || booking.helper?._id || booking.service?._id;
                      const type = booking.listing ? 'listing' : (booking.helper ? 'helper' : 'service');
                      navigate(`/${type}/${id}`);
                    }}
                    className="mt-3 pt-3 border-t border-white/5 cursor-pointer hover:bg-white/5 rounded-xl transition-all active:scale-95 group/perf"
                  >
                     <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 group-hover/perf:text-rose-500 transition-colors">Assigned Performer</p>
                     <div className="flex items-center gap-3">
                        {booking.performerImage && (
                           <img src={booking.performerImage} alt={booking.selectedPerformer} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        )}
                        <div className="min-w-0">
                           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">{booking.selectedPerformer}</p>
                           {booking.performerExperience && (
                              <p className="text-[7px] font-bold text-white/40 uppercase mt-0.5">{booking.performerExperience} Exp</p>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>
           <div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Schedule Window</p>
              <div className="flex items-center gap-2">
                 <ClockIcon className="w-3.5 h-3.5 text-rose-500" />
                 <span className="text-xs font-black text-white">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[8px] text-white/40 font-bold uppercase mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
           </div>
           <div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Neural Value</p>
              <div className="text-xl font-black italic tracking-tighter text-white">R{(Number(booking.totalAmount) || Number(booking.totalPrice) || 0).toLocaleString()}</div>
           </div>
        </div>

        {/* Action Protocol */}
        <div className="lg:w-1/4 flex flex-col gap-3">
           {booking.status === 'pending' ? (
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => handleStatusUpdate('confirmed')} className="py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">Authorize</button>
                 <button onClick={() => handleStatusUpdate('declined')} className="py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Deny</button>
              </div>
           ) : booking.status === 'confirmed' || booking.status === 'approved' ? (
              <button 
                onClick={() => handleStatusUpdate('completed')}
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_15px_30px_rgba(225,29,72,0.2)] flex items-center justify-center gap-2 group-hover:animate-pulse"
              >
                 <SignalIcon className="w-4 h-4" />
                 Signal Completed
              </button>
           ) : (
              <div className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">{booking.status.toUpperCase()}</span>
              </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

const NeuralAnalytics = ({ bookings }) => {
  const totalRev = bookings.reduce((sum, b) => (b.status === 'completed' || b.status === 'confirmed') ? sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0) : sum, 0);
  const pendingRev = bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0), 0);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="bg-white/5 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-8">Yield Intensity</h4>
          <div className="text-7xl font-black italic tracking-tighter mb-4">R{totalRev.toLocaleString()}</div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Aggregate platform-wide inflow</p>
          
          <div className="mt-12 flex items-center gap-4">
             <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-[10px] font-black italic">+24.5%</div>
             <p className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">Neural growth compared to previous quadrant</p>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] group hover:bg-white/10 transition-colors">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6">Neural Holding</p>
             <h5 className="text-3xl font-black italic text-amber-500">R{pendingRev.toLocaleString()}</h5>
             <p className="text-[7px] font-bold text-white/40 uppercase mt-4">Pending signals awaiting logic verification</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] group hover:bg-white/10 transition-colors">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6">Network Health</p>
             <h5 className="text-3xl font-black italic text-blue-400">99.8%</h5>
             <p className="text-[7px] font-bold text-white/40 uppercase mt-4">System integrity and signal response rate</p>
          </div>
       </div>
    </div>
  )
};

const TacticalCalendar = ({ bookings }) => {
  const [value, onChange] = useState(new Date());
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const hasBooking = bookings.some(b => b.createdAt.startsWith(dateStr));
      if (hasBooking) return 'bg-rose-500 rounded-full text-white font-black';
    }
    return '';
  };

  return (
    <div className="bg-white/5 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden">
        <style>{`
          .react-calendar {
            background: transparent !important;
            border: none !important;
            font-family: inherit !important;
            width: 100% !important;
          }
          .react-calendar__navigation button {
            color: white !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            font-size: 14px !important;
          }
          .react-calendar__month-view__weekdays__weekday {
            color: rgba(255,255,255,0.3) !important;
            font-size: 10px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
          }
          .react-calendar__tile {
            color: white !important;
            padding: 1.5em 0.5em !important;
            font-weight: 700 !important;
          }
          .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
            background-color: rgba(255,255,255,0.05) !important;
            border-radius: 1rem !important;
          }
          .react-calendar__tile--now {
            background: rgba(255,255,255,0.1) !important;
            border-radius: 1rem !important;
          }
          .react-calendar__tile--active {
            background: #e11d48 !important;
            border-radius: 1rem !important;
            color: white !important;
          }
        `}</style>
        <h3 className="text-2xl font-black italic tracking-tighter mb-8 uppercase">Neural Deployment <span className="text-rose-500">Timeline</span></h3>
        <Calendar 
          onChange={onChange} 
          value={value} 
          tileClassName={tileClassName}
          className="mx-auto"
        />
        <div className="mt-12 w-full grid grid-cols-1 gap-4">
           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Selected Date Operations</p>
           {/* Placeholder for daily logs */}
           <div className="p-8 border border-white/5 rounded-3xl bg-white/2 text-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">No deployments found for this neural window</p>
           </div>
        </div>
    </div>
  );
};

const LoaderIcon = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full"
  />
);

// Removed local FooterDock definition

export default function HostDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operations');
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchHostData = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/host/${currentUser._id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching host data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    fetchHostData();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchHostData();
    }, 60000); 
    return () => clearInterval(interval);
  }, [currentUser]);

  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'completed' || b.status === 'confirmed') ? sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0) : sum, 0);
  const totalHelperBookings = bookings.filter(b => b.helper).length;

  const stats = [
    { label: 'Active Revenue', value: `R${totalRevenue.toLocaleString()}`, sub: 'Total Earned', icon: BanknotesIcon, color: 'text-emerald-400', route: '/host-earnings' },
    { label: 'Service Ops', value: totalHelperBookings, sub: 'Helper Bookings', icon: ShieldCheckIcon, color: 'text-blue-400' },
    { label: 'Deployments', value: bookings.length, sub: 'All Signals', icon: CpuChipIcon, color: 'text-rose-400' },
    { label: 'Operator Rank', value: '#1', sub: 'Regional Hub', icon: ArrowTrendingUpIcon, color: 'text-amber-400' },
  ];

  const [showSettings, setShowSettings] = useState(false);
  const [protocolState, setProtocolState] = useState({
     audio: true,
     thermal: true,
     frequency: 85
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-rose-500/30 overflow-x-hidden relative">
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={() => setShowSettings(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white/5 border border-white/10 rounded-[3.5rem] p-12 overflow-hidden shadow-2xl"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] pointer-events-none" />
               <div className="relative z-10 space-y-12">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Protocol <span className="text-rose-500">Settings</span></h2>
                        <p className="text-[10px] font-bold text-white/20 tracking-[0.4em] uppercase">Operational Adjustments</p>
                     </div>
                     <button onClick={() => setShowSettings(false)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                        <XMarkIcon className="w-5 h-5 text-white/40" />
                     </button>
                  </div>

                  <div className="space-y-8">
                     <div className="flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-rose-500/10 rounded-xl">
                              <SignalIcon className="w-6 h-6 text-rose-500" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Neural Audio Signals</p>
                              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Acoustic Status Feedback</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => setProtocolState(p => ({...p, audio: !p.audio}))}
                           className={`w-14 h-8 rounded-full p-1 transition-all ${protocolState.audio ? 'bg-rose-500' : 'bg-white/10'}`}
                        >
                           <div className={`w-6 h-6 bg-white rounded-full transition-transform ${protocolState.audio ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-blue-500/10 rounded-xl">
                              <Squares2X2Icon className="w-6 h-6 text-blue-500" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Thermal Atmospheric Depth</p>
                              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Dynamically Animated Brushes</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => setProtocolState(p => ({...p, thermal: !p.thermal}))}
                           className={`w-14 h-8 rounded-full p-1 transition-all ${protocolState.thermal ? 'bg-blue-500' : 'bg-white/10'}`}
                        >
                           <div className={`w-6 h-6 bg-white rounded-full transition-transform ${protocolState.thermal ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                     </div>

                     <div className="p-6 bg-white/2 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Signal Frequency Level</p>
                              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Core Neural Response Sensitivity</p>
                           </div>
                           <span className="text-xl font-black italic text-rose-500">{protocolState.frequency}%</span>
                        </div>
                        <input 
                           type="range" min="0" max="100" 
                           value={protocolState.frequency}
                           onChange={(e) => setProtocolState(p => ({...p, frequency: e.target.value}))}
                           className="w-full accent-rose-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer" 
                        />
                     </div>
                  </div>

                  <button 
                     onClick={() => setShowSettings(false)}
                     className="w-full py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all active:scale-95"
                  >
                     Commit Parameters
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {protocolState.thermal && (
          <>
            <motion.div 
               animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" 
            />
            <motion.div 
               animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" 
            />
          </>
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        <header className="sticky top-0 z-[100] -mx-6 px-6 py-5 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 mb-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <BrandLogo showText={true} textColor="text-white" className="h-10 w-auto" />
             <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
             <div className="hidden sm:block">
                <h1 className="text-[10px] font-black tracking-[0.4em] text-rose-500 uppercase italic">
                   Command <span className="text-white/30">Hub</span>
                </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-2xl transition-all cursor-pointer group">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-white group-hover:text-rose-500 transition-colors uppercase tracking-widest">{currentUser?.username}</p>
                   <p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Elite Operator</p>
                </div>
                <div className="relative">
                   <img src={currentUser?.avatar} alt="Operator" className="w-9 h-9 rounded-xl object-cover border border-white/10 group-hover:border-rose-500 transition-colors" />
                   <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-lg flex items-center justify-center border-2 border-[#020617]">
                      <CheckIcon className="w-2 h-2 text-white stroke-[4px]" />
                   </div>
                </div>
             </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => stat.route && navigate(stat.route)}
              className={`group relative h-40 ${stat.route ? 'cursor-pointer' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] border border-white/10 transition-all group-hover:border-white/20 group-hover:bg-white/10 group-hover:scale-[1.02] duration-500" />
              <div className="relative h-full p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.label}</p>
                   <stat.icon className={`w-6 h-6 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter">{stat.value}</h3>
                   <span className={`text-[10px] font-black ${stat.color} uppercase tracking-widest`}>{stat.sub}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="flex items-center gap-4 mb-12 overflow-x-auto scrollbar-hide pb-4">
          {[
            { id: 'operations', label: 'Tactical Operations', icon: Squares2X2Icon },
            { id: 'calendar', label: 'Tactical Calendar', icon: CalendarIcon },
            { id: 'analytics', label: 'Neural Analytics', icon: ArrowTrendingUpIcon },
            { id: 'trust', label: 'Trust Protocols', icon: ShieldCheckIcon },
            { id: 'wallet', label: 'Financial Grid', icon: BanknotesIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${activeTab === tab.id ? 'bg-white text-gray-950 border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
             {activeTab === 'operations' && (
               <motion.div
                 key="ops"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-8"
               >
                  <div className="flex flex-wrap items-center justify-between gap-6">
                     <h2 className="text-3xl font-black italic tracking-tighter">ACTIVE <span className="text-rose-500">DEPLOYS</span></h2>
                     <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        {['all', 'pending', 'confirmed', 'completed'].map(f => (
                          <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-white/40 hover:text-white'}`}
                          >
                            {f}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     {loading ? (
                       <div className="h-64 flex flex-col items-center justify-center gap-4 border border-white/5 rounded-[3rem] bg-white/2">
                          <LoaderIcon />
                          <span className="text-[12px] font-black text-rose-500 uppercase tracking-[0.5em] animate-pulse">Looping Out...</span>
                       </div>
                     ) : bookings.filter(b => filter === 'all' || b.status === filter).length === 0 ? (
                       <div className="h-64 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 group">
                          <div className="p-6 bg-white/5 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500">
                             <TicketIcon className="w-12 h-12 text-white/10 group-hover:text-rose-500 transition-colors" />
                          </div>
                          <div className="text-center italic">
                             <p className="text-xl font-black text-white/60">No active signals detected</p>
                             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Adjust neural filter parameters</p>
                          </div>
                       </div>
                     ) : (
                       bookings.filter(b => filter === 'all' || b.status === filter).map((booking, idx) => (
                         <BookingProtocolCard key={booking._id} booking={booking} idx={idx} handleUpdateStatusGlobal={fetchHostData} />
                       ))
                     )}
                  </div>
               </motion.div>
             )}

             {activeTab === 'calendar' && (
               <motion.div
                 key="cal"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
               >
                 <TacticalCalendar bookings={bookings} />
               </motion.div>
             )}

             {activeTab === 'analytics' && (
               <motion.div
                 key="ana"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
               >
                 <NeuralAnalytics bookings={bookings} />
               </motion.div>
             )}
             
             {(activeTab === 'trust' || activeTab === 'wallet') && (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-64 flex flex-col items-center justify-center border border-white/5 rounded-[3.5rem] bg-white/2"
                >
                   <ShieldCheckIcon className="w-12 h-12 text-white/10 mb-4" />
                   <p className="text-sm font-bold text-white/20 italic">Protocol sequence initiated. Financial grid access encrypted.</p>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>

      <FooterDock unreadCount={unreadCount} />
    </div>
  );
}
