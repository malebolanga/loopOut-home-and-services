/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
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
  Truck,
  Users,
  Check
} from 'lucide-react';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWishlist } from "../hooks/useWishlist";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/ListingDetails.scss";
import ImageWithFallback from "./ImageWithFallback";

const NEW_SERVICE_THRESHOLD_DAYS = 14;
const CLICKS_PER_STAR = 20;

const SERVICE_ICON_CONFIG = {
  cleaning:        { icon: Sparkles,           bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Cleaning' },
  maintenance:     { icon: Wrench,             bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Maintenance' },
  moving:          { icon: Truck,              bg: 'bg-purple-100', text: 'text-purple-700', label: 'Moving' },
  landscaping:     { icon: Sparkles,           bg: 'bg-green-100',  text: 'text-green-700',  label: 'Landscaping' },
  catering:        { icon: Sparkles,           bg: 'bg-red-100',    text: 'text-red-700',    label: 'Catering' },
  daycare:         { icon: Users,              bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Day Care' },
  schoolTransport: { icon: Truck,              bg: 'bg-teal-100',   text: 'text-teal-700',   label: 'School Transport' },
  other:           { icon: LayoutGrid,         bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Other' },
};

function ServiceTypePill({ type }) {
  const cfg = SERVICE_ICON_CONFIG[type] || { icon: LayoutGrid, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Service' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text} border border-black/5 shadow-sm`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

const getServiceTypeName = (type) => {
  switch (type) {
    case 'cleaning': return 'Cleaning';
    case 'maintenance': return 'Maintenance';
    case 'moving': return 'Moving';
    case 'landscaping': return 'Landscaping';
    case 'catering': return 'Catering';
    case 'other': return 'Other';
    case 'daycare': return 'DayCare';
    case 'schoolTransport': return 'School Transport';
    default: return 'Service';
  }
};

function ServiceItem({ service, className = "" }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useWishlist(service, 'service');
  const [isNewService, setIsNewService] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (service?.createdAt) {
      const diffTime = Math.abs(new Date().getTime() - new Date(service.createdAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIsNewService(diffDays <= NEW_SERVICE_THRESHOLD_DAYS);
    }

    if (service?._id) {
      try {
        const storedClicks = JSON.parse(localStorage.getItem('serviceClicks')) || {};
        setClickCount(storedClicks[service._id] || 0);
      } catch (error) { console.error('Error reading serviceClicks:', error); }
    }
    setRatingData({ 
      average: service.rating || 0, 
      count: service.comments?.length || 0 
    });
  }, [service]);

  const handleCardClick = () => {
    if (!service?._id) return;
    try {
      const storedClicks = JSON.parse(localStorage.getItem('serviceClicks')) || {};
      storedClicks[service._id] = (storedClicks[service._id] || 0) + 1;
      localStorage.setItem('serviceClicks', JSON.stringify(storedClicks));
      setClickCount(storedClicks[service._id]);
      navigate(`/service/${service._id}`);
    } catch (error) { console.error('Error updating view count:', error); }
  };

  const enhancedImages = service?.imageUrls?.length > 0
    ? service.imageUrls.map((img) => ({ url: img }))
    : [{ url: "https://placehold.co/600x400/E0E0E0/333333?text=No+Image" }];

  const getLocationLabel = () => {
    return service.address || 'Location not available';
  };

  if (!service?._id) return <div className="animate-pulse bg-gray-50 rounded-[2.5rem] h-[400px] w-full" />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`${className} group relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {enhancedImages.map((img, index) => (
            <SwiperSlide key={index}>
              <ImageWithFallback
                src={img.url}
                alt={`${service.name || 'Service'} image ${index + 1}`}
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
          <span className="text-[10px] font-black ml-1.5 shrink-0">{service.bookingsCount || 0}</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] hidden group-hover/booking:inline-block transition-all ml-1.5 text-slate-200">Bookings</span>
        </div>
      </div>
      
      {/* Top Overlays */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <ServiceTypePill type={service.type} />

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

      {/* Permanent Information Overlay (On Image) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-white">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black">{ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}</span>
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-black text-white leading-tight truncate">
                {service.name}
              </h3>
            </div>
            <p className="text-xs text-white/70 font-medium truncate mb-3">
               {getLocationLabel()}
            </p>

            {/* Minimal Provider Name Only */}
            <div className="mt-2">
              <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-60">
                {service.userRef?.username}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end pointer-events-auto">
            <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
              R{service.regularPrice?.toLocaleString()}
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
              {service.votes?.up || 0}
            </div>
            <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
              <ThumbsDown className="w-4 h-4" />
              {service.votes?.down || 0}
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

export default ServiceItem;