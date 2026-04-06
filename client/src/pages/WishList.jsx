import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Trash2,
  MapPin,
  Calendar,
  Star,
  Share2,
  Plus,
  X,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Search,
  Check,
  Settings,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { TbHeartFilled } from 'react-icons/tb';
import { FaTimes, FaCheck, FaPlus, FaTrash, FaUser, FaShareAlt, FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getWishlistBackend, toggleWishlistBackend, voteWishlistItem } from '../services/wishlist.service';
import ImageWithFallback from '../components/ImageWithFallback';

const getDateBucket = (dateString) => {
  if (!dateString) return { label: 'Unknown Date', order: 999999 };
  const now = new Date();
  const date = new Date(dateString);
  const midnightNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const midnightDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = midnightNow - midnightDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Today', order: 0 };
  if (diffDays === 1) return { label: 'Yesterday', order: 1 };
  if (diffDays < 30) return { label: `${diffDays} days ago`, order: diffDays };

  const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
  if (diffMonths > 0 && diffMonths < 12) {
    return { label: `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`, order: 30 + diffMonths };
  }

  const year = date.getFullYear();
  return { label: `${year}`, order: 1000 + (now.getFullYear() - year) };
};

export default function WishList() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
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
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
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
    const loadWishlist = async () => {
      setLoading(true);
      try {
        let combined = [];

        // 1. Load from localStorage (guest/fallback)
        const storedListings = JSON.parse(localStorage.getItem('wishlist')) || [];
        const storedServices = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
        const storedHelpers = JSON.parse(localStorage.getItem('helperWishlist')) || [];
        const storedEvents = JSON.parse(localStorage.getItem('eventWishlist')) || [];

        const safeParse = (data) => Array.isArray(data) ? data : [];

        const localItems = [
          ...safeParse(storedListings).map(item => ({ ...item, type: 'listing' })),
          ...safeParse(storedServices).map(item => ({ ...item, type: 'service' })),
          ...safeParse(storedHelpers).map(item => ({ ...item, type: 'helper' })),
          ...safeParse(storedEvents).map(item => ({ ...item, type: 'event' })),
        ];

        // 2. Load from Backend if logged in
        if (currentUser) {
          const backendData = await getWishlistBackend();
          const backendItems = Array.isArray(backendData) ? backendData : [];
          combined = [...localItems, ...backendItems];
        } else {
          combined = localItems;
        }

        // Deduplicate: remove any item with the same type+_id combination
        const seen = new Map();
        combined = combined.filter(item => {
          if (!item || !item._id) return false;
          const key = `${item.type || 'unknown'}-${item._id}`;
          if (seen.has(key)) return false;
          seen.set(key, true);
          return true;
        });

        // Add timestamps if missing
        combined = combined.map(item => ({
          ...item,
          addedAt: item.addedAt || Date.now()
        }));

        setWishlist(sortWishlist(combined, sortBy));
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      }
      setLoading(false);
    };

    loadWishlist();
  }, [sortBy, currentUser]);

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

  const availableDateBuckets = useMemo(() => {
    const types = {};
    filteredWishlist.forEach(item => {
      const bucket = getDateBucket(item.addedAt);
      if (!types[bucket.label]) {
        types[bucket.label] = { label: bucket.label, order: bucket.order, count: 0 };
      }
      types[bucket.label].count++;
    });
    return Object.values(types).sort((a, b) => a.order - b.order);
  }, [filteredWishlist]);

  const dateFilteredWishlist = dateFilter === 'all'
    ? filteredWishlist
    : filteredWishlist.filter(item => getDateBucket(item.addedAt).label === dateFilter);

  const searchedWishlist = searchQuery
    ? dateFilteredWishlist.filter(item => {
      const searchText = (item.title || item.name || item.eventName || '').toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    })
    : dateFilteredWishlist;

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

      // Update backend if logged in
      if (currentUser) {
        await toggleWishlistBackend(itemId, itemType);
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

  const handleVote = async (itemId, itemType, voteType) => {
    // Optimistic UI update
    setWishlist(prev => prev.map(item => {
      if (item._id === itemId && item.type === itemType) {
        const votes = item.votes || { up: 0, down: 0 };
        return {
          ...item,
          votes: {
            ...votes,
            [voteType]: votes[voteType] + 1
          }
        };
      }
      return item;
    }));

    // Backend sync
    await voteWishlistItem(itemId, itemType, voteType);
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50/50 relative overflow-x-hidden">
      {/* Background Cinematic Mesh */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Modern Wishlist Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm h-20' : 'bg-transparent h-24'}`}>
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-90 border border-gray-100"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                <TbHeartFilled className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-black tracking-tight text-gray-900 block">Collections</span>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">Perspective</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm mr-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-gray-200 hover:bg-rose-500 transition-all active:scale-95 group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-180" />
              <span className="hidden sm:inline">New Collection</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-90 border border-gray-100"
            >
              <Settings className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
      </header>


      {/* Spacer for fixed nav bar */}
      <div className="h-0" />

      {/* Main Content Hub */}
      <main className="max-w-full mx-auto px-6 sm:px-12 pt-16 pb-20">
        {/* Elite Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Curated Masterpieces</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight tracking-tighter">
                Wishlist
              </h1>
              <div className="flex items-center gap-6">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                  {wishlist.length} {wishlist.length === 1 ? 'Legacy' : 'Legacies'} Saved
                </p>
                <div className="h-1 w-8 bg-rose-500 rounded-full" />
                <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-black text-rose-500">
                  <Check className="w-3 h-3" />
                  Synced Everywhere
                </div>
              </div>
            </div>

            {/* Premium Contributors Area */}
            <div className="flex items-center gap-5 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-2xl bg-gray-100 border-4 border-white flex items-center justify-center text-xs font-black text-gray-400 uppercase">
                    {i === 1 ? 'Me' : <UserPlus className="w-4 h-4" />}
                  </div>
                ))}
              </div>
              <div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 group flex items-center gap-2 hover:text-rose-500 transition-colors"
                >
                  Collaborate
                  <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-[10px] font-medium text-gray-400">Invite friends to vote</p>
              </div>
            </div>
          </div>

          {/* Filters Hub - Search Removed */}
          <div className="mt-8 flex flex-col xl:flex-row gap-8 items-stretch xl:items-center ">
            <div className="flex-1 flex flex-wrap gap-3 items-center">
              {[
                { id: 'all', label: 'All Items', count: stats.all },
                { id: 'listing', label: 'Homes', count: stats.listings },
                { id: 'service', label: 'Services', count: stats.services },
                { id: 'event', label: 'Events', count: stats.events },
                { id: 'helper', label: 'Helpers', count: stats.helpers }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`
                    px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-4 shadow-sm
                    ${filterType === pill.id
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xl'
                      : 'bg-white text-gray-500 border-gray-50 hover:border-gray-200 hover:text-gray-900'}
                  `}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}

              <div className="w-[2px] h-8 bg-gray-100 hidden xl:block mx-2" />

              {/* Sorting Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl border-4 border-gray-50 bg-white hover:border-gray-200 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-gray-900"
                >
                  <span className="opacity-40">Sort:</span> {sortBy.replace('-', ' ')}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-60 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] z-50 py-4"
                      >
                        {['recent', 'oldest', 'name', 'price-high', 'price-low'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-6 py-3.5 hover:bg-rose-50 transition-colors text-[10px] font-black uppercase tracking-widest ${sortBy === option ? 'text-rose-500' : 'text-gray-600'}`}
                          >
                            {option === 'recent' ? 'Recently saved' :
                              option === 'oldest' ? 'Oldest first' :
                                option === 'name' ? 'Alphabetical' :
                                  option === 'price-high' ? 'High Price' :
                                    'Low Price'}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date Grouping Filter Pills */}
        {availableDateBuckets.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-4 border-t border-gray-100 scrollbar-hide">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${dateFilter === 'all'
                ? 'bg-gray-100 text-gray-900 border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
            >
              Any time
            </button>
            {availableDateBuckets.map(bucket => (
              <button
                key={bucket.label}
                onClick={() => setDateFilter(bucket.label)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${dateFilter === bucket.label
                  ? 'bg-gray-100 text-gray-900 border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
              >
                {bucket.label} ({bucket.count})
              </button>
            ))}
          </div>
        )}
        {/* Staggered Item List */}
        <AnimatePresence mode="wait">
          {searchedWishlist.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-rose-50 flex items-center justify-center mb-10 shadow-inner overflow-hidden relative group">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <TbHeartFilled className="w-14 h-14 text-rose-500" />
                </motion.div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
                {searchQuery ? 'No Matches Found' : 'Start Your Legacy'}
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs max-w-sm mb-12 leading-relaxed">
                {searchQuery
                  ? 'The masterpiece you seek is currently hidden. Try different keywords.'
                  : 'Collections represent your future masterpieces. Click the heart on any listing to begin.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/listings')}
                  className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-gray-200 hover:bg-rose-500 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Masterpieces
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className={viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
                : "space-y-6"
              }
            >
              {searchedWishlist.map((item, index) => (
                <AirbnbCard
                  key={`${item.type}-${item._id}`}
                  item={item}
                  index={index}
                  removingId={removingId}
                  removeFromWishlist={removeFromWishlist}
                  onVote={handleVote}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer Actions */}
        {wishlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8"
          >
            <button
              onClick={clearAll}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-gray-50 rounded-2xl text-gray-400 hover:border-gray-200 hover:text-gray-900 transition-all hover:bg-white"
            >
              Destroy All Collections
            </button>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                Syncing {wishlist.length} Items Live
              </p>
            </div>
          </motion.div>
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

      {/* Share Modal - Premium Collaborative Style */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -z-10 opacity-50" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Collaborative Collection</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-1">Share the Masterpiece</p>
              </div>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShowInviteInput(false);
                }}
                className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Active Contributors - Real Social Proof */}
              <div className="p-6 bg-gray-50/80 backdrop-blur-sm rounded-[2rem] border border-gray-100 shadow-inner">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Live Collaboration</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-green-600 uppercase">3 Online</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'You (Owner)', status: 'Designing', icon: 'ME', color: 'bg-rose-500' },
                    { name: 'Marcus R.', status: 'Voting', icon: 'MR', color: 'bg-blue-500' },
                    { name: 'Sarah W.', status: 'Browsing', icon: 'SW', color: 'bg-green-500' }
                  ].map(user => (
                    <div key={user.name} className="flex items-center justify-between group/user transition-all">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-2xl ${user.color} flex items-center justify-center text-[10px] font-black text-white shadow-lg`}>
                            {user.icon}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-black text-gray-900 block">{user.name}</span>
                          <span className="text-[10px] font-bold text-gray-400">{user.status} now</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover/user:opacity-100 transition-opacity">
                        <button className="text-[9px] font-black uppercase text-rose-500 tracking-widest">Manage</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Sharing Ecosystem */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-rose-500 transition-all cursor-pointer group"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 2000);
                  }}
                >
                  <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {copyFeedback ? <Check className="w-6 h-6 text-rose-500" /> : <FaShareAlt className="w-6 h-6 text-rose-500" />}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none">Link</p>
                    <p className="text-[9px] font-black text-gray-400 mt-1 uppercase">{copyFeedback ? 'Copied!' : 'Copy Link'}</p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent("Check out my curative Legacy collection on LoopOut: " + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-green-500 transition-all group"
                >
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaWhatsapp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none">WhatsApp</p>
                    <p className="text-[9px] font-black text-gray-400 mt-1 uppercase">Share Hub</p>
                  </div>
                </a>
              </div>

              {!showInviteInput ? (
                <button
                  onClick={() => setShowInviteInput(true)}
                  className="w-full flex items-center gap-3 p-6 bg-gray-900 text-white rounded-[2rem] hover:bg-rose-500 shadow-2xl shadow-gray-200 transition-all active:scale-95 group"
                >
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <FaUser className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Direct Collaboration</p>
                    <p className="text-sm font-black tracking-tight">Invite Friends to Vote via Email</p>
                  </div>
                  <Plus className="w-5 h-5 opacity-40" />
                </button>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-1.5 bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] flex items-center"
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter friend's email..."
                    className="flex-1 bg-transparent px-6 py-4 text-sm font-bold placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (inviteEmail) {
                        setInviteEmail('');
                        setShowInviteInput(false);
                      }
                    }}
                    className="px-8 py-4 bg-rose-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-lg"
                  >
                    Invite
                  </button>
                </motion.div>
              )}
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-500">
                <Check className="w-3 h-3" />
                Public Collections Enabled
              </div>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>
          </motion.div>
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

// Unified Premium Card Component
function AirbnbCard({ item, index, viewMode, removingId, removeFromWishlist, onVote }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getPrice = () => {
    if (item.type === 'listing') return item.regularPrice ? `R${item.regularPrice}` : null;
    if (item.type === 'service') return item.cost ? `R${item.cost}` : null;
    if (item.type === 'helper') return item.pricePerHour ? `R${item.pricePerHour}` : null;
    if (item.type === 'event') return item.ticketPrice ? `R${item.ticketPrice}` : 'Free';
    return null;
  };

  const getRating = () => item.rating || 4.9;

  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
    if (item.images && item.images.length > 0) return item.images[0];
    return 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80';
  };

  const getTitle = () => item.title || item.name || item.eventName || 'Untitled Masterpiece';

  const getLocation = () => item.address || item.location || item.city || 'Private Location';

  const getDetails = () => {
    if (item.type === 'listing') return `${item.bedrooms || 2} Bedrooms · ${item.bathrooms || 1} Baths`;
    if (item.type === 'service') return item.serviceType || 'Premium Service';
    if (item.type === 'helper') return 'Professional Helper';
    if (item.type === 'event') return item.date || 'Upcoming Event';
    return '';
  };

  const isRemoving = removingId === item._id;

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -5, shadow: "0 15px 30px rgba(0,0,0,0.05)" }}
        className="group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col md:flex-row h-auto md:h-56 transition-all duration-500"
      >
        <div className="w-full md:w-1/4 relative overflow-hidden h-48 md:h-full">
          <ImageWithFallback
            src={getImage()}
            alt={getTitle()}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">{item.type}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span className="text-xs font-black">{getRating()}</span>
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1 truncate max-w-md">{getTitle()}</h3>
            <p className="text-gray-400 text-[11px] font-medium flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {getLocation()}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-gray-900">{getPrice()}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">/ Total</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(item._id, item.type, 'up')}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100 group/vote"
              >
                <ThumbsUp className="w-3.5 h-3.5 group-hover/vote:scale-110 transition-transform" />
                <span>{item.votes?.up || 0}</span>
              </button>
              <button
                onClick={() => handleVote(item._id, item.type, 'down')}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 group/vote"
              >
                <ThumbsDown className="w-3.5 h-3.5 group-hover/vote:scale-110 transition-transform" />
                <span>{item.votes?.down || 0}</span>
              </button>
              <div className="w-[1px] h-6 bg-gray-100 mx-1" />
              <button
                onClick={() => navigate(`/${item.type === 'listing' ? 'listing' : item.type}/${item._id}`)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-gray-100 hover:bg-rose-500 transition-all active:scale-95"
              >
                View
              </button>
              <button
                onClick={() => removeFromWishlist(item._id, item.type)}
                disabled={isRemoving}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all group/trash border border-gray-100"
              >
                {isRemoving ? <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.04)] transition-all duration-700 h-full flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{item.type}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFromWishlist(item._id, item.type);
            }}
            disabled={isRemoving}
            className="w-9 h-9 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90 group/trash"
          >
            {isRemoving ? <Sparkles className="w-3.5 h-3.5 text-gray-900 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute inset-x-4 bottom-4">
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span className="text-[10px] font-black text-white">{getRating()}</span>
            </div>
            <p className="text-white font-black text-xs line-clamp-1 mb-3">{getLocation()}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onVote(item._id, item.type, 'up')}
                className="flex-1 py-2.5 bg-white/90 backdrop-blur-sm text-green-600 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] hover:bg-green-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 group/vote"
              >
                <ThumbsUp className="w-3 h-3 group-hover/vote:-rotate-12 transition-transform" />
                {item.votes?.up || 0}
              </button>
              <button
                onClick={() => onVote(item._id, item.type, 'down')}
                className="flex-1 py-2.5 bg-white/90 backdrop-blur-sm text-gray-400 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 group/vote"
              >
                <ThumbsDown className="w-3 h-3 group-hover/vote:rotate-12 transition-transform" />
                {item.votes?.down || 0}
              </button>
            </div>
            <button
              onClick={() => navigate(`/${item.type === 'listing' ? 'listing' : item.type}/${item._id}`)}
              className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] hover:bg-rose-500 hover:text-white transition-all"
            >
              Inspect Original
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 pb-6 flex flex-col flex-1">
        <h3 className="text-sm font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-rose-500 transition-colors duration-500">
          {getTitle()}
        </h3>

        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="text-lg font-black text-gray-900 tracking-tighter">{getPrice()}</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Perspective</span>
        </div>
      </div>
    </motion.div>
  );
}
