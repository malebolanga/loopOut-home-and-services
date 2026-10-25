
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import PropTypes from 'prop-types';
import ImageWithFallback from '../components/ImageWithFallback';

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
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70">
       <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#25D366] shadow-sm dark:bg-gray-900">
          <FaWhatsapp size={13} />
       </div>
       <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200">Guest note</p>
          <div className={`text-xs leading-relaxed text-gray-600 dark:text-gray-300 transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
             {message}
          </div>
          
          {(shouldShowReadMore || message.length > 100) && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
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
                   <span key={key} className="px-2 py-1 bg-white/60 text-[8px] font-black uppercase text-gray-400 rounded-md border border-gray-200 dark:border-gray-800">
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

ClientRequestNote.propTypes = {
  message: PropTypes.string.isRequired
};


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
  const [showDashboardControls, setShowDashboardControls] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 640);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: 'N/A', time: 'N/A' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: 'N/A', time: 'N/A' };
    return {
      date: d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getDurationLabel = (startStr, endStr, type) => {
    if (!startStr || !endStr) return '';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const hours = Math.round(diffMs / (1000 * 60 * 60));
    if (type === 'listing' || hours >= 24) {
      const days = Math.max(1, Math.round(hours / 24));
      return `${days} ${days === 1 ? 'Night' : 'Nights'}`;
    }
    if (hours < 1) {
      const mins = Math.max(15, Math.round(diffMs / (1000 * 60)));
      return `${mins} mins`;
    }
    return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  };

  const getCategoryBadge = (booking) => {
    if (booking.type === 'listing') {
      return 'PROPERTY OVERNIGHT STAY';
    }
    if (booking.type === 'helper') {
      const sub = (booking.helperDetails?.type || '').toUpperCase();
      return `${sub || 'PRO'} HELPER SERVICE`;
    }
    if (booking.type === 'event') {
      return 'EVENT & TICKET';
    }
    const sub = (booking.serviceDetails?.type || booking.subtype || '').toUpperCase();
    return `${sub || 'PRO'} SERVICE APPOINTMENT`;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const endpoint = dashboardMode === 'hosting' 
          ? `/api/bookings/host/${currentUser._id}`
          : `/api/bookings/user/${currentUser._id}`;
          
        const res = await fetch(endpoint, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();

          const formatted = data.map(b => {
            const startStr = b.startDate || b.date;
            const endStr = b.endDate || b.date;
            const itemObj = b.listing || b.helper || b.service || b.event;
            const hostObj = itemObj?.userRef || b.host;
            const requesterObj = b.user;

            const itemTitle = itemObj?.name || b.listingDetails?.name || b.helperDetails?.name || b.serviceDetails?.name || b.eventDetails?.name || 'Booking Item';
            const reqName = requesterObj?.username || b.clientName || 'Guest User';
            const reqPhone = b.phone || requesterObj?.phone || b.clientPhone || 'N/A';
            const reqAvatar = requesterObj?.avatar || null;

            const hostName = typeof hostObj === 'object' ? (hostObj.username || hostObj.name) : 'Host Provider';
            const hostAvatar = typeof hostObj === 'object' ? hostObj.avatar : null;
            const hostPhone = typeof hostObj === 'object' ? hostObj.phone : null;

            return {
              ...b,
              startFormatted: formatDateTime(startStr),
              endFormatted: formatDateTime(endStr),
              durationLabel: getDurationLabel(startStr, endStr, b.listing ? 'listing' : 'service'),
              itemName: itemTitle,
              requesterName: reqName,
              requesterPhone: reqPhone,
              requesterAvatar: reqAvatar,
              ownerName: hostName,
              ownerAvatar: hostAvatar,
              ownerPhone: hostPhone,
              type: b.listing ? 'listing' : (b.helper ? 'helper' : (b.event ? 'event' : 'service')),
              listingDetails: b.listing,
              helperDetails: b.helper,
              serviceDetails: b.service,
              eventDetails: b.event,
              location: itemObj?.address || b.location || b.requestLocation || 'Private Location',
              totalAmount: b.totalPrice || b.totalAmount || 0,
              subtype: b.subtype || '',
              selectedPerformer: b.selectedPerformer,
              performerExperience: b.performerExperience,
              performerImage: b.performerImage,
              itemId: itemObj?._id || b.itemId,
              numberOfRooms: Math.max(1, Number(b.numberOfRooms) || 1),
              specialRequirements: cleanMessage(b.message || b.specialRequirements || '')
            };
          });
          setBookings(formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser?._id, dashboardMode]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/update/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

   const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
  };

  const filteredBookings = bookings.filter(booking => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      booking.requesterName?.toLowerCase().includes(term) ||
      booking.requesterPhone?.includes(searchTerm) ||
      booking.itemName?.toLowerCase().includes(term);
    
    const matchesFilter = filter === 'all' ||
      booking.status === filter ||
      (filter === 'upcoming' && ['confirmed', 'approved', 'assigned', 'enroute', 'ongoing'].includes(booking.status)) ||
      (filter === 'declined' && ['cancelled', 'declined'].includes(booking.status));
    
    const matchesView = 
      viewType === 'all' || 
      (viewType === 'stays' && booking.type === 'listing') || 
      (viewType === 'services' && booking.type !== 'listing');
      
    return matchesSearch && matchesFilter && matchesView;
  });

  const getStayRoomAvailability = (booking) => {
    const property = booking.listingDetails;
    const roomType = property?.roomTypes?.find(room => room.name === booking.subtype);
    const capacity = Math.max(1, Number(roomType?.count || property?.totalUnits || property?.numberOfRooms || property?.numberOfApartments || 1));
    const start = new Date(booking.startDate).getTime();
    const end = new Date(booking.endDate).getTime();
    const overlapping = bookings.filter(other => other.type === 'listing' && other.itemId === booking.itemId &&
      ['pending', 'confirmed', 'approved', 'ongoing', 'assigned', 'enroute'].includes(other.status) &&
      (!roomType || other.subtype === booking.subtype) &&
      new Date(other.startDate).getTime() < end && new Date(other.endDate).getTime() > start);
    const points = [start, ...overlapping.map(other => new Date(other.startDate).getTime()).filter(time => time >= start && time < end)];
    const maxOccupied = points.reduce((max, time) => Math.max(max, overlapping.reduce((sum, other) =>
      sum + (new Date(other.startDate).getTime() <= time && new Date(other.endDate).getTime() > time ? other.numberOfRooms : 0), 0)), 0);
    return { capacity, remaining: Math.max(0, capacity - maxOccupied) };
  };

  return (
    <div className="app-safe-top min-h-screen app-safe-content-bottom pb-36 md:pb-8 bg-[#f7f7f7] dark:bg-gray-950 dashboard-container">
      <style>{hideScrollbarStyle}</style>
      <div className="max-w-6xl mx-auto px-4 pb-5 pt-0 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-900/[0.03] dark:border-gray-800 dark:bg-gray-900 sm:mb-7 sm:p-7">
          <div className="flex flex-row items-center justify-between gap-2 sm:items-end sm:gap-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button onClick={() => navigate(-1)} aria-label="Go back" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gray-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <div className="min-w-0">
              <div className="mb-1 hidden flex-wrap items-center gap-2 sm:mb-2 sm:flex">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{dashboardMode === 'hosting' ? 'HOST DASHBOARD' : 'GUEST DASHBOARD'}</p>
                {dashboardMode === 'hosting' && stats.pending > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{stats.pending} request{stats.pending === 1 ? '' : 's'} to review
                  </span>
                )}
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {dashboardMode === 'hosting' ? 'Bookings' : 'Your trips'}
              </h1>
              <p className="mt-2 hidden max-w-xl text-[13px] leading-6 text-slate-500 dark:text-gray-400 sm:block">
                {dashboardMode === 'hosting' ? 'Review requests, manage guest stays and keep your calendar up to date.' : 'See the status and details of your booking requests.'}
              </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 sm:p-1 dark:border-gray-800 dark:bg-gray-950">
                <button onClick={() => setDashboardMode('hosting')} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-4 sm:py-2 sm:text-xs ${dashboardMode === 'hosting' ? 'bg-white text-slate-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>Hosting</button>
                <button onClick={() => setDashboardMode('requests')} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-4 sm:py-2 sm:text-xs ${dashboardMode === 'requests' ? 'bg-white text-slate-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>My trips</button>
              </div>
              <ImageWithFallback src={currentUser?.avatar} alt={currentUser?.username || 'Your profile'} type="avatar" className="h-7 w-7 rounded-full border border-gray-200 dark:border-gray-700 sm:h-10 sm:w-10" />
            </div>
          </div>
          <button type="button" aria-expanded={showDashboardControls} onClick={() => setShowDashboardControls((open) => !open)} className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 sm:hidden dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <span>Booking filters</span>
            <span className="flex items-center gap-2 text-slate-400"><span>{showDashboardControls ? 'Hide' : 'Show'}</span><span aria-hidden="true" className={`text-base leading-none transition-transform ${showDashboardControls ? 'rotate-180' : ''}`}>⌄</span></span>
          </button>
        </header>
        <section aria-label="Booking summary" className="mb-5 mt-24 grid grid-cols-2 gap-3 sm:mb-7 sm:mt-24 sm:grid-cols-4 sm:gap-4">
          {[
            { label: 'Needs response', shortLabel: 'Pending', value: stats.pending, detail: 'Requests to review' },
            { label: 'Upcoming', shortLabel: 'Upcoming', value: bookings.filter(b => ['confirmed', 'approved', 'assigned', 'enroute', 'ongoing'].includes(b.status)).length, detail: 'Confirmed or active' },
            { label: 'Finished', shortLabel: 'Finished', value: bookings.filter(b => b.status === 'completed').length, detail: 'Completed bookings' },
            { label: 'Total bookings', shortLabel: 'Total', value: bookings.length, detail: 'All time' }
          ].map((stat, index) => (
            <div key={stat.label} className={`min-w-0 rounded-2xl border bg-white p-4 shadow-sm shadow-slate-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-950/60 sm:p-5 ${index === 0 && stats.pending ? 'border-rose-200 dark:border-rose-900/60' : 'border-slate-200 dark:border-gray-800'}`}>
              <div className="flex min-h-8 items-start justify-between gap-2">
                <p className="text-[11px] font-semibold leading-4 text-slate-600 dark:text-gray-300 sm:text-xs">{stat.label}</p>
                <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${index === 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : index === 1 ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' : index === 2 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300'}`}>{['!', '↗', '✓', '∑'][index]}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold leading-none tracking-tight text-slate-900 dark:text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-[10px] leading-4 text-slate-500 dark:text-gray-400 sm:text-[11px]">{stat.detail}</p>
            </div>
          ))}
          </section>

        <div className={`${showDashboardControls ? 'block' : 'hidden'} sm:block`}>
          <section aria-label="Booking filters" className="mt-4 border-t border-slate-100 pt-3 dark:border-gray-800 sm:mt-5 sm:pt-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label="Booking type">
              {[
                { id: 'all', label: 'All bookings' },
                { id: 'stays', label: 'Stays' },
                { id: 'services', label: 'Services' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setViewType(tab.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${viewType === tab.id ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{tab.label}</button>
              ))}
              </div>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label="Booking status">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Needs response' },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Finished' },
                  { id: 'declined', label: 'Cancelled' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setFilter(tab.id)} className={`shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition ${filter === tab.id ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>{tab.label}{tab.id === 'pending' && stats.pending > 0 && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-700">{stats.pending}</span>}</button>
                ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="search" placeholder="Search bookings" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-2 text-xs outline-none focus:border-gray-400 sm:py-2.5 sm:pr-3 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                  </div>
                  <button onClick={() => setScheduleView(scheduleView === 'calendar' ? 'list' : 'calendar')} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                    <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{scheduleView === 'calendar' ? 'List' : 'Calendar'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {scheduleView === 'calendar' && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <BookingCalendar bookings={bookings} />
          </div>
        )}
        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center dark:border-gray-700 dark:bg-gray-900">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No bookings found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'Try another filter or search term.'
                  : 'New guest and service requests will appear here.'
                }
              </p>
            </div>
          ) :            filteredBookings.map((booking, idx) => {
              const isHostView = dashboardMode === 'hosting';
              const contactName = isHostView ? booking.requesterName : booking.ownerName;
              const contactAvatar = isHostView ? booking.requesterAvatar : booking.ownerAvatar;
              const contactPhone = isHostView ? booking.requesterPhone : booking.ownerPhone;
              const contactRole = isHostView ? 'Client' : 'Provider';
              const itemImage = booking.listingDetails?.imageUrls?.[0] || booking.serviceDetails?.imageUrls?.[0] || booking.helperDetails?.imageUrls?.[0] || booking.eventDetails?.imageUrls?.[0];
              const statusDot =
                booking.status === 'confirmed' || booking.status === 'approved' ? 'bg-emerald-500' :
                booking.status === 'pending' ? 'bg-amber-500' :
                booking.status === 'completed' ? 'bg-blue-500' :
                booking.status === 'cancelled' || booking.status === 'declined' ? 'bg-rose-500' :
                'bg-gray-400';

              return (
              <motion.div
                key={booking._id}
                id={`booking-${booking._id}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.025, 0.15), ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
                <div className="h-36 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:h-24 sm:w-32">
                  {itemImage ? <ImageWithFallback src={itemImage} alt={booking.itemName} type="property" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-gray-400">{getServiceIcon(booking)}</div>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-4">

                  {/* ── Header: item + status ── */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {getCategoryBadge(booking)}
                        </span>
                        <h4 className="truncate text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                          {booking.itemName}
                        </h4>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusConfig[booking.status]?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border-gray-100 dark:border-gray-800'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                      {statusConfig[booking.status]?.label || booking.status}
                    </span>
                  </div>

                  {/* ── Primary contact: whoever the viewer needs to reach ── */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                      <ImageWithFallback src={contactAvatar} alt={contactName} type="avatar" className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight text-gray-900 dark:text-white">{contactName}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {contactRole}{booking.numberOfGuests ? ` · ${booking.numberOfGuests} guest${booking.numberOfGuests === 1 ? '' : 's'}` : ''}{contactPhone && ` · ${contactPhone}`}
                      </p>
                    </div>
                  </div>

                  {/* ── Timeline + price, compact single row ── */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-gray-600 dark:text-white min-w-0">
                      <CalendarIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold whitespace-nowrap">{booking.startFormatted.date}, {booking.startFormatted.time}</span>
                      <span className="text-gray-300">→</span>
                      <span className="font-semibold whitespace-nowrap">{booking.endFormatted.date}, {booking.endFormatted.time}</span>
                    </div>
                    {booking.durationLabel && (
                      <span className="flex-shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {booking.durationLabel}
                      </span>
                    )}
                  </div>

                  {isHostView && booking.type === 'listing' && (() => {
                    const availability = getStayRoomAvailability(booking);
                    return (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-gray-50 px-3 py-2.5 text-xs dark:bg-gray-800/70">
                        <span className="font-semibold text-gray-900 dark:text-white">{booking.numberOfRooms} {booking.numberOfRooms === 1 ? 'room' : 'rooms'} requested</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600 dark:text-gray-300">{availability.remaining} of {availability.capacity} available during this stay</span>
                        {booking.subtype && <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{booking.subtype}</span>}
                      </div>
                    );
                  })()}

                  {/* ── Location + price ── */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-50">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-white hover:text-rose-500 transition-colors min-w-0 truncate"
                    >
                      <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{booking.location}</span>
                    </a>
                    <span className="flex-shrink-0 text-right text-base font-semibold text-gray-900 dark:text-white">
                      R{Number(booking.totalAmount).toLocaleString()}<span className="ml-1 text-xs font-normal text-gray-500">total</span>
                    </span>
                  </div>

                  {/* ── Special Notes / Performer ── */}
                  {booking.selectedPerformer && (
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl p-3">
                      {booking.performerImage && (
                        <ImageWithFallback src={booking.performerImage} alt={booking.selectedPerformer} type="avatar" className="w-8 h-8 rounded-full border border-rose-200" />
                      )}
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 block">Assigned Pro</span>
                        <span className="text-xs font-black text-rose-700">{booking.selectedPerformer}</span>
                      </div>
                    </div>
                  )}

                  {booking.specialRequirements && (
                    <ClientRequestNote message={booking.specialRequirements} />
                  )}

                  {/* ── Actions Bar ── */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    
                    {/* Contact buttons — always reach the OTHER party, not yourself */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => contactPhone && window.open(`tel:${contactPhone.replace(/\s/g, '')}`, '_self')}
                        disabled={!contactPhone}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-white hover:bg-rose-50 hover:text-rose-500 transition-all border border-gray-100 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={`Call ${contactRole}`}
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => contactPhone && window.open(`https://wa.me/${contactPhone.replace(/\s/g, '')}`, '_blank')}
                        disabled={!contactPhone}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FaWhatsapp size={14} />
                        WhatsApp
                      </button>
                    </div>

                    {/* Host / User Action Buttons */}
                    <div className="flex items-center gap-2">
                      {dashboardMode === 'hosting' ? (
                        <>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                              >
                                Accept booking
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'declined')}
                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-100"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'approved') && booking.type !== 'listing' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'assigned')}
                              className="px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md"
                            >
                              Assign Pro
                            </button>
                          )}
                          {booking.status === 'assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'enroute')}
                              className="px-4 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-md"
                            >
                              En-Route
                            </button>
                          )}
                          {booking.status === 'enroute' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'ongoing')}
                              className="px-4 py-2.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-md"
                            >
                              Start Service
                            </button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'ongoing') && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'completed')}
                              className="px-4 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 transition-all shadow-md"
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
                              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all"
                            >
                              Cancel Request
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
                </div>
              </motion.div>
              );
            })
          }
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
              isToday ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-white border-transparent hover:bg-white dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-800'
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
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center opacity-40">
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

