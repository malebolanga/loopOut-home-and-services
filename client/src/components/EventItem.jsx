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
  Ticket,
  Users,
  BookOpen
} from 'lucide-react';
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";
import ImageWithFallback from "./ImageWithFallback";
import { useWishlist } from "../hooks/useWishlist";
import LoopOutBanner from "./LoopOutBanner";

const NEW_EVENT_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;

const EVENT_ICON_CONFIG = {
  music:     { icon: Sparkles,        bg: 'bg-purple-100', text: 'text-purple-700', label: 'Music' },
  sports:    { icon: Sparkles,        bg: 'bg-green-100',  text: 'text-green-700',  label: 'Sports' },
  art:       { icon: Sparkles,        bg: 'bg-red-100',    text: 'text-red-700',    label: 'Art' },
  community: { icon: Users,           bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Community' },
  food:      { icon: Sparkles,        bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Food' },
  other:     { icon: Calendar,        bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Event' },
};

function EventTypePill({ type }) {
  const cfg = EVENT_ICON_CONFIG[type] || { icon: Calendar, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Event' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text} border border-white/50 backdrop-blur-sm shadow-sm`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function EventItem({ event, className = "" }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useWishlist(event, 'event');
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const owner = typeof event.userRef === 'object' ? event.userRef : null;

  useEffect(() => {
    if (event?.createdAt) {
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      setIsNewEvent(diffDays <= NEW_EVENT_THRESHOLD_DAYS);
    }
    if (event?._id) {
      const storedClicks = JSON.parse(localStorage.getItem('eventClicks')) || {};
      setClickCount(storedClicks[event._id] || 0);
    }
    setRatingData({ 
      average: event.rating || 0, 
      count: event.comments?.length || 0 
    });
  }, [event]);

  const handleCardClick = () => {
    if (!event?._id) return;
    try {
      const storedClicks = JSON.parse(localStorage.getItem('eventClicks')) || {};
      storedClicks[event._id] = (storedClicks[event._id] || 0) + 1;
      localStorage.setItem('eventClicks', JSON.stringify(storedClicks));
      setClickCount(storedClicks[event._id]);
      navigate(`/event/${event._id}`);
    } catch (error) {}
  };

  if (!event?._id) return <div className="bg-slate-50 rounded-[2.5rem] w-full p-4 h-[400px] animate-pulse" />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`${className} group relative aspect-square bg-white sm:rounded-[2.5rem] md:rounded-[3rem] rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {event.imageUrls?.map((url, i) => (
            <SwiperSlide key={i}>
              <ImageWithFallback
                src={url}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Bookings Counter Overlay */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto group/booking hover:-translate-y-1 transition-transform cursor-pointer">
        <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-white transition-all overflow-hidden flex-nowrap whitespace-nowrap">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-black ml-1.5 shrink-0">{event.bookingsCount || 0}</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] hidden group-hover/booking:inline-block transition-all ml-1.5 text-slate-200">Bookings</span>
        </div>
      </div>

      {/* Top Overlays */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <EventTypePill type={event.type} />

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

      <LoopOutBanner className="bottom-24" type="event" />

      {/* Permanent Information Overlay (On Image) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-white">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black">{ratingData.count > 0 ? ratingData.average.toFixed(1) : '4.8'}</span>
            </div>
            <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
              {event.name}
            </h3>
            <p className="text-xs text-white/70 font-medium truncate">
               {event.address || 'Location TBA'}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2 pointer-events-auto shrink-0">
            {owner && owner.avatar && (
              <Link
                to={`/user/${owner._id}`}
                onClick={(e) => { e.stopPropagation(); }}
                className="w-8 h-8 rounded-full border border-white/20 overflow-hidden shadow-md hover:scale-110 transition-transform mb-1 shrink-0"
                title={`Posted by ${owner.username}`}
              >
                <img src={owner.avatar} alt={owner.username} className="w-full h-full object-cover" />
              </Link>
            )}
            <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
              {event.regularPrice ? `R${event.regularPrice.toLocaleString()}` : 'FREE'}
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
              {event.votes?.up || 0}
            </div>
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsDown className="w-4 h-4" />
              {event.votes?.down || 0}
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

export default EventItem;
