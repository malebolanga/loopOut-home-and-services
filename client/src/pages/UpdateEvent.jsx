import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';

export default function UpdateEvent() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
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
    imageUrls: [],
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/event/${params.id}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setEvent(data);
        setFormData(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [params.id]);

  const handleChange = (e) => {
    if (e.target.id === "parking" || e.target.id === "foodAvailable" || e.target.id === "familyFriendly") {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    } else if (e.target.id === "regularPrice") {
      setFormData({
        ...formData,
        [e.target.id]: parseFloat(e.target.value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
      const fileName = `${new Date().getTime()}_${cleanFileName}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleImageSubmit = async () => {
    if (files.length === 0) {
      setImageUploadError('Please select at least one image');
      return;
    }
    if (files.length + (formData.imageUrls || []).length > 10) {
      setImageUploadError('You can only upload up to 10 images per listing');
      return;
    }
    try {
      setUploading(true);
      setImageUploadError(null);
      setUploadProgress(0);
      const urls = await Promise.all(files.map(storeImage));
      setFormData(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...urls],
      }));
      setFiles([]);
    } catch (err) {
      setImageUploadError('Image upload failed. Check file size (2MB max per image).');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/event/update/${event._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      navigate(`/event/${event._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error loading event</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-7">Update Event</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              id="name"
              className="w-full p-3 border rounded-lg"
              placeholder="Event Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Event Type</label>
            <select
              id="type"
              className="w-full p-3 border rounded-lg"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="art">Art & Culture</option>
              <option value="community">Community</option>
              <option value="food">Food & Drink</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            className="w-full p-3 border rounded-lg"
            placeholder="Event Description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <div className="relative">
              <input
                type="date"
                id="date"
                className="w-full p-3 border rounded-lg pl-10"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <div className="relative">
              <input
                type="time"
                id="time"
                className="w-full p-3 border rounded-lg pl-10"
                value={formData.time}
                onChange={handleChange}
                required
              />
              <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="relative">
            <input
              type="text"
              id="address"
              className="w-full p-3 border rounded-lg pl-10"
              placeholder="Event Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Host Name</label>
            <input
              type="text"
              id="host"
              className="w-full p-3 border rounded-lg"
              placeholder="Host Name"
              value={formData.host}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Contact Info</label>
            <input
              type="text"
              id="contact"
              className="w-full p-3 border rounded-lg"
              placeholder="Contact Phone/Email"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Ticket Price (R)</label>
            <input
              type="number"
              id="regularPrice"
              min="0"
              className="w-full p-3 border rounded-lg"
              value={formData.regularPrice}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="parking"
              className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              checked={formData.parking}
              onChange={handleChange}
            />
            <label htmlFor="parking" className="ml-2 block text-sm text-gray-700">
              Parking Available
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="foodAvailable"
              className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              checked={formData.foodAvailable}
              onChange={handleChange}
            />
            <label htmlFor="foodAvailable" className="ml-2 block text-sm text-gray-700">
              Food Available
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="familyFriendly"
              className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              checked={formData.familyFriendly}
              onChange={handleChange}
            />
            <label htmlFor="familyFriendly" className="ml-2 block text-sm text-gray-700">
              Family Friendly
            </label>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className='flex flex-col gap-4 p-4 border rounded-lg'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 10)</span>
          </p>
          <div className='flex gap-4'>
            <input
              type='file'
              accept='image/*'
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className='p-3 border border-gray-300 rounded w-full'
            />
            <button
              type='button'
              disabled={uploading}
              onClick={handleImageSubmit}
              className='p-3 text-red-600 border border-red-600 rounded uppercase hover:shadow-lg disabled:opacity-80'
            >
              {uploading ? `Uploading ${uploadProgress}%...` : 'Upload'}
            </button>
          </div>
          {imageUploadError && <p className='text-red-700 text-sm'>{imageUploadError}</p>}
          {formData.imageUrls && formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div key={url} className='flex justify-between p-3 border items-center'>
                <img src={url} alt='event image' className='w-20 h-20 object-contain rounded-lg' />
                <button
                  type='button'
                  onClick={() => handleRemoveImage(index)}
                  className='p-3 text-red-700 rounded-lg hover:opacity-75'
                >
                  <FaTimes />
                </button>
              </div>
            ))
          }
        </div>

        <button
          disabled={loading}
          className="bg-red-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update Event"}
        </button>
      </form>
    </div>
  );
}
