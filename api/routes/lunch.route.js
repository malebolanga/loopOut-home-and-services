import express from 'express';
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
router.post('/shops', createShop);
router.put('/shops/:id', updateShop);
router.post('/shops/:id/rate', rateShop);
router.post('/shops/:id/meals', addMealToShop);
router.put('/shops/:id/meals/:mealId', updateMealInShop);
router.delete('/shops/:id/meals/:mealId', deleteMealFromShop);

router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

router.post('/bookings', createTableBooking);

export default router;
