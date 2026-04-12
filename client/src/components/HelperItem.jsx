/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar, FaBook, FaHeart as FaHeartSolid, FaWrench, FaBroom, FaStar as FaStarSolid, FaCut, FaCamera, FaUser, FaCheck } from "react-icons/fa";
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
  tutor:        { icon: FaBook,        bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Education' },
  caregiver:    { icon: FaHeartSolid,  bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'Care' },
  handyman:     { icon: FaWrench,      bg: 'bg-slate-50',  text: 'text-slate-700',  label: 'Technical' },
  cleaner:      { icon: FaBroom,       bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Hygiene' },
  domestic:     { icon: FaBroom,       bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Domestic' },
  maid:         { icon: FaBroom,       bg: 'bg-teal-50',    text: 'text-teal-700',    label: 'Maid' },
  beauty:       { icon: FaStarSolid,   bg: 'bg-pink-50',    text: 'text-pink-700',    label: 'Aesthetics' },
  barber:       { icon: FaCut,         bg: 'bg-indigo-50',  text: 'text-indigo-700',  label: 'Grooming' },
  tattoo:       { icon: FaStarSolid,   bg: 'bg-zinc-100',   text: 'text-zinc-700',   label: 'Artistry' },
  photography:  { icon: FaCamera,      bg: 'bg-violet-50',  text: 'text-violet-700',  label: 'Media' },
  chef:         { icon: FaUser,        bg: 'bg-orange-50',  text: 'text-orange-700',  label: 'Culinary' },
};

function HelperTypePill({ type }) {
  const cfg = HELPER_ICON_CONFIG[type] || { icon: FaUser, bg: 'bg-gray-50', text: 'text-gray-500', label: 'Professional' };
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
    <Link
      to={`/helper/${helper._id}`}
      className={`${className} group transition-all duration-700 relative flex flex-col ${
        compactMode ? 'p-2 hover:bg-white rounded-3xl' : 'rounded-[2.5rem] bg-white border border-gray-50/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]'
      }`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden ${compactMode ? 'w-24 h-28 rounded-2xl' : 'h-72 rounded-[2.5rem]'}`}>
        <ImageGallery
          imageUrls={helper.imageUrls || []}
          type="helper"
          alt={helper.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hasPositivePromo && (
            <div className="bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-xl border border-white/20 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-900">Elite Professional</span>
            </div>
          )}
          {isNewHelper && (
            <div className="bg-rose-500 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
               <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white">New Professional</span>
            </div>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90 hover:bg-rose-50"
        >
          {isFavorite ? <FaHeart className="w-4 h-4 text-rose-500" /> : <FaRegHeart className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Professional Overlay */}
        {!compactMode && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 flex items-center gap-2 transition-opacity group-hover:opacity-100">
             <div className="w-6 h-6 rounded-full overflow-hidden border border-white/40 bg-gray-200">
               {helper.userRef?.avatar ? (
                 <img src={helper.userRef.avatar} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-600 bg-white">
                   {getUserFirstName().charAt(0)}
                 </div>
               )}
             </div>
             <span className="text-[10px] font-black text-white uppercase tracking-wider">{getUserFirstName()}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`${compactMode ? 'ml-4 flex-1' : 'p-6 flex-1 flex flex-col'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
             <h3 className="text-lg font-black text-gray-950 truncate leading-tight group-hover:text-rose-600 transition-colors">
               {helper.name}
             </h3>
             <div className="flex items-center gap-1.5 mt-1">
                <MdLocationOn className="text-rose-500 w-3 h-3" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                  {helper.address || 'Global Entry'}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
             <FaStar className="w-3 h-3 text-amber-500" />
             <span className="text-[10px] font-black text-gray-900">
               {ratingData.count > 0 ? ratingData.average.toFixed(1) : '4.5'}
             </span>
             {ratingData.count > 0 && <span className="text-[9px] text-gray-400">({ratingData.count})</span>}
          </div>
        </div>

        {!compactMode && (
          <div className="mt-4 mb-6">
            <HelperTypePill type={helper.type} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Rate From</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black text-gray-950 tracking-tighter">R{formatPriceValue(helper.regularPrice)}</span>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">/ total</span>
              </div>
           </div>
           {!compactMode && (
             <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                <FaCheck className="w-3 h-3" />
             </div>
           )}
        </div>
      </div>
    </Link>
  );
}

export default HelperItem;
