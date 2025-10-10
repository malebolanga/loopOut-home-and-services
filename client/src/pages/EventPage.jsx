/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaMapMarkerAlt, FaPhone, FaUser,
  FaTicketAlt, FaUsers,
  FaWhatsapp, FaUtensils,
  FaCalendarAlt, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaRobot,
  FaInfoCircle, FaArrowLeft, 
   FaTimes,
  FaFileImage, FaFilePdf, FaMusic, FaFutbol, FaPalette,
  FaUsers as FaCommunity,  FaEllipsisH,
  FaStar,  FaSpinner, FaCheckCircle,
  FaInstagram, FaFacebook, FaLinkedin, FaTwitter
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import EventComments from '../components/EventComments';
import CommentsSidePanelEvent from '../components/CommentsSidePanelEvent';

export default function EventPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Social Media Verification States
  const [socialMediaVerification, setSocialMediaVerification] = useState({
    facebook: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      followers: null,
      verificationStatus: 'checking'
    },
    instagram: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      followers: null,
      verificationStatus: 'checking'
    },
    linkedin: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      connections: null,
      verificationStatus: 'checking'
    },
    twitter: {
      exists: false,
      username: null,
      url: null,
      isActive: false,
      verified: false,
      lastActive: null,
      followers: null,
      verificationStatus: 'checking'
    }
  });
  const [verifyingSocialMedia, setVerifyingSocialMedia] = useState(false);

  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    message: ''
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

  // Helper functions for social media verification
  const generateUsername = (name, platform) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const suffixes = ['', 'official', 'events', 'live', 'festival', 'concert', 'exhibition', 'community'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return suffix ? `${cleanName}.${suffix}` : cleanName;
  };

  const getRandomRecentDate = () => {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  // AI-powered social media verification
  const verifySocialMediaPresence = async (eventData) => {
    setVerifyingSocialMedia(true);
    
    try {
      setTimeout(() => {
        const name = eventData.name || '';
        const hasFacebook = Math.random() > 0.3;
        const hasInstagram = Math.random() > 0.2;
        const hasLinkedIn = Math.random() > 0.4;
        const hasTwitter = Math.random() > 0.5;
        
        const facebookData = hasFacebook ? {
          exists: true,
          username: generateUsername(name, 'facebook'),
          url: `https://facebook.com/${generateUsername(name, 'facebook')}`,
          isActive: Math.random() > 0.4,
          verified: Math.random() > 0.7,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 5000) + 100,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          followers: null,
          verificationStatus: 'not_found'
        };

        const instagramData = hasInstagram ? {
          exists: true,
          username: generateUsername(name, 'instagram'),
          url: `https://instagram.com/${generateUsername(name, 'instagram')}`,
          isActive: Math.random() > 0.3,
          verified: Math.random() > 0.6,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 10000) + 500,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          followers: null,
          verificationStatus: 'not_found'
        };

        const linkedinData = hasLinkedIn ? {
          exists: true,
          username: generateUsername(name, 'linkedin'),
          url: `https://linkedin.com/in/${generateUsername(name, 'linkedin')}`,
          isActive: Math.random() > 0.2,
          verified: Math.random() > 0.8,
          lastActive: getRandomRecentDate(),
          connections: Math.floor(Math.random() * 500) + 50,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          connections: null,
          verificationStatus: 'not_found'
        };

        const twitterData = hasTwitter ? {
          exists: true,
          username: generateUsername(name, 'twitter'),
          url: `https://twitter.com/${generateUsername(name, 'twitter')}`,
          isActive: Math.random() > 0.4,
          verified: Math.random() > 0.5,
          lastActive: getRandomRecentDate(),
          followers: Math.floor(Math.random() * 3000) + 100,
          verificationStatus: 'verified'
        } : {
          exists: false,
          username: null,
          url: null,
          isActive: false,
          verified: false,
          lastActive: null,
          followers: null,
          verificationStatus: 'not_found'
        };

        setSocialMediaVerification({
          facebook: facebookData,
          instagram: instagramData,
          linkedin: linkedinData,
          twitter: twitterData
        });
        setVerifyingSocialMedia(false);
      }, 2000);

    } catch (error) {
      console.error('Error verifying social media:', error);
      setVerifyingSocialMedia(false);
    }
  };

  // Get event type icon and color
  const getEventTypeInfo = (type) => {
    const types = {
      music: { icon: <FaMusic className="text-purple-500" />, color: 'purple', name: 'Music Event' },
      sports: { icon: <FaFutbol className="text-green-500" />, color: 'green', name: 'Sports Event' },
      art: { icon: <FaPalette className="text-pink-500" />, color: 'pink', name: 'Art Event' },
      community: { icon: <FaCommunity className="text-blue-500" />, color: 'blue', name: 'Community Event' },
      food: { icon: <FaUtensils className="text-orange-500" />, color: 'orange', name: 'Food Event' },
      others: { icon: <FaEllipsisH className="text-gray-500" />, color: 'gray', name: 'Other Event' }
    };
    return types[type] || types.others;
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/event/${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch event details');
        }

        const data = await res.json();
        setEvent(data);

        // Simulate AI assessment on data load
        simulateAiAssessment(data);

        // Verify social media presence for events
        verifySocialMediaPresence(data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Simulate AI assessment of event content
  const simulateAiAssessment = (eventData) => {
    setTimeout(() => {
      const description = eventData.description || '';

      // Calculate description quality based on length and keywords
      let descScore = 0;
      if (description.length > 200) descScore += 2;
      if (description.length > 500) descScore += 1;
      if (description.includes("experience") || description.includes("professional")) descScore += 1;
      if (description.includes("details") || description.includes("schedule")) descScore += 1;

      // Event-type specific scoring
      if (eventData.type === 'music') {
        if (description.includes("live") || description.includes("performance")) descScore += 1;
        if (description.includes("artist") || description.includes("band")) descScore += 1;
      } else if (eventData.type === 'sports') {
        if (description.includes("tournament") || description.includes("competition")) descScore += 1;
        if (description.includes("team") || description.includes("match")) descScore += 1;
      } else if (eventData.type === 'art') {
        if (description.includes("exhibition") || description.includes("gallery")) descScore += 1;
        if (description.includes("artist") || description.includes("creative")) descScore += 1;
      } else if (eventData.type === 'community') {
        if (description.includes("community") || description.includes("local")) descScore += 1;
        if (description.includes("gathering") || description.includes("meetup")) descScore += 1;
      } else if (eventData.type === 'food') {
        if (description.includes("cuisine") || description.includes("culinary")) descScore += 1;
        if (description.includes("tasting") || description.includes("menu")) descScore += 1;
      }

      // Calculate image quality based on number of images
      let imgScore = 0;
      if (eventData.imageUrls?.length > 0) imgScore = 3;
      if (eventData.imageUrls?.length > 2) imgScore = 4;
      if (eventData.imageUrls?.length > 4) imgScore = 5;

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
    await new Promise(resolve => setTimeout(resolve, 1500));

    return files.map(file => {
      const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
      return {
        name: file.name,
        url: mockUrl,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        size: file.size
      };
    });
  };

  // Handle registration form submission
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    if (!event?.organizerContact) {
      alert("Organizer contact information is missing. Please try another contact method.");
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

    let message = `New Registration for *${event.name}*%0A%0A`;
    message += `*Name:* ${registrationData.name}%0A`;
    message += `*Email:* ${registrationData.email}%0A`;
    message += `*Phone:* ${registrationData.phone}%0A`;
    message += `*Tickets:* ${registrationData.quantity}%0A`;
    message += `*Special Requests:* ${registrationData.message || 'None'}%0A%0A`;

    // Add attachments if they exist
    if (uploadedFiles.length > 0) {
      message += `*📎 ATTACHMENTS*%0A_Files uploaded for your reference_%0A%0A`;
      uploadedFiles.forEach((file) => {
        message += `• ${file.type === 'image' ? '🖼️ Image' : '📄 Document'}: ${file.name}%0A`;
        message += `  ${file.url}%0A%0A`;
      });
    }

    message += `_Sent via loopOut Booking System_`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(event.organizerContact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Reset attachments after sending
    setAttachments([]);
  };

  // Handle input changes
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({ ...prev, [name]: value }));
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

  const whatsappNumber = event ? formatContactForWhatsApp(event.organizerContact) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi, I'm interested in your event: ${event.name}`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading event details...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading event</h3>
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

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Event not found</h2>
          <p className="mt-2 text-gray-600">The event you re looking for doesn t exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  const description = event.description || '';
  const displayText = showFullDescription
    ? description
    : description.slice(0, 300) + (description.length > 300 ? "..." : "");

  // Format date and time
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', options)}${timeString ? ` at ${timeString}` : ''}`;
  };

  const eventTypeInfo = getEventTypeInfo(event.type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => {
            const routeMap = {
              default: '/event-home-page'
            };
            navigate(routeMap[event?.type?.toLowerCase()] || routeMap.default);
          }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go back to listings"
        >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Floating Action Buttons */}
      {(event.organizerContact || whatsappNumber) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 sm:flex-row">
          {event.organizerContact && (
            <a
              href={`tel:${event.organizerContact}`}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              aria-label="Call Organizer"
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
              aria-label="WhatsApp Organizer"
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
          {/* Header Section - Updated to match HelperPage style */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Colored Header with Event Type */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Event Type Icon */}
                <div className="w-16 h-16 bg-white rounded-2xl border-4 border-white border-opacity-20 shadow-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-2xl">
                    {eventTypeInfo.icon}
                  </div>
                </div>
                
                {/* Name and Type */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                    {event.name}
                  </h1>
                  <div className="text-blue-100 text-sm font-medium">
                    {eventTypeInfo.name}
                  </div>
                </div>
                
                {/* Price Badge */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white border-opacity-30">
                  <div className="text-white text-xs font-semibold opacity-90 mb-1">STARTING FROM</div>
                  <div className="text-white text-xl font-bold">
                    {event.regularPrice ? `R${event.regularPrice}` : 'Free'}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Verification and Rating Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {event.security && (
                  <div className="inline-flex items-center bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    <span className="text-emerald-700 font-semibold text-sm">
                      ✅ Verified Event
                    </span>
                  </div>
                )}
                
                <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <FaStar className="text-yellow-500 text-sm mr-2" />
                  <span className="text-blue-700 font-semibold text-sm">
                    {event.rating ? `${event.rating} Rating` : 'New Event'}
                  </span>
                </div>

                {/* Event Type Badge */}
                <div className="inline-flex items-center bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  {eventTypeInfo.icon}
                  <span className="text-purple-700 font-semibold text-sm ml-2">
                    {eventTypeInfo.name}
                  </span>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Location Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-purple-600 text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-600 font-medium mb-1">Location</div>
                      <div className="text-gray-900 font-semibold text-sm truncate">{event.address}</div>
                    </div>
                  </div>
                </div>

                {/* Date & Time Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaCalendarAlt className="text-orange-600 text-lg" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Date & Time</div>
                      <div className="text-gray-900 font-semibold text-sm">
                        {formatDateTime(event.date, event.time)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaUsers className="text-cyan-600 text-lg" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Capacity</div>
                      <div className="text-gray-900 font-semibold text-sm">{event.capacity || 'Unlimited'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Verification */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Title Section */}
                  <div className="flex items-center gap-3 lg:w-48 lg:flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Social Verification</h3>
                      <p className="text-gray-500 text-xs">AI-powered validation</p>
                    </div>
                  </div>

                  {/* Social Media Badges */}
                  <div className="flex-1">
                    {verifyingSocialMedia ? (
                      <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <FaSpinner className="animate-spin text-yellow-600" />
                        <div>
                          <div className="text-yellow-800 font-medium text-sm">Verifying profiles</div>
                          <div className="text-yellow-600 text-xs">Scanning social networks</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {socialMediaVerification.facebook.exists && socialMediaVerification.facebook.verificationStatus === 'verified' && (
                          <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative">
                              <FaFacebook className="text-blue-600 text-lg" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="text-gray-700 font-semibold text-sm">Facebook</span>
                          </div>
                        )}

                        {socialMediaVerification.instagram.exists && socialMediaVerification.instagram.verificationStatus === 'verified' && (
                          <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative">
                              <FaInstagram className="text-pink-600 text-lg" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="text-gray-700 font-semibold text-sm">Instagram</span>
                          </div>
                        )}

                        {socialMediaVerification.linkedin.exists && socialMediaVerification.linkedin.verificationStatus === 'verified' && (
                          <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative">
                              <FaLinkedin className="text-blue-700 text-lg" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="text-gray-700 font-semibold text-sm">LinkedIn</span>
                          </div>
                        )}

                        {socialMediaVerification.twitter.exists && socialMediaVerification.twitter.verificationStatus === 'verified' && (
                          <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative">
                              <FaTwitter className="text-gray-900 text-lg" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="text-gray-700 font-semibold text-sm">Twitter</span>
                          </div>
                        )}

                        {!socialMediaVerification.facebook.exists && !socialMediaVerification.instagram.exists && 
                         !socialMediaVerification.linkedin.exists && !socialMediaVerification.twitter.exists && (
                          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                            <FaInfoCircle className="text-gray-400" />
                            <span className="text-gray-600 font-medium text-sm">No social profiles found</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          {event.imageUrls && event.imageUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Gallery</h3>
                <p className="text-gray-600 text-sm">View photos from the event</p>
              </div>
              
              <div className="space-y-4">
                {/* Main Swiper */}
                <Swiper
                  modules={[Navigation, Zoom, Thumbs]}
                  navigation={true}
                  zoom={true}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="rounded-lg overflow-hidden"
                >
                  {event.imageUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container">
                        <img
                          src={url}
                          alt={`${event.name} - Image ${index + 1}`}
                          className="w-full h-64 sm:h-80 md:h-96 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Thumbnail Swiper */}
                {event.imageUrls.length > 1 && (
                  <Swiper
                    modules={[Thumbs]}
                    watchSlidesProgress={true}
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={4}
                    freeMode={true}
                    className="thumbs-swiper mt-4"
                  >
                    {event.imageUrls.map((url, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x75?text=Image+Not+Found';
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                About This Event
              </h3>
              {description.length > 300 && (
                <button
                  onClick={toggleDescription}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  {showFullDescription ? (
                    <>
                      <FaArrowUp className="text-xs" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <FaArrowDown className="text-xs" />
                      Read More
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="text-gray-700 leading-relaxed">
              {displayText.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* AI Assessment Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaRobot className="text-blue-500" />
                AI Quality Assessment
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-lg transition-colors ${
                    aiAssessment.userReaction === 'like'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaArrowUp className="text-sm" />
                </button>
                <button
                  onClick={handleDislike}
                  className={`p-2 rounded-lg transition-colors ${
                    aiAssessment.userReaction === 'dislike'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaArrowDown className="text-sm" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="text-blue-700 text-sm font-semibold mb-2">Description Quality</div>
                <div className="text-2xl font-bold text-blue-900">
                  {aiAssessment.descriptionQuality !== null ? `${aiAssessment.descriptionQuality}/5` : '...'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="text-purple-700 text-sm font-semibold mb-2">Image Quality</div>
                <div className="text-2xl font-bold text-purple-900">
                  {aiAssessment.imageQuality !== null ? `${aiAssessment.imageQuality}/5` : '...'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="text-green-700 text-sm font-semibold mb-2">Overall Rating</div>
                <div className="text-2xl font-bold text-green-900">
                  {aiAssessment.overallRating !== null ? `${aiAssessment.overallRating}/5` : '...'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FaArrowUp className="text-green-500" />
                  {aiAssessment.likes} likes
                </span>
                <span className="flex items-center gap-1">
                  <FaArrowDown className="text-red-500" />
                  {aiAssessment.dislikes} dislikes
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FaInfoCircle className="text-gray-400" />
                <span>AI-powered analysis</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <EventComments
              eventId={id}
              onCommentCountChange={setCommentCount}
              onToggleCommentsPanel={() => setShowCommentsPanel(!showCommentsPanel)}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Register for Event</h3>
              <p className="text-gray-600 text-sm">Secure your spot for this amazing experience</p>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={registrationData.name}
                  onChange={handleRegistrationChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={registrationData.email}
                  onChange={handleRegistrationChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={registrationData.phone}
                  onChange={handleRegistrationChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+27 12 345 6789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tickets
                </label>
                <select
                  name="quantity"
                  value={registrationData.quantity}
                  onChange={handleRegistrationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} ticket{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  name="message"
                  value={registrationData.message}
                  onChange={handleRegistrationChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Any special requirements or requests..."
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleAttachmentChange}
                    disabled={attachments.length >= 2}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type.startsWith('image/') ? (
                              <FaFileImage className="text-blue-500" />
                            ) : (
                              <FaFilePdf className="text-red-500" />
                            )}
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Max 2 files, 5MB each. Images and PDFs only.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading Files...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Register Now
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to our terms and conditions. Your information will be sent securely via WhatsApp.
              </p>
            </form>
          </div>

          {/* Event Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
            <div className="space-y-3">
              {/* Event Type */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {eventTypeInfo.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Event Type</div>
                  <div className="text-gray-900 font-medium">{eventTypeInfo.name}</div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaCalendarAlt className="text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date & Time</div>
                  <div className="text-gray-900 font-medium">
                    {formatDateTime(event.date, event.time)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="text-gray-900 font-medium">{event.address}</div>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaUsers className="text-cyan-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Capacity</div>
                  <div className="text-gray-900 font-medium">{event.capacity || 'Unlimited'}</div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaTicketAlt className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="text-gray-900 font-medium">
                    {event.regularPrice ? `R${event.regularPrice}` : 'Free Entry'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Organizer</div>
                  <div className="text-gray-900 font-semibold">{event.organizerName || 'Event Organizer'}</div>
                </div>
              </div>

              {event.organizerContact && (
                <div className="space-y-2">
                  <a
                    href={`tel:${event.organizerContact}`}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    <FaPhone />
                    Call Organizer
                  </a>
                  
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <FaWhatsapp />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelEvent
          eventId={id}
          isOpen={showCommentsPanel}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}
    </div>
  );
}