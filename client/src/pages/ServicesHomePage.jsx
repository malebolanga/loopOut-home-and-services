// src/pages/ServicesHomePage.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ServiceItem from '../components/ServiceItem';
import 'swiper/css';
import 'swiper/css/navigation';
import "../styles/List.scss";

const categories = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { id: 'maintenance', label: 'Maintenance', emoji: '🔧' },
  { id: 'moving', label: 'Moving', emoji: '🚚' },
  { id: 'landscaping', label: 'Garden', emoji: '🌿' },
  { id: 'catering', label: 'Catering', emoji: '🍽️' },
  { id: 'daycare', label: 'Daycare', emoji: '👶' },
  { id: 'schoolTransport', label: 'Transport', emoji: '🚌' },
  { id: 'other', label: 'Other', emoji: '✨' },
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
        <div className="text-xl font-semibold text-gray-600">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Category Filter */}
        <div className="flex overflow-x-auto gap-4 py-4 mb-8 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl whitespace-nowrap ${
                activeTab === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 shadow-sm hover:bg-gray-100'
              } transition-colors duration-200 min-w-[80px]`}
              onClick={() => setActiveTab(category.id)}
            >
              <span className="text-2xl mb-1">{category.emoji}</span>
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Display services by category */}
        {activeTab === 'all' ? (
          // Show all categories if "All" is selected
          <>
            {categories.filter(cat => cat.id !== 'all').map(category => {
              const categoryServices = categorizedServices[category.id];
              if (!categoryServices || categoryServices.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-16">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                      <span className="mr-2 text-2xl">{category.emoji}</span>
                      {category.label}
                    </h3>
                    <button 
                      onClick={() => setActiveTab(category.id)} 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View All 
                    </button>
                  </div>
                  <Swiper
                    slidesPerView={1.3}
                    spaceBetween={16}
                    modules={[Navigation]}
                    navigation
                    className="mySwiper"
                    breakpoints={{
                      640: { slidesPerView: 2.3, spaceBetween: 20 },
                      768: { slidesPerView: 3.3, spaceBetween: 24 },
                      1024: { slidesPerView: 4.3, spaceBetween: 28 },
                      1280: { slidesPerView: 5.3, spaceBetween: 32 },
                    }}
                  >
                    {categoryServices
                      .slice(0, 10)
                      .map((item) => (
                        <SwiperSlide key={item._id} className="!h-auto">
                          <ServiceItem
                            service={item}
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
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2 text-2xl">
                  {categories.find(c => c.id === activeTab)?.emoji || '🌟'}
                </span>
                {categories.find(c => c.id === activeTab)?.label || 'Services'}
              </h3>
            </div>
            
            {categorizedServices[activeTab] && categorizedServices[activeTab].length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categorizedServices[activeTab].map((item) => (
                  <ServiceItem
                    key={item._id}
                    service={item}
                    onClick={() => handleItemNavigation(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="text-gray-500 text-lg mb-4">
                  No services found in this category
                </div>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Browse All Categories
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesHomePage;