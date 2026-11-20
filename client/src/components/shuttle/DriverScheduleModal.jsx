import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Navigation,
  Bus,
  Home as HomeIcon,
  Save,
  Check,
  Radio,
  ArrowRight,
  Route,
  Coins
} from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';
import { reverseGeocode } from '../../utils/geocoding';
import ShuttleDestinationPicker from './ShuttleDestinationPicker';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled / Filling Up', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  { value: 'boarding', label: '🔔 Boarding Now', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  { value: 'en_route', label: '🟢 En Route / On The Road', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  { value: 'arrived', label: '🏁 Arrived at Destination', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
];

const SA_PROVINCES = [
  'Gauteng',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'KwaZulu-Natal',
  'Free State',
  'Eastern Cape',
  'Western Cape',
  'Northern Cape',
];
const hasRouteCoordinates = (point) => point && point.lat !== null && point.lat !== undefined && point.lat !== ''
  && point.lng !== null && point.lng !== undefined && point.lng !== ''
  && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));

const TIME_PRESETS = [
  'Leaves when full / almost full',
  'Tomorrow at 10:00 AM',
  'Today at 10:00 AM',
  'Leaving in 30 mins',
  'Leaving Now!',
  '06:00 AM',
  '07:30 AM',
  '12:00 PM',
  '02:30 PM',
  '05:00 PM',
];

