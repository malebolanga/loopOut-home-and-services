import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  arrayUnion, 
  getDocs,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";

export const DEFAULT_SHOPS = [
  {
    id: 'urban-grill',
    name: 'Urban Grill',
    cuisine: 'Greedy & Flame',
    distance: '1.2 km',
    time: '20–30 min',
    rating: '4.8',
    image: '🥙',
    address: '124 Main Street, City Centre',
    phone: '+27 82 123 4567',
    meals: [
      { id: 'chicken-wrap', name: 'Chicken wrap', description: 'Grilled chicken, slaw and house sauce', price: 89, tag: 'Popular', image: '🌯' },
      { id: 'beef-bowl', name: 'Beef rice bowl', description: 'Spiced beef, rice, salsa and greens', price: 109, tag: 'New', image: '🍲' },
      { id: 'bbq-ribs', name: 'Flame BBQ Ribs', description: '400g pork ribs with crispy chips', price: 145, tag: 'Chef Special', image: '🍖' },
    ],
  },
  {
    id: 'green-table',
    name: 'The Green Table',
    cuisine: 'Health & Veggie',
    distance: '2.1 km',
    time: '25–35 min',
    rating: '4.7',
    image: '🥗',
    address: '45 Eco Park Avenue, Gardens',
    phone: '+27 83 987 6543',
    meals: [
      { id: 'rainbow-bowl', name: 'Rainbow bowl', description: 'Roasted vegetables, quinoa and avocado', price: 95, tag: 'Vegetarian', image: '🥗' },
      { id: 'caesar-salad', name: 'Chicken Caesar salad', description: 'Cos lettuce, parmesan and herb croutons', price: 105, tag: 'Fresh', image: '🥗' },
      { id: 'green-smoothie', name: 'Detox Green Smoothie', description: 'Spinach, green apple, ginger and coconut water', price: 49, tag: 'Drinks', image: '🥤' },
    ],
  },
  {
    id: 'mama-kitchen',
    name: "Mama's Kitchen",
    cuisine: 'Local Favorite',
    distance: '3.4 km',
    time: '30–40 min',
    rating: '4.9',
    image: '🍛',
    address: '89 Heritage Lane, Township Hub',
    phone: '+27 71 456 7890',
    meals: [
      { id: 'chicken-pap', name: 'Chicken & pap', description: 'Grilled chicken, chakalaka and creamy pap', price: 99, tag: 'Local favourite', image: '🍗' },
      { id: 'beef-stew', name: 'Beef stew plate', description: 'Slow-cooked beef with rice and steamed veg', price: 115, tag: 'Hearty', image: '🥘' },
      { id: 'mogodu-combo', name: 'Mogodu Special', description: 'Traditional tripe served with warm dumpling', price: 110, tag: 'Traditional', image: '🍲' },
    ],
  },
  {
    id: 'greedy-burger',
    name: 'Greedy Burger Co.',
    cuisine: 'Greedy',
    distance: '0.8 km',
    time: '15–25 min',
    rating: '4.9',
    image: '🍔',
    address: '12 Gourmet Avenue, Food Row',
    phone: '+27 82 555 1234',
    meals: [
      { id: 'double-cheese', name: 'Monster Cheese Burger', description: 'Double beef patty, molten cheddar & bacon jam', price: 120, tag: '🔥 Hot Seller', image: '🍔' },
      { id: 'loaded-fries', name: 'Greedy Loaded Fries', description: 'Crispy fries topped with melted cheese & jalapenos', price: 65, tag: 'Popular', image: '🍟' },
    ],
  },
  {
    id: 'kasi-local',
    name: 'Kasi Corner Takeaway',
    cuisine: 'Local',
    distance: '1.5 km',
    time: '15–20 min',
    rating: '4.6',
    image: '🥪',
    address: '54 Community Road, Block B',
    phone: '+27 76 888 9900',
    meals: [
      { id: 'full-kota', name: 'Special Quarter Kota', description: 'Russian, polony, cheese, chips & secret sauce', price: 55, tag: '👑 Local Classic', image: '🍞' },
      { id: 'vetkoek-mince', name: 'Traditional Vetkoek & Mince', description: 'Golden fried dough filled with savory beef mince', price: 40, tag: 'Local favourite', image: '🥟' },
    ],
  },
];

// Local state persistence helpers
const getLocalShops = () => {
  try {
    const raw = localStorage.getItem('loopout_lunch_shops');
    return raw ? JSON.parse(raw) : DEFAULT_SHOPS;
  } catch {
    return DEFAULT_SHOPS;
  }
};

