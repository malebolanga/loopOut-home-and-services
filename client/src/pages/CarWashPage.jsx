/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaUser,
  FaClock, FaShieldAlt, FaDog, FaUsers,
  FaGraduationCap, FaWhatsapp,
  FaExclamationTriangle, FaCheckCircle,
  FaRobot, FaArrowLeft,
  FaBandcamp, FaCut, FaTools, FaCar,
  FaInfoCircle, FaMoneyBillWave, FaTimes,
  FaFileImage, FaFilePdf, FaUserFriends, FaBroom, FaArrowUp, FaArrowDown,
  FaCalendar, FaEnvelope, FaBriefcase, FaAward,
  FaTshirt, FaBroom as FaBroomClean, FaFire, FaBaby, FaGlassCheers, FaEllipsisH,
  FaPalette, FaSpa, FaHandSparkles, FaHandHoldingHeart, FaRing,
  FaBrush, FaSprayCan, FaSmile, FaUtensils, FaShoppingBasket, FaCookie,
  FaInstagram, FaFacebook, FaCheck, FaTimes as FaTimesCircle, FaSpinner,
  FaLinkedin, FaTwitter, FaCamera, FaHome,
  FaExpand, FaCompress, FaChevronLeft, FaChevronRight, FaArrowRight,
  FaUtensilSpoon, FaMugHot, FaWineGlassAlt, FaConciergeBell, FaLeaf, FaSnowflake,
  FaBoxOpen, FaShippingFast, FaRecycle, FaSeedling, FaFish, FaDrumstickBite,
  FaPepperHot, FaCheese, FaBreadSlice, FaIceCream, FaCoffee, FaWineBottle,
  FaWater, FaWind, FaSun, FaCloudRain, FaTemperatureHigh, FaTemperatureLow,
  FaSoap, FaTint, FaCarSide, FaOilCan, FaSprayCan as FaSprayCanIcon,
  FaWrench, FaGasPump, FaRegSnowflake, FaFan, FaFilter, FaEraser
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

import HelperComments from '../components/HelperComments';
import CommentsSidePanelHelper from '../components/CommentsSidePanelHelper';

