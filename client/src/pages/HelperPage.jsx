/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaUser,
  FaClock, FaShieldAlt, FaDog, FaUsers,
  FaGraduationCap, FaWhatsapp,
  FaExclamationTriangle, FaCheckCircle,
    FaRobot,  FaArrowLeft,
  FaBandcamp, FaCut, FaTools, FaCar, 
  FaInfoCircle, FaMoneyBillWave,  FaTimes,
  FaFileImage, FaFilePdf, FaChevronDown, FaUserFriends, FaBroom, FaArrowUp, FaArrowDown,
  FaCalendar, FaEnvelope, FaBriefcase, FaAward
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import HelperComments from '../components/HelperComments';
import CommentsSidePanelHelper from '../components/CommentsSidePanelHelper';

export default function HelperPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [aiRating] = useState({
    average: 4.5,
    categoryRatings: {
      cleanliness: 4.7,
      communication: 4.6,
      kidsCare: 4.8,
      punctuality: 4.9,
      staff: 4.3
    }
  });

  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    bringFood: 'no',
    message: '',
    locationOption: 'comeToYou'
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // AI Assessment States
  const [aiAssessment, setAiAssessment] = useState({
    descriptionQuality: null,
    imageQuality: null,
    overallRating: null,
    likes: 0,
    dislikes: 0,
    userReaction: null
  });

  // AI Review for Comments
  const [ setCommentAnalysis] = useState({});
  const [ setAnalyzingComments] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/helper/get/${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch helper details');
        }

        const data = await res.json();
        setHelper(data);

        // Simulate AI assessment on data load
        simulateAiAssessment(data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchHelper();
  }, [id]);

  // Simulate AI assessment of helper content
  const simulateAiAssessment = (helperData) => {
    // Simulate processing delay
    setTimeout(() => {
      const description = helperData.description || '';

      // Calculate description quality based on length and keywords
      let descScore = 0;
      if (description.length > 200) descScore += 2;
      if (description.length > 500) descScore += 1;
      if (description.includes("experience") || description.includes("professional")) descScore += 1;
      if (description.includes("certified") || description.includes("qualified")) descScore += 1;

      // Calculate image quality based on number of images
      let imgScore = 0;
      if (helperData.imageUrls?.length > 0) imgScore = 3;
      if (helperData.imageUrls?.length > 2) imgScore = 4;
      if (helperData.imageUrls?.length > 4) imgScore = 5;

      // Overall rating (weighted average)
      const overall = Math.min(5, (descScore + imgScore) / 2);

      // Random likes/dislikes count
      const likes = Math.floor(Math.random() * 50) + 10;
      const dislikes = Math.floor(Math.random() * 10);

      setAiAssessment({
        descriptionQuality: descScore,
        imageQuality: imgScore,
        overallRating: overall,
        likes,
        dislikes,
        userReaction: null
      });
    }, 1500);
  };

  // Format phone numbers for WhatsApp
  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const contactStr = String(contact);
    const digitsOnly = contactStr.replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) {
      return '27' + digitsOnly.substring(1);
    }
    return digitsOnly;
  };

  // Generate Google Maps link from address
  const generateMapLink = (address) => {
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  // Handle file attachments
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isSizeValid = file.size <= 5 * 1024 * 1024; // 5MB

      return (isImage || isPDF) && isSizeValid;
    });

    // Limit to 2 files
    const newAttachments = [...attachments, ...validFiles].slice(0, 2);
    setAttachments(newAttachments);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Upload files to cloud storage (mock implementation)
  const uploadFilesToCloud = async (files) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return files.map(file => {
      // Create a mock URL for demonstration
      const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
      return {
        name: file.name,
        url: mockUrl,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        size: file.size
      };
    });
  };

  // Handle form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!helper?.contact) {
      alert("Helper contact information is missing. Please try another contact method.");
      return;
    }

    let uploadedFiles = [];

    if (attachments.length > 0) {
      setIsUploading(true);
      try {
        uploadedFiles = await uploadFilesToCloud(attachments);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload attachments. Please try again without files or contact support.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Format the client's phone number for the reply link
    const clientPhone = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';

    // Define the accept and decline messages and their corresponding links
    const acceptMessage = `Hi ${bookingData.name}, I accept your booking for ${helper.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineMessage = `Hi ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMessage)}` : '';
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMessage)}` : '';

    // Determine the location and travel fee message
    let locationInfo = '';
    let travelFeeMessage = '';
    const isHomeVisit = bookingData.locationOption === 'comeToYou';
    const hasTravelFee = helper.travelFee > 0 && isHomeVisit;

    if (isHomeVisit) {
      locationInfo = 'Come to Client';
      if (hasTravelFee) {
        travelFeeMessage = `• Travel Fee: R${helper.travelFee}%0A`;
      }
    } else if (bookingData.locationOption === 'comeToYou') {
      locationInfo = 'Come to Client';
    } else {
      locationInfo = "Helper's Place";
    }

    // Build the main WhatsApp message
    let message = `*📅 New Booking Request for ${helper.name}*%0A%0A`;

    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;
    if (hasTravelFee) {
      message += travelFeeMessage;
    }
    message += `• Provider Contact: ${helper.contact}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;
    message += `• Location: ${locationInfo}%0A`;
    message += `• Food/Drinks: ${bookingData.bringFood === 'yes' ? 'Yes' : 'No'}%0A`;
    message += `• Special Requests: ${bookingData.message || 'None'}%0A%0A`;

    // Add location details for home visits
    if (isHomeVisit && bookingData.address) {
      const mapLink = generateMapLink(bookingData.address);
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      message += `• Navigation Link:%0A  ${mapLink}%0A%0A`;
    }

    // Add attachments if they exist
    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A_Files uploaded for your reference_%0A%0A`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: ${file.name}%0A`;
        message += `  ${file.url}%0A%0A`;
      });
    }

    // Add action links for the helper to accept or decline
    message += `*ACTION REQUIRED*%0A`;
    message += `Tap a link to reply to the client:%0A%0A`;
    if (acceptLink) {
      message += `✅ Accept: ${acceptLink}%0A`;
    }
    if (declineLink) {
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `💬 You can also reply directly to this message.%0A%0A`;
    message += `_Sent via loopOut Booking System_`;

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Reset attachments after sending
    setAttachments([]);
  };

  // Simulate AI analysis of comments
  const analyzeCommentsWithAI = () => {
    setAnalyzingComments(true);

    // Simulate API call to AI service
    setTimeout(() => {
      // Generate random quality scores for comments
      const analysis = {};
      const comments = document.querySelectorAll('.comment-item');

      comments.forEach((_, index) => {
        const qualityScore = Math.floor(Math.random() * 40) + 60; // 60-100%
        const sentiment = qualityScore > 80 ? 'positive' :
          qualityScore > 60 ? 'neutral' : 'negative';

        analysis[index] = { qualityScore, sentiment };
      });

      setCommentAnalysis(analysis);
      setAnalyzingComments(false);
    }, 2000);
  };

  const handleLike = () => {
    setAiAssessment(prev => ({
      ...prev,
      likes: prev.userReaction === 'like' ? prev.likes - 1 :
        prev.userReaction === 'dislike' ? prev.likes + 1 : prev.likes + 1,
      dislikes: prev.userReaction === 'dislike' ? prev.dislikes - 1 : prev.dislikes,
      userReaction: prev.userReaction === 'like' ? null : 'like'
    }));
  };

  const handleDislike = () => {
    setAiAssessment(prev => ({
      ...prev,
      dislikes: prev.userReaction === 'dislike' ? prev.dislikes - 1 :
        prev.userReaction === 'like' ? prev.dislikes + 1 : prev.dislikes + 1,
      likes: prev.userReaction === 'like' ? prev.likes - 1 : prev.likes,
      userReaction: prev.userReaction === 'dislike' ? null : 'dislike'
    }));
  };

  const whatsappNumber = helper ? formatContactForWhatsApp(helper.contact) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi ${helper.name}, I'm interested in your services.`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-airbnb-red"></div>
        <p className="ml-4 text-lg text-gray-700">Loading helper details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading helper</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Helper not found</h2>
          <p className="mt-2 text-gray-600">The helper you re looking for doesn t exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  const description = helper.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Button */}
      <div className="fixed bottom-4 left-4 z-50">
       <button
                onClick={() => {
                  const routeMap = {
      
                    default: '/helper-home-page'
                  };
                  navigate(routeMap[helper?.type?.toLowerCase()] || routeMap.default);
                }}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Go back to listings"
              >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Floating Action Buttons */}
      {(helper.contact || whatsappNumber) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 sm:flex-row">
          {helper.contact && (
            <a
              href={`tel:${helper.contact}`}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label="Call Helper"
            >
              <FaPhone className="text-2xl" />
            </a>
          )}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label="WhatsApp Helper"
            >
              <FaWhatsapp className="text-2xl" />
            </a>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-dark flex-1 min-w-0 overflow-hidden text-ellipsis break-words">
                    {helper.name}
                  </h1>
                  {helper.security && (
                    <span className="inline-flex items-center bg-airbnb-red bg-opacity-10 text-airbnb-red px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 mt-1">
                      <span className="mr-1">✅</span> Verified
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Rating Badge */}
                  <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-full border border-airbnb-medium-gray">
                    <span className="font-medium text-airbnb-dark">
                      {helper.rating ? (
                        <>
                          <span className="font-semibold">{helper.rating}</span>
                          <span className="text-airbnb-gray ml-1">Stars</span>
                        </>
                      ) : (
                        <span className="text-airbnb-blue">✨ New Helper</span>
                      )}
                    </span>
                  </div>

                  {/* Location Badge */}
                  <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-full border border-airbnb-medium-gray">
                    <span className="text-airbnb-red mr-1.5">📍</span>
                    <span className="font-medium text-airbnb-dark truncate max-w-[160px]">
                      {helper.address}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Rating Widgets */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 w-full sm:w-auto">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Like/Dislike Widget */}
                  <div className="flex flex-col items-center">
                    <div className="flex gap-3 mb-1">
                      <button
                        onClick={handleLike}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          aiAssessment.userReaction === 'like' 
                            ? 'bg-green-100 text-green-600 shadow-md shadow-green-100' 
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <span className="text-xl">👍</span>
                      </button>
                      <button
                        onClick={handleDislike}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          aiAssessment.userReaction === 'dislike' 
                            ? 'bg-red-100 text-red-600 shadow-md shadow-red-100' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <span className="text-xl">👎</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-green-600 font-medium text-sm flex items-center">
                        <FaArrowUp className="mr-1" /> {aiAssessment.likes}
                      </span>
                      <span className="text-red-600 font-medium text-sm flex items-center">
                        <FaArrowDown className="mr-1" /> {aiAssessment.dislikes}
                      </span>
                    </div>
                  </div>

                  {/* AI Rating */}
                  <div className="text-center px-3">
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium mb-1">
                      <span className="text-lg">🤖</span>
                      <span>AI Rating</span>
                    </div>
                    {aiAssessment.overallRating ? (
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-2xl font-bold text-gray-900 leading-none">
                          {aiAssessment.overallRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-sm mb-1">/5</span>
                      </div>
                    ) : (
                      <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse mx-auto"></div>
                    )}
                  </div>

                  {/* User Reviews */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 text-sm font-medium mb-1">
                      <span className="text-lg">reviews</span>
                    </div>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-2xl font-bold text-gray-900 leading-none">
                        {commentCount} 
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {helper.imageUrls && helper.imageUrls.length > 0 ? (
              <>
                <Swiper
                  modules={[Navigation, Thumbs, Zoom]}
                  navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
                  thumbs={{ swiper: thumbsSwiper }}
                  zoom={true}
                  className="h-64 w-full sm:h-80 md:h-[450px] lg:h-[500px]"
                >
                  {helper.imageUrls.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container w-full h-full">
                        <img
                          src={img}
                          alt={`Helper image ${index + 1}`}
                          className="block w-full h-full object-cover cursor-zoom-in"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                  <div className="swiper-button-prev custom-swiper-nav-btn left-2"></div>
                  <div className="swiper-button-next custom-swiper-nav-btn right-2"></div>
                </Swiper>

                {helper.imageUrls.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    className="mt-4 h-20"
                  >
                    {helper.imageUrls.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="block w-full h-full object-cover rounded-lg cursor-pointer opacity-70 hover:opacity-100 transition-opacity border border-gray-200"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-500 text-lg">
                No images available
              </div>
            )}
          </div>

          {/* About Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">About {helper.name}</h2>

            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{displayText}</p>
            </div>

            {description.length > 300 && (
              <button
                onClick={toggleDescription}
                className="mt-3 text-airbnb-red hover:text-red-700 font-medium flex items-center"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </button>
            )}
          </section>

          {/* Contact & Availability Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact & Availability</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Contact Details</h3>
                <ul className="space-y-3">
                  {helper.contact && (
                    <li className="flex items-center gap-3">
                      <FaPhone className="text-airbnb-red" />
                      <span className="text-gray-700">{helper.contact}</span>
                    </li>
                  )}
                  {helper.email && (
                    <li className="flex items-center gap-3">
                      <FaEnvelope className="text-airbnb-red" />
                      <span className="text-gray-700">{helper.email}</span>
                    </li>
                  )}
                  {helper.address && (
                    <li className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-airbnb-red mt-1" />
                      <span className="text-gray-700">{helper.address}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Availability Information */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Availability</h3>
                <ul className="space-y-3">
                  {helper.period && (
                    <li className="flex items-center gap-3">
                      <FaClock className="text-airbnb-red" />
                      <span className="text-gray-700">{helper.period}</span>
                    </li>
                  )}
                  {helper.availability && (
                    <li className="flex items-center gap-3">
                      <FaCalendar className="text-airbnb-red" />
                      <span className="text-gray-700">{helper.availability}</span>
                    </li>
                  )}
                  {helper.responseTime && (
                    <li className="flex items-center gap-3">
                      <FaClock className="text-airbnb-red" />
                      <span className="text-gray-700">Response time: {helper.responseTime}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Services & Location Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Services & Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Services Offered */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Services Offered</h3>
                {helper.near ? (
                  <p className="text-gray-700">{helper.near}</p>
                ) : (
                  <p className="text-gray-500">No specific services listed</p>
                )}
                
                {helper.specializations && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Specializations</h4>
                    <p className="text-gray-700">{helper.specializations}</p>
                  </div>
                )}
              </div>

              {/* Location Details */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Service Area</h3>
                {helper.serviceArea && (
                  <p className="text-gray-700">{helper.serviceArea}</p>
                )}
                
                {helper.travelFee && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Travel Fees</h4>
                    <p className="text-gray-700">R{helper.travelFee} for travel outside service area</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Experience & Qualifications Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Experience & Qualifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FaBriefcase className="text-airbnb-red" />
                  Experience
                </h3>
                {helper.experience ? (
                  <p className="text-gray-700">{helper.experience}</p>
                ) : (
                  <p className="text-gray-500">No experience information provided</p>
                )}
                
                {helper.yearsExperience && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Years of Experience</h4>
                    <p className="text-gray-700">{helper.yearsExperience} years</p>
                  </div>
                )}
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FaAward className="text-airbnb-red" />
                  Qualifications
                </h3>
                {helper.qualifications ? (
                  <p className="text-gray-700">{helper.qualifications}</p>
                ) : (
                  <p className="text-gray-500">No qualifications listed</p>
                )}
                
                {helper.certifications && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Certifications</h4>
                    <p className="text-gray-700">{helper.certifications}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* AI Content Assessment */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FaRobot className="text-blue-600 text-xl" />
              <h2 className="text-2xl font-semibold text-gray-800">AI Content Assessment</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Description Quality</h3>
                {aiAssessment.descriptionQuality !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-700">{aiAssessment.descriptionQuality}</span>
                    <span className="text-gray-600">/5</span>
                    <div className="ml-auto">
                      {aiAssessment.descriptionQuality >= 4 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Excellent</span>
                      ) : aiAssessment.descriptionQuality >= 3 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Good</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Needs Improvement</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                )}
                <p className="text-gray-600 mt-2 text-sm">
                  Based on detail level, clarity, and professionalism
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Image Quality</h3>
                {aiAssessment.imageQuality !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-700">{aiAssessment.imageQuality}</span>
                    <span className="text-gray-600">/5</span>
                    <div className="ml-auto">
                      {aiAssessment.imageQuality >= 4 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Excellent</span>
                      ) : aiAssessment.imageQuality >= 3 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Good</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Needs More</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                )}
                <p className="text-gray-600 mt-2 text-sm">
                  Based on image count, clarity, and relevance
                </p>
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FaClock className="text-airbnb-red" />
                <span>Availability: {helper.period || 'Flexible'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaShieldAlt className="text-airbnb-red" />
                <span>Background Check: {helper.security ? 'Verified' : 'Not Verified'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaDog className="text-airbnb-red" />
                <span>Pets: {helper.pets ? 'Comfortable with pets' : 'Not comfortable with pets'}</span>
              </li>
              {helper.type === 'tutor' && (
                <>
                  <li className="flex items-center gap-3">
                    <FaGraduationCap className="text-airbnb-red" />
                    <span>Education Level: {helper.educationLevel || 'Not specified'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaUsers className="text-airbnb-red" />
                    <span>Group Sessions: {helper.groupSessions ? 'Available' : 'Not available'}</span>
                  </li>
                </>
              )}
            </ul>
          </section>

          {/* Comments Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Reviews & Feedback</h2>
              <button
                onClick={() => setShowCommentsPanel(true)}
                className="text-airbnb-red hover:text-red-700 font-medium"
              >
                View All
              </button>
            </div>
            <HelperComments helperId={id} onCommentCountChange={setCommentCount} />
          </section>
        </div>

        {/* Right Column - Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">R{helper.regularPrice}</span>
                <span className="text-gray-600 text-sm">per {helper.type === 'tutor' ? 'hour' : 'service'}</span>
              </div>

              {helper.travelFee > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Travel fee: <span className="font-medium">R{helper.travelFee}</span> may apply for locations outside service area
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={bookingData.name}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={bookingData.phone}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Location
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locationOption"
                        value="comeToYou"
                        checked={bookingData.locationOption === 'comeToYou'}
                        onChange={handleBookingChange}
                        className="mr-2"
                      />
                      <span>Come to my location</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locationOption"
                        value="goToHelper"
                        checked={bookingData.locationOption === 'goToHelper'}
                        onChange={handleBookingChange}
                        className="mr-2"
                      />
                      <span>I ll go to helper s place</span>
                    </label>
                  </div>
                </div>

                {bookingData.locationOption === 'comeToYou' && (
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      value={bookingData.address}
                      onChange={handleBookingChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                      placeholder="Enter your full address"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      required
                      value={bookingData.time}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Would you like to bring food/drinks?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bringFood"
                        value="yes"
                        checked={bookingData.bringFood === 'yes'}
                        onChange={handleBookingChange}
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bringFood"
                        value="no"
                        checked={bookingData.bringFood === 'no'}
                        onChange={handleBookingChange}
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={bookingData.message}
                    onChange={handleBookingChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Files (Optional)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleAttachmentChange}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <label
                      htmlFor="attachments"
                      className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-airbnb-red transition-colors"
                    >
                      <FaFileImage className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Select images or PDFs</span>
                    </label>

                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center">
                              {file.type.startsWith('image/') ? (
                                <FaFileImage className="text-blue-500 mr-2" />
                              ) : (
                                <FaFilePdf className="text-red-500 mr-2" />
                              )}
                              <span className="text-sm text-gray-700 truncate max-w-[120px]">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-airbnb-red hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading Files...' : 'Send Booking via WhatsApp'}
                </button>
              </form>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">About the Host</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaUser className="text-airbnb-red" />
                  <span className="text-gray-700">{helper.name}</span>
                </div>
                {helper.responseTime && (
                  <div className="flex items-center gap-3">
                    <FaClock className="text-airbnb-red" />
                    <span className="text-gray-700">Response time: {helper.responseTime}</span>
                  </div>
                )}
                {helper.experience && (
                  <div className="flex items-center gap-3">
                    <FaBriefcase className="text-airbnb-red" />
                    <span className="text-gray-700">Experience: {helper.experience}</span>
                  </div>
                )}
                {helper.languages && (
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-airbnb-red" />
                    <span className="text-gray-700">Languages: {helper.languages}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <FaShieldAlt />
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Always meet in public places first</li>
                <li>• Verify the helpers identity</li>
                <li>• Don t pay the full amount upfront</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Side Panel */}
      <CommentsSidePanelHelper
        isOpen={showCommentsPanel}
        onClose={() => setShowCommentsPanel(false)}
        helperId={id}
      />
    </div>
  );
}