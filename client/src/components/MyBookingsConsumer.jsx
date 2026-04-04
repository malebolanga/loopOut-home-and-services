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
  FaChevronLeft
} from 'react-icons/fa';

const ScheduleCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const bookingDays = bookings.map(b => {
     const d = new Date();
     if(b.date === 'Tomorrow') d.setDate(d.getDate() + 1);
     return d.getDate();
  });

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const startDay = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-12 w-full" />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const hasBooking = bookingDays.includes(i) && currentDate.getMonth() === new Date().getMonth();
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
          {bookings.map(b => (
            <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
               <div className={`w-2 h-10 rounded-full ${b.color}`} />
               <div className="flex-1">
                 <p className="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{b.title}</p>
                 <p className="text-[10px] text-gray-500 font-medium">{b.date} • {b.time}</p>
               </div>
               <div className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100 shadow-sm uppercase">
                  {b.status}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookingStatus = ({ status }) => {
  const configs = {
    pending: { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Finding a Pro', progress: 25 },
    assigned: { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Pro Assigned', progress: 50 },
    enroute: { color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'En-route', progress: 75 },
    ongoing: { color: 'text-rose-500', bg: 'bg-rose-50', label: 'Service Ongoing', progress: 90 },
    completed: { color: 'text-green-500', bg: 'bg-green-50', label: 'Completed', progress: 100 }
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
          <div className={`p-4 rounded-2xl ${booking.color} text-white shadow-lg`}>
            {booking.icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg leading-none mb-1">{booking.title}</h4>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FaCalendarCheck className="text-xs" />
              <span>{booking.date} • {booking.time}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onCancel(booking.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
          <FaTimes />
        </button>
      </div>

      <div className="space-y-4">
        <BookingStatus status={booking.status} />
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden">
               <img src={booking.proAvatar} alt={booking.proName} className="w-full h-full object-cover" />
             </div>
             <div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Professional</p>
               <p className="text-sm font-bold text-gray-900">{booking.proName}</p>
             </div>
          </div>
          <a 
            href={`https://wa.me/${booking.proWhatsapp}`} 
            className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-colors shadow-md"
          >
            <FaWhatsapp className="text-lg" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const MyBookingsConsumer = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [activeBookings, setActiveBookings] = useState([
    {
      id: 1,
      title: 'Grocery Delivery',
      proName: 'John Phiri',
      proAvatar: 'https://i.pravatar.cc/150?u=john',
      proWhatsapp: '27712345678',
      status: 'enroute',
      icon: <FaShoppingBasket />,
      color: 'bg-green-500',
      date: 'Today',
      time: '14:30'
    },
    {
      id: 2,
      title: 'Laundry Pickup',
      proName: 'Sarah Mokoena',
      proAvatar: 'https://i.pravatar.cc/150?u=sarah',
      proWhatsapp: '27781234567',
      status: 'pending',
      icon: <FaHandsWash />,
      color: 'bg-blue-500',
      date: 'Tomorrow',
      time: '09:00'
    }
  ]);

  const handleCancel = (id) => {
    setActiveBookings(prev => prev.filter(b => b.id !== id));
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
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">LoopOut Schedule</h2>
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
              {activeBookings.length > 0 ? (
                <AnimatePresence mode="wait">
                  {viewMode === 'list' ? (
                    <motion.div 
                      key="list-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
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
            </div>

            {activeBookings.length > 0 && (
              <div className="mt-12 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
                <FaStar className="absolute top-4 right-4 text-rose-500 text-4xl opacity-20 rotate-12" />
                <h3 className="text-lg font-bold mb-2 relative z-10">Rate your last service</h3>
                <p className="text-gray-400 text-sm mb-4 relative z-10">Help the LoopOut community find the best professionals.</p>
                <button className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-colors relative z-10">
                  Give Feedback
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MyBookingsConsumer;