export default function CarWashPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [carWash, setCarWash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showBookingBelt, setShowBookingBelt] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Full page overlay state for booking form
  const [showBookingFormOverlay, setShowBookingFormOverlay] = useState(false);

  // Full screen gallery states
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Enhanced Location States
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    formattedAddress: '',
    placeId: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa'
  });

  // Social Media Verification States
  const [socialMediaVerification, setSocialMediaVerification] = useState({
    facebook: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      followers: null,
      verificationStatus: 'checking'
    },
    instagram: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      followers: null,
      verificationStatus: 'checking'
    }
  });
  const [verifyingSocialMedia, setVerifyingSocialMedia] = useState(false);

  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    selectedServices: [],
    serviceDescription: '',
    locationOption: 'comeToYou',
    address: '',
    date: '',
    time: '',
    message: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    specialRequirements: '',
    washType: '',
    interiorCleaning: 'no',
    exteriorCleaning: 'yes',
    waxService: 'no',
    polishService: 'no',
    engineCleaning: 'no',
    underbodyCleaning: 'no',
    tireShine: 'no',
    headlightRestoration: 'no',
    ceramicCoating: 'no',
    odorRemoval: 'no',
    addressProvided: '',
    waterSource: 'client',
    electricityAccess: 'yes',
    parkingAvailable: 'yes',
    otherDetails: ''
  });

  // Helper function to get professional title
  const getProfessionalTitle = (type) => {
    const titles = {
      carwash: 'Car Wash Professional',
      detailer: 'Auto Detailer',
      valeter: 'Car Valeter',
      default: 'Car Care Professional'
    };
    return titles[type] || titles.default;
  };

  // Car wash service options
  const carWashServices = [
    { 
      id: 'exterior-wash', 
      name: 'Exterior Wash', 
      description: 'Complete exterior hand wash',
      price: 120,
      icon: <FaSoap className="text-blue-500" />,
      popular: true
    },
    { 
      id: 'interior-vacuum', 
      name: 'Interior Vacuum', 
      description: 'Deep interior vacuum cleaning',
      price: 80,
      icon: <FaBroomClean className="text-green-500" />,
      popular: true
    },
    { 
      id: 'full-detail', 
      name: 'Full Detail', 
      description: 'Complete interior & exterior detail',
      price: 350,
      icon: <FaTools className="text-purple-500" />,
      popular: true
    },
    { 
      id: 'wax-polish', 
      name: 'Wax & Polish', 
      description: 'Protective wax and hand polish',
      price: 200,
      icon: <FaSprayCanIcon className="text-yellow-500" />,
      popular: false
    },
    { 
      id: 'engine-clean', 
      name: 'Engine Bay Cleaning', 
      description: 'Degrease and detail engine bay',
      price: 180,
      icon: <FaOilCan className="text-orange-500" />,
      popular: false
    },
    { 
      id: 'carpet-shampoo', 
      name: 'Carpet Shampoo', 
      description: 'Deep carpet shampoo treatment',
      price: 150,
      icon: <FaEraser className="text-indigo-500" />,
      popular: false
    },
    { 
      id: 'leather-treatment', 
      name: 'Leather Treatment', 
      description: 'Clean and condition leather',
      price: 180,
      icon: <FaFan className="text-pink-500" />,
      popular: false
    },
    { 
      id: 'headlight-restore', 
      name: 'Headlight Restoration', 
      description: 'Restore cloudy headlights',
      price: 220,
      icon: <FaCamera className="text-cyan-500" />,
      popular: false
    },
    { 
      id: 'ceramic-coating', 
      name: 'Ceramic Coating', 
      description: 'Premium ceramic paint protection',
      price: 1200,
      icon: <FaRegSnowflake className="text-blue-400" />,
      popular: false
    },
    { 
      id: 'odor-removal', 
      name: 'Odor Removal', 
      description: 'Ozone treatment for odors',
      price: 250,
      icon: <FaWind className="text-teal-500" />,
      popular: false
    },
    { 
      id: 'tire-shine', 
      name: 'Tire Shine', 
      description: 'Tire cleaning and dressing',
      price: 60,
      icon: <FaCar className="text-gray-600" />,
      popular: false
    },
    { 
      id: 'underbody-wash', 
      name: 'Underbody Wash', 
      description: 'Under carriage pressure wash',
      price: 140,
      icon: <FaWater className="text-blue-300" />,
      popular: false
    }
  ];

  // Vehicle types
  const vehicleTypes = [
    { id: 'sedan', name: 'Sedan', multiplier: 1.0 },
    { id: 'hatchback', name: 'Hatchback', multiplier: 1.0 },
    { id: 'suv', name: 'SUV', multiplier: 1.3 },
    { id: '4x4', name: '4x4', multiplier: 1.4 },
    { id: 'bakkie', name: 'Bakkie/Pickup', multiplier: 1.3 },
    { id: 'minivan', name: 'Minivan', multiplier: 1.4 },
    { id: 'truck', name: 'Light Truck', multiplier: 1.8 },
    { id: 'luxury', name: 'Luxury/Executive', multiplier: 1.5 }
  ];

  // Wash packages
  const washPackages = [
    {
      id: 'basic',
      name: 'Basic Wash',
      description: 'Exterior wash & hand dry',
      basePrice: 120,
      includes: ['Exterior wash', 'Hand dry', 'Tire shine', 'Window clean'],
      icon: <FaCar className="text-blue-500" />
    },
    {
      id: 'standard',
      name: 'Standard Detail',
      description: 'Exterior + interior vacuum',
      basePrice: 200,
      includes: ['Exterior wash', 'Hand dry', 'Interior vacuum', 'Window clean', 'Tire shine'],
      icon: <FaCarSide className="text-green-500" />
    },
    {
      id: 'premium',
      name: 'Premium Detail',
      description: 'Complete interior & exterior',
      basePrice: 350,
      includes: ['Exterior wash', 'Wax polish', 'Interior vacuum', 'Carpet shampoo', 'Leather treat', 'Tire shine', 'Engine bay clean'],
      icon: <FaTools className="text-purple-500" />
    },
    {
      id: 'ultimate',
      name: 'Ultimate Showroom',
      description: 'Full concours-level detail',
      basePrice: 1200,
      includes: ['Premium wash', 'Clay bar treatment', 'Ceramic coating', 'Full interior detail', 'Engine bay', 'Headlight restore', 'Odor removal'],
      icon: <FaAward className="text-yellow-500" />
    }
  ];

  // Add-on services
  const addonServices = [
    { id: 'pet-hair', name: 'Pet Hair Removal', price: 100, icon: <FaDog /> },
    { id: 'clay-bar', name: 'Clay Bar Treatment', price: 250, icon: <FaFilter /> },
    { id: 'paint-seal', name: 'Paint Sealant', price: 400, icon: <FaShieldAlt /> },
    { id: 'fabric-protect', name: 'Fabric Protection', price: 300, icon: <FaRecycle /> },
    { id: 'sanitize', name: 'UV Sanitization', price: 180, icon: <FaSun /> }
  ];

  // Get theme color
  const getThemeColor = (type) => {
    const themes = {
      carwash: 'blue',
      detailer: 'purple',
      valeter: 'green',
      default: 'blue'
    };
    return themes[type] || themes.default;
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = carWash ? getThemeColor(carWash.type) : 'blue';

  // AI Assessment States
  const [aiAssessment, setAiAssessment] = useState({
    descriptionQuality: null,
    imageQuality: null,
    overallRating: null,
    likes: 0,
    dislikes: 0,
    userReaction: null
  });

  const [commentAnalysis, setCommentAnalysis] = useState({});
  const [analyzingComments, setAnalyzingComments] = useState(false);

  // ==================== ENHANCED LOCATION FUNCTIONS ====================

  // Location type classification
  const locationTypes = {
    COME_TO_CLIENT: 'comeToYou',
    PROVIDER_LOCATION: 'goToThem',
    NEUTRAL_VENUE: 'neutralVenue'
  };

  // Enhanced location validation and formatting
  const validateAndFormatAddress = (address) => {
    if (!address) {
      throw new Error('Please provide a complete address');
    }

    const addressStr = address.trim();
    if (addressStr.length < 10) {
      throw new Error('Please provide a more detailed address');
    }

    const hasStreet = /\d+\s+[A-Za-z\s]+/.test(addressStr);
    const hasCity = /[A-Za-z]{2,}/.test(addressStr);
    
    if (!hasStreet || !hasCity) {
      throw new Error('Please include street number, street name, and city');
    }

    return addressStr;
  };

  // Generate comprehensive map links
  const generateMapLink = (address) => {
    if (!address) return '#';
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.google.com/?q=${encodedAddress}`;
  };

  // Enhanced location handler
  const handleLocationInfo = (bookingData, provider) => {
    const locationInfo = {
      type: bookingData.locationOption,
      displayName: '',
      address: '',
      instructions: '',
      travelFee: 0,
      mapLink: '',
      coordinates: null
    };

    switch (bookingData.locationOption) {
      case locationTypes.COME_TO_CLIENT:
        locationInfo.displayName = 'Client Address';
        locationInfo.address = bookingData.address;
        locationInfo.travelFee = provider.travelFee || 0;
        locationInfo.instructions = bookingData.specialInstructions || '';
        locationInfo.mapLink = generateMapLink(bookingData.address);
        break;
      
      case locationTypes.PROVIDER_LOCATION:
        locationInfo.displayName = 'Car Wash Location';
        locationInfo.address = provider.businessAddress || provider.address || 'Address not specified';
        locationInfo.instructions = provider.locationInstructions || '';
        locationInfo.mapLink = generateMapLink(locationInfo.address);
        break;
      
      default:
        locationInfo.displayName = 'Service Location';
        locationInfo.address = provider.address || 'Address not specified';
        locationInfo.mapLink = generateMapLink(locationInfo.address);
    }

    return locationInfo;
  };

  // Get location-specific message
  const getLocationSpecificMessage = (bookingData, provider) => {
    const locationInfo = handleLocationInfo(bookingData, provider);
    
    let locationMessage = `📍 *Location Details:*%0A`;
    locationMessage += `• Type: ${locationInfo.displayName}%0A`;
    
    if (locationInfo.address) {
      locationMessage += `• Address: ${locationInfo.address}%0A`;
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        locationMessage += `• Navigation: ${locationInfo.mapLink}%0A`;
      }
    }
    
    if (locationInfo.instructions) {
      locationMessage += `• Instructions: ${locationInfo.instructions}%0A`;
    }
    
    if (locationInfo.travelFee > 0) {
      locationMessage += `• Travel Fee: R${locationInfo.travelFee}%0A`;
    }
    
    return locationMessage;
  };

  // ==================== END ENHANCED LOCATION FUNCTIONS ====================

  // Generate username for social media
  const generateUsername = (name, platform) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const suffixes = ['', 'carwash', 'detailing', 'valet', 'autocare', 'shine', 'polish', 'cleaning'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return suffix ? `${cleanName}.${suffix}` : cleanName;
  };

  const getRandomRecentDate = () => {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // AI-powered social media verification
  const verifySocialMediaPresence = async (carWashData) => {
    setVerifyingSocialMedia(true);
    
    try {
      setTimeout(() => {
        const name = carWashData.name || '';
        
        const hasFacebook = Math.random() > 0.3;
        const hasInstagram = Math.random() > 0.2;
        
        const facebookData = hasFacebook ? {
          exists: true,
          username: generateUsername(name, 'facebook'),
          url: `https://facebook.com/${generateUsername(name, 'facebook')}`,
          isActive: Math.random() > 0.4,
          verified: Math.random() > 0.7,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 5000) + 100,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          followers: null,
          verificationStatus: 'not_found'
        };

        const instagramData = hasInstagram ? {
          exists: true,
          username: generateUsername(name, 'instagram'),
          url: `https://instagram.com/${generateUsername(name, 'instagram')}`,
          isActive: Math.random() > 0.3,
          verified: Math.random() > 0.6,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 10000) + 500,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          followers: null,
          verificationStatus: 'not_found'
        };

        setSocialMediaVerification({
          facebook: facebookData,
          instagram: instagramData
        });
        setVerifyingSocialMedia(false);
      }, 2000);

    } catch (error) {
      console.error('Error verifying social media:', error);
      setVerifyingSocialMedia(false);
    }
  };

  useEffect(() => {
    const fetchCarWash = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/carwash/get/${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch car wash details');
        }

        const data = await res.json();
        setCarWash(data);
        simulateAiAssessment(data);
        verifySocialMediaPresence(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCarWash();
  }, [id]);

  // Scroll detection for booking belt
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 300;
      setShowBookingBelt(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update total price when services change
  useEffect(() => {
    let total = 0;
    selectedServices.forEach(serviceId => {
      const service = carWashServices.find(s => s.id === serviceId);
      if (service) {
        total += service.price;
      }
    });
    
    // Apply vehicle multiplier if selected
    if (bookingData.vehicleType) {
      const vehicle = vehicleTypes.find(v => v.id === bookingData.vehicleType);
      if (vehicle) {
        total = total * vehicle.multiplier;
      }
    }
    
    setTotalPrice(Math.round(total));
  }, [selectedServices, bookingData.vehicleType]);

  // Simulate AI assessment
  const simulateAiAssessment = (carWashData) => {
    setTimeout(() => {
      const description = carWashData.description || '';

      let descScore = 0;
      if (description.length > 200) descScore += 2;
      if (description.length > 500) descScore += 1;
      if (description.includes("experience") || description.includes("professional")) descScore += 1;
      if (description.includes("certified") || description.includes("qualified")) descScore += 1;
      if (description.includes("eco-friendly") || description.includes("waterless")) descScore += 1;
      if (description.includes("premium") || description.includes("detailing")) descScore += 1;

      let imgScore = 0;
      if (carWashData.imageUrls?.length > 0) imgScore = 3;
      if (carWashData.imageUrls?.length > 2) imgScore = 4;
      if (carWashData.imageUrls?.length > 4) imgScore = 5;

      const overall = Math.min(5, (descScore + imgScore) / 2);

      const likes = Math.floor(Math.random() * 50) + 10;
      const dislikes = Math.floor(Math.random() * 10);

      setAiAssessment({
        descriptionQuality: descScore,
        imageQuality: imgScore,
        overallRating: overall,
        likes,
        dislikes,
        userReaction: null
      });
    }, 1500);
  };

  // Format phone numbers for WhatsApp
  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const contactStr = String(contact);
    const digitsOnly = contactStr.replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) {
      return '27' + digitsOnly.substring(1);
    }
    return digitsOnly;
  };

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData({ 
      ...bookingData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Handle service selection
  const handleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      const index = prev.indexOf(serviceId);
      if (index > -1) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    
    setBookingData(prev => ({
      ...prev,
      selectedServices: selectedServices.includes(serviceId) 
        ? selectedServices.filter(id => id !== serviceId)
        : [...selectedServices, serviceId]
    }));
  };

  // Handle package selection
  const handlePackageSelection = (packageId) => {
    const pkg = washPackages.find(p => p.id === packageId);
    if (pkg) {
      // Map package to services
      const packageServices = [];
      if (packageId === 'basic') {
        packageServices.push('exterior-wash', 'tire-shine');
      } else if (packageId === 'standard') {
        packageServices.push('exterior-wash', 'interior-vacuum', 'tire-shine');
      } else if (packageId === 'premium') {
        packageServices.push('exterior-wash', 'wax-polish', 'interior-vacuum', 'carpet-shampoo', 'leather-treatment', 'tire-shine', 'engine-clean');
      } else if (packageId === 'ultimate') {
        packageServices.push('exterior-wash', 'wax-polish', 'interior-vacuum', 'carpet-shampoo', 'leather-treatment', 'engine-clean', 'headlight-restore', 'ceramic-coating', 'odor-removal');
      }
      
      setSelectedServices(packageServices);
      setBookingData(prev => ({
        ...prev,
        selectedServices: packageServices,
        washType: packageId
      }));
    }
  };

  // Handle file attachments
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isSizeValid = file.size <= 5 * 1024 * 1024;

      return (isImage || isPDF) && isSizeValid;
    });

    const newAttachments = [...attachments, ...validFiles].slice(0, 2);
    setAttachments(newAttachments);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Upload files to cloud storage (mock implementation)
  const uploadFilesToCloud = async (files) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return files.map(file => {
      const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
      return {
        name: file.name,
        url: mockUrl,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        size: file.size
      };
    });
  };

  // ================================ BOOKING START HERE================

  // Enhanced WhatsApp booking function
  const handleQuickBooking = () => {
    if (!carWash?.contact) {
      alert(`${getProfessionalTitle(carWash?.type)} contact information is missing.`);
      return;
    }

    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number first.");
      return;
    }

    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for mobile car wash service.");
      return;
    }

    const clientPhone = formatContactForWhatsApp(bookingData.phone);
    const acceptMessage = `Accept the service ${bookingData.name}, I accept your booking for ${carWash.name}. See you then!`;
    const declineMessage = `Decline the service ${bookingData.name}, I'm unable to accept this booking. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    const locationInfo = handleLocationInfo(bookingData, carWash);
    const locationMessage = getLocationSpecificMessage(bookingData, carWash);

    let message = `*📅 Quick Booking Request for ${carWash.name}*%0A%0A`;
    message += `*👤 Client Details*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone}%0A`;
    
    if (bookingData.date) {
      message += `• Date: ${bookingData.date}%0A`;
    }
    if (bookingData.time) {
      message += `• Time: ${bookingData.time}%0A`;
    }
    
    message += locationMessage;
    
    message += `%0A`;
    message += `*🚗 Vehicle Details*%0A`;
    message += `• Type: ${bookingData.vehicleType || 'Not specified'}%0A`;
    message += `• Make: ${bookingData.vehicleMake || 'Not specified'}%0A`;
    message += `• Model: ${bookingData.vehicleModel || 'Not specified'}%0A`;
    if (bookingData.licensePlate) {
      message += `• License: ${bookingData.licensePlate}%0A`;
    }
    
    message += `%0A`;
    message += `*🧼 Service Details*%0A`;
    
    if (selectedServices.length > 0) {
      const selectedServiceNames = selectedServices.map(serviceId => {
        const service = carWashServices.find(s => s.id === serviceId);
        return service ? service.name : serviceId;
      }).join(', ');
      message += `• Selected Services: ${selectedServiceNames}%0A`;
    }
    
    message += `• Total Price: R${totalPrice}%0A`;
    
    // Add service-specific details
    if (bookingData.waxService === 'yes') message += `• Wax Service: Yes%0A`;
    if (bookingData.polishService === 'yes') message += `• Polish Service: Yes%0A`;
    if (bookingData.engineCleaning === 'yes') message += `• Engine Cleaning: Yes%0A`;
    if (bookingData.underbodyCleaning === 'yes') message += `• Underbody Cleaning: Yes%0A`;
    if (bookingData.ceramicCoating === 'yes') message += `• Ceramic Coating: Yes%0A`;
    
    message += `%0A`;
    message += `*💧 Location Requirements*%0A`;
    message += `• Water Source: ${bookingData.waterSource === 'client' ? 'Client to provide' : 'Provider brings water'}%0A`;
    message += `• Electricity Access: ${bookingData.electricityAccess === 'yes' ? 'Available' : 'Not available'}%0A`;
    message += `• Parking: ${bookingData.parkingAvailable === 'yes' ? 'Available' : 'Limited'}%0A`;
    
    if (bookingData.specialRequirements) {
      message += `• Special Requirements: ${bookingData.specialRequirements}%0A`;
    }
    
    message += `%0A`;
    message += `Please respond:%0A`;
    
    if (acceptLink) {
      message += `✅ [Accept Booking](${acceptLink})%0A`;
    }
    if (declineLink) {
      message += `❌ [Decline Booking](${declineLink})%0A`;
    }
    
    message += `%0A`;
    message += `Or reply directly to this message%0A%0A`;
    message += `_Sent via loopOut Car Wash Booking_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(carWash.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // ==================== ENHANCED BOOKING SUBMIT FUNCTION ====================
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!carWash?.contact) {
      alert(`${getProfessionalTitle(carWash?.type)} contact information is missing. Please try another contact method.`);
      return;
    }

    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for mobile car wash service.");
      return;
    }

    try {
      if (bookingData.locationOption === 'comeToYou') {
        const formattedAddress = validateAndFormatAddress(bookingData.address);
        setBookingData(prev => ({ ...prev, address: formattedAddress }));
      }
    } catch (error) {
      alert(error.message);
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service you need.");
      return;
    }

    let uploadedFiles = [];

    if (attachments.length > 0) {
      setIsUploading(true);
      try {
        uploadedFiles = await uploadFilesToCloud(attachments);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload attachments. Please try again without files or contact support.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const clientPhone = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';

    const acceptMessage = `Accept the service ${bookingData.name}, I accept your booking for ${carWash.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Decline the service ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    const locationInfo = handleLocationInfo(bookingData, carWash);
    const locationMessage = getLocationSpecificMessage(bookingData, carWash);

    let message = `*🚗 New Car Wash Booking Request for ${carWash.name}*%0A%0A`;

    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Base Price: R${carWash.regularPrice}%0A`;
    
    const selectedServiceNames = selectedServices.map(serviceId => {
      const service = carWashServices.find(s => s.id === serviceId);
      return service ? service.name : serviceId;
    }).join(', ');
    
    message += `• Selected Services: ${selectedServiceNames}%0A`;
    message += `• Total Price: R${totalPrice}%0A`;

    message += `%0A*🚗 VEHICLE DETAILS*%0A`;
    message += `• Type: ${bookingData.vehicleType || 'Not specified'}%0A`;
    if (bookingData.vehicleMake) message += `• Make: ${bookingData.vehicleMake}%0A`;
    if (bookingData.vehicleModel) message += `• Model: ${bookingData.vehicleModel}%0A`;
    if (bookingData.vehicleYear) message += `• Year: ${bookingData.vehicleYear}%0A`;
    if (bookingData.licensePlate) message += `• License Plate: ${bookingData.licensePlate}%0A`;

    message += `%0A*🏠 SERVICE PROVIDER DETAILS*%0A`;
    
    if (bookingData.addressProvided) {
      message += `• Address Provided: ${bookingData.addressProvided}%0A`;
    }
    
    message += `• Water Source: ${bookingData.waterSource === 'client' ? 'Client provides' : 'Provider brings water'}%0A`;
    message += `• Electricity Access: ${bookingData.electricityAccess === 'yes' ? 'Available' : 'Not available'}%0A`;
    message += `• Parking: ${bookingData.parkingAvailable === 'yes' ? 'Available' : 'Limited'}%0A`;
    
    if (bookingData.otherDetails) {
      message += `• Other Details: ${bookingData.otherDetails}%0A`;
    }
    
    if (locationInfo.travelFee > 0) {
      message += `• Travel Fee: R${locationInfo.travelFee}%0A`;
    }
    message += `• Car Wash Contact: ${carWash.contact}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    
    message += locationMessage;
    
    message += `• Special Requirements: ${bookingData.specialRequirements || 'None'}%0A`;
    
    message += `%0A`;

    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Service Type: Mobile Car Wash (Comes to you)%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Navigation Link:%0A  ${locationInfo.mapLink}%0A`;
      }
      
      message += `• Location Requirements:%0A`;
      message += `  ✓ Water source ${bookingData.waterSource === 'client' ? 'required' : 'provider brings'}%0A`;
      message += `  ✓ Power outlet ${bookingData.electricityAccess === 'yes' ? 'available' : 'not required'}%0A`;
      message += `  ✓ Safe parking space required%0A`;
      
      if (locationInfo.instructions) {
        message += `• Additional Instructions: ${locationInfo.instructions}%0A`;
      }
      
      message += `%0A`;
    } else if (bookingData.locationOption === 'goToThem' && carWash.address) {
      message += `*📍 SERVICE LOCATION*%0A`;
      message += `• Service Type: At Car Wash Location%0A`;
      message += `• Business Name: ${carWash.name} Car Wash%0A`;
      message += `• Address: ${carWash.address}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Navigation Link: ${locationInfo.mapLink}%0A`;
      }
      
      if (locationInfo.instructions) {
        message += `• Location Instructions: ${locationInfo.instructions}%0A`;
      }
      
      message += `%0A`;
    }

    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A_Files uploaded for reference_%0A%0A`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: ${file.name}%0A`;
        message += `  ${file.url}%0A%0A`;
      });
    }

    message += `*ACTION REQUIRED*%0A`;
    message += `Tap a link to reply to the client:%0A%0A`;
    if (acceptLink) {
      message += `✅ Accept: ${acceptLink}%0A`;
    }
    if (declineLink) {
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `💬 You can also reply directly to this message.%0A%0A`;
    message += `_Sent via loopOut Car Wash Booking System_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(carWash.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    setAttachments([]);
  };

  // Simulate AI analysis of comments
  const analyzeCommentsWithAI = () => {
    setAnalyzingComments(true);

    setTimeout(() => {
      const analysis = {};
      const comments = document.querySelectorAll('.comment-item');

      comments.forEach((_, index) => {
        const qualityScore = Math.floor(Math.random() * 40) + 60;
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
    setCurrentGalleryIndex(index);
    setShowFullScreenGallery(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullScreenGallery = () => {
    setShowFullScreenGallery(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (carWash.imageUrls && carWash.imageUrls.length > 0) {
      setCurrentGalleryIndex((prevIndex) => 
        prevIndex === carWash.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (carWash.imageUrls && carWash.imageUrls.length > 0) {
      setCurrentGalleryIndex((prevIndex) => 
        prevIndex === 0 ? carWash.imageUrls.length - 1 : prevIndex - 1
      );
    }
  };

  const whatsappNumber = carWash ? formatContactForWhatsApp(carWash.contact) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi ${carWash.name}, I'm interested in your car wash services.`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading car wash details...</p>
          <p className="text-sm text-gray-500 mt-2">Getting the best car care professional for you</p>
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
              <h3 className="text-lg font-semibold text-red-800">Error loading car wash profile</h3>
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

  if (!carWash) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-6">
            <FaCar className="text-gray-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Car wash not found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">The car wash professional you're looking for doesn't exist or may have been removed from our platform.</p>
          <button
            onClick={() => navigate('/carwash-home-page')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Other Car Washes
          </button>
        </div>
      </div>
    );
  }

  const description = carWash.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <style>{`
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
        
        .gradient-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(226, 232, 240, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .gradient-header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        }
        
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
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        
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
      {showFullScreenGallery && carWash.imageUrls && carWash.imageUrls.length > 0 && (
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
                {carWash.name}'s Gallery
              </div>
            </div>
            <div className="text-white/80 font-medium">
              {currentGalleryIndex + 1} / {carWash.imageUrls.length}
            </div>
          </div>

          <div className="gallery-main-image">
            <img
              src={carWash.imageUrls[currentGalleryIndex]}
              alt={`Gallery image ${currentGalleryIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80';
              }}
            />
            
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

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-lg">
              {currentGalleryIndex + 1} / {carWash.imageUrls.length}
            </div>
          </div>

          {carWash.imageUrls.length > 1 && (
            <div className="p-6 bg-black/50 backdrop-blur-lg border-t border-white/10">
              <Swiper
                modules={[FreeMode]}
                spaceBetween={12}
                slidesPerView="auto"
                freeMode={true}
                className="thumbs-swiper"
              >
                {carWash.imageUrls.map((url, index) => (
                  <SwiperSlide key={index} style={{ width: '100px' }}>
                    <div
                      className={`gallery-thumbnail ${index === currentGalleryIndex ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
                      onClick={() => setCurrentGalleryIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div className="thumbnail-overlay">
                        {index === currentGalleryIndex && (
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
              <div className="gradient-header p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-1xl font-bold text-white">
                      Book Car Wash Services
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

              <div className="p-8 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleBookingSubmit} className="space-y-8">
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

                  {/* Vehicle Information */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Vehicle Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Vehicle Type *
                        </label>
                        <select
                          name="vehicleType"
                          value={bookingData.vehicleType}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                        >
                          <option value="">Select vehicle type</option>
                          {vehicleTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Vehicle Make
                        </label>
                        <input
                          type="text"
                          name="vehicleMake"
                          value={bookingData.vehicleMake}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                          placeholder="e.g., Toyota, Ford, BMW"
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
                          placeholder="e.g., Corolla, Ranger, 3 Series"
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

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          License Plate (Optional)
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
                  </div>

                  {/* Address Section */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Address Details</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Your Address for Mobile Car Wash *
                        </label>
                        <textarea
                          name="address"
                          value={bookingData.address}
                          onChange={handleBookingChange}
                          required
                          rows="3"
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                          placeholder="Please provide your complete address including street, city, and postal code"
                        />
                        <p className="text-sm text-gray-500">Full address is required for mobile car wash service</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Additional Address Details (Optional)
                        </label>
                        <textarea
                          name="addressProvided"
                          value={bookingData.addressProvided}
                          onChange={handleBookingChange}
                          rows="2"
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                          placeholder="Any additional location details, landmarks, or access instructions"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Select Services</h4>
                    
                    {/* Service Packages */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-700 mb-3 text-lg">Popular Packages</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {washPackages.map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => handlePackageSelection(pkg.id)}
                            className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover-lift ${
                              bookingData.washType === pkg.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{pkg.icon}</div>
                              <div>
                                <h6 className="font-bold text-lg">{pkg.name}</h6>
                                <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                                <p className="font-bold text-blue-600">R{pkg.basePrice}+</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-xs text-gray-500">Includes:</p>
                              <p className="text-sm">{pkg.includes.join(' • ')}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Individual Services */}
                    <h5 className="font-semibold text-gray-700 mb-3 text-lg">Individual Services</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {carWashServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelection(service.id)}
                          className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover-lift ${
                            selectedServices.includes(service.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-3xl">{service.icon}</div>
                            <span className="text-sm font-semibold text-center">{service.name}</span>
                            <span className="text-xs text-gray-500">R{service.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Total Price */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">Estimated Total:</span>
                        <span className="text-2xl font-bold text-blue-600">R{totalPrice}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Final price may vary based on vehicle condition</p>
                    </div>
                  </div>

                  {/* Location Requirements */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Location Requirements</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Water Source
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="waterSource"
                              value="client"
                              checked={bookingData.waterSource === 'client'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Client provides water</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="waterSource"
                              value="provider"
                              checked={bookingData.waterSource === 'provider'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Provider brings water</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Electricity Access
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="electricityAccess"
                              value="yes"
                              checked={bookingData.electricityAccess === 'yes'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Available at location</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="electricityAccess"
                              value="no"
                              checked={bookingData.electricityAccess === 'no'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Not available (battery equipment only)</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Parking Availability
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="parkingAvailable"
                              value="yes"
                              checked={bookingData.parkingAvailable === 'yes'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Safe, spacious parking</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="parkingAvailable"
                              value="limited"
                              checked={bookingData.parkingAvailable === 'limited'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Limited/street parking</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Special Requirements</h4>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Any Special Instructions?
                      </label>
                      <textarea
                        name="specialRequirements"
                        value={bookingData.specialRequirements}
                        onChange={handleBookingChange}
                        rows="3"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                        placeholder="Any specific areas to focus on, paint condition, special requests, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Other Important Details
                      </label>
                      <textarea
                        name="otherDetails"
                        value={bookingData.otherDetails}
                        onChange={handleBookingChange}
                        rows="3"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all"
                        placeholder="Any other important details or requirements"
                      />
                    </div>
                  </div>

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

                  {/* Attachments */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Attachments (Optional)</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaFileImage className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">Images or PDF (max 2 files, 5MB each)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleAttachmentChange}
                            multiple
                            accept="image/*,.pdf"
                          />
                        </label>
                      </div>

                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                {file.type.startsWith('image/') ? (
                                  <FaFileImage className="text-blue-500" />
                                ) : (
                                  <FaFilePdf className="text-red-500" />
                                )}
                                <span className="text-sm text-gray-700">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
        {/* Hero Section */}
        <div className="mb-8 fade-in-up">
          <div className="professional-header-image h-96 relative">
            <img
              src={carWash.imageUrls?.[0] || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80'}
              alt={carWash.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            <div className="image-overlay-content">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{carWash.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="professional-badge">
                      <FaCar className="text-xs" /> {getProfessionalTitle(carWash.type)}
                    </span>
                    <div className="flex items-center gap-1 text-white/90">
                      <FaMapMarkerAlt />
                      <span>{carWash.address || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      <span className="text-white font-bold text-lg">{carWash.rating || '4.5'}</span>
                      <span className="text-white/80">({carWash.reviewCount || '25'} reviews)</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white font-bold text-lg">R{carWash.regularPrice}</span>
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
                      src={carWash.imageUrls?.[0] || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=200&q=80'}
                      alt={carWash.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{carWash.name}</h2>
                      <p className="text-gray-600 mt-1 truncate">{getProfessionalTitle(carWash.type)}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 text-gray-700 truncate">
                          <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                          <span className="truncate">{carWash.address || 'Location not specified'}</span>
                        </div>
                        {carWash.contact && (
                          <div className="flex items-center gap-2 text-gray-700 truncate">
                            <FaPhone className="text-green-500 flex-shrink-0" />
                            <span className="truncate">0{carWash.contact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={openBookingFormOverlay}
                      className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 lg:px-6 lg:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                    >
                      Book Now
                    </button>
                  </div>
                  
                  {/* Verification Badges */}
                  <div className="flex flex-wrap gap-2 lg:gap-3 mt-4 lg:mt-6">
                    {carWash.security && (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaCheckCircle className="text-emerald-600" />
                        <span className="text-emerald-800 font-semibold text-xs lg:text-sm">Verified</span>
                      </div>
                    )}
                    
                    <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                      <FaStar className="text-yellow-500" />
                      <span className="text-blue-800 font-semibold text-xs lg:text-sm">
                        {carWash.rating ? `${carWash.rating} Rating` : 'Top Rated'}
                      </span>
                    </div>

                    {carWash.host && (
                      <div className="inline-flex items-center gap-2 bg-orange-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaBriefcase className="text-orange-600" />
                        <span className="text-orange-800 font-semibold text-xs lg:text-sm">
                          {carWash.host} Years Experience
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {carWash.imageUrls && carWash.imageUrls.length > 0 && (
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
                  {carWash.imageUrls.slice(0, 4).map((url, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
                      onClick={() => openFullScreenGallery(index)}
                    >
                      <img
                        src={url}
                        alt={`${carWash.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          View
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {carWash.imageUrls.length > 4 && (
                    <div
                      className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
                      onClick={() => openFullScreenGallery(4)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-xl lg:text-2xl font-bold">+{carWash.imageUrls.length - 4}</div>
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
                  About {getProfessionalTitle(carWash.type)}
                </h3>
                {description.length > 300 && (
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
                  {carWash.security && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaCheckCircle className="text-emerald-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-emerald-800 text-xs lg:text-sm">Verified</span>
                    </div>
                  )}
                  {carWash.imageUrls?.length >= 3 && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaFileImage className="text-blue-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-blue-800 text-xs lg:text-sm">Rich Media</span>
                    </div>
                  )}
                  {description.length > 200 && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaUser className="text-purple-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-purple-800 text-xs lg:text-sm">Detailed Info</span>
                    </div>
                  )}
                  {carWash.host && parseInt(carWash.host) >= 2 && (
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
              <HelperComments 
                helperId={carWash._id} 
                onCommentCountChange={setCommentCount}
                onAnalyzeComments={analyzeCommentsWithAI}
                commentAnalysis={commentAnalysis}
                analyzingComments={analyzingComments}
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
                  <div className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">R{carWash.regularPrice}</div>
                  {carWash.travelFee > 0 && (
                    <p className="text-orange-600 text-sm lg:text-base">+ R{carWash.travelFee} travel fee</p>
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
                    onClick={() => whatsappLink && window.open(whatsappLink, '_blank')}
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
                    <span className="font-semibold">{carWash.responseTime || 'Within 1 hour'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mt-2">
                    <span>Availability</span>
                    <span className="font-semibold">{carWash.availability || 'Flexible'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Contact Information</h3>
              
              <div className="space-y-4 lg:space-y-6">
                {carWash.contact && (
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-blue-600 text-base lg:text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Phone Number</p>
                      <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{carWash.contact}</p>
                    </div>
                  </div>
                )}

                {carWash.address && (
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-green-600 text-base lg:text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Location</p>
                      <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{carWash.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-purple-600 text-base lg:text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-gray-900 text-sm lg:text-base">{carWash.responseTime || 'Within 1 hour'}</p>
                  </div>
                </div>
              </div>

              {/* Social Media Verification */}
              <div className="mt-6 lg:mt-8 pt-4 lg:pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Social Verification</h4>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {socialMediaVerification.instagram.exists && (
                    <a
                      href={socialMediaVerification.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 lg:p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <FaInstagram className="text-pink-600 text-base lg:text-xl" />
                    </a>
                  )}
                  {socialMediaVerification.facebook.exists && (
                    <a
                      href={socialMediaVerification.facebook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 lg:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <FaFacebook className="text-blue-600 text-base lg:text-xl" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Safety Information */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaShieldAlt className="text-white text-base lg:text-xl" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">Safety First</h3>
                  <p className="text-gray-600 text-xs lg:text-sm">Verified & Secure</p>
                </div>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Background verified professionals</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Secure payment options</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </div>
              </div>

              <Link
                to="/safetyhelper"
                className="mt-4 lg:mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm lg:text-base"
              >
                <span>Learn more about safety</span>
                <FaArrowRight />
              </Link>
            </div>
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
                src={carWash?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=100&q=80'}
                alt={carWash?.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 truncate">{carWash?.name}</h3>
                <p className="text-gray-600 truncate">{getProfessionalTitle(carWash?.type)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-gray-800">{carWash?.rating || '4.5'}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-700">R{carWash?.regularPrice}</span>
                  {carWash?.travelFee > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-orange-600 font-medium">+R{carWash.travelFee} travel</span>
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

              <Link to="/safetyhelper">
                <button className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <FaInfoCircle className="text-xl" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelHelper
          helperId={carWash._id}
          onClose={() => setShowCommentsPanel(false)}
          onAnalyzeComments={analyzeCommentsWithAI}
          commentAnalysis={commentAnalysis}
          analyzingComments={analyzingComments}
        />
      )}
    </div>
  );
}