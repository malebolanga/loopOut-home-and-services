/* eslint-disable react/prop-types */
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
  FaRobot,  FaArrowLeft,
  FaBandcamp, FaCut, FaTools, FaCar, 
  FaInfoCircle, FaMoneyBillWave,  FaTimes,
  FaFileImage, FaFilePdf, FaUserFriends, FaBroom, FaArrowUp, FaArrowDown,
  FaCalendar, FaEnvelope, FaBriefcase, FaAward,
  FaTshirt, FaBroom as FaBroomClean, FaFire, FaBaby, FaGlassCheers, FaEllipsisH,
  FaPalette, FaSpa, FaHandSparkles, FaHandHoldingHeart, FaRing,
  FaBrush, FaSprayCan, FaSmile, FaUtensils, FaShoppingBasket, FaCookie,
  FaInstagram, FaFacebook, FaCheck, FaTimes as FaTimesCircle, FaSpinner
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';

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

  // Social Media Verification States - ADD THESE
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
    ingredientsProvided: 'no'
  });

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
      tutor: 'green',
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

  // Helper functions for social media verification - ADD THESE
  const generateUsername = (name, platform) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const suffixes = ['', 'official', 'professionals', 'styles', 'studio', 'hair', 'beauty', 'chef', 'cooking'];
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
        
        const facebookData = hasFacebook ? {
          exists: true,
          username: generateUsername(name, 'facebook'),
          url: `https://facebook.com/${generateUsername(name, 'facebook')}`,
          isActive: Math.random() > 0.4, // 60% chance of being active
          verified: Math.random() > 0.7, // 30% chance of being verified
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
          isActive: Math.random() > 0.3, // 70% chance of being active
          verified: Math.random() > 0.6, // 40% chance of being verified
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
        if (['barber', 'barbar', 'chef', 'cooking', 'beauty', 'spa', 'domestic', 'maid'].includes(data.type)) {
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

  // Generate Google Maps link from address
  const generateMapLink = (address) => {
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!helper?.contact) {
      alert(`${helper?.type === 'chef' ? 'Chef' : 'Barber'} contact information is missing. Please try another contact method.`);
      return;
    }

    // Validate service selection
    if (
      (helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef') && 
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

    // Determine the location and travel fee message
    let locationInfo = '';
    let travelFeeMessage = '';
    const isHomeVisit = bookingData.locationOption === 'comeToYou';
    const hasTravelFee = helper.travelFee > 0 && isHomeVisit;

    if (isHomeVisit) {
      locationInfo = 'Come to Client';
      if (hasTravelFee) {
        travelFeeMessage = `• Travel Fee: R${helper.travelFee}%0A`;
      }
    } else if (bookingData.locationOption === 'comeToYou') {
      locationInfo = 'Come to Client';
    } else {
      locationInfo = helper.type === 'chef' ? "Chef's Kitchen" : "Barber's Shop";
    }

    // Build the main WhatsApp message
    let message = `*${helper.type === 'chef' ? '👨‍🍳' : '✂️'} New ${helper.type === 'chef' ? 'Chef' : 'Barber'} Booking Request for ${helper.name}*%0A%0A`;

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
    
    if (hasTravelFee) {
      message += travelFeeMessage;
    }
    message += `• ${helper.type === 'chef' ? 'Chef' : 'Barber'} Contact: ${helper.contact}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    message += `• Location: ${locationInfo}%0A`;
    message += `• Special Requirements: ${bookingData.specialRequirements || 'None'}%0A%0A`;

    message += `Please respond:%0A`;
    message += `✅ [Accept Booking](${acceptLink})%0A`;
    message += `❌ [Decline Booking](${declineLink})%0A%0A`;
    message += `Or reply directly to this message`;

    if (isHomeVisit && bookingData.address) {
      const mapLink = generateMapLink(bookingData.address);
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      message += `• Navigation Link:%0A  ${mapLink}%0A%0A`;
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

  const whatsappNumber = helper ? formatContactForWhatsApp(helper.contact) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi ${helper.name}, I'm interested in your ${helper.type === 'chef' ? 'chef' : 'barber'} services.`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading {helper?.type === 'chef' ? 'chef' : 'barber'} details...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading {helper?.type === 'chef' ? 'chef' : 'barber'}</h3>
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{helper?.type === 'chef' ? 'Chef' : 'Barber'} not found</h2>
          <p className="mt-2 text-gray-600">The {helper?.type === 'chef' ? 'chef' : 'barber'} you re looking for doesnt exist or may have been removed.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => {
            const routeMap = {
              default: '/helper-home-page'
            };
            navigate(routeMap[helper?.type?.toLowerCase()] || routeMap.default);
          }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back to listings"
        >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Floating Action Buttons */}
      {(helper.contact || whatsappNumber) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 sm:flex-row">
          {helper.contact && (
            <a
              href={`tel:${helper.contact}`}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label={`Call ${helper.type === 'chef' ? 'Chef' : 'Barber'}`}
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
              aria-label={`WhatsApp ${helper.type === 'chef' ? 'Chef' : 'Barber'}`}
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
                  <h1 className="text-2xl md:text-3xl font-bold text-dark flex-1 min-w-0 overflow-hidden text-ellipsis break-words">
                    {helper.name}
                  </h1>
                  {helper.security && (
                    <span className="inline-flex items-center bg-blue-600 bg-opacity-10 text-blue-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 mt-1">
                      <span className="mr-1">✅</span> Verified {helper.type === 'chef' ? 'Chef' : 'Barber'}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Rating Badge */}
                  <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    <span className="font-medium text-blue-800">
                      {helper.rating ? (
                        <>
                          <span className="font-semibold">{helper.rating}</span>
                          <span className="text-blue-600 ml-1">Stars</span>
                        </>
                      ) : (
                        <span className="text-blue-600">✨ New {helper.type === 'chef' ? 'Chef' : 'Barber'}</span>
                      )}
                    </span>
                  </div>

                  {/* Location Badge */}
                  <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    <span className="text-blue-600 mr-1.5">📍</span>
                    <span className="font-medium text-blue-800 truncate max-w-[160px]">
                      {helper.address}
                    </span>
                  </div>

                  {/* Experience Badge */}
                  {helper.host && (
                    <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                      <span className="text-blue-600 mr-1.5">🎯</span>
                      <span className="font-medium text-blue-800">
                        {helper.host} {helper.type === 'chef' ? 'Years Cooking' : 'Years Experience'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg min-w-[140px] text-center">
                <div className="text-sm font-medium opacity-90">Starting from</div>
                <div className="text-2xl font-bold mt-1">R{helper.regularPrice}</div>
                <div className="text-xs opacity-80 mt-1">per {helper.type === 'chef' ? 'meal' : 'service'}</div>
              </div>
            </div>

            {/* Social Media Verification Status */}
            <div className="mt-4">
              {verifyingSocialMedia && (
                <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                  <FaSpinner className="animate-spin text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Verifying Social Media...
                  </span>
                </div>
              )}

              {!verifyingSocialMedia && (
                <div className="flex items-center space-x-2">
                  {socialMediaVerification.facebook.exists && socialMediaVerification.facebook.verificationStatus === 'verified' && (
                    <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                      <FaFacebook className="text-blue-600" />
                      <FaCheck className="text-green-600 text-xs" />
                    </div>
                  )}
                  {socialMediaVerification.instagram.exists && socialMediaVerification.instagram.verificationStatus === 'verified' && (
                    <div className="flex items-center space-x-1 bg-pink-50 px-2 py-1 rounded border border-pink-200">
                      <FaInstagram className="text-pink-600" />
                      <FaCheck className="text-green-600 text-xs" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* Image Gallery */}
          {helper.imageUrls && helper.imageUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gallery</h3>
                <p className="text-gray-600 text-sm">View {helper.type === 'chef' ? 'chef' : 'barber'} s work and environment</p>
              </div>
              
              <div className="space-y-4">
                {/* Main Swiper - Fixed Configuration */}
                <Swiper
                  modules={[Navigation, Zoom, Thumbs]}
                  navigation={true}
                  zoom={true}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="rounded-lg overflow-hidden"
                >
                  {helper.imageUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container">
                        <img
                          src={url}
                          alt={`${helper.name} - Image ${index + 1}`}
                          className="w-full h-64 sm:h-80 md:h-96 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Thumbnail Swiper - Fixed Configuration */}
                {helper.imageUrls.length > 1 && (
                  <Swiper
                    modules={[Thumbs]}
                    watchSlidesProgress={true}
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={4}
                    freeMode={true}
                    className="thumbs-swiper mt-4"
                  >
                    {helper.imageUrls.map((url, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x75?text=Image+Not+Found';
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About {helper.type === 'chef' ? 'Chef' : 'Barber'}</h3>
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
                            to="/safety-policy" 
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

            {/* Quick Contact Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">Quick Actions</h3>
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
                  to="/safety-policy"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaShieldAlt className="text-sm" />
                  Safety Policy
                </Link>
              </div>
            </div>
          </section>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
        </div>

        {/* Right Column - Booking Form */}
        <div className="space-y-6">
          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Book {helper.type === 'chef' ? 'Chef' : 'Barber'} Services
            </h3>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Your Information</h4>
                
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="071 234 5678"
                  />
                </div>
              </div>

              {/* Service Selection */}
              {(helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef') && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    Select Services
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceOptions.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceSelection(service.id)}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          bookingData.selectedServices.includes(service.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {service.icon}
                          <span className="text-sm font-medium">{service.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Barber-specific Fields */}
              {(helper.type === 'barber' || helper.type === 'barbar') && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Haircut Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Haircut Style
                    </label>
                    <select
                      name="selectedHaircut"
                      value={bookingData.selectedHaircut}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select beard style</option>
                      {beardStyles.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Short, Medium, Long"
                    />
                  </div>
                </div>
              )}

              {/* Chef-specific Fields */}
              {(helper.type === 'chef' || helper.type === 'cooking') && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Meal Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Type
                    </label>
                    <select
                      name="mealType"
                      value={bookingData.mealType}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select cuisine</option>
                      {cuisineTypes.map((cuisine) => (
                        <option key={cuisine.id} value={cuisine.id}>
                          {cuisine.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Vegetarian, Gluten-free, Allergies"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredients
                    </label>
                    <select
                      name="ingredientsProvided"
                      value={bookingData.ingredientsProvided}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="no">Chef will provide ingredients</option>
                      <option value="yes">I will provide ingredients</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Location Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Location</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="locationOption"
                      value="comeToYou"
                      checked={bookingData.locationOption === 'comeToYou'}
                      onChange={handleBookingChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {helper.type === 'chef' ? 'Chef comes to me' : 'Barber comes to me'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {helper.type === 'chef' ? 'Chef will cook at your location' : 'Barber will come to your location'}
                        {helper.travelFee > 0 && (
                          <span className="text-orange-600 font-medium ml-1">
                            (Travel fee: R{helper.travelFee})
                          </span>
                        )}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="locationOption"
                      value="goToThem"
                      checked={bookingData.locationOption === 'goToThem'}
                      onChange={handleBookingChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {helper.type === 'chef' ? "I'll go to chef's kitchen" : "I'll go to barber shop"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {helper.type === 'chef' ? 'Visit chef kitchen location' : 'Visit barber shop location'}
                      </div>
                    </div>
                  </label>
                </div>

                {bookingData.locationOption === 'comeToYou' && (
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full address for the visit"
                    />
                  </div>
                )}
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Schedule</h4>
                
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Any special requests or requirements for the ${helper.type === 'chef' ? 'meal' : 'service'}...`}
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
                      <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                        <div className="flex flex-col items-center gap-1">
                          <FaFileImage className="text-gray-400 text-xl" />
                          <span className="text-sm text-gray-600">
                            Click to upload images or PDFs
                          </span>
                          <span className="text-xs text-gray-500">
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
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {file.type.startsWith('image/') ? (
                              <FaFileImage className="text-blue-500" />
                            ) : (
                              <FaFilePdf className="text-red-500" />
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
                            className="text-gray-400 hover:text-red-500 transition-colors"
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
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading Files...
                  </div>
                ) : (
                  `Book ${helper.type === 'chef' ? 'Chef' : 'Barber'} via WhatsApp`
                )}
              </button>

              {/* Security Notice */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  🔒 Your information is secure. We ll only share what s necessary for the booking.
                </p>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
            <div className="space-y-3">
              {helper.contact && (
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <a
                    href={`tel:${helper.contact}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {helper.contact}
                  </a>
                </div>
              )}
              {whatsappLink && (
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-green-500" />
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              )}
              {helper.address && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{helper.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Pricing</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Price</span>
                <span className="font-semibold text-gray-900">R{helper.regularPrice}</span>
              </div>
              {helper.travelFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Travel Fee</span>
                  <span className="font-semibold text-orange-600">R{helper.travelFee}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Estimate</span>
                  <span className="font-bold text-lg text-blue-600">
                    R{helper.regularPrice + (bookingData.locationOption === 'comeToYou' ? helper.travelFee : 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * Final price may vary based on specific requirements
                </p>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          {(helper.type === 'barber' || helper.type === 'barbar') ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaShieldAlt className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-blue-800">Barber Service Safety</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-blue-700 font-medium">All tools are properly sanitized between clients</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-blue-700 font-medium">Fresh blades and disposable tools used when required</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-blue-700 font-medium">Clean towels and capes provided for each client</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-blue-700 font-medium">Discuss any skin sensitivities or allergies beforehand</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-200">
                <Link 
                  to="/aboutloop" 
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold transition-colors hover:underline"
                >
                  <span>Learn more about our safety policies</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (helper.type === 'beauty' || helper.type === 'spa') ? (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <FaShieldAlt className="text-pink-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-pink-800">Beauty Service Safety</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                  <span className="text-pink-700 font-medium">Ensure all tools are properly sanitized before use</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                  <span className="text-pink-700 font-medium">Discuss allergies and skin sensitivities beforehand</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                  <span className="text-pink-700 font-medium">Request to see product ingredients if you have sensitive skin</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-pink-200">
                <Link 
                  to="/aboutloop" 
                  className="inline-flex items-center gap-2 text-pink-700 hover:text-pink-800 font-semibold transition-colors hover:underline"
                >
                  <span>Learn more about our safety policies</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaShieldAlt className="text-yellow-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-yellow-800">Essential Safety Guidelines</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-yellow-700 font-medium">Ensure someone is home at all times during the service</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-yellow-700 font-medium">Verify the helper s identity upon arrival</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-yellow-700 font-medium">Never pay the full amount upfront - only after satisfactory service</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-yellow-200">
                <Link 
                  to="/aboutloop" 
                  className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-semibold transition-colors hover:underline "
                >
                  <span>Learn more about our safety policies</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
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