import express from 'express';
import { toggleFavorite, getWishlist } from '../controllers/favoritesController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/toggle', verifyToken, toggleFavorite);
router.get('/get', verifyToken, getWishlist);

export default router;
