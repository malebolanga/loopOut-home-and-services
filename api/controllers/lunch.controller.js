import crypto from 'crypto';
import mongoose from 'mongoose';
import Shop from '../models/shop.model.js';
import FoodOrder from '../models/foodOrder.model.js';
import TableBooking from '../models/tableBooking.model.js';
import Notification from '../models/notification.model.js';

const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled'];
const requireDatabase = (res) => {
  if (mongoose.connection.readyState === 1) return true;
  res.status(503).json({ success: false, message: 'Lunch ordering is temporarily unavailable. Please try again later.' });
  return false;
};
const format = (document) => ({ id: document._id.toString(), ...document.toObject() });
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const userId = (req) => String(req.user.id);
const cleanText = (value, limit = 500) => String(value || '').trim().slice(0, limit);
const isOwner = (shop, req) => String(shop.ownerId) === userId(req);
const getOwnedShop = async (id, req, res) => {
  if (!validId(id)) { res.status(404).json({ success: false, message: 'Shop not found.' }); return null; }
  const shop = await Shop.findById(id);
  if (!shop) { res.status(404).json({ success: false, message: 'Shop not found.' }); return null; }
  if (!isOwner(shop, req)) { res.status(403).json({ success: false, message: 'You do not manage this shop.' }); return null; }
  return shop;
};
const createNotification = async (userId, title, message, data) => {
  if (!validId(userId)) return;
  await Notification.create({ userId, type: 'booking', title, message, data });
};

export const getShops = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const shops = await Shop.find({ ownerId: { $ne: 'guest' } }).sort({ createdAt: -1 });
    return res.json(shops.map(format));
  } catch (error) { return next(error); }
};

export const createShop = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const name = cleanText(req.body.name, 80);
    const address = cleanText(req.body.address, 180);
    const phone = cleanText(req.body.phone, 30);
    if (!name || !address || !phone) return res.status(400).json({ success: false, message: 'Shop name, address, and phone are required.' });
    if (await Shop.exists({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })) return res.status(409).json({ success: false, message: 'A shop with that name already exists.' });
    const shop = await Shop.create({ name, address, phone, cuisine: cleanText(req.body.cuisine, 60) || 'General', image: cleanText(req.body.image, 32) || '🏪', whatsapp: cleanText(req.body.whatsapp, 30), ownerId: userId(req), ownerName: cleanText(req.body.ownerName, 80) || 'Shop owner', isOpen: false, meals: [] });
    return res.status(201).json(format(shop));
  } catch (error) { return next(error); }
};

export const updateShop = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const shop = await getOwnedShop(req.params.id, req, res); if (!shop) return;
    for (const key of ['name', 'cuisine', 'address', 'phone', 'whatsapp', 'image']) if (req.body[key] !== undefined) shop[key] = cleanText(req.body[key], key === 'address' ? 180 : 80);
    if (typeof req.body.isOpen === 'boolean') shop.isOpen = req.body.isOpen;
    if (req.body.operatingHours && typeof req.body.operatingHours === 'object') shop.operatingHours = req.body.operatingHours;
    await shop.save(); return res.json(format(shop));
  } catch (error) { return next(error); }
};

export const addMealToShop = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const shop = await getOwnedShop(req.params.id, req, res); if (!shop) return;
    const name = cleanText(req.body.name, 100); const price = Number(req.body.price);
    if (!name || !Number.isFinite(price) || price <= 0 || price > 10000) return res.status(400).json({ success: false, message: 'Enter a valid meal name and price.' });
    const meal = { id: crypto.randomUUID(), name, description: cleanText(req.body.description, 500), price: Math.round(price * 100) / 100, tag: cleanText(req.body.tag, 40) || 'Popular', image: cleanText(req.body.image, 32) || '🍽️', isAvailable: req.body.isAvailable !== false, addOns: [] };
    shop.meals.push(meal); await shop.save(); return res.status(201).json(meal);
  } catch (error) { return next(error); }
};

export const updateMealInShop = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const shop = await getOwnedShop(req.params.id, req, res); if (!shop) return;
    const meal = shop.meals.find((entry) => entry.id === req.params.mealId); if (!meal) return res.status(404).json({ success: false, message: 'Meal not found.' });
    if (req.body.name !== undefined) meal.name = cleanText(req.body.name, 100);
    if (req.body.description !== undefined) meal.description = cleanText(req.body.description, 500);
    if (req.body.tag !== undefined) meal.tag = cleanText(req.body.tag, 40);
    if (req.body.image !== undefined) meal.image = cleanText(req.body.image, 32);
    if (req.body.isAvailable !== undefined) meal.isAvailable = Boolean(req.body.isAvailable);
    if (req.body.price !== undefined) { const price = Number(req.body.price); if (!Number.isFinite(price) || price <= 0 || price > 10000) return res.status(400).json({ success: false, message: 'Enter a valid price.' }); meal.price = Math.round(price * 100) / 100; }
    await shop.save(); return res.json(meal.toObject());
  } catch (error) { return next(error); }
};

export const deleteMealFromShop = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const shop = await getOwnedShop(req.params.id, req, res); if (!shop) return;
    const before = shop.meals.length; shop.meals = shop.meals.filter((meal) => meal.id !== req.params.mealId);
    if (shop.meals.length === before) return res.status(404).json({ success: false, message: 'Meal not found.' });
    await shop.save(); return res.json({ success: true });
  } catch (error) { return next(error); }
};

export const getOrders = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const ownedShops = await Shop.find({ ownerId: userId(req) }).select('_id');
    const orders = await FoodOrder.find({ $or: [{ customerId: userId(req) }, { shopId: { $in: ownedShops.map((shop) => shop._id.toString()) } }] }).sort({ createdAt: -1 });
    return res.json(orders.map(format));
  } catch (error) { return next(error); }
};

