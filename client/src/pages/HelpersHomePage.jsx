// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import HelperItem from '../components/HelperItem';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { 
  MapPin, 
  ChevronRight,
  Home,
  Search,
  Filter,
  Star,
  TrendingUp,
  Sparkles,
  Users,
  Clock,
  DollarSign,
  Grid,
  List,
  SlidersHorizontal,
  CheckCircle,
  Shield,
  Award
} from 'lucide-react';
import "../styles/List.scss";

const categories = [
  { id: 'all', label: 'All Services', icon: <Users size={20} />, color: 'bg-gradient-to-r from-rose-500 to-pink-500' },
  { id: 'domestic', label: 'Cleaning', icon: '🧹', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { id: 'tutor', label: 'Tutoring', icon: '📚', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { id: 'chef', label: 'Cooking', icon: '👨‍🍳', color: 'bg-gradient-to-r from-purple-500 to-violet-500' },
  { id: 'handyman', label: 'Repairs', icon: '🔧', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
  { id: 'beauty', label: 'Beauty', icon: '💄', color: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
  { id: 'tattoo', label: 'Tattoo', icon: '🖋️', color: 'bg-gradient-to-r from-rose-500 to-pink-500' },
  { id: 'barber', label: 'Haircuts', icon: '✂️', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { id: 'errand', label: 'Errands', icon: '🛍️', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
];

const HelpersHomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('featured');

  // Filter helpers based on search
  const filteredHelpers = useMemo(() => {
    if (!helpers.length) return [];
    
    let categoryHelpers = activeTab === 'all' 
      ? helpers 
      : helpers.filter(helper => helper.type === activeTab);
    
    // Apply search filter
    if (searchQuery.trim()) {
      categoryHelpers = categoryHelpers.filter(helper => 
        helper.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        helper.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        helper.skills?.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        helper.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    return [...categoryHelpers].sort((a, b) => {
      switch(sortBy) {
        case 'price-low':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case 'price-high':
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        default: // 'featured'
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [helpers, activeTab, searchQuery, sortBy]);

  // Categorize helpers
  const categorizedHelpers = useMemo(() => {
    const result = {
      domestic: [],
      tutor: [],
      chef: [],
      handyman: [],
      beauty: [],
      tattoo: [],
      barber: [],
      errand: [],
      all: []
    };
    
    if (!helpers.length) return result;
    
    helpers.forEach(helper => {
      if (helper.type && result[helper.type]) {
        result[helper.type].push(helper);
      }
      result.all.push(helper);
    });
    
    return result;
  }, [helpers]);

  // Fetch helpers data from backend
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/helper/get');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch helpers: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setHelpers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load helpers. Please try again later.');
        setLoading(false);
      }
    };

    fetchHelpers();
  }, []);

  const handleItemNavigation = (item) => {
    console.log('Navigating to helper:', item.name);
    // navigate(`/helper/${item._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-xl font-semibold text-gray-800 mb-2">Discovering Amazing Helpers</div>
          <div className="text-gray-500">Loading professionals from around the world...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-blue-500 text-4xl">👨‍💼</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium hover:scale-[1.02]"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Over 5,000+ verified professionals worldwide
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Your Perfect Helper
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Professional services delivered with care. From home maintenance to personal assistance.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 flex items-center px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search by service, location, or skill..."
                    className="flex-1 text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-8 relative z-20">
        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Service</h2>
              <p className="text-gray-600">Find professionals that match your specific needs</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:shadow-md transition-shadow font-medium"
              >
                <MapPin className="h-4 w-4" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 ${
                  activeTab === category.id
                    ? 'border-gray-900 bg-gray-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`${category.color} p-4 rounded-full text-white mb-4 shadow-md flex items-center justify-center`}>
                  {typeof category.icon === 'string' ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    React.cloneElement(category.icon, { className: 'h-6 w-6' })
                  )}
                </div>
                <span className="font-semibold text-gray-900 mb-1">{category.label}</span>
                <span className="text-sm text-gray-500">
                  {categorizedHelpers[category.id]?.length || 0} professionals
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white rounded-xl p-4 shadow-sm">
          <div className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">
            {activeTab === 'all' ? 'All Professionals' : categories.find(c => c.id === activeTab)?.label}
            <span className="text-gray-500 font-normal ml-2">
              ({filteredHelpers.length} results)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>

        <div className={`${showMap ? 'lg:flex lg:gap-8' : ''}`}>
          {/* Helpers Content */}
          <div className={`${showMap ? 'lg:w-2/3' : 'w-full'}`}>
            {activeTab === 'all' ? (
              // Show all categories in sections
              <>
                {categories
                  .filter(cat => cat.id !== 'all')
                  .map(category => {
                    const categoryHelpers = categorizedHelpers[category.id];
                    if (!categoryHelpers || categoryHelpers.length === 0) return null;
                    
                    return (
                      <div key={category.id} className="mb-16">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`${category.color} w-3 h-8 rounded-full`}></div>
                              <h3 className="text-2xl font-bold text-gray-900">{category.label}</h3>
                            </div>
                            <p className="text-gray-600 ml-6">
                              Curated selection of premium {category.label.toLowerCase()} professionals
                            </p>
                          </div>
                          <button 
                            onClick={() => setActiveTab(category.id)} 
                            className="flex items-center gap-2 text-gray-900 font-semibold hover:text-blue-500 transition-colors "
                          >
                            View all
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                        
                        <Swiper
                          slidesPerView={1.2}
                          spaceBetween={20}
                          modules={[Navigation]}
                          navigation={{
                            nextEl: '.swiper-button-next-' + category.id,
                            prevEl: '.swiper-button-prev-' + category.id,
                          }}
                          className="relative"
                          breakpoints={{
                            640: { slidesPerView: 1.5, spaceBetween: 20 },
                            768: { slidesPerView: 2.2, spaceBetween: 24 },
                            1024: { slidesPerView: 3.2, spaceBetween: 28 },
                            1280: { slidesPerView: 4.2, spaceBetween: 32 },
                          }}
                        >
                          {categoryHelpers
                            .slice(0, 12)
                            .map((item) => (
                              <SwiperSlide key={item._id} className="!h-auto">
                                <HelperItem
                                  helper={item}
                                  onClick={() => handleItemNavigation(item)}
                                  viewMode={viewMode}
                                />
                              </SwiperSlide>
                            ))}
                          <div className={`swiper-button-prev-${category.id} absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors`}>
                            <ChevronRight className="h-5 w-5 rotate-180" />
                          </div>
                          <div className={`swiper-button-next-${category.id} absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors`}>
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </Swiper>
                      </div>
                    );
                  })}
              </>
            ) : (
              // Show specific category
              <div>
                <div className={`${viewMode === 'list' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                  {filteredHelpers.map((item) => (
                    <HelperItem
                      key={item._id}
                      helper={item}
                      onClick={() => handleItemNavigation(item)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {filteredHelpers.length === 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No professionals found
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchQuery 
                        ? `We couldn't find any professionals matching "${searchQuery}". Try adjusting your search criteria.`
                        : `No professionals available in this category. Check back soon or explore other categories.`
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                        >
                          Clear Search
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab('all')}
                        className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Browse All Professionals
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Sidebar */}
          {showMap && (
            <div className="lg:w-1/3 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Map</h3>
                  <p className="text-gray-600">Explore professionals in your area</p>
                </div>
                <div className="h-[calc(100%-100px)] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                      <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                      <div className="text-2xl font-bold text-gray-900 mb-2">Map View</div>
                      <div className="text-gray-600 mb-6">Interactive helper map coming soon</div>
                      <button 
                        onClick={() => setShowMap(false)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                      >
                        Close Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 mb-6 relative overflow-hidden mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-gray-100">Verified Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-gray-100">Service Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-gray-100">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-gray-100">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Professionals</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every helper is verified, experienced, and committed to delivering exceptional service
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Verified & Vetted</h3>
            <p className="text-gray-600 text-center">
              All professionals undergo background checks and verification to ensure your safety and satisfaction.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Quality Guaranteed</h3>
            <p className="text-gray-600 text-center">
              We guarantee the quality of every service. If you're not satisfied, we'll make it right.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Top Rated</h3>
            <p className="text-gray-600 text-center">
              Our professionals maintain an average 4.8+ star rating from thousands of satisfied customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpersHomePage;