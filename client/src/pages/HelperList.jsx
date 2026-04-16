// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart,
  FaUser, FaClock, FaDog, FaUsers, FaGraduationCap, FaCut, FaTools, FaCar, FaShieldAlt
} from 'react-icons/fa';
import NeuralLoader from '../components/NeuralLoader';

export default function HelperDetails() {
  const { type } = useParams();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Helper type labels
  const typeLabels = {
    domestic: 'Domestic Helpers',
    errand: 'Errand Runners',
    tutor: 'Tutors',
    chef: 'Chefs',
    beauty: 'Beauty Specialists',
    tattoo: 'Tattoo Artists',
    barber: 'Barbers'
  };

  // Simulate fetching helpers from API
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call: 
        // const res = await fetch(`/api/helpers?type=${type}`);
        // const data = await res.json();

        // Simulated data based on type
        const simulatedData = Array(12).fill().map((_, i) => ({
          _id: `${type}-${i + 1}`,
          name: `${typeLabels[type]} ${i + 1}`,
          type,
          rating: (Math.random() * 4 + 1).toFixed(1),
          reviews: Math.floor(Math.random() * 100),
          address: `Location ${i + 1}, Cape Town`,
          regularPrice: Math.floor(Math.random() * 300) + 100,
          description: `Professional ${typeLabels[type].toLowerCase()} with ${i + 3} years of experience`,
          imageUrls: Array(4).fill().map((_, imgIndex) =>
            `https://source.unsplash.com/random/400x300/?${type},${i},${imgIndex}`
          ),
          host: `Host ${i + 1}`,
          period: i % 2 === 0 ? 'Weekdays' : 'Flexible',
          pets: i % 3 === 0,
          security: i % 4 === 0,
        }));

        // Set data with delay to simulate network request
        setTimeout(() => {
          setHelpers(simulatedData);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load helpers');
        setLoading(false);
      }
    };

    if (type && Object.keys(typeLabels).includes(type)) {
      fetchHelpers();
    } else {
      setError('Invalid helper type');
      setLoading(false);
    }
  }, [type]);

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Type-specific icons
  const getTypeIcon = () => {
    switch (type) {
      case 'tutor': return <FaGraduationCap className="mr-2" />;
      case 'chef': return <FaUsers className="mr-2" />;
      case 'beauty': return <FaCut className="mr-2" />;
      case 'tattoo': return <FaTools className="mr-2" />;
      case 'barber': return <FaCar className="mr-2" />;
      default: return <FaUser className="mr-2" />;
    }
  };

  if (loading) {
    return <NeuralLoader fullScreen text={`Loading ${typeLabels[type]}...`} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg inline-block">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {getTypeIcon()}
          {typeLabels[type]}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover top-rated professionals ready to assist you with your needs
        </p>
      </div>

      {/* Helpers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {helpers.map((helper) => (
          <div
            key={helper._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            {/* Image Gallery with Navigation */}
            <div className="relative h-64">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
                className="h-full w-full"
              >
                {helper.imageUrls.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={img}
                      alt={`${helper.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(helper._id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                aria-label="Save to favorites"
              >
                {favorites[helper._id] ? (
                  <FaHeart className="text-red-500 text-xl" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-xl" />
                )}
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 z-10 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
                {activeSlideIndex + 1}/{helper.imageUrls.length}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{helper.name}</h2>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{helper.description}</p>
                </div>

                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium">{helper.rating}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-gray-500 text-sm">{helper.reviews} reviews</span>
                </div>
              </div>

              <div className="flex items-center mt-3 text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span className="text-sm truncate">{helper.address}</span>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-airbnb-red">R{helper.regularPrice}</span>
                  <span className="text-gray-600"> / service</span>
                </div>

                <Link
                  to={`/helper/${helper._id}`}
                  className="px-4 py-2 bg-airbnb-red hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>

              {/* Helper-specific badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {helper.security && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                    <FaShieldAlt className="mr-1" /> Verified
                  </span>
                )}

                {helper.pets && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                    <FaDog className="mr-1" /> Pets OK
                  </span>
                )}

                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                  <FaClock className="mr-1" /> {helper.period}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {helpers.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
            <FaUser className="text-gray-400 text-2xl" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No helpers found</h3>
          <p className="mt-1 text-gray-500">
            We couldnt find any {typeLabels[type].toLowerCase()} matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}