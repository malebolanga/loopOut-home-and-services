/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom, Thumbs } from "swiper/modules";
import { useSelector } from "react-redux";
import emailjs from "emailjs-com";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
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
  FaBroom,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaGlobe,

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
  { name: "Cleanliness", icon: MdCleanHands },
  { name: "Accuracy", icon: MdOutlineGppGood },
  { name: "Check-in", icon: MdLogin },
  { name: "Communication", icon: MdChat },
  { name: "Location", icon: MdLocationOn },
  { name: "Value", icon: MdAttachMoney },
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

  // Map and media state
  const [mapLocation] = useState({ lat: -26.2041, lng: 28.0473 }); // Johannesburg coordinates

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
  const handleRateHost = async (action) => {
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

  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await fetch(`/api/comment/count/${listingId}`);
        if (response.ok) {
          const data = await response.json();
          setCommentCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };

    if (listingId) {
      fetchCommentCount();
    }
  }, [listingId]);

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
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back to listings"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <a
          href={`tel:${listing?.contact || '+27123456789'}`}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title={`Call ${listing?.contact || 'the host'}`}
        >
          <FaPhone className="text-xl" />
        </a>
        <a
          href={`https://wa.me/${String(listing?.contact || '27123456789').replace(/^0/, '27')}?text=${encodeURIComponent(`Hello, I'm interested in your property ${listing.name}`)}`}
          target="_blank"
          rel="noreferrer"
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Contact via WhatsApp"
        >
          <FaWhatsapp className="text-xl" />
        </a>
      </div>

      {/* Image Gallery Section */}
      <section className="relative mb-8 mt-10">
        <div
          className={`flex ${isMobile ? 'flex-col h-auto' :
            isTablet ? 'flex-row h-[500px]' :
              'flex-row h-[700px]'
            } gap-4`}
        >
          <Swiper
            className={`main-swiper ${isMobile ? 'w-full h-64' : 'w-3/4 h-full'
              } rounded-xl shadow-lg`}
            modules={[Navigation, Thumbs, Zoom]}
            navigation
            thumbs={{ swiper: activeThumb }}
            zoom
          >
            {listing.imageUrls.map((img, index) => (
              <SwiperSlide key={`main-${img}-${index}`}>
                <div
                  className="relative h-full bg-cover bg-center cursor-zoom-in"
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => setFullscreenImage({ open: true, index })}
                  role="button"
                  aria-label={`View image ${index + 1} in fullscreen`}
                >
                  <div className="swiper-zoom-container" />
                </div>
              </SwiperSlide>
            ))}
            <button
              onClick={() => setFullscreenImage({ open: true, index: 0 })}
              className="absolute bottom-4 left-4 bg-white text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-colors flex items-center z-10"
              title="View all photos"
            >
              <FaImages className="mr-2" /> Show all photos
            </button>
          </Swiper>

          <Swiper
            className={`thumbs-swiper ${isMobile ? 'w-full h-24' : 'w-1/4 h-full'
              }`}
            modules={[Navigation, Thumbs]}
            spaceBetween={10}
            slidesPerView={isMobile ? 4 : isTablet ? 4 : 5}
            direction={isMobile ? 'horizontal' : 'vertical'}
            onSwiper={setActiveThumb}
          >
            {listing.imageUrls.map((img, index) => (
              <SwiperSlide key={`thumb-${img}-${index}`}>
                <div
                  className={`${isMobile ? 'w-24 h-full' : 'h-32'
                    } bg-cover bg-center rounded-lg cursor-pointer`}
                  style={{ backgroundImage: `url(${img})` }}
                  role="button"
                  aria-label={`Select image ${index + 1}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {fullscreenImage.open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage({ open: false, index: 0 })}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl z-50"
              onClick={(e) => { e.stopPropagation(); setFullscreenImage({ open: false, index: 0 }); }}
              aria-label="Close image viewer"
            >
              &times;
            </button>
            <Swiper
              className="w-full h-full"
              initialSlide={fullscreenImage.index}
              modules={[Navigation, Zoom]}
              navigation
              zoom={{ maxRatio: 3 }}
              grabCursor={true}
              onClick={(swiper) => swiper.zoom.toggle()}
            >
              {listing.imageUrls.map((img, index) => (
                <SwiperSlide key={`full-${img}-${index}`}>
                  <div className="swiper-zoom-container">
                    <img
                      src={img}
                      alt={`Listing view ${index + 1}`}
                      className="object-contain h-full w-full"
                      onLoad={(e) => e.target.style.cursor = 'zoom-in'}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2">

          <header className="mb-6">
            {/* Title and Verification Badge */}
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-dark flex-1 min-w-0 truncate">
                {listing.name}
              </h1>
              {aiRating.verified && (
                <span className="flex items-center bg-airbnb-light-red text-airbnb-red px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap shadow-sm">
                  <span className="mr-1.5">🏆</span> Verified
                </span>
              )}
            </div>

            {/* Property Type Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${propertyType.color}-100 text-${propertyType.color}-800`}>
                <span className="mr-1.5">{propertyType.icon}</span>
                {propertyType.label}
              </span>
              
              {/* Facebook Posted Badge */}
              {isFacebookPosted && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <FaFacebook className="mr-1.5" />
                  Also on Facebook
                </span>
              )}
            </div>

            {/* Property Details - Single Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-airbnb-gray text-sm md:text-base px-1">
              {/* Bedrooms/Size */}
              {listing.bedrooms && (
                <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-lg">
                  <span className="mr-2 text-airbnb-dark">
                    {listing.propertyType !== '' && listing.propertyType !== 'land' ? '🛏️' : '📐'}
                  </span>
                  <span className="font-medium">
                    {listing.propertyType === '' || listing.propertyType === 'land'
                      ? `${listing.bedrooms}m²`
                      : `${listing.bedrooms} ${listing.bedrooms === 1 ? 'bed' : 'beds'}`}
                  </span>
                </div>
              )}

              {/* Bathrooms */}
              {listing.bathrooms && listing.propertyType !== 'land' && (
                <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-lg">
                  <span className="mr-2 text-airbnb-dark">🚿</span>
                  <span className="font-medium">{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-lg">
                <FaStar className="text-airbnb-red mr-1.5" />
                <span className="font-medium">{aiRating.average} ({aiRating.totalRatings.toLocaleString()})</span>
              </div>

              {/* Location */}
              <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-lg">
                <FaMapMarkerAlt className="text-airbnb-red mr-1.5" />
                <span className="font-medium">{listing.address}</span>
              </div>
            </div>
          </header>

          {/* Enhanced Host Information Section */}
          <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={listing.userRef?.avatar || '/default-avatar.png'}
                    alt={listing.userRef?.username || 'Host'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-airbnb-red"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                  />
                  {aiRating.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <FaCheckCircle className="text-airbnb-red text-lg" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Hosted by {listing.userRef?.username || 'Unknown Host'}
                    {aiRating.verified && (
                      <FaCheckCircle className="text-airbnb-red text-sm" title="Verified Host" />
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Joined {listing.userRef?.createdAt ? new Date(listing.userRef.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                  </p>
                  {listing.contact && (
                    <div className="flex items-center gap-1 text-gray-700 text-sm mt-1">
                      <FaPhone className="text-blue-500" />
                      <span>0{listing.contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Host Rating Section */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-lg ${i < hostStarRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({hostData.likeCount + hostData.dislikeCount} ratings)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRateHost('like')}
                    disabled={ratingLoading}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${hostData.userAction === 'like' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}
                  >
                    <FaThumbsUp className={hostData.userAction === 'like' ? 'text-green-600' : 'text-gray-500'} />
                    <span>{hostData.likeCount}</span>
                  </button>
                  
                  <button
                    onClick={() => handleRateHost('dislike')}
                    disabled={ratingLoading}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${hostData.userAction === 'dislike' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-red-50'}`}
                  >
                    <FaThumbsDown className={hostData.userAction === 'dislike' ? 'text-red-600' : 'text-gray-500'} />
                    <span>{hostData.dislikeCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Social Media Verification */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FaUserFriends className="text-airbnb-red" />
                Host Social Media Verification
              </h4>
              
              {socialMediaVerified.loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <FaSpinner className="animate-spin" />
                  Verifying social media profiles...
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const isVerified = socialMediaVerified[platform.name];
                    const Icon = platform.icon;
                    
                    return (
                      <button
                        key={platform.name}
                        onClick={() => handleSocialMediaClick(platform.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isVerified 
                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer' 
                            : 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
                        }`}
                        disabled={!isVerified}
                      >
                        <Icon className={platform.color} />
                        <span className="text-sm font-medium capitalize">
                          {platform.name}
                        </span>
                        {isVerified ? (
                          <FaCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <span className="text-xs text-gray-400">Not found</span>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Website Verification */}
                  <button
                    onClick={() => handleSocialMediaClick('website')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      socialMediaVerified.website 
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer' 
                        : 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
                    }`}
                    disabled={!socialMediaVerified.website}
                  >
                    <FaGlobe className="text-blue-500" />
                    <span className="text-sm font-medium">Website</span>
                    {socialMediaVerified.website ? (
                      <FaCheckCircle className="text-green-500 text-sm" />
                    ) : (
                      <span className="text-xs text-gray-400">Not found</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="mb-6 section-card">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {AMENITIES.map(({ icon: Icon, label, key }) => (
                listing[key] && (
                  <div key={key} className="flex items-center gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Icon className="text-gray-600 text-lg md:text-xl" />
                    <span className="text-sm md:text-base text-gray-700">{label}</span>
                  </div>
                )
              ))}
            </div>
          </section>

          <section className="mb-8 section-card">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">About this space</h2>

            <div className="relative">
              <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                {truncateDescription(listing.description)}
              </p>

              {listing.description && listing.description.split(' ').length > 50 && (
                <button
                  onClick={() => setIsDescriptionModalOpen(true)}
                  className="mt-2 flex items-center text-gray-600 hover:text-gray-800 transition-colors  font-semibold"
                  aria-expanded={isDescriptionModalOpen}
                  aria-controls="full-description-modal"
                >
                  <span className="text-sm">Read more</span>
                  <FaChevronDown className="ml-1 text-xs mt-px transition-transform duration-200 group-hover:translate-y-0.5" />
                </button>
              )}
            </div>
          </section>

          {isDescriptionModalOpen && (
            <div id="full-description-modal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto section-card" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">About this space</h2>
                    <button
                      onClick={() => setIsDescriptionModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                      aria-label="Close description modal"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <section className="mb-8 section-card">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">At a glance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-xl p-4 hover:shadow-md transition-shadow h-24 flex items-center">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                    {listing.propertyType !== 'office' && listing.propertyType !== 'land' ? (
                      <FaBed className="h-5 w-5 text-blue-600" />
                    ) : (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {listing.bedrooms ?? 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {listing.propertyType === 'office' || listing.propertyType === 'land' ? 'Total m²' :
                        listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </p>
                  </div>
                </div>
              </div>

              {listing.propertyType !== 'land' && (
                <div className="border rounded-xl p-4 hover:shadow-md transition-shadow h-24 flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                      <FaShower className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {listing.bathrooms ?? 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {listing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border rounded-xl p-4 hover:shadow-md transition-shadow h-24 flex items-center">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-yellow-50 rounded-lg flex-shrink-0">
                    <FaStar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
                    <span className="mx-1">·</span>
                    <span className="text-gray-600">{commentCount} reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 section-card">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Property Type</h3>
                  <p className="text-gray-900 font-medium">{listing.kind || 'Residential Home'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Period</h3>
                  <p className="text-gray-900 font-medium">{listing.period || 'Residential Home'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Cancellation Policy</h3>
                  <p className="text-gray-900 font-medium">{listing.cancel || 'Residential Home'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nearby Amenities</h3>
                  <p className="text-gray-900 font-medium">
                    {listing.near
                      ? isNearExpanded
                        ? listing.near
                        : listing.near.split(' ').slice(0, 15).join(' ') +
                        (listing.near.split(' ').length > 15 ? '...' : '')
                      : 'Residential Home'
                    }
                    {listing.near && listing.near.split(' ').length > 15 && (
                      <button
                        onClick={() => setIsNearExpanded(!isNearExpanded)}
                        className="text-gray-600 ml-1 hover:underline text-sm"
                      >
                        {isNearExpanded ? 'Read less' : 'Read More'}
                      </button>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rules & Policies</h3>
                  <p className="text-gray-900 font-medium">
                    {listing.rules
                      ? isExpanded
                        ? listing.rules
                        : listing.rules.split(' ').slice(0, 15).join(' ') +
                        (listing.rules.split(' ').length > 15 ? '...' : '')
                      : 'Residential Home'
                    }
                    {listing.rules && listing.rules.split(' ').length > 20 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-600 ml-1 hover:underline text-sm"
                      >
                        {isExpanded ? 'Read less' : 'Read More'}
                      </button>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-4 flex-shrink-0">
                  <FaMapMarkerAlt className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                  <p className="text-gray-900 font-medium">{listing.address}</p>
                  {listing.address && (
                    <a
                      href={generateMapLink(listing.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center text-blue-600 hover:underline text-sm"
                    >
                      View on map <FaExternalLinkAlt className="ml-1 text-xs" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Office Booking Section */}
          {listing.type === 'office' && (
            <section className="mb-8 section-card">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Availability & Booking</h2>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Section - 40% width */}
                <div className="w-full lg:w-2/5">
                  <div className="sticky top-4">
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      minDate={new Date()}
                      className="rounded-xl shadow-lg w-full"
                    />

                    {selectedDate && (
                      <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-3">Select Hours</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <select
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {generateTimeOptions().map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <select
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {generateTimeOptions().map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Summary Section - 60% width */}
                <div className="w-full lg:w-3/5">
                  <div className="">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Booking Summary</h3>

                    {selectedDate && startTime && endTime ? (
                      <div className="space-y-4">
                        {/* Selected Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Booking Date</h4>
                            <p className="font-medium text-lg">{selectedDate.toDateString()}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Start Time</h4>
                            <p className="font-medium text-lg">{startTime}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">End Time</h4>
                            <p className="font-medium text-lg">{endTime}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Total Hours</h4>
                            <p className="font-medium text-lg">{totalHours} hour{totalHours > 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Price Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hourly Rate ({totalHours} hours)</span>
                              <span className="font-medium">R{(listing.regularPrice * totalHours).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="pt-3 mt-2 border-t border-gray-200 font-semibold flex justify-between text-lg">
                              <span>Total Amount</span>
                              <span className="text-blue-600 font-bold">
                                R{totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Guest Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Your Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="guestName"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="As it appears on ID"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="guestContact" className="block text-sm font-medium text-gray-700 mb-1">
                                WhatsApp Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                id="guestContact"
                                value={guestContact}
                                onChange={(e) => setGuestContact(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+27 82 123 4567"
                                required
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                                Special Requests
                              </label>
                              <textarea
                                id="specialRequests"
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Equipment needs, meeting setup, etc."
                              />
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp Booking Button */}
                        <div className="pt-2">
                          <div className="mb-3 text-center text-sm text-gray-600">
                            <p>You ll complete your booking via WhatsApp</p>
                          </div>
                          <button
                            className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-sm"
                            onClick={handleOfficeWhatsAppBooking}
                            disabled={!guestName || !guestContact}
                          >
                            <FaWhatsapp className="text-base" />
                            Book Office
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mt-3 text-lg">
                          Please select a date and time to see pricing and book
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Overnight Stay Booking Section */}
          {listing.type === 'over' && (
            <section className="mb-8 section-card">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Availability & Booking</h2>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Section - 40% width on large screens */}
                <div className="w-full lg:w-2/5">
                  <div className="sticky top-4">
                    <Calendar
                      onChange={setDateRange}
                      value={dateRange}
                      selectRange={true}
                      minDate={new Date()}
                      className="rounded-xl shadow-lg w-full"
                    />
                  </div>
                </div>

                {/* Booking Summary Section - 60% width on large screens */}
                <div className="w-full lg:w-3/5">
                  <div className="">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Booking Summary</h3>

                    {dateRange[0] && dateRange[1] ? (
                      <div className="space-y-4">
                        {/* Selected Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Check-in</h4>
                            <p className="font-medium text-lg">{dateRange[0].toDateString()}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Check-out</h4>
                            <p className="font-medium text-lg">{dateRange[1].toDateString()}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                            <h4 className="font-medium text-gray-700 mb-2">Total Nights</h4>
                            <p className="font-medium text-lg">{nights} night{nights > 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        {/* Meal Options */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Meal Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${mealPlan === 'breakfast' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                              onClick={() => setMealPlan('breakfast')}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${mealPlan === 'breakfast' ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                  {mealPlan === 'breakfast' && (
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Breakfast Included</p>
                                  <p className="text-sm text-gray-600 mt-1">+ R{breakfastPrice.toLocaleString('en-ZA')}/night</p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${mealPlan === 'none' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                              onClick={() => setMealPlan('none')}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${mealPlan === 'none' ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                                  {mealPlan === 'none' && (
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Room Only</p>
                                  <p className="text-sm text-gray-600 mt-1">No meals included</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Price Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Room Rate ({nights} nights)</span>
                              <span className="font-medium">R{(listing.regularPrice * nights).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                            </div>

                            {mealPlan === 'breakfast' && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Breakfast ({nights} nights)</span>
                                <span className="font-medium">R{(breakfastPrice * nights).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}

                            <div className="pt-3 mt-2 border-t border-gray-200 font-semibold flex justify-between text-lg">
                              <span>Total Amount</span>
                              <span className="text-blue-600 font-bold">
                                R{(listing.regularPrice * nights + (mealPlan === 'breakfast' ? breakfastPrice * nights : 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Guest Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Your Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="guestName"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="As it appears on ID"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="guestContact" className="block text-sm font-medium text-gray-700 mb-1">
                                WhatsApp Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                id="guestContact"
                                value={guestContact}
                                onChange={(e) => setGuestContact(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+27 82 123 4567"
                                required
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                                Special Requests
                              </label>
                              <textarea
                                id="specialRequests"
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Dietary restrictions, accessibility needs, etc."
                              />
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp Booking Button */}
                        <div className="pt-2">
                          <div className="mb-3 text-center text-sm text-gray-600">
                            <p>You ll complete your booking via WhatsApp</p>
                          </div>
                          <button
                            className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-sm"
                            onClick={handleOvernightWhatsAppBooking}
                            disabled={!guestName || !guestContact}
                          >
                            <FaWhatsapp className="text-base" />
                            Submit Booking Request
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mt-3 text-lg">
                          Please select check-in and check-out dates to see pricing and book
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Contact Host Section */}
          <section className="mb-8 section-card">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Contact Host</h2>
            {currentUser ? (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Enter your name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Your Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    placeholder="e.g., 0821234567"
                    className={`mt-1 block w-full border ${contactForm.phoneError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {contactForm.phoneError && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit South African phone number (e.g., 0821234567).</p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows="5"
                    placeholder={`Hello, I'm interested in your property located at ${listing.address} and would like to schedule a viewing...`}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={uiState.submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uiState.submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" /> Send Message
                    </>
                  )}
                </button>
              </form>
            ) : (
              <p className="text-gray-600 text-center py-4">
                Please <span className="font-semibold text-blue-600 cursor-pointer" onClick={() => navigate('/sign-in')}>sign in</span> to contact the host.
              </p>
            )}
          </section>
        </div>

        {/* Right Column - Map and Reviews */}
        <div className="lg:col-span-1">
          <section className="mb-8 section-card">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Location on Map</h2>
            <div className="h-64 bg-gray-200 rounded-xl overflow-hidden shadow-lg">
              <LoadScript >
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapLocation}
                  zoom={14}
                >
                  <Marker position={mapLocation} />
                </GoogleMap>
              </LoadScript>
            </div>
          </section>

          {showCommentsPanel && (
            <CommentsSidePanel
              listingId={listingId}
              onClose={() => setShowCommentsPanel(false)}
            />
          )}

          <div>
            {/* Guest Reviews Section */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Guest Reviews</h2>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
                  <span className="mx-1">·</span>
                  <span className="text-gray-600">{commentCount} reviews</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Airbnb-style stats summary */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-lg mb-3">Review Highlights</h3>
                  <div className="space-y-3">
                    {Object.entries(aiRating.categoryRatings).map(([category, rating]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700">
                          {category === 'cleanliness' ? (
                            <FaBroom className="mr-2 text-blue-500" />
                          ) : (
                            <FaUserFriends className="mr-2 text-blue-500" />
                          )}
                          <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Recent Reviews</h3>
                    {commentCount > 2 && (
                      <button
                        onClick={() => setShowCommentsPanel(true)}
                        className="text-blue-600 hover:underline flex items-center text-sm"
                      >
                        View all <FaChevronDown className="ml-1 text-xs" />
                      </button>
                    )}
                  </div>

                  <Comments
                    listingId={listingId}
                    maxComments={2}
                    onTotalComments={setCommentCount}
                    cardStyle={true}
                  />
                </div>
              </div>
            </section>

            {showCommentsPanel && (
              <CommentsSidePanel
                listingId={listingId}
                onClose={() => setShowCommentsPanel(false)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}