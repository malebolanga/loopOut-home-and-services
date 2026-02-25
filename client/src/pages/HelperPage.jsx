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
  FaFlag, FaArrowLeft,
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
  FaHeart, FaShareAlt, FaMedal, FaRegClock, FaRegCheckCircle, FaRegStar
} from 'react-icons/fa';
import { FiShare2, FiHeart } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

import HelperComments from '../components/HelperComments';
import CommentsSidePanelHelper from '../components/CommentsSidePanelHelper';

export default function HelperPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showBookingBelt, setShowBookingBelt] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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
    },
    linkedin: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      connections: null,
      verificationStatus: 'checking'
    },
    twitter: {
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
    bringFood: 'no',
    message: '',
    selectedHaircut: '',
    beardStyle: '',
    hairLength: '',
    specialRequirements: '',
    mealType: '',
    cuisinePreference: '',
    numberOfGuests: '',
    dietaryRestrictions: '',
    cookingEquipment: '',
    ingredientsProvided: 'no',
    // Photography-specific fields
    photographyType: '',
    sessionDuration: '',
    numberOfPeople: '',
    photographyRequirements: '',
    deliveryFormat: '',
    // Service provider fields
    addressProvided: '',
    foodProvided: 'no',
    cleaningArrengement: 'no',
    equipmentProvided: 'no',
    otherDetails: ''
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

  const [commentAnalysis, setCommentAnalysis] = useState({});
  const [analyzingComments, setAnalyzingComments] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // Calculate total price
  useEffect(() => {
    if (helper) {
      const basePrice = helper.regularPrice || 0;
      const travelFee = helper.travelFee || 0;
      const serviceFee = Math.round(basePrice * 0.1);
      setTotalPrice(basePrice + travelFee + serviceFee);
    }
  }, [helper, bookingData.selectedServices]);

  // ==================== HELPER FUNCTIONS (DEFINED FIRST) ====================

  // Helper function to get professional title
  const getProfessionalTitle = (type) => {
    const titles = {
      chef: 'Private Chef',
      barber: 'Barber',
      barbar: 'Barber',
      beauty: 'Beauty Professional',
      spa: 'Spa Professional',
      maid: 'Housekeeper',
      domestic: 'Domestic Helper',
      tattoo: 'Tattoo Artist',
      tutor: 'Private Tutor',
      photography: 'Photographer'
    };
    return titles[type] || 'Professional';
  };

  // Get theme color based on helper type
  const getThemeColor = (type) => {
    const themes = {
      beauty: 'pink',
      spa: 'purple',
      domestic: 'red',
      maid: 'red',
      barber: 'blue',
      barbar: 'blue',
      chef: 'orange',
      cooking: 'orange',
      tattoo: 'gray',
      tutor: 'green',
      photography: 'purple',
      default: 'red'
    };
    return themes[type] || themes.default;
  };

  const themeColor = helper ? getThemeColor(helper.type) : 'red';

  // Service options for different helper types
  const getServiceOptions = (type) => {
    const baseOptions = [
      { id: 'laundry', name: 'Laundry', icon: <FaTshirt className="text-blue-500" /> },
      { id: 'cleaning', name: 'Deep Cleaning', icon: <FaBroomClean className="text-green-500" /> },
      { id: 'ironing', name: 'Ironing', icon: <FaTshirt className="text-purple-500" /> },
      { id: 'yard', name: 'Yard Work', icon: <FaBroom className="text-yellow-600" /> },
      { id: 'cooking', name: 'Meal Prep', icon: <FaFire className="text-red-500" /> },
      { id: 'babysitting', name: 'Child Care', icon: <FaBaby className="text-pink-500" /> },
      { id: 'eventCleaning', name: 'Event Cleanup', icon: <FaGlassCheers className="text-indigo-500" /> },
      { id: 'other', name: 'Other', icon: <FaEllipsisH className="text-gray-500" /> }
    ];

    const beautyOptions = [
      { id: 'makeup', name: 'Makeup', icon: <FaPalette className="text-pink-500" /> },
      { id: 'skincare', name: 'Facials', icon: <FaSpa className="text-purple-400" /> },
      { id: 'nails', name: 'Nails', icon: <FaHandSparkles className="text-red-400" /> },
      { id: 'hair', name: 'Hair Styling', icon: <FaCut className="text-blue-400" /> },
      { id: 'facial', name: 'Skin Therapy', icon: <FaStar className="text-yellow-500" /> },
      { id: 'waxing', name: 'Waxing', icon: <FaFire className="text-orange-500" /> },
      { id: 'massage', name: 'Massage', icon: <FaHandHoldingHeart className="text-green-400" /> },
      { id: 'bridal', name: 'Bridal', icon: <FaRing className="text-rose-500" /> }
    ];

    const barberOptions = [
      { id: 'haircut', name: 'Haircut', icon: <FaCut className="text-blue-600" /> },
      { id: 'beardTrim', name: 'Beard Trim', icon: <FaUser className="text-gray-700" /> },
      { id: 'shave', name: 'Razor Shave', icon: <FaTools className="text-gray-900" /> },
      { id: 'fade', name: 'Fade', icon: <FaCut className="text-indigo-600" /> },
      { id: 'coloring', name: 'Coloring', icon: <FaBrush className="text-purple-500" /> },
      { id: 'styling', name: 'Styling', icon: <FaSprayCan className="text-yellow-600" /> },
      { id: 'kidsCut', name: 'Kids Cut', icon: <FaSmile className="text-green-500" /> },
      { id: 'consultation', name: 'Consult', icon: <FaUser className="text-teal-500" /> }
    ];

    const chefOptions = [
      { id: 'mealPrep', name: 'Meal Prep', icon: <FaUtensils className="text-orange-500" /> },
      { id: 'privateDining', name: 'Private Dining', icon: <FaUtensils className="text-red-500" /> },
      { id: 'cookingClasses', name: 'Classes', icon: <FaGraduationCap className="text-green-500" /> },
      { id: 'eventCatering', name: 'Catering', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'dietMeals', name: 'Diet Plans', icon: <FaCookie className="text-blue-500" /> },
      { id: 'baking', name: 'Baking', icon: <FaCookie className="text-yellow-500" /> },
      { id: 'groceryShopping', name: 'Shopping', icon: <FaShoppingBasket className="text-teal-500" /> },
      { id: 'menuPlanning', name: 'Planning', icon: <FaUtensils className="text-indigo-500" /> }
    ];

    const tattooOptions = [
      { id: 'custom', name: 'Custom Art', icon: <FaPalette className="text-gray-800" /> },
      { id: 'coverup', name: 'Cover-up', icon: <FaBrush className="text-purple-600" /> },
      { id: 'touchup', name: 'Touch-up', icon: <FaTools className="text-blue-600" /> },
      { id: 'consultation', name: 'Design', icon: <FaUser className="text-teal-500" /> }
    ];

    const tutorOptions = [
      { id: 'math', name: 'Mathematics', icon: <FaGraduationCap className="text-blue-600" /> },
      { id: 'science', name: 'Science', icon: <FaGraduationCap className="text-green-600" /> },
      { id: 'language', name: 'Languages', icon: <FaGraduationCap className="text-yellow-600" /> },
      { id: 'music', name: 'Music', icon: <FaGraduationCap className="text-purple-600" /> },
      { id: 'art', name: 'Art', icon: <FaPalette className="text-pink-600" /> },
      { id: 'testPrep', name: 'Test Prep', icon: <FaGraduationCap className="text-red-600" /> }
    ];

    const photographyOptions = [
      { id: 'portrait', name: 'Portrait', icon: <FaUser className="text-blue-500" /> },
      { id: 'event', name: 'Events', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'product', name: 'Product', icon: <FaShoppingBasket className="text-green-500" /> },
      { id: 'wedding', name: 'Wedding', icon: <FaRing className="text-pink-500" /> },
      { id: 'family', name: 'Family', icon: <FaUserFriends className="text-orange-500" /> },
      { id: 'commercial', name: 'Commercial', icon: <FaBriefcase className="text-indigo-500" /> },
      { id: 'realestate', name: 'Real Estate', icon: <FaHome className="text-yellow-600" /> },
      { id: 'landscape', name: 'Landscape', icon: <FaMapMarkerAlt className="text-teal-500" /> }
    ];

    switch (type) {
      case 'beauty':
      case 'spa':
        return beautyOptions;
      case 'barber':
      case 'barbar':
        return barberOptions;
      case 'chef':
      case 'cooking':
        return chefOptions;
      case 'tattoo':
        return tattooOptions;
      case 'tutor':
        return tutorOptions;
      case 'photography':
        return photographyOptions;
      case 'domestic':
      case 'maid':
        return baseOptions;
      default:
        return [];
    }
  };

  // Haircut styles for barbers
  const haircutStyles = [
    { id: 'classic-crew', name: 'Classic Crew Cut', description: 'Timeless short cut' },
    { id: 'fade-cut', name: 'Fade Cut', description: 'Gradual length transition' },
    { id: 'pompadour', name: 'Pompadour', description: 'Voluminous classic style' },
    { id: 'undercut', name: 'Undercut', description: 'Sharp contrast cut' },
    { id: 'buzz-cut', name: 'Buzz Cut', description: 'Uniform short length' },
    { id: 'afro-style', name: 'Afro Style', description: 'Natural texture styling' },
    { id: 'textured-crop', name: 'Textured Crop', description: 'Modern layered cut' },
    { id: 'slick-back', name: 'Slick Back', description: 'Sleek polished look' }
  ];

  // Beard styles for barbers
  const beardStyles = [
    { id: 'stubble', name: 'Stubble', description: 'Short maintained beard' },
    { id: 'short-beard', name: 'Short Beard', description: 'Neat trimmed beard' },
    { id: 'medium-beard', name: 'Medium Beard', description: 'Fuller beard style' },
    { id: 'long-beard', name: 'Long Beard', description: 'Extended beard care' },
    { id: 'goatee', name: 'Goatee', description: 'Chin focused style' },
    { id: 'van-dyke', name: 'Van Dyke', description: 'Mustache and goatee combo' },
    { id: 'circle-beard', name: 'Circle Beard', description: 'Rounded beard style' },
    { id: 'clean-shave', name: 'Clean Shave', description: 'Complete beard removal' }
  ];

  // Chef-specific options
  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'brunch', name: 'Brunch' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'appetizers', name: 'Appetizers & Canapés' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'full-course', name: 'Full Course Meal' },
    { id: 'buffet', name: 'Buffet Style' }
  ];

  const cuisineTypes = [
    { id: 'italian', name: 'Italian' },
    { id: 'french', name: 'French' },
    { id: 'asian', name: 'Asian Fusion' },
    { id: 'mediterranean', name: 'Mediterranean' },
    { id: 'mexican', name: 'Mexican' },
    { id: 'indian', name: 'Indian' },
    { id: 'american', name: 'American' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'vegan', name: 'Vegan' },
    { id: 'seafood', name: 'Seafood' },
    { id: 'bbq', name: 'BBQ & Grilling' },
    { id: 'custom', name: 'Custom Menu' }
  ];

  // Equipment options for different services
  const equipmentOptions = {
    chef: [
      'Professional knives',
      'Cooking utensils',
      'Portable stove',
      'Baking equipment',
      'Serving platters',
      'Kitchen thermometer',
      'Mixer/blender',
      'Food processor'
    ],
    barber: [
      'Professional clippers',
      'Hair scissors',
      'Beard trimmers',
      'Sterilization equipment',
      'Hair styling tools',
      'Barber cape',
      'Shaving supplies',
      'Sanitizing spray'
    ],
    beauty: [
      'Makeup kit',
      'Skincare tools',
      'Sterilization equipment',
      'Nail care tools',
      'Facial steamer',
      'Beauty lights',
      'Professional chair',
      'Sanitation supplies'
    ],
    photography: [
      'Professional camera',
      'Lighting equipment',
      'Tripod',
      'Backdrops',
      'Lens selection',
      'Editing laptop',
      'Memory cards',
      'Battery packs'
    ],
    default: [
      'Basic tools',
      'Cleaning supplies',
      'Protective gear',
      'Portable equipment'
    ]
  };

  // ==================== END HELPER FUNCTIONS ====================

  // Scroll detection for navigation transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${getProfessionalTitle(helper?.type)} services by ${helper?.name}`,
        text: helper?.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Toggle favorite function
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // You can add API call here to save to user's favorites
  };

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

    // Basic validation for required components
    const addressStr = address.trim();
    if (addressStr.length < 10) {
      throw new Error('Please provide a more detailed address');
    }

    // Check for basic address components
    const hasStreet = /\d+\s+[A-Za-z\s]+/.test(addressStr);
    const hasCity = /[A-Za-z]{2,}/.test(addressStr);
    
    if (!hasStreet || !hasCity) {
      throw new Error('Please include street number, street name, and city');
    }

    return addressStr;
  };

  // Generate comprehensive map links
  const generateMapLink = (address, providerType = '') => {
    if (!address) return '#';
    
    const encodedAddress = encodeURIComponent(address);
    const baseMaps = {
      google: `https://maps.google.com/?q=${encodedAddress}`,
      apple: `https://maps.apple.com/?q=${encodedAddress}`,
      waze: `https://waze.com/ul?q=${encodedAddress}`,
      mapsApp: `https://maps.app.goo.gl/?q=${encodedAddress}`
    };
    
    return baseMaps.google; // Default to Google Maps
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
        locationInfo.displayName = getProviderLocationName(provider.type);
        locationInfo.address = provider.businessAddress || provider.address || 'Address not specified';
        locationInfo.instructions = provider.locationInstructions || '';
        locationInfo.mapLink = generateMapLink(locationInfo.address, provider.type);
        break;
      
      default:
        locationInfo.displayName = `${getProfessionalTitle(provider.type)}'s Location`;
        locationInfo.address = provider.address || 'Address not specified';
        locationInfo.mapLink = generateMapLink(locationInfo.address, provider.type);
    }

    return locationInfo;
  };

  // Get provider-specific location names
  const getProviderLocationName = (serviceType) => {
    const locationNames = {
      chef: "Chef's Kitchen",
      barber: "Barber Shop", 
      barbar: "Barber Shop",
      tattoo: "Tattoo Studio",
      beauty: "Beauty Salon",
      spa: "Spa Center",
      photography: "Photography Studio",
      massage: "Massage Studio",
      tutor: "Tutoring Center",
      default: "Professional's Location"
    };
    
    return locationNames[serviceType] || locationNames.default;
  };

  // Enhanced location-specific messaging
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

  // Helper functions for social media verification
  const generateUsername = (name, platform) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const suffixes = ['', 'official', 'professionals', 'styles', 'studio', 'hair', 'beauty', 'chef', 'cooking', 'art', 'tattoo', 'photography'];
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
  const verifySocialMediaPresence = async (helperData) => {
    setVerifyingSocialMedia(true);
    
    try {
      // Simulate AI API calls to check social media presence
      setTimeout(() => {
        // Generate realistic mock data based on helper information
        const name = helperData.name || '';
        
        // AI logic to determine social media presence
        const hasFacebook = Math.random() > 0.3; // 70% chance
        const hasInstagram = Math.random() > 0.2; // 80% chance
        const hasLinkedIn = Math.random() > 0.4; // 60% chance
        const hasTwitter = Math.random() > 0.5; // 50% chance
        
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

        const linkedinData = hasLinkedIn ? {
          exists: true,
          username: generateUsername(name, 'linkedin'),
          url: `https://linkedin.com/in/${generateUsername(name, 'linkedin')}`,
          isActive: Math.random() > 0.2, // LinkedIn tends to be less frequently updated
          verified: Math.random() > 0.8, // Higher verification chance for professionals
          lastActive: getRandomRecentDate(),
          connections: Math.floor(Math.random() * 500) + 50,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          connections: null,
          verificationStatus: 'not_found'
        };

        const twitterData = hasTwitter ? {
          exists: true,
          username: generateUsername(name, 'twitter'),
          url: `https://twitter.com/${generateUsername(name, 'twitter')}`,
          isActive: Math.random() > 0.4,
          verified: Math.random() > 0.5,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 3000) + 100,
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
          instagram: instagramData,
          linkedin: linkedinData,
          twitter: twitterData
        });
        setVerifyingSocialMedia(false);
      }, 2000);

    } catch (error) {
      console.error('Error verifying social media:', error);
      setVerifyingSocialMedia(false);
    }
  };

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/helper/get/${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch helper details');
        }

        const data = await res.json();
        setHelper(data);

        // Simulate AI assessment on data load
        simulateAiAssessment(data);

        // Check if helper is barber, chef, beauty, domestic, or maid and verify social media
        if (['barber', 'barbar', 'chef', 'cooking', 'beauty', 'spa', 'domestic', 'maid', 'tattoo', 'tutor', 'photography'].includes(data.type)) {
          verifySocialMediaPresence(data);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchHelper();
  }, [id]);

  // Scroll detection for booking belt
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 600;
      setShowBookingBelt(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate AI assessment of helper content
  const simulateAiAssessment = (helperData) => {
    // Simulate processing delay
    setTimeout(() => {
      const description = helperData.description || '';

      // Calculate description quality based on length and keywords
      let descScore = 0;
      if (description.length > 200) descScore += 2;
      if (description.length > 500) descScore += 1;
      if (description.includes("experience") || description.includes("professional")) descScore += 1;
      if (description.includes("certified") || description.includes("qualified")) descScore += 1;

      // Barber-specific scoring
      if (helperData.type === 'barber' || helperData.type === 'barbar') {
        if (description.includes("certified") || description.includes("licensed")) descScore += 2;
        if (description.includes("sanitized") || description.includes("hygiene")) descScore += 1;
        if (description.includes("modern") || description.includes("trends")) descScore += 1;
        if (description.includes("fade") || description.includes("beard")) descScore += 1;
      }

      // Beauty-specific scoring
      if (helperData.type === 'beauty' || helperData.type === 'spa') {
        if (description.includes("certified") || description.includes("licensed")) descScore += 2;
        if (description.includes("hygiene") || description.includes("sanitized")) descScore += 1;
        if (description.includes("premium") || description.includes("professional")) descScore += 1;
      }

      // Chef-specific scoring
      if (helperData.type === 'chef' || helperData.type === 'cooking') {
        if (description.includes("certified") || description.includes("culinary")) descScore += 2;
        if (description.includes("hygiene") || description.includes("sanitized")) descScore += 1;
        if (description.includes("gourmet") || description.includes("professional")) descScore += 1;
        if (description.includes("menu") || description.includes("cuisine")) descScore += 1;
      }

      // Tattoo-specific scoring
      if (helperData.type === 'tattoo') {
        if (description.includes("certified") || description.includes("licensed")) descScore += 2;
        if (description.includes("sanitized") || description.includes("hygiene")) descScore += 1;
        if (description.includes("portfolio") || description.includes("experience")) descScore += 1;
      }

      // Tutor-specific scoring
      if (helperData.type === 'tutor') {
        if (description.includes("certified") || description.includes("qualified")) descScore += 2;
        if (description.includes("degree") || description.includes("education")) descScore += 1;
        if (description.includes("experience") || description.includes("professional")) descScore += 1;
      }

      // Photography-specific scoring
      if (helperData.type === 'photography') {
        if (description.includes("certified") || description.includes("professional")) descScore += 2;
        if (description.includes("equipment") || description.includes("camera")) descScore += 1;
        if (description.includes("portfolio") || description.includes("experience")) descScore += 1;
        if (description.includes("editing") || description.includes("retouching")) descScore += 1;
      }

      // Calculate image quality based on number of images
      let imgScore = 0;
      if (helperData.imageUrls?.length > 0) imgScore = 3;
      if (helperData.imageUrls?.length > 2) imgScore = 4;
      if (helperData.imageUrls?.length > 4) imgScore = 5;

      // Overall rating (weighted average)
      const overall = Math.min(5, (descScore + imgScore) / 2);

      // Random likes/dislikes count
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
    setBookingData(prev => {
      const selectedServices = [...prev.selectedServices];
      const serviceIndex = selectedServices.indexOf(serviceId);
      
      if (serviceIndex > -1) {
        selectedServices.splice(serviceIndex, 1);
      } else {
        selectedServices.push(serviceId);
      }
      
      return { ...prev, selectedServices };
    });
  };

  // Handle equipment selection
  const handleEquipmentSelection = (equipment) => {
    const currentEquipment = bookingData.cookingEquipment ? bookingData.cookingEquipment.split(',') : [];
    const index = currentEquipment.indexOf(equipment);
    
    if (index > -1) {
      currentEquipment.splice(index, 1);
    } else {
      currentEquipment.push(equipment);
    }
    
    setBookingData({
      ...bookingData,
      cookingEquipment: currentEquipment.join(',')
    });
  };

  // Handle file attachments
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isSizeValid = file.size <= 5 * 1024 * 1024; // 5MB

      return (isImage || isPDF) && isSizeValid;
    });

    // Limit to 2 files
    const newAttachments = [...attachments, ...validFiles].slice(0, 2);
    setAttachments(newAttachments);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Upload files to cloud storage (mock implementation)
  const uploadFilesToCloud = async (files) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return files.map(file => {
      // Create a mock URL for demonstration
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

  // Enhanced helper function to get location requirements
  const getLocationRequirements = (serviceType) => {
    const requirements = {
      chef: {
        comeToYou: [
          'kitchenAccess',
          'cookingEquipment', 
          'diningSpace',
          'powerOutlets'
        ],
        goToThem: [
          'professionalKitchen',
          'diningFacilities'
        ]
      },
      barber: {
        comeToYou: [
          'workspace',
          'powerSource',
          'mirrorAccess'
        ],
        goToThem: [
          'professionalSetup',
          'sanitation'
        ]
      },
      photography: {
        comeToYou: [
          'shootingSpace',
          'naturalLight',
          'powerOutlets'
        ],
        goToThem: [
          'studioSpace',
          'lightingEquipment'
        ]
      },
      beauty: {
        comeToYou: [
          'cleanSpace',
          'powerSource', 
          'mirrorAccess'
        ],
        goToThem: [
          'sanitizedStation',
          'professionalTools'
        ]
      }
    };

    return requirements[serviceType] || {
      comeToYou: ['cleanWorkspace', 'powerOutlets'],
      goToThem: ['professionalEnvironment']
    };
  };

  // Enhanced WhatsApp booking function with all form data
  const handleQuickBooking = () => {
    if (!helper?.contact) {
      alert(`${getProfessionalTitle(helper?.type)} contact information is missing.`);
      return;
    }

    // Basic validation
    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number first.");
      return;
    }

    // Enhanced location validation for quick booking
    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for home service in the booking form.");
      return;
    }

    const clientPhone = formatContactForWhatsApp(bookingData.phone);
    const acceptMessage = `Accept the service ${bookingData.name}, I accept your booking for ${helper.name}. See you then!`;
    const declineMessage = `Decline the service ${bookingData.name}, I'm unable to accept this booking. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Enhanced location handling for quick booking
    const locationInfo = handleLocationInfo(bookingData, helper);
    const locationMessage = getLocationSpecificMessage(bookingData, helper);

    let message = `*📅 Quick Booking Request for ${helper.name}*%0A%0A`;
    message += `*👤 Client Details*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone}%0A`;
    
    if (bookingData.date) {
      message += `• Date: ${bookingData.date}%0A`;
    }
    if (bookingData.time) {
      message += `• Time: ${bookingData.time}%0A`;
    }
    
    // Add location details to quick booking
    message += locationMessage;
    
    message += `%0A`;
    message += `*💼 Service Details*%0A`;
    message += `• Service: ${getProfessionalTitle(helper.type)}%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;
    
    // Enhanced service selection details
    if (bookingData.selectedServices.length > 0) {
      const serviceOptions = getServiceOptions(helper.type);
      const selectedServiceNames = bookingData.selectedServices.map(serviceId => {
        const service = serviceOptions.find(s => s.id === serviceId);
        return service ? service.name : serviceId;
      }).join(', ');
      message += `• Selected Services: ${selectedServiceNames}%0A`;
    }

    // Add barber-specific details to quick booking
    if ((helper.type === 'barber' || helper.type === 'barbar') && bookingData.selectedHaircut) {
      const haircut = haircutStyles.find(h => h.id === bookingData.selectedHaircut);
      if (haircut) {
        message += `• Haircut Style: ${haircut.name}%0A`;
      }
    }

    if ((helper.type === 'barber' || helper.type === 'barbar') && bookingData.beardStyle) {
      const beard = beardStyles.find(b => b.id === bookingData.beardStyle);
      if (beard) {
        message += `• Beard Style: ${beard.name}%0A`;
      }
    }

    if (bookingData.hairLength) {
      message += `• Current Hair Length: ${bookingData.hairLength}%0A`;
    }

    // Add chef-specific details to quick booking
    if ((helper.type === 'chef' || helper.type === 'cooking') && bookingData.mealType) {
      const meal = mealTypes.find(m => m.id === bookingData.mealType);
      if (meal) {
        message += `• Meal Type: ${meal.name}%0A`;
      }
    }

    if ((helper.type === 'chef' || helper.type === 'cooking') && bookingData.cuisinePreference) {
      const cuisine = cuisineTypes.find(c => c.id === bookingData.cuisinePreference);
      if (cuisine) {
        message += `• Cuisine Preference: ${cuisine.name}%0A`;
      }
    }

    if (bookingData.numberOfGuests) {
      message += `• Number of Guests: ${bookingData.numberOfGuests}%0A`;
    }

    if (bookingData.dietaryRestrictions) {
      message += `• Dietary Restrictions: ${bookingData.dietaryRestrictions}%0A`;
    }

    if (bookingData.ingredientsProvided) {
      message += `• Ingredients: ${bookingData.ingredientsProvided === 'yes' ? 'Client will provide' : 'Chef to provide'}%0A`;
    }

    // Add photography-specific details to quick booking
    if ((helper.type === 'photography') && bookingData.photographyType) {
      message += `• Photography Type: ${bookingData.photographyType}%0A`;
    }

    if ((helper.type === 'photography') && bookingData.sessionDuration) {
      message += `• Session Duration: ${bookingData.sessionDuration} hours%0A`;
    }

    if ((helper.type === 'photography') && bookingData.numberOfPeople) {
      message += `• Number of People: ${bookingData.numberOfPeople}%0A`;
    }

    if ((helper.type === 'photography') && bookingData.deliveryFormat) {
      message += `• Delivery Format: ${bookingData.deliveryFormat}%0A`;
    }

    // Add service provider details to quick booking
    message += `%0A*🏠 Service Provider Details*%0A`;
    
    if (bookingData.addressProvided) {
      message += `• Address Provided: ${bookingData.addressProvided}%0A`;
    }
    
    if (bookingData.foodProvided) {
      message += `• Food Provided: ${bookingData.foodProvided === 'yes' ? 'Yes' : 'No'}%0A`;
    }
    
    if (bookingData.cleaningProvided) {
      message += `• Cleaning Provided: ${bookingData.cleaningProvided === 'yes' ? 'Yes' : 'No'}%0A`;
    }
    
    if (bookingData.equipmentProvided) {
      message += `• Equipment Provided: ${bookingData.equipmentProvided === 'yes' ? 'Yes' : 'No'}%0A`;
    }
    
    if (bookingData.otherDetails) {
      message += `• Other Details: ${bookingData.otherDetails}%0A`;
    }

    if (bookingData.specialRequirements) {
      message += `• Special Requirements: ${bookingData.specialRequirements}%0A`;
    }

    if (bookingData.photographyRequirements) {
      message += `• Photography Requirements: ${bookingData.photographyRequirements}%0A`;
    }
    
    // Enhanced location details for quick booking
    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      message += `%0A*📍 LOCATION FOR SERVICE*%0A`;
      message += `• Service at Client's Location%0A`;
      message += `• Address: ${bookingData.address}%0A`;
      
      // Add location requirements based on service type
      message += `• Location Requirements:%0A`;
      if (helper.type === 'chef') {
        message += `  ✓ Kitchen access with basic cooking equipment%0A`;
        message += `  ✓ Dining area for meal service%0A`;
        message += `  ✓ Power outlets for appliances%0A`;
      } else if (helper.type === 'barber' || helper.type === 'barbar') {
        message += `  ✓ Well-lit workspace with chair%0A`;
        message += `  ✓ Power source for clippers%0A`;
        message += `  ✓ Mirror access for styling%0A`;
      } else if (helper.type === 'photography') {
        message += `  ✓ Adequate shooting space%0A`;
        message += `  ✓ Natural light preferred%0A`;
        message += `  ✓ Power outlets for equipment%0A`;
      } else if (helper.type === 'beauty') {
        message += `  ✓ Clean, well-lit workspace%0A`;
        message += `  ✓ Power source for tools%0A`;
        message += `  ✓ Mirror access%0A`;
      } else if (helper.type === 'baker') {
        message += `  ✓ Clean kitchen workspace%0A`;
        message += `  ✓ Power outlets for baking equipment%0A`;
        message += `  ✓ Adequate counter space%0A`;
      } else {
        message += `  ✓ Clean, accessible workspace with power outlets%0A`;
      }
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Map: ${locationInfo.mapLink}%0A`;
      }
      
      if (locationInfo.travelFee > 0) {
        message += `• Travel Fee: R${locationInfo.travelFee}%0A`;
      }
    } else if (bookingData.locationOption === 'goToThem' && helper.address) {
      message += `%0A*📍 SERVICE LOCATION*%0A`;
      message += `• Service at ${getProfessionalTitle(helper.type)}'s Location%0A`;
      message += `• Address: ${helper.address}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Map: ${locationInfo.mapLink}%0A`;
      }
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
    message += `_Sent via loopOut Quick Booking_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // ==================== ENHANCED BOOKING SUBMIT FUNCTION ====================
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!helper?.contact) {
      alert(`${getProfessionalTitle(helper?.type)} contact information is missing. Please try another contact method.`);
      return;
    }

    // Enhanced location validation
    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for home service.");
      return;
    }

    try {
      // Validate and format address
      if (bookingData.locationOption === 'comeToYou') {
        const formattedAddress = validateAndFormatAddress(bookingData.address);
        setBookingData(prev => ({ ...prev, address: formattedAddress }));
      }
    } catch (error) {
      alert(error.message);
      return;
    }

    // Validate service selection
    if (
      (helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef' || helper.type === 'tattoo' || helper.type === 'tutor' || helper.type === 'photography') && 
      bookingData.selectedServices.length === 0
    ) {
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

    // Format the client's phone number for the reply link
    const clientPhone = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';

    // Define the accept and decline messages and their corresponding links
    const acceptMessage = `Accept the service ${bookingData.name}, I accept your booking for ${helper.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Decline the service ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Enhanced location handling
    const locationInfo = handleLocationInfo(bookingData, helper);
    const locationMessage = getLocationSpecificMessage(bookingData, helper);

    // Build the main WhatsApp message with enhanced location details
    let message = `*${helper.type === 'chef' ? '👨‍🍳' : helper.type === 'barber' || helper.type === 'barbar' ? '✂️' : helper.type === 'tattoo' ? '🎨' : helper.type === 'photography' ? '📷' : helper.type === 'baker' ? '🍰' : '👤'} New ${getProfessionalTitle(helper.type)} Booking Request for ${helper.name}*%0A%0A`;

    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;
    
    // Add selected services
    const serviceOptions = getServiceOptions(helper.type);
    if (bookingData.selectedServices.length > 0) {
      const selectedServiceNames = bookingData.selectedServices.map(serviceId => {
        const service = serviceOptions.find(s => s.id === serviceId);
        return service ? service.name : serviceId;
      }).join(', ');
      
      message += `• Services: ${selectedServiceNames}%0A`;
    }

    // Add barber-specific details
    if ((helper.type === 'barber' || helper.type === 'barbar') && bookingData.selectedHaircut) {
      const haircut = haircutStyles.find(h => h.id === bookingData.selectedHaircut);
      if (haircut) {
        message += `• Haircut Style: ${haircut.name}%0A`;
      }
    }

    if ((helper.type === 'barber' || helper.type === 'barbar') && bookingData.beardStyle) {
      const beard = beardStyles.find(b => b.id === bookingData.beardStyle);
      if (beard) {
        message += `• Beard Style: ${beard.name}%0A`;
      }
    }

    if (bookingData.hairLength) {
      message += `• Current Hair Length: ${bookingData.hairLength}%0A`;
    }

    // Add chef-specific details
    if ((helper.type === 'chef' || helper.type === 'cooking') && bookingData.mealType) {
      const meal = mealTypes.find(m => m.id === bookingData.mealType);
      if (meal) {
        message += `• Meal Type: ${meal.name}%0A`;
      }
    }

    if ((helper.type === 'chef' || helper.type === 'cooking') && bookingData.cuisinePreference) {
      const cuisine = cuisineTypes.find(c => c.id === bookingData.cuisinePreference);
      if (cuisine) {
        message += `• Cuisine Preference: ${cuisine.name}%0A`;
      }
    }

    if (bookingData.numberOfGuests) {
      message += `• Number of Guests: ${bookingData.numberOfGuests}%0A`;
    }

    if (bookingData.dietaryRestrictions) {
      message += `• Dietary Restrictions: ${bookingData.dietaryRestrictions}%0A`;
    }

    if (bookingData.ingredientsProvided) {
      message += `• Ingredients: ${bookingData.ingredientsProvided === 'yes' ? 'Client will provide' : 'Chef to provide'}%0A`;
    }

    // Add photography-specific details
    if ((helper.type === 'photography') && bookingData.photographyType) {
      message += `• Photography Type: ${bookingData.photographyType}%0A`;
    }

    if ((helper.type === 'photography') && bookingData.sessionDuration) {
      message += `• Session Duration: ${bookingData.sessionDuration} hours%0A`;
    }

    if ((helper.type === 'photography') && bookingData.numberOfPeople) {
      message += `• Number of People: ${bookingData.numberOfPeople}%0A`;
    }

    if ((helper.type === 'photography') && bookingData.deliveryFormat) {
      message += `• Delivery Format: ${bookingData.deliveryFormat}%0A`;
    }

    // Add service provider details
    message += `%0A*🏠 SERVICE PROVIDER DETAILS*%0A`;
    
    if (bookingData.addressProvided) {
      message += `• Address Provided: ${bookingData.addressProvided}%0A`;
    }
    
    if (bookingData.foodProvided) {
      message += `• Food Provided: ${bookingData.foodProvided === 'yes' ? 'Yes' : 'No'}%0A`;
    }
    
    if (bookingData.cleaningProvided) {
      message += `• Cleaning Provided: ${bookingData.cleaningProvided === 'yes' ? 'Yes' : 'No'}%0A`;
    }
    
    if (bookingData.equipmentProvided) {
      message += `• Equipment Provided: ${bookingData.equipmentProvided === 'yes' ? 'Yes' : 'No'}%0A`;
    }
    
    if (bookingData.cookingEquipment) {
      message += `• Equipment Details: ${bookingData.cookingEquipment}%0A`;
    }
    
    if (bookingData.otherDetails) {
      message += `• Other Details: ${bookingData.otherDetails}%0A`;
    }
    
    if (locationInfo.travelFee > 0) {
      message += `• Travel Fee: R${locationInfo.travelFee}%0A`;
    }
    message += `• ${getProfessionalTitle(helper.type)} Contact: ${helper.contact}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    
    // Enhanced location section
    message += locationMessage;
    
    message += `• Special Requirements: ${bookingData.specialRequirements || 'None'}%0A`;
    
    if (bookingData.photographyRequirements) {
      message += `• Photography Requirements: ${bookingData.photographyRequirements}%0A`;
    }
    
    message += `%0A`;

    // Enhanced location instructions for home visits
    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Service Type: Home Service (${getProfessionalTitle(helper.type)} comes to you)%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Navigation Link:%0A  ${locationInfo.mapLink}%0A`;
      }
      
      // Add service-specific location requirements
      const requirements = getLocationRequirements(helper.type);
      if (requirements.comeToYou && requirements.comeToYou.length > 0) {
        message += `• Location Requirements:%0A`;
        requirements.comeToYou.forEach(req => {
          const reqText = {
            kitchenAccess: '✓ Kitchen access required',
            cookingEquipment: '✓ Basic cooking equipment needed',
            diningSpace: '✓ Dining area required',
            shootingSpace: '✓ Adequate shooting space needed',
            naturalLight: '✓ Natural light preferred',
            powerOutlets: '✓ Power outlets required',
            chairSpace: '✓ Chair and workspace needed',
            powerSource: '✓ Power source required',
            mirrorAccess: '✓ Mirror access needed',
            cleanSpace: '✓ Clean, well-lit workspace required',
            bakingEquipment: '✓ Power outlets for baking equipment',
            counterSpace: '✓ Adequate counter space needed'
          }[req] || `✓ ${req}`;
          message += `  ${reqText}%0A`;
        });
      }
      
      if (locationInfo.instructions) {
        message += `• Additional Instructions: ${locationInfo.instructions}%0A`;
      }
      
      message += `%0A`;
    } else if (bookingData.locationOption === 'goToThem' && helper.address) {
      message += `*📍 SERVICE LOCATION*%0A`;
      message += `• Service Type: At ${getProfessionalTitle(helper.type)}'s Location%0A`;
      message += `• Business Name: ${getProviderLocationName(helper.type)}%0A`;
      message += `• Address: ${helper.address}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Navigation Link: ${locationInfo.mapLink}%0A`;
      }
      
      if (locationInfo.instructions) {
        message += `• Location Instructions: ${locationInfo.instructions}%0A`;
      }
      
      message += `%0A`;
    }

    // Add attachments if they exist
    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A_Files uploaded for your reference_%0A%0A`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: ${file.name}%0A`;
        message += `  ${file.url}%0A%0A`;
      });
    }

    // Add action links for the helper to accept or decline
    message += `*ACTION REQUIRED*%0A`;
    message += `Tap a link to reply to the client:%0A%0A`;
    if (acceptLink) {
      message += `✅ Accept: ${acceptLink}%0A`;
    }
    if (declineLink) {
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `💬 You can also reply directly to this message.%0A%0A`;
    message += `_Sent via loopOut Booking System_`;

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Close the booking form overlay after sending
    closeBookingFormOverlay();

    // Reset attachments after sending
    setAttachments([]);
  };
  // ==================== END ENHANCED BOOKING SUBMIT FUNCTION ====================

  // Simulate AI analysis of comments
  const analyzeCommentsWithAI = () => {
    setAnalyzingComments(true);

    // Simulate API call to AI service
    setTimeout(() => {
      // Generate random quality scores for comments
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

  // Function to open full-page booking form overlay
  const openBookingFormOverlay = () => {
    setShowBookingFormOverlay(true);
    // Prevent body scrolling when overlay is open
    document.body.style.overflow = 'hidden';
  };

  // Function to close full-page booking form overlay
  const closeBookingFormOverlay = () => {
    setShowBookingFormOverlay(false);
    // Restore body scrolling
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
    if (helper.imageUrls && helper.imageUrls.length > 0) {
      setCurrentGalleryIndex((prevIndex) => 
        prevIndex === helper.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (helper.imageUrls && helper.imageUrls.length > 0) {
      setCurrentGalleryIndex((prevIndex) => 
        prevIndex === 0 ? helper.imageUrls.length - 1 : prevIndex - 1
      );
    }
  };

  const whatsappNumber = helper ? formatContactForWhatsApp(helper.contact) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi ${helper.name}, I'm interested in your ${getProfessionalTitle(helper.type).toLowerCase()} services.`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading professional details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Error loading profile</h3>
              <p className="mt-2 text-red-600">{error}</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

  if (!helper) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Professional not found</h2>
          <p className="text-gray-600 mb-6">The professional you're looking for doesn't exist or may have been removed.</p>
          <button
            onClick={() => navigate('/helper-home-page')}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
          >
            Browse Professionals
          </button>
        </div>
      </div>
    );
  }

  const description = helper.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  const serviceOptions = getServiceOptions(helper.type);
  const serviceEquipmentOptions = equipmentOptions[helper.type] || equipmentOptions.default;

  // Airbnb-style image gallery layout
  const renderImageGallery = () => {
    if (!helper.imageUrls || helper.imageUrls.length === 0) return null;
    
    const images = helper.imageUrls;
    const mainImage = images[0];
    const sideImages = images.slice(1, 5);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-0">
        {/* Main large image */}
        <div 
          className="relative h-full cursor-pointer group"
          onClick={() => openFullScreenGallery(0)}
        >
          <img
            src={mainImage}
            alt={helper.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        
        {/* Side images grid */}
        <div className="hidden md:grid grid-cols-2 gap-2 h-full">
          {sideImages.map((url, index) => (
            <div 
              key={index}
              className="relative h-full cursor-pointer group overflow-hidden"
              onClick={() => openFullScreenGallery(index + 1)}
            >
              <img
                src={url}
                alt={`${helper.name} ${index + 2}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              {/* Show all photos button on last image */}
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <FaExpand /> Show all photos
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {/* Fill empty slots if less than 4 side images */}
          {sideImages.length < 4 && Array(4 - sideImages.length).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-100 h-full" />
          ))}
        </div>
        
        {/* Mobile: Show all photos button */}
        <button
          onClick={() => openFullScreenGallery(0)}
          className="md:hidden absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg"
        >
          <FaExpand /> Show all photos
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}
            >
              <FaArrowLeft className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare} 
                className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}
              >
                <FiShare2 className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              </button>
              <button 
                onClick={toggleFavorite} 
                className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}
              >
                {isFavorite ? 
                  <FaHeart className="text-xl text-rose-500" /> : 
                  <FiHeart className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            {getProfessionalTitle(helper.type)} services by {helper.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FaStar className="text-rose-500" />
              <span className="font-semibold">{helper.rating || '4.5'}</span>
              <span className="text-gray-500">·</span>
              <button 
                onClick={() => setShowCommentsPanel(true)}
                className="underline text-gray-700"
              >
                {helper.reviewCount || '25'} reviews
              </button>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 text-gray-700">
              <FaMedal className="text-rose-500" />
              <span>Superhost</span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 text-gray-700 underline cursor-pointer">
              <FaMapMarkerAlt />
              <span>{helper.address || 'Johannesburg, South Africa'}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info Bar */}
            <div className="flex items-start justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {getProfessionalTitle(helper.type)} hosted by {helper.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {helper.host || 5}+ years of experience · Top rated professional
                </p>
              </div>
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200">
                <img
                  src={helper.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=200&q=80'}
                  alt={helper.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <FaMedal className="text-2xl text-gray-700 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Top rated professional</h3>
                  <p className="text-gray-600 text-sm">Highly rated for quality, reliability, and customer satisfaction</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaUser className="text-2xl text-gray-700 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Experienced & Verified</h3>
                  <p className="text-gray-600 text-sm">Background checked with verified credentials and references</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaRegClock className="text-2xl text-gray-700 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Flexible scheduling</h3>
                  <p className="text-gray-600 text-sm">Available 7 days a week with flexible hours to suit your needs</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this professional</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {displayText.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {description.length > 300 && (
                <button
                  onClick={toggleDescription}
                  className="mt-4 text-gray-900 font-semibold underline flex items-center gap-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                  {showFullDescription ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                </button>
              )}
            </div>

            {/* Services Offered */}
            {(helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef' || helper.type === 'tattoo' || helper.type === 'tutor' || helper.type === 'photography') && (
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceOptions.map((service) => (
                    <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="text-xl">{service.icon}</div>
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Summary */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <FaStar className="text-rose-500 text-2xl" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {helper.rating || '4.5'} · {helper.reviewCount || '25'} reviews
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cleanliness</span>
                    <span className="font-semibold">4.9</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-gray-900 rounded-full w-[98%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Communication</span>
                    <span className="font-semibold">4.8</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-gray-900 rounded-full w-[96%]" />
                  </div>
                </div>
              </div>

              <HelperComments 
                helperId={helper._id} 
                onCommentCountChange={setCommentCount}
                onAnalyzeComments={analyzeCommentsWithAI}
                commentAnalysis={commentAnalysis}
                analyzingComments={analyzingComments}
              />
            </div>

            {/* Location */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Where you'll be</h2>
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-4xl mx-auto mb-2" />
                    <p>{helper.address || 'Johannesburg, South Africa'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-2xl font-semibold text-gray-900">R{helper.regularPrice}</span>
                    <span className="text-gray-600"> / service</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FaStar className="text-rose-500" />
                    <span className="font-semibold">{helper.rating || '4.5'}</span>
                  </div>
                </div>

                {/* Quick Booking Form */}
                <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-sm text-gray-700 outline-none mt-1"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        className="w-full text-sm text-gray-700 outline-none mt-1"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      placeholder="Full name"
                      className="w-full text-sm text-gray-700 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={openBookingFormOverlay}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors mb-4"
                >
                  Check availability
                </button>

                <div className="text-center text-gray-500 text-sm mb-4">
                  You won't be charged yet
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="underline">R{helper.regularPrice} × 1 day (8 hours)</span>
                    <span>R{helper.regularPrice}</span>
                  </div>
                  {helper.travelFee > 0 && (
                    <div className="flex justify-between">
                      <span className="underline">Travel fee</span>
                      <span>R{helper.travelFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="underline">Service fee</span>
                    <span>R{Math.round(helper.regularPrice * 0.1)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                    <span>Total before taxes</span>
                    <span>R{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Report listing */}
              <div className="mt-4 text-center">
                <button className="text-gray-500 text-sm underline flex items-center justify-center gap-2 mx-auto">
                  <FaFlag className="text-xs" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Screen Gallery Overlay */}
      {showFullScreenGallery && helper.imageUrls && helper.imageUrls.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button
              onClick={closeFullScreenGallery}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
            <span className="font-medium">
              {currentGalleryIndex + 1} / {helper.imageUrls.length}
            </span>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            
            <img
              src={helper.imageUrls[currentGalleryIndex]}
              alt={`Gallery ${currentGalleryIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
            
            <button
              onClick={nextImage}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Full Page Booking Form Overlay */}
      {showBookingFormOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <button
                onClick={closeBookingFormOverlay}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
              <h2 className="text-lg font-semibold">Complete your booking</h2>
              <div className="w-10" />
            </div>
            
            <div className="p-6 space-y-6">
              {/* Form content here - simplified for Airbnb style */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="071 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={bookingData.address}
                      onChange={handleBookingChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Select services</h3>
                <div className="grid grid-cols-2 gap-3">
                  {serviceOptions.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelection(service.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        bookingData.selectedServices.includes(service.id)
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{service.icon}</div>
                      <div className="font-medium text-sm">{service.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={isUploading}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="text-xl" />
                    Send booking request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">R{totalPrice}</span>
            <span className="text-gray-600 text-sm"> / service</span>
          </div>
          <button 
            onClick={openBookingFormOverlay}  // Changed from handleQuickBooking to openBookingFormOverlay
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelHelper
          helperId={helper._id}
          onClose={() => setShowCommentsPanel(false)}
          onAnalyzeComments={analyzeCommentsWithAI}
          commentAnalysis={commentAnalysis}
          analyzingComments={analyzingComments}
        />
      )}
    </div>
  );
}