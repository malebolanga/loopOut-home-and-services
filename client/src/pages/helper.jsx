import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaClock, FaTag, FaShieldAlt, FaDog, FaMapMarkerAlt, FaPhone, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Contact from '../components/Contact.jsx';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

export default function Helper() {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const { helperId } = params;

  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [contact, setContact] = useState(false);

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/helper/get/${helperId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setHelper(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchHelper();
  }, [helperId]);
  
  // *** FIX ***
  // Corrected the delete handler.
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/helper/delete/${helperId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Added the Authorization header. This is crucial for the backend's
          // verifyToken middleware to authenticate the request and authorize the deletion.
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Failed to delete helper profile.');
        setLoading(false);
        return;
      }

      setLoading(false);
      // Navigate to the user's profile page after successful deletion.
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'An error occurred during deletion.');
      setLoading(false);
    }
  };

  return (
    <main className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && (
        <p className='text-center my-7 text-2xl text-red-600'>
          {typeof error === 'string' ? error : 'Something went wrong!'}
        </p>
      )}
      {helper && !loading && !error && (
        <div>
          <Swiper
            slidesPerView={1}
            navigation
            pagination={{ type: 'progressbar' }}
            className='h-[550px]'
          >
            {helper.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <div
                  className='h-full w-full bg-center bg-cover'
                  style={{
                    background: `url(${url})`,
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='flex flex-col md:flex-row justify-between items-start gap-4 mt-8'>
            <div className='flex-1'>
              <h1 className='text-3xl font-semibold'>{helper.name}</h1>
              <p className='text-gray-500 text-sm mt-2'>
                Posted by {helper.host}
              </p>
              <div className='flex flex-wrap gap-2 mt-4'>
                <span className='bg-red-100 text-red-800 py-1 px-3 rounded-full text-sm'>
                  {helper.type}
                </span>
                {helper.security && (
                  <span className='bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm flex items-center gap-1'>
                    <FaShieldAlt /> Verified
                  </span>
                )}
                {helper.pets && (
                  <span className='bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm flex items-center gap-1'>
                    <FaDog /> Pet Friendly
                  </span>
                )}
              </div>
              <p className='text-slate-800 mt-4'>{helper.description}</p>
              <div className='mt-6'>
                <h2 className='text-xl font-semibold'>Services Offered</h2>
                <p className='text-slate-600 mt-2'>{helper.near}</p>
              </div>
            </div>
            <div className='w-full md:w-96 bg-white shadow-md rounded-lg p-6'>
              <div className='flex justify-between items-center'>
                <span className='text-2xl font-semibold flex items-center gap-1'>
                  <FaTag /> R{helper.regularPrice}
                  <span className='text-sm font-normal text-gray-500'>
                    {helper.type === 'tutor' ? '/hour' : '/service'}
                  </span>
                </span>
                {currentUser && currentUser._id === helper.userRef && (
                  <div className='flex gap-2'>
                    <button
                      onClick={() => navigate(`/update-helper/${helper._id}`)}
                      className='bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200'
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className='bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 disabled:opacity-50'
                    >
                      {loading ? 'Deleting...' : <FaTrash />}
                    </button>
                  </div>
                )}
              </div>
              <div className='mt-4 space-y-4'>
                <div className='flex items-center gap-2'>
                  <FaClock className='text-gray-600' />
                  <span className='text-gray-600'>{helper.period}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaMapMarkerAlt className='text-gray-600' />
                  <span className='text-gray-600'>{helper.address}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaPhone className='text-gray-600' />
                  <span className='text-gray-600'>{helper.contact}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaUser className='text-gray-600' />
                  <span className='text-gray-600'>{helper.host}</span>
                </div>
              </div>
              {currentUser && helper.userRef && currentUser._id !== helper.userRef && !contact && (
                <button
                  onClick={() => setContact(true)}
                  className='w-full mt-6 bg-slate-700 text-white py-3 rounded-lg uppercase hover:opacity-95'
                >
                  Contact Helper
                </button>
              )}
              {contact && <Contact listing={helper} />}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
