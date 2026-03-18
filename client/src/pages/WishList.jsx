import { useEffect, useState } from 'react';
import {
  FaHeart,
  FaSpinner,
  FaTrash,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTools,
  FaHome,
  FaStar,
  FaShareAlt,
  FaChevronDown,
  FaSearch,
  FaPlus,
  FaEllipsisH,
  FaTimes,
  FaBed,
  FaBath,
  FaUser,
  FaCheck,
  FaSlidersH,
  FaRegHeart,
  FaArrowLeft
} from 'react-icons/fa';
import { TbHeartFilled } from 'react-icons/tb';
import { MdGridView, MdViewList } from 'react-icons/md';
import { FiShare2, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function WishList() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Airbnb-style stats
  const stats = {
    all: wishlist.length,
    listings: wishlist.filter(item => item.type === 'listing').length,
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

        const safeParse = (data) => Array.isArray(data) ? data : [];

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

        // Deduplicate: remove any item with the same type+_id combination
        const seen = new Map();
        combined = combined.filter(item => {
          const key = `${item.type}-${item._id}`;
          if (seen.has(key)) return false;
          seen.set(key, true);
          return true;
        });

        combined = sortWishlist(combined, sortBy);

        setWishlist(combined);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [sortBy]);

  const sortWishlist = (items, sortType) => {
    if (!Array.isArray(items)) return [];
    const sorted = [...items];
    switch (sortType) {
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
        const storedData = localStorage.getItem(key);
        if (storedData) {
          const updatedWishlist = JSON.parse(storedData);
          if (Array.isArray(updatedWishlist)) {
            const filtered = updatedWishlist.filter(item => item._id !== itemId);
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        }
      }

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
      window.dispatchEvent(new Event('storage'));
    }
  };

  const createNewList = () => {
    if (!newListName.trim()) return;
    console.log('Creating new list:', { newListName, newListDescription, isPrivate });
    setNewListName('');
    setNewListDescription('');
    setShowCreateModal(false);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share clicked');
    setShowShareModal(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FF5A5F] flex items-center justify-center mb-4 animate-pulse">
            <TbHeartFilled className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Wishlist Navigation — fixed at top, hides the global Header */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-2 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo Area / Back Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
              >
                <FaArrowLeft className="text-xl text-gray-900" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF5A5F] rounded-lg flex items-center justify-center">
                  <TbHeartFilled className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-tight hidden sm:block text-gray-900">
                  My Collections
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium border-gray-300 hover:border-gray-800 hover:bg-gray-50 text-gray-900"
              >
                <FaShareAlt className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-lg border transition-all border-gray-300 hover:border-gray-800 hover:bg-gray-50 text-gray-900"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFavorite}
                className="p-2.5 rounded-lg border transition-all border-gray-300 hover:border-gray-800 hover:bg-gray-50 text-gray-900"
              >
                {isFavorite ?
                  <FaHeart className="w-4 h-4 text-rose-500" /> :
                  <FiHeart className="w-4 h-4" />
                }
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2.5 rounded-lg border transition-all border-gray-300 hover:border-gray-800 hover:bg-gray-50 text-gray-900"
              >
                <FaSlidersH className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium bg-gray-900 hover:bg-black text-white"
              >
                <FaPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Create list</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed nav bar */}
      <div className="h-0" />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-0 pt-0">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
                Saved Items
              </h1>
              <p className="text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? 'stay' : 'stays'} saved
              </p>
            </div>

            {/* Collaborators Preview (Airbnb-style) */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  You
                </div>
              </div>
              <button className="text-sm font-medium text-gray-900 underline hover:text-gray-600">
                Invite
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            {/* Search Input - Airbnb Style */}
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search saved items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
              />
            </div>

            {/* Filter Pills - Airbnb Style */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${filterType === 'all'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                  }`}
              >
                All ({stats.all})
              </button>
              <button
                onClick={() => setFilterType('listing')}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${filterType === 'listing'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                  }`}
              >
                Homes ({stats.listings})
              </button>
              <button
                onClick={() => setFilterType('service')}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${filterType === 'service'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                  }`}
              >
                Services ({stats.services})
              </button>
              <button
                onClick={() => setFilterType('event')}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${filterType === 'event'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                  }`}
              >
                Experiences ({stats.events})
              </button>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-800 transition-all text-sm font-medium text-gray-700"
                >
                  <span className="capitalize">{sortBy.replace('-', ' ')}</span>
                  <FaChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                      {['recent', 'oldest', 'name', 'price-high', 'price-low'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${sortBy === option ? 'font-semibold text-gray-900' : 'text-gray-600'
                            }`}
                        >
                          {option === 'recent' ? 'Recently saved' :
                            option === 'oldest' ? 'Oldest first' :
                              option === 'name' ? 'Name' :
                                option === 'price-high' ? 'Price: high to low' :
                                  'Price: low to high'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MdGridView className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MdViewList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {searchedWishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <FaRegHeart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matches found' : 'Start saving places you love'}
            </h2>
            <p className="text-gray-500 max-w-sm mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'As you search, click the heart icon to save your favorite listings, services, and experiences.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => window.location.href = '/listings'}
                className="px-6 py-3 bg-[#FF5A5F] hover:bg-[#E14E50] text-white rounded-lg font-medium transition-colors"
              >
                Start exploring
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View - Airbnb Style */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchedWishlist.map((item) => (
                  <AirbnbCard
                    key={`${item.type}-${item._id}`}
                    item={item}
                    removingId={removingId}
                    removeFromWishlist={removeFromWishlist}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {searchedWishlist.map((item) => (
                  <AirbnbListCard
                    key={`${item.type}-${item._id}`}
                    item={item}
                    removingId={removingId}
                    removeFromWishlist={removeFromWishlist}
                  />
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-12 pt-8 py-16 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-900 underline transition-colors"
                >
                  Clear all saved items
                </button>
                <p className="text-sm text-gray-500">
                  Showing {searchedWishlist.length} of {wishlist.length} items
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create List Modal - Airbnb Style */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create new wishlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Summer Vacation 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isPrivate ? 'bg-gray-200' : 'bg-green-100'}`}>
                    {isPrivate ? <FaTimes className="w-4 h-4 text-gray-600" /> : <FaCheck className="w-4 h-4 text-green-600" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {isPrivate ? 'Private' : 'Public'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isPrivate ? 'Only you can see this' : 'Anyone with the link can view'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="text-sm font-medium text-gray-900 underline hover:text-gray-600"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-900 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createNewList}
                disabled={!newListName.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${newListName.trim()
                    ? 'bg-gray-900 text-white hover:bg-black'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Share this wishlist</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 border border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaShareAlt className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Copy link</div>
                  <div className="text-sm text-gray-500">Share via message or email</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Invite friends</div>
                  <div className="text-sm text-gray-500">Let them add and vote on places</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 py-10">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowCreateModal(true);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
              >
                <span className="font-medium text-gray-900">Create new wishlist</span>
                <FaPlus className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  clearAll();
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors text-left text-red-600"
              >
                <span className="font-medium">Delete all items</span>
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Airbnb-style Card Component
function AirbnbCard({ item, removingId, removeFromWishlist }) {
  const getPrice = () => {
    if (item.type === 'listing') {
      return item.regularPrice ? `R${item.regularPrice}` : null;
    } else if (item.type === 'service') {
      return item.cost ? `R${item.cost}` : null;
    } else if (item.type === 'helper') {
      return item.pricePerHour ? `R${item.pricePerHour}` : null;
    } else if (item.type === 'event') {
      return item.ticketPrice ? `R${item.ticketPrice}` : 'Free';
    }
    return null;
  };

  const getRating = () => item.rating || (Math.random() * 1.5 + 4).toFixed(2);

  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
    if (item.images && item.images.length > 0) return item.images[0];
    return 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80';
  };

  const getTitle = () => item.title || item.name || item.eventName || 'Untitled';

  const getLocation = () => item.address || item.location || item.city || 'Location TBD';

  const getDetails = () => {
    if (item.type === 'listing') {
      return `${item.bedrooms || 2} beds · ${item.bathrooms || 1} baths`;
    } else if (item.type === 'service') {
      return item.serviceType || 'Service';
    } else if (item.type === 'helper') {
      return item.skills?.split(',')[0] || 'Helper';
    } else if (item.type === 'event') {
      return item.date || 'Date TBD';
    }
    return '';
  };

  const getViewUrl = () => {
    const baseUrl = 'http://localhost:5173';
    switch (item.type) {
      case 'listing': return `${baseUrl}/listing/${item._id}`;
      case 'service': return `${baseUrl}/service/${item._id}`;
      case 'helper': return `${baseUrl}/helper/${item._id}`;
      case 'event': return `${baseUrl}/event/${item._id}`;
      default: return baseUrl;
    }
  };

  const price = getPrice();

  return (
    <div
      className="cursor-pointer "
      onClick={() => window.open(getViewUrl(), '_blank')}
    >
      {/* Image Container - Airbnb's signature rounded corners */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3">
        <img
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80';
          }}
        />

        {/* Heart Button - Airbnb Style */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFromWishlist(item._id, item.type);
          }}
          disabled={removingId === item._id}
          className="absolute top-3 right-3 p-2 transition-transform hover:scale-110 active:scale-95"
          aria-label="Remove from wishlist"
        >
          {removingId === item._id ? (
            <FaSpinner className="w-6 h-6 text-white animate-spin" />
          ) : (
            <TbHeartFilled className="w-6 h-6 text-[#FF5A5F] drop-shadow-md" />
          )}
        </button>

        {/* Guest Favorite Badge */}
        {getRating() >= 4.8 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-900">
            Guest favorite
          </div>
        )}
      </div>

      {/* Content - Airbnb Typography */}
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 truncate pr-2">{getLocation()}</h3>
          <div className="flex items-center gap-1 text-sm">
            <FaStar className="w-3.5 h-3.5 text-gray-900" />
            <span>{getRating()}</span>
          </div>
        </div>

        <p className="text-gray-500 text-sm truncate">{getDetails()}</p>
        <p className="text-gray-500 text-sm">{getTitle()}</p>

        {price && (
          <div className="flex items-baseline gap-1 pt-1">
            <span className="font-semibold text-gray-900">{price}</span>
            {item.type === 'helper' ? (
              <span className="text-gray-900 text-sm">/hour</span>
            ) : item.type !== 'event' && (
              <span className="text-gray-900 text-sm">night</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Airbnb-style List Card
function AirbnbListCard({ item, removingId, removeFromWishlist }) {
  const getPrice = () => {
    if (item.type === 'listing') return item.regularPrice ? `R${item.regularPrice}` : 'Price on request';
    if (item.type === 'service') return item.cost ? `R${item.cost}` : 'Price on request';
    if (item.type === 'helper') return item.pricePerHour ? `R${item.pricePerHour}/hr` : 'Price on request';
    if (item.type === 'event') return item.ticketPrice ? `R${item.ticketPrice}` : 'Free';
    return 'Price on request';
  };

  const getImage = () => {
    if (item.imageUrls?.length > 0) return item.imageUrls[0];
    if (item.images?.length > 0) return item.images[0];
    return 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=80';
  };

  const getTitle = () => item.title || item.name || item.eventName || 'Untitled';

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer bg-white">
      <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
        <img
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=80';
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFromWishlist(item._id, item.type);
          }}
          disabled={removingId === item._id}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:scale-110 transition-transform"
        >
          {removingId === item._id ? (
            <FaSpinner className="w-4 h-4 text-gray-600 animate-spin" />
          ) : (
            <FaHeart className="w-4 h-4 text-[#FF5A5F]" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500 mb-1 capitalize">{item.type} in {item.location || 'Unknown location'}</p>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{getTitle()}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {item.type === 'listing' && (
              <>
                <span>{item.bedrooms || 2} bedrooms</span>
                <span>·</span>
                <span>{item.bathrooms || 1} bathrooms</span>
              </>
            )}
            {item.type === 'service' && <span>{item.serviceType}</span>}
            {item.type === 'helper' && <span>{item.skills?.split(',')[0]}</span>}
            {item.type === 'event' && <span>{item.date}</span>}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-1">
            <FaStar className="w-4 h-4 text-gray-900" />
            <span className="font-semibold text-gray-900">{item.rating || '4.9'}</span>
            <span className="text-gray-500 text-sm">({item.reviews || '12'} reviews)</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-gray-900">{getPrice()}</span>
            {item.type === 'listing' && <span className="text-gray-500 text-sm"> / night</span>}
          </div>
        </div>
      </div>
    </div>
  );
}