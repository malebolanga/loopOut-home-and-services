import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  BellIcon,
  MapPinIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  SparklesIcon,
  TicketIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  Squares2X2Icon,
  CameraIcon,
  CpuChipIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';
import { FaWhatsapp, FaRobot } from 'react-icons/fa';
import { BrandIcon } from '../components/BrandLogo';

export default function HostDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operations'); // 'operations', 'analytics', 'trust', 'wallet'
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHostData = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/host/${currentUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        console.error('Neural connection error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHostData();
  }, [currentUser]);

  const stats = [
    { label: 'Active Revenue', value: 'R42,850', sub: '+12.5%', icon: BanknotesIcon, color: 'text-emerald-400' },
    { label: 'Neural Trust', value: '99.8%', sub: 'Elite Status', icon: ShieldCheckIcon, color: 'text-blue-400' },
    { label: 'Deployments', value: bookings.length, sub: 'Active Signals', icon: CpuChipIcon, color: 'text-rose-400' },
    { label: 'Operator Rank', value: '#12', sub: 'Regional Hub', icon: ArrowTrendingUpIcon, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-rose-500/30 overflow-x-hidden relative">
      {/* Cinematic Background */}
      <div className=" inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        {/* Sleek Professional Sticky Header */}
        <header className="sticky top-0 z-[100] -mx-6 px-6 py-5 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <CpuChipIcon className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-lg md:text-xl font-black tracking-widest italic text-white uppercase translate-y-0.5">
                   HOST <span className="text-white/30">DASHBOARD</span>
                </h1>
                <div className="flex items-center gap-1.5 overflow-hidden">
                   <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                   <span className="text-[7px] font-black text-rose-500/60 uppercase tracking-[0.3em] whitespace-nowrap">Neural Command Active</span>
                </div>
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

        {/* Tactical Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] border border-white/10 transition-all group-hover:border-white/20 group-hover:scale-[1.02] duration-500" />
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

        {/* Command Tabs */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto scrollbar-hide pb-4">
          {[
            { id: 'operations', label: 'Tactical Operations', icon: Squares2X2Icon },
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

        {/* Content Area */}
        <div className="space-y-12">
           {activeTab === 'operations' && (
             <div className="space-y-8">
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
                       <BookingProtocolCard key={booking._id} booking={booking} idx={idx} />
                     ))
                   )}
                </div>
             </div>
           )}

           {activeTab === 'analytics' && <NeuralAnalytics stats={stats} />}
           {activeTab === 'trust' && <TrustProtocols />}
           {activeTab === 'wallet' && <FinancialGrid />}
        </div>
      </div>

      <FooterDock />
    </div>
  );
}

const BookingProtocolCard = ({ booking, idx }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
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

        {/* Operation Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-white/50" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5 whitespace-nowrap">Extraction Date</p>
                    <p className="text-sm font-bold text-white/90">{new Date(booking.startDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-white/50" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5 whitespace-nowrap">Operation Zone</p>
                    <p className="text-sm font-bold text-white/90 truncate max-w-[200px]">{booking.listing?.name || booking.helper?.name || 'Secure Facility'}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white/2 rounded-3xl p-6 border border-white/5 relative group/msg">
              <div className="flex items-center justify-between mb-3">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Protocol Intel</p>
                 <FaRobot className="w-3 h-3 text-rose-500 opacity-30 group-hover/msg:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] font-bold text-white/60 leading-relaxed italic line-clamp-2">
                 "{booking.message || 'Standard deployment requested. No special intel provided.'}"
              </p>
              <div className="absolute -bottom-2 -left-2 px-3 py-1 bg-gray-950 border border-white/5 rounded-full text-[8px] font-black text-white/30 uppercase tracking-[0.2em] opacity-0 group-hover/msg:opacity-100 transition-all translate-y-2 group-hover/msg:translate-y-0">
                 Read Full Log
              </div>
           </div>
        </div>

        {/* Protocol Control */}
        <div className="lg:w-1/5 flex flex-col gap-4">
           <div className="text-center mb-4">
              <p className="text-2xl font-black italic tracking-tighter text-white">R{Number(booking.totalPrice).toLocaleString()}</p>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-50">Operational Value</span>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              <button className="py-4 bg-emerald-500 text-gray-950 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-lg active:scale-95">
                 Authorize
              </button>
              <button className="py-4 bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-95">
                 Deny
              </button>
           </div>
           
           <button className="w-full py-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10">
              <FaWhatsapp size={14} />
              Open Signal
           </button>
        </div>
      </div>
      
      {/* Bottom Interface Bar */}
      <div className="px-10 py-3 bg-white/2 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <ProtocolBadge status={booking.status} />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">SIG: #{booking._id}</span>
         </div>
         <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#020617] bg-gray-800" />
            ))}
         </div>
      </div>
    </motion.div>
  );
}

