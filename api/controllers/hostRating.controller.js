import HostRating from '../models/HostRating.js';
import { calculateHostRatingStats } from '../utils/ratingCalculations.js';

// Rate a host
export const rateHost = async(req, res) => {
    try {
        const { hostId, category, rating, listingId } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!hostId || !category || !rating || !listingId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: hostId, category, rating, listingId'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const validCategories = ['host_cleanliness', 'host_communication', 'staff', 'location_rating'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid rating category'
            });
        }

        // Find existing rating or create new one
        let hostRating = await HostRating.findOne({
            hostId,
            userId,
            listingId
        });

        if (hostRating) {
            // Update existing rating
            hostRating.ratings[category] = rating;
            await hostRating.save();
        } else {
            // Create new rating
            hostRating = new HostRating({
                hostId,
                userId,
                listingId,
                ratings: {
                    [category]: rating
                }
            });
            await hostRating.save();
        }

        // Get updated rating statistics
        const ratingStats = await calculateHostRatingStats(hostId, listingId);

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            data: ratingStats
        });

    } catch (error) {
        console.error('Rate host error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get host ratings
export const getHostRatings = async(req, res) => {
    try {
        const { hostId } = req.params;
        const { listingId } = req.query;
        const userId = req.user ?

            if (!hostId) {
                return res.status(400).json({
                    success: false,
                    message: 'Host ID is required'
                });
            }

        const ratingStats = await calculateHostRatingStats(hostId, listingId, userId);

        res.status(200).json({
            success: true,
            data: ratingStats
        });

    } catch (error) {
        console.error('Get host ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's rating for a host
export const getUserHostRating = async(req, res) => {
    try {
        const { hostId } = req.params;
        const { listingId } = req.query;
        const userId = req.user.id;

        const userRating = await HostRating.findOne({
            hostId,
            userId,
            listingId
        });

        res.status(200).json({
            success: true,
            data: userRating || null
        });

    } catch (error) {
        console.error('Get user host rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};