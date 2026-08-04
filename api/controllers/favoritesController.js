import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const toggleFavorite = async (req, res, next) => {
  const { itemId, itemType } = req.body;
  const userId = req.user?.id;

  if (!itemId || !itemType) {
    return next(errorHandler(400, 'Item ID and Type are required'));
  }

  try {
    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    // Normalize itemType string
    let type = (itemType || '').toLowerCase();
    if (['property', 'properties', 'listings', 'listing'].includes(type)) type = 'listing';
    if (['services', 'service'].includes(type)) type = 'service';
    if (['helpers', 'helper'].includes(type)) type = 'helper';
    if (['events', 'event'].includes(type)) type = 'event';

    let favoriteArray;
    switch (type) {
      case 'listing':
        favoriteArray = 'favorites';
        break;
      case 'service':
        favoriteArray = 'favoriteServices';
        break;
      case 'helper':
        favoriteArray = 'favoriteHelpers';
        break;
      case 'event':
        favoriteArray = 'favoriteEvents';
        break;
      default:
        return next(errorHandler(400, 'Invalid item type'));
    }

    if (!user[favoriteArray]) {
      user[favoriteArray] = [];
    }

    // Handle string/ObjectId backward compatibility vs Object compatibility
    const existingIndex = user[favoriteArray].findIndex(fav => {
      if (!fav) return false;
      if (fav instanceof mongoose.Types.ObjectId || typeof fav === 'string') {
        return fav.toString() === itemId.toString();
      }
      if (fav.itemId) {
        return fav.itemId.toString() === itemId.toString();
      }
      return false;
    });

    const isFavorite = existingIndex !== -1;

    if (isFavorite) {
      user[favoriteArray].splice(existingIndex, 1);
    } else {
      user[favoriteArray].push({ itemId: new mongoose.Types.ObjectId(itemId), addedAt: new Date() });
    }
    
    await user.save();

    const totalWishlistCount = 
      (user.favorites?.length || 0) +
      (user.favoriteServices?.length || 0) +
      (user.favoriteHelpers?.length || 0) +
      (user.favoriteEvents?.length || 0);

    res.status(200).json({
      success: true,
      isFavorite: !isFavorite,
      wishlistCount: totalWishlistCount,
      message: isFavorite ? 'Removed from wishlist' : 'Added to wishlist'
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  const userId = req.user?.id;
  try {
    const user = await User.findById(userId)
      .populate('favorites.itemId')
      .populate('favoriteServices.itemId')
      .populate('favoriteHelpers.itemId')
      .populate('favoriteEvents.itemId');
      
    if (!user) return next(errorHandler(404, 'User not found'));

    // Map backwards compatibility for old items without addedAt and unpopulated items
    const mapItems = (arr, type) => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.map(fav => {
        if (!fav) return null;
        const idObj = fav.itemId || fav; 
        const addedTs = fav.addedAt || new Date(0);
        if (!idObj || typeof idObj === 'string' || idObj instanceof mongoose.Types.ObjectId) return null;

        const docData = idObj._doc || idObj;
        return {
          ...docData,
          type: type,
          addedAt: new Date(addedTs).getTime()
        };
      }).filter(item => item !== null);
    };

    const wishlist = [
      ...mapItems(user.favorites, 'listing'),
      ...mapItems(user.favoriteServices, 'service'),
      ...mapItems(user.favoriteHelpers, 'helper'),
      ...mapItems(user.favoriteEvents, 'event'),
    ];

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (req, res, next) => {
  const userId = req.user?.id;
  try {
    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    const { category } = req.body || {};

    if (!category || category === 'all') {
      user.favorites = [];
      user.favoriteServices = [];
      user.favoriteHelpers = [];
      user.favoriteEvents = [];
    } else {
      let type = (category || '').toLowerCase();
      if (['property', 'properties', 'listings', 'listing'].includes(type)) user.favorites = [];
      if (['services', 'service'].includes(type)) user.favoriteServices = [];
      if (['helpers', 'helper'].includes(type)) user.favoriteHelpers = [];
      if (['events', 'event'].includes(type)) user.favoriteEvents = [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlistCount: 
        (user.favorites?.length || 0) +
        (user.favoriteServices?.length || 0) +
        (user.favoriteHelpers?.length || 0) +
        (user.favoriteEvents?.length || 0)
    });
  } catch (error) {
    next(error);
  }
};