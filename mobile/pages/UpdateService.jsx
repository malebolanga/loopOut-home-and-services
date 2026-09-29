import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { HiOutlineClock as ClockIcon } from 'react-icons/hi';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';

export default function UpdateService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [files, setFiles] = useState([]);
  const [serviceImageUploading, setServiceImageUploading] = useState({});
  
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
    checkInTime: '14:00',
    checkOutTime: '11:00',
    
    // Moving specific rates configuration
    moveCostPerBox: 50,
    moveCostPerKilo: 10,
    movePriceVan: 800,
    movePriceVanTrailer: 1200,
    movePriceMiniTruck: 1500,
    movePriceOtherTruck: 2000,
    movePriceBigTruckTrailer: 3500,
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
      serviceList: [...formData.serviceList, { type: '', name: '', description: '', price: '', image: '' }],
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

  const handleServiceImageUpload = async (index, file) => {
    if (!file) return;
    try {
      setServiceImageUploading(prev => ({ ...prev, [index]: true }));
      const url = await storeImage(file);
      const newList = [...formData.serviceList];
      newList[index]['image'] = url;
      setFormData({ ...formData, serviceList: newList });
    } catch (err) {
      console.error("Service image upload failed:", err);
    } finally {
      setServiceImageUploading(prev => ({ ...prev, [index]: false }));
    }
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
            placeholder='Professional Experience (e.g. Expert with 10 years experience)'
            className='border p-3 rounded-lg'
            id='experience'
            required
            onChange={handleChange}
            value={formData.experience}
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
          {/* Operating Schedule Section */}
          <div className="col-span-full pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Operating Schedule</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Define your weekly availability</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl">
                <ClockIcon className="w-6 h-6 text-rose-500" />
              </div>
            </div>

            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-3xl border-2 transition-all ${formData.operatingHours[day].closed ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-900 border-gray-50 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase tracking-tighter ${formData.operatingHours[day].closed ? 'bg-gray-200 text-gray-400' : 'bg-rose-500 text-white'}`}>
                      {day.slice(0, 3)}
                    </div>
                    <span className="font-black text-gray-900 dark:text-white capitalize">{day}</span>
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
                <option value='storage'>Booking Storage</option>
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
                  className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg w-32'
                  onChange={handleChange}
                  value={formData.regularPrice}
                />
                <span>per person/service</span>
              </div>
            </div>
          </div>

          {formData.type === 'storage' && (
            <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='font-semibold text-gray-800 dark:text-white text-lg'>📦 Storage Space Configuration</span>
              </div>
              
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold'>Storage Size</label>
                <input
                  type='text'
                  id='storageSize'
                  placeholder='e.g., 3m x 3m x 2.5m'
                  className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                  onChange={handleChange}
                  value={formData.storageSize || ''}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Cost per Day (R)</label>
                  <input
                    type='number'
                    id='storagePriceDay'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.storagePriceDay || 0}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Cost per Month (R)</label>
                  <input
                    type='number'
                    id='storagePriceMonth'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.storagePriceMonth || 0}
                  />
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold'>Late Payment / Pay Failure Policy</label>
                <textarea
                  id='storageFailurePolicy'
                  rows='3'
                  placeholder='Explain what happens if payment is missed...'
                  className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                  onChange={handleChange}
                  value={formData.storageFailurePolicy || ''}
                />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold'>Terms & Conditions</label>
                <textarea
                  id='storageTerms'
                  rows='3'
                  placeholder='Specify any storage terms...'
                  className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                  onChange={handleChange}
                  value={formData.storageTerms || ''}
                />
              </div>

              {/* PDF Policy Document */}
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold'>📄 Policy Document (PDF)</label>
                <p className='text-xs text-gray-500 dark:text-white'>Upload a rental agreement or terms PDF that customers must read before booking.</p>

                {!formData.storagePolicyDocUrl ? (
                  <label className='flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 hover:border-blue-400 transition-all group mt-1'>
                    <div className='flex flex-col items-center gap-1'>
                      <svg className='w-7 h-7 text-gray-400 group-hover:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1' />
                      </svg>
                      <span className='text-sm text-gray-500 dark:text-white group-hover:text-blue-500'>Click to upload PDF</span>
                      <span className='text-xs text-gray-400'>Max 10 MB</span>
                    </div>
                    <input
                      type='file'
                      accept='application/pdf'
                      className='hidden'
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) { alert('PDF must be under 10 MB'); return; }
                        try {
                          setUploading(true);
                          const storage = getStorage(app);
                          const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
                          const storageRef = ref(storage, `policy-docs/${Date.now()}_${cleanName}`);
                          const task = uploadBytesResumable(storageRef, file);
                          task.on('state_changed',
                            (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
                            (err) => { alert('Upload failed: ' + err.message); setUploading(false); },
                            async () => {
                              const url = await getDownloadURL(task.snapshot.ref);
                              setFormData(prev => ({ ...prev, storagePolicyDocUrl: url }));
                              setUploadProgress(0);
                              setUploading(false);
                            }
                          );
                        } catch (err) { alert('Error: ' + err.message); setUploading(false); }
                      }}
                    />
                  </label>
                ) : (
                  <div className='flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl mt-1'>
                    <div className='flex items-center gap-2 text-green-700 text-sm font-medium'>
                      <svg className='w-5 h-5 text-red-500 flex-shrink-0' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16z'/>
                      </svg>
                      <a href={formData.storagePolicyDocUrl} target='_blank' rel='noreferrer' className='underline truncate max-w-xs'>
                        View uploaded document ↗
                      </a>
                    </div>
                    <button
                      type='button'
                      onClick={() => setFormData(prev => ({ ...prev, storagePolicyDocUrl: '' }))}
                      className='ml-3 text-xs text-red-500 hover:text-red-700 font-semibold'
                    >
                      Remove
                    </button>
                  </div>
                )}

                {uploading && (
                  <div className='mt-2'>
                    <div className='h-1.5 w-full bg-gray-200 rounded-full'>
                      <div className='h-1.5 bg-blue-500 rounded-full transition-all' style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className='text-xs text-gray-500 dark:text-white mt-1'>Uploading… {Math.round(uploadProgress)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.type === 'moving' && (
            <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='font-semibold text-gray-800 dark:text-white text-lg'>🚛 Moving Rates Configuration</span>
              </div>
              <p className='text-xs text-gray-500 dark:text-white mb-2'>Configure rates for calculations during booking.</p>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Rate per Box (R)</label>
                  <input
                    type='number'
                    id='moveCostPerBox'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.moveCostPerBox || 50}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Rate per Kilo (R)</label>
                  <input
                    type='number'
                    id='moveCostPerKilo'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.moveCostPerKilo || 10}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Price for Van (R)</label>
                  <input
                    type='number'
                    id='movePriceVan'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.movePriceVan || 800}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Price for Van with Trailer (R)</label>
                  <input
                    type='number'
                    id='movePriceVanTrailer'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.movePriceVanTrailer || 1200}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-2'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Price for Mini Truck (R)</label>
                  <input
                    type='number'
                    id='movePriceMiniTruck'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.movePriceMiniTruck || 1500}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Price for Other Truck (R)</label>
                  <input
                    type='number'
                    id='movePriceOtherTruck'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.movePriceOtherTruck || 2000}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold'>Price for Big Truck with Trailer (R)</label>
                  <input
                    type='number'
                    id='movePriceBigTruckTrailer'
                    className='p-3 border border-gray-300 dark:border-gray-700 rounded-lg'
                    onChange={handleChange}
                    value={formData.movePriceBigTruckTrailer || 3500}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Check-in / Check-out Times */}
          <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
            <div className='flex items-center gap-2 mb-1'>
              <ClockIcon className='w-5 h-5 text-rose-500' />
              <span className='font-semibold text-gray-800 dark:text-white'>Check-in & Check-out Times</span>
            </div>
            <div className='flex flex-wrap gap-6'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-600 dark:text-white'>🛬 Check-in Time</label>
                <input
                  type='time'
                  id='checkInTime'
                  className='border p-3 rounded-lg w-40'
                  onChange={handleChange}
                  value={formData.checkInTime || '14:00'}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-600 dark:text-white'>🛫 Check-out Time</label>
                <input
                  type='time'
                  id='checkOutTime'
                  className='border p-3 rounded-lg w-40'
                  onChange={handleChange}
                  value={formData.checkOutTime || '11:00'}
                />
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
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
                  <div key={index} className='flex flex-col gap-2 bg-white dark:bg-gray-900 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-800'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='text'
                        placeholder='Category (e.g. Cleaning, Transport)'
                        className='border p-2 rounded-lg w-44'
                        value={service.type || ''}
                        onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                      />
                      <input
                        type='text'
                        placeholder='Package Name (e.g. Standard Wash)'
                        className='border p-2 rounded-lg flex-1'
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        required
                      />
                      <div className='flex items-center gap-1'>
                        <span className='text-gray-500 dark:text-white'>R</span>
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
                    <textarea
                      placeholder='Description / details included in this package'
                      className='border p-2 rounded-lg w-full'
                      value={service.description || ''}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      rows='2'
                    />
                    <div className='flex items-center gap-4 mt-2'>
                      <div className='flex-1 flex flex-col gap-1'>
                        <span className='text-xs font-semibold text-gray-500 dark:text-white'>Package Photo</span>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleServiceImageUpload(index, e.target.files[0])}
                          className='border p-1 rounded-lg text-sm w-full bg-gray-50 dark:bg-gray-800'
                        />
                      </div>
                      {serviceImageUploading[index] && (
                        <span className='text-xs text-rose-500 font-bold animate-pulse'>Uploading...</span>
                      )}
                      {service.image && (
                        <img src={service.image} alt="Service preview" className='w-16 h-16 object-cover rounded-lg border shadow-sm' />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg'>
                No additional packages added yet
              </div>
            )}
          </div>

          <div className='flex flex-col gap-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800 mt-4'>
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
                  <div key={index} className='bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-3'>
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
                            className='px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
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
              <div className='text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg'>
                No performers added yet
              </div>
            )}
          </div>

          <button
            disabled={loading || uploading}
            className='p-3 bg-red-600 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-4'
          >
            {loading ? 'Updating...' : 'Update Experience'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 dark:text-white ml-2'>
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
              className='p-3 border border-gray-300 dark:border-gray-700 rounded w-full'
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
