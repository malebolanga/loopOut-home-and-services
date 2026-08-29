/* eslint-disable no-undef */
// Services.jsx - Airbnb-Style Professional Design
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { Link } from "react-router-dom";
import { useBookedSlots } from '../hooks/useBookedSlots';
import BookingTimeSlots from '../components/BookingTimeSlots';
import BookingDateNotice from '../components/BookingDateNotice';
import { pushPhoneNotification } from '../components/PhoneNotificationManager';
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

const STORAGE_ITEM_OPTIONS = [
  { id: 'chairs', label: 'Chairs', emoji: '🪑' },
  { id: 'bed', label: 'Bed', emoji: '🛏️' },
  { id: 'fridge', label: 'Fridge', emoji: '🧊' },
  { id: 'tv', label: 'TV', emoji: '📺' },
  { id: 'microwave', label: 'Microwave', emoji: '📻' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'sofa', label: 'Sofa / Couch', emoji: '🛋️' },
  { id: 'boxes', label: 'Boxes', emoji: '📦' },
  { id: 'table', label: 'Table / Desk', emoji: '🪑' },
  { id: 'appliances', label: 'Appliances', emoji: '🧺' },
];

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
  },

  // Booking Storage Services
  storage: {
    title: 'Booking Storage',
    icon: <FaTools />,
    description: `Safe and secure storage space for your belongings. Whether short-term or long-term, store household items, business stock, vehicles, or valuables in a monitored storage facility.`,
    options: [
      { id: 'short-term', name: 'Short-Term Storage', description: 'Flexible daily/weekly storage', duration: 'Daily / Weekly', price: 'From R50/day', popular: true, icon: <FaTools /> },
      { id: 'monthly', name: 'Monthly Storage', description: 'Standard monthly rental', duration: '1+ months', price: 'From R500/month', popular: true, icon: <FaTools /> },
      { id: 'long-term', name: 'Long-Term Storage', description: 'Extended secure storage', duration: '6–12+ months', price: 'Negotiable', popular: false, icon: <FaShieldAlt /> },
      { id: 'vehicle-storage', name: 'Vehicle Storage', description: 'Cars, bikes, trailers', duration: 'Monthly', price: 'From R800/month', popular: false, icon: <FaTools /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Secure', desc: 'Monitored & locked' },
      { icon: <FaClock />, title: 'Flexible', desc: 'Daily & monthly rates' }
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
  }, [currentUser?._id, service]);

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
    serviceFrequency: '',
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
    moveBoxesCount: 0,
    moveKilosCount: 0,
    moveVehicleType: 'none',
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
    // Storage booking
    storageDuration: '1 month',
    storageItemsToStore: '',
    _policyAcknowledged: false,
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

  const { bookedDates, isTimeSlotBooked, isDateFullyBooked, isDateBooked, getAvailabilityNotice } = useBookedSlots(service?._id || serviceId);

  useEffect(() => {
    if (service) {
      const basePrice = parseInt(service.regularPrice) || 0;
      const travelFee = parseInt(service.travelFee) || 0;
      
      let selectedPrice = 0;
      if (selectedService && selectedService.price) {
        selectedPrice = parseInt(String(selectedService.price).replace(/[^\d]/g, '')) || 0;
      }

      let totalBase = selectedPrice > 0 ? selectedPrice : basePrice;

      if (service.type === 'moving') {
        const costPerBox = service.moveCostPerBox !== undefined ? Number(service.moveCostPerBox) : 50;
        const costPerKilo = service.moveCostPerKilo !== undefined ? Number(service.moveCostPerKilo) : 10;
        const priceVan = service.movePriceVan !== undefined ? Number(service.movePriceVan) : 800;
        const priceVanTrailer = service.movePriceVanTrailer !== undefined ? Number(service.movePriceVanTrailer) : 1200;
        const priceMiniTruck = service.movePriceMiniTruck !== undefined ? Number(service.movePriceMiniTruck) : 1500;
        const priceOtherTruck = service.movePriceOtherTruck !== undefined ? Number(service.movePriceOtherTruck) : 2000;
        const priceBigTruckTrailer = service.movePriceBigTruckTrailer !== undefined ? Number(service.movePriceBigTruckTrailer) : 3500;

        const boxesCount = Number(bookingData.moveBoxesCount) || 0;
        const kilosCount = Number(bookingData.moveKilosCount) || 0;

        let vehicleCost = 0;
        if (bookingData.moveVehicleType === 'van') vehicleCost = priceVan;
        else if (bookingData.moveVehicleType === 'vanTrailer') vehicleCost = priceVanTrailer;
        else if (bookingData.moveVehicleType === 'miniTruck') vehicleCost = priceMiniTruck;
        else if (bookingData.moveVehicleType === 'otherTruck') vehicleCost = priceOtherTruck;
        else if (bookingData.moveVehicleType === 'bigTruckTrailer') vehicleCost = priceBigTruckTrailer;

        const boxesCost = boxesCount * costPerBox;
        const kilosCost = kilosCount * costPerKilo;

        if (boxesCount > 0 || kilosCount > 0 || (bookingData.moveVehicleType && bookingData.moveVehicleType !== 'none')) {
          totalBase = boxesCost + kilosCost + vehicleCost;
        }
      }

      if (service.type === 'storage') {
        const priceDay = service.storagePriceDay !== undefined ? Number(service.storagePriceDay) : 0;
        const priceMonth = service.storagePriceMonth !== undefined ? Number(service.storagePriceMonth) : basePrice;
        const dur = bookingData.storageDuration || '1 month';
        if (dur.includes('day') || dur.includes('Day')) {
          const days = parseInt(dur) || 1;
          totalBase = priceDay * days;
        } else if (dur === 'Ongoing') {
          totalBase = priceMonth;
        } else {
          const months = parseInt(dur) || 1;
          totalBase = priceMonth * months;
        }
        if (totalBase === 0) totalBase = basePrice;
      }

      const serviceFee = Math.round(totalBase * 0.1);
      setTotalPrice(totalBase + travelFee + serviceFee);
    }
  }, [service, selectedService, bookingData.moveBoxesCount, bookingData.moveKilosCount, bookingData.moveVehicleType, bookingData.storageDuration]);

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

  const getMovingBreakdown = () => {
    if (!service || service.type !== 'moving') return null;

    const costPerBox = service.moveCostPerBox !== undefined ? Number(service.moveCostPerBox) : 50;
    const costPerKilo = service.moveCostPerKilo !== undefined ? Number(service.moveCostPerKilo) : 10;
    const priceVan = service.movePriceVan !== undefined ? Number(service.movePriceVan) : 800;
    const priceVanTrailer = service.movePriceVanTrailer !== undefined ? Number(service.movePriceVanTrailer) : 1200;
    const priceMiniTruck = service.movePriceMiniTruck !== undefined ? Number(service.movePriceMiniTruck) : 1500;
    const priceOtherTruck = service.movePriceOtherTruck !== undefined ? Number(service.movePriceOtherTruck) : 2000;
    const priceBigTruckTrailer = service.movePriceBigTruckTrailer !== undefined ? Number(service.movePriceBigTruckTrailer) : 3500;

    const boxesCount = Number(bookingData.moveBoxesCount) || 0;
    const kilosCount = Number(bookingData.moveKilosCount) || 0;

    let vehicleCost = 0;
    let vehicleLabel = '';
    if (bookingData.moveVehicleType === 'van') {
      vehicleCost = priceVan;
      vehicleLabel = 'Van';
    } else if (bookingData.moveVehicleType === 'vanTrailer') {
      vehicleCost = priceVanTrailer;
      vehicleLabel = 'Van with Trailer';
    } else if (bookingData.moveVehicleType === 'miniTruck') {
      vehicleCost = priceMiniTruck;
      vehicleLabel = 'Mini Truck';
    } else if (bookingData.moveVehicleType === 'otherTruck') {
      vehicleCost = priceOtherTruck;
      vehicleLabel = 'Other Truck';
    } else if (bookingData.moveVehicleType === 'bigTruckTrailer') {
      vehicleCost = priceBigTruckTrailer;
      vehicleLabel = 'Big Truck with Trailer';
    }

    const boxesCost = boxesCount * costPerBox;
    const kilosCost = kilosCount * costPerKilo;
    const travelFee = parseInt(service.travelFee) || 0;

    const subtotal = boxesCost + kilosCost + vehicleCost;
    const basePrice = parseInt(service.regularPrice) || 0;
    let selectedPrice = 0;
    if (selectedService && selectedService.price) {
      selectedPrice = parseInt(String(selectedService.price).replace(/[^\d]/g, '')) || 0;
    }
    const finalBasePrice = selectedPrice > 0 ? selectedPrice : basePrice;

    const activeBase = (boxesCount > 0 || kilosCount > 0 || (bookingData.moveVehicleType && bookingData.moveVehicleType !== 'none')) ? subtotal : finalBasePrice;
    const serviceFee = Math.round(activeBase * 0.1);

    return {
      boxesCount,
      costPerBox,
      boxesCost,
      kilosCount,
      costPerKilo,
      kilosCost,
      vehicleLabel,
      vehicleCost,
      travelFee,
      serviceFee,
      hasOptions: boxesCount > 0 || kilosCount > 0 || (bookingData.moveVehicleType && bookingData.moveVehicleType !== 'none')
    };
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
      ? `🚀✨ *QUICK BOOKING REQUEST* ✨🚀\n🔖 _via loopOut — Fast Track_\n\n`
      : `🎯🔔 *NEW SERVICE BOOKING* 🔔🎯\n💼 _Submitted via loopOut Platform_\n\n`;

    message += `╔══════════════════════╗\n`;
    message += `   💼 *SERVICE DETAILS*\n`;
    message += `╚══════════════════════╝\n`;
    message += `🏢 *Service:*  ${service.name}\n`;
    message += `🏷️ *Category:* ${getProfessionalTitle(service.type)}\n`;

    if (selectedService) {
      message += `📜 *Option:*   ${selectedService.name} — ${selectedService.price}\n`;
    }

    message += `📅 *Date:*     ${bookingData.date || 'Not specified'}\n`;
    message += `⏰ *Time:*     ${bookingData.time || 'Not specified'}\n`;
    if (bookingData.serviceFrequency) message += `🔄 *Frequency:* ${bookingData.serviceFrequency}\n`;

    if (bookingData.selectedPerformers && bookingData.selectedPerformers.length > 0) {
      message += `\n👷 *Requested Provider(s):*\n`;
      bookingData.selectedPerformers.forEach(p => {
        message += `   • ${p}\n`;
      });
    }
    message += `\n`;

    message += `╔══════════════════════╗\n`;
    message += `   👤 *CLIENT DETAILS*\n`;
    message += `╚══════════════════════╝\n`;
    message += `🙋 *Name:*  ${bookingData.name}\n`;
    message += `📱 *Phone:* ${bookingData.phone}\n\n`;

    if (bookingData.address) {
      message += `╔══════════════════════╗\n`;
      message += `   📍 *SERVICE LOCATION*\n`;
      message += `╚══════════════════════╝\n`;
      message += `🏠 *Address:*\n   ${bookingData.address}\n`;
      const mapLink = generateMapLink(bookingData.address);
      if (mapLink) message += `\n🗺️ *Google Maps:*\n   ${mapLink}\n`;
      message += `\n`;
    }

    // ── 🚗 Car Wash ──
    if (requiresVehicleType && bookingData.vehicleType) {
      message += `╔══════════════════════╗\n`;
      message += `   🚗 *VEHICLE & DETAILING*\n`;
      message += `╚══════════════════════╝\n`;
      message += `🚗 *Vehicle Type:* ${VEHICLE_TYPES.find(v => v.id === bookingData.vehicleType)?.name}\n`;
      if (bookingData.vehicleMake) message += `🔖 *Make:*         ${bookingData.vehicleMake}\n`;
      if (bookingData.vehicleModel) message += `🚘 *Model:*        ${bookingData.vehicleModel}\n`;
      if (bookingData.licensePlate) message += `🆔 *Plate No:*     ${bookingData.licensePlate}\n`;
      const washTypes = { full: 'Full Car Wash', hoover: 'Hoover Only', washHoover: 'Wash + Hoover' };
      message += `🧼 *Wash Type:*    ${washTypes[bookingData.carWashType] || 'Standard'}\n`;
      let cleaningDetails = [];
      if (bookingData.thoroughHoover) cleaningDetails.push('Thorough Hoover');
      if (bookingData.engineCleaning) cleaningDetails.push('Engine Cleaning');
      if (bookingData.matCleaning) cleaningDetails.push('Mat Cleaning');
      if (bookingData.carSeatCleaning) cleaningDetails.push('Car Seat Cleaning');
      if (cleaningDetails.length > 0) message += `🧹 *Deep Clean:*   ${cleaningDetails.join(' · ')}\n`;
      let polishDetails = [];
      if (bookingData.bodyPolish) polishDetails.push('Body');
      if (bookingData.tirePolish) polishDetails.push('Tire');
      if (bookingData.backPolish) polishDetails.push('Back');
      if (bookingData.interiorPolish) polishDetails.push('Interior');
      if (polishDetails.length > 0) message += `✨ *Polish:*       ${polishDetails.join(' · ')}\n`;
      message += `\n`;
    }

    // ── 🚛 Moving ──
    if (service.type === 'moving') {
      message += `╔══════════════════════╗\n`;
      message += `   🚛 *MOVING DETAILS*\n`;
      message += `╚══════════════════════╝\n`;
      if (bookingData.moveFromAddress) message += `📦 *From:*\n   ${bookingData.moveFromAddress}\n`;
      if (bookingData.moveToAddress) message += `🏁 *To:*\n   ${bookingData.moveToAddress}\n`;
      if (bookingData.moveRooms) message += `🛏️ *Rooms / Size:*         ${bookingData.moveRooms}\n`;
      if (bookingData.moveFloorFrom) message += `🏢 *Floor (Pickup):*      ${bookingData.moveFloorFrom}\n`;
      if (bookingData.moveFloorTo) message += `🏢 *Floor (Dropoff):*     ${bookingData.moveFloorTo}\n`;
      if (bookingData.moveHasLift) message += `🛗 *Lift/Elevator:*       ${bookingData.moveHasLift}\n`;
      const allMoveItems = [
        ...(bookingData.selectedMoveItems || []),
        ...(bookingData.moveHeavyItems ? [bookingData.moveHeavyItems] : [])
      ].filter(Boolean).join(', ');
      if (allMoveItems) message += `🪑 *Selected / Heavy Items:*\n   ${allMoveItems}\n`;
      if (bookingData.movePackingRequired) message += `📦 *Packing Needed:*      ${bookingData.movePackingRequired}\n`;
      if (bookingData.moveBoxesCount && bookingData.moveBoxesCount > 0) {
        message += `📦 *Boxes:*               ${bookingData.moveBoxesCount} boxes  ×  R${service.moveCostPerBox || 50}/box\n`;
      }
      if (bookingData.moveKilosCount && bookingData.moveKilosCount > 0) {
        message += `⚖️ *Weight:*              ${bookingData.moveKilosCount} kg  ×  R${service.moveCostPerKilo || 10}/kg\n`;
      }
      if (bookingData.moveVehicleType && bookingData.moveVehicleType !== 'none') {
        let vehicleLabel = '';
        let vehiclePrice = 0;
        if (bookingData.moveVehicleType === 'van') { vehicleLabel = 'Van'; vehiclePrice = service.movePriceVan !== undefined ? service.movePriceVan : 800; }
        else if (bookingData.moveVehicleType === 'vanTrailer') { vehicleLabel = 'Van with Trailer'; vehiclePrice = service.movePriceVanTrailer !== undefined ? service.movePriceVanTrailer : 1200; }
        else if (bookingData.moveVehicleType === 'miniTruck') { vehicleLabel = 'Mini Truck'; vehiclePrice = service.movePriceMiniTruck !== undefined ? service.movePriceMiniTruck : 1500; }
        else if (bookingData.moveVehicleType === 'otherTruck') { vehicleLabel = 'Other Truck'; vehiclePrice = service.movePriceOtherTruck !== undefined ? service.movePriceOtherTruck : 2000; }
        else if (bookingData.moveVehicleType === 'bigTruckTrailer') { vehicleLabel = 'Big Truck + Trailer'; vehiclePrice = service.movePriceBigTruckTrailer !== undefined ? service.movePriceBigTruckTrailer : 3500; }
        message += `🚛 *Vehicle:*             ${vehicleLabel}  →  R${vehiclePrice}\n`;
      }
      message += `\n`;
    }

    // ── 🔧 Handyman / Maintenance ──
    if (service.type === 'handyman' || service.type === 'maintenance') {
      message += `╔══════════════════════╗\n`;
      message += `   🔧 *JOB DETAILS*\n`;
      message += `╚══════════════════════╝\n`;
      if (bookingData.handymanJobType) message += `🔨 *Job Type:*      ${bookingData.handymanJobType}\n`;
      if (bookingData.handymanMaterialsRequired) message += `🛒 *Materials:*     ${bookingData.handymanMaterialsRequired}\n`;
      message += `⚡ *Urgency:*       ${bookingData.handymanUrgency === 'urgent' ? '🔴 URGENT — Needs immediate attention' : bookingData.handymanUrgency === 'flexible' ? '🟢 Flexible — No rush' : '🟡 Normal priority'}\n`;
      if (bookingData.handymanJobDescription) message += `\n📋 *Job Description:*\n_${bookingData.handymanJobDescription}_\n`;
      message += `\n`;
    }

    // ── 🌿 Landscaping ──
    if (service.type === 'landscaping') {
      message += `╔══════════════════════╗\n`;
      message += `   🌿 *GARDEN DETAILS*\n`;
      message += `╚══════════════════════╝\n`;
      if (bookingData.landscapingServiceType) message += `🌱 *Service:*    ${bookingData.landscapingServiceType}\n`;
      if (bookingData.landscapeAreaSize) message += `📐 *Area Size:*  ${bookingData.landscapeAreaSize}\n`;
      if (bookingData.landscapeFrequency) message += `🔄 *Frequency:*  ${bookingData.landscapeFrequency}\n`;
      if (bookingData.landscapeEquipmentAvailable) message += `🪣 *Equipment:*  ${bookingData.landscapeEquipmentAvailable}\n`;
      message += `\n`;
    }

    // ── 🍽️ Catering ──
    if (service.type === 'catering') {
      message += `╔══════════════════════╗\n`;
      message += `   🍽️ *CATERING DETAILS*\n`;
      message += `╚══════════════════════╝\n`;
      if (bookingData.cateringEventType) message += `🎉 *Event Type:*  ${bookingData.cateringEventType}\n`;
      if (bookingData.cateringGuestCount) message += `👥 *Guests:*      ${bookingData.cateringGuestCount} people\n`;
      if (bookingData.cateringMenuPreference) message += `🍴 *Menu:*        ${bookingData.cateringMenuPreference}\n`;
      if (bookingData.cateringDietaryReqs) message += `🥗 *Dietary:*     ${bookingData.cateringDietaryReqs}\n`;
      if (bookingData.cateringEventDuration) message += `⏱️ *Duration:*    ${bookingData.cateringEventDuration}\n`;
      if (bookingData.cateringVenueType) message += `🏛️ *Venue:*       ${bookingData.cateringVenueType}\n`;
      message += `\n`;
    }

    // ── 📦 Storage ──
    if (service.type === 'storage') {
      message += `╔══════════════════════╗\n`;
      message += `   📦 *STORAGE DETAILS*\n`;
      message += `╚══════════════════════╝\n`;
      if (service.storageSize) message += `📐 *Size:*              ${service.storageSize}\n`;
      if (service.storagePriceDay) message += `📅 *Rate per Day:*      R${service.storagePriceDay}\n`;
      if (service.storagePriceMonth) message += `🗓️ *Rate per Month:*    R${service.storagePriceMonth}\n`;
      message += `📆 *Duration:*          ${bookingData.storageDuration}\n`;
      const allStorageItems = [
        ...(bookingData.selectedStorageItems || []),
        ...(bookingData.storageItemsToStore ? [bookingData.storageItemsToStore] : [])
      ].filter(Boolean).join(', ');
      if (allStorageItems) message += `\n📋 *Items to Store:*\n_${allStorageItems}_\n`;
      message += `\n`;
    }

    message += `╔══════════════════════╗\n`;
    message += `   ⚡ *PROVISIONS*\n`;
    message += `╚══════════════════════╝\n`;
    message += `🍽️ *Food by client:*    ${bookingData.foodProvided === 'yes' ? '✅ Yes — Client provides food' : '❌ No — Provider must bring food'}\n`;
    message += `⚡ *Electricity:*       ${bookingData.electricityProvided === 'yes' ? '✅ Available on site' : '❌ Not available — bring generator'}\n\n`;

    message += `╔══════════════════════╗\n`;
    message += `   💬 *NOTES & REQUESTS*\n`;
    message += `╚══════════════════════╝\n`;
    message += `📝 _${bookingData.specialRequirements ? bookingData.specialRequirements : 'No special requirements'}_\n`;

    message += `\n`;

    if (uploadedFiles.length > 0) {
      message += `╔══════════════════════╗\n`;
      message += `   📎 *ATTACHMENTS*\n`;
      message += `╚══════════════════════╝\n`;
      uploadedFiles.forEach((file) => {
        message += `${file.type === 'image' ? '🖼️' : '📄'} ${file.name}\n   ${file.url}\n\n`;
      });
    }

    message += `┌──────────────────────┐\n`;
    message += `   💰 *PRICE ESTIMATE*\n`;
    message += `└──────────────────────┘\n`;
    message += `💵 *Total:*  *R ${totalPrice}*\n`;
    message += `_(Estimate — final price confirmed by provider)_\n\n`;

    message += `┌──────────────────────┐\n`;
    message += `   ⚡ *QUICK ACTIONS*\n`;
    message += `└──────────────────────┘\n`;
    if (acceptLink) message += `✅ *ACCEPT BOOKING:*\n${acceptLink}\n\n`;
    if (declineLink) message += `❌ *DECLINE BOOKING:*\n${declineLink}\n\n`;

    message += `🔐 *Verification Code:* \`${verificationCode}\`\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `_Powered by *loopOut* 🔁 — Your trusted home & services platform_`;

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

    if (bookingData.date && isDateFullyBooked(bookingData.date)) {
      alert("This date is not available (fully booked). Please select another date.");
      return;
    }

    if (bookingData.date && bookingData.time && isTimeSlotBooked(bookingData.date, bookingData.time)) {
      alert("This time slot is already booked and not available. Please choose another time.");
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

        const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.token || currentUser?.access_token;
        const bookRes = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify(bookingToSave)
        });

        if (bookRes.ok) {
          pushPhoneNotification({
            title: '🎉 Booking Request Sent',
            message: `Your booking for ${service?.title || 'Service'} has been placed. Check notifications for updates!`,
            type: 'success',
            link: '/notifications'
          });
        }

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
      <div className="relative z-10 -mt-8 md:-mt-12 max-w-7xl mx-auto rounded-t-[2rem] md:rounded-t-[2.5rem] bg-white px-4 sm:px-6 lg:px-8 py-8 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
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

            {/* Storage configuration and policies */}
            {service.type === 'storage' && (service.storageSize || service.storagePriceDay || service.storagePriceMonth || service.storageFailurePolicy || service.storageTerms || service.storagePolicyDocUrl) && (
              <section className="py-6 border-b border-gray-200 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Storage details</h2>
                  <p className="text-sm text-gray-600 mt-1">Review the unit configuration and provider policies before booking.</p>
                </div>

                {(service.storageSize || service.storagePriceDay || service.storagePriceMonth) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {service.storageSize && <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl"><span className="block text-blue-700 font-medium">Unit size</span><strong className="text-blue-950">{service.storageSize}</strong></div>}
                    {service.storagePriceDay && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl"><span className="block text-emerald-700 font-medium">Daily rate</span><strong className="text-emerald-950">R{service.storagePriceDay}</strong></div>}
                    {service.storagePriceMonth && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl"><span className="block text-emerald-700 font-medium">Monthly rate</span><strong className="text-emerald-950">R{service.storagePriceMonth}</strong></div>}
                  </div>
                )}

                {service.storageFailurePolicy && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h3 className="font-semibold text-amber-900 mb-1">Late Payment / Pay Failure Policy</h3>
                    <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">{service.storageFailurePolicy}</p>
                  </div>
                )}
                {service.storageTerms && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-1">Terms &amp; Conditions</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{service.storageTerms}</p>
                  </div>
                )}
                {service.storagePolicyDocUrl && (
                  <a href={service.storagePolicyDocUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">
                    Read the full storage policy document ↗
                  </a>
                )}
              </section>
            )}

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
                      onClick={() => setSelectedService(option)}
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

                  {/* Frequency Selection */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 hover:border-slate-300 transition-colors">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">🔄 Project / Service Frequency</label>
                    <select
                      name="serviceFrequency"
                      value={bookingData.serviceFrequency || ''}
                      onChange={handleBookingChange}
                      className="w-full text-sm text-slate-800 font-semibold outline-none bg-transparent"
                    >
                      <option value="">Select frequency / schedule...</option>
                      <option value="This is a one-time project">This is a one-time project</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Every other week">Every other week</option>
                      <option value="Monthly">Monthly</option>
                      <option value="As needed">As needed</option>
                    </select>
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
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Where you'll be</h2>
          <p className="text-gray-700 mb-4 text-sm lg:text-base">{service.address}</p>
          <div className="w-full h-[450px] bg-black rounded-[2rem] overflow-hidden relative border border-slate-100/10 shadow-2xl">
            <GoogleMapComponent
              address={service.address || 'Available in your area'}
              title={`${service.name}'s Service Area`}
            />
          </div>
          {service.near && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">What's nearby</h3>
              <div className="text-gray-700 text-xs lg:text-sm space-y-1">
                {(service.near || '').split('\n').slice(0, 4).map((item, i) => (
                  <p key={i}>{item}</p>
                ))}
              </div>
            </div>
          )}
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
                <div className="space-y-3">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select items to move (chairs, bed, fridge, TV, microwave, etc.)</label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {STORAGE_ITEM_OPTIONS.map((opt) => {
                        const isSelected = (bookingData.selectedMoveItems || []).includes(opt.label);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const current = bookingData.selectedMoveItems || [];
                              const next = current.includes(opt.label)
                                ? current.filter(i => i !== opt.label)
                                : [...current, opt.label];
                              setBookingData(prev => ({ ...prev, selectedMoveItems: next }));
                            }}
                            className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-rose-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                            {isSelected && <span className="ml-0.5 text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      name="moveHeavyItems"
                      value={bookingData.moveHeavyItems}
                      onChange={handleBookingChange}
                      placeholder="Additional items or details (e.g. 1 piano, fridge, washing machine...)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of boxes</label>
                      <input
                        type="number"
                        name="moveBoxesCount"
                        min="0"
                        value={bookingData.moveBoxesCount || ''}
                        onChange={handleBookingChange}
                        placeholder="e.g. 15"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight in Kilos (kg)</label>
                      <input
                        type="number"
                        name="moveKilosCount"
                        min="0"
                        value={bookingData.moveKilosCount || ''}
                        onChange={handleBookingChange}
                        placeholder="e.g. 120"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Vehicle Option</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'No vehicle (packing only)', price: 0 },
                        { id: 'van', label: `Van (R${service.movePriceVan !== undefined ? service.movePriceVan : 800})`, price: service.movePriceVan || 800 },
                        { id: 'vanTrailer', label: `Van with Trailer (R${service.movePriceVanTrailer !== undefined ? service.movePriceVanTrailer : 1200})`, price: service.movePriceVanTrailer || 1200 },
                        { id: 'miniTruck', label: `Mini Truck (R${service.movePriceMiniTruck !== undefined ? service.movePriceMiniTruck : 1500})`, price: service.movePriceMiniTruck || 1500 },
                        { id: 'otherTruck', label: `Other Truck (R${service.movePriceOtherTruck !== undefined ? service.movePriceOtherTruck : 2000})`, price: service.movePriceOtherTruck || 2000 },
                        { id: 'bigTruckTrailer', label: `Big Truck with Trailer (R${service.movePriceBigTruckTrailer !== undefined ? service.movePriceBigTruckTrailer : 3500})`, price: service.movePriceBigTruckTrailer || 3500 }
                      ].map(opt => (
                        <label key={opt.id} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-gray-50 border transition-all ${
                          bookingData.moveVehicleType === opt.id ? 'border-rose-500 bg-rose-50/50 shadow-sm' : 'border-gray-200'
                        }`}>
                          <input
                            type="radio"
                            name="moveVehicleType"
                            value={opt.id}
                            checked={bookingData.moveVehicleType === opt.id}
                            onChange={handleBookingChange}
                            className="w-4 h-4 accent-rose-500"
                          />
                          <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              {/* ── HANDYMAN / MAINTENANCE-SPECIFIC FIELDS ── */}
              {(service.type === 'handyman' || service.type === 'maintenance') && (
                <div className="space-y-5">

                  {/* Section Header */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.05) 10px,rgba(255,255,255,0.05) 20px)'}}/>
                    <div className="relative flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-400/30">🔧</div>
                      <div>
                        <h3 className="text-white font-black text-base tracking-tight">Job Details</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Tell us what needs fixing</p>
                      </div>
                      <div className="ml-auto flex gap-1.5">
                        <span className="text-lg">🪛</span>
                        <span className="text-lg">🔨</span>
                        <span className="text-lg">⚙️</span>
                      </div>
                    </div>
                  </div>

                  {/* Trade / Job Type Grid */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      <span className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-amber-600">🏷️</span>
                      Select Trade / Job Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'Plumber / Plumbing',        icon: '🚿', color: 'from-blue-500 to-cyan-600' },
                        { id: 'Electrician / Electrical',  icon: '⚡', color: 'from-yellow-400 to-amber-500' },
                        { id: 'Builder / Bricklaying',     icon: '🏗️', color: 'from-orange-500 to-red-500' },
                        { id: 'Gardener / Landscaping',    icon: '🌿', color: 'from-green-500 to-emerald-600' },
                        { id: 'General Worker',            icon: '🧹', color: 'from-slate-500 to-slate-700' },
                        { id: 'Painter / Painting',        icon: '🖌️', color: 'from-purple-500 to-violet-600' },
                        { id: 'Tiler / Tiling',            icon: '🧱', color: 'from-stone-500 to-stone-700' },
                        { id: 'Carpenter / Carpentry',     icon: '🪚', color: 'from-amber-600 to-orange-700' },
                        { id: 'Geyser / Plumbing',         icon: '🛁', color: 'from-sky-500 to-blue-600' },
                        { id: 'Roofing',                   icon: '🏠', color: 'from-red-500 to-rose-600' },
                        { id: 'General Repairs',           icon: '🔨', color: 'from-zinc-600 to-zinc-800' },
                        { id: 'Other',                     icon: '🛠️', color: 'from-gray-500 to-gray-700' },
                      ].map(job => {
                        const isSelected = bookingData.handymanJobType === job.id;
                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, handymanJobType: job.id }))}
                            className={`relative group flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all duration-200 text-center overflow-hidden ${
                              isSelected
                                ? 'border-transparent shadow-lg scale-[1.03]'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                            style={isSelected ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}
                          >
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-br ${job.color} opacity-90`} />
                            )}
                            <span className="relative text-2xl">{job.icon}</span>
                            <span className={`relative text-[10px] font-black leading-tight uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                              {job.id.split(' / ')[0]}
                            </span>
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white/30 flex items-center justify-center text-white text-[8px]">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {bookingData.handymanJobType && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="text-emerald-500 text-sm">✅</span>
                        <span className="text-xs font-bold text-emerald-700">Selected: {bookingData.handymanJobType}</span>
                      </div>
                    )}
                  </div>

                  {/* Job Description */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <span className="text-base">📋</span>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Describe the Problem / Job</span>
                      <span className="ml-auto text-[10px] text-rose-500 font-bold">Required *</span>
                    </div>
                    <textarea
                      name="handymanJobDescription"
                      value={bookingData.handymanJobDescription}
                      onChange={handleBookingChange}
                      rows="4"
                      required
                      className="w-full px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none bg-white resize-none"
                      placeholder="e.g. My kitchen tap is leaking badly, need it replaced urgently. The pipe under the sink is also dripping..."
                    />
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border-t border-amber-100">
                      <span className="text-amber-500 text-xs">💡</span>
                      <span className="text-[10px] text-amber-700 font-medium">More detail = faster, more accurate quote from the provider</span>
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                      <span>🛒</span> Materials / Parts Needed
                      <span className="ml-auto text-[10px] font-medium text-slate-400 normal-case tracking-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      name="handymanMaterialsRequired"
                      value={bookingData.handymanMaterialsRequired}
                      onChange={handleBookingChange}
                      placeholder="e.g. Paint, pipes, tiles, cement (leave blank if unsure)"
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                    <p className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
                      <span>ℹ️</span> Provider will confirm if materials are included or extra cost
                    </p>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      <span>⚡</span> Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'urgent',   emoji: '🔴', label: 'Urgent',   desc: 'Need ASAP',       bg: 'from-red-500 to-rose-600',    glow: 'shadow-red-200' },
                        { id: 'normal',   emoji: '🟡', label: 'Normal',   desc: 'Within 2–3 days', bg: 'from-amber-400 to-orange-500', glow: 'shadow-amber-200' },
                        { id: 'flexible', emoji: '🟢', label: 'Flexible', desc: 'No rush',          bg: 'from-green-500 to-emerald-600',glow: 'shadow-green-200' },
                      ].map(u => {
                        const isSelected = bookingData.handymanUrgency === u.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, handymanUrgency: u.id }))}
                            className={`relative flex flex-col items-center gap-1 py-4 px-2 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                              isSelected
                                ? `border-transparent shadow-xl ${u.glow} scale-[1.04]`
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            {isSelected && <div className={`absolute inset-0 bg-gradient-to-br ${u.bg}`} />}
                            <span className="relative text-xl">{u.emoji}</span>
                            <span className={`relative text-[11px] font-black uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-700'}`}>{u.label}</span>
                            <span className={`relative text-[9px] font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{u.desc}</span>
                          </button>
                        );
                      })}
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
                        <option value="This is a one-time project">This is a one-time project</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Every other week">Every other week</option>
                        <option value="Monthly">Monthly</option>
                        <option value="As needed">As needed</option>
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

              {/* ── STORAGE-SPECIFIC FIELDS ── */}
              {service.type === 'storage' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">📦 Storage Details</h3>
                  {service.storageSize && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                      📐 <strong>Unit size:</strong> {service.storageSize}
                    </div>
                  )}
                  {(service.storagePriceDay || service.storagePriceMonth) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {service.storagePriceDay && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                          <strong>Daily rate:</strong> R{service.storagePriceDay}
                        </div>
                      )}
                      {service.storagePriceMonth && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                          <strong>Monthly rate:</strong> R{service.storagePriceMonth}
                        </div>
                      )}
                    </div>
                  )}
                  {service.storageFailurePolicy && (
                    <section className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <h4 className="font-semibold text-amber-900 mb-1">Late Payment / Pay Failure Policy</h4>
                      <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                        {service.storageFailurePolicy}
                      </p>
                    </section>
                  )}
                  {service.storageTerms && (
                    <section className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-1">Terms &amp; Conditions</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {service.storageTerms}
                      </p>
                    </section>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">How long do you need storage? *</label>
                    <select
                      name="storageDuration"
                      value={bookingData.storageDuration}
                      onChange={handleBookingChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="1 day">1 day</option>
                      <option value="3 days">3 days</option>
                      <option value="1 week">1 week</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="12 months">12 months</option>
                      <option value="Ongoing">Ongoing (month-to-month)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What will you be storing?</label>
                    <p className="text-xs text-gray-500 mb-2">Tap items to select them (chairs, bed, fridge, TV, microwave, clothes, etc.):</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {STORAGE_ITEM_OPTIONS.map((opt) => {
                        const isSelected = (bookingData.selectedStorageItems || []).includes(opt.label);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const current = bookingData.selectedStorageItems || [];
                              const next = current.includes(opt.label)
                                ? current.filter(i => i !== opt.label)
                                : [...current, opt.label];
                              setBookingData(prev => ({ ...prev, selectedStorageItems: next }));
                            }}
                            className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-rose-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                            {isSelected && <span className="ml-0.5 text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      name="storageItemsToStore"
                      value={bookingData.storageItemsToStore}
                      onChange={handleBookingChange}
                      rows="2"
                      placeholder="Additional items or details (e.g. 4x chairs, king bed, fridge...)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  {/* Policy Document Banner */}
                  {service.storagePolicyDocUrl && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16z"/>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-amber-900">📋 Policy Document Required</p>
                          <p className="text-xs text-amber-700 mt-0.5">You must read the provider's storage policy before booking.</p>
                          <a
                            href={service.storagePolicyDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-700 underline hover:text-blue-900"
                          >
                            📄 Open & read policy document ↗
                          </a>
                        </div>
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="mt-0.5 accent-rose-500 w-4 h-4 flex-shrink-0"
                          onChange={(e) => setBookingData(prev => ({ ...prev, _policyAcknowledged: e.target.checked }))}
                          checked={bookingData._policyAcknowledged || false}
                        />
                        <span className="text-xs text-amber-800 font-medium leading-snug">
                          I confirm that I have read and agree to the storage policy document above. *
                        </span>
                      </label>
                    </div>
                  )}
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
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {(() => {
                  const breakdown = getMovingBreakdown();
                  if (!breakdown || !breakdown.hasOptions) return null;
                  return (
                    <div className="text-xs text-gray-600 border-b border-gray-200 pb-2 space-y-1">
                      <p className="font-semibold text-gray-800 mb-1">Price Breakdown:</p>
                      {breakdown.boxesCount > 0 && (
                        <div className="flex justify-between">
                          <span>📦 Boxes ({breakdown.boxesCount} × R{breakdown.costPerBox})</span>
                          <span>R{breakdown.boxesCost}</span>
                        </div>
                      )}
                      {breakdown.kilosCount > 0 && (
                        <div className="flex justify-between">
                          <span>⚖️ Weight ({breakdown.kilosCount} kg × R{breakdown.costPerKilo})</span>
                          <span>R{breakdown.kilosCost}</span>
                        </div>
                      )}
                      {breakdown.vehicleLabel && (
                        <div className="flex justify-between">
                          <span>🚛 Transport Vehicle ({breakdown.vehicleLabel})</span>
                          <span>R{breakdown.vehicleCost}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>🗺️ Travel Fee</span>
                        <span>R{breakdown.travelFee}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>🛎️ Service Fee (10%)</span>
                        <span>R{breakdown.serviceFee}</span>
                      </div>
                    </div>
                  );
                })()}
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
