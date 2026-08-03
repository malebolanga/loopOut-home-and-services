
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  ScissorsIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  BellIcon,
  MapPinIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  TicketIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { 
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';
import { FaWhatsapp } from 'react-icons/fa';

// Mock data for demo
const mockBookings = [
  {
    _id: '1',
    type: 'listing',
    itemId: 'prop1',
    clientName: 'John Smith',
    clientPhone: '0712345678',
    date: '2024-12-20',
    time: '14:00',
    location: '123 Main St, Johannesburg',
    specialRequirements: 'Need parking space',
    totalAmount: 2500,
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    listingDetails: {
      name: 'Modern Apartment in Sandton',
      address: '123 Main St, Johannesburg',
      type: 'rent',
      regularPrice: 2500
    }
  },
  {
    _id: '2',
    type: 'helper',
    itemId: 'helper1',
    clientName: 'Sarah Johnson',
    clientPhone: '0823456789',
    selectedServices: ['haircut', 'beardTrim'],
    date: '2024-12-18',
    time: '10:00',
    location: 'Come to Client - 456 Oak Ave, Pretoria',
    specialRequirements: 'Skin sensitivity to certain products',
    totalAmount: 180,
    status: 'confirmed',
    createdAt: '2024-01-14T15:45:00Z',
    helperDetails: {
      name: 'Mike the Barber',
      type: 'barber',
      regularPrice: 150,
      travelFee: 30,
      address: '789 Barber St, Pretoria'
    }
  },
  {
    _id: '3',
    type: 'helper',
    itemId: 'helper2',
    clientName: 'David Wilson',
    clientPhone: '0834567890',
    selectedServices: ['mealPrep'],
    date: '2024-12-22',
    time: '18:00',
    location: "Chef's Kitchen",
    specialRequirements: 'Vegetarian meals only',
    totalAmount: 400,
    status: 'pending',
    createdAt: '2024-01-16T09:15:00Z',
    helperDetails: {
      name: 'Chef Maria',
      type: 'chef',
      regularPrice: 400,
      address: '55 Food Court, Cape Town'
    }
  },
  {
    _id: '4',
    type: 'listing',
    itemId: 'prop2',
    clientName: 'Emma Davis',
    clientPhone: '0745678901',
    date: '2024-12-25',
    time: '16:00',
    location: '78 Beach Road, Durban',
    specialRequirements: 'Late check-in at 8 PM',
    totalAmount: 1800,
    status: 'completed',
    createdAt: '2024-01-10T14:20:00Z',
    listingDetails: {
      name: 'Beachfront Villa',
      address: '78 Beach Road, Durban',
      type: 'over',
      regularPrice: 1800
    }
  }
];

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Approval' },
  confirmed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Confirmed' },
  approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
  assigned: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Pro Assigned' },
  enroute: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'En-route' },
  ongoing: { color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Ongoing Service' },
  completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
  declined: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Declined' }
};

const typeIcons = {
  listing: HomeIcon,
  helper: UserIcon
};

