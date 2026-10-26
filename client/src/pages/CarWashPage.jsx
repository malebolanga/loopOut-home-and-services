/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaUser,
  FaClock, FaShieldAlt, FaCheckCircle,
  FaWhatsapp, FaExclamationTriangle, FaRobot,
  FaArrowLeft, FaCar, FaTools, FaInfoCircle,
  FaTimes, FaFileImage, FaFilePdf, FaArrowUp, 
  FaArrowDown, FaCalendar, FaBriefcase, FaAward,
  FaSoap, FaTint, FaOilCan, FaSprayCan, FaWrench,
  FaWater, FaWind, FaSun, FaCheck, FaRegSnowflake,
  FaChevronLeft, FaChevronRight,
  FaHeart, FaShare, FaHome, FaUtensils, FaLeaf,
  FaFlag, FaBaby, FaSnowflake, FaUserFriends,
  FaCertificate, FaGraduationCap, FaGlobe,
  FaComment, FaLock, FaMobileAlt, FaMapPin, FaSpinner
} from 'react-icons/fa';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

import Comment from '../components/Comment';
import HelperBookingSheet from '../components/HelperBookingSheet';
import CommentsSidePanelService from '../components/CommentsSidePanelService';
import { useBookedSlots } from '../hooks/useBookedSlots';

