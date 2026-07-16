// Services.jsx - Airbnb-Style Professional Design
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { Link } from "react-router-dom";
import {
  MapPinIcon,
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
  ChevronUpIcon,
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
  ArrowUpIcon,
  ArrowDownIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  TrophyIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

import {
  FaBroom, FaSprayCan, FaBriefcase, FaTools, FaShieldAlt, FaLeaf, FaUtensils,
  FaRing, FaGlassCheers, FaTruck, FaCar, FaTree, FaPalette, FaChild, FaClock,
  FaGraduationCap, FaBus, FaCalendarAlt, FaMapMarkerAlt, FaWrench, FaTrophy, FaUser,
  FaMotorcycle, FaCheckCircle, FaWhatsapp, FaPhone, FaHeart, FaStar, FaCommentDots, FaAward
} from 'react-icons/fa';
import { FiShare2, FiMessageSquare, FiMapPin } from 'react-icons/fi';

import CommentsSidePanelService from '../components/CommentsSidePanelService';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { useWishlist } from '../hooks/useWishlist';
import ServiceItem from '../components/ServiceItem';
import BookingHistory from '../components/BookingHistory';
import OperatingSchedule from '../components/OperatingSchedule';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';

// ==========================================
// SERVICE TYPE CONFIGURATION
// ==========================================

const SERVICE_CONFIG = {
  // Cleaning Services
  cleaning: {
    title: 'Cleaning Service',
    icon: <Sparkles className="w-6 h-6" />,
    description: `Professional cleaning service using eco-friendly products. Background-checked staff following strict safety protocols.`,
    options: [
      { id: 'house-cleaning', name: 'Standard Cleaning', description: 'Complete cleaning of living areas', duration: '2-4 hours', price: 'R450', popular: true, icon: <FaBroom /> },
      { id: 'deep-cleaning', name: 'Deep Cleaning', description: 'Intensive detailed cleaning', duration: '4-6 hours', price: 'R850', popular: false, icon: <FaSprayCan /> },
      { id: 'office-cleaning', name: 'Office Cleaning', description: 'Commercial space cleaning', duration: '3-5 hours', price: 'R650', popular: true, icon: <FaBriefcase /> },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning', description: 'Professional steam cleaning', duration: '2-3 hours', price: 'R350', popular: false, icon: <FaTools /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Background Checked', desc: 'All staff verified' },
      { icon: <FaLeaf />, title: 'Eco-Friendly', desc: 'Green cleaning products' }
    ]
  },

  // Catering Services
  catering: {
    title: 'Chef & Catering',
    icon: <Sparkles className="w-6 h-6" />,
    description: `From intimate gatherings to grand celebrations, crafting memorable dining experiences with custom menus using fresh, locally sourced ingredients.`,
    options: [
      { id: 'corporate-catering', name: 'Corporate Events', description: 'Business meetings & lunches', duration: 'Custom', price: 'R150/person', popular: true, icon: <FaBriefcase /> },
      { id: 'wedding-catering', name: 'Wedding Catering', description: 'Full wedding service', duration: 'Custom', price: 'R350/person', popular: false, icon: <FaRing /> },
      { id: 'private-events', name: 'Private Events', description: 'Personal celebrations', duration: 'Custom', price: 'R200/person', popular: true, icon: <FaGlassCheers /> },
      { id: 'meal-prep', name: 'Meal Preparation', description: 'Weekly meal preparation', duration: 'Weekly', price: 'R800/week', popular: false, icon: <FaUtensils /> }
    ],
    highlights: [
      { icon: <FaUtensils />, title: 'Custom Menus', desc: 'Tailored to your taste' },
      { icon: <FaLeaf />, title: 'Fresh Ingredients', desc: 'Locally sourced produce' }
    ]
  },

  // Moving Services
  moving: {
    title: 'Moving Service',
    icon: <TruckIcon className="w-6 h-6" />,
    description: `Stress-free moving with professional packing, furniture handling, and transportation. Experienced team with proper equipment.`,
    options: [
      { id: 'local-moving', name: 'Local Moving', description: 'Within 50km radius', duration: '4-8 hours', price: 'R1800', popular: true, icon: <FaTruck /> },
      { id: 'long-distance', name: 'Long Distance', description: 'Cross-province moves', duration: 'Custom', price: 'Custom Quote', popular: false, icon: <FaCar /> },
      { id: 'office-moving', name: 'Office Moving', description: 'Business relocation', duration: '1-3 days', price: 'R5000+', popular: false, icon: <FaBriefcase /> },
      { id: 'packing-service', name: 'Packing Service', description: 'Full packing assistance', duration: '4-6 hours', price: 'R1200', popular: true, icon: <FaTools /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Insured', desc: 'Full goods insurance' },
      { icon: <FaTools />, title: 'Equipment', desc: 'Professional tools' }
    ]
  },

  // Landscaping Services
  landscaping: {
    title: 'Landscaping',
    icon: <FaTree />,
    description: `Transform your outdoor space with professional landscaping, garden design, lawn care, and maintenance services.`,
    options: [
      { id: 'lawn-care', name: 'Lawn Care', description: 'Mowing, edging, fertilizing', duration: '2-3 hours', price: 'R400', popular: true, icon: <FaLeaf /> },
      { id: 'garden-design', name: 'Garden Design', description: 'Full landscape design', duration: 'Custom', price: 'R2500+', popular: false, icon: <FaPalette /> },
      { id: 'tree-service', name: 'Tree Services', description: 'Trimming and removal', duration: '3-5 hours', price: 'R800', popular: false, icon: <FaTree /> },
      { id: 'maintenance', name: 'Regular Maintenance', description: 'Weekly/bi-weekly care', duration: 'Ongoing', price: 'R600/visit', popular: true, icon: <FaTools /> }
    ],
    highlights: [
      { icon: <FaTree />, title: 'Expert Design', desc: 'Certified landscapers' },
      { icon: <FaLeaf />, title: 'Sustainable', desc: 'Eco-friendly practices' }
    ]
  },

  // Daycare Services
  daycare: {
    title: 'Child Care',
    icon: <FaChild />,
    description: `Professional child care services providing a safe, nurturing environment with qualified caregivers and educational activities.`,
    options: [
      { id: 'full-day', name: 'Full Day Care', description: '8 hours of supervised care', duration: '8 hours', price: 'R350/day', popular: true, icon: <FaChild /> },
      { id: 'half-day', name: 'Half Day Care', description: '4 hours morning or afternoon', duration: '4 hours', price: 'R200/day', popular: false, icon: <FaClock /> },
      { id: 'after-school', name: 'After School Care', description: 'School pickup included', duration: '4 hours', price: 'R250/day', popular: true, icon: <FaGraduationCap /> },
      { id: 'emergency', name: 'Emergency Care', description: 'Short notice booking', duration: 'Flexible', price: 'R400/day', popular: false, icon: <FaShieldAlt /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'CPR Certified', desc: 'Emergency trained staff' },
      { icon: <FaGraduationCap />, title: 'Educational', desc: 'Learning activities' }
    ]
  },

  // School Transport Services
  schoolTransport: {
    title: 'Transport Service',
    icon: <FaBus />,
    description: `Safe and reliable school transportation with vetted drivers, GPS tracking, and comfortable vehicles for your peace of mind.`,
    options: [
      { id: 'daily-route', name: 'Daily School Route', description: 'Morning and afternoon pickup', duration: 'Daily', price: 'R1200/month', popular: true, icon: <FaBus /> },
      { id: 'one-way', name: 'One Way Service', description: 'Morning OR afternoon', duration: 'Daily', price: 'R700/month', popular: false, icon: <FaCar /> },
      { id: 'extracurricular', name: 'Activity Transport', description: 'Sports and activities', duration: 'Per trip', price: 'R80/trip', popular: true, icon: <FaCalendarAlt /> },
      { id: 'special-needs', name: 'Special Needs Transport', description: 'Wheelchair accessible', duration: 'Custom', price: 'R1500/month', popular: false, icon: <FaShieldAlt /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Vetted Drivers', desc: 'Background checked' },
      { icon: <FaMapMarkerAlt />, title: 'GPS Tracked', desc: 'Real-time monitoring' }
    ]
  },

  // Handyman Services
  handyman: {
    title: 'Handyman Service',
    icon: <FaWrench />,
    description: `Expert home maintenance and repair services including plumbing, electrical, painting, and general handyman work.`,
    options: [
      { id: 'plumbing', name: 'Plumbing Services', description: 'Repairs and installations', duration: '1-3 hours', price: 'R450', popular: true, icon: <FaTools /> },
      { id: 'electrical', name: 'Electrical Work', description: 'Certified electrician services', duration: '1-4 hours', price: 'R550', popular: true, icon: <FaTools /> },
      { id: 'painting', name: 'Painting', description: 'Interior and exterior', duration: 'Custom', price: 'R35/sqm', popular: false, icon: <FaPalette /> },
      { id: 'handyman-jobs', name: 'General Handyman', description: 'Odd jobs and repairs', duration: 'Hourly', price: 'R300/hour', popular: true, icon: <FaWrench /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Licensed', desc: 'Certified professionals' },
      { icon: <FaTools />, title: 'Equipped', desc: 'Tools provided' }
    ]
  },

  // Car Wash Services
  carwash: {
    title: 'Car Detailing',
    icon: <FaCar />,
    description: `Premium car wash and detailing using high-quality, eco-friendly products. From sedans to trucks - exterior wash, interior detailing, waxing, and paint protection.`,
    options: [
      { id: 'basic-wash', name: 'Basic Wash', description: 'Exterior wash, wheels, windows', duration: '30-45 min', price: 'R150', popular: true, icon: <FaCar /> },
      { id: 'full-detail', name: 'Full Detail', description: 'Complete interior & exterior', duration: '2-3 hours', price: 'R550', popular: true, icon: <FaSprayCan /> },
      { id: 'interior-only', name: 'Interior Detail', description: 'Deep interior cleaning', duration: '1-2 hours', price: 'R350', popular: false, icon: <FaBroom /> },
      { id: 'exterior-only', name: 'Exterior Detail', description: 'Wash, wax, polish', duration: '1-2 hours', price: 'R300', popular: false, icon: <FaSprayCan /> },
      { id: 'premium-package', name: 'Premium Package', description: 'Full detail + ceramic coating', duration: '4-5 hours', price: 'R1200', popular: false, icon: <FaTrophy /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Paint Safe', desc: 'Premium products' },
      { icon: <FaLeaf />, title: 'Eco-Friendly', desc: 'Water-wise washing' }
    ],
    requiresVehicleType: true
  },

  // Daily Loop Services
  daily: {
    title: 'Daily Loop',
    icon: <Sparkles className="w-6 h-6" />,
    description: `Daily essential chores and tasks made easy. From grocery shopping to pharmacy runs, we take care of your daily routine.`,
    options: [
      { id: 'grocery-run', name: 'Grocery Run', description: 'Shopping and delivery', duration: '1-2 hours', price: 'R150', popular: true, icon: <FaUtensils /> },
      { id: 'pharmacy-drop', name: 'Pharmacy Drop', description: 'Medicine collection', duration: '1 hour', price: 'R100', popular: true, icon: <FaShieldAlt /> },
      { id: 'laundry-service', name: 'Laundry', description: 'Wash, dry, and fold', duration: '24 hours', price: 'R250', popular: false, icon: <FaBus /> },
      { id: 'other-chores', name: 'General Chores', description: 'Custom daily tasks', duration: 'Flexible', price: 'R200/hour', popular: false, icon: <FaClock /> }
    ],
    highlights: [
      { icon: <FaClock />, title: 'Same Day', desc: 'Fast turnaround' },
      { icon: <FaShieldAlt />, title: 'Trusted', desc: 'Verified handlers' }
    ]
  }
};

// Vehicle types configuration (for car wash)
const VEHICLE_TYPES = [
  { id: 'sedan', name: 'Sedan', icon: <FaCar />, priceMultiplier: 1.0 },
  { id: 'suv', name: 'SUV', icon: <FaCar />, priceMultiplier: 1.3 },
  { id: 'van', name: 'Van', icon: <FaTruck />, priceMultiplier: 1.5 },
  { id: 'truck', name: 'Truck', icon: <FaTruck />, priceMultiplier: 1.8 },
  { id: 'motorcycle', name: 'Motorcycle', icon: <FaMotorcycle />, priceMultiplier: 0.6 }
];

// Helper functions
const getServiceConfig = (type) => SERVICE_CONFIG[type] || SERVICE_CONFIG.cleaning;
const getProfessionalTitle = (type) => getServiceConfig(type).title;
const getServiceOptions = (type) => getServiceConfig(type).options;
const getServiceDescription = (type, serviceData) => {
  const base = serviceData?.description || '';
  const configDesc = getServiceConfig(type).description;
  return base || configDesc;
};

const ServicePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [ratings, setRatings] = useState({ cleanliness: 0, communication: 0, overall: 0 });
  const [topComments, setTopComments] = useState([]);
  const { isFavorite, toggleFavorite } = useWishlist(service, 'service');
  const [showAllServices, setShowAllServices] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);
  const [bookingSummary, setBookingSummary] = useState({ count: 0, recentBookers: [] });
  const [zoomedImage, setZoomedImage] = useState(null);

  // Performer Rating States
  const [userBookings, setUserBookings] = useState([]);
  const [showPerformerRatingModal, setShowPerformerRatingModal] = useState(false);
  const [selectedPerformerToRate, setSelectedPerformerToRate] = useState(null);
  const [performerRating, setPerformerRating] = useState(5);
  const [hoveredPerformerRating, setHoveredPerformerRating] = useState(0);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!currentUser || !service) return;
      try {
        const res = await fetch(`/api/bookings/user/${currentUser._id}`);
        if (res.ok) {
          const data = await res.json();
          // Filter bookings that match this service
          const filtered = data.filter(b => b.serviceId === service._id || b.service === service._id);
          setUserBookings(filtered);
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error);
      }
    };
    fetchUserBookings();
  }, [currentUser, service]);

  const handleRatePerformerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPerformerToRate) return;
    try {
      setSubmittingRating(true);
      setRatingError('');
      setRatingSuccess(false);

      const res = await fetch(`/api/service/${service._id}/performer/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          performerName: selectedPerformerToRate.name,
          rating: performerRating
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit rating');
      }

      setRatingSuccess(true);
      
      // Update service state locally to reflect the new performer rating dynamically
      setService(prev => {
        if (!prev) return prev;
        const updatedPerformers = prev.performers.map(p => {
          if (p.name === selectedPerformerToRate.name) {
            return {
              ...p,
              rating: data.performer.rating,
              ratingsCount: data.performer.ratingsCount
            };
          }
          return p;
        });
        return {
          ...prev,
          performers: updatedPerformers
        };
      });

      setTimeout(() => {
        setShowPerformerRatingModal(false);
        setSelectedPerformerToRate(null);
        setRatingSuccess(false);
      }, 1500);

    } catch (err) {
      setRatingError(err.message || 'Something went wrong');
    } finally {
      setSubmittingRating(false);
    }
  };

  const RECENTLY_VIEWED_KEY = 'recentlyViewed';

  useEffect(() => {
    if (service) {
      fetchSimilarServices();
      fetchBookingSummary();
      saveToHistory(service);
    }
  }, [service]);

  const fetchBookingSummary = async () => {
    try {
      const res = await fetch(`/api/bookings/service-summary/${service._id}`);
      if (res.ok) {
        const data = await res.json();
        setBookingSummary(data);
      }
    } catch (error) {
      console.error('Error fetching booking summary:', error);
    }
  };

  const fetchSimilarServices = async () => {
    try {
      const res = await fetch(`/api/service/similar/${serviceId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSimilarServices(data);
    } catch (error) {
      console.error('Error fetching similar services:', error);
    }
  };

  const saveToHistory = (item) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let history = stored ? JSON.parse(stored) : [];
      history = history.filter(h => h._id !== item._id);
      history.unshift({
        ...item,
        itemType: 'service',
        viewedAt: new Date().toISOString()
      });
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    selectedServices: [],
    date: '',
    time: '',
    locationOption: 'comeToYou',
    address: '',
    specialRequirements: '',
    numberOfGuests: '1',
    // Multi-select performers
    selectedPerformers: [],
    // Car Wash Detailing Options
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    carWashType: 'full', // full, hoover, washHoover
    thoroughHoover: false,
    engineCleaning: false,
    matCleaning: false,
    carSeatCleaning: false,
    bodyPolish: false,
    tirePolish: false,
    backPolish: false,
    interiorPolish: false,
    electricityProvided: 'no',
    foodProvided: 'no',
    // Moving-specific
    moveFromAddress: '',
    moveToAddress: '',
    moveRooms: '',
    moveFloorFrom: '',
    moveFloorTo: '',
    moveHasLift: '',
    moveHeavyItems: '',
    movePackingRequired: '',
    // Handyman / Maintenance
    handymanJobType: '',
    handymanJobDescription: '',
    handymanMaterialsRequired: '',
    handymanUrgency: 'normal',
    // Landscaping
    landscapingServiceType: '',
    landscapeAreaSize: '',
    landscapeFrequency: '',
    landscapeEquipmentAvailable: '',
    // Catering
    cateringEventType: '',
    cateringGuestCount: '',
    cateringMenuPreference: '',
    cateringDietaryReqs: '',
    cateringEventDuration: '',
    cateringVenueType: '',
  });

  const [enhancedServiceData] = useState({
    yearsExperience: 5,
    teamSize: 'Individual Professional',
    certifications: ['Certified Professional', 'Safety Certified'],
    languages: ['English', 'Afrikaans'],
    availability: 'Mon-Sun, 7AM-9PM',
    responseTime: 'Within 1 hour',
    repeatClients: '85%',
    completionRate: '98%',
    insuranceCoverage: true,
    equipmentProvided: true,
    ecoFriendly: false,
    emergencyService: true,
    warrantyPeriod: '30-day satisfaction guarantee',
    trainingCertified: true,
    backgroundChecked: true,
    membership: 'Professional Services Association',
    awards: ['Service Excellence 2023', 'Top Rated Provider']
  });

  // Get current service configuration
  const currentServiceConfig = service ? getServiceConfig(service.type) : null;
  const requiresVehicleType = currentServiceConfig?.requiresVehicleType || false;

  useEffect(() => {
    if (service) {
      const basePrice = parseInt(service.regularPrice) || 0;
      const travelFee = parseInt(service.travelFee) || 0;
      
      let selectedPrice = 0;
      if (selectedService && selectedService.price) {
        selectedPrice = parseInt(String(selectedService.price).replace(/[^\d]/g, '')) || 0;
      }

      const totalBase = selectedPrice > 0 ? selectedPrice : basePrice;
      const serviceFee = Math.round(totalBase * 0.1);
      setTotalPrice(totalBase + travelFee + serviceFee);
    }
  }, [service, selectedService]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/service/get/${serviceId}`);
        if (!res.ok) throw new Error('Failed to fetch service details');
        const data = await res.json();
        setService(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const getOperatingStatus = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const currentDay = days[now.getDay()];
    
    // Default schedule: 08:00 - 19:00, closed on Sunday
    const defaultSchedule = { open: '08:00', close: '19:00', closed: currentDay === 'sunday' };
    const schedule = service?.operatingHours?.[currentDay] || defaultSchedule;

    if (!schedule || schedule.closed) return { isClosed: true, reason: 'Closed today' };

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = schedule.open.split(':').map(Number);
    const [closeH, closeM] = (schedule.close || '19:00').split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    if (currentTime < openTime) return { isClosed: true, reason: `Opens at ${schedule.open}` };
    if (currentTime >= closeTime) return { isClosed: true, reason: `Closed at ${schedule.close || '19:00'}` };

    return { isClosed: false };
  };

  const operatingStatus = getOperatingStatus();

  const isSelectedTimeClosed = () => {
    if (!bookingData.time || !bookingData.date) return false;
    const date = new Date(bookingData.date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[date.getDay()];
    
    const defaultSchedule = { open: '08:00', close: '19:00', closed: dayName === 'sunday' };
    const schedule = service?.operatingHours?.[dayName] || defaultSchedule;
    
    if (!schedule || schedule.closed) return true;

    const [selH, selM] = bookingData.time.split(':').map(Number);
    const selectedTime = selH * 60 + selM;
    const [openH, openM] = schedule.open.split(':').map(Number);
    const [closeH, closeM] = (schedule.close || '19:00').split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    return selectedTime < openTime || selectedTime >= closeTime;
  };

  // Fetch ratings and top comments
  useEffect(() => {
    const fetchCommentData = async () => {
      if (!serviceId) return;
      try {
        const res = await fetch(`/api/service-comments/${serviceId}?limit=6`);
        if (res.ok) {
          const data = await res.json();
          setCommentCount(data.totalComments || 0);
          setTopComments(data.comments || []);
          if (data.ratings) {
            setRatings({
              cleanliness: data.ratings.cleanliness || 0,
              communication: data.ratings.staff || data.ratings.communication || 0,
              overall: data.ratings.overall || 0
            });
          }
        }
      } catch (err) {
        console.error('Error fetching comment data:', err);
      }
    };
    if (serviceId) fetchCommentData();
  }, [serviceId]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const digitsOnly = String(contact).replace(/\D/g, '');
    return digitsOnly.startsWith('0') ? '27' + digitsOnly.substring(1) : digitsOnly;
  };

  const generateMapLink = (address) => {
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleTypeSelect = (vehicleTypeId) => {
    setBookingData(prev => ({ ...prev, vehicleType: vehicleTypeId }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: `Check out ${service.name} on loopOut`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const openFullScreenGallery = (index = 0) => {
    setModalImageIndex(index);
    setShowFullScreenGallery(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullScreenGallery = () => {
    setShowFullScreenGallery(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (service?.imageUrls?.length > 0) {
      setModalImageIndex(prev => prev === service.imageUrls.length - 1 ? 0 : prev + 1);
    }
  };

  const prevImage = () => {
    if (service?.imageUrls?.length > 0) {
      setModalImageIndex(prev => prev === 0 ? service.imageUrls.length - 1 : prev - 1);
    }
  };

  // Function to open full-page booking form overlay
  const openBookingModal = (serviceOption = null) => {
    setSelectedService(serviceOption);
    setShowBookingModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Function to close full-page booking form overlay
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setAttachments([]);
    document.body.style.overflow = 'auto';
  };

  // Handle file attachments
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isSizeValid = file.size <= 5 * 1024 * 1024; // 5MB
      return (isImage || isPDF) && isSizeValid;
    });
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
            null, // No UI progress tracking currently in Services.jsx
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

  // Toggle performer in multi-select list
  const togglePerformer = (performerName) => {
    setBookingData(prev => {
      const already = prev.selectedPerformers.includes(performerName);
      return {
        ...prev,
        selectedPerformers: already
          ? prev.selectedPerformers.filter(n => n !== performerName)
          : [...prev.selectedPerformers, performerName]
      };
    });
  };

  const buildWhatsAppMessage = async (isQuick = false) => {
    const whatsappNumber = formatContactForWhatsApp(service.contact);
    if (!whatsappNumber) return null;

    let uploadedFiles = [];
    if (attachments.length > 0) {
      uploadedFiles = await uploadFilesToCloud(attachments);
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Format the client's phone number for the reply link
    const clientPhone = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';

    // Define accept and decline messages
    const acceptMessage = `Hi ${bookingData.name}, I accept your booking for ${service.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, unfortunately I'm unable to accept your booking for ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    let message = isQuick
      ? `*📅 QUICK SERVICE BOOKING* 📅\n\n`
      : `*🛎️ NEW SERVICE BOOKING* 🛎️\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*💼 SERVICE DETAILS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚒️ *Service:* ${service.name}\n`;
    message += `📋 *Type:* ${getProfessionalTitle(service.type)}\n`;

    if (selectedService) {
      message += `📜 *Option:* ${selectedService.name} (${selectedService.price})\n`;
    }

    message += `📅 *Date:* ${bookingData.date || 'Not specified'}\n`;
    message += `⏰ *Time:* ${bookingData.time || 'Not specified'}\n`;

    // Multi-select performers
    if (bookingData.selectedPerformers && bookingData.selectedPerformers.length > 0) {
      message += `👥 *Requested Provider(s):* ${bookingData.selectedPerformers.join(', ')}\n`;
    }
    message += `\n`;

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*👤 CLIENT INFORMATION*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *Name:* ${bookingData.name}\n`;
    message += `📞 *Phone:* ${bookingData.phone}\n\n`;

    if (bookingData.address) {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*📍 SERVICE LOCATION*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🏠 *Address:* ${bookingData.address}\n`;
      const mapLink = generateMapLink(bookingData.address);
      if (mapLink) message += `🗺️ *Navigate:* ${mapLink}\n`;
      message += `\n`;
    }

    // ── Car Wash ──
    if (requiresVehicleType && bookingData.vehicleType) {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*🚗 VEHICLE & DETAILING*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🚗 *Type:* ${VEHICLE_TYPES.find(v => v.id === bookingData.vehicleType)?.name}\n`;
      if (bookingData.vehicleMake) message += `🔖 *Make:* ${bookingData.vehicleMake}\n`;
      if (bookingData.vehicleModel) message += `🚘 *Model:* ${bookingData.vehicleModel}\n`;
      if (bookingData.licensePlate) message += `🆔 *Plate:* ${bookingData.licensePlate}\n`;
      const washTypes = { full: 'Full Car Wash', hoover: 'Hoover Only', washHoover: 'Wash + Hoover' };
      message += `🧼 *Wash:* ${washTypes[bookingData.carWashType] || 'Standard'}\n`;
      let cleaningDetails = [];
      if (bookingData.thoroughHoover) cleaningDetails.push('Thorough Hoover');
      if (bookingData.engineCleaning) cleaningDetails.push('Engine Cleaning');
      if (bookingData.matCleaning) cleaningDetails.push('Mat Cleaning');
      if (bookingData.carSeatCleaning) cleaningDetails.push('Car Seat Cleaning');
      if (cleaningDetails.length > 0) message += `🧹 *Deep Clean:* ${cleaningDetails.join(', ')}\n`;
      let polishDetails = [];
      if (bookingData.bodyPolish) polishDetails.push('Body');
      if (bookingData.tirePolish) polishDetails.push('Tire');
      if (bookingData.backPolish) polishDetails.push('Back');
      if (bookingData.interiorPolish) polishDetails.push('Interior');
      if (polishDetails.length > 0) message += `✨ *Polish:* ${polishDetails.join(', ')}\n`;
      message += `\n`;
    }

    // ── Moving ──
    if (service.type === 'moving') {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*🚛 MOVING DETAILS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (bookingData.moveFromAddress) message += `📦 *From:* ${bookingData.moveFromAddress}\n`;
      if (bookingData.moveToAddress) message += `🏁 *To:* ${bookingData.moveToAddress}\n`;
      if (bookingData.moveRooms) message += `🛏️ *Rooms/Size:* ${bookingData.moveRooms}\n`;
      if (bookingData.moveFloorFrom) message += `🏢 *Floor (From):* ${bookingData.moveFloorFrom}\n`;
      if (bookingData.moveFloorTo) message += `🏢 *Floor (To):* ${bookingData.moveFloorTo}\n`;
      if (bookingData.moveHasLift) message += `🛗 *Lift/Elevator:* ${bookingData.moveHasLift}\n`;
      if (bookingData.moveHeavyItems) message += `🪑 *Heavy items:* ${bookingData.moveHeavyItems}\n`;
      if (bookingData.movePackingRequired) message += `📦 *Packing service needed:* ${bookingData.movePackingRequired}\n`;
      message += `\n`;
    }

    // ── Handyman / Maintenance ──
    if (service.type === 'handyman' || service.type === 'maintenance') {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*🔧 JOB DETAILS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (bookingData.handymanJobType) message += `🔨 *Job Type:* ${bookingData.handymanJobType}\n`;
      if (bookingData.handymanJobDescription) message += `📋 *Description:* ${bookingData.handymanJobDescription}\n`;
      if (bookingData.handymanMaterialsRequired) message += `🛒 *Materials needed:* ${bookingData.handymanMaterialsRequired}\n`;
      message += `⚡ *Urgency:* ${bookingData.handymanUrgency === 'urgent' ? '🔴 Urgent' : bookingData.handymanUrgency === 'flexible' ? '🟢 Flexible' : '🟡 Normal'}\n`;
      message += `\n`;
    }

    // ── Landscaping ──
    if (service.type === 'landscaping') {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*🌿 GARDEN DETAILS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (bookingData.landscapingServiceType) message += `🌱 *Service Type:* ${bookingData.landscapingServiceType}\n`;
      if (bookingData.landscapeAreaSize) message += `📐 *Area Size:* ${bookingData.landscapeAreaSize}\n`;
      if (bookingData.landscapeFrequency) message += `🔄 *Frequency:* ${bookingData.landscapeFrequency}\n`;
      if (bookingData.landscapeEquipmentAvailable) message += `🪣 *Equipment available:* ${bookingData.landscapeEquipmentAvailable}\n`;
      message += `\n`;
    }

    // ── Catering ──
    if (service.type === 'catering') {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*🍽️ CATERING DETAILS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (bookingData.cateringEventType) message += `🎉 *Event Type:* ${bookingData.cateringEventType}\n`;
      if (bookingData.cateringGuestCount) message += `👥 *Guest Count:* ${bookingData.cateringGuestCount}\n`;
      if (bookingData.cateringMenuPreference) message += `🍴 *Menu Preference:* ${bookingData.cateringMenuPreference}\n`;
      if (bookingData.cateringDietaryReqs) message += `🥗 *Dietary Requirements:* ${bookingData.cateringDietaryReqs}\n`;
      if (bookingData.cateringEventDuration) message += `⏱️ *Event Duration:* ${bookingData.cateringEventDuration}\n`;
      if (bookingData.cateringVenueType) message += `🏛️ *Venue Type:* ${bookingData.cateringVenueType}\n`;
      message += `\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*🍴 PROVISIONS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🍽️ *Food provided by client:* ${bookingData.foodProvided === 'yes' ? '✅ Yes' : '❌ No'}\n`;
    message += `⚡ *Electricity available:* ${bookingData.electricityProvided === 'yes' ? '✅ Yes' : '❌ No'}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*💬 COMMENTS & NOTES*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📝 ${bookingData.specialRequirements ? bookingData.specialRequirements : 'No special requirements'}\n`;
    if (bookingData.numberOfGuests && bookingData.numberOfGuests !== '1') {
      message += `👥 *Guests:* ${bookingData.numberOfGuests}\n`;
    }
    message += `\n`;

    // Add attachments if they exist
    if (uploadedFiles.length > 0) {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*📎 ATTACHMENTS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: ${file.name}\n`;
        message += `  ${file.url}\n\n`;
      });
    }

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*💵 TOTAL AMOUNT*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💵 *Total Est:* R${totalPrice}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*⚡ QUICK ACTIONS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    if (acceptLink) message += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
    if (declineLink) message += `❌ *REJECT:*\n${declineLink}\n\n`;

    message += `🔐 *Verification Code:* ${verificationCode}\n`;
    message += `_Sent via loopOut_`;

    return { 
      url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      fullMessage: message 
    };
  };

  const handleQuickBooking = async () => {
    if (!service?.contact) {
      alert("Service contact information is missing.");
      return;
    }
    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number first.");
      return;
    }
    if (!bookingData.date || !bookingData.time) {
      alert("Please select date and time for your booking.");
      return;
    }

    if (isSelectedTimeClosed()) {
      alert("The selected time falls outside of this service's operating hours. Please check their schedule and select another time.");
      return;
    }

    const { url } = await buildWhatsAppMessage(true);
    if (url) window.open(url, '_blank');
  };

  
  const handleEscrowCheckout = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in';
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

    if (!service?.contact) {
      alert("Service contact information is missing.");
      return;
    }

    // Basic validation
    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      alert("Please select date and time for your booking.");
      return;
    }

    if (isSelectedTimeClosed()) {
      alert("The selected time falls outside of this service's operating hours. Please check their schedule and select another time.");
      return;
    }

    if (!bookingData.address) {
      alert("Please provide your address for service.");
      return;
    }

    setIsUploading(true);

    try {
      const result = await buildWhatsAppMessage(false);
      
      if (result && result.url) {
        // Save to Database first
        // Create a descriptive subtype for better display in the dashboard/cart
        let bookingSubtype = service.type;
        if (service.type === 'carwash') {
          const vehicleLabel = VEHICLE_TYPES.find(v => v.id === bookingData.vehicleType)?.name || 'Car';
          const washTypes = { full: 'Full Wash', hoover: 'Hoover', washHoover: 'Wash & Hoover' };
          const washLabel = washTypes[bookingData.carWashType] || 'Wash';
          bookingSubtype = `${vehicleLabel} - ${washLabel}`;
        } else if (service.type === 'cleaning') {
          bookingSubtype = 'House Cleaning';
        } else if (service.type === 'schoolTransport') {
          bookingSubtype = 'School Transport';
        } else if (service.type === 'moving') {
          bookingSubtype = `Moving - ${bookingData.moveRooms || 'Custom'}`;
        } else if (service.type === 'handyman' || service.type === 'maintenance') {
          bookingSubtype = bookingData.handymanJobType || 'Handyman Job';
        } else if (service.type === 'landscaping') {
          bookingSubtype = bookingData.landscapingServiceType || 'Landscaping';
        } else if (service.type === 'catering') {
          bookingSubtype = `${bookingData.cateringEventType || 'Catering'} - ${bookingData.cateringGuestCount ? bookingData.cateringGuestCount + ' guests' : ''}`;
        }

        // Determine device type
        const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
        const requestLocation = bookingData.address || '';

        const bookingToSave = {
          userId: currentUser?._id || "guest",
          serviceId: service._id,
          startDate: bookingData.date + "T" + bookingData.time,
          endDate: bookingData.date + "T" + bookingData.time, // Same day for services
          totalPrice: totalPrice,
          phone: bookingData.phone,
          message: bookingData.specialRequirements || result.fullMessage,
          subtype: bookingSubtype,
          selectedPerformers: bookingData.selectedPerformers,
          selectedPerformer: bookingData.selectedPerformers?.[0] || '',
          performerExperience: service.performers?.find(p => p.name === bookingData.selectedPerformers?.[0])?.experience,
          performerImage: service.performers?.find(p => p.name === bookingData.selectedPerformers?.[0])?.image,
          deviceType,
          requestLocation,
          status: 'pending'
        };

        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingToSave)
        });

        window.open(result.url, '_blank');
      }
    } catch (saveError) {
      console.error('Failed to save booking or process WhatsApp:', saveError);
    } finally {
      setIsUploading(false);
      closeBookingModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton Hero */}
        <div className="h-[420px] md:h-[520px] bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 rounded-xl animate-pulse w-1/2" />
              </div>
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded-xl animate-pulse w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-xl animate-pulse w-1/4" />
                  </div>
                </div>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div>
              <div className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <XMarkIcon className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-rose-200 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <InformationCircleIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <p className="text-gray-500 mb-6">This service may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate('/service-home-page')}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all active:scale-95"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  const fullDescription = getServiceDescription(service.type, service);
  const displayText = showFullDescription ? fullDescription : fullDescription.slice(0, 300) + (fullDescription.length > 300 ? "..." : "");
  
  // Prioritize dynamic serviceList from database, fallback to hardcoded options
  const serviceOptions = (service.serviceList && service.serviceList.length > 0) 
    ? service.serviceList.map(s => ({
        ...s,
        id: s.name,
        icon: <FaCheckCircle className="text-rose-500" />,
        description: s.description || 'Professional service package',
        duration: 'Custom'
      }))
    : getServiceOptions(service.type);
    
  const displayedServices = showAllServices ? serviceOptions : serviceOptions.slice(0, 4);
  const whatsappNumber = formatContactForWhatsApp(service.contact);
  const serviceHighlights = currentServiceConfig?.highlights || [];

  return (
    <div className="min-h-screen pb-20 lg:pb-0 bg-white">
      {/* Navigation Header - Transparent on top of image */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              onClick={() => navigate(-1)}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                isScrolled
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-sm'
                  : 'bg-black/25 hover:bg-black/40 text-white backdrop-blur-md border border-white/20'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isScrolled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-sm'
                    : 'bg-black/25 hover:bg-black/40 text-white backdrop-blur-md border border-white/20'
                }`}
              >
                <FiShare2 className="text-lg" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isScrolled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-sm'
                    : 'bg-black/25 hover:bg-black/40 backdrop-blur-md border border-white/20'
                }`}
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-6 h-6 text-rose-500 drop-shadow-sm" />
                ) : (
                  <HeartIcon className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Image Gallery - Full Width */}
      <div className="relative h-[420px] md:h-[520px] lg:h-[620px] bg-slate-900 overflow-hidden">
        {service.imageUrls?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1.5 h-full w-full">
            {/* Main image */}
            <div
              className="md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden group"
              onClick={() => openFullScreenGallery(0)}
            >
              <img
                src={service.imageUrls[0]}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Bottom gradient for mobile readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            </div>

            {service.imageUrls.slice(1, 5).map((url, index) => (
              <div
                key={index}
                className="relative cursor-pointer hidden md:block overflow-hidden group"
                onClick={() => openFullScreenGallery(index + 1)}
              >
                <img
                  src={url}
                  alt={`${service.name} ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </div>
            ))}

            <button
              onClick={() => openFullScreenGallery(0)}
              className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl font-semibold text-sm text-slate-900 flex items-center gap-2.5 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl border border-slate-200/60"
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>Show all {service.imageUrls.length} photos</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-3">
            <PhotoIcon className="w-16 h-16 text-slate-300" />
            <p className="text-slate-400 text-sm font-medium">No photos available</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">{service.name}</h1>
                {operatingStatus.isClosed ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-2xl shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Closed now</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Open now</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <StarIconSolid className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-gray-900">{service.rating || '4.5'}</span>
                  <span className="text-gray-400">({service.reviewCount || commentCount || '0'} reviews)</span>
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{service.address || 'Available in your area'}</span>
                </span>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  {currentServiceConfig?.icon}
                  {getProfessionalTitle(service.type)}
                </span>
              </div>
            </div>


            {/* Provider Info */}
            <div className="py-6 border-b border-gray-200">
              <Link 
                to={`/user-profile/${service.userRef?._id || service.userRef || service.creator}`}
                className="flex items-start gap-4 hover:opacity-80 transition-opacity w-fit"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm border border-gray-100">
                  <img
                    src={service.userRef?.avatar || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={service.userRef?.username || service.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'; }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">Provided by {service.userRef?.username || service.name}</h2>
                  <p className="text-gray-600 font-medium">{getProfessionalTitle(service.type)}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {service.providerType === 'company' && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <FaBriefcase className="text-gray-400" /> Company
                      </span>
                    )}
                    {service.providerType === 'individual' && service.citizenship && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <FaUser className="text-gray-400" /> Citizenship: {service.citizenship}
                      </span>
                    )}
                    {service.security && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-500" /> Verified
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <FaBriefcase className="text-gray-400" /> {enhancedServiceData.yearsExperience}+ years exp
                    </span>
                  </div>
                </div>
              </Link>
            </div>


            {/* Highlights */}
            <div className="py-6 border-b border-gray-200 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <HomeIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Provided at your location</h3>
                  <p className="text-gray-600 text-sm">Service provider travels to you</p>
                </div>
              </div>

              <div className="py-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-gray-900" />
                  <h3 className="font-bold text-gray-900">Weekly Schedule</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const schedule = service.operatingHours?.[day] || { closed: true };
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
                    
                    return (
                      <div 
                        key={day} 
                        className={`flex flex-col p-3 rounded-xl border ${isToday ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50/50'}`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-rose-600' : 'text-gray-400'}`}>
                          {day.slice(0, 3)}
                        </span>
                        {schedule.closed ? (
                          <span className="text-[10px] font-bold text-gray-500 mt-1">Closed</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black mt-1 ${isToday && operatingStatus.isClosed ? 'text-rose-500' : 'text-gray-900'}`}>
                              {schedule.open} - {schedule.close}
                            </span>
                            {isToday && operatingStatus.isClosed && (
                              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Closed</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BoltIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{enhancedServiceData.responseTime}</h3>
                  <p className="text-gray-600 text-sm">Average response time</p>
                </div>
              </div>

              {serviceHighlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {highlight.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{highlight.title}</h3>
                    <p className="text-gray-600 text-sm">{highlight.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this service</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {displayText.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {fullDescription.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-4 font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 flex items-center gap-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                  {showFullDescription ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Service Options */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Service options</h2>
              <div className="space-y-4">
                {displayedServices.map((option, idx) => {
                  const isSelected = selectedService?.id === option.id;
                  return (
                    <div
                      key={`${option.id}-${idx}`}
                      className={`flex items-start justify-between p-4 border-2 rounded-xl transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedModalService(option)}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-start gap-3 mb-1">
                          {option.image && (
                            <img src={option.image} alt={option.name} className="w-12 h-12 object-cover rounded-lg border bg-white shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>{option.icon}</span>
                              <h3 className={`font-semibold ${isSelected ? 'text-rose-700' : 'text-gray-900'}`}>{option.name}</h3>
                              {option.popular && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded">
                                  Popular
                                </span>
                              )}
                              {option.type && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded">
                                  {option.type}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{option.duration}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className={`font-semibold ${isSelected ? 'text-rose-600' : 'text-gray-900'}`}>
                          {typeof option.price === 'number' || (option.price && !String(option.price).startsWith('R')) ? `R${option.price}` : option.price}
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingModal(option);
                          }}
                          className={`mt-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-rose-500 text-white' 
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {isSelected ? 'Book Now' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {serviceOptions.length > 4 && (
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="mt-4 font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 flex items-center gap-2"
                >
                  {showAllServices ? 'Show less' : `Show all ${serviceOptions.length} options`}
                  {showAllServices ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Qualifications */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Qualifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <BriefcaseIcon className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{enhancedServiceData.yearsExperience} years of experience</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional experience in {getProfessionalTitle(service.type).toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrophyIcon className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Certified Professional</h3>
                    <p className="text-gray-600 text-sm mt-1">Licensed and insured service provider</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserGroupIcon className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Notable Clientele</h3>
                    <p className="text-gray-600 text-sm mt-1">Trusted by repeat customers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trained & Certified</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional training completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Performers Section */}
            {service.performers && service.performers.length > 0 && (
              <div className="py-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Performers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.performers.map((performer, idx) => {
                    const hasBookedPerformer = userBookings.some(b => b.selectedPerformer === performer.name);
                    const perfRating = performer.rating || 5;
                    const perfRatingsCount = performer.ratingsCount || 0;

                    return (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div 
                            onClick={() => performer.image && setZoomedImage(performer.image)}
                            className={`w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ${performer.image ? 'cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all' : ''}`}
                          >
                            {performer.image ? (
                              <img src={performer.image} alt={performer.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <FaUser />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">{performer.name}</h4>
                              <div className="flex items-center gap-0.5 bg-rose-50 px-2 py-0.5 rounded-full text-rose-600">
                                <StarIconSolid className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-[11px] font-black">{Number(perfRating).toFixed(1)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">{performer.experience} experience</p>
                            {perfRatingsCount > 0 && (
                              <p className="text-[10px] text-slate-400 font-medium">({perfRatingsCount} {perfRatingsCount === 1 ? 'rating' : 'ratings'})</p>
                            )}
                          </div>
                        </div>

                        {/* Rating Button */}
                        <div className="relative">
                          {hasBookedPerformer ? (
                            <button
                              onClick={() => {
                                setSelectedPerformerToRate(performer);
                                setPerformerRating(perfRating);
                                setShowPerformerRatingModal(true);
                              }}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full text-xs font-black uppercase tracking-wider transition-colors active:scale-95 cursor-pointer shadow-sm"
                            >
                              Rate
                            </button>
                          ) : (
                            <div 
                              className="px-4 py-2 bg-slate-50 text-slate-300 rounded-full text-xs font-black uppercase tracking-wider cursor-not-allowed shadow-inner"
                              title={`You can rate ${performer.name} after booking their service!`}
                            >
                              Rate
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-8">
                <StarIconSolid className="text-[#FFB400] w-7 h-7 drop-shadow-sm" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {ratings && ratings.overall > 0 ? ratings.overall.toFixed(1) : (service.rating || '4.5')} · {commentCount} reviews
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
                        <FaCommentDots className="text-xl" />
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
                              <div className="h-full bg-gradient-to-br from-[#F8F9FA] to-white border border-[#EBEBEB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#FFB400]/10 to-transparent rounded-bl-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
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
                                        <HeartIconSolid className="w-3 h-3" />
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
                className="px-6 py-3 border-2 border-slate-900 text-slate-900 font-semibold rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-300 w-full sm:w-auto active:scale-95"
              >
                Show all {commentCount} reviews
              </button>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Premium Booking Card */}
              <div className="rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-slate-100 overflow-hidden bg-white">
                {/* Card Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Starting from</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold">R{service.regularPrice}</span>
                        <span className="text-slate-400 text-sm">/ service</span>
                      </div>
                    </div>
                    {service.discountPrice && (
                      <span className="text-slate-500 line-through text-sm">R{service.discountPrice}</span>
                    )}
                  </div>
                  {/* Rating pill */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
                      <StarIconSolid className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-white text-xs font-bold">{service.rating || '4.5'}</span>
                    </div>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-300 text-xs">{commentCount} reviews</span>
                    {!operatingStatus.isClosed && (
                      <>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Open now
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Date/Time Inputs */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 hover:border-slate-300 transition-colors">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full text-sm text-slate-800 font-semibold outline-none bg-transparent"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 hover:border-slate-300 transition-colors">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time</label>
                      <input
                        type="time"
                        className="w-full text-sm text-slate-800 font-semibold outline-none bg-transparent"
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Performer Selection in Card */}
                  {service.performers && service.performers.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Performer</label>
                      <select
                        name="selectedPerformer"
                        value={bookingData.selectedPerformer}
                        onChange={handleBookingChange}
                        className="w-full text-sm text-slate-800 font-semibold outline-none bg-transparent"
                      >
                        <option value="">Any available member</option>
                        {service.performers.map((p, i) => (
                          <option key={i} value={p.name}>{p.name} ({p.experience})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Guests</label>
                    <select
                      className="w-full text-sm text-slate-800 font-semibold outline-none bg-transparent"
                      onChange={(e) => setBookingData(prev => ({ ...prev, numberOfGuests: e.target.value }))}
                    >
                      <option value="1">1 guest</option>
                      <option value="2">2 guests</option>
                      <option value="3">3 guests</option>
                      <option value="4">4+ guests</option>
                    </select>
                  </div>

                  {/* CTA Buttons */}
                  <button
                    onClick={() => openBookingModal()}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="text-lg" />
                    Book via WhatsApp
                  </button>

                  <button
                    onClick={handleEscrowCheckout}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <FaShieldAlt />
                    Secure Escrow Payment
                  </button>

                  <p className="text-center text-slate-400 text-xs font-medium">You won't be charged yet</p>

                  {/* Price Breakdown */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
                    {selectedService ? (
                      <div className="flex justify-between text-slate-700">
                        <span className="underline underline-offset-2">{selectedService.name}</span>
                        <span className="font-semibold">{selectedService.price}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-slate-700">
                        <span className="underline underline-offset-2">Base price</span>
                        <span className="font-semibold">R{service.regularPrice}</span>
                      </div>
                    )}
                    {service.travelFee > 0 && (
                      <div className="flex justify-between text-slate-700">
                        <span className="underline underline-offset-2">Travel fee</span>
                        <span className="font-semibold">R{service.travelFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span className="underline underline-offset-2">Service fee (10%)</span>
                      <span>R{Math.round((totalPrice - (parseInt(service.travelFee) || 0)) / 1.1 * 0.1)}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                      <span>Total estimate</span>
                      <span>R{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Provider Card */}
              <div className="rounded-3xl border border-slate-100 p-5 bg-white shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Contact provider directly</h3>
                <div className="space-y-2.5">
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Hi ${service.name}, I'm interested in your services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#25D366] hover:bg-[#22C55E] text-white font-semibold rounded-2xl transition-all hover:shadow-md active:scale-95"
                    >
                      <FaWhatsapp className="text-xl" />
                      Message on WhatsApp
                    </a>
                  )}
                  {service.contact && (
                    <a
                      href={`tel:${service.contact}`}
                      className="flex items-center justify-center gap-2.5 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl transition-all active:scale-95"
                    >
                      <FaPhone />
                      Call {service.contact}
                    </a>
                  )}
                </div>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <FaShieldAlt className="text-slate-500 text-lg" />
                </div>
                <p className="text-xs text-slate-500 leading-snug">To protect your payment, always communicate and pay through our platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookers Section */}
        <BookingHistory bookingSummary={bookingSummary} providerName={service?.name} providerType={service?.type} />



        {/* Location Map */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
          <div className="w-full h-[450px] bg-black rounded-[2rem] overflow-hidden relative border border-slate-100/10 shadow-2xl">
            <GoogleMapComponent 
              address={service.address || 'Available in your area'} 
              title={`${service.name}'s Service Area`} 
            />
          </div>
        </div>

        {/* Things to Know */}
        <div className="mt-12 pt-12 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Things to know</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <UserGroupIcon className="w-5 h-5" />,
                title: 'Guest requirements',
                body: 'Ages 13 and up can attend. Message for specific requirements.'
              },
              {
                icon: <ArrowPathIcon className="w-5 h-5" />,
                title: 'Cancellation policy',
                body: 'Cancel at least 24 hours before your booking for a full refund.'
              },
              {
                icon: <CheckCircleIcon className="w-5 h-5" />,
                title: 'What to prepare',
                body: 'Any specific materials or access requirements will be discussed upon booking.'
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-white shadow-sm text-slate-600 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Screen Gallery */}
      {showFullScreenGallery && service.imageUrls && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={closeFullScreenGallery} className="p-2 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
            <span className="font-medium">{modalImageIndex + 1} / {service.imageUrls.length}</span>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <img
              src={service.imageUrls[modalImageIndex]}
              alt={`Gallery ${modalImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            <button
              onClick={nextImage}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal - Full Page Form */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-black text-slate-900">Complete your booking</h2>
                <p className="text-xs text-slate-400 font-medium">{service.name}</p>
              </div>
              <button onClick={closeBookingModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                <XMarkIcon className="w-5 h-5 text-slate-500 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
              {selectedService && (
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                      <p className="text-gray-600 text-sm">{selectedService.duration}</p>
                    </div>
                    <span className="font-semibold text-gray-900">{selectedService.price}</span>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleBookingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="071 234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Performer Multi-Selection in Overlay */}
              {service.performers && service.performers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Select service provider(s)</h3>
                    {bookingData.selectedPerformers.length > 0 && (
                      <span className="text-xs font-black bg-rose-100 text-rose-600 px-3 py-1 rounded-full">
                        {bookingData.selectedPerformers.length} selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4">You can select more than one provider. Leave empty for any available.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.performers.map((p, i) => {
                      const isSelected = bookingData.selectedPerformers.includes(p.name);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => togglePerformer(p.name)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 relative ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50 shadow-sm shadow-rose-100'
                              : 'border-gray-100 hover:border-rose-200 hover:bg-rose-50/30'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                              {p.image
                                ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-black">{p.name?.[0]}</div>
                              }
                            </div>
                            {isSelected && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow">
                                <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm truncate">{p.name}</div>
                            {p.experience && <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{p.experience} exp</p>}
                            {p.rating > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <StarIconSolid className="w-3 h-3 text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-500">{p.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {bookingData.selectedPerformers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({ ...prev, selectedPerformers: [] }))}
                      className="mt-3 text-xs text-slate-400 hover:text-rose-500 underline transition-colors"
                    >
                      Clear selection (any available)
                    </button>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Date & time</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={bookingData.time}
                      onChange={handleBookingChange}
                      required
                      className={`w-full px-4 py-2 border ${isSelectedTimeClosed() ? 'border-rose-500 bg-rose-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                    />
                    {isSelectedTimeClosed() && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        Outside business hours
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Details (if required) */}
              {requiresVehicleType && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Vehicle details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle type *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {VEHICLE_TYPES.map((vehicle) => (
                          <button
                            key={vehicle.id}
                            type="button"
                            onClick={() => handleVehicleTypeSelect(vehicle.id)}
                            className={`p-3 border rounded-lg text-center transition-colors ${bookingData.vehicleType === vehicle.id
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            <div className="text-2xl mb-1">{vehicle.icon}</div>
                            <div className="text-xs font-medium">{vehicle.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Make (optional)</label>
                        <input
                          type="text"
                          name="vehicleMake"
                          value={bookingData.vehicleMake}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          placeholder="e.g. Toyota"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model (optional)</label>
                        <input
                          type="text"
                          name="vehicleModel"
                          value={bookingData.vehicleModel}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          placeholder="e.g. Corolla"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License plate (optional)</label>
                      <input
                        type="text"
                        name="licensePlate"
                        value={bookingData.licensePlate}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="e.g. ABC 123 GP"
                      />
                    </div>

                    {/* Car Wash Detailing Selection */}
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-sm font-bold text-gray-900 mb-3">🛠️ Select Wash Type</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'full', label: 'Full Car Wash' },
                          { id: 'hoover', label: 'Hoover Only' },
                          { id: 'washHoover', label: 'Wash + Hoover' }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, carWashType: mode.id }))}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${bookingData.carWashType === mode.id ? 'bg-rose-500 text-white border-rose-500 shadow-md transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-rose-200'}`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      <label className="block text-sm font-bold text-gray-900 mt-6 mb-3">🧹 Add Extra Cleaning</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'thoroughHoover', label: 'Thorough Hoover' },
                          { id: 'engineCleaning', label: 'Engine Cleaning' },
                          { id: 'matCleaning', label: 'Mat Cleaning' },
                          { id: 'carSeatCleaning', label: 'Car Seat Cleaning' }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                            <input
                              type="checkbox"
                              checked={bookingData[opt.id]}
                              onChange={(e) => setBookingData(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                              className="w-4 h-4 accent-rose-500"
                            />
                            <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>

                      <label className="block text-sm font-bold text-gray-900 mt-6 mb-3">✨ Add Polish Services</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'bodyPolish', label: 'Body Polish' },
                          { id: 'tirePolish', label: 'Tire Polish' },
                          { id: 'backPolish', label: 'Back Polish' },
                          { id: 'interiorPolish', label: 'Interior Polish' }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                            <input
                              type="checkbox"
                              checked={bookingData[opt.id]}
                              onChange={(e) => setBookingData(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                              className="w-4 h-4 accent-rose-500"
                            />
                            <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MOVING-SPECIFIC FIELDS ── */}
              {service.type === 'moving' && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold flex items-center gap-2">🚛 Move Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moving from (current address) *</label>
                    <textarea
                      name="moveFromAddress"
                      value={bookingData.moveFromAddress}
                      onChange={handleBookingChange}
                      rows="2"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Full current address..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moving to (new address) *</label>
                    <textarea
                      name="moveToAddress"
                      value={bookingData.moveToAddress}
                      onChange={handleBookingChange}
                      rows="2"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Full destination address..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of rooms / property size</label>
                      <select
                        name="moveRooms"
                        value={bookingData.moveRooms}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="Studio">Studio / 1-room</option>
                        <option value="2 rooms">2 rooms</option>
                        <option value="3 rooms">3 rooms</option>
                        <option value="4 rooms">4 rooms</option>
                        <option value="5+ rooms">5+ rooms</option>
                        <option value="Office / Commercial">Office / Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Packing service needed?</label>
                      <select
                        name="movePackingRequired"
                        value={bookingData.movePackingRequired}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="Yes - full packing">Yes – full packing</option>
                        <option value="Yes - partial">Yes – partial</option>
                        <option value="No - already packed">No – already packed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Floor (from)</label>
                      <input
                        type="text"
                        name="moveFloorFrom"
                        value={bookingData.moveFloorFrom}
                        onChange={handleBookingChange}
                        placeholder="e.g. Ground"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Floor (to)</label>
                      <input
                        type="text"
                        name="moveFloorTo"
                        value={bookingData.moveFloorTo}
                        onChange={handleBookingChange}
                        placeholder="e.g. 3rd"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lift/Elevator?</label>
                      <select
                        name="moveHasLift"
                        value={bookingData.moveHasLift}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Both locations">Both</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heavy / special items (piano, safe, appliances…)</label>
                    <input
                      type="text"
                      name="moveHeavyItems"
                      value={bookingData.moveHeavyItems}
                      onChange={handleBookingChange}
                      placeholder="e.g. 1 piano, fridge, washing machine"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* ── HANDYMAN / MAINTENANCE-SPECIFIC FIELDS ── */}
              {(service.type === 'handyman' || service.type === 'maintenance') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">🔧 Job Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job type *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'Plumbing', icon: '🚿' },
                        { id: 'Electrical', icon: '⚡' },
                        { id: 'Painting', icon: '🖌️' },
                        { id: 'Tiling', icon: '🧱' },
                        { id: 'Carpentry', icon: '🪚' },
                        { id: 'General Repairs', icon: '🔨' },
                        { id: 'Geyser / Plumbing', icon: '🛁' },
                        { id: 'Roofing', icon: '🏠' },
                        { id: 'Other', icon: '🛠️' },
                      ].map(job => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, handymanJobType: job.id }))}
                          className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                            bookingData.handymanJobType === job.id
                              ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                          }`}
                        >
                          <span>{job.icon}</span>{job.id}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Describe the problem / job *</label>
                    <textarea
                      name="handymanJobDescription"
                      value={bookingData.handymanJobDescription}
                      onChange={handleBookingChange}
                      rows="3"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Describe what needs to be done in detail..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materials/parts required (if known)</label>
                    <input
                      type="text"
                      name="handymanMaterialsRequired"
                      value={bookingData.handymanMaterialsRequired}
                      onChange={handleBookingChange}
                      placeholder="e.g. Paint, pipes, tiles (leave blank if unsure)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency level</label>
                    <div className="flex gap-3">
                      {[{ id: 'urgent', label: '🔴 Urgent', desc: 'ASAP' }, { id: 'normal', label: '🟡 Normal', desc: 'Within days' }, { id: 'flexible', label: '🟢 Flexible', desc: 'No rush' }].map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, handymanUrgency: u.id }))}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                            bookingData.handymanUrgency === u.id
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                          }`}
                        >
                          {u.label}<br/><span className="font-normal opacity-70">{u.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── LANDSCAPING-SPECIFIC FIELDS ── */}
              {service.type === 'landscaping' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">🌿 Garden & Landscaping Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service type needed *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'Lawn Mowing', icon: '🌾' },
                        { id: 'Garden Design', icon: '🌺' },
                        { id: 'Tree Trimming', icon: '🌳' },
                        { id: 'Hedge Cutting', icon: '✂️' },
                        { id: 'Weeding', icon: '🌱' },
                        { id: 'Planting', icon: '🌷' },
                        { id: 'Irrigation', icon: '💧' },
                        { id: 'Leaf Cleanup', icon: '🍂' },
                        { id: 'General Maintenance', icon: '🪣' },
                      ].map(svc => (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, landscapingServiceType: svc.id }))}
                          className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                            bookingData.landscapingServiceType === svc.id
                              ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                          }`}
                        >
                          <span>{svc.icon}</span>{svc.id}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Garden/lawn area size</label>
                      <select
                        name="landscapeAreaSize"
                        value={bookingData.landscapeAreaSize}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select size...</option>
                        <option value="Small (under 50m²)">Small (under 50m²)</option>
                        <option value="Medium (50-150m²)">Medium (50–150m²)</option>
                        <option value="Large (150-500m²)">Large (150–500m²)</option>
                        <option value="Extra Large (500m²+)">Extra Large (500m²+)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service frequency</label>
                      <select
                        name="landscapeFrequency"
                        value={bookingData.landscapeFrequency}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="Once-off">Once-off</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment/water available on site?</label>
                    <select
                      name="landscapeEquipmentAvailable"
                      value={bookingData.landscapeEquipmentAvailable}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Yes - water & equipment available">Yes – water &amp; equipment available</option>
                      <option value="Yes - water only">Yes – water only</option>
                      <option value="No - provider must bring all">No – provider must bring everything</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── CATERING-SPECIFIC FIELDS ── */}
              {service.type === 'catering' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">🍽️ Catering Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event type *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'Birthday Party', icon: '🎂' },
                        { id: 'Wedding', icon: '💍' },
                        { id: 'Corporate Event', icon: '🏢' },
                        { id: 'Funeral/Memorial', icon: '🕯️' },
                        { id: 'Year-End Function', icon: '🎉' },
                        { id: 'Private Dinner', icon: '🍷' },
                        { id: 'Braai', icon: '🔥' },
                        { id: 'Baby Shower', icon: '🍼' },
                        { id: 'Other', icon: '🍴' },
                      ].map(ev => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, cateringEventType: ev.id }))}
                          className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                            bookingData.cateringEventType === ev.id
                              ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                          }`}
                        >
                          <span>{ev.icon}</span>{ev.id}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of guests *</label>
                      <input
                        type="number"
                        name="cateringGuestCount"
                        value={bookingData.cateringGuestCount}
                        onChange={handleBookingChange}
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event duration</label>
                      <select
                        name="cateringEventDuration"
                        value={bookingData.cateringEventDuration}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="2-3 hours">2–3 hours</option>
                        <option value="Half day (4h)">Half day (4h)</option>
                        <option value="Full day (8h)">Full day (8h)</option>
                        <option value="2 days">2 days</option>
                        <option value="Custom">Custom (specify in notes)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Menu preference / cuisine style *</label>
                    <input
                      type="text"
                      name="cateringMenuPreference"
                      value={bookingData.cateringMenuPreference}
                      onChange={handleBookingChange}
                      required
                      placeholder="e.g. Traditional South African, Braai, Buffet, Finger foods…"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dietary requirements / allergies</label>
                    <input
                      type="text"
                      name="cateringDietaryReqs"
                      value={bookingData.cateringDietaryReqs}
                      onChange={handleBookingChange}
                      placeholder="e.g. Halal, vegetarian, nut-free, dairy-free…"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue type</label>
                    <select
                      name="cateringVenueType"
                      value={bookingData.cateringVenueType}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Home / Residence">Home / Residence</option>
                      <option value="Outdoor / Garden">Outdoor / Garden</option>
                      <option value="Event Venue / Hall">Event Venue / Hall</option>
                      <option value="Office / Boardroom">Office / Boardroom</option>
                      <option value="Restaurant (client's)">Restaurant (client's)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Number of Guests (non-vehicle, non-specific service types) */}
              {!requiresVehicleType && service.type !== 'moving' && service.type !== 'handyman' && service.type !== 'maintenance' && service.type !== 'landscaping' && service.type !== 'catering' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of guests</label>
                  <select
                    name="numberOfGuests"
                    value={bookingData.numberOfGuests}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                    <option value="5">5+ guests</option>
                  </select>
                </div>
              )}

              {/* Service Location */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Service location</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    name="address"
                    value={bookingData.address}
                    onChange={handleBookingChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your full address for service..."
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
              </div>

              {/* Food & Electricity */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Provisions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🍴 Will you provide food for the service provider?</label>
                    <div className="flex gap-6">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">⚡ Is electricity available at the service location?</label>
                    <div className="flex gap-6">
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
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Special requests</h3>
                <div>
                  <textarea
                    name="specialRequirements"
                    value={bookingData.specialRequirements}
                    onChange={handleBookingChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Any special requirements or instructions for the service provider..."
                  />
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Attachments (optional)</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        onChange={handleAttachmentChange}
                        accept="image/*,.pdf"
                        className="hidden"
                        multiple
                      />
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                        Choose files
                      </div>
                    </label>
                    <span className="text-sm text-gray-500">Max 2 files (5MB each)</span>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type.startsWith('image/') ? (
                              <PhotoIcon className="w-5 h-5 text-blue-500" />
                            ) : (
                              <DocumentTextIcon className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total estimate</span>
                  <span className="text-xl font-bold text-gray-900">R{totalPrice}</span>
                </div>
                <p className="text-xs text-gray-500">Final price may vary based on specific requirements.</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="text-xl" />
                    Send booking request via WhatsApp
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                By submitting this form, you agree to our terms of service and privacy policy.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelService
          serviceId={service._id}
          onClose={() => setShowCommentsPanel(false)}
          onCommentCountChange={setCommentCount}
        />
      )}

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-3 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">R{totalPrice}</span>
              <span className="text-slate-400 text-xs font-semibold">est. total</span>
            </div>
            {selectedService ? (
              <p className="text-rose-600 text-xs font-semibold truncate">
                {selectedService.name}
              </p>
            ) : (
              <p className="text-slate-400 text-xs font-medium">Select a service option</p>
            )}
          </div>
          <button
            onClick={() => openBookingModal(selectedService)}
            className="px-7 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-200 active:scale-95 shrink-0"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Zoomed Performer Image Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed inset-0 z-[2001] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center pointer-events-auto">
                <button
                  onClick={() => setZoomedImage(null)}
                  className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 group"
                >
                  <XMarkIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
                <img
                  src={zoomedImage}
                  alt="Zoomed Performer"
                  className="w-full h-full object-contain rounded-3xl shadow-2xl border border-white/10"
                />
              </div>
            </motion.div>
          </>
        )}
        {/* Performer Rating Modal */}
        {showPerformerRatingModal && selectedPerformerToRate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPerformerRatingModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2050]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-0 z-[2051] flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl opacity-30 pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-30 pointer-events-none" />

                <button
                  onClick={() => setShowPerformerRatingModal(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 rounded-full transition-all group"
                >
                  <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>

                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-rose-100 shadow-md mb-4 bg-slate-100">
                  {selectedPerformerToRate.image ? (
                    <img src={selectedPerformerToRate.image} alt={selectedPerformerToRate.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">
                      <FaUser />
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-rose-600 font-black uppercase tracking-[0.2em] mb-1">Rate Service Performer</p>
                <h3 className="text-xl font-black text-slate-900 mb-1">{selectedPerformerToRate.name}</h3>
                <p className="text-xs text-slate-500 mb-6">{selectedPerformerToRate.experience} experience</p>

                {ratingSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-6"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-800">Rating Submitted successfully!</p>
                    <p className="text-xs text-slate-400 mt-1">Thank you for your feedback.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRatePerformerSubmit} className="w-full flex flex-col items-center">
                    {/* Stars Selection */}
                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hoveredPerformerRating ? star <= hoveredPerformerRating : star <= performerRating;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setPerformerRating(star)}
                            onMouseEnter={() => setHoveredPerformerRating(star)}
                            onMouseLeave={() => setHoveredPerformerRating(0)}
                            className="p-1 transition-all hover:scale-125 duration-150 active:scale-95 cursor-pointer"
                          >
                            {isFilled ? (
                              <StarIconSolid className="w-9 h-9 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                            ) : (
                              <StarIcon className="w-9 h-9 text-slate-300 hover:text-yellow-400 transition-colors" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {ratingError && (
                      <p className="text-xs text-red-500 font-bold mb-4 bg-red-50 px-4 py-2 rounded-xl border border-red-100">{ratingError}</p>
                    )}

                    <div className="w-full flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowPerformerRatingModal(false)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-wider transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingRating}
                        className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      >
                        {submittingRating ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicePage;
