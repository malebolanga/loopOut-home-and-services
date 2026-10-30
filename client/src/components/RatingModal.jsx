import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  XMarkIcon, 
  CheckBadgeIcon, 
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

import { authenticatedFetch } from '../utils/authenticatedFetch';

const QUICK_TAGS = [
  '⚡ Punctual & On Time',
  '💎 Exceptional Quality',
  '💬 Great Communication',
  '🧹 Clean & Organized',
  '🤝 Friendly & Respectful',
  '💰 Great Value',
  '🔁 Highly Recommended'
];

const HELPER_RATING_CATEGORIES = [
  { field: 'punctualityRating', label: '⏱️ Punctual & on time' },
  { field: 'qualityRating', label: '✨ Exceptional quality' },
  { field: 'communicationRating', label: '💬 Great communication' },
  { field: 'cleanlinessRating', label: '🧹 Clean & organised' },
  { field: 'respectfulnessRating', label: '🤝 Friendly & respectful' },
  { field: 'valueRating', label: '💰 Great value' },
  { field: 'recommendationRating', label: '⭐ Highly recommended' }
];
const CAR_WASH_RATING_CATEGORIES = [
  { field: 'tyresRating', label: '🛞 Tyres' },
  { field: 'interiorRating', label: '🪑 Interior' },
  { field: 'exteriorRating', label: '✨ Exterior & body' },
  { field: 'dashboardRating', label: '🧽 Dashboard' },
  { field: 'windowsRating', label: '🪟 Windows' },
  { field: 'matsRating', label: '🧹 Mats & carpets' },
  { field: 'serviceCommunicationRating', label: '💬 Communication' }
];
const BARBER_RATING_CATEGORIES = [
  { field: 'barberCleaningRating', label: '🧹 Cleaning' },
  { field: 'haircutRating', label: '✂️ Haircut' },
  { field: 'equipmentRating', label: '🧰 Equipment' },
  { field: 'serviceCareRating', label: '💈 Service care' },
  { field: 'barberCommunicationRating', label: '💬 Communication' }
];
const BEAUTY_RATING_CATEGORIES = [
  { field: 'beautyCleaningRating', label: '🧹 Cleaning' },
  { field: 'beautyCommunicationRating', label: '💬 Communication' },
  { field: 'beautyEquipmentRating', label: '🧰 Equipment' },
  { field: 'hairdressingRating', label: '💇 Hairdressing' },
  { field: 'timelinessRating', label: '⏱️ On time' }
];
const LISTING_RATING_CATEGORIES = [
  { field: 'hospitalityRating', label: '🛎️ Hospitality' },
  { field: 'comfortRating', label: '🛋️ Comfort' },
  { field: 'locationRating', label: '📍 Location' },
  { field: 'hostRating', label: '🧑‍💼 Owner / host' },
  { field: 'cleanlinessRating', label: '🧹 Cleanliness' },
];
const EMPTY_CATEGORY_RATINGS = Object.fromEntries([...HELPER_RATING_CATEGORIES, ...CAR_WASH_RATING_CATEGORIES, ...BARBER_RATING_CATEGORIES, ...BEAUTY_RATING_CATEGORIES, ...LISTING_RATING_CATEGORIES].map(({ field }) => [field, 0]));