export default function CarWashPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [carWash, setCarWash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const hasReviews = commentCount > 0 && Number(carWash?.rating) > 0;
  const ratingLabel = hasReviews ? Number(carWash.rating).toFixed(1) : '';

  const params = useParams();
  const { bookedDates, isTimeSlotBooked, isDateFullyBooked } = useBookedSlots(carWash?._id || params.carWashId || params.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Full page overlay state for booking form
  const [showBookingFormOverlay, setShowBookingFormOverlay] = useState(false);

  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    selectedServices: [],
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    address: '',
    date: '',
    time: '',
    specialRequirements: '',
    waterSource: 'client',
    electricityAccess: 'yes',
    parkingAvailable: 'yes',
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll detection for navigation transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Standard package definitions fallback map
  const STANDARD_PACKAGES_MAP = {
    wash_glow: { id: 'wash_glow', name: 'Wash & Glow', description: 'Exterior hand wash, tire shine & high-gloss spray finish', price: 130, duration: '30-45 mins', includes: ['Exterior hand wash', 'Tire shine', 'High-gloss spray', 'Rinse & dry'], popular: true },
    wash_dry: { id: 'wash_dry', name: 'Wash & Dry', description: 'Exterior hand wash, streak-free microfibre towel dry & windows', price: 100, duration: '30 mins', includes: ['Hand wash', 'Towel dry', 'Window clean', 'Tire rinse'], popular: false },
    wash_dry_polish: { id: 'wash_dry_polish', name: 'Wash, Dry & Polish', description: 'Full exterior hand wash, towel dry & protective hand wax polish', price: 200, duration: '1 hr', includes: ['Hand wash', 'Microfibre dry', 'Hand wax polish', 'Tire shine'], popular: true },
    engine_wash: { id: 'engine_wash', name: 'Engine Wash', description: 'High-pressure engine bay degrease & protective engine detailing', price: 150, duration: '30 mins', includes: ['Engine degreasing', 'High-pressure spray', 'Hose detailing', 'Protective coat'], popular: false },
    interior_clean: { id: 'interior_clean', name: 'Interior Deep Clean', description: 'Full seat vacuuming, dashboard wipe, panel clean & odor elimination', price: 180, duration: '45 mins', includes: ['Full vacuum', 'Dashboard wipe', 'Panel cleaning', 'Odor removal'], popular: false },
    full_detail: { id: 'full_detail', name: 'Full Detailing', description: 'Complete interior deep clean + exterior hand wash, dry & polish', price: 350, duration: '2 hrs', includes: ['Exterior wash & polish', 'Interior deep clean', 'Leather treatment', 'Tire dressing'], popular: true },
    ceramic: { id: 'ceramic', name: 'Ceramic Coating', description: 'Paint decontamination, clay bar & long-lasting ceramic coat protection', price: 800, duration: '3 hrs', includes: ['Clay bar treatment', 'Ceramic coating', 'Paint decontamination', 'Engine clean'], popular: false },
  };

  // Dynamic wash services based on listing serviceList or carWashPackages
  const activeServices = useMemo(() => {
    if (carWash?.serviceList && carWash.serviceList.length > 0) {
      return carWash.serviceList.map((item, idx) => ({
        id: item.type || `service_${idx}`,
        name: item.name,
        description: item.description || '',
        price: Number(item.price) || 0,
        duration: item.duration || '',
        includes: [],
        popular: false
      }));
    }

    if (carWash?.carWashPackages) {
      const pkgList = carWash.carWashPackages.split(',').map(s => s.trim()).filter(Boolean);
      return pkgList.map(pkgId => {
        if (STANDARD_PACKAGES_MAP[pkgId]) return STANDARD_PACKAGES_MAP[pkgId];
        return {
          id: pkgId,
          name: pkgId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: '',
          price: Number(carWash?.regularPrice) || 0,
          duration: '',
          includes: [],
          popular: false
        };
      });
    }

    return [];
  }, [carWash]);

  // Dynamic vehicle types based on listing vehicleTypes string
  const activeVehicleTypes = useMemo(() => {
    if (carWash?.vehicleTypes) {
      const typesList = carWash.vehicleTypes.split(',').map(s => s.trim()).filter(Boolean);
      return typesList.map(typeStr => {
        return {
          id: typeStr,
          name: typeStr,
          multiplier: 1
        };
      });
    }
    return [
      { id: 'Sedan', name: 'Sedan', multiplier: 1.0 },
      { id: 'Hatchback', name: 'Hatchback', multiplier: 1.0 },
      { id: 'SUV / Crossover', name: 'SUV / Crossover', multiplier: 1 },
      { id: '4x4 / Bakkie / Truck', name: '4x4 / Bakkie / Truck', multiplier: 1 },
      { id: 'Van / Minibus', name: 'Van / Minibus', multiplier: 1 },
      { id: 'Luxury / Sports Car', name: 'Luxury / Sports Car', multiplier: 1 }
    ];
  }, [carWash]);

  const listedPrices = activeServices.map((service) => Number(service.price)).filter((price) => price > 0);
  const startingPrice = listedPrices.length
    ? Math.min(...listedPrices)
    : Number(carWash?.regularPrice) || null;

  const carWashServices = activeServices;
  const vehicleTypes = activeVehicleTypes;

  const serviceOptions = useMemo(() => {
    return carWashServices.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      icon: '🚗'
    }));
  }, [carWashServices]);

  const helperObj = useMemo(() => {
    if (!carWash) return null;
    return {
      ...carWash,
      type: 'carwash',
      name: carWash.name,
      regularPrice: carWash.regularPrice || startingPrice || 0
    };
  }, [carWash, startingPrice]);


  useEffect(() => {
    const fetchCarWash = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/carwash/get/${id}`);
        if (!res.ok) throw new Error('Failed to fetch car wash details');
        const data = await res.json();
        setCarWash(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCarWash();
  }, [id]);

  useEffect(() => {
    let total = 0;
    selectedServices.forEach(serviceId => {
      const service = activeServices.find(s => s.id === serviceId || s.name === serviceId);
      if (service) total += service.price;
    });
    if (bookingData.vehicleType) {
      const vehicle = activeVehicleTypes.find(v => v.id === bookingData.vehicleType || v.name === bookingData.vehicleType);
      if (vehicle) total = Math.round(total * vehicle.multiplier);
    }
    setTotalPrice(Math.round(total));
  }, [selectedServices, bookingData.vehicleType, activeServices, activeVehicleTypes]);

  const toggleDescription = () => setShowFullDescription(!showFullDescription);

  const handleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      const exists = prev.includes(serviceId);
      const updated = exists ? prev.filter(id => id !== serviceId) : [...prev, serviceId];
      setBookingData(b => ({ ...b, selectedServices: updated }));
      return updated;
    });
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const digitsOnly = String(contact).replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) return '27' + digitsOnly.substring(1);
    return digitsOnly;
  };

  // Function to open full-page booking form overlay
  const openBookingFormOverlay = () => {
    setShowBookingFormOverlay(true);
    document.body.style.overflow = 'hidden';
  };

  const handleMessageProvider = async () => {
    const providerId = carWash?.userRef?._id || carWash?.userRef;
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (!providerId || currentUser._id === providerId) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: providerId,
          content: `Hi, I'm interested in ${carWash.name}.`
        })
      });
      const data = await response.json();
      if (response.ok) navigate(`/messages/${data.conversationId || data._id}`);
      else alert(data.message || 'Failed to start conversation');
    } catch (messageError) {
      console.error('Error starting conversation:', messageError);
      alert('An error occurred. Please try again.');
    }
  };

  // Function to close full-page booking form overlay
  const closeBookingFormOverlay = () => {
    setShowBookingFormOverlay(false);
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

  // Enhanced WhatsApp booking function with all form data
  
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

  const handleBookingSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!carWash?.contact) {
      alert("Contact information is missing.");
      return;
    }

    // Basic validation
    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    if (bookingData.date && bookingData.time && isTimeSlotBooked(bookingData.date, bookingData.time, 60)) {
      alert("This time slot is already booked. Please choose an available time.");
      return;
    }

    if (!bookingData.address) {
      alert("Please provide your address for mobile service.");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    let uploadedFiles = [];

    if (attachments.length > 0) {
      setIsUploading(true);
      try {
        uploadedFiles = await uploadFilesToCloud(attachments);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload attachments. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Format the client's phone number for the reply link
    const clientPhone = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';

    // Define accept and decline messages
    const acceptMessage = `I accept your car wash booking for ${bookingData.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `I'm unable to accept your booking for ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Get selected service details
    const selectedServiceDetails = selectedServices.map(serviceId => {
      const service = carWashServices.find(s => s.id === serviceId);
      return service ? `${service.name} (R${service.price})` : serviceId;
    }).join(', ');

    // Get vehicle type details
    const vehicleTypeDetails = bookingData.vehicleType 
      ? vehicleTypes.find(v => v.id === bookingData.vehicleType)?.name 
      : 'Not specified';

    // Build the main WhatsApp message
    let message = `*🚗 New Car Wash Booking Request*%0A%0A`;

    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Selected Services: ${selectedServiceDetails}%0A`;
    message += `• Vehicle Type: ${vehicleTypeDetails}%0A`;
    message += `• Total Price: R${totalPrice}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    
    message += `*📍 SERVICE LOCATION*%0A`;
    message += `• Address: ${bookingData.address}%0A`;
    
    if (bookingData.vehicleMake) {
      message += `• Vehicle Make/Model: ${bookingData.vehicleMake} ${bookingData.vehicleModel || ''}%0A`;
    }
    
    if (bookingData.specialRequirements) {
      message += `• Special Requirements: ${bookingData.specialRequirements}%0A`;
    }
    
    message += `• Water Source: ${bookingData.waterSource === 'client' ? 'Client provides' : 'Service provider brings'}%0A`;
    message += `• Electricity Access: ${bookingData.electricityAccess === 'yes' ? 'Yes' : 'No'}%0A`;
    message += `• Parking Available: ${bookingData.parkingAvailable === 'yes' ? 'Yes' : 'No'}%0A`;
    
    message += `%0A`;

    // Add attachments if they exist
    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️' : '📄'} ${file.name}%0A`;
      });
      message += `%0A`;
    }

    // Add action links
    message += `*ACTION REQUIRED*%0A`;
    message += `Please respond to this booking request:%0A%0A`;
    if (acceptLink) {
      message += `✅ Accept: ${acceptLink}%0A`;
    }
    if (declineLink) {
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `_Sent via loopOut Car Wash Booking_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(carWash.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Close the booking form overlay
    closeBookingFormOverlay();
    setAttachments([]);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: carWash?.name,
          text: `Check out ${carWash?.name} on our platform!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-white mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-rose-500 font-semibold hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!carWash) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Car wash not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-rose-500 font-semibold">
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const description = carWash.description || '';
  const displayText = showFullDescription ? description : description.slice(0, 250) + (description.length > 250 ? "..." : "");

  return (
    <div className="min-h-screen app-safe-content-bottom pb-36 lg:pb-0 bg-white text-slate-900">
      {/* Navigation Header - Transparent on top of image */}
      <nav className={`app-safe-top fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800/50' : 'bg-transparent py-2'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)}
              className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white' : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm'}`}
            >
              <FaArrowLeft className="text-lg" />
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white' : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm'}`}
              >
                <FiShare2 className="text-lg" />
              </button>
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white' : 'bg-black/20 hover:bg-black/40 backdrop-blur-sm'}`}
              >
                {isSaved ? 
                  <FaHeart className="text-lg text-rose-500" /> : 
                  <FiHeart className={`text-lg ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Image Gallery - Full Width */}
      {carWash.imageUrls?.length > 0 && (
        <div className="relative w-full">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-2 h-[45svh] sm:h-[45svh] md:h-[440px] lg:h-[520px] w-full bg-slate-100 overflow-hidden">
            <button type="button" aria-label="View first photo" className="relative h-full cursor-pointer group overflow-hidden" onClick={() => { setActiveImageIndex(0); setShowImageModal(true); }}>
              <img src={carWash.imageUrls[0]} alt={carWash.name} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </button>
            <div className="hidden md:grid grid-cols-2 gap-2 h-full">
              {carWash.imageUrls.slice(1, 5).map((url, index) => (
                <button type="button" key={url + index} aria-label={`View photo ${index + 2}`} className="relative h-full cursor-pointer group overflow-hidden" onClick={() => { setActiveImageIndex(index + 1); setShowImageModal(true); }}>
                  <img src={url} alt={`${carWash.name} ${index + 2}`} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
                </button>
              ))}
              {carWash.imageUrls.length < 5 && Array(4 - Math.min(4, carWash.imageUrls.length - 1)).fill(null).map((_, index) => <div key={`empty-${index}`} className="bg-slate-800 h-full" />)}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <main className="relative z-10 -mt-7 md:-mt-10 min-h-[55svh] max-w-6xl mx-auto rounded-t-[1.75rem] md:rounded-t-[2rem] bg-white px-5 sm:px-8 lg:px-12 pb-32 lg:pb-16 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
        <div className="mb-8 border-b border-slate-200 pb-7 pt-7">
          <div className="mb-3 -mt-12 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-sm">
            {carWash.userRef?.avatar ? <img src={carWash.userRef.avatar} alt={carWash.userRef?.username || carWash.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <FaUser className="text-xl text-slate-400" />}
          </div>
          <h1 className="mb-3 max-w-4xl text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{carWash.name}</h1>
          <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600">{displayText.split('\n')[0] || `Car wash and detailing in ${carWash.address || 'your area'}`}</p>
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-slate-800">
              <FaStar className="text-amber-400" />
              <span className="font-semibold">{hasReviews ? ratingLabel : 'New'}</span>
              <span className="text-slate-500">{commentCount} {commentCount === 1 ? 'review' : 'reviews'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-gray-700 dark:text-slate-300"><FaCheckCircle className="h-4 w-4 text-indigo-500" />{Number(carWash.bookingsCount) > 0 ? ` Booked ${carWash.bookingsCount} ${Number(carWash.bookingsCount) === 1 ? 'time' : 'times'}` : ' No bookings yet'}</span>
            {carWash.address && <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-gray-700 dark:text-slate-300"><FaMapMarkerAlt className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{carWash.address}</span></span>}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <Link to={`/user-profile/${carWash.userRef?._id || carWash.userRef}`} className="flex items-center justify-between gap-4 transition-opacity hover:opacity-80 sm:w-fit">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hosted by {carWash.userRef?.username || carWash.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">View provider profile</p>
                </div>
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm">
                {carWash.userRef?.avatar ? (
                  <img 
                    src={carWash.userRef.avatar} 
                    alt={carWash.userRef.username}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                    <FaUser className="text-2xl" />
                  </div>
                )}
                </div>
              </Link>
              <button type="button" onClick={handleMessageProvider} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"><FaComment className="h-4 w-4" />Message</button>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About {carWash.name}</h2>
              <div className="text-gray-700 dark:text-white leading-relaxed space-y-4">
                {displayText.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              {description.length > 250 && (
                <button 
                  onClick={toggleDescription}
                  className="mt-4 flex items-center gap-2 font-semibold underline text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Services Offered */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Choose a service</h2>
              <div className="grid grid-cols-1 gap-3">
                {activeServices.map((service) => (
                  <button type="button"
                    key={service.id}
                    onClick={() => handleServiceSelection(service.id)}
                    aria-pressed={selectedServices.includes(service.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      selectedServices.includes(service.id) 
                        ? 'border-rose-500 bg-rose-50 shadow-sm dark:bg-rose-950/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl ${selectedServices.includes(service.id) ? 'text-rose-500' : 'text-slate-400'}`} aria-hidden="true"><FaCar /></span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold ${selectedServices.includes(service.id) ? 'text-rose-700' : 'text-slate-900'}`}>{service.name}</span>
                      {service.description && <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-slate-500">{service.description}</span>}
                      {service.duration && <span className="mt-2 block text-xs text-slate-500">{service.duration}</span>}
                    </span>
                    <span className={`shrink-0 text-right font-semibold ${selectedServices.includes(service.id) ? 'text-rose-600' : 'text-slate-900'}`}>{Number(service.price) > 0 ? `R${service.price}` : 'Ask for price'}<span className="block text-[11px] font-normal text-slate-500">per vehicle</span></span>
                    {selectedServices.includes(service.id) && (
                      <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500">
                        <FaCheck className="text-white text-xs" />
                      </span>
                    )}
                  </button>
                ))}
                {activeServices.length === 0 && <p className="rounded-xl border border-gray-200 p-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">Service options have not been added yet. Message the provider for details.</p>}
              </div>
              
              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-white font-medium">Vehicle type</span>
                    <select 
                      name="vehicleType"
                      value={bookingData.vehicleType}
                      onChange={handleBookingChange}
                      className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="">Select vehicle type</option>
                      {activeVehicleTypes.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="font-semibold text-gray-900 dark:text-white">Total estimate</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">R{totalPrice}</span>
                  </div>
                </div>
              )}
            </div>

            {carWash.imageUrls?.length > 0 && (
              <section className="border-b border-slate-200 pb-7" aria-labelledby="carwash-portfolio-title">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div><h2 id="carwash-portfolio-title" className="text-xl font-semibold text-slate-900">My portfolio</h2><p className="mt-1 text-sm text-slate-500">A selection of this provider’s car care work</p></div>
                  <button type="button" onClick={() => { setActiveImageIndex(0); setShowImageModal(true); }} className="shrink-0 text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-rose-600">View all {carWash.imageUrls.length}</button>
                </div>
                <div className="grid aspect-[1.8/1] grid-cols-[1.25fr_1fr] grid-rows-2 gap-1 overflow-hidden rounded-2xl bg-white sm:aspect-[2.15/1]">
                  {carWash.imageUrls.slice(0, 3).map((url, index) => (
                    <button key={`carwash-portfolio-${url}-${index}`} type="button" onClick={() => { setActiveImageIndex(index); setShowImageModal(true); }} aria-label={`View portfolio photo ${index + 1}`} className={`group relative overflow-hidden bg-slate-100 focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 ${index === 0 ? 'row-span-2' : ''}`}>
                      <img src={url} alt={`${carWash.name} portfolio photo ${index + 1}`} className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <FaStar className="text-amber-400 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{hasReviews ? `${ratingLabel} · ${commentCount} ${commentCount === 1 ? 'review' : 'reviews'}` : 'New · 0 reviews'}</h2>
              </div>
              <Comment
                serviceId={carWash._id}
                onTotalComments={setCommentCount}
                maxComments={2}
              />
              
              {commentCount > 2 && <button
                onClick={() => setShowCommentsPanel(true)}
                className="mt-6 px-6 py-3 border border-gray-900 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto"
              >
                Show all {commentCount} reviews
              </button>}
            </div>

            {/* Car wash booking experience */}
            <section aria-labelledby="carwash-experience-title" className="rounded-2xl bg-slate-50 p-5 sm:p-6 dark:bg-gray-800/60">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">A smoother car care visit</p>
              <h2 id="carwash-experience-title" className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">A car wash experience that works for you</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Choose the service your vehicle needs, select its type to see an estimate, then send a reservation request. You can message the provider to confirm the location, timing and any special requirements before your visit.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: <FaCar className="h-4 w-4" />, title: 'Choose your service', detail: 'Compare the available wash and detailing options.' },
                  { icon: <FaCheckCircle className="h-4 w-4" />, title: 'See your estimate', detail: 'Select your vehicle type and review the total.' },
                  { icon: <FaComment className="h-4 w-4" />, title: 'Confirm the details', detail: 'Message the provider about your appointment.' }
                ].map((step) => (
                  <div key={step.title} className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80 dark:bg-gray-900 dark:ring-gray-700">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{step.icon}</span>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.detail}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column - Booking Card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-900 sticky top-24">
                <p className="text-sm font-medium text-slate-500">Services from</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{startingPrice ? `R${startingPrice}` : 'Ask for price'}</span>
                  {startingPrice && <span className="text-sm text-slate-500">per vehicle</span>}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Choose a wash or detailing service to see your estimate.</p>
                {selectedServices.length > 0 && <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-gray-800 dark:text-slate-200">{selectedServices.length} service{selectedServices.length === 1 ? '' : 's'} selected · R{totalPrice} estimated</p>}
                <button onClick={openBookingFormOverlay} className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                  Review &amp; reserve
                </button>
                <button onClick={handleMessageProvider} className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-700 dark:text-slate-200 dark:hover:bg-gray-800">
                  Message {carWash.userRef?.username || 'provider'}
                </button>
                <p className="mt-4 text-center text-xs text-slate-500">Confirm service and appointment details before booking.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Full Screen Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button 
              onClick={() => setShowImageModal(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>
            <span className="font-medium">{activeImageIndex + 1} / {carWash.imageUrls?.length || 1}</span>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <button 
              onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30"
              disabled={activeImageIndex === 0}
            >
              <FaChevronLeft className="text-xl" />
            </button>
            
            <img 
              src={carWash.imageUrls?.[activeImageIndex]} 
              alt={`View ${activeImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            <button 
              onClick={() => setActiveImageIndex(prev => Math.min((carWash.imageUrls?.length || 1) - 1, prev + 1))}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30"
              disabled={activeImageIndex === (carWash.imageUrls?.length || 1) - 1}
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
          
          <div className="p-4 bg-black">
            <Swiper
              modules={[FreeMode]}
              spaceBetween={10}
              slidesPerView="auto"
              freeMode={true}
              className="thumbs-swiper"
            >
              {carWash.imageUrls?.map((url, idx) => (
                <SwiperSlide key={idx} style={{ width: '80px' }}>
                  <div 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`cursor-pointer rounded-lg overflow-hidden aspect-square border-2 ${
                      idx === activeImageIndex ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

            {/* Car Wash Booking Sheet Popout */}
      <HelperBookingSheet
        isOpen={showBookingFormOverlay}
        onClose={closeBookingFormOverlay}
        helper={helperObj}
        bookingData={bookingData}
        handleBookingChange={handleBookingChange}
        setBookingData={setBookingData}
        serviceOptions={serviceOptions}
        handleServiceSelection={handleServiceSelection}
        totalPrice={totalPrice}
        handleBookingSubmit={handleBookingSubmit}
        handleEscrowCheckout={handleEscrowCheckout}
        isUploading={isUploading}
        isTimeSlotBooked={isTimeSlotBooked}
        isDateFullyBooked={isDateFullyBooked}
      />

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelService
          serviceId={carWash._id}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-40 safe-area-bottom mobile-booking-bar">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 mr-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{totalPrice > 0 ? `R${totalPrice}` : startingPrice ? `R${startingPrice}` : 'Ask for price'}</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">{selectedServices.length > 0 ? 'Estimated total' : 'Starting at'}</span>
            </div>
            <div className="truncate text-[10px] font-bold uppercase tracking-widest text-rose-600">{carWash.name}</div>
          </div>
          <button 
            onClick={openBookingFormOverlay}
            className="shrink-0 rounded-2xl bg-slate-950 px-6 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-black active:scale-95"
          >
            Review & Reserve
          </button>
        </div>
      </div>

    </div>
  );
}
