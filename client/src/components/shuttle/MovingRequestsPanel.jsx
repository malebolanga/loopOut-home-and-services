import React, { useCallback, useEffect, useState } from 'react';
import { Check, Clock, MapPin, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const MovingRequestsPanel = ({ onClose }) => {
  const [role, setRole] = useState('driver');
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [finalAmounts, setFinalAmounts] = useState({});
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const load = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
      const [res, vehicleRes] = await Promise.all([
        axios.get(resolveApiUrl(`/api/shuttles/moving/requests/mine?role=${role}`), { headers }),
        axios.get(resolveApiUrl('/api/shuttles/moving/vehicles/mine'), { headers }),
      ]);
      setRequests(res.data.requests || []); setVehicles(vehicleRes.data.vehicles || []); setError('');
    }
    catch (err) { setError(err.response?.data?.message || 'Could not load moving requests.'); }
  }, [role]);
  useEffect(() => { load(); }, [load]);
  const update = async (request, status, details = {}) => {
    setBusyId(request._id); setError('');
    try { await axios.patch(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}`), { status, ...details }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not update the request.'); }
    finally { setBusyId(''); }
  };
  const refreshGps = (vehicle) => {
    if (!navigator.geolocation) return setError('This device does not provide GPS.');
    setBusyId(vehicle._id); setError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        await axios.put(resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicle._id}/location`), { currentCoordinates: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy } }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
        await load();
      } catch (err) { setError(err.response?.data?.message || 'Could not update the GPS location.'); }
      finally { setBusyId(''); }
    }, () => { setError('Allow GPS access to update your vehicle location.'); setBusyId(''); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };
  const titleCase = (value) => value?.replace(/_/g, ' ');
  return <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <section onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:rounded-3xl">
      <div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Moving requests</h2><p className="text-xs text-gray-500">No payment is due before the moving service is provided.</p></div><div className="flex gap-2"><button onClick={load} title="Refresh" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><RefreshCw className="h-4 w-4" /></button><button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X /></button></div></div>
      <div className="my-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">{[['driver', 'Requests to me'], ['requester', 'My requests']].map(([value, label]) => <button key={value} onClick={() => setRole(value)} className={`rounded-lg px-3 py-2 text-sm font-bold ${role === value ? 'bg-white shadow dark:bg-gray-700' : ''}`}>{label}</button>)}</div>
      {role === 'driver' && vehicles.length > 0 && <div className="mb-4 space-y-2"><h3 className="text-sm font-bold">My moving vehicles</h3>{vehicles.map((vehicle) => <div key={vehicle._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><div><p className="text-sm font-bold">{vehicle.vehicleDescription} · {vehicle.plateNumber}</p><p className="text-xs capitalize text-gray-500">Admin review: {vehicle.verificationStatus}</p>{vehicle.verificationReviewNote && <p className="mt-1 text-xs text-rose-700">Review note: {vehicle.verificationReviewNote}</p>}{vehicle.verificationStatus === 'approved' && <p className="text-xs text-gray-500">GPS updated {new Date(vehicle.currentCoordinates.updatedAt).toLocaleString()}</p>}</div>{vehicle.verificationStatus === 'approved' && <button disabled={busyId === vehicle._id} onClick={() => refreshGps(vehicle)} className="shrink-0 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busyId === vehicle._id ? 'Updating…' : 'Update GPS'}</button>}</div>)}</div>}
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      {!requests.length && !error && <p className="rounded-2xl bg-gray-50 p-5 text-center text-sm text-gray-500 dark:bg-gray-800">No moving requests yet.</p>}
      <div className="space-y-3">
        {requests.map((request) => <article key={request._id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{role === 'driver' ? request.requesterName : request.vehicleRef?.vehicleDescription}</h3><p className="text-xs capitalize text-gray-500">{request.vehicleRef?.vehicleType} · {titleCase(request.status)}</p></div><span className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-500"><Clock className="h-3 w-3" />{new Date(request.requestedAt).toLocaleString()}</span></div>
          <p className="mt-2 text-sm"><MapPin className="mr-1 inline h-3.5 w-3.5" />{request.pickupAddress} → {request.dropoffAddress}</p>
          {role === 'driver' && request.pickupCoordinates?.lat != null && request.pickupCoordinates?.lng != null && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${request.pickupCoordinates.lat},${request.pickupCoordinates.lng}`} className="mt-1 inline-block text-xs font-bold text-teal-700 underline">Open GPS pickup directions</a>}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{request.itemDescription}</p>
          {role === 'driver' && <p className="mt-2 text-sm">Contact: <a className="font-bold text-teal-700" href={`tel:${request.requesterPhone}`}>{request.requesterName} · {request.requesterPhone}</a></p>}
          {role === 'requester' && request.vehicleRef?.driverPhone && ['accepted', 'service_completed', 'payment_reported', 'paid'].includes(request.status) && <p className="mt-2 text-sm">Driver: <a className="font-bold text-teal-700" href={`tel:${request.vehicleRef.driverPhone}`}>{request.vehicleRef.driverPhone}</a></p>}

          {request.status === 'accepted' && role === 'requester' && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-gray-800 dark:text-gray-300">Your request is accepted. Pay nothing now; the driver will enter the agreed total after the move.</p>}
          {request.status === 'accepted' && role === 'driver' && <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-800"><label className="block text-xs font-semibold">Final amount to collect after the move (R)<input type="number" min="1" step="0.01" value={finalAmounts[request._id] || ''} onChange={(event) => setFinalAmounts((current) => ({ ...current, [request._id]: event.target.value }))} placeholder="Enter agreed final amount after service" className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" /></label><button disabled={busyId === request._id || !Number(finalAmounts[request._id]) || Number(finalAmounts[request._id]) <= 0} onClick={() => update(request, 'service_completed', { finalPrice: Number(finalAmounts[request._id]) })} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Service provided · request payment</button></div>}

          {['service_completed', 'payment_reported', 'paid'].includes(request.status) && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">Final amount: R{Number(request.finalPrice || 0).toFixed(2)}</p>}
          {request.status === 'service_completed' && role === 'requester' && <div className="mt-2"><p className="text-xs text-gray-600 dark:text-gray-300">The service is marked provided. Pay the driver directly now, then record how you paid. LoopOut does not take or process this payment.</p><div className="mt-2 flex flex-wrap gap-2"><button disabled={busyId === request._id} onClick={() => update(request, 'payment_reported', { paymentMethod: 'cash' })} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">I paid cash</button><button disabled={busyId === request._id} onClick={() => update(request, 'payment_reported', { paymentMethod: 'eft' })} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-gray-600">I sent EFT</button></div></div>}
          {request.status === 'service_completed' && role === 'driver' && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Service provided. Waiting for the customer to report payment.</p>}
          {request.status === 'payment_reported' && role === 'requester' && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">You reported {request.paymentMethod?.toUpperCase()} payment. Waiting for the driver to confirm receipt.</p>}
          {request.status === 'payment_reported' && role === 'driver' && <div className="mt-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30"><p className="text-xs text-emerald-900 dark:text-emerald-100">Customer reports {request.paymentMethod?.toUpperCase()} payment. Confirm only after receiving R{Number(request.finalPrice || 0).toFixed(2)}.</p><button disabled={busyId === request._id} onClick={() => update(request, 'paid')} className="mt-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Confirm payment received</button></div>}
          {['paid', 'completed'].includes(request.status) && <p className="mt-2 text-xs font-semibold text-emerald-700">Driver confirmed payment received. Job complete.</p>}

          {role === 'driver' && <div className="mt-3 flex gap-2">{request.status === 'pending' && <><button disabled={busyId === request._id} onClick={() => update(request, 'accepted')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" />Accept</button><button disabled={busyId === request._id} onClick={() => update(request, 'declined')} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold dark:bg-gray-800"><X className="h-3.5 w-3.5" />Decline</button></>}</div>}
        </article>)}
      </div>
    </section>
  </div>;
};

export default MovingRequestsPanel;