export default function RatingModal({ 
  isOpen, 
  onClose, 
  booking, 
  onReviewSubmitted 
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [rating, setRating] = useState(5);
  const [categoryRatings, setCategoryRatings] = useState(EMPTY_CATEGORY_RATINGS);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [proAvatarFailed, setProAvatarFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRating(5);
    setCategoryRatings(EMPTY_CATEGORY_RATINGS);
    setHoverRating(0);
    setComment('');
    setSelectedTags([]);
    setSubmitting(false);
    setSuccess(false);
    setError('');
    setProAvatarFailed(false);
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const targetType = booking.type || (booking.listing ? 'listing' : booking.helper ? 'helper' : booking.event ? 'event' : 'service');
  const targetId = booking.itemId || booking.listing?._id || booking.helper?._id || booking.service?._id || booking.event?._id || booking._id;
  const targetTitle = booking.title || booking.itemName || booking.listing?.name || booking.helper?.name || booking.service?.name || booking.event?.name || 'Service';
  const serviceType = String(booking.service?.type || booking.raw?.service?.type || booking.subtype || booking.raw?.subtype || '').toLowerCase();
  const serviceTitle = String(booking.service?.name || booking.title || booking.itemName || '').toLowerCase();
  const normalizedServiceType = serviceType.replace(/[^a-z]/g, '');
  const isCarWashRating = targetType === 'service' && (normalizedServiceType.includes('carwash') || serviceTitle.includes('car wash') || serviceTitle.includes('carwash'));
  const helper = booking.helper || booking.raw?.helper;
  const helperType = String(helper?.type || booking.subtype || booking.raw?.subtype || '').toLowerCase();
  const isBarberRating = targetType === 'helper' && ['barber', 'barbar'].includes(helperType);
  const isBeautyRating = targetType === 'helper' && ['beauty', 'spa'].includes(helperType);
  const activeRatingCategories = targetType === 'listing' ? LISTING_RATING_CATEGORIES : isCarWashRating ? CAR_WASH_RATING_CATEGORIES : isBarberRating ? BARBER_RATING_CATEGORIES : isBeautyRating ? BEAUTY_RATING_CATEGORIES : HELPER_RATING_CATEGORIES;
  const selectedPerformerName = booking.selectedPerformer || booking.raw?.selectedPerformer;
  const selectedPerformer = helper?.performers?.find((performer) =>
    String(performer.name || '').trim().toLowerCase() === String(selectedPerformerName || '').trim().toLowerCase()
  );
  const proName = selectedPerformerName || booking.proName || booking.ownerName || 'Service Provider';
  const proAvatar = selectedPerformer?.image
    || booking.performerImage
    || booking.proAvatar
    || helper?.userRef?.avatar
    || booking.ownerAvatar
    || booking.userRef?.avatar
    || helper?.imageUrls?.[0]
    || booking.listing?.imageUrls?.[0]
    || booking.service?.imageUrls?.[0]
    || '';

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingSentiment = (stars) => {
    switch (stars) {
      case 1: return { text: 'Needs Improvement 😕', color: 'text-rose-500' };
      case 2: return { text: 'Fair Experience 🙂', color: 'text-amber-500' };
      case 3: return { text: 'Good Job 👍', color: 'text-yellow-500' };
      case 4: return { text: 'Very Good! ⭐', color: 'text-emerald-500' };
      case 5: return { text: 'Exceptional Service! 🌟', color: 'text-rose-500' };
      default: return { text: 'Rate Your Experience', color: 'text-gray-600' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isHelperRating = targetType === 'helper';
    const isListingRating = targetType === 'listing';
    const isCategorizedRating = isHelperRating || targetType === 'service' || isListingRating;
    const bookingId = booking.bookingId || booking.id || booking.raw?._id || booking._id;
    const selectedCategoryRatings = Object.fromEntries(Object.entries(categoryRatings).filter(([, value]) => Number(value) >= 1 && Number(value) <= 5));
    const selectedCategoryCount = Object.keys(selectedCategoryRatings).length;
    if (isListingRating && selectedCategoryCount !== LISTING_RATING_CATEGORIES.length) {
      setError('Please rate all five stay categories before submitting your review.');
      return;
    }
    const submittedRating = isCategorizedRating
      ? selectedCategoryCount
        ? Math.round(Object.values(selectedCategoryRatings).reduce((sum, value) => sum + value, 0) / selectedCategoryCount)
        : 0
      : rating;
    if (!submittedRating) {
      setError(isCategorizedRating ? 'Please rate at least one service category.' : 'Please select a star rating.');
      return;
    }
    if (!targetId || !bookingId) {
      setError('We could not identify this completed booking. Close this form and try again from your booking.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Build feedback text with tags if included
      let fullContent = comment.trim();
      if (selectedTags.length > 0) {
        const tagsHeader = selectedTags.join(' • ');
        fullContent = fullContent ? `${fullContent}\n\nHighlights: ${tagsHeader}` : `Highlights: ${tagsHeader}`;
      }
      if (!fullContent) {
        fullContent = `Rated ${submittedRating} stars for ${targetTitle}.`;
      }

      let endpoint = '/api/service-comments';
      let payload = {
        content: fullContent,
        rating,
        bookingId,
        userName: currentUser?.username || 'Client',
        userAvatar: currentUser?.avatar || '/default-avatar.jpg'
      };

      if (targetType === 'helper') {
        endpoint = '/api/helper-comments';
        payload = {
          ...payload,
          helperId: targetId,
          bookingId,
          rating: submittedRating,
          ...selectedCategoryRatings
        };
      } else if (targetType === 'listing') {
        endpoint = '/api/comments';
        payload = {
          ...payload,
          listingId: targetId,
          rating: submittedRating,
          ...selectedCategoryRatings
        };
      } else if (targetType === 'event') {
        endpoint = '/api/event-comments';
        payload = {
          ...payload,
          eventId: targetId
        };
      } else {
        endpoint = '/api/service-comments';
        payload = {
          ...payload,
          serviceId: targetId,
          rating: submittedRating,
          ...selectedCategoryRatings
        };
      }

      const res = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || `Submission failed with status ${res.status}`);
      }

      setSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      setTimeout(() => {
        onClose();
      }, 2200);

    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStars = hoverRating || rating;
  const sentiment = getRatingSentiment(currentStars);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!submitting ? onClose : undefined}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-br from-slate-950 via-gray-900 to-rose-950 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <SparklesIcon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400">
                  Share your experience
                </span>
              </div>

              {!submitting && !success && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Provider Info preview */}
            <div className="flex items-center gap-4 mt-5 relative z-10">
              <div className="relative">
                {proAvatar && !proAvatarFailed ? (
                  <img
                    src={proAvatar}
                    alt={`${proName}'s profile`}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-slate-800"
                    onError={() => setProAvatarFailed(true)}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-white/10 text-white/80 shadow-md flex items-center justify-center text-xl font-bold" aria-label={`${proName} profile photo unavailable`}>
                    {proName.trim().charAt(0).toUpperCase() || 'P'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#020617] flex items-center justify-center">
                  <CheckBadgeIcon className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-white leading-tight truncate">{proName}</h3>
                <p className="text-xs text-white/70 font-semibold truncate mt-0.5">{targetTitle}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-emerald-400">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>{isBarberRating && selectedPerformerName ? `Selected barber: ${selectedPerformerName} · ` : ''}Booking complete &bull; Your honest feedback helps future clients</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-hide">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                  <HeartIcon className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Thank You for Your Feedback!</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                  Your rating and review has been shared with {proName} and the loopOut community.
                </p>
                <div className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider">
                  <CheckBadgeIcon className="w-4 h-4" />
                  Review Published
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating Section */}
                <div className="text-center space-y-2">
                  {targetType === 'helper' || targetType === 'service' || targetType === 'listing' ? (
                    <div className="space-y-4 rounded-2xl bg-slate-50 p-4 text-left">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">{targetType === 'listing' ? 'Rate each part of your stay' : 'Rate each part of the service'}</p>
                      {activeRatingCategories.map((category) => (
                        <div key={category.field} className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-slate-700">{category.label}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setCategoryRatings((previous) => ({ ...previous, [category.field]: star }))}
                                aria-label={`Rate ${category.label.replace(/^\S+\s/, '')} ${star} stars`}
                                className="p-1 focus:outline-none"
                              >
                                {star <= categoryRatings[category.field]
                                  ? <StarIcon className="h-6 w-6 text-amber-400" />
                                  : <StarOutline className="h-6 w-6 text-gray-300" />}
                              </button>
                            ))}
                          </div>
                          <span className="w-10 text-right text-[10px] font-bold tabular-nums text-slate-500">
                            {categoryRatings[category.field] ? `${categoryRatings[category.field]}/5` : '—/5'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">How was your experience?</p>
                      <div className="flex items-center justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                            aria-label={`Rate ${star} star`}
                          >
                            {star <= currentStars ? <StarIcon className="w-9 h-9 text-amber-400 drop-shadow-sm transition-colors" /> : <StarOutline className="w-9 h-9 text-gray-300 transition-colors" />}
                          </button>
                        ))}
                      </div>
                      <p className={`text-xs font-black uppercase tracking-wider transition-colors ${sentiment.color}`}>{sentiment.text}</p>
                    </>
                  )}
                </div>

                {/* Quick Highlights Tag Pills */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                    What stood out? (Tap all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                    Add a comment or note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Write a few words about your experience with ${proName}...`}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                    {error}
                  </p>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Submitting…</span></>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        <span>Submit Rating &amp; Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
