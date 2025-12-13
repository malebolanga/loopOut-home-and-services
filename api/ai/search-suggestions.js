import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Alternative: Use a simpler AI service or fallback
const USE_OPENAI = !!OPENAI_API_KEY;

// Fallback suggestion generator
const generateFallbackSuggestions = (query, types) => {
  const suggestions = [];
  
  types.forEach(type => {
    switch(type) {
      case 'properties':
        suggestions.push(
          { text: `Houses for ${query}`, type: 'properties', category: 'property', icon: '🏠', confidence: 0.85 },
          { text: `Apartments in ${query}`, type: 'properties', category: 'property', icon: '🏢', confidence: 0.80 },
          { text: `Luxury properties ${query}`, type: 'properties', category: 'property', icon: '🏰', confidence: 0.75 }
        );
        break;
      case 'services':
        suggestions.push(
          { text: `${query} cleaning services`, type: 'services', category: 'service', icon: '🧹', confidence: 0.85 },
          { text: `${query} repair services`, type: 'services', category: 'service', icon: '🔧', confidence: 0.80 },
          { text: `${query} delivery services`, type: 'services', category: 'service', icon: '🚚', confidence: 0.75 }
        );
        break;
      case 'helpers':
        suggestions.push(
          { text: `${query} tutors`, type: 'helpers', category: 'helper', icon: '👨‍🏫', confidence: 0.85 },
          { text: `${query} domestic helpers`, type: 'helpers', category: 'helper', icon: '🧹', confidence: 0.80 },
          { text: `${query} handyman services`, type: 'helpers', category: 'helper', icon: '🔨', confidence: 0.75 }
        );
        break;
      case 'events':
        suggestions.push(
          { text: `${query} events`, type: 'events', category: 'event', icon: '🎉', confidence: 0.85 },
          { text: `${query} concerts`, type: 'events', category: 'event', icon: '🎵', confidence: 0.80 },
          { text: `${query} workshops`, type: 'events', category: 'event', icon: '🎨', confidence: 0.75 }
        );
        break;
    }
  });

  return suggestions.slice(0, 10);
};

// Get AI suggestions from OpenAI
const getOpenAISuggestions = async (query, types) => {
  try {
    const prompt = `Generate search suggestions for a real estate platform. 
    Query: "${query}"
    Available categories: ${types.join(', ')}
    
    Generate 8-10 search suggestions that are relevant to the query across all categories.
    Format each suggestion as: "Suggestion text|category|icon|confidence_score"
    
    Example:
    Houses for sale|properties|🏠|0.95
    Cleaning services|services|🧹|0.90
    Math tutors|helpers|👨‍🏫|0.85
    Music concerts|events|🎵|0.80
    
    Categories: properties, services, helpers, events
    Available icons: 🏠 🏢 🏰 🧹 🔧 🚚 👨‍🏫 🔨 🎉 🎵 🎨 ⚽ 🏀 🏊 ⛹️‍♂️ 🍽️`;
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful search assistant for a real estate platform." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const lines = content.split('\n').filter(line => line.trim());
    
    const suggestions = lines.map(line => {
      const [text, category, icon, confidence] = line.split('|');
      return {
        text: text.trim(),
        type: category.trim(),
        category: category.trim(),
        icon: icon.trim(),
        confidence: parseFloat(confidence) || 0.8
      };
    });

    return suggestions;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

// Main API endpoint
router.post('/', async (req, res) => {
  try {
    const { query, types = ['properties', 'services', 'helpers', 'events'] } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    let suggestions;
    
    if (USE_OPENAI) {
      try {
        suggestions = await getOpenAISuggestions(query, types);
      } catch (aiError) {
        console.error('OpenAI failed, using fallback:', aiError);
        suggestions = generateFallbackSuggestions(query, types);
      }
    } else {
      suggestions = generateFallbackSuggestions(query, types);
    }

    res.json({ 
      suggestions,
      aiPowered: USE_OPENAI,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions',
      suggestions: generateFallbackSuggestions(req.body.query || '', req.body.types || [])
    });
  }
});

export default router;