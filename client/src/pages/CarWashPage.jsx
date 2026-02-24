/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
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
  FaExpand, FaChevronLeft, FaChevronRight,
  FaHeart, FaShare, FaHome, FaUtensils, FaLeaf,
  FaFlag, FaBaby, FaSnowflake, FaUserFriends,
  FaCertificate, FaGraduationCap, FaGlobe,
  FaComment, FaLock, FaMobileAlt, FaMapPin
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

import HelperComments from '../components/HelperComments';
import CommentsSidePanelHelper from '../components/CommentsSidePanelHelper';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  // Car wash service options - Airbnb style cards
  const carWashServices = [
    { 
      id: 'basic-wash', 
      name: 'Basic Exterior Wash', 
      description: 'Complete exterior hand wash with tire shine and window cleaning',
      price: 120,
      duration: '45 mins',
      includes: ['Hand wash', 'Tire shine', 'Window clean', 'Rinse & dry'],
      popular: true
    },
    { 
      id: 'interior-clean', 
      name: 'Interior Deep Clean', 
      description: 'Deep vacuum, surface wipe down, and odor elimination',
      price: 180,
      duration: '1 hr',
      includes: ['Full vacuum', 'Dashboard clean', 'Door panels', 'Odor removal'],
      popular: false
    },
    { 
      id: 'full-detail', 
      name: 'Full Detail Package', 
      description: 'Complete interior and exterior detailing service',
      price: 350,
      duration: '2 hrs',
      includes: ['Exterior wash', 'Interior clean', 'Wax polish', 'Tire dressing'],
      popular: true
    },
    { 
      id: 'premium-detail', 
      name: 'Premium Ceramic Detail', 
      description: 'Luxury treatment with ceramic coating protection',
      price: 800,
      duration: '3 hrs',
      includes: ['Clay bar treatment', 'Ceramic coating', 'Leather conditioning', 'Engine bay clean'],
      popular: false
    }
  ];

  const vehicleTypes = [
    { id: 'sedan', name: 'Sedan', multiplier: 1.0 },
    { id: 'suv', name: 'SUV', multiplier: 1.3 },
    { id: '4x4', name: '4x4 / Truck', multiplier: 1.5 },
    { id: 'luxury', name: 'Luxury / Executive', multiplier: 1.8 }
  ];

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
      const service = carWashServices.find(s => s.id === serviceId);
      if (service) total += service.price;
    });
    if (bookingData.vehicleType) {
      const vehicle = vehicleTypes.find(v => v.id === bookingData.vehicleType);
      if (vehicle) total = total * vehicle.multiplier;
    }
    setTotalPrice(Math.round(total));
  }, [selectedServices, bookingData.vehicleType]);

  const toggleDescription = () => setShowFullDescription(!showFullDescription);

  const handleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      const exists = prev.includes(serviceId);
      if (exists) return prev.filter(id => id !== serviceId);
      return [...prev, serviceId];
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

  const handleQuickBooking = () => {
    if (!carWash?.contact) {
      alert("Contact information is missing.");
      return;
    }
    if (!bookingData.name || !bookingData.phone) {
      alert("Please fill in your name and phone number.");
      return;
    }
    
    const message = `*New Car Wash Booking*%0A%0A*Client:* ${bookingData.name}%0A*Phone:* ${bookingData.phone}%0A*Service:* ${selectedServices.length > 0 ? 'Selected services' : 'General inquiry'}%0A*Total:* R${totalPrice}`;
    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(carWash.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
        console.log('Error sharing:', err);
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Car wash not found</h2>
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 font-medium"
              >
                <FaShare className="text-sm" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 font-medium"
              >
                <FaHeart className={`text-sm ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Image Gallery Section - Airbnb Style */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[400px] rounded-xl overflow-hidden">
          {/* Main Large Image */}
          <div 
            className="relative h-full cursor-pointer group"
            onClick={() => setShowImageModal(true)}
          >
            <img
              src={carWash.imageUrls?.[0] || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80'}
              alt={carWash.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Side Grid Images */}
          <div className="hidden md:grid grid-cols-2 gap-2 h-full">
            {[1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => {
                  setActiveImageIndex(index);
                  setShowImageModal(true);
                }}
              >
                <img
                  src={carWash.imageUrls?.[index] || carWash.imageUrls?.[0] || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'}
                  alt={`${carWash.name} ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {index === 3 && carWash.imageUrls?.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{carWash.imageUrls.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Mobile Image Indicator */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {carWash.imageUrls?.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{carWash.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <FaStar className="text-rose-500 fill-rose-500" />
                  <span className="font-semibold text-gray-900">{carWash.rating || '4.9'}</span>
                  <span className="underline cursor-pointer hover:text-gray-900">{carWash.reviewCount || '12'} reviews</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <FaAward className="text-rose-500" />
                  <span>Superhost</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  <span>{carWash.address || 'Mobile service area'}</span>
                </div>
              </div>
            </div>

            {/* Service Provider Info */}
            <div className="flex items-center gap-4 py-6 border-b border-gray-200">
              <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src={carWash.imageUrls?.[0]} 
                  alt={carWash.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Car Wash Professional</h2>
                <p className="text-gray-600">{carWash.host || '5'} years of experience</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-4 py-6 border-b border-gray-200">
              <div className="flex gap-4">
                <FaHome className="text-2xl text-gray-700 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Service</h3>
                  <p className="text-gray-600 text-sm mt-1">I come to your location for ultimate convenience. All equipment provided.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <FaCertificate className="text-2xl text-gray-700 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Experienced Professional</h3>
                  <p className="text-gray-600 text-sm mt-1">Certified and trained in premium detailing techniques and products.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <FaClock className="text-2xl text-gray-700 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Flexible Scheduling</h3>
                  <p className="text-gray-600 text-sm mt-1">Available 7 days a week. Same-day bookings often available.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this service</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {displayText.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              {description.length > 250 && (
                <button 
                  onClick={toggleDescription}
                  className="mt-4 flex items-center gap-2 font-semibold underline text-gray-900 hover:text-gray-700"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Services Offered */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select your service</h2>
              <div className="space-y-4">
                {carWashServices.map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => handleServiceSelection(service.id)}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:border-gray-400 ${
                      selectedServices.includes(service.id) 
                        ? 'border-rose-500 bg-rose-50/30' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                          {service.popular && (
                            <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {service.includes.map((item, idx) => (
                            <span key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                              <FaCheck className="text-green-500" /> {item}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock /> {service.duration}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-semibold text-gray-900">R{service.price}</div>
                        <div className="text-sm text-gray-500">per vehicle</div>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedServices.includes(service.id) 
                        ? 'border-rose-500 bg-rose-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedServices.includes(service.id) && <FaCheck className="text-white text-xs" />}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Vehicle type adjustment</span>
                    <select 
                      name="vehicleType"
                      value={bookingData.vehicleType}
                      onChange={handleBookingChange}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="">Select vehicle</option>
                      {vehicleTypes.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total estimate</span>
                    <span className="text-2xl font-bold text-gray-900">R{totalPrice}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="py-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <FaStar className="text-rose-500 fill-rose-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {carWash.rating || '4.9'} · {carWash.reviewCount || '12'} reviews
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cleanliness</span>
                    <span className="font-semibold">4.9</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-rose-500 rounded-full w-[98%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Communication</span>
                    <span className="font-semibold">5.0</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-rose-500 rounded-full w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Value</span>
                    <span className="font-semibold">4.8</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-rose-500 rounded-full w-[96%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Service Quality</span>
                    <span className="font-semibold">4.9</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-rose-500 rounded-full w-[98%]" />
                  </div>
                </div>
              </div>

              <HelperComments 
                helperId={carWash._id} 
                onCommentCountChange={setCommentCount}
                limit={2}
              />
              
              <button 
                onClick={() => setShowCommentsPanel(true)}
                className="mt-6 px-6 py-3 border border-gray-900 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Show all {commentCount} reviews
              </button>
            </div>

            {/* Qualifications */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My qualifications</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaBriefcase className="text-gray-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{carWash.host || '5'} years of experience</h3>
                    <p className="text-gray-600 text-sm mt-1">Professional car detailing and washing services with premium products.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCertificate className="text-gray-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Certified Detailer</h3>
                    <p className="text-gray-600 text-sm mt-1">Trained in ceramic coating, paint correction, and interior restoration.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location / Service Area */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">I'll come to you</h2>
              <p className="text-gray-600 mb-4">
                I travel to guests in the {carWash.address || 'surrounding area'}. To book in a different location, you can message me.
              </p>
              <div className="h-64 bg-gray-200 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <FaMapPin className="text-4xl text-rose-500 mx-auto mb-2" />
                    <p className="text-gray-600">Service Area Map</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Things to Know */}
            <div className="py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Things to know</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Service requirements</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>Access to water source</li>
                    <li>Safe parking space</li>
                    <li>All vehicle types welcome</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Cancellation policy</h3>
                  <p className="text-gray-600 text-sm">
                    Cancel at least 24 hours before the start time for a full refund.
                  </p>
                  <button className="text-gray-900 font-semibold underline text-sm mt-2">Learn more</button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Safety & quality</h3>
                  <p className="text-gray-600 text-sm">
                    All professionals are vetted for quality and safety standards.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-300 rounded-xl shadow-lg p-6 bg-white">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">R{carWash.regularPrice}</span>
                    <span className="text-gray-600"> / service</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FaStar className="text-rose-500 fill-rose-500" />
                    <span className="font-semibold">{carWash.rating || '4.9'}</span>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Date</label>
                      <input 
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        className="w-full text-sm text-gray-700 outline-none"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Time</label>
                      <input 
                        type="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        className="w-full text-sm text-gray-700 outline-none"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Your Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      placeholder="Full name"
                      className="w-full text-sm text-gray-700 outline-none"
                    />
                  </div>
                  <div className="p-3 border-t border-gray-300">
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Phone</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleBookingChange}
                      placeholder="Phone number"
                      className="w-full text-sm text-gray-700 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleQuickBooking}
                  className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-lg" />
                  Book via WhatsApp
                </button>

                <div className="text-center text-gray-500 text-sm mb-4">
                  You won't be charged yet
                </div>

                {totalPrice > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span className="underline">Service estimate</span>
                      <span>R{totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span>R{totalPrice}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 mt-6 pt-6 border-t border-gray-200">
                  <FaCheckCircle className="text-rose-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">High demand:</span> This service is usually booked within 3 hours.
                  </p>
                </div>
              </div>

              {/* Report Link */}
              <div className="mt-6 text-center">
                <button className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm mx-auto">
                  <FaFlag className="text-xs" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

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

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelHelper
          helperId={carWash._id}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">R{totalPrice || carWash.regularPrice}</span>
            <span className="text-gray-600 text-sm"> / service</span>
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