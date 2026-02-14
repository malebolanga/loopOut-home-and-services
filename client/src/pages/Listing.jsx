/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom, Thumbs, Pagination } from "swiper/modules";
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
  MdKingBed,
  MdBathtub,
  MdSquareFoot,
} from "react-icons/md";
import {
  FaArrowRight ,
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
  FaMap,
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
  FaUsers,
  FaCar,
  FaConciergeBell,
  FaHotTub,
  FaFire,
  FaSnowflake,
  FaUmbrellaBeach,
  FaDumbbell,
  FaDesktop,
  FaLock,
  FaSmokingBan,
  FaWind,
  FaTree,
  FaWater,
  FaCouch,
  FaUtensils,
  FaRobot,
  FaLightbulb,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

// Styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import "swiper/css/thumbs";
import "swiper/css/pagination";
import "react-calendar/dist/Calendar.css";
import "../styles/ListingDetails.scss";

// Constants - ONLY ACTUAL FIELDS FROM YOUR MONGOOSE SCHEMA
const AMENITY_CONFIGS = {
  wifi: { icon: FaWifi, label: "WiFi", field: "wifi" },
  parking: { icon: FaParking, label: "Parking", field: "parking" },
  pool: { icon: FaSwimmingPool, label: "Swimming Pool", field: "pool" },
  kitchen: { icon: FaCookie, label: "Kitchen", field: "kitchen" },
  stove: { icon: FaUtensils, label: "Stove", field: "stove" },
  tv: { icon: FaTv, label: "TV", field: "tv" },
  storage: { icon: FaWarehouse, label: "Storage", field: "storage" },
  security: { icon: FaShieldAlt, label: "Security", field: "security" },
  hot: { icon: FaBolt, label: "Hot Water", field: "hot" },
  pets: { icon: FaDog, label: "Pets Allowed", field: "pets" },
  prepaid: { icon: FaLock, label: "Prepaid", field: "prepaid" },
  fridge: { icon: FaSnowflake, label: "Fridge", field: "fridge" },
  share: { icon: FaUsers, label: "Shared Space", field: "share" },
  breakfast: { icon: FaCoffee, label: "Breakfast", field: "breakfast" },
  party: { icon: FaConciergeBell, label: "Party Allowed", field: "party" },
  furnished: { icon: FaChair, label: "Furnished", field: "furnished" },
};

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
  rent: { label: 'For Rent', color: 'bg-blue-100 text-blue-800', icon: '🏠' },
  sale: { label: 'For Sale', color: 'bg-emerald-100 text-emerald-800', icon: '💰' },
  over: { label: 'Vacation Rental', color: 'bg-purple-100 text-purple-800', icon: '🌙' },
  land: { label: 'Land', color: 'bg-amber-100 text-amber-800', icon: '🪨' },
  office: { label: 'Office Space', color: 'bg-orange-100 text-orange-800', icon: '🏢' }
};

const SOCIAL_PLATFORMS = [
  { name: 'facebook', icon: FaFacebook, color: 'text-blue-600', baseUrl: 'https://facebook.com/' },
  { name: 'instagram', icon: FaInstagram, color: 'text-pink-600', baseUrl: 'https://instagram.com/' },
  { name: 'twitter', icon: FaTwitter, color: 'text-blue-400', baseUrl: 'https://twitter.com/' },
  { name: 'linkedin', icon: FaLinkedin, color: 'text-blue-700', baseUrl: 'https://linkedin.com/in/' },
  { name: 'tiktok', icon: FaTiktok, color: 'text-black', baseUrl: 'https://tiktok.com/@' },
];

const ADVERTISING_PLATFORMS = [
  { name: 'Facebook Ads', icon: FaFacebook, color: 'bg-blue-500', reach: '2.9B' },
  { name: 'Google Ads', icon: FaGlobe, color: 'bg-red-500', reach: '4.3B' },
  { name: 'Instagram Ads', icon: FaInstagram, color: 'bg-pink-500', reach: '2B' },
  { name: 'Twitter Ads', icon: FaTwitter, color: 'bg-blue-400', reach: '450M' },
  { name: 'TikTok Ads', icon: FaTiktok, color: 'bg-black', reach: '1B' },
];

