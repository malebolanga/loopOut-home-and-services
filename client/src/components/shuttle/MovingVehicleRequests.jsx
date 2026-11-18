import React, { useCallback, useEffect, useState } from 'react';
import { Check, Clock, MapPin, Phone, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const MovingVehicleRequests = ({ vehicleId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
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

  const decide = async (request, status) => {
    setBusyId(request._id);
    setError('');
    try {
      await axios.patch(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}`), { status }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
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
        </article>)}</div>}
  </div>;
};

export default MovingVehicleRequests;
