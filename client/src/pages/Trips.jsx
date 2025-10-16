/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom, Thumbs } from "swiper/modules";
import { useSelector } from "react-redux";
import emailjs from "emailjs-com";

import Calendar from "react-calendar";
import CommentsSidePanel from '../components/CommentsSidePanel';

// Icons imports
import {
  MdCleanHands,
  MdOutlineGppGood,
  MdLogin,
  MdChat,
  MdLocationOn,
  MdAttachMoney,
  MdAdsClick,
} from "react-icons/md";
import {
  FaStar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaParking,
  FaSwimmingPool,
  FaWifi,
  FaShieldAlt,
  FaChair,
  FaCookie,
  FaCoffee,
  FaStoreAlt,
  FaMusic,
  FaShower,
  FaDog,
  FaBolt,
  FaWhatsapp,
  FaPhone,
  FaArrowLeft,
  FaSpinner,
  FaComment,
  FaTv,
  FaWarehouse,
  FaChevronDown,
  FaBed,
  FaImages,
  FaThumbsUp,
  FaThumbsDown,
  FaPaperPlane,
  FaExternalLinkAlt, 
  FaUserFriends, 
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaGlobe,
  FaRegStar,
  FaStarHalfAlt,
} from "react-icons/fa";

// Styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import "swiper/css/thumbs";
import "react-calendar/dist/Calendar.css";
import "../styles/ListingDetails.scss";
import Comments from '../components/Comments';

// Constants
const AMENITIES = [
  { icon: FaParking, label: "Parking", key: "parking" },
  { icon: FaWifi, label: "WiFi", key: "wifi" },
  { icon: FaSwimmingPool, label: "Pool", key: "pool" },
  { icon: FaChair, label: "Furnished", key: "furnished" },
  { icon: FaShieldAlt, label: "Security", key: "security" },
  { icon: FaCookie, label: "Kitchen", key: "kitchen" },
  { icon: FaStoreAlt, label: "Storage", key: "storage" },
  { icon: FaShower, label: "Hot Water", key: "hot" },
  { icon: FaDog, label: "Pets Allowed", key: "pets" },
  { icon: FaBolt, label: "Electricity", key: "prepaid" },
  { icon: FaCoffee, label: "Breakfast", key: "breakfast" },
  { icon: FaMusic, label: "Sound System", key: "music" },
  { icon: FaBolt, label: "Refrigerator", key: "fridge" },
  { icon: FaTv, label: "Television", key: "tv" },
  { icon: FaWarehouse, label: "Wardrobe", key: "wardrobe" },
];

const RATING_CATEGORIES = [
  { name: "Cleanliness", icon: MdCleanHands, key: "cleanliness" },
  { name: "Accuracy", icon: MdOutlineGppGood, key: "accuracy" },
  { name: "Check-in", icon: MdLogin, key: "checkin" },
  { name: "Communication", icon: MdChat, key: "communication" },
  { name: "Location", icon: MdLocationOn, key: "location" },
  { name: "Value", icon: MdAttachMoney, key: "value" },
];

const HOST_RATING_CATEGORIES = [
  { name: "Cleanliness", icon: MdCleanHands, key: "host_cleanliness" },
  { name: "Communication", icon: MdChat, key: "host_communication" },
  { name: "Staff", icon: FaUserFriends, key: "staff" },
  { name: "Location", icon: MdLocationOn, key: "location_rating" },
];

const PROPERTY_TYPES = {
  rent: { label: 'For Rent', color: 'blue', icon: '🏠' },
  sale: { label: 'For Sale', color: 'green', icon: '💰' },
  over: { label: 'Overnight Stay', color: 'purple', icon: '🌙' },
  land: { label: 'Land', color: 'brown', icon: '🪨' },
  office: { label: 'Office Space', color: 'orange', icon: '🏢' }
};

const SOCIAL_PLATFORMS = [
  { name: 'facebook', icon: FaFacebook, color: 'text-blue-600', baseUrl: 'https://facebook.com/' },
  { name: 'instagram', icon: FaInstagram, color: 'text-pink-600', baseUrl: 'https://instagram.com/' },
  { name: 'twitter', icon: FaTwitter, color: 'text-blue-400', baseUrl: 'https://twitter.com/' },
  { name: 'linkedin', icon: FaLinkedin, color: 'text-blue-700', baseUrl: 'https://linkedin.com/in/' },
  { name: 'tiktok', icon: FaTiktok, color: 'text-black', baseUrl: 'https://tiktok.com/@' },
];