const saveLocalShops = (shops) => {
  try {
    localStorage.setItem('loopout_lunch_shops', JSON.stringify(shops));
  } catch (err) {
    console.error("Local storage save error:", err);
  }
};

const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem('loopout_lunch_orders');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalOrders = (orders) => {
  try {
    localStorage.setItem('loopout_lunch_orders', JSON.stringify(orders));
  } catch (err) {
    console.error("Local storage orders save error:", err);
  }
};

const shopListeners = new Set();
const orderListeners = new Set();

const notifyShopListeners = (shops) => shopListeners.forEach((cb) => cb(shops));
const notifyOrderListeners = (orders) => orderListeners.forEach((cb) => cb(orders));

export const generateVerificationCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LNCH-${num}`;
};

// Fetch shops from Express REST backend /api/lunch/shops or fallback
export const fetchShopsFromApi = async () => {
  try {
    const res = await fetch('/api/lunch/shops');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalShops(data);
        return data;
      }
    }
  } catch (err) {
    // Silent fallback
  }
  return getLocalShops();
};

export const subscribeToShops = (callback) => {
  let active = true;

  const refresh = async () => {
    try {
      const shops = await fetchShopsFromApi();
      if (active) callback(shops);
    } catch {
      if (active) callback(getLocalShops());
    }
  };

  refresh();
  const interval = setInterval(refresh, 8000);
  shopListeners.add(callback);

  return () => {
    active = false;
    clearInterval(interval);
    shopListeners.delete(callback);
  };
};

export const createShop = async (shopData) => {
  const shopNameTrimmed = (shopData.name || '').trim();
  if (!shopNameTrimmed) {
    throw new Error('Shop name is required.');
  }

  // Pre-check local storage for duplicate shop name (case-insensitive)
  const currentShops = getLocalShops();
  const isDuplicate = currentShops.some(
    (s) => (s.name || '').trim().toLowerCase() === shopNameTrimmed.toLowerCase()
  );

  if (isDuplicate) {
    throw new Error(`A shop named "${shopNameTrimmed}" already exists. Please use a unique shop name.`);
  }

  const newShopPayload = {
    name: shopNameTrimmed,
    cuisine: shopData.cuisine || 'General',
    distance: shopData.distance || '1.0 km',
    time: shopData.time || '20-30 min',
    rating: '5.0',
    image: shopData.image || '🏪',
    address: shopData.address || 'Local Street',
    phone: shopData.phone || '',
    ownerId: shopData.ownerId || 'guest',
    ownerName: shopData.ownerName || 'Store Manager',
    isOpen: shopData.isOpen !== false,
    whatsapp: shopData.whatsapp || '',
    operatingHours: shopData.operatingHours,
    meals: shopData.meals || []
  };

  let shopId = `shop-${Date.now()}`;

  try {
    const res = await fetch('/api/lunch/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShopPayload)
    });

    if (res.status === 409 || !res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.message) {
        throw new Error(errData.message);
      }
    }

    if (res.ok) {
      const data = await res.json();
      shopId = data.id || data._id || shopId;
    }
  } catch (err) {
    if (err.message && err.message.includes('already exists')) {
      throw err;
    }
    console.warn("API createShop fallback to local state:", err?.message || err);
  }

  const updated = [{ ...newShopPayload, id: shopId }, ...currentShops];
  saveLocalShops(updated);
  notifyShopListeners(updated);
  return shopId;
};

export const addMealToShop = async (shopId, meal) => {
  const newMeal = {
    id: meal.id || `meal-${Date.now()}`,
    name: meal.name,
    description: meal.description || '',
    price: Number(meal.price) || 0,
    tag: meal.tag || 'Popular',
    image: meal.image || '🍱'
  };

  try {
    await fetch(`/api/lunch/shops/${shopId}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeal)
    });
  } catch (err) {
    console.warn("API addMealToShop fallback:", err?.message || err);
  }

  const shops = getLocalShops();
  const updated = shops.map((s) => {
    if (s.id === shopId || s._id === shopId) {
      return { ...s, meals: [...(s.meals || []), newMeal] };
    }
    return s;
  });
  saveLocalShops(updated);
  notifyShopListeners(updated);
  return newMeal;
};

export const fetchOrdersFromApi = async () => {
  try {
    const res = await fetch('/api/lunch/orders');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveLocalOrders(data);
        return data;
      }
    }
  } catch (err) {
    // Silent fallback
  }
  return getLocalOrders();
};

export const subscribeToOrders = (callback) => {
  let active = true;

  const refresh = async () => {
    try {
      const orders = await fetchOrdersFromApi();
      if (active) callback(orders);
    } catch {
      if (active) callback(getLocalOrders());
    }
  };

  refresh();
  const interval = setInterval(refresh, 5000);
  orderListeners.add(callback);

  return () => {
    active = false;
    clearInterval(interval);
    orderListeners.delete(callback);
  };
};

