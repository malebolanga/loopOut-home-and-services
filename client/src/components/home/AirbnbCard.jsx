import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ImageGallery from '../ImageGallery';
import { BookOpen } from 'lucide-react';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../../hooks/useWishlist';

export const AirbnbCard = ({ item, onClick, type = 'property', hideDistance = false, reducedSize = false }) => {
  const isGuestFavorite = item.rating >= 4.8;
  const wishlistType = type === 'property' ? 'listing' : type;
  const { isFavorite, toggleFavorite } = useWishlist(item, wishlistType);
  const owner = typeof (item.userRef || item.creator) === 'object' ? (item.userRef || item.creator) : null;

  const getPriceSuffix = () => {
    if (type !== 'property') return '';
    switch (item.type) {
      case 'rent':
      case 'rent-long':
      case 'rent-short':
        return '/ month';
      case 'over':
        return '/ night';
      case 'sale':
      case 'land':
        return '';
      case 'office':
        return '/ hour';
      default:
        return item.type?.includes('rent') ? '/ month' : '';
    }
  };

  const getCategoryLabel = () => {
    if (type === 'property' || type === 'listing') {
      switch (item.type) {
        case 'rent':
        case 'rent-long':
        case 'rent-short':
          return 'Rental';
        case 'sale':
          return 'For Sale';
        case 'land':
          return 'Land';
        case 'office':
          return 'Office';
        case 'over':
          return 'Short Stay';
        case 'guest_house':
          return 'Guest House';
        case 'resort':
          return 'Resort';
        default:
          return 'Property';
      }
    }
    if (type === 'service') return item.category || item.type || 'Service';
    if (type === 'helper') return item.type || item.category || 'Helper';
    if (type === 'event') return 'Event';
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

    if (resolvedType === 'listing' || resolvedType === 'property'
        || resolvedType === 'rent' || resolvedType === 'over'
        || resolvedType === 'sale' || resolvedType === 'land'
        || resolvedType === 'resort') {
      path = `/listing/${item._id}`;
    } else if (resolvedType === 'event') {
      path = `/event/${item._id}`;
    } else if (resolvedType === 'helper') {
      const specializedTypes = ['beauty', 'photography', 'carwash', 'barber', 'tattoo', 'chef'];
      if (specializedTypes.includes(item.type)) {
        path = `/${item.type}/${item._id}`;
      } else if (item.type === 'tutor') {
        path = `/privatetutor/${item._id}`;
      } else {
        path = `/helper/${item._id}`;
      }
    } else if (resolvedType === 'service') {
      if (item.type === 'carwash') {
        path = `/carwash/${item._id}`;
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
      className="cursor-pointer flex flex-col bg-transparent w-full border-0 shadow-none rounded-none "
    >
      {/* Image section */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 mb-2">
        <ImageGallery
          imageUrls={item.imageUrls || [item.image] || []}
          alt={item.name}
          type={type === 'property' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : type}
        />
        {/* Bookings overlay */}
        <div className="absolute top-3 right-3 flex items-center justify-center z-20 pointer-events-auto group/booking transition-transform cursor-pointer">
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg shadow-md flex items-center justify-center text-white">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-black ml-1 shrink-0">{item.bookingsCount || 0}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] hidden group-hover/booking:inline-block ml-1 text-slate-200">Bookings</span>
          </div>
        </div>
        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          className={`absolute top-3 left-3 flex items-center justify-center text-white active:scale-90 transition-transform z-20 drop-shadow-md ${reducedSize ? 'p-1' : 'p-2'}`}
        >
          {isFavorite ? (
            <HeartIconSolid className={`text-rose-500 fill-rose-500 ${reducedSize ? 'w-6 h-6' : 'w-7 h-7'}`} />
          ) : (
            <HeartIcon className={`stroke-[2.5px] ${reducedSize ? 'w-6 h-6' : 'w-7 h-7'}`} />
          )}
        </button>
        {/* Guest favorite badge */}
        {isGuestFavorite && type === 'property' && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-black/5 z-20">
            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Guest favorite</span>
          </div>
        )}
      </div>
      
      {/* Info section - Placed exactly like Airbnb, borderless, clean */}
      <div className="flex flex-col mt-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-gray-900 truncate ${reducedSize ? 'text-[14px]' : 'text-[15px]'}`}>
              {item.address?.split(',')[0] || item.name || 'South Africa'}
            </p>
            
            <p className="text-gray-500 text-[13px] truncate leading-tight mt-0.5">
              {item.name}
            </p>
            
            <p className="text-gray-500 text-[13px] truncate leading-tight">
              {getCategoryLabel()}
            </p>
          </div>

        
        
        </div>
        
        {item._distance && item._distance !== Infinity && !hideDistance && (
          <p className="text-gray-500 text-[14px] leading-tight">
            {item._distance < 1 ? 'Near you' : `${Math.round(item._distance)} km away`}
          </p>
        )}
        
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`font-semibold text-gray-900 ${reducedSize ? 'text-[14px]' : 'text-[15px]'}`}>{formatPrice()}</span>
          <span className={`text-gray-500 font-normal ${reducedSize ? 'text-[12px]' : 'text-[14px]'}`}>{getPriceSuffix()}</span>
        </div>
      </div>
    </div>
  );
};

export const AirbnbCardSkeleton = ({ reducedSize = false }) => (
  <div className={`flex flex-col ${reducedSize ? 'gap-1.5' : 'gap-2'} animate-pulse`}>
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200" />
    <div className="flex flex-col pt-1 gap-1">
      <div className="flex justify-between items-start gap-2">
        <div className="h-4 bg-gray-200 rounded-md w-2/3" />
        <div className="h-4 bg-gray-200 rounded-md w-8" />
      </div>
      <div className="h-3 bg-gray-200 rounded-md w-1/3" />
      <div className="h-3 bg-gray-200 rounded-md w-1/4 mt-1" />
      <div className="flex items-baseline gap-2">
        <div className="h-5 bg-gray-200 rounded-md w-20" />
      </div>
    </div>
  </div>
);
