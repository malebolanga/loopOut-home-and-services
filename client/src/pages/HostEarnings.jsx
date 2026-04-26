import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CpuChipIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { FaRobot, FaWhatsapp } from 'react-icons/fa';
import { BrandIcon } from '../components/BrandLogo';
import FooterDock from '../components/FooterDock';
import BrandLogo from '../components/BrandLogo';
import Swal from 'sweetalert2';

export default function HostEarnings() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hostStats, setHostStats] = useState({ listings: 0, rating: 5.0 });

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const [postRes, userRes] = await Promise.all([
          fetch(`/api/user/post-count/${currentUser._id}`),
          fetch(`/api/user/${currentUser._id}`)
        ]);
        if (postRes.ok && userRes.ok) {
          const postData = await postRes.json();
          const userData = await userRes.json();
          const likes = userData.likeCount || 0;
          const dislikes = userData.dislikeCount || 0;
          const totalRating = (likes + dislikes) > 0 ? (likes / (likes + dislikes) * 5).toFixed(1) : '5.0';
          setHostStats({ listings: postData.count || 0, rating: totalRating });
        }
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };
    if (currentUser?._id) fetchGlobalStats();
  }, [currentUser]);

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/host/${currentUser._id}`);
        if (res.ok) {
          const data = await res.json();
          // Sort by creation date
          setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, [currentUser]);

  const handleWithdrawal = async () => {
     const totalYield = bookings.reduce((sum, b) => b.status === 'completed' ? sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0) : sum, 0);
     
     if (totalYield <= 0) {
        return Swal.fire({
           title: 'Insufficient Yield',
           text: 'Your neural ledger must have completed revenue signals to initiate extraction.',
           icon: 'error',
           background: '#020617',
           color: '#fff',
           confirmButtonColor: '#10b981'
        });
     }

     const { value: accountDetails } = await Swal.fire({
        title: 'NEURAL EXTRACTION',
        text: `Initiate R${totalYield.toLocaleString()} extraction to banking node.`,
        input: 'text',
        inputPlaceholder: 'Enter Bank Account Details...',
        showCancelButton: true,
        background: '#020617',
        color: '#fff',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        inputValidator: (value) => {
           if (!value) return 'Billing account details are mandatory.';
        }
     });

     if (accountDetails) {
        try {
           const res = await fetch('/api/payment/withdrawal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 userId: currentUser._id,
                 amount: totalYield,
                 accountDetails
              })
           });

           if (res.ok) {
              Swal.fire({
                 title: 'SEQUENCE INITIATED',
                 text: 'Your extraction request has been queued in the financial hub.',
                 icon: 'success',
                 background: '#020617',
                 color: '#fff'
              });
           }
        } catch (error) {
           console.error('Extraction failure:', error);
        }
     }
  };

  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'completed' || b.status === 'confirmed') ? sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0) : sum, 0);
  const pendingRevenue = bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0), 0);
  const withdrawnTotal = totalRevenue * 0.85; // Mocking a 15% platform fee history

  const stats = [
    { label: 'Total Operational Yield', value: `R${totalRevenue.toLocaleString()}`, sub: 'All Sector Profits', icon: BanknotesIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Network Listings', value: hostStats.listings, sub: 'Active Assets', icon: HomeIcon, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Operator Score', value: `${hostStats.rating}★`, sub: 'Neural Reputation', icon: ShieldCheckIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Net Neural Inflow', value: `R${withdrawnTotal.toLocaleString()}`, sub: 'Direct Extraction Ready', icon: CpuChipIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -80, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        {/* Navigation Core */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => navigate('/host-dashboard')}
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 h-5 text-white/50 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
            <div className="flex items-center gap-4">
              <BrandLogo showText={true} textColor="text-white" className="h-8 sm:h-12 w-auto" />
              <div className="h-8 w-[1px] bg-white/10 hidden lg:block" />
              <div className="hidden lg:block">
                <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Financial <span className="text-white/20">Archive</span></h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <p className="text-[10px] font-black text-white uppercase tracking-widest">{currentUser?.username}</p>
               <p className="text-[7px] font-bold text-emerald-500/60 uppercase tracking-[0.2em]">Tier 1 Operator</p>
            </div>
            <img src={currentUser?.avatar} alt="Profile" className="w-10 h-10 rounded-xl border border-white/10 shadow-2xl" />
          </div>
        </header>

        {/* HUD Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white/5 border border-white/5 group hover:border-white/10 hover:bg-white/10 transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 blur-[50px] sm:blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 ${stat.bg}`} />
              <div className="relative flex flex-col justify-between h-full gap-6 sm:gap-8">
                <div className="flex items-center justify-between">
                   <p className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{stat.label}</p>
                   <stat.icon className={`w-5 h-5 sm:w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                   <h3 className="text-3xl sm:text-4xl font-black italic tracking-tighter mb-1">{stat.value}</h3>
                   <p className="text-[8px] sm:text-[9px] font-bold text-white/20 uppercase tracking-[0.1em]">{stat.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Neural Growth Graph - CSS Immersive */}
        <section className="mb-16">
           <div className="bg-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] border border-white/5 p-6 sm:p-12 overflow-hidden relative group">
              <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-6">
                    <div>
                       <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase">Inflow <span className="text-emerald-400">Analysis</span></h2>
                       <p className="text-[8px] sm:text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">30-Day Predictive Trajectory</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                       {['D', 'W', 'M', 'Y'].map(t => (
                         <button key={t} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${t === 'M' ? 'bg-emerald-500 text-gray-950' : 'bg-white/5 text-white/40 hover:text-white'}`}>{t}</button>
                       ))}
                    </div>
                 </div>

                 {/* Mock Matrix Graph */}
                 <div className="h-48 sm:h-64 w-full flex items-end gap-0.5 sm:gap-2">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const height = Math.random() * 80 + 20;
                      return (
                        <div key={i} className="flex-1 group/bar relative">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: `${height}%` }}
                             transition={{ delay: i * 0.02, duration: 1 }}
                             className={`w-full rounded-full transition-all duration-300 ${height > 70 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : height > 40 ? 'bg-emerald-500/40' : 'bg-white/5'}`}
                           />
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-emerald-500 text-gray-950 px-2 py-1 rounded-lg text-[7px] sm:text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                             R{Math.floor(height * 200)}
                           </div>
                        </div>
                      )
                    })}
                 </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
           </div>
        </section>

        {/* Transaction Ledger */}
        <section>
           <div className="flex flex-wrap items-center justify-between gap-6 mb-8 px-4">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Signal <span className="text-emerald-400">History</span></h2>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                 <ArrowPathIcon className="w-4 h-4" />
                 Sync Grid
              </button>
           </div>           <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 sm:h-24 bg-white/5 rounded-2xl sm:rounded-3xl animate-pulse border border-white/5" />
                ))
              ) : bookings.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white/2">
                   <BriefcaseIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white/10 mb-4" />
                   <p className="text-xs sm:text-sm font-bold text-white/20 italic">No signal history extracted yet.</p>
                </div>
              ) : (
                bookings.map((booking, i) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 bg-white/5 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 gap-6"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-emerald-400 transition-colors">
                          <CalendarIcon className="w-5 h-5 sm:w-6 h-6" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[8px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5 sm:mb-1">Signal Log #{booking._id.slice(-6)}</p>
                          <h4 className="font-bold text-white uppercase tracking-tight truncate text-sm sm:text-base">{booking.listing?.name || booking.helper?.name || 'Operational Task'}</h4>
                          <p className="text-[8px] text-white/30 font-bold uppercase mt-0.5 sm:mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                       <div className="sm:text-right">
                          <p className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                          <span className={`text-[7px] sm:text-[8px] font-black px-2 sm:px-3 py-1 rounded-full border ${
                            booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-white/30 border-white/10'
                          }`}>
                            {booking.status.toUpperCase()}
                          </span>
                       </div>
                       <div className="text-right min-w-[80px] sm:min-w-[100px]">
                          <p className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Value</p>
                          <p className="text-lg sm:text-xl font-black italic text-white leading-none">R{(Number(booking.totalAmount) || Number(booking.totalPrice) || 0).toLocaleString()}</p>
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </section>
      </div>

      {/* Extreme CTA for Withdrawal */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[90vw] sm:max-w-md z-50">
         <button 
           onClick={handleWithdrawal}
           className="w-full py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-gray-950 text-xs font-black uppercase tracking-[0.4em] rounded-[2rem] hover:scale-105 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 active:scale-95"
         >
            <FaRobot className="w-4 h-4" />
            Initiate Neural Extraction
         </button>
      </div>

      <FooterDock unreadCount={unreadCount} />
    </div>
  );
}
