/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
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
  Users
} from 'lucide-react';
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
  const [isNewHelper, setIsNewHelper] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [hasPositivePromo, setHasPositivePromo] = useState(false);
  const [ratingData, setRatingData] = useState({ average: 4.8, count: 0 });

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
            setRatingData({ average: data.ratings?.overall || 4.8, count: data.totalComments || 0 });
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
    navigate(`/helper/${helper._id}`);
  };

  if (!helper?._id) return <div className="animate-pulse bg-gray-50 rounded-[2.5rem] h-[400px] w-full" />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`${className} group relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 z-0">
        <ImageGallery
          imageUrls={helper.imageUrls || []}
          type="helper"
          alt={helper.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>

      {/* Top Overlays */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <HelperTypePill type={helper.type} />

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite();
          }}
          className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90 pointer-events-auto"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Integrated Information Overlay (Always Visible Gradient) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-white">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black">{ratingData.average.toFixed(1)}</span>
            </div>
            <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
              {helper.name}
            </h3>
            <p className="text-xs text-white/70 font-medium truncate">
               {helper.address || 'Polokwane'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
              R{formatPriceValue(helper.regularPrice)}
            </div>
            <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
          </div>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
        <div className="w-full space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <div className="flex gap-2">
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsUp className="w-4 h-4" />
              {helper.votes?.up || 0}
            </div>
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsDown className="w-4 h-4" />
              {helper.votes?.down || 0}
            </div>
          </div>
          <div className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl">
            Inspect Original
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HelperItem;
