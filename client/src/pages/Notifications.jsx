import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/sign-in');
            return;
        }
        fetchNotifications();
    }, [currentUser, navigate]);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (selectedNotification?.data?.bookingId) {
                setLoadingBooking(true);
                try {
                    const res = await fetch(`/api/bookings/${selectedNotification.data.bookingId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setBookingDetails(data);
                    } else {
                        setBookingDetails(null);
                    }
                } catch (err) {
                    console.error('Failed to fetch booking details:', err);
                    setBookingDetails(null);
                } finally {
                    setLoadingBooking(false);
                }
            } else {
                setBookingDetails(null);
            }
        };

        fetchBookingDetails();
    }, [selectedNotification]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            let apiNotifs = [];
            try {
                const res = await fetch('/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    apiNotifs = data.notifications || [];
                }
            } catch (err) {
                console.warn('[NOTIF CLIENT] API fetch error, using local fallback:', err?.message);
            }

            // Fetch local storage notifications for current user
            let localNotifs = [];
            try {
                const raw = localStorage.getItem('loopout_local_notifications');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        const uid = currentUser?._id || currentUser?.id;
                        localNotifs = parsed.filter(n => n.userId === uid || n.userId === 'guest' || !uid);
                    }
                }
            } catch (err) {
                console.error('[NOTIF CLIENT] Error parsing local notifications:', err);
            }

            // Combine & deduplicate by ID
            const map = new Map();
            [...apiNotifs, ...localNotifs].forEach(item => {
                const key = (item._id || item.id || '').toString();
                if (key) {
                    map.set(key, item);
                }
            });

            const combined = Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );

            setNotifications(combined);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).catch(() => {});
        } catch (err) {
            console.error('Error marking as read:', err);
        }

        setNotifications(prev => prev.map(n => ((n._id === id || n.id === id) ? { ...n, read: true } : n)));
        try {
            const raw = localStorage.getItem('loopout_local_notifications');
            if (raw) {
                const list = JSON.parse(raw);
                const updated = list.map(n => ((n._id === id || n.id === id) ? { ...n, read: true } : n));
                localStorage.setItem('loopout_local_notifications', JSON.stringify(updated));
            }
        } catch (e) {}
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).catch(() => {});
        } catch (err) {
            console.error('Error deleting notification:', err);
        }

        setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
        try {
            const raw = localStorage.getItem('loopout_local_notifications');
            if (raw) {
                const list = JSON.parse(raw);
                const updated = list.filter(n => n._id !== id && n.id !== id);
                localStorage.setItem('loopout_local_notifications', JSON.stringify(updated));
            }
        } catch (e) {}
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).catch(() => {});
        } catch (err) {
            console.error('Error marking all as read:', err);
        }

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            const raw = localStorage.getItem('loopout_local_notifications');
            if (raw) {
                const list = JSON.parse(raw);
                const updated = list.map(n => ({ ...n, read: true }));
                localStorage.setItem('loopout_local_notifications', JSON.stringify(updated));
            }
        } catch (e) {}
    };

    const clearAllNotifications = async () => {
        try {
            await fetch('/api/notifications/clear-all', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).catch(() => {});
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }

        setNotifications([]);
        try {
            localStorage.removeItem('loopout_local_notifications');
        } catch (e) {}
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking': return <span className="text-blue-500 bg-blue-100 p-2 rounded-full">🍱</span>;
            case 'message': return <span className="text-green-500 bg-green-100 p-2 rounded-full">💬</span>;
            case 'comment': return <span className="text-amber-500 bg-amber-100 p-2 rounded-full">📝</span>;
            case 'review': return <span className="text-yellow-500 bg-yellow-100 p-2 rounded-full">⭐</span>;
            case 'system': return <span className="text-purple-500 bg-purple-100 p-2 rounded-full">⚙️</span>;
            case 'new_post': return <span className="text-orange-500 bg-orange-100 p-2 rounded-full">🏠</span>;
            case 'alert': return <span className="text-rose-500 bg-rose-100 p-2 rounded-full">⚠️</span>;
            default: return <span className="text-gray-500 bg-gray-100 p-2 rounded-full"><FiBell /></span>;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id || notification.id);
        }
        setSelectedNotification(notification);
    };

    const handleNotificationAction = (notification) => {
        if (notification.data) {
            const { itemType, itemId, orderId, orderCode } = notification.data;
            
            if (orderId || orderCode || (notification.title && notification.title.includes('Food'))) {
                navigate('/lunch');
            } else if (notification.type === 'new_post' || notification.type === 'comment') {
                if (itemType && itemId) {
                    navigate(`/${itemType}/${itemId}`);
                }
            } else if (notification.type === 'review') {
                navigate(`/user-profile/${currentUser._id || currentUser.id}`);
            }
        } else if (notification.title && notification.title.includes('Food')) {
            navigate('/lunch');
        }
        setSelectedNotification(null);
    };

    // Stable reference — never re-created between renders
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const hours = Math.floor(diffTime / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diffTime / (1000 * 60));
                return `${minutes} min ago`;
            }
            return `${hours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, []);

    // Pre-compute all formatted dates once when notifications data changes
    // avoids calling formatDate on every render for every list item
    const formattedDates = useMemo(() => {
        const map = {};
        notifications.forEach(n => {
            const key = n._id;
            map[key] = formatDate(n.createdAt || new Date());
        });
        return map;
    }, [notifications, formatDate]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 h-24">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/4 mt-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-rose-500 text-white text-sm py-0.5 px-2.5 rounded-full font-medium">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Stay updated with your latest activity and messages.</p>
                </div>

                {notifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex-1 sm:flex-none justify-center items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors flex"
                            >
                                <FiCheck /> Mark all as read
                            </button>
                        )}
                        <button
                            onClick={clearAllNotifications}
                            className="flex-1 sm:flex-none justify-center items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors flex"
                        >
                            <FiTrash2 /> Clear all
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <h3 className="font-semibold">Failed to load notifications</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {notifications.length === 0 && !error ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <FiBell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">You're all caught up!</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        When you have new bookings, messages, or account updates, they'll appear here.
                    </p>
                    <button
                        onClick={() => navigate('/explore')}
                        className="mt-6 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Explore loopOut
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`relative flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${notification.read
                                    ? 'bg-white border-gray-200 text-gray-600 shadow-sm hover:shadow-md'
                                    : 'bg-blue-50/50 border-blue-200 text-gray-900 shadow-md ring-1 ring-blue-100 shadow-blue-50'
                                    }`}
                            >
                                {!notification.read && (
                                    <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                                )}

                                <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0 pr-2 sm:pr-8">
                                    <h3 className={`text-sm sm:text-base font-semibold mb-1 truncate ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                                        {notification.title}
                                    </h3>
                                    <p className={`text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-none ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-3.5 h-3.5" />
                                            {formattedDates[notification._id]}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-start flex-shrink-0">
                                    {!notification.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                            title="Mark as read"
                                        >
                                            <FiCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Full Page Notification Modal */}
            <AnimatePresence>
                {selectedNotification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedNotification(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8 pr-8 sm:pr-0">
                                <div className="p-3 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100 scale-100 sm:scale-125 flex-shrink-0">
                                    {getNotificationIcon(selectedNotification.type)}
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedNotification.title}</h2>
                                    <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm sm:text-base">
                                        <FiClock className="w-4 h-4" />
                                        {formattedDates[selectedNotification._id] ?? formatDate(selectedNotification.createdAt || new Date())}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100 mb-4 sm:mb-8 flex-1 overflow-y-auto">
                                <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                                    {selectedNotification.message}
                                </p>

                                {loadingBooking && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                )}

                                {bookingDetails && !loadingBooking && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Service / Listing</p>
                                                <p className="font-medium text-gray-900">
                                                    {bookingDetails.listing?.name || bookingDetails.helper?.name || bookingDetails.service?.name || bookingDetails.event?.title || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Client Name</p>
                                                <p className="font-medium text-gray-900">{bookingDetails.user?.username || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Total Price</p>
                                                <p className="font-medium text-gray-900">ZAR {bookingDetails.totalPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Dates</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(bookingDetails.startDate).toLocaleDateString()} - {new Date(bookingDetails.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {bookingDetails.phone && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Contact Number</p>
                                                    <p className="font-medium text-gray-900">{bookingDetails.phone}</p>
                                                </div>
                                            )}
                                            {bookingDetails.status && (
                                                <div className="col-span-full">
                                                    <p className="text-sm text-gray-500 mb-2">Status</p>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider ${
                                                            bookingDetails.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                            bookingDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                            bookingDetails.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                                        }`}>
                                                            {bookingDetails.status}
                                                        </span>

                                                        {bookingDetails.status === 'pending' && selectedNotification.title === 'New Booking Request' && (
                                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                                                },
                                                                                body: JSON.stringify({ status: 'cancelled', cancelledBy: 'host' })
                                                                            });
                                                                            if (res.ok) {
                                                                                const updatedBooking = await res.json();
                                                                                setBookingDetails(updatedBooking);
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Failed to decline booking:', err);
                                                                        }
                                                                    }}
                                                                    className="flex-1 sm:flex-none px-5 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200"
                                                                >
                                                                    Decline
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                                                },
                                                                                body: JSON.stringify({ status: 'confirmed' })
                                                                            });
                                                                            if (res.ok) {
                                                                                const updatedBooking = await res.json();
                                                                                setBookingDetails(updatedBooking);
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Failed to approve booking:', err);
                                                                        }
                                                                    }}
                                                                    className="flex-1 sm:flex-none px-5 py-2 text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg transition-colors shadow-sm"
                                                                >
                                                                    Approve
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        deleteNotification(selectedNotification._id);
                                        setSelectedNotification(null);
                                    }}
                                    className="px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100 sm:border-none"
                                >
                                    <FiTrash2 /> Delete Notification
                                </button>
                                
                                {selectedNotification.data && (selectedNotification.type === 'new_post' || selectedNotification.type === 'comment' || selectedNotification.type === 'review' || selectedNotification.type === 'booking') && (
                                    <button
                                        onClick={() => handleNotificationAction(selectedNotification)}
                                        className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 text-center"
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
