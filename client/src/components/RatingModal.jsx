import React, { useState } from 'react';
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

export default function RatingModal({ 
  isOpen, 
  onClose, 
  booking, 
  onReviewSubmitted 
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const targetType = booking.type || (booking.listing ? 'listing' : booking.helper ? 'helper' : booking.event ? 'event' : 'service');
  const targetId = booking.itemId || booking.listing?._id || booking.helper?._id || booking.service?._id || booking.event?._id || booking._id;
  const targetTitle = booking.title || booking.itemName || booking.listing?.name || booking.helper?.name || booking.service?.name || booking.event?.name || 'Service';
  const proName = booking.proName || booking.ownerName || booking.selectedPerformer || 'Service Provider';
  const proAvatar = booking.proAvatar || booking.ownerAvatar || booking.performerImage || 'https://i.pravatar.cc/150?u=pro';

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
    if (!rating) {
      setError('Please select a star rating.');
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
        fullContent = `Rated ${rating} stars for ${targetTitle}.`;
      }

      let endpoint = '/api/service-comments';
      let payload = {
        content: fullContent,
        rating,
        userName: currentUser?.username || 'Client',
        userAvatar: currentUser?.avatar || '/default-avatar.jpg'
      };

      if (targetType === 'helper') {
        endpoint = '/api/helper-comments';
        payload = {
          ...payload,
          helperId: targetId,
          cleanlinessRating: rating,
          communicationRating: rating
        };
      } else if (targetType === 'listing') {
        endpoint = '/api/comments';
        payload = {
          ...payload,
          listingId: targetId
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
          serviceId: targetId
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
                  Work Completed &amp; Verified
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
                <img
                  src={proAvatar}
                  alt={proName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-slate-800"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#020617] flex items-center justify-center">
                  <CheckBadgeIcon className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-white leading-tight truncate">{proName}</h3>
                <p className="text-xs text-white/70 font-semibold truncate mt-0.5">{targetTitle}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-emerald-400">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>Job Completed &bull; Payment Released</span>
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
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                    How was your experience?
                  </p>
                  
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
                        {star <= currentStars ? (
                          <StarIcon className="w-9 h-9 text-amber-400 drop-shadow-sm transition-colors" />
                        ) : (
                          <StarOutline className="w-9 h-9 text-gray-300 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>

                  <p className={`text-xs font-black uppercase tracking-wider transition-colors ${sentiment.color}`}>
                    {sentiment.text}
                  </p>
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
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
