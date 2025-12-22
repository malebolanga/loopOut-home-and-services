/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaBed, FaBath, FaHeart, FaRegHeart, FaStar, FaUser } from "react-icons/fa";
import { useState, useMemo, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";

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

function ListingItem({ listing, onClick, className = "", compactMode = false }) {
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      return listing?._id ? wishlist.some(item => item?._id === listing._id) : false;
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
      return false;
    }
  });

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isNewListing, setIsNewListing] = useState(false);
  const [clickCount, setClickCount] = useState(0);

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

  const toggleFavorite = (e) => {
    e.preventDefault();
    if (!listing?._id) return;

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const updatedWishlist = newFavoriteStatus
        ? [...wishlist, listing]
        : wishlist.filter(item => item?._id !== listing._id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  };

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
      <div className="rounded-xl w-full relative overflow-hidden bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg max-w-sm mx-auto min-h-[380px]">
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
        : 'rounded-xl  hover:shadow-sm transition-all duration-200 overflow-hidden cursor-pointer w-full relative max-w-sm mx-auto flex flex-col'
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
              <img
                src={enhancedImages[0]?.url}
                alt={`${listing.name || 'Property'} image`}
                className={`w-full h-full rounded-2xl object-cover transition-transform duration-500 ${imageLoaded ? 'scale-100' : 'scale-110'} group-hover:scale-105`}
                loading="lazy"
                onError={(e) => { e.target.src = "https://placehold.co/600x400/E0E0E0/333333?text=No+Image"; }}
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
                  {isFavorite ? <FaHeart className="w-3.5 h-3.5 text-rose-600" /> : <FaRegHeart className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-gray-600 text-xs flex items-center mt-1">
                <MdLocationOn className="text-rose-600 mr-1 text-xs" />
                <span className="truncate">{listing.address || 'Address not available'}</span>
              </p>

            </div>

            <div className="mt-1.5 flex justify-between items-center">
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(
                  listing.offer ? listing.discountPrice : listing.regularPrice,
                  { type: listing.type }
                )}
              </div>
              <button
                onClick={(e) => { e.preventDefault(); setShowShareOptions(!showShareOptions); }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Share this property"
              >
                {/* Share icon would go here */}
              </button>
            </div>
          </div>

          {showShareOptions && (
            <div className="absolute right-0 top-8 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="py-1">
                <button onClick={(e) => { e.preventDefault(); shareListing('whatsapp'); }} className=" w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
                  <span className="i-logos-whatsapp-icon mr-2 text-green-500"></span> WhatsApp
                </button>
                <button onClick={(e) => { e.preventDefault(); shareListing('facebook'); }} className=" w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
                  <span className="i-logos-facebook mr-2 text-blue-600"></span> Facebook
                </button>
                <button onClick={(e) => { e.preventDefault(); shareListing('copy'); }} className=" w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
                  <span className="i-logos-clipboard mr-2 text-gray-500"></span> Copy Link
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={toggleFavorite}
            className="absolute top-1 right-3 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 hover:scale-110 group/favorite"
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isFavorite ? (
              <FaHeart className="w-3 h-3 text-rose-600" />
            ) : (
              <FaRegHeart className="w-3 h-3 text-gray-700 group-hover/favorite:text-rose-600" />
            )}
          </button>

          {/* ADDED: User avatar and first name in left corner */}
          {listing?.userRef?._id && (
            <div className="absolute top-1 left-3 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
              <div className="w-5 h-5 rounded-full overflow-hidden">
                {getUserAvatar()}
              </div>
              <span className="text-xs font-medium text-gray-700">{getUserFirstName()}</span>
            </div>
          )}

          <Link
            to={`/listing/${listing._id}`}
            className="block relative flex-grow-0"
            onClick={handleCardClick}
          >
            <div className="relative pb-[75%] bg-gray-0 overflow-hidden rounded-t-xl">
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="absolute inset-0 h-full w-full"
              >
                {enhancedImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative h-full w-full">
                      <img
                        src={img.url}
                        alt={`${listing.name || 'Property'} image ${index + 1}`}
                        className={`w-full h-full rounded-2xl object-cover transition-transform duration-500 ${imageLoaded ? 'scale-100' : 'scale-110'} group-hover:scale-105`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                          e.target.src = "https://placehold.co/600x400/E0E0E0/333333?text=No+Image";
                        }}
                      />
                      <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                        <span className="bg-white text-gray-800 px-1.5 py-0.5 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm bg-opacity-70">
                          {getPropertyTypeName(listing.type)}
                        </span>
                        {isNewListing && (
                          <span className="bg-green-500 text-white px-1.5 py-0.5 text-xs font-semibold rounded-full shadow-md">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* User avatar link - Standard Mode */}
                      {listing?.userRef?._id && (
                        <Link
                          to={`/user-listings/${listing.userRef._id}`}
                          className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getUserAvatar()}
                        </Link>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </Link>

          <div className="p-3 flex-grow flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-gray-900 truncate max-w-[70%] hover:text-blue-600 transition-colors">
                {listing.name || 'Property Name'}
              </h3>

            </div>

            <p className="text-gray-600 text-xs flex items-center">
              <MdLocationOn className="text-rose-600 mr-1 min-w-fit text-xs" />
              <span className="truncate hover:text-gray-800 transition-colors">
                {listing.address || 'Address not available'}
              </span>
            </p>

            <div className="flex items-center space-x-2 text-gray-700 text-xs">
              {listing.type !== 'land' && listing.type !== 'office' && (
                <>
                  <div className="flex items-center gap-1">
                    <FaBed className="text-gray-500 text-xs" />
                    <span>{listing.bedrooms || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaBath className="text-gray-500 text-xs" />
                    <span>{listing.bathrooms || 0}</span>
                  </div>
                </>
              )}
              {listing.type === 'office' && (
                <div className="flex items-center gap-1">
                  <span>{listing.squareMeters || listing.bedrooms || 0} sqm</span>
                </div>
              )}
              {listing.type === 'land' && (
                <div className="flex items-center gap-1">
                  <span>{listing.landArea || listing.bathrooms || 0} sqm</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(
                  listing.offer ? listing.discountPrice : listing.regularPrice,
                  { type: listing.type }
                )}
              </div>
<div className="flex items-center text-gray-600">
      <FaStar className="text-amber-500 text-[12px]" />
      <span className="font-medium text-gray-900 text-[13px] ml-1">
        {calculatedStarRating}
      </span>
  
    </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ListingItem;