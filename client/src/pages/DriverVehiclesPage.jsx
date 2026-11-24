import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bus, CalendarClock, CheckCircle2, Loader2, Plus, RefreshCw, Route, Truck, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiBaseUrl';
import { getStoredToken } from '../utils/authenticatedFetch';
import DriverAddRouteModal from '../components/shuttle/DriverAddRouteModal';
import DriverScheduleModal from '../components/shuttle/DriverScheduleModal';

const DriverVehiclesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeVehicle, setRouteVehicle] = useState(null);
  const [scheduleVehicle, setScheduleVehicle] = useState(null);
  const [activatingRouteId, setActivatingRouteId] = useState('');
  const [activationMessage, setActivationMessage] = useState('');
  const [activationError, setActivationError] = useState('');

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = currentUser?.token || currentUser?.access_token || getStoredToken();
      const response = await axios.get(resolveApiUrl('/api/shuttles/my-shuttles'), {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.data?.success) throw new Error(response.data?.message || 'Could not load your vehicles.');
      setVehicles(response.data.shuttles || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not load your vehicles. Please sign in and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const onRouteAdded = () => {
    setRouteVehicle(null);
    loadVehicles();
  };

  const activateRoute = async (route) => {
    setActivatingRouteId(route._id);
    setActivationMessage('');
    setActivationError('');
    try {
      const token = currentUser?.token || currentUser?.access_token || getStoredToken();
      const response = await axios.post(resolveApiUrl(`/api/shuttles/activate-route/${route._id}`), {}, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.data?.success) throw new Error(response.data?.message || 'Could not activate this saved route.');
      setActivationMessage(`${route.originCity} → ${route.destinationCity} is active again with fresh seats. Departure time ${route.departureTime} was reused.`);
      await loadVehicles();
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.message;
      const endpointUnavailable = requestError.response?.status === 404
        && (!serverMessage || /api endpoint not found|cannot post/i.test(serverMessage));
      setActivationError(endpointUnavailable
        ? 'Route activation is not available on the connected server yet. No trip was created. The shuttle API update must be deployed before you can use this button.'
        : serverMessage || requestError.message || 'Could not activate this saved route.');
    } finally {
      setActivatingRouteId('');
    }
  };

  return (
    <main className="fixed inset-0 z-[80] h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-slate-50 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-slate-900 dark:bg-gray-950 dark:text-white sm:px-6" style={{ animation: 'driverWorkspaceEnter 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
      <style>{'@keyframes driverWorkspaceEnter{from{transform:translateY(100%);opacity:.82}to{transform:translateY(0);opacity:1}}'}</style>
      <div className="mx-auto max-w-5xl">
        <div className="sticky top-0 z-20 -mx-4 mb-2 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-slate-50/95 px-4 py-2 backdrop-blur dark:border-gray-800/70 dark:bg-gray-950/95 sm:-mx-6 sm:px-6">
          <Link to="/shuttles?tab=driver-desk" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-teal-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-teal-300">
            <ArrowLeft className="h-4 w-4" /> Back to driver desk
          </Link>
          <button type="button" onClick={() => navigate('/shuttles')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800" aria-label="Close driver workspace and return to the map">
            <X className="h-4 w-4" /><span>Close</span>
          </button>
        </div>

        <section className="mt-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><Bus className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Driver workspace</span></div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">My vehicles & routes</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-gray-400">Manage your shuttle vehicles, add routes for vehicles you already registered, and update departure times.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/shuttles?register=true" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"><Plus className="h-4 w-4" /> Register vehicle</Link>
            <button type="button" onClick={loadVehicles} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800" aria-label="Refresh vehicles"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
          </div>
        </section>

        {!currentUser && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Sign in to see and manage your vehicles.</div>}
        {error && <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</div>}
        {activationMessage && <div role="status" className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{activationMessage}</div>}
        {activationError && <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{activationError}</div>}
        {loading ? <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading your vehicles…</div> : !error && vehicles.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"><Bus className="h-7 w-7" /></span>
            <h2 className="mt-4 text-lg font-bold">No shuttle vehicles yet</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-gray-400">Register your driver documents and vehicle first. After approval, you can add more routes here without entering the vehicle again.</p>
            <Link to="/shuttles?register=true" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"><Plus className="h-4 w-4" /> Register a shuttle</Link>
          </section>
        ) : !error && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-700 dark:text-gray-200">Registered shuttle routes <span className="ml-1 text-slate-400">{vehicles.length}</span></h2></div>
            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              {vehicles.map((vehicle) => {
                const isFullyBooked = Number(vehicle.availableSeats) <= 0
                  && ['scheduled', 'boarding', 'en_route'].includes(vehicle.currentStatus);
                const statusLabel = isFullyBooked ? 'Fully booked'
                  : vehicle.currentStatus === 'en_route' ? 'On trip'
                    : ['completed', 'arrived', 'cancelled'].includes(vehicle.currentStatus)
                      ? (vehicle.currentStatus === 'cancelled' ? 'Cancelled' : 'Trip complete')
                      : vehicle.currentStatus === 'boarding' ? 'Boarding' : 'Scheduled';
                return <article key={vehicle._id} className={`min-w-0 w-full max-w-full rounded-2xl border bg-white p-4 shadow-sm dark:bg-gray-900 ${isFullyBooked ? 'border-red-300 dark:border-red-900/70' : 'border-slate-200 dark:border-gray-800'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">{vehicle.vehicleCategory === 'moving' ? <Truck className="h-5 w-5" /> : <Bus className="h-5 w-5" />}</span>
                      <div className="min-w-0"><h3 className="truncate font-bold">{vehicle.originCity || 'Origin'} <span className="text-teal-600">→</span> {vehicle.destinationCity || 'Destination'}</h3><p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{vehicle.plateNumber || 'Vehicle registration'} · {vehicle.vehicleName || vehicle.vehicleType || 'Shuttle'}</p></div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isFullyBooked ? 'border border-gray-400 bg-red-600 text-white ring-1 ring-gray-300' : vehicle.currentStatus === 'en_route' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' : ['completed', 'arrived', 'cancelled'].includes(vehicle.currentStatus) ? 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'}`}>{statusLabel}</span>
                  </div>
                  {isFullyBooked && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 dark:bg-red-950/30 dark:text-red-200">All {vehicle.totalSeats} seats are reserved. Passengers can see this route, but can’t book another seat.</p>}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-gray-800">
                    {['completed', 'arrived', 'cancelled'].includes(vehicle.currentStatus) && <button type="button" onClick={() => activateRoute(vehicle)} disabled={Boolean(activatingRouteId)} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"><Route className="h-3.5 w-3.5" />{activatingRouteId === vehicle._id ? 'Activating…' : 'Activate Route'}</button>}
                    <button type="button" onClick={() => setRouteVehicle(vehicle)} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800"><Route className="h-3.5 w-3.5" /> Add route</button>
                    <button type="button" onClick={() => setScheduleVehicle(vehicle)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><CalendarClock className="h-3.5 w-3.5" /> Departure & details</button>
                  </div>
                </article>;
              })}
            </div>
          </section>
        )}
      </div>

      {routeVehicle && <DriverAddRouteModal key={`${routeVehicle._id}-route`} shuttle={routeVehicle} onClose={() => setRouteVehicle(null)} onSuccess={onRouteAdded} />}
      {scheduleVehicle && <DriverScheduleModal shuttle={scheduleVehicle} isOpen onClose={() => setScheduleVehicle(null)} onUpdated={() => { setScheduleVehicle(null); loadVehicles(); }} />}
    </main>
  );
};

export default DriverVehiclesPage;
