/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Home,
  Tag,
  Heart,
  User,
  Sparkles,
  Key,
  Building,
  Moon,
  LayoutGrid,
  Star,
  ThumbsUp,
  ThumbsDown,
  Share2
} from 'lucide-react';
import { useState, useMemo, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";
import ImageWithFallback from "./ImageWithFallback";
import { useWishlist } from "../hooks/useWishlist";

const NEW_LISTING_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;

const formatPrice = (price, context = {}) => {
  if (price === undefined || price === null) {
    return <span className="font-bold text-gray-900">Price not available</span>;
  }

  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  const suffix = context?.type === 'over' ? '/night' :
    context?.type === 'office' ? '/hour' :
      ['rent', 'rent-short', 'rent-long'].includes(context?.type) ? '/month' : '';

  return (
    <span className="font-bold text-gray-900">
      {formatter.format(price)}
      {suffix && <span className="text-xs font-normal text-gray-500 ml-1">{suffix}</span>}
    </span>
  );
};

const getPropertyTypeName = (type) => {
  switch (type) {
    case 'sale': return 'Sale';
    case 'rent-short': return 'Short Term';
    case 'rent-long': return 'Long Term';
    case 'office': return 'Office';
    case 'land': return 'Land Plot';
    default: return 'Property';
  }
};

const LISTING_TYPE_CONFIG = {
  sale:       { icon: Home,         bg: 'bg-green-100',  text: 'text-green-700',  label: 'For Sale' },
  rent:       { icon: Key,          bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'For Rent' },
  'rent-long':{ icon: Key,          bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Long Term' },
  'rent-short':{ icon: Moon,         bg: 'bg-rose-100',   text: 'text-rose-700',   label: 'Short Term' },
  over:       { icon: Moon,         bg: 'bg-rose-100',   text: 'text-rose-700',   label: 'Overnight' },
  land:       { icon: Sparkles,     bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Land Plot' },
  office:     { icon: Building,     bg: 'bg-purple-100', text: 'text-purple-700', label: 'Office' },
};

function ListingTypePill({ type }) {
  const cfg = LISTING_TYPE_CONFIG[type] || { icon: LayoutGrid, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Property' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

function ListingItem({ listing, onClick, className = "", compactMode = false }) {
  const { isFavorite, toggleFavorite } = useWishlist(listing, 'listing');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isNewListing, setIsNewListing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (listing?.createdAt) {
      const creationDate = new Date(listing.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - creationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIsNewListing(diffDays <= NEW_LISTING_THRESHOLD_DAYS);
    }
  }, [listing?.createdAt]);

  useEffect(() => {
    if (listing?._id) {
      try {
        const storedClicks = JSON.parse(localStorage.getItem('listingClicks')) || {};
        setClickCount(storedClicks[listing._id] || 0);
      } catch (error) {
        console.error('Error reading listingClicks from localStorage:', error);
      }

      // Fetch accurate rating data
      const fetchRating = async () => {
        try {
          const res = await fetch(`/api/comment/${listing._id}?limit=1`);
          if (res.ok) {
            const data = await res.json();
            setRatingData({
              average: data.ratings?.overall || 0,
              count: data.totalComments || 0
            });
          }
        } catch (error) {
          // silently fail
        }
      };
      fetchRating();
    }
  }, [listing?._id]);

  const handleCardClick = () => {
    if (!listing?._id) return;

    try {
      const storedClicks = JSON.parse(localStorage.getItem('listingClicks')) || {};
      const newCount = (storedClicks[listing._id] || 0) + 1;
      storedClicks[listing._id] = newCount;
      localStorage.setItem('listingClicks', JSON.stringify(storedClicks));
      setClickCount(newCount);
    } catch (error) {
      console.error('Error updating listingClicks in localStorage:', error);
    }
  };

  const calculatedStarRating = useMemo(() => {
    if (clickCount === 0) return 1;
    const stars = Math.floor(clickCount / CLICKS_PER_STAR) + 1;
    return Math.min(5, stars);
  }, [clickCount]);

  const enhancedImages = useMemo(() =>
    (listing?.imageUrls?.length > 0 ? listing.imageUrls : ["https://placehold.co/600x400/E0E0E0/333333?text=No+Image"])
      .map((img) => ({ url: img })),
    [listing?.imageUrls]
  );

  // Get user's first name from username
  const getUserFirstName = () => {
    if (!listing?.userRef?.username) return 'User';
    const username = listing.userRef.username;
    // Extract first name (handle formats like "john_doe", "john.doe", "john doe")
    const firstName = username.split(/[._\s]/)[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  // User avatar display logic - modified to always show in left corner
  const getUserAvatar = () => {
    if (listing?.userRef?.avatar) {
      return (
        <img
          src={listing.userRef.avatar}
          alt={getUserFirstName()}
          className="w-full h-full rounded-full object-cover"
        />
      );
    }

    const initials = listing?.userRef?.username
      ? getUserFirstName().charAt(0).toUpperCase()
      : 'U';

    return (
      <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
        {initials}
      </div>
    );
  };

  const shareListing = (platform) => {
    if (!listing?._id || !listing?.type || !listing?.name || !listing?.address) return;

    const listingUrl = `${window.location.origin}/listing/${listing._id}`;
    const shareText = `Check out this ${getPropertyTypeName(listing.type)}: ${listing.name} - ${listing.address}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${listingUrl}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(listingUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Property Listing: ${listing.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${listingUrl}`)}`);
        break;
      case 'copy':
        // eslint-disable-next-line no-case-declarations
        const tempInput = document.createElement('textarea');
        tempInput.value = `${shareText} ${listingUrl}`;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
          document.execCommand('copy');
          const messageBox = document.createElement('div');
          messageBox.innerText = 'Link copied to clipboard!';
          messageBox.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: rgba(0,0,0,0.7); color: white; padding: 10px 20px;
            border-radius: 8px; z-index: 1000; font-size: 14px;
            animation: fadeOut 3s forwards;
          `;
          document.body.appendChild(messageBox);
          setTimeout(() => messageBox.remove(), 3000);

          if (!document.getElementById('fadeOutKeyframes')) {
            const styleSheet = document.createElement("style");
            styleSheet.type = "text/css";
            styleSheet.id = "fadeOutKeyframes";
            styleSheet.innerText = `
              @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; display: none; }
              }
            `;
            document.head.appendChild(styleSheet);
          }
        } catch (err) {
          console.error('Failed to copy link:', err);
          const messageBox = document.createElement('div');
          messageBox.innerText = 'Failed to copy link!';
          messageBox.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: rgba(255,0,0,0.7); color: white; padding: 10px 20px;
            border-radius: 8px; z-index: 1000; font-size: 14px;
            animation: fadeOut 3s forwards;
          `;
          document.body.appendChild(messageBox);
          setTimeout(() => messageBox.remove(), 3000);
        } finally {
          document.body.removeChild(tempInput);
        }
        break;
      default:
        break;
    }
    setShowShareOptions(false);
  };

  if (!listing?._id) {
    return (
      <div className="rounded-xl w-full relative overflow-hidden p-3 shadow-md transition-all duration-300 hover:shadow-lg max-w-sm mx-auto min-h-[380px]">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-xl"></div>
          <div className="mt-4 space-y-2">
            <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            <div className="bg-gray-200 h-6 w-1/3 rounded mt-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`${className} group relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 h-full cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {enhancedImages.map((img, index) => (
            <SwiperSlide key={index}>
              <ImageWithFallback
                src={img.url}
                alt={`${listing.name || 'Property'} image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Top Overlays */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{getPropertyTypeName(listing.type)}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(e);
          }}
          className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90 pointer-events-auto"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Permanent Information Overlay (On Image) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-white">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black">{ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}</span>
            </div>
            <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
              {listing.name}
            </h3>
            <p className="text-xs text-white/70 font-medium truncate flex items-center gap-1">
               <MapPin className="w-3 h-3" />
              {listing.address || 'Private Location'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
              R{listing.regularPrice?.toLocaleString()}
            </div>
            <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
          </div>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
        <div className="w-full space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <div className="flex gap-2">
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsUp className="w-4 h-4" />
              {listing.votes?.up || 0}
            </div>
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsDown className="w-4 h-4" />
              {listing.votes?.down || 0}
            </div>
          </div>
          <Link
            to={`/listing/${listing._id}`}
            onClick={handleCardClick}
            className="block w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
          >
            Inspect Original Masterpiece
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingItem;