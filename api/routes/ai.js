import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Fallback suggestion generator (no OpenAI required)
const generateFallbackSuggestions = (query, types) => {
  const suggestions = [];
  
  types.forEach(type => {
    switch(type) {
      case 'properties':
        suggestions.push(
          { text: `Houses for ${query}`, type: 'properties', category: 'property', icon: '🏠', confidence: 0.85 },
          { text: `Apartments in ${query}`, type: 'properties', category: 'property', icon: '🏢', confidence: 0.80 },
          { text: `Luxury properties ${query}`, type: 'properties', category: 'property', icon: '🏰', confidence: 0.75 },
          { text: `${query} real estate`, type: 'properties', category: 'property', icon: '🏘️', confidence: 0.70 },
          { text: `Affordable ${query} homes`, type: 'properties', category: 'property', icon: '🏡', confidence: 0.65 }
        );
        break;
      case 'services':
        suggestions.push(
          { text: `${query} cleaning services`, type: 'services', category: 'service', icon: '🧹', confidence: 0.85 },
          { text: `${query} repair services`, type: 'services', category: 'service', icon: '🔧', confidence: 0.80 },
          { text: `${query} delivery services`, type: 'services', category: 'service', icon: '🚚', confidence: 0.75 },
          { text: `${query} maintenance`, type: 'services', category: 'service', icon: '🛠️', confidence: 0.70 },
          { text: `${query} professional services`, type: 'services', category: 'service', icon: '💼', confidence: 0.65 }
        );
        break;
      case 'helpers':
        suggestions.push(
          { text: `${query} tutors`, type: 'helpers', category: 'helper', icon: '👨‍🏫', confidence: 0.85 },
          { text: `${query} domestic helpers`, type: 'helpers', category: 'helper', icon: '🧹', confidence: 0.80 },
          { text: `${query} handyman services`, type: 'helpers', category: 'helper', icon: '🔨', confidence: 0.75 },
          { text: `${query} personal assistants`, type: 'helpers', category: 'helper', icon: '👨‍💼', confidence: 0.70 },
          { text: `${query} caregivers`, type: 'helpers', category: 'helper', icon: '👩‍⚕️', confidence: 0.65 }
        );
        break;
      case 'events':
        suggestions.push(
          { text: `${query} events`, type: 'events', category: 'event', icon: '🎉', confidence: 0.85 },
          { text: `${query} concerts`, type: 'events', category: 'event', icon: '🎵', confidence: 0.80 },
          { text: `${query} workshops`, type: 'events', category: 'event', icon: '🎨', confidence: 0.75 },
          { text: `${query} festivals`, type: 'events', category: 'event', icon: '🎪', confidence: 0.70 },
          { text: `${query} sports events`, type: 'events', category: 'event', icon: '⚽', confidence: 0.65 }
        );
        break;
    }
  });

  // Remove duplicates and limit to 10 suggestions
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
    index === self.findIndex((s) => s.text === suggestion.text)
  );

  return uniqueSuggestions.slice(0, 10);
};

