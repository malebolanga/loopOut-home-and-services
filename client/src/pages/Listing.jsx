/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom, Thumbs, Pagination, FreeMode } from "swiper/modules";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";

import Calendar from "react-calendar";
import CommentsSidePanel from '../components/CommentsSidePanel';
import ImageWithFallback from '../components/ImageWithFallback';
import MutualFriends from '../components/MutualFriends';
import OperatingSchedule from '../components/OperatingSchedule';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { useWishlist } from '../hooks/useWishlist';
import BookingHistory from '../components/BookingHistory';


import { HeartIcon, ShareIcon, StarIcon, MapPinIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, FlagIcon, UserIcon, CameraIcon, Squares2X2Icon, ArrowLeftIcon, PhotoIcon, UserGroupIcon, CalendarIcon, CalendarDaysIcon, ClockIcon, HomeModernIcon, TagIcon, ArrowPathIcon, TicketIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { FiShare2, FiHeart, FiMessageSquare } from "react-icons/fi";

// Amenity & config icons (domain-specific, no Heroicons equivalent)
import {
  FaWifi, FaParking, FaSwimmingPool, FaUtensils, FaFire, FaTv, FaWarehouse,
  FaShieldAlt, FaHotTub, FaDog, FaBolt, FaSnowflake, FaUserFriends, FaCoffee,
  FaCouch, FaShower, FaWind, FaDesktop, FaTree, FaUmbrellaBeach, FaDumbbell,
  FaSmokingBan, FaHome, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaTiktok, FaGlobe,
  FaHeart, FaWhatsapp, FaUsers, FaClock, FaReceipt, FaSpinner, FaBed, FaBath, FaChevronLeft, FaChevronRight, FaHotel
} from "react-icons/fa";
import { MdCleanHands, MdOutlineGppGood, MdLogin, MdChat, MdLocationOn, MdAttachMoney, MdKingBed, MdBathtub, MdClose } from "react-icons/md";
import NeuralLoader from "../components/NeuralLoader";


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
  sale: { label: 'Hotel', color: 'bg-rose-600 text-white', icon: FaHotel, period: '/night' },
  over: { label: 'Vacation Rental', color: 'bg-rose-600 text-white', icon: FaUmbrellaBeach, period: '/night' },
  land: { label: 'Self Catering', color: 'bg-emerald-700 text-white', icon: FaHome, period: '/night' },
  office: { label: 'Resort', color: 'bg-blue-600 text-white', icon: FaUmbrellaBeach, period: '/day' }
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
    childGuests: 0,
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
  const isOvernight = propertyType === 'over' || propertyType === 'sale' || propertyType === 'land';
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
      message = `*✨ NEW RESERVATION REQUEST ✨*%0A%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*🏨 PROPERTY INFORMATION*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `🏠 *Property:* ${listing?.name}%0A`;
      message += `📌 *Address:* ${listing?.address}%0A`;
      const mapLink = generateMapLink(listing?.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}%0A`;
      message += `💰 *Base Rate:* R${listing?.regularPrice?.toLocaleString()} / night%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*👤 GUEST DETAILS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `👤 *Name:* ${bookingDetails.fullName}%0A`;
      message += `📞 *Phone:* ${bookingDetails.phone}%0A`;
      message += `👥 *Occupancy:* ${bookingDetails.guests} Guest(s)%0A`;
      message += `🛏️ *Rooms:* ${bookingDetails.rooms} Room(s)%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*📅 STAY DETAILS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `➡️ *Check-in:* ${formatDate(bookingDetails.checkIn)}%0A`;
      message += `⬅️ *Check-out:* ${formatDate(bookingDetails.checkOut)}%0A`;
      message += `🌙 *Duration:* ${nights} Night(s)%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*💳 FINANCIAL SUMMARY*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `• Room Fee: R${listing.regularPrice.toLocaleString()} × ${nights}N%0A`;
      if (bookingDetails.breakfast) message += `• Breakfast: R150 × ${bookingDetails.guests}G × ${nights}N%0A`;
      if (bookingDetails.guests > 2) message += `• Extra Guest: R200 × ${bookingDetails.guests - 2}G × ${nights}N%0A`;
      message += `💵 *TOTAL: R${totalPrice.toLocaleString()}*%0A%0A`;

      if (bookingDetails.specialRequests) {
        message += `━━━━━━━━━━━━━━━━━━━━%0A`;
        message += `*📝 GUEST NOTES*%0A`;
        message += `━━━━━━━━━━━━━━━━━━━━%0A`;
        message += `_"${bookingDetails.specialRequests}"_%0A%0A`;
      }

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*⚡ QUICK ACTIONS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      if (acceptLink) message += `✅ *ACCEPT:*%0A${acceptLink}%0A%0A`;
      if (declineLink) message += `❌ *REJECT:*%0A${declineLink}%0A%0A`;

      message += `🔐 *Verification Code:* \`${verificationCode}\`%0A`;
      message += `_Sent via loopOut_`;
    } else if (isOffice) {
      // Office space message - Professional Formatting
      message = `*🏢 RESORT BOOKING 🏖️*%0A%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*📍 RESORT DETAILS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `🏢 *Space:* ${listing?.name}%0A`;
      message += `📍 *Location:* ${listing?.address}%0A`;
      const mapLink = generateMapLink(listing?.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}%0A`;
      message += `💰 *Rate:* R${listing?.regularPrice?.toLocaleString()} / day%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*👤 CLIENT DETAILS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `👤 *Name:* ${bookingDetails.fullName}%0A`;
      message += `📞 *Phone:* ${bookingDetails.phone}%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*📅 SESSION DETAILS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `📅 *Date:* ${formatDate(bookingDetails.selectedDate)}%0A`;
      message += `⏰ *Time:* ${bookingDetails.startTime} - ${bookingDetails.endTime}%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*⚡ QUICK ACTIONS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      if (acceptLink) message += `✅ *ACCEPT:*%0A${acceptLink}%0A%0A`;
      if (declineLink) message += `❌ *REJECT:*%0A${declineLink}%0A%0A`;

      message += `🔐 *Verification Code:* \`${verificationCode}\`%0A`;
      message += `_Sent via loopOut_`;
    } else if (isSale || isRent) {
      // Sale or Rent inquiry message - Professional Formatting
      message = `*🏠 PROPERTY INQUIRY 🏠*%0A%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*📍 PROPERTY OVERVIEW*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `🏠 *Property:* ${listing?.name}%0A`;
      message += `📍 *Location:* ${listing?.address}%0A`;
      const mapLink = generateMapLink(listing?.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}%0A`;
      message += `💰 *Rate:* R${listing?.regularPrice?.toLocaleString()}${isRent ? '/month' : ''}%0A`;
      message += `📋 *Type:* ${isSale ? 'For Sale' : 'For Rent'}%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*👤 CLIENT DETAILS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `👤 *Name:* ${bookingDetails.fullName}%0A`;
      message += `📞 *Phone:* ${bookingDetails.phone}%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*📝 MESSAGE*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `_"${bookingDetails.specialRequests || "I'm interested in this property. Please provide more information."}"_%0A%0A`;

      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*⚡ QUICK ACTIONS*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      if (acceptLink) message += `✅ *ACCEPT:*%0A${acceptLink}%0A%0A`;
      if (declineLink) message += `❌ *REJECT:*%0A${declineLink}%0A%0A`;

      message += `🔐 *Verification Code:* \`${verificationCode}\`%0A`;
      message += `_Sent via loopOut_`;
    }

    // Save booking to Database
    try {
      // Determine device type
      const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
      const requestLocation = listing?.address || '';

      const bookingData = {
        userId: currentUser?._id || "guest",
        listingId: listing._id,
        startDate: isOvernight ? bookingDetails.checkIn : bookingDetails.selectedDate + "T" + bookingDetails.startTime,
        endDate: isOvernight ? bookingDetails.checkOut : bookingDetails.selectedDate + "T" + bookingDetails.endTime,
        totalPrice: totalPrice,
        phone: bookingDetails.phone,
        message: bookingDetails.specialRequests || message,
        deviceType,
        requestLocation,
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
        childGuests: 0,
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
        <div className="sticky top-0 bg-slate-50 border-b border-gray-100 p-8 rounded-t-2xl flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-100">
                <FaHome size={20} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                 {isOvernight && 'Reservation Unit'}
                 {isOffice && 'Resort Suite'}
                 {(isSale || isRent) && 'Property Portfolio'}
               </h2>
               <p className="text-gray-400 text-xs mt-1 uppercase font-black tracking-widest opacity-60">
                 {isOvernight && 'Secure your overnight luxury stay'}
                 {isOffice && 'Secure your resort vacation experience'}
                 {(isSale || isRent) && 'Direct inquiry to listing proprietor'}
               </p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-10 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          
          {/* Left Column: Input Fields */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Guest Information - Always shown */}
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <UserGroupIcon className="w-6 h-6 text-rose-500" />
                Guest Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={bookingDetails.fullName}
                      onChange={handleChange}
                      className={`peer w-full px-4 py-4 border rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-transparent bg-white transition-colors ${errors.fullName ? 'border-rose-500' : 'border-gray-300'}`}
                      placeholder="John Doe"
                    />
                    <label htmlFor="fullName" className={`absolute left-4 -top-2.5 bg-white px-1 text-xs transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs font-semibold ${errors.fullName ? 'text-rose-500' : 'text-gray-500 peer-focus:text-rose-500'}`}>
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  {errors.fullName && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.fullName}</p>}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={bookingDetails.email}
                      onChange={handleChange}
                      className={`peer w-full px-4 py-4 border rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-transparent bg-white transition-colors ${errors.email ? 'border-rose-500' : 'border-gray-300'}`}
                      placeholder="john@example.com"
                    />
                    <label htmlFor="email" className={`absolute left-4 -top-2.5 bg-white px-1 text-xs transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs font-semibold ${errors.email ? 'text-rose-500' : 'text-gray-500 peer-focus:text-rose-500'}`}>
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email}</p>}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingDetails.phone}
                      onChange={handleChange}
                      className={`peer w-full px-4 py-4 border rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-transparent bg-white transition-colors ${errors.phone ? 'border-rose-500' : 'border-gray-300'}`}
                      placeholder="082 123 4567"
                    />
                    <label htmlFor="phone" className={`absolute left-4 -top-2.5 bg-white px-1 text-xs transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs font-semibold ${errors.phone ? 'text-rose-500' : 'text-gray-500 peer-focus:text-rose-500'}`}>
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  {errors.phone && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.phone}</p>}
                </div>
              </div>
            </div>

          {/* Overnight Stay Fields */}
          {isOvernight && (
            <>
              {/* Booking Dates */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <CalendarIcon className="w-6 h-6 text-rose-500" />
                  Reservation Dates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="relative">
                      <input
                        type="date"
                        id="checkIn"
                        name="checkIn"
                        value={bookingDetails.checkIn}
                        onChange={handleChange}
                        min={today}
                        className={`peer w-full px-4 py-4 border rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white transition-colors ${errors.checkIn ? 'border-rose-500' : 'border-gray-300'}`}
                      />
                      <label htmlFor="checkIn" className={`absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold ${errors.checkIn ? 'text-rose-500' : 'text-gray-500 peer-focus:text-rose-500'}`}>
                        Check-in Date <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    {errors.checkIn && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.checkIn}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type="date"
                        id="checkOut"
                        name="checkOut"
                        value={bookingDetails.checkOut}
                        onChange={handleChange}
                        min={bookingDetails.checkIn || today}
                        className={`peer w-full px-4 py-4 border rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white transition-colors ${errors.checkOut ? 'border-rose-500' : 'border-gray-300'}`}
                      />
                      <label htmlFor="checkOut" className={`absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold ${errors.checkOut ? 'text-rose-500' : 'text-gray-500 peer-focus:text-rose-500'}`}>
                        Check-out Date <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    {errors.checkOut && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.checkOut}</p>}
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-rose-900 font-medium">
                      You are booking for <span className="font-bold">{nights} night{nights > 1 ? 's' : ''}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Room & Guest Details */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <HomeModernIcon className="w-6 h-6 text-rose-500" />
                  Accommodations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="relative">
                    <select
                      id="rooms"
                      name="rooms"
                      value={bookingDetails.rooms}
                      onChange={handleChange}
                      className="peer w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white appearance-none"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                      ))}
                    </select>
                    <label htmlFor="rooms" className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 peer-focus:text-rose-500">
                      Rooms
                    </label>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      id="guests"
                      name="guests"
                      value={bookingDetails.guests}
                      onChange={handleChange}
                      className="peer w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                    <label htmlFor="guests" className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 peer-focus:text-rose-500">
                      Guests
                    </label>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      id="childGuests"
                      name="childGuests"
                      value={bookingDetails.childGuests}
                      onChange={handleChange}
                      className="peer w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white appearance-none"
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                      ))}
                    </select>
                    <label htmlFor="childGuests" className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 peer-focus:text-rose-500">
                      Children
                    </label>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => document.getElementById('breakfast').click()}
                  >
                    <input
                      type="checkbox"
                      name="breakfast"
                      id="breakfast"
                      checked={bookingDetails.breakfast}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="breakfast" className="text-sm font-semibold text-gray-900 block cursor-pointer group-hover:text-rose-600 transition-colors">
                        Add Breakfast
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">R150/person per night</p>
                    </div>
                  </div>

                  <div 
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => document.getElementById('pets').click()}
                  >
                    <input
                      type="checkbox"
                      name="pets"
                      id="pets"
                      checked={bookingDetails.pets}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="pets" className="text-sm font-semibold text-gray-900 block cursor-pointer group-hover:text-rose-600 transition-colors">
                        Bringing Pets
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">Subject to host approval</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Resort Fields */}
          {isOffice && (
            <>
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <ClockIcon className="w-6 h-6 text-rose-500" />
                  Session Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <div className="relative">
                      <input
                        type="date"
                        id="selectedDate"
                        name="selectedDate"
                        value={bookingDetails.selectedDate}
                        onChange={handleChange}
                        min={today}
                        className={`peer w-full px-4 py-4 border rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white transition-colors ${errors.selectedDate ? 'border-rose-500' : 'border-gray-300'}`}
                      />
                      <label htmlFor="selectedDate" className={`absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold ${errors.selectedDate ? 'text-rose-500' : 'text-gray-500 peer-focus:text-rose-500'}`}>
                        Select Date <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    {errors.selectedDate && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.selectedDate}</p>}
                  </div>

                  <div className="relative">
                    <select
                      id="startTime"
                      name="startTime"
                      value={bookingDetails.startTime}
                      onChange={handleChange}
                      className="peer w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white appearance-none"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <label htmlFor="startTime" className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 peer-focus:text-rose-500">
                      Start Time
                    </label>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      id="endTime"
                      name="endTime"
                      value={bookingDetails.endTime}
                      onChange={handleChange}
                      className="peer w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white appearance-none"
                    >
                      {generateTimeOptions(true).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <label htmlFor="endTime" className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 peer-focus:text-rose-500">
                      End Time
                    </label>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {hours > 0 && (
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                      <ClockIcon className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-rose-900 font-medium">
                      You are booking for <span className="font-bold">{hours.toFixed(1)} hours</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Special Requests */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="relative">
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={bookingDetails.specialRequests}
                onChange={handleChange}
                rows="3"
                className="peer w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white resize-none placeholder-transparent"
                placeholder={isSale || isRent ? "I'm interested in this property..." : "Any special requirements..."}
              />
              <label htmlFor="specialRequests" className="absolute left-4 -top-2.5 bg-white px-1 text-xs transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs font-semibold text-gray-500 peer-focus:text-rose-500">
                {isSale || isRent ? 'Message / Questions' : 'Special Requests'}
              </label>
            </div>
          </div>

          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-0 space-y-6">
              
              {/* Price Summary - Only for overnight and office */}
              {((isOvernight && nights > 0) || (isOffice && hours > 0)) && (
                <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <TicketIcon className="w-4 h-4 text-gray-400" />
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
                      <TagIcon className="w-5 h-5" />
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
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaWhatsapp className="text-2xl" />
                  {isSale || isRent ? 'Request Info via WhatsApp' : 'Reserve via WhatsApp'}
                </>
              )}
            </button>
            <p className="text-center text-xs font-medium text-gray-500 mt-4">You won't be charged yet</p>
          </div>
            </div>
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

            <div className="mt-6 p-5 bg-slate-50/50 border border-slate-200/50 rounded-3xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Proprietor Credentials</p>
              <div className="space-y-2">
                {formattedDisplayNumber && (
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm border border-slate-200/50">
                         <PhoneIcon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formattedDisplayNumber}</p>
                   </div>
                )}
                {listing?.email && (
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-200/50">
                         <EnvelopeIcon className="w-4 h-4" />
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
  const [bookingSummary, setBookingSummary] = useState({ count: 0, recentBookers: [] });

  const RECENTLY_VIEWED_KEY = 'recentlyViewed';

  useEffect(() => {
    if (listing) {
      fetchSimilarListings();
      fetchBookingSummary();
      saveToHistory(listing);
    }
  }, [listing]);

  const fetchBookingSummary = async () => {
    try {
      const res = await fetch(`/api/bookings/listing-summary/${listing._id}`);
      if (res.ok) {
        const data = await res.json();
        setBookingSummary(data);
      }
    } catch (error) {
      console.error('Error fetching booking summary:', error);
    }
  };

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

  
  const handleEscrowCheckout = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in';
      return;
    }
    try {
      setIsContacting(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           userId: currentUser._id,
           amount: listing.regularPrice, // Simple price for now
           name: currentUser.username,
           email: currentUser.email,
           serviceId: listing._id,
           providerName: listing.name
        })
      });
      const data = await res.json();
      if (data.success && data.payfast) {
         const form = document.createElement('form');
         form.method = 'POST';
         form.action = data.payfast.url;
         Object.keys(data.payfast.fields).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.payfast.fields[key];
            form.appendChild(input);
         });
         document.body.appendChild(form);
         form.submit();
      } else {
         console.error(data.message);
         setIsContacting(false);
      }
    } catch(err) {
      console.error(err);
      setIsContacting(false);
    }
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
      const response = await fetch('/api/listing/advertise', {
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
            'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
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
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
          ],
          contact: "0821234567",
          phone: "0821234567",
          email: "host@luxurystays.com",
          userRef: {
            _id: "user123",
            username: "John",
            email: "john@luxurystays.com",
            avatar: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
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

  const getOperatingStatus = () => {
    if (!listing?.operatingHours) return { isClosed: false };
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const currentDay = days[now.getDay()];
    const schedule = listing.operatingHours[currentDay];

    if (!schedule || schedule.closed) return { isClosed: true, reason: 'Closed today' };

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (schedule.open || '08:00').split(':').map(Number);
    const [closeH, closeM] = (schedule.close || '19:00').split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    if (currentTime < openTime) return { isClosed: true, reason: `Opens at ${schedule.open}` };
    if (currentTime >= closeTime) return { isClosed: true, reason: `Closed at ${schedule.close}` };

    return { isClosed: false };
  };

  const operatingStatus = getOperatingStatus();

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
        const response = await fetch(`/api/comments/${listingId}?limit=6`);
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
    return <NeuralLoader fullScreen text="Initializing Property Matrix..." />;
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
  const isOvernight = ['over', 'sale', 'land'].includes(listing.type);
  const isOffice = listing.type === 'office';
  const isSale = false;
  const isRent = listing.type === 'rent';
  const showCalendar = isOvernight || isOffice;
  const isSaleOrRent = isRent;

  // Calculate prices
  const roomTotal = listing.regularPrice * nights;
  const breakfastTotal = mealPlan === 'breakfast' ? breakfastPrice * nights : 0;
  const grandTotal = roomTotal + breakfastTotal;
  return (
    <main className="min-h-screen">
      {/* Navigation Header */}
      {/* Navigation Header - Transparent on top of image */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-50/90 backdrop-blur-md shadow-sm border-b border-slate-200/50' : 'bg-transparent'}`}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button 
              onClick={() => navigate(-1)} 
              aria-label="Go back"
              className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm'}`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare} 
                aria-label="Share listing"
                className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm'}`}
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleFavorite} 
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-black/20 hover:bg-black/40 backdrop-blur-sm'}`}
              >
                {isFavorite ? <HeartIconSolid className="w-6 h-6 text-rose-500" /> : <HeartIcon className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Image Gallery Grid - Full Width Airbnb Style */}
      <div className="max-w-[85rem] mx-auto md:px-4 lg:px-8 md:pt-24 md:pb-6">
        <div className="relative w-full overflow-hidden bg-slate-900 md:rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[400px] md:h-[500px] lg:h-[600px] w-full">
            {/* Main Image - Takes left half (2 cols, 2 rows) */}
            <div
              className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group"
              onClick={() => { setGalleryIndex(0); setShowFullGallery(true); }}
            >
              <ImageWithFallback
                src={listing.imageUrls[0]}
                imageUrls={listing.imageUrls}
                alt={listing.name}
                type="property"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Side Images - 2x2 grid on right */}
            {listing.imageUrls.slice(1, 5).map((url, index) => (
              <div
                key={index}
                className="relative overflow-hidden cursor-pointer hidden md:block group"
                onClick={() => { setGalleryIndex(index + 1); setShowFullGallery(true); }}
              >
                <ImageWithFallback
                  src={url}
                  imageUrls={listing.imageUrls.slice(index + 1)}
                  alt={`${listing.name} ${index + 2}`}
                  type="property"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </div>
            ))}

            {/* Show All Photos Button */}
            <button
              onClick={() => { setGalleryIndex(0); setShowFullGallery(true); }}
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-900 flex items-center gap-2 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl border border-slate-200/50"
            >
              <PhotoIcon className="w-5 h-5" />
              <span>Show all {listing.imageUrls.length} photos</span>
            </button>
          </div>
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
                  <StarIconSolid className="text-[#FFB400] w-4 h-4" />
                  <span className="font-semibold text-gray-900">{(ratings?.overall || listing?.rating || 0).toFixed(1)}</span>
                  <span className="underline">{commentCount} reviews</span>
                </span>
                <span>·</span>
                <span className="underline">{listing.address?.split(',')[0]}</span>
                <span>·</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${listingType.color}`}>
                  {listingType.label}
                </span>
                {bookingSummary.count > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-rose-500 font-semibold px-2 py-1 bg-rose-50 rounded text-xs">
                      <TicketIcon className="w-4 h-4" />
                      {bookingSummary.count} {bookingSummary.count === 1 ? 'Booking' : 'Bookings'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Property Highlights */}
            <div className="border-y border-gray-200 py-6">
               <div className="flex flex-wrap gap-3 mt-6">
              {listing.bedrooms && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700">
                  <FaBed className="text-rose-400" /> {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700">
                  <FaBath className="text-rose-400" /> {listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}
                </div>
              )}
              {listing.kind && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 capitalize">
                  <HomeModernIcon className="w-4 h-4 text-rose-400" /> {listing.kind.replace(/_/g, " ")}
                </div>
              )}
              {listing.period && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-2xl text-sm font-bold text-green-700">
                  <CalendarDaysIcon className="w-4 h-4" /> Available {listing.period}
                </div>
              )}
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
                    <UserIcon className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                )}
                <div>
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">Hosted by {listing.userRef?.username || 'Host'}</h2>
                  <p className="text-gray-600 text-xs lg:text-sm">
                    {listing.userRef?.isSuperhost ? 'Superhost' : 'Verified Host'} · {listing.userRef?.createdAt ? new Date(listing.userRef.createdAt).getFullYear() : '2020'}
                  </p>
                </div>
              </Link>
              
              {/* Mutual Friends Section */}
              <MutualFriends targetUserId={listing.userRef?._id || listing.userRef} />
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

            {/* Property Portfolio - Show All Photos */}
            {listing.imageUrls && listing.imageUrls.length > 0 && (
              <div className="py-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Property Portfolio</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {listing.imageUrls.length} Photos
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {listing.imageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      onClick={() => { setGalleryIndex(index); setShowFullGallery(true); }}
                      className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <ImageWithFallback 
                        src={url} 
                        imageUrls={listing.imageUrls}
                        alt={`Property ${index + 1}`} 
                        type="property"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}


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

            {/* Check-in & Check-out timings for overnight stays / hotels / resorts / self-catering */}
            {(isOvernight || isSale || isOffice || listing.type === 'land') && (
              <div className="py-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-rose-50 rounded-2xl">
                    <ClockIcon className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Check-in & Check-out</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Standard timing windows</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-5 rounded-3xl border border-gray-150/60 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl font-bold">
                        🛬
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-in Time</span>
                        <span className="text-base lg:text-lg font-black text-gray-900 mt-0.5 block">{listing.checkInTime || '14:00'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-3 py-1 rounded-full">After</span>
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-3xl border border-gray-150/60 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl font-bold">
                        🛫
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-out Time</span>
                        <span className="text-base lg:text-lg font-black text-gray-900 mt-0.5 block">{listing.checkOutTime || '11:00'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-3 py-1 rounded-full">Before</span>
                  </div>
                </div>
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
                <StarIconSolid className="text-[#FFB400] text-2xl drop-shadow-sm w-7 h-7" />
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
                                        <StarIconSolid
                                          key={i}
                                          className={`w-3.5 h-3.5 mr-1 ${i < Math.round(rating) ? 'text-[#FFB400]' : 'text-gray-200'}`}
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

            {/* Recent Bookers Section */}
            <BookingHistory bookingSummary={bookingSummary} providerName={listing?.name} providerType={listing?.type || 'property'} />

            {/* Location */}
            <div className="py-6 border-t border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Where you'll be</h2>
              <p className="text-gray-700 mb-4 text-sm lg:text-base">{listing.address}</p>
              <div className="w-full h-[450px] bg-black rounded-[2rem] overflow-hidden relative border border-slate-100/10 shadow-2xl">
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
          <div className="lg:col-span-1 relative">
            <div className="lg:sticky lg:top-28 space-y-4 pb-8 z-10">
              <div className="border border-slate-200/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-6 lg:p-8 bg-transparent">
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

                <button
                  onClick={handleEscrowCheckout}
                  className="w-full mt-2 py-2 lg:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm lg:text-base shadow-sm"
                >
                  <FaShieldAlt className="text-base lg:text-xl" />
                  Pay Securely via Escrow
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
              <div className="border border-slate-200/50 rounded-3xl p-6 lg:p-8 bg-transparent">
                <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Contact Information</h3>
                <div className="space-y-2 lg:space-y-3">
                  {formattedDisplayNumber && (
                    <a href={`tel:${formattedDisplayNumber}`} className="flex items-center gap-3 p-2 lg:p-3 bg-slate-50/50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/30">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-rose-100 rounded-full flex items-center justify-center shadow-sm">
                        <PhoneIcon className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Phone</p>
                        <p className="font-bold text-gray-900 text-sm lg:text-base tracking-tight">{formattedDisplayNumber}</p>
                      </div>
                    </a>
                  )}
                  {displayEmail && (
                    <a href={`mailto:${displayEmail}`} className="flex items-center gap-3 p-2 lg:p-3 bg-slate-50/50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/30">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                        <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</p>
                        <p className="font-bold text-gray-900 text-sm lg:text-base tracking-tight">{displayEmail}</p>
                      </div>
                    </a>
                  )}
                  {formattedDisplayNumber && (
                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(formattedDisplayNumber)}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 lg:p-3 bg-green-50/50 rounded-2xl hover:bg-green-100 transition-all border border-green-200/30">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">WhatsApp</p>
                        <p className="font-bold text-gray-900 text-sm lg:text-base tracking-tight">Message host</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Report Listing */}
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs lg:text-sm pt-4">
                <FlagIcon className="w-4 h-4" />
                <button className="underline underline-offset-4 font-black uppercase tracking-widest text-[9px] hover:text-rose-500">Report this listing</button>
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
    </main>
  );
}
