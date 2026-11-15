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
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

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

const ShuttleBookingsList = ({ role = 'passenger', currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = role === 'driver'
        ? '/api/shuttle-bookings/driver-bookings'
        : '/api/shuttle-bookings/my-bookings';

      const res = await axios.get(endpoint, {
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

  // Handle Driver Approving
  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await axios.put(`/api/shuttle-bookings/approve/${bookingId}`, {}, {
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
      const res = await axios.put(`/api/shuttle-bookings/decline/${bookingId}`, { reason }, {
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

  // Handle Passenger Paying within 24 hours
  const handlePay = async (bookingId) => {
    if (!window.confirm('Confirm payment to lock in your seat and generate your official boarding ticket?')) {
      return;
    }

    setActionLoading(bookingId);
    try {
      const res = await axios.put(`/api/shuttle-bookings/pay/${bookingId}`, {
        paymentMethod: 'Instant LoopPay Card / EFT'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (res.data?.success) {
        alert('🎉 Payment confirmed! Your digital boarding pass is issued.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed.');
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

  if (bookings.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <Ticket className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
          {role === 'driver' ? 'No Passenger Requests Yet' : 'No Shuttle Bookings Found'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {role === 'driver'
            ? 'When passengers reserve seats on your shuttles, their requests will appear here for your approval.'
            : 'Explore inter-provincial or local shuttles, select your bus seats, and request trips with verified drivers.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-teal-600" />
          <span>{role === 'driver' ? 'Driver Trip Requests' : 'My Shuttle Tickets & Trips'}</span>
          <span className="text-xs text-gray-400 font-normal">({bookings.length})</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((booking) => {
          const shuttle = booking.shuttleRef || {};
          const isPending = booking.status === 'pending_approval';
          const isApproved = booking.status === 'approved';
          const isPaid = booking.status === 'paid';
          const isDeclined = booking.status === 'declined';
          const isCancelled = booking.status === 'cancelled';

          return (
            <div
              key={booking._id}
              className={`p-5 rounded-3xl border transition-all duration-200 bg-white dark:bg-gray-900 flex flex-col justify-between ${
                isPaid
                  ? 'border-emerald-300 dark:border-emerald-900 shadow-md shadow-emerald-500/5'
                  : isApproved
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
                      Pending Driver Approval
                    </span>
                  )}

                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved! Pay within 24h
                    </span>
                  )}

                  {isPaid && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Confirmed & Paid
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
                      <button
                        type="button"
                        onClick={() => handlePay(booking._id)}
                        disabled={actionLoading === booking._id}
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay R{booking.totalPrice} to Confirm Seat</span>
                      </button>
                    )}

                    {isPaid && (
                      <div className="text-xs text-center text-emerald-600 font-bold py-1">
                        ✓ Ready to Board. Present ticket code to driver at pickup.
                      </div>
                    )}
                  </>
                )}

                {/* Driver Desk Actions */}
                {role === 'driver' && (
                  <>
                    {isPending && (
                      <div className="flex items-center gap-2">
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
                          onClick={() => handleApprove(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve (24h)</span>
                        </button>
                      </div>
                    )}

                    {isApproved && (
                      <div className="text-xs text-center text-amber-600 dark:text-amber-400 py-1 font-medium">
                        Waiting for passenger to complete payment within 24h.
                      </div>
                    )}

                    {isPaid && (
                      <div className="text-xs text-center text-emerald-600 font-bold py-1 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Passenger Paid & Confirmed
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShuttleBookingsList;
