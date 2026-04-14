import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EventItem from '../components/EventItem';
import { 
  Search,
  SlidersHorizontal,
  Map,
  List as ListIcon,
  MapPin
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: '📅' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'food', label: 'Food', icon: '🍴' },
];

const EventsHomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Fetch events data from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/event/get');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    
    let categoryEvents = activeTab === 'all' 
      ? events 
      : events.filter(event => event.type === activeTab);
    
    // Apply search filter
    if (searchQuery.trim()) {
      categoryEvents = categoryEvents.filter(event => 
        event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    return [...categoryEvents].sort((a, b) => {
      switch(sortBy) {
        case 'price-low':
          return (a.regularPrice || 0) - (b.regularPrice || 0);
        case 'price-high':
          return (b.regularPrice || 0) - (a.regularPrice || 0);
        case 'date':
          return new Date(a.date || 0) - new Date(b.date || 0);
        default: // 'featured'
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [events, activeTab, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <div className="text-lg font-semibold text-gray-900">Finding upcoming events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-rose-500 text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Sticky Header with Categories and Search */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
         {/* Top section: Search & Filters */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search Pill */}
            
              <div className="hidden md:flex items-center gap-3">
                 {/* Sort Select */}
                 <div className="flex items-center border border-gray-300 rounded-full px-1 py-1 pr-3 hover:shadow-md transition-shadow">
                    <div className="bg-gray-100 p-2 rounded-full mr-2">
                       <SlidersHorizontal className="h-4 w-4 text-gray-700" />
                    </div>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Featured First</option>
                      <option value="date">Upcoming Dates</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                 </div>
              </div>
            </div>
         </div>
         
         {/* Categories Scrollable Bar */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8 overflow-x-auto pt-2 pb-1 scrollbar-hide">
               {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex flex-col items-center gap-2 min-w-[56px] pb-3 border-b-2 transition-colors duration-200 ${
                       activeTab === category.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                     <span className={`text-2xl transition-all ${activeTab === category.id ? 'opacity-100' : 'opacity-60 filter grayscale'}`}>{category.icon}</span>
                     <span className={`text-xs font-semibold whitespace-nowrap ${activeTab === category.id ? 'text-gray-900' : 'text-gray-500'}`}>{category.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="flex justify-between items-center mb-6 md:hidden">
            {/* Mobile Filters and Sort */}
            <div className="flex items-center border border-gray-300 rounded-full px-2 py-1 pr-3 shadow-sm">
               <div className="bg-gray-100 p-1.5 rounded-full mr-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-gray-700" />
               </div>
               <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
               >
                  <option value="featured">Featured</option>
                  <option value="date">Upcoming</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
               </select>
            </div>
         </div>
         
         {/* Show Map Toggle Floating Button (Airbnb style) */}
         <button 
           onClick={() => setShowMap(!showMap)}
           className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-full px-5 py-3.5 flex items-center gap-2 shadow-xl hover:scale-105 transition-transform font-semibold text-sm"
         >
           {showMap ? (
             <><span>Show list</span> <ListIcon className="w-4 h-4" /></>
           ) : (
             <><span>Show map</span> <Map className="w-4 h-4" /></>
           )}
         </button>

         <div className={`flex flex-col lg:flex-row gap-8`}>
            {/* Grid */}
            <div className={`${showMap ? 'lg:w-[60%] xl:w-[65%]' : 'w-full'}`}>
               {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                     </div>
                     <h2 className="text-xl font-semibold text-gray-900 mb-2">No exact matches</h2>
                     <p className="text-gray-500 max-w-sm mb-6">Try changing or removing some of your filters or adjusting your search area.</p>
                     <button onClick={() => { setActiveTab('all'); setSearchQuery(''); }} className="px-6 py-2.5 border border-gray-900 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors">Remove all filters</button>
                  </div>
               ) : (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${showMap ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-6`}>
                     {filteredEvents.map(event => (
                        <EventItem key={event._id} event={event} />
                     ))}
                  </div>
               )}
            </div>
            
            {/* Map Area */}
            {showMap && (
               <div className="hidden lg:block lg:w-[40%] xl:w-[35%] h-[calc(100vh-220px)] sticky top-[190px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                     <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                     <p className="font-semibold text-gray-900">Map integration available soon</p>
                  </div>
               </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default EventsHomePage;