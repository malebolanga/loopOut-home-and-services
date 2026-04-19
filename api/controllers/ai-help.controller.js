import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
export const getAiResponse = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return next(errorHandler(400, 'Prompt is required'));
    }

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
    
    let answer = "";
    const lowerPrompt = prompt.toLowerCase();

    // Check if the user is asking for news or searching a specific city, unless they are asking for a budget planner
    const wantsBudget = lowerPrompt.includes('budget') || lowerPrompt.includes('afford') || lowerPrompt.includes('rent') || lowerPrompt.includes('buy');
    let searchQuery = null;
    
    if (!wantsBudget) {
      const explicitSearch = lowerPrompt.match(/(?:news|search|what's happening)(?: about| around| for| in)?\s+([a-z\s]+)/i);
      const cityMatch = lowerPrompt.match(/(polokwane|johannesburg|cape town|durban|pretoria|tzaneen|mankweng|seshego|soweto)/i);
      
      if (explicitSearch && explicitSearch[1].trim().length > 2) {
        // Exclude general chat keywords from being searched
        const term = explicitSearch[1].trim();
        if (!['hello', 'hi', 'book', 'verify', 'payment', 'cancel'].includes(term)) {
           searchQuery = term;
        }
      } else if (cityMatch) {
        searchQuery = cityMatch[1];
      }
    }

    if (searchQuery) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-ZA&gl=ZA&ceid=ZA:en`;
        const response = await fetch(rssUrl);
        const text = await response.text();
        
        const items = [];
        const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>/g;
        let match;
        while ((match = itemRegex.exec(text)) !== null && items.length < 5) {
            let title = match[1].replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            title = title.split(' - ').slice(0, -1).join(' - ') || title;
            items.push(`📰 **${title}**`);
        }
        
        if (items.length > 0) {
            const capQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
            answer = `Here is the latest news and information around **${capQuery}** from Google:\n\n` + 
                     items.join('\n\n') + 
                     `\n\nIs there anything else you would like to explore in ${capQuery}?`;
            
            return res.status(200).json({
              success: true,
              answer,
              timestamp: new Date().toISOString()
            });
        }
      } catch (e) {
        console.error("Google RSS Fetch Error:", e);
      }
    }

    // Very basic mock responses based on keywords
    if (lowerPrompt.includes('budget') || lowerPrompt.includes('afford') || lowerPrompt.includes('services') || lowerPrompt.includes('events')) {
      if (lowerPrompt.includes('rent')) {
        answer = "With a budget of " + (prompt.match(/R\d+/)?.join('') || "that amount") + " for renting, you can look into our modern apartments in the city center or spacious suburban homes. Make sure you check the utility costs, parking availability, and lease terms before deciding. To find the best fit, try using our filter for 'For Rent' and set your budget range!";
      } else if (lowerPrompt.includes('buy')) {
        answer = "Buying a property with a budget of " + (prompt.match(/R\d+/)?.join('') || "that amount") + " requires careful planning. You should consider getting pre-approved for a bond, checking the neighborhood's growth rate, and accounting for transfer costs and taxes. We recommend checking our 'For Sale' section to see the latest properties that fit your range.";
      } else if (lowerPrompt.includes('vacation') || lowerPrompt.includes('trip') || lowerPrompt.includes('hotel')) {
        let budgetMatch = prompt.match(/(?:budget(?:\s+of)?\s+|R)\s*(\d+)/i);
        let budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
        let cityLookup = prompt.match(/(?:to|in|at|around)\s([a-zA-Z\s]+)/i);
        let city = cityLookup ? cityLookup[1].trim() : "your destination";

        if (budget && city !== "your destination") {
          try {
             const results = await Listing.find({ 
               type: 'over',
               regularPrice: { $lte: budget },
               address: { $regex: city, $options: 'i' }
             }).limit(3);

             if(results.length > 0) {
               const properties = results.map(r => `• **${r.name}** in ${r.address} for R${r.regularPrice}/night`).join('\n');
               answer = `I found some hotels in ${city} that strictly fit your budget of under R${budget}:\n\n${properties}\n\nTo view them or book, head over to the Search tab!`;
             } else {
               answer = `Planning a trip to ${city} with a budget of R${budget}? I searched and couldn't find exact matches under that budget right now, but you can explore more options in our Vacation Rental section!`;
             }
          } catch(e) {
             console.log("DB lookup error", e);
             answer = `Planning a trip to ${city} with R${budget}? You can explore amazing hotels in that area using our advanced filtering system!`;
          }
        } else {
           answer = "Planning a vacation with " + (budget || "that amount") + "? You can afford a great stay! Consider booking our premium seaside villas or a cozy mountain retreat. Browse our 'Vacation Rental' listings today.";
        }
      } else if (lowerPrompt.includes('services')) {
        answer = "Looking to hire a service professional with a budget of " + (prompt.match(/R\d+/)?.join('') || "that amount") + "? Whether you need a plumber, private tutor, or photographer, we connect you with verified experts. Always check reviews, their portfolio, and the scope of work before finalizing any service agreement.";
      } else if (lowerPrompt.includes('events')) {
        answer = "Booking an event with a budget of " + (prompt.match(/R\d+/)?.join('') || "that amount") + " is exciting! You can explore incredible VIP experiences, masterclasses, or corporate retreats. We advise verifying whether the event is catered, its duration, and any cancellation policies before you secure your tickets!";
      } else {
        answer = "Your budget is a great starting point! Depending on what you're looking for, we have multiple options. Let me know if you want to rent, buy, go on vacation, hire a service, or book an event.";
      }
    } else if (lowerPrompt.includes('how do i book a reliable service')) {
      answer = "To book a reliable service professional, navigate to the Services tab. Filter by ratings, past reviews, and portfolio images. Once you find someone who fits your needs, request a booking directly from their profile page. Escrow holds your payment securely until the service is done!";
    } else if (lowerPrompt.includes('kind of events')) {
      answer = "On the platform, you can discover a massive variety of events! From elite tech conferences and real estate seminars to exclusive yoga retreats and private jet tours. You can explore it all by selecting the 'Explore Events' tab.";
    } else if (lowerPrompt.includes('what should i do if i want to buy')) {
      answer = "When looking to buy a property, you should first fix a clear budget and get a bond pre-approval. Next, make a list of your non-negotiable features (like bedrooms, area, garage). Finally, view multiple properties and don't hesitate to ask for the property's condition report before making an offer.";
    } else if (lowerPrompt.includes('sign') || lowerPrompt.includes('lease')) {
      answer = "Before signing a lease, always verify the property's condition, clearly understand the deposit requirements, check if utilities (water/lights) are prepaid or billed, and read any clauses regarding maintenance responsibilities. Don't be afraid to ask the landlord for clarifications.";
    } else if (lowerPrompt.includes('book') || lowerPrompt.includes('reserve')) {
      answer = "To book a service or property, simply navigate to the listing page, select your preferred dates or service type, and click the 'Book Now' or 'Check availability' button. Ensure you've completed your identity verification to enable seamless instant bookings!";
    } else if (lowerPrompt.includes('verify') || lowerPrompt.includes('identity')) {
      answer = "Verification is a key part of our trusted community! You can verify your profile from the 'Mission Control' dashboard. It only takes two minutes and unlocks all premium features, letting hosts and service providers know you're fully verified.";
    } else if (lowerPrompt.includes('payment') || lowerPrompt.includes('pay')) {
      answer = "Payments are completely secure and are held in escrow until the service or stay is successfully completed. We support Visa, MasterCard, and direct EFT. If you experience any issues at checkout, let me know!";
    } else if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi ')) {
      answer = "Hello there! I'm your AI Planner and Assistant for the Masterpiece platform. I can help you with budgeting for rentals or purchases, figuring out where to vacation, and resolving any issues. What do you need help with today?";
    } else if (lowerPrompt.includes('cancel') || lowerPrompt.includes('refund')) {
      answer = "Cancellations depend on the specific host's or professional's policy. Generally, cancelling 24 hours prior to the experience guarantees a full refund. You can manage your bookings directly from the Trips tab in your dashboard.";
    } else {
      answer = "I understand. To give you the best advice, could you clarify whether you're looking for a rental, buying a property, or planning a vacation? Knowing your budget helps too!";
    }

    res.status(200).json({
      success: true,
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};
