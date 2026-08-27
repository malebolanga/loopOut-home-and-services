import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';
import Sell from '../models/sell.model.js';
import Shop from '../models/shop.model.js';
import { errorHandler } from '../utils/error.js';

function escapeRegex(text) {
  if (!text) return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Common South African cities, towns, universities, and suburbs
const SA_LOCATIONS = [
  'polokwane', 'mankweng', 'seshego', 'turfloop', 'tzaneen', 'mokopane', 'lebowakgomo',
  'thohoyandou', 'giyani', 'pretoria', 'centurion', 'hatfield', 'arcadia', 'johannesburg',
  'sandton', 'rosebank', 'braamfontein', 'soweto', 'midrand', 'cape town', 'stellenbosch',
  'bellville', 'durban', 'umhlanga', 'gqeberha', 'port elizabeth', 'bloemfontein',
  'rustenburg', 'nelspruit', 'mbombela', 'potchefstroom', 'vanderbijlpark', 'kimberley',
  'east london', 'pietermaritzburg', 'roodepoort', 'randburg', 'kempton park', 'boksburg',
  'benoni', 'edenvale', 'germiston', 'alberton', 'somerset west', 'paarl', 'george'
];

// Helper classification keywords
const HELPER_CATEGORIES = {
  barber: ['barber', 'haircut', 'fade', 'beard', 'trim', 'salon', 'clipper', 'taper', 'shave'],
  beauty: ['beauty', 'nails', 'makeup', 'lashes', 'manicure', 'pedicure', 'skincare', 'facial', 'lashes', 'acrylic', 'gel nail', 'waxing', 'glam', 'hair styling', 'braids', 'wig', 'weave'],
  domestic: ['cleaner', 'cleaning', 'maid', 'domestic', 'housekeeper', 'laundry', 'ironing', 'spring clean', 'office clean', 'deep clean'],
  tutor: ['tutor', 'maths', 'mathematics', 'physics', 'science', 'tutoring', 'exam', 'teacher', 'homework', 'accounting', 'english', 'calculus', 'statistics', 'grade 12', 'matric'],
  chef: ['chef', 'cook', 'catering', 'private chef', 'meal prep', 'baker', 'cake', 'baking', 'pastry', 'dinner', 'cuisine'],
  photography: ['photo', 'photographer', 'photoshoot', 'studio', 'portrait', 'camera', 'videography', 'video shoot', 'wedding photo', 'matric dance photo'],
  tattoo: ['tattoo', 'ink', 'piercing', 'tattooist', 'body art', 'flash tattoo']
};

// Service classification keywords
const SERVICE_CATEGORIES = {
  carwash: ['car wash', 'carwash', 'auto detailing', 'valet', 'car cleaning', 'engine wash', 'polish', 'ceramic coating'],
  storage: ['storage', 'storage unit', 'store goods', 'warehouse', 'self storage', 'container storage', 'lockup'],
  moving: ['moving', 'movers', 'relocation', 'logistics', 'transport furniture', 'bakkie hire', 'truck hire', 'removals'],
  transport: ['transport', 'shuttle', 'ride', 'delivery', 'courier', 'cab', 'airport shuttle'],
  landscaping: ['gardening', 'garden', 'lawn', 'landscaping', 'tree felling', 'grass cutting', 'irrigation'],
  handyman: ['plumber', 'plumbing', 'electrician', 'electrical', 'handyman', 'appliance repair', 'fix roof', 'painter', 'painting', 'geyser', 'tiling', 'carpenter', 'welding']
};

// Property / Stay keywords
const PROPERTY_KEYWORDS = [
  'room', 'rooms', 'stay', 'stays', 'hotel', 'hotels', 'house', 'houses', 'apartment', 'apartments',
  'rent', 'rental', 'rentals', 'property', 'properties', 'accommodation', 'lodge', 'lodges',
  'student res', 'student room', 'student accommodation', 'guesthouse', 'flat', 'flats', 'residence',
  'bachelor', 'ensuite', 'complex', 'overnight', 'vacation stay', 'resort', 'commercial property', 'office space'
];

// Event keywords
const EVENT_KEYWORDS = [
  'event', 'events', 'party', 'parties', 'concert', 'concerts', 'festival', 'festivals',
  'live show', 'comedy show', 'fashion show', 'tickets', 'ticket', 'gig', 'gigs',
  'hiking', 'hike', 'art exhibition', 'workshop', 'music festival', 'dj night', 'club night'
];

// Sell / Marketplace keywords
const SELL_KEYWORDS = [
  'for sale', 'items for sale', 'selling', 'phone', 'iphone', 'samsung', 'laptop', 'macbook',
  'furniture', 'couch', 'sofa', 'bed', 'desk', 'clothes', 'sneakers', 'shoes', 'textbook',
  'textbooks', 'electronics', 'smart tv', 'fridge', 'second hand', 'used car', 'appliance', 'gadget'
];

// Food / Shop keywords
const SHOP_KEYWORDS = [
  'food', 'lunch', 'dinner', 'restaurant', 'meal', 'meals', 'eat', 'burger', 'pizza',
  'bakery', 'takeaway', 'fast food', 'order food', 'snack', 'cafe', 'breakfast'
];

/**
 * Format image URL with reliable fallback based on type/category
 */
function normalizeImageUrl(item, type) {
  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0 && item.imageUrls[0]) {
    return item.imageUrls[0];
  }
  if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
    return item.image;
  }

  // Sensible default imagery by category
  switch (type) {
    case 'listing':
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop';
    case 'helper':
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop';
    case 'service':
      return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop';
    case 'event':
      return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop';
    case 'sell':
      return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop';
    case 'shop':
      return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop';
  }
}

