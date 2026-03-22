import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toggleWishlistBackend } from '../services/wishlist.service';

/**
 * A reusable hook to manage wishlist (favorites) state for various item types.
 * @param {Object} item - The actual item object (Listing, Service, Helper, Event)
 * @param {string} type - 'listing', 'service', 'helper', or 'event'
 */
export const useWishlist = (item, type) => {
  const { currentUser } = useSelector((state) => state.user);
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine the correct storage key based on type
  const storageKey = {
    listing: 'wishlist',
    service: 'serviceWishlist',
    helper: 'helperWishlist',
    event: 'eventWishlist'
  }[type] || 'wishlist';

  useEffect(() => {
    if (item?._id) {
      try {
        const wishlist = JSON.parse(localStorage.getItem(storageKey)) || [];
        // Support old format (Object without _id but has it raw, or itemId obj)
        const found = wishlist.some(wItem => (wItem?._id || wItem?.itemId) === item._id);
        setIsFavorite(found);
      } catch (error) {
        console.error(`Error reading ${storageKey} from localStorage:`, error);
      }
    }
    
    // Listen for storage events to sync state across multiple tabs or cards
    const handleStorageChange = () => {
      if (item?._id) {
        try {
          const wishlist = JSON.parse(localStorage.getItem(storageKey)) || [];
          setIsFavorite(wishlist.some(wItem => (wItem?._id || wItem?.itemId) === item._id));
        } catch (error) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [item?._id, storageKey]);

  const toggleFavorite = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (!item?._id) return;

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus); // Optimistic UI update

    try {
      // 1. Update localStorage
      const wishlist = JSON.parse(localStorage.getItem(storageKey)) || [];
      const updatedWishlist = newFavoriteStatus
        ? [...wishlist, { ...item, type, addedAt: Date.now() }] 
        : wishlist.filter(wItem => (wItem?._id || wItem?.itemId) !== item._id); // Remove item
      
      localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage'));

      // 2. Update backend if logged in
      if (currentUser) {
        await toggleWishlistBackend(item._id, type);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Revert optimistic update on error
      setIsFavorite(!newFavoriteStatus);
    }
  };

  return { isFavorite, toggleFavorite };
};
