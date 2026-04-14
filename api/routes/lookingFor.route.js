import express from 'express';
import { createLookingFor, deleteLookingFor, updateLookingFor, getLookingFor, getLookingFors, likeLookingFor, dislikeLookingFor } from '../controllers/lookingFor.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createLookingFor);
router.delete('/delete/:id', verifyToken, deleteLookingFor);
router.post('/update/:id', verifyToken, updateLookingFor);
router.get('/get/:id', getLookingFor);
router.get('/get', getLookingFors);
router.post('/like/:id', verifyToken, likeLookingFor);
router.post('/dislike/:id', verifyToken, dislikeLookingFor);

export default router;
