import express from 'express';
import { 
  createService, 
  deleteService, 
  updateService, 
  getService, 
  getServices,
  getSimilarServices
} from '../controllers/service.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createService);
router.delete('/delete/:id', verifyToken, deleteService);
router.put('/update/:id', verifyToken, updateService);
router.get('/get/:id', getService);
router.get('/get', getServices);
router.get('/similar/:id', getSimilarServices);

export default router;
