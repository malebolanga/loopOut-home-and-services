import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Users, 
  Phone, 
  User, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Bus, 
  ArrowRight, 
  Clock, 
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { reverseGeocode } from '../../utils/geocoding';

// Helper to format clean South African WhatsApp link
const formatWhatsAppUrl = (phone, text) => {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '27' + clean.slice(1);
  } else if (!clean.startsWith('27') && clean.length === 9) {
    clean = '27' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
};

const PickupRequestSheet = ({ shuttle, isOpen, onClose, onSuccess, currentUser }) => {
  if (!isOpen || !shuttle) return null;

  const {
    _id,
    carType = 'Toyota Quantum 15-Seater',
    plateNumber = '',
    pricePerSeat = 180,
    availableSeats = 15,
    totalSeats = 15,
    originCity = 'Johannesburg',
    destinationCity = 'Polokwane',
    pickupStation = 'Park Station',
    dropoffStation = '🏠 House-to-House Dropoff',
    isHouseToHouse = true,
    departureTime = 'Tomorrow at 10:00 AM',
    driverName = 'Verified Driver',
    driverPhone = '+27825550192',
    freeBagsPerPassenger = 1,
    extraBagPrice = 50,
  } = shuttle;

  // Form State
  const [passengerName, setPassengerName] = useState(currentUser?.name || currentUser?.username || '');
  const [passengerPhone, setPassengerPhone] = useState(currentUser?.phone || '');
  const [pickupAddress, setPickupAddress] = useState(pickupStation || originCity);
  const [dropoffAddress, setDropoffAddress] = useState(dropoffStation || destinationCity);
  const [seatsCount, setSeatsCount] = useState(1);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState(['Seat 1']);
  const [extraBagsCount, setExtraBagsCount] = useState(0);
  const [passengerNotes, setPassengerNotes] = useState('');

  // Status & Geolocation
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);
  const [whatsAppDirectUrl, setWhatsAppDirectUrl] = useState(null);

  // Sync with current user profile
  useEffect(() => {
    if (currentUser) {
      if (!passengerName) setPassengerName(currentUser.name || currentUser.username || '');
      if (!passengerPhone) setPassengerPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Read Phone GPS to auto-fill exact street pickup location
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }
    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let streetAddress = '';

        try {
          const place = await reverseGeocode(latitude, longitude);
          if (place) {
            streetAddress = place.split(',').slice(0, 3).join(', ');
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
        }

        if (!streetAddress) {
          streetAddress = `GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        setPickupAddress(streetAddress);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setError('Could not access phone GPS. Please enter your pickup address manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Live Price Calculation
  const seatCharge = seatsCount * pricePerSeat;
  const luggageCharge = extraBagsCount * (extraBagPrice || 0);
  const totalFare = seatCharge + luggageCharge;

  // Handle seat number changes
  const handleSeatsChange = (newCount) => {
    const valid = Math.max(1, Math.min(newCount, availableSeats || 15));
    setSeatsCount(valid);
    setSelectedSeatNumbers(Array.from({ length: valid }, (_, i) => `Seat ${i + 1}`));
  };

  // Submit Pickup Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!passengerName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!passengerPhone.trim()) {
      setError('Please enter your phone number so the driver can contact you.');
      return;
    }

    if (!pickupAddress.trim()) {
      setError('Please provide your pickup location or use your phone GPS.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        shuttleId: _id,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        seatsBooked: seatsCount,
        seatNumbers: selectedSeatNumbers,
        extraBagsCount,
        pickupLocation: pickupAddress.trim(),
        dropoffLocation: dropoffAddress.trim(),
        passengerNotes: passengerNotes.trim(),
      };

      const res = await axios.post('/api/shuttle-bookings/request', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (res.data?.success) {
        const booking = res.data.booking;
        setSuccessBooking(booking);

        // Prepare full trip WhatsApp message for the driver
        const waMessage = 
`🚖 *LoopOut Shuttle Pickup Request*
👤 *Passenger:* ${passengerName}
📞 *Phone:* ${passengerPhone}
📍 *Pickup Location:* ${pickupAddress}
🎯 *Dropoff Location:* ${dropoffAddress}
🚐 *Vehicle:* ${carType} (${plateNumber})
🛣️ *Route:* ${originCity} ➔ ${destinationCity}
👥 *Seats:* ${seatsCount} (${selectedSeatNumbers.join(', ')})
🧳 *Luggage:* ${seatsCount} Free Bag(s)${extraBagsCount > 0 ? ` + ${extraBagsCount} Extra Bag(s)` : ''}
💰 *Total Fare:* R${totalFare}
🎫 *Booking Code:* ${booking.ticketCode}

Hi ${driverName}, I just submitted my pickup request on LoopOut! Please confirm my pickup. Thank you!`;

        const waUrl = formatWhatsAppUrl(driverPhone, waMessage);
        setWhatsAppDirectUrl(waUrl);

        // Automatically attempt to open WhatsApp in a new window/tab
        if (waUrl) {
          try {
            window.open(waUrl, '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.warn('Popup blocked, user can click button:', e);
          }
        }

        if (onSuccess) onSuccess(booking);
      } else {
        setError(res.data?.message || 'Could not submit pickup request.');
      }
    } catch (err) {
      console.error('Pickup request error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to submit request. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Slide-Up Filler Panel ("Second page going up") */}
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Sheet Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>Request Shuttle Pickup</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono">
                  {plateNumber}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Driver: <span className="font-semibold text-gray-700 dark:text-gray-300">{driverName}</span> • {carType}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {successBooking ? (
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Pickup Request Sent!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Your pickup request has been delivered to <strong>{driverName}</strong> via LoopOut notifications and prepared for WhatsApp.
              </p>
            </div>

            {/* Ticket Code Box */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 max-w-sm mx-auto text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 uppercase font-bold">Booking Code</span>
                <span className="font-mono font-black text-teal-600 text-sm">
                  {successBooking.ticketCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Pickup:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                  {pickupAddress}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Estimated Fare:</span>
                <span className="font-bold text-amber-500">R{totalFare}</span>
              </div>
            </div>

            {/* Dual Action: WhatsApp + In-App */}
            <div className="space-y-2.5 max-w-sm mx-auto pt-2">
              {whatsAppDirectUrl && (
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open WhatsApp to Message Driver</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition"
              >
                Close & View on Live Map
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Trip Route Banner */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-teal-700 dark:text-teal-300 font-bold">
                  {originCity} ➔ {destinationCity}
                </span>
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">
                  {isHouseToHouse ? '🏠 House-to-House Dropoff' : 'Station Dropoff'} • {departureTime}
                </span>
              </div>
              <div className="text-right">
                <span className="font-black text-amber-500 text-base">R{pricePerSeat}</span>
                <span className="text-[10px] text-gray-400 block">per seat</span>
              </div>
            </div>

            {/* Section 1: Pickup Location with GPS Auto-fill */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Where Should the Shuttle Pick You Up?</span>
                </label>

                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  disabled={locating}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Navigation className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Finding GPS...' : '📍 Use My GPS'}</span>
                </button>
              </div>

              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. 45 Biccard St, Braamfontein / House address / Rank"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Section 2: Dropoff Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Dropoff Address in {destinationCity}</span>
              </label>

              <input
                type="text"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="e.g. 12 Hospital St, Mankweng / Seshego Zone 4 Gate"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Section 3: Passenger Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Passenger Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="e.g. 082 123 4567"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Seats & Luggage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
              {/* Seats Counter */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Seats Needed
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSeatsChange(seatsCount - 1)}
                    disabled={seatsCount <= 1}
                    className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold text-sm disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                    {seatsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSeatsChange(seatsCount + 1)}
                    disabled={seatsCount >= (availableSeats || 15)}
                    className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold text-sm disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400">({availableSeats} open)</span>
                </div>
              </div>

              {/* Extra Bags Counter */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Extra Luggage Bags
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExtraBagsCount(Math.max(0, extraBagsCount - 1))}
                    disabled={extraBagsCount <= 0}
                    className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold text-sm disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                    {extraBagsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraBagsCount(extraBagsCount + 1)}
                    disabled={extraBagsCount >= seatsCount * 2}
                    className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold text-sm disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="text-[11px] text-gray-400">
                    (1 free/seat • +R{extraBagPrice} extra)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 5: Notes to Driver */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Note for Driver (Optional)
              </label>
              <input
                type="text"
                value={passengerNotes}
                onChange={(e) => setPassengerNotes(e.target.value)}
                placeholder="e.g. Waiting in front of the gate with 1 small suitcase"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Fare Summary Strip */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  Total Estimated Fare
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  {seatsCount} seat(s) x R{pricePerSeat}
                  {extraBagsCount > 0 && ` + ${extraBagsCount} extra bag(s) (R${luggageCharge})`}
                </span>
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                R{totalFare}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Submit Pickup Request (WhatsApp & LoopOut)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Submits request to driver's notifications and opens WhatsApp automatically.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PickupRequestSheet;