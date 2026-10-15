import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';
import { 
  getShops, 
  createShop, 
  addMealToShop, 
  getOrders, 
  createOrder, 
  updateOrderStatus, 
  createTableBooking,
  updateShop,
  updateMealInShop,
  deleteMealFromShop,
  rateShop
} from '../controllers/lunch.controller.js';

const router = express.Router();

router.get('/shops', getShops);
router.post('/shops', verifyToken, requireOfferingType('food'), createShop);
router.put('/shops/:id', verifyToken, requireOfferingType('food'), updateShop);
router.post('/shops/:id/rate', verifyToken, rateShop);
router.post('/shops/:id/meals', verifyToken, requireOfferingType('food'), addMealToShop);
router.put('/shops/:id/meals/:mealId', verifyToken, requireOfferingType('food'), updateMealInShop);
router.delete('/shops/:id/meals/:mealId', verifyToken, requireOfferingType('food'), deleteMealFromShop);

router.get('/orders', verifyToken, getOrders);
router.post('/orders', verifyToken, createOrder);
router.patch('/orders/:id/status', verifyToken, requireOfferingType('food'), updateOrderStatus);

router.post('/bookings', verifyToken, createTableBooking);

export default router;
