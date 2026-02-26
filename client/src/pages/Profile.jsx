/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { 
  MdLocationOn, 
  MdVerifiedUser, 
  MdLanguage,
  MdCalendarToday,
  MdEmail,
  MdPhone,
  MdLink,
  MdLock,
  MdHelpOutline,
  MdPeople,
  MdShare,
  MdSecurity,
  MdLogout,
  MdEdit,
  MdArrowForward,
  MdAdd,
  MdDelete,
  MdCameraAlt
} from 'react-icons/md';
import { 
  FaBath, 
  FaBed, 
  FaShieldAlt,
  FaBell,
  FaHome,
  FaHeart,
  FaList,
  FaCog,
  FaShareAlt,
  FaTrash,
  FaCamera,
  FaWhatsapp,
  FaUsers,
  FaGift,
  FaHandshake,
  FaBalanceScale,
  FaUserPlus,
  FaUserCheck,
  FaStar,
  FaComment,
  FaBook,
  FaUserFriends,
  FaHandsHelping,
  FaQuestionCircle,
  FaUserTie,
  FaBuilding,
  FaChartLine,
  FaWallet,
  FaCrown,
  FaTools,
  FaClipboardCheck
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import WishList from "./WishListProfile";
import MyListing from "./MyListing";
import { Camera, CheckCircle, X, MessageCircle, Mail, Phone, ChevronRight, Globe, Shield, Bell, User, Home, Heart, List, Settings, LogOut, Plus, Trash2, Edit3, MapPin, Calendar, Star, Award, HelpCircle, Download, ChartBarIcon, Gift } from 'lucide-react';

// Airbnb Color Palette
const colors = {
  primary: '#FF5A5F',      // Airbnb Rausch
  primaryDark: '#E00B41',
  secondary: '#00A699',    // Teal
  dark: '#484848',         // Dark gray
  gray: '#767676',         // Medium gray
  lightGray: '#DDDDDD',    // Light gray
  lighterGray: '#F7F7F7',  // Background gray
  white: '#FFFFFF',
  success: '#00A699',
  error: '#FC642D',
};

// Reusable InputField Component - Airbnb Style
const InputField = ({ label, id, type = "text", value, handleChange, helperText, placeholder, icon: Icon }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-semibold text-[#484848] mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#767676]">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        id={id}
        className={`w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F] transition-all outline-none text-[#484848] placeholder-[#767676] ${Icon ? 'pl-10' : ''}`}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
      />
    </div>
    {helperText && <p className="mt-2 text-sm text-[#767676]">{helperText}</p>}
  </div>
);

// Airbnb Toggle Switch
const ToggleSwitch = ({ enabled, setEnabled }) => (
  <button
    type="button"
    onClick={() => setEnabled(!enabled)}
    className={`${enabled ? 'bg-[#FF5A5F]' : 'bg-[#DDDDDD]'
      } relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
    role="switch"
    aria-checked={enabled}
  >
    <span
      aria-hidden="true"
      className={`${enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

// Airbnb Checkbox
const Checkbox = ({ label, checked, onChange, helperText }) => (
  <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-[#F7F7F7] rounded-lg transition-colors">
    <input
      type="checkbox"
      className="form-checkbox h-5 w-5 text-[#FF5A5F] rounded border-[#DDDDDD] focus:ring-[#FF5A5F]"
      checked={checked}
      onChange={onChange}
    />
    <div className="flex-1">
      <span className="text-[#484848] font-medium text-sm">{label}</span>
      {helperText && <p className="text-sm text-[#767676] mt-1">{helperText}</p>}
    </div>
  </label>
);

// Airbnb Section Card
const SectionCard = ({ children, title, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-[#DDDDDD] shadow-sm p-6 mb-6">
    {title && (
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#DDDDDD]">
        {Icon && <Icon className="text-[#FF5A5F]" size={24} />}
        <h3 className="text-xl font-bold text-[#484848]">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// Airbnb Menu Item
const MenuItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all duration-200 ${active
        ? "bg-[#F7F7F7] text-[#FF5A5F] font-semibold"
        : "text-[#484848] hover:bg-[#F7F7F7]"
      }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span>{label}</span>
    </div>
    {badge ? (
      <span className="bg-[#FF5A5F] text-white text-xs px-2 py-1 rounded-full">
        {badge}
      </span>
    ) : (
      <ChevronRight size={16} className={`${active ? 'text-[#FF5A5F]' : 'text-[#767676]'}`} />
    )}
  </button>
);

// Airbnb Settings Row
const SettingsRow = ({ icon: Icon, title, description, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full p-4 hover:bg-[#F7F7F7] transition-colors border-b border-[#DDDDDD] last:border-b-0`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-[#F7F7F7]'}`}>
        <Icon size={20} className={danger ? 'text-red-500' : 'text-[#484848]'} />
      </div>
      <div className="text-left">
        <h4 className={`font-medium ${danger ? 'text-red-500' : 'text-[#484848]'}`}>{title}</h4>
        <p className="text-sm text-[#767676]">{description}</p>
      </div>
    </div>
    <ChevronRight size={20} className="text-[#767676]" />
  </button>
);

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState(3);
  const [userEvents, setUserEvents] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [visibleEvents, setVisibleEvents] = useState(3);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ rental: 0, sale: 0, overnight: 0 });
  const [fetchError, setFetchError] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('');
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [contactVisibility, setContactVisibility] = useState('private');
  const fileRef = useRef(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [isHovering, setIsHovering] = useState(false);
  const safeUserEvents = Array.isArray(userEvents) ? userEvents : [];

  // WhatsApp integration states
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);

  // Face Recognition States
  const [faceUploadPerc, setFaceUploadPerc] = useState(0);
  const [faceUploadError, setFaceUploadError] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoadingError, setModelLoadingError] = useState(null);
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize face verification state from user data
  useEffect(() => {
    if (currentUser?.faceData) {
      setFaceData(currentUser.faceData);
      setIsFaceVerified(true);
    }
    if (currentUser?.whatsappNumber) {
      setWhatsappNumber(currentUser.whatsappNumber);
      setWhatsappConnected(true);
      setWhatsappVerified(currentUser.whatsappVerified || false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  // Fetch user events and post count
  useEffect(() => {
    if (currentUser) {
      fetchUserEvents();
      fetchPostCount();
    }
  }, [currentUser]);

  const fetchUserEvents = async () => {
    try {
      const res = await fetch(`/api/user/events/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        console.error('Error fetching events:', data.message);
        return;
      }
      setUserEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchPostCount = async () => {
    try {
      const res = await fetch(`/api/user/post-count/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        console.error('Error fetching post count:', data.message);
        return;
      }
      setPostCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching post count:', error);
    }
  };

  const [sharedInfo, setSharedInfo] = useState({
    bookingHistory: false,
    reviews: true,
    socialConnections: false
  });

  const [dataSharing, setDataSharing] = useState({
    marketing: true,
    research: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    activityAlerts: true
  });

  const toggleSharedInfo = (field) => {
    setSharedInfo(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleDataSharing = (field) => {
    setDataSharing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleSecurity = (field) => {
    setSecuritySettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // WhatsApp Integration Functions
  const handleConnectWhatsApp = () => {
    const defaultMessage = `Hello! I'd like to connect my WhatsApp number for booking notifications. My username is ${currentUser?.username || 'User'}.`;
    const phoneNumber = whatsappNumber || currentUser?.phone || '';
    
    if (!phoneNumber) {
      alert('Please add a phone number in your profile first');
      return;
    }

    // Format WhatsApp number
    let num = phoneNumber.replace(/\D/g, '');
    let formattedNumber;
    
    if (num.startsWith('27') && num.length === 11) {
      formattedNumber = num;
    } else {
      if (!num.startsWith('0')) num = '0' + num;
      if (num.length > 10) num = num.substring(num.length - 10);
      if (num.length < 10) num = num.padEnd(10, '0');
      formattedNumber = num.replace(/^0/, '27');
    }
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleVerifyWhatsApp = async () => {
    try {
      const res = await fetch(`/api/user/verify-whatsapp/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsappNumber })
      });
      
      const data = await res.json();
      if (data.success) {
        setWhatsappVerified(true);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('WhatsApp verification error:', error);
      alert('Failed to verify WhatsApp number');
    }
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      if (!faceRecognitionEnabled) {
        setFaceUploadError("Face recognition is not properly configured.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setFaceUploadError(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setFaceUploadError("Camera access denied.");
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setFaceUploadError("Camera not ready.");
      return;
    }

    setIsProcessing(true);
    setFaceUploadError(false);

    try {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setFaceUploadError("Failed to capture image.");
          setIsProcessing(false);
          return;
        }

        const file = new File([blob], `verification_${Date.now()}.jpg`, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        await processCameraCapture(file);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error("Capture error:", error);
      setFaceUploadError("Failed to capture image.");
      setIsProcessing(false);
    }
  };

  const processCameraCapture = async (file) => {
    try {
      setIsProcessing(true);
      setFaceUploadError(false);

      const storage = getStorage(app);
      const fileName = `verification_${currentUser._id}_${new Date().getTime()}.jpg`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFaceUploadPerc(Math.round(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          setFaceUploadError("Upload failed: " + error.message);
          setIsProcessing(false);
          stopCamera();
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const newFaceData = {
              imageUrl: downloadURL,
              verified: true,
              verifiedAt: new Date().toISOString(),
              method: 'camera'
            };
            
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                faceData: newFaceData
              }),
            });

            const data = await res.json();
            if (data.success === false) {
              setFaceUploadError("Failed to save verification: " + data.message);
              setIsProcessing(false);
              stopCamera();
              return;
            }

            setFaceData(newFaceData);
            setIsFaceVerified(true);
            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
          } catch (error) {
            console.error("Download URL error:", error);
            setFaceUploadError("Processing failed: " + error.message);
            setIsProcessing(false);
            stopCamera();
          }
        }
      );
    } catch (error) {
      console.error("Process capture error:", error);
      setFaceUploadError("Processing failed: " + error.message);
      setIsProcessing(false);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const removeFaceData = async () => {
    try {
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          faceData: null
        }),
      });

      const data = await res.json();
      if (data.success === false) {
        setFaceUploadError("Failed to remove verification: " + data.message);
        return;
      }

      setFaceData(null);
      setIsFaceVerified(false);
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error removing face data:", error);
      setFaceUploadError("Failed to remove verification");
    }
  };

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
        setFileUploadError(false);
      },
      (error) => {
        setFileUploadError(true);
        console.error("File upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
          setFileUploadError(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
      fetchPostCount();
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      const res = await fetch(`/api/event/delete/${eventId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserEvents((prev) => prev.filter((event) => event._id !== eventId));
      fetchPostCount();
    } catch (error) {
      console.log(error.message);
    }
  };

  const [notifications, setNotifications] = useState({
    security: {
      loginAttempts: true,
      passwordChanges: true
    },
    activity: {
      bookingUpdates: true,
      paymentReceipts: true
    },
    promotions: {
      specialOffers: false,
      platformUpdates: true
    }
  });

  const toggleNotification = (category, type) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  const loadMoreListings = () => {
    setVisibleListings((prev) => prev + 3);
  };

  const loadMoreEvents = () => {
    setVisibleEvents((prev) => prev + 3);
  };

  // Navigation handlers
  const handleNavigateToBookings = () => {
    navigate('/my-bookings');
  };

  const handleNavigateToReviews = () => {
    navigate('/my-reviews');
  };

  const handleNavigateToMessages = () => {
    navigate('/messages');
  };

  const handleNavigateToHelp = () => {
    navigate('/help-center');
  };

  const handleNavigateToReferrals = () => {
    navigate('/referrals');
  };

  const handleNavigateToCoHost = () => {
    navigate('/find-cohost');
  };

  const handleNavigateToLegal = () => {
    navigate('/legal');
  };

  const handleNavigateToHostDashboard = () => {
    navigate('/host-dashboard');
  };

  const handleNavigateToEarnings = () => {
    navigate('/host-earnings');
  };

  const handleNavigateToHostTools = () => {
    navigate('/host-tools');
  };

  const handleNavigateToVerification = () => {
    navigate('/verification');
  };

  // View Profile Modal
  const [showViewProfile, setShowViewProfile] = useState(false);

  // WhatsApp connection modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Airbnb-style Header - Fixed at top */}
      <div className="border-b border-[#DDDDDD] fixed top-0 left-0 right-0 bg-white z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#484848]">Account</h1>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="max-w-6xl mx-auto px-4 pt-24 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Airbnb Style */}
          <div className="lg:col-span-3">
            <div className=" top-28">
              {/* Profile Summary Card */}
              <div className="bg-white rounded-xl border border-[#DDDDDD] p-6 mb-6 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-[#DDDDDD]"
                  />
                  {isFaceVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-[#00A699] text-white p-1.5 rounded-full border-2 border-white">
                      <Shield size={14} />
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current.click()}
                    className="absolute bottom-0 right-0 bg-white border border-[#DDDDDD] p-1.5 rounded-full shadow-sm hover:bg-[#F7F7F7] transition-colors"
                  >
                    <Camera size={14} className="text-[#484848]" />
                  </button>
                  <input
                    type="file"
                    hidden
                    ref={fileRef}
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
                <h2 className="font-bold text-lg text-[#484848]">{currentUser?.username || 'User'}</h2>
                <p className="text-sm text-[#767676] mt-1">{currentUser?.email || 'user@example.com'}</p>
                
                {isFaceVerified && (
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-[#00A699] font-medium bg-[#00A699]/10 px-3 py-1 rounded-full">
                    <Shield size={14} />
                    Identity verified
                  </div>
                )}
              </div>

              {/* Navigation Menu */}
              <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
                <div className="p-2">
                  <MenuItem
                    icon={User}
                    label="Personal info"
                    active={activeSection === "personal"}
                    onClick={() => setActiveSection("personal")}
                  />
                  <MenuItem
                    icon={Shield}
                    label="Login & security"
                    active={activeSection === "login"}
                    onClick={() => setActiveSection("login")}
                  />
                  <MenuItem
                    icon={Bell}
                    label="Notifications"
                    active={activeSection === "notifications"}
                    onClick={() => setActiveSection("notifications")}
                  />
                  <MenuItem
                    icon={Globe}
                    label="Privacy & sharing"
                    active={activeSection === "privacy"}
                    onClick={() => setActiveSection("privacy")}
                  />
                  <MenuItem
                    icon={Home}
                    label="Host dashboard"
                    active={activeSection === "host-account"}
                    onClick={() => setActiveSection("host-account")}
                  />
                  <MenuItem
                    icon={Heart}
                    label="Wishlists"
                    active={activeSection === "wishlist"}
                    onClick={() => setActiveSection("wishlist")}
                  />
                  <MenuItem
                    icon={List}
                    label="My listings"
                    active={activeSection === "my-listings"}
                    onClick={() => setActiveSection("my-listings")}
                    badge={userListings?.length || 0}
                  />
                  <MenuItem
                    icon={Calendar}
                    label="My events"
                    active={activeSection === "events"}
                    onClick={() => setActiveSection("events")}
                    badge={postCount || 0}
                  />
                </div>
                
                <div className="border-t border-[#DDDDDD] p-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-[#484848] hover:bg-[#F7F7F7] transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-6 bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
                <SettingsRow
                  icon={HelpCircle}
                  title="Get help"
                  description="Contact support"
                  onClick={handleNavigateToHelp}
                />
                <SettingsRow
                  icon={Gift}
                  title="Refer a friend"
                  description="Earn travel credits"
                  onClick={handleNavigateToReferrals}
                />
              </div>
            </div>
          </div>

          {/* Main Content - Airbnb Style */}
          <div className="lg:col-span-9">
            {/* Personal Info Section */}
            {activeSection === "personal" && (
              <>
                <SectionCard title="Personal info" icon={User}>
                  <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Legal name"
                          id="username"
                          value={formData.username || currentUser?.username || ''}
                          handleChange={handleChange}
                          icon={User}
                        />
                        <InputField
                          label="Email address"
                          type="email"
                          id="email"
                          value={formData.email || currentUser?.email || ''}
                          handleChange={handleChange}
                          icon={Mail}
                        />
                      </div>

                      <InputField
                        label="Phone number"
                        type="tel"
                        id="phone"
                        value={formData.phone || currentUser?.phone || ''}
                        handleChange={handleChange}
                        icon={Phone}
                      />

                      <InputField
                        label="Where you live"
                        id="location"
                        value={formData.location || currentUser?.location || ''}
                        handleChange={handleChange}
                        icon={MapPin}
                      />

                      <div className="pt-4 border-t border-[#DDDDDD]">
                        <label className="block text-sm font-semibold text-[#484848] mb-2">About</label>
                        <textarea
                          id="bio"
                          rows={4}
                          className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F] transition-all outline-none text-[#484848] resize-none"
                          value={formData.bio || currentUser?.bio || ''}
                          onChange={handleChange}
                          placeholder="Tell guests about yourself..."
                        />
                      </div>

                      {/* Identity Verification Section */}
                      <div className="pt-6 border-t border-[#DDDDDD]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-[#484848]">Identity verification</h4>
                            <p className="text-sm text-[#767676] mt-1">
                              Show others you're really you with identity verification
                            </p>
                          </div>
                          {!isFaceVerified ? (
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 py-2 border border-[#484848] rounded-lg text-[#484848] font-medium hover:bg-[#F7F7F7] transition-colors"
                            >
                              Verify
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#00A699] font-medium">
                              <CheckCircle size={18} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp Section */}
                      <div className="pt-6 border-t border-[#DDDDDD]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-[#484848]">WhatsApp</h4>
                            <p className="text-sm text-[#767676] mt-1">
                              Receive booking updates via WhatsApp
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowWhatsAppModal(true)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${whatsappConnected ? 'text-[#00A699] border border-[#00A699] hover:bg-[#00A699]/10' : 'border border-[#484848] text-[#484848] hover:bg-[#F7F7F7]'}`}
                          >
                            {whatsappConnected ? 'Manage' : 'Connect'}
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            'Save changes'
                          )}
                        </button>
                      </div>
                    </form>

                    {updateSuccess && (
                      <div className="mt-4 p-4 bg-[#00A699]/10 border border-[#00A699] rounded-lg">
                        <p className="text-[#00A699] flex items-center gap-2 font-medium">
                          <CheckCircle size={18} />
                          Profile updated successfully
                        </p>
                      </div>
                    )}
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 flex items-center gap-2">
                          <X size={18} />
                          {error}
                        </p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </>
            )}

            {/* Login & Security Section */}
            {activeSection === "login" && (
              <SectionCard title="Login & security" icon={Shield}>
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h4 className="font-semibold text-[#484848] mb-4">Password</h4>
                    <div className="space-y-4">
                      <InputField
                        label="Current password"
                        type="password"
                        id="currentPassword"
                        handleChange={handleChange}
                      />
                      <InputField
                        label="New password"
                        type="password"
                        id="newPassword"
                        handleChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#DDDDDD]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#484848]">Two-factor authentication</h4>
                        <p className="text-sm text-[#767676] mt-1">
                          Add an extra layer of security
                        </p>
                      </div>
                      <ToggleSwitch enabled={twoFactorEnabled} setEnabled={setTwoFactorEnabled} />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button className="bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      Save changes
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <SectionCard title="Notifications" icon={Bell}>
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#484848] mb-4">Email notifications</h4>
                    <div className="space-y-2">
                      <Checkbox
                        label="Booking updates"
                        checked={notifications.activity.bookingUpdates}
                        onChange={() => toggleNotification('activity', 'bookingUpdates')}
                        helperText="Stay informed about your booking status"
                      />
                      <Checkbox
                        label="Payment receipts"
                        checked={notifications.activity.paymentReceipts}
                        onChange={() => toggleNotification('activity', 'paymentReceipts')}
                        helperText="Receive confirmation for all your payments"
                      />
                      <Checkbox
                        label="Promotions and offers"
                        checked={notifications.promotions.specialOffers}
                        onChange={() => toggleNotification('promotions', 'specialOffers')}
                        helperText="Get exclusive deals and discounts"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#DDDDDD]">
                    <h4 className="font-semibold text-[#484848] mb-4">Security alerts</h4>
                    <div className="space-y-2">
                      <Checkbox
                        label="Login attempts"
                        checked={notifications.security.loginAttempts}
                        onChange={() => toggleNotification('security', 'loginAttempts')}
                        helperText="Get notified about suspicious login activities"
                      />
                      <Checkbox
                        label="Password changes"
                        checked={notifications.security.passwordChanges}
                        onChange={() => toggleNotification('security', 'passwordChanges')}
                        helperText="Receive alerts for any password modifications"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button className="bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      Save preferences
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <SectionCard title="Privacy & sharing" icon={Globe}>
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h4 className="font-semibold text-[#484848] mb-4">Profile visibility</h4>
                    <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                      <div>
                        <p className="font-medium text-[#484848]">Make my profile public</p>
                        <p className="text-sm text-[#767676]">Allow others to see your profile</p>
                      </div>
                      <ToggleSwitch enabled={profileVisibility} setEnabled={setProfileVisibility} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#DDDDDD]">
                    <h4 className="font-semibold text-[#484848] mb-4">Data management</h4>
                    <div className="space-y-3">
                      <button className="flex items-center justify-between w-full p-4 border border-[#DDDDDD] rounded-lg hover:bg-[#F7F7F7] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center">
                            <Download size={20} className="text-[#484848]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-[#484848]">Download your data</p>
                            <p className="text-sm text-[#767676]">Get a copy of your personal information</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-[#767676]" />
                      </button>

                      <button
                        onClick={handleDeleteUser}
                        className="flex items-center justify-between w-full p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <Trash2 size={20} className="text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-red-600">Delete account</p>
                            <p className="text-sm text-red-400">Permanently remove your account</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Host Dashboard Section */}
            {activeSection === "host-account" && (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl border border-[#DDDDDD] p-6">
                    <p className="text-sm text-[#767676] mb-1">Total listings</p>
                    <p className="text-3xl font-bold text-[#484848]">{userListings?.length || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#DDDDDD] p-6">
                    <p className="text-sm text-[#767676] mb-1">Total earnings</p>
                    <p className="text-3xl font-bold text-[#484848]">R0</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#DDDDDD] p-6">
                    <p className="text-sm text-[#767676] mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-[#484848]">0.0</p>
                      <Star size={20} className="text-[#FF5A5F] fill-[#FF5A5F]" />
                    </div>
                  </div>
                </div>

                <SectionCard title="Hosting tools" icon={Home}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleNavigateToHostDashboard}
                      className="p-6 border border-[#DDDDDD] rounded-xl hover:border-[#FF5A5F] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4 group-hover:bg-[#FF5A5F]/10">
                        <ChartBarIcon size={24} className="text-[#FF5A5F]" />
                      </div>
                      <h4 className="font-semibold text-[#484848] mb-1">Dashboard</h4>
                      <p className="text-sm text-[#767676]">View performance insights</p>
                    </button>

                    <button
                      onClick={handleNavigateToEarnings}
                      className="p-6 border border-[#DDDDDD] rounded-xl hover:border-[#FF5A5F] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4 group-hover:bg-[#FF5A5F]/10">
                        <Wallet size={24} className="text-[#FF5A5F]" />
                      </div>
                      <h4 className="font-semibold text-[#484848] mb-1">Earnings</h4>
                      <p className="text-sm text-[#767676]">Track income & payments</p>
                    </button>

                    <button
                      onClick={handleNavigateToHostTools}
                      className="p-6 border border-[#DDDDDD] rounded-xl hover:border-[#FF5A5F] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4 group-hover:bg-[#FF5A5F]/10">
                        <FaTools size={24} className="text-[#FF5A5F]" />
                      </div>
                      <h4 className="font-semibold text-[#484848] mb-1">Tools</h4>
                      <p className="text-sm text-[#767676]">Manage listings & bookings</p>
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#DDDDDD]">
                    <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Award size={24} className="text-[#FF5A5F]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#484848]">Become a Superhost</p>
                          <p className="text-sm text-[#767676]">Complete verification to start hosting</p>
                        </div>
                      </div>
                      <button
                        onClick={handleNavigateToVerification}
                        className="px-4 py-2 bg-[#FF5A5F] text-white rounded-lg font-medium hover:bg-[#E00B41] transition-colors"
                      >
                        Get started
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Wishlist Section */}
            {activeSection === "wishlist" && (
              <SectionCard title="Wishlists" icon={Heart}>
                <p className="text-[#767676] mb-6">Places you've saved for future trips</p>
                <WishList />
              </SectionCard>
            )}

            {/* My Listings Section */}
            {activeSection === "my-listings" && (
              <SectionCard title="My listings" icon={List}>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[#767676]">Manage your properties</p>
                  <Link
                    to={`/${currentUser?._id}/create-listing`}
                    className="flex items-center gap-2 bg-[#FF5A5F] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E00B41] transition-colors"
                  >
                    <Plus size={18} />
                    Create listing
                  </Link>
                </div>

                {userListings && userListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userListings.slice(0, visibleListings).map((listing) => (
                      <div
                        key={listing._id}
                        className="border border-[#DDDDDD] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-48">
                          <img
                            src={listing.imageUrls[0] || "https://via.placeholder.com/400x300"}
                            alt={listing.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#484848]">
                            {listing.type === 'rent' ? 'For rent' : 'For sale'}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-[#484848] line-clamp-1">{listing.name}</h4>
                            <span className="font-bold text-[#484848]">
                              R{listing.offer ? listing.discountPrice?.toLocaleString() : listing.regularPrice?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#767676] mb-4">
                            <span className="flex items-center gap-1">
                              <FaBed size={14} /> {listing.bedrooms} bd
                            </span>
                            <span className="flex items-center gap-1">
                              <FaBath size={14} /> {listing.bathrooms} ba
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/update-listing/${listing._id}`}
                              className="flex-1 flex items-center justify-center gap-2 py-2 border border-[#DDDDDD] rounded-lg text-[#484848] hover:bg-[#F7F7F7] transition-colors font-medium"
                            >
                              <Edit3 size={16} />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleListingDelete(listing._id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#F7F7F7] rounded-xl">
                    <Home size={48} className="mx-auto text-[#DDDDDD] mb-4" />
                    <h4 className="text-lg font-semibold text-[#484848] mb-2">No listings yet</h4>
                    <p className="text-[#767676] mb-6">Start hosting and earn income</p>
                    <Link
                      to={`/${currentUser?._id}/create-listing`}
                      className="inline-flex items-center gap-2 bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors"
                    >
                      <Plus size={18} />
                      Create your first listing
                    </Link>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Events Section */}
            {activeSection === "events" && (
              <SectionCard title="My events" icon={Calendar}>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[#767676]">Manage your upcoming events</p>
                  <span className="bg-[#F7F7F7] text-[#484848] px-3 py-1 rounded-full text-sm font-medium">
                    {postCount} events
                  </span>
                </div>

                {userEvents.length > 0 ? (
                  <div className="space-y-4">
                    {userEvents.slice(0, visibleEvents).map((event) => (
                      <div
                        key={event._id}
                        className="border border-[#DDDDDD] rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          {event.imageUrls?.[0] && (
                            <img
                              src={event.imageUrls[0]}
                              alt={event.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-[#484848]">{event.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-[#767676] mt-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} /> {event.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={14} /> {event.address}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  to={`/update-event/${event._id}`}
                                  className="p-2 text-[#484848] hover:bg-[#F7F7F7] rounded-lg transition-colors"
                                >
                                  <Edit3 size={18} />
                                </Link>
                                <button
                                  onClick={() => handleEventDelete(event._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <p className="text-[#767676] mt-3 line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#F7F7F7] rounded-xl">
                    <Calendar size={48} className="mx-auto text-[#DDDDDD] mb-4" />
                    <h4 className="text-lg font-semibold text-[#484848] mb-2">No events yet</h4>
                    <p className="text-[#767676] mb-6">Create events to connect with your community</p>
                    <button className="inline-flex items-center gap-2 bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      <Plus size={18} />
                      Create event
                    </button>
                  </div>
                )}
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal - Airbnb Style */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-[#DDDDDD] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#484848]">Verify your identity</h3>
              <button onClick={stopCamera} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
                <X size={24} className="text-[#484848]" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mx-auto max-w-sm mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-xl border-2 border-[#DDDDDD]"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-full"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" width="640" height="480" />
              </div>
              
              <p className="text-center text-[#767676] mb-6">
                Position your face in the circle and ensure good lighting
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={captureFace}
                  disabled={isProcessing}
                  className="flex-1 bg-[#FF5A5F] text-white py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Capture photo
                    </>
                  )}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 border border-[#484848] text-[#484848] rounded-lg font-medium hover:bg-[#F7F7F7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal - Airbnb Style */}
      {showViewProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#DDDDDD] flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#484848]">Profile preview</h3>
              <button onClick={() => setShowViewProfile(false)} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
                <X size={24} className="text-[#484848]" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isFaceVerified && (
                  <div className="absolute bottom-2 right-2 bg-[#00A699] text-white p-2 rounded-full border-4 border-white shadow-md">
                    <Shield size={20} />
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-[#484848] mb-1">{currentUser?.username || 'User'}</h2>
              <div className="flex items-center justify-center gap-2 text-[#767676] mb-4">
                <MapPin size={16} />
                {currentUser?.location || 'No location set'}
              </div>
              
              {currentUser?.bio && (
                <p className="text-[#484848] mb-6 text-left bg-[#F7F7F7] p-4 rounded-lg">
                  {currentUser.bio}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F7F7F7] p-4 rounded-lg">
                  <p className="text-2xl font-bold text-[#484848]">{userListings?.length || 0}</p>
                  <p className="text-sm text-[#767676]">Listings</p>
                </div>
                <div className="bg-[#F7F7F7] p-4 rounded-lg">
                  <p className="text-2xl font-bold text-[#484848]">0</p>
                  <p className="text-sm text-[#767676]">Reviews</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowViewProfile(false)}
                className="w-full bg-[#FF5A5F] text-white py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal - Airbnb Style */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-[#DDDDDD] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaWhatsapp size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#484848]">WhatsApp</h3>
              </div>
              <button onClick={() => setShowWhatsAppModal(false)} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
                <X size={24} className="text-[#484848]" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[#767676] mb-6">
                Connect your WhatsApp to receive instant booking notifications and guest messages.
              </p>
              
              <InputField
                label="WhatsApp number"
                type="tel"
                id="whatsappNumber"
                value={whatsappNumber}
                handleChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+27 82 123 4567"
                icon={Phone}
              />
              
              {!whatsappConnected ? (
                <button
                  onClick={handleConnectWhatsApp}
                  className="w-full bg-[#FF5A5F] text-white py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={20} />
                  Connect WhatsApp
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle size={20} />
                    <span className="font-medium">Connected: {whatsappNumber}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerifyWhatsApp}
                      disabled={whatsappVerified}
                      className="flex-1 py-3 border border-[#484848] text-[#484848] rounded-lg font-medium hover:bg-[#F7F7F7] transition-colors disabled:opacity-50"
                    >
                      {whatsappVerified ? 'Verified' : 'Verify number'}
                    </button>
                    <button
                      onClick={() => {
                        setWhatsappConnected(false);
                        setWhatsappVerified(false);
                        setWhatsappNumber('');
                      }}
                      className="flex-1 py-3 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}