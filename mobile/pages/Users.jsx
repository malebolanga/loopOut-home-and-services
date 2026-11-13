import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, House, RefreshCw, UserRound, UsersRound } from 'lucide-react';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const FALLBACK_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

export default function Users() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('/api/user', { signal });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(response.status === 401
          ? 'Please sign in to browse LoopOut members.'
          : data.message || 'Could not load members. Please try again.');
      }
      if (!Array.isArray(data)) throw new Error(data.message || 'The member list could not be loaded.');
      setUsers(data.filter((user) => user?._id && user._id !== currentUser?._id));
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') setError(fetchError.message || 'Could not load members. Please try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">LoopOut community</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-300">
                Discover members, view their profiles, and explore the listings they share.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-slate-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300" role="status">
            <RefreshCw className="h-7 w-7 animate-spin text-rose-500" />
            <p>Loading LoopOut members…</p>
          </div>
        ) : error ? (
          <section className="rounded-3xl border border-rose-200 bg-white p-8 text-center dark:border-rose-900 dark:bg-gray-900" role="alert">
            <h2 className="text-lg font-semibold">Members couldn’t be loaded</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-gray-300">{error}</p>
            <button
              type="button"
              onClick={() => fetchUsers()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </section>
        ) : users.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
            <UsersRound className="mx-auto h-9 w-9 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold">No other members to show yet</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">Check back later to discover more of the LoopOut community.</p>
          </section>
        ) : (
          <section aria-label="LoopOut members" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map((user) => (
              <article key={user._id} className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => navigate(`/user/${user._id}`)}
                  className="flex min-w-0 items-center gap-4 rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-rose-500"
                  aria-label={`View ${user.username || 'member'} profile`}
                >
                  <img
                    src={user.avatar || FALLBACK_AVATAR}
                    alt=""
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = FALLBACK_AVATAR; }}
                    className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100 object-cover dark:bg-gray-800"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900 dark:text-white">{user.username || 'LoopOut member'}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{user.offeringType ? `${user.offeringType} member` : 'Community member'}</p>
                  </div>
                </button>

                <p className="mt-4 min-h-12 flex-1 text-sm leading-6 text-slate-600 dark:text-gray-300">
                  {user.bio?.trim() || 'View this member’s profile to learn more.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <UserRound className="h-4 w-4" /> Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/listings/user/${user._id}`)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    <House className="h-4 w-4" /> Listings
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
