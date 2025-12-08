import { useState, useEffect } from "react";
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
  
} from "@heroicons/react/24/outline";

// Custom paw icon since PawPrintIcon doesn't exist in heroicons
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
  const initialTab = searchParams.get('tab') || 'stays';
  
  const [activeTab, setActiveTab] = useState(initialTab);
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
  const [promotionPackage, setPromotionPackage] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Form states
  const [propertyForm, setPropertyForm] = useState({
    imageUrls: [],
    videoUrl: "",
    name: "",
    description: "",
    near: "",
    rules: "",
    address: "",
    contact: "",
    host: "",
    kind: "",
    period: "",
    cancel: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
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
  });

  const [serviceForm, setServiceForm] = useState({
    imageUrls: [],
    name: "",
    description: "",
    near: "",
    address: "",
    contact: "",
    host: "",
    type: "cleaning",
    regularPrice: 50,
    kind: "",
    period: "",
    cancel: "",
    security: false,
    pets: false,
    ageGroup: "",
    licenseNumber: "",
    capacity: "",
    vehicleType: "",
    routeAreas: "",
  });

  const [helperForm, setHelperForm] = useState({
    imageUrls: [],
    name: "",
    description: "",
    near: "",
    address: "",
    contact: "",
    host: "",
    type: "domestic",
    regularPrice: 50,
    kind: "",
    period: "",
    cancel: "",
    security: false,
    pets: false,
    bedrooms: 1,
    bathrooms: 1,
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
    delivery: false
  });

  const [eventForm, setEventForm] = useState({
    imageUrls: [],
    videoUrl: "",
    name: "",
    description: "",
    address: "",
    contact: "",
    host: "",
    type: "music",
    date: "",
    time: "",
    regularPrice: 0,
    parking: false,
    foodAvailable: false,
    familyFriendly: false,
  });

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
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

  const handleRemoveImage = (index, formType) => {
    if (formType === 'property') {
      setPropertyForm({
        ...propertyForm,
        imageUrls: propertyForm.imageUrls.filter((_, i) => i !== index),
      });
    } else if (formType === 'service') {
      setServiceForm({
        ...serviceForm,
        imageUrls: serviceForm.imageUrls.filter((_, i) => i !== index),
      });
    } else if (formType === 'helper') {
      setHelperForm({
        ...helperForm,
        imageUrls: helperForm.imageUrls.filter((_, i) => i !== index),
      });
    } else if (formType === 'event') {
      setEventForm({
        ...eventForm,
        imageUrls: eventForm.imageUrls.filter((_, i) => i !== index),
      });
    }
  };

  const handleImageSubmit = async (formType) => {
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

      if (formType === 'property') {
        setPropertyForm({
          ...propertyForm,
          imageUrls: propertyForm.imageUrls.concat(urls),
        });
      } else if (formType === 'service') {
        setServiceForm({
          ...serviceForm,
          imageUrls: serviceForm.imageUrls.concat(urls),
        });
      } else if (formType === 'helper') {
        setHelperForm({
          ...helperForm,
          imageUrls: helperForm.imageUrls.concat(urls),
        });
      } else if (formType === 'event') {
        setEventForm({
          ...eventForm,
          imageUrls: eventForm.imageUrls.concat(urls),
        });
      }

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
      if (activeTab === 'stays') {
        setPropertyForm({ ...propertyForm, videoUrl: url });
      } else if (activeTab === 'events') {
        setEventForm({ ...eventForm, videoUrl: url });
      }
      setVideoFile(null);
      setVideoUploadError(null);
    } catch (err) {
      setVideoUploadError(err.message || "Video upload failed (50MB max)");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePropertyChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "sale" || id === "rent" || id === "over" || id === "office" || id === "land") {
      return setPropertyForm({ ...propertyForm, type: id });
    }

    if (type === "checkbox") {
      setPropertyForm({ ...propertyForm, [id]: checked });
    } else {
      setPropertyForm({ ...propertyForm, [id]: value });
    }
  };

  const handleServiceChange = (e) => {
    const { id, value, type, checked } = e.target;

    const serviceTypes = [
      "cleaning", "maintenance", "moving", "landscaping", 
      "catering", "other", "daycare", "schoolTransport"
    ];

    if (serviceTypes.includes(id)) {
      return setServiceForm({ ...serviceForm, type: id });
    }

    if (type === "checkbox") {
      setServiceForm({ ...serviceForm, [id]: checked });
    } else {
      setServiceForm({ ...serviceForm, [id]: value });
    }
  };

  const handleHelperChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "domestic" || id === "errand" || id === "tutor" || id === "chef" || 
        id === "beauty" || id === "tattoo" || id === "barber" || id === "photography" || id === "baker") {
      return setHelperForm({ ...helperForm, type: id });
    }

    if (type === "checkbox") {
      setHelperForm({ ...helperForm, [id]: checked });
    } else {
      setHelperForm({ ...helperForm, [id]: value });
    }
  };

  const handleEventChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "music" || id === "sports" || id === "art" || id === "community" || id === "food") {
      return setEventForm({ ...eventForm, type: id });
    }

    if (type === "checkbox") {
      setEventForm({ ...eventForm, [id]: checked });
    } else {
      setEventForm({ ...eventForm, [id]: value });
    }
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();

    if (propertyForm.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }
    if (+propertyForm.regularPrice < +propertyForm.discountPrice) {
      return setError("Discount price must be lower than regular price");
    }

    setLoading(true);
    setError(null);

    try {
      const listingId = new Date().getTime().toString(36) + Math.random().toString(36).substr(2, 5);

      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyForm,
          userRef: currentUser._id,
          _id: listingId,
          listingType: 'property'
        }),
      });
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
      } else {
        setNewListingId(data._id || listingId);
        setShowPromotionPopup(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    if (serviceForm.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/service/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...serviceForm,
          creator: currentUser._id,
          offer: false
        }),
      });
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
      } else {
        navigate(`/service/${data._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHelperSubmit = async (e) => {
    e.preventDefault();

    if (helperForm.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/helper/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...helperForm,
          userRef: currentUser._id
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create helper listing");
      }

      const data = await res.json();
      navigate(`/helper/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (eventForm.imageUrls.length < 1) {
      return setError("You must upload at least one image for the event");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/event/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
      } else {
        navigate(`/event/${data._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
  };

  const cardDetailsValid = () => {
    const cardNumberValid = /^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''));
    const expiryValid = /^\d{2}\/\d{2}$/.test(cardDetails.expiry);
    const cvvValid = /^\d{3,4}$/.test(cardDetails.cvv);
    const nameValid = cardDetails.name.trim().length > 0;

    return cardNumberValid && expiryValid && cvvValid && nameValid;
  };

  // UI Components
  const TabButton = ({ id, icon: Icon, label, description }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex flex-col items-center p-6 rounded-2xl transition-all duration-300
        ${activeTab === id 
          ? 'bg-white border-2 border-[#FF5A5F] shadow-lg shadow-red-100' 
          : 'bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200'
        }
      `}
    >
      <div className={`
        p-4 rounded-full mb-4 transition-all duration-300
        ${activeTab === id 
          ? 'bg-[#FF5A5F]/10 text-[#FF5A5F]' 
          : 'bg-gray-100 text-gray-600'
        }
      `}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
      <p className="text-sm text-gray-500 text-center">{description}</p>
    </button>
  );

  const SectionCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-[#FF5A5F] rounded-full"></div>
        {title}
      </h2>
      {children}
    </div>
  );

  const FormInput = ({ label, icon: Icon, type = "text", id, value, onChange, placeholder, required = false, className = "", rows = 4 }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
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
    </div>
  );

  const AmenityCard = ({ id, label, emoji, checked, onChange }) => (
    <label className={`
      flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200
      ${checked 
        ? 'border-[#FF5A5F] bg-[#FF5A5F]/5 shadow-sm' 
        : 'border-gray-200 hover:border-gray-300'
      }
    `}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <span className="text-xl">{emoji}</span>
      <span className="font-medium text-gray-700">{label}</span>
      <CheckCircleIcon className={`w-5 h-5 ml-auto ${checked ? 'text-[#FF5A5F]' : 'text-gray-300'}`} />
    </label>
  );

  const TypeCard = ({ id, label, emoji, description, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-left p-6 border-2 rounded-2xl transition-all duration-200
        ${selected 
          ? 'border-[#FF5A5F] bg-[#FF5A5F]/5 shadow-sm' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <span className="text-3xl mb-3 block">{emoji}</span>
      <h4 className="font-semibold text-gray-900 mb-1">{label}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );

  const MediaUploadArea = ({ type = 'image', onChange, onSubmit, filesCount, maxFiles = 10, label }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
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
            flex-1 p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center 
            cursor-pointer transition-all duration-200 hover:border-[#FF5A5F]/50
            ${uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}
          `}
        >
          {type === 'image' ? (
            <>
              <CameraIcon className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-gray-600 font-medium">{label || "Select photos"}</span>
              <span className="text-sm text-gray-500 mt-1">PNG, JPG or WebP (max 2MB each)</span>
              <span className="text-xs text-gray-400 mt-2">{filesCount || 0} of {maxFiles} photos</span>
            </>
          ) : (
            <>
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-gray-600 font-medium">{label || "Select video"}</span>
              <span className="text-sm text-gray-500 mt-1">MP4 or MOV (max 50MB)</span>
            </>
          )}
        </label>
        <button
          type="button"
          onClick={onSubmit}
          className={`
            px-8 py-4 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
            ${filesCount > 0 
              ? 'bg-[#FF5A5F] text-white hover:bg-[#E14E50]' 
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

  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-[#FF5A5F] h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const CheckboxField = ({ id, label, checked, onChange, description, icon: Icon }) => (
    <div className="flex items-start space-x-4 p-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 text-[#FF5A5F] rounded focus:ring-[#FF5A5F]"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <label htmlFor={id} className="font-medium text-gray-700">
            {label}
          </label>
        </div>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );

  if (loading && !showPromotionPopup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5A5F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your listing form...</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Create a New Listing
          </h1>
          <p className="text-gray-600 text-lg">
            Share your space, service, or event with our community
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <TabButton
            id="stays"
            icon={HomeIcon}
            label="Places to stay"
            description="Rent out your property"
          />
          <TabButton
            id="experiences"
            icon={BriefcaseIcon}
            label="Services"
            description="Offer professional services"
          />
          <TabButton
            id="online"
            icon={UserGroupIcon}
            label="Helpers"
            description="Register as a personal helper"
          />
          <TabButton
            id="events"
            icon={CalendarIcon}
            label="Events"
            description="Create local happenings"
          />
        </div>

        {/* Property Form */}
        {activeTab === 'stays' && (
          <form onSubmit={handlePropertySubmit} className="space-y-6">
            <SectionCard title="What type of place are you listing?">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "rent", label: "Room/Home Rent", emoji: "🏠", description: "Monthly rental" },
                  { id: "over", label: "Guest House", emoji: "🛌", description: "Nightly stays" },
                  { id: "office", label: "Hourly Stay", emoji: "🕒", description: "Per hour accommodation" },
                  { id: "land", label: "Land", emoji: "🌳", description: "Plot for sale" },
                  { id: "sale", label: "For Sale", emoji: "💰", description: "Property sale" },
                ].map((type) => (
                  <TypeCard
                    key={type.id}
                    {...type}
                    selected={propertyForm.type === type.id}
                    onClick={() => setPropertyForm({ ...propertyForm, type: type.id })}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Tell us about your place">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Listing title"
                  icon={HomeIcon}
                  id="name"
                  value={propertyForm.name}
                  onChange={handlePropertyChange}
                  placeholder="Cozy mountain cabin with amazing views"
                  required
                />
                <FormInput
                  label="Address"
                  icon={MapPinIcon}
                  id="address"
                  value={propertyForm.address}
                  onChange={handlePropertyChange}
                  placeholder="Enter full address"
                  required
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Description"
                    type="textarea"
                    id="description"
                    value={propertyForm.description}
                    onChange={handlePropertyChange}
                    placeholder="Describe what makes your place special..."
                    required
                    rows={5}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    label="Nearby attractions"
                    icon={MapPinIcon}
                    type="textarea"
                    id="near"
                    value={propertyForm.near}
                    onChange={handlePropertyChange}
                    placeholder="Mention nearby points of interest, restaurants, parks, etc."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    label="House rules"
                    icon={KeyIcon}
                    type="textarea"
                    id="rules"
                    value={propertyForm.rules}
                    onChange={handlePropertyChange}
                    placeholder="Enter any rules or regulations for the property"
                    rows={3}
                  />
                </div>
                <FormInput
                  label="Contact number"
                  icon={PhoneIcon}
                  id="contact"
                  value={propertyForm.contact}
                  onChange={handlePropertyChange}
                  placeholder="Contact phone number"
                  required
                />
                <FormInput
                  label="Host name"
                  icon={UserIcon}
                  id="host"
                  value={propertyForm.host}
                  onChange={handlePropertyChange}
                  placeholder="Your name or property manager"
                  required
                />
                <FormInput
                  label="Property type"
                  icon={HomeIcon}
                  id="kind"
                  value={propertyForm.kind}
                  onChange={handlePropertyChange}
                  placeholder="e.g., Apartment, House, Room"
                  required
                />
                <FormInput
                  label="Available from"
                  icon={CalendarIcon}
                  id="period"
                  value={propertyForm.period}
                  onChange={handlePropertyChange}
                  placeholder="e.g., Immediate, 1st December"
                  required
                />
                <FormInput
                  label="Cancellation policy"
                  icon={ClockIcon}
                  id="cancel"
                  value={propertyForm.cancel}
                  onChange={handlePropertyChange}
                  placeholder="e.g., Free cancellation 48 hours before"
                  required
                />
              </div>
            </SectionCard>

            <SectionCard title="Add some photos">
              <MediaUploadArea
                type="image"
                onChange={handleFileChange}
                onSubmit={() => handleImageSubmit('property')}
                filesCount={files.length}
                label="Upload property photos"
              />
              
              {imageUploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{imageUploadError}</p>
                </div>
              )}

              {propertyForm.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-4">Uploaded photos ({propertyForm.imageUrls.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {propertyForm.imageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, 'property')}
                          className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="font-medium text-gray-700 mb-4">Add a video tour (optional)</h3>
                <MediaUploadArea
                  type="video"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  onSubmit={handleVideoUpload}
                  filesCount={videoFile ? 1 : 0}
                  maxFiles={1}
                  label="Upload property video"
                />
                {videoUploadError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{videoUploadError}</p>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Amenities">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AmenityCard
                  id="wifi"
                  label="WiFi"
                  emoji="📶"
                  checked={propertyForm.wifi}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="kitchen"
                  label="Kitchen"
                  emoji="🍳"
                  checked={propertyForm.kitchen}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="parking"
                  label="Parking"
                  emoji="🅿️"
                  checked={propertyForm.parking}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="pool"
                  label="Pool"
                  emoji="🏊‍♂️"
                  checked={propertyForm.pool}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="tv"
                  label="TV"
                  emoji="📺"
                  checked={propertyForm.tv}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="bedrooms"
                  label="Bedrooms"
                  emoji="🛏️"
                  checked={propertyForm.bedrooms}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="bathrooms"
                  label="Baths"
                  emoji="🚿"
                  checked={propertyForm.bathrooms}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="stove"
                  label="Stovetop"
                  emoji="🔥"
                  checked={propertyForm.stove}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="storage"
                  label="Wardrobe"
                  emoji="👔"
                  checked={propertyForm.storage}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="security"
                  label="Security"
                  emoji="🔒"
                  checked={propertyForm.security}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="furnished"
                  label="Furnished"
                  emoji="🪑"
                  checked={propertyForm.furnished}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="hot"
                  label="Hot Shower"
                  emoji="🚿"
                  checked={propertyForm.hot}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="pets"
                  label="Pets Allowed"
                  emoji="🐾"
                  checked={propertyForm.pets}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="prepaid"
                  label="Electricity"
                  emoji="⚡"
                  checked={propertyForm.prepaid}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="fridge"
                  label="Refrigerator"
                  emoji="❄️"
                  checked={propertyForm.fridge}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="share"
                  label="House Share"
                  emoji="👥"
                  checked={propertyForm.share}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="breakfast"
                  label="Breakfast"
                  emoji="🍳"
                  checked={propertyForm.breakfast}
                  onChange={handlePropertyChange}
                />
                <AmenityCard
                  id="party"
                  label="Non-Party"
                  emoji="🔇"
                  checked={propertyForm.party}
                  onChange={handlePropertyChange}
                />
              </div>
            </SectionCard>

            <SectionCard title="Property details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {propertyForm.type === "land" || propertyForm.type === "office" ? "Square Meters" : "Bedrooms"}
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    value={propertyForm.bedrooms}
                    onChange={handlePropertyChange}
                    min={propertyForm.type === "land" || propertyForm.type === "office" ? 0 : 1}
                    max={10000}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                  />
                </div>
                
                {propertyForm.type !== "land" && propertyForm.type !== "office" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <input
                      type="number"
                      id="bathrooms"
                      value={propertyForm.bathrooms}
                      onChange={handlePropertyChange}
                      min="1"
                      max="10"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Pricing">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per {propertyForm.type === "rent" ? "month" : propertyForm.type === "over" ? "night" : propertyForm.type === "office" ? "hour" : "item"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      id="regularPrice"
                      value={propertyForm.regularPrice}
                      onChange={handlePropertyChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                      min="50"
                      required
                    />
                  </div>
                </div>
                
                <CheckboxField
                  id="offer"
                  label="Offer a discount"
                  checked={propertyForm.offer}
                  onChange={handlePropertyChange}
                  description="Attract more guests with a special price"
                  icon={TagIcon}
                />

                {propertyForm.offer && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discounted price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                      <input
                        type="number"
                        id="discountPrice"
                        value={propertyForm.discountPrice}
                        onChange={handlePropertyChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#FF5A5F] text-white rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Publish Listing
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Service Form */}
        {activeTab === 'experiences' && (
          <form onSubmit={handleServiceSubmit} className="space-y-6">
            <SectionCard title="What type of service are you offering?">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: "cleaning", label: "Cleaning", emoji: "🧹", description: "Home & office cleaning" },
                  { id: "maintenance", label: "Maintenance", emoji: "🔧", description: "Repairs & fixes" },
                  { id: "moving", label: "Moving", emoji: "🚚", description: "Relocation services" },
                  { id: "landscaping", label: "Landscaping", emoji: "🌿", description: "Garden & yard work" },
                  { id: "catering", label: "Catering", emoji: "🍽️", description: "Food & catering" },
                  { id: "daycare", label: "Day Care", emoji: "👶", description: "Child care services" },
                  { id: "schoolTransport", label: "Transport", emoji: "🚌", description: "School transport" },
                  { id: "other", label: "Other", emoji: "✨", description: "Other services" },
                ].map((type) => (
                  <TypeCard
                    key={type.id}
                    {...type}
                    selected={serviceForm.type === type.id}
                    onClick={() => setServiceForm({ ...serviceForm, type: type.id })}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Service information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Service name"
                  icon={BriefcaseIcon}
                  id="name"
                  value={serviceForm.name}
                  onChange={handleServiceChange}
                  placeholder={
                    serviceForm.type === "daycare" 
                      ? "Little Explorers Daycare" 
                      : serviceForm.type === "schoolTransport" 
                      ? "SafeRide School Transport"
                      : "Professional Cleaning Service"
                  }
                  required
                />
                <FormInput
                  label="Service area"
                  icon={MapPinIcon}
                  id="address"
                  value={serviceForm.address}
                  onChange={handleServiceChange}
                  placeholder="Areas you serve"
                  required
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Service description"
                    type="textarea"
                    id="description"
                    value={serviceForm.description}
                    onChange={handleServiceChange}
                    placeholder={
                      serviceForm.type === "daycare" 
                        ? "Describe your daycare program, activities, educational approach..." 
                        : serviceForm.type === "schoolTransport" 
                        ? "Describe your transport service, safety measures, vehicle details..."
                        : "Describe your service in detail..."
                    }
                    required
                    rows={5}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    label="Experience & qualifications"
                    type="textarea"
                    id="near"
                    value={serviceForm.near}
                    onChange={handleServiceChange}
                    placeholder={
                      serviceForm.type === "daycare" 
                        ? "Your experience with childcare, relevant certifications, training..." 
                        : serviceForm.type === "schoolTransport" 
                        ? "Driving experience, safety certifications, background checks..."
                        : "Describe your experience and qualifications"
                    }
                    rows={4}
                  />
                </div>
                <FormInput
                  label="Contact number"
                  icon={PhoneIcon}
                  id="contact"
                  value={serviceForm.contact}
                  onChange={handleServiceChange}
                  placeholder="Contact phone number"
                  required
                />
                <FormInput
                  label="Service provider"
                  icon={UserIcon}
                  id="host"
                  value={serviceForm.host}
                  onChange={handleServiceChange}
                  placeholder={
                    serviceForm.type === "daycare" 
                      ? "Daycare center name" 
                      : "Your name or company name"
                  }
                  required
                />
                
                {serviceForm.type === "daycare" && (
                  <>
                    <FormInput
                      label="Age group"
                      icon={UserGroupIcon}
                      id="ageGroup"
                      value={serviceForm.ageGroup}
                      onChange={handleServiceChange}
                      placeholder="e.g., 6 months - 5 years"
                    />
                    <FormInput
                      label="License number"
                      icon={ShieldCheckIcon}
                      id="licenseNumber"
                      value={serviceForm.licenseNumber}
                      onChange={handleServiceChange}
                      placeholder="Your daycare license number"
                    />
                    <FormInput
                      label="Capacity"
                      icon={UsersIcon}
                      id="capacity"
                      value={serviceForm.capacity}
                      onChange={handleServiceChange}
                      placeholder="Number of children you can accommodate"
                    />
                  </>
                )}
                
                {serviceForm.type === "schoolTransport" && (
                  <>
                    <FormInput
                      label="Vehicle type"
                      icon={TruckIcon}
                      id="vehicleType"
                      value={serviceForm.vehicleType}
                      onChange={handleServiceChange}
                      placeholder="e.g., Minivan, School Bus, SUV"
                    />
                    <FormInput
                      label="Route areas"
                      icon={MapPinIcon}
                      id="routeAreas"
                      value={serviceForm.routeAreas}
                      onChange={handleServiceChange}
                      placeholder="Neighborhoods or schools served"
                    />
                  </>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Add service photos">
              <MediaUploadArea
                type="image"
                onChange={handleFileChange}
                onSubmit={() => handleImageSubmit('service')}
                filesCount={files.length}
                label="Upload service photos"
              />
              
              {imageUploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{imageUploadError}</p>
                </div>
              )}

              {serviceForm.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-4">Uploaded photos ({serviceForm.imageUrls.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {serviceForm.imageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, 'service')}
                          className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Service details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {serviceForm.type === "daycare" ? "Monthly rate" : "Hourly rate"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      id="regularPrice"
                      value={serviceForm.regularPrice}
                      onChange={handleServiceChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                      min="50"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {serviceForm.type === "daycare" ? "/month" : "/hour"}
                    </span>
                  </div>
                </div>
                
                <FormInput
                  label="Service category"
                  icon={TagIcon}
                  id="kind"
                  value={serviceForm.kind}
                  onChange={handleServiceChange}
                  placeholder={
                    serviceForm.type === "daycare" 
                      ? "e.g., Montessori, Play-based, Bilingual" 
                      : "e.g., Residential, Commercial"
                  }
                />

                <FormInput
                  label="Availability"
                  icon={ClockIcon}
                  id="period"
                  value={serviceForm.period}
                  onChange={handleServiceChange}
                  placeholder={
                    serviceForm.type === "daycare" 
                      ? "e.g., Mon-Fri 7:30am-6:00pm" 
                      : "e.g., Weekdays 9am-5pm"
                  }
                />

                <FormInput
                  label="Cancellation policy"
                  icon={ClockIcon}
                  id="cancel"
                  value={serviceForm.cancel}
                  onChange={handleServiceChange}
                  placeholder="Your cancellation policy"
                />

                <CheckboxField
                  id="security"
                  label="Background check verified"
                  checked={serviceForm.security}
                  onChange={handleServiceChange}
                  description="I have a verified background check"
                  icon={ShieldCheckIcon}
                />

                <CheckboxField
                  id="pets"
                  label={
                    serviceForm.type === "daycare" 
                      ? "Special needs experience" 
                      : "Pet friendly"
                  }
                  checked={serviceForm.pets}
                  onChange={handleServiceChange}
                  description={
                    serviceForm.type === "daycare" 
                      ? "Experience with special needs children" 
                      : "Comfortable working with pets"
                  }
                  icon={serviceForm.type === "daycare" ? AcademicCapIcon : PawIcon}
                />
              </div>
            </SectionCard>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#FF5A5F] text-white rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Publish Service
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Helper Form */}
        {activeTab === 'online' && (
          <form onSubmit={handleHelperSubmit} className="space-y-6">
            <SectionCard title="What type of helper are you?">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "domestic", label: "Domestic Helper", emoji: "🧹", description: "Cleaning, laundry, chores" },
                  { id: "errand", label: "Errand Runner", emoji: "🏃", description: "Shopping, deliveries, tasks" },
                  { id: "tutor", label: "Private Tutor", emoji: "📚", description: "Academic tutoring" },
                  { id: "chef", label: "Private Chef", emoji: "👨‍🍳", description: "Meal preparation" },
                  { id: "beauty", label: "Beauty Specialist", emoji: "💅", description: "Hair, nails, makeup" },
                  { id: "tattoo", label: "Tattoo Artist", emoji: "🖌️", description: "Tattoo design" },
                  { id: "barber", label: "Barber", emoji: "✂️", description: "Haircuts, grooming" },
                  { id: "photography", label: "Photographer", emoji: "📷", description: "Photo sessions" },
                  { id: "baker", label: "Baker", emoji: "🍰", description: "Custom baked goods" },
                ].map((type) => (
                  <TypeCard
                    key={type.id}
                    {...type}
                    selected={helperForm.type === type.id}
                    onClick={() => setHelperForm(prev => ({ ...prev, type: type.id }))}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="About you">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label={
                    helperForm.type === "tutor" ? "Tutor Name" : 
                    helperForm.type === "barber" ? "Barber Name" :
                    helperForm.type === "photography" ? "Photographer Name" :
                    helperForm.type === "baker" ? "Baker Name" : "Helper Name"
                  }
                  icon={UserIcon}
                  id="name"
                  value={helperForm.name}
                  onChange={handleHelperChange}
                  placeholder={
                    helperForm.type === "tutor" ? "John Smith" : 
                    helperForm.type === "barber" ? "Your professional name" :
                    helperForm.type === "photography" ? "Your photography business name" :
                    helperForm.type === "baker" ? "Your baking business name" : "Your name"
                  }
                  required
                />
                <FormInput
                  label="Service area"
                  icon={MapPinIcon}
                  id="address"
                  value={helperForm.address}
                  onChange={handleHelperChange}
                  placeholder="Areas you serve"
                  required
                />
                <div className="md:col-span-2">
                  <FormInput
                    label={
                      helperForm.type === "tutor"
                        ? "Qualifications & Teaching Approach"
                        : helperForm.type === "barber" 
                          ? "Barber Experience & Specialties"
                          : helperForm.type === "photography"
                            ? "Photography Style & Experience"
                            : helperForm.type === "baker"
                              ? "Baking Experience & Specialties"
                              : "Service Description"
                    }
                    type="textarea"
                    id="description"
                    value={helperForm.description}
                    onChange={handleHelperChange}
                    placeholder={
                      helperForm.type === "domestic" ? "Describe your cleaning methods and experience..." :
                      helperForm.type === "errand" ? "Describe the types of errands you can run..." :
                      helperForm.type === "barber" ? "Describe your barber experience, specialties, and approach..." :
                      helperForm.type === "photography" ? "Describe your photography style, experience, and approach..." :
                      helperForm.type === "baker" ? "Describe your baking experience, specialties, and approach..." :
                      "Describe your teaching qualifications and methods..."
                    }
                    required
                    rows={5}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    label={
                      helperForm.type === "tutor"
                        ? "Subjects/Skills You Teach"
                        : helperForm.type === "barber"
                          ? "Services Offered"
                          : helperForm.type === "photography"
                            ? "Photography Services"
                            : helperForm.type === "baker"
                              ? "Baked Goods & Services"
                              : "Specific Services"
                    }
                    type="textarea"
                    id="near"
                    value={helperForm.near}
                    onChange={handleHelperChange}
                    placeholder={
                      helperForm.type === "domestic" ? "E.g., Deep cleaning, laundry, ironing" :
                      helperForm.type === "errand" ? "E.g., Grocery shopping, pharmacy runs" :
                      helperForm.type === "barber" ? "E.g., Men's haircuts, beard trims, straight razor shaves" :
                      helperForm.type === "photography" ? "E.g., Portrait sessions, event photography, product photography" :
                      helperForm.type === "baker" ? "E.g., Custom cakes, wedding cakes, pastries, breads" :
                      "E.g., Mathematics, English, Science"
                    }
                    rows={4}
                  />
                </div>
                <FormInput
                  label="Contact number"
                  icon={PhoneIcon}
                  id="contact"
                  value={helperForm.contact}
                  onChange={handleHelperChange}
                  placeholder="Phone number"
                  required
                />
                <FormInput
                  label={
                    helperForm.type === "tutor" ? "Years of Experience" : 
                    helperForm.type === "barber" ? "Barber Experience" :
                    helperForm.type === "photography" ? "Photography Experience" :
                    helperForm.type === "baker" ? "Baking Experience" : "Experience"
                  }
                  icon={ClockIcon}
                  id="host"
                  value={helperForm.host}
                  onChange={handleHelperChange}
                  placeholder={
                    helperForm.type === "tutor" ? "5 years teaching experience" :
                    helperForm.type === "barber" ? "3 years as professional barber" :
                    helperForm.type === "photography" ? "4 years professional photography" :
                    helperForm.type === "baker" ? "5 years professional baking" :
                    "3 years experience"
                  }
                  required
                />

                {helperForm.type === "tutor" && (
                  <>
                    <FormInput
                      label="Education level"
                      icon={AcademicCapIcon}
                      id="kind"
                      value={helperForm.kind}
                      onChange={handleHelperChange}
                      placeholder="E.g., Bachelor's Degree in Education"
                    />
                    <FormInput
                      label="Age group"
                      icon={UserGroupIcon}
                      id="period"
                      value={helperForm.period}
                      onChange={handleHelperChange}
                      placeholder="E.g., Primary school, High school"
                    />
                  </>
                )}

                {(helperForm.type !== "tutor" && helperForm.type !== "barber" && helperForm.type !== "photography" && helperForm.type !== "baker") && (
                  <>
                    <FormInput
                      label="Availability"
                      icon={ClockIcon}
                      id="period"
                      value={helperForm.period}
                      onChange={handleHelperChange}
                      placeholder="E.g., Weekdays 8am-5pm"
                    />
                    <FormInput
                      label="Languages spoken"
                      icon={BookOpenIcon}
                      id="cancel"
                      value={helperForm.cancel}
                      onChange={handleHelperChange}
                      placeholder="E.g., English, Afrikaans"
                    />
                  </>
                )}

                {helperForm.type === "barber" && (
                  <>
                    <FormInput
                      label="Specializations"
                      icon={ScissorsIcon}
                      id="specializations"
                      value={helperForm.specializations}
                      onChange={handleHelperChange}
                      placeholder="E.g., Fades, classic cuts, beard designs"
                    />
                    <FormInput
                      label="Equipment"
                      icon={BriefcaseIcon}
                      id="equipment"
                      value={helperForm.equipment}
                      onChange={handleHelperChange}
                      placeholder="E.g., Bring own tools, sanitized equipment"
                    />
                  </>
                )}

                {helperForm.type === "photography" && (
                  <>
                    <FormInput
                      label="Photography style"
                      icon={PhotoIcon}
                      id="style"
                      value={helperForm.style}
                      onChange={handleHelperChange}
                      placeholder="E.g., Portrait, candid, studio, outdoor"
                    />
                    <FormInput
                      label="Equipment"
                      icon={CameraIcon}
                      id="equipment"
                      value={helperForm.equipment}
                      onChange={handleHelperChange}
                      placeholder="E.g., Professional DSLR, lighting, backup equipment"
                    />
                  </>
                )}

                {helperForm.type === "baker" && (
                  <>
                    <FormInput
                      label="Specialties"
                      icon={CakeIcon}
                      id="specialties"
                      value={helperForm.specialties}
                      onChange={handleHelperChange}
                      placeholder="E.g., Wedding cakes, gluten-free baking, French pastries"
                    />
                    <FormInput
                      label="Dietary options"
                      icon={BeakerIcon}
                      id="dietaryOptions"
                      value={helperForm.dietaryOptions}
                      onChange={handleHelperChange}
                      placeholder="E.g., Vegan, gluten-free, sugar-free options"
                    />
                  </>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Add your portfolio photos">
              <MediaUploadArea
                type="image"
                onChange={handleFileChange}
                onSubmit={() => handleImageSubmit('helper')}
                filesCount={files.length}
                label={
                  helperForm.type === "tutor"
                    ? "Upload certificates and teaching materials"
                    : helperForm.type === "barber"
                      ? "Upload photos of your work"
                      : helperForm.type === "photography"
                        ? "Upload your photography portfolio"
                        : helperForm.type === "baker"
                          ? "Upload photos of your baked goods"
                          : "Upload photos of your work"
                }
              />
              
              {imageUploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{imageUploadError}</p>
                </div>
              )}

              {helperForm.imageUrls && helperForm.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-4">Uploaded photos ({helperForm.imageUrls.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {helperForm.imageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, 'helper')}
                          className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Pricing & details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {helperForm.type === "tutor"
                      ? "Hourly rate"
                      : helperForm.type === "barber"
                        ? "Starting price"
                        : helperForm.type === "photography"
                          ? "Session starting price"
                          : helperForm.type === "baker"
                            ? "Starting price"
                            : "Service rate"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      id="regularPrice"
                      value={helperForm.regularPrice}
                      onChange={handleHelperChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                      min="50"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {helperForm.type === "tutor" ? "/hour" : 
                       helperForm.type === "photography" ? "/session" : "/service"}
                    </span>
                  </div>
                </div>

                {helperForm.type === "tutor" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teaching format</label>
                    <select
                      id="bathrooms"
                      value={helperForm.bathrooms}
                      onChange={handleHelperChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                    >
                      <option value="1">In-person</option>
                      <option value="2">Online</option>
                      <option value="3">Both</option>
                    </select>
                  </div>
                ) : helperForm.type === "domestic" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum hours</label>
                    <div className="relative">
                      <input
                        type="number"
                        id="bedrooms"
                        value={helperForm.bedrooms}
                        onChange={handleHelperChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                        min="1"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        hours
                      </span>
                    </div>
                  </div>
                ) : null}

                {helperForm.type === "barber" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Travel fee (optional)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                        <input
                          type="number"
                          id="travelFee"
                          value={helperForm.travelFee}
                          onChange={handleHelperChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Booking notice</label>
                      <select
                        id="bookingNotice"
                        value={helperForm.bookingNotice}
                        onChange={handleHelperChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      >
                        <option value="">Select notice period</option>
                        <option value="1">Same day</option>
                        <option value="24">24 hours</option>
                        <option value="48">48 hours</option>
                        <option value="72">72 hours</option>
                      </select>
                    </div>
                  </>
                )}

                {helperForm.type === "photography" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session duration</label>
                      <select
                        id="sessionDuration"
                        value={helperForm.sessionDuration}
                        onChange={handleHelperChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      >
                        <option value="">Select duration</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Photo delivery time</label>
                      <input
                        type="text"
                        id="photoDelivery"
                        value={helperForm.photoDelivery}
                        onChange={handleHelperChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        placeholder="E.g., 5-7 days, digital download"
                      />
                    </div>
                  </>
                )}

                {helperForm.type === "baker" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order notice required</label>
                      <select
                        id="orderNotice"
                        value={helperForm.orderNotice}
                        onChange={handleHelperChange}
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
                      <div className="flex items-center h-full">
                        <input
                          type="checkbox"
                          id="delivery"
                          checked={helperForm.delivery}
                          onChange={handleHelperChange}
                          className="h-5 w-5 text-[#FF5A5F] rounded focus:ring-[#FF5A5F]"
                        />
                        <label htmlFor="delivery" className="ml-2 font-medium text-gray-700">
                          Offer delivery service
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <CheckboxField
                  id="security"
                  label="Background check verified"
                  checked={helperForm.security}
                  onChange={handleHelperChange}
                  description="I have a verified background check"
                  icon={ShieldCheckIcon}
                />

                {helperForm.type !== "tutor" && (
                  <CheckboxField
                    id="pets"
                    label="Pet friendly"
                    checked={helperForm.pets}
                    onChange={handleHelperChange}
                    description="Comfortable with pets"
                    icon={PawIcon}
                  />
                )}
              </div>

              {(helperForm.type === "barber" || helperForm.type === "photography" || helperForm.type === "baker") && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-4">Additional pricing details</h3>
                  <textarea
                    id="additionalPricing"
                    value={helperForm.additionalPricing}
                    onChange={handleHelperChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                    placeholder={
                      helperForm.type === "barber" 
                        ? "E.g., Beard trim: R80, Kids cut: R100, Haircut + Beard: R200"
                        : helperForm.type === "photography"
                          ? "E.g., 1-hour portrait: R500, 2-hour event: R1000, Full wedding: R5000"
                          : "E.g., Custom cakes: from R300, Dozen cupcakes: R150, Pastry box: R200"
                    }
                    rows={4}
                  />
                </div>
              )}
            </SectionCard>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#FF5A5F] text-white rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Publish Profile
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Event Form */}
        {activeTab === 'events' && (
          <form onSubmit={handleEventSubmit} className="space-y-6">
            <SectionCard title="What type of event are you creating?">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { id: "music", label: "Music", emoji: "🎵", description: "Concerts, festivals" },
                  { id: "sports", label: "Sports", emoji: "⚽", description: "Games, tournaments" },
                  { id: "art", label: "Art & Culture", emoji: "🎨", description: "Exhibitions, shows" },
                  { id: "community", label: "Community", emoji: "🧑‍🤝‍🧑", description: "Meetups, gatherings" },
                  { id: "food", label: "Food & Drink", emoji: "🍔", description: "Food festivals, tastings" },
                ].map((type) => (
                  <TypeCard
                    key={type.id}
                    {...type}
                    selected={eventForm.type === type.id}
                    onClick={() => setEventForm({ ...eventForm, type: type.id })}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Event information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormInput
                    label="Event title"
                    icon={CalendarIcon}
                    id="name"
                    value={eventForm.name}
                    onChange={handleEventChange}
                    placeholder="e.g., Summer Music Festival"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    label="Event description"
                    type="textarea"
                    id="description"
                    value={eventForm.description}
                    onChange={handleEventChange}
                    placeholder="Describe the event, activities, and what attendees can expect..."
                    required
                    rows={5}
                  />
                </div>
                <FormInput
                  label="Venue / Location"
                  icon={MapPinIcon}
                  id="address"
                  value={eventForm.address}
                  onChange={handleEventChange}
                  placeholder="Enter the full address"
                  required
                />
                <FormInput
                  label="Organizer name"
                  icon={UserIcon}
                  id="host"
                  value={eventForm.host}
                  onChange={handleEventChange}
                  placeholder="Your name or organization"
                  required
                />
                <FormInput
                  label="Event date"
                  icon={CalendarIcon}
                  type="date"
                  id="date"
                  value={eventForm.date}
                  onChange={handleEventChange}
                  required
                />
                <FormInput
                  label="Event time"
                  icon={ClockIcon}
                  type="time"
                  id="time"
                  value={eventForm.time}
                  onChange={handleEventChange}
                  required
                />
                <FormInput
                  label="Contact information"
                  icon={PhoneIcon}
                  id="contact"
                  value={eventForm.contact}
                  onChange={handleEventChange}
                  placeholder="Contact phone or email"
                  required
                />
              </div>
            </SectionCard>

            <SectionCard title="Add event media">
              <MediaUploadArea
                type="image"
                onChange={handleFileChange}
                onSubmit={() => handleImageSubmit('event')}
                filesCount={files.length}
                label="Upload event photos and posters"
              />
              
              {imageUploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{imageUploadError}</p>
                </div>
              )}

              {eventForm.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-4">Uploaded photos ({eventForm.imageUrls.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eventForm.imageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, 'event')}
                          className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="font-medium text-gray-700 mb-4">Add event video (optional)</h3>
                <MediaUploadArea
                  type="video"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  onSubmit={handleVideoUpload}
                  filesCount={videoFile ? 1 : 0}
                  maxFiles={1}
                  label="Upload event video"
                />
                {videoUploadError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{videoUploadError}</p>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Event details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticket price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      id="regularPrice"
                      value={eventForm.regularPrice}
                      onChange={handleEventChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                      min="0"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      (0 for free event)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <CheckboxField
                  id="parking"
                  label="Parking available"
                  checked={eventForm.parking}
                  onChange={handleEventChange}
                  description="On-site parking facilities"
                  icon={TruckIcon}
                />
                <CheckboxField
                  id="foodAvailable"
                  label="Food & drinks"
                  checked={eventForm.foodAvailable}
                  onChange={handleEventChange}
                  description="Food and beverages available"
                  icon={CakeIcon}
                />
                <CheckboxField
                  id="familyFriendly"
                  label="Family friendly"
                  checked={eventForm.familyFriendly}
                  onChange={handleEventChange}
                  description="Suitable for all ages"
                  icon={HeartIcon}
                />
              </div>
            </SectionCard>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#FF5A5F] text-white rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Publish Event
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Important Message */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Note</h3>
              <p className="text-blue-700 text-sm">
                If your post doesn't go through, we recommend logging out of your account and then logging back in. 
                This will help refresh your session and resolve any potential errors you may encounter.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress Modal */}
        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5A5F] mx-auto"></div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Uploading Media</h3>
                <p className="mt-2 text-gray-600">{Math.round(uploadProgress)}% complete</p>
                <div className="mt-4">
                  <ProgressBar progress={uploadProgress} />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Please don't close this window while uploading...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Promotion Popup */}
        {showPromotionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
              {promotionSteps === 0 && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SparklesIcon className="w-10 h-10 text-[#FF5A5F]" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Listing Created! 🎉</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Boost your listing's visibility and get more bookings with our promotion packages.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setPromotionSteps(1)}
                      className="px-8 py-3 bg-[#FF5A5F] text-white rounded-xl font-medium hover:bg-[#E14E50] transition-colors duration-200 flex items-center gap-2"
                    >
                      Promote Now
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/listing/${newListingId}`)}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Skip for Now
                    </button>
                  </div>
                </div>
              )}

              {promotionSteps === 1 && (
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-6 h-6 text-[#FF5A5F]" />
                    <h3 className="text-2xl font-bold text-gray-900">Choose Your Promotion</h3>
                  </div>
                  <p className="text-gray-600 mb-8">Select a package that fits your needs</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div
                      onClick={() => setPromotionPackage('standard')}
                      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        promotionPackage === 'standard' 
                          ? 'border-[#FF5A5F] bg-[#FF5A5F]/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">Standard</h4>
                          <p className="text-sm text-gray-500 mt-1">25x more visibility</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#FF5A5F]">R40</span>
                          <p className="text-xs text-gray-500">one-time payment</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          25x more clicks
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          Featured in category
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          7-day promotion
                        </li>
                      </ul>
                    </div>

                    <div
                      onClick={() => setPromotionPackage('premium')}
                      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        promotionPackage === 'premium' 
                          ? 'border-[#FF5A5F] bg-[#FF5A5F]/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">Premium</h4>
                          <p className="text-sm text-gray-500 mt-1">80x more visibility</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#FF5A5F]">R100</span>
                          <p className="text-xs text-gray-500">one-time payment</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          80x more clicks
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          Homepage feature
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          14-day promotion
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          Priority support
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setPromotionSteps(0)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setPromotionSteps(2)}
                      disabled={!promotionPackage}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
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
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                  <p className="text-gray-600 mb-6">Choose your payment method</p>

                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">Order Summary</p>
                        <p className="text-sm text-gray-500">Promotion: {promotionPackage}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#FF5A5F]">
                          R{promotionPackage === 'standard' ? '40' : '100'}
                        </p>
                        <p className="text-xs text-gray-500">one-time payment</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
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
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedPaymentMethod === method.id
                            ? 'border-[#FF5A5F] bg-[#FF5A5F]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <method.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{method.name}</h4>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <CheckCircleIcon className="w-5 h-5 text-[#FF5A5F]" />
                          )}
                        </div>
                      </div>
                    ))}

                    {selectedPaymentMethod === 'card' && (
                      <div className="mt-4 space-y-4 p-4 border border-gray-200 rounded-xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setPromotionSteps(1)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handlePromoteListing}
                      disabled={selectedPaymentMethod === 'card' && !cardDetailsValid()}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
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
    </div>
  );
}