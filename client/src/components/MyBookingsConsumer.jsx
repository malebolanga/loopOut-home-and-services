import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarCheck, 
  FaClock, 
  FaMapMarkerAlt, 
  FaWhatsapp, 
  FaChevronRight,
  FaCheckCircle,
  FaShoppingBasket,
  FaHandsWash,
  FaPills,
  FaTimes,
  FaStar,
  FaCalendarAlt,
  FaListUl,
  FaChevronLeft,
  FaHome,
  FaCar,
  FaExclamationTriangle,
  FaPhone,
  FaUser
} from 'react-icons/fa';
import { useSelector } from 'react-redux';

const ScheduleCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1));
  
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const bookingDays = bookings.map(b => {
     const d = new Date(b.date);
     if (!isNaN(d.getTime())) return d.getDate();
     return null;
  }).filter(d => d !== null);

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const startDay = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-12 w-full" />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const hasBooking = bookingDays.includes(i);
      cells.push(
        <div key={i} className="relative h-12 w-full flex items-center justify-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${hasBooking ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>
            {i}
          </div>
          {hasBooking && (
            <motion.div 
              layoutId="active-dot"
              className="absolute -bottom-1 w-1 h-1 bg-rose-500 rounded-full"
            />
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaChevronLeft className="text-gray-400 text-xs"/></button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaChevronRight className="text-gray-400 text-xs"/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {renderDays()}
      </div>
      
      <div className="mt-8">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Upcoming Requests</h4>
        <div className="space-y-3">
          {bookings.length > 0 ? bookings.map(b => (
            <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
               <div className={`w-2 h-10 rounded-full ${b.color || 'bg-rose-500'}`} />
               <div className="flex-1">
                 <p className="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors uppercase truncate">{b.title}</p>
                 <p className="text-[10px] text-gray-500 font-medium">{b.date} • {b.time}</p>
               </div>
            </div>
          )) : <p className="text-xs text-gray-400 italic text-center">No bookings for this month</p>}
        </div>
      </div>
    </div>
  );
};

const BookingStatus = ({ status }) => {
  const configs = {
    pending: { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Finding a Pro', progress: 25 },
    confirmed: { color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Confirmed', progress: 50 },
    approved: { color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Approved', progress: 50 },
    assigned: { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Pro Assigned', progress: 60 },
    enroute: { color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'En-route', progress: 75 },
    ongoing: { color: 'text-rose-500', bg: 'bg-rose-50', label: 'Service Ongoing', progress: 90 },
    completed: { color: 'text-green-500', bg: 'bg-green-50', label: 'Completed', progress: 100 },
    cancelled: { color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled', progress: 0 },
    declined: { color: 'text-red-500', bg: 'bg-red-50', label: 'Declined', progress: 0 }
  };

  const config = configs[status] || configs.pending;

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
        <div className={`w-2 h-2 rounded-full ${config.color.replace('text', 'bg')} animate-pulse`} />
        {config.label}
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${config.progress}%` }}
          className={`h-full ${config.color.replace('text', 'bg')}`}
        />
      </div>
    </div>
  );
};

const BookingCard = ({ booking, onCancel }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${booking.color || 'bg-rose-500'} text-white shadow-lg`}>
            {booking.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-gray-900 text-lg leading-none mb-1 truncate">{booking.title}</h4>
            <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
              <FaCalendarCheck className="text-xs flex-shrink-0" />
              <span className="truncate">{booking.date} • {booking.time}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onCancel(booking.id)} 
          className="text-gray-300 hover:text-red-500 transition-colors p-2"
          disabled={booking.status === 'cancelled'}
        >
          <FaTimes />
        </button>
      </div>

      {booking.selectedPerformer && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            // We need the type and itemId. Let's make sure they are in the booking object.
            const route = booking.type === 'listing' ? `/listing/${booking.itemId}` : (booking.type === 'helper' ? `/helper/${booking.itemId}` : `/service/${booking.itemId}`);
            // Use window.location.href or navigate if available. 
            // In MyBookingsConsumer, navigate is not currently imported or used, let's use window.location.href for simplicity or add navigate.
            window.location.href = route;
          }}
          className="mb-4 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
        >
          <div className="flex items-center gap-3">
            {booking.performerImage ? (
              <img 
                src={booking.performerImage} 
                alt={booking.selectedPerformer} 
                className="w-6 h-6 rounded-full object-cover border border-rose-200"
              />
            ) : (
              <FaUser className="text-rose-500 text-[10px]" />
            )}
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{booking.selectedPerformer}</span>
          </div>
          {booking.performerExperience && (
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">{booking.performerExperience} Exp</span>
          )}
        </div>
      )}

      <div className="space-y-4">
        <BookingStatus status={booking.status} />
        
        {/* Premium WhatsApp Contact Card */}
        <div className="relative group/card">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-[2rem] opacity-0 group-hover/card:opacity-10 transition-opacity blur-lg" />
          <div className="relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4">
               <div className="relative">
                 <div className="w-14 h-14 rounded-full bg-white border-4 border-emerald-50 shadow-inner overflow-hidden flex items-center justify-center">
                   <img src={booking.selectedPerformer ? (booking.performerImage || 'https://i.pravatar.cc/150?u=pro') : booking.proAvatar} alt={booking.selectedPerformer || booking.proName} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://i.pravatar.cc/150?u=pro'} />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <FaWhatsapp className="text-white text-[10px]" />
                 </div>
               </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">
                    {booking.selectedPerformer ? 'Service Performer' : 'Your Professional'}
                  </p>
                  <h4 className="text-base font-black text-gray-900 leading-none truncate">
                    {booking.selectedPerformer || booking.proName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[11px] font-bold text-gray-400">
                       {booking.selectedPerformer ? `Team Member of ${booking.proName}` : 'Available on WhatsApp'}
                     </span>
                  </div>
                </div>
            </div>
            
            <div className="flex gap-2">
              <a 
                href={`tel:${booking.proWhatsapp}`}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 shadow-sm"
              >
                <FaPhone className="text-sm" />
              </a>
              <a 
                href={`https://wa.me/${booking.proWhatsapp.replace(/\s/g, '')}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
              >
                <FaWhatsapp className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MyBookingsConsumer = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState('list');
  const { currentUser } = useSelector((state) => state.user);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!currentUser?._id || !isOpen) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/user/${currentUser?._id}`);
        if (res.ok) {
          const data = await res.json();
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const formatted = data
            .filter(b => {
              const bookingDate = new Date(b.startDate);
              bookingDate.setHours(0, 0, 0, 0);
              const isPast = bookingDate < now;
              const isEnded = ['cancelled', 'completed', 'declined'].includes(b.status);
              return !isPast && !isEnded;
            })
            .map(b => ({
              id: b._id,
              rawDate: b.startDate,
              title: b.listing?.name || b.helper?.name || b.service?.name || 'Service Request',
              status: b.status || 'pending',
              date: new Date(b.startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
              time: new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              proName: b.listing ? (b.listing.userRef?.username || 'Host') : (b.helper?.name || b.service?.name || 'Pro'),
              proAvatar: b.listing?.imageUrls?.[0] || b.helper?.imageUrls?.[0] || b.service?.imageUrls?.[0] || 'https://i.pravatar.cc/150?u=pro',
              proWhatsapp: b.phone || 'N/A',
              icon: b.listing ? <FaHome /> : (b.service?.type === 'carwash' ? <FaCar /> : <FaHandsWash />),
              color: b.listing ? 'bg-rose-500' : 'bg-blue-500',
              subtype: b.subtype || '',
              selectedPerformer: b.selectedPerformer,
              performerExperience: b.performerExperience,
              performerImage: b.performerImage,
              type: b.listing ? 'listing' : (b.helper ? 'helper' : 'service'),
              itemId: b.listing?._id || b.helper?._id || b.service?._id
            }));
          setActiveBookings(formatted.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)));
        }
      } catch (error) {
        console.error('Error fetching consumer bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, [currentUser, isOpen]);

  const handleCancel = async (id) => {
    try {
      // Optimistically remove from UI
      setActiveBookings(prev => prev.filter(b => b.id !== id));

      const res = await fetch(`/api/bookings/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancelledBy: 'user'
        })
      });
      if (!res.ok) {
        console.error('Failed to cancel booking on server');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-50 z-[120] shadow-2xl p-6 overflow-y-auto scrollbar-hide"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">loopOut Schedule</h2>
                <div className="flex items-center gap-4 mt-2">
                   <button 
                     onClick={() => setViewMode('list')}
                     className={`flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <FaListUl />
                     LIST VIEW
                   </button>
                   <button 
                     onClick={() => setViewMode('calendar')}
                     className={`flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'calendar' ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <FaCalendarAlt />
                     CALENDAR
                   </button>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-transform active:scale-90"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-4" />
                  <p className="text-gray-400 text-sm font-medium">Fetching your schedule...</p>
                </div>
              ) : activeBookings.length > 0 ? (
                <AnimatePresence mode="wait">
                  {viewMode === 'list' ? (
                    <motion.div 
                      key="list-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 px-1"
                    >
                      {activeBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="calendar-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ScheduleCalendar bookings={activeBookings} />
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-3xl">
                    <FaCalendarCheck />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No active bookings</h3>
                  <p className="text-gray-500 px-10">Discover daily services and book your first home request today!</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 px-8 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors shadow-lg"
                  >
                    Start Exploring
                  </button>
                </div>
              )}

              {activeBookings.length > 0 && (
                <div className="mt-12 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
                  <FaStar className="absolute top-4 right-4 text-rose-500 text-4xl opacity-20 rotate-12" />
                  <h3 className="text-lg font-bold mb-2 relative z-10">Rate your last service</h3>
                  <p className="text-gray-400 text-sm mb-4 relative z-10">Help the loopOut community find the best professionals.</p>
                  <button className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-colors relative z-10">
                    Give Feedback
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MyBookingsConsumer;
