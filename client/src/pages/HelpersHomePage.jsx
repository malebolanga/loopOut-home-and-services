// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import HelperItem from '../components/HelperItem';
import 'swiper/css';
import 'swiper/css/navigation';
import "../styles/List.scss";

const categories = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'domestic', label: 'Maid', emoji: '🧹' },
  { id: 'tutor', label: 'Tutor', emoji: '📚' },
  { id: 'chef', label: 'Chef', emoji: '👨‍🍳' },
  { id: 'handyman', label: 'Handyman', emoji: '🔧' },
  { id: 'beauty', label: 'Beauty', emoji: '💄' },
  { id: 'tattoo', label: 'Tattoo', emoji: '🖋️' },
  { id: 'barber', label: 'Barber', emoji: '✂️' },
  { id: 'errand', label: 'Errands', emoji: '🛍️' },
];

const HelpersHomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categorize helpers based on type
  const categorizedListings = useMemo(() => {
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
      if (helper.type) {
        // Add to specific category
        if (result[helper.type]) {
          result[helper.type].push(helper);
        }
        // Add to "all" category
        result.all.push(helper);
      }
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
    // Navigate to helper detail page
    console.log('Navigating to helper:', item.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading helpers...</div>
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
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-full whitespace-nowrap ${
                activeTab === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 shadow-sm hover:bg-gray-100'
              } transition-colors duration-200 min-w-[80px]`}
              onClick={() => setActiveTab(category.id)}
            >
              <span className="text-2xl mb-1">{category.emoji}</span>
              <span className="text-xs font-medium">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Display helpers by category */}
        {activeTab === 'all' ? (
          // Show all categories if "All" is selected
          <>
            {categories.filter(cat => cat.id !== 'all').map(category => {
              const categoryHelpers = categorizedListings[category.id];
              if (!categoryHelpers || categoryHelpers.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-16">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                      <span className="mr-2 text-2xl">{category.emoji}</span>
                      {category.label} Services
                    </h3>
                    <button 
                      onClick={() => setActiveTab(category.id)} 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View All 
                    </button>
                  </div>
                  <Swiper
                    slidesPerView={1.8}
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
                    {categoryHelpers
                      .slice(0, 10)
                      .map((item) => (
                        <SwiperSlide key={item._id} className="!h-auto">
                          <HelperItem
                            helper={item}
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
                  {categories.find(c => c.id === activeTab)?.emoji || '👤'}
                </span>
                {categories.find(c => c.id === activeTab)?.label || 'Helpers'} Services
              </h3>
            </div>
            
            {categorizedListings[activeTab] && categorizedListings[activeTab].length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {categorizedListings[activeTab].map((item) => (
                  <HelperItem
                    key={item._id}
                    helper={item}
                    onClick={() => handleItemNavigation(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="text-gray-500 text-lg mb-4">
                  No helpers found in this category
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

export default HelpersHomePage;