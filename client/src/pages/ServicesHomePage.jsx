// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ServiceItem from '../components/ServiceItem';
import 'swiper/css';
import 'swiper/css/navigation';
import "../styles/List.scss";

// Airbnb-style categories with descriptive labels
const categories = [
  { id: 'all', label: 'All Services', icon: '🏠' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'maintenance', label: 'Repairs', icon: '🔧' },
  { id: 'moving', label: 'Moving', icon: '🚚' },
  { id: 'landscaping', label: 'Garden Care', icon: '🌿' },
  { id: 'catering', label: 'Catering', icon: '🍽️' },
  { id: 'daycare', label: 'Childcare', icon: '👶' },
  { id: 'schoolTransport', label: 'Transport', icon: '🚌' },
  { id: 'other', label: 'Other', icon: '✨' },
];

const ServicesHomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categorize services based on type
  const categorizedServices = useMemo(() => {
    const result = {
      cleaning: [],
      maintenance: [],
      moving: [],
      landscaping: [],
      catering: [],
      daycare: [],
      schoolTransport: [],
      other: [],
      all: []
    };
    
    if (!services.length) return result;
    
    services.forEach(service => {
      if (service.type) {
        // Add to specific category
        if (result[service.type]) {
          result[service.type].push(service);
        } else {
          // If type doesn't match any category, add to "other"
          result.other.push(service);
        }
        // Add to "all" category
        result.all.push(service);
      }
    });
    
    return result;
  }, [services]);

  // Fetch services data from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/service/get');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }
        
        const data = await response.json();
        setServices(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load services. Please try again later.');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleItemNavigation = (item) => {
    // Navigate to service detail page
    console.log('Navigating to service:', item.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-airbnb-pink rounded-full animate-spin mb-4"></div>
          <div className="text-lg font-medium text-gray-600">Discovering amazing services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-airbnb-pink text-white font-medium rounded-lg hover:bg-airbnb-pink-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Airbnb-style Header Section */}
      <div className="relative bg-gradient-to-r from-blue-50 to-green-50 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book professional services for your home
            </h1>
            <p className="text-lg text-gray-600">
              From cleaning to childcare, find trusted service providers in your neighborhood
            </p>
          </div>

          {/* Category Filter - Airbnb Style */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 px-2">
              Browse by category
            </h2>
            <div className="flex overflow-x-auto gap-3 pb-4 px-2 no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-[100px] border-2 ${
                    activeTab === category.id
                      ? 'border-gray-900 bg-white shadow-lg transform scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <span className="text-3xl mb-3">{category.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'all' ? (
          // Show all categories if "All" is selected - Airbnb card layout
          <>
            {categories.filter(cat => cat.id !== 'all').map(category => {
              const categoryServices = categorizedServices[category.id];
              if (!categoryServices || categoryServices.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-16">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                        {category.label}
                      </h3>
                      <p className="text-gray-500">
                        Professional {category.label.toLowerCase()} services
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab(category.id)} 
                      className="px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      See all →
                    </button>
                  </div>
                  
                  {/* Horizontal Scrolling Cards */}
                  <div className="relative">
                    <Swiper
                      slidesPerView={1.8}
                      spaceBetween={16}
                      modules={[Navigation]}
                      navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                      }}
                      className="mySwiper"
                      breakpoints={{
                        640: { slidesPerView: 2.2, spaceBetween: 20 },
                        768: { slidesPerView: 3.2, spaceBetween: 24 },
                        1024: { slidesPerView: 4.2, spaceBetween: 28 },
                        1280: { slidesPerView: 5.2, spaceBetween: 32 },
                      }}
                    >
                      {categoryServices
                        .slice(0, 10)
                        .map((item) => (
                          <SwiperSlide key={item._id} className="!h-auto">
                            <div className="h-full">
                              <ServiceItem
                                service={item}
                                onClick={() => handleItemNavigation(item)}
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                    </Swiper>
                    
                    {/* Custom Navigation Buttons */}
                    <div className="swiper-button-prev !hidden md:!flex !w-12 !h-12 !bg-white !rounded-full !shadow-lg !top-1/2 !-left-6 !mt-[-24px] after:!text-gray-700 after:!text-xl"></div>
                    <div className="swiper-button-next !hidden md:!flex !w-12 !h-12 !bg-white !rounded-full !shadow-lg !top-1/2 !-right-6 !mt-[-24px] after:!text-gray-700 after:!text-xl"></div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          // Show specific category - Airbnb grid layout
          <div>
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{categories.find(c => c.id === activeTab)?.icon || '✨'}</div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">
                    {categories.find(c => c.id === activeTab)?.label || 'Services'}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {categorizedServices[activeTab]?.length || 0} services available
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  ← Back to all services
                </button>
                <div className="flex gap-4">
                  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                    Sort by: Recommended
                  </button>
                  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                    Filters
                  </button>
                </div>
              </div>
            </div>
            
            {categorizedServices[activeTab] && categorizedServices[activeTab].length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {categorizedServices[activeTab].map((item) => (
                  <ServiceItem
                    key={item._id}
                    service={item}
                    onClick={() => handleItemNavigation(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  No services found in this category
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any {categories.find(c => c.id === activeTab)?.label.toLowerCase() || ''} services in your area. Try browsing other categories.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-6 py-3 bg-airbnb-pink text-white font-medium rounded-lg hover:bg-airbnb-pink-dark transition-colors"
                  >
                    Explore All Categories
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Refresh Results
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Airbnb-style Footer Section */}
      <div className="bg-gray-50 mt-16 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Need help finding the right service?
            </h3>
            <p className="text-gray-600 mb-8">
              Our team can help you find the perfect service provider for your specific needs.
            </p>
            <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors">
              Get Personalized Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesHomePage;