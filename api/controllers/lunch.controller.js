import mongoose from 'mongoose';
import Shop from '../models/shop.model.js';
import FoodOrder from '../models/foodOrder.model.js';
import TableBooking from '../models/tableBooking.model.js';
import Notification from '../models/notification.model.js';

const DEFAULT_SHOPS = [
  {
    id: 'urban-grill',
    name: 'Urban Grill',
    cuisine: 'Grill & Flame',
    distance: '1.2 km',
    time: '20–30 min',
    rating: '4.8',
    image: '🥙',
    address: '124 Main Street, City Centre',
    phone: '+27 82 123 4567',
    meals: [
      { id: 'chicken-wrap', name: 'Chicken wrap', description: 'Grilled chicken, slaw and house sauce', price: 89, tag: 'Popular', image: '🌯' },
      { id: 'beef-bowl', name: 'Beef rice bowl', description: 'Spiced beef, rice, salsa and greens', price: 109, tag: 'New', image: '🍲' },
      { id: 'bbq-ribs', name: 'Flame BBQ Ribs', description: '400g pork ribs with crispy chips', price: 145, tag: 'Chef Special', image: '🍖' },
    ],
  },
  {
    id: 'green-table',
    name: 'The Green Table',
    cuisine: 'Healthy & Vegan',
    distance: '2.1 km',
    time: '25–35 min',
    rating: '4.7',
    image: '🥗',
    address: '45 Eco Park Avenue, Gardens',
    phone: '+27 83 987 6543',
    meals: [
      { id: 'rainbow-bowl', name: 'Rainbow bowl', description: 'Roasted vegetables, quinoa and avocado', price: 95, tag: 'Vegetarian', image: '🥗' },
      { id: 'caesar-salad', name: 'Chicken Caesar salad', description: 'Cos lettuce, parmesan and herb croutons', price: 105, tag: 'Fresh', image: '🥗' },
      { id: 'green-smoothie', name: 'Detox Green Smoothie', description: 'Spinach, green apple, ginger and coconut water', price: 49, tag: 'Drinks', image: '🥤' },
    ],
  },
  {
    id: 'mama-kitchen',
    name: "Mama's Kitchen",
    cuisine: 'Local Favourites',
    distance: '3.4 km',
    time: '30–40 min',
    rating: '4.9',
    image: '🍛',
    address: '89 Heritage Lane, Township Hub',
    phone: '+27 71 456 7890',
    meals: [
      { id: 'chicken-pap', name: 'Chicken & pap', description: 'Grilled chicken, chakalaka and creamy pap', price: 99, tag: 'Local favourite', image: '🍗' },
      { id: 'beef-stew', name: 'Beef stew plate', description: 'Slow-cooked beef with rice and steamed veg', price: 115, tag: 'Hearty', image: '🥘' },
      { id: 'mogodu-combo', name: 'Mogodu Special', description: 'Traditional tripe served with warm dumpling', price: 110, tag: 'Traditional', image: '🍲' },
    ],
  },
];

// In-memory fallback stores when MongoDB is disconnected
let inMemoryShops = [...DEFAULT_SHOPS];
let inMemoryOrders = [];
let inMemoryBookings = [];

const generateCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LNCH-${num}`;
};

// GET /api/lunch/shops
export const getShops = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('[LUNCH API] MongoDB not connected. Returning default shops.');
      return res.status(200).json(inMemoryShops);
    }

    let shops = await Shop.find().sort({ createdAt: -1 });
    if (!shops || shops.length === 0) {
      shops = await Shop.insertMany(DEFAULT_SHOPS);
    }
    const formatted = shops.map((s) => ({ id: s._id.toString(), ...s.toObject() }));
    inMemoryShops = formatted;
    return res.status(200).json(formatted);
  } catch (error) {
    console.error('[LUNCH API] Error fetching shops:', error?.message || error);
    return res.status(200).json(inMemoryShops);
  }
};

// POST /api/lunch/shops
export const createShop = async (req, res) => {
  try {
    const {
      name, cuisine, distance, time, rating, image, address, phone, ownerId,
      ownerName, meals, isOpen, whatsapp, operatingHours
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }

    const trimmedName = name.trim();

    // Check duplicate in memory or DB
    const isDupInMemory = inMemoryShops.some(
      (s) => (s.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDupInMemory) {
      return res.status(409).json({
        success: false,
        message: `A shop named "${trimmedName}" already exists. Please use a unique shop name.`
      });
    }

    if (mongoose.connection.readyState === 1) {
      const existingShop = await Shop.findOne({ 
        name: { $regex: new RegExp(`^${trimmedName.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
      });

      if (existingShop) {
        return res.status(409).json({ 
          success: false, 
          message: `A shop named "${trimmedName}" already exists. Please use a unique shop name.` 
        });
      }

      const shop = new Shop({
        name: trimmedName,
        cuisine: cuisine || 'General',
        distance: distance || '1.0 km',
        time: time || '20–30 min',
        rating: rating || '5.0',
        image: image || '🏪',
        address: address || '',
        phone: phone || '',
        ownerId: ownerId || 'guest',
        ownerName: ownerName || 'Store Manager',
        isOpen: isOpen !== false,
        whatsapp: whatsapp || '',
        operatingHours: operatingHours || undefined,
        meals: meals || []
      });

      const saved = await shop.save();
      const formatted = { id: saved._id.toString(), ...saved.toObject() };
      inMemoryShops.unshift(formatted);
      return res.status(201).json(formatted);
    }

    // Fallback memory creation
    const newShop = {
      id: `shop-${Date.now()}`,
      name: trimmedName,
      cuisine: cuisine || 'General',
      distance: distance || '1.0 km',
      time: time || '20–30 min',
      rating: rating || '5.0',
      image: image || '🏪',
      address: address || '',
      phone: phone || '',
      ownerId: ownerId || 'guest',
      ownerName: ownerName || 'Store Manager',
      isOpen: isOpen !== false,
      whatsapp: whatsapp || '',
      operatingHours: operatingHours || { openTime: '08:00', closeTime: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      meals: meals || [],
      createdAt: new Date().toISOString()
    };
    inMemoryShops.unshift(newShop);
    return res.status(201).json(newShop);
  } catch (error) {
    console.error('[LUNCH API] Error creating shop:', error?.message || error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating shop' });
  }
};

// POST /api/lunch/shops/:id/meals
export const addMealToShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, tag, image } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Meal name and price are required' });
    }

    const newMeal = {
      id: `meal-${Date.now()}`,
      name,
      description: description || '',
      price: Number(price),
      tag: tag || 'Popular',
      image: image || '🍱'
    };

    if (mongoose.connection.readyState === 1) {
      const shop = await Shop.findById(id);
      if (shop) {
        shop.meals.push(newMeal);
        await shop.save();
      }
    }

    // Update in memory as well
    inMemoryShops = inMemoryShops.map((s) => {
      if (s.id === id || s._id === id) {
        return { ...s, meals: [...(s.meals || []), newMeal] };
      }
      return s;
    });

    return res.status(200).json(newMeal);
  } catch (error) {
    console.error('[LUNCH API] Error adding meal:', error?.message || error);
    return res.status(500).json({ success: false, message: error.message || 'Error adding meal' });
  }
};

// GET /api/lunch/orders
export const getOrders = async (req, res) => {
  try {
    const { customerId, shopId } = req.query;
    if (mongoose.connection.readyState !== 1) {
      let filtered = [...inMemoryOrders];
      if (customerId) filtered = filtered.filter((o) => o.customerId === customerId);
      if (shopId) filtered = filtered.filter((o) => o.shopId === shopId);
      return res.status(200).json(filtered);
    }

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (shopId) filter.shopId = shopId;

    const orders = await FoodOrder.find(filter).sort({ createdAt: -1 });
    const formatted = orders.map((o) => ({ id: o._id.toString(), ...o.toObject() }));
    inMemoryOrders = formatted;
    return res.status(200).json(formatted);
  } catch (error) {
    console.error('[LUNCH API] Error fetching orders:', error?.message || error);
    return res.status(200).json(inMemoryOrders);
  }
};

