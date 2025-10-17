import HostRating from '../models/HostRating.js';

export const calculateHostRatingStats = async(hostId, listingId = null, userId = null) => {
    try {
        // Build query
        const query = { hostId };
        if (listingId) {
            query.listingId = listingId;
        }

        // Get all ratings for this host
        const ratings = await HostRating.find(query);

        if (ratings.length === 0) {
            return {
                average: 0,
                totalRatings: 0,
                categoryRatings: {
                    host_cleanliness: 0,
                    host_communication: 0,
                    staff: 0,
                    location_rating: 0
                },
                userRating: null
            };
        }

        // Calculate category averages
        const categorySums = {
            host_cleanliness: 0,
            host_communication: 0,
            staff: 0,
            location_rating: 0
        };

        const categoryCounts = {
            host_cleanliness: 0,
            host_communication: 0,
            staff: 0,
            location_rating: 0
        };

        ratings.forEach(rating => {
            Object.entries(rating.ratings).forEach(([category, value]) => {
                if (value > 0) {
                    categorySums[category] += value;
                    categoryCounts[category]++;
                }
            });
        });

        const categoryRatings = {};
        Object.keys(categorySums).forEach(category => {
            categoryRatings[category] = categoryCounts[category] > 0 ?
                categorySums[category] / categoryCounts[category] :
                0;
        });

        // Calculate overall average
        const totalAverage = ratings.reduce((sum, rating) => sum + rating.averageRating, 0) / ratings.length;

        // Get user's rating if userId provided
        let userRating = null;
        if (userId && listingId) {
            const userRatingDoc = await HostRating.findOne({
                hostId,
                userId,
                listingId
            });
            if (userRatingDoc) {
                userRating = userRatingDoc.ratings;
            }
        }

        return {
            average: parseFloat(totalAverage.toFixed(1)),
            totalRatings: ratings.length,
            categoryRatings: Object.fromEntries(
                Object.entries(categoryRatings).map(([key, value]) => [key, parseFloat(value.toFixed(1))])
            ),
            userRating
        };

    } catch (error) {
        console.error('Calculate host rating stats error:', error);
        throw error;
    }
};