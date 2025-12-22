// src/utils/searchUtils.js
export const SEARCH_TYPE_CONFIG = {
  properties: {
    endpoint: '/api/listing/get',
    icon: '🏠',
    field: 'address',
    filters: ['type', 'parking', 'furnished', 'wifi', 'pool', 'offer', 'bedroomsMin', 'bedroomsMax', 'priceMin', 'priceMax']
  },
  services: {
    endpoint: '/api/service/get',
    icon: '🛠️',
    field: 'name',
    filters: ['category', 'priceMin', 'priceMax']
  },
  helpers: {
    endpoint: '/api/helper/get',
    icon: '👷',
    field: 'name',
    filters: ['type', 'rateMin', 'rateMax', 'experience']
  },
  events: {
    endpoint: '/api/event/get',
    icon: '🎪',
    field: 'title',
    filters: ['category', 'dateFrom', 'dateTo', 'priceMin', 'priceMax']
  }
};

// Generate smart search suggestions
export const generateSuggestions = (query, activeType, searchHistory) => {
  const suggestions = [];
  const lowerQuery = query.toLowerCase();
  
  // Add search history matches
  const historyMatches = searchHistory
    .filter(item => 
      item.term.toLowerCase().includes(lowerQuery) ||
      (item.type && item.type.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 3)
    .map(item => ({
      term: item.term,
      type: item.type,
      isHistory: true
    }));
  
  suggestions.push(...historyMatches);

  // Add contextual suggestions
  const contextualSuggestions = {
    properties: [
      'Beachfront villa in Cape Town',
      '3 bedroom apartment with pool',
      'Luxury penthouse with view',
      'Pet-friendly home with garden',
      'Office space in CBD'
    ],
    services: [
      'Cleaning service for office',
      'Personal chef for dinner party',
      'Moving service this weekend',
      'Landscaping garden maintenance'
    ],
    helpers: [
      'Experienced tutor for math',
      'Personal assistant for errands',
      'Professional chef available',
      'Domestic helper with references'
    ],
    events: [
      'Weekend music festival tickets',
      'Food & wine tasting event',
      'Art exhibition opening night',
      'Sports tournament this Saturday'
    ]
  };

  // Add type-specific suggestions if query is short
  if (query.length < 3) {
    const type = activeType === 'all' ? 'properties' : activeType;
    if (contextualSuggestions[type]) {
      contextualSuggestions[type].slice(0, 2).forEach(suggestion => {
        suggestions.push({
          term: suggestion,
          type: type,
          isHistory: false
        });
      });
    }
  }

  // Add keyword-based suggestions
  const keywordPatterns = [
    { keywords: ['apartment', 'house', 'villa', 'property', 'rent', 'sale'], type: 'properties' },
    { keywords: ['clean', 'service', 'repair', 'maintain', 'moving'], type: 'services' },
    { keywords: ['helper', 'chef', 'tutor', 'assistant', 'maid'], type: 'helpers' },
    { keywords: ['event', 'festival', 'concert', 'party', 'show'], type: 'events' }
  ];

  keywordPatterns.forEach(({ keywords, type }) => {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      suggestions.push({
        term: query,
        type: type,
        isHistory: false,
        priority: 1
      });
    }
  });

  // Remove duplicates
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) =>
      index === self.findIndex(s => s.term === suggestion.term && s.type === suggestion.type)
  );

  // Sort by priority (history first, then contextual)
  return uniqueSuggestions.sort((a, b) => {
    if (a.isHistory && !b.isHistory) return -1;
    if (!a.isHistory && b.isHistory) return 1;
    return 0;
  });
};

// Get search URL with smart parameters
export const getSearchUrl = (params) => {
  const { searchTerm, searchType, ...filters } = params;
  const urlParams = new URLSearchParams();
  
  if (searchTerm) {
    urlParams.set('searchTerm', searchTerm);
  }
  
  if (searchType) {
    urlParams.set('type', searchType);
  }
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== false) {
      urlParams.set(key, value);
    }
  });
  
  return `/search?${urlParams.toString()}`;
};

// Save search to history
export const saveSearchHistory = (term, type, metadata = {}) => {
  try {
    const history = getSearchHistory();
    const existingIndex = history.findIndex(
      item => item.term === term && item.type === type
    );
    
    if (existingIndex > -1) {
      // Move to top if exists
      const [existing] = history.splice(existingIndex, 1);
      existing.timestamp = new Date().toISOString();
      history.unshift(existing);
    } else {
      // Add new search
      history.unshift({
        term,
        type,
        timestamp: new Date().toISOString(),
        metadata
      });
    }
    
    // Keep only last 10 searches
    const limitedHistory = history.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
    return limitedHistory;
  } catch (error) {
    console.error('Error saving search history:', error);
    return [];
  }
};

// Get search history
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

// Clear search history
export const clearSearchHistory = () => {
  localStorage.removeItem('searchHistory');
  return [];
};

// Get field name for search type
export const getSearchFieldName = (searchType) => {
  return SEARCH_TYPE_CONFIG[searchType]?.field || 'address';
};

// Extract filters from search term using AI-like parsing
export const extractFiltersFromQuery = (query) => {
  const filters = {};
  const lowerQuery = query.toLowerCase();
  
  // Extract bedrooms
  const bedroomMatch = lowerQuery.match(/(\d+)\s*(?:bed|bedroom|beds|bd)/i);
  if (bedroomMatch) {
    filters.bedroomsMin = bedroomMatch[1];
    filters.bedroomsMax = bedroomMatch[1];
  }
  
  // Extract price
  const priceMatch = lowerQuery.match(/(?:under|below|up to|max|less than)\s*(?:R|€|£|¥|₹|\$)?\s*(\d+[\d,]*)/i);
  if (priceMatch) {
    filters.priceMax = parseInt(priceMatch[1].replace(/,/g, ''));
  }
  
  // Extract amenities
  const amenityKeywords = [
    { patterns: ['wifi', 'internet'], key: 'wifi', value: true },
    { patterns: ['parking', 'garage'], key: 'parking', value: true },
    { patterns: ['pool', 'swimming'], key: 'pool', value: true },
    { patterns: ['furnished'], key: 'furnished', value: true },
    { patterns: ['pet friendly', 'pets allowed'], key: 'pets', value: true },
    { patterns: ['gym', 'fitness'], key: 'gym', value: true },
    { patterns: ['view', 'scenic'], key: 'view', value: true },
    { patterns: ['secure', 'security', 'gated'], key: 'security', value: true },
    { patterns: ['near beach', 'beachfront'], key: 'view', value: true }
  ];
  
  amenityKeywords.forEach(({ patterns, key, value }) => {
    if (patterns.some(pattern => lowerQuery.includes(pattern))) {
      filters[key] = value;
    }
  });
  
  // Extract location
  const locations = ['cape town', 'johannesburg', 'pretoria', 'durban', 'south africa', 'sandton', 'cbd'];
  locations.forEach(location => {
    if (lowerQuery.includes(location)) {
      filters.location = location;
    }
  });
  
  return filters;
};