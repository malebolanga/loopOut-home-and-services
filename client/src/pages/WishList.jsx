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
  FaChevronDown
} from 'react-icons/fa';
import { TbHeartFilled } from 'react-icons/tb';
import "../styles/breakpoints.scss";

export default function WishList() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

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

  const typeIcons = {
    listing: <FaHome className="text-blue-600" />,
    service: <FaTools className="text-green-600" />,
    helper: <FaTag className="text-purple-600" />,
    event: <FaCalendarAlt className="text-amber-600" />
  };

  const typeColors = {
    listing: 'bg-blue-50 border-blue-200 text-blue-700',
    service: 'bg-green-50 border-green-200 text-green-700',
    helper: 'bg-purple-50 border-purple-200 text-purple-700',
    event: 'bg-amber-50 border-amber-200 text-amber-700'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto border border-gray-200">
              <TbHeartFilled className="text-gray-600 text-4xl animate-pulse" />
            </div>
            <div className="absolute -inset-2 border-4 border-gray-100 rounded-full animate-spin opacity-70"></div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-3 font-sans">
            Loading Your Collection
          </h1>
          
          <div className="flex justify-center mb-6">
            <FaSpinner className="animate-spin text-2xl text-gray-600" />
          </div>
          
          <p className="text-gray-600 text-lg mb-8">
            Loading your saved items...
          </p>
          
          <div className="mt-8 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gray-600 h-full rounded-full animate-pulse" 
              style={{ width: '85%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Clean & Minimal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Collection</h1>
              <p className="text-gray-600">Properties, services, and experiences you've saved</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
              <TbHeartFilled className="text-gray-700" />
              <span className="text-lg font-semibold text-gray-800">{stats.all}</span>
              <span className="text-gray-600 text-sm">items</span>
            </div>
          </div>
          
          {/* Stats Cards - Clean Design */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
            <StatCard 
              label="All Items" 
              count={stats.all} 
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
              className="bg-gray-50 hover:bg-gray-100 border-gray-200"
              activeClassName="bg-white shadow border-gray-300"
            />
            <StatCard 
              label="Properties" 
              count={stats.properties} 
              active={filterType === 'listing'}
              onClick={() => setFilterType('listing')}
              icon={<FaHome className="text-blue-600" />}
              className="bg-blue-50 hover:bg-blue-100 border-blue-100"
              activeClassName="bg-white shadow border-blue-300"
            />
            <StatCard 
              label="Services" 
              count={stats.services} 
              active={filterType === 'service'}
              onClick={() => setFilterType('service')}
              icon={<FaTools className="text-green-600" />}
              className="bg-green-50 hover:bg-green-100 border-green-100"
              activeClassName="bg-white shadow border-green-300"
            />
            <StatCard 
              label="Helpers" 
              count={stats.helpers} 
              active={filterType === 'helper'}
              onClick={() => setFilterType('helper')}
              icon={<FaTag className="text-purple-600" />}
              className="bg-purple-50 hover:bg-purple-100 border-purple-100"
              activeClassName="bg-white shadow border-purple-300"
            />
            <StatCard 
              label="Events" 
              count={stats.events} 
              active={filterType === 'event'}
              onClick={() => setFilterType('event')}
              icon={<FaCalendarAlt className="text-amber-600" />}
              className="bg-amber-50 hover:bg-amber-100 border-amber-100"
              activeClassName="bg-white shadow border-amber-300"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FaFilter className="text-gray-500" />
                <span>Sort: {sortBy.replace('-', ' ')}</span>
                <FaChevronDown className={`text-xs transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsFilterOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            {selectedItems.length > 0 && (
              <button
                onClick={removeSelected}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <FaTrash />
                <span>Remove ({selectedItems.length})</span>
              </button>
            )}
            
            <button
              onClick={clearAll}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Clear All
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
              <FaShareAlt />
              <span>Share List</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredWishlist.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-white border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <TbHeartFilled className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your collection is empty</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Start building your personal collection by saving items you love
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={() => window.location.href = '/properties'}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Explore Properties
              </button>
              <button 
                onClick={() => window.location.href = '/services'}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors font-medium"
              >
                Browse Services
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid/List View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWishlist.map((item) => (
                  <WishlistCard
                    key={`${item.type}-${item._id}`}
                    item={item}
                    removingId={removingId}
                    removeFromWishlist={removeFromWishlist}
                    typeIcons={typeIcons}
                    typeColors={typeColors}
                    isSelected={selectedItems.includes(`${item.type}-${item._id}`)}
                    onSelect={() => toggleSelectItem(item._id, item.type)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWishlist.map((item) => (
                  <WishlistListItem
                    key={`${item.type}-${item._id}`}
                    item={item}
                    removingId={removingId}
                    removeFromWishlist={removeFromWishlist}
                    typeIcons={typeIcons}
                    typeColors={typeColors}
                    isSelected={selectedItems.includes(`${item.type}-${item._id}`)}
                    onSelect={() => toggleSelectItem(item._id, item.type)}
                  />
                ))}
              </div>
            )}
            
            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <FaEye />
                  <span>View as Public List</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <FaDownload />
                  <span>Export Collection</span>
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                {filteredWishlist.length} items • Updated just now
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, count, active, onClick, icon, className, activeClassName }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border transition-all text-left ${active ? activeClassName : className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {icon && <span>{icon}</span>}
      </div>
      <div className={`text-xl font-bold ${active ? 'text-gray-900' : 'text-gray-800'}`}>
        {count}
      </div>
    </button>
  );
}

// Wishlist Card Component (Grid View)
function WishlistCard({ item, removingId, removeFromWishlist, typeIcons, typeColors, isSelected, onSelect }) {
  const getItemComponent = () => {
    switch(item.type) {
      case 'listing':
        return <ListingItem listing={item} />;
      case 'service':
        return <ServiceItem service={item} hideActions={true} />;
      case 'helper':
        return <HelperItem helper={item} hideActions={true} />;
      case 'event':
        return <EventItem event={item} hideActions={true} />;
      default:
        return <div>Unknown item type</div>;
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-20">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      
      {/* Type Badge */}
      <div className={`absolute top-3 right-3 z-20 flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[item.type]}`}>
        {typeIcons[item.type]}
        <span className="capitalize">{item.type === 'listing' ? 'property' : item.type}</span>
      </div>
      
      {/* Item Content */}
      <div className="p-4">
        {getItemComponent()}
      </div>
      
      {/* Action Bar */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Added recently
        </span>
        
        <div className="flex items-center space-x-2">
          <button 
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              const viewUrl = {
                listing: `/property/${item._id}`,
                service: `/service/${item._id}`,
                helper: `/helper/${item._id}`,
                event: `/event/${item._id}`
              }[item.type];
              if (viewUrl) window.location.href = viewUrl;
            }}
          >
            <FaEye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFromWishlist(item._id, item.type);
            }}
            disabled={removingId === item._id}
            className={`p-1.5 rounded transition-colors ${
              removingId === item._id 
                ? 'bg-gray-100 text-gray-500' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            aria-label="Remove from wishlist"
          >
            {removingId === item._id ? (
              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <TbHeartFilled className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Wishlist List Item Component (List View)
function WishlistListItem({ item, removingId, removeFromWishlist, typeIcons, typeColors, isSelected, onSelect }) {
  return (
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center p-5">
        {/* Selection */}
        <div className="pr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        {/* Type Icon */}
        <div className={`p-3 rounded-lg mr-4 ${typeColors[item.type].replace('border-', 'bg-').replace('text-', '')}`}>
          {typeIcons[item.type]}
        </div>
        
        {/* Item Info */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base">
              {item.title || item.name || item.eventName || 'Untitled Item'}
            </h3>
            <span className="text-sm font-medium text-gray-600 capitalize mt-1 sm:mt-0">
              {item.type === 'listing' ? 'property' : item.type}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-1">
            {item.description || item.details || 'No description'}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2 sm:mb-0">
              <span>Recently added</span>
              {item.location && (
                <span className="flex items-center">
                  <FaMapMarkerAlt className="mr-1.5" />
                  {item.location}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                onClick={() => {
                  const viewUrl = {
                    listing: `/property/${item._id}`,
                    service: `/service/${item._id}`,
                    helper: `/helper/${item._id}`,
                    event: `/event/${item._id}`
                  }[item.type];
                  if (viewUrl) window.location.href = viewUrl;
                }}
              >
                <FaEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeFromWishlist(item._id, item.type)}
                disabled={removingId === item._id}
                className={`p-2 rounded transition-colors ${
                  removingId === item._id 
                    ? 'bg-gray-100 text-gray-500' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                {removingId === item._id ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <TbHeartFilled className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}