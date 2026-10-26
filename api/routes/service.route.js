import express from 'express';
import { 
  createService, 
  deleteService, 
  updateService, 
  getService, 
  getServices,
  getSimilarServices,
  rateServicePerformer
} from '../controllers/service.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';

const router = express.Router();

router.post('/create', verifyToken, requireOfferingType('services'), createService);
router.delete('/delete/:id', verifyToken, deleteService);
router.put('/update/:id', verifyToken, updateService);
router.post('/update/:id', verifyToken, updateService);
router.post('/:id/performer/rate', verifyToken, rateServicePerformer);
router.get('/get/:id', getService);
router.get('/get', getServices);
router.get('/similar/:id', getSimilarServices);

export default router;
