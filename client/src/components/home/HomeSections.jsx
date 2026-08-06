import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Tag as TagIcon } from 'lucide-react';
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, HomeIcon, UserIcon, TicketIcon, WrenchScrewdriverIcon, ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { FaWhatsapp, FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaCalendarAlt, FaTimes, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import useSearchIntelligence from '../../hooks/useSearchIntelligence';
import useLocationCoords from '../../hooks/useGeolocation';
import { calculateDistance } from '../../utils/locationUtils';
import HelperItem from '../../components/HelperItem';
import ImageGallery from '../../components/ImageGallery';
import ImageWithFallback from '../../components/ImageWithFallback';
import CompareItemReviews from '../../components/CompareItemReviews';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// ─── Countdown hook ───────────────────────────────────────────────────────────
const useCountdown = (targetDate) => {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, past: true };
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    return { days, hours, mins, past: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 30000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
};

// ─── Individual booking card ──────────────────────────────────────────────────
const BookingCard = ({ booking, onClick }) => {
  const item    = booking.helper || booking.service || booking.listing || booking.event;
  const isHelper  = !!booking.helper;
  const isService = !!booking.service && !booking.helper;
  const isEvent   = !!booking.event;
  const isListing = !!booking.listing && !booking.helper && !booking.service && !booking.event;

  const date = new Date(booking.startDate);
  const countdown = useCountdown(booking.startDate);

  const typeConfig = isHelper  ? { label: 'Helper',         icon: <UserIcon className="w-3 h-3" />,             color: 'from-violet-600 to-indigo-700', accent: 'violet' } :
                    isService  ? { label: 'Service',        icon: <WrenchScrewdriverIcon className="w-3 h-3" />,color: 'from-amber-500 to-orange-600',   accent: 'amber'  } :
                    isEvent    ? { label: 'Event',          icon: <TicketIcon className="w-3 h-3" />,            color: 'from-rose-500 to-pink-600',      accent: 'rose'   } :
                                 { label: 'Listing',        icon: <HomeIcon className="w-3 h-3" />,              color: 'from-emerald-500 to-teal-600',   accent: 'emerald' };

  const statusColor = booking.status === 'confirmed' || booking.status === 'approved'
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : booking.status === 'pending'
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  const thumb = item?.imageUrls?.[0] || item?.avatar || null;

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="snap-start shrink-0 w-[160px] h-[150px] cursor-pointer relative overflow-hidden rounded-[1.75rem] shadow-2xl"
    >
      {/* Card background: image or gradient */}
      {thumb ? (
        <>
          <ImageWithFallback src={thumb} alt={item?.name || item?.title} className="absolute inset-0 w-full h-full" type={typeConfig.accent} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/10 pointer-events-none" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${typeConfig.color}`} />
      )}

      {/* Shimmer glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-3 flex flex-col h-full justify-between">
        {/* Top row: type badge + status */}
        <div className="flex items-start justify-between gap-1">
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20`}>
            <span className="text-white">{typeConfig.icon}</span>
            <span className="text-[6.5px] font-black text-white uppercase tracking-[0.1em]">{typeConfig.label}</span>
          </div>
          <span className={`px-1.5 py-0.5 text-[6.5px] font-black uppercase tracking-wider rounded-md border ${statusColor} truncate max-w-[55px]`}>
            {booking.status}
          </span>
        </div>

        {/* Name */}
        <div>
          <h3 className="text-white font-black text-[12px] leading-tight line-clamp-2 mb-0.5 drop-shadow-sm">
            {item?.name || item?.title || 'Booking'}
          </h3>
          {item?.address && (
            <p className="text-white/50 text-[8px] font-bold uppercase tracking-wider truncate">{item.address}</p>
          )}
        </div>

        {/* Bottom: date + countdown */}
        <div className="flex items-end justify-between gap-1">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <CalendarDaysIcon className="w-2.5 h-2.5 text-white/70" />
              <span className="text-white text-[8px] font-bold">
                {date.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-2.5 h-2.5 text-white/70" />
              <span className="text-white/70 text-[8px] font-bold">
                {date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Countdown pill */}
          {!countdown.past && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[6.5px] font-black text-white/50 uppercase tracking-widest">In</span>
              <div className="flex items-center gap-0.5">
                {countdown.days > 0 && (
                  <span className="px-1 py-0.5 bg-white/20 backdrop-blur rounded text-white text-[7.5px] font-black">
                    {countdown.days}d
                  </span>
                )}
                <span className="px-1 py-0.5 bg-white/20 backdrop-blur rounded text-white text-[7.5px] font-black">
                  {countdown.hours}h
                </span>
              </div>
            </div>
          )}
          {countdown.past && (
            <span className="text-[6.5px] font-black text-rose-400 uppercase tracking-widest">Past</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Helper to parse details from formatted WhatsApp messages ───────────────
const parseSpecialDetails = (msg) => {
  if (!msg) return null;
  if (!msg.includes('*') && !msg.includes('━')) {
    return null; // Not structured template
  }

  const details = {};
  const lines = msg.split('\n');

  lines.forEach(line => {
    const cleanLine = line.replace(/\*/g, '').trim();

    // ── Barber / Beauty ──
    if (cleanLine.includes('Haircut Style:')) details.haircutStyle = cleanLine.split('Haircut Style:')[1].trim();
    if (cleanLine.includes('Beard Style:')) details.beardStyle = cleanLine.split('Beard Style:')[1].trim();

    // ── Food / Chef ──
    if (cleanLine.includes('Meal Type:')) details.mealType = cleanLine.split('Meal Type:')[1].trim();
    if (cleanLine.includes('Cuisine:')) details.cuisine = cleanLine.split('Cuisine:')[1].trim();

    // ── Provisions (all service types) ──
    if (cleanLine.includes('Food provided by client:')) details.foodProvided = cleanLine.split('Food provided by client:')[1].trim();
    if (cleanLine.includes('Electricity available:')) details.electricity = cleanLine.split('Electricity available:')[1].trim();

    // ── General list items ──
    if (cleanLine.startsWith('📜')) {
      if (!details.selectedServices) details.selectedServices = [];
      details.selectedServices.push(cleanLine.replace('📜', '').trim());
    }
    if (cleanLine.startsWith('📝')) details.notes = cleanLine.replace('📝', '').trim();

    // ── Car Wash ──
    if (cleanLine.includes('Type:') && cleanLine.startsWith('🚗')) details.vehicleType = cleanLine.split('Type:')[1].trim();
    if (cleanLine.includes('Make:')) details.vehicleMake = cleanLine.split('Make:')[1].trim();
    if (cleanLine.includes('Model:')) details.vehicleModel = cleanLine.split('Model:')[1].trim();
    if (cleanLine.includes('Plate:')) details.licensePlate = cleanLine.split('Plate:')[1].trim();
    if (cleanLine.includes('Wash:')) details.washType = cleanLine.split('Wash:')[1].trim();
    if (cleanLine.includes('Deep Clean:')) details.deepClean = cleanLine.split('Deep Clean:')[1].trim();
    if (cleanLine.includes('Polish:')) details.polish = cleanLine.split('Polish:')[1].trim();

    // ── Moving ──
    if (cleanLine.includes('From:') && cleanLine.startsWith('📦')) details.moveFrom = cleanLine.split('From:')[1].trim();
    if (cleanLine.includes('To:') && cleanLine.startsWith('🏁')) details.moveTo = cleanLine.split('To:')[1].trim();
    if (cleanLine.includes('Rooms/Size:')) details.moveRooms = cleanLine.split('Rooms/Size:')[1].trim();
    if (cleanLine.includes('Floor (From):')) details.moveFloorFrom = cleanLine.split('Floor (From):')[1].trim();
    if (cleanLine.includes('Floor (To):')) details.moveFloorTo = cleanLine.split('Floor (To):')[1].trim();
    if (cleanLine.includes('Lift/Elevator:')) details.moveLift = cleanLine.split('Lift/Elevator:')[1].trim();
    if (cleanLine.includes('Heavy items:')) details.moveHeavyItems = cleanLine.split('Heavy items:')[1].trim();
    if (cleanLine.includes('Packing service needed:')) details.movePacking = cleanLine.split('Packing service needed:')[1].trim();
    if (cleanLine.includes('Boxes:')) details.moveBoxes = cleanLine.split('Boxes:')[1].trim();
    if (cleanLine.includes('Weight:')) details.moveWeight = cleanLine.split('Weight:')[1].trim();
    if (cleanLine.includes('Vehicle:') && cleanLine.startsWith('🚛')) details.moveVehicle = cleanLine.split('Vehicle:')[1].trim();

    // ── Storage ──
    if (cleanLine.includes('Size:') && cleanLine.startsWith('📐')) details.storageSize = cleanLine.split('Size:')[1].trim();
    if (cleanLine.includes('Duration:') && cleanLine.startsWith('📆')) details.storageDuration = cleanLine.split('Duration:')[1].trim();
    if (cleanLine.includes('Items to Store:')) details.storageItemsToStore = cleanLine.split('Items to Store:')[1].trim();

    // ── Handyman / Maintenance ──
    if (cleanLine.includes('Job Type:')) details.handymanJobType = cleanLine.split('Job Type:')[1].trim();
    if (cleanLine.includes('Description:')) details.handymanDescription = cleanLine.split('Description:')[1].trim();
    if (cleanLine.includes('Materials needed:')) details.handymanMaterials = cleanLine.split('Materials needed:')[1].trim();
    if (cleanLine.includes('Urgency:')) details.handymanUrgency = cleanLine.split('Urgency:')[1].trim();

    // ── Landscaping ──
    if (cleanLine.includes('Service Type:')) details.landscapingType = cleanLine.split('Service Type:')[1].trim();
    if (cleanLine.includes('Area Size:')) details.landscapingArea = cleanLine.split('Area Size:')[1].trim();
    if (cleanLine.includes('Frequency:')) details.landscapingFrequency = cleanLine.split('Frequency:')[1].trim();
    if (cleanLine.includes('Equipment available:')) details.landscapingEquipment = cleanLine.split('Equipment available:')[1].trim();

    // ── Catering ──
    if (cleanLine.includes('Event Type:')) details.cateringEvent = cleanLine.split('Event Type:')[1].trim();
    if (cleanLine.includes('Guest Count:')) details.cateringGuests = cleanLine.split('Guest Count:')[1].trim();
    if (cleanLine.includes('Menu Preference:')) details.cateringMenu = cleanLine.split('Menu Preference:')[1].trim();
    if (cleanLine.includes('Dietary Requirements:')) details.cateringDietary = cleanLine.split('Dietary Requirements:')[1].trim();
    if (cleanLine.includes('Event Duration:')) details.cateringDuration = cleanLine.split('Event Duration:')[1].trim();
    if (cleanLine.includes('Venue Type:')) details.cateringVenue = cleanLine.split('Venue Type:')[1].trim();
  });

  return Object.keys(details).length > 0 ? details : null;
};

// ─── Booking Details Modal ────────────────────────────────────────────────────
const BookingDetailsModal = ({ booking, onClose, currentUser }) => {
  const item = booking.helper || booking.service || booking.listing || booking.event;
  const isHelper = !!booking.helper;
  const isService = !!booking.service && !booking.helper;
  const isEvent = !!booking.event;
  const isListing = !!booking.listing && !booking.helper && !booking.service && !booking.event;

  const dateStart = new Date(booking.startDate);
  const dateEnd = new Date(booking.endDate);

  const isUserBooking = currentUser?._id === (booking.user?._id || booking.user);

  let contactPhone = '';
  let contactName = '';
  let whatsappMsg = '';

  if (isUserBooking) {
    contactPhone = item?.contact || item?.userRef?.phone || item?.userRef?.contact || '';
    contactName = item?.name || item?.title || 'Host';
    whatsappMsg = `Hi, I am contacting you regarding my booking for "${item?.name || item?.title || 'your service'}" scheduled on ${dateStart.toLocaleDateString('en-ZA', { dateStyle: 'medium' })}.`;
  } else {
    contactPhone = booking.phone || booking.user?.phone || '';
    contactName = booking.user?.username || 'Client';
    whatsappMsg = `Hi ${contactName}, I am contacting you regarding your booking for "${item?.name || item?.title || 'our service'}" scheduled on ${dateStart.toLocaleDateString('en-ZA', { dateStyle: 'medium' })}.`;
  }

  const cleanPhone = (ph) => {
    if (!ph) return '';
    let cleaned = ph.toString().replace(/\D/g, "");
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      cleaned = "27" + cleaned.substring(1);
    }
    return cleaned;
  };

  const formattedCleanPhone = cleanPhone(contactPhone);
  const thumb = item?.imageUrls?.[0] || item?.avatar || null;

  const typeLabel = isHelper ? 'Helper Service' :
                    isService ? 'Service' :
                    isEvent ? 'Event' : 'Listing';

  const statusColors = {
    confirmed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    declined: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const statusColor = statusColors[booking.status] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';

  const details = parseSpecialDetails(booking.message);
  
  const displayMessage = details?.notes || 
    (booking.message && !booking.message.includes('━') && !booking.message.includes('★') ? booking.message : '');

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md">
      {/* Backdrop Close Click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative bg-white rounded-[2.5rem] overflow-hidden max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] border border-gray-100"
      >
        {/* Decorative Header with Image */}
        <div className="relative h-44 bg-slate-900 overflow-hidden shrink-0">
          {thumb ? (
            <>
              <ImageWithFallback src={thumb} alt={item?.name || item?.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all z-20 border border-white/10"
          >
            ✕
          </button>

          <div className="absolute bottom-5 inset-x-5 flex flex-col justify-end z-10">
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">{typeLabel}</span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm line-clamp-1">
              {item?.name || item?.title || 'Booking Details'}
            </h2>
          </div>
        </div>

        {/* Content Section (Scrollable) */}
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1 space-y-6">
          {/* Status and Price Banner */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Booking Status</span>
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border w-fit ${statusColor}`}>
                {booking.status}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Price</span>
              <span className="text-lg font-black text-gray-900 tracking-tight">
                R {booking.totalPrice?.toLocaleString() || booking.totalPrice || '0'}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date & Time</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Start / Check-In</p>
                <p className="text-xs font-black text-gray-800 leading-tight">
                  {dateStart.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[10px] font-bold text-gray-500 mt-1">
                  {dateStart.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="border-l border-gray-200/60 pl-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">End / Check-Out</p>
                <p className="text-xs font-black text-gray-800 leading-tight">
                  {dateEnd.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[10px] font-bold text-gray-500 mt-1">
                  {dateEnd.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Service Configuration details */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">📋 Booking Details</h3>

            {/* ── Request Type + Subtype header pill ── */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Request Type</p>
                  <p className="text-xs font-black text-indigo-800 leading-tight">{typeLabel}</p>
                </div>
              </div>
              {booking.subtype && (
                <span className="text-[10px] font-black text-violet-700 bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-xl max-w-[40%] text-right leading-tight">
                  {booking.subtype}
                </span>
              )}
            </div>

            {details && (
              <div className="space-y-3">

                {/* ── Selections list ── */}
                {details.selectedServices && details.selectedServices.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 space-y-1.5">
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">📜 Selected Services</p>
                    {details.selectedServices.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2 pl-2 border-l-2 border-rose-400">
                        <span className="text-[11px] font-bold text-rose-700">{srv}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── ✂️ Barber / Beauty ── */}
                {(details.haircutStyle || details.beardStyle) && (
                  <div className="bg-gradient-to-br from-pink-50 to-fuchsia-50 border border-pink-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-1">✂️ Barber &amp; Beauty</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.haircutStyle && (
                        <div className="flex justify-between items-center">
                          <span className="text-pink-400 font-semibold">Haircut Style</span>
                          <span className="font-black text-pink-800 bg-pink-100 px-2 py-0.5 rounded-lg">{details.haircutStyle}</span>
                        </div>
                      )}
                      {details.beardStyle && (
                        <div className="flex justify-between items-center">
                          <span className="text-pink-400 font-semibold">🧔 Beard Style</span>
                          <span className="font-black text-pink-800 bg-pink-100 px-2 py-0.5 rounded-lg">{details.beardStyle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 🍽️ Chef / Food ── */}
                {(details.mealType || details.cuisine) && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">🍽️ Meal Details</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.mealType && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-500 font-semibold">Meal Type</span>
                          <span className="font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">{details.mealType}</span>
                        </div>
                      )}
                      {details.cuisine && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-500 font-semibold">🌍 Cuisine</span>
                          <span className="font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">{details.cuisine}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 🚗 Car Wash ── */}
                {(details.vehicleType || details.vehicleMake || details.vehicleModel || details.licensePlate || details.washType || details.deepClean || details.polish) && (
                  <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">🚗 Vehicle &amp; Detailing</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.vehicleType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">Vehicle Type</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">{details.vehicleType}</span>
                        </div>
                      )}
                      {details.vehicleMake && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">🔖 Make</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">{details.vehicleMake}</span>
                        </div>
                      )}
                      {details.vehicleModel && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">🚘 Model</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">{details.vehicleModel}</span>
                        </div>
                      )}
                      {details.licensePlate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">🆔 Plate</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg tracking-widest">{details.licensePlate}</span>
                        </div>
                      )}
                      {details.washType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">🧼 Wash Type</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">{details.washType}</span>
                        </div>
                      )}
                      {details.deepClean && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">🧹 Deep Clean</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">{details.deepClean}</span>
                        </div>
                      )}
                      {details.polish && (
                        <div className="flex justify-between items-center">
                          <span className="text-sky-500 font-semibold">✨ Polish</span>
                          <span className="font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">{details.polish}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 🚛 Moving ── */}
                {(details.moveFrom || details.moveTo || details.moveRooms || details.moveFloorFrom || details.moveFloorTo || details.moveLift || details.moveHeavyItems || details.movePacking || details.moveBoxes || details.moveWeight || details.moveVehicle) && (
                  <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">🚛 Moving Details</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.moveFrom && (
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-orange-400 font-semibold flex-shrink-0">📦 From</span>
                          <span className="font-black text-orange-800 text-right bg-orange-100 px-2 py-0.5 rounded-lg max-w-[60%] leading-tight">{details.moveFrom}</span>
                        </div>
                      )}
                      {details.moveTo && (
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-orange-400 font-semibold flex-shrink-0">🏁 To</span>
                          <span className="font-black text-orange-800 text-right bg-orange-100 px-2 py-0.5 rounded-lg max-w-[60%] leading-tight">{details.moveTo}</span>
                        </div>
                      )}
                      {details.moveRooms && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">🛏️ Rooms / Size</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveRooms}</span>
                        </div>
                      )}
                      {details.moveFloorFrom && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">🏢 Floor (From)</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveFloorFrom}</span>
                        </div>
                      )}
                      {details.moveFloorTo && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">🏢 Floor (To)</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveFloorTo}</span>
                        </div>
                      )}
                      {details.moveLift && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">🛗 Lift / Elevator</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveLift}</span>
                        </div>
                      )}
                      {details.moveHeavyItems && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">🪑 Heavy Items</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveHeavyItems}</span>
                        </div>
                      )}
                      {details.movePacking && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">📦 Packing Service</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.movePacking}</span>
                        </div>
                      )}
                      {details.moveBoxes && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">📦 Boxes</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveBoxes}</span>
                        </div>
                      )}
                      {details.moveWeight && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">⚖️ Weight</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveWeight}</span>
                        </div>
                      )}
                      {details.moveVehicle && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-semibold">🚛 Vehicle</span>
                          <span className="font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">{details.moveVehicle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                 {/* ── 📦 Storage ── */}
                 {(details.storageDuration || details.storageItemsToStore) && (
                   <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-100 rounded-2xl p-3 space-y-2">
                     <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">📦 Storage Details</p>
                     <div className="grid grid-cols-1 gap-2 text-xs">
                       {details.storageDuration && (
                         <div className="flex justify-between items-center">
                           <span className="text-rose-400 font-semibold">📆 Duration</span>
                           <span className="font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-lg">{details.storageDuration}</span>
                         </div>
                       )}
                       {details.storageItemsToStore && (
                         <div className="flex flex-col gap-1 pt-1 border-t border-rose-100/50">
                           <span className="text-rose-400 font-semibold">📋 Items to Store</span>
                           <span className="text-rose-800 italic">"{details.storageItemsToStore}"</span>
                         </div>
                       )}
                     </div>
                   </div>
                 )}

                {/* ── 🔧 Handyman / Maintenance ── */}
                {(details.handymanJobType || details.handymanDescription || details.handymanMaterials || details.handymanUrgency) && (
                  <div className="bg-gradient-to-br from-slate-50 to-zinc-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">🔧 Job Details</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.handymanJobType && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-semibold">🔨 Job Type</span>
                          <span className="font-black text-slate-800 bg-slate-200 px-2 py-0.5 rounded-lg">{details.handymanJobType}</span>
                        </div>
                      )}
                      {details.handymanMaterials && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-semibold">🛒 Materials</span>
                          <span className="font-black text-slate-800 bg-slate-200 px-2 py-0.5 rounded-lg">{details.handymanMaterials}</span>
                        </div>
                      )}
                      {details.handymanUrgency && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-semibold">⚡ Urgency</span>
                          <span className={`font-black px-2 py-0.5 rounded-lg ${details.handymanUrgency.includes('Urgent') ? 'text-red-700 bg-red-100' : details.handymanUrgency.includes('Flexible') ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>{details.handymanUrgency}</span>
                        </div>
                      )}
                      {details.handymanDescription && (
                        <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 font-semibold">📋 Description</span>
                          <p className="text-slate-700 font-bold text-[11px] leading-relaxed bg-slate-100 rounded-xl px-3 py-2">{details.handymanDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 🌿 Landscaping ── */}
                {(details.landscapingType || details.landscapingArea || details.landscapingFrequency || details.landscapingEquipment) && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">🌿 Garden Details</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.landscapingType && (
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-500 font-semibold">🌱 Service Type</span>
                          <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">{details.landscapingType}</span>
                        </div>
                      )}
                      {details.landscapingArea && (
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-500 font-semibold">📐 Area Size</span>
                          <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">{details.landscapingArea}</span>
                        </div>
                      )}
                      {details.landscapingFrequency && (
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-500 font-semibold">🔄 Frequency</span>
                          <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">{details.landscapingFrequency}</span>
                        </div>
                      )}
                      {details.landscapingEquipment && (
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-500 font-semibold">🪣 Equipment</span>
                          <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">{details.landscapingEquipment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 🍽️ Catering ── */}
                {(details.cateringEvent || details.cateringGuests || details.cateringMenu || details.cateringDietary || details.cateringDuration || details.cateringVenue) && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">🍽️ Catering Details</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.cateringEvent && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-600 font-semibold">🎉 Event Type</span>
                          <span className="font-black text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-lg">{details.cateringEvent}</span>
                        </div>
                      )}
                      {details.cateringGuests && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-600 font-semibold">👥 Guests</span>
                          <span className="font-black text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-lg">{details.cateringGuests}</span>
                        </div>
                      )}
                      {details.cateringMenu && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-600 font-semibold">🍴 Menu</span>
                          <span className="font-black text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-lg">{details.cateringMenu}</span>
                        </div>
                      )}
                      {details.cateringDietary && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-600 font-semibold">🥗 Dietary</span>
                          <span className="font-black text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-lg">{details.cateringDietary}</span>
                        </div>
                      )}
                      {details.cateringDuration && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-600 font-semibold">⏱️ Duration</span>
                          <span className="font-black text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-lg">{details.cateringDuration}</span>
                        </div>
                      )}
                      {details.cateringVenue && (
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-600 font-semibold">🏛️ Venue</span>
                          <span className="font-black text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-lg">{details.cateringVenue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── ⚡ Provisions ── */}
                {(details.foodProvided || details.electricity) && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">⚡ Provisions</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {details.foodProvided && (
                        <div className="flex justify-between items-center">
                          <span className="text-teal-500 font-semibold">🍽️ Food by Client</span>
                          <span className={`font-black px-2 py-0.5 rounded-lg ${details.foodProvided.includes('Yes') || details.foodProvided.includes('✅') ? 'text-green-700 bg-green-100' : 'text-red-600 bg-red-50'}`}>{details.foodProvided}</span>
                        </div>
                      )}
                      {details.electricity && (
                        <div className="flex justify-between items-center">
                          <span className="text-teal-500 font-semibold">⚡ Electricity</span>
                          <span className={`font-black px-2 py-0.5 rounded-lg ${details.electricity.includes('Yes') || details.electricity.includes('✅') ? 'text-green-700 bg-green-100' : 'text-red-600 bg-red-50'}`}>{details.electricity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Location / Where */}
          {(item?.address || booking.requestLocation) && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Location Details</h3>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Address</p>
                  <p className="text-xs font-bold text-gray-800 leading-normal">
                    {item?.address || booking.requestLocation}
                  </p>
                </div>
                {item?.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all self-center border border-rose-100"
                  >
                    View Map 🗺️
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Who Booked (Customer details) / Provider details */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Party Details</h3>
            <div className="space-y-3">
              {/* Customer */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                    <img
                      src={booking.user?.avatar || 'https://i.pravatar.cc/150?u=user'}
                      alt={booking.user?.username}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://i.pravatar.cc/150?u=user'}
                    />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block mb-0.5">Who Booked / Customer</span>
                    <h4 className="text-xs font-black text-gray-800 leading-none">{booking.user?.username || 'Client'}</h4>
                    <p className="text-[9px] font-medium text-gray-400 mt-1">{booking.user?.email || 'No email provided'}</p>
                  </div>
                </div>
                {booking.phone && (
                  <span className="text-[9px] font-black text-gray-400 bg-white border border-gray-100 px-2.5 py-1.5 rounded-xl">
                    📞 {booking.phone}
                  </span>
                )}
              </div>

              {/* Host/Provider (Only show when current user is client or if item creator info exists) */}
              {isUserBooking && (item?.userRef || item?.name) && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                      <img
                        src={item?.userRef?.avatar || thumb || 'https://i.pravatar.cc/150?u=pro'}
                        alt={item?.userRef?.username || item?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'https://i.pravatar.cc/150?u=pro'}
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Professional / Host</span>
                      <h4 className="text-xs font-black text-gray-800 leading-none">{item?.userRef?.username || item?.name || 'Professional'}</h4>
                      <p className="text-[9px] font-medium text-gray-400 mt-1">{item?.userRef?.email || 'loopOut Partner'}</p>
                    </div>
                  </div>
                  {contactPhone && (
                    <span className="text-[9px] font-black text-gray-400 bg-white border border-gray-100 px-2.5 py-1.5 rounded-xl">
                      📞 {contactPhone}
                    </span>
                  )}
                </div>
              )}

              {/* Assigned Performer */}
              {booking.selectedPerformer && (
                <div className="p-4 bg-rose-50/50 border border-rose-100/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 overflow-hidden border border-rose-200/50 flex items-center justify-center">
                      {booking.performerImage ? (
                        <img src={booking.performerImage} alt={booking.selectedPerformer} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-rose-500 font-bold text-sm">👤</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block mb-0.5">Assigned Performer</span>
                      <h4 className="text-xs font-black text-rose-600 leading-none">{booking.selectedPerformer}</h4>
                      {booking.performerExperience && (
                        <p className="text-[9px] font-bold text-rose-400 mt-1">{booking.performerExperience} Experience</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes / Special Message */}
          {displayMessage && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Special Notes</h3>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
                  "{displayMessage}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-gray-100 flex items-center gap-3 shrink-0">
          {contactPhone && (
            <>
              {/* Call */}
              <a
                href={`tel:${contactPhone}`}
                className="w-12 h-12 flex items-center justify-center bg-white text-gray-500 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-gray-200/80 hover:border-rose-100 shadow-sm shrink-0"
                title={`Call ${contactName}`}
              >
                <FaPhone className="text-sm" />
              </a>
              {/* WhatsApp */}
              {formattedCleanPhone && (
                <a
                  href={`https://wa.me/${formattedCleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-6 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 font-black text-xs uppercase tracking-widest text-center"
                >
                  <FaWhatsapp className="text-base" /> Message 💬
                </a>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Upcoming Bookings Section ────────────────────────────────────────────────
export const UpcomingBookingsSection = ({ navigate }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!currentUser?._id) { setLoading(false); return; }
    const load = async () => {
      try {
        const [userRes, hostRes] = await Promise.all([
          fetch(`/api/bookings/user/${currentUser._id}`),
          fetch(`/api/bookings/host/${currentUser._id}`)
        ]);
        let all = [];
        if (userRes.ok)  all = [...all, ...(await userRes.json())];
        if (hostRes.ok)  all = [...all, ...(await hostRes.json())];

        // Deduplicate
        const map = new Map();
        all.forEach(b => map.set(b._id, b));

        const now = new Date();
        const upcoming = Array.from(map.values())
          .filter(b => new Date(b.startDate) >= now &&
            ['confirmed','approved','assigned','enroute','ongoing'].includes(b.status))
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 6);

        setBookings(upcoming);
      } catch (e) {
        console.error('UpcomingBookingsSection:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  if (!currentUser) return null;
  if (loading && bookings.length === 0) {
    return (
      <div className="mb-8 px-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex gap-4">
          <div className="w-[160px] h-[150px] bg-gray-100 rounded-[2rem]"></div>
          <div className="w-[160px] h-[150px] bg-gray-100 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-blue-500"
          />
          <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-gray-900">
            Upcoming Bookings
          </h2>
          <span className="ml-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[9px] font-black rounded-full border border-blue-500/20 uppercase tracking-wider">
            {bookings.length}
          </span>
        </div>
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
          View all <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Scroll row */}
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x">
        {bookings.length === 0 && (
          <div className="snap-start shrink-0 w-[160px] h-[150px] p-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-300" />
            </div>
            <h3 className="text-xs font-black text-gray-900">No Bookings</h3>
          </div>
        )}

        {bookings.map((booking) => (
          <BookingCard 
            key={booking._id} 
            booking={booking} 
            onClick={() => setSelectedBooking(booking)} 
          />
        ))}

        {/* "Browse more" end-cap */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/search')}
          className="snap-start shrink-0 w-[160px] h-[150px] rounded-[1.75rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <ArrowPathIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="text-[9px] font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-widest text-center transition-colors">
            Book More
          </span>
        </motion.div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export const NeuralPicksSection = ({ navigate }) => {
  const { rankItems, interactionMetrics } = useSearchIntelligence();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const res = await fetch('/api/helper/get?limit=20');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data) {
          if (Array.isArray(data)) {
            setHelpers(rankItems(data));
          } else if (data.success && Array.isArray(data.helpers)) {
            setHelpers(rankItems(data.helpers));
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHelpers();
  }, [rankItems]);

  if (loading || helpers.length === 0) return null;

  return (
    <motion.section 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={fadeInUp} 
      className="mb-16"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-rose-500"
                />
              ))}
            </div>
            <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase italic">Alpha Neural Discovery</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tighter">PROMOTED FOR YOU</h2>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Based on your performance and interest history</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-300" />
            Sessions: {interactionMetrics.sessionCount}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-300" />
            Accuracy: 98%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {helpers.slice(0, 4).map((helper, idx) => (
          <motion.div
            key={helper._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            <HelperItem helper={helper} reducedSize={true} />
            {/* Neural Pick Badge - below image, non-overlapping */}
            <div className="mt-1 flex items-center gap-1.5">
              <div className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1.5 shadow-sm">
               
            
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export const SellItemsSection = ({ navigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_EMOJIS = {
    furniture: '🛋️',
    electronics: '📱',
    clothes: '👗',
    universities: '🎓',
    books: '📚',
  };

  const CATEGORY_COLORS = {
    furniture: 'from-amber-500 to-orange-500',
    electronics: 'from-blue-500 to-indigo-600',
    clothes: 'from-rose-400 to-pink-500',
    universities: 'from-violet-500 to-purple-600',
    books: 'from-emerald-500 to-teal-500',
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/sell?limit=10');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data && data.success && Array.isArray(data.data)) {
          setItems(data.data);
        }
      } catch (err) {
        console.error('Failed to load sell items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="mb-16"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TagIcon className="w-4 h-4 text-rose-500" />
            <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase">P2P Exchange</span>
          </div>
         
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mt-1">Preloved items from the network</p>
        </div>
        <button
          onClick={() => navigate('/sell')}
          className="text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-full transition-all flex items-center gap-2"
        >
          <span>Access Vault</span>
          <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x">
        {items.map((item, idx) => {
          const catColor = CATEGORY_COLORS[item.category] || 'from-gray-500 to-gray-600';
          return (
          <div
            key={item._id}
            onClick={() => navigate(`/sell-item/${item._id}`)}
            className="flex-shrink-0 w-[180px] md:w-[220px] cursor-pointer snap-start flex flex-col "
          >
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={item.imageUrls?.[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5 z-20">
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${catColor} animate-pulse`} />
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                  {CATEGORY_EMOJIS[item.category] || '🏷️'} {item.category}
                </span>
              </div>
            </div>

            {/* Info — flat, borderless, Airbnb-style */}
            <div className="flex flex-col mt-2">
              <p className="font-semibold text-gray-900 text-[14px] truncate">{item.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {item.creator?.avatar && (
                  <ImageWithFallback src={item.creator.avatar} alt={item.creator.username} type="avatar" className="w-3.5 h-3.5 rounded-full border border-gray-200" />
                )}
                <p className="text-[11px] text-gray-500 truncate">{item.creator?.username || 'Anonymous'}</p>
              </div>
              <p className="font-semibold text-gray-900 text-[14px] mt-1">
                R {item.price?.toLocaleString() || item.price}
              </p>
            </div>
          </div>
        )})}
      </div>
    </motion.section>
  );
};

export const SmartRecommendations = ({ recommendations, insights, loading, onItemClick }) => {
  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-gray-900">AI Picks for you</h3>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {recommendations.slice(0, 6).map((item, i) => (
          <div key={item._id ? `rec-${item._id}` : `rec-${i}`} onClick={() => onItemClick(item, item.routeType || item.type)} className="flex-shrink-0 w-40 cursor-pointer group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-2 bg-gray-200">
              <ImageGallery
                imageUrls={item.imageUrls || []}
                alt={item.name}
                type={item.routeType === 'listing' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : (item.routeType || 'default')}
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-1 bg-white/90 backdrop-blur rounded-md">AI Pick</span>
              </div>
            </div>
            <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-semibold">R{item.price || item.regularPrice}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const ServicesToYourDoor = ({ navigate }) => {
  const atHomeServices = [
    { id: 'barber', name: 'Mobile Barber', desc: 'Fresh cuts at your home', emoji: '💈', color: 'from-gray-950 to-gray-800' },
    { id: 'hair', name: 'Home Hair & Style', desc: 'Salon experience at home', emoji: '💇', color: 'from-rose-500 to-pink-500' },
    { id: 'massage', name: 'Home Massage', desc: 'Relaxation brought to you', emoji: '💆', color: 'from-emerald-500 to-teal-500' },
    { id: 'domestic', name: 'House Cleaning', desc: 'Professional cleaning', emoji: '🧹', color: 'from-blue-600 to-indigo-600' },
    { id: 'handyman', name: 'Mobile Handyman', desc: 'Home repairs & maintenance', emoji: '🛠️', color: 'from-orange-600 to-amber-500' },
  ];

  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">THE HOME EXPERIENCE</h2>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Services that travel directly to you</p>
        </div>
        <button
          onClick={() => navigate('/helper-home-page')}
          className="text-xs font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-500/20 hover:border-rose-500 transition-all"
        >
          View All Home Experts
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
        {atHomeServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/search?category=${service.id}&type=helpers`)}
            className="snap-start shrink-0 w-[300px] md:w-[320px] cursor-pointer bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/30 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-[4rem]" />
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-8 shadow-lg hover:rotate-12 transition-transform duration-500`}>
              {service.emoji}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{service.name}</h3>
            <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed h-10">{service.desc}</p>
            <div className="flex items-center text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] gap-3">
              BOOK EXPERT <ArrowRightIcon className="w-4 h-4 hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const WeeklySpecialsSection = ({ navigate, isMobile = false }) => {
  const allSpecials = [
    {
      id: 'promo-verified',
      title: 'Verified Excellence',
      discount: 'PREMIUM',
      desc: 'Trust only the best local experts in your area',
      color: 'bg-indigo-600',
      image: '/special_verified.png'
    },
    {
      id: 'promo-favor',
      title: 'Community Favor',
      discount: 'R50 + R50',
      desc: 'Refer a neighbor and both get credits',
      color: 'bg-emerald-600',
      image: '/special_flavor.png'
    },
    {
      id: 'promo-1',
      title: 'First-Time User Special',
      discount: 'R20 OFF',
      desc: 'On your first home experience booking',
      color: 'bg-rose-600',
      image: '/special_first.png'
    },
    {
      id: 'promo-barber',
      title: 'LoopOut Barber',
      discount: 'EXCELLENCE',
      desc: 'Draped in excellence, styled by premier groomers',
      color: 'bg-indigo-600',
      image: '/barber_loopout_campaign.png'
    },
    {
      id: 'promo-hotel',
      title: 'LoopOut Hotel',
      discount: 'EXCLUSIVE',
      desc: 'Welcome to premium comfort at partner destinations',
      color: 'bg-amber-600',
      image: '/hotel_reception_loopout_campaign.png'
    },
    {
      id: 'promo-rooms',
      title: 'LoopOut Soweto Stay',
      discount: 'SOWETO',
      desc: 'Rest in luxury with co-branded pillows at premier guest houses',
      color: 'bg-emerald-600',
      image: '/soweto_bg.png'
    }
  ];

  const specials = isMobile 
    ? allSpecials.filter(s => s.id === 'promo-favor' || s.id === 'promo-1')
    : allSpecials;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <h2 className="text-xl font-black text-gray-950 tracking-widest uppercase">DEFINE YOUR DAY</h2>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-3 ${isMobile ? 'lg:grid-cols-2' : 'lg:grid-cols-6'} gap-6`}>
        {specials.map((promo) => (
          <motion.div
            key={promo.id}
            whileHover={{ scale: 1.02 }}
            className="relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl group"
            onClick={() => navigate('/search?filter=special')}
          >
            <ImageWithFallback src={promo.image} alt={promo.title} className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-[5s] object-cover" />
            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className={`${promo.color} text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-3 tracking-widest`}>
                {promo.discount}
              </div>
              <h3 className="text-white font-bold text-xl leading-tight mb-1">{promo.title}</h3>
              <p className="text-white/80 text-sm font-medium">{promo.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const CompareRecommendedSection = ({ navigate }) => {
  const { coords: userCoords, city: detectedCity } = useLocationCoords();
  const { currentUser } = useSelector((state) => state.user || {});
  const [activeCategory, setActiveCategory] = useState('guesthouses');
  const [selectedItems, setSelectedItems] = useState([]);
  const [dbItemsByCategory, setDbItemsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // A city is used as the text fallback when GPS coordinates are unavailable.
  const userLocationName = detectedCity || currentUser?.city || currentUser?.location || 'Your Area';

  // Category Tabs explicitly mapping to exact types requested by user
  const COMPARE_CATEGORIES = [
    { id: 'guesthouses', label: 'Guest Houses', defaultUnit: 'night', emoji: '🏡' },
    { id: 'beauty', label: 'Beauty & Salon', defaultUnit: 'session', emoji: '💄' },
    { id: 'beauty_specialist', label: 'Beauty Specialist', defaultUnit: 'session', emoji: '✨' },
    { id: 'resorts', label: 'Resorts & Self-Catering', defaultUnit: 'night', emoji: '🏖️' },
    { id: 'sneakers', label: 'Sneaker Cleaning', defaultUnit: 'pair', emoji: '👟' },
    { id: 'tattoo', label: 'Tattoo Artists', defaultUnit: 'hr', emoji: '💉' },
    { id: 'chefs', label: 'Private Chefs', defaultUnit: 'hr', emoji: '👨‍🍳' },
    { id: 'tutors', label: 'Private Tutors', defaultUnit: 'hr', emoji: '📖' },
    { id: 'rental_rooms', label: 'Rental Rooms', defaultUnit: 'mo', emoji: '🛌' },
    { id: 'hotels', label: 'Hotels & Stays', defaultUnit: 'night', emoji: '🏨' },
    { id: 'barbers', label: 'Barber Shops', defaultUnit: 'cut', emoji: '💈' },
    { id: 'photographers', label: 'Photographers', defaultUnit: 'hr', emoji: '📸' },
    { id: 'domestic', label: 'Domestic Cleaners', defaultUnit: 'day', emoji: '🧹' },
    { id: 'plumbers', label: 'Plumbers', defaultUnit: 'hr', emoji: '🔧' },
    { id: 'gardeners', label: 'Gardeners', defaultUnit: 'day', emoji: '🌳' },
    { id: 'transport', label: 'Transportation', defaultUnit: 'trip', emoji: '🚕' },
    { id: 'logistics', label: 'Logistics & Moving', defaultUnit: 'load', emoji: '📦' },
    { id: 'storage', label: 'Storage Units', defaultUnit: 'mo', emoji: '🏬' },
  ];

  // Fallback database templates if backend has fewer than 4 uploads for a category
  const FALLBACK_ITEMS = {
    guesthouses: [
      {
        _id: 'rec_gh1',
        name: 'Protea Glen Villa Guest House',
        itemType: 'property',
        typeLabel: 'Guest House',
        price: 850,
        unit: 'night',
        address: 'Soweto, JHB',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Luxury guest house offering comfortable en-suite rooms, free Wi-Fi, breakfast & secure parking.'
      },
      {
        _id: 'rec_gh2',
        name: 'Sunset Bay Guest House',
        itemType: 'property',
        typeLabel: 'Guest House',
        price: 950,
        unit: 'night',
        address: 'Umhlanga, DBN',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Ocean view boutique guest house with swimming pool, air conditioning and complimentary breakfast.'
      },
      {
        _id: 'rec_gh3',
        name: 'Highland View Guest Lodge',
        itemType: 'property',
        typeLabel: 'Guest House',
        price: 780,
        unit: 'night',
        address: 'Polokwane',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Peaceful retreat offering king suites, solar power backup, DSTV and lush garden access.'
      },
      {
        _id: 'rec_gh4',
        name: 'Rosebank Garden Suite Guest House',
        itemType: 'property',
        typeLabel: 'Guest House',
        price: 1100,
        unit: 'night',
        address: 'Rosebank, JHB',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Executive guest house located near Gautrain station with self-catering amenities and pool.'
      }
    ],
    beauty: [
      {
        _id: 'rec_bt1',
        name: 'Glow & Glam Beauty Lounge',
        itemType: 'helper',
        typeLabel: 'Beauty & Salon',
        regularPrice: 350,
        unit: 'session',
        address: 'Sandton, JHB',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3319333/pexels-photo-3319333.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Full-service beauty studio specializing in glam makeup, luxury manicures and lash extensions.'
      },
      {
        _id: 'rec_bt2',
        name: 'Kasi Chic Nail & Beauty Bar',
        itemType: 'helper',
        typeLabel: 'Beauty & Salon',
        regularPrice: 220,
        unit: 'session',
        address: 'Soweto',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Trendy neighborhood beauty bar offering acrylic nails, pedicure pampering and brow shaping.'
      },
      {
        _id: 'rec_bt3',
        name: 'Velvet Touch Skincare & Lashes',
        itemType: 'service',
        typeLabel: 'Beauty & Salon',
        price: 400,
        unit: 'session',
        address: 'Pretoria',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Relaxing mobile & studio beauty care with organic facial treatments and volume lashes.'
      },
      {
        _id: 'rec_bt4',
        name: 'Serenity Mobile Beauty Spa',
        itemType: 'helper',
        typeLabel: 'Beauty & Salon',
        regularPrice: 280,
        unit: 'session',
        address: 'Durban',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/3993311/pexels-photo-3993311.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Home visit beauty treatments including massages, manicures, and bridal makeover packages.'
      }
    ],
    beauty_specialist: [
      {
        _id: 'rec_bs1',
        name: 'Aria Vance - Master Aesthetician',
        itemType: 'helper',
        typeLabel: 'Beauty Specialist',
        regularPrice: 550,
        unit: 'session',
        address: 'Rosebank, JHB',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Certified skin specialist focusing on chemical peels, microneedling and anti-aging therapies.'
      },
      {
        _id: 'rec_bs2',
        name: 'Zola Skin & Lash Specialist',
        itemType: 'helper',
        typeLabel: 'Beauty Specialist',
        regularPrice: 450,
        unit: 'session',
        address: 'Centurion',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Advanced lash technician and skincare specialist offering custom eyebrow lamination & glow facials.'
      },
      {
        _id: 'rec_bs3',
        name: 'Dr. Skin Advanced Facialist',
        itemType: 'service',
        typeLabel: 'Beauty Specialist',
        price: 680,
        unit: 'session',
        address: 'Cape Town',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3985338/pexels-photo-3985338.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Clinical facial treatments, acne therapy and targeted hyperpigmentation skin glow routines.'
      },
      {
        _id: 'rec_bs4',
        name: 'Pure Glow Dermatology Specialist',
        itemType: 'helper',
        typeLabel: 'Beauty Specialist',
        regularPrice: 490,
        unit: 'session',
        address: 'Umhlanga, DBN',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/3738339/pexels-photo-3738339.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=beauty',
        description: 'Bespoke aesthetic skincare consultation, hydrafacials and non-invasive body contouring.'
      }
    ],
    resorts: [
      {
        _id: 'rec_res1',
        name: 'Kruger Safari Lodge & Resort',
        itemType: 'property',
        typeLabel: 'Resort',
        price: 1650,
        unit: 'night',
        address: 'Hazyview',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Exclusive resort with game drive packages, swimming pools, spa & luxury thatched chalets.'
      },
      {
        _id: 'rec_res2',
        name: 'Blue Horizon Self-Catering Chalets',
        itemType: 'property',
        typeLabel: 'Self-Catering',
        price: 1200,
        unit: 'night',
        address: 'Ballito, DBN',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Fully equipped beachfront self-catering apartments with private braai area and sea views.'
      },
      {
        _id: 'rec_res3',
        name: 'Mountain Breeze Eco Resort',
        itemType: 'property',
        typeLabel: 'Resort',
        price: 1450,
        unit: 'night',
        address: 'Drakensberg',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Scenic mountain resort featuring hiking trails, self-catering log cabins, horse riding & fireplaces.'
      },
      {
        _id: 'rec_res4',
        name: 'Lakeside Villa Self-Catering Stay',
        itemType: 'property',
        typeLabel: 'Self-Catering',
        price: 1100,
        unit: 'night',
        address: 'Hartbeespoort',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=guesthouse',
        description: 'Modern dam-facing villa with full kitchen, private deck, pool access and water sports nearby.'
      }
    ],
    sneakers: [
      {
        _id: 'rec_snk1',
        name: 'KicksCare Pro Sneaker Spa',
        itemType: 'service',
        typeLabel: 'Sneaker Cleaner',
        price: 150,
        unit: 'pair',
        address: 'Braamfontein',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=sneaker',
        description: 'Deep sneaker restoration, sole unyellowing, suede treatment and protective water repellent coating.'
      },
      {
        _id: 'rec_snk2',
        name: 'FreshSole Sneaker Laundry',
        itemType: 'helper',
        typeLabel: 'Sneaker Cleaner',
        regularPrice: 120,
        unit: 'pair',
        address: 'Polokwane',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=sneaker',
        description: 'Fast turn-around hand wash for designer kicks, Air Jordans, Yeezys and sports shoes.'
      },
      {
        _id: 'rec_snk3',
        name: 'The Sneaker Doctor JHB',
        itemType: 'service',
        typeLabel: 'Sneaker Cleaner',
        price: 180,
        unit: 'pair',
        address: 'Sandton',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=sneaker',
        description: 'Premium restoration studio for rare sneakers including repaint, re-glue and deodorizing bath.'
      },
      {
        _id: 'rec_snk4',
        name: 'CleanKicks Express Wash',
        itemType: 'helper',
        typeLabel: 'Sneaker Cleaner',
        regularPrice: 100,
        unit: 'pair',
        address: 'Hatfield, PTA',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=sneaker',
        description: 'Student friendly sneaker cleaning service with free campus pick-up and drop-off.'
      }
    ],
    tattoo: [
      {
        _id: 'rec_tat1',
        name: 'Ink & Iron Custom Tattoo Studio',
        itemType: 'helper',
        typeLabel: 'Tattoo Artist',
        regularPrice: 650,
        unit: 'hr',
        address: 'Maboneng, JHB',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/2183131/pexels-photo-2183131.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tattoo',
        description: 'Custom realism, fine-line, blackwork and color tattoos by award-winning resident artists.'
      },
      {
        _id: 'rec_tat2',
        name: 'Voodoo Needle Tattoo Art',
        itemType: 'helper',
        typeLabel: 'Tattoo Artist',
        regularPrice: 500,
        unit: 'hr',
        address: 'Pretoria',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tattoo',
        description: 'Sterile custom tattoo work, cover-ups, traditional ink work and piercing services.'
      },
      {
        _id: 'rec_tat3',
        name: 'Black Ink Artistry Cape Town',
        itemType: 'service',
        typeLabel: 'Tattoo Artist',
        price: 750,
        unit: 'hr',
        address: 'Cape Town',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/2183132/pexels-photo-2183132.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tattoo',
        description: 'Bespoke geometric, portrait and botanical tattoos in a clean, private studio atmosphere.'
      },
      {
        _id: 'rec_tat4',
        name: 'Sacred Geometry Tattoo Lab',
        itemType: 'helper',
        typeLabel: 'Tattoo Artist',
        regularPrice: 580,
        unit: 'hr',
        address: 'Durban',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4125633/pexels-photo-4125633.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tattoo',
        description: 'Intricate dotwork, script, and personalized memorial tattoo commissions.'
      }
    ],
    chefs: [
      {
        _id: 'rec_cf1',
        name: 'Chef Thabo Private Dining',
        itemType: 'helper',
        typeLabel: 'Private Chef',
        regularPrice: 450,
        unit: 'hr',
        address: 'Sandton',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=chef',
        description: 'Gourmet 3-course private dinners, anniversary meals and home catering with custom menus.'
      },
      {
        _id: 'rec_cf2',
        name: "Mama B's Traditional Catering",
        itemType: 'service',
        typeLabel: 'Catering Chef',
        price: 300,
        unit: 'hr',
        address: 'Soweto',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=chef',
        description: 'Authentic African cuisine catering for events, weddings, family gatherings and celebrations.'
      },
      {
        _id: 'rec_cf3',
        name: 'Artisan Culinary Chef',
        itemType: 'helper',
        typeLabel: 'Private Chef',
        regularPrice: 550,
        unit: 'hr',
        address: 'Cape Town',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=chef',
        description: 'Fine dining culinary master providing wine pairing experiences and meal-prep plans.'
      },
      {
        _id: 'rec_cf4',
        name: 'Flame & Grill Braai Chef',
        itemType: 'service',
        typeLabel: 'Private Chef',
        price: 380,
        unit: 'hr',
        address: 'Pretoria',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/269606/pexels-photo-269606.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=chef',
        description: 'Professional spit braai & barbecue chef for outdoor parties and corporate functions.'
      }
    ],
    tutors: [
      {
        _id: 'rec_tut1',
        name: 'Dr. Sipho M. - Math & Physics Tutor',
        itemType: 'helper',
        typeLabel: 'Private Tutor',
        regularPrice: 250,
        unit: 'hr',
        address: 'Hatfield, PTA',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/4050312/pexels-photo-4050312.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tutor',
        description: 'PhD qualified tutor offering high school & university level Mathematics and Physical Science lessons.'
      },
      {
        _id: 'rec_tut2',
        name: 'Apex Academy Private Tutoring',
        itemType: 'service',
        typeLabel: 'Private Tutor',
        price: 200,
        unit: 'hr',
        address: 'Rondebosch, CPT',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tutor',
        description: 'Comprehensive tutoring for CAPS & IEB curriculum, exam preparation, and homework support.'
      },
      {
        _id: 'rec_tut3',
        name: 'Bright Minds English & Science',
        itemType: 'helper',
        typeLabel: 'Private Tutor',
        regularPrice: 180,
        unit: 'hr',
        address: 'Johannesburg',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tutor',
        description: 'Patient 1-on-1 language, essay writing and primary school academic booster sessions.'
      },
      {
        _id: 'rec_tut4',
        name: 'Coding & Robotics Youth Tutor',
        itemType: 'service',
        typeLabel: 'Private Tutor',
        price: 300,
        unit: 'hr',
        address: 'Sandton',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=tutor',
        description: 'Interactive STEM tutoring in Python, web development, and robotics for kids & teens.'
      }
    ],
    rental_rooms: [
      {
        _id: 'rec_rr1',
        name: 'Modern Studio Room',
        itemType: 'property',
        typeLabel: 'Rental Room',
        price: 3500,
        unit: 'mo',
        address: 'Braamfontein',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=rental&type=properties',
        description: 'Self-contained studio apartment with private bathroom, fast fiber Wi-Fi and 24/7 security.'
      },
      {
        _id: 'rec_rr2',
        name: 'Furnished En-Suite Room',
        itemType: 'property',
        typeLabel: 'Rental Room',
        price: 4200,
        unit: 'mo',
        address: 'Hatfield, PTA',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=rental&type=properties',
        description: 'Fully furnished private room close to UP campus with laundry facilities and study lounge.'
      },
      {
        _id: 'rec_rr3',
        name: 'Executive Loft Apartment',
        itemType: 'property',
        typeLabel: 'Rental Room',
        price: 5800,
        unit: 'mo',
        address: 'Sandton, JHB',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=rental&type=properties',
        description: 'Upscale loft room with modern finishes, underground parking and gym access.'
      },
      {
        _id: 'rec_rr4',
        name: 'Student Accommodation Room',
        itemType: 'property',
        typeLabel: 'Rental Room',
        price: 2900,
        unit: 'mo',
        address: 'Rondebosch, CPT',
        rating: 4.6,
        imageUrls: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=rental&type=properties',
        description: 'Affordable single room in shared student house near UCT with uncapped internet.'
      }
    ],
    hotels: [
      {
        _id: 'rec_ht1',
        name: 'Grand Royal Hotel Suite',
        itemType: 'property',
        typeLabel: 'Hotel',
        price: 1200,
        unit: 'night',
        address: 'Rosebank',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=hotel',
        description: 'Luxury hotel suite with king bed, city view balcony and buffet breakfast included.'
      },
      {
        _id: 'rec_ht2',
        name: 'Sunset Bay Lodge',
        itemType: 'property',
        typeLabel: 'Hotel',
        price: 950,
        unit: 'night',
        address: 'Umhlanga, DBN',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=hotel',
        description: 'Comfortable hotel room near the beach with swimming pool and rooftop bar.'
      },
      {
        _id: 'rec_ht3',
        name: 'Urban Executive Motel',
        itemType: 'property',
        typeLabel: 'Motel',
        price: 750,
        unit: 'night',
        address: 'Polokwane',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=motel',
        description: 'Clean and convenient overnight stay for travelers with secure parking and aircon.'
      },
      {
        _id: 'rec_ht4',
        name: 'Luxury Vineyard Lodge',
        itemType: 'property',
        typeLabel: 'Hotel',
        price: 1850,
        unit: 'night',
        address: 'Stellenbosch',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=hotel',
        description: 'Picturesque wine estate lodge featuring spa treatments and gourmet dining.'
      }
    ],
    barbers: [
      {
        _id: 'rec_b1',
        name: 'Sipho Zulu - Barber',
        itemType: 'helper',
        typeLabel: 'Barber Shop',
        regularPrice: 180,
        unit: 'cut',
        address: 'Polokwane',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3993311/pexels-photo-3993311.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=barber',
        description: 'Precision fades, beard sculpting and hot towel treatment by master barber Sipho.'
      },
      {
        _id: 'rec_b2',
        name: 'Kasi Blade & Trim Studio',
        itemType: 'helper',
        typeLabel: 'Barber Shop',
        regularPrice: 150,
        unit: 'cut',
        address: 'Soweto',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=barber',
        description: 'Vibrant neighborhood barbershop specializing in hair designs, dye and sharp trims.'
      },
      {
        _id: 'rec_b3',
        name: "Gentleman's Grooming Lounge",
        itemType: 'helper',
        typeLabel: 'Barber Shop',
        regularPrice: 250,
        unit: 'cut',
        address: 'Sandton',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/2068672/pexels-photo-2068672.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=barber',
        description: 'Premium male grooming service including scalp massage, beard oil and complimentary espresso.'
      },
      {
        _id: 'rec_b4',
        name: 'Fresh Cut Barber Hub',
        itemType: 'helper',
        typeLabel: 'Barber Shop',
        regularPrice: 130,
        unit: 'cut',
        address: 'Pretoria',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=barber',
        description: 'Quick & crisp haircuts for students and professionals.'
      }
    ],
    photographers: [
      {
        _id: 'rec_ph1',
        name: 'Lindiwe Lens Studio',
        itemType: 'service',
        typeLabel: 'Photographer',
        price: 850,
        unit: 'hr',
        address: 'Johannesburg',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=photography',
        description: 'Portrait, wedding and event photography with high resolution retouching.'
      },
      {
        _id: 'rec_ph2',
        name: 'Apex Motion Photography',
        itemType: 'service',
        typeLabel: 'Photographer',
        price: 1200,
        unit: 'hr',
        address: 'Cape Town',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/598917/pexels-photo-598917.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=photography',
        description: 'Commercial shoot, drone aerial photography and brand product media.'
      },
      {
        _id: 'rec_ph3',
        name: 'Focus Point Event Media',
        itemType: 'service',
        typeLabel: 'Photographer',
        price: 700,
        unit: 'hr',
        address: 'Durban',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=photography',
        description: 'Birthday, family and corporate event coverage with instant digital gallery.'
      },
      {
        _id: 'rec_ph4',
        name: 'Vivid Moments Studio',
        itemType: 'service',
        typeLabel: 'Photographer',
        price: 950,
        unit: 'hr',
        address: 'Pretoria',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/1484799/pexels-photo-1484799.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=photography',
        description: 'Creative studio portraits, model portfolios and outdoor natural light shoots.'
      }
    ],
    domestic: [
      {
        _id: 'rec_dm1',
        name: 'Nomsa Dlamini Housekeeper',
        itemType: 'helper',
        typeLabel: 'Domestic Cleaner',
        regularPrice: 220,
        unit: 'day',
        address: 'Sandton',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=domestic',
        description: 'Experienced, trustworthy domestic helper for general house cleaning, ironing and organizing.'
      },
      {
        _id: 'rec_dm2',
        name: 'Sparkle Domestic Services',
        itemType: 'service',
        typeLabel: 'Domestic Cleaner',
        price: 180,
        unit: 'day',
        address: 'Midrand',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=cleaning',
        description: 'Deep residential cleaning including kitchen appliances, window washing and floor polishing.'
      },
      {
        _id: 'rec_dm3',
        name: 'Precious Home Helpers',
        itemType: 'helper',
        typeLabel: 'Domestic Cleaner',
        regularPrice: 250,
        unit: 'day',
        address: 'Johannesburg',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=domestic',
        description: 'Friendly home assistant available for daily or weekly home cleaning routines.'
      },
      {
        _id: 'rec_dm4',
        name: 'Trusty Home Helpers',
        itemType: 'helper',
        typeLabel: 'Domestic Cleaner',
        regularPrice: 200,
        unit: 'day',
        address: 'Durban',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4099468/pexels-photo-4099468.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=domestic',
        description: 'Vetted and background-checked domestic cleaners for quick home refresh.'
      }
    ],
    plumbers: [
      {
        _id: 'rec_pl1',
        name: 'FastFlow Emergency Plumber',
        itemType: 'service',
        typeLabel: 'Plumber',
        price: 350,
        unit: 'hr',
        address: 'Randburg',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=plumber',
        description: '24/7 burst pipe repair, geyser installation and unblocking clogged drains.'
      },
      {
        _id: 'rec_pl2',
        name: 'Master Plumber & Pipe Services',
        itemType: 'helper',
        typeLabel: 'Plumber',
        regularPrice: 400,
        unit: 'hr',
        address: 'Pretoria',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/8486972/pexels-photo-8486972.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=plumber',
        description: 'Certified plumbing specialist for bathroom renovations and water pressure optimization.'
      },
      {
        _id: 'rec_pl3',
        name: 'Reliable Leak Repair Specialist',
        itemType: 'service',
        typeLabel: 'Plumber',
        price: 300,
        unit: 'hr',
        address: 'Johannesburg',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/6419125/pexels-photo-6419125.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=plumber',
        description: 'Quick leak detection, tap replacement and septic tank maintenance.'
      },
      {
        _id: 'rec_pl4',
        name: 'Drain & Tap Pro Solutions',
        itemType: 'helper',
        typeLabel: 'Plumber',
        regularPrice: 280,
        unit: 'hr',
        address: 'Centurion',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/8486975/pexels-photo-8486975.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=plumber',
        description: 'Affordable domestic plumbing maintenance and valve installation.'
      }
    ],
    gardeners: [
      {
        _id: 'rec_gd1',
        name: 'GreenThumb Lawn Care',
        itemType: 'helper',
        typeLabel: 'Gardener',
        regularPrice: 200,
        unit: 'day',
        address: 'Roodepoort',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4505168/pexels-photo-4505168.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=gardener',
        description: 'Lawn mowing, tree trimming, flower bed weeding and garden refuse disposal.'
      },
      {
        _id: 'rec_gd2',
        name: 'Verdant Landscaping & Pruning',
        itemType: 'service',
        typeLabel: 'Gardener',
        price: 250,
        unit: 'day',
        address: 'Pretoria',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/4505171/pexels-photo-4505171.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=gardener',
        description: 'Professional garden design, automated irrigation setup and hedge sculpting.'
      },
      {
        _id: 'rec_gd3',
        name: 'Eco Garden Maintenance',
        itemType: 'helper',
        typeLabel: 'Gardener',
        regularPrice: 180,
        unit: 'day',
        address: 'Germiston',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/4503751/pexels-photo-4503751.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=gardener',
        description: 'Weekly yard maintenance and lawn fertilizer treatment.'
      },
      {
        _id: 'rec_gd4',
        name: 'Clean Yard Lawn Services',
        itemType: 'service',
        typeLabel: 'Gardener',
        price: 220,
        unit: 'day',
        address: 'Durban',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4505169/pexels-photo-4505169.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=gardener',
        description: 'Reliable garden care for homes, townhouses and estates.'
      }
    ],
    transport: [
      {
        _id: 'rec_tr1',
        name: 'SafeRide Airport Shuttle',
        itemType: 'service',
        typeLabel: 'Transportation',
        price: 250,
        unit: 'trip',
        address: 'Kempton Park',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=transport',
        description: 'Door-to-door OR Tambo & Lanseria airport transfers in clean air-conditioned vehicles.'
      },
      {
        _id: 'rec_tr2',
        name: 'QuickDrop City Transport',
        itemType: 'service',
        typeLabel: 'Transportation',
        price: 180,
        unit: 'trip',
        address: 'Johannesburg',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=transport',
        description: 'Reliable urban passenger transport and point-to-point drop-offs.'
      },
      {
        _id: 'rec_tr3',
        name: 'VIP Private Chauffeur',
        itemType: 'helper',
        typeLabel: 'Transportation',
        regularPrice: 450,
        unit: 'trip',
        address: 'Sandton',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=transport',
        description: 'Luxury executive driver service for meetings, events and VIP clients.'
      },
      {
        _id: 'rec_tr4',
        name: 'Township Express Shuttle',
        itemType: 'service',
        typeLabel: 'Transportation',
        price: 120,
        unit: 'trip',
        address: 'Soweto',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/163841/pexels-photo-163841.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=transport',
        description: 'Safe daily commuter transfers and group event trips.'
      }
    ],
    logistics: [
      {
        _id: 'rec_lg1',
        name: 'Express Bakkie & Hauling',
        itemType: 'service',
        typeLabel: 'Logistics',
        price: 450,
        unit: 'load',
        address: 'Midrand',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=moving',
        description: 'Prompt bakkie hire with driver for furniture delivery and small home moves.'
      },
      {
        _id: 'rec_lg2',
        name: 'SwiftMove Logistics & Freight',
        itemType: 'service',
        typeLabel: 'Logistics',
        price: 650,
        unit: 'load',
        address: 'Johannesburg',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/6169052/pexels-photo-6169052.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=moving',
        description: 'Full house moving truck service with protective blankets and loading assistants.'
      },
      {
        _id: 'rec_lg3',
        name: 'Reliable Cargo Haulers',
        itemType: 'service',
        typeLabel: 'Logistics',
        price: 400,
        unit: 'load',
        address: 'Pretoria',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/6169046/pexels-photo-6169046.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=moving',
        description: 'Affordable local parcel & equipment transport.'
      },
      {
        _id: 'rec_lg4',
        name: 'Heavy Haul Removal Co.',
        itemType: 'service',
        typeLabel: 'Logistics',
        price: 800,
        unit: 'load',
        address: 'Cape Town',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=moving',
        description: 'Intercity freight moving and large commercial goods haulage.'
      }
    ],
    storage: [
      {
        _id: 'rec_st1',
        name: 'Secure Lock & Store 10m²',
        itemType: 'service',
        typeLabel: 'Storage',
        price: 650,
        unit: 'mo',
        address: 'Polokwane',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/4483608/pexels-photo-4483608.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=storage',
        description: 'Access-controlled private storage unit with 24/7 CCTV monitoring.'
      },
      {
        _id: 'rec_st2',
        name: 'Climate Controlled Storage',
        itemType: 'service',
        typeLabel: 'Storage',
        price: 950,
        unit: 'mo',
        address: 'Midrand',
        rating: 4.8,
        imageUrls: ['https://images.pexels.com/photos/4483609/pexels-photo-4483609.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=storage',
        description: 'Dust-free temperature controlled storage ideal for electronics and valuable furniture.'
      },
      {
        _id: 'rec_st3',
        name: 'Self Storage Mini Units',
        itemType: 'service',
        typeLabel: 'Storage',
        price: 500,
        unit: 'mo',
        address: 'Pretoria',
        rating: 4.7,
        imageUrls: ['https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=storage',
        description: 'Flexible month-to-month storage lockers for personal items and boxes.'
      },
      {
        _id: 'rec_st4',
        name: 'SafeVault Container Storage',
        itemType: 'service',
        typeLabel: 'Storage',
        price: 750,
        unit: 'mo',
        address: 'Cape Town',
        rating: 4.9,
        imageUrls: ['https://images.pexels.com/photos/6169052/pexels-photo-6169052.jpeg?auto=compress&cs=tinysrgb&w=800'],
        route: '/search?category=storage',
        description: 'Heavy duty waterproof container storage for vehicle or bulk equipment.'
      }
    ]
  };

  useEffect(() => {
    const fetchDatabaseItems = async () => {
      try {
        setLoading(true);
        const [propsRes, servRes, helpRes] = await Promise.allSettled([
          fetch('/api/listing/get?limit=50').then(r => r.ok ? r.json() : []),
          fetch('/api/service/get?limit=50').then(r => r.ok ? r.json() : []),
          fetch('/api/helper/get?limit=50').then(r => r.ok ? r.json() : [])
        ]);

        const rawProps = propsRes.status === 'fulfilled' && Array.isArray(propsRes.value) ? propsRes.value : [];
        const rawServices = servRes.status === 'fulfilled' && Array.isArray(servRes.value) ? servRes.value : [];
        const rawHelpers = helpRes.status === 'fulfilled' && Array.isArray(helpRes.value) ? helpRes.value : [];

        // Helper categorizer function to match DB items to category keys
        const matchCategory = (item, type) => {
          const text = `${item.name || ''} ${item.title || ''} ${item.description || ''} ${item.type || ''} ${item.kind || ''} ${item.category || ''} ${item.skills || ''}`.toLowerCase();

          if (type === 'property') {
            if (text.includes('guest house') || text.includes('guesthouse') || text.includes('b&b')) return 'guesthouses';
            if (text.includes('resort') || text.includes('self-catering') || text.includes('self catering') || text.includes('chalet') || text.includes('lodge')) return 'resorts';
            if (item.type === 'over' || text.includes('hotel') || text.includes('motel')) return 'hotels';
            return 'rental_rooms';
          }
          if (text.includes('sneaker') || text.includes('kicks') || text.includes('shoe clean')) return 'sneakers';
          if (text.includes('tattoo') || text.includes('ink') || text.includes('piercing')) return 'tattoo';
          if (text.includes('tutor') || text.includes('teach') || text.includes('lesson') || text.includes('academy')) return 'tutors';
          if (text.includes('beauty specialist') || text.includes('aesthetician') || text.includes('skincare specialist') || text.includes('facialist')) return 'beauty_specialist';
          if (text.includes('beauty') || text.includes('makeup') || text.includes('nails') || text.includes('lashes') || text.includes('salon')) return 'beauty';
          if (text.includes('barber') || text.includes('haircut') || text.includes('grooming')) return 'barbers';
          if (text.includes('photo') || text.includes('camera') || text.includes('media') || text.includes('video')) return 'photographers';
          if (text.includes('chef') || text.includes('catering') || text.includes('cook') || text.includes('culinary')) return 'chefs';
          if (text.includes('domestic') || text.includes('clean') || text.includes('housekeep') || text.includes('nanny') || text.includes('maid')) return 'domestic';
          if (text.includes('plumb') || text.includes('pipe') || text.includes('leak') || text.includes('drain')) return 'plumbers';
          if (text.includes('garden') || text.includes('lawn') || text.includes('landscap') || text.includes('yard')) return 'gardeners';
          if (item.type === 'schoolTransport' || text.includes('transport') || text.includes('shuttle') || text.includes('taxi') || text.includes('chauffeur') || text.includes('ride')) return 'transport';
          if (item.type === 'moving' || text.includes('moving') || text.includes('logistics') || text.includes('hauling') || text.includes('bakkie') || text.includes('freight')) return 'logistics';
          if (item.type === 'storage' || text.includes('storage') || text.includes('vault') || text.includes('container')) return 'storage';

          return type === 'service' ? 'logistics' : 'beauty';
        };

        const categorized = {
          guesthouses: [],
          beauty: [],
          beauty_specialist: [],
          resorts: [],
          sneakers: [],
          tattoo: [],
          chefs: [],
          tutors: [],
          rental_rooms: [],
          hotels: [],
          barbers: [],
          photographers: [],
          domestic: [],
          plumbers: [],
          gardeners: [],
          transport: [],
          logistics: [],
          storage: []
        };

        // Standardize properties from database
        rawProps.forEach(p => {
          const catKey = matchCategory(p, 'property');
          categorized[catKey]?.push({
            _id: p._id,
            name: p.name || p.title,
            itemType: 'property',
            typeLabel: catKey === 'guesthouses' ? 'Guest House' : catKey === 'resorts' ? 'Resort' : catKey === 'hotels' ? (p.kind || 'Hotel') : 'Rental Room',
            price: p.regularPrice || p.price || 0,
            unit: p.period || (catKey === 'rental_rooms' ? 'mo' : 'night'),
            address: p.address || 'South Africa',
            latitude: p.latitude,
            longitude: p.longitude,
            rating: p.rating || 4.8,
            imageUrls: p.imageUrls || [],
            description: p.description || '',
            route: `/listing/${p._id}`
          });
        });

        // Standardize services from database
        rawServices.forEach(s => {
          const catKey = matchCategory(s, 'service');
          const catMeta = COMPARE_CATEGORIES.find(c => c.id === catKey);
          categorized[catKey]?.push({
            _id: s._id,
            name: s.name || s.title,
            itemType: 'service',
            typeLabel: catMeta?.label || 'Service',
            price: s.price || s.regularPrice || s.movePriceVan || s.storagePriceMonth || 0,
            unit: catMeta?.defaultUnit || 'service',
            address: s.address || 'South Africa',
            latitude: s.latitude,
            longitude: s.longitude,
            rating: s.rating || 4.8,
            imageUrls: s.imageUrls || [],
            description: s.description || '',
            route: `/service/${s._id}`
          });
        });

        // Standardize helpers from database
        rawHelpers.forEach(h => {
          const catKey = matchCategory(h, 'helper');
          const catMeta = COMPARE_CATEGORIES.find(c => c.id === catKey);
          categorized[catKey]?.push({
            _id: h._id,
            name: h.name || h.title,
            itemType: 'helper',
            typeLabel: catMeta?.label || 'Helper',
            regularPrice: h.regularPrice || h.price || 0,
            unit: h.period || catMeta?.defaultUnit || 'hr',
            address: h.address || h.location || 'South Africa',
            latitude: h.latitude,
            longitude: h.longitude,
            rating: h.rating || 4.8,
            imageUrls: h.imageUrls || (h.avatar ? [h.avatar] : []),
            description: h.description || '',
            route: `/helper/${h._id}`
          });
        });

        setDbItemsByCategory(categorized);
      } catch (err) {
        console.error('Error fetching database items for comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseItems();
  }, []);

  const activeTabMeta = COMPARE_CATEGORIES.find(c => c.id === activeCategory) || COMPARE_CATEGORIES[0];

  const calculateProximity = (item, idx) => {
    let distance = item._distance;

    if (distance === undefined || distance === Infinity) {
      if (userCoords?.latitude && userCoords?.longitude && item.latitude && item.longitude) {
        distance = calculateDistance(userCoords.latitude, userCoords.longitude, item.latitude, item.longitude);
      } else {
        const targetLoc = userLocationName.toLowerCase();
        const itemLoc = (item.address || item.location || '').toLowerCase();
        if (targetLoc && itemLoc.includes(targetLoc)) {
          distance = 1.2 + (idx * 0.8);
        } else {
          distance = 1.5 + (idx * 1.1);
        }
      }
    }
    return distance;
  };

  const fetchedForCategory = dbItemsByCategory[activeCategory] || [];
  const fallbacksForCategory = FALLBACK_ITEMS[activeCategory] || FALLBACK_ITEMS.guesthouses;
  const rawCandidates = [...fetchedForCategory, ...fallbacksForCategory];
  const hasGpsLocation = Boolean(userCoords?.latitude && userCoords?.longitude);
  const normalizedLocation = userLocationName.trim().toLowerCase();

  const itemsToDisplay = rawCandidates
    .map((item, idx) => ({
      ...item,
      _distance: calculateProximity(item, idx)
    }))
    .sort((a, b) => (a._distance || 0) - (b._distance || 0))
    .slice(0, 4);

  const toggleCompare = (id, e) => {
    e?.stopPropagation();
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Launch comparison popup modal directly
  const handleCompareNowClick = () => {
    let itemsToCompare = itemsToDisplay.filter(item => selectedItems.includes(item._id));
    if (itemsToCompare.length === 0) {
      itemsToCompare = itemsToDisplay.slice(0, 3);
    }
    
    try {
      localStorage.setItem('loopout_compare_list', JSON.stringify(itemsToCompare));
      window.dispatchEvent(new Event('compare_updated'));
    } catch (e) {
      console.error("Error updating local compare list:", e);
    }

    setSlideIndex(0);
    setIsCompareModalOpen(true);
  };

  // Currently active modal items to display in side-by-side comparison popup
  const activeModalItems = itemsToDisplay.filter(i => selectedItems.includes(i._id)).length > 0
    ? itemsToDisplay.filter(i => selectedItems.includes(i._id))
    : itemsToDisplay.slice(0, 3);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="mb-12 relative"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" /> GPS Proximity Comparison
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            COMPARE RECOMMENDED FOR YOU
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
            {itemsToDisplay.length} nearby {itemsToDisplay.length === 1 ? 'option' : 'options'} in <span className="text-rose-600 font-bold">{activeTabMeta.label}</span> near <span className="text-slate-900 font-bold underline decoration-rose-500/40">{userLocationName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {selectedItems.length > 0 && (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {selectedItems.length} selected
            </span>
          )}
          <button
            onClick={handleCompareNowClick}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2"
          >
            <span>Compare Now</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
              {selectedItems.length > 0 ? selectedItems.length : Math.min(itemsToDisplay.length, 3)}
            </span>
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {COMPARE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSelectedItems([]);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all duration-200 border flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-105'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 4 Minimalist & Clean Recommended Cards Grid (Proximity Ranked) */}
      {itemsToDisplay.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <MapPinIcon className="mx-auto mb-3 h-6 w-6 text-rose-500" />
          <p className="font-bold text-slate-800">No {activeTabMeta.label.toLowerCase()} options found near {userLocationName} yet.</p>
          <p className="mt-1 text-sm text-slate-500">Enable location access or try another category to see local results.</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {itemsToDisplay.map((item, idx) => {
          const isSelected = selectedItems.includes(item._id);
          const itemPrice = item.price || item.regularPrice || 0;
          const unit = item.unit || activeTabMeta.defaultUnit;

          return (
            <motion.div
              key={item._id || idx}
              whileHover={{ y: -3 }}
              onClick={() => {
                if (item.route) navigate?.(item.route);
                else if (item._id) navigate?.(`/${item.itemType}/${item._id}`);
              }}
              className={`cursor-pointer rounded-2xl bg-white border transition-all duration-200 overflow-hidden flex flex-col justify-between p-2.5 relative group shadow-sm hover:shadow-md ${
                isSelected ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-2">
                <img
                  src={item.imageUrls?.[0] || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md">
                  <span className="text-[7.5px] font-black text-white uppercase tracking-wider">
                    {item.typeLabel || activeTabMeta.label}
                  </span>
                </div>

                <button
                  onClick={(e) => toggleCompare(item._id, e)}
                  className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-md backdrop-blur-md flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-sm ring-2 ring-white'
                      : 'bg-white/80 text-slate-700 hover:bg-white'
                  }`}
                  title="Select to compare"
                >
                  <span className="text-[10px] font-bold block leading-none">
                    {isSelected ? '✓' : '+'}
                  </span>
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[9px] font-bold text-slate-400 truncate flex items-center gap-1">
                      <MapPinIcon className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </span>
                    <span className="text-[8.5px] font-black text-slate-700 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                      {item._distance ? `${item._distance.toFixed(1)} km` : 'Near'}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 truncate group-hover:text-rose-600 transition-colors">
                    {item.name}
                  </h3>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-black text-slate-900">
                      R{itemPrice?.toLocaleString()}
                    </span>
                    {unit && (
                      <span className="text-[9px] font-semibold text-slate-400">/{unit}</span>
                    )}
                  </div>

                
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Side-Slide Comparison Pop-up Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (() => {
          const totalSlides = activeModalItems.length;
          const clampedIndex = Math.min(slideIndex, Math.max(0, totalSlides - 1));
          const goNext = () => setSlideIndex(i => Math.min(i + 1, totalSlides - 1));
          const goPrev = () => setSlideIndex(i => Math.max(i - 1, 0));
          const currentItem = activeModalItems[clampedIndex];

          if (!currentItem) return null;

          const price = currentItem.price || currentItem.regularPrice || 0;
          const unit = currentItem.unit || activeTabMeta.defaultUnit;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setIsCompareModalOpen(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="relative w-full max-w-lg sm:max-w-xl max-h-[95vh] bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider">
                      {activeTabMeta.emoji} {activeTabMeta.label}
                    </span>
                    <h2 className="text-lg font-black text-gray-900 mt-1 tracking-tight">
                      Compare — {clampedIndex + 1} of {totalSlides}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedItems([]); setIsCompareModalOpen(false); }}
                      className="text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setIsCompareModalOpen(false)}
                      className="w-8 h-8 bg-gray-100 hover:bg-rose-50 hover:text-rose-500 text-gray-600 rounded-full flex items-center justify-center font-bold transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-2 py-3 bg-gray-50/80 border-b border-gray-100 shrink-0">
                  {activeModalItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSlideIndex(idx)}
                      className={`transition-all rounded-full ${
                        idx === clampedIndex
                          ? 'w-5 h-2 bg-rose-500'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Slide Body */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slideIndex}
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -60, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="p-6 space-y-4"
                    >
                      {/* Photo */}
                      <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100">
                        <img
                          src={currentItem.imageUrls?.[0] || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={currentItem.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                          {currentItem.typeLabel || activeTabMeta.label}
                        </div>
                        {currentItem._distance && (
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-slate-800 text-[10px] font-bold shadow flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3 text-rose-500" />
                            {currentItem._distance.toFixed(1)} km away
                          </div>
                        )}
                        <button
                          onClick={() => toggleCompare(currentItem._id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 shadow z-20"
                          title="Remove"
                        >✕</button>
                      </div>

                      {/* Name & Location */}
                      <div>
                        <h3 className="text-xl font-black text-gray-900 leading-snug">{currentItem.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPinIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{currentItem.address || userLocationName}</span>
                        </p>
                      </div>

                      {/* Price & Rating row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rate</span>
                          <span className="text-xl font-black text-gray-900">R{price.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 font-semibold"> /{unit}</span>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                          <span className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Rating</span>
                          <span className="text-xl font-black text-amber-500">★ {currentItem.rating ? Number(currentItem.rating).toFixed(1) : '4.9'}</span>
                          <span className="text-xs text-amber-600 font-semibold block">out of 5</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {currentItem.description || `Top recommended ${activeTabMeta.label.toLowerCase()} with verified service and local availability in ${currentItem.address || userLocationName}.`}
                      </p>

                      {/* Verified Badges */}
                      <div className="flex flex-wrap gap-2">
                        {['Verified Provider', 'Direct Booking', `Near ${userLocationName}`].map(badge => (
                          <span key={badge} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100">
                            ✓ {badge}
                          </span>
                        ))}
                      </div>

                      {/* Database Reviews */}
                      <CompareItemReviews item={currentItem} categoryKey={activeCategory} />

                      {/* Book Button */}
                      <button
                        onClick={() => {
                          setIsCompareModalOpen(false);
                          if (currentItem.route) navigate?.(currentItem.route);
                          else if (currentItem._id) navigate?.(`/${currentItem.itemType}/${currentItem._id}`);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-rose-500/25 active:scale-95"
                      >
                        View Details & Book →
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Prev / Next Footer Navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white shrink-0">
                  <button
                    onClick={goPrev}
                    disabled={clampedIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs font-bold text-gray-400">
                    {clampedIndex + 1} / {totalSlides}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={slideIndex === totalSlides - 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.section>
  );
};
