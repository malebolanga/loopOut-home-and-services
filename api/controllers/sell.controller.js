import Sell from '../models/sell.model.js';
import User from '../models/user.model.js';
import { validateListingText, validateImages } from '../utils/moderationHelper.js';
import GoodsOrder from '../models/goodsOrder.model.js';
import Notification from '../models/notification.model.js';
import Conversation from '../models/Conversation.model.js';

const currentUserId = (req) => String(req.user?.id || req.user?._id || '');

export const createGoodsOrder = async (req, res) => {
  try {
    const buyerId = currentUserId(req);
    const { listingId, message = '' } = req.body || {};
    if (!/^[0-9a-fA-F]{24}$/.test(String(listingId || ''))) return res.status(400).json({ success: false, message: 'Choose a valid item.' });
    const listing = await Sell.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'This item is no longer available.' });
    const sellerId = String(listing.creator);
    if (sellerId === buyerId) return res.status(400).json({ success: false, message: 'You cannot request your own item.' });
    if (String(message).length > 500) return res.status(400).json({ success: false, message: 'Message must be 500 characters or less.' });

    const order = await GoodsOrder.create({ listing: listing._id, buyer: buyerId, seller: sellerId, title: listing.title, image: listing.imageUrls?.[0] || '', price: listing.price, message: String(message).trim(), statusHistory: [{ status: 'Requested', by: buyerId }] });
    await Notification.create({ userId: sellerId, type: 'food_order', title: 'New item request', message: `A buyer requested “${listing.title}”.`, data: { goodsOrderId: order._id, status: order.status, link: '/my-loopout' } }).catch((error) => console.error('[GOODS] Seller notification failed:', error.message));
    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('[GOODS] Create order failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not send your request. Please try again.' });
  }
};

export const getGoodsOrders = async (req, res) => {
  try {
    const userId = currentUserId(req);
    const orders = await GoodsOrder.find({ $or: [{ buyer: userId }, { seller: userId }] })
      .sort({ createdAt: -1 }).limit(100)
      .populate('buyer', 'username avatar').populate('seller', 'username avatar').lean();
    return res.json({ success: true, data: orders.map((order) => ({ ...order, role: String(order.buyer?._id) === userId ? 'buyer' : 'seller' })) });
  } catch (error) {
    console.error('[GOODS] Fetch orders failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not load item requests.' });
  }
};

export const getGoodsOrderConversation = async (req, res) => {
  try {
    const userId = currentUserId(req);
    const order = await GoodsOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Item request not found.' });
    const isBuyer = String(order.buyer) === userId;
    const isSeller = String(order.seller) === userId;
    if (!isBuyer && !isSeller) return res.status(403).json({ success: false, message: 'You cannot access this item conversation.' });
    let conversation = await Conversation.findOne({ goodsOrderId: order._id });
    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participants: [order.buyer, order.seller],
          goodsOrderId: order._id,
          goodsOrderTitle: order.title,
          lastMessage: '',
        });
      } catch (createError) {
        if (createError.code !== 11000) throw createError;
        conversation = await Conversation.findOne({ goodsOrderId: order._id });
      }
    }
    return res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('[GOODS] Could not open item conversation:', error.message);
    return res.status(500).json({ success: false, message: 'Could not open this item conversation.' });
  }
};

export const reportGoodsOrderIssue = async (req, res) => {
  try {
    const userId = currentUserId(req);
    const { category, details } = req.body || {};
    const allowedCategories = ['Item not as described', 'Collection problem', 'Safety concern', 'Other'];
    const cleanDetails = String(details || '').trim();
    if (!allowedCategories.includes(category)) return res.status(400).json({ success: false, message: 'Choose a valid issue type.' });
    if (cleanDetails.length < 8 || cleanDetails.length > 1000) return res.status(400).json({ success: false, message: 'Add at least 8 characters and no more than 1,000 characters.' });
    const order = await GoodsOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Item request not found.' });
    const isBuyer = String(order.buyer) === userId;
    const isSeller = String(order.seller) === userId;
    if (!isBuyer && !isSeller) return res.status(403).json({ success: false, message: 'You cannot report an issue on this item request.' });
    const existingOpenIssue = order.issueReports.find((issue) => String(issue.reporter) === userId && issue.status === 'Open');
    if (existingOpenIssue) return res.status(409).json({ success: false, message: 'You already have an open report for this request.' });

    order.issueReports.push({ reporter: userId, category, details: cleanDetails });
    await order.save();
    const issue = order.issueReports[order.issueReports.length - 1];
    const otherPartyId = isBuyer ? order.seller : order.buyer;
    const notifications = [
      { userId: otherPartyId, type: 'food_order', title: 'Marketplace issue reported', message: `An issue was reported for “${order.title}”: ${category}.`, data: { goodsOrderId: order._id, issueId: issue._id, status: order.status, link: '/my-loopout' } },
    ];
    const admins = await User.find({ $or: [{ isAdmin: true }, { role: 'admin' }] }).select('_id').lean();
    admins.forEach((admin) => notifications.push({ userId: admin._id, type: 'system', title: 'Marketplace issue needs review', message: `A ${category.toLowerCase()} report was submitted for “${order.title}”.`, data: { goodsOrderId: order._id, issueId: issue._id, link: '/my-loopout' } }));
    await Notification.insertMany(notifications).catch((error) => console.error('[GOODS] Issue notification failed:', error.message));
    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('[GOODS] Issue report failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not submit the report. Please try again.' });
  }
};

export const updateGoodsOrderStatus = async (req, res) => {
  try {
    const userId = currentUserId(req);
    const { status } = req.body || {};
    const order = await GoodsOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Item request not found.' });
    const isBuyer = String(order.buyer) === userId;
    const isSeller = String(order.seller) === userId;
    if (!isBuyer && !isSeller) return res.status(403).json({ success: false, message: 'You cannot update this item request.' });
    const allowed = isSeller ? ['Accepted', 'Ready for Collection', 'Cancelled'] : ['Completed', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(403).json({ success: false, message: 'That status change is not allowed.' });
    const transitions = {
      Requested: ['Accepted', 'Cancelled'],
      Accepted: ['Ready for Collection', 'Cancelled'],
      'Ready for Collection': ['Completed', 'Cancelled'],
    };
    if (!(transitions[order.status] || []).includes(status)) return res.status(409).json({ success: false, message: `This request is already ${order.status.toLowerCase()}.` });

    order.status = status;
    order.statusHistory.push({ status, by: userId, createdAt: new Date() });
    await order.save();
    const recipientId = isBuyer ? order.seller : order.buyer;
    await Notification.create({ userId: recipientId, type: 'food_order', title: `Item request ${status.toLowerCase()}`, message: `The request for “${order.title}” is now ${status.toLowerCase()}.`, data: { goodsOrderId: order._id, status, link: '/my-loopout' } }).catch((error) => console.error('[GOODS] Status notification failed:', error.message));
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('[GOODS] Update order failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not update this item request.' });
  }
};

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

export const deleteSellListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing identifier format' });
    }
    const listing = await Sell.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Sell listing not found' });
    }
    if (listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own items!' });
    }
    await Sell.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting sell listing:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateSellListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing identifier format' });
    }
    const listing = await Sell.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Sell listing not found' });
    }
    if (listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own items!' });
    }

    const updated = await Sell.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating sell listing:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

