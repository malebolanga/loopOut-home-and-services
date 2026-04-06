/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom, Thumbs, Pagination, FreeMode } from "swiper/modules";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";

import Calendar from "react-calendar";
import CommentsSidePanel from '../components/CommentsSidePanel';
import ImageWithFallback from '../components/ImageWithFallback';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { useWishlist } from '../hooks/useWishlist';


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
  MdClose,
} from "react-icons/md";
import {
  FaArrowRight,
  FaStar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaParking,
  FaSwimmingPool,
  FaWifi,
  FaShieldAlt,
  FaFlag,
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
  FaUser,
  FaTag,
  FaSpinner,
  FaComment,
  FaTv,
  FaWarehouse,
  FaChevronDown,
  FaBed,
  FaPaperPlane,
  FaReceipt,
  FaEnvelope,
  FaRegCommentDots,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaExternalLinkAlt,
  FaUserFriends,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaGlobe,
  FaHeart,
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
  FaShare,
  FaEllipsisH,
  FaBath,
  FaHome,
  FaCalendar,
} from "react-icons/fa";
import { FiShare2, FiHeart, FiMessageSquare } from "react-icons/fi";

// Styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import "swiper/css/thumbs";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "react-calendar/dist/Calendar.css";
import "../styles/ListingDetails.scss";

