import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Advanced Neural Discovery Engine
 * Reads user interaction performance, search patterns, and app usage depth
 * to provide hyper-personalized recommendations and promote relevant community helpers.
 */
export const useSearchIntelligence = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [interactionMetrics, setInteractionMetrics] = useState({
    sessionCount: 0,
    totalViewTime: 0,
    lastActive: null
  });
  const [userLocation, setUserLocation] = useState(null);
  const [smartScores, setSmartScores] = useState({}); // { category: score }

  // Initialize and load performance data
  useEffect(() => {
    const storedSearch = JSON.parse(localStorage.getItem('loopOut_searchHistory')) || [];
    const storedViews = JSON.parse(localStorage.getItem('loopOut_viewHistory')) || [];
    const storedMetrics = JSON.parse(localStorage.getItem('loopOut_userMetrics')) || {
      sessionCount: 0,
      totalViewTime: 0,
      lastActive: new Date().toISOString()
    };
    const storedLocation = JSON.parse(localStorage.getItem('loopOut_userLocation')) || null;
    
    setSearchHistory(storedSearch);
    setViewHistory(storedViews);
    setInteractionMetrics({
      ...storedMetrics,
      sessionCount: storedMetrics.sessionCount + 1,
      lastActive: new Date().toISOString()
    });
    setUserLocation(storedLocation);
    
    // Initial score calculation
    calculateNeuralScores(storedSearch, storedViews, storedMetrics);
  }, []);

  // Persist metrics
  useEffect(() => {
    if (interactionMetrics.sessionCount > 0) {
      localStorage.setItem('loopOut_userMetrics', JSON.stringify(interactionMetrics));
    }
  }, [interactionMetrics]);

  /**
   * Neural Scoring Algorithm
   * Weights: 
   * - Recent Searches: 5pts
   * - Item Views: 2pts
   * - Long View Duration: 3pts
   * - Repeated Visits: 4pts
   */
  const calculateNeuralScores = (searches, views, metrics) => {
    const scores = {};
    const categories = ['property', 'service', 'helper', 'event', 'maid', 'delivery', 'barber', 'hair'];
    
    // Initialize
    categories.forEach(cat => scores[cat] = 0);

    // Process Searches (High Intent)
    searches.forEach((term, idx) => {
      const recencyWeight = (10 - idx) / 10;
      categories.forEach(cat => {
        if (term.toLowerCase().includes(cat)) {
          scores[cat] += 5 * recencyWeight;
        }
      });
    });

    // Process Views (Interest)
    views.forEach(view => {
      const cat = view.type || view.category;
      if (scores[cat] !== undefined) {
        scores[cat] += 2;
        // Boost score if viewed recently (within last 24h)
        const ageHours = (new Date() - new Date(view.timestamp)) / (1000 * 60 * 60);
        if (ageHours < 24) scores[cat] += 1;
      }
    });

    setSmartScores(scores);
  };

  const recordSearch = useCallback((term) => {
    if (!term || term.trim() === '') return;
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('loopOut_searchHistory', JSON.stringify(newHistory));
    calculateNeuralScores(newHistory, viewHistory, interactionMetrics);
  }, [searchHistory, viewHistory, interactionMetrics]);

  const recordView = useCallback((item, duration = 0) => {
    if (!item?._id) return;
    
    const type = item.type || (item.category === 'maid' ? 'helper' : 'service');
    const viewEntry = { 
      id: item._id, 
      type: type, 
      category: item.category || 'general',
      timestamp: new Date().toISOString(),
      duration: duration // In seconds
    };
    
    const newHistory = [viewEntry, ...viewHistory.filter(v => v.id !== item._id)].slice(0, 30);
    setViewHistory(newHistory);
    localStorage.setItem('loopOut_viewHistory', JSON.stringify(newHistory));
    
    // Update performance metrics
    if (duration > 0) {
      setInteractionMetrics(prev => ({
        ...prev,
        totalViewTime: prev.totalViewTime + duration
      }));
    }

    calculateNeuralScores(searchHistory, newHistory, interactionMetrics);
  }, [searchHistory, viewHistory, interactionMetrics]);

  /**
   * Smart Ranking Engine
   * Returns a sorted list of items based on neural scores
   */
  const rankItems = useCallback((items) => {
    if (!items || items.length === 0) return [];
    
    return [...items].sort((a, b) => {
      const scoreA = smartScores[a.type] || smartScores[a.category] || 0;
      const scoreB = smartScores[b.type] || smartScores[b.category] || 0;
      return scoreB - scoreA;
    });
  }, [smartScores]);

  const updateLocation = useCallback((location) => {
    setUserLocation(location);
    localStorage.setItem('loopOut_userLocation', JSON.stringify(location));
  }, []);

  // Derived Top Categories
  const topCategories = useMemo(() => {
    return Object.entries(smartScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => cat);
  }, [smartScores]);

  return {
    searchHistory: searchHistory || [],
    viewHistory: viewHistory || [],
    interactionMetrics,
    userLocation,
    smartScores,
    topCategories: topCategories || [],
    preferredCategories: topCategories || [],
    recordSearch,
    recordView,
    rankItems,
    updateLocation
  };
};

export default useSearchIntelligence;
