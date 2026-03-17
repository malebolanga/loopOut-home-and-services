import express from 'express';
import {
    deleteUser,
    test,
    updateUser,
    getUserListings,
    getUserServices,
    getUserHelpers,
    getUserEvents,
    getUserPostCount,
    getPostCountByBody,
    getUser,
    getUsers,
    rateHost,
    getHostRatings,
    verifyWhatsApp
} from '../controllers/user.controller.js';

import { verifyToken } from '../utils/verifyUser.js';



const router = express.Router();

// Test route
router.get('/test', test);

// Route to update user (using PUT for RESTful convention)
router.put('/update/:id', verifyToken, updateUser);

// Route to delete user
router.delete('/delete/:id', verifyToken, deleteUser);

// Route to get all listings for a user
router.get('/listings/:id', verifyToken, getUserListings);

router.get('/services/:id', verifyToken, getUserServices);


router.get('/helpers/:id', verifyToken, getUserHelpers);



// Add these new routes
router.get('/events/:id', verifyToken, getUserEvents);

// Route to get post count by user ID param (Profile page)
router.get('/post-count/:id', verifyToken, getUserPostCount);


// Route to get post count via POST body (CreateListing page)
router.post('/post-count', verifyToken, getPostCountByBody);


// Add these new routes
router.put('/rate-host/:hostId', verifyToken, rateHost);
router.get('/host-ratings/:hostId', verifyToken, getHostRatings);
router.post('/verify-whatsapp/:id', verifyToken, verifyWhatsApp);

// Route to get user details
router.get('/:id', verifyToken, getUser);

// Add this route after the test route
router.get('/', verifyToken, getUsers); // Add this line





export default router;