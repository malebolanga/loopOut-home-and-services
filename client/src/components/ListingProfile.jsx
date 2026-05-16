/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaBed, FaBath, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
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

  const suffix = ['over', 'sale', 'land'].includes(context?.type) ? '/night' :
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
    case 'sale': return 'Hotel';
    case 'rent-short': return 'Short Term';
    case 'rent-long': return 'Long Term';
    case 'office': return 'Office';
    case 'land': return 'Self Catering';
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

  // User avatar display logic
  const getUserAvatar = () => {
    if (listing?.userRef?.avatar) {
      return (
        <img
          src={listing.userRef.avatar}
          alt={listing.userRef.username || 'User'}
          className="w-full h-full rounded-full object-cover"
        />
      );
    }

    const initials = listing?.userRef?.username
      ? listing.userRef.username.slice(0, 2).toUpperCase()
      : 'U';

    return (
      <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold">
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
          <div className="bg-gray-200 h-48 rounded-lg"></div>
          <div className="mt-3 space-y-2">
            <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            <div className="bg-gray-200 h-5 w-1/3 rounded mt-2"></div>
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
                <Link
                  to={`/user-listings/${listing.userRef._id}`}
                  className="absolute bottom-1 left-1 z-10 w-6 h-6 rounded-full border-2 border-white shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getUserAvatar()}
                </Link>
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

          <Link
            to={`/listing/${listing._id}`}
            className="block relative flex-grow-0"
            onClick={handleCardClick}
          >
            <div className="relative pb-[75%] bg-gray-50 overflow-hidden rounded-t-xl">
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                observer={true}
                observeParents={true}
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

              <div className="flex items-center text-xs bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-medium">{calculatedStarRating.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-gray-600 text-xs flex items-center">
              <MdLocationOn className="text-rose-600 mr-1 min-w-fit text-xs" />
              <span className="truncate hover:text-gray-800 transition-colors">
                {listing.address || 'Address not available'}
              </span>
            </p>

            <div className="flex items-center space-x-2 text-gray-700 text-xs">
              {listing.type !== 'office' && (
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

            </div>

            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(
                  listing.offer ? listing.discountPrice : listing.regularPrice,
                  { type: listing.type }
                )}
              </div>

              <div className="relative">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShareOptions(!showShareOptions); }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Share this property"
                >
                  {/* Share icon would go here */}
                </button>

                {showShareOptions && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareListing('whatsapp'); }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareListing('facebook'); }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                        </svg>
                        Facebook
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareListing('twitter'); }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-black/5 hover:text-gray-900 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X (Twitter)
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareListing('copy'); }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center border-t border-gray-100"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ListingItem;