SlidingDatesStrip.propTypes = {
  bookings: PropTypes.array.isRequired,
  onBookingClick: PropTypes.func.isRequired
};

const BookingCalendar = ({ bookings }) => {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [calView, setCalView] = useState('month'); // 'month' or 'day'
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getBookingsForDate = (dateStr) => {
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return bookings.filter(booking => {
      if (['cancelled', 'declined'].includes(booking.status)) return false;
      const start = new Date(booking.startDate || booking.date);
      const end = new Date(booking.endDate || booking.date || booking.startDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
      if (end.getTime() <= start.getTime()) return start >= dayStart && start < dayEnd;
      return start < dayEnd && end > dayStart;
    });
  };
  
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
      days.push(<div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30" />);
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = getBookingsForDate(dateStr);
      
      days.push(
        <div key={day} className="min-h-[80px] border-b border-r border-gray-100 dark:border-gray-800 p-2 relative hover:bg-rose-50/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className={`text-sm font-black ${dayBookings.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-300'}`}>
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
                {b.startFormatted?.time || 'Stay'} · {b.requesterName || b.itemName}
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
      <div className="flex overflow-x-auto p-6 gap-4 scrollbar-hide bg-gray-50 dark:bg-gray-800/50">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayBookings = getBookingsForDate(dateStr);
          return (
            <div key={day} className="flex-shrink-0 w-32 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Day {day}</p>
               <div className="space-y-2">
                 {dayBookings.length > 0 ? dayBookings.map((b, i) => (
                   <div 
                     key={i}
                     onClick={() => scrollToBooking(b._id)}
                     className="p-2 bg-rose-50 rounded-xl border-l-2 border-rose-500 cursor-pointer hover:bg-rose-100 transition-all min-w-0 overflow-hidden"
                   >
                     <p className="text-[9px] font-black text-gray-900 dark:text-white leading-tight">{b.startFormatted?.time || 'Stay'}</p>
                     <p className="text-[8px] font-bold text-rose-600 truncate">{b.requesterName || b.itemName}</p>
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
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-12">
      <div className="p-8 bg-gray-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h3 className="text-xl font-black uppercase tracking-widest">
             {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
           </h3>
           <div className="flex bg-white/10 p-1 rounded-xl w-fit mt-3">
              <button 
                onClick={() => setCalView('month')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${calView === 'month' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
              >
                Month View
              </button>
              <button 
                onClick={() => setCalView('day')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${calView === 'day' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
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
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-gray-100 dark:border-gray-800">
            {renderMonthView()}
          </div>
        </>
      ) : renderDayView()}
    </div>
  );
};

BookingCalendar.propTypes = {
  bookings: PropTypes.array.isRequired
};
