// Services.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStar,  FaMapMarkerAlt, FaPhone, FaWhatsapp,
  FaArrowLeft, FaCalendarAlt, FaClock, FaExclamationTriangle,
  FaTools, FaShieldAlt, FaClipboardCheck, FaTruck, FaRegClock,
  FaMoneyBillWave, FaUser, FaExternalLinkAlt, FaChild, FaArrowDown,
  FaCar, FaUserFriends, FaBaby, FaUtensils, FaCarSide, FaBus, FaChevronDown, FaArrowUp,
  FaBroom, FaRobot,FaBriefcase,FaEnvelope
} from 'react-icons/fa';
import CommentsSidePanelService from '../components/CommentsSidePanelService';
import Comment from '../components/Comment';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';

const ServicePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    message: '',
    workshopService: false
  });
  const [uiState, setUiState] = useState({
    loading: true,
    error: null,
    submitting: false,
  });
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [ setAnalyzingComments] = useState(false);
  const [ setCommentAnalysis] = useState({});

  // AI Review for Comments
  const [aiRating] = useState({
    average: 4.7,
    categoryRatings: {
      cleanliness: 4.8,
      staff: 4.6,
    }
  });

  // AI Assessment States
  const [aiAssessment, setAiAssessment] = useState({
    descriptionQuality: null,
    imageQuality: null,
    overallRating: null,
    likes: 0,
    dislikes: 0,
    userReaction: null
  });

  // Rating categories
  const RATING_CATEGORIES = [
    { name: 'cleanliness', label: 'Cleanliness', icon: FaBroom },
    { name: 'staff', label: 'Staff', icon: FaUserFriends },
  ];

  // Format contact for WhatsApp
  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const contactStr = String(contact);
    const digitsOnly = contactStr.replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) {
      return '27' + digitsOnly.substring(1);
    }
    return digitsOnly;
  };

  // Generate Google Maps link
  const generateMapLink = (address) => {
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Simulate AI analysis of comments
  const analyzeCommentsWithAI = () => {
    setAnalyzingComments(true);

    // Simulate API call to AI service
    setTimeout(() => {
      const analysis = {};
      const comments = document.querySelectorAll('.comment-item');

      comments.forEach((_, index) => {
        const qualityScore = Math.floor(Math.random() * 40) + 60; // 60-100%
        const sentiment = qualityScore > 80 ? 'positive' :
          qualityScore > 60 ? 'neutral' : 'negative';

        analysis[index] = { qualityScore, sentiment };
      });

      setCommentAnalysis(analysis);
      setAnalyzingComments(false);
    }, 2000);
  };

  const handleLike = () => {
    setAiAssessment(prev => ({
      ...prev,
      likes: prev.userReaction === 'like' ? prev.likes - 1 :
        prev.userReaction === 'dislike' ? prev.likes + 1 : prev.likes + 1,
      dislikes: prev.userReaction === 'dislike' ? prev.dislikes - 1 : prev.dislikes,
      userReaction: prev.userReaction === 'like' ? null : 'like'
    }));
  };

  const handleDislike = () => {
    setAiAssessment(prev => ({
      ...prev,
      dislikes: prev.userReaction === 'dislike' ? prev.dislikes - 1 :
        prev.userReaction === 'like' ? prev.dislikes + 1 : prev.dislikes + 1,
      likes: prev.userReaction === 'like' ? prev.likes - 1 : prev.likes,
      userReaction: prev.userReaction === 'dislike' ? null : 'dislike'
    }));
  };

  // Handle booking submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!service?.contact) {
      alert("Service contact information is missing. Please try another contact method.");
      return;
    }
    
    const userPhone = formatContactForWhatsApp(bookingData.phone);
    
    const acceptText = `I accept your booking for ${bookingData.date} at ${bookingData.time}`;
    const declineText = `I decline your booking for ${bookingData.date} at ${bookingData.time}`;
    
    const acceptLink = `https://wa.me/${userPhone}?text=${encodeURIComponent(acceptText)}`;
    const declineLink = `https://wa.me/${userPhone}?text=${encodeURIComponent(declineText)}`;
    
    let message = `New Booking Request for *${service.name}*%0A%0A`;
    message += `*Your Name:* ${bookingData.name}%0A`;
    message += `*Phone:* ${bookingData.phone}%0A`;
    
    if (service.type === 'maintenance' && bookingData.workshopService) {
      message += `*Service Type:* Customer coming to workshop%0A`;
    } else if (bookingData.address) {
      const mapLink = generateMapLink(bookingData.address);
      message += `*Address:* ${bookingData.address} (View on [Map](${mapLink}))%0A`;
    }
    
    message += `*Date:* ${bookingData.date}%0A`;
    
    if (service.type !== 'daycare') {
      message += `*Time:* ${bookingData.time}%0A`;
    }
    
    const detailsLabel = service.type === 'daycare' 
      ? 'Child Information' 
      : service.type === 'maintenance'
        ? 'Vehicle Details'
        : 'Special Requests';
    
    message += `*${detailsLabel}:* ${bookingData.message || 'None'}%0A%0A`;
    
    message += `Please respond:%0A`;
    message += `✅ [Accept Booking](${acceptLink})%0A`;
    message += `❌ [Decline Booking](${declineLink})%0A%0A`;
    message += `Or reply directly to this message`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(service.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle input changes
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  // Handle workshop service toggle
  const handleWorkshopToggle = (e) => {
    setBookingData(prev => ({
      ...prev,
      workshopService: e.target.checked,
      address: e.target.checked ? "Workshop Location" : ""
    }));
  };

  // Toggle description visibility
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        setUiState(prev => ({ ...prev, loading: true, error: null }));
        const response = await fetch(`/api/service/get/${serviceId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch service');
        }

        const serviceData = await response.json();
        if (!serviceData || !serviceData._id || !serviceData.name || !Array.isArray(serviceData.imageUrls) || serviceData.imageUrls.length === 0) {
          throw new Error('Invalid or incomplete service data received');
        }

        setService(serviceData);
        setUiState(prev => ({ ...prev, loading: false, error: null }));
      } catch (err) {
        console.error("Fetch error:", err);
        setUiState(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };
    fetchService();
  }, [serviceId]);

  const whatsappNumber = formatContactForWhatsApp(service?.contact);
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi, I'm interested in your ${encodeURIComponent(service?.name)} service.`
    : null;

  // Service features based on type
  const getServiceFeatures = () => {
    if (!service) return [];
    
    // Daycare specific features
    if (service.type === 'daycare') {
      return [
        { icon: FaChild, label: "Age Group", value: service.ageGroup || 'Not specified' },
        { icon: FaUserFriends, label: "Capacity", value: service.capacity || 'Not specified' },
        { icon: FaUtensils, label: "Meals Provided", value: service.meals ? 'Yes' : 'No' },
        { icon: FaShieldAlt, label: "Licensed", value: service.licenseNumber || 'Not specified' },
        { icon: FaClipboardCheck, label: "Curriculum", value: service.kind || 'Not specified' },
        { icon: FaRegClock, label: "Operating Hours", value: service.period || 'Not specified' },
      ];
    }
    
    // School transport specific features
    if (service.type === 'schoolTransport') {
      return [
        { icon: FaCar, label: "Vehicle Type", value: service.vehicleType || 'Not specified' },
        { icon: FaMapMarkerAlt, label: "Covered Areas", value: service.routeAreas || 'Not specified' },
        { icon: FaCarSide, label: "Child Seats", value: service.childSeats ? 'Available' : 'Not available' },
        { icon: FaBus, label: "School Routes", value: service.near || 'Not specified' },
        { icon: FaShieldAlt, label: "Safety Certified", value: service.security ? 'Yes' : 'No' },
        { icon: FaRegClock, label: "Pickup Times", value: service.period || 'Not specified' },
      ];
    }
    
    // Default features for other services
    return [
      { icon: FaShieldAlt, label: "Verified", value: service.security ? 'Yes' : 'No' },
      { icon: FaClipboardCheck, label: "Quality Guarantee", value: "Included" },
      { icon: FaTools, label: "Equipment Provided", value: "Yes" },
      { icon: FaTruck, label: "Mobile Service", value: "Yes" },
      { icon: FaRegClock, label: "Availability", value: service.period || 'Not specified' },
      { icon: FaMoneyBillWave, label: "Flexible Payment", value: "Available" },
    ];
  };

  // Get pricing label based on service type
  const getPricingLabel = () => {
    if (!service) return '/ Month';
    
    switch(service.type) {
      case 'daycare':
        return '/ Month';
      case 'schoolTransport':
        return '/ Month';
      default:
        return '/ Month';
    }
  };

  // Render loading state
  if (uiState.loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading service details...</p>
      </div>
    );
  }

  // Render error state
  if (uiState.error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading service</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{uiState.error}</p>
              </div>
              <button
                onClick={() => setUiState(prev => ({ ...prev, loading: true, error: null }))}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/services')}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft /> Back to Services
        </button>
      </div>
    );
  }

  // Render service not found state
  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Service not found</h2>
          <p className="mt-2 text-gray-600">The service you re looking for doesn t exist or may have been removed.</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Browse All Services
          </button>
        </div>
      </div>
    );
  }

  // Get description text for display
  const description = service.description || '';
  const displayText = showFullDescription 
    ? description 
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  // Service features
  const serviceFeatures = getServiceFeatures();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => navigate('/service-home-page')}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back to listings"
        >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Call and WhatsApp buttons */}
      {(service.contact || whatsappNumber) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 sm:flex-row">
          {service.contact && (
            <a
              href={`tel:${service.contact}`}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label="Call Service Provider"
            >
              <FaPhone className="text-2xl" />
            </a>
          )}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label="WhatsApp Service Provider"
            >
              <FaWhatsapp className="text-2xl" />
            </a>
          )}
        </div>
      )}

   {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-dark flex-1 min-w-0 line-clamp-2 overflow-hidden text-ellipsis break-words">
                    {service.name}
                  </h1>
                  {service.security && (
                    <span className="inline-flex items-center bg-airbnb-red bg-opacity-10 text-airbnb-red px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 mt-1">
                      <span className="mr-1">✅</span> Verified
                    </span>
                  )}
                </div>
                
                     <div className="flex flex-wrap items-center gap-2">
                              {/* Rating Badge */}
                              <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-full border border-airbnb-medium-gray">
                                <span className="font-medium text-airbnb-dark">
                      {service.rating ? (
                        <>
                          <span className="font-semibold">{service.rating}</span>
                          <span className="text-airbnb-gray ml-1">Stars</span>
                        </>
                      ) : (
                        <span className="text-airbnb-blue">✨ New Service</span>
                      )}
                    </span>
                  </div>

                  {/* Location Badge */}
                  <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-full border border-airbnb-medium-gray">
                    <span className="text-airbnb-red mr-1.5">📍</span>
                    <span className="font-medium text-airbnb-dark truncate max-w-[160px]">
                      {service.address}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Rating Widgets */}
            {/* Rating Widgets */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 w-full sm:w-auto">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Like/Dislike Widget */}
                  <div className="flex flex-col items-center">
                    <div className="flex gap-3 mb-1">
                      <button
                        onClick={handleLike}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          aiAssessment.userReaction === 'like' 
                            ? 'bg-green-100 text-green-600 shadow-md shadow-green-100' 
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <span className="text-xl">👍</span>
                      </button>
                      <button
                        onClick={handleDislike}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          aiAssessment.userReaction === 'dislike' 
                            ? 'bg-red-100 text-red-600 shadow-md shadow-red-100' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <span className="text-xl">👎</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-green-600 font-medium text-sm flex items-center">
                        <FaArrowUp className="mr-1" /> {aiAssessment.likes}
                      </span>
                      <span className="text-red-600 font-medium text-sm flex items-center">
                        <FaArrowDown className="mr-1" /> {aiAssessment.dislikes}
                      </span>
                    </div>
                  </div>

                  {/* AI Rating */}
                  <div className="text-center px-3">
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium mb-1">
                      <span className="text-lg">🤖</span>
                      <span>AI Rating</span>
                    </div>
                    {aiAssessment.overallRating ? (
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-2xl font-bold text-gray-900 leading-none">
                          {aiAssessment.overallRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-sm mb-1">/5</span>
                      </div>
                    ) : (
                      <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse mx-auto"></div>
                    )}
                  </div>

                  {/* User Reviews */}
                  <div className="text-center">
                                     <div className="flex items-center justify-center gap-1 text-gray-600 text-sm font-medium mb-1">
                                       <span className="text-lg">reviews</span>
                                     
                                     </div>
                                     <div className="flex items-end justify-center gap-1">
                                        <span className="text-2xl font-bold text-gray-900 leading-none">
                                         {commentCount} 
                                       </span>
                                      
                                     </div>
                                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {service.imageUrls && service.imageUrls.length > 0 ? (
              <>
                <Swiper
                  modules={[Navigation, Thumbs, Zoom]}
                  navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
                  thumbs={{ swiper: thumbsSwiper }}
                  zoom={true}
                  className="w-full h-64 sm:h-80 md:h-[450px] lg:h-[500px]"
                >
                  {service.imageUrls.map((img, index) => (
                    <SwiperSlide key={index} className="w-full h-full">
                      <div className="swiper-zoom-container w-full h-full bg-gray-100">
                        <img
                          src={img}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-full object-fill cursor-zoom-in min-w-full min-h-full"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'path-to-fallback-image.jpg';
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                  <div className="swiper-button-prev custom-swiper-nav-btn left-2"></div>
                  <div className="swiper-button-next custom-swiper-nav-btn right-2"></div>
                </Swiper>

                {/* Thumbnail navigation */}
                {service.imageUrls.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    className="mt-4 h-20"
                  >
                    {service.imageUrls.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="block w-full h-full object-cover rounded-lg cursor-pointer opacity-70 hover:opacity-100 transition-opacity border border-gray-200"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-500 text-lg">
                No images available for this service.
              </div>
            )}
          </div>

          {/* About Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Service</h2>
            
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{displayText}</p>
            </div>
            
            {description.length > 300 && (
              <button
                onClick={toggleDescription}
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d={showFullDescription ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} clipRule="evenodd" />
                </svg>
              </button>
            )}
          </section>

          {/* AI Content Assessment */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FaRobot className="text-blue-600 text-xl" />
              <h2 className="text-2xl font-semibold text-gray-800">AI Content Assessment</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Description Quality</h3>
                {aiAssessment.descriptionQuality !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-700">{aiAssessment.descriptionQuality}</span>
                    <span className="text-gray-600">/5</span>
                    <div className="ml-auto">
                      {aiAssessment.descriptionQuality >= 4 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Excellent</span>
                      ) : aiAssessment.descriptionQuality >= 3 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Good</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Needs Improvement</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                )}
                <p className="text-gray-600 mt-2 text-sm">
                  Based on detail level, clarity, and professionalism
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Image Quality</h3>
                {aiAssessment.imageQuality !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-700">{aiAssessment.imageQuality}</span>
                    <span className="text-gray-600">/5</span>
                    <div className="ml-auto">
                      {aiAssessment.imageQuality >= 4 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Excellent</span>
                      ) : aiAssessment.imageQuality >= 3 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Good</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Needs More</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                )}
                <p className="text-gray-600 mt-2 text-sm">
                  Based on image count, clarity, and relevance
                </p>
              </div>
            </div>
          </section>

          {/* Service Features Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {service.type === 'daycare' ? 'Daycare Details' : 
               service.type === 'schoolTransport' ? 'Transport Details' : 'Service Features'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceFeatures.map(({ icon: Icon, label, value }, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Icon className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-gray-600 font-medium">{label}</h3>
                    <p className="text-gray-800 font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Information Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {service.type === 'daycare' 
                ? 'Daily Schedule' 
                : service.type === 'schoolTransport' 
                  ? 'Safety Protocols' 
                  : 'Service Details'}
            </h2>
            
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">
                {service.type === 'daycare' 
                  ? (service.near || 'Typical daycare schedule includes:\n\n' +
                    '• 7:30 AM - 8:30 AM: Arrival & Free Play\n' +
                    '• 8:30 AM - 9:00 AM: Breakfast\n' +
                    '• 9:00 AM - 10:00 AM: Educational Activities\n' +
                    '• 10:00 AM - 10:30 AM: Outdoor Play\n' +
                    '• 10:30 AM - 11:00 AM: Snack Time\n' +
                    '• 11:00 AM - 12:00 PM: Arts & Crafts\n' +
                    '• 12:00 PM - 1:00 PM: Lunch\n' +
                    '• 1:00 PM - 3:00 PM: Nap Time\n' +
                    '• 3:00 PM - 3:30 PM: Afternoon Snack\n' +
                    '• 3:30 PM - 5:00 PM: Story Time & Departure')
                  
                  : service.type === 'schoolTransport' 
                    ? (service.near || 'Our safety measures include:\n\n' +
                      '• Certified drivers with background checks\n' +
                      '• Regular vehicle maintenance checks\n' +
                      '• GPS tracking for all routes\n' +
                      '• Child safety seats for all age groups\n' +
                      '• Two-way communication with parents\n' +
                      '• Strict pickup/dropoff authorization procedures\n' +
                      '• Emergency protocols in place')
                    
                    : (service.description || 'Detailed service information not available')}
              </p>
            </div>
          </section>

          {/* Services Offered Section */}
          {service.type !== 'schoolTransport' && (
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {service.type === 'daycare' ? 'Educational Approach' : 'Services Offered'}
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p className="whitespace-pre-line">{service.kind || service.near}</p>
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Guest Reviews</h2>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
                <span className="mx-1">·</span>
                <span className="text-gray-600">{commentCount} reviews</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Review Highlights */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Review Highlights</h3>
                <div className="space-y-4">
                  {RATING_CATEGORIES.map(({ name, label, icon: Icon }) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Icon className="mr-2 text-blue-500" />
                        <span>{label}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(aiRating.categoryRatings[name] / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{aiRating.categoryRatings[name].toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Recent Reviews</h3>
                  {commentCount > 2 && (
                    <button
                      onClick={() => setShowCommentsPanel(true)}
                      className="text-blue-600 hover:underline flex items-center text-sm"
                    >
                      View all <FaChevronDown className="ml-1 text-xs" />
                    </button>
                  )}
                </div>

                <Comment 
                  serviceId={serviceId} 
                  maxComments={2}
                  onTotalComments={setCommentCount} 
                  cardStyle={true}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Booking Card & Provider Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Booking Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden lg:sticky lg:top-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Service Details & Booking</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-extrabold text-blue-700">R{service.regularPrice}</span>
                <span className="text-gray-600 text-lg">{getPricingLabel()}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Host information */}
              <div className="flex items-center gap-3 text-gray-700">
                <FaUser className="text-blue-500 text-xl" />
                <span className="font-medium">Hosted by {service.host}</span>
              </div>

              {/* Contact Information */}
              {service.contact && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaPhone className="text-blue-500 text-xl" />
                  <span className="font-medium">Contact: 0{service.contact}</span>
                </div>
              )}

              {/* Availability Period */}
              {service.period && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaClock className="text-blue-500 text-xl" />
                  <span className="font-medium">Availability: {service.period}</span>
                </div>
              )}

              {/* Cancellation Policy */}
              {service.cancel && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaMoneyBillWave className="text-blue-500 text-xl" />
                  <span className="font-medium">Cancellation Policy: {service.cancel}</span>
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="pt-4 space-y-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="name"
                    value={bookingData.name}
                    onChange={handleBookingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="userPhone"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleBookingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="+27 12 345 6789"
                  />
                </div>
                
                {/* Workshop Service Option */}
                {service.type === 'maintenance' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="workshopService"
                      name="workshopService"
                      checked={bookingData.workshopService}
                      onChange={handleWorkshopToggle}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="workshopService" className="ml-2 block text-sm text-gray-700">
                      I will come to your workshop/service center
                    </label>
                  </div>
                )}
                
                {/* Address Field - Hidden if workshop service selected */}
                {(!bookingData.workshopService || service.type !== 'maintenance') && (
                  <div>
                    <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Address {service.type === 'schoolTransport' ? '(Pickup Location)' : ''}
                      {service.type === 'maintenance' && ' (Vehicle Location)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="userAddress"
                        name="address"
                        value={bookingData.address}
                        onChange={handleBookingChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                        placeholder={
                          service.type === 'schoolTransport' ? "Pickup address" : 
                          service.type === 'maintenance' ? "Where is the vehicle located?" :
                          "123 Main St, City"
                        }
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {bookingData.address && (
                      <div className="mt-2 text-right">
                        <a
                          href={generateMapLink(bookingData.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          View on Map <FaExternalLinkAlt className="ml-1 text-xs" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                    {service.type === 'daycare' ? 'Start Date' : 'Date'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="bookingDate"
                      name="date"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                {service.type !== 'daycare' && (
                  <div>
                    <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="bookingTime"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                        required
                      />
                      <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                    {service.type === 'daycare' ? 'Child Information' : 
                     service.type === 'maintenance' ? 'Vehicle Details' : 
                     'Special Requests'}
                  </label>
                  <textarea
                    id="specialRequests"
                    name="message"
                    value={bookingData.message}
                    onChange={handleBookingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows="3"
                    placeholder={
                      service.type === 'daycare' 
                        ? "Child's name, age, allergies, special needs..." 
                        : service.type === 'maintenance'
                          ? "Vehicle make, model, year, and issues..."
                          : "E.g., specific requirements, arrival instructions..."
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                  Book via WhatsApp
                </button>
              </form>

              {/* Update Service Button */}
              {currentUser && currentUser._id === service.userRef && (
                <button
                  onClick={() => navigate(`/update-service/${service._id}`)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                  Update Service Listing
                </button>
              )}
            </div>
          </div>

          {/* Provider Info Sidebar */}
        {/* Provider Information */}
        {/* Provider Information */}
<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">About the Provider</h3>
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <FaUser className="text-airbnb-red" />
      <span className="text-gray-700">{service.host}</span>
    </div>
    {service.contact && (
      <div className="flex items-center gap-3">
        <FaPhone className="text-airbnb-red" />
        <span className="text-gray-700">{service.contact}</span>
      </div>
    )}
    {service.email && (
      <div className="flex items-center gap-3">
        <FaEnvelope className="text-airbnb-red" />
        <span className="text-gray-700">{service.email}</span>
      </div>
    )}
    <div className="flex items-center gap-3">
      <FaClock className="text-airbnb-red" />
      <span className="text-gray-700">Response time: 1-24 hours</span>
    </div>
    {service.host && (
      <div className="flex items-center gap-3">
        <FaBriefcase className="text-airbnb-red" />
        <span className="text-gray-700">Experience: {service.host}</span>
      </div>
    )}
    {service.cancel && (
      <div className="flex items-center gap-3">
        <FaUserFriends className="text-airbnb-red" />
        <span className="text-gray-700">Languages: {service.cancel}</span>
      </div>
    )}
  </div>
</div>


          
          {/* Additional info for daycare */}
          {service.type === 'daycare' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBaby className="text-yellow-600 text-2xl" />
                <h3 className="text-xl font-semibold text-yellow-800">Daycare Tips</h3>
              </div>
              <ul className="space-y-2 text-yellow-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Label all personal items with child s name</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provide a change of clothes in case of accidents</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Inform staff about allergies or special needs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Establish consistent drop-off and pick-up routines</span>
                </li>
              </ul>
            </div>
          )}
          
          {/* Additional info for school transport */}
          {service.type === 'schoolTransport' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBus className="text-blue-600 text-2xl" />
                <h3 className="text-xl font-semibold text-blue-800">Transport Safety</h3>
              </div>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Children must be ready 5 minutes before pickup time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Authorized adults only at pickup/dropoff</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Notify driver of any schedule changes in advance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provide emergency contact information</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelService 
          serviceId={serviceId} 
          onClose={() => setShowCommentsPanel(false)} 
        />
      )}
    </div>
  );
};

export default ServicePage;