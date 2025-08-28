import { useState, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaVideo, FaTimes, FaParking, FaSwimmingPool, FaUsers, FaWifi, FaTv, FaUtensils, FaBed, FaBath, FaShower, FaDog, FaCookie, FaBackspace, FaShieldAlt, FaChair, FaBolt, FaBoxes, FaRulerCombined, FaPercent, FaTag, FaCoffee, FaMusic } from "react-icons/fa";
import { FaCreditCard, FaPaypal, FaUniversity, FaSpinner } from 'react-icons/fa';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Form State
  const [files, setFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [formData, setFormData] = useState({
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

  // Promotion State
  const [showPromotionPopup, setShowPromotionPopup] = useState(false);
  const [promotionPackage, setPromotionPackage] = useState('');
  const [promotionSteps, setPromotionSteps] = useState(0);
  const [newListingId, setNewListingId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  
  // Payment State
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
 
  const [showCardForm, setShowCardForm] = useState(false);

  // Error and Loading State
  const [imageUploadError, setImageUploadError] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postLimitReached, setPostLimitReached] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);

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
          const res = await fetch(`/api/user/${currentUser._id}/post-count`);
          
          if (!res.ok) {
            if (res.status === 404) {
              setPostLimitReached(false);
              setPaymentRequired(false);
              return;
            }
            throw new Error(`Error: ${res.status}`);
          }
          
          const data = await res.json();
          
          if (data.count >= 3) {
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

  // Image and video upload functions
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
        }
      );
    });
  };

  const storeVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
        }
      );
    });
  };

  const handleVideoUpload = async () => {
    try {
      if (videoFile) {
        if (videoFile.size > 50 * 1024 * 1024) {
          throw new Error("Video file too large (max 50MB)");
        }
        
        setUploading(true);
        const url = await storeVideo(videoFile);
        setFormData({ ...formData, videoUrl: url });
        setVideoUploadError(null);
        setUploading(false);
      }
    } catch (err) {
      setVideoUploadError(err.message);
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleImageSubmit = async () => {
    try {
      if (files.length > 0 && files.length + formData.imageUrls.length < 10) {
        setUploading(true);
        setImageUploadError(null);
        
        const promises = [];
        for (let i = 0; i < files.length; i++) {
          promises.push(storeImage(files[i]));
        }

        const urls = await Promise.all(promises);
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
        setImageUploadError(null);
        setUploading(false);
      } else {
        setImageUploadError("You can only upload up to 10 images per listing");
        setUploading(false);
      }
    } catch (err) {
      setImageUploadError("Image upload failed (2MB max per image)");
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    if (id === "sale" || id === "rent" || id === "over" || id === "office" || id === "land") {
      return setFormData({ ...formData, type: id });
    }

    if (type === "checkbox") {
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) return setError("You must upload at least one image");
    if (+formData.regularPrice < +formData.discountPrice) return setError("Discount price must be lower than regular price");
    
    setLoading(true);
    setError(null);
  
    try {
      const listingId = new Date().getTime().toString(36) + Math.random().toString(36).substr(2, 5);
  
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          userRef: currentUser._id,
          _id: listingId,
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
    if (method === 'card') {
      setShowCardForm(true);
    } else {
      setShowCardForm(false);
    }
  };

  const cardDetailsValid = () => {
    // Basic validation
    const cardNumberValid = /^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''));
    const expiryValid = /^\d{2}\/\d{2}$/.test(cardDetails.expiry);
    const cvvValid = /^\d{3,4}$/.test(cardDetails.cvv);
    const nameValid = cardDetails.name.trim().length > 0;
    
    return cardNumberValid && expiryValid && cvvValid && nameValid;
  };

  // Loading state UI
  if (loading && !showPromotionPopup) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold my-7">Create New Listing</h1>
          <div className="flex justify-center py-10">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
          <p className="text-gray-500">Loading listing form...</p>
        </div>
      </div>
    );
  }

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
          {loading ? <FaSpinner className="animate-spin" /> : "Pay R35 to Create More Listings"}
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
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">



          
          {/* Heading */}
        <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-popout max-w-md mx-auto border border-gray-100">
  <h1 className="text-3xl font-bold text-airbnb-red tracking-tight">Create Your Listing</h1>
  <p className="text-gray-500 text-lg font-light">Open your door to unforgettable stays</p>
  
  {/* Optional decorative element */}
  <div className="pt-4">
    <div className="h-1 w-16 bg-airbnb-red rounded-full mx-auto opacity-20"></div>
  </div>
