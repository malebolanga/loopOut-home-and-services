import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEllipsisH, FaHeart, FaRegHeart, FaChevronDown, FaChevronUp, FaStar, FaBroom, FaUserFriends } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const HelperComments = ({ helperId, maxComments = 3, onTotalComments, onRatingsChange, showSummary = false, cardStyle = false, externalRefreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [ratedBookingIds, setRatedBookingIds] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [isCheckingBooking, setIsCheckingBooking] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState({
    comments: false,
    submitting: false,
    liking: false,
    replying: false,
    deleting: false
  });
  const [error, setError] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const hasFailed = useRef(false); // prevent infinite retry loop on 404/error
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    staff: 0,
    communication: 0,
    punctuality: 0,
    quality: 0,
    respectfulness: 0,
    value: 0,
    recommendation: 0,
    overall: 0
  });
  const [categoryRatings, setCategoryRatings] = useState({
    punctualityRating: 0,
    qualityRating: 0,
    communicationRating: 0,
    cleanlinessRating: 0,
    respectfulnessRating: 0,
    valueRating: 0,
    recommendationRating: 0
  });
  const ratingCategories = [
    { field: 'punctualityRating', label: '⏱️ Punctual & on time' },
    { field: 'qualityRating', label: '✨ Work quality' },
    { field: 'communicationRating', label: '💬 Communication' },
    { field: 'cleanlinessRating', label: '🧹 Clean & organised' },
    { field: 'respectfulnessRating', label: '🤝 Friendly & respectful' },
    { field: 'valueRating', label: '💰 Great value' },
    { field: 'recommendationRating', label: '⭐ Would recommend' }
  ];
  const RATING_CATEGORIES = [
    { name: 'Cleanliness', icon: FaBroom },
    { name: 'Staff', icon: FaUserFriends }
  ];
  const availableBookings = completedBookings.filter((booking) => !ratedBookingIds.includes(String(booking._id)));

  useEffect(() => {
    if (!availableBookings.some((booking) => String(booking._id) === selectedBookingId)) {
      setSelectedBookingId(String(availableBookings[0]?._id || ''));
    }
  }, [availableBookings, selectedBookingId]);

  const fetchComments = useCallback(async () => {
    if (!helperId) return;
    if (hasFailed.current) return; // stop retrying after a permanent failure
    setLoading(prev => ({ ...prev, comments: true }));
    setError(null);
    try {
      // If maxComments is 0, fetch all comments without limit
      const url = maxComments > 0
        ? `/api/helper-comments/${helperId}?limit=${maxComments}`
        : `/api/helper-comments/${helperId}?all=true`;
      
      const res = await fetch(url, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type') || '';
        let errorMsg = 'Failed to fetch comments';
        if (contentType.includes('application/json')) {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        }
        throw new Error(errorMsg);
      }
      
      const data = await res.json();
      setComments(data.comments || []);
      setTotalComments(data.totalComments || 0);
      setRatedBookingIds(data.ratedBookingIds || (data.comments || []).map((comment) => String(comment.bookingId || '')).filter(Boolean));
      
      // Set ratings from API response
      if (data.ratings) {
        setRatings({
          cleanliness: data.ratings.cleanliness || 0,
          staff: data.ratings.staff || 0,
          communication: data.ratings.communication || data.ratings.staff || 0,
          punctuality: data.ratings.punctuality || 0,
          quality: data.ratings.quality || 0,
          respectfulness: data.ratings.respectfulness || 0,
          value: data.ratings.value || 0,
          recommendation: data.ratings.recommendation || 0,
          overall: data.ratings.overall || 0
        });
      }

      // Call the callback to update the comment count in parent component
      if (onTotalComments) {
        onTotalComments(data.totalComments || 0);
      }
      
      // Call the callback to pass up rating data
      if (onRatingsChange && data.ratings) {
        onRatingsChange({
          cleanliness: data.ratings.cleanliness || 0,
          communication: data.ratings.staff || 0, 
          punctuality: data.ratings.punctuality || 0,
          quality: data.ratings.quality || 0,
          respectfulness: data.ratings.respectfulness || 0,
          value: data.ratings.value || 0,
          recommendation: data.ratings.recommendation || 0,
          overall: data.ratings.overall || 0
        });
      }

    } catch (err) {
      hasFailed.current = true; // lock out further retries
      setError(err.message);
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(prev => ({ ...prev, comments: false }));
    }
  }, [helperId, maxComments, onTotalComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshTrigger, externalRefreshTrigger]);

  const checkBookingStatus = useCallback(async () => {
    if (!currentUser?._id || !helperId) {
      setIsCheckingBooking(false);
      return;
    }
    try {
      const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const completed = data.filter((booking) =>
            String(booking.helper?._id || booking.helper || '') === String(helperId)
            && String(booking.status || '').toLowerCase() === 'completed'
          );
          setCompletedBookings(completed);
        }
      }
    } catch (err) {
      console.error('Error checking booking status:', err);
    } finally {
      setIsCheckingBooking(false);
    }
  }, [currentUser?._id, helperId]);

  useEffect(() => {
    checkBookingStatus();
  }, [checkBookingStatus]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedBookingId) {
      setError('Choose a completed booking that has not already been reviewed.');
      return;
    }
    const selectedRatings = Object.fromEntries(Object.entries(categoryRatings).filter(([, value]) => Number(value) >= 1 && Number(value) <= 5));
    if (!Object.keys(selectedRatings).length) {
      setError('Rate at least one service category.');
      return;
    }
    if (!commentContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      const res = await authenticatedFetch('/api/helper-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent,
          helperId,
          bookingId: selectedBookingId,
          userName: currentUser.username,
          userAvatar: currentUser.avatar || '/default-avatar.jpg',
          ...selectedRatings
        })
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to post comment');
      }

      setCommentContent('');
      setCategoryRatings({
        punctualityRating: 0,
        qualityRating: 0,
        communicationRating: 0,
        cleanlinessRating: 0,
        respectfulnessRating: 0,
        valueRating: 0,
        recommendationRating: 0
      });
      setRatedBookingIds((previous) => [...new Set([...previous, selectedBookingId])]);
      setSelectedBookingId('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
      console.error('Post comment error:', err);
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      setError('You must be logged in to like comments');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, liking: true }));
      
      const res = await authenticatedFetch(`/api/helper-comments/like/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to like comment');
      }

      // Optimistic update for likes
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          const isLiked = comment.likes?.includes(currentUser._id);
          return {
            ...comment,
            likes: isLiked 
              ? comment.likes.filter(id => id !== currentUser._id)
              : [...(comment.likes || []), currentUser._id]
          };
        }
        return comment;
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, liking: false }));
    }
  };

  const handleSubmitReply = async (commentId) => {
    setError(null);
    if (!replyContent.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to reply');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, replying: true }));
      
      const res = await authenticatedFetch(`/api/helper-comments/reply/${commentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          userName: currentUser.username,
          userAvatar: currentUser.avatar || '/default-avatar.jpg'
        })
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to post reply');
      }

      setReplyingTo(null);
      setReplyContent('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, replying: false }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      
      const res = await fetch(`/api/helper-comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  const toggleRepliesExpansion = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderBookingAndRatingFields = () => (
    <div className="mb-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200">
        Which completed booking are you reviewing?
        <select
          value={selectedBookingId}
          onChange={(event) => setSelectedBookingId(event.target.value)}
          disabled={loading.submitting || availableBookings.length === 0}
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-rose-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        >
          {availableBookings.map((booking) => {
            const date = new Date(booking.startDate || booking.createdAt);
            const dateLabel = Number.isNaN(date.getTime()) ? 'Completed booking' : date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
            return <option key={booking._id} value={booking._id}>{dateLabel} · {booking.helper?.name || 'Helper service'}</option>;
          })}
        </select>
      </label>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-700 dark:text-gray-200">Rate each part of the service</p>
        {ratingCategories.map((category) => {
          const score = categoryRatings[category.field];
          return (
            <div key={category.field} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 dark:border-gray-800">
              <span className="min-w-0 text-xs font-medium text-slate-700 dark:text-gray-200">{category.label}</span>
              <div className="flex shrink-0 items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" disabled={loading.submitting} onClick={() => setCategoryRatings((previous) => ({ ...previous, [category.field]: star }))} aria-label={`${category.label} ${star} out of 5`} className="p-0.5 disabled:opacity-50">
                    <FaStar className={`text-base ${star <= score ? 'text-amber-400' : 'text-slate-300 dark:text-gray-700'}`} />
                  </button>
                ))}
                <span className="ml-1 w-8 text-right text-[10px] font-bold tabular-nums text-slate-500">{score ? `${score}/5` : '—/5'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading.comments && comments.length === 0) {
    return (
      <div className="flex justify-center items-center py-4">
        <FaSpinner className="animate-spin text-xl text-blue-500 mr-2" />
        <span>Loading comments...</span>
      </div>
    );
  }

  return (
    <div className={cardStyle ? '' : 'mb-6'}>
      {/* Ratings Summary Section - only show when not in card style */}
      {showSummary && !cardStyle && (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold">{ratings.overall.toFixed(1)}</span>
            <div className="ml-3">
              <div className="text-sm text-gray-600">out of 5</div>
              <div className="text-gray-600 text-sm">{totalComments} reviews</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: 'punctuality', label: '⏱️ Punctuality' },
              { key: 'quality', label: '✨ Work quality' },
              { key: 'communication', label: '💬 Communication' },
              { key: 'cleanliness', label: '🧹 Cleanliness & organisation' },
              { key: 'respectfulness', label: '🤝 Friendly & respectful' },
              { key: 'value', label: '💰 Value for money' },
              { key: 'recommendation', label: '⭐ Would recommend' }
            ].map(({ key, label }) => {
              const value = Number(ratings[key]) || 0;
              return (
                <div key={key}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-medium">{value ? value.toFixed(1) : '—'}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(value / 5) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          {totalComments > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-700">
                Rating per 10 comments: 
                <span className="font-semibold ml-1">
                  {(ratings.overall * 2).toFixed(1)}/10
                </span>
              </div>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i}
                    className={`${
                      i < Math.floor(ratings.overall) 
                        ? 'text-yellow-400' 
                        : ratings.overall % 1 > 0.5 && i === Math.floor(ratings.overall) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                    } mr-1`} 
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  ({(ratings.overall * 2).toFixed(1)}/10)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center text-sm">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-red-700 hover:text-red-900"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {cardStyle && showSummary && (
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900" aria-label="Average review scores">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">Guest ratings</p>
              <h3 className="mt-1 text-2xl font-bold leading-none text-slate-900 dark:text-white">{ratings.overall ? ratings.overall.toFixed(1) : '—'} <span className="text-sm font-medium text-slate-500">/ 5</span></h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">{totalComments} {totalComments === 1 ? 'review' : 'reviews'}</p>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
            {ratingCategories.map(({ field, label }) => {
              const key = field.replace('Rating', '').toLowerCase();
              const score = Number(ratings[key]) || 0;
              return (
                <div key={field}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-medium text-slate-700 dark:text-gray-200">{label}</span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900 dark:text-white">{score ? `${score.toFixed(1)}/5` : '—/5'}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-rose-500 transition-[width]" style={{ width: `${Math.max(0, Math.min(100, (score / 5) * 100))}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Function to render star inputs */}
      {currentUser && (
        <div style={{ display: 'none' }} />
      )}
      

      {!cardStyle && currentUser ? (
        isCheckingBooking ? (
          <div className="mb-4 animate-pulse rounded-xl bg-gray-50 p-4 text-center"><p className="text-sm text-gray-400">Checking completed bookings…</p></div>
        ) : availableBookings.length > 0 ? (
          <form onSubmit={handleSubmitComment} className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {renderBookingAndRatingFields()}
            <textarea value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="Share what went well or what could be better…" className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-rose-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100" rows={4} disabled={loading.submitting} />
            <button type="submit" disabled={!commentContent.trim() || !selectedBookingId || loading.submitting} className="mt-3 min-h-11 w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
              {loading.submitting ? 'Posting review…' : 'Post review for this booking'}
            </button>
          </form>
        ) : (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">{completedBookings.length ? 'You have reviewed your completed bookings' : 'Reviews are available after a completed booking'}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Each completed booking can receive one review.</p>
          </div>
        )
      ) : !cardStyle ? (
        <div className="mb-6 rounded-xl bg-gray-100 p-3 text-center"><p className="text-sm text-gray-600">Please <a href="/sign-in" className="text-blue-500 hover:underline">sign in</a> to leave a review.</p></div>
      ) : null}

      {cardStyle && currentUser ? (
        isCheckingBooking ? (
          <div className="mb-4 animate-pulse rounded-xl bg-gray-50 p-4 text-center"><p className="text-sm text-gray-400">Checking completed bookings…</p></div>
        ) : availableBookings.length > 0 ? (
          <form onSubmit={handleSubmitComment} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Share your experience</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">One review is allowed for each completed booking.</p>
            </div>
            {renderBookingAndRatingFields()}
            <textarea value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="Tell others about your experience…" className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-rose-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100" rows={4} disabled={loading.submitting} />
            <button type="submit" disabled={!commentContent.trim() || !selectedBookingId || loading.submitting} className="mt-3 min-h-11 w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
              {loading.submitting ? 'Posting review…' : 'Post review for this booking'}
            </button>
          </form>
        ) : (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">{completedBookings.length ? 'You have reviewed your completed bookings' : 'Reviews are available after a completed booking'}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Each completed booking can receive one review.</p>
          </div>
        )
      ) : cardStyle ? (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900"><p className="text-sm text-slate-600 dark:text-gray-300">Please <a href="/sign-in" className="text-rose-600 hover:underline">sign in</a> to leave a review.</p></div>
      ) : null}
      <div className={`space-y-4 ${cardStyle ? 'grid grid-cols-1 gap-4' : ''}`}>
        {comments.length === 0 && !loading.comments && totalComments === 0 ? (
          <div className={`text-center py-4 text-gray-500 ${cardStyle ? 'col-span-full' : ''}`}>
            {cardStyle ? 'No reviews yet' : 'No comments yet. Be the first to comment!'}
          </div>
        ) : (
          comments.map(comment => {
            const replyCount = comment.replies?.length || 0;
            const showLimitedReplies = replyCount > 2 && !expandedReplies[comment._id];
            const displayedReplies = showLimitedReplies 
              ? comment.replies.slice(0, 2) 
              : comment.replies;

            return (
              <div 
                key={comment._id} 
                className={cardStyle ? 
                  'bg-white rounded-xl p-4 shadow-sm border border-gray-200' : 
                  'border-b border-gray-100 pb-4 last:border-0'
                }
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={comment.userAvatar || '/default-avatar.jpg'} 
                    alt={comment.userName}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/default-avatar.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <div className={cardStyle ? '' : 'bg-blue-50 rounded-2xl px-3 py-2'}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-gray-800">{comment.userName}</h4>
                        {currentUser?._id === comment.userId && !cardStyle && (
                          <button 
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            disabled={loading.deleting}
                            title="Delete comment"
                          >
                            {loading.deleting ? (
                              <FaSpinner className="animate-spin" size={12} />
                            ) : (
                              <FaEllipsisH size={12} />
                            )}
                          </button>
                        )}
                      </div>
                      {ratingCategories.some(({ field }) => Number(comment[field]) >= 1 && Number(comment[field]) <= 5) && (
                        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Booking review scores">
                          {ratingCategories.filter(({ field }) => Number(comment[field]) >= 1 && Number(comment[field]) <= 5).map(({ field, label }) => (
                            <span key={field} className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:bg-gray-800 dark:text-gray-200">
                              {label.split(' ').slice(0, 1).join('')} {Number(comment[field]).toFixed(1)}/5
                            </span>
                          ))}
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">✓ Completed booking</span>
                        </div>
                      )}
                      <p className={`${cardStyle ? 'mt-2' : 'mt-1'} text-gray-700 text-sm whitespace-pre-line break-words`}>
                        {comment.content}
                      </p>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-4 ml-2">
                      <button 
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center gap-1 text-xs ${comment.likes?.includes(currentUser?._id) ? 'text-blue-500 font-semibold' : 'text-gray-500'} disabled:opacity-50`}
                        disabled={loading.liking}
                      >
                        {comment.likes?.includes(currentUser?._id) ? (
                          <FaHeart size={10} />
                        ) : (
                          <FaRegHeart size={10} />
                        )}
                        Like
                      </button>
                      {!cardStyle && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          disabled={loading.replying}
                        >
                          Reply
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {comment.likes?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {comment.likes.length} like{comment.likes.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {!cardStyle && replyingTo === comment._id && (
                      <div className="mt-3 ml-2">
                        <div className="flex items-start gap-2">
                          <img 
                            src={currentUser?.avatar || '/default-avatar.jpg'} 
                            alt={currentUser?.username}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '/default-avatar.jpg';
                            }}
                          />
                          <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-500 text-sm min-h-[60px]"
                              rows={2}
                              disabled={loading.replying}
                              onFocus={() => setFocusedInput('reply')}
                              onBlur={() => setFocusedInput(null)}
                            />
                            {(focusedInput === 'reply' || replyContent) && (
                              <div className="flex justify-end gap-2 mt-1">
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                                  disabled={loading.replying}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSubmitReply(comment._id)}
                                  className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                  disabled={!replyContent.trim() || loading.replying}
                                >
                                  {loading.replying ? 'Posting...' : 'Reply'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {!cardStyle && replyCount > 0 && (
                      <div className="mt-2 space-y-3">
                        {displayedReplies?.map((reply) => (
                          <div key={reply._id || reply.createdAt} className="flex items-start gap-2">
                            <img 
                              src={reply.userAvatar || '/default-avatar.jpg'} 
                              alt={reply.userName}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/default-avatar.jpg';
                              }}
                            />
                            <div className="flex-1">
                              <div className="bg-blue-50 rounded-2xl px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-xs text-gray-800">{reply.userName}</span>
                                  {currentUser?._id === reply.userId && (
                                    <button 
                                      onClick={() => handleDeleteComment(reply._id)}
                                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                      disabled={loading.deleting}
                                      title="Delete reply"
                                    >
                                      {loading.deleting ? (
                                        <FaSpinner className="animate-spin" size={10} />
                                      ) : (
                                        <FaEllipsisH size={10} />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-700 whitespace-pre-line break-words">
                                  {reply.content}
                                </p>
                              </div>
                              <div className="mt-1 flex items-center gap-4 ml-2">
                                <button 
                                  onClick={() => handleLikeComment(reply._id)}
                                  className={`flex items-center gap-1 text-xs ${reply.likes?.includes(currentUser?._id) ? 'text-blue-500 font-semibold' : 'text-gray-500'} disabled:opacity-50`}
                                  disabled={loading.liking}
                                >
                                  {reply.likes?.includes(currentUser?._id) ? (
                                    <FaHeart size={10} />
                                  ) : (
                                    <FaRegHeart size={10} />
                                  )}
                                  Like
                                </button>
                                <span className="text-xs text-gray-400">
                                  {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                {reply.likes?.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {reply.likes.length} like{reply.likes.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {showLimitedReplies && (
                          <button
                            onClick={() => toggleRepliesExpansion(comment._id)}
                            className="flex items-center text-xs text-blue-500 hover:text-blue-700 font-medium ml-10"
                          >
                            <FaChevronDown size={10} className="mr-1" />
                            View {replyCount - 2} more repl{replyCount - 2 === 1 ? 'y' : 'ies'}
                          </button>
                        )}

                        {replyCount > 2 && expandedReplies[comment._id] && (
                          <button
                            onClick={() => toggleRepliesExpansion(comment._id)}
                            className="flex items-center text-xs text-blue-500 hover:text-blue-700 font-medium ml-10"
                          >
                            <FaChevronUp size={10} className="mr-1" />
                            Show fewer replies
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HelperComments;
