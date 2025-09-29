import { useEffect, useState } from 'react';
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem"; // Add this import
import EventItem from "../components/EventItem";
import { FaHeart, FaSpinner } from 'react-icons/fa';
import "../styles/breakpoints.scss";

export default function WishList() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      try {
        // Load properties, services, helpers, and events from localStorage
        const storedListings = JSON.parse(localStorage.getItem('wishlist')) || [];
        const storedServices = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
        const storedHelpers = JSON.parse(localStorage.getItem('helperWishlist')) || []; // Add this line
        const storedEvents = JSON.parse(localStorage.getItem('eventWishlist')) || [];
        
        // Add type identifiers
        const listingsWithType = storedListings.map(item => ({ ...item, type: 'listing' }));
        const servicesWithType = storedServices.map(item => ({ ...item, type: 'service' }));
        const helpersWithType = storedHelpers.map(item => ({ ...item, type: 'helper' })); // Add this line
        const eventsWithType = storedEvents.map(item => ({ ...item, type: 'event' }));
        
        // Combine all wishlist items
        setWishlist([...listingsWithType, ...servicesWithType, ...helpersWithType, ...eventsWithType]);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      }
      setLoading(false);
    }, 800);

    const handleStorageChange = (e) => {
      if (e.key === 'wishlist' || 
          e.key === 'serviceWishlist' || 
          e.key === 'helperWishlist' || // Add this
          e.key === 'eventWishlist') {
        try {
          const storedListings = JSON.parse(localStorage.getItem('wishlist')) || [];
          const storedServices = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
          const storedHelpers = JSON.parse(localStorage.getItem('helperWishlist')) || []; // Add this
          const storedEvents = JSON.parse(localStorage.getItem('eventWishlist')) || [];
          
          const listingsWithType = storedListings.map(item => ({ ...item, type: 'listing' }));
          const servicesWithType = storedServices.map(item => ({ ...item, type: 'service' }));
          const helpersWithType = storedHelpers.map(item => ({ ...item, type: 'helper' })); // Add this
          const eventsWithType = storedEvents.map(item => ({ ...item, type: 'event' }));
          
          setWishlist([...listingsWithType, ...servicesWithType, ...helpersWithType, ...eventsWithType]);
        } catch (error) {
          console.error('Error loading wishlist:', error);
          setWishlist([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const removeFromWishlist = async (itemId, itemType) => {
    try {
      setRemovingId(itemId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update state
      setWishlist(prev => prev.filter(item => !(item._id === itemId && item.type === itemType)));
      
      // Update localStorage based on item type
      if (itemType === 'listing') {
        const updatedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const filtered = updatedWishlist.filter(item => item._id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(filtered));
      } else if (itemType === 'service') {
        const updatedServiceWishlist = JSON.parse(localStorage.getItem('serviceWishlist')) || [];
        const filtered = updatedServiceWishlist.filter(item => item._id !== itemId);
        localStorage.setItem('serviceWishlist', JSON.stringify(filtered));
      } else if (itemType === 'helper') { // Add this case for helpers
        const updatedHelperWishlist = JSON.parse(localStorage.getItem('helperWishlist')) || [];
        const filtered = updatedHelperWishlist.filter(item => item._id !== itemId);
        localStorage.setItem('helperWishlist', JSON.stringify(filtered));
      } else if (itemType === 'event') {
        const updatedEventWishlist = JSON.parse(localStorage.getItem('eventWishlist')) || [];
        const filtered = updatedEventWishlist.filter(item => item._id !== itemId);
        localStorage.setItem('eventWishlist', JSON.stringify(filtered));
      }
      
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <FaHeart className="text-rose-400 text-3xl animate-pulse" />
            </div>
            <div className="absolute -inset-2 border-4 border-rose-100 rounded-full animate-spin-slow opacity-70"></div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-3 font-sans">
            Curating Your Wishlist
          </h1>
          
          <div className="flex justify-center mb-6">
            <FaSpinner className="animate-spin text-2xl text-rose-500" />
          </div>
          
          <p className="text-gray-500 text-lg">
            Gathering your favorite properties, services, and helpers...
          </p>
          
          <div className="mt-8 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-rose-500 h-1.5 rounded-full animate-progress" 
              style={{ width: '70%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
        <p className="text-gray-500 mt-1">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-white border border-gray-200">
          <div className="w-10 h-10 mx-auto mb-4 rounded-2xl flex items-center justify-center">
            <FaHeart className="text-rose-300 text-4xl" />
          </div>
          <h2 className="text-xl font-medium text-gray-700">No favorites yet</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Save properties, services, helpers, and events you love by clicking the heart icon
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={`${item.type}-${item._id}`} className="relative">
              <div className="rounded-2xl transition-all duration-300 w-full overflow-hidden shadow-sm hover:shadow-xl flex flex-col cursor-pointer h-full">
                {item.type === 'listing' ? (
                  <ListingItem listing={item} />
                ) : item.type === 'service' ? (
                  <ServiceItem service={item} hideActions={true} />
                ) : item.type === 'helper' ? ( // Add helper case
                  <HelperItem helper={item} hideActions={true} />
                ) : item.type === 'event' ? (
                  <EventItem event={item} hideActions={true} />
                ) : null}
              </div>
              <button
                onClick={() => removeFromWishlist(item._id, item.type)}
                disabled={removingId === item._id}
                className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all ${
                  removingId === item._id 
                    ? 'bg-white/80 shadow-inner' 
                    : 'bg-white/90 hover:bg-white shadow-sm hover:shadow-md'
                }`}
                aria-label={`Remove ${item.type === 'listing' ? 'property' : item.type} from wishlist`}
              >
                {removingId === item._id ? (
                  <FaSpinner className="w-4 h-4 text-rose-500 animate-spin" />
                ) : (
                  <FaHeart className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}