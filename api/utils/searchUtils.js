// utils/searchUtils.js
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    if (!history || history === 'undefined' || history === 'null') {
      return [];
    }
    
    const parsedHistory = JSON.parse(history);
    
    // Ensure we return a valid array
    if (Array.isArray(parsedHistory)) {
      // Filter out any invalid entries
      return parsedHistory.filter(item => 
        item && 
        typeof item === 'object' && 
        item.term && 
        typeof item.term === 'string' &&
        item.term.trim() !== ''
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error getting search history:', error);
    // Clear corrupted data
    localStorage.removeItem('searchHistory');
    return [];
  }
};

export const generateSuggestions = (query, type = 'properties', history = []) => {
  try {
    // Validate inputs
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    if (normalizedQuery.length === 0) {
      return [];
    }
    
    const suggestions = [];
    
    // Safely process history items
    if (Array.isArray(history)) {
      history.forEach((item) => {
        try {
          // Validate item structure
          if (!item || typeof item !== 'object') return;
          if (!item.term || typeof item.term !== 'string') return;
          
          const term = item.term.trim();
          if (term.length === 0) return;
          
          const normalizedItem = term.toLowerCase();
          if (normalizedItem.includes(normalizedQuery) || normalizedQuery.includes(normalizedItem)) {
            suggestions.push({
              term: term,
              type: item.type || 'all',
              score: 1,
              fromHistory: true
            });
          }
        } catch (itemError) {
          console.warn('Skipping invalid history item:', itemError);
        }
      });
    }
    
    // Add type-based suggestions only if type is valid
    if (type && typeof type === 'string' && type !== 'all') {
      const typeLabels = {
        properties: ['apartment', 'house', 'rent', 'sale', 'property', 'home', 'flat', 'villa'],
        services: ['cleaning', 'handyman', 'repair', 'maintenance', 'service', 'plumbing', 'electrician', 'gardening'],
        helpers: ['helper', 'assistant', 'cleaner', 'driver', 'chef', 'tutor', 'babysitter'],
        events: ['event', 'concert', 'festival', 'party', 'meeting', 'show', 'exhibition']
      };
      
      const typeWords = typeLabels[type] || [];
      typeWords.forEach(word => {
        try {
          if (word.includes(normalizedQuery) || normalizedQuery.includes(word)) {
            suggestions.push({
              term: `${query} ${word}`,
              type: type,
              score: 0.8,
              fromHistory: false
            });
          }
        } catch (wordError) {
          console.warn('Error processing type word:', wordError);
        }
      });
    }
    
    // Add location-based suggestions
    const locations = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Sandton', 'Waterfront', 'Rosebank', 'Fourways'];
    locations.forEach(location => {
      try {
        const normalizedLocation = location.toLowerCase();
        if (normalizedQuery.includes(normalizedLocation) || 
            normalizedLocation.includes(normalizedQuery)) {
          suggestions.push({
            term: `${query} in ${location}`,
            type: 'all',
            score: 0.7,
            fromHistory: false
          });
        }
      } catch (locationError) {
        console.warn('Error processing location:', locationError);
      }
    });
    
    // Add generic suggestions based on query
    if (normalizedQuery.length > 2) {
      const genericSuggestions = [
        { term: `${query} near me`, type: 'all', score: 0.6 },
        { term: `${query} affordable`, type: 'all', score: 0.5 },
        { term: `${query} today`, type: 'all', score: 0.5 },
        { term: `${query} this weekend`, type: 'all', score: 0.5 }
      ];
      
      genericSuggestions.forEach(suggestion => {
        try {
          suggestions.push({
            ...suggestion,
            fromHistory: false
          });
        } catch (suggestionError) {
          console.warn('Error adding generic suggestion:', suggestionError);
        }
      });
    }
    
    // Sort by score and remove duplicates
    const uniqueSuggestions = [];
    const seenTerms = new Set();
    
    // First filter out any invalid suggestions
    const validSuggestions = suggestions.filter(s => {
      try {
        return s && 
               s.term && 
               typeof s.term === 'string' && 
               s.term.trim().length > 0;
      } catch {
        return false;
      }
    });
    
    // Sort and deduplicate
    validSuggestions
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .forEach(suggestion => {
        try {
          const termKey = suggestion.term.toLowerCase().trim();
          if (!seenTerms.has(termKey)) {
            seenTerms.add(termKey);
            uniqueSuggestions.push({
              term: suggestion.term.trim(),
              type: suggestion.type || 'all',
              score: suggestion.score || 0
            });
          }
        } catch (dedupeError) {
          console.warn('Error deduplicating suggestion:', dedupeError);
        }
      });
    
    return uniqueSuggestions.slice(0, 10);
    
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

export const saveSearchHistory = (term, type = 'all', params = {}) => {
  try {
    // Validate inputs
    if (!term || typeof term !== 'string') {
      console.warn('Invalid term provided to saveSearchHistory:', term);
      return getSearchHistory();
    }
    
    const cleanTerm = term.trim();
    if (cleanTerm.length === 0) {
      return getSearchHistory();
    }
    
    const cleanType = type && typeof type === 'string' ? type : 'all';
    
    const history = getSearchHistory();
    const newEntry = {
      term: cleanTerm,
      type: cleanType,
      params: params && typeof params === 'object' ? params : {},
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    // Remove duplicates (case insensitive)
    const filteredHistory = history.filter(item => {
      if (!item || !item.term || typeof item.term !== 'string') {
        return true; // Keep valid items
      }
      return item.term.toLowerCase() !== cleanTerm.toLowerCase();
    });
    
    const newHistory = [newEntry, ...filteredHistory].slice(0, 15);
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (storageError) {
      console.error('Failed to save to localStorage:', storageError);
      // If localStorage is full, remove oldest items
      if (storageError.name === 'QuotaExceededError') {
        const reducedHistory = newHistory.slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(reducedHistory));
        return reducedHistory;
      }
    }
    
    return newHistory;
  } catch (error) {
    console.error('Error in saveSearchHistory:', error);
    return getSearchHistory(); // Return current history as fallback
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('searchHistory');
    return [];
  } catch (error) {
    console.error('Error clearing search history:', error);
    return [];
  }
};

export const getSearchUrl = (params = {}) => {
  try {
    const { searchTerm = '', searchType = 'properties', ...otherParams } = params;
    const urlParams = new URLSearchParams();
    
    if (searchTerm && typeof searchTerm === 'string') {
      urlParams.set('q', searchTerm.trim());
    }
    
    if (searchType && typeof searchType === 'string') {
      urlParams.set('type', searchType);
    }
    
    if (otherParams && typeof otherParams === 'object') {
      Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          urlParams.set(key, String(value));
        }
      });
    }
    
    return `/search?${urlParams.toString()}`;
  } catch (error) {
    console.error('Error generating search URL:', error);
    return '/search';
  }
};

export const getSearchFieldName = (searchType) => {
  const fieldMap = {
    properties: 'name',
    services: 'title',
    helpers: 'name',
    events: 'title'
  };
  
  if (searchType && fieldMap[searchType]) {
    return fieldMap[searchType];
  }
  
  return 'name'; // Default field
};

export const SEARCH_TYPE_CONFIG = {
  properties: {
    endpoint: '/api/listing/search',
    field: 'name',
    label: 'Properties'
  },
  services: {
    endpoint: '/api/service/search',
    field: 'title',
    label: 'Services'
  },
  helpers: {
    endpoint: '/api/helper/search',
    field: 'name',
    label: 'Helpers'
  },
  events: {
    endpoint: '/api/event/search',
    field: 'title',
    label: 'Events'
  }
};

// Utility function to safely clear and reset localStorage if corrupted
export const resetSearchHistory = () => {
  try {
    localStorage.removeItem('searchHistory');
    // Initialize with empty array
    localStorage.setItem('searchHistory', JSON.stringify([]));
    return [];
  } catch (error) {
    console.error('Error resetting search history:', error);
    return [];
  }
};