// Contact Host Modal Component - FIXED VERSION
const ContactHostModal = ({ listing, user, isOpen, onClose }) => {
  const [contactMethod, setContactMethod] = useState('whatsapp');
  const [message, setMessage] = useState('');
  
  const defaultMessage = `Hello, I'm ${user?.name || 'Potential Buyer/Tenant'}. I'm interested in viewing your "${listing?.name || 'Property'}" property for ${listing?.type === 'sale' ? 'purchase' : 'rental'}. Could you please provide more details or schedule a viewing?`;
  
  // UPDATED: Format phone number to always start with 0
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Ensure it's a string
    const phoneStr = String(phone).trim();
    
    // Remove all non-numeric characters
    const digits = phoneStr.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    // Handle South African numbers
    // If starts with 27 (international format for South Africa)
    if (digits.startsWith('27') && digits.length === 11) {
      // Convert 27XXXXXXXXX to 0XXXXXXXXX
      return '0' + digits.substring(2);
    }
    
    // If starts with +27
    if (digits.startsWith('27') && digits.length === 12) {
      // Remove +27 and add 0
      return '0' + digits.substring(2);
    }
    
    // If it's already 10 digits and starts with 0
    if (digits.length === 10 && digits.startsWith('0')) {
      return digits;
    }
    
    // If it's 9 digits, add 0 at the beginning
    if (digits.length === 9) {
      return '0' + digits;
    }
    
    // If it's more than 10 digits, take the last 10 digits
    if (digits.length > 10) {
      const last10Digits = digits.substring(digits.length - 10);
      // Ensure it starts with 0
      if (last10Digits.startsWith('0')) {
        return last10Digits;
      } else {
        return '0' + last10Digits.substring(1);
      }
    }
    
    // Default: ensure it starts with 0
    if (!digits.startsWith('0') && digits.length >= 9) {
      return '0' + digits;
    }
    
    return digits;
  };
  
  // Format for WhatsApp (international format starting with 27)
  const formatPhoneNumberForWhatsApp = (phone) => {
    const formatted = formatPhoneNumber(phone);
    if (!formatted) return '';
    
    // Convert 0XXXXXXXXX to 27XXXXXXXXX
    if (formatted.startsWith('0') && formatted.length === 10) {
      return '27' + formatted.substring(1);
    }
    
    return formatted;
  };
  
  const handleSubmit = () => {
    // Get contact information safely with multiple fallbacks
    const contactNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
    const emailAddress = listing?.email || listing?.userRef?.email;
    
    // Check if any contact method is available
    const hasWhatsApp = contactNumber && contactMethod === 'whatsapp';
    const hasEmail = emailAddress && contactMethod === 'email';
    const hasCall = contactNumber && contactMethod === 'call';
    
    if (!hasWhatsApp && !hasEmail && !hasCall) {
      alert(`No ${contactMethod} information available for this host`);
      return;
    }

    const finalMessage = message || defaultMessage;
    
    if (contactMethod === 'whatsapp' && contactNumber) {
      const whatsappNumber = formatPhoneNumberForWhatsApp(contactNumber);
      
      if (!whatsappNumber || whatsappNumber.length < 10) {
        alert('Invalid phone number for WhatsApp');
        return;
      }
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
      window.open(whatsappUrl, '_blank');
    } else if (contactMethod === 'email' && emailAddress) {
      const emailTo = emailAddress;
      const subject = `Interest in "${listing?.name || 'Property'}"`;
      window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalMessage)}`;
    } else if (contactMethod === 'call' && contactNumber) {
      // Format for tel: link - ensure it starts with 0
      const telNumber = formatPhoneNumber(contactNumber);
      window.location.href = `tel:${telNumber}`;
    }
    
    onClose();
  };
  
  // Get available contact methods
  const getAvailableContactMethods = () => {
    const contactNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
    const emailAddress = listing?.email || listing?.userRef?.email;
    
    const methods = [];
    
    if (contactNumber) {
      methods.push('whatsapp');
      methods.push('call');
    }
    
    if (emailAddress) {
      methods.push('email');
    }
    
    return methods;
  };
  
  const availableMethods = getAvailableContactMethods();
  
  // Format phone number for display
  const displayPhoneNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
  const formattedDisplayNumber = formatPhoneNumber(displayPhoneNumber);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Contact Host</h3>
              <p className="text-gray-500 text-sm mt-1">Get in touch with the property owner</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-500 text-lg" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input 
              type="text" 
              value={user?.name || ''} 
              placeholder="Enter your full name"
              readOnly={!!user?.name}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Method</label>
            <div className="grid grid-cols-3 gap-2">
              {availableMethods.includes('whatsapp') && (
                <button 
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${contactMethod === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                  onClick={() => setContactMethod('whatsapp')}
                >
                  <FaWhatsapp className={`text-2xl ${contactMethod === 'whatsapp' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
              )}
              {availableMethods.includes('email') && (
                <button 
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${contactMethod === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setContactMethod('email')}
                >
                  <FaEnvelope className={`text-2xl ${contactMethod === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Email</span>
                </button>
              )}
              {availableMethods.includes('call') && (
                <button 
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${contactMethod === 'call' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                  onClick={() => setContactMethod('call')}
                >
                  <FaPhone className={`text-2xl ${contactMethod === 'call' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Call</span>
                </button>
              )}
            </div>
            
            {/* Show contact details */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Host contact details:</p>
              <div className="space-y-1">
                {formattedDisplayNumber ? (
                  <p className="text-sm font-medium text-gray-900">
                    📱 {formattedDisplayNumber}
                  </p>
                ) : null}
                {listing?.email ? (
                  <p className="text-sm font-medium text-gray-900">
                    ✉️ {listing.email}
                  </p>
                ) : null}
                {listing?.userRef?.email && !listing?.email ? (
                  <p className="text-sm font-medium text-gray-900">
                    ✉️ {listing.userRef.email}
                  </p>
                ) : null}
                {!formattedDisplayNumber && !listing?.email && !listing?.userRef?.email ? (
                  <p className="text-sm text-gray-500 italic">No contact information provided</p>
                ) : null}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessage}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button 
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              onClick={handleSubmit}
              disabled={availableMethods.length === 0}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Slide Comments Component
const SlideComments = ({ comments, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Comments for this image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={comment.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                      alt={comment.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{comment.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${i < comment.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaComment className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No comments yet for this image</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to comment!</p>
            </div>
          )}
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
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [extraBed, setExtraBed] = useState('no');
  const [ironRequest, setIronRequest] = useState(false);
  
  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSlideComments, setShowSlideComments] = useState(false);
  const [currentSlideComments, setCurrentSlideComments] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
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
    tomorrow.setDate(tomorrow.getDate() + 3);
    return [today, tomorrow];
  });

  const [uiState, setUiState] = useState({
    loading: true,
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
    average: 4.8,
    totalRatings: 128,
    categoryRatings: RATING_CATEGORIES.reduce((acc, { name }) => {
      acc[name] = 4.7 + Math.random() * 0.6;
      return acc;
    }, {}),
    verified: true,
    aiComments: [],
  });

  // Host Rating State
  const [hostRatings, setHostRatings] = useState({
    average: 4.9,
    totalRatings: 87,
    categoryRatings: HOST_RATING_CATEGORIES.reduce((acc, { key }) => {
      acc[key] = 4.8;
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
      
      // Show notification
      alert(newFavoriteStatus ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  };

  // Advertising State
  const [advertisingState, setAdvertisingState] = useState({
    showAdModal: false,
    selectedPlatforms: [],
    budget: 250,
    duration: 7,
    loading: false,
    success: false
  });

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [socialMediaVerified, setSocialMediaVerified] = useState({
    facebook: true,
    instagram: true,
    twitter: true,
    linkedin: false,
    tiktok: false,
    website: true,
    loading: false
  });

  const [isFacebookPosted, setIsFacebookPosted] = useState(true);
  const [hostSocialLinks, setHostSocialLinks] = useState({
    facebook: 'https://facebook.com/johnproperty',
    instagram: 'https://instagram.com/johnproperty',
    twitter: 'https://twitter.com/johnproperty',
    website: 'https://johnproperty.com'
  });

  const breakfastPrice = 250;
  const cleaningFee = 450;
  const serviceFee = 350;

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

  // Generate sample comments for images
  const generateImageComments = (imageIndex) => {
    const sampleComments = [
      {
        name: "Alex Johnson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        rating: 5,
        date: "2024-01-15",
        text: "This room looks absolutely stunning! The design is so modern and luxurious."
      },
      {
        name: "Maria Garcia",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        rating: 4,
        date: "2024-01-10",
        text: "Love the natural lighting in this picture. Can't wait to experience it in person!"
      },
      {
        name: "David Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        rating: 5,
        date: "2024-01-05",
        text: "The attention to detail is amazing. Every corner looks picture-perfect."
      },
      {
        name: "Sarah Williams",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        rating: 4,
        date: "2024-01-02",
        text: "The color scheme is so calming. Perfect for a relaxing vacation."
      }
    ];
    
    // Return different comments for different images
    return sampleComments.slice(0, imageIndex % 3 + 2);
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

  // Get active amenities from listing data
  const getActiveAmenities = () => {
    if (!listing) return [];
    
    return Object.entries(AMENITY_CONFIGS)
      .filter(([key, config]) => {
        // Check if the field exists and is truthy in the listing
        return listing[config.field] === true;
      })
      .map(([key, config]) => config);
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

  // UPDATED: Helper function to format phone numbers safely - always starts with 0
  const formatPhoneNumberSafe = (phone) => {
    if (!phone) return '';
    
    // Ensure it's a string
    const phoneStr = String(phone).trim();
    
    // Remove all non-numeric characters
    const digits = phoneStr.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    // Handle South African numbers
    // If starts with 27 (international format for South Africa)
    if (digits.startsWith('27') && digits.length === 11) {
      // Convert 27XXXXXXXXX to 0XXXXXXXXX
      return '0' + digits.substring(2);
    }
    
    // If starts with +27
    if (digits.startsWith('27') && digits.length === 12) {
      // Remove +27 and add 0
      return '0' + digits.substring(2);
    }
    
    // If it's already 10 digits and starts with 0
    if (digits.length === 10 && digits.startsWith('0')) {
      return digits;
    }
    
    // If it's 9 digits, add 0 at the beginning
    if (digits.length === 9) {
      return '0' + digits;
    }
    
    // If it's more than 10 digits, take the last 10 digits
    if (digits.length > 10) {
      const last10Digits = digits.substring(digits.length - 10);
      // Ensure it starts with 0
      if (last10Digits.startsWith('0')) {
        return last10Digits;
      } else {
        return '0' + last10Digits.substring(1);
      }
    }
    
    // Default: ensure it starts with 0
    if (!digits.startsWith('0') && digits.length >= 9) {
      return '0' + digits;
    }
    
    return digits;
  };

  // UPDATED: Format phone number for WhatsApp (international format starting with 27)
  const formatPhoneNumberForWhatsApp = (phone) => {
    const formatted = formatPhoneNumberSafe(phone);
    if (!formatted) return '';
    
    // Convert 0XXXXXXXXX to 27XXXXXXXXX for WhatsApp
    if (formatted.startsWith('0') && formatted.length === 10) {
      return '27' + formatted.substring(1);
    }
    
    return formatted;
  };

  // Updated handleOvernightWhatsAppBooking to close modal after sending
  const handleOvernightWhatsAppBooking = () => {
    if (!listing) return;
    
    // Get contact number safely
    const contactNumber = listing?.contact || listing?.phone || '';
    if (!contactNumber) {
      alert('No contact number available for booking');
      return;
    }
    
    // Calculate prices
    const roomTotal = listing.regularPrice * nights;
    const breakfastTotal = mealPlan === 'breakfast' ? breakfastPrice * nights : 0;
    const totalPrice = roomTotal + breakfastTotal + cleaningFee + serviceFee;

    // Format prices
    const formatPrice = (price) =>
      price.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

    // Robust WhatsApp number formatting
    const whatsappNumber = formatPhoneNumberForWhatsApp(contactNumber);
    
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Invalid phone number for WhatsApp booking');
      return;
    }

    const message = encodeURIComponent(
      `🏨 *NEW BOOKING REQUEST* 🏨\n\n` +
      `*PROPERTY DETAILS*\n` +
      `🏠 ${listing.name}\n` +
      `📍 ${listing.address}\n\n` +
      `📅 *DATES*\n` +
      `• Check-in: ${dateRange[0].toDateString()}\n` +
      `• Check-out: ${dateRange[1].toDateString()}\n` +
      `• ${nights} Night${nights > 1 ? 's' : ''}\n\n` +
      `👥 *GUEST DETAILS*\n` +
      `• Guests: ${numberOfGuests}\n` +
      `• Extra Bed: ${extraBed === 'yes' ? 'Yes' : 'No'}\n\n` +
      `💰 *PRICE BREAKDOWN*\n` +
      `• Room Rate: R${formatPrice(listing.regularPrice)}/night\n` +
      `• ${nights} night${nights > 1 ? 's' : ''}: R${formatPrice(roomTotal)}\n` +
      `${mealPlan === 'breakfast' ?
        `• Breakfast: R${formatPrice(breakfastPrice)}/night\n` +
        `• ${nights} night${nights > 1 ? 's' : ''}: R${formatPrice(breakfastTotal)}\n` : ''}` +
      `• Cleaning Fee: R${formatPrice(cleaningFee)}\n` +
      `• Service Fee: R${formatPrice(serviceFee)}\n` +
      `*TOTAL: R${formatPrice(totalPrice)}*\n\n` +
      `👤 *GUEST INFORMATION*\n` +
      `• Name: ${guestName}\n` +
      `• Contact: ${guestContact}\n\n` +
      `📋 *Please reply with:*\n` +
      `✅ ACCEPT - Confirm booking\n` +
      `❌ DECLINE - Reject request\n` +
      `💬 MESSAGE - Contact guest\n\n` +
      `_Sent from Luxury Stays Platform_`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

    // Close modal and reset form
    setShowBookingModal(false);
    setGuestName('');
    setGuestContact('');
    setSpecialRequests('');
    setNumberOfGuests(2);
    setExtraBed('no');
    setIronRequest(false);
  };

  const handleOfficeWhatsAppBooking = () => {
    if (!listing) return;
    
    // Get contact number safely
    const contactNumber = listing?.contact || listing?.phone || '';
    if (!contactNumber) {
      alert('No contact number available for booking');
      return;
    }
    
    const formatPrice = (price) => price.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

    const whatsappNumber = formatPhoneNumberForWhatsApp(contactNumber);
    
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Invalid phone number for WhatsApp booking');
      return;
    }

    const message = encodeURIComponent(
      `🏢 *OFFICE BOOKING REQUEST* 🏢\n\n` +
      `*PROPERTY DETAILS*\n` +
      `🏠 ${listing.name}\n` +
      `📍 ${listing.address}\n\n` +
      `📅 *BOOKING DETAILS*\n` +
      `• Date: ${selectedDate.toDateString()}\n` +
      `• Time: ${startTime} - ${endTime}\n` +
      `• Hours: ${totalHours}\n\n` +
      `💰 *PRICE*\n` +
      `• Rate: R${formatPrice(listing.regularPrice)}/hour\n` +
      `• Total: R${formatPrice(totalPrice)}\n\n` +
      `👤 *GUEST INFORMATION*\n` +
      `• Name: ${guestName}\n` +
      `• Contact: ${guestContact}\n\n` +
      `📋 *Please reply with:*\n` +
      `✅ ACCEPT - Confirm booking\n` +
      `❌ DECLINE - Reject request\n` +
      `💬 MESSAGE - Contact guest`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

    // Reset form
    setGuestName('');
    setGuestContact('');
    setSpecialRequests('');
  };

  // Contact Host for Sale/Rent Listings
  const handleContactHost = () => {
    // Get contact information safely
    const contactNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
    const emailAddress = listing?.email || listing?.userRef?.email;
    
    if (!contactNumber && !emailAddress) {
      alert('No contact information available for this host');
      return;
    }

    const userName = currentUser?.name || 'Potential Buyer/Tenant';
    const listingName = listing.name || 'Property Listing';
    
    // Prepare the message for sale/rent listings
    const message = `Hello, I'm ${userName}. I'm interested in viewing your "${listingName}" property for ${listing.type === 'sale' ? 'purchase' : 'rental'}. Could you please provide more details or schedule a viewing?`;
    
    // Try WhatsApp first if contact is available
    if (contactNumber) {
      const whatsappNumber = formatPhoneNumberForWhatsApp(contactNumber);
      
      if (!whatsappNumber || whatsappNumber.length < 10) {
        // Fallback to email if WhatsApp number is invalid
        if (emailAddress) {
          const emailTo = emailAddress;
          const subject = `Interest in "${listingName}"`;
          window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        } else {
          alert('No valid contact information available');
        }
        return;
      }
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (emailAddress) {
      // Fallback to email
      const emailTo = emailAddress;
      const subject = `Interest in "${listingName}"`;
      window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  // Host rating states
  const [hostData, setHostData] = useState({
    likeCount: 124,
    dislikeCount: 3,
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

    if (listing?.userRef) {
      fetchHostRatings();
    }
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
      // Don't initialize with a fallback key - let it fail gracefully
    }
  }, []);

  // Validate listingId before fetching
  const isValidListingId = (id) => {
    if (!id || id === "undefined" || id === "null" || id.trim() === "") {
      return false;
    }
    // More lenient validation for MongoDB IDs
    return /^[a-zA-Z0-9]{20,}$/.test(id);
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
        const response = await fetch(`/api/listing/get/${listingId}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
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
          listingData.imageUrls = [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80',
          ];
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
          name: "Modern Luxury Villa with Ocean View",
          type: "over",
          regularPrice: 3500,
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2800,
          address: "12 Ocean Drive, Camps Bay, Cape Town",
          description: "Experience luxury living in this stunning modern villa featuring panoramic ocean views. This beautifully designed property offers spacious living areas, state-of-the-art amenities, and direct access to a private beach. The open-plan living area features floor-to-ceiling windows, gourmet kitchen with marble countertops, and a cozy fireplace. The master suite includes a private balcony, walk-in closet, and spa-like bathroom with rain shower and freestanding tub. Outside, enjoy the infinity pool, outdoor kitchen, and beautifully landscaped garden with panoramic ocean views. Perfect for families or groups seeking a luxurious retreat in one of Cape Town's most prestigious neighborhoods.",
          imageUrls: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
          ],
          contact: "0821234567",
          phone: "0821234567",
          email: "host@luxurystays.com",
          userRef: {
            _id: "user123",
            username: "John LuxuryStays",
            email: "john@luxurystays.com",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            createdAt: "2022-01-01"
          },
          // Set actual boolean values based on your schema
          wifi: true,
          parking: true,
          pool: true,
          kitchen: true,
          stove: true,
          tv: true,
          storage: false,
          security: true,
          hot: true,
          pets: false,
          prepaid: true,
          fridge: true,
          share: false,
          breakfast: true,
          party: false,
          furnished: true,
          rules: "No smoking inside the property. Quiet hours from 10 PM to 7 AM. Maximum 8 guests allowed. Pets allowed with prior approval. No parties or events without written consent. Please respect the neighbors and keep noise levels reasonable.",
          near: "• 5 min walk to Camps Bay Beach\n• 10 min drive to Table Mountain\n• 15 min to V&A Waterfront\n• Restaurants within walking distance\n• Grocery store 500m away\n• Wine farms within 30 min drive",
          kind: "Luxury Villa",
          cancel: "Free cancellation up to 30 days before check-in. 50% refund if canceled 14-30 days before check-in. No refund if canceled less than 14 days before check-in."
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

  // Handle slide change
  const handleSlideChange = (swiper) => {
    setCurrentSlideIndex(swiper.activeIndex);
  };

  // Handle view slide comments
  const handleViewSlideComments = (slideIndex) => {
    setCurrentSlideIndex(slideIndex);
    setCurrentSlideComments(generateImageComments(slideIndex));
    setShowSlideComments(true);
  };

  // Format phone number for display
  const displayContactNumber = listing?.contact || listing?.phone || '';
  const formattedDisplayNumber = formatPhoneNumberSafe(displayContactNumber);

  // Loading and error states
  if (uiState.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg text-gray-700 font-medium">Loading luxury property details...</p>
      </div>
    </div>
  );

  if (uiState.error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Property Not Found</h2>
        <p className="mt-2 text-gray-600">We couldn't find the property you're looking for.</p>
        <button
          onClick={() => navigate('/listings')}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
        >
          Browse Properties
        </button>
      </div>
    </div>
  );

  if (!listing) return null;

  const propertyType = PROPERTY_TYPES[listing.type] || PROPERTY_TYPES.over;
  
  // Get the actual amenities that are enabled for this listing
  const activeAmenities = getActiveAmenities();

  // Get contact information for display
  const displayEmail = listing?.email || listing?.userRef?.email || '';

  // Modal component
  const BookingModal = () => {
    if (!showBookingModal) return null;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
            <div>
              <h2 className="text-1xl font-bold text-gray-900">Complete Your Booking</h2>
            
            </div>
            <button
              onClick={() => setShowBookingModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-2xl text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Property Info & Calendar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Property Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <MdKingBed className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-semibold">{listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</p>
                      </div>
                    </div>
                    {listing.bathrooms && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <MdBathtub className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bathrooms</p>
                          <p className="font-semibold">{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</p>
                        </div>
                      </div>
                    )}
                    {listing.squareFeet && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <MdSquareFoot className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Size</p>
                          <p className="font-semibold">{listing.squareFeet.toLocaleString()} sq ft</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <FaMapMarkerAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-sm">{listing.address}</p>
                      </div>
                    </div>
                    
                    {/* Contact Information in Booking Modal */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-bold text-sm text-gray-700 mb-2">Host Contact</h4>
                      {formattedDisplayNumber && (
                        <div className="flex items-center gap-2 mb-2">
                          <FaPhone className="text-gray-500 text-sm" />
                          <span className="text-sm font-medium">{formattedDisplayNumber}</span>
                        </div>
                      )}
                      {displayEmail && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-500 text-sm" />
                          <span className="text-sm font-medium">{displayEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Select Dates</h3>
                  <Calendar
                    onChange={setDateRange}
                    value={dateRange}
                    selectRange={true}
                    minDate={new Date()}
                    className="rounded-lg w-full border-0"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Booking Summary</h3>
                  {dateRange[0] && dateRange[1] && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold">{dateRange[0].toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold">{dateRange[1].toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Nights</span>
                          <span className="font-bold text-lg text-blue-700">{nights} night{nights > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Booking Form */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {/* Guest Information */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Guest Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="modalGuestName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="modalGuestName"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="As it appears on ID"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="modalGuestContact" className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="modalGuestContact"
                          value={guestContact}
                          onChange={(e) => setGuestContact(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="082 123 4567"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="modalNumberOfGuests" className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="modalNumberOfGuests"
                          value={numberOfGuests}
                          onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value={1}>1 Guest</option>
                          <option value={2}>2 Guests</option>
                          <option value={3}>3 Guests</option>
                          <option value={4}>4 Guests</option>
                          <option value={5}>5 Guests</option>
                          <option value={6}>6 Guests</option>
                          <option value={7}>7 Guests</option>
                          <option value={8}>8 Guests</option>
                          <option value={9}>9+ Guests</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="modalExtraBed" className="block text-sm font-medium text-gray-700 mb-2">
                          Extra Bed Request
                        </label>
                        <select
                          id="modalExtraBed"
                          value={extraBed}
                          onChange={(e) => setExtraBed(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="no">Not Needed</option>
                          <option value="yes">Yes, Please</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="modalSpecialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                          Special Requests
                        </label>
                        <textarea
                          id="modalSpecialRequests"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Dietary restrictions, accessibility needs, celebration details, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meal Options */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Dining Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${mealPlan === 'breakfast' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
                        onClick={() => setMealPlan('breakfast')}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${mealPlan === 'breakfast' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400'}`}>
                            {mealPlan === 'breakfast' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-lg">Gourmet Breakfast Included</p>
                            <p className="text-gray-600 mt-2">Start your day with a luxurious breakfast prepared by our chef</p>
                            <p className="text-emerald-700 font-semibold mt-3">+ R{breakfastPrice.toLocaleString('en-ZA')} / night</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${mealPlan === 'none' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                        onClick={() => setMealPlan('none')}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${mealPlan === 'none' ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                            {mealPlan === 'none' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-lg">Room Only</p>
                            <p className="text-gray-600 mt-2">Enjoy access to the fully-equipped kitchen</p>
                            <p className="text-blue-700 font-semibold mt-3">No additional cost</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Price Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3">
                        <div>
                          <span className="text-gray-700">R{listing.regularPrice.toLocaleString('en-ZA')} × {nights} nights</span>
                        </div>
                        <span className="font-semibold">R{(listing.regularPrice * nights).toLocaleString('en-ZA')}</span>
                      </div>

                      {mealPlan === 'breakfast' && (
                        <div className="flex justify-between items-center py-3 border-t border-gray-100">
                          <div>
                            <span className="text-gray-700">Breakfast × {nights} nights</span>
                          </div>
                          <span className="font-semibold">R{(breakfastPrice * nights).toLocaleString('en-ZA')}</span>
                        </div>
                      )}

                      <div className="pt-6 mt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                            <p className="text-sm text-gray-600 mt-1">Includes all taxes and fees</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-700">
                              R{(listing.regularPrice * nights + (mealPlan === 'breakfast' ? breakfastPrice * nights : 0)).toLocaleString('en-ZA')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-2 py-2 mt-2">
              <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FaCheckCircle className="text-green-500" />
                    <span>Free cancellation up to 30 days before check-in</span>
                  </div>
                </div>
                <button
                  onClick={handleOvernightWhatsAppBooking}
                  disabled={!guestName || !guestContact || !numberOfGuests || !formattedDisplayNumber}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  <FaWhatsapp className="text-1xl" />
                  Book via WhatsApp
                </button>
                {!formattedDisplayNumber && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Contact information is required for booking
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Enhanced Image Gallery */}
        <div className="relative w-full h-[70vh] max-h-[800px] bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Gallery Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent z-30">
            <div className="flex justify-between items-center">
              <button
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
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
                <FaArrowLeft className="text-xl text-gray-900" />
              </button>

              <div className="flex gap-3">
                <button className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg" title="Share property">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                
                <button
                  onClick={toggleFavorite}
                  className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isFavorite ? (
                    <FaHeart className="w-6 h-6 text-rose-600" />
                  ) : (
                    <FaRegHeart className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Swiper */}
          <Swiper
            modules={[Navigation, Thumbs, Pagination]}
            navigation={true}
            thumbs={{ swiper: thumbsSwiper }}
            pagination={{ clickable: true }}
            loop={true}
            spaceBetween={0}
            speed={800}
            onSlideChange={handleSlideChange}
            className="w-full h-full"
          >
            {listing.imageUrls.map((img, index) => (
              <SwiperSlide key={`main-${index}`} className="relative">
                <img
                  src={img}
                  alt={`${listing.name} - View ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80'; 
                  }}
                  loading="lazy"
                />
                
                {/* Slide Overlay with Comments Button */}
                <div className="absolute bottom-4 right-4 z-20">
                  <button
                    onClick={() => handleViewSlideComments(index)}
                    className="px-4 py-2 bg-black/70 text-white rounded-full flex items-center gap-2 hover:bg-black/90 transition-colors backdrop-blur-sm"
                  >
                    <FaComment />
                    <span>View Comments ({generateImageComments(index).length})</span>
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Thumbnail Gallery */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-4/5">
            <Swiper
              modules={[Thumbs]}
              watchSlidesProgress
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              centeredSlides={false}
              className="thumbnail-swiper"
            >
              {listing.imageUrls.map((img, index) => (
                <SwiperSlide key={`thumb-${index}`} className="w-24 h-16">
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-white transition-all"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Title Section */}
          <div className="absolute bottom-24 left-8 right-8 text-white z-25">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{listing.name}</h1>
            <div className="flex items-center gap-6 flex-wrap">
              <span className="flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
                <span className="text-gray-200">({aiRating.totalRatings} reviews)</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-2">
                <MdLocationOn className="text-gray-200" />
                <span>{listing.address.split(',')[0]}</span>
              </span>
              <span>·</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${propertyType.color}`}>
                {propertyType.icon} {propertyType.label}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Booking Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-4 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  R{listing.regularPrice.toLocaleString('en-ZA')}
                </span>
                <span className="text-gray-600">
                  {listing.type === 'sale' ? ' total' : 
                   listing.type === 'rent' ? 'month' : 
                   listing.type === 'office' ? ' hour' : ' night'}
                </span>
              </div>
            
            </div>
            
            {/* Conditional Booking Button */}
            {listing.type === 'over' || !listing.type ? (
              <button
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                onClick={() => setShowBookingModal(true)}
                disabled={!formattedDisplayNumber}
              >
                <FaWhatsapp className="text-sm" />
                Reserve
              </button>
            ) : listing.type === 'office' ? (
              <button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                onClick={() => {
                  if (!currentUser) {
                    navigate('/sign-in');
                    return;
                  }
                  document.getElementById('office-booking-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={!formattedDisplayNumber}
              >
                <FaWhatsapp className="text-xl" />
                Book Office
              </button>
            ) : (
              <button
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                onClick={() => setShowContactModal(true)}
                disabled={!formattedDisplayNumber && !displayEmail}
              >
                <FaPhone className="text-xl" />
                Contact
              </button>
            )}
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal />

        {/* Contact Host Modal */}
        <ContactHostModal 
          listing={listing}
          user={currentUser}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />

        {/* Slide Comments Modal */}
        <SlideComments 
          comments={currentSlideComments}
          isOpen={showSlideComments}
          onClose={() => setShowSlideComments(false)}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MdKingBed className="text-2xl text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="text-2xl font-bold text-gray-900">{listing.bedrooms}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MdBathtub className="text-2xl text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="text-2xl font-bold text-gray-900">{listing.bathrooms}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MdSquareFoot className="text-2xl text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Square Feet</p>
                    <p className="text-2xl font-bold text-gray-900">{listing.squareFeet?.toLocaleString() || '2,800'}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaUsers className="text-2xl text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600">Max Guests</p>
                    <p className="text-2xl font-bold text-gray-900">{listing.bedrooms * 2}</p>
                  </div>
                </div>
                
                {/* Contact Information Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formattedDisplayNumber && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaPhone className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-900">{formattedDisplayNumber}</p>
                        </div>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FaEnvelope className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email Address</p>
                          <p className="font-medium text-gray-900">{displayEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {(!formattedDisplayNumber && !displayEmail) && (
                    <p className="text-gray-500 italic">Contact information not provided</p>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">About this property</h2>
                  <button
                    onClick={() => setIsDescriptionModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <FaExternalLinkAlt />
                    View full description
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {isExpanded ? listing.description : truncateDescription(listing.description, 150)}
                </p>
                {listing.description && listing.description.split(' ').length > 150 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                    <FaChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Amenities Section - UPDATED: Only show selected amenities */}
              {activeAmenities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activeAmenities.map((amenity, index) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Icon className="text-gray-700 text-lg" />
                          <span className="text-gray-700 font-medium">{amenity.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Ratings Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI-Powered Ratings</h2>
                    <p className="text-gray-600">Verified by advanced analysis</p>
                  </div>
                  {aiRating.verified && (
                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                      <FaCheckCircle />
                      AI Verified
                    </span>
                  )}
                </div>
                
                {/* Overall Rating */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaStar className="text-2xl text-yellow-500" />
                        <span className="text-4xl font-bold text-gray-900">{Number(aiRating.average).toFixed(1)}</span>
                      </div>
                      <p className="text-gray-600">Out of 5 stars</p>
                      <p className="text-sm text-gray-500">{aiRating.totalRatings.toLocaleString()} verified ratings</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-2xl ${star <= Math.round(Number(aiRating.average)) ? 'text-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">AI Analysis Score</p>
                    </div>
                  </div>
                </div>

                {/* Rating Categories */}
                <div className="space-y-6">
                  {RATING_CATEGORIES.map((category, index) => {
                    const Icon = category.icon;
                    const rating = aiRating.categoryRatings[category.name];
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                            <Icon className="text-xl text-gray-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">Based on AI analysis</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">{Number(rating).toFixed(1)}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Comments */}
                {aiRating.aiComments.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">AI-Generated Insights</h3>
                    <div className="space-y-4">
                      {aiRating.aiComments.map((comment, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaCheckCircle className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">AI Insight</span>
                          </div>
                          <p className="text-gray-700">{comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-[28px] font-semibold text-gray-900 mb-3 tracking-tight">Location</h2>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="text-red-500 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900 mb-1">{listing.address}</p>
                      <a
                        href={generateMapLink(listing.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[15px] text-gray-600 hover:text-gray-900 font-medium"
                      >
                        View on Google Maps
                        <FaExternalLinkAlt className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Nearby Places Section */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-[22px] font-semibold text-gray-900 mb-1">What's nearby</h3>
                      <p className="text-gray-500 text-sm">Explore the neighborhood</p>
                    </div>
                    <button
                      onClick={() => setIsNearExpanded(!isNearExpanded)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isNearExpanded ? 'Show less' : 'Show more'}
                      <FaChevronDown 
                        className={`text-gray-500 transition-transform duration-300 ${isNearExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>
                  </div>

                  <div className={`space-y-4 ${isNearExpanded ? '' : 'max-h-48 overflow-hidden'}`}>
                    {listing.near ? (
                      listing.near.split('\n').map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          </div>
                          <span className="text-gray-700 text-[15px] leading-relaxed">{item.trim()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-4">
                        {[
                          { icon: '🏖️', text: '5 min walk to nearest beach' },
                          { icon: '🏙️', text: '10 min drive to city center' },
                          { icon: '🍽️', text: 'Restaurants within walking distance' },
                          { icon: '🛒', text: 'Grocery store: 8 min walk' },
                          { icon: '🚇', text: 'Public transport: 4 min walk' },
                          { icon: '🏛️', text: 'Historical landmarks nearby' }
                        ].map((item, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            <span className="text-gray-700 text-[15px]">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isNearExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setIsNearExpanded(true)}
                        className="w-full py-3 text-center text-gray-600 hover:text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Show more nearby places
                      </button>
                    </div>
                  )}
                </div>

                {/* Map Preview */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Explore the area</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Interactive</span>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <FaMap className="text-gray-400 text-2xl mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Map view available</p>
                      <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Open interactive map
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* House Rules Section */}
              {listing.rules && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">House rules</h2>
                  <div className="space-y-4">
                    {listing.rules.split('\n').map((rule, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{rule.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              {listing.cancel && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cancellation policy</h2>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-emerald-600 text-xl mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Flexible cancellation</p>
                        <p className="text-gray-700">{listing.cancel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Office Booking Section - Only for office type */}
              {(listing.type === 'office' || !listing.type) && (
                <div id="office-booking-section" className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Book this office space</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <Calendar
                          onChange={setSelectedDate}
                          value={selectedDate}
                          minDate={new Date()}
                          className="w-full border-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Guest Info for Office Booking */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          value={guestContact}
                          onChange={(e) => setGuestContact(e.target.value)}
                          placeholder="WhatsApp Number"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-600">Total Hours</p>
                        <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)} hours</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">Hourly Rate</p>
                        <p className="text-2xl font-bold text-gray-900">R{listing.regularPrice.toLocaleString('en-ZA')}/hr</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                        <span className="text-3xl font-bold text-blue-700">
                          R{totalPrice.toLocaleString('en-ZA')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOfficeWhatsAppBooking}
                    disabled={!guestName || !guestContact || totalHours === 0 || !formattedDisplayNumber}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  >
                    <FaWhatsapp className="text-2xl" />
                    Book via WhatsApp
                  </button>
                  
                  {!formattedDisplayNumber && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Contact information is required for booking
                    </p>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Guest Reviews</h2>
                      <p className="text-gray-500 text-sm mt-1">Real experiences from our guests</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <FaStar className="text-yellow-500 w-5 h-5 fill-current" />
                          <span className="font-bold text-gray-900 text-xl">{Number(aiRating.average).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm">/ 5.0</span>
                        </div>
                      </div>
                      
                      <div className="h-8 w-px bg-gray-200"></div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600 font-medium">
                          {commentCount} {commentCount === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowCommentsPanel(true)}
                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                    <FaComment className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-sm tracking-wide">View All Reviews</span>
                    <FaArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <Comments listingId={listingId} />
                </div>
              </div>
            </div>

            {/* Right Column - Host Info & Booking Widget */}
            <div className="space-y-8">
              {/* Host Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hosted by</h2>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={listing.userRef?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                      alt={listing.userRef?.username || 'Host'}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {hostStarRating > 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {hostStarRating}★
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{listing.host || listing.userRef?.username || 'Landlord'}</h3>
                    <p className="text-gray-600">Superhost · Joined {listing.userRef?.createdAt ? new Date(listing.userRef.createdAt).getFullYear() : 'No Date'}</p>
                  </div>
                </div>

                {/* Host Contact Information Display */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">Contact Details</h4>
                  <div className="space-y-3">
                    {formattedDisplayNumber && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaPhone className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{formattedDisplayNumber}</p>
                        </div>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaEnvelope className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{displayEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Host Ratings */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-900">Host Rating</span>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span className="font-bold">{Number(hostRatings.average).toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {HOST_RATING_CATEGORIES.map((category, index) => {
                      const Icon = category.icon;
                      const rating = hostRatings.categoryRatings[category.key];
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="text-gray-600" />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </div>
                          <StarRating
                            rating={Math.round(rating)}
                            onRatingChange={(rating) => handleRateHost(category.key, rating)}
                            readonly={!currentUser}
                            size="text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Like/Dislike Buttons */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Rate this host</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {hostData.likeCount} likes · {hostData.dislikeCount} dislikes
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRateHostLikeDislike('like')}
                      disabled={ratingLoading || hostData.userAction === 'like'}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        hostData.userAction === 'like'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <FaThumbsUp />
                      {hostData.userAction === 'like' ? 'Liked' : 'Like'}
                    </button>
                    <button
                      onClick={() => handleRateHostLikeDislike('dislike')}
                      disabled={ratingLoading || hostData.userAction === 'dislike'}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        hostData.userAction === 'dislike'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <FaThumbsDown />
                      {hostData.userAction === 'dislike' ? 'Disliked' : 'Dislike'}
                    </button>
                  </div>
                </div>

                {/* Social Media Verification */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-900">Social Verification</span>
                    {socialMediaVerified.loading ? (
                      <FaSpinner className="animate-spin text-gray-500" />
                    ) : (
                      <span className="text-sm text-emerald-600 font-medium">AI Verified</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {SOCIAL_PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const isVerified = socialMediaVerified[platform.name];
                      return (
                        <button
                          key={platform.name}
                          onClick={() => handleSocialMediaClick(platform.name)}
                          disabled={!isVerified && !hostSocialLinks[platform.name]}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            isVerified || hostSocialLinks[platform.name]
                              ? `${platform.color} border-current hover:opacity-90`
                              : 'border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                          }`}
                          title={isVerified || hostSocialLinks[platform.name] ? `Visit ${platform.name}` : 'Not verified'}
                        >
                          <Icon className="text-2xl mb-2" />
                          <span className="text-xs font-medium capitalize">{platform.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Facebook Listing Check */}
                {isFacebookPosted && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FaFacebook className="text-blue-600 text-xl" />
                      <div>
                        <p className="font-medium text-gray-900">Also listed on Facebook</p>
                        <p className="text-sm text-gray-600">Verified cross-platform presence</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Host Section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Contact Host</h3>
                  
                  {currentUser ? (
                    <>
                      {formattedDisplayNumber && (
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          <FaWhatsapp className="text-xl" />
                          Message on WhatsApp
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (displayEmail) {
                            const subject = `Interest in "${listing.name}"`;
                            window.location.href = `mailto:${displayEmail}?subject=${encodeURIComponent(subject)}`;
                          }
                        }}
                        disabled={!displayEmail}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaEnvelope className="text-xl" />
                        Send Email
                      </button>
                      
                      <button
                        onClick={() => {
                          if (formattedDisplayNumber) {
                            window.location.href = `tel:${formattedDisplayNumber}`;
                          }
                        }}
                        disabled={!formattedDisplayNumber}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPhone className="text-xl" />
                        Call Host
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 mb-3">Sign in to contact the host</p>
                      <button
                        onClick={() => navigate('/sign-in')}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>

                {/* Advertising Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Boost this listing</h3>
                      <p className="text-sm text-gray-600">Reach more potential guests</p>
                    </div>
                    <MdAdsClick className="text-2xl text-purple-600" />
                  </div>
                  
                  <button
                    onClick={() => setAdvertisingState(prev => ({ ...prev, showAdModal: true }))}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
                  >
                    Promote Listing
                  </button>
                </div>
              </div>

              {/* Safety Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Safety & Security</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaShieldAlt className="text-emerald-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Verified Property</p>
                      <p className="text-sm text-gray-600">AI-powered verification for authenticity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaLock className="text-blue-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Secure Payments</p>
                      <p className="text-sm text-gray-600">Protected transactions and escrow services</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaUserFriends className="text-amber-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Host Verification</p>
                      <p className="text-sm text-gray-600">Identity and background checks performed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Description Modal */}
      {isDescriptionModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Full Description</h2>
              <button
                onClick={() => setIsDescriptionModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="prose prose-lg max-w-none">
                {listing.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advertising Modal */}
      {advertisingState.showAdModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Boost Your Listing</h2>
                <p className="text-gray-600">Reach more potential guests with targeted advertising</p>
              </div>
              <button
                onClick={() => setAdvertisingState(prev => ({ ...prev, showAdModal: false }))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-2xl text-gray-500" />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-8">
                {/* Platform Selection */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Select Platforms</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ADVERTISING_PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <button
                          key={platform.name}
                          onClick={() => handleAdPlatformToggle(platform.name)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                            advertisingState.selectedPlatforms.includes(platform.name)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`${platform.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                            <Icon className="text-white text-xl" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{platform.name}</p>
                            <p className="text-sm text-gray-500">Reach: {platform.reach}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Advertising Budget</h3>
                    <span className="text-2xl font-bold text-purple-700">R{advertisingState.budget.toLocaleString('en-ZA')}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={advertisingState.budget}
                    onChange={(e) => setAdvertisingState(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>R50</span>
                    <span>R5,000</span>
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Duration</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => setAdvertisingState(prev => ({ ...prev, duration: days }))}
                        className={`py-3 rounded-lg border-2 transition-all ${
                          advertisingState.duration === days
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-bold">{days} days</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Reach */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Estimated Results</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {(advertisingState.budget * 100).toLocaleString('en-ZA')}
                      </p>
                      <p className="text-sm text-gray-600">Impressions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {Math.round(advertisingState.budget * 1.5).toLocaleString('en-ZA')}
                      </p>
                      <p className="text-sm text-gray-600">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {Math.round(advertisingState.budget * 0.1).toLocaleString('en-ZA')}
                      </p>
                      <p className="text-sm text-gray-600">Bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanel 
          listingId={listingId}
          onClose={() => setShowCommentsPanel(false)}
          currentUser={currentUser}
          listing={listing}
        />
      )}
    </>
  );
}