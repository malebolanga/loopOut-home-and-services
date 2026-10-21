import express from 'express';
import { searchListings } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', searchListings);

export default router;
