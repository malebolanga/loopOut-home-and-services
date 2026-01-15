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
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  SparklesIcon,
  UsersIcon,
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

  const getCategoryColor = (itemType) => {
    switch(itemType) {
      case 'properties': return 'bg-blue-100 text-blue-600';
      case 'services': return 'bg-purple-100 text-purple-600';
      case 'helpers': return 'bg-green-100 text-green-600';
      case 'events': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryLabel = (itemType) => {
    switch(itemType) {
      case 'properties': return 'Property';
      case 'services': return 'Service';
      case 'helpers': return 'Helper';
      case 'events': return 'Event';
      default: return 'Item';
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

  const FilterButton = ({ label, count, active, onClick, emoji }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-pink-200'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-white/20' : 'bg-gray-100'
      }`}>
        {count}
      </span>
    </button>
  );

  const GridCard = ({ item }) => {
    const price = item.price || item.regularPrice || 'N/A';
    const imageUrl = item.imageUrls?.[0] || item.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    const name = item.name || item.title || 'Untitled';
    const location = item.address || item.location || 'Location not specified';
    const timeAgo = getTimeAgo(item.viewedAt);
    const formattedPrice = getFormattedPrice(price);
    const categoryColor = getCategoryColor(item.itemType);

    return (
      <div
        className="rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => handleItemClick(item)}
      >
        {/* Image section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
          />
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${categoryColor}`}>
              {getCategoryLabel(item.itemType)}
            </span>
          </div>
          
          {/* Like button */}
          <button
            onClick={(e) => handleLike(item._id, e)}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
          >
            {item.isLiked ? (
              <HeartIconSolid className="w-5 h-5 text-rose-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          {/* Time indicator */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            <ClockIcon className="w-3 h-3 inline mr-1" />
            {timeAgo}
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900 text-lg truncate">{name}</h3>
            <div className="flex items-center gap-1">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">{item.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{location}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-gray-900">
              {formattedPrice}
              {item.type === 'rent' && <span className="text-sm font-normal text-gray-600">/month</span>}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ListCard = ({ item, isSelected }) => {
    const price = item.price || item.regularPrice || 'N/A';
    const imageUrl = item.imageUrls?.[0] || item.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    const name = item.name || item.title || 'Untitled';
    const location = item.address || item.location || 'Location not specified';
    const timeAgo = getTimeAgo(item.viewedAt);
    const formattedPrice = getFormattedPrice(price);
    const categoryColor = getCategoryColor(item.itemType);

    return (
      <div
        className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => handleItemClick(item)}
      >
        <div className="flex gap-4">
          {/* Selection checkbox */}
          <button
            onClick={(e) => handleSelectItem(item._id, e)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors self-center ${
              isSelected 
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 border-transparent' 
                : 'border-gray-300 hover:border-rose-400'
            }`}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          {/* Image */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-200">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
              <span className="text-xs font-semibold">{getCategoryIcon(item.itemType)}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${categoryColor}`}>
                    {getCategoryLabel(item.itemType)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {timeAgo}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="truncate">{location}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formattedPrice}
                  {item.type === 'rent' && <span className="text-sm font-normal text-gray-600">/month</span>}
                </div>
                <div className="flex items-center gap-1">
                  <StarIconSolid className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-sm">{item.rating?.toFixed(1) || '4.5'}</span>
                  <span className="text-gray-500 text-sm">({item.reviews || 0})</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {item.bedrooms && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <HomeIcon className="w-4 h-4" /> {item.bedrooms} beds
                  </span>
                )}
                {item.bathrooms && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <BuildingOfficeIcon className="w-4 h-4" /> {item.bathrooms} baths
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleLike(item._id, e)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.isLiked ? (
                    <HeartIconSolid className="w-5 h-5 text-rose-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ filter }) => (
    <div className="bg-white rounded-2xl p-12 text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <EyeIcon className="w-12 h-12 text-rose-500" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {filter === 'wishlist' ? 'No saved items yet' : 'No recently viewed items'}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {filter === 'wishlist'
          ? 'Start liking items to save them for later. Click the heart icon on any listing.'
          : 'Start browsing properties, services, helpers, and events to build your history.'}
      </p>
      
      <div className="flex gap-4 justify-center">
        <Link
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-pink-200"
        >
          Start Browsing
        </Link>
        {filter === 'wishlist' && (
          <Link
            to="/wishlist"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            View Wishlist
          </Link>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Skeleton Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          </div>
          
          {/* Skeleton Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-24 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-14">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-2">Recently Viewed</h1>
                <p className="text-rose-100">
                  Your personal browsing history • {viewedItems.length} items • {stats.wishlist} saved
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedItems.size > 0 && (
                <button
                  onClick={handleRemoveSelected}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
                >
                  <TrashIcon className="w-5 h-5" />
                  Remove {selectedItems.size}
                </button>
              )}
              
              <div className="flex bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-rose-600' : 'text-white hover:bg-white/10'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 transition-colors ${viewMode === 'list' ? 'bg-white text-rose-600' : 'text-white hover:bg-white/10'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.all}</div>
              <div className="text-sm text-rose-100">Total Views</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.today}</div>
              <div className="text-sm text-rose-100">Today</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.week}</div>
              <div className="text-sm text-rose-100">This Week</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.month}</div>
              <div className="text-sm text-rose-100">This Month</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.wishlist}</div>
              <div className="text-sm text-rose-100">Saved</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters & Sorting */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter by time:</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <ArrowsUpDownIcon className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <FilterButton
              label="All"
              emoji="📚"
              count={stats.all}
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
            <FilterButton
              label="Today"
              emoji="🌞"
              count={stats.today}
              active={activeFilter === 'today'}
              onClick={() => setActiveFilter('today')}
            />
            <FilterButton
              label="Week"
              emoji="📅"
              count={stats.week}
              active={activeFilter === 'week'}
              onClick={() => setActiveFilter('week')}
            />
            <FilterButton
              label="Month"
              emoji="📆"
              count={stats.month}
              active={activeFilter === 'month'}
              onClick={() => setActiveFilter('month')}
            />
            <FilterButton
              label="Saved"
              emoji="❤️"
              count={stats.wishlist}
              active={activeFilter === 'wishlist'}
              onClick={() => setActiveFilter('wishlist')}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                onChange={() => {
                  if (selectedItems.size === filteredItems.length) {
                    setSelectedItems(new Set());
                  } else {
                    setSelectedItems(new Set(filteredItems.map(item => item._id)));
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="font-medium text-gray-900">
                {selectedItems.size === filteredItems.length && filteredItems.length > 0
                  ? 'All items selected'
                  : `${selectedItems.size} of ${filteredItems.length} selected`}
              </span>
            </div>
            
            {selectedItems.size > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleRemoveSelected}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Remove Selected
                </button>
                <button
                  onClick={() => {
                    const likedItems = filteredItems.filter(item => selectedItems.has(item._id));
                    likedItems.forEach(item => handleLike(item._id, { stopPropagation: () => {} }));
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Save All
                </button>
              </div>
            )}
          </div>
        )}

        {/* Items Display */}
        {filteredItems.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <GridCard key={`${item._id}-${item.viewedAt}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <ListCard
                key={`${item._id}-${item.viewedAt}`}
                item={item}
                isSelected={selectedItems.has(item._id)}
              />
            ))}
          </div>
        )}

        {/* History Management */}
        {viewedItems.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Your History</h3>
                <p className="text-gray-600">
                  Your browsing history is private and stored locally. Clear it anytime or continue exploring.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear All History
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-center"
                >
                  Continue Exploring
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {viewedItems.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['properties', 'services', 'helpers', 'events'].map((category) => {
                const count = viewedItems.filter(item => item.itemType === category).length;
                const percentage = viewedItems.length > 0 ? (count / viewedItems.length * 100).toFixed(0) : 0;
                
                return (
                  <div key={category} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {getCategoryLabel(category)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}% of views</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecentlyViewedPage;