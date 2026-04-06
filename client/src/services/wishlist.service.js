/**
 * Wishlist service to synchronize with the backend
 */

export const toggleWishlistBackend = async (itemId, itemType) => {
  try {
    const response = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch('/api/wishlist/get');
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};
export const voteWishlistItem = async (itemId, itemType, voteType) => {
  try {
    const response = await fetch('/api/wishlist/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, itemType, voteType }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error voting on item:', error);
    return { success: false, message: error.message };
  }
};
