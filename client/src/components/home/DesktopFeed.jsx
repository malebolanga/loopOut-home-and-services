import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FunnelIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';
import { AirbnbCard } from './AirbnbCard';
import { NeuralPicksSection, SellItemsSection } from './HomeSections';
import DailyLoopHub from './DailyLoopHub';
import MyBookingsConsumer from '../MyBookingsConsumer';

// ─── Category icon details ────────────────────────────────────────────────────
const CATEGORY_ICON_DETAILS = {
  Universe: {
    main: '🪐',
    details: ['✨', '🌙', '🚀'],
    bg: 'from-slate-950 via-indigo-950 to-fuchsia-900'
  },
  Homes: {
    main: '🏡',
    details: ['🔑', '🪴', '📍'],
    bg: 'from-emerald-600 via-teal-500 to-sky-500'
  },
  Services: {
    main: '🛠️',
    details: ['⚡', '🧽', '🔧'],
    bg: 'from-amber-500 via-orange-500 to-rose-500'
  },
  Helper: {
    main: '🧹',
    details: ['💅', '💈', '🍳'],
    bg: 'from-sky-500 via-blue-600 to-violet-600'
  },
  Events: {
    main: '🎟️',
    details: ['🎪', '🎭', '🎉'],
    bg: 'from-purple-600 via-fuchsia-600 to-rose-500'
  }
};

// ─── Animated category icon ───────────────────────────────────────────────────
const CategoryIcon = ({ type, size = 'w-6 h-6' }) => {
  const icon = CATEGORY_ICON_DETAILS[type] || {
    main: '✨',
    details: ['•', '•', '•'],
    bg: 'from-gray-900 to-gray-700'
  };

  return (
    <div className={`${size} relative flex items-center justify-center overflow-visible`}>
      <motion.div
        animate={{ y: [0, -2, 0], rotate: [0, -3, 3, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className={`relative w-full h-full rounded-full bg-gradient-to-br ${icon.bg} shadow-[0_6px_16px_rgba(15,23,42,0.2)] ring-1 ring-white/40 hover:scale-110 transition-transform duration-300 flex items-center justify-center`}
      >
        <span className="relative z-10 text-[1.1rem] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {icon.main}
        </span>
        <span className="absolute -top-1 -right-1 text-[0.5rem] leading-none rounded-full bg-white shadow-sm p-0.5">
          {icon.details[0]}
        </span>
        <span className="absolute -bottom-1 -left-1 text-[0.5rem] leading-none rounded-full bg-white shadow-sm p-0.5">
          {icon.details[1]}
        </span>
        <span className="absolute -bottom-1 -right-1 text-[0.45rem] leading-none rounded-full bg-white/95 shadow-sm p-0.5">
          {icon.details[2]}
        </span>
      </motion.div>
    </div>
  );
};

// ─── Desktop Feed Component ───────────────────────────────────────────────────
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
  const items = getFilteredItems() || [];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>LoopOut | Premium Marketplace for Properties, Services, and Events</title>
        <meta
          name="description"
          content="Discover verified helpers, book top services, and explore exclusive properties and events in your area with LoopOut."
        />
      </Helmet>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Sticky Categories Bar ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl py-4 border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none border whitespace-nowrap ${
                    isActive
                      ? 'bg-white border-gray-900 shadow-md scale-105'
                      : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'}`}>
                    <CategoryIcon type={tab.iconType} size="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black tracking-widest uppercase transition-colors duration-200 ${isActive ? 'text-gray-950' : 'text-gray-500'}`}>
                    {tab.id}
                  </span>
                  {isActive && (
                    <span className="ml-1 text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                      {items.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full hover:border-gray-900 transition-all font-black uppercase text-[10px] tracking-widest text-gray-700 bg-white shadow-sm hover:shadow-md shrink-0 ml-4"
          >
            <FunnelIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>Refine</span>
          </button>
        </div>
      </div>

      {/* ── Main Feed ── */}
      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* Daily Loop Hub */}
        <DailyLoopHub />

        {/* AI Insights Banner */}
        {showAIInsights && aiInsights && aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-r from-rose-50 to-amber-50 p-5 rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
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
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg bg-white/70 backdrop-blur-md relative z-10 transition-colors shrink-0 ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              <span className="text-gray-950">Explore </span>
              <span className="text-rose-500">
                {activeTab === 'Universe' ? 'Top Discoveries' : activeTab}
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Curated results · Polokwane & beyond
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Live · {items.length} results
            </span>
          </div>
        </div>

        {/* Listings Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {items.map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.035 }}
              >
                <AirbnbCard
                  item={item}
                  type={
                    activeTab === 'Universe'
                      ? (item.itemType || 'property')
                      : activeTab === 'Helper'
                      ? 'helper'
                      : activeTab === 'Properties'
                      ? 'property'
                      : activeTab.slice(0, -1).toLowerCase()
                  }
                  onClick={(path) => navigate(path)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Nothing here yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Try switching to a different category or expanding your search area.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-6 px-6 py-3 bg-gray-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-md"
            >
              Browse All
            </button>
          </div>
        )}

        {/* Neural Picks */}
        <div className="mt-20">
          <NeuralPicksSection navigate={navigate} />
        </div>

        {/* Sell Items */}
        <SellItemsSection navigate={navigate} />

        {/* Footer CTA */}
        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400 font-medium">You've reached the end of the feed.</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 px-6 py-3 bg-gray-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-md"
          >
            Search All Listings
          </button>
        </div>
      </main>

      {/* ── Floating Buttons ── */}
      {/* AI Agent */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => navigate('/ai-help-center')}
        className="fixed bottom-6 right-6 z-50 cursor-pointer shadow-xl rounded-full bg-rose-600 hover:bg-rose-500 text-white p-4 flex items-center justify-center border border-rose-500 transition-colors"
        aria-label="AI Help Center"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Bookings Tracker */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsBookingsOpen(true)}
        className="fixed bottom-20 right-6 z-50 cursor-pointer shadow-xl rounded-full bg-white hover:bg-gray-50 text-gray-950 p-4 flex items-center justify-center border border-gray-200 transition-colors"
        aria-label="My Bookings"
      >
        <div className="relative">
          <CalendarDaysIcon className="w-6 h-6 text-gray-700" />
          {requestCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {requestCount}
            </span>
          )}
        </div>
      </motion.button>

      {/* Bookings Modal */}
      <MyBookingsConsumer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
    </div>
  );
};

export default DesktopFeed;
