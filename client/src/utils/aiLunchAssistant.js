/**
 * AI Lunch Assistant Utility
 * Provides intelligent food recommendations for buyers & AI menu item generation for tuck shop vendors.
 */

// Food, Drinks, Beers & Tuck Shop Emojis Dictionary
export const FOOD_EMOJIS = [
  // Fast Food & Local Favorites
  { emoji: '🍔', name: 'Burger', category: 'fastfood' },
  { emoji: '🍟', name: 'Fries', category: 'fastfood' },
  { emoji: '🍕', name: 'Pizza', category: 'fastfood' },
  { emoji: '🌭', name: 'Hot Dog / Sausage', category: 'fastfood' },
  { emoji: '🥪', name: 'Sandwich / Kota', category: 'fastfood' },
  { emoji: '🌮', name: 'Taco', category: 'spicy' },
  { emoji: '🌯', name: 'Burrito', category: 'fastfood' },
  { emoji: '🥙', name: 'Wrap / Shawarma', category: 'healthy' },
  { emoji: '🍿', name: 'Popcorn', category: 'snack' },
  { emoji: '🥨', name: 'Pretzel', category: 'snack' },

  // Meats, Braai & Flame
  { emoji: '🍗', name: 'Crispy Chicken', category: 'meat' },
  { emoji: '🍖', name: 'Flame Ribs', category: 'meat' },
  { emoji: '🥩', name: 'Steak & Braai', category: 'meat' },
  { emoji: '🥓', name: 'Bacon', category: 'meat' },
  { emoji: '🍢', name: 'Skewer / Kebab', category: 'meat' },
  { emoji: '🍤', name: 'Fried Prawns / Shrimp', category: 'seafood' },

  // Traditional, Stews & Rice
  { emoji: '🍲', name: 'Traditional Stew / Pap', category: 'traditional' },
  { emoji: '🥘', name: 'Curry / Potjie', category: 'traditional' },
  { emoji: '🍛', name: 'Spicy Rice Bowl', category: 'traditional' },
  { emoji: '🍚', name: 'Steamed Rice', category: 'traditional' },
  { emoji: '🥣', name: 'Soup Bowl', category: 'traditional' },
  { emoji: '🧆', name: 'Falafel / Meatballs', category: 'traditional' },
  { emoji: '🥟', name: 'Dumpling / Vetkoek', category: 'traditional' },
  { emoji: '🍜', name: 'Noodles / Ramen', category: 'warm' },
  { emoji: '🍝', name: 'Spaghetti / Pasta', category: 'warm' },
  { emoji: '🍱', name: 'Lunch Box Combo', category: 'combo' },
  { emoji: '🥡', name: 'Takeout Box', category: 'combo' },

  // Beers, Soda Cans & Cold Drinks
  { emoji: '🍺', name: 'Cold Beer Mug', category: 'drink' },
  { emoji: '🍻', name: 'Cheering Beer Mugs', category: 'drink' },
  { emoji: '🥤', name: 'Soda / Cold Can Drink', category: 'drink' },
  { emoji: '🧃', name: 'Juice Box', category: 'drink' },
  { emoji: '🧋', name: 'Bubble Tea / Boba', category: 'drink' },
  { emoji: '🍷', name: 'Wine Glass', category: 'drink' },
  { emoji: '🥂', name: 'Champagne Cheers', category: 'drink' },
  { emoji: '🍸', name: 'Cocktail Drink', category: 'drink' },
  { emoji: '🍹', name: 'Tropical Smoothie / Punch', category: 'drink' },
  { emoji: '🍾', name: 'Sparkling Champagne', category: 'drink' },
  { emoji: '☕', name: 'Hot Coffee / Espresso', category: 'drink' },
  { emoji: '🍵', name: 'Green Tea', category: 'drink' },

  // Desserts, Bakery & Treats
  { emoji: '🍰', name: 'Cake Slice', category: 'sweet' },
  { emoji: '🍩', name: 'Donut', category: 'sweet' },
  { emoji: '🍦', name: 'Soft Serve Ice Cream', category: 'sweet' },
  { emoji: '🍨', name: 'Ice Cream Sundae', category: 'sweet' },
  { emoji: '🧁', name: 'Cupcake', category: 'sweet' },
  { emoji: '🥧', name: 'Fresh Pie', category: 'sweet' },
  { emoji: '🍪', name: 'Chocolate Chip Cookie', category: 'sweet' },
  { emoji: '🍫', name: 'Chocolate Bar', category: 'sweet' },
  { emoji: '🥞', name: 'Pancakes', category: 'breakfast' },
  { emoji: '🥐', name: 'Croissant', category: 'bakery' },
  { emoji: '🥖', name: 'French Baguette', category: 'bakery' },

  // Healthy & Fresh Greens
  { emoji: '🥗', name: 'Fresh Salad', category: 'healthy' },
  { emoji: '🥑', name: 'Fresh Avocado', category: 'healthy' },
  { emoji: '🍎', name: 'Red Apple', category: 'healthy' },
  { emoji: '🍉', name: 'Watermelon Slice', category: 'healthy' },

  // Shop & Kitchen Icons
  { emoji: '🏪', name: 'Tuck Shop / Store', category: 'shop' },
  { emoji: '🍽️', name: 'Plate & Cutlery', category: 'shop' },
  { emoji: '👨‍🍳', name: 'Chef', category: 'shop' }
];

