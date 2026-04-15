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
    verifyWhatsApp,
    getPublicUser,
    rateHost,
    getHostRatings,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getMutualFriends
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

// Follower routes
router.put('/follow/:id', verifyToken, followUser);
router.put('/unfollow/:id', verifyToken, unfollowUser);
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);

// Route to get public user details (no token required)
router.get('/public/:id', getPublicUser);

// Route to get user details
router.get('/:id', verifyToken, getUser);
router.get('/mutual/:id', verifyToken, getMutualFriends);

// Add this route after the test route
router.get('/', verifyToken, getUsers); // Add this line





export default router;