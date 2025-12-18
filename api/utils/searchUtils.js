// src/utils/searchUtils.js
export const SEARCH_TYPES = {
  PROPERTIES: 'properties',
  SERVICES: 'services',
  HELPERS: 'helpers',
  EVENTS: 'events'
};

export const SEARCH_TYPE_CONFIG = {
  properties: {
    label: 'Properties',
    endpoint: '/api/listing/get',
    types: ['sale', 'rent-short', 'rent-long', 'office', 'land'],
    placeholder: 'Search properties...',
    icon: '🏠'
  },
  services: {
    label: 'Services',
    endpoint: '/api/service/get',
    types: ['cleaning', 'maintenance', 'moving', 'landscaping', 'catering', 'daycare', 'schoolTransport', 'other'],
    placeholder: 'Search services...',
    icon: '🔧'
  },
  helpers: {
    label: 'Helpers',
    endpoint: '/api/helper/get',
    types: ['domestic', 'tutor', 'chef', 'handyman', 'tattoo', 'beauty', 'barber', 'photography'],
    placeholder: 'Search helpers...',
    icon: '👥'
  },
  events: {
    label: 'Events',
    endpoint: '/api/event/get',
    types: ['concert', 'workshop', 'sports', 'community', 'festival'],
    placeholder: 'Search events...',
    icon: '🎉'
  }
};

export const getSearchConfig = (searchType) => {
  return SEARCH_TYPE_CONFIG[searchType] || SEARCH_TYPE_CONFIG.properties;
};

export const getSearchUrl = (params) => {
  const {
    searchTerm,
    searchType = 'properties',
    address = '',
    name = '',
    description = '',
    type = 'all',
    minPrice = '',
    maxPrice = '',
    location = ''
  } = params;

  const urlParams = new URLSearchParams();
  
  // Add search term
  if (searchTerm) {
    urlParams.set('q', searchTerm);
    
    // Determine field based on search type
    switch(searchType) {
      case 'properties':
        urlParams.set('name', searchTerm);
        break;
      case 'services':
        urlParams.set('serviceName', searchTerm);
        break;
      case 'helpers':
        urlParams.set('helperName', searchTerm);
        break;
      case 'events':
        urlParams.set('eventName', searchTerm);
        break;
    }
  }
  
  // Add search type
  urlParams.set('searchType', searchType);
  
  // Add other parameters
  if (address) urlParams.set('address', address);
  if (name) urlParams.set('name', name);
  if (description) urlParams.set('description', description);
  if (type && type !== 'all') urlParams.set('type', type);
  if (minPrice) urlParams.set('priceMin', minPrice);
  if (maxPrice) urlParams.set('priceMax', maxPrice);
  if (location) urlParams.set('location', location);
  
  return `/search?${urlParams.toString()}`;
};

export const saveSearchHistory = (searchTerm, searchType = 'properties', searchData = {}) => {
  try {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newSearch = {
      term: searchTerm,
      type: searchType,
      data: searchData,
      timestamp: new Date().toISOString()
    };
    
    // Remove duplicates and keep only last 10 searches
    const filtered = searchHistory.filter(
      item => !(item.term === searchTerm && item.type === searchType)
    );
    
    const updatedHistory = [newSearch, ...filtered].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    
    return updatedHistory;
  } catch (error) {
    console.error('Error saving search history:', error);
    return [];
  }
};

export const getSearchHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

export const clearSearchHistory = () => {
  localStorage.removeItem('searchHistory');
  return [];
};

export const generateSuggestions = (searchTerm, searchType = 'all', searchHistory = []) => {
  if (!searchTerm.trim()) return [];
  
  // Filter history by type
  const typeFiltered = searchHistory.filter(
    item => searchType === 'all' || item.type === searchType
  );
  
  // Get matches from history
  const historyMatches = typeFiltered
    .filter(item => item.term.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5)
    .map(item => ({ term: item.term, type: item.type, isHistory: true }));
  
  // Generic suggestions based on type
  const genericSuggestions = [];
  
  const config = SEARCH_TYPE_CONFIG[searchType] || SEARCH_TYPE_CONFIG.properties;
  
  if (searchType === 'all' || searchType === 'properties') {
    genericSuggestions.push(
      { term: 'Beach house', type: 'properties' },
      { term: 'Mountain cabin', type: 'properties' },
      { term: 'Downtown loft', type: 'properties' },
      { term: 'Luxury villa', type: 'properties' },
      { term: 'Cozy apartment', type: 'properties' }
    );
  }
  
  if (searchType === 'all' || searchType === 'services') {
    genericSuggestions.push(
      { term: 'House cleaning', type: 'services' },
      { term: 'Gardening service', type: 'services' },
      { term: 'Moving help', type: 'services' },
      { term: 'Car wash', type: 'services' },
      { term: 'Pet sitting', type: 'services' }
    );
  }
  
  if (searchType === 'all' || searchType === 'helpers') {
    genericSuggestions.push(
      { term: 'Tutor', type: 'helpers' },
      { term: 'Cleaner', type: 'helpers' },
      { term: 'Chef', type: 'helpers' },
      { term: 'Handyman', type: 'helpers' },
      { term: 'Babysitter', type: 'helpers' }
    );
  }
  
  if (searchType === 'all' || searchType === 'events') {
    genericSuggestions.push(
      { term: 'Concert tickets', type: 'events' },
      { term: 'Workshop', type: 'events' },
      { term: 'Sports event', type: 'events' },
      { term: 'Festival', type: 'events' },
      { term: 'Community gathering', type: 'events' }
    );
  }
  
  // Filter generic suggestions by search term
  const filteredGeneric = genericSuggestions
    .filter(item => item.term.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(item => ({ ...item, isHistory: false }));
  
  // Combine and deduplicate
  const allSuggestions = [...historyMatches, ...filteredGeneric]
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.term === item.term && t.type === item.type)
    )
    .slice(0, 8);
  
  return allSuggestions;
};

export const getSearchFieldName = (searchType) => {
  switch(searchType) {
    case 'properties': return 'name';
    case 'services': return 'serviceName';
    case 'helpers': return 'helperName';
    case 'events': return 'eventName';
    default: return 'name';
  }
};

export const getIconForSearchType = (searchType) => {
  const config = getSearchConfig(searchType);
  return config.icon;
};