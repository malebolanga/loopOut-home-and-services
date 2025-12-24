// server/controllers/explore.controller.js
export const getNearbyItems = async (req, res) => {
  try {
    const { category, limit = 6, lat, lng, city } = req.query;
    
    let query = {};
    
    // If location is provided, search nearby
    if (lat && lng) {
      const maxDistance = 50000; // 50km radius
      
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistance
        }
      };
    } else if (city) {
      // Search by city if coordinates not available
      query.$or = [
        { city: { $regex: city, $options: 'i' } },
        { address: { $regex: city, $options: 'i' } },
        { 'location.city': { $regex: city, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.itemType = category;
    }
    
    const items = await Item.find(query)
      .limit(parseInt(limit))
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
      locationUsed: lat && lng ? 'coordinates' : city ? 'city' : 'none'
    });
    
  } catch (error) {
    console.error('Error fetching nearby items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby items',
      error: error.message
    });
  }
};