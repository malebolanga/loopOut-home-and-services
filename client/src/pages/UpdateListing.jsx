/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCamera, FaVideo, FaTimes, FaParking, FaSwimmingPool,FaUsers,FaWifi, FaTv, FaUtensils, FaBed, FaBath, FaShower, FaDog, FaCookie, FaBackspace, FaShieldAlt, FaChair, FaBolt, FaBoxes,  FaRulerCombined, FaPercent, FaTag} from "react-icons/fa";
import { ClockIcon } from '@heroicons/react/24/outline';

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null); // State for video file
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    videoUrl: "", // Add videoUrl to formData
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
    numberOfGuests: 1,
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
    operatingHours: {
      monday: { open: '08:00', close: '19:00', closed: false },
      tuesday: { open: '08:00', close: '19:00', closed: false },
      wednesday: { open: '08:00', close: '19:00', closed: false },
      thursday: { open: '08:00', close: '19:00', closed: false },
      friday: { open: '08:00', close: '19:00', closed: false },
      saturday: { open: '08:00', close: '19:00', closed: false },
      sunday: { open: '08:00', close: '19:00', closed: true }
    },
  });

  // eslint-disable-next-line no-unused-vars
  const [imageUploadError, setImageUploadError] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [videoUploadError, setVideoUploadError] = useState(false); 
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };

    fetchListing();
  }, []);


    // Store video
    const storeVideo = async (file) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Video upload is ${progress}% done`);
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

  // Handle video upload
  const handleVideoUpload = async () => {
    if (videoFile) {
      // Validate video file size (max 50 MB)
      if (videoFile.size > 50 * 1024 * 1024) {
        setVideoUploadError("Video file size must be less than 50 MB.");
        return;
      }
  
      setUploading(true);
      setVideoUploadError(false);
      try {
        const url = await storeVideo(videoFile);
        setFormData({ ...formData, videoUrl: url });
        setUploading(false);
      } catch (error) {
        setVideoUploadError("Video upload failed. Please try again.");
        setUploading(false);
      }
    } else {
      setVideoUploadError("Please select a video file.");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 10) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError(err?.message || 'Image upload failed. Please check the file and try again.');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can upload up to 10 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };


  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent' || e.target.id === 'over' || e.target.id === 'office' || e.target.id === 'land' ) {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'pool' ||
      e.target.id === 'furnished' ||
      e.target.id === 'wifi' ||
      e.target.id === 'kitchen' ||
      e.target.id === 'stove' ||
      e.target.id === 'tv' ||
      e.target.id === 'storage' ||
      e.target.id === 'security' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer' ||
      e.target.id === 'hot' ||
      e.target.id === 'pets' ||
      e.target.id === 'prepaid' ||
      e.target.id === 'fridge' ||
      e.target.id === 'share' 
      
     
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };


      // Store video
   
  
  
     // Handle video upload
 
     const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (formData.imageUrls.length < 1)
          return setError('You must upload at least one image');
        if (+formData.regularPrice < +formData.discountPrice)
          return setError('Discount price must be lower than regular price');
        
        setLoading(true);
        setError(false);
        
        const res = await fetch(`/api/listing/update/${params.listingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            ...formData,
            userRef: currentUser._id,
          }),
        });
    
        const data = await res.json();
        setLoading(false);
        
        if (!res.ok) {
          setError(data.message || 'Update failed');
          return;
        }
        
        navigate(`/listing/${data._id}`);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };


    
  return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="max-w-4xl mx-auto">
       <div className="space-y-8">
           {/* Heading */}
           <div className="text-center space-y-2">
               <h1 className="text-3xl font-bold text-airbnb-red">Create New Listing</h1>
               <p className="text-gray-600 dark:text-white">Share your space with travelers from around the world</p>
             </div>
     
           {/* Form */}
           {/* Main Form */}
           <form onSubmit={handleSubmit} className="space-y-8">
               {/* Section 1: Property Type */}
               <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
                 <h2 className="text-xl font-semibold mb-6">Property Type</h2>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { id: "rent", label: "Room / Home Rent", emoji: "🏠" },
                      { id: "over", label: "Guest House / B&B", emoji: "🛌" },
                      { id: "hotel", label: "Hotel / Lodge", emoji: "🏨" },
                      { id: "land", label: "Self Catering", emoji: "🍳" },
                      { id: "resort", label: "Resort & Holiday Park", emoji: "🏖️" },
                      { id: "office", label: "Room Per Hour", emoji: "🚪" },
                    ].map((type) => (
                     <button
                       key={type.id}
                       type="button"
                       onClick={() => setFormData({ ...formData, type: type.id })}
                       className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                         formData.type === type.id
                           ? "border-airbnb-red bg-red-50"
                           : "border-gray-200 dark:border-gray-800 hover:border-airbnb-red/50"
                       }`}
                     >
                       <span className="text-2xl mb-2">{type.emoji}</span>
                       <span className="font-medium text-gray-700 dark:text-white">{type.label}</span>
                     </button>
                   ))}
                 </div>
               </div>
   
               {/* Section 2: Basic Information */}
               <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm space-y-6">
                 <h2 className="text-xl font-semibold">Basic Information</h2>
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Property Name</label>
                     <input
                       type="text"
                       id="name"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                       placeholder="Cozy Mountain Cabin"
                       onChange={handleChange}
                       value={formData.name}
                     />
                   </div>
   
                   <div className="space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Address</label>
                     <input
                       type="text"
                       id="address"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg"
                       placeholder="Enter full address"
                       onChange={handleChange}
                       value={formData.address}
                     />
                   </div>
   
                   <div className="md:col-span-2 space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Description</label>
                     <textarea
                       id="description"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg h-32"
                       placeholder="Describe your property..."
                       onChange={handleChange}
                       value={formData.description}
                     />
                   </div>
            
                   <div className="md:col-span-2 space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Mention nearby points of interes</label>
                     <textarea
                       id="near"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg h-32"
                       placeholder="Mention nearby points of interes"
                       onChange={handleChange}
                       value={formData.near}
                     />
                   </div>
   
                   <div className="md:col-span-2 space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Enter any rules or regulations for the property</label>
                     <textarea
                       id="rules"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg h-32"
                       placeholder="Enter any rules or regulations for the property"
                       onChange={handleChange}
                       value={formData.rules}
                     />
                   </div>
   
   
                   <div className="space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Contact Details</label>
                     <input
                       type="number"
                       id="contact"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                       placeholder="Contact Details"
                       onChange={handleChange}
                       value={formData.contact}
                     />
                   </div>
   
   
                   <div className="space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Name of Host/Seller</label>
                     <input
                       type="text"
                       id="host"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                       placeholder="Contact Details"
                       onChange={handleChange}
                       value={formData.host}
                     />
                   </div>
   
   
                   <div className="space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Type (e.g., House or Room)</label>
                     <input
                       type="text"
                       id="kind"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                       placeholder="Type (e.g., House or Room)"
                       onChange={handleChange}
                       value={formData.kind}
                     />
                   </div>
                  
   
                   <div className="space-y-1">
                     <label className="font-medium text-gray-700 dark:text-white">Available from which date</label>
                     <input
                       type="text"
                       id="period"
                       className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                       placeholder="Available from which date"
                       onChange={handleChange}
                       value={formData.period}
                     />
                   </div>
   
   
                    <div className="space-y-1">
                      <label className="font-medium text-gray-700 dark:text-white">Cancellation Policy</label>
                      <input
                        type="text"
                        id="cancel"
                        className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                        placeholder="Cancellation Policy"
                        onChange={handleChange}
                        value={formData.cancel}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-gray-700 dark:text-white">Max Guests / Capacity</label>
                      <input
                        type="number"
                        id="numberOfGuests"
                        min="1"
                        className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                        placeholder="e.g. 2 Guests"
                        onChange={handleChange}
                        value={formData.numberOfGuests || 1}
                      />
                    </div>
   
   
   
                 </div>
               </div>
   
               {/* Section 3: Media Upload */}
               <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm space-y-6">
                 <h2 className="text-xl font-semibold">Add Photos & Video</h2>
                 
                 {/* Image Upload */}
                 <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <input
                       type="file"
                       id="images"
                       accept="image/*,.avif,.webp,.heic,.heif,.jpg,.jpeg,.png,.gif,.svg"
                       multiple
                       onChange={(e) => setFiles(e.target.files)}
                       className="hidden"
                     />
                     <label
                       htmlFor="images"
                       className="flex-1 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-airbnb-red transition-colors"
                     >
                       <FaCamera className="text-3xl text-gray-400 mb-2" />
                       <span className="text-gray-600 dark:text-white">Drag photos or click to upload</span>
                       <span className="text-sm text-gray-500 dark:text-white">Up to 10 photos</span>
                     </label>
                     <button
                       type="button"
                       onClick={handleImageSubmit}
                       className="h-full px-6  bg-airbnb-red bg-airbnb-500 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                             className="absolute top-2 right-2 bg-white dark:bg-gray-900 p-1 rounded-full shadow-sm hover:text-airbnb-red"
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
                       className="flex-1 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-airbnb-red transition-colors"
                     >
                       <FaVideo className="text-3xl text-gray-400 mb-2" />
                       <span className="text-gray-600 dark:text-white">Upload a property video</span>
                       <span className="text-sm text-gray-500 dark:text-white">Max 50MB</span>
                     </label>
                     <button
                       type="button"
                       onClick={handleVideoUpload}
                       className="h-full px-6 bg-airbnb-red  bg-airbnb-500 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                         className="absolute top-2 right-2 bg-white dark:bg-gray-900 p-1 rounded-full shadow-sm hover:text-airbnb-red"
                       >
                         <FaTimes />
                       </button>
                     </div>
                   )}
                 </div>
               </div>
   
               {/* Section 4: Amenities */}
               <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
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
                     { id: "stove", label: "Stove", icon: <FaCookie className="text-xl" /> },
                     { id: "storage", label: "Wardrobe", icon: <FaBackspace className="text-xl" /> },
                     { id: "security", label: "Security", icon: <FaShieldAlt className="text-xl" /> },
                     { id: "furnished", label: "Furnished", icon: <FaChair className="text-xl" /> },
                     { id: "hot", label: "Hot Shower", icon: <FaShower className="text-xl" /> },
                     { id: "pets", label: "Pets Allowed", icon: <FaDog className="text-xl" /> },
                     { id: "prepaid", label: "Electricity Pripaid", icon: <FaBolt className="text-xl" /> },
                     { id: "fridge", label: "fridge", icon: <FaBoxes className="text-xl" /> },
                     { id: "share", label: "House Share", icon: <FaUsers className="text-xl" /> },
                   ].map((amenity) => (
                     <label
                       key={amenity.id}
                       className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                         formData[amenity.id] ? "border-airbnb-red bg-red-50" : "border-gray-200 dark:border-gray-800"
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

                {/* Operating Schedule Section */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Operating Schedule</h2>
                      <p className="text-sm text-gray-500 dark:text-white">Define your weekly availability</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-2xl">
                      <ClockIcon className="w-6 h-6 text-rose-500" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl border-2 transition-all ${formData.operatingHours[day].closed ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-900 border-gray-50 shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase tracking-tighter ${formData.operatingHours[day].closed ? 'bg-gray-200 text-gray-400' : 'bg-rose-500 text-white'}`}>
                            {day.slice(0, 3)}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white capitalize">{day}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={formData.operatingHours[day].closed}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...prev.operatingHours[day], closed: e.target.checked }
                                  }
                                }))}
                              />
                              <div className={`w-12 h-6 rounded-full transition-colors ${formData.operatingHours[day].closed ? 'bg-rose-500' : 'bg-gray-200'}`} />
                              <div className={`absolute top-1 left-1 bg-white dark:bg-gray-900 w-4 h-4 rounded-full transition-transform ${formData.operatingHours[day].closed ? 'translate-x-6' : ''}`} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-rose-500 transition-colors">Closed</span>
                          </label>
                        </div>

                        {!formData.operatingHours[day].closed && (
                          <>
                            <div className="flex flex-col gap-2">
                              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-2">Opens</label>
                              <input
                                type="time"
                                value={formData.operatingHours[day].open}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...prev.operatingHours[day], open: e.target.value }
                                  }
                                }))}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-xl focus:border-rose-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold text-xs"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-2">Closes</label>
                              <input
                                type="time"
                                value={formData.operatingHours[day].close}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...prev.operatingHours[day], close: e.target.value }
                                  }
                                }))}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-xl focus:border-rose-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold text-xs"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
   
               {/* Property Details */}
   <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
     <h2 className="text-xl font-semibold mb-6">Property Details</h2>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[
         {
           id: "bedrooms",
           label: formData.type === "office" ? "Square Meters" : "Bedrooms",
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
             ['over', 'sale', 'land'].includes(formData.type) ? "/ night" :
             formData.type === "office" ? "/ month" : "",
         },
       ].map((input) => (
         <div key={input.id} className="space-y-2">
           <label htmlFor={input.id} className="flex items-center gap-2 text-gray-700 dark:text-white font-medium">
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
               className="w-full p-3 pl-10 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
               onChange={handleChange}
               value={input.value}
             />
             {input.additionalInfo && (
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white">
                 {input.additionalInfo}
               </span>
             )}
           </div>
         </div>
       ))}
   
       {/* Discount Price */}
       {formData.offer && (
         <div className="space-y-2">
           <label htmlFor="discountPrice" className="flex items-center gap-2 text-gray-700 dark:text-white font-medium">
             <FaPercent className="text-airbnb-red" />
             Discounted Price
           </label>
           <div className="relative">
             <input
               type="number"
               id="discountPrice"
               min="0"
               max="10000000"
               required
               className="w-full p-3 pl-10 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
               onChange={handleChange}
               value={formData.discountPrice}
             />
             {formData.type === "rent" && (
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white">
                 / month
               </span>
             )}
           </div>
         </div>
       )}
     </div>
   </div>
   
               {/* Submit Section */}
               <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full bg-airbnb-500 py-4 bg-airbnb-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                 >
                   {loading ? "Creating Listing..." : "Publish Listing"}
                 </button>
                 {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
               </div>
             </form>
     
           {/* Important Message */}
           <div className="mt-6 p-4 border bg-white dark:bg-gray-900 rounded-lg">
             <h2 className="text-slate-700 dark:text-white text-center font-semibold mb-4">
               Important Message
             </h2>
             <p className="text-xs sm:text-sm text-center text-slate-700 dark:text-white">
               If your post does not go through, we recommend logging out of your
               account and then logging back in. This will help refresh your session
               and resolve any potential errors you may encounter.
             </p>
           </div>
         </div>
       </div>
     </div>
     );
   }
