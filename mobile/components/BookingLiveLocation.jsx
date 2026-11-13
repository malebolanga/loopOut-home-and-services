import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const ACTIVE_STATUSES = new Set(['confirmed', 'approved', 'assigned', 'enroute', 'ongoing']);
const isServiceBooking = (booking) => Boolean(booking?.helper || booking?.service || ['helper', 'service'].includes(booking?.type));

const toPoint = (position) => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
});

export default function BookingLiveLocation({ bookingId, booking, status, viewerRole }) {
  const canShare = viewerRole === 'provider';
  const canView = viewerRole === 'customer';
  const eligible = isServiceBooking(booking) && ACTIVE_STATUSES.has(status || booking?.status);
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const watchId = useRef(null);
  const lastSentAt = useRef(0);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const loadLocation = useCallback(async () => {
    if (!bookingId || !eligible || (!canShare && !canView)) return;
    try {
      const response = await authenticatedFetch(`/api/bookings/${bookingId}/live-location`);
      if (!response.ok) return;
      const data = await response.json();
      setSharing(Boolean(data.sharing));
      setLocation(data.sharing ? data : null);
      if (data.sharing && canShare) lastSentAt.current = Date.now();
    } catch {
      // A transient poll failure should not hide the rest of the booking screen.
    }
  }, [bookingId, canShare, canView, eligible]);

  useEffect(() => {
    loadLocation();
    if (!canView || !eligible) return undefined;
    const intervalId = window.setInterval(loadLocation, 12000);
    return () => window.clearInterval(intervalId);
  }, [canView, eligible, loadLocation]);

  useEffect(() => {
    if (!canShare || !sharing || !eligible || !navigator.geolocation) return undefined;
    watchId.current = navigator.geolocation.watchPosition(async (position) => {
      if (Date.now() - lastSentAt.current < 12000) return;
      lastSentAt.current = Date.now();
      const point = toPoint(position);
      try {
        const response = await authenticatedFetch(`/api/bookings/${bookingId}/live-location`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(point),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error || 'Location update paused. Check your connection and booking status.');
          setSharing(false);
          stopWatching();
          return;
        }
        setLocation({ ...point, sharing: true, updatedAt: new Date().toISOString() });
        setError('');
      } catch {
        setError('Could not update location. Sharing will resume when the connection returns.');
      }
    }, () => {
      setError('Location access was interrupted. Check your phone’s location permission.');
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });

    return stopWatching;
  }, [bookingId, canShare, eligible, sharing, stopWatching]);

  useEffect(() => () => stopWatching(), [stopWatching]);

  const startSharing = async () => {
    setError('');
    if (!navigator.geolocation) {
      setError('This device does not support location sharing.');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await authenticatedFetch(`/api/bookings/${bookingId}/live-location`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toPoint(position)),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not start location sharing.');
        lastSentAt.current = Date.now();
        setLocation({ ...toPoint(position), sharing: true, updatedAt: new Date().toISOString() });
        setSharing(true);
      } catch (shareError) {
        setError(shareError.message || 'Could not start location sharing.');
      } finally {
        setBusy(false);
      }
    }, (geoError) => {
      setError(geoError.code === geoError.PERMISSION_DENIED
        ? 'Allow LoopOut to use your location while you travel to this booking.'
        : 'Could not get your location. Turn on location services and try again.');
      setBusy(false);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  };

  const stopSharing = async () => {
    setBusy(true);
    stopWatching();
    try {
      const response = await authenticatedFetch(`/api/bookings/${bookingId}/live-location`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not stop sharing. Please try again.');
      setSharing(false);
      setLocation(null);
      setError('');
    } catch (stopError) {
      setError(stopError.message || 'Could not stop sharing. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!bookingId || !eligible || (!canShare && !canView)) return null;

  if (canShare) {
    return (
      <section className="rounded-xl border border-sky-100 bg-sky-50/80 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/30" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sky-700 shadow-sm dark:bg-gray-900 dark:text-sky-300">
            <MapPinIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Arrival location</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Share your device-reported location with this customer while travelling. Keep this screen open; sharing stops when you stop or the booking ends, and stale updates expire after two minutes.
            </p>
            {error && <p role="alert" className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300">{error}</p>}
            <button
              type="button"
              onClick={sharing ? stopSharing : startSharing}
              disabled={busy}
              className={`mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${sharing ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900'}`}
            >
              <ShieldCheckIcon className="h-4 w-4" />
              {busy ? 'Updating…' : sharing ? 'Stop sharing' : 'Share live location'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-sky-100 bg-sky-50/80 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/30" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sky-700 shadow-sm dark:bg-gray-900 dark:text-sky-300">
          <MapPinIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Provider arrival</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{sharing ? 'Live location is being shared for this booking.' : 'The provider has not started sharing their location yet.'}</p>
          {sharing && location?.updatedAt && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Last updated {new Date(location.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
        </div>
        {location?.latitude != null && location?.longitude != null && (
          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm hover:bg-sky-100 dark:bg-gray-900 dark:text-sky-300"
          >
            Open map
          </a>
        )}
      </div>
    </section>
  );
}
