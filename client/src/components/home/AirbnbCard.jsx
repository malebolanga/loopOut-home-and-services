import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ImageGallery from '../ImageGallery';
import { formatListingTitle } from '../../utils/listingDisplay';
import { Navigation2 } from 'lucide-react';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../../hooks/useWishlist';
import useLocationCoords from '../../hooks/useGeolocation';
import { calculateDistance } from '../../utils/locationUtils';

export const AirbnbCard = ({ item, onClick, type = 'property', hideDistance = false, reducedSize = false, showOwner = true, showCategory = true, showAccountOwner = true }) => {
  const isGuestFavorite = item.rating >= 4.8;
  const wishlistType = type === 'property' ? 'listing' : type;
  const { isFavorite, toggleFavorite } = useWishlist(item, wishlistType);
  const owner = typeof (item.userRef || item.creator) === 'object' ? (item.userRef || item.creator) : null;
  const ownerName = owner?.username || owner?.name || owner?.fullName || 'Account owner';
  // Account/email verification is not the same as a completed identity review.
  // Only an explicit completed KYC status may be described as verified.
  const isIdentityVerified = item.kycStatus === 'verified' || owner?.kycStatus === 'verified';
  const responseTime = item.responseTimeLabel || item.responseTime || owner?.responseTimeLabel || owner?.responseTime;

  // Live GPS distance
  const { coords: userCoords } = useLocationCoords();
  const liveDistance = useMemo(() => {
    // 1. Prioritize real GPS distance if user coordinates and item coordinates exist
    if (userCoords?.latitude && userCoords?.longitude && item?.latitude && item?.longitude) {
      return calculateDistance(userCoords.latitude, userCoords.longitude, item.latitude, item.longitude);
    }
    // 2. Fall back to pre-computed _distance (from filterByDistanceTier), excluding synthetic non-GPS 5.1 fallback
    if (item?._distance !== undefined && item._distance !== Infinity && item._distance < 999999 && item._distance !== 5.1) {
      return item._distance;
    }
    return null;
  }, [item?._distance, item?.latitude, item?.longitude, userCoords]);

  const distanceLabel = useMemo(() => {
    if (!liveDistance || liveDistance >= 999999) return null;
    if (liveDistance < 0.5) return 'Near you';
    if (liveDistance < 1) return `${Math.round(liveDistance * 1000)} m away`;
    return `${liveDistance < 10 ? liveDistance.toFixed(1) : Math.round(liveDistance)} km away`;
  }, [liveDistance]);

  const getPriceSuffix = () => {
    if (type !== 'property') return '';
    if (item?.pricePeriod === 'night') return '/ night';
    if (item?.pricePeriod === 'day') return '/ day';
    if (item?.pricePeriod === 'hour') return '/ hour';
    if (item?.pricePeriod === 'month') return '/ month';
    if (item?.kind === 'house' || item?.kind === 'apartment') return '/ day';
    switch (item.type) {
      case 'rent':
      case 'rent-long':
      case 'rent-short':
        return '/ month';
      case 'over':
      case 'guest_house':
      case 'hotel':
      case 'resort':
      case 'land':
        return '/ night';
      case 'sale':
        return '';
      case 'office':
        return '/ hour';
      default:
        return item.type?.includes('rent') ? '/ month' : '';
    }
  };

  const getCategoryLabel = () => {
    if (type === 'property' || type === 'listing') {
      if (item.kind) {
        const formattedKind = item.kind.replace(/_/g, ' ');
        return formattedKind.charAt(0).toUpperCase() + formattedKind.slice(1);
      }
      switch (item.type) {
        case 'rent':
        case 'rent-long':
        case 'rent-short':
          return 'Rental';
        case 'sale':
          return 'For Sale';
        case 'land':
          return 'Self Catering';
        case 'hotel':
          return 'Hotel';
        case 'apartment':
          return 'Apartment';
        case 'office':
          return 'Hourly Room';
        case 'over':
        case 'guest_house':
          return 'Guest House';
        case 'resort':
          return 'Resort';
        default:
          return 'Property';
      }
    }
    if (type === 'service') {
      switch (item.type) {
        case 'schoolTransport':
        case 'transport':
          return 'Transport';
        case 'carwash':
          return 'Car Wash';
        case 'catering':
        case 'baker':
          return 'Catering';
        case 'landscaping':
          return 'Landscaping';
        case 'moving':
          return 'Moving';
        case 'storage':
          return 'Storage';
        case 'handyman':
          return 'Handyman';
        default:
          return item.category || item.type || 'Service';
      }
    }
    if (type === 'helper') {
      switch (item.type) {
        case 'domestic':
          return 'Domestic Helper';
        case 'tutor':
          return 'Private Tutor';
        case 'chef':
          return 'Private Chef';
        case 'beauty':
          return 'Beauty Specialist';
        case 'tattoo':
          return 'Tattoo Artist';
        case 'barber':
          return 'Barbershop';
        case 'photography':
        case 'photograph':
          return 'Photographer';
        case 'sneaker':
        case 'sneakers':
          return 'Sneaker Cleaner';
        case 'animals':
        case 'animal':
          return 'Animal Care';
        default:
          return item.type || item.category || 'Helper';
      }
    }
    if (type === 'event') return 'Event';
    if (type === 'selling' || type === 'sell') {
      return item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'For Sale';
    }
    if (type === 'food' || item.itemType === 'food') {
      return item.badge || item.subType || 'Food & Lunch';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatPrice = () => {
    const price = item.price || item.regularPrice;
    return `R ${price?.toLocaleString()}`;
  };

  const handleClick = () => {
    const itemType = type === 'property' ? 'listing' : type;
    const resolvedType = item.itemType || item.type || itemType;

    let path = `/listing/${item._id}`; // safe default

    // The category being rendered is authoritative for home cards. A helper's
    // service subtype (for example "barber" or "beauty") must not make its
    // card fall through to the generic /listing route.
    if (type === 'helper' || resolvedType === 'helper') {
      const specializedTypes = ['beauty', 'photography', 'barber', 'tattoo', 'chef'];
      if (specializedTypes.includes(item.type)) {
        path = `/${item.type}/${item._id}`;
      } else if (item.type === 'tutor') {
        path = `/privatetutor/${item._id}`;
      } else {
        path = `/helper/${item._id}`;
      }
    } else if (resolvedType === 'listing' || resolvedType === 'property'
      || resolvedType === 'rent' || resolvedType === 'over'
      || resolvedType === 'sale' || resolvedType === 'land'
      || resolvedType === 'resort' || resolvedType === 'hotel'
      || resolvedType === 'apartment' || resolvedType === 'office') {
      path = `/listing/${item._id}`;
    } else if (resolvedType === 'event') {
      path = `/event/${item._id}`;
    } else if (resolvedType === 'selling' || resolvedType === 'sell') {
      path = `/sell-item/${item._id}`;
    } else if (resolvedType === 'food' || resolvedType === 'lunch') {
      path = item.route || '/food';
    } else if (resolvedType === 'service') {
      if (item.type === 'carwash') {
        path = `/carwash/${item._id}`;
      } else if (item.type === 'storage') {
        path = `/storage/${item._id}`;
      } else {
        path = `/service/${item._id}`;
      }
    }

    if (onClick) {
      onClick(path);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${formatListingTitle(item.name || item.title || 'listing')}`}
      className="cursor-pointer flex flex-col bg-transparent w-full border-0 shadow-none rounded-none "
    >
      {/* Image section */}
      <div className={`home-image-card relative overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-black/5 ${reducedSize ? 'aspect-[16/10] rounded-xl mb-1.5' : 'aspect-[4/3] rounded-2xl mb-2'}`}>
        <ImageGallery
          imageUrls={item.imageUrls || [item.image] || []}
          alt={formatListingTitle(item.name || item.title)}
          type={type === 'property' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : type}
          className="home-media-gallery"
          compactIndicator
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-t from-slate-950/50 via-slate-950/12 to-transparent" />
        {isIdentityVerified && (
          <span className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-900 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Identity checked
          </span>
        )}
        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          className={`absolute flex items-center justify-center text-white active:scale-90 transition-transform z-20 drop-shadow-md ${reducedSize ? 'top-2 left-2 p-1' : 'top-3 left-3 p-2'}`}
          aria-label={`${isFavorite ? 'Remove' : 'Add'} ${formatListingTitle(item.name || item.title || 'listing')} ${isFavorite ? 'from' : 'to'} saved listings`}
          title={isFavorite ? 'Remove from saved listings' : 'Save listing'}
        >
          {isFavorite ? (
            <HeartIconSolid className={`text-rose-500 fill-rose-500 ${reducedSize ? 'w-5 h-5' : 'w-7 h-7'}`} />
          ) : (
            <HeartIcon className={`stroke-[2.5px] ${reducedSize ? 'w-5 h-5' : 'w-7 h-7'}`} />
          )}
        </button>
        {/* Guest favorite badge */}
        {isGuestFavorite && type === 'property' && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm border border-black/5 z-20">
            <span className="text-[8px] font-bold text-gray-900 uppercase tracking-wide">Guest favorite</span>
          </div>
        )}
      </div>

      {/* Info section - Placed exactly like Airbnb, borderless, clean */}
      <div className="flex flex-col mt-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={`line-clamp-2 font-semibold leading-4 text-gray-900 dark:text-white ${reducedSize ? 'min-h-[1.75rem] text-xs leading-[1rem]' : 'min-h-[2rem] text-[13px]'}`}>
              {formatListingTitle(item.name || item.title || item.address?.split(',')[0] || 'South Africa')}
            </p>

            {type === 'event' && (item.date || item.eventDate || item.startDate || item.startsAt) && (
              <p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {new Date(item.date || item.eventDate || item.startDate || item.startsAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                {(item.time || item.startTime) ? ` · ${item.time || item.startTime}` : ''}
              </p>
            )}

            {(item.address || item.location) && (
              <p className={`mt-0.5 truncate leading-tight text-gray-600 dark:text-gray-300 ${reducedSize ? 'text-xs' : 'text-xs'}`}>
                {String(item.address || item.location).split(',')[0]}
              </p>
            )}
            {(showCategory || (!hideDistance && distanceLabel) || responseTime) && (
              <div className={`mt-1 flex items-center gap-1.5 overflow-hidden ${reducedSize ? 'min-h-[15px]' : 'min-h-[18px]'}`}>
                {showCategory && (
                  <span className={`shrink-0 rounded-full bg-slate-100 font-semibold leading-none text-slate-700 dark:bg-gray-800 dark:text-gray-200 ${reducedSize ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-xs'}`}>
                    {getCategoryLabel()}
                  </span>
                )}
                {!hideDistance && distanceLabel && (
                  <span className={`inline-flex min-w-0 items-center gap-0.5 truncate font-semibold text-emerald-700 dark:text-emerald-300 text-xs`}>
                    <Navigation2 className="h-2.5 w-2.5 shrink-0" />{distanceLabel}
                  </span>
                )}
                {responseTime && <span className="min-w-0 truncate text-xs text-gray-600 dark:text-gray-300">Replies {responseTime}</span>}
              </div>
            )}
            {showAccountOwner && type === 'helper' && ownerName && (
              <p className={`mt-1 truncate leading-tight text-gray-600 dark:text-gray-300 text-xs`}>
                Hosted by <span className="font-medium text-gray-800 dark:text-gray-100">{ownerName}</span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Rating on right */}
            <div className="flex items-center gap-0.5">
              {item.rating > 0 ? (
                <>
                  <StarIconSolid className="w-3 h-3 text-gray-900 dark:text-white shrink-0" />
                  <span className={`font-semibold text-gray-900 dark:text-white ${reducedSize ? 'text-[10px]' : 'text-[11px]'}`}>
                    {item.rating.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">New</span>
              )}
            </div>
            {showOwner && owner && owner.avatar && (
              <Link
                to={`/user/${owner._id}`}
                onClick={(e) => e.stopPropagation()}
                className={`${reducedSize ? 'w-4 h-4' : 'w-6 h-6'} rounded-full border border-gray-200 overflow-hidden shadow-sm hover:scale-110 transition-transform pointer-events-auto shrink-0`}
                title={`Posted by ${owner.username}`}
              >
                <img src={owner.avatar} alt={owner.username} loading="lazy" className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </Link>
            )}
          </div>
        </div>

        {/* Legacy _distance display removed — now shown via distanceLabel above */}

        <div className={`flex items-baseline gap-1 ${reducedSize ? 'mt-0' : 'mt-1'}`}>
          <span className={`font-semibold text-gray-900 dark:text-white ${reducedSize ? 'text-[12px]' : 'text-[13px]'}`}>{formatPrice()}</span>
          <span className={`text-gray-500 dark:text-white font-normal ${reducedSize ? 'text-[10px]' : 'text-[12px]'}`}>{getPriceSuffix()}</span>
        </div>
      </div>
    </div>
  );
};

export const AirbnbCardSkeleton = ({ reducedSize = false }) => (
  <div className={`flex flex-col ${reducedSize ? 'gap-1.5' : 'gap-2'} animate-pulse`}>
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${reducedSize ? 'aspect-[16/10] rounded-xl' : 'aspect-[4/3] rounded-2xl'}`} />
    <div className="flex flex-col pt-1 gap-1">
      <div className="flex justify-between items-start gap-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-8" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4 mt-1" />
      <div className="flex items-baseline gap-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-20" />
      </div>
    </div>
  </div>
);
