import { useState } from 'react';
import { FaHeart, FaRegHeart, FaBed, FaBath } from 'react-icons/fa';
import { MdShare } from 'react-icons/md';

// Helper utilities
const enhancedImages = [];
const getPropertyTypeName = (type) => type || 'Property';
const formatPrice = (price) => price ? `R${price.toLocaleString()}` : 'Price on request';

function ListingItem({ listing = "", compactMode = false }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const isNewListing = listing?.createdAt
    ? (Date.now() - new Date(listing.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false;

  const toggleFavorite = () => setIsFavorite(f => !f);

  const shareListing = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const links = {
      whatsapp: `https://wa.me/?text=${url}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${url}`,
      copy: null,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    } else if (links[platform]) {
      window.open(links[platform], '_blank');
    }
    setShowShareOptions(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden transition-transform duration-200 hover:shadow-lg ${compactMode ? 'h-full' : ''}`}>
      {compactMode ? (
        <>
          {/* Compact Mode Layout - Optimized for small slides */}
          <div className="h-32 relative"> {/* Reduced height for image container */}
            <img
              src={enhancedImages[0]?.url}
              alt={`${listing.name || 'Property'} image`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.src = "https://placehold.co/600x400/E0E0E0/333333?text=No+Image"; }}
            />
          </div>
          
          <div className="p-3 space-y-1.5"> {/* Reduced padding and spacing */}
            <div className="flex justify-between items-start">
              {/* Name in one line with truncation and smaller font */}
              <h3 className="font-semibold text-sm truncate flex-1 min-w-0 mr-2">
                {listing.name}
              </h3>
              <button
                onClick={toggleFavorite}
                className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isFavorite ? 
                  <FaHeart className="w-3 h-3 text-rose-600" /> : 
                  <FaRegHeart className="w-3 h-3" />
                }
              </button>
            </div>
            
            {/* Address with smaller font and truncation */}
            <p className="text-gray-500 dark:text-white text-xs truncate min-w-0">
              {listing.address}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-white">
              {listing.type !== 'land' && listing.type !== 'office' && (
                <>
                  <span className="flex items-center gap-1">
                    <FaBed className="text-[10px] text-gray-500 dark:text-white" />
                    {listing.bedrooms || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaBath className="text-[10px] text-gray-500 dark:text-white" />
                    {listing.bathrooms || 0}
                  </span>
                </>
              )}
              <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[10px]">
                {getPropertyTypeName(listing.type)}
              </span>
              {isNewListing && (
                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[10px]">
                  New
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {formatPrice(
                  listing.offer ? listing.discountPrice : listing.regularPrice,
                  { type: listing.type }
                )}
              </div>
              <button
                onClick={(e) => { e.preventDefault(); setShowShareOptions(!showShareOptions); }}
                className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Share this property"
              >
                <MdShare className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {showShareOptions && (
            <div className="absolute right-0 top-8 mt-1 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 text-xs">
              <div className="py-1">
                <button onClick={(e) => { e.preventDefault(); shareListing('whatsapp'); }} 
                  className="block w-full text-left px-2 py-1 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                  WhatsApp
                </button>
                <button onClick={(e) => { e.preventDefault(); shareListing('facebook'); }} 
                  className="block w-full text-left px-2 py-1 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Facebook
                </button>
                <button onClick={(e) => { e.preventDefault(); shareListing('copy'); }} 
                  className="block w-full text-left px-2 py-1 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default ListingItem;
