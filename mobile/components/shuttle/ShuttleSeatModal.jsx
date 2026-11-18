import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bus, 
  Check, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  User, 
  Phone, 
  ChevronRight,
  Info
} from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const ShuttleSeatModal = ({ shuttle, isOpen, onClose, onSuccess, currentUser }) => {
  if (!isOpen || !shuttle) return null;

  const {
    _id,
    carType = 'Toyota Quantum 15-Seater',
    plateNumber = '',
    carColor = 'White',
    totalSeats = 15,
    availableSeats = 15,
    pricePerSeat = 250,
    extraBagPrice = 0,
    maxExtraBagsPerPassenger = 2,
    freeBagsPerPassenger = 1,
    luggageNotes = '',
    originCity = '',
    destinationCity = '',
    pickupStation = '',
    dropoffStation = '',
    isHouseToHouse = true,
    leavesWhenFull = true,
    departureDate,
    departureTime = '',
    driverName = '',
    bookedSeatNumbers = [],
  } = shuttle;

  // Selected seats array
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [extraBagsCount, setExtraBagsCount] = useState(0);
  const [passengerName, setPassengerName] = useState(currentUser?.name || currentUser?.username || '');
  const [passengerPhone, setPassengerPhone] = useState(currentUser?.phone || '');
  const [pickupLocation, setPickupLocation] = useState(pickupStation);
  const [dropoffLocation, setDropoffLocation] = useState(dropoffStation);
  const [passengerNotes, setPassengerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Fetch single shuttle details to get live occupied seat list
  useEffect(() => {
    let isMounted = true;
    const fetchLatestOccupiedSeats = async () => {
      try {
        const res = await axios.get(resolveApiUrl(`/api/shuttles/get/${_id}`));
        if (isMounted && res.data?.shuttle?.bookedSeatNumbers) {
          setOccupiedSeats(res.data.shuttle.bookedSeatNumbers);
        }
      } catch (err) {
        // Fallback to bookedSeatNumbers prop
        if (isMounted && bookedSeatNumbers) {
          setOccupiedSeats(bookedSeatNumbers);
        }
      }
    };

    fetchLatestOccupiedSeats();
    return () => {
      isMounted = false;
    };
  }, [_id, bookedSeatNumbers]);

  const toggleSeat = (seatId) => {
    if (normalizedOccupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // ── Live price breakdown ───────────────────────────────────
  const seatCharge = selectedSeats.length * pricePerSeat;
  const luggageCharge = extraBagsCount * (extraBagPrice || 0);
  const totalPrice = seatCharge + luggageCharge;
  const maxExtraBags = (maxExtraBagsPerPassenger || 2) * Math.max(1, selectedSeats.length);

  // Generate clean numeric seat grid list (e.g. ['1', '2', '3'])
  const seatList = Array.from({ length: totalSeats }, (_, i) => String(i + 1));
  const normalizedOccupiedSeats = occupiedSeats.map((s) => String(s).replace(/\D/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat from the vehicle layout.');
      return;
    }

    if (!passengerName.trim()) {
      setError('Please enter passenger full name.');
      return;
    }

    if (!passengerPhone.trim()) {
      setError('Please enter contact phone number for trip notifications.');
      return;
    }

    setLoading(true);
    try {
      const cleanSeats = selectedSeats.map((s) => String(s).replace(/\D/g, '')).filter(Boolean);

      const payload = {
        shuttleId: _id,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        seatsBooked: selectedSeats.length,
        seatNumbers: cleanSeats.length === selectedSeats.length ? cleanSeats : selectedSeats,
        extraBagsCount,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        passengerNotes: passengerNotes.trim(),
      };

      const res = await axios.post(resolveApiUrl('/api/shuttle-bookings/request'), payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (res.data?.success) {
        if (onSuccess) onSuccess(res.data.booking);
        onClose();
      } else {
        setError(res.data?.message || 'Could not request booking.');
      }
    } catch (err) {
      console.error('Seat booking error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to submit booking request. Please sign in and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Reserve Seats & Book Trip
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {carType} • Plate: <span className="font-mono font-semibold">{plateNumber}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Trip Summary Strip */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-teal-700 dark:text-teal-300 font-semibold uppercase tracking-wider">
                Route
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>{originCity}</span>
                <span className="text-teal-500">➔</span>
                <span>{destinationCity}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Departure:{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {leavesWhenFull ? `⚡ Leaves when full (${departureTime})` : departureTime}
                </span>
              </div>
              {isHouseToHouse && (
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span>🏠 House-to-House Dropoff included</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Fare per seat</div>
              <div className="text-lg font-black text-teal-600 dark:text-teal-400">
                R{pricePerSeat}
              </div>
            </div>
          </div>

          {/* Interactive Bus Seat Map */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Select Your Seat(s)
              </label>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span className="w-3.5 h-3.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 inline-block" />
                  Available
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span className="w-3.5 h-3.5 rounded bg-teal-500 text-white inline-block" />
                  Selected
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-gray-700 inline-block" />
                  Occupied
                </span>
              </div>
            </div>

            {/* Bus Cabin Visual Layout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              {/* Front Cabin (Driver & Entrance) */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-400">
                <span className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                  🚪 Door Entrance
                </span>
                <span className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                  🚗 Driver Cabin
                </span>
              </div>

              {/* Seats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {seatList.map((seatId) => {
                  const isOccupied = normalizedOccupiedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => toggleSeat(seatId)}
                      className={`relative p-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 min-h-[58px] ${
                        isOccupied
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-400 scale-[1.03]'
                          : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:shadow'
                      }`}
                    >
                      <Bus className="w-4 h-4 opacity-75" />
                      <span>#{seatId}</span>
                      {isSelected && (
                        <Check className="w-3 h-3 absolute top-1 right-1 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mt-3 text-center text-xs font-semibold text-teal-600 dark:text-teal-400">
                Selected: {selectedSeats.join(', ')} ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})
              </div>
            )}
          </div>

          {/* Passenger Contact & Trip Details Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Passenger & Pickup Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Lerato Khumalo"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pickup Station / Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Pickup location"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isHouseToHouse ? '🏠 House / Gate Dropoff Address *' : 'Dropoff Station / Address'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required={isHouseToHouse}
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder={
                      isHouseToHouse
                        ? `e.g. 14 Mandela St, Bendor, ${destinationCity || 'Town'}`
                        : 'Dropoff station / location'
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {isHouseToHouse && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    ✓ Driver drops you right at your home gate / door in {destinationCity}.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Special Requests or Notes
              </label>
              <textarea
                rows={2}
                value={passengerNotes}
                onChange={(e) => setPassengerNotes(e.target.value)}
                placeholder="e.g. Traveling with toddler, wheelchair needed, etc."
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* ── Luggage Section ─────────────────────────────────── */}
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🧳</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Luggage</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
                1 normal bag FREE per passenger
              </span>
            </div>

            {luggageNotes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">{luggageNotes}</p>
            )}

            {(maxExtraBagsPerPassenger > 0) && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Extra bags</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {extraBagPrice > 0
                      ? `R${extraBagPrice} per extra bag`
                      : 'Charged on day by driver — declare count now'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraBagsCount(Math.max(0, extraBagsCount - 1))}
                    disabled={extraBagsCount === 0}
                    className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-base flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-black text-gray-900 dark:text-gray-100">
                    {extraBagsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraBagsCount(Math.min(maxExtraBags, extraBagsCount + 1))}
                    disabled={extraBagsCount >= maxExtraBags}
                    className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-base flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 24-Hour Approval & Payment Protocol Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <p className="font-bold mb-0.5">Approval & 24-Hour Payment Window:</p>
              <p>
                1. You do <strong>not</strong> pay now. Your request is sent to driver{' '}
                <strong>{driverName}</strong> for approval.
              </p>
              <p className="mt-1">
                2. Once approved, you have a <strong>24-hour window to complete payment</strong> to lock in your seat and receive your digital QR boarding ticket.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price Breakdown</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              <div className="flex justify-between">
                <span>Seats ({selectedSeats.length} × R{pricePerSeat})</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">R{seatCharge}</span>
              </div>
              {extraBagsCount > 0 && (
                <div className="flex justify-between">
                  <span>Luggage ({extraBagsCount} extra bag{extraBagsCount > 1 ? 's' : ''} × R{extraBagPrice})</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">R{luggageCharge}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-black text-lg text-gray-900 dark:text-gray-100">R{totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || selectedSeats.length === 0}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Request Seat</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShuttleSeatModal;
