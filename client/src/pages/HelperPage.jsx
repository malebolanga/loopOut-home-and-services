/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStar, FaMapMarkerAlt, FaPhone, FaUser,
  FaClock, FaShieldAlt, FaDog, FaUsers,
  FaGraduationCap, FaWhatsapp,
  FaCalendarAlt, FaExclamationTriangle, FaCheckCircle,
  FaThumbsUp, FaThumbsDown, FaRobot, FaExternalLinkAlt, FaArrowLeft,
  FaBandcamp, FaUtensils, FaCut, FaTools, FaCar, 
  FaInfoCircle, FaMoneyBillWave, FaPaperclip, FaTimes,
   FaFileImage, FaFilePdf, FaChevronDown, FaUserFriends, FaBroom,FaArrowUp ,FaArrowDown
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
  const [aiRating, setAiRating] = useState({
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
  const [commentAnalysis, setCommentAnalysis] = useState({});
  const [analyzingComments, setAnalyzingComments] = useState(false);

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

    // Upload files if any attachments
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

    // Create WhatsApp message with improved formatting
    let message = `📅 New Booking Request for *${helper.name}*%0A%0A`;

    // Service Details section
    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;

    // Add barber/beauty travel fee only for "Come to Client" appointments
    if (helper.type === 'barber' || helper.type === 'beauty') {
      if (helper.travelFee && bookingData.locationOption === 'comeToYou') {
        message += `• Travel Fee: R${helper.travelFee}%0A`;
      }
    }

    message += `• Provider Contact: ${helper.contact}%0A%0A`;

    // Client Booking Details section
    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;

    // Add location option to message
    const locationDisplay = bookingData.locationOption === 'comeToYou' 
      ? 'Come to Client' 
      : bookingData.locationOption === 'goToSalon' 
        ? 'Go to Salon' 
        : "Helper's Place";

    message += `• Location: ${locationDisplay}%0A`;

    // Explain travel fee logic in the message
    if (helper.type === 'barber' || helper.type === 'beauty') {
      if (locationDisplay === 'Come to Client' && helper.travelFee) {
        message += `  _(Travel fee applies for home visits)_%0A`;
      } else {
        message += `  _(No travel fee - client visits ${locationDisplay === "Helper's Place" ? "helper" : "salon"})_%0A`;
      }
    }

    message += `• Food/Drinks: ${bookingData.bringFood === 'yes' ? 'Yes' : 'No'}%0A`;
    message += `• Special Requests: ${bookingData.message || 'None'}%0A%0A`;

    // Only include address if location is "Come to Client"
    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      const mapLink = generateMapLink(bookingData.address);
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      message += `• Navigation Link:%0A  ${mapLink}%0A%0A`;
    }

    // Attachment section with clickable links
    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A`;
      message += `_Files uploaded for your reference_%0A%0A`;

      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: `;
        message += `${file.name}%0A`;
        message += `  ${file.url}%0A%0A`;
      });
    }

    // Action buttons with clear separation - UPDATED WITH CLEARER INSTRUCTIONS
    message += `*❓ HOW TO RESPOND*%0A`;
    message += `✅ To *ACCEPT* this booking, please reply with:%0A`;
    message += `   *ACCEPT*%0A%0A`;
    message += `❌ To *DECLINE* this booking, please reply with:%0A`;
    message += `   *DECLINE*%0A%0A`;
    message += `💬 Or reply with a custom message if you have questions%0A%0A`;
    message += `_Please respond within 24 hours to confirm this booking_%0A%0A`;
    message += `_This message was sent via Booking System_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Clear attachments after submission
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
                  <h1 className="text-2xl md:text-3xl font-bold text-dark flex-1 min-w-0 line-clamp-2 overflow-hidden text-ellipsis break-words">
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
                <div className="flex items-center justify-between gap-4">
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
                  className="h-64 w-100% sm:h-80 md:h-[450px] lg:h-[500px]"
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

          {/* Services Offered Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Services Offered</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{helper.near}</p>
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
                    <span>Education Level: {helper.kind}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaUsers className="text-airbnb-red" />
                    <span>Teaching Format: {helper.bathrooms === 1 ? 'In-person' : helper.bathrooms === 2 ? 'Online' : 'Both'}</span>
                  </li>
                </>
              )}
            </ul>
          </section>

          {/* Barber Details Section */}
          {helper.type === 'barber' && (
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Barber Details</h2>
              <ul className="space-y-3">
                {helper.specializations && (
                  <li className="flex items-start gap-3">
                    <FaCut className="text-airbnb-red mt-1" />
                    <span>Specializations: {helper.specializations}</span>
                  </li>
                )}
                {helper.equipment && (
                  <li className="flex items-start gap-3">
                    <FaTools className="text-airbnb-red mt-1" />
                    <span>Equipment: {helper.equipment}</span>
                  </li>
                )}
                {helper.travelFee && (
                  <li className="flex items-start gap-3">
                    <FaCar className="text-airbnb-red mt-1" />
                    <span>Travel Fee: R{helper.travelFee}</span>
                  </li>
                )}
                {helper.bookingNotice && (
                  <li className="flex items-start gap-3">
                    <FaInfoCircle className="text-airbnb-red mt-1" />
                    <span>Booking Notice: {helper.bookingNotice} hours</span>
                  </li>
                )}
                {helper.additionalPricing && (
                  <li className="flex items-start gap-3">
                    <FaMoneyBillWave className="text-airbnb-red mt-1" />
                    <span>Additional Pricing: {helper.additionalPricing}</span>
                  </li>
                )}
              </ul>
            </section>
          )}

          {/* Guest Reviews Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Guest Reviews</h2>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
                <span className="mx-1">·</span>
                <span className="text-gray-600">{commentCount} reviews</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Review Highlights */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Review Highlights</h3>
                <div className="space-y-4">
                  {Object.entries(aiRating.categoryRatings).map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        {category === 'cleanliness' ? (
                          <FaBroom className="mr-2 text-blue-500" />
                        ) : (
                          <FaUserFriends className="mr-2 text-blue-500" />
                        )}
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(rating / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Recent Reviews</h3>
                  {commentCount > 2 && (
                    <button
                      onClick={() => setShowCommentsPanel(true)}
                      className="text-blue-600 hover:underline flex items-center text-sm"
                    >
                      View all <FaChevronDown className="ml-1 text-xs" />
                    </button>
                  )}
                </div>

                <HelperComments 
                  helperId={id} 
                  maxComments={2}
                  onTotalComments={setCommentCount} 
                  cardStyle={true}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Booking Card & Provider Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Booking Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden lg:sticky lg:top-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Booking {helper.name}</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600 text-lg">Service Price:</span>
                  <span className="text-3xl font-extrabold text-airbnb-red">R{helper.regularPrice}</span>
                </div>
                
                {/* Show travel fee only for barbers when "Come to Me" is selected */}
                {helper.type === 'barber' && 
                  helper.travelFee && 
                  bookingData.locationOption === 'comeToYou' && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600 text-lg">Travel Fee:</span>
                    <span className="text-xl font-bold text-gray-700">R{helper.travelFee}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Host information */}
              <div className="flex items-center gap-3 text-gray-700">
                <FaBandcamp className="text-airbnb-red text-xl" />
                <span className="font-medium">Experience: {helper.host}</span>
              </div>

              {/* Contact Information */}
              {helper.contact && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaPhone className="text-airbnb-red text-xl" />
                  <span className="font-medium">Contact: {helper.contact}</span>
                </div>
              )}

              {/* Availability Period */}
              {helper.period && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaClock className="text-airbnb-red text-xl" />
                  <span className="font-medium">Availability: {helper.period}</span>
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="pt-4 space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="name"
                    value={bookingData.name}
                    onChange={handleBookingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="John Doe"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="userPhone"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleBookingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="+27 12 345 6789"
                  />
                </div>

                {/* NEW: Location Option */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="text-airbnb-red" />
                    <label className="block text-sm font-medium text-gray-700">
                      Service Location
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="locationOption"
                        value="comeToYou"
                        checked={bookingData.locationOption === 'comeToYou'}
                        onChange={handleBookingChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-800">Come to Me</span>
                        <p className="text-xs text-gray-500 mt-1">Helper comes to your location</p>
                      </div>
                    </label>

                    {/* Only show Salon option for beauty and barber helpers */}
                    {(helper.type === 'beauty' || helper.type === 'barber') && (
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="locationOption"
                          value="goToSalon"
                          checked={bookingData.locationOption === 'goToSalon'}
                          onChange={handleBookingChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-800">Go to Salon</span>
                          <p className="text-xs text-gray-500 mt-1">You go to helpers salon</p>
                        </div>
                      </label>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="locationOption"
                        value="helperPlace"
                        checked={bookingData.locationOption === 'helperPlace'}
                        onChange={handleBookingChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-800">Helpers Place</span>
                        <p className="text-xs text-gray-500 mt-1">You go to helpers location</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Conditionally render address field */}
                {bookingData.locationOption === 'comeToYou' && (
                  <div>
                    <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="userAddress"
                        name="address"
                        value={bookingData.address}
                        onChange={handleBookingChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                        placeholder="123 Main St, City"
                        required
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Map preview link */}
                    {bookingData.address && (
                      <div className="mt-2 text-right">
                        <a
                          href={generateMapLink(bookingData.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          View on Map <FaExternalLinkAlt className="ml-1 text-xs" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="bookingDate"
                      name="date"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      id="bookingTime"
                      name="time"
                      value={bookingData.time}
                      onChange={handleBookingChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                      required
                    />
                    <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Bring Your Food Option */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaUtensils className="text-airbnb-red" />
                    <label className="block text-sm font-medium text-gray-700">
                      Food available?
                    </label>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="bringFood"
                        value="yes"
                        checked={bookingData.bringFood === 'yes'}
                        onChange={handleBookingChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Yes</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="bringFood"
                        value="no"
                        checked={bookingData.bringFood === 'no'}
                        onChange={handleBookingChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="message"
                    value={bookingData.message}
                    onChange={handleBookingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows="3"
                    placeholder="E.g., specific requirements, arrival instructions..."
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                    Attach Files (Optional)
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type="file"
                        id="attachments"
                        name="attachments"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleAttachmentChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 opacity-0 absolute inset-0 z-10 cursor-pointer"
                      />
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FaPaperclip className="mx-auto text-gray-400 text-xl mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Images or PDF (max 2 files, 5MB each)</p>
                      </div>
                    </div>

                    {/* Preview section */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center border rounded-lg p-2 bg-gray-50">
                          <div className="flex-shrink-0 mr-2">
                            {file.type.startsWith('image/') ? (
                              <FaFileImage className="text-blue-500" />
                            ) : (
                              <FaFilePdf className="text-red-500" />
                            )}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-medium truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-gray-700 ml-2"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md`}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading Files...
                    </span>
                  ) : (
                    'Book via WhatsApp'
                  )}
                </button>
              </form>

              {/* Update Helper Button */}
              {currentUser && currentUser._id === helper.userRef && (
                <button
                  onClick={() => navigate(`/update-helper/${helper._id}`)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                  Update Helper Listing
                </button>
              )}
            </div>
          </div>

          {/* Provider Info Sidebar */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 lg:sticky lg:top-[calc(100vh-400px)]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">About {helper.name}</h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaUser className="text-3xl text-airbnb-red" />
              </div>
              <div>
                <h4 className="text-sm font-semibold truncate">{helper.host.slice(0, 31)}</h4>
                <p className="text-gray-600 text-xs">Pro helper</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Call Helper Button */}
              {helper.contact && (
                <a
                  href={`tel:${helper.contact}`}
                  className="flex items-center justify-center gap-2 w-full bg-airbnb-red text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
                >
                  <FaPhone />
                  <span>Call Helper</span>
                </a>
              )}

              {/* WhatsApp Button */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                >
                  <FaWhatsapp />
                  <span>Message on WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelHelper 
          helperId={id} 
          onClose={() => setShowCommentsPanel(false)} 
        />
      )}
    </div>
  );
}