export const PRESET_MOODS = [
  { id: 'comfort', label: '🍔 Comfort & Hearty', icon: '🍔', tag: 'Fast & Filling' },
  { id: 'healthy', label: '🥗 Healthy & Fresh', icon: '🥗', tag: 'Low Cal & Clean' },
  { id: 'budget', label: '⚡ Quick & Budget (< R80)', icon: '⚡', tag: 'Pocket Friendly' },
  { id: 'spicy', label: '🌶️ Bold & Spicy', icon: '🌶️', tag: 'Hot & Zesty' },
  { id: 'meat', label: '🍗 Meat & Braai Lovers', icon: '🍗', tag: 'Protein Packed' },
  { id: 'traditional', label: '🍲 Traditional & Homecooked', icon: '🍲', tag: 'Local Pride' }
];

/**
 * AI Generator for Tuck Shop & Restaurant Vendors
 */
export function generateVendorMealAI(rawInput) {
  const input = (rawInput || '').trim().toLowerCase();

  if (!input) {
    return { name: '🔥 Signature Chef Special', description: 'Freshly prepared daily meal with rich local flavors.', price: '75', tag: 'Chef Special', category: 'Full Menu', image: '🍱' };
  }

  let name = rawInput || 'Special Daily Combo';
  let description = 'Prepared fresh daily with premium ingredients and authentic house seasonings.';
  let price = '65';
  let tag = 'Popular';
  let category = 'Full Menu';
  let image = '🍱';

  // Keywords detection
  if (input.includes('kota') || input.includes('spatlo')) {
    name = `🔥 Supreme Deluxe Kota`;
    description = `Loaded local Kota packed with crispy chips, melted cheese, polony, vienna, egg, and signature house sauce.`;
    price = '55';
    tag = '🔥 Hot Seller';
    category = 'Light Food';
    image = '🥪';
  } else if (input.includes('chicken') || input.includes('wing') || input.includes('drum')) {
    name = `🍗 Honey BBQ Grilled Chicken Meal`;
    description = `Juicy flame-grilled chicken served with golden crispy fries or pap and chakalaka.`;
    price = '85';
    tag = 'Popular';
    category = 'African Cuisines';
    image = '🍗';
  } else if (input.includes('burger') || input.includes('cheese')) {
    name = `🍔 Gourmet Smash Beef Burger`;
    description = `Double beef patty topped with melted cheddar, caramelized onions, fresh lettuce, and tangy burger sauce.`;
    price = '75';
    tag = 'Top Rated';
    category = 'Light Food';
    image = '🍔';
  } else if (input.includes('pap') || input.includes('mogodu') || input.includes('hardbody') || input.includes('stew') || input.includes('tripe')) {
    name = `🍲 Traditional Slow-Cooked Stew & Pap`;
    description = `Authentic slow-cooked tender meat served with fluffy white pap, chakalaka, and seasoned spinach.`;
    price = '80';
    tag = '👑 Local Classic';
    category = 'African Cuisines';
    image = '🍲';
  } else if (input.includes('pizza') || input.includes('slice')) {
    name = `🍕 Loaded Meat Lovers Pizza`;
    description = `Stone-baked pizza with rich tomato base, mozzarella, pepperoni, bacon, and herbs.`;
    price = '110';
    tag = 'Popular';
    category = 'Light Food';
    image = '🍕';
  } else if (input.includes('salad') || input.includes('wrap') || input.includes('veggie') || input.includes('vegan') || input.includes('pie')) {
    name = `🥗 Fresh Garden Salad & Snack`;
    description = `Crispy fresh greens, grilled veggies, dressing, and delicious light snack bites.`;
    price = '50';
    tag = '🥗 Healthy Choice';
    category = 'Light Food';
    image = '🥗';
  } else if (input.includes('fruit') || input.includes('apple') || input.includes('banana') || input.includes('berries')) {
    name = `🍎 Seasonal Fresh Fruit Bowl`;
    description = `Sweet diced fresh seasonal fruits served cold with mint.`;
    price = '35';
    tag = '🍎 Fresh & Healthy';
    category = 'Fruits';
    image = '🍎';
  } else if (input.includes('drink') || input.includes('juice') || input.includes('smoothie') || input.includes('coke') || input.includes('soda')) {
    name = `🥤 Ice Cold Soft Drink Refresher`;
    description = `Chilled refreshing beverage to perfectly complement your lunch meal.`;
    price = '20';
    tag = 'Refreshing';
    category = 'Soft Drinks';
    image = '🥤';
  } else {
    name = rawInput.charAt(0).toUpperCase() + rawInput.slice(1) + ' Special';
    description = `Special house dish prepared fresh upon order with delicious local sides.`;
    price = '70';
    tag = 'Chef Special';
    category = 'Full Menu';
    image = '🍱';
  }

  return { name, description, price, tag, category, image };
}

