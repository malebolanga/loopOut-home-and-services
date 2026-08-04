import express from 'express';
import { toggleFavorite, getWishlist, clearWishlist } from '../controllers/favoritesController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/toggle', verifyToken, toggleFavorite);
router.get('/get', verifyToken, getWishlist);
router.post('/clear', verifyToken, clearWishlist);
router.delete('/clear', verifyToken, clearWishlist);

export default router;

