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
  FiCalendar,
  FiRefreshCw,
  FiNavigation,
  FiAlertCircle
} from "react-icons/fi";
import { TbBuilding, TbTools, TbUsers, TbCalendarEvent } from "react-icons/tb";

// Mock data generators
const generateMockItems = (count, type) => {
  const types = ['properties', 'services', 'helpers', 'events'];
  const itemType = type || types[Math.floor(Math.random() * types.length)];
  
  const baseItem = {
    _id: Math.random().toString(36).substr(2, 9),
    itemType,
    title: '',
    description: '',
    price: 0,
    rating: 0,
    reviewCount: 0,
    image: ''
  };

  const propertyTitles = [
    'Modern Apartment in City Center',
    'Luxury Villa with Ocean View',
    'Cozy Studio Near University',
    'Spacious Family House',
    'Penthouse with Rooftop Terrace'
  ];

  const serviceTitles = [
    'Professional Cleaning Service',
    'Home Renovation Experts',
    'Personal Chef for Events',
    'Gardening & Landscaping',
    'Plumbing & Electrical Services'
  ];

  const helperTitles = [
    'Experienced Babysitter',
    'Senior Care Companion',
    'Personal Fitness Trainer',
    'Home Tutor for Mathematics',
    'Pet Sitter & Walker'
  ];

  const eventTitles = [
    'Weekend Music Festival',
    'Food & Wine Tasting',
    'Yoga Retreat Workshop',
    'Business Networking Event',
    'Art Exhibition Opening'
  ];

  const images = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w-800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&auto=format&fit=crop'
  ];

  const items = [];
  
  for (let i = 0; i < count; i++) {
    let title, price, rating;
    
    switch(itemType) {
      case 'properties':
        title = propertyTitles[Math.floor(Math.random() * propertyTitles.length)];
        price = Math.floor(Math.random() * 5000) + 1000;
        rating = (Math.random() * 2 + 3).toFixed(1);
        break;
      case 'services':
        title = serviceTitles[Math.floor(Math.random() * serviceTitles.length)];
        price = Math.floor(Math.random() * 200) + 50;
        rating = (Math.random() * 2 + 3).toFixed(1);
        break;
      case 'helpers':
        title = helperTitles[Math.floor(Math.random() * helperTitles.length)];
        price = Math.floor(Math.random() * 100) + 20;
        rating = (Math.random() * 2 + 3).toFixed(1);
        break;
      case 'events':
        title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
        price = Math.floor(Math.random() * 150) + 10;
        rating = (Math.random() * 2 + 3).toFixed(1);
        break;
      default:
        title = propertyTitles[Math.floor(Math.random() * propertyTitles.length)];
        price = Math.floor(Math.random() * 5000) + 1000;
        rating = (Math.random() * 2 + 3).toFixed(1);
    }

    items.push({
      ...baseItem,
      _id: `${itemType}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${title} ${i + 1}`,
      description: `This is a wonderful ${itemType} that offers great value and quality service. Perfect for your needs.`,
      price,
      rating: parseFloat(rating),
      reviewCount: Math.floor(Math.random() * 200) + 10,
      image: images[Math.floor(Math.random() * images.length)],
      location: 'Cape Town, South Africa',
      isFeatured: i < 2,
      isTrending: i < 3
    });
  }
  
  return items;
};

const ExplorePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [userCity, setUserCity] = useState(null);

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
    getUserLocation();
  }, [activeCategory]);

  // Get user's location using GPS/Geolocation API
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      fetchGenericNearbyItems();
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        // Reverse geocode to get city name
        try {
          const city = await reverseGeocode(latitude, longitude);
          setUserCity(city);
          
          // Fetch nearby items based on location
          fetchNearbyItems(latitude, longitude, city);
        } catch (error) {
          console.error('Error getting city name:', error);
          setLocationError('Could not determine your city');
          // Still fetch with coordinates
          fetchNearbyItems(latitude, longitude, null);
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        setIsLocationLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access was denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
        // Fetch generic nearby items if location fails
        fetchGenericNearbyItems();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reverse geocode coordinates to get city name
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || 'Your Location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  };

  const fetchExploreData = async () => {
    setIsLoading(true);
    try {
      // For development: Use mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        // Generate mock data based on active category
        const mockFeatured = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
        const mockTrending = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
        
        // Mark some items as featured/trending
        const featuredData = mockFeatured.map((item, index) => ({
          ...item,
          isFeatured: true,
          title: `Featured: ${item.title}`
        }));
        
        const trendingData = mockTrending.map((item, index) => ({
          ...item,
          isTrending: true,
          title: `Trending: ${item.title}`
        }));
        
        setFeaturedItems(featuredData);
        setTrendingItems(trendingData);
      } else {
        // Production: Fetch from API
        const featuredRes = await fetch(`/api/explore/featured?category=${activeCategory}&limit=6`);
        const featuredData = await featuredRes.json();
        setFeaturedItems(featuredData.data || []);

        const trendingRes = await fetch(`/api/explore/trending?category=${activeCategory}&limit=6`);
        const trendingData = await trendingRes.json();
        setTrendingItems(trendingData.data || []);
      }
    } catch (error) {
      console.error('Error fetching explore data:', error);
      // Fallback to mock data on error
      const mockFeatured = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
      const mockTrending = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
      setFeaturedItems(mockFeatured);
      setTrendingItems(mockTrending);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nearby items based on user's location
  const fetchNearbyItems = async (latitude, longitude, city) => {
    try {
      // For development: Use mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        const mockNearby = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
        const nearbyData = mockNearby.map((item, index) => ({
          ...item,
          location: city || 'Nearby Location',
          title: `Nearby: ${item.title}`
        }));
        setNearbyItems(nearbyData);
        return;
      }
      
      // Production: Fetch from API
      let url = `/api/explore/nearby?category=${activeCategory}&limit=6`;
      
      if (latitude && longitude) {
        url += `&lat=${latitude}&lng=${longitude}`;
      }
      
      if (city) {
        url += `&city=${encodeURIComponent(city)}`;
      }

      const nearbyRes = await fetch(url);
      const nearbyData = await nearbyRes.json();
      setNearbyItems(nearbyData.data || []);
    } catch (error) {
      console.error('Error fetching nearby items:', error);
      fetchGenericNearbyItems();
    }
  };

  // Fetch generic nearby items when location is not available
  const fetchGenericNearbyItems = async () => {
    try {
      // For development: Use mock data
      if (process.env.NODE_ENV === 'development') {
        const mockNearby = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
        const nearbyData = mockNearby.map((item, index) => ({
          ...item,
          location: 'General Location',
          title: `Recommended: ${item.title}`
        }));
        setNearbyItems(nearbyData);
        return;
      }
      
      // Production: Fetch from API
      const nearbyRes = await fetch(`/api/explore/nearby?category=${activeCategory}&limit=6`);
      const nearbyData = await nearbyRes.json();
      setNearbyItems(nearbyData.data || []);
    } catch (error) {
      console.error('Error fetching generic nearby items:', error);
      // Ultimate fallback: use mock data
      const mockNearby = generateMockItems(6, activeCategory === 'all' ? null : activeCategory);
      setNearbyItems(mockNearby);
    }
  };

  // Handle location refresh
  const handleRefreshLocation = () => {
    getUserLocation();
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
      {/* Add padding top to account for fixed header */}
      <div className="pt-2 md:pt-4">
        <main className="pt-4 pb-4">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-rose-50 to-blue-50 rounded-3xl overflow-hidden mb-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Category Navigation */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Browse Categories</h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base ${activeCategory === category.id ? `${category.color} text-white shadow-lg` : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Listings</h2>
                <Link
                  to={`/search?type=${activeCategory}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
                >
                  View all
                  <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>
              
              {isLoading ? (
                <SkeletonGrid />
              ) : featuredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {featuredItems.map(renderItem)}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 bg-white rounded-2xl border border-gray-200">
                  <FiCompass className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">No featured items found</h3>
                  <p className="text-gray-600 text-sm md:text-base">Check back later for new featured listings</p>
                </div>
              )}
            </section>

            {/* Popular Destinations */}
            <section className="mb-12 md:mb-16">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Popular Destinations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                    <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{destination.name}</h3>
                      <p className="text-white/80 text-sm md:text-base">{destination.count.toLocaleString()} listings</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Trending Now */}
            <section className="mb-12 md:mb-16">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                  Trending Now
                </h2>
                <Link
                  to="/search?sort=trending"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
                >
                  View all trending
                  <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>
              
              {isLoading ? (
                <SkeletonGrid />
              ) : trendingItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {trendingItems.map(renderItem)}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 bg-white rounded-2xl border border-gray-200">
                  <FiTrendingUp className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">No trending items</h3>
                  <p className="text-gray-600 text-sm md:text-base">Check back later for trending listings</p>
                </div>
              )}
            </section>

            {/* Popular Searches */}
            <section className="mb-12 md:mb-16">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Popular Searches</h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {popularSearches.map((search, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(search)}`}
                    className="px-3 py-2 md:px-4 md:py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors text-sm md:text-base"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </section>

            {/* Nearby You - Enhanced with location detection */}
            <section className="mb-12 md:mb-16">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="truncate max-w-[150px] md:max-w-none">
                      {userCity ? `Nearby in ${userCity}` : 'Recommended For You'}
                    </span>
                  </h2>
                  {isLocationLoading && (
                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                      <FiRefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      <span className="hidden sm:inline">Detecting location...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  {locationError && (
                    <div className="flex items-center gap-1 text-xs md:text-sm text-amber-600">
                      <FiAlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Location error</span>
                    </div>
                  )}
                  <button
                    onClick={handleRefreshLocation}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
                    disabled={isLocationLoading}
                  >
                    <FiNavigation className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">
                      {isLocationLoading ? 'Detecting...' : 'Refresh Location'}
                    </span>
                  </button>
                </div>
              </div>
              
              {locationError && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2 md:gap-3">
                    <FiAlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-medium mb-1 text-sm md:text-base">Location Access Required</p>
                      <p className="text-amber-700 text-xs md:text-sm">{locationError}</p>
                      <p className="text-amber-600 text-xs md:text-sm mt-1 md:mt-2">
                        Showing general recommendations. Enable location services for personalized results.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading || isLocationLoading ? (
                <SkeletonGrid />
              ) : nearbyItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {nearbyItems.map(renderItem)}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 bg-white rounded-2xl border border-gray-200">
                  <FiMapPin className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                    {locationError ? 'General Recommendations' : 'No nearby items found'}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4">
                    {locationError 
                      ? 'Enable location services for personalized recommendations' 
                      : 'Try refreshing your location or browse other categories'}
                  </p>
                  {!locationError && (
                    <button
                      onClick={handleRefreshLocation}
                      className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto text-sm md:text-base"
                    >
                      <FiRefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                      Refresh Location
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* CTA Section */}
            <div className="mt-12 md:mt-16 p-6 md:p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-center">
              <h2 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                Ready to find your perfect match?
              </h2>
              <p className="text-blue-100 mb-4 md:mb-6 max-w-2xl mx-auto text-sm md:text-base">
                Join thousands of satisfied users who found exactly what they were looking for
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link
                  to="/search"
                  className="px-6 py-2 md:px-8 md:py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm md:text-base"
                >
                  Start Searching
                </Link>
                {!currentUser && (
                  <Link
                    to="/sign-up"
                    className="px-6 py-2 md:px-8 md:py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors text-sm md:text-base"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add bottom padding to account for the Footer's fixed bottom navigation */}
      <div className="pb-20"></div>
    </div>
  );
};

export default ExplorePage;