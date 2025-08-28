/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn, MdTrendingUp, MdShare } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";

// AI-powered engagement analyzer with time decay
const analyzeEngagement = (timestamps) => {
  const now = Date.now();
  const decayRate = 0.2;
  let weightedCount = 0;
  let dailyCounts = Array(5).fill(0);

  timestamps.forEach(ts => {
    const date = new Date(ts);
    if (isNaN(date)) return;

    const hoursOld = (now - date) / (1000 * 3600);
    const daysOld = hoursOld / 24;
    
    const decayFactor = Math.exp(-decayRate * daysOld);
    weightedCount += decayFactor;

    if (daysOld < 5) {
      const dayIndex = Math.floor(daysOld);
      if (dayIndex < 5) dailyCounts[dayIndex] += 1;
    }
  });

  return {
    rawCount: timestamps.length,
    weightedCount,
    dailyCounts,
    isHot: weightedCount > 25 || Math.max(...dailyCounts) > 8
  };
};

const formatPrice = (price, context) => {
  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  const suffix = context?.type === 'over' ? '/night' : 
                ['rent', 'office'].includes(context?.type) ? '/month' : '';

  return (
    <div className="price-container">
      <span className="font-bold">
        {formatter.format(price)}
        {suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
      </span>
    </div>
  );
};

const calculateListingScore = (listing, engagement) => {
  const baseScore = listing.rating * 20 + (listing.reviews?.length || 0) * 2;
  const engagementScore = engagement.weightedCount * 0.5 + engagement.rawCount * 0.3;
  const mediaScore = listing.imageUrls?.length * 5;
  const freshnessScore = new Date(listing.createdAt) > new Date(Date.now() - 15 * 86400000) ? 15 : 0;
  
  return Math.min(100, baseScore + engagementScore + mediaScore + freshnessScore);
};

const ListingItem = ({ listing, distance, marketContext }) => {
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      return wishlist.some(item => item._id === listing._id);
    } catch (error) {
      console.error('Error reading wishlist:', error);
      return false;
    }
  });
  
  const [clickTimestamps, setClickTimestamps] = useState([]);
  const [engagement, setEngagement] = useState({
    rawCount: 0,
    weightedCount: 0,
    dailyCounts: [0, 0, 0, 0, 0],
    isHot: false
  });
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Load engagement data
  useEffect(() => {
    const storedData = localStorage.getItem(`engagement-${listing._id}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const validTimestamps = parsedData
          .filter(ts => typeof ts === 'string' && !isNaN(new Date(ts)));
        setClickTimestamps(validTimestamps);
        setEngagement(analyzeEngagement(validTimestamps));
      } catch (error) {
        console.error('Error loading engagement data:', error);
      }
    }
  }, [listing._id]);

  // Toggle favorite status and update localStorage
  const toggleFavorite = (e) => {
    e.preventDefault();
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

      if (newFavoriteStatus) {
        if (!wishlist.some(item => item._id === listing._id)) {
          const updatedWishlist = [...wishlist, listing];
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        }
      } else {
        const updatedWishlist = wishlist.filter(item => item._id !== listing._id);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      }

      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Guest Favorite determination
  const isGuestFavorite = useMemo(() => {
    if (!['rent', 'over'].includes(listing.type)) return false;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 5);
    cutoffDate.setHours(0, 0, 0, 0);

    const recentClicks = clickTimestamps.filter(ts => {
      const clickDate = new Date(ts);
      return !isNaN(clickDate) && clickDate > cutoffDate;
    }).length;

    return recentClicks >= 20 || engagement.isHot;
  }, [clickTimestamps, listing.type, engagement.isHot]);

  // Click handler with AI tracking
  const handleListingClick = () => {
    const newTimestamps = [...clickTimestamps, new Date().toISOString()].slice(-50);
    const analyzed = analyzeEngagement(newTimestamps);
    setClickTimestamps(newTimestamps);
    setEngagement(analyzed);
    localStorage.setItem(`engagement-${listing._id}`, JSON.stringify(newTimestamps));
  };

  const isNewListing = useMemo(() => {
    const createdAtDate = new Date(listing.createdAt);
    return !isNaN(createdAtDate) && (Date.now() - createdAtDate) < 15 * 86400000;
  }, [listing.createdAt]);

  const isTrending = useMemo(() => 
    engagement.dailyCounts[0] > 5 || engagement.weightedCount > 30,
    [engagement]
  );

  const enhancedImages = useMemo(() => 
    (listing.imageUrls?.length > 0 ? listing.imageUrls : ["/placeholder-property.jpg"])
      .map((img) => ({
        url: img,
        tags: ["Interior", "Well-lit", "Modern Design"].slice(0, Math.floor(Math.random() * 3))
      })),
    [listing.imageUrls]
  );

  // Share listing function
  const shareListing = (platform) => {
    const listingUrl = `${window.location.origin}/listing/${listing._id}`;
    const shareText = `Check out this ${listing.type} property: ${listing.name} - ${listing.address}`;
    
    switch(platform) {
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
      default:
        navigator.clipboard.writeText(`${shareText} ${listingUrl}`)
          .then(() => alert('Link copied to clipboard!'))
          .catch(() => alert('Failed to copy link'));
    }
    
    setShowShareOptions(false);
  };

  return (
    <div className="group rounded-xl transition-all duration-300 w-full relative overflow-hidden  border-gray-100 hover:border-gray-200">
      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        {isGuestFavorite && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
            <FaStar className="mr-1 text-xs" /> Guest Favorite
          </div>
        )}
        {isTrending && (
          <div className="bg-gradient-to-r from-rose-600 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
            <MdTrendingUp className="mr-1" /> Trending
          </div>
        )}
        {isNewListing && (
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
            New Listing
          </div>
        )}
      </div>
    
      {/* Image Carousel */}
      <Link 
        to={`/listing/${listing._id}`} 
        className="block relative"
        onClick={handleListingClick}
      >
        <div className="relative pb-[75%] bg-gray-100 overflow-hidden rounded-t-xl">
        <Swiper
  modules={[Pagination, Autoplay]}
  pagination={{ 
    clickable: true, 
    dynamicBullets: true,
    bulletClass: 'swiper-pagination-bullet',
    bulletActiveClass: 'swiper-pagination-bullet-active'
  }}
  autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
  className="absolute inset-0 h-full w-full"
>
            {enhancedImages.map((img, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-full w-full">
                  <img
                    src={img.url}
                    alt={`${listing.name} - ${img.tags?.join(", ")}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder-property.jpg";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
                    <div className="text-white text-xs space-x-1">
                      {img.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full mr-1 mb-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Link>
    
      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-all duration-200 hover:scale-110"
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        title={isFavorite ? "Remove from saved properties" : "Save this property"}
      >
        {isFavorite ? (
          <FaHeart className="w-5 h-5 text-rose-600" />
        ) : (
          <FaRegHeart className="w-5 h-5 text-gray-700 group-hover:text-rose-600" />
        )}
      </button>
    
      {/* Listing Details */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.name}</h3>
          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-gray-900 text-sm font-medium">
              {Math.round(calculateListingScore(listing, engagement))}%
            </span>
          </div>
        </div>
    
        <p className="text-gray-500 text-sm flex items-center">
          <MdLocationOn className="text-rose-600 mr-1 min-w-fit" />
          <span className="truncate">{listing.address}</span>
        </p>
    
        {distance && (
          <p className="text-sm text-gray-500">
            {distance.toFixed(1)} km from city center
          </p>
        )}
    
        <div className="pt-1">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(
              listing.offer ? listing.discountPrice : listing.regularPrice,
              { ...marketContext, type: listing.type }
            )}
          </div>
          {listing.offer && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(listing.regularPrice, { ...marketContext, type: listing.type })}
            </p>
          )}
        </div>
    
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm">
            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">
              {listing.type === 'sale' ? 'For Sale' :
               listing.type === 'rent-short' ? 'Short Term' :
               listing.type === 'rent-long' ? 'Long Term' :
               listing.type === 'office' ? 'Office Space' :
               listing.type === 'land' ? 'Land' :
               'Available'}
            </span>
            <span className="text-gray-500">
              {listing.type === 'office' || listing.type === 'land' ? 
                `${listing.bedrooms  || 0} sqm` : 
                `${listing.bedrooms || 0} bed`
              } · {listing.bathrooms || 0} bath
            </span>
          </div>
          
          {/* Share Button */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setShowShareOptions(!showShareOptions);
              }}
              className="text-gray-500 hover:text-rose-600 transition-colors flex items-center p-1 rounded-full hover:bg-gray-100"
              aria-label="Share this property"
            >
              <MdShare className="w-5 h-5" />
            </button>
            
            {/* Share Options Dropdown */}
            {showShareOptions && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100">
                <div className="py-1">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      shareListing('whatsapp');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      shareListing('facebook');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Facebook
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      shareListing('twitter');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    X (Twitter)
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      shareListing('email');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Email
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      shareListing('copy');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingItem;