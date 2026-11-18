import React, { useEffect, useState } from 'react';
import { LoaderCircle, MapPin, Truck, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const MovingRequestSheet = ({ vehicle, currentUser, userLocation, onClose, onSuccess }) => {
  const [form, setForm] = useState({ requesterName: currentUser?.name || currentUser?.username || '', requesterPhone: currentUser?.phone || '', pickupAddress: '', dropoffAddress: '', movingSuggestion: '', itemDescription: '', requestedAt: '' });
  const [pickupCoordinates, setPickupCoordinates] = useState(userLocation || null);
  const [pickupTiming, setPickupTiming] = useState('now');
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userLocation?.lat != null && userLocation?.lng != null) setPickupCoordinates(userLocation);
  }, [userLocation]);

  const capturePickupLocation = () => {
    if (!navigator.geolocation) { setError('This device does not provide GPS location.'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPickupCoordinates({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
      setLocating(false);
    }, () => {
      setError('Allow location access to include your phone GPS position with the pickup request.');
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const pickupDate = pickupTiming === 'now' ? new Date(Date.now() + 5 * 60 * 1000) : new Date(form.requestedAt);
      const response = await axios.post(resolveApiUrl('/api/shuttles/moving/requests'), { vehicleId: vehicle._id, ...form, itemDescription: [form.movingSuggestion, form.itemDescription.trim()].filter(Boolean).join(' — '), requestedAt: pickupDate.toISOString(), ...(pickupCoordinates ? { pickupCoordinates: { lat: pickupCoordinates.lat, lng: pickupCoordinates.lng } } : {}) }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      onSuccess?.(response.data.request); onClose();
    } catch (err) { setError(err.response?.data?.message || 'Could not send your request. Sign in and try again.'); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[1250] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] max-h-[90dvh] min-h-0 w-full max-w-lg space-y-4 overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl [-webkit-overflow-scrolling:touch] dark:bg-gray-900 sm:rounded-3xl">
      <div className="flex items-start justify-between"><div className="flex gap-3"><Truck className="mt-1 text-teal-700" /><div><h2 className="text-lg font-bold">Request {vehicle.vehicleType}</h2><p className="text-sm text-gray-500">{vehicle.vehicleDescription} · R{vehicle.hourlyRate}/hour{vehicle.callOutFee ? ` · R${vehicle.callOutFee} call-out` : ''}</p><p className="mt-1 text-xs text-gray-500">Driver is {vehicle.distanceKm} km away</p></div></div><button type="button" onClick={onClose} aria-label="Close"><X /></button></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Your name<input required maxLength={100} value={form.requesterName} onChange={(event) => setForm({ ...form, requesterName: event.target.value })} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" /></label><label className="block text-sm font-semibold">Contact phone<input required type="tel" maxLength={32} value={form.requesterPhone} onChange={(event) => setForm({ ...form, requesterPhone: event.target.value })} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" /></label></div>
      <label className="block text-sm font-semibold">Pickup address<input required maxLength={300} value={form.pickupAddress} onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })} placeholder="Street address, suburb, city" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" /></label>
      <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Pickup GPS location</p><p className="mt-0.5 text-xs text-gray-500">Share your phone location so the driver can find the pickup point.</p></div><button type="button" onClick={capturePickupLocation} disabled={locating || busy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 disabled:opacity-60 dark:bg-teal-950/40 dark:text-teal-200">{locating ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}{locating ? 'Locating…' : pickupCoordinates ? 'Refresh GPS' : 'Use my GPS'}</button></div>{pickupCoordinates && <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">GPS included · {Number(pickupCoordinates.lat).toFixed(5)}, {Number(pickupCoordinates.lng).toFixed(5)}{pickupCoordinates.accuracy ? ` · ±${Math.round(pickupCoordinates.accuracy)} m` : ''}</p>}</div>
      <label className="block text-sm font-semibold">Drop-off address<input required maxLength={300} value={form.dropoffAddress} onChange={(event) => setForm({ ...form, dropoffAddress: event.target.value })} placeholder="Destination address" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" /></label>
      <label className="block text-sm font-semibold">What do you need moved?<select required value={form.movingSuggestion} onChange={(event) => setForm({ ...form, movingSuggestion: event.target.value })} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"><option value="" disabled>Select what best describes your move</option><option>Furniture or a large appliance</option><option>A few boxes or household items</option><option>One room or a small flat</option><option>A home with several rooms</option><option>Office equipment or supplies</option><option>Other items</option></select></label>
      <label className="block text-sm font-semibold">Add details for the driver <span className="font-normal text-gray-500">(optional)</span><textarea maxLength={800} value={form.itemDescription} onChange={(event) => setForm({ ...form, itemDescription: event.target.value })} placeholder="List large items, stairs, or loading help you need" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" /></label>
      <div className="space-y-2"><p className="text-sm font-semibold">Pickup date and time</p><div className="grid grid-cols-2 gap-2"><button type="button" aria-pressed={pickupTiming === 'now'} onClick={() => setPickupTiming('now')} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${pickupTiming === 'now' ? 'border-teal-700 bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200' : 'border-gray-200 dark:border-gray-700'}`}>Now · as soon as possible</button><button type="button" aria-pressed={pickupTiming === 'scheduled'} onClick={() => setPickupTiming('scheduled')} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${pickupTiming === 'scheduled' ? 'border-teal-700 bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200' : 'border-gray-200 dark:border-gray-700'}`}>Choose date & time</button></div>{pickupTiming === 'scheduled' && <label className="block text-sm font-semibold"><span className="sr-only">Scheduled pickup date and time</span><input required type="datetime-local" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} value={form.requestedAt} onChange={(event) => setForm({ ...form, requestedAt: event.target.value })} className="w-full rounded-xl border px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" /></label>}{pickupTiming === 'now' && <p className="text-xs text-gray-500">Your request is sent now. The pickup time is marked as soon as possible for the driver.</p>}</div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send request to driver'}</button>
      <p className="text-xs text-gray-500">The driver must accept your request. No payment is due now. Pay the agreed final amount only after the moving service has been provided.</p>
    </form>
  </div>;
};

export default MovingRequestSheet;
