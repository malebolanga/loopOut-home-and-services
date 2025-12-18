// components/SearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
import {
  getSearchUrl,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory as clearSearchHistoryUtil,
  generateSuggestions
} from '../utils/searchUtils';

const SearchInput = ({
  placeholder = "Search...",
  searchTypes = [],
  defaultType = 'all',
  onSearch,
  className = '',
  showTypeSelector = true,
  autoFocus = false
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState(defaultType);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(getSearchHistory());
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      const newSuggestions = generateSuggestions(searchTerm, activeType, searchHistory);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, activeType, searchHistory]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const updatedHistory = saveSearchHistory(searchTerm, activeType === 'all' ? 'properties' : activeType);
    setSearchHistory(updatedHistory);

    const searchUrl = getSearchUrl({
      searchTerm,
      searchType: activeType === 'all' ? 'properties' : activeType,
      address: searchTerm,
      name: searchTerm
    });

    if (onSearch) {
      onSearch(searchTerm, activeType);
    } else {
      navigate(searchUrl);
    }

    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    
    const updatedHistory = saveSearchHistory(suggestion, activeType === 'all' ? 'properties' : activeType);
    setSearchHistory(updatedHistory);

    const searchUrl = getSearchUrl({
      searchTerm: suggestion,
      searchType: activeType === 'all' ? 'properties' : activeType,
      address: suggestion,
      name: suggestion
    });

    if (onSearch) {
      onSearch(suggestion, activeType);
    } else {
      navigate(searchUrl);
    }
  };

  const clearSearchHistory = () => {
    const clearedHistory = clearSearchHistoryUtil();
    setSearchHistory(clearedHistory);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white shadow-sm"
          autoFocus={autoFocus}
        />
        <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        
        {showTypeSelector && searchTypes.length > 0 && (
          <div className="flex gap-1 overflow-x-auto mt-2 pb-2 hide-scrollbar">
            {searchTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setActiveType(type.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeType === type.key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        )}
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
            <span className="text-sm font-medium text-gray-700">Suggestions</span>
            {searchHistory.length > 0 && (
              <button
                type="button"
                onClick={clearSearchHistory}
                className="text-xs text-pink-600 hover:text-pink-700 font-medium"
              >
                Clear history
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                type="button"
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
              >
                <FiClock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{suggestion}</span>
              </button>
            ))}
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