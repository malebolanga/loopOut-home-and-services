import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getWishlistBackend,
  toggleWishlistBackend,
  clearWishlistBackend,
} from '../services/wishlist.service';
import { setWishlistCount } from '../redux/frontendSlice';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const getItemPath = (item) => {
  const type = item.type || item.itemType || 'listing';
  if (type === 'listing') return `/listing/${item._id}`;
  if (type === 'event')   return `/event/${item._id}`;
  if (type === 'helper')  return `/helper/${item._id}`;
  return `/service/${item._id}`;
};

const getImg = (item) =>
  (item.imageUrls && item.imageUrls[0]) ||
  (item.images    && item.images[0])    ||
  null;

const formatSavedDate = (addedAt) => {
  if (!addedAt) return null;
  try {
    const d = new Date(addedAt);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return null; }
};

/* ─── Mosaic card (Airbnb "wishlist collection" style) ─────────────────────── */
/* Shows a 2×2 photo grid with the wishlist name + count underneath */
const MosaicCard = React.forwardRef(function MosaicCard(
  { groupName, items, onOpen, onClear, isClearing },
  ref
) {
  const photos = items.slice(0, 4).map(getImg).filter(Boolean);
  // pad to 4 so we always have a consistent grid
  while (photos.length < 4) photos.push(null);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className=" cursor-pointer"
      onClick={onOpen}
    >
      {/* 2×2 photo mosaic */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
          {photos.map((src, i) => (
            <div key={i} className="overflow-hidden bg-gray-200">
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trash — hover top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          disabled={isClearing}
          aria-label="Remove wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
        >
          {isClearing
            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="mt-3 px-0.5">
        <p className="text-[15px] font-semibold text-gray-900 leading-snug truncate">{groupName}</p>
        <p className="text-[14px] text-gray-500 mt-0.5">
          {items.length} {items.length === 1 ? 'save' : 'saves'}
        </p>
      </div>
    </motion.div>
  );
});

/* ─── Item card — image + saved date only ──────────────────────────────────── */
const ItemCard = React.forwardRef(function ItemCard(
  { item, isRemoving, onRemove, onNavigate },
  ref
) {
  const [heartActive, setHeartActive] = useState(true);
  const [imgError,    setImgError]    = useState(false);

  const imgSrc    = getImg(item);
  const savedDate = formatSavedDate(item.addedAt);
  const location  = item.address || item.location || null;

  const handleRemove = (e) => {
    e.stopPropagation();
    setHeartActive(false);
    setTimeout(() => onRemove(item._id, item.type), 180);
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={() => onNavigate(getItemPath(item))}
    >
      {/* Image — 3:2 aspect ratio, reliable rendering */}
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-gray-200"
        style={{ aspectRatio: '3/2' }}
      >
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Heart className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Heart / remove */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 transition-transform active:scale-90"
          style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.45))' }}
        >
          {isRemoving
            ? <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            : <Heart
                className="w-5 h-5 transition-all duration-200"
                style={{
                  fill:        heartActive ? '#FF385C' : 'transparent',
                  stroke:      heartActive ? '#FF385C' : 'white',
                  strokeWidth: 2,
                }}
              />}
        </button>
      </div>

      {/* Location + saved date */}
      <div className="mt-2 px-0.5">
        {location && (
          <p className="text-[14px] font-medium text-gray-900 truncate">{location}</p>
        )}
        <p className="text-[13px] text-gray-400 mt-0.5">
          {savedDate ? `Saved ${savedDate}` : 'Recently saved'}
        </p>
      </div>
    </motion.article>
  );
});

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const WISHLIST_KEYS = {
  listing: 'wishlist',
  service: 'serviceWishlist',
  helper:  'helperWishlist',
  event:   'eventWishlist',
};

/* group all items into a single "My Wishlist" collection (or per-type groups) */
const GROUPS = [
  { id: 'all',     label: 'My Wishlist' },
  { id: 'listing', label: 'Homes' },
  { id: 'service', label: 'Services' },
  { id: 'helper',  label: 'Helpers' },
  { id: 'event',   label: 'Events' },
];

/* ─── Main component ─────────────────────────────────────────────────────────── */
const WishList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((s) => s.user);

  const [wishlist,     setWishlist]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [removingId,   setRemovingId]   = useState(null);
  const [isClearing,   setIsClearing]   = useState(false);
  const [actionError,  setActionError]  = useState('');
  const [openGroup,    setOpenGroup]    = useState(null);
  const [recentlyViewed,    setRecentlyViewed]    = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);

  /* ── Data ── */
  const loadFromLocal = () => {
    try {
      const merged = Object.entries(WISHLIST_KEYS).flatMap(([type, key]) => {
        try {
          return (JSON.parse(localStorage.getItem(key)) || []).map((i) => ({
            ...i, itemType: i.itemType || i.type || type, type,
          }));
        } catch { return []; }
      });
      const seen = new Set();
      setWishlist(merged.filter((i) => { if (!i._id || seen.has(i._id)) return false; seen.add(i._id); return true; }));
    } catch (err) { console.error(err); }
  };

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (currentUser) {
        const db = await getWishlistBackend();
        if (Array.isArray(db)) { setWishlist(db); return; }
      }
      loadFromLocal();
    } catch { loadFromLocal(); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadWishlist();
    // recently viewed from localStorage
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 10));
    } catch { /* ignore */ }
    // confirmed bookings from API
    if (currentUser?._id) {
      fetch(`/api/bookings/user/${currentUser._id}`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : [])
        .then((data) => {
          if (!Array.isArray(data)) return;
          const confirmed = data
            .filter((b) => b.status === 'confirmed' || b.status === 'approved')
            .slice(0, 10)
            .map((b) => {
              const item = b.listing || b.helper || b.service || b.event || {};
              const due  = new Date(b.startDate || b.date || b.createdAt);
              return {
                id:      b._id,
                title:   item.name || item.title || 'Booking',
                image:   item.imageUrls?.[0] || item.images?.[0] || null,
                address: b.address || item.address || item.location || null,
                dateStr: isNaN(due) ? null : due.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
                type:    b.listing ? 'listing' : b.helper ? 'helper' : b.event ? 'event' : 'service',
                itemId:  item._id || b.itemId,
              };
            });
          setConfirmedBookings(confirmed);
        })
        .catch(() => {});
    }
    const h = () => loadFromLocal();
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [currentUser?._id]);

  /* ── Actions ── */
  const removeFromWishlist = async (id, type) => {
    setRemovingId(id);
    setActionError('');
    try {
      if (currentUser) {
        const res = await toggleWishlistBackend(id, type);
        if (!res?.success || res.isFavorite !== false)
          throw new Error(res?.message || 'Unable to remove item.');
      }
      const key    = WISHLIST_KEYS[type] || WISHLIST_KEYS.listing;
      const stored = JSON.parse(localStorage.getItem(key)) || [];
      localStorage.setItem(key, JSON.stringify(stored.filter((i) => i._id !== id)));
      window.dispatchEvent(new Event('storage'));
      const next = wishlist.filter((i) => !(i._id === id && i.type === type));
      setWishlist(next);
      dispatch(setWishlistCount(next.length));
    } catch (err) {
      setActionError(err.message || 'Unable to remove item.');
    } finally { setRemovingId(null); }
  };

  const clearGroup = async (groupId) => {
    const toRemove = getGroupItems(groupId);
    if (!window.confirm(`Remove all ${toRemove.length} items from this wishlist?`)) return;
    setIsClearing(true);
    setActionError('');
    try {
      if (currentUser) {
        const r = await clearWishlistBackend(groupId === 'all' ? 'all' : groupId);
        if (!r?.success) throw new Error(r?.message || 'Unable to clear.');
      }
      if (groupId === 'all') {
        Object.values(WISHLIST_KEYS).forEach((k) => localStorage.removeItem(k));
        window.dispatchEvent(new Event('storage'));
        setWishlist([]);
        dispatch(setWishlistCount(0));
        setOpenGroup(null);
      } else {
        const key = WISHLIST_KEYS[groupId];
        if (key) { localStorage.removeItem(key); window.dispatchEvent(new Event('storage')); }
        const next = wishlist.filter((i) => i.type !== groupId && i.itemType !== groupId);
        setWishlist(next);
        dispatch(setWishlistCount(next.length));
        setOpenGroup(null);
      }
    } catch (err) { setActionError(err.message || 'Unable to clear.'); }
    finally { setIsClearing(false); }
  };

  /* ── Derived ── */
  const getGroupItems = (groupId) => {
    if (groupId === 'all') return wishlist;
    return wishlist.filter((i) => i.type === groupId || i.itemType === groupId);
  };

  // Build mosaic groups (only groups with items)
  const groups = useMemo(() => {
    return GROUPS.filter((g) => getGroupItems(g.id).length > 0);
  }, [wishlist]);

  const detailItems = useMemo(() => {
    if (!openGroup) return [];
    return getGroupItems(openGroup);
  }, [openGroup, wishlist]);

  /* ─── Render ─── */
  return (
    <div
      className="min-h-screen bg-white app-safe-content-bottom pb-20 md:pb-10"
      style={{ fontFamily: "'Circular', 'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Sticky header ── */}
      <header className="app-safe-top sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 h-16 sm:h-[72px] flex items-center justify-between gap-4">

          {/* Left: back button always visible + title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => openGroup ? setOpenGroup(null) : navigate(-1)}
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[20px] sm:text-[22px] font-semibold text-gray-900 tracking-tight truncate">
              {openGroup
                ? (GROUPS.find((g) => g.id === openGroup)?.label || 'Wishlist')
                : 'Wishlists'}
            </h1>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-[1280px] mx-auto px-6 sm:px-10 xl:px-20 pt-8">

        {/* Error banner */}
        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="alert"
              className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700"
            >
              <X className="w-4 h-4 flex-shrink-0" />
              {actionError}
              <button onClick={() => setActionError('')} className="ml-auto"><X className="w-3.5 h-3.5 text-red-400" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full bg-gray-200 rounded-2xl" style={{ paddingBottom: '100%' }} />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>

        ) : !openGroup ? (
          /* ══ MOSAIC VIEW – "Your wishlists" (like airbnb.co.za/wishlists) ══ */
          <>
            {groups.length === 0 ? (
              /* Empty – logged out or no saves */
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center text-center max-w-sm mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,56,92,0.08)' }}>
                  <Heart className="w-8 h-8" style={{ stroke: '#FF385C', fill: 'transparent', strokeWidth: 1.5 }} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Create your first wishlist</h2>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                  As you search, click the heart icon to save your favourite places and experiences.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-[15px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right, #FF385C, #E31C5F)' }}
                >
                  Start exploring
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
              >
                <AnimatePresence mode="popLayout">
                  {groups.map((g) => (
                    <MosaicCard
                      key={g.id}
                      groupName={g.label}
                      items={getGroupItems(g.id)}
                      onOpen={() => setOpenGroup(g.id)}
                      onClear={() => clearGroup(g.id)}
                      isClearing={isClearing}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Recently Viewed ── */}
            {recentlyViewed.length > 0 && (
              <div className="mt-14">
                <h2 className="text-[18px] font-semibold text-gray-900 mb-5">Recently viewed</h2>
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                  {recentlyViewed.map((item, i) => {
                    const img   = getImg(item);
                    const title = item.name || item.title || 'Untitled';
                    const loc   = item.address || item.location || null;
                    return (
                      <div
                        key={item._id || i}
                        onClick={() => navigate(getItemPath(item))}
                        className="flex-shrink-0 w-44 cursor-pointer"
                      >
                        <div
                          className="w-full rounded-xl overflow-hidden bg-gray-200 relative"
                          style={{ aspectRatio: '3/2' }}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={title}
                              className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <Heart className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 text-[13px] font-medium text-gray-900 truncate">{title}</p>
                        {loc && <p className="text-[12px] text-gray-400 truncate">{loc}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Confirmed Bookings ── */}
            {confirmedBookings.length > 0 && (
              <div className="mt-12">
                <h2 className="text-[18px] font-semibold text-gray-900 mb-5">Confirmed bookings</h2>
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                  {confirmedBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate(getItemPath({ _id: b.itemId, type: b.type }))}
                      className="flex-shrink-0 w-44 cursor-pointer"
                    >
                      <div
                        className="w-full rounded-xl overflow-hidden bg-gray-200 relative"
                        style={{ aspectRatio: '3/2' }}
                      >
                        {b.image ? (
                          <img
                            src={b.image}
                            alt={b.title}
                            className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Heart className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Confirmed
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13px] font-medium text-gray-900 truncate">{b.title}</p>
                      {b.dateStr  && <p className="text-[12px] text-gray-400 truncate">{b.dateStr}</p>}
                      {b.address  && <p className="text-[12px] text-gray-400 truncate">{b.address}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>

        ) : (
          /* ══ DETAIL VIEW – items inside a wishlist ══ */
          <>
            {/* Subtitle: count + clear */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-[15px] text-gray-500">
                {detailItems.length} {detailItems.length === 1 ? 'place' : 'places'}
              </p>
              {getGroupItems(openGroup).length > 0 && (
                <button
                  onClick={() => clearGroup(openGroup)}
                  disabled={isClearing}
                  className="text-sm font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  {isClearing ? 'Clearing…' : 'Clear all'}
                </button>
              )}
            </div>

            {detailItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center text-center max-w-xs mx-auto"
              >
                <Heart className="w-10 h-10 mb-4" style={{ stroke: '#FF385C', fill: 'transparent', strokeWidth: 1.5 }} />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nothing here yet</h2>
                <p className="text-gray-500 text-sm">This wishlist is empty.</p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8"
              >
                <AnimatePresence mode="popLayout">
                  {detailItems.map((item) => (
                    <ItemCard
                      key={`${item.type}-${item._id}`}
                      item={item}
                      isRemoving={removingId === item._id}
                      onRemove={removeFromWishlist}
                      onNavigate={navigate}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default WishList;
