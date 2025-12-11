// RecentlyViewedPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

// Constants
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const WISHLIST_KEY = 'userWishlist';

const RecentlyViewedPage = () => {
  const navigate = useNavigate();
  const [viewedItems, setViewedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, today, week, month, year, wishlist
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest, price-high, price-low

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
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(item => {
          const viewedDate = new Date(item.viewedAt);
          return viewedDate >= yearAgo;
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
        
        // Update wishlist separately
        updateWishlist(items.find(item => item._id === itemId));
        
        setViewedItems(items);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const updateWishlist = (item) => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      let wishlist = stored ? JSON.parse(stored) : [];
      
      if (item.isLiked) {
        // Add to wishlist if not already there
        if (!wishlist.find(w => w._id === item._id && w.itemType === item.itemType)) {
          wishlist.push({
            ...item,
            addedToWishlistAt: new Date().toISOString()
          });
        }
      } else {
        // Remove from wishlist
        wishlist = wishlist.filter(w => !(w._id === item._id && w.itemType === item.itemType));
      }
      
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to update wishlist:', error);
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

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all recently viewed items?')) {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      setViewedItems([]);
      setFilteredItems([]);
    }
  };

  const getCategoryColor = (itemType) => {
    switch(itemType) {
      case 'properties': return 'bg-blue-100 text-blue-800';
      case 'services': return 'bg-emerald-100 text-emerald-800';
      case 'helpers': return 'bg-purple-100 text-purple-800';
      case 'events': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (itemType) => {
    switch(itemType) {
      case 'properties': return 'Property';
      case 'services': return 'Service';
      case 'helpers': return 'Helper';
      case 'events': return 'Event';
      default: return itemType;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  const getItemTypeIcon = (itemType) => {
    switch(itemType) {
      case 'properties': return '🏠';
      case 'services': return '✨';
      case 'helpers': return '👥';
      case 'events': return '🎉';
      default: return '📄';
    }
  };

  // Group items by date for section headers
  const groupItemsByDate = (items) => {
    const groups = {};
    
    items.forEach(item => {
      const date = new Date(item.viewedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month';
      } else if (date > new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Year';
      } else {
        groupKey = 'Older';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  };

  const groupedItems = groupItemsByDate(filteredItems);

  // Stats for filters
  const getStats = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    
    return {
      all: viewedItems.length,
      today: viewedItems.filter(item => new Date(item.viewedAt) >= today).length,
      week: viewedItems.filter(item => new Date(item.viewedAt) >= weekAgo).length,
      month: viewedItems.filter(item => new Date(item.viewedAt) >= monthAgo).length,
      year: viewedItems.filter(item => new Date(item.viewedAt) >= yearAgo).length,
      wishlist: viewedItems.filter(item => item.isLiked).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Recently Viewed</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Recently Viewed
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Your browsing history across all categories
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {viewedItems.length} items
              </div>
              {viewedItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter by time</h2>
            
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
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
              label="This Week"
              count={stats.week}
              active={activeFilter === 'week'}
              onClick={() => setActiveFilter('week')}
            />
            <FilterButton
              label="This Month"
              count={stats.month}
              active={activeFilter === 'month'}
              onClick={() => setActiveFilter('month')}
            />
            <FilterButton
              label="This Year"
              count={stats.year}
              active={activeFilter === 'year'}
              onClick={() => setActiveFilter('year')}
            />
            <FilterButton
              label="Wishlist"
              count={stats.wishlist}
              active={activeFilter === 'wishlist'}
              onClick={() => setActiveFilter('wishlist')}
              icon={<HeartIconSolid className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Views"
            value={viewedItems.length}
            icon={<EyeIcon className="w-5 h-5" />}
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="Wishlisted"
            value={stats.wishlist}
            icon={<HeartIconSolid className="w-5 h-5" />}
            color="bg-rose-50 text-rose-700"
          />
          <StatCard
            label="This Week"
            value={stats.week}
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            color="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Properties"
            value={viewedItems.filter(i => i.itemType === 'properties').length}
            icon={<span>🏠</span>}
            color="bg-purple-50 text-purple-700"
          />
          <StatCard
            label="Services"
            value={viewedItems.filter(i => i.itemType === 'services').length}
            icon={<span>✨</span>}
            color="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Events"
            value={viewedItems.filter(i => i.itemType === 'events').length}
            icon={<span>🎉</span>}
            color="bg-pink-50 text-pink-700"
          />
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <EmptyState
            filter={activeFilter}
            onClearFilter={() => setActiveFilter('all')}
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([groupName, items]) => (
              <div key={groupName} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {groupName}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {items.length} items
                    </span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <RecentlyViewedItemCard
                      key={`${item._id}-${item.viewedAt}`}
                      item={item}
                      onItemClick={handleItemClick}
                      onLike={handleLike}
                      onRemove={handleRemoveItem}
                      getCategoryColor={getCategoryColor}
                      getCategoryLabel={getCategoryLabel}
                      getTimeAgo={getTimeAgo}
                      getItemTypeIcon={getItemTypeIcon}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {viewedItems.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-rose-50 to-blue-50 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Manage your browsing history
                </h3>
                <p className="text-gray-600">
                  Export your history, view analytics, or customize your preferences
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                >
                  Clear All History
                </button>
                <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Sub-components
const FilterButton = ({ label, count, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-black text-white'
        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
    }`}
  >
    {icon && <span className="w-4 h-4">{icon}</span>}
    {label}
    <span className={`px-1.5 py-0.5 rounded text-xs ${
      active ? 'bg-white/20' : 'bg-gray-100'
    }`}>
      {count}
    </span>
  </button>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </div>
);

const RecentlyViewedItemCard = ({
  item,
  onItemClick,
  onLike,
  onRemove,
  getCategoryColor,
  getCategoryLabel,
  getTimeAgo,
  getItemTypeIcon
}) => {
  const price = item.price || item.regularPrice || 'N/A';
  const imageUrl = item.imageUrls?.[0] || item.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const name = item.name || item.title || 'Untitled';

  return (
    <div
      className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={() => onItemClick(item)}
    >
      {/* Item Image */}
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute -top-2 -left-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(item.itemType)}`}>
            {getCategoryLabel(item.itemType)}
          </span>
        </div>
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 truncate text-lg">
              {name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {item.description || item.address || 'No description available'}
            </p>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>{getTimeAgo(item.viewedAt)}</span>
              </div>
              
              {item.rating !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <StarIconSolid className="w-4 h-4 text-yellow-400" />
                  <span>{item.rating?.toFixed(1) || '4.5'}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-lg">{getItemTypeIcon(item.itemType)}</span>
                <span className="text-sm text-gray-500 capitalize">{item.itemType}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={(e) => onLike(item._id, e)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {item.isLiked ? (
                  <HeartIconSolid className="w-5 h-5 text-rose-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={(e) => onRemove(item._id, e)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                R{typeof price === 'number' ? price.toLocaleString() : price}
              </div>
              {item.type && (
                <div className="text-sm text-gray-500 capitalize">
                  {item.type.replace('-', ' ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* View Button */}
      <div className="flex-shrink-0">
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ filter, onClearFilter }) => (
  <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-200">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <EyeIcon className="w-10 h-10 text-gray-400" />
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3">
      {filter === 'wishlist' ? 'No wishlisted items' : 'No recently viewed items'}
    </h3>
    
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {filter === 'wishlist'
        ? 'Items you like will appear here. Start browsing and add items to your wishlist!'
        : filter === 'all'
        ? 'Start browsing properties, services, helpers, and events to see them here'
        : `No items viewed in the ${filter.toLowerCase()}. Try changing your filter.`}
    </p>
    
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {filter !== 'all' && (
        <button
          onClick={onClearFilter}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
        >
          Show All Items
        </button>
      )}
      <Link
        to="/"
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
      >
        Start Browsing
      </Link>
    </div>
  </div>
);

export default RecentlyViewedPage;