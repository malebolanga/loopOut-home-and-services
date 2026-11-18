import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

const MovingIssuesReview = () => {
  const [issues, setIssues] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/shuttles/moving/admin/issues');
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not load moving service issues.');
      setIssues(data.requests || []);
      setError('');
    } catch (loadError) { setError(loadError.message || 'Could not load moving service issues.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const resolve = async (request) => {
    const note = String(notes[request._id] || '').trim();
    if (note.length < 5) return;
    setBusyId(String(request._id)); setError('');
    try {
      const response = await authenticatedFetch(`/api/shuttles/moving/admin/issues/${request._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not resolve this issue.');
      setIssues((current) => current.filter((item) => String(item._id) !== String(request._id)));
    } catch (resolveError) { setError(resolveError.message || 'Could not resolve this issue.'); }
    finally { setBusyId(''); }
  };
  return <section aria-label="Moving service issue reports" className="mb-8">
    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><AlertTriangle className="h-5 w-5 text-amber-600" />Moving service issues</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Review pickup, damage, safety, and price reports. Add a resolution note so both participants receive the outcome.</p></div><button type="button" onClick={load} disabled={loading} aria-label="Refresh moving issues" className="rounded-lg border p-2 dark:border-gray-700"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
    {error && <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
    {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-500 dark:bg-gray-900">Loading open issues…</p> : issues.length === 0 ? <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-gray-800 dark:bg-gray-900">No open moving service issues.</p> : <div className="space-y-3">{issues.map((request) => <article key={request._id} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900 dark:bg-gray-900"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-bold capitalize text-slate-900 dark:text-white">{String(request.issueType || 'issue').replace(/_/g, ' ')} · {request.vehicleRef?.vehicleDescription || 'Moving vehicle'}</h3><p className="mt-1 text-xs text-slate-500">Reported {request.issueReportedAt ? new Date(request.issueReportedAt).toLocaleString() : 'time unavailable'} by {request.issueReportedByRole || 'participant'}</p></div><p className="text-xs text-slate-500">Request {String(request._id).slice(-8)}</p></div><p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{request.issueDescription}</p><div className="mt-2 grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2"><p>Customer: {request.requesterRef?.name || request.requesterRef?.username} · {request.requesterRef?.email}</p><p>Driver: {request.driverRef?.name || request.driverRef?.username} · {request.driverRef?.email}</p><p>Pickup: {request.pickupAddress}</p><p>Delivery: {request.dropoffAddress}</p></div><label className="mt-3 block text-xs font-semibold">Resolution note<textarea maxLength={1000} rows={2} value={notes[request._id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [request._id]: event.target.value }))} placeholder="Record the outcome or follow-up for both parties." className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950" /></label><div className="mt-3 flex justify-end"><button type="button" disabled={busyId === String(request._id) || String(notes[request._id] || '').trim().length < 5} onClick={() => resolve(request)} className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busyId === String(request._id) ? 'Saving…' : 'Resolve and notify both'}</button></div></article>)}</div>}
  </section>;
};

export default MovingIssuesReview;
