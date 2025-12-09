// src/pages/ListingsHomePage.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ListingItem from '../components/ListingItem';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { 
  MapPin, 
 
  ChevronRight,
  Home,

  TreePine,
  Moon,
  Clock,
  DollarSign
} from 'lucide-react';
import "../styles/List.scss";

const categories = [
  { id: 'all', label: 'All Listings', icon: <Home size={20} />, color: 'text-rose-500' },
  { id: 'rent', label: 'Rentals', icon: <Home size={20} />, color: 'text-blue-500' },
  { id: 'sale', label: 'For Sale', icon: <DollarSign size={20} />, color: 'text-green-500' },
  { id: 'over', label: 'Overnight', icon: <Moon size={20} />, color: 'text-purple-500' },
  { id: 'office', label: 'Per Hour', icon: <Clock size={20} />, color: 'text-amber-500' },
  { id: 'land', label: 'Land', icon: <TreePine size={20} />, color: 'text-emerald-500' },
];

const filters = [
  { label: 'Anywhere', active: true },
  { label: 'Any week', active: false },
  { label: 'Add guests', active: false, withBadge: true },
];

const popularDestinations = [
  { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
  { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
  { city: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
];

const ListingsHomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter listings based on search
  const filteredListings = useMemo(() => {
    if (!listings.length) return [];
    
    const categoryListings = activeTab === 'all' 
      ? listings 
      : listings.filter(listing => listing.type === activeTab);
    
    if (!searchQuery.trim()) return categoryListings;
    
    return categoryListings.filter(listing => 
      listing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listings, activeTab, searchQuery]);

  // Categorize listings for "All" view
  const categorizedListings = useMemo(() => {
    const result = {
      rent: [],
      sale: [],
      over: [],
      office: [],
      land: [],
      all: []
    };
    
    if (!listings.length) return result;
    
    listings.forEach(listing => {
      if (listing.type && result[listing.type]) {
        result[listing.type].push(listing);
      }
      result.all.push(listing);
    });
    
    return result;
  }, [listings]);

  // Fetch listings data from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/listing/get');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        
        const data = await response.json();
        setListings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load listings. Please try again later.');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleItemNavigation = (item) => {
    console.log('Navigating to listing:', item.name);
    // In a real app, you would use navigation here
    // navigate(`/listing/${item._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading amazing places...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">😔</div>
          <div className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
   

      {/* Quick Filters */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex flex-col items-center space-y-2 px-2 min-w-[80px] group ${
                    activeTab === category.id ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className={`p-3 rounded-full transition-colors ${
                    activeTab === category.id 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {React.cloneElement(category.icon, { 
                      className: activeTab === category.id ? 'text-white' : category.color 
                    })}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {category.label}
                  </span>
                  {activeTab === category.id && (
                    <div className="w-full h-0.5 bg-gray-800 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowMap(!showMap)}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
            >
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Show map</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-8 ${showMap ? 'lg:flex lg:space-x-8' : ''}`}>
        {/* Main Content */}
        <div className={`${showMap ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Popular Destinations */}
         
          

          {/* Listings Section */}
          {activeTab === 'all' ? (
            // Show all categories in sections
            <>
              {categories
                .filter(cat => cat.id !== 'all')
                .map(category => {
                  const categoryListings = categorizedListings[category.id];
                  if (!categoryListings || categoryListings.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="mb-16">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.label}</h3>
                          <p className="text-gray-600">Explore the best {category.label.toLowerCase()} properties</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab(category.id)} 
                          className="flex items-center text-gray-900 font-medium hover:underline"
                        >
                          View all
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                      
                      <Swiper
                        slidesPerView={1.2}
                        spaceBetween={16}
                        modules={[Navigation]}
                        navigation
                        className="mySwiper"
                        breakpoints={{
                          640: { slidesPerView: 1.5, spaceBetween: 20 },
                          768: { slidesPerView: 2.5, spaceBetween: 24 },
                          1024: { slidesPerView: 3.5, spaceBetween: 28 },
                          1280: { slidesPerView: 4.5, spaceBetween: 32 },
                        }}
                      >
                        {categoryListings
                          .slice(0, 12)
                          .map((item) => (
                            <SwiperSlide key={item._id} className="!h-auto">
                              <ListingItem
                                listing={item}
                                onClick={() => handleItemNavigation(item)}
                              />
                            </SwiperSlide>
                          ))}
                      </Swiper>
                    </div>
                  );
                })}
            </>
          ) : (
            // Show specific category
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {categories.find(c => c.id === activeTab)?.label || 'Listings'}
                </h2>
                <p className="text-gray-600">
                  {filteredListings.length} properties available
                </p>
              </div>

              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                  {filteredListings.map((item) => (
                    <ListingItem
                      key={item._id}
                      listing={item}
                      onClick={() => handleItemNavigation(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <div className="text-gray-400 text-6xl mb-6">🏠</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    No listings found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? `No properties found for "${searchQuery}". Try a different search.`
                      : `No properties available in this category at the moment.`
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => setActiveTab('all')}
                      className="px-6 py-3 border border-gray-800 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Browse All Categories
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Sidebar */}
        {showMap && (
          <div className="lg:w-1/3 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
            <div className="bg-gray-200 rounded-2xl h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600 font-medium">Map View</div>
                <div className="text-gray-500 text-sm mt-1">Interactive map coming soon</div>
              </div>
            </div>
          </div>
        )}
      </div>

    
    </div>
  );
};

export default ListingsHomePage;