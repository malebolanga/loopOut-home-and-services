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
  FaWater, FaWind, FaSun, FaCloudRain, FaTemperatureHigh, FaTemperatureLow
} from 'react-icons/fa';
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

  // Helper function to get professional title
  const getProfessionalTitle = (type) => {
    const titles = {
      chef: 'Chef',
      barber: 'Barber',
      barbar: 'Barber',
      beauty: 'Beauty Professional',
      spa: 'Spa Professional',
      maid: 'Maid',
      domestic: 'Domestic Helper',
      tattoo: 'Tattoo Artist',
      tutor: 'Tutor',
      photography: 'Photographer'
    };
    return titles[type] || 'Professional';
  };

  // Service options for different helper types
  const getServiceOptions = (type) => {
    const baseOptions = [
      { id: 'laundry', name: 'Laundry', icon: <FaTshirt className="text-blue-500" /> },
      { id: 'cleaning', name: 'House Cleaning', icon: <FaBroomClean className="text-green-500" /> },
      { id: 'ironing', name: 'Ironing', icon: <FaTshirt className="text-purple-500" /> },
      { id: 'yard', name: 'Yard Cleaning', icon: <FaBroom className="text-yellow-600" /> },
      { id: 'cooking', name: 'Cooking', icon: <FaFire className="text-red-500" /> },
      { id: 'babysitting', name: 'Baby Sitting', icon: <FaBaby className="text-pink-500" /> },
      { id: 'eventCleaning', name: 'After Events Cleaning', icon: <FaGlassCheers className="text-indigo-500" /> },
      { id: 'other', name: 'Other Services', icon: <FaEllipsisH className="text-gray-500" /> }
    ];

    const beautyOptions = [
      { id: 'makeup', name: 'Makeup Artistry', icon: <FaPalette className="text-pink-500" /> },
      { id: 'skincare', name: 'Skincare Treatment', icon: <FaSpa className="text-purple-400" /> },
      { id: 'nails', name: 'Nail Care', icon: <FaHandSparkles className="text-red-400" /> },
      { id: 'hair', name: 'Hair Styling', icon: <FaCut className="text-blue-400" /> },
      { id: 'facial', name: 'Facial Treatment', icon: <FaStar className="text-yellow-500" /> },
      { id: 'waxing', name: 'Waxing', icon: <FaFire className="text-orange-500" /> },
      { id: 'massage', name: 'Relaxation Massage', icon: <FaHandHoldingHeart className="text-green-400" /> },
      { id: 'bridal', name: 'Bridal Package', icon: <FaRing className="text-rose-500" /> }
    ];

    const barberOptions = [
      { id: 'haircut', name: 'Haircut', icon: <FaCut className="text-blue-600" /> },
      { id: 'beardTrim', name: 'Beard Trim', icon: <FaUser className="text-gray-700" /> },
      { id: 'shave', name: 'Straight Razor Shave', icon: <FaTools className="text-gray-900" /> },
      { id: 'fade', name: 'Fade Cut', icon: <FaCut className="text-indigo-600" /> },
      { id: 'coloring', name: 'Hair Coloring', icon: <FaBrush className="text-purple-500" /> },
      { id: 'styling', name: 'Hair Styling', icon: <FaSprayCan className="text-yellow-600" /> },
      { id: 'kidsCut', name: 'Kids Haircut', icon: <FaSmile className="text-green-500" /> },
      { id: 'consultation', name: 'Style Consultation', icon: <FaUser className="text-teal-500" /> }
    ];

    const chefOptions = [
      { id: 'mealPrep', name: 'Meal Preparation', icon: <FaUtensils className="text-orange-500" /> },
      { id: 'privateDining', name: 'Private Dining', icon: <FaUtensils className="text-red-500" /> },
      { id: 'cookingClasses', name: 'Cooking Classes', icon: <FaGraduationCap className="text-green-500" /> },
      { id: 'eventCatering', name: 'Event Catering', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'dietMeals', name: 'Special Diet Meals', icon: <FaCookie className="text-blue-500" /> },
      { id: 'baking', name: 'Baking & Pastry', icon: <FaCookie className="text-yellow-500" /> },
      { id: 'groceryShopping', name: 'Grocery Shopping', icon: <FaShoppingBasket className="text-teal-500" /> },
      { id: 'menuPlanning', name: 'Menu Planning', icon: <FaUtensils className="text-indigo-500" /> }
    ];

    const tattooOptions = [
      { id: 'custom', name: 'Custom Tattoo', icon: <FaPalette className="text-gray-800" /> },
      { id: 'coverup', name: 'Tattoo Cover-up', icon: <FaBrush className="text-purple-600" /> },
      { id: 'touchup', name: 'Tattoo Touch-up', icon: <FaTools className="text-blue-600" /> },
      { id: 'consultation', name: 'Design Consultation', icon: <FaUser className="text-teal-500" /> }
    ];

    const tutorOptions = [
      { id: 'math', name: 'Mathematics', icon: <FaGraduationCap className="text-blue-600" /> },
      { id: 'science', name: 'Science', icon: <FaGraduationCap className="text-green-600" /> },
      { id: 'language', name: 'Language', icon: <FaGraduationCap className="text-yellow-600" /> },
      { id: 'music', name: 'Music', icon: <FaGraduationCap className="text-purple-600" /> },
      { id: 'art', name: 'Art', icon: <FaPalette className="text-pink-600" /> },
      { id: 'testPrep', name: 'Test Preparation', icon: <FaGraduationCap className="text-red-600" /> }
    ];

    const photographyOptions = [
      { id: 'portrait', name: 'Portrait Photography', icon: <FaUser className="text-blue-500" /> },
      { id: 'event', name: 'Event Photography', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'product', name: 'Product Photography', icon: <FaShoppingBasket className="text-green-500" /> },
      { id: 'wedding', name: 'Wedding Photography', icon: <FaRing className="text-pink-500" /> },
      { id: 'family', name: 'Family Photography', icon: <FaUserFriends className="text-orange-500" /> },
      { id: 'commercial', name: 'Commercial Photography', icon: <FaBriefcase className="text-indigo-500" /> },
      { id: 'realestate', name: 'Real Estate Photography', icon: <FaHome className="text-yellow-600" /> },
      { id: 'landscape', name: 'Landscape Photography', icon: <FaMapMarkerAlt className="text-teal-500" /> }
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

  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = helper ? getThemeColor(helper.type) : 'red';

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
      const scrollThreshold = 300;
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading {helper?.type ? getProfessionalTitle(helper.type).toLowerCase() : 'professional'} details...</p>
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
              <h3 className="text-lg font-semibold text-red-800">Error loading professional profile</h3>
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

  if (!helper) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-6">
            <FaUser className="text-gray-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Professional not found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">The professional you're looking for doesn't exist or may have been removed from our platform.</p>
          <button
            onClick={() => navigate('/helper-home-page')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Other Professionals
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
      {showFullScreenGallery && helper.imageUrls && helper.imageUrls.length > 0 && (
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
                {helper.name}'s Gallery
              </div>
            </div>
            <div className="text-white/80 font-medium">
              {currentGalleryIndex + 1} / {helper.imageUrls.length}
            </div>
          </div>

          <div className="gallery-main-image">
            <img
              src={helper.imageUrls[currentGalleryIndex]}
              alt={`Gallery image ${currentGalleryIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80';
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

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-lg">
              {currentGalleryIndex + 1} / {helper.imageUrls.length}
            </div>
          </div>

          {/* Thumbnails */}
          {helper.imageUrls.length > 1 && (
            <div className="p-6 bg-black/50 backdrop-blur-lg border-t border-white/10">
              <Swiper
                modules={[FreeMode]}
                spaceBetween={12}
                slidesPerView="auto"
                freeMode={true}
                className="thumbs-swiper"
              >
                {helper.imageUrls.map((url, index) => (
                  <SwiperSlide key={index} style={{ width: '100px' }}>
                    <div
                      className={`gallery-thumbnail ${index === currentGalleryIndex ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
                      onClick={() => setCurrentGalleryIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=200&q=80';
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
              {/* Overlay Header */}
              <div className="gradient-header p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-1xl font-bold text-white">
                      Book {getProfessionalTitle(helper.type)} Services
                    </h2>
                    <p className="text-blue-100 mt-2 text-sm">
                      Complete the form below to book {helper.name} via WhatsApp
                    </p>
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

                  {/* Address Section */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Address Details</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Your Address for Home Service *
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
                        <p className="text-sm text-gray-500">Full address is required for home service</p>
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

                  {/* Service Provider Details */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Service Provider Details</h4>
                    
                    <div className="space-y-6">
                      {/* Food Provided */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Will you provide food for the service provider?
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="foodProvided"
                              value="yes"
                              checked={bookingData.foodProvided === 'yes'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Yes, I will provide food</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="foodProvided"
                              value="no"
                              checked={bookingData.foodProvided === 'no'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">No food will be provided</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="foodProvided"
                              value="arrange"
                              checked={bookingData.foodProvided === 'arrange'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Can arrange if needed</span>
                          </label>
                        </div>
                      </div>

                      {/* Cleaning Provided */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Will you provide cleaning services/area preparation?
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="cleaningProvided"
                              value="yes"
                              checked={bookingData.cleaningProvided === 'yes'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Yes, area will be cleaned/prepared</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="cleaningProvided"
                              value="no"
                              checked={bookingData.cleaningProvided === 'no'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">No cleaning/preparation provided</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="cleaningProvided"
                              value="partial"
                              checked={bookingData.cleaningProvided === 'partial'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Partial cleaning/preparation</span>
                          </label>
                        </div>
                      </div>

                      {/* Equipment Provided */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Will you provide equipment for the service?
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="equipmentProvided"
                              value="yes"
                              checked={bookingData.equipmentProvided === 'yes'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Yes, I have necessary equipment</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="equipmentProvided"
                              value="no"
                              checked={bookingData.equipmentProvided === 'no'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">No equipment, provider must bring</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="equipmentProvided"
                              value="some"
                              checked={bookingData.equipmentProvided === 'some'}
                              onChange={handleBookingChange}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-700">Some equipment available</span>
                          </label>
                        </div>
                      </div>

                      {/* Equipment Selection for Chefs */}
                      {(helper.type === 'chef' || helper.type === 'cooking') && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Available Cooking Equipment
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {serviceEquipmentOptions.map((equipment, index) => (
                              <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-blue-50">
                                <input
                                  type="checkbox"
                                  checked={bookingData.cookingEquipment?.includes(equipment) || false}
                                  onChange={() => handleEquipmentSelection(equipment)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-gray-700 text-sm">{equipment}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Details */}
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
                          placeholder="Any other important details, special instructions, or requirements for the service provider"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Selection */}
                  {(helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef' || helper.type === 'tattoo' || helper.type === 'tutor' || helper.type === 'photography') && (
                    <div className="space-y-6">
                      <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">
                        Select Services
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {serviceOptions.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceSelection(service.id)}
                            className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover-lift ${
                              bookingData.selectedServices.includes(service.id)
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="text-3xl">{service.icon}</div>
                              <span className="text-sm font-semibold text-center">{service.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Barber-specific Fields */}
                  {(helper.type === 'barber' || helper.type === 'barbar') && (
                    <div className="space-y-6">
                      <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Haircut Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Haircut Style
                          </label>
                          <select
                            name="selectedHaircut"
                            value={bookingData.selectedHaircut}
                            onChange={handleBookingChange}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                          >
                            <option value="">Select a style</option>
                            {haircutStyles.map((style) => (
                              <option key={style.id} value={style.id}>
                                {style.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Beard Style
                          </label>
                          <select
                            name="beardStyle"
                            value={bookingData.beardStyle}
                            onChange={handleBookingChange}
                            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                          >
                            <option value="">Select beard style</option>
                            {beardStyles.map((style) => (
                              <option key={style.id} value={style.id}>
                                {style.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Current Hair Length
                        </label>
                        <input
                          type="text"
                          name="hairLength"
                          value={bookingData.hairLength}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                          placeholder="e.g., Short, Medium, Long"
                        />
                      </div>
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
                          <span>Submit </span>
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
              src={helper.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80'}
              alt={helper.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            <div className="image-overlay-content">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{helper.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="professional-badge">
                      <FaStar className="text-xs" /> {getProfessionalTitle(helper.type)}
                    </span>
                    <div className="flex items-center gap-1 text-white/90">
                      <FaMapMarkerAlt />
                      <span>{helper.address || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      <span className="text-white font-bold text-lg">{helper.rating || '4.5'}</span>
                      <span className="text-white/80">({helper.reviewCount || '25'} reviews)</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white font-bold text-lg">R{helper.regularPrice}</span>
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
              src={helper.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=200&q=80'}
              alt={helper.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{helper.name}</h2>
              <p className="text-gray-600 mt-1 truncate">{getProfessionalTitle(helper.type)}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2 text-gray-700 truncate">
                  <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                  <span className="truncate">{helper.address || 'Location not specified'}</span>
                </div>
                {helper.contact && (
                  <div className="flex items-center gap-2 text-gray-700 truncate">
                    <FaPhone className="text-green-500 flex-shrink-0" />
                    <span className="truncate">{helper.contact}</span>
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
            {helper.security && (
              <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                <FaCheckCircle className="text-emerald-600" />
                <span className="text-emerald-800 font-semibold text-xs lg:text-sm">Verified</span>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
              <FaStar className="text-yellow-500" />
              <span className="text-blue-800 font-semibold text-xs lg:text-sm">
                {helper.rating ? `${helper.rating} Rating` : 'Top Rated'}
              </span>
            </div>

            {helper.host && (
              <div className="inline-flex items-center gap-2 bg-orange-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                <FaBriefcase className="text-orange-600" />
                <span className="text-orange-800 font-semibold text-xs lg:text-sm">
                  {helper.host} Years Experience
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Image Gallery */}
    {helper.imageUrls && helper.imageUrls.length > 0 && (
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
          {helper.imageUrls.slice(0, 4).map((url, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
              onClick={() => openFullScreenGallery(index)}
            >
              <img
                src={url}
                alt={`${helper.name} - Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View
                </div>
              </div>
            </div>
          ))}
          
          {helper.imageUrls.length > 4 && (
            <div
              className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
              onClick={() => openFullScreenGallery(4)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-xl lg:text-2xl font-bold">+{helper.imageUrls.length - 4}</div>
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
          About {getProfessionalTitle(helper.type)}
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
          {/* Description Quality */}
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

          {/* Image Quality */}
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
          {helper.security && (
            <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl lg:rounded-2xl hover-lift">
              <FaCheckCircle className="text-emerald-600 text-base lg:text-xl flex-shrink-0" />
              <span className="font-semibold text-emerald-800 text-xs lg:text-sm">Verified</span>
            </div>
          )}
          {helper.imageUrls?.length >= 3 && (
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
          {helper.host && parseInt(helper.host) >= 2 && (
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
        helperId={helper._id} 
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
          <div className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">R{helper.regularPrice}</div>
          {helper.travelFee > 0 && (
            <p className="text-orange-600 text-sm lg:text-base">+ R{helper.travelFee} travel fee</p>
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
            <span className="font-semibold">{helper.responseTime || 'Within 1 hour'}</span>
          </div>
          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mt-2">
            <span>Availability</span>
            <span className="font-semibold">{helper.availability || 'Flexible'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Contact Information</h3>
      
      <div className="space-y-4 lg:space-y-6">
        {helper.contact && (
          <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaPhone className="text-blue-600 text-base lg:text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-xs lg:text-sm text-gray-600">Phone Number</p>
              <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{helper.contact}</p>
            </div>
          </div>
        )}

        {helper.address && (
          <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaMapMarkerAlt className="text-green-600 text-base lg:text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-xs lg:text-sm text-gray-600">Location</p>
              <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{helper.address}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaClock className="text-purple-600 text-base lg:text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-xs lg:text-sm text-gray-600">Response Time</p>
            <p className="font-bold text-gray-900 text-sm lg:text-base">{helper.responseTime || 'Within 1 hour'}</p>
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
      <div className={`sticky bottom-0 left-0 right-0  bg-white border-t border-gray-200 shadow-2xl z-50 transition-transform duration-500 ${
        showBookingBelt ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={helper?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=100&q=80'}
                alt={helper?.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 truncate">{helper?.name}</h3>
                <p className="text-gray-600 truncate">{getProfessionalTitle(helper?.type)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-gray-800">{helper?.rating || '4.5'}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-700">R{helper?.regularPrice}</span>
                  {helper?.travelFee > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-orange-600 font-medium">+R{helper.travelFee} travel</span>
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