const ProtocolBadge = ({ status }) => {
  const cfg = {
    pending: { label: 'PENDING HUB SYNC', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    confirmed: { label: 'SIGNAL ESTABLISHED', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' },
    completed: { label: 'PROTOCOL ARCHIVED', color: 'bg-blue-500/10 text-blue-400 border-blue-400/20' },
    cancelled: { label: 'SIGNAL TERMINATED', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  }[status] || { label: status.toUpperCase(), color: 'bg-white/5 text-white/30 border-white/10' };

  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

const LoaderIcon = () => (
  <motion.div 
    animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} 
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className="relative drop-shadow-[0_0_20px_rgba(255,56,92,0.4)]"
  >
    <BrandIcon className="w-20 h-20" />
  </motion.div>
);

const NeuralAnalytics = ({ stats }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="grid grid-cols-1 lg:grid-cols-2 gap-10"
  >
    <div className="bg-white/5 rounded-[3rem] border border-white/5 p-12 h-[500px] flex flex-col justify-center items-center group">
       <div className="relative mb-8">
          <div className="absolute inset-0 bg-rose-500/10 blur-[60px] rounded-full group-hover:bg-rose-500/20 transition-all duration-500" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative z-10 p-10 rounded-full border border-white/5 backdrop-blur-3xl"
          >
             <BrandIcon className="w-40 h-40" />
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
             <div className="text-4xl font-black italic text-white drop-shadow-2xl">88%</div>
          </div>
       </div>
       <h3 className="text-xl font-black italic tracking-tighter mb-2">LOOPED PENETRATION</h3>
       <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center max-w-[200px]">Active dominance within the integrated matrix</p>
    </div>
    
    <div className="space-y-6">
       {[1,2,3,4].map(i => (
         <div key={i} className="bg-white/5 rounded-[2rem] border border-white/5 p-8 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white/50 group-hover:text-emerald-400 transition-colors" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Growth Index</p>
                  <p className="font-bold text-white">Hub Sector {i}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="font-black text-emerald-400">+{(Math.random() * 20).toFixed(1)}%</p>
            </div>
         </div>
       ))}
    </div>
  </motion.div>
);

const TrustProtocols = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-[3rem] border border-white/5 p-12 flex flex-col justify-between h-[400px]">
       <ShieldCheckIconSolid className="w-16 h-16 text-blue-400" />
       <div>
          <h3 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">Neural Trust <br/>Verification</h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">All guests must undergo cinematic face scanning and identity deployment before signal establishment.</p>
       </div>
       <button className="w-fit px-8 py-4 bg-blue-500 text-gray-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-400 transition-all">
          Configure Protocol
       </button>
    </div>
    
    <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-[3rem] border border-white/5 p-12 flex flex-col justify-between h-[400px]">
       <FingerPrintIcon className="w-16 h-16 text-rose-500" />
       <div>
          <h3 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">Identity <br/>Matching</h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">Syncing backend facial descriptors with frontend live sensor feeds for 100% confirmation.</p>
       </div>
       <button className="w-fit px-8 py-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-400 transition-all">
          View Active Scans
       </button>
    </div>
  </div>
);

const FinancialGrid = () => (
   <div className="bg-white/5 rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 p-8 md:p-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px]" />
      <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
         <div className="space-y-8">
            <div>
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">Total Operational Yield</p>
               <h3 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-emerald-400">R124,500.00</h3>
            </div>
            
            <div className="flex gap-12">
               <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Processing Hub</p>
                  <p className="text-xl font-bold text-white">R12,800</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Cleared Sig</p>
                  <p className="text-xl font-bold text-white">R111,700</p>
               </div>
            </div>
            
            <button className="w-full py-6 bg-emerald-500 text-gray-950 text-xs font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95">
               INITIATE REVENUE WITHDRAWAL
            </button>
         </div>
         
         <div className="flex-1 space-y-4">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Recent Ledger Transfers</p>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/2 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] font-black">+</div>
                    <span className="text-[11px] font-bold text-white/80">OP-REF-{Math.floor(Math.random() * 90000)}</span>
                 </div>
                 <span className="text-[11px] font-black text-emerald-400">R{Math.floor(Math.random() * 5000)}</span>
              </div>
            ))}
         </div>
      </div>
   </div>
);

const FooterDock = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 bg-white/5 backdrop-blur-3xl px-4 sm:px-6 py-3 sm:py-4 rounded-full border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-50 max-w-[95vw] sm:max-w-none">
       {[
         { icon: HomeIcon, route: '/', label: 'Home' },
         { icon: MagnifyingGlassIcon, route: '/search', label: 'Explore' },
         { icon: CpuChipIcon, route: '/host-dashboard', label: 'Dashboard', active: true },
         { icon: BellIcon, route: '/dashboard', label: 'Alerts' },
         { icon: UserIcon, route: '/profile', label: 'Profile' }
       ].map((item, i) => (
         <button 
           key={i} 
           onClick={() => navigate(item.route)}
           title={item.label}
           className={`p-3 sm:p-4 rounded-full transition-all flex flex-col items-center gap-1 group ${item.active ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110 sm:scale-125 mx-1 sm:mx-2' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
         >
            <item.icon className="w-5 h-5 sm:w-6 h-6" />
            <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              {item.label}
            </span>
         </button>
       ))}
    </div>
  );
};
