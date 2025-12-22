// backend/controllers/searchController.js
const Listing = require('../models/Listing');
const Service = require('../models/Service');
const Helper = require('../models/Helper');
const Event = require('../models/Event');

// Smart search across all types
exports.smartSearch = async (req, res) => {
  try {
    const { searchTerm, type = 'all', ...filters } = req.query;
    const results = {};
    
    // Search in all types
    const searchPromises = [];
    
    if (type === 'all' || type === 'properties') {
      searchPromises.push(searchProperties(searchTerm, filters));
    }
    
    if (type === 'all' || type === 'services') {
      searchPromises.push(searchServices(searchTerm, filters));
    }
    
    if (type === 'all' || type === 'helpers') {
      searchPromises.push(searchHelpers(searchTerm, filters));
    }
    
    if (type === 'all' || type === 'events') {
      searchPromises.push(searchEvents(searchTerm, filters));
    }
    
    const [properties, services, helpers, events] = await Promise.all(searchPromises);
    
    if (type === 'all') {
      results.properties = properties;
      results.services = services;
      results.helpers = helpers;
      results.events = events;
    } else {
      results[type] = type === 'properties' ? properties :
                     type === 'services' ? services :
                     type === 'helpers' ? helpers : events;
    }
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function searchProperties(searchTerm, filters) {
  const query = {};
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { address: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Apply filters
  if (filters.type && filters.type !== 'all') {
    query.type = filters.type;
  }
  
  if (filters.bedroomsMin) {
    query.bedrooms = { $gte: parseInt(filters.bedroomsMin) };
  }
  
  if (filters.bedroomsMax) {
    query.bedrooms = { ...query.bedrooms, $lte: parseInt(filters.bedroomsMax) };
  }
  
  if (filters.priceMin) {
    query.regularPrice = { $gte: parseInt(filters.priceMin) };
  }
  
  if (filters.priceMax) {
    query.regularPrice = { ...query.regularPrice, $lte: parseInt(filters.priceMax) };
  }
  
  // Boolean filters
  ['parking', 'furnished', 'wifi', 'pool', 'offer', 'pets', 'security', 'aircon', 'gym', 'view'].forEach(filter => {
    if (filters[filter] === 'true') {
      query[filter] = true;
    }
  });
  
  return await Listing.find(query).limit(50);
}

async function searchServices(searchTerm, filters) {
  const query = {};
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  
  if (filters.priceMin) {
    query.price = { $gte: parseInt(filters.priceMin) };
  }
  
  if (filters.priceMax) {
    query.price = { ...query.price, $lte: parseInt(filters.priceMax) };
  }
  
  return await Service.find(query).limit(50);
}

async function searchHelpers(searchTerm, filters) {
  const query = {};
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { skills: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  if (filters.type && filters.type !== 'all') {
    query.type = filters.type;
  }
  
  if (filters.rateMin) {
    query.hourlyRate = { $gte: parseInt(filters.rateMin) };
  }
  
  if (filters.rateMax) {
    query.hourlyRate = { ...query.hourlyRate, $lte: parseInt(filters.rateMax) };
  }
  
  return await Helper.find(query).limit(50);
}

async function searchEvents(searchTerm, filters) {
  const query = {};
  
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { location: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  
  if (filters.priceMin) {
    query.ticketPrice = { $gte: parseInt(filters.priceMin) };
  }
  
  if (filters.priceMax) {
    query.ticketPrice = { ...query.ticketPrice, $lte: parseInt(filters.priceMax) };
  }
  
  if (filters.dateFrom) {
    query.date = { $gte: new Date(filters.dateFrom) };
  }
  
  if (filters.dateTo) {
    query.date = { ...query.date, $lte: new Date(filters.dateTo) };
  }
  
  return await Event.find(query).limit(50);
}