import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Plus, 
  Search, 
  Navigation, 
  Ticket, 
  ShieldCheck, 
  Car, 
  Users,
  ArrowRightLeft,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ShuttleMap from '../components/shuttle/ShuttleMap';
import UberDriverCard from '../components/shuttle/UberDriverCard';
import PickupRequestSheet from '../components/shuttle/PickupRequestSheet';
import DriverShuttleUploadModal from '../components/shuttle/DriverShuttleUploadModal';
import DriverScheduleModal from '../components/shuttle/DriverScheduleModal';
import ShuttleBookingsList from '../components/shuttle/ShuttleBookingsList';

const POPULAR_CORRIDORS = [
  { label: 'All South Africa', serviceType: 'all', origin: '', dest: '' },
  { label: 'JHB ➔ Polokwane', serviceType: 'interprovincial', origin: 'Johannesburg', dest: 'Polokwane' },
  { label: 'Pretoria ➔ Durban', serviceType: 'interprovincial', origin: 'Pretoria', dest: 'Durban' },
  { label: 'JHB ➔ Nelspruit', serviceType: 'interprovincial', origin: 'Johannesburg', dest: 'Mbombela' },
  { label: 'Polokwane Local', serviceType: 'local', origin: 'Polokwane', dest: '' },
];

const ShuttlePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  // Search and filter states
  const [serviceType, setServiceType] = useState('all');
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Modals & Drawers state
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [showDriverDeskModal, setShowDriverDeskModal] = useState(false);
  const [showDriverUploadModal, setShowDriverUploadModal] = useState(false);
  const [selectedShuttleForBooking, setSelectedShuttleForBooking] = useState(null);
  const [shuttleForScheduleModal, setShuttleForScheduleModal] = useState(null);
  const [highlightedShuttle, setHighlightedShuttle] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

  // 2km Trip Alert & User Location States
  const [userLocation, setUserLocation] = useState(null);
  const [tripAlert, setTripAlert] = useState(null);
  // Use a ref (not state) for dismissedAlerts so dismissing doesn't trigger
  // a re-render that re-creates handleProximityAlert and re-fires the map effect.
  const dismissedAlertsRef = useRef({});

  // Auto-locate passenger GPS for 2km proximity alerts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (latitude && longitude) {
            setUserLocation({ lat: latitude, lng: longitude });
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // Data states
  const [shuttles, setShuttles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myDriverShuttles, setMyDriverShuttles] = useState([]);

  // Auto-open driver registration modal when URL has ?register=true
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setShowDriverUploadModal(true);
    }
  }, [searchParams]);

  const fetchMyDriverShuttles = async () => {
    try {
      const res = await axios.get('/api/shuttles/my-shuttles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.data?.success) {
        setMyDriverShuttles(res.data.shuttles || []);
      }
    } catch (err) {
      // Driver might have no shuttles yet or not signed in
    }
  };

  useEffect(() => {
    if (showDriverDeskModal) {
      fetchMyDriverShuttles();
    }
  }, [showDriverDeskModal]);

  const fetchShuttles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (serviceType !== 'all') params.serviceType = serviceType;
      if (originFilter.trim()) params.originCity = originFilter.trim();
      if (destFilter.trim()) params.destinationCity = destFilter.trim();
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const res = await axios.get('/api/shuttles/get', { params });
      if (res.data?.success) {
        const list = res.data.shuttles || [];
        setShuttles(list);

        // If shuttleId was requested via query param, select it and open card
        const paramId = searchParams.get('shuttleId');
        if (paramId) {
          const match = list.find((s) => String(s._id) === String(paramId));
          if (match) {
            setHighlightedShuttle(match);
            setIsCardOpen(true);
          }
        } else {
          // Keep current selected shuttle or default to first for quick reference
          setHighlightedShuttle((prev) => {
            if (prev && list.some((s) => String(s._id) === String(prev._id))) {
              return list.find((s) => String(s._id) === String(prev._id));
            }
            return list.length > 0 ? list[0] : null;
          });
        }
      }
    } catch (err) {
      console.error('Error fetching shuttles:', err);
      setError('Unable to load shuttles right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShuttles();
  }, [serviceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchModal(false);
    fetchShuttles();
  };

  const handleSwapRoute = () => {
    const temp = originFilter;
    setOriginFilter(destFilter);
    setDestFilter(temp);
  };

  const handleSelectCorridor = (corridor) => {
    setServiceType(corridor.serviceType);
    setOriginFilter(corridor.origin);
    setDestFilter(corridor.dest);
    setSearchTerm('');
    setShowSearchModal(false);
    setTimeout(() => {
      fetchShuttles();
    }, 50);
  };

  // Live GPS poll callback — called by ShuttleMap every 10s when drivers broadcast
  const handleLiveRefresh = useCallback((freshShuttles) => {
    setShuttles(freshShuttles);
    // Keep selected shuttle in sync with its fresh coordinates
    setHighlightedShuttle((prev) => {
      if (!prev) return prev;
      const updated = freshShuttles.find((s) => String(s._id) === String(prev._id));
      return updated || prev;
    });
  }, []);

  // Map Car Click: opens card by fade-in; tapping same car toggles fade-out
  const handleSelectShuttle = (shuttle) => {
    if (!shuttle) {
      setIsCardOpen(false);
      return;
    }
    if (isCardOpen && highlightedShuttle && String(highlightedShuttle._id) === String(shuttle._id)) {
      setIsCardOpen(false); // Toggle fade-out
    } else {
      setHighlightedShuttle(shuttle);
      setIsCardOpen(true); // Open by fade-in
    }
  };

  // Web Audio Proximity Alert Chime (880Hz ➔ 1174Hz sine chime) + Haptics
  const playTripAlertChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      if (navigator.vibrate) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch (e) {}
  }, []);

  // 2km Proximity Alert Callback from map
  const handleProximityAlert = useCallback((alertData) => {
    const { shuttle, distanceKm } = alertData;
    if (!shuttle?._id) return;

    // Check if dismissed recently (within 10 minutes) — read from ref to avoid dep changes
    const dismissedAt = dismissedAlertsRef.current[shuttle._id];
    if (dismissedAt && Date.now() - dismissedAt < 1000 * 60 * 10) {
      return;
    }

    setTripAlert((prev) => {
      // If newly entering within 2km, play chime
      if (!prev || String(prev.shuttle?._id) !== String(shuttle._id)) {
        playTripAlertChime();
      }
      return { shuttle, distanceKm };
    });
  // dismissedAlertsRef is a ref — stable, never changes identity, so empty deps is correct
  }, [playTripAlertChime]);

  const handleDismissAlert = (shuttleId) => {
    setTripAlert(null);
    if (shuttleId) {
      // Write to ref instead of state to avoid re-render → re-trigger chain
      dismissedAlertsRef.current[shuttleId] = Date.now();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col relative">
      {/* ── Top Sleek Uber Navigation Bar ─────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-3 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Back to Home + Search Icon Trigger */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            {/* Clean Search Icon Trigger */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-full bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition shadow-sm flex items-center gap-1.5"
              title="Search Shuttle Route"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">Search Route</span>
            </button>
          </div>

          {/* Right: Boarding Passes, Driver Desk & Register Shuttle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* My Passes Icon Button */}
            <button
              type="button"
              onClick={() => setShowTicketsModal(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5"
              title="My Boarding Passes"
            >
              <Ticket className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden md:inline">My Passes</span>
            </button>

            {/* Driver Desk Icon Button */}
            <button
              type="button"
              onClick={() => setShowDriverDeskModal(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5"
              title="Driver Request Desk"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Driver Desk</span>
            </button>

            {/* Register Shuttle / Drive Button */}
            <button
              type="button"
              onClick={() => setShowDriverUploadModal(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-gray-950 shadow-md shadow-amber-400/20 active:scale-95 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Uber Layout: 100% Full Width Map Edge-to-Edge with 100% Bottom Card ── */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {/* ── 2km Trip Proximity Alert Banner ── */}
        {tripAlert && (
          <div className="fixed top-14 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xl z-50 animate-slide-up-fade">
            <div className="bg-gradient-to-r from-gray-950 via-teal-950 to-gray-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-teal-400 flex items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400 text-teal-300 flex items-center justify-center shrink-0 relative">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-400 animate-ping absolute -top-1 -right-1" />
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-400 text-gray-950">
                      🚨 2 KM TRIP ALERT
                    </span>
                    <span className="text-xs font-bold text-amber-300 animate-pulse">
                      ~{tripAlert.distanceKm.toFixed(1)} km away ({Math.max(1, Math.ceil(tripAlert.distanceKm * 2))} mins)
                    </span>
                  </div>

                  <div className="text-sm font-extrabold truncate text-white mt-1">
                    {tripAlert.shuttle?.plateNumber} • {tripAlert.shuttle?.driverName}
                  </div>

                  <p className="text-[11px] text-gray-300 truncate">
                    Shuttle is approaching your pickup point. Please get ready to board!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {tripAlert.shuttle?.driverPhone && (
                  <a
                    href={`tel:${tripAlert.shuttle.driverPhone}`}
                    className="px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDismissAlert(tripAlert.shuttle?._id)}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition active:scale-95"
                  title="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BIG MAP FILLING FULL SCREEN */}
        <div className="w-full h-full flex-1">
          <ShuttleMap
            shuttles={shuttles}
            selectedShuttle={isCardOpen ? highlightedShuttle : null}
            onSelectShuttle={handleSelectShuttle}
            onRequestPickup={(shuttle) => {
              setHighlightedShuttle(shuttle);
              setIsCardOpen(true);
              setSelectedShuttleForBooking(shuttle);
            }}
            onLiveRefresh={handleLiveRefresh}
            userLocation={userLocation}
            onUserLocationChange={(loc) => setUserLocation(loc)}
            onProximityAlert={handleProximityAlert}
            heightClass="h-full"
          />
        </div>

        {/* 100% FULL WIDTH BOTTOM CARD (COMING UP FROM DOWN / FADE-IN & SLIDE DOWN / FADE-OUT) */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 w-full transition-all duration-300 ease-out ${
            isCardOpen && highlightedShuttle
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-full">
            {highlightedShuttle && (
              <UberDriverCard
                key={highlightedShuttle._id}
                shuttle={highlightedShuttle}
                allShuttles={shuttles}
                onSelectShuttle={handleSelectShuttle}
                onRequestPickup={(s) => setSelectedShuttleForBooking(s)}
                currentUser={currentUser}
                userLocation={userLocation}
                onClose={() => setIsCardOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Small floating prompt pill when card is closed */}
        <div
          className={`fixed bottom-3 left-0 right-0 z-20 flex justify-center pointer-events-none transition-all duration-300 ease-out ${
            !isCardOpen
              ? 'translate-y-0 opacity-100'
              : 'translate-y-6 opacity-0 pointer-events-none'
          }`}
        >
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                if (highlightedShuttle) {
                  setIsCardOpen(true);
                } else if (shuttles.length > 0) {
                  setHighlightedShuttle(shuttles[0]);
                  setIsCardOpen(true);
                }
              }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-center shadow-xl flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 hover:scale-105 active:scale-95 transition"
            >
              <Bus className="w-4 h-4 text-teal-600 animate-pulse" />
              <span>👆 Tap any vehicle on the map to view driver & book</span>
            </button>
          </div>
        </div>
      </main>

      {/* ── Slide-Up Search Modal (Triggered by Search Icon next to Home) ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Search Shuttle Routes</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="p-5 space-y-4">
              {/* Origin City */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  From (Origin City)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-teal-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Johannesburg, Pretoria..."
                    value={originFilter}
                    onChange={(e) => setOriginFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Destination City */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    To (Destination City)
                  </label>
                  <button
                    type="button"
                    onClick={handleSwapRoute}
                    className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Polokwane, Durban, Mbombela..."
                    value={destFilter}
                    onChange={(e) => setDestFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Transit Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Transit Scope
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Transit Types</option>
                  <option value="interprovincial">🛣️ Inter-Provincial</option>
                  <option value="local">📍 Local Express / Town</option>
                </select>
              </div>

              {/* Quick Popular Corridors */}
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Popular Corridors:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CORRIDORS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => handleSelectCorridor(c)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition"
                >
                  Filter Map Vehicles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── My Boarding Passes Drawer / Modal ─────────────────────────── */}
      {showTicketsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
                <Ticket className="w-4 h-4 text-teal-600" />
                <span>My Shuttle Boarding Passes</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketsModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <ShuttleBookingsList role="passenger" currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}

      {/* ── Driver Request Desk Drawer / Modal ────────────────────────── */}
      {showDriverDeskModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Driver Request Desk & Fleet</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDriverDeskModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Fleet List */}
              {myDriverShuttles.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                      My Registered Shuttles ({myDriverShuttles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDriverUploadModal(true)}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      + Add Route
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {myDriverShuttles.map((shuttle) => (
                      <div
                        key={shuttle._id}
                        className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold truncate">{shuttle.originCity} ➔ {shuttle.destinationCity}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{shuttle.plateNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShuttleForScheduleModal(shuttle);
                            setShowDriverDeskModal(false);
                          }}
                          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600"
                        >
                          ⚙️ Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ShuttleBookingsList role="driver" currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Up Pickup Request Sheet ("Filler sheet going up") ───── */}
      {selectedShuttleForBooking && (
        <PickupRequestSheet
          shuttle={selectedShuttleForBooking}
          isOpen={!!selectedShuttleForBooking}
          onClose={() => setSelectedShuttleForBooking(null)}
          currentUser={currentUser}
          onSuccess={() => {
            fetchShuttles();
          }}
        />
      )}

      {/* ── Driver Schedule & Route Edit Modal ───────────────────────── */}
      {shuttleForScheduleModal && (
        <DriverScheduleModal
          shuttle={shuttleForScheduleModal}
          isOpen={!!shuttleForScheduleModal}
          onClose={() => setShuttleForScheduleModal(null)}
          onUpdated={() => {
            fetchShuttles();
            fetchMyDriverShuttles();
          }}
        />
      )}

      {/* ── Driver Shuttle Registration Modal ────────────────────────── */}
      {showDriverUploadModal && (
        <DriverShuttleUploadModal
          isOpen={showDriverUploadModal}
          onClose={() => setShowDriverUploadModal(false)}
          currentUser={currentUser}
          onSuccess={() => {
            alert('🚐 Shuttle route published successfully! It is now live on the map.');
            setShowDriverUploadModal(false);
            fetchShuttles();
          }}
        />
      )}
    </div>
  );
};

export default ShuttlePage;