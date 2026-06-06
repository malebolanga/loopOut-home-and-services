/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaHeart, FaRegHeart, FaBed, FaBath, FaEye } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";

const ListingItem = ({ listing, distance, hideBedroom = false }) => { // Added hideBedroom prop
  const [isFavorite, setIsFavorite] = useState(false);
  const [clickTimestamps, setClickTimestamps] = useState([]);
  const [setUserListings] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Calculate recent clicks within last 5 days
  const recentClicks = clickTimestamps.filter(timestamp => {
    const clickDate = new Date(timestamp);
    const currentDate = new Date();
    const timeDifference = currentDate - clickDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference <= 5;
  });

  const isGuestFavorite = recentClicks.length >= 20;

  // New listing calculation
  const isNewListing = (() => {
    if (!listing.createdAt) return false;
    const createdAtDate = new Date(listing.createdAt);
    if (isNaN(createdAtDate.getTime())) return false;
    const daysDifference = (Date.now() - createdAtDate) / (1000 * 3600 * 24);
    return daysDifference < 15;
  })();

  // Load favorite and click counts
  useEffect(() => {
    const storedFavorite = localStorage.getItem(`favorite-${listing._id}`);
    if (storedFavorite) setIsFavorite(JSON.parse(storedFavorite));
    
    const storedClicks = localStorage.getItem(`clicks-${listing._id}`);
    if (storedClicks) setClickTimestamps(JSON.parse(storedClicks));
  }, [listing._id]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(prev => {
      const newState = !prev;
      localStorage.setItem(`favorite-${listing._id}`, JSON.stringify(newState));
      return newState;
    });
  };

  const handleListingClick = () => {
    setClickTimestamps(prev => {
      const newTimestamps = [...prev, new Date().toISOString()];
      localStorage.setItem(`clicks-${listing._id}`, JSON.stringify(newTimestamps));
      return newTimestamps;
    });
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.success) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.error("Error deleting listing:", error.message);
    }
  };

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden w-full sm:w-[330px] relative">
      <Link 
        to={`/listing/${listing._id}`} 
        className="block relative"
        onClick={handleListingClick}
      >
        <div className="relative h-64">
          {isNewListing && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs z-10">
              New Listing
            </div>
          )}
          
          {isGuestFavorite && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs z-10">
              Guest Favorite
            </div>
          )}

          <Swiper 
            pagination={{ clickable: true }} 
            modules={[Pagination]}
            className="h-full"
          >
            {listing.imageUrls?.map((url, index) => (
              <SwiperSlide key={index}>
                <img
                  src={url}
                  alt={`Listing ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute bottom-4 right-4 text-2xl z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 hover:scale-110 transition-transform duration-200" />
            ) : (
              <FaRegHeart className="text-gray-500 hover:scale-110 transition-transform duration-200" />
            )}
          </button>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold truncate">{listing.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaEye className="text-gray-500" />
            <span>{clickTimestamps.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MdLocationOn className="text-green-600" />
          <span className="truncate">{listing.address}</span>
          {distance && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {distance} km away
            </span>
          )}
        </div>

        {/* Book specific fields */}
        {(listing.bookAuthor || listing.bookYear || listing.bookUsageHistory || listing.numberOfUsed !== undefined) && (
          <div className="bg-gray-50 rounded-md p-3 mb-3 text-xs text-gray-700 space-y-1">
            {listing.bookAuthor && (
              <div className="flex justify-between">
                <span className="font-semibold">Author:</span>
                <span>{listing.bookAuthor}</span>
              </div>
            )}
            {listing.bookYear && (
              <div className="flex justify-between">
                <span className="font-semibold">Year Released:</span>
                <span>{listing.bookYear}</span>
              </div>
            )}
            {listing.numberOfUsed !== undefined && (
              <div className="flex justify-between">
                <span className="font-semibold">Number of Used:</span>
                <span>{listing.numberOfUsed}</span>
              </div>
            )}
            {listing.bookUsageHistory && (
              <div className="flex flex-col">
                <span className="font-semibold">History of Used:</span>
                <span className="text-gray-600 mt-0.5">{listing.bookUsageHistory}</span>
              </div>
            )}
          </div>
        )}

        <div className="text-gray-600 text-sm mb-3">
          <p style={{ whiteSpace: 'pre-line' }}>
            {showFullDescription 
              ? (listing.description || 'No description provided')
              : (listing.description?.length > 300 
                  ? `${listing.description.substring(0, 300)}...` 
                  : (listing.description || 'No description provided'))}
          </p>
          {listing.description?.length > 300 && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowFullDescription(!showFullDescription);
              }}
              className="text-blue-600 hover:underline mt-1 font-medium text-xs"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="text-lg font-bold text-slate-700">
            R{listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}
            <span className="text-sm font-normal ml-1">
              {listing.type === 'rent' && '/month'}
              {listing.type === 'over' && '/night'}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex gap-4">
            {/* Conditionally render bedrooms */}
            {!hideBedroom && listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <FaBed /> {listing.bedrooms}
              </span>
            )}
            
            {/* Bathrooms */}
            {listing.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <FaBath /> {listing.bathrooms}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {listing.period && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {listing.period}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handleListingDelete(listing._id)}
            className="text-red-600 hover:underline text-sm font-medium"
          >
            Delete
          </button>
          <Link to={`/update-listing/${listing._id}`}>
            <button className="text-green-600 hover:underline text-sm font-medium">
              Edit
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingItem;