// Enhanced fallback with better matching
const generateEnhancedSuggestions = (query, types) => {
  const queryLower = query.toLowerCase();
  
  // Common patterns for real estate
  const propertyKeywords = ['house', 'apartment', 'rent', 'sale', 'property', 'home', 'villa', 'condo', 'studio'];
  const serviceKeywords = ['clean', 'repair', 'fix', 'maintain', 'deliver', 'move', 'transport'];
  const helperKeywords = ['tutor', 'teach', 'help', 'assist', 'care', 'babysit', 'cook'];
  const eventKeywords = ['event', 'party', 'concert', 'show', 'festival', 'workshop', 'meetup'];
  
  const suggestions = [];
  
  // Property suggestions
  if (types.includes('properties')) {
    const hasPropertyKeyword = propertyKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasPropertyKeyword) {
      suggestions.push(
        { text: `${query} properties`, type: 'properties', category: 'property', icon: '🏠', confidence: 0.95 },
        { text: `Find ${query} homes`, type: 'properties', category: 'property', icon: '🏡', confidence: 0.90 },
        { text: `${query} real estate listings`, type: 'properties', category: 'property', icon: '🏘️', confidence: 0.85 }
      );
    } else {
      suggestions.push(
        { text: `Properties in ${query}`, type: 'properties', category: 'property', icon: '🏠', confidence: 0.80 },
        { text: `Houses for ${query}`, type: 'properties', category: 'property', icon: '🏠', confidence: 0.75 }
      );
    }
  }
  
  // Service suggestions
  if (types.includes('services')) {
    const hasServiceKeyword = serviceKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasServiceKeyword) {
      suggestions.push(
        { text: `${query} services near me`, type: 'services', category: 'service', icon: '🔧', confidence: 0.95 },
        { text: `Professional ${query} services`, type: 'services', category: 'service', icon: '💼', confidence: 0.90 }
      );
    } else {
      suggestions.push(
        { text: `${query} related services`, type: 'services', category: 'service', icon: '🛠️', confidence: 0.75 },
        { text: `Find ${query} service providers`, type: 'services', category: 'service', icon: '👨‍🔧', confidence: 0.70 }
      );
    }
  }
  
  // Helper suggestions
  if (types.includes('helpers')) {
    const hasHelperKeyword = helperKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasHelperKeyword) {
      suggestions.push(
        { text: `${query} professionals`, type: 'helpers', category: 'helper', icon: '👨‍🏫', confidence: 0.95 },
        { text: `Find ${query} help`, type: 'helpers', category: 'helper', icon: '🙋‍♂️', confidence: 0.90 }
      );
    } else {
      suggestions.push(
        { text: `${query} helpers available`, type: 'helpers', category: 'helper', icon: '👥', confidence: 0.75 },
        { text: `Hire ${query} assistance`, type: 'helpers', category: 'helper', icon: '🤝', confidence: 0.70 }
      );
    }
  }
  
  // Event suggestions
  if (types.includes('events')) {
    const hasEventKeyword = eventKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasEventKeyword) {
      suggestions.push(
        { text: `${query} happening soon`, type: 'events', category: 'event', icon: '🎉', confidence: 0.95 },
        { text: `Upcoming ${query}`, type: 'events', category: 'event', icon: '📅', confidence: 0.90 }
      );
    } else {
      suggestions.push(
        { text: `Events related to ${query}`, type: 'events', category: 'event', icon: '🎪', confidence: 0.75 },
        { text: `${query} activities and events`, type: 'events', category: 'event', icon: '🎭', confidence: 0.70 }
      );
    }
  }
  
  // Add general suggestions if we don't have enough
  if (suggestions.length < 8) {
    const additional = generateFallbackSuggestions(query, types);
    suggestions.push(...additional.filter(s => 
      !suggestions.some(existing => existing.text === s.text)
    ));
  }
  
  // Sort by confidence and limit
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
};

