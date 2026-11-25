import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Star, 
  Share2, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Clock, 
  Zap, 
  Home as HomeIcon,
  Navigation,
  Car,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  CalendarDays
} from 'lucide-react';
import SafetyModal from './SafetyModal';
import DriverTripPassengers from './DriverTripPassengers';

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const hasFreshLiveGps = (coordinates) => {
  const updatedAt = coordinates?.updatedAt ? new Date(coordinates.updatedAt).getTime() : 0;
  const ageMs = Date.now() - updatedAt;
  return coordinates?.isLive === true && Number.isFinite(updatedAt) && updatedAt > 0 && ageMs >= 0 && ageMs <= 60_000;
};

const UberDriverCard = ({
  shuttle,
  allShuttles = [],
  onSelectShuttle,
  onRequestPickup,
  currentUser,
  userLocation,
  onUpdateSchedule,
  onTripFinished,
  onClose
}) => {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  // Control: isExpanded toggles between "small info at bottom" and "100% full card info"
  const [isExpanded, setIsExpanded] = useState(false);
  // Control: isVisible toggles fade-in and fade-out
  const [isVisible, setIsVisible] = useState(true);

  // Auto fade-in and reset to visible whenever selected vehicle changes
  useEffect(() => {
    if (shuttle?._id) {
      setIsVisible(true);
    }
  }, [shuttle?._id]);

  const isCurrentDriver = Boolean(shuttle && currentUser && String(shuttle.driverRef?._id || shuttle.driverRef) === String(currentUser._id || currentUser.id));
  useEffect(() => {
    setIsExpanded(isCurrentDriver);
  }, [isCurrentDriver, shuttle?._id]);

  if (!shuttle) {
    return (
      <div className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-3xl border-t border-gray-200 dark:border-gray-800 p-4 shadow-xl text-center animate-in fade-in duration-300">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
          <Bus className="w-4 h-4 text-teal-600 animate-pulse" />
          <span>👆 Tap any vehicle on the live map above to view driver and request pickup.</span>
        </div>
      </div>
    );
  }

  const {
    _id,
    driverName = '',
    driverPhone = '',
    driverAvatar = '',
    driverVerificationStatus = 'pending',
    carType = '',
    plateNumber = '',
    carColor = '',
    carImages = [],
    pricePerSeat = null,
    totalSeats = 0,
    availableSeats = 0,
    originCity = '',
    destinationCity = '',
    departureProvince = '',
    destinationProvince = '',
    pickupStation = '',
    dropoffStation = '',
    isHouseToHouse = false,
    leavesWhenFull = true,
    departureTime = '',
    departureDate,
    estimatedArrival = '',
    currentStatus = 'scheduled',
    currentCoordinates,
    features = [],
    freeBagsPerPassenger = 1,
    extraBagPrice = 50,
    driverRating: rawRating = 0,
    driverRatingCount = 0,
    completedTrips = 0,
  } = shuttle;

  const isDriverLiveGprs = hasFreshLiveGps(currentCoordinates);
  const gpsAccuracy = currentCoordinates?.accuracy;

  const displayImage = (carImages && carImages.length > 0) ? carImages[0] : '';
  const driverPhoto = driverAvatar || '';
  const driverDisplayName = driverName || 'Driver details available after approval';
  const vehicleDisplayName = carType || 'Vehicle details unavailable';

  // Use real rating from bookings
  const hasRatings = driverRatingCount > 0;
  const displayRating = hasRatings ? Number(rawRating).toFixed(1) : null;
  const displayTrips = completedTrips > 0 ? completedTrips : null;

  const bookedSeats = Math.max(0, totalSeats - availableSeats);
  const occupancyPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  const isSoldOut = availableSeats <= 0;

  // Live Distance to Passenger (for 2km Proximity alert)
  let distanceToUserKm = null;
  if (userLocation && isDriverLiveGprs && currentCoordinates?.lat && currentCoordinates?.lng) {
    distanceToUserKm = calculateDistanceKm(
      Number(currentCoordinates.lat),
      Number(currentCoordinates.lng),
      Number(userLocation.lat),
      Number(userLocation.lng)
    );
  }

  // Clean phone for tel: and WhatsApp
  const cleanPhone = (driverPhone || '').replace(/[^0-9+]/g, '');

  // Share Trip handler
  const handleShareTrip = async () => {
    const shareUrl = `${window.location.origin}/shuttles?shuttleId=${_id}`;
    const shareText = `🚖 Tracking Shuttle Trip on LoopOut!\nRoute: ${originCity || 'Origin'} ➔ ${destinationCity || 'Destination'}\nVehicle: ${vehicleDisplayName}${plateNumber ? ` (${plateNumber})` : ''}\nLive tracking: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `LoopOut Shuttle - ${originCity} to ${destinationCity}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const currentIndex = allShuttles.findIndex((s) => String(s._id) === String(_id));
  const hasMultiple = allShuttles.length > 1;

  const handlePrevShuttle = () => {
    if (!hasMultiple) return;
    const prevIdx = (currentIndex - 1 + allShuttles.length) % allShuttles.length;
    if (onSelectShuttle) onSelectShuttle(allShuttles[prevIdx]);
  };

  const handleNextShuttle = () => {
    if (!hasMultiple) return;
    const nextIdx = (currentIndex + 1) % allShuttles.length;
    if (onSelectShuttle) onSelectShuttle(allShuttles[nextIdx]);
  };

  // If user faded out the card, show a sleek floating control pill to fade back in
  if (!isVisible) {
    return (
      <div className="w-full flex justify-center px-3 pb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button
          type="button"
          onClick={() => setIsVisible(true)}
          className="px-5 py-2.5 rounded-full bg-gray-950/95 dark:bg-white/95 text-white dark:text-gray-950 font-bold text-xs shadow-2xl backdrop-blur-md border border-gray-700 dark:border-gray-200 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition"
          title="Fade In Shuttle Card Info"
        >
          <Eye className="w-4 h-4 text-teal-400 dark:text-teal-600" />
          <span>Show Driver Info ({plateNumber}) • R{pricePerSeat}</span>
          <ChevronUp className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-t border-gray-200/90 dark:border-gray-800 shadow-2xl rounded-t-3xl overflow-hidden transition-all duration-300 animate-slide-up-fade">
      {/* ── TOP CONTROL BAR: Drag handle & Fade-in/out & Expand/Collapse Controls ── */}
      <div className="w-full px-4 pt-2.5 pb-2 bg-gray-50/90 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        {/* Left: Quick label + Car Selector & Cycler Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">
            {isExpanded ? 'Full Details' : 'Live Shuttle'}
          </span>

          {/* Quick Prev / Next Switcher for overlapping or route cars */}
          {hasMultiple && (
            <div className="flex items-center gap-0.5 shrink-0 bg-white dark:bg-gray-800 rounded-full px-1 py-0.5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                type="button"
                onClick={handlePrevShuttle}
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-90"
                title="Select car behind (Previous)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 px-1 font-mono">
                {currentIndex >= 0 ? currentIndex + 1 : 1}/{allShuttles.length}
              </span>

              <button
                type="button"
                onClick={handleNextShuttle}
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-90"
                title="Select next car"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Direct Tap Pills for Every Car (Shows plate & price) */}
          {hasMultiple && (
            <div className="flex items-center gap-1.5 ml-1 shrink-0">
              {allShuttles.map((s, idx) => {
                const isCurr = String(s._id) === String(_id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => onSelectShuttle && onSelectShuttle(s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 border active:scale-95 ${
                      isCurr
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                    }`}
                    title={`Select car ${idx + 1}: ${s.plateNumber} (${s.originCity} ➔ ${s.destinationCity})`}
                  >
                    <span>{s.plateNumber}</span>
                    <span className="font-mono text-amber-500">R{s.pricePerSeat}</span>
                    <span className="text-[9px] opacity-80">({s.availableSeats} seats)</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Expand/Collapse & Fade-out (Hide) Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isCurrentDriver && onUpdateSchedule && (
            <button type="button" onClick={() => onUpdateSchedule(shuttle)} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-teal-800" title="Update departure date and time">
              <CalendarDays className="h-3.5 w-3.5" /><span>Update departure</span>
            </button>
          )}
          {/* Control 1: Expand / Collapse Details Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition flex items-center gap-1 shadow-sm active:scale-95"
            title={isExpanded ? 'Collapse to small bottom info' : 'Expand 100% full card info'}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xs:inline">Small Bar</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xs:inline">Full Info</span>
              </>
            )}
          </button>

          {/* Control 2: Fade Out / Close Control */}
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                setIsVisible(false);
              }
            }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition active:scale-95"
            title="Close / Fade out info card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MODE 1: SMALL INFORMATION AT THE BOTTOM (COLLAPSED) ── */}
      {!isExpanded && (
        <div className="w-full max-w-7xl mx-auto p-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          {/* Driver Avatar, Name, Rating & Plate */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {driverPhoto ? <img src={driverPhoto} alt={driverDisplayName} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-teal-500 shadow ring-1 ring-teal-500/20" /> : <span aria-label="Driver photo unavailable" className="flex w-11 h-11 sm:w-12 sm:h-12 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-50 text-teal-700 shadow ring-1 ring-teal-500/20"><Users className="w-5 h-5" /></span>}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100 truncate">
                  {driverDisplayName}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-300 text-gray-950 border border-gray-900 font-mono">
                  {plateNumber}
                </span>
                {isSoldOut && <span className="rounded-full border border-gray-400 bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white ring-1 ring-gray-300">Fully booked</span>}
                {isDriverLiveGprs && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                    🛰️ LIVE
                  </span>
                )}
                {distanceToUserKm !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black border flex items-center gap-0.5 ${
                    distanceToUserKm <= 2.0
                      ? 'bg-amber-400 text-gray-950 border-amber-500 animate-pulse'
                      : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                  }`}>
                    <span>{distanceToUserKm <= 2.0 ? '🚨' : '📍'}</span>
                    <span>{distanceToUserKm.toFixed(1)} km</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{displayRating || 'New'}</span>
                </span>
                <span>•</span>
                <span className="truncate">{vehicleDisplayName.split(' ')[0]}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{availableSeats} seats open</span>
              </div>
            </div>
          </div>

          {/* Route corridor & schedule (Hidden on very narrow mobile screens) */}
          <div className="hidden md:flex flex-col text-xs text-gray-600 dark:text-gray-300 min-w-0 px-2">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 truncate">
              <span>{originCity}</span>
              <span className="text-amber-500">➔</span>
              <span>{destinationCity}</span>
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 truncate">
              {leavesWhenFull ? '⚡ Leaves when full' : (departureTime || 'Departure time not provided')}
              {isHouseToHouse && ' • 🏠 Door-to-Door'}
            </div>
          </div>

          {/* Price & Request Pickup Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right">
              <div className="text-lg sm:text-xl font-black text-amber-500 leading-tight">
                R{pricePerSeat}
              </div>
              <div className="text-[10px] text-gray-400">per seat</div>
            </div>

            <button
              type="button"
              onClick={() => onRequestPickup && onRequestPickup(shuttle)}
              disabled={isSoldOut}
              className={`py-2.5 px-3.5 sm:px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition ${
                isSoldOut
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-teal-600/20 hover:brightness-105'
              }`}
            >
              <Bus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isSoldOut ? 'Sold Out' : 'Request'}</span>
              {!isSoldOut && <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />}
            </button>
          </div>
        </div>
      )}

      {/* ── MODE 2: 100% FULL CARD INFO (EXPANDED) ── */}
      {isExpanded && (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto no-scrollbar animate-slide-up-fade">
          {/* Top Row: Driver Profile & Face + Car Number Plate */}
          <div className="flex items-center justify-between gap-3">
            {/* Driver Face & Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {driverPhoto ? <img src={driverPhoto} alt={driverDisplayName} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-teal-500 shadow-md ring-2 ring-teal-500/20" /> : <span aria-label="Driver photo unavailable" className="flex w-14 h-14 sm:w-16 sm:h-16 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-50 text-teal-700 shadow-md ring-2 ring-teal-500/20"><Users className="w-6 h-6" /></span>}
                {isDriverLiveGprs && <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" title="Sharing live GPS" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate">
                    {driverDisplayName}
                  </h3>
                  {driverVerificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"><ShieldCheck className="w-3 h-3 text-teal-600" /><span>Verified</span></span>
                  ) : <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Not verified by LoopOut</span>}
                  {/* Live GPRS badge */}
                  {isDriverLiveGprs && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                      🛰️ LIVE GPS{gpsAccuracy ? ` ~${gpsAccuracy}m` : ''}
                    </span>
                  )}
                </div>

                {/* Rating & Trip count — real data from bookings */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                  {hasRatings ? (
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{displayRating}</span>
                      <span className="font-normal text-gray-400">({driverRatingCount} review{driverRatingCount !== 1 ? 's' : ''})</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
                      <Star className="w-3.5 h-3.5 text-teal-500" />
                      <span>New Driver</span>
                    </span>
                  )}
                  <span>•</span>
                  {displayTrips !== null ? (
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {displayTrips.toLocaleString()} completed trip{displayTrips !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">No trips yet</span>
                  )}
                </div>

                {/* Driver Contact Number with quick Call / WhatsApp */}
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">Driver contact details are shared after your request is approved.</p>
              </div>
            </div>

            {/* Car Number Plate Badge & Rate */}
            <div className="text-right shrink-0">
              <div className="inline-block px-3 py-1 rounded-lg bg-yellow-300 text-gray-950 border-2 border-gray-900 shadow font-mono font-black text-xs sm:text-sm tracking-wider">
                {plateNumber}
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-amber-500">
                  {pricePerSeat === null || pricePerSeat === undefined ? 'Fare unavailable' : `R${pricePerSeat}`}
                </span>
                <span className="text-[11px] text-gray-400 block -mt-0.5 font-medium">per seat</span>
              </div>
            </div>
          </div>

          {/* Safety & Share My Trip Actions Bar */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleShareTrip}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>{copiedShare ? '✓ Link Copied!' : 'Share My Trip'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSafetyModal(true)}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Safety & Emergency</span>
            </button>
          </div>

          {/* Car Name & Visual Strip */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 text-white p-4 flex items-center justify-between gap-4">
            <div className="z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Assigned Shuttle Vehicle
              </span>
              <h4 className="text-base sm:text-lg font-extrabold leading-tight">
                {vehicleDisplayName}
              </h4>
              <div className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                {carColor && <span>Color: {carColor}</span>}
                {carColor && plateNumber && <span>•</span>}
                {plateNumber && <span className="font-mono">{plateNumber}</span>}
              </div>
            </div>

            <div className="flex w-24 h-16 sm:w-28 sm:h-20 items-center justify-center rounded-xl overflow-hidden shrink-0 border border-white/20 bg-slate-800 shadow-md">
              {displayImage ? <img src={displayImage} alt={vehicleDisplayName} className="w-full h-full object-cover" /> : <Car className="w-8 h-8 text-slate-400" aria-label="Vehicle photo unavailable" />}
            </div>
          </div>

          {/* Route In Another Location / Different Locations & House to House */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Route Corridor & Different Locations</span>
              <span className="text-teal-600 font-bold">
                {isHouseToHouse ? '🏠 House-to-House Service' : 'Station to Station'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
              <span>{originCity || 'Origin'}{pickupStation ? ` (${pickupStation})` : ''}</span>
              <span className="text-amber-500 font-extrabold">➔</span>
              <span>{destinationCity}</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium pl-4">
              {dropoffStation ? (isHouseToHouse ? dropoffStation : `Dropoff: ${dropoffStation}`) : 'Drop-off details are not available.'}
            </p>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60 dark:border-gray-700/60 text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-300">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {leavesWhenFull ? `⚡ ${departureTime || 'Leaves when full'}` : (departureTime || 'Departure time not provided')}
                </span>
              </span>

              {estimatedArrival && <span className="font-semibold text-slate-600 dark:text-slate-300">Planned arrival: {estimatedArrival}</span>}

              {currentCoordinates?.address && (
                <span className={`flex items-center gap-1 text-[11px] truncate max-w-[180px] ${isDriverLiveGprs ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`} title={currentCoordinates.address}>
                  <Navigation className={`w-3 h-3 shrink-0 ${isDriverLiveGprs ? 'text-blue-500 animate-pulse' : 'text-blue-500'}`} />
                  <span>{isDriverLiveGprs ? '🛰️ Live now: ' : 'Last saved: '}{currentCoordinates.address}</span>
                </span>
              )}
            </div>
          </div>

          {isCurrentDriver && <DriverTripPassengers shuttle={shuttle} onTripFinished={onTripFinished} />}

          {/* Available Seats Bar */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Available Space in Vehicle</span>
              </span>
              <span className={`font-black ${isSoldOut ? 'text-red-500' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {isSoldOut ? 'Sold Out' : `${availableSeats} of ${totalSeats} seats open`}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-red-500'
                    : occupancyPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>

            <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>🧳 1 bag FREE per passenger</span>
              <span>Extra bag: R{extraBagPrice}</span>
            </div>
          </div>

          {/* Click Here to Request Pickup Button at the Bottom */}
          <button
            type="button"
            onClick={() => onRequestPickup && onRequestPickup(shuttle)}
            disabled={isSoldOut}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all duration-200 ${
              isSoldOut
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow-teal-600/30 hover:brightness-105'
            }`}
          >
            <Bus className="w-5 h-5" />
            <span>
              {isSoldOut
                ? 'All Seats Fully Booked'
                : `Click Here to Request Pickup • ${pricePerSeat === null || pricePerSeat === undefined ? 'Fare unavailable' : `R${pricePerSeat}`}`}
            </span>
            {!isSoldOut && <ArrowRight className="w-5 h-5 ml-1" />}
          </button>
        </div>
      )}

      {/* Safety & Emergency Modal */}
      <SafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        shuttle={shuttle}
      />
    </div>
  );
};

export default UberDriverCard;
