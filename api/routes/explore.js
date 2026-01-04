import express from 'express';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';
import { getDistance } from 'geolib';

const router = express.Router();

// Get featured items
router.get('/featured', async (req, res) => {
  try {
    const { category, limit = 6 } = req.query;
    let query = { featured: true };
    
    if (category && category !== 'all') {
      query.itemType = category;
    }

    // Fetch from different collections based on category or all
    let items = [];
    
    if (category === 'all' || category === 'properties') {
      const listings = await Listing.find({ ...query, status: 'active' })
        .populate('userRef', 'username email avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      items = [...items, ...listings.map(l => ({ ...l._doc, itemType: 'properties' }))];
    }

    if (category === 'all' || category === 'services') {
      const services = await Service.find({ ...query, status: 'active' })
        .populate('userRef', 'username email avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      items = [...items, ...services.map(s => ({ ...s._doc, itemType: 'services' }))];
    }

    if (category === 'all' || category === 'helpers') {
      const helpers = await Helper.find({ ...query, status: 'active' })
        .populate('userRef', 'username email avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      items = [...items, ...helpers.map(h => ({ ...h._doc, itemType: 'helpers' }))];
    }

    if (category === 'all' || category === 'events') {
      const events = await Event.find({ ...query, status: 'active' })
        .populate('userRef', 'username email avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      items = [...items, ...events.map(e => ({ ...e._doc, itemType: 'events' }))];
    }

    // Shuffle and limit results
    items = items.sort(() => Math.random() - 0.5).slice(0, limit);

    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured items'
    });
  }
});

// Get trending items
router.get('/trending', async (req, res) => {
  try {
    const { category, limit = 6 } = req.query;
    let query = {};
    
    if (category && category !== 'all') {
      query.itemType = category;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch trending items (most views or engagements in last week)
    let items = [];
    
    if (category === 'all' || category === 'properties') {
      const listings = await Listing.find({
        ...query,
        status: 'active',
        createdAt: { $gte: oneWeekAgo }
      })
        .populate('userRef', 'username email avatar')
        .limit(parseInt(limit))
        .sort({ viewCount: -1, createdAt: -1 });
      items = [...items, ...listings.map(l => ({ ...l._doc, itemType: 'properties' }))];
    }

    // Similar logic for services, helpers, events...
    // (You'll need to add your own trending logic for each model)

    // For now, return featured items as placeholder
    const featuredRes = await router.get('/featured', async (req, res) => {
      // Reuse featured logic temporarily
    });

    res.status(200).json({
      success: true,
      data: items.slice(0, limit),
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching trending items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending items'
    });
  }
});

// Get nearby items
router.get('/nearby', async (req, res) => {
  try {
    const { category, limit = 6, lat, lng, city } = req.query;
    let query = { status: 'active' };
    
    if (category && category !== 'all') {
      query.itemType = category;
    }

    let items = [];
    const maxDistance = 50000; // 50km radius

    // If coordinates provided, filter by distance
    if (lat && lng) {
      const userLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      };

      // For listings with location
      if (category === 'all' || category === 'properties') {
        const listings = await Listing.find({
          status: 'active',
          'location.coordinates': { $exists: true }
        })
          .populate('userRef', 'username email avatar')
          .limit(20); // Get more to filter by distance

        // Filter by distance manually
        const nearbyListings = listings.filter(listing => {
          if (!listing.location?.coordinates) return false;
          const distance = getDistance(userLocation, {
            latitude: listing.location.coordinates[1],
            longitude: listing.location.coordinates[0]
          });
          return distance <= maxDistance;
        });

        items = [...items, ...nearbyListings.map(l => ({ ...l._doc, itemType: 'properties' }))];
      }
    } 
    // If city provided but no coordinates
    else if (city) {
      if (category === 'all' || category === 'properties') {
        const listings = await Listing.find({
          ...query,
          'address.city': new RegExp(city, 'i')
        })
          .populate('userRef', 'username email avatar')
          .limit(parseInt(limit))
          .sort({ createdAt: -1 });
        items = [...items, ...listings.map(l => ({ ...l._doc, itemType: 'properties' }))];
      }
    }
    // Default: return recent items
    else {
      if (category === 'all' || category === 'properties') {
        const listings = await Listing.find(query)
          .populate('userRef', 'username email avatar')
          .limit(parseInt(limit))
          .sort({ createdAt: -1 });
        items = [...items, ...listings.map(l => ({ ...l._doc, itemType: 'properties' }))];
      }
    }

    // Add similar logic for services, helpers, events...

    res.status(200).json({
      success: true,
      data: items.slice(0, limit),
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching nearby items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby items'
    });
  }
});

export default router;