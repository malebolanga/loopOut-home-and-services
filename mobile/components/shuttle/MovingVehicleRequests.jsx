import React, { useCallback, useEffect, useState } from 'react';
import { Check, Clock, MapPin, Phone, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const MovingVehicleRequests = ({ vehicleId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [quoteAmounts, setQuoteAmounts] = useState({});
  const [cancelReasons, setCancelReasons] = useState({});
  const [error, setError] = useState('');
  const loadRequests = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(resolveApiUrl('/api/shuttles/moving/requests/mine?role=driver'), { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      const incoming = (response.data.requests || []).filter((request) => String(request.vehicleRef?._id || request.vehicleRef) === String(vehicleId));
      incoming.sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0) || new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(incoming);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load requests for this vehicle.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadRequests(true);
    const timer = window.setInterval(() => loadRequests(), 20000);
    return () => window.clearInterval(timer);
  }, [loadRequests]);

  const decide = async (request, status, details = {}) => {
    setBusyId(request._id);
    setError('');
    try {
      await axios.patch(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}`), { status, ...details }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      await loadRequests();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this moving request.');
    } finally {
      setBusyId('');
    }
  };

  const pickupLink = (request) => request.pickupCoordinates?.lat != null && request.pickupCoordinates?.lng != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${request.pickupCoordinates.lat},${request.pickupCoordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.pickupAddress || '')}`;

  return <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
    <div className="flex items-center justify-between gap-2"><div><h3 className="font-bold">Requests for this vehicle</h3><p className="text-xs text-gray-500">Customer, pickup details, destination, and approval actions.</p></div><button type="button" onClick={() => loadRequests(true)} disabled={loading} aria-label="Refresh vehicle requests" className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
    {loading ? <p className="mt-3 text-sm text-gray-500">Loading requests…</p>
      : requests.length === 0 ? <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800">No requests have been sent for this truck yet.</p>
        : <div className="mt-3 space-y-3">{requests.map((request) => <article key={request._id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <div className="flex items-start justify-between gap-2"><div><p className="font-bold">{request.requesterName}</p><a href={`tel:${request.requesterPhone}`} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300"><Phone className="h-3 w-3" />{request.requesterPhone}</a></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ${request.status === 'pending' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{request.status.replace(/_/g, ' ')}</span></div>
          <p className="mt-2 flex items-start gap-1.5 text-xs"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" /><span><strong>Pickup:</strong> {new Date(request.requestedAt).toLocaleString()}<br /><span className="text-gray-500">Request received {new Date(request.createdAt).toLocaleString()}</span></span></p>
          <p className="mt-2 text-xs"><strong>Pick-up point:</strong> {request.pickupAddress}</p>
          <a href={pickupLink(request)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-teal-700 underline dark:text-teal-300"><MapPin className="h-3 w-3" />Open pickup location / directions</a>
          <p className="mt-2 text-xs"><strong>Deliver to:</strong> {request.dropoffAddress}</p>
          {request.itemDescription && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300"><strong>Items:</strong> {request.itemDescription}</p>}
          {request.status === 'pending' && <div className="mt-3 flex gap-2"><button type="button" disabled={busyId === request._id} onClick={() => decide(request, 'accepted')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" />{busyId === request._id ? 'Saving…' : 'Accept request'}</button><button type="button" disabled={busyId === request._id} onClick={() => decide(request, 'declined')} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100"><X className="h-3.5 w-3.5" />Decline</button></div>}
          {request.status === 'accepted' && request.quoteStatus === 'pending' && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">Quote R{Number(request.quoteAmount || 0).toFixed(2)} sent. Waiting for the customer to approve it before the move.</p>}
          {request.status === 'accepted' && request.quoteStatus === 'accepted' && <div className="mt-3 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30"><p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Customer approved R{Number(request.quoteAmount || 0).toFixed(2)}. Collect payment only after the move.</p><button type="button" disabled={busyId === request._id} onClick={() => decide(request, 'in_progress')} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Start moving service</button></div>}
          {request.status === 'in_progress' && <div className="mt-3 rounded-lg bg-teal-50 p-2 dark:bg-teal-950/30"><p className="text-xs font-semibold">Move in progress · agreed amount R{Number(request.quoteAmount || 0).toFixed(2)}</p><button type="button" disabled={busyId === request._id} onClick={() => decide(request, 'service_completed')} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Service provided · request payment</button></div>}
          {request.status === 'accepted' && (!request.quoteStatus || request.quoteStatus === 'not_proposed' || request.quoteStatus === 'declined') && <div className="mt-3 rounded-lg bg-slate-50 p-2 dark:bg-gray-800"><label className="block text-xs font-semibold">{request.quoteStatus === 'declined' ? 'Revised quote (R)' : 'Quote for the customer (R)'}<input type="number" min="1" max="10000000" step="0.01" value={quoteAmounts[request._id] || ''} onChange={(event) => setQuoteAmounts((current) => ({ ...current, [request._id]: event.target.value }))} placeholder="Set the total before starting" className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" /></label><button type="button" disabled={busyId === request._id || !Number(quoteAmounts[request._id]) || Number(quoteAmounts[request._id]) <= 0} onClick={() => decide(request, 'quote_proposed', { quoteAmount: Number(quoteAmounts[request._id]) })} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Send quote for approval</button></div>}
          {request.status === 'service_completed' && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">Service marked complete · agreed payment R{Number(request.finalPrice || 0).toFixed(2)}</p>}
          {request.status === 'cancelled' && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Cancelled: {request.cancellationReason}</p>}
          {['pending', 'accepted'].includes(request.status) && <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700"><input maxLength={500} value={cancelReasons[request._id] || ''} onChange={(event) => setCancelReasons((current) => ({ ...current, [request._id]: event.target.value }))} placeholder="Cancellation reason" className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-950" /><button type="button" disabled={busyId === request._id || (cancelReasons[request._id] || '').trim().length < 3} onClick={() => decide(request, 'cancelled', { reason: cancelReasons[request._id] })} className="mt-2 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300">Cancel request</button></div>}
        </article>)}</div>}
  </div>;
};

export default MovingVehicleRequests;
