// Services.jsx - Airbnb-Style Professional Design
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaWhatsapp,
  FaArrowLeft, FaClock, FaExclamationTriangle,
  FaTools, FaShieldAlt, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaImages,
  FaRegHeart, FaHeart, FaShare, FaUser,
  FaChevronLeft, FaChevronRight, FaCheck,
  FaTimes, FaInfoCircle, FaAward, FaGraduationCap,
  FaBriefcase, FaUtensils, FaUsers, FaCalendarAlt,
  FaHome, FaCar, FaSprayCan, FaBroom, FaTruck,
  FaMotorcycle, FaCookie, FaGlassCheers, FaRing,
  FaPalette, FaTrophy, FaCommentDots, FaArrowRight,
  FaSpinner
} from 'react-icons/fa';
import { FiShare2, FiMessageSquare } from 'react-icons/fi';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Full screen gallery states
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: ''
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

  // Calculate total price
  useEffect(() => {
    if (service) {
      const basePrice = parseInt(service.regularPrice) || 0;
      const travelFee = parseInt(service.travelFee) || 0;
      const serviceFee = Math.round(basePrice * 0.1);
      setTotalPrice(basePrice + travelFee + serviceFee);
    }
  }, [service]);

  const getProfessionalTitle = (type) => {
    const titles = {
      cleaning: 'Cleaning Service',
      catering: 'Chef & Catering',
      moving: 'Moving Service',
      landscaping: 'Landscaping',
      daycare: 'Child Care',
      schoolTransport: 'Transport Service',
      maintenance: 'Home Repair',
      carWash: 'Car Detailing',
      default: 'Professional Service'
    };
    return titles[type] || titles.default;
  };

  const getServiceDescription = (type, serviceData) => {
    const baseDescription = serviceData.description || 'Professional service provider with years of experience.';
    const additionalInfo = {
      cleaning: `Professional cleaning service using eco-friendly products. Background-checked staff following strict safety protocols.`,
      catering: `From intimate gatherings to grand celebrations, crafting memorable dining experiences with custom menus using fresh, locally sourced ingredients.`,
      moving: `Stress-free moving with professional packing, furniture handling, and transportation. Experienced team with proper equipment.`,
      carWash: `Premium car wash and detailing using high-quality, eco-friendly products. From sedans to trucks - exterior wash, interior detailing, waxing, and paint protection.`,
      default: `Professional service with attention to detail and customer satisfaction as top priority.`
    };
    return baseDescription + (additionalInfo[type] || additionalInfo.default);
  };

  const getServiceOptions = (type) => {
    const cleaningOptions = [
      { id: 'house-cleaning', name: 'Standard Cleaning', description: 'Complete cleaning of living areas', duration: '2-4 hours', price: 'R450', popular: true, icon: <FaBroom /> },
      { id: 'deep-cleaning', name: 'Deep Cleaning', description: 'Intensive detailed cleaning', duration: '4-6 hours', price: 'R850', popular: false, icon: <FaBroom /> },
      { id: 'office-cleaning', name: 'Office Cleaning', description: 'Commercial space cleaning', duration: '3-5 hours', price: 'R650', popular: true, icon: <FaBriefcase /> },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning', description: 'Professional steam cleaning', duration: '2-3 hours', price: 'R350', popular: false, icon: <FaTools /> }
    ];

    const cateringOptions = [
      { id: 'corporate-catering', name: 'Corporate Events', description: 'Business meetings & lunches', duration: 'Custom', price: 'R150/person', popular: true, icon: <FaBriefcase /> },
      { id: 'wedding-catering', name: 'Wedding Catering', description: 'Full wedding service', duration: 'Custom', price: 'R350/person', popular: false, icon: <FaRing /> },
      { id: 'private-events', name: 'Private Events', description: 'Personal celebrations', duration: 'Custom', price: 'R200/person', popular: true, icon: <FaGlassCheers /> },
      { id: 'meal-prep', name: 'Meal Preparation', description: 'Weekly meal preparation', duration: 'Weekly', price: 'R800/week', popular: false, icon: <FaUtensils /> }
    ];

    const movingOptions = [
      { id: 'local-moving', name: 'Local Moving', description: 'Within 50km radius', duration: '4-8 hours', price: 'R1800', popular: true, icon: <FaTruck /> },
      { id: 'long-distance', name: 'Long Distance', description: 'Cross-province moves', duration: 'Custom', price: 'Custom Quote', popular: false, icon: <FaCar /> },
      { id: 'office-moving', name: 'Office Moving', description: 'Business relocation', duration: '1-3 days', price: 'R5000+', popular: false, icon: <FaBriefcase /> },
      { id: 'packing-service', name: 'Packing Service', description: 'Full packing assistance', duration: '4-6 hours', price: 'R1200', popular: true, icon: <FaTools /> }
    ];

    const carWashOptions = [
      { id: 'basic-wash', name: 'Basic Wash', description: 'Exterior wash, wheels, windows', duration: '30-45 min', price: 'R150', popular: true, icon: <FaCar /> },
      { id: 'full-detail', name: 'Full Detail', description: 'Complete interior & exterior', duration: '2-3 hours', price: 'R550', popular: true, icon: <FaSprayCan /> },
      { id: 'interior-only', name: 'Interior Detail', description: 'Deep interior cleaning', duration: '1-2 hours', price: 'R350', popular: false, icon: <FaBroom /> },
      { id: 'exterior-only', name: 'Exterior Detail', description: 'Wash, wax, polish', duration: '1-2 hours', price: 'R300', popular: false, icon: <FaSprayCan /> },
      { id: 'premium-package', name: 'Premium Package', description: 'Full detail + ceramic coating', duration: '4-5 hours', price: 'R1200', popular: false, icon: <FaTrophy /> }
    ];

    switch (type) {
      case 'cleaning': return cleaningOptions;
      case 'catering': return cateringOptions;
      case 'moving': return movingOptions;
      case 'carWash': return carWashOptions;
      default: return cleaningOptions;
    }
  };

  const vehicleTypeOptions = [
    { id: 'sedan', name: 'Sedan', icon: <FaCar />, priceMultiplier: 1.0 },
    { id: 'suv', name: 'SUV', icon: <FaCar />, priceMultiplier: 1.3 },
    { id: 'van', name: 'Van', icon: <FaTruck />, priceMultiplier: 1.5 },
    { id: 'truck', name: 'Truck', icon: <FaTruck />, priceMultiplier: 1.8 },
    { id: 'motorcycle', name: 'Motorcycle', icon: <FaMotorcycle />, priceMultiplier: 0.6 }
  ];

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
        console.error('Error reading wishlist:', error);
      }
    }
  }, [service]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
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

  const handleVehicleTypeSelect = (vehicleTypeId) => {
    setBookingData({ ...bookingData, vehicleType: vehicleTypeId });
  };

  const calculatePriceWithMultiplier = (basePrice) => {
    const selectedVehicle = vehicleTypeOptions.find(v => v.id === bookingData.vehicleType);
    if (!selectedVehicle) return basePrice;
    const numericPrice = parseFloat(basePrice.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice)) return basePrice;
    const calculatedPrice = numericPrice * selectedVehicle.priceMultiplier;
    return `R${Math.round(calculatedPrice)}`;
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
      console.error('Error updating wishlist:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: `Check out ${service.name} on loopOut`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

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

  const openBookingModal = (serviceOption = null) => {
    setSelectedService(serviceOption);
    setShowBookingModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    document.body.style.overflow = 'auto';
  };

  const handleQuickBooking = () => {
    if (!service?.contact) {
      alert("Service contact information is missing.");
      return;
    }

    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number first.");
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      alert("Please select date and time for your booking.");
      return;
    }

    const whatsappNumber = formatContactForWhatsApp(service.contact);
    
    let message = `*📅 Quick Booking Request for ${service.name}*%0A%0A`;
    message += `*👤 Client Details*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    
    if (service.type === 'carWash' && bookingData.vehicleType) {
      message += `%0A*🚗 Vehicle Details*%0A`;
      message += `• Type: ${vehicleTypeOptions.find(v => v.id === bookingData.vehicleType)?.name}%0A`;
    }
    
    if (bookingData.address) {
      message += `%0A*📍 Service Location*%0A`;
      message += `• Address: ${bookingData.address}%0A`;
    }
    
    if (bookingData.specialRequirements) {
      message += `%0A*📝 Special Requests*%0A`;
      message += `• ${bookingData.specialRequirements}%0A`;
    }
    
    message += `%0A*💰 Total: R${totalPrice}*%0A%0A`;
    message += `_Sent via loopOut Quick Booking_`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const whatsappNumber = formatContactForWhatsApp(service.contact);
    let message = `*New Booking Request*%0A%0A`;
    message += `*Service:* ${service.name}%0A`;
    message += `*Client:* ${bookingData.name}%0A`;
    message += `*Phone:* ${bookingData.phone}%0A`;
    message += `*Date:* ${bookingData.date}%0A`;
    message += `*Time:* ${bookingData.time}%0A`;
    
    if (service.type === 'carWash' && bookingData.vehicleType) {
      message += `%0A*Vehicle:* ${vehicleTypeOptions.find(v => v.id === bookingData.vehicleType)?.name}%0A`;
      if (bookingData.vehicleMake) message += `*Make:* ${bookingData.vehicleMake}%0A`;
      if (bookingData.licensePlate) message += `*Plate:* ${bookingData.licensePlate}%0A`;
    }
    
    if (selectedService) {
      message += `%0A*Selected:* ${selectedService.name}%0A`;
    }
    
    if (bookingData.address) message += `*Address:* ${bookingData.address}%0A`;
    if (bookingData.specialRequirements) message += `*Notes:* ${bookingData.specialRequirements}%0A`;
    
    message += `%0A*💰 Total: R${totalPrice}*%0A%0A`;
    message += `_Sent via loopOut_`;
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    setIsUploading(false);
    closeBookingModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-red-600 underline">Try Again</button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Service not found</h2>
        <button onClick={() => navigate('/service-home-page')} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg">
          Browse Services
        </button>
      </div>
    );
  }

  const fullDescription = getServiceDescription(service.type, service);
  const displayText = showFullDescription ? fullDescription : fullDescription.slice(0, 300) + (fullDescription.length > 300 ? "..." : "");
  const serviceOptions = getServiceOptions(service.type);
  const displayedServices = showAllServices ? serviceOptions : serviceOptions.slice(0, 4);
  const whatsappNumber = formatContactForWhatsApp(service.contact);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-900' : 'hover:bg-white/20 text-white'}`}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-900' : 'hover:bg-white/20 text-white'}`}
              >
                <FiShare2 className="text-xl" />
              </button>
              <button 
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}
              >
                {isFavorite ? (
                  <FaHeart className="text-xl text-rose-500" />
                ) : (
                  <FaRegHeart className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Image Gallery - Airbnb Style */}
      <div className="relative h-[50vh] md:h-[60vh] bg-gray-900">
        {service.imageUrls && service.imageUrls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-full p-2">
            {/* Main Large Image */}
            <div 
              className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => openFullScreenGallery(0)}
            >
              <img
                src={service.imageUrls[0]}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            
            {/* Side Images */}
            {service.imageUrls.slice(1, 5).map((url, index) => (
              <div 
                key={index}
                className="relative rounded-xl overflow-hidden cursor-pointer group hidden md:block"
                onClick={() => openFullScreenGallery(index + 1)}
              >
                <img
                  src={url}
                  alt={`${service.name} ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
            
            {/* Show All Photos Button */}
            <button
              onClick={() => openFullScreenGallery(0)}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
            >
              <FaImages />
              Show all photos
            </button>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FaImages className="text-6xl text-gray-400" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{service.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <FaStar className="text-rose-500" />
                  <span className="font-semibold text-gray-900">{service.rating || '4.5'}</span>
                  <span>({service.reviewCount || '0'} reviews)</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  {service.address || 'Available in your area'}
                </span>
                <span>•</span>
                <span className="font-medium">{getProfessionalTitle(service.type)}</span>
              </div>
            </div>

            {/* Provider Info Card */}
            <div className="flex items-start gap-4 py-6 border-b border-gray-200">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={service.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Hosted by {service.name}</h2>
                <p className="text-gray-600">{getProfessionalTitle(service.type)}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {service.security && (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <FaCheckCircle className="text-emerald-500" /> Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <FaBriefcase className="text-gray-400" /> {enhancedServiceData.yearsExperience}+ years exp
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="py-6 border-b border-gray-200 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FaHome className="text-xl text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Provided at your location</h3>
                  <p className="text-gray-600 text-sm">Service provider travels to you</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FaClock className="text-xl text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{enhancedServiceData.responseTime}</h3>
                  <p className="text-gray-600 text-sm">Average response time</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FaShieldAlt className="text-xl text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Insured & Certified</h3>
                  <p className="text-gray-600 text-sm">Background checked professionals</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this service</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {displayText.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {fullDescription.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-4 font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 flex items-center gap-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                  {showFullDescription ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}
            </div>

            {/* What You'll Get - Service Options */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Service options</h2>
              <div className="space-y-4">
                {displayedServices.map((option, index) => (
                  <div 
                    key={option.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => openBookingModal(option)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{option.name}</h3>
                        {option.popular && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                      <p className="text-gray-500 text-sm">{option.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{option.price}</p>
                      <button className="mt-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {serviceOptions.length > 4 && (
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="mt-4 font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 flex items-center gap-2"
                >
                  {showAllServices ? 'Show less' : `Show all ${serviceOptions.length} options`}
                  {showAllServices ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}
            </div>

            {/* Qualifications */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Qualifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <FaBriefcase className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{enhancedServiceData.yearsExperience} years of experience</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional experience in {getProfessionalTitle(service.type).toLowerCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaAward className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Certified Professional</h3>
                    <p className="text-gray-600 text-sm mt-1">Licensed and insured service provider</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaUsers className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Notable Clientele</h3>
                    <p className="text-gray-600 text-sm mt-1">Trusted by repeat customers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaGraduationCap className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trained & Certified</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional training completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaStar className="text-rose-500" />
                  {service.rating || '4.5'} · {commentCount || service.reviewCount || '0'} reviews
                </h2>
                {commentCount > 3 && (
                  <button 
                    onClick={() => setShowCommentsPanel(true)}
                    className="font-semibold text-gray-900 underline underline-offset-4"
                  >
                    Show all reviews
                  </button>
                )}
              </div>
              <Comment 
                serviceId={service._id} 
                maxComments={3}
                onTotalComments={setCommentCount}
                cardStyle={true}
              />
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-2xl font-semibold text-gray-900">R{service.regularPrice}</span>
                    <span className="text-gray-600"> / service</span>
                  </div>
                  {service.discountPrice && (
                    <span className="text-gray-400 line-through">R{service.discountPrice}</span>
                  )}
                </div>

                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Date</label>
                      <input 
                        type="date" 
                        className="w-full text-sm text-gray-600 outline-none"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Time</label>
                      <input 
                        type="time" 
                        className="w-full text-sm text-gray-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-900 uppercase">Guests</label>
                    <select className="w-full text-sm text-gray-600 outline-none bg-transparent">
                      <option>1 guest</option>
                      <option>2 guests</option>
                      <option>3 guests</option>
                      <option>4+ guests</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => openBookingModal()}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors mb-4"
                >
                  Check availability
                </button>

                <div className="text-center text-gray-500 text-sm mb-4">You won't be charged yet</div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="underline">Service fee</span>
                    <span>R{Math.round(service.regularPrice * 0.1)}</span>
                  </div>
                  {service.travelFee > 0 && (
                    <div className="flex justify-between">
                      <span className="underline">Travel fee</span>
                      <span>R{service.travelFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold text-gray-900">
                    <span>Total</span>
                    <span>R{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white">
                <h3 className="font-semibold text-gray-900 mb-4">Contact provider</h3>
                <div className="space-y-3">
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Hi ${service.name}, I'm interested in your services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      <FaWhatsapp className="text-green-600 text-xl" />
                      Message on WhatsApp
                    </a>
                  )}
                  {service.contact && (
                    <a
                      href={`tel:${service.contact}`}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 rounded-lg font-medium hover:border-gray-900 transition-colors"
                    >
                      <FaPhone />
                      Call {service.contact}
                    </a>
                  )}
                </div>
              </div>

              {/* Protection Notice */}
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <FaShieldAlt className="text-2xl flex-shrink-0" />
                <p>To help protect your payment, always communicate and pay through our platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Things to Know Section */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Things to know</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Guest requirements</h3>
              <p className="text-gray-600 text-sm">Ages 13 and up can attend. Message for specific requirements.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cancellation policy</h3>
              <p className="text-gray-600 text-sm">Cancel at least 24 hours before for a full refund.</p>
              <button className="text-gray-900 font-semibold underline mt-2 text-sm">Learn more</button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What to bring</h3>
              <p className="text-gray-600 text-sm">Any specific materials or access requirements will be discussed upon booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery */}
      {showFullScreenGallery && service.imageUrls && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={closeFullScreenGallery} className="p-2 hover:bg-white/10 rounded-full">
              <FaTimes className="text-2xl" />
            </button>
            <span className="font-medium">{modalImageIndex + 1} / {service.imageUrls.length}</span>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <button 
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            
            <img
              src={service.imageUrls[modalImageIndex]}
              alt={`Gallery ${modalImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            <button 
              onClick={nextImage}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Complete your booking</h2>
              <button onClick={closeBookingModal} className="p-2 hover:bg-gray-100 rounded-full">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedService && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedService.price}</p>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleBookingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleBookingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="071 234 5678"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={bookingData.time}
                      onChange={handleBookingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {service.type === 'carWash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {vehicleTypeOptions.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => handleVehicleTypeSelect(vehicle.id)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            bookingData.vehicleType === vehicle.id
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-2xl mb-1">{vehicle.icon}</div>
                          <div className="text-xs font-medium">{vehicle.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={bookingData.address}
                    onChange={handleBookingChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special requests (optional)</label>
                  <textarea
                    name="specialRequirements"
                    value={bookingData.specialRequirements}
                    onChange={handleBookingChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Any special requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaWhatsapp />
                      Send booking request
                    </>
                  )}
                </button>
              </form>
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

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">R{totalPrice}</span>
            <span className="text-gray-600 text-sm"> / service</span>
          </div>
          <button 
            onClick={handleQuickBooking}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;