/**
 * Wishlist service to synchronize with the backend database
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Synchronize database items into localStorage cache for fast offline / synchronous reads
 * and trigger storage events for instant UI reactivity across components and tabs.
 */
export const syncWishlistLocalCache = (items = []) => {
  try {
    const categories = {
      listing: [],
      service: [],
      helper: [],
      event: []
    };

    items.forEach(item => {
      let type = (item.type || item.itemType || 'listing').toLowerCase();
      if (['property', 'properties', 'listings', 'listing'].includes(type)) type = 'listing';
      if (['services', 'service'].includes(type)) type = 'service';
      if (['helpers', 'helper'].includes(type)) type = 'helper';
      if (['events', 'event'].includes(type)) type = 'event';

      if (categories[type]) {
        categories[type].push({ ...item, type });
      } else {
        categories.listing.push({ ...item, type: 'listing' });
      }
    });

    localStorage.setItem('wishlist', JSON.stringify(categories.listing));
    localStorage.setItem('serviceWishlist', JSON.stringify(categories.service));
    localStorage.setItem('helperWishlist', JSON.stringify(categories.helper));
    localStorage.setItem('eventWishlist', JSON.stringify(categories.event));

    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error syncing wishlist local cache:', err);
  }
};

export const toggleWishlistBackend = async (itemId, itemType) => {
  try {
    const response = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ itemId, itemType }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return { success: false, message: error.message };
  }
};

export const getWishlistBackend = async () => {
  try {
    const response = await fetch('/api/wishlist/get', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data)) {
      syncWishlistLocalCache(data);
    }
    return data;
  } catch (error) {
    console.error('Error fetching wishlist from backend:', error);
    return null;
  }
};

export const clearWishlistLocalCache = (category = 'all') => {
  try {
    if (!category || category === 'all') {
      localStorage.removeItem('wishlist');
      localStorage.removeItem('serviceWishlist');
      localStorage.removeItem('helperWishlist');
      localStorage.removeItem('eventWishlist');
    } else {
      let key = 'wishlist';
      if (category === 'service') key = 'serviceWishlist';
      if (category === 'helper') key = 'helperWishlist';
      if (category === 'event') key = 'eventWishlist';
      localStorage.removeItem(key);
    }
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error clearing wishlist local cache:', err);
  }
};

export const clearWishlistBackend = async (category = 'all') => {
  try {
    const response = await fetch('/api/wishlist/clear', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ category }),
    });
    const data = await response.json();
    if (response.ok && data.success !== false) clearWishlistLocalCache(category);
    return data;
  } catch (error) {
    console.error('Error clearing wishlist backend:', error);
    return { success: false, message: error.message };
  }
};

export const voteWishlistItem = async (itemId, itemType, voteType) => {
  try {
    const response = await fetch('/api/wishlist/vote', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ itemId, itemType, voteType }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error voting on item:', error);
    return { success: false, message: error.message };
  }
};

