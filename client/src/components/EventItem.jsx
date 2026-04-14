/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import {
  MapPinIcon,
  HeartIcon as HeartIconOutline,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
  UserIcon,
  TicketIcon,
  CalendarDaysIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";
import ImageWithFallback from "./ImageWithFallback";
import { useWishlist } from "../hooks/useWishlist";

const NEW_EVENT_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;

const EVENT_TYPE_COLORS = {
  music: "bg-purple-50 text-purple-700 border-purple-100",
  sports: "bg-green-50 text-green-700 border-green-100",
  art: "bg-red-50 text-red-700 border-red-100",
  community: "bg-blue-50 text-blue-700 border-blue-100",
  food: "bg-yellow-50 text-yellow-700 border-yellow-100",
  other: "bg-gray-50 text-gray-700 border-gray-100"
};

const EVENT_ICON_CONFIG = {
  music:     { icon: SparklesIcon,        bg: 'bg-purple-100', text: 'text-purple-700', label: 'Music' },
  sports:    { icon: SparklesIcon,        bg: 'bg-green-100',  text: 'text-green-700',  label: 'Sports' },
  art:       { icon: SparklesIcon,        bg: 'bg-red-100',    text: 'text-red-700',    label: 'Art' },
  community: { icon: UserGroupIcon,       bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Community' },
  food:      { icon: SparklesIcon,        bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Food' },
  other:     { icon: CalendarDaysIcon,    bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Event' },
};

function EventTypePill({ type }) {
  const cfg = EVENT_ICON_CONFIG[type] || { icon: CalendarDaysIcon, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Event' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text} border border-white/50 backdrop-blur-sm shadow-sm`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

const formatPrice = (price) => {
  if (price === undefined || price === null || price === 0) {
    return <span className="font-black text-slate-900">Free</span>;
  }
  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });
  return (
    <span className="font-black text-slate-900">
      {formatter.format(price)}
      <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">ticket</span>
    </span>
  );
};

const formatDateTime = (dateString, timeString) => {
  if (!dateString) return 'TBA';
  try {
    const eventDate = new Date(dateString);
    const dateOptions = { month: 'short', day: 'numeric' };
    const formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);
    return `${formattedDate}${timeString ? ` @ ${timeString}` : ''}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

function EventItem({ event, className = "", compactMode = false }) {
  const { isFavorite, toggleFavorite } = useWishlist(event, 'event');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (event?.createdAt) {
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      setIsNewEvent(diffDays <= NEW_EVENT_THRESHOLD_DAYS);
    }
    if (event?._id) {
      const storedClicks = JSON.parse(localStorage.getItem('eventClicks')) || {};
      setClickCount(storedClicks[event._id] || 0);
      const fetchRating = async () => {
        try {
          const res = await fetch(`/api/event-comments/${event._id}?limit=1`);
          if (res.ok) {
            const data = await res.json();
            setRatingData({ average: data.ratings?.overall || 0, count: data.totalComments || 0 });
          }
        } catch (error) {}
      };
      fetchRating();
    }
  }, [event]);

  if (!event?._id) return (
    <div className="bg-slate-50 rounded-[2.5rem] w-full p-4 h-[420px] animate-pulse">
      <div className="bg-slate-200 h-64 rounded-[2rem]"></div>
      <div className="mt-6 space-y-3">
        <div className="bg-slate-200 h-6 w-3/4 rounded-lg"></div>
        <div className="bg-slate-200 h-4 w-1/2 rounded-lg"></div>
      </div>
    </div>
  );

  const getUserFirstName = () => {
    if (!event.userRef?.username) return 'User';
    const first = event.userRef.username.split(/[._\s]/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  return (
    <Link
      to={`/event/${event._id}`}
      className={`${className} group relative bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] hover:-translate-y-2 border border-slate-100 flex flex-col`}
    >
      {/* Immersive Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 + Math.random() * 2000 }}
          className="h-full w-full"
        >
          {event.imageUrls?.map((url, i) => (
            <SwiperSlide key={i}>
              <ImageWithFallback
                src={url}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </SwiperSlide>
          ))}
          {!event.imageUrls?.length && (
            <SwiperSlide>
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-slate-200" />
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Top Badges Overlay */}
        <div className="absolute top-4 inset-x-4 z-20 flex justify-between items-start">
           <div className="flex flex-col gap-2">
              {isNewEvent && (
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-emerald-500/30 backdrop-blur-md">NEW</span>
              )}
              <div className="bg-white/80 backdrop-blur-md px-2 py-1.5 rounded-2xl flex items-center gap-2 border border-white shadow-sm">
                 <div className="w-6 h-6 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                    <ImageWithFallback src={event.userRef?.avatar} className="w-full h-full object-cover" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-700 pr-1">{getUserFirstName()}</span>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.preventDefault(); toggleFavorite(); }} 
                className={`p-2.5 rounded-2xl backdrop-blur-md border border-white/20 transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
              >
                {isFavorite ? <HeartIconSolid className="w-4 h-4" /> : <HeartIconOutline className="w-4 h-4" />}
              </button>
           </div>
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="absolute bottom-4 inset-x-4 z-20">
           <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                 <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Coming Up</div>
                    <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                       <ClockIcon className="w-4 h-4 text-rose-400" />
                       {formatDateTime(event.date, event.time)}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Tickets</div>
                    <div className="text-sm font-black text-rose-400">{event.regularPrice ? `R${event.regularPrice}` : 'FREE'}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-grow flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
             <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-2 truncate group-hover:text-rose-500 transition-colors">
                  {event.name || 'Experience Name'}
                </h3>
                <div className="flex items-center gap-2">
                   <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                   <span className="text-xs font-semibold text-slate-400 truncate tracking-tight">{event.address || 'Location TBA'}</span>
                </div>
             </div>
             <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl font-bold text-[10px] border border-amber-100">
                   <StarIconSolid className="w-3 h-3" /> {ratingData.count > 0 ? ratingData.average.toFixed(1) : '4.8'}
                </div>
                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                   {ratingData.count > 0 ? `${ratingData.count} Reviews` : 'Top Choice'}
                </div>
             </div>
          </div>

          <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
             <EventTypePill type={event.type} />
             <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.capacity || '10+'} Going</span>
             </div>
          </div>
      </div>
    </Link>
  );
}

export default EventItem;