import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowTrendingUpIcon, FunnelIcon, CalendarDaysIcon, ChatBubbleOvalLeftEllipsisIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HandThumbUpIcon as HandThumbUpIconSolid, HandThumbDownIcon as HandThumbDownIconSolid } from '@heroicons/react/24/solid';
import { Sparkles } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import ImageGallery from '../components/ImageGallery';
import LoopOutPulse from '../components/LoopOutPulse';
import { useWishlist } from '../hooks/useWishlist';
import MyBookingsConsumer from '../components/MyBookingsConsumer';
import LookingForItem from '../components/LookingForItem';
import BottomNav from '../components/BottomNav';
import useSearchIntelligence from '../hooks/useSearchIntelligence';
import HelperItem from '../components/HelperItem';
import LoopOutBanner from '../components/LoopOutBanner';
import ForSale from './ForSale';
import { AirbnbCard, AirbnbCardSkeleton } from '../components/home/AirbnbCard';
import { NeuralPicksSection, SellItemsSection, SmartRecommendations, ServicesToYourDoor, WeeklySpecialsSection } from '../components/home/HomeSections';
import { CategoriesSlider } from '../components/home/CategoriesSlider';
import { HomeHero } from '../components/home/HomeHero';

// --- Desktop Homepage Component (moved from Home.jsx) ---
export const DesktopFeed = ({
  tabs,
  activeTab,
  setActiveTab,
  aiInsights,
  showAIInsights,
  setShowAIInsights,
  getFilteredItems,
  navigate,
  isBookingsOpen,
  setIsBookingsOpen,
  requestCount
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>LoopOut | Premium Marketplace for Properties, Services, and Events</title>
        <meta name="description" content="Discover verified helpers, book top services, and explore exclusive properties and events in your area with LoopOut." />
      </Helmet>
      {/* Sticky Airbnb-style Categories Bar */}
      <div className="sticky top-0 z-40 bg-white py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-12 overflow-x-auto scrollbar-hide py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center gap-2  relative pb-3 pt-1 cursor-pointer transition-all focus:outline-none"
                >
                  <CategoryIcon type={tab.iconType} size="w-6 h-6" />
                  <span className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}
                    >{tab.id}</span>
                  {isActive ? (<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500" />) : null}
                </button>
              );
            })}
          </div>
          {/* Premium Filter Button */}
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-900 transition-all font-medium text-xs tracking-wider text-gray-700 bg-white shadow-sm hover:shadow-md"
          >
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Clean Feed Grid */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* AI Insights & Recommendations */}
        {showAIInsights && aiInsights && aiInsights.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-rose-50 to-amber-50 p-5 rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">AI Pulse Insights</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  {aiInsights[0]?.icon || '✨'} {aiInsights[0]?.text || aiInsights[0]}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowAIInsights(false)} 
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-md relative z-10 transition-colors"
            >Dismiss</button>
          </div>
        )}

        {/* Simple Grid Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {activeTab === 'Universe' ? 'Top Discoveries' : `Exclusive ${activeTab}`}
          </h1>
          <span className="text-xs text-gray-500 font-medium">
            Showing {getFilteredItems().length} options in Polokwane
          </span>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {getFilteredItems().map((item, idx) => (
            <motion.div
              key={item._id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.03 }}
            >
              <AirbnbCard
                item={item}
                type={activeTab === 'Universe' ? (item.itemType || 'property') : activeTab === 'Helper' ? 'helper' : activeTab === 'Properties' ? 'property' : activeTab.slice(0, -1).toLowerCase()}
                onClick={(path) => navigate(path)}
              />
            </motion.div>
          ))}
        </div>

        {/* Sell Items Section (Desktop) */}
        <SellItemsSection navigate={navigate} />

        {/* Clean footer / end of feed */}
        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 font-medium">You've reached the end of the discoveries.</p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-4 px-6 py-3 bg-gray-950 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors shadow-md"
          >Search All Listings</button>
        </div>
      </main>
      {/* Floating AI Agent & Bookings Tracker */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/ai-help-center')}
        className="fixed bottom-6 right-6 z-50 cursor-pointer shadow-xl rounded-full bg-rose-600 hover:bg-rose-500 text-white p-4 flex items-center justify-center border border-rose-500"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsBookingsOpen(true)}
        className="fixed bottom-20 right-6 z-50 cursor-pointer shadow-xl rounded-full bg-white hover:bg-gray-50 text-gray-950 p-4 flex items-center justify-center border border-gray-200"
      >
        <div className="relative">
          <CalendarDaysIcon className="w-6 h-6 text-gray-700" />
          {requestCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {requestCount}
            </span>
          )}
        </div>
      </motion.div>

      {/* Bookings Modal */}
      <MyBookingsConsumer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
    </div>
  );
};

// Helper CategoryIcon component (shared)
const CategoryIcon = ({ type, size = "w-10 h-10" }) => {
  const [emojiIndex, setEmojiIndex] = useState(0);
  const emojis = {
    Universe: ['🪐', '🌍', '🌌', '🚀'],
    Homes: ['🏠', '🏢', '🏡', '🏨'],
    Services: ['🛠️', '⚡', '🧽', '⚙️'],
    Helper: ['🧹', '💅', '💄', '💈', '👨‍🍳'],
    Events: ['🎟️', '🎪', '🎭', '🎫']
  };
  useEffect(() => {
    const randomOffset = Math.random() * 500;
    const interval = setInterval(() => {
      setEmojiIndex(prev => {
        const count = emojis[type] ? emojis[type].length : 1;
        return (prev + 1) % count;
      });
    }, 2500 + randomOffset);
    return () => clearInterval(interval);
  }, [type]);
  const currentEmoji = emojis[type] ? emojis[type][emojiIndex] : '✨';
  return (
    <div className={`${size} relative flex items-center justify-center`}>
      <motion.div
        animate={{ y: [0, -4, 0], rotateX: [0, 15, -15, 0], rotateY: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        style={{ perspective: 1000 }}
        className="relative w-full h-full hover:scale-125 transition-transform duration-300 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEmoji}
            initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: -90 }}
            transition={{ duration: 0.4 }}
            className="absolute text-4xl drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]"
          >
            {currentEmoji}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
