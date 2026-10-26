import express from 'express';
import {
  createHelper,
  deleteHelper,
  getHelper,
  getHelpers,
  updateHelper,
  getSimilarHelpers,
  rateHelperPerformer,
} from '../controllers/helper.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';

const router = express.Router();

router.post('/create', verifyToken, requireOfferingType('services'), createHelper);
router.get('/get/:id', getHelper);
router.get('/get', getHelpers);
router.post('/update/:id', verifyToken, updateHelper);
router.put('/update/:id', verifyToken, updateHelper);
router.delete('/delete/:id', verifyToken, deleteHelper);
router.get('/similar/:id', getSimilarHelpers);
router.post('/:id/performer/rate', verifyToken, rateHelperPerformer);

export default router;
