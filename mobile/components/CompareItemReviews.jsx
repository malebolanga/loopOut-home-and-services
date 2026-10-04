import React, { useState, useEffect } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ChatBubbleLeftEllipsisIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function CompareItemReviews({ item }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDatabaseComments = async () => {
      if (!item?._id) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let endpoint = `/api/comment/${item._id}?limit=10`;
        if (
          item.itemType === 'helper' ||
          item.type === 'helper' ||
          item.typeLabel?.includes('Barber') ||
          item.typeLabel?.includes('Chef') ||
          item.typeLabel?.includes('Cleaner') ||
          item.typeLabel?.includes('Specialist') ||
          item.typeLabel?.includes('Tutor') ||
          item.typeLabel?.includes('Artist')
        ) {
          endpoint = `/api/helper-comments/${item._id}?limit=10`;
        } else if (item.itemType === 'service' || item.type === 'service') {
          endpoint = `/api/service-comments/${item._id}?limit=10`;
        }

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const fetchedList = data.comments || (Array.isArray(data) ? data : []);
          if (Array.isArray(fetchedList) && isMounted) {
            setReviews(fetchedList);
          }
        }
      } catch (err) {
        console.warn('Error fetching database reviews for this item:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDatabaseComments();

    return () => {
      isMounted = false;
    };
  }, [item]);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 text-rose-500" />
          Database Reviews ({reviews.length})
        </span>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
            <StarIconSolid className="w-3 h-3 text-amber-400" />
            <span>{item?.rating ? Number(item.rating).toFixed(1) : '5.0'}</span>
          </div>
        )}
      </div>

      {/* Reviews List from Database */}
      {loading ? (
        <div className="py-2 text-[10px] text-gray-400 italic">Fetching database reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-2 px-3 bg-gray-50 rounded-xl text-[10.5px] text-gray-400 italic border border-gray-100">
          No database reviews written yet for this item.
        </div>
      ) : (
        <div className="space-y-2">
          {displayedReviews.map((rev) => {
            const name = rev.userName || rev.user?.username || rev.name || 'Verified User';
            const avatar = rev.userAvatar || rev.user?.avatar || '/default-avatar.jpg';
            const commentText = rev.content || rev.comment || rev.text || '';

            return (
              <div
                key={rev._id || rev.id}
                className="bg-gray-50/90 rounded-2xl p-2.5 border border-gray-100/80 space-y-1 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-white shadow-xs"
                      onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150';
                      }}
                    />
                    <span className="text-[11px] font-bold text-gray-800 truncate">{name}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    <StarIconSolid className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold text-gray-700">{rev.rating || 5}</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed italic line-clamp-3">
                  "{commentText}"
                </p>

                <div className="flex items-center justify-between pt-0.5 text-[8.5px]">
                  <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                    <CheckBadgeIcon className="w-3 h-3 text-emerald-500" />
                    Database Review
                  </span>
                  <span className="text-gray-400">{rev.createdAt ? String(rev.createdAt).split('T')[0] : 'Recent'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show all / hide toggle */}
      {reviews.length > 2 && (
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 tracking-wide transition-colors flex items-center gap-1 mt-1"
        >
          {showAllReviews ? '▲ Hide extra reviews' : `▼ View all ${reviews.length} database reviews`}
        </button>
      )}
    </div>
  );
}
