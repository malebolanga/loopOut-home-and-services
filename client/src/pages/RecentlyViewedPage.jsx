// RecentlyViewedPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  ChevronLeftIcon,
  TrashIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

// Constants
const RECENTLY_VIEWED_KEY = 'recentlyViewed';

const RecentlyViewedPage = () => {
  const navigate = useNavigate();
  const [viewedItems, setViewedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Load data on component mount
  useEffect(() => {
    loadRecentlyViewedItems();
  }, []);

  // Apply filters whenever activeFilter or sortBy changes
  useEffect(() => {
    applyFilters();
  }, [activeFilter, sortBy, viewedItems]);

  const loadRecentlyViewedItems = () => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        setViewedItems(items);
        setFilteredItems(items);
      }
    } catch (error) {
      console.error('Failed to load recently viewed items:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...viewedItems];

    // Apply date filters
    const now = new Date();
    switch (activeFilter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(item => {
          const viewedDate = new Date(item.viewedAt);
          return viewedDate >= today;
        });
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(item => {
          const viewedDate = new Date(item.viewedAt);
          return viewedDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(item => {
          const viewedDate = new Date(item.viewedAt);
          return viewedDate >= monthAgo;
        });
        break;
      case 'wishlist':
        filtered = filtered.filter(item => item.isLiked);
        break;
      case 'all':
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.viewedAt) - new Date(a.viewedAt);
        case 'oldest':
          return new Date(a.viewedAt) - new Date(b.viewedAt);
        case 'price-high':
          return (b.price || b.regularPrice || 0) - (a.price || a.regularPrice || 0);
        case 'price-low':
          return (a.price || a.regularPrice || 0) - (b.price || b.regularPrice || 0);
        default:
          return new Date(b.viewedAt) - new Date(a.viewedAt);
      }
    });

    setFilteredItems(filtered);
    setSelectedItems(new Set()); // Clear selections when filters change
  };

  const handleItemClick = (item) => {
    switch (item.itemType) {
      case 'properties':
        navigate(`/listing/${item._id}`);
        break;
      case 'services':
        navigate(`/service/${item._id}`);
        break;
      case 'helpers':
        navigate(`/helper/${item._id}`);
        break;
      case 'events':
        navigate(`/event/${item._id}`);
        break;
      default:
        navigate(`/item/${item._id}`);
    }
  };

  const handleLike = (itemId, e) => {
    e.stopPropagation();
    
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.map(item => 
          item._id === itemId ? { ...item, isLiked: !item.isLiked } : item
        );
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setViewedItems(items);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const handleRemoveItem = (itemId, e) => {
    e.stopPropagation();
    
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.filter(item => item._id !== itemId);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setViewedItems(items);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleSelectItem = (itemId, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleRemoveSelected = () => {
    if (selectedItems.size === 0) return;
    
    if (window.confirm(`Remove ${selectedItems.size} selected item(s)?`)) {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          let items = JSON.parse(stored);
          items = items.filter(item => !selectedItems.has(item._id));
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
          setViewedItems(items);
          setSelectedItems(new Set());
        }
      } catch (error) {
        console.error('Failed to remove selected items:', error);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all recently viewed items?')) {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      setViewedItems([]);
      setFilteredItems([]);
      setSelectedItems(new Set());
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays/7)}w ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (itemType) => {
    switch(itemType) {
      case 'properties': return '🏠';
      case 'services': return '✨';
      case 'helpers': return '👤';
      case 'events': return '🎉';
      default: return '📄';
    }
  };

  const getFormattedPrice = (price) => {
    if (!price || price === 'N/A') return 'N/A';
    if (typeof price === 'number') {
      return price < 1000 ? `R${price}` : `R${(price/1000).toFixed(0)}k`;
    }
    return price;
  };

  // Stats for filters
  const getStats = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    return {
      all: viewedItems.length,
      today: viewedItems.filter(item => new Date(item.viewedAt) >= today).length,
      week: viewedItems.filter(item => new Date(item.viewedAt) >= weekAgo).length,
      month: viewedItems.filter(item => new Date(item.viewedAt) >= monthAgo).length,
      wishlist: viewedItems.filter(item => item.isLiked).length
    };
  };

  const stats = getStats();

  const FilterButton = ({ label, count, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-black text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
        active ? 'bg-white/20' : 'bg-white'
      }`}>
        {count}
      </span>
    </button>
  );

  const RecentlyViewedCard = ({ item, isSelected }) => {
    const price = item.price || item.regularPrice || 'N/A';
    const imageUrl = item.imageUrls?.[0] || item.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    const name = item.name || item.title || 'Untitled';
    const categoryIcon = getCategoryIcon(item.itemType);
    const timeAgo = getTimeAgo(item.viewedAt);
    const formattedPrice = getFormattedPrice(price);

    return (
      <div
        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
        onClick={() => handleItemClick(item)}
      >
        {/* Selection checkbox */}
        <button
          onClick={(e) => handleSelectItem(item._id, e)}
          className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-blue-500 border-blue-500' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Small thumbnail */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          {/* Category icon overlay */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
            <span className="text-xs">{categoryIcon}</span>
          </div>
        </div>

        {/* Compact info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <ClockIcon className="w-3 h-3" />
                  {timeAgo}
                </span>
                {item.rating !== undefined && (
                  <span className="text-xs text-gray-500 flex items-center gap-0.5">
                    <StarIconSolid className="w-3 h-3 text-yellow-400" />
                    {item.rating?.toFixed(1) || '4.5'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-sm font-semibold text-gray-900">
                {formattedPrice}
              </div>
              {item.type && (
                <div className="text-xs text-gray-500 capitalize mt-0.5">
                  {item.type.replace('-', ' ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Like button */}
        <button
          onClick={(e) => handleLike(item._id, e)}
          className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {item.isLiked ? (
            <HeartIconSolid className="w-4 h-4 text-rose-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    );
  };

  const EmptyState = ({ filter }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <EyeIcon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="font-medium text-gray-900 mb-2">
        {filter === 'wishlist' ? 'No saved items' : 'No recently viewed'}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
        {filter === 'wishlist'
          ? 'Like items to see them here'
          : 'Start browsing to build your history'}
      </p>
      
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        Start Browsing
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl animate-pulse">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Recently Viewed</h1>
                <p className="text-xs text-gray-500">
                  {viewedItems.length} items • {selectedItems.size} selected
                </p>
              </div>
            </div>
            
            {selectedItems.size > 0 ? (
              <button
                onClick={handleRemoveSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Remove ({selectedItems.size})
              </button>
            ) : (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-0 bg-transparent focus:outline-none focus:ring-0"
              >
                <option value="recent">Recent first</option>
                <option value="oldest">Oldest first</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              count={stats.all}
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
            <FilterButton
              label="Today"
              count={stats.today}
              active={activeFilter === 'today'}
              onClick={() => setActiveFilter('today')}
            />
            <FilterButton
              label="Week"
              count={stats.week}
              active={activeFilter === 'week'}
              onClick={() => setActiveFilter('week')}
            />
            <FilterButton
              label="Month"
              count={stats.month}
              active={activeFilter === 'month'}
              onClick={() => setActiveFilter('month')}
            />
            <FilterButton
              label="Saved"
              count={stats.wishlist}
              active={activeFilter === 'wishlist'}
              onClick={() => setActiveFilter('wishlist')}
            />
          </div>
        </div>

        {/* Select All Bar */}
        {filteredItems.length > 0 && selectedItems.size < filteredItems.length && (
          <div className="mb-4">
            <button
              onClick={() => setSelectedItems(new Set(filteredItems.map(item => item._id)))}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Select all {filteredItems.length} items
            </button>
          </div>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl p-6">
            <EmptyState filter={activeFilter} />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={`${item._id}-${item.viewedAt}`} className="bg-white rounded-xl">
                <RecentlyViewedCard 
                  item={item}
                  isSelected={selectedItems.has(item._id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {viewedItems.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{stats.all}</div>
                <div className="text-xs text-gray-500 mt-0.5">Total</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{stats.today}</div>
                <div className="text-xs text-gray-500 mt-0.5">Today</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{stats.wishlist}</div>
                <div className="text-xs text-gray-500 mt-0.5">Saved</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        {viewedItems.length > 0 && (
          <div className="mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-3">
                Your browsing history is stored locally and automatically updates as you explore.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  Clear History
                </button>
                <Link
                  to="/"
                  className="flex-1 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 text-center transition-colors"
                >
                  Continue Browsing
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecentlyViewedPage;