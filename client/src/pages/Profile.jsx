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
  MdLock
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
  FaCamera
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
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import WishList from "./WishListProfile";
import MyListing from "./MyListing";
import { Camera, CheckCircle, X } from 'lucide-react';

// Import face-api.js - Check if you have the models available
// You need to have face-api.js models in your public folder at /models
// OR use a CDN or disable face recognition if not needed

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
    className={`${enabled ? 'bg-black' : 'bg-gray-300'
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
      className="form-checkbox h-5 w-5 text-black rounded border-gray-300 focus:ring-black"
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
const SectionCard = ({ children, title, icon }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-gray-600">{icon}</div>}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
    )}
    {children}
  </div>
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

  // Face Recognition States - Disabled by default until models are properly set up
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

  // Camera Functions - Simplified version without face-api.js
  const startCamera = async () => {
    try {
      // Check if face recognition is properly set up
      if (!faceRecognitionEnabled) {
        setFaceUploadError("Face recognition is not properly configured. Please contact support.");
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
      setFaceUploadError("Camera access denied. Please allow camera permissions and ensure you're using HTTPS.");
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setFaceUploadError("Camera not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setFaceUploadError(false);

    try {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setFaceUploadError("Failed to capture image. Please try again.");
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
      setFaceUploadError("Failed to capture image. Please try again.");
      setIsProcessing(false);
    }
  };

  const processCameraCapture = async (file) => {
    try {
      setIsProcessing(true);
      setFaceUploadError(false);

      // Upload to Firebase Storage
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
            
            // Simplified verification - just save the image URL
            const newFaceData = {
              imageUrl: downloadURL,
              verified: true,
              verifiedAt: new Date().toISOString(),
              method: 'camera'
            };
            
            // Save to user profile
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Account</h1>
        <p className="text-gray-600 mt-2">Manage your personal information, privacy, and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  {isFaceVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full">
                      <MdVerifiedUser className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{currentUser?.username || 'User'}</h2>
                  <p className="text-sm text-gray-600">{currentUser?.email || 'user@example.com'}</p>
                  <button
                    onClick={() => fileRef.current.click()}
                    className="text-sm text-gray-600 hover:text-gray-900 mt-1"
                  >
                    <input
                      type="file"
                      hidden
                      ref={fileRef}
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    Change photo
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {[
                  { id: "personal", label: "Personal Info", icon: <UserIcon className="w-5 h-5" /> },
                  { id: "login", label: "Login & Security", icon: <ShieldCheckIcon className="w-5 h-5" /> },
                  { id: "notifications", label: "Notifications", icon: <BellIcon className="w-5 h-5" /> },
                  { id: "privacy", label: "Privacy & Sharing", icon: <FaEye className="w-5 h-5" /> },
                  { id: "hosting", label: "Host an Experience", icon: <HomeIcon className="w-5 h-5" /> },
                  { id: "wishlist", label: "Wishlist", icon: <HeartIcon className="w-5 h-5" /> },
                  { id: "my-listings", label: "My Listings", icon: <ListBulletIcon className="w-5 h-5" /> },
                  { id: "events", label: "My Events", icon: <MdCalendarToday className="w-5 h-5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${activeSection === tab.id
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Sign Out Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  Sign out
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
              <SectionCard title="Personal Information" icon={<UserIcon className="w-6 h-6" />}>
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
                    placeholder="Tell us about yourself"
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

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">Identity Verification</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Add a photo to verify your identity
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-sm font-medium text-gray-900 hover:text-black"
                      >
                        {isFaceVerified ? 'Re-verify' : 'Verify now'}
                      </button>
                    </div>
                    {isFaceVerified && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span>Your identity has been verified</span>
                        </div>
                      </div>
                    )}
                    {modelLoadingError && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <XCircleIcon className="w-5 h-5" />
                          <span className="text-sm">Advanced face recognition is currently unavailable</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>

                {updateSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">Profile updated successfully!</p>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {/* Login & Security Section */}
          {activeSection === "login" && (
            <>
              <SectionCard title="Login & Security" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Password</h4>
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
                        <h4 className="font-medium text-gray-900">Two-factor authentication</h4>
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
                    <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      Save changes
                    </button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <>
              <SectionCard title="Notifications" icon={<BellIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Email notifications</h4>
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
                        helperText="Get exclusive deals and discounts"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Security alerts</h4>
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
                    <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      Save preferences
                    </button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Privacy & Sharing Section */}
          {activeSection === "privacy" && (
            <>
              <SectionCard title="Privacy & Sharing" icon={<FaEye className="w-6 h-6" />}>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Profile visibility</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                    <h4 className="font-medium text-gray-900 mb-4">Shared information</h4>
                    <div className="space-y-1">
                      <Checkbox
                        label="Show booking history"
                        checked={sharedInfo.bookingHistory}
                        onChange={() => toggleSharedInfo('bookingHistory')}
                        helperText="Display past trips on your profile"
                      />
                      <Checkbox
                        label="Show reviews"
                        checked={sharedInfo.reviews}
                        onChange={() => toggleSharedInfo('reviews')}
                        helperText="Make your written reviews publicly visible"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Data management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium">Download your data</p>
                          <p className="text-sm text-gray-600">Get a copy of your personal data</p>
                        </div>
                        <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={handleDeleteUser}
                        className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                      >
                        <div>
                          <p className="font-medium">Delete account</p>
                          <p className="text-sm">Permanently remove your account</p>
                        </div>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      Save privacy settings
                    </button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Host an Experience Section */}
          {activeSection === "hosting" && (
            <>
              <SectionCard title="Host an Experience" icon={<HomeIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ready to host?</h3>
                    <p className="text-gray-600 mb-6">
                      Share your space or create unique experiences for travelers from around the world.
                      Earn money doing what you love while providing memorable stays.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h4 className="font-medium text-blue-900 mb-3">Why host on our platform?</h4>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Earn competitive income
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Reach millions of travelers
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        24/7 support and protection
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Link
                      to={`/${currentUser?._id}/create-listing`}
                      className="inline-flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <HomeIcon className="w-5 h-5 mr-2" />
                      Start hosting
                    </Link>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Wishlist Section */}
          {activeSection === "wishlist" && (
            <>
              <SectionCard title="Wishlist" icon={<HeartIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Saved listings</h3>
                    <p className="text-gray-600 mb-6">
                      Your collection of favorite places to stay. Bookmark listings you're interested in
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
              <SectionCard title="My Listings" icon={<ListBulletIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Your listings</h3>
                      <p className="text-gray-600 mt-1">Manage your active properties</p>
                    </div>
                    <Link
                      to={`/${currentUser?._id}/create-listing`}
                      className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      + New listing
                    </Link>
                  </div>

                  <button
                    onClick={handleShowListings}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Show all listings
                  </button>

                  {userListings && userListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userListings.slice(0, visibleListings).map((listing) => (
                        <div
                          key={listing._id}
                          className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={listing.imageUrls[0] || "https://via.placeholder.com/300x200"}
                            alt={listing.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 truncate">{listing.name}</h4>
                              <span className="text-lg font-semibold text-gray-900">
                                R{listing.offer ? listing.discountPrice?.toLocaleString() : listing.regularPrice?.toLocaleString()}
                                {listing.type === 'rent' && '/month'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                              <span className="flex items-center gap-1">
                                <FaBed className="w-4 h-4" /> {listing.bedrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaBath className="w-4 h-4" /> {listing.bathrooms}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/update-listing/${listing._id}`}
                                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-center hover:bg-gray-200 transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleListingDelete(listing._id)}
                                className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">You haven't created any listings yet.</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </>
          )}

          {/* My Events Section */}
          {activeSection === "events" && (
            <>
              <SectionCard title="My Events" icon={<MdCalendarToday className="w-6 h-6" />}>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Your events</h3>
                      <p className="text-gray-600 mt-1">Manage your upcoming events</p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {postCount} total
                    </span>
                  </div>

                  {userEvents.length > 0 ? (
                    <div className="space-y-4">
                      {userEvents.slice(0, visibleEvents).map((event) => (
                        <div
                          key={event._id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            {event.imageUrls?.[0] && (
                              <img
                                src={event.imageUrls[0]}
                                alt={event.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900">{event.name}</h4>
                                <div className="flex gap-2">
                                  <Link
                                    to={`/update-event/${event._id}`}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleEventDelete(event._id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <span className="flex items-center gap-1">
                                  <MdCalendarToday className="w-4 h-4" /> {event.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MdLocationOn className="w-4 h-4" /> {event.address}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MdCalendarToday className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">You haven't created any events yet.</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>

      {/* Camera Modal for Face Verification */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Verify your identity</h3>
                <button
                  onClick={stopCamera}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Position your face in the frame and ensure good lighting
              </p>
            </div>
            
            <div className="p-6">
              <div className="relative mx-auto max-w-md">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white rounded-lg opacity-60"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" width="640" height="480" />
              </div>
              
              <div className="flex flex-col items-center mt-6 space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={captureFace}
                    disabled={isProcessing}
                    className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Capture & Verify
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}