// Main API endpoint for AI suggestions
router.post('/search-suggestions', async (req, res) => {
  try {
    const { query, types = ['properties', 'services', 'helpers', 'events'] } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Use enhanced suggestions (no OpenAI required)
    const suggestions = generateEnhancedSuggestions(query, types);

    res.json({ 
      suggestions,
      aiPowered: false, // Since we're not using OpenAI
      query,
      timestamp: new Date().toISOString(),
      count: suggestions.length
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    
    // Even if there's an error, provide basic suggestions
    const basicSuggestions = generateFallbackSuggestions(
      req.body.query || '', 
      req.body.types || ['properties', 'services', 'helpers', 'events']
    );
    
    res.status(200).json({ 
      suggestions: basicSuggestions,
      aiPowered: false,
      query: req.body.query || '',
      timestamp: new Date().toISOString(),
      count: basicSuggestions.length,
      error: 'Using fallback suggestions'
    });
  }
});

// Alternative: Smart search endpoint
router.post('/smart-search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const queryLower = query.toLowerCase();
    
    // Analyze query to determine likely intent
    const analysis = {
      likelyType: 'properties', // default
      confidence: 0.5,
      keywords: [],
      suggestions: []
    };

    // Detect query type based on keywords
    const propertyWords = ['house', 'apartment', 'rent', 'sale', 'property', 'home', 'villa', 'condo'];
    const serviceWords = ['clean', 'repair', 'fix', 'maintain', 'service', 'deliver', 'move'];
    const helperWords = ['tutor', 'teach', 'help', 'assist', 'care', 'babysit', 'cook', 'chef'];
    const eventWords = ['event', 'party', 'concert', 'show', 'festival', 'workshop'];

    let propertyMatches = propertyWords.filter(word => queryLower.includes(word)).length;
    let serviceMatches = serviceWords.filter(word => queryLower.includes(word)).length;
    let helperMatches = helperWords.filter(word => queryLower.includes(word)).length;
    let eventMatches = eventWords.filter(word => queryLower.includes(word)).length;

    // Determine most likely type
    const matches = [
      { type: 'properties', count: propertyMatches },
      { type: 'services', count: serviceMatches },
      { type: 'helpers', count: helperMatches },
      { type: 'events', count: eventMatches }
    ];

    matches.sort((a, b) => b.count - a.count);
    analysis.likelyType = matches[0].count > 0 ? matches[0].type : 'properties';
    analysis.confidence = matches[0].count / Math.max(1, query.split(' ').length);

    // Generate intelligent suggestions
    if (analysis.likelyType === 'properties') {
      analysis.suggestions = [
        { text: `Search properties for ${query}`, action: 'search', type: 'properties', priority: 1 },
        { text: `View ${query} real estate`, action: 'browse', type: 'properties', priority: 2 },
        { text: `Find homes similar to ${query}`, action: 'related', type: 'properties', priority: 3 }
      ];
    } else if (analysis.likelyType === 'services') {
      analysis.suggestions = [
        { text: `Find ${query} service providers`, action: 'search', type: 'services', priority: 1 },
        { text: `Book ${query} services`, action: 'book', type: 'services', priority: 2 },
        { text: `Compare ${query} service prices`, action: 'compare', type: 'services', priority: 3 }
      ];
    }

    res.json({
      query,
      analysis,
      suggestions: generateEnhancedSuggestions(query, [analysis.likelyType]),
      recommendedAction: `search_${analysis.likelyType}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze search query',
      suggestions: generateFallbackSuggestions(req.body.query || '', ['properties', 'services', 'helpers', 'events'])
    });
  }
});

// Query expansion endpoint
router.post('/expand-query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    // Common synonyms and expansions for real estate
    const expansions = {
      // Property types
      'house': ['home', 'property', 'residence', 'dwelling', 'bungalow'],
      'apartment': ['flat', 'unit', 'condo', 'studio', 'loft'],
      'rent': ['lease', 'hire', 'let', 'sublet'],
      'sale': ['buy', 'purchase', 'for sale', 'on market'],
      
      // Services
      'clean': ['cleaning', 'sanitize', 'tidy', 'maid service'],
      'repair': ['fix', 'maintenance', 'restoration', 'mend'],
      
      // Helpers
      'tutor': ['teacher', 'instructor', 'educator', 'coach'],
      'helper': ['assistant', 'aid', 'support', 'caregiver'],
    };

    const words = query.toLowerCase().split(' ');
    const expanded = [...words];

    // Add synonyms
    words.forEach(word => {
      if (expansions[word]) {
        expanded.push(...expansions[word]);
      }
    });

    // Remove duplicates
    const uniqueExpanded = [...new Set(expanded)];

    res.json({
      original: query,
      expanded: uniqueExpanded,
      suggestedQueries: uniqueExpanded.map(term => 
        `${term} ${words.slice(1).join(' ')}`.trim()
      ).filter(q => q !== query),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Query expansion error:', error);
    res.status(500).json({ 
      error: 'Failed to expand query',
      original: req.body.query,
      expanded: [req.body.query]
    });
  }
});

export default router;