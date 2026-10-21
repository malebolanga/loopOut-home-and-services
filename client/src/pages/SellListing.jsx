import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { FaWhatsapp } from 'react-icons/fa';

const CATEGORY_META = {
  furniture:    { emoji: '🛋️', label: 'Furniture',    gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  electronics:  { emoji: '📱', label: 'Electronics',  gradient: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  clothes:      { emoji: '👗', label: 'Clothes',      gradient: 'from-rose-400 to-pink-500',     bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200'  },
  universities: { emoji: '🎓', label: 'Universities', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200'},
  books:        { emoji: '📚', label: 'Books',        gradient: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200'},
};

const toWhatsAppNumber = (contact) => {
  let digits = String(contact || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `27${digits.slice(1)}`;
  return digits.length >= 9 ? digits : '';
};

export default function SellListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validate that the ID looks like a MongoDB ObjectId (24 hex characters)
  const isValidId = /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    if (!isValidId) {
      setError('Invalid listing identifier.');
      setLoading(false);
      return;
    }
    const fetchListing = async () => {
  setLoading(true);
  try {
    // Attempt to fetch from sell endpoint first
    let res = await fetch(`/api/sell/${id}`);
    // If not found, fallback to regular listings endpoint
    if (res.status === 404) {
      res = await fetch(`/api/listing/${id}`);
    }
    const data = await res.json();
    if (!data.success) {
      setError(data.message || 'Listing not found');
    } else {
      setListing(data.data);
    }
  } catch (err) {
    setError('Failed to fetch listing');
  } finally {
    setLoading(false);
  }
};
    fetchListing();
  }, [id, isValidId]);

  useEffect(() => {
    if (!showAllPhotos) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowAllPhotos(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAllPhotos]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const imageUrls = Array.isArray(listing?.imageUrls) ? listing.imageUrls.filter(Boolean) : [];
  const galleryImages = imageUrls.length ? imageUrls : ['https://placehold.co/1200x900/f1f5f9/64748b?text=Photo+not+available'];
  const whatsappNumber = toWhatsAppNumber(listing?.contact);
  const sellerName = String(listing?.creator?.username || 'there').trim().replace(/\s+/g, ' ');
  const whatsappMessage = `Hi ${sellerName}, I’m interested in ${listing?.title || 'your item'} on LoopOut${listing?.price ? ` listed for R${Number(listing.price).toLocaleString('en-ZA')}` : ''}. Is it still available?`;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}` : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-rose-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-rose-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-xl border border-gray-100 dark:border-gray-800"
        >
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Listing not found</h2>
          <p className="text-gray-400 text-sm mb-8">{error || 'This item may have been removed.'}</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-rose-500 transition-all active:scale-95">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const meta = CATEGORY_META[listing.category] || { emoji: '🏷️', label: listing.category, gradient: 'from-gray-600 to-gray-800', bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-white', border: 'border-gray-200 dark:border-gray-800' };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900 dark:bg-slate-950 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">LoopOut Marketplace</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">Item details</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button onClick={handleShare} className="relative w-9 h-9 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <ShareIcon className="w-4 h-4 text-gray-600 dark:text-white" />
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                  >
                    Copied!
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            {/* Favourite */}
            <button aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => setLiked((l) => !l)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
              {liked
                ? <HeartIconSolid className="h-5 w-5 text-rose-500" />
                : <HeartIcon className="h-5 w-5 text-slate-600 dark:text-slate-200" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Marketplace</span><span aria-hidden="true">/</span><span className="font-medium text-slate-700 dark:text-slate-200">{meta.label}</span>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">

          {/* ── LEFT: IMAGES + DESCRIPTION ── */}
          <div className="space-y-8">

            {/* Cover gallery: large lead photo with smaller listing photos alongside. */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative overflow-hidden rounded-3xl bg-slate-200 shadow-sm dark:bg-slate-800">
                <div className="grid h-[280px] grid-cols-1 gap-1.5 sm:h-[360px] md:h-[420px] md:grid-cols-4 md:grid-rows-2">
                  <button
                    type="button"
                    onClick={() => imageUrls.length && setShowAllPhotos(true)}
                    aria-label={imageUrls.length ? `Open all ${imageUrls.length} photos` : 'Listing cover photo'}
                    className={`group relative min-h-0 overflow-hidden text-left ${imageUrls.length > 1 ? 'md:col-span-2' : 'md:col-span-4'} md:row-span-2`}
                  >
                    <img
                      src={galleryImages[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      onError={(event) => { event.currentTarget.src = 'https://placehold.co/1200x900/f1f5f9/64748b?text=Photo+not+available'; }}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </button>

                  {imageUrls.length > 1 && (
                    <div className={`hidden min-h-0 grid-cols-2 gap-1.5 md:col-span-2 md:row-span-2 md:grid ${imageUrls.length === 3 ? 'md:grid-rows-1' : 'md:grid-rows-2'}`}>
                      {imageUrls.slice(1, 5).map((url, index) => {
                        const layoutClass = imageUrls.length === 2
                          ? 'md:col-span-2 md:row-span-2'
                          : imageUrls.length === 4 && index === 2
                            ? 'md:col-span-2'
                            : '';
                        return (
                        <button
                          key={`${url}-${index}`}
                          type="button"
                          onClick={() => setShowAllPhotos(true)}
                          aria-label={`Open photo ${index + 2}`}
                          className={`group relative min-h-0 overflow-hidden bg-slate-300 dark:bg-slate-700 ${layoutClass}`}
                        >
                          <img
                            src={url}
                            alt={`${listing.title}, photo ${index + 2}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            onError={(event) => { event.currentTarget.src = 'https://placehold.co/800x600/f1f5f9/64748b?text=Photo'; }}
                          />
                          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                        </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {imageUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllPhotos(true)}
                    aria-label={`View all ${imageUrls.length} photos`}
                    className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/95 px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-md transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/50 sm:bottom-5 sm:right-5"
                  >
                    <span aria-hidden="true">▦</span>
                    View all {imageUrls.length} {imageUrls.length === 1 ? 'photo' : 'photos'}
                  </button>
                )}
              </div>
            </motion.div>

            <AnimatePresence>
              {showAllPhotos && imageUrls.length > 0 && (
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${listing.title} photo gallery`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="fixed inset-0 z-[100] overflow-y-auto bg-white text-slate-900 dark:bg-slate-950 dark:text-white"
                >
                  <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                      <button type="button" onClick={() => setShowAllPhotos(false)} aria-label="Back to item details" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold sm:text-base">{listing.title}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{imageUrls.length} {imageUrls.length === 1 ? 'photo' : 'photos'}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowAllPhotos(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Done</button>
                  </header>

                  <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-9">
                    <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">Item photos</p>
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{listing.title}</h1>
                      {listing.address && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{listing.address}</p>}
                    </div>
                    <div className="space-y-4">
                      {imageUrls.map((url, index) => (
                        <motion.figure
                          key={`${url}-${index}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.24 }}
                          className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900"
                        >
                          <img
                            src={url}
                            alt={`${listing.title}, photo ${index + 1}`}
                            className="max-h-[75vh] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                            onError={(event) => { event.currentTarget.src = 'https://placehold.co/1200x900/f1f5f9/64748b?text=Photo+not+available'; }}
                          />
                          <span className="block px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{index + 1} of {imageUrls.length}</span>
                        </motion.figure>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest">Description</h2>
              </div>
              <p className="text-gray-600 dark:text-white leading-relaxed whitespace-pre-wrap text-[15px]">{listing.description}</p>
            </motion.div>

            {/* Book Details (only for books) */}
            {listing.category === 'books' && (listing.bookAuthor || listing.bookYear || listing.bookUsageHistory) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                    <BookOpenIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Book information</p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Details</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.bookAuthor && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Author</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{listing.bookAuthor}</p>
                    </div>
                  )}
                  {listing.bookYear && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Year Published</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{listing.bookYear}</p>
                    </div>
                  )}
                  {listing.bookUsageHistory && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <ClockIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History of Usage</span>
                      </div>
                      <p className="text-gray-600 dark:text-white text-sm leading-relaxed">{listing.bookUsageHistory}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: STICKY PANEL ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5 lg:sticky lg:top-24 self-start">

            {/* Price + Title Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${meta.bg} ${meta.text} ${meta.border} text-[11px] font-semibold uppercase tracking-wider`}>
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </div>

              <h1 className="mb-4 text-2xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-3xl">{listing.title}</h1>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-semibold leading-none tracking-tight text-slate-950 dark:text-white">{Number.isFinite(Number(listing.price)) ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(Number(listing.price)) : 'Price not available'}</span>
              </div>

              {listing.condition && (
                <div className="mt-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-300">Condition: <span className="font-semibold text-slate-900 dark:text-white">{listing.condition}</span></span>
                </div>
              )}
            </div>

            {/* Seller Card */}
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="relative">
                <img
                  src={listing.creator?.avatar || `https://ui-avatars.com/api/?name=${listing.creator?.username || 'U'}&background=f3f4f6&color=374151&size=128`}
                  alt="Seller"
                  className="h-14 w-14 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Listed by</p>
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-slate-900 dark:text-white">{listing.creator?.username || 'Anonymous'}</h3>
                  {(listing.creator?.verified === true || listing.creator?.isVerified === 'verified') && <CheckBadgeIcon aria-label="Verified seller" className="h-4 w-4 flex-shrink-0 text-blue-500" />}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">LoopOut member</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Contact the seller</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ask a question or arrange a safe collection.</p>

              <div className="my-5 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950">
                    <PhoneIcon className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Phone</p>
                    <p className="truncate font-medium text-slate-900 dark:text-white">{listing.contact}</p>
                  </div>
                </div>

                {listing.address && (
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
                      <MapPinIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Location</p>
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{listing.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Message ${sellerName} on WhatsApp`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1fbd5b] focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-900"
                  >
                    <FaWhatsapp className="h-5 w-5" />
                    WhatsApp seller
                  </a>
                )}
                {listing.contact && (
                  <a
                    href={`tel:${String(listing.contact).replace(/[^\d+]/g, '')}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    Call seller
                  </a>
                )}
                {!whatsappHref && !listing.contact && <p className="text-sm text-slate-500 dark:text-slate-400">Seller contact details are not available.</p>}
              </div>
            </div>

            {/* Safety tip */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-900 dark:text-amber-200">Stay safe</p>
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">Meet in a public place, check the item before paying, and never share payment credentials.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .ring-3 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
      `}</style>
    </div>
  );
}
