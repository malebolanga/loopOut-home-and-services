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
  FaExpand, FaCompress, FaChevronLeft, FaChevronRight,
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
    deliveryFormat: ''
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
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
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
    const acceptMessage = `Hi ${bookingData.name}, I accept your booking for ${helper.name}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, I'm unable to accept this booking. Can we try another time?`;

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

    // Add baker-specific details to quick booking
    if ((helper.type === 'baker') && bookingData.bakeryItems && bookingData.bakeryItems.length > 0) {
      message += `• Bakery Items: ${bookingData.bakeryItems.join(', ')}%0A`;
    }

    if ((helper.type === 'baker') && bookingData.containerSize) {
      message += `• Container Size: ${bookingData.containerSize}%0A`;
    }

    if ((helper.type === 'baker') && bookingData.packagingOption) {
      message += `• Packaging: ${bookingData.packagingOption}%0A`;
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
    const acceptMessage = `Hi ${bookingData.name}, I accept your booking for ${helper.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

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

    // Add baker-specific details
    if ((helper.type === 'baker') && bookingData.bakeryItems && bookingData.bakeryItems.length > 0) {
      message += `• Bakery Items: ${bookingData.bakeryItems.join(', ')}%0A`;
    }

    if ((helper.type === 'baker') && bookingData.containerSize) {
      message += `• Container Size: ${bookingData.containerSize}%0A`;
    }

    if ((helper.type === 'baker') && bookingData.packagingOption) {
      message += `• Packaging: ${bookingData.packagingOption}%0A`;
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading {helper?.type ? getProfessionalTitle(helper.type).toLowerCase() : 'professional'} details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading {helper?.type ? getProfessionalTitle(helper.type).toLowerCase() : 'professional'}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Professional not found</h2>
          <p className="mt-2 text-gray-600">The professional you re looking for doesn t exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  const description = helper.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  const serviceOptions = getServiceOptions(helper.type);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 helper-page overflow-x-hidden">
      <style jsx>{`
        footer {
          display: none !important;
        }
        .helper-page {
          overflow-x: hidden;
        }
        .booking-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          overflow-y: auto;
          animation: fadeIn 0.3s ease-out;
        }
        .booking-overlay-content {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
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
          background-color: rgba(0, 0, 0, 0.95);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.3s ease-out;
        }
        .gallery-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          padding: 1rem 1.5rem;
        }
        .gallery-main-image {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .gallery-main-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .gallery-thumbnails {
          padding: 1rem;
          background: rgba(0,0,0,0.8);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .gallery-navigation {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 5;
        }
        .gallery-navigation button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .gallery-navigation button:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }
        .gallery-counter {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          backdrop-filter: blur(10px);
        }
        .image-grid-container {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
        }
        .image-grid-main {
          aspect-ratio: 16/9;
          background: #f3f4f6;
        }
        .image-grid-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .image-grid-main:hover img {
          transform: scale(1.05);
        }
        .image-grid-overlay {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .image-grid-overlay:hover {
          background: rgba(0,0,0,0.9);
          transform: translateY(-2px);
        }
        .thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .thumbnail-item {
          aspect-ratio: 1;
          border-radius: 0.5rem;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .thumbnail-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .thumbnail-item:hover .thumbnail-overlay {
          opacity: 1;
        }
      `}</style>

      {/* Navigation Button */}
      <div className="fixed bottom-4 left-3 z-50">
        <button
          onClick={() => {
            const routeMap = {
              default: '/helper-home-page'
            };
            navigate(routeMap[helper?.type?.toLowerCase()] || routeMap.default);
          }}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back to listings"
        >
          <FaArrowLeft className="text-lg" />
        </button>
      </div>

      {/* Full Screen Gallery Overlay */}
      {showFullScreenGallery && helper.imageUrls && helper.imageUrls.length > 0 && (
        <div className="fullscreen-gallery">
          {/* Header with close button */}
          <div className="gallery-header">
            <div className="flex justify-between items-center">
              <button
                onClick={closeFullScreenGallery}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all"
              >
                <FaTimes className="text-xl" />
              </button>
              <div className="text-white">
                {currentGalleryIndex + 1} / {helper.imageUrls.length}
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="gallery-main-image">
            <img
              src={helper.imageUrls[currentGalleryIndex]}
              alt={`Gallery image ${currentGalleryIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            
            {/* Navigation Arrows */}
            <div className="gallery-navigation">
              <button onClick={prevImage} aria-label="Previous image">
                <FaChevronLeft className="text-xl" />
              </button>
              <button onClick={nextImage} aria-label="Next image">
                <FaChevronRight className="text-xl" />
              </button>
            </div>

            {/* Counter */}
            <div className="gallery-counter">
              {currentGalleryIndex + 1} / {helper.imageUrls.length}
            </div>
          </div>

          {/* Thumbnails */}
          {helper.imageUrls.length > 1 && (
            <div className="gallery-thumbnails">
              <Swiper
                modules={[FreeMode]}
                spaceBetween={8}
                slidesPerView="auto"
                freeMode={true}
                className="thumbs-swiper"
              >
                {helper.imageUrls.map((url, index) => (
                  <SwiperSlide key={index} style={{ width: '80px' }}>
                    <div
                      className={`thumbnail-item ${index === currentGalleryIndex ? 'ring-2 ring-white' : ''}`}
                      onClick={() => setCurrentGalleryIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Thumb';
                        }}
                      />
                      {index === currentGalleryIndex && (
                        <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
                      )}
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
              {/* Overlay Header with Close Button */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Book {getProfessionalTitle(helper.type)} Services
                    </h2>
                    <p className="text-blue-100 mt-1">
                      Fill out the form below to book {helper.name} via WhatsApp
                    </p>
                  </div>
                  <button
                    onClick={closeBookingFormOverlay}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                    aria-label="Close booking form"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Booking Form Content */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Client Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">Your Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={bookingData.name}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          placeholder="071 234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Selection */}
                  {(helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef' || helper.type === 'tattoo' || helper.type === 'tutor' || helper.type === 'photography') && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">
                        Select Services
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {serviceOptions.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceSelection(service.id)}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${
                              bookingData.selectedServices.includes(service.id)
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-2xl">{service.icon}</div>
                              <span className="text-sm font-medium text-center">{service.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Barber-specific Fields */}
                  {(helper.type === 'barber' || helper.type === 'barbar') && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">Haircut Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Haircut Style
                          </label>
                          <select
                            name="selectedHaircut"
                            value={bookingData.selectedHaircut}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a style</option>
                            {haircutStyles.map((style) => (
                              <option key={style.id} value={style.id}>
                                {style.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Beard Style
                          </label>
                          <select
                            name="beardStyle"
                            value={bookingData.beardStyle}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Hair Length
                        </label>
                        <input
                          type="text"
                          name="hairLength"
                          value={bookingData.hairLength}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Short, Medium, Long"
                        />
                      </div>
                    </div>
                  )}

                  {/* Chef-specific Fields */}
                  {(helper.type === 'chef' || helper.type === 'cooking') && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">Meal Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meal Type
                          </label>
                          <select
                            name="mealType"
                            value={bookingData.mealType}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select meal type</option>
                            {mealTypes.map((meal) => (
                              <option key={meal.id} value={meal.id}>
                                {meal.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cuisine Preference
                          </label>
                          <select
                            name="cuisinePreference"
                            value={bookingData.cuisinePreference}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select cuisine</option>
                            {cuisineTypes.map((cuisine) => (
                              <option key={cuisine.id} value={cuisine.id}>
                                {cuisine.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Guests
                          </label>
                          <input
                            type="number"
                            name="numberOfGuests"
                            value={bookingData.numberOfGuests}
                            onChange={handleBookingChange}
                            min="1"
                            max="50"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dietary Restrictions
                          </label>
                          <input
                            type="text"
                            name="dietaryRestrictions"
                            value={bookingData.dietaryRestrictions}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Vegetarian, Gluten-free, Allergies"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ingredients
                        </label>
                        <select
                          name="ingredientsProvided"
                          value={bookingData.ingredientsProvided}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="no">Chef will provide ingredients</option>
                          <option value="yes">I will provide ingredients</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Photography-specific Fields */}
                  {(helper.type === 'photography') && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">Photography Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photography Type
                          </label>
                          <select
                            name="photographyType"
                            value={bookingData.photographyType}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select photography type</option>
                            <option value="portrait">Portrait Session</option>
                            <option value="event">Event Coverage</option>
                            <option value="wedding">Wedding Photography</option>
                            <option value="product">Product Photography</option>
                            <option value="family">Family Session</option>
                            <option value="commercial">Commercial Shoot</option>
                            <option value="realestate">Real Estate</option>
                            <option value="landscape">Landscape</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Session Duration
                          </label>
                          <select
                            name="sessionDuration"
                            value={bookingData.sessionDuration}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select duration</option>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                            <option value="4">4 hours</option>
                            <option value="6">6 hours</option>
                            <option value="8">Full day (8 hours)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of People
                          </label>
                          <input
                            type="number"
                            name="numberOfPeople"
                            value={bookingData.numberOfPeople}
                            onChange={handleBookingChange}
                            min="1"
                            max="50"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photo Delivery Format
                          </label>
                          <select
                            name="deliveryFormat"
                            value={bookingData.deliveryFormat}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select delivery format</option>
                            <option value="digital">Digital files only</option>
                            <option value="prints">Prints included</option>
                            <option value="both">Digital + Prints</option>
                            <option value="album">Photo album</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requirements
                        </label>
                        <textarea
                          name="photographyRequirements"
                          value={bookingData.photographyRequirements}
                          onChange={handleBookingChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Specific poses, locations, props, editing style..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Enhanced Location Options */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">Location</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input
                          type="radio"
                          name="locationOption"
                          value="comeToYou"
                          checked={bookingData.locationOption === 'comeToYou'}
                          onChange={handleBookingChange}
                          className="text-blue-600 focus:ring-blue-500 w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">
                            {getProfessionalTitle(helper.type)} comes to me
                          </div>
                          <div className="text-gray-600 mt-1">
                            {getProfessionalTitle(helper.type)} will provide service at your location
                            {helper.travelFee > 0 && (
                              <span className="text-orange-600 font-medium ml-1">
                                (Travel fee: R{helper.travelFee})
                              </span>
                            )}
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input
                          type="radio"
                          name="locationOption"
                          value="goToThem"
                          checked={bookingData.locationOption === 'goToThem'}
                          onChange={handleBookingChange}
                          className="text-blue-600 focus:ring-blue-500 w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">
                            I ll go to {getProfessionalTitle(helper.type).toLowerCase()} s location
                          </div>
                          <div className="text-gray-600 mt-1">
                            Visit {getProfessionalTitle(helper.type).toLowerCase()} s location
                          </div>
                        </div>
                      </label>
                    </div>

                    {bookingData.locationOption === 'comeToYou' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Address *
                          </label>
                          <textarea
                            name="address"
                            value={bookingData.address}
                            onChange={handleBookingChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your full address including street number, street name, city, and postal code"
                          />
                        </div>
                        
                        {/* Enhanced Address Validation Message */}
                        {bookingData.address && bookingData.address.length > 0 && (
                          <div className={`text-sm p-3 rounded-lg ${
                            bookingData.address.length < 10 
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {bookingData.address.length < 10 
                              ? '⚠️ Please provide a more detailed address for accurate service delivery'
                              : '✓ Address looks good! Make sure to include apartment/unit number if applicable.'
                            }
                          </div>
                        )}

                        {/* Service-specific Location Requirements */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <h5 className="font-semibold text-blue-800 text-lg mb-3">
                            📍 Location Requirements for {getProfessionalTitle(helper.type)}
                          </h5>
                          <ul className="text-blue-700 space-y-2">
                            {helper.type === 'chef' && (
                              <>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Kitchen access with basic cooking equipment</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Dining area for meal service</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Power outlets for appliances</span>
                                </li>
                              </>
                            )}
                            {helper.type === 'barber' && (
                              <>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Well-lit workspace with chair</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Power source for clippers</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Mirror access for styling</span>
                                </li>
                              </>
                            )}
                            {helper.type === 'photography' && (
                              <>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Adequate shooting space</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Natural light preferred</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span>Power outlets for equipment</span>
                                </li>
                              </>
                            )}
                            {!['chef', 'barber', 'photography'].includes(helper.type) && (
                              <li className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                <span>Clean, accessible workspace with power outlets</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {bookingData.locationOption === 'goToThem' && helper.address && (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <h5 className="font-semibold text-green-800 text-lg mb-2">
                          📍 {getProfessionalTitle(helper.type)} Location
                        </h5>
                        <p className="text-green-700 mb-3">{helper.address}</p>
                        <a 
                          href={generateMapLink(helper.address, helper.type)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-2"
                        >
                          <FaMapMarkerAlt />
                          <span>View on Map</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">Schedule</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={bookingData.date}
                          onChange={handleBookingChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time *
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={bookingData.time}
                          onChange={handleBookingChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements
                    </label>
                    <textarea
                      name="specialRequirements"
                      value={bookingData.specialRequirements}
                      onChange={handleBookingChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Any special requests or requirements for the ${helper.type === 'chef' ? 'meal' : helper.type === 'photography' ? 'photoshoot' : 'service'}...`}
                    />
                  </div>

                  {/* Attachments */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Attachments (Optional)
                    </label>
                    <div className="space-y-3">
                      {/* File Input */}
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleAttachmentChange}
                            className="hidden"
                          />
                          <div className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors text-center">
                            <div className="flex flex-col items-center gap-2">
                              <FaFileImage className="text-gray-400 text-3xl" />
                              <span className="text-lg text-gray-600">
                                Click to upload images or PDFs
                              </span>
                              <span className="text-sm text-gray-500">
                                Max 2 files, 5MB each
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Attachment Preview */}
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border"
                            >
                              <div className="flex items-center gap-3">
                                {file.type.startsWith('image/') ? (
                                  <FaFileImage className="text-blue-500 text-xl" />
                                ) : (
                                  <FaFilePdf className="text-red-500 text-xl" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                              >
                                <FaTimes className="text-lg" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all ${
                        isUploading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading Files...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <FaWhatsapp className="text-2xl" />
                          <span>Book {getProfessionalTitle(helper.type)} via WhatsApp</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      <FaShieldAlt className="text-blue-500" />
                      🔒 Your information is secure. We ll only share what s necessary for the booking.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={helper.imageUrls?.[0] || '/api/placeholder/120/120'}
                alt={helper.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{helper.name}</h1>
                    <p className="text-gray-600">{getProfessionalTitle(helper.type)}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <FaStar />
                      <span className="text-gray-700 font-medium">{helper.rating || '4.5'}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{helper.reviewCount || '25'} reviews</span>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span>{helper.address || 'Location not specified'}</span>
                    {helper.address && (
                      <a 
                        href={generateMapLink(helper.address, helper.type)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                      >
                        (View on Map)
                      </a>
                    )}
                  </div>
                  {helper.contact && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <FaPhone className="text-green-500" />
                      <span>{helper.contact}</span>
                    </div>
                  )}
                </div>

                {/* Verification and Rating Badges - Moved inside the new header */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {helper.security && (
                    <div className="inline-flex items-center bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-emerald-700 font-semibold text-sm">
                        ✅ Verified Professional
                      </span>
                    </div>
                  )}
                  
                  <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                    <FaStar className="text-yellow-500 text-sm mr-2" />
                    <span className="text-blue-700 font-semibold text-sm">
                      {helper.rating ? `${helper.rating} Rating` : 'New Professional'}
                    </span>
                  </div>

                  {/* Enhanced Location Badge */}
                  {helper.address && (
                    <div className="inline-flex items-center bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                      <FaMapMarkerAlt className="text-purple-600 text-sm mr-2" />
                      <span className="text-purple-700 font-semibold text-sm">
                        Location Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Cards Grid - Moved inside the new header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Location Card */}
                  {helper.address && (
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaMapMarkerAlt className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 font-medium mb-1">Service Area</div>
                          <div className="text-gray-900 font-semibold text-sm truncate">
                            {helper.serviceArea || 'Local Area'}
                          </div>
                          <a 
                            href={generateMapLink(helper.address, helper.type)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs mt-1 inline-block"
                          >
                            View on Map →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience Card */}
                  {helper.host && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaBriefcase className="text-orange-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 font-medium mb-1">Experience</div>
                          <div className="text-gray-900 font-semibold text-sm">
                            {helper.host} {helper.type === 'chef' ? 'Years Cooking' : 
                                          helper.type === 'tutor' ? 'Years Teaching' :
                                          helper.type === 'tattoo' ? 'Years Experience' :
                                          helper.type === 'photography' ? 'Years Photography' :
                                          'Years Experience'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Response Time Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaClock className="text-cyan-600 text-lg" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-1">Response Time</div>
                        <div className="text-gray-900 font-semibold text-sm">{helper.responseTime || 'Within 1 hour'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Verification - Moved inside the new header */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Title Section */}
                    <div className="flex items-center gap-3 lg:w-48 lg:flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaUserFriends className="text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Social Verification</h3>
                        <p className="text-gray-500 text-xs">AI-powered validation</p>
                      </div>
                    </div>

                    {/* Social Media Badges */}
                    <div className="flex-1">
                      {verifyingSocialMedia ? (
                        <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <FaSpinner className="animate-spin text-yellow-600" />
                          <div>
                            <div className="text-yellow-800 font-medium text-sm">Verifying profiles</div>
                            <div className="text-yellow-600 text-xs">Scanning social networks</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {socialMediaVerification.facebook.exists && socialMediaVerification.facebook.verificationStatus === 'verified' && (
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative">
                                <FaFacebook className="text-blue-600 text-lg" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <span className="text-gray-700 font-semibold text-sm">Facebook</span>
                            </div>
                          )}

                          {socialMediaVerification.instagram.exists && socialMediaVerification.instagram.verificationStatus === 'verified' && (
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative">
                                <FaInstagram className="text-pink-600 text-lg" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <span className="text-gray-700 font-semibold text-sm">Instagram</span>
                            </div>
                          )}

                          {socialMediaVerification.linkedin.exists && socialMediaVerification.linkedin.verificationStatus === 'verified' && (
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative">
                                <FaLinkedin className="text-blue-700 text-lg" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <span className="text-gray-700 font-semibold text-sm">LinkedIn</span>
                            </div>
                          )}

                          {socialMediaVerification.twitter.exists && socialMediaVerification.twitter.verificationStatus === 'verified' && (
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative">
                                <FaTwitter className="text-gray-900 text-lg" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <span className="text-gray-700 font-semibold text-sm">Twitter</span>
                            </div>
                          )}

                          {!socialMediaVerification.facebook.exists && !socialMediaVerification.instagram.exists && 
                          !socialMediaVerification.linkedin.exists && !socialMediaVerification.twitter.exists && (
                            <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                              <FaInfoCircle className="text-gray-400" />
                              <span className="text-gray-600 font-medium text-sm">No social profiles found</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery - Airbnb Style */}
          {helper.imageUrls && helper.imageUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="image-grid-container">
                {/* Main Image */}
                <div 
                  className="image-grid-main cursor-pointer relative"
                  onClick={() => openFullScreenGallery(0)}
                >
                  <img
                    src={helper.imageUrls[0]}
                    alt={`${helper.name} - Main image`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />
                  
                  {/* Show all photos button */}
                  {helper.imageUrls.length > 1 && (
                    <div 
                      className="image-grid-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFullScreenGallery(0);
                      }}
                    >
                      <FaExpand className="text-sm" />
                      <span className="text-sm font-medium">Show all photos</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Grid - Only show if more than 1 image */}
                {helper.imageUrls.length > 1 && (
                  <div className="p-4">
                    <div className="thumbnail-grid">
                      {helper.imageUrls.slice(1, 5).map((url, index) => (
                        <div
                          key={index + 1}
                          className="thumbnail-item"
                          onClick={() => openFullScreenGallery(index + 1)}
                        >
                          <img
                            src={url}
                            alt={`${helper.name} - Image ${index + 2}`}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200x200?text=Thumbnail';
                            }}
                          />
                          {index === 3 && helper.imageUrls.length > 5 && (
                            <div className="thumbnail-overlay">
                              +{helper.imageUrls.length - 5} more
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                About {getProfessionalTitle(helper.type)}
              </h3>
              {description.length > 300 && (
                <button
                  onClick={toggleDescription}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  {showFullDescription ? (
                    <>
                      <FaArrowUp className="text-xs" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <FaArrowDown className="text-xs" />
                      Read More
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="text-gray-700 leading-relaxed">
              {displayText.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* AI Assessment Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaRobot className="text-blue-500" />
                AI Quality Assessment
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-colors ${
                    aiAssessment.userReaction === 'like'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  <FaArrowUp className="text-sm" />
                </button>
                <span className="text-sm font-medium text-gray-700">{aiAssessment.likes}</span>
                <button
                  onClick={handleDislike}
                  className={`p-2 rounded-full transition-colors ${
                    aiAssessment.userReaction === 'dislike'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <FaArrowDown className="text-sm" />
                </button>
                <span className="text-sm font-medium text-gray-700">{aiAssessment.dislikes}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Overall Rating */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {aiAssessment.overallRating?.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Overall Quality Score</h4>
                    <p className="text-sm text-gray-600">Based on content and media analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-sm ${
                          star <= Math.floor(aiAssessment.overallRating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {aiAssessment.overallRating?.toFixed(1)} out of 5
                  </span>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description Quality */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Description Quality</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {aiAssessment.descriptionQuality}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(aiAssessment.descriptionQuality / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on detail level and professionalism
                  </p>
                </div>

                {/* Image Quality */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Media Quality</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {aiAssessment.imageQuality}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(aiAssessment.imageQuality / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on image quantity and clarity
                  </p>
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {helper.security && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FaCheckCircle className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-800">Verified</span>
                  </div>
                )}
                {helper.imageUrls?.length >= 3 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FaFileImage className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-800">Good Media</span>
                  </div>
                )}
                {description.length > 200 && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <FaUser className="text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-purple-800">Detailed Info</span>
                  </div>
                )}
                {helper.host && parseInt(helper.host) >= 2 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <FaBriefcase className="text-orange-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-orange-800">Experienced</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Host Rating Categories Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <FaUserFriends className="text-blue-600" />
              Rate the {getProfessionalTitle(helper.type)} & Service
            </h2>
            
            {/* Overall Rating Summary */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Overall Service Rating</h3>
                  <p className="text-gray-600 text-sm">
                    Based on customer feedback and experience
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {helper.rating?.toFixed(1) || '5.0'}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg ${
                            star <= Math.floor(helper.rating || 5)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Categories Grid - Dynamic based on helper type */}
            <div className="space-y-3">
              {/* Maid/Domestic Helper Categories */}
              {(helper.type === 'maid' || helper.type === 'domestic') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👕</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Laundry & Ironing</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Quality of laundry and ironing service</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🏠</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">House Cleaning</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Thoroughness and attention to detail</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👨‍🍳</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Cooking Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Taste and presentation of meals</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👶</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Baby Sitting</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Care and attention to children</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🌳</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Yard Cleaning</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Garden and outdoor maintenance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Communication</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Clarity and responsiveness</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Barber Categories */}
              {(helper.type === 'barber' || helper.type === 'barbar') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">✂️</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Equipment Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Tools and equipment condition</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🧼</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Salon Cleanliness</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Cleanliness of the workspace</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Communication</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Understanding your style needs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flexRow sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🛁</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Towel Cleanliness</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Freshness of towels and linens</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Time Keeping</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Punctuality and efficiency</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💇</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Haircut Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Precision and style execution</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Beauty/Spa Categories */}
              {(helper.type === 'beauty' || helper.type === 'spa') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Communication</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Understanding your beauty needs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🔧</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Equipment Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Tools and product quality</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Time Keeping</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Punctuality and appointment management</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">✨</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Salon Cleanliness</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Clean and hygienic environment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💆</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Service Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Overall service experience</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Chef Categories */}
              {(helper.type === 'chef' || helper.type === 'cooking') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👨‍🍳</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Cooking Skills</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Culinary expertise and technique</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🧼</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Kitchen Cleanliness</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Clean and organized workspace</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flexRow sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Time Management</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Punctuality and meal timing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Photography Categories */}
              {(helper.type === 'photography') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📸</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Photo Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Image clarity and composition</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Communication</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Understanding your vision</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Punctuality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">On-time arrival and efficiency</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🎨</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Editing Quality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Photo editing and retouching</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💡</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Creativity</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Creative ideas and poses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Default Categories for other types */}
              {!['maid', 'domestic', 'barber', 'barbar', 'beauty', 'spa', 'chef', 'cooking', 'photography'].includes(helper.type) && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💼</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Professionalism</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Overall professional conduct</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Communication</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Clarity and responsiveness</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Punctuality</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Time management and reliability</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg cursor-pointer ${
                            star <= 5 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Rating Guidelines */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 text-sm mb-1">Rating Guidelines</h4>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Your honest ratings help other customers find great service providers and maintain quality standards. 
                    Rate based on your actual experience with the service quality, communication, and professionalism.
                  </p>
                </div>
              </div>
            </div>
            
          </section>

          {/* Additional Information */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Contact Information */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaPhone className="text-blue-600" />
                    Contact Information
                  </h3>
                  <ul className="space-y-2">
                    {helper.contact && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Phone Number:</span>
                        <span className="font-medium text-gray-900">{helper.contact}</span>
                      </li>
                    )}
                    {helper.email && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Email:</span>
                        <span className="font-medium text-gray-900">{helper.email}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaClock className="text-blue-600" />
                    Availability
                  </h3>
                  <ul className="space-y-2">
                    {helper.period && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Working Hours:</span>
                        <span className="font-medium text-gray-900">{helper.period}</span>
                      </li>
                    )}
                    {helper.availability && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Schedule:</span>
                        <span className="font-medium text-gray-900">{helper.availability}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <span className="text-gray-600 min-w-[120px]">Response Time:</span>
                      <span className="font-medium text-gray-900">
                        {helper.responseTime || '1 hour to 24 hours'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Experience & Languages */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaBriefcase className="text-blue-600" />
                    Experience & Languages
                  </h3>
                  <ul className="space-y-2">
                    {helper.host && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Experience:</span>
                        <span className="font-medium text-gray-900">{helper.host} years</span>
                      </li>
                    )}
                    {helper.cancel && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Languages:</span>
                        <span className="font-medium text-gray-900">{helper.cancel}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Safety & Verification */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaShieldAlt className="text-blue-600" />
                    Safety & Verification
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <FaShieldAlt className="text-blue-600" />
                      <span>Background Check: {helper.security ? 'Verified' : 'Not Verified'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FaDog className="text-blue-600" />
                      <span>Pets: {helper.pets ? 'Comfortable with pets' : 'Not comfortable with pets'}</span>
                    </li>
                    
                    {/* Safety Policy Links */}
                    <li className="pt-2">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Safety Policies</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-blue-700">We prioritize your safety and satisfaction</p>
                          <Link 
                            to="/safetyhelper" 
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            <FaShieldAlt className="text-xs" />
                            <span>View our complete safety policy</span>
                          </Link>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Type-Specific Information */}
                {helper.type === 'tutor' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaGraduationCap className="text-blue-600" />
                      Tutoring Details
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaGraduationCap className="text-blue-600" />
                        <span>Education Level: {helper.specializations || 'Not specified'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaUsers className="text-blue-600" />
                        <span>Equipment: {helper.equipment ? 'Available' : 'Not available'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {(helper.type === 'beauty' || helper.type === 'spa') && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaHandSparkles className="text-pink-500" />
                      Beauty Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaHandSparkles className="text-pink-500" />
                        <span>Hygiene Standards: {helper.equipment?.includes('sanitized') ? 'High' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaPalette className="text-purple-500" />
                        <span>Product Quality: {helper.equipment?.includes('premium') ? 'Premium' : 'Professional'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {(helper.type === 'barber' || helper.type === 'barbar') && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaCut className="text-blue-600" />
                      Barber Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaCut className="text-blue-600" />
                        <span>Tool Sanitization: {helper.equipment?.includes('sanitized') ? 'High Standard' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaTools className="text-gray-700" />
                        <span>Razor Service: {helper.equipment?.includes('straight-razor') ? 'Available' : 'Not Available'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaUser className="text-blue-500" />
                        <span>Shop Environment: {helper.equipment?.includes('modern') ? 'Modern' : 'Traditional'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {(helper.type === 'chef' || helper.type === 'cooking') && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaUtensils className="text-orange-500" />
                      Chef Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaShieldAlt className="text-orange-500" />
                        <span>Food Safety: {helper.equipment?.includes('sanitized') ? 'Certified' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaUtensils className="text-orange-500" />
                        <span>Equipment Quality: {helper.equipment?.includes('professional') ? 'Professional' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaShoppingBasket className="text-green-500" />
                        <span>Ingredient Sourcing: {helper.equipment?.includes('premium') ? 'Premium' : 'Standard'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {(helper.type === 'photography') && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaCamera className="text-purple-600" />
                      Photography Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaCamera className="text-purple-600" />
                        <span>Equipment Quality: {helper.equipment?.includes('professional') ? 'Professional' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaFileImage className="text-purple-600" />
                        <span>Editing Software: {helper.equipment?.includes('premium') ? 'Premium' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaClock className="text-purple-600" />
                        <span>Delivery Time: {helper.equipment?.includes('fast') ? 'Fast' : 'Standard'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Service Area */}
                {helper.serviceArea && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-600" />
                      Service Area
                    </h3>
                    <p className="text-gray-700">{helper.serviceArea}</p>
                    {helper.travelFee && (
                      <p className="text-sm text-gray-600 mt-1">
                        Travel fee: R{helper.travelFee} for locations outside service area
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                <button
                  onClick={() => setShowCommentsPanel(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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

            {/* Quick Contact Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {helper.contact && (
                  <a
                    href={`tel:${helper.contact}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPhone className="text-sm" />
                    Call Now
                  </a>
                )}
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaWhatsapp className="text-sm" />
                    WhatsApp
                  </a>
                )}
                <Link
                  to="/safetyhelper"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaShieldAlt className="text-sm" />
                  Safety Policy
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Booking Belt */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-transform duration-300 ${
        showBookingBelt ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Service Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={helper?.imageUrls?.[0] || '/api/placeholder/50/50'}
                alt={helper?.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{helper?.name}</h3>
                <p className="text-sm text-gray-600 truncate">{getProfessionalTitle(helper?.type)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-medium text-gray-700">{helper?.rating || '4.5'}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">R{helper?.regularPrice}</span>
                  {helper?.travelFee > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-orange-600">+R{helper.travelFee} travel</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* WhatsApp Form Button */}
              <button
                onClick={openBookingFormOverlay}
                className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <FaWhatsapp className="text-lg" />
                <span className="font-semibold">WhatsApp</span>
              </button>

              {/* Info Button with Link */}
              <Link to="/safetyhelper" className="flex-shrink-0">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <FaInfoCircle className="text-lg" />
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