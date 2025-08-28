const express = require('express');
const Listing = require('../models/Listing'); // Assuming you have a Listing model
const router = express.Router();

// Route to get listing counts by category for a user
router.get('/user/listings/count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Aggregation to group by type and count
    const counts = await Listing.aggregate([
      { $match: { createdBy: userId } }, // Match listings created by the user
      { 
        $group: { 
          _id: '$type', // Group by the 'type' field (Rental, Sale, Overnight)
          count: { $sum: 1 } // Count the number of listings for each type
        } 
      }
    ]);

    // Format response for better readability
    const formattedCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      counts: {
        rental: formattedCounts.Rental || 0,
        sale: formattedCounts.Sale || 0,
        overnight: formattedCounts.Overnight || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user listings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user listing counts',
    });
  }
});

module.exports = router;

