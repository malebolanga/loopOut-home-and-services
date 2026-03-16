/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import "../styles/ListingDetails.scss";
import ImageGallery from "./ImageGallery";

const NEW_HELPER_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;
const MIN_POSITIVE_REVIEWS = 5;
const POSITIVE_KEYWORDS = [
  'good', 'great', 'excellent', 'perfect', 'amazing',
  'love', 'loved', 'wonderful', 'fantastic', 'superb',
  'outstanding', 'awesome', 'best', 'recommend', 'happy'
];

// Updated helper type colors with beauty
const HELPER_TYPE_COLORS = {
  tutor: "bg-blue-100 text-blue-800",
  caregiver: "bg-amber-100 text-amber-800",
  handyman: "bg-purple-100 text-purple-800",
  cleaner: "bg-green-100 text-green-800",
  beauty: "bg-pink-100 text-pink-800",
  Barber: "bg-red-100 text-red-800", // Added red color scheme
  other: "bg-gray-100 text-gray-800"
};

const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return <span className="font-bold text-gray-900">Price not available</span>;
  }

  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  return (
    <span className="font-bold text-gray-900">
      {formatter.format(price)}
      <span className="text-xs font-normal text-gray-500 ml-1">/work</span>
    </span>
  );
};

// Updated helper type names with beauty
// Updated helper type names with beauty and photographer
const getHelperTypeName = (type) => {
  switch (type) {
    case 'domestic': return 'Domestic Worker';
    case 'maid': return 'Maid';
    case 'tutor': return 'Tutor';
    case 'chef': return 'Chef';
    case 'handyman': return 'Handyman';
    case 'tattoo': return 'Tattoo Artist';
    case 'beauty': return 'Beauty';
    case 'barber': return 'Barber';
    case 'photography': return 'Photographer';
    default: return 'Helper';
  }
};

