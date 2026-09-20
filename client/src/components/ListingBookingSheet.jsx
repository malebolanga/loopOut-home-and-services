import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  HomeModernIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import {
  FaWhatsapp,
  FaShieldAlt,
  FaSpinner,
  FaHome,
  FaCoffee,
  FaUsers,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { pushPhoneNotification } from './PhoneNotificationManager';

export default function ListingBookingSheet({
  isOpen,
  onClose,
  listing,
  bookedDates = [],
  initialDates = {}
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [step, setStep] = useState(1);

  const [bookingDetails, setBookingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    selectedUnit: '',
    breakfast: false,
    specialRequests: '',
    pets: false,
    selectedDate: '',
    startTime: '09:00',
    endTime: '17:00',
    inquiryType: 'Schedule a Viewing',
    viewingDate: '',
    viewingTime: '10:00',
    leaseDuration: '12 Months',
    occupantsCount: '1'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEscrowLoading, setIsEscrowLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      if (initialDates) {
        setBookingDetails(prev => ({
          ...prev,
          fullName: currentUser?.name || currentUser?.username || prev.fullName,
          email: currentUser?.email || prev.email,
          phone: currentUser?.phone || prev.phone,
          checkIn: initialDates.checkIn || prev.checkIn,
          checkOut: initialDates.checkOut || prev.checkOut,
          selectedDate: initialDates.selectedDate || prev.selectedDate,
          startTime: initialDates.startTime || prev.startTime,
          endTime: initialDates.endTime || prev.endTime,
          selectedUnit: initialDates.selectedUnit || prev.selectedUnit || ''
        }));
      }
    }
  }, [isOpen, initialDates, currentUser]);

  if (!isOpen || !listing) return null;

  const propertyType = listing?.type || 'over';
  const isDailyStay = ['over', 'hotel', 'land', 'resort', 'guesthouse', 'self_catering', 'holiday_park', 'sale'].includes(propertyType);
  const isHourlyRoom = propertyType === 'office' || propertyType === 'hourly_room' || propertyType === 'room_hourly';
  const isRent = propertyType === 'rent' || propertyType === 'apartment';

  const calculateDays = () => {
    if (!isDailyStay) return 0;
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 0;
    const checkIn = new Date(bookingDetails.checkIn);
    const checkOut = new Date(bookingDetails.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const calculateHours = () => {
    if (!isHourlyRoom) return 0;
    const [startHour, startMinute] = bookingDetails.startTime.split(':').map(Number);
    const [endHour, endMinute] = bookingDetails.endTime.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    if (endInMinutes <= startInMinutes) return 0;
    return (endInMinutes - startInMinutes) / 60;
  };

  const days = calculateDays();
  const hours = calculateHours();

  const calculateTotalPrice = () => {
    const selectedRoomObj = listing?.roomTypes?.find(r => r.name === bookingDetails.selectedUnit);
    const unitPrice = selectedRoomObj?.price ? Number(selectedRoomObj.price) : (listing?.regularPrice || 0);

    if (isDailyStay) {
      if (days === 0) return 0;
      const basePrice = unitPrice * days * (Number(bookingDetails.rooms) || 1);
      const breakfastPrice = bookingDetails.breakfast ? 150 * days * (Number(bookingDetails.guests) || 1) : 0;
      const extraGuestFee = (Number(bookingDetails.guests) || 1) > 2 ? ((Number(bookingDetails.guests) || 1) - 2) * 200 * days : 0;
      return basePrice + breakfastPrice + extraGuestFee;
    }

    if (isHourlyRoom) {
      if (hours === 0) return 0;
      return unitPrice * hours;
    }

    return unitPrice;
  };

  const totalPrice = calculateTotalPrice();

  const formatPhoneNumberForWhatsApp = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '27' + digits.substring(1);
    return digits;
  };

  const getHostPhone = () => {
    return listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
  };

  const generateTimeOptions = (isEnd = false) => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBooked = bookedDates.some(range => {
          if (!isHourlyRoom) return false;
          const start = new Date(range.start);
          const end = new Date(range.end);
          const currentCheck = new Date(bookingDetails.selectedDate);
          currentCheck.setHours(hour, minute, 0, 0);
          return currentCheck >= start && currentCheck < (isEnd ? end : end);
        });

        if (!isBooked) times.push(timeString);
      }
    }
    return times;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    const newErrors = {};

    if (step === 1) {
      if (!bookingDetails.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!bookingDetails.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9+\-\s()]{10,}$/.test(String(bookingDetails.phone).replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!bookingDetails.email?.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (isDailyStay) {
        if (!bookingDetails.checkIn) {
          newErrors.checkIn = 'Check-in date is required';
        }
        if (!bookingDetails.checkOut) {
          newErrors.checkOut = 'Check-out date is required';
        } else if (bookingDetails.checkIn && bookingDetails.checkOut) {
          const checkIn = new Date(bookingDetails.checkIn);
          const checkOut = new Date(bookingDetails.checkOut);
          if (checkOut <= checkIn) {
            newErrors.checkOut = 'Check-out must be after check-in';
          } else {
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            const hasOverlap = bookedDates.some(range => {
              const start = new Date(range.start);
              const end = new Date(range.end);
              start.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);
              return checkIn < end && checkOut > start;
            });
            if (hasOverlap) {
              newErrors.checkIn = 'The selected dates are already occupied. Please choose other dates.';
            }
          }
        }
      }

      if (isHourlyRoom) {
        if (!bookingDetails.selectedDate) {
          newErrors.selectedDate = 'Date is required';
        } else if (bookingDetails.startTime && bookingDetails.endTime) {
          const [sH, sM] = bookingDetails.startTime.split(':').map(Number);
          const [eH, eM] = bookingDetails.endTime.split(':').map(Number);
          const startDt = new Date(bookingDetails.selectedDate);
          startDt.setHours(sH, sM, 0, 0);
          const endDt = new Date(bookingDetails.selectedDate);
          endDt.setHours(eH, eM, 0, 0);

          if (endDt <= startDt) {
            newErrors.endTime = 'End time must be after start time';
          }

          const hasOverlap = bookedDates.some(range => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            return startDt < end && endDt > start;
          });

          if (hasOverlap) {
            newErrors.selectedDate = 'This time slot is already booked. Please choose an available time.';
          }
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setStep(prev => Math.min(3, prev + 1));
  };

  const handleWhatsAppBooking = async () => {
    setIsSubmitting(true);
    const hostPhone = getHostPhone();

    if (!hostPhone) {
      alert('Host contact information is not currently available');
      setIsSubmitting(false);
      return;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const formatDate = (dateString) => {
      if (!dateString) return 'Not specified';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const clientPhone = bookingDetails.phone ? formatPhoneNumberForWhatsApp(bookingDetails.phone) : '';
    const unitTag = bookingDetails.selectedUnit ? ` (${bookingDetails.selectedUnit})` : '';
    const acceptMessage = `Accept the booking for ${bookingDetails.fullName}, I accept your request for ${listing.name}${unitTag} on ${isDailyStay ? formatDate(bookingDetails.checkIn) : formatDate(bookingDetails.selectedDate)}. See you then!`;
    const declineMessage = `Decline the booking for ${bookingDetails.fullName}, I'm unable to accept request for ${listing.name}${unitTag} on ${isDailyStay ? formatDate(bookingDetails.checkIn) : formatDate(bookingDetails.selectedDate)}. Can we try another time?`;
    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : null;
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : null;

    let message = '';
    if (isDailyStay) {
      const typeTitle = propertyType === 'resort' ? '🏖️ RESORT & HOLIDAY PARK BOOKING' : propertyType === 'hotel' ? '🏨 HOTEL & LODGE BOOKING' : propertyType === 'land' ? '🏡 SELF-CATERING BOOKING' : '🛌 GUEST HOUSE & B&B BOOKING';
      message = `*${typeTitle}*\n\n`;
      message += `🏨 *Property:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) message += `🚪 *Apartment / Room:* ${bookingDetails.selectedUnit}\n`;
      message += `📍 *Location:* ${listing?.address}\n`;
      message += `👤 *Guest:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      message += `👥 *Occupancy:* ${bookingDetails.guests} Guest(s), ${bookingDetails.rooms} Room(s)\n`;
      message += `➡️ *Check-in:* ${formatDate(bookingDetails.checkIn)}\n`;
      message += `⬅️ *Check-out:* ${formatDate(bookingDetails.checkOut)}\n`;
      message += `⏳ *Duration:* ${days} Day(s)\n`;
      message += `💵 *TOTAL: R${totalPrice.toLocaleString()}*\n\n`;
      if (acceptLink) message += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
      if (declineLink) message += `❌ *REJECT:*\n${declineLink}\n\n`;
      message += `🔐 *Verification Code:* \`${verificationCode}\`\n_Sent via loopOut_`;
    } else if (isHourlyRoom) {
      message = `*🚪 ROOM PER HOUR BOOKING ⏰*\n\n`;
      message += `🚪 *Space:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) message += `🚪 *Room / Suite:* ${bookingDetails.selectedUnit}\n`;
      message += `📍 *Location:* ${listing?.address}\n`;
      message += `👤 *Client:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      message += `📅 *Date:* ${formatDate(bookingDetails.selectedDate)}\n`;
      message += `⏰ *Time:* ${bookingDetails.startTime} - ${bookingDetails.endTime} (${hours.toFixed(1)} hrs)\n`;
      message += `💵 *TOTAL: R${totalPrice.toLocaleString()}*\n\n`;
      if (acceptLink) message += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
      if (declineLink) message += `❌ *REJECT:*\n${declineLink}\n\n`;
      message += `🔐 *Verification Code:* \`${verificationCode}\`\n_Sent via loopOut_`;
    } else {
      message = `*🏠 PROPERTY RENTAL INQUIRY 🏠*\n\n`;
      message += `🏠 *Property:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) message += `🚪 *Unit:* ${bookingDetails.selectedUnit}\n`;
      message += `📍 *Location:* ${listing?.address}\n`;
      message += `👤 *Prospect:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      if (bookingDetails.viewingDate) message += `📅 *Preferred Viewing:* ${formatDate(bookingDetails.viewingDate)} at ${bookingDetails.viewingTime || '10:00'}\n`;
      if (bookingDetails.leaseDuration) message += `⏳ *Lease Term:* ${bookingDetails.leaseDuration}\n`;
      message += `💰 *Monthly Rent:* R${listing?.regularPrice?.toLocaleString()}/month\n\n`;
      if (acceptLink) message += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
      if (declineLink) message += `❌ *REJECT:*\n${declineLink}\n\n`;
      message += `🔐 *Verification Code:* \`${verificationCode}\`\n_Sent via loopOut_`;
    }

    if (!currentUser) {
      alert('Please sign in to make a reservation.');
      setIsSubmitting(false);
      return;
    }

    let savedBookingId = null;
    try {
      let startDateStr = '';
      let endDateStr = '';

      if (isDailyStay) {
        startDateStr = bookingDetails.checkIn;
        endDateStr = bookingDetails.checkOut;
      } else if (isHourlyRoom) {
        startDateStr = bookingDetails.selectedDate + 'T' + bookingDetails.startTime;
        endDateStr = bookingDetails.selectedDate + 'T' + bookingDetails.endTime;
      } else {
        const todayObj = new Date();
        const tomorrowObj = new Date(Date.now() + 24 * 3600 * 1000);
        startDateStr = todayObj.toISOString().split('T')[0];
        endDateStr = tomorrowObj.toISOString().split('T')[0];
      }

      const bookingPayload = {
        listingId: listing._id,
        startDate: startDateStr,
        endDate: endDateStr,
        phone: bookingDetails.phone,
        message: `${bookingDetails.selectedUnit ? `[Unit: ${bookingDetails.selectedUnit}] ` : ''}${bookingDetails.specialRequests || ''}`.trim(),
        subtype: bookingDetails.selectedUnit || undefined,
        numberOfGuests: Number(bookingDetails.guests) || 1
      };

      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.token || currentUser?.access_token;
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(bookingPayload)
      });

      if (!bookingRes.ok) {
        const errData = await bookingRes.json().catch(() => ({}));
        alert(errData.error || 'Could not process the booking. Please check details or select another date.');
        setIsSubmitting(false);
        return;
      }

      pushPhoneNotification({
        title: '🎉 Booking Request Sent',
        message: `Your reservation for ${listing?.name || 'Listing'} has been submitted! Check notifications for updates.`,
        type: 'success',
        link: '/notifications'
      });

      const bookingResult = await bookingRes.json();
      savedBookingId = bookingResult.booking?._id;
    } catch (saveError) {
      console.error('Failed to save booking to database:', saveError);
    }

    if (savedBookingId) {
      message += `\n\n[Booking Ref: ${savedBookingId}]`;
    }

    const whatsappNumber = formatPhoneNumberForWhatsApp(hostPhone);
    const whatsappFinalUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappFinalUrl, '_blank');

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const handleEscrow = async () => {
    if (!currentUser) {
      alert('Please sign in to proceed with Escrow checkout.');
      return;
    }

    try {
      setIsEscrowLoading(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          amount: totalPrice || listing.regularPrice,
          name: currentUser.username || currentUser.name,
          email: currentUser.email,
          serviceId: listing._id,
          providerName: listing.name
        })
      });
      const data = await res.json();
      if (data.success && data.payfast) {
        window.location.href = data.payfast.url;
      } else {
        alert(data.message || 'Escrow initialization failed. Please try again or use WhatsApp booking.');
      }
    } catch (err) {
      console.error('Escrow checkout error:', err);
      alert('Could not start Escrow checkout. Please try again.');
    } finally {
      setIsEscrowLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <motion.div
        key="listing-sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          key="listing-sheet-content"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Mobile Drag Indicator */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Sheet Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={step > 1 ? () => setStep(prev => prev - 1) : onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {step > 1 ? (
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight truncate max-w-[220px] sm:max-w-xs">
                  Reserve {listing.name}
                </h2>
                <p className="text-[11px] text-gray-400 font-semibold">
                  Section {step} of 3 · {step === 1 ? 'Contact & Schedule' : step === 2 ? 'Room & Preferences' : 'Breakdown & Reserve'}
                </p>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(num => (
                <div
                  key={num}
                  className={`h-2 rounded-full transition-all ${
                    step === num
                      ? 'w-6 bg-rose-500'
                      : step > num
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-gray-200 dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sheet Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* ── SECTION 1: Contact Info & Schedule ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">1. Guest Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={bookingDetails.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Sarah Jenkins"
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none ${errors.fullName ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                      />
                      {errors.fullName && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={bookingDetails.phone}
                          onChange={handleChange}
                          placeholder="e.g. 082 123 4567"
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none ${errors.phone ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {errors.phone && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={bookingDetails.email}
                          onChange={handleChange}
                          placeholder="sarah@example.com"
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none ${errors.email ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.email}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Stays Dates */}
                {isDailyStay && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">2. Reservation Dates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Check-in Date *</label>
                        <input
                          type="date"
                          name="checkIn"
                          value={bookingDetails.checkIn}
                          onChange={handleChange}
                          min={today}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none ${errors.checkIn ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {errors.checkIn && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.checkIn}</p>}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Check-out Date *</label>
                        <input
                          type="date"
                          name="checkOut"
                          value={bookingDetails.checkOut}
                          onChange={handleChange}
                          min={bookingDetails.checkIn || today}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none ${errors.checkOut ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {errors.checkOut && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.checkOut}</p>}
                      </div>
                    </div>

                    {days > 0 && (
                      <div className="mt-3 p-3 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Total Stay Duration:</span>
                        </div>
                        <span className="font-black text-xs text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-xl">
                          {days} Day{days > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hourly Room Schedule */}
                {isHourlyRoom && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">2. Hourly Session Schedule</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Session Date *</label>
                        <input
                          type="date"
                          name="selectedDate"
                          value={bookingDetails.selectedDate}
                          onChange={handleChange}
                          min={today}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none ${errors.selectedDate ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {errors.selectedDate && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.selectedDate}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                          <select
                            name="startTime"
                            value={bookingDetails.startTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            {generateTimeOptions().map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                          <select
                            name="endTime"
                            value={bookingDetails.endTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            {generateTimeOptions(true).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {hours > 0 && (
                        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
                            <ClockIcon className="w-4 h-4" />
                            <span>Session Length:</span>
                          </div>
                          <span className="font-black text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-xl">
                            {hours.toFixed(1)} Hour(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rental Viewing Inquiry */}
                {isRent && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">2. Viewing Appointment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Preferred Viewing Date</label>
                        <input
                          type="date"
                          name="viewingDate"
                          value={bookingDetails.viewingDate}
                          onChange={handleChange}
                          min={today}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Preferred Time</label>
                        <select
                          name="viewingTime"
                          value={bookingDetails.viewingTime}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION 2: Room, Units & Preferences ── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Unit Selection */}
                {listing.roomTypes && listing.roomTypes.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">Select Room / Unit</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingDetails(prev => ({ ...prev, selectedUnit: '' }))}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${!bookingDetails.selectedUnit ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Any Available Room / Unit</div>
                          <p className="text-[10px] text-gray-500">Fastest host confirmation</p>
                        </div>
                        <span className="text-xs font-black text-rose-600">R{listing.regularPrice}/day</span>
                      </button>

                      {listing.roomTypes.map((room, idx) => {
                        const isSelected = bookingDetails.selectedUnit === room.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBookingDetails(prev => ({ ...prev, selectedUnit: room.name }))}
                            className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${isSelected ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20 shadow-sm' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                          >
                            <div>
                              <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                                <span>🚪</span>
                                <span>{room.name}</span>
                              </div>
                              <p className="text-[10px] text-gray-500">
                                {room.capacity ? `Max ${room.capacity} Guests` : 'Standard Suite'}
                              </p>
                            </div>
                            <span className="text-xs font-black text-rose-600">
                              R{room.price ? Number(room.price).toLocaleString() : listing.regularPrice}/day
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Apartment / Room Preference (Optional)</label>
                    <input
                      type="text"
                      name="selectedUnit"
                      value={bookingDetails.selectedUnit}
                      onChange={handleChange}
                      placeholder="e.g. Room 101, Penthouse Suite..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Occupancy & Rooms */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">Occupancy Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Number of Guests</label>
                      <select
                        name="guests"
                        value={bookingDetails.guests}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                          <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {isDailyStay ? (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Number of Rooms</label>
                        <select
                          name="rooms"
                          value={bookingDetails.rooms}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Target Lease Term</label>
                        <select
                          name="leaseDuration"
                          value={bookingDetails.leaseDuration}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          <option value="6 Months">6 Months</option>
                          <option value="12 Months">12 Months (Standard)</option>
                          <option value="24 Months">24 Months</option>
                          <option value="Month-to-month">Month-to-month</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add-ons & Amenities */}
                {isDailyStay && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">Add-ons & Extras</h3>
                    
                    <button
                      type="button"
                      onClick={() => setBookingDetails(prev => ({ ...prev, breakfast: !prev.breakfast }))}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${bookingDetails.breakfast ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20' : 'border-gray-200 dark:border-gray-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">☕</span>
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Include Daily Breakfast</div>
                          <p className="text-[10px] text-gray-500">Chef-prepared gourmet breakfast daily</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-600">+R150/guest/day</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingDetails(prev => ({ ...prev, pets: !prev.pets }))}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${bookingDetails.pets ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐾</span>
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Bringing Pets</div>
                          <p className="text-[10px] text-gray-500">Subject to host house rules</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400">Request Approval</span>
                    </button>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Special Requests / Notes to Host</label>
                  <textarea
                    name="specialRequests"
                    value={bookingDetails.specialRequests}
                    onChange={handleChange}
                    rows="2"
                    placeholder="e.g. Late check-in, ground floor room, parking space..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── SECTION 3: Pricing Breakdown & Reserve ── */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-slate-900 rounded-3xl p-5 text-white space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                    <span>Property</span>
                    <span className="text-white font-black truncate max-w-[200px]">{listing?.name}</span>
                  </div>

                  {isDailyStay && bookingDetails.checkIn && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Stay Dates</span>
                      <span className="text-white font-black">
                        {bookingDetails.checkIn} to {bookingDetails.checkOut} ({days}D)
                      </span>
                    </div>
                  )}

                  {isHourlyRoom && bookingDetails.selectedDate && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Session Time</span>
                      <span className="text-white font-black">
                        {bookingDetails.selectedDate} @ {bookingDetails.startTime} - {bookingDetails.endTime}
                      </span>
                    </div>
                  )}

                  {bookingDetails.selectedUnit && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Room / Unit</span>
                      <span className="text-rose-400 font-black">{bookingDetails.selectedUnit}</span>
                    </div>
                  )}

                  {isDailyStay && (
                    <div className="space-y-1.5 py-1 text-xs text-slate-300">
                      <div className="flex justify-between items-center">
                        <span>Base Stay ({days} days × {bookingDetails.rooms || 1} room)</span>
                        <span>R{(listing.regularPrice * days * (Number(bookingDetails.rooms) || 1)).toLocaleString()}</span>
                      </div>
                      {bookingDetails.breakfast && (
                        <div className="flex justify-between items-center text-amber-300">
                          <span>Breakfast Plan</span>
                          <span>+R{(150 * bookingDetails.guests * days).toLocaleString()}</span>
                        </div>
                      )}
                      {bookingDetails.guests > 2 && (
                        <div className="flex justify-between items-center text-blue-300">
                          <span>Extra Guest Fee</span>
                          <span>+R{(200 * (bookingDetails.guests - 2) * days).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Estimated Total</span>
                    <span className="text-2xl font-black text-rose-400">R{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsAppBooking}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin text-lg" />
                        Connecting via WhatsApp...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="text-xl" />
                        Reserve via WhatsApp
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleEscrow}
                    disabled={isEscrowLoading}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isEscrowLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        Starting Escrow...
                      </>
                    ) : (
                      <>
                        <FaShieldAlt className="text-sm text-indigo-500" />
                        Secure Escrow Checkout
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 font-bold text-center italic bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl py-2 px-3">
                  ⚠️ Never pay cash before confirmation. Avoid scams with loopOut Escrow!
                </p>
              </div>
            )}
          </div>

          {/* Sheet Footer Navigation */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
              >
                Next Step →
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
