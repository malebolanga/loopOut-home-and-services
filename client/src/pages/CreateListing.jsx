import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import {
  HomeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  CameraIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  TruckIcon,
  ScissorsIcon,
  CakeIcon,
  PhotoIcon,
  AcademicCapIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  HeartIcon,
  BeakerIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  HomeModernIcon,
  BuildingOfficeIcon,
  MapIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { Sparkles, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import imageCompression from 'browser-image-compression';
import MutualFriends from '../components/MutualFriends';
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const CustomHeartIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    className="w-full h-full"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
    />
  </svg>
);

// Airbnb-style UI Components
const SectionCard = ({ title, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={`bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/40 p-8 md:p-14 shadow-[0_30px_100px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_120px_rgba(0,0,0,0.06)] transition-all duration-700 ${className}`}
  >
    <h2 className="text-4xl font-black text-gray-900 mb-10 tracking-tight leading-tight">{title}</h2>
    {children}
  </motion.div>
);

const FormInput = ({ label, icon: Icon, type = "text", id, value, onChange, placeholder, required = false, className = "", rows = 4, helpText = "", children = null }) => (
  <div className={`group/form ${className}`}>
    <label className="block text-[10px] font-black text-gray-400 group-focus-within/form:text-rose-500 uppercase tracking-[0.25em] mb-4 ml-2 transition-colors">
      {label}
      {required && <span className="text-rose-500 ml-2 font-bold opacity-60">*Required</span>}
    </label>
    <div className="relative group/input">
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-8 py-6 bg-white/40 backdrop-blur-md border-4 border-gray-50 rounded-[2.5rem] focus:ring-[20px] focus:ring-rose-500/5 focus:border-gray-900 focus:bg-white transition-all duration-700 resize-none hover:border-gray-100 shadow-sm"
          rows={rows}
        />
      ) : type === "number" ? (
        <div className="relative group/num">
           <input
            type="number"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full pl-16 pr-8 py-6 bg-white/40 backdrop-blur-md border-4 border-gray-50 rounded-[2.5rem] focus:ring-[20px] focus:ring-rose-500/5 focus:border-gray-900 focus:bg-white transition-all duration-700 hover:border-gray-100 font-black text-lg shadow-sm"
          />
          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-rose-500 font-black text-xl group-focus-within/num:scale-110 transition-transform">R</div>
        </div>
      ) : type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-8 py-6 bg-white/40 backdrop-blur-md border-4 border-gray-50 rounded-[2.5rem] focus:ring-[20px] focus:ring-rose-500/5 focus:border-gray-900 focus:bg-white transition-all duration-700 hover:border-gray-100 font-bold shadow-sm appearance-none"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      ) : (
        <div className="relative group/text">
           {Icon && <Icon className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within/text:text-rose-500 transition-all duration-500" />}
           <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full ${Icon ? 'pl-16' : 'px-8'} pr-8 py-6 bg-white/40 backdrop-blur-md border-4 border-gray-50 rounded-[2.5rem] focus:ring-[20px] focus:ring-rose-500/5 focus:border-gray-900 focus:bg-white transition-all duration-700 hover:border-gray-100 font-bold shadow-sm`}
          />
        </div>
      )}
      {children}
    </div>
    {helpText && <p className="mt-4 text-xs font-bold text-gray-400 ml-4 italic opacity-80">{helpText}</p>}
  </div>
);

const CategoryCard = ({ id, icon: Icon, label, description, selected, onSelect }) => (
  <div
    onClick={() => onSelect(id)}
    className={`
      relative group cursor-pointer p-8 rounded-[2.5rem] border-4 transition-all duration-500 overflow-hidden
      ${selected 
        ? 'border-gray-900 bg-gray-900 text-white shadow-2xl scale-[1.02]' 
        : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-xl'}
    `}
  >
    <div className={`
      w-20 h-20 rounded-[1.7rem] flex items-center justify-center mb-10 transition-all duration-500 transform group-hover:rotate-12
      ${selected ? 'bg-rose-500 text-white' : 'bg-white text-gray-400 group-hover:text-rose-500 shadow-lg'}
    `}>
      <Icon className="w-10 h-10" />
    </div>
    
    <div className="relative z-10">
      <h3 className={`text-2xl font-black mb-3 tracking-tight ${selected ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
      <p className={`text-sm font-medium leading-relaxed ${selected ? 'text-gray-400' : 'text-gray-500 group-hover:text-gray-700'}`}>{description}</p>
    </div>

    {selected && (
      <div className="absolute top-0 right-0 p-6">
        <Sparkles className="w-8 h-8 text-rose-500 opacity-20" />
      </div>
    )}
  </div>
);

const TypeCard = ({ id, label, icon: Icon, emoji, selected, onSelect }) => (
  <div
    onClick={() => onSelect(id)}
    className={`
      p-8 rounded-[2.5rem] border-4 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden
      ${selected 
        ? 'border-gray-900 bg-gray-900 text-white shadow-2xl scale-[1.05]' 
        : 'border-gray-50 bg-white/40 backdrop-blur-md hover:bg-white hover:border-gray-200 hover:shadow-xl'}
    `}
  >
    <div className={`
      w-16 h-16 rounded-[1.2rem] flex items-center justify-center mb-6 transition-all duration-500 transform group-hover:-rotate-12
      ${selected ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-rose-500 shadow-sm'}
    `}>
       {emoji ? <span className="text-3xl">{emoji}</span> : <Icon className="w-8 h-8" />}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${selected ? 'text-rose-400' : 'text-gray-400'}`}>Selection</span>
    <span className={`text-sm font-black uppercase tracking-[0.1em] ${selected ? 'text-white' : 'text-gray-900'}`}>{label}</span>
  </div>
);

const AmenityCard = ({ id, label, emoji, checked, onChange }) => (
  <label className={`
    flex items-center gap-4 p-6 border-4 rounded-[2rem] cursor-pointer transition-all duration-500 group
    ${checked 
      ? 'border-gray-900 bg-gray-900 text-white shadow-2xl scale-[1.02]' 
      : 'border-gray-50 bg-white/40 backdrop-blur-md hover:bg-white hover:border-gray-200 hover:shadow-xl'
    }
  `}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="hidden"
    />
    <div className={`
      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
      ${checked ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-rose-500'}
    `}>
       <span className="text-2xl">{emoji}</span>
    </div>
    <span className={`text-sm font-bold tracking-tight ${checked ? 'text-white' : 'text-gray-900'}`}>{label}</span>
    {checked && <CheckCircleIcon className="w-5 h-5 text-rose-500 ml-auto" />}
  </label>
);

const MediaUploadArea = ({ type = 'image', onChange, onSubmit, filesCount, maxFiles = 10, label, uploading, uploadProgress }) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-6">
      <input
        type="file"
        id={`${type}-upload`}
        accept={type === 'image' ? 'image/*' : 'video/*'}
        multiple={type === 'image'}
        onChange={onChange}
        className="hidden"
        disabled={uploading}
      />
      <label
        htmlFor={`${type}-upload`}
        className={`
          relative group p-12 md:p-20 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center 
          cursor-pointer transition-all duration-500 min-h-[300px] overflow-hidden
          ${uploading ? 'border-gray-100 bg-gray-50' : 'border-gray-100 hover:border-rose-500 hover:bg-rose-50/30'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {type === 'image' ? (
          <>
            <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl mb-8 flex items-center justify-center shadow-2xl shadow-rose-200 group-hover:rotate-12 transition-transform duration-500">
              <CameraIcon className="w-10 h-10" />
            </div>
            <span className="text-gray-900 font-black text-2xl mb-2 tracking-tight">{label || "Captivate with Photos"}</span>
            <span className="text-gray-400 font-bold text-sm tracking-wide">Drag and drop or tap to browse your gallery</span>
            <div className="mt-8 flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm border border-gray-50">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommended: 16:9 Aspect Ratio</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl mb-8 flex items-center justify-center shadow-2xl shadow-gray-200 group-hover:-rotate-12 transition-transform duration-500">
              <VideoCameraIcon className="w-10 h-10" />
            </div>
            <span className="text-gray-900 font-black text-2xl mb-2 tracking-tight">{label || "Cinematic Showcase"}</span>
            <span className="text-gray-400 font-bold text-sm tracking-wide">Bring your listing to life with high-quality video</span>
          </>
        )}
      </label>
      
      {filesCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={onSubmit}
          className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-rose-600 transition-all duration-300 transform active:scale-95"
          disabled={uploading}
        >
          {uploading ? (
             <div className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-.3s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-.5s]" />
                <span>Processing {Math.round(uploadProgress)}%</span>
             </div>
          ) : `Deploy ${filesCount} Masterpiece${filesCount > 1 ? 's' : ''}`}
        </motion.button>
      )}
    </div>
  </div>
);

const getVisibleSteps = (category, type) => {
  const allSteps = [
    { id: 1, label: "Category", icon: MapIcon },
    { id: 2, label: "Type", icon: TagIcon },
    { id: 3, label: "Details", icon: InformationCircleIcon },
    { id: 4, label: "Schedule", icon: ClockIcon },
    { id: 5, label: "Amenities", icon: Sparkles },
    { id: 6, label: "Services", icon: TagIcon },
    { id: 7, label: "Team", icon: UserGroupIcon },
    { id: 8, label: "Media", icon: CameraIcon },
    { id: 9, label: "Review", icon: CheckCircleIcon }
  ];

  if (!category) {
    return allSteps.filter(s => s.id <= 3 || s.id >= 8);
  }

  return allSteps.filter(step => {
    if (category === 'selling') {
      return step.id === 1 || step.id === 2 || step.id === 3 || step.id === 8 || step.id === 9;
    }
    if (category === 'events') {
      return step.id === 1 || step.id === 2 || step.id === 3 || step.id === 5 || step.id === 8 || step.id === 9;
    }
    if (category === 'property') {
      // rent: no schedule step at all
      if (type === 'rent') {
        return step.id !== 4 && step.id !== 6 && step.id !== 7;
      }
      // guest house / hotel / resort: keep schedule step (shows check-in/out UI)
      return step.id !== 6 && step.id !== 7;
    }
    return true;
  });
};

const StepProgress = ({ currentStep, category, type }) => {
  const visibleSteps = getVisibleSteps(category, type);

  return (
    <div className="mb-16 md:mb-20 overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between min-w-[700px] max-w-4xl mx-auto px-4">
        {visibleSteps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = visibleSteps.some((s, idx) => s.id === currentStep && idx > index);
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Connector Line */}
              {index < visibleSteps.length - 1 && (
                <div className={`absolute top-6 left-1/2 w-full h-[3px] transition-all duration-700 ${isCompleted ? 'bg-rose-500' : 'bg-gray-100'}`} />
              )}

              {/* Step Circle */}
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 shadow-lg
                ${isCompleted ? 'bg-rose-500 text-white' : 
                  isActive ? 'bg-gray-900 text-white scale-125 ring-8 ring-gray-50 shadow-gray-200' : 
                  'bg-white border-2 border-gray-100 text-gray-300'}
              `}>
                {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
              </div>

              {/* Label */}
              <div className="mt-4 text-center">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {isActive && (
                   <motion.div 
                     layoutId="step-indicator"
                     className="h-1 w-4 bg-rose-500 mx-auto mt-1 rounded-full" 
                   />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [direction, setDirection] = useState('next');
  
  // Listing type selection
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [files, setFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPromotionPopup, setShowPromotionPopup] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [videoUploadError, setVideoUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [performerUploading, setPerformerUploading] = useState(false);
  const [performerFile, setPerformerFile] = useState(null);
  const [postLimitReached, setPostLimitReached] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [newListingId, setNewListingId] = useState(null);
  const [promotionSteps, setPromotionSteps] = useState(0);
  const [promotionPackage, setPromotionPackage] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Combined form state with all required fields
  const [listingForm, setListingForm] = useState({
    // Common fields
    imageUrls: [],
    videoUrl: "",
    name: "",
    description: "",
    address: "",
    contact: "",
    host: "",
    regularPrice: 100,
    type: "",
    category: "",
    
    // Property specific - ALL REQUIRED FIELDS
    near: "",
    rules: "",
    kind: "apartment",
    period: "Immediate",
    cancel: "Flexible - Free cancellation 48 hours before check-in",
    bedrooms: 1,
    bathrooms: 1,
    discountPrice: 0,
    parking: false,
    pool: false,
    wifi: false,
    kitchen: false,
    stove: false,
    tv: false,
    storage: false,
    security: false,
    furnished: false,
    offer: false,
    hot: false,
    pets: false,
    prepaid: false,
    fridge: false,
    share: false,
    breakfast: false,
    party: false,
    
    // Service specific
    ageGroup: "",
    licenseNumber: "",
    capacity: "",
    vehicleType: "",
    routeAreas: "",
    
    // CAR WASH SPECIFIC FIELDS
    carWashPackages: "",
    vehicleTypes: "",
    additionalServices: "",
    serviceDuration: "",
    mobileService: false,
    ecoFriendly: false,
    
    // Helper specific
    specializations: '',
    equipment: '',
    travelFee: '',
    bookingNotice: '',
    additionalPricing: '',
    style: '',
    sessionDuration: '',
    photoDelivery: '',
    specialties: '',
    dietaryOptions: '',
    orderNotice: '',
    delivery: false,
    
    // New helper types specific fields
    shoeTypes: '', // For sneaker cleaner
    cleaningMethod: '', // For sneaker cleaner
    turnaroundTime: '', // For sneaker cleaner
    animalTypes: '', // For animals
    servicesOffered: '', // For animals
    experience: '', // For animals
    certifications: '', // For animals
    
    // Book specific fields
    bookAuthor: '',
    bookYear: '',
    bookUsageHistory: '',
    numberOfUsed: '',
    
    // Performers & Services
    performers: [],
    serviceList: [],

    // Event specific
    date: "",
    time: "",
    foodAvailable: false,
    familyFriendly: false,

    // Check-in / Check-out (guest house, hotel, resort)
    checkInTime: '14:00',
    checkOutTime: '11:00',

    // Operating Schedule
    operatingHours: {
        monday: { open: '08:00', close: '19:00', closed: false },
        tuesday: { open: '08:00', close: '19:00', closed: false },
        wednesday: { open: '08:00', close: '19:00', closed: false },
        thursday: { open: '08:00', close: '19:00', closed: false },
        friday: { open: '08:00', close: '19:00', closed: false },
        saturday: { open: '08:00', close: '19:00', closed: false },
        sunday: { open: '08:00', close: '19:00', closed: true }
    }
  });

  const [foundHost, setFoundHost] = useState(null);
  const [mutualConnections, setMutualConnections] = useState([]);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const stepRef = useRef(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update form when category or type changes
  useEffect(() => {
    if (selectedCategory && selectedType) {
      setListingForm(prev => ({
        ...prev,
        category: selectedCategory,
        type: selectedType,
        kind: selectedCategory === 'property' ? getDefaultKind(selectedType) : prev.kind,
        near: prev.near || getDefaultNearPlaceholder(selectedCategory, selectedType),
      }));
    }
  }, [selectedCategory, selectedType]);

  const getDefaultKind = (type) => {
    switch(type) {
      case 'rent': return 'apartment';
      case 'over': return 'guest_house';
      case 'office': return 'hourly_room';
      case 'land': return 'Self Catering';
      case 'sale': return 'Hotel';
      default: return 'apartment';
    }
  };

  const getDefaultNearPlaceholder = (category, type) => {
    switch(category) {
      case 'property':
        return "Nearby attractions, restaurants, parks, etc.";
      case 'experiences':
        if (type === 'daycare') return "Your experience with childcare, certifications, training...";
        if (type === 'schoolTransport') return "Your driving experience, safety certifications...";
        if (type === 'carwash') return "Your car wash experience, certifications, eco-friendly products...";
        return "Your experience and qualifications in this service";
      case 'online':
        if (type === 'tutor') return "Subjects you teach, teaching methods, qualifications...";
        if (type === 'barber') return "Services you offer, specialties, experience...";
        if (type === 'photography') return "Your photography style, experience, services...";
        if (type === 'baker') return "Your baking specialties, experience, dietary options...";
        if (type === 'sneaker') return "Your sneaker cleaning experience, methods, products used...";
        if (type === 'washingmat') return "Your mat washing experience, equipment used, drying process...";
        if (type === 'animals') return "Your animal care experience, certifications, types of animals you work with...";
        return "Specific services you provide, experience, skills...";
      case 'events':
        return "Event highlights, special features, what makes it unique...";
      default:
        return "Additional information about your listing...";
    }
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setSelectedCategory(tabFromUrl);
      setCurrentStep(2);
    }
  }, [searchParams]);

  // Check post limit
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const fetchPostCount = async () => {
        if (!currentUser) {
          setLoading(false);
          return;
        }

        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
          const res = await fetch(`${apiUrl}/api/user/post-count`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            credentials: 'include',
            body: JSON.stringify({ userId: currentUser._id }),
          });

          if (!res.ok) {
            if (res.status === 404) {
              setPostLimitReached(false);
              setPaymentRequired(false);
              return;
            }
            throw new Error(`Error: ${res.status}`);
          }

          const data = await res.json();
          if (data.count >= (data.limit || 3)) {
            setPostLimitReached(true);
            setPaymentRequired(true);
          } else {
            setPostLimitReached(false);
            setPaymentRequired(false);
          }
        } catch (err) {
          console.error("Failed to fetch post count:", err);
          setPostLimitReached(false);
          setPaymentRequired(false);
        } finally {
          setLoading(false);
        }
      };

      fetchPostCount();
    }, 800);

    return () => clearTimeout(timer);
  }, [currentUser]);

  // Animation effect
  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Handle Host Discovery by Phone Number
  useEffect(() => {
    const contact = listingForm.contact;
    if (contact && contact.length >= 10) {
      const checkHost = async () => {
        try {
          setCheckingPhone(true);
          const res = await fetch(`/api/user/phone/${encodeURIComponent(contact)}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            setFoundHost(data);
            
            // If found, also fetch mutual connections for current user with this found host
            if (currentUser && data._id && currentUser._id !== data._id) {
               const mutualRes = await fetch(`/api/user/mutual/${data._id}`, {
                 headers: { 
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                 },
                 credentials: 'include'
               });
               if (mutualRes.ok) {
                 const mutualData = await mutualRes.json();
                 setMutualConnections(mutualData);
               }
            }
          } else {
            setFoundHost(null);
            setMutualConnections([]);
          }
        } catch (err) {
          console.error("Error checking host phone:", err);
          setFoundHost(null);
          setMutualConnections([]);
        } finally {
          setCheckingPhone(false);
        }
      };

      const timer = setTimeout(checkHost, 1000); // Debounce
      return () => clearTimeout(timer);
    } else {
      setFoundHost(null);
      setMutualConnections([]);
    }
  }, [listingForm.contact, currentUser]);

  const handleNextStep = () => {
    setDirection('next');
    
    if (currentStep === 1 && !selectedCategory) {
      setError("Please select a category");
      return;
    }
    
    if (currentStep === 2 && !selectedType) {
      setError("Please select a type");
      return;
    }
    
    if (currentStep === 3) {
      if (!listingForm.name.trim()) {
        setError("Please enter a name");
        return;
      }
      if (!listingForm.description.trim()) {
        setError("Please enter a description");
        return;
      }
      if (!listingForm.address.trim()) {
        setError("Please enter an address");
        return;
      }
      if (!listingForm.contact.trim()) {
        setError("Please enter a contact number");
        return;
      }
      if (!listingForm.host.trim()) {
        setError("Please enter a host/organizer name");
        return;
      }
      
      if (selectedCategory === 'property') {
        if (!listingForm.kind.trim()) {
          setError("Please enter the property type");
          return;
        }
        if (!listingForm.period.trim()) {
          setError("Please enter when the property is available from");
          return;
        }
        if (!listingForm.cancel.trim()) {
          setError("Please enter the cancellation policy");
          return;
        }
      }
      
      if (selectedCategory === 'events') {
        if (!listingForm.date) {
          setError("Please select an event date");
          return;
        }
        if (!listingForm.time) {
          setError("Please select an event time");
          return;
        }
      }
      
      if (selectedCategory === 'experiences' && selectedType === 'carwash') {
        if (!listingForm.carWashPackages) {
          setError("Please select at least one car wash package");
          return;
        }
        if (!listingForm.vehicleTypes) {
          setError("Please select which vehicle types you service");
          return;
        }
        if (!listingForm.serviceDuration) {
          setError("Please enter the service duration");
          return;
        }
      }

      // New validations for online helper types
      if (selectedCategory === 'online') {
        if (selectedType === 'sneaker') {
          if (!listingForm.shoeTypes) {
            setError("Please specify what types of sneakers you clean");
            return;
          }
          if (!listingForm.turnaroundTime) {
            setError("Please enter your turnaround time");
            return;
          }
        }
        

        
        if (selectedType === 'animals') {
          if (!listingForm.animalTypes) {
            setError("Please specify what types of animals you care for");
            return;
          }
          if (!listingForm.servicesOffered) {
            setError("Please specify what services you offer");
            return;
          }
          if (!listingForm.experience) {
            setError("Please describe your experience with animals");
            return;
          }
        }
      }
      
      if (selectedCategory === 'selling' && selectedType === 'books') {
        if (!listingForm.bookAuthor) {
          setError("Please specify the author of the book");
          return;
        }
        if (!listingForm.bookYear) {
          setError("Please specify the release year");
          return;
        }
        if (!listingForm.bookUsageHistory) {
          setError("Please specify the history of usage");
          return;
        }
        if (!listingForm.numberOfUsed && listingForm.numberOfUsed !== 0) {
          setError("Please specify the number of times used");
          return;
        }
      }
      
      if (!listingForm.near.trim()) {
        setError(`Please provide ${getNearLabel(selectedCategory, selectedType)}`);
        return;
      }
    }
    
    if (currentStep === 8) {
      if (listingForm.imageUrls.length < 1) {
        setError("You must upload at least one image");
        return;
      }
      
      if (listingForm.regularPrice === undefined || listingForm.regularPrice === null || listingForm.regularPrice === "") {
        setError("Please enter a regular price");
        return;
      }
      
      if (+listingForm.regularPrice < 0) {
        setError("Price cannot be negative");
        return;
      }
      
      if (listingForm.offer && +listingForm.regularPrice < +listingForm.discountPrice) {
        setError("Discount price must be lower than regular price");
        return;
      }
    }
    
    setError(null);
    const visible = getVisibleSteps(selectedCategory, selectedType);
    const currIdx = visible.findIndex(s => s.id === currentStep);
    if (currIdx !== -1 && currIdx < visible.length - 1) {
      setCurrentStep(visible[currIdx + 1].id);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const getNearLabel = (category, type) => {
    switch(category) {
      case 'property':
        return "information about nearby attractions";
      case 'experiences':
        if (type === 'daycare') return "your experience and qualifications";
        if (type === 'schoolTransport') return "your driving experience and certifications";
        if (type === 'carwash') return "your car wash experience and specialties";
        return "your experience and qualifications";
      case 'online':
        if (type === 'tutor') return "subjects and teaching approach";
        if (type === 'barber') return "services and specialties";
        if (type === 'photography') return "photography services and style";
        if (type === 'baker') return "baking specialties and options";
        if (type === 'sneaker') return "your sneaker cleaning experience and methods";
        if (type === 'washingmat') return "your mat washing experience and equipment";
        if (type === 'animals') return "your animal care experience and services";
        return "your services and experience";
      case 'events':
        return "event highlights and features";
      case 'selling':
        return "item condition and details";
      default:
        return "additional information";
    }
  };

  const handlePrevStep = () => {
    setDirection('prev');
    setError(null);
    const visible = getVisibleSteps(selectedCategory, selectedType);
    const currIdx = visible.findIndex(s => s.id === currentStep);
    if (currIdx > 0) {
      setCurrentStep(visible[currIdx - 1].id);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression failed, using original file:", error);
      return file;
    }
  };

  const handleFileChange = async (e) => {
    try {
      const selectedFiles = Array.from(e.target.files);
      const compressedFiles = await Promise.all(selectedFiles.map(compressImage));
      setFiles(compressedFiles);
      setImageUploadError(null);
    } catch (error) {
      console.error("Image compression error:", error);
      setImageUploadError("Failed to process images");
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.match('image.*')) {
        reject(new Error('Only image files are allowed'));
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('Image size must be less than 2MB'));
        return;
      }

      const storage = getStorage(app);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
      const fileName = `${new Date().getTime()}_${cleanFileName}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          let errorMessage = "Image upload failed";
          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage = "You don't have permission to upload";
              break;
            case 'storage/canceled':
              errorMessage = "Upload was canceled";
              break;
            case 'storage/unknown':
              errorMessage = "Unknown error occurred";
              break;
          }
          reject(new Error(errorMessage));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(new Error("Failed to get image URL"));
          }
        }
      );
    });
  };

  const storeVideo = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.match('video.*')) {
        reject(new Error('Only video files are allowed'));
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        reject(new Error('Video size must be less than 50MB'));
        return;
      }

      const storage = getStorage(app);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
      const fileName = `${new Date().getTime()}_${cleanFileName}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          let errorMessage = "Video upload failed";
          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage = "You don't have permission to upload";
              break;
            case 'storage/canceled':
              errorMessage = "Upload was canceled";
              break;
            case 'storage/unknown':
              errorMessage = "Unknown error occurred";
              break;
          }
          reject(new Error(errorMessage));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(new Error("Failed to get video URL"));
          }
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setListingForm({
      ...listingForm,
      imageUrls: listingForm.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleImageSubmit = async () => {
    try {
      if (files.length === 0) {
        setImageUploadError("Please select at least one image");
        return;
      }

      if (files.length > 10) {
        setImageUploadError("You can only upload up to 10 images per listing");
        return;
      }

      setUploading(true);
      setImageUploadError(null);
      setUploadProgress(0);

      const MAX_RETRIES = 3;
      const uploadPromises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let retries = 0;
        let success = false;
        let lastError = null;

        while (retries < MAX_RETRIES && !success) {
          try {
            const uploadPromise = storeImage(file);
            uploadPromises.push(uploadPromise);
            success = true;
          } catch (error) {
            lastError = error;
            retries++;
            if (retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        }

        if (!success) {
          throw lastError || new Error(`Failed to upload image after ${MAX_RETRIES} attempts`);
        }
      }

      const urls = await Promise.all(uploadPromises);
      setListingForm({
        ...listingForm,
        imageUrls: [...listingForm.imageUrls, ...urls],
      });

      setFiles([]);
      setImageUploadError(null);
    } catch (err) {
      let errorMessage = "Image upload failed";
      if (err.message.includes('CORS')) {
        errorMessage = "Server configuration error. Please try again later.";
      } else if (err.message.includes('permission')) {
        errorMessage = "You don't have permission to upload files";
      } else if (err.message.includes('size')) {
        errorMessage = "Image size must be less than 2MB";
      }
      setImageUploadError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePerformerImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setPerformerUploading(true);
      setError(null);
      
      const compressedFile = await compressImage(file);
      const url = await storeImage(compressedFile);
      
      setListingForm(prev => ({
        ...prev,
        newPerformerImage: url
      }));
      setPerformerUploading(false);
    } catch (err) {
      setPerformerUploading(false);
      setError("Failed to upload performer photo: " + err.message);
    }
  };

  const handleVideoUpload = async () => {
    try {
      if (!videoFile) {
        setVideoUploadError("Please select a video file");
        return;
      }

      setUploading(true);
      setVideoUploadError(null);
      setUploadProgress(0);

      const url = await storeVideo(videoFile);
      setListingForm({ ...listingForm, videoUrl: url });
      setVideoFile(null);
      setVideoUploadError(null);
    } catch (err) {
      setVideoUploadError(err.message || "Video upload failed (50MB max)");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (type === "checkbox") {
      setListingForm({ ...listingForm, [id]: checked });
    } else {
      setListingForm({ ...listingForm, [id]: value });
    }
  };

  const handleAddService = () => {
    setListingForm({
      ...listingForm,
      serviceList: [...listingForm.serviceList, { name: "", price: "" }]
    });
  };

  const handleRemoveService = (index) => {
    const newList = [...listingForm.serviceList];
    newList.splice(index, 1);
    setListingForm({ ...listingForm, serviceList: newList });
  };

  const handleServiceChange = (index, field, value) => {
    const newList = [...listingForm.serviceList];
    newList[index][field] = value;
    setListingForm({ ...listingForm, serviceList: newList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (listingForm.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }
    
    if (selectedCategory === 'property' && +listingForm.regularPrice < +listingForm.discountPrice) {
      return setError("Discount price must be lower than regular price");
    }
    
    if (selectedCategory === 'property') {
      if (!listingForm.kind.trim()) {
        return setError("Property type is required");
      }
      if (!listingForm.period.trim()) {
        return setError("Availability period is required");
      }
      if (!listingForm.cancel.trim()) {
        return setError("Cancellation policy is required");
      }
    }
    
    if (selectedCategory === 'experiences' && selectedType === 'carwash') {
      if (!listingForm.carWashPackages) {
        return setError("Please select at least one car wash package");
      }
      if (!listingForm.vehicleTypes) {
        return setError("Please select which vehicle types you service");
      }
      if (!listingForm.serviceDuration) {
        return setError("Please enter the service duration");
      }
    }

    // New validations for online helper types
    if (selectedCategory === 'online') {
      if (selectedType === 'sneaker') {
        if (!listingForm.shoeTypes) {
          return setError("Please specify what types of sneakers you clean");
        }
        if (!listingForm.turnaroundTime) {
          return setError("Please enter your turnaround time");
        }
      }

      
      if (selectedType === 'animals') {
        if (!listingForm.animalTypes) {
          return setError("Please specify what types of animals you care for");
        }
        if (!listingForm.servicesOffered) {
          return setError("Please specify what services you offer");
        }
        if (!listingForm.experience) {
          return setError("Please describe your experience with animals");
        }
      }
    }
    
    if (selectedCategory === 'selling' && selectedType === 'books') {
      if (!listingForm.bookAuthor) {
        return setError("Please specify the author of the book");
      }
      if (!listingForm.bookYear) {
        return setError("Please specify the release year");
      }
      if (!listingForm.bookUsageHistory) {
        return setError("Please specify the history of usage");
      }
      if (!listingForm.numberOfUsed && listingForm.numberOfUsed !== 0) {
        return setError("Please specify the number of times used");
      }
    }
    
    if (!listingForm.near.trim()) {
      return setError(`${getNearLabel(selectedCategory, selectedType)} is required`);
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = selectedCategory === 'property' ? '/api/listing/create' :
                      selectedCategory === 'experiences' ? '/api/service/create' :
                      selectedCategory === 'online' ? '/api/helper/create' :
                      selectedCategory === 'selling' ? '/api/sell' :
                      '/api/event/create';

      const requestBody = {
        ...listingForm,
        userRef: currentUser._id,
        type: selectedType,
        category: selectedCategory === 'selling' ? selectedType : selectedCategory,
        listingType: selectedCategory,
        kind: listingForm.kind || "apartment",
        cancel: listingForm.cancel || "Flexible - Free cancellation 48 hours before check-in",
        period: listingForm.period || "Immediate",
        near: listingForm.near || "",
        rules: listingForm.rules || "",
        imageUrls: listingForm.imageUrls || [],
        videoUrl: listingForm.videoUrl || "",
        name: listingForm.name || "",
        description: listingForm.description || "",
        address: listingForm.address || "",
        contact: listingForm.contact || "",
        host: listingForm.host || "",
        regularPrice: listingForm.regularPrice || 50,
        discountPrice: listingForm.discountPrice || 0,
        // New fields for sneaker, washingmat, animals
        shoeTypes: listingForm.shoeTypes || "",
        cleaningMethod: listingForm.cleaningMethod || "",
        turnaroundTime: listingForm.turnaroundTime || "",
        machineType: listingForm.machineType || "",
        matTypes: listingForm.matTypes || "",
        dryingMethod: listingForm.dryingMethod || "",
        animalTypes: listingForm.animalTypes || "",
        servicesOffered: listingForm.servicesOffered || "",
        experience: listingForm.experience || "",
        certifications: listingForm.certifications || "",
        bookAuthor: listingForm.bookAuthor || "",
        bookYear: listingForm.bookYear || "",
        bookUsageHistory: listingForm.bookUsageHistory || "",
        numberOfUsed: listingForm.numberOfUsed || 0,
        checkInTime: listingForm.checkInTime || '14:00',
        checkOutTime: listingForm.checkOutTime || '11:00',
        serviceList: (selectedCategory === 'experiences' || selectedCategory === 'online') ? listingForm.serviceList : [],
        performers: (selectedCategory === 'experiences' || selectedCategory === 'online') ? listingForm.performers : [],
      };

      console.log("Submitting to:", endpoint);
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        data = await res.json();
        console.log("Response from server:", data);
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        const text = await res.text();
        console.error("Raw response:", text);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      if (data.success === false) {
        let errorMessage = data.message || "Failed to create listing. Please check all required fields.";
        
        if (data.errors) {
          const errorList = Object.values(data.errors).map(err => err.message).join(', ');
          errorMessage = `Validation errors: ${errorList}`;
        }
        
        setError(errorMessage);
      } else {
        setNewListingId(data._id || data.listing?._id);
        if (selectedCategory === 'selling') {
          navigate('/listing-success', { state: { listingId: data._id || data.listing?._id, type: selectedCategory } });
        } else {
          setShowPromotionPopup(true);
        }
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAmenitiesByCategory = () => {
    switch (selectedCategory) {
      case 'property':
        return [
          { id: "wifi", label: "WiFi", emoji: "📶", checked: listingForm.wifi },
          { id: "kitchen", label: "Kitchen", emoji: "🍳", checked: listingForm.kitchen },
          { id: "parking", label: "Parking", emoji: "🅿️", checked: listingForm.parking },
          { id: "pool", label: "Pool", emoji: "🏊‍♂️", checked: listingForm.pool },
          { id: "tv", label: "TV", emoji: "📺", checked: listingForm.tv },
          { id: "security", label: "Security", emoji: "🔒", checked: listingForm.security },
          { id: "furnished", label: "Furnished", emoji: "🪑", checked: listingForm.furnished },
          { id: "pets", label: "Pets Allowed", emoji: "🐾", checked: listingForm.pets },
          { id: "fridge", label: "Refrigerator", emoji: "❄️", checked: listingForm.fridge },
          { id: "breakfast", label: "Breakfast", emoji: "🍳", checked: listingForm.breakfast },
          { id: "hot", label: "Hot Shower", emoji: "🚿", checked: listingForm.hot },
          { id: "stove", label: "Stove", emoji: "🔥", checked: listingForm.stove },
          { id: "storage", label: "Storage", emoji: "📦", checked: listingForm.storage },
          { id: "share", label: "House Share", emoji: "👥", checked: listingForm.share },
          { id: "party", label: "No Parties", emoji: "🔇", checked: listingForm.party },
        ];
      case 'experiences':
        if (selectedType === 'carwash') {
          return [
            { id: "mobileService", label: "Mobile Service", emoji: "🚗💨", checked: listingForm.mobileService },
            { id: "ecoFriendly", label: "Eco-Friendly", emoji: "🌱", checked: listingForm.ecoFriendly },
            { id: "security", label: "Background Check", emoji: "✅", checked: listingForm.security },
            { id: "pets", label: "Pet Friendly", emoji: "🐾", checked: listingForm.pets },
            { id: "parking", label: "On-Site Parking", emoji: "🅿️", checked: listingForm.parking },
            { id: "wifi", label: "Free WiFi", emoji: "📶", checked: listingForm.wifi },
          ];
        }
        return [
          { id: "security", label: "Background Check", emoji: "✅", checked: listingForm.security },
          { id: "pets", label: "Pet Friendly", emoji: "🐾", checked: listingForm.pets },
        ];
      case 'online':
        if (selectedType === 'sneaker') {
          return [
            { id: "security", label: "Background Check", emoji: "✅", checked: listingForm.security },
            { id: "delivery", label: "Pickup & Delivery", emoji: "🚚", checked: listingForm.delivery },
            { id: "ecoFriendly", label: "Eco-Friendly Products", emoji: "🌱", checked: listingForm.ecoFriendly },
          ];
        }

        if (selectedType === 'animals') {
          return [
            { id: "security", label: "Background Check", emoji: "✅", checked: listingForm.security },
            { id: "pets", label: "Pet Friendly", emoji: "🐾", checked: listingForm.pets },
            { id: "delivery", label: "Pickup & Delivery", emoji: "🚚", checked: listingForm.delivery },
            { id: "parking", label: "On-Site Parking", emoji: "🅿️", checked: listingForm.parking },
          ];
        }
        return [
          { id: "security", label: "Background Check", emoji: "✅", checked: listingForm.security },
          { id: "pets", label: "Pet Friendly", emoji: "🐾", checked: listingForm.pets },
        ];
      case 'events':
        return [
          { id: "parking", label: "Parking", emoji: "🅿️", checked: listingForm.parking },
          { id: "foodAvailable", label: "Food Available", emoji: "🍔", checked: listingForm.foodAvailable },
          { id: "familyFriendly", label: "Family Friendly", emoji: "👨‍👩‍👧‍👦", checked: listingForm.familyFriendly },
        ];
      default:
        return [];
    }
  };

  const getPricingLabel = () => {
    if (selectedCategory === 'property') {
      if (['over', 'sale', 'resort'].includes(selectedType)) return "Regular Price (per night)";
      if (['rent', 'rent-long', 'rent-short'].includes(selectedType)) return "Regular Price (per month)";
      if (selectedType === 'office') return "Regular Price (per hour)";
      return "Regular Price";
    }
    if (selectedCategory === 'experiences' || selectedCategory === 'online') {
      if (['tutor', 'cleaner', 'domestic', 'maid', 'beauty', 'barber', 'chef'].includes(selectedType)) {
        return "Regular Price (per hour)";
      }
      return "Regular Price";
    }
    if (selectedCategory === 'selling') {
      return "Item Price";
    }
    if (selectedCategory === 'events') {
      return "Ticket / Entry Price (R0 for Free)";
    }
    return "Regular Price";
  };

  const getTypesByCategory = () => {
    switch (selectedCategory) {
      case 'property':
        return [
          { id: "rent", label: "Room/Home to Rent", emoji: "🏠", description: "Monthly rental" },
          { id: "over", label: "Guest House", emoji: "🛌", description: "Nightly stays" },
          { id: "land", label: "Self Catering", emoji: "🍳", description: "Self catering rentals" },
          { id: "sale", label: "Hotel", emoji: "🏨", description: "Hotel rentals" },
          { id: "resort", label: "Resort", emoji: "🏖️", description: "Resort stays" },
        ];
      case 'experiences':
        return [
          { id: "handyman", label: "Handyman", emoji: "🛠️", description: "General home repairs" },
          { id: "maintenance", label: "Maintenance", emoji: "🔧", description: "Repairs & fixes" },
          { id: "moving", label: "Moving", emoji: "🚚", description: "Relocation services" },
          { id: "landscaping", label: "Landscaping", emoji: "🌿", description: "Garden & yard work" },
          { id: "catering", label: "Catering", emoji: "🍽️", description: "Food & catering" },
          { id: "daycare", label: "Day Care", emoji: "👶", description: "Child care services" },
          { id: "schoolTransport", label: "Transport", emoji: "🚌", description: "School transport" },
          { id: "carwash", label: "Car Wash", emoji: "🚗💦", description: "Professional car cleaning" },
          { id: "other", label: "Other", emoji: "✨", description: "Other services" },
        ];
      case 'online':
        return [
          { id: "domestic", label: "Domestic Helper", emoji: "🧹", description: "Cleaning, laundry, chores" },
          { id: "tutor", label: "Private Tutor", emoji: "📚", description: "Academic tutoring" },
          { id: "chef", label: "Private Chef", emoji: "👨‍🍳", description: "Meal preparation" },
          { id: "beauty", label: "Beauty Specialist", emoji: "💅", description: "Hair, nails, makeup" },
          { id: "tattoo", label: "Tattoo Artist", emoji: "🖌️", description: "Tattoo design" },
          { id: "barber", label: "Barber", emoji: "✂️", description: "Haircuts, grooming" },
          { id: "photography", label: "Photographer", emoji: "📷", description: "Photo sessions" },
          { id: "baker", label: "Baker", emoji: "🍰", description: "Custom baked goods" },
          { id: "sneaker", label: "Sneaker Cleaner", emoji: "👟", description: "Sneaker cleaning & restoration" },
          { id: "animals", label: "Animal Care", emoji: "🐕", description: "Pet sitting, walking, grooming" },
        ];
      case 'events':
        return [
          { id: "music", label: "Music", emoji: "🎵", description: "Concerts, festivals" },
          { id: "sports", label: "Sports", emoji: "⚽", description: "Games, tournaments" },
          { id: "art", label: "Art & Culture", emoji: "🎨", description: "Exhibitions, shows" },
          { id: "community", label: "Community", emoji: "🧑‍🤝‍🧑", description: "Meetups, gatherings" },
          { id: "food", label: "Food & Drink", emoji: "🍔", description: "Food festivals, tastings" },
                  { id: "hiking", label: "Hiking", emoji: "🥾", description: "Outdoor hiking events" },
        ];
      case 'selling':
        return [
          { id: "furniture", label: "Furniture", emoji: "🛋️", description: "Sofas, beds, tables" },
          { id: "electronics", label: "Electronics", emoji: "💻", description: "Phones, computers, TVs" },
          { id: "clothes", label: "Clothes", emoji: "👕", description: "Apparel, shoes, accessories" },
          { id: "universities", label: "Universities", emoji: "🎓", description: "University related items" },
          { id: "books", label: "Books", emoji: "📚", description: "Textbooks, novels" },
        ];
      default:
        return [];
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ userId: currentUser._id, amount: 35 }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentRequired(false);
        setPostLimitReached(false);
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (err) {
      setError("Payment error. Please try again later.");
      console.error("Payment error:", err);
    }
  };

  const handlePromoteListing = async () => {
    if (selectedPaymentMethod === 'card' && !cardDetailsValid()) {
      setError("Please enter valid card details");
      return;
    }

    try {
      const res = await fetch("/api/promotion/payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser._id,
          listingId: newListingId,
          package: promotionPackage,
          paymentMethod: selectedPaymentMethod,
          cardDetails: selectedPaymentMethod === 'card' ? cardDetails : null,
          amount: promotionPackage === 'standard' ? 40 : 100
        }),
      });
      const data = await res.json();

      if (data.success) {
        navigate(`/listing/${newListingId}`);
      } else {
        setError(data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError("Payment error. Please try again later.");
      console.error("Payment error:", err);
    }
  };

  const cardDetailsValid = () => {
    const cardNumberValid = /^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''));
    const expiryValid = /^\d{2}\/\d{2}$/.test(cardDetails.expiry);
    const cvvValid = /^\d{3,4}$/.test(cardDetails.cvv);
    const nameValid = cardDetails.name.trim().length > 0;

    return cardNumberValid && expiryValid && cvvValid && nameValid;
  };

  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
  };



  if (loading && !showPromotionPopup) {
    return (
      <main className="min-h-screen bg-gray-50/50 pb-20 overflow-x-hidden relative">
      {/* Cinematic Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }


  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-50">
      {/* Cinematic Animated Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse [animation-delay:3s]" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:1.5s]" />
      </div>

      {/* Airbnb-style Header */}
      <header>
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#DDDDDD]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-20">
              <button 
                onClick={() => navigate(-1)}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                }`}
              >
                <ArrowLeftIcon className={`w-6 h-6 ${
                  isScrolled ? 'text-gray-900' : 'text-black'
                }`} />
              </button>
              
              <div className="flex items-center gap-2">
                <span className={`font-bold text-2xl tracking-tighter ${
                  isScrolled ? 'text-[#FF5A5F]' : 'text-[#FF5A5F]'
                }`}>
                  loopOut
                </span>
                <span className={`${isScrolled ? 'text-gray-400' : 'text-white/60'}`}>|</span>
                <span className={`font-medium ${
                  isScrolled ? 'text-gray-900' : 'text-black'
                }`}>
                  Create listing
                </span>
              </div>
              
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-12 md:pb-20">
        {/* Step Progress */}
        <div className="mt-10">
          <StepProgress currentStep={currentStep} category={selectedCategory} type={selectedType} />
        </div>

        {/* Main Form Container */}
        <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <form onSubmit={handleSubmit} ref={stepRef} className="space-y-8">
            
            {/* Step 1: Select Category */}
            {currentStep === 1 && (
              <SectionCard title="What would you like to list?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CategoryCard
                    id="property"
                    icon={HomeIcon}
                    label="Property"
                    description="Rent out your property, room, or entire home"
                    selected={selectedCategory === 'property'}
                    onSelect={setSelectedCategory}
                  />
                  <CategoryCard
                    id="experiences"
                    icon={BriefcaseIcon}
                    label="Services"
                    description="Offer professional services to the community"
                    selected={selectedCategory === 'experiences'}
                    onSelect={setSelectedCategory}
                  />
                  <CategoryCard
                    id="online"
                    icon={UserIcon}
                    label="Helper"
                    description="Register as a personal helper or specialist"
                    selected={selectedCategory === 'online'}
                    onSelect={setSelectedCategory}
                  />
                  <CategoryCard
                    id="events"
                    icon={CalendarIcon}
                    label="Events"
                    description="Create and promote local happenings"
                    selected={selectedCategory === 'events'}
                    onSelect={setSelectedCategory}
                  />
                  <CategoryCard
                    id="needs"
                    icon={QuestionMarkCircleIcon}
                    label="Post a Need"
                    description="Looking for something? Ask the community"
                    selected={selectedCategory === 'needs'}
                    onSelect={() => navigate('/create-request')}
                  />
                  <CategoryCard
                    id="selling"
                    icon={TagIcon}
                    label="Selling"
                    description="Sell furniture, electronics, clothes, etc."
                    selected={selectedCategory === 'selling'}
                    onSelect={setSelectedCategory}
                  />
                </div>
              </SectionCard>
            )}

            {/* Step 2: Select Type */}
            {currentStep === 2 && (
              <SectionCard title={`What type of ${selectedCategory === 'property' ? 'property' : 
                selectedCategory === 'experiences' ? 'service' :
                selectedCategory === 'online' ? 'helper' : 
                selectedCategory === 'selling' ? 'item' : 'event'}?`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTypesByCategory().map((type) => (
                    <TypeCard
                      key={type.id}
                      {...type}
                      selected={selectedType === type.id}
                      onSelect={setSelectedType}
                    />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Step 3: Form Details */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <SectionCard title={`Tell us about your ${
                  selectedCategory === 'property' ? 'place' : 
                  selectedCategory === 'experiences' ? 'service' :
                  selectedCategory === 'online' ? 'helper' : 
                  selectedCategory === 'selling' ? 'item' : 'event'}`}>
                  <div className="space-y-6">
                    <FormInput
                      label="Create a title"
                      icon={selectedCategory === 'property' ? HomeIcon : 
                            selectedCategory === 'events' ? CalendarIcon :
                            selectedCategory === 'selling' ? TagIcon : UserIcon}
                      id="name"
                      value={listingForm.name}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'property' ? "Cozy mountain cabin with amazing views" :
                        selectedCategory === 'experiences' && selectedType === 'carwash' ? "Premium Car Wash & Detailing Service" :
                        selectedCategory === 'experiences' ? "Professional Handyman Service" :
                        selectedCategory === 'online' && selectedType === 'sneaker' ? "Expert Sneaker Cleaning & Restoration" :
                        selectedCategory === 'online' && selectedType === 'animals' ? "Loving Pet Care & Walking Services" :
                        selectedCategory === 'online' ? "John's Tutoring Services" :
                        selectedCategory === 'selling' ? "Vintage Leather Sofa in Excellent Condition" :
                        "Summer Music Festival"
                      }
                      required
                    />
                    
                    <FormInput
                      label="Describe your place"
                      type="textarea"
                      id="description"
                      value={listingForm.description}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'property' ? "Describe what makes your place special..." :
                        selectedCategory === 'experiences' && selectedType === 'carwash' ? "Professional car wash and detailing services..." :
                        selectedCategory === 'experiences' ? "Describe your service in detail..." :
                        selectedCategory === 'online' && selectedType === 'sneaker' ? "Expert sneaker cleaning using premium products. I restore and clean all types of sneakers..." :
                        selectedCategory === 'online' && selectedType === 'animals' ? "Loving and experienced animal care provider. I offer pet sitting, walking, and grooming..." :
                        selectedCategory === 'online' ? "Describe your skills and experience..." :
                        selectedCategory === 'selling' ? "Describe the item's condition, features, history, or why you are selling it..." :
                        "Describe the event, activities, and what attendees can expect..."
                      }
                      required
                      rows={5}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Address"
                        icon={MapPinIcon}
                        id="address"
                        value={listingForm.address}
                        onChange={handleFormChange}
                        placeholder="Street address"
                        required
                      />
                      <FormInput
                        label="Contact Number"
                        icon={PhoneIcon}
                        id="contact"
                        value={listingForm.contact}
                        onChange={handleFormChange}
                        placeholder="Phone number"
                        required
                      />
                      <AnimatePresence>
                        {foundHost && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="col-span-full"
                          >
                            <div className="bg-rose-50/50 border border-rose-100 rounded-[2rem] p-6 flex flex-col gap-4 mt-2">
                               <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img 
                                      src={foundHost.avatar} 
                                      alt={foundHost.username}
                                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                                  </div>
                                  <div className="flex-1">
                                     <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Mutual Connection Identified</p>
                                     <h4 className="text-lg font-black text-gray-900 tracking-tight">{foundHost.username}</h4>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setListingForm(prev => ({ ...prev, host: foundHost.username }))}
                                    className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm hover:shadow-md transition-all active:scale-95"
                                  >
                                    Use as Host
                                  </button>
                               </div>

                               {mutualConnections.length > 0 && (
                                 <div className="pt-4 border-t border-rose-100/50">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Linked via your contacts</p>
                                    <div className="flex -space-x-2">
                                       {mutualConnections.slice(0, 5).map((m, i) => (
                                         <img 
                                           key={m._id || i}
                                           src={m.avatar}
                                           title={m.username}
                                           className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                         />
                                       ))}
                                       {mutualConnections.length > 5 && (
                                         <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                            +{mutualConnections.length - 5}
                                         </div>
                                       )}
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 mt-2">
                                       You and {foundHost.username} share {mutualConnections.length} mutual connections.
                                    </p>
                                 </div>
                               )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Host/Organizer Name Field */}
                    <FormInput
                      label={selectedCategory === 'property' ? "Host name" : 
                             selectedCategory === 'events' ? "Organizer name" : 
                             "Provider name"}
                      icon={UserIcon}
                      id="host"
                      value={listingForm.host}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'property' ? "Your name or property manager" :
                        selectedCategory === 'events' ? "Event organizer or venue name" :
                        selectedCategory === 'experiences' ? "Business or service provider name" :
                        "Your name or business name"
                      }
                      required
                    />

                    <FormInput
                      label={getNearLabel(selectedCategory, selectedType).charAt(0).toUpperCase() + getNearLabel(selectedCategory, selectedType).slice(1)}
                      type="textarea"
                      id="near"
                      value={listingForm.near}
                      onChange={handleFormChange}
                      placeholder={getDefaultNearPlaceholder(selectedCategory, selectedType)}
                      required
                      rows={3}
                    />

                    {selectedCategory === 'property' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                        <FormInput
                          label="Property Type"
                          id="kind"
                          value={listingForm.kind}
                          onChange={handleFormChange}
                          placeholder="e.g., Apartment, House, Villa"
                          required
                        />
                        <FormInput
                          label="Available From"
                          id="period"
                          value={listingForm.period}
                          onChange={handleFormChange}
                          placeholder="e.g., Immediate, Next month"
                          required
                        />
                        <div className="md:col-span-2">
                          <FormInput
                            label="Cancellation Policy"
                            id="cancel"
                            value={listingForm.cancel}
                            onChange={handleFormChange}
                            placeholder="e.g., Flexible - Free cancellation 48 hours before check-in"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Sneaker Cleaner Specific Fields */}
                    {selectedCategory === 'online' && selectedType === 'sneaker' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Sneaker Cleaning Details</h3>
                        
                        <FormInput
                          label="Types of Sneakers You Clean"
                          id="shoeTypes"
                          value={listingForm.shoeTypes}
                          onChange={handleFormChange}
                          placeholder="e.g., Athletic, Casual, High-end, All types"
                          required
                          helpText="Specify what types of sneakers you specialize in"
                        />

                        <FormInput
                          label="Cleaning Method"
                          id="cleaningMethod"
                          value={listingForm.cleaningMethod}
                          onChange={handleFormChange}
                          placeholder="e.g., Hand wash, Machine wash, Steam cleaning"
                          helpText="Describe your cleaning process"
                        />

                        <FormInput
                          label="Turnaround Time"
                          id="turnaroundTime"
                          value={listingForm.turnaroundTime}
                          onChange={handleFormChange}
                          placeholder="e.g., 24-48 hours, 3-5 days"
                          required
                        />
                      </div>
                    )}

                    

                    {/* Animal Care Specific Fields */}
                    {selectedCategory === 'online' && selectedType === 'animals' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Animal Care Details</h3>
                        
                        <FormInput
                          label="Types of Animals You Care For"
                          id="animalTypes"
                          value={listingForm.animalTypes}
                          onChange={handleFormChange}
                          placeholder="e.g., Dogs, Cats, Birds, Small pets, All types"
                          required
                        />

                        <FormInput
                          label="Services Offered"
                          id="servicesOffered"
                          value={listingForm.servicesOffered}
                          onChange={handleFormChange}
                          placeholder="e.g., Pet sitting, Dog walking, Grooming, Training"
                          required
                        />

                        <FormInput
                          label="Experience with Animals"
                          id="experience"
                          value={listingForm.experience}
                          onChange={handleFormChange}
                          placeholder="Describe your experience with animals"
                          required
                          rows={3}
                        />

                        <FormInput
                          label="Certifications"
                          id="certifications"
                          value={listingForm.certifications}
                          onChange={handleFormChange}
                          placeholder="e.g., Pet first aid, Animal behavior training, etc."
                          helpText="List any relevant certifications or training"
                        />
                      </div>
                    )}

                    {/* Book Specific Fields */}
                    {selectedCategory === 'selling' && selectedType === 'books' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Book Details</h3>
                        
                        <FormInput
                          label="Author"
                          id="bookAuthor"
                          value={listingForm.bookAuthor}
                          onChange={handleFormChange}
                          placeholder="e.g., J.K. Rowling"
                          required
                        />

                        <FormInput
                          label="Year of Release"
                          id="bookYear"
                          value={listingForm.bookYear}
                          onChange={handleFormChange}
                          placeholder="e.g., 1997"
                          required
                        />

                        <FormInput
                          label="History of Usage"
                          type="textarea"
                          id="bookUsageHistory"
                          value={listingForm.bookUsageHistory}
                          onChange={handleFormChange}
                          placeholder="e.g., Read once, kept on a shelf for 2 years, no folded pages."
                          required
                          rows={3}
                        />

                        <FormInput
                          label="Number of Times Used"
                          type="number"
                          id="numberOfUsed"
                          value={listingForm.numberOfUsed}
                          onChange={handleFormChange}
                          placeholder="e.g., 1"
                          required
                        />
                      </div>
                    )}

                    {selectedCategory === 'experiences' && selectedType === 'carwash' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200">
                        <div>
                          <label className="block text-base font-medium text-gray-900 mb-3">
                            Car Wash Packages <span className="text-[#FF5A5F]">*</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { id: "basic", label: "Basic Wash", desc: "Exterior wash, windows, tires" },
                              { id: "premium", label: "Premium Wash", desc: "Exterior + interior vacuuming" },
                              { id: "detailing", label: "Full Detailing", desc: "Complete interior/exterior" },
                              { id: "ceramic", label: "Ceramic Coating", desc: "Ceramic coating protection" },
                            ].map((pkg) => (
                              <label key={pkg.id} className={`
                                p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                                ${listingForm.carWashPackages?.includes(pkg.id) 
                                  ? 'border-black bg-gray-50' 
                                  : 'border-gray-200 hover:border-gray-400'}
                              `}>
                                <input
                                  type="checkbox"
                                  value={pkg.id}
                                  checked={listingForm.carWashPackages?.includes(pkg.id)}
                                  onChange={(e) => {
                                    const current = listingForm.carWashPackages ? listingForm.carWashPackages.split(',') : [];
                                    if (e.target.checked) {
                                      current.push(pkg.id);
                                    } else {
                                      const index = current.indexOf(pkg.id);
                                      if (index > -1) current.splice(index, 1);
                                    }
                                    setListingForm({
                                      ...listingForm,
                                      carWashPackages: current.join(',')
                                    });
                                  }}
                                  className="hidden"
                                />
                                <div className="flex items-start gap-3">
                                  <div className={`
                                    w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                    ${listingForm.carWashPackages?.includes(pkg.id) 
                                      ? 'bg-black border-black' 
                                      : 'bg-white border-gray-300'}
                                  `}>
                                    {listingForm.carWashPackages?.includes(pkg.id) && 
                                      <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{pkg.label}</p>
                                    <p className="text-sm text-gray-500">{pkg.desc}</p>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Vehicle Types Serviced"
                            id="vehicleTypes"
                            value={listingForm.vehicleTypes}
                            onChange={handleFormChange}
                            placeholder="e.g., Sedan, SUV, Truck"
                            required
                          />
                          <FormInput
                            label="Service Duration"
                            id="serviceDuration"
                            value={listingForm.serviceDuration}
                            onChange={handleFormChange}
                            placeholder="e.g., 30-45 mins"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {selectedCategory === 'events' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                        <FormInput
                          label="Event Date"
                          type="date"
                          id="date"
                          value={listingForm.date}
                          onChange={handleFormChange}
                          required
                        />
                        <FormInput
                          label="Event Time"
                          type="time"
                          id="time"
                          value={listingForm.time}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    )}

                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 4: Schedule — Check-in/out for stays, operating hours for services */}
            {currentStep === 4 && (
              <>
              {/* Guest house / Hotel / Resort → Check-in & Check-out */}
              {selectedCategory === 'property' && (selectedType === 'over' || selectedType === 'sale' || selectedType === 'resort' || selectedType === 'land') && (
                <SectionCard title="Check-in & Check-out">
                  <p className="text-gray-600 mb-10 leading-relaxed font-medium">Set your standard check-in and check-out times so guests know when they can arrive and depart.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="group/form">
                      <label className="block text-[10px] font-black text-gray-400 group-focus-within/form:text-rose-500 uppercase tracking-[0.25em] mb-4 ml-2 transition-colors">Check-in Time</label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">🛬</div>
                        <input
                          type="time"
                          value={listingForm.checkInTime}
                          onChange={(e) => setListingForm({ ...listingForm, checkInTime: e.target.value })}
                          className="w-full pl-16 pr-8 py-6 bg-white/40 backdrop-blur-md border-4 border-gray-50 rounded-[2.5rem] focus:ring-[20px] focus:ring-rose-500/5 focus:border-gray-900 focus:bg-white transition-all duration-700 hover:border-gray-100 font-black text-lg shadow-sm"
                        />
                      </div>
                      <p className="mt-3 text-xs font-bold text-gray-400 ml-4 italic opacity-80">Earliest time guests may check in</p>
                    </div>
                    <div className="group/form">
                      <label className="block text-[10px] font-black text-gray-400 group-focus-within/form:text-rose-500 uppercase tracking-[0.25em] mb-4 ml-2 transition-colors">Check-out Time</label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">🛫</div>
                        <input
                          type="time"
                          value={listingForm.checkOutTime}
                          onChange={(e) => setListingForm({ ...listingForm, checkOutTime: e.target.value })}
                          className="w-full pl-16 pr-8 py-6 bg-white/40 backdrop-blur-md border-4 border-gray-50 rounded-[2.5rem] focus:ring-[20px] focus:ring-rose-500/5 focus:border-gray-900 focus:bg-white transition-all duration-700 hover:border-gray-100 font-black text-lg shadow-sm"
                        />
                      </div>
                      <p className="mt-3 text-xs font-bold text-gray-400 ml-4 italic opacity-80">Latest time guests must check out</p>
                    </div>
                  </div>
                </SectionCard>
              )}
              {/* Services / Experiences / Events → full weekly operating schedule */}
              {selectedCategory !== 'property' && (
              <SectionCard title="Operating Schedule">
                <p className="text-gray-600 mb-10 leading-relaxed font-medium">Define when you are available for bookings. This helps customers know when they can reach you or visit your location.</p>
                <div className="space-y-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <motion.div 
                      key={day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-6 rounded-[2.5rem] border-4 transition-all duration-700 ${listingForm.operatingHours[day].closed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-50 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 min-w-[140px]">
                          <div className={`w-4 h-4 rounded-full ${listingForm.operatingHours[day].closed ? 'bg-gray-300' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse'}`} />
                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{day}</h3>
                        </div>
                        
                        {!listingForm.operatingHours[day].closed ? (
                          <div className="flex items-center gap-4 flex-1 justify-center bg-gray-50/50 p-2 rounded-[1.5rem]">
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Open</span>
                              <input 
                                type="time" 
                                value={listingForm.operatingHours[day].open}
                                onChange={(e) => setListingForm({
                                  ...listingForm,
                                  operatingHours: {
                                    ...listingForm.operatingHours,
                                    [day]: { ...listingForm.operatingHours[day], open: e.target.value }
                                  }
                                })}
                                className="px-5 py-3 bg-white rounded-xl border-2 border-transparent focus:border-rose-500 outline-none font-black text-sm transition-all shadow-inner"
                              />
                            </div>
                            <div className="h-8 w-[2px] bg-gray-200 mt-4" />
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Close</span>
                              <input 
                                type="time" 
                                value={listingForm.operatingHours[day].close}
                                onChange={(e) => setListingForm({
                                  ...listingForm,
                                  operatingHours: {
                                    ...listingForm.operatingHours,
                                    [day]: { ...listingForm.operatingHours[day], close: e.target.value }
                                  }
                                })}
                                className="px-5 py-3 bg-white rounded-xl border-2 border-transparent focus:border-rose-500 outline-none font-black text-sm transition-all shadow-inner"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-center py-6 bg-gray-100/50 rounded-[1.5rem] border-2 border-dashed border-gray-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Unavailable for Business</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setListingForm({
                            ...listingForm,
                            operatingHours: {
                              ...listingForm.operatingHours,
                              [day]: { ...listingForm.operatingHours[day], closed: !listingForm.operatingHours[day].closed }
                            }
                          })}
                          className={`min-w-[120px] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${listingForm.operatingHours[day].closed ? 'bg-rose-500 text-white shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white shadow-sm'}`}
                        >
                          {listingForm.operatingHours[day].closed ? 'Activate' : 'Deactivate'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                </SectionCard>
              )}
              </>
            )}

            {/* Step 5: Amenities */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <SectionCard title="What amenities do you offer?">
                  <p className="text-gray-600 mb-6">Select all that apply</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getAmenitiesByCategory().map((amenity) => (
                      <AmenityCard
                        key={amenity.id}
                        {...amenity}
                        onChange={handleFormChange}
                      />
                    ))}
                  </div>
                </SectionCard>

                {selectedCategory === 'property' && (
                  <SectionCard title="Room details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-medium text-gray-900 mb-3">
                          {selectedType === "land" || selectedType === "office" ? "Square Meters" : "Bedrooms"}
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setListingForm({...listingForm, bedrooms: Math.max(0, listingForm.bedrooms - 1)})}
                            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                          >
                            <MinusIcon className="w-5 h-5" />
                          </button>
                          <span className="text-xl font-semibold w-8 text-center">{listingForm.bedrooms}</span>
                          <button
                            type="button"
                            onClick={() => setListingForm({...listingForm, bedrooms: listingForm.bedrooms + 1})}
                            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {selectedType !== "land" && selectedType !== "office" && (
                        <div>
                          <label className="block text-base font-medium text-gray-900 mb-3">Bathrooms</label>
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => setListingForm({...listingForm, bathrooms: Math.max(1, listingForm.bathrooms - 1)})}
                              className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                            >
                              <MinusIcon className="w-5 h-5" />
                            </button>
                            <span className="text-xl font-semibold w-8 text-center">{listingForm.bathrooms}</span>
                            <button
                              type="button"
                              onClick={() => setListingForm({...listingForm, bathrooms: listingForm.bathrooms + 1})}
                              className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}
              </div>
            )}

            {/* Step 6: Services & Pricing */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <SectionCard title="Services & Pricing">
                  <p className="text-gray-600 mb-6">List the specific services you offer and their prices.</p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Service Name"
                        placeholder="e.g. Standard Haircut"
                        id="newServiceName"
                        value={listingForm.newServiceName || ""}
                        onChange={(e) => setListingForm({...listingForm, newServiceName: e.target.value})}
                      />
                      <FormInput
                        label="Price (R)"
                        type="number"
                        placeholder="0"
                        id="newServicePrice"
                        value={listingForm.newServicePrice || ""}
                        onChange={(e) => setListingForm({...listingForm, newServicePrice: e.target.value})}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (listingForm.newServiceName && listingForm.newServicePrice) {
                          setListingForm({
                            ...listingForm,
                            serviceList: [...listingForm.serviceList, { name: listingForm.newServiceName, price: listingForm.newServicePrice }],
                            newServiceName: "",
                            newServicePrice: ""
                          });
                        }
                      }}
                      className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-rose-500 transition-all active:scale-95"
                    >
                      Add Service
                    </button>

                    {listingForm.serviceList.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">Your Service List</h3>
                        <div className="space-y-3">
                          {listingForm.serviceList.map((service, index) => (
                            <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-gray-100 transition-all">
                              <div>
                                <p className="font-bold text-gray-900">{service.name}</p>
                                <p className="text-rose-500 font-black">R{service.price}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setListingForm({
                                  ...listingForm,
                                  serviceList: listingForm.serviceList.filter((_, i) => i !== index)
                                })}
                                className="p-3 text-gray-400 hover:text-rose-500 transition-colors"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 7: Team Members / Performers */}
            {currentStep === 7 && (
              <div className="space-y-8">
                <SectionCard title="Our Team">
                  <p className="text-gray-600 mb-6">Introduce the people who will be performing the services.</p>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Performer Name"
                        placeholder="e.g. John Doe"
                        id="newPerformerName"
                        value={listingForm.newPerformerName || ""}
                        onChange={(e) => setListingForm({...listingForm, newPerformerName: e.target.value})}
                      />
                      <FormInput
                        label="Experience / Role"
                        placeholder="e.g. Master Stylist (5 years)"
                        id="newPerformerExp"
                        value={listingForm.newPerformerExp || ""}
                        onChange={(e) => setListingForm({...listingForm, newPerformerExp: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-6 p-10 bg-gray-50/50 border-4 border-dashed border-gray-100 rounded-[3rem] transition-all hover:border-gray-200">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-inner flex items-center justify-center overflow-hidden border-2 border-gray-50 flex-shrink-0 relative group">
                          {performerUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                              <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Uploading</span>
                            </div>
                          ) : listingForm.newPerformerImage ? (
                            <img src={listingForm.newPerformerImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <CameraIcon className="w-10 h-10 text-gray-200" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4 text-center md:text-left">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.1em]">Performer Photo</h4>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">Add a face to the name. Choose a clear, professional photo from your device.</p>
                          
                          <label className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] text-gray-900 cursor-pointer hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95 shadow-sm">
                            <PlusIcon className="w-4 h-4" />
                            <span>Select Photo</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handlePerformerImageChange}
                              disabled={performerUploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={performerUploading}
                      onClick={() => {
                        if (listingForm.newPerformerName && listingForm.newPerformerExp) {
                          setListingForm({
                            ...listingForm,
                            performers: [...listingForm.performers, { 
                              name: listingForm.newPerformerName, 
                              experience: listingForm.newPerformerExp,
                              image: listingForm.newPerformerImage || "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }],
                            newPerformerName: "",
                            newPerformerExp: "",
                            newPerformerImage: ""
                          });
                        }
                      }}
                      className="px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {performerUploading ? "Please Wait..." : "Add Team Member"}
                    </button>

                    {listingForm.performers.length > 0 && (
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {listingForm.performers.map((performer, index) => (
                          <div key={index} className="relative p-6 bg-white border-2 border-gray-100 rounded-[2.5rem] flex items-center gap-6 group hover:border-gray-900 transition-all">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-50">
                              <img src={performer.image} alt={performer.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-gray-900">{performer.name}</p>
                              <p className="text-sm font-bold text-gray-400">{performer.experience}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setListingForm({
                                ...listingForm,
                                performers: listingForm.performers.filter((_, i) => i !== index)
                              })}
                              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 8: Images & Media */}
            {currentStep === 8 && (
              <div className="space-y-8">
                <SectionCard title="Add some photos of your place">
                  <p className="text-gray-600 mb-6">You'll need 1 photo to get started. You can add more later.</p>
                  
                  <MediaUploadArea
                    type="image"
                    onChange={handleFileChange}
                    onSubmit={handleImageSubmit}
                    filesCount={files.length}
                    label="Upload from your device"
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                  />
                  
                  {imageUploadError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{imageUploadError}</p>
                    </div>
                  )}

                  {listingForm.imageUrls.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-900 mb-4">Uploaded photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {listingForm.imageUrls.map((url, index) => (
                          <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="w-4 h-4 text-gray-900" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Add a video (optional)</h3>
                    <p className="text-gray-600 text-sm mb-4">Show guests what your place looks like</p>
                    <MediaUploadArea
                      type="video"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      onSubmit={handleVideoUpload}
                      filesCount={videoFile ? 1 : 0}
                      maxFiles={1}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                    />
                    {videoUploadError && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{videoUploadError}</p>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Pricing">
                  <p className="text-gray-600 mb-10 leading-relaxed font-medium">Set the price for your listing so customers or guests know what to expect.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormInput
                      label={getPricingLabel()}
                      type="number"
                      id="regularPrice"
                      value={listingForm.regularPrice}
                      onChange={handleFormChange}
                      placeholder="Enter price"
                      required
                    />
                    <div className="space-y-4">
                      <label className="flex items-center gap-4 cursor-pointer p-5 border-4 border-gray-50 rounded-[2rem] hover:border-gray-100 transition-all">
                        <input
                          type="checkbox"
                          id="offer"
                          checked={listingForm.offer}
                          onChange={handleFormChange}
                          className="w-5 h-5 accent-rose-500 rounded"
                        />
                        <span className="font-black text-gray-900 text-sm">Offer a discounted / adjusted price</span>
                      </label>
                      {listingForm.offer && (
                        <FormInput
                          label="Discounted Price"
                          type="number"
                          id="discountPrice"
                          value={listingForm.discountPrice}
                          onChange={handleFormChange}
                          placeholder="Discounted price"
                        />
                      )}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 9: Review & Submit */}
            {currentStep === 9 && (
              <div className="space-y-8">
                <SectionCard title="Review your listing">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedCategory}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedType}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Title</span>
                          <span className="font-medium text-gray-900 text-right max-w-xs">{listingForm.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Host/Organizer</span>
                          <span className="font-medium text-gray-900 text-right max-w-xs">{listingForm.host}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium text-gray-900 text-right max-w-xs">{listingForm.address}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Price</span>
                          <span className="font-medium text-gray-900">R{listingForm.regularPrice}</span>
                        </div>
                        {selectedCategory === 'property' && ['over', 'sale', 'resort', 'land'].includes(selectedType) && (
                          <>
                            <div className="flex justify-between py-2 border-t border-gray-100 mt-2">
                              <span className="text-gray-600">Check-in Time</span>
                              <span className="font-medium text-gray-900">{listingForm.checkInTime}</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Check-out Time</span>
                              <span className="font-medium text-gray-900">{listingForm.checkOutTime}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">Photos</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CameraIcon className="w-5 h-5" />
                        <span>{listingForm.imageUrls.length} photos uploaded</span>
                      </div>
                    </div>

                    {(selectedCategory === 'experiences' || selectedCategory === 'online') && (
                      <>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="font-semibold text-lg text-gray-900 mb-4">Services</h3>
                          <div className="space-y-2 text-sm">
                            {listingForm.serviceList.map((s, i) => (
                              <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                <span className="text-gray-600">{s.name}</span>
                                <span className="font-medium text-gray-900">R{s.price}</span>
                              </div>
                            ))}
                            {listingForm.serviceList.length === 0 && <p className="text-gray-500">No services added</p>}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="font-semibold text-lg text-gray-900 mb-4">Team Members</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {listingForm.performers.map((p, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                                <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <p className="font-bold text-gray-900 text-xs">{p.name}</p>
                                  <p className="text-[10px] text-gray-500">{p.experience}</p>
                                </div>
                              </div>
                            ))}
                            {listingForm.performers.length === 0 && <p className="text-gray-500 text-sm">No team members added</p>}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {getAmenitiesByCategory()
                          .filter(amenity => listingForm[amenity.id])
                          .map(amenity => (
                            <span key={amenity.id} className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                              {amenity.label}
                            </span>
                          ))}
                        {getAmenitiesByCategory().filter(amenity => listingForm[amenity.id]).length === 0 && (
                          <p className="text-gray-500 text-sm">No amenities selected</p>
                        )}
                      </div>
                    </div>

                    {selectedCategory !== 'selling' && selectedCategory !== 'events' && selectedCategory !== 'property' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4">Operating Schedule</h3>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {Object.entries(listingForm.operatingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                              <span className="text-gray-600 capitalize font-bold">{day}</span>
                              {hours.closed ? (
                                <span className="text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Closed</span>
                              ) : (
                                <span className="font-black text-gray-900">{hours.open} - {hours.close}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show specific details based on type */}
                    {selectedCategory === 'online' && selectedType === 'sneaker' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4">Sneaker Cleaning Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Shoe Types:</span>
                            <span className="font-medium text-gray-900">{listingForm.shoeTypes}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Cleaning Method:</span>
                            <span className="font-medium text-gray-900">{listingForm.cleaningMethod || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Turnaround Time:</span>
                            <span className="font-medium text-gray-900">{listingForm.turnaroundTime}</span>
                          </div>
                        </div>
                      </div>
                    )}



                    {selectedCategory === 'online' && selectedType === 'animals' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4">Animal Care Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Animal Types:</span>
                            <span className="font-medium text-gray-900">{listingForm.animalTypes}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Services Offered:</span>
                            <span className="font-medium text-gray-900">{listingForm.servicesOffered}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Experience:</span>
                            <span className="font-medium text-gray-900">{listingForm.experience}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Certifications:</span>
                            <span className="font-medium text-gray-900">{listingForm.certifications || "None listed"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex gap-4">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Important</h4>
                    <p className="text-blue-800 text-sm">
                      By submitting, you agree to our terms of service. Ensure all information is accurate.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Airbnb Style */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 pt-6 pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:border-t-0 md:pt-0 md:pb-0 md:static flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setDirection('back');
                  setFadeIn(false);
                  setTimeout(() => {
                    handlePrevStep();
                    setFadeIn(true);
                  }, 300);
                }}
                className={`
                  px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-500 text-[10px]
                  ${currentStep > 1 ? 'text-gray-900 hover:bg-gray-100' : 'invisible'}
                `}
              >
                Go Back
              </button>
              
              {currentStep < 9 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <span className="text-[10px]">Next Masterpiece</span>
                  <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-200 hover:bg-gray-900 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 group"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="text-[10px]">Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                      <span className="text-[10px]">Finalize Listing</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? <button className="underline font-medium text-gray-900">Get help</button>
          </p>
        </div>
      </main>

      {/* Upload Progress Modal */}
      {uploading && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
               <motion.div 
                 className="h-full bg-rose-500"
                 initial={{ width: 0 }}
                 animate={{ width: `${uploadProgress}%` }}
               />
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner overflow-hidden">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="text-rose-500"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Deploying...</h3>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-6">Masterpiece {Math.round(uploadProgress)}% Complete</p>
              
              <div className="flex items-center justify-center gap-2">
                 {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-rose-500 rounded-full"
                    />
                 ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Promotion Popup */}
      {showPromotionPopup && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[110] p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[3.5rem] max-w-3xl w-full overflow-hidden shadow-2xl my-auto border border-gray-100"
          >
            {promotionSteps === 0 && (
              <div className="p-12 md:p-16 text-center bg-gradient-to-b from-rose-50/50 to-white">
                <div className="w-24 h-24 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-rose-200 rotate-12 transition-transform hover:rotate-0">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                   Your listing is <br /> <span className="text-rose-500">Live & Legends</span>! 🎉
                </h3>
                <p className="text-gray-500 font-medium mb-12 text-lg max-w-md mx-auto leading-relaxed">
                  Now, give it the spotlight it deserves. Boost your visibility to reach thousands more.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    🚀 Promote Now
                  </button>
                  <button
                    onClick={() => {
                      const path = selectedCategory === 'property' ? `/listing/${newListingId}` :
                                 selectedCategory === 'experiences' ? `/service/${newListingId}` :
                                 selectedCategory === 'online' ? `/helper/${newListingId}` :
                                 `/event/${newListingId}`;
                      navigate(path);
                    }}
                    className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                  >
                    Discover it
                  </button>
                </div>
              </div>
            )}

            {promotionSteps === 1 && (
              <div className="p-10 md:p-14">
                <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Choose your <span className="text-rose-500">Boost</span></h3>
                <p className="text-gray-500 font-medium mb-12">Select a masterpiece package that fits your ambition</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {[
                    { id: 'standard', price: 40, multiplier: '25x', days: '7 days', features: ['25x visibility multiplier', 'Featured category placement', 'Professional badge', '7 days of prime spot'] },
                    { id: 'premium', price: 100, multiplier: '80x', days: '14 days', features: ['80x visibility multiplier', 'Homepage spotlight feature', 'Elite gold badge', '14 days of prime spot', 'Priority expert support'] }
                  ].map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setPromotionPackage(pkg.id)}
                      className={`
                        p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all duration-500 relative overflow-hidden group
                        ${promotionPackage === pkg.id 
                          ? 'border-gray-900 bg-gray-900 text-white shadow-2xl scale-[1.03]' 
                          : 'border-gray-50 hover:border-gray-200 bg-gray-50/50 hover:bg-white'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className={`font-black text-2xl capitalize mb-1 ${promotionPackage === pkg.id ? 'text-white' : 'text-gray-900'}`}>{pkg.id}</h4>
                          <div className={`text-[10px] font-bold uppercase tracking-widest ${promotionPackage === pkg.id ? 'text-rose-400' : 'text-rose-500'}`}>{pkg.multiplier} Reach Expansion</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-3xl font-black ${promotionPackage === pkg.id ? 'text-white' : 'text-gray-900'}`}>R{pkg.price}</span>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm font-medium">
                            <CheckCircleIcon className={`w-5 h-5 ${promotionPackage === pkg.id ? 'text-rose-500' : 'text-rose-400'}`} />
                            <span className={promotionPackage === pkg.id ? 'text-gray-300' : 'text-gray-600'}>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {promotionPackage === pkg.id && (
                         <div className="absolute top-0 right-0 p-3">
                            <Sparkles className="w-8 h-8 text-rose-500 opacity-20 rotate-12" />
                         </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setPromotionSteps(0)}
                    className="px-6 py-3 text-gray-900 font-medium underline underline-offset-4"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setPromotionSteps(2)}
                    disabled={!promotionPackage}
                    className={`
                      px-8 py-3 rounded-lg font-semibold transition-all
                      ${promotionPackage ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {promotionSteps === 2 && (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete payment</h3>
                <p className="text-gray-600 mb-6">Choose your payment method</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{promotionPackage} promotion</span>
                    <span className="text-xl font-bold">R{promotionPackage === 'standard' ? '40' : '100'}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {['card', 'paypal', 'bank'].map((method) => (
                    <div
                      key={method}
                      onClick={() => handlePaymentSelection(method)}
                      className={`
                        p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4
                        ${selectedPaymentMethod === method ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}
                      `}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {method === 'card' && <CreditCardIcon className="w-5 h-5" />}
                        {method === 'paypal' && <DevicePhoneMobileIcon className="w-5 h-5" />}
                        {method === 'bank' && <BuildingLibraryIcon className="w-5 h-5" />}
                      </div>
                      <span className="font-medium capitalize flex-1">{method === 'card' ? 'Credit/Debit Card' : method}</span>
                      {selectedPaymentMethod === method && <CheckCircleIcon className="w-5 h-5 text-black" />}
                    </div>
                  ))}
                </div>

                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-xl">
                    <input
                      type="text"
                      placeholder="Card number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Cardholder name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    />
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-6 py-3 text-gray-900 font-medium underline underline-offset-4"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePromoteListing}
                    disabled={selectedPaymentMethod === 'card' && !cardDetailsValid()}
                    className={`
                      px-8 py-3 rounded-lg font-semibold transition-all
                      ${(selectedPaymentMethod !== 'card' || cardDetailsValid()) ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    Pay now
                  </button>
                </div>
              </div>
            )}
            </motion.div>
        </div>
      )}
    </div>
  );
}
