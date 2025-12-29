import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Grid,
  Sparkles,
  Home,
  Wrench,
  Users,
  Calendar,
  X,
  Map,
  List,
  Lightbulb,
  Clock
} from 'lucide-react';

const SEARCH_TYPE_CONFIG = {
  all: {
    label: 'All Categories',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  properties: {
    label: 'Properties',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  services: {
    label: 'Services',
    icon: Wrench,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500'
  },
  helpers: {
    label: 'Helpers',
    icon: Users,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-gradient-to-r from-orange-500 to-amber-500'
  },
  events: {
    label: 'Events',
    icon: Calendar,
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-gradient-to-r from-red-500 to-rose-500'
  }
};

const SearchHeader = ({
  searchType = 'all',
  onSearchTypeChange,
  searchTerm = '',
  onSearchTermChange,
  onSearch,
  showMap = false,
  onToggleMap,
  onOpenFilters,
  resultsCount = 0,
  location = 'South Africa',
  aiSuggestions = null,
  onApplyAiSuggestion,
  searchExamples = [],
  onExampleClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const handleExampleClick = (example) => {
    if (onExampleClick) onExampleClick(example);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Main Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Search Input Section */}
          <div className="relative">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder={`Search ${SEARCH_TYPE_CONFIG[searchType]?.label?.toLowerCase() || 'everything'} in ${location}...`}
                  className="w-full pl-12 pr-32 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white focus:shadow-lg transition-all duration-300"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => onSearchTermChange('')}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* AI Suggestions */}
            <AnimatePresence>
              {aiSuggestions && !aiSuggestions.applied && isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-800">AI Suggestions</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Based on your search, we recommend:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {aiSuggestions.type && aiSuggestions.type !== 'all' && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Search type: {aiSuggestions.type}
                            </span>
                          )}
                          {Object.entries(aiSuggestions.filters || {}).map(([key, value]) => (
                            <span key={key} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {key}: {value.toString()}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={onApplyAiSuggestion}
                          className="mt-3 text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                        >
                          Apply Suggestions
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Type Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {Object.entries(SEARCH_TYPE_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = searchType === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => onSearchTypeChange(key)}
                    className={`px-4 py-2.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? `${config.bgColor} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenFilters}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              
              <button
                onClick={onToggleMap}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                  showMap
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showMap ? (
                  <>
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Examples */}
          {isFocused && searchExamples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-2"
            >
              <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {searchExamples.map((example, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all duration-300 hover:shadow-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Location and Results Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            
            {resultsCount > 0 && (
              <div className="text-gray-700">
                <span className="font-medium">{resultsCount}</span> results found
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;