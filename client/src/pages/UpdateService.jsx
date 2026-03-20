import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

export default function UpdateService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    near: '',
    address: '',
    contact: '',
    host: '',
    type: 'cleaning',
    regularPrice: 50,
    kind: '',
    period: '',
    cancel: '',
    security: false,
    pets: false,
    offer: false,
    serviceList: [],
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/service/get/${serviceId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setService(data);
        setFormData(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const handleChange = (e) => {
    if (e.target.type === 'checkbox') {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleAddService = () => {
    setFormData({
      ...formData,
      serviceList: [...formData.serviceList, { name: '', price: '' }],
    });
  };

  const handleRemoveService = (index) => {
    const newList = formData.serviceList.filter((_, i) => i !== index);
    setFormData({ ...formData, serviceList: newList });
  };

  const handleServiceChange = (index, field, value) => {
    const newList = [...formData.serviceList];
    newList[index][field] = value;
    setFormData({ ...formData, serviceList: newList });
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
        return new Promise((resolve) => {
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
      const res = await fetch(`/api/service/update/${serviceId}`, {
        method: 'PUT',
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
      navigate(`/service/${serviceId}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) return <p className='text-center my-7 text-2xl'>Loading...</p>;
  if (error) return <p className='text-center my-7 text-2xl'>Something went wrong!</p>;

  return (
    <main className='max-w-4xl mx-auto p-3'>
      <h1 className='text-3xl font-semibold text-center my-7'>Update Experience Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Experience Name'
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
            placeholder='What we will do / Amenities'
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
            placeholder='Contact Number'
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
                id='offer'
                className='w-5'
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Special Offer</span>
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
              <select
                id='type'
                className='p-3 border rounded-lg'
                onChange={handleChange}
                value={formData.type}
              >
                <option value='cleaning'>Cleaning</option>
                <option value='maintenance'>Maintenance</option>
                <option value='moving'>Moving</option>
                <option value='landscaping'>Landscaping</option>
                <option value='catering'>Catering</option>
                <option value='daycare'>Daycare</option>
                <option value='schoolTransport'>School Transport</option>
                <option value='carwash'>Car Wash</option>
                <option value='other'>Other</option>
              </select>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold'>Base Price</label>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  id='regularPrice'
                  min='50'
                  className='p-3 border border-gray-300 rounded-lg w-32'
                  onChange={handleChange}
                  value={formData.regularPrice}
                />
                <span>per person/service</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50'>
            <div className='flex justify-between items-center'>
              <h3 className='font-semibold text-lg'>Experience Packages & Prices</h3>
              <button
                type='button'
                onClick={handleAddService}
                className='bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:opacity-95'
              >
                Add Package
              </button>
            </div>
            {formData.serviceList && formData.serviceList.length > 0 ? (
              <div className='flex flex-col gap-3 mt-2'>
                {formData.serviceList.map((service, index) => (
                  <div key={index} className='flex items-center gap-2 bg-white p-3 rounded-md shadow-sm border border-gray-100'>
                    <input
                      type='text'
                      placeholder='Package Name (e.g. Standard Wash)'
                      className='border p-2 rounded-lg flex-1'
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      required
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-gray-500'>R</span>
                      <input
                        type='number'
                        placeholder='Price'
                        className='border p-2 rounded-lg w-24'
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                        required
                        min='0'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemoveService(index)}
                      className='text-red-500 hover:text-red-700 p-2'
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg'>
                No additional packages added yet
              </div>
            )}
          </div>

          <button
            disabled={loading || uploading}
            className='p-3 bg-red-600 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Updating...' : 'Update Experience'}
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
              className='p-3 text-red-600 border border-red-600 rounded uppercase hover:shadow-lg disabled:opacity-80'
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
                  alt='experience image'
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
