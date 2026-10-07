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
  category: { type: String, default: '' },
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
const meal = (name, description, price, tag, image, sides = [], category = '') => ({
  id: crypto.randomUUID(),
  name,
  description,
  price,
  tag,
  category,
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
      meal("Classic Kota", "Quarter loaf filled with Russian, chips, atchaar & cheese. A Polokwane classic.", 35, "Popular", "🥪", ["Atchar","Pap","Chakalaka","Salad"], "Light Food"),
      meal("Dagwood Kota", "Full loaf loaded with 2 Russians, polony, chips, cheese, egg & atchaar.", 65, "Popular", "🥪", ["Atchar","Chakalaka","Salad"], "Light Food"),
      meal("Chicken Kota", "Quarter loaf filled with crispy fried chicken, chips, mayo & atchaar.", 45, "Popular", "🍗", ["Atchar","Chakalaka","Salad","Pap"], "Light Food"),
      meal("Classic Beef Burger", "Juicy grilled beef patty, melted cheddar, lettuce and tomato.", 45, "Light Food", "🍔", ["Slap Chips"], "Light Food"),
      meal("Pepper Steak Pie", "Flaky golden baked pie with seasoned pepper steak filling.", 30, "Light Food", "🥧", ["Salad"], "Light Food"),
      meal("Veg Kota Salad", "Quarter loaf or bowl with chips, egg, cheese, atchaar & fresh crisp salad.", 30, "Healthy & Fresh", "🥗", ["Atchar","Salad","Chakalaka"], "Light Food"),
      meal("Pap & Wors Plate", "Steamed white pap served with grilled boerewors, chakalaka & gravy.", 50, "African Cuisines", "🍲", ["Chakalaka","Pap","Salad"], "African Cuisines"),
      meal("Fresh Fruit Bowl", "Sweet sliced seasonal apples, bananas, grapes & oranges.", 25, "Fruits", "🍎", [], "Fruits"),
      meal("Soft Drinks Can (Coke/Sprite/Fanta)", "Chilled 330ml cold can drink.", 18, "Soft Drinks", "🥤", [], "Soft Drinks"),
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
      meal("Pap & Chicken Stew", "Creamy white pap served with tender chicken stew. Includes 3 sides.", 65, "Popular", "🍲", ["Chakalaka","Spinach","Cabbage","Beets","Pumpkin","Sweet Potato","Salad","Pap"], "African Cuisines"),
      meal("Pap & Beef Stew", "Soft pap with hearty beef stew slow-cooked with tomatoes & onions.", 70, "Popular", "🍲", ["Chakalaka","Spinach","Cabbage","Beets","Pumpkin","Sweet Potato","Salad","Pap"], "African Cuisines"),
      meal("Mogodu (Tripe) & Pap", "Traditional slow-cooked tripe (mogodu) served with pap. Township favourite.", 75, "Speciality", "🍲", ["Chakalaka","Spinach","Cabbage","Pap"], "African Cuisines"),
      meal("Mala (Intestines) & Pap", "Soft cleaned intestines cooked the traditional way. Served with pap.", 70, "Speciality", "🍲", ["Chakalaka","Spinach","Pap"], "African Cuisines"),
      meal("Samp & Beans", "Classic samp and beans slow-cooked with pork knuckle. Served with chakalaka.", 60, "Comfort Food", "🍛", ["Chakalaka","Spinach","Cabbage","Beets"], "African Cuisines"),
      meal("Fresh Garden Green Salad", "Crispy garden lettuce, cucumbers, tomatoes & house herb dressing.", 35, "Light Food", "🥗", ["Salad"], "Light Food"),
      meal("Fresh Fruit Salad Cup", "Chilled diced seasonal fruits with mint.", 28, "Fruits", "🍎", [], "Fruits"),
      meal("Mazoe Orange 300ml", "Sweet Mazoe orange cordial diluted.", 12, "Soft Drinks", "🧃", [], "Soft Drinks"),
      meal("Stoney Ginger Beer Can", "Extra strong ginger kick, chilled 330ml.", 18, "Soft Drinks", "🥤", [], "Soft Drinks"),
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
      meal("Slap Chips (Large)", "Hot, thick-cut township-style chips with salt & vinegar.", 20, "Popular", "🍟", [], "Light Food"),
      meal("Slap Chips (Small)", "Hot township-style chips small portion, great value.", 12, "Budget Pick", "🍟", [], "Light Food"),
      meal("Boerewors Roll", "Juicy braai wors in a fresh roll with tomato & mustard.", 35, "Popular", "🌭", ["Atchar","Salad"], "Light Food"),
      meal("Vetkoek & Mince", "Deep-fried vetkoek filled with seasoned minced beef.", 20, "Popular", "🥐", ["Chakalaka","Atchar"], "Light Food"),
      meal("Vetkoek & Jam", "Fluffy vetkoek with apricot jam. A sweet classic.", 10, "Budget Pick", "🥐", [], "Light Food"),
      meal("Fried Egg Roll", "Freshly fried egg in a white roll with tomato sauce.", 18, "Budget Pick", "🥚", ["Atchar"], "Light Food"),
      meal("Magwinya (Fat Cakes) x3", "Classic deep-fried magwinya. Light, fluffy & delicious.", 15, "Snacks", "🫓", [], "Light Food"),
      meal("Kotas Chips & Polony x2", "Quick snack pack chips, polony & atchaar.", 25, "Snacks", "🥪", ["Atchar","Chips"], "Light Food"),
      meal("Fresh Fruit Apple & Orange Pack", "Fresh juicy red apple and sweet orange.", 15, "Fruits", "🍎", [], "Fruits"),
      meal("Freezo / Freeze Pop", "Assorted fruit-flavoured ice lollies.", 5, "Soft Drinks", "🧊", [], "Soft Drinks"),
      meal("Canned Drink (Coke/Fanta/Sprite)", "Your choice of chilled canned cold drink.", 18, "Soft Drinks", "🥤", [], "Soft Drinks"),
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
      meal("Braai Chicken Quarter", "Spiced & braaied quarter chicken with pap & 2 sides.", 70, "Popular", "🍗", ["Chakalaka","Pap","Salad"], "African Cuisines"),
      meal("Braai Chicken Half", "Juicy half-chicken done on the braai. With pap & 3 sides.", 110, "Popular", "🍗", ["Chakalaka","Pap","Salad"], "African Cuisines"),
      meal("Boerewors (400g)", "Freshly grilled boerewors served with pap & sides.", 85, "Popular", "🌭", ["Chakalaka","Pap"], "African Cuisines"),
      meal("T-Bone Steak (300g)", "Tender T-bone steak grilled to your liking. With pap & 2 sides.", 155, "Speciality", "🥩", ["Chakalaka","Pap","Salad"], "African Cuisines"),
      meal("Braai Pork Chops (2)", "Marinated pork chops braaied to perfection. With pap & sides.", 95, "Popular", "🥩", ["Chakalaka","Pap"], "African Cuisines"),
      meal("Mixed Braai Platter (for 2)", "Chicken quarter + wors + rib + pap & 3 sides. Great for sharing!", 220, "Sharing", "🍽️", ["Chakalaka","Pap","Salad"], "African Cuisines"),
      meal("Chakalaka & Pap Only", "Vegetarian friendly steamed pap with spicy chakalaka & 2 veg sides.", 40, "Healthy & Fresh", "🌶️", ["Chakalaka","Pap","Spinach","Cabbage","Beets","Pumpkin"], "African Cuisines"),
      meal("Fresh Fruit Slice Platter", "Chilled sliced seasonal fruits for refreshing after-braai dessert.", 35, "Fruits", "🍉", [], "Fruits"),
      meal("500ml Craft Ginger Beer", "Chilled traditional ginger beer.", 22, "Soft Drinks", "🍶", [], "Soft Drinks"),
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
      meal("Classic Beef Burger", "100% beef patty, lettuce, tomato, cheese & house sauce in a toasted bun.", 75, "Popular", "🍔", ["Slap Chips","Onion Rings","Coleslaw","Salad"], "Light Food"),
      meal("Double Smash Burger", "Two smashed beef patties, double cheese, pickles & secret sauce in a crispy bun.", 100, "Popular", "🍔", ["Slap Chips","Onion Rings","Coleslaw"], "Light Food"),
      meal("Chicken Burger", "Crispy fried chicken fillet with lettuce, tomato, pickles & mayo.", 70, "Popular", "🍗", ["Slap Chips","Onion Rings","Coleslaw","Salad"], "Light Food"),
      meal("Veg Burger", "Chickpea & beetroot patty with fresh salad & avocado mayo. 100% plant-based.", 65, "Healthy & Fresh", "🥗", ["Salad","Coleslaw"], "Light Food"),
      meal("Chicken Wrap", "Grilled chicken strips, lettuce, tomato, cheese & garlic mayo in a flour tortilla.", 65, "Popular", "🌯", ["Salad","Coleslaw","Slap Chips"], "Light Food"),
      meal("Beef Wrap", "Seasoned beef strips, peppers, onions & house sauce wrapped in a toasted tortilla.", 70, "Popular", "🌯", ["Salad","Coleslaw","Slap Chips"], "Light Food"),
      meal("Loaded Slap Chips (Large)", "Thick-cut chips loaded with grated cheese, atchar & sauce.", 35, "Sides & Extras", "🍟", ["Atchar","Cheese"], "Light Food"),
      meal("Onion Rings (6)", "Golden crispy onion rings with dipping sauce.", 30, "Sides & Extras", "🧅", [], "Light Food"),
      meal("Fresh Fruit Salad Bowl", "Diced strawberries, mango, banana, and crisp apples.", 40, "Fruits", "🍎", [], "Fruits"),
      meal("Oreo Milkshake", "Thick, creamy Oreo milkshake made to order.", 55, "Soft Drinks", "🥛", [], "Soft Drinks"),
      meal("Fresh Orange Juice", "Freshly squeezed orange juice.", 30, "Soft Drinks", "🍊", [], "Soft Drinks"),
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
