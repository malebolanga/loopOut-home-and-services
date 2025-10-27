import { useState, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/ListingDetails.scss";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stays');
  const [files, setFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Separate form data for each tab
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
  // New fields for daycare
  ageGroup: "",
  licenseNumber: "",
  capacity: "",
  // New fields for school transport
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
    bedrooms: 1, // Reused for minimum hours
    bathrooms: 1, // Reused for teaching format
    // New fields for barber
    specializations: '',
    equipment: '',
    travelFee: '',
    bookingNotice: '',
    additionalPricing: ''
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


  const [showPromotionPopup, setShowPromotionPopup] = useState(false);
  const [promotionPackage, setPromotionPackage] = useState('');
  const [promotionSteps, setPromotionSteps] = useState(0);
  const [newListingId, setNewListingId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const [imageUploadError, setImageUploadError] = useState(null);
  const [videoUploadError, setVideoUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postLimitReached, setPostLimitReached] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);

  // Check post limit on component mount
 // Check post limit on component mount
useEffect(() => {
  setLoading(true);
  const timer = setTimeout(() => {
    const fetchPostCount = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Use the correct API endpoint based on your environment
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiUrl}/api/user/post-count`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser._id }),
        });

        if (!res.ok) {
          if (res.status === 404) {
            // If endpoint doesn't exist, assume no limit
            setPostLimitReached(false);
            setPaymentRequired(false);
            return;
          }
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();

        // Assuming your API returns { count: number, limit: number }
        if (data.count >= (data.limit || 3)) {
          setPostLimitReached(true);
          setPaymentRequired(true);
        } else {
          setPostLimitReached(false);
          setPaymentRequired(false);
        }
      } catch (err) {
        console.error("Failed to fetch post count:", err);
        // Default to no limits if there's an error
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
            0.7 // Quality
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file change with compression
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

  // Store image function
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
          console.error("Upload error:", error);
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
            console.error("Error getting download URL:", error);
            reject(new Error("Failed to get image URL"));
          }
        }
      );
    });
  };

  // Handle remove image
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

  // Store video function
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
          console.error("Video upload error:", error);
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
            console.error("Error getting video URL:", error);
            reject(new Error("Failed to get video URL"));
          }
        }
      );
    });
  };

  // Handle image submit
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
      console.error("Image upload error:", err);
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

  // Handle video upload
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
      console.error("Video upload error:", err);
      setVideoUploadError(err.message || "Video upload failed (50MB max)");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle property form change
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

  // Handle service form change
// Handle service form change
const handleServiceChange = (e) => {
  const { id, value, type, checked } = e.target;

  const serviceTypes = [
    "cleaning", 
    "maintenance", 
    "moving", 
    "landscaping", 
    "catering", 
    "other",
    "daycare",        
    "schoolTransport"
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

   // Handle helper form change - UPDATED TO INCLUDE BARBER TYPE
  const handleHelperChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "domestic" || id === "errand" || id === "tutor" || id === "chef" || id === "beauty" || id === "tattoo" || id === "barber") {
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

  // Handle property form submit
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



  // Handle service form submit
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
          offer: false // or set based on your form logic
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



  // Handle helper form submit
// Update the handleHelperSubmit function
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

    // Check if response is OK before parsing JSON
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
        userRef: currentUser._id, // Ensure this is included
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

  // Handle promotion listing
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

  // Handle payment
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

  // Handle payment selection
  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
  };

  // Card details validation
  const cardDetailsValid = () => {
    const cardNumberValid = /^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''));
    const expiryValid = /^\d{2}\/\d{2}$/.test(cardDetails.expiry);
    const cvvValid = /^\d{3,4}$/.test(cardDetails.cvv);
    const nameValid = cardDetails.name.trim().length > 0;

    return cardNumberValid && expiryValid && cvvValid && nameValid;
  };

  // Loading state
  if (loading && !showPromotionPopup) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-4 lg:px-8">
        <div className="max-w-6xl mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold my-7">Create New Listing</h1>
          <div className="flex justify-center py-10">
            <span className="animate-spin text-4xl text-blue-500">⏳</span>
          </div>
          <p className="text-gray-500">Loading listing form...</p>
        </div>
      </div>
    );
  }

  // Post limit reached
  if (postLimitReached) {
    return paymentRequired ? (
      <div className="p-4 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-red-500 mb-4">Post Limit Reached</h1>
        <p className="text-gray-700 mb-4">You have reached the limit of 3 free listings. Pay R35 per post to create more.</p>
        <button
          onClick={handlePayment}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? <span className="animate-spin">⏳</span> : "Pay R35 to Create More Listings"}
        </button>
        {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
      </div>
    ) : (
      <div className="p-4 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-red-500 mb-4">Post Limit Reached</h1>
        <p className="text-gray-700">Delete existing listings to create new ones.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upload progress modal */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center min-w-[300px]">
            <span className="animate-spin text-4xl text-airbnb-red mb-4 mx-auto">⏳</span>
            <p className="mb-2">Uploading {uploadProgress === 100 ? 'processing...' : `${Math.round(uploadProgress)}%`}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-airbnb-red h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
  <div className="max-w-3xl mx-auto mt-0 mb-8 p-6 bg-white rounded-xl shadow-md">
  {/* Guidance heading with subtle animation */}
  <h2 className="text-xl font-semibold text-center text-gray-800 mb-6 transition-all duration-300">
    {activeTab === 'stays' ? 'List your property for sale or rent' : 
     activeTab === 'experiences' ? 'Offer your professional services' : 
     activeTab === 'online' ? 'Register as a personal helper' : 
     'Create a local event or happening'}
  </h2>
  
  <div className="overflow-hidden">
    <div className="relative">
      {/* 3D Animated indicator bar with gradient */}
      <div 
        className={`absolute bottom-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
          activeTab === 'stays' ? 'left-[0%] w-[25%]' :
          activeTab === 'experiences' ? 'left-[25%] w-[25%]' :
          activeTab === 'online' ? 'left-[50%] w-[25%]' :
          'left-[75%] w-[25%]'
        }`}
        style={{
          boxShadow: '0 2px 12px rgba(236, 72, 153, 0.4)',
          transform: 'translateZ(0)'
        }}
      />
      
      <nav className="flex bg-gray-50 rounded-lg p-1.5">
        {[
          { id: 'stays', emoji: '🏠', label: 'Properties' },
          { id: 'experiences', emoji: '🛎️', label: 'Services' },
          { id: 'online', emoji: '👷', label: 'Helpers' },
          { id: 'events', emoji: '🎪', label: 'Events' }
           
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 py-5 text-center transition-all duration-300 rounded-lg ${
              activeTab === tab.id 
                ? 'bg-white shadow-lg' 
                : 'hover:bg-gray-100'
            }`}
            style={{
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="flex flex-col items-center">
              <span 
                className={`text-4xl mb-3 font-bold transition-all duration-500 ${
                  activeTab === tab.id 
                    ? 'text-rose-600' 
                    : 'text-gray-500'
                }`}
                style={{
                  transform: activeTab === tab.id 
                    ? 'scale(1.3) translateY(-4px) translateZ(12px)' 
                    : 'scale(1) translateZ(0)',
                  filter: activeTab === tab.id 
                    ? 'drop-shadow(0 6px 12px rgba(236, 72, 153, 0.3))' 
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  textShadow: activeTab === tab.id
                    ? '2px 2px 4px rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.3)'
                    : '1px 1px 2px rgba(0,0,0,0.1)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                  willChange: 'transform, filter'
                }}
              >
                {tab.emoji}
              </span>
              <span className={`text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-rose-700 font-semibold' 
                  : 'text-gray-600'
              }`}>
                {tab.label}
              </span>
            </div>
            
            {/* 3D depth effect for active tab */}
            {activeTab === tab.id && (
              <div 
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  border: '2px solid rgba(236, 72, 153, 0.15)',
                  transform: 'translateZ(8px)',
                  zIndex: -1
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  </div>
</div>

      {/* Property Form */}
      {/* Property Form */}
{activeTab === 'stays' && (
  <form onSubmit={handlePropertySubmit} className="space-y-8">
    {/* Property Type Selection */}
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Property Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { id: "rent", label: "Room/Home Rent", emoji: "🏠" },
          { id: "over", label: "Guest House", emoji: "🛌" },
          { id: "office", label: "Accomodation Per Hour", emoji: "🕒" },
          { id: "land", label: "Land", emoji: "🌳" },
          { id: "sale", label: "For Sale", emoji: "💰" },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setPropertyForm({ ...propertyForm, type: type.id })}
            className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${propertyForm.type === type.id
                ? "border-airbnb-red bg-red-50"
                : "border-gray-200 hover:border-airbnb-red/50"
              }`}
          >
            <span className="text-2xl mb-2">{type.emoji}</span>
            <span className="font-medium text-gray-700">{type.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Basic Information */}
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Basic Information</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">Property Name</label>
          <input
            type="text"
            id="name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Cozy Mountain Cabin"
            onChange={handlePropertyChange}
            value={propertyForm.name}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Address</label>
          <input
            type="text"
            id="address"
            className="w-full p-3 border border-gray-200 rounded-lg"
            placeholder="Enter full address"
            onChange={handlePropertyChange}
            value={propertyForm.address}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder="Describe your property..."
            onChange={handlePropertyChange}
            value={propertyForm.description}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">Mention nearby points of interest</label>
          <textarea
            id="near"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder="Mention nearby points of interest"
            onChange={handlePropertyChange}
            value={propertyForm.near}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">Enter any rules or regulations for the property</label>
          <textarea
            id="rules"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder="Enter any rules or regulations for the property"
            onChange={handlePropertyChange}
            value={propertyForm.rules}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Contact Details</label>
          <input
            type="number"
            id="contact"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Contact Details"
            onChange={handlePropertyChange}
            value={propertyForm.contact}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Name of Host/Seller</label>
          <input
            type="text"
            id="host"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Contact Details"
            onChange={handlePropertyChange}
            value={propertyForm.host}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Type (e.g., House or Room)</label>
          <input
            type="text"
            id="kind"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Type (e.g., House or Room)"
            onChange={handlePropertyChange}
            value={propertyForm.kind}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Available from which date</label>
          <input
            type="text"
            id="period"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Available from which date"
            onChange={handlePropertyChange}
            value={propertyForm.period}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Cancellation Policy</label>
          <input
            type="text"
            id="cancel"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Cancellation Policy"
            onChange={handlePropertyChange}
            value={propertyForm.cancel}
          />
        </div>
      </div>
    </div>

    {/* Media Upload */}
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Add Photos & Video</h2>

      {/* Image Upload */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="images"
            className={`flex-1 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-airbnb-red'
              }`}
          >
            <span className="text-3xl mb-2">📸</span>
            <span className="text-gray-600">Drag photos or click to upload</span>
            <span className="text-sm text-gray-500">Up to 10 photos (2MB max each)</span>
          </label>
          <button
            type="button"
            onClick={() => handleImageSubmit('property')}
            className="h-full px-6 bg-airbnb-red text-black rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={uploading || files.length === 0}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {imageUploadError && (
          <p className="text-red-500 text-sm">{imageUploadError}</p>
        )}

        {/* Image Previews */}
        {propertyForm.imageUrls.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {propertyForm.imageUrls.map((url, index) => (
              <div key={url} className="relative aspect-square">
                <img
                  src={url}
                  alt="listing"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, 'property')}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red"
                  disabled={uploading}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="video"
            className={`flex-1 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-airbnb-red'
              }`}
          >
            <span className="text-3xl mb-2">🎥</span>
            <span className="text-gray-600">Upload a property video</span>
            <span className="text-sm text-gray-500">Max 50MB</span>
          </label>
          <button
            type="button"
            onClick={handleVideoUpload}
            className="h-full px-6 bg-airbnb-red  text-black rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={uploading || !videoFile}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {videoUploadError && (
          <p className="text-red-500 text-sm">{videoUploadError}</p>
        )}

        {/* Video Preview */}
        {propertyForm.videoUrl && (
          <div className="relative rounded-lg overflow-hidden">
            <video controls className="w-full">
              <source src={propertyForm.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              type="button"
              onClick={() => setPropertyForm({ ...propertyForm, videoUrl: "" })}
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red"
              disabled={uploading}
            >
              ❌
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Amenities */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          { id: "wifi", label: "WiFi", emoji: "📶" },
          { id: "kitchen", label: "Kitchen", emoji: "🍳" },
          { id: "parking", label: "Parking", emoji: "🅿️" },
          { id: "pool", label: "Pool", emoji: "🏊‍♂️" },
          { id: "tv", label: "TV", emoji: "📺" },
          { id: "bedrooms", label: "Bedrooms", emoji: "🛏️" },
          { id: "bathrooms", label: "Baths", emoji: "🚿" },
          { id: "stove", label: "Stovetop", emoji: "🔥" },
          { id: "storage", label: "Wardrobe", emoji: "👔" },
          { id: "security", label: "Security", emoji: "🔒" },
          { id: "furnished", label: "Furnished", emoji: "🪑" },
          { id: "hot", label: "Hot Shower", emoji: "🚿" },
          { id: "pets", label: "Pets Allowed", emoji: "🐾" },
          { id: "prepaid", label: "Electricity Pripaid", emoji: "⚡" },
          { id: "fridge", label: "Refrigerator", emoji: "❄️" },
          { id: "share", label: "House Share", emoji: "👥" },
          { id: "breakfast", label: "Breakfast", emoji: "🍳" },
          { id: "party", label: "Non-Party", emoji: "🔇" },
        ].map((amenity) => (
          <label
            key={amenity.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${propertyForm[amenity.id] ? "border-airbnb-red bg-red-50" : "border-gray-200"
              }`}
          >
            <input
              type="checkbox"
              id={amenity.id}
              checked={propertyForm[amenity.id]}
              onChange={handlePropertyChange}
              className="hidden"
            />
            <span className="text-xl">{amenity.emoji}</span>
            <span className="font-medium">{amenity.label}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Property Details */}
    {/* Property Details Section */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Property Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Square Meters for Land/Office or Bedrooms for other types */}
        <div className="space-y-2">
          <label htmlFor="bedrooms" className="flex items-center gap-2 text-gray-700 font-medium">
            {propertyForm.type === "land" || propertyForm.type === "office" ? (
              <>
                <span>📏</span>
                Square Meters
              </>
            ) : (
              <>
                <span>🛏️</span>
                Bedrooms
              </>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              id="bedrooms"
              min={propertyForm.type === "land" || propertyForm.type === "" ? 0 : 1}
              max={propertyForm.type === "land" || propertyForm.type === "office" ? 1000000 : 10000}
              required
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
              onChange={handlePropertyChange}
              value={propertyForm.bedrooms}
            />
            {propertyForm.type === "land" || propertyForm.type === "" ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                sqm
              </span>
            ) : null}
          </div>
        </div>

        {/* Hide bathrooms for land/office */}
        {propertyForm.type !== "land" && propertyForm.type !== "" && (
          <div className="space-y-2">
            <label htmlFor="bathrooms" className="flex items-center gap-2 text-gray-700 font-medium">
              <span>🚿</span>
              Bathrooms
            </label>
            <div className="relative">
              <input
                type="number"
                id="bathrooms"
                min="0"
                max="10"
                required
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                onChange={handlePropertyChange}
                value={propertyForm.bathrooms}
              />
            </div>
          </div>
        )}

        {/* Price Field */}
        <div className="space-y-2">
          <label htmlFor="regularPrice" className="flex items-center gap-2 text-gray-700 font-medium">
            <span>💰</span>
            Price
          </label>
          <div className="relative">
            <input
              type="number"
              id="regularPrice"
              min="50"
              max="10000000"
              required
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
              onChange={handlePropertyChange}
              value={propertyForm.regularPrice}
            />
            {propertyForm.type === "rent" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                / month
              </span>
            )}
            {propertyForm.type === "over" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                / night
              </span>
            )}
              {propertyForm.type === "office" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                / per hour
              </span>
            )}
            {(propertyForm.type === "land" || propertyForm.type === "" || propertyForm.type === "sale") && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                total
              </span>
            )}
          </div>
        </div>

        {/* Offer Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="offer"
            checked={propertyForm.offer}
            onChange={handlePropertyChange}
            className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
          />
          <label htmlFor="offer" className="font-medium text-gray-700">
            Offer Discount
          </label>
        </div>

        {/* Discount Price */}
        {propertyForm.offer && (
          <div className="space-y-2">
            <label htmlFor="discountPrice" className="flex items-center gap-2 text-gray-700 font-medium">
              <span>🤑</span>
              Discounted Price
            </label>
            <div className="relative">
              <input
                type="number"
                id="discountPrice"
                min="0"
                max="10000000"
                required
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                onChange={handlePropertyChange}
                value={propertyForm.discountPrice}
              />
              {propertyForm.type === "rent" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  / month
                </span>
              )}
              {propertyForm.type === "over" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  / night
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Submit Section */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <button
        type="submit"
        disabled={loading}
          className="w-full bg-white text-airbnb-red border border-airbnb-red font-semibold rounded-lg hover:bg-gray-100 transition-colors py-4 disabled:opacity-70"
      >
        {loading ? "Creating Listing..." : "Publish Property Listing"}
      </button>
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  </form>
)}

      {/* Service Form */}
      {activeTab === 'experiences' && (
  <form onSubmit={handleServiceSubmit} className="space-y-8">
    {/* Service Type Selection */}
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Service Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: "cleaning", label: "Cleaning", emoji: "🧹" },
          { id: "maintenance", label: "Maintenance", emoji: "🔧" },
          { id: "moving", label: "Moving", emoji: "🚚" },
          { id: "landscaping", label: "Landscaping", emoji: "🌿" },
          { id: "catering", label: "Catering", emoji: "🍽️" },
          { id: "other", label: "Other", emoji: "✨" },
          { id: "daycare", label: "Day Care / Pre-school", emoji: "👶" },
          { id: "schoolTransport", label: "School Transport", emoji: "🚌" }
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setServiceForm({ ...serviceForm, type: type.id })}
            className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
              serviceForm.type === type.id
                ? "border-airbnb-red bg-red-50"
                : "border-gray-200 hover:border-airbnb-red/30"
            }`}
          >
            <span className="text-2xl mb-2">{type.emoji}</span>
            <span className="font-medium text-gray-700">{type.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Service Information */}
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Service Information</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">Service Name</label>
          <input
            type="text"
            id="name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder={
              serviceForm.type === "daycare" 
                ? "Little Explorers Daycare" 
                : serviceForm.type === "schoolTransport" 
                ? "SafeRide School Transport"
                : "Professional Cleaning Service"
            }
            onChange={handleServiceChange}
            value={serviceForm.name}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Service Area</label>
          <input
            type="text"
            id="address"
            className="w-full p-3 border border-gray-200 rounded-lg"
            placeholder="Areas you serve"
            onChange={handleServiceChange}
            value={serviceForm.address}
            required
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">Service Description</label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder={
              serviceForm.type === "daycare" 
                ? "Describe your daycare program, activities, educational approach..." 
                : serviceForm.type === "schoolTransport" 
                ? "Describe your transport service, safety measures, vehicle details..."
                : "Describe your service in detail..."
            }
            onChange={handleServiceChange}
            value={serviceForm.description}
            required
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">Experience & Qualifications</label>
          <textarea
            id="near"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder={
              serviceForm.type === "daycare" 
                ? "Your experience with childcare, relevant certifications, training..." 
                : serviceForm.type === "schoolTransport" 
                ? "Driving experience, safety certifications, background checks..."
                : "Describe your experience and qualifications"
            }
            onChange={handleServiceChange}
            value={serviceForm.near}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Contact Number</label>
          <input
            type="tel"
            id="contact"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Contact Details"
            onChange={handleServiceChange}
            value={serviceForm.contact}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Service Provider Name</label>
          <input
            type="text"
            id="host"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder={
              serviceForm.type === "daycare" 
                ? "Daycare center name" 
                : "Your name or company name"
            }
            onChange={handleServiceChange}
            value={serviceForm.host}
            required
          />
        </div>
        
        {/* Daycare-specific fields */}
        {serviceForm.type === "daycare" && (
          <>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Age Group</label>
              <input
                type="text"
                id="ageGroup"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="e.g., 6 months - 5 years"
                onChange={handleServiceChange}
                value={serviceForm.ageGroup}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">License Number</label>
              <input
                type="text"
                id="licenseNumber"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Your daycare license number"
                onChange={handleServiceChange}
                value={serviceForm.licenseNumber}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Capacity</label>
              <input
                type="text"
                id="capacity"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Number of children you can accommodate"
                onChange={handleServiceChange}
                value={serviceForm.capacity}
              />
            </div>
          </>
        )}
        
        {/* School Transport-specific fields */}
        {serviceForm.type === "schoolTransport" && (
          <>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Vehicle Type</label>
              <input
                type="text"
                id="vehicleType"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="e.g., Minivan, School Bus, SUV"
                onChange={handleServiceChange}
                value={serviceForm.vehicleType}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Route Areas</label>
              <input
                type="text"
                id="routeAreas"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Neighborhoods or schools served"
                onChange={handleServiceChange}
                value={serviceForm.routeAreas}
              />
            </div>
          </>
        )}
      </div>
    </div>

    {/* Media Upload for Services */}
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Add Photos</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="images"
            className="flex-1 p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-airbnb-red transition-colors"
          >
            <span className="text-3xl mb-2">📸</span>
            <span className="text-gray-600">Drag photos or click to upload</span>
            <span className="text-sm text-gray-500">Up to 10 photos</span>
          </label>
          <button
            type="button"
            onClick={() => handleImageSubmit('service')}
            className="h-full px-6 bg-airbnb-red text-black rounded-lg hover:bg-red-700 transition-colors"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {imageUploadError && (
          <p className="text-red-500 text-sm">{imageUploadError}</p>
        )}

        {serviceForm.imageUrls.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {serviceForm.imageUrls.map((url, index) => (
              <div key={url} className="relative aspect-square">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, 'service')}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Service Details */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Service Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="regularPrice" className="flex items-center gap-2 text-gray-700 font-medium">
            <span>💰</span>
            {serviceForm.type === "daycare" ? "Daily Rate" : "Hourly Rate"}
          </label>
          <div className="relative">
            <input
              type="number"
              id="regularPrice"
              min="50"
              max="100000"
              required
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
              onChange={handleServiceChange}
              value={serviceForm.regularPrice}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {serviceForm.type === "daycare" ? "/ month" : "/ day"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="kind" className="flex items-center gap-2 text-gray-700 font-medium">
            <span>👥</span>
            Service Category
          </label>
          <textarea
            type="text"
            id="kind"
            className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder={
              serviceForm.type === "daycare" 
                ? "e.g., Montessori, Play-based, Bilingual" 
                : "e.g., Residential, Commercial"
            }
            onChange={handleServiceChange}
            value={serviceForm.kind}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="period" className="flex items-center gap-2 text-gray-700 font-medium">
            <span>⏰</span>
            Availability
          </label>
          <input
            type="text"
            id="period"
            className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder={
              serviceForm.type === "daycare" 
                ? "e.g., Mon-Fri 7:30am-6:00pm" 
                : "e.g., Weekdays 9am-5pm"
            }
            onChange={handleServiceChange}
            value={serviceForm.period}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cancel" className="flex items-center gap-2 text-gray-700 font-medium">
            <span>🚫</span>
            Cancellation Policy
          </label>
          <input
            type="text"
            id="cancel"
            className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Your cancellation policy"
            onChange={handleServiceChange}
            value={serviceForm.cancel}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <span>🔒</span>
            Background Check
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="security"
              checked={serviceForm.security}
              onChange={handleServiceChange}
              className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
            />
            <label htmlFor="security" className="font-medium text-gray-700">
              Verified background check
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <span>🐾</span>
            {serviceForm.type === "daycare" ? "Special Needs Experience" : "Pet Friendly"}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pets"
              checked={serviceForm.pets}
              onChange={handleServiceChange}
              className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
            />
            <label htmlFor="pets" className="font-medium text-gray-700">
              {serviceForm.type === "daycare" 
                ? "Experience with special needs children" 
                : "Comfortable with pets"}
            </label>
          </div>
        </div>

        {/* Additional checkbox for daycare */}
        {serviceForm.type === "daycare" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <span>🍽️</span>
              Meal Service
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="meals"
                checked={serviceForm.meals}
                onChange={handleServiceChange}
                className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
              />
              <label htmlFor="meals" className="font-medium text-gray-700">
                Provide meals and snacks
              </label>
            </div>
          </div>
        )}

        {/* Additional checkbox for school transport */}
        {serviceForm.type === "schoolTransport" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <span>👶</span>
              Child Seats
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="childSeats"
                checked={serviceForm.childSeats}
                onChange={handleServiceChange}
                className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
              />
              <label htmlFor="childSeats" className="font-medium text-gray-700">
                Provide child safety seats
              </label>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Submit Section */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-airbnb-red border border-airbnb-red font-semibold rounded-lg hover:bg-gray-100 transition-colors py-4 disabled:opacity-70"
      >
        {loading ? "Creating Listing..." : "Publish Service"}
      </button>
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  </form>
)}
      {/* Helper Form */}
     {/* Helper Form */}
  {/* Helper Form */}
 {activeTab === 'online' && (
  <form onSubmit={handleHelperSubmit} className="space-y-8">
    {/* Helper Type Selection - UPDATED WITH BARBER */}
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Helper Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: "domestic", label: " Helper", emoji: "🧹", description: "Cleaning, laundry, household chores" },
          { id: "errand", label: "Errand Runner", emoji: "🏃", description: "Grocery shopping, deliveries, tasks" },
          { id: "tutor", label: "Private Tutor", emoji: "📚", description: "Academic tutoring, skill teaching" },
          { id: "chef", label: "Private Chef", emoji: "👨‍🍳", description: "Meal preparation, cooking classes" },
          { id: "beauty", label: "Beauty Specialist", emoji: "💅", description: "Hair, nails, makeup services" },
          { id: "tattoo", label: "Tattoo Artist", emoji: "🖌️", description: "Tattoo design and application" },
          { id: "barber", label: "Barber", emoji: "✂️", description: "Haircuts, beard trims, grooming at home" },
          { id: "photography", label: "Photographer", emoji: "📷", description: "Portrait, event, product photography" },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setHelperForm({ ...helperForm, type: type.id })}
            className={`p-4 border-2 rounded-xl flex flex-col items-center text-center transition-all ${helperForm.type === type.id
                ? "border-airbnb-red bg-red-50"
                : "border-gray-200 hover:border-airbnb-red/30"
              }`}
          >
            <span className="text-2xl mb-2">{type.emoji}</span>
            <span className="font-medium text-gray-700">{type.label}</span>
            <span className="text-xs text-gray-500 mt-1">{type.description}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Helper Information - UPDATED FOR BARBER & PHOTOGRAPHY */}
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Helper Information</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">
            {helperForm.type === "tutor" ? "Tutor Name" : 
             helperForm.type === "barber" ? "Barber Name" :
             helperForm.type === "photography" ? "Photographer Name" : "Helper Name"}
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder={
              helperForm.type === "tutor" ? "John Smith" : 
              helperForm.type === "barber" ? "Your professional name" :
              helperForm.type === "photography" ? "Your photography business name" : "Helper Name"
            }
            onChange={handleHelperChange}
            value={helperForm.name}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Service Area</label>
          <input
            type="text"
            id="address"
            className="w-full p-3 border border-gray-200 rounded-lg"
            placeholder="Areas you serve"
            onChange={handleHelperChange}
            value={helperForm.address}
            required
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">
            {helperForm.type === "tutor"
              ? "Qualifications & Teaching Approach"
              : helperForm.type === "barber" 
                ? "Barber Experience & Specialties"
                : helperForm.type === "photography"
                  ? "Photography Style & Experience"
                  : "Service Description"}
          </label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder={
              helperForm.type === "domestic" ? "Describe your cleaning methods and experience..." :
              helperForm.type === "errand" ? "Describe the types of errands you can run..." :
              helperForm.type === "barber" ? "Describe your barber experience, specialties, and approach..." :
              helperForm.type === "photography" ? "Describe your photography style, experience, and approach..." :
              "Describe your teaching qualifications and methods..."
            }
            onChange={handleHelperChange}
            value={helperForm.description}
            required
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="font-medium text-gray-700">
            {helperForm.type === "tutor"
              ? "Subjects/Skills You Teach"
              : helperForm.type === "barber"
                ? "Services Offered"
                : helperForm.type === "photography"
                  ? "Photography Services Offered"
                  : "Specific Services Offered"}
          </label>
          <textarea
            id="near"
            className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
            placeholder={
              helperForm.type === "domestic" ? "E.g., Deep cleaning, laundry, ironing" :
              helperForm.type === "errand" ? "E.g., Grocery shopping, pharmacy runs" :
              helperForm.type === "barber" ? "E.g., Men's haircuts, beard trims, straight razor shaves, kids cuts" :
              helperForm.type === "photography" ? "E.g., Portrait sessions, event photography, product photography, headshots" :
              "E.g., Mathematics, English, Science"
            }
            onChange={handleHelperChange}
            value={helperForm.near}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Contact Number</label>
          <input
            type="tel"
            id="contact"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder="Phone number"
            onChange={handleHelperChange}
            value={helperForm.contact}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">
            {helperForm.type === "tutor" ? "Years of Experience" : 
             helperForm.type === "barber" ? "Barber Experience" :
             helperForm.type === "photography" ? "Photography Experience" : "Experience"}
          </label>
          <input
            type="text"
            id="host"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
            placeholder={
              helperForm.type === "tutor" ? "5 years teaching experience" :
              helperForm.type === "barber" ? "3 years as professional barber" :
              helperForm.type === "photography" ? "4 years professional photography" :
              "3 years as domestic helper"
            }
            onChange={handleHelperChange}
            value={helperForm.host}
            required
          />
        </div>

        {helperForm.type === "tutor" && (
          <>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Education Level</label>
              <input
                type="text"
                id="kind"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Bachelor's Degree in Education"
                onChange={handleHelperChange}
                value={helperForm.kind}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Age Group</label>
              <input
                type="text"
                id="period"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Primary school, High school"
                onChange={handleHelperChange}
                value={helperForm.period}
              />
            </div>
          </>
        )}

        {(helperForm.type !== "tutor" && helperForm.type !== "barber" && helperForm.type !== "photography") && (
          <>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Availability</label>
              <input
                type="text"
                id="period"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Weekdays 8am-5pm"
                onChange={handleHelperChange}
                value={helperForm.period}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Languages Spoken</label>
              <input
                type="text"
                id="cancel"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., English, Afrikaans"
                onChange={handleHelperChange}
                value={helperForm.cancel}
              />
            </div>
          </>
        )}

        {/* Barber-specific fields */}
        {helperForm.type === "barber" && (
          <>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Specializations</label>
              <input
                type="text"
                id="specializations"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Fades, classic cuts, beard designs"
                onChange={handleHelperChange}
                value={helperForm.specializations}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Equipment</label>
              <input
                type="text"
                id="equipment"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Bring own tools, sanitized equipment"
                onChange={handleHelperChange}
                value={helperForm.equipment}
              />
            </div>
          </>
        )}

        {/* Photography-specific fields */}
        {helperForm.type === "photography" && (
          <>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Photography Style</label>
              <input
                type="text"
                id="style"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Portrait, candid, studio, outdoor"
                onChange={handleHelperChange}
                value={helperForm.style}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-700">Equipment</label>
              <input
                type="text"
                id="equipment"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="E.g., Professional DSLR, lighting, backup equipment"
                onChange={handleHelperChange}
                value={helperForm.equipment}
              />
            </div>
          </>
        )}
      </div>
    </div>

    {/* Media Upload - UPDATED FOR BARBER & PHOTOGRAPHY */}
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">
        {helperForm.type === "tutor"
          ? "Add Photos (Certificates, Teaching Materials)"
          : helperForm.type === "barber"
            ? "Add Photos of Your Work (Haircuts, Styles)"
            : helperForm.type === "photography"
              ? "Add Your Photography Portfolio"
              : "Add Photos of Your Work"}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="images"
            className="flex-1 p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-airbnb-red transition-colors"
          >
            <span className="text-3xl mb-2">📸</span>
            <span className="text-gray-600">Drag photos or click to upload</span>
            <span className="text-sm text-gray-500">Up to 10 photos</span>
          </label>
          <button
            type="button"
            onClick={() => handleImageSubmit('helper')}
            className="h-full px-6 bg-airbnb-red text-black rounded-lg hover:bg-red-700 transition-colors"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {imageUploadError && (
          <p className="text-red-500 text-sm">{imageUploadError}</p>
        )}

        {/* Image Previews */}
        {helperForm.imageUrls.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {helperForm.imageUrls.map((url, index) => (
              <div key={url} className="relative aspect-square">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, 'helper')}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Pricing & Details - UPDATED FOR BARBER & PHOTOGRAPHY */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Pricing & Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="regularPrice" className="flex items-center gap-2 text-gray-700 font-medium">
            <span>💰</span>
            {helperForm.type === "tutor"
              ? "Hourly Rate"
              : helperForm.type === "barber"
                ? "Service Rates"
                : helperForm.type === "photography"
                  ? "Session Rates"
                  : "Service Rate"}
          </label>
          <div className="relative">
            <input
              type="number"
              id="regularPrice"
              min="50"
              max="100000"
              required
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
              onChange={handleHelperChange}
              value={helperForm.regularPrice}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              / {helperForm.type === "tutor" ? "hour" : 
                 helperForm.type === "photography" ? "session" : "service"}
            </span>
          </div>
          
          {/* Additional pricing field for Barber */}
          {helperForm.type === "barber" && (
            <div className="mt-4">
              <label htmlFor="additionalPricing" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Services Pricing (Optional)
              </label>
              <textarea
                id="additionalPricing"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                placeholder="E.g., Beard trim: R80, Kids cut: R100, Haircut + Beard: R200"
                onChange={handleHelperChange}
                value={helperForm.additionalPricing}
              />
            </div>
          )}

          {/* Additional pricing field for Photography */}
          {helperForm.type === "photography" && (
            <div className="mt-4">
              <label htmlFor="additionalPricing" className="block text-sm font-medium text-gray-700 mb-1">
                Package Pricing (Optional)
              </label>
              <textarea
                id="additionalPricing"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                placeholder="E.g., 1-hour portrait: R500, 2-hour event: R1000, Full wedding: R5000"
                onChange={handleHelperChange}
                value={helperForm.additionalPricing}
              />
            </div>
          )}
        </div>

        {helperForm.type === "tutor" && (
          <div className="space-y-2">
            <label htmlFor="bathrooms" className="flex items-center gap-2 text-gray-700 font-medium">
              <span>👥</span>
              Teaching Format
            </label>
            <select
              id="bathrooms"
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
              onChange={(e) => setHelperForm({ ...helperForm, bathrooms: e.target.value })}
              value={helperForm.bathrooms}
            >
              <option value="1">In-person</option>
              <option value="2">Online</option>
              <option value="3">Both</option>
            </select>
          </div>
        )}

        {helperForm.type === "domestic" && (
          <div className="space-y-2">
            <label htmlFor="bedrooms" className="flex items-center gap-2 text-gray-700 font-medium">
              <span>⏰</span>
              Minimum Hours
            </label>
            <div className="relative">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="24"
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                onChange={handleHelperChange}
                value={helperForm.bedrooms}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                hours
              </span>
            </div>
          </div>
        )}

        {/* Barber-specific details */}
        {helperForm.type === "barber" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="travelFee" className="flex items-center gap-2 text-gray-700 font-medium">
                <span>🚗</span>
                Travel Fee
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="travelFee"
                  min="0"
                  max="500"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-lg"
                  placeholder="Optional"
                  onChange={handleHelperChange}
                  value={helperForm.travelFee}
                />
                <span className="absolute right-3 top-1/2 -translate-Y-1/2 text-gray-500">R</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <span>📅</span>
                Booking Notice
              </label>
              <select
                id="bookingNotice"
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg"
                onChange={handleHelperChange}
                value={helperForm.bookingNotice}
              >
                <option value="">Select notice period</option>
                <option value="1">Same day</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>
          </div>
        )}

        {/* Photography-specific details */}
        {helperForm.type === "photography" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sessionDuration" className="flex items-center gap-2 text-gray-700 font-medium">
                <span>⏱️</span>
                Session Duration
              </label>
              <select
                id="sessionDuration"
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg"
                onChange={handleHelperChange}
                value={helperForm.sessionDuration}
              >
                <option value="">Select duration</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <span>🖼️</span>
                Photo Delivery
              </label>
              <input
                type="text"
                id="photoDelivery"
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg"
                placeholder="E.g., 5-7 days, digital download"
                onChange={handleHelperChange}
                value={helperForm.photoDelivery}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <span>🔒</span>
            Background Check
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="security"
              checked={helperForm.security}
              onChange={handleHelperChange}
              className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
            />
            <label htmlFor="security" className="font-medium text-gray-700">
              Verified background check
            </label>
          </div>
        </div>

        {helperForm.type !== "tutor" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <span>🐾</span>
              Pet Friendly
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pets"
                checked={helperForm.pets}
                onChange={handleHelperChange}
                className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
              />
              <label htmlFor="pets" className="font-medium text-gray-700">
                Comfortable with pets
              </label>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Submit Section */}
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-airbnb-red border border-airbnb-red font-semibold rounded-lg hover:bg-gray-100 transition-colors py-4 disabled:opacity-70"
      >
        {loading ? "Creating Listing..." : "Publish Helper Profile"}
      </button>
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  </form>
)}



      {/* Event Form */}
      {activeTab === 'events' && (
        <form onSubmit={handleEventSubmit} className="space-y-8">
          {/* Event Type Selection */}
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Event Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { id: "music", label: "Music", emoji: "🎵" },
                { id: "sports", label: "Sports", emoji: "⚽" },
                { id: "art", label: "Art & Culture", emoji: "🎨" },
                { id: "community", label: "Community", emoji: "🧑‍🤝‍🧑" },
                { id: "food", label: "Food & Drink", emoji: "🍔" },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEventForm({ ...eventForm, type: type.id })}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${eventForm.type === type.id
                      ? "border-airbnb-red bg-red-50"
                      : "border-gray-200 hover:border-airbnb-red/50"
                    }`}
                >
                  <span className="text-2xl mb-2">{type.emoji}</span>
                  <span className="font-medium text-gray-700">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Event Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Event Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="font-medium text-gray-700">Event Title</label>
                <input type="text" id="name" className="w-full p-3 border border-gray-200 rounded-lg" placeholder="e.g., Summer Music Festival" onChange={handleEventChange} value={eventForm.name} required />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-medium text-gray-700">Event Description</label>
                <textarea id="description" className="w-full p-3 border border-gray-200 rounded-lg h-32" placeholder="Describe the event..." onChange={handleEventChange} value={eventForm.description} required />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">Venue / Location</label>
                <input type="text" id="address" className="w-full p-3 border border-gray-200 rounded-lg" placeholder="Enter the full address" onChange={handleEventChange} value={eventForm.address} required />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">Organizer Name</label>
                <input type="text" id="host" className="w-full p-3 border border-gray-200 rounded-lg" placeholder="Your name or organization" onChange={handleEventChange} value={eventForm.host} />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">Event Date</label>
                <input type="date" id="date" className="w-full p-3 border border-gray-200 rounded-lg" onChange={handleEventChange} value={eventForm.date} required />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">Event Time</label>
                <input type="time" id="time" className="w-full p-3 border border-gray-200 rounded-lg" onChange={handleEventChange} value={eventForm.time} required />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">Organizer Contact</label>
                <input type="tel" id="contact" className="w-full p-3 border border-gray-200 rounded-lg" placeholder="Contact phone or email" onChange={handleEventChange} value={eventForm.contact} />
              </div>
            </div>
          </div>

          {/* Media Upload for Events */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Add Event Photos & Video</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input type="file" id="images" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                <label htmlFor="images" className="flex-1 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors border-gray-300 hover:border-airbnb-red">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-gray-600">Upload event photos/posters</span>
                </label>
                <button type="button" onClick={() => handleImageSubmit('event')} className="h-full px-6 bg-airbnb-red text-black rounded-lg hover:bg-red-700" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {imageUploadError && <p className="text-red-500 text-sm">{imageUploadError}</p>}
              {eventForm.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {eventForm.imageUrls.map((url, index) => (
                    <div key={url} className="relative aspect-square">
                      <img src={url} alt="event listing" className="w-full h-full object-cover rounded-lg" />
                      <button type="button" onClick={() => handleRemoveImage(index, 'event')} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red">❌</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Event Details and Pricing */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Event Details & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="regularPrice" className="flex items-center gap-2 text-gray-700 font-medium"><span>🎫</span> Ticket Price</label>
                <div className="relative">
                  <input type="number" id="regularPrice" min="0" required className="w-full p-3 pl-10 border border-gray-200 rounded-lg" onChange={handleEventChange} value={eventForm.regularPrice} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">R (0 for free)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: "parking", label: "Parking Available", emoji: "🅿️" },
                { id: "foodAvailable", label: "Food & Drinks", emoji: "🍔" },
                { id: "familyFriendly", label: "Family Friendly", emoji: "👨‍👩‍👧‍👦" },
              ].map((amenity) => (
                <label key={amenity.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${eventForm[amenity.id] ? "border-airbnb-red bg-red-50" : "border-gray-200"}`}>
                  <input type="checkbox" id={amenity.id} checked={eventForm[amenity.id]} onChange={handleEventChange} className="hidden" />
                  <span className="text-xl">{amenity.emoji}</span>
                  <span className="font-medium">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <button type="submit" disabled={loading} 
              className="w-full bg-white text-airbnb-red border border-airbnb-red font-semibold rounded-lg hover:bg-gray-100 transition-colors py-4 disabled:opacity-70">
              {loading ? "Publishing Event..." : "Publish Event"}
            </button>
            {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
          </div>
        </form>
      )}


      {/* Important Message */}
      <div className="mt-6 p-4 border bg-white rounded-lg">
        <h2 className="text-slate-700 text-center font-semibold mb-4">
          Important Message
        </h2>
        <p className="text-xs sm:text-sm text-center text-slate-700">
          If your post does not go through, we recommend logging out of your
          account and then logging back in. This will help refresh your session
          and resolve any potential errors you may encounter.
        </p>
      </div>

      {/* Promotion Popup */}
      {showPromotionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden">
            {promotionSteps === 0 ? (
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-airbnb-red mb-4">Congratulations! 🎉</h3>
                <p className="text-gray-600 mb-6">Boost your listings visibility with a promotion package.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-6 py-2 bg-airbnb-red text-white rounded-full hover:bg-red-700"
                  >
                    Promote Now
                  </button>
                  <button
                    onClick={() => window.location.href = `/listing/${newListingId}`}
                    className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : promotionSteps === 1 ? (
              <div className="p-6">
                <h3 className="text-xl font-bold text-airbnb-red mb-6">Choose Package</h3>
                <div className="space-y-4 mb-6">
                  <div
                    onClick={() => setPromotionPackage('standard')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${promotionPackage === 'standard' ? 'border-airbnb-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Standard</h4>
                        <p className="text-sm text-gray-600">25x Click move to normal post</p>
                      </div>
                      <span className="text-airbnb-red font-bold">R40</span>
                    </div>
                  </div>
                  <div
                    onClick={() => setPromotionPackage('premium')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${promotionPackage === 'premium' ? 'border-airbnb-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Premium</h4>
                        <p className="text-sm text-gray-600">80x Click move to normal post</p>
                      </div>
                      <span className="text-airbnb-red font-bold">R100</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setPromotionSteps(0)}
                    className="px-4 py-2 text-gray-600 hover:text-airbnb-red transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setPromotionSteps(2)}
                    disabled={!promotionPackage}
                    className={`px-6 py-2 rounded-full transition-colors ${promotionPackage
                        ? 'bg-airbnb-red text-white hover:bg-red-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-airbnb-red mb-6">Payment Method</h2>

                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="flex justify-between mb-1">
                    <span>Package:</span>
                    <span className="capitalize">{promotionPackage}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-airbnb-red">
                      R{promotionPackage === 'standard' ? 40 : 100}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    {
                      id: 'card',
                      name: 'Credit/Debit Card',
                      description: 'Pay with Visa, Mastercard, etc.',
                      emoji: '💳'
                    },
                    {
                      id: 'paypal',
                      name: 'PayPal',
                      description: 'Pay with your PayPal account',
                      emoji: '📱'
                    },
                    {
                      id: 'bank',
                      name: 'Bank Transfer',
                      description: 'Direct bank transfer',
                      emoji: '🏦'
                    }
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handlePaymentSelection(method.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedPaymentMethod === method.id
                          ? 'border-airbnb-red bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.emoji}</span>
                        <div>
                          <h4 className="font-semibold">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Card Details Form */}
                  {selectedPaymentMethod === 'card' && (
                    <div className="mt-4 space-y-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => setPromotionSteps(1)}
                    className="px-4 py-2 text-gray-600 hover:text-airbnb-red transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePromoteListing}
                    disabled={selectedPaymentMethod === 'card' && !cardDetailsValid()}
                    className={`px-6 py-2 rounded-full transition-colors ${(selectedPaymentMethod !== 'card' || cardDetailsValid())
                        ? 'bg-airbnb-red text-white hover:bg-red-700'
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