/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdCalendarToday } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";

const NEW_EVENT_THRESHOLD_DAYS = 14; 
const CLICKS_PER_STAR = 20;

const EVENT_TYPE_COLORS = {
  music: "bg-purple-100 text-purple-800",
  sports: "bg-green-100 text-green-800",
  art: "bg-red-100 text-red-800",
  community: "bg-blue-100 text-blue-800",
  food: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800"
};

const formatPrice = (price) => {
  if (price === undefined || price === null || price === 0) {
    return <span className="font-bold text-gray-900">Free</span>;
  }

  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  return (
    <span className="font-bold text-gray-900">
      {formatter.format(price)}
      <span className="text-xs font-normal text-gray-500 ml-1">ticket</span>
    </span>
  );
};

const formatDateTime = (dateString, timeString) => {
  if (!dateString || !timeString) return 'Date not available';
  
  try {
    const dateTimeString = `${dateString}T${timeString}`;
    const eventDate = new Date(dateTimeString);
    
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);
    
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedTime = eventDate.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate} • ${formattedTime}`;
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return 'Invalid date/time';
  }
};

function EventItem({ event, className = "", compactMode = false }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('eventWishlist')) || [];
      setIsFavorite(event?._id ? wishlist.some(item => item?._id === event._id) : false);
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
    }

    if (event?.createdAt) {
      const creationDate = new Date(event.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - creationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIsNewEvent(diffDays <= NEW_EVENT_THRESHOLD_DAYS);
    }

    if (event?._id) {
      try {
        const storedClicks = JSON.parse(localStorage.getItem('eventClicks')) || {};
        setClickCount(storedClicks[event._id] || 0);
      } catch (error) {
        console.error('Error reading eventClicks from localStorage:', error);
      }
    }
  }, [event]);

  const handleCardClick = async () => {
    if (!event?._id) return;

    try {
      // Update view count in local storage
      const storedClicks = JSON.parse(localStorage.getItem('eventClicks')) || {};
      const newCount = (storedClicks[event._id] || 0) + 1;
      storedClicks[event._id] = newCount;
      localStorage.setItem('eventClicks', JSON.stringify(storedClicks));
      setClickCount(newCount);

      // Only try to call the API if we're not in development mode
      if (import.meta.env.MODE !== 'development') {
        try {
          const response = await fetch(`/api/event/${event._id}/view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.error('Failed to update view count on server');
          }
        } catch (error) {
          console.error('Error updating view count on server:', error);
        }
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const calculatedStarRating = Math.min(5, Math.max(1, Math.floor(clickCount / CLICKS_PER_STAR) + 1));

  const toggleFavorite = (e) => {
    e.preventDefault();
    if (!event?._id) return;

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const wishlist = JSON.parse(localStorage.getItem('eventWishlist')) || [];
      const updatedWishlist = newFavoriteStatus
        ? [...wishlist, event]
        : wishlist.filter(item => item?._id !== event._id);
      localStorage.setItem('eventWishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  };

  const enhancedImages = event?.imageUrls?.length > 0 
    ? event.imageUrls.map((img) => ({ url: img }))
    : [{ url: "https://placehold.co/600x400/E0E0E0/333333?text=No+Image" }];

  const shareEvent = (platform, e) => {
    e.preventDefault();
    if (!event?._id || !event?.type || !event?.name || !event?.address) return;

    const eventUrl = `${window.location.origin}/event/${event._id}`;
    const shareText = `Check out this ${event.type} event: ${event.name} at ${event.address}`;

    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${eventUrl}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${eventUrl}`)
          .then(() => {
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
          })
          .catch(err => {
            console.error('Failed to copy link:', err);
          });
        break;
      default:
        break;
    }
    setShowShareOptions(false);
  };

  if (!event?._id) {
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
      to={`/event/${event._id}`}
      className={`${className} ${
        compactMode 
         ? 'flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg w-full'
          : 'rounded-xl hover:shadow-sm transition-all duration-200 overflow-hidden cursor-pointer w-full relative max-w-sm mx-auto flex flex-col'
        }`}
      onClick={handleCardClick}
    >
      {compactMode ? (
        <>
          <div className="relative w-24 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={enhancedImages[0]?.url}
              alt={`${event.name || 'Event'} image`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.src = "https://placehold.co/600x400/E0E0E0/333333?text=No+Image"; }}
            />
            {isNewEvent && (
              <span className="absolute top-1 left-1 bg-green-500 text-white px-1.5 py-0.5 text-[10px] font-semibold rounded-full shadow-xs">
                NEW
              </span>
            )}
          </div>
          
          <div className="flex-grow flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {event.name || 'Event Name'}
                </h3>
                <button
                  onClick={toggleFavorite}
                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors ml-2"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? <FaHeart className="w-3.5 h-3.5 text-rose-600" /> : <FaRegHeart className="w-3.5 h-3.5" />}
                </button>
              </div>
              
              {event.type && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-800'} mt-1 inline-block`}>
                  {event.type}
                </span>
              )}
              
              <p className="text-gray-600 text-xs flex items-center mt-1">
                <MdCalendarToday className="text-blue-500 mr-1 text-xs" />
                <span className="truncate">{formatDateTime(event.date, event.time)}</span>
              </p>
              
              <div className="mt-2 flex items-center gap-1 text-sm font-bold text-gray-900">
                {formatPrice(event.regularPrice)}
              </div>
            </div>
          </div>
          
          {showShareOptions && (
            <div className="absolute right-2 top-8 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="py-1">
                <button onClick={(e) => shareEvent('whatsapp', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center">
                  WhatsApp
                </button>
                <button onClick={(e) => shareEvent('facebook', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center">
                  Facebook
                </button>
                <button onClick={(e) => shareEvent('copy', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
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
            <div className="relative pb-[75%] bg-gray-100 overflow-hidden rounded-t-xl">
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
                        alt={`${event.name || 'Event'} image ${index + 1}`}
                        className={`w-full h-full rounded-2xl object-cover transition-transform duration-500 ${imageLoaded ? 'scale-100' : 'scale-110'} group-hover:scale-105`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                          e.target.src = "https://placehold.co/600x400/E0E0E0/333333?text=No+Image";
                        }}
                      />
                      <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                        {event.type && (
                          <span className={`text-xs px-2 py-1 rounded-full ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-800'} font-medium`}>
                            {event.type}
                          </span>
                        )}
                        
                        {isNewEvent && (
                          <span className="bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded-full shadow-md">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="p-3 flex-grow flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-gray-900 truncate max-w-[70%]">
                {event.name || 'Event Name'}
              </h3>
              
              <div className="flex items-center text-xs bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200">
                <FaStar className="text-yellow-400" />
                <span className="ml-1 font-medium">{calculatedStarRating}</span>
                <span className="text-gray-500 ml-1">({clickCount})</span>
              </div>
            </div>

            <p className="text-gray-600 text-xs flex items-center"> 
              <MdCalendarToday className="text-blue-500 mr-1 min-w-fit text-xs" />
              <span className="truncate hover:text-gray-800 transition-colors">
                {formatDateTime(event.date, event.time)}
              </span>
            </p>

        

            <div className="flex items-center justify-between pt-0 mt-auto">
              <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                {formatPrice(event.regularPrice)}
              </div>
            </div>
          </div>
          
          {showShareOptions && (
            <div className="absolute bottom-16 right-3 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="py-1">
                <button onClick={(e) => shareEvent('whatsapp', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center">
                  WhatsApp
                </button>
                <button onClick={(e) => shareEvent('facebook', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center">
                  Facebook
                </button>
                <button onClick={(e) => shareEvent('copy', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Link>
  );
}

export default EventItem;