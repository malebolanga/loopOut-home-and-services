/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import {
  MapPinIcon,
  HomeIcon,
  TagIcon,
  HeartIcon as HeartIconOutline,
  UserIcon,
  SparklesIcon,
  KeyIcon,
  BuildingOfficeIcon,
  MoonIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
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
  sale:       { icon: HomeIcon,     bg: 'bg-green-100',  text: 'text-green-700',  label: 'For Sale' },
  rent:       { icon: KeyIcon,      bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'For Rent' },
  'rent-long':{ icon: KeyIcon,      bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Long Term' },
  'rent-short':{ icon: MoonIcon,    bg: 'bg-rose-100',   text: 'text-rose-700',   label: 'Short Term' },
  over:       { icon: MoonIcon,     bg: 'bg-rose-100',   text: 'text-rose-700',   label: 'Overnight' },
  land:       { icon: SparklesIcon, bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Land Plot' },
  office:     { icon: BuildingOfficeIcon, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Office' },
};

function ListingTypePill({ type }) {
  const cfg = LISTING_TYPE_CONFIG[type] || { icon: Squares2X2Icon, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Property' };
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
    <div
      onClick={onClick}
      className={`${className} ${compactMode
        ? 'flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg  w-full'
        : ' cursor-pointer flex flex-col h-full'
        }`}
    >
      {compactMode ? (
        <>
          <Link
            to={`/listing/${listing._id}`}
            className="block relative flex-grow-0"
            onClick={handleCardClick}
          >
            <div className="relative w-24 h-28 flex-shrink-0 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={enhancedImages[0]?.url}
                imageUrls={listing.imageUrls}
                type="property"
                alt={`${listing.name || 'Property'} image`}
                className={`w-full h-full rounded-2xl object-cover transition-transform duration-500 ${imageLoaded ? 'scale-100' : 'scale-110'} group-hover:scale-105`}
                loading="lazy"
              />

              {/* User avatar link - Compact Mode */}
              {listing?.userRef?._id && (
                <div className="absolute top-1 left-1 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                  <div className="w-4 h-4 rounded-full overflow-hidden">
                    {getUserAvatar()}
                  </div>
                  <span className="text-[9px] font-medium text-gray-700">{getUserFirstName()}</span>
                </div>
              )}

              {isNewListing && (
                <span className="absolute top-1 right-1 bg-green-500 text-white px-1.5 py-0.5 text-[10px] font-semibold rounded-full shadow-xs">
                  NEW
                </span>
              )}
            </div>
          </Link>

          <div className="flex-grow flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {listing.name || 'Property Name'}
                </h3>
                <button
                  onClick={toggleFavorite}
                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors ml-2"
                  aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isFavorite ? <HeartIconSolid className="w-3.5 h-3.5 text-rose-600" /> : <HeartIconOutline className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center mt-2.5">
                <MapPinIcon className="text-rose-600 w-3 h-3 mr-1.5" />
                <span className="truncate">{listing.address || 'Address not available'}</span>
              </p>
              <div className="mt-1.5">
                <ListingTypePill type={listing.type} />
              </div>

            </div>

            <div className="mt-1.5 flex justify-between items-center">
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(
                  listing.offer ? listing.discountPrice : listing.regularPrice,
                  { type: listing.type }
                )}
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center text-gray-900">
                  <span className="font-black text-gray-900 text-[11px] mr-1.5">
                    {ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}
                  </span>
                  <StarIconSolid className="text-amber-500 w-3 h-3" />
                </div>
                {ratingData.count > 0 && <span className="text-[9px] text-gray-400 mt-0.5">({ratingData.count} rev)</span>}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-2.5 shadow-sm group-hover:shadow-md transition-shadow">
            <button
              onClick={toggleFavorite}
              className="absolute top-2 right-2 z-20 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-sm hover:bg-white/30 transition-all hover:scale-110 border border-white/20"
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isFavorite ? (
                <HeartIconSolid className="w-4 h-4 text-rose-500" />
              ) : (
                <HeartIconOutline className="w-4 h-4 text-white" />
              )}
            </button>

            {listing?.userRef?._id && (
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                <div className="w-4 h-4 rounded-full overflow-hidden">
                  {getUserAvatar()}
                </div>
                <span className="text-[9px] font-bold text-gray-900 uppercase tracking-tight">{getUserFirstName()}</span>
              </div>
            )}

            <Link
              to={`/listing/${listing._id}`}
              className="block w-full h-full"
              onClick={handleCardClick}
            >
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
                      imageUrls={index === 0 ? listing.imageUrls : undefined}
                      type="property"
                      alt={`${listing.name || 'Property'} image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Link>
            
            <div className="absolute bottom-2 left-2 z-10 flex gap-1">
              <span className="bg-gray-900/80 backdrop-blur-md text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md">
                {getPropertyTypeName(listing.type)}
              </span>
              {isNewListing && (
                <span className="bg-rose-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md">
                  NEW
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col px-1.5">
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-rose-600 transition-colors">
                {listing.name || 'Property Name'}
              </h3>
              <div className="flex items-center text-gray-900 shrink-0">
                <StarIconSolid className="text-amber-500 w-3 h-3" />
                <span className="font-bold text-xs ml-1">
                  {ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-xs flex items-center mt-0.5">
              <MapPinIcon className="text-rose-500 mr-1 w-3 h-3 min-w-fit" />
              <span className="truncate">{listing.address || 'Address not available'}</span>
            </p>

            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
              {listing.type !== 'land' && listing.type !== 'office' && (
                <>
                  <div className="flex items-center gap-1">
                    <HomeIcon className="w-3 h-3" />
                    <span>{listing.bedrooms || 0} Beds</span>
                  </div>
                  <span className="text-gray-200">•</span>
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3" />
                    <span>{listing.bathrooms || 0} Baths</span>
                  </div>
                </>
              )}
              {listing.type === 'office' && <span>{listing.squareMeters || listing.bedrooms || 0} SQM</span>}
              {listing.type === 'land' && <span>{listing.landArea || listing.bathrooms || 0} SQM</span>}
            </div>

            <div className="mt-2 text-sm font-black text-gray-900">
               {formatPrice(
                 listing.offer ? listing.discountPrice : listing.regularPrice,
                 { type: listing.type }
               )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ListingItem;