export const createOrder = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { shopId, items, customerPhone, customerName, orderComments, scheduledFor } = req.body;
    if (!validId(shopId) || !Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Choose a shop and at least one meal.' });
    const shop = await Shop.findById(shopId); if (!shop || !shop.isOpen) return res.status(409).json({ success: false, message: 'This shop is not accepting orders.' });
    const normalizedItems = items.map((item) => {
      const meal = shop.meals.find((entry) => entry.id === item.id);
      const quantity = Number(item.quantity);
      if (!meal || !meal.isAvailable || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return null;
      return { id: meal.id, name: meal.name, price: meal.price, quantity };
    });
    if (normalizedItems.some((item) => !item)) return res.status(409).json({ success: false, message: 'One or more meals are unavailable. Refresh your basket and try again.' });
    const phone = cleanText(customerPhone, 30); if (!phone) return res.status(400).json({ success: false, message: 'A contact phone number is required.' });
    const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const requestedTime = scheduledFor ? new Date(scheduledFor) : null;
    if (requestedTime && (Number.isNaN(requestedTime.getTime()) || requestedTime <= new Date())) return res.status(400).json({ success: false, message: 'Choose a future collection time.' });
    const order = await FoodOrder.create({ orderCode: `LNCH-${crypto.randomInt(100000, 1000000)}`, customerId: userId(req), customerName: cleanText(customerName, 100) || 'Customer', customerPhone: phone, shopId: shop._id.toString(), shopName: shop.name, shopImage: shop.image, items: normalizedItems, total: Math.round(total * 100) / 100, fulfilment: 'pickup', orderComments: cleanText(orderComments, 500), scheduledFor: requestedTime || undefined, paymentMethod: 'counter', paymentStatus: 'Pay at Counter', status: 'Pending' });
    await Promise.allSettled([createNotification(userId(req), 'Food order received', `Your order #${order.orderCode} has been sent to ${shop.name}.`, { orderId: order._id, status: order.status }), createNotification(shop.ownerId, 'New food order', `Order #${order.orderCode} is waiting for your confirmation.`, { orderId: order._id, status: order.status })]);
    return res.status(201).json(format(order));
  } catch (error) { return next(error); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const status = req.body.status; if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid order status.' });
    const order = validId(req.params.id) ? await FoodOrder.findById(req.params.id) : null; if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const shop = await Shop.findById(order.shopId);
    const isShopManager = shop && isOwner(shop, req);
    const isCustomer = order.customerId === userId(req);
    if (!isShopManager && !(isCustomer && status === 'Completed')) return res.status(403).json({ success: false, message: 'You do not manage this order.' });
    order.status = status; if (status === 'Completed') order.completedAt = new Date(); await order.save();
    await createNotification(order.customerId, 'Food order update', `Order #${order.orderCode} is now ${status}.`, { orderId: order._id, status }); return res.json(format(order));
  } catch (error) { return next(error); }
};

export const createTableBooking = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { shopId, date, time, guests, name, phone } = req.body; if (!validId(shopId) || !date || !time) return res.status(400).json({ success: false, message: 'Select a shop, date, and time.' });
    const shop = await Shop.findById(shopId); if (!shop || !shop.isOpen) return res.status(409).json({ success: false, message: 'This shop is not accepting bookings.' });
    const requestedAt = new Date(`${date}T${time}:00`); if (Number.isNaN(requestedAt.getTime()) || requestedAt <= new Date()) return res.status(400).json({ success: false, message: 'Choose a future booking time.' });
    const booking = await TableBooking.create({ customerId: userId(req), customerName: cleanText(name, 100), customerPhone: cleanText(phone, 30), shopId: shop._id.toString(), shopName: shop.name, date, time, guests: String(Math.min(Math.max(Number(guests) || 1, 1), 12)), status: 'Requested' });
    await createNotification(shop.ownerId, 'New table request', `${booking.customerName} requested a table for ${booking.guests}.`, { bookingId: booking._id }); return res.status(201).json(format(booking));
  } catch (error) { return next(error); }
};

export const rateShop = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found.' });

    let order = null;
    const orderId = req.body.orderId;
    if (validId(orderId)) {
      order = await FoodOrder.findById(orderId);
    }
    if (!order && orderId) {
      order = await FoodOrder.findOne({ orderCode: orderId });
    }

    if (order) {
      if (order.isRated) {
        return res.status(400).json({ success: false, message: 'This order has already been reviewed.' });
      }
      if (order.status !== 'Completed') {
        order.status = 'Completed';
        order.completedAt = order.completedAt || new Date();
      }
    }

    const rating = Number(req.body.shopRating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Choose a rating from 1 to 5.' });
    }

    const review = {
      id: crypto.randomUUID(),
      userName: cleanText(req.body.userName, 50) || 'Customer',
      shopRating: rating,
      foodRating: Math.min(Math.max(Number(req.body.foodRating) || rating, 1), 5),
      comment: cleanText(req.body.comment, 500),
      createdAt: new Date()
    };

    shop.reviews = shop.reviews || [];
    shop.reviews.push(review);
    shop.ratingsCount = shop.reviews.length;
    shop.rating = (shop.reviews.reduce((sum, entry) => sum + entry.shopRating, 0) / shop.reviews.length).toFixed(1);

    if (order) {
      order.isRated = true;
      order.ratingDetails = review;
      await Promise.all([shop.save(), order.save()]);
    } else {
      await shop.save();
    }

    return res.json({ success: true, review });
  } catch (error) { return next(error); }
};
