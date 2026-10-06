/**
 * seedLunchShops.mjs
 * ------------------
 * Seeds realistic Polokwane local lunch shops into MongoDB for Lunch Day.
 *
 * Safe to run multiple times: skips shops that already exist by name.
 *
 * Usage:
 *   node api/scripts/seedLunchShops.mjs
 *
 * Requires MONGO env variable (loaded from .env automatically).
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';

// ── Schema (mirrors api/models/shop.model.js) ──────────────────────────────

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

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userName: { type: String, default: 'Customer' },
  shopRating: { type: Number, default: 5 },
  foodRating: { type: Number, default: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, default: 'General' },
  distance: { type: String, default: '1.0 km' },
  time: { type: String, default: '20–30 min' },
  rating: { type: String, default: '4.8' },
  ratingsCount: { type: Number, default: 1 },
  image: { type: String, default: '🏪' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  ownerId: { type: String, default: 'guest' },
  ownerName: { type: String, default: 'Store Manager' },
  isOpen: { type: Boolean, default: true },
  whatsapp: { type: String, default: '' },
  operatingHours: {
    openTime: { type: String, default: '08:00' },
    closeTime: { type: String, default: '20:00' },
    days: { type: [String], default: () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
  },
  meals: [mealSchema],
  reviews: [reviewSchema]
}, { timestamps: true });

const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

// ── Helper ─────────────────────────────────────────────────────────────────
const meal = (name, description, price, tag, image, sides = []) => ({
  id: crypto.randomUUID(),
  name,
  description,
  price,
  tag,
  image,
  isAvailable: true,
  addOns: [],
  sides: sides.length > 0 ? sides : [
    'Chakalaka', 'Pap', 'Spinach', 'Cabbage', 'Beets',
    'Salad', 'Atchar', 'Sweet Potato', 'Potatoes', 'Pumpkin'
  ]
});

// ── Seed Data ──────────────────────────────────────────────────────────────
const SHOPS = [
  {
    name: "Kota Corner",
    cuisine: "Kota & Street Food",
    distance: "0.5 km",
    time: "10–15 min",
    rating: "4.9",
    ratingsCount: 47,
    image: "🥪",
    address: "Shop 4, Seshego Zone A, Polokwane",
    phone: "015 222 1001",
    whatsapp: "27721001001",
    ownerName: "Thabo Maleka",
    isOpen: true,
    operatingHours: { openTime: "07:00", closeTime: "18:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat"] },
    meals: [
      meal("Classic Kota", "Quarter loaf filled with Russian, chips, atchaar & cheese. A Polokwane classic.", 35, "Popular", "🥪", ["Atchar","Pap","Chakalaka","Salad"]),
      meal("Dagwood Kota", "Full loaf loaded with 2 Russians, polony, chips, cheese, egg & atchaar.", 65, "Popular", "🥪", ["Atchar","Chakalaka","Salad"]),
      meal("Chicken Kota", "Quarter loaf filled with crispy fried chicken, chips, mayo & atchaar.", 45, "Popular", "🍗", ["Atchar","Chakalaka","Salad","Pap"]),
      meal("Veg Kota", "Quarter loaf with chips, egg, cheese, atchaar & fresh salad. No meat!", 30, "Healthy & Fresh", "🥗", ["Atchar","Salad","Chakalaka"]),
      meal("Polony Kota", "Budget-friendly quarter loaf with polony, chips & atchaar.", 22, "Budget Pick", "🥪", ["Atchar"]),
      meal("Cheese & Egg Kota", "Quarter loaf with fried egg, melted cheese & atchaar.", 28, "Budget Pick", "🥪", ["Atchar","Salad"]),
    ],
    reviews: [
      { id: crypto.randomUUID(), userName: "Lesego M.", shopRating: 5, foodRating: 5, comment: "Best kota in Seshego! Always fresh.", createdAt: new Date() }
    ]
  },
  {
    name: "Mama Dineo's Kitchen",
    cuisine: "Traditional African",
    distance: "0.8 km",
    time: "20–30 min",
    rating: "5.0",
    ratingsCount: 83,
    image: "🍲",
    address: "12 Schoeman Street, Polokwane CBD",
    phone: "015 222 2002",
    whatsapp: "27722002002",
    ownerName: "Dineo Kgomo",
    isOpen: true,
    operatingHours: { openTime: "10:00", closeTime: "15:00", days: ["Mon","Tue","Wed","Thu","Fri"] },
    meals: [
      meal("Pap & Chicken Stew", "Creamy white pap served with tender chicken stew. Includes 3 sides.", 65, "Popular", "🍲", ["Chakalaka","Spinach","Cabbage","Beets","Pumpkin","Sweet Potato","Salad","Pap"]),
      meal("Pap & Beef Stew", "Soft pap with hearty beef stew slow-cooked with tomatoes & onions.", 70, "Popular", "🍲", ["Chakalaka","Spinach","Cabbage","Beets","Pumpkin","Sweet Potato","Salad","Pap"]),
      meal("Mogodu (Tripe) & Pap", "Traditional slow-cooked tripe (mogodu) served with pap. Township favourite.", 75, "Speciality", "🍲", ["Chakalaka","Spinach","Cabbage","Pap"]),
      meal("Mala (Intestines) & Pap", "Soft cleaned intestines cooked the traditional way. Served with pap.", 70, "Speciality", "🍲", ["Chakalaka","Spinach","Pap"]),
      meal("Samp & Beans", "Classic samp and beans slow-cooked with pork knuckle. Served with chakalaka.", 60, "Comfort Food", "🍛", ["Chakalaka","Spinach","Cabbage","Beets"]),
      meal("Grilled Chicken Half", "Spiced & grilled half chicken with your choice of 3 sides.", 80, "Popular", "🍗"),
      meal("Chicken Giblets & Pap", "Tender chicken giblets in tomato gravy served with pap & spinach.", 55, "Budget Pick", "🍲", ["Spinach","Chakalaka","Cabbage","Pap"]),
      meal("Pumpkin & Pap (Vegetarian)", "Sweet pumpkin fritters & steamed pap with 2 vegetable sides.", 45, "Healthy & Fresh", "🎃", ["Spinach","Cabbage","Beets","Chakalaka","Pap"]),
      meal("Mazoe Orange 300ml", "Sweet Mazoe orange cordial diluted.", 12, "Drinks", "🧃", []),
    ],
    reviews: [
      { id: crypto.randomUUID(), userName: "Bongani N.", shopRating: 5, foodRating: 5, comment: "Mama's mogodu hits different. 10/10.", createdAt: new Date() },
      { id: crypto.randomUUID(), userName: "Precious L.", shopRating: 5, foodRating: 5, comment: "Just like home-cooked food. Yummy!", createdAt: new Date() }
    ]
  },
  {
    name: "Tuck Shop Delights",
    cuisine: "Fast Food & Snacks",
    distance: "0.3 km",
    time: "5–10 min",
    rating: "4.7",
    ratingsCount: 29,
    image: "🍟",
    address: "Tuckshop near Capricorn TVET College, Polokwane",
    phone: "015 222 3003",
    whatsapp: "27723003003",
    ownerName: "Sipho Nkosi",
    isOpen: true,
    operatingHours: { openTime: "06:30", closeTime: "17:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat"] },
    meals: [
      meal("Slap Chips (Large)", "Hot, thick-cut township-style chips with salt & vinegar.", 20, "Popular", "🍟", []),
      meal("Slap Chips (Small)", "Hot township-style chips small portion, great value.", 12, "Budget Pick", "🍟", []),
      meal("Boerewors Roll", "Juicy braai wors in a fresh roll with tomato & mustard.", 35, "Popular", "🌭", ["Atchar","Salad"]),
      meal("Vetkoek & Mince", "Deep-fried vetkoek filled with seasoned minced beef.", 20, "Popular", "🥐", ["Chakalaka","Atchar"]),
      meal("Vetkoek & Jam", "Fluffy vetkoek with apricot jam. A sweet classic.", 10, "Budget Pick", "🥐", []),
      meal("Fried Egg Roll", "Freshly fried egg in a white roll with tomato sauce.", 18, "Budget Pick", "🥚", ["Atchar"]),
      meal("Magwinya (Fat Cakes) x3", "Classic deep-fried magwinya. Light, fluffy & delicious.", 15, "Snacks", "🫓", []),
      meal("Kotas Chips & Polony x2", "Quick snack pack chips, polony & atchaar.", 25, "Snacks", "🥪", ["Atchar","Chips"]),
      meal("Freezo / Freeze Pop", "Assorted fruit-flavoured ice lollies.", 5, "Drinks", "🧊", []),
      meal("Canned Drink (Coke/Fanta/Sprite)", "Your choice of chilled canned cold drink.", 18, "Drinks", "🥤", []),
    ],
    reviews: [
      { id: crypto.randomUUID(), userName: "Refilwe T.", shopRating: 4, foodRating: 5, comment: "Cheap and quick. Love the vetkoek!", createdAt: new Date() }
    ]
  },
  {
    name: "Nkosi's Braai Shack",
    cuisine: "Braai & Grills",
    distance: "1.2 km",
    time: "25–35 min",
    rating: "4.8",
    ratingsCount: 61,
    image: "🥩",
    address: "Old Peter Mokaba Stadium Rd, Polokwane",
    phone: "015 222 4004",
    whatsapp: "27724004004",
    ownerName: "Nkosi Dlamini",
    isOpen: true,
    operatingHours: { openTime: "10:00", closeTime: "21:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    meals: [
      meal("Braai Chicken Quarter", "Spiced & braaied quarter chicken with pap & 2 sides.", 70, "Popular", "🍗"),
      meal("Braai Chicken Half", "Juicy half-chicken done on the braai. With pap & 3 sides.", 110, "Popular", "🍗"),
      meal("Boerewors (400g)", "Freshly grilled boerewors served with pap & sides.", 85, "Popular", "🌭"),
      meal("T-Bone Steak (300g)", "Tender T-bone steak grilled to your liking. With pap & 2 sides.", 155, "Speciality", "🥩"),
      meal("Braai Pork Chops (2)", "Marinated pork chops braaied to perfection. With pap & sides.", 95, "Popular", "🥩"),
      meal("Mixed Braai Platter (for 2)", "Chicken quarter + wors + rib + pap & 3 sides. Great for sharing!", 220, "Sharing", "🍽️"),
      meal("Chakalaka & Pap Only", "Vegetarian friendly steamed pap with spicy chakalaka & 2 veg sides.", 40, "Healthy & Fresh", "🌶️", ["Chakalaka","Pap","Spinach","Cabbage","Beets","Pumpkin"]),
      meal("500ml Craft Ginger Beer", "Chilled traditional ginger beer.", 22, "Drinks", "🍶", []),
    ],
    reviews: [
      { id: crypto.randomUUID(), userName: "Zandile M.", shopRating: 5, foodRating: 5, comment: "Best braai spot in Polokwane, hands down.", createdAt: new Date() },
      { id: crypto.randomUUID(), userName: "Thami K.", shopRating: 5, foodRating: 5, comment: "T-bone is amazing! Great value.", createdAt: new Date() }
    ]
  },
  {
    name: "Paledi Wraps & Burgers",
    cuisine: "Burgers & Wraps",
    distance: "0.9 km",
    time: "15–20 min",
    rating: "4.6",
    ratingsCount: 38,
    image: "🍔",
    address: "Paledi Mall Food Court, Polokwane",
    phone: "015 222 5005",
    whatsapp: "27725005005",
    ownerName: "Faith Motsepe",
    isOpen: true,
    operatingHours: { openTime: "09:00", closeTime: "20:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    meals: [
      meal("Classic Beef Burger", "100% beef patty, lettuce, tomato, cheese & house sauce in a toasted bun.", 75, "Popular", "🍔", ["Slap Chips","Onion Rings","Coleslaw","Salad"]),
      meal("Double Smash Burger", "Two smashed beef patties, double cheese, pickles & secret sauce in a crispy bun.", 100, "Popular", "🍔", ["Slap Chips","Onion Rings","Coleslaw"]),
      meal("Chicken Burger", "Crispy fried chicken fillet with lettuce, tomato, pickles & mayo.", 70, "Popular", "🍗", ["Slap Chips","Onion Rings","Coleslaw","Salad"]),
      meal("Veg Burger", "Chickpea & beetroot patty with fresh salad & avocado mayo. 100% plant-based.", 65, "Healthy & Fresh", "🥗", ["Salad","Coleslaw"]),
      meal("Chicken Wrap", "Grilled chicken strips, lettuce, tomato, cheese & garlic mayo in a flour tortilla.", 65, "Popular", "🌯", ["Salad","Coleslaw","Slap Chips"]),
      meal("Beef Wrap", "Seasoned beef strips, peppers, onions & house sauce wrapped in a toasted tortilla.", 70, "Popular", "🌯", ["Salad","Coleslaw","Slap Chips"]),
      meal("Loaded Slap Chips (Large)", "Thick-cut chips loaded with grated cheese, atchar & sauce.", 35, "Sides & Extras", "🍟", ["Atchar","Cheese"]),
      meal("Onion Rings (6)", "Golden crispy onion rings with dipping sauce.", 30, "Sides & Extras", "🧅", []),
      meal("Oreo Milkshake", "Thick, creamy Oreo milkshake made to order.", 55, "Drinks", "🥛", []),
      meal("Fresh Orange Juice", "Freshly squeezed orange juice.", 30, "Drinks", "🍊", []),
    ],
    reviews: [
      { id: crypto.randomUUID(), userName: "Keamo S.", shopRating: 5, foodRating: 4, comment: "Double smash burger is insane! Great food.", createdAt: new Date() }
    ]
  }
];

// ── Main ───────────────────────────────────────────────────────────────────
async function seed() {
  const mongoUri = process.env.MONGO;
  if (!mongoUri) {
    console.error('❌  MONGO env variable is not set. Add it to your .env file.');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10_000 });
  console.log('✅  Connected.\n');

  let inserted = 0;
  let skipped = 0;

  for (const shopData of SHOPS) {
    const safeName = shopData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exists = await Shop.exists({ name: new RegExp(`^${safeName}$`, 'i') });
    if (exists) {
      console.log(`⏭️  Skipped (already exists): ${shopData.name}`);
      skipped++;
      continue;
    }
    await Shop.create(shopData);
    console.log(`✅  Seeded: ${shopData.name} (${shopData.meals.length} meals)`);
    inserted++;
  }

  console.log(`\n🍽️  Seed complete! ${inserted} shop(s) added, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
