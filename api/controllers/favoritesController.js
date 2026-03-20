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

    const isFavorite = user[favoriteArray].includes(itemId);
    if (isFavorite) {
      user[favoriteArray] = user[favoriteArray].filter((id) => id.toString() !== itemId);
    } else {
      user[favoriteArray].push(itemId);
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
      .populate('favorites')
      .populate('favoriteServices')
      .populate('favoriteHelpers')
      .populate('favoriteEvents');
      
    if (!user) return next(errorHandler(404, 'User not found'));

    const wishlist = [
      ...user.favorites.map(item => ({ ...item._doc, type: 'listing' })),
      ...user.favoriteServices.map(item => ({ ...item._doc, type: 'service' })),
      ...user.favoriteHelpers.map(item => ({ ...item._doc, type: 'helper' })),
      ...user.favoriteEvents.map(item => ({ ...item._doc, type: 'event' })),
    ];

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};