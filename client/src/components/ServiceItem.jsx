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
import { useSearchIntelligence } from "../hooks/useSearchIntelligence";
import LoopOutBanner from "./LoopOutBanner";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      } catch (e) { console.error(e); }
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
      setIsModalOpen(true);
    } catch (e) { console.error(e); }
  };

  const enhancedImages = service?.imageUrls?.length > 0 ? service.imageUrls.map(img => ({ url: img })) : [{ url: "https://placehold.co/600x400/E0E0E0/333333?text=No+Image" }];
  const getLocationLabel = () => service.address || 'Location not available';

  if (!service?._id) return <div className="animate-pulse bg-gray-50 rounded-[2.5rem] h-[400px] w-full" />;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className={`${className} group relative aspect-square bg-white sm:rounded-[2.5rem] md:rounded-[3rem] rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer`}
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Swiper modules={[Pagination, Autoplay]}
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
          <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-white">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black ml-1.5">{service.bookingsCount || 0}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] hidden group-hover/booking:inline-block ml-1.5 text-slate-200">Bookings</span>
          </div>
        </div>

        {/* Top Overlays */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
          <ServiceTypePill type={service.type} />            
          {/* Action Buttons */}
          <div className="flex space-x-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite();
              }}
              className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Simulate booking then open rating modal
                setIsModalOpen(true);
              }}
              className="px-3 py-2 bg-amber-500 text-white rounded-2xl shadow-lg hover:bg-amber-600 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>

        <LoopOutBanner className="bottom-24" type="service" />

        {/* Permanent Information Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
          <div className="flex justify-between items-end gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 text-white">
                <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span className="text-xs font-black">{ratingData.count > 0 ? ratingData.average.toFixed(1) : 'New'}</span>
              </div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-black text-white leading-tight truncate">{service.name}</h3>
              </div>
              <p className="text-xs text-white/70 font-medium truncate mb-3">{getLocationLabel()}</p>
              <div className="mt-2">
                <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-60">{service.userRef?.username}</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end pointer-events-auto">
              <div className="text-xl font-black text-white tracking-tighter leading-none">R{service.regularPrice?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-lg">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-2">{service.name}</h2>
            <p className="mb-4 text-gray-700">{service.description || 'No description available.'}</p>
            <div className="flex items-center space-x-1 mb-4">
              {[1,2,3,4,5].map(star => (
                <Star key={star} className={`w-6 h-6 cursor-pointer ${userRating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} onClick={() => setUserRating(star)} />
              ))}
            </div>
            <button disabled={userRating===null || isSubmitting} className="w-full px-4 py-2 bg-rose-500 text-white rounded disabled:opacity-50" onClick={() => {
              if (userRating===null) return;
              setIsSubmitting(true);
              const newCount = ratingData.count + 1;
              const newAvg = ((ratingData.average * ratingData.count) + userRating) / newCount;
              setRatingData({ average: newAvg, count: newCount });
              const stored = JSON.parse(localStorage.getItem('serviceRatings') || '{}');
              stored[service._id] = { rating: userRating };
              localStorage.setItem('serviceRatings', JSON.stringify(stored));
              setIsSubmitting(false);
              setIsModalOpen(false);
            }}>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ServiceItem;
