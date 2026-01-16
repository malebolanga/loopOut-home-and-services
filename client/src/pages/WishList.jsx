import { useEffect, useState } from 'react';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";
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
  FaStar
} from 'react-icons/fa';
import { TbHeartFilled } from 'react-icons/tb';
// Removed problematic IoMdImages import and replaced with alternative
import "../styles/breakpoints.scss";

// Alternative for IoMdImages
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

  // Stats for the header
  const stats = {
    all: wishlist.length,
    properties: wishlist.filter(item => item.type === 'listing').length,
    services: wishlist.filter(item => item.type === 'service').length,
    helpers: wishlist.filter(item => item.type === 'helper').length,
    events: wishlist.filter(item => item.type === 'event').length,
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
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5A5F]"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading your wishlists</h1>
          <p className="text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Airbnb Style */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Wishlists</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaPlus className="inline mr-2" />
                Create new list
              </button>
              
              <div className="relative">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                  {isPrivate ? (
                    <>
                      <FaLock className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">Private</span>
                    </>
                  ) : (
                    <>
                      <FaGlobe className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">Public</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search in your wishlist"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <FaFilter className="text-gray-500" />
                  <span>Sort</span>
                  <FaChevronDown className={`text-xs transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isFilterOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsFilterOpen(false)}
                    ></div>
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {['recent', 'oldest', 'name', 'price-high', 'price-low'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${
                            sortBy === option ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {option.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <button
                onClick={clearAll}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear all
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                <FaShareAlt />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Type Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => setFilterType('listing')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === 'listing'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaHome className="inline mr-2" />
              Properties ({stats.properties})
            </button>
            <button
              onClick={() => setFilterType('service')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === 'service'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaTools className="inline mr-2" />
              Services ({stats.services})
            </button>
            <button
              onClick={() => setFilterType('helper')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === 'helper'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaTag className="inline mr-2" />
              Helpers ({stats.helpers})
            </button>
            <button
              onClick={() => setFilterType('event')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === 'event'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" />
              Events ({stats.events})
            </button>
          </div>
        </div>

        {/* Empty State */}
        {searchedWishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8">
              <TbHeartFilled className="w-full h-full text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchQuery ? 'No results found' : 'Start your collection'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {searchQuery 
                ? 'Try searching for something else or browse our collection'
                : 'Save your favorite properties, services, and experiences to revisit them later.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={() => window.location.href = '/properties'}
                className="px-6 py-3 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#E14E50] transition-colors font-medium"
              >
                Explore properties
              </button>
              <button 
                onClick={() => window.location.href = '/services'}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
              >
                Discover services
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchedWishlist.map((item) => (
                <AirbnbWishlistCard
                  key={`${item.type}-${item._id}`}
                  item={item}
                  removingId={removingId}
                  removeFromWishlist={removeFromWishlist}
                  isSelected={selectedItems.includes(`${item.type}-${item._id}`)}
                  onSelect={() => toggleSelectItem(item._id, item.type)}
                />
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    <FaEdit />
                    <span>Edit list</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    <FaCog />
                    <span>Settings</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    <FaDownload />
                    <span>Export</span>
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  {searchedWishlist.length} items • Updated just now
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create New List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create new list</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List name *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Dream homes, Wedding planning, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Describe what this list is about..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isPrivate ? (
                    <>
                      <FaLock className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">Private list</span>
                    </>
                  ) : (
                    <>
                      <FaGlobe className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">Public list</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="text-sm text-[#FF5A5F] hover:text-[#E14E50]"
                >
                  {isPrivate ? 'Make public' : 'Make private'}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createNewList}
                disabled={!newListName.trim()}
                className={`px-4 py-2 rounded-lg font-medium ${
                  newListName.trim()
                    ? 'bg-[#FF5A5F] text-white hover:bg-[#E14E50]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Airbnb Style Wishlist Card
function AirbnbWishlistCard({ item, removingId, removeFromWishlist, isSelected, onSelect }) {
  const getPrice = () => {
    if (item.type === 'listing') {
      return item.regularPrice ? `R${item.regularPrice}/night` : 'Price not set';
    } else if (item.type === 'service') {
      return item.cost ? `R${item.cost}` : 'Price not set';
    } else if (item.type === 'helper') {
      return item.pricePerHour ? `R${item.pricePerHour}/hour` : 'Price not set';
    } else if (item.type === 'event') {
      return item.ticketPrice ? `R${item.ticketPrice}` : 'Free';
    }
    return 'Check price';
  };

  const getRating = () => {
    // Mock rating for demo
    return Math.random() * 2 + 3.5; // Random rating between 3.5-5.5
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
      return `${item.skills || 'Various skills'}`;
    } else if (item.type === 'event') {
      return `${item.date || 'Date TBD'}`;
    }
    return 'Details';
  };

  return (
    <div className="relative bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded border-gray-300 text-[#FF5A5F] focus:ring-[#FF5A5F]"
        />
      </div>
      
      {/* Remove Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFromWishlist(item._id, item.type);
          }}
          disabled={removingId === item._id}
          className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all ${
            removingId === item._id 
              ? 'text-gray-500' 
              : 'text-gray-600 hover:text-[#FF5A5F] hover:bg-white'
          }`}
          aria-label="Remove from wishlist"
        >
          {removingId === item._id ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <TbHeartFilled className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Image */}
      <div className="relative h-56 bg-gray-200 overflow-hidden">
        <img
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
          }}
        />
        
        {/* Image Count Badge */}
        {(item.imageUrls?.length > 1 || item.images?.length > 1) && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <ImagesIcon className="w-3 h-3 mr-1" />
            {(item.imageUrls?.length || item.images?.length || 1)} photos
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Rating and Type */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaStar className="text-[#FF5A5F] mr-1" />
            <span className="text-sm font-medium text-gray-900">
              {getRating().toFixed(1)}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {item.type === 'listing' ? 'property' : item.type}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
          {getTitle()}
        </h3>
        
        {/* Details */}
        <div className="text-sm text-gray-600 mb-2 line-clamp-1">
          {getDetails()}
        </div>
        
        {/* Location */}
        <div className="text-sm text-gray-600 mb-3 flex items-center">
          <FaMapMarkerAlt className="mr-1.5 text-gray-400" />
          <span className="line-clamp-1">{getLocation()}</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-base font-semibold text-gray-900">{getPrice()}</span>
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
                const viewUrl = {
                  listing: `/property/${item._id}`,
                  service: `/service/${item._id}`,
                  helper: `/helper/${item._id}`,
                  event: `/event/${item._id}`
                }[item.type];
                if (viewUrl) window.open(viewUrl, '_blank');
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="View details"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Share functionality
                navigator.clipboard.writeText(window.location.origin + {
                  listing: `/property/${item._id}`,
                  service: `/service/${item._id}`,
                  helper: `/helper/${item._id}`,
                  event: `/event/${item._id}`
                }[item.type]);
                alert('Link copied to clipboard!');
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <FaShareAlt className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
    </div>
  );
}