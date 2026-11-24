import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Clock, MapPin, Power, RefreshCw, Star, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';
import { geocodeAddress, reverseGeocodeArea } from '../../utils/geocoding';
import { getStoredToken } from '../../utils/authenticatedFetch';
import { capturePrecisePhoneLocation } from '../../utils/preciseLocation';

const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const MovingRequestsPanel = ({ onClose, onUpdated }) => {
  const [role, setRole] = useState('driver');
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [manualAddresses, setManualAddresses] = useState({});
  const [quoteAmounts, setQuoteAmounts] = useState({});
  const [cancelReasons, setCancelReasons] = useState({});
  const [issueForms, setIssueForms] = useState({});
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const load = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [res, vehicleRes] = await Promise.all([
        axios.get(resolveApiUrl(`/api/shuttles/moving/requests/mine?role=${role}`), { withCredentials: true, headers }),
        axios.get(resolveApiUrl('/api/shuttles/moving/vehicles/mine'), { withCredentials: true, headers }),
      ]);
      setRequests(res.data.requests || []); setVehicles(vehicleRes.data.vehicles || []); setError('');
    }
    catch (err) { setError(err.response?.data?.message || 'Could not load moving requests.'); }
  }, [role]);
  useEffect(() => { load(); }, [load]);
  const update = async (request, status, details = {}) => {
    setBusyId(request._id); setError('');
    try { await axios.patch(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}`), { status, ...details }, { withCredentials: true, headers: getAuthHeaders() }); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not update the request.'); }
    finally { setBusyId(''); }
  };
  const reportIssue = async (request) => {
    const form = issueForms[request._id] || {};
    setBusyId(request._id); setError('');
    try { await axios.post(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}/issues`), form, { withCredentials: true, headers: getAuthHeaders() }); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not send the issue report.'); }
    finally { setBusyId(''); }
  };
  const submitRating = async (request) => {
    const rating = ratingDrafts[request._id] || {};
    setBusyId(request._id); setError('');
    try { await axios.post(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}/rating`), { stars: rating.stars, review: rating.review || '' }, { withCredentials: true, headers: getAuthHeaders() }); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not submit your rating.'); }
    finally { setBusyId(''); }
  };
  const refreshGps = async (vehicle) => {
    setBusyId(vehicle._id); setError(''); setSuccessMessage('');
    try {
      const { coords } = await capturePrecisePhoneLocation();
      const address = await reverseGeocodeArea(coords.latitude, coords.longitude);
      await axios.put(resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicle._id}/location`), { currentCoordinates: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, address, locationSource: 'gps' } }, { withCredentials: true, headers: getAuthHeaders() });
      await load();
      const displayLocation = address || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (GPS)`;
      setSuccessMessage(`GPS location updated for ${vehicle.vehicleDescription || 'Vehicle'} (${vehicle.plateNumber || 'registration plate unavailable'}) at ${displayLocation} with ±${coords.accuracy.toFixed(1)} m reported accuracy.`);
      if (typeof onUpdated === 'function') onUpdated();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Could not update the GPS location.'); }
    finally { setBusyId(''); }
  };
  const repostVehicle = async (vehicle) => {
    setBusyId(vehicle._id); setError(''); setSuccessMessage('');
    try {
      let coords = null;
      let address = '';
      try {
        const loc = await capturePrecisePhoneLocation();
        coords = loc.coords;
        address = await reverseGeocodeArea(coords.latitude, coords.longitude);
      } catch (locErr) {
        if (!vehicle.currentCoordinates || !vehicle.currentCoordinates.lat) {
          throw locErr;
        }
      }
      const payload = coords
        ? { currentCoordinates: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, address, locationSource: 'gps' } }
        : (vehicle.currentCoordinates ? { currentCoordinates: vehicle.currentCoordinates } : {});

      await axios.post(resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicle._id}/repost`), payload, { withCredentials: true, headers: getAuthHeaders() });
      await load();
      const displayLocation = address || (coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (GPS)` : (vehicle.currentCoordinates?.address || 'saved location'));
      const accText = coords && Number.isFinite(coords.accuracy) ? ` with ±${coords.accuracy.toFixed(1)} m reported accuracy` : '';
      setSuccessMessage(`${vehicle.vehicleDescription || 'Vehicle'} (${vehicle.plateNumber || 'registration plate unavailable'}) was reposted successfully at ${displayLocation}${accText}. It is active on the map.`);
      if (typeof onUpdated === 'function') onUpdated();
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || err.message || 'Could not repost this approved vehicle.');
    } finally { setBusyId(''); }
  };
  const saveAddressLocation = async (vehicle) => {
    const address = String(manualAddresses[vehicle._id] || '').trim();
    if (!address) return setError('Enter the street, suburb, or town where the truck is parked.');
    setBusyId(vehicle._id); setError(''); setSuccessMessage('');
    try {
      const point = await geocodeAddress(`${address}, South Africa`);
      if (!point) throw new Error('Address not found. Add a street, suburb, or town and try again.');
      const currentCoordinates = { ...point, address, accuracy: null, locationSource: 'address' };
      if (vehicle.active) {
        await axios.put(resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicle._id}/location`), { currentCoordinates }, { withCredentials: true, headers: getAuthHeaders() });
      } else {
        await axios.post(resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicle._id}/repost`), { currentCoordinates }, { withCredentials: true, headers: getAuthHeaders() });
      }
      await load();
      setSuccessMessage(`${vehicle.vehicleDescription || 'Vehicle'} (${vehicle.plateNumber || 'registration plate unavailable'}) ${vehicle.active ? 'location updated' : 'reposted'} at ${address}.`);
      if (typeof onUpdated === 'function') onUpdated();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Could not save the address location.'); }
    finally { setBusyId(''); }
  };
  const closeVehicle = async (vehicle) => {
    setBusyId(vehicle._id); setError(''); setSuccessMessage('');
    try {
      await axios.post(resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicle._id}/close`), {}, { withCredentials: true, headers: getAuthHeaders() });
      await load();
      setSuccessMessage(`${vehicle.vehicleDescription || 'Vehicle'} (${vehicle.plateNumber || 'registration plate unavailable'}) is closed and hidden from the map.`);
      if (typeof onUpdated === 'function') onUpdated();
    } catch (err) { setError(err.response?.data?.message || 'Could not close this vehicle.'); }
    finally { setBusyId(''); }
  };
  const titleCase = (value) => value?.replace(/_/g, ' ');
  const pickupDirectionsUrl = (request) => {
    const destination = request.pickupCoordinates?.lat != null && request.pickupCoordinates?.lng != null
      ? `${request.pickupCoordinates.lat},${request.pickupCoordinates.lng}`
      : request.pickupAddress || '';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  };
  const nextStep = (request) => {
    if (request.status === 'pending') return role === 'driver' ? 'Review the request, then accept or decline it.' : 'Waiting for the driver to accept or decline.';
    if (request.status === 'declined') return 'The driver declined this request. You can request another vehicle.';
    if (request.status === 'cancelled') return 'This request is cancelled.';
    if (request.status === 'accepted' && request.quoteStatus === 'pending') return role === 'requester' ? 'Review the driver’s quote and approve or decline it before work starts.' : 'Waiting for the customer to respond to your quote.';
    if (request.status === 'accepted' && request.quoteStatus === 'declined') return role === 'driver' ? 'Send a revised quote if you want to continue.' : 'Waiting for a revised quote from the driver.';
    if (request.status === 'accepted' && request.quoteStatus === 'accepted') return role === 'driver' ? 'Start the move when agreed with the customer.' : 'The quote is agreed. Wait for the driver to start the move.';
    if (request.status === 'in_progress') return role === 'driver' ? 'Mark the service provided when the move is finished.' : 'The move is in progress. Pay only after the service is provided.';
    if (request.status === 'service_completed') return role === 'requester' ? 'Pay the agreed amount directly to the driver, then report how you paid.' : 'Waiting for the customer to report payment.';
    if (request.status === 'payment_reported') return role === 'driver' ? 'Confirm receipt only after the payment has reached you.' : 'Waiting for the driver to confirm receipt.';
    if (request.status === 'paid') return role === 'requester' ? 'Payment is confirmed. You can rate the service.' : 'Payment receipt is confirmed and the request is complete.';
    return '';
  };
  return <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <section onClick={(event) => event.stopPropagation()} className="max-h-[90vh] max-h-[90dvh] overscroll-contain w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl [-webkit-overflow-scrolling:touch] dark:bg-gray-900 sm:rounded-3xl">
      <div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Moving requests</h2><p className="text-xs text-gray-500">No payment is due before the moving service is provided.</p></div><div className="flex gap-2"><button onClick={load} title="Refresh" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><RefreshCw className="h-4 w-4" /></button><button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X /></button></div></div>
      <div className="my-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">{[['driver', 'Requests to me'], ['requester', 'My requests']].map(([value, label]) => <button key={value} onClick={() => setRole(value)} className={`rounded-lg px-3 py-2 text-sm font-bold ${role === value ? 'bg-white shadow dark:bg-gray-700' : ''}`}>{label}</button>)}</div>
      {role === 'driver' && vehicles.length > 0 && <div className="mb-4 space-y-2">
        <h3 className="text-sm font-bold">My moving vehicles</h3>
        {vehicles.map((vehicle) => {
          const activeJob = requests.find((request) => String(request.vehicleRef?._id || request.vehicleRef) === String(vehicle._id) && ['pending', 'accepted', 'in_progress'].includes(request.status));
          return <div key={vehicle._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <div className="min-w-0"><p className="text-sm font-bold">{vehicle.vehicleDescription} · {vehicle.plateNumber}</p><p className="text-xs capitalize text-gray-500">Admin review: {vehicle.verificationStatus} · {vehicle.active ? 'On map' : 'Hidden from map'}</p>{vehicle.verificationReviewNote && <p className="mt-1 text-xs text-rose-700">Review note: {vehicle.verificationReviewNote}</p>}{vehicle.verificationStatus === 'approved' && <p className="text-xs text-gray-500">GPS updated {vehicle.currentCoordinates?.updatedAt ? new Date(vehicle.currentCoordinates.updatedAt).toLocaleString() : 'time unavailable'}</p>}</div>
            {vehicle.verificationStatus === 'approved' && <div className="flex flex-wrap gap-2"><button disabled={busyId === vehicle._id || Boolean(activeJob)} onClick={() => vehicle.active ? closeVehicle(vehicle) : repostVehicle(vehicle)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50 ${activeJob ? 'bg-rose-700' : vehicle.active ? 'bg-slate-800 hover:bg-slate-700' : 'bg-teal-700 hover:bg-teal-800'}`}>{activeJob?.status === 'pending' ? 'Booked · review request' : activeJob ? 'Booked · finish job first' : busyId === vehicle._id ? vehicle.active ? 'Closing…' : 'Reposting…' : vehicle.active ? <><Power className="mr-1 inline h-3.5 w-3.5" />Log off truck</> : 'Repost'}</button>{vehicle.active && <button disabled={busyId === vehicle._id} onClick={() => refreshGps(vehicle)} className="shrink-0 rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-gray-600">{busyId === vehicle._id ? 'Updating…' : 'Update GPS'}</button>}</div>}
            {vehicle.verificationStatus === 'approved' && <div className="flex w-full flex-col gap-2 sm:flex-row"><input value={manualAddresses[vehicle._id] ?? ''} onChange={(event) => setManualAddresses((current) => ({ ...current, [vehicle._id]: event.target.value }))} placeholder="Street, suburb, or town if GPS is unavailable" className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950" /><button disabled={busyId === vehicle._id || Boolean(activeJob) || !String(manualAddresses[vehicle._id] || '').trim()} onClick={() => saveAddressLocation(vehicle)} className="shrink-0 rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-gray-600">{vehicle.active ? 'Update at address' : 'Repost at address'}</button></div>}
          </div>;
        })}
      </div>}
      {successMessage && <div role="status" className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" /><span className="flex-1">{successMessage}</span><button type="button" onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"><X className="h-3.5 w-3.5" /></button></div>}
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      {!requests.length && !error && <p className="rounded-2xl bg-gray-50 p-5 text-center text-sm text-gray-500 dark:bg-gray-800">No moving requests yet.</p>}
      <div className="space-y-3">
        {requests.map((request) => <article key={request._id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{role === 'driver' ? request.requesterName : request.vehicleRef?.vehicleDescription}</h3><p className="text-xs capitalize text-gray-500">{request.vehicleRef?.vehicleType} · {titleCase(request.status)}</p></div><span className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-500"><Clock className="h-3 w-3" />{new Date(request.requestedAt).toLocaleString()}</span></div>
          {nextStep(request) && <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-900 dark:bg-teal-950/30 dark:text-teal-100"><strong>Next step:</strong> {nextStep(request)}</p>}
          <p className="mt-2 text-sm"><MapPin className="mr-1 inline h-3.5 w-3.5" />{request.pickupAddress} → {request.dropoffAddress}</p>
          {role === 'driver' && <a target="_blank" rel="noreferrer" href={pickupDirectionsUrl(request)} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-teal-700 underline"><MapPin className="h-3.5 w-3.5" />Navigate to pickup</a>}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{request.itemDescription}</p>
          {role === 'driver' && <p className="mt-2 text-sm">Contact: <a className="font-bold text-teal-700" href={`tel:${request.requesterPhone}`}>{request.requesterName} · {request.requesterPhone}</a></p>}
          {role === 'requester' && request.vehicleRef?.driverPhone && ['accepted', 'service_completed', 'payment_reported', 'paid'].includes(request.status) && <p className="mt-2 text-sm">Driver: <a className="font-bold text-teal-700" href={`tel:${request.vehicleRef.driverPhone}`}>{request.vehicleRef.driverPhone}</a></p>}

          {request.status === 'accepted' && role === 'requester' && <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-800">{request.quoteStatus === 'pending' ? <><p className="text-sm font-bold">Driver quote: R{Number(request.quoteAmount || 0).toFixed(2)}</p><p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Approve the price before the move starts. Payment is due only after the service is provided.</p><div className="mt-2 flex gap-2"><button disabled={busyId === request._id} onClick={() => update(request, 'quote_accepted')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve quote</button><button disabled={busyId === request._id} onClick={() => update(request, 'quote_declined')} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-gray-600">Decline quote</button></div></> : request.quoteStatus === 'accepted' ? <p className="text-xs text-gray-700 dark:text-gray-200">You approved R{Number(request.quoteAmount || 0).toFixed(2)}. No payment is due until the move is complete.</p> : request.quoteStatus === 'declined' ? <p className="text-xs text-gray-700 dark:text-gray-200">You declined the last quote. Wait for the driver to send a revised price.</p> : <p className="text-xs text-gray-700 dark:text-gray-200">The driver accepted your request. No payment is due now; review and approve the quote before the move starts.</p>}</div>}
          {request.status === 'accepted' && role === 'driver' && <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-800">{request.quoteStatus === 'pending' ? <p className="text-xs text-gray-700 dark:text-gray-200">Quote sent: R{Number(request.quoteAmount || 0).toFixed(2)}. Waiting for the customer to approve or decline.</p> : request.quoteStatus === 'accepted' ? <><p className="text-sm font-bold">Customer approved R{Number(request.quoteAmount || 0).toFixed(2)}</p><p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Collect this agreed amount only after the move is complete.</p><button disabled={busyId === request._id} onClick={() => update(request, 'in_progress')} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Start moving service</button></> : <><label className="block text-xs font-semibold">{request.quoteStatus === 'declined' ? 'Revised quote for the customer (R)' : 'Quote for the customer (R)'}<input type="number" min="1" max="10000000" step="0.01" value={quoteAmounts[request._id] || ''} onChange={(event) => setQuoteAmounts((current) => ({ ...current, [request._id]: event.target.value }))} placeholder="Enter the total before starting" className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" /></label><button disabled={busyId === request._id || !Number(quoteAmounts[request._id]) || Number(quoteAmounts[request._id]) <= 0} onClick={() => update(request, 'quote_proposed', { quoteAmount: Number(quoteAmounts[request._id]) })} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Send quote for approval</button></>}</div>}
          {request.status === 'in_progress' && role === 'driver' && <div className="mt-3 rounded-xl bg-teal-50 p-3 dark:bg-teal-950/30"><p className="text-xs font-semibold">Moving service is in progress · agreed amount R{Number(request.quoteAmount || 0).toFixed(2)}</p><button disabled={busyId === request._id} onClick={() => update(request, 'service_completed')} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Finish job · request payment</button></div>}
          {request.status === 'in_progress' && role === 'requester' && <p className="mt-3 rounded-xl bg-teal-50 p-3 text-xs text-teal-900 dark:bg-teal-950/30 dark:text-teal-100">Your move is in progress. Agreed price: R{Number(request.quoteAmount || 0).toFixed(2)}. Payment is due only after the move is complete.</p>}

          {['service_completed', 'payment_reported', 'paid'].includes(request.status) && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">Final amount: R{Number(request.finalPrice || 0).toFixed(2)}</p>}
          {request.status === 'service_completed' && role === 'requester' && <div className="mt-2"><p className="text-xs text-gray-600 dark:text-gray-300">The service is marked provided. Pay the driver directly now, then record how you paid. LoopOut does not take or process this payment.</p><div className="mt-2 flex flex-wrap gap-2"><button disabled={busyId === request._id} onClick={() => update(request, 'payment_reported', { paymentMethod: 'cash' })} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">I paid cash</button><button disabled={busyId === request._id} onClick={() => update(request, 'payment_reported', { paymentMethod: 'eft' })} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-gray-600">I sent EFT</button></div></div>}
          {request.status === 'service_completed' && role === 'driver' && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Service provided. Waiting for the customer to report payment.</p>}
          {request.status === 'payment_reported' && role === 'requester' && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">You reported {request.paymentMethod?.toUpperCase()} payment. Waiting for the driver to confirm receipt.</p>}
          {request.status === 'payment_reported' && role === 'driver' && <div className="mt-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30"><p className="text-xs text-emerald-900 dark:text-emerald-100">Customer reports {request.paymentMethod?.toUpperCase()} payment. Confirm only after receiving R{Number(request.finalPrice || 0).toFixed(2)}.</p><button disabled={busyId === request._id} onClick={() => update(request, 'paid')} className="mt-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Confirm payment received</button></div>}
          {['paid', 'completed'].includes(request.status) && <p className="mt-2 text-xs font-semibold text-emerald-700">Driver confirmed payment received. Job complete.</p>}

          {request.status === 'cancelled' && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">Cancelled by {request.cancelledByRole || 'a participant'}: {request.cancellationReason || 'Reason not recorded'}</p>}
          {request.issueStatus === 'open' && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><p className="font-bold">Support issue: {titleCase(request.issueType)}</p><p className="mt-1">{request.issueDescription}</p><p className="mt-1">LoopOut support has been notified.</p></div>}
          {request.issueStatus === 'resolved' && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 dark:bg-gray-800 dark:text-gray-200"><p className="font-bold">Support issue reviewed</p><p className="mt-1">{request.issueResolutionNote}</p></div>}
          {role === 'requester' && request.status === 'paid' && !request.ratingStars && <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"><p className="text-sm font-bold">Rate your moving service</p><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((stars) => <button key={stars} type="button" aria-label={`${stars} star${stars === 1 ? '' : 's'}`} onClick={() => setRatingDrafts((current) => ({ ...current, [request._id]: { ...(current[request._id] || {}), stars } }))} className="rounded p-1"><Star className={`h-6 w-6 ${stars <= (ratingDrafts[request._id]?.stars || 0) ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} /></button>)}</div><textarea maxLength={500} value={ratingDrafts[request._id]?.review || ''} onChange={(event) => setRatingDrafts((current) => ({ ...current, [request._id]: { ...(current[request._id] || {}), review: event.target.value } }))} placeholder="Share a short review (optional)" className="mt-2 w-full rounded-lg border p-2 text-xs dark:border-gray-700 dark:bg-gray-950" /><button disabled={busyId === request._id || !ratingDrafts[request._id]?.stars} onClick={() => submitRating(request)} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Submit rating</button></div>}
          {role === 'requester' && request.ratingStars && <p className="mt-3 text-xs font-semibold text-amber-700">Your rating: {'★'.repeat(request.ratingStars)}{'☆'.repeat(5 - request.ratingStars)}{request.ratingReview ? ` · ${request.ratingReview}` : ''}</p>}
          {role === 'requester' && (request.issueStatus || 'none') === 'none' && ['accepted', 'in_progress', 'service_completed', 'payment_reported', 'paid', 'cancelled'].includes(request.status) && <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"><p className="flex items-center gap-1 text-xs font-bold"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" />Report a pickup or service issue</p><div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_2fr]"><select value={issueForms[request._id]?.issueType || 'driver_no_show'} onChange={(event) => setIssueForms((current) => ({ ...current, [request._id]: { issueType: event.target.value, description: current[request._id]?.description || '' } }))} className="rounded-lg border p-2 text-xs dark:border-gray-700 dark:bg-gray-950"><option value="driver_no_show">Driver did not arrive</option><option value="late_pickup">Driver is late</option><option value="customer_no_show">Customer unavailable</option><option value="damage">Item damage</option><option value="price_dispute">Price dispute</option><option value="safety">Safety concern</option><option value="other">Other issue</option></select><textarea maxLength={1000} value={issueForms[request._id]?.description || ''} onChange={(event) => setIssueForms((current) => ({ ...current, [request._id]: { issueType: current[request._id]?.issueType || 'driver_no_show', description: event.target.value } }))} placeholder="Describe what happened (at least 10 characters)" className="rounded-lg border p-2 text-xs dark:border-gray-700 dark:bg-gray-950" /></div><button disabled={busyId === request._id || (issueForms[request._id]?.description || '').trim().length < 10} onClick={() => reportIssue(request)} className="mt-2 rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800 disabled:opacity-50 dark:border-amber-900 dark:text-amber-200">Send to LoopOut support</button></div>}
          {['pending', 'accepted'].includes(request.status) && <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"><label className="block text-xs font-semibold">Cancel before the move starts<input maxLength={500} value={cancelReasons[request._id] || ''} onChange={(event) => setCancelReasons((current) => ({ ...current, [request._id]: event.target.value }))} placeholder="Reason for cancellation" className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950" /></label><button disabled={busyId === request._id || (cancelReasons[request._id] || '').trim().length < 3} onClick={() => update(request, 'cancelled', { reason: cancelReasons[request._id] })} className="mt-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300">Cancel request</button></div>}

          {role === 'driver' && <div className="mt-3 flex gap-2">{request.status === 'pending' && <><button disabled={busyId === request._id} onClick={() => update(request, 'accepted')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" />Accept</button><button disabled={busyId === request._id} onClick={() => update(request, 'declined')} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold dark:bg-gray-800"><X className="h-3.5 w-3.5" />Decline</button></>}</div>}
        </article>)}
      </div>
    </section>
  </div>;
};

export default MovingRequestsPanel;