const DriverScheduleModal = ({ shuttle, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !shuttle) return null;

  // Route fields
  const [originCity, setOriginCity] = useState(shuttle.originCity || '');
  const [destinationCity, setDestinationCity] = useState(shuttle.destinationCity || '');
  const [originCoordinates, setOriginCoordinates] = useState(shuttle.originCoordinates || null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(shuttle.destinationCoordinates || null);
  const [departureProvince, setDepartureProvince] = useState(shuttle.departureProvince || 'Gauteng');
  const [destinationProvince, setDestinationProvince] = useState(shuttle.destinationProvince || 'Limpopo');
  const [pickupStation, setPickupStation] = useState(shuttle.pickupStation || `House-to-house near ${shuttle.originCity || 'starting city'}`);
  const [dropoffStation, setDropoffStation] = useState(
    shuttle.dropoffStation || `House-to-house near ${shuttle.destinationCity || 'destination city'}`
  );
  const [pricePerSeat, setPricePerSeat] = useState(shuttle.pricePerSeat || 150);
  const [isHouseToHouse, setIsHouseToHouse] = useState(true);

  // Dynamic Departure Time & Date fields
  const [leavesWhenFull, setLeavesWhenFull] = useState(shuttle.leavesWhenFull !== false);
  const [departureTime, setDepartureTime] = useState(shuttle.departureTime || 'Leaves when full / almost full');
  const [departureDate, setDepartureDate] = useState(
    shuttle.departureDate ? new Date(shuttle.departureDate).toISOString().split('T')[0] : ''
  );

  // Status & Location
  const [currentStatus, setCurrentStatus] = useState(shuttle.currentStatus || 'scheduled');
  const [currentAddress, setCurrentAddress] = useState(shuttle.currentCoordinates?.address || '');
  const [coordinates, setCoordinates] = useState(shuttle.currentCoordinates || { lat: null, lng: null });

  // Banking details (editable from this modal too)
  const [bankName, setBankName] = useState(shuttle.bankName || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(shuttle.bankAccountHolder || shuttle.driverName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(shuttle.bankAccountNumber || '');
  const [bankBranchCode, setBankBranchCode] = useState(shuttle.bankBranchCode || '');
  const [bankAccountType, setBankAccountType] = useState(shuttle.bankAccountType || 'Savings');
  const [bankReference, setBankReference] = useState(shuttle.bankReference || '');
  
  // States
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [liveBeaconActive, setLiveBeaconActive] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const watchIdRef = useRef(null);

  // Sync state whenever shuttle changes
  useEffect(() => {
    if (shuttle) {
      setOriginCity(shuttle.originCity || '');
      setDestinationCity(shuttle.destinationCity || '');
      setOriginCoordinates(shuttle.originCoordinates || null);
      setDestinationCoordinates(shuttle.destinationCoordinates || null);
      setDepartureProvince(shuttle.departureProvince || 'Gauteng');
      setDestinationProvince(shuttle.destinationProvince || 'Limpopo');
      setPickupStation(shuttle.pickupStation || `House-to-house near ${shuttle.originCity || 'starting city'}`);
      setDropoffStation(shuttle.dropoffStation || `House-to-house near ${shuttle.destinationCity || 'destination city'}`);
      setPricePerSeat(shuttle.pricePerSeat || 150);
      setIsHouseToHouse(true);

      setLeavesWhenFull(shuttle.leavesWhenFull !== false);
      setDepartureTime(shuttle.departureTime || 'Leaves when full / almost full');
      setDepartureDate(
        shuttle.departureDate ? new Date(shuttle.departureDate).toISOString().split('T')[0] : ''
      );

      setCurrentStatus(shuttle.currentStatus || 'scheduled');
      setCurrentAddress(shuttle.currentCoordinates?.address || '');
      setCoordinates(shuttle.currentCoordinates || { lat: null, lng: null });
      setBankName(shuttle.bankName || '');
      setBankAccountHolder(shuttle.bankAccountHolder || shuttle.driverName || '');
      setBankAccountNumber(shuttle.bankAccountNumber || '');
      setBankBranchCode(shuttle.bankBranchCode || '');
      setBankAccountType(shuttle.bankAccountType || 'Savings');
      setBankReference(shuttle.bankReference || '');
      setError(null);
      setSuccessMsg(null);
    }
  }, [shuttle]);

  // Clean up live geolocation watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Quick Action: Mark as Leaving Now / Boarding
  const handleQuickDepart = async () => {
    setLoading(true);
    setError(null);
    try {
      const nowStr = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
      const payload = {
        currentStatus: 'boarding',
        departureTime: `Boarding Now (Leaving ~${nowStr})`,
        leavesWhenFull: true,
      };

      const res = await axios.put(resolveApiUrl(`/api/shuttles/update/${shuttle._id}`), payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (res.data?.success) {
        setSuccessMsg('⚡ Shuttle marked as BOARDING NOW! Passengers see you are ready to depart.');
        if (onUpdated) onUpdated(res.data.shuttle);
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error('Quick depart error:', err);
      setError(err.response?.data?.message || 'Could not update departure status.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset helper
  const applyTimePreset = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (preset === 'Tomorrow at 10:00 AM') {
      setDepartureDate(tomorrowStr);
      setDepartureTime('Tomorrow at 10:00 AM');
      setLeavesWhenFull(false);
    } else if (preset === 'Today at 10:00 AM') {
      setDepartureDate(todayStr);
      setDepartureTime('Today at 10:00 AM');
      setLeavesWhenFull(false);
    } else if (preset.includes('when full')) {
      setLeavesWhenFull(true);
    } else if (preset === 'Leaving Now!') {
      setDepartureTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }));
      setDepartureDate(todayStr);
      setCurrentStatus('en_route');
      setLeavesWhenFull(true);
    } else if (preset === 'Leaving in 30 mins') {
      const later = new Date(Date.now() + 30 * 60 * 1000);
      setDepartureTime(later.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }));
      setDepartureDate(todayStr);
      setCurrentStatus('scheduled');
      setLeavesWhenFull(false);
    } else {
      setDepartureTime(preset);
      setLeavesWhenFull(false);
    }
  };

  // Phone GPS/GPRS Location Allocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your phone or browser.');
      return;
    }
    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let resolvedAddress = '';

        try {
          const placeName = await reverseGeocode(latitude, longitude);
          if (placeName) {
            resolvedAddress = placeName.split(',').slice(0, 3).join(', ');
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }

        if (!resolvedAddress) {
          resolvedAddress = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        const newCoords = {
          lat: latitude,
          lng: longitude,
          address: resolvedAddress,
          updatedAt: new Date()
        };

        setCoordinates(newCoords);
        setCurrentAddress(resolvedAddress);
        setLocating(false);
        setSuccessMsg(`📍 Phone GPRS allocated! (~${Math.round(accuracy || 10)}m accuracy) — Pushing to live map...`);

        // Immediately push to DB so the map pin updates live
        try {
          await axios.put(resolveApiUrl(`/api/shuttles/update-location/${shuttle._id}`), {
            lat: latitude,
            lng: longitude,
            address: resolvedAddress,
            accuracy: Math.round(accuracy || 10),
            isLive: false,
            currentStatus,
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
          });
          setSuccessMsg(`✅ GPRS location locked! (~${Math.round(accuracy || 10)}m) — Your vehicle pin is updated on the live map.`);
        } catch (e) {
          console.warn('Could not push GPS to server:', e);
        }

        setTimeout(() => setSuccessMsg(null), 5000);
      },
      (err) => {
        console.warn('GPS location error:', err);
        let msg = 'Could not retrieve phone GPS position.';
        if (err.code === 1) msg = '❌ Location permission denied. Please allow location access in your phone/browser settings.';
        if (err.code === 2) msg = '📡 GPS signal unavailable. Move to an open area and try again.';
        if (err.code === 3) msg = '⏱️ GPS timed out. Please try again.';
        setError(msg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  // Real-time GPRS Tracker broadcast toggle
  const toggleLiveBeacon = () => {
    if (liveBeaconActive) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLiveBeaconActive(false);
      setSuccessMsg('Live GPRS broadcast stopped.');

      // Mark shuttle as no longer live in DB
      axios.put(resolveApiUrl(`/api/shuttles/update-location/${shuttle._id}`), {
        isLive: false,
        currentStatus,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      }).catch(() => {});

      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported on this device.');
        return;
      }

      setLiveBeaconActive(true);
      setSuccessMsg('📡 Live GPRS Broadcast Active: Auto-updating vehicle location as you drive!');

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCoordinates((prev) => ({ ...prev, lat: latitude, lng: longitude, updatedAt: new Date() }));

          // Try to reverse geocode the new position for a human address
          let resolvedAddress = currentAddress;
          try {
            const { reverseGeocode } = await import('../../utils/geocoding');
            const placeName = await reverseGeocode(latitude, longitude);
            if (placeName) {
              resolvedAddress = placeName.split(',').slice(0, 3).join(', ');
              setCurrentAddress(resolvedAddress);
            }
          } catch (e) {
            // ignore geocoding failures — coordinates still broadcast
          }

          try {
            await axios.put(resolveApiUrl(`/api/shuttles/update-location/${shuttle._id}`), {
              lat: latitude,
              lng: longitude,
              address: resolvedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              accuracy: Math.round(accuracy || 10),
              isLive: true,
              currentStatus,
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            });
          } catch (e) {
            console.warn('Background GPRS broadcast error:', e);
          }
        },
        (err) => {
          console.warn('WatchPosition error:', err);
          setLiveBeaconActive(false);
          setError('Phone GPS signal lost. Please check your location permissions and try again.');
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
    }
  };

  // Submit all route, schedule, and live status changes
  const handleSave = async (e) => {
    e.preventDefault();
    if (!departureTime.match(/\d{1,2}:\d{2}/)) {
      setError('Enter the planned departure time. The shuttle may also leave early when all seats are booked.');
      return;
    }
    if (!hasRouteCoordinates(originCoordinates) || !hasRouteCoordinates(destinationCoordinates)) {
      setError('Set map pins for the route start and destination so GPS can detect arrival.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        // Route updates
        originCity: originCity.trim() || shuttle.originCity,
        destinationCity: destinationCity.trim() || shuttle.destinationCity,
        originCoordinates,
        destinationCoordinates,
        departureProvince,
        destinationProvince,
        pickupStation: pickupStation.trim() || shuttle.pickupStation,
        dropoffStation: dropoffStation.trim() || shuttle.dropoffStation,
        pricePerSeat: Number(pricePerSeat) || shuttle.pricePerSeat,
        isHouseToHouse,
        dropoffType: isHouseToHouse ? 'house_to_house' : 'station',
        // Schedule & Leave time updates
        departureDate: departureDate ? new Date(departureDate) : shuttle.departureDate,
        departureTime: departureTime.trim(),
        leavesWhenFull,
        departureRule: leavesWhenFull ? 'when_full' : 'scheduled',
        // Live status & GPRS
        currentStatus,
        currentCoordinates: {
          lat: coordinates.lat !== null && coordinates.lat !== undefined && coordinates.lat !== '' && Number.isFinite(Number(coordinates.lat)) ? Number(coordinates.lat) : null,
          lng: coordinates.lng !== null && coordinates.lng !== undefined && coordinates.lng !== '' && Number.isFinite(Number(coordinates.lng)) ? Number(coordinates.lng) : null,
          address: currentAddress.trim() || shuttle.originCity,
          updatedAt: new Date()
        },
        // Banking details update
        bankName: bankName.trim(),
        bankAccountHolder: bankAccountHolder.trim() || shuttle.driverName,
        bankAccountNumber: bankAccountNumber.trim(),
        bankBranchCode: bankBranchCode.trim(),
        bankAccountType: bankAccountType.trim(),
        bankReference: bankReference.trim(),
      };

      const res = await axios.put(resolveApiUrl(`/api/shuttles/update/${shuttle._id}`), payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (res.data?.success) {
        setSuccessMsg('✓ Shuttle route, departure schedule & live GPS saved successfully!');
        if (onUpdated) onUpdated(res.data.shuttle);
        setTimeout(() => onClose(), 1100);
      }
    } catch (err) {
      console.error('Update route & schedule error:', err);
      setError(err.response?.data?.message || 'Failed to update shuttle details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>Update Route, Leave Time & Location</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono">
                  {shuttle.plateNumber}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update departure times anytime (e.g. tomorrow at 10:00 AM), edit routes, or allocate location via phone GPS.
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Depart / Leaving Now Hero Action */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-teal-500/15 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-teal-600 fill-teal-600" />
                <span>Leaving Soon or Full Right Now?</span>
              </div>
              <p className="text-xs text-teal-800/80 dark:text-teal-300/80 mt-0.5">
                1-tap update: Sets vehicle to "Boarding Now" and notifies passengers on the live map.
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickDepart}
              disabled={loading}
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 active:scale-95 transition"
            >
              ⚡ Leaving Now!
            </button>
          </div>

          {/* Section 1: Route Updating */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              <Route className="w-4 h-4 text-teal-600" />
              <span>Update Route & Travel Cities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Origin City & Province */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  From (Origin City)
                </label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => { setOriginCity(e.target.value); setOriginCoordinates(null); }}
                  placeholder="e.g. Johannesburg / Pretoria"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 mb-1.5"
                />
                <select
                  value={departureProvince}
                  onChange={(e) => setDepartureProvince(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p} Province</option>
                  ))}
                </select>
              </div>

              {/* Destination City & Province */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  To (Destination City)
                </label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => { setDestinationCity(e.target.value); setDestinationCoordinates(null); }}
                  placeholder="e.g. Polokwane / Durban"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 mb-1.5"
                />
                <select
                  value={destinationProvince}
                  onChange={(e) => setDestinationProvince(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p} Province</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ShuttleDestinationPicker value={originCoordinates} onChange={setOriginCoordinates} destinationName={originCity || 'route starting city'} />
              <ShuttleDestinationPicker value={destinationCoordinates} onChange={setDestinationCoordinates} destinationName={destinationCity || 'destination city'} />
            </div>

            {/* Pickup Station & Price per Seat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Pickup Coverage Area
                </label>
                <input
                  type="text"
                  value={pickupStation}
                  onChange={(e) => setPickupStation(e.target.value)}
                  placeholder={`House-to-house near ${originCity || 'the starting city'}`}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Price per Seat (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">R</span>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Leave Date & Time (No fixed timetable required) */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Flexible Leaving Date & Time</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {shuttle.returnRouteFor
                    ? 'This return route is bookable at the destination now. Set when you plan to leave; it can depart earlier when every seat is reserved.'
                    : 'Set your planned departure; the shuttle can leave earlier when every seat is reserved.'}
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Can leave early when full</span>
                <input
                  type="checkbox"
                  checked={leavesWhenFull}
                  onChange={(e) => setLeavesWhenFull(e.target.checked)}
                  className="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Quick Presets (Tomorrow 10am, Today 10am, Leaves When Full, etc.) */}
            <div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Quick Departure Presets (1-Click)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyTimePreset(preset)}
                    className={`text-[11px] px-3 py-1.5 rounded-xl border font-semibold transition ${
                      departureTime === preset
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                    }`}
                  >
                    {preset === 'Tomorrow at 10:00 AM' ? '📅 Tomorrow at 10:00 AM' : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time & Date input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Planned Departure Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: House-to-House Dropoff Option */}
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <HomeIcon className="w-4 h-4 text-emerald-600" />
                  <span>House-to-house pickup & drop-off</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Default service covers homes near each route end. Confirm each exact passenger address is within your coverage.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isHouseToHouse}
                onChange={(e) => {
                  setIsHouseToHouse(e.target.checked);
                  if (e.target.checked && (!dropoffStation || dropoffStation.includes('Terminal'))) {
                    setDropoffStation(`House-to-house near ${destinationCity || 'the destination city'}`);
                  }
                }}
                className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Drop-off Coverage Area
              </label>
              <input
                type="text"
                value={dropoffStation}
                onChange={(e) => setDropoffStation(e.target.value)}
                placeholder={`House-to-house near ${destinationCity || 'the destination city'}`}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Phone GPRS / GPS Vehicle Allocation */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Share live vehicle location</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  While this page is open and location permission is allowed, your phone GPS updates the vehicle pin. For privacy, sharing should run only during an active trip.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition active:scale-95"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Reading GPRS...' : '🛰️ Read Phone GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleLiveBeacon}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    liveBeaconActive
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                  title="Continuously broadcast location while driving"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{liveBeaconActive ? 'GPS sharing on' : 'Start GPS sharing'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">On this web app, GPS sharing may stop when LoopOut is closed or the phone suspends the browser. Keep LoopOut open during the trip to keep the map updated.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Vehicle Address (auto-allocated by GPS or enter manually)
              </label>
              <input
                type="text"
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder="e.g. Park Station, Rissik St, Johannesburg / N1 Kranskop Toll Plaza"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              {coordinates?.lat && coordinates?.lng && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-mono flex items-center gap-1">
                  <span>GPS Coordinates:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {Number(coordinates.lat).toFixed(4)}, {Number(coordinates.lng).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Trip Status on Map */}
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">
              Trip Status on Google Map & Radar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCurrentStatus(opt.value)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-between ${
                    currentStatus === opt.value
                      ? `${opt.color} border-current ring-2 ring-current/20 scale-[1.02]`
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {currentStatus === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Banking Details ─────────────────────────────── */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              🏦 <span>Banking Details (Passenger EFT Payments)</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Bank</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Capitec">Capitec</option>
                  <option value="FNB">FNB</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="African Bank">African Bank</option>
                  <option value="Discovery Bank">Discovery Bank</option>
                  <option value="TymeBank">TymeBank</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                <select
                  value={bankAccountType}
                  onChange={(e) => setBankAccountType(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Savings">Savings</option>
                  <option value="Cheque">Cheque / Current</option>
                  <option value="Transmission">Transmission</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Holder</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Full name as on bank account"
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="e.g. 62012345678"
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Branch Code</label>
                <input
                  type="text"
                  value={bankBranchCode}
                  onChange={(e) => setBankBranchCode(e.target.value)}
                  placeholder="e.g. 250655"
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Reference <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  placeholder="e.g. your name, or leave blank"
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-600/20 flex items-center gap-2 transition active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Route, Schedule & Location</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverScheduleModal;
