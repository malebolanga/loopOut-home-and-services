import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Phone, 
  Ticket, 
  CreditCard, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  Star, 
  X,
  Copy,
  Check,
  Building2,
  ArrowRightLeft
} from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

// Live 24-Hour Countdown Component
const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const target = new Date(deadline).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
      isExpired 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 animate-pulse'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      {isExpired ? '24h Window Expired' : `${timeLeft} left to pay`}
    </span>
  );
};

const ShuttleBookingsList = ({ role = 'passenger', currentUser, focusBookingId = '' }) => {
  const [bookings, setBookings] = useState([]);
  const [driverView, setDriverView] = useState('active');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [referralModal, setReferralModal] = useState(null);
  const [focusedBookingId, setFocusedBookingId] = useState('');
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = role === 'driver'
        ? '/api/shuttle-bookings/driver-bookings'
        : '/api/shuttle-bookings/my-bookings';

      const res = await axios.get(resolveApiUrl(endpoint), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load bookings. Please make sure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [role]);

  useEffect(() => {
    if (role !== 'driver' || !focusBookingId || !bookings.some((booking) => String(booking._id) === String(focusBookingId))) return;
    setFocusedBookingId(String(focusBookingId));
    requestAnimationFrame(() => {
      document.querySelector(`[data-booking-id="${String(focusBookingId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [role, focusBookingId, bookings]);

  // Handle Driver Approving
  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await axios.put(resolveApiUrl(`/api/shuttle-bookings/approve/${bookingId}`), {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.data?.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Driver Declining
  const handleDecline = async (bookingId) => {
    const reason = prompt('Reason for declining this request (optional):', 'Seat no longer available');
    if (reason === null) return;

    setActionLoading(bookingId);
    try {
      const res = await axios.put(resolveApiUrl(`/api/shuttle-bookings/decline/${bookingId}`), { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.data?.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not decline booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenReferral = async (booking) => {
    setReferralModal({ booking, options: [], selectedShuttleId: '', loading: true, error: '' });
    try {
      const res = await axios.get(resolveApiUrl(`/api/shuttle-bookings/referral-options/${booking._id}`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      setReferralModal((current) => current ? {
        ...current,
        options: res.data?.shuttles || [],
        loading: false,
      } : current);
    } catch (err) {
      setReferralModal((current) => current ? {
        ...current,
        loading: false,
        error: err.response?.data?.message || 'Could not load matching shuttles.',
      } : current);
    }
  };

  const handleReferBooking = async () => {
    if (!referralModal?.selectedShuttleId) return;
    const { booking, selectedShuttleId } = referralModal;
    setActionLoading(booking._id);
    try {
      const res = await axios.put(resolveApiUrl(`/api/shuttle-bookings/refer/${booking._id}`), {
        shuttleId: selectedShuttleId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      setReferralModal(null);
      alert(res.data?.message || 'Request referred to the other driver.');
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not refer this request.');
    } finally {
      setActionLoading(null);
    }
  };

  const [copiedField, setCopiedField] = useState(null);
  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Driver Confirming Passenger EFT Payment in their bank account
  const handleConfirmPayment = async (booking) => {
    if (!window.confirm(`Confirm that you have received R${booking.totalPrice} from ${booking.passengerName} in your bank account?\n\nThis will mark the seat as paid and issue their official boarding ticket.`)) {
      return;
    }

    setActionLoading(booking._id);
    try {
      const res = await axios.put(resolveApiUrl(`/api/shuttle-bookings/pay/${booking._id}`), {
        paymentMethod: 'Direct EFT / Bank Account Transfer (Confirmed by Driver)'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (res.data?.success) {
        alert('🎉 Payment confirmed! Passenger has been notified and their ticket is now active.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not confirm payment.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportPayment = async (booking) => {
    if (!window.confirm(`Have you already sent R${booking.totalPrice} to the driver's account?\n\nThis tells the driver to check their bank account. Your ticket will not activate until the driver confirms the funds arrived.`)) return;

    setActionLoading(booking._id);
    try {
      const res = await axios.put(resolveApiUrl(`/api/shuttle-bookings/report-payment/${booking._id}`), {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.data?.success) await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not notify the driver about your payment.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Passenger Rating a completed/paid trip
  const [ratingModal, setRatingModal] = useState(null); // { bookingId, selectedStars, review }

  const handleRateTrip = async () => {
    if (!ratingModal || !ratingModal.selectedStars) {
      alert('Please select a star rating (1–5).');
      return;
    }
    setActionLoading(ratingModal.bookingId);
    try {
      const res = await axios.put(resolveApiUrl(`/api/shuttle-bookings/rate/${ratingModal.bookingId}`), {
        rating: ratingModal.selectedStars,
        review: ratingModal.review || '',
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.data?.success) {
        setRatingModal(null);
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit rating.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-500 gap-3">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading shuttle bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center max-w-lg mx-auto">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const activeDriverBookings = bookings.filter((booking) => ['pending_approval', 'approved', 'payment_reported', 'paid'].includes(booking.status));
  const completedDriverBookings = bookings.filter((booking) => booking.status === 'completed');
  const visibleBookings = role === 'driver'
    ? (driverView === 'completed' ? completedDriverBookings : activeDriverBookings)
    : bookings;

  if (bookings.length === 0 || (role === 'driver' && visibleBookings.length === 0)) {
    return (
      <div className="space-y-4">
        {role === 'driver' && (
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
            <button type="button" onClick={() => setDriverView('active')} aria-pressed={driverView === 'active'} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${driverView === 'active' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-teal-200' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'}`}>Active requests ({activeDriverBookings.length})</button>
            <button type="button" onClick={() => setDriverView('completed')} aria-pressed={driverView === 'completed'} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${driverView === 'completed' ? 'bg-gray-300 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'}`}>Trip complete ({completedDriverBookings.length})</button>
          </div>
        )}
      <div className="py-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <Ticket className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
          {role === 'driver' ? (driverView === 'completed' ? 'No completed trips yet' : 'No active requests') : 'No Shuttle Bookings Found'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {role === 'driver'
            ? (driverView === 'completed' ? 'Completed trips will be kept here separately from new requests.' : 'New passenger requests and trips in progress will appear here.')
            : 'Explore inter-provincial or local shuttles, select your bus seats, and request trips with verified drivers.'}
        </p>
      </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-teal-600" />
          <span>{role === 'driver' ? (driverView === 'completed' ? 'Completed Trips' : 'Pickup & Driver Requests') : 'My Shuttle Tickets & Trips'}</span>
          <span className="text-xs text-gray-400 font-normal">({visibleBookings.length})</span>
        </h3>

        <button
          type="button"
          onClick={fetchBookings}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="Refresh bookings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {role === 'driver' && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
          <button type="button" onClick={() => setDriverView('active')} aria-pressed={driverView === 'active'} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${driverView === 'active' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-teal-200' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'}`}>Active requests ({activeDriverBookings.length})</button>
          <button type="button" onClick={() => setDriverView('completed')} aria-pressed={driverView === 'completed'} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${driverView === 'completed' ? 'bg-gray-300 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'}`}>Trip complete ({completedDriverBookings.length})</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleBookings.map((booking) => {
          const shuttle = booking.shuttleRef || {};
          const isPending = booking.status === 'pending_approval';
          const isApproved = booking.status === 'approved';
          const isPaymentReported = booking.status === 'payment_reported';
          const isAwaitingPaymentConfirmation = isApproved || isPaymentReported;
          const isPaid = ['paid', 'completed'].includes(booking.status);
          const isTripCompleted = booking.status === 'completed';
          const isDeclined = booking.status === 'declined';
          const isCancelled = booking.status === 'cancelled';

          return (
            <div
              key={booking._id}
              data-booking-id={booking._id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${isTripCompleted ? 'bg-gray-100 text-gray-600 opacity-75 dark:bg-gray-950 dark:text-gray-400' : 'bg-white dark:bg-gray-900'} ${
                focusedBookingId === String(booking._id)
                  ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-lg shadow-teal-500/10'
                  : isTripCompleted
                  ? 'border-gray-300 dark:border-gray-700 shadow-none'
                  : isPaid
                  ? 'border-emerald-300 dark:border-emerald-900 shadow-md shadow-emerald-500/5'
                  : isAwaitingPaymentConfirmation
                  ? 'border-amber-300 dark:border-amber-900 ring-2 ring-amber-400/20'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div>
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {shuttle.serviceType === 'interprovincial' ? '🛣️ Inter-Provincial' : '📍 Local Shuttle'}
                  </span>

                  {/* Status Indicator */}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      {booking.referralCount > 0
                        ? role === 'driver' ? 'Referred request · awaiting your decision' : 'Referred · waiting for new driver'
                        : 'Pending Driver Approval'}
                    </span>
                  )}

                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Building2 className="w-3.5 h-3.5" />
                      {role === 'passenger' ? 'Approved! Send EFT to Driver' : 'Awaiting EFT Payment'}
                    </span>
                  )}

                  {isPaymentReported && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                      <Clock className="w-3.5 h-3.5" />{role === 'passenger' ? 'Payment reported · waiting for driver' : 'Passenger reports payment sent'}
                    </span>
                  )}

                  {isPaid && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${isTripCompleted ? 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' : 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isTripCompleted ? 'Trip Completed' : 'Confirmed & Paid'}
                    </span>
                  )}

                  {isDeclined && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200">
                      <XCircle className="w-3.5 h-3.5" />
                      Declined
                    </span>
                  )}
                </div>

                {/* Route Header */}
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span>{shuttle.originCity || 'Origin'}</span>
                    <ArrowRight className="w-4 h-4 text-teal-600" />
                    <span>{shuttle.destinationCity || 'Destination'}</span>
                  </h4>

                  <span className="text-base font-black text-teal-600 dark:text-teal-400">
                    R{booking.totalPrice}
                  </span>
                </div>

                {/* Vehicle Specs */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {shuttle.carType} • {shuttle.carColor} • Plate:{' '}
                  <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                    {shuttle.plateNumber}
                  </span>
                </p>

                {/* Seats and Timing */}
                <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs text-gray-700 dark:text-gray-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Seats Reserved:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {booking.seatsBooked} seat(s){' '}
                      {booking.seatNumbers && booking.seatNumbers.length > 0 && `(${booking.seatNumbers.join(', ')})`}
                    </span>
                  </div>

                  {/* Luggage Breakdown */}
                  {booking.extraBagsCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">🧳 Extra Bags:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        +{booking.extraBagsCount} bag{booking.extraBagsCount > 1 ? 's' : ''}{' '}
                        {booking.luggageCharge > 0 && `(R${booking.luggageCharge})`}
                      </span>
                    </div>
                  )}

                  {/* Price breakdown if luggage charged */}
                  {booking.extraBagsCount > 0 && booking.seatCharge > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Seats R{booking.seatCharge} + Luggage R{booking.luggageCharge || 0}</span>
                      <span className="font-black text-teal-600 dark:text-teal-400">= R{booking.totalPrice}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Pickup:</span>
                    <span className="font-medium truncate max-w-[200px]">
                      {booking.pickupLocation || shuttle.pickupStation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">🏠 Dropoff:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]" title={booking.dropoffLocation || shuttle.dropoffStation}>
                      {booking.dropoffLocation || shuttle.dropoffStation || 'House-to-House Dropoff'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Departure:</span>
                    <span className="font-medium">
                      {shuttle.leavesWhenFull !== false ? '⚡ Leaves When Full' : shuttle.departureTime}
                    </span>
                  </div>

                  {role === 'driver' && (
                    <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Passenger:</span>
                      <span className="font-bold">{booking.passengerName} ({booking.passengerPhone})</span>
                    </div>
                  )}
                </div>

                {/* Digital Ticket Code for Paid passengers */}
                {isPaid && (
                  <div className="p-3 mb-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 tracking-wider">
                        Boarding Ticket Code
                      </div>
                      <div className="font-mono text-lg font-black tracking-widest text-teal-900 dark:text-teal-100">
                        {booking.ticketCode}
                      </div>
                    </div>

                    {shuttle.driverPhone && (
                      <a
                        href={`tel:${shuttle.driverPhone}`}
                        className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1.5 text-xs font-bold shadow-md shadow-teal-600/20"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Driver
                      </a>
                    )}
                  </div>
                )}

                {/* 24-Hour Payment Countdown banner if Approved */}
                {isApproved && booking.paymentDeadline && (
                  <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                    <div className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                      Trip accepted by driver!
                    </div>
                    <CountdownTimer deadline={booking.paymentDeadline} />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                {/* Passenger Actions */}
                {role === 'passenger' && (
                  <>
                    {isPending && (
                      <div className="text-xs text-center text-gray-500 py-1 italic">
                        Waiting for driver to accept trip...
                      </div>
                    )}

                    {isApproved && (
                      <div className="space-y-3">
                        {/* Banking Details Card */}
                        {shuttle.bankAccountNumber ? (
                          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 font-black text-blue-800 dark:text-blue-200 uppercase tracking-wide text-[10px]">
                              <Building2 className="w-3.5 h-3.5" />
                              Pay via EFT to Driver's Bank Account
                            </div>
                            {shuttle.bankName && (
                              <div className="flex items-center justify-between">
                                <span className="text-blue-700 dark:text-blue-300">🏦 Bank:</span>
                                <span className="font-bold text-blue-900 dark:text-blue-100">{shuttle.bankName}</span>
                              </div>
                            )}
                            {(shuttle.bankAccountHolder || shuttle.driverName) && (
                              <div className="flex items-center justify-between">
                                <span className="text-blue-700 dark:text-blue-300">👤 Account Holder:</span>
                                <span className="font-bold text-blue-900 dark:text-blue-100">{shuttle.bankAccountHolder || shuttle.driverName}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700 dark:text-blue-300">🔢 Account No:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-blue-900 dark:text-blue-100 tracking-widest">{shuttle.bankAccountNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(shuttle.bankAccountNumber, 'accNum')}
                                  className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition"
                                  title="Copy account number"
                                >
                                  {copiedField === 'accNum' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                            {shuttle.bankBranchCode && (
                              <div className="flex items-center justify-between">
                                <span className="text-blue-700 dark:text-blue-300">🏢 Branch Code:</span>
                                <span className="font-mono font-bold text-blue-900 dark:text-blue-100">{shuttle.bankBranchCode}</span>
                              </div>
                            )}
                            {shuttle.bankAccountType && (
                              <div className="flex items-center justify-between">
                                <span className="text-blue-700 dark:text-blue-300">💳 Account Type:</span>
                                <span className="font-bold text-blue-900 dark:text-blue-100 capitalize">{shuttle.bankAccountType}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700 dark:text-blue-300">📝 Reference:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-blue-900 dark:text-blue-100">{shuttle.bankReference || booking.ticketCode}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(shuttle.bankReference || booking.ticketCode, 'ref')}
                                  className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition"
                                  title="Copy reference"
                                >
                                  {copiedField === 'ref' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[10px] text-blue-800 dark:text-blue-200 font-semibold">
                              💡 Once you've made the EFT, the driver will confirm receipt on LoopOut and your ticket will be ready.
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                            <p className="font-bold mb-1">💳 Payment Instructions</p>
                            <p>Contact the driver directly at <a href={`tel:${shuttle.driverPhone}`} className="underline font-bold">{shuttle.driverPhone}</a> for banking details to pay R{booking.totalPrice}.</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleReportPayment(booking)}
                          disabled={actionLoading === booking._id}
                          className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {actionLoading === booking._id ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          I sent the EFT · notify driver
                        </button>
                        <p className="text-[10px] text-center text-gray-500">The driver checks their bank account and confirms before your ticket activates.</p>
                      </div>
                    )}

                    {isPaymentReported && role === 'passenger' && (
                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100">
                        You reported that you sent the EFT. The driver has been notified and must confirm the funds arrived before your ticket is activated.
                      </div>
                    )}

                    {isPaid && (
                      <div className="space-y-2">
                        <div className="text-xs text-center text-emerald-600 font-bold py-1">
                          {isTripCompleted ? '✓ Trip completed. Thank you for travelling with us.' : '✓ Ready to Board. Present ticket code to driver at pickup.'}
                        </div>
                        {/* Rating is available after the driver completes the trip. */}
                        {isTripCompleted && !booking.passengerRating && (
                          <button
                            type="button"
                            onClick={() => setRatingModal({ bookingId: booking._id, selectedStars: 0, review: '' })}
                            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center gap-2 transition"
                          >
                            <Star className="w-4 h-4 text-amber-500" />
                            <span>Rate Your Driver</span>
                          </button>
                        )}
                        {/* Show submitted rating */}
                        {booking.passengerRating && (
                          <div className="flex items-center justify-center gap-1 py-1 text-xs text-amber-600 font-bold">
                            {[1,2,3,4,5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${s <= booking.passengerRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="ml-1 text-gray-500 font-normal">You rated {booking.passengerRating}★</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Driver Desk Actions */}
                {role === 'driver' && (
                  <>
                    {isPending && (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDecline(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 transition"
                        >
                          Decline
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenReferral(booking)}
                          disabled={actionLoading === booking._id || (booking.referralCount || 0) >= 3}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 transition disabled:opacity-50"
                        >
                          Refer
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    )}

                    {isAwaitingPaymentConfirmation && (
                      <div className="space-y-2.5">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                          <p className="text-amber-800 dark:text-amber-200 font-bold">{isPaymentReported ? '⚠️ Passenger reports EFT sent — check your bank account' : '⏳ Waiting for EFT payment from passenger'}</p>
                          <p className="text-amber-700 dark:text-amber-300">
                            👤 <strong>{booking.passengerName}</strong>
                            {booking.passengerPhone && (
                              <> — <a href={`tel:${booking.passengerPhone}`} className="underline font-bold">{booking.passengerPhone}</a></>
                            )}
                          </p>
                          <p className="text-amber-700 dark:text-amber-300">
                            💰 {isPaymentReported ? 'Reported amount:' : 'Amount due:'} <strong>R{booking.totalPrice}</strong>
                          </p>
                          {isPaymentReported && booking.paymentReportedAt && <p className="text-amber-700 dark:text-amber-300">Reported: {new Date(booking.paymentReportedAt).toLocaleString('en-ZA')}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(booking)}
                          disabled={actionLoading === booking._id}
                          className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {actionLoading === booking._id ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>{isPaymentReported ? '✅ Confirm EFT Payment Received' : 'Confirm EFT Payment Received'}</span>
                        </button>
                        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 italic">
                          Only confirm after you see the EFT in your bank account
                        </p>
                      </div>
                    )}

                    {isPaid && (
                      <div className="text-xs text-center text-emerald-600 font-bold py-1 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {isTripCompleted ? 'Trip completed' : 'Passenger Paid & Confirmed'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Refer Request Modal ─────────────────────────────────── */}
      {referralModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setReferralModal(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">Refer this request</h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose an available shuttle on the same route, date and fare. The new driver must accept it.</p>
              </div>
              <button type="button" onClick={() => setReferralModal(null)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close referral dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-[55vh] overflow-y-auto">
              {referralModal.loading ? (
                <p className="py-8 text-center text-sm text-gray-500">Finding matching shuttles…</p>
              ) : referralModal.error ? (
                <p className="py-6 text-center text-sm text-rose-600">{referralModal.error}</p>
              ) : referralModal.options.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No available shuttle matches this route, date and fare right now.</p>
              ) : referralModal.options.map((option) => (
                <button
                  key={option._id}
                  type="button"
                  onClick={() => setReferralModal((current) => ({ ...current, selectedShuttleId: option._id }))}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    referralModal.selectedShuttleId === option._id
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20 dark:bg-teal-950/30'
                      : 'border-gray-200 hover:border-teal-300 dark:border-gray-700 dark:hover:border-teal-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{option.driverName || 'LoopOut driver'}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{option.carType} · {option.carColor} · {option.plateNumber}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{option.availableSeats} seats</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Same route and fare · R{option.pricePerSeat} per seat</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setReferralModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
              <button
                type="button"
                onClick={handleReferBooking}
                disabled={!referralModal.selectedShuttleId || referralModal.loading || actionLoading === referralModal.booking._id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Refer request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rate Trip Modal ──────────────────────────────────────── */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Rate Your Trip
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setRatingModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                How was your journey? Your rating directly updates the driver's verified score on the live radar.
              </p>

              {/* 5 Interactive Stars */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingModal({ ...ratingModal, selectedStars: star })}
                    className="p-1 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (ratingModal.selectedStars || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {ratingModal.selectedStars > 0 && (
                <div className="text-sm font-bold text-amber-500 mb-4">
                  {ratingModal.selectedStars === 5 && '🌟 Excellent / 5 Stars'}
                  {ratingModal.selectedStars === 4 && '👍 Great Service / 4 Stars'}
                  {ratingModal.selectedStars === 3 && '👌 Good Trip / 3 Stars'}
                  {ratingModal.selectedStars === 2 && '⚠️ Fair / 2 Stars'}
                  {ratingModal.selectedStars === 1 && '👎 Poor / 1 Star'}
                </div>
              )}

              {/* Optional Text Review */}
              <textarea
                value={ratingModal.review || ''}
                onChange={(e) => setRatingModal({ ...ratingModal, review: e.target.value })}
                placeholder="Write a brief comment about the driver, punctuality, or car comfort (optional)..."
                rows="3"
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setRatingModal(null)}
                disabled={actionLoading === ratingModal.bookingId}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRateTrip}
                disabled={actionLoading === ratingModal.bookingId || !ratingModal.selectedStars}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                  ratingModal.selectedStars
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20 hover:brightness-105 active:scale-95'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {actionLoading === ratingModal.bookingId ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Submit Rating</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShuttleBookingsList;