function HelperItem({ helper, className = "", compactMode = false }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isNewHelper, setIsNewHelper] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [hasPositivePromo, setHasPositivePromo] = useState(false);

  // Calculate promo eligibility using useMemo for performance
  const calculatePositivePromo = useMemo(() => {
    if (!helper?.reviews || helper.reviews.length < MIN_POSITIVE_REVIEWS) {
      return false;
    }

    const positiveReviews = helper.reviews.filter(review => {
      if (!review.comment) return false;
      const comment = review.comment.toLowerCase();
      return POSITIVE_KEYWORDS.some(keyword => comment.includes(keyword));
    });

    return positiveReviews.length >= MIN_POSITIVE_REVIEWS;
  }, [helper]);

  useEffect(() => {
    // Initialize favorite status from local storage
    try {
      const wishlist = JSON.parse(localStorage.getItem('helperWishlist')) || [];
      setIsFavorite(helper?._id ? wishlist.some(item => item?._id === helper._id) : false);
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
    }

    // Check if helper is new based on creation date
    if (helper?.createdAt) {
      const creationDate = new Date(helper.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - creationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIsNewHelper(diffDays <= NEW_HELPER_THRESHOLD_DAYS);
    }

    // Initialize click count from local storage
    if (helper?._id) {
      try {
        const storedClicks = JSON.parse(localStorage.getItem('helperClicks')) || {};
        setClickCount(storedClicks[helper._id] || 0);
      } catch (error) {
        console.error('Error reading helperClicks from localStorage:', error);
      }
    }

    // Set promo eligibility
    setHasPositivePromo(calculatePositivePromo);
  }, [helper, calculatePositivePromo]);

  // Handle click on the helper card
  const handleCardClick = async () => {
    if (!helper?._id) return;

    try {
      // Update view count in local storage
      const storedClicks = JSON.parse(localStorage.getItem('helperClicks')) || {};
      const newCount = (storedClicks[helper._id] || 0) + 1;
      storedClicks[helper._id] = newCount;
      localStorage.setItem('helperClicks', JSON.stringify(storedClicks));
      setClickCount(newCount);

      // NOTE: The following fetch call is commented out because it's causing a 404 error.
      // This typically means the backend API endpoint for tracking views is not yet implemented.
      // To fully resolve this, you would need to set up a corresponding POST endpoint on your server
      // at `/api/helper/:id/view` that increments a view counter in your database.
      /*
      await fetch(`/api/helper/${helper._id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      */
    } catch (error) {
      console.error('Error updating view count:', error);
      // You could add a user-facing message here if needed, e.g., using a state variable
      // to display a temporary notification.
    }
  };

  // Calculate star rating based on click count
  const calculatedStarRating = Math.min(5, Math.max(1, Math.floor(clickCount / CLICKS_PER_STAR) + 1));

  // Toggle favorite status and update local storage
  const toggleFavorite = (e) => {
    e.preventDefault(); // Prevent default link behavior
    if (!helper?._id) return;

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const wishlist = JSON.parse(localStorage.getItem('helperWishlist')) || [];
      const updatedWishlist = newFavoriteStatus
        ? [...wishlist, helper]
        : wishlist.filter(item => item?._id !== helper._id);
      localStorage.setItem('helperWishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage')); // Dispatch event to notify other components
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  };

  // Helper images handled by ImageGallery

  // Function to share helper details to different platforms
  const shareHelper = (platform, e) => {
    e.preventDefault(); // Prevent default button behavior
    if (!helper?._id || !helper?.type || !helper?.name || !helper?.address) return;

    const helperUrl = `${window.location.origin}/helper/${helper._id}`;
    const shareText = `Check out this ${getHelperTypeName(helper.type)}: ${helper.name} - ${helper.address}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${helperUrl}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(helperUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        // Use document.execCommand('copy') for clipboard operations in iframes
        // eslint-disable-next-line no-case-declarations
        const tempInput = document.createElement('textarea');
        tempInput.value = `${shareText} ${helperUrl}`;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        // eslint-disable-next-line no-case-declarations
        const messageBox = document.createElement('div');
        messageBox.innerText = 'Link copied to clipboard!';
        messageBox.style.cssText = `
          position: fixed; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%);
          background-color: rgba(0,0,0,0.7); 
          color: white; 
          padding: 10px 20px;
          border-radius: 8px; 
          z-index: 1000; 
          font-size: 14px;
        `;
        document.body.appendChild(messageBox);
        setTimeout(() => messageBox.remove(), 3000);
        break;
      default:
        break;
    }
    setShowShareOptions(false);
  };

  // Render a loading skeleton if helper data is not available
  if (!helper?._id) {
    return (
      <div className={`${className} rounded-2xl w-full relative overflow-hidden bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg h-[420px] max-w-sm mx-auto`}>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-xl"></div>
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
    <Link
      to={`/helper/${helper._id}`}
      className={`${className} ${compactMode
        ? 'flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg w-full'
        : 'rounded-xl hover:shadow-sm transition-all duration-200 overflow-hidden cursor-pointer w-full relative max-w-sm mx-auto flex flex-col'
        }`}
      onClick={handleCardClick}
    >
      {compactMode ? (
        <>
          {/* Compact Mode Layout */}
          <div className="relative w-24 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <ImageGallery
              imageUrls={helper.imageUrls || []}
              type="helper"
              alt={`${helper.name || 'Helper'} image`}
              className="w-full h-full object-cover"
            />
            {isNewHelper && (
              <span className="absolute top-1 left-1 bg-green-500 text-white px-1.5 py-0.5 text-[10px] font-semibold rounded-full shadow-xs">
                NEW
              </span>
            )}
            {/* PROMO BELT - Compact Mode */}
            {hasPositivePromo && (
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-[9px] font-bold text-center px-1 py-0.5 truncate">
                ★★★★★ HIGHLY RECOMMENDED
              </span>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {helper.name || 'Helper Name'}
                </h3>
                <button
                  onClick={toggleFavorite}
                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors ml-2"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? <FaHeart className="w-3.5 h-3.5 text-rose-600" /> : <FaRegHeart className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Helper Type Badge */}
              {helper.type && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${HELPER_TYPE_COLORS[helper.type] || 'bg-gray-100 text-gray-800'} mt-1 inline-block`}>
                  {getHelperTypeName(helper.type)}
                </span>
              )}

              <p className="text-gray-600 text-xs flex items-center mt-1">
                <MdLocationOn className="text-rose-600 mr-1 text-xs" />
                <span className="truncate">{helper.address || 'Location not available'}</span>
              </p>

              <div className="mt-2 flex items-center gap-1 text-sm font-bold text-gray-900">
                {formatPrice(helper.regularPrice)}
              </div>
            </div>

            <div className="mt-1.5 flex justify-end">
              <button
                onClick={(e) => { e.preventDefault(); setShowShareOptions(!showShareOptions); }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Share this helper"
              >
                {/* Share icon would go here */}
              </button>
            </div>
          </div>

          {showShareOptions && (
            <div className="absolute right-2 top-8 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="py-1">
                <button onClick={(e) => shareHelper('whatsapp', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center">
                  WhatsApp
                </button>
                <button onClick={(e) => shareHelper('facebook', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center">
                  Facebook
                </button>
                <button onClick={(e) => shareHelper('copy', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Standard Card Layout */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 hover:scale-110 group/favorite"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="w-4 h-4 text-rose-600" />
            ) : (
              <FaRegHeart className="w-4 h-4 text-gray-700 group-hover/favorite:text-rose-600" />
            )}
          </button>

          <div className="block relative flex-grow-0">
            <div className="relative pb-[75%] bg-gray-100 overflow-hidden rounded-t-xl group/image">
              <div className="absolute inset-0 h-full w-full">
                <ImageGallery
                  imageUrls={helper.imageUrls || []}
                  type="helper"
                  alt={`${helper.name || 'Helper'} image`}
                  className="w-full h-full rounded-t-xl"
                />
                
                <div className="absolute top-2 left-2 z-30 flex flex-col gap-1.5 items-start pointer-events-none">
                  {/* PROMO BELT - Standard Mode */}
                  {hasPositivePromo && (
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                      ★★★★★ HIGHLY RECOMMENDED
                    </span>
                  )}

                  <div className="flex gap-1.5 flex-wrap">
                    {/* Helper Type Badge */}
                    {helper.type && (
                      <span className={`text-xs px-2 py-1 rounded-full ${HELPER_TYPE_COLORS[helper.type] || 'bg-gray-100 text-gray-800'} font-medium`}>
                        {getHelperTypeName(helper.type)}
                      </span>
                    )}

                    {isNewHelper && (
                      <span className="bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded-full shadow-md">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 flex-grow flex flex-col space-y-2">
            {/* Header with rating */}
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-gray-900 truncate pr-2 leading-tight">
                  {helper.name || 'Helper Name'}
                </h3>

                {/* Location */}
                <div className="flex items-center mt-0">
                  <MdLocationOn className="text-rose-500 mr-1 flex-shrink-0 text-[13px]" />
                  <span className="text-gray-600 text-[13px] truncate">
                    {helper.address || 'Location not available'}
                  </span>
                </div>
              </div>

              {/* Airbnb-style compact rating */}

            </div>

            {/* Price section - Airbnb style */}
            <div className="mt-auto pt-0">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline">
                  <span className="text-[15px] font-semibold text-gray-900">
                    {formatPrice(helper.regularPrice)}
                  </span>

                </div>

                <div className="flex items-center text-gray-600">
                  <FaStar className="text-amber-500 text-[12px]" />
                  <span className="font-medium text-gray-900 text-[13px] ml-1">
                    {calculatedStarRating}
                  </span>

                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}

export default HelperItem;