/**
 * Normalizes helper link to match exact App.jsx frontend route
 */
function getHelperLink(helper) {
  const type = (helper.type || 'helper').toLowerCase();
  switch (type) {
    case 'chef':
      return `/chef/${helper._id}`;
    case 'tutor':
      return `/privatetutor/${helper._id}`;
    case 'barber':
      return `/barber/${helper._id}`;
    case 'beauty':
      return `/beauty/${helper._id}`;
    case 'photography':
      return `/photography/${helper._id}`;
    case 'tattoo':
      return `/tattoo/${helper._id}`;
    default:
      return `/helper/${helper._id}`;
  }
}

/**
 * Normalizes service link to match exact App.jsx frontend route
 */
function getServiceLink(service) {
  const type = (service.type || 'service').toLowerCase();
  if (type === 'carwash') return `/carwash/${service._id}`;
  if (type === 'storage') return `/storage/${service._id}`;
  return `/service/${service._id}`;
}

/**
 * LoopBot AI Controller - Multi-Domain Neural & Database Search Engine
 */
export const getAiResponse = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return next(errorHandler(400, 'Prompt is required'));
    }

    const rawPrompt = prompt.trim();
    const lowerPrompt = rawPrompt.toLowerCase();

    // ── 1. GREETINGS & INTRODUCTIONS ──
    if (/^(hi|hello|hey|greetings|howzit|dumelang|sawubona|molo|who are you|what can you do|loopbot)$/i.test(lowerPrompt) ||
        (lowerPrompt.length < 20 && (lowerPrompt.includes('hi loopbot') || lowerPrompt.includes('hello loopbot') || lowerPrompt.includes('hey loopbot')))) {
      return res.status(200).json({
        success: true,
        botName: "LoopBot",
        answer: `👋 **Hello! I'm LoopBot**, your intelligent loopOut Marketplace Copilot & AI Concierge.\n\n` +
          `I can search across our entire database in real time for:\n\n` +
          `• 🏡 **Properties & Student Rooms** (Polokwane, Mankweng, Pretoria, JHB, Cape Town, etc.)\n` +
          `• 💇 **Verified Helpers & Freelancers** (Barbers, Hair/Braids, Beauty, Chefs, Tutors, Cleaners, Photographers)\n` +
          `• 🚗 **Local Services** (Car Wash & Detailing, Storage Units, Moving & Handyman)\n` +
          `• 🎉 **Events & Experiences** (Concerts, Festivals, Sports, Hiking)\n` +
          `• 🛍️ **Marketplace Deals** (Phones, Laptops, Furniture, Textbooks)\n` +
          `• 🛡️ **Escrow Protection & Booking Assistance**\n\n` +
          `**What would you like to find or explore today?**`,
        actionItems: [],
        suggestedFollowUps: [
          "Find student rooms in Mankweng",
          "Book a barber in Polokwane",
          "Find mobile car wash",
          "How does Escrow protection work?"
        ],
        timestamp: new Date().toISOString()
      });
    }

    // ── 2. ESCROW, SECURITY & TRUST QUESTIONS ──
    if (
      lowerPrompt.includes('escrow') || lowerPrompt.includes('payment') || lowerPrompt.includes('safe') ||
      lowerPrompt.includes('scam') || lowerPrompt.includes('security') || lowerPrompt.includes('refund') ||
      lowerPrompt.includes('cancel') || lowerPrompt.includes('guarantee') || lowerPrompt.includes('protection')
    ) {
      return res.status(200).json({
        success: true,
        botName: "LoopBot",
        answer: `### 🛡️ **loopOut Smart Escrow & Buyer Protection**\n\n` +
          `Your safety, booking funds, and transactions are **100% protected** on loopOut:\n\n` +
          `1. **Vault Holding**: When you pay for any room, helper, or service, funds are securely vaulted in Escrow. The provider does **not** receive your money upfront.\n` +
          `2. **Milestone & Completion Release**: Funds are released only after the service is successfully delivered or your check-in is verified.\n` +
          `3. **24-Hour Cancellation Policy**: Cancel eligible bookings up to 24 hours in advance for a fast, hassle-free refund.\n` +
          `4. **Dispute Intervention**: If a host/provider doesn't deliver or the listing is inaccurate, our 24/7 Trust & Safety Team steps in to resolve or refund immediately.\n` +
          `5. **Payment Methods**: We support Visa, Mastercard, Ozow Instant EFT, and LoopPoints.`,
        actionItems: [],
        suggestedFollowUps: [
          "How do I verify my ID?",
          "Find verified rooms",
          "How do hosts get paid?",
          "Book a verified helper"
        ],
        timestamp: new Date().toISOString()
      });
    }

    // ── 3. HOSTING / SELLING / BECOMING A HELPER ──
    if (
      lowerPrompt.includes('how to host') || lowerPrompt.includes('how to sell') ||
      lowerPrompt.includes('become a helper') || lowerPrompt.includes('list my property') ||
      lowerPrompt.includes('earn on loopout') || lowerPrompt.includes('register business')
    ) {
      return res.status(200).json({
        success: true,
        botName: "LoopBot",
        answer: `### 🚀 **Grow Your Business & Earn on loopOut**\n\n` +
          `Join thousands of verified Hosts, Freelancers, and Service Providers across South Africa:\n\n` +
          `• **Free to List**: List your rental property, beauty salon, mobile car wash, or tutoring services with zero upfront listing fees.\n` +
          `• **Verified Badge**: Complete 2-minute ID verification to earn the blue trust badge and attract 3x more bookings.\n` +
          `• **Guaranteed Escrow Payouts**: You get paid reliably straight to your South African bank account once services are fulfilled.\n` +
          `• **Host Dashboard**: Manage bookings, customer messages, earnings, and reviews in one real-time dashboard.\n\n` +
          `Ready to start? Head to the **Host Tools** or **Create Listing** page in the top menu!`,
        actionItems: [],
        suggestedFollowUps: [
          "Verify my identity",
          "Go to Create Listing",
          "View Host Earnings",
          "Find helpers near me"
        ],
        timestamp: new Date().toISOString()
      });
    }

    // ── 4. NLP QUERY PARSING & ENTITY EXTRACTION ──

    // A. Detect Location
    let detectedLocation = null;
    for (const loc of SA_LOCATIONS) {
      if (lowerPrompt.includes(loc)) {
        detectedLocation = loc;
        break;
      }
    }

    // B. Detect Budget / Price
    let extractedBudget = null;
    const budgetMatch = rawPrompt.match(/(?:budget(?:\s+of)?\s+|under\s+|below\s+|around\s+|max\s+|r\s*|r)(\d[\d,\s]*)/i);
    if (budgetMatch && budgetMatch[1]) {
      const parsed = parseInt(budgetMatch[1].replace(/[\s,]/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 20 && parsed <= 50000000) {
        extractedBudget = parsed;
      }
    }

    // C. Detect Specific Helper Category
    let matchedHelperCategory = null;
    for (const [cat, keywords] of Object.entries(HELPER_CATEGORIES)) {
      if (keywords.some(k => lowerPrompt.includes(k))) {
        matchedHelperCategory = cat;
        break;
      }
    }

    // D. Detect Specific Service Category
    let matchedServiceCategory = null;
    for (const [cat, keywords] of Object.entries(SERVICE_CATEGORIES)) {
      if (keywords.some(k => lowerPrompt.includes(k))) {
        matchedServiceCategory = cat;
        break;
      }
    }

    // E. Detect Domain Intents
    const isPropertyIntent = PROPERTY_KEYWORDS.some(k => lowerPrompt.includes(k));
    const isHelperIntent = !!matchedHelperCategory || lowerPrompt.includes('helper') || lowerPrompt.includes('freelancer') || lowerPrompt.includes('hire');
    const isServiceIntent = !!matchedServiceCategory || lowerPrompt.includes('service') || lowerPrompt.includes('repair') || lowerPrompt.includes('install');
    const isEventIntent = EVENT_KEYWORDS.some(k => lowerPrompt.includes(k));
    const isSellIntent = SELL_KEYWORDS.some(k => lowerPrompt.includes(k));
    const isShopIntent = SHOP_KEYWORDS.some(k => lowerPrompt.includes(k));

    // Has a specific domain intent?
    const hasSpecificDomainIntent = isPropertyIntent || isHelperIntent || isServiceIntent || isEventIntent || isSellIntent || isShopIntent;

    // F. Extract Clean Search Tokens for Full-Text Search
    const stopWords = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
      'any', 'are', 'aren', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
      'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
      'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
      'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
      'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let', 'me',
      'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
      'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
      'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
      'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
      'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we',
      'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
      'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'find', 'looking', 'look',
      'want', 'search', 'give', 'show', 'need', 'please', 'tell', 'available', 'near',
      'everything', 'anything', 'something', 'place', 'places', 'item', 'items', 'stuff',
      'options', 'option', 'things', 'thing', 'somewhere', 'nearby', 'around'
    ]);

    const searchTokens = lowerPrompt
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w))
      .filter(w => !detectedLocation || !detectedLocation.toLowerCase().includes(w));

    // Helper to build location + token search filters
    const buildRegexQuery = (fields) => {
      const conditions = [];
      if (detectedLocation) {
        conditions.push({
          $or: [
            { address: { $regex: escapeRegex(detectedLocation), $options: 'i' } },
            { near: { $regex: escapeRegex(detectedLocation), $options: 'i' } }
          ]
        });
      }

      if (searchTokens.length > 0) {
        const tokenOrs = searchTokens.map(token => {
          const esc = escapeRegex(token);
          return {
            $or: fields.map(f => ({ [f]: { $regex: esc, $options: 'i' } }))
          };
        });
        conditions.push({ $or: tokenOrs.map(t => t.$or).flat() });
      }

      return conditions.length > 0 ? { $and: conditions } : {};
    };

    // ── 5. TARGETED & BALANCED PARALLEL DATABASE QUERIES ──
    const queryPromises = [];

    // 1. HELPERS
    if (isHelperIntent || !hasSpecificDomainIntent) {
      let helperFilter = {};
      if (matchedHelperCategory) {
        helperFilter.type = matchedHelperCategory;
      }
      if (detectedLocation) {
        helperFilter.$or = [
          { address: { $regex: escapeRegex(detectedLocation), $options: 'i' } },
          { near: { $regex: escapeRegex(detectedLocation), $options: 'i' } }
        ];
      }
      if (extractedBudget) {
        helperFilter.regularPrice = { $lte: extractedBudget };
      }

      queryPromises.push(
        Helper.find(helperFilter)
          .sort({ rating: -1, createdAt: -1 })
          .limit(8)
          .lean()
          .then(async (res) => {
            if (res.length === 0 && matchedHelperCategory) {
              return { type: 'helper', data: await Helper.find({ type: matchedHelperCategory }).sort({ rating: -1 }).limit(6).lean() };
            }
            return { type: 'helper', data: res };
          })
          .catch(() => ({ type: 'helper', data: [] }))
      );
    }

    // 2. SERVICES
    if (isServiceIntent || !hasSpecificDomainIntent) {
      let serviceFilter = {};
      if (matchedServiceCategory) {
        serviceFilter.type = matchedServiceCategory;
      }
      if (detectedLocation) {
        serviceFilter.$or = [
          { address: { $regex: escapeRegex(detectedLocation), $options: 'i' } },
          { near: { $regex: escapeRegex(detectedLocation), $options: 'i' } }
        ];
      }
      if (extractedBudget) {
        serviceFilter.regularPrice = { $lte: extractedBudget };
      }

      queryPromises.push(
        Service.find(serviceFilter)
          .sort({ rating: -1, createdAt: -1 })
          .limit(8)
          .lean()
          .then(async (res) => {
            if (res.length === 0 && matchedServiceCategory) {
              return { type: 'service', data: await Service.find({ type: matchedServiceCategory }).sort({ rating: -1 }).limit(6).lean() };
            }
            return { type: 'service', data: res };
          })
          .catch(() => ({ type: 'service', data: [] }))
      );
    }

    // 3. PROPERTIES / LISTINGS
    if (isPropertyIntent || !hasSpecificDomainIntent) {
      let listingFilter = buildRegexQuery(['name', 'description', 'address', 'near', 'kind', 'type']);
      if (extractedBudget) {
        listingFilter.regularPrice = { $lte: extractedBudget };
      }
      if (lowerPrompt.includes('rent') || lowerPrompt.includes('room') || lowerPrompt.includes('student')) {
        listingFilter.type = { $in: ['rent', 'room', 'rooms', 'complex', 'commercial'] };
      } else if (lowerPrompt.includes('overnight') || lowerPrompt.includes('hotel') || lowerPrompt.includes('vacation')) {
        listingFilter.type = { $in: ['over', 'resort'] };
      }

      queryPromises.push(
        Listing.find(listingFilter)
          .sort({ isPromoted: -1, rating: -1, createdAt: -1 })
          .limit(8)
          .lean()
          .then(async (res) => {
            if (res.length === 0 && detectedLocation) {
              return { type: 'listing', data: await Listing.find({ address: { $regex: escapeRegex(detectedLocation), $options: 'i' } }).limit(6).lean() };
            }
            return { type: 'listing', data: res };
          })
          .catch(() => ({ type: 'listing', data: [] }))
      );
    }

    // 4. EVENTS
    if (isEventIntent || !hasSpecificDomainIntent) {
      let eventFilter = buildRegexQuery(['name', 'description', 'address', 'near', 'type', 'host']);
      if (extractedBudget) {
        eventFilter.regularPrice = { $lte: extractedBudget };
      }

      queryPromises.push(
        Event.find(eventFilter)
          .sort({ date: 1, createdAt: -1 })
          .limit(6)
          .lean()
          .then(async (res) => {
            if (res.length === 0 && isEventIntent) {
              return { type: 'event', data: await Event.find().sort({ createdAt: -1 }).limit(4).lean() };
            }
            return { type: 'event', data: res };
          })
          .catch(() => ({ type: 'event', data: [] }))
      );
    }

    // 5. MARKETPLACE / SELL ITEMS
    if (isSellIntent || !hasSpecificDomainIntent) {
      let sellFilter = buildRegexQuery(['title', 'description', 'category', 'address']);
      if (extractedBudget) {
        sellFilter.price = { $lte: extractedBudget };
      }

      queryPromises.push(
        Sell.find(sellFilter)
          .sort({ createdAt: -1 })
          .limit(6)
          .lean()
          .then(async (res) => {
            if (res.length === 0 && isSellIntent) {
              return { type: 'sell', data: await Sell.find().sort({ createdAt: -1 }).limit(4).lean() };
            }
            return { type: 'sell', data: res };
          })
          .catch(() => ({ type: 'sell', data: [] }))
      );
    }

    // 6. FOOD & SHOPS
    if (isShopIntent || (!hasSpecificDomainIntent && detectedLocation)) {
      let shopFilter = buildRegexQuery(['name', 'cuisine', 'address', 'meals.name', 'meals.description']);

      queryPromises.push(
        Shop.find(shopFilter)
          .sort({ ratingsCount: -1, createdAt: -1 })
          .limit(4)
          .lean()
          .then(async (res) => {
            if (res.length === 0 && isShopIntent) {
              return { type: 'shop', data: await Shop.find().sort({ createdAt: -1 }).limit(3).lean() };
            }
            return { type: 'shop', data: res };
          })
          .catch(() => ({ type: 'shop', data: [] }))
      );
    }

    // Await all parallel search operations
    const searchResults = await Promise.allSettled(queryPromises);

    let rawListings = [];
    let rawHelpers = [];
    let rawServices = [];
    let rawEvents = [];
    let rawSells = [];
    let rawShops = [];

    searchResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const { type, data } = result.value;
        if (type === 'listing') rawListings = data;
        if (type === 'helper') rawHelpers = data;
        if (type === 'service') rawServices = data;
        if (type === 'event') rawEvents = data;
        if (type === 'sell') rawSells = data;
        if (type === 'shop') rawShops = data;
      }
    });

    // ── 6. SMART RELAXED FALLBACK (IF 0 TOTAL RESULTS) ──
    const totalFound = rawListings.length + rawHelpers.length + rawServices.length + rawEvents.length + rawSells.length + rawShops.length;

    if (totalFound === 0) {
      if (isHelperIntent) {
        rawHelpers = await Helper.find().sort({ rating: -1, createdAt: -1 }).limit(4).lean().catch(() => []);
      } else if (isServiceIntent) {
        rawServices = await Service.find().sort({ rating: -1, createdAt: -1 }).limit(4).lean().catch(() => []);
      } else if (isPropertyIntent) {
        rawListings = await Listing.find().sort({ isPromoted: -1, rating: -1, createdAt: -1 }).limit(4).lean().catch(() => []);
      } else if (isEventIntent) {
        rawEvents = await Event.find().sort({ createdAt: -1 }).limit(4).lean().catch(() => []);
      } else if (isSellIntent) {
        rawSells = await Sell.find().sort({ createdAt: -1 }).limit(4).lean().catch(() => []);
      } else {
        const [featuredListings, featuredHelpers, featuredServices] = await Promise.all([
          Listing.find().sort({ isPromoted: -1, rating: -1, createdAt: -1 }).limit(2).lean().catch(() => []),
          Helper.find().sort({ rating: -1, createdAt: -1 }).limit(2).lean().catch(() => []),
          Service.find().sort({ rating: -1, createdAt: -1 }).limit(2).lean().catch(() => [])
        ]);
        rawListings = featuredListings;
        rawHelpers = featuredHelpers;
        rawServices = featuredServices;
      }
    }

    // ── 7. TRANSFORM DATABASE RESULTS INTO RICH ACTION ITEMS (ORDERED BY DOMAIN RELEVANCE) ──
    const formattedListings = rawListings.map(p => {
      let priceStr = 'Price on Request';
      if (p.regularPrice) {
        const formatted = p.regularPrice.toLocaleString();
        priceStr = p.type === 'over' ? `R${formatted}/night` : p.type === 'rent' ? `R${formatted}/pm` : `R${formatted}`;
      }
      return {
        id: p._id,
        title: p.name,
        price: priceStr,
        location: p.address || p.near || 'South Africa',
        type: 'listing',
        category: p.type === 'over' ? 'Overnight Stay' : p.type === 'rent' ? 'Property Rental' : p.type === 'complex' ? 'Student Complex' : 'Property',
        imageUrl: normalizeImageUrl(p, 'listing'),
        link: `/listing/${p._id}`,
        rating: p.rating || 4.9,
        badge: p.isPromoted ? 'Featured' : 'Verified Host'
      };
    });

    const formattedHelpers = rawHelpers.map(h => {
      const typeCapitalized = h.type ? h.type.charAt(0).toUpperCase() + h.type.slice(1) : 'Helper';
      return {
        id: h._id,
        title: h.name,
        price: h.regularPrice ? `R${h.regularPrice.toLocaleString()}` : 'From R150',
        location: h.address || h.near || 'South Africa',
        type: 'helper',
        category: `${typeCapitalized} Specialist`,
        imageUrl: normalizeImageUrl(h, 'helper'),
        link: getHelperLink(h),
        rating: h.rating || 4.9,
        badge: 'Escrow Protected'
      };
    });

    const formattedServices = rawServices.map(s => {
      const typeCapitalized = s.type ? s.type.charAt(0).toUpperCase() + s.type.slice(1) : 'Service';
      return {
        id: s._id,
        title: s.name,
        price: s.regularPrice ? `R${s.regularPrice.toLocaleString()}` : 'Custom Quote',
        location: s.address || s.near || 'South Africa',
        type: 'service',
        category: `${typeCapitalized} Service`,
        imageUrl: normalizeImageUrl(s, 'service'),
        link: getServiceLink(s),
        rating: s.rating || 4.8,
        badge: 'Verified Business'
      };
    });

    const formattedEvents = rawEvents.map(e => ({
      id: e._id,
      title: e.name,
      price: e.regularPrice ? `R${e.regularPrice.toLocaleString()} / ticket` : 'Free Entry',
      location: e.address || e.near || 'South Africa',
      type: 'event',
      category: e.type ? `${e.type.toUpperCase()} Event` : 'Live Event',
      imageUrl: normalizeImageUrl(e, 'event'),
      link: `/event/${e._id}`,
      rating: 5.0,
      badge: e.date || 'Upcoming'
    }));

    const formattedSells = rawSells.map(s => ({
      id: s._id,
      title: s.title,
      price: s.price ? `R${s.price.toLocaleString()}` : 'R0',
      location: s.address || 'South Africa',
      type: 'sell',
      category: s.category ? `Marketplace • ${s.category.toUpperCase()}` : 'Item For Sale',
      imageUrl: normalizeImageUrl(s, 'sell'),
      link: `/sell-item/${s._id}`,
      rating: 4.8,
      badge: s.condition || 'Verified Seller'
    }));

    const formattedShops = rawShops.map(sh => ({
      id: sh._id,
      title: sh.name,
      price: sh.cuisine || 'Fast Food & Bakery',
      location: sh.address || 'South Africa',
      type: 'shop',
      category: 'Food & Meals',
      imageUrl: normalizeImageUrl(sh, 'shop'),
      link: '/lunch',
      rating: parseFloat(sh.rating) || 5.0,
      badge: sh.isOpen ? 'Open Now' : 'Store'
    }));

    // Prioritize order according to user intent
    let actionItems = [];
    if (isHelperIntent) {
      actionItems = [...formattedHelpers, ...formattedServices, ...formattedListings, ...formattedEvents, ...formattedSells, ...formattedShops];
    } else if (isServiceIntent) {
      actionItems = [...formattedServices, ...formattedHelpers, ...formattedListings, ...formattedEvents, ...formattedSells, ...formattedShops];
    } else if (isPropertyIntent) {
      actionItems = [...formattedListings, ...formattedHelpers, ...formattedServices, ...formattedEvents, ...formattedSells, ...formattedShops];
    } else if (isEventIntent) {
      actionItems = [...formattedEvents, ...formattedListings, ...formattedHelpers, ...formattedServices, ...formattedSells, ...formattedShops];
    } else if (isSellIntent) {
      actionItems = [...formattedSells, ...formattedListings, ...formattedHelpers, ...formattedServices, ...formattedEvents, ...formattedShops];
    } else if (isShopIntent) {
      actionItems = [...formattedShops, ...formattedListings, ...formattedHelpers, ...formattedServices, ...formattedEvents, ...formattedSells];
    } else {
      actionItems = [...formattedListings, ...formattedHelpers, ...formattedServices, ...formattedEvents, ...formattedSells, ...formattedShops];
    }

    const topActionItems = actionItems.slice(0, 8);

    // ── 8. SYNTHESIZE CONVERSATIONAL ANSWER ──
    const locDisplay = detectedLocation ? detectedLocation.charAt(0).toUpperCase() + detectedLocation.slice(1) : '';
    const budgetDisplay = extractedBudget ? `under **R${extractedBudget.toLocaleString()}**` : '';

    let answer = "";
    const breakdown = [];

    if (rawHelpers.length > 0) breakdown.push(`💇 **${rawHelpers.length}** Verified Helper${rawHelpers.length > 1 ? 's' : ''}`);
    if (rawServices.length > 0) breakdown.push(`🚗 **${rawServices.length}** Service Provider${rawServices.length > 1 ? 's' : ''}`);
    if (rawListings.length > 0) breakdown.push(`🏡 **${rawListings.length}** Property/Stay listing${rawListings.length > 1 ? 's' : ''}`);
    if (rawEvents.length > 0) breakdown.push(`🎉 **${rawEvents.length}** Event${rawEvents.length > 1 ? 's' : ''}`);
    if (rawSells.length > 0) breakdown.push(`🛍️ **${rawSells.length}** Marketplace Item${rawSells.length > 1 ? 's' : ''}`);
    if (rawShops.length > 0) breakdown.push(`🍱 **${rawShops.length}** Food & Meal option${rawShops.length > 1 ? 's' : ''}`);

    if (topActionItems.length > 0) {
      const summaryContext = [
        locDisplay ? `in **${locDisplay}**` : '',
        budgetDisplay
      ].filter(Boolean).join(' ');

      answer = `✨ I searched our live database and found **${topActionItems.length} matching options** ${summaryContext ? `${summaryContext} ` : ''}on loopOut:\n\n` +
        breakdown.map(b => `• ${b}`).join('\n') + `\n\n` +
        `All bookings and transactions are secured by **loopOut Escrow Protection** (funds are only released when you confirm satisfactory service). Click any card below to view full details and book!`;
    } else {
      answer = `I searched our database for "${rawPrompt}"${locDisplay ? ` in ${locDisplay}` : ''}${budgetDisplay ? ` ${budgetDisplay}` : ''}.\n\n` +
        `While there are no exact matches for this specific query yet, our marketplace is updated daily! You can check the **Explore** page or post your exact requirement in **Looking For** so verified providers can reach out to you directly.`;
    }

    // ── 9. DYNAMIC FOLLOW-UP SUGGESTIONS ──
    const suggestedFollowUps = [];
    if (locDisplay) {
      suggestedFollowUps.push(`Show all properties in ${locDisplay}`);
      suggestedFollowUps.push(`Find barbers & beauty in ${locDisplay}`);
      suggestedFollowUps.push(`Car wash services in ${locDisplay}`);
    } else {
      suggestedFollowUps.push("Find student rooms in Mankweng");
      suggestedFollowUps.push("Hire a verified chef");
      suggestedFollowUps.push("Explore upcoming events");
    }
    suggestedFollowUps.push("How does Escrow protect my payment?");

    return res.status(200).json({
      success: true,
      botName: "LoopBot",
      totalMatches: topActionItems.length,
      answer,
      actionItems: topActionItems,
      suggestedFollowUps: suggestedFollowUps.slice(0, 4),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("LoopBot Controller Error:", error);
    next(error);
  }
};
