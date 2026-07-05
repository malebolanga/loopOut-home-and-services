import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEllipsisH, FaHeart, FaRegHeart, FaChevronDown, FaChevronUp, FaStar, FaBroom, FaUserFriends } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

const Comments = ({ serviceId, listingId, maxComments = 3, onTotalComments, showSummary = false, cardStyle = false, horizontalStyle = false, externalRefreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [hasBooked, setHasBooked] = useState(false);
  const [isCheckingBooking, setIsCheckingBooking] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState(0);
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
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    staff: 0,
    overall: 0
  });

  const RATING_CATEGORIES = [
    { name: 'Cleanliness', icon: FaBroom },
    { name: 'Staff', icon: FaUserFriends },
  ];

  // Helper function to get token from localStorage or session
  const getToken = () => {
    // Try to get token from localStorage (common pattern)
    const tokenFromStorage = localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('jwt');

    if (tokenFromStorage) {
      return tokenFromStorage;
    }

    // Try from sessionStorage
    const tokenFromSession = sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('jwt');

    if (tokenFromSession) {
      return tokenFromSession;
    }

    return null;
  };

  const fetchComments = useCallback(async () => {
    setLoading(prev => ({ ...prev, comments: true }));
    setError(null);
    try {
      // If maxComments is 0, fetch all comments without limit
      const url = maxComments > 0
        ? `/api/comment/${listingId}?limit=${maxComments}`
        : `/api/comment/${listingId}`;

      const res = await fetch(url);

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

      // Set ratings from API response
      if (data.ratings) {
        setRatings({
          cleanliness: data.ratings.cleanliness || 0,
          staff: data.ratings.staff || 0,
          overall: data.ratings.overall || 0
        });
      }

      if (onTotalComments) onTotalComments(data.totalComments || 0);

    } catch (err) {
      setError(err.message);
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(prev => ({ ...prev, comments: false }));
    }
  }, [listingId, maxComments, onTotalComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshTrigger, externalRefreshTrigger]);

  const checkBookingStatus = useCallback(async () => {
    if (!currentUser?._id || !listingId) {
      setIsCheckingBooking(false);
      return;
    }
    try {
      const res = await fetch(`/api/bookings/user/${currentUser._id}`);
      if (res.ok) {
        const data = await res.json();
        // Check if user has a booking for this item that is not pending or cancelled
        const booked = data.some(b => 
          (b.listing?._id === listingId || b.service?._id === listingId || b.helper?._id === listingId || b.event?._id === listingId) &&
          ['confirmed', 'approved', 'assigned', 'ongoing', 'completed'].includes(b.status)
        );
        setHasBooked(booked);
      }
    } catch (err) {
      console.error('Error checking booking status:', err);
    } finally {
      setIsCheckingBooking(false);
    }
  }, [currentUser?._id, listingId]);

  useEffect(() => {
    checkBookingStatus();
  }, [checkBookingStatus]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setError(null);

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

      // Get token from storage
      const token = getToken();

      const headers = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          content: commentContent,
          listingId,
          userName: currentUser.username || currentUser.name || currentUser.displayName || 'User',
          userAvatar: currentUser.avatar || currentUser.picture || '/default-avatar.jpg',
          rating: rating > 0 ? rating : undefined
        }),
        credentials: 'include'
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(responseData.message || 'Failed to post comment');
      }

      setCommentContent('');
      setRating(0);
      setRefreshTrigger(prev => prev + 1);
      setError(null);
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

      const token = getToken();

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/comment/like/${commentId}`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include'
      });

      if (!res.ok) {
        let errorMessage = 'Failed to like comment';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
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

      const token = getToken();

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/comment/reply/${commentId}`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent,
          userName: currentUser.username || currentUser.name || currentUser.displayName || 'User',
          userAvatar: currentUser.avatar || currentUser.picture || '/default-avatar.jpg'
        })
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(responseData.message || 'Failed to post reply');
      }

      setReplyingTo(null);
      setReplyContent('');
      setRefreshTrigger(prev => prev + 1);
      setError(null);
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

      const token = getToken();

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/comment/${commentId}`, {
        method: 'DELETE',
        headers: headers,
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

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Cleanliness</span>
                <span className="font-medium">{ratings.cleanliness.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(ratings.cleanliness / 5) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Staff</span>
                <span className="font-medium">{ratings.staff.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(ratings.staff / 5) * 100}%` }}
                />
              </div>
            </div>
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
                    className={`${i < Math.floor(ratings.overall)
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

      {/* Comment form for non-card style */}
      {!cardStyle && currentUser && (
        isCheckingBooking ? (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center animate-pulse">
            <p className="text-gray-400 text-sm">Verifying booking history...</p>
          </div>
        ) : hasBooked ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex items-start gap-3">
              <img
                src={currentUser.avatar || currentUser.picture || '/default-avatar.jpg'}
                alt={currentUser.username || currentUser.name || 'User'}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = '/default-avatar.jpg';
                }}
              />
              <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-500 min-h-[80px]"
                  rows={3}
                  disabled={loading.submitting}
                  onFocus={() => setFocusedInput('comment')}
                  onBlur={() => setFocusedInput(null)}
                />
                {(focusedInput === 'comment' || commentContent || rating > 0) && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 mr-1">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-colors"
                        >
                          <FaStar
                            size={14}
                            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      disabled={!commentContent.trim() || loading.submitting}
                    >
                      {loading.submitting ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FiSend size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-center">
             <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaStar className="text-rose-500 text-xl" />
             </div>
             <h3 className="text-rose-900 font-bold mb-1">Exclusive Review Access</h3>
             <p className="text-gray-600 text-xs px-4 mb-4">Sharing your experience helps the community. Please complete a booking first to unlock reviews for this listing.</p>
             <button 
               onClick={() => navigate(`/listing/${listingId}`)}
               className="px-8 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95"
             >
               Book Now
             </button>
          </div>
        )
      )}
      {!cardStyle && !currentUser && (
        <div className="mb-6 p-3 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Please <a href="/sign-in" className="text-blue-500 hover:underline">sign in</a> to leave a comment</p>
        </div>
      )}

      {/* Comment form for card style */}
      {cardStyle && currentUser && (
        isCheckingBooking ? (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center animate-pulse col-span-full">
            <p className="text-gray-400 text-sm">Verifying booking history...</p>
          </div>
        ) : hasBooked ? (
          <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <form onSubmit={handleSubmitComment}>
              <div className="flex items-start gap-3">
                <img
                  src={currentUser.avatar || currentUser.picture || '/default-avatar.jpg'}
                  alt={currentUser.username || currentUser.name || 'User'}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/default-avatar.jpg';
                  }}
                />
                <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-500 min-h-[80px]"
                    rows={3}
                    disabled={loading.submitting}
                    onFocus={() => setFocusedInput('comment')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {(focusedInput === 'comment' || commentContent || rating > 0) && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 mr-1">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-colors"
                          >
                            <FaStar
                              size={14}
                              className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        disabled={!commentContent.trim() || loading.submitting}
                      >
                        {loading.submitting ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FiSend size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-center col-span-full">
             <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaStar className="text-rose-500 text-xl" />
             </div>
             <h3 className="text-rose-900 font-bold mb-1">Exclusive Review Access</h3>
             <p className="text-gray-600 text-xs px-4 mb-4">Sharing your experience helps the community. Please complete a booking first to unlock reviews for this listing.</p>
             <button 
               onClick={() => navigate(`/listing/${listingId}`)}
               className="px-8 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95"
             >
               Book Now
             </button>
          </div>
        )
      )}
      {cardStyle && !currentUser && (
        <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600 text-sm">Please <a href="/sign-in" className="text-blue-500 hover:underline">sign in</a> to leave a comment</p>
        </div>
      )}

      {/* Card-style ratings summary when in card mode */}
      {cardStyle && showSummary && (
        <div className="mb-5 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold">{ratings.overall.toFixed(1)}</span>
            <div className="ml-3">
              <div className="text-sm text-gray-600">out of 5</div>
              <div className="text-gray-600 text-sm">{totalComments} reviews</div>
            </div>
          </div>

          <div className="space-y-3">
            {RATING_CATEGORIES.map(({ name, icon: Icon }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <Icon className="mr-2 text-blue-500" />
                  <span>{name}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(ratings[name.toLowerCase()] / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{ratings[name.toLowerCase()].toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${horizontalStyle ? 'flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar px-2' : cardStyle ? 'grid grid-cols-1 gap-4' : 'space-y-4'}`}>
        {comments.length === 0 && !loading.comments && totalComments === 0 ? (
          <div className={`text-center py-4 text-gray-500 ${cardStyle || horizontalStyle ? 'w-full' : ''}`}>
            {cardStyle || horizontalStyle ? 'No reviews yet' : 'No comments yet. Be the first to comment!'}
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
                className={horizontalStyle ?
                  'bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex-shrink-0 w-[85%] md:w-[350px] snap-center snap-always h-fit' :
                  cardStyle ?
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
                      {comment.rating && (
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={10}
                              className={`${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'} mr-0.5`}
                            />
                          ))}
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
                            src={currentUser?.avatar || currentUser?.picture || '/default-avatar.jpg'}
                            alt={currentUser?.username || currentUser?.name || 'User'}
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

export default Comments;
