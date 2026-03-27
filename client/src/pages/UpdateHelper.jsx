import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';

export default function UpdateHelper() {
  const navigate = useNavigate();
  const { helperId } = useParams();
  const [helper, setHelper] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    serviceList: [],
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
    if (files.length + formData.imageUrls.length > 10) {
      setImageUploadError('You can only upload up to 10 images per listing');
      return;
    }

    try {
      setUploading(true);
      setImageUploadError(null);
      setUploadProgress(0);
      const urls = await Promise.all(files.map(storeImage));
      setFormData({
        ...formData,
        imageUrls: formData.imageUrls.concat(urls),
      });
      setFiles([]);
      setImageUploadError(null);
    } catch (err) {
      setImageUploadError('Image upload failed. Check file size (2MB max per image).');
    } finally {
      setUploading(false);
      setUploadProgress(0);
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

          <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50'>
            <div className='flex justify-between items-center'>
              <h3 className='font-semibold text-lg'>Additional Services & Prices</h3>
              <button
                type='button'
                onClick={handleAddService}
                className='bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:opacity-95'
              >
                Add Service
              </button>
            </div>
            {formData.serviceList && formData.serviceList.length > 0 ? (
              <div className='flex flex-col gap-3 mt-2'>
                {formData.serviceList.map((service, index) => (
                  <div key={index} className='flex items-center gap-2 bg-white p-3 rounded-md shadow-sm border border-gray-100'>
                    <input
                      type='text'
                      placeholder='Service Name (e.g. Wash & Iron)'
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
                No additional services added yet
              </div>
            )}
          </div>

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
              {uploading ? `Uploading ${uploadProgress}%...` : 'Upload'}
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