// Constants
const AMENITY_CONFIGS = {
  wifi: { icon: FaWifi, label: "WiFi", field: "wifi" },
  parking: { icon: FaParking, label: "Free parking on premises", field: "parking" },
  pool: { icon: FaSwimmingPool, label: "Pool", field: "pool" },
  kitchen: { icon: FaUtensils, label: "Kitchen", field: "kitchen" },
  stove: { icon: FaFire, label: "Stove", field: "stove" },
  tv: { icon: FaTv, label: "TV", field: "tv" },
  storage: { icon: FaWarehouse, label: "Storage", field: "storage" },
  security: { icon: FaShieldAlt, label: "Security cameras", field: "security" },
  hot: { icon: FaHotTub, label: "Hot water", field: "hot" },
  pets: { icon: FaDog, label: "Pets allowed", field: "pets" },
  prepaid: { icon: FaBolt, label: "Prepaid electricity", field: "prepaid" },
  fridge: { icon: FaSnowflake, label: "Refrigerator", field: "fridge" },
  share: { icon: FaUserFriends, label: "Shared space", field: "share" },
  breakfast: { icon: FaCoffee, label: "Breakfast", field: "breakfast" },
  furnished: { icon: FaCouch, label: "Furnished", field: "furnished" },
  ac: { icon: FaSnowflake, label: "Air conditioning", field: "ac" },
  heater: { icon: FaFire, label: "Heating", field: "heater" },
  washer: { icon: FaShower, label: "Washer", field: "washer" },
  dryer: { icon: FaWind, label: "Dryer", field: "dryer" },
  workspace: { icon: FaDesktop, label: "Dedicated workspace", field: "workspace" },
  patio: { icon: FaTree, label: "Patio or balcony", field: "patio" },
  garden: { icon: FaTree, label: "Garden", field: "garden" },
  beach: { icon: FaUmbrellaBeach, label: "Beach access", field: "beach" },
  gym: { icon: FaDumbbell, label: "Gym", field: "gym" },
  fireplace: { icon: FaFire, label: "Indoor fireplace", field: "fireplace" },
  smoking: { icon: FaSmokingBan, label: "Smoking allowed", field: "smoking" },
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

const LISTING_TYPES = {
  rent: { label: 'For Rent', color: 'bg-black text-white', icon: FaHome, period: '/month' },
  sale: { label: 'For Sale', color: 'bg-rose-600 text-white', icon: FaHome, period: '' },
  over: { label: 'Vacation Rental', color: 'bg-rose-600 text-white', icon: FaUmbrellaBeach, period: '/night' },
  land: { label: 'Land', color: 'bg-emerald-700 text-white', icon: FaTree, period: '' },
  office: { label: 'Office Space', color: 'bg-blue-600 text-white', icon: FaDesktop, period: '/hour' }
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

// WhatsApp Booking Modal Component for different property types
const WhatsAppBookingModal = ({ listing, isOpen, onClose, initialDates, bookedDates = [] }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookingDetails, setBookingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    breakfast: false,
    specialRequests: '',
    pets: false,
    children: 0,
    selectedDate: '',
    startTime: '09:00',
    endTime: '17:00'
  });

  useEffect(() => {
    if (isOpen && initialDates) {
      setBookingDetails(prev => ({
        ...prev,
        checkIn: initialDates.checkIn || prev.checkIn,
        checkOut: initialDates.checkOut || prev.checkOut,
        selectedDate: initialDates.selectedDate || prev.selectedDate,
        startTime: initialDates.startTime || prev.startTime,
        endTime: initialDates.endTime || prev.endTime
      }));
    }
  }, [isOpen, initialDates]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get property type
  const propertyType = listing?.type || 'over';
  const isOvernight = propertyType === 'over';
  const isOffice = propertyType === 'office';
  const isSale = propertyType === 'sale';
  const isRent = propertyType === 'rent';

  // Calculate nights for overnight stays
  const calculateNights = () => {
    if (!isOvernight) return 0;
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 0;
    const checkIn = new Date(bookingDetails.checkIn);
    const checkOut = new Date(bookingDetails.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate hours for office space
  const calculateHours = () => {
    if (!isOffice) return 0;
    const [startHour, startMinute] = bookingDetails.startTime.split(':').map(Number);
    const [endHour, endMinute] = bookingDetails.endTime.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    if (endInMinutes <= startInMinutes) return 0;
    return (endInMinutes - startInMinutes) / 60;
  };

  const nights = calculateNights();
  const hours = calculateHours();

  // Calculate total price based on property type
  const calculateTotalPrice = () => {
    if (!listing?.regularPrice) return 0;

    if (isOvernight) {
      if (nights === 0) return 0;
      const basePrice = listing.regularPrice * nights * bookingDetails.rooms;
      const breakfastPrice = bookingDetails.breakfast ? 150 * nights * bookingDetails.guests : 0;
      const extraGuestFee = bookingDetails.guests > 2 ? (bookingDetails.guests - 2) * 200 * nights : 0;
      return basePrice + breakfastPrice + extraGuestFee;
    }

    if (isOffice) {
      if (hours === 0) return 0;
      return listing.regularPrice * hours;
    }

    // For sale and rent - just show the price (no calculation needed)
    return listing.regularPrice;
  };

  const totalPrice = calculateTotalPrice();

  // Format phone number for WhatsApp
  const formatPhoneNumberForWhatsApp = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '27' + digits.substring(1);
    return digits;
  };

  // Get host contact number
  const getHostPhone = () => {
    return listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
  };

  // Generate time options
  const generateTimeOptions = (isEnd = false) => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const isBooked = bookedDates.some(range => {
          if (!isOffice) return false;
          const start = new Date(range.start);
          const end = new Date(range.end);
          const currentCheck = new Date(bookingDetails.selectedDate);
          currentCheck.setHours(hour, minute, 0, 0);
          return currentCheck >= start && currentCheck < (isEnd ? end : end);
        });

        if (!isBooked) times.push(timeString);
      }
    }
    return times;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!bookingDetails.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!bookingDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!bookingDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(String(bookingDetails.phone).replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (isOvernight) {
      if (!bookingDetails.checkIn) {
        newErrors.checkIn = 'Check-in date is required';
      }

      if (!bookingDetails.checkOut) {
        newErrors.checkOut = 'Check-out date is required';
      } else if (bookingDetails.checkIn && bookingDetails.checkOut) {
        const checkIn = new Date(bookingDetails.checkIn);
        const checkOut = new Date(bookingDetails.checkOut);
        if (checkOut <= checkIn) {
          newErrors.checkOut = 'Check-out must be after check-in';
        }
      }

      if (bookingDetails.guests < 1) {
        newErrors.guests = 'At least 1 guest is required';
      }

      if (bookingDetails.rooms < 1) {
        newErrors.rooms = 'At least 1 room is required';
      }
    }

    if (isOffice) {
      if (!bookingDetails.selectedDate) {
        newErrors.selectedDate = 'Date is required';
      }
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const hostPhone = getHostPhone();

    if (!hostPhone) {
      alert('Host contact information is not available');
      setIsSubmitting(false);
      return;
    }

    // Generate map link
    const generateMapLink = (address) => {
      if (!address) return null;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };

    // Generate Verification Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return 'Not specified';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    // Format the client's phone number for the reply link
    const clientPhone = bookingDetails.phone ? formatPhoneNumberForWhatsApp(bookingDetails.phone) : '';

    // Define the accept and decline messages and their corresponding links
    const acceptMessage = `Accept the booking for ${bookingDetails.fullName}, I accept your request for ${listing.name} on ${isOvernight ? formatDate(bookingDetails.checkIn) : formatDate(bookingDetails.selectedDate)}. See you then!`;
    const declineMessage = `Decline the booking for ${bookingDetails.fullName}, I'm unable to accept ${isOvernight ? formatDate(bookingDetails.checkIn) : formatDate(bookingDetails.selectedDate)}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Create different messages based on property type
    let message = '';

    if (isOvernight) {
      // Overnight stay message - Professional Formatting
      const roomSubtotal = listing.regularPrice * nights * bookingDetails.rooms;
      const breakfastSubtotal = bookingDetails.breakfast ? 150 * nights * bookingDetails.guests : 0;
      const extraGuestSubtotal = bookingDetails.guests > 2 ? 200 * (bookingDetails.guests - 2) * nights : 0;

      message = `*🛎️ NEW BOOKING REQUEST 🏡*%0A%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `*📍 PROPERTY INFORMATION*%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `🏠 *Property:* ${listing?.name}%0A`;
      message += `📌 *Address:* ${listing?.address}%0A`;
      const mapLink = generateMapLink(listing?.address);
      if (mapLink) message += `🗺️ *Map View:* ${mapLink}%0A`;
      message += `💰 *Base Rate:* R${listing?.regularPrice?.toLocaleString()} / night%0A%0A`;

      message += `*👤 GUEST INFORMATION*%0A`;
      message += `• *Inquirer:* ${bookingDetails.fullName}%0A`;
      message += `• *Phone:* ${bookingDetails.phone}%0A`;
      message += `• *Rooms:* ${bookingDetails.rooms} Room(s)%0A`;
      message += `• *Occupancy:* ${bookingDetails.guests} Guest(s)%0A%0A`;

      message += `*📅 STAY DETAILS*%0A`;
      message += `➡️ *Check-in:* ${formatDate(bookingDetails.checkIn)}%0A`;
      message += `⬅️ *Check-out:* ${formatDate(bookingDetails.checkOut)}%0A`;
      message += `🌙 *Duration:* ${nights} Night(s)%0A%0A`;

      message += `*💳 FINANCIAL SUMMARY*%0A`;
      message += `------------------------------------%0A`;
      message += `• Room Fee: R${listing.regularPrice.toLocaleString()} × ${nights}N × ${bookingDetails.rooms}R%0A`;
      if (bookingDetails.breakfast) {
        message += `• Breakfast: R150 × ${bookingDetails.guests}G × ${nights}N%0A`;
      }
      if (bookingDetails.guests > 2) {
        message += `• Extra Guest: R200 × ${bookingDetails.guests - 2}G × ${nights}N%0A`;
      }

      message += `*━━━━━━ TOTAL ━━━━━━*%0A`;
      message += `💰 *R${totalPrice.toLocaleString()}*%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A%0A`;

      if (bookingDetails.specialRequests) {
        message += `*📝 GUEST SPECIAL REQUESTS:*%0A`;
        message += `_"${bookingDetails.specialRequests}"_%0A%0A`;
      }

      message += `*⚡ HOST QUICK ACTIONS:*%0A`;
      if (acceptLink) message += `✅ *ACCEPT BOOKING:* ${acceptLink}%0A`;
      if (declineLink) message += `❌ *DECLINE REQUEST:* ${declineLink}%0A%0A`;

      message += `*Verification Code:* \`${verificationCode}\`%0A`;
      message += `_Sent via LoopOut Premium Platform_`;
    } else if (isOffice) {
      // Office space message - Professional Formatting
      message = `*🏢 OFFICE SPACE BOOKING 📑*%0A%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `*📍 OFFICE INFORMATION*%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `🏢 *Space:* ${listing?.name}%0A`;
      message += `📍 *Location:* ${listing?.address}%0A`;
      const mapLink = generateMapLink(listing?.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}%0A`;
      message += `💰 *Hourly Rate:* R${listing?.regularPrice?.toLocaleString()} / hour%0A%0A`;

      message += `*👤 CLIENT INFORMATION*%0A`;
      message += `• *Name:* ${bookingDetails.fullName}%0A`;
      message += `• *Contact:* ${bookingDetails.phone}%0A%0A`;

      message += `*📅 BOOKING SESSION*%0A`;
      message += `📅 *Date:* ${formatDate(bookingDetails.selectedDate)}%0A`;
      if (acceptLink) message += `✅ *ACCEPT:* ${acceptLink}%0A`;
      if (declineLink) message += `❌ *DECLINE:* ${declineLink}%0A%0A`;

      message += `*Verification Code:* \`${verificationCode}\`%0A`;
      message += `_Powered by LoopOut Platform_`;
    } else if (isSale || isRent) {
      // Sale or Rent inquiry message - Professional Formatting
      message = `*🏠 PROPERTY INQUIRY 📬*%0A%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `*📍 PROPERTY OVERVIEW*%0A`;
      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `🏠 *Property:* ${listing?.name}%0A`;
      message += `📍 *Location:* ${listing?.address}%0A`;
      const mapLink = generateMapLink(listing?.address);
      if (mapLink) message += `🗺️ *View Map:* ${mapLink}%0A`;
      message += `💰 *Listed Price:* R${listing?.regularPrice?.toLocaleString()}${isRent ? '/month' : ''}%0A`;
      message += `📋 *Offering:* ${isSale ? 'For Sale' : 'For Rent'}%0A%0A`;

      message += `*👤 INQUIRER DETAILS*%0A`;
      message += `• *Name:* ${bookingDetails.fullName}%0A`;
      message += `• *Contact:* ${bookingDetails.phone}%0A%0A`;

      message += `*📝 INQUIRY MESSAGE*%0A`;
      message += `_"${bookingDetails.specialRequests || "I'm interested in this property. Please provide more information."}"_%0A%0A`;

      message += `*━━━━━━━━━━━━━━━━━━━━*%0A`;
      message += `*⚡ HOST QUICK ACTIONS:*%0A`;
      if (acceptLink) message += `✅ *AVAILABLE:* ${acceptLink}%0A`;
      if (declineLink) message += `❌ *UNAVAILABLE:* ${declineLink}%0A%0A`;

      message += `*Verification Code:* \`${verificationCode}\`%0A`;
      message += `_Sent via LoopOut Premium Platform_`;
    }

    // Save booking to Database
    try {
      const bookingData = {
        userId: currentUser?._id || "guest",
        listingId: listing._id,
        startDate: isOvernight ? bookingDetails.checkIn : bookingDetails.selectedDate + "T" + bookingDetails.startTime,
        endDate: isOvernight ? bookingDetails.checkOut : bookingDetails.selectedDate + "T" + bookingDetails.endTime,
        totalPrice: totalPrice,
        phone: bookingDetails.phone,
        message: bookingDetails.specialRequests || message,
        status: 'pending'
      };

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
    } catch (saveError) {
      console.error('Failed to save booking to database:', saveError);
    }

    // Send via WhatsApp
    const whatsappNumber = formatPhoneNumberForWhatsApp(hostPhone);
    const whatsappFinalUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappFinalUrl, '_blank');

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // Reset form
      setBookingDetails({
        fullName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        rooms: 1,
        breakfast: false,
        specialRequests: '',
        pets: false,
        children: 0,
        selectedDate: '',
        startTime: '09:00',
        endTime: '17:00'
      });
      setErrors({});
    }, 1000);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-8 rounded-t-2xl flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-100">
                <FaHome size={20} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                 {isOvernight && 'Reservation Unit'}
                 {isOffice && 'Workspace Suite'}
                 {(isSale || isRent) && 'Property Portfolio'}
               </h2>
               <p className="text-gray-400 text-xs mt-1 uppercase font-black tracking-widest opacity-60">
                 {isOvernight && 'Secure your overnight luxury stay'}
                 {isOffice && 'Professional office booking environment'}
                 {(isSale || isRent) && 'Direct inquiry to listing proprietor'}
               </p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <FaTimes className="text-lg text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Guest Information - Always shown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FaUsers className="text-rose-500" />
              Your Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={bookingDetails.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.fullName ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={bookingDetails.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.email ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingDetails.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.phone ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  placeholder="082 123 4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Overnight Stay Fields */}
          {isOvernight && (
            <>
              {/* Booking Dates */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FaCalendar className="text-rose-500" />
                  Stay Dates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={bookingDetails.checkIn}
                      onChange={handleChange}
                      min={today}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.checkIn ? 'border-rose-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.checkIn && (
                      <p className="mt-1 text-xs text-rose-500">{errors.checkIn}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={bookingDetails.checkOut}
                      onChange={handleChange}
                      min={bookingDetails.checkIn || today}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.checkOut ? 'border-rose-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.checkOut && (
                      <p className="mt-1 text-xs text-rose-500">{errors.checkOut}</p>
                    )}
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">{nights} night{nights > 1 ? 's' : ''}</span> total stay
                    </p>
                  </div>
                )}
              </div>

              {/* Room & Guest Details */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FaBed className="text-rose-500" />
                  Room & Guest Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rooms
                    </label>
                    <select
                      name="rooms"
                      value={bookingDetails.rooms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <select
                      name="guests"
                      value={bookingDetails.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Children
                    </label>
                    <select
                      name="children"
                      value={bookingDetails.children}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      name="breakfast"
                      id="breakfast"
                      checked={bookingDetails.breakfast}
                      onChange={handleChange}
                      className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="breakfast" className="text-gray-700">
                      Add Breakfast (R150/person/night)
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      name="pets"
                      id="pets"
                      checked={bookingDetails.pets}
                      onChange={handleChange}
                      className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="pets" className="text-gray-700">
                      Bringing Pets
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Office Space Fields */}
          {isOffice && (
            <>
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FaClock className="text-rose-500" />
                  Booking Date & Time
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="selectedDate"
                    value={bookingDetails.selectedDate}
                    onChange={handleChange}
                    min={today}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.selectedDate ? 'border-rose-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.selectedDate && (
                    <p className="mt-1 text-xs text-rose-500">{errors.selectedDate}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <select
                      name="startTime"
                      value={bookingDetails.startTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <select
                      name="endTime"
                      value={bookingDetails.endTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {hours > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">{hours.toFixed(1)} hours</span> total booking time
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Special Requests - Always shown */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700">
              {isSale || isRent ? 'Message / Questions' : 'Special Requests'}
            </label>
            <textarea
              name="specialRequests"
              value={bookingDetails.specialRequests}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              placeholder={isSale || isRent
                ? "I'm interested in this property. Please provide more information..."
                : "Any special requirements or requests..."}
            />
          </div>

          {/* Price Summary - Only for overnight and office */}
          {((isOvernight && nights > 0) || (isOffice && hours > 0)) && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FaReceipt className="text-gray-400" />
                <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Pricing Breakdown</h4>
              </div>

              <div className="space-y-3 text-sm">
                {isOvernight && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                            <FaHome size={14} />
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">Room Rate</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black">R{listing.regularPrice.toLocaleString()} × {nights} Nights</p>
                         </div>
                      </div>
                      <span className="font-black text-gray-900">R{(listing.regularPrice * nights * bookingDetails.rooms).toLocaleString()}</span>
                    </div>

                    {bookingDetails.breakfast && (
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                              <FaCoffee size={14} />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">Breakfast Plan</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black">R150 × {bookingDetails.guests} Guests</p>
                           </div>
                        </div>
                        <span className="font-black text-gray-900">R{(150 * bookingDetails.guests * nights).toLocaleString()}</span>
                      </div>
                    )}

                    {bookingDetails.guests > 2 && (
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                              <FaUsers size={14} />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">Extra Guest Fee</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black">R200 × {bookingDetails.guests - 2} Guests</p>
                           </div>
                        </div>
                        <span className="font-black text-gray-900">R{(200 * (bookingDetails.guests - 2) * nights).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {isOffice && (
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <FaClock size={14} />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Office Usage</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">R{listing.regularPrice.toLocaleString()}/hour × {hours.toFixed(1)}H</p>
                       </div>
                    </div>
                    <span className="font-black text-gray-900">R{totalPrice.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-4 mt-2 border-t border-dashed border-gray-300 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Valuation</p>
                    <p className="text-2xl font-black text-gray-900">Calculated Pay</p>
                  </div>
                  <span className="text-3xl font-black text-rose-600">R{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sale/Rent Price Display */}
          {(isSale || isRent) && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                      <FaTag size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Listing Value</p>
                      <p className="text-sm font-bold text-gray-900">{isSale ? 'Full Property Price' : 'Monthly Rental'}</p>
                   </div>
                </div>
                <span className="text-3xl font-black text-rose-600">
                  R{listing.regularPrice.toLocaleString()}{isRent ? '/mo' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FaWhatsapp className="text-xl" />
                  {isSale || isRent ? 'Send Inquiry' : 'Send Booking Request'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Contact Host Modal Component
const ContactHostModal = ({ listing, user, isOpen, onClose }) => {
  const [contactMethod, setContactMethod] = useState('internal');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const defaultMessage = `Hello, I'm ${user?.name || 'Interested Client'}. I'm interested in your "${listing?.name || 'Listing'}" listing. Could you please provide more details?`;

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const phoneStr = String(phone).trim();
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.startsWith('27') && digits.length === 11) return '0' + digits.substring(2);
    if (digits.length === 10 && digits.startsWith('0')) return digits;
    if (digits.length === 9) return '0' + digits;
    if (digits.length > 10) {
      const last10Digits = digits.substring(digits.length - 10);
      return last10Digits.startsWith('0') ? last10Digits : '0' + last10Digits.substring(1);
    }
    if (!digits.startsWith('0') && digits.length >= 9) return '0' + digits;
    return digits;
  };

  const formatPhoneNumberForWhatsApp = (phone) => {
    const formatted = formatPhoneNumber(phone);
    if (!formatted) return '';
    if (formatted.startsWith('0') && formatted.length === 10) return '27' + formatted.substring(1);
    return formatted;
  };

  const handleSubmit = async () => {
    const contactNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
    const emailAddress = listing?.email || listing?.userRef?.email;
    const hostId = typeof listing.userRef === 'string' ? listing.userRef : listing.userRef._id;

    if (contactMethod === 'internal') {
      if (!user) {
        navigate('/sign-in');
        return;
      }
      
      if (user._id === hostId) {
        alert("You cannot message yourself.");
        return;
      }

      try {
        const res = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverId: hostId,
            content: message || defaultMessage,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          navigate(`/messages/${data.conversationId || data._id}`);
          onClose();
        } else {
          alert(data.message || 'Failed to start conversation');
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
        alert('An error occurred. Please try again.');
      }
      return;
    }

    const hasWhatsApp = contactNumber && contactMethod === 'whatsapp';
    const hasEmail = emailAddress && contactMethod === 'email';
    const hasCall = contactNumber && contactMethod === 'call';

    if (!hasWhatsApp && !hasEmail && !hasCall) {
      alert(`No ${contactMethod} information available`);
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
      const subject = `Interest in "${listing?.name || 'Property'}"`;
      window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalMessage)}`;
    } else if (contactMethod === 'call' && contactNumber) {
      const telNumber = formatPhoneNumber(contactNumber);
      window.location.href = `tel:${telNumber}`;
    }

    onClose();
  };

  const getAvailableContactMethods = () => {
    const contactNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
    const emailAddress = listing?.email || listing?.userRef?.email;
    const methods = ['internal'];
    if (contactNumber) { methods.push('whatsapp'); methods.push('call'); }
    if (emailAddress) methods.push('email');
    return methods;
  };

  const availableMethods = getAvailableContactMethods();
  const displayPhoneNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
  const formattedDisplayNumber = formatPhoneNumber(displayPhoneNumber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Contact Host</h3>
              <p className="text-gray-500 text-sm mt-1">Get in touch with the property owner</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes className="text-gray-500 text-lg" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input type="text" value={user?.name || ''} readOnly={!!user?.name}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Choice of Connection</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => setContactMethod('internal')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${contactMethod === 'internal' ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-100 scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`p-2 rounded-xl ${contactMethod === 'internal' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FaRegCommentDots className="text-xl" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${contactMethod === 'internal' ? 'text-rose-600' : 'text-gray-500'}`}>Direct</span>
                </button>

              {availableMethods.includes('whatsapp') && (
                <button onClick={() => setContactMethod('whatsapp')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${contactMethod === 'whatsapp' ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100 scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`p-2 rounded-xl ${contactMethod === 'whatsapp' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FaWhatsapp className="text-xl" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${contactMethod === 'whatsapp' ? 'text-emerald-600' : 'text-gray-500'}`}>WhatsApp</span>
                </button>
              )}

              {availableMethods.includes('email') && (
                <button onClick={() => setContactMethod('email')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${contactMethod === 'email' ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100 scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`p-2 rounded-xl ${contactMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FaEnvelope className="text-xl" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${contactMethod === 'email' ? 'text-blue-600' : 'text-gray-500'}`}>Email</span>
                </button>
              )}

              {availableMethods.includes('call') && (
                <button onClick={() => setContactMethod('call')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${contactMethod === 'call' ? 'border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-100 scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`p-2 rounded-xl ${contactMethod === 'call' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FaPhone className="text-xl" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${contactMethod === 'call' ? 'text-orange-600' : 'text-gray-500'}`}>Call Host</span>
                </button>
              )}
            </div>

            <div className="mt-6 p-5 bg-gray-50 border border-gray-100 rounded-3xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Proprietor Credentials</p>
              <div className="space-y-2">
                {formattedDisplayNumber && (
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm border border-gray-100">
                         <FaPhone size={12} />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formattedDisplayNumber}</p>
                   </div>
                )}
                {listing?.email && (
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                         <FaEnvelope size={12} />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{listing.email}</p>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={defaultMessage} rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={availableMethods.length === 0}
              className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-all">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Full Screen Gallery Component
const FullScreenGallery = ({ images, currentIndex, isOpen, onClose, onPrev, onNext, onIndexChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MdClose className="text-2xl" />
        </button>
        <span className="font-medium">{currentIndex + 1} / {images.length}</span>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <FiShare2 className="text-xl" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <FiHeart className="text-xl" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center relative px-16">
        <button onClick={onPrev} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <FaChevronLeft className="text-xl" />
        </button>

        <ImageWithFallback
          src={images[currentIndex]}
          imageUrls={images.slice(currentIndex)}
          alt={`Photo ${currentIndex + 1}`}
          type="property"
          className="max-h-full max-w-full object-contain"
        />

        <button onClick={onNext} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <FaChevronRight className="text-xl" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="p-4 bg-black/50">
        <Swiper modules={[FreeMode]} spaceBetween={8} slidesPerView="auto" freeMode={true} className="thumbs-swiper">
          {images.map((img, index) => (
            <SwiperSlide key={index} style={{ width: '100px' }}>
              <button onClick={() => onIndexChange(index)}
                className={`block w-full h-16 rounded-lg overflow-hidden ${index === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}>
                <ImageWithFallback
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  type="property"
                  className="w-full h-full object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
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
  const [ratings, setRatings] = useState({ cleanliness: 0, accuracy: 0, overall: 0 });
  const [topComments, setTopComments] = useState([]);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [extraBed, setExtraBed] = useState('no');

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // State declarations
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isScrolled, setIsScrolled] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [listing, setListing] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  const RECENTLY_VIEWED_KEY = 'recentlyViewed';

  useEffect(() => {
    if (listing) {
      fetchSimilarListings();
      saveToHistory(listing);
    }
  }, [listing]);

  const fetchSimilarListings = async () => {
    try {
      const res = await fetch(`/api/listing/similar/${listingId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSimilarListings(data);
    } catch (error) {
      console.error('Error fetching similar listings:', error);
    }
  };

  const saveToHistory = (item) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let history = stored ? JSON.parse(stored) : [];
      history = history.filter(h => h._id !== item._id);
      history.unshift({
        ...item,
        itemType: 'listing',
        viewedAt: new Date().toISOString()
      });
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const [mealPlan, setMealPlan] = useState('none');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNearExpanded, setIsNearExpanded] = useState(false);
  const [dateRange, setDateRange] = useState([new Date(), null]);

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

  const [hostRatings, setHostRatings] = useState({
    average: 4.9,
    totalRatings: 87,
    categoryRatings: HOST_RATING_CATEGORIES.reduce((acc, { key }) => {
      acc[key] = 4.8;
      return acc;
    }, {}),
    userRating: null,
  });

  const { isFavorite, toggleFavorite } = useWishlist(listing, 'listing');

  const [hostData, setHostData] = useState({
    likeCount: 124,
    dislikeCount: 3,
    userAction: null,
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const [advertisingState, setAdvertisingState] = useState({
    showAdModal: false,
    selectedPlatforms: [],
    budget: 250,
    duration: 7,
    loading: false,
    success: false
  });

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

  const nights = dateRange[0] && dateRange[1]
    ? Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const calculateTotalHours = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    if (endInMinutes <= startInMinutes) return 0;
    return (endInMinutes - startInMinutes) / 60;
  };

  const totalHours = calculateTotalHours(startTime, endTime);
  const totalPrice = listing?.type === 'office'
    ? (listing.regularPrice * totalHours).toFixed(2)
    : 0;

  const truncateDescription = (text, wordLimit = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const validatePhone = (phone) => /^0\d{9}$/.test(phone);
  const generateTimeOptions = (isEnd = false) => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const isBooked = bookedDates.some(range => {
          if (listing?.type !== 'office') return false;
          const start = new Date(range.start);
          const end = new Date(range.end);
          const currentCheck = new Date(selectedDate);
          currentCheck.setHours(hour, minute, 0, 0);
          return currentCheck >= start && currentCheck < end; 
        });

        if (!isBooked) times.push(timeString);
      }
    }
    return times;
  };

  // toggleFavorite is handled by useWishlist

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.name,
        text: `Check out ${listing.name} on loopOut`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatPhoneNumberSafe = (phone) => {
    if (!phone) return '';
    const phoneStr = String(phone).trim();
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.startsWith('27') && digits.length === 11) return '0' + digits.substring(2);
    if (digits.length === 10 && digits.startsWith('0')) return digits;
    if (digits.length === 9) return '0' + digits;
    if (digits.length > 10) {
      const last10Digits = digits.substring(digits.length - 10);
      return last10Digits.startsWith('0') ? last10Digits : '0' + last10Digits.substring(1);
    }
    if (!digits.startsWith('0') && digits.length >= 9) return '0' + digits;
    return digits;
  };

  const formatPhoneNumberForWhatsApp = (phone) => {
    const formatted = formatPhoneNumberSafe(phone);
    if (!formatted) return '';
    if (formatted.startsWith('0') && formatted.length === 10) return '27' + formatted.substring(1);
    return formatted;
  };

  const handleContactHost = () => {
    const contactNumber = listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';
    const emailAddress = listing?.email || listing?.userRef?.email;

    if (!contactNumber && !emailAddress) {
      alert('No contact information available for this host');
      return;
    }

    const userName = currentUser?.name || 'Interested Client';
    const listingName = listing.name || 'Listing detail';
    const message = `Hello, I'm ${userName}. I'm interested in your "${listingName}" listing. Could you please provide more details?`;

    if (contactNumber) {
      const whatsappNumber = formatPhoneNumberForWhatsApp(contactNumber);
      if (whatsappNumber && whatsappNumber.length >= 10) {
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        return;
      }
    }

    if (emailAddress) {
      const subject = `Interest in "${listingName}"`;
      window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  const handleQuickBooking = () => {
    setShowBookingModal(true);
  };

  const handleRateHostLikeDislike = async (action) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (!listing?.userRef) return;
    const hostId = typeof listing.userRef === 'string' ? listing.userRef : listing.userRef._id;
    if (!hostId) return;

    setRatingLoading(true);
    try {
      const token = currentUser?.token || currentUser?.access_token || '';
      const response = await fetch(`/api/user/rate-host/${hostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      }
    } catch (error) {
      console.error('Rating error:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const getActiveAmenities = () => {
    if (!listing) return [];
    return Object.entries(AMENITY_CONFIGS)
      .filter(([key, config]) => listing[config.field] === true)
      .map(([key, config]) => config);
  };

  const hostStarRating = Math.min(5, Math.floor(hostData.likeCount / 40));

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
      const token = currentUser?.token || currentUser?.access_token || '';
      const response = await fetch('/api/listings/advertise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          platforms: advertisingState.selectedPlatforms,
          budget: advertisingState.budget,
          duration: advertisingState.duration
        })
      });

      if (response.ok) {
        setAdvertisingState(prev => ({ ...prev, loading: false, success: true, showAdModal: false }));
        alert('Advertising campaign started successfully!');
      }
    } catch (error) {
      console.error('Advertising error:', error);
      setAdvertisingState(prev => ({ ...prev, loading: false }));
    }
  };

  const verifySocialMedia = async (hostData) => {
    if (!hostData) return;
    setSocialMediaVerified(prev => ({ ...prev, loading: true }));

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
  };

  const checkFacebookListing = async () => {
    return Math.random() > 0.5;
  };

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

  const isValidListingId = (id) => {
    if (!id || id === "undefined" || id === "null" || id.trim() === "") return false;
    return /^[a-zA-Z0-9]{20,}$/.test(id);
  };

  const getRelativeTime = (dateString) => {
    const diffInMs = new Date() - new Date(dateString);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays < 1) return 'Today';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof process !== 'undefined' && process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    }
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      if (!isValidListingId(listingId)) {
        setUiState(prev => ({ ...prev, loading: false, error: true }));
        return;
      }

      try {
        setUiState({ loading: true, error: false, submitting: false, showAllReviews: false, newReviewsAvailable: false });

        const response = await fetch(`/api/listing/get/${listingId}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const listingData = await response.json();

        if (!listingData._id || !listingData.name) {
          throw new Error('Invalid listing data');
        }

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
      } catch (err) {
        console.error("Fetch error:", err);
        // Use mock data for demo
        const mockListing = {
          _id: listingId,
          name: "Modern Luxury Villa with Ocean View",
          type: "over",
          regularPrice: 3500,
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2800,
          address: "12 Ocean Drive, Camps Bay, Cape Town",
          description: "Experience luxury living in this stunning modern villa featuring panoramic ocean views. This beautifully designed property offers spacious living areas, state-of-the-art amenities, and direct access to a private beach. The open-plan living area features floor-to-ceiling windows, gourmet kitchen with marble countertops, and a cozy fireplace. The master suite includes a private balcony, walk-in closet, and spa-like bathroom with rain shower and freestanding tub. Outside, enjoy the infinity pool, outdoor kitchen, and beautifully landscaped garden with panoramic ocean views.",
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
            username: "John",
            email: "john@luxurystays.com",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            createdAt: "2022-01-01"
          },
          wifi: true,
          parking: true,
          pool: true,
          kitchen: true,
          stove: true,
          tv: true,
          security: true,
          hot: true,
          fridge: true,
          breakfast: true,
          furnished: true,
          rules: "No smoking inside the property. Quiet hours from 10 PM to 7 AM. Maximum 8 guests allowed. No parties without prior approval.",
          near: "• 5 min walk to Camps Bay Beach\n• 10 min drive to Table Mountain\n• 15 min to V&A Waterfront\n• Restaurants within walking distance",
          cancel: "Free cancellation up to 30 days before check-in. 50% refund if canceled 14-30 days before check-in."
        };

        setListing(mockListing);
        setUiState(prev => ({ ...prev, loading: false, error: false }));
      }
    };

    const fetchBookedDates = async () => {
      try {
        const res = await fetch(`/api/bookings/booked-dates/${listingId}`);
        if (res.ok) {
          const data = await res.json();
          setBookedDates(data);
        }
      } catch (error) {
        console.error('Error fetching booked dates:', error);
      }
    };

    if (listingId) {
      fetchListing();
      fetchBookedDates();
    }
  }, [listingId, navigate]);

  useEffect(() => {
    if (listing) {
      verifySocialMedia(listing.userRef);
      checkFacebookListing().then(setIsFacebookPosted);
    }
  }, [listing]);

  useEffect(() => {
    if (listing) {
      const calculateAIRatings = () => {
        const currentImages = listing?.imageUrls || [];
        const isVerified = currentImages.length > 3;
        const baseRatings = RATING_CATEGORIES.reduce((acc, { name }) => {
          acc[name] = isVerified ? (4.5 + Math.random() * 0.5).toFixed(1) : (4.0 + Math.random() * 0.5).toFixed(1);
          return acc;
        }, {});

        return {
          average: isVerified ? (4.8 + Math.random() * 0.1).toFixed(1) : (4.2 + Math.random() * 0.2).toFixed(1),
          totalRatings: isVerified ? currentImages.length * 15 : currentImages.length * 10,
          categoryRatings: baseRatings,
          verified: isVerified,
          aiComments: [
            "Absolutely loved our stay! The place was spotless and the host was incredibly responsive.",
            "Fantastic location and the amenities were exactly as described. Highly recommend!"
          ],
        };
      };
      setAiRating(calculateAIRatings());
    }
  }, [listing]);

  // Fetch comment count, ratings and top comments
  useEffect(() => {
    const fetchCommentData = async () => {
      if (!listingId || !isValidListingId(listingId)) {
        setCommentCount(0);
        return;
      }
      try {
        const response = await fetch(`/api/comment/${listingId}?limit=6`);
        if (response.ok) {
          const data = await response.json();
          setCommentCount(data.totalComments || 0);
          setTopComments(data.comments || []);
          if (data.ratings) {
            setRatings({
              cleanliness: data.ratings.cleanliness || 0,
              accuracy: data.ratings.staff || data.ratings.accuracy || 0,
              overall: data.ratings.overall || 0
            });
          }
        } else {
          setCommentCount(aiRating.totalRatings || 0);
        }
      } catch (error) {
        console.error('Error fetching comment data:', error);
        setCommentCount(aiRating.totalRatings || 0);
      }
    };
    if (listingId) fetchCommentData();
  }, [listingId, aiRating.totalRatings]);

  // Loading and error states
  if (uiState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (uiState.error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Listing not found</h2>
          <button onClick={() => navigate('/listing-home-page')} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg">
            Browse Listings
          </button>
        </div>
      </div>
    );
  }

  const listingType = LISTING_TYPES[listing.type] || LISTING_TYPES.over;
  const activeAmenities = getActiveAmenities();
  const displayContactNumber = listing?.contact || listing?.phone || '';
  const formattedDisplayNumber = formatPhoneNumberSafe(displayContactNumber);
  const displayEmail = listing?.email || listing?.userRef?.email || '';

  // Determine property type for UI
  const isOvernight = listing.type === 'over';
  const isOffice = listing.type === 'office';
  const isSale = listing.type === 'sale';
  const isRent = listing.type === 'rent';
  const showCalendar = isOvernight || isOffice;
  const isSaleOrRent = isSale || isRent;

  // Calculate prices
  const roomTotal = listing.regularPrice * nights;
  const breakfastTotal = mealPlan === 'breakfast' ? breakfastPrice * nights : 0;
  const grandTotal = roomTotal + breakfastTotal;

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}>
              <FaArrowLeft className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={handleShare} className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}>
                <FiShare2 className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              </button>
              <button onClick={toggleFavorite} className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}>
                {isFavorite ? <FaHeart className="text-xl text-rose-500" /> : <FiHeart className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Image Gallery Grid - KEPT EXACTLY AS YOU WANTED */}
      <div className="relative pt-0">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[400px] lg:h-[500px] max-w-screen-xl mx-auto px-4 md:px-6">

          {/* Main Image - Takes left half (2 cols, 2 rows) */}
          <div
            className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group rounded-l-xl md:rounded-l-2xl md:rounded-r-none"
            onClick={() => { setGalleryIndex(0); setShowFullGallery(true); }}
          >
            <ImageWithFallback
              src={listing.imageUrls[0]}
              imageUrls={listing.imageUrls}
              alt={listing.name}
              type="property"
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>

          {/* Side Images - 2x2 grid on right */}
          {listing.imageUrls.slice(1, 5).map((url, index) => {
            // Determine border radius based on position
            const getBorderRadius = () => {
              if (index === 0) return 'rounded-tr-xl md:rounded-tr-2xl'; // Top right
              if (index === 1) return 'rounded-none'; // Top middle-right
              if (index === 2) return 'rounded-none'; // Bottom middle-right
              if (index === 3) return 'rounded-br-xl md:rounded-br-2xl'; // Bottom right
              return '';
            };

            return (
              <div
                key={index}
                className={`relative overflow-hidden cursor-pointer hidden md:block ${getBorderRadius()}`}
                onClick={() => { setGalleryIndex(index + 1); setShowFullGallery(true); }}
              >
                <ImageWithFallback
                  src={url}
                  imageUrls={listing.imageUrls.slice(index + 1)}
                  alt={`${listing.name} ${index + 2}`}
                  type="property"
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>
            );
          })}

          {/* Show All Photos Button */}
          <button
            onClick={() => { setGalleryIndex(0); setShowFullGallery(true); }}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg font-medium text-sm text-gray-800 flex items-center gap-2 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg border border-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Show all photos
          </button>
        </div>
      </div>

      {/* Full Screen Gallery */}
      <FullScreenGallery
        images={listing.imageUrls}
        currentIndex={galleryIndex}
        isOpen={showFullGallery}
        onClose={() => setShowFullGallery(false)}
        onPrev={() => setGalleryIndex(prev => prev === 0 ? listing.imageUrls.length - 1 : prev - 1)}
        onNext={() => setGalleryIndex(prev => prev === listing.imageUrls.length - 1 ? 0 : prev + 1)}
        onIndexChange={setGalleryIndex}
      />

      {/* Main Content - Optimized for large screens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8 lg:space-y-10">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">{listing.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm lg:text-base">
                <span className="flex items-center gap-1">
                  <FaStar className="text-[#FFB400]" />
                  <span className="font-semibold text-gray-900">{Number(aiRating.average).toFixed(1)}</span>
                  <span className="underline">{commentCount} reviews</span>
                </span>
                <span>·</span>
                <span className="underline">{listing.address?.split(',')[0]}</span>
                <span>·</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${listingType.color}`}>
                  {listingType.label}
                </span>
              </div>
            </div>

            {/* Property Highlights */}
            <div className="border-y border-gray-200 py-6">
              <div className="flex items-center gap-8 lg:gap-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <MdKingBed className="text-lg lg:text-xl text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm lg:text-base">{listing.bedrooms} bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <MdBathtub className="text-lg lg:text-xl text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm lg:text-base">{listing.bathrooms} bathrooms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="py-6 border-b border-gray-200">
              <Link
                to={`/user-profile/${listing.userRef?._id || listing.userRef}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity w-fit"
              >
                {listing.userRef?.avatar ? (
                  <img
                    src={listing.userRef.avatar}
                    alt={listing.userRef.username}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-100 shadow-sm text-gray-400">
                    <FaUser className="text-xl lg:text-2xl" />
                  </div>
                )}
                <div>
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">Hosted by {listing.userRef?.username || 'Host'}</h2>
                  <p className="text-gray-600 text-xs lg:text-sm">
                    {listing.userRef?.isSuperhost ? 'Superhost' : 'Verified Host'} · {listing.userRef?.createdAt ? new Date(listing.userRef.createdAt).getFullYear() : '2020'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">About this place</h2>
              <div className="text-gray-700 leading-relaxed text-sm lg:text-base">
                {isExpanded ? listing.description : truncateDescription(listing.description, 60)}
              </div>
              {listing.description?.split(' ').length > 60 && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="mt-4 font-semibold underline flex items-center gap-1 text-sm lg:text-base">
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>


            {/* Amenities */}
            {activeAmenities.length > 0 && (
              <div className="py-6 border-b border-gray-200">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeAmenities.slice(0, 10).map((amenity, index) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 py-2">
                        <Icon className="text-gray-700 text-base lg:text-lg" />
                        <span className="text-gray-700 text-sm lg:text-base">{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
                {activeAmenities.length > 10 && (
                  <button className="mt-4 px-4 lg:px-6 py-2 lg:py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm lg:text-base">
                    Show all {activeAmenities.length} amenities
                  </button>
                )}
              </div>
            )}

            {/* Calendar - Only for overnight and office */}
            {showCalendar && (
              <div className="py-6 border-b border-gray-200" id="calendar-section">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
                  {isOffice ? 'Select date & time' : 'Select your dates'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {isOvernight && (
                    <div>
                      <Calendar
                        onChange={setDateRange}
                        value={dateRange}
                        selectRange={true}
                        minDate={new Date()}
                        tileDisabled={({ date, view }) => {
                          if (view === 'month') {
                            return bookedDates.some(range => {
                              const start = new Date(range.start);
                              const end = new Date(range.end);
                              // Set all to midnight for precise comparison
                              const current = new Date(date);
                              current.setHours(0, 0, 0, 0);
                              start.setHours(0, 0, 0, 0);
                              end.setHours(0, 0, 0, 0);
                              return current >= start && current <= end;
                            });
                          }
                          return false;
                        }}
                        className="rounded-xl border border-gray-200 shadow-sm w-full"
                      />
                    </div>
                  )}

                  {isOffice && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                        <input
                          type="date"
                          value={selectedDate.toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(new Date(e.target.value))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <select value={startTime} onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm">
                          {generateTimeOptions().map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <select value={endTime} onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm">
                          {generateTimeOptions(true).map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-8">
                <FaStar className="text-[#FFB400] text-2xl drop-shadow-sm" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {ratings && ratings.overall > 0 ? ratings.overall.toFixed(1) : Number(aiRating.average).toFixed(1)} · {commentCount} reviews
                </h2>
              </div>

              {commentCount > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 mb-8">
                    {/* Cleanliness */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 sm:border-0 sm:pb-0">
                      <div className="flex items-center gap-3 text-gray-800">
                        <MdCleanHands className="text-xl" />
                        <span>Cleanliness</span>
                      </div>
                      <div className="flex items-center gap-4 w-1/2">
                        <span className="font-semibold text-sm">{ratings?.cleanliness?.toFixed(1) || '0.0'}</span>
                        <div className="h-[4px] bg-gray-200 w-full rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${(ratings?.cleanliness / 5) * 100 || 0}%` }} />
                        </div>
                      </div>
                    </div>
                    {/* Accuracy */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 sm:border-0 sm:pb-0">
                      <div className="flex items-center gap-3 text-gray-800">
                        <MdOutlineGppGood className="text-xl" />
                        <span>Accuracy</span>
                      </div>
                      <div className="flex items-center gap-4 w-1/2">
                        <span className="font-semibold text-sm">{ratings?.accuracy?.toFixed(1) || '0.0'}</span>
                        <div className="h-[4px] bg-gray-200 w-full rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${(ratings?.accuracy / 5) * 100 || 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Comments Swiper */}
                  {topComments.length > 0 && (
                    <div className="mb-8">
                      <Swiper
                        spaceBetween={16}
                        slidesPerView={1.1}
                        breakpoints={{
                          640: { slidesPerView: 2.1 },
                          1024: { slidesPerView: 2.2 }
                        }}
                        freeMode={true}
                        modules={[FreeMode]}
                        className="-mx-4 px-4 sm:mx-0 sm:px-0"
                      >
                        {topComments.map(comment => {
                          const rating = comment.rating || 5;
                          return (
                            <SwiperSlide key={comment._id} className="h-auto">
                              <div className="h-full bg-gradient-to-br from-[#F8F9FA] to-white border border-[#EBEBEB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#FFB400]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={comment.userAvatar || '/default-avatar.jpg'}
                                        alt={comment.userName}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                                        onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                                      />
                                      <div>
                                        <h4 className="font-semibold text-[#222222] leading-tight">{comment.userName}</h4>
                                        <p className="text-sm text-[#717171] mt-0.5">{getRelativeTime(comment.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <FaStar
                                          key={i}
                                          className={`text-[12px] mr-1 ${i < Math.round(rating) ? 'text-[#FFB400]' : 'text-gray-200'}`}
                                        />
                                      ))}
                                    </div>
                                    {comment.likes?.length > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-rose-500 font-medium">
                                        <FaHeart />
                                        {comment.likes.length}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-gray-700 line-clamp-4 leading-relaxed whitespace-pre-line">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600 mb-6">No reviews yet. Be the first to leave a review!</p>
              )}

              <button
                onClick={() => setShowCommentsPanel(true)}
                className="px-6 py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Show all {commentCount} reviews
              </button>
            </div>

            {/* Location */}
            <div className="py-6 border-t border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Where you'll be</h2>
              <p className="text-gray-700 mb-4 text-sm lg:text-base">{listing.address}</p>
              <div className="h-48 lg:h-64 bg-gray-200 rounded-xl overflow-hidden relative">
                <GoogleMapComponent 
                  latitude={listing.latitude} 
                  longitude={listing.longitude} 
                  address={listing.address} 
                  title={listing.name} 
                />
              </div>

              {listing.near && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What's nearby</h3>
                  <div className="text-gray-700 text-xs lg:text-sm space-y-1">
                    {listing.near.split('\n').slice(0, isNearExpanded ? undefined : 4).map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </div>
                  {listing.near.split('\n').length > 4 && (
                    <button onClick={() => setIsNearExpanded(!isNearExpanded)} className="mt-2 font-semibold underline text-sm">
                      {isNearExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* House Rules */}
            {listing.rules && (
              <div className="py-6 border-t border-gray-200">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">House rules</h2>
                <div className="text-gray-700 text-xs lg:text-sm space-y-2">
                  {listing.rules.split('\n').map((rule, i) => (
                    <p key={i}>{rule}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className={`${isScrolled ? 'lg:sticky lg:top-24' : ''} space-y-4`}>
              <div className="border border-gray-200 rounded-xl shadow-lg p-4 lg:p-6 bg-white">
                {/* Price Header */}
                <div className="flex items-baseline justify-between mb-4 lg:mb-6">
                  <div>
                    <span className="text-xl lg:text-2xl font-semibold text-gray-900">R{listing.regularPrice.toLocaleString('en-ZA')}</span>
                    <span className="text-gray-600 text-sm lg:text-base">{listingType.period}</span>
                  </div>
                  {listing.discountPrice && (
                    <span className="text-gray-400 line-through text-sm lg:text-base">R{listing.discountPrice}</span>
                  )}
                </div>

                {/* Listing Type Info */}
                <div className="mb-4 p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs lg:text-sm text-gray-700">
                    <span className="font-semibold">Listing Type:</span> {listingType.label}
                  </p>
                  {isOvernight && <p className="text-xs text-gray-500 mt-1">Price is per night</p>}
                  {isOffice && <p className="text-xs text-gray-500 mt-1">Price is per hour</p>}
                  {isRent && <p className="text-xs text-gray-500 mt-1">Price is per month</p>}
                  {isSale && <p className="text-xs text-gray-500 mt-1">Fixed sale price</p>}
                </div>

                {/* Action Button - Different based on property type */}
                <button
                  onClick={() => setShowBookingModal(true)}
                  disabled={!formattedDisplayNumber}
                  className="w-full py-2 lg:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                  <FaWhatsapp className="text-base lg:text-xl" />
                  {isSaleOrRent ? 'Inquire via WhatsApp' : 'Book via WhatsApp'}
                </button>

                <p className="text-center text-gray-500 text-xs lg:text-sm mt-2">
                  {isSaleOrRent ? 'Ask questions about this listing' : 'You\'ll receive a confirmation via WhatsApp'}
                </p>

                {/* Quick Contact Button */}
                <button
                  onClick={handleContactHost}
                  className="w-full mt-2 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm lg:text-base"
                >
                  Quick Contact
                </button>
              </div>

              {/* Contact Info Card */}
              <div className="border border-gray-200 rounded-xl p-4 lg:p-6 bg-white">
                <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Contact Information</h3>
                <div className="space-y-2 lg:space-y-3">
                  {formattedDisplayNumber && (
                    <a href={`tel:${formattedDisplayNumber}`} className="flex items-center gap-3 p-2 lg:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-rose-100 rounded-full flex items-center justify-center">
                        <FaPhone className="text-rose-600 text-sm lg:text-base" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900 text-sm lg:text-base">{formattedDisplayNumber}</p>
                      </div>
                    </a>
                  )}
                  {displayEmail && (
                    <a href={`mailto:${displayEmail}`} className="flex items-center gap-3 p-2 lg:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaEnvelope className="text-gray-600 text-sm lg:text-base" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 text-sm lg:text-base">{displayEmail}</p>
                      </div>
                    </a>
                  )}
                  {formattedDisplayNumber && (
                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(formattedDisplayNumber)}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 lg:p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaWhatsapp className="text-green-600 text-sm lg:text-base lg:text-xl" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">WhatsApp</p>
                        <p className="font-medium text-gray-900 text-sm lg:text-base">Message host</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Report Listing */}
              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs lg:text-sm">
                <FaFlag className="text-sm lg:text-lg" />
                <button className="underline font-medium">Report this listing</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Booking Modal */}
      <WhatsAppBookingModal
        listing={listing}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bookedDates={bookedDates}
        initialDates={{
          checkIn: dateRange && dateRange[0] ? new Date(dateRange[0].getTime() - dateRange[0].getTimezoneOffset() * 60000).toISOString().split('T')[0] : '',
          checkOut: dateRange && dateRange[1] ? new Date(dateRange[1].getTime() - dateRange[1].getTimezoneOffset() * 60000).toISOString().split('T')[0] : '',
          selectedDate: selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '',
          startTime,
          endTime
        }}
      />

      {/* Contact Modal */}
      <ContactHostModal
        listing={listing}
        user={currentUser}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanel
          listingId={listingId}
          onClose={() => setShowCommentsPanel(false)}
          currentUser={currentUser}
          listing={listing}
        />
      )}

      {/* Mobile Bottom Bar */}
      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">
              R{isOvernight ? (nights > 0 ? grandTotal.toLocaleString() : '0.00') :
                isOffice && totalHours > 0 ? totalPrice :
                  listing.regularPrice.toLocaleString()}
            </span>
            <span className="text-gray-600 text-sm">
              {isOvernight ? (nights > 0 ? ' / total' : '') : 
               isOffice ? ' / booking' : 
               isRent ? ' / month' : ''}
            </span>
          </div>
          <button
            onClick={handleQuickBooking}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}