const helperTypeIcons = {
  barber: ScissorsIcon,
  chef: BriefcaseIcon,
  beauty: StarIcon,
  domestic: HomeIcon,
  maid: HomeIcon,
  tutor: UserIcon,
  tattoo: StarIcon,
  sneaker: ScissorsIcon,
  washingmat: HomeIcon,
  animals: StarIcon,
  photography: StarIcon,
  carwash: ScissorsIcon
};
const cleanMessage = (msg) => {
  if (!msg) return '';
  // Remove Accept/Decline links and any http links
  return msg
    .replace(/Accept:\s*https?:\/\/\S+/gi, '')
    .replace(/Decline:\s*https?:\/\/\S+/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Global style for hiding scrollbars while allowing scroll (for whole dashboard)
const hideScrollbarStyle = `
  .dashboard-container::-webkit-scrollbar,
  .dashboard-container *::-webkit-scrollbar {
    display: none !important;
  }
  .dashboard-container,
  .dashboard-container * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
`;

const ClientRequestNote = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const words = message.split(' ');
  const shouldShowReadMore = words.length > 20; // Approx 2 lines

  return (
    <div className="mt-8 pt-6 border-t border-gray-50 flex items-start gap-4 transition-all">
       <div className="w-8 h-8 rounded-full bg-[#E7FCE3] flex items-center justify-center text-[#25D366] flex-shrink-0 shadow-sm border border-[#25D366]/20 mt-1">
          <FaWhatsapp size={14} />
       </div>
       <div className="bg-gray-50/80 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 flex-1 shadow-sm max-w-[90%] transition-all overflow-hidden">
          <p className="text-[10px] font-black text-[#075E54] uppercase tracking-widest mb-1 opacity-70">Client Requested</p>
          <div className={`text-xs font-bold text-gray-700 leading-relaxed italic transition-all duration-500 ${!isExpanded ? 'line-clamp-2' : ''}`}>
             "{message}"
          </div>
          
          {(shouldShowReadMore || message.length > 100) && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}

          {/* Key info badges */}
          {(message.toLowerCase().includes('bbq') || 
            message.toLowerCase().includes('braai') ||
            message.toLowerCase().includes('electric') ||
            message.toLowerCase().includes('food')) && (
            <div className="mt-3 flex flex-wrap gap-2">
               {['BBQ', 'Braai', 'Electricity', 'Power', 'Food', 'Dietary'].map(key => 
                 message.toLowerCase().includes(key.toLowerCase()) && (
                   <span key={key} className="px-2 py-1 bg-white/60 text-[8px] font-black uppercase text-gray-400 rounded-md border border-gray-200">
                     {key}
                   </span>
                 )
               )}
            </div>
          )}
       </div>
    </div>
  );
}


export default function DashBoard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [viewType, setViewType] = useState('all'); 
  const [dashboardMode, setDashboardMode] = useState('hosting'); // 'hosting' or 'requests'
  const [scheduleView, setScheduleView] = useState('list'); // 'list', 'calendar', or 'sliding'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hostStats, setHostStats] = useState({ listings: 0, rating: 5.0, earnings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
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
          
          setHostStats(prev => ({
            ...prev,
            listings: postData.count || 0,
            rating: totalRating
          }));
        }
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };

    if (currentUser?._id) fetchStats();
  }, [currentUser]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const endpoint = dashboardMode === 'hosting' 
          ? `/api/bookings/host/${currentUser._id}`
          : `/api/bookings/user/${currentUser._id}`;
          
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();

          const formatted = data.map(b => ({
            ...b,
            date: new Date(b.startDate).toISOString().split('T')[0],
            time: new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clientName: dashboardMode === 'hosting' ? (b.user?.username || 'Guest') : (b.listing?.name || b.helper?.name || b.service?.name || 'Item'),
            clientPhone: b.phone || 'N/A',
            type: b.listing ? 'listing' : (b.helper ? 'helper' : 'service'),
            listingDetails: b.listing,
            helperDetails: b.helper,
            serviceDetails: b.service,
            location: b.listing?.address || b.helper?.address || b.service?.address || b.location || 'N/A',
            totalAmount: b.totalPrice,
            subtype: b.subtype || '',
            selectedPerformer: b.selectedPerformer,
            performerExperience: b.performerExperience,
            performerImage: b.performerImage,
            itemId: b.listing?._id || b.helper?._id || b.service?._id || b.itemId,
            specialRequirements: cleanMessage(b.message || '')
          }));
          setBookings(formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, dashboardMode]);

  const fetchNotifications = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000); // Check every 2 minutes
    return () => clearInterval(interval);
  }, [currentUser]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBooking = (bookingId) => {
    const element = document.getElementById(`booking-${bookingId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief highlight effect
      element.classList.add('ring-4', 'ring-rose-500/30', 'scale-[1.02]');
      setTimeout(() => element.classList.remove('ring-4', 'ring-rose-500/30', 'scale-[1.02]'), 2000);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/update/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          cancelledBy: newStatus === 'cancelled' ? (dashboardMode === 'hosting' ? 'host' : 'user') : undefined
        })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getServiceType = (booking) => {
    if (booking.type === 'listing') {
      return booking.listingDetails?.type === 'over' ? 'Stay' : 'Rent';
    } else if (booking.type === 'helper') {
      const helperType = booking.helperDetails?.type;
      const typeNames = {
        barber: 'Barber',
        chef: 'Chef',
        beauty: 'Beauty',
        domestic: 'Domestic',
        maid: 'Cleaning',
        tutor: 'Tutor',
        tattoo: 'Tattoo',
        sneaker: 'Sneaker',
        washingmat: 'Mat Wash',
        animals: 'Pet Care',
        photography: 'Photo'
      };
      return typeNames[helperType] || 'Pro Service';
    } else {
      const serviceType = booking.serviceDetails?.type;
      const typeNames = {
        carwash: 'Wash',
        cleaning: 'Clean',
        catering: 'Catering',
        daycare: 'Daycare',
        schoolTransport: 'School',
        laundry: 'Laundry',
        transport: 'Trip',
        beauty: 'Beauty'
      };
      
      let displayType = typeNames[serviceType] || 'Service';
      
      // Keep subtype but ensure it's abbreviated if long
      if (serviceType === 'carwash' && booking.subtype) {
        displayType = `${booking.subtype}`;
      } else if (serviceType === 'transport' && booking.subtype) {
        displayType = `${booking.subtype}`;
      }
      
      return displayType;
    }
  };

  const getServiceIcon = (booking) => {
    if (booking.type === 'listing') {
      const Icon = typeIcons.listing;
      return <Icon className="text-blue-500" />;
    } else if (booking.type === 'helper') {
      const helperType = booking.helperDetails?.type;
      const Icon = helperTypeIcons[helperType] || UserIcon;
      return <Icon className="text-green-500" />;
    } else {
      const serviceType = booking.serviceDetails?.type;
      const Icon = helperTypeIcons[serviceType] || BriefcaseIcon;
      return <Icon className="text-rose-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

   const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    earnings: bookings.reduce((sum, b) => (b.status === 'completed' || b.status === 'confirmed') ? sum + (Number(b.totalAmount) || Number(b.totalPrice) || 0) : sum, 0),
    listings: hostStats.listings,
    rating: hostStats.rating
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.clientPhone?.includes(searchTerm)) ||
      (booking.listingDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.helperDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || booking.status === filter;
    
    const matchesView = 
      viewType === 'all' || 
      (viewType === 'stays' && booking.type === 'listing') || 
      (viewType === 'services' && booking.type !== 'listing');
      
    return matchesSearch && matchesFilter && matchesView;
  });

  return (
    <div className="min-h-screen py-8 bg-slate-50 dashboard-container">
      <style>{hideScrollbarStyle}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Header with Title and Notification */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
           <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                {dashboardMode === 'hosting' ? 'Host Dashboard' : 'My Requests'}
              </h1>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mt-4 flex-wrap">
                 <button 
                   onClick={() => setDashboardMode('hosting')}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'hosting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Hosting Portfolio
                 </button>
                 <button 
                   onClick={() => setDashboardMode('requests')}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'requests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   My Activity
                 </button>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="relative">
                <div 
                  onClick={markAllAsRead}
                  className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/50 flex items-center justify-center text-gray-400 group-hover:text-rose-500 transition-all duration-300 cursor-pointer"
                >
                  <BellIcon className={`w-7 h-7 ${unreadCount > 0 ? 'animate-bounce text-rose-500' : ''}`} />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">
                    {unreadCount}
                  </div>
                )}
                
                {/* Notification Dropdown */}
                <div className="absolute top-20 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-gray-900 flex items-center gap-2">
                       Alert Center
                       {unreadCount > 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px]">{unreadCount} NEW</span>}
                    </h4>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-hide pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <div 
                          key={notif._id || idx}
                          className={`p-3 rounded-2xl border transition-all ${notif.read ? 'bg-white border-gray-50' : 'bg-rose-50/30 border-rose-100'}`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                                notif.type === 'booking' ? 'bg-amber-100 text-amber-600' : 
                                notif.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notif.type === 'booking' ? <CalendarIcon className="w-4 h-4" /> : <BellIcon className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight">{notif.title || 'System Alert'}</p>
                                 <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                 <p className="text-[8px] text-gray-400 mt-1 font-bold">{getTimeAgo(notif.createdAt)}</p>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-400 font-medium text-center py-6">Your alert center is currently quiet ✨</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-500 p-0.5 shadow-md">
                   <img src={currentUser?.avatar || 'https://via.placeholder.com/150'} alt="Host" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-black text-gray-900 leading-none mb-1">{currentUser?.username}</p>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Premium Host</p>
                </div>
              </div>
           </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Listings', value: stats.listings, icon: HomeIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Earnings', value: `R${stats.earnings.toLocaleString()}`, icon: BanknotesIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Host Rating', value: `${stats.rating}★`, icon: StarIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Pending Approval', value: stats.pending, icon: ClockIcon, color: 'text-rose-600', bg: 'bg-rose-50' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 ${stat.bg} rounded-2xl`}>
                  <stat.icon className={`${stat.color} text-2xl`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main View Navigation */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {[
            { id: 'all',      label: 'All Activity' },
            { id: 'stays',    label: 'Overnight Stays' },
            { id: 'services', label: 'Service Appointments' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                viewType === tab.id
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Schedule Perspective Toggles */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
           <div className="flex items-center gap-2">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                 <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule View</p>
                
              </div>
           </div>
           
           <div className="flex bg-gray-50 p-1.5 rounded-2xl">
              <button 
                onClick={() => setScheduleView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scheduleView === 'list' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                List
              </button>
              <button 
                onClick={() => setScheduleView('sliding')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scheduleView === 'sliding' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Sliding Dates
              </button>
              <button 
                onClick={() => setScheduleView('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scheduleView === 'calendar' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Full Calendar
              </button>
           </div>
        </div>

        {/* Sliding Dates Strip (Visible when selected) */}
        <AnimatePresence>
          {scheduleView === 'sliding' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-200/50 p-8">
                 <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                   Upcoming Schedule
                   <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] uppercase">Daily View</span>
                 </h3>
                 <SlidingDatesStrip bookings={bookings} onBookingClick={scrollToBooking} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Calendar View (Visible when selected) */}
        <AnimatePresence>
          {scheduleView === 'calendar' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <BookingCalendar bookings={bookings} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-3">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                  filter === status 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by client or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-10">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200/50">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-200" />
              <h3 className="mt-4 text-xl font-black text-gray-900 italic tracking-tight">No protocol found</h3>
              <p className="mt-2 text-gray-500 text-sm font-medium">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your bookings will appear here when clients book through the platform'
                }
              </p>
            </div>
          ) : (
            filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                id={`booking-${booking._id}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] transition-all duration-500"
              >
                {/* Status accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  booking.status === 'confirmed' || booking.status === 'approved' ? 'bg-emerald-400' :
                  booking.status === 'pending' ? 'bg-amber-400' :
                  booking.status === 'completed' ? 'bg-blue-400' :
                  booking.status === 'cancelled' || booking.status === 'declined' ? 'bg-rose-400' :
                  booking.status === 'enroute' ? 'bg-indigo-400' :
                  booking.status === 'ongoing' ? 'bg-orange-400' :
                  'bg-gray-200'
                }`} />

                <div className="p-6 pt-7 flex flex-col gap-5">

                  {/* ── Row 1: Service icon + name + type pill + price ── */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-500">
                        {getServiceIcon(booking)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-gray-900 leading-tight truncate mb-1.5">
                          {booking.type === 'listing'
                            ? booking.listingDetails?.name
                            : booking.helperDetails?.name || booking.serviceDetails?.name || 'Booking'}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[booking.status]?.color || 'bg-gray-100 text-gray-700 border-gray-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              booking.status === 'confirmed' || booking.status === 'approved' ? 'bg-emerald-500' :
                              booking.status === 'pending' ? 'bg-amber-500' :
                              booking.status === 'completed' ? 'bg-blue-500' :
                              booking.status === 'cancelled' || booking.status === 'declined' ? 'bg-rose-500' :
                              'bg-gray-400'
                            } animate-pulse`} />
                            {statusConfig[booking.status]?.label || booking.status}
                          </span>
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">
                            {getServiceType(booking)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-black text-gray-900 leading-none">R{Number(booking.totalAmount).toLocaleString()}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {booking.type === 'listing' ? 'Overnight' : 'Service'}
                      </p>
                    </div>
                  </div>

                  {/* ── Row 2: Date / Location / Ref ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                      <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date & Time</p>
                        <p className="text-xs font-bold text-gray-900 truncate">{formatDate(booking.date)}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{booking.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                      <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-rose-100 flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-rose-600 hover:underline truncate block"
                        >
                          {booking.location}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                      <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                          {dashboardMode === 'hosting' ? 'Client' : 'Ref'}
                        </p>
                        <p className="text-xs font-bold text-gray-900 truncate">{booking.clientName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold truncate">{booking.clientPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Performer chip (optional) ── */}
                  {booking.selectedPerformer && (
                    <div
                      onClick={() => navigate(`/${booking.type}/${booking.itemId}`)}
                      className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 cursor-pointer hover:bg-rose-100 transition-colors"
                    >
                      {booking.performerImage ? (
                        <img src={booking.performerImage} alt={booking.selectedPerformer} className="w-8 h-8 rounded-full object-cover border border-rose-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-black text-xs">
                          {booking.selectedPerformer.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Assigned Performer</p>
                        <p className="text-xs font-black text-rose-700 truncate">{booking.selectedPerformer}</p>
                      </div>
                      {booking.performerExperience && (
                        <span className="ml-auto flex-shrink-0 text-[8px] font-black text-rose-500 uppercase tracking-widest bg-white border border-rose-100 px-2 py-0.5 rounded-full">
                          {booking.performerExperience}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Special requirements ── */}
                  {booking.specialRequirements && (
                    <ClientRequestNote message={booking.specialRequirements} />
                  )}

                  {/* ── Row 3: Action buttons ── */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-50">
                    {/* Contact */}
                    <button
                      onClick={() => window.open(`tel:${booking.clientPhone.replace(/\s/g, '')}`, '_self')}
                      className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-gray-100"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => window.open(`https://wa.me/${booking.clientPhone.replace(/\s/g, '')}`, '_blank')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                    >
                      <FaWhatsapp size={14} />
                      WhatsApp
                    </button>

                    {/* Hosting action buttons */}
                    {dashboardMode === 'hosting' ? (
                      <>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100"
                              title="Approve"
                            >
                              <CheckCircleIconSolid className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'declined')}
                              className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
                              title="Decline"
                            >
                              <XCircleIconSolid className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'approved') && booking.type !== 'listing' && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'assigned')}
                            className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md"
                          >
                            Assign Pro
                          </button>
                        )}
                        {booking.status === 'assigned' && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'enroute')}
                            className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-md"
                          >
                            En-Route
                          </button>
                        )}
                        {booking.status === 'enroute' && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'ongoing')}
                            className="px-5 py-2.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-md"
                          >
                            Start Service
                          </button>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'ongoing') && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'completed')}
                            className="ml-auto px-5 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 transition-all shadow-md"
                          >
                            {booking.type === 'listing' ? 'Check Out' : 'Mark Complete'}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {['pending', 'confirmed', 'approved', 'assigned'].includes(booking.status) && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                            className="ml-auto px-5 py-2.5 bg-white border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all"
                          >
                            Cancel Request
                          </button>
                        )}
                      </>
                    )}

                    {/* Ref badge — right side */}
                    <span className="ml-auto text-[8px] font-black text-gray-300 uppercase tracking-widest hidden lg:block">
                      #{booking._id.slice(-6)}
                    </span>
                  </div>

                </div>
              </motion.div>

            ))
          )}
        </div>

        {/* Booking Calendar Section */}
        <div className="mt-16 mb-12">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">Booking Schedule</h2>
                 <p className="text-gray-500 font-medium">Visual overview of your confirmed appointments and stays</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Stays</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Services</span>
                 </div>
              </div>
           </div>
           
           {scheduleView === 'list' && (
             <BookingCalendar bookings={bookings} />
           )}
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-14">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Information</h3>
          <p className="text-blue-700">
            This is a demo dashboard showing how WhatsApp bookings would appear. In a real application, 
            these bookings would be automatically saved when clients book through your WhatsApp integration.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-600">
            <div>
              <strong>Features demonstrated:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Booking management for properties and services</li>
                <li>Status tracking (pending, confirmed, completed)</li>
                <li>Client communication via WhatsApp</li>
                <li>Search and filter functionality</li>
              </ul>
            </div>
            <div>
              <strong>Try these actions:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Filter by status using the buttons above</li>
                <li>Search for client names or phone numbers</li>
                <li>Update booking status (Confirm/Decline)</li>
                <li>Click WhatsApp buttons to message clients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SlidingDatesStrip = ({ bookings, onBookingClick }) => {
  const [dates, setDates] = useState([]);
  
  useEffect(() => {
    const today = new Date();
    const futureDates = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      futureDates.push(d);
    }
    setDates(futureDates);
  }, []);

  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-ZA', { day: 'numeric' });
  };
  
  const formatDayLabel = (date) => {
    return date.toLocaleDateString('en-ZA', { weekday: 'short' });
  };

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
      {dates.map((date, idx) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        return (
          <div 
            key={idx} 
            className={`flex-shrink-0 w-24 rounded-[2rem] p-4 flex flex-col items-center justify-between gap-3 border transition-all ${
              isToday ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              {formatDayLabel(date)}
            </span>
            <span className="text-2xl font-black">
              {formatDateLabel(date)}
            </span>
            
            <div className="flex -space-x-2 max-w-full px-1 overflow-visible">
              {dayBookings.length > 0 ? (
                dayBookings.slice(0, 3).map((b, i) => (
                  <div 
                    key={i}
                    onClick={() => onBookingClick(b._id)}
                    className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-black cursor-pointer hover:scale-110 transition-transform shadow-sm"
                    title={`${b.clientName} - ${b.time}`}
                  >
                    {b.clientName.charAt(0)}
                  </div>
                ))
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center opacity-40">
                  <span className="text-[10px]">•</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BookingCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024 for demo
  const [calView, setCalView] = useState('month'); // 'month' or 'day'
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const scrollToBooking = (id) => {
    const element = document.getElementById(`booking-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-rose-500/30', 'ring-offset-4', 'transition-all');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-rose-500/30', 'ring-offset-4');
      }, 2000);
    }
  };

  const renderMonthView = () => {
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/30" />);
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
      
      days.push(
        <div key={day} className="min-h-[80px] border-b border-r border-gray-100 p-2 relative hover:bg-rose-50/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className={`text-sm font-black ${dayBookings.length > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
              {day}
            </span>
            {dayBookings.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayBookings.slice(0, 1).map((b, i) => (
              <div 
                key={i}
                onClick={() => scrollToBooking(b._id)}
                className="text-[8px] font-black uppercase tracking-tighter px-1 py-0.5 rounded bg-rose-50 text-rose-700 border-l border-rose-500 truncate cursor-pointer"
              >
                {b.time} - {b.clientName}
              </div>
            ))}
            {dayBookings.length > 1 && (
              <button className="text-[7px] font-bold text-gray-400 hover:text-rose-500 uppercase">+{dayBookings.length - 1} more</button>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const renderDayView = () => {
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    return (
      <div className="flex overflow-x-auto p-6 gap-4 scrollbar-hide bg-gray-50/50">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
          return (
            <div key={day} className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Day {day}</p>
               <div className="space-y-2">
                 {dayBookings.length > 0 ? dayBookings.map((b, i) => (
                   <div 
                     key={i}
                     onClick={() => scrollToBooking(b._id)}
                     className="p-2 bg-rose-50 rounded-xl border-l-2 border-rose-500 cursor-pointer hover:bg-rose-100 transition-all min-w-0 overflow-hidden"
                   >
                     <p className="text-[9px] font-black text-gray-900 leading-tight">{b.time}</p>
                     <p className="text-[8px] font-bold text-rose-600 truncate">{b.clientName}</p>
                   </div>
                 )) : (
                   <p className="text-[8px] font-medium text-gray-300 italic">No bookings</p>
                 )}
               </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
      <div className="p-8 bg-gray-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h3 className="text-xl font-black uppercase tracking-widest">
             {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
           </h3>
           <div className="flex bg-white/10 p-1 rounded-xl w-fit mt-3">
              <button 
                onClick={() => setCalView('month')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${calView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/50 hover:text-white'}`}
              >
                Month View
              </button>
              <button 
                onClick={() => setCalView('day')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${calView === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/50 hover:text-white'}`}
              >
                Day Scroll
              </button>
           </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {calView === 'month' ? (
        <>
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-gray-100">
            {renderMonthView()}
          </div>
        </>
      ) : renderDayView()}
    </div>
  );
};
;
