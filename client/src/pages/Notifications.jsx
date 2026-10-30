import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiClock, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCollectionReadyBanner from '../components/home/FoodCollectionReadyBanner';
import { getBarberBookingDetails, isBarberBooking as isBarberBookingRecord } from '../utils/barberBookingDetails';
import { getCarWashBookingDetails, isCarWashBooking as isCarWashBookingRecord } from '../utils/carWashBookingDetails';
import BookingRequestDetails from '../components/BookingRequestDetails';
import RatingModal from '../components/RatingModal';
import { parseBookingMessageDetails } from '../utils/bookingMessageDetails';

const parsePriceFromText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/(?:ZAR|R)\s?([0-9]{1,3}(?:[,\s][0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
    if (match) {
        const rawNum = match[1].replace(/[\s,]/g, '');
        const val = parseFloat(rawNum);
        if (!isNaN(val) && val > 0) {
            return val;
        }
    }
    return null;
};

const extractAddressFromBookingMessage = (message) => {
    if (typeof message !== 'string' || !message.trim()) return '';
    const normalized = message.replace(/%0A/gi, '\n').replace(/\\n/g, '\n');

    // 1. Try explicit "Address:" line (with optional emoji, markdown asterisks, or underscores)
    const match = normalized.match(/(?:🏠|📍)?\s*(?:\*|_)?Address:?(?:\*|_)?\s*([^\r\n]+)/i);
    if (match?.[1]?.trim()) {
        const addr = match[1].trim().replace(/^[*_]+|[*_]+$/g, '');
        if (addr && !addr.toLowerCase().startsWith('not specified') && !addr.toLowerCase().startsWith('undefined')) {
            return addr;
        }
    }

    // 2. Try extracting from Navigate URL query parameter
    // e.g. Navigate: https://www.google.com/maps/search/?api=1&query=5%20tungstate%20street%20Madiba%20Park%20Polokwane%200600
    const navMatch = normalized.match(/query=([^&\s\r\n]+)/i);
    if (navMatch?.[1]) {
        try {
            const decoded = decodeURIComponent(navMatch[1]).replace(/\+/g, ' ').trim();
            if (decoded) return decoded;
        } catch (_e) {
            // Ignore malformed map URLs and continue with the explicit address if available.
        }
    }

    return '';
};

const isWhatsAppBookingMessage = (message) => {
    if (typeof message !== 'string' || !message.trim()) return false;
    return /https?:\/\/(?:api\.)?whatsapp\.com\/send|https?:\/\/(?:www\.)?wa\.me\//i.test(message) ||
        (/\*[^\n*]*(?:booking|service details|client details)[^\n*]*\*/i.test(message) &&
            /\*ACTION REQUIRED\*/i.test(message));
};

const getNotificationDisplayMessage = (notification) => {
    const message = notification?.message || '';
    const isBookingNotification = notification?.type === 'booking' || Boolean(notification?.data?.bookingId);
    if (!isBookingNotification || !isWhatsAppBookingMessage(message)) return message;

    // WhatsApp booking templates belong in WhatsApp, not in the notification UI.
    return '';
};

const extractLocationOptionFromMessage = (message) => {
    if (typeof message !== 'string' || !message.trim()) return '';
    const normalized = message.replace(/%0A/gi, '\n').replace(/\\n/g, '\n');
    if (/client address|come to me|come to client|home service/i.test(normalized)) {
        return 'comeToYou';
    }
    if (/provider(?:'s)? location|go to them|at the provider/i.test(normalized)) {
        return 'goToThem';
    }
    return '';
};

const extractPriceInfo = (notification, priceMap = {}) => {
    if (!notification) return null;

    let price = null;
    const data = notification.data || {};

    if (data.totalPrice != null && Number(data.totalPrice) > 0) {
        price = Number(data.totalPrice);
    } else if (data.price != null && Number(data.price) > 0) {
        price = Number(data.price);
    } else if (data.offerPrice != null && Number(data.offerPrice) > 0) {
        price = Number(data.offerPrice);
    } else if (data.budget != null && Number(data.budget) > 0) {
        price = Number(data.budget);
    } else if (data.amount != null && Number(data.amount) > 0) {
        price = Number(data.amount);
    } else if (notification.price != null && Number(notification.price) > 0) {
        price = Number(notification.price);
    } else if (notification.totalPrice != null && Number(notification.totalPrice) > 0) {
        price = Number(notification.totalPrice);
    }

    // Check message text first (which captured the user's selected price when the reservation was placed)
    if (price == null) {
        price = parsePriceFromText(notification.message) || parsePriceFromText(notification.title);
    }

    // Fallback to booking price map from database
    if (price == null && data.bookingId && priceMap[data.bookingId.toString()] != null) {
        price = Number(priceMap[data.bookingId.toString()]);
    }

    if (price == null || isNaN(price) || price <= 0) {
        return null;
    }

    const titleLower = (notification.title || '').toLowerCase();
    const msgLower = (notification.message || '').toLowerCase();

    let label = 'Price';
    if (data.offerPrice || titleLower.includes('offer') || msgLower.includes('offer')) {
        label = 'Offer Price';
    } else if (notification.type === 'booking' || data.bookingId || titleLower.includes('booking') || titleLower.includes('appointment')) {
        label = 'Booking Price';
    } else if (titleLower.includes('food') || msgLower.includes('food') || data.orderId) {
        label = 'Order Total';
    }

    return {
        amount: price,
        formatted: `ZAR ${price.toLocaleString()}`,
        label
    };
};

const formatScheduleTime = (value) => {
    if (!value) return 'Not provided';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not provided';
    return date.toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatBarberScheduleTime = (value) => {
    if (!value) return 'Not provided';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not provided';
    return date.toLocaleString('en-ZA', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
};

export default function Notifications() {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [bookingPriceMap, setBookingPriceMap] = useState({});
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [ratingBooking, setRatingBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [foodOrderDetails, setFoodOrderDetails] = useState(null);
    const [foodShopDetails, setFoodShopDetails] = useState(null);
    const [loadingFoodOrder, setLoadingFoodOrder] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = useCallback(() => {
        return localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.access_token || currentUser?.token || '';
    }, [currentUser?._id]);

    useEffect(() => {
        if (!currentUser?._id) return;
        const fetchBookingPrices = async () => {
            try {
                const token = getToken();
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const [userRes, hostRes] = await Promise.allSettled([
                    fetch(`/api/bookings/user/${currentUser._id}`, { credentials: 'include', headers }),
                    fetch(`/api/bookings/host/${currentUser._id}`, { credentials: 'include', headers })
                ]);
                const newMap = {};
                if (userRes.status === 'fulfilled' && userRes.value?.ok) {
                    const uData = await userRes.value.json();
                    if (Array.isArray(uData)) {
                        uData.forEach(b => {
                            if (b._id && (b.totalPrice != null || b.price != null)) {
                                newMap[b._id.toString()] = b.totalPrice ?? b.price;
                            }
                        });
                    }
                }
                if (hostRes.status === 'fulfilled' && hostRes.value?.ok) {
                    const hData = await hostRes.value.json();
                    if (Array.isArray(hData)) {
                        hData.forEach(b => {
                            if (b._id && (b.totalPrice != null || b.price != null)) {
                                newMap[b._id.toString()] = b.totalPrice ?? b.price;
                            }
                        });
                    }
                }
                if (Object.keys(newMap).length > 0) {
                    setBookingPriceMap(prev => ({ ...prev, ...newMap }));
                }
            } catch (_err) {
                // Silently ignore
            }
        };
        fetchBookingPrices();
    }, [currentUser?._id, getToken]);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (selectedNotification?.data?.bookingId) {
                setLoadingBooking(true);
                try {
                    const token = getToken();
                    const res = await fetch(`/api/bookings/${selectedNotification.data.bookingId}`, {
                        credentials: 'include',
                        headers: {
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
    }, [selectedNotification, getToken]);

    useEffect(() => {
        let active = true;
        const fetchFoodOrderDetails = async () => {
            const notification = selectedNotification;
            const orderId = notification?.data?.orderId;
            const orderCode = notification?.data?.orderCode;
            const isFoodNotification = notification?.type === 'food_order' || Boolean(orderId || orderCode);
            setFoodOrderDetails(null);
            setFoodShopDetails(null);
            if (!isFoodNotification || (!orderId && !orderCode)) return;
            setLoadingFoodOrder(true);
            try {
                const token = getToken();
                const [ordersResponse, shopsResponse] = await Promise.all([
                    fetch('/api/lunch/orders', { credentials: 'include', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }),
                    fetch('/api/lunch/shops'),
                ]);
                const orders = ordersResponse.ok ? await ordersResponse.json() : [];
                const shops = shopsResponse.ok ? await shopsResponse.json() : [];
                const order = (Array.isArray(orders) ? orders : []).find((entry) =>
                    String(entry._id || entry.id || '') === String(orderId || '') ||
                    (orderCode && String(entry.orderCode || '') === String(orderCode))
                );
                if (!active) return;
                if (order) {
                    setFoodOrderDetails(order);
                    const shop = (Array.isArray(shops) ? shops : []).find((entry) => String(entry._id || entry.id || '') === String(order.shopId || ''));
                    setFoodShopDetails(shop || null);
                }
            } catch (err) {
                console.error('Failed to fetch food order notification details:', err);
            } finally {
                if (active) setLoadingFoodOrder(false);
            }
        };
        fetchFoodOrderDetails();
        return () => { active = false; };
    }, [selectedNotification, getToken]);

    const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError(null);
            }
            let apiNotifs = [];
            try {
                const token = getToken();
                const res = await fetch('/api/notifications', {
                    credentials: 'include',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    apiNotifs = data.notifications || [];
                } else {
                    throw new Error(`Could not load notifications (${res.status}).`);
                }
            } catch (err) {
                console.warn('[NOTIF CLIENT] API fetch error, using local fallback:', err?.message);
                if (silent) return;
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
            if (!silent) setError(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [currentUser?._id, getToken]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/sign-in');
            return;
        }

        fetchNotifications();

        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications({ silent: true });
            }
        };
        const intervalId = window.setInterval(refreshWhenVisible, 15000);
        document.addEventListener('visibilitychange', refreshWhenVisible);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [currentUser?._id, navigate, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const token = getToken();
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
        } catch (_e) { /* ignore */ }
    };

    const deleteNotification = async (id) => {
        try {
            const token = getToken();
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
        } catch (_e) { /* ignore */ }
    };

    const markAllAsRead = async () => {
        try {
            const token = getToken();
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
        } catch (_e) { /* ignore */ }
    };

    const clearAllNotifications = async () => {
        try {
            const token = getToken();
            await fetch('/api/notifications/clear-all', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            }).catch(() => {});
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }

        setNotifications([]);
        localStorage.removeItem('loopout_local_notifications');
    };

    const getNotificationIcon = (type, data = {}) => {
        switch (type) {
            case 'reference':
                return <span className="text-2xl">🤝</span>;
            case 'booking':
                return <span className="text-2xl">📅</span>;
            case 'payment':
                return <span className="text-2xl">💳</span>;
            case 'message':
                return <span className="text-2xl">💬</span>;
            case 'review':
                return <span className="text-2xl">⭐</span>;
            case 'new_post':
                return <span className="text-2xl">✨</span>;
            case 'comment':
                return <span className="text-2xl">💭</span>;
            case 'food_order':
                return <span className="text-2xl">{data.goodsOrderId ? '🛍️' : '🍱'}</span>;
            default:
                return <span className="text-2xl">🔔</span>;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        setSelectedNotification(notification);
    };

    const handleNotificationAction = (notification) => {
        if (!notification) return;
        if (notification.type === 'reference' || notification.type === 'message' || notification.data?.conversationId) {
            const convId = notification.data?.conversationId;
            navigate(convId ? `/messages/${convId}` : '/messages');
            setSelectedNotification(null);
            return;
        }

        if (notification.data) {
            const { itemType, itemId, orderId, orderCode, goodsOrderId, canReview } = notification.data;
            
            if (goodsOrderId) {
                navigate('/my-loopout');
            } else if (orderId || orderCode || (notification.title && notification.title.includes('Food'))) {
                navigate('/my-orders');
            } else if (notification.type === 'review' || canReview) {
                if (notification.data.bookingId) {
                    navigate('/my-loopout', { state: { reviewBookingId: String(notification.data.bookingId) } });
                } else if (itemType && itemId) {
                    navigate(`/${itemType}/${itemId}`);
                } else {
                    navigate('/dashboard');
                }
            } else if (notification.type === 'booking' && itemType && itemId) {
                navigate(`/${itemType}/${itemId}`);
            } else if (notification.type === 'booking') {
                navigate('/my-bookings');
            } else if (notification.type === 'new_post' || notification.type === 'comment') {
                if (itemType && itemId) {
                    navigate(`/${itemType}/${itemId}`);
                }
            }
        } else if (notification.title && notification.title.includes('Food')) {
            navigate('/lunch');
        } else if (notification.type === 'booking') {
            navigate('/my-bookings');
        }
        setSelectedNotification(null);
    };

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

    const formattedDates = useMemo(() => {
        const map = {};
        notifications.forEach(n => {
            const key = n._id;
            map[key] = formatDate(n.createdAt || new Date());
        });
        return map;
    }, [notifications, formatDate]);

    const getUserIdString = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (val._id) return val._id.toString();
        if (val.id) return val.id.toString();
        return val.toString();
    };

    const myId = getUserIdString(currentUser);
    const hostId = getUserIdString(
        bookingDetails?.listing?.userRef ||
        bookingDetails?.helper?.userRef ||
        bookingDetails?.service?.userRef ||
        bookingDetails?.service?.creator ||
        bookingDetails?.event?.userRef ||
        bookingDetails?.hostUserId
    );
    const clientUserId = getUserIdString(bookingDetails?.user) || getUserIdString(selectedNotification?.data?.userId);

    const notifTitleLower = (selectedNotification?.title || '').toLowerCase();
    const notifMsgLower = (selectedNotification?.message || '').toLowerCase();

    const isClientMatch = Boolean(myId && clientUserId && myId === clientUserId);
    const isHostMatch = Boolean(myId && hostId && myId === hostId);

    // Heuristics to detect whether notification was delivered to requester vs provider
    const looksLikeRequesterNotif = notifTitleLower.includes('request placed') ||
        notifTitleLower.includes('booking approved') ||
        notifTitleLower.includes('booking declined') ||
        notifTitleLower.includes('reminder') ||
        notifMsgLower.includes('your booking request') ||
        notifMsgLower.includes('your appointment');

    const looksLikeProviderNotif = notifTitleLower.includes('new booking') ||
        notifTitleLower.includes('table request') ||
        notifMsgLower.includes('new booking request') ||
        notifMsgLower.includes('waiting for your confirmation');

    // If current user is the one who requested/made the booking
    const isRequester = isClientMatch || (!isHostMatch && looksLikeRequesterNotif);
    // If current user is the one who is providing the service/listing/booking
    const isProvider = (isHostMatch && !isClientMatch) || (!isClientMatch && !isRequester && looksLikeProviderNotif);

    const isPending = bookingDetails?.status === 'pending';
    const isConfirmed = bookingDetails?.status === 'confirmed' || bookingDetails?.status === 'approved';
    const isCompleted = bookingDetails?.status === 'completed';
    const bookingHasEnded = bookingDetails?.endDate && new Date(bookingDetails.endDate).getTime() <= Date.now();
    const isBarberBooking = isBarberBookingRecord(bookingDetails || {});
    const barberBookingDetails = getBarberBookingDetails(bookingDetails || {}, selectedNotification?.message || '');
    const isCarWash = isCarWashBookingRecord(bookingDetails || {}) || isCarWashBookingRecord(selectedNotification || {});
    const carWashDetails = isCarWash ? getCarWashBookingDetails(bookingDetails || {}, selectedNotification?.message || '') : null;
    const requestMessageDetails = parseBookingMessageDetails(bookingDetails?.message);
    const cancelDeadline = bookingDetails?.startDate ? new Date(bookingDetails.startDate).getTime() - (48 * 60 * 60 * 1000) : NaN;
    const canRequesterCancel = Number.isFinite(cancelDeadline) && Date.now() <= cancelDeadline;

    const itemType = bookingDetails?.listing ? 'listing' : bookingDetails?.helper ? 'helper' : bookingDetails?.service ? 'service' : 'event';
    const itemId = bookingDetails?.listing?._id || bookingDetails?.helper?._id || bookingDetails?.service?._id || bookingDetails?.event?._id;
    const canReviewCompletedBooking = Boolean(isCompleted && bookingHasEnded && isRequester && itemId && !bookingDetails?.isReviewed);
    // Show the image the host posted for this service/listing, not a worker or account avatar.
    const bookingProviderImage = bookingDetails?.helper?.imageUrls?.[0] || bookingDetails?.service?.imageUrls?.[0] || bookingDetails?.event?.imageUrls?.[0] || bookingDetails?.listing?.imageUrls?.[0] || '';
    const bookingProviderName = bookingDetails?.helper?.name || bookingDetails?.service?.name || bookingDetails?.service?.title || bookingDetails?.event?.title || bookingDetails?.listing?.userRef?.username || bookingDetails?.selectedPerformer || 'Service provider';
    const messageAddress = extractAddressFromBookingMessage(bookingDetails?.message) || extractAddressFromBookingMessage(selectedNotification?.message);
    const parsedLocOption = bookingDetails?.locationOption || selectedNotification?.data?.locationOption || extractLocationOptionFromMessage(bookingDetails?.message) || extractLocationOptionFromMessage(selectedNotification?.message) || '';
    const customerWorkAddress = bookingDetails?.requestLocation || selectedNotification?.data?.requestLocation || selectedNotification?.data?.clientAddress || messageAddress || '';
    const providerLocation = bookingDetails?.listing?.businessAddress || bookingDetails?.listing?.address || bookingDetails?.helper?.businessAddress || bookingDetails?.helper?.address || bookingDetails?.service?.businessAddress || bookingDetails?.service?.address || bookingDetails?.event?.businessAddress || bookingDetails?.event?.address || '';

    // Match the WhatsApp booking format:
    // When the client requested home service (comeToYou): client's address is used
    // When the client visits the provider (goToThem): provider's location is used
    const resolvedLocationOption = parsedLocOption || (customerWorkAddress ? 'comeToYou' : (providerLocation ? 'goToThem' : ''));
    const isClientWorkLocation = resolvedLocationOption === 'comeToYou' || Boolean(customerWorkAddress);
    const bookingLocation = isClientWorkLocation
        ? (customerWorkAddress || providerLocation)
        : (resolvedLocationOption === 'goToThem' ? (providerLocation || customerWorkAddress) : (customerWorkAddress || providerLocation));
    const bookingTravelLabel = isClientWorkLocation
        ? (isRequester ? 'Provider comes to you' : 'Client requested: Come to his place')
        : (resolvedLocationOption === 'goToThem' ? (isRequester ? 'You go to the provider' : 'Client is coming to you') : '');

    const foodLocation = foodOrderDetails?.fulfilment === 'delivery' ? foodOrderDetails?.deliveryAddress : foodShopDetails?.address;
    const isFoodDetails = selectedNotification?.type === 'food_order' || Boolean(selectedNotification?.data?.orderId || selectedNotification?.data?.orderCode);
    const detailLocation = isFoodDetails ? (foodLocation || '') : bookingLocation;
    const detailMapLink = selectedNotification?.data?.mapLink || (detailLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detailLocation)}` : '');
    const bookingDurationMinutes = bookingDetails?.startDate && bookingDetails?.endDate
        ? Math.max(0, (new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / 60000)
        : 0;
    const bookingDuration = bookingDurationMinutes >= 1440
        ? `${Math.round(bookingDurationMinutes / 1440)} day${Math.round(bookingDurationMinutes / 1440) === 1 ? '' : 's'}`
        : bookingDurationMinutes >= 60
            ? `${Math.round(bookingDurationMinutes / 60)} hour${Math.round(bookingDurationMinutes / 60) === 1 ? '' : 's'}`
            : bookingDurationMinutes > 0 ? `${Math.round(bookingDurationMinutes)} minutes` : '';

    if (loading) {
        return (
            <div className="app-safe-top max-w-4xl mx-auto px-4 py-8 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        aria-label="Go Back"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 h-24">
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
        <div className="app-safe-top max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 app-safe-content-bottom pb-36 min-h-screen">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-rose-500 transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
                        aria-label="Go Back"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-sm py-0.5 px-2.5 rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 dark:text-white mt-1 text-sm sm:text-base">Stay updated with your latest bookings, requests, and reviews.</p>
                    </div>
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

            <FoodCollectionReadyBanner navigate={navigate} />

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
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                        <FiBell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">You're all caught up!</h2>
                    <p className="text-gray-500 dark:text-white max-w-sm mx-auto">
                        When you have new bookings, requests to accept, or reviews, they'll appear here.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Explore Services & Helpers
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.map((notification) => {
                            const priceInfo = extractPriceInfo(notification, bookingPriceMap);
                            return (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`relative flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${notification.read
                                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-white shadow-sm hover:shadow-md'
                                        : 'bg-blue-50/50 border-blue-200 text-gray-900 dark:text-white shadow-md ring-1 ring-blue-100 shadow-blue-50'
                                        }`}
                                >
                                    {!notification.read && (
                                        <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                                    )}

                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type, notification.data)}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-2 sm:pr-8">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`text-sm sm:text-base font-semibold truncate ${notification.read ? 'text-gray-800 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            {notification.type === 'review' && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                                                    Review
                                                </span>
                                            )}
                                            {notification.type === 'reference' && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 rounded-full flex-shrink-0">
                                                    Reference Request
                                                </span>
                                            )}
                                            {notification.type === 'message' && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full flex-shrink-0">
                                                    Direct Message
                                                </span>
                                            )}
                                            {(notification.title?.toLowerCase().includes('new booking request') || notification.title?.toLowerCase().includes('action required')) && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                    Action Required
                                                </span>
                                            )}
                                            {notification.title?.toLowerCase().includes('request placed') && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                                                    Pending Approval
                                                </span>
                                            )}
                                        </div>
                                        {getNotificationDisplayMessage(notification) && (
                                            <p className={`text-xs sm:text-sm mb-2.5 line-clamp-2 sm:line-clamp-none ${notification.read ? 'text-gray-500 dark:text-white' : 'text-gray-700 dark:text-white'}`}>
                                                {getNotificationDisplayMessage(notification)}
                                            </p>
                                        )}

                                        {(() => {
                                            const notifIsBarber = isBarberBookingRecord(notification) || (notification.type === 'booking' && /barber|barbar/i.test(`${notification.title || ''} ${notification.message || ''}`));
                                            if (!notifIsBarber) return null;
                                            const details = getBarberBookingDetails({ message: notification.message, ...(notification.data || {}) }, notification.message);
                                            const hasAnyDetail = Boolean(details.selectedPerformer || details.serviceDuration || details.selectedHaircut || details.foodProvided || details.electricityProvided);
                                            if (!hasAnyDetail) return null;
                                            return (
                                                <div className="mb-3 grid grid-cols-1 gap-1.5 rounded-xl bg-blue-50/70 p-3 text-[11px] text-slate-700 dark:bg-blue-950/20 dark:text-gray-200 sm:grid-cols-2">
                                                    <span>👤 Member: {details.selectedPerformer || 'Any available member'}</span>
                                                    {details.serviceDuration && <span>⏱️ Duration: {details.serviceDuration}</span>}
                                                    {details.selectedHaircut && <span>✂️ Haircut: {details.selectedHaircut}</span>}
                                                    {details.beardGrooming && <span>🧔 Beard grooming: {details.beardGrooming}</span>}
                                                    {details.foodProvided && <span>🍽️ Food: {details.foodProvided === 'yes' ? 'Provided' : 'Not provided'}</span>}
                                                    {details.electricityProvided && <span>⚡ Electricity: {details.electricityProvided === 'yes' ? 'Available' : 'Not available'}</span>}
                                                    {details.specialRequirements && <span className="truncate sm:col-span-2" title={details.specialRequirements}>📝 Special request: {details.specialRequirements}</span>}
                                                </div>
                                            );
                                        })()}

                                        {(() => {
                                            const notifIsCarWash = isCarWashBookingRecord(notification) || (notification.type === 'booking' && /car\s*wash|carwash|auto\s*wash|valet/i.test(`${notification.title || ''} ${notification.message || ''}`));
                                            if (!notifIsCarWash) return null;
                                            const details = getCarWashBookingDetails({ message: notification.message, ...(notification.data || {}) }, notification.message);
                                            const hasAnyDetail = Boolean(details.vehicleType || details.vehicleMake || details.vehicleModel || details.selectedServices || details.waterSource);
                                            if (!hasAnyDetail) return null;
                                            return (
                                                <div className="mb-3 grid grid-cols-1 gap-1.5 rounded-xl bg-cyan-50/70 p-3 text-[11px] text-slate-700 dark:bg-cyan-950/20 dark:text-gray-200 sm:grid-cols-2">
                                                    {details.vehicleType && <span>🚗 Type: {details.vehicleType}</span>}
                                                    {(details.vehicleMake || details.vehicleModel) && <span>🚘 Vehicle: {[details.vehicleMake, details.vehicleModel].filter(Boolean).join(' ')}</span>}
                                                    {details.selectedServices && <span>🧼 Package: {details.selectedServices}</span>}
                                                    {details.waterSource && <span>💧 Water: {details.waterSource}</span>}
                                                    {details.electricityAccess && <span>⚡ Electricity: {details.electricityAccess === 'yes' ? 'Client provides' : 'Not required'}</span>}
                                                    {details.specialRequirements && <span className="truncate sm:col-span-2" title={details.specialRequirements}>📝 Special request: {details.specialRequirements}</span>}
                                                </div>
                                            );
                                        })()}

                                        {/* Display price just below the notification information */}
                                        {priceInfo && (
                                            <div className="mb-3 flex items-center gap-2.5 flex-wrap">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
                                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                        {priceInfo.label}:
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                                                        {priceInfo.formatted}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                                                    Click to view details &rarr;
                                                </span>
                                            </div>
                                        )}

                            {(notification.type === 'reference' || notification.type === 'message' || notification.data?.conversationId) && (
                                            <div className="mb-3 flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNotificationAction(notification);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                                                >
                                                    <span>💬</span>
                                                    <span>{notification.type === 'reference' ? 'Reply to Reference' : 'Open Message'}</span>
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <FiClock className="w-3.5 h-3.5" />
                                                {formattedDates[notification._id]}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {selectedNotification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                        onClick={() => setSelectedNotification(null)}
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[92svh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8 pr-8 sm:pr-0">
                                <div className="p-3 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 scale-100 sm:scale-125 flex-shrink-0">
                                    {getNotificationIcon(selectedNotification.type, selectedNotification.data)}
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{selectedNotification.title}</h2>
                                    <p className="text-gray-500 dark:text-white flex items-center gap-2 mt-1 text-sm sm:text-base">
                                        <FiClock className="w-4 h-4" />
                                        {formattedDates[selectedNotification._id] ?? formatDate(selectedNotification.createdAt || new Date())}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 mb-4 sm:mb-8 flex-1 overflow-y-auto">
                                {getNotificationDisplayMessage(selectedNotification) && (
                                    <p className="text-gray-700 dark:text-white text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                                        {getNotificationDisplayMessage(selectedNotification)}
                                    </p>
                                )}

                                {(selectedNotification.type === 'reference' || selectedNotification.data?.isReference) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/60">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/60">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">🤝</span>
                                                <div>
                                                    <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">
                                                        Reference Request
                                                    </h4>
                                                    <p className="text-xs text-purple-700 dark:text-purple-300">
                                                        {selectedNotification.data?.providerName ? `Regarding ${selectedNotification.data.providerName}` : 'Booking Experience Inquiry'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                                A community member noticed that you booked this service before and is asking for your recommendation. Reply directly in the chat to help your fellow loopOut members!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Price display in modal when bookingDetails is not available/applicable */}
                                {(() => {
                                    const modalPrice = extractPriceInfo(selectedNotification, bookingPriceMap);
                                    if (modalPrice && !bookingDetails && !loadingBooking) {
                                        return (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/60">
                                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                            {modalPrice.label}
                                                        </p>
                                                        <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                                                            {modalPrice.formatted}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {loadingBooking && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                )}

                                {bookingDetails && !loadingBooking && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{isBarberBooking ? '📋 Booking details · helper' : isCarWash ? '📋 Booking details · car wash' : '📋 Booking Request Details'}</h3>
                                        {(isBarberBooking || isCarWash) && <p className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${isPending ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : isConfirmed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'}`}>📌 Status: {bookingDetails.status}</p>}
                                        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white p-3 dark:bg-gray-900">
                                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl dark:bg-gray-800">
                                                <span aria-hidden="true">👤</span>
                                                {bookingProviderImage && <img src={bookingProviderImage} alt={`${bookingProviderName}, service provider`} className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.remove(); }} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{isBarberBooking || isCarWash ? 'Service provider' : 'Service photo'}</p>
                                                <p className="truncate font-semibold text-gray-900 dark:text-white">{bookingProviderName}</p>
                                                {!isBarberBooking && !isCarWash && bookingDetails.selectedPerformer && bookingDetails.helper?.name && bookingDetails.selectedPerformer !== bookingDetails.helper.name && <p className="text-xs text-slate-500 dark:text-gray-400">Provider account: {bookingDetails.helper.name}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {!isBarberBooking && !isCarWash && <div>
                                                <p className="text-sm text-gray-500 dark:text-white">🧰 Service / Listing</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {bookingDetails.listing?.name || bookingDetails.helper?.name || bookingDetails.service?.name || bookingDetails.service?.title || bookingDetails.event?.title || 'Service Request'}
                                                </p>
                                            </div>}
                                            {!isBarberBooking && !isCarWash && <div>
                                                <p className="text-sm text-gray-500 dark:text-white">
                                                    {isRequester ? '👤 Provider / Host' : '👤 Client Name'}
                                                </p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {isRequester
                                                        ? (bookingDetails.listing?.userRef?.username || bookingDetails.helper?.userRef?.username || bookingDetails.service?.userRef?.username || bookingDetails.service?.creator?.username || bookingDetails.helper?.name || bookingDetails.listing?.name || 'Provider / Host')
                                                        : (bookingDetails.user?.username || 'Client')}
                                                </p>
                                            </div>}
                                            {!isBarberBooking && !isCarWash && <div>
                                                <p className="text-sm text-gray-500 dark:text-white">💰 Total Price</p>
                                                <p className="font-medium text-emerald-600 font-bold">
                                                    ZAR {Number(
                                                        selectedNotification?.data?.price ||
                                                        selectedNotification?.data?.totalPrice ||
                                                        parsePriceFromText(selectedNotification?.message) ||
                                                        bookingDetails.totalPrice ||
                                                        0
                                                    ).toLocaleString()}
                                                </p>
                                            </div>}
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-white">📅 Date &amp; time</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {isBarberBooking ? formatBarberScheduleTime(bookingDetails.startDate) : formatScheduleTime(bookingDetails.startDate)} {bookingDetails.endDate && bookingDetails.endDate !== bookingDetails.startDate ? (isBarberBooking ? <><br /><span className="text-xs text-gray-500 dark:text-gray-400">Until {formatBarberScheduleTime(bookingDetails.endDate)}</span></> : `– ${formatScheduleTime(bookingDetails.endDate)}`) : ''}
                                                </p>
                                            </div>
                                            {bookingDetails._id && <div>
                                                <p className="text-sm text-gray-500 dark:text-white">🔖 Booking reference</p>
                                                <p className="break-all font-medium text-gray-900 dark:text-white">{bookingDetails._id}</p>
                                            </div>}
                                            {bookingDetails.listing && <>
                                                {(bookingDetails.listing.propertyType || bookingDetails.listing.type || bookingDetails.subtype) && <div>
                                                    <p className="text-sm text-gray-500 dark:text-white">🏠 Stay type</p>
                                                    <p className="font-medium capitalize text-gray-900 dark:text-white">{bookingDetails.listing.propertyType || bookingDetails.listing.type || bookingDetails.subtype}</p>
                                                </div>}
                                                {bookingDetails.numberOfRooms && <div>
                                                    <p className="text-sm text-gray-500 dark:text-white">🛏️ Rooms booked</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{bookingDetails.numberOfRooms}</p>
                                                </div>}
                                            </>}
                                            {!isBarberBooking && bookingDuration && <div>
                                                <p className="text-sm text-gray-500 dark:text-white">⏱️ Duration</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{bookingDuration}</p>
                                            </div>}
                                            <div className="sm:col-span-2 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 sm:p-5 dark:border-rose-900/50 dark:bg-rose-950/20 shadow-xs">
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 dark:border-rose-900/40 pb-2.5 mb-3">
                                                    <p className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                                                        <span>{isBarberBooking ? '📍 Location' : 'LOCATION & NAVIGATION'}</span>
                                                    </p>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                        isClientWorkLocation
                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                                    }`}>
                                                        {isClientWorkLocation
                                                            ? (isRequester ? '🏠 Provider comes to you' : '🏠 Client requested: Come to his place')
                                                            : (resolvedLocationOption === 'goToThem' ? (isRequester ? '🚶 You go to provider' : '🚶 Client is coming to you') : '📍 Service location')}
                                                    </span>
                                                </div>

                                                {isBarberBooking ? <div className="space-y-2">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{detailLocation || (isClientWorkLocation ? 'Client work address was not saved with this booking' : (resolvedLocationOption === 'goToThem' ? 'At the provider’s location' : 'Location to be confirmed with client'))}</p>
                                                    {isClientWorkLocation && detailLocation && <p className="text-xs text-gray-600 dark:text-gray-300">The provider comes to your address</p>}
                                                    {detailMapLink && <a href={detailMapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline dark:text-rose-300">🗺️ Open in Maps</a>}
                                                </div> : <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                            📍 Type
                                                        </p>
                                                        <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                                                            {isClientWorkLocation
                                                                ? (isRequester ? "Client Address (Provider comes to your address)" : "Client Address (Client requested: Come to his place)")
                                                                : (resolvedLocationOption === 'goToThem' ? "Provider Location (Client is coming to you)" : "Service Location")}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                            🏠 Address
                                                        </p>
                                                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white break-words">
                                                            {detailLocation || (isClientWorkLocation ? 'Client work address was not saved with this booking' : (resolvedLocationOption === 'goToThem' ? 'At the provider’s location' : 'Location to be confirmed with client'))}
                                                        </p>
                                                        {isClientWorkLocation && detailLocation && (
                                                            <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-300">
                                                                This is the address the client entered for the service visit.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {detailMapLink && (
                                                        <div className="pt-1">
                                                            <a
                                                                href={detailMapLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                                                            >
                                                                <span>🗺️</span>
                                                                <span>Navigate in Google Maps</span>
                                                                <span aria-hidden="true">&rarr;</span>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>}
                                            </div>
                                            {(isBarberBooking || isCarWash) && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {bookingDuration && <div className="rounded-xl bg-white p-3 dark:bg-gray-900"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">⏱️ Duration</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{bookingDuration}</p></div>}
                                                {bookingDetails.phone && <div className="rounded-xl bg-white p-3 dark:bg-gray-900"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">📞 Contact</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{bookingDetails.phone}</p></div>}
                                            </div>}
                                            {(isBarberBooking || isCarWash || bookingDetails.subtype || bookingDetails.functionType || bookingDetails.selectedPerformer || bookingDetails.performerExperience || bookingDetails.numberOfGuests || barberBookingDetails.serviceDuration || barberBookingDetails.selectedHaircut || barberBookingDetails.beardGrooming || barberBookingDetails.specialRequirements || barberBookingDetails.foodProvided || barberBookingDetails.electricityProvided || (bookingDetails.message && !requestMessageDetails.length && !isBarberBooking && !isCarWash)) && <div className={`sm:col-span-2 rounded-xl p-3 ${isBarberBooking ? 'bg-blue-50/70 dark:bg-blue-950/20' : isCarWash ? 'bg-cyan-50/70 dark:bg-cyan-950/20' : 'bg-white dark:bg-gray-900'}`}>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{isBarberBooking || isCarWash ? '🧰 What you booked' : '📝 Services and booking details'}</p>
                                                {bookingDetails.subtype && <p className="mt-1 font-semibold text-gray-900 dark:text-white">{bookingDetails.subtype}</p>}
                                                {bookingDetails.functionType && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{bookingDetails.functionType}</p>}
                                                {isBarberBooking && requestMessageDetails.length === 0 && <div className="mt-3 grid gap-2 rounded-xl bg-blue-50/70 p-3 text-xs text-slate-700 dark:bg-blue-950/20 dark:text-gray-200 sm:grid-cols-2">
                                                    <span>👤 Selected member: {barberBookingDetails.selectedPerformer || 'Any available member'}</span>
                                                    {(barberBookingDetails.serviceDuration || bookingDuration) && <span>⏱️ Selected duration: {barberBookingDetails.serviceDuration || bookingDuration}</span>}
                                                    {barberBookingDetails.selectedHaircut && <span>✂️ Haircut style: {barberBookingDetails.selectedHaircut}</span>}
                                                    {barberBookingDetails.beardGrooming && <span>🧔 Beard grooming: {barberBookingDetails.beardGrooming}</span>}
                                                    {barberBookingDetails.foodProvided && <span>🍽️ Food provided: {barberBookingDetails.foodProvided === 'yes' ? 'Yes' : 'No'}</span>}
                                                    {barberBookingDetails.electricityProvided && <span>⚡ Electricity available: {barberBookingDetails.electricityProvided === 'yes' ? 'Yes' : 'No'}</span>}
                                                    {barberBookingDetails.specialRequirements && <p className="whitespace-pre-wrap break-words sm:col-span-2">📝 Special request: {barberBookingDetails.specialRequirements}</p>}
                                                </div>}
                                                {isCarWash && carWashDetails && requestMessageDetails.length === 0 && <div className="mt-3 grid gap-2 rounded-xl bg-cyan-50/70 p-3 text-xs text-slate-700 dark:bg-cyan-950/20 dark:text-gray-200 sm:grid-cols-2">
                                                    {carWashDetails.vehicleType && <span>🚗 Vehicle type: {carWashDetails.vehicleType}</span>}
                                                    {(carWashDetails.vehicleMake || carWashDetails.vehicleModel) && <span>🚘 Vehicle: {[carWashDetails.vehicleMake, carWashDetails.vehicleModel].filter(Boolean).join(' ')}</span>}
                                                    {carWashDetails.selectedServices && <span>🧼 Wash package: {carWashDetails.selectedServices}</span>}
                                                    {carWashDetails.waterSource && <span>💧 Water source: {carWashDetails.waterSource}</span>}
                                                    {carWashDetails.electricityAccess && <span>⚡ Electricity access: {carWashDetails.electricityAccess === 'yes' ? 'Client provides' : 'Not required'}</span>}
                                                    {carWashDetails.specialRequirements && <p className="whitespace-pre-wrap break-words sm:col-span-2">📝 Special request: {carWashDetails.specialRequirements}</p>}
                                                </div>}
                                                {!isBarberBooking && !isCarWash && bookingDetails.selectedPerformer && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">Requested worker: {bookingDetails.selectedPerformer}</p>}
                                                {bookingDetails.performerExperience && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">Experience: {bookingDetails.performerExperience}</p>}
                                                {bookingDetails.numberOfGuests && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">👥 {bookingDetails.numberOfGuests} guest{Number(bookingDetails.numberOfGuests) === 1 ? '' : 's'}</p>}
                                                {bookingDetails.listing && bookingDetails.numberOfRooms && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">🏠 {bookingDetails.accommodationSelection === 'entire' ? `Full ${String(bookingDetails.listing.kind || 'property').toLowerCase()} · ${bookingDetails.numberOfRooms} bedrooms` : `${bookingDetails.numberOfRooms} room${Number(bookingDetails.numberOfRooms) === 1 ? '' : 's'} booked`}</p>}
                                                {!isBarberBooking && !isCarWash && barberBookingDetails.serviceDuration && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">⏱️ Selected duration: {barberBookingDetails.serviceDuration}</p>}
                                                {bookingDetails.message && !requestMessageDetails.length && !isBarberBooking && !isCarWash && !isWhatsAppBookingMessage(bookingDetails.message) && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-200">{String(bookingDetails.message)}</p>}
                                            </div>}
                                            {requestMessageDetails.length > 0 && <div className="sm:col-span-2"><BookingRequestDetails message={bookingDetails.message} /></div>}
                                            {(isBarberBooking || isCarWash) && <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-gray-800">
                                                <span className="text-sm font-semibold text-slate-600 dark:text-gray-300">💰 Booking total</span>
                                                <span className="text-lg font-black text-slate-900 dark:text-white">R{Number(
                                                    selectedNotification?.data?.price ||
                                                    selectedNotification?.data?.totalPrice ||
                                                    parsePriceFromText(selectedNotification?.message) ||
                                                    bookingDetails.totalPrice ||
                                                    0
                                                ).toLocaleString('en-ZA', { maximumFractionDigits: 2 })}</span>
                                            </div>}
                                            {bookingDetails.status && (
                                                <div className="col-span-full pt-2">
                                                    {!isBarberBooking && !isCarWash && <p className="text-sm text-gray-500 dark:text-white mb-2">Status</p>}
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        {!isBarberBooking && !isCarWash && <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider ${
                                                            isConfirmed ? 'bg-green-100 text-green-800 border border-green-200' :
                                                            isPending ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                            isCompleted ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                            bookingDetails.status === 'declined' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                            bookingDetails.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-800'
                                                        }`}>
                                                            {bookingDetails.status}
                                                        </span>}

                                                        {/* 1. PROVIDER ACTIONS: If user is the provider and booking is pending */}
                                                        {isPending && isProvider && !isRequester && (
                                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const token = getToken();
                                                                            const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                                method: 'POST',
                                                                                credentials: 'include',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                },
                                                                                body: JSON.stringify({ status: 'declined', cancelledBy: 'host' })
                                                                            });
                                                                            if (res.ok) {
                                                                                const updatedBooking = await res.json();
                                                                                setBookingDetails(updatedBooking);
                                                                                fetchNotifications();
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Failed to decline booking:', err);
                                                                        }
                                                                    }}
                                                                    className="flex-1 sm:flex-none px-5 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200"
                                                                >
                                                                    ✕ Decline
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const token = getToken();
                                                                            const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                                method: 'POST',
                                                                                credentials: 'include',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                },
                                                                                body: JSON.stringify({ status: 'confirmed' })
                                                                            });
                                                                            if (res.ok) {
                                                                                const updatedBooking = await res.json();
                                                                                setBookingDetails(updatedBooking);
                                                                                fetchNotifications();
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Failed to approve booking:', err);
                                                                        }
                                                                    }}
                                                                    className="flex-1 sm:flex-none px-5 py-2 text-white bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors shadow-sm"
                                                                >
                                                                    ✓ Accept
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* 2. REQUESTER ACTIONS: If user requested the booking, show ONLY "Cancel your booking" */}
                                                        {isRequester && (isPending || isConfirmed) && (
                                                            <button
                                                                disabled={!canRequesterCancel}
                                                                onClick={async () => {
                                                                    if (!canRequesterCancel) return;
                                                                    if (!window.confirm('Are you sure you want to cancel your booking?')) return;
                                                                    try {
                                                                        const token = getToken();
                                                                        const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                            method: 'POST',
                                                                            credentials: 'include',
                                                                            headers: {
                                                                                'Content-Type': 'application/json',
                                                                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                            },
                                                                            body: JSON.stringify({ status: 'cancelled', cancelledBy: 'user' })
                                                                        });
                                                                        if (res.ok) {
                                                                            const updatedBooking = await res.json();
                                                                            setBookingDetails(updatedBooking);
                                                                            fetchNotifications();
                                                                        }
                                                                    } catch (err) {
                                                                        console.error('Failed to cancel booking:', err);
                                                                    }
                                                                }}
                                                                className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-lg transition-colors border border-red-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {canRequesterCancel ? 'Cancel your booking' : 'Cancellation closes 48 hours before start'}
                                                            </button>
                                                        )}

                                                        {/* 3. PROVIDER ACTIONS: Confirmed state */}
                                                        {isConfirmed && isProvider && !isRequester && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const token = getToken();
                                                                            const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                                method: 'POST',
                                                                                credentials: 'include',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                },
                                                                                body: JSON.stringify({ status: 'completed' })
                                                                            });
                                                                            if (res.ok) {
                                                                                const updatedBooking = await res.json();
                                                                                setBookingDetails(updatedBooking);
                                                                                fetchNotifications();
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Failed to complete booking:', err);
                                                                        }
                                                                    }}
                                                                    className="px-4 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold rounded-lg transition-colors border border-purple-200"
                                                                >
                                                                    ✓ Mark as Completed
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                                                                        try {
                                                                            const token = getToken();
                                                                            const res = await fetch(`/api/bookings/update/${bookingDetails._id}`, {
                                                                                method: 'POST',
                                                                                credentials: 'include',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                },
                                                                                body: JSON.stringify({ status: 'cancelled', cancelledBy: 'host' })
                                                                            });
                                                                            if (res.ok) {
                                                                                const updatedBooking = await res.json();
                                                                                setBookingDetails(updatedBooking);
                                                                                fetchNotifications();
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Failed to cancel booking:', err);
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200"
                                                                >
                                                                    Cancel Booking
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* 4. REQUESTER REVIEW: Review button for requester */}
                                                        {canReviewCompletedBooking && (
                                                            <button
                                                                onClick={() => {
                                                                    setRatingBooking({
                                                                        ...bookingDetails,
                                                                        bookingId: bookingDetails._id,
                                                                        type: itemType,
                                                                        itemId,
                                                                        title: bookingDetails.listing?.name || bookingDetails.helper?.name || bookingDetails.service?.name || bookingDetails.service?.title || bookingDetails.event?.title || 'Your booking',
                                                                        proName: bookingProviderName,
                                                                        proAvatar: bookingProviderImage,
                                                                    });
                                                                }}
                                                                className="px-5 py-2 text-white bg-amber-500 hover:bg-amber-600 font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                                            >
                                                                ⭐ Leave a Review
                                                            </button>
                                                        )}
                                                        {isCompleted && isRequester && !bookingHasEnded && <p className="text-xs text-slate-500 dark:text-gray-400">You can review after the scheduled stay or service has ended.</p>}
                                                        {isCompleted && isRequester && bookingDetails.isReviewed && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ You have reviewed this booking.</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {(selectedNotification.type === 'food_order' || selectedNotification.data?.orderId || selectedNotification.data?.orderCode) && (
                                    <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Food order details</p>
                                                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{foodOrderDetails?.shopName || foodShopDetails?.name || 'Your food order'}</h3>
                                                {(foodOrderDetails?.orderCode || selectedNotification.data?.orderCode) && <p className="mt-1 text-xs text-slate-500 dark:text-gray-300">Order #{foodOrderDetails?.orderCode || selectedNotification.data.orderCode}</p>}
                                            </div>
                                            {(foodOrderDetails?.status || selectedNotification.data?.status) && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-gray-900 dark:text-amber-200">{foodOrderDetails?.status || selectedNotification.data.status}</span>}
                                        </div>

                                        {loadingFoodOrder ? <div className="mt-4 animate-pulse space-y-2"><div className="h-4 w-2/3 rounded bg-amber-100 dark:bg-amber-900/50" /><div className="h-4 w-1/2 rounded bg-amber-100 dark:bg-amber-900/50" /></div> : foodOrderDetails ? <>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-xl bg-white p-3 dark:bg-gray-900">
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{foodOrderDetails.fulfilment === 'delivery' ? 'Delivery' : 'Collection'} time</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{foodOrderDetails.scheduledFor ? formatScheduleTime(foodOrderDetails.scheduledFor) : 'As soon as the shop can prepare it'}</p>
                                                    {foodOrderDetails.createdAt && <p className="mt-1 text-[11px] text-slate-500 dark:text-gray-400">Placed {formatScheduleTime(foodOrderDetails.createdAt)}</p>}
                                                </div>
                                                <div className="rounded-xl bg-white p-3 dark:bg-gray-900">
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{foodOrderDetails.fulfilment === 'delivery' ? 'Delivery address' : 'Shop location'}</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{detailLocation || 'Location not available'}</p>
                                                    {foodShopDetails?.phone && <p className="mt-1 text-[11px] text-slate-500 dark:text-gray-400">Shop contact: {foodShopDetails.phone}</p>}
                                                    {detailMapLink && <a href={detailMapLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 underline underline-offset-2 dark:text-rose-300">📍 Open location in map</a>}
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-xl bg-white p-3 dark:bg-gray-900">
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Items in your order</p>
                                                <div className="mt-2 space-y-2">
                                                    {(foodOrderDetails.items || []).map((item, index) => <div key={`${item.id || item.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                                                        <div><span className="font-semibold text-slate-900 dark:text-white">{item.quantity || 1} × {item.name}</span>{item.sides?.length > 0 && <p className="text-xs text-slate-500 dark:text-gray-400">{item.sides.join(', ')}</p>}</div>
                                                        <span className="shrink-0 font-semibold text-slate-700 dark:text-gray-200">R{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                                                    </div>)}
                                                </div>
                                                <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm dark:border-gray-800"><span className="font-bold text-slate-600 dark:text-gray-300">Order total</span><span className="font-black text-slate-900 dark:text-white">R{Number(foodOrderDetails.total || 0).toFixed(2)}</span></div>
                                            </div>

                                            {(foodOrderDetails.orderComments || foodOrderDetails.deliveryNotes) && <div className="mt-3 rounded-xl bg-white p-3 dark:bg-gray-900">
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Order description &amp; instructions</p>
                                                {foodOrderDetails.orderComments && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-gray-200">{foodOrderDetails.orderComments}</p>}
                                                {foodOrderDetails.deliveryNotes && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-gray-300">Delivery: {foodOrderDetails.deliveryNotes}</p>}
                                            </div>}
                                        </> : <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">Order details could not be loaded. Check your orders page for the latest status.</p>}
                                    </section>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        deleteNotification(selectedNotification._id);
                                        setSelectedNotification(null);
                                    }}
                                    className="px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100 sm:border-none"
                                >
                                    <FiTrash2 /> Delete Notification
                                </button>
                                
                                {selectedNotification.data && (
                                    selectedNotification.type === 'new_post' || 
                                    selectedNotification.type === 'comment' || 
                                    selectedNotification.type === 'review' || 
                                    selectedNotification.type === 'booking' ||
                                    selectedNotification.type === 'reference' ||
                                    selectedNotification.type === 'message' ||
                                    selectedNotification.data?.conversationId ||
                                    selectedNotification.data?.goodsOrderId ||
                                    (selectedNotification.type === 'food_order' && (selectedNotification.data?.orderId || selectedNotification.data?.orderCode))
                                ) && (
                                    <button
                                        onClick={() => handleNotificationAction(selectedNotification)}
                                        className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 text-center flex items-center justify-center gap-2"
                                    >
                                        {selectedNotification.type === 'reference' || selectedNotification.data?.isReference
                                            ? '💬 Reply to Reference Request'
                                            : selectedNotification.type === 'message' || selectedNotification.data?.conversationId
                                            ? '💬 Open Message'
                                            : selectedNotification.type === 'review' || selectedNotification.data?.canReview 
                                            ? '⭐ Write Review' 
                                            : selectedNotification.data?.goodsOrderId || selectedNotification.type === 'food_order'
                                            ? '🛍️ Track Order'
                                            : selectedNotification.type === 'booking'
                                            ? 'Open booking page'
                                            : 'View Details'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <RatingModal
                isOpen={Boolean(ratingBooking)}
                booking={ratingBooking}
                onClose={() => setRatingBooking(null)}
                onReviewSubmitted={() => {
                    setBookingDetails((current) => current ? { ...current, isReviewed: true } : current);
                    setRatingBooking(null);
                    fetchNotifications();
                }}
            />
        </div>
    );
}
