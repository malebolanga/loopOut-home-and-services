// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';

import {
  MagnifyingGlassIcon,
  HeartIcon,
  GlobeAltIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  PlusIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  QueueListIcon,
  UserIcon,
  HomeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ChartPieIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

import {
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HeartIcon as HeartIconSolid,
  BellIcon as BellIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
} from '@heroicons/react/24/solid';

import {
  generateSuggestions,
  extractFiltersFromQuery,
  saveSearchHistory,
  getSearchHistory
} from '../utils/searchUtils';

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";



export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => localStorage.getItem('loopOutSound') !== 'false');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('San Francisco');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // Currency and Language states
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('preferredCurrency') || 'ZAR';
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'English';
  });

  const profileDropdownRef = useRef(null);
  const createDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const headerRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Available currencies and languages
  const currencies = [
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token') || '';
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      // Only attach if it's a real token, not 'null' string or empty
      if (token && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/notifications', {
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        const newUnreadCount = data.unreadCount || 0;
        
        // If we have new unread notifications, ring the bell
        if (newUnreadCount > prevUnreadCount) {
          if (isSoundEnabled) {
            notificationSound.current.play().catch(e => {
              console.log('Audio play failed (interaction required):', e);
            });
          }
          
          if (Notification.permission === 'granted' && document.hidden) {
            const latest = data.notifications?.[0];
            new Notification(latest?.title || 'LoopOut Alert', {
              body: latest?.message || 'You have a new notification',
              icon: '/favicon.ico'
            });
          }
        }
        
        setNotifications(data.notifications || []);
        setUnreadCount(newUnreadCount);
        setPrevUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser, prevUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Function to unlock audio on first interaction
    const unlockAudio = () => {
      notificationSound.current.play().then(() => {
        notificationSound.current.pause();
        notificationSound.current.currentTime = 0;
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      }).catch(() => {});
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Set up polling for real-time alerts
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, [fetchNotifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }

      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setShowCreateDropdown(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }

      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target) && !e.target.closest('.currency-button')) {
        setShowCurrencyDropdown(false);
      }

      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target) && !e.target.closest('.language-button')) {
        setShowLanguageDropdown(false);
      }

      // Close search if clicking outside search area
      if (showSearch && !e.target.closest('.search-container') && !e.target.closest('.search-trigger')) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  // Toggle bottom nav visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (isScrollingUp) {
        setIsNavVisible(true);
      } else {
        setIsNavVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Suggestions debouncing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const newSuggestions = generateSuggestions(searchTerm, 'all', searchHistory);
      setSuggestions(newSuggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchHistory]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSearch]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      navigate('/sign-in');
      setShowProfileDropdown(false);
      setShowMobileMenu(false);
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  // Handle search submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    // Save search history
    const updatedHistory = saveSearchHistory(searchTerm, 'all');
    setSearchHistory(updatedHistory);

    // AI-like extraction of filters from query
    const extractedFilters = extractFiltersFromQuery(searchTerm);
    console.log('Extracted filters:', extractedFilters);

    // Build search parameters
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', searchTerm);
    urlParams.set('type', extractedFilters.type || 'all');
    urlParams.set('address', extractedFilters.location || currentLocation);

    // Join other extracted filters
    Object.entries(extractedFilters).forEach(([key, value]) => {
      if (key !== 'type' && key !== 'location') {
        urlParams.set(key, value);
      }
    });

    const url = `/search?${urlParams.toString()}`;
    console.log('Navigating to:', url);
    navigate(url);
    setShowSearch(false);
    setSearchTerm('');
    setSuggestions([]);
  };

  // Handle currency change
  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('preferredCurrency', currencyCode);
    setShowCurrencyDropdown(false);

    // Dispatch currency change to Redux store if you have currency slice
    // dispatch(setCurrency(currencyCode));

    // Refresh page data with new currency
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currencyCode }));
  };

  // Handle language change
  const handleLanguageChange = (languageCode, languageName) => {
    setSelectedLanguage(languageName);
    localStorage.setItem('preferredLanguage', languageCode);
    setShowLanguageDropdown(false);

    // Dispatch language change to Redux store if you have language slice
    // dispatch(setLanguage(languageCode));

    // Refresh page data with new language
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: languageCode }));

    // Show success message
    alert(`Language changed to ${languageName}`);
  };

  // Get current currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency ? currency.symbol : 'R';
  };

  // Search categories
  const searchCategories = [
    { key: 'properties', label: 'Homes', icon: '🏠' },
    { key: 'services', label: 'Services', icon: '🔧' },
    { key: 'helpers', label: 'Helpers', icon: '👨‍💼' },
    { key: 'events', label: 'Events', icon: '🎪' }
  ];

  // Handle navigation helper
  const handleNavigate = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
  };

  // Handle mobile profile click - navigate to profile page instead of showing dropdown
  const handleMobileProfileClick = () => {
    console.log('Mobile profile clicked');
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/sign-in');
    }
  };

  // Hide header on wishlist page
  if (location.pathname === '/wishlist') return null;

  return (
    <>
      {/* Airbnb-style Header with Glassmorphism */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-6 px-4">
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">

            <Link
              to="/"
              className="hidden md:block cursor-pointer"
              onClick={() => console.log('Logo clicked - navigating to /')}
            >
              <BrandLogo className="h-8 w-auto" />
            </Link>

            {/* Center: Simplified Search Bar - Elevated Design */}
            <div className={`flex-1 max-w-[850px] mx-auto px-4 transition-all duration-300 ${showSearch ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
              <div
                onClick={() => {
                  console.log('Search bar clicked - opening search modal');
                  setShowSearch(true);
                }}
                className="search-trigger w-full md:w-auto md:min-w-[320px] mx-auto cursor-pointer "
              >
                <div className="border border-gray-200/60 rounded-full py-2 pl-6 pr-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer bg-white/90 group-hover:bg-white">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col flex-1 truncate px-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#FF385C]">Discovery Hub</span>
                       <span className="text-sm font-bold text-[#222222]">Start your search</span>
                    </div>
                    <div className="p-3 bg-[#FF385C] rounded-full text-white flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      <MagnifyingGlassIcon className="w-4.5 h-4.5 stroke-[3px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <div className="flex flex-row items-center gap-3">
                {/* loopOut your home - Desktop */}
                <button
                  onClick={() => handleNavigate('/host')}
                  className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition cursor-pointer text-[#222222]"
                >
                  loopOut your home
                </button>

                <button
                  onClick={() => handleNavigate('/trip')}
                  className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest py-3 px-6 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 hover:from-rose-500 hover:to-rose-600 hover:text-white transition-all duration-300 cursor-pointer border border-rose-200 shadow-sm hover:shadow-rose-200 hover:shadow-lg active:scale-95"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>AI TRIP</span>
                </button>

                <div className="relative" ref={createDropdownRef}>
                  <button
                    onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                    className="hidden xl:flex items-center gap-2 text-xs font-black uppercase tracking-widest py-3 px-6 rounded-full bg-gray-950 text-white hover:bg-black transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
                  >
                    <PlusIcon className="w-4 h-4 stroke-[3px]" />
                    <span>Create</span>
                  </button>

                  <AnimatePresence>
                    {showCreateDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 z-50 overflow-hidden"
                      >
                        {[
                          { label: 'Create Stay', icon: HomeIcon, tab: 'stays' },
                          { label: 'Create Helper', icon: UserGroupIcon, tab: 'online' },
                          { label: 'Create Event', icon: BellIcon, tab: 'events' },
                          { label: 'Create Service', icon: BriefcaseIcon, tab: 'experiences' }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleNavigate(currentUser ? `/${currentUser._id}/create-listing?tab=${item.tab}` : '/sign-in');
                              setShowCreateDropdown(false);
                            }}
                            className="w-full px-6 py-4 hover:bg-rose-50 transition-colors flex items-center gap-4 text-left "
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                               <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-sm font-black text-[#222222]">{item.label}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Start Now</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Globe Icon */}
                <button
                  onClick={() => {
                    console.log('Globe clicked - toggling language dropdown');
                    setShowLanguageDropdown(!showLanguageDropdown);
                    setShowProfileDropdown(false);
                  }}
                  className="language-button p-4 md:py-1 md:px-2 border-[1px] border-[#DDDDDD] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition hidden md:flex text-[#222222]"
                >
                  <GlobeAltIcon className="w-5 h-5" />
                </button>

                {/* Wishlist Icon - Desktop */}
                <button
                  onClick={() => handleNavigate('/wishlist')}
                  className="relative p-3 border-[1px] border-[#DDDDDD] flex items-center justify-center rounded-full cursor-pointer hover:shadow-md transition hidden md:flex text-[#222222]"
                >
                  <HeartIcon className="w-5 h-5 stroke-[2px]" />
                </button>

                {/* Notification Bell Icon - Desktop */}
                <button
                  onClick={() => handleNavigate('/notifications')}
                  className="relative p-3 border-[1px] border-[#DDDDDD] flex items-center justify-center rounded-full cursor-pointer hover:shadow-md transition hidden md:flex text-[#222222]"
                >
                  <BellIcon className="w-5 h-5 stroke-[2px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FF385C] text-white text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Menu Button - Airbnb Style */}
                <button
                  onClick={() => {
                    console.log('User menu clicked - toggling profile dropdown');
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowLanguageDropdown(false);
                  }}
                  className="p-4 md:py-1 md:px-2 border-[1px] border-[#DDDDDD] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition bg-white text-[#717171]"
                >
                  <Bars3Icon className="w-5 h-5" />
                  <div className="hidden md:block">
                    {currentUser ? (
                      <img 
                        src={currentUser.avatar} 
                        alt="profile" 
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#717171] flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* User Profile Dropdown - Refined App Style */}
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] w-[300px] bg-white overflow-hidden right-0 top-14 border border-gray-100 p-2 z-[60]"
                  >
                    <div className="flex flex-col">
                      {currentUser ? (
                        <>
                          <div
                            className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] mb-2 flex items-center gap-4 border border-gray-100 group cursor-pointer hover:border-rose-200 transition-all"
                            onClick={() => handleNavigate('/profile')}
                          >
                            <img 
                              src={currentUser.avatar} 
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500 ring-offset-2"
                              alt="Profile"
                            />
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-black text-[#222222] truncate">{currentUser.username}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">View Account</p>
                            </div>
                          </div>
                          
                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => handleNavigate('/dashboard')}
                              className="w-full px-5 py-3.5 bg-gray-950 hover:bg-black rounded-[1.2rem] transition-all flex items-center justify-between group shadow-lg mb-2"
                            >
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Squares2X2Icon className="w-4 h-4 text-white" />
                                 </div>
                                 <span className="text-xs font-black uppercase tracking-widest text-white">Master Dashboard</span>
                              </div>
                              <ChevronRightIcon className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <div className="grid grid-cols-3 gap-1 px-1">
                               <button onClick={() => handleNavigate('/wishlist')} className="p-4 rounded-xl hover:bg-gray-50 flex flex-col items-center gap-2 border border-transparent hover:border-gray-100 transition-all group">
                                  <HeartIcon className="w-5 h-5 text-gray-400 group-hover:text-[#FF385C]" />
                                  <span className="text-[8px] font-black uppercase tracking-tighter">Wishlist</span>
                               </button>
                               <button onClick={() => handleNavigate(`/${currentUser._id}/listings`)} className="p-4 rounded-xl hover:bg-gray-50 flex flex-col items-center gap-2 border border-transparent hover:border-gray-100 transition-all group">
                                  <QueueListIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                  <span className="text-[8px] font-black uppercase tracking-tighter">My Listings</span>
                               </button>
                               <button onClick={() => handleNavigate('/messages')} className="p-4 rounded-xl hover:bg-gray-50 flex flex-col items-center gap-2 border border-transparent hover:border-gray-100 transition-all group">
                                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                                  <span className="text-[8px] font-black uppercase tracking-tighter">Messages</span>
                               </button>
                            </div>

                            <div className="h-px bg-gray-50 my-2 mx-4" />

                            <button onClick={() => handleNavigate(`/${currentUser._id}/create-listing`)} className="w-full px-4 py-3 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                  <PlusCircleIcon className="w-5 h-5 text-[#FF385C] group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-black uppercase tracking-widest text-gray-700">Create Listing</span>
                               </div>
                               <ChevronRightIcon className="w-3 h-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button onClick={() => handleNavigate('/notifications')} className="w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                  <div className="relative">
                                     <BellIcon className="w-5 h-5 text-gray-400" />
                                     {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF385C] rounded-full border border-white" />}
                                  </div>
                                  <span className="text-xs font-bold text-gray-700">Notifications</span>
                               </div>
                               <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded-md text-gray-500">{unreadCount}</span>
                            </button>

                            <button onClick={() => handleNavigate('/trips')} className="w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                                  <span className="text-xs font-bold text-gray-700">My Expeditions</span>
                               </div>
                               <ChevronRightIcon className="w-3 h-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-50">
                            <button
                              onClick={handleSignOut}
                              className="w-full px-5 py-4 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-3 text-gray-500 italic"
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                            </button>
                          </div>
                        </>
                      ) : (
                      <>
                        <button
                          onClick={() => handleNavigate('/sign-up')}
                          className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-left text-[#222222] flex items-center gap-2"
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                          Sign up
                        </button>
                        <button
                          onClick={() => handleNavigate('/sign-in')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Log in
                        </button>
                        <div className="border-t border-[#DDDDDD] my-1"></div>
                        <button
                          onClick={() => handleNavigate('/host')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <HomeIcon className="w-4 h-4" />
                          loopOut your home
                        </button>
                        <button
                          onClick={() => handleNavigate('/help')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4" />
                          Help Center
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div
                  ref={languageDropdownRef}
                  className="absolute rounded-xl shadow-lg w-[240px] bg-white overflow-hidden right-0 top-12 text-sm border border-[#DDDDDD] max-h-[400px] overflow-y-auto hidden md:block"
                >
                  <div className="p-4 border-b border-[#DDDDDD] font-semibold text-[#222222]">
                    Choose a language
                  </div>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code, language.name)}
                      className="w-full px-4 py-3 hover:bg-gray-100 transition text-left flex items-center justify-between text-[#222222]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                      {selectedLanguage === language.name && (
                        <CheckIcon className="w-4 h-4 text-[#FF5A5F]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Screen Search Modal - Simplified */}
        {showSearch && (
          <div className="search-container absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl py-6 animate-[fadeIn_0.2s_ease-in-out]">
            <div className="max-w-3xl mx-auto px-6">
              {/* Search Input - Larger & Cleaner */}
              <div className="relative">
                <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-md border border-gray-200 flex items-center p-2 hover:shadow-lg transition-shadow">
                  <div className="flex-1 px-6 py-4">
                    <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1">Search</label>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Where to?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-900 text-lg placeholder-gray-400 font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl p-2 transition-all flex items-center justify-center min-w-[50px] h-[50px] shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5px]" />
                  </button>
                </form>

                {/* --- Suggestions Dropdown --- */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-[slideDown_0.2s_ease-out]">
                    <div className="py-2">
                      {suggestions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(item.term);
                            // Execute search immediately
                            const extracted = extractFiltersFromQuery(item.term);
                            const urlParams = new URLSearchParams();
                            urlParams.set('searchTerm', item.term);
                            urlParams.set('type', item.type || extracted.type || 'all');
                            urlParams.set('address', extracted.location || currentLocation);
                            Object.entries(extracted).forEach(([k, v]) => { if (k !== 'type' && k !== 'location') urlParams.set(k, v); });
                            navigate(`/search?${urlParams.toString()}`);
                            setShowSearch(false);
                            setSearchTerm('');
                            setSuggestions([]);
                          }}
                          className="w-full px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className={`p-2 rounded-lg ${item.isHistory ? 'bg-gray-100' : 'bg-rose-50'} text-gray-500`}>
                            {item.isHistory ? <MapPinIcon className="w-4 h-4" /> : <MagnifyingGlassIcon className="w-4 h-4 text-rose-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {item.term}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {item.type || 'All'}
                            </div>
                          </div>
                          <ChevronLeftIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors rotate-180" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Searches - Compact Pills */}
              {searchHistory.length > 0 && !searchTerm && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</h3>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 6).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const url = `/search?searchTerm=${encodeURIComponent(item.term)}&type=${item.type}&address=${encodeURIComponent(currentLocation)}`;
                          console.log('Recent search clicked - navigating to:', url);
                          navigate(url);
                          setShowSearch(false);
                        }}
                        className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 hover:border-gray-300 transition-all text-left"
                      >
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {item.term}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search by Category - Compact Grid */}
              {!searchTerm && (
                <div className="mt-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {searchCategories.map((category) => (
                      <button
                        key={category.key}
                        onClick={() => {
                          const url = `/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`;
                          console.log('Category clicked - navigating to:', url);
                          navigate(url);
                          setShowSearch(false);
                        }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition "
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 group-hover:bg-white border border-gray-200 group-hover:border-gray-300 rounded-xl transition-all shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                          <span className="text-xl">{category.icon}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 text-center leading-tight">
                          {category.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation - Elevated "Dock" with Emotion & Effects */}
      <AnimatePresence>
        {isNavVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="md:hidden fixed bottom-6 left-6 right-6 z-40 bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-white/50 pb-safe"
          >
            <div className="flex justify-around items-center h-20 px-4 relative">
              {[
                { to: '/', label: 'Explore', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid },
                { to: '/trips', label: 'Trips', icon: QueueListIcon, solidIcon: QueueListIcon },
              ].map((item, idx) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${isActive ? 'text-[#FF385C]' : 'text-gray-400'}`}
                  >
                    <motion.div 
                      whileTap={{ scale: 0.8 }}
                      className={`p-2.5 rounded-2xl relative z-10 ${isActive ? 'bg-rose-50' : 'bg-transparent'}`}
                    >
                       {isActive ? <item.solidIcon className="w-6 h-6" /> : <item.icon className="w-6 h-6 stroke-[2.2px]" />}
                       {isActive && (
                         <motion.div 
                           layoutId="activeGlow"
                           className="absolute inset-0 bg-[#FF385C]/10 rounded-2xl blur-md"
                           initial={false}
                           transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                         />
                       )}
                    </motion.div>
                    <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                  </Link>
                );
              })}
              
              <Link
                to="/trip"
                className="flex flex-col items-center -mt-12 relative z-50"
              >
                <button className="flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9, rotate: -5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-[#FF385C] blur-[25px] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                    <div className="w-16 h-16 bg-[#222222] rounded-[1.5rem] flex items-center justify-center  relative z-10 overflow-hidden">
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                        }}
                        transition={{ 
                          duration: 8, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                        className="absolute inset-0 bg-gradient-to-tr from-[#FF385C]/20 to-transparent opacity-50"
                      />
                      <SparklesIcon className="w-7 h-7 text-white stroke-[3px]" />
                    </div>
                  </motion.div>
                  <span className="text-[10px] mt-2 font-black uppercase tracking-widest text-[#222222] italic">Architect</span>
                </button>
              </Link>

              {[
                { to: '/messages', label: 'Inbox', icon: ChatBubbleLeftRightIcon, solidIcon: ChatBubbleLeftRightIconSolid, count: unreadCount },
              ].map((item, idx) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${isActive ? 'text-[#FF385C]' : 'text-gray-400'}`}
                  >
                    <motion.div 
                      whileTap={{ scale: 0.8 }}
                      className={`relative p-2.5 rounded-2xl ${isActive ? 'bg-rose-50' : 'bg-transparent'}`}
                    >
                      {isActive ? <item.solidIcon className="w-6 h-6" /> : <item.icon className="w-6 h-6 stroke-[2.2px]" />}
                      {isActive && (
                        <motion.div 
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-[#FF385C]/10 rounded-2xl blur-md"
                          initial={false}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {item.count > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 bg-[#FF385C] text-white text-[9px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-white font-black z-20"
                        >
                          {item.count}
                        </motion.span>
                      )}
                    </motion.div>
                    <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={handleMobileProfileClick}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'text-[#FF385C]' : 'text-gray-400'}`}
              >
                <motion.div 
                  whileTap={{ scale: 0.8 }}
                  className={`p-2.5 rounded-2xl transition-all ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'bg-rose-50' : 'bg-transparent'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-[1.5px] overflow-hidden flex items-center justify-center ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'border-[#FF385C]' : 'border-gray-200'}`}>
                    {currentUser ? (
                      <img src={currentUser.avatar} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-full h-full" />
                    )}
                  </div>
                </motion.div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Vault</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
}