// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { smartSearch } = require('../controllers/searchController');

router.get('/smart', smartSearch);

module.exports = router;