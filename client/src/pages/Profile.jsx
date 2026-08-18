/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { X, Camera } from 'lucide-react';
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
import { clearPersistedSessionToken } from '../utils/authenticatedFetch';
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
import { motion, AnimatePresence } from 'framer-motion';
import WishList from "./WishListProfile";
import MyListing from "./MyListing";
import { 
  CameraIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ChevronRightIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  UserIcon, 
  HomeIcon, 
  HeartIcon, 
  ListBulletIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  MapPinIcon, 
  CalendarIcon, 
  StarIcon, 
  TrophyIcon, 
  QuestionMarkCircleIcon, 
  ArrowDownTrayIcon, 
  ChartBarIcon, 
  GiftIcon, 
  WalletIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

// Masterpiece Elite Color Palette
const colors = {
  primary: '#E11D48',      // rose-600
  primaryDark: '#BE123C',  // rose-700
  secondary: '#0F172A',    // slate-900
  dark: '#020617',         // gray-950
  gray: '#64748B',         // slate-500
  lightGray: '#E2E8F0',    // slate-200
  lighterGray: '#F8FAFC',  // slate-50
  white: '#FFFFFF',
  success: '#10B981',      // emerald-500
  error: '#EF4444',        // red-500
};

// Reusable InputField Component - Airbnb Style
const InputField = ({ label, id, type = "text", value, handleChange, helperText, placeholder, icon: Icon, readOnly = false }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-semibold text-[#484848] mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#767676]">
          <Icon className="w-[18px] h-[18px]" />
        </div>
      )}
      <input
        type={type}
        id={id}
        className={`w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F] transition-all outline-none text-[#484848] placeholder-[#767676] ${Icon ? 'pl-10' : ''}`}
        value={value || ''}
        onChange={handleChange}
        readOnly={readOnly}
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
  <div className="glass rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 mb-8 border border-white/60 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-50 to-transparent rounded-full blur-3xl -z-10 opacity-50" />
    {title && (
      <div className="flex items-center gap-4 mb-8">
        {Icon && (
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-rose-100 text-rose-500">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// Airbnb Menu Item
const MenuItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <motion.button
    whileHover={{ x: 5 }}
    onClick={onClick}
    className={`flex items-center justify-between w-full p-5 rounded-[1.5rem] text-left transition-all duration-300 ${active
      ? "bg-rose-600 text-white shadow-xl shadow-rose-200"
      : "text-gray-950 hover:bg-rose-50"
      }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-rose-50'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-rose-600'}`} />
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {badge !== undefined && (
      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${active ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600 shadow-sm'}`}>
        {badge}
      </span>
    )}
  </motion.button>
);

// Airbnb Settings Row
const SettingsRow = ({ icon: Icon, title, description, onClick, danger }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className={`flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-all rounded-[1.5rem] group`}
  >
    <div className="flex items-center gap-4 text-left">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-900 group-hover:bg-rose-50 group-hover:text-rose-600'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest leading-none mb-1">{title}</h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 leading-none">{description}</p>
      </div>
    </div>
    <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-rose-600 transition-colors" />
  </motion.button>
);

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [coverFile, setCoverFile] = useState(undefined);
  const [coverFilePerc, setCoverFilePerc] = useState(0);
  const [coverFileUploadError, setCoverFileUploadError] = useState(false);
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
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [contactVisibility, setContactVisibility] = useState('private');
  const fileRef = useRef(null);
  const coverFileRef = useRef(null);
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
      setIsFaceVerified(false);
    }
    if (currentUser?.whatsappNumber) {
      setWhatsappNumber(currentUser.whatsappNumber);
      setWhatsappConnected(true);
      setWhatsappVerified(currentUser.whatsappVerified || false);
    }
    if (currentUser?.accessContacts) {
      setAccessContacts(currentUser.accessContacts);
    }
    if (currentUser?.notificationPreferences) setNotifications(currentUser.notificationPreferences);
    if (typeof currentUser?.profileVisibility === 'boolean') setProfileVisibility(currentUser.profileVisibility);
    if (currentUser?.sharedInfo) setSharedInfo(currentUser.sharedInfo);
    if (currentUser?.dataSharing) setDataSharing(currentUser.dataSharing);
  }, [currentUser]);

  const [accessContacts, setAccessContacts] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [otpDebug, setOtpDebug] = useState(''); // Only for dev mode
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    if (coverFile) {
      handleCoverUpload(coverFile);
    }
  }, [coverFile]);

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

  const handleRequestPhoneOtp = async () => {
    setOtpLoading(true);
    setVerificationError('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: currentUser.email }),
      });
      const data = await res.json();
      if (data.success === false) {
        setVerificationError(data.message);
        setOtpLoading(false);
        return;
      }
      setOtpSent(true);
      if (data.otpDebug) {
        setOtpDebug(data.otpDebug);
        console.log('Verification Code (Dev Mode):', data.otpDebug);
      }
      setOtpLoading(false);
    } catch (err) {
      setVerificationError('Could not send verification code. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setOtpLoading(true);
    setVerificationError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          otp: verificationOtp,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setVerificationError(data.message);
        setOtpLoading(false);
        return;
      }
      dispatch(updateUserSuccess(data.user));
      setOtpSent(false);
      setIsVerifyingPhone(false);
      setOtpLoading(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setVerificationError('Verification failed. Please try again.');
      setOtpLoading(false);
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
              detectedAt: new Date().toISOString(),
              method: 'camera'
            };

            const res = await fetch(`/api/user/update/${currentUser._id}`, {
              method: "PUT",
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
        method: "PUT",
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
        if (error.code === 'storage/quota-exceeded') {
          setFileUploadError("Storage quota exceeded. Please upgrade your Firebase plan or delete old files.");
        } else {
          setFileUploadError(true);
        }
        console.error("File upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({ ...prev, avatar: downloadURL }));
          setFileUploadError(false);
        });
      }
    );
  };

  const handleCoverUpload = (file) => {
    const storage = getStorage(app);
    const fileName = "cover_" + new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setCoverFilePerc(Math.round(progress));
        setCoverFileUploadError(false);
      },
      (error) => {
        if (error.code === 'storage/quota-exceeded') {
          setCoverFileUploadError("Storage quota exceeded. Please upgrade your Firebase plan or delete old files.");
        } else {
          setCoverFileUploadError(true);
        }
        console.error("Cover upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({ ...prev, coverPhoto: downloadURL }));
          setCoverFileUploadError(false);
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, accessContacts }),
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

  const saveSettings = async (settings) => {
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Unable to save settings.');
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword.length < 12) {
      dispatch(updateUserFailure('Your new password must contain at least 12 characters.'));
      return;
    }
    await saveSettings(securityForm);
    setSecurityForm({ currentPassword: '', newPassword: '' });
  };

  const handleDownloadData = async () => {
    try {
      const res = await fetch(`/api/user/export/${currentUser._id}`);
      if (!res.ok) throw new Error('Unable to prepare your data export.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'loopout-account-data.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    const currentPassword = window.prompt('Enter your current password to confirm account deletion:');
    if (!currentPassword) return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword }),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      clearPersistedSessionToken();
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      fetch("/api/auth/signout", { credentials: "include" }).catch(() => {});
      clearPersistedSessionToken();
      dispatch(signOutUserSuccess());
    } catch (error) {
      clearPersistedSessionToken();
      dispatch(signOutUserSuccess());
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

  const handleNavigate = (path) => {
    navigate(path);
  };

  // View Profile Modal
  const [showViewProfile, setShowViewProfile] = useState(false);

  // WhatsApp connection modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Calculate Profile Completion
  const calculateProfileCompletion = () => {
    const fields = [
      'username', 'email', 'phone', 'location', 'occupation', 
      'interests', 'website', 'socialMedia', 'bio', 'avatar', 'coverPhoto'
    ];
    let completed = 0;
    const data = currentUser || {};
    fields.forEach(field => {
      if (data[field] || formData[field]) completed++;
    });
    if (isFaceVerified) completed++;
    if (data.isVerified) completed++;
    
    const totalFields = fields.length + 2; // + face + phone verify
    return Math.round((completed / totalFields) * 100);
  };
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      {/* Masterpiece Elite Account Header */}
      <div className="max-w-7xl mx-auto px-6 pt-32 mb-12">
        <div className="relative group overflow-hidden rounded-[3rem] bg-gray-950 p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-500/10 to-transparent blur-[80px] -z-10" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse" />

          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            {/* Avatar Section */}
            <div className="relative group/avatar">
              <div className="w-40 h-40 rounded-full border-4 border-rose-500 p-1 bg-gray-900 shadow-2xl transition-transform hover:scale-105 duration-500">
                <img
                  src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-2 right-2 p-3 bg-white text-gray-950 rounded-full shadow-2xl hover:bg-rose-500 hover:text-white transition-all scale-0 group-hover/avatar:scale-100 duration-300"
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
              </div>
              <input type="file" hidden ref={fileRef} accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
              {fileUploadError && (
                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 text-center text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">
                  {typeof fileUploadError === 'string' ? fileUploadError : 'Error uploading image'}
                </p>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic">
                  {currentUser?.username || 'ELITE USER'}
                </h1>
                {currentUser?.isVerified && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Email verified</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                <EnvelopeIcon className="w-4 h-4 text-rose-500" />
                {currentUser?.email}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                 {[
                   { label: "Elite Points", value: currentUser?.points ?? 0, color: "text-purple-400" },
                   { label: "Email status", value: currentUser?.isVerified ? "Verified" : "Unverified", color: currentUser?.isVerified ? "text-emerald-400" : "text-amber-400" },
                   { label: "Deployments", value: postCount || "0", color: "text-blue-400" },
                   { label: "Active Connections", value: currentUser?.followers?.length || 0, color: "text-indigo-400" }
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.label}</span>
                      <span className={`text-xl font-black ${stat.color} italic tracking-tight`}>{stat.value}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* View Signals Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => handleNavigate('/messages')}
                className="w-full sm:w-auto px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Protocol Signals
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-5 bg-white text-gray-950 hover:bg-rose-50 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
              >
                <HomeIcon className="w-5 h-5" />
                Return to Core
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Masterpiece Command Menu */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="bg-white rounded-[3rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden p-4">
                <div className="p-4 mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 pl-4">System Protocols</h3>
                  <div className="space-y-2">
                    <MenuItem
                      icon={UserIcon}
                      label="Identity Parameters"
                      active={activeSection === "personal"}
                      onClick={() => setActiveSection("personal")}
                    />
                    <MenuItem
                      icon={ShieldCheckIcon}
                      label="Security Protocols"
                      active={activeSection === "login"}
                      onClick={() => setActiveSection("login")}
                    />
                    <MenuItem
                      icon={BellIcon}
                      label="Signal Alerts"
                      active={activeSection === "notifications"}
                      onClick={() => setActiveSection("notifications")}
                    />
                    <MenuItem
                      icon={GlobeAltIcon}
                      label="Privacy Firewall"
                      active={activeSection === "privacy"}
                      onClick={() => setActiveSection("privacy")}
                    />
                    <MenuItem
                      icon={HomeIcon}
                      label="Command Dashboard"
                      active={activeSection === "host-account"}
                      onClick={() => setActiveSection("host-account")}
                    />
                    <MenuItem
                      icon={HeartIcon}
                      label="Wishlist Vault"
                      active={activeSection === "wishlist"}
                      onClick={() => setActiveSection("wishlist")}
                    />
                    <MenuItem
                      icon={ListBulletIcon}
                      label="Active Deployments"
                      active={activeSection === "my-listings"}
                      onClick={() => setActiveSection("my-listings")}
                      badge={userListings?.length || 0}
                    />
                    <MenuItem
                      icon={TrophyIcon}
                      label="Elite Rewards"
                      active={false}
                      onClick={() => navigate('/rewards')}
                      badge="NEW"
                    />
                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 mb-4 mx-4" />

                <div className="p-4 space-y-4">
                  <SettingsRow
                    icon={QuestionMarkCircleIcon}
                    title="Intelligence Support"
                    description="Manuals & Core Support"
                    onClick={handleNavigateToHelp}
                  />
                  <SettingsRow
                    icon={ArrowRightOnRectangleIcon}
                    title="Sign out"
                    description="Securely disconnect"
                    onClick={handleSignOut}
                    danger
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Masterpiece Elite Style */}
          <div className="lg:col-span-8">
            {/* Personal Info Section */}
            {activeSection === "personal" && (
              <>
                <SectionCard title="Personal info" icon={UserIcon}>
                  <div className="max-w-2xl">
                    {/* Profile Completion Progress */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 text-sm">Profile Completion</h4>
                        <span className="text-sm font-black text-rose-600">{profileCompletion}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                      {profileCompletion < 100 && (
                        <p className="text-xs text-gray-500 mt-3 font-medium">
                          Complete your profile to increase your trust score and visibility.
                        </p>
                      )}
                    </div>

                    {/* Cover Photo Upload */}
                    <div className="mb-8 p-1 bg-gray-50 rounded-2xl border border-dashed border-[#DDDDDD] overflow-hidden">
                      <div className="relative h-40 md:h-48 group cursor-pointer" onClick={() => coverFileRef.current.click()}>
                        <img
                          src={formData.coverPhoto || currentUser?.coverPhoto || "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"}
                          alt="Cover"
                          className="w-full h-full object-cover rounded-xl transition-opacity hover:opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                          <div className="bg-white/90 p-3 rounded-full shadow-lg">
                            <FaCamera className="text-[#FF5A5F] w-6 h-6" />
                          </div>
                        </div>
                        {coverFilePerc > 0 && coverFilePerc < 100 && (
                          <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-300" style={{ width: `${coverFilePerc}%` }}></div>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-[#484848] shadow-sm flex items-center gap-2">
                           <FaCamera size={12} />
                           Change Cover
                        </div>
                      </div>
                      <input
                        type="file"
                        hidden
                        ref={coverFileRef}
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files[0])}
                      />
                    </div>
                    {coverFileUploadError && (
                      <p className="text-xs text-rose-500 font-bold mt-2 mb-4 bg-rose-50 px-3 py-2 rounded-lg">
                        {typeof coverFileUploadError === 'string' ? coverFileUploadError : 'Error uploading cover photo'}
                      </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Legal name"
                          id="username"
                          value={formData.username || currentUser?.username || ''}
                          handleChange={handleChange}
                          icon={UserIcon}
                        />
                        <InputField
                          label="Email address"
                          type="email"
                          id="email"
                          value={formData.email || currentUser?.email || ''}
                          handleChange={handleChange}
                          readOnly
                          helperText="Email changes require account verification support."
                          icon={EnvelopeIcon}
                        />
                      </div>

                      <InputField
                        label="Phone number"
                        type="tel"
                        id="phone"
                        value={formData.phone || currentUser?.phone || ''}
                        handleChange={handleChange}
                        icon={PhoneIcon}
                      />

                      <InputField
                        label="Where you live"
                        id="location"
                        value={formData.location || currentUser?.location || ''}
                        handleChange={handleChange}
                        icon={MapPinIcon}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Occupation"
                          id="occupation"
                          value={formData.occupation || currentUser?.occupation || ''}
                          handleChange={handleChange}
                          icon={FaUserTie}
                        />
                        <InputField
                          label="Interests"
                          id="interests"
                          value={formData.interests || currentUser?.interests || ''}
                          handleChange={handleChange}
                          icon={HeartIcon}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Website"
                          id="website"
                          value={formData.website || currentUser?.website || ''}
                          handleChange={handleChange}
                          icon={MdLink}
                        />
                        <InputField
                          label="Social media"
                          id="socialMedia"
                          value={formData.socialMedia || currentUser?.socialMedia || ''}
                          handleChange={handleChange}
                          icon={MdShare}
                        />
                      </div>

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

                      {/* Identity & Account Verification Section */}
                      <div className="pt-6 border-t border-[#DDDDDD] space-y-6">
                        <div>
                          <h4 className="font-semibold text-[#484848] mb-4 flex items-center gap-2">
                             <ShieldCheckIcon className="w-5 h-5 text-[#FF5A5F]" />
                             Account Verification
                          </h4>
                          
                          {/* Face Verification Row */}
                          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-[#484848]">Face Recognition</p>
                              <p className="text-sm text-[#767676] mt-1">
                                Complete identity verification through the secure verification flow
                              </p>
                            </div>
                            {!isFaceVerified ? (
                              <button
                                type="button"
                                onClick={handleNavigateToVerification}
                                className="px-4 py-2 border border-[#484848] rounded-lg text-[#484848] font-medium hover:bg-white transition-colors"
                              >
                                Verify identity
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#00A699] font-medium bg-[#00A699]/10 px-3 py-1 rounded-full">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                          </div>

                          {/* Phone Verification Row */}
                          <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-[#484848]">Email Verification</p>
                                <p className="text-sm text-[#767676] mt-1">
                                  Confirm that you control your account email address
                                </p>
                              </div>
                              {currentUser?.isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[#00A699] font-medium bg-[#00A699]/10 px-3 py-1 rounded-full">
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                  Verified
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsVerifyingPhone(true)}
                                  className="px-4 py-2 border border-[#484848] rounded-lg text-[#484848] font-medium hover:bg-white transition-colors"
                                >
                                  {isVerifyingPhone ? 'Cancel' : 'Verify Now'}
                                </button>
                              )}
                            </div>

                            {isVerifyingPhone && !currentUser?.isVerified && (
                              <div className="mt-2 space-y-4 animate-fadeIn border-t border-gray-100 pt-4">
                                {!otpSent ? (
                                  <div className="flex flex-col gap-3">
                                    <p className="text-xs text-[#767676]">
                                      We will send a code to <strong>{currentUser?.email}</strong>
                                    </p>
                                    <button
                                      type="button"
                                      disabled={otpLoading}
                                      onClick={handleRequestPhoneOtp}
                                      className="bg-[#484848] text-white py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                      {otpLoading ? 'Sending...' : 'Send Code'}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-3">
                                    <input
                                      type="text"
                                      maxLength="6"
                                      placeholder="6-digit code"
                                      value={verificationOtp}
                                      onChange={(e) => setVerificationOtp(e.target.value)}
                                      className="w-full px-4 py-2 border border-[#DDDDDD] rounded-xl text-center font-bold tracking-[0.5em] text-lg focus:ring-2 focus:ring-[#FF5A5F] outline-none"
                                    />
                                    {otpDebug && (
                                       <p className="text-[10px] text-[#00A699] font-mono text-center">Development Code: {otpDebug}</p>
                                    )}
                                    <button
                                      type="button"
                                      disabled={otpLoading || verificationOtp.length < 6}
                                      onClick={handleVerifyPhoneOtp}
                                      className="bg-[#FF5A5F] text-white py-2 rounded-lg font-medium hover:bg-[#E00B41] transition-colors disabled:opacity-50"
                                    >
                                      {otpLoading ? 'Verifying...' : 'Confirm Verification'}
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setOtpSent(false)}
                                      className="text-[10px] text-[#767676] hover:underline"
                                    >
                                      Didn't get a code? Resend
                                    </button>
                                  </div>
                                )}
                                {verificationError && (
                                  <p className="text-xs text-red-500 font-medium">{verificationError}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contacts Access Row */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                             <div>
                                <p className="font-medium text-[#484848]">loopOut Contact Access</p>
                                <p className="text-sm text-[#767676] mt-1">Allow loopOut to sync your contacts for easy connections</p>
                             </div>
                             <ToggleSwitch enabled={accessContacts} setEnabled={setAccessContacts} />
                          </div>
                          {accessContacts && (
                            <p className="text-[10px] text-[#00A699] font-medium flex items-center gap-1">
                               <CheckCircleIcon className="w-2.5 h-2.5" /> Contact syncing active
                            </p>
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
                          <CheckCircleIcon className="w-[18px] h-[18px]" />
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
              <SectionCard title="Login & security" icon={ShieldCheckIcon}>
                <form onSubmit={handleSecuritySubmit} className="max-w-2xl space-y-8">
                  <div>
                    <h4 className="font-semibold text-[#484848] mb-4">Password</h4>
                    <div className="space-y-4">
                      <InputField
                        label="Current password"
                        type="password"
                        id="currentPassword"
                        value={securityForm.currentPassword}
                        handleChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <InputField
                        label="New password"
                        type="password"
                        id="newPassword"
                        value={securityForm.newPassword}
                        helperText="Use at least 12 characters."
                        handleChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      Save changes
                    </button>
                  </div>
                </form>
              </SectionCard>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <SectionCard title="Notifications" icon={BellIcon}>
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
                    <button type="button" onClick={() => saveSettings({ notificationPreferences: notifications })} className="bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      Save preferences
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <SectionCard title="Privacy & sharing" icon={GlobeAltIcon}>
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

                  <div className="flex justify-end">
                    <button type="button" onClick={() => saveSettings({ profileVisibility, sharedInfo, dataSharing })} className="bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      Save privacy settings
                    </button>
                  </div>

                  <div className="pt-6 border-t border-[#DDDDDD]">
                    <h4 className="font-semibold text-[#484848] mb-4">Data management</h4>
                    <div className="space-y-3">
                      <button type="button" onClick={handleDownloadData} className="flex items-center justify-between w-full p-4 border border-[#DDDDDD] rounded-lg hover:bg-[#F7F7F7] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center">
                            <ArrowDownTrayIcon className="w-5 h-5 text-[#484848]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-[#484848]">Download your data</p>
                            <p className="text-sm text-[#767676]">Get a copy of your personal information</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-[#767676]" />
                      </button>

                      <button
                        onClick={handleDeleteUser}
                        className="flex items-center justify-between w-full p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <TrashIcon className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-red-600">Delete account</p>
                            <p className="text-sm text-red-400">Permanently remove your account</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-red-400" />
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
                      <StarIcon className="w-5 h-5 text-[#FF5A5F] fill-[#FF5A5F]" />
                    </div>
                  </div>
                </div>

                <SectionCard title="Hosting tools" icon={HomeIcon}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleNavigateToHostDashboard}
                      className="p-6 border border-[#DDDDDD] rounded-xl hover:border-[#FF5A5F] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4 group-hover:bg-[#FF5A5F]/10">
                        <ChartBarIcon className="w-6 h-6 text-[#FF5A5F]" />
                      </div>
                      <h4 className="font-semibold text-[#484848] mb-1">Dashboard</h4>
                      <p className="text-sm text-[#767676]">View performance insights</p>
                    </button>

                    <button
                      onClick={handleNavigateToEarnings}
                      className="p-6 border border-[#DDDDDD] rounded-xl hover:border-[#FF5A5F] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4 group-hover:bg-[#FF5A5F]/10">
                        <WalletIcon className="w-6 h-6 text-[#FF5A5F]" />
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
                          <TrophyIcon className="w-6 h-6 text-[#FF5A5F]" />
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
              <SectionCard title="Wishlists" icon={HeartIcon}>
                <p className="text-[#767676] mb-6">Places you've saved for future trips</p>
                <WishList />
              </SectionCard>
            )}

            {/* My Listings Section */}
            {activeSection === "my-listings" && (
              <SectionCard title="My listings" icon={ListBulletIcon}>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[#767676]">Manage your properties</p>
                  <Link
                    to={`/${currentUser?._id}/create-listing`}
                    className="flex items-center gap-2 bg-[#FF5A5F] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E00B41] transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
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
                              <PencilSquareIcon className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleListingDelete(listing._id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#F7F7F7] rounded-xl">
                    <HomeIcon className="w-12 h-12 mx-auto text-[#DDDDDD] mb-4" />
                    <h4 className="text-lg font-semibold text-[#484848] mb-2">No listings yet</h4>
                    <p className="text-[#767676] mb-6">Start hosting and earn income</p>
                    <Link
                      to={`/${currentUser?._id}/create-listing`}
                      className="inline-flex items-center gap-2 bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors"
                    >
                      <PlusIcon className="w-[18px] h-[18px]" />
                      Create your first listing
                    </Link>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Events Section */}
            {activeSection === "events" && (
              <SectionCard title="My events" icon={CalendarIcon}>
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
                                    <CalendarIcon className="w-3.5 h-3.5" /> {event.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPinIcon className="w-3.5 h-3.5" /> {event.address}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  to={`/update-event/${event._id}`}
                                  className="p-2 text-[#484848] hover:bg-[#F7F7F7] rounded-lg transition-colors"
                                >
                                  <PencilSquareIcon className="w-[18px] h-[18px]" />
                                </Link>
                                <button
                                  onClick={() => handleEventDelete(event._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <TrashIcon className="w-[18px] h-[18px]" />
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
                    <CalendarIcon className="w-12 h-12 mx-auto text-[#DDDDDD] mb-4" />
                    <h4 className="text-lg font-semibold text-[#484848] mb-2">No events yet</h4>
                    <p className="text-[#767676] mb-6">Create events to connect with your community</p>
                    <button className="inline-flex items-center gap-2 bg-[#FF5A5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors">
                      <PlusIcon className="w-[18px] h-[18px]" />
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
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-[#484848] mb-1">{currentUser?.username || 'User'}</h2>
              <div className="flex items-center justify-center gap-2 text-[#767676] mb-4">
                <MapPinIcon className="w-4 h-4" />
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
                icon={PhoneIcon}
              />

              <p className="text-xs text-[#767676] mb-4">
                Opening WhatsApp does not verify your account or grant access to your number.
              </p>
              <button
                type="button"
                onClick={handleConnectWhatsApp}
                className="w-full bg-[#FF5A5F] text-white py-3 rounded-lg font-semibold hover:bg-[#E00B41] transition-colors flex items-center justify-center gap-2"
              >
                <FaWhatsapp size={20} />
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
