import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { FaTimes, FaCalendarCheck, FaWhatsapp, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

const urgencyStyles = {
  today: { pill: 'bg-rose-500 text-white', bar: 'bg-rose-500', label: 'TODAY' },
  tomorrow: { pill: 'bg-amber-500 text-white', bar: 'bg-amber-500', label: 'TOMORROW' },
  soon: { pill: 'bg-blue-500 text-white', bar: 'bg-blue-500', label: 'SOON' },
  upcoming: { pill: 'bg-slate-700 text-white', bar: 'bg-slate-400', label: 'UPCOMING' },
};

const statusColors = {
  pending: 'text-amber-500',
  confirmed: 'text-emerald-500',
  approved: 'text-emerald-500',
  assigned: 'text-blue-500',
  enroute: 'text-indigo-500',
  ongoing: 'text-rose-500',
};

export const UpcomingBookingStrip = ({ navigate }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!currentUser?._id) { setLoading(false); return; }
    const controller = new AbortController();
    const fetch_ = async () => {
      try {
        const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const active = data
          .filter(b => {
            const d = new Date(b.startDate);
            d.setHours(0, 0, 0, 0);
            return d >= now && !['cancelled', 'completed', 'declined'].includes(b.status);
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 8)
          .map(b => {
            const due = new Date(b.startDate);
            const diffMs = due - new Date();
            const diffDays = Math.floor(diffMs / 86400000);
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const isToday = diffDays === 0;
            const isTomorrow = diffDays === 1;
            const urgency = isToday ? 'today' : isTomorrow ? 'tomorrow' : diffDays <= 3 ? 'soon' : 'upcoming';
            return {
              id: b._id,
              title: b.listing?.name || b.helper?.name || b.service?.name || b.event?.name || 'Booking Request',
              image: b.listing?.imageUrls?.[0] || b.helper?.imageUrls?.[0] || b.service?.imageUrls?.[0] || b.event?.imageUrls?.[0] || null,
              status: b.status || 'pending',
              dateStr: due.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
              timeStr: due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              diffDays, diffHrs, urgency, isToday, isTomorrow,
              type: b.listing ? 'listing' : b.helper ? 'helper' : b.event ? 'event' : 'service',
              itemId: b.listing?._id || b.helper?._id || b.service?._id || b.event?._id,
              emoji: b.listing ? '🏡' : b.helper ? '🧹' : b.event ? '🎟️' : '🛠️',
              proName: b.listing ? (b.listing.userRef?.username || b.listing.name || 'Host') : (b.helper?.name || b.service?.name || b.event?.name || 'Professional'),
              proAvatar: b.listing?.imageUrls?.[0] || b.helper?.imageUrls?.[0] || b.service?.imageUrls?.[0] || b.event?.imageUrls?.[0] || 'https://i.pravatar.cc/150?u=pro',
              proWhatsapp: b.phone || b.helper?.phone || b.service?.phone || '',
              proPhone: b.phone || b.helper?.phone || b.service?.phone || '',
              selectedPerformer: b.selectedPerformer || null,
              performerExperience: b.performerExperience || null,
              performerImage: b.performerImage || null,
              address: b.address || b.listing?.address || b.service?.address || b.event?.address || b.location || '',
              price: b.totalPrice || b.totalAmount || b.price || b.listing?.price || b.service?.price || b.helper?.price || null,
              notes: b.notes || b.specialInstructions || ''
            };
          });
        setBookings(active);
      } catch (e) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
    return () => controller.abort();
  }, [currentUser?._id]);

  if (!currentUser || (!loading && bookings.length === 0)) return null;

  return (
    <section className="mb-6 -mx-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-rose-500" />
          <span className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Your Upcoming</span>
          {bookings.length > 0 && (
            <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{bookings.length}</span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/upcoming-bookings')}
          className="text-[10px] font-black text-rose-500 uppercase tracking-wider cursor-pointer hover:underline"
        >
          See All
        </motion.button>
      </div>

      {/* Scroll strip */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1.5 snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0 w-[140px] sm:w-[160px] animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-1.5" />
              <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-2.5 bg-gray-200 rounded w-1/2" />
            </div>
          ))
          : bookings.map((b, i) => {
            const u = urgencyStyles[b.urgency] || urgencyStyles.upcoming;
            const sc = statusColors[b.status] || 'text-gray-400';
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedBooking(b)}
                className="snap-start shrink-0 w-[140px] sm:w-[160px] cursor-pointer flex flex-col bg-transparent border-0 shadow-none rounded-none"
              >
                {/* Compact Aspect-[4/3] Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 mb-1.5">
                  {b.image ? (
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-100 to-slate-200">
                      {b.emoji}
                    </div>
                  )}

                  {/* Due date pill (Top-Right) */}
                  <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${u.pill}`}>
                    {b.isToday ? 'Today' : b.isTomorrow ? 'Tomorrow' : `${b.diffDays}d left`}
                  </div>

                  {/* Category Type Pill (Top-Left) */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white rounded-md text-[8px] font-bold flex items-center gap-0.5 shadow-sm">
                    <span className="text-[9px]">{b.emoji}</span>
                    <span className="text-[7.5px] font-black uppercase tracking-wider capitalize hidden xs:inline">{b.type}</span>
                  </div>

                  {/* Urgency accent bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${u.bar}`} />
                </div>

                {/* Info section - Clean Compact Typography */}
                <div className="flex flex-col">
                  <p className="font-bold text-gray-900 truncate text-[12px] sm:text-[13px] leading-tight mb-0.5">
                    {b.title}
                  </p>
                  
                  <p className="text-gray-500 text-[10.5px] sm:text-[11px] truncate leading-tight">
                    {b.dateStr.replace(/, \d{4}/, '')} · {b.timeStr}
                  </p>
                  
                  <p className="text-gray-400 text-[9.5px] sm:text-[10px] truncate leading-tight mt-0.5">
                    {b.address?.split(',')[0] || 'Location TBC'}
                  </p>

                  <p className="text-gray-500 text-[9.5px] sm:text-[10px] truncate leading-tight mt-0.5 flex items-center gap-1">
                    <img src={b.proAvatar} alt="" className="w-3 h-3 rounded-full object-cover flex-shrink-0" />
                    <span className="truncate">{b.proName}</span>
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-gray-900 text-[11.5px] sm:text-[12px]">
                      {b.price ? (typeof b.price === 'number' ? `R${b.price.toLocaleString()}` : `R${b.price}`) : 'Booked'}
                    </span>
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-50 ${sc}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        }
      </div>

      {/* Interactive Booking Details Modal Popup */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[88vh] flex flex-col"
            >
              {/* Header Image Area */}
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 flex-shrink-0">
                {selectedBooking.image ? (
                  <img
                    src={selectedBooking.image}
                    alt={selectedBooking.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {selectedBooking.emoji}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Controls: Urgency Badge & Close button */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${urgencyStyles[selectedBooking.urgency]?.pill || 'bg-rose-500 text-white'}`}>
                      {selectedBooking.isToday ? '⚡ Due Today' : selectedBooking.isTomorrow ? '⏰ Due Tomorrow' : `🗓️ Due in ${selectedBooking.diffDays} days`}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest">
                      {selectedBooking.type}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>

                {/* Title inside Header */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-0.5">Booking Details</p>
                  <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-1">
                    {selectedBooking.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-hide text-left">
                {/* Date & Time Widget */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg">
                      <FaCalendarCheck />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Due Date</p>
                      <p className="text-sm font-black text-slate-900">{selectedBooking.dateStr} &bull; {selectedBooking.timeStr}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedBooking.status === 'confirmed' || selectedBooking.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      selectedBooking.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        selectedBooking.status === 'enroute' ? 'bg-indigo-100 text-indigo-700' :
                          selectedBooking.status === 'ongoing' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                    }`}>
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Assigned Performer / Pro Contact Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={selectedBooking.selectedPerformer ? (selectedBooking.performerImage || selectedBooking.proAvatar) : selectedBooking.proAvatar}
                          alt={selectedBooking.proName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                          onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=pro'; }}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {selectedBooking.selectedPerformer ? 'Assigned Pro' : 'Provider / Host'}
                        </p>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {selectedBooking.selectedPerformer || selectedBooking.proName}
                        </h4>
                        {selectedBooking.performerExperience && (
                          <span className="text-[9px] text-rose-500 font-bold uppercase">{selectedBooking.performerExperience} Exp</span>
                        )}
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex items-center gap-2">
                      {selectedBooking.proWhatsapp && (
                        <a
                          href={`https://wa.me/${selectedBooking.proWhatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-md shadow-emerald-200 active:scale-95 transition-all"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp className="text-base" />
                        </a>
                      )}
                      {selectedBooking.proPhone && (
                        <a
                          href={`tel:${selectedBooking.proPhone}`}
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                          title="Call"
                        >
                          <FaPhone className="text-xs" />
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedBooking.address && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-100 text-slate-600 text-xs">
                      <FaMapMarkerAlt className="text-rose-500 text-xs mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{selectedBooking.address}</span>
                    </div>
                  )}
                </div>

                {/* Notes or Price Info */}
                {(selectedBooking.price || selectedBooking.notes) && (
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl text-xs">
                    {selectedBooking.price && (
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Price</span>
                        <span className="font-black text-slate-900 text-sm">R{selectedBooking.price}</span>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <p className="text-[11px] text-slate-500 italic max-w-[200px] truncate">{selectedBooking.notes}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons in Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={() => {
                    const itemRoute = `/${selectedBooking.type === 'listing' ? 'listing' : selectedBooking.type}/${selectedBooking.itemId}`;
                    setSelectedBooking(null);
                    navigate(itemRoute);
                  }}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-98 transition-all cursor-pointer"
                >
                  <span>View Item Details</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    navigate('/profile?tab=bookings');
                  }}
                  className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
                >
                  <span>All Bookings</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default UpcomingBookingStrip;
