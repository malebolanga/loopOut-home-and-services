import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  TagIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';

const CATEGORY_META = {
  furniture:    { emoji: '🛋️', label: 'Furniture',    gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  electronics:  { emoji: '📱', label: 'Electronics',  gradient: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  clothes:      { emoji: '👗', label: 'Clothes',      gradient: 'from-rose-400 to-pink-500',     bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200'  },
  universities: { emoji: '🎓', label: 'Universities', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200'},
  books:        { emoji: '📚', label: 'Books',        gradient: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200'},
};

export default function SellListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + listing.imageUrls.length) % listing.imageUrls.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % listing.imageUrls.length);

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
          className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-xl border border-gray-100"
        >
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Listing not found</h2>
          <p className="text-gray-400 text-sm mb-8">{error || 'This item may have been removed.'}</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-rose-500 transition-all active:scale-95">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const meta = CATEGORY_META[listing.category] || { emoji: '🏷️', label: listing.category, gradient: 'from-gray-600 to-gray-800', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  return (
    <div className="min-h-screen bg-[#F8F8F8]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100" style={{ paddingTop: 0 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold hidden sm:inline">Back</span>
          </button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${meta.gradient} text-white shadow-lg shadow-rose-200/40`}>
            <span>{meta.emoji}</span>
            <span className="text-xs font-black uppercase tracking-widest">{meta.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button onClick={handleShare} className="relative w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <ShareIcon className="w-4 h-4 text-gray-600" />
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
            <button onClick={() => setLiked((l) => !l)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              {liked
                ? <HeartIconSolid className="w-4 h-4 text-rose-500" />
                : <HeartIcon className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 xl:gap-16">

          {/* ── LEFT: IMAGES + DESCRIPTION ── */}
          <div className="space-y-8">

            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-200 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={listing.imageUrls[activeImage]}
                    alt={listing.title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                {/* Prev / Next arrows */}
                {listing.imageUrls.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                      <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                      <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {activeImage + 1} / {listing.imageUrls.length}
                </div>
              </div>

              {/* Thumbnails */}
              {listing.imageUrls.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                  {listing.imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                        activeImage === i ? 'ring-3 ring-rose-500 ring-offset-2 scale-105' : 'opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Description Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                <h2 className="text-base font-black text-gray-900 uppercase tracking-widest">Description</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">{listing.description}</p>
            </motion.div>

            {/* Book Details (only for books) */}
            {listing.category === 'books' && (listing.bookAuthor || listing.bookYear || listing.bookUsageHistory) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                    <BookOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Book Info</p>
                    <h3 className="text-lg font-black text-gray-900">Details</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.bookAuthor && (
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Author</span>
                      </div>
                      <p className="font-bold text-gray-900">{listing.bookAuthor}</p>
                    </div>
                  )}
                  {listing.bookYear && (
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Year Published</span>
                      </div>
                      <p className="font-bold text-gray-900">{listing.bookYear}</p>
                    </div>
                  )}
                  {listing.bookUsageHistory && (
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <ClockIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History of Usage</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{listing.bookUsageHistory}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: STICKY PANEL ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5 lg:sticky lg:top-24 self-start">

            {/* Price + Title Card */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-md">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${meta.bg} ${meta.text} border ${meta.border} mb-5 text-[11px] font-black uppercase tracking-widest`}>
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </div>

              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-4">{listing.title}</h1>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-black text-rose-500 leading-none">R{listing.price?.toLocaleString()}</span>
              </div>

              {listing.condition && (
                <div className="mt-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 font-semibold">Condition: <span className="text-gray-900 font-bold">{listing.condition}</span></span>
                </div>
              )}
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="relative">
                <img
                  src={listing.creator?.avatar || `https://ui-avatars.com/api/?name=${listing.creator?.username || 'U'}&background=f3f4f6&color=374151&size=128`}
                  alt="Seller"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Listed by</p>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-900 truncate">{listing.creator?.username || 'Anonymous'}</h3>
                  <CheckBadgeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Member of LoopOut</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gray-950 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden">
              {/* Decorative orb */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="font-black text-lg mb-6 tracking-tight relative z-10">Contact Seller</h3>

              <div className="space-y-4 relative z-10 mb-6">
                <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-lg truncate">{listing.contact}</p>
                  </div>
                </div>

                {listing.address && (
                  <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location</p>
                      <p className="font-semibold text-sm truncate">{listing.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 relative z-10">
                <a
                  href={`tel:${listing.contact}`}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-95 shadow-lg"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Call Seller
                </a>
                <button
                  className="flex items-center justify-center gap-3 w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all duration-300 active:scale-95"
                >
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>

            {/* Safety tip */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <ShieldCheckIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Safety Tip</p>
                <p className="text-xs text-amber-700 leading-relaxed">Meet the seller in a public place. Never share your payment credentials.</p>
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
