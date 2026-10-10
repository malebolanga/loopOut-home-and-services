import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { uploadFiles } from "../services/upload.service";
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

const PROFANITY_LIST = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'slut', 'whore', 'faggot', 'nigger', 'retard', 'dumbass', 'motherfucker', 'twat', 'idiot', 'stupid'];

const findProfanity = (text) => {
  if (!text || typeof text !== 'string') return [];
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return Array.from(new Set(words.filter(word => PROFANITY_LIST.includes(word))));
};

const ProfanityWarning = ({ text }) => {
  const badWords = findProfanity(text);
  if (badWords.length === 0) return null;
  return (
    <div className="mt-3 text-sm font-medium text-rose-500 flex items-start gap-2 bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
      <span>
        Inappropriate language detected. Please replace: 
        {badWords.map((word, index) => (
          <span key={index} className="mx-1 px-2 py-1 bg-rose-200 text-rose-900 rounded-lg font-black underline decoration-rose-500 decoration-2">
            {word}
          </span>
        ))}
      </span>
    </div>
  );
};

// Professional Airbnb/Stripe-grade UI Components
const SectionCard = ({ title, subtitle, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className={`bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 p-6 sm:p-10 shadow-sm transition-all duration-300 ${className}`}
  >
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

const FormInput = ({ label, icon: Icon, type = "text", id, value, onChange, placeholder, required = false, className = "", rows = 4, helpText = "", children = null }) => (
  <div className={`group/form ${className}`}>
    {label && (
      <label htmlFor={id} className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-rose-500 ml-1 font-semibold">*</span>}
      </label>
    )}
    <div className="relative">
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none shadow-xs hover:border-gray-300 dark:hover:border-gray-600"
          rows={rows}
        />
      ) : type === "number" ? (
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-sm">
            R
          </div>
          <input
            type="number"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-semibold shadow-xs hover:border-gray-300 dark:hover:border-gray-600"
          />
        </div>
      ) : type === "select" ? (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-xs appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
          </div>
        </div>
      ) : (
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors pointer-events-none" />
          )}
          <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium shadow-xs hover:border-gray-300 dark:hover:border-gray-600`}
          />
        </div>
      )}
      {children}
      <ProfanityWarning text={value} />
    </div>
    {helpText && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 ml-1">{helpText}</p>}
  </div>
);

const CategoryCard = ({ id, emoji, label, description, selected, onSelect }) => (
  <div
    onClick={() => onSelect(id)}
    className={`
      group relative cursor-pointer p-5 sm:p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between text-left
      ${selected 
        ? 'border-gray-900 dark:border-white bg-gray-50/80 dark:bg-gray-800/40 shadow-sm ring-1 ring-gray-900 dark:ring-white' 
        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-900 dark:hover:border-white hover:shadow-xs'}
    `}
  >
    <div className="flex items-start justify-between">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl sm:text-4xl transition-transform group-hover:scale-110 duration-200 select-none shadow-xs">
        {emoji}
      </div>

      {selected ? (
        <div className="w-6 h-6 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 flex items-center justify-center shadow-xs">
          <CheckCircleIcon className="w-4 h-4" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors" />
      )}
    </div>

    <div className="mt-5">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        {label}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const TypeCard = ({ id, label, icon: Icon, emoji, selected, onSelect }) => (
  <div
    onClick={() => onSelect(id)}
    className={`
      p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center relative group
      ${selected 
        ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-gray-800 text-white shadow-md' 
        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs'}
    `}
  >
    <div className={`
      w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
      ${selected ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}
    `}>
       {emoji ? <span className="text-2xl">{emoji}</span> : <Icon className="w-6 h-6" />}
    </div>
    <span className={`text-xs sm:text-sm font-semibold tracking-tight ${selected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{label}</span>

    {selected && (
      <div className="absolute top-2.5 right-2.5">
        <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
          <CheckCircleIcon className="w-3 h-3" />
        </div>
      </div>
    )}
  </div>
);

const AmenityCard = ({ id, label, emoji, checked, onChange }) => (
  <label className={`
    flex items-center gap-3.5 p-3.5 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200
    ${checked 
      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-gray-800 text-white shadow-sm' 
      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs'
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
      w-9 h-9 rounded-lg flex items-center justify-center transition-colors
      ${checked ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}
    `}>
       <span className="text-lg">{emoji}</span>
    </div>
    <span className={`text-xs sm:text-sm font-semibold flex-1 ${checked ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{label}</span>
    {checked ? (
      <CheckCircleIcon className="w-5 h-5 text-rose-500" />
    ) : (
      <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600" />
    )}
  </label>
);

const MediaUploadArea = ({ type = 'image', onChange, onSubmit, filesCount, maxFiles = 20, label, uploading, uploadProgress }) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-4">
      <input
        type="file"
        id={`${type}-upload`}
        accept={type === 'image' ? 'image/*,.avif,.webp,.heic,.heif,.jpg,.jpeg,.png,.gif,.svg' : 'video/*,.mp4,.webm,.mov,.m4v'}
        multiple={type === 'image'}
        onChange={onChange}
        className="hidden"
        disabled={uploading}
      />
      <label
        htmlFor={`${type}-upload`}
        className={`
          relative group p-8 sm:p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center 
          cursor-pointer transition-all duration-200 text-center
          ${uploading 
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-wait' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 hover:border-rose-500 hover:bg-rose-50/20 dark:hover:bg-rose-950/20'}
        `}
      >
        {type === 'image' ? (
          <>
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl mb-4 flex items-center justify-center shadow-xs">
              <CameraIcon className="w-7 h-7" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-base sm:text-lg mb-1">{label || "Upload Photos"}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Drag and drop or tap to browse files</span>
            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-xs">
               <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
               <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Recommended: High quality JPG, PNG, WEBP</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl mb-4 flex items-center justify-center shadow-xs">
              <VideoCameraIcon className="w-7 h-7" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-base sm:text-lg mb-1">{label || "Upload Video"}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Add an optional walkthrough video (MP4, WebM)</span>
          </>
        )}
      </label>
      
      {filesCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={onSubmit}
          className="w-full py-3.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl font-bold text-sm tracking-wide shadow-sm transition-all duration-200 active:scale-[0.99]"
          disabled={uploading}
        >
          {uploading ? (
             <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                <span>Uploading {Math.round(uploadProgress)}%...</span>
             </div>
          ) : `Upload ${filesCount} File${filesCount > 1 ? 's' : ''}`}
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
    { id: 9, label: "Pricing", icon: CurrencyDollarIcon },
    { id: 10, label: "Review", icon: CheckCircleIcon }
  ];

  if (!category) {
    return allSteps.filter(s => s.id <= 3 || s.id >= 8);
  }

  return allSteps.filter(step => {
    if (category === 'selling') {
      return step.id === 1 || step.id === 2 || step.id === 3 || step.id === 8 || step.id === 9 || step.id === 10;
    }
    if (category === 'events') {
      return step.id === 1 || step.id === 2 || step.id === 3 || step.id === 5 || step.id === 8 || step.id === 9 || step.id === 10;
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

const getCurrentPhase = (step) => {
  if (step <= 3) return 1;
  if (step <= 8) return 2;
  return 3;
};

const getPhaseMeta = (phase) => {
  if (phase === 1) {
    return {
      phase: 1,
      label: 'Basics',
    };
  }
  if (phase === 2) {
    return {
      phase: 2,
      label: 'Details & Photos',
    };
  }
  return {
    phase: 3,
    label: 'Finish & Publish',
  };
};

const StepProgress = ({ currentStep, category, type }) => {
  const currentPhase = getCurrentPhase(currentStep);
  const visibleSteps = getVisibleSteps(category, type);
  const currIdx = Math.max(0, visibleSteps.findIndex(s => s.id === currentStep));
  const totalVisible = visibleSteps.length;

  const phases = [1, 2, 3].map(p => ({
    number: p,
    ...getPhaseMeta(p)
  }));

  return (
    <div className="mb-6 sm:mb-8">
      {/* 3 Macro Phase Stepper */}
      <div className="max-w-md mx-auto px-4">
        <div className="relative flex items-center justify-between">
          {/* Background Track */}
          <div className="absolute top-4 sm:top-5 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-800 z-0" />
          
          {/* Active Colored Track */}
          <div 
            className="absolute top-4 sm:top-5 left-6 h-0.5 bg-rose-500 transition-all duration-300 z-0"
            style={{ 
              width: currentPhase === 1 ? '0%' : currentPhase === 2 ? '50%' : 'calc(100% - 48px)' 
            }}
          />

          {phases.map((phase) => {
            const isCompleted = currentPhase > phase.number;
            const isActive = currentPhase === phase.number;

            return (
              <div key={phase.number} className="relative z-10 flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200
                    ${isCompleted 
                      ? 'bg-rose-500 text-white' 
                      : isActive 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 ring-4 ring-rose-500/20 shadow-sm' 
                        : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-400'}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <span>{phase.number}</span>
                  )}
                </div>

                <div className="mt-2 text-center">
                  <div className={`text-xs font-semibold tracking-tight whitespace-nowrap transition-colors ${
                    isActive ? 'text-gray-900 dark:text-white font-bold' : isCompleted ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {phase.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean step pill */}
        <div className="mt-4 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Phase {currentPhase} of 3 · Step {currIdx + 1} of {totalVisible}
          </span>
        </div>
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
  const [serviceUploading, setServiceUploading] = useState(false);
  const [postLimitReached, setPostLimitReached] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [newListingId, setNewListingId] = useState(null);
  const [promotionSteps, setPromotionSteps] = useState(0);
  const [promotionPackage, setPromotionPackage] = useState('');

  // Individual unit / room / apartment builder state
  const [newRoom, setNewRoom] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    capacity: 1,
    count: 1
  });
  const [roomImageUploading, setRoomImageUploading] = useState(false);

  // Car Wash custom builder state
  const [customVehicleInput, setCustomVehicleInput] = useState('');
  const [customWashPackage, setCustomWashPackage] = useState({
    name: '',
    price: '',
    description: '',
    duration: ''
  });
  const [washPrices, setWashPrices] = useState({
    wash_glow: 130,
    wash_dry: 100,
    wash_dry_polish: 200,
    engine_wash: 150,
    interior_clean: 180,
    full_detail: 350,
    ceramic: 800
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
    providerType: "",
    citizenship: "",
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
    numberOfGuests: 2,
    numberOfApartments: 0,
    numberOfRooms: 1,
    totalUnits: 1,
    roomTypes: [],
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
    
    // Storage specific fields
    storageSize: "",
    storagePriceDay: 0,
    storagePriceMonth: 0,
    storageFailurePolicy: "",
    storageTerms: "",
    storagePolicyDocUrl: "",
    
    // CAR WASH SPECIFIC FIELDS
    carWashPackages: "",
    vehicleTypes: "",
    additionalServices: "",
    serviceDuration: "",
    mobileService: false,
    ecoFriendly: false,

    // Moving rate configuration fields
    moveCostPerBox: 50,
    moveCostPerKilo: 10,
    movePriceVan: 800,
    movePriceVanTrailer: 1200,
    movePriceMiniTruck: 1500,
    movePriceOtherTruck: 2000,
    movePriceBigTruckTrailer: 3500,
    
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
    instantConfirmation: false,
    kidFriendly: false,
    wheelchairAccessible: false,
    parkingAvailable: false,
    environmentallyFriendly: false,

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
      case 'hotel': return 'hotel';
      case 'apartment': return 'apartment';
      case 'office': return 'hourly_room';
      case 'land': return 'self_catering';
      case 'resort': return 'resort';
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
          const userId = currentUser._id || currentUser.id;
          if (!userId) {
            setLoading(false);
            return;
          }

          const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser.token || currentUser.access_token || '';
          const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          };

          // Try standard GET endpoint first (matches Profile & Dashboard)
          let res = await fetch(`/api/user/post-count/${userId}`, {
            headers,
            credentials: 'include',
          });

          // Fallback to POST endpoint if GET returns 404/405
          if (!res.ok && (res.status === 404 || res.status === 405)) {
            res = await fetch(`/api/user/post-count`, {
              method: 'POST',
              headers,
              credentials: 'include',
              body: JSON.stringify({ userId }),
            });
          }

          if (!res.ok) {
            // Graceful fallback if backend count check is unavailable
            setPostLimitReached(false);
            setPaymentRequired(false);
            return;
          }

          const data = await res.json();
          if (data && typeof data.count === 'number' && data.count >= (data.limit || 3)) {
            setPostLimitReached(true);
            setPaymentRequired(true);
          } else {
            setPostLimitReached(false);
            setPaymentRequired(false);
          }
        } catch (err) {
          console.warn("Post count check fallback:", err?.message || err);
          setPostLimitReached(false);
          setPaymentRequired(false);
        } finally {
          setLoading(false);
        }
      };

      fetchPostCount();
    }, 800);

    return () => clearTimeout(timer);
  }, [currentUser?._id]);

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
            if (data && data._id) {
              setFoundHost(data);
              
              // If found, also fetch mutual connections for current user with this found host
              if (currentUser && currentUser._id !== data._id) {
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
  }, [listingForm.contact, currentUser?._id]);

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

      if (selectedCategory === 'experiences' || selectedCategory === 'online') {
        if (!listingForm.providerType) {
          setError("Please select whether this is an individual or company listing");
          return;
        }
        if (listingForm.providerType === 'individual' && !listingForm.citizenship.trim()) {
          setError("Please enter your citizenship");
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
    }

    if (currentStep === 9) {
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
      setCurrentStep(prev => Math.min(prev + 1, 10));
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

  const checkImageQuality = (file) => {
    return new Promise((resolve) => {
      // SVGs, GIFs, AVIF, and HEIC or files without direct image constructor decode
      if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.name.match(/\.(svg|gif|avif|heic|heif)$/i)) {
        return resolve({ valid: true });
      }

      const img = new Image();
      img.onload = () => {
        // Ensure image has dimensions
        if (img.width < 50 || img.height < 50) {
          resolve({ valid: false, reason: "not_quality" });
          return;
        }
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        // If browser fails to preview canvas (e.g. specialized format), fallback gracefully to valid
        resolve({ valid: true });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const checkAdultContentFilename = (filename) => {
    const adultKeywords = ['porn', 'adult', 'sexy', 'naked', 'nsfw', 'xxx', 'nudity', 'nud', 'boobs', 'penis', 'cunt', 'vagina', 'anal', 'blowjob', 'erotic', 'breasts'];
    const lowerFilename = filename.toLowerCase();
    return adultKeywords.some(keyword => lowerFilename.includes(keyword));
  };

  const detectInsultsClient = (data) => {
    const offensiveWords = [
      'bastard', 'fuck', 'asshole', 'bitch', 'idiot', 'stupid', 'jerk',
      'cunt', 'dick', 'pussy', 'shit', 'motherfucker', 'whore', 'slut',
      'nigger', 'faggot', 'retard', 'bastards', 'fucking', 'assholes',
      'bitches', 'idiots', 'stupids', 'jerks', 'cunts', 'dicks', 'pussies',
      'shits', 'motherfuckers', 'whores', 'sluts', 'niggers', 'faggots', 'retards'
    ];
    const obfuscatedPatterns = [
      /f[u*x@1k]/i,
      /a[s*$5]{2}h[o*0]l[e*]/i,
      /b[i*1]tch/i,
      /d[i*1]ck/i,
      /p[u*y]{2}y/i,
      /sh[i*1]t/i,
      /c[u*]nt/i,
      /m[o*]th[e*]rf[u*]ck[e*]r/i
    ];

    const fields = [data.name, data.description, data.rules, data.near, data.address, data.host];
    for (const val of fields) {
      if (val && typeof val === 'string') {
        const lowerVal = val.toLowerCase();
        for (const word of offensiveWords) {
          const regex = new RegExp(`\\b${word}\\b`, 'i');
          if (regex.test(lowerVal)) return true;
        }
        for (const pattern of obfuscatedPatterns) {
          if (pattern.test(lowerVal)) return true;
        }
      }
    }
    return false;
  };

  const compressImage = async (file) => {
    // Preserve vector and animated formats without lossy re-encoding
    if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.name.match(/\.(svg|gif)$/i)) {
      return file;
    }
    // For large files (>2MB), gently optimize while preserving crisp high quality
    if (file.size > 2 * 1024 * 1024) {
      const options = {
        maxSizeMB: 4,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        initialQuality: 0.9
      };
      try {
        return await imageCompression(file, options);
      } catch (error) {
        console.warn("Compression skipped, using original file:", error);
        return file;
      }
    }
    return file;
  };

  const handleFileChange = async (e) => {
    try {
      const selectedFiles = Array.from(e.target.files);
      const checkedFiles = [];

      for (const file of selectedFiles) {
        // Check 1: Filename adult keyword check
        if (checkAdultContentFilename(file.name)) {
          setImageUploadError(`Inappropriate or adult image rejected: "${file.name}". Please upload a suitable picture.`);
          return;
        }

        // Check 2: Quality & Dimensions check
        const qualityResult = await checkImageQuality(file);
        if (!qualityResult.valid) {
          if (qualityResult.reason === "not_quality") {
            setImageUploadError(`Rejected low resolution picture: "${file.name}". Image must be at least 50x50 pixels.`);
          } else {
            setImageUploadError(`Invalid image file: "${file.name}".`);
          }
          return;
        }

        checkedFiles.push(file);
      }

      const compressedFiles = await Promise.all(checkedFiles.map(compressImage));
      setFiles(compressedFiles);
      setImageUploadError(null);
    } catch (error) {
      console.error("Image processing error:", error);
      setImageUploadError("Failed to process images. Please try selecting the files again.");
    }
  };

  const storeImage = async (file) => {
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|avif|heic|heif)$/i.test(file.name);
    if (!isImage) throw new Error('Only image files (JPEG, PNG, WebP, AVIF, GIF, SVG, HEIC) are allowed');
    if (file.size > 25 * 1024 * 1024) throw new Error('Image size must be less than 25MB');
    const [url] = await uploadFiles([file], setUploadProgress);
    return url;
  };

  const storeVideo = async (file) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name);
    if (!isVideo) throw new Error('Only video files (MP4, WebM, MOV) are allowed');
    if (file.size > 50 * 1024 * 1024) throw new Error('Video size must be less than 50MB');
    const [url] = await uploadFiles([file], setUploadProgress);
    return url;
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

      if (files.length + listingForm.imageUrls.length > 20) {
        setImageUploadError("You can only upload up to 20 images per listing");
        return;
      }

      setUploading(true);
      setImageUploadError(null);
      setUploadProgress(0);

      const urls = await uploadFiles(files, setUploadProgress);
      setListingForm({
        ...listingForm,
        imageUrls: [...listingForm.imageUrls, ...(Array.isArray(urls) ? urls : [urls])],
      });

      setFiles([]);
      setImageUploadError(null);
    } catch (err) {
      console.error("Upload error:", err);
      setImageUploadError(err.message || "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRoomImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setRoomImageUploading(true);
      const compressedFile = await compressImage(file);
      const [url] = await uploadFiles([compressedFile], setUploadProgress);
      setNewRoom(prev => ({
        ...prev,
        image: url
      }));
      setUploadProgress(0);
    } catch (err) {
      alert("Failed to upload room photo: " + (err.message || err));
    } finally {
      setRoomImageUploading(false);
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.name.trim()) return;
    const roomToAdd = {
      name: newRoom.name.trim(),
      price: Number(newRoom.price) || Number(listingForm.regularPrice) || 0,
      description: newRoom.description.trim(),
      image: newRoom.image || '',
      capacity: Number(newRoom.capacity) || 1,
      count: Number(newRoom.count) || 1
    };
    setListingForm(prev => {
      const updatedRooms = [...(prev.roomTypes || []), roomToAdd];
      return {
        ...prev,
        roomTypes: updatedRooms,
        numberOfRooms: updatedRooms.length,
        totalUnits: updatedRooms.length
      };
    });
    setNewRoom({ name: '', price: '', description: '', image: '', capacity: 1, count: 1 });
  };

  const handleRemoveRoom = (index) => {
    setListingForm(prev => {
      const updatedRooms = (prev.roomTypes || []).filter((_, i) => i !== index);
      return {
        ...prev,
        roomTypes: updatedRooms,
        numberOfRooms: updatedRooms.length > 0 ? updatedRooms.length : prev.bedrooms || 1,
        totalUnits: updatedRooms.length > 0 ? updatedRooms.length : 1
      };
    });
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

  const handleServiceImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setServiceUploading(true);
      setError(null);
      
      const compressedFile = await compressImage(file);
      const url = await storeImage(compressedFile);
      
      setListingForm(prev => ({
        ...prev,
        newServiceImage: url
      }));
      setServiceUploading(false);
    } catch (err) {
      setServiceUploading(false);
      setError("Failed to upload service photo: " + err.message);
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
    } else if (id === "providerType") {
      setListingForm({
        ...listingForm,
        providerType: value,
        citizenship: value === "individual" ? listingForm.citizenship : "",
      });
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

    if (selectedCategory === 'experiences' || selectedCategory === 'online') {
      if (!listingForm.providerType) {
        return setError("Please select whether this is an individual or company listing");
      }
      if (listingForm.providerType === 'individual' && !listingForm.citizenship.trim()) {
        return setError("Please enter your citizenship");
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
        providerType: (selectedCategory === 'experiences' || selectedCategory === 'online') ? listingForm.providerType : "",
        citizenship: (selectedCategory === 'experiences' || selectedCategory === 'online') && listingForm.providerType === 'individual' ? listingForm.citizenship : "",
        regularPrice: selectedType === 'storage' ? (Number(listingForm.storagePriceMonth) || 100) : (listingForm.regularPrice || 50),
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
        checkInTime: listingForm.checkInTime || '14:00',
        checkOutTime: listingForm.checkOutTime || '11:00',
        numberOfApartments: Number(listingForm.numberOfApartments) || 0,
        numberOfRooms: Number(listingForm.numberOfRooms) || Number(listingForm.bedrooms) || 1,
        numberOfGuests: Number(listingForm.numberOfGuests) || 1,
        totalUnits: Number(listingForm.totalUnits) || (Number(listingForm.numberOfApartments) || 0) + (Number(listingForm.numberOfRooms) || Number(listingForm.bedrooms) || 1),
        roomTypes: Array.isArray(listingForm.roomTypes) ? listingForm.roomTypes : [],
        serviceList: (selectedCategory === 'experiences' || selectedCategory === 'online') ? listingForm.serviceList : [],
        performers: (selectedCategory === 'experiences' || selectedCategory === 'online') ? listingForm.performers : [],
        
        // Moving specific rates
        moveCostPerBox: selectedType === 'moving' ? (Number(listingForm.moveCostPerBox) || 50) : undefined,
        moveCostPerKilo: selectedType === 'moving' ? (Number(listingForm.moveCostPerKilo) || 10) : undefined,
        movePriceVan: selectedType === 'moving' ? (Number(listingForm.movePriceVan) || 800) : undefined,
        movePriceVanTrailer: selectedType === 'moving' ? (Number(listingForm.movePriceVanTrailer) || 1200) : undefined,
        movePriceMiniTruck: selectedType === 'moving' ? (Number(listingForm.movePriceMiniTruck) || 1500) : undefined,
        movePriceOtherTruck: selectedType === 'moving' ? (Number(listingForm.movePriceOtherTruck) || 2000) : undefined,
        movePriceBigTruckTrailer: selectedType === 'moving' ? (Number(listingForm.movePriceBigTruckTrailer) || 3500) : undefined,
        
        // Storage specific fields
        storageSize: selectedType === 'storage' ? listingForm.storageSize : undefined,
        storagePriceDay: selectedType === 'storage' ? (Number(listingForm.storagePriceDay) || 0) : undefined,
        storagePriceMonth: selectedType === 'storage' ? (Number(listingForm.storagePriceMonth) || 0) : undefined,
        storageFailurePolicy: selectedType === 'storage' ? listingForm.storageFailurePolicy : undefined,
        storageTerms: selectedType === 'storage' ? listingForm.storageTerms : undefined,
        storagePolicyDocUrl: selectedType === 'storage' ? listingForm.storagePolicyDocUrl : undefined,
      };

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
      } catch (jsonError) {
        console.error("Failed to parse listing creation response:", jsonError);
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
        } else if (selectedCategory !== 'property') {
          const path = selectedCategory === 'experiences' ? `/service/${data._id || data.listing?._id}` :
                       selectedCategory === 'online' ? `/helper/${data._id || data.listing?._id}` :
                       `/event/${data._id || data.listing?._id}`;
          navigate(path);
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
        
          { id: "instantConfirmation", label: "Instant confirmation", emoji: "⚡", checked: listingForm.instantConfirmation },
          { id: "kidFriendly", label: "Kid-friendly", emoji: "U0001F476", checked: listingForm.kidFriendly },
          { id: "wheelchairAccessible", label: "Wheelchair accessible", emoji: "♿", checked: listingForm.wheelchairAccessible },
          { id: "parkingAvailable", label: "Parking available", emoji: "U0001F17F️", checked: listingForm.parkingAvailable },
          { id: "environmentallyFriendly", label: "Environmentally friendly", emoji: "U0001F331", checked: listingForm.environmentallyFriendly },
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
          { id: "instantConfirmation", label: "Instant confirmation", emoji: "⚡", checked: listingForm.instantConfirmation },
          { id: "kidFriendly", label: "Kid-friendly", emoji: "U0001F476", checked: listingForm.kidFriendly },
          { id: "wheelchairAccessible", label: "Wheelchair accessible", emoji: "♿", checked: listingForm.wheelchairAccessible },
          { id: "parkingAvailable", label: "Parking available", emoji: "U0001F17F️", checked: listingForm.parkingAvailable },
          { id: "environmentallyFriendly", label: "Environmentally friendly", emoji: "U0001F331", checked: listingForm.environmentallyFriendly },
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
        
          { id: "instantConfirmation", label: "Instant confirmation", emoji: "⚡", checked: listingForm.instantConfirmation },
          { id: "kidFriendly", label: "Kid-friendly", emoji: "U0001F476", checked: listingForm.kidFriendly },
          { id: "wheelchairAccessible", label: "Wheelchair accessible", emoji: "♿", checked: listingForm.wheelchairAccessible },
          { id: "parkingAvailable", label: "Parking available", emoji: "U0001F17F️", checked: listingForm.parkingAvailable },
          { id: "environmentallyFriendly", label: "Environmentally friendly", emoji: "U0001F331", checked: listingForm.environmentallyFriendly },
        ];
      default:
        return [];
    }
  };

  const getPricingLabel = () => {
    if (selectedCategory === 'property') {
      if (['over', 'hotel', 'land', 'resort'].includes(selectedType)) return "Regular Price (per day)";
      if (['rent', 'rent-long', 'rent-short', 'apartment'].includes(selectedType)) return "Regular Price (per month)";
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
          { id: "rent", label: "Room / Home to Rent", emoji: "🏠", description: "Monthly & short/long-term rental" },
          { id: "over", label: "Guest House / B&B", emoji: "🛌", description: "Per-day guest house & BnB stays" },
          { id: "hotel", label: "Hotel / Lodge", emoji: "🏨", description: "Hotels, lodges & multi-room suites (per day)" },
          { id: "apartment", label: "Apartment / Complex", emoji: "🏢", description: "Single or multi-unit apartment complexes" },
          { id: "land", label: "Self Catering", emoji: "🍳", description: "Self catering chalets & houses (per day)" },
          { id: "resort", label: "Resort & Holiday Park", emoji: "🏖️", description: "Holiday resorts & vacation chalets (per day)" },
          { id: "office", label: "Room Per Hour", emoji: "🚪", description: "Hourly rooms & private spaces (per hour)" },
        ];
      case 'experiences':
        return [
          { id: "handyman", label: "Handyman", emoji: "🛠️", description: "General home repairs" },
          { id: "storage", label: "Booking Storage", emoji: "📦", description: "Safe storage space" },
          { id: "moving", label: "Moving", emoji: "🚚", description: "Relocation services" },
          { id: "landscaping", label: "Landscaping", emoji: "🌿", description: "Garden & yard work" },
          { id: "catering", label: "Catering", emoji: "🍽️", description: "Food & catering" },
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

  const redirectToPayFast = (payfast) => {
    if (!payfast?.url || !payfast?.fields) {
      throw new Error('Secure checkout could not be initialized.');
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payfast.url;

    Object.entries(payfast.fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
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
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        redirectToPayFast(data.payfast);
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (err) {
      setError("Payment error. Please try again later.");
      console.error("Payment error:", err);
    }
  };

  const handlePromoteListing = async () => {
    try {
      const res = await fetch("/api/promotion/payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          listingId: newListingId,
          package: promotionPackage
        }),
      });
      const data = await res.json();

      if (data.success) {
        redirectToPayFast(data.payfast);
      } else {
        setError(data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError("Payment error. Please try again later.");
      console.error("Payment error:", err);
    }
  };

  if (loading && !showPromotionPopup) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-800/50 pb-20 overflow-x-hidden relative">
      {/* Cinematic Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white">Loading...</p>
        </div>
      </main>
    );
  }


  const currentPhase = getCurrentPhase(currentStep);
  const visibleSteps = getVisibleSteps(selectedCategory, selectedType);
  const currStepIdx = Math.max(0, visibleSteps.findIndex(s => s.id === currentStep));
  const isLastStep = currStepIdx === visibleSteps.length - 1;
  const nextStepObj = currStepIdx < visibleSteps.length - 1 ? visibleSteps[currStepIdx + 1] : null;
  const nextPhase = nextStepObj ? getCurrentPhase(nextStepObj.id) : 3;
  const isPhaseTransition = nextStepObj && nextPhase > currentPhase;
  const nextPhaseMeta = getPhaseMeta(nextPhase, selectedCategory);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-50/70 dark:bg-gray-950 app-safe-content-bottom pb-32 md:pb-36">
      {/* Sleek Modern Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="app-safe-top max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              type="button"
              onClick={() => {
                if (currStepIdx > 0) {
                  handlePrevStep();
                } else {
                  navigate('/user-listings');
                }
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="font-extrabold text-xl tracking-tight text-[#FF5A5F]">
                loopOut
              </span>
              <span className="text-gray-300 dark:text-gray-700 font-light">/</span>
              <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                Create Listing
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Phase {currentPhase} of 3
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => navigate('/user-listings')}
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              Save & exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-40 sm:pb-44 md:pb-48">
        {/* Step Progress */}
        <div className="mt-4 mb-8 sm:mt-6 sm:mb-10">
          <StepProgress 
            currentStep={currentStep} 
            category={selectedCategory} 
            type={selectedType}
          />
        </div>

        {/* Main Form Container */}
        <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <form onSubmit={handleSubmit} ref={stepRef} className="space-y-8 pb-24 sm:pb-28">
            
            {/* Step 1: Select Category */}
            {currentStep === 1 && (
              <SectionCard title="Choose your listing path" subtitle="Select one option to start. You can review every detail before publishing.">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('property')}
                      aria-pressed={selectedCategory === 'property'}
                      className={`group relative min-h-52 sm:min-h-60 overflow-hidden rounded-[1.75rem] border p-6 sm:p-7 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/25 ${
                        selectedCategory === 'property'
                          ? 'border-rose-500 bg-rose-50 text-gray-950 shadow-lg shadow-rose-500/10 dark:bg-rose-950/25 dark:text-white'
                          : 'border-gray-200 bg-white text-gray-950 shadow-sm hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${selectedCategory === 'property' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'}`}><HomeModernIcon className="h-6 w-6" /></div>
                        <div className={`grid h-6 w-6 place-items-center rounded-full border-2 ${selectedCategory === 'property' ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {selectedCategory === 'property' && <CheckCircleIcon className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="mt-7">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">Stay</p>
                        <p className="mt-1 text-xl font-bold tracking-tight">A place to stay</p>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">Home, room, apartment, guest house, hotel, or self-catering stay.</p>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><span>Start listing a place</span><ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory('experiences')}
                      aria-pressed={selectedCategory === 'experiences'}
                      className={`group relative min-h-52 sm:min-h-60 overflow-hidden rounded-[1.75rem] border p-6 sm:p-7 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/25 ${
                        selectedCategory === 'experiences'
                          ? 'border-rose-500 bg-rose-50 text-gray-950 shadow-lg shadow-rose-500/10 dark:bg-rose-950/25 dark:text-white'
                          : 'border-gray-200 bg-white text-gray-950 shadow-sm hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${selectedCategory === 'experiences' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}><BriefcaseIcon className="h-6 w-6" /></div>
                        <div className={`grid h-6 w-6 place-items-center rounded-full border-2 ${selectedCategory === 'experiences' ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {selectedCategory === 'experiences' && <CheckCircleIcon className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="mt-7">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">Services</p>
                        <p className="mt-1 text-xl font-bold tracking-tight">A service to offer</p>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">Beauty, transport, trades, cleaning, and professional local services.</p>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><span>Start listing a service</span><ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Other listing options</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <CategoryCard id="online" emoji="🤝" label="Helper" description="Tutor, specialist, or personal helper" selected={selectedCategory === 'online'} onSelect={setSelectedCategory} />
                      <CategoryCard id="events" emoji="🎉" label="Event" description="A local occasion or activity" selected={selectedCategory === 'events'} onSelect={setSelectedCategory} />
                      <CategoryCard id="selling" emoji="🛍️" label="Item for sale" description="Furniture, electronics, books, and more" selected={selectedCategory === 'selling'} onSelect={setSelectedCategory} />
                    </div>
                  </div>

                </div>
              </SectionCard>
            )}

            {/* Step 2: Select Type */}
            {currentStep === 2 && (
              <SectionCard className="scroll-mb-40" title={`What type of ${selectedCategory === 'property' ? 'property' : 
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
                            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 mt-2">
                               <div className="flex items-center gap-3.5">
                                  <div className="relative">
                                    <img 
                                      src={foundHost.avatar} 
                                      alt={foundHost.username}
                                      className="w-12 h-12 rounded-xl object-cover border border-rose-200 shadow-xs"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Mutual Connection Identified</p>
                                     <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{foundHost.username}</h4>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setListingForm(prev => ({ ...prev, host: foundHost.username }))}
                                    className="px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
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
                                         <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-white">
                                            +{mutualConnections.length - 5}
                                         </div>
                                       )}
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-white mt-2">
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

                    {(selectedCategory === 'experiences' || selectedCategory === 'online') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="Provider Type"
                          type="select"
                          id="providerType"
                          value={listingForm.providerType}
                          onChange={handleFormChange}
                          placeholder="Select individual or company"
                          required
                        >
                          <option value="individual">Individual</option>
                          <option value="company">Company</option>
                        </FormInput>

                        {listingForm.providerType === 'individual' && (
                          <FormInput
                            label="Citizenship"
                            icon={BuildingLibraryIcon}
                            id="citizenship"
                            value={listingForm.citizenship}
                            onChange={handleFormChange}
                            placeholder="e.g., South African"
                            required
                          />
                        )}
                      </div>
                    )}

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
                      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div>
                          <label className="block text-xs font-black text-gray-500 dark:text-white uppercase tracking-wider mb-3">
                            Property Classification / Kind *
                          </label>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {[
                              { id: 'apartment', label: '🏢 Apartment / Flat' },
                              { id: 'guest_house', label: '🛌 Guest House / B&B' },
                              { id: 'hotel', label: '🏨 Hotel / Lodge' },
                              { id: 'room', label: '🚪 Room / Hourly Room' },
                              { id: 'house', label: '🏠 Entire House' },
                              { id: 'villa', label: '🏰 Villa / Mansion' },
                              { id: 'townhouse', label: '🏘️ Townhouse' },
                              { id: 'studio', label: '🛋️ Studio / Bachelor' },
                              { id: 'cottage', label: '🏡 Cottage / Chalet' },
                              { id: 'resort', label: '🏖️ Resort' },
                              { id: 'complex', label: '🏬 Multi-Unit Complex' },
                              { id: 'office', label: '💼 Office / Workspace' },
                            ].map((k) => (
                              <button
                                key={k.id}
                                type="button"
                                onClick={() => setListingForm(prev => ({ ...prev, kind: k.id }))}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                                  listingForm.kind === k.id
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-105'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200'
                                }`}
                              >
                                {k.label}
                              </button>
                            ))}
                          </div>
                          <FormInput
                            label="Or Custom Property Type"
                            id="kind"
                            value={listingForm.kind}
                            onChange={handleFormChange}
                            placeholder="e.g., Apartment, Guest House, Hotel, Room"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormInput
                            label="Max Guests / Capacity"
                            id="numberOfGuests"
                            type="number"
                            value={listingForm.numberOfGuests || 2}
                            onChange={handleFormChange}
                            placeholder="e.g., 2 Guests"
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
                          <FormInput
                            label="Cancellation Policy"
                            id="cancel"
                            value={listingForm.cancel}
                            onChange={handleFormChange}
                            placeholder="e.g., Flexible - Free cancellation 48 hours before check-in"
                            required
                          />
                        </div>

                        {/* Individual Units / Rooms / Apartments Builder */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                              <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>🏢</span> Specific Units, Rooms &amp; Apartments
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-white font-medium mt-0.5">
                                Add apartment numbers, room names, suites or motel rooms with individual prices, photos, descriptions &amp; guest capacities.
                              </p>
                            </div>
                            {listingForm.roomTypes && listingForm.roomTypes.length > 0 && (
                              <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full">
                                {listingForm.roomTypes.length} {listingForm.roomTypes.length === 1 ? 'Unit' : 'Units'} Added
                              </span>
                            )}
                          </div>

                          {/* Quick Preset Buttons */}
                          <div className="mb-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                              Quick Auto-Fill Presets:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { prefix: 'Apartment ', icon: '🏢' },
                                { prefix: 'Room ', icon: '🚪' },
                                { prefix: 'Guest House Room ', icon: '🛌' },
                                { prefix: 'Hotel Room ', icon: '🏨' },
                                { prefix: 'Motel Room ', icon: '🏩' },
                                { prefix: 'Townhouse Unit ', icon: '🏘️' },
                                { prefix: 'Studio ', icon: '🛋️' },
                              ].map((p, idx) => {
                                const nextNum = (listingForm.roomTypes?.filter(r => r.name.toLowerCase().includes(p.prefix.toLowerCase())).length || 0) + 1;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setNewRoom(prev => ({ ...prev, name: `${p.prefix}${nextNum}` }))}
                                    className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                  >
                                    <span>{p.icon}</span>
                                    <span>+ {p.prefix}{nextNum}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Add New Unit Card */}
                          <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                  Unit / Room Name or Number *
                                </label>
                                <input
                                  type="text"
                                  value={newRoom.name}
                                  onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g., Apartment 1, Room 101"
                                  className="w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                  Price (R)
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-rose-500 text-sm">R</span>
                                  <input
                                    type="number"
                                    value={newRoom.price}
                                    onChange={(e) => setNewRoom(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder={listingForm.regularPrice ? `${listingForm.regularPrice}` : "e.g., 650"}
                                    className="w-full pl-9 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                  Number of Guests (Capacity)
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">👥</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={newRoom.capacity || 1}
                                    onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: Math.max(1, parseInt(e.target.value) || 1) }))}
                                    placeholder="2 Guests"
                                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Guest Presets Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0 mr-1">Guests:</span>
                              {[1, 2, 3, 4, 6, 8].map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => setNewRoom(prev => ({ ...prev, capacity: g }))}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    (newRoom.capacity || 1) === g
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  {g} {g === 1 ? 'Guest' : 'Guests'}
                                </button>
                              ))}
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Unit Description
                              </label>
                              <textarea
                                value={newRoom.description}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="e.g., 1 Bedroom with ensuite bathroom, balcony, prepaid electricity and built-in cupboards..."
                                rows={2}
                                className="w-full px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none shadow-sm"
                              />
                            </div>

                            {/* Unit Photo Upload */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                              <div className="flex items-center gap-3">
                                {newRoom.image ? (
                                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
                                    <img src={newRoom.image} alt="Unit preview" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setNewRoom(prev => ({ ...prev, image: '' }))}
                                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-rose-500 transition-colors cursor-pointer"
                                    >
                                      <XMarkIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer text-xs font-bold text-gray-700 dark:text-white shadow-sm transition-all active:scale-95">
                                    <CameraIcon className="w-4 h-4 text-rose-500" />
                                    <span>{roomImageUploading ? "Uploading..." : "Upload Unit Picture"}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={roomImageUploading}
                                      onChange={handleRoomImageChange}
                                    />
                                  </label>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={handleAddRoom}
                                disabled={!newRoom.name.trim() || roomImageUploading}
                                className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                              >
                                + Add Unit to Listing
                              </button>
                            </div>
                          </div>

                          {/* Rendered Configured Units List */}
                          {listingForm.roomTypes && listingForm.roomTypes.length > 0 && (
                            <div className="mt-5 space-y-3">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Configured Units ({listingForm.roomTypes.length}):
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {listingForm.roomTypes.map((room, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5 group hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                                  >
                                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                      {room.image ? (
                                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-2xl">🚪</span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <h4 className="font-black text-gray-900 dark:text-white text-sm truncate">{room.name}</h4>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveRoom(idx)}
                                          className="text-gray-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                                          title="Remove this unit"
                                        >
                                          <XMarkIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs font-black text-rose-600">
                                          R{room.price?.toLocaleString()}
                                        </p>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-white bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                          <span>👥</span>
                                          <span>{room.capacity || 1} {(room.capacity || 1) === 1 ? 'Guest' : 'Guests'}</span>
                                        </span>
                                      </div>
                                      {room.description && (
                                        <p className="text-[11px] text-gray-500 dark:text-white font-medium line-clamp-2 mt-1">
                                          {room.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sneaker Cleaner Specific Fields */}
                    {selectedCategory === 'online' && selectedType === 'sneaker' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sneaker Cleaning Details</h3>
                        
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
                      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Animal Care Details</h3>
                        
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
                      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Book Details</h3>
                        
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
                      <div className="space-y-8 pt-4 border-t border-gray-200 dark:border-gray-800">
                        {/* 1. VEHICLE TYPES SECTION */}
                        <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                          <label className="block text-base font-bold text-gray-900 dark:text-white mb-1">
                            🚗 Vehicle Types Serviced (Type of the Car) <span className="text-[#FF5A5F]">*</span>
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select all car types your service accommodates, or add custom vehicle types.</p>
                          
                          <div className="flex flex-wrap gap-2.5 mb-4">
                            {[
                              "Sedan",
                              "Hatchback",
                              "SUV / Crossover",
                              "4x4 / Bakkie / Truck",
                              "Van / Minibus",
                              "Luxury / Sports Car",
                              "Motorcycle / Quad"
                            ].map((vType) => {
                              const currentTypes = listingForm.vehicleTypes ? listingForm.vehicleTypes.split(',').map(s => s.trim()).filter(Boolean) : [];
                              const isSelected = currentTypes.includes(vType);
                              return (
                                <button
                                  type="button"
                                  key={vType}
                                  onClick={() => {
                                    let updated;
                                    if (isSelected) {
                                      updated = currentTypes.filter(t => t !== vType);
                                    } else {
                                      updated = [...currentTypes, vType];
                                    }
                                    setListingForm({
                                      ...listingForm,
                                      vehicleTypes: updated.join(', ')
                                    });
                                  }}
                                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 border-2 ${
                                    isSelected 
                                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                  {vType}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom vehicle type adder */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customVehicleInput}
                              onChange={(e) => setCustomVehicleInput(e.target.value)}
                              placeholder="Add custom vehicle type (e.g. Coupe, Trailer)..."
                              className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:border-rose-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!customVehicleInput.trim()) return;
                                const currentTypes = listingForm.vehicleTypes ? listingForm.vehicleTypes.split(',').map(s => s.trim()).filter(Boolean) : [];
                                if (!currentTypes.includes(customVehicleInput.trim())) {
                                  const updated = [...currentTypes, customVehicleInput.trim()];
                                  setListingForm({
                                    ...listingForm,
                                    vehicleTypes: updated.join(', ')
                                  });
                                }
                                setCustomVehicleInput('');
                              }}
                              className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                            >
                              + Add
                            </button>
                          </div>

                          {listingForm.vehicleTypes && (
                            <p className="mt-3 text-xs font-semibold text-rose-500">
                              Selected: {listingForm.vehicleTypes}
                            </p>
                          )}
                        </div>

                        {/* 2. CAR WASH PACKAGES & OPTIONS */}
                        <div>
                          <label className="block text-base font-bold text-gray-900 dark:text-white mb-1">
                            🧼 Car Wash Packages & Wash Options <span className="text-[#FF5A5F]">*</span>
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the wash options you offer and customize your price for each.</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { id: "wash_glow", label: "Wash & Glow", desc: "Exterior hand wash, tire shine & high-gloss spray finish", defaultPrice: 130, duration: "30-45 mins", emoji: "✨" },
                              { id: "wash_dry", label: "Wash & Dry", desc: "Exterior hand wash, streak-free microfibre towel dry & windows", defaultPrice: 100, duration: "30 mins", emoji: "🧽" },
                              { id: "wash_dry_polish", label: "Wash, Dry & Polish", desc: "Full exterior hand wash, towel dry & protective hand wax polish", defaultPrice: 200, duration: "1 hr", emoji: "🚗" },
                              { id: "engine_wash", label: "Engine Wash", desc: "High-pressure engine bay degrease & protective engine detailing", defaultPrice: 150, duration: "30 mins", emoji: "⚙️" },
                              { id: "interior_clean", label: "Interior Deep Clean", desc: "Full seat vacuuming, dashboard wipe, panel clean & odor elimination", defaultPrice: 180, duration: "45 mins", emoji: "🪑" },
                              { id: "full_detail", label: "Full Detailing", desc: "Complete interior deep clean + exterior hand wash, dry & polish", defaultPrice: 350, duration: "2 hrs", emoji: "💎" },
                              { id: "ceramic", label: "Ceramic Coating", desc: "Paint decontamination, clay bar & long-lasting ceramic coat protection", defaultPrice: 800, duration: "3 hrs", emoji: "🛡️" }
                            ].map((pkg) => {
                              const currentPackages = listingForm.carWashPackages ? listingForm.carWashPackages.split(',').map(s => s.trim()).filter(Boolean) : [];
                              const isChecked = currentPackages.includes(pkg.id);
                              const price = washPrices[pkg.id] !== undefined ? washPrices[pkg.id] : pkg.defaultPrice;

                              const handleToggle = (checked) => {
                                let updatedPackages;
                                if (checked) {
                                  updatedPackages = [...currentPackages, pkg.id];
                                } else {
                                  updatedPackages = currentPackages.filter(p => p !== pkg.id);
                                }
                                
                                // Build serviceList items for selected packages
                                const allSelectedPkgObjs = [
                                  { id: "wash_glow", label: "Wash & Glow", desc: "Exterior hand wash, tire shine & high-gloss spray finish", duration: "30-45 mins" },
                                  { id: "wash_dry", label: "Wash & Dry", desc: "Exterior hand wash, streak-free microfibre towel dry & windows", duration: "30 mins" },
                                  { id: "wash_dry_polish", label: "Wash, Dry & Polish", desc: "Full exterior hand wash, towel dry & protective hand wax polish", duration: "1 hr" },
                                  { id: "engine_wash", label: "Engine Wash", desc: "High-pressure engine bay degrease & protective engine detailing", duration: "30 mins" },
                                  { id: "interior_clean", label: "Interior Deep Clean", desc: "Full seat vacuuming, dashboard wipe, panel clean & odor elimination", duration: "45 mins" },
                                  { id: "full_detail", label: "Full Detailing", desc: "Complete interior deep clean + exterior hand wash, dry & polish", duration: "2 hrs" },
                                  { id: "ceramic", label: "Ceramic Coating", desc: "Paint decontamination, clay bar & long-lasting ceramic coat protection", duration: "3 hrs" }
                                ].filter(item => updatedPackages.includes(item.id)).map(item => ({
                                  type: item.id,
                                  name: item.label,
                                  description: item.desc,
                                  price: washPrices[item.id] || 150,
                                  duration: item.duration
                                }));

                                // Keep custom services in serviceList
                                const existingCustom = (listingForm.serviceList || []).filter(s => !s.type || !["wash_glow","wash_dry","wash_dry_polish","engine_wash","interior_clean","full_detail","ceramic"].includes(s.type));

                                setListingForm({
                                  ...listingForm,
                                  carWashPackages: updatedPackages.join(','),
                                  serviceList: [...allSelectedPkgObjs, ...existingCustom]
                                });
                              };

                              return (
                                <div 
                                  key={pkg.id} 
                                  className={`p-4 border-2 rounded-2xl transition-all duration-200 ${
                                    isChecked 
                                      ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm' 
                                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => handleToggle(e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                                      />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{pkg.emoji}</span>
                                          <span className="font-bold text-gray-900 dark:text-white text-base">{pkg.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pkg.desc}</p>
                                        <span className="inline-block mt-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500">Duration: {pkg.duration}</span>
                                      </div>
                                    </label>

                                    {/* Price Input */}
                                    <div className="w-28 flex-shrink-0">
                                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Price (R)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={price}
                                        onChange={(e) => {
                                          const newPrice = Number(e.target.value);
                                          setWashPrices(prev => ({ ...prev, [pkg.id]: newPrice }));
                                          if (isChecked) {
                                            const updatedList = (listingForm.serviceList || []).map(item => {
                                              if (item.type === pkg.id || item.name === pkg.label) {
                                                return { ...item, price: newPrice };
                                              }
                                              return item;
                                            });
                                            setListingForm(prev => ({ ...prev, serviceList: updatedList }));
                                          }
                                        }}
                                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:border-rose-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. ADD CUSTOM CAR WASH SERVICE BUILDER */}
                        <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-base">➕ Add Custom Car Wash Package / Service</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Offer custom services like Headlight Restoration, Leather Treatment, Underbody Clean, etc.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Service Name (e.g. Underbody Wash)"
                              value={customWashPackage.name}
                              onChange={(e) => setCustomWashPackage({ ...customWashPackage, name: e.target.value })}
                              className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                            />
                            <input
                              type="number"
                              placeholder="Price in R (e.g. 150)"
                              value={customWashPackage.price}
                              onChange={(e) => setCustomWashPackage({ ...customWashPackage, price: e.target.value })}
                              className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Duration (e.g. 30 mins)"
                              value={customWashPackage.duration}
                              onChange={(e) => setCustomWashPackage({ ...customWashPackage, duration: e.target.value })}
                              className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                            />
                          </div>
                          
                          <input
                            type="text"
                            placeholder="Description of custom wash option..."
                            value={customWashPackage.description}
                            onChange={(e) => setCustomWashPackage({ ...customWashPackage, description: e.target.value })}
                            className="w-full px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              if (!customWashPackage.name.trim() || !customWashPackage.price) return;
                              const newCustomItem = {
                                type: 'custom_' + Date.now(),
                                name: customWashPackage.name.trim(),
                                price: Number(customWashPackage.price),
                                description: customWashPackage.description.trim() || 'Custom wash service',
                                duration: customWashPackage.duration.trim() || '30 mins'
                              };
                              const updatedServiceList = [...(listingForm.serviceList || []), newCustomItem];
                              setListingForm({
                                ...listingForm,
                                serviceList: updatedServiceList
                              });
                              setCustomWashPackage({ name: '', price: '', description: '', duration: '' });
                            }}
                            className="px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors"
                          >
                            + Add Custom Service Option
                          </button>

                          {/* List added custom services */}
                          {listingForm.serviceList?.filter(s => s.type?.startsWith('custom_')).length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Custom Services Added:</p>
                              {listingForm.serviceList.filter(s => s.type?.startsWith('custom_')).map((cItem, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm">
                                  <div>
                                    <span className="font-bold text-gray-900 dark:text-white">{cItem.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">R{cItem.price} ({cItem.duration})</span>
                                    {cItem.description && <p className="text-xs text-gray-400">{cItem.description}</p>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = listingForm.serviceList.filter(s => s.type !== cItem.type);
                                      setListingForm({ ...listingForm, serviceList: filtered });
                                    }}
                                    className="text-xs font-bold text-rose-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 4. DURATION & SERVICE OPTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Overall Estimated Duration"
                            id="serviceDuration"
                            value={listingForm.serviceDuration}
                            onChange={handleFormChange}
                            placeholder="e.g., 30-45 mins, 1-2 hours"
                            required
                          />
                          
                          <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                id="mobileService"
                                checked={listingForm.mobileService}
                                onChange={(e) => setListingForm({ ...listingForm, mobileService: e.target.checked })}
                                className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                              />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">🚗 Mobile Service (I travel to customer's location)</span>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                id="ecoFriendly"
                                checked={listingForm.ecoFriendly}
                                onChange={(e) => setListingForm({ ...listingForm, ecoFriendly: e.target.checked })}
                                className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                              />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">🌱 Eco-Friendly Products Used</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedCategory === 'experiences' && selectedType === 'moving' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moving Rates Configuration</h3>
                          <p className="text-sm text-gray-500 dark:text-white mb-4">Set your rates for boxes, kilos, and transport vehicles. These are used to calculate dynamic totals for clients.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Rate per Box (R)"
                            type="number"
                            id="moveCostPerBox"
                            value={listingForm.moveCostPerBox}
                            onChange={handleFormChange}
                            required
                          />
                          <FormInput
                            label="Rate per Kilo (R)"
                            type="number"
                            id="moveCostPerKilo"
                            value={listingForm.moveCostPerKilo}
                            onChange={handleFormChange}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Price for Van (R)"
                            type="number"
                            id="movePriceVan"
                            value={listingForm.movePriceVan}
                            onChange={handleFormChange}
                            required
                          />
                          <FormInput
                            label="Price for Van with Trailer (R)"
                            type="number"
                            id="movePriceVanTrailer"
                            value={listingForm.movePriceVanTrailer}
                            onChange={handleFormChange}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormInput
                            label="Price for Mini Truck (R)"
                            type="number"
                            id="movePriceMiniTruck"
                            value={listingForm.movePriceMiniTruck}
                            onChange={handleFormChange}
                            required
                          />
                          <FormInput
                            label="Price for Other Truck (R)"
                            type="number"
                            id="movePriceOtherTruck"
                            value={listingForm.movePriceOtherTruck}
                            onChange={handleFormChange}
                            required
                          />
                          <FormInput
                            label="Price for Big Truck with Trailer (R)"
                            type="number"
                            id="movePriceBigTruckTrailer"
                            value={listingForm.movePriceBigTruckTrailer}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {selectedCategory === 'experiences' && selectedType === 'storage' && (
                      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Configuration</h3>
                          <p className="text-sm text-gray-500 dark:text-white mb-4">Set up the details of the storage space and pricing options.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormInput
                            label="Storage Size (e.g. 3m x 3m x 2.5m)"
                            type="text"
                            id="storageSize"
                            value={listingForm.storageSize}
                            onChange={handleFormChange}
                            required
                            placeholder="e.g. Garage-sized, 3x3m"
                          />
                          <FormInput
                            label="Cost per Day (R)"
                            type="number"
                            id="storagePriceDay"
                            value={listingForm.storagePriceDay}
                            onChange={handleFormChange}
                            required
                          />
                          <FormInput
                            label="Cost per Month (R)"
                            type="number"
                            id="storagePriceMonth"
                            value={listingForm.storagePriceMonth}
                            onChange={handleFormChange}
                            required
                          />
                        </div>

                        <div>
                          <FormInput
                            label="Late Payment / Pay Failure Policy"
                            type="textarea"
                            id="storageFailurePolicy"
                            value={listingForm.storageFailurePolicy}
                            onChange={handleFormChange}
                            placeholder="Describe what happens if the payment is missed (e.g., locks are changed, items sold after 3 months)..."
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <FormInput
                            label="Terms & Conditions"
                            type="textarea"
                            id="storageTerms"
                            value={listingForm.storageTerms}
                            onChange={handleFormChange}
                            placeholder="Specify general terms and conditions for storing items..."
                            rows={3}
                            required
                          />
                        </div>

                        {/* PDF Policy Document Upload */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-1">
                            📄 Policy Document (PDF)
                          </label>
                          <p className="text-xs text-gray-500 dark:text-white mb-3">
                            Upload a PDF that customers must read before booking (rental agreement, terms sheet, etc.)
                          </p>

                          {!listingForm.storagePolicyDocUrl ? (
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 hover:border-rose-400 transition-all group">
                              <div className="flex flex-col items-center gap-1">
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                                </svg>
                                <span className="text-sm text-gray-500 dark:text-white group-hover:text-rose-500">Click to upload PDF</span>
                                <span className="text-xs text-gray-400">Max 10 MB</span>
                              </div>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  if (file.size > 10 * 1024 * 1024) {
                                    alert('PDF must be under 10 MB');
                                    return;
                                  }
                                  try {
                                    const [url] = await uploadFiles([file], setUploadProgress);
                                    setListingForm(prev => ({ ...prev, storagePolicyDocUrl: url }));
                                    setUploadProgress(0);
                                  } catch (err) {
                                    alert('Upload error: ' + err.message);
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16z"/>
                                </svg>
                                <a href={listingForm.storagePolicyDocUrl} target="_blank" rel="noreferrer" className="underline truncate max-w-xs">
                                  View uploaded document ↗
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => setListingForm(prev => ({ ...prev, storagePolicyDocUrl: '' }))}
                                className="ml-3 text-xs text-red-500 hover:text-red-700 font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedCategory === 'events' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
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
              {/* Guest house / Hotel / Resort / Self-Catering → Check-in & Check-out */}
              {selectedCategory === 'property' && (selectedType === 'over' || selectedType === 'hotel' || selectedType === 'resort' || selectedType === 'land') && (
                <SectionCard title="Check-in & Check-out" subtitle="Set your standard check-in and check-out times so guests know when to arrive and depart.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group/form">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Check-in Time</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🛬</div>
                        <input
                          type="time"
                          value={listingForm.checkInTime}
                          onChange={(e) => setListingForm({ ...listingForm, checkInTime: e.target.value })}
                          className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-xs"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Earliest time guests may check in</p>
                    </div>
                    <div className="group/form">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Check-out Time</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🛫</div>
                        <input
                          type="time"
                          value={listingForm.checkOutTime}
                          onChange={(e) => setListingForm({ ...listingForm, checkOutTime: e.target.value })}
                          className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-xs"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Latest time guests must check out</p>
                    </div>
                  </div>
                </SectionCard>
              )}
              {/* Services / Experiences / Events → full weekly operating schedule */}
              {selectedCategory !== 'property' && (
              <SectionCard title="Operating Schedule" subtitle="Define when you are available for bookings so customers know when they can reach you.">
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div 
                      key={day}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${listingForm.operatingHours[day].closed ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xs'}`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2.5 min-w-[110px] w-full sm:w-auto">
                          <div className={`w-2.5 h-2.5 rounded-full ${listingForm.operatingHours[day].closed ? 'bg-gray-300 dark:bg-gray-600' : 'bg-emerald-500'}`} />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{day}</h3>
                        </div>
                        
                        {!listingForm.operatingHours[day].closed ? (
                          <div className="flex items-center gap-2.5 flex-1 justify-center bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Open</span>
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
                                className="px-2.5 py-1 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                              />
                            </div>
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Close</span>
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
                                className="px-2.5 py-1 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-center py-2 bg-gray-100/70 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-400">Closed</span>
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
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${listingForm.operatingHours[day].closed ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          {listingForm.operatingHours[day].closed ? 'Activate' : 'Deactivate'}
                        </button>
                      </div>
                    </div>
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
                  <p className="text-gray-600 dark:text-white mb-6">Select all that apply</p>
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

              </div>
            )}

            {/* Step 6: Services & Pricing */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <SectionCard title="Services & Pricing">
                  <p className="text-gray-600 dark:text-white mb-6">List the specific services you offer and their prices.</p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormInput
                        label="Category / Type"
                        placeholder="e.g. Cleaning, Transport"
                        id="newServiceType"
                        value={listingForm.newServiceType || ""}
                        onChange={(e) => setListingForm({...listingForm, newServiceType: e.target.value})}
                      />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                          placeholder="What is included in this service?"
                          value={listingForm.newServiceDescription || ""}
                          onChange={(e) => setListingForm({...listingForm, newServiceDescription: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-normal text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none shadow-xs"
                          rows="3"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 justify-center">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Service Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleServiceImageChange}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 cursor-pointer shadow-xs"
                        />
                        {serviceUploading && <span className="text-xs text-rose-500 font-semibold animate-pulse mt-1">Uploading photo...</span>}
                        {listingForm.newServiceImage && (
                          <div className="mt-2 flex items-center gap-2.5">
                            <img src={listingForm.newServiceImage} alt="Service preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Photo ready</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (listingForm.newServiceName && listingForm.newServicePrice) {
                          setListingForm({
                            ...listingForm,
                            serviceList: [...listingForm.serviceList, { 
                              type: listingForm.newServiceType || "",
                              name: listingForm.newServiceName, 
                              price: listingForm.newServicePrice,
                              description: listingForm.newServiceDescription || "",
                              image: listingForm.newServiceImage || "" 
                            }],
                            newServiceType: "",
                            newServiceName: "",
                            newServicePrice: "",
                            newServiceDescription: "",
                            newServiceImage: ""
                          });
                        }
                      }}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      + Add Service
                    </button>

                    {listingForm.serviceList.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Your Added Services</h3>
                        <div className="space-y-2.5">
                          {listingForm.serviceList.map((service, index) => (
                            <div key={index} className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-3">
                                {service.image && (
                                  <img src={service.image} alt={service.name} className="w-12 h-12 object-cover rounded-lg border bg-white dark:bg-gray-900 shadow-xs" />
                                )}
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{service.name}</p>
                                    {service.type && (
                                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[10px] font-semibold uppercase tracking-wider rounded-md">
                                        {service.type}
                                      </span>
                                    )}
                                  </div>
                                  {service.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs md:max-w-md">{service.description}</p>
                                  )}
                                  <p className="text-rose-600 dark:text-rose-400 font-bold text-xs mt-0.5">R{service.price}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setListingForm({
                                  ...listingForm,
                                  serviceList: listingForm.serviceList.filter((_, i) => i !== index)
                                })}
                                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
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
                  <p className="text-gray-600 dark:text-white mb-6">Introduce the people who will be performing the services.</p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div className="flex flex-col gap-4 p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-20 h-20 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs flex-shrink-0">
                          {performerUploading ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-rose-500 border-t-transparent"></div>
                              <span className="text-[10px] font-semibold text-rose-500">Uploading</span>
                            </div>
                          ) : listingForm.newPerformerImage ? (
                            <img src={listingForm.newPerformerImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <CameraIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Member Photo</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Choose a clear photo from your device.</p>
                          
                          <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-xs">
                            <PlusIcon className="w-3.5 h-3.5" />
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
                      className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {performerUploading ? "Uploading Photo..." : "+ Add Team Member"}
                    </button>

                    {listingForm.performers.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listingForm.performers.map((performer, index) => (
                          <div key={index} className="p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <img src={performer.image} alt={performer.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{performer.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{performer.experience}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setListingForm({
                                ...listingForm,
                                performers: listingForm.performers.filter((_, i) => i !== index)
                              })}
                              className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
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
                  <p className="text-gray-600 dark:text-white mb-6">You'll need at least 1 photo to get started (upload up to 20 photos).</p>
                  
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
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Uploaded photos</h3>
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
                              className="absolute top-2 right-2 bg-white dark:bg-gray-900 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="w-4 h-4 text-gray-900 dark:text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add a video (optional)</h3>
                    <p className="text-gray-600 dark:text-white text-sm mb-4">Show guests what your place looks like</p>
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
              </div>
            )}

            {/* Step 9: Pricing & Offers */}
            {currentStep === 9 && (
              <div className="space-y-8">
                <SectionCard title="Set your price">
                  <p className="text-gray-600 dark:text-white mb-8 leading-relaxed font-medium">
                    {selectedCategory === 'property'
                      ? "Set a competitive price for your property. Transparent pricing attracts the best guests and tenants."
                      : selectedCategory === 'events'
                      ? "Set your ticket or entry price. Enter R0 if your event is free for the community."
                      : selectedCategory === 'selling'
                      ? "Set the price you want for your item. You can offer promotional discounts anytime."
                      : "Define your base service rate. Clear upfront pricing builds trust with customers."}
                  </p>

                  <div className="bg-white dark:bg-gray-800/40 p-5 sm:p-7 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
                    <div className="max-w-md">
                      <FormInput
                        label={getPricingLabel()}
                        type="number"
                        id="regularPrice"
                        value={listingForm.regularPrice}
                        onChange={handleFormChange}
                        placeholder="e.g. 500"
                        required
                        helpText={selectedCategory === 'property' ? "Specify rate in South African Rand (ZAR / R)" : ""}
                      />
                    </div>

                    <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
                      <label className="flex items-center gap-3.5 cursor-pointer p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-xs">
                        <input
                          type="checkbox"
                          id="offer"
                          checked={listingForm.offer}
                          onChange={handleFormChange}
                          className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm block">
                            Offer a promotional discount
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Give first-time customers or special bookings a discounted price
                          </span>
                        </div>
                      </label>

                      {listingForm.offer && (
                        <div className="mt-3.5 p-4 sm:p-5 bg-white dark:bg-gray-900 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-3.5">
                          <FormInput
                            label="Discounted Promotional Price (R)"
                            type="number"
                            id="discountPrice"
                            value={listingForm.discountPrice}
                            onChange={handleFormChange}
                            placeholder="e.g. 400"
                          />
                          {+listingForm.regularPrice > 0 && +listingForm.discountPrice > 0 && +listingForm.discountPrice < +listingForm.regularPrice && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>
                                Guests save R{(+listingForm.regularPrice - +listingForm.discountPrice).toLocaleString()} ({Math.round(((+listingForm.regularPrice - +listingForm.discountPrice) / +listingForm.regularPrice) * 100)}% off regular price)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Tips Card */}
                  <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/60 flex items-start gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                      <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Protected Payouts via PayFast</p>
                      <p>
                        All bookings and payments are secured. Your earnings are credited directly upon successful completion of the booking or stay.
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 10: Review & Submit */}
            {currentStep === 10 && (
              <div className="space-y-8">
                <SectionCard title="Review your listing">
                  <div className="space-y-6">
                    {/* Visual Preview Header Card */}
                    {listingForm.imageUrls.length > 0 && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video max-h-56 sm:max-h-64 border border-gray-200 dark:border-gray-800 shadow-sm group">
                        <img 
                          src={listingForm.imageUrls[0]} 
                          alt={listingForm.name || "Listing preview"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-xs font-semibold capitalize">
                              {selectedCategory}
                            </span>
                            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-medium capitalize">
                              {selectedType}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold truncate">{listingForm.name || "Untitled Listing"}</h3>
                          <p className="text-xs sm:text-sm text-gray-200 truncate mt-0.5">{listingForm.address}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">Listing Summary</h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                        >
                          Edit Details
                        </button>
                      </div>

                      <div className="space-y-2.5 text-xs sm:text-sm">
                        <div className="flex justify-between py-1.5 border-b border-gray-200/80 dark:border-gray-700/60">
                          <span className="text-gray-500 dark:text-gray-400">Category & Type</span>
                          <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedCategory} · {selectedType}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-200/80 dark:border-gray-700/60">
                          <span className="text-gray-500 dark:text-gray-400">Title</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs truncate">{listingForm.name}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-200/80 dark:border-gray-700/60">
                          <span className="text-gray-500 dark:text-gray-400">Host / Provider</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs">{listingForm.host}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-200/80 dark:border-gray-700/60">
                          <span className="text-gray-500 dark:text-gray-400">Contact Number</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{listingForm.contact}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-200/80 dark:border-gray-700/60">
                          <span className="text-gray-500 dark:text-gray-400">Location</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs truncate">{listingForm.address}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-gray-500 dark:text-gray-400">Base Price</span>
                          <div className="flex items-center gap-2">
                            {listingForm.offer && listingForm.discountPrice ? (
                              <>
                                <span className="line-through text-gray-400 text-xs">R{listingForm.regularPrice}</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">R{listingForm.discountPrice}</span>
                              </>
                            ) : (
                              <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">R{listingForm.regularPrice}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentStep(9)}
                              className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline ml-2 cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        {selectedCategory === 'property' && ['over', 'hotel', 'resort', 'land'].includes(selectedType) && (
                          <div className="pt-2 border-t border-gray-200/80 dark:border-gray-700/60 flex justify-between text-xs text-gray-600 dark:text-gray-300">
                            <span>Check-in: <strong>{listingForm.checkInTime}</strong></span>
                            <span>Check-out: <strong>{listingForm.checkOutTime}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photos Count Preview */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        <CameraIcon className="w-5 h-5 text-rose-500" />
                        <span>{listingForm.imageUrls.length} photo{listingForm.imageUrls.length > 1 ? 's' : ''} uploaded</span>
                        {listingForm.videoUrl && <span className="text-xs text-gray-400">· 1 video included</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(8)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                      >
                        Edit Media
                      </button>
                    </div>

                    {(selectedCategory === 'experiences' || selectedCategory === 'online') && (
                      <>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-4 sm:p-5">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2.5">Provider Details</h3>
                          <div className="space-y-1.5 text-xs sm:text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-200/80 dark:border-gray-700/60">
                              <span className="text-gray-500 dark:text-gray-400">Entity:</span>
                              <span className="font-semibold text-gray-900 dark:text-white capitalize">{listingForm.providerType || "Individual"}</span>
                            </div>
                            {listingForm.providerType === 'individual' && listingForm.citizenship && (
                              <div className="flex justify-between py-1">
                                <span className="text-gray-500 dark:text-gray-400">Citizenship:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{listingForm.citizenship}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {listingForm.serviceList && listingForm.serviceList.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-4 sm:p-5">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2.5">Services Offered</h3>
                            <div className="space-y-1.5 text-xs sm:text-sm">
                              {listingForm.serviceList.map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-200/80 dark:border-gray-700/60 last:border-0 gap-4">
                                  <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
                                  <span className="font-bold text-rose-600 dark:text-rose-400">R{s.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Amenities summary */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-4 sm:p-5">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2.5">Selected Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {getAmenitiesByCategory()
                          .filter(amenity => listingForm[amenity.id])
                          .map(amenity => (
                            <span key={amenity.id} className="px-3 py-1 bg-white dark:bg-gray-900 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-1.5">
                              <span>{amenity.emoji}</span>
                              <span>{amenity.label}</span>
                            </span>
                          ))}
                        {getAmenitiesByCategory().filter(amenity => listingForm[amenity.id]).length === 0 && (
                          <p className="text-gray-400 text-xs italic">No specific amenities selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-5 flex gap-3.5">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm mb-0.5">Terms & Guarantee</h4>
                    <p className="text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
                      By publishing this listing, you confirm that your offering meets our safety and quality standards. You can edit, manage, or pause this listing anytime from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Airbnb Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-40 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
              {/* Progress Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
                <div 
                  className="h-full bg-gray-900 dark:bg-white transition-all duration-300 ease-out"
                  style={{ width: `${Math.round(((currStepIdx + 1) / visibleSteps.length) * 100)}%` }}
                />
              </div>

              <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
                {/* Airbnb Signature Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (currStepIdx > 0) {
                      handlePrevStep();
                    } else {
                      navigate('/user-listings');
                    }
                  }}
                  className="font-bold text-sm sm:text-base text-gray-900 dark:text-white underline underline-offset-4 hover:opacity-75 transition-opacity flex items-center gap-2 cursor-pointer py-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Step {currStepIdx + 1} of {visibleSteps.length}</span>
                </div>

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={currentStep === 1 && !selectedCategory}
                    className="px-6 sm:px-8 py-3 bg-gray-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm shadow-sm cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-7 sm:px-9 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Publish Listing</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-10 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Having trouble? <button type="button" onClick={() => navigate('/help-center')} className="underline font-medium text-gray-900 dark:text-white hover:text-rose-600 transition-colors">Get help</button>
          </p>
        </div>
      </main>

      {/* Upload Progress Modal */}
      {uploading && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-xl relative overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800">
               <motion.div 
                 className="h-full bg-rose-500"
                 initial={{ width: 0 }}
                 animate={{ width: `${uploadProgress}%` }}
               />
            </div>
            
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CameraIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Uploading Media</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{Math.round(uploadProgress)}% completed. Please keep this page open.</p>
            
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Promotion Popup */}
      {showPromotionPopup && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl my-auto border border-gray-200 dark:border-gray-800"
          >
            {promotionSteps === 0 && (
              <div className="p-8 sm:p-10 text-center">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                   Listing Published Successfully! 🎉
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
                  Your listing is now live. Boost your visibility to reach more potential guests and customers faster.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 cursor-pointer"
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
                    className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    View Listing
                  </button>
                </div>
              </div>
            )}

            {promotionSteps === 1 && (
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Choose a Boost Plan</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-6">Select a promotion package to increase your views and inquiries</p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { id: 'standard', price: 40, multiplier: '25x', days: '7 days', features: ['25x visibility multiplier', 'Featured category placement', 'Verified badge', '7 days duration'] },
                    { id: 'premium', price: 100, multiplier: '80x', days: '14 days', features: ['80x visibility multiplier', 'Homepage spotlight feature', 'Elite featured badge', '14 days duration', 'Priority support'] }
                  ].map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setPromotionPackage(pkg.id)}
                      className={`
                        p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 relative
                        ${promotionPackage === pkg.id 
                          ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-gray-800 text-white shadow-sm' 
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className={`font-bold text-lg capitalize mb-0.5 ${promotionPackage === pkg.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{pkg.id}</h4>
                          <span className={`text-xs font-semibold ${promotionPackage === pkg.id ? 'text-rose-400' : 'text-rose-500'}`}>{pkg.multiplier} Reach</span>
                        </div>
                        <span className={`text-xl font-bold ${promotionPackage === pkg.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>R{pkg.price}</span>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            <CheckCircleIcon className={`w-4 h-4 shrink-0 ${promotionPackage === pkg.id ? 'text-rose-400' : 'text-rose-500'}`} />
                            <span className={promotionPackage === pkg.id ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setPromotionSteps(0)}
                    className="px-6 py-3 text-gray-900 dark:text-white font-medium underline underline-offset-4"
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete payment</h3>
                <p className="text-gray-600 dark:text-white mb-6">You will complete payment securely on PayFast. loopOut never receives or stores your card details.</p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{promotionPackage} promotion</span>
                    <span className="text-xl font-bold">R{promotionPackage === 'standard' ? '40' : '100'}</span>
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
                  <ShieldCheckIcon className="h-5 w-5 shrink-0" />
                  Secure hosted checkout by PayFast
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-6 py-3 text-gray-900 dark:text-white font-medium underline underline-offset-4"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePromoteListing}
                    disabled={!promotionPackage}
                    className={`
                      px-8 py-3 rounded-lg font-semibold transition-all
                      ${promotionPackage ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    Continue to secure payment
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