// POST /api/lunch/orders
export const createOrder = async (req, res) => {
  try {
    const { 
      customerId, customerName, customerPhone, shopId, shopName, shopImage,
      items, total, fulfilment, deliveryAddress, deliveryNotes, orderComments, paymentMethod
    } = req.body;

    if (!shopId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Shop ID and items are required' });
    }

    const orderCode = generateCode();
    const orderData = {
      orderCode,
      customerId: customerId || 'guest',
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '',
      shopId,
      shopName: shopName || 'Restaurant',
      shopImage: shopImage || '🍱',
      items: items || [],
      total: Number(total || 0),
      fulfilment: fulfilment || 'pickup',
      deliveryAddress: deliveryAddress || '',
      deliveryNotes: deliveryNotes || '',
      orderComments: orderComments || '',
      paymentMethod: paymentMethod || 'counter',
      paymentStatus: paymentMethod === 'online' ? 'Paid Online' : 'Pay at Counter / Cash',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const inMemoryShop = inMemoryShops.find((shop) => shop.id === shopId || shop._id === shopId);
    if (inMemoryShop?.isOpen === false) {
      return res.status(409).json({ success: false, message: 'This shop is currently closed and cannot accept orders.' });
    }

    if (mongoose.connection.readyState === 1) {
      const shop = mongoose.Types.ObjectId.isValid(shopId)
        ? await Shop.findById(shopId).select('isOpen')
        : null;
      if (shop?.isOpen === false) {
        return res.status(409).json({ success: false, message: 'This shop is currently closed and cannot accept orders.' });
      }
      const newOrder = new FoodOrder(orderData);
      const saved = await newOrder.save();
      const formatted = { id: saved._id.toString(), ...saved.toObject() };
      inMemoryOrders.unshift(formatted);
      return res.status(201).json(formatted);
    }

    const fallbackOrder = { id: `order-${Date.now()}`, ...orderData };
    inMemoryOrders.unshift(fallbackOrder);
    return res.status(201).json(fallbackOrder);
  } catch (error) {
    console.error('[LUNCH API] Error creating order:', error?.message || error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating order' });
  }
};

// PATCH /api/lunch/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status parameter is required' });
    }

    let updatedOrder = null;

    if (mongoose.connection.readyState === 1) {
      const order = await FoodOrder.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (order) {
        updatedOrder = { id: order._id.toString(), ...order.toObject() };
        inMemoryOrders = inMemoryOrders.map((o) => (o.id === id || o._id === id ? updatedOrder : o));
      }
    }

    if (!updatedOrder) {
      // Fallback in-memory update
      inMemoryOrders = inMemoryOrders.map((o) => {
        if (o.id === id || o._id === id) {
          return { ...o, status, updatedAt: new Date().toISOString() };
        }
        return o;
      });
      updatedOrder = inMemoryOrders.find((o) => o.id === id || o._id === id) || { id, status };
    }

    // Create notification for customer if valid customerId exists
    if (updatedOrder && updatedOrder.customerId && updatedOrder.customerId !== 'guest') {
      const targetUserId = updatedOrder.customerId;
      const isReady = status === 'Ready for Collection';
      const isCompleted = status === 'Completed';

      let notifTitle = `Order Status: ${status}`;
      let notifMsg = `Your order #${updatedOrder.orderCode || ''} from "${updatedOrder.shopName || 'the shop'}" status is now ${status}.`;

      if (isReady) {
        notifTitle = '🍱 Food Ready to Collect!';
        notifMsg = `Your food order #${updatedOrder.orderCode || ''} from "${updatedOrder.shopName || 'the restaurant'}" is ready for collection!`;
      } else if (isCompleted) {
        notifTitle = '✅ Food Order Completed';
        notifMsg = `Thank you! Your order #${updatedOrder.orderCode || ''} from "${updatedOrder.shopName || 'the restaurant'}" has been completed.`;
      }

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(targetUserId)) {
        try {
          await Notification.create({
            userId: targetUserId,
            type: 'booking',
            title: notifTitle,
            message: notifMsg,
            data: {
              orderId: updatedOrder.id || updatedOrder._id,
              orderCode: updatedOrder.orderCode,
              shopName: updatedOrder.shopName,
              status: status
            }
          });
        } catch (notifErr) {
          console.error('[LUNCH API] Error creating status notification:', notifErr?.message || notifErr);
        }
      }
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('[LUNCH API] Error updating order status:', error?.message || error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating order status' });
  }
};

// POST /api/lunch/bookings
export const createTableBooking = async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, shopId, shopName, date, time, guests } = req.body;
    if (!shopId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Shop ID, date, and time are required' });
    }

    const bookingData = {
      customerId: customerId || 'guest',
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || '',
      shopId,
      shopName: shopName || 'Restaurant',
      date,
      time,
      guests: guests || '2',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const booking = new TableBooking(bookingData);
      const saved = await booking.save();
      const formatted = { id: saved._id.toString(), ...saved.toObject() };
      inMemoryBookings.unshift(formatted);
      return res.status(201).json(formatted);
    }

    const fallbackBooking = { id: `booking-${Date.now()}`, ...bookingData };
    inMemoryBookings.unshift(fallbackBooking);
    return res.status(201).json(fallbackBooking);
  } catch (error) {
    console.error('[LUNCH API] Error creating booking:', error?.message || error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating booking' });
  }
};

// PUT /api/lunch/shops/:id
export const updateShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, cuisine, distance, time, image, address, phone, isOpen, whatsapp, operatingHours } = req.body;
    const updates = {};
    for (const [key, value] of Object.entries({ name, cuisine, distance, time, image, address, phone, isOpen, whatsapp, operatingHours })) {
      if (value !== undefined) updates[key] = value;
    }

    if (mongoose.connection.readyState === 1) {
      const updated = await Shop.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
      if (updated) {
        const formatted = { id: updated._id.toString(), ...updated.toObject() };
        inMemoryShops = inMemoryShops.map((s) => (s.id === id || s._id === id ? formatted : s));
        return res.status(200).json(formatted);
      }
    }

    inMemoryShops = inMemoryShops.map((s) => {
      if (s.id === id || s._id === id) {
        return { ...s, ...updates, updatedAt: new Date().toISOString() };
      }
      return s;
    });

    const shop = inMemoryShops.find((s) => s.id === id || s._id === id);
    res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};

// PUT /api/lunch/shops/:id/meals/:mealId
export const updateMealInShop = async (req, res, next) => {
  try {
    const { id, mealId } = req.params;
    const { name, description, price, tag, image } = req.body;

    if (mongoose.connection.readyState === 1) {
      const shop = await Shop.findById(id);
      if (shop) {
        const meal = shop.meals.find(m => m.id === mealId);
        if (meal) {
          meal.name = name || meal.name;
          meal.description = description !== undefined ? description : meal.description;
          meal.price = price !== undefined ? Number(price) : meal.price;
          meal.tag = tag || meal.tag;
          meal.image = image || meal.image;
          await shop.save();
        }
      }
    }

    inMemoryShops = inMemoryShops.map((s) => {
      if (s.id === id || s._id === id) {
        const updatedMeals = s.meals.map((m) => {
          if (m.id === mealId) {
            return {
              ...m,
              name: name || m.name,
              description: description !== undefined ? description : m.description,
              price: price !== undefined ? Number(price) : m.price,
              tag: tag || m.tag,
              image: image || m.image
            };
          }
          return m;
        });
        return { ...s, meals: updatedMeals };
      }
      return s;
    });

    const targetShop = inMemoryShops.find((s) => s.id === id || s._id === id);
    const targetMeal = targetShop?.meals.find((m) => m.id === mealId);
    res.status(200).json(targetMeal);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/lunch/shops/:id/meals/:mealId
export const deleteMealFromShop = async (req, res, next) => {
  try {
    const { id, mealId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const shop = await Shop.findById(id);
      if (shop) {
        shop.meals = shop.meals.filter(m => m.id !== mealId);
        await shop.save();
      }
    }

    inMemoryShops = inMemoryShops.map((s) => {
      if (s.id === id || s._id === id) {
        return { ...s, meals: s.meals.filter(m => m.id !== mealId) };
      }
      return s;
    });

    res.status(200).json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/lunch/shops/:id/rate
export const rateShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderId, shopRating = 5, foodRating = 5, comment = '', userName = 'Valued Customer' } = req.body;

    const newReview = {
      id: `rev-${Date.now()}`,
      userName,
      shopRating: Number(shopRating),
      foodRating: Number(foodRating),
      comment: comment.trim(),
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const shop = await Shop.findById(id);
      if (shop) {
        shop.reviews = shop.reviews || [];
        shop.reviews.push(newReview);
        const currentCount = shop.ratingsCount || shop.reviews.length || 1;
        const currentScore = parseFloat(shop.rating) || 5.0;
        const newScore = (((currentScore * currentCount) + Number(shopRating)) / (currentCount + 1)).toFixed(1);
        shop.rating = newScore.toString();
        shop.ratingsCount = currentCount + 1;
        await shop.save();
      }

      if (orderId) {
        await FoodOrder.findByIdAndUpdate(orderId, {
          isRated: true,
          ratingDetails: newReview
        });
      }
    }

    // In-memory fallback sync
    inMemoryShops = inMemoryShops.map((s) => {
      if (s.id === id || s._id === id) {
        const reviews = [...(s.reviews || []), newReview];
        const currentCount = s.ratingsCount || reviews.length || 1;
        const currentScore = parseFloat(s.rating) || 5.0;
        const newScore = (((currentScore * currentCount) + Number(shopRating)) / (currentCount + 1)).toFixed(1);
        return {
          ...s,
          rating: newScore.toString(),
          ratingsCount: currentCount + 1,
          reviews
        };
      }
      return s;
    });

    if (orderId) {
      inMemoryOrders = inMemoryOrders.map((o) => {
        if (o.id === orderId || o._id === orderId) {
          return { ...o, isRated: true, ratingDetails: newReview };
        }
        return o;
      });
    }

    const updatedShop = inMemoryShops.find((s) => s.id === id || s._id === id);
    res.status(200).json({ success: true, shop: updatedShop, review: newReview });
  } catch (error) {
    next(error);
  }
};
