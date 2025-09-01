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

    const userPhoneForReply = bookingData.phone ? formatContactForWhatsApp(bookingData.phone) : '';
    const acceptText = `Hi ${bookingData.name}, I accept your booking for ${helper.name} on ${bookingData.date} at ${bookingData.time}. See you then!`;
    const declineText = `Hi ${bookingData.name}, I'm unable to accept ${bookingData.date} at ${bookingData.time}. Can we try another time?`;

    const acceptLink = userPhoneForReply
      ? `https://wa.me/${userPhoneForReply}?text=${encodeURIComponent(acceptText)}`
      : '';
    const declineLink = userPhoneForReply
      ? `https://wa.me/${userPhoneForReply}?text=${encodeURIComponent(declineText)}`
      : '';

    let message = `📅 New Booking Request for *${helper.name}*%0A%0A`;
    message += `*🛎️ SERVICE DETAILS*%0A`;
    message += `• Price: R${helper.regularPrice}%0A`;
    if ((helper.type === 'barber' || helper.type === 'beauty') &&
        helper.travelFee &&
        bookingData.locationOption === 'comeToYou') {
      message += `• Travel Fee: R${helper.travelFee}%0A`;
    }
    message += `• Provider Contact: ${helper.contact}%0A%0A`;

    message += `*👤 CLIENT DETAILS*%0A`;
    message += `• Name: ${bookingData.name}%0A`;
    message += `• Phone: ${bookingData.phone || 'Not provided'}%0A`;
    message += `• Date: ${bookingData.date}%0A`;
    message += `• Time: ${bookingData.time}%0A`;

    const locationDisplay =
      bookingData.locationOption === 'comeToYou'
        ? 'Come to Client'
        : bookingData.locationOption === 'goToSalon'
        ? 'Go to Salon'
        : "Helper's Place";

    message += `• Location: ${locationDisplay}%0A`;
    if (helper.type === 'barber' || helper.type === 'beauty' || helper.type === 'domestic' || helper.type === 'maid') {
      if (locationDisplay === 'Come to Client' && helper.travelFee) {
        message += `  _(Travel fee applies for home visits)_%0A`;
      } else {
        message += `  _(No travel fee - client visits ${locationDisplay === "Helper's Place" ? "helper" : "salon"})_%0A`;
      }
    }

    message += `• Food/Drinks: ${bookingData.bringFood === 'yes' ? 'Yes' : 'No'}%0A`;
    message += `• Special Requests: ${bookingData.message || 'None'}%0A%0A`;

    if (bookingData.locationOption === 'comeToYou' && bookingData.address) {
      const mapLink = generateMapLink(bookingData.address);
      message += `*📍 LOCATION DETAILS*%0A`;
      message += `• Full Address:%0A  ${bookingData.address.replace(/,/g, '%0A  ')}%0A`;
      message += `• Navigation Link:%0A  ${mapLink}%0A%0A`;
    }

    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A_Files uploaded for your reference_%0A%0A`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: ${file.name}%0A`;
        message += `  ${file.url}%0A%0A`;
      });
    }

    if (bookingData.locationOption === 'comeToYou' && acceptLink && declineLink) {
      message += `*ACTION REQUIRED*%0A`;
      message += `Tap a link to reply to the client:%0A%0A`;
      message += `✅ Accept: ${acceptLink}%0A`;
      message += `❌ Decline: ${declineLink}%0A%0A`;
    }

    message += `💬 You can also reply directly to this message.%0A%0A`;
    message += `_Sent via loopOut Booking System_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(helper.contact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

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
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back"
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">R{helper.regularPrice}</p>
                <p className="text-gray-600 text-sm">per service</p>
              </div>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-medium">{Number(aiRating.average).toFixed(1)}</span>
                <span className="mx-1">·</span>
                <span className="text-gray-600">{commentCount} reviews</span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={bookingData.name}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                  required
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
                  value={bookingData.phone}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                  required
                />
              </div>

              {/* Location Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Preference
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
                      value="goToSalon"
                      checked={bookingData.locationOption === 'goToSalon'}
                      onChange={handleBookingChange}
                      className="mr-2"
                    />
                    <span>I ll go to their salon</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="locationOption"
                      value="helpersPlace"
                      checked={bookingData.locationOption === 'helpersPlace'}
                      onChange={handleBookingChange}
                      className="mr-2"
                    />
                    <span>Helpers place</span>
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
                    value={bookingData.address}
                    onChange={handleBookingChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-airbnb-red focus:border-airbnb-red"
                    required
                    placeholder="Please provide your full address for the service"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Would you like to offer food/drinks?
                </label>
                <div className="flex gap-4">
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
                  placeholder="Any special requests or details the helper should know about"
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Files (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-airbnb-red hover:text-red-500 focus-within:outline-none"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          onChange={handleAttachmentChange}
                          className="sr-only"
                          accept="image/*,.pdf"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 5MB (max 2 files)
                    </p>
                  </div>
                </div>

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {file.type.startsWith('image/') ? (
                            <FaFileImage className="text-blue-500 mr-2" />
                          ) : (
                            <FaFilePdf className="text-red-500 mr-2" />
                          )}
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
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

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-airbnb-red hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading files...
                  </span>
                ) : (
                  'Send Booking Request via WhatsApp'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By booking, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
             <div className="p-6 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-2">What s included</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Secure booking through WhatsApp</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Direct communication with provider</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>No booking fees</span>
                </li>
              </ul>
            </div>
          </div>


          {/* Provider Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Provider Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FaUser className="text-airbnb-red mr-3" />
                <div>
                  <p className="font-medium">{helper.name}</p>
                  <p className="text-sm text-gray-600">Service Provider</p>
                </div>
              </div>

              {helper.contact && (
                <div className="flex items-center">
                  <FaPhone className="text-airbnb-red mr-3" />
                  <div>
                    <p className="font-medium">{helper.contact}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>
              )}

              {helper.address && (
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-airbnb-red mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{helper.address}</p>
                    <p className="text-sm text-gray-600">Location</p>
                  </div>
                </div>
              )}

              {helper.type && (
                <div className="flex items-center">
                  <FaBandcamp className="text-airbnb-red mr-3" />
                  <div>
                    <p className="font-medium capitalize">{helper.type}</p>
                    <p className="text-sm text-gray-600">Service Type</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Response Time</h4>
              <p className="text-sm text-gray-600">Typically responds within a few hours</p>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Safety Tips</h3>
            
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <FaShieldAlt className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Never pay in advance for services</span>
              </li>
              <li className="flex items-start">
                <FaUsers className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Meet in public places for the first meeting</span>
              </li>
              <li className="flex items-start">
                <FaExclamationTriangle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Trust your instincts and report suspicious behavior</span>
              </li>
            </ul>
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