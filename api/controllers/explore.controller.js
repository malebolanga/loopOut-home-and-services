import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';

// Helper to shuffle array
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Map item to a standard format for Explore Page if needed
// Actually, it's better to keep their original format and let the frontend render it
const formatItem = (item, type) => {
    const doc = item._doc || item;
    return {
        ...doc,
        itemType: type
    };
};

export const getFeaturedItems = async (req, res, next) => {
  try {
    const { category, limit = 6 } = req.query;
    const perCategoryLimit = Math.ceil(limit / 4);

    let featured = [];

    if (category && category !== 'all') {
      const models = { listings: Listing, services: Service, helpers: Helper, events: Event };
      const Model = models[category];
      if (Model) {
        const items = await Model.find().sort({ createdAt: -1 }).limit(parseInt(limit));
        featured = items.map(item => formatItem(item, category));
      }
    } else {
      const [listings, services, helpers, events] = await Promise.all([
        Listing.find().sort({ createdAt: -1 }).limit(perCategoryLimit),
        Service.find().sort({ createdAt: -1 }).limit(perCategoryLimit),
        Helper.find().sort({ createdAt: -1 }).limit(perCategoryLimit),
        Event.find().sort({ createdAt: -1 }).limit(perCategoryLimit),
      ]);

      featured = [
        ...listings.map(i => formatItem(i, 'properties')),
        ...services.map(i => formatItem(i, 'services')),
        ...helpers.map(i => formatItem(i, 'helpers')),
        ...events.map(i => formatItem(i, 'events')),
      ];
    }

    res.status(200).json({ success: true, data: shuffle(featured).slice(0, limit) });
  } catch (error) {
    next(error);
  }
};

export const getTrendingItems = async (req, res, next) => {
  try {
    const { category, limit = 6 } = req.query;
    // For now, trending is just newest. In a real app, logic would involve view counts or recent comments.
    // I'll reuse the featured logic for now but sorting by 'rating' if available.
    
    const perCategoryLimit = Math.ceil(limit / 4);
    let trending = [];

    if (category && category !== 'all') {
        const models = { listings: Listing, services: Service, helpers: Helper, events: Event };
        const Model = models[category];
        if (Model) {
          const items = await Model.find().sort({ rating: -1, createdAt: -1 }).limit(parseInt(limit));
          trending = items.map(item => formatItem(item, category));
        }
    } else {
        const [listings, services, helpers, events] = await Promise.all([
            Listing.find().sort({ rating: -1, createdAt: -1 }).limit(perCategoryLimit),
            Service.find().sort({ rating: -1, createdAt: -1 }).limit(perCategoryLimit),
            Helper.find().sort({ createdAt: -1 }).limit(perCategoryLimit),
            Event.find().sort({ createdAt: -1 }).limit(perCategoryLimit),
        ]);

        trending = [
            ...listings.map(i => formatItem(i, 'properties')),
            ...services.map(i => formatItem(i, 'services')),
            ...helpers.map(i => formatItem(i, 'helpers')),
            ...events.map(i => formatItem(i, 'events')),
        ];
    }

    res.status(200).json({ success: true, data: shuffle(trending).slice(0, limit) });
  } catch (error) {
    next(error);
  }
};

export const getNearbyItems = async (req, res, next) => {
  try {
    const { category, limit = 6, lat, lng, city } = req.query;
    
    // Fallback search criteria
    let query = {};
    if (city) {
      query.$or = [
        { near: { $regex: city, $options: 'i' } },
        { address: { $regex: city, $options: 'i' } }
      ];
    }

    const perCategoryLimit = Math.ceil(limit / 4);
    let nearby = [];

    if (category && category !== 'all') {
        const models = { listings: Listing, services: Service, helpers: Helper, events: Event };
        const Model = models[category];
        if (Model) {
          const items = await Model.find(query).limit(parseInt(limit));
          nearby = items.map(item => formatItem(item, category));
        }
    } else {
        const [listings, services, helpers, events] = await Promise.all([
            Listing.find(query).limit(perCategoryLimit),
            Service.find(query).limit(perCategoryLimit),
            Helper.find(query).limit(perCategoryLimit),
            Event.find(query).limit(perCategoryLimit),
        ]);

        nearby = [
            ...listings.map(i => formatItem(i, 'properties')),
            ...services.map(i => formatItem(i, 'services')),
            ...helpers.map(i => formatItem(i, 'helpers')),
            ...events.map(i => formatItem(i, 'events')),
        ];
    }

    res.status(200).json({ success: true, data: nearby });
  } catch (error) {
    next(error);
  }
};