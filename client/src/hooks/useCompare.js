import { useState, useEffect } from 'react';

const COMPARE_KEY = 'loopout_compare_list';

export function useCompare(helper) {
  const [isCompared, setIsCompared] = useState(false);
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    // Initial load
    const loadCompareList = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
        setCompareList(stored);
        if (helper && helper._id) {
          setIsCompared(stored.some(item => item._id === helper._id));
        }
      } catch (e) {
        console.error("Error loading compare list", e);
      }
    };

    loadCompareList();

    // Listen for cross-component changes
    const handleStorageChange = (e) => {
      if (e.key === COMPARE_KEY) {
        loadCompareList();
      }
    };
    
    // Custom event for same-window updates
    const handleLocalUpdate = () => {
      loadCompareList();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('compare_updated', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('compare_updated', handleLocalUpdate);
    };
  }, [helper]);

  const toggleCompare = () => {
    if (!helper || !helper._id) return;
    
    try {
      let stored = JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
      const exists = stored.some(item => item._id === helper._id);

      if (exists) {
        stored = stored.filter(item => item._id !== helper._id);
        setIsCompared(false);
      } else {
        // Limit to 3 items
        if (stored.length >= 3) {
          alert('You can only compare up to 3 professionals at a time.');
          return;
        }
        stored.push(helper);
        setIsCompared(true);
      }

      localStorage.setItem(COMPARE_KEY, JSON.stringify(stored));
      // Dispatch event so other components update instantly
      window.dispatchEvent(new Event('compare_updated'));
    } catch (e) {
      console.error("Error updating compare list", e);
    }
  };

  const clearCompare = () => {
    localStorage.removeItem(COMPARE_KEY);
    setCompareList([]);
    window.dispatchEvent(new Event('compare_updated'));
  };

  return { isCompared, toggleCompare, compareList, clearCompare };
}
