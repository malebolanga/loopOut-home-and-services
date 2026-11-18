import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Loader2, MapPin, Navigation, Phone, RefreshCw, Users } from 'lucide-react';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const mapUrl = (value, coordinates, fallback) => {
  const hasCoordinates = coordinates?.lat !== null && coordinates?.lat !== undefined
    && coordinates?.lng !== null && coordinates?.lng !== undefined
    && Number.isFinite(Number(coordinates.lat)) && Number.isFinite(Number(coordinates.lng));
  const destination = hasCoordinates
    ? `${Number(coordinates.lat)},${Number(coordinates.lng)}`
    : [value, fallback].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
};

const DriverTripPassengers = ({ shuttle, onTripFinished }) => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [tripCompleted, setTripCompleted] = useState(shuttle.currentStatus === 'completed');
  const [error, setError] = useState('');

  const refreshPassengers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(resolveApiUrl('/api/shuttle-bookings/driver-bookings'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (!response.data?.success) throw new Error('Could not load this trip’s passengers.');
      const activePassengers = (response.data.bookings || []).filter((booking) => {
        const bookingShuttleId = booking.shuttleRef?._id || booking.shuttleRef;
        return String(bookingShuttleId) === String(shuttle._id)
          && booking.status === 'paid'
          && booking.shuttleRef?.currentStatus !== 'completed'
          && booking.shuttleRef?.currentStatus !== 'cancelled';
      });
      setPassengers(activePassengers);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not load trip passengers.');
    } finally {
      setLoading(false);
    }
  }, [shuttle._id]);

  useEffect(() => {
    setTripCompleted(shuttle.currentStatus === 'completed');
    refreshPassengers();
  }, [refreshPassengers, shuttle.currentStatus]);

  const finishTrip = async () => {
    if (tripCompleted || finishing) return;
    const confirmed = window.confirm('Finish this trip? Paid passengers will move to trip history, unpaid requests will be closed, and the seats will be available for the next trip.');
    if (!confirmed) return;
    setFinishing(true);
    try {
      const response = await axios.put(resolveApiUrl(`/api/shuttles/update-location/${shuttle._id}`), {
        currentStatus: 'completed',
        isLive: false,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      if (!response.data?.success) throw new Error(response.data?.message || 'Could not finish this trip.');
      setTripCompleted(true);
      setPassengers([]);
      onTripFinished?.(response.data.shuttle);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not finish this trip.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 dark:border-teal-900 dark:bg-teal-950/20" aria-labelledby="trip-passengers-title">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 id="trip-passengers-title" className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"><Users className="h-4 w-4 text-teal-700" />Passengers on this trip <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] text-teal-900 dark:bg-teal-900 dark:text-teal-100">{passengers.length}</span></h4>
          <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">Confirmed paid passengers for {shuttle.originCity} → {shuttle.destinationCity}.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {!tripCompleted && <button type="button" onClick={finishTrip} disabled={finishing} className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-gray-700 disabled:opacity-60 dark:bg-gray-700 dark:hover:bg-gray-600"><CheckCircle2 className="h-3.5 w-3.5" />{finishing ? 'Finishing…' : 'Finish trip'}</button>}
          <button type="button" onClick={refreshPassengers} title="Refresh passengers" aria-label="Refresh passengers" className="rounded-lg p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-800"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {tripCompleted ? <div className="rounded-xl bg-white/80 p-4 text-center dark:bg-gray-900/70"><p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Trip completed · passenger list cleared</p><p className="mt-1 text-[11px] text-gray-500">Edit the departure schedule to prepare this vehicle for its next trip.</p></div>
        : loading ? <div className="flex items-center gap-2 py-4 text-xs text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading passengers…</div>
        : error ? <div className="rounded-xl bg-white p-3 text-xs text-rose-700 dark:bg-gray-900 dark:text-rose-300"><p>{error}</p><button type="button" onClick={refreshPassengers} className="mt-1 font-bold underline">Try again</button></div>
          : passengers.length === 0 ? <div className="rounded-xl bg-white/80 p-4 text-center dark:bg-gray-900/70"><p className="text-xs font-semibold text-gray-800 dark:text-gray-100">No confirmed passengers on this car yet</p><p className="mt-1 text-[11px] text-gray-500">Passengers appear here after their payment is confirmed. Completed trips clear this list.</p></div>
            : <ol className="space-y-2">
              {passengers.map((booking, index) => (
                <li key={booking._id} className="rounded-xl border border-teal-100 bg-white p-3 dark:border-teal-900/70 dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white"><span className="mr-1.5 inline-grid h-5 w-5 place-items-center rounded-full bg-teal-100 text-[10px] text-teal-800 dark:bg-teal-950 dark:text-teal-200">{index + 1}</span>{booking.passengerName || 'Passenger'}</p>
                      {booking.passengerPhone ? <a href={`tel:${booking.passengerPhone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 underline dark:text-teal-300"><Phone className="h-3 w-3" />{booking.passengerPhone}</a> : <p className="mt-1 text-[11px] text-gray-500">No phone number on booking</p>}
                    </div>
                    <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{booking.seatsBooked} seat{booking.seatsBooked === 1 ? '' : 's'}{booking.seatNumbers?.length ? ` · ${booking.seatNumbers.join(', ')}` : ''}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <a href={mapUrl(booking.pickupLocation || shuttle.pickupStation, booking.pickupCoordinates, shuttle.originCity)} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-left hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
                      <span className="min-w-0 flex-1"><span className="block text-[9px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Pickup · open map</span><span className="block truncate text-[11px] font-semibold text-gray-800 dark:text-gray-100">{booking.pickupLocation || shuttle.pickupStation || 'Pickup address not provided'}</span></span>
                      <Navigation className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    </a>
                    <a href={mapUrl(booking.dropoffLocation || shuttle.dropoffStation, null, shuttle.destinationCity)} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-left hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:hover:bg-amber-950/60">
                      <MapPin className="h-4 w-4 shrink-0 text-amber-700" />
                      <span className="min-w-0 flex-1"><span className="block text-[9px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Drop-off · open map</span><span className="block truncate text-[11px] font-semibold text-gray-800 dark:text-gray-100">{booking.dropoffLocation || shuttle.dropoffStation || 'Destination not provided'}</span></span>
                      <Navigation className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                    </a>
                  </div>
                </li>
              ))}
            </ol>}
    </section>
  );
};

export default DriverTripPassengers;
