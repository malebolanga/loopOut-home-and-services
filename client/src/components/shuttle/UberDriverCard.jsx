import React, { useState } from 'react';
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
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import SafetyModal from './SafetyModal';

const UberDriverCard = ({
  shuttle,
  allShuttles = [],
  onSelectShuttle,
  onRequestPickup,
  currentUser
}) => {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!shuttle) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl text-center">
        <Bus className="w-10 h-10 mx-auto text-teal-600 mb-2 animate-bounce" />
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
          Select any vehicle on the map above to view driver & book pickup
        </p>
      </div>
    );
  }

  const {
    _id,
    driverName = 'Sipho Ndlovu',
    driverPhone = '+27825550192',
    driverAvatar = '',
    driverVerificationStatus = 'verified',
    carType = 'Toyota Quantum 15-Seater',
    plateNumber = 'DZ 88 YK GP',
    carColor = 'White',
    carImages = [],
    pricePerSeat = 180,
    totalSeats = 15,
    availableSeats = 4,
    originCity = 'Johannesburg',
    destinationCity = 'Polokwane',
    departureProvince = 'Gauteng',
    destinationProvince = 'Limpopo',
    pickupStation = 'Park Station Central',
    dropoffStation = '🏠 House-to-House Dropoff (Direct to door / gate)',
    isHouseToHouse = true,
    leavesWhenFull = true,
    departureTime = 'Tomorrow at 10:00 AM',
    departureDate,
    currentStatus = 'scheduled',
    currentCoordinates,
    features = [],
    freeBagsPerPassenger = 1,
    extraBagPrice = 50,
  } = shuttle;

  const isDriverLiveGprs = currentCoordinates?.isLive === true;
  const gpsAccuracy = currentCoordinates?.accuracy;

  const displayImage = (carImages && carImages.length > 0)
    ? carImages[0]
    : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=compress&cs=tinysrgb&w=800';

  const driverPhoto = driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=300';
  const driverRating = '4.9';
  const driverTripCount = 142;

  const bookedSeats = Math.max(0, totalSeats - availableSeats);
  const occupancyPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  const isSoldOut = availableSeats <= 0;

  // Clean phone for tel: and WhatsApp
  const cleanPhone = (driverPhone || '').replace(/[^0-9+]/g, '');

  // Share Trip handler
  const handleShareTrip = async () => {
    const shareUrl = `${window.location.origin}/shuttles?shuttleId=${_id}`;
    const shareText = `🚖 Tracking Shuttle Trip with ${driverName} on LoopOut!\nRoute: ${originCity} ➔ ${destinationCity}\nVehicle: ${carType} (${plateNumber})\nContact: ${driverPhone || 'On file'}\nLive tracking: ${shareUrl}`;

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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Optional Vehicle Selector Strip (if multiple shuttles are available) */}
      {allShuttles.length > 1 && (
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
            Available Cars:
          </span>
          {allShuttles.map((s) => {
            const isCurr = String(s._id) === String(_id);
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => onSelectShuttle && onSelectShuttle(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1.5 border ${
                  isCurr
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                }`}
              >
                <span>🚐 {s.carType.split(' ')[0]}</span>
                <span className="font-mono text-[10px] opacity-80">({s.plateNumber})</span>
                <span className="font-bold text-amber-300">R{s.pricePerSeat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Driver & Car Showcase Area */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Top Row: Driver Profile & Face + Car Number Plate */}
        <div className="flex items-center justify-between gap-3">
          {/* Driver Face & Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={driverPhoto}
                alt={driverName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-teal-500 shadow-md ring-2 ring-teal-500/20"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" title="Online & Active" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate">
                  {driverName}
                </h3>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>Verified</span>
                </span>
                {/* Live GPRS badge — shows when driver's GPS beacon is active */}
                {isDriverLiveGprs && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                    🛰️ LIVE GPS{gpsAccuracy ? ` ~${gpsAccuracy}m` : ''}
                  </span>
                )}
              </div>

              {/* Rating & Trip count */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{driverRating}</span>
                </span>
                <span>•</span>
                <span>{driverTripCount} completed trips</span>
              </div>

              {/* Driver Contact Number with quick Call / WhatsApp */}
              <div className="flex items-center gap-2 mt-1.5">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition"
                  title="Call Driver"
                >
                  <Phone className="w-3 h-3" />
                  <span>{driverPhone || '+27 82 555 0192'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Car Number Plate Badge & Rate */}
          <div className="text-right shrink-0">
            {/* South African Number Plate Badge */}
            <div className="inline-block px-3 py-1 rounded-lg bg-yellow-300 text-gray-950 border-2 border-gray-900 shadow font-mono font-black text-xs sm:text-sm tracking-wider">
              {plateNumber}
            </div>

            {/* Rate per seat */}
            <div className="mt-1">
              <span className="text-2xl font-black text-amber-500">
                R{pricePerSeat}
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
              {carType}
            </h4>
            <div className="text-xs text-gray-300 mt-1 flex items-center gap-2">
              <span>Color: {carColor}</span>
              <span>•</span>
              <span className="font-mono">{plateNumber}</span>
            </div>
          </div>

          <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md">
            <img
              src={displayImage}
              alt={carType}
              className="w-full h-full object-cover"
            />
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
            <span>{originCity} ({pickupStation || 'Main Station'})</span>
            <span className="text-amber-500 font-extrabold">➔</span>
            <span>{destinationCity}</span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium pl-4">
            {isHouseToHouse ? dropoffStation : `Dropoff: ${dropoffStation}`}
          </p>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60 dark:border-gray-700/60 text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-300">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {leavesWhenFull ? `⚡ ${departureTime || 'Leaves when full'}` : departureTime}
              </span>
            </span>

            {currentCoordinates?.address && (
              <span className={`flex items-center gap-1 text-[11px] truncate max-w-[180px] ${isDriverLiveGprs ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`} title={currentCoordinates.address}>
                <Navigation className={`w-3 h-3 shrink-0 ${isDriverLiveGprs ? 'text-blue-500 animate-pulse' : 'text-blue-500'}`} />
                <span>{isDriverLiveGprs ? '🛰️ ' : ''}Now: {currentCoordinates.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* How Many Seats Available Bar */}
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

          {/* Progress bar */}
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
              : `Click Here to Request Pickup • R${pricePerSeat}`}
          </span>
          {!isSoldOut && <ArrowRight className="w-5 h-5 ml-1" />}
        </button>
      </div>

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