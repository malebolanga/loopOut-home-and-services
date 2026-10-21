import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';
import { 
  getShops, 
  getMyShops,
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
router.get('/my-shops', verifyToken, getMyShops);
router.post('/shops', verifyToken, requireOfferingType('food'), createShop);
// Existing shop management is authorized by the shop's stored ownerId inside
// the controller. The offering type is only required when creating a shop.
router.put('/shops/:id', verifyToken, updateShop);
router.post('/shops/:id/rate', verifyToken, rateShop);
router.post('/shops/:id/meals', verifyToken, addMealToShop);
router.put('/shops/:id/meals/:mealId', verifyToken, updateMealInShop);
router.delete('/shops/:id/meals/:mealId', verifyToken, deleteMealFromShop);

router.get('/orders', verifyToken, getOrders);
router.post('/orders', verifyToken, createOrder);
router.patch('/orders/:id/status', verifyToken, updateOrderStatus);

router.post('/bookings', verifyToken, createTableBooking);

export default router;
