// src/utils/searchUtils.js
export const SEARCH_TYPE_CONFIG = {
  properties: {
    icon: '🏠',
    field: 'address',
    endpoint: '/api/listing/search',
    label: 'Properties'
  },
  services: {
    icon: '🛠️',
    field: 'name',
    endpoint: '/api/service/search',
    label: 'Services'
  },
  helpers: {
    icon: '👷',
    field: 'name',
    endpoint: '/api/helper/search',
    label: 'Helpers'
  },
  events: {
    icon: '🎪',
    field: 'name',
    endpoint: '/api/event/search',
    label: 'Events'
  }
};

export const getSearchFieldName = (searchType) => {
  return SEARCH_TYPE_CONFIG[searchType]?.field || 'address';
};

export const getSearchUrl = (params) => {
  const { searchTerm, searchType = 'properties', ...filters } = params;
  const urlParams = new URLSearchParams();
  
  if (searchTerm) urlParams.set('q', searchTerm);
  urlParams.set('type', searchType);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key, value);
    }
  });
  
  return `/search?${urlParams.toString()}`;
};

export const saveSearchHistory = (term, type, metadata = {}) => {
  try {
    const history = getSearchHistory();
    const entry = {
      term,
      type,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    // Remove duplicates
    const filtered = history.filter(item => 
      !(item.term === term && item.type === type)
    );
    
    // Add new entry at beginning
    const newHistory = [entry, ...filtered].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    return newHistory;
  } catch (error) {
    console.error('Error saving search history:', error);
    return [];
  }
};

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
};

export const clearSearchHistory = () => {
  localStorage.removeItem('searchHistory');
  return [];
};

export const generateSuggestions = (term, type, history) => {
  const suggestions = [];
  
  // Add history matches
  history.forEach(item => {
    if (item.term.toLowerCase().includes(term.toLowerCase()) && 
        (type === 'all' || item.type === type)) {
      suggestions.push({
        term: item.term,
        type: item.type,
        isHistory: true,
        metadata: item.metadata
      });
    }
  });
  
  // Add type-specific suggestions
  if (type === 'properties' || type === 'all') {
    const propertySuggestions = [
      '2 bedroom apartment in Sandton',
      'Beachfront villa in Cape Town',
      'Modern office space in Johannesburg',
      'Pet-friendly house with garden',
      'Luxury penthouse with pool'
    ];
    
    propertySuggestions.forEach(suggestion => {
      if (suggestion.toLowerCase().includes(term.toLowerCase())) {
        suggestions.push({
          term: suggestion,
          type: 'properties',
          isHistory: false
        });
      }
    });
  }
  
  // Remove duplicates
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) =>
      index === self.findIndex(s => 
        s.term === suggestion.term && s.type === suggestion.type
      )
  );
  
  return uniqueSuggestions.slice(0, 8);
};