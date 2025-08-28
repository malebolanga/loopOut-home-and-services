import express from 'express';
import { toggleFavorite, getFavorites } from '../controllers/listing.controller.js';


// favoritesRoutes.js
const express = require('express');
const { toggleFavorite, getFavorites } = require('../controllers/favoritesController');
const router = express.Router();

router.post('/toggle/:listingId', toggleFavorite);
router.get('/list/:userId', getFavorites);

module.exports = router;