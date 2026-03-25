import express from 'express';
import {
  createHelper,
  deleteHelper,
  getHelper,
  getHelpers,
  updateHelper,
  getSimilarHelpers,
} from '../controllers/helper.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createHelper);
router.get('/get/:id', getHelper);
router.get('/get', getHelpers);
router.post('/update/:id', verifyToken, updateHelper);
router.delete('/delete/:id', verifyToken, deleteHelper);
router.get('/similar/:id', getSimilarHelpers);

export default router;