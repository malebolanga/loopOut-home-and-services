import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { FaPlus, FaSpinner } from 'react-icons/fa';

/* ─── helpers ────────────────────────────────────────────────────────────────── */
const getItemPath = (listing) =>
  listing.category === 'stays'       ? `/listing/${listing._id}`
  : listing.category === 'experiences' ? `/service/${listing._id}`
  : `/helper/${listing._id}`;

const getEditPath = (listing) =>
  listing.category === 'stays'       ? `/update-listing/${listing._id}`
  : listing.category === 'experiences' ? `/update-service/${listing._id}`
  : `/update-helper/${listing._id}`;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return null; }
};

const CATEGORY_LABELS = {
  stays: 'Stay', experiences: 'Service', online: 'Helper',
};

/* ─── Listing card ────────────────────────────────────────────────────────────── */
function ListingCard({ listing, onEdit, onDelete, deletingId, navigate }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc    = listing.imageUrls?.[0] || listing.images?.[0] || null;
  const title     = listing.name || listing.title || 'Untitled';
  const location  = listing.address || listing.location || null;
  const uploaded  = formatDate(listing.createdAt);
  const typeLabel = CATEGORY_LABELS[listing.category] || listing.category || '';
  const isDeleting = deletingId === listing._id;

  return (
    <div className="cursor-pointer" onClick={() => navigate(getItemPath(listing))}>
      {/* Image – 3:2 */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-200" style={{ aspectRatio: '3/2' }}>
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <FaPlus className="w-7 h-7 text-gray-300" />
          </div>
        )}

        {/* Category badge – top left */}
        {typeLabel && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/90 text-gray-800 shadow-sm">
            {typeLabel}
          </span>
        )}

        {/* Edit / Delete – top right */}
        <div
          className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(listing)}
            aria-label="Edit"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-600 hover:text-rose-500 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(listing._id, listing.category)}
            disabled={isDeleting}
            aria-label="Delete"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-600 hover:text-rose-500 transition-colors"
          >
            {isDeleting
              ? <FaSpinner className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Text below – WishList style */}
      <div className="mt-2 px-0.5 space-y-0.5">
        <p className="text-[14px] font-semibold text-gray-900 truncate leading-snug">{title}</p>
        {location && <p className="text-[13px] text-gray-500 truncate">{location}</p>}
        {uploaded && <p className="text-[12px] text-gray-400">Uploaded {uploaded}</p>}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function UserListings() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [deletingId,    setDeletingId]    = useState(null);
  const [userListings,  setUserListings]  = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!currentUser) navigate('/sign-in');
  }, [currentUser?._id, navigate]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const [listingsRes, servicesRes, helpersRes] = await Promise.all([
        fetch(`/api/user/listings/${currentUser._id}`),
        fetch(`/api/user/services/${currentUser._id}`),
        fetch(`/api/user/helpers/${currentUser._id}`),
      ]);
      const [listingsData, servicesData, helpersData] = await Promise.all([
        listingsRes.json(), servicesRes.json(), helpersRes.json(),
      ]);
      const allItems = [
        ...(Array.isArray(listingsData) ? listingsData : (listingsData.listings || [])).map(l => ({ ...l, category: 'stays' })),
        ...(Array.isArray(servicesData) ? servicesData : (servicesData.services || [])).map(s => ({ ...s, category: 'experiences' })),
        ...(Array.isArray(helpersData)  ? helpersData  : (helpersData.helpers   || [])).map(h => ({ ...h, category: 'online' })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUserListings(allItems);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, category) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const endpoint =
        category === 'stays'       ? `/api/listing/delete/${id}`
        : category === 'experiences' ? `/api/service/delete/${id}`
        : `/api/helper/delete/${id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');
      setUserListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (currentUser?._id) fetchListings();
  }, []);

  const FILTERS = [
    { key: 'stays',       label: 'Stays' },
    { key: 'experiences', label: 'Services' },
    { key: 'online',      label: 'Helpers' },
  ];

  const filtered = selectedTypes.length > 0
    ? userListings.filter(l => selectedTypes.includes(l.category))
    : userListings;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif" }}>
        <header className="app-safe-top sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-full" />
            <div className="h-5 w-32 bg-gray-100 rounded-full" />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full bg-gray-200 rounded-2xl" style={{ aspectRatio: '3/2' }} />
                <div className="mt-2 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white app-safe-content-bottom pb-20" style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif" }}>
      {/* Sticky header */}
      <header className="app-safe-top sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-[18px] sm:text-[20px] font-semibold text-gray-900 tracking-tight leading-tight truncate">My Listings</h1>
              <p className="text-[12px] sm:text-[13px] text-gray-400 leading-tight">{userListings.length} {userListings.length === 1 ? 'post' : 'posts'}</p>
            </div>
          </div>
          <Link
            to="/create-listing"
            className="flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-all duration-200"
          >
            <FaPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>New Post</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Filter pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedTypes(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key])}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                selectedTypes.includes(key)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
          {selectedTypes.length > 0 && (
            <button
              onClick={() => setSelectedTypes([])}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {filtered.map(listing => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onEdit={(l) => navigate(getEditPath(l))}
                onDelete={handleDelete}
                deletingId={deletingId}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-24 flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(225,29,72,0.08)' }}>
              <FaPlus className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {userListings.length === 0 ? 'Ready to become a host?' : 'No matches'}
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
              {userListings.length === 0
                ? 'Create your first listing and start earning.'
                : 'Try a different filter or clear all.'}
            </p>
            {userListings.length === 0 ? (
              <Link
                to="/create-listing"
                className="px-6 py-3 text-[15px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(to right, #e11d48, #be123c)' }}
              >
                Create Listing
              </Link>
            ) : (
              <button
                onClick={() => setSelectedTypes([])}
                className="px-6 py-3 text-[15px] font-semibold text-gray-700 border border-gray-300 rounded-xl hover:border-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
