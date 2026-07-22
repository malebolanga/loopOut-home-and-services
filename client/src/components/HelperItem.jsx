/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import { 
  Heart, 
  MapPin, 
  Star, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Briefcase,
  Calendar,
  User,
  LayoutGrid,
  GraduationCap,
  Wrench,
  Camera,
  Users,
  Check
} from 'lucide-react';
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import React from 'react';
import "../styles/ListingDetails.scss";
import ImageGallery from "./ImageGallery";
import { useWishlist } from "../hooks/useWishlist";
import { useSearchIntelligence } from "../hooks/useSearchIntelligence";
import { useCompare } from "../hooks/useCompare";
import LoopOutBanner from "./LoopOutBanner";

const NEW_HELPER_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;
const MIN_POSITIVE_REVIEWS = 5;
const POSITIVE_KEYWORDS = [
  'good', 'great', 'excellent', 'perfect', 'amazing',
  'love', 'loved', 'wonderful', 'fantastic', 'superb',
  'outstanding', 'awesome', 'best', 'recommend', 'happy'
];

const HELPER_ICON_CONFIG = {
  tutor:        { icon: GraduationCap, bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Education' },
  caregiver:    { icon: Heart,         bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'Care' },
  handyman:     { icon: Wrench,        bg: 'bg-slate-50',  text: 'text-slate-700',  label: 'Technical' },
  cleaner:      { icon: Sparkles,      bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Hygiene' },
  domestic:     { icon: Sparkles,      bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Domestic' },
  maid:         { icon: Sparkles,      bg: 'bg-teal-50',    text: 'text-teal-700',    label: 'Maid' },
  beauty:       { icon: Sparkles,      bg: 'bg-pink-50',    text: 'text-pink-700',    label: 'Aesthetics' },
  barber:       { icon: Sparkles,      bg: 'bg-indigo-50',  text: 'text-indigo-700',  label: 'Grooming' },
  tattoo:       { icon: Sparkles,      bg: 'bg-zinc-100',   text: 'text-zinc-700',   label: 'Artistry' },
  photography:  { icon: Camera,        bg: 'bg-violet-50',  text: 'text-violet-700',  label: 'Media' },
  chef:         { icon: User,          bg: 'bg-orange-50',  text: 'text-orange-700',  label: 'Culinary' },
};

function HelperTypePill({ type }) {
  const cfg = HELPER_ICON_CONFIG[type] || { icon: User, bg: 'bg-gray-50', text: 'text-gray-500', label: 'Professional' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text} border border-black/5 shadow-sm`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

const formatPriceValue = (price) => {
  if (price === undefined || price === null) return 'N/A';
  return new Intl.NumberFormat("en-ZA").format(price);
};

function HelperItem({ helper, className = "" }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useWishlist(helper, 'helper');
  const { isCompared, toggleCompare } = useCompare(helper);
  const { recordView } = useSearchIntelligence();
  const [isNewHelper, setIsNewHelper] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [hasPositivePromo, setHasPositivePromo] = useState(false);
  const [ratingData, setRatingData] = useState({ 
    average: helper.rating || 4.8, 
    count: helper.comments?.length || 0 
  });
  const owner = typeof helper.userRef === 'object' ? helper.userRef : null;

  useEffect(() => {
    if (helper?.createdAt) {
      const diffDays = Math.ceil(Math.abs(new Date() - new Date(helper.createdAt)) / (1000 * 60 * 60 * 24));
      setIsNewHelper(diffDays <= NEW_HELPER_THRESHOLD_DAYS);
    }
  }, [helper]);

  const handleCardClick = () => {
    if (!helper?._id) return;
    recordView(helper);
    const storedClicks = JSON.parse(localStorage.getItem('helperClicks')) || {};
    storedClicks[helper._id] = (storedClicks[helper._id] || 0) + 1;
    localStorage.setItem('helperClicks', JSON.stringify(storedClicks));
    // Use specific route based on helper type if it exists in App.jsx
    const typeRoutes = ['beauty', 'photography', 'carwash', 'barber', 'tattoo', 'chef'];
    let path = `/helper/${helper._id}`;
    
    if (typeRoutes.includes(helper.type)) {
      path = `/${helper.type}/${helper._id}`;
    } else if (helper.type === 'tutor') {
      path = `/privatetutor/${helper._id}`;
    }
    
    navigate(path);
  };

  if (!helper?._id) return <div className="animate-pulse bg-gray-50 rounded-[2.5rem] h-[400px] w-full" />;

  return (
    <div
      onClick={handleCardClick}
      className={`${className} cursor-pointer flex flex-col bg-transparent w-full border-0 shadow-none rounded-none group`}
    >
      {/* Image section */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 mb-2">
        <ImageGallery
          imageUrls={helper.imageUrls || []}
          type="helper"
          alt={helper.name}
          className="w-full h-full object-cover"
        />
        
        {/* Top Overlays */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <HelperTypePill type={helper.type} />
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare();
              }}
              title="Compare Provider"
              className="w-8 h-8 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-md flex items-center justify-center text-gray-900 active:scale-90 transition-transform"
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${isCompared ? 'text-indigo-600' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite();
              }}
              title="Save to Wishlist"
              className="w-8 h-8 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-md flex items-center justify-center text-gray-900 active:scale-90 transition-transform"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Section below the image */}
      <div className="flex flex-col mt-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-[15px]">
              {helper.address || 'Polokwane'}
            </p>
            
            <p className="text-gray-500 text-[13px] truncate leading-tight mt-0.5">
              {helper.name}
            </p>
            
            <p className="text-gray-500 text-[13px] truncate leading-tight">
              {helper.type ? helper.type.charAt(0).toUpperCase() + helper.type.slice(1) : 'Professional'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1 mt-0.5">
              <StarIconSolid className="w-3.5 h-3.5 text-black" />
              <span className={`font-medium text-gray-900 text-[14px]`}>
                <span>{(ratingData.average || 0).toFixed(1)}</span>
              </span>
            </div>
            {owner && owner.avatar && (
              <Link
                to={`/user/${owner._id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-full border border-gray-150 overflow-hidden shadow-sm hover:scale-110 transition-transform pointer-events-auto shrink-0"
                title={`Posted by ${owner.username}`}
              >
                <img src={owner.avatar} alt={owner.username} loading="lazy" className="w-full h-full object-cover" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="font-semibold text-gray-900 text-[15px]">R {formatPriceValue(helper.regularPrice)}</span>
          <span className="text-gray-500 font-normal text-[14px]">/ hour</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(HelperItem);
