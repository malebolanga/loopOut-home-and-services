import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircle2
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

        // Keep current selected shuttle or default to first
        setHighlightedShuttle((prev) => {
          if (prev && list.some((s) => String(s._id) === String(prev._id))) {
            return list.find((s) => String(s._id) === String(prev._id));
          }
          return list.length > 0 ? list[0] : null;
        });
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between pb-6">
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

      {/* ── Main Uber Layout: 100% Full Width Map Edge-to-Edge ── */}
      <main className="flex-1 w-full flex flex-col">
        {/* BIG MAP AT THE TOP (100% at Left and Right) */}
        <div className="w-full">
          <ShuttleMap
            shuttles={shuttles}
            selectedShuttle={highlightedShuttle}
            onSelectShuttle={(shuttle) => {
              setHighlightedShuttle(shuttle);
            }}
            onRequestPickup={(shuttle) => {
              setHighlightedShuttle(shuttle);
              setSelectedShuttleForBooking(shuttle);
            }}
            onLiveRefresh={handleLiveRefresh}
            heightClass="h-[75vh] sm:h-[82vh] lg:h-[86vh]"
          />
        </div>

        {/* SELECTED CAR APPEARS UNDERNEATH THE MAP */}
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4">
          {highlightedShuttle ? (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
              <UberDriverCard
                shuttle={highlightedShuttle}
                allShuttles={shuttles}
                onSelectShuttle={(s) => setHighlightedShuttle(s)}
                onRequestPickup={(s) => setSelectedShuttleForBooking(s)}
                currentUser={currentUser}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 text-center shadow-lg">
              <Bus className="w-10 h-10 mx-auto text-teal-600 mb-2 animate-pulse" />
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                👆 Tap any vehicle on the live map above to view the driver and request pickup.
              </p>
            </div>
          )}
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