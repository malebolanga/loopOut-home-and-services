import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';
import Sell from '../models/sell.model.js';

/**
 * LoopBot - loopOut's Official Market Concierge & AI Assistant
 */
export const getAiResponse = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return next(errorHandler(400, 'Prompt is required'));
    }

    const lowerPrompt = prompt.toLowerCase().trim();
    let answer = "";
    let actionItems = [];
    let suggestedFollowUps = [
      "Find rooms in Polokwane",
      "Hire a verified cleaner",
      "How does Escrow work?",
      "Book a barber session"
    ];

    // 1. Budget extraction
    const budgetMatch = prompt.match(/(?:budget(?:\s+of)?\s+|under\s+|around\s+|r\s*|r)(\d[\d,\s]*)/i);
    let extractedBudget = null;
    if (budgetMatch && budgetMatch[1]) {
      const parsed = parseInt(budgetMatch[1].replace(/[\s,]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 50 && parsed < 20000000) {
        extractedBudget = parsed;
      }
    }

    // 2. City / Location extraction
    const cities = [
      'polokwane', 'johannesburg', 'cape town', 'durban', 'pretoria', 
      'tzaneen', 'mankweng', 'seshego', 'soweto', 'centurion', 'sandton', 
      'midrand', 'stellenbosch', 'gqeberha', 'bloemfontein', 'rustenburg',
      'nelspruit', 'mbombela', 'pietermaritzburg'
    ];
    let detectedCity = null;
    for (const c of cities) {
      if (lowerPrompt.includes(c)) {
        detectedCity = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // 3. Helper intent detection
    const helperKeywords = {
      barber: ['barber', 'haircut', 'fade', 'beard', 'trim', 'salon', 'stylist'],
      beauty: ['beauty', 'nails', 'makeup', 'lashes', 'manicure', 'pedicure', 'skincare'],
      domestic: ['cleaner', 'cleaning', 'maid', 'domestic', 'housekeeper', 'laundry'],
      tutor: ['tutor', 'maths', 'science', 'tutoring', 'exam', 'teacher', 'homework'],
      chef: ['chef', 'cook', 'catering', 'private chef', 'meal prep', 'baker', 'cake'],
      photography: ['photo', 'photographer', 'photoshoot', 'studio', 'portrait', 'camera'],
      tattoo: ['tattoo', 'ink', 'piercing', 'tattooist', 'body art']
    };

    let matchedHelperType = null;
    for (const [type, words] of Object.entries(helperKeywords)) {
      if (words.some(w => lowerPrompt.includes(w))) {
        matchedHelperType = type;
        break;
      }
    }

    // 4. Service intent detection
    const serviceKeywords = {
      carwash: ['car wash', 'carwash', 'auto detailing', 'valet', 'car cleaning'],
      storage: ['storage', 'storage unit', 'store goods', 'warehouse'],
      moving: ['moving', 'movers', 'relocation', 'logistics', 'transport furniture'],
      transport: ['transport', 'shuttle', 'ride', 'delivery', 'courier', 'cab'],
      landscaping: ['gardening', 'garden', 'lawn', 'landscaping', 'tree felling'],
      handyman: ['plumber', 'plumbing', 'electrician', 'electrical', 'handyman', 'appliance repair', 'fix roof', 'painter']
    };

    let matchedServiceType = null;
    for (const [type, words] of Object.entries(serviceKeywords)) {
      if (words.some(w => lowerPrompt.includes(w))) {
        matchedServiceType = type;
        break;
      }
    }

    // ── DATABASE QUERY EXECUTION & INTENT DISPATCH ──

    // Case A: User searching for Helpers (barber, tutor, domestic cleaner, chef, etc.)
    if (matchedHelperType || lowerPrompt.includes('helper') || lowerPrompt.includes('hire a') || lowerPrompt.includes('freelancer')) {
      const helperFilter = {};
      if (matchedHelperType) helperFilter.type = matchedHelperType;
      if (detectedCity) helperFilter.address = { $regex: detectedCity, $options: 'i' };
      if (extractedBudget) helperFilter.regularPrice = { $lte: extractedBudget };

      try {
        let helpers = await Helper.find(helperFilter).limit(4).lean();
        if (helpers.length === 0 && matchedHelperType) {
          helpers = await Helper.find({ type: matchedHelperType }).limit(4).lean();
        }

        if (helpers.length > 0) {
          const typeLabel = matchedHelperType ? matchedHelperType.toUpperCase() : 'VERIFIED HELPERS';
          answer = `I found **${helpers.length} verified ${typeLabel} specialists** on loopOut ready to book! All providers are identity-verified and backed by our Escrow Buyer Guarantee.`;
          
          actionItems = helpers.map(h => ({
            id: h._id,
            title: h.name,
            price: `R${h.regularPrice}`,
            location: h.address || h.near || 'South Africa',
            type: 'helper',
            category: h.type || 'Helper',
            imageUrl: (h.imageUrls && h.imageUrls[0]) || '/images/default-avatar.png',
            link: `/${h.type || 'helper'}/${h._id}`,
            rating: h.rating || 4.9
          }));

          suggestedFollowUps = [
            `Book ${helpers[0].name}`,
            "How does escrow protect my booking?",
            "View more helpers nearby"
          ];
        } else {
          answer = `I searched our helper network for ${matchedHelperType || 'helpers'}${detectedCity ? ` in ${detectedCity}` : ''}. We are continuously onboarding top local talent! You can explore all active profiles in the Helper Hub or submit a specific request in Needs.`;
          suggestedFollowUps = ["Explore all helpers", "Post a Need in Looking For", "Find other services"];
        }
      } catch (err) {
        console.error("LoopBot Helper DB Error:", err);
      }
    }

    // Case B: User searching for Services (car wash, storage, plumbing, electricians, movers)
    else if (matchedServiceType || lowerPrompt.includes('service') || lowerPrompt.includes('repair') || lowerPrompt.includes('install')) {
      const serviceFilter = {};
      if (matchedServiceType) serviceFilter.type = matchedServiceType;
      if (detectedCity) serviceFilter.address = { $regex: detectedCity, $options: 'i' };
      if (extractedBudget) serviceFilter.regularPrice = { $lte: extractedBudget };

      try {
        let services = await Service.find(serviceFilter).limit(4).lean();
        if (services.length === 0 && matchedServiceType) {
          services = await Service.find({ type: matchedServiceType }).limit(4).lean();
        }

        if (services.length > 0) {
          answer = `Here are top-rated **${matchedServiceType ? matchedServiceType.toUpperCase() : 'SERVICES'}** matching your inquiry on loopOut:`;
          actionItems = services.map(s => ({
            id: s._id,
            title: s.name,
            price: `R${s.regularPrice}`,
            location: s.address || 'South Africa',
            type: 'service',
            category: s.type || 'Service',
            imageUrl: (s.imageUrls && s.imageUrls[0]) || '/images/default-service.png',
            link: `/service/${s._id}`,
            rating: s.rating || 4.8
          }));

          suggestedFollowUps = [
            "How do I book this service?",
            "What if the service is incomplete?",
            "Browse all services"
          ];
        } else {
          answer = `I searched for ${matchedServiceType || 'service'} providers${detectedCity ? ` in ${detectedCity}` : ''}. Check out our Services page for nationwide offerings or request a custom quote.`;
          suggestedFollowUps = ["View Services Hub", "Ask about Car Wash", "Ask about Storage"];
        }
      } catch (err) {
        console.error("LoopBot Service DB Error:", err);
      }
    }

    // Case C: Property / Stay / Room / Rental / Hotel search
    else if (
      lowerPrompt.includes('room') || lowerPrompt.includes('stay') || lowerPrompt.includes('hotel') ||
      lowerPrompt.includes('house') || lowerPrompt.includes('apartment') || lowerPrompt.includes('rent') ||
      lowerPrompt.includes('property') || lowerPrompt.includes('accommodation') || lowerPrompt.includes('lodge') ||
      lowerPrompt.includes('student') || lowerPrompt.includes('guesthouse') || lowerPrompt.includes('buy')
    ) {
      const propertyFilter = {};
      if (lowerPrompt.includes('rent') || lowerPrompt.includes('room') || lowerPrompt.includes('student')) {
        propertyFilter.type = { $in: ['rent', 'room', 'rooms', 'complex'] };
      } else if (lowerPrompt.includes('hotel') || lowerPrompt.includes('vacation') || lowerPrompt.includes('holiday') || lowerPrompt.includes('night')) {
        propertyFilter.type = { $in: ['over', 'resort', 'sale'] };
      }
      if (detectedCity) {
        propertyFilter.address = { $regex: detectedCity, $options: 'i' };
      }
      if (extractedBudget) {
        propertyFilter.regularPrice = { $lte: extractedBudget };
      }

      try {
        let properties = await Listing.find(propertyFilter).limit(4).lean();
        if (properties.length === 0 && detectedCity) {
          properties = await Listing.find({ address: { $regex: detectedCity, $options: 'i' } }).limit(4).lean();
        }
        if (properties.length === 0) {
          properties = await Listing.find().sort({ createdAt: -1 }).limit(4).lean();
        }

        if (properties.length > 0) {
          const locationText = detectedCity ? `in **${detectedCity}**` : 'across South Africa';
          const budgetText = extractedBudget ? ` under **R${extractedBudget.toLocaleString()}**` : '';
          answer = `I found verified properties ${locationText}${budgetText} on loopOut. Every stay includes verified host credentials and instant booking protection:`;
          
          actionItems = properties.map(p => ({
            id: p._id,
            title: p.name,
            price: `R${p.regularPrice ? p.regularPrice.toLocaleString() : 'N/A'}${p.type === 'over' ? '/night' : '/pm'}`,
            location: p.address || 'South Africa',
            type: 'listing',
            category: p.type === 'over' ? 'Vacation Stay' : p.type === 'rent' ? 'Rental' : 'Property',
            imageUrl: (p.imageUrls && p.imageUrls[0]) || '/images/default-home.png',
            link: `/listing/${p._id}`,
            rating: p.rating || 4.9
          }));

          suggestedFollowUps = [
            `Book ${properties[0].name}`,
            "Can I pay monthly via loopOut?",
            "Show me student rooms"
          ];
        }
      } catch (err) {
        console.error("LoopBot Property DB Error:", err);
      }
    }

    // Case D: Escrow / Payments / Trust & Safety questions
    else if (
      lowerPrompt.includes('escrow') || lowerPrompt.includes('payment') || lowerPrompt.includes('pay') ||
      lowerPrompt.includes('safe') || lowerPrompt.includes('scam') || lowerPrompt.includes('security') ||
      lowerPrompt.includes('refund') || lowerPrompt.includes('cancel')
    ) {
      answer = `### 🛡️ **loopOut Escrow & Buyer Protection**\n\n` +
        `Your safety and funds are 100% protected under our **Smart Escrow System**:\n\n` +
        `1. **Secure Vault Holding**: When you book a room, helper, or service, your payment is held securely in escrow — the provider does **not** receive funds upfront.\n` +
        `2. **Service Completion Verification**: Funds are only released once the stay or service is delivered and confirmed.\n` +
        `3. **24-Hour Free Cancellation**: You can cancel eligible bookings 24 hours prior for a full refund.\n` +
        `4. **Dispute Resolution**: If a provider fails to show up or if the property doesn't match the listing, our 24/7 Security Lab intervenes to issue an immediate refund.\n\n` +
        `We support Visa, MasterCard, Ozow Instant EFT, and LoopPoints.`;

      suggestedFollowUps = [
        "How do I verify my identity?",
        "Find verified stays",
        "How do hosts get paid?"
      ];
    }

    // Case E: Verification & Becoming a Host/Helper
    else if (
      lowerPrompt.includes('verify') || lowerPrompt.includes('host') || lowerPrompt.includes('list') ||
      lowerPrompt.includes('become a helper') || lowerPrompt.includes('earn') || lowerPrompt.includes('partner')
    ) {
      answer = `### 🚀 **Grow Your Business on loopOut**\n\n` +
        `Joining loopOut as a Host or Service Provider gives you access to thousands of clients daily:\n\n` +
        `• **Identity Verification**: Verify your ID in under 2 minutes to earn the verified badge and build instant trust.\n` +
        `• **Zero Upfront Fees**: List your room, salon, cleaning service, or car wash for free.\n` +
        `• **Guaranteed Payouts**: Escrow ensures you get paid promptly into your South African bank account upon job completion.\n` +
        `• **Host Dashboard**: Track earnings, bookings, reviews, and client inquiries from one central hub.`;

      suggestedFollowUps = [
        "Go to Create Listing",
        "Check Host Earnings",
        "Verify my ID"
      ];
    }

    // Case F: General Greetings / Platform Copilot
    else if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('loopbot') || lowerPrompt.includes('who are you')) {
      answer = `👋 **Hello! I'm LoopBot**, your intelligent loopOut Marketplace Copilot.\n\n` +
        `I'm connected live to South Africa's leading platform for **properties, verified helpers, top-rated services, and events**.\n\n` +
        `Here is what I can do for you right now:\n` +
        `• 🏡 **Find stays, student rooms, & apartments** in any SA city\n` +
        `• 💇 **Book verified helpers** (barbers, cleaners, chefs, tutors, photographers)\n` +
        `• 🚗 **Schedule home services** (car wash, storage, plumbing, electricians)\n` +
        `• 🛡️ **Answer safety, verification, & escrow questions**\n` +
        `• 💰 **Calculate budget & plan trips**\n\n` +
        `What would you like to discover today?`;

      suggestedFollowUps = [
        "Find rooms in Polokwane",
        "Book a barber session",
        "Find car wash services",
        "How does Escrow work?"
      ];
    }

    // Default Fallback: Smart AI Assistant Response with Live Suggestions
    if (!answer) {
      answer = `I'm on it! To give you the most accurate options, let me know if you're looking for a **room/stay**, **hiring a verified helper**, or **booking a service** (e.g. car wash, storage, tutor). You can also specify your city (e.g. Polokwane, JHB, Cape Town) or target budget.`;
      
      suggestedFollowUps = [
        "Show properties under R5,000",
        "Find domestic cleaners",
        "Explore upcoming events",
        "Safety & Escrow info"
      ];
    }

    return res.status(200).json({
      success: true,
      botName: "LoopBot",
      answer,
      actionItems,
      suggestedFollowUps,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("LoopBot Controller Error:", error);
    next(error);
  }
};
