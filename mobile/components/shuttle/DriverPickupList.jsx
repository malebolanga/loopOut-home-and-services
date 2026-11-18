import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CalendarDays, Clock3, MapPin, Navigation, RefreshCw, Users } from 'lucide-react';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const scheduledDateKey = (value) => value ? String(value).slice(0, 10) : '';

const formatDepartureDate = (value) => {
  const key = scheduledDateKey(value);
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return 'Date not set';
  return new Date(year, month - 1, day, 12).toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const getDirectionsUrl = (booking, shuttle) => {
  const coordinates = booking.pickupCoordinates;
  const hasCoordinates = coordinates?.lat !== null && coordinates?.lat !== undefined
    && coordinates?.lng !== null && coordinates?.lng !== undefined
    && Number.isFinite(Number(coordinates.lat)) && Number.isFinite(Number(coordinates.lng));
  const destination = hasCoordinates
    ? `${Number(coordinates.lat)},${Number(coordinates.lng)}`
    : [booking.pickupLocation || shuttle.pickupStation, shuttle.originCity].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
};

const DriverPickupList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(resolveApiUrl('/api/shuttle-bookings/driver-bookings'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (!response.data?.success) throw new Error('Could not load confirmed pickups.');
      setBookings(response.data.bookings || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not load confirmed pickups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const tripGroups = useMemo(() => {
    const todayKey = localDateKey();
    const upcomingPaidBookings = bookings.filter((booking) => {
      const shuttle = booking.shuttleRef || {};
      const departureKey = scheduledDateKey(shuttle.departureDate);
      return booking.status === 'paid' && departureKey && departureKey >= todayKey;
    });
    const grouped = new Map();
    upcomingPaidBookings.forEach((booking) => {
      const shuttle = booking.shuttleRef || {};
      const key = `${shuttle._id || booking.shuttleRef}:${scheduledDateKey(shuttle.departureDate)}`;
      if (!grouped.has(key)) grouped.set(key, { shuttle, bookings: [] });
      grouped.get(key).bookings.push(booking);
    });
    return [...grouped.values()].sort((a, b) => scheduledDateKey(a.shuttle.departureDate).localeCompare(scheduledDateKey(b.shuttle.departureDate)));
  }, [bookings]);

  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><RefreshCw className="h-4 w-4 animate-spin" /> Loading confirmed pickups…</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"><p>{error}</p><button type="button" onClick={fetchBookings} className="mt-2 font-bold underline">Try again</button></div>;

  return (
    <section className="space-y-4" aria-labelledby="driver-pickups-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="driver-pickups-heading" className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white"><MapPin className="h-5 w-5 text-emerald-600" />Passenger pickups</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upcoming paid bookings, grouped by trip. Past departure dates disappear automatically.</p>
        </div>
        <button type="button" onClick={fetchBookings} aria-label="Refresh passenger pickups" title="Refresh pickups" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><RefreshCw className="h-4 w-4" /></button>
      </div>

      {tripGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <Users className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-100">No upcoming confirmed pickups</p>
          <p className="mt-1 text-xs text-gray-500">Paid bookings for today or later will appear here. Completed dates are removed from this list.</p>
        </div>
      ) : tripGroups.map(({ shuttle, bookings: tripBookings }) => (
        <article key={`${shuttle._id}-${scheduledDateKey(shuttle.departureDate)}`} className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900 dark:bg-gray-900">
          <header className="border-b border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-gray-950 dark:text-white">{shuttle.originCity || 'Origin'} <span className="text-emerald-700">→</span> {shuttle.destinationCity || 'Destination'}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><CalendarDays className="h-3.5 w-3.5" />{formatDepartureDate(shuttle.departureDate)} <span className="mx-1">·</span><Clock3 className="h-3.5 w-3.5" />{shuttle.departureTime || (shuttle.leavesWhenFull ? 'Leaves when full' : 'Time to be confirmed')}</p>
                <p className="mt-1 text-[11px] text-gray-500">{shuttle.carType} · {shuttle.plateNumber}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">{tripBookings.length} pickup{tripBookings.length === 1 ? '' : 's'}</span>
            </div>
          </header>

          <ol className="divide-y divide-gray-100 dark:divide-gray-800">
            {tripBookings.map((booking, index) => {
              const coordinates = booking.pickupCoordinates;
              const hasPickupPin = coordinates?.lat !== null && coordinates?.lat !== undefined
                && coordinates?.lng !== null && coordinates?.lng !== undefined
                && Number.isFinite(Number(coordinates.lat)) && Number.isFinite(Number(coordinates.lng));
              return (
                <li key={booking._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white"><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-teal-100 text-[11px] text-teal-800 dark:bg-teal-950 dark:text-teal-200">{index + 1}</span>{booking.passengerName || 'Passenger'}{booking.passengerPhone ? <> · <a href={`tel:${booking.passengerPhone}`} className="font-semibold text-teal-700 underline dark:text-teal-300">{booking.passengerPhone}</a></> : null}</p>
                    <p className="mt-1 text-xs text-gray-700 dark:text-gray-200">Pickup: <strong>{booking.pickupLocation || shuttle.pickupStation || 'Address not provided'}</strong></p>
                    <p className="mt-1 text-[11px] text-gray-500">{booking.seatsBooked} seat{booking.seatsBooked === 1 ? '' : 's'}{booking.seatNumbers?.length ? ` · seat ${booking.seatNumbers.join(', ')}` : ''}{booking.ticketCode ? ` · ticket ${booking.ticketCode}` : ''} · {hasPickupPin ? 'GPS pin saved' : 'Address search only'}</p>
                  </div>
                  <a href={getDirectionsUrl(booking, shuttle)} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Navigation className="h-4 w-4" />Directions to pickup</a>
                </li>
              );
            })}
          </ol>
        </article>
      ))}
    </section>
  );
};

export default DriverPickupList;
