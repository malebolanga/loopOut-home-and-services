
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
  MdLogout
} from 'react-icons/md';
import { 
  FaBath, 
  FaBed, 
  FaArrowRight, 
  FaEdit, 
  FaCalendarAlt,
  FaUser,
  FaShieldAlt,
  FaBell,
  FaEye,
  FaHome,
  FaHeart,
  FaList,
  FaCog,
  FaShareAlt,
  FaDownload,
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
import {
  AddCircle,
} from "@mui/icons-material";
import {
  ShareIcon,
  LockClosedIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  HomeIcon,
  HeartIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  GiftIcon,
  HandRaisedIcon,
  ScaleIcon,
  UserPlusIcon,
  StarIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import WishList from "./WishListProfile";
import MyListing from "./MyListing";
import { Camera, CheckCircle, X, MessageCircle, Mail, Phone } from 'lucide-react';

// Reusable InputField Component
const InputField = ({ label, id, type = "text", value, handleChange, helperText, placeholder, icon }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={id}
        className={`w-full px-4 py-3 border ${icon ? 'pl-10' : ''} border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all`}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
      />
    </div>
    {helperText && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
  </div>
);

// Reusable ToggleSwitch Component
const ToggleSwitch = ({ enabled, setEnabled }) => (
  <button
    type="button"
    onClick={() => setEnabled(!enabled)}
    className={`${enabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
    role="switch"
    aria-checked={enabled}
  >
    <span
      aria-hidden="true"
      className={`${enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

// Reusable Checkbox Component
const Checkbox = ({ label, checked, onChange, helperText }) => (
  <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <input
      type="checkbox"
      className="form-checkbox h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
      checked={checked}
      onChange={onChange}
    />
    <div className="flex-1">
      <span className="text-gray-900 font-medium">{label}</span>
      {helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  </label>
);

// Section Card Component
const SectionCard = ({ children, title, icon, emoji }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-purple-600">{icon}</div>}
        <h3 className="text-xl font-semibold text-gray-900">{emoji && <span className="mr-2">{emoji}</span>}{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// Connection Card Component
const ConnectionCard = ({ icon, emoji, title, description, onClick, buttonText = "Connect", color = "blue" }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    orange: 'from-orange-50 to-orange-100 text-orange-600',
    pink: 'from-pink-50 to-pink-100 text-pink-600',
    yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
  };

  return (
    <div className={`border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-${color}-300`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            {icon && <div className={colorClasses[color].split(' ')[2]}>{icon}</div>}
            {emoji && <span className="text-2xl">{emoji}</span>}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-gray-600 text-sm mb-3">{description}</p>
          <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 ${colorClasses[color].split(' ')[2]} hover:opacity-80 font-medium text-sm transition-colors`}
          >
            {buttonText} <FaArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Option Component
const SettingsOption = ({ icon, title, description, onClick, isLast = false, emoji }) => (
  <button
    onClick={onClick}
    className={`flex items-start gap-4 w-full p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 text-left ${!isLast ? 'border-b border-gray-100' : ''}`}
  >
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        {emoji && <span className="text-lg">{emoji}</span>}
        {!emoji && icon}
      </div>
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <FaArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Account</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <span className="text-purple-500">✨</span> Manage your personal information, privacy, and security
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-4 border-gradient-to-r from-purple-200 to-pink-200"
                    />
                    {isFaceVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                        <MdVerifiedUser className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{currentUser?.username || 'User'}</h2>
                    <p className="text-sm text-gray-600">{currentUser?.email || 'user@example.com'}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => fileRef.current.click()}
                        className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                      >
                        <input
                          type="file"
                          hidden
                          ref={fileRef}
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                        📸 Change photo
                      </button>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => setShowViewProfile(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        👁️ View profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {[
                    { id: "personal", label: "Personal Info", icon: <UserIcon className="w-5 h-5" />, emoji: "👤" },
                    { id: "login", label: "Login & Security", icon: <ShieldCheckIcon className="w-5 h-5" />, emoji: "🔐" },
                    { id: "notifications", label: "Notifications", icon: <BellIcon className="w-5 h-5" />, emoji: "🔔" },
                    { id: "privacy", label: "Privacy & Sharing", icon: <FaEye className="w-5 h-5" />, emoji: "👁️" },
                    { id: "hosting", label: "Host an Experience", icon: <HomeIcon className="w-5 h-5" />, emoji: "🏠" },
                    { id: "host-account", label: "Host Account", icon: <FaUserTie className="w-5 h-5" />, emoji: "👔" },
                    { id: "wishlist", label: "Wishlist", icon: <HeartIcon className="w-5 h-5" />, emoji: "❤️" },
                    { id: "my-listings", label: "My Listings", icon: <ListBulletIcon className="w-5 h-5" />, emoji: "📋" },
                    { id: "events", label: "My Events", icon: <MdCalendarToday className="w-5 h-5" />, emoji: "📅" },
                    { id: "connections", label: "Connections", icon: <UserGroupIcon className="w-5 h-5" />, emoji: "🔗" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all duration-200 ${activeSection === tab.id
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold border border-purple-200 shadow-sm"
                          : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-gray-900"
                        }`}
                    >
                      <span className="text-lg">{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Account Settings Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <SettingsOption
                    emoji="❓"
                    title="Get Help"
                    description="Find answers and contact support"
                    onClick={handleNavigateToHelp}
                  />
                  <SettingsOption
                    emoji="🎁"
                    title="Refer a Host"
                    description="Earn rewards for inviting hosts"
                    onClick={handleNavigateToReferrals}
                  />
                  <SettingsOption
                    emoji="🤝"
                    title="Find a Co-host"
                    description="Partner with other hosts"
                    onClick={handleNavigateToCoHost}
                  />
                  <SettingsOption
                    emoji="⚖️"
                    title="Legal"
                    description="Terms, policies, and disclosures"
                    onClick={handleNavigateToLegal}
                    isLast={true}
                  />
                </div>

                {/* Sign Out Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Info Section */}
            {activeSection === "personal" && (
              <>
                <SectionCard title="Personal Information" emoji="👤">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Username"
                        id="username"
                        value={formData.username || currentUser?.username || ''}
                        handleChange={handleChange}
                        icon={<FaUser className="w-4 h-4" />}
                      />
                      <InputField
                        label="Email"
                        type="email"
                        id="email"
                        value={formData.email || currentUser?.email || ''}
                        handleChange={handleChange}
                        icon={<MdEmail className="w-4 h-4" />}
                      />
                      <InputField
                        label="Location"
                        id="location"
                        value={formData.location || currentUser?.location || ''}
                        handleChange={handleChange}
                        icon={<MdLocationOn className="w-4 h-4" />}
                      />
                      <InputField
                        label="Phone Number"
                        type="tel"
                        id="phone"
                        value={formData.phone || currentUser?.phone || ''}
                        handleChange={handleChange}
                        icon={<MdPhone className="w-4 h-4" />}
                      />
                    </div>

                    <InputField
                      label="Bio"
                      type="textarea"
                      id="bio"
                      value={formData.bio || currentUser?.bio || ''}
                      handleChange={handleChange}
                      placeholder="Tell us about yourself ✨"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Occupation"
                        id="occupation"
                        value={formData.occupation || currentUser?.occupation || ''}
                        handleChange={handleChange}
                      />
                      <InputField
                        label="Interests"
                        id="interests"
                        value={formData.interests || currentUser?.interests || ''}
                        handleChange={handleChange}
                      />
                    </div>

                    <InputField
                      label="Website"
                      type="url"
                      id="website"
                      value={formData.website || currentUser?.website || ''}
                      handleChange={handleChange}
                      icon={<MdLink className="w-4 h-4" />}
                    />

                    {/* WhatsApp Integration */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="text-xl">💬</span>
                            WhatsApp Connection
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Connect your WhatsApp for booking notifications
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowWhatsAppModal(true)}
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          {whatsappConnected ? 'Manage' : 'Connect'}
                        </button>
                      </div>
                      {whatsappConnected && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                              <FaWhatsapp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">WhatsApp Connected</p>
                              <p className="text-sm text-gray-600">{whatsappNumber}</p>
                            </div>
                          </div>
                          {whatsappVerified ? (
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircleIcon className="w-5 h-5" />
                              <span className="text-sm font-medium">✅ Verified</span>
                            </div>
                          ) : (
                            <button
                              onClick={handleVerifyWhatsApp}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              Verify now 🔐
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Identity Verification */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="text-xl">🆔</span>
                            Identity Verification
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Add a photo to verify your identity
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          {isFaceVerified ? '🔄 Re-verify' : '🔍 Verify now'}
                        </button>
                      </div>
                      {isFaceVerified && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>✅ Your identity has been verified</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            💾 Save changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {updateSuccess && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 flex items-center gap-2">
                        <span>✅</span> Profile updated successfully!
                      </p>
                    </div>
                  )}
                  {error && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 flex items-center gap-2">
                        <span>❌</span> {error}
                      </p>
                    </div>
                  )}
                </SectionCard>
              </>
            )}

            {/* Login & Security Section */}
            {activeSection === "login" && (
              <>
                <SectionCard title="Login & Security" emoji="🔐">
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>🔑</span> Password
                      </h4>
                      <div className="space-y-4">
                        <InputField
                          label="Current Password"
                          type="password"
                          id="currentPassword"
                          handleChange={handleChange}
                          icon={<MdLock className="w-4 h-4" />}
                        />
                        <InputField
                          label="New Password"
                          type="password"
                          id="newPassword"
                          handleChange={handleChange}
                        />
                        <InputField
                          label="Confirm New Password"
                          type="password"
                          id="confirmNewPassword"
                          handleChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <span>🛡️</span> Two-factor authentication
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <ToggleSwitch
                          enabled={twoFactorEnabled}
                          setEnabled={setTwoFactorEnabled}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                        💾 Save changes
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <>
                <SectionCard title="Notifications" emoji="🔔">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>📧</span> Email notifications
                      </h4>
                      <div className="space-y-1">
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
                          label="Special offers"
                          checked={notifications.promotions.specialOffers}
                          onChange={() => toggleNotification('promotions', 'specialOffers')}
                          helperText="Get exclusive deals and discounts 🎉"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>🚨</span> Security alerts
                      </h4>
                      <div className="space-y-1">
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

                    <div className="flex justify-end pt-6">
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                        💾 Save preferences
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Privacy & Sharing Section */}
            {activeSection === "privacy" && (
              <>
                <SectionCard title="Privacy & Sharing" emoji="👁️">
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>👤</span> Profile visibility
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-purple-100">
                          <div>
                            <p className="font-medium">Public profile</p>
                            <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                          </div>
                          <ToggleSwitch
                            enabled={profileVisibility}
                            setEnabled={setProfileVisibility}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>🔗</span> Shared information
                      </h4>
                      <div className="space-y-1">
                        <Checkbox
                          label="Show booking history"
                          checked={sharedInfo.bookingHistory}
                          onChange={() => toggleSharedInfo('bookingHistory')}
                          helperText="Display past trips on your profile ✈️"
                        />
                        <Checkbox
                          label="Show reviews"
                          checked={sharedInfo.reviews}
                          onChange={() => toggleSharedInfo('reviews')}
                          helperText="Make your written reviews publicly visible ⭐"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>💾</span> Data management
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all duration-200 group">
                          <div>
                            <p className="font-medium">📥 Download your data</p>
                            <p className="text-sm text-gray-600">Get a copy of your personal data</p>
                          </div>
                          <ArrowDownTrayIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
                        </button>
                        <button
                          onClick={handleDeleteUser}
                          className="flex items-center justify-between p-4 border border-red-200 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 text-red-600 group"
                        >
                          <div>
                            <p className="font-medium">🗑️ Delete account</p>
                            <p className="text-sm">Permanently remove your account</p>
                          </div>
                          <TrashIcon className="w-5 h-5 group-hover:text-red-700" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                        💾 Save privacy settings
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Host an Experience Section */}
            {activeSection === "hosting" && (
              <>
                <SectionCard title="Host an Experience" emoji="🏠">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>🚀</span> Ready to host?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Share your space or create unique experiences for travelers from around the world 🌍.
                        Earn money 💰 doing what you love while providing memorable stays.
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <span>⭐</span> Why host on our platform?
                      </h4>
                      <ul className="space-y-2 text-blue-800">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          💰 Earn competitive income
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          🌍 Reach millions of travelers
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          🛡️ 24/7 support and protection
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <Link
                        to={`/${currentUser?._id}/create-listing`}
                        className="inline-flex items-center justify-center bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      >
                        <HomeIcon className="w-6 h-6 mr-2" />
                        🚀 Start hosting
                      </Link>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Host Account Section */}
            {activeSection === "host-account" && (
              <>
                <SectionCard title="Host Account" emoji="👔">
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border border-purple-200 rounded-2xl p-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                            👑 Welcome to your Host Dashboard
                          </h3>
                          <p className="text-gray-600 mb-6 text-lg">Manage your hosting business, earnings, and tools</p>
                          <div className="flex items-center gap-6">
                            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-purple-100">
                              <p className="text-sm text-gray-600">📊 Total Listings</p>
                              <p className="text-3xl font-bold text-purple-700">{userListings?.length || 0}</p>
                            </div>
                            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-pink-100">
                              <p className="text-sm text-gray-600">💰 Total Earnings</p>
                              <p className="text-3xl font-bold text-pink-700">R0</p>
                            </div>
                            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-blue-100">
                              <p className="text-sm text-gray-600">⭐ Rating</p>
                              <p className="text-3xl font-bold text-blue-700">0.0</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-full shadow-xl">
                          <FaCrown className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <button
                        onClick={handleNavigateToHostDashboard}
                        className="flex flex-col items-center justify-center p-8 border-2 border-purple-200 rounded-2xl hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group hover:shadow-xl"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:from-purple-200 group-hover:to-pink-200 shadow-lg">
                          <FaChartLine className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">📈 Host Dashboard</h4>
                        <p className="text-sm text-gray-600 text-center">View performance & insights</p>
                      </button>

                      <button
                        onClick={handleNavigateToEarnings}
                        className="flex flex-col items-center justify-center p-8 border-2 border-green-200 rounded-2xl hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group hover:shadow-xl"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mb-6 group-hover:from-green-200 group-hover:to-emerald-200 shadow-lg">
                          <FaWallet className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">💰 Earnings</h4>
                        <p className="text-sm text-gray-600 text-center">Track income & payments</p>
                      </button>

                      <button
                        onClick={handleNavigateToHostTools}
                        className="flex flex-col items-center justify-center p-8 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 group hover:shadow-xl"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-cyan-200 shadow-lg">
                          <FaTools className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">🛠️ Host Tools</h4>
                        <p className="text-sm text-gray-600 text-center">Manage listings & bookings</p>
                      </button>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-6 text-xl flex items-center gap-3">
                        <span>✅</span> Host Verification
                      </h4>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg">
                              <FaClipboardCheck className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">Complete Host Verification</p>
                              <p className="text-gray-600">Verify your identity to start hosting 🏠</p>
                            </div>
                          </div>
                          <button
                            onClick={handleNavigateToVerification}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold"
                          >
                            🚀 Get Verified
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Wishlist Section */}
            {activeSection === "wishlist" && (
              <>
                <SectionCard title="Wishlist" emoji="❤️">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>⭐</span> Saved listings
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your collection of favorite places to stay 🏡. Bookmark listings you're interested in
                        for easy access later.
                      </p>
                    </div>
                    <WishList />
                  </div>
                </SectionCard>
              </>
            )}

            {/* My Listings Section */}
            {activeSection === "my-listings" && (
              <>
                <SectionCard title="My Listings" emoji="📋">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          <span>🏠</span> Your listings
                        </h3>
                        <p className="text-gray-600 mt-1">Manage your active properties</p>
                      </div>
                      <Link
                        to={`/${currentUser?._id}/create-listing`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <span>➕</span> New listing
                      </Link>
                    </div>

                    <button
                      onClick={handleShowListings}
                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 hover:underline"
                    >
                      👁️ Show all listings
                    </button>

                    {userListings && userListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userListings.slice(0, visibleListings).map((listing) => (
                          <div
                            key={listing._id}
                            className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-purple-300 hover:scale-[1.02]"
                          >
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={listing.imageUrls[0] || "https://via.placeholder.com/300x200"}
                                alt={listing.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              />
                              <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {listing.type === 'rent' ? '🏠 Rent' : '💰 Sale'}
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 truncate">{listing.name}</h4>
                                <span className="text-lg font-bold text-gray-900">
                                  R{listing.offer ? listing.discountPrice?.toLocaleString() : listing.regularPrice?.toLocaleString()}
                                  {listing.type === 'rent' && '/month'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                  <FaBed className="w-4 h-4 text-purple-500" /> {listing.bedrooms}
                                </span>
                                <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                  <FaBath className="w-4 h-4 text-blue-500" /> {listing.bathrooms}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <Link
                                  to={`/update-listing/${listing._id}`}
                                  className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-4 py-3 rounded-xl text-center hover:from-purple-100 hover:to-pink-100 transition-all duration-200 font-medium border border-purple-200"
                                >
                                  ✏️ Edit
                                </Link>
                                <button
                                  onClick={() => handleListingDelete(listing._id)}
                                  className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 px-4 py-3 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all duration-200 font-medium border border-red-200"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                          <HomeIcon className="w-12 h-12 text-purple-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">No listings yet 🏡</h4>
                        <p className="text-gray-600 mb-6">You haven't created any listings yet.</p>
                        <Link
                          to={`/${currentUser?._id}/create-listing`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                        >
                          🚀 Create your first listing
                        </Link>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </>
            )}

            {/* My Events Section */}
            {activeSection === "events" && (
              <>
                <SectionCard title="My Events" emoji="📅">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          <span>🎉</span> Your events
                        </h3>
                        <p className="text-gray-600 mt-1">Manage your upcoming events</p>
                      </div>
                      <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200">
                        🎯 {postCount} total
                      </span>
                    </div>

                    {userEvents.length > 0 ? (
                      <div className="space-y-4">
                        {userEvents.slice(0, visibleEvents).map((event) => (
                          <div
                            key={event._id}
                            className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300 bg-white"
                          >
                            <div className="flex items-start gap-6">
                              {event.imageUrls?.[0] && (
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={event.imageUrls[0]}
                                    alt={event.name}
                                    className="w-32 h-32 object-cover rounded-xl border-2 border-purple-100"
                                  />
                                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    🎉 EVENT
                                  </div>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{event.name}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                      <span className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                                        <MdCalendarToday className="w-4 h-4 text-purple-500" /> {event.date}
                                      </span>
                                      <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                                        <MdLocationOn className="w-4 h-4 text-blue-500" /> {event.address}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <Link
                                      to={`/update-event/${event._id}`}
                                      className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                                    >
                                      ✏️ Edit
                                    </Link>
                                    <button
                                      onClick={() => handleEventDelete(event._id)}
                                      className="text-red-600 hover:text-red-800 font-medium hover:underline"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-600 mt-4 line-clamp-2 bg-gray-50 p-4 rounded-xl">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                          <MdCalendarToday className="w-12 h-12 text-blue-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">No events yet 🎉</h4>
                        <p className="text-gray-600 mb-6">You haven't created any events yet.</p>
                        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                          🚀 Create your first event
                        </button>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </>
            )}

            {/* Connections Section */}
            {activeSection === "connections" && (
              <>
                <SectionCard title="Connections" emoji="🔗">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-3">
                        <span>🌐</span> Stay Connected
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Connect your accounts for a seamless experience across platforms 🤝
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ConnectionCard
                        emoji="💬"
                        title="WhatsApp"
                        description="Get booking notifications and messages"
                        onClick={() => setShowWhatsAppModal(true)}
                        buttonText={whatsappConnected ? "Manage" : "Connect"}
                        color="green"
                      />

                      <ConnectionCard
                        emoji="📅"
                        title="Booking Calendar"
                        description="Sync your booking schedule"
                        onClick={handleNavigateToBookings}
                        color="blue"
                      />

                      <ConnectionCard
                        emoji="⭐"
                        title="Reviews"
                        description="View and manage your reviews"
                        onClick={handleNavigateToReviews}
                        color="yellow"
                      />

                      <ConnectionCard
                        emoji="💌"
                        title="Messages"
                        description="Check your inbox"
                        onClick={handleNavigateToMessages}
                        color="pink"
                      />

                      <ConnectionCard
                        emoji="📚"
                        title="Host Resources"
                        description="Learn about hosting"
                        onClick={() => window.open('/host-resources', '_blank')}
                        color="purple"
                      />

                      <ConnectionCard
                        emoji="🤝"
                        title="Co-host Network"
                        description="Find hosting partners"
                        onClick={handleNavigateToCoHost}
                        color="orange"
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-6 text-xl flex items-center gap-3">
                        <span>🌍</span> Social Connections
                      </h4>
                      <div className="flex gap-4">
                        {[
                          { icon: "📘", label: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
                          { icon: "📸", label: "Instagram", color: "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90" },
                          { icon: "🐦", label: "Twitter", color: "bg-blue-400 hover:bg-blue-500" },
                          { icon: "💼", label: "LinkedIn", color: "bg-blue-700 hover:bg-blue-800" },
                          { icon: "👥", label: "TikTok", color: "bg-black hover:bg-gray-800" }
                        ].map((social) => (
                          <button
                            key={social.label}
                            className={`w-14 h-14 rounded-full ${social.color} flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                            title={`Connect ${social.label}`}
                          >
                            <span className="text-2xl">{social.icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal for Face Verification */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl max-w-2xl w-full overflow-hidden border-2 border-purple-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white">📸</span>
                  </div>
                  <span>Verify your identity</span>
                </h3>
                <button
                  onClick={stopCamera}
                  className="text-gray-500 hover:text-gray-700 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-3 ml-14">
                Position your face in the frame and ensure good lighting ✨
              </p>
            </div>
            
            <div className="p-8">
              <div className="relative mx-auto max-w-md">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-2xl border-4 border-purple-300 shadow-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-white/50 rounded-2xl opacity-40"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" width="640" height="480" />
              </div>
              
              <div className="flex flex-col items-center mt-10 space-y-6">
                <div className="flex gap-6">
                  <button
                    onClick={captureFace}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-lg flex items-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6" />
                        📸 Capture & Verify
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-8 py-4 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all duration-300 shadow-lg font-semibold text-lg"
                  >
                    ❌ Cancel
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  💡 Tip: Make sure your face is well-lit and centered in the frame
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-100 to-pink-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white">👁️</span>
                  </div>
                  <span>Your Public Profile</span>
                </h3>
                <button
                  onClick={() => setShowViewProfile(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-6">
                  <img
                    src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-8 border-gradient-to-r from-purple-300 via-pink-300 to-blue-300 shadow-2xl"
                  />
                  {isFaceVerified && (
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-3 rounded-full shadow-xl">
                      <MdVerifiedUser className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{currentUser?.username || 'User'}</h2>
                <p className="text-gray-600 mt-3 flex items-center gap-2">
                  <span>📍</span> {currentUser?.location || 'No location set'}
                </p>
                {currentUser?.occupation && (
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <span>💼</span> {currentUser.occupation}
                  </p>
                )}
              </div>
              
              {currentUser?.bio && (
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-purple-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <span>📝</span> About
                  </h4>
                  <p className="text-gray-600 leading-relaxed">{currentUser.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <span>🏠</span> Listings
                  </p>
                  <p className="text-4xl font-bold text-purple-700">{userListings?.length || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <span>⭐</span> Reviews
                  </p>
                  <p className="text-4xl font-bold text-blue-700">0</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => window.open(`/user/${currentUser?._id}`, '_blank')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg flex items-center gap-3"
                >
                  👁️ View Full Profile
                </button>
                <button
                  onClick={() => setShowViewProfile(false)}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-8 py-4 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all duration-300 shadow-lg font-semibold text-lg"
                >
                  ❌ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Connection Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl max-w-md w-full border-2 border-green-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <FaWhatsapp className="w-6 h-6 text-white" />
                  </div>
                  <span>WhatsApp Connection</span>
                </h3>
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-8">
                <p className="text-gray-600 mb-6 text-center flex items-center justify-center gap-2">
                  <span>💬</span> Connect your WhatsApp to receive booking notifications, messages, and updates directly.
                </p>
                
                <div className="space-y-6">
                  <InputField
                    label="WhatsApp Number"
                    type="tel"
                    id="whatsappNumber"
                    value={whatsappNumber}
                    handleChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+27 82 123 4567"
                    icon={<FaWhatsapp className="w-4 h-4 text-green-600" />}
                  />
                  
                  {!whatsappConnected ? (
                    <button
                      onClick={handleConnectWhatsApp}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-lg flex items-center justify-center gap-3"
                    >
                      <FaWhatsapp className="w-6 h-6" />
                      🔗 Connect WhatsApp
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 text-green-700 mb-2">
                          <CheckCircleIcon className="w-6 h-6" />
                          <span className="font-bold">✅ WhatsApp Connected</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-9">{whatsappNumber}</p>
                      </div>
                      
                      <div className="flex gap-4">
                        <button
                          onClick={handleVerifyWhatsApp}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg font-bold disabled:opacity-50"
                          disabled={whatsappVerified}
                        >
                          {whatsappVerified ? '✅ Verified' : '🔐 Verify Number'}
                        </button>
                        <button
                          onClick={() => {
                            setWhatsappConnected(false);
                            setWhatsappVerified(false);
                            setWhatsappNumber('');
                          }}
                          className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 py-4 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all duration-300 shadow-lg font-bold"
                        >
                          🚫 Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FaBell className="w-5 h-5 text-blue-600" />
                  <span>🔔 What you'll receive:</span>
                </h4>
                <ul className="text-gray-600 space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    📲 Instant booking notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    💬 Guest messages and inquiries
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    ⏰ Booking reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    💰 Payment confirmations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add bottom padding to account for the Footer's fixed bottom navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
