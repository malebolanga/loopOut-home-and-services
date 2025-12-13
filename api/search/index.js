import express from 'express';
import Listing from '../../models/Listing.js';
import Service from '../../models/Service.js';
import Helper from '../../models/Helper.js';
import Event from '../../models/Event.js';

const router = express.Router();

// Helper function for text search
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

// Generic search function
const searchCollection = async (Model, params, fields) => {
  const {
    q,
    location,
    priceMin,
    priceMax,
    sort = 'createdAt',
    page = 1,
    limit = 12,
    ...filters
  } = params;

  const query = {};
  
  // Text search
  if (q) {
    query.$or = fields.map(field => ({
      [field]: { $regex: q, $options: 'i' }
    }));
  }

  // Location filter
  if (location) {
    query.$or = [
      { address: { $regex: location, $options: 'i' } },
      { location: { $regex: location, $options: 'i' } },
      { city: { $regex: location, $options: 'i' } }
    ];
  }

  // Price range filter
  if (priceMin || priceMax) {
    query.regularPrice = {};
    if (priceMin) query.regularPrice.$gte = Number(priceMin);
    if (priceMax) query.regularPrice.$lte = Number(priceMax);
  }

  // Apply other filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      query[key] = filters[key];
    }
  });

  // Build sort object
  let sortObj = {};
  switch(sort) {
    case 'price_asc':
      sortObj = { regularPrice: 1 };
      break;
    case 'price_desc':
      sortObj = { regularPrice: -1 };
      break;
    case 'rating':
      sortObj = { rating: -1 };
      break;
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    default: // relevance
      sortObj = { createdAt: -1 };
  }

  // Execute query
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    Model.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(query)
  ]);

  return { items, total, page, limit, hasMore: total > page * limit };
};

// Properties search
router.get('/properties', async (req, res) => {
  try {
    const fields = ['name', 'description', 'address', 'type', 'offer', 'parking', 'furnished'];
    const results = await searchCollection(Listing, req.query, fields);
    res.json(results);
  } catch (error) {
    console.error('Properties search error:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// Services search
router.get('/services', async (req, res) => {
  try {
    const fields = ['name', 'description', 'serviceType', 'category', 'address'];
    const results = await searchCollection(Service, req.query, fields);
    res.json(results);
  } catch (error) {
    console.error('Services search error:', error);
    res.status(500).json({ error: 'Failed to search services' });
  }
});

// Helpers search
router.get('/helpers', async (req, res) => {
  try {
    const fields = ['name', 'description', 'helperType', 'skills', 'address', 'availability'];
    const results = await searchCollection(Helper, req.query, fields);
    res.json(results);
  } catch (error) {
    console.error('Helpers search error:', error);
    res.status(500).json({ error: 'Failed to search helpers' });
  }
});

// Events search
router.get('/events', async (req, res) => {
  try {
    const fields = ['name', 'description', 'eventType', 'location', 'organizer'];
    const results = await searchCollection(Event, req.query, fields);
    res.json(results);
  } catch (error) {
    console.error('Events search error:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// Universal search (search across all collections)
router.get('/universal', async (req, res) => {
  try {
    const { q, type = 'all', limit = 8 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTypes = type === 'all' 
      ? ['properties', 'services', 'helpers', 'events']
      : [type];

    const searchPromises = searchTypes.map(async (searchType) => {
      let Model, fields;
      
      switch(searchType) {
        case 'properties':
          Model = Listing;
          fields = ['name', 'description', 'address'];
          break;
        case 'services':
          Model = Service;
          fields = ['name', 'description', 'serviceType'];
          break;
        case 'helpers':
          Model = Helper;
          fields = ['name', 'description', 'helperType'];
          break;
        case 'events':
          Model = Event;
          fields = ['name', 'description', 'eventType'];
          break;
        default:
          return { type: searchType, items: [] };
      }

      const query = {
        $or: fields.map(field => ({
          [field]: { $regex: q, $options: 'i' }
        }))
      };

      const items = await Model.find(query)
        .limit(Math.ceil(limit / searchTypes.length))
        .lean();

      return { type: searchType, items };
    });

    const results = await Promise.all(searchPromises);
    
    // Combine and format results
    const formattedResults = results.reduce((acc, { type, items }) => {
      items.forEach(item => {
        acc.push({
          ...item,
          itemType: type,
          searchScore: calculateRelevanceScore(q, item, type)
        });
      });
      return acc;
    }, []);

    // Sort by relevance score
    formattedResults.sort((a, b) => b.searchScore - a.searchScore);
    
    res.json({
      query: q,
      total: formattedResults.length,
      items: formattedResults.slice(0, limit),
      types: searchTypes
    });

  } catch (error) {
    console.error('Universal search error:', error);
    res.status(500).json({ error: 'Failed to perform universal search' });
  }
});

// Calculate relevance score
const calculateRelevanceScore = (query, item, type) => {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Check name match
  if (item.name && item.name.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  
  // Check description match
  if (item.description && item.description.toLowerCase().includes(queryLower)) {
    score += 3;
  }
  
  // Check address match
  if (item.address && item.address.toLowerCase().includes(queryLower)) {
    score += 2;
  }
  
  // Boost for active/available items
  if (item.available !== false) {
    score += 1;
  }
  
  // Boost for recent items
  if (item.createdAt) {
    const daysOld = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) score += 2;
    else if (daysOld < 30) score += 1;
  }
  
  return score;
};

// Save search history
router.post('/history', async (req, res) => {
  try {
    // Implement search history saving logic here
    // This would require a SearchHistory model
    res.json({ success: true, message: 'Search history saved' });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

export default router;