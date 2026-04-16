// RecentlyViewedPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Map, 
  List as ListIcon, 
  Trash2, 
  Heart, 
  History,
  Calendar,
  Sparkles,
  Users,
  Home as HomeIcon,
  ChevronLeft,
  X,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  Building
} from 'lucide-react';
import ListingItem from '../components/ListingItem';
import ServiceItem from '../components/ServiceItem';
import HelperItem from '../components/HelperItem';
import EventItem from '../components/EventItem';

const RECENTLY_VIEWED_KEY = 'recentlyViewed';

const categories = [
  { id: 'all', label: 'All History', icon: <History className="w-5 h-5" /> },
  { id: 'listing', label: 'Properties', icon: <HomeIcon className="w-5 h-5" /> },
  { id: 'service', label: 'Services', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'helper', label: 'Helpers', icon: <Users className="w-5 h-5" /> },
  { id: 'event', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
];

const RecentlyViewedPage = () => {
  const navigate = useNavigate();
  const [viewedItems, setViewedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setViewedItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let items = activeTab === 'all' 
      ? viewedItems 
      : viewedItems.filter(item => item.itemType === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(query) || 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.address?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      );
    }

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.viewedAt) - new Date(b.viewedAt);
        case 'price-low':
          return (a.price || a.regularPrice || 0) - (b.price || b.regularPrice || 0);
        case 'price-high':
          return (b.price || b.regularPrice || 0) - (a.price || a.regularPrice || 0);
        default: // 'recent'
          return new Date(b.viewedAt) - new Date(a.viewedAt);
      }
    });
  }, [viewedItems, activeTab, searchQuery, sortBy]);

  const handleClearHistory = () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    setViewedItems([]);
    setShowClearConfirm(false);
  };

  const removeItem = (id, viewedAt) => {
    const newItems = viewedItems.filter(item => !(item._id === id && item.viewedAt === viewedAt));
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
    setViewedItems(newItems);
  };

  const renderItemCard = (item) => {
    const key = `${item._id}-${item.viewedAt}`;
    
    // Custom wrapper to add "Remove" button and "Viewed At" indicator
    const CardWrapper = ({ children }) => (
      <div className="relative ">
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeItem(item._id, item.viewedAt);
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-500 hover:text-rose-600 hover:bg-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
            title="Remove from history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 z-30 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 border border-white/20">
            <Clock className="w-3 h-3" />
            {new Date(item.viewedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {children}
      </div>
    );

    if (item.itemType === 'listing' || item.itemType === 'properties' || !item.itemType) {
      return (
        <CardWrapper key={key}>
          <ListingItem listing={item} />
        </CardWrapper>
      );
    }
    if (item.itemType === 'service' || item.itemType === 'services') {
      return (
        <CardWrapper key={key}>
          <ServiceItem service={item} />
        </CardWrapper>
      );
    }
    if (item.itemType === 'helper' || item.itemType === 'helpers') {
      return (
        <CardWrapper key={key}>
          <HelperItem helper={item} />
        </CardWrapper>
      );
    }
    if (item.itemType === 'event' || item.itemType === 'events') {
      return (
        <CardWrapper key={key}>
          <EventItem 
            event={{ 
              ...item, 
              address: item.location || item.address || "", 
              date: item.date || item.dateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
              time: item.time || item.dateTime?.split('T')[1] || "00:00"
            }} 
          />
        </CardWrapper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Recalling your discoveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors order-first"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Recently Viewed
                </h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {viewedItems.length} Stories you've explored
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center border border-gray-200 rounded-full px-1 py-1 pr-3 hover:shadow-sm transition-shadow bg-gray-50">
                <div className="bg-white p-1.5 rounded-full mr-2 shadow-sm">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Price: Low</option>
                  <option value="price-high">Price: High</option>
                </select>
              </div>

              {/* Clear History Button */}
              {viewedItems.length > 0 && (
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2.5 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto pt-2 pb-1 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex flex-col items-center gap-2 min-w-[70px] pb-3 border-b-2 transition-all duration-300  ${
                  activeTab === category.id 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-200'
                }`}
              >
                <div className={`transition-transform duration-300 ${activeTab === category.id ? 'scale-110' : 'group-hover:scale-105 opacity-60'}`}>
                  {category.icon}
                </div>
                <span className={`text-[11px] font-bold whitespace-nowrap tracking-wide uppercase ${activeTab === category.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <History className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No history matches your search' : 'Your history is clear'}
            </h2>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              {searchQuery 
                ? 'Try searching for something else or browse all categories.' 
                : 'Items you view will show up here so you can easily find them again.'}
            </p>
            <Link 
              to="/" 
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl shadow-gray-200"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {filteredItems.map(item => renderItemCard(item))}
          </div>
        )}
      </main>

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 mx-auto text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Clear entire history?</h3>
            <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
              This will remove all items from your recently viewed list. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearHistory}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-200 text-sm"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedPage;
