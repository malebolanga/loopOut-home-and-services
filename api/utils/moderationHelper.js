import axios from 'axios';

// Comprehensive list of common offensive/insulting words
const offensiveWords = [
  'bastard', 'fuck', 'asshole', 'bitch', 'idiot', 'stupid', 'jerk',
  'cunt', 'dick', 'pussy', 'shit', 'motherfucker', 'whore', 'slut',
  'nigger', 'faggot', 'retard', 'bastards', 'fucking', 'assholes',
  'bitches', 'idiots', 'stupids', 'jerks', 'cunts', 'dicks', 'pussies',
  'shits', 'motherfuckers', 'whores', 'sluts', 'niggers', 'faggots', 'retards'
];

// Obfuscation patterns for common workarounds
const obfuscatedPatterns = [
  /\bf[u*x@1k]{2,4}\b/i,
  /\bf[u*x@1]c?k/i,
  /\ba[s*$5]{2}h[o*0]l[e*]/i,
  /\bb[i*1]tch/i,
  /\bd[i*1]ck/i,
  /\bp[u*y]{2}y/i,
  /\bsh[i*1]t/i,
  /\bc[u*]nt/i,
  /\bm[o*]th[e*]rf[u*]ck[e*]r/i
];

// Adult content keywords for image filenames or URLs
const adultImageKeywords = [
  'porn', 'adult', 'sexy', 'naked', 'nsfw', 'xxx', 'nudity', 'nud',
  'boobs', 'penis', 'cunt', 'vagina', 'anal', 'blowjob', 'erotic', 'breasts'
];

/**
 * Checks if a string contains any insulting or offensive language.
 */
export const containsInsult = (text) => {
  if (!text || typeof text !== 'string') return null;
  const normalizedText = text.toLowerCase();

  // Check exact word boundaries for clear words
  for (const word of offensiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return word;
    }
  }

  // Check obfuscated regex patterns
  for (const pattern of obfuscatedPatterns) {
    if (pattern.test(normalizedText)) {
      return pattern.source;
    }
  }

  return null;
};

/**
 * Validates text fields of a listing for offensive language.
 */
export const validateListingText = (data) => {
  // Fields to scan for insults
  const fieldsToScan = ['name', 'title', 'description', 'rules', 'near', 'address', 'host'];
  
  for (const field of fieldsToScan) {
    if (data[field]) {
      const insultFound = containsInsult(data[field]);
      if (insultFound) {
        return {
          valid: false,
          message: `Insulting or offensive language is not allowed. Please remove any offensive language from your listing fields.`
        };
      }
    }
  }
  return { valid: true };
};

/**
 * Moderates image URLs for adult content keywords and OpenAI Moderation.
 */
export const validateImages = async (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return { valid: true };
  }

  // 1. Local check: filename keywords
  for (const url of imageUrls) {
    if (typeof url === 'string') {
      const urlLower = url.toLowerCase();
      const filename = urlLower.split('/').pop() || '';
      for (const keyword of adultImageKeywords) {
        if (filename.includes(keyword)) {
          return {
            valid: false,
            message: 'Inappropriate or adult content is not allowed. Please upload a suitable picture.'
          };
        }
      }
    }
  }

  // 2. OpenAI Moderation API check (if configured and valid)
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
      // Log error but fallback to local filter to avoid breaking app on network/auth issue
      console.error('OpenAI Moderation request failed:', error.message);
    }
  }

  return { valid: true };
};
