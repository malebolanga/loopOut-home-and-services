import listing from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Favorites from './../../client/src/pages/favorites';
import User from './../models/user.model';


// favoritesController.js
const toggleFavorite = async (req, res) => {
    const { userId } = req.body;
    const { listingId } = req.params;
  
    try {
      const user = await user.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
      const isFavorite = user.favorites.includes(listingId);
      if (isFavorite) {
        user.favorites = user.favorites.filter((id) => id.toString() !== listingId);
      } else {
        user.favorites.push(listingId);
      }
      await user.save();
  
      res.json({ success: true, isFavorite: !isFavorite });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  const getFavorites = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await user.findById(userId).populate('favorites');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
      res.json({ success: true, favorites: user.favorites });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  