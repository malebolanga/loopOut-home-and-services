import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  Home as HomeIcon, 
  MapPin, 
  Star,
  ThumbsUp,
  ThumbsDown,
  LayoutGrid,
  Search,
  User,
  Calendar,
  Layers,
  ShoppingBag,
  Bell,
  CheckCircle2,
  Share2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import ImageWithFallback from '../components/ImageWithFallback';
import { getWishlistBackend, toggleWishlistBackend, clearWishlistBackend } from '../services/wishlist.service';
import { setWishlistCount } from '../redux/frontendSlice';

const getItemPath = (item) => {
  const type = item.type || item.itemType || 'listing';
  if (type === 'listing') return `/listing/${item._id}`;
  if (type === 'event') return `/event/${item._id}`;
  if (type === 'helper') return `/helper/${item._id}`;
  return `/service/${item._id}`;
};

const AirbnbCard = React.forwardRef(({ item, viewMode, isRemoving, onRemove, onNavigate }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTitle = () => item.name || item.title || 'Untitled Masterpiece';
  const getPrice = () => {
    const value = item.regularPrice ?? item.price;
    return value !== '' && Number.isFinite(Number(value)) ? `R${Number(value).toLocaleString()}` : 'Contact';
  };
  const getLocation = () => item.address || item.location || 'Private Location';
  const getRating = () => Number(item.rating) > 0 ? Number(item.rating).toFixed(1) : 'New';
  const getImage = () => (item.imageUrls && item.imageUrls[0]) || (item.images && item.images[0]) || "https://placehold.co/600x400/E0E0E0/333333?text=No+Image";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.4 } }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
         ref={ref}
         variants={cardVariants}
         exit="exit"
         layout
         onClick={() => onNavigate(getItemPath(item))}
         className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden flex items-center p-4 gap-6 hover:shadow-xl transition-all duration-500 cursor-pointer"
      >
        <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0">
           <ImageWithFallback src={getImage()} alt={getTitle()} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">{item.type}</span>
              <div className="flex items-center gap-1">
                 <Star className="w-3 h-3 text-rose-500 fill-rose-500" />
                 <span className="text-xs font-black">{getRating()}</span>
              </div>
           </div>
           <h3 className="text-lg font-black text-gray-900 truncate mb-1 hover:text-rose-500 transition-colors uppercase tracking-tight">{getTitle()}</h3>
           <p className="text-gray-400 text-xs flex items-center gap-1.5 mb-4">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {getLocation()}
           </p>
           <div className="flex items-center justify-between">
              <span className="text-xl font-black text-gray-900">{getPrice()}</span>
               <button 
                 onClick={(e) => { e.stopPropagation(); onRemove(item._id, item.type); }}
                 aria-label={`Remove ${getTitle()} from wishlist`}
                 className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-gray-100"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      exit="exit"
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 h-full cursor-pointer"
      onClick={() => onNavigate(getItemPath(item))}
    >
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={getImage()}
          alt={getTitle()}
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
        />
      </div>

      {/* Top Overlays */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{item.type}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item._id, item.type);
          }}
          disabled={isRemoving}
          aria-label={`Remove ${getTitle()} from wishlist`}
          className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90 pointer-events-auto"
        >
          {isRemoving ? <Sparkles className="w-3.5 h-3.5 text-gray-900 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Permanent Information Overlay (On Image) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-white">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black">{getRating()}</span>
            </div>
            <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
              {getTitle()}
            </h3>
            <p className="text-xs text-white/70 font-medium truncate">
              {getLocation()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
              {getPrice()}
            </div>
            <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
          </div>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className={`absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md transition-all duration-500 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full space-y-4 transform transition-all duration-500 ${isHovered ? 'translate-y-0' : 'translate-y-4'}`}>
          <div className="flex gap-2">
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsUp className="w-4 h-4" />
              {item.votes?.up || 0}
            </div>
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsDown className="w-4 h-4" />
              {item.votes?.down || 0}
            </div>
          </div>
          <div className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl">
            Inspect Original Masterpiece
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const WishList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [removingId, setRemovingId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const categories = [
    { id: 'all', label: 'All Saved', icon: <Layers className="w-5 h-5" /> },
    { id: 'listing', label: 'Properties', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'service', label: 'Services', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'helper', label: 'Helper', icon: <User className="w-5 h-5" /> },
    { id: 'event', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
  ];

  // All localStorage keys used by the useWishlist hook, one per item type
  const WISHLIST_KEYS = {
    listing:  'wishlist',
    service:  'serviceWishlist',
    helper:   'helperWishlist',
    event:    'eventWishlist',
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to remove all saved items from your wishlist?')) {
      return;
    }
    setActionError('');
    setIsClearing(true);
    try {
      if (currentUser) {
        const result = await clearWishlistBackend('all');
        if (!result?.success) throw new Error(result?.message || 'Unable to clear your wishlist.');
      } else {
        Object.values(WISHLIST_KEYS).forEach(key => localStorage.removeItem(key));
        window.dispatchEvent(new Event('storage'));
      }
      setWishlist([]);
      dispatch(setWishlistCount(0));
    } catch (error) {
      setActionError(error.message || 'Unable to clear your wishlist.');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  const handleStorageChange = () => {
    loadWishlistFromLocal();
  };

  const loadWishlistFromLocal = () => {
    try {
      const merged = Object.entries(WISHLIST_KEYS).flatMap(([type, key]) => {
        try {
          const items = JSON.parse(localStorage.getItem(key)) || [];
          return items.map(item => ({ ...item, itemType: item.itemType || item.type || type, type }));
        } catch {
          return [];
        }
      });
      const seen = new Set();
      const unique = merged.filter(item => {
        if (!item._id || seen.has(item._id)) return false;
        seen.add(item._id);
        return true;
      });
      setWishlist(unique);
    } catch (err) {
      console.error('Failed reading local wishlist cache:', err);
    }
  };

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (currentUser) {
        // Fetch live database favorites for logged in user
        const dbWishlist = await getWishlistBackend();
        if (Array.isArray(dbWishlist)) {
          setWishlist(dbWishlist);
          return;
        }
      }
      // Fallback for non-logged in or offline user
      loadWishlistFromLocal();
    } catch (error) {
      console.error('Failed to load wishlist from database:', error);
      loadWishlistFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id, type) => {
    setRemovingId(id);
    setActionError('');
    try {
      if (currentUser) {
        const result = await toggleWishlistBackend(id, type);
        if (!result?.success || result.isFavorite !== false) throw new Error(result?.message || 'Unable to remove this saved item.');
      }
      const storageKey = WISHLIST_KEYS[type] || WISHLIST_KEYS.listing;
      const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
      localStorage.setItem(storageKey, JSON.stringify(stored.filter(item => item._id !== id)));
      window.dispatchEvent(new Event('storage'));
      const nextWishlist = wishlist.filter(item => !(item._id === id && item.type === type));
      setWishlist(nextWishlist);
      dispatch(setWishlistCount(nextWishlist.length));
    } catch (error) {
      console.error('Failed to remove item:', error);
      setActionError(error.message || 'Unable to remove this saved item.');
    } finally {
      setRemovingId(null);
    }
  };

  const onVote = (id, type, voteType) => {
     // Voting logic if needed in wishlist
  };

  const filteredWishlist = useMemo(() => {
    if (activeCategory === 'all') return wishlist;
    return wishlist.filter(item => {
      // Each item has a 'type' stamped by loadWishlist — this is the wishlist category key
      // ('listing', 'service', 'helper', 'event').
      // For listing items, itemType or the original item.type might be property sub-types
      // so we check both the stamped type and the itemType field.
      const wlType = item.type;
      const itemType = item.itemType;

      if (activeCategory === 'listing') {
        return wlType === 'listing' || itemType === 'listing' || itemType === 'property'
          || item.category === 'properties';
      }
      return wlType === activeCategory || itemType === activeCategory;
    });
  }, [wishlist, activeCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  return (
    <div className="min-h-screen bg-white pb-6">
       <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Animated Header Section */}
      <div className="relative pt-8 pb-8 px-6 overflow-hidden bg-gray-50/50 border-b border-gray-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-50/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200">
                  <Heart className="w-6 h-6 fill-white" />
                </div>
                <div className="h-px w-12 bg-gray-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Masterpiece Elite</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-2">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Wishlist</span>
              </h1>
              <p className="text-gray-400 font-medium text-sm">
                {wishlist.length} {wishlist.length === 1 ? 'masterpiece' : 'masterpieces'} saved in your collection
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="flex items-center gap-2 px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all active:scale-95 border border-rose-100 shadow-sm self-start md:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                {isClearing ? 'Clearing...' : 'Clear All Wishlist'}
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Categories & View Toggle Bar */}
      <div className="pt-4 pb-4 px-6 mb-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Categories Bar */}
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide pr-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-3 min-w-[80px]  transition-all ${activeCategory === cat.id ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeCategory === cat.id ? 'bg-gray-900 text-white shadow-2xl scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {cat.icon}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${activeCategory === cat.id ? 'text-gray-900' : 'hover:text-gray-600'}`}>
                  {cat.label}
                </span>
                <div className={`h-1 bg-gray-900 rounded-full transition-all duration-500 ${activeCategory === cat.id ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center shrink-0 gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-gray-100 border border-gray-50 max-w-fit">
            <button 
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Layers className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        {actionError && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{actionError}</p>}

        {/* Results Grid */}
        <div className="py-16">
          {loading ? (
             <div className="py-24 text-center">
               <div className="w-12 h-12 border-4 border-gray-100 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Curating your collection...</p>
             </div>
          ) : filteredWishlist.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-32 flex flex-col items-center justify-center text-center max-w-sm mx-auto"
            >
              <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-8 text-rose-500">
                 <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Your collection is empty</h3>
              <p className="text-gray-400 font-medium leading-relaxed mb-10">
                You haven't saved any masterpieces yet. Explore our listings and hit the heart icon to start your collection.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200"
              >
                Go Exploring
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12" : "flex flex-col gap-8 max-w-5xl mx-auto"}
            >
              <AnimatePresence mode="popLayout">
                {filteredWishlist.map((item) => (
                  <AirbnbCard 
                    key={item._id} 
                    item={item} 
                    viewMode={viewMode}
                    isRemoving={removingId === item._id}
                    onRemove={removeFromWishlist}
                    onNavigate={navigate}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishList;
