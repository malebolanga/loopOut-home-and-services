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
    near: "", // This field is required for ALL categories
    rules: "",
    kind: "apartment", // Default value
    period: "Immediate", // Default value
    cancel: "Flexible - Free cancellation 48 hours before check-in", // Default value
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
        // Set default kind based on type for stays
        kind: selectedCategory === 'stays' ? getDefaultKind(selectedType) : prev.kind,
        // Set default near placeholder based on category
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
      setCurrentStep(2); // Skip to step 2 if category is in URL
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
    
    // Validation for step 1
    if (currentStep === 1 && !selectedCategory) {
      setError("Please select a category");
      return;
    }
    
    // Validation for step 2
    if (currentStep === 2 && !selectedType) {
      setError("Please select a type");
      return;
    }
    
    // Validation for step 3
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
      
      // Additional validation for stays category
      if (selectedCategory === 'stays') {
        if (!listingForm.kind.trim()) {
          setError("Please enter the property type (e.g., Apartment, House)");
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
      
      // Additional validation for events
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
      
      // near field is required for ALL categories
      if (!listingForm.near.trim()) {
        setError(`Please provide ${getNearLabel(selectedCategory, selectedType)}`);
        return;
      }
    }
    
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const getNearLabel = (category, type) => {
    switch(category) {
      case 'stays':
        return "information about nearby attractions";
      case 'experiences':
        if (type === 'daycare') return "your experience and qualifications";
        if (type === 'schoolTransport') return "your driving experience and certifications";
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

  // Image compression function
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
    
    // Final validation
    if (listingForm.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }
    
    if (selectedCategory === 'stays' && +listingForm.regularPrice < +listingForm.discountPrice) {
      return setError("Discount price must be lower than regular price");
    }
    
    // Ensure required fields for stays are filled
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
    
    // Ensure near field is filled for all categories
    if (!listingForm.near.trim()) {
      return setError(`${getNearLabel(selectedCategory, selectedType)} is required`);
    }

    setLoading(true);
    setError(null);

    try {
      // DON'T create _id on client side - let MongoDB generate it
      const endpoint = selectedCategory === 'stays' ? '/api/listing/create' :
                      selectedCategory === 'experiences' ? '/api/service/create' :
                      selectedCategory === 'online' ? '/api/helper/create' :
                      '/api/event/create';

      // Prepare the request body WITHOUT _id field
      const requestBody = {
        ...listingForm,
        userRef: currentUser._id,
        type: selectedType,
        category: selectedCategory,
        listingType: selectedCategory === 'stays' ? 'property' : selectedCategory,
        // Ensure all required fields are included
        kind: listingForm.kind || "apartment",
        cancel: listingForm.cancel || "Flexible - Free cancellation 48 hours before check-in",
        period: listingForm.period || "Immediate",
        near: listingForm.near || "",
        rules: listingForm.rules || "",
        // Remove any undefined values
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

      // Log what we're sending for debugging
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
        // Show user-friendly error message
        let errorMessage = data.message || "Failed to create listing. Please check all required fields.";
        
        // Parse MongoDB validation errors
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

  // UI Components
  const SectionCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-[#FF5A5F] rounded-full"></div>
        {title}
      </h2>
      {children}
    </div>
  );

  const FormInput = ({ label, icon: Icon, type = "text", id, value, onChange, placeholder, required = false, className = "", rows = 4, helpText = "" }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent transition-all duration-200 resize-none"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent transition-all duration-200"
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent transition-all duration-200"
        />
      )}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );

  const CategoryCard = ({ id, icon: Icon, label, description, selected }) => (
    <button
      type="button"
      onClick={() => setSelectedCategory(id)}
      className={`
        flex flex-col items-center p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl transition-all duration-300 w-full min-h-[180px] sm:min-h-[220px]
        ${selected 
          ? 'bg-white border-2 sm:border-3 border-[#FF5A5F] shadow-lg sm:shadow-xl shadow-red-100 scale-[1.02]' 
          : 'bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-lg'
        }
      `}
    >
      <div className={`
        p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 transition-all duration-300
        ${selected 
          ? 'bg-[#FF5A5F]/10 text-[#FF5A5F]' 
          : 'bg-gray-100 text-gray-600'
        }
      `}>
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
      </div>
      <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-2 text-center">{label}</h3>
      <p className="text-gray-500 text-center text-xs sm:text-sm leading-relaxed hidden sm:block">{description}</p>
      {selected && (
        <div className="mt-4 flex items-center gap-2 text-[#FF5A5F] font-medium text-sm">
          <CheckCircleIcon className="w-4 h-4" />
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
        text-left p-4 sm:p-6 md:p-8 border-2 rounded-2xl sm:rounded-3xl transition-all duration-300 w-full min-h-[140px] sm:min-h-[160px]
        ${selected 
          ? 'border-[#FF5A5F] bg-[#FF5A5F]/5 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">{emoji}</span>
      <h4 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 mb-1 sm:mb-2">{label}</h4>
      <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">{description}</p>
      {selected && (
        <div className="mt-2 sm:mt-4 flex items-center gap-2 text-[#FF5A5F] text-xs sm:text-sm font-medium">
          <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Selected
        </div>
      )}
    </button>
  );

  const AmenityCard = ({ id, label, emoji, checked, onChange }) => (
    <label className={`
      flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] min-w-[140px]
      ${checked 
        ? 'border-[#FF5A5F] bg-[#FF5A5F]/5 shadow-sm' 
        : 'hover:border-gray-300'
      }
    `}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <span className="text-xl sm:text-2xl">{emoji}</span>
      <span className="font-medium text-gray-700 text-sm sm:text-base flex-1">{label}</span>
      <div className={`
        w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition-all duration-300
        ${checked 
          ? 'bg-[#FF5A5F] border-[#FF5A5F]' 
          : 'bg-white border-gray-300'
        }
      `}>
        {checked && <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </label>
  );

  const MediaUploadArea = ({ type = 'image', onChange, onSubmit, filesCount, maxFiles = 10, label }) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
            flex-1 p-6 sm:p-8 md:p-12 border-2 border-dashed rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center 
            cursor-pointer transition-all duration-300 hover:border-[#FF5A5F]/50 min-h-[140px]
            ${uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}
          `}
        >
          {type === 'image' ? (
            <>
              <CameraIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mb-2 sm:mb-3 md:mb-4" />
              <span className="text-gray-600 font-semibold text-sm sm:text-base md:text-lg text-center">{label || "Select photos"}</span>
              <span className="text-gray-500 mt-1 text-xs sm:text-sm text-center">PNG, JPG or WebP (max 2MB each)</span>
              <span className="text-gray-400 mt-2 text-xs">{filesCount || 0} of {maxFiles} photos</span>
            </>
          ) : (
            <>
              <VideoCameraIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mb-2 sm:mb-3 md:mb-4" />
              <span className="text-gray-600 font-semibold text-sm sm:text-base md:text-lg text-center">{label || "Select video"}</span>
              <span className="text-gray-500 mt-1 text-xs sm:text-sm text-center">MP4 or MOV (max 50MB)</span>
            </>
          )}
        </label>
        <button
          type="button"
          onClick={onSubmit}
          className={`
            px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 whitespace-nowrap
            ${filesCount > 0 
              ? 'bg-[#FF5A5F] text-white hover:bg-[#E14E50] hover:scale-[1.02]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
          disabled={uploading || filesCount === 0}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );

  const StepProgress = () => (
    <div className="mb-8 sm:mb-12 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[300px]">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg transition-all duration-500
              ${step < currentStep ? 'bg-[#FF5A5F] text-white' :
                step === currentStep ? 'bg-[#FF5A5F] text-white ring-2 sm:ring-4 ring-[#FF5A5F]/20' :
                'bg-gray-100 text-gray-400'
              }
            `}>
              {step < currentStep ? <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : step}
            </div>
            {step < 4 && (
              <div className={`
                h-1 w-12 sm:w-16 md:w-20 lg:w-24 transition-all duration-500
                ${step < currentStep ? 'bg-[#FF5A5F]' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 sm:mt-4 text-xs sm:text-sm min-w-[300px]">
        <span className={`font-medium ${currentStep >= 1 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>Category</span>
        <span className={`font-medium ${currentStep >= 2 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>Type</span>
        <span className={`font-medium ${currentStep >= 3 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>Details</span>
        <span className={`font-medium ${currentStep >= 4 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>Amenities</span>
      </div>
    </div>
  );

  if (loading && !showPromotionPopup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your listing form...</p>
        </div>
      </div>
    );
  }

  if (postLimitReached) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Limit Reached</h2>
          <p className="text-gray-600 mb-6">
            You've used all 3 free listings. Upgrade to create more amazing listings.
          </p>
          {paymentRequired ? (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-[#FF5A5F] text-white py-3 rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5" />
                  Pay R35 for New Listing
                </>
              )}
            </button>
          ) : (
            <p className="text-gray-500">Please delete existing listings to create new ones.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Create a New Listing
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
            Share your space, service, or event with our community
          </p>
        </div>

        {/* Step Progress */}
        <StepProgress />

        {/* Main Form Container */}
        <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <form onSubmit={handleSubmit} ref={stepRef} className="space-y-4 sm:space-y-6">
            {/* Step 1: Select Category */}
            {currentStep === 1 && (
              <SectionCard title="What would you like to list?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
                selectedCategory === 'online' ? 'helper' : 'event'} are you listing?`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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

            {/* Step 3: Form Details - UPDATED WITH REQUIRED FIELDS */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <SectionCard title="Basic Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormInput
                      label="Name / Title"
                      icon={selectedCategory === 'stays' ? HomeIcon : 
                            selectedCategory === 'events' ? CalendarIcon : UserIcon}
                      id="name"
                      value={listingForm.name}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'stays' ? "Cozy mountain cabin with amazing views" :
                        selectedCategory === 'experiences' ? "Professional Cleaning Service" :
                        selectedCategory === 'online' ? "John's Tutoring Services" :
                        "Summer Music Festival"
                      }
                      required
                    />
                    <FormInput
                      label="Address / Location"
                      icon={MapPinIcon}
                      id="address"
                      value={listingForm.address}
                      onChange={handleFormChange}
                      placeholder={
                        selectedCategory === 'stays' ? "123 Main Street, City" :
                        "Service area or venue address"
                      }
                      required
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        label="Description"
                        type="textarea"
                        id="description"
                        value={listingForm.description}
                        onChange={handleFormChange}
                        placeholder={
                          selectedCategory === 'stays' ? "Describe what makes your place special..." :
                          selectedCategory === 'experiences' ? "Describe your service in detail..." :
                          selectedCategory === 'online' ? "Describe your skills and experience..." :
                          "Describe the event, activities, and what attendees can expect..."
                        }
                        required
                        rows={4}
                      />
                    </div>
                    
                    {/* REQUIRED near FIELD FOR ALL CATEGORIES */}
                    <div className="sm:col-span-2">
                      <FormInput
                        label={getNearLabel(selectedCategory, selectedType).charAt(0).toUpperCase() + getNearLabel(selectedCategory, selectedType).slice(1)}
                        icon={selectedCategory === 'stays' ? MapPinIcon : 
                              selectedCategory === 'experiences' ? AcademicCapIcon :
                              selectedCategory === 'online' ? BriefcaseIcon :
                              CalendarIcon}
                        type="textarea"
                        id="near"
                        value={listingForm.near}
                        onChange={handleFormChange}
                        placeholder={getDefaultNearPlaceholder(selectedCategory, selectedType)}
                        required
                        rows={3}
                        helpText="This information helps users understand what you offer"
                      />
                    </div>
                    
                    {/* REQUIRED FIELDS FOR STAYS CATEGORY */}
                    {selectedCategory === 'stays' && (
                      <>
                        <FormInput
                          label="Property Type"
                          icon={HomeIcon}
                          id="kind"
                          value={listingForm.kind}
                          onChange={handleFormChange}
                          placeholder="e.g., Apartment, House, Room, Studio"
                          required
                        />
                        <FormInput
                          label="Available From"
                          icon={CalendarIcon}
                          id="period"
                          value={listingForm.period}
                          onChange={handleFormChange}
                          placeholder="e.g., Immediate, 1st December 2024"
                          required
                        />
                      </>
                    )}
                    
                    <FormInput
                      label="Contact Number"
                      icon={PhoneIcon}
                      id="contact"
                      value={listingForm.contact}
                      onChange={handleFormChange}
                      placeholder="Phone number for inquiries"
                      required
                    />
                    <FormInput
                      label={selectedCategory === 'stays' ? "Host Name" : 
                             selectedCategory === 'events' ? "Organizer" : "Provider Name"}
                      icon={UserIcon}
                      id="host"
                      value={listingForm.host}
                      onChange={handleFormChange}
                      placeholder="Your name or business name"
                      required
                    />
                    
                    {/* ADDITIONAL REQUIRED FIELD FOR STAYS */}
                    {selectedCategory === 'stays' && (
                      <div className="sm:col-span-2">
                        <FormInput
                          label="Cancellation Policy"
                          icon={ClockIcon}
                          id="cancel"
                          value={listingForm.cancel}
                          onChange={handleFormChange}
                          placeholder="e.g., Flexible - Free cancellation 48 hours before check-in"
                          required
                        />
                      </div>
                    )}
                    
                    {selectedCategory === 'stays' && (
                      <div className="sm:col-span-2">
                        <FormInput
                          label="House Rules"
                          icon={KeyIcon}
                          type="textarea"
                          id="rules"
                          value={listingForm.rules}
                          onChange={handleFormChange}
                          placeholder="Enter any rules or regulations for guests"
                          rows={3}
                        />
                      </div>
                    )}
                    
                    {selectedCategory === 'events' && (
                      <>
                        <FormInput
                          label="Event Date"
                          icon={CalendarIcon}
                          type="date"
                          id="date"
                          value={listingForm.date}
                          onChange={handleFormChange}
                          required
                        />
                        <FormInput
                          label="Event Time"
                          icon={ClockIcon}
                          type="time"
                          id="time"
                          value={listingForm.time}
                          onChange={handleFormChange}
                          required
                        />
                      </>
                    )}
                    
                    {selectedCategory === 'experiences' && selectedType === 'daycare' && (
                      <>
                        <FormInput
                          label="Age Group"
                          icon={UserGroupIcon}
                          id="ageGroup"
                          value={listingForm.ageGroup}
                          onChange={handleFormChange}
                          placeholder="e.g., 6 months - 5 years"
                        />
                        <FormInput
                          label="Capacity"
                          icon={UsersIcon}
                          id="capacity"
                          value={listingForm.capacity}
                          onChange={handleFormChange}
                          placeholder="Number of children"
                        />
                        <div className="sm:col-span-2">
                          <FormInput
                            label="License Number"
                            icon={ShieldCheckIcon}
                            id="licenseNumber"
                            value={listingForm.licenseNumber}
                            onChange={handleFormChange}
                            placeholder="Your daycare license number (if applicable)"
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedCategory === 'experiences' && selectedType === 'schoolTransport' && (
                      <>
                        <FormInput
                          label="Vehicle Type"
                          icon={TruckIcon}
                          id="vehicleType"
                          value={listingForm.vehicleType}
                          onChange={handleFormChange}
                          placeholder="e.g., Minivan, Bus, SUV"
                        />
                        <div className="sm:col-span-2">
                          <FormInput
                            label="Route Areas"
                            icon={MapPinIcon}
                            type="textarea"
                            id="routeAreas"
                            value={listingForm.routeAreas}
                            onChange={handleFormChange}
                            placeholder="Areas and schools you serve"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'tutor' && (
                      <>
                        <FormInput
                          label="Education Level"
                          icon={AcademicCapIcon}
                          id="kind"
                          value={listingForm.kind}
                          onChange={handleFormChange}
                          placeholder="e.g., Bachelor's Degree in Education"
                        />
                        <FormInput
                          label="Subjects"
                          icon={BookOpenIcon}
                          id="specializations"
                          value={listingForm.specializations}
                          onChange={handleFormChange}
                          placeholder="e.g., Mathematics, Science, English"
                        />
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'barber' && (
                      <>
                        <FormInput
                          label="Specializations"
                          icon={ScissorsIcon}
                          id="specializations"
                          value={listingForm.specializations}
                          onChange={handleFormChange}
                          placeholder="e.g., Fades, beard trims, classic cuts"
                        />
                        <FormInput
                          label="Equipment"
                          icon={BriefcaseIcon}
                          id="equipment"
                          value={listingForm.equipment}
                          onChange={handleFormChange}
                          placeholder="e.g., Professional clippers, sanitized tools"
                        />
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'photography' && (
                      <>
                        <FormInput
                          label="Photography Style"
                          icon={PhotoIcon}
                          id="style"
                          value={listingForm.style}
                          onChange={handleFormChange}
                          placeholder="e.g., Portrait, event, studio, lifestyle"
                        />
                        <FormInput
                          label="Session Duration"
                          icon={ClockIcon}
                          id="sessionDuration"
                          value={listingForm.sessionDuration}
                          onChange={handleFormChange}
                          placeholder="e.g., 1-2 hours, half day, full day"
                        />
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'baker' && (
                      <>
                        <FormInput
                          label="Specialties"
                          icon={CakeIcon}
                          id="specialties"
                          value={listingForm.specialties}
                          onChange={handleFormChange}
                          placeholder="e.g., Wedding cakes, custom pastries, breads"
                        />
                        <FormInput
                          label="Dietary Options"
                          icon={BeakerIcon}
                          id="dietaryOptions"
                          value={listingForm.dietaryOptions}
                          onChange={handleFormChange}
                          placeholder="e.g., Vegan, gluten-free, sugar-free options"
                        />
                      </>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Photos & Media">
                  <MediaUploadArea
                    type="image"
                    onChange={handleFileChange}
                    onSubmit={handleImageSubmit}
                    filesCount={files.length}
                    label={`Upload ${selectedCategory} photos`}
                  />
                  
                  {imageUploadError && (
                    <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-xs sm:text-sm">{imageUploadError}</p>
                    </div>
                  )}

                  {listingForm.imageUrls.length > 0 && (
                    <div className="mt-4 sm:mt-6">
                      <h3 className="font-medium text-gray-700 mb-3 sm:mb-4">Uploaded photos ({listingForm.imageUrls.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {listingForm.imageUrls.map((url, index) => (
                          <div key={url} className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden group">
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-white p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 sm:mt-8">
                    <h3 className="font-medium text-gray-700 mb-3 sm:mb-4">Add a video (optional)</h3>
                    <MediaUploadArea
                      type="video"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      onSubmit={handleVideoUpload}
                      filesCount={videoFile ? 1 : 0}
                      maxFiles={1}
                      label={`Upload ${selectedCategory} video`}
                    />
                    {videoUploadError && (
                      <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-xs sm:text-sm">{videoUploadError}</p>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Pricing">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedCategory === 'stays' 
                          ? `Price per ${selectedType === "rent" ? "month" : selectedType === "over" ? "night" : "hour"}`
                          : selectedCategory === 'events' ? "Ticket price" : "Service rate"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                        <input
                          type="number"
                          id="regularPrice"
                          value={listingForm.regularPrice}
                          onChange={handleFormChange}
                          className="w-full pl-8 sm:pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                          min="0"
                          required
                        />
                        <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm">
                          {selectedCategory === 'events' && '(0 for free)'}
                          {selectedCategory === 'stays' && selectedType === 'rent' && '/month'}
                          {selectedCategory === 'stays' && selectedType === 'over' && '/night'}
                          {selectedCategory === 'stays' && selectedType === 'office' && '/hour'}
                        </span>
                      </div>
                    </div>
                    
                    {selectedCategory === 'stays' && (
                      <div>
                        <div className="flex items-start h-full space-x-3 sm:space-x-4">
                          <input
                            type="checkbox"
                            id="offer"
                            checked={listingForm.offer}
                            onChange={handleFormChange}
                            className="mt-1 h-5 w-5 text-[#FF5A5F] rounded focus:ring-[#FF5A5F]"
                          />
                          <div>
                            <label htmlFor="offer" className="font-medium text-gray-700">
                              Offer a discount
                            </label>
                            <p className="text-sm text-gray-500 mt-1">Attract more guests with a special price</p>
                          </div>
                        </div>
                        
                        {listingForm.offer && (
                          <div className="mt-3 sm:mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Discounted price
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                              <input
                                type="number"
                                id="discountPrice"
                                value={listingForm.discountPrice}
                                onChange={handleFormChange}
                                className="w-full pl-8 sm:pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                                min="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'barber' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Travel fee (optional)</label>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                          <input
                            type="number"
                            id="travelFee"
                            value={listingForm.travelFee}
                            onChange={handleFormChange}
                            className="w-full pl-8 sm:pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <SectionCard title="Amenities & Features">
                  <div className="overflow-x-auto pb-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 min-w-max">
                      {getAmenitiesByCategory().map((amenity) => (
                        <AmenityCard
                          key={amenity.id}
                          {...amenity}
                          onChange={handleFormChange}
                        />
                      ))}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Additional Details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {selectedCategory === 'stays' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {selectedType === "land" || selectedType === "office" ? "Square Meters" : "Bedrooms"}
                          </label>
                          <input
                            type="number"
                            id="bedrooms"
                            value={listingForm.bedrooms}
                            onChange={handleFormChange}
                            min={selectedType === "land" || selectedType === "office" ? 0 : 1}
                            max={10000}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                          />
                        </div>
                        
                        {selectedType !== "land" && selectedType !== "office" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                            <input
                              type="number"
                              id="bathrooms"
                              value={listingForm.bathrooms}
                              onChange={handleFormChange}
                              min="1"
                              max="10"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                            />
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedCategory === 'experiences' && (
                      <>
                        <FormInput
                          label="Service Category"
                          icon={TagIcon}
                          id="kind"
                          value={listingForm.kind}
                          onChange={handleFormChange}
                          placeholder="e.g., Residential, Commercial, Both"
                        />
                        <FormInput
                          label="Availability"
                          icon={ClockIcon}
                          id="period"
                          value={listingForm.period}
                          onChange={handleFormChange}
                          placeholder="e.g., Weekdays 9am-5pm, Weekends available"
                        />
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'tutor' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Teaching format</label>
                          <select
                            id="bathrooms"
                            value={listingForm.bathrooms}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                          >
                            <option value="1">In-person</option>
                            <option value="2">Online</option>
                            <option value="3">Both</option>
                          </select>
                        </div>
                        <FormInput
                          label="Age group"
                          icon={UserGroupIcon}
                          id="ageGroup"
                          value={listingForm.ageGroup}
                          onChange={handleFormChange}
                          placeholder="e.g., Primary school, High school, Adults"
                        />
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'barber' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Booking notice</label>
                          <select
                            id="bookingNotice"
                            value={listingForm.bookingNotice}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                          >
                            <option value="">Select notice period</option>
                            <option value="1">Same day</option>
                            <option value="24">24 hours</option>
                            <option value="48">48 hours</option>
                            <option value="72">72 hours</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional pricing</label>
                          <textarea
                            id="additionalPricing"
                            value={listingForm.additionalPricing}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                            placeholder="E.g., Beard trim: R80, Kids cut: R100"
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'photography' && (
                      <>
                        <FormInput
                          label="Photo delivery time"
                          icon={ClockIcon}
                          id="photoDelivery"
                          value={listingForm.photoDelivery}
                          onChange={handleFormChange}
                          placeholder="E.g., 5-7 days, digital download"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery available</label>
                          <div className="flex items-center h-full space-x-3">
                            <input
                              type="checkbox"
                              id="delivery"
                              checked={listingForm.delivery}
                              onChange={handleFormChange}
                              className="h-5 w-5 text-[#FF5A5F] rounded focus:ring-[#FF5A5F]"
                            />
                            <label htmlFor="delivery" className="font-medium text-gray-700">
                              Offer delivery service
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedCategory === 'online' && selectedType === 'baker' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Order notice required</label>
                          <select
                            id="orderNotice"
                            value={listingForm.orderNotice}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                          >
                            <option value="">Select notice period</option>
                            <option value="24">24 hours</option>
                            <option value="48">48 hours</option>
                            <option value="72">72 hours</option>
                            <option value="168">1 week</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery available</label>
                          <div className="flex items-center h-full space-x-3">
                            <input
                              type="checkbox"
                              id="delivery"
                              checked={listingForm.delivery}
                              onChange={handleFormChange}
                              className="h-5 w-5 text-[#FF5A5F] rounded focus:ring-[#FF5A5F]"
                            />
                            <label htmlFor="delivery" className="font-medium text-gray-700">
                              Offer delivery service
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Error Display - Stays at bottom without kicking user out */}
            {error && (
              <div className="mt-4 sm:mt-6 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-pulse">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      Please fix the errors above and try again. You can continue editing without losing your data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 sm:mt-8 flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 sm:px-8 sm:py-3 border border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 sm:px-10 sm:py-4 bg-[#FF5A5F] text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-[#E14E50] transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <span className="text-sm sm:text-base">Continue</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 sm:px-10 sm:py-4 bg-[#FF5A5F] text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-[#E14E50] transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span className="text-sm sm:text-base">Creating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base">Publish Listing</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Important Message */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Important Note</h3>
              <p className="text-blue-700 text-xs sm:text-sm">
                If your post doesn't go through, we recommend logging out of your account and then logging back in. 
                This will help refresh your session and resolve any potential errors you may encounter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-[#FF5A5F] mx-auto mb-4 sm:mb-6"></div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Uploading Media</h3>
              <p className="text-gray-600 text-base sm:text-lg mb-3 sm:mb-4">{Math.round(uploadProgress)}% complete</p>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-[#FF5A5F] h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
              <p className="mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base">
                Please don't close this window while uploading...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Popup */}
      {showPromotionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto">
            {promotionSteps === 0 && (
              <div className="p-6 sm:p-8 md:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF5A5F]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Listing Created! 🎉</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                  Boost your listing's visibility and get more bookings with our promotion packages.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-6 py-3 sm:px-8 sm:py-3 bg-[#FF5A5F] text-white rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    Promote Now
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/listing/${newListingId}`)}
                    className="px-6 py-3 sm:px-8 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            )}

            {promotionSteps === 1 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5A5F]" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Choose Your Promotion</h3>
                </div>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Select a package that fits your needs</p>
                
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div
                    onClick={() => setPromotionPackage('standard')}
                    className={`p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 ${
                      promotionPackage === 'standard' 
                        ? 'border-[#FF5A5F] bg-[#FF5A5F]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg text-gray-900">Standard</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">25x more visibility</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-bold text-[#FF5A5F]">R40</span>
                        <p className="text-xs text-gray-500">one-time payment</p>
                      </div>
                    </div>
                    <ul className="space-y-1 sm:space-y-2">
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        25x more clicks
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        Featured in category
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        7-day promotion
                      </li>
                    </ul>
                  </div>

                  <div
                    onClick={() => setPromotionPackage('premium')}
                    className={`p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 ${
                      promotionPackage === 'premium' 
                        ? 'border-[#FF5A5F] bg-[#FF5A5F]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg text-gray-900">Premium</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">80x more visibility</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-bold text-[#FF5A5F]">R100</span>
                        <p className="text-xs text-gray-500">one-time payment</p>
                      </div>
                    </div>
                    <ul className="space-y-1 sm:space-y-2">
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        80x more clicks
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        Homepage feature
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        14-day promotion
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setPromotionSteps(0)}
                    className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm sm:text-base"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPromotionSteps(2)}
                    disabled={!promotionPackage}
                    className={`px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                      promotionPackage
                        ? 'bg-[#FF5A5F] text-white hover:bg-[#E14E50]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {promotionSteps === 2 && (
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Choose your payment method</p>

                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Order Summary</p>
                      <p className="text-xs sm:text-sm text-gray-500">Promotion: {promotionPackage}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#FF5A5F] text-base sm:text-lg">
                        R{promotionPackage === 'standard' ? '40' : '100'}
                      </p>
                      <p className="text-xs text-gray-500">one-time payment</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {[
                    {
                      id: 'card',
                      name: 'Credit/Debit Card',
                      description: 'Pay with Visa, Mastercard, etc.',
                      emoji: '💳',
                      icon: CreditCardIcon
                    },
                    {
                      id: 'paypal',
                      name: 'PayPal',
                      description: 'Pay with your PayPal account',
                      emoji: '📱',
                      icon: DevicePhoneMobileIcon
                    },
                    {
                      id: 'bank',
                      name: 'Bank Transfer',
                      description: 'Direct bank transfer',
                      emoji: '🏦',
                      icon: BuildingLibraryIcon
                    }
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handlePaymentSelection(method.id)}
                      className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? 'border-[#FF5A5F] bg-[#FF5A5F]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <method.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{method.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{method.description}</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A5F]" />
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedPaymentMethod === 'card' && (
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 p-3 sm:p-4 border border-gray-200 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent text-sm sm:text-base"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent text-sm sm:text-base"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent text-sm sm:text-base"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent text-sm sm:text-base"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm sm:text-base"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePromoteListing}
                    disabled={selectedPaymentMethod === 'card' && !cardDetailsValid()}
                    className={`px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                      (selectedPaymentMethod !== 'card' || cardDetailsValid())
                        ? 'bg-[#FF5A5F] text-white hover:bg-[#E14E50]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Complete Payment
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