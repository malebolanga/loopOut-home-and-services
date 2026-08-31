// src/pages/ExplorePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SearchInput from '../components/SearchInput';
import ListingItem from '../components/ListingItem';
import ServiceItem from '../components/ServiceItem';
import HelperItem from '../components/HelperItem';
import EventItem from '../components/EventItem';
import { useSearchIntelligence } from '../hooks/useSearchIntelligence';
import { motion } from 'framer-motion';
import { BrandIcon } from '../components/BrandLogo';
import { Sparkles } from 'lucide-react';

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
  FiAlertCircle,
  FiCpu,
  FiClock,
  FiSearch
} from "react-icons/fi";
import { TbBuilding, TbTools, TbUsers, TbCalendarEvent } from "react-icons/tb";

const RECENTLY_VIEWED_KEY = 'loopOut_recentlyViewed';

const ExplorePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { 
    searchHistory = [], 
    viewHistory = [], 
    userLocation, 
    preferredCategories = [],
    recordSearch,
    updateLocation 
  } = useSearchIntelligence();

  const [featuredItems, setFeaturedItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationError, setLocationError] = useState(null);
  const [userCity, setUserCity] = useState(null);

  // Categories for exploration
  const categories = [
    { id: 'all', label: 'All', icon: <FiCompass className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'properties', label: 'Properties', icon: <TbBuilding className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { id: 'services', label: 'Services', icon: <TbTools className="w-5 h-5" />, color: 'bg-gradient-to-r from-emerald-500 to-green-500' },
    { id: 'helpers', label: 'Helpers', icon: <TbUsers className="w-5 h-5" />, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'handyman', label: 'Handyman', icon: <FiTool className="w-5 h-5" />, color: 'bg-gradient-to-r from-slate-600 to-gray-800' },
    { id: 'events', label: 'Events', icon: <TbCalendarEvent className="w-5 h-5" />, color: 'bg-gradient-to-r from-amber-500 to-orange-500' }
  ];

  // Popular destinations
  const popularDestinations = [
    { id: 1, name: 'Cape Town', image: 'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=800', count: 1245 },
    { id: 2, name: 'Johannesburg', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800', count: 987 },
    { id: 3, name: 'Durban', image: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800', count: 765 },
    { id: 4, name: 'Pretoria', image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', count: 543 },
    { id: 5, name: 'Stellenbosch', image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', count: 432 },
    { id: 6, name: 'Port Elizabeth', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800', count: 321 }
  ];

  useEffect(() => {
    fetchExploreData();
    if (!userLocation) {
      getUserLocation();
    }
    loadRecentlyViewed();
  }, [activeCategory]);

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        setRecentlyViewed(items.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    }
  };

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
        updateLocation({ latitude, longitude });

        try {
          const city = await reverseGeocode(latitude, longitude);
          setUserCity(city);
          fetchNearbyItems(latitude, longitude, city);
        } catch (error) {
          setLocationError('Could not determine your city');
          fetchNearbyItems(latitude, longitude, null);
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        setIsLocationLoading(false);
        setLocationError('Location access was denied or unavailable.');
        fetchGenericNearbyItems();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
      const categoryMap = {
        all: 'all',
        properties: 'listing',
        services: 'service',
        helpers: 'helper',
        events: 'event'
      };
      const backendCategory = categoryMap[activeCategory] || 'all';

      const featuredRes = await fetch(`/api/explore/featured?category=${backendCategory}&limit=6`);
      const featuredData = await featuredRes.json();
      setFeaturedItems(Array.isArray(featuredData) ? featuredData : (Array.isArray(featuredData?.items) ? featuredData.items : []));

      const trendingRes = await fetch(`/api/explore/trending?category=${backendCategory}&limit=6`);
      const trendingData = await trendingRes.json();
      setTrendingItems(Array.isArray(trendingData) ? trendingData : (Array.isArray(trendingData?.items) ? trendingData.items : []));
    } catch (error) {
      setFeaturedItems([]);
      setTrendingItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNearbyItems = async (latitude, longitude, city) => {
    try {
      const categoryMap = {
        all: 'all',
        properties: 'listing',
        services: 'service',
        helpers: 'helper',
        events: 'event'
      };
      const backendCategory = categoryMap[activeCategory] || 'all';

      let url = `/api/explore/nearby?category=${backendCategory}&limit=6`;
      if (latitude && longitude) url += `&lat=${latitude}&lng=${longitude}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;

      const nearbyRes = await fetch(url);
      const nearbyData = await nearbyRes.json();
      setNearbyItems(Array.isArray(nearbyData) ? nearbyData : (Array.isArray(nearbyData?.items) ? nearbyData.items : []));
    } catch (error) {
      fetchGenericNearbyItems();
    }
  };

  const fetchGenericNearbyItems = async () => {
    try {
      const categoryMap = {
        all: 'all',
        properties: 'listing',
        services: 'service',
        helpers: 'helper',
        events: 'event'
      };
      const backendCategory = categoryMap[activeCategory] || 'all';
      const nearbyRes = await fetch(`/api/explore/nearby?category=${backendCategory}&limit=6`);
      const nearbyData = await nearbyRes.json();
      setNearbyItems(Array.isArray(nearbyData) ? nearbyData : (Array.isArray(nearbyData?.items) ? nearbyData.items : []));
    } catch (error) {
      setNearbyItems([]);
    }
  };

  const handleRefreshLocation = () => getUserLocation();

  const renderItem = (item) => {
    const itemType = item.type || 'listing';
    switch (itemType) {
      case 'service': return <ServiceItem key={item._id} service={item} />;
      case 'helper': return <HelperItem key={item._id} helper={item} />;
      case 'event': return <EventItem key={item._id} event={item} />;
      default: return <ListingItem key={item._id} listing={item} />;
    }
  };

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm overflow-hidden h-72">
          <div className="h-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
          <div className="p-6 space-y-3">
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <div className="pt-2 md:pt-4">
        <main className="pt-4 pb-4">
          {/* Hero Section */}
          <div className="relative mx-4 md:mx-8 xl:mx-12 bg-gray-950 rounded-[3rem] md:rounded-[4rem] overflow-hidden mb-12 shadow-2xl group">
            <div className="absolute inset-0">
               <img 
                 src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                 className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[10s] ease-linear"
                 alt="Hero"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
            </div>
            
            <div className="relative z-10 px-8 py-16 md:py-24 lg:py-32 xl:px-20">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="px-3 py-1 bg-rose-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">Neural Discovery</div>
                    <div className="flex items-center gap-1.5">
                       <FiCpu className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">AI Intelligence Active</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                    Explore the <span className="text-rose-500">Unseen</span><br />Masterpieces.
                  </h1>
                  <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl font-medium leading-relaxed">
                    Personalized properties, elite services, and curated events—all powered by LoopOut's neural engine.
                  </p>

                  <div className="max-w-xl">
                    <SearchInput
                      placeholder="What are you looking for?"
                      searchTypes={categories.slice(1).map(cat => ({
                        key: cat.id,
                        label: cat.label,
                        icon: cat.icon
                      }))}
                      onSearch={(term) => recordSearch(term)}
                      className="w-full scale-110 origin-left"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-w-[2520px] mx-auto xl:px-[82px] md:px-[42px] px-[20px] py-8">
            
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <FiClock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white">Recent Explorations</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {searchHistory.slice(0, 5).map((term, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/search?searchTerm=${encodeURIComponent(term)}`)}
                      className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-900 dark:text-white shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex items-center gap-2"
                    >
                      <FiSearch className="w-3 h-3 text-rose-500" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="mb-16">
              <h2 className="text-2xl font-black text-gray-950 mb-8 tracking-tight">Browse by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-[2.5rem] transition-all duration-500 ${activeCategory === category.id ? `${category.color} text-white shadow-2xl scale-105` : 'bg-white dark:bg-gray-900 text-gray-950 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1'}`}
                  >
                    <div className={`p-4 rounded-2xl ${activeCategory === category.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      {category.icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{category.label}</span>
                    {preferredCategories?.[0] === category.id && activeCategory !== category.id && (
                       <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-2 py-1 rounded-full font-black animate-bounce shadow-lg">SMART CHOICE</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <section className="mb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-950 tracking-tight">Neural Recommendations</h2>
                  <p className="text-gray-500 dark:text-white font-medium mt-1">Curated masterpieces based on your behavior</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100">
                   <FiCpu className="w-4 h-4 text-rose-500" />
                   <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Optimized for you</span>
                </div>
              </div>
              {isLoading ? <SkeletonGrid /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(Array.isArray(featuredItems) ? featuredItems : []).map(renderItem)}
                </div>
              )}
            </section>

            {/* Main Brand Mission Banner - Redesigned 'LoopOut for Everyone' */}
            <section className="mb-20">
              <div className="relative overflow-hidden rounded-[3rem] bg-gray-950 p-8 md:p-16 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                {/* Visual Background Asset */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/loopout_for_everyone.png" 
                    className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    alt="LoopOut for Everyone"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-shrink-0">
                     <div className="relative group">
                        <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                        <BrandIcon className="w-32 h-32 md:w-48 md:h-48 relative z-10 drop-shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-transform group-hover:scale-105 duration-700" />
                     </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 rounded-full mb-6 border border-rose-500/30 backdrop-blur-md">
                       <Sparkles className="w-4 h-4 text-rose-400" />
                       <span className="text-[10px] font-black text-rose-100 uppercase tracking-[0.2em]">Universal Access</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                      LoopOut for <span className="text-rose-500">Everyone.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl leading-relaxed font-medium">
                      From the vibrant streets of <span className="text-white">Johannesburg</span> and <span className="text-white">Pretoria</span> to the community hubs of <span className="text-white">Pietermaritzburg</span> and <span className="text-white">Rustenburg</span>, LoopOut connects you to the masterpieces of your community. Search, discover, and support local—this is discovery for everyone.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <button 
                        onClick={() => navigate('/contact')}
                        className="px-10 py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                      >
                        <FiSearch className="w-4 h-4" />
                        Contact & Support Us
                      </button>
                      <button 
                        onClick={() => navigate('/about')}
                        className="px-10 py-5 bg-white/5 text-white border border-white/10 backdrop-blur-md rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                      >
                        Learn what we're doing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Destinations */}
            <section className="mb-20">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-950 tracking-tight">Global Hotspots</h2>
                  <p className="text-gray-500 dark:text-white font-medium mt-1">Where the world is booking right now</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {popularDestinations.map(destination => (
                  <Link
                    key={destination.id}
                    to={`/search?q=${destination.name}&type=properties`}
                    className="group relative overflow-hidden rounded-[2.5rem] aspect-[3/4]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${destination.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-black text-white mb-1 leading-tight tracking-tight">{destination.name}</h3>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{destination.count.toLocaleString()} spots</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Nearby Section */}
            <section className="mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-3">
                    <FiMapPin className="text-rose-500" />
                    {userCity ? `Local Treasures: ${userCity}` : 'Local Treasures'}
                  </h2>
                  <p className="text-gray-500 dark:text-white font-medium mt-1">Discover what's around your immediate coordinates</p>
                </div>
                <button
                  onClick={handleRefreshLocation}
                  disabled={isLocationLoading}
                  className="px-6 py-3 bg-gray-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <FiNavigation className={isLocationLoading ? 'animate-pulse' : ''} />
                  {isLocationLoading ? 'Detecting...' : 'Refresh Location'}
                </button>
              </div>

              {locationError && (
                <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex items-center gap-4">
                  <FiAlertCircle className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-amber-900 font-black text-sm uppercase tracking-widest">Neural Precision Restricted</p>
                    <p className="text-amber-700 text-sm mt-1">{locationError} Enable location for peak performance.</p>
                  </div>
                </div>
              )}

              {isLoading || isLocationLoading ? <SkeletonGrid /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(Array.isArray(nearbyItems) && nearbyItems.length > 0) ? nearbyItems.map(renderItem) : (
                    <div className="col-span-full py-20 bg-gray-50 dark:bg-gray-800 rounded-[4rem] text-center">
                       <FiMapPin className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                       <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No local signals detected</h3>
                       <p className="text-gray-400 mt-2">Try searching a different quadrant</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <div className="pb-40"></div>
    </div>
  );
};

export default ExplorePage;