export const createLunchOrder = async (orderData) => {
  const code = generateVerificationCode();
  const orderPayload = {
    orderCode: code,
    customerId: orderData.customerId || 'guest',
    customerName: orderData.customerName || 'Valued Customer',
    customerPhone: orderData.customerPhone || '',
    shopId: orderData.shopId,
    shopName: orderData.shopName,
    shopImage: orderData.shopImage || '🍱',
    items: orderData.items,
    total: orderData.total,
    fulfilment: orderData.fulfilment,
    deliveryAddress: orderData.deliveryAddress || '',
    deliveryNotes: orderData.deliveryNotes || '',
    paymentMethod: orderData.paymentMethod,
    paymentStatus: orderData.paymentMethod === 'online' ? 'Paid Online' : 'Pay at Counter / Cash',
    status: 'Pending'
  };

  let createdOrder = { id: `order-${Date.now()}`, ...orderPayload, createdAt: new Date().toISOString() };

  try {
    const res = await fetch('/api/lunch/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    if (res.ok) {
      const data = await res.json();
      createdOrder = { ...data, id: data.id || data._id };
    }
  } catch (err) {
    console.warn("API createLunchOrder fallback to local state:", err?.message || err);
  }

  const orders = getLocalOrders();
  const updated = [createdOrder, ...orders];
  saveLocalOrders(updated);
  notifyOrderListeners(updated);
  return createdOrder;
};

export const addLocalNotification = (userId, title, message, data = {}) => {
  try {
    const raw = localStorage.getItem('loopout_local_notifications');
    const list = raw ? JSON.parse(raw) : [];
    const newNotif = {
      _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'guest',
      type: 'booking',
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    localStorage.setItem('loopout_local_notifications', JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.error("Local notification save error:", err);
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await fetch(`/api/lunch/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (err) {
    console.warn("API updateOrderStatus fallback:", err?.message || err);
  }

  const orders = getLocalOrders();
  let updatedOrder = null;
  const updated = orders.map((ord) => {
    if (ord.id === orderId || ord._id === orderId) {
      updatedOrder = { ...ord, status: newStatus, updatedAt: new Date().toISOString() };
      return updatedOrder;
    }
    return ord;
  });
  saveLocalOrders(updated);
  notifyOrderListeners(updated);

  if (updatedOrder && updatedOrder.customerId) {
    const isReady = newStatus === 'Ready for Collection';
    const isCompleted = newStatus === 'Completed';
    const title = isReady ? '🍱 Food Ready to Collect!' : isCompleted ? '✅ Food Order Completed' : `Order Status: ${newStatus}`;
    const message = isReady
      ? `Your food order #${updatedOrder.orderCode || ''} from "${updatedOrder.shopName || 'the restaurant'}" is ready to collect!`
      : `Your order #${updatedOrder.orderCode || ''} from "${updatedOrder.shopName || 'the restaurant'}" is now ${newStatus}.`;

    addLocalNotification(updatedOrder.customerId, title, message, {
      orderId: updatedOrder.id || updatedOrder._id,
      orderCode: updatedOrder.orderCode,
      shopName: updatedOrder.shopName,
      status: newStatus
    });
  }
};


export const createTableBooking = async (bookingData) => {
  const payload = {
    customerId: bookingData.customerId || 'guest',
    customerName: bookingData.name || 'Guest',
    customerPhone: bookingData.phone || '',
    shopId: bookingData.shopId,
    shopName: bookingData.shopName,
    date: bookingData.date,
    time: bookingData.time,
    guests: bookingData.guests,
    status: 'Confirmed'
  };

  try {
    const res = await fetch('/api/lunch/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return { ...data, id: data.id || data._id };
    }
  } catch (err) {
    console.warn("API createTableBooking fallback:", err?.message || err);
  }

  return { id: `booking-${Date.now()}`, ...payload };
};

export const updateShop = async (shopId, updatedData) => {
  try {
    const res = await fetch(`/api/lunch/shops/${shopId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      const data = await res.json();
      // Sync local storage
      const shops = getLocalShops();
      const updated = shops.map((s) => (s.id === shopId || s._id === shopId ? { ...s, ...data } : s));
      saveLocalShops(updated);
      notifyShopListeners(updated);
      return data;
    }
  } catch (err) {
    console.warn("API updateShop fallback:", err?.message || err);
  }

  const shops = getLocalShops();
  const updated = shops.map((s) => (s.id === shopId || s._id === shopId ? { ...s, ...updatedData } : s));
  saveLocalShops(updated);
  notifyShopListeners(updated);
  return { id: shopId, ...updatedData };
};

export const updateMealInShop = async (shopId, mealId, updatedMeal) => {
  try {
    const res = await fetch(`/api/lunch/shops/${shopId}/meals/${mealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMeal)
    });
    if (res.ok) {
      const data = await res.json();
      // Sync local storage
      const shops = getLocalShops();
      const updated = shops.map((s) => {
        if (s.id === shopId || s._id === shopId) {
          const updatedMeals = s.meals.map((m) => (m.id === mealId ? { ...m, ...data } : m));
          return { ...s, meals: updatedMeals };
        }
        return s;
      });
      saveLocalShops(updated);
      notifyShopListeners(updated);
      return data;
    }
  } catch (err) {
    console.warn("API updateMealInShop fallback:", err?.message || err);
  }

  const shops = getLocalShops();
  const updated = shops.map((s) => {
    if (s.id === shopId || s._id === shopId) {
      const updatedMeals = s.meals.map((m) => (m.id === mealId ? { ...m, ...updatedMeal } : m));
      return { ...s, meals: updatedMeals };
    }
    return s;
  });
  saveLocalShops(updated);
  notifyShopListeners(updated);
  return { id: mealId, ...updatedMeal };
};

export const deleteMealFromShop = async (shopId, mealId) => {
  try {
    const res = await fetch(`/api/lunch/shops/${shopId}/meals/${mealId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const shops = getLocalShops();
      const updated = shops.map((s) => {
        if (s.id === shopId || s._id === shopId) {
          return { ...s, meals: s.meals.filter(m => m.id !== mealId) };
        }
        return s;
      });
      saveLocalShops(updated);
      notifyShopListeners(updated);
      return { success: true };
    }
  } catch (err) {
    console.warn("API deleteMealFromShop fallback:", err?.message || err);
  }

  const shops = getLocalShops();
  const updated = shops.map((s) => {
    if (s.id === shopId || s._id === shopId) {
      return { ...s, meals: s.meals.filter(m => m.id !== mealId) };
    }
    return s;
  });
  saveLocalShops(updated);
  notifyShopListeners(updated);
  return { success: true };
};

export const rateShop = async (shopId, ratingData) => {
  const { orderId, shopRating = 5, foodRating = 5, comment = '', userName = 'Valued Customer' } = ratingData;
  const newReview = {
    id: `rev-${Date.now()}`,
    userName,
    shopRating: Number(shopRating),
    foodRating: Number(foodRating),
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`/api/lunch/shops/${shopId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ratingData)
    });
    if (res.ok) {
      const data = await res.json();
      // Update local storage
      const shops = getLocalShops();
      const updatedShops = shops.map((s) => {
        if (s.id === shopId || s._id === shopId) {
          const reviews = [...(s.reviews || []), newReview];
          const count = (s.ratingsCount || 1) + 1;
          const newScore = (((parseFloat(s.rating || 5) * (count - 1)) + Number(shopRating)) / count).toFixed(1);
          return { ...s, rating: newScore.toString(), ratingsCount: count, reviews };
        }
        return s;
      });
      saveLocalShops(updatedShops);
      notifyShopListeners(updatedShops);

      if (orderId) {
        const orders = getLocalOrders();
        const updatedOrders = orders.map((o) => (o.id === orderId || o._id === orderId ? { ...o, isRated: true, ratingDetails: newReview } : o));
        saveLocalOrders(updatedOrders);
        notifyOrderListeners(updatedOrders);
      }

      return data;
    }
  } catch (err) {
    console.warn("API rateShop fallback:", err?.message || err);
  }

  // Local storage fallback
  const shops = getLocalShops();
  const updatedShops = shops.map((s) => {
    if (s.id === shopId || s._id === shopId) {
      const reviews = [...(s.reviews || []), newReview];
      const count = (s.ratingsCount || 1) + 1;
      const newScore = (((parseFloat(s.rating || 5) * (count - 1)) + Number(shopRating)) / count).toFixed(1);
      return { ...s, rating: newScore.toString(), ratingsCount: count, reviews };
    }
    return s;
  });
  saveLocalShops(updatedShops);
  notifyShopListeners(updatedShops);

  if (orderId) {
    const orders = getLocalOrders();
    const updatedOrders = orders.map((o) => (o.id === orderId || o._id === orderId ? { ...o, isRated: true, ratingDetails: newReview } : o));
    saveLocalOrders(updatedOrders);
    notifyOrderListeners(updatedOrders);
  }

  return { success: true, review: newReview };
};
