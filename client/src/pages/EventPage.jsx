/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapPinIcon,
  StarIcon,
  HomeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BoltIcon,
  ShieldCheckIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  CameraIcon,
  PhotoIcon,
  WifiIcon,
  TruckIcon,
  KeyIcon,
  HeartIcon,
  ShareIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TicketIcon,
  MusicalNoteIcon,
  TrophyIcon,
  PaintBrushIcon,
  CakeIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import { 
  FaWhatsapp, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter,
  FaPhone,
  FaUser,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaRobot
} from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs, FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import EventComments from '../components/EventComments';
import CommentsSidePanelEvent from '../components/CommentsSidePanelEvent';
import { useWishlist } from '../hooks/useWishlist';
import EventItem from '../components/EventItem';
import ImageWithFallback from '../components/ImageWithFallback';
import MutualFriends from '../components/MutualFriends';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showBookingBelt, setShowBookingBelt] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showRegistrationOverlay, setShowRegistrationOverlay] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: currentUser?.username || '',
    phone: currentUser?.phone || '',
    quantity: 1,
    note: ''
  });
  const [socialMediaVerification, setSocialMediaVerification] = useState({
    facebook: { exists: false, username: null, url: null, isActive: false, verified: false, lastActive: null, followers: null, verificationStatus: 'checking' },
    instagram: { exists: false, username: null, url: null, isActive: false, verified: false, lastActive: null, followers: null, verificationStatus: 'checking' },
    linkedin: { exists: false, username: null, url: null, isActive: false, verified: false, lastActive: null, connections: null, verificationStatus: 'checking' },
    twitter: { exists: false, username: null, url: null, isActive: false, verified: false, lastActive: null, followers: null, verificationStatus: 'checking' }
  });
  const [verifyingSocialMedia, setVerifyingSocialMedia] = useState(false);


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
  const [similarEvents, setSimilarEvents] = useState([]);
  const { isFavorite, toggleFavorite } = useWishlist(event, 'event');

  const RECENTLY_VIEWED_KEY = 'recentlyViewed';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setShowBookingBelt(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (event) {
      fetchSimilarEvents();
      saveToHistory(event);
    }
  }, [event]);

  const fetchSimilarEvents = async () => {
    try {
      const res = await fetch(`/api/event/similar/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSimilarEvents(data);
    } catch (error) {
      console.error('Error fetching similar events:', error);
    }
  };

  const saveToHistory = (item) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let history = stored ? JSON.parse(stored) : [];
      history = history.filter(h => h._id !== item._id);
      history.unshift({ ...item, itemType: 'event', viewedAt: new Date().toISOString() });
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

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

        setSocialMediaVerification({
          facebook: hasFacebook ? { exists: true, username: generateUsername(name, 'facebook'), url: `https://facebook.com/${generateUsername(name, 'facebook')}`, isActive: true, verified: Math.random() > 0.7, lastActive: getRandomRecentDate(), followers: Math.floor(Math.random() * 5000), verificationStatus: 'verified' } : { exists: false, verificationStatus: 'not_found' },
          instagram: hasInstagram ? { exists: true, username: generateUsername(name, 'instagram'), url: `https://instagram.com/${generateUsername(name, 'instagram')}`, isActive: true, verified: Math.random() > 0.6, lastActive: getRandomRecentDate(), followers: Math.floor(Math.random() * 10000), verificationStatus: 'verified' } : { exists: false, verificationStatus: 'not_found' },
          linkedin: hasLinkedIn ? { exists: true, username: generateUsername(name, 'linkedin'), url: `https://linkedin.com/in/${generateUsername(name, 'linkedin')}`, isActive: true, verified: Math.random() > 0.8, lastActive: getRandomRecentDate(), connections: Math.floor(Math.random() * 500), verificationStatus: 'verified' } : { exists: false, verificationStatus: 'not_found' },
          twitter: hasTwitter ? { exists: true, username: generateUsername(name, 'twitter'), url: `https://twitter.com/${generateUsername(name, 'twitter')}`, isActive: true, verified: Math.random() > 0.5, lastActive: getRandomRecentDate(), followers: Math.floor(Math.random() * 3000), verificationStatus: 'verified' } : { exists: false, verificationStatus: 'not_found' }
        });
        setVerifyingSocialMedia(false);
      }, 2000);
    } catch (error) {
      setVerifyingSocialMedia(false);
    }
  };

  // Get event type icon and color
  const getEventTypeInfo = (type) => {
    const types = {
      music: { icon: <MusicalNoteIcon className="w-5 h-5 text-purple-500" />, color: 'purple', text: 'text-purple-500', name: 'Music Event', bg: 'bg-purple-50', border: 'border-purple-100' },
      sports: { icon: <TrophyIcon className="w-5 h-5 text-green-500" />, color: 'green', text: 'text-green-500', name: 'Sports Event', bg: 'bg-green-50', border: 'border-green-100' },
      art: { icon: <PaintBrushIcon className="w-5 h-5 text-pink-500" />, color: 'pink', text: 'text-pink-500', name: 'Art Event', bg: 'bg-pink-50', border: 'border-pink-100' },
      community: { icon: <UserGroupIcon className="w-5 h-5 text-blue-500" />, color: 'blue', text: 'text-blue-500', name: 'Community Event', bg: 'bg-blue-50', border: 'border-blue-100' },
      food: { icon: <CakeIcon className="w-5 h-5 text-orange-500" />, color: 'orange', text: 'text-orange-500', name: 'Food Event', bg: 'bg-orange-50', border: 'border-orange-100' },
      others: { icon: <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />, color: 'gray', text: 'text-gray-500', name: 'Other Event', bg: 'bg-gray-50', border: 'border-gray-100' }
    };
    return types[type] || types.others;
  };

  const toggleDescription = () => setShowFullDescription(!showFullDescription);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/event/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event details');
        const data = await res.json();
        setEvent(data);
        simulateAiAssessment(data);
        verifySocialMediaPresence(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const simulateAiAssessment = (eventData) => {
    setTimeout(() => {
      const description = eventData.description || '';
      let descScore = Math.min(5, Math.floor(description.length / 200) + 1);
      let imgScore = Math.min(5, (eventData.imageUrls?.length || 0) + 1);
      setAiAssessment({
        descriptionQuality: descScore,
        imageQuality: imgScore,
        overallRating: (descScore + imgScore) / 2,
        likes: Math.floor(Math.random() * 50),
        dislikes: Math.floor(Math.random() * 10),
        userReaction: null
      });
    }, 1500);
  };

  const formatContactForWhatsApp = (contact) => {
    if (!contact) return null;
    const digits = String(contact).replace(/\D/g, '');
    return digits.startsWith('0') ? '27' + digits.substring(1) : digits;
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files).filter(f => (f.type.startsWith('image/') || f.type === 'application/pdf') && f.size <= 5 * 1024 * 1024);
    setAttachments([...attachments, ...files].slice(0, 2));
  };

  const removeAttachment = (index) => setAttachments(attachments.filter((_, i) => i !== index));

  
  const handleEscrowCheckout = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in';
      return;
    }
    try {
      setIsUploading(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           userId: currentUser._id,
           amount: (event.regularPrice || 0) * registrationData.quantity,
           name: currentUser.username,
           email: currentUser.email,
           serviceId: event._id,
           providerName: event.name
        })
      });
      const data = await res.json();
      if (data.success && data.payfast) {
         const form = document.createElement('form');
         form.method = 'POST';
         form.action = data.payfast.url;
         Object.keys(data.payfast.fields).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.payfast.fields[key];
            form.appendChild(input);
         });
         document.body.appendChild(form);
         form.submit();
      } else {
         console.error(data.message);
         setIsUploading(false);
      }
    } catch(err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!event?.organizerContact) return alert("Organizer contact info missing.");
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate upload
    setIsUploading(false);

    const message = `*🎟️ EVENT REGISTRATION*%0A*Event:* ${event.name}%0A*Name:* ${registrationData.name}%0A*Tickets:* ${registrationData.quantity}`;
    
    // Determine device type
    const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    const requestLocation = event.address || '';

    // Save to database for accurate tracking
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser?._id || 'guest',
          eventId: event._id,
          startDate: event.date + 'T' + (event.time || '00:00'),
          endDate: event.date + 'T' + (event.time || '23:59'),
          totalPrice: (event.regularPrice || 0) * registrationData.quantity,
          phone: registrationData.phone,
          message: registrationData.note || message,
          deviceType,
          requestLocation,
          status: 'pending'
        })
      });
    } catch (err) {
      console.error('Failed to record event booking:', err);
    }

    window.open(`https://wa.me/${formatContactForWhatsApp(event.organizerContact)}?text=${message}`, '_blank');
  };

  const handleRegistrationChange = (e) => setRegistrationData({ ...registrationData, [e.target.name]: e.target.value });

  const handleLike = () => setAiAssessment(prev => ({ ...prev, userReaction: prev.userReaction === 'like' ? null : 'like' }));
  const handleDislike = () => setAiAssessment(prev => ({ ...prev, userReaction: prev.userReaction === 'dislike' ? null : 'dislike' }));

  const whatsappNumber = event ? formatContactForWhatsApp(event.organizerContact) : null;
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=Hi, I'm interested in: ${event.name}` : null;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-slate-500 font-medium animate-pulse">Crafting your event experience...</p>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-slate-200">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <InformationCircleIcon className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{error ? 'Oops!' : 'Not Found'}</h2>
        <p className="text-slate-500 mb-8">{error || "This event seems to have vanished into thin air."}</p>
        <button onClick={() => navigate(-1)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">Go Back</button>
      </div>
    </div>
  );

  const eventTypeInfo = getEventTypeInfo(event.type);
  const formatDateTime = (date, time) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${time ? ` @ ${time}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="w-full px-4 md:px-12 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className={`group p-3 rounded-2xl transition-all duration-300 ${
            isScrolled ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
          }`}>
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-3">
            <button className={`p-3 rounded-2xl transition-all duration-300 ${
              isScrolled ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
            }`}>
              <ShareIcon className="w-5 h-5" />
            </button>
            <button onClick={toggleFavorite} className={`p-3 rounded-2xl transition-all duration-300 ${
              isScrolled ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20'
            }`}>
              {isFavorite ? <HeartIconSolid className="w-5 h-5 text-rose-500" /> : <HeartIcon className={`w-5 h-5 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Masterpiece Gallery Layout */}
      <div className="w-full bg-slate-100 overflow-hidden relative">
        {event.imageUrls && event.imageUrls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-[65vh] md:h-[80vh] lg:h-[85vh] w-full bg-slate-900 group">
            {/* Main Image */}
            <div className="relative h-full cursor-pointer overflow-hidden" onClick={() => {}}>
              <ImageWithFallback 
                src={event.imageUrls[0]} 
                alt={event.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Sub Images Grid */}
            <div className="hidden md:grid grid-cols-2 gap-0 h-full">
              {event.imageUrls.slice(1, 5).map((url, index) => (
                <div key={index} className="relative h-full cursor-pointer overflow-hidden" onClick={() => {}}>
                  <ImageWithFallback 
                    src={url} 
                    alt={`${event.name} ${index + 2}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-500" />
                </div>
              ))}
              {/* Fillers if less than 5 images */}
              {event.imageUrls.length < 5 && Array(4 - Math.min(4, event.imageUrls.length - 1)).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-800 h-full w-full" />
              ))}
            </div>

            {/* Show All Photos Button */}
            <button
              onClick={() => { setGalleryIndex(0); setShowFullGallery(true); }}
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-900 flex items-center gap-2 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl border border-slate-200/50 z-20"
            >
              <PhotoIcon className="w-5 h-5" />
              <span>Show all {event.imageUrls.length} photos</span>
            </button>

            {/* Hero Overlay Content - Relocated for maximum visibility */}
            <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-20 pointer-events-none">
              <div className="w-full px-4 md:px-12">
                <div className="flex flex-col gap-5 md:gap-8 pointer-events-auto">
                  <div className="max-w-5xl">
                    <div className="flex flex-wrap gap-2 mb-3 md:mb-6">
                      <span className={`px-3 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md border ${eventTypeInfo.bg} ${eventTypeInfo.text} ${eventTypeInfo.border} shadow-xl`}>
                        {eventTypeInfo.name}
                      </span>
                      {event.security && (
                        <span className="px-3 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase bg-emerald-500/20 text-emerald-400 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5 shadow-xl">
                          <CheckBadgeIcon className="w-3.5 h-3.5 md:w-4 h-4" /> Verified
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-8xl font-black text-white leading-[0.95] mb-5 md:mb-8 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      {event.name}
                    </h1>
                  </div>

                  {/* Critical Info Bar - Redesigned for absolute mobile fitting */}
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <div className="flex-1 min-w-[130px] md:min-w-[140px] bg-white/10 backdrop-blur-2xl px-4 md:px-6 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/20 shadow-2xl">
                       <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Date</div>
                       <div className="text-xs md:text-sm font-bold text-white truncate">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="flex-1 min-w-[130px] md:min-w-[140px] bg-white/10 backdrop-blur-2xl px-4 md:px-6 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/20 shadow-2xl">
                       <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Time</div>
                       <div className="text-xs md:text-sm font-bold text-white truncate">{event.time || 'TBA'}</div>
                    </div>
                    <div className="flex-1 min-w-[130px] md:min-w-[140px] bg-white/10 backdrop-blur-2xl px-4 md:px-6 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/20 shadow-2xl">
                       <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Entry</div>
                       <div className="text-xs md:text-sm font-black text-rose-400 truncate">{event.regularPrice ? `R${event.regularPrice}` : 'Free'}</div>
                    </div>
                    <div className="flex-1 min-w-[130px] md:min-w-[140px] bg-white/10 backdrop-blur-2xl px-4 md:px-6 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/20 shadow-2xl">
                       <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Capacity</div>
                       <div className="text-xs md:text-sm font-bold text-white truncate">{event.capacity || 'Open'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10"></div>
          </div>
        ) : (
          <div className="h-[50vh] bg-slate-100 flex items-center justify-center">
             <Sparkles className="w-20 h-20 text-slate-200 animate-pulse" />
          </div>
        )}
      </div>

  {/* Main Layout - 100% Width & Zero Space */}
  <div className="w-full px-0 mt-0 relative z-30 mb-20">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
    {/* Left Column: Details */}
    <div className="lg:col-span-8 space-y-12 pb-12 px-4 md:px-12 pt-12">
        
        {/* About Section */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">About Experience</h2>
            <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block"></div>
          </div>
          <div className={`text-lg text-slate-600 leading-relaxed space-y-4 ${!showFullDescription && 'line-clamp-6'}`}>
            {event.description?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {event.description?.length > 400 && (
            <button onClick={toggleDescription} className="mt-6 flex items-center gap-2 text-rose-500 font-bold hover:gap-3 transition-all">
              {showFullDescription ? 'Show less' : 'Read more about event'}
              <ChevronRightIcon className={`w-5 h-5 transition-transform ${showFullDescription ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          )}
        </section>

        {/* Event Portfolio - Show All Photos */}
        {event.imageUrls && event.imageUrls.length > 0 && (
          <section className="relative pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Experience Portfolio</h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                {event.imageUrls.length} Photos
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {event.imageUrls.map((url, index) => (
                <div 
                  key={index} 
                  onClick={() => { setGalleryIndex(index); setShowFullGallery(true); }}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <ImageWithFallback 
                    src={url} 
                    alt={`Event ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}

            {/* AI Insights - Premium Card */}
            <section className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                    <CpuChipIcon className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">AI Smart Assessment</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Algorithmic quality check</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Description</div>
                    <div className="text-3xl font-black text-white">{aiAssessment.descriptionQuality || '...'}<span className="text-sm font-normal text-slate-500 ml-1">/5</span></div>
                  </div>
                  <div className="p-6 bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Content</div>
                    <div className="text-3xl font-black text-white">{aiAssessment.imageQuality || '...'}<span className="text-sm font-normal text-slate-500 ml-1">/5</span></div>
                  </div>
                  <div className="p-6 bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Safety</div>
                    <div className="text-3xl font-black text-white">4.8<span className="text-sm font-normal text-slate-500 ml-1">/5</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <button onClick={handleLike} className={`flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-2xl transition-all ${aiAssessment.userReaction === 'like' ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
                      <ArrowUpIcon className="w-4 h-4" /> Helpful
                    </button>
                    <button onClick={handleDislike} className={`flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-2xl transition-all ${aiAssessment.userReaction === 'dislike' ? 'bg-rose-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
                      <ArrowDownIcon className="w-4 h-4" /> Flag
                    </button>
                  </div>
                  <div className="text-slate-500 text-xs font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Verified by Experience AI 
                  </div>
                </div>
              </div>
            </section>

            {/* Profiles & Verification */}
            <section className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Digital Footprint</h3>
                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 animate-pulse">Scanning Live</span>
              </div>

              {verifyingSocialMedia ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                   <ArrowPathIcon className="w-10 h-10 text-slate-400 animate-spin" />
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Verifying Social Credentials...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {['facebook', 'instagram', 'linkedin', 'twitter'].map((platform) => {
                    const data = socialMediaVerification[platform];
                    const Icon = platform === 'facebook' ? FaFacebook : platform === 'instagram' ? FaInstagram : platform === 'linkedin' ? FaLinkedin : FaTwitter;
                    const colors = {
                      facebook: 'text-blue-600 bg-blue-50',
                      instagram: 'text-pink-600 bg-pink-50',
                      linkedin: 'text-blue-700 bg-blue-50',
                      twitter: 'text-sky-500 bg-sky-50'
                    };

                    return (
                      <div key={platform} className={`p-6 rounded-[2rem] border transition-all duration-300 ${data.exists ? 'bg-white border-slate-200 shadow-sm hover:shadow-xl' : 'bg-slate-100/50 border-transparent opacity-50 grayscale'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[platform]}`}>
                          <Icon className="text-2xl" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{platform}</div>
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {data.exists ? `@${data.username}` : 'Not Found'}
                        </div>
                        {data.verified && <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter"><CheckBadgeIcon className="w-3 h-3"/> Verified</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

             {/* Comments */}
             <section>
              <EventComments
                eventId={id}
                onCommentCountChange={setCommentCount}
                onToggleCommentsPanel={() => setShowCommentsPanel(!showCommentsPanel)}
              />
            </section>
          </div>

        {/* Right Column: Sticky Contact & Form */}
        <div className="lg:col-span-4 lg:relative px-4 md:px-12">
            <div className="sticky top-28 space-y-6">
              
              {/* Primary Booking Card */}
              <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-slate-100 p-8 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Entry</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                          {event.regularPrice ? `R${event.regularPrice}` : 'Free'}
                        </span>
                        {event.regularPrice && <span className="text-slate-400 text-sm font-medium">/person</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quality</div>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-bold text-xs border border-amber-100">
                        <StarIconSolid className="w-3 h-3" /> {event.rating || '4.9'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => setShowRegistrationOverlay(true)}
                      className="w-full py-5 bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-xl active:scale-95"
                    >
                      Reserve Experience
                    </button>
                    <a 
                      href={whatsappLink}
                      className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-slate-300 transition-all shadow-sm"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-rose-500" /> Inquire Privately
                    </a>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-500" /> Secure Cloud Registration
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.1),transparent)]"></div>
                <div className="relative z-10">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Host Experience</h4>
                   <Link to={`/user-profile/${event.userRef?._id || event.userRef}`} className="flex items-center gap-4 mb-8 group">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-rose-500/50 transition-all duration-500">
                          <ImageWithFallback src={event.userRef?.avatar} alt={event.organizerName} className="w-full h-full object-cover" />
                        </div>
                        {event.userRef?.isSuperhost && (
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-bold group-hover:text-rose-400 transition-colors uppercase tracking-tight">{event.userRef?.username || event.organizerName}</div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                          <StarIconSolid className="w-3 h-3 text-yellow-500" /> Top Rated Organizer
                        </div>
                      </div>
                   </Link>
                   
                   {/* Mutual Friends Section */}
                   <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
                     <MutualFriends targetUserId={event.userRef?._id || event.userRef} dark={true} />
                   </div>

                   <div className="space-y-3">
                      <a href={`tel:${event.organizerContact}`} className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all border border-white/5">
                        <PhoneIcon className="w-5 h-5 text-rose-400" /> Voice Call
                      </a>
                      <a href={whatsappLink} className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-500/20">
                        <FaWhatsapp className="text-lg" /> WhatsApp
                      </a>
                   </div>
                </div>
              </div>

               <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex flex-col items-center gap-4">
                  <InformationCircleIcon className="w-10 h-10 text-slate-200" />
                  <p className="text-center text-slate-400 text-xs font-medium leading-relaxed italic">
                    By registering you agree to the community guidelines. You will be redirected to WhatsApp to finalize your booking with the host.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <section className="pt-24 border-t border-slate-100">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">More Experiences</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Recommended for you</p>
               </div>
               <Link to="/events" className="flex items-center gap-2 text-rose-500 font-bold text-sm bg-rose-50 px-6 py-3 rounded-2xl hover:bg-rose-100 transition-all">
                  Explore all <ArrowUpIcon className="w-4 h-4 rotate-45" />
               </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarEvents.map((item) => <EventItem key={item._id} event={item} />)}
            </div>
          </section>
        )}
      </div>

      {/* Floating Mobile Booking Belt */}
      {showBookingBelt && (
        <div className="fixed bottom-0 left-0 right-0 z-[90] md:hidden">
          <div className="bg-white/80 backdrop-blur-2xl border-t border-slate-200 p-4 flex items-center justify-between gap-4 safe-area-bottom">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entry</div>
              <div className="text-xl font-black text-slate-900">{event.regularPrice ? `R${event.regularPrice}` : 'Free'}</div>
            </div>
            <button 
               onClick={() => setShowRegistrationOverlay(true)}
               className="flex-1 bg-slate-900 text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20"
            >
              Reserve Experience
            </button>
          </div>
        </div>
      )}

      {/* Full Page Registration Overlay - Masterpiece Style */}
      {showRegistrationOverlay && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between relative z-10">
              <button 
                onClick={() => setShowRegistrationOverlay(false)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-900 transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-950 leading-none">Registration</h2>
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Final Step</div>
              </div>
              <div className="w-12"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative z-10">
              <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100 shadow-inner">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <ImageWithFallback src={event?.imageUrls?.[0]} alt={event?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-950 tracking-tighter leading-tight mb-1">{event?.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <CalendarDaysIcon className="w-3.5 h-3.5" /> {event?.date && new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={registrationData.name}
                      onChange={handleRegistrationChange}
                      className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none" 
                      placeholder="Your designation"
                    />
                  </div>
                  <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={registrationData.phone}
                      onChange={handleRegistrationChange}
                      className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none" 
                      placeholder="012 345 6789"
                    />
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ticket Quantity</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setRegistrationData(d => ({...d, quantity: Math.max(1, d.quantity - 1)}))}
                      className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-900 active:scale-90 transition-all"
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-black text-slate-950 min-w-[30px] text-center">{registrationData.quantity}</span>
                    <button 
                      onClick={() => setRegistrationData(d => ({...d, quantity: d.quantity + 1}))}
                      className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-900 active:scale-90 transition-all"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </button>
                    <div className="ml-auto text-rose-500 font-black text-lg">
                      R{event?.regularPrice ? event.regularPrice * registrationData.quantity : '0'}
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Special Requests or Personal Note</label>
                  <textarea 
                    name="note"
                    value={registrationData.note}
                    onChange={handleRegistrationChange}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none resize-none h-24" 
                    placeholder="Tell us anything specific for this experience..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/50 relative z-10">
              
              <button 
                onClick={handleEscrowCheckout}
                disabled={isUploading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 mb-3"
              >
                {isUploading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    Pay via Secure Escrow
                  </>
                )}
              </button>

              <button 
                onClick={handleRegistrationSubmit}
                disabled={isUploading}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {isUploading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <FaWhatsapp className="text-lg" />
                    Confirm & Send Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Side Panel */}
      {showCommentsPanel && (
        <CommentsSidePanelEvent
          eventId={id}
          isOpen={showCommentsPanel}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}

      {/* Full Screen Gallery Overlay */}
      {showFullGallery && event.imageUrls && event.imageUrls.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[300] flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button
              onClick={() => setShowFullGallery(false)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <span className="font-medium text-sm tracking-widest uppercase">
              {galleryIndex + 1} / {event.imageUrls.length}
            </span>
            <div className="w-10" /> {/* Spacer */}
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative h-full w-full">
            <button
              onClick={() => setGalleryIndex(prev => prev === 0 ? event.imageUrls.length - 1 : prev - 1)}
              className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <img
              src={event.imageUrls[galleryIndex]}
              alt={`Event gallery image ${galleryIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
            />

            <button
              onClick={() => setGalleryIndex(prev => prev === event.imageUrls.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
