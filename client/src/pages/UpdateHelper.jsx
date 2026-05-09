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
    experience: '',
    performers: [],
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

  const handleAddPerformer = () => {
    setFormData({
      ...formData,
      performers: [...(formData.performers || []), { name: '', image: '', experience: '' }],
    });
  };

  const handleRemovePerformer = (index) => {
    const newList = formData.performers.filter((_, i) => i !== index);
    setFormData({ ...formData, performers: newList });
  };

  const handlePerformerChange = (index, field, value) => {
    const newList = [...formData.performers];
    newList[index][field] = value;
    setFormData({ ...formData, performers: newList });
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
            placeholder='Professional Experience (e.g. 5 years in domestic help)'
            className='border p-3 rounded-lg'
            id='experience'
            required
            onChange={handleChange}
            value={formData.experience}
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
          {/* Operating Schedule Section */}
          <div className="col-span-full pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Operating Schedule</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Define your weekly availability</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl">
                <ClockIcon className="w-6 h-6 text-rose-500" />
              </div>
            </div>

            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-3xl border-2 transition-all ${formData.operatingHours[day].closed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-50 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase tracking-tighter ${formData.operatingHours[day].closed ? 'bg-gray-200 text-gray-400' : 'bg-rose-500 text-white'}`}>
                      {day.slice(0, 3)}
                    </div>
                    <span className="font-black text-gray-900 capitalize">{day}</span>
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
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.operatingHours[day].closed ? 'translate-x-6' : ''}`} />
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
                          className="px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white transition-all font-bold text-xs"
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
                          className="px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white transition-all font-bold text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
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

          <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50 mt-4'>
            <div className='flex justify-between items-center'>
              <h3 className='font-semibold text-lg'>Service Performers</h3>
              <button
                type='button'
                onClick={handleAddPerformer}
                className='bg-gray-900 text-white px-3 py-1 rounded-lg text-sm hover:opacity-95 transition-all'
              >
                Add Performer
              </button>
            </div>
            {formData.performers && formData.performers.length > 0 ? (
              <div className='flex flex-col gap-4 mt-2'>
                {formData.performers.map((performer, index) => (
                  <div key={index} className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3'>
                    <div className='flex justify-between items-start'>
                      <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Performer {index + 1}</span>
                      <button
                        type='button'
                        onClick={() => handleRemovePerformer(index)}
                        className='text-red-500 hover:text-red-700 transition-colors'
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <input
                        type='text'
                        placeholder='Performer Name'
                        className='border p-2 rounded-lg'
                        value={performer.name}
                        onChange={(e) => handlePerformerChange(index, 'name', e.target.value)}
                        required
                      />
                      <input
                        type='text'
                        placeholder='Experience (e.g. 5 years)'
                        className='border p-2 rounded-lg'
                        value={performer.experience}
                        onChange={(e) => handlePerformerChange(index, 'experience', e.target.value)}
                        required
                      />
                    </div>
                    <div className='flex items-center gap-4 mt-2'>
                      {performer.image ? (
                        <div className='relative w-16 h-16 rounded-lg overflow-hidden border'>
                          <img src={performer.image} alt="performer" className='w-full h-full object-cover' />
                          <button
                            type='button'
                            onClick={() => handlePerformerChange(index, 'image', '')}
                            className='absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity'
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                           <input
                            type="file"
                            accept="image/*"
                            id={`perf-img-${index}`}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  setUploading(true);
                                  const url = await storeImage(file);
                                  handlePerformerChange(index, 'image', url);
                                  setUploading(false);
                                } catch (err) {
                                  setError("Failed to upload performer image");
                                  setUploading(false);
                                }
                              }
                            }}
                          />
                          <label
                            htmlFor={`perf-img-${index}`}
                            className='px-3 py-1 border border-gray-300 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50'
                          >
                            Upload Photo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg'>
                No performers added yet
              </div>
            )}
          </div>

          <button
            disabled={loading || uploading}
            className='p-3 bg-airbnb-red text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-4'
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