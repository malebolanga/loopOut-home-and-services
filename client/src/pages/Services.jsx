// Services.jsx - Airbnb-Style Professional Design
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaWhatsapp,
  FaArrowLeft, FaClock, FaExclamationTriangle,
  FaTools, FaShieldAlt, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaImages,
  FaRegHeart, FaHeart, FaShare, FaUser,
  FaChevronLeft, FaChevronRight, FaCheck,
  FaTimes, FaInfoCircle, FaAward, FaGraduationCap,
  FaBriefcase, FaUtensils, FaUsers, FaCalendarAlt,
  FaHome, FaCar, FaSprayCan, FaBroom, FaTruck,
  FaMotorcycle, FaCookie, FaGlassCheers, FaRing,
  FaPalette, FaTrophy, FaCommentDots, FaArrowRight,
  FaSpinner, FaChild, FaTree, FaWrench, FaBus,
  FaLeaf, FaHome as FaHomeIcon, FaFileImage, FaFilePdf
} from 'react-icons/fa';
import { FiShare2, FiMessageSquare, FiMapPin } from 'react-icons/fi';
import CommentsSidePanelService from '../components/CommentsSidePanelService';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { useWishlist } from '../hooks/useWishlist';
import ServiceItem from '../components/ServiceItem';

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
    icon: <FaBroom />,
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
    icon: <FaUtensils />,
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
    icon: <FaTruck />,
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

  // Maintenance Services
  maintenance: {
    title: 'Home Repair',
    icon: <FaWrench />,
    description: `Expert home maintenance and repair services including plumbing, electrical, painting, and general handyman work.`,
    options: [
      { id: 'plumbing', name: 'Plumbing Services', description: 'Repairs and installations', duration: '1-3 hours', price: 'R450', popular: true, icon: <FaTools /> },
      { id: 'electrical', name: 'Electrical Work', description: 'Certified electrician services', duration: '1-4 hours', price: 'R550', popular: true, icon: <FaTools /> },
      { id: 'painting', name: 'Painting', description: 'Interior and exterior', duration: 'Custom', price: 'R35/sqm', popular: false, icon: <FaPalette /> },
      { id: 'handyman', name: 'General Handyman', description: 'Odd jobs and repairs', duration: 'Hourly', price: 'R300/hour', popular: true, icon: <FaWrench /> }
    ],
    highlights: [
      { icon: <FaShieldAlt />, title: 'Licensed', desc: 'Certified professionals' },
      { icon: <FaTools />, title: 'Equipped', desc: 'Tools provided' }
    ]
  },

  // Car Wash Services
  carWash: {
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

  const RECENTLY_VIEWED_KEY = 'recentlyViewed';

  useEffect(() => {
    if (service) {
      fetchSimilarServices();
      saveToHistory(service);
    }
  }, [service]);

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
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    foodProvided: 'no',
    electricityProvided: 'no'
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

  // Upload files to cloud storage (mock implementation)
  const uploadFilesToCloud = async (files) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return files.map(file => ({
      name: file.name,
      url: `https://example.com/uploads/${Date.now()}_${file.name}`,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      size: file.size
    }));
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
    message += `⏰ *Time:* ${bookingData.time || 'Not specified'}\n\n`;

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

    if (requiresVehicleType && bookingData.vehicleType) {
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*🚗 VEHICLE DETAILS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🚗 *Type:* ${VEHICLE_TYPES.find(v => v.id === bookingData.vehicleType)?.name}\n`;
      if (bookingData.vehicleMake) message += `🔖 *Make:* ${bookingData.vehicleMake}\n`;
      if (bookingData.vehicleModel) message += `🚘 *Model:* ${bookingData.vehicleModel}\n`;
      if (bookingData.licensePlate) message += `🆔 *Plate:* ${bookingData.licensePlate}\n`;
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
    if (acceptLink) message += `✅ *ACCEPT BOOKING:*\n${acceptLink}\n\n`;
    if (declineLink) message += `❌ *DECLINE BOOKING:*\n${declineLink}\n\n`;

    message += `🔐 *Verification Code:* ${verificationCode}\n`;
    message += `_This booking request was sent via LoopOut_`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
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

    const url = await buildWhatsAppMessage(true);
    if (url) window.open(url, '_blank');
  };

  const handleBookingSubmit = async (e) => {
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

    if (!bookingData.address) {
      alert("Please provide your address for service.");
      return;
    }

    setIsUploading(true);

    const url = await buildWhatsAppMessage(false);
    if (url) window.open(url, '_blank');

    setIsUploading(false);
    closeBookingModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-red-600 underline">Try Again</button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Service not found</h2>
        <button onClick={() => navigate('/service-home-page')} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg">
          Browse Services
        </button>
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
        description: 'Professional service package',
        duration: 'Custom'
      }))
    : getServiceOptions(service.type);
    
  const displayedServices = showAllServices ? serviceOptions : serviceOptions.slice(0, 4);
  const whatsappNumber = formatContactForWhatsApp(service.contact);
  const serviceHighlights = currentServiceConfig?.highlights || [];

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-900' : 'hover:bg-white/20 text-white'}`}
            >
              <FaArrowLeft className="text-xl" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-900' : 'hover:bg-white/20 text-white'}`}
              >
                <FiShare2 className="text-xl" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}
              >
                {isFavorite ? (
                  <FaHeart className="text-xl text-rose-500" />
                ) : (
                  <FaRegHeart className={`text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] bg-gray-900">
        {service.imageUrls?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-full p-2">
            <div
              className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => openFullScreenGallery(0)}
            >
              <img
                src={service.imageUrls[0]}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {service.imageUrls.slice(1, 5).map((url, index) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden cursor-pointer group hidden md:block"
                onClick={() => openFullScreenGallery(index + 1)}
              >
                <img
                  src={url}
                  alt={`${service.name} ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}

            <button
              onClick={() => openFullScreenGallery(0)}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
            >
              <FaImages />
              Show all photos
            </button>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FaImages className="text-6xl text-gray-400" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{service.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <FaStar className="text-rose-500" />
                  <span className="font-semibold text-gray-900">{service.rating || '4.5'}</span>
                  <span>({service.reviewCount || '0'} reviews)</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  {service.address || 'Available in your area'}
                </span>
                <span className="font-medium flex items-center gap-1">
                  {currentServiceConfig?.icon}
                  {getProfessionalTitle(service.type)}
                </span>
              </div>
            </div>


            {/* Provider Info */}
            <div className="py-6 border-b border-gray-200">
              <Link 
                to={`/user-profile/${service.creator?._id || service.creator || service.userRef}`}
                className="flex items-start gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
                  <img
                    src={service.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80'}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">Hosted by {service.name}</h2>
                  <p className="text-gray-600">{getProfessionalTitle(service.type)}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
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
                  <FaHome className="text-xl text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Provided at your location</h3>
                  <p className="text-gray-600 text-sm">Service provider travels to you</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FaClock className="text-xl text-gray-700" />
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
                  {showFullDescription ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}
            </div>

            {/* Service Options */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Service options</h2>
              <div className="space-y-4">
                {displayedServices.map((option) => {
                  const isSelected = selectedService?.id === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`flex items-start justify-between p-4 border-2 rounded-xl transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedService(option)}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>{option.icon}</span>
                          <h3 className={`font-semibold ${isSelected ? 'text-rose-700' : 'text-gray-900'}`}>{option.name}</h3>
                          {option.popular && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                        <p className="text-gray-500 text-sm">{option.duration}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className={`font-semibold ${isSelected ? 'text-rose-600' : 'text-gray-900'}`}>{option.price}</p>
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
                  {showAllServices ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}
            </div>

            {/* Qualifications */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Qualifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <FaBriefcase className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{enhancedServiceData.yearsExperience} years of experience</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional experience in {getProfessionalTitle(service.type).toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaAward className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Certified Professional</h3>
                    <p className="text-gray-600 text-sm mt-1">Licensed and insured service provider</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaUsers className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Notable Clientele</h3>
                    <p className="text-gray-600 text-sm mt-1">Trusted by repeat customers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaGraduationCap className="text-2xl text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trained & Certified</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional training completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-8">
                <FaStar className="text-gray-900 text-2xl" />
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
                              <div className="h-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={comment.userAvatar || '/default-avatar.jpg'}
                                        alt={comment.userName}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                        onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                                      />
                                      <div>
                                        <h4 className="font-semibold text-gray-900 leading-tight">{comment.userName}</h4>
                                        <p className="text-sm text-gray-500 mt-0.5">{getRelativeTime(comment.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <FaStar
                                          key={i}
                                          className={`text-[10px] mr-1 ${i < Math.round(rating) ? 'text-gray-900' : 'text-gray-200'}`}
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
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-2xl font-semibold text-gray-900">R{service.regularPrice}</span>
                    <span className="text-gray-600"> / service</span>
                  </div>
                  {service.discountPrice && (
                    <span className="text-gray-400 line-through">R{service.discountPrice}</span>
                  )}
                </div>

                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Date</label>
                      <input
                        type="date"
                        className="w-full text-sm text-gray-600 outline-none"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Time</label>
                      <input
                        type="time"
                        className="w-full text-sm text-gray-600 outline-none"
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-900 uppercase">Guests</label>
                    <select
                      className="w-full text-sm text-gray-600 outline-none bg-transparent"
                      onChange={(e) => setBookingData(prev => ({ ...prev, numberOfGuests: e.target.value }))}
                    >
                      <option value="1">1 guest</option>
                      <option value="2">2 guests</option>
                      <option value="3">3 guests</option>
                      <option value="4">4+ guests</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => openBookingModal()}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors mb-4"
                >
                  Check availability
                </button>

                <div className="text-center text-gray-500 text-sm mb-4">You won't be charged yet</div>

                <div className="space-y-3 text-sm">
                  {selectedService ? (
                    <div className="flex justify-between">
                      <span className="underline">{selectedService.name}</span>
                      <span>{selectedService.price}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="underline">Base Price</span>
                      <span>R{service.regularPrice}</span>
                    </div>
                  )}
                  {service.travelFee > 0 && (
                    <div className="flex justify-between">
                      <span className="underline">Travel fee</span>
                      <span>R{service.travelFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="underline">Service fee (10%)</span>
                    <span>R{Math.round((totalPrice - (parseInt(service.travelFee) || 0)) / 1.1 * 0.1)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                    <span>Total Est.</span>
                    <span>R{totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 bg-white">
                <h3 className="font-semibold text-gray-900 mb-4">Contact provider</h3>
                <div className="space-y-3">
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Hi ${service.name}, I'm interested in your services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      <FaWhatsapp className="text-green-600 text-xl" />
                      Message on WhatsApp
                    </a>
                  )}
                  {service.contact && (
                    <a
                      href={`tel:${service.contact}`}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 rounded-lg font-medium hover:border-gray-900 transition-colors"
                    >
                      <FaPhone />
                      Call {service.contact}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <FaShieldAlt className="text-2xl flex-shrink-0" />
                <p>To help protect your payment, always communicate and pay through our platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
          <div className="aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden relative shadow-inner border border-gray-200">
            <GoogleMapComponent 
              address={service.address || 'Available in your area'} 
              title={`${service.name}'s Service Area`} 
            />
          </div>
        </div>

        {/* Things to Know */}

        <div className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Things to know</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Guest requirements</h3>
              <p className="text-gray-600 text-sm">Ages 13 and up can attend. Message for specific requirements.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cancellation policy</h3>
              <p className="text-gray-600 text-sm">Cancel at least 24 hours before for a full refund.</p>
              <button className="text-gray-900 font-semibold underline mt-2 text-sm">Learn more</button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What to bring</h3>
              <p className="text-gray-600 text-sm">Any specific materials or access requirements will be discussed upon booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery */}
      {showFullScreenGallery && service.imageUrls && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={closeFullScreenGallery} className="p-2 hover:bg-white/10 rounded-full">
              <FaTimes className="text-2xl" />
            </button>
            <span className="font-medium">{modalImageIndex + 1} / {service.imageUrls.length}</span>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <FaChevronLeft className="text-xl" />
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
              <FaChevronRight className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal - Full Page Form */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Complete your booking</h2>
              <button onClick={closeBookingModal} className="p-2 hover:bg-gray-100 rounded-full">
                <FaTimes />
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
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
                  </div>
                </div>
              )}

              {/* Number of Guests (if applicable) */}
              {!requiresVehicleType && (
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
                              <FaFileImage className="text-blue-500" />
                            ) : (
                              <FaFilePdf className="text-red-500" />
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
                            <FaTimes className="text-sm" />
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
                    <FaSpinner className="animate-spin" />
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">R{totalPrice}</span>
              <span className="text-gray-600 text-xs font-bold">Total</span>
            </div>
            {selectedService ? (
              <div className="text-rose-600 text-xs font-semibold truncate max-w-[150px]">
                {selectedService.name} ({selectedService.price})
              </div>
            ) : (
              <div className="text-gray-500 text-xs font-bold">Per service</div>
            )}
          </div>
          <button
            onClick={() => openBookingModal(selectedService)}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;