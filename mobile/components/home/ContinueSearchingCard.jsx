import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  WrenchIcon,
  TicketIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ContinueSearchingCard = ({ navigate }) => {
  const [dismissed, setDismissed] = useState(false);
  const [searchData, setSearchData] = useState(null);

  const loadSearchData = () => {
    try {
      // 1. Read the user's specific last search object
      const stored = localStorage.getItem('lastUserSearch');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.query || parsed.location)) {
          setSearchData(parsed);
          return;
        }
      }

      // 2. Read fallback recent search from recentPropertySearches
      const storedSearches = localStorage.getItem('recentPropertySearches');
      if (storedSearches) {
        const searches = JSON.parse(storedSearches);
        if (Array.isArray(searches) && searches.length > 0) {
          const first = searches[0];
          if (typeof first === 'string' && first.trim()) {
            setSearchData({
              query: first,
              location: first,
              category: 'homes',
              dateRange: '',
              url: `/search?searchTerm=${encodeURIComponent(first)}&type=properties`
            });
            return;
          } else if (typeof first === 'object' && first !== null) {
            setSearchData({
              query: first.query || first.location,
              location: first.location || first.query,
              category: first.category || first.type || 'homes',
              dateRange: first.dateRange || first.date || '',
              url: first.url || `/search?searchTerm=${encodeURIComponent(first.location || first.query || '')}`
            });
            return;
          }
        }
      }

      // 3. User has NOT performed any search yet -> DO NOT SHOW TO EVERYONE
      setSearchData(null);
    } catch (err) {
      console.error('Failed to load recent search:', err);
      setSearchData(null);
    }
  };

  useEffect(() => {
    loadSearchData();

    const handleStorageChange = (e) => {
      if (!e || e.key === 'lastUserSearch' || e.key === 'recentPropertySearches') {
        loadSearchData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ONLY render if the user actually performed a search previously
  if (dismissed || !searchData) return null;

  const handleSearchClick = () => {
    const targetUrl = searchData.url || `/search?searchTerm=${encodeURIComponent(searchData.query || searchData.location || '')}`;
    if (navigate) {
      navigate(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  // Helper to format category icon, colors and labels dynamically
  const getCategoryConfig = (category = '') => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('helper')) {
      return {
        label: 'helpers',
        icon: UserGroupIcon,
        color: 'text-amber-500',
        image: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800'
      };
    }
    if (cat.includes('service')) {
      return {
        label: 'services',
        icon: WrenchIcon,
        color: 'text-blue-500',
        image: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800'
      };
    }
    if (cat.includes('event')) {
      return {
        label: 'events',
        icon: TicketIcon,
        color: 'text-purple-500',
        image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800'
      };
    }
    return {
      label: 'homes',
      icon: HomeIcon,
      color: 'text-rose-500',
      image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
  };

  const config = getCategoryConfig(searchData.category);
  const IconComponent = config.icon;

  const displayLocation = searchData.location || searchData.query || '';
  const displayTitle = searchData.title || (displayLocation
    ? `Continue searching for ${config.label} in ${displayLocation}`
    : `Continue searching for ${config.label}`);
  const displayDate = searchData.dateRange || searchData.date || 'Recent Search';
  const cardImage = searchData.imageUrl || config.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="mb-8 relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={handleSearchClick}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="p-5 sm:p-6 flex items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Dynamic preview image & category icon */}
          <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <img
              src={cardImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
            <div className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
              <IconComponent className={`w-4 h-4 ${config.color}`} />
            </div>
          </div>

          {/* Text details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Search</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight group-hover:text-rose-600 transition-colors truncate sm:whitespace-normal">
              {displayTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-slate-500">
              <CalendarDaysIcon className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200/60 font-semibold">
                {displayDate}
              </span>
            </div>
          </div>
        </div>

        {/* Dismiss Button Only */}
        <div className="flex items-center shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            title="Dismiss search"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ContinueSearchingCard;
