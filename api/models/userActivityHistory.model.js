import mongoose from 'mongoose';

const userActivityHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section: { type: String, required: true, enum: ['Home', 'Search', 'Listings', 'Property', 'Services', 'Helpers', 'Food', 'Shops', 'Events', 'Bookings', 'Messages', 'Sell', 'Profile', 'Other'] },
  action: { type: String, required: true, enum: [
    'page_view',
    'search_submitted',
    'booking_started',
    'booking_submitted',
    'property_listing_started',
    'service_listing_started',
    'helper_listing_started',
    'sale_item_started',
    'listing_step_completed',
    'listing_published',
    'food_order_submitted',
    'table_reservation_submitted',
    'item_request_submitted',
    'profile_updated',
  ] },
  pageKey: { type: String, enum: ['home', 'search', 'property', 'service', 'helper', 'food', 'shop', 'event', 'booking', 'messages', 'profile', 'sell', 'other'], default: undefined },
  workflow: { type: String, enum: ['property', 'service', 'helper', 'sale', 'food', 'booking', 'profile'], default: undefined },
  step: { type: String, enum: ['category', 'details', 'pricing', 'availability', 'photos', 'review', 'submitted'], default: undefined },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30, index: true },
}, { versionKey: false });

userActivityHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('UserActivityHistory', userActivityHistorySchema);
