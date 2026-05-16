import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage "smart" application behavior based on user history and environment.
 * Tracks searches, views, and location to improve user experience.
 */
export const useSearchIntelligence = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [preferredCategories, setPreferredCategories] = useState([]);

  // Load history on mount
  useEffect(() => {
    const storedSearch = JSON.parse(localStorage.getItem('loopOut_searchHistory')) || [];
    const storedViews = JSON.parse(localStorage.getItem('loopOut_viewHistory')) || [];
    const storedLocation = JSON.parse(localStorage.getItem('loopOut_userLocation')) || null;
    
    setSearchHistory(storedSearch);
    setViewHistory(storedViews);
    setUserLocation(storedLocation);
    
    // Calculate preferred categories based on history
    calculatePreferences(storedSearch, storedViews);
  }, []);

  const calculatePreferences = (searches, views) => {
    const categoryCounts = {};
    
    // Count from searches
    searches.forEach(term => {
      // Simple keyword matching for categories
      const categories = ['property', 'service', 'helper', 'event'];
      categories.forEach(cat => {
        if (term.toLowerCase().includes(cat)) {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 2; // Higher weight for searches
        }
      });
    });
    
    // Count from views
    views.forEach(view => {
      if (view.type) {
        categoryCounts[view.type] = (categoryCounts[view.type] || 0) + 1;
      }
    });
    
    // Sort categories by frequency
    const sorted = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => cat);
      
    setPreferredCategories(sorted);
  };

  const recordSearch = useCallback((term) => {
    if (!term || term.trim() === '') return;
    
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('loopOut_searchHistory', JSON.stringify(newHistory));
    calculatePreferences(newHistory, viewHistory);
  }, [searchHistory, viewHistory]);

  const recordView = useCallback((item) => {
    if (!item?._id || !item?.type) return;
    
    const viewEntry = { 
      id: item._id, 
      type: item.type, 
      timestamp: new Date().toISOString(),
      category: item.category || 'general'
    };
    
    const newHistory = [viewEntry, ...viewHistory.filter(v => v.id !== item._id)].slice(0, 20);
    setViewHistory(newHistory);
    localStorage.setItem('loopOut_viewHistory', JSON.stringify(newHistory));
    calculatePreferences(searchHistory, newHistory);
  }, [searchHistory, viewHistory]);

  const updateLocation = useCallback((location) => {
    setUserLocation(location);
    localStorage.setItem('loopOut_userLocation', JSON.stringify(location));
  }, []);

  return {
    searchHistory,
    viewHistory,
    userLocation,
    preferredCategories,
    recordSearch,
    recordView,
    updateLocation
  };
};

export default useSearchIntelligence;
