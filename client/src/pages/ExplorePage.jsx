// src/pages/ExplorePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SearchInput from '../components/SearchInput';
import ListingItem from '../components/ListingItem';
import ServiceItem from '../components/ServiceItem';
import HelperItem from '../components/HelperItem';
import EventItem from '../components/EventItem';

// Icons
import {
  FiCompass,
  FiMapPin,
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiChevronRight,
  FiHome,
  FiTool,
  FiUsers,
  FiCalendar
} from "react-icons/fi";
import { TbBuilding, TbTools, TbUsers, TbCalendarEvent } from "react-icons/tb";

const ExplorePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Categories for exploration
  const categories = [
    { id: 'all', label: 'All', icon: <FiCompass className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'properties', label: 'Properties', icon: <TbBuilding className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { id: 'services', label: 'Services', icon: <TbTools className="w-5 h-5" />, color: 'bg-gradient-to-r from-emerald-500 to-green-500' },
    { id: 'helpers', label: 'Helpers', icon: <TbUsers className="w-5 h-5" />, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'events', label: 'Events', icon: <TbCalendarEvent className="w-5 h-5" />, color: 'bg-gradient-to-r from-amber-500 to-orange-500' }
  ];

  // Popular destinations
  const popularDestinations = [
    { id: 1, name: 'Cape Town', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', count: 1245 },
    { id: 2, name: 'Johannesburg', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99', count: 987 },
    { id: 3, name: 'Durban', image: 'https://images.unsplash.com/photo-1523480717984-24cba35ae1eb', count: 765 },
    { id: 4, name: 'Pretoria', image: 'https://images.unsplash.com/photo-1548013146-72479768bada', count: 543 },
    { id: 5, name: 'Stellenbosch', image: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc', count: 432 },
    { id: 6, name: 'Port Elizabeth', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801', count: 321 }
  ];

  // Popular searches
  const popularSearches = [
    'Beachfront properties',
    'Office spaces',
    'Cleaning services',
    'Personal chefs',
    'Weekend events',
    'Pet-friendly stays',
    'Luxury villas',
    'Moving services'
  ];

  useEffect(() => {
    fetchExploreData();
  }, [activeCategory]);

  const fetchExploreData = async () => {
    setIsLoading(true);
    try {
      // Fetch featured items
      const featuredRes = await fetch(`/api/explore/featured?category=${activeCategory}&limit=6`);
      const featuredData = await featuredRes.json();
      setFeaturedItems(featuredData.data || []);

      // Fetch trending items
      const trendingRes = await fetch(`/api/explore/trending?category=${activeCategory}&limit=6`);
      const trendingData = await trendingRes.json();
      setTrendingItems(trendingData.data || []);

      // Fetch nearby items (simulated)
      const nearbyRes = await fetch(`/api/explore/nearby?category=${activeCategory}&limit=6`);
      const nearbyData = await nearbyRes.json();
      setNearbyItems(nearbyData.data || []);
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render item based on type
  const renderItem = (item) => {
    switch(item.itemType) {
      case 'services':
        return <ServiceItem key={item._id} service={item} />;
      case 'helpers':
        return <HelperItem key={item._id} helper={item} />;
      case 'events':
        return <EventItem key={item._id} event={item} />;
      default:
        return <ListingItem key={item._id} listing={item} />;
    }
  };

  // Skeleton loader
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm overflow-hidden h-72">
          <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="pt-4 pb-4">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-rose-50 to-blue-50 rounded-3xl mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-blue-500/10"></div>
        <div className="relative z-10 px-8 py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4">
                Discover Amazing Places & Services
              </h1>
               <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Find properties, services, helpers, and events that match your lifestyle
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <SearchInput
                  placeholder="Search for properties, services, helpers, events..."
                  searchTypes={categories.slice(1).map(cat => ({
                    key: cat.id,
                    label: cat.label,
                    icon: cat.icon
                  }))}
                  className="w-full"
                  autoFocus={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Navigation */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${activeCategory === category.id ? `${category.color} text-white shadow-lg` : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                >
                  {category.icon}
                  <span className="font-medium">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Section */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
              <Link
                to={`/search?type=${activeCategory}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                View all
                <FiChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            {isLoading ? (
              <SkeletonGrid />
            ) : featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map(renderItem)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <FiCompass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No featured items found</h3>
                <p className="text-gray-600">Check back later for new featured listings</p>
              </div>
            )}
          </section>

          {/* Popular Destinations */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDestinations.map(destination => (
                <Link
                  key={destination.id}
                  to={`/search?q=${destination.name}&type=properties`}
                  className="group relative overflow-hidden rounded-2xl aspect-video"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundImage: `url(${destination.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
                    <p className="text-white/80">{destination.count.toLocaleString()} listings</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending Now */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiTrendingUp className="w-6 h-6" />
                Trending Now
              </h2>
              <Link
                to="/search?sort=trending"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                View all trending
                <FiChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            {isLoading ? (
              <SkeletonGrid />
            ) : trendingItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingItems.map(renderItem)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <FiTrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No trending items</h3>
                <p className="text-gray-600">Check back later for trending listings</p>
              </div>
            )}
          </section>

          {/* Popular Searches */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Searches</h2>
            <div className="flex flex-wrap gap-3">
              {popularSearches.map((search, index) => (
                <Link
                  key={index}
                  to={`/search?q=${encodeURIComponent(search)}`}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {search}
                </Link>
              ))}
            </div>
          </section>

          {/* Nearby You */}
          {currentUser && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiMapPin className="w-6 h-6" />
                  Recommended For You
                </h2>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                  Refresh
                </button>
              </div>
              
              {isLoading ? (
                <SkeletonGrid />
              ) : nearbyItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearbyItems.map(renderItem)}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No nearby items found</h3>
                  <p className="text-gray-600">Enable location services for personalized recommendations</p>
                </div>
              )}
            </section>
          )}

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to find your perfect match?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied users who found exactly what they were looking for
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Start Searching
              </Link>
              {!currentUser && (
                <Link
                  to="/sign-up"
                  className="px-8 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

    
    </div>
  );
};

export default ExplorePage;