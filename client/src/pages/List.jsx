import { useEffect, useState } from 'react';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";
import { 
  FaSpinner, 
  FaTrash, 
  FaHeart,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaStar,
  FaRegStar,
  FaShareAlt,
  FaDownload,
  FaChevronDown,
  FaCalendarAlt,
  FaTools,
  FaHome,
  FaTag
} from 'react-icons/fa';
import { TbHeartFilled } from 'react-icons/tb';
import "../styles/breakpoints.scss";

export default function WishList() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [groupedByDate, setGroupedByDate] = useState({});

  // Stats for the header
  const stats = {
    all: wishlist.length,
    properties: wishlist.filter(item => item.type === 'listing').length,
    services: wishlist.filter(item => item.type === 'service').length,
    helpers: wishlist.filter(item => item.type === 'helper').length,
    events: wishlist.filter(item => item.type === 'event').length,
  };

  // Format date like Airbnb
  const formatViewDate = (dateString) => {
    if (!dateString) return 'Recently viewed';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if today
      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      }
      
      // Check if yesterday
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // Check if within this week
      const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
      }
      
      // Otherwise return "Month Year"
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      return 'Recently viewed';
    }
  };

  // Group items by view date
  const groupItemsByDate = (items) => {
    const groups = {};
    
    items.forEach(item => {
      const viewDate = item.lastViewed || item.addedAt || Date.now();
      const dateKey = formatViewDate(viewDate);
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    // Sort groups by date
    const sortedGroups = {};
    const order = ['Today', 'Yesterday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Get all date keys and sort
    const allDates = Object.keys(groups);
    const sortedDates = [...new Set([...order.filter(d => allDates.includes(d)), ...allDates.filter(d => !order.includes(d))])];
    
    sortedDates.forEach(date => {
      if (groups[date]) {
        sortedGroups[date] = groups[date];
      }
    });
    
    return sortedGroups;
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
        
        // Generate mock data with Airbnb-like properties
        const generateAirbnbData = (items, type) => {
          const now = new Date();
          const mockDates = [
            new Date(now), // Today
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), // Yesterday
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2), // 2 days ago
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3), // 3 days ago
            new Date(now.getFullYear(), now.getMonth() - 1, 15), // Last month
            new Date(now.getFullYear(), now.getMonth() - 1, 10), // Last month
            new Date(now.getFullYear() - 1, 11, 25), // Last year
          ];
          
          // Sample Airbnb-like property data
          const propertyTypes = ['Rental unit', 'Guest suite', 'Chalet', 'Apartment', 'House', 'Cabin'];
          const locations = ['Dolphin Coast', 'Pretoria', 'Bela-Bela', 'Cape Town', 'Johannesburg', 'Durban'];
          const descriptions = [
            'Beautiful ocean view',
            'Cozy mountain retreat',
            'Luxury city apartment',
            'Peaceful countryside',
            'Modern downtown loft',
            'Traditional safari lodge'
          ];
          
          return items.map((item, index) => {
            const randomDate = mockDates[Math.floor(Math.random() * mockDates.length)];
            const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];
            const beds = Math.floor(Math.random() * 4) + 1;
            const price = (Math.random() * 200 + 50).toFixed(2);
            const rating = (Math.random() * 2 + 3).toFixed(1);
            
            return {
              ...item,
              type: type || item.type,
              addedAt: item.addedAt || Date.now(),
              lastViewed: randomDate.toISOString(),
              propertyType,
              location,
              description,
              beds,
              baths: Math.min(beds, Math.floor(Math.random() * 3) + 1),
              price,
              rating,
              reviews: Math.floor(Math.random() * 100) + 1,
              superhost: Math.random() > 0.7,
              image: item.image || `https://picsum.photos/seed/${item._id || index}/400/300`
            };
          });
        };
        
        const listingsWithType = generateAirbnbData(safeParse(storedListings), 'listing');
        const servicesWithType = generateAirbnbData(safeParse(storedServices), 'service');
        const helpersWithType = generateAirbnbData(safeParse(storedHelpers), 'helper');
        const eventsWithType = generateAirbnbData(safeParse(storedEvents), 'event');
        
        let combined = [...listingsWithType, ...servicesWithType, ...helpersWithType, ...eventsWithType];
        // Sort by most recent viewed
        combined.sort((a, b) => new Date(b.lastViewed || b.addedAt || 0) - new Date(a.lastViewed || a.addedAt || 0));
        
        setWishlist(combined);
        setGroupedByDate(groupItemsByDate(combined));
      } catch (error) {
        console.error('Error loading wishlist:', error);
        localStorage.setItem('wishlist', JSON.stringify([]));
        localStorage.setItem('serviceWishlist', JSON.stringify([]));
        localStorage.setItem('helperWishlist', JSON.stringify([]));
        localStorage.setItem('eventWishlist', JSON.stringify([]));
        setWishlist([]);
        setGroupedByDate({});
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
          combined.sort((a, b) => new Date(b.lastViewed || b.addedAt || 0) - new Date(a.lastViewed || a.addedAt || 0));
          
          setWishlist(combined);
          setGroupedByDate(groupItemsByDate(combined));
        } catch (error) {
          console.error('Error loading wishlist on storage change:', error);
          setWishlist([]);
          setGroupedByDate({});
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
      combined.sort((a, b) => new Date(b.lastViewed || b.addedAt || 0) - new Date(a.lastViewed || a.addedAt || 0));
      
      setWishlist(combined);
      setGroupedByDate(groupItemsByDate(combined));
      setLoading(false);
      clearTimeout(timer);
    } catch (error) {
      console.error('Error in immediate load:', error);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
      setGroupedByDate({});
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-50 shadow-sm flex items-center justify-center mx-auto border border-gray-200">
              <TbHeartFilled className="text-gray-400 text-4xl animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            Loading your saved stays
          </h1>
          
          <div className="flex justify-center mb-6">
            <FaSpinner className="animate-spin text-xl text-gray-600" />
          </div>
          
          <p className="text-gray-600">
            Loading your recently viewed...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Airbnb Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Recently viewed</h1>
              <p className="text-gray-600 text-sm">Stays, services, and experiences you've saved</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <FaShareAlt className="inline mr-2" />
                  Share
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <FaDownload className="inline mr-2" />
                  Download
                </button>
              </div>
              {selectedItems.length > 0 && (
                <button
                  onClick={removeSelected}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove ({selectedItems.length})
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          </div>
          
          {/* Stats - Minimal */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="font-medium">{stats.all} items</span>
            <span>•</span>
            <span>{Object.keys(groupedByDate).length} dates</span>
            <span>•</span>
            <span>{stats.properties} properties</span>
            <span>•</span>
            <span>{stats.services} services</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <TbHeartFilled className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No recently viewed</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              When you view stays and save them, they'll appear here
            </p>
            <button 
              onClick={() => window.location.href = '/properties'}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Explore stays
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Airbnb Style Grouped View */}
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date} className="space-y-4">
                {/* Date Header - Airbnb Style */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{date}</h2>
                  <span className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </div>
                
                {/* Two Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {items.map((item) => (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Airbnb Style Wishlist Card Component
function AirbnbWishlistCard({ item, removingId, removeFromWishlist, isSelected, onSelect }) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
      {/* Selection Checkbox - Top Left */}
      <div className="absolute top-3 left-3 z-20">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
        />
      </div>
      
      {/* Remove Button - Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFromWishlist(item._id, item.type);
        }}
        disabled={removingId === item._id}
        className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow transition-all"
        aria-label="Remove from wishlist"
      >
        {removingId === item._id ? (
          <FaSpinner className="w-4 h-4 text-gray-600 animate-spin" />
        ) : (
          <TbHeartFilled className="w-4 h-4 text-gray-600" />
        )}
      </button>
      
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title || item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.superhost && (
          <div className="absolute top-3 left-12 bg-white px-2 py-1 rounded text-xs font-medium">
            Superhost
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 truncate">
            {item.propertyType || item.type} in {item.location}
          </h3>
          <div className="flex items-center space-x-1">
            <FaStar className="w-3 h-3 text-black" />
            <span className="text-sm font-medium">{item.rating}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-500 text-sm mb-3 line-clamp-1">
          {item.description}
        </p>
        
        {/* Details */}
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center space-x-4">
            {item.beds && (
              <span className="flex items-center">
                <FaBed className="mr-1" />
                {item.beds} bed{item.beds > 1 ? 's' : ''}
              </span>
            )}
            {item.baths && (
              <span className="flex items-center">
                <FaBath className="mr-1" />
                {item.baths} bath{item.baths > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Price */}
          <div>
            <span className="font-medium text-gray-900">${item.price}</span>
            <span className="text-gray-500"> night</span>
          </div>
        </div>
        
        {/* Reviews */}
        {item.reviews && (
          <div className="mt-2 text-sm text-gray-500">
            {item.reviews} review{item.reviews > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// Original List Item (for reference, not used in Airbnb view)
function WishlistListItem({ item, removingId, removeFromWishlist, isSelected, onSelect }) {
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