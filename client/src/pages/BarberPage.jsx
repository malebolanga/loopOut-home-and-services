/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from '../components/ServiceDetailsModal';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useWishlist } from '../hooks/useWishlist';
import { useBookedSlots } from '../hooks/useBookedSlots';
import BookingTimeSlots from '../components/BookingTimeSlots';
import BookingDateNotice from '../components/BookingDateNotice';
import { pushPhoneNotification } from '../components/PhoneNotificationManager';
import { Link } from "react-router-dom";
import {
  StarIcon,
  HomeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BoltIcon,
  ShieldCheckIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  CameraIcon,
  PhotoIcon,
  WifiIcon,
  TruckIcon,
  KeyIcon,
  HeartIcon,
  ShareIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusCircleIcon,
  MapPinIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import { Sparkles } from 'lucide-react';
import { 
  FaTshirt, FaBroom, FaFire, FaBaby, FaGlassCheers, FaEllipsisH, FaPalette,
  FaSpa, FaStar, FaCut, FaGraduationCap, FaChalkboardTeacher, FaBook, FaLanguage,
  FaPencilAlt, FaHandsWash, FaToolbox, FaWrench, FaTools, FaScrewdriver,
  FaSnowflake, FaPlug, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaTiktok,
  FaCamera, FaAward, FaBuilding, FaMapMarkerAlt, FaFileAlt, FaBriefcase, FaUserGraduate,
  FaTrophy, FaCertificate, FaHandSparkles, FaClock, FaCheckCircle, FaTrashAlt, FaLeaf,
  FaTruck, FaUser, FaPhone, FaWhatsapp, FaInfoCircle, FaShieldAlt,
  FaHandHoldingHeart, FaRing, FaBrush, FaSmile, FaUtensils, FaCookie, FaShoppingBasket,
  FaShoePrints, FaSoap, FaTint, FaWater, FaCogs, FaBath, FaSun, FaDog, FaPaw, FaFish,
  FaUserFriends, FaHome, FaCat, FaDove, FaHorse, FaArrowRight, FaSprayCan, FaWind, FaCar,
  FaExclamationTriangle, FaHeart, FaSpinner
} from 'react-icons/fa';
import { FiShare2, FiMessageSquare, FiMapPin, FiHeart, FiClock, FiStar, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { MdCleanHands, MdOutlineGppGood, MdLogin, MdChat, MdLocationOn, MdAttachMoney, MdVerified } from 'react-icons/md';

// Some icons might be double defined in Fi or Md, so I adjusted the list.
// FaBroomClean doesn't exist in standard Fa, likely was a typo or specialized set. Using FaBroom.


import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

// Swiper styles already imported above

import ImageWithFallback from '../components/ImageWithFallback';
import MutualFriends from '../components/MutualFriends';
import GoogleMapComponent from '../components/GoogleMapComponent';
import HelperComments from '../components/HelperComments';
import CommentsSidePanelHelper from '../components/CommentsSidePanelHelper';
import HelperItem from '../components/HelperItem';
import BookingHistory from '../components/BookingHistory';

export default function BarberPage() {
  const [selectedModalService, setSelectedModalService] = useState(null);
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
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlist(helper, 'helper');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [ratings, setRatings] = useState({ cleanliness: 0, communication: 0, overall: 0 });
  const [topComments, setTopComments] = useState([]);
  const [similarHelpers, setSimilarHelpers] = useState([]);
  const [bookingSummary, setBookingSummary] = useState({ count: 0, recentBookers: [] });

  const RECENTLY_VIEWED_KEY = 'recentlyViewed';

  useEffect(() => {
    if (helper) {
      fetchSimilarHelpers();
      fetchBookingSummary();
      saveToHistory(helper);
    }
  }, [helper]);

  const fetchBookingSummary = async () => {
    try {
      const res = await fetch(`/api/bookings/helper-summary/${helper._id}`);
      if (res.ok) {
        const data = await res.json();
        setBookingSummary(data);
      }
    } catch (error) {
      console.error('Error fetching booking summary:', error);
    }
  };

  const fetchSimilarHelpers = async () => {
    try {
      const res = await fetch(`/api/helper/similar/${helper._id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSimilarHelpers(data);
    } catch (error) {
      console.error('Error fetching similar helpers:', error);
    }
  };

  const saveToHistory = (item) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let history = stored ? JSON.parse(stored) : [];
      history = history.filter(h => h._id !== item._id);
      history.unshift({
        ...item,
        itemType: 'helper',
        viewedAt: new Date().toISOString()
      });
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  // ==================== SERVICE CONFIGURATION (MOVED UP) ====================

  // Service options for different helper types
  const getServiceOptions = (type) => {
    const baseOptions = [
      { id: 'laundry', name: 'Laundry', icon: <FaTshirt className="text-blue-500" /> },
      { id: 'cleaning', name: 'Deep Cleaning', icon: <FaBroom className="text-green-500" /> },
      { id: 'ironing', name: 'Ironing', icon: <FaTshirt className="text-purple-500" /> },
      { id: 'yard', name: 'Yard Work', icon: <FaBroom className="text-yellow-600" /> },
      { id: 'cooking', name: 'Meal Prep', icon: <FaFire className="text-red-500" /> },
      { id: 'babysitting', name: 'Child Care', icon: <FaBaby className="text-pink-500" /> },
      { id: 'eventCleaning', name: 'Event Cleanup', icon: <FaGlassCheers className="text-indigo-500" /> },
      { id: 'other', name: 'Other', icon: <FaEllipsisH className="text-gray-500" /> }
    ];

    const beautyOptions = [
      { id: 'makeup', name: 'Makeup', icon: <FaPalette className="text-pink-500" /> },
      { id: 'skincare', name: 'Facials', icon: <FaSpa className="text-purple-400" /> },
      { id: 'nails', name: 'Nails', icon: <FaHandSparkles className="text-red-400" /> },
      { id: 'hair', name: 'Hair Styling', icon: <FaCut className="text-blue-400" /> },
      { id: 'facial', name: 'Skin Therapy', icon: <FaStar className="text-yellow-500" /> },
      { id: 'waxing', name: 'Waxing', icon: <FaFire className="text-orange-500" /> },
      { id: 'massage', name: 'Massage', icon: <FaHandHoldingHeart className="text-green-400" /> },
      { id: 'bridal', name: 'Bridal', icon: <FaRing className="text-rose-500" /> }
    ];

    const barberOptions = [
      { id: 'haircut', name: 'Haircut', icon: <FaCut className="text-blue-600" /> },
      { id: 'beardTrim', name: 'Beard Trim', icon: <FaUser className="text-gray-700" /> },
      { id: 'shave', name: 'Razor Shave', icon: <FaTools className="text-gray-900" /> },
      { id: 'fade', name: 'Fade', icon: <FaCut className="text-indigo-600" /> },
      { id: 'coloring', name: 'Coloring', icon: <FaBrush className="text-purple-500" /> },
      { id: 'styling', name: 'Styling', icon: <FaSprayCan className="text-yellow-600" /> },
      { id: 'kidsCut', name: 'Kids Cut', icon: <FaSmile className="text-green-500" /> },
      { id: 'consultation', name: 'Consult', icon: <FaUser className="text-teal-500" /> }
    ];

    const chefOptions = [
      { id: 'mealPrep', name: 'Meal Prep', icon: <FaUtensils className="text-orange-500" /> },
      { id: 'privateDining', name: 'Private Dining', icon: <FaUtensils className="text-red-500" /> },
      { id: 'cookingClasses', name: 'Classes', icon: <FaGraduationCap className="text-green-500" /> },
      { id: 'eventCatering', name: 'Catering', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'dietMeals', name: 'Diet Plans', icon: <FaCookie className="text-blue-500" /> },
      { id: 'baking', name: 'Baking', icon: <FaCookie className="text-yellow-500" /> },
      { id: 'groceryShopping', name: 'Shopping', icon: <FaShoppingBasket className="text-teal-500" /> },
      { id: 'menuPlanning', name: 'Planning', icon: <FaUtensils className="text-indigo-500" /> }
    ];

    const tattooOptions = [
      { id: 'custom', name: 'Custom Art', icon: <FaPalette className="text-gray-800" /> },
      { id: 'coverup', name: 'Cover-up', icon: <FaBrush className="text-purple-600" /> },
      { id: 'touchup', name: 'Touch-up', icon: <FaTools className="text-blue-600" /> },
      { id: 'consultation', name: 'Design', icon: <FaUser className="text-teal-500" /> }
    ];

    const tutorOptions = [
      { id: 'math', name: 'Mathematics', icon: <FaGraduationCap className="text-blue-600" /> },
      { id: 'science', name: 'Science', icon: <FaGraduationCap className="text-green-600" /> },
      { id: 'language', name: 'Languages', icon: <FaGraduationCap className="text-yellow-600" /> },
      { id: 'music', name: 'Music', icon: <FaGraduationCap className="text-purple-600" /> },
      { id: 'art', name: 'Art', icon: <FaPalette className="text-pink-600" /> },
      { id: 'testPrep', name: 'Test Prep', icon: <FaGraduationCap className="text-red-600" /> }
    ];

    const photographyOptions = [
      { id: 'portrait', name: 'Portrait', icon: <FaUser className="text-blue-500" /> },
      { id: 'event', name: 'Events', icon: <FaGlassCheers className="text-purple-500" /> },
      { id: 'product', name: 'Product', icon: <FaShoppingBasket className="text-green-500" /> },
      { id: 'wedding', name: 'Wedding', icon: <FaRing className="text-pink-500" /> },
      { id: 'family', name: 'Family', icon: <FaUserFriends className="text-orange-500" /> },
      { id: 'commercial', name: 'Commercial', icon: <FaBriefcase className="text-indigo-500" /> },
      { id: 'realestate', name: 'Real Estate', icon: <FaHome className="text-yellow-600" /> },
      { id: 'landscape', name: 'Landscape', icon: <FaMapMarkerAlt className="text-teal-500" /> }
    ];

    const sneakerOptions = [
      { id: 'basicClean', name: 'Basic Clean', icon: <FaShoePrints className="text-indigo-500" /> },
      { id: 'deepClean', name: 'Deep Clean', icon: <FaSoap className="text-purple-500" /> },
      { id: 'stainRemoval', name: 'Stain Removal', icon: <FaTint className="text-blue-500" /> },
      { id: 'whitening', name: 'Whitening', icon: <FaStar className="text-yellow-500" /> },
      { id: 'restoration', name: 'Restoration', icon: <FaTools className="text-gray-600" /> },
      { id: 'waterproofing', name: 'Waterproofing', icon: <FaWater className="text-cyan-500" /> },
      { id: 'soleRepair', name: 'Sole Repair', icon: <FaCogs className="text-gray-700" /> },
      { id: 'colorRestore', name: 'Color Restore', icon: <FaPalette className="text-pink-500" /> }
    ];

    const washingmatOptions = [
      { id: 'basicWash', name: 'Basic Wash', icon: <FaWater className="text-blue-500" /> },
      { id: 'deepClean', name: 'Deep Clean', icon: <FaBath className="text-purple-500" /> },
      { id: 'stainRemoval', name: 'Stain Removal', icon: <FaTint className="text-red-500" /> },
      { id: 'sanitizing', name: 'Sanitizing', icon: <FaShieldAlt className="text-green-500" /> },
      { id: 'deodorizing', name: 'Deodorizing', icon: <FaWind className="text-teal-500" /> },
      { id: 'steamCleaning', name: 'Steam Cleaning', icon: <FaFire className="text-orange-500" /> },
      { id: 'drying', name: 'Drying Service', icon: <FaSun className="text-yellow-500" /> },
      { id: 'pickupDelivery', name: 'Pickup & Delivery', icon: <FaTruck className="text-gray-600" /> }
    ];

    const animalOptions = [
      { id: 'dogWalking', name: 'Dog Walking', icon: <FaDog className="text-amber-600" /> },
      { id: 'petSitting', name: 'Pet Sitting', icon: <FaPaw className="text-amber-500" /> },
      { id: 'grooming', name: 'Grooming', icon: <FaCut className="text-purple-500" /> },
      { id: 'bathing', name: 'Bathing', icon: <FaBath className="text-blue-500" /> },
      { id: 'feeding', name: 'Feeding', icon: <FaFish className="text-green-500" /> },
      { id: 'medication', name: 'Medication', icon: <FaShieldAlt className="text-red-500" /> },
      { id: 'training', name: 'Training', icon: <FaGraduationCap className="text-indigo-500" /> },
      { id: 'vetVisits', name: 'Vet Visits', icon: <FaTruck className="text-gray-600" /> },
      { id: 'catCare', name: 'Cat Care', icon: <FaCat className="text-amber-400" /> },
      { id: 'birdCare', name: 'Bird Care', icon: <FaDove className="text-sky-500" /> },
      { id: 'horseCare', name: 'Horse Care', icon: <FaHorse className="text-brown-500" /> }
    ];

    const transportOptions = [
      { id: 'schoolTransport', name: 'School Transport', icon: <FaCar className="text-yellow-500" /> },
      { id: 'privateRide', name: 'Private Ride', icon: <FaCar className="text-blue-500" /> },
      { id: 'furnitureRemoval', name: 'Furniture Removal', icon: <FaTruck className="text-orange-500" /> },
      { id: 'delivery', name: 'Delivery', icon: <FaBriefcase className="text-green-500" /> },
      { id: 'intercity', name: 'Inter-city Trip', icon: <FaArrowRight className="text-indigo-500" /> }
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
      case 'sneaker':
        return sneakerOptions;
      case 'washingmat':
        return washingmatOptions;
      case 'animals':
        return animalOptions;
      case 'transport':
        return transportOptions;
      default:
        return [];
    }
  };

  // Prioritize dynamic serviceList from database, fallback to hardcoded options
  const serviceOptions = (helper?.serviceList && helper.serviceList.length > 0)
    ? helper.serviceList.map((s, index) => ({ 
        id: s.name, 
        name: s.name, 
        type: s.type,
        description: s.description,
        price: s.price,
        image: s.image,
        icon: <FaCheckCircle className="text-rose-500" /> 
      }))
    : getServiceOptions(helper?.type);

  // Full page overlay state for booking form
  const [showBookingFormOverlay, setShowBookingFormOverlay] = useState(false);

  // Full screen gallery states
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // ==================== HELPER FUNCTIONS & STATIC DATA (MOVED UP) ====================

  // Helper function to get professional title
  const getProfessionalTitle = (type) => {
    const titles = {
      chef: 'Private Chef',
      barber: 'Barber',
      barbar: 'Barber',
      beauty: 'Beauty Professional',
      spa: 'Spa Professional',
      maid: 'Housekeeper',
      domestic: 'Domestic Helper',
      tattoo: 'Tattoo Artist',
      tutor: 'Private Tutor',
      photography: 'Photographer',
      sneaker: 'Sneaker Cleaner',
      washingmat: 'Mat Washer',
      animals: 'Animal Care Professional',
      transport: 'Transport Service'
    };
    return titles[type] || 'Professional';
  };

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
      sneaker: 'indigo',
      washingmat: 'cyan',
      animals: 'amber',
      transport: 'orange',
      default: 'red'
    };
    return themes[type] || themes.default;
  };

  const themeColor = helper ? getThemeColor(helper.type) : 'red';

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

  const cleaningTypes = [
    { id: 'gentle', name: 'Gentle Clean' },
    { id: 'standard', name: 'Standard Clean' },
    { id: 'deep', name: 'Deep Clean' }
  ];

  const matSizes = [
    { id: 'small', name: 'Small (Under 1.5m)' },
    { id: 'medium', name: 'Medium (1.5m - 2.5m)' },
    { id: 'large', name: 'Large (Over 2.5m)' }
  ];

  const matMaterials = [
    { id: 'synthetic', name: 'Synthetic Fiber' },
    { id: 'wool', name: 'Wool' },
    { id: 'cotton', name: 'Cotton' },
    { id: 'other', name: 'Other' }
  ];

  const stainLevels = [
    { id: 'light', name: 'Light Soiling' },
    { id: 'medium', name: 'Visible Stains' },
    { id: 'heavy', name: 'Heavy Deep-set Stains' }
  ];

  const dryingPreferences = [
    { id: 'air', name: 'Natural Air Dry' },
    { id: 'machine', name: 'Fast Machine Dry' }
  ];

  const animalSizes = [
    { id: 'small', name: 'Small (under 10kg)' },
    { id: 'medium', name: 'Medium (10-25kg)' },
    { id: 'large', name: 'Large (25-45kg)' },
    { id: 'xlarge', name: 'Extra Large (over 45kg)' }
  ];

  const animalAgeRanges = [
    { id: 'puppy', name: 'Puppy/Kitten' },
    { id: 'young', name: 'Young' },
    { id: 'adult', name: 'Adult' },
    { id: 'senior', name: 'Senior' }
  ];

  const serviceDurations = [
    { id: '30min', name: '30 minutes' },
    { id: '1hour', name: '1 hour' },
    { id: '2hours', name: '2 hours' },
    { id: '4hours', name: '4 hours' },
    { id: '8hours', name: 'Full day (8 hours)' },
    { id: 'overnight', name: 'Overnight' },
    { id: '24hours', name: '24 hours' },
    { id: 'weekly', name: 'Weekly' }
  ];

  // Equipment options for different services
  const equipmentOptions = {
    chef: [
      'Professional knives',
      'Cooking utensils',
      'Portable stove',
      'Baking equipment',
      'Serving platters',
      'Kitchen thermometer',
      'Mixer/blender',
      'Food processor'
    ],
    barber: [
      'Professional clippers',
      'Hair scissors',
      'Beard trimmers',
      'Sterilization equipment',
      'Hair styling tools',
      'Barber cape',
      'Shaving supplies',
      'Sanitizing spray'
    ],
    beauty: [
      'Makeup kit',
      'Skincare tools',
      'Sterilization equipment',
      'Nail care tools',
      'Facial steamer',
      'Beauty lights',
      'Massage oils',
      'Hot towels'
    ],
    domestic: [
      'Vacuum cleaner',
      'Mop & bucket',
      'Cleaning supplies',
      'Iron & board',
      'Window cleaning tools',
      'Garden tools',
      'Broom & dustpan',
      'Polishing cloths'
    ],
    tutor: [
      'Textbooks',
      'Stationery kits',
      'Whiteboard/Markers',
      'Educational software',
      'Reference materials',
      'Practice tests',
      'Calculator',
      'Laptop/Tablet'
    ],
    photography: [
      'Professional DSLR/Mirrorless',
      'Variety of lenses',
      'External flashes',
      'Tripods',
      'Reflectors/Diffusers',
      'Editing software',
      'Memory cards',
      'Lighting equipment'
    ],
    sneaker: [
      'Premium brushes',
      'Eco-friendly cleaners',
      'Microfiber towels',
      'Shoe trees',
      'Waterproof sprays',
      'Odor eliminators',
      'Paint touch-up kits'
    ],
    washingmat: [
      'Industrial washers',
      'Large dryers',
      'Specialist detergents',
      'Stain removers',
      'Fabric softeners',
      'Drying racks',
      'Packing materials'
    ],
    animals: [
      'Leashes/Harnesses',
      'Pet carriers',
      'Grooming brushes',
      'Pet first-aid kit',
      'Treats/Food bowls',
      'Waste bags',
      'Animal shampoo',
      'Training clicks'
    ],
    default: [
      'Professional kit',
      'Safety equipment',
      'ID verification',
      'Communication device'
    ]
  };

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

  // Sneaker cleaner specific options
  const shoeBrands = [
    { id: 'nike', name: 'Nike' },
    { id: 'adidas', name: 'Adidas' },
    { id: 'jordan', name: 'Jordan' },
    { id: 'newbalance', name: 'New Balance' },
    { id: 'puma', name: 'Puma' },
    { id: 'reebok', name: 'Reebok' },
    { id: 'vans', name: 'Vans' },
    { id: 'converse', name: 'Converse' },
    { id: 'yeezy', name: 'Yeezy' },
    { id: 'other', name: 'Other' }
  ];

  const shoeConditions = [
    { id: 'lightlyWorn', name: 'Lightly Worn' },
    { id: 'moderatelyWorn', name: 'Moderately Worn' },
    { id: 'heavilyWorn', name: 'Heavily Worn' },
    { id: 'veryDirty', name: 'Very Dirty' },
    { id: 'stained', name: 'Stained' },
    { id: 'damaged', name: 'Damaged' }
  ];

  // Animal care specific options
  const animalTypes = [
    { id: 'dog', name: 'Dog', icon: <FaDog /> },
    { id: 'cat', name: 'Cat', icon: <FaCat /> },
    { id: 'bird', name: 'Bird', icon: <FaDove /> },
    { id: 'fish', name: 'Fish', icon: <FaFish /> },
    { id: 'horse', name: 'Horse', icon: <FaHorse /> },
    { id: 'rabbit', name: 'Rabbit', icon: <FaPaw /> },
    { id: 'hamster', name: 'Hamster', icon: <FaPaw /> },
    { id: 'reptile', name: 'Reptile', icon: <FaPaw /> },
    { id: 'multiple', name: 'Multiple Animals', icon: <FaUserFriends /> }
  ];

  // Override these with more detailed versions if needed
  const washingMatSizes = [
    { id: 'small', name: 'Small (under 2x3 ft)' },
    { id: 'medium', name: 'Medium (2x3 to 4x6 ft)' },
    { id: 'large', name: 'Large (4x6 to 6x9 ft)' },
    { id: 'xlarge', name: 'Extra Large (over 6x9 ft)' }
  ];

  const washingMatMaterials = [
    { id: 'cotton', name: 'Cotton' },
    { id: 'synthetic', name: 'Synthetic' },
    { id: 'rubber', name: 'Rubber Backed' },
    { id: 'wool', name: 'Wool' },
    { id: 'coconut', name: 'Coconut Fiber' },
    { id: 'microfiber', name: 'Microfiber' }
  ];

  const genericStainLevels = [
    { id: 'light', name: 'Light Stains' },
    { id: 'moderate', name: 'Moderate Stains' },
    { id: 'heavy', name: 'Heavy Stains' },
    { id: 'setIn', name: 'Set-in Stains' }
  ];

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
    serviceFrequency: '',
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
    deliveryFormat: '',
    // Service provider fields
    addressProvided: '',
    foodProvided: 'no',
    electricityProvided: 'no',
    cleaningArrengement: 'no',
    equipmentProvided: 'no',
    otherDetails: '',
    // Sneaker cleaner specific fields
    shoeBrands: '',
    shoeCondition: '',
    cleaningType: '',
    restorationNeeded: false,
    waterproofing: false,
    // Washing mat specific fields
    matSize: '',
    matMaterial: '',
    stainLevel: '',
    dryingPreference: '',
    pickupDelivery: false,
    // Animal care specific fields
    animalType: '',
    animalSize: '',
    animalAge: '',
    animalBreed: '',
    serviceDuration: '',
    vaccinationStatus: '',
    specialNeeds: '',
    ownSupplies: false,
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const { bookedDates, isTimeSlotBooked, isDateFullyBooked, isDateBooked, getAvailabilityNotice } = useBookedSlots(helper?._id || id);

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

  // Calculate total price
  useEffect(() => {
    if (helper) {
      const basePrice = parseInt(helper.regularPrice) || 0;
      const travelFee = parseInt(helper.travelFee) || 0;
      
      // Calculate selected services price
      let selectedServicesPrice = 0;
      bookingData.selectedServices.forEach(serviceId => {
        const option = serviceOptions.find(opt => opt.id === serviceId);
        if (option && option.price) {
          // Handle "R450" or "450" format
          const price = parseInt(String(option.price).replace(/[^\d]/g, '')) || 0;
          selectedServicesPrice += price;
        }
      });

      const totalBase = selectedServicesPrice > 0 ? selectedServicesPrice : basePrice;
      const serviceFee = Math.round(totalBase * 0.1);
      setTotalPrice(totalBase + travelFee + serviceFee);
    }
  }, [helper, bookingData.selectedServices, serviceOptions]);




  // Scroll detection for navigation transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${getProfessionalTitle(helper?.type)} services by ${helper?.name}`,
        text: helper?.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Get relative time from timestamp
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

  // Fetch comment ratings and total count on load
  useEffect(() => {
    const fetchRatings = async () => {
      if (helper && helper._id) {
        try {
          const res = await fetch(`/api/helper-comments/${helper._id}?limit=6`);
          const data = await res.json();
          if (res.ok) {
            setCommentCount(data.totalComments || 0);
            setTopComments(data.comments || []);
            if (data.ratings) {
              setRatings({
                cleanliness: data.ratings.cleanliness || 0,
                communication: data.ratings.staff || 0,
                overall: data.ratings.overall || 0
              });
            }
          }
        } catch (error) {
          console.error('Error fetching ratings:', error);
        }
      }
    };
    fetchRatings();
  }, [helper]);

  // Toggle favorite function is now handled by useWishlist hook

  const handleHostRate = async (action) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (ratingLoading) return;
    
    const helperUserId = helper.userRef?._id || helper.userRef;
    
    if (currentUser._id === helperUserId) {
      alert("You cannot rate yourself!");
      return;
    }

    try {
      setRatingLoading(true);
      const res = await fetch(`/api/user/rate-host/${helperUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        setLikeCount(data.likeCount);
        setDislikeCount(data.dislikeCount);
        setIsLiked(data.userAction === 'like');
        setIsDisliked(data.userAction === 'dislike');
      }
    } catch (error) {
      console.error('Error rating host:', error);
    } finally {
      setRatingLoading(false);
    }
  };

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
  const generateMapLink = (address) => {
    if (!address) return '';
    const encodedAddress = encodeURIComponent(address);
    // Official Google Maps Search URL format for better cross-platform reliability
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
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
      sneaker: "Sneaker Cleaning Studio",
      washingmat: "Mat Washing Facility",
      animals: "Animal Care Center",
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
    const suffixes = ['', 'official', 'professionals', 'styles', 'studio', 'hair', 'beauty', 'chef', 'cooking', 'art', 'tattoo', 'photography', 'sneakers', 'mats', 'pets', 'animals'];
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
      if (!id) { // Guard against missing helper ID
        setLoading(false);
        setError('Helper ID is missing.');
        return;
      }
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

        // Check if helper is barber, chef, beauty, domestic, maid, sneaker, washingmat, or animals and verify social media
        if (['barber', 'barbar', 'chef', 'cooking', 'beauty', 'spa', 'domestic', 'maid', 'tattoo', 'tutor', 'photography', 'sneaker', 'washingmat', 'animals'].includes(data.type)) {
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

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!helper || !currentUser) return;

      const helperUserId = helper.userRef?._id || helper.userRef;
      if (!helperUserId) return;

      try {
        // Fetch Host Ratings
        const ratingRes = await fetch(`/api/user/host-ratings/${helperUserId}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (ratingRes.ok) {
          const ratingData = await ratingRes.json();
          setLikeCount(ratingData.likeCount);
          setDislikeCount(ratingData.dislikeCount);
          setIsLiked(ratingData.userAction === 'like');
          setIsDisliked(ratingData.userAction === 'dislike');
        }


      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };

    if (helper && currentUser) {
      fetchStatuses();
    }
  }, [helper, currentUser?._id, id]);

  // Scroll detection for booking belt
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 600;
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

      // Sneaker cleaner-specific scoring
      if (helperData.type === 'sneaker') {
        if (description.includes("professional") || description.includes("experience")) descScore += 2;
        if (description.includes("products") || description.includes("solutions")) descScore += 1;
        if (description.includes("restoration") || description.includes("cleaning")) descScore += 1;
        if (description.includes("brands") || description.includes("materials")) descScore += 1;
      }

      // Washing mat-specific scoring
      if (helperData.type === 'washingmat') {
        if (description.includes("industrial") || description.includes("commercial")) descScore += 2;
        if (description.includes("machine") || description.includes("equipment")) descScore += 1;
        if (description.includes("sanitizing") || description.includes("sterilizing")) descScore += 1;
        if (description.includes("drying") || description.includes("process")) descScore += 1;
      }

      // Animal care-specific scoring
      if (helperData.type === 'animals') {
        if (description.includes("certified") || description.includes("trained")) descScore += 2;
        if (description.includes("experience") || description.includes("passion")) descScore += 1;
        if (description.includes("animals") || description.includes("pets")) descScore += 1;
        if (description.includes("care") || description.includes("handling")) descScore += 1;
        if (description.includes("first aid") || description.includes("emergency")) descScore += 1;
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
    const { name, value, type, checked } = e.target;
    setBookingData({
      ...bookingData,
      [name]: type === 'checkbox' ? checked : value
    });
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

  // Handle equipment selection
  const handleEquipmentSelection = (equipment) => {
    const currentEquipment = bookingData.cookingEquipment ? bookingData.cookingEquipment.split(',') : [];
    const index = currentEquipment.indexOf(equipment);

    if (index > -1) {
      currentEquipment.splice(index, 1);
    } else {
      currentEquipment.push(equipment);
    }

    setBookingData({
      ...bookingData,
      cookingEquipment: currentEquipment.join(',')
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

  // Upload files to cloud storage (Firebase Storage)
  const uploadFilesToCloud = async (files) => {
    setIsUploading(true);
    try {
      const storage = getStorage(app);
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
          const fileName = `${new Date().getTime()}_${cleanFileName}`;
          const storageRef = ref(storage, `attachments/${fileName}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            null, // Could add progress tracking here if needed
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                name: file.name,
                url: downloadURL,
                type: file.type.startsWith('image/') ? 'image' : 'pdf',
                size: file.size
              });
            }
          );
        });
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
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
      },
      domestic: {
        comeToYou: [
          'cleanSpace',
          'waterAccess',
          'powerOutlets'
        ],
        goToThem: [
          'professionalEquipment'
        ]
      },
      sneaker: {
        comeToYou: [
          'workSurface',
          'waterAccess',
          'powerOutlets'
        ],
        goToThem: [
          'professionalCleaningStation'
        ]
      },
      washingmat: {
        comeToYou: [
          'waterAccess',
          'outdoorSpace',
          'dryingArea'
        ],
        goToThem: [
          'industrialWasher',
          'dryingFacility'
        ]
      },
      animals: {
        comeToYou: [
          'secureSpace',
          'waterAccess',
          'outdoorArea'
        ],
        goToThem: [
          'professionalFacility',
          'outdoorRuns'
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

    if (bookingData.date && isDateFullyBooked(bookingData.date)) {
      alert("This date is not available (fully booked). Please select another date.");
      return;
    }

    if (bookingData.date && bookingData.time && isTimeSlotBooked(bookingData.date, bookingData.time)) {
      alert("This time slot is already booked and not available. Please choose another time.");
      return;
    }

    // Enhanced location validation for quick booking
    if (bookingData.locationOption === 'comeToYou' && !bookingData.address) {
      alert("Please provide your address for home service in the booking form.");
      return;
    }

    const clientPhone = formatContactForWhatsApp(bookingData.phone);
    const acceptMessage = `Accept the service ${bookingData.name}, I accept your booking for ${helper.name}. See you then!`;
    const declineMessage = `Decline the service ${bookingData.name}, I'm unable to accept this booking. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Enhanced location handling for quick booking
    const locationInfo = handleLocationInfo(bookingData, helper);

    let message = `✂️ *QUICK BARBER BOOKING* ✂️\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *CLIENT DETAILS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *Name:* ${bookingData.name}\n`;
    message += `📱 *Phone:* ${bookingData.phone || 'Not provided'}\n`;
    if (bookingData.date) message += `📅 *Date:* ${bookingData.date}\n`;
    if (bookingData.time) message += `⏰ *Time:* ${bookingData.time}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✂️ *SERVICE SUMMARY*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏪 *Provider:* ${helper.name}\n`;
    if (bookingData.selectedServices.length > 0) {
      bookingData.selectedServices.forEach(id => {
        const s = serviceOptions.find(opt => opt.id === id);
        if (s) {
          message += `🔹 *${s.name}:* R${s.price}\n`;
        } else {
          message += `🔹 *${id}*\n`;
        }
      });
    }
    message += `💰 *TOTAL PRICE:* *R${totalPrice}*\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📍 *LOCATION & NAVIGATION*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏠 *Type:* ${locationInfo.displayName}\n`;
    if (locationInfo.address) {
      message += `📍 *Address:* ${locationInfo.address}\n`;
      const mapLink = generateMapLink(locationInfo.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}\n`;
    }
    message += `\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚡ *QUICK ACTIONS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (acceptLink) message += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
    if (declineLink) message += `❌ *REJECT:*\n${declineLink}\n\n`;

    message += `───────────────\n`;
    message += `_Sent via loopOut_ 📱`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${encodeURIComponent(message)}`;
    
    // Save to Database first
    // Determine device type
    const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    const requestLocation = bookingData.locationOption === 'comeToYou' ? bookingData.address : (bookingData.address || '');

    const bookingToSave = {
      userId: currentUser?._id || "guest",
      helperId: helper._id,
      startDate: bookingData.date + "T" + (bookingData.time || "00:00"),
      endDate: bookingData.date + "T" + (bookingData.time || "00:00"),
      totalPrice: totalPrice,
      phone: bookingData.phone,
      message: message,
      subtype: helper.type,
      deviceType,
      requestLocation,
      status: 'pending',
      type: 'helper'
    };

    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.token || currentUser?.access_token;
    fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify(bookingToSave)
    }).then(async (res) => {
      if (res.ok) {
        pushPhoneNotification({
          title: '🎉 Booking Request Sent',
          message: `Your booking for ${helper?.name || 'Barber Service'} has been placed. Check notifications for updates!`,
          type: 'success',
          link: '/notifications'
        });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Booking save failed:', err?.error || res.status);
      }
    }).catch(err => console.error('Failed to save quick booking:', err));

    window.open(whatsappUrl, '_blank');
  };

  // ==================== ENHANCED BOOKING SUBMIT FUNCTION ====================
  
  const handleEscrowCheckout = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in';
      return;
    }

    if (bookingData.date && isDateFullyBooked(bookingData.date)) {
      alert("This date is not available (fully booked). Please select another date.");
      return;
    }

    if (bookingData.date && bookingData.time && isTimeSlotBooked(bookingData.date, bookingData.time)) {
      alert("This time slot is already booked and not available. Please choose another time.");
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           userId: currentUser._id,
           amount: totalPrice,
           name: currentUser.username,
           email: currentUser.email,
           serviceId: helper ? helper._id : (service ? service._id : ''),
           providerName: helper ? helper.name : (service ? service.name : '')
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
         setIsUploading(false);
      }
    } catch(err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleBookingSubmit =async (e) => {
    e.preventDefault();

    if (!helper?.contact) {
      alert(`${getProfessionalTitle(helper?.type)} contact information is missing. Please try another contact method.`);
      return;
    }

    if (bookingData.date && isDateFullyBooked(bookingData.date)) {
      alert("This date is not available (fully booked). Please select another date.");
      return;
    }

    if (bookingData.date && bookingData.time && isTimeSlotBooked(bookingData.date, bookingData.time)) {
      alert("This time slot is already booked and not available. Please choose another time.");
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
      (helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef' || helper.type === 'tattoo' || helper.type === 'tutor' || helper.type === 'photography' || helper.type === 'sneaker' || helper.type === 'washingmat' || helper.type === 'animals' || helper.type === 'transport') &&
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
    const acceptMessage = `Accept the service ${bookingData.name}, I accept your booking for ${helper.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Decline the service ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Enhanced location handling
    const locationInfo = handleLocationInfo(bookingData, helper);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Build the main WhatsApp message with premium structure
    let message = `✨ *NEW ${getProfessionalTitle(helper.type).toUpperCase()} BOOKING* ✨\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *CLIENT DETAILS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *Name:* ${bookingData.name}\n`;
    message += `📱 *Phone:* ${bookingData.phone || 'Not provided'}\n`;
    message += `📅 *Date:* ${bookingData.date || 'Not specified'}\n`;
    message += `⏰ *Time:* ${bookingData.time || 'Not specified'}\n`;
    if (bookingData.serviceFrequency) message += `🔄 *Frequency:* ${bookingData.serviceFrequency}\n`;
    if (bookingData.selectedPerformer || bookingData.performerName) {
      message += `👑 *Performer:* ${bookingData.selectedPerformer || bookingData.performerName}\n`;
    }
    message += `\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✂️ *SERVICE SUMMARY*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏪 *Service:* ${helper.name}\n`;
    message += `🏷️ *Type:* ${getProfessionalTitle(helper.type)}\n`;

    // Add selected services
    if (bookingData.selectedServices.length > 0) {
      bookingData.selectedServices.forEach(id => {
        const s = serviceOptions.find(opt => opt.id === id);
        if (s) {
          message += `🔹 *${s.name}:* R${s.price}\n`;
        } else {
          message += `🔹 *${id}*\n`;
        }
      });
      message += `💰 *TOTAL PRICE:* *R${totalPrice}*\n`;
    } else {
      message += `💰 *Base Price:* R${helper.regularPrice || 0}\n`;
      message += `💰 *TOTAL PRICE:* *R${totalPrice}*\n`;
    }

    // Add service-specific details (Barbershop)
    if (helper.type === 'barber' || helper.type === 'barbar' || !helper.type) {
      message += `\n💈 *BARBERSHOP & GROOMING DETAILS:*\n`;
      if (bookingData.selectedHaircut) message += `✂️ *Haircut Style:* ${haircutStyles.find(h => h.id === bookingData.selectedHaircut)?.name || bookingData.selectedHaircut}\n`;
      if (bookingData.beardStyle) message += `🧔 *Beard & Shave:* ${beardStyles.find(b => b.id === bookingData.beardStyle)?.name || bookingData.beardStyle}\n`;
      if (bookingData.hairLength) message += `📏 *Hair Length:* ${bookingData.hairLength}\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📍 *LOCATION & NAVIGATION*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏠 *Type:* ${locationInfo.displayName}\n`;
    if (locationInfo.address && locationInfo.address !== 'Address not specified') {
      message += `📍 *Address:* ${locationInfo.address}\n`;
      const mapLink = generateMapLink(locationInfo.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}\n`;
    }
    if (locationInfo.travelFee > 0) message += `🚗 *Travel Fee:* R${locationInfo.travelFee}\n`;
    message += `\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚡ *PROVISIONS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🍽️ *Food provided by client:* ${bookingData.foodProvided === 'yes' ? '✅ Yes' : '❌ No'}\n`;
    message += `🔌 *Electricity available:* ${bookingData.electricityProvided === 'yes' ? '✅ Yes' : '❌ No'}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💬 *COMMENTS & NOTES*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📝 ${bookingData.specialRequirements ? bookingData.specialRequirements : '_No special requirements_'}\n\n`;

    // Add attachments if they exist
    if (uploadedFiles.length > 0) {
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📎 *ATTACHMENTS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      uploadedFiles.forEach((file) => {
        message += `🔹 ${file.name}: ${file.url}\n`;
      });
      message += `\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚡ *QUICK ACTIONS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (acceptLink) message += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
    if (declineLink) message += `❌ *REJECT:*\n${declineLink}\n\n`;

    message += `🔐 *Verification Code:* \`${verificationCode}\`\n`;
    message += `───────────────\n`;
    message += `_Sent via loopOut_ 📱`;

    // Open WhatsApp with properly encoded message
    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${encodeURIComponent(message)}`;
    
    // Save to Database first
    // Create a very descriptive subtype for the dashboard/cart
    let bookingSubtype = helper.type;
    if (bookingData.selectedServices.length > 0) {
      bookingSubtype = bookingData.selectedServices.map(s => {
        // Find the service name from options
        const opt = serviceOptions.find(o => o.id === s);
        return opt ? opt.name : s;
      }).join(', ');
    }
    
    // Add specific transport details if available
    if (helper.type === 'transport' && bookingData.specialRequirements) {
      const requirements = bookingData.specialRequirements.toLowerCase();
      if (requirements.includes('pretor') && requirements.includes('johan')) {
        bookingSubtype = `Route: Pretoria ↔ JHB`;
      }
    }

    // Determine device type
    const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    const requestLocation = bookingData.locationOption === 'comeToYou' ? bookingData.address : (bookingData.address || '');

    const bookingToSave = {
      userId: currentUser?._id || "guest",
      helperId: helper._id,
      startDate: (bookingData.date || "2000-01-01") + "T" + (bookingData.time || "00:00"),
      endDate: (bookingData.date || "2000-01-01") + "T" + (bookingData.time || "00:00"),
      totalPrice: totalPrice,
      phone: bookingData.phone,
      message: bookingData.specialRequirements || message,
      subtype: bookingSubtype,
      deviceType,
      requestLocation,
      status: 'pending',
      type: 'helper'
    };

    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.token || currentUser?.access_token;
    fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify(bookingToSave)
    }).then(async (res) => {
      if (res.ok) {
        pushPhoneNotification({
          title: '🎉 Booking Request Sent',
          message: `Your booking for ${helper?.name || 'Barber Service'} has been placed. Check notifications for updates!`,
          type: 'success',
          link: '/notifications'
        });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Booking save failed:', err?.error || res.status);
      }
    }).catch(err => console.error('Failed to save booking:', err));

    window.open(whatsappUrl, '_blank');

    // Close the booking form overlay after sending
    closeBookingFormOverlay();

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

  const handleInternalMessage = async () => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    // Check if the user is trying to message themselves
    if (currentUser._id === helper.userRef) {
      alert("You cannot message yourself.");
      return;
    }

    try {
      // Create/Get conversation by sending an initial message
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: helper.userRef,
          content: `Hi ${helper.name}, I'm interested in your ${getProfessionalTitle(helper.type).toLowerCase()} services.`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/messages/${data.conversationId || data._id}`);
      } else {
        alert(data.message || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading professional details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Error loading profile</h3>
              <p className="mt-2 text-red-600">{error}</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Professional not found</h2>
          <p className="text-gray-600 mb-6">The professional you're looking for doesn't exist or may have been removed.</p>
          <button
            onClick={() => navigate('/helper-home-page')}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
          >
            Browse Professionals
          </button>
        </div>
      </div>
    );
  }

  const description = helper.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  const serviceEquipmentOptions = equipmentOptions[helper.type] || equipmentOptions.default;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Navigation - Transparent on top of image */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-50/90 backdrop-blur-md shadow-sm border-b border-slate-200/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
               onClick={() => navigate(-1)}
               className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm'}`}
             >
               <ArrowLeftIcon className="w-5 h-5" />
             </button>

             <div className="flex items-center gap-2">
               <button
                 onClick={handleShare}
                 className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm'}`}
               >
                 <ShareIcon className="w-5 h-5" />
               </button>
              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-black/20 hover:bg-black/40 backdrop-blur-sm'}`}
              >
                {isFavorite ?
                  <HeartIconSolid className="text-xl text-rose-500 w-6 h-6" /> :
                  <HeartIcon className={`text-xl w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Image Gallery - Full Width */}
      <div className="w-full">
        {/* Airbnb-style image gallery layout */}
        {helper.imageUrls && helper.imageUrls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px] md:h-[500px] lg:h-[600px] w-full bg-slate-900 overflow-hidden">
            <div className="relative h-full cursor-pointer group overflow-hidden" onClick={() => openFullScreenGallery(0)}>
              <img src={helper.imageUrls[0]} alt={helper.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            <div className="hidden md:grid grid-cols-2 gap-2 h-full">
              {helper.imageUrls.slice(1, 5).map((url, index) => (
                <div key={index} className="relative h-full cursor-pointer group overflow-hidden" onClick={() => openFullScreenGallery(index + 1)}>
                  <img src={url} alt={`${helper.name} ${index + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
                </div>
              ))}
              {helper.imageUrls.length < 5 && Array(4 - Math.min(4, helper.imageUrls.length - 1)).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-800 h-full" />
              ))}
            </div>
            <button onClick={() => openFullScreenGallery(0)} className="absolute top-28 right-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-900 flex items-center gap-2 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl border border-slate-200/50 z-20">
              <Squares2X2Icon className="w-4 h-4" /> Show all {helper.imageUrls.length} photos
            </button>
          </div>
        )}
      </div>

      <main className="relative z-10 -mt-8 md:-mt-12 max-w-7xl mx-auto rounded-t-[2rem] md:rounded-t-[2.5rem] bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8 pb-60 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
        {/* Content Section */}
        <div className="mb-10 pt-8 border-b border-slate-200/60 pb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {getProfessionalTitle(helper.type)} services by {helper.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <StarIconSolid className="text-amber-400 w-4 h-4" />
              <span className="font-semibold text-slate-900 text-base">
                {ratings && ratings.overall > 0 ? ratings.overall.toFixed(1) : (helper.rating || 'New')}
              </span>
              <span>·</span>
              <span className="underline hover:text-slate-900 transition-colors cursor-pointer">{commentCount} reviews</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckBadgeIcon className="text-rose-500 w-4 h-4" />
              <span className="font-black uppercase tracking-widest text-[10px]">Superhelper</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-2 text-slate-700">
              <PlusCircleIcon className="text-indigo-500 w-4 h-4" />
              <span className="font-black uppercase tracking-widest text-[10px]">Booked {bookingSummary.count || 0} times</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-2 text-slate-700 underline font-black uppercase tracking-widest text-[10px] cursor-pointer hover:text-slate-900 transition-colors">
              <MapPinIcon className="text-slate-400 w-4 h-4" />
              <span>{helper.address || 'Johannesburg, South Africa'}</span>
            </div>
            <span className="text-slate-300">·</span>
            <MutualFriends targetUserId={helper.userRef?._id || helper.userRef} />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info Bar */}
            <div className="pb-6 border-b border-gray-200">
              <Link
                to={`/user-profile/${helper.userRef?._id || helper.userRef}`}
                className="flex items-start justify-between hover:opacity-80 transition-opacity w-fit"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getProfessionalTitle(helper.type)} hosted by {helper.userRef?.username || helper.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {helper.userRef?.isSuperhost ? 'Superhost' : 'Verified Host'} · {helper.host || 5}+ years of experience
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 ml-4 bg-gray-50 flex items-center justify-center">
                  {helper.userRef?.avatar ? (
                    <img
                      src={helper.userRef.avatar}
                      alt={helper.userRef?.username || helper.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'; }}
                    />
                  ) : (
                    <FaUser className="text-2xl text-gray-400" />
                  )}
                </div>
              </Link>
              
              {/* Mutual Friends Section */}
              <MutualFriends targetUserId={helper.userRef?._id || helper.userRef} />
            </div>


            <div className="space-y-6 pb-8 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-rose-500 mt-1" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs text-gray-950">Top rated professional</h3>
                  <p className="text-gray-500 text-xs font-medium mt-1">Highly rated for quality, reliability, and customer satisfaction</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheckIcon className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs text-gray-950">Experienced & Verified</h3>
                  <p className="text-gray-500 text-xs font-medium mt-1">Background checked with verified credentials and references</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ClockIcon className="w-6 h-6 text-teal-500 mt-1" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs text-gray-950">Flexible scheduling</h3>
                  <p className="text-gray-500 text-xs font-medium mt-1">Available 7 days a week with flexible hours to suit your needs</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this professional</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {displayText.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {description.length > 300 && (
                <button
                  onClick={toggleDescription}
                  className="mt-6 text-rose-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                  {showFullDescription ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Professional Portfolio - Show All Photos */}
            {helper.imageUrls && helper.imageUrls.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Professional Portfolio</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {helper.imageUrls.length} Photos
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {helper.imageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      onClick={() => openFullScreenGallery(index)}
                      className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <img 
                        src={url} 
                        alt={`Portfolio ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Offered - FIXED SECTION */}
            {(helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'beauty' || helper.type === 'spa' || helper.type === 'barber' || helper.type === 'barbar' || helper.type === 'chef' || helper.type === 'tattoo' || helper.type === 'tutor' || helper.type === 'photography' || helper.type === 'sneaker' || helper.type === 'washingmat' || helper.type === 'animals') && (
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {serviceOptions.map((service) => {
                    const isSelected = bookingData.selectedServices.includes(service.id);
                    return (
                      <div 
                        key={service.id} 
                        onClick={() => setSelectedModalService(service)}
                        className={`flex items-start justify-between gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-rose-500 bg-rose-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {service.image ? (
                            <img src={service.image} alt={service.name} className="w-12 h-12 object-cover rounded-lg border bg-white shrink-0 mt-0.5" />
                          ) : (
                            <div className={`text-xl transition-colors ${isSelected ? 'text-rose-500' : 'text-gray-400'} shrink-0 mt-0.5`}>
                              {service.icon}
                            </div>
                          )}
                          <div className="min-w-0">
                            {service.type && (
                              <span className={`inline-block mb-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isSelected ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {service.type}
                              </span>
                            )}
                            <p className={`font-medium transition-colors ${isSelected ? 'text-rose-700' : 'text-gray-900'}`}>
                              {service.name}
                            </p>
                            {service.description && (
                              <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {service.price && (
                          <span className={`font-semibold ${isSelected ? 'text-rose-600' : 'text-gray-700'}`}>
                            R{service.price}
                          </span>
                        )}
                        {isSelected && (
                          <div className="ml-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                            <CheckIcon className="text-white w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews Summary */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-8">
                <StarIconSolid className="text-[#FFB400] text-2xl drop-shadow-sm w-6 h-6" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {ratings && ratings.overall > 0 ? ratings.overall.toFixed(1) : (helper.rating || 'New')} · {commentCount} reviews
                </h2>
              </div>

              {commentCount > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 mb-8">
                    {/* Cleanliness */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 sm:border-0 sm:pb-0">
                      <div className="flex items-center gap-3 text-gray-800">
                        <FaBroom className="text-xl" />
                        <span>Cleanliness</span>
                      </div>
                      <div className="flex items-center gap-4 w-1/2">
                        <span className="font-semibold text-sm">{ratings?.cleanliness?.toFixed(1) || '0.0'}</span>
                        <div className="h-[4px] bg-gray-200 w-full rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${(ratings?.cleanliness / 5) * 100 || 0}%` }} />
                        </div>
                      </div>
                    </div>
                    {/* Communication */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 sm:border-0 sm:pb-0">
                      <div className="flex items-center gap-3 text-gray-800">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-700" />
                        <span>Communication</span>
                      </div>
                      <div className="flex items-center gap-4 w-1/2">
                        <span className="font-semibold text-sm">{ratings?.communication?.toFixed(1) || '0.0'}</span>
                        <div className="h-[4px] bg-gray-200 w-full rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${(ratings?.communication / 5) * 100 || 0}%` }} />
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
                          1024: { slidesPerView: 3.2 }
                        }}
                        freeMode={true}
                        modules={[FreeMode]}
                        className="-mx-4 px-4 sm:mx-0 sm:px-0"
                      >
                        {topComments.map(comment => {
                          const rating = (comment.cleanlinessRating + comment.communicationRating) / 2 || 5;
                          
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
                                      <h4 className="font-semibold text-[#222222] dark:text-white leading-tight">{comment.userName}</h4>
                                      <p className="text-sm text-[#717171] dark:text-white mt-0.5">{getRelativeTime(comment.createdAt)}</p>
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
                        )})}
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
              <p className="text-gray-700 mb-4 text-sm lg:text-base">{helper.address}</p>
              <div className="w-full h-[450px] bg-black rounded-[2rem] overflow-hidden relative border border-slate-100/10 shadow-2xl">
                <GoogleMapComponent
                  address={helper.address || 'Johannesburg, South Africa'}
                  title={`${helper.name}'s Location`}
                />
              </div>
              {helper.near && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What's nearby</h3>
                  <div className="text-gray-700 text-xs lg:text-sm space-y-1">
                    {(helper.near || '').split('\n').slice(0, 4).map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="top-24 py-12">
              {/* Masterpiece Booking Card */}
              <div className="rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 bg-transparent sticky top-24 border border-slate-200/50 dark:border-gray-800 mb-12 lg:mb-0">
                <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-50">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Service Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter">R{helper.regularPrice}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ service</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-2xl">
                    <StarIconSolid className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-black text-rose-700">{helper.rating || '4.5'}</span>
                  </div>
                </div>

                {/* Quick Booking Options */}
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1.5">Deployment Date</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none"
                    />
                  </div>

                  {bookingData.date && (
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <BookingTimeSlots
                        selectedDate={bookingData.date}
                        selectedTime={bookingData.time}
                        onSelectTime={(time) => setBookingData(prev => ({ ...prev, time }))}
                        isTimeSlotBooked={isTimeSlotBooked}
                        isDateFullyBooked={isDateFullyBooked}
                      />
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1.5">Personnel Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      placeholder="Full Designation"
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <button
                    onClick={openBookingFormOverlay}
                    className="w-full py-5 bg-gray-950 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-xl active:scale-95"
                  >
                    Check Availability
                  </button>

                  <button
                    onClick={handleInternalMessage}
                    className="w-full py-4 bg-white border border-slate-100 text-gray-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-rose-500" /> Secure Message
                  </button>
                </div>

                <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-8 italic">
                   loopOut Promise: Zero Upfront Charge
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                  {bookingData.selectedServices.length > 0 ? (
                    bookingData.selectedServices.map(id => {
                      const s = serviceOptions.find(opt => opt.id === id);
                      return s ? (
                        <div key={id} className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">{s.name}</span>
                          <span className="text-xs font-black text-gray-950 dark:text-white">R{s.price}</span>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 italic">Base Deployment</span>
                      <span className="text-xs font-black text-gray-950 dark:text-white">R{helper.regularPrice}</span>
                    </div>
                  )}
                  {helper.travelFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 italic">Deployment Fee</span>
                      <span className="text-xs font-black text-gray-950 dark:text-white">R{helper.travelFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">Service Fee (10%)</span>
                    <span className="text-xs font-black text-gray-950 dark:text-white">R{Math.round((totalPrice - (helper.travelFee || 0)) / 1.1 * 0.1)}</span>
                  </div>
                  <div className="mt-4 p-4 bg-gray-900 rounded-2xl flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Estimate</span>
                    <span className="text-lg font-black text-rose-500 italic tracking-tighter">R{totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center py-14">
                <button className="text-gray-400 text-[10px] font-black uppercase tracking-widest underline underline-offset-8 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 mx-auto">
                  <FlagIcon className="w-4 h-4" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mutual Connections Section */}
        <div className="mt-12 md:mt-16 border-t border-slate-200/50 pt-10 md:pt-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8 flex items-center gap-3 tracking-tighter italic uppercase">
            <UserGroupIcon className="text-rose-500 w-6 h-6" />
            Mutual Connections
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-slate-200/60 dark:border-gray-800 shadow-sm">
            <MutualFriends targetUserId={helper.userRef?._id || helper.userRef} detailed={true} />
          </div>

        {/* Recent Bookers Section */}
        <BookingHistory bookingSummary={bookingSummary} providerName={helper?.name} providerType={helper?.type} />
        </div>



        {/* Similar Helpers */}
          {similarHelpers.length > 0 && (
            <div className="mt-12 md:mt-16 border-t border-slate-200/50 pt-10 md:pt-12">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8 flex items-center gap-3 tracking-tighter italic uppercase">
                <MapPinIcon className="text-rose-500 w-6 h-6" />
                Other professionals in the matrix
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {similarHelpers.map((item) => (
                  <HelperItem key={item._id} helper={item} />
                ))}
              </div>
            </div>
          )}
      </main>

      {/* Full Screen Gallery Overlay */}
      {showFullScreenGallery && helper.imageUrls && helper.imageUrls.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button
              onClick={closeFullScreenGallery}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <span className="font-medium">
              {currentGalleryIndex + 1} / {helper.imageUrls.length}
            </span>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative">
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <img
              src={helper.imageUrls[currentGalleryIndex]}
              alt={`Gallery ${currentGalleryIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg"
            />

            <button
              onClick={nextImage}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Full Page Booking Form Overlay */}
      {showBookingFormOverlay && (
        <div className="fixed inset-0 bg-black/50 z-[1200] flex items-center justify-center p-4 overflow-y-auto pb-24">
          <div className="bg-slate-50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <button
                onClick={closeBookingFormOverlay}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-slate-900" />
              </button>
              <h2 className="text-lg font-semibold">Complete your booking</h2>
              <div className="w-10" />
            </div>

            <div className="p-6 space-y-6">
              {/* Form content - simplified for Airbnb style */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="071 234 5678"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>

                    <BookingTimeSlots
                      selectedDate={bookingData.date}
                      selectedTime={bookingData.time}
                      onSelectTime={(time) => setBookingData(prev => ({ ...prev, time }))}
                      isTimeSlotBooked={isTimeSlotBooked}
                      isDateFullyBooked={isDateFullyBooked}
                    />
                  </div>

                  {/* Service Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🔄 Project / Service Frequency</label>
                    <select
                      name="serviceFrequency"
                      value={bookingData.serviceFrequency || ''}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm text-gray-900 bg-white"
                    >
                      <option value="">Select frequency / schedule...</option>
                      <option value="This is a one-time project">This is a one-time project</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Every other week">Every other week</option>
                      <option value="Monthly">Monthly</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>

                  {/* Location Option */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service location</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="locationOption"
                          value="comeToYou"
                          checked={bookingData.locationOption === 'comeToYou'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">Come to me</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="locationOption"
                          value="goToThem"
                          checked={bookingData.locationOption === 'goToThem'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">Go to them</span>
                      </label>
                    </div>
                  </div>

                  {/* Address (only if comeToYou is selected) */}
                  {bookingData.locationOption === 'comeToYou' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">📍 Address</label>
                      <textarea
                        name="address"
                        value={bookingData.address}
                        onChange={handleBookingChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter your full address (street, suburb, city)"
                      />
                      {bookingData.address && bookingData.address.length >= 10 && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingData.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          <FaMapMarkerAlt className="text-xs" />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  )}

                  {/* Provisions - Food & Electricity (all service types) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🍴 Will you provide food for the helper?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="foodProvided"
                          value="yes"
                          checked={bookingData.foodProvided === 'yes'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">Yes, I'll provide food</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="foodProvided"
                          value="no"
                          checked={bookingData.foodProvided === 'no'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">⚡ Is electricity available at the location?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="electricityProvided"
                          value="yes"
                          checked={bookingData.electricityProvided === 'yes'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">Yes, available</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="electricityProvided"
                          value="no"
                          checked={bookingData.electricityProvided === 'no'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Barbershop & Haircut Specific Details */}
                  <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-5 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-200">
                          💈
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider">Barbershop & Haircut Details</h4>
                          <p className="text-xs text-blue-700 font-medium">Select your haircut style, beard grooming & preferences</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Haircut & Grooming
                      </span>
                    </div>

                    {/* Haircut Style Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          ✂️ Select Haircut Style
                        </label>
                        {bookingData.selectedHaircut && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
                            Selected: {haircutStyles.find(h => h.id === bookingData.selectedHaircut)?.name || bookingData.selectedHaircut}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {haircutStyles.map(style => {
                          const isSelected = bookingData.selectedHaircut === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, selectedHaircut: style.id }))}
                              className={`p-3 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                              }`}
                            >
                              <div className="font-bold">{style.name}</div>
                              <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-400'} font-normal mt-0.5`}>
                                {style.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Beard & Shave Style */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          🧔 Beard & Shave Grooming
                        </label>
                        {bookingData.beardStyle && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
                            Selected: {beardStyles.find(b => b.id === bookingData.beardStyle)?.name || bookingData.beardStyle}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {beardStyles.map(beard => {
                          const isSelected = bookingData.beardStyle === beard.id;
                          return (
                            <button
                              key={beard.id}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, beardStyle: beard.id }))}
                              className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                              }`}
                            >
                              <div className="font-bold">{beard.name}</div>
                              <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-gray-400'} font-normal mt-0.5`}>
                                {beard.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hair Length */}
                    <div>
                      <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
                        📏 Current Hair Length
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Short (Buzz / Fade)', 'Medium (Top length)', 'Long Hair', 'Dreadlocks / Locs'].map(len => (
                          <button
                            key={len}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, hairLength: len }))}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all text-center ${
                              bookingData.hairLength === len
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            {len}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments / Special Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💬 Comments / Special requirements</label>
                <textarea
                  name="specialRequirements"
                  value={bookingData.specialRequirements}
                  onChange={handleBookingChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Any special instructions, preferences, or questions for the professional..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Select services</h3>
                <div className="grid grid-cols-2 gap-3">
                  {serviceOptions.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelection(service.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all relative ${bookingData.selectedServices.includes(service.id)
                        ? 'border-rose-500 bg-rose-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="text-2xl mb-2">{service.icon}</div>
                      <div className="font-semibold text-sm text-gray-900">{service.name}</div>
                      <div className="text-rose-600 font-bold text-xs mt-1">R{service.price}</div>
                      {bookingData.selectedServices.includes(service.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="text-white w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Estimate Summary in Form */}
              <div className="bg-slate-900 rounded-[2rem] p-6 mb-8 text-white space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Base Deployment</span>
                    <span>R{helper.regularPrice}</span>
                 </div>
                 {bookingData.selectedServices.length > 0 && (
                   <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>Services Selection</span>
                      <span>+ R{totalPrice - helper.regularPrice - (helper.travelFee || 0) - Math.round((totalPrice - (helper.travelFee || 0)) / 1.1 * 0.1)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>Service Protocol Fee (10%)</span>
                    <span>R{Math.round((totalPrice - (helper.travelFee || 0)) / 1.1 * 0.1)}</span>
                 </div>
                 <div className="h-px bg-white/10 my-2" />
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Total Estimation</span>
                    <span className="text-xl font-black text-rose-500 italic">R{totalPrice}</span>
                 </div>
              </div>

              
             <div className="flex flex-col gap-4">
              <button
                onClick={handleBookingSubmit}
                disabled={isUploading}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Initializing Secure Link...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="text-lg" />
                    Finalize via WhatsApp
                  </>
                )}
              </button>
              
              <button
                onClick={handleEscrowCheckout}
                disabled={isUploading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 mt-2"
              >
                <FaShieldAlt className="text-lg" /> Secure Escrow Checkout
              </button>
              
              <p className="text-[10px] text-gray-500 font-bold text-center italic px-4 shadow-sm border border-rose-100 bg-rose-50 rounded-xl py-3 mt-2">
                 ⚠️ Never send money over WhatsApp before the job is completed. Avoid scams by using loopOut Secure Escrow!
              </p>
             </div>

              {/* Quick Accept Info */}
              {bookingData.name && bookingData.phone && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">How it works</p>
                      <p>Your booking request will be sent to <strong>{helper?.name}</strong> on WhatsApp. They will receive a pre-filled <strong>✅ Accept</strong> or <strong>❌ Decline</strong> reply link — tap the button in WhatsApp to send the message.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Mobile Bottom Bar - 100% Width & Flush to Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 p-4 lg:hidden z-[1100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] safe-area-bottom">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tighter">R{totalPrice}</span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">Total Est.</span>
            </div>
            <div className="text-rose-600 text-[10px] font-black uppercase tracking-widest truncate max-w-[160px] opacity-80">
              {helper?.name}
            </div>
          </div>
          <button
            onClick={() => setShowBookingFormOverlay(true)}
            className="px-8 py-4 bg-slate-950 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
          >
            Review & Reserve
          </button>
        </div>
      </div>

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelHelper
          helperId={helper._id}
          onClose={() => setShowCommentsPanel(false)}
          onTotalComments={setCommentCount}
          onRatingsChange={setRatings}
          onAnalyzeComments={analyzeCommentsWithAI}
          commentAnalysis={commentAnalysis}
          analyzingComments={analyzingComments}
        />
      )}
    </div>
  );
}
