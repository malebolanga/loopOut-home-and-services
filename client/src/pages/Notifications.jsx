import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/sign-in');
            return;
        }
        fetchNotifications();
    }, [currentUser, navigate]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                setNotifications(notifications.map(n =>
                    n._id === id ? { ...n, read: true } : n
                ));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                setNotifications(notifications.filter(n => n._id !== id));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, read: true })));
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking': return <span className="text-blue-500 bg-blue-100 p-2 rounded-full">📅</span>;
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
            markAsRead(notification._id);
        }

        if (notification.data) {
            const { itemType, itemId, raterId } = notification.data;
            
            if (notification.type === 'new_post' || notification.type === 'comment') {
                if (itemType && itemId) {
                    navigate(`/${itemType}/${itemId}`);
                }
            } else if (notification.type === 'review') {
                // Navigate to the rater's profile or your own profile
                // For now, let's go to your own profile to see the rating
                navigate(`/user-profile/${currentUser._id}`);
            }
        }
    };

    const formatDate = (dateString) => {
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
    };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
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

                {notifications.length > 0 && unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        <FiCheck /> Mark all as read
                    </button>
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
                        Explore LoopOut
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

                                <div className="flex-1 min-w-0 pr-8">
                                    <h3 className={`text-base font-semibold mb-1 truncate ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                                        {notification.title}
                                    </h3>
                                    <p className={`text-sm mb-3 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-3.5 h-3.5" />
                                            {formatDate(notification.createdAt || new Date())}
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
        </div>
    );
}
