/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaUser,
  FaClock, FaShieldAlt, FaCheckCircle,
  FaWhatsapp, FaArrowLeft, FaCamera, 
  FaInfoCircle, FaTimes, FaChevronLeft, 
  FaChevronRight, FaHeart, FaShare,
  FaMedal, FaCalendarCheck, FaCheck,
  FaArrowRight, FaImage, FaPlayCircle,
  FaThumbsUp, FaComment, FaAward,
  FaBriefcase, FaGraduationCap, FaTools
} from 'react-icons/fa';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

import HelperComments from '../components/HelperComments';
import CommentsSidePanelHelper from '../components/CommentsSidePanelHelper';

export default function PhotographyHelperPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [nights, setNights] = useState(0); // Added for mobile bottom bar
  const [totalHours, setTotalHours] = useState(0); // Added for mobile bottom bar

  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    message: '',
    photographyType: '',
    location: '',
    guests: '1'
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Photography service options
  const serviceOptions = [
    { id: 'portrait', name: 'Portrait Photography', price: 'From R850', duration: '1-2 hours' },
    { id: 'event', name: 'Event Photography', price: 'From R2,500', duration: '3-5 hours' },
    { id: 'wedding', name: 'Wedding Photography', price: 'From R8,500', duration: 'Full day' },
    { id: 'product', name: 'Product Photography', price: 'From R1,200', duration: '2-3 hours' },
    { id: 'family', name: 'Family Photography', price: 'From R1,500', duration: '1-2 hours' },
    { id: 'commercial', name: 'Commercial Photography', price: 'Custom quote', duration: 'Varies' }
  ];

  const highlights = [
    { icon: <FaCheckCircle />, text: "Professional equipment & backup gear" },
    { icon: <FaCheckCircle />, text: "Edited high-resolution digital images" },
    { icon: <FaCheckCircle />, text: "Quick turnaround time (3-5 days)" },
    { icon: <FaCheckCircle />, text: "Multiple locations available" }
  ];

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/helper/get/${id}`);
        if (!res.ok) throw new Error('Failed to fetch photographer details');
        const data = await res.json();
        data.type = 'photography';
        setHelper(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchHelper();
  }, [id]);

  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const digitsOnly = String(contact).replace(/\D/g, '');
    return digitsOnly.startsWith('0') ? '27' + digitsOnly.substring(1) : digitsOnly;
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!helper?.contact) {
      alert("Photographer contact information is missing.");
      return;
    }

    const message = `Hi ${helper.name}, I'm interested in booking a photography session.%0A%0A` +
      `*Name:* ${bookingData.name}%0A` +
      `*Phone:* ${bookingData.phone}%0A` +
      `*Email:* ${bookingData.email || 'Not provided'}%0A` +
      `*Service:* ${bookingData.photographyType}%0A` +
      `*Date:* ${bookingData.date}%0A` +
      `*Time:* ${bookingData.time}%0A` +
      `*Location:* ${bookingData.location || 'To be discussed'}%0A` +
      `*Additional Info:* ${bookingData.message || 'None'}`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowBookingModal(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${helper?.name} - Professional Photography Services`,
      text: `Check out ${helper?.name}'s photography services on our platform!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support native sharing
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to clipboard if share fails
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Clipboard error:', clipboardErr);
      }
    }
  };

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    document.body.style.overflow = 'auto';
  };

  // Quick booking handler for mobile bottom bar
  const handleQuickBooking = () => {
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photographer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-2xl text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Photographer not found</h2>
          <p className="text-gray-600 mb-6">This profile may have been removed or is unavailable.</p>
          <button
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Browse photographers
          </button>
        </div>
      </div>
    );
  }

  const images = helper.imageUrls || [
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
              }`}
            >
              <FaArrowLeft className={`text-xl ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`} />
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                }`}
              >
                <FiShare2 className={`text-xl ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`} />
              </button>
              
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                }`}
              >
                {isLiked ? (
                  <FaHeart className="text-xl text-rose-500" />
                ) : (
                  <FiHeart className={`text-xl ${
                    isScrolled ? 'text-gray-900' : 'text-white'
                  }`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Image Gallery Grid - Airbnb Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden h-[300px] md:h-[400px] relative">
          {/* Main Large Image */}
          <div className="relative h-full cursor-pointer group" onClick={() => openImageModal(0)}>
            <img
              src={images[0]}
              alt="Main portfolio"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Side Grid */}
          <div className="hidden md:grid grid-cols-2 gap-2 h-full">
            {images.slice(1, 4).map((img, idx) => (
              <div 
                key={idx} 
                className={`relative cursor-pointer group overflow-hidden ${idx === 2 ? 'col-span-2' : ''}`}
                onClick={() => openImageModal(idx + 1)}
              >
                <img
                  src={img}
                  alt={`Portfolio ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
          
          {/* Show All Photos Button */}
          <button
            onClick={() => openImageModal(0)}
            className="absolute bottom-4 right-4 md:right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
          >
            <FaImage />
            Show all photos
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {helper.name} — Professional Photography Services
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaStar className="text-gray-900" />
                  <span className="font-semibold text-gray-900">{helper.rating || '4.92'}</span>
                  <span>({helper.reviewCount || '127'} reviews)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FaMedal className="text-rose-500" />
                  <span>Superhost Photographer</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  <span>{helper.address || 'Cape Town, South Africa'}</span>
                </div>
              </div>
            </div>


            {/* Host/Photographer Info Bar */}
            <div className="flex items-center gap-4 py-6 border-b border-gray-200">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={helper.avatar || images[0]}
                  alt={helper.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Hosted by {helper.name}</h2>
                <p className="text-sm text-gray-600">Professional photographer • {helper.host || '5'} years experience</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="py-6 border-b border-gray-200 space-y-4">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="text-gray-900 mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.text}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this service</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  {showFullDescription 
                    ? (helper.description || 'Professional photography services tailored to capture your special moments. With state-of-the-art equipment and years of experience, I ensure high-quality images that you will treasure forever.')
                    : `${(helper.description || 'Professional photography services tailored to capture your special moments. With state-of-the-art equipment and years of experience, I ensure high-quality images that you will treasure forever.').slice(0, 200)}...`
                  }
                </p>
                {(helper.description?.length > 200 || !helper.description) && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>

            {/* What You'll Get */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                  <FaCamera className="text-2xl text-gray-900" />
                  <div>
                    <h3 className="font-medium text-gray-900">Professional Shoot</h3>
                    <p className="text-sm text-gray-600">Dedicated session time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                  <FaImage className="text-2xl text-gray-900" />
                  <div>
                    <h3 className="font-medium text-gray-900">Edited Photos</h3>
                    <p className="text-sm text-gray-600">High-resolution digital files</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                  <FaClock className="text-2xl text-gray-900" />
                  <div>
                    <h3 className="font-medium text-gray-900">Quick Delivery</h3>
                    <p className="text-sm text-gray-600">3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                  <FaAward className="text-2xl text-gray-900" />
                  <div>
                    <h3 className="font-medium text-gray-900">Commercial Rights</h3>
                    <p className="text-sm text-gray-600">Usage rights included</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Options */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a service</h2>
              <div className="space-y-3">
                {serviceOptions.map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => {
                      setBookingData({...bookingData, photographyType: service.name});
                      setShowBookingModal(true);
                    }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-900 cursor-pointer transition-colors group"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-700">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{service.price}</p>
                      <FaArrowRight className="inline-block text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Preview */}
            <div className="py-6">
              <div className="flex items-center gap-2 mb-6">
                <FaStar className="text-gray-900 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {helper.rating || '4.92'} · {helper.reviewCount || '127'} reviews
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[5, 4.9, 5, 4.8].map((rating, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {['Cleanliness', 'Communication', 'Quality', 'Value'][idx]}
                      </span>
                      <span className="font-medium text-gray-900">{rating}</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${(rating/5)*100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCommentsPanel(true)}
                className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Show all {helper.reviewCount || '127'} reviews
              </button>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Main Booking Card */}
              <div className="border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-2xl font-semibold text-gray-900">R{helper.regularPrice || '850'}</span>
                    <span className="text-gray-600"> / session</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FaStar className="text-gray-900" />
                    <span className="font-semibold">{helper.rating || '4.92'}</span>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        className="w-full text-sm text-gray-600 outline-none mt-1"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold text-gray-900 uppercase">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        className="w-full text-sm text-gray-600 outline-none mt-1"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-900 uppercase">Service Type</label>
                    <select
                      name="photographyType"
                      value={bookingData.photographyType}
                      onChange={handleBookingChange}
                      className="w-full text-sm text-gray-600 outline-none mt-1 bg-transparent"
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map(opt => (
                        <option key={opt.id} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity mb-4"
                >
                  Check availability
                </button>

                <div className="text-center text-gray-600 text-sm mb-4">
                  You won't be charged yet
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="underline">R{helper.regularPrice || '850'} x 1 session</span>
                    <span>R{helper.regularPrice || '850'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="underline">Service fee</span>
                    <span>R0</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>R{helper.regularPrice || '850'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaPhone className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Contact directly</h3>
                    <p className="text-sm text-gray-600">Usually responds in 10 min</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=Hi ${helper.name}, I'm interested in your photography services.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <FaWhatsapp className="text-green-600 text-xl" />
                  Message on WhatsApp
                </a>
              </div>

              {/* Protection Badge */}
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <FaShieldAlt className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p>To protect your payment, never transfer money or communicate outside of the platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">
              R{helper.regularPrice?.toLocaleString() || '850'}
            </span>
            <span className="text-gray-600 text-sm">
              {' / session'}
            </span>
          </div>
          <button 
            onClick={handleQuickBooking}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <button
              onClick={closeImageModal}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>
            <span className="text-white font-medium">
              {selectedImageIndex + 1} / {images.length}
            </span>
          </div>
          
          <div className="h-full flex items-center justify-center p-4">
            <img
              src={images[selectedImageIndex]}
              alt={`Photo ${selectedImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <button
            onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <FaChevronLeft className="text-2xl" />
          </button>
          
          <button
            onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <FaChevronRight className="text-2xl" />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Complete your booking</h2>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={bookingData.name}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={bookingData.phone}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="071 234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={bookingData.date}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    required
                    value={bookingData.time}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location/Address</label>
                <input
                  type="text"
                  name="location"
                  value={bookingData.location}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Where should the shoot take place?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                <textarea
                  name="message"
                  value={bookingData.message}
                  onChange={handleBookingChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="text-xl" />
                Send booking request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelHelper
          helperId={helper._id}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}
    </div>
  );
}