</div>    
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Property Type */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Property Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { id: "rent", label: "Room/Home Rent", emoji: "🏠" },
                  { id: "over", label: "Guest House", emoji: "🛌" },
                  { id: "office", label: "Office", emoji: "🏢" },
                  { id: "land", label: "Land", emoji: "🌳" },
                  { id: "sale", label: "For Sale", emoji: "💰" },
                  
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                      formData.type === type.id
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

            {/* Section 2: Basic Information */}
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
                    onChange={handleChange}
                    value={formData.name}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    id="address"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    placeholder="Enter full address"
                    onChange={handleChange}
                    value={formData.address}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
                    placeholder="Describe your property..."
                    onChange={handleChange}
                    value={formData.description}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-medium text-gray-700">Mention nearby points of interest</label>
                  <textarea
                    id="near"
                    className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
                    placeholder="Mention nearby points of interest"
                    onChange={handleChange}
                    value={formData.near}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-medium text-gray-700">Enter any rules or regulations for the property</label>
                  <textarea
                    id="rules"
                    className="w-full p-3 border border-gray-200 rounded-lg h-32 whitespace-pre-wrap"
                    placeholder="Enter any rules or regulations for the property"
                    onChange={handleChange}
                    value={formData.rules}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Contact Details</label>
                  <input
                    type="number"
                    id="contact"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Contact Details"
                    onChange={handleChange}
                    value={formData.contact}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Name of Host/Seller</label>
                  <input
                    type="text"
                    id="host"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Contact Details"
                    onChange={handleChange}
                    value={formData.host}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Type (e.g., House or Room)</label>
                  <input
                    type="text"
                    id="kind"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Type (e.g., House or Room)"
                    onChange={handleChange}
                    value={formData.kind}
                  />
                </div>
               
                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Available from which date</label>
                  <input
                    type="text"
                    id="period"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Available from which date"
                    onChange={handleChange}
                    value={formData.period}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Cancellation Policy</label>
                  <input
                    type="text"
                    id="cancel"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Cancellation Policy"
                    onChange={handleChange}
                    value={formData.cancel}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Media Upload */}
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
                    onChange={(e) => setFiles(e.target.files)}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex-1 p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-airbnb-red transition-colors"
                  >
                    <FaCamera className="text-3xl text-gray-400 mb-2" />
                    <span className="text-gray-600">Drag photos or click to upload</span>
                    <span className="text-sm text-gray-500">Up to 10 photos</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleImageSubmit}
                    className="h-full px-6 bg-airbnb-red text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>

                {/* Image Previews */}
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red"
                        >
                          <FaTimes />
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
                  />
                  <label
                    htmlFor="video"
                    className="flex-1 p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-airbnb-red transition-colors"
                  >
                    <FaVideo className="text-3xl text-gray-400 mb-2" />
                    <span className="text-gray-600">Upload a property video</span>
                    <span className="text-sm text-gray-500">Max 50MB</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleVideoUpload}
                    className="h-full px-6 bg-airbnb-red text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>

                {/* Video Preview */}
                {formData.videoUrl && (
                  <div className="relative rounded-lg overflow-hidden">
                    <video controls className="w-full">
                      <source src={formData.videoUrl} type="video/mp4" />
                    </video>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrl: "" })}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:text-airbnb-red"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Amenities */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { id: "wifi", label: "WiFi", icon: <FaWifi className="text-xl" /> },
                  { id: "kitchen", label: "Kitchen", icon: <FaUtensils className="text-xl" /> },
                  { id: "parking", label: "Parking", icon: <FaParking className="text-xl" /> },
                  { id: "pool", label: "Pool", icon: <FaSwimmingPool className="text-xl" /> },
                  { id: "tv", label: "TV", icon: <FaTv className="text-xl" /> },
                  { id: "bedrooms", label: "Bedrooms", icon: <FaBed className="text-xl" /> },
                  { id: "bathrooms", label: "Baths", icon: <FaBath className="text-xl" /> },
                  { id: "stove", label: "Stovetop", icon: <FaCookie className="text-xl" /> },
                  { id: "storage", label: "Wardrobe", icon: <FaBackspace className="text-xl" /> },
                  { id: "security", label: "Security", icon: <FaShieldAlt className="text-xl" /> },
                  { id: "furnished", label: "Furnished", icon: <FaChair className="text-xl" /> },
                  { id: "hot", label: "Hot Shower", icon: <FaShower className="text-xl" /> },
                  { id: "pets", label: "Pets Allowed", icon: <FaDog className="text-xl" /> },
                  { id: "prepaid", label: "Electricity Pripaid", icon: <FaBolt className="text-xl" /> },
                  { id: "fridge", label: "Refrigerator", icon: <FaBoxes className="text-xl" /> },
                  { id: "share", label: "House Share", icon: <FaUsers className="text-xl" /> },
                  { id: "breakfast", label: "Breakfast", icon: <FaCoffee className="text-xl" /> },
                  { id: "party", label: "Non-Party", icon: <FaMusic className="text-xl" /> },
                ].map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                      formData[amenity.id] ? "border-airbnb-red bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={amenity.id}
                      checked={formData[amenity.id]}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {amenity.icon}
                    <span className="font-medium">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    id: "bedrooms",
                    label: formData.type === "office" || formData.type === "land" ? "Square Meters" : "Bedrooms",
                    type: "number",
                    min: formData.type === "land" ? 0 : 1,
                    max: formData.type === "land" ? 1000000 : 10000,
                    value: formData.bedrooms,
                    icon: formData.type === "land" ? <FaRulerCombined className="text-airbnb-red" /> : <FaBed className="text-airbnb-red" />,
                  },
                  ...(formData.type !== "land"
                    ? [
                        {
                          id: "bathrooms",
                          label: formData.type === "office" ? "Toilets" : "Bathrooms",
                          type: "number",
                          min: 0,
                          max: 10,
                          value: formData.bathrooms,
                          icon: <FaBath className="text-airbnb-red" />,
                        },
                      ]
                    : []),
                  {
                    id: "regularPrice",
                    label: "Price",
                    type: "number",
                    min: 50,
                    max: 10000000,
                    value: formData.regularPrice,
                    icon: <FaTag className="text-airbnb-red" />,
                    additionalInfo: 
                      formData.type === "rent" ? "/ month" :
                      formData.type === "over" ? "/ night" :
                      formData.type === "office" ? "/ month" : "",
                  },
                ].map((input) => (
                  <div key={input.id} className="space-y-2">
                    <label htmlFor={input.id} className="flex items-center gap-2 text-gray-700 font-medium">
                      {input.icon}
                      {input.label}
                    </label>
                    <div className="relative">
                      <input
                        type={input.type}
                        id={input.id}
                        min={input.min}
                        max={input.max}
                        required
                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                        onChange={handleChange}
                        value={input.value}
                      />
                      {input.additionalInfo && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {input.additionalInfo}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Discount Price */}
                {formData.offer && (
                  <div className="space-y-2">
                    <label htmlFor="offer" className="font-medium text-gray-700">
                      Offer Discount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="discountPrice"
                        min="0"
                        max="10000000"
                        required
                       className="h-5 w-5 text-airbnb-red rounded focus:ring-airbnb-red"
                        onChange={handleChange}
                        value={formData.discountPrice}
                      />
                      {formData.type === "rent" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          / month
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
                className="w-full bg-airbnb-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors py-4"
              >
                {loading ? "Creating Listing..." : "Publish Listing"}
              </button>
              {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
            </div>
          </form>
  
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
                      onClick={() => navigate(`/listing/${newListingId}`)} 
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
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        promotionPackage === 'standard' ? 'border-airbnb-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        promotionPackage === 'premium' ? 'border-airbnb-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                      className={`px-6 py-2 rounded-full transition-colors ${
                        promotionPackage 
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
                        icon: <FaCreditCard className="text-xl text-airbnb-red" />
                      },
                      {
                        id: 'paypal',
                        name: 'PayPal',
                        description: 'Pay with your PayPal account',
                        icon: <FaPaypal className="text-xl text-blue-500" />
                      },
                      {
                        id: 'bank',
                        name: 'Bank Transfer',
                        description: 'Direct bank transfer',
                        icon: <FaUniversity className="text-xl text-green-600" />
                      }
                    ].map((method) => (
                      <div 
                        key={method.id}
                        onClick={() => handlePaymentSelection(method.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id 
                            ? 'border-airbnb-red bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {method.icon}
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
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
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
                              onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
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
                            onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
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
                      className={`px-6 py-2 rounded-full transition-colors ${
                        (selectedPaymentMethod !== 'card' || cardDetailsValid()) 
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
    </div>
  );
}