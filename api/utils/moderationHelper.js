import axios from 'axios';
import { hasProfanity, logProfanityEvent } from './profanityFilter.js';

// Common South African & E-Commerce Scam Patterns
const SCAM_PATTERNS = [
  {
    regex: /(pay|send|eft|transfer|deposit).{0,30}(before|upfront|prior|to\s+secure|first)/i,
    reason: 'Upfront deposit or payment demands before viewing/booking are strictly prohibited to prevent scams.'
  },
  {
    regex: /(ewallet|e-wallet|cash\s*send|capitec\s*voucher|money\s*market).{0,30}(payment|deposit|fee)/i,
    reason: 'Unregistered voucher or instant cash transfers are unverified payment methods.'
  },
  {
    regex: /(non-refundable|viewing\s*fee|booking\s*fee).{0,20}(upfront|first|required)/i,
    reason: 'Charging upfront viewing fees prior to in-person inspection violates safety terms.'
  },
  {
    regex: /(do\s*not\s*chat\s*here|whatsapp\s*only|contact\s*me\s*on\s*whatsapp\s*first).{0,30}(pay|money|deposit)/i,
    reason: 'Demanding off-platform communication specifically for upfront payment is suspicious.'
  },
  {
    regex: /(bitcoin|crypto|usdt|binance|eth|solana).{0,20}(payment|accepted|only)/i,
    reason: 'Cryptocurrency transfers are non-reversible and not supported for standard platform transactions.'
  },
  {
    regex: /(bit\.ly|tinyurl\.com|t\.me\/|wa\.me\/pay)/i,
    reason: 'Third-party redirect links to external payment forms are restricted.'
  }
];

/**
 * Validates text fields (title, description, content) for scam indicators and profanity.
 */
export const validateListingText = (data, userId = 'guest') => {
  if (!data) return { valid: true, data };

  const textToScan = [
    data.name || '',
    data.title || '',
    data.description || '',
    data.content || '',
    data.address || ''
  ].join(' ');

  // 1. Check for Profanity
  if (hasProfanity(textToScan)) {
    logProfanityEvent(userId, 'listing_text_scan', textToScan.slice(0, 100));
    return {
      valid: false,
      message: 'Inappropriate language detected. Please maintain professional listing text.'
    };
  }

  // 2. Anti-Scam Pattern Matching
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.regex.test(textToScan)) {
      return {
        valid: false,
        message: `Security Flag: ${pattern.reason}`
      };
    }
  }

  return { valid: true, data };
};

/**
 * Moderates image URLs for adult content via OpenAI Moderation API (if configured).
 */
export const validateImages = async (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return { valid: true };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== 'sk-YourOpenAIKeyHere' && apiKey.startsWith('sk-')) {
    try {
      for (const url of imageUrls) {
        const response = await axios.post(
          'https://api.openai.com/v1/moderations',
          {
            model: 'omni-moderation-latest',
            input: [{ type: 'image_url', image_url: { url } }]
          },
          { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        if (response.data && response.data.results && response.data.results[0]) {
          const result = response.data.results[0];
          if (result.flagged) {
            return {
              valid: false,
              message: 'Adult or inappropriate content was detected in your upload. Please use a suitable picture.'
            };
          }
        }
      }
    } catch (error) {
      console.error('OpenAI Moderation request failed:', error.message);
    }
  }

  return { valid: true };
};
