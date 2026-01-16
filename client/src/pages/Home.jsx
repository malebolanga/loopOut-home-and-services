import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import "../styles/ListingDetails.scss";

// Constants
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENTLY_VIEWED = 12;
const DATA_FETCH_LIMIT = 8;

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
    <div className="aspect-[3/2] bg-gradient-to-r from-gray-200 to-gray-300"></div>
    <div className="p-3 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-8"></div>
      </div>
      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

// Mobile App Homepage Component
const MobileAppHomepage = ({ 
  featuredProperties,
  featuredServices,
  featuredHelpers,
  featuredEvents,
  loadingProperties,
  loadingServices,
  loadingHelpers,
  loadingEvents,
  stats,
  onItemClick,
  recentlyViewedItems,
  onRecentlyViewedLike,
  currentLocation = 'South Africa',
  navigate
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchVisible, setSearchVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const searchInputRef = useRef(null);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearchClick = () => {
    setSearchVisible(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleSearchSubmit = (value) => {
    if (value.trim()) {
      navigate(`/search?searchTerm=${value}&type=all&address=${encodeURIComponent(currentLocation)}`);
    }
    setSearchVisible(false);
  };

  // Mock categories for the grid - responsive columns
  const categories = [
    { icon: '🏠', label: 'Homes', color: 'bg-blue-100', type: 'properties' },
    { icon: '✨', label: 'Services', color: 'bg-emerald-100', type: 'services' },
    { icon: '👷', label: 'Helpers', color: 'bg-purple-100', type: 'helpers' },
    { icon: '🎪', label: 'Events', color: 'bg-amber-100', type: 'events' },
    { icon: '🏨', label: 'Hotels', color: 'bg-rose-100', type: 'properties', category: 'rent-short' },
    { icon: '🛒', label: 'Shopping', color: 'bg-yellow-100', type: 'services' },
    { icon: '🍽️', label: 'Food', color: 'bg-red-100', type: 'services' },
    { icon: '➕', label: 'More', color: 'bg-gray-100', onClick: () => navigate('/categories') }
  ];

  const getPropertyTypeName = (type) => {
    switch (type) {
      case 'sale': return 'Sale';
      case 'rent-short': return 'Short Term';
      case 'rent-long': return 'Long Term';
      case 'office': return 'Office Space';
      case 'land': return 'Land Plot';
      default: return 'Property';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'sale': return { label: 'For Sale', color: 'bg-blue-100 text-blue-800' };
      case 'rent-short': return { label: 'Short Term', color: 'bg-green-100 text-green-800' };
      case 'rent-long': return { label: 'Long Term', color: 'bg-emerald-100 text-emerald-800' };
      case 'office': return { label: 'Office Space', color: 'bg-purple-100 text-purple-800' };
      case 'land': return { label: 'Land Plot', color: 'bg-amber-100 text-amber-800' };
      default: return { label: 'Property', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Responsive grid classes
  const gridCols = isDesktop ? 'grid-cols-4' : 'grid-cols-4';
  const propertyGridCols = isDesktop ? 'grid-cols-4' : 'grid-cols-2';
  const cardWidth = isDesktop ? 'w-48' : 'w-40';
  const serviceCardWidth = isDesktop ? 'w-72' : 'w-60';
  const eventCardWidth = isDesktop ? 'w-72' : 'w-60';
  const helperCardWidth = isDesktop ? 'w-48' : 'w-40';

  return (
    <div className="min-h-screen bg-white pb-0">
      {/* Main Content */}
      <main className={`${isDesktop ? 'px-6 max-w-7xl mx-auto' : 'px-4'} py-0`}>
        {/* Quick Search Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-blue-500 rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Find your perfect space
                </h2>
                <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">
                  Discover homes, services, and experiences around you
                </p>
                
                {/* Simple feature list */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/80 text-xs md:text-sm">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                    Flexible dates
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Best price
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                    Secure booking
                  </span>
                </div>
              </div>
              
              {/* Simple CTA */}
              <button 
                onClick={() => navigate('/search')}
                className="bg-white text-[#EC5C30] px-6 py-3 rounded-lg font-medium text-sm md:text-base hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
              >
                Explore Now
              </button>
            </div>
          </div>
          
          {/* Subtle background element */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-sm"></div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewedItems.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 text-lg md:text-xl">Recently viewed</h2>
              <button
                onClick={() => navigate('/recently-viewed')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                See all
              </button>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1 scrollbar-hide"
            >
              {recentlyViewedItems.slice(0, isDesktop ? 6 : 5).map((item) => (
                <div 
                  key={`${item._id}-${item.viewedAt}`}
                  className={`flex-shrink-0 ${cardWidth}`}
                  onClick={() => navigate(`/listing/${item._id}`)}
                >
                  <div className="rounded-xl overflow-hidden cursor-pointer shadow-sm  hover:border-gray-300 hover:shadow-md transition-all duration-200">
                    <div className="relative aspect-[3/2]">
                      <img
                        src={item.imageUrls?.[0] || item.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={item.name || item.title}
                        className="w-full h-full object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRecentlyViewedLike && onRecentlyViewedLike(item._id, !item.isLiked);
                          }}
                          className="p-1.5 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm transition-colors"
                        >
                          {item.isLiked ? (
                            <HeartIconSolid className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600 hover:text-rose-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                        {item.name || item.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">
                          R{item.price || item.regularPrice || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.viewedAt ? new Date(item.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section className="mb-8">
          <h2 className="font-bold text-gray-900 text-lg md:text-xl mb-4">Explore categories</h2>
          <div className={`grid ${gridCols} gap-3 md:gap-4`}>
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => {
                  if (cat.onClick) {
                    cat.onClick();
                  } else if (cat.type && cat.category) {
                    navigate(`/search?type=${cat.type}&category=${cat.category}&address=${encodeURIComponent(currentLocation)}`);
                  } else if (cat.type) {
                    navigate(`/search?type=${cat.type}&address=${encodeURIComponent(currentLocation)}`);
                  }
                }}
                className="flex flex-col items-center p-3 md:p-4 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 active:opacity-80 border border-transparent hover:border-gray-200"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.color} rounded-full flex items-center justify-center text-xl md:text-2xl mb-2 hover:scale-105 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-xs md:text-sm text-gray-700 text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-lg md:text-xl">Popular homes</h2>
            <Link 
              to="/listing-home-page"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              See all
            </Link>
          </div>
          {loadingProperties ? (
            <div className={`grid ${propertyGridCols} gap-3 md:gap-4`}>
              {[...Array(isDesktop ? 8 : 4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className={`grid ${propertyGridCols} gap-3 md:gap-4`}>
              {featuredProperties.slice(0, isDesktop ? 8 : 4).map((property) => (
                <div 
                  key={property._id}
                  onClick={() => navigate(`/listing/${property._id}`)}
                  className="rounded-xl overflow-hidden active:opacity-80 cursor-pointer shadow-sm  hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-[3/2]">
                    <img
                      src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={property.name}
                      className="w-full h-full object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeBadge(property.type)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {getPropertyTypeName(property.type)}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like functionality
                        }}
                        className="p-1.5 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm"
                      >
                        <HeartIcon className="w-5 h-5 text-gray-600 hover:text-rose-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base truncate mb-1">{property.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate">{property.address || 'Location not specified'}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        R{property.price || property.regularPrice}
                      </span>
                      <div className="flex items-center">
                        <StarIconSolid className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                        <span className="text-xs md:text-sm text-gray-600 ml-1">{property.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Services Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-lg md:text-xl">Top services</h2>
            <Link 
              to="/service-home-page"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              See all
            </Link>
          </div>
          {loadingServices ? (
            <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 scrollbar-hide">
              {[...Array(isDesktop ? 4 : 3)].map((_, i) => (
                <div key={i} className={`flex-shrink-0 ${serviceCardWidth}`}>
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 scrollbar-hide">
              {featuredServices.slice(0, isDesktop ? 4 : 3).map((service) => (
                <div 
                  key={service._id}
                  onClick={() => navigate(`/service/${service._id}`)}
                  className={`flex-shrink-0 ${serviceCardWidth} rounded-xl overflow-hidden active:opacity-80 cursor-pointer shadow-sm  hover:border-gray-300 hover:shadow-md transition-all duration-200`}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={service.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base truncate mb-1">{service.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{service.description || service.address || 'Service description'}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        R{service.price || service.regularPrice}
                      </span>
                      <div className="flex items-center">
                        <StarIconSolid className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                        <span className="text-xs md:text-sm text-gray-600 ml-1">{service.rating?.toFixed(1) || '4.7'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Events Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-lg md:text-xl">Upcoming events</h2>
            <Link 
              to="/search?type=events"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              See all
            </Link>
          </div>
          {loadingEvents ? (
            <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 scrollbar-hide">
              {[...Array(isDesktop ? 4 : 3)].map((_, i) => (
                <div key={i} className={`flex-shrink-0 ${eventCardWidth}`}>
                  <div className="aspect-[5/3] bg-gray-200 rounded-xl mb-2 animate-pulse"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 scrollbar-hide">
              {featuredEvents.slice(0, isDesktop ? 4 : 3).map((event) => (
                <div 
                  key={event._id}
                  onClick={() => navigate(`/event/${event._id}`)}
                  className={`flex-shrink-0 ${eventCardWidth} rounded-xl overflow-hidden active:opacity-80 cursor-pointer shadow-sm  hover:border-gray-300 hover:shadow-md transition-all duration-200`}
                >
                  <div className="relative aspect-[5/3]">
                    <img
                      src={event.imageUrls?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded">
                        Event
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg ">
                        <CalendarDaysIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-600 mr-1" />
                        <span className="text-xs font-medium text-gray-700">
                          {formatEventDate(event.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base truncate mb-1">{event.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <MapIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500 truncate">{event.address || 'Various locations'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                         R{event.price || event.regularPrice}
                      </span>
                      {event.attendingCount !== undefined && (
                        <div className="flex items-center text-xs text-gray-500">
                          <UserGroupIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span>{event.attendingCount} going</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl ">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm md:text-base">No upcoming events in your area</p>
              <button
                onClick={() => navigate('/search?type=events')}
                className="mt-3 text-sm md:text-base text-rose-500 font-medium hover:text-rose-600"
              >
                Browse all events
              </button>
            </div>
          )}
        </section>

        {/* Helpers Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-lg md:text-xl">Recommended helpers</h2>
            <Link 
              to="/helper-home-page"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              See all
            </Link>
          </div>
          {loadingHelpers ? (
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 -mx-1 px-1 scrollbar-hide">
              {[...Array(isDesktop ? 6 : 3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-full mb-2 mx-auto w-20 h-20"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1 w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 -mx-1 px-1 scrollbar-hide">
              {featuredHelpers.slice(0, isDesktop ? 6 : 4).map((helper) => (
                <div 
                  key={helper._id}
                  onClick={() => navigate(`/helper/${helper._id}`)}
                  className={`flex-shrink-0 ${helperCardWidth} flex flex-col items-center p-4 bg-white rounded-xl shadow-sm active:opacity-80 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200`}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-white shadow-md">
                    <img
                      src={helper.imageUrls?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                      alt={helper.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm md:text-base text-center mb-1 truncate w-full">{helper.name}</h3>
                  <p className="text-xs text-gray-500 text-center mb-2 truncate w-full">{helper.type || 'Service Provider'}</p>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-gray-900 text-sm md:text-base">
                       R{helper.price || helper.regularPrice}
                    </span>
                    <div className="flex items-center">
                      <StarIconSolid className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                      <span className="text-xs md:text-sm text-gray-600 ml-1">{helper.rating?.toFixed(1) || '4.8'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats Section for Desktop */}
        {isDesktop && (
          <section className="mb-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
            <h2 className="font-bold text-gray-900 text-xl mb-6">Local Insights</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.properties || '1,234'}</div>
                <p className="text-gray-600 text-sm">Properties Available</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.services || '456'}</div>
                <p className="text-gray-600 text-sm">Services Offered</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.helpers || '789'}</div>
                <p className="text-gray-600 text-sm">Verified Helpers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">{stats.events || '321'}</div>
                <p className="text-gray-600 text-sm">Upcoming Events</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Add some padding for bottom nav */}
      <div className="h-16"></div>

      {/* Add custom CSS for scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Homepage data states
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredHelpers, setFeaturedHelpers] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingHelpers, setLoadingHelpers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [stats, setStats] = useState({});

  // Recently viewed items state
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('South Africa');

  // Load recently viewed items from localStorage
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const items = JSON.parse(stored);
          setRecentlyViewedItems(items);
        }
      } catch (error) {
        console.error('Failed to load recently viewed items:', error);
      }
    };

    loadRecentlyViewed();
  }, []);

  // Get user's location from URL or use default
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addressFromUrl = urlParams.get('address');
    if (addressFromUrl) {
      setCurrentLocation(decodeURIComponent(addressFromUrl));
    }
  }, [location.search]);

  // Function to add item to recently viewed
  const addToRecentlyViewed = (item, itemType) => {
    try {
      const viewedItem = {
        ...item,
        itemType: itemType,
        viewedAt: new Date().toISOString(),
        isLiked: false
      };

      // Get existing items
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items = stored ? JSON.parse(stored) : [];

      // Remove if already exists (to update timestamp)
      items = items.filter(i => i._id !== item._id || i.itemType !== itemType);
      
      // Add new item to beginning
      items.unshift(viewedItem);
      
      // Keep only MAX_RECENTLY_VIEWED items
      items = items.slice(0, MAX_RECENTLY_VIEWED);
      
      // Save to localStorage
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
      
      // Update state
      setRecentlyViewedItems(items);
      
      // Navigate to item details page
      navigate(`/${itemType}/${item._id}`);
    } catch (error) {
      console.error('Failed to save to recently viewed:', error);
    }
  };

  // Function to update like status
  const updateRecentlyViewedLike = (itemId, isLiked) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.map(item => 
          item._id === itemId ? { ...item, isLiked } : item
        );
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setRecentlyViewedItems(items);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  // Fetch homepage data
  useEffect(() => {
    const fetchHomepageData = async () => {
      // Fetch properties
      setLoadingProperties(true);
      try {
        const propertiesRes = await fetch(`/api/listing/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&address=${encodeURIComponent(currentLocation)}`);
        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          setFeaturedProperties(propertiesData.slice(0, DATA_FETCH_LIMIT));
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        // Mock data for demo
        setFeaturedProperties([
          { _id: '1', name: 'Modern Apartment in City Center', price: 2500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5, address: 'Johannesburg' },
          { _id: '2', name: 'Luxury Villa with Pool', price: 8500, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Cape Town' },
          { _id: '3', name: 'Cozy Studio near University', price: 1200, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.3, address: 'Pretoria' },
          { _id: '4', name: 'Modern Office Space', price: 500, type: 'office', imageUrls: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6, address: 'Sandton' },
          { _id: '5', name: 'Family House in Suburbs', price: 3500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7, address: 'Durban' },
          { _id: '6', name: 'Vacation Beach House', price: 1800, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9, address: 'Port Elizabeth' },
          { _id: '7', name: 'Commercial Land Plot', price: 250000, type: 'land', imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.4, address: 'Bloemfontein' },
          { _id: '8', name: 'Penthouse with View', price: 12000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Johannesburg' }
        ]);
      } finally {
        setLoadingProperties(false);
      }

      // Fetch services
      setLoadingServices(true);
      try {
        const servicesRes = await fetch(`/api/service/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&location=${encodeURIComponent(currentLocation)}`);
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setFeaturedServices(servicesData.slice(0, DATA_FETCH_LIMIT));
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Mock data for demo
        setFeaturedServices([
          { _id: '1', name: 'Professional Cleaning Service', price: 200, description: 'Deep cleaning service for your home or office', imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7 },
          { _id: '2', name: 'Moving & Relocation Assistance', price: 350, description: 'Help with packing and moving to your new home', imageUrls: ['https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8 },
          { _id: '3', name: 'Landscaping & Garden Design', price: 450, description: 'Garden maintenance and landscape design services', imageUrls: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6 },
          { _id: '4', name: 'Home Repair & Maintenance', price: 300, description: 'Professional home repair and maintenance services', imageUrls: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9 },
          { _id: '5', name: 'Car Wash & Detailing', price: 150, description: 'Professional car washing and detailing services', imageUrls: ['https://images.unsplash.com/photo-1565689221354-d87f85d4aee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5 }
        ]);
      } finally {
        setLoadingServices(false);
      }

      // Fetch helpers
      setLoadingHelpers(true);
      try {
        const helpersRes = await fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&address=${encodeURIComponent(currentLocation)}`);
        if (helpersRes.ok) {
          const helpersData = await helpersRes.json();
          setFeaturedHelpers(helpersData.slice(0, DATA_FETCH_LIMIT));
        }
      } catch (error) {
        console.error('Failed to fetch helpers:', error);
        // Mock data for demo
        setFeaturedHelpers([
          { _id: '1', name: 'John Doe', type: 'Math Tutor', rating: 4.8, price: 120, imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
          { _id: '2', name: 'Jane Smith', type: 'Elderly Caregiver', rating: 4.9, price: 150, imageUrls: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
          { _id: '3', name: 'Mike Johnson', type: 'Certified Handyman', rating: 4.7, price: 200, imageUrls: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
          { _id: '4', name: 'Sarah Wilson', type: 'Professional Cleaner', rating: 4.6, price: 180, imageUrls: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
          { _id: '5', name: 'David Brown', type: 'IT Support Specialist', rating: 4.8, price: 250, imageUrls: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
          { _id: '6', name: 'Emily Davis', type: 'Personal Trainer', rating: 4.9, price: 300, imageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] }
        ]);
      } finally {
        setLoadingHelpers(false);
      }

      // Fetch events
      setLoadingEvents(true);
      try {
        const eventsRes = await fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc&location=${encodeURIComponent(currentLocation)}`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setFeaturedEvents(eventsData.slice(0, DATA_FETCH_LIMIT));
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Mock data for demo
        setFeaturedEvents([
          { _id: '1', name: 'Local Music Festival 2024', price: 50, date: '2024-03-15', address: 'City Park, Johannesburg', attendingCount: 120, imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
          { _id: '2', name: 'Art & Craft Workshop', price: 30, date: '2024-03-20', address: 'Art Center, Cape Town', attendingCount: 45, imageUrls: ['https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
          { _id: '3', name: 'Food & Wine Tasting Experience', price: 75, date: '2024-03-25', address: 'Downtown Square, Durban', attendingCount: 89, imageUrls: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
          { _id: '4', name: 'Tech Startup Conference', price: 100, date: '2024-04-05', address: 'Convention Center, Pretoria', attendingCount: 210, imageUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] }
        ]);
      } finally {
        setLoadingEvents(false);
      }

      // Set mock stats
      setStats({
        properties: 1234,
        services: 456,
        helpers: 789,
        events: 321
      });
    };

    fetchHomepageData();
  }, [currentLocation]);

  return (
    <MobileAppHomepage
      featuredProperties={featuredProperties}
      featuredServices={featuredServices}
      featuredHelpers={featuredHelpers}
      featuredEvents={featuredEvents}
      loadingProperties={loadingProperties}
      loadingServices={loadingServices}
      loadingHelpers={loadingHelpers}
      loadingEvents={loadingEvents}
      stats={stats}
      onItemClick={addToRecentlyViewed}
      recentlyViewedItems={recentlyViewedItems}
      onRecentlyViewedLike={updateRecentlyViewedLike}
      currentLocation={currentLocation}
      navigate={navigate}
    />
  );
};

export default Home;