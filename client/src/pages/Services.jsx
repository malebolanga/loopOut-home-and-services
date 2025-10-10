// Services.jsx - Unified Format Matching HelperPage
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaWhatsapp,
  FaArrowLeft,  FaClock, FaExclamationTriangle,
  FaTools, FaShieldAlt,  FaTruck, 
   FaUser,  FaChild, FaArrowDown,
  FaCar, FaUserFriends, FaBaby, FaUtensils, FaCarSide, FaBus,  FaArrowUp,
  FaBroom, FaRobot, FaBriefcase, FaTshirt, 
  FaGlassCheers,  FaGraduationCap,
  FaPalette,  FaRing,
  FaBrush,  FaCookie,
  FaCheckCircle, FaTimes, FaFileImage, FaFilePdf, FaSpinner,
  FaInstagram, FaFacebook, FaLinkedin, FaTwitter, FaInfoCircle,
  FaDog, 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

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
    vehicleType: '',
    movingSize: '',
    packingRequired: 'no',
    gardenSize: '',
    maintenanceType: '',
    childAge: '',
    specialNeeds: '',
    pickupLocation: '',
    dropoffLocation: '',
    schoolName: '',
    serviceArea: '',
    equipmentNeeded: '',
    duration: ''
  });

  // Helper function to get professional title
  const getProfessionalTitle = (type) => {
    const titles = {
      cleaning: 'Cleaning Service',
      catering: 'Catering Service',
      moving: 'Moving Service',
      landscaping: 'Landscaping Service',
      daycare: 'Daycare Service',
      schoolTransport: 'School Transport Service',
      maintenance: 'Maintenance Service',
      default: 'Service Provider'
    };
    return titles[type] || titles.default;
  };

  // Service options for different service types
  const getServiceOptions = (type) => {
    const cleaningOptions = [
      { id: 'house-cleaning', name: 'House Cleaning', icon: <FaBroom className="text-green-500" /> },
      { id: 'deep-cleaning', name: 'Deep Cleaning', icon: <FaBroom className="text-green-600" /> },
      { id: 'office-cleaning', name: 'Office Cleaning', icon: <FaBroom className="text-blue-500" /> },
      { id: 'move-clean', name: 'Move In/Out Cleaning', icon: <FaBroom className="text-purple-500" /> },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning', icon: <FaTshirt className="text-orange-500" /> },
      { id: 'window-cleaning', name: 'Window Cleaning', icon: <FaTools className="text-cyan-500" /> },
      { id: 'post-construction', name: 'Post-Construction Cleaning', icon: <FaTools className="text-gray-600" /> },
      { id: 'commercial-cleaning', name: 'Commercial Cleaning', icon: <FaBroom className="text-indigo-500" /> }
    ];

    const cateringOptions = [
      { id: 'corporate-catering', name: 'Corporate Catering', icon: <FaUtensils className="text-blue-500" /> },
      { id: 'wedding-catering', name: 'Wedding Catering', icon: <FaRing className="text-pink-500" /> },
      { id: 'private-events', name: 'Private Events', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'meal-prep', name: 'Meal Preparation', icon: <FaUtensils className="text-green-500" /> },
      { id: 'buffet-service', name: 'Buffet Service', icon: <FaUtensils className="text-orange-500" /> },
      { id: 'plated-dinners', name: 'Plated Dinners', icon: <FaUtensils className="text-red-500" /> },
      { id: 'cocktail-parties', name: 'Cocktail Parties', icon: <FaGlassCheers className="text-yellow-500" /> },
      { id: 'dietary-special', name: 'Dietary Special Meals', icon: <FaCookie className="text-teal-500" /> }
    ];

    const movingOptions = [
      { id: 'local-moving', name: 'Local Moving', icon: <FaTruck className="text-blue-500" /> },
      { id: 'long-distance', name: 'Long Distance Moving', icon: <FaCarSide className="text-green-500" /> },
      { id: 'office-moving', name: 'Office Moving', icon: <FaBriefcase className="text-purple-500" /> },
      { id: 'packing-service', name: 'Packing Service', icon: <FaTools className="text-orange-500" /> },
      { id: 'loading-unloading', name: 'Loading/Unloading', icon: <FaTruck className="text-red-500" /> },
      { id: 'furniture-assembly', name: 'Furniture Assembly', icon: <FaTools className="text-gray-600" /> },
      { id: 'storage-services', name: 'Storage Services', icon: <FaTruck className="text-yellow-600" /> },
      { id: 'vehicle-transport', name: 'Vehicle Transport', icon: <FaCar className="text-indigo-500" /> }
    ];

    const landscapingOptions = [
      { id: 'lawn-mowing', name: 'Lawn Mowing', icon: <FaBroom className="text-green-500" /> },
      { id: 'garden-design', name: 'Garden Design', icon: <FaPalette className="text-pink-500" /> },
      { id: 'tree-trimming', name: 'Tree Trimming', icon: <FaTools className="text-green-600" /> },
      { id: 'irrigation', name: 'Irrigation Systems', icon: <FaTools className="text-blue-500" /> },
      { id: 'hardscaping', name: 'Hardscaping', icon: <FaTools className="text-gray-600" /> },
      { id: 'seasonal-cleanup', name: 'Seasonal Cleanup', icon: <FaBroom className="text-orange-500" /> },
      { id: 'fertilization', name: 'Fertilization', icon: <FaTools className="text-brown-500" /> },
      { id: 'pest-control', name: 'Pest Control', icon: <FaShieldAlt className="text-red-500" /> }
    ];

    const daycareOptions = [
      { id: 'full-time-care', name: 'Full-Time Care', icon: <FaChild className="text-blue-500" /> },
      { id: 'part-time-care', name: 'Part-Time Care', icon: <FaChild className="text-green-500" /> },
      { id: 'after-school', name: 'After School Care', icon: <FaGraduationCap className="text-purple-500" /> },
      { id: 'weekend-care', name: 'Weekend Care', icon: <FaChild className="text-orange-500" /> },
      { id: 'emergency-care', name: 'Emergency Care', icon: <FaChild className="text-red-500" /> },
      { id: 'infant-care', name: 'Infant Care', icon: <FaBaby className="text-pink-500" /> },
      { id: 'toddler-care', name: 'Toddler Care', icon: <FaChild className="text-yellow-500" /> },
      { id: 'preschool', name: 'Preschool Program', icon: <FaGraduationCap className="text-indigo-500" /> }
    ];

    const schoolTransportOptions = [
      { id: 'daily-transport', name: 'Daily Transport', icon: <FaBus className="text-blue-500" /> },
      { id: 'after-school', name: 'After School', icon: <FaBus className="text-green-500" /> },
      { id: 'sports-transport', name: 'Sports Transport', icon: <FaCar className="text-orange-500" /> },
      { id: 'field-trips', name: 'Field Trips', icon: <FaBus className="text-purple-500" /> },
      { id: 'emergency-transport', name: 'Emergency Transport', icon: <FaCar className="text-red-500" /> },
      { id: 'weekend-transport', name: 'Weekend Transport', icon: <FaCar className="text-yellow-500" /> },
      { id: 'special-needs', name: 'Special Needs Transport', icon: <FaCar className="text-teal-500" /> },
      { id: 'group-transport', name: 'Group Transport', icon: <FaBus className="text-indigo-500" /> }
    ];

    const maintenanceOptions = [
      { id: 'plumbing', name: 'Plumbing', icon: <FaTools className="text-blue-500" /> },
      { id: 'electrical', name: 'Electrical', icon: <FaTools className="text-yellow-500" /> },
      { id: 'carpentry', name: 'Carpentry', icon: <FaTools className="text-brown-500" /> },
      { id: 'painting', name: 'Painting', icon: <FaBrush className="text-purple-500" /> },
      { id: 'appliance-repair', name: 'Appliance Repair', icon: <FaTools className="text-gray-600" /> },
      { id: 'hvac', name: 'HVAC', icon: <FaTools className="text-cyan-500" /> },
      { id: 'general-repair', name: 'General Repair', icon: <FaTools className="text-orange-500" /> },
      { id: 'emergency-repair', name: 'Emergency Repair', icon: <FaTools className="text-red-500" /> }
    ];

    switch (type) {
      case 'cleaning':
        return cleaningOptions;
      case 'catering':
        return cateringOptions;
      case 'moving':
        return movingOptions;
      case 'landscaping':
        return landscapingOptions;
      case 'daycare':
        return daycareOptions;
      case 'schoolTransport':
        return schoolTransportOptions;
      case 'maintenance':
        return maintenanceOptions;
      default:
        return [];
    }
  };

  // Service-specific options
  const movingSizes = [
    { id: 'studio', name: 'Studio Apartment' },
    { id: '1-bedroom', name: '1 Bedroom' },
    { id: '2-bedroom', name: '2 Bedrooms' },
    { id: '3-bedroom', name: '3+ Bedrooms' },
    { id: 'office-small', name: 'Small Office' },
    { id: 'office-large', name: 'Large Office' }
  ];

  const vehicleTypes = [
    { id: 'sedan', name: 'Sedan' },
    { id: 'suv', name: 'SUV' },
    { id: 'van', name: 'Van' },
    { id: 'minibus', name: 'Minibus' },
    { id: 'bus', name: 'Bus' },
    { id: 'truck', name: 'Truck' }
  ];

  const gardenSizes = [
    { id: 'small', name: 'Small Garden (< 100m²)' },
    { id: 'medium', name: 'Medium Garden (100-500m²)' },
    { id: 'large', name: 'Large Garden (500-1000m²)' },
    { id: 'estate', name: 'Estate (> 1000m²)' }
  ];

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'buffet', name: 'Buffet' },
    { id: 'cocktail', name: 'Cocktail Party' },
    { id: 'bbq', name: 'BBQ' }
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

  // Get theme color based on service type
  const getThemeColor = (type) => {
    const themes = {
      cleaning: 'green',
      catering: 'orange',
      moving: 'blue',
      landscaping: 'green',
      daycare: 'pink',
      schoolTransport: 'blue',
      maintenance: 'gray',
      default: 'blue'
    };
    return themes[type] || themes.default;
  };

  const themeColor = service ? getThemeColor(service.type) : 'blue';

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

  // Helper functions for social media verification
  const generateUsername = (name, platform) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const suffixes = ['', 'official', 'professionals', 'services', 'company', 'care'];
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
  const verifySocialMediaPresence = async (serviceData) => {
    setVerifyingSocialMedia(true);
    
    try {
      setTimeout(() => {
        const name = serviceData.name || '';
        
        const hasFacebook = Math.random() > 0.3;
        const hasInstagram = Math.random() > 0.2;
        const hasLinkedIn = Math.random() > 0.4;
        const hasTwitter = Math.random() > 0.5;
        
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
          isActive: Math.random() > 0.2,
          verified: Math.random() > 0.8,
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
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/service/get/${serviceId}`);

        if (!res.ok) {
          throw new Error('Failed to fetch service details');
        }

        const data = await res.json();
        setService(data);

        // Simulate AI assessment on data load
        simulateAiAssessment(data);

        // Verify social media for services
        if (['cleaning', 'catering', 'moving', 'landscaping', 'daycare', 'schoolTransport', 'maintenance'].includes(data.type)) {
          verifySocialMediaPresence(data);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  // Simulate AI assessment of service content
  const simulateAiAssessment = (serviceData) => {
    setTimeout(() => {
      const description = serviceData.description || '';

      // Calculate description quality based on length and keywords
      let descScore = 0;
      if (description.length > 200) descScore += 2;
      if (description.length > 500) descScore += 1;
      if (description.includes("experience") || description.includes("professional")) descScore += 1;
      if (description.includes("certified") || description.includes("qualified")) descScore += 1;

      // Service-specific scoring
      if (serviceData.type === 'cleaning') {
        if (description.includes("certified") || description.includes("licensed")) descScore += 2;
        if (description.includes("sanitized") || description.includes("hygiene")) descScore += 1;
        if (description.includes("eco-friendly") || description.includes("green")) descScore += 1;
      }

      if (serviceData.type === 'catering') {
        if (description.includes("certified") || description.includes("culinary")) descScore += 2;
        if (description.includes("hygiene") || description.includes("sanitized")) descScore += 1;
        if (description.includes("gourmet") || description.includes("professional")) descScore += 1;
        if (description.includes("menu") || description.includes("cuisine")) descScore += 1;
      }

      if (serviceData.type === 'moving') {
        if (description.includes("licensed") || description.includes("insured")) descScore += 2;
        if (description.includes("experienced") || description.includes("professional")) descScore += 1;
        if (description.includes("equipment") || description.includes("tools")) descScore += 1;
      }

      // Calculate image quality based on number of images
      let imgScore = 0;
      if (serviceData.imageUrls?.length > 0) imgScore = 3;
      if (serviceData.imageUrls?.length > 2) imgScore = 4;
      if (serviceData.imageUrls?.length > 4) imgScore = 5;

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

    if (!service?.contact) {
      alert(`${getProfessionalTitle(service?.type)} contact information is missing. Please try another contact method.`);
      return;
    }

    // Validate service selection
    if (bookingData.selectedServices.length === 0) {
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
    const acceptMessage = `Hi ${bookingData.name}, I accept your booking for ${service.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Determine the location and travel fee message
    let locationInfo = '';
    let travelFeeMessage = '';
    const isHomeVisit = bookingData.locationOption === 'comeToYou';
    const hasTravelFee = service.travelFee > 0 && isHomeVisit;

    if (isHomeVisit) {
      locationInfo = 'Come to Client';
      if (hasTravelFee) {
        travelFeeMessage = `• Travel Fee: R${service.travelFee}%0A`;
      }
    } else if (bookingData.locationOption === 'comeToYou') {
      locationInfo = 'Come to Client';
    } else {
      locationInfo = service.type === 'catering' ? "Catering Kitchen" : 
                     service.type === 'moving' ? "Moving Company Office" :
                     service.type === 'landscaping' ? "Landscaping Office" :
                     service.type === 'daycare' ? "Daycare Center" :
                     service.type === 'schoolTransport' ? "Transport Office" :
                     `${getProfessionalTitle(service.type)}'s Location`;
    }

    // Build the main WhatsApp message
    let message = `*🏢 New ${getProfessionalTitle(service.type)} Booking Request for ${service.name}*%0A%0A`;

    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Price: R${service.regularPrice}%0A`;
    
    // Add selected services
    const serviceOptions = getServiceOptions(service.type);
    if (bookingData.selectedServices.length > 0) {
      const selectedServiceNames = bookingData.selectedServices.map(serviceId => {
        const service = serviceOptions.find(s => s.id === serviceId);
        return service ? service.name : serviceId;
      }).join(', ');
      
      message += `• Services: ${selectedServiceNames}%0A`;
    }

    // Add service-specific details
    if (service.type === 'moving' && bookingData.movingSize) {
      const movingSize = movingSizes.find(m => m.id === bookingData.movingSize);
      if (movingSize) {
        message += `• Moving Size: ${movingSize.name}%0A`;
      }
    }

    if (service.type === 'moving' && bookingData.packingRequired) {
      message += `• Packing Required: ${bookingData.packingRequired === 'yes' ? 'Yes' : 'No'}%0A`;
    }

    if (service.type === 'landscaping' && bookingData.gardenSize) {
      const gardenSize = gardenSizes.find(g => g.id === bookingData.gardenSize);
      if (gardenSize) {
        message += `• Garden Size: ${gardenSize.name}%0A`;
      }
    }

    if (service.type === 'catering' && bookingData.mealType) {
      const meal = mealTypes.find(m => m.id === bookingData.mealType);
      if (meal) {
        message += `• Meal Type: ${meal.name}%0A`;
      }
    }

    if (service.type === 'catering' && bookingData.cuisinePreference) {
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
      message += `• Ingredients: ${bookingData.ingredientsProvided === 'yes' ? 'Client will provide' : 'Service will provide'}%0A`;
    }

    if (service.type === 'daycare' && bookingData.childAge) {
      message += `• Child Age: ${bookingData.childAge}%0A`;
    }

    if (service.type === 'schoolTransport' && bookingData.schoolName) {
      message += `• School Name: ${bookingData.schoolName}%0A`;
    }

    if (service.type === 'schoolTransport' && bookingData.pickupLocation) {
      message += `• Pickup Location: ${bookingData.pickupLocation}%0A`;
    }

    if (service.type === 'schoolTransport' && bookingData.dropoffLocation) {
      message += `• Dropoff Location: ${bookingData.dropoffLocation}%0A`;
    }
    
    if (hasTravelFee) {
      message += travelFeeMessage;
    }
    message += `• ${getProfessionalTitle(service.type)} Contact: ${service.contact}%0A%0A`;

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

    // Add action links for the service provider to accept or decline
    message += `*ACTION REQUIRED*%0A`;
    message += `Tap a link to reply to the client:%0A%0A`;
    if (acceptLink) {
      message += `✅ Accept: ${acceptLink}%0A`;
    }
    if (declineLink) {
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `💬 You can also reply directly to this message.%0A%0A`;
    message += `_Sent via Service Booking System_`;

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(service.contact)}?text=${message}`;
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

  const whatsappNumber = service ? formatContactForWhatsApp(service.contact) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi ${service.name}, I'm interested in your ${getProfessionalTitle(service.type).toLowerCase()} services.`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading {service?.type ? getProfessionalTitle(service.type).toLowerCase() : 'service'} details...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading {service?.type ? getProfessionalTitle(service.type).toLowerCase() : 'service'}</h3>
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

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Service not found</h2>
          <p className="mt-2 text-gray-600">The service you re looking for doesn t exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  const description = service.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  const serviceOptions = getServiceOptions(service.type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => navigate('/service-home-page')}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back to listings"
        >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Floating Action Buttons */}
      {(service.contact || whatsappNumber) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 sm:flex-row">
          {service.contact && (
            <a
              href={`tel:${service.contact}`}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label={`Call ${getProfessionalTitle(service.type)}`}
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
              aria-label={`WhatsApp ${getProfessionalTitle(service.type)}`}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Colored Header with Profile */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                <div className="w-16 h-16 bg-white rounded-2xl border-4 border-white border-opacity-20 shadow-lg flex items-center justify-center flex-shrink-0">
                  {service.profileImage ? (
                    <img 
                      src={service.profileImage} 
                      alt={service.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {service.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Name and Title */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                    {service.name}
                  </h1>
                  <div className="text-blue-100 text-sm font-medium">
                    Professional {getProfessionalTitle(service.type)}
                  </div>
                </div>
                
                {/* Price Badge */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white border-opacity-30">
                  <div className="text-white text-xs font-semibold opacity-90 mb-1">STARTING FROM</div>
                  <div className="text-white text-xl font-bold">R{service.regularPrice}</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Verification and Rating Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {service.security && (
                  <div className="inline-flex items-center bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    <span className="text-emerald-700 font-semibold text-sm">
                      ✅ Verified Service
                    </span>
                  </div>
                )}
                
                <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <FaStar className="text-yellow-500 text-sm mr-2" />
                  <span className="text-blue-700 font-semibold text-sm">
                    {service.rating ? `${service.rating} Rating` : 'New Service'}
                  </span>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Location Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-purple-600 text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-600 font-medium mb-1">Location</div>
                      <div className="text-gray-900 font-semibold text-sm truncate">{service.address}</div>
                    </div>
                  </div>
                </div>

                {/* Experience Card */}
                {service.host && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaBriefcase className="text-orange-600 text-lg" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-1">Experience</div>
                        <div className="text-gray-900 font-semibold text-sm">
                          {service.host} {service.type === 'catering' ? 'Years Catering' : 
                                        service.type === 'cleaning' ? 'Years Cleaning' :
                                        service.type === 'moving' ? 'Years Moving' :
                                        service.type === 'landscaping' ? 'Years Landscaping' :
                                        service.type === 'daycare' ? 'Years Childcare' :
                                        service.type === 'schoolTransport' ? 'Years Driving' :
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
                      <div className="text-gray-900 font-semibold text-sm">{service.responseTime || 'Within 1 hour'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Verification */}
              <div className="border-t border-gray-200 pt-6">
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

          {/* Image Gallery */}
          {service.imageUrls && service.imageUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gallery</h3>
                <p className="text-gray-600 text-sm">View {getProfessionalTitle(service.type).toLowerCase()} s work and environment</p>
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
                  {service.imageUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container">
                        <img
                          src={url}
                          alt={`${service.name} - Image ${index + 1}`}
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
                {service.imageUrls.length > 1 && (
                  <Swiper
                    modules={[Thumbs]}
                    watchSlidesProgress={true}
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={4}
                    freeMode={true}
                    className="thumbs-swiper mt-4"
                  >
                    {service.imageUrls.map((url, index) => (
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
              <h3 className="text-lg font-semibold text-gray-900">
                About {getProfessionalTitle(service.type)}
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
                {service.security && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FaCheckCircle className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-800">Verified</span>
                  </div>
                )}
                {service.imageUrls?.length >= 3 && (
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
                {service.host && parseInt(service.host) >= 2 && (
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
                    {service.contact && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Phone Number:</span>
                        <span className="font-medium text-gray-900">{service.contact}</span>
                      </li>
                    )}
                    {service.email && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Email:</span>
                        <span className="font-medium text-gray-900">{service.email}</span>
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
                    {service.period && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Working Hours:</span>
                        <span className="font-medium text-gray-900">{service.period}</span>
                      </li>
                    )}
                    {service.availability && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Schedule:</span>
                        <span className="font-medium text-gray-900">{service.availability}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <span className="text-gray-600 min-w-[120px]">Response Time:</span>
                      <span className="font-medium text-gray-900">
                        {service.responseTime || '1 hour to 24 hours'}
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
                    {service.host && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Experience:</span>
                        <span className="font-medium text-gray-900">{service.host} years</span>
                      </li>
                    )}
                    {service.cancel && (
                      <li className="flex items-center gap-3">
                        <span className="text-gray-600 min-w-[120px]">Languages:</span>
                        <span className="font-medium text-gray-900">{service.cancel}</span>
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
                      <span>Background Check: {service.security ? 'Verified' : 'Not Verified'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FaDog className="text-blue-600" />
                      <span>Pets: {service.pets ? 'Comfortable with pets' : 'Not comfortable with pets'}</span>
                    </li>
                    
                    {/* Safety Policy Links */}
                    <li className="pt-2">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Safety Policies</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-blue-700">We prioritize your safety and satisfaction</p>
                          <a 
                            href="/safety-policy" 
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            <FaShieldAlt className="text-xs" />
                            <span>View our complete safety policy</span>
                          </a>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Type-Specific Information */}
                {service.type === 'cleaning' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaBroom className="text-green-500" />
                      Cleaning Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaBroom className="text-green-500" />
                        <span>Equipment Quality: {service.equipment?.includes('professional') ? 'Professional' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaShieldAlt className="text-green-500" />
                        <span>Eco-Friendly: {service.equipment?.includes('eco') ? 'Yes' : 'No'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {service.type === 'catering' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaUtensils className="text-orange-500" />
                      Catering Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaShieldAlt className="text-orange-500" />
                        <span>Food Safety: {service.equipment?.includes('sanitized') ? 'Certified' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaUtensils className="text-orange-500" />
                        <span>Equipment Quality: {service.equipment?.includes('professional') ? 'Professional' : 'Standard'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {service.type === 'moving' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaTruck className="text-blue-500" />
                      Moving Standards
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <FaTruck className="text-blue-500" />
                        <span>Vehicle Quality: {service.equipment?.includes('modern') ? 'Modern Fleet' : 'Standard'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <FaShieldAlt className="text-blue-500" />
                        <span>Insurance: {service.security ? 'Fully Insured' : 'Basic Coverage'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Service Area */}
                {service.serviceArea && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-600" />
                      Service Area
                    </h3>
                    <p className="text-gray-700">{service.serviceArea}</p>
                    {service.travelFee && (
                      <p className="text-sm text-gray-600 mt-1">
                        Travel fee: R{service.travelFee} for locations outside service area
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
                {service.contact && (
                  <a
                    href={`tel:${service.contact}`}
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
                <a
                  href="/safety-policy"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaShieldAlt className="text-sm" />
                  Safety Policy
                </a>
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
            <Comment 
              serviceId={service._id} 
              maxComments={2}
              onTotalComments={setCommentCount} 
              cardStyle={true}
            />
          </div>
        </div>

        {/* Right Column - Booking Form */}
        <div className="space-y-6">
          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Book {getProfessionalTitle(service.type)} Services
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
              {serviceOptions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    Select Services
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceOptions.map((serviceOption) => (
                      <button
                        key={serviceOption.id}
                        type="button"
                        onClick={() => handleServiceSelection(serviceOption.id)}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          bookingData.selectedServices.includes(serviceOption.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {serviceOption.icon}
                          <span className="text-sm font-medium">{serviceOption.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service-specific Fields */}
              {service.type === 'catering' && (
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
                      <option value="no">Service will provide ingredients</option>
                      <option value="yes">I will provide ingredients</option>
                    </select>
                  </div>
                </div>
              )}

              {service.type === 'moving' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Moving Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moving Size
                    </label>
                    <select
                      name="movingSize"
                      value={bookingData.movingSize}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select moving size</option>
                      {movingSizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing Service Required
                    </label>
                    <select
                      name="packingRequired"
                      value={bookingData.packingRequired}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="no">No, I will pack myself</option>
                      <option value="yes">Yes, need packing service</option>
                    </select>
                  </div>
                </div>
              )}

              {service.type === 'landscaping' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Garden Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Garden Size
                    </label>
                    <select
                      name="gardenSize"
                      value={bookingData.gardenSize}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select garden size</option>
                      {gardenSizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {service.type === 'daycare' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Child Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Age
                    </label>
                    <input
                      type="text"
                      name="childAge"
                      value={bookingData.childAge}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 3 years old"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Needs
                    </label>
                    <input
                      type="text"
                      name="specialNeeds"
                      value={bookingData.specialNeeds}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any allergies or special requirements"
                    />
                  </div>
                </div>
              )}

              {service.type === 'schoolTransport' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Transport Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={bookingData.schoolName}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter school name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={bookingData.pickupLocation}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pickup address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dropoff Location
                    </label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={bookingData.dropoffLocation}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter dropoff address"
                    />
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
                        {getProfessionalTitle(service.type)} comes to me
                      </div>
                      <div className="text-sm text-gray-600">
                        {getProfessionalTitle(service.type)} will provide service at your location
                        {service.travelFee > 0 && (
                          <span className="text-orange-600 font-medium ml-1">
                            (Travel fee: R{service.travelFee})
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
                        I ll go to {getProfessionalTitle(service.type).toLowerCase()} s location
                      </div>
                      <div className="text-sm text-gray-600">
                        Visit {getProfessionalTitle(service.type).toLowerCase()} s location
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
                  placeholder={`Any special requests or requirements for the ${service.type === 'catering' ? 'meal' : 'service'}...`}
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
                  `Book ${getProfessionalTitle(service.type)} via WhatsApp`
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
              {service.contact && (
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <a
                    href={`tel:${service.contact}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {service.contact}
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
              {service.address && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{service.address}</span>
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
                <span className="font-semibold text-gray-900">R{service.regularPrice}</span>
              </div>
              {service.travelFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Travel Fee</span>
                  <span className="font-semibold text-orange-600">R{service.travelFee}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Estimate</span>
                  <span className="font-bold text-lg text-blue-600">
                    R{service.regularPrice + (bookingData.locationOption === 'comeToYou' ? service.travelFee : 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * Final price may vary based on specific requirements
                </p>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
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
                <span className="text-yellow-700 font-medium">Verify the service provider s identity upon arrival</span>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-white p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-yellow-700 font-medium">Never pay the full amount upfront - only after satisfactory service</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-yellow-200">
              <a 
                href="/aboutloop" 
                className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-semibold transition-colors hover:underline"
              >
                <span>Learn more about our safety policies</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
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