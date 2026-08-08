import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

const DISMISSED_BANNERS_KEY = 'loopout_dismissed_food_collection_banners';

const readDismissedBanners = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DISMISSED_BANNERS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const FoodCollectionReadyBanner = ({ navigate }) => {
  const { currentUser } = useSelector((state) => state.user || {});
  const [orders, setOrders] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(readDismissedBanners);

  const customerId = currentUser?._id;

  const loadActiveOrders = useCallback(async () => {
    if (!customerId) {
      setOrders([]);
      return;
    }

    try {
      const [customerResponse, ownerResponse] = await Promise.all([
        fetch(`/api/lunch/orders?customerId=${encodeURIComponent(customerId)}`),
        fetch(`/api/lunch/orders?ownerId=${encodeURIComponent(customerId)}`)
      ]);
      const customerOrders = customerResponse.ok ? await customerResponse.json() : [];
      const incomingOrders = ownerResponse.ok ? await ownerResponse.json() : [];
      const activeStatuses = ['Pending', 'Preparing', 'Ready for Collection'];
      const combined = [
        ...(Array.isArray(customerOrders) ? customerOrders.map((order) => ({ ...order, audience: 'customer' })) : []),
        ...(Array.isArray(incomingOrders) ? incomingOrders.map((order) => ({ ...order, audience: 'owner' })) : [])
      ];
      const uniqueOrders = Array.from(new Map(combined.map((order) => [`${order.id || order._id}:${order.audience}`, order])).values());
      setOrders(uniqueOrders.filter((order) => activeStatuses.includes(order.status)));
    } catch {
      // The regular lunch page retains its local fallback; the home banner stays hidden until orders are available.
    }
  }, [customerId]);

  useEffect(() => {
    loadActiveOrders();
    if (!customerId) return undefined;

    const interval = window.setInterval(loadActiveOrders, 5000);
    return () => window.clearInterval(interval);
  }, [customerId, loadActiveOrders]);

  const activeOrder = useMemo(() => {
    const statusPriority = { 'Ready for Collection': 0, Preparing: 1, Pending: 2 };
    return [...orders]
      .sort((first, second) => statusPriority[first.status] - statusPriority[second.status])
      .find((order) => !dismissedIds.includes(`${order.id || order._id}:${order.audience}:${order.status}`));
  }, [orders, dismissedIds]);

  const dismissBanner = () => {
    if (!activeOrder) return;
    const notificationId = `${activeOrder.id || activeOrder._id}:${activeOrder.audience}:${activeOrder.status}`;
    const updatedDismissedIds = [...new Set([...dismissedIds, notificationId])];
    setDismissedIds(updatedDismissedIds);
    localStorage.setItem(DISMISSED_BANNERS_KEY, JSON.stringify(updatedDismissedIds));
  };

  if (!currentUser || !activeOrder) return null;

  const orderLabel = activeOrder.orderCode ? `Order #${activeOrder.orderCode}` : 'Your food order';
  const bannerContent = activeOrder.audience === 'owner' ? {
    title: 'New food order received',
    message: `${orderLabel} from ${activeOrder.customerName || 'a customer'} is waiting for your confirmation.`,
    iconClass: 'bg-violet-600',
    borderClass: 'border-violet-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-white',
    textClass: 'text-violet-950',
    detailClass: 'text-violet-800',
    buttonClass: 'bg-violet-600 hover:bg-violet-700',
    dismissClass: 'text-violet-800 hover:bg-violet-100 hover:text-violet-950'
  } : {
    Pending: {
      title: 'Your food order has been received',
      message: `${orderLabel} has been sent to ${activeOrder.shopName || 'the restaurant'}. We’ll let you know when it’s ready.`,
      iconClass: 'bg-sky-600',
      borderClass: 'border-sky-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-white',
      textClass: 'text-sky-950',
      detailClass: 'text-sky-800',
      buttonClass: 'bg-sky-600 hover:bg-sky-700',
      dismissClass: 'text-sky-800 hover:bg-sky-100 hover:text-sky-950'
    },
    Preparing: {
      title: 'Your food is being prepared',
      message: `${orderLabel} from ${activeOrder.shopName || 'the restaurant'} is being prepared now.`,
      iconClass: 'bg-amber-600',
      borderClass: 'border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white',
      textClass: 'text-amber-950',
      detailClass: 'text-amber-800',
      buttonClass: 'bg-amber-600 hover:bg-amber-700',
      dismissClass: 'text-amber-800 hover:bg-amber-100 hover:text-amber-950'
    },
    'Ready for Collection': {
      title: 'Your food is ready for collection',
      message: `${orderLabel} from ${activeOrder.shopName || 'the restaurant'} is ready to collect.`,
      iconClass: 'bg-emerald-600',
      borderClass: 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-lime-50 to-amber-50',
      textClass: 'text-emerald-950',
      detailClass: 'text-emerald-800',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
      dismissClass: 'text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950'
    }
  }[activeOrder.status];

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={`mb-5 overflow-hidden rounded-2xl border shadow-sm ${bannerContent.borderClass}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 p-4 sm:px-5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm ${bannerContent.iconClass}`}>
            <ShoppingBagIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-black ${bannerContent.textClass}`}>{bannerContent.title}</p>
            <p className={`mt-0.5 truncate text-xs font-medium ${bannerContent.detailClass}`}>{bannerContent.message}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate?.('/lunch')}
            className={`hidden shrink-0 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-colors sm:block ${bannerContent.buttonClass}`}
          >
            View order
          </button>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Delete food collection notification"
            title="Delete notification"
            className={`shrink-0 rounded-lg p-2 transition-colors ${bannerContent.dismissClass}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

export default FoodCollectionReadyBanner;
