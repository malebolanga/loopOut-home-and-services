import Sell from '../models/sell.model.js';
import User from '../models/user.model.js';
import { validateListingText, validateImages } from '../utils/moderationHelper.js';

export const createSellListing = async (req, res) => {
  try {
    const textCheck = validateListingText(req.body);
    if (!textCheck.valid) {
      return res.status(400).json({ success: false, message: textCheck.message });
    }

    const imageCheck = await validateImages(req.body.imageUrls);
    if (!imageCheck.valid) {
      return res.status(400).json({ success: false, message: imageCheck.message });
    }

    const { name, description, price, category, imageUrls, address, contact, condition, bookAuthor, bookYear, bookUsageHistory } = req.body;
    // Map frontend 'name' and 'regularPrice' to backend 'title' and 'price' if needed
    const title = name;
    const finalPrice = price || req.body.regularPrice;

    if (!title || !description || !finalPrice || !category || !imageUrls || !contact) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const newSellListing = new Sell({
      creator: req.user.id,
      title,
      description,
      price: finalPrice,
      category,
      imageUrls,
      address,
      contact,
      condition,
      bookAuthor,
      bookYear,
      bookUsageHistory,
    });

    const savedListing = await newSellListing.save();
    return res.status(201).json({ success: true, data: savedListing });
  } catch (error) {
    console.error('Error creating sell listing:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getSellListings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const category = req.query.category || undefined;

    let query = {};
    if (category) {
      query.category = category;
    }

    const listings = await Sell.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('creator', 'username avatar');

    return res.status(200).json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching sell listings:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getSellListingById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching sell listing with id:', id);
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing identifier format' });
    }
    const listing = await Sell.findById(id).populate('creator', 'username avatar');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Sell listing not found' });
    }
    return res.status(200).json({ success: true, data: listing });
  } catch (error) {
    console.error('Error fetching sell listing:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
