/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar, FaUser, FaChild, FaBus, FaBroom, FaWrench, FaTruck, FaLeaf, FaUtensils, FaCog } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWishlist } from "../hooks/useWishlist";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";
import ImageWithFallback from "./ImageWithFallback";

const NEW_SERVICE_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;

const SERVICE_TYPE_COLORS = {
  cleaning: "bg-blue-100 text-blue-800",
  maintenance: "bg-amber-100 text-amber-800",
  moving: "bg-purple-100 text-purple-800",
  landscaping: "bg-green-100 text-green-800",
  catering: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
  daycare: "bg-yellow-100 text-yellow-800",
  schoolTransport: "bg-teal-100 text-teal-800"
};

const SERVICE_ICON_CONFIG = {
  cleaning:        { icon: FaBroom,    bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Cleaning' },
  maintenance:     { icon: FaWrench,   bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Maintenance' },
  moving:          { icon: FaTruck,    bg: 'bg-purple-100', text: 'text-purple-700', label: 'Moving' },
  landscaping:     { icon: FaLeaf,     bg: 'bg-green-100',  text: 'text-green-700',  label: 'Landscaping' },
  catering:        { icon: FaUtensils, bg: 'bg-red-100',    text: 'text-red-700',    label: 'Catering' },
  daycare:         { icon: FaChild,    bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Day Care' },
  schoolTransport: { icon: FaBus,      bg: 'bg-teal-100',   text: 'text-teal-700',   label: 'School Transport' },
  other:           { icon: FaCog,      bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Other' },
};

function ServiceTypePill({ type }) {
  const cfg = SERVICE_ICON_CONFIG[type] || { icon: FaCog, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Service' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

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
      <span className="text-xs font-normal text-gray-500 ml-1">/service</span>
    </span>
  );
};

const getServiceTypeName = (type) => {
  switch (type) {
    case 'cleaning': return 'Cleaning';
    case 'maintenance': return 'Maintenance';
    case 'moving': return 'Moving';
    case 'landscaping': return 'Landscaping';
    case 'catering': return 'Catering';
    case 'other': return 'Other';
    case 'daycare': return 'DayCare';
    case 'schoolTransport': return 'School Transport';
    default: return 'Service';
  }
};

function ServiceItem({ service, className = "", compactMode = false }) {
  const { currentUser } = useSelector((state) => state.user);
  const { isFavorite, toggleFavorite } = useWishlist(service, 'service');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isNewService, setIsNewService] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (service?.createdAt) {
      const creationDate = new Date(service.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - creationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIsNewService(diffDays <= NEW_SERVICE_THRESHOLD_DAYS);
    }

    if (service?._id) {
      try {
        const storedClicks = JSON.parse(localStorage.getItem('serviceClicks')) || {};
        setClickCount(storedClicks[service._id] || 0);
      } catch (error) {
        console.error('Error reading serviceClicks from localStorage:', error);
      }

      // Fetch accurate rating data
      const fetchRating = async () => {
        try {
          const res = await fetch(`/api/service-comments/${service._id}?limit=1`);
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
  }, [service]);

  const handleCardClick = async () => {
    if (!service?._id) return;

    try {
      // Update view count in local storage
      const storedClicks = JSON.parse(localStorage.getItem('serviceClicks')) || {};
      const newCount = (storedClicks[service._id] || 0) + 1;
      storedClicks[service._id] = newCount;
      localStorage.setItem('serviceClicks', JSON.stringify(storedClicks));
      setClickCount(newCount);

      // Only try to call the API if we're not in development mode
      if (import.meta.env.MODE !== 'development') {
        try {
          const response = await fetch(`/api/service/${service._id}/view`, {
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

  const enhancedImages = service?.imageUrls?.length > 0
    ? service.imageUrls.map((img) => ({ url: img }))
    : [{ url: "https://placehold.co/600x400/E0E0E0/333333?text=No+Image" }];

  const getServiceIcon = () => {
    switch (service.type) {
      case 'daycare': return <FaChild className="mr-1 text-xs" />;
      case 'schoolTransport': return <FaBus className="mr-1 text-xs" />;
      default: return <MdLocationOn className="text-rose-600 mr-1 text-xs" />;
    }
  };

  const getLocationLabel = () => {
    switch (service.type) {
      case 'daycare': return 'Location';
      case 'schoolTransport': return 'Covered Areas';
      default: return service.address || 'Location not available';
    }
  };

  const shareService = (platform, e) => {
    e.preventDefault();
    if (!service?._id || !service?.type || !service?.name || !service?.address) return;

    const serviceUrl = `${window.location.origin}/service/${service._id}`;
    const shareText = `Check out this ${getServiceTypeName(service.type)} service: ${service.name} - ${service.address}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${serviceUrl}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(serviceUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${serviceUrl}`)
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

  if (!service?._id) {
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

  // Get user's first name from username
  const getUserFirstName = () => {
    if (!service?.userRef?.username) return 'User';
    const username = service.userRef.username;
    const firstName = username.split(/[._\s]/)[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const getUserAvatar = () => {
    if (service?.userRef?.avatar) {
      return (
        <img
          src={service.userRef.avatar}
          alt={service.userRef.username}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-[10px]">
        {service?.userRef?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <Link
      to={`/service/${service._id}`}
      className={`${className} ${compactMode
          ? 'flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg w-full'
          : 'rounded-xl hover:shadow-sm transition-all duration-200 overflow-hidden cursor-pointer w-full relative max-w-sm mx-auto flex flex-col'
        }`}
      onClick={handleCardClick}
    >
      {compactMode ? (
        <>
          <div className="relative w-24 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={enhancedImages[0]?.url}
              imageUrls={service.imageUrls}
              type="service"
              alt={`${service.name || 'Service'} image`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isNewService && (
              <span className="absolute top-1 left-1 bg-green-500 text-white px-1.5 py-0.5 text-[10px] font-semibold rounded-full shadow-xs">
                NEW
              </span>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {service.name || 'Service Name'}
                </h3>
                <button
                  onClick={toggleFavorite}
                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors ml-2"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? <FaHeart className="w-3.5 h-3.5 text-rose-600" /> : <FaRegHeart className="w-3.5 h-3.5" />}
                </button>
              </div>

              {service.type && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${SERVICE_TYPE_COLORS[service.type]} mt-1 inline-block`}>
                  {service.type === 'daycare' ? 'DayCare' : service.type === 'schoolTransport' ? 'School' : service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                </span>
              )}

              <p className="text-gray-600 text-xs flex items-center mt-1">
                {getServiceIcon()}
                <span className="truncate">
                  {service.type === 'daycare' || service.type === 'schoolTransport'
                    ? getLocationLabel()
                    : service.address || 'Location not available'}
                </span>
              </p>
              <div className="mt-1.5">
                <ServiceTypePill type={service.type} />
              </div>

              {service.type === 'daycare' && service.capacity && (
                <p className="text-gray-600 text-xs flex items-center mt-1">
                  <FaUser className="text-gray-500 mr-1 text-xs" />
                  <span>Capacity: {service.capacity}</span>
                </p>
              )}

              {service.type === 'schoolTransport' && service.vehicleType && (
                <p className="text-gray-600 text-xs flex items-center mt-1">
                  <FaBus className="text-gray-500 mr-1 text-xs" />
                  <span>Vehicle: {service.vehicleType}</span>
                </p>
              )}

              <div className="mt-2 flex items-center justify-between w-full">
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(service.regularPrice)}
                </span>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium text-gray-900 text-[12px] mr-0.5">
                    {ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}
                  </span>
                  <FaStar className="text-amber-500 text-[10px]" />
                  {ratingData.count > 0 && <span className="text-[9px] text-gray-400 ml-1">({ratingData.count})</span>}
                </div>
              </div>
            </div>
          </div>

          {showShareOptions && (
            <div className="absolute right-2 top-8 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="py-1">
                <button onClick={(e) => shareService('whatsapp', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center">
                  WhatsApp
                </button>
                <button onClick={(e) => shareService('facebook', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center">
                  Facebook
                </button>
                <button onClick={(e) => shareService('copy', e)} className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center">
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

          {/* ADDED: User avatar and first name in left corner */}
          {service?.userRef?._id && (
            <div className="absolute top-2 left-3 z-[15] flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-md transition-transform hover:scale-105">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/50">
                {getUserAvatar()}
              </div>
              <span className="text-[10px] font-semibold text-gray-700 leading-none">{getUserFirstName()}</span>
            </div>
          )}

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
                      <ImageWithFallback
                        src={img.url}
                        imageUrls={index === 0 ? service.imageUrls : undefined}
                        type="service"
                        alt={`${service.name || 'Service'} image ${index + 1}`}
                        className={`w-full h-full rounded-2xl object-cover transition-transform duration-500 ${imageLoaded ? 'scale-100' : 'scale-110'} group-hover:scale-105`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                      />
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 items-start">
                        {service.type && (
                          <span className={`text-xs px-2 py-1 rounded-full ${SERVICE_TYPE_COLORS[service.type] || 'bg-gray-100 text-gray-800'} font-medium`}>
                            {service.type === 'daycare' ? 'Day Care' :
                              service.type === 'schoolTransport' ? 'School Transport' :
                                getServiceTypeName(service.type)}
                          </span>
                        )}

                        {isNewService && (
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
                {service.name || 'Service Name'}
              </h3>

            </div>

            <p className="text-gray-600 text-xs flex items-center mt-0">
              <MdLocationOn className="text-rose-600 mr-1 text-xs" />
              <span className="truncate">{service.address || 'Location not available'}</span>
            </p>
            <div className="mt-1.5">
              <ServiceTypePill type={service.type} />
            </div>

            <div className="mt-auto pt-0">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline">
                  <span className="text-[15px] font-semibold text-gray-900">
                    {formatPrice(service.regularPrice)}
                  </span>

                </div>

                <div className="flex items-center text-gray-600">
                  <FaStar className="text-amber-500 text-[12px]" />
                  <span className="font-medium text-gray-900 text-[13px] ml-1">
                    {ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}
                  </span>
                  {ratingData.count > 0 && <span className="text-[10px] text-gray-400 ml-1">({ratingData.count})</span>}
                </div>
              </div>
            </div>
          </div>


        </>
      )}
    </Link>
  );
}

export default ServiceItem;