/**
 * AI Matchmaker for Customers looking for food
 */
export function generateUserLunchAIRecommendation(shops = [], selectedMood = 'comfort', customText = '') {
  if (!shops || shops.length === 0) return [];

  // Extract all meals with shop context
  let allMeals = [];
  shops.forEach(shop => {
    if (shop.meals && Array.isArray(shop.meals)) {
      shop.meals.forEach(meal => {
        allMeals.push({
          ...meal,
          shopId: shop.id,
          shopName: shop.name,
          shopCuisine: shop.cuisine,
          shopTime: shop.time,
          shopRating: shop.rating || '4.8'
        });
      });
    }
  });

  if (allMeals.length === 0) return [];

  const textLower = (customText || '').toLowerCase();
  const mood = selectedMood || 'comfort';

  // Filter or score meals
  let scoredMeals = allMeals.map(meal => {
    let score = 0;
    let matchReason = 'Great all-round lunch option';

    const nameLower = (meal.name || '').toLowerCase();
    const descLower = (meal.description || '').toLowerCase();
    const priceNum = Number(meal.price || 0);

    // Custom search matching
    if (textLower) {
      if (nameLower.includes(textLower) || descLower.includes(textLower)) {
        score += 10;
        matchReason = `Direct match for your search "${customText}"`;
      }
    }

    // Mood based scoring
    if (mood === 'budget') {
      if (priceNum <= 60) {
        score += 8;
        matchReason = `Pocket-friendly choice under R60 (Only R${priceNum})`;
      } else if (priceNum <= 80) {
        score += 5;
        matchReason = `Great value meal at R${priceNum}`;
      }
    } else if (mood === 'spicy') {
      if (nameLower.includes('spicy') || descLower.includes('spicy') || nameLower.includes('curry') || meal.image === '🌮' || nameLower.includes('chili')) {
        score += 8;
        matchReason = `Hot & zesty flavor hit packed with authentic spices`;
      }
    } else if (mood === 'healthy') {
      if (nameLower.includes('salad') || nameLower.includes('wrap') || nameLower.includes('veggie') || meal.tag?.includes('Healthy') || meal.image === '🥗' || meal.image === '🥙') {
        score += 8;
        matchReason = `Clean, nutrient-packed fresh meal for your workday`;
      }
    } else if (mood === 'meat') {
      if (nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('steak') || nameLower.includes('braai') || nameLower.includes('burger') || meal.image === '🥩' || meal.image === '🍗') {
        score += 8;
        matchReason = `High protein meat feast prepared fresh`;
      }
    } else if (mood === 'traditional') {
      if (nameLower.includes('pap') || nameLower.includes('stew') || nameLower.includes('mogodu') || nameLower.includes('curry') || meal.image === '🍲') {
        score += 8;
        matchReason = `Authentic local homecooked taste prepared with passion`;
      }
    } else {
      // Comfort food
      if (nameLower.includes('kota') || nameLower.includes('burger') || nameLower.includes('pizza') || meal.tag?.includes('Hot') || meal.tag?.includes('Popular')) {
        score += 6;
        matchReason = `Top customer favorite for a satisfying lunch breakdown`;
      }
    }

    // Add small random noise for variety
    score += Math.random() * 2;

    return { meal, score, matchReason };
  });

  // Sort descending by score
  scoredMeals.sort((a, b) => b.score - a.score);

  // Return top 3 unique meals
  return scoredMeals.slice(0, 3).map(item => ({
    ...item.meal,
    aiReason: item.matchReason
  }));
}
