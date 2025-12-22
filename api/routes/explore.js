// backend/routes/explore.js (example)
router.get('/featured', async (req, res) => {
  try {
    const { category = 'all', limit = 6 } = req.query;
    let model;
    
    switch(category) {
      case 'services': model = Service; break;
      case 'helpers': model = Helper; break;
      case 'events': model = Event; break;
      default: model = Listing;
    }
    
    const items = await model.find({ isFeatured: true })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: items.map(item => ({
        ...item,
        itemType: category === 'all' ? 'properties' : category
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { category = 'all', limit = 6 } = req.query;
    let model;
    
    switch(category) {
      case 'services': model = Service; break;
      case 'helpers': model = Helper; break;
      case 'events': model = Event; break;
      default: model = Listing;
    }
    
    // Calculate trending based on views, saves, and recency
    const items = await model.aggregate([
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$viewCount', 2] },
              { $multiply: ['$saveCount', 3] },
              {
                $divide: [
                  { $subtract: [new Date(), '$createdAt'] },
                  1000 * 60 * 60 * 24 // Days since creation
                ]
              }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      data: items.map(item => ({
        ...item,
        itemType: category === 'all' ? 'properties' : category
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});