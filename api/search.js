import { fuzzItemsLocation } from './utils/locationFuzzer.js';

export const searchHandler = async (req, res) => {
  try {
    const {
      q: searchTerm = '',
      type = 'properties',
      subType = 'all',
      minPrice = 0,
      maxPrice = 100000000,
      sort = 'relevance',
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;
    
    let query = {};
    let model;
    
    // Determine model and build query based on type
    switch(type) {
      case 'services':
        model = Service;
        query = buildServiceQuery(searchTerm, subType, minPrice, maxPrice);
        break;
      case 'helpers':
        model = Helper;
        query = buildHelperQuery(searchTerm, subType, minPrice, maxPrice);
        break;
      case 'events':
        model = Event;
        query = buildEventQuery(searchTerm, subType, minPrice, maxPrice);
        break;
      default:
        model = Listing;
        query = buildListingQuery(searchTerm, subType, minPrice, maxPrice);
    }
    
    // Execute search
    const results = await model.find(query)
      .sort(getSortCriteria(sort))
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await model.countDocuments(query);
    const hasMore = total > skip + results.length;
    
    // Add item type for frontend
    const typedResults = results.map(item => ({
      ...item,
      itemType: type
    }));
    
    const securedResults = fuzzItemsLocation(typedResults);
    
    res.status(200).json({
      success: true,
      data: securedResults,
      total,
      hasMore,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform search',
      error: error.message
    });
  }
};

// Helper functions for building queries
const buildListingQuery = (searchTerm, subType, minPrice, maxPrice) => {
  const query = {};
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { address: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  if (subType !== 'all') {
    query.type = subType;
  }
  
  query.regularPrice = { $gte: minPrice, $lte: maxPrice };
  
  return query;
};

const getSortCriteria = (sort) => {
  switch(sort) {
    case 'price_asc':
      return { regularPrice: 1 };
    case 'price_desc':
      return { regularPrice: -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { score: -1 }; // Relevance score
  }
};