import axios from 'axios';

/**
 * No-op: all text content is allowed. Returns data unchanged.
 */
export const validateListingText = (data) => {
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
