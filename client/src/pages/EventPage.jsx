/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaMapMarkerAlt, FaPhone, FaUser,
  FaClock, FaTicketAlt, FaCalendarDay, FaUsers,
  FaWhatsapp, FaLink, FaCar, FaUtensils, FaChild,
  FaCalendarAlt, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaRobot, FaExternalLinkAlt,
  FaInfoCircle, FaArrowLeft, FaChevronDown, FaStar, FaUserFriends, FaBroom
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
  const [aiRating, setAiRating] = useState({
    average: 4.5,
    categoryRatings: {
      cleanliness: 4.7,
      communication: 4.6,


      staff: 4.3
    }
  });

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
    userReaction: null // 'like' or 'dislike'
  });



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

  // Handle registration form submission
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();

    if (!event?.organizerContact) {
      alert("Organizer contact information is missing. Please try another contact method.");
      return;
    }

    let message = `New Registration for *${event.title}*%0A%0A`;
    message += `*Name:* ${registrationData.name}%0A`;
    message += `*Email:* ${registrationData.email}%0A`;
    message += `*Phone:* ${registrationData.phone}%0A`;
    message += `*Tickets:* ${registrationData.quantity}%0A`;
    message += `*Special Requests:* ${registrationData.message || 'None'}%0A%0A`;

    const whatsappUrl = `https://wa.me/${formatContactForWhatsApp(event.organizerContact)}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
    ? `https://wa.me/${whatsappNumber}?text=Hi, I'm interested in your event: ${event.title}`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-airbnb-red"></div>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
      {(event.contact || whatsappNumber) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 sm:flex-row">
          {event.contact && (
            <a
              href={`tel:${event.contact}`}
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

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Event Information and Image Gallery */}
        <div className="md:w-2/3">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-dark flex-1 min-w-0 line-clamp-2 overflow-hidden text-ellipsis break-words">
                    {event.name}
                  </h1>
                  {event.security && (
                    <span className="inline-flex items-center bg-airbnb-red bg-opacity-10 text-airbnb-red px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 mt-1">
                      <span className="mr-1">✅</span> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto py-1 scrollbar-hide">
                  {/* Rating Badge */}
                  <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-full border border-airbnb-medium-gray">

                    <span className="font-medium text-airbnb-dark">
                      {event.rating ? (
                        <>
                          <span className="font-semibold">{event.rating}</span>
                          <span className="text-airbnb-gray ml-1">Stars</span>
                        </>
                      ) : (
                        <span className="text-airbnb-blue">✨ New Event</span>
                      )}
                    </span>
                  </div>

                  {/* Location Badge */}
                  <div className="flex items-center bg-airbnb-light-gray px-3 py-1.5 rounded-full border border-airbnb-medium-gray">
                    <span className="text-airbnb-red mr-1.5">📍</span>
                    <span className="font-medium text-airbnb-dark truncate max-w-[160px]">
                      {event.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Widgets Section */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                {/* Main Rating Row */}
                <div className="flex items-center justify-between">
                  {/* Like/Dislike Widget - Enhanced with emojis */}
                  <div className="flex flex-col items-center">
                    <div className="flex gap-3 mb-1">
                      <button
                        onClick={handleLike}
                        className={`p-3 rounded-full transition-all duration-300 ${aiAssessment.userReaction === 'like'
                            ? 'bg-green-100 text-green-600 shadow-md shadow-green-100'
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                      >
                        <span className="text-xl">👍</span>
                      </button>
                      <button
                        onClick={handleDislike}
                        className={`p-3 rounded-full transition-all duration-300 ${aiAssessment.userReaction === 'dislike'
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

                  {/* AI Rating - Enhanced with emoji */}
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

                  {/* User Reviews - Enhanced with emoji */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium mb-1">
                      <span className="text-lg">⭐</span>
                      <span>User Rating</span>
                    </div>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-2xl font-bold text-gray-900 leading-none">
                        {Number(aiRating.average).toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">({commentCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {event.imageUrls && event.imageUrls.length > 0 ? (
              <>
                <Swiper
                  modules={[Navigation, Thumbs, Zoom]}
                  navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
                  thumbs={{ swiper: thumbsSwiper }}
                  zoom={true}
                  className="h-100% sm:h-80 md:h-[450px] lg:h-[550px] bg-white"
                >
                  {event.imageUrls.map((img, index) => (
                    <SwiperSlide key={index} className="flex items-center justify-center">
                      <div className="swiper-zoom-container w-full h-full flex items-center justify-center p-4">
                        <img
                          src={img}
                          alt={`Event image ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                  <div className="swiper-button-prev custom-swiper-nav-btn left-2"></div>
                  <div className="swiper-button-next custom-swiper-nav-btn right-2"></div>
                </Swiper>

                {event.imageUrls.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    className="mt-4 h-24 bg-gray-50 p-2"
                  >
                    {event.imageUrls.map((img, index) => (
                      <SwiperSlide key={index} className="flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center bg-white p-1 border border-gray-200 rounded-md">
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-contain max-h-16"
                          />
                        </div>
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
        </div>

        {/* Registration Card */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden md:sticky md:top-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Register for Event</h3>
              <div className="flex items-center justify-between mb-4">
                {event.price ? (
                  <>
                    <span className="text-3xl font-extrabold text-airbnb-red">Free Admission</span>
                    <span className="text-gray-600 text-lg">per ticket</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-green-600">R{event.regularPrice} per ticket</span>


                )}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Organizer information */}
              <div className="flex items-center gap-3 text-gray-700">
                <FaUser className="text-airbnb-red text-xl" />
                <span className="font-medium">Organizer: {event.organizerName || event.host}</span>
              </div>

              {/* Event Date/Time */}
              {event.date && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaCalendarAlt className="text-airbnb-red text-xl" />
                  <span className="font-medium">
                    {formatDateTime(event.date, event.time)}
                  </span>
                </div>
              )}

              {/* Event Location */}
              {event.location && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-airbnb-red text-xl" />
                  <span className="font-medium">{event.address}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegistrationSubmit} className="pt-4 space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="name"
                    value={registrationData.name}
                    onChange={handleRegistrationChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    name="email"
                    value={registrationData.email}
                    onChange={handleRegistrationChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="you@example.com"
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
                    value={registrationData.phone}
                    onChange={handleRegistrationChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="+27 12 345 6789"
                  />
                </div>

                {/* Ticket Quantity */}
                {event.price > 0 && (
                  <div>
                    <label htmlFor="ticketQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Tickets
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="ticketQuantity"
                        name="quantity"
                        min="1"
                        max="10"
                        value={registrationData.quantity}
                        onChange={handleRegistrationChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                        required
                      />
                      <FaTicketAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="message"
                    value={registrationData.message}
                    onChange={handleRegistrationChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows="3"
                    placeholder="Accessibility needs, dietary restrictions, etc..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                  {event.price > 0 ? 'Register & Pay via WhatsApp' : 'Register Now'}
                </button>
              </form>

              {/* Update Event Button */}
              {currentUser && currentUser._id === event.userRef && (
                <button
                  onClick={() => navigate(`/update-event/${event._id}`)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                  Update Event Listing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
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
                  Based on detail level, clarity, and completeness
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

          {/* About Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Event</h2>

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

          {/* Event Details Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Event Details</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaCalendarDay className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Date & Time</h3>
                  <p className="text-gray-600">
                    {formatDateTime(event.date, event.time)}
                    {event.endTime && ` to ${event.endTime}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Location</h3>
                  <p className="text-gray-600">{event.address}</p>
                  {event.address && (
                    <a
                      href={generateMapLink(event.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center text-blue-600 hover:underline"
                    >
                      View on map <FaExternalLinkAlt className="ml-1 text-xs" />
                    </a>
                  )}
                </div>
              </div>

              {event.organizerName && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Organizer</h3>
                    <p className="text-gray-600">{event.organizerName || event.host}</p>
                  </div>
                </div>
              )}

              {event.website && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaLink className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Event Website</h3>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {event.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Additional Information */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FaTicketAlt className="text-airbnb-red" />
                <span>Ticket Price: {event.regularPrice ? `R${event.regularPrice}` : 'Free'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaUsers className="text-airbnb-red" />
                <span>Capacity: {event.capacity || 'Unlimited'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaInfoCircle className="text-airbnb-red" />
                <span>Category: {event.category || 'General'}</span>
              </li>
              {event.ageRestriction && (
                <li className="flex items-center gap-3">
                  <FaClock className="text-airbnb-red" />
                  <span>Age Restriction: {event.ageRestriction}</span>
                </li>
              )}
              {event.parking && (
                <li className="flex items-center gap-3">
                  <FaCar className="text-airbnb-red" />
                  <span>Parking: {event.parking}</span>
                </li>
              )}
              {event.foodAvailable && (
                <li className="flex items-center gap-3">
                  <FaUtensils className="text-airbnb-red" />
                  <span>Food Available: {event.foodAvailable}</span>
                </li>
              )}
              {event.familyFriendly && (
                <li className="flex items-center gap-3">
                  <FaChild className="text-airbnb-red" />
                  <span>Family Friendly: {event.familyFriendly}</span>
                </li>
              )}
            </ul>
          </section>
        </div>

        {/* Organizer Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">About the Organizer</h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaUser className="text-3xl text-airbnb-red" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">{event.organizerName || event.host}</h3>
                <p className="text-gray-600 text-base">Event Organizer</p>
                {event.organizerContact && (
                  <div className="flex items-center gap-1 text-gray-700 text-sm mt-2">
                    <FaPhone className="text-blue-500" />
                    <span>{event.contact}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Call Organizer Button */}
              {event.contact && (
                <a
                  href={`tel:${event.contact}`}
                  className="flex items-center justify-center gap-2 w-full bg-airbnb-red text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
                >
                  <FaPhone />
                  <span>Call Organizer</span>
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

      {/* Reviews Section */}
      <hr className="my-8 border-gray-200" />
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Guest Reviews</h2>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="font-semibold">{Number(aiRating.average).toFixed(1)}</span>
            <span className="mx-1">·</span>
            <span className="text-gray-600">{commentCount} reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Airbnb-style stats summary */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Review Highlights</h3>
            <div className="space-y-3">
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
                    <span className="font-medium">{rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
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

            <EventComments
              eventId={id}
              maxComments={2}
              onTotalComments={setCommentCount}
              onRatings={setAiRating}
              cardStyle={true}
            />
          </div>
        </div>
      </section>

      {showCommentsPanel && (
        <CommentsSidePanelEvent
          eventId={id}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}
    </div>
  );
}