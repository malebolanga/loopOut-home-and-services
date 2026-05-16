import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
import {
  getSearchUrl,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory as clearSearchHistoryUtil,
  generateSuggestions,
  getSearchFieldName
} from '../utils/searchUtils';

const SearchInput = ({
  placeholder = "Search...",
  searchTypes = [],
  defaultType = 'properties',
  onSearch,
  className = '',
  showTypeSelector = true,
  autoFocus = false,
  initialValue = ''
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [activeType, setActiveType] = useState(defaultType);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Load search history safely with validation
  useEffect(() => {
    const loadHistory = () => {
      try {
        console.log('Loading search history...');
        const history = getSearchHistory();
        
        // Debug log
        console.log('Raw history from localStorage:', history);
        
        // If history is corrupted or malformed, reset it
        if (!Array.isArray(history)) {
          console.warn('History is not an array, resetting...');
          resetAndClearHistory();
          return;
        }
        
        // Validate each item
        const validHistory = history.filter(item => {
          try {
            return item && 
                   typeof item === 'object' && 
                   item.term && 
                   typeof item.term === 'string' &&
                   item.term.trim().length > 0;
          } catch {
            return false;
          }
        });
        
        console.log('Valid history after filtering:', validHistory);
        setSearchHistory(validHistory);
        setIsHistoryLoaded(true);
        
        // If there's corruption, save the cleaned version
        if (validHistory.length !== history.length) {
          console.log('Cleaning corrupted history items...');
          try {
            localStorage.setItem('searchHistory', JSON.stringify(validHistory));
          } catch (storageError) {
            console.error('Failed to save cleaned history:', storageError);
          }
        }
        
      } catch (error) {
        console.error('Critical error loading search history:', error);
        resetAndClearHistory();
      }
    };
    
    loadHistory();
  }, []);

  // Generate suggestions with error handling
  useEffect(() => {
    if (!isHistoryLoaded) return;
    
    if (searchTerm && searchTerm.trim()) {
      try {
        console.log('Generating suggestions for:', searchTerm);
        const newSuggestions = generateSuggestions(searchTerm, activeType, searchHistory);
        
        // Validate suggestions
        const validSuggestions = Array.isArray(newSuggestions) 
          ? newSuggestions.filter(s => 
              s && 
              s.term && 
              typeof s.term === 'string' &&
              s.term.trim().length > 0
            )
          : [];
        
        console.log('Valid suggestions:', validSuggestions);
        setSuggestions(validSuggestions);
        setShowSuggestions(validSuggestions.length > 0);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, activeType, searchHistory, isHistoryLoaded]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset and clear history completely
  const resetAndClearHistory = () => {
    try {
      console.log('Resetting search history...');
      localStorage.removeItem('searchHistory');
      localStorage.setItem('searchHistory', JSON.stringify([]));
      setSearchHistory([]);
      setSuggestions([]);
      setIsHistoryLoaded(true);
    } catch (error) {
      console.error('Error resetting history:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    const searchType = activeType === 'all' ? 'properties' : activeType;
    const searchField = getSearchFieldName(searchType);
    
    try {
      const updatedHistory = saveSearchHistory(trimmedTerm, searchType, {
        [searchField]: trimmedTerm
      });
      setSearchHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
    } catch (error) {
      console.error('Error saving search history:', error);
    }

    if (onSearch) {
      onSearch(trimmedTerm, activeType);
    } else {
      try {
        const url = getSearchUrl({
          searchTerm: trimmedTerm,
          searchType,
          [searchField]: trimmedTerm
        });
        navigate(url);
      } catch (navigationError) {
        console.error('Navigation error:', navigationError);
        navigate('/search');
      }
    }

    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion || !suggestion.term) {
      console.warn('Invalid suggestion clicked');
      return;
    }
    
    const trimmedTerm = suggestion.term.trim();
    setSearchTerm(trimmedTerm);
    setShowSuggestions(false);
    
    const searchType = suggestion.type || activeType;
    const searchField = getSearchFieldName(searchType);
    
    try {
      const updatedHistory = saveSearchHistory(trimmedTerm, searchType, {
        [searchField]: trimmedTerm
      });
      setSearchHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
    } catch (error) {
      console.error('Error saving suggestion to history:', error);
    }

    if (onSearch) {
      onSearch(trimmedTerm, suggestion.type || searchType);
    } else {
      try {
        const url = getSearchUrl({
          searchTerm: trimmedTerm,
          searchType: searchType,
          [searchField]: trimmedTerm
        });
        navigate(url);
      } catch (navigationError) {
        console.error('Navigation error for suggestion:', navigationError);
        navigate('/search');
      }
    }
  };

  const clearSearchHistory = () => {
    try {
      const clearedHistory = clearSearchHistoryUtil();
      setSearchHistory(Array.isArray(clearedHistory) ? clearedHistory : []);
      setSuggestions([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full p-3 pl-10 pr-16 text-sm sm:text-base sm:p-4 sm:pl-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white shadow-sm text-gray-900"
            autoFocus={autoFocus}
          />
          
         
          
          {/* Clear search button */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-10 sm:right-11 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Search"
          >
            <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Search type selector */}
        {showTypeSelector && searchTypes.length > 0 && (
          <div className="flex gap-1 sm:gap-2 overflow-x-auto mt-3 pb-2 hide-scrollbar">
            {searchTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => {
                  setActiveType(type.key);
                  if (searchTerm.trim()) {
                    onSearch?.(searchTerm.trim(), type.key);
                  }
                }}
                className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  activeType === type.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xs sm:text-sm">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        )}
      </form>
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-60 sm:max-h-64 overflow-y-auto">
          <div className="p-2 sm:p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {searchHistory.length > 0 ? 'Recent Searches & Suggestions' : 'Suggestions'}
            </span>
            {searchHistory.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSearchHistory}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                  title="Clear search history"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={resetAndClearHistory}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"
                  title="Reset search history (fixes errors)"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          <div className="max-h-48 sm:max-h-56 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              if (!suggestion || !suggestion.term) return null;
              
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 sm:p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-2 sm:gap-3 group"
                >
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm text-gray-900 truncate group-hover:text-blue-700">
                      {suggestion.term}
                    </span>
                    {suggestion.type && suggestion.type !== 'all' && (
                      <div className="text-xs text-gray-500 capitalize truncate group-hover:text-blue-500">
                        {suggestion.type}
                        {suggestion.fromHistory && <span className="ml-1 text-gray-400">• Recent</span>}
                      </div>
                    )}
                  </div>
                  <svg 
                    className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              History loaded: {isHistoryLoaded ? 'Yes' : 'No'} | 
              Items: {searchHistory.length} | 
              Suggestions: {suggestions.length}
            </div>
          )}
        </div>
      )}
      
      {/* Empty suggestions state */}
      {showSuggestions && suggestions.length === 0 && searchTerm.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">No suggestions found for "{searchTerm}"</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SearchInput;
