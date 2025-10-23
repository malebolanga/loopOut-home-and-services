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
import { MdLocationOn } from 'react-icons/md';
import { FaBath, FaBed, FaArrowRight, FaEdit, FaCalendarAlt } from "react-icons/fa";
import {
  AddCircle,
} from "@mui/icons-material";
import {
  ShareIcon,
  LockClosedIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import WishList from "./WishListProfile";
import MyListing from "./MyListing";

// Import face-api.js components
import * as faceapi from 'face-api.js';
import { Camera, Upload, CheckCircle, X } from 'lucide-react';

// Reusable InputField Component
const InputField = ({ label, id, type = "text", value, handleChange, helperText, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
    />
    {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
  </div>
);

// Reusable ToggleSwitch Component
const ToggleSwitch = ({ enabled, setEnabled }) => (
  <button
    type="button"
    onClick={() => setEnabled(!enabled)}
    className={`${enabled ? 'bg-red-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2`}
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
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      className="form-checkbox h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
      checked={checked}
      onChange={onChange}
    />
    <div>
      <span className="text-gray-800">{label}</span>
      {helperText && <p className="text-sm text-gray-500 mt-0.5">{helperText}</p>}
    </div>
  </label>
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

  // Face Recognition States
  const [faceUploadPerc, setFaceUploadPerc] = useState(0);
  const [faceUploadError, setFaceUploadError] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [showFaceUpload, setShowFaceUpload] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const faceImageRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading face recognition models...');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('Face API models loaded successfully');
      } catch (error) {
        console.error('Error loading face models:', error);
        setFaceUploadError('Failed to load face recognition system. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  // Load existing face data from user profile
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

  // Face Recognition Functions
  const handleFaceImageUpload = (file) => {
    if (!modelsLoaded) {
      setFaceUploadError("Face recognition system is still loading. Please wait...");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setFaceUploadError("File size too large. Please select an image under 2MB.");
      return;
    }

    setIsProcessing(true);
    setFaceUploadError(false);
    const storage = getStorage(app);
    const fileName = `face_${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFaceUploadPerc(Math.round(progress));
      },
      (error) => {
        setFaceUploadError("Upload failed: " + error.message);
        setIsProcessing(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await processFaceDetection(downloadURL);
        } catch (error) {
          setFaceUploadError("Processing failed: " + error.message);
          setIsProcessing(false);
        }
      }
    );
  };

  const processFaceDetection = async (imageUrl) => {
    if (!modelsLoaded) {
      setFaceUploadError("Face recognition system is not ready");
      setIsProcessing(false);
      return;
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      
      img.onload = async () => {
        try {
          // Detect face with landmarks and descriptor
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            const faceDescriptor = Array.from(detection.descriptor);
            
            const newFaceData = {
              imageUrl: imageUrl,
              descriptor: faceDescriptor,
              detectedAt: new Date().toISOString()
            };
            
            setFaceData(newFaceData);
            setIsFaceVerified(true);
            setIsProcessing(false);

            // Save to user profile
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                faceData: {
                  ...newFaceData,
                  verified: true
                }
              }),
            });

            const data = await res.json();
            if (data.success === false) {
              setFaceUploadError("Failed to save face data: " + data.message);
              return;
            }

            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
          } else {
            setFaceUploadError("No face detected in the image. Please upload a clear front-facing photo.");
            setIsProcessing(false);
          }
        } catch (detectionError) {
          setFaceUploadError("Face detection failed. Please try with a different image.");
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setFaceUploadError("Failed to load image for processing");
        setIsProcessing(false);
      };
    } catch (error) {
      setFaceUploadError("Processing error: " + error.message);
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
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
      setFaceUploadError("Camera access denied. Please allow camera permissions in your browser settings.");
    }
  };

  const captureFace = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      
      canvasRef.current.toBlob(async (blob) => {
        const file = new File([blob], `face_capture_${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        await handleFaceImageUpload(file);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
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
        setFaceUploadError("Failed to remove face data: " + data.message);
        return;
      }

      setFaceData(null);
      setIsFaceVerified(false);
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error removing face data:", error);
      setFaceUploadError("Failed to remove face data");
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
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Your Profile</h1>
        <p className="text-gray-600 text-lg">Manage your personal information, security, and preferences.</p>

        {/* Enhanced Avatar Upload */}
        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div
          className="relative cursor-pointer mt-8 mb-4"
          onClick={() => fileRef.current.click()}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative">
            <img
              src={formData.avatar || currentUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt="Profile"
              className="h-40 w-40 rounded-full object-cover shadow-lg ring-4 ring-white transition-transform duration-300 hover:scale-105"
            />
            <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity ${isHovering ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
              <span className="text-white text-md font-medium">Change Photo</span>
            </div>
          </div>

          {/* Upload indicator ring */}
          {filePerc > 0 && filePerc < 100 && (
            <div className="absolute inset-0">
              <div className="h-40 w-40 rounded-full">
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                  style={{
                    transform: `rotate(${filePerc * 3.6}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced File upload progress/error feedback */}
        {fileUploadError ? (
          <p className="text-red-600 text-sm mb-4 font-medium">
            Error uploading image (max 2 MB allowed)
          </p>
        ) : filePerc > 0 && filePerc < 100 ? (
          <div className="w-full max-w-xs mx-auto mb-4">
            <div className="flex justify-between text-sm text-slate-700 mb-1">
              <span>Uploading...</span>
              <span>{filePerc}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${filePerc}%` }}
              ></div>
            </div>
          </div>
        ) : filePerc === 100 ? (
          <p className="text-green-600 text-sm mb-4 font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Image successfully uploaded!
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Click on your photo to upload a new one (max 2MB)
          </p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { id: "personal", label: "Personal Info", icon: "👤" },
          { id: "login", label: "Login & Security", icon: "🔒" },
          { id: "notifications", label: "Notifications", icon: "🔔" },
          { id: "privacy", label: "Privacy & Sharing", icon: "👥" },
          { id: "hosting", label: "Host an Experience", icon: "💡" },
          { id: "wishlist", label: "Your Wishlist", icon: "❤️" },
          { id: "my-listings", label: "My Listings", icon: "🏠" },
          { id: "events", label: "My Events", icon: "🎪" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl font-medium transition-all duration-300 shadow-sm
              ${activeSection === tab.id 
                ? "bg-red-600 text-white transform scale-105" 
                : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md"}`
            }
          >
            <div className="text-3xl mb-2 h-10 w-10 flex items-center justify-center">
              {tab.icon}
            </div>
            <span className="text-sm text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section Content Container */}
      <div className="bg-white p-4 border border-gray-100 rounded-3xl shadow-xl">
        {activeSection === "personal" && (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Personal Information</h2>
            
            {/* Face Recognition Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-200 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Face Recognition Profile
              </h3>
              
              <div className="space-y-4">
                {!faceData ? (
                  <div className="text-center">
                    <p className="text-gray-700 mb-4">
                      Add your face profile for quick identification across listings, services, and events
                    </p>
                    
                    <div className="flex gap-4 justify-center flex-wrap">
                      <button
                        onClick={() => setShowFaceUpload(true)}
                        disabled={isProcessing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-4 h-4" />
                        {isProcessing ? 'Processing...' : 'Upload Photo'}
                      </button>
                      
                      <button
                        onClick={startCamera}
                        disabled={isProcessing}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed"
                      >
                        <Camera className="w-4 h-4" />
                        Use Camera
                      </button>
                    </div>

                    {!modelsLoaded && (
                      <p className="text-yellow-600 text-sm mt-3">
                        Loading face recognition system...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
                      <div className="relative">
                        <img
                          src={faceData.imageUrl}
                          alt="Face profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-green-500 shadow-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-green-700 font-semibold flex items-center gap-2 text-lg">
                          Face Profile Verified
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your face profile is active and will be used for identification across the platform
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Verified on: {new Date(faceData.detectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setShowFaceUpload(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        Update Face Profile
                      </button>
                      <button
                        onClick={removeFaceData}
                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Remove Face Data
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Camera Interface */}
                {cameraActive && (
                  <div className="bg-black p-4 rounded-lg">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                      <div className="flex gap-4 justify-center mt-4">
                        <button
                          onClick={captureFace}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Capture Photo
                        </button>
                        <button
                          onClick={stopCamera}
                          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <p className="text-white text-sm text-center mt-2">
                      Position your face in the center and ensure good lighting
                    </p>
                  </div>
                )}
                
                {/* File Upload Interface */}
                {showFaceUpload && !cameraActive && (
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white">
                    <input
                      type="file"
                      hidden
                      ref={faceImageRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFaceImageUpload(e.target.files[0]);
                          setShowFaceUpload(false);
                        }
                      }}
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-700 mb-2 font-medium">
                        Upload a clear front-facing photo
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Make sure your face is clearly visible with good lighting
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => faceImageRef.current.click()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Choose File
                        </button>
                        <button
                          onClick={() => setShowFaceUpload(false)}
                          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Upload Progress */}
                {(faceUploadPerc > 0 && faceUploadPerc < 100) || isProcessing ? (
                  <div className="w-full mx-auto">
                    <div className="flex justify-between text-sm text-slate-700 mb-1">
                      <span>{isProcessing ? 'Processing face...' : 'Uploading...'}</span>
                      <span>{faceUploadPerc}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${faceUploadPerc}%` }}
                      ></div>
                    </div>
                  </div>
                ) : null}
                
                {faceUploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm text-center">
                      {faceUploadError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField 
                label="Username" 
                type="text" 
                id="username" 
                value={formData.username || currentUser?.username || ''} 
                handleChange={handleChange} 
              />
              <InputField 
                label="Email" 
                type="email" 
                id="email" 
                value={formData.email || currentUser?.email || ''} 
                handleChange={handleChange} 
              />
              <InputField 
                label="Location" 
                type="text" 
                id="location" 
                value={formData.location || currentUser?.location || ''} 
                handleChange={handleChange} 
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Profile"
                )}
              </button>
              {updateSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-center">Profile updated successfully!</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-center">{error}</p>
                </div>
              )}
            </form>
          </>
        )}

        {activeSection === "login" && (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Login & Security</h2>
            <div className="space-y-8">
              {/* Login Security Section */}
              <div className="p-4 rounded-lg  border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Password Management</h3>
                <div className="space-y-6">
                  <InputField
                    label="Current Password"
                    type="password"
                    id="currentPassword"
                    handleChange={handleChange}
                    placeholder="Enter current password"
                  />
                  <InputField
                    label="New Password"
                    type="password"
                    id="newPassword"
                    handleChange={handleChange}
                    placeholder="Enter new password"
                    helperText="Minimum 8 characters with at least one number and special character"
                  />
                  <InputField
                    label="Confirm New Password"
                    type="password"
                    id="confirmNewPassword"
                    handleChange={handleChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Enable 2FA</h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={twoFactorEnabled}
                    setEnabled={setTwoFactorEnabled}
                  />
                </div>
                {twoFactorEnabled && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 mb-3">
                      Two-factor authentication is enabled. You ll need to verify your identity using:
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-700">
                        <input
                          type="radio"
                          name="2fa-method"
                          value="sms"
                          checked={twoFactorMethod === 'sms'}
                          onChange={(e) => setTwoFactorMethod(e.target.value)}
                          className="form-radio text-red-600 h-4 w-4"
                        />
                        SMS Verification
                      </label>
                      <label className="flex items-center gap-2 text-gray-700">
                        <input
                          type="radio"
                          name="2fa-method"
                          value="authenticator"
                          checked={twoFactorMethod === 'authenticator'}
                          onChange={(e) => setTwoFactorMethod(e.target.value)}
                          className="form-radio text-red-600 h-4 w-4"
                        />
                        Authenticator App
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}

        {activeSection === "notifications" && (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Notification Preferences</h2>
            <div className="space-y-8">
              {/* Notification Categories */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Alerts & Updates</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="notification-category">
                    <h4 className="font-medium mb-3">Security Alerts</h4>
                    <div className="space-y-3">
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

                  <div className="notification-category">
                    <h4 className="font-medium mb-3">Account Activity</h4>
                    <div className="space-y-3">
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
                    </div>
                  </div>

                  <div className="notification-category">
                    <h4 className="font-medium mb-3">Promotions & News</h4>
                    <div className="space-y-3">
                      <Checkbox
                        label="Special offers"
                        checked={notifications.promotions.specialOffers}
                        onChange={() => toggleNotification('promotions', 'specialOffers')}
                        helperText="Get exclusive deals and discounts"
                      />
                      <Checkbox
                        label="Platform updates"
                        checked={notifications.promotions.platformUpdates}
                        onChange={() => toggleNotification('promotions', 'platformUpdates')}
                        helperText="Stay informed about new features and improvements"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Methods */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Delivery Methods</h3>
                <div className="flex gap-6">
                  <Checkbox
                    label="Email"
                    checked={true}
                    onChange={() => { }}
                    helperText="Receive notifications via email"
                  />
                  <Checkbox
                    label="In-app Notifications"
                    checked={true}
                    onChange={() => { }}
                    helperText="View alerts directly within the app"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md"
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          </>
        )}

        {activeSection === "privacy" && (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Privacy & Sharing</h2>
            <div className="space-y-8">
              {/* Profile Visibility Section */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Profile Visibility</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Public Profile</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Make your profile visible to other users and search engines
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={profileVisibility}
                      setEnabled={setProfileVisibility}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Contact Information</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Control who can see your email and phone number
                      </p>
                    </div>
                    <select
                      value={contactVisibility}
                      onChange={(e) => setContactVisibility(e.target.value)}
                      className="rounded-lg border-gray-300 text-sm py-2 px-3 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="private">Private</option>
                      <option value="verified-users">Signed Up Users</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shared Information */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Shared Information</h3>
                <div className="space-y-4">
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
                  <Checkbox
                    label="Show social connections"
                    checked={sharedInfo.socialConnections}
                    onChange={() => toggleSharedInfo('socialConnections')}
                    helperText="Display linked social media accounts"
                  />
                </div>
              </div>

              {/* Data Sharing Preferences */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Data Sharing Preferences</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="data-sharing-category">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <ShareIcon className="w-5 h-5 text-green-600" />
                      Third-Party Sharing
                    </h4>
                    <div className="space-y-3">
                      <Checkbox
                        label="Allow marketing analytics"
                        checked={dataSharing.marketing}
                        onChange={() => toggleDataSharing('marketing')}
                        helperText="Share non-identifiable data with marketing partners"
                      />
                      <Checkbox
                        label="Allow research participation"
                        checked={dataSharing.research}
                        onChange={() => toggleDataSharing('research')}
                        helperText="Contribute anonymous data to travel trend studies"
                      />
                    </div>
                  </div>

                  <div className="data-sharing-category">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <LockClosedIcon className="w-5 h-5 text-blue-600" />
                      Security Settings
                    </h4>
                    <div className="space-y-3">
                      <Checkbox
                        label="Two-Factor Authentication"
                        checked={securitySettings.twoFactorAuth}
                        onChange={() => toggleSecurity('twoFactorAuth')}
                        helperText="Require secondary verification for logins"
                      />
                      <Checkbox
                        label="Activity Alerts"
                        checked={securitySettings.activityAlerts}
                        onChange={() => toggleSecurity('activityAlerts')}
                        helperText="Get notified about suspicious account activity"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-5">Data Management</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <button
                      className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      <div>
                        <h4 className="font-medium">Download My Data</h4>
                        <p className="text-sm text-gray-600">Get a copy of your personal data</p>
                      </div>
                      <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    <button
                      className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      <div>
                        <h4 className="font-medium">Clear Search History</h4>
                        <p className="text-sm text-gray-600">Delete all saved search queries</p>
                      </div>
                      <TrashIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="border-l pl-6 border-red-200">
                    <div className="space-y-4">
                      <h4 className="font-medium text-red-700">Danger Zone</h4>
                      <button
                        className="text-red-600 hover:text-red-800 flex items-center gap-2 text-center font-medium"
                        onClick={handleDeleteUser}
                        aria-label="Delete Account"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Delete Account Permanently
                      </button>
                      <p className="text-sm text-gray-600">
                        This will remove all your data from our systems. Action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md"
                >
                  Save Privacy Preferences
                </button>
              </div>
            </div>
          </>
        )}

        {activeSection === "hosting" && (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Host an Experience</h2>
            <div className="space-y-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                Transform your passion into income by hosting unique experiences on our platform.
                Whether you have a special space to share or want to create memorable activities,
                we provide the tools to connect with curious travelers worldwide.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-semibold mb-3 text-blue-800">Why Host With Us?</h3>
                <ul className="list-disc space-y-2 pl-6 text-blue-700">
                  <li>Earn money doing what you love</li>
                  <li>Join a community of passionate creators</li>
                  <li>Flexible scheduling that works for you</li>
                  <li>Insurance and liability protection</li>
                  <li>24/7 support from our expert team</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                <div className="space-y-4 text-gray-700">
                  <p className="flex items-center gap-2"><span className="font-bold text-red-500">1.</span> Create your host profile in minutes</p>
                  <p className="flex items-center gap-2"><span className="font-bold text-red-500">2.</span> Describe your space or experience</p>
                  <p className="flex items-center gap-2"><span className="font-bold text-red-500">3.</span> Set your availability and pricing</p>
                  <p className="flex items-center gap-2"><span className="font-bold text-red-500">4.</span> Review our hosting guidelines</p>
                  <p className="flex items-center gap-2"><span className="font-bold text-red-500">5.</span> Launch your listing and start welcoming guests!</p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to={`/${currentUser?._id}/create-listing`}
                  className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md"
                >
                  Start Hosting Today <FaArrowRight className="inline-block ml-2" />
                </Link>
              </div>
            </div>
          </>
        )}

        {activeSection === "wishlist" && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mt-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Your Wishlist</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Here you can manage all the properties and experiences you ve saved to your wishlist.
              Easily review, share, or book your favorite listings.
            </p>

            <WishList />

            <div className="mt-8 text-center">
              <Link
                to="/search"
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md"
              >
                Discover More Listings <FaArrowRight className="inline-block ml-2" />
              </Link>
            </div>
          </div>
        )}

        {activeSection === "my-listings" && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mt-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">My Listings</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Manage your active listings here. You can edit, view, or delete your properties.
            </p>

            <div className="mb-6">
              <Link
                to={`/${currentUser?._id}/create-listing`}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                <AddCircle className="mr-2" /> Create New Listing
              </Link>
            </div>

            <button
              onClick={handleShowListings}
              className="text-green-700 hover:underline mb-6 font-medium"
            >
              Show My Listings
            </button>
            {showListingsError && (
              <p className="text-red-700 text-sm mt-2">Error showing listings</p>
            )}

            {userListings && userListings.length > 0 && (
              <div className="flex flex-col gap-8">
                {userListings.slice(0, visibleListings).map((listing) => (
                  <div
                    key={listing._id}
                    className="flex flex-col sm:flex-row gap-6 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <Link to={`/listing/${listing._id}`} className="flex-shrink-0">
                      <img
                        src={listing.imageUrls[0] || "https://via.placeholder.com/200"}
                        alt="listing cover"
                        className="w-full sm:w-64 h-48 object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </Link>
                    <div className="p-5 flex flex-col justify-between flex-grow">
                      <Link to={`/listing/${listing._id}`}>
                        <h2 className="text-2xl font-semibold text-slate-800 hover:text-red-600 transition-colors truncate">
                          {listing.name}
                        </h2>
                      </Link>
                      <p className="text-lg text-gray-700 mt-2">
                        R{listing.offer ? listing.discountPrice.toLocaleString('en-US') : listing.regularPrice.toLocaleString('en-US')}
                        {listing.type === 'rent' && ' / month'}
                      </p>
                      <div className="flex items-center gap-4 text-gray-500 text-sm mt-3">
                        <span className="flex items-center gap-1"><FaBed /> {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : `${listing.bedrooms} Bed`}</span>
                        <span className="flex items-center gap-1"><FaBath /> {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : `${listing.bathrooms} Bath`}</span>
                      </div>
                      <div className="flex gap-4 mt-5">
                        <button
                          onClick={() => handleListingDelete(listing._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                        <Link to={`/update-listing/${listing._id}`}>
                          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1">
                            <FaEdit className="w-4 h-4" /> Edit
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {userListings.length > visibleListings && (
                  <button
                    onClick={loadMoreListings}
                    className="mt-6 mx-auto w-fit bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                  >
                    Show More Listings
                  </button>
                )}
              </div>
            )}
            {userListings.length === 0 && !showListingsError && (
              <p className="text-gray-500 text-center mt-6">You have no listings yet.</p>
            )}
          </div>
        )}

        {activeSection === "events" && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-800">My Events</h2>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Total Posts: {postCount}
              </span>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Manage your events here. You can edit, view, or delete your upcoming events.
            </p>

            <div className="mb-6">
              <Link
                to={`/${currentUser?._id}/create-listing`}
                className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
              >
                <FaCalendarAlt className="mr-2" /> Create New Event
              </Link>
            </div>

            {userEvents.length === 0 ? (
              <div className="text-center py-10">
                <FaCalendarAlt className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No events created yet</h3>
                <p className="mt-2 text-gray-500">Create your first event to get started</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {userEvents.slice(0, visibleEvents).map((event) => (
                  <div
                    key={event._id}
                    className="flex flex-col md:flex-row gap-6 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    {event.imageUrls.length > 0 && (
                      <div className="md:w-1/3">
                        <img
                          src={event.imageUrls[0]}
                          alt={event.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-grow">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{event.name}</h3>
                      <div className="flex items-center gap-3 text-gray-600 mb-3">
                        <FaCalendarAlt />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 mb-3">
                        <MdLocationOn />
                        <span>{event.address}</span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.parking && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Parking
                          </span>
                        )}
                        {event.foodAvailable && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Food Available
                          </span>
                        )}
                        {event.familyFriendly && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Family Friendly
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4 mt-4">
                        <Link to={`/update-event/${event._id}`}>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleEventDelete(event._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Delete
                        </button>
                        <Link to={`/event/${event._id}`}>
                          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {userEvents.length > visibleEvents && (
                  <button
                    onClick={loadMoreEvents}
                    className="mt-4 mx-auto bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
                  >
                    Show More Events
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 text-sm">
        <button
          onClick={handleDeleteUser}
          className="text-red-600 hover:underline font-medium"
        >
          Delete Account
        </button>
        <button
          onClick={handleSignOut}
          className="text-red-600 hover:underline font-medium"
        >
          Sign Out
        </button>
      </div>

      {error && <p className="text-red-700 mt-5 text-center">{error}</p>}
    </div>
  );
}