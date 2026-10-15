import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings, getSimilarListings, getKinds } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';

const router = express.Router();

router.post('/create', verifyToken, requireOfferingType('property'), createListing);
router.delete('/delete/:id', verifyToken, requireOfferingType('property'), deleteListing);
router.put('/update/:id', verifyToken, requireOfferingType('property'), updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);
router.get('/similar/:id', getSimilarListings);
router.get('/kinds', getKinds);
export default router;