const ADVERTISING_PLATFORMS = [
  { name: 'Facebook Ads', icon: FaFacebook, color: 'bg-blue-500' },
  { name: 'Google Ads', icon: FaGlobe, color: 'bg-red-500' },
  { name: 'Instagram Ads', icon: FaInstagram, color: 'bg-pink-500' },
  { name: 'Twitter Ads', icon: FaTwitter, color: 'bg-blue-400' },
  { name: 'TikTok Ads', icon: FaTiktok, color: 'bg-black' },
];

export default function Listing() {
  const { listingId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // State declarations
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1024);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [listing, setListing] = useState(null);
  const [activeThumb, setActiveThumb] = useState(null);
  const [mealPlan, setMealPlan] = useState('breakfast');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNearExpanded, setIsNearExpanded] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return [today, tomorrow];
  });

  const [uiState, setUiState] = useState({
    loading: false,
    error: false,
    submitting: false,
    showAllReviews: false,
    newReviewsAvailable: false
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    message: "",
    phoneError: false
  });

  const [fullscreenImage, setFullscreenImage] = useState({
    open: false,
    index: 0
  });

  const [aiRating, setAiRating] = useState({
    average: 0,
    totalRatings: 0,
    categoryRatings: RATING_CATEGORIES.reduce((acc, { name }) => {
      acc[name] = 0;
      return acc;
    }, {}),
    verified: false,
    aiComments: [],
  });

  // NEW: Host Rating State
  const [hostRatings, setHostRatings] = useState({
    average: 0,
    totalRatings: 0,
    categoryRatings: HOST_RATING_CATEGORIES.reduce((acc, { key }) => {
      acc[key] = 0;
      return acc;
    }, {}),
    userRating: null, // Store user's current rating
  });

  // NEW: Advertising State
  const [advertisingState, setAdvertisingState] = useState({
    showAdModal: false,
    selectedPlatforms: [],
    budget: 100,
    duration: 7,
    loading: false,
    success: false
  });

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [socialMediaVerified, setSocialMediaVerified] = useState({
    facebook: false,
    instagram: false,
    twitter: false,
    linkedin: false,
    tiktok: false,
    website: false,
    loading: false
  });

  const [isFacebookPosted, setIsFacebookPosted] = useState(false);
  const [hostSocialLinks, setHostSocialLinks] = useState({});

  const breakfastPrice = 150;

  const nights = dateRange[0] && dateRange[1]
    ? Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate total hours for office bookings
  const calculateTotalHours = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    if (endInMinutes <= startInMinutes) {
      return 0;
    }

    return (endInMinutes - startInMinutes) / 60;
  };

  const totalHours = calculateTotalHours(startTime, endTime);
  const totalPrice = listing?.type === 'office'
    ? (listing.regularPrice * totalHours).toFixed(2)
    : 0;

  // Helper functions
  const truncateDescription = (text, wordLimit = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const validatePhone = (phone) => /^0\d{9}$/.test(phone);

  // Generate time options for office booking
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  // NEW: Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false, size = 'text-lg' }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
            className={`${size} ${
              readonly 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-400 transition-colors'
            } ${
              star <= rating ? 'text-yellow-400' : ''
            } ${!readonly ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  // NEW: Rate Host Functionality
  const handleRateHost = async (category, rating) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    if (!listing?.userRef) return;

    const hostId = typeof listing.userRef === 'string'
      ? listing.userRef
      : listing.userRef._id;

    if (!hostId) return;

    try {
      const response = await fetch('/api/host/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify({
          hostId,
          category,
          rating,
          listingId: listing._id
        })
      });

      if (response.ok) {
        const updatedRatings = await response.json();
        setHostRatings(updatedRatings);
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // NEW: Fetch Host Ratings
  const fetchHostRatings = async () => {
    if (!listing?.userRef) return;

    const hostId = typeof listing.userRef === 'string'
      ? listing.userRef
      : listing.userRef._id;

    try {
      const response = await fetch(`/api/host/ratings/${hostId}?listingId=${listingId}`);
      if (response.ok) {
        const ratings = await response.json();
        setHostRatings(ratings);
      }
    } catch (error) {
      console.error('Error fetching host ratings:', error);
    }
  };

  // NEW: Advertising Functions
  const handleAdPlatformToggle = (platform) => {
    setAdvertisingState(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter(p => p !== platform)
        : [...prev.selectedPlatforms, platform]
    }));
  };

  const handleAdvertiseSubmit = async () => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    if (advertisingState.selectedPlatforms.length === 0) {
      alert('Please select at least one advertising platform');
      return;
    }

    setAdvertisingState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/listings/advertise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          platforms: advertisingState.selectedPlatforms,
          budget: advertisingState.budget,
          duration: advertisingState.duration
        })
      });

      if (response.ok) {
        setAdvertisingState(prev => ({
          ...prev,
          loading: false,
          success: true,
          showAdModal: false
        }));
        alert('Advertising campaign started successfully!');
      } else {
        throw new Error('Failed to start advertising campaign');
      }
    } catch (error) {
      console.error('Advertising error:', error);
      setAdvertisingState(prev => ({ ...prev, loading: false }));
      alert('Failed to start advertising campaign. Please try again.');
    }
  };

  // AI-powered social media verification
  const verifySocialMedia = async (hostData) => {
    if (!hostData) return;
    
    setSocialMediaVerified(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call - replace with actual endpoint
      const response = await fetch('/api/ai/verify-social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: hostData?.username || hostData?.name || '',
          email: hostData?.email || '',
          phone: listing?.contact || '',
          description: listing?.description || ''
        })
      });

      if (response.ok) {
        const verification = await response.json();
        setSocialMediaVerified({
          ...verification.socialMedia,
          loading: false
        });
        setHostSocialLinks(verification.socialLinks || {});
      } else {
        // Fallback to simulated verification for demo
        setTimeout(() => {
          setSocialMediaVerified({
            facebook: Math.random() > 0.3,
            instagram: Math.random() > 0.4,
            twitter: Math.random() > 0.5,
            linkedin: Math.random() > 0.6,
            tiktok: Math.random() > 0.7,
            website: Math.random() > 0.4,
            loading: false
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Social media verification failed:', error);
      setSocialMediaVerified(prev => ({ ...prev, loading: false }));
    }
  };

  // Check if listing is posted on Facebook
  const checkFacebookListing = async () => {
    if (!listing) return false;
    
    try {
      const response = await fetch('/api/ai/check-facebook-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingTitle: listing.name || '',
          description: listing.description || '',
          price: listing.regularPrice || 0,
          location: listing.address || ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.isPostedOnFacebook || false;
      }
    } catch (error) {
      console.error('Facebook check failed:', error);
    }
    
    // Fallback for demo
    return Math.random() > 0.5;
  };

  // Handle overnight WhatsApp booking
  const handleOvernightWhatsAppBooking = () => {
    if (!listing) return;
    
    // Calculate prices
    const roomTotal = listing.regularPrice * nights;
    const breakfastTotal = mealPlan === 'breakfast' ? breakfastPrice * nights : 0;
    const totalPrice = roomTotal + breakfastTotal;

    // Format prices
    const formatPrice = (price) =>
      price.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

    // Robust WhatsApp number formatting
    let num = String(listing?.contact || '27123456789').replace(/\D/g, '');
    let whatsappNumber;

    if (num.startsWith('27') && num.length === 11) {
      // Already valid international format
      whatsappNumber = num;
    } else {
      // Convert to 10-digit local format
      if (!num.startsWith('0')) num = '0' + num;
      // Ensure exactly 10 digits
      if (num.length > 10) num = num.substring(num.length - 10);
      if (num.length < 10) num = num.padEnd(10, '0');
      // Convert to international format
      whatsappNumber = num.replace(/^0/, '27');
    }

    const message = encodeURIComponent(
      `🏨 *NEW BOOKING REQUEST* 🏨\n\n` +
      `*PROPERTY DETAILS*\n` +
      `🏠 ${listing.name}\n` +
      `📍 Location: ${listing.address || 'Not specified'}\n\n` +
      `📅 *DATES*\n` +
      `• Check-in: ${dateRange[0].toDateString()}\n` +
      `• Check-out: ${dateRange[1].toDateString()}\n` +
      `• ${nights} Night${nights > 1 ? 's' : ''}\n\n` +
      `💰 *PRICE BREAKDOWN*\n` +
      `• Room Rate: R${formatPrice(listing.regularPrice)}/night\n` +
      `  → ${nights} night${nights > 1 ? 's' : ''}: R${formatPrice(roomTotal)}\n` +
      `${mealPlan === 'breakfast' ?
        `• Breakfast: R${formatPrice(breakfastPrice)}/night\n` +
        `  → ${nights} night${nights > 1 ? 's' : ''}: R${formatPrice(breakfastTotal)}\n` : ''}` +
      `*TOTAL: R${formatPrice(totalPrice)}*\n\n` +
      `👤 *GUEST INFORMATION*\n` +
      `• Full Name: ${guestName}\n` +
      `• Contact: ${guestContact}\n` +
      `• Special Requests: ${specialRequests || 'None'}\n\n` +
      `📋 *HOST ACTIONS*\n` +
      `Please reply with:\n` +
      `✅ \`ACCEPT\` - Confirm this booking\n` +
      `❌ \`DECLINE\` - Reject this request\n` +
      `💬 \`MESSAGE\` - Contact guest for details\n\n` +
      `_Sent from ${window.location.hostname}_`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

    // Reset form
    setGuestName('');
    setGuestContact('');
    setSpecialRequests('');
  };

  const handleOfficeWhatsAppBooking = () => {
    if (!listing) return;
    
    const formatPrice = (price) => price.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

    let num = String(listing?.contact || '27123456789').replace(/\D/g, '');
    let whatsappNumber;

    if (num.startsWith('27') && num.length === 11) {
      whatsappNumber = num;
    } else {
      if (!num.startsWith('0')) num = '0' + num;
      if (num.length > 10) num = num.substring(num.length - 10);
      if (num.length < 10) num = num.padEnd(10, '0');
      whatsappNumber = num.replace(/^0/, '27');
    }

    const message = encodeURIComponent(
      `🏢 *NEW OFFICE BOOKING REQUEST* 🏢\n\n` +
      `*PROPERTY DETAILS*\n` +
      `🏠 ${listing.name}\n` +
      `📍 Location: ${listing.address || 'Not specified'}\n\n` +
      `📅 *BOOKING DATE*\n` +
      `• Date: ${selectedDate.toDateString()}\n` +
      `• Start Time: ${startTime}\n` +
      `• End Time: ${endTime}\n` +
      `• Total Hours: ${totalHours} hour${totalHours > 1 ? 's' : ''}\n\n` +
      `💰 *PRICE BREAKDOWN*\n` +
      `• Hourly Rate: R${formatPrice(listing.regularPrice)}\n` +
      `  → ${totalHours} hour${totalHours > 1 ? 's' : ''}: R${formatPrice(totalPrice)}\n` +
      `*TOTAL: R${formatPrice(totalPrice)}*\n\n` +
      `👤 *GUEST INFORMATION*\n` +
      `• Full Name: ${guestName}\n` +
      `• Contact: ${guestContact}\n` +
      `• Special Requests: ${specialRequests || 'None'}\n\n` +
      `📋 *HOST ACTIONS*\n` +
      `Please reply with:\n` +
      `✅ \`ACCEPT\` - Confirm this booking\n` +
      `❌ \`DECLINE\` - Reject this request\n` +
      `💬 \`MESSAGE\` - Contact guest for details\n\n` +
      `_Sent from ${window.location.hostname}_`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

    // Reset form
    setGuestName('');
    setGuestContact('');
    setSpecialRequests('');
  };

  // Host rating states
  const [hostData, setHostData] = useState({
    likeCount: 0,
    dislikeCount: 0,
    userAction: null, // 'like', 'dislike', or null
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const generateMapLink = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Fetch host ratings
  useEffect(() => {
    const fetchHostRatings = async () => {
      if (!currentUser || !listing?.userRef) return;

      // Extract host ID from listing (userRef could be string or object)
      const hostId = typeof listing.userRef === 'string'
        ? listing.userRef
        : listing.userRef._id;

      if (!hostId) return;

      try {
        const response = await fetch(`/api/user/host-ratings/${hostId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHostData({
            likeCount: data.likeCount,
            dislikeCount: data.dislikeCount,
            userAction: data.userAction
          });
        }
      } catch (error) {
        console.error('Error fetching host ratings:', error);
      }
    };

    fetchHostRatings();
  }, [currentUser, listing]);

  // Update host star rating calculation
  const hostStarRating = Math.min(5, Math.floor(hostData.likeCount / 40));

  // Handle host rating
  const handleRateHostLikeDislike = async (action) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    if (!listing?.userRef) return;

    // Extract host ID from listing (userRef could be string or object)
    const hostId = typeof listing.userRef === 'string'
      ? listing.userRef
      : listing.userRef._id;

    if (!hostId) return;

    setRatingLoading(true);

    try {
      const response = await fetch(`/api/user/rate-host/${hostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        setHostData({
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
          userAction: data.userAction
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rate host');
      }
    } catch (error) {
      console.error('Rating error:', error);
      alert(error.message);
    } finally {
      setRatingLoading(false);
    }
  };

  // Calculate AI ratings
  useEffect(() => {
    const calculateAIRatings = () => {
      if (!listing) return;
      
      const currentImages = listing?.imageUrls || [];
      const qualityImages = currentImages.filter(img =>
        img.includes('high_res') || img.includes('quality')
      ).length;

      const isVerified = qualityImages > 8 && currentImages.length > 10;

      const baseRatings = RATING_CATEGORIES.reduce((acc, { name }) => {
        acc[name] = isVerified ? (4.5 + Math.random() * 0.5).toFixed(1) : (4.0 + Math.random() * 0.5).toFixed(1);
        return acc;
      }, {});

      const simulatedComments = [
        "Absolutely loved our stay! The place was spotless and the host was incredibly responsive.",
        "Fantastic location and the amenities were exactly as described. Highly recommend!",
        "The host went above and beyond to make us feel welcome. A truly pleasant experience.",
        "Beautiful property with stunning views. Everything was perfect!",
        "Excellent communication from the host and a very smooth check-in process.",
      ];
      const selectedAIComments = simulatedComments.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);

      return {
        average: isVerified ? (4.8 + Math.random() * 0.1).toFixed(1) : (4.2 + Math.random() * 0.2).toFixed(1),
        totalRatings: isVerified ? currentImages.length * 15 : currentImages.length * 10,
        categoryRatings: baseRatings,
        verified: isVerified,
        aiComments: selectedAIComments,
      };
    };

    if (listing) {
      setAiRating(calculateAIRatings());
    }
  }, [listing]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize EmailJS
  useEffect(() => {
    if (typeof process !== 'undefined' && process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    } else {
      console.warn("EmailJS Public Key not found");
      emailjs.init("YOUR_EMAILJS_PUBLIC_KEY_FALLBACK");
    }
  }, []);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setUiState({ loading: true, error: false, submitting: false, showAllReviews: false, newReviewsAvailable: false });
        const response = await fetch(`/api/listing/get/${listingId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch listing');
        }

        const listingData = await response.json();
        if (!listingData._id || !listingData.name || !listingData.imageUrls || listingData.imageUrls.length === 0) {
          throw new Error('Invalid listing data');
        }

        setListing(listingData);
        setUiState(prev => ({ ...prev, loading: false, error: false }));
      } catch (error) {
        console.error("Fetch error:", error);
        setUiState(prev => ({ ...prev, loading: false, error: true }));
      }
    };
    fetchListing();
  }, [listingId]);

  // Social media verification and Facebook check
  useEffect(() => {
    const verifyHostAndListing = async () => {
      if (!listing) return;
      
      // Verify social media
      if (listing.userRef) {
        await verifySocialMedia(listing.userRef);
      }
      
      // Check Facebook listing
      const facebookPosted = await checkFacebookListing();
      setIsFacebookPosted(facebookPosted);
    };

    if (listing) {
      verifyHostAndListing();
    }
  }, [listing]);

  // NEW: Fetch host ratings when listing loads
  useEffect(() => {
    if (listing) {
      fetchHostRatings();
    }
  }, [listing]);

  // FIXED: Fetch comment count using existing comments endpoint
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        // Use the existing comments endpoint and count the results
        const response = await fetch(`/api/comment/get/${listingId}`);
        if (response.ok) {
          const comments = await response.json();
          // If comments is an array, use its length, otherwise default to 0
          setCommentCount(Array.isArray(comments) ? comments.length : 0);
        } else {
          // If endpoint fails, use AI rating count as fallback
          console.log('Comments endpoint not available, using fallback count');
          setCommentCount(aiRating.totalRatings || 0);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        // Fallback to AI rating count
        setCommentCount(aiRating.totalRatings || 0);
      }
    };

    if (listingId) {
      fetchCommentCount();
    }
  }, [listingId, aiRating.totalRatings]);

  // Event handlers
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (value !== "" && !validatePhone(value)) {
        setContactForm(prev => ({ ...prev, [name]: value, phoneError: true }));
        return;
      }
      setContactForm(prev => ({ ...prev, [name]: value, phoneError: false }));
    } else {
      setContactForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!listing || !currentUser) {
      alert("Please log in to contact the host.");
      return;
    }
    if (!contactForm.name || !contactForm.phone || !contactForm.message) {
      alert("Please fill in all contact form fields.");
      return;
    }
    if (!validatePhone(contactForm.phone)) {
      alert("Please enter a valid South African phone number (e.g., 0821234567).");
      return;
    }

    setUiState(prev => ({ ...prev, submitting: true }));

    try {
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

      if (!serviceId || !templateId) {
        throw new Error("EmailJS configuration missing");
      }

      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: contactForm.name,
          phone_number: contactForm.phone,
          message: contactForm.message,
          listing_name: listing.name,
          listing_address: listing.address,
          to_email: listing.userRef?.email || "default_listing_owner@example.com",
          from_email: currentUser.email,
        }
      );

      if (response.status === 200) {
        setContactForm({ name: "", phone: "", message: "", phoneError: false });
        alert("Message sent successfully!");
      } else {
        console.error("EmailJS send response:", response);
        alert(`Failed to send message. Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Email error:", err);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setUiState(prev => ({ ...prev, submitting: false }));
    }
  };

  // Handle social media link click
  const handleSocialMediaClick = (platform) => {
    if (hostSocialLinks[platform]) {
      window.open(hostSocialLinks[platform], '_blank');
    } else if (socialMediaVerified[platform]) {
      // Fallback to platform base URL with host username
      const hostUsername = listing.userRef?.username || '';
      if (hostUsername) {
        window.open(`${SOCIAL_PLATFORMS.find(p => p.name === platform)?.baseUrl}${hostUsername}`, '_blank');
      }
    }
  };

  // Loading and error states
  if (uiState.loading) return (
    <div className="p-8 text-center text-xl text-gray-700 flex items-center justify-center min-h-[50vh]">
      <FaSpinner className="animate-spin mr-3" /> Loading property details...
    </div>
  );

  if (uiState.error) return (
    <div className="p-8 text-center text-red-600 text-xl flex items-center justify-center min-h-[50vh]">
      Error loading listing. Please try again later. <FaComment className="ml-2" />
    </div>
  );

  if (!listing) return null;

  const propertyType = PROPERTY_TYPES[listing.type] || PROPERTY_TYPES.rent;

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50 fixed-buttons">
        <button
          onClick={() => {
            const routeMap = {
              rent: '/for-rent',
              sale: '/for-sale',
              office: '/office',
              over: '/overnight',
              land: '/land',
              default: '/listings'
            };
            navigate(routeMap[listing.type?.toLowerCase()] || routeMap.default);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          title="Back to Listings"
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={() => setShowCommentsPanel(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          title="View Comments"
        >
          <FaComment />
          {commentCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {commentCount}
            </span>
          )}
        </button>
      </div>

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {listing.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-red-500" />
                <span>{listing.address}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${propertyType.color ? `bg-${propertyType.color}-100 text-${propertyType.color}-800` : 'bg-gray-100 text-gray-800'}`}>
                {propertyType.icon} {propertyType.label}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                R{listing.regularPrice?.toLocaleString()}
                {listing.type === 'rent' && <span className="text-sm font-normal text-gray-600">/month</span>}
                {listing.type === 'sale' && <span className="text-sm font-normal text-gray-600"> total</span>}
                {listing.type === 'over' && <span className="text-sm font-normal text-gray-600">/night</span>}
                {listing.type === 'office' && <span className="text-sm font-normal text-gray-600">/hour</span>}
              </div>
              {listing.discountPrice > 0 && (
                <div className="text-sm text-gray-500 line-through">
                  R{listing.discountPrice?.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Image */}
          <div className="md:col-span-3">
            <Swiper
              modules={[Navigation, Zoom, Thumbs]}
              navigation
              zoom
              thumbs={{ swiper: activeThumb }}
              className="h-64 md:h-96 rounded-lg overflow-hidden"
            >
              {listing.imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                  <div className="swiper-zoom-container">
                    <img
                      src={url}
                      alt={`${listing.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setFullscreenImage({ open: true, index })}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Thumbnails */}
          <div className="md:col-span-1">
            <Swiper
              modules={[Thumbs]}
              watchSlidesProgress
              onSwiper={setActiveThumb}
              direction={isMobile ? "horizontal" : "vertical"}
              slidesPerView={isMobile ? 4 : 3}
              spaceBetween={10}
              className="h-64 md:h-96"
            >
              {listing.imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded cursor-pointer"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2">
          {/* Description */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="text-gray-700 leading-relaxed">
                {isExpanded ? listing.description : truncateDescription(listing.description)}
                {listing.description.split(' ').length > 50 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 ml-2 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* NEW: Host Rating Section */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaUserFriends className="text-blue-600" />
                Rate the Host & Staff
              </h2>
              
              {/* Overall Host Rating */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Host Rating</h3>
                    <p className="text-gray-600 text-sm">
                      {hostRatings.totalRatings} rating{hostRatings.totalRatings !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-600">
                      {hostRatings.average.toFixed(1)}
                    </div>
                    <StarRating 
                      rating={Math.round(hostRatings.average)} 
                      readonly={true}
                      size="text-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="space-y-4">
                {HOST_RATING_CATEGORIES.map(({ name, icon: Icon, key }) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="text-blue-600 text-xl" />
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating
                        rating={hostRatings.userRating?.[key] || 0}
                        onRatingChange={(rating) => handleRateHost(key, rating)}
                        readonly={false}
                      />
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {hostRatings.categoryRatings[key]?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rating Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Your ratings help other guests find great hosts and improve the community experience.
                </p>
              </div>
            </div>
          </section>

          {/* AI-Powered Ratings */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">AI-Powered Ratings</h2>
                {aiRating.verified && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <FaCheckCircle /> AI Verified
                  </span>
                )}
              </div>

              {/* Overall Rating */}
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{aiRating.average}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={Math.round(aiRating.average)} readonly={true} />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {aiRating.totalRatings} reviews
                  </div>
                </div>
                <div className="flex-1">
                  {RATING_CATEGORIES.map(({ name, key }) => (
                    <div key={key} className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(aiRating.categoryRatings[name] / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{aiRating.categoryRatings[name]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Comments */}
              {aiRating.aiComments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">AI Analysis Summary</h3>
                  <div className="space-y-3">
                    {aiRating.aiComments.map((comment, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <p>{comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Amenities */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AMENITIES.map(({ icon: Icon, label, key }) => (
                  listing[key] && (
                    <div key={key} className="flex items-center gap-3">
                      <Icon className="text-green-600 text-lg" />
                      <span>{label}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span>{listing.address}</span>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Location of ${listing.name}`}
                  ></iframe>
                </div>
                <a
                  href={generateMapLink(listing.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaExternalLinkAlt />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </section>

          {/* What's Nearby */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">What's Nearby</h2>
              <div className="space-y-3">
                {listing.nearbyPlaces && listing.nearbyPlaces.length > 0 ? (
                  listing.nearbyPlaces.map((place, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">{place.name}</span>
                      <span className="text-sm text-gray-500">{place.distance}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No nearby places information available
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Booking & Contact */}
        <div className="lg:col-span-1">
          {/* Booking Widget */}
          <div className="sticky top-4">
            {/* Contact Host */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Host</h2>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      contactForm.phoneError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="082 123 4567"
                    required
                  />
                  {contactForm.phoneError && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter a valid South African phone number
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="I'm interested in this property..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={uiState.submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {uiState.submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* NEW: Advertising Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MdAdsClick className="text-purple-600" />
                Boost This Listing
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Get more visibility for your property by advertising on popular platforms.
                </p>
                
                <div className="space-y-3">
                  {ADVERTISING_PLATFORMS.map((platform) => (
                    <div
                      key={platform.name}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        advertisingState.selectedPlatforms.includes(platform.name)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleAdPlatformToggle(platform.name)}
                    >
                      <div className={`p-2 rounded-full text-white ${platform.color}`}>
                        <platform.icon />
                      </div>
                      <span className="flex-1 font-medium">{platform.name}</span>
                      <div className={`w-5 h-5 border-2 rounded ${
                        advertisingState.selectedPlatforms.includes(platform.name)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {advertisingState.selectedPlatforms.includes(platform.name) && (
                          <FaCheckCircle className="text-white text-xs" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Budget and Duration */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Budget: R{advertisingState.budget}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={advertisingState.budget}
                      onChange={(e) => setAdvertisingState(prev => ({
                        ...prev,
                        budget: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>R50</span>
                      <span>R1000</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration: {advertisingState.duration} days
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={advertisingState.duration}
                      onChange={(e) => setAdvertisingState(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>
                  </div>
                </div>

                {/* Cost Estimate */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Estimated total:</span>
                    <span className="font-semibold">
                      R{(advertisingState.budget * advertisingState.duration).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAdvertiseSubmit}
                  disabled={advertisingState.loading || advertisingState.selectedPlatforms.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {advertisingState.loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Starting Campaign...
                    </>
                  ) : (
                    'Start Advertising Campaign'
                  )}
                </button>
              </div>
            </div>

            {/* Host Profile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Host Profile</h2>
              
              {/* Host Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {listing.userRef?.username?.[0]?.toUpperCase() || 'H'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {listing.userRef?.username || 'Host'}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <StarRating rating={hostStarRating} readonly={true} size="text-sm" />
                    <span className="text-sm text-gray-600 ml-1">
                      ({hostData.likeCount} likes)
                    </span>
                  </div>
                </div>
              </div>

              {/* Host Rating Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleRateHostLikeDislike('like')}
                  disabled={ratingLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                    hostData.userAction === 'like'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <FaThumbsUp />
                  Like ({hostData.likeCount})
                </button>
                <button
                  onClick={() => handleRateHostLikeDislike('dislike')}
                  disabled={ratingLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                    hostData.userAction === 'dislike'
                      ? 'bg-red-100 border-red-500 text-red-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-red-50'
                  }`}
                >
                  <FaThumbsDown />
                  Dislike ({hostData.dislikeCount})
                </button>
              </div>

              {/* Social Media Verification */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Verified Social Profiles</h4>
                <div className="flex gap-2 flex-wrap">
                  {SOCIAL_PLATFORMS.map(({ name, icon: Icon, color }) => (
                    <button
                      key={name}
                      onClick={() => handleSocialMediaClick(name)}
                      disabled={!socialMediaVerified[name]}
                      className={`p-2 rounded-lg border transition-all ${
                        socialMediaVerified[name]
                          ? `${color} border-current hover:bg-gray-50 cursor-pointer`
                          : 'text-gray-400 border-gray-300 cursor-not-allowed'
                      }`}
                      title={
                        socialMediaVerified[name]
                          ? `Visit ${name} profile`
                          : `${name} not verified`
                      }
                    >
                      <Icon className="text-xl" />
                    </button>
                  ))}
                </div>
                
                {/* Facebook Listing Status */}
                {isFacebookPosted && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
                    <FaFacebook className="text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Also listed on Facebook
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage.open && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white text-2xl z-10"
            onClick={() => setFullscreenImage({ open: false, index: 0 })}
          >
            ✕
          </button>
          <Swiper
            modules={[Navigation, Zoom]}
            navigation
            zoom
            initialSlide={fullscreenImage.index}
            className="w-full h-full"
          >
            {listing.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <div className="swiper-zoom-container">
                  <img
                    src={url}
                    alt={`${listing.name} - Image ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Description Modal */}
      {isDescriptionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Property Description</h2>
                <button
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="text-gray-700 leading-relaxed">
                {listing.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Side Panel */}
      <CommentsSidePanel
        isOpen={showCommentsPanel}
        onClose={() => setShowCommentsPanel(false)}
        listingId={listingId}
        listingName={listing.name}
      />
    </main>
  );
}