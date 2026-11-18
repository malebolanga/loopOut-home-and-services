import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const ACTIVITY_ACTION_LABELS = {
  search_submitted: 'Submitted a search (search terms are not stored)',
  booking_started: 'Started a booking request',
  booking_submitted: 'Submitted a booking request',
  property_listing_started: 'Started a property listing',
  service_listing_started: 'Started a service listing',
  helper_listing_started: 'Started a helper listing',
  sale_item_started: 'Started an item-for-sale listing',
  listing_step_completed: 'Completed a listing workflow step',
  listing_published: 'Published a listing',
  food_order_submitted: 'Submitted a food order',
  table_reservation_submitted: 'Requested a restaurant reservation',
  item_request_submitted: 'Requested an item for sale',
  profile_updated: 'Updated profile settings',
};

const describeActivityEvent = (event) => {
  if (event.action === 'page_view') return 'Opened the ' + String(event.pageKey || event.section || 'app') + ' section';
  const label = ACTIVITY_ACTION_LABELS[event.action] || 'LoopOut activity';
  const details = [event.workflow, event.step].filter(Boolean).join(' · ');
  return details ? label + ' · ' + details : label;
};

const CHECKS = [
  ['numberMatches', 'The number entered by the applicant matches the number on the PDF'],
  ['documentHasFace', 'The submitted ID or passport PDF shows the applicant’s face'],
  ['faceMatchesSelfie', 'The ID photo matches the live selfie'],
];

export default function AdminVerificationReview() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [driverSubmissions, setDriverSubmissions] = useState([]);
  const [driverChecks, setDriverChecks] = useState({});
  const [driverNotes, setDriverNotes] = useState({});
  const [driverReviewError, setDriverReviewError] = useState('');
  const [movingVehicleReviews, setMovingVehicleReviews] = useState([]);
  const [movingVehicleChecks, setMovingVehicleChecks] = useState({});
  const [movingVehicleNotes, setMovingVehicleNotes] = useState({});
  const [movingVehicleReviewError, setMovingVehicleReviewError] = useState('');
  const [checks, setChecks] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState('');
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState('');
  const [usersOpen, setUsersOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [historyUserId, setHistoryUserId] = useState('');
  const [userHistories, setUserHistories] = useState({});
  const isLoopOutAdmin = ['malebolanga3@gmail.com', 'admin@loopout.co.za'].includes(
    String(currentUser?.email || '').trim().toLowerCase()
  );
  const sectionCategories = (performance?.categories || []).filter((category) =>
    ['food', 'helpers', 'property', 'sell'].includes(String(category.key || '').toLowerCase())
  );
  const sectionMeasures = [
    { key: 'activity', label: 'Activity', available: performance?.activityAvailable },
    { key: 'posts', label: 'Posts', available: true },
    { key: 'bookings', label: 'Requests', available: true },
    { key: 'orders', label: 'Orders', available: true },
    { key: 'activeMinutes', label: 'Minutes', available: performance?.timeAvailable },
  ].filter((measure) => measure.available && sectionCategories.some((category) => category[measure.key] !== null && category[measure.key] !== undefined));
  const sectionLineColors = { food: '#e11d48', helpers: '#7c3aed', property: '#0284c7', sell: '#059669' };
  const sectionPostCount = (key) => {
    const category = sectionCategories.find((item) => String(item.key).toLowerCase() === key);
    return category?.posts === null || category?.posts === undefined ? 'Unavailable' : Number(category.posts).toLocaleString();
  };

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError('');
    setOverviewLoading(true);
    setPerformanceLoading(true);
    const [reviewsResult, overviewResult, performanceResult, driverReviewsResult, movingVehiclesResult] = await Promise.allSettled([
      authenticatedFetch('/api/verification/admin/pending').then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not load identity reviews.');
        return data;
      }),
      authenticatedFetch('/api/stats/admin-overview').then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not load admin dashboard.');
        return data;
      }),
      authenticatedFetch('/api/stats/admin-performance').then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not load section performance.');
        return data;
      }),
      authenticatedFetch('/api/verification/admin/driver-pending').then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not load shuttle driver reviews.');
        return data;
      }),
      authenticatedFetch('/api/shuttles/moving/admin/pending').then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not load truck and minivan reviews.');
        return data;
      }),
    ]);
    if (reviewsResult.status === 'fulfilled') setSubmissions(reviewsResult.value.submissions || []);
    else setError(reviewsResult.reason?.message || 'Could not load identity reviews.');
    if (driverReviewsResult.status === 'fulfilled') {
      setDriverSubmissions(driverReviewsResult.value.submissions || []);
      setDriverReviewError('');
    } else {
      setDriverReviewError(driverReviewsResult.reason?.message || 'Could not load shuttle driver reviews.');
    }
    if (movingVehiclesResult.status === 'fulfilled') {
      setMovingVehicleReviews(movingVehiclesResult.value.vehicles || []);
      setMovingVehicleReviewError('');
    } else {
      setMovingVehicleReviewError(movingVehiclesResult.reason?.message || 'Could not load vehicle reviews.');
    }
    if (overviewResult.status === 'fulfilled') {
      setOverview(overviewResult.value);
      setOverviewError('');
    } else {
      setOverviewError(overviewResult.reason?.message || 'Could not load admin dashboard.');
    }
    if (performanceResult.status === 'fulfilled') {
      setPerformance(performanceResult.value);
      setPerformanceError('');
    } else {
      setPerformanceError(performanceResult.reason?.message || 'Could not load section performance.');
    }
    setLoading(false);
    setOverviewLoading(false);
    setPerformanceLoading(false);
  }, []);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  const loadUsers = async (page = 1) => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await authenticatedFetch(`/api/stats/admin-users?page=${page}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not load the user list.');
      setUsers(data.users || []);
      setUsersPage(data.page || page);
      setUsersTotal(data.total || 0);
    } catch (loadError) {
      setUsersError(loadError.message || 'Could not load the user list.');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadUserActivityHistory = async (userId, page = 1) => {
    const key = String(userId);
    setUserHistories((current) => ({ ...current, [key]: { ...(current[key] || {}), loading: true, error: '' } }));
    try {
      const response = await authenticatedFetch(`/api/stats/admin-users/${key}/activity-history?page=${page}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not load this user activity history.');
      setUserHistories((current) => ({ ...current, [key]: { ...data, loading: false, error: '' } }));
    } catch (historyError) {
      setUserHistories((current) => ({ ...current, [key]: { ...(current[key] || {}), loading: false, error: historyError.message || 'Could not load this user activity history.' } }));
    }
  };

  const changeAccountStatus = async (user) => {
    const status = user.accountStatus === 'suspended' ? 'active' : 'suspended';
    const confirmation = status === 'suspended'
      ? `Suspend ${user.username || user.email}? This blocks login and hides the account's posts, shop, reviews, comments, and public profile until access is restored.`
      : `Restore access to ${user.username || user.email}? Their posts and public profile will become visible again.`;
    if (!window.confirm(confirmation)) return;
    const note = status === 'suspended' ? (window.prompt('Optional reason to include in the user notice:') || '') : '';
    setUsersError('');
    try {
      const response = await authenticatedFetch(`/api/stats/admin-users/${user._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not update account access.');
      setUsers((current) => current.map((entry) => String(entry._id) === String(user._id)
        ? { ...entry, accountStatus: data.user.accountStatus, accountStatusNote: data.user.accountStatusNote }
        : entry));
    } catch (statusError) {
      setUsersError(statusError.message || 'Could not update account access.');
    }
  };

  if (!isLoopOutAdmin) return <Navigate to="/profile" replace />;

  const decide = async (submission, status) => {
    const userId = String(submission._id);
    const selectedChecks = checks[userId] || {};
    if (status === 'verified' && !CHECKS.every(([key]) => selectedChecks[key] === true)) {
      setError('Check all three review items before approving identity.');
      return;
    }
    if (status === 'rejected' && !String(notes[userId] || '').trim()) {
      setError('Add a short reason before rejecting this submission.');
      return;
    }

    setSavingId(userId);
    setError('');
    try {
      const response = await authenticatedFetch(`/api/verification/admin/${userId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, checks: selectedChecks, note: notes[userId] || '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not save the review.');
      setSubmissions((current) => current.filter((item) => String(item._id) !== userId));
      setChecks((current) => { const next = { ...current }; delete next[userId]; return next; });
      setNotes((current) => { const next = { ...current }; delete next[userId]; return next; });
    } catch (reviewError) {
      setError(reviewError.message || 'Could not save the review.');
    } finally {
      setSavingId('');
    }
  };

  const decideDriver = async (submission, status) => {
    const userId = String(submission._id);
    const selectedChecks = driverChecks[userId] || {};
    if (status === 'verified' && !['idIsReadable', 'faceMatchesId', 'licenceIsValid'].every((key) => selectedChecks[key] === true)) {
      setDriverReviewError('Check all three shuttle driver document review items before approving.');
      return;
    }
    if (status === 'rejected' && !String(driverNotes[userId] || '').trim()) {
      setDriverReviewError('Add a short correction note before rejecting this driver application.');
      return;
    }

    const savingKey = `driver-${userId}`;
    setSavingId(savingKey);
    setDriverReviewError('');
    try {
      const response = await authenticatedFetch(`/api/verification/admin/driver/${userId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, checks: selectedChecks, note: driverNotes[userId] || '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not save the shuttle driver review.');
      setDriverSubmissions((current) => current.filter((item) => String(item._id) !== userId));
      setDriverChecks((current) => { const next = { ...current }; delete next[userId]; return next; });
      setDriverNotes((current) => { const next = { ...current }; delete next[userId]; return next; });
    } catch (reviewError) {
      setDriverReviewError(reviewError.message || 'Could not save the shuttle driver review.');
    } finally {
      setSavingId('');
    }
  };

  const decideMovingVehicle = async (vehicle, status) => {
    const vehicleId = String(vehicle._id);
    const selectedChecks = movingVehicleChecks[vehicleId] || {};
    const keys = ['plateMatchesDocument', 'driverMatchesApprovedAccount', 'vehicleDetailsMatch'];
    if (status === 'approved' && !keys.every((key) => selectedChecks[key] === true)) {
      setMovingVehicleReviewError('Confirm the vehicle plate, approved driver account, and listed vehicle details before approval.');
      return;
    }
    if (status === 'rejected' && !String(movingVehicleNotes[vehicleId] || '').trim()) {
      setMovingVehicleReviewError('Add a correction note before rejecting this vehicle.');
      return;
    }
    const savingKey = `moving-${vehicleId}`;
    setSavingId(savingKey);
    setMovingVehicleReviewError('');
    try {
      const response = await authenticatedFetch(`/api/shuttles/moving/admin/${vehicleId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, checks: selectedChecks, note: movingVehicleNotes[vehicleId] || '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not save this vehicle review.');
      setMovingVehicleReviews((current) => current.filter((entry) => String(entry._id) !== vehicleId));
      setMovingVehicleChecks((current) => { const next = { ...current }; delete next[vehicleId]; return next; });
      setMovingVehicleNotes((current) => { const next = { ...current }; delete next[vehicleId]; return next; });
    } catch (reviewError) {
      setMovingVehicleReviewError(reviewError.message || 'Could not save this vehicle review.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <main className="admin-operations-dashboard min-h-screen bg-slate-100 px-3 pt-6 pb-12 text-slate-950 dark:bg-gray-950 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
            <button type="button" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/profile')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900 sm:px-3.5 sm:py-2 sm:text-sm" aria-label="Go back">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M12.5 4.5 7 10l5.5 5.5M7.25 10h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { loadSubmissions(); if (usersOpen) loadUsers(usersPage); }} className="min-h-10 rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900 sm:px-3.5 sm:py-2 sm:text-sm">Refresh</button>
              <Link to="/profile" className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:px-3.5 sm:py-2 sm:text-sm">Profile</Link>
            </div>
        </div>

        <section aria-label="Platform activity report" className="mb-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Usage & activity</h2><p className="text-xs text-slate-500 dark:text-slate-400">New accounts and sign-ins recorded by LoopOut</p></div>
            {overview?.reportGeneratedAt && <p className="text-[10px] text-slate-400">Updated {new Date(overview.reportGeneratedAt).toLocaleString()}</p>}
          </div>
          {overviewLoading ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-gray-800" />)}</div>
            : overview ? <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-sm sm:p-5"><p className="text-xs text-slate-300">Registered accounts</p><p className="mt-2 text-3xl font-black">{Number(overview.users.total).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-400">All time</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"><p className="text-xs text-slate-600 dark:text-slate-300">Open marketplace reports</p><p className="mt-2 text-3xl font-black text-amber-600">{Number(overview.reports.openMarketplaceIssues).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-500">Order issues awaiting resolution</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"><p className="text-xs text-slate-600 dark:text-slate-300">Failed sign-in alerts · this month</p><p className="mt-2 text-3xl font-black text-rose-600">{Number(overview.security.recordedAlertsThisMonth).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-500">Alerts created after repeated sign-in failures</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"><p className="text-xs text-slate-600 dark:text-slate-300">Database allocated</p><p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{overview.storage ? `${Number(overview.storage.allocatedMB).toLocaleString()} MB` : 'Unavailable'}</p><p className="mt-1 text-[10px] text-slate-500">MongoDB data {overview.storage ? `${overview.storage.dataMB} MB · indexes ${overview.storage.indexesMB} MB` : 'stats unavailable'}</p></div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {[
                  ['Today', overview.users.signupsToday, overview.logins.uniqueUsersToday],
                  ['This week', overview.users.signupsThisWeek, overview.logins.uniqueUsersThisWeek],
                  ['This month', overview.users.signupsThisMonth, overview.logins.uniqueUsersThisMonth],
                ].map(([period, signups, active]) => <div key={period} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{period}</p><div className="mt-3 flex items-end justify-between gap-2"><div><p className="text-2xl font-black text-slate-900 dark:text-white">{Number(signups).toLocaleString()}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">New accounts</p></div><div className="text-right"><p className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{Number(active).toLocaleString()}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">Unique users logged in*</p></div></div></div>)}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">*Sign-in totals count accounts with a recorded successful login in the period; historical login times that were not explicitly recorded are excluded. Database figures exclude uploaded files in Firebase Storage.</p>
            </> : <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Dashboard metrics unavailable: {overviewError}</div>}
        </section>

<section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Section performance</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">One compact graph comparing Food, Helpers, Property and Items. Each measure is shown relative to its highest category.</p></div>
            {performance?.generatedAt && <p className="text-[10px] text-slate-400">Updated {new Date(performance.generatedAt).toLocaleString()}</p>}
          </div>
          {performanceLoading ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-gray-800">Loading section performance…</p>
            : performanceError ? <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Section performance unavailable: {performanceError}</p>
              : performance ? <>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  {sectionCategories.map((category) => <span key={category.key} className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: sectionLineColors[String(category.key).toLowerCase()] || '#64748b' }} />{category.label}</span>)}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    ['Food shops', sectionPostCount('food')],
                    ['Helper posts', sectionPostCount('helpers')],
                    ['Properties', sectionPostCount('property')],
                    ['Items sold this month', Number.isFinite(Number(performance.itemsSoldThisMonth)) ? Number(performance.itemsSoldThisMonth).toLocaleString() : 'Unavailable'],
                    ['Bookings this month', Number.isFinite(Number(performance.bookingsThisMonth)) ? Number(performance.bookingsThisMonth).toLocaleString() : 'Unavailable'],
                  ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-gray-800"><p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{value}</p><p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{label}</p></div>)}
                </div>
                <div className="mt-2 overflow-hidden">
                  <svg viewBox="0 0 600 190" role="img" aria-label="Relative section performance line graph" className="h-auto w-full">
                    {[0, 50, 100].map((percent) => { const y = 142 - percent * 1.18; return <g key={percent}><line x1="38" x2="590" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.12" /><text x="30" y={y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.55">{percent}%</text></g>; })}
                    {sectionMeasures.map((measure, index) => <text key={measure.key} x={sectionMeasures.length === 1 ? 314 : 48 + index * (532 / (sectionMeasures.length - 1))} y="166" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.72">{measure.label}</text>)}
                    {sectionCategories.map((category) => {
                      const values = sectionMeasures.map((measure) => category[measure.key] === null || category[measure.key] === undefined ? null : Number(category[measure.key]));
                      const segments = [];
                      let current = [];
                      values.forEach((value, index) => {
                        if (value === null || !Number.isFinite(value)) { if (current.length) segments.push(current); current = []; }
                        else current.push({ index, value });
                      });
                      if (current.length) segments.push(current);
                      const pointFor = ({ index, value }) => {
                        const x = sectionMeasures.length === 1 ? 314 : 48 + index * (532 / (sectionMeasures.length - 1));
                        const max = Math.max(1, ...sectionCategories.map((item) => Number(item[sectionMeasures[index].key] || 0)));
                        return { x, y: 142 - (value / max) * 118 };
                      };
                      const color = sectionLineColors[String(category.key).toLowerCase()] || '#64748b';
                      return <g key={category.key} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {segments.filter((segment) => segment.length > 1).map((segment, index) => <polyline key={index} points={segment.map((point) => { const position = pointFor(point); return `${position.x},${position.y}`; }).join(' ')} />)}
                        {values.map((value, index) => { if (value === null || !Number.isFinite(value)) return null; const point = pointFor({ index, value }); return <circle key={index} cx={point.x} cy={point.y} r="3.5"><title>{`${category.label} · ${sectionMeasures[index].label}: ${value.toLocaleString()}`}</title></circle>; })}
                      </g>;
                    })}
                  </svg>
                </div>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Lines compare categories across measures, not over time. Hover or tap a point for its recorded value. Measures are independently scaled; unavailable data is left blank.</p>
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">{performance.activityNote} Individual clicks are not collected. Active minutes are approximate 30-second samples while an opted-in user’s tab is visible. Activity counts can be zero when no opted-in users have records. {performance.postsNote} {performance.bookingsNote}</p>
              </> : null}
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">User activity</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Recorded last login, profile area and saved marketplace post totals. Approximate GPS is shown only when a user opted in.</p></div>
            <button type="button" onClick={() => { const open = !usersOpen; setUsersOpen(open); if (open && !users.length) loadUsers(1); }} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900">{usersOpen ? 'Hide users' : `List users${overview ? ` (${Number(overview.users.total).toLocaleString()})` : ''}`}</button>
          </div>
          {usersOpen && <div className="mt-4">
            {usersError && <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{usersError}</p>}
            {usersLoading ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-gray-800">Loading users…</p>
              : users.length ? <div className="space-y-2">{users.map((user) => <article key={user._id} className="rounded-xl border border-slate-100 p-4 dark:border-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-900 dark:text-white">{user.username || 'Unnamed account'} <span className="font-normal text-slate-500">· {user.email}</span> <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${user.accountStatus === 'suspended' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'}`}>{user.accountStatus === 'suspended' ? 'Suspended' : 'Active'}</span></p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Last login: {user.lastLoginRecorded && user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Login time not recorded'} · Profile area: {user.location || 'Not provided'} · {user.offeringType || 'Account type not recorded'}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{Number(user.totalPosts)} posts</span><button type="button" onClick={() => changeAccountStatus(user)} className={`rounded-lg px-3 py-2 text-xs font-bold ${user.accountStatus === 'suspended' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>{user.accountStatus === 'suspended' ? 'Restore access' : 'Suspend account'}</button></div></div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Listings {user.postCounts?.listings || 0} · Services {user.postCounts?.services || 0} · Helpers {user.postCounts?.helpers || 0} · Items for sale {user.postCounts?.itemsForSale || 0} · Events {user.postCounts?.events || 0} · Shops {user.postCounts?.shops || 0}</p>
                {user.loginArea && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Approximate area at last app session start (GPS shared by user): {Number(user.loginArea.latitude).toFixed(2)}, {Number(user.loginArea.longitude).toFixed(2)} · {new Date(user.loginArea.capturedAt).toLocaleString()} · <a className="font-semibold text-rose-600 underline" href={`https://maps.google.com/?q=${user.loginArea.latitude},${user.loginArea.longitude}`} target="_blank" rel="noreferrer">Open approximate map area</a></p>}
                {!user.loginArea && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{user.shareLoginGpsArea ? 'GPS area sharing is enabled; no location has been recorded yet.' : 'Approximate GPS area is not shared by this user.'}</p>}
                {user.accountStatus === 'suspended' && user.accountStatusNote && <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">Suspension note: {user.accountStatusNote}</p>}
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{user.shareActivityWithAdmins ? user.recentSection ? `Last section visited (shared by user): ${user.recentSection.section} · ${new Date(user.recentSection.viewedAt).toLocaleString()}` : 'Section activity sharing is on; no recent section visit is recorded.' : 'Section activity not shared. The user can opt in from Profile settings.'}</p>
                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-gray-800">
                  {user.shareDetailedActivityWithAdmins ? <>
                    <button type="button" onClick={() => { const key = String(user._id); if (historyUserId === key) setHistoryUserId(''); else { setHistoryUserId(key); if (!userHistories[key]) loadUserActivityHistory(key, 1); } }} className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/30">{historyUserId === String(user._id) ? 'Hide activity history' : 'View activity history'}</button>
                    {historyUserId === String(user._id) && <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-800">
                      <p className="mb-2 text-[10px] text-slate-500 dark:text-slate-400">User opted in. Named page views and selected workflow milestones only; retained for up to 30 days.</p>
                      {userHistories[String(user._id)]?.error && <p role="alert" className="text-xs text-rose-700">{userHistories[String(user._id)].error}</p>}
                      {userHistories[String(user._id)]?.loading ? <p className="text-xs text-slate-500">Loading history…</p> : <>
                        {(userHistories[String(user._id)]?.events || []).length ? <ol className="max-h-72 space-y-2 overflow-y-auto">{userHistories[String(user._id)].events.map((event) => <li key={event._id} className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b border-slate-200 pb-2 text-xs last:border-0 dark:border-gray-700"><span className="font-medium text-slate-700 dark:text-slate-200">{describeActivityEvent(event)}</span><time className="text-slate-500">{new Date(event.createdAt).toLocaleString()}</time></li>)}</ol> : <p className="text-xs text-slate-500">No activity history has been recorded.</p>}
                        {Number(userHistories[String(user._id)]?.total) > 100 && <div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-slate-500">Page {userHistories[String(user._id)].page}</span><div className="flex gap-2"><button type="button" disabled={userHistories[String(user._id)].loading || userHistories[String(user._id)].page <= 1} onClick={() => loadUserActivityHistory(user._id, userHistories[String(user._id)].page - 1)} className="rounded border px-2 py-1 text-[10px] disabled:opacity-40">Previous</button><button type="button" disabled={userHistories[String(user._id)].loading || userHistories[String(user._id)].page * 100 >= userHistories[String(user._id)].total} onClick={() => loadUserActivityHistory(user._id, userHistories[String(user._id)].page + 1)} className="rounded border px-2 py-1 text-[10px] disabled:opacity-40">Next</button></div></div>}
                      </>}
                    </div>}
                  </> : <p className="text-[11px] text-slate-500 dark:text-slate-400">Detailed history is off. The user must enable it in Profile settings.</p>}
                </div>
              </article>)}</div>
              : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-gray-800">No user accounts found.</p>}
            {usersTotal > 50 && <div className="mt-4 flex items-center justify-between"><p className="text-xs text-slate-500">Page {usersPage} of {Math.ceil(usersTotal / 50)}</p><div className="flex gap-2"><button type="button" disabled={usersLoading || usersPage <= 1} onClick={() => loadUsers(usersPage - 1)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40 dark:border-gray-700">Previous</button><button type="button" disabled={usersLoading || usersPage >= Math.ceil(usersTotal / 50)} onClick={() => loadUsers(usersPage + 1)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40 dark:border-gray-700">Next</button></div></div>}
          </div>}
        </section>

        {overview && <section className="mb-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Reported accounts & order issues</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Recent open marketplace reports show the reporting and reported account.</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{overview.reports.openMarketplaceIssues} open</span></div>
            {!overview.reports.directUserReportsAvailable && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">Direct user or listing reports are not currently saved in the app database. This list contains submitted marketplace order issues only.</p>}
            {overview.reports.recentMarketplaceIssues.length ? <div className="mt-4 space-y-2">{overview.reports.recentMarketplaceIssues.map((report) => <article key={report.id} className="rounded-xl border border-slate-100 p-3 dark:border-gray-800"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold text-slate-900 dark:text-white">{report.category} · {report.orderTitle}</p><span className="text-[10px] text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span></div><p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">Reported account: <strong>{report.reportedUser?.username || 'Unknown'}</strong> ({report.reportedUser?.email || 'email unavailable'})</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Reported by: {report.reporter?.username || 'Unknown'} · {String(report.details || '').slice(0, 240)}</p></article>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-gray-800 dark:text-slate-400">No open marketplace order issues are recorded.</p>}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Failed sign-in activity</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Recorded alerts after repeated unsuccessful sign-ins.</p></div><span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-200">{overview.security.accountsWith3OrMoreFailedLogins} accounts · 3+ current failures</span></div>
            <div className="mt-4 grid grid-cols-3 gap-2">{[['Today', overview.security.recordedAlertsToday], ['This week', overview.security.recordedAlertsThisWeek], ['This month', overview.security.recordedAlertsThisMonth]].map(([period, count]) => <div key={period} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-gray-800"><p className="text-lg font-black text-rose-600 dark:text-rose-300">{Number(count).toLocaleString()}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{period}</p></div>)}</div>
            {overview.security.recentAlerts.length ? <div className="mt-4 space-y-2">{overview.security.recentAlerts.map((alert) => <article key={alert.id} className="rounded-xl border border-slate-100 p-3 dark:border-gray-800"><div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-semibold text-slate-900 dark:text-white">{alert.title || 'Security alert'} · {alert.user?.email || 'Account unavailable'}</p><span className="text-[10px] text-slate-400">{new Date(alert.createdAt).toLocaleString()}</span></div><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{alert.message}</p></article>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-gray-800 dark:text-slate-400">No recorded security alert notifications.</p>}
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">These signals reflect the security events currently recorded by LoopOut; they are not a complete threat-detection system.</p>
          </div>
        </section>}

        {overview && <section aria-label="Provider panic alerts" className="mb-8 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm dark:border-rose-900/60 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Provider panic alerts</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">GPS alerts recorded from service providers. Treat map pins and contact details as sensitive.</p></div><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-200">{overview.panicAlerts.active} active</span></div>
          <div className="mt-4 grid grid-cols-3 gap-2">{[['Today', overview.panicAlerts.today], ['This week', overview.panicAlerts.thisWeek], ['This month', overview.panicAlerts.thisMonth]].map(([period, count]) => <div key={period} className="rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-950/30"><p className="text-lg font-black text-rose-700 dark:text-rose-300">{Number(count).toLocaleString()}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{period}</p></div>)}</div>
          {overview.panicAlerts.recent.length ? <div className="mt-4 space-y-2">{overview.panicAlerts.recent.map((alert) => <article key={alert.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 dark:border-gray-800"><div><p className="text-xs font-bold text-slate-900 dark:text-white">{alert.code} · {alert.user?.username || 'Service provider'}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{alert.user?.email || 'Email unavailable'} · {new Date(alert.triggeredAt).toLocaleString()} · {alert.status}</p></div><a href={alert.mapUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300">Open map pin</a></article>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-gray-800 dark:text-slate-400">No provider panic alerts have been recorded.</p>}
        </section>}

        <section aria-label="Shuttle driver document approvals" className="mb-8">
          <div className="mb-3"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Shuttle driver document approvals</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Review the ID, compare its face with the driver photo, and check the driving licence. Drivers cannot add a shuttle until all three checks are approved.</p></div>
          {driverReviewError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{driverReviewError}</div>}
          {loading ? <p className="rounded-2xl bg-white p-5 text-sm text-slate-600 dark:bg-gray-900 dark:text-slate-300">Loading driver document applications…</p>
            : driverReviewError && driverSubmissions.length === 0 ? <button type="button" onClick={loadSubmissions} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">Retry loading applications</button>
              : driverSubmissions.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-300">No shuttle driver applications are waiting for review.</p>
                : <div className="space-y-5">{driverSubmissions.map((submission) => {
                  const userId = String(submission._id);
                  const docs = submission.driverVerification || {};
                  const selected = driverChecks[userId] || {};
                  const checksList = [
                    ['idIsReadable', 'ID or passport is readable and belongs to this applicant'],
                    ['faceMatchesId', 'Driver face photo matches the face on the ID'],
                    ['licenceIsValid', 'Driving licence is readable and valid'],
                  ];
                  return <article key={userId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold text-slate-900 dark:text-white">{submission.username || 'Driver applicant'}</h3><p className="text-xs text-slate-500 dark:text-slate-400">{submission.email}</p></div><p className="text-xs text-slate-500 dark:text-slate-400">Submitted {docs.submittedAt ? new Date(docs.submittedAt).toLocaleString() : 'date not recorded'}</p></div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><p className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">ID / passport</p><a href={docs.idDocumentUrl} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="text-xs font-semibold text-teal-700 underline dark:text-teal-300">Open submitted document</a></div>
                      <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><p className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">Driver face photo</p><a href={docs.facePhotoUrl} target="_blank" rel="noreferrer" referrerPolicy="no-referrer"><img src={docs.facePhotoUrl} alt="Submitted driver face photo" referrerPolicy="no-referrer" className="h-32 w-full rounded-lg bg-slate-100 object-contain dark:bg-gray-800" /></a></div>
                      <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><p className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">Driving licence</p><a href={docs.licenceDocumentUrl} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="text-xs font-semibold text-teal-700 underline dark:text-teal-300">Open submitted licence</a></div>
                    </div>
                    <fieldset className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-gray-800"><legend className="px-1 text-sm font-semibold text-slate-900 dark:text-white">Manual review checks</legend>{checksList.map(([key, label]) => <label key={key} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" checked={selected[key] === true} onChange={(event) => setDriverChecks((current) => ({ ...current, [userId]: { ...(current[userId] || {}), [key]: event.target.checked } }))} className="mt-0.5 h-4 w-4 accent-teal-700" /><span>{label}</span></label>)}</fieldset>
                    <label htmlFor={`driver-review-note-${userId}`} className="mt-3 block text-xs font-semibold text-slate-700 dark:text-slate-200">Review note (required when rejecting)</label>
                    <textarea id={`driver-review-note-${userId}`} value={driverNotes[userId] || ''} onChange={(event) => setDriverNotes((current) => ({ ...current, [userId]: event.target.value }))} maxLength={500} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white" placeholder="Explain what the driver should correct if rejecting." />
                    <div className="mt-3 flex justify-end gap-2"><button type="button" disabled={savingId === `driver-${userId}` || !String(driverNotes[userId] || '').trim()} onClick={() => decideDriver(submission, 'rejected')} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300">Reject and request correction</button><button type="button" disabled={savingId === `driver-${userId}` || !checksList.every(([key]) => selected[key] === true)} onClick={() => decideDriver(submission, 'verified')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{savingId === `driver-${userId}` ? 'Saving…' : 'Approve driver documents'}</button></div>
                  </article>;
                })}</div>}
        </section>

        <section aria-label="Moving truck and minivan approvals" className="mb-8">
          <div className="mb-3"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Truck and minivan approvals</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">The driver’s already-approved account is reused. Review each vehicle’s name, registration plate, assigned driver, and licence/registration PDF. Only approved vehicles appear in the 50 km map search.</p></div>
          {movingVehicleReviewError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{movingVehicleReviewError}</div>}
          {loading ? <p className="rounded-2xl bg-white p-5 text-sm text-slate-600 dark:bg-gray-900 dark:text-slate-300">Loading truck and minivan submissions…</p>
            : movingVehicleReviewError && movingVehicleReviews.length === 0 ? <button type="button" onClick={loadSubmissions} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">Retry loading vehicle reviews</button>
              : movingVehicleReviews.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-300">No truck or minivan submissions are waiting for review.</p>
                : <div className="space-y-5">{movingVehicleReviews.map((vehicle) => {
                  const vehicleId = String(vehicle._id);
                  const driver = vehicle.driverRef || {};
                  const selected = movingVehicleChecks[vehicleId] || {};
                  const checksList = [
                    ['plateMatchesDocument', 'Registration number plate matches the vehicle licence/registration document'],
                    ['driverMatchesApprovedAccount', 'Assigned driver matches this already-approved LoopOut driver account'],
                    ['vehicleDetailsMatch', 'Vehicle make/type and load capacity match the submitted details'],
                  ];
                  return <article key={vehicleId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold text-slate-900 dark:text-white">{vehicle.vehicleDescription} · {vehicle.vehicleType}</h3><p className="text-xs text-slate-500 dark:text-slate-400">Colour: {vehicle.carColor} · Plate: {vehicle.plateNumber}</p></div><p className="text-xs text-slate-500 dark:text-slate-400">Submitted {vehicle.verificationSubmittedAt ? new Date(vehicle.verificationSubmittedAt).toLocaleString() : 'date not recorded'}</p></div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><p className="text-xs font-bold">Assigned driver</p><p className="mt-1 text-sm">{vehicle.driverDisplayName} · {driver.email || 'email unavailable'}</p><p className="mt-1 text-xs text-gray-500">LoopOut account: {driver.username || 'unknown'}</p></div><div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><p className="mb-2 text-xs font-bold">Vehicle licence / registration PDF</p><a href={vehicle.vehicleLicenceDocumentUrl} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="text-xs font-semibold text-teal-700 underline dark:text-teal-300">Open submitted document</a></div></div>
                    <fieldset className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-gray-800"><legend className="px-1 text-sm font-semibold">Manual vehicle review</legend>{checksList.map(([key, label]) => <label key={key} className="flex items-start gap-2 text-xs"><input type="checkbox" checked={selected[key] === true} onChange={(event) => setMovingVehicleChecks((current) => ({ ...current, [vehicleId]: { ...(current[vehicleId] || {}), [key]: event.target.checked } }))} className="mt-0.5 h-4 w-4 accent-teal-700" /><span>{label}</span></label>)}</fieldset>
                    <label htmlFor={`moving-review-note-${vehicleId}`} className="mt-3 block text-xs font-semibold">Review note (required when rejecting)</label><textarea id={`moving-review-note-${vehicleId}`} value={movingVehicleNotes[vehicleId] || ''} onChange={(event) => setMovingVehicleNotes((current) => ({ ...current, [vehicleId]: event.target.value }))} maxLength={500} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950" placeholder="Explain what the owner should correct if rejecting." />
                    <div className="mt-3 flex justify-end gap-2"><button type="button" disabled={savingId === `moving-${vehicleId}` || !String(movingVehicleNotes[vehicleId] || '').trim()} onClick={() => decideMovingVehicle(vehicle, 'rejected')} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300">Reject and request correction</button><button type="button" disabled={savingId === `moving-${vehicleId}` || !checksList.every(([key]) => selected[key] === true)} onClick={() => decideMovingVehicle(vehicle, 'approved')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{savingId === `moving-${vehicleId}` ? 'Saving…' : 'Approve vehicle'}</button></div>
                  </article>;
                })}</div>}
        </section>

        <div className="mb-3"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Identity reviews</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Open each PDF and compare its number and portrait with the live selfie. Approve only when all three checks are clear.</p></div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {loading ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 dark:bg-gray-900 dark:text-slate-300">Loading pending reviews…</p>
          : submissions.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-300">No identity submissions are waiting for review.</div>
            : <div className="space-y-6">{submissions.map((submission) => {
              const userId = String(submission._id);
              const submissionChecks = checks[userId] || {};
              return (
                <section key={userId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{submission.username || 'Applicant'}</h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{submission.email} · {submission.offeringType || 'Account type not recorded'}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{submission.kycSubmittedAt ? `Submitted ${new Date(submission.kycSubmittedAt).toLocaleDateString()}` : 'Submission time not recorded for this older review'}</p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-gray-700">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">ID / passport PDF</p>
                      <p className="mb-3 break-all text-sm font-semibold text-slate-900 dark:text-white">Entered number: {submission.idDocumentNumber || 'Not provided'}</p>
                      <a href={submission.idDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-700">Open PDF</a>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-gray-700">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Live selfie</p>
                      <a href={submission.liveSelfieUrl} target="_blank" rel="noreferrer">
                        <img src={submission.liveSelfieUrl} alt="Applicant live selfie" className="h-48 w-full rounded-lg bg-slate-100 object-contain dark:bg-gray-800" />
                      </a>
                    </div>
                  </div>

                  {!submission.idDocumentNumber && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">No document number was saved for this submission. Approval is disabled; request a resubmission with the ID or passport number.</p>}

                  <fieldset className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-gray-800">
                    <legend className="px-1 text-sm font-semibold text-slate-900 dark:text-white">Reviewer checks</legend>
                    {CHECKS.map(([key, label]) => (
                      <label key={key} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                        <input type="checkbox" checked={submissionChecks[key] === true} onChange={(event) => setChecks((current) => ({ ...current, [userId]: { ...(current[userId] || {}), [key]: event.target.checked } }))} className="mt-0.5 h-4 w-4 accent-rose-600" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </fieldset>

                  <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={`review-note-${userId}`}>Reviewer note {`(required when rejecting)`}</label>
                  <textarea id={`review-note-${userId}`} value={notes[userId] || ''} onChange={(event) => setNotes((current) => ({ ...current, [userId]: event.target.value }))} maxLength={500} rows={2} placeholder="If something does not match, explain what the applicant should correct." className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />

                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button type="button" disabled={savingId === userId || !String(notes[userId] || '').trim()} onClick={() => decide(submission, 'rejected')} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300">Reject and request correction</button>
                    <button type="button" disabled={savingId === userId || !submission.idDocumentNumber || !CHECKS.every(([key]) => submissionChecks[key] === true)} onClick={() => decide(submission, 'verified')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingId === userId ? 'Saving…' : 'Approve identity'}</button>
                  </div>
                </section>
              );
            })}</div>}
      </div>
    </main>
  );
}
