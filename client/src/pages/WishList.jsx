import { useEffect, useState } from 'react';
import { 
  FaHeart,
  FaSpinner,
  FaTrash,
  FaFilter,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTools,
  FaHome,
  FaTag,
  FaEye,
  FaShareAlt,
  FaDownload,
  FaSortAmountDown,
  FaChevronDown,
  FaSearch,
  FaUserFriends,
  FaLock,
  FaGlobe,
  FaPlus,
  FaEllipsisH,
  FaEdit,
  FaCog,
  FaTimes,
  FaBed,
  FaBath,
  FaUser,
  FaStar,
  FaCheckCircle,
  FaRegHeart,
  FaRegBookmark,
  FaSlidersH,
  FaChartBar
} from 'react-icons/fa';
import { TbHeartFilled, TbGridDots } from 'react-icons/tb';
import { MdGridView, MdList } from 'react-icons/md';
import "../styles/breakpoints.scss";

// Custom icons
const ImagesIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function WishList() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showStats, setShowStats] = useState(false);

  // Enhanced stats with more details
  const stats = {
    all: wishlist.length,
    listings: wishlist.filter(item => item.type === 'listing').length,
    services: wishlist.filter(item => item.type === 'service').length,
    helpers: wishlist.filter(item => item.type === 'helper').length,
    events: wishlist.filter(item => item.type === 'event').length,
    totalValue: wishlist.reduce((sum, item) => {
      const price = parseFloat(item.price || item.cost || item.pricePerHour || item.ticketPrice || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0)
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      try {
        const storedListings = JSON.parse(localStorage.getItem('wishlist')) || [];
        const storedServices = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
        const storedHelpers = JSON.parse(localStorage.getItem('helperWishlist')) || [];
        const storedEvents = JSON.parse(localStorage.getItem('eventWishlist')) || [];
        
        const safeParse = (data) => {
          if (!Array.isArray(data)) return [];
          return data;
        };
        
        const listingsWithType = safeParse(storedListings).map(item => ({ 
          ...item, 
          type: 'listing', 
          addedAt: item.addedAt || Date.now() 
        }));
        const servicesWithType = safeParse(storedServices).map(item => ({ 
          ...item, 
          type: 'service', 
          addedAt: item.addedAt || Date.now() 
        }));
        const helpersWithType = safeParse(storedHelpers).map(item => ({ 
          ...item, 
          type: 'helper', 
          addedAt: item.addedAt || Date.now() 
        }));
        const eventsWithType = safeParse(storedEvents).map(item => ({ 
          ...item, 
          type: 'event', 
          addedAt: item.addedAt || Date.now() 
        }));
        
        let combined = [...listingsWithType, ...servicesWithType, ...helpersWithType, ...eventsWithType];
        combined = sortWishlist(combined, sortBy);
        
        setWishlist(combined);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        localStorage.setItem('wishlist', JSON.stringify([]));
        localStorage.setItem('serviceWishlist', JSON.stringify([]));
        localStorage.setItem('helperWishlist', JSON.stringify([]));
        localStorage.setItem('eventWishlist', JSON.stringify([]));
        setWishlist([]);
      }
      setLoading(false);
    }, 300);

    const handleStorageChange = (e) => {
      if (e.key === 'wishlist' || e.key === 'serviceWishlist' || e.key === 'helperWishlist' || e.key === 'eventWishlist') {
        try {
          const storedListings = JSON.parse(localStorage.getItem('wishlist')) || [];
          const storedServices = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
          const storedHelpers = JSON.parse(localStorage.getItem('helperWishlist')) || [];
          const storedEvents = JSON.parse(localStorage.getItem('eventWishlist')) || [];
          
          const listingsWithType = storedListings.map(item => ({ 
            ...item, 
            type: 'listing', 
            addedAt: item.addedAt || Date.now() 
          }));
          const servicesWithType = storedServices.map(item => ({ 
            ...item, 
            type: 'service', 
            addedAt: item.addedAt || Date.now() 
          }));
          const helpersWithType = storedHelpers.map(item => ({ 
            ...item, 
            type: 'helper', 
            addedAt: item.addedAt || Date.now() 
          }));
          const eventsWithType = storedEvents.map(item => ({ 
            ...item, 
            type: 'event', 
            addedAt: item.addedAt || Date.now() 
          }));
          
          let combined = [...listingsWithType, ...servicesWithType, ...helpersWithType, ...eventsWithType];
          combined = sortWishlist(combined, sortBy);
          
          setWishlist(combined);
        } catch (error) {
          console.error('Error loading wishlist on storage change:', error);
          setWishlist([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    try {
      const storedListings = JSON.parse(localStorage.getItem('wishlist')) || [];
      const storedServices = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
      const storedHelpers = JSON.parse(localStorage.getItem('helperWishlist')) || [];
      const storedEvents = JSON.parse(localStorage.getItem('eventWishlist')) || [];
      
      const listingsWithType = storedListings.map(item => ({ 
        ...item, 
        type: 'listing', 
        addedAt: item.addedAt || Date.now() 
      }));
      const servicesWithType = storedServices.map(item => ({ 
        ...item, 
        type: 'service', 
        addedAt: item.addedAt || Date.now() 
      }));
      const helpersWithType = storedHelpers.map(item => ({ 
        ...item, 
        type: 'helper', 
        addedAt: item.addedAt || Date.now() 
      }));
      const eventsWithType = storedEvents.map(item => ({ 
        ...item, 
        type: 'event', 
        addedAt: item.addedAt || Date.now() 
      }));
      
      let combined = [...listingsWithType, ...servicesWithType, ...helpersWithType, ...eventsWithType];
      combined = sortWishlist(combined, sortBy);
      
      setWishlist(combined);
      setLoading(false);
      clearTimeout(timer);
    } catch (error) {
      console.error('Error in immediate load:', error);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sortBy]);

  const sortWishlist = (items, sortType) => {
    if (!Array.isArray(items)) return [];
    
    const sorted = [...items];
    switch(sortType) {
      case 'recent':
        return sorted.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
      case 'oldest':
        return sorted.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
      case 'name':
        return sorted.sort((a, b) => {
          const aName = (a.title || a.name || a.eventName || '').toLowerCase();
          const bName = (b.title || b.name || b.eventName || '').toLowerCase();
          return aName.localeCompare(bName);
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const aPrice = parseFloat(a.price || a.cost || a.pricePerHour || 0);
          const bPrice = parseFloat(b.price || b.cost || b.pricePerHour || 0);
          return bPrice - aPrice;
        });
      case 'price-low':
        return sorted.sort((a, b) => {
          const aPrice = parseFloat(a.price || a.cost || a.pricePerHour || 0);
          const bPrice = parseFloat(b.price || b.cost || b.pricePerHour || 0);
          return aPrice - bPrice;
        });
      case 'rating':
        return sorted.sort((a, b) => {
          const aRating = a.rating || Math.random() * 2 + 3.5;
          const bRating = b.rating || Math.random() * 2 + 3.5;
          return bRating - aRating;
        });
      default:
        return sorted;
    }
  };

  const filteredWishlist = filterType === 'all' 
    ? wishlist 
    : wishlist.filter(item => item.type === filterType);

  // Apply search filter
  const searchedWishlist = searchQuery 
    ? filteredWishlist.filter(item => {
        const searchText = (item.title || item.name || item.eventName || '').toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    : filteredWishlist;

  const removeFromWishlist = async (itemId, itemType) => {
    try {
      setRemovingId(itemId);
      
      setWishlist(prev => prev.filter(item => !(item._id === itemId && item.type === itemType)));
      
      const storageKeys = {
        listing: 'wishlist',
        service: 'serviceWishlist',
        helper: 'helperWishlist',
        event: 'eventWishlist'
      };
      
      if (storageKeys[itemType]) {
        const key = storageKeys[itemType];
        try {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            const updatedWishlist = JSON.parse(storedData);
            if (Array.isArray(updatedWishlist)) {
              const filtered = updatedWishlist.filter(item => item._id !== itemId);
              localStorage.setItem(key, JSON.stringify(filtered));
            }
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
      
      setSelectedItems(prev => prev.filter(id => id !== `${itemType}-${itemId}`));
      
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all items from your wishlist?')) {
      localStorage.setItem('wishlist', JSON.stringify([]));
      localStorage.setItem('serviceWishlist', JSON.stringify([]));
      localStorage.setItem('helperWishlist', JSON.stringify([]));
      localStorage.setItem('eventWishlist', JSON.stringify([]));
      setWishlist([]);
      setSelectedItems([]);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const toggleSelectItem = (itemId, itemType) => {
    const id = `${itemType}-${itemId}`;
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const removeSelected = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to remove ${selectedItems.length} selected item(s)?`)) {
      selectedItems.forEach(id => {
        const [type, itemId] = id.split('-');
        const storageKeys = {
          listing: 'wishlist',
          service: 'serviceWishlist',
          helper: 'helperWishlist',
          event: 'eventWishlist'
        };
        
        if (storageKeys[type]) {
          const key = storageKeys[type];
          try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
              const updatedWishlist = JSON.parse(storedData);
              if (Array.isArray(updatedWishlist)) {
                const filtered = updatedWishlist.filter(item => item._id !== itemId);
                localStorage.setItem(key, JSON.stringify(filtered));
              }
            }
          } catch (error) {
            console.error(`Error removing ${type}:`, error);
          }
        }
      });
      
      setWishlist(prev => prev.filter(item => 
        !selectedItems.includes(`${item.type}-${item._id}`)
      ));
      setSelectedItems([]);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const createNewList = () => {
    if (!newListName.trim()) return;
    
    // In a real app, you would save this to your backend
    console.log('Creating new list:', { newListName, newListDescription, isPrivate });
    
    // Reset form
    setNewListName('');
    setNewListDescription('');
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A5F] to-[#FF8C94] rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-[#FF5A5F] to-[#FF8C94] rounded-full flex items-center justify-center">
              <TbHeartFilled className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
            Loading your collection
          </h1>
          <p className="text-gray-600">Curating your saved items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header - Premium Design */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A5F] to-[#FF8C94] flex items-center justify-center shadow-lg">
                  <TbHeartFilled className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    My Collections
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1 flex items-center">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-medium">
                      {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">
                      R{stats.totalValue.toLocaleString()} total value
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all hover:shadow-sm"
                title="View statistics"
              >
                <FaChartBar className="text-gray-600" />
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] flex items-center space-x-2"
              >
                <FaPlus className="text-white" />
                <span>New Collection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="bg-white border-b border-gray-200/50 shadow-sm animate-slideDown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-900">{stats.all}</div>
                <div className="text-sm text-blue-700 font-medium">Total Items</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-900">{stats.listings}</div>
                <div className="text-sm text-emerald-700 font-medium">Listings</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-100">
                <div className="text-2xl font-bold text-purple-900">{stats.services}</div>
                <div className="text-sm text-purple-700 font-medium">Services</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-100">
                <div className="text-2xl font-bold text-amber-900">{stats.helpers}</div>
                <div className="text-sm text-amber-700 font-medium">Helpers</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-100">
                <div className="text-2xl font-bold text-rose-900">{stats.events}</div>
                <div className="text-sm text-rose-700 font-medium">Events</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Control Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Search Bar - Premium */}
              <div className="relative flex-grow max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search in your collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] transition-all"
                />
              </div>

              {/* Control Panel */}
              <div className="flex flex-wrap items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-[#FF5A5F]' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MdGridView className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-[#FF5A5F]' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MdList className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 hover:shadow-sm"
                  >
                    <FaSlidersH className="text-gray-500" />
                    <span>Sort & Filter</span>
                    <FaChevronDown className={`text-xs transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isFilterOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsFilterOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Sort by
                        </div>
                        {['recent', 'oldest', 'name', 'price-high', 'price-low', 'rating'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm flex items-center justify-between ${
                              sortBy === option ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                            }`}
                          >
                            <span>{option.replace('-', ' ')}</span>
                            {sortBy === option && <FaCheckCircle className="text-[#FF5A5F] w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Action Buttons */}
                {selectedItems.length > 0 && (
                  <button
                    onClick={removeSelected}
                    className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] flex items-center space-x-2"
                  >
                    <FaTrash className="text-white" />
                    <span>Remove ({selectedItems.length})</span>
                  </button>
                )}
                
                <button
                  onClick={clearAll}
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 hover:border-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {/* Type Filters - Premium */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  filterType === 'all'
                    ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <TbGridDots />
                <span>All ({stats.all})</span>
              </button>
              <button
                onClick={() => setFilterType('listing')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  filterType === 'listing'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                <FaHome />
                <span>Listings ({stats.listings})</span>
              </button>
              <button
                onClick={() => setFilterType('service')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  filterType === 'service'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 hover:shadow-sm'
                }`}
              >
                <FaTools />
                <span>Services ({stats.services})</span>
              </button>
              <button
                onClick={() => setFilterType('helper')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  filterType === 'helper'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 hover:shadow-sm'
                }`}
              >
                <FaTag />
                <span>Helpers ({stats.helpers})</span>
              </button>
              <button
                onClick={() => setFilterType('event')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  filterType === 'event'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 hover:shadow-sm'
                }`}
              >
                <FaCalendarAlt />
                <span>Events ({stats.events})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {searchedWishlist.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-gray-50 to-white rounded-full shadow-inner flex items-center justify-center">
                <TbHeartFilled className="w-16 h-16 text-gray-300" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              {searchQuery ? 'No matches found' : 'Your collection awaits'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-10 text-lg">
              {searchQuery 
                ? 'Try adjusting your search or explore our curated collections'
                : 'Start building your dream collection by saving listings, services, and experiences that inspire you.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => window.location.href = '/listings'}
                className="px-8 py-4 bg-gradient-to-r from-[#FF5A5F] to-[#FF8C94] text-white rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] font-semibold text-lg"
              >
                Discover Listings
              </button>
              <button 
                onClick={() => window.location.href = '/services'}
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:shadow-xl transition-all hover:scale-[1.02] font-semibold text-lg"
              >
                Explore Services
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'} gap-6`}>
              {searchedWishlist.map((item) => (
                viewMode === 'grid' ? (
                  <PremiumWishlistCard
                    key={`${item.type}-${item._id}`}
                    item={item}
                    removingId={removingId}
                    removeFromWishlist={removeFromWishlist}
                    isSelected={selectedItems.includes(`${item.type}-${item._id}`)}
                    onSelect={() => toggleSelectItem(item._id, item.type)}
                  />
                ) : (
                  <PremiumListCard
                    key={`${item.type}-${item._id}`}
                    item={item}
                    removingId={removingId}
                    removeFromWishlist={removeFromWishlist}
                    isSelected={selectedItems.includes(`${item.type}-${item._id}`)}
                    onSelect={() => toggleSelectItem(item._id, item.type)}
                  />
                )
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all text-sm font-medium group">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <FaShareAlt className="w-4 h-4" />
                    </div>
                    <span>Share Collection</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all text-sm font-medium group">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <FaDownload className="w-4 h-4" />
                    </div>
                    <span>Export as PDF</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all text-sm font-medium group">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <FaEdit className="w-4 h-4" />
                    </div>
                    <span>Edit Details</span>
                  </button>
                </div>
                <div className="text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <span className="font-medium text-gray-700">{searchedWishlist.length}</span> items • 
                  <span className="mx-2">•</span>
                  Updated just now
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create New List Modal - Premium */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Create New Collection</h3>
                <p className="text-gray-600 text-sm mt-1">Organize your saved items into curated lists</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Dream Homes, Wedding Planning, etc."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Description (optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="What's this collection about? Add a brief description..."
                  rows="3"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] focus:bg-white transition-all resize-none"
                />
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isPrivate ? (
                      <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <FaLock className="text-blue-600" />
                      </div>
                    ) : (
                      <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                        <FaGlobe className="text-emerald-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {isPrivate ? 'Private Collection' : 'Public Collection'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isPrivate ? 'Only visible to you' : 'Visible to everyone'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="text-sm font-semibold text-[#FF5A5F] hover:text-[#E14E50]"
                  >
                    {isPrivate ? 'Make Public' : 'Make Private'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewList}
                disabled={!newListName.trim()}
                className={`px-8 py-3.5 rounded-xl font-semibold transition-all ${
                  newListName.trim()
                    ? 'bg-gradient-to-r from-[#FF5A5F] to-[#FF8C94] text-white hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Grid Card Component
function PremiumWishlistCard({ item, removingId, removeFromWishlist, isSelected, onSelect }) {
  const getPrice = () => {
    if (item.type === 'listing') {
      return item.regularPrice ? `R${item.regularPrice}` : 'Price not set';
    } else if (item.type === 'service') {
      return item.cost ? `R${item.cost}` : 'Price not set';
    } else if (item.type === 'helper') {
      return item.pricePerHour ? `R${item.pricePerHour}/hr` : 'Price not set';
    } else if (item.type === 'event') {
      return item.ticketPrice ? `R${item.ticketPrice}` : 'Free';
    }
    return 'Check price';
  };

  const getRating = () => {
    return item.rating || Math.random() * 2 + 3.5;
  };

  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    return 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };

  const getTitle = () => {
    return item.title || item.name || item.eventName || 'Untitled Item';
  };

  const getLocation = () => {
    return item.address || item.location || 'Location not specified';
  };

  const getDetails = () => {
    if (item.type === 'listing') {
      return `${item.bedrooms || '?'} beds • ${item.bathrooms || '?'} baths`;
    } else if (item.type === 'service') {
      return `${item.serviceType || 'Service'}`;
    } else if (item.type === 'helper') {
      return `${item.skills?.split(',').slice(0, 2).join(', ') || 'Various'}`;
    } else if (item.type === 'event') {
      return `${item.date || 'Date TBD'}`;
    }
    return 'Details';
  };

  const getTypeColor = () => {
    switch(item.type) {
      case 'listing': return 'from-blue-500 to-blue-600';
      case 'service': return 'from-purple-500 to-purple-600';
      case 'helper': return 'from-amber-500 to-amber-600';
      case 'event': return 'from-rose-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = () => {
    switch(item.type) {
      case 'listing': return <FaHome className="w-4 h-4" />;
      case 'service': return <FaTools className="w-4 h-4" />;
      case 'helper': return <FaTag className="w-4 h-4" />;
      case 'event': return <FaCalendarAlt className="w-4 h-4" />;
      default: return <FaStar className="w-4 h-4" />;
    }
  };

  // Function to get view URL based on item type
  const getViewUrl = () => {
    const baseUrl = 'http://localhost:5173';
    switch(item.type) {
      case 'listing':
        return `${baseUrl}/listing/${item._id}`;
      case 'service':
        return `${baseUrl}/service/${item._id}`;
      case 'helper':
        return `${baseUrl}/helper/${item._id}`;
      case 'event':
        return `${baseUrl}/event/${item._id}`;
      default:
        return `${baseUrl}`;
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-gray-300 cursor-pointer">
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded-lg border-gray-300 text-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20 focus:ring-offset-2 cursor-pointer"
        />
      </div>
      
      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFromWishlist(item._id, item.type);
        }}
        disabled={removingId === item._id}
        className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg ${
          removingId === item._id 
            ? 'text-gray-500' 
            : 'text-gray-600 hover:text-red-500 hover:bg-white hover:scale-105'
        }`}
        aria-label="Remove from wishlist"
      >
        {removingId === item._id ? (
          <FaSpinner className="w-4 h-4 animate-spin" />
        ) : (
          <TbHeartFilled className="w-4 h-4 text-red-500" />
        )}
      </button>
      
      {/* Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Type Badge */}
        <div className={`absolute top-4 left-14 bg-gradient-to-r ${getTypeColor()} text-white rounded-lg px-3 py-1.5 flex items-center text-xs font-semibold shadow-lg`}>
          {getTypeIcon()}
          <span className="ml-2 capitalize">{item.type === 'listing' ? 'Listing' : item.type}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg px-2.5 py-1">
            <FaStar className="text-amber-500 mr-1.5 w-4 h-4" />
            <span className="text-sm font-bold text-amber-900">
              {getRating().toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FF5A5F] transition-colors">
          {getTitle()}
        </h3>
        
        {/* Details */}
        <div className="text-sm text-gray-600 mb-3 line-clamp-1 flex items-center">
          <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
            {getDetails()}
          </span>
        </div>
        
        {/* Location */}
        <div className="text-sm text-gray-600 mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-gray-400 w-4 h-4" />
          <span className="line-clamp-1">{getLocation()}</span>
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-gray-900">{getPrice()}</span>
            {item.type === 'listing' && item.offer && (
              <span className="text-sm text-gray-500 line-through ml-2">
                R{item.regularPrice}
              </span>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getViewUrl(), '_blank');
              }}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all hover:scale-105"
              title="View details"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(getViewUrl());
                alert('Link copied to clipboard!');
              }}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all hover:scale-105"
              title="Share"
            >
              <FaShareAlt className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-hover:via-black/5 group-hover:to-black/10 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

// Premium List Card Component
function PremiumListCard({ item, removingId, removeFromWishlist, isSelected, onSelect }) {
  const getPrice = () => {
    if (item.type === 'listing') {
      return item.regularPrice ? `R${item.regularPrice}` : 'Price not set';
    } else if (item.type === 'service') {
      return item.cost ? `R${item.cost}` : 'Price not set';
    } else if (item.type === 'helper') {
      return item.pricePerHour ? `R${item.pricePerHour}/hr` : 'Price not set';
    } else if (item.type === 'event') {
      return item.ticketPrice ? `R${item.ticketPrice}` : 'Free';
    }
    return 'Check price';
  };

  const getRating = () => {
    return item.rating || Math.random() * 2 + 3.5;
  };

  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    return 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };

  const getTitle = () => {
    return item.title || item.name || item.eventName || 'Untitled Item';
  };

  // Function to get view URL based on item type
  const getViewUrl = () => {
    const baseUrl = 'http://localhost:5173';
    switch(item.type) {
      case 'listing':
        return `${baseUrl}/listing/${item._id}`;
      case 'service':
        return `${baseUrl}/service/${item._id}`;
      case 'helper':
        return `${baseUrl}/helper/${item._id}`;
      case 'event':
        return `${baseUrl}/event/${item._id}`;
      default:
        return `${baseUrl}`;
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200/50 hover:border-gray-300 cursor-pointer">
      <div className="flex">
        {/* Image */}
        <div className="relative w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex-shrink-0">
          <img
            src={getImage()}
            alt={getTitle()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#FF5A5F] transition-colors">
                {getTitle()}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FaStar className="text-amber-500 mr-1.5 w-4 h-4" />
                  <span className="text-sm font-bold text-amber-900">
                    {getRating().toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.type === 'listing' ? 'Listing' :
                   item.type === 'service' ? 'Service' : 
                   item.type === 'helper' ? 'Helper' : 'Event'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="w-5 h-5 rounded-lg border-gray-300 text-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20 focus:ring-offset-2 cursor-pointer"
              />
              
              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlist(item._id, item.type);
                }}
                disabled={removingId === item._id}
                className={`p-2 rounded-lg transition-all ${
                  removingId === item._id 
                    ? 'text-gray-500' 
                    : 'text-gray-600 hover:text-red-500 hover:bg-gray-100'
                }`}
                aria-label="Remove from wishlist"
              >
                {removingId === item._id ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <TbHeartFilled className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          </div>
          
          <div className="text-gray-600 mb-4">
            {item.description || 'No description available'}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900">
              {getPrice()}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(getViewUrl(), '_blank');
                }}
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:shadow-lg transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add these styles to your global CSS or component
const styles = `
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
`;

// Add this to your component or a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}