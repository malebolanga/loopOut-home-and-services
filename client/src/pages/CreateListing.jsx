import { useState, useEffect, useRef } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  SparklesIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  UsersIcon,
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
} from "@heroicons/react/24/outline";

// Custom paw icon
const PawIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
    />
  </svg>
);

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
    regularPrice: 50,
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
    
    // Event specific
    date: "",
    time: "",
    foodAvailable: false,
    familyFriendly: false,
  });

  const stepRef = useRef(null);

  // Update form when category or type changes
  useEffect(() => {
    if (selectedCategory && selectedType) {
      setListingForm(prev => ({
        ...prev,
        category: selectedCategory,
        type: selectedType,
        kind: selectedCategory === 'stays' ? getDefaultKind(selectedType) : prev.kind,
        near: prev.near || getDefaultNearPlaceholder(selectedCategory, selectedType),
      }));
    }
  }, [selectedCategory, selectedType]);

  const getDefaultKind = (type) => {
    switch(type) {
      case 'rent': return 'apartment';
      case 'over': return 'guest_house';
      case 'office': return 'hourly_room';
      case 'land': return 'plot';
      case 'sale': return 'house';
      default: return 'apartment';
    }
  };

  const getDefaultNearPlaceholder = (category, type) => {
    switch(category) {
      case 'stays':
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
            headers: { 'Content-Type': 'application/json' },
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
      
      if (selectedCategory === 'stays') {
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
      
      if (!listingForm.near.trim()) {
        setError(`Please provide ${getNearLabel(selectedCategory, selectedType)}`);
        return;
      }
    }
    
    if (currentStep === 5) {
      if (listingForm.imageUrls.length < 1) {
        setError("You must upload at least one image");
        return;
      }
      
      if (selectedCategory === 'stays' && +listingForm.regularPrice < +listingForm.discountPrice) {
        setError("Discount price must be lower than regular price");
        return;
      }
    }
    
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const getNearLabel = (category, type) => {
    switch(category) {
      case 'stays':
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
        return "your services and experience";
      case 'events':
        return "event highlights and features";
      default:
        return "additional information";
    }
  };

  const handlePrevStep = () => {
    setDirection('prev');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.7
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (listingForm.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }
    
    if (selectedCategory === 'stays' && +listingForm.regularPrice < +listingForm.discountPrice) {
      return setError("Discount price must be lower than regular price");
    }
    
    if (selectedCategory === 'stays') {
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
    
    if (!listingForm.near.trim()) {
      return setError(`${getNearLabel(selectedCategory, selectedType)} is required`);
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = selectedCategory === 'stays' ? '/api/listing/create' :
                      selectedCategory === 'experiences' ? '/api/service/create' :
                      selectedCategory === 'online' ? '/api/helper/create' :
                      '/api/event/create';

      const requestBody = {
        ...listingForm,
        userRef: currentUser._id,
        type: selectedType,
        category: selectedCategory,
        listingType: selectedCategory === 'stays' ? 'property' : selectedCategory,
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
      };

      console.log("Submitting to:", endpoint);
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
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
        if (selectedCategory === 'stays') {
          setNewListingId(data._id || data.listing?._id);
          setShowPromotionPopup(true);
        } else {
          navigate(`/${selectedCategory === 'experiences' ? 'service' : 
                   selectedCategory === 'online' ? 'helper' : 'event'}/${data._id || data.listing?._id}`);
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
      case 'stays':
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

  const getTypesByCategory = () => {
    switch (selectedCategory) {
      case 'stays':
        return [
          { id: "rent", label: "Room/Home Rent", emoji: "🏠", description: "Monthly rental" },
          { id: "over", label: "Guest House", emoji: "🛌", description: "Nightly stays" },
          { id: "office", label: "Hourly Stay", emoji: "🕒", description: "Per hour accommodation" },
          { id: "land", label: "Land", emoji: "🌳", description: "Plot for sale" },
          { id: "sale", label: "For Sale", emoji: "💰", description: "Property sale" },
        ];
      case 'experiences':
        return [
          { id: "cleaning", label: "Cleaning", emoji: "🧹", description: "Home & office cleaning" },
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
          { id: "errand", label: "Errand Runner", emoji: "🏃", description: "Shopping, deliveries, tasks" },
          { id: "tutor", label: "Private Tutor", emoji: "📚", description: "Academic tutoring" },
          { id: "chef", label: "Private Chef", emoji: "👨‍🍳", description: "Meal preparation" },
          { id: "beauty", label: "Beauty Specialist", emoji: "💅", description: "Hair, nails, makeup" },
          { id: "tattoo", label: "Tattoo Artist", emoji: "🖌️", description: "Tattoo design" },
          { id: "barber", label: "Barber", emoji: "✂️", description: "Haircuts, grooming" },
          { id: "photography", label: "Photographer", emoji: "📷", description: "Photo sessions" },
          { id: "baker", label: "Baker", emoji: "🍰", description: "Custom baked goods" },
        ];
      case 'events':
        return [
          { id: "music", label: "Music", emoji: "🎵", description: "Concerts, festivals" },
          { id: "sports", label: "Sports", emoji: "⚽", description: "Games, tournaments" },
          { id: "art", label: "Art & Culture", emoji: "🎨", description: "Exhibitions, shows" },
          { id: "community", label: "Community", emoji: "🧑‍🤝‍🧑", description: "Meetups, gatherings" },
          { id: "food", label: "Food & Drink", emoji: "🍔", description: "Food festivals, tastings" },
        ];
      default:
        return [];
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  // Airbnb-style UI Components
  const SectionCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 md:p-8 ${className}`}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 md:mb-8">
          {title}
        </h2>
      )}
      {children}
    </div>
  );

  const FormInput = ({ label, icon: Icon, type = "text", id, value, onChange, placeholder, required = false, className = "", rows = 4, helpText = "" }) => (
    <div className={className}>
      <label className="block text-base font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-[#FF5A5F] ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 resize-none hover:border-gray-400"
          rows={rows}
        />
      ) : type === "number" ? (
        <input
          type="number"
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-400"
        />
      ) : type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white hover:border-gray-400"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-400"
        />
      )}
      {helpText && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );

  const CategoryCard = ({ id, icon: Icon, label, description, selected }) => (
    <button
      type="button"
      onClick={() => setSelectedCategory(id)}
      className={`
        flex flex-col p-6 rounded-xl border-2 transition-all duration-200 w-full text-left
        ${selected 
          ? 'border-black bg-gray-50' 
          : 'border-gray-200 hover:border-gray-400 bg-white'
        }
      `}
    >
      <div className={`
        p-3 rounded-full mb-4 w-fit
        ${selected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}
      `}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-1">{label}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      {selected && (
        <div className="mt-4 flex items-center gap-2 text-black font-medium text-sm">
          <CheckCircleIcon className="w-5 h-5" />
          Selected
        </div>
      )}
    </button>
  );

  const TypeCard = ({ id, label, emoji, description, selected }) => (
    <button
      type="button"
      onClick={() => setSelectedType(id)}
      className={`
        p-6 border-2 rounded-xl transition-all duration-200 w-full text-left
        ${selected 
          ? 'border-black bg-gray-50' 
          : 'border-gray-200 hover:border-gray-400 bg-white'
        }
      `}
    >
      <span className="text-3xl mb-3 block">{emoji}</span>
      <h4 className="font-semibold text-lg text-gray-900 mb-1">{label}</h4>
      <p className="text-gray-500 text-sm">{description}</p>
      {selected && (
        <div className="mt-4 flex items-center gap-2 text-black font-medium text-sm">
          <CheckCircleIcon className="w-5 h-5" />
          Selected
        </div>
      )}
    </button>
  );

  const AmenityCard = ({ id, label, emoji, checked, onChange }) => (
    <label className={`
      flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200
      ${checked 
        ? 'border-black bg-gray-50' 
        : 'border-gray-200 hover:border-gray-400 bg-white'
      }
    `}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <span className="text-2xl">{emoji}</span>
      <span className="font-medium text-gray-900 flex-1">{label}</span>
      <div className={`
        w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200
        ${checked 
          ? 'bg-black border-black' 
          : 'bg-white border-gray-300'
        }
      `}>
        {checked && <CheckCircleIcon className="w-4 h-4 text-white" />}
      </div>
    </label>
  );

  const MediaUploadArea = ({ type = 'image', onChange, onSubmit, filesCount, maxFiles = 10, label }) => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
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
            p-8 md:p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center 
            cursor-pointer transition-all duration-200 min-h-[200px]
            ${uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          `}
        >
          {type === 'image' ? (
            <>
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <CameraIcon className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-gray-900 font-medium text-lg mb-1">{label || "Add photos"}</span>
              <span className="text-gray-500 text-sm">Drag and drop or click to upload</span>
              <span className="text-gray-400 text-xs mt-2">PNG, JPG up to 2MB each</span>
            </>
          ) : (
            <>
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <VideoCameraIcon className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-gray-900 font-medium text-lg mb-1">{label || "Add a video"}</span>
              <span className="text-gray-500 text-sm">MP4 or MOV up to 50MB</span>
            </>
          )}
        </label>
        {filesCount > 0 && (
          <button
            type="button"
            onClick={onSubmit}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            disabled={uploading}
          >
            {uploading ? `Uploading ${Math.round(uploadProgress)}%...` : `Upload ${filesCount} file${filesCount > 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  );

  const StepProgress = () => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
              ${step < currentStep ? 'bg-black text-white' :
                step === currentStep ? 'bg-black text-white ring-4 ring-gray-200' :
                'bg-white border-2 border-gray-300 text-gray-400'
              }
            `}>
              {step < currentStep ? <CheckCircleIcon className="w-5 h-5" /> : step}
            </div>
            {step < 6 && (
              <div className={`
                h-0.5 flex-1 mx-2 transition-all duration-300
                ${step < currentStep ? 'bg-black' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs font-medium text-gray-500 max-w-2xl mx-auto px-2">
        <span className={currentStep >= 1 ? 'text-black' : ''}>Category</span>
        <span className={currentStep >= 2 ? 'text-black' : ''}>Type</span>
        <span className={currentStep >= 3 ? 'text-black' : ''}>Details</span>
        <span className={currentStep >= 4 ? 'text-black' : ''}>Amenities</span>
        <span className={currentStep >= 5 ? 'text-black' : ''}>Photos</span>
        <span className={currentStep >= 6 ? 'text-black' : ''}>Review</span>
      </div>
    </div>
  );

  if (loading && !showPromotionPopup) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (postLimitReached) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Limit Reached</h2>
          <p className="text-gray-600 mb-6">
            You've used all 3 free listings. Upgrade to create more.
          </p>
          {paymentRequired ? (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              {loading ? "Processing..." : "Pay R35 for New Listing"}
            </button>
          ) : (
            <p className="text-gray-500">Delete existing listings to create new ones.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Airbnb-style Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#FF5A5F] font-bold text-2xl tracking-tighter">loopOut</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-900 font-medium">Create listing</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Step Progress */}
        <StepProgress />

        {/* Main Form Container */}
        <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <form onSubmit={handleSubmit} ref={stepRef} className="space-y-8">
            
            {/* Step 1: Select Category */}
            {currentStep === 1 && (
              <SectionCard title="What would you like to list?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CategoryCard
                    id="stays"
                    icon={HomeIcon}
                    label="Places to Stay"
                    description="Rent out your property, room, or entire home"
                    selected={selectedCategory === 'stays'}
                  />
                  <CategoryCard
                    id="experiences"
                    icon={BriefcaseIcon}
                    label="Services"
                    description="Offer professional services to the community"
                    selected={selectedCategory === 'experiences'}
                  />
                  <CategoryCard
                    id="online"
                    icon={UserGroupIcon}
                    label="Helpers"
                    description="Register as a personal helper or specialist"
                    selected={selectedCategory === 'online'}
                  />
                  <CategoryCard
                    id="events"
                    icon={CalendarIcon}
                    label="Events"
                    description="Create and promote local happenings"
                    selected={selectedCategory === 'events'}
                  />
                </div>
              </SectionCard>
            )}

            {/* Step 2: Select Type */}
            {currentStep === 2 && (
              <SectionCard title={`What type of ${selectedCategory === 'stays' ? 'place' : 
                selectedCategory === 'experiences' ? 'service' :
                selectedCategory === 'online' ? 'helper' : 'event'}?`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTypesByCategory().map((type) => (
                    <TypeCard
                      key={type.id}
                      {...type}
                      selected={selectedType === type.id}
                    />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Step 3: Form Details */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <SectionCard title="Tell us about your place">
                  <div className="space-y-6">
                    <FormInput
                      label="Create a title"
                      icon={selectedCategory === 'stays' ? HomeIcon : 
                            selectedCategory === 'events' ? CalendarIcon : UserIcon}
                      id="name"
                      value={listingForm.name}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'stays' ? "Cozy mountain cabin with amazing views" :
                        selectedCategory === 'experiences' && selectedType === 'carwash' ? "Premium Car Wash & Detailing Service" :
                        selectedCategory === 'experiences' ? "Professional Cleaning Service" :
                        selectedCategory === 'online' ? "John's Tutoring Services" :
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
                        selectedCategory === 'stays' ? "Describe what makes your place special..." :
                        selectedCategory === 'experiences' && selectedType === 'carwash' ? "Professional car wash and detailing services..." :
                        selectedCategory === 'experiences' ? "Describe your service in detail..." :
                        selectedCategory === 'online' ? "Describe your skills and experience..." :
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
                    </div>

                    {/* Host/Organizer Name Field - ADDED HERE */}
                    <FormInput
                      label={selectedCategory === 'stays' ? "Host name" : 
                             selectedCategory === 'events' ? "Organizer name" : 
                             "Provider name"}
                      icon={UserIcon}
                      id="host"
                      value={listingForm.host}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'stays' ? "Your name or property manager" :
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

                    {selectedCategory === 'stays' && (
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

                <SectionCard title="Set your price">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">
                        Price per {selectedCategory === 'stays' ? 
                          (selectedType === "rent" ? "month" : selectedType === "over" ? "night" : "hour") :
                          selectedCategory === 'events' ? "ticket" : "service"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 font-semibold text-lg">R</span>
                        <input
                          type="number"
                          id="regularPrice"
                          value={listingForm.regularPrice}
                          onChange={handleFormChange}
                          className="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {selectedCategory === 'stays' && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            id="offer"
                            checked={listingForm.offer}
                            onChange={handleFormChange}
                            className="w-5 h-5 text-black rounded border-gray-300 focus:ring-black"
                          />
                          <span className="font-medium text-gray-900">Offer a discounted price</span>
                        </label>
                        
                        {listingForm.offer && (
                          <div className="mt-4 ml-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discounted price</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 font-semibold">R</span>
                              <input
                                type="number"
                                id="discountPrice"
                                value={listingForm.discountPrice}
                                onChange={handleFormChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                min="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
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

                {selectedCategory === 'stays' && (
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

            {/* Step 5: Images & Media */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <SectionCard title="Add some photos of your place">
                  <p className="text-gray-600 mb-6">You'll need 1 photo to get started. You can add more later.</p>
                  
                  <MediaUploadArea
                    type="image"
                    onChange={handleFileChange}
                    onSubmit={handleImageSubmit}
                    filesCount={files.length}
                    label="Upload from your device"
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

            {/* Step 6: Review & Submit */}
            {currentStep === 6 && (
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
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">Photos</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CameraIcon className="w-5 h-5" />
                        <span>{listingForm.imageUrls.length} photos uploaded</span>
                      </div>
                    </div>

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
            <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:border-t-0 md:pt-0 md:pb-0 md:static flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-200 underline underline-offset-4
                  ${currentStep > 1 ? 'text-gray-900 hover:text-gray-600' : 'invisible'}
                `}
              >
                Back
              </button>
              
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
                >
                  Next
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-[#FF5A5F] text-white rounded-lg font-semibold hover:bg-[#E14E50] transition-all duration-200 flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Publish listing
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Uploading...</h3>
              <p className="text-gray-600 mb-4">{Math.round(uploadProgress)}% complete</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Popup */}
      {showPromotionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto">
            {promotionSteps === 0 && (
              <div className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="w-8 h-8 text-[#FF5A5F]" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">You're all set! 🎉</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Boost your listing's visibility with our promotion packages.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Promote now
                  </button>
                  <button
                    onClick={() => navigate(`/listing/${newListingId}`)}
                    className="px-8 py-4 border border-black text-black rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {promotionSteps === 1 && (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose your promotion</h3>
                <p className="text-gray-600 mb-8">Select a package that fits your needs</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    { id: 'standard', price: 40, multiplier: '25x', days: '7 days', features: ['25x more visibility', 'Featured in category', '7-day promotion'] },
                    { id: 'premium', price: 100, multiplier: '80x', days: '14 days', features: ['80x more visibility', 'Homepage feature', '14-day promotion', 'Priority support'] }
                  ].map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setPromotionPackage(pkg.id)}
                      className={`
                        p-6 border-2 rounded-xl cursor-pointer transition-all duration-200
                        ${promotionPackage === pkg.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg capitalize">{pkg.id}</h4>
                          <p className="text-gray-500 text-sm">{pkg.multiplier} more visibility</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold">R{pkg.price}</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            {feat}
                          </li>
                        ))}
                      </ul>
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
          </div>
        </div>
      )}
    </div>
  );
}