import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, Clock3, LoaderCircle, MapPin, Navigation, Power, Search, ShieldCheck, Wrench, XCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const SERVICES = [
  ['cleaning', 'Home cleaning'], ['domestic', 'Domestic help'], ['handyman', 'Handyman'], ['moving', 'Moving help'],
  ['carwash', 'Car wash'], ['barber', 'Barber'], ['beauty', 'Beauty'], ['chef', 'Chef'], ['photography', 'Photography'],
  ['tutor', 'Tutor'], ['errand', 'Errands'], ['other', 'Other service'],
];
const labelFor = (type) => SERVICES.find(([id]) => id === type)?.[1] || type;
const defaultDate = () => { const d = new Date(Date.now() + 60 * 60 * 1000); return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); };
const getPosition = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error('Location is unavailable on this device.'));
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
    (error) => reject(new Error(error.code === 1 ? 'Allow location access to match you with nearby workers.' : 'Could not get your location. Check GPS and try again.')),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30_000 },
  );
});
const api = async (path, options) => {
  const response = await authenticatedFetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Could not complete this action.');
  return data;
};

export default function WorkNow() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({ online: false, serviceTypes: [] });
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ serviceType: 'cleaning', description: '', address: '', scheduledFor: defaultDate(), budget: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [availabilityData, jobsData] = await Promise.all([api('/api/work-now/availability'), api('/api/work-now')]);
      setAvailability(availabilityData.availability || { online: false, serviceTypes: [] });
      setJobs(jobsData.jobs || []);
    } catch (err) { setError(err.message); }
  }, [currentUser]);

  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 15_000); return () => window.clearInterval(timer); }, [refresh]);

  // While the worker opts in as available, refresh GPS so stale provider locations
  // cannot receive new requests. Turning availability off stops location updates.
  useEffect(() => {
    if (!availability.online) return undefined;
    const heartbeat = window.setInterval(async () => {
      try {
        const coords = await getPosition();
        await api('/api/work-now/availability', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ online: true, ...coords }) });
      } catch { /* A failed GPS refresh will naturally make the worker unavailable. */ }
    }, 2 * 60 * 1000);
    return () => window.clearInterval(heartbeat);
  }, [availability.online]);

  const myJobs = useMemo(() => jobs.filter((job) => String(job.customer?._id || job.customer) === String(currentUser?._id)), [jobs, currentUser]);
  const workerJobs = useMemo(() => jobs.filter((job) => job.status === 'searching' && !(job.declinedBy || []).some((person) => String(person?._id || person) === String(currentUser?._id)) && (job.offeredTo || []).some((person) => String(person?._id || person) === String(currentUser?._id))), [jobs, currentUser]);
  const assignedJobs = useMemo(() => jobs.filter((job) => String(job.acceptedBy?._id || job.acceptedBy || '') === String(currentUser?._id)), [jobs, currentUser]);

  const toggleOnline = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const coords = availability.online ? {} : await getPosition();
      const data = await api('/api/work-now/availability', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ online: !availability.online, ...coords }) });
      setAvailability(data.availability);
      setNotice(data.availability.online ? 'You are online. Nearby service requests can reach you.' : 'You are offline. Location sharing has stopped.');
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const submitRequest = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const coords = await getPosition();
      const data = await api('/api/work-now', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ...coords, scheduledFor: new Date(form.scheduledFor).toISOString(), budget: Number(form.budget) || 0, radiusKm: 15 }) });
      setNotice(`Your request was sent to ${data.matchedWorkers} nearby ${data.matchedWorkers === 1 ? 'worker' : 'workers'}. The first worker to accept gets the job.`);
      setForm((current) => ({ ...current, description: '', address: '', budget: '', scheduledFor: defaultDate() }));
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const respond = async (jobId, action) => {
    setBusy(true); setError('');
    try { await api(`/api/work-now/${jobId}/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const updateStatus = async (jobId, status) => {
    setBusy(true); setError('');
    try { await api(`/api/work-now/${jobId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const cancel = async (jobId) => {
    setBusy(true); setError('');
    try { await api(`/api/work-now/${jobId}/cancel`, { method: 'POST' }); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  if (!currentUser) return <main className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="text-2xl font-black">Find a nearby worker</h1><p className="mt-2 text-sm text-slate-500">Sign in to request or accept local service jobs.</p><button onClick={() => navigate('/sign-in')} className="mt-5 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white">Sign in</button></main>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 pb-28 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-rose-300">LoopOut · Local services</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Work Now</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Request nearby service workers for cleaning, grooming, repairs and other local jobs. No passenger rides.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <form onSubmit={submitRequest} className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
            <div><h2 className="text-lg font-black text-slate-900 dark:text-white">Request a worker</h2><p className="mt-1 text-xs text-slate-500">Your request is sent to matching workers within 15 km. The first to accept gets it.</p></div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Service needed<select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-950">{SERVICES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Describe the job<textarea required maxLength={1200} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What needs to be done? Include useful details." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-950" /></label>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Service address<input required maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, suburb and city" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-950" /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">When do you need help?<input required type="datetime-local" min={defaultDate()} value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-950" /></label><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Budget (optional)<span className="mt-1.5 flex rounded-xl border border-slate-200 dark:border-gray-700"><span className="px-3 py-3 text-sm text-slate-400">R</span><input type="number" min="0" step="1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Amount" className="min-w-0 flex-1 rounded-r-xl bg-white px-2 py-3 text-sm dark:bg-gray-950" /></span></label></div>
            <p className="flex items-start gap-2 text-[11px] text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />Your exact address is only shown to the worker who accepts. GPS is used to match nearby workers.</p>
            <button disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-60"><Search className="h-4 w-4" />{busy ? 'Finding workers…' : 'Find nearby workers'}</button>
          </form>

          <div className="space-y-4">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
              <div className="flex items-start gap-3"><div className={`rounded-xl p-3 ${availability.online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300'}`}><Activity className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h2 className="font-black text-slate-900 dark:text-white">Worker availability</h2><p className="mt-1 text-xs text-slate-500">{availability.online ? `Online for ${availability.serviceTypes.map(labelFor).join(', ')}` : 'Go online to receive matching job requests.'}</p></div></div>
              <button type="button" onClick={toggleOnline} disabled={busy} className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white disabled:opacity-60 ${availability.online ? 'bg-slate-800 hover:bg-slate-900' : 'bg-emerald-600 hover:bg-emerald-700'}`}><Power className="h-4 w-4" />{busy ? 'Updating…' : availability.online ? 'Go offline' : 'Go online'}</button>
              <p className="mt-2 flex items-start gap-1.5 text-[10px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />GPS is shared only while you are online and stops when you go offline.</p>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
              <h2 className="font-black text-slate-900 dark:text-white">Requests sent to you <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">{workerJobs.length}</span></h2>
              {!availability.online && <p className="mt-2 text-xs text-slate-500">Go online to receive new nearby requests.</p>}
              <div className="mt-3 space-y-3">{workerJobs.map((job) => <article key={job._id} className="rounded-2xl border border-slate-200 p-3 dark:border-gray-700"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{labelFor(job.serviceType)}</span><span className="text-[10px] text-slate-500">{new Date(job.scheduledFor).toLocaleString()}</span></div><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{job.description}</p><p className="mt-1 text-[10px] text-slate-500">{job.address}{job.budget ? ` · Budget R${job.budget}` : ''}</p><div className="mt-3 flex gap-2"><button disabled={busy} onClick={() => respond(job._id, 'accept')} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Accept job</button><button disabled={busy} onClick={() => respond(job._id, 'decline')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-gray-700 dark:text-gray-300">Decline</button></div></article>)}{availability.online && !workerJobs.length && <p className="text-xs text-slate-500">You are ready. New matching requests will appear here.</p>}</div>
            </section>
          </div>
        </section>

        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
          <h2 className="font-black text-slate-900 dark:text-white">Your service requests</h2>
          {!myJobs.length && <p className="mt-2 text-xs text-slate-500">Requests you send and their status will show here.</p>}
          <div className="mt-3 grid gap-3 md:grid-cols-2">{myJobs.map((job) => <article key={job._id} className="rounded-2xl border border-slate-200 p-4 dark:border-gray-700"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-black">{labelFor(job.serviceType)}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600 dark:bg-gray-800 dark:text-gray-200">{job.status}</span></div><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{job.description}</p><p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500"><Clock3 className="h-3.5 w-3.5" />{new Date(job.scheduledFor).toLocaleString()}</p>{job.acceptedBy && <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Accepted by {job.acceptedBy.username || 'a local worker'}{job.acceptedBy.phone ? ` · ${job.acceptedBy.phone}` : ''}</p>}{job.status === 'searching' && <button disabled={busy} onClick={() => cancel(job._id)} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600">Cancel request</button>}</article>)}</div>
        </section>

        {!!assignedJobs.length && <section className="space-y-3"><h2 className="font-black text-slate-900 dark:text-white">Jobs you accepted</h2>{assignedJobs.map((job) => <article key={job._id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900"><div className="flex items-center justify-between gap-2"><p className="text-sm font-black">{labelFor(job.serviceType)} · {job.customer?.username || 'Customer'}</p><span className="text-xs capitalize text-slate-500">{job.status}</span></div><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{job.address} · {job.description}</p><div className="mt-3 flex flex-wrap gap-2">{job.status === 'accepted' && <button disabled={busy} onClick={() => updateStatus(job._id, 'enroute')} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Navigation className="mr-1 inline h-3 w-3" />On my way</button>}{['accepted', 'enroute'].includes(job.status) && <button disabled={busy} onClick={() => updateStatus(job._id, 'ongoing')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white"><Wrench className="mr-1 inline h-3 w-3" />Start job</button>}{job.status === 'ongoing' && <button disabled={busy} onClick={() => updateStatus(job._id, 'completed')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="mr-1 inline h-3 w-3" />Complete job</button>}</div></article>)}</section>}
      </div>
    </main>
  );
}
