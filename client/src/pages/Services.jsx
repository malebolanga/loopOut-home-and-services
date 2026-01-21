// Services.jsx - Professional Design with Popup Booking Form
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaWhatsapp,
  FaArrowLeft, FaClock, FaExclamationTriangle,
  FaTools, FaShieldAlt, FaTruck, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaImages, FaCertificate,
  FaAward, FaThumbsUp, FaRegClock, FaRegCalendarCheck,
  FaRegStar, FaRegHeart, FaRegCommentDots, FaInfoCircle,
  FaMoneyBill, FaHeart, FaShare, FaCalendar, FaUser,
  FaChevronLeft, FaChevronRight, FaSpinner, FaRobot,
  FaBriefcase, FaCar, FaTimes, FaUsers, FaLeaf,
  FaHandshake, FaCreditCard, FaTrophy, FaSmile,
  FaCalendarCheck, FaCheck, FaQuestionCircle, FaExpand
} from 'react-icons/fa';
import { FiShare2, FiMessageSquare, FiX } from 'react-icons/fi';
import CommentsSidePanelService from '../components/CommentsSidePanelService';
import Comment from '../components/Comment';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/autoplay';

const ServicePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showBookingBelt, setShowBookingBelt] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    selectedServices: [],
    date: '',
    time: '',
    locationOption: 'comeToYou',
    address: '',
    specialRequirements: '',
    numberOfGuests: '1',
    serviceDuration: '2',
    paymentMethod: 'cash'
  });

  const [enhancedServiceData, setEnhancedServiceData] = useState({
    yearsExperience: 5,
    teamSize: 'Individual Professional',
    certifications: ['Certified Professional', 'Safety Certified'],
    languages: ['English', 'Afrikaans'],
    availability: 'Mon-Sun, 7AM-9PM',
    responseTime: 'Within 1 hour',
    repeatClients: '85%',
    completionRate: '98%',
    insuranceCoverage: true,
    equipmentProvided: true,
    ecoFriendly: false,
    emergencyService: true,
    warrantyPeriod: '30-day satisfaction guarantee',
    trainingCertified: true,
    backgroundChecked: true,
    membership: 'Professional Services Association',
    awards: ['Service Excellence 2023', 'Top Rated Provider']
  });

  const [aiAssessment, setAiAssessment] = useState({
    descriptionQuality: 4.2,
    imageQuality: 4.8,
    overallRating: 4.5,
    trustScore: 4.7,
    responseQuality: 4.3,
    valueForMoney: 4.6,
    likes: 42,
    dislikes: 2,
    userReaction: null
  });

  const getProfessionalTitle = (type) => {
    const titles = {
      cleaning: 'Professional Cleaning Service',
      catering: 'Premium Catering Service',
      moving: 'Certified Moving Service',
      landscaping: 'Expert Landscaping Service',
      daycare: 'Licensed Daycare Service',
      schoolTransport: 'Safe School Transport Service',
      maintenance: 'Skilled Maintenance Service',
      default: 'Professional Service Provider'
    };
    return titles[type] || titles.default;
  };

  const getThemeColor = (type) => {
    const themes = {
      cleaning: 'emerald',
      catering: 'amber',
      moving: 'blue',
      landscaping: 'green',
      daycare: 'pink',
      schoolTransport: 'indigo',
      maintenance: 'slate',
      default: 'blue'
    };
    return themes[type] || themes.default;
  };

  const getServiceDescription = (type, serviceData) => {
    const baseDescription = serviceData.description || 'Professional service provider with years of experience.';
    const additionalInfo = {
      cleaning: ` Our comprehensive cleaning service uses hospital-grade disinfectants and eco-friendly solutions. We follow a meticulous 7-step process ensuring every corner is spotless. All staff are background-checked, insured, and follow strict COVID-19 safety protocols.`,
      catering: ` From intimate gatherings to grand celebrations, we craft memorable dining experiences with custom menus using fresh, locally sourced ingredients. Our culinary team accommodates all dietary restrictions and provides full setup and cleanup.`,
      moving: ` We make moving stress-free with professional packing, furniture handling, and transportation. Our experienced team handles every detail with care, providing specialty item handling and proper equipment for safe transport.`,
      default: ` Professional service with attention to detail and customer satisfaction as our top priority. We bring years of experience, proper equipment, and a commitment to excellence to every job.`
    };
    
    return baseDescription + (additionalInfo[type] || additionalInfo.default);
  };

  const getServiceOptions = (type) => {
    const cleaningOptions = [
      { id: 'house-cleaning', name: 'Standard Cleaning', description: 'Complete cleaning of living areas', duration: '2-4 hours', price: 'R450', popular: true },
      { id: 'deep-cleaning', name: 'Deep Cleaning', description: 'Intensive detailed cleaning', duration: '4-6 hours', price: 'R850', popular: false },
      { id: 'office-cleaning', name: 'Office Cleaning', description: 'Commercial space cleaning', duration: '3-5 hours', price: 'R650', popular: true },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning', description: 'Professional steam cleaning', duration: '2-3 hours', price: 'R350', popular: false }
    ];

    const cateringOptions = [
      { id: 'corporate-catering', name: 'Corporate Events', description: 'Business meetings & lunches', duration: 'Custom', price: 'R150/person', popular: true },
      { id: 'wedding-catering', name: 'Wedding Catering', description: 'Full wedding service', duration: 'Custom', price: 'R350/person', popular: false },
      { id: 'private-events', name: 'Private Events', description: 'Personal celebrations', duration: 'Custom', price: 'R200/person', popular: true },
      { id: 'meal-prep', name: 'Meal Preparation', description: 'Weekly meal preparation', duration: 'Weekly', price: 'R800/week', popular: false }
    ];

    const movingOptions = [
      { id: 'local-moving', name: 'Local Moving', description: 'Within 50km radius', duration: '4-8 hours', price: 'R1800', popular: true },
      { id: 'long-distance', name: 'Long Distance', description: 'Cross-province moves', duration: 'Custom', price: 'Custom Quote', popular: false },
      { id: 'office-moving', name: 'Office Moving', description: 'Business relocation', duration: '1-3 days', price: 'R5000+', popular: false },
      { id: 'packing-service', name: 'Packing Service', description: 'Full packing assistance', duration: '4-6 hours', price: 'R1200', popular: true }
    ];

    switch (type) {
      case 'cleaning': return cleaningOptions;
      case 'catering': return cateringOptions;
      case 'moving': return movingOptions;
      default: return cleaningOptions;
    }
  };

  const themeColor = service ? getThemeColor(service.type) : 'blue';

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/service/get/${serviceId}`);
        if (!res.ok) throw new Error('Failed to fetch service details');
        const data = await res.json();
        setService(data);
        
        if (data) {
          setEnhancedServiceData(prev => ({
            ...prev,
            yearsExperience: data.host || 5,
            languages: data.cancel ? [data.cancel, 'English'] : ['English', 'Afrikaans']
          }));
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (service?._id) {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        setIsFavorite(wishlist.some(item => item?._id === service._id));
      } catch (error) {
        console.error('Error reading wishlist from localStorage:', error);
      }
    }
  }, [service]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 300;
      setShowBookingBelt(window.scrollY > scrollThreshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const contactStr = String(contact);
    const digitsOnly = contactStr.replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) return '27' + digitsOnly.substring(1);
    return digitsOnly;
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleServiceSelection = (serviceId) => {
    setBookingData(prev => {
      const selectedServices = [...prev.selectedServices];
      const serviceIndex = selectedServices.indexOf(serviceId);
      if (serviceIndex > -1) selectedServices.splice(serviceIndex, 1);
      else selectedServices.push(serviceId);
      return { ...prev, selectedServices };
    });
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    if (!service?._id) return;

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const updatedWishlist = newFavoriteStatus
        ? [...wishlist, service]
        : wishlist.filter(item => item?._id !== service._id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  };

  const handleLike = () => {
    setAiAssessment(prev => ({
      ...prev,
      likes: prev.userReaction === 'like' ? prev.likes - 1 : prev.userReaction === 'dislike' ? prev.likes + 1 : prev.likes + 1,
      dislikes: prev.userReaction === 'dislike' ? prev.dislikes - 1 : prev.dislikes,
      userReaction: prev.userReaction === 'like' ? null : 'like'
    }));
  };

  const handleDislike = () => {
    setAiAssessment(prev => ({
      ...prev,
      dislikes: prev.userReaction === 'dislike' ? prev.dislikes - 1 : prev.userReaction === 'like' ? prev.dislikes + 1 : prev.dislikes + 1,
      likes: prev.userReaction === 'like' ? prev.likes - 1 : prev.likes,
      userReaction: prev.userReaction === 'dislike' ? null : 'dislike'
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    setTimeout(() => {
      const whatsappNumber = formatContactForWhatsApp(service.contact);
      let message = `*📋 New Booking Request*%0A%0A`;
      message += `*🏢 Service:* ${service.name}%0A`;
      message += `*👤 Client:* ${bookingData.name}%0A`;
      message += `*📅 Date:* ${bookingData.date}%0A`;
      message += `*⏰ Time:* ${bookingData.time}%0A`;
      message += `*📍 Location:* ${bookingData.locationOption === 'comeToYou' ? 'At Client Location' : 'At Your Location'}%0A`;
      
      if (bookingData.address) {
        message += `*🏠 Address:* ${bookingData.address}%0A`;
      }
      
      if (bookingData.specialRequirements) {
        message += `*📝 Special Requirements:* ${bookingData.specialRequirements}%0A`;
      }
      
      if (bookingData.selectedServices.length > 0) {
        const serviceOptions = getServiceOptions(service.type);
        message += `*🔧 Selected Services:*%0A`;
        bookingData.selectedServices.forEach(serviceId => {
          const serviceOption = serviceOptions.find(s => s.id === serviceId);
          if (serviceOption) {
            message += `• ${serviceOption.name} (${serviceOption.price})%0A`;
          }
        });
      }
      
      message += `%0A*📞 Client Phone:* ${bookingData.phone}%0A`;
      message += `*👥 Number of Guests/Rooms:* ${bookingData.numberOfGuests}%0A`;
      message += `%0APlease confirm this booking request.`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      setIsUploading(false);
      setShowBookingPopup(false); // Close popup after submission
    }, 1500);
  };

  const handleQuickBooking = () => {
    if (!bookingData.name || !bookingData.phone) {
      setShowBookingPopup(true);
      return;
    }
    
    const whatsappNumber = formatContactForWhatsApp(service.contact);
    const message = `*⚡ Quick Booking Request*%0A%0A*Service:* ${service.name}%0A*Client:* ${bookingData.name}%0A*Phone:* ${bookingData.phone}%0A%0APlease contact me to schedule a booking.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: `Check out ${service.name} - ${getProfessionalTitle(service.type)} on loopOut`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const openImageModal = (index) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const openBookingPopup = () => {
    setShowBookingPopup(true);
  };

  const closeBookingPopup = () => {
    setShowBookingPopup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading service details...</p>
          <p className="text-gray-400 text-sm">Please wait while we prepare everything</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Service</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-gray-500 text-sm mb-8">Please check your connection and try again</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/service-home-page')} 
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200 shadow-sm"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Service Not Found</h2>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <p className="text-gray-500 text-sm mb-8">Try searching for another service in your area</p>
          <button 
            onClick={() => navigate('/service-home-page')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Browse All Services
          </button>
        </div>
      </div>
    );
  }

  const fullDescription = getServiceDescription(service.type, service);
  const displayText = showFullDescription ? fullDescription : fullDescription.slice(0, 350) + (fullDescription.length > 350 ? "..." : "");
  const serviceOptions = getServiceOptions(service.type);
  const displayedServices = showAllServices ? serviceOptions : serviceOptions.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Share this service"
              >
                <FiShare2 className="text-xl" />
              </button>
              <button
                onClick={toggleFavorite}
                className="p-2 text-gray-600 hover:text-rose-600 transition-colors rounded-lg hover:bg-gray-100"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <FaHeart className="w-5 h-5 text-rose-600" />
                ) : (
                  <FaRegHeart className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Image Gallery */}
              <div className="relative">
                <div className="h-[400px] bg-gray-100">
                  {service.imageUrls && service.imageUrls.length > 0 ? (
                    <Swiper
                      modules={[Navigation, Pagination, Thumbs, Autoplay]}
                      navigation
                      pagination={{ clickable: true }}
                      thumbs={{ swiper: thumbsSwiper }}
                      autoplay={{ delay: 5000 }}
                      className="w-full h-full"
                      onSlideChange={(swiper) => {
                        setCurrentImageIndex(swiper.activeIndex);
                      }}
                    >
                      {service.imageUrls.map((url, index) => (
                        <SwiperSlide key={index}>
                          <div 
                            className="relative w-full h-full cursor-pointer" 
                            onClick={() => openImageModal(index)}
                          >
                            <img
                              src={url}
                              alt={`${service.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                            <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors">
                              <FaExpand className="text-gray-700" />
                            </button>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <FaImages className="text-gray-400 text-5xl mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No images available</p>
                        <p className="text-gray-400 text-sm mt-1">Professional service nonetheless</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Counter */}
                {service.imageUrls && service.imageUrls.length > 0 && (
                  <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    <span className="font-semibold">{currentImageIndex + 1}</span>
                    <span className="mx-1">/</span>
                    <span>{service.imageUrls.length}</span>
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white px-4 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3">
                      <FaMoneyBill className="text-green-600 text-xl" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">R{service.regularPrice}</div>
                        {service.discountPrice && (
                          <div className="text-gray-500 text-sm line-through">R{service.discountPrice}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Slider */}
              {service.imageUrls && service.imageUrls.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <Swiper
                    modules={[Thumbs]}
                    watchSlidesProgress
                    onSwiper={setThumbsSwiper}
                    slidesPerView={4}
                    spaceBetween={12}
                    className="thumbnail-slider"
                  >
                    {service.imageUrls.map((url, index) => (
                      <SwiperSlide key={index}>
                        <div 
                          className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                          }`}
                          onClick={() => openImageModal(index)}
                        >
                          <img
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Service Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Header Section */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold bg-${themeColor}-50 text-${themeColor}-700 border border-${themeColor}-100`}>
                      {getProfessionalTitle(service.type)}
                    </span>
                    {service.security && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                        <FaShieldAlt className="text-xs" />
                        Verified Professional
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-lg ${star <= Math.floor(service.rating || 4.5)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{service.rating || '4.5'}</span>
                        <span className="text-gray-500 text-sm ml-2">({service.reviewCount || '25'} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                        <FaMapMarkerAlt className="text-red-500 text-xs" />
                      </div>
                      <span className="font-medium">{service.address || 'Available in your area'}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-gray-900">{enhancedServiceData.yearsExperience}+</div>
                    <div className="text-gray-600 text-sm">Years Experience</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-gray-900">{enhancedServiceData.repeatClients}</div>
                    <div className="text-gray-600 text-sm">Repeat Clients</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="text-2xl font-bold text-gray-900">{enhancedServiceData.completionRate}</div>
                    <div className="text-gray-600 text-sm">Completion Rate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-gray-900">{enhancedServiceData.responseTime}</div>
                    <div className="text-gray-600 text-sm">Response Time</div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={openBookingPopup}
                    className="flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                  >
                    <FaCalendar className="text-lg" />
                    Book This Service
                  </button>
                  
                  <a
                    href={`https://wa.me/${formatContactForWhatsApp(service.contact)}?text=Hi, I'm interested in your ${service.name} service.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-6 py-3.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
                  >
                    <FaWhatsapp className="text-lg" />
                    Message on WhatsApp
                  </a>
                  
                  <a
                    href={`tel:${service.contact}`}
                    className="flex items-center gap-3 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold shadow-sm"
                  >
                    <FaPhone className="text-lg" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  {['overview', 'services', 'reviews', 'location', 'details'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 font-medium transition-colors relative ${
                        activeTab === tab
                          ? 'text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About This Service</h3>
                      <div className="text-gray-700 leading-relaxed">
                        {displayText.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                        {fullDescription.length > 350 && (
                          <button
                            onClick={toggleDescription}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 "
                          >
                            {showFullDescription ? (
                              <>
                                Show Less
                                <FaChevronUp className="text-sm group-hover:-translate-y-0.5 transition-transform" />
                              </>
                            ) : (
                              <>
                                Read More
                                <FaChevronDown className="text-sm group-hover:translate-y-0.5 transition-transform" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Key Features */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Why Choose This Service</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { icon: FaShieldAlt, title: 'Insured & Certified', desc: 'Full liability coverage with certified professionals', color: 'green' },
                          { icon: FaClock, title: 'On-Time Guarantee', desc: 'We arrive on time or you get a discount', color: 'amber' },
                          { icon: FaLeaf, title: 'Eco-Friendly', desc: 'Environmentally conscious practices', color: 'emerald' },
                          { icon: FaAward, title: 'Quality Guarantee', desc: 'Satisfaction guaranteed or redo for free', color: 'blue' }
                        ].map((feature, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <feature.icon className={`text-${feature.color}-600`} />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-1">{feature.title}</h5>
                              <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'services' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Available Service Packages</h3>
                      <p className="text-gray-600">Select one or more services for your booking</p>
                    </div>
                    
                    <div className="space-y-4">
                      {displayedServices.map((serviceOption) => (
                        <div
                          key={serviceOption.id}
                          className={`p-4 rounded-lg border-2 transition-colors cursor-pointer hover:shadow-sm ${
                            bookingData.selectedServices.includes(serviceOption.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleServiceSelection(serviceOption.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mt-1 ${
                                bookingData.selectedServices.includes(serviceOption.id)
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                              }`}>
                                {bookingData.selectedServices.includes(serviceOption.id) ? (
                                  <FaCheckCircle className="text-blue-600" />
                                ) : (
                                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{serviceOption.name}</h4>
                                  {serviceOption.popular && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{serviceOption.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">{serviceOption.price}</div>
                              <div className="text-gray-500 text-sm">{serviceOption.duration}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {serviceOptions.length > 4 && (
                      <button
                        onClick={() => setShowAllServices(!showAllServices)}
                        className="mt-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                      >
                        {showAllServices ? 'Show Less' : `Show All ${serviceOptions.length} Services`}
                        {showAllServices ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    )}
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900">{service.rating || '4.5'}</div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`text-lg ${star <= Math.floor(service.rating || 4.5)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-gray-600 text-sm mt-2">{service.reviewCount || '25'} reviews</div>
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 w-4">{rating}</span>
                                <FaStar className="text-yellow-400 text-sm" />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-400"
                                    style={{ width: `${Math.random() * 30 + 70}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Comment 
                      serviceId={service._id} 
                      maxComments={3}
                      onTotalComments={setCommentCount} 
                      cardStyle={true}
                    />
                    
                    <button
                      onClick={() => setShowCommentsPanel(true)}
                      className="mt-6 w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:shadow-sm transition-colors font-medium"
                    >
                      View All {commentCount} Reviews
                    </button>
                  </div>
                )}
                
                {activeTab === 'location' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Service Location & Coverage</h3>
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <FaMapMarkerAlt className="text-blue-600 text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Service Area</h4>
                            <p className="text-gray-700">{service.serviceArea || 'Greater Metropolitan Area'}</p>
                          </div>
                        </div>
                        
                        {service.address && (
                          <div className="space-y-3">
                            <div className="bg-white p-4 rounded border border-gray-200">
                              <p className="font-medium text-gray-900 mb-2">Physical Address:</p>
                              <p className="text-gray-700">{service.address}</p>
                            </div>
                            <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(service.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <FaMapMarkerAlt />
                              View on Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FaCar className="text-gray-600" />
                            <div>
                              <p className="text-gray-600 text-sm">Travel Fee</p>
                              <p className="text-xl font-bold text-gray-900">R{service.travelFee || 0}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FaClock className="text-gray-600" />
                            <div>
                              <p className="text-gray-600 text-sm">Response Time</p>
                              <p className="text-xl font-bold text-gray-900">{service.responseTime || '1 hour'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Service Provider Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <FaBriefcase className="text-gray-600" />
                          <div>
                            <h4 className="font-bold text-gray-900">Experience</h4>
                            <p className="text-gray-600 text-sm">{enhancedServiceData.yearsExperience} years in {service.type} services</p>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{enhancedServiceData.yearsExperience} Years</div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <FaUser className="text-gray-600" />
                          <div>
                            <h4 className="font-bold text-gray-900">Languages</h4>
                            <p className="text-gray-600 text-sm">Communication languages</p>
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">{enhancedServiceData.languages.join(', ')}</div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <FaRegCalendarCheck className="text-gray-600" />
                          <div>
                            <h4 className="font-bold text-gray-900">Availability</h4>
                            <p className="text-gray-600 text-sm">Service hours</p>
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">{enhancedServiceData.availability}</div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <FaUsers className="text-gray-600" />
                          <div>
                            <h4 className="font-bold text-gray-900">Team</h4>
                            <p className="text-gray-600 text-sm">Service provider type</p>
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">{enhancedServiceData.teamSize}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Booking Bar */}
      <div className={`sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 transition-transform duration-300 ${
        showBookingBelt ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={service?.imageUrls?.[0] || '/api/placeholder/40/40'}
                  alt={service?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{service?.name}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="font-semibold">{service?.rating || '4.5'}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="font-bold text-gray-900">R{service?.regularPrice}</span>
                  <span className="text-gray-500">/service</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFavorite}
                className="p-2 text-gray-600 hover:text-rose-600 transition-colors"
              >
                {isFavorite ? (
                  <FaHeart className="w-5 h-5 text-rose-600" />
                ) : (
                  <FaRegHeart className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={openBookingPopup}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <FaCalendar className="text-lg" />
                Book 
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Popup Modal */}
      {showBookingPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Popup Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Book This Service</h3>
                  <p className="text-gray-600 mt-1">Complete the form to book {service.name}</p>
                </div>
                <button
                  onClick={closeBookingPopup}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
              
              {/* Price Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">R{service.regularPrice}</div>
                    {service.discountPrice && (
                      <div className="text-gray-500 line-through">R{service.discountPrice}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">Per service • Free cancellation</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span className="font-bold text-gray-900">{service.rating || '4.5'}</span>
                    <span className="text-gray-500">({service.reviewCount || '25'} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="p-6">
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Date & Time */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Select Date & Time</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-gray-400" />
                          Date
                        </div>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaRegClock className="text-gray-400" />
                          Time
                        </div>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Service Location</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input
                        type="radio"
                        name="locationOption"
                        value="comeToYou"
                        checked={bookingData.locationOption === 'comeToYou'}
                        onChange={handleBookingChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">At My Location</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Service provider comes to you
                          {service.travelFee > 0 && (
                            <span className="text-amber-600 ml-2 font-semibold">+R{service.travelFee} travel fee</span>
                          )}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input
                        type="radio"
                        name="locationOption"
                        value="goToThem"
                        checked={bookingData.locationOption === 'goToThem'}
                        onChange={handleBookingChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">At Provider's Location</div>
                        <div className="text-sm text-gray-600 mt-1">Visit their professional facility</div>
                      </div>
                    </label>
                  </div>

                  {bookingData.locationOption === 'comeToYou' && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Address
                      </label>
                      <textarea
                        name="address"
                        value={bookingData.address}
                        onChange={handleBookingChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your complete address..."
                      />
                    </div>
                  )}
                </div>

                {/* Service Options */}
                {serviceOptions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">Select Services</h4>
                    <div className="space-y-3">
                      {serviceOptions.map((serviceOption) => (
                        <div
                          key={serviceOption.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            bookingData.selectedServices.includes(serviceOption.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => handleServiceSelection(serviceOption.id)}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            bookingData.selectedServices.includes(serviceOption.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {bookingData.selectedServices.includes(serviceOption.id) && (
                              <FaCheckCircle className="text-white text-xs" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{serviceOption.name}</div>
                            <div className="text-sm text-gray-600">{serviceOption.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{serviceOption.price}</div>
                            <div className="text-gray-500 text-sm">{serviceOption.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Your Information</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      required
                      placeholder="Full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleBookingChange}
                      required
                      placeholder="Phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={bookingData.numberOfGuests}
                      onChange={handleBookingChange}
                      min="1"
                      placeholder="Number of people/rooms"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={bookingData.specialRequirements}
                    onChange={handleBookingChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Any special requests, instructions, or notes..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl ${
                    isUploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Booking...
                    </div>
                  ) : (
                    'Confirm Booking via WhatsApp'
                  )}
                </button>

                {/* Security Note */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <FaShieldAlt className="text-gray-400" />
                    Your information is secure • No spam • 100% Satisfaction Guarantee
                  </p>
                </div>
              </form>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleQuickBooking}
                    className="py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-semibold flex items-center justify-center gap-2 border border-green-200"
                  >
                    <FaWhatsapp />
                    Quick Book
                  </button>
                  <button
                    onClick={() => {
                      closeBookingPopup();
                      setActiveTab('overview');
                    }}
                    className="py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <FaInfoCircle />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && service.imageUrls && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes className="text-2xl" />
          </button>
          
          <div className="relative w-full max-w-4xl">
            <img
              src={service.imageUrls[modalImageIndex]}
              alt={`${service.name} - Image ${modalImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={() => setModalImageIndex(prev => Math.max(0, prev - 1))}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                disabled={modalImageIndex === 0}
              >
                <FaChevronLeft className="text-white" />
              </button>
              
              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {modalImageIndex + 1} / {service.imageUrls.length}
              </div>
              
              <button
                onClick={() => setModalImageIndex(prev => Math.min(service.imageUrls.length - 1, prev + 1))}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                disabled={modalImageIndex === service.imageUrls.length - 1}
              >
                <FaChevronRight className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelService
          serviceId={service._id}
          onClose={() => setShowCommentsPanel(false)}
          onCommentCountChange={setCommentCount}
        />
      )}
    </div>
  );
};

export default ServicePage;