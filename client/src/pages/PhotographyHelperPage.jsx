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
  FaExpand, FaCompress, FaChevronLeft, FaChevronRight, FaArrowRight
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

export default function PhotographyHelperPage() {
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
    // Photography-specific fields
    photographyType: '',
    sessionDuration: '',
    numberOfPeople: '',
    photographyRequirements: '',
    deliveryFormat: '',
    // Additional fields
    specialRequirements: '',
    eventType: '',
    preferredStyle: '',
    venue: '',
    references: ''
  });

  // Photography-specific options
  const photographyTypes = [
    { id: 'portrait', name: 'Portrait Photography', icon: <FaUser className="text-blue-500" /> },
    { id: 'event', name: 'Event Photography', icon: <FaGlassCheers className="text-purple-500" /> },
    { id: 'product', name: 'Product Photography', icon: <FaShoppingBasket className="text-green-500" /> },
    { id: 'wedding', name: 'Wedding Photography', icon: <FaRing className="text-pink-500" /> },
    { id: 'family', name: 'Family Photography', icon: <FaUserFriends className="text-orange-500" /> },
    { id: 'commercial', name: 'Commercial Photography', icon: <FaBriefcase className="text-indigo-500" /> },
    { id: 'realestate', name: 'Real Estate Photography', icon: <FaHome className="text-yellow-600" /> },
    { id: 'landscape', name: 'Landscape Photography', icon: <FaMapMarkerAlt className="text-teal-500" /> }
  ];

  const sessionDurations = [
    { id: '1', name: '1 hour' },
    { id: '2', name: '2 hours' },
    { id: '3', name: '3 hours' },
    { id: '4', name: '4 hours' },
    { id: '5', name: '5+ hours' },
    { id: 'full-day', name: 'Full Day (8 hours)' },
    { id: 'half-day', name: 'Half Day (4 hours)' }
  ];

  const deliveryFormats = [
    { id: 'digital', name: 'Digital Files Only' },
    { id: 'prints', name: 'Prints + Digital' },
    { id: 'album', name: 'Photo Album' },
    { id: 'all', name: 'All Formats' },
    { id: 'custom', name: 'Custom Package' }
  ];

  const eventTypes = [
    { id: 'wedding', name: 'Wedding' },
    { id: 'corporate', name: 'Corporate Event' },
    { id: 'birthday', name: 'Birthday Party' },
    { id: 'engagement', name: 'Engagement' },
    { id: 'graduation', name: 'Graduation' },
    { id: 'family-gathering', name: 'Family Gathering' },
    { id: 'product-launch', name: 'Product Launch' },
    { id: 'other', name: 'Other' }
  ];

  const photographyStyles = [
    { id: 'traditional', name: 'Traditional' },
    { id: 'photojournalistic', name: 'Photojournalistic' },
    { id: 'fine-art', name: 'Fine Art' },
    { id: 'documentary', name: 'Documentary' },
    { id: 'modern', name: 'Modern' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'natural', name: 'Natural/Light' },
    { id: 'dramatic', name: 'Dramatic' }
  ];

  // Helper function to get professional title
  const getProfessionalTitle = () => {
    return 'Photographer';
  };

  // Get theme color for photography
  const getThemeColor = () => {
    return 'purple';
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = getThemeColor();

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
      travelFee: provider.travelFee || 0,
      mapLink: '',
      coordinates: null
    };

    switch (bookingData.locationOption) {
      case locationTypes.COME_TO_CLIENT:
        locationInfo.displayName = 'Client Address';
        locationInfo.address = bookingData.address;
        locationInfo.instructions = bookingData.specialRequirements || '';
        locationInfo.mapLink = generateMapLink(bookingData.address);
        break;
      
      case locationTypes.PROVIDER_LOCATION:
        locationInfo.displayName = 'Photography Studio';
        locationInfo.address = provider.address || 'Address not specified';
        locationInfo.instructions = provider.locationInstructions || '';
        locationInfo.mapLink = generateMapLink(locationInfo.address);
        break;
      
      default:
        locationInfo.displayName = "Photographer's Location";
        locationInfo.address = provider.address || 'Address not specified';
        locationInfo.mapLink = generateMapLink(locationInfo.address);
    }

    return locationInfo;
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
    const suffixes = ['', 'photography', 'photos', 'studio', 'captures', 'lens', 'frames', 'moments'];
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
        const name = helperData.name || '';
        
        // AI logic for photography professionals
        const hasInstagram = Math.random() > 0.1; // 90% chance for photographers
        const hasFacebook = Math.random() > 0.3; // 70% chance
        const hasPortfolio = Math.random() > 0.2; // 80% chance
        
        const instagramData = hasInstagram ? {
          exists: true,
          username: generateUsername(name, 'instagram'),
          url: `https://instagram.com/${generateUsername(name, 'instagram')}`,
          isActive: true, // Photographers are usually active on Instagram
          verified: Math.random() > 0.5,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 50000) + 1000,
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

        const facebookData = hasFacebook ? {
          exists: true,
          username: generateUsername(name, 'facebook'),
          url: `https://facebook.com/${generateUsername(name, 'facebook')}`,
          isActive: Math.random() > 0.4,
          verified: Math.random() > 0.7,
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

        // Portfolio website
        const portfolioData = hasPortfolio ? {
          exists: true,
          url: `https://${generateUsername(name, 'portfolio')}.com`,
          lastUpdated: getRandomRecentDate()
        } : null;

        setSocialMediaVerification({
          facebook: facebookData,
          instagram: instagramData,
          linkedin: {
            exists: false,
            verificationStatus: 'not_found'
          },
          twitter: {
            exists: false,
            verificationStatus: 'not_found'
          },
          portfolio: portfolioData
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
        // Fetch the specific photography helper by ID
        const res = await fetch(`/api/helper/get/${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch photographer details');
        }

        const data = await res.json();
        
        // Override type to photography for this route
        data.type = 'photography';
        setHelper(data);

        // Simulate AI assessment on data load
        simulateAiAssessment(data);

        // Verify social media for photography professional
        verifySocialMediaPresence(data);

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

  // Simulate AI assessment of photographer content
  const simulateAiAssessment = (helperData) => {
    setTimeout(() => {
      const description = helperData.description || '';

      let descScore = 0;
      if (description.length > 200) descScore += 2;
      if (description.length > 500) descScore += 1;
      
      // Photography-specific scoring
      if (description.includes("photographer") || description.includes("camera")) descScore += 1;
      if (description.includes("certified") || description.includes("professional")) descScore += 1;
      if (description.includes("experience") || description.includes("years")) descScore += 1;
      if (description.includes("wedding") || description.includes("portrait")) descScore += 1;
      if (description.includes("equipment") || description.includes("camera")) descScore += 1;
      if (description.includes("editing") || description.includes("retouching")) descScore += 1;
      if (description.includes("portfolio") || description.includes("gallery")) descScore += 1;

      // Calculate image quality based on number of images
      let imgScore = 0;
      if (helperData.imageUrls?.length > 0) imgScore = 3;
      if (helperData.imageUrls?.length > 3) imgScore = 4;
      if (helperData.imageUrls?.length > 5) imgScore = 5;

      // Overall rating (weighted average)
      const overall = Math.min(5, (descScore + imgScore) / 2);

      // Random likes/dislikes count
      const likes = Math.floor(Math.random() * 50) + 10;
      const dislikes = Math.floor(Math.random() * 5);

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

  // Upload files to cloud storage
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

  // Enhanced booking submit function for photography
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!helper?.contact) {
      alert("Photographer contact information is missing. Please try another contact method.");
      return;
    }

    // Enhanced location validation
    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for the photo session.");
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
    if (bookingData.selectedServices.length === 0) {
      alert("Please select at least one photography service.");
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

    // Format the client's phone number
    const clientPhone = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';

    // Define the accept and decline messages
    const acceptMessage = `Hi ${bookingData.name}, I accept your photography booking for ${bookingData.eventType || 'photo session'} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Enhanced location handling
    const locationInfo = handleLocationInfo(bookingData, helper);
    const locationMessage = getLocationSpecificMessage(bookingData, helper);

    // Build the WhatsApp message
    let message = `*📷 New Photography Booking Request for ${helper.name}*%0A%0A`;

    message += `*🛎️ PHOTOGRAPHY DETAILS*%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;
    
    // Add selected services
    if (bookingData.selectedServices.length > 0) {
      const selectedServiceNames = bookingData.selectedServices.map(serviceId => {
        const service = photographyTypes.find(s => s.id === serviceId);
        return service ? service.name : serviceId;
      }).join(', ');
      
      message += `• Services: ${selectedServiceNames}%0A`;
    }

    // Add photography-specific details
    if (bookingData.photographyType) {
      const type = photographyTypes.find(t => t.id === bookingData.photographyType);
      if (type) {
        message += `• Photography Type: ${type.name}%0A`;
      }
    }

    if (bookingData.sessionDuration) {
      const duration = sessionDurations.find(d => d.id === bookingData.sessionDuration);
      if (duration) {
        message += `• Session Duration: ${duration.name}%0A`;
      }
    }

    if (bookingData.numberOfPeople) {
      message += `• Number of People: ${bookingData.numberOfPeople}%0A`;
    }

    if (bookingData.deliveryFormat) {
      const format = deliveryFormats.find(f => f.id === bookingData.deliveryFormat);
      if (format) {
        message += `• Delivery Format: ${format.name}%0A`;
      }
    }

    if (bookingData.eventType) {
      const event = eventTypes.find(e => e.id === bookingData.eventType);
      if (event) {
        message += `• Event Type: ${event.name}%0A`;
      }
    }

    if (bookingData.preferredStyle) {
      const style = photographyStyles.find(s => s.id === bookingData.preferredStyle);
      if (style) {
        message += `• Preferred Style: ${style.name}%0A`;
      }
    }

    if (bookingData.venue) {
      message += `• Venue: ${bookingData.venue}%0A`;
    }

    if (bookingData.references) {
      message += `• Reference Images/Examples: ${bookingData.references}%0A`;
    }
    
    if (locationInfo.travelFee > 0) {
      message += `• Travel Fee: R${locationInfo.travelFee}%0A`;
    }
    
    if (bookingData.photographyRequirements) {
      message += `• Special Requirements: ${bookingData.photographyRequirements}%0A`;
    }
    
    message += `• Photographer Contact: ${helper.contact}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    
    // Enhanced location section
    message += locationMessage;
    
    message += `• Additional Requirements: ${bookingData.specialRequirements || 'None'}%0A`;
    
    message += `%0A`;

    // Enhanced location instructions for photography
    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Service Type: On-location Photography%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Navigation Link:%0A  ${locationInfo.mapLink}%0A`;
      }
      
      // Photography-specific location requirements
      message += `• Location Requirements:%0A`;
      message += `  ✓ Adequate natural light or lighting setup%0A`;
      message += `  ✓ Space for photography equipment%0A`;
      message += `  ✓ Power outlets for equipment%0A`;
      message += `  ✓ Backup indoor location (if outdoor)%0A`;
      
      if (locationInfo.instructions) {
        message += `• Additional Instructions: ${locationInfo.instructions}%0A`;
      }
      
      message += `%0A`;
    } else if (bookingData.locationOption === 'goToThem' && helper.address) {
      message += `*📍 STUDIO LOCATION*%0A`;
      message += `• Service Type: Studio Photography%0A`;
      message += `• Studio Name: ${helper.studioName || helper.name}'s Studio%0A`;
      message += `• Address: ${helper.address}%0A`;
      
      if (locationInfo.mapLink && locationInfo.mapLink !== '#') {
        message += `• Navigation Link: ${locationInfo.mapLink}%0A`;
      }
      
      if (helper.studioFacilities) {
        message += `• Studio Facilities: ${helper.studioFacilities}%0A`;
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

    // Add action links for the photographer to accept or decline
    message += `*ACTION REQUIRED*%0A`;
    message += `Tap a link to reply to the client:%0A%0A`;
    if (acceptLink) {
      message += `✅ Accept: ${acceptLink}%0A`;
    }
    if (declineLink) {
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `💬 You can also reply directly to this message.%0A%0A`;
    message += `_Sent via loopOut Photography Booking System_`;

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Reset attachments after sending
    setAttachments([]);
  };

  // Quick booking function
  const handleQuickBooking = () => {
    if (!helper?.contact) {
      alert("Photographer contact information is missing.");
      return;
    }

    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number first.");
      return;
    }

    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for on-location photography.");
      return;
    }

    const clientPhone = formatContactForWhatsApp(bookingData.phone);
    const acceptMessage = `Hi ${bookingData.name}, I accept your photography booking for ${helper.name}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, I'm unable to accept this booking. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    const locationInfo = handleLocationInfo(bookingData, helper);
    const locationMessage = getLocationSpecificMessage(bookingData, helper);

    let message = `*📷 Quick Photography Booking Request for ${helper.name}*%0A%0A`;
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
    message += `*💼 Photography Details*%0A`;
    message += `• Service: Professional Photography%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;
    
    if (bookingData.selectedServices.length > 0) {
      const selectedServiceNames = bookingData.selectedServices.map(serviceId => {
        const service = photographyTypes.find(s => s.id === serviceId);
        return service ? service.name : serviceId;
      }).join(', ');
      message += `• Photography Type: ${selectedServiceNames}%0A`;
    }

    if (bookingData.sessionDuration) {
      message += `• Session Duration: ${bookingData.sessionDuration} hours%0A`;
    }

    if (bookingData.numberOfPeople) {
      message += `• Number of People: ${bookingData.numberOfPeople}%0A`;
    }

    if (bookingData.eventType) {
      message += `• Event Type: ${bookingData.eventType}%0A`;
    }

    if (bookingData.photographyRequirements) {
      message += `• Requirements: ${bookingData.photographyRequirements}%0A`;
    }
    
    // Location details
    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      message += `%0A*📍 PHOTOGRAPHY LOCATION*%0A`;
      message += `• On-location Photography%0A`;
      message += `• Address: ${bookingData.address}%0A`;
      message += `• Location Requirements:%0A`;
      message += `  ✓ Natural light or lighting setup%0A`;
      message += `  ✓ Space for photography equipment%0A`;
      message += `  ✓ Power outlets available%0A`;
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
    ? `https://wa.me/${whatsappNumber}?text=Hi ${helper.name}, I'm interested in your photography services.`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading photographer details...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching the best photography professional for you</p>
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
              <h3 className="text-lg font-semibold text-red-800">Error loading photographer profile</h3>
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
            <FaCamera className="text-gray-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Photographer not found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">The photographer you're looking for doesn't exist or may have been removed from our platform.</p>
          <button
            onClick={() => navigate('/helper-home-page')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Browse Other Photographers
          </button>
        </div>
      </div>
    );
  }

  const description = helper.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

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
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          color: white;
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
          z-index: 40;
        }
        
        .floating-action-button:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
        }
        
        /* Gradient backgrounds */
        .gradient-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(226, 232, 240, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .gradient-header {
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
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
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
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
                {helper.name}'s Photography Portfolio
              </div>
            </div>
            <div className="text-white/80 font-medium">
              {currentGalleryIndex + 1} / {helper.imageUrls.length}
            </div>
          </div>

          <div className="gallery-main-image">
            <img
              src={helper.imageUrls[currentGalleryIndex]}
              alt={`Photography portfolio ${currentGalleryIndex + 1}`}
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
                      className={`gallery-thumbnail ${index === currentGalleryIndex ? 'ring-4 ring-purple-500 ring-offset-2' : ''}`}
                      onClick={() => setCurrentGalleryIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`Photography thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div className="thumbnail-overlay">
                        {index === currentGalleryIndex && (
                          <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                            Viewing
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
                      Book Photography Services
                    </h2>
                    <p className="text-purple-100 mt-2 text-sm">
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
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-lg transition-all"
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
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-lg transition-all"
                          placeholder="071 234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photography Service Selection */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">
                      Photography Services
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photographyTypes.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelection(service.id)}
                          className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover-lift ${
                            bookingData.selectedServices.includes(service.id)
                              ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg'
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

                  {/* Photography Details */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Session Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Photography Type
                        </label>
                        <select
                          name="photographyType"
                          value={bookingData.photographyType}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        >
                          <option value="">Select photography type</option>
                          {photographyTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Session Duration
                        </label>
                        <select
                          name="sessionDuration"
                          value={bookingData.sessionDuration}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        >
                          <option value="">Select duration</option>
                          {sessionDurations.map((duration) => (
                            <option key={duration.id} value={duration.id}>
                              {duration.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Number of People
                        </label>
                        <input
                          type="number"
                          name="numberOfPeople"
                          value={bookingData.numberOfPeople}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                          placeholder="e.g., 1, 2, 10"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Delivery Format
                        </label>
                        <select
                          name="deliveryFormat"
                          value={bookingData.deliveryFormat}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        >
                          <option value="">Select delivery format</option>
                          {deliveryFormats.map((format) => (
                            <option key={format.id} value={format.id}>
                              {format.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Special Requirements
                      </label>
                      <textarea
                        name="photographyRequirements"
                        value={bookingData.photographyRequirements}
                        onChange={handleBookingChange}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        placeholder="Any specific requirements, styles, or preferences..."
                        rows="3"
                      />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Event Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Event Type
                        </label>
                        <select
                          name="eventType"
                          value={bookingData.eventType}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Preferred Style
                        </label>
                        <select
                          name="preferredStyle"
                          value={bookingData.preferredStyle}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        >
                          <option value="">Select photography style</option>
                          {photographyStyles.map((style) => (
                            <option key={style.id} value={style.id}>
                              {style.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Venue Name
                        </label>
                        <input
                          type="text"
                          name="venue"
                          value={bookingData.venue}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                          placeholder="e.g., Grand Hotel, Beach Venue, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Reference Images/Examples
                        </label>
                        <input
                          type="text"
                          name="references"
                          value={bookingData.references}
                          onChange={handleBookingChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                          placeholder="Links or descriptions of preferred styles"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Options */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Location</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          id="comeToYou"
                          name="locationOption"
                          value="comeToYou"
                          checked={bookingData.locationOption === 'comeToYou'}
                          onChange={handleBookingChange}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="comeToYou" className="text-gray-700">
                          Photographer comes to your location
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          id="goToThem"
                          name="locationOption"
                          value="goToThem"
                          checked={bookingData.locationOption === 'goToThem'}
                          onChange={handleBookingChange}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="goToThem" className="text-gray-700">
                          Go to photographer's studio
                        </label>
                      </div>
                    </div>

                    {bookingData.locationOption === 'comeToYou' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Your Address *
                        </label>
                        <textarea
                          name="address"
                          value={bookingData.address}
                          onChange={handleBookingChange}
                          required={bookingData.locationOption === 'comeToYou'}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                          placeholder="Full address for the photo session"
                          rows="3"
                        />
                      </div>
                    )}
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
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-lg transition-all"
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
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-lg transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 text-2xl border-b pb-4">Additional Information</h4>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Additional Requirements or Notes
                      </label>
                      <textarea
                        name="specialRequirements"
                        value={bookingData.specialRequirements}
                        onChange={handleBookingChange}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        placeholder="Any other important details, special requests, or notes..."
                        rows="4"
                      />
                    </div>

                    {/* File Attachments */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Reference Files (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <input
                          type="file"
                          id="attachments"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleAttachmentChange}
                          className="hidden"
                        />
                        <label htmlFor="attachments" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <FaFileImage className="text-gray-400 text-3xl" />
                            <p className="text-gray-600">
                              Click to upload reference images or documents
                            </p>
                            <p className="text-sm text-gray-500">
                              Max 2 files, 5MB each (images or PDFs)
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {/* Display uploaded files */}
                      {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                {file.type.startsWith('image/') ? (
                                  <FaFileImage className="text-blue-500" />
                                ) : (
                                  <FaFilePdf className="text-red-500" />
                                )}
                                <span className="text-sm font-medium">{file.name}</span>
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
                          <span>Book Photography Session via WhatsApp</span>
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
                      <FaCamera className="text-xs" /> Professional Photographer
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
                      <span className="text-white font-bold text-lg">{helper.rating || '4.8'}</span>
                      <span className="text-white/80">({helper.reviewCount || '35'} reviews)</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white font-bold text-lg">R{helper.regularPrice || '850'}</span>
                    <span className="text-white/80 text-sm ml-2">per session</span>
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
                      <p className="text-gray-600 mt-1 truncate">Professional Photographer</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 text-gray-700 truncate">
                          <FaMapMarkerAlt className="text-purple-500 flex-shrink-0" />
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
                      className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 lg:px-6 lg:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                    >
                      Book Photography Session
                    </button>
                  </div>
                  
                  {/* Verification Badges */}
                  <div className="flex flex-wrap gap-2 lg:gap-3 mt-4 lg:mt-6">
                    {helper.security && (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaCheckCircle className="text-emerald-600" />
                        <span className="text-emerald-800 font-semibold text-xs lg:text-sm">Verified Photographer</span>
                      </div>
                    )}
                    
                    <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                      <FaStar className="text-yellow-500" />
                      <span className="text-purple-800 font-semibold text-xs lg:text-sm">
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
                    
                    {helper.specializations && (
                      <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                        <FaCamera className="text-blue-600" />
                        <span className="text-blue-800 font-semibold text-xs lg:text-sm">
                          {helper.specializations}
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
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">Photography Portfolio</h3>
                  <button
                    onClick={() => openFullScreenGallery(0)}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaExpand />
                    <span>View Full Portfolio</span>
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
                        alt={`${helper.name} - Photography ${index + 1}`}
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
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
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
                  About the Photographer
                </h3>
                {description.length > 300 && (
                  <button
                    onClick={toggleDescription}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 whitespace-nowrap"
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

            {/* Specializations Section */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
                Photography Specializations
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photographyTypes.slice(0, 8).map((type) => (
                  <div
                    key={type.id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover-lift"
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="text-2xl text-purple-600">{type.icon}</div>
                      <span className="text-sm font-semibold text-gray-800">{type.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assessment Section */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
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
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 lg:p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-lg lg:text-2xl font-bold text-white">
                        {aiAssessment.overallRating?.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base lg:text-lg">Overall Quality Score</h4>
                      <p className="text-gray-600 text-sm lg:text-base">Based on portfolio and experience</p>
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
                      <span className="font-bold text-gray-900 text-sm lg:text-base">Profile Quality</span>
                      <span className="text-lg lg:text-xl font-bold text-purple-600">
                        {aiAssessment.descriptionQuality}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 lg:h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(aiAssessment.descriptionQuality / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500 mt-2 lg:mt-3">
                      Based on experience and specialization details
                    </p>
                  </div>

                  {/* Portfolio Quality */}
                  <div className="p-4 lg:p-6 bg-white border-2 border-gray-200 rounded-2xl hover-lift">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <span className="font-bold text-gray-900 text-sm lg:text-base">Portfolio Quality</span>
                      <span className="text-lg lg:text-xl font-bold text-purple-600">
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
                      Based on portfolio diversity and quality
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
                      <span className="font-semibold text-blue-800 text-xs lg:text-sm">Rich Portfolio</span>
                    </div>
                  )}
                  {description.length > 200 && (
                    <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl lg:rounded-2xl hover-lift">
                      <FaUser className="text-purple-600 text-base lg:text-xl flex-shrink-0" />
                      <span className="font-semibold text-purple-800 text-xs lg:text-sm">Detailed Profile</span>
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
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">Client Reviews</h3>
                <button
                  onClick={() => setShowCommentsPanel(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
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
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg">
                  <FaCamera className="text-white text-lg lg:text-2xl" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Book Photography Session</h3>
                <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">Instant booking via WhatsApp</p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">R{helper.regularPrice || '850'}</div>
                  <p className="text-gray-600 text-sm lg:text-base">per session</p>
                  {helper.travelFee > 0 && (
                    <p className="text-orange-600 text-sm lg:text-base mt-2">+ R{helper.travelFee} travel fee</p>
                  )}
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <button
                    onClick={openBookingFormOverlay}
                    className="w-full py-3 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-base lg:text-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
                    <span className="font-semibold">{helper.responseTime || 'Within 30 minutes'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mt-2">
                    <span>Availability</span>
                    <span className="font-semibold">{helper.availability || 'Flexible Schedule'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mt-2">
                    <span>Equipment</span>
                    <span className="font-semibold">Professional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Contact Information</h3>
              
              <div className="space-y-4 lg:space-y-6">
                {helper.contact && (
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-purple-600 text-base lg:text-xl" />
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

                <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-blue-600 text-base lg:text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-gray-900 text-sm lg:text-base">{helper.responseTime || 'Within 30 minutes'}</p>
                  </div>
                </div>

                {helper.email && (
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="text-orange-600 text-base lg:text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Email</p>
                      <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{helper.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Verification */}
              <div className="mt-6 lg:mt-8 pt-4 lg:pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Social & Portfolio</h4>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {socialMediaVerification.instagram.exists && (
                    <a
                      href={socialMediaVerification.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 lg:p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:shadow-lg transition-all duration-300"
                      title="Instagram Portfolio"
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
                      title="Facebook Page"
                    >
                      <FaFacebook className="text-blue-600 text-base lg:text-xl" />
                    </a>
                  )}
                  {socialMediaVerification.portfolio && socialMediaVerification.portfolio.exists && (
                    <a
                      href={socialMediaVerification.portfolio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 lg:p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:shadow-lg transition-all duration-300"
                      title="Portfolio Website"
                    >
                      <FaCamera className="text-purple-600 text-base lg:text-xl" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Photography Equipment */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 fade-in-up overflow-hidden">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaCamera className="text-white text-base lg:text-xl" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">Professional Equipment</h3>
                  <p className="text-gray-600 text-xs lg:text-sm">High-quality gear</p>
                </div>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                  <span>Professional DSLR/Mirrorless cameras</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                  <span>Multiple lenses for different scenarios</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                  <span>Professional lighting equipment</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                  <span>Backup equipment available</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                  <span>Professional editing software</span>
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
                  <span>Background verified professional</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Contract and agreement provided</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Secure payment options</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Copyright and usage rights clarified</span>
                </div>
                <div className="flex items-center gap-3 text-xs lg:text-sm">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Professional liability insurance</span>
                </div>
              </div>

              <Link
                to="/safetyhelper"
                className="mt-4 lg:mt-6 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm lg:text-base"
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
                src={helper?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=100&q=80'}
                alt={helper?.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 truncate">{helper?.name}</h3>
                <p className="text-gray-600 truncate">Professional Photographer</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-gray-800">{helper?.rating || '4.8'}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-700">R{helper?.regularPrice || '850'}</span>
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
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <FaCamera className="text-xl" />
                <span>Book Session</span>
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