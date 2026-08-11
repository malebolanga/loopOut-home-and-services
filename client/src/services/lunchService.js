const request = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Lunch service is currently unavailable.');
  return data;
};

const poll = (load, callback, delay) => {
  let active = true;
  const refresh = async () => {
    try { const data = await load(); if (active) callback(data); }
    catch (error) { if (active) callback([], error); }
  };
  refresh();
  const interval = window.setInterval(refresh, delay);
  return () => { active = false; window.clearInterval(interval); };
};

export const subscribeToShops = (callback) => poll(() => request('/api/lunch/shops'), callback, 30_000);
export const subscribeToOrders = (callback) => poll(() => request('/api/lunch/orders'), callback, 15_000);
export const createShop = (shop) => request('/api/lunch/shops', { method: 'POST', body: JSON.stringify(shop) });
export const updateShop = (id, shop) => request(`/api/lunch/shops/${id}`, { method: 'PUT', body: JSON.stringify(shop) });
export const addMealToShop = (id, meal) => request(`/api/lunch/shops/${id}/meals`, { method: 'POST', body: JSON.stringify(meal) });
export const updateMealInShop = (shopId, mealId, meal) => request(`/api/lunch/shops/${shopId}/meals/${mealId}`, { method: 'PUT', body: JSON.stringify(meal) });
export const deleteMealFromShop = (shopId, mealId) => request(`/api/lunch/shops/${shopId}/meals/${mealId}`, { method: 'DELETE' });
export const createLunchOrder = (order) => request('/api/lunch/orders', { method: 'POST', body: JSON.stringify(order) });
export const updateOrderStatus = (id, status) => request(`/api/lunch/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const createTableBooking = (booking) => request('/api/lunch/bookings', { method: 'POST', body: JSON.stringify(booking) });
export const rateShop = (shopId, rating) => request(`/api/lunch/shops/${shopId}/rate`, { method: 'POST', body: JSON.stringify(rating) });
