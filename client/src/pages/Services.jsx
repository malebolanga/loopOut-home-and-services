// Services.jsx - Professional Design with Popup Booking Form
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaWhatsapp,
  FaArrowLeft, FaClock, FaExclamationTriangle,
  FaTools, FaShieldAlt, FaTruck, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaImages, FaBoxOpen,
  FaAward, FaThumbsUp, FaRegClock, FaRegCalendarCheck,
  FaRegStar, FaRegHeart, FaRegCommentDots, FaInfoCircle,
  FaMoneyBill, FaHeart, FaShare, FaCalendar, FaUser,
  FaChevronLeft, FaChevronRight, FaSpinner, FaRobot,
  FaBriefcase, FaCar, FaTimes, FaUsers, FaLeaf,
  FaArrowRight, FaCreditCard, FaTrophy, FaSmile,
  FaCalendarCheck, FaCheck, FaQuestionCircle, FaExpand,
  FaArrowUp, FaArrowDown, FaFileImage, FaUserFriends, FaBroom, 
  FaTshirt, FaBroom as FaBroomClean, FaFire, FaBaby, FaGlassCheers, FaEllipsisH,
  FaPalette, FaSpa, FaHandSparkles, FaHandHoldingHeart, FaRing,
  FaBrush, FaSprayCan, FaSmile as FaSmileIcon, FaUtensils, FaShoppingBasket, FaCookie,
  FaInstagram, FaFacebook, FaCheck as FaCheckIcon, FaTimes as FaTimesIcon,
  FaLinkedin, FaTwitter, FaCamera, FaHome, FaCompress, FaMotorcycle, FaTruck as FaTruckIcon
} from 'react-icons/fa';
import { FiShare2, FiMessageSquare, FiX } from 'react-icons/fi';
import CommentsSidePanelService from '../components/CommentsSidePanelService';
import Comment from '../components/Comment';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';

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
  
  // Full page overlay state for booking form
  const [showBookingFormOverlay, setShowBookingFormOverlay] = useState(false);
  
  // Full screen gallery states
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

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
    paymentMethod: 'cash',
    vehicleType: '', // Sedan, SUV, Van, Truck, Motorcycle
    vehicleMake: '', // Make of the vehicle (e.g., Toyota, BMW)
    vehicleModel: '', // Model of the vehicle
    vehicleYear: '', // Year of the vehicle
    licensePlate: '' // License plate number
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
      carWash: 'Professional Car Wash & Detailing Service',
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
      carWash: 'sky',
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
      carWash: ` We provide premium car wash and detailing services using high-quality, eco-friendly products. Our experienced team treats every vehicle with care, from sedans to trucks. Services include exterior wash, interior detailing, waxing, polishing, and paint protection. We use water-efficient methods and ensure spotless results every time. All staff are trained in professional vehicle care techniques.`,
      default: ` Professional service with attention to detail and customer satisfaction as our top priority. We bring years of experience, proper equipment, and a commitment to excellence to every job.`
    };
    
    return baseDescription + (additionalInfo[type] || additionalInfo.default);
  };

  const getServiceOptions = (type) => {
    const cleaningOptions = [
      { id: 'house-cleaning', name: 'Standard Cleaning', description: 'Complete cleaning of living areas', duration: '2-4 hours', price: 'R450', popular: true, icon: <FaBroom className="text-blue-500" /> },
      { id: 'deep-cleaning', name: 'Deep Cleaning', description: 'Intensive detailed cleaning', duration: '4-6 hours', price: 'R850', popular: false, icon: <FaBroomClean className="text-green-500" /> },
      { id: 'office-cleaning', name: 'Office Cleaning', description: 'Commercial space cleaning', duration: '3-5 hours', price: 'R650', popular: true, icon: <FaBriefcase className="text-purple-500" /> },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning', description: 'Professional steam cleaning', duration: '2-3 hours', price: 'R350', popular: false, icon: <FaTools className="text-orange-500" /> }
    ];

    const cateringOptions = [
      { id: 'corporate-catering', name: 'Corporate Events', description: 'Business meetings & lunches', duration: 'Custom', price: 'R150/person', popular: true, icon: <FaBriefcase className="text-indigo-500" /> },
      { id: 'wedding-catering', name: 'Wedding Catering', description: 'Full wedding service', duration: 'Custom', price: 'R350/person', popular: false, icon: <FaRing className="text-pink-500" /> },
      { id: 'private-events', name: 'Private Events', description: 'Personal celebrations', duration: 'Custom', price: 'R200/person', popular: true, icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'meal-prep', name: 'Meal Preparation', description: 'Weekly meal preparation', duration: 'Weekly', price: 'R800/week', popular: false, icon: <FaUtensils className="text-orange-500" /> }
    ];

    const movingOptions = [
      { id: 'local-moving', name: 'Local Moving', description: 'Within 50km radius', duration: '4-8 hours', price: 'R1800', popular: true, icon: <FaTruck className="text-blue-500" /> },
      { id: 'long-distance', name: 'Long Distance', description: 'Cross-province moves', duration: 'Custom', price: 'Custom Quote', popular: false, icon: <FaCar className="text-green-500" /> },
      { id: 'office-moving', name: 'Office Moving', description: 'Business relocation', duration: '1-3 days', price: 'R5000+', popular: false, icon: <FaBriefcase className="text-purple-500" /> },
      { id: 'packing-service', name: 'Packing Service', description: 'Full packing assistance', duration: '4-6 hours', price: 'R1200', popular: true, icon: <FaBoxOpen className="text-orange-500" /> }
    ];

    const carWashOptions = [
      { id: 'basic-wash', name: 'Basic Wash', description: 'Exterior wash, wheels, and windows', duration: '30-45 min', price: 'R150', popular: true, icon: <FaCar className="text-blue-500" /> },
      { id: 'full-detail', name: 'Full Detail', description: 'Complete interior & exterior detailing', duration: '2-3 hours', price: 'R550', popular: true, icon: <FaBrush className="text-purple-500" /> },
      { id: 'interior-only', name: 'Interior Detail', description: 'Deep interior cleaning, seats, carpets', duration: '1-2 hours', price: 'R350', popular: false, icon: <FaBroomClean className="text-green-500" /> },
      { id: 'exterior-only', name: 'Exterior Detail', description: 'Wash, wax, polish, paint protection', duration: '1-2 hours', price: 'R300', popular: false, icon: <FaSprayCan className="text-orange-500" /> },
      { id: 'premium-package', name: 'Premium Package', description: 'Full detail + ceramic coating', duration: '4-5 hours', price: 'R1200', popular: false, icon: <FaTrophy className="text-yellow-500" /> },
      { id: 'engine-bay', name: 'Engine Bay Cleaning', description: 'Professional engine cleaning', duration: '45-60 min', price: 'R250', popular: false, icon: <FaTools className="text-red-500" /> },
      { id: 'headlight-restoration', name: 'Headlight Restoration', description: 'Restore cloudy headlights', duration: '30-45 min', price: 'R200', popular: false, icon: <FaCamera className="text-gray-500" /> },
      { id: 'paint-correction', name: 'Paint Correction', description: 'Remove swirls and scratches', duration: '3-5 hours', price: 'R800', popular: false, icon: <FaPalette className="text-pink-500" /> }
    ];

    switch (type) {
      case 'cleaning': return cleaningOptions;
      case 'catering': return cateringOptions;
      case 'moving': return movingOptions;
      case 'carWash': return carWashOptions;
      default: return cleaningOptions;
    }
  };

  // Vehicle type options for car wash services
  const vehicleTypeOptions = [
    { id: 'sedan', name: 'Sedan', icon: <FaCar className="text-blue-500" />, priceMultiplier: 1.0 },
    { id: 'suv', name: 'SUV', icon: <FaCar className="text-green-500" />, priceMultiplier: 1.3 },
    { id: 'van', name: 'Van', icon: <FaTruckIcon className="text-purple-500" />, priceMultiplier: 1.5 },
    { id: 'truck', name: 'Truck', icon: <FaTruckIcon className="text-orange-500" />, priceMultiplier: 1.8 },
    { id: 'motorcycle', name: 'Motorcycle', icon: <FaMotorcycle className="text-red-500" />, priceMultiplier: 0.6 }
  ];

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

  // Simulate AI assessment
  useEffect(() => {
    if (service) {
      simulateAiAssessment(service);
    }
  }, [service]);

  const simulateAiAssessment = (serviceData) => {
    setTimeout(() => {
      const description = serviceData.description || '';
      
      let descScore = 3;
      if (description.length > 200) descScore += 1;
      if (description.length > 500) descScore += 1;
      if (description.includes("experience") || description.includes("professional")) descScore += 0.5;
      if (description.includes("certified") || description.includes("insured")) descScore += 0.5;
      
      let imgScore = 0;
      if (serviceData.imageUrls?.length > 0) imgScore = 3;
      if (serviceData.imageUrls?.length > 2) imgScore = 4;
      if (serviceData.imageUrls?.length > 4) imgScore = 5;
      
      const overall = Math.min(5, (descScore + imgScore) / 2 + 0.5);
      
      setAiAssessment(prev => ({
        ...prev,
        descriptionQuality: descScore,
        imageQuality: imgScore,
        overallRating: overall,
        likes: Math.floor(Math.random() * 50) + 10,
        dislikes: Math.floor(Math.random() * 10)
      }));
    }, 1500);
  };

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

  const handleVehicleTypeSelect = (vehicleTypeId) => {
    setBookingData({ ...bookingData, vehicleType: vehicleTypeId });
  };

  // Calculate price based on vehicle type
  const calculatePriceWithMultiplier = (basePrice) => {
    const selectedVehicle = vehicleTypeOptions.find(v => v.id === bookingData.vehicleType);
    if (!selectedVehicle) return basePrice;
    
    // Extract numeric price
    const numericPrice = parseFloat(basePrice.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice)) return basePrice;
    
    const calculatedPrice = numericPrice * selectedVehicle.priceMultiplier;
    return `R${Math.round(calculatedPrice)}`;
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
      
      // Add vehicle information if it's a car wash service
      if (service.type === 'carWash') {
        message += `%0A*🚗 Vehicle Information:*%0A`;
        message += `*Type:* ${vehicleTypeOptions.find(v => v.id === bookingData.vehicleType)?.name || 'Not specified'}%0A`;
        if (bookingData.vehicleMake) message += `*Make:* ${bookingData.vehicleMake}%0A`;
        if (bookingData.vehicleModel) message += `*Model:* ${bookingData.vehicleModel}%0A`;
        if (bookingData.vehicleYear) message += `*Year:* ${bookingData.vehicleYear}%0A`;
        if (bookingData.licensePlate) message += `*License Plate:* ${bookingData.licensePlate}%0A`;
      }
      
      if (bookingData.address) {
        message += `*🏠 Address:* ${bookingData.address}%0A`;
      }
      
      if (bookingData.specialRequirements) {
        message += `*📝 Special Requirements:* ${bookingData.specialRequirements}%0A`;
      }
      
      if (bookingData.selectedServices.length > 0) {
        const serviceOptions = getServiceOptions(service.type);
        message += `%0A*🔧 Selected Services:*%0A`;
        bookingData.selectedServices.forEach(serviceId => {
          const serviceOption = serviceOptions.find(s => s.id === serviceId);
          if (serviceOption) {
            let price = serviceOption.price;
            // Apply vehicle type price multiplier for car wash services
            if (service.type === 'carWash' && bookingData.vehicleType) {
              price = calculatePriceWithMultiplier(serviceOption.price);
            }
            message += `• ${serviceOption.name} (${price})%0A`;
          }
        });
      }
      
      message += `%0A*📞 Client Phone:* ${bookingData.phone}%0A`;
      if (service.type === 'carWash') {
        message += `*👥 Number of Vehicles:* ${bookingData.numberOfGuests || '1'}%0A`;
      } else {
        message += `*👥 Number of Guests/Rooms:* ${bookingData.numberOfGuests}%0A`;
      }
      message += `%0APlease confirm this booking request.`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      setIsUploading(false);
      setShowBookingFormOverlay(false);
      
      // Reset booking data
      setBookingData({
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
        paymentMethod: 'cash',
        vehicleType: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        licensePlate: ''
      });
    }, 1500);
  };

  const handleQuickBooking = () => {
    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number first.");
      return;
    }
    
    const whatsappNumber = formatContactForWhatsApp(service.contact);
    let message = `*⚡ Quick Booking Request*%0A%0A*Service:* ${service.name}%0A*Client:* ${bookingData.name}%0A*Phone:* ${bookingData.phone}%0A`;
    
    if (service.type === 'carWash' && bookingData.vehicleType) {
      message += `*Vehicle:* ${vehicleTypeOptions.find(v => v.id === bookingData.vehicleType)?.name}%0A`;
    }
    
    message += `%0APlease contact me to schedule a booking.`;
    
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

  // Function to open full-page booking form overlay
  const openBookingFormOverlay = () => {
    setShowBookingFormOverlay(true);
    document.body.style.overflow = 'hidden';
  };

  // Function to close full-page booking form overlay
  const closeBookingFormOverlay = () => {
    setShowBookingFormOverlay(false);
    document.body.style.overflow = 'auto';
  };

  // Full screen gallery functions
  const openFullScreenGallery = (index = 0) => {
    setModalImageIndex(index);
    setShowFullScreenGallery(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullScreenGallery = () => {
    setShowFullScreenGallery(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (service.imageUrls && service.imageUrls.length > 0) {
      setModalImageIndex((prevIndex) => 
        prevIndex === service.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (service.imageUrls && service.imageUrls.length > 0) {
      setModalImageIndex((prevIndex) => 
        prevIndex === 0 ? service.imageUrls.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading service details...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching the best service provider for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-xl shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Error loading service profile</h3>
              <div className="mt-2 text-red-700">
                <p className="font-medium">{error}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-6">
            <FaTools className="text-gray-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Service not found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">The service you're looking for doesn't exist or may have been removed from our platform.</p>
          <button
            onClick={() => navigate('/service-home-page')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Other Services
          </button>
        </div>
      </div>
    );
  }

  const fullDescription = getServiceDescription(service.type, service);
  const displayText = showFullDescription ? fullDescription : fullDescription.slice(0, 350) + (fullDescription.length > 350 ? "..." : "");
  const serviceOptions = getServiceOptions(service.type);
  const displayedServices = showAllServices ? serviceOptions : serviceOptions.slice(0, 4);
  const whatsappNumber = formatContactForWhatsApp(service.contact);
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi ${service.name}, I'm interested in your ${getProfessionalTitle(service.type).toLowerCase()} services.`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <style jsx>{`
        footer {
          display: none !important;
        }
        
        .booking-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          overflow-y: auto;
          animation: fadeIn 0.3s ease-out;
        }
        
        .booking-overlay-content {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(40px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Full screen gallery styles */
        .fullscreen-gallery {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.97);
          backdrop-filter: blur(20px);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.3s ease-out;
        }
        
        .gallery-main-image {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem;
        }
        
        .gallery-main-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease;
        }
        
        .gallery-main-image img:hover {
          transform: scale(1.02);
        }
        
        /* Professional image styling */
        .professional-header-image {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        .professional-header-image:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
        }
        
        .professional-header-image::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);
          z-index: 1;
        }
        
        .professional-header-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        
        .professional-header-image:hover img {
          transform: scale(1.05);
        }
        
        .image-overlay-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          padding: 2rem;
          z-index: 2;
          color: white;
        }
        
        /* Image gallery grid */
        .image-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .gallery-thumbnail {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          aspect-ratio: 1;
        }
        
        .gallery-thumbnail:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }
        
        .gallery-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .gallery-thumbnail:hover img {
          transform: scale(1.1);
        }
        
        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .gallery-thumbnail:hover .thumbnail-overlay {
          opacity: 1;
        }
        
        /* Floating action buttons */
        .floating-action-button {
          position: fixed;
          right: 2rem;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
          z-index: 40;
        }
        
        .floating-action-button:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }
        
        /* Gradient backgrounds */
        .gradient-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(226, 232, 240, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .gradient-header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        }
        
        /* Elegant animations */
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Smooth hover effects */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
        
        /* Glass morphism effects */
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        
        /* Professional badge styling */
        .professional-badge {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
      `}</style>

      {/* Navigation Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-2 left-4 z-50 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 hover:scale-110"
        title="Go back"
      >
        <FaArrowLeft className="text-lg" />
      </button>

      {/* Floating WhatsApp Button */}
      <button
        onClick={openBookingFormOverlay}
        className="floating-action-button bottom-4"
        title="Book via WhatsApp"
      >
        <FaWhatsapp className="text-xl" />
      </button>

      {/* Full Screen Gallery Overlay */}
      {showFullScreenGallery && service.imageUrls && service.imageUrls.length > 0 && (
        <div className="fullscreen-gallery">
          <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <button
                onClick={closeFullScreenGallery}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-lg transition-all hover:scale-110"
              >
                <FaTimes className="text-xl" />
              </button>
              <div className="text-white text-lg font-medium">
                {service.name}'s Gallery
              </div>
            </div>
            <div className="text-white/80 font-medium">
              {modalImageIndex + 1} / {service.imageUrls.length}
            </div>
          </div>

          <div className="gallery-main-image">
            <img
              src={service.imageUrls[modalImageIndex]}
              alt={`Gallery image ${modalImageIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
              }}
            />
            
            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-8 z-40">
              <button 
                onClick={prevImage}
                className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-lg transition-all hover:scale-110"
              >
                <FaChevronLeft className="text-2xl" />
              </button>
              <button 
                onClick={nextImage}
                className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-lg transition-all hover:scale-110"
              >
                <FaChevronRight className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {service.imageUrls.length > 1 && (
            <div className="p-6 bg-black/50 backdrop-blur-lg border-t border-white/10">
              <Swiper
                modules={[FreeMode]}
                spaceBetween={12}
                slidesPerView="auto"
                freeMode={true}
                className="thumbs-swiper"
              >
                {service.imageUrls.map((url, index) => (
                  <SwiperSlide key={index} style={{ width: '100px' }}>
                    <div
                      className={`gallery-thumbnail ${index === modalImageIndex ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
                      onClick={() => setModalImageIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div className="thumbnail-overlay">
                        {index === modalImageIndex && (
                          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                            Active
                          </div>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      )}

      {/* Full Page Booking Form Overlay */}
      {showBookingFormOverlay && (
        <div className="booking-overlay">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="booking-overlay-content w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Overlay Header */}
              <div className="gradient-header p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-1xl font-bold text-white">
                      Book {getProfessionalTitle(service.type)} Services
                    </h2>
                  </div>
                  <button
                    onClick={closeBookingFormOverlay}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-90"
                    aria-label="Close booking form"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Booking Form Content */}
              <div className="p-8 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleBookingSubmit} className="space-y-8">
                  {/* Client Information */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Your Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={bookingData.name}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                          placeholder="071 234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information - Only for Car Wash */}
                  {service.type === 'carWash' && (
                    <div className="space-y-6">
                      <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Vehicle Information</h4>
                      
                      {/* Vehicle Type Selection */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Vehicle Type *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {vehicleTypeOptions.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              type="button"
                              onClick={() => handleVehicleTypeSelect(vehicle.id)}
                              className={`p-6 border-2 rounded-2xl text-center transition-all duration-300 hover-lift ${
                                bookingData.vehicleType === vehicle.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-3">
                                <div className="text-4xl">{vehicle.icon}</div>
                                <span className="text-sm font-semibold">{vehicle.name}</span>
                                <span className="text-xs text-gray-600">
                                  {vehicle.priceMultiplier === 1.0 ? 'Base Price' : 
                                   vehicle.priceMultiplier > 1.0 ? `+${Math.round((vehicle.priceMultiplier-1)*100)}%` : 
                                   `${Math.round((1-vehicle.priceMultiplier)*100)}% off`}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Vehicle Make (Brand)
                          </label>
                          <input
                            type="text"
                            name="vehicleMake"
                            value={bookingData.vehicleMake}
                            onChange={handleBookingChange}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                            placeholder="e.g., Toyota, BMW"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Vehicle Model
                          </label>
                          <input
                            type="text"
                            name="vehicleModel"
                            value={bookingData.vehicleModel}
                            onChange={handleBookingChange}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                            placeholder="e.g., Corolla, X5"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Vehicle Year
                          </label>
                          <input
                            type="text"
                            name="vehicleYear"
                            value={bookingData.vehicleYear}
                            onChange={handleBookingChange}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                            placeholder="e.g., 2020"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            License Plate
                          </label>
                          <input
                            type="text"
                            name="licensePlate"
                            value={bookingData.licensePlate}
                            onChange={handleBookingChange}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                            placeholder="e.g., ABC 123 GP"
                          />
                        </div>
                      </div>

                      {bookingData.vehicleType && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <p className="text-blue-800 text-sm">
                            <span className="font-semibold">Note:</span> Prices shown below are for sedan vehicles. 
                            {bookingData.vehicleType !== 'sedan' && 
                              ` Final prices will be adjusted based on your selected vehicle type (${vehicleTypeOptions.find(v => v.id === bookingData.vehicleType)?.name}).`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Schedule</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={bookingData.date}
                          onChange={handleBookingChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Time *
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={bookingData.time}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Options */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Service Location</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex items-center gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          bookingData.locationOption === 'comeToYou' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <input
                            type="radio"
                            name="locationOption"
                            value="comeToYou"
                            checked={bookingData.locationOption === 'comeToYou'}
                            onChange={handleBookingChange}
                            className="hidden"
                          />
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            bookingData.locationOption === 'comeToYou' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-400'
                          }`}>
                            {bookingData.locationOption === 'comeToYou' && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
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

                        <label className={`flex items-center gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          bookingData.locationOption === 'goToThem' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <input
                            type="radio"
                            name="locationOption"
                            value="goToThem"
                            checked={bookingData.locationOption === 'goToThem'}
                            onChange={handleBookingChange}
                            className="hidden"
                          />
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            bookingData.locationOption === 'goToThem' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-400'
                          }`}>
                            {bookingData.locationOption === 'goToThem' && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">At Provider's Location</div>
                            <div className="text-sm text-gray-600 mt-1">Visit their professional facility</div>
                          </div>
                        </label>
                      </div>

                      {bookingData.locationOption === 'comeToYou' && (
                        <div className="space-y-2 mt-4">
                          <label className="block text-sm font-semibold text-gray-700">
                            Your Address *
                          </label>
                          <textarea
                            name="address"
                            value={bookingData.address}
                            onChange={handleBookingChange}
                            required
                            rows={3}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                            placeholder="Enter your complete address..."
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Selection */}
                  {serviceOptions.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">
                        Select Services
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {displayedServices.map((serviceOption) => {
                          // Calculate price with vehicle type multiplier for car wash
                          let displayPrice = serviceOption.price;
                          if (service.type === 'carWash' && bookingData.vehicleType) {
                            displayPrice = calculatePriceWithMultiplier(serviceOption.price);
                          }
                          
                          return (
                            <button
                              key={serviceOption.id}
                              type="button"
                              onClick={() => handleServiceSelection(serviceOption.id)}
                              className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover-lift ${
                                bookingData.selectedServices.includes(serviceOption.id)
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-3">
                                <div className="text-3xl">{serviceOption.icon || <FaTools className="text-gray-500" />}</div>
                                <span className="text-sm font-semibold text-center">{serviceOption.name}</span>
                                <span className="text-xs font-bold text-gray-900">{displayPrice}</span>
                                {serviceOption.popular && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    Popular
                                  </span>
                                )}
                                {service.type === 'carWash' && bookingData.vehicleType && bookingData.vehicleType !== 'sedan' && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    Adjusted Price
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {serviceOptions.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllServices(!showAllServices)}
                          className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                        >
                          {showAllServices ? 'Show Less' : `Show All ${serviceOptions.length} Services`}
                          {showAllServices ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Additional Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {service.type === 'carWash' ? 'Number of Vehicles' : 'Number of People/Rooms'}
                        </label>
                        <input
                          type="number"
                          name="numberOfGuests"
                          value={bookingData.numberOfGuests}
                          onChange={handleBookingChange}
                          min="1"
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                          placeholder={service.type === 'carWash' ? "e.g., 1" : "e.g., 2"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Special Requirements (Optional)
                      </label>
                      <textarea
                        name="specialRequirements"
                        value={bookingData.specialRequirements}
                        onChange={handleBookingChange}
                        rows={3}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                        placeholder={service.type === 'carWash' ? 
                          "Any special requests, paint type, waterless wash preference, etc..." : 
                          "Any special requests, instructions, or notes..."}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className={`w-full py-6 px-8 rounded-2xl font-bold text-white text-xl transition-all duration-300 hover:shadow-2xl ${
                        isUploading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl'
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-lg">Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <FaWhatsapp className="text-2xl" />
                          <span>Submit Booking</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Professional Image */}
        <div className="mb-8 fade-in-up">
          <div className="professional-header-image h-96 relative">
            <img
              src={service.imageUrls?.[0] || (service.type === 'carWash' ? 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80' : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80')}
              alt={service.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            <div className="image-overlay-content">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{service.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="professional-badge">
                      <FaStar className="text-xs" /> {getProfessionalTitle(service.type)}
                    </span>
                    <div className="flex items-center gap-1 text-white/90">
                      <FaMapMarkerAlt />
                      <span>{service.address || 'Available in your area'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      <span className="text-white font-bold text-lg">{service.rating || '4.5'}</span>
                      <span className="text-white/80">({service.reviewCount || '25'} reviews)</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white font-bold text-lg">R{service.regularPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 overflow-hidden">
            {/* Professional Summary */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    <img
                      src={service.imageUrls?.[0] || (service.type === 'carWash' ? 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80')}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{service.name}</h2>
                      <p className="text-gray-600 mt-1 truncate">{getProfessionalTitle(service.type)}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 text-gray-700 truncate">
                          <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                          <span className="truncate">{service.address || 'Available in your area'}</span>
                        </div>
                        {service.contact && (
                          <div className="flex items-center gap-2 text-gray-700 truncate">
                            <FaPhone className="text-green-500 flex-shrink-0" />
                            <span className="truncate">{service.contact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={toggleFavorite}
                      className="mt-4 md:mt-0 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorite ? (
                        <FaHeart className="w-5 h-5 text-rose-600" />
                      ) : (
                        <FaRegHeart className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Verification Badges */}
                  <div className="flex flex-wrap gap-2 lg:gap-3 mt-4 lg:mt-6">
                    {service.security && (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaCheckCircle className="text-emerald-600" />
                        <span className="text-emerald-800 font-semibold text-xs lg:text-sm">Verified</span>
                      </div>
                    )}
                    
                    <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                      <FaStar className="text-yellow-500" />
                      <span className="text-blue-800 font-semibold text-xs lg:text-sm">
                        {service.rating ? `${service.rating} Rating` : 'Top Rated'}
                      </span>
                    </div>

                    {enhancedServiceData.yearsExperience && (
                      <div className="inline-flex items-center gap-2 bg-orange-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaBriefcase className="text-orange-600" />
                        <span className="text-orange-800 font-semibold text-xs lg:text-sm">
                          {enhancedServiceData.yearsExperience} Years Experience
                        </span>
                      </div>
                    )}

                    {service.type === 'carWash' && (
                      <div className="inline-flex items-center gap-2 bg-sky-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaCar className="text-sky-600" />
                        <span className="text-sky-800 font-semibold text-xs lg:text-sm">
                          Eco-Friendly Products
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {service.imageUrls && service.imageUrls.length > 0 && (
              <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">Photo Gallery</h3>
                  <button
                    onClick={() => openFullScreenGallery(0)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaExpand />
                    <span>View All</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {service.imageUrls.slice(0, 4).map((url, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
                      onClick={() => openFullScreenGallery(index)}
                    >
                      <img
                        src={url}
                        alt={`${service.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = service.type === 'carWash' 
                            ? 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=400&q=80'
                            : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          View
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {service.imageUrls.length > 4 && (
                    <div
                      className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
                      onClick={() => openFullScreenGallery(4)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-xl lg:text-2xl font-bold">+{service.imageUrls.length - 4}</div>
                          <div className="text-xs lg:text-sm">More Photos</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                  About This Service
                </h3>
                {fullDescription.length > 350 && (
                  <button
                    onClick={toggleDescription}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    {showFullDescription ? (
                      <>
                        <FaArrowUp />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FaArrowDown />
                        Read More
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="text-gray-700 leading-relaxed text-base lg:text-lg">
                {displayText.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 lg:mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">Service Statistics</h3>
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
            </div>

            {/* AI Assessment Section */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <FaRobot className="text-white text-sm lg:text-base" />
                  </div>
                  AI Quality Assessment
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`p-2 lg:p-3 rounded-full transition-all duration-300 ${
                      aiAssessment.userReaction === 'like'
                        ? 'bg-green-100 text-green-600 shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <FaArrowUp className="text-sm lg:text-lg" />
                  </button>
                  <span className="font-bold text-gray-800">{aiAssessment.likes}</span>
                  <button
                    onClick={handleDislike}
                    className={`p-2 lg:p-3 rounded-full transition-all duration-300 ${
                      aiAssessment.userReaction === 'dislike'
                        ? 'bg-red-100 text-red-600 shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <FaArrowDown className="text-sm lg:text-lg" />
                  </button>
                  <span className="font-bold text-gray-800">{aiAssessment.dislikes}</span>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                {/* Overall Rating */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-lg lg:text-2xl font-bold text-white">
                        {aiAssessment.overallRating?.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base lg:text-lg">Overall Quality Score</h4>
                      <p className="text-gray-600 text-sm lg:text-base">Based on content and media analysis</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-end gap-1 mb-1 lg:mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-sm lg:text-xl ${
                            star <= Math.floor(aiAssessment.overallRating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm lg:text-base">
                      {aiAssessment.overallRating?.toFixed(1)} out of 5
                    </span>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="p-4 lg:p-6 bg-white border-2 border-gray-200 rounded-2xl hover-lift">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <span className="font-bold text-gray-900 text-sm lg:text-base">Description Quality</span>
                      <span className="text-lg lg:text-xl font-bold text-blue-600">
                        {aiAssessment.descriptionQuality}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 lg:h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(aiAssessment.descriptionQuality / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500 mt-2 lg:mt-3">
                      Based on detail level and professionalism
                    </p>
                  </div>

                  <div className="p-4 lg:p-6 bg-white border-2 border-gray-200 rounded-2xl hover-lift">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <span className="font-bold text-gray-900 text-sm lg:text-base">Media Quality</span>
                      <span className="text-lg lg:text-xl font-bold text-blue-600">
                        {aiAssessment.imageQuality}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 lg:h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(aiAssessment.imageQuality / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500 mt-2 lg:mt-3">
                      Based on image quantity and clarity
                    </p>
                  </div>
                </div>

                {/* Quality Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
                  {service.security && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaCheckCircle className="text-emerald-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-emerald-800 text-xs lg:text-sm">Verified</span>
                    </div>
                  )}
                  {service.imageUrls?.length >= 3 && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaFileImage className="text-blue-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-blue-800 text-xs lg:text-sm">Rich Media</span>
                    </div>
                  )}
                  {fullDescription.length > 200 && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaUser className="text-purple-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-purple-800 text-xs lg:text-sm">Detailed Info</span>
                    </div>
                  )}
                  {enhancedServiceData.yearsExperience >= 2 && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaBriefcase className="text-orange-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-orange-800 text-xs lg:text-sm">Experienced</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">Customer Reviews</h3>
                <button
                  onClick={() => setShowCommentsPanel(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  View All ({commentCount})
                </button>
              </div>
              <Comment 
                serviceId={service._id} 
                maxComments={3}
                onTotalComments={setCommentCount} 
                cardStyle={true}
              />
            </div>
          </div>

          {/* Right Column - Booking & Info */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Booking Card */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 sticky top-4 lg:top-8 fade-in-up overflow-hidden">
              <div className="text-center mb-4 lg:mb-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg">
                  <FaWhatsapp className="text-white text-lg lg:text-2xl" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Book Now</h3>
                <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">Instant booking via WhatsApp</p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">R{service.regularPrice}</div>
                  {service.discountPrice && (
                    <p className="text-gray-500 line-through text-sm lg:text-base">R{service.discountPrice}</p>
                  )}
                  {service.travelFee > 0 && (
                    <p className="text-orange-600 text-sm lg:text-base mt-1">+ R{service.travelFee} travel fee</p>
                  )}
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <button
                    onClick={openBookingFormOverlay}
                    className="w-full py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-base lg:text-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    Book via WhatsApp
                  </button>
                  
                  <button
                    onClick={handleQuickBooking}
                    disabled={!whatsappLink}
                    className={`w-full py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all duration-300 ${
                      whatsappLink 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-[1.02]' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Quick Inquiry
                  </button>
                </div>

                <div className="pt-4 lg:pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600">
                    <span>Response Time</span>
                    <span className="font-semibold">{enhancedServiceData.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mt-2">
                    <span>Availability</span>
                    <span className="font-semibold">{enhancedServiceData.availability}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Contact Information</h3>
              
              <div className="space-y-4 lg:space-y-6">
                {service.contact && (
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-blue-600 text-base lg:text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Phone Number</p>
                      <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{service.contact}</p>
                    </div>
                  </div>
                )}

                {service.address && (
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-green-600 text-base lg:text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Location</p>
                      <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{service.address || 'Available in your area'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-purple-600 text-base lg:text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-gray-900 text-sm lg:text-base">{enhancedServiceData.responseTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaShieldAlt className="text-white text-base lg:text-xl" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">Key Features</h3>
                  <p className="text-gray-600 text-xs lg:text-sm">What makes us stand out</p>
                </div>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Insured & Certified professionals</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>On-time guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Satisfaction guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Free cancellation</span>
                </div>
              </div>

              <Link
                to="/safety"
                className="mt-4 lg:mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm lg:text-base"
              >
                <span>Learn more about safety</span>
                <FaArrowRight />
              </Link>
            </div>

            {/* Vehicle Types Card (Only for Car Wash) */}
            {service.type === 'carWash' && (
              <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaCar className="text-white text-base lg:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">Vehicle Types</h3>
                    <p className="text-gray-600 text-xs lg:text-sm">Pricing varies by vehicle size</p>
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  {vehicleTypeOptions.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="text-xl text-blue-600">{vehicle.icon}</div>
                        <span className="font-medium text-gray-800">{vehicle.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {vehicle.priceMultiplier === 1.0 ? 'Base Price' : 
                         vehicle.priceMultiplier > 1.0 ? `+${Math.round((vehicle.priceMultiplier-1)*100)}%` : 
                         `${Math.round((1-vehicle.priceMultiplier)*100)}% off`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Booking Belt */}
      <div className={`sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transition-transform duration-500 ${
        showBookingBelt ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={service?.imageUrls?.[0] || (service?.type === 'carWash' ? 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=100&q=80' : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=100&q=80')}
                alt={service?.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 truncate">{service?.name}</h3>
                <p className="text-gray-600 truncate">{getProfessionalTitle(service?.type)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-gray-800">{service?.rating || '4.5'}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-700">R{service?.regularPrice}</span>
                  {service?.travelFee > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-orange-600 font-medium">+R{service.travelFee} travel</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={openBookingFormOverlay}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <FaWhatsapp className="text-xl" />
                <span>Book Now</span>
              </button>

              <button
                onClick={toggleFavorite}
                className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
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