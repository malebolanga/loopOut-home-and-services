import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Comments from './Comments';
import { FaChevronDown, FaChevronUp, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

const CommentsSidePanel = ({ listingId, onClose }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination state
  const [visibleComments, setVisibleComments] = useState(5);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper function to get token from currentUser
  const getToken = () => {
    if (!currentUser) return null;

    // Try different possible token locations
    return currentUser.token ||
      currentUser.access_token ||
      currentUser.accessToken ||
      currentUser.jwt ||
      (currentUser.data && currentUser.data.token) ||
      null;
  };

  // Trigger slide-in animation on mount
  useEffect(() => {
    setIsVisible(true);
    // Prevent body scrolling when panel is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    document.body.style.overflow = 'unset';
    setTimeout(() => {
      onClose();
    }, 300);
  };

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
      setLoading(true);

      const token = getToken();

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          content: commentContent,
          listingId,
          userName: currentUser.username || currentUser.name || currentUser.displayName || 'User',
          userAvatar: currentUser.avatar || currentUser.picture || '/default-avatar.jpg',
          rating: rating > 0 ? rating : undefined
        })
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
      // Reset visible comments count to show new comment
      setVisibleComments(5);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
      console.error('Post comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleComments(prev => prev + 5);
      setLoadingMore(false);
    }, 500);
  };

  const handleTotalComments = (total) => {
    setTotalComments(total);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: isClosing ? 'none' : 'auto'
        }}
        onClick={handleClose}
      />

      {/* Side panel - slides in from right */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          pointerEvents: isClosing ? 'none' : 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">All Reviews</h2>
              {totalComments > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing {visibleComments > totalComments ? totalComments : visibleComments} of {totalComments} reviews
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close panel"
            >
              <FaTimes className="text-gray-500 text-xl" />
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Toggle button for summary */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showSummary ? 'Hide Summary' : 'Show Summary'}
              {showSummary ? (
                <FaChevronUp className="ml-1 text-xs" />
              ) : (
                <FaChevronDown className="ml-1 text-xs" />
              )}
            </button>
          </div>

          {/* Comments with card styling - show limited comments with load more */}
          <div className="pb-6">
            <Comments
              listingId={listingId}
              showSummary={showSummary}
              cardStyle={true}
              maxComments={visibleComments} // Show limited number of comments
              externalRefreshTrigger={refreshTrigger}
              onTotalComments={handleTotalComments}
            />

            {/* Load More Button */}
            {totalComments > visibleComments && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Reviews
                      <FaChevronDown className="text-sm" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Show all loaded message */}
            {totalComments > 0 && visibleComments >= totalComments && visibleComments > 5 && (
              <div className="mt-6 text-center">
                <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  ✓ You've seen all {totalComments} reviews
                </div>
              </div>
            )}

            {/* Initial message when all comments are shown from the start */}
            {totalComments > 0 && totalComments <= 5 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                All {totalComments} reviews shown
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentsSidePanel;