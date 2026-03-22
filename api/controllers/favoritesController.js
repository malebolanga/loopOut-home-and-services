import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const toggleFavorite = async (req, res, next) => {
  const { itemId, itemType } = req.body;
  const userId = req.user.id;

  if (!itemId || !itemType) {
    return next(errorHandler(400, 'Item ID and Type are required'));
  }

  try {
    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    let favoriteArray;
    switch (itemType) {
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

    // Handle string/ObjectId backward compatibility vs Object compatibility
    const existingIndex = user[favoriteArray].findIndex(fav => {
      // old format fav is an ObjectId
      if (fav instanceof mongoose.Types.ObjectId || typeof fav === 'string') {
        return fav.toString() === itemId;
      }
      // new format fav is { item: ObjectId, addedAt: Date }
      if (fav.itemId) {
        return fav.itemId.toString() === itemId;
      }
      return false;
    });

    const isFavorite = existingIndex !== -1;

    if (isFavorite) {
      user[favoriteArray].splice(existingIndex, 1);
    } else {
      user[favoriteArray].push({ itemId, addedAt: new Date() });
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from wishlist' : 'Added to wishlist'
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId)
      .populate('favorites.itemId')
      .populate('favoriteServices.itemId')
      .populate('favoriteHelpers.itemId')
      .populate('favoriteEvents.itemId');
      
    if (!user) return next(errorHandler(404, 'User not found'));

    // Map backwards compatibility for old items without addedAt and unpopulated items
    const mapItems = (arr, type) => {
      return arr.map(fav => {
        // Fallbacks for old format or new format
        const idObj = fav.itemId || fav; 
        const addedTs = fav.addedAt || new Date(0); // If old, fallback to epoch
        if (!idObj || typeof idObj === 'string' || idObj instanceof mongoose.Types.ObjectId) return null; // Unpopulated or invalid

        return {
          ...idObj._doc,
          type: type,
          addedAt: new Date(addedTs).getTime() // Send ms timestamp to frontend
        };
      }).filter(item => item !== null); // Remove nulls
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