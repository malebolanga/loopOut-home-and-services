import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaClock, 
  FaTag, 
  FaShieldAlt, 
  FaDog, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaStar, 
  FaCheckCircle, 
  FaAward,
  FaRegCalendarAlt,
  FaCertificate,
  FaRegCheckCircle
} from 'react-icons/fa';
import { 
  IoCheckmarkCircleSharp, 
  IoTimeOutline,
  IoLocationOutline,
  IoCallOutline,
  IoPersonOutline 
} from 'react-icons/io5';
import { MdOutlineVerified, MdSecurity, MdPets } from 'react-icons/md';
import { GiAchievement } from 'react-icons/gi';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y, Autoplay, Thumbs } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Contact from '../components/Contact.jsx';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay, Thumbs]);

export default function Helper() {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const { helperId } = params;

  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/helper/get/${helperId}`);
        const data = await res.json();
        
        if (data.success === false) {
          throw new Error(data.message || 'Failed to load helper profile');
        }
        
        setHelper(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching helper:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHelper();
  }, [helperId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this helper profile? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/helper/delete/${helperId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await res.json();
      if (data.success === false) {
        throw new Error(data.message || 'Failed to delete helper profile');
      }

      // Show success message
      setTimeout(() => {
        navigate('/profile');
      }, 1000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Render loading state
  if (loading) {
    return (
      <main className="min-h-screen from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* Skeleton for header */}
            <div className="w-full max-w-4xl space-y-6">
              <div className="h-10 bg-slate-200 rounded-lg animate-pulse w-3/4 mx-auto"></div>
              <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2 mx-auto"></div>
            </div>
            
            {/* Skeleton for main content */}
            <div className="w-full max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image gallery skeleton */}
                <div className="lg:col-span-2">
                  <div className="h-[500px] bg-slate-200 rounded-2xl animate-pulse"></div>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>
                
                {/* Sidebar skeleton */}
                <div className="space-y-6">
                  <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
                  <div className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Render error state
  if (error || !helper) {
    return (
      <main className="min-h-screen from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-600 mb-6">
                {error || 'Unable to load helper details. Please try again later.'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen from-slate-50 to-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
            >
              Home
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => navigate('/helpers')}
              className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
            >
              Helpers
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium truncate">{helper.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid */}
        <div className="space-y-8">
          {/* Image Gallery Section */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
              {/* Main Image Gallery */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative h-[550px] rounded-2xl overflow-hidden shadow-2xl group">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <Swiper
                    spaceBetween={0}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    pagination={{
                      clickable: true,
                      renderBullet: (index, className) => {
                        return `<span class="${className} bg-white/80 w-3 h-3 mx-1 rounded-full transition-all duration-300"></span>`;
                      },
                    }}
                    thumbs={{ swiper: thumbsSwiper }}
                    className="h-full"
                    onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    loop={helper.imageUrls.length > 1}
                  >
                    {helper.imageUrls.map((url, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative h-full w-full">
                          <img
                            src={url}
                            alt={`${helper.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onLoad={handleImageLoad}
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                            <span className="text-white/80">Image</span>
                            <span className="font-bold">{index + 1}</span>
                            <span className="text-white/60">/</span>
                            <span className="font-medium">{helper.imageUrls.length}</span>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
                    <button className="swiper-button-prev bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
                    <button className="swiper-button-next bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {helper.imageUrls.length > 1 && (
                  <div className="relative">
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={12}
                      slidesPerView={4}
                      freeMode={true}
                      watchSlidesProgress={true}
                      breakpoints={{
                        640: { slidesPerView: 4 },
                        1024: { slidesPerView: 5 },
                      }}
                      className="thumbnail-gallery"
                    >
                      {helper.imageUrls.map((url, index) => (
                        <SwiperSlide key={index}>
                          <button
                            onClick={() => setActiveImageIndex(index)}
                            className={`relative h-28 rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                              activeImageIndex === index 
                                ? 'border-slate-700 scale-105 shadow-lg' 
                                : 'border-transparent hover:border-slate-300'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                            <img
                              src={url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {activeImageIndex === index && (
                              <div className="absolute inset-0 bg-slate-700/20 flex items-center justify-center">
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                  <FaCheckCircle className="text-white text-sm" />
                                </div>
                              </div>
                            )}
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </div>

              {/* Quick Info & Contact Sidebar */}
              <div className="space-y-6">
                {/* Price & Actions Card */}
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900">R{helper.regularPrice}</span>
                        <span className="text-slate-500 text-lg">
                          {helper.type === 'tutor' ? '/hour' : '/service'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <FaTag className="text-slate-400" />
                        <span className="text-sm text-slate-500">Fixed Rate • No Hidden Fees</span>
                      </div>
                    </div>
                    
                    {/* Owner Actions */}
                    {currentUser && currentUser._id === helper.userRef && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/update-helper/${helper._id}`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <FaEdit className="text-sm" />
                          <span className="text-sm font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={loading}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTrash className="text-sm" />
                          <span className="text-sm font-semibold">
                            {loading ? 'Deleting...' : 'Delete'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 gap-4 py-6 border-y border-slate-200">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-colors duration-200">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <IoTimeOutline className="text-blue-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500">Availability</p>
                        <p className="font-semibold text-slate-900">{helper.period}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-green-200 transition-colors duration-200">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <IoLocationOutline className="text-green-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500">Service Area</p>
                        <p className="font-semibold text-slate-900">{helper.address}</p>
                      </div>
                    </div>

                    {helper.contact && (
                      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-purple-200 transition-colors duration-200">
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <IoCallOutline className="text-purple-600 text-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-500">Contact Number</p>
                          <p className="font-semibold text-slate-900">{helper.contact}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-colors duration-200">
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <IoPersonOutline className="text-amber-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500">Service Provider</p>
                        <p className="font-semibold text-slate-900">{helper.host}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Button */}
                  {currentUser && helper.userRef && currentUser._id !== helper.userRef && !contact && (
                    <button
                      onClick={() => setContact(true)}
                      className="w-full mt-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 rounded-xl uppercase font-bold tracking-wide hover:from-slate-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                      Contact {helper.name.split(' ')[0]}
                    </button>
                  )}
                  
                  {contact && (
                    <div className="mt-6 animate-fadeIn">
                      <Contact listing={helper} />
                    </div>
                  )}
                </div>

                {/* Verification Badges */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <MdOutlineVerified className="text-emerald-600 text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">Verification & Trust</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {helper.security && (
                      <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <MdSecurity className="text-emerald-600 text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800">Background Checked</p>
                          <p className="text-sm text-emerald-600">Identity verified by our team</p>
                        </div>
                      </div>
                    )}
                    
                    {helper.pets && (
                      <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <MdPets className="text-emerald-600 text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800">Pet Friendly</p>
                          <p className="text-sm text-emerald-600">Comfortable working with pets</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <FaRegCheckCircle className="text-emerald-600 text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800">Professional Service</p>
                        <p className="text-sm text-emerald-600">Quality guaranteed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Services Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
                  <div className="flex-1">
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                      {helper.name}
                    </h1>
                    <p className="text-slate-600 text-lg flex items-center gap-2">
                      <span>Professional service by</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                        {helper.host}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 px-5 rounded-full text-sm font-bold shadow-lg capitalize">
                      {helper.type} Services
                    </span>
                    {helper.security && (
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <FaShieldAlt /> Verified Pro
                      </span>
                    )}
                    {helper.pets && (
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <FaDog /> Pet-Friendly
                      </span>
                    )}
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-xl">
                      <GiAchievement className="text-white text-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">About This Service</h2>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
                        {helper.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meet the Team / Performers Section */}
                {helper.performers && helper.performers.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-2 rounded-xl">
                        <FaUser className="text-white text-2xl" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">Meet the Team</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {helper.performers.map((performer, idx) => (
                        <div 
                          key={idx} 
                          className="group bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                          
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="relative">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                                <img 
                                  src={performer.image} 
                                  alt={performer.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                                <MdOutlineVerified className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-1">{performer.name}</h3>
                              <p className="text-xs font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full inline-block">
                                {performer.experience}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Offered */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl">
                      <FaAward className="text-white text-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Services & Expertise</h2>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {helper.near.split(',').map((service, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-white/80 rounded-xl border border-blue-100">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FaRegCheckCircle className="text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-800">{service.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FaRegCalendarAlt className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Flexible Scheduling</p>
                        <p className="text-sm text-slate-600">Book at your convenience</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <FaCertificate className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Professional Quality</p>
                        <p className="text-sm text-slate-600">Guaranteed satisfaction</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FaShieldAlt className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Secure Booking</p>
                        <p className="text-sm text-slate-600">Safe & protected transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <FaStar className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Quality Assured</p>
                        <p className="text-sm text-slate-600">High standard service</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Cards */}
            <div className="space-y-8">
              {/* Service Summary Card */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Service Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <FaTag className="text-slate-600" />
                      </div>
                      <span className="text-slate-700">Service Type</span>
                    </div>
                    <span className="font-bold text-slate-900 capitalize">{helper.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FaClock className="text-blue-600" />
                      </div>
                      <span className="text-slate-700">Duration</span>
                    </div>
                    <span className="font-bold text-slate-900">{helper.period}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <FaMapMarkerAlt className="text-emerald-600" />
                      </div>
                      <span className="text-slate-700">Location</span>
                    </div>
                    <span className="font-bold text-slate-900 text-right">{helper.address}</span>
                  </div>
                </div>
              </div>

              {/* Safety Guidelines Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <FaShieldAlt className="text-amber-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">Safety First</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                    <div className="bg-white p-1.5 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Verify Credentials</p>
                      <p className="text-sm text-amber-600 mt-1">Always ask for verification before meeting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                    <div className="bg-white p-1.5 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Meet in Public</p>
                      <p className="text-sm text-amber-600 mt-1">Initial meetings should be in public places</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                    <div className="bg-white p-1.5 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Clear Terms</p>
                      <p className="text-sm text-amber-600 mt-1">Discuss payment and terms in advance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                    <div className="bg-white p-1.5 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Report Issues</p>
                      <p className="text-sm text-amber-600 mt-1">Contact support if you encounter problems</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl p-6 text-white">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                    <FaPhone className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold">Need Immediate Assistance?</h3>
                  <p className="text-slate-300 text-sm">
                    Our support team is available 24/7 to help with any questions or concerns.
                  </p>
                  <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors duration-200">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {currentUser && helper.userRef && currentUser._id !== helper.userRef && !contact && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setContact(true)}
            className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
          >
            <FaPhone className="text-xl" />
          </button>
        </div>
      )}

      {/* Add custom styles for Swiper */}
      <style jsx>{`
        .thumbnail-gallery .swiper-slide {
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        
        .thumbnail-gallery .swiper-slide-thumb-active {
          opacity: 1;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
