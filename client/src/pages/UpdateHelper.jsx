import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  FaTimes } from 'react-icons/fa';

export default function UpdateHelper() {
  const navigate = useNavigate();
  const { helperId } = useParams();
  const [helper, setHelper] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    near: '',
    address: '',
    contact: '',
    host: '',
    type: 'domestic',
    regularPrice: 50,
    kind: '',
    period: '',
    cancel: '',
    security: false,
    pets: false,
    bedrooms: 1,
    bathrooms: 1,
  });

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/helper/get/${helperId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setHelper(data);
        setFormData(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchHelper();
  }, [helperId]);

  const handleChange = (e) => {
    if (e.target.id === 'domestic' || e.target.id === 'errand' || e.target.id === 'tutor' || e.target.id === 'chef' || e.target.id === 'beauty' || e.target.id === 'tattoo') {
      setFormData({ ...formData, type: e.target.id });
      return;
    }
    if (e.target.type === 'checkbox') {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 10) {
      setUploading(true);
      setImageUploadError(null);
      const uploadPromises = files.map((file) => {
        // Implement your image upload logic here
        // This should be similar to your CreateListing.jsx implementation
        return new Promise((resolve) => {
          // Simulate upload
          setTimeout(() => {
            resolve(URL.createObjectURL(file));
          }, 1000);
        });
      });

      try {
        const urls = await Promise.all(uploadPromises);
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
        setFiles([]);
        setImageUploadError(null);
      } catch (error) {
        setImageUploadError('Image upload failed (2MB max per image)');
      } finally {
        setUploading(false);
      }
    } else {
      setImageUploadError('You can only upload up to 10 images per listing');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/helper/update/${helperId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      navigate(`/helper/${helperId}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) return <p className='text-center my-7 text-2xl'>Loading...</p>;
  if (error) return <p className='text-center my-7 text-2xl'>Something went wrong!</p>;

  return (
    <main className='max-w-4xl mx-auto p-3'>
      <h1 className='text-3xl font-semibold text-center my-7'>Update Helper Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border p-3 rounded-lg'
            id='name'
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            required
            onChange={handleChange}
            value={formData.description}
          />
          <textarea
            placeholder='Services Offered'
            className='border p-3 rounded-lg'
            id='near'
            required
            onChange={handleChange}
            value={formData.near}
          />
          <input
            type='text'
            placeholder='Address'
            className='border p-3 rounded-lg'
            id='address'
            required
            onChange={handleChange}
            value={formData.address}
          />
          <input
            type='text'
            placeholder='Contact'
            className='border p-3 rounded-lg'
            id='contact'
            required
            onChange={handleChange}
            value={formData.contact}
          />
          <input
            type='text'
            placeholder='Host Name'
            className='border p-3 rounded-lg'
            id='host'
            required
            onChange={handleChange}
            value={formData.host}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='security'
                className='w-5'
                onChange={handleChange}
                checked={formData.security}
              />
              <span>Background Check Verified</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='pets'
                className='w-5'
                onChange={handleChange}
                checked={formData.pets}
              />
              <span>Pet Friendly</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold'>Type</label>
              <div className='flex gap-2 flex-wrap'>
                {['domestic', 'errand', 'tutor', 'chef', 'beauty', 'tattoo'].map((type) => (
                  <button
                    key={type}
                    type='button'
                    className={`px-4 py-2 rounded-lg capitalize ${formData.type === type ? 'bg-airbnb-red text-white' : 'bg-gray-200'}`}
                    onClick={() => setFormData({ ...formData, type })}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold'>Regular Price</label>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  id='regularPrice'
                  min='50'
                  className='p-3 border border-gray-300 rounded-lg w-32'
                  onChange={handleChange}
                  value={formData.regularPrice}
                />
                <span>{formData.type === 'tutor' ? 'per hour' : 'per service'}</span>
              </div>
            </div>
          </div>
          {formData.type === 'tutor' && (
            <>
              <div className='flex flex-col gap-2'>
                <label className='font-semibold'>Education Level</label>
                <input
                  type='text'
                  placeholder='Education Level'
                  className='border p-3 rounded-lg'
                  id='kind'
                  onChange={handleChange}
                  value={formData.kind}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='font-semibold'>Teaching Format</label>
                <select
                  id='bathrooms'
                  className='p-3 border rounded-lg w-full'
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  value={formData.bathrooms}
                >
                  <option value='1'>In-person</option>
                  <option value='2'>Online</option>
                  <option value='3'>Both</option>
                </select>
              </div>
            </>
          )}
          {formData.type === 'domestic' && (
            <div className='flex flex-col gap-2'>
              <label className='font-semibold'>Minimum Hours</label>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='24'
                className='p-3 border border-gray-300 rounded-lg w-32'
                onChange={handleChange}
                value={formData.bedrooms}
              />
            </div>
          )}
          <input
            type='text'
            placeholder='Availability'
            className='border p-3 rounded-lg'
            id='period'
            onChange={handleChange}
            value={formData.period}
          />
          <input
            type='text'
            placeholder='Cancellation Policy'
            className='border p-3 rounded-lg'
            id='cancel'
            onChange={handleChange}
            value={formData.cancel}
          />
          <button
            disabled={loading || uploading}
            className='p-3 bg-airbnb-red text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Updating...' : 'Update Helper Listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>
              The first image will be the cover (max 10)
            </span>
          </p>
          <div className='flex gap-4'>
            <input
              type='file'
              id='images'
              accept='image/*'
              multiple
              onChange={handleFileChange}
              className='p-3 border border-gray-300 rounded w-full'
            />
            <button
              type='button'
              disabled={uploading}
              onClick={handleImageSubmit}
              className='p-3 text-airbnb-red border border-airbnb-red rounded uppercase hover:shadow-lg disabled:opacity-80'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {imageUploadError && (
            <p className='text-red-700 text-sm'>{imageUploadError}</p>
          )}
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className='flex justify-between p-3 border items-center'
              >
                <img
                  src={url}
                  alt='helper image'
                  className='w-20 h-20 object-contain rounded-lg'
                />
                <button
                  type='button'
                  onClick={() => handleRemoveImage(index)}
                  className='p-3 text-red-700 rounded-lg hover:opacity-75'
                >
                  <FaTimes />
                </button>
              </div>
            ))}
        </div>
      </form>
    </main>
  );
}