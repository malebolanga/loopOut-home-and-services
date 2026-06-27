import express from 'express';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';

const router = express.Router();

// Test route to verify search router is working
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Search router is working!',
        timestamp: new Date().toISOString()
    });
});

// Simple search function for debugging
router.get('/debug', async (req, res) => {
    try {
        // Count documents in each collection
        const listingsCount = await Listing.countDocuments();
        const servicesCount = await Service.countDocuments();
        const helpersCount = await Helper.countDocuments();
        const eventsCount = await Event.countDocuments();
        
        res.json({
            status: 'ok',
            counts: {
                listings: listingsCount,
                services: servicesCount,
                helpers: helpersCount,
                events: eventsCount
            },
            collectionsExist: {
                Listing: !!Listing,
                Service: !!Service,
                Helper: !!Helper,
                Event: !!Event
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Properties search - SIMPLIFIED VERSION
router.get('/properties', async (req, res) => {
    try {
        console.log('Search properties query:', req.query);
        
        const { q, page = 1, limit = 10 } = req.query;
        
        // Build query
        const query = {};
        if (q && q.trim()) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } }
            ];
        }
        
        console.log('MongoDB query:', JSON.stringify(query));
        
        // Execute query
        const skip = (page - 1) * limit;
        const items = await Listing.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userRef', 'username avatar')
            .lean();
            
        const total = await Listing.countDocuments(query);
        
        res.json({
            success: true,
            items,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: total > page * limit,
            query: q || 'none'
        });
        
    } catch (error) {
        console.error('Properties search error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to search properties',
            details: error.message 
        });
    }
});

// Services search - SIMPLIFIED VERSION
router.get('/services', async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (q && q.trim()) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { serviceType: { $regex: q, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        const items = await Service.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userRef', 'username avatar')
            .lean();
            
        const total = await Service.countDocuments(query);
        
        res.json({
            success: true,
            items,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: total > page * limit
        });
        
    } catch (error) {
        console.error('Services search error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to search services',
            details: error.message 
        });
    }
});

// Helpers search - SIMPLIFIED VERSION
router.get('/helpers', async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (q && q.trim()) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { helperType: { $regex: q, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        const items = await Helper.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userRef', 'username avatar')
            .lean();
            
        const total = await Helper.countDocuments(query);
        
        res.json({
            success: true,
            items,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: total > page * limit
        });
        
    } catch (error) {
        console.error('Helpers search error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to search helpers',
            details: error.message 
        });
    }
});

// Events search - SIMPLIFIED VERSION
router.get('/events', async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (q && q.trim()) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { eventType: { $regex: q, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        const items = await Event.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userRef', 'username avatar')
            .lean();
            
        const total = await Event.countDocuments(query);
        
        res.json({
            success: true,
            items,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: total > page * limit
        });
        
    } catch (error) {
        console.error('Events search error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to search events',
            details: error.message 
        });
    }
});

// Universal search - SIMPLIFIED
router.get('/universal', async (req, res) => {
    try {
        const { q, limit = 8 } = req.query;
        
        if (!q || !q.trim()) {
            return res.status(400).json({ 
                success: false,
                error: 'Search query required' 
            });
        }
        
        // Search all collections in parallel
        const [properties, services, helpers, events] = await Promise.all([
            Listing.find({ 
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            }).limit(2).populate('userRef', 'username avatar').lean(),
            
            Service.find({ 
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            }).limit(2).populate('userRef', 'username avatar').lean(),
            
            Helper.find({ 
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            }).limit(2).populate('userRef', 'username avatar').lean(),
            
            Event.find({ 
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            }).limit(2).populate('userRef', 'username avatar').lean()
        ]);
        
        // Combine results
        const items = [
            ...properties.map(item => ({ ...item, itemType: 'properties' })),
            ...services.map(item => ({ ...item, itemType: 'services' })),
            ...helpers.map(item => ({ ...item, itemType: 'helpers' })),
            ...events.map(item => ({ ...item, itemType: 'events' }))
        ];
        
        res.json({
            success: true,
            query: q,
            total: items.length,
            items: items.slice(0, parseInt(limit)),
            counts: {
                properties: properties.length,
                services: services.length,
                helpers: helpers.length,
                events: events.length
            }
        });
        
    } catch (error) {
        console.error('Universal search error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to perform universal search',
            details: error.message 
        });
    }
});

export default router;