import React from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Navigation,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  Home as HomeIcon,
  Settings,
  Star
} from 'lucide-react';

const ShuttleCard = ({ shuttle, onSelectSeat, onLocateOnMap, onUpdateSchedule, currentUser }) => {
  if (!shuttle) return null;

  const {
    _id,
    carType = 'Vehicle details not provided',
    plateNumber = '',
    carColor = '',
    carImages = [],
    totalSeats = 0,
    availableSeats = 0,
    serviceType = 'interprovincial',
    departureProvince = 'Gauteng',
    destinationProvince = 'Limpopo',
    originCity = '',
    destinationCity = '',
    pickupStation = '',
    dropoffStation = '',
    isHouseToHouse = true,
    leavesWhenFull = true,
    departureDate,
    departureTime = 'Leaves when full',
    estimatedArrival = '',
    pricePerSeat = null,
    currentStatus = 'scheduled',
    currentCoordinates,
    driverName = 'LoopOut driver',
    driverPhone = '',
    driverAvatar = '',
    features = [],
    notes = '',
    freeBagsPerPassenger = 1,
    extraBagPrice = 0,
    luggageNotes = '',
    driverLicenceScan = '',
    driverVerificationStatus = 'pending',
    driverRating = 0,
    driverRatingCount = 0,
    completedTrips = 0,
  } = shuttle;

  const isDriver = Boolean(
    currentUser && (
      String(shuttle.driverRef?._id || shuttle.driverRef) === String(currentUser._id || currentUser.id)
    )
  );

  const displayImage = (carImages && carImages.length > 0) ? carImages[0] : '';

  const bookedSeats = Math.max(0, totalSeats - availableSeats);
  const occupancyPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  const isSoldOut = availableSeats <= 0;

  const formattedDate = departureDate
    ? new Date(departureDate).toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : 'Daily';

  // Status badge styling
  const statusConfig = {
    scheduled: { label: 'Scheduled', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
    boarding: { label: 'Boarding Now 🔔', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 animate-pulse' },
    en_route: { label: 'En Route 🟢', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
    arrived: { label: 'Arrived', bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
    completed: { label: 'Completed', bg: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
  }[currentStatus] || { label: 'Scheduled', bg: 'bg-blue-50 text-blue-700 border-blue-200' };

  return (
    <div className=" relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Media & Vehicle Info Header */}
      <div>
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {displayImage ? <><img src={displayImage} alt={carType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" /></> : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400"><Bus className="h-10 w-10" /><span className="text-xs">No vehicle photo provided</span></div>}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 shadow-sm">
                {serviceType === 'interprovincial' ? '🛣️ Inter-Provincial' : '📍 Local Transit'}
              </span>

              {isHouseToHouse && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-emerald-600/90 text-white shadow-sm">
                  🏠 House-to-House
                </span>
              )}
            </div>

            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${statusConfig.bg}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Bottom Overlay Info on Image */}
          <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-200 font-medium">
                {carColor} • Plate: <span className="font-mono font-bold text-white tracking-widest">{plateNumber}</span>
              </p>
              <h3 className="text-lg font-bold leading-tight drop-shadow-sm text-white">
                {carType}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-amber-300 drop-shadow">
                R{pricePerSeat}
              </span>
              <span className="text-xs text-gray-200 block">per seat</span>
            </div>
          </div>
        </div>

        {/* Route Details Box */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:to-amber-500">
            {/* Origin */}
            <div className="relative mb-3">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-teal-500 bg-white dark:bg-gray-900" />
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Origin • {departureProvince}</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{originCity}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pickupStation}</p>
                </div>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                  {leavesWhenFull ? (
                    <>
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{departureTime || 'Leaves when full'}</span>
                    </>
                  ) : (
                    <span>{departureTime}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Destination */}
            <div className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-amber-500" />
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Destination • {destinationProvince}</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{destinationCity}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {isHouseToHouse && !dropoffStation.includes('🏠') ? `🏠 House-to-House Dropoff: ${dropoffStation}` : dropoffStation}
                  </p>
                </div>
                {estimatedArrival && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ETA: {estimatedArrival}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Seat Capacity & Live Available Space Bar */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Available Space
              </span>
              <span className={`font-bold ${isSoldOut ? 'text-red-500' : 'text-teal-600 dark:text-teal-400'}`}>
                {isSoldOut ? 'Sold Out' : `${availableSeats} of ${totalSeats} seats open`}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-red-500'
                    : occupancyPercent > 75
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              {currentCoordinates?.isLive === true && currentCoordinates?.address && (
                <span className="flex items-center gap-1 truncate max-w-[170px]" title={currentCoordinates.address}>
                  <Navigation className="w-3 h-3 text-blue-500" />
                  Now: {currentCoordinates.address}
                </span>
              )}
            </div>
          </div>

          {/* Luggage Policy Row */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <span className="text-base shrink-0">🧳</span>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                1 bag FREE
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {' '}per passenger
              </span>
              {extraBagPrice > 0 ? (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {' '}· Extra bag: <span className="font-bold text-amber-600 dark:text-amber-400">R{extraBagPrice}</span> each
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {' '}· Extra bags charged on day
                </span>
              )}
            </div>
          </div>

          {/* Features Pills */}
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {features.slice(0, 3).map((feat, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                >
                  ✓ {feat}
                </span>
              ))}
              {features.length > 3 && (
                <span className="text-[10px] text-gray-400 self-center">
                  +{features.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Driver mini info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                {driverAvatar ? (
                  <img src={driverAvatar} alt={driverName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-xs">
                    {driverName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  {driverName}
                  {driverVerificationStatus === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                  {driverRatingCount > 0 ? (
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{Number(driverRating).toFixed(1)}</span>
                      <span className="text-gray-400 font-normal">({driverRatingCount})</span>
                    </span>
                  ) : (
                    <span className="text-teal-600 font-semibold">New Driver</span>
                  )}
                  <span>•</span>
                  <span>{completedTrips > 0 ? `${completedTrips} trips` : '0 trips'}</span>
                </div>
              </div>
            </div>

            {onLocateOnMap && (
              <button
                type="button"
                onClick={() => onLocateOnMap(shuttle)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                title="View vehicle location on map"
              >
                <MapPin className="w-3.5 h-3.5" />
                Live Map
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        {isDriver ? (
          <button
            type="button"
            onClick={() => onUpdateSchedule && onUpdateSchedule(shuttle)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Update Route, Leave Time & GPRS</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onSelectSeat && onSelectSeat(shuttle)}
          disabled={isSoldOut}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
            isSoldOut
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] shadow-teal-500/20'
          }`}
        >
          <Bus className="w-4 h-4" />
          {isSoldOut ? 'Sold Out' : `Select Seat • R${pricePerSeat}`}
          {!isSoldOut && <ArrowRight className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

export default ShuttleCard;
