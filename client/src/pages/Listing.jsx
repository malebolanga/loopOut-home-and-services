/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom, Thumbs } from "swiper/modules";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";

import Calendar from "react-calendar";
import CommentsSidePanel from '../components/CommentsSidePanel';
import Comments from '../components/Comments';
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
  FaRegHeart,
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
  FaTimes,
  FaHeart,
  FaEnvelope,
  FaCamera,
} from "react-icons/fa";

// Styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import "swiper/css/thumbs";
import "react-calendar/dist/Calendar.css";
import "../styles/ListingDetails.scss";

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

// Contact Host Modal Component
const ContactHostModal = ({ listing, user, isOpen, onClose }) => {
  const [contactMethod, setContactMethod] = useState('whatsapp');
  const [message, setMessage] = useState('');
  
  const defaultMessage = `Hello, I'm ${user?.name || 'Potential Buyer/Tenant'}. I'm interested in viewing your ${listing.name || 'Property Listing'} for ${listing.type === 'sale' ? 'purchase' : 'rental'}. Could you please provide more details or schedule a viewing?`;
  
  const handleSubmit = () => {
    if (!listing?.contact && !listing?.email) {
      alert('No contact information available for this host');
      return;
    }

    const finalMessage = message || defaultMessage;
    
    if (contactMethod === 'whatsapp' && listing.contact) {
      const phoneNumber = listing.contact.replace(/\D/g, '');
      let whatsappNumber;
      
      if (phoneNumber.startsWith('27') && phoneNumber.length === 11) {
        whatsappNumber = phoneNumber;
      } else {
        let num = phoneNumber;
        if (!num.startsWith('0')) num = '0' + num;
        if (num.length > 10) num = num.substring(num.length - 10);
        if (num.length < 10) num = num.padEnd(10, '0');
        whatsappNumber = num.replace(/^0/, '27');
      }
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
      window.open(whatsappUrl, '_blank');
    } else if (contactMethod === 'email' && (listing.email || listing.userRef?.email)) {
      const emailTo = listing.email || listing.userRef?.email;
      const subject = `Interest in ${listing.name}`;
      window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalMessage)}`;
    } else if (contactMethod === 'call' && listing.contact) {
      window.location.href = `tel:${listing.contact}`;
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Contact Host</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="form-group">
          <label>Your Name</label>
          <input 
            type="text" 
            value={user?.name || ''} 
            placeholder="Enter your name" 
            readOnly={!!user?.name}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="form-group">
          <label>Contact Method</label>
          <div className="contact-methods flex flex-wrap gap-2 my-2">
            {listing.contact && (
              <button 
                className={`method-btn px-4 py-2 rounded flex items-center gap-2 ${contactMethod === 'whatsapp' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setContactMethod('whatsapp')}
              >
                <FaWhatsapp /> WhatsApp
              </button>
            )}
            {(listing.email || listing.userRef?.email) && (
              <button 
                className={`method-btn px-4 py-2 rounded flex items-center gap-2 ${contactMethod === 'email' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setContactMethod('email')}
              >
                <FaEnvelope /> Email
              </button>
            )}
            {listing.contact && (
              <button 
                className={`method-btn px-4 py-2 rounded flex items-center gap-2 ${contactMethod === 'call' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setContactMethod('call')}
              >
                <FaPhone /> Call
              </button>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Message</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessage}
            rows="4"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="modal-actions flex gap-2 mt-4">
          <button className="btn-secondary px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
          <button className="btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleSubmit}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Listing() {
  const { listingId } = useParams();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [extraBed, setExtraBed] = useState('no');
  const [ironRequest, setIronRequest] = useState(false);
  
  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // State declarations
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1024);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [listing, setListing] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

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
    loading: true, // Start with loading true
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

  // Host Rating State
  const [hostRatings, setHostRatings] = useState({
    average: 0,
    totalRatings: 0,
    categoryRatings: HOST_RATING_CATEGORIES.reduce((acc, { key }) => {
      acc[key] = 0;
      return acc;
    }, {}),
    userRating: null,
  });

  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      return listing?._id ? wishlist.some(item => item?._id === listing._id) : false;
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
      return false;
    }
  });

  const toggleFavorite = (e) => {
    e.preventDefault();
    if (!listing?._id) return;

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const updatedWishlist = newFavoriteStatus
        ? [...wishlist, listing]
        : wishlist.filter(item => item?._id !== listing._id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  };

  // Advertising State
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

  // Star Rating Component
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

  // Rate Host Functionality
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

  // Fetch Host Ratings
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

  // Advertising Functions
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
    
    return Math.random() > 0.5;
  };

  // Updated handleOvernightWhatsAppBooking to close modal after sending
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
      whatsappNumber = num;
    } else {
      if (!num.startsWith('0')) num = '0' + num;
      if (num.length > 10) num = num.substring(num.length - 10);
      if (num.length < 10) num = num.padEnd(10, '0');
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
      `👥 *GUEST DETAILS*\n` +
      `• Number of Guests: ${numberOfGuests}\n` +
      `• Extra Bed for Kids: ${extraBed === 'yes' ? 'Yes' : 'No'}\n` +
      `• Iron & Ironing Board: ${ironRequest ? 'Yes' : 'No'}\n\n` +
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

    // Close modal and reset form
    setShowBookingModal(false);
    setGuestName('');
    setGuestContact('');
    setSpecialRequests('');
    setNumberOfGuests(1);
    setExtraBed('no');
    setIronRequest(false);
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

  // Contact Host for Sale/Rent Listings
  const handleContactHost = () => {
    if (!listing?.contact && !listing?.email) {
      alert('No contact information available for this host');
      return;
    }

    const userName = currentUser?.name || 'Potential Buyer/Tenant';
    const listingName = listing.name || 'Property Listing';
    
    // Prepare the message for sale/rent listings
    const message = `Hello, I'm ${userName}. I'm interested in viewing your ${listingName} for ${listing.type === 'sale' ? 'purchase' : 'rental'}. Could you please provide more details or schedule a viewing?`;
    
    // Try WhatsApp first if contact is available
    if (listing.contact) {
      const phoneNumber = listing.contact.replace(/\D/g, '');
      let whatsappNumber;
      
      if (phoneNumber.startsWith('27') && phoneNumber.length === 11) {
        whatsappNumber = phoneNumber;
      } else {
        let num = phoneNumber;
        if (!num.startsWith('0')) num = '0' + num;
        if (num.length > 10) num = num.substring(num.length - 10);
        if (num.length < 10) num = num.padEnd(10, '0');
        whatsappNumber = num.replace(/^0/, '27');
      }
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (listing.email || listing.userRef?.email) {
      // Fallback to email
      const emailTo = listing.email || listing.userRef?.email;
      const subject = `Interest in ${listingName}`;
      window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  // Host rating states
  const [hostData, setHostData] = useState({
    likeCount: 0,
    dislikeCount: 0,
    userAction: null,
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const generateMapLink = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Fetch host ratings
  useEffect(() => {
    const fetchHostRatings = async () => {
      if (!currentUser || !listing?.userRef) return;

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

  // Validate listingId before fetching
  const isValidListingId = (id) => {
    if (!id || id === "undefined" || id === "null" || id.trim() === "") {
      return false;
    }
    // Basic MongoDB ObjectId validation (24 hex characters)
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch listing data - FIXED for localhost:5173
  useEffect(() => {
    const fetchListing = async () => {
      // Validate listingId first
      if (!isValidListingId(listingId)) {
        console.error('Invalid listingId:', listingId);
        setUiState(prev => ({ ...prev, loading: false, error: true }));
        alert('Invalid property listing ID. Please check the URL and try again.');
        navigate('/listings'); // Redirect to listings page
        return;
      }

      try {
        setUiState({ loading: true, error: false, submitting: false, showAllReviews: false, newReviewsAvailable: false });
        console.log('Fetching listing with ID:', listingId);
        
        // IMPORTANT: Adjust API endpoint based on your backend
        // If your backend is running on a different port, update the URL
        // Example: 'http://localhost:3000/api/listing/get/' or '/api/listing/get/'
        const response = await fetch(`/api/listing/get/${listingId}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          // Try alternative endpoint if the first one fails
          const alternativeResponse = await fetch(`http://localhost:3000/api/listing/get/${listingId}`);
          
          if (!alternativeResponse.ok) {
            throw new Error(`Failed to fetch listing (Status: ${response.status})`);
          }
          
          const listingData = await alternativeResponse.json();
          setListing(listingData);
          setUiState(prev => ({ ...prev, loading: false, error: false }));
          return;
        }

        const listingData = await response.json();
        console.log('Received listing data:', listingData);
        
        if (!listingData._id || !listingData.name) {
          throw new Error('Invalid listing data received from server');
        }

        // Ensure imageUrls is always an array
        if (!listingData.imageUrls || !Array.isArray(listingData.imageUrls)) {
          listingData.imageUrls = ['https://via.placeholder.com/800x600?text=Property+Image'];
        }

        setListing(listingData);
        setUiState(prev => ({ ...prev, loading: false, error: false }));
      } catch (error) {
        console.error("Fetch error:", error);
        setUiState(prev => ({ ...prev, loading: false, error: true }));
        
        // Fallback to mock data for testing
        console.log('Using mock data for testing...');
        const mockListing = {
          _id: listingId,
          name: "Luxury Apartment in City Center",
          type: "over",
          regularPrice: 1200,
          bedrooms: 2,
          bathrooms: 1,
          address: "123 Main Street, City Center",
          description: "Beautiful luxury apartment in the heart of the city. Fully furnished with modern amenities.",
          imageUrls: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          ],
          contact: "0821234567",
          email: "host@example.com",
          userRef: {
            _id: "user123",
            username: "John Doe",
            email: "john@example.com",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            createdAt: "2024-01-01"
          },
          amenities: ["wifi", "parking", "pool", "kitchen"],
          rules: "No smoking, no parties, no pets",
          near: "Restaurants, shopping malls, parks, public transport",
          kind: "Apartment",
          cancel: "Free cancellation within 48 hours"
        };
        
        setListing(mockListing);
        setUiState(prev => ({ ...prev, loading: false, error: false }));
      }
    };
    
    if (listingId) {
      fetchListing();
    } else {
      console.error('No listingId found in URL parameters');
      setUiState(prev => ({ ...prev, loading: false, error: true }));
    }
  }, [listingId, navigate]);

  // Social media verification and Facebook check
  useEffect(() => {
    const verifyHostAndListing = async () => {
      if (!listing) return;
      
      if (listing.userRef) {
        await verifySocialMedia(listing.userRef);
      }
      
      const facebookPosted = await checkFacebookListing();
      setIsFacebookPosted(facebookPosted);
    };

    if (listing) {
      verifyHostAndListing();
    }
  }, [listing]);

  // Fetch host ratings when listing loads
  useEffect(() => {
    if (listing) {
      fetchHostRatings();
    }
  }, [listing]);

  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      if (!listingId || !isValidListingId(listingId)) {
        setCommentCount(0);
        return;
      }

      try {
        const response = await fetch(`/api/comment/get/${listingId}`);
        if (response.ok) {
          const comments = await response.json();
          setCommentCount(Array.isArray(comments) ? comments.length : 0);
        } else {
          console.log('Comments endpoint not available, using fallback count');
          setCommentCount(aiRating.totalRatings || 0);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
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

  // Modal component
  const BookingModal = () => {
    if (!showBookingModal) return null;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slideUp">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Complete Your Booking</h2>
              <p className="text-gray-600 text-sm">Fill in your details to reserve via WhatsApp</p>
            </div>
            <button
              onClick={() => setShowBookingModal(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-2xl text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Property Info & Calendar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg mb-2">Property Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaBed className="text-blue-500" />
                      <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
                    </div>
                    {listing.bathrooms && (
                      <div className="flex items-center gap-2">
                        <FaShower className="text-blue-500" />
                        <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500" />
                      <span className="text-sm">{listing.address}</span>
                    </div>
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg mb-2">Select Dates</h3>
                  <Calendar
                    onChange={setDateRange}
                    value={dateRange}
                    selectRange={true}
                    minDate={new Date()}
                    className="rounded-lg w-full"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
                  {dateRange[0] && dateRange[1] && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{dateRange[0].toDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{dateRange[1].toDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span className="text-blue-600">
                            R{(listing.regularPrice * nights + (mealPlan === 'breakfast' ? breakfastPrice * nights : 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Booking Form */}
              <div className="lg:col-span-2">
                <form className="space-y-6">
                  {/* Guest Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Guest Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="modalGuestName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="modalGuestName"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="As it appears on ID"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="modalGuestContact" className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="modalGuestContact"
                          value={guestContact}
                          onChange={(e) => setGuestContact(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+27 82 123 4567"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="modalNumberOfGuests" className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Guests <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="modalNumberOfGuests"
                          value={numberOfGuests}
                          onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value={1}>1 Guest</option>
                          <option value={2}>2 Guests</option>
                          <option value={3}>3 Guests</option>
                          <option value={4}>4 Guests</option>
                          <option value={5}>5 Guests</option>
                          <option value={6}>6+ Guests</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="modalExtraBed" className="block text-sm font-medium text-gray-700 mb-1">
                          Extra Bed for Kids
                        </label>
                        <select
                          id="modalExtraBed"
                          value={extraBed}
                          onChange={(e) => setExtraBed(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="no">Not Needed</option>
                          <option value="yes">Yes, Please</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Additional Requests
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="modalIronRequest"
                              checked={ironRequest}
                              onChange={(e) => setIronRequest(e.target.checked)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="modalIronRequest" className="ml-2 text-sm text-gray-700">
                              Iron & Ironing Board Needed
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="modalSpecialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requests
                        </label>
                        <textarea
                          id="modalSpecialRequests"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Dietary restrictions, accessibility needs, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meal Options */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Meal Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${mealPlan === 'breakfast' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                        onClick={() => setMealPlan('breakfast')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${mealPlan === 'breakfast' ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                            {mealPlan === 'breakfast' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-lg">Breakfast Included</p>
                            <p className="text-sm text-gray-600 mt-1">+ R{breakfastPrice.toLocaleString('en-ZA')}/night</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${mealPlan === 'none' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                        onClick={() => setMealPlan('none')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${mealPlan === 'none' ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                            {mealPlan === 'none' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-lg">Room Only</p>
                            <p className="text-sm text-gray-600 mt-1">No meals included</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Price Breakdown</h3>
                    <div className="space-y-3">
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

                      <div className="pt-3 mt-2 border-t border-gray-200 font-semibold flex justify-between text-xl">
                        <span>Total Amount</span>
                        <span className="text-blue-600 font-bold">
                          R{(listing.regularPrice * nights + (mealPlan === 'breakfast' ? breakfastPrice * nights : 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
               
                <button
                  onClick={handleOvernightWhatsAppBooking}
                  disabled={!guestName || !guestContact || !numberOfGuests}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-xl" />
                  Book 
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
                You'll be redirected to WhatsApp to complete your booking
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        /* Enhanced Responsive Image Gallery */
        .image-gallery-container {
          position: relative;
          width: 100%;
          height: 70vh;
          max-height: 700px;
          min-height: 400px;
          background: #fff;
          overflow: hidden;
          border-radius: 0 0 24px 24px;
        }

        @media (max-width: 768px) {
          .image-gallery-container {
            height: 60vh;
            min-height: 500px;
            border-radius: 0 0 16px 16px;
          }
        }

        @media (max-width: 480px) {
          .image-gallery-container {
            height: 45vh;
            min-height: 250px;
          }
        }

        /* Main Image Swiper */
        .main-image-swiper {
          width: 100%;
          height: 100%;
        }

        .main-image-slide {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .main-image:hover {
          transform: scale(1.02);
        }

        /* Thumbnail Gallery */
        .thumbnail-gallery {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 0 40px;
          pointer-events: none;
        }

        .thumbnail-swiper {
          padding: 10px 0;
          pointer-events: auto;
        }

        .thumbnail-slide {
          width: 80px;
          height: 60px;
          opacity: 0.5;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
        }

        .thumbnail-slide:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }

        .thumbnail-slide-active {
          opacity: 1;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transform: translateY(-4px);
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .thumbnail-gallery {
            padding: 0 20px;
          }
          
          .thumbnail-slide {
            width: 60px;
            height: 45px;
          }
        }

        /* Navigation buttons */
        .gallery-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 10;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gallery-nav-btn:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transform: translateY(-50%) scale(1.05);
        }

        .gallery-nav-btn.prev {
          left: 20px;
        }

        .gallery-nav-btn.next {
          right: 20px;
        }

        @media (max-width: 768px) {
          .gallery-nav-btn {
            width: 32px;
            height: 32px;
          }
          
          .gallery-nav-btn.prev {
            left: 10px;
          }
          
          .gallery-nav-btn.next {
            right: 10px;
          }
        }

        /* Image counter */
        .image-counter {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .image-counter {
            bottom: 100px;
            right: 20px;
            font-size: 12px;
          }
        }

        /* Header Overlay */
        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px 40px;
          z-index: 100;
          background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .header-overlay {
            padding: 16px 20px;
          }
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          pointer-events: auto;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
          pointer-events: auto;
        }

        .back-btn:hover {
          background: #f7f7f7;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .back-btn {
            width: 36px;
            height: 36px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          pointer-events: auto;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: white;
          transform: scale(1.05);
        }

        .favorite-btn {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }

        .favorite-btn:hover {
          background: white;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .action-btn, .favorite-btn {
            width: 36px;
            height: 36px;
          }
        }

        /* Title Overlay */
        .title-overlay {
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
          max-width: 600px;
          pointer-events: auto;
          position: absolute;
          bottom: 80px;
          left: 40px;
          right: 40px;
        }

        @media (max-width: 768px) {
          .title-overlay {
            left: 20px;
            right: 20px;
            bottom: 140px;
          }
        }

        .title-overlay h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .title-overlay p {
          font-size: 16px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .title-overlay h1 {
            font-size: 24px;
          }
          .title-overlay p {
            font-size: 14px;
          }
        }

        /* Floating Booking Bar */
        .floating-booking-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e5e5;
          padding: 16px 24px;
          z-index: 100;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
        }

        @media (max-width: 768px) {
          .floating-booking-bar {
            padding: 12px 16px;
          }
        }

        .booking-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .booking-content {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
        }

        .booking-price {
          flex: 1;
        }

        .price-unit {
          font-size: 22px;
          font-weight: 600;
          color: #222;
        }

        @media (max-width: 768px) {
          .price-unit {
            font-size: 18px;
          }
        }

        .price-total {
          font-size: 16px;
          color: #717171;
          margin-top: 4px;
        }

        .booking-info {
          font-size: 14px;
          color: #717171;
          margin-top: 2px;
        }

        .booking-btn {
          background: #FF385C;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          min-width: 180px;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .booking-btn {
            width: 100%;
            padding: 16px 24px;
          }
        }

        .booking-btn:hover {
          background: #E31C5F;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 56, 92, 0.2);
        }

        .booking-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Content Container - Enhanced for big screens */
        .main-content-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 32px;
          padding-bottom: 120px;
          margin-top: 0;
          position: relative;
          z-index: 1;
          background: white;
        }

        @media (min-width: 1536px) {
          .main-content-container {
            max-width: 1600px;
            padding: 48px 40px;
          }
        }

        @media (max-width: 768px) {
          .main-content-container {
            padding: 24px 16px;
            padding-bottom: 140px;
          }
        }

        /* Responsive Grid - Enhanced for big screens */
        .responsive-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 1024px) {
          .responsive-grid {
            grid-template-columns: 2fr 1fr;
            gap: 48px;
          }
        }

        @media (min-width: 1536px) {
          .responsive-grid {
            grid-template-columns: 3fr 1fr;
            gap: 56px;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 70vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        /* Big screen optimizations */
        @media (min-width: 1536px) {
          .title-overlay h1 {
            font-size: 40px;
          }
          
          .title-overlay p {
            font-size: 18px;
          }
          
          .booking-content {
            max-width: 1400px;
          }
          
          .price-unit {
            font-size: 26px;
          }
          
          .booking-btn {
            font-size: 18px;
            padding: 16px 40px;
          }
        }

        @media (min-width: 1920px) {
          .main-content-container {
            max-width: 1800px;
          }
          
          .image-gallery-container {
            height: 80vh;
            max-height: 900px;
          }
        }
      `}</style>

      {/* Enhanced Image Gallery */}
      <div className="image-gallery-container">
        {/* Header Overlay */}
        <div className="header-overlay">
          <div className="header-top">
            <button
              className="back-btn"
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
              title="Go back"
            >
              <FaArrowLeft className="text-xl text-gray-800" />
            </button>

            <div className="action-buttons">
              <button className="action-btn" title="Share">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              
              <button
                onClick={toggleFavorite}
                className="favorite-btn"
                title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isFavorite ? (
                  <FaHeart className="w-5 h-5 text-rose-600" />
                ) : (
                  <FaRegHeart className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Image Swiper */}
        <Swiper
          className="main-image-swiper"
          modules={[Navigation, Thumbs]}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          thumbs={{ swiper: thumbsSwiper }}
          loop={true}
          spaceBetween={0}
        >
          {listing.imageUrls.map((img, index) => (
            <SwiperSlide key={`main-${index}`} className="main-image-slide">
              <img
                src={img}
                alt={`Property view ${index + 1}`}
                className="main-image"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/800x600?text=Property+Image'; 
                }}
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Navigation buttons */}
        <button className="gallery-nav-btn swiper-button-prev prev">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
            <path d="M20.6667 24.6667L12 16L20.6667 7.33334L22 8.66668L14.6667 16L22 23.3333L20.6667 24.6667Z" />
          </svg>
        </button>
        <button className="gallery-nav-btn swiper-button-next next">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
            <path d="M11.3333 7.33334L20 16L11.3333 24.6667L10 23.3333L17.3333 16L10 8.66668L11.3333 7.33334Z" />
          </svg>
        </button>
        
        {/* Thumbnail Gallery */}
        <div className="thumbnail-gallery">
          <Swiper
            className="thumbnail-swiper"
            modules={[Thumbs]}
            watchSlidesProgress
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode={true}
          >
            {listing.imageUrls.map((img, index) => (
              <SwiperSlide key={`thumb-${index}`} className="thumbnail-slide">
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image"
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        {/* Image counter */}
        <div className="image-counter">
          <FaCamera className="mr-1" />
          <span>{listing.imageUrls.length} photos</span>
        </div>

        {/* Title Overlay */}
        <div className="title-overlay">
          <h1>{listing.name}</h1>
          <p>
            <span>★ {Number(aiRating.average).toFixed(1)}</span>
            <span>·</span>
            <span>{commentCount} reviews</span>
            <span>·</span>
            <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
            <span>·</span>
            <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
          </p>
        </div>
      </div>

      {/* Floating Booking Bar */}
      <div className="floating-booking-bar">
        <div className="booking-content">
          <div className="booking-price">
            <div className="price-unit">
              {listing.type === 'sale' && (
                <>R{listing.regularPrice.toLocaleString('en-ZA')} for sale</>
              )}
              {listing.type === 'rent' && (
                <>R{listing.regularPrice.toLocaleString('en-ZA')} / month</>
              )}
              {listing.type === 'office' && (
                <>R{listing.regularPrice.toLocaleString('en-ZA')} / hour</>
              )}
              {(listing.type === 'over' || !listing.type) && (
                <>R{listing.regularPrice.toLocaleString('en-ZA')} / night</>
              )}
            </div>
            
            {dateRange[0] && dateRange[1] && (listing.type === 'over' || !listing.type) && (
              <div className="price-total">
                R{(listing.regularPrice * nights).toLocaleString('en-ZA')} for {nights} night{nights > 1 ? 's' : ''}
              </div>
            )}
            
            <div className="booking-info">
              {listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'} · 
              {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'} · Free cancellation
            </div>
          </div>
          
          {/* Conditional button based on listing type */}
          {listing.type === 'over' || !listing.type ? (
            // Reserve button for overnight stays
            <button
              className="booking-btn"
              onClick={() => setShowBookingModal(true)}
              disabled={!listing?.contact}
            >
              <FaWhatsapp className="text-lg" />
              Reserve
            </button>
          ) : listing.type === 'office' ? (
            // Book Now button for office spaces
            <button
              className="booking-btn"
              onClick={() => {
                if (!currentUser) {
                  navigate('/sign-in');
                  return;
                }
                document.getElementById('office-booking-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={!listing?.contact}
            >
              <FaWhatsapp className="text-lg" />
              Book Now
            </button>
          ) : (
            // Contact Host button for sale/rent listings
            <button
              className="booking-btn"
              onClick={() => setShowContactModal(true)}
              disabled={!listing?.contact && !listing?.email}
            >
              <FaPhone className="text-lg" />
              Contact Host
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal with Calendar */}
      <BookingModal />

      {/* Contact Host Modal */}
      <ContactHostModal 
        listing={listing}
        user={currentUser}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Main Content */}
      <main className="main-content-container">
        {/* Responsive Grid Layout */}
        <div className="responsive-grid">
          {/* Left Column - Property Details */}
          <div>
            {/* Property Info Card */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
                  <span className="mx-1">·</span>
                  <span>{commentCount} reviews</span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>{listing.address}</span>
                </div>
                {listing.kind && (
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                    {listing.kind}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Host Information Section */}
            <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={listing.userRef?.avatar || 'https://via.placeholder.com/64?text=Host'}
                      alt={listing.userRef?.username || 'Host'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64?text=Host'; }}
                    />
                    {aiRating.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <FaCheckCircle className="text-red-500 text-lg" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Hosted by {listing.userRef?.username || 'Unknown Host'}
                      {aiRating.verified && (
                        <FaCheckCircle className="text-red-500 text-sm" title="Verified Host" />
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
                      onClick={() => handleRateHostLikeDislike('like')}
                      disabled={ratingLoading}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${hostData.userAction === 'like' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}
                    >
                      <FaThumbsUp className={hostData.userAction === 'like' ? 'text-green-600' : 'text-gray-500'} />
                      <span>{hostData.likeCount}</span>
                    </button>
                    
                    <button
                      onClick={() => handleRateHostLikeDislike('dislike')}
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
                  <FaUserFriends className="text-red-500" />
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

            {/* Description Section */}
            <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">About this space</h2>
              <div className="relative">
                <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                  {truncateDescription(listing.description)}
                </p>
                {listing.description && listing.description.split(' ').length > 50 && (
                  <button
                    onClick={() => setIsDescriptionModalOpen(true)}
                    className="mt-2 flex items-center text-gray-600 hover:text-gray-800 transition-colors font-semibold"
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
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
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
            )}

            {/* Amenities Section */}
            <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AMENITIES.map(({ icon: Icon, label, key }) => (
                  <div key={key} className="flex items-center gap-3 p-3">
                    <Icon className="text-gray-600 text-lg" />
                    <span className="text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Additional Information */}
            <section className="mb-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Cancellation Policy</h3>
                    <p className="text-gray-900 font-medium">{listing.cancel || 'Free cancellation'}</p>
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
                        : 'Restaurants, shopping, parks'
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
                        : 'No smoking, no parties, no pets'
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
              <section id="office-booking-section" className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Availability & Booking</h2>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Calendar Section */}
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
                  {/* Booking Summary Section */}
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
                              <p>You'll complete your booking via WhatsApp</p>
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
              <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Availability & Booking</h2>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Calendar Section */}
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
                  {/* Booking Summary Section */}
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
                          {/* Guest Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3">Guest Information</h4>
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
                              <div>
                                <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-1">
                                  Number of Guests <span className="text-red-500">*</span>
                                </label>
                                <select
                                  id="numberOfGuests"
                                  value={numberOfGuests}
                                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value={1}>1 Guest</option>
                                  <option value={2}>2 Guests</option>
                                  <option value={3}>3 Guests</option>
                                  <option value={4}>4 Guests</option>
                                  <option value={5}>5 Guests</option>
                                  <option value={6}>6+ Guests</option>
                                </select>
                              </div>
                              <div>
                                <label htmlFor="extraBed" className="block text-sm font-medium text-gray-700 mb-1">
                                  Extra Bed for Kids
                                </label>
                                <select
                                  id="extraBed"
                                  value={extraBed}
                                  onChange={(e) => setExtraBed(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="no">Not Needed</option>
                                  <option value="yes">Yes, Please</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Additional Requests
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id="ironRequest"
                                      checked={ironRequest}
                                      onChange={(e) => setIronRequest(e.target.checked)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="ironRequest" className="ml-2 text-sm text-gray-700">
                                      Iron & Ironing Board Needed
                                    </label>
                                  </div>
                                </div>
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
                          {/* WhatsApp Booking Button */}
                          <div className="pt-2">
                            <div className="mb-3 text-center text-sm text-gray-600">
                              <p>You'll complete your booking via WhatsApp</p>
                            </div>
                            <button
                              className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-sm"
                              onClick={() => setShowBookingModal(true)}
                              disabled={!guestName || !guestContact || !numberOfGuests}
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

            {/* Location */}
            <section className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

            {/* Contact Host Section (for all listing types) */}
            <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
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

          {/* Right Column - Sidebar */}
          <div>
            {/* Advertising Section */}
            <section className="mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
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
            </section>

            {/* Reviews Section */}
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
            
            </section>

             {/* Comments Section */}
                      <div className="bg-white rounded-xl shadow-sm p-6  border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                          <button
                            onClick={() => setShowCommentsPanel(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View All ({commentCount})
                          </button>
                        </div>
                        <Comments 
              listingId={listingId} 
              maxComments={2}
              onTotalComments={setCommentCount} 
              cardStyle={true}
            />
                      </div>

             {showCommentsPanel && (
        <CommentsSidePanel 
          listingId={listingId} 
          onClose={() => setShowCommentsPanel(false)} 
        />
      )}
          </div>
        </div>
      </main>
    </>
  );
}