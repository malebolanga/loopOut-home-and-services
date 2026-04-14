/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import {
  MapPinIcon,
  HeartIcon as HeartIconOutline,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  UserIcon,
  CameraIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import "../styles/ListingDetails.scss";
import ImageGallery from "./ImageGallery";
import { useWishlist } from "../hooks/useWishlist";

const NEW_HELPER_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;
const MIN_POSITIVE_REVIEWS = 5;
const POSITIVE_KEYWORDS = [
  'good', 'great', 'excellent', 'perfect', 'amazing',
  'love', 'loved', 'wonderful', 'fantastic', 'superb',
  'outstanding', 'awesome', 'best', 'recommend', 'happy'
];

const HELPER_ICON_CONFIG = {
  tutor:        { icon: AcademicCapIcon, bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Education' },
  caregiver:    { icon: HeartIconSolid,  bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'Care' },
  handyman:     { icon: WrenchScrewdriverIcon, bg: 'bg-slate-50',  text: 'text-slate-700',  label: 'Technical' },
  cleaner:      { icon: SparklesIcon,    bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Hygiene' },
  domestic:     { icon: SparklesIcon,    bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Domestic' },
  maid:         { icon: SparklesIcon,    bg: 'bg-teal-50',    text: 'text-teal-700',    label: 'Maid' },
  beauty:       { icon: SparklesIcon,    bg: 'bg-pink-50',    text: 'text-pink-700',    label: 'Aesthetics' },
  barber:       { icon: SparklesIcon,    bg: 'bg-indigo-50',  text: 'text-indigo-700',  label: 'Grooming' },
  tattoo:       { icon: SparklesIcon,    bg: 'bg-zinc-100',   text: 'text-zinc-700',   label: 'Artistry' },
  photography:  { icon: CameraIcon,      bg: 'bg-violet-50',  text: 'text-violet-700',  label: 'Media' },
  chef:         { icon: UserIcon,        bg: 'bg-orange-50',  text: 'text-orange-700',  label: 'Culinary' },
};

function HelperTypePill({ type }) {
  const cfg = HELPER_ICON_CONFIG[type] || { icon: UserIcon, bg: 'bg-gray-50', text: 'text-gray-500', label: 'Professional' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text} border border-black/5`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

const formatPriceValue = (price) => {
  if (price === undefined || price === null) return 'N/A';
  return new Intl.NumberFormat("en-ZA").format(price);
};

function HelperItem({ helper, className = "", compactMode = false }) {
  const { isFavorite, toggleFavorite } = useWishlist(helper, 'helper');
  const [isNewHelper, setIsNewHelper] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [hasPositivePromo, setHasPositivePromo] = useState(false);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  const calculatePositivePromo = useMemo(() => {
    if (!helper?.reviews || helper.reviews.length < MIN_POSITIVE_REVIEWS) return false;
    return helper.reviews.filter(r => r.comment && POSITIVE_KEYWORDS.some(k => r.comment.toLowerCase().includes(k))).length >= MIN_POSITIVE_REVIEWS;
  }, [helper]);

  useEffect(() => {
    if (helper?.createdAt) {
      const diffDays = Math.ceil(Math.abs(new Date() - new Date(helper.createdAt)) / (1000 * 60 * 60 * 24));
      setIsNewHelper(diffDays <= NEW_HELPER_THRESHOLD_DAYS);
    }
    if (helper?._id) {
      const storedClicks = JSON.parse(localStorage.getItem('helperClicks')) || {};
      setClickCount(storedClicks[helper._id] || 0);
      
      const fetchRating = async () => {
        try {
          const res = await fetch(`/api/helper-comments/${helper._id}?limit=1`);
          if (res.ok) {
            const data = await res.json();
            setRatingData({ average: data.ratings?.overall || 0, count: data.totalComments || 0 });
          }
        } catch (e) { /* ignore */ }
      };
      fetchRating();
    }
    setHasPositivePromo(calculatePositivePromo);
  }, [helper, calculatePositivePromo]);

  const handleCardClick = () => {
    if (!helper?._id) return;
    const storedClicks = JSON.parse(localStorage.getItem('helperClicks')) || {};
    storedClicks[helper._id] = (storedClicks[helper._id] || 0) + 1;
    localStorage.setItem('helperClicks', JSON.stringify(storedClicks));
    setClickCount(storedClicks[helper._id]);
  };

  const getUserFirstName = () => {
    if (!helper?.userRef?.username) return 'Professional';
    return helper.userRef.username.split(/[._\s]/)[0].charAt(0).toUpperCase() + helper.userRef.username.split(/[._\s]/)[0].slice(1);
  };

  if (!helper?._id) return <div className="animate-pulse bg-gray-50 rounded-[2.5rem] h-[400px] w-full" />;

  return (
    <motion.div
      whileHover={{ y: -10, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className="h-full"
    >
      <Link
        to={`/helper/${helper._id}`}
        className={`${className} group transition-all duration-500 relative flex ${
          compactMode 
            ? 'flex-row items-center p-3 hover:bg-gray-50 rounded-2xl border-b border-gray-50 last:border-0' 
            : 'flex-col h-full rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-xl'
        }`}
        onClick={handleCardClick}
      >
      {/* Image Container */}
      <div className={`relative flex-shrink-0 overflow-hidden ${compactMode ? 'w-16 h-16 rounded-xl' : 'aspect-[4/3] w-full rounded-2xl bg-gray-100'}`}>
        <ImageGallery
          imageUrls={helper.imageUrls || []}
          type="helper"
          alt={helper.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Floating Badges */}
        {!compactMode && isNewHelper && (
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-3 left-3 z-10"
          >
            <div className="bg-slate-50/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-100 italic">
               <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">New Professional</span>
            </div>
          </motion.div>
        )}

        {/* Favorite */}
        {!compactMode && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(); }}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all active:scale-90 border border-white/20"
          >
            {isFavorite ? <HeartIconSolid className="w-5 h-5 text-rose-500" /> : <HeartIconOutline className="w-5 h-5 text-white" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`${compactMode ? 'ml-4 flex-1 flex flex-row items-center justify-between gap-3 overflow-hidden' : 'pt-3 px-1.5 flex-1 flex flex-col'}`}>
        <div className={`flex flex-col min-w-0 ${compactMode ? 'flex-1' : 'mb-1'}`}>
           <div className="flex items-center justify-between">
              <h3 className={`font-black text-gray-950 truncate leading-tight group-hover:text-rose-600 transition-colors ${compactMode ? 'text-[15px]' : 'text-[15px]'}`}>
                {helper.name}
              </h3>
              {!compactMode && (
                <div className="flex items-center gap-1.5">
                  <StarIconSolid className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[14px] font-black text-gray-950 italic">
                    {ratingData.count > 0 ? ratingData.average.toFixed(1) : '4.8'}
                  </span>
                </div>
              )}
           </div>
           
           <div className="flex flex-col mt-1.5">
              <span className="text-[14px] text-gray-500 font-medium">
                {helper.type || 'Professional'} Helper
              </span>
              <span className="text-[13px] text-gray-500 truncate lowercase">
                {helper.address || 'Polokwane'}
              </span>
           </div>
        </div>

        {compactMode ? (
          <div className="flex flex-col items-end flex-shrink-0 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
             <span className="text-[15px] font-black text-gray-950 tracking-tighter">R{formatPriceValue(helper.regularPrice)}</span>
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-60 italic">Total</p>
          </div>
        ) : (
          <div className="mt-1 flex items-baseline gap-1">
             <span className="text-[15px] font-black text-gray-950 tracking-tighter">R{formatPriceValue(helper.regularPrice)}</span>
             <span className="text-[14px] font-medium text-gray-500">total</span>
          </div>
        )}
      </div>
      </Link>
    </motion.div>
  );
}

export default HelperItem;
