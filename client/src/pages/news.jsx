// ... (previous code)

function ListingItem({ listing = "", compactMode = false }) {
  // ... (previous state and effects)

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-200 hover:shadow-lg ${compactMode ? 'h-full' : ''}`}>
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
            <p className="text-gray-500 text-xs truncate min-w-0">
              {listing.address}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-700">
              {listing.type !== 'land' && listing.type !== 'office' && (
                <>
                  <span className="flex items-center gap-1">
                    <FaBed className="text-[10px] text-gray-500" />
                    {listing.bedrooms || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaBath className="text-[10px] text-gray-500" />
                    {listing.bathrooms || 0}
                  </span>
                </>
              )}
              <span className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                {getPropertyTypeName(listing.type)}
              </span>
              {isNewListing && (
                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[10px]">
                  New
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs font-bold text-gray-900">
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
            <div className="absolute right-0 top-8 mt-1 w-36 bg-white rounded-lg shadow-lg z-20 border border-gray-200 divide-y divide-gray-100 text-xs">
              <div className="py-1">
                <button onClick={(e) => { e.preventDefault(); shareListing('whatsapp'); }} 
                  className="block w-full text-left px-2 py-1 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  WhatsApp
                </button>
                <button onClick={(e) => { e.preventDefault(); shareListing('facebook'); }} 
                  className="block w-full text-left px-2 py-1 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  Facebook
                </button>
                <button onClick={(e) => { e.preventDefault(); shareListing('copy'); }} 
                  className="block w-full text-left px-2 py-1 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
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
