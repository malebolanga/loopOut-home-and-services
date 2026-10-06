/**
 * updateKotaCorner.mjs
 * --------------------
 * Updates "Kota Corner" shop:
 *  1. Removes "Chips" from sides on all meals (chips already come IN the kota)
 *  2. Removes Drinks meals (Pineapple Juice, Coke)
 *  3. Removes "Russian + Chips" standalone meal
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  tag: { type: String, default: 'Popular' },
  image: { type: String, default: '🍱' },
  isAvailable: { type: Boolean, default: true },
  addOns: [{ name: String, price: Number }],
  sides: { type: [String], default: [] }
}, { _id: false });

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: String, distance: String, time: String,
  rating: String, ratingsCount: Number, image: String,
  address: String, phone: String, ownerId: String,
  ownerName: String, isOpen: Boolean, whatsapp: String,
  operatingHours: { openTime: String, closeTime: String, days: [String] },
  meals: [mealSchema],
  reviews: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

async function update() {
  const mongoUri = process.env.MONGO;
  if (!mongoUri) { console.error('❌  MONGO env variable not set.'); process.exit(1); }

  console.log('🔌  Connecting...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10_000 });
  console.log('✅  Connected.\n');

  const shop = await Shop.findOne({ name: /^Kota Corner$/i });
  if (!shop) { console.error('❌  Kota Corner not found.'); process.exit(1); }

  // ① Remove meals: Drinks & Russian + Chips
  const REMOVE_MEALS = ['Pineapple Juice 500ml', 'Coke 500ml', 'Russian + Chips'];
  const before = shop.meals.length;
  shop.meals = shop.meals.filter(m => !REMOVE_MEALS.some(rm => m.name.toLowerCase() === rm.toLowerCase()));
  console.log(`🗑️  Removed ${before - shop.meals.length} meal(s): Drinks + Russian + Chips`);

  // ② Strip "Chips" from sides on remaining meals
  shop.meals = shop.meals.map(m => {
    const filtered = (m.sides || []).filter(s => s.toLowerCase() !== 'chips');
    m.sides = filtered;
    return m;
  });
  console.log('✂️  Removed "Chips" from sides on all Kota Corner meals');

  await shop.save();
  console.log('\n✅  Kota Corner updated successfully!');
  console.log(`   Remaining meals (${shop.meals.length}):`, shop.meals.map(m => m.name).join(', '));
  await mongoose.disconnect();
}

update().catch(err => { console.error('❌  Update failed:', err.message); process.exit(1); });
