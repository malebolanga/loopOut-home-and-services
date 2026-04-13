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
  BriefcaseIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  HomeModernIcon
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
  const [searchType, setSearchType] = useState('properties');
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
      }).catch(() => { });
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
    urlParams.set('type', extractedFilters.type || searchType || 'properties');
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

  const hiddenRoutes = ['/profile', '/wishlist'];
  const hiddenPrefixes = ['/user/', '/user-profile/', '/listing/', '/helper/', '/service/', '/event/'];
  
  const isHeaderHidden = 
    hiddenRoutes.includes(location.pathname) || 
    hiddenPrefixes.some(prefix => location.pathname.startsWith(prefix));

  // Completely hide on some specific pages if needed, 
  // but for now let's just use the flag for the elements.

  return (
    <>
      {/* Floating Glass Header - Matches Bottom Dock Aesthetic */}
      {!isHeaderHidden && (
        <motion.header
          initial={{ y: 0 }}
          animate={{ y: isNavVisible ? 0 : -120 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          ref={headerRef}
          className="fixed top-8 left-0 right-0 z-[100] overflow-visible bg-transparent"
        >
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-8">
          <div className="flex flex-row items-center justify-between h-12">
            
            {/* Left: Icon-Triggered Search */}
            <div className={`transition-all duration-300 ${showSearch ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
              <button
                onClick={() => setShowSearch(true)}
                className="search-trigger group relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-[0_15px_35px_-10px_rgba(225,29,72,0.15)] hover:shadow-2xl hover:scale-110 transition-all duration-500 active:scale-95 border border-rose-100"
              >
                <div className="absolute inset-0 bg-rose-500 opacity-0 group-hover:opacity-10 rounded-full blur-md transition-opacity" />
                <MagnifyingGlassIcon className="w-7 h-7 text-rose-600 stroke-[2.5px]" />
              </button>
            </div>

            {/* Center: Spacer */}
            <div className="flex-1"></div>

            {/* Right: User Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <div className="flex flex-row items-center gap-3">

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
                        className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 py-5 z-50 overflow-hidden"
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
                  className="flex flex-row items-center justify-center w-14 h-14 bg-white rounded-full cursor-pointer shadow-[0_15px_35px_-10px_rgba(225,29,72,0.15)] hover:shadow-2xl hover:scale-110 transition-all duration-500 animate-in fade-in zoom-in border border-rose-100 text-rose-600"
                >
                  <Bars3Icon className="w-7 h-7 stroke-[2.5px]" />
                  <div className="hidden">
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
                    className="absolute rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-[320px] bg-slate-50 overflow-hidden right-0 top-14 border border-gray-100 p-3 z-[60]"
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
                  className="absolute rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-[260px] bg-white overflow-hidden right-0 top-12 text-sm border border-gray-100 max-h-[400px] overflow-y-auto hidden md:block z-[60]"
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
      </motion.header>
    )}

    {/* Full Screen Elite Search Modal - Airbnb Style */}
    <AnimatePresence>
      {showSearch && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowSearch(false)} 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[1000]" 
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="search-container fixed inset-0 bg-gray-50 z-[1001] flex flex-col md:max-w-md md:left-auto md:right-0 md:shadow-2xl overflow-hidden"
          >
            <div className="flex-shrink-0 bg-white px-6 pt-12 pb-4 flex items-center justify-between">
              <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2">
                {[
                  { id: 'properties', label: 'Homes', icon: HomeIcon, color: 'rose' },
                  { id: 'events', label: 'Experiences', icon: MagnifyingGlassIcon, color: 'rose' },
                  { id: 'services', label: 'Services', icon: UserGroupIcon, color: 'rose' },
                  { id: 'helpers', label: 'Helpers', icon: BriefcaseIcon, color: 'rose' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = searchType === item.id;
                  
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setSearchType(item.id)}
                      className="flex flex-col items-center gap-2 relative outline-none"
                    >
                       <motion.div 
                         animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
                         transition={{ duration: 0.4, ease: "backOut" }}
                         className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-900 group-hover:-translate-y-1'}`}
                       >
                          <Icon className="w-6 h-6" />
                       </motion.div>
                       
                       <motion.span 
                         animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1.05 : 1 }}
                         className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
                       >
                         {item.label}
                       </motion.span>
                       
                       {isActive && (
                         <motion.div 
                           layoutId="categoryLine" 
                           className="absolute -bottom-1 w-6 h-1 bg-rose-500 rounded-full" 
                         />
                       )}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setShowSearch(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-900" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
               {/* Section: WHERE? */}
               <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Where to?</h2>
                  
                  <div className="relative mb-8">
                     <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                       type="text"
                       placeholder="Search destinations"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none font-medium placeholder-gray-400"
                     />
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Suggested destinations</p>
                     
                     <button 
                       onClick={() => { setSearchTerm('Nearby'); handleSearch(); }}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                           <MapPinIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Nearby</p>
                           <p className="text-xs text-gray-500">Find what's around you</p>
                        </div>
                     </button>

                     <button 
                       onClick={() => { setSearchTerm('Cape Town, Western Cape'); handleSearch(); }}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                           <BuildingOfficeIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Cape Town, Western Cape</p>
                           <p className="text-xs text-gray-500">Popular beach destination</p>
                        </div>
                     </button>

                     <button 
                       onClick={() => { setSearchTerm('Durban, KwaZulu-Natal'); handleSearch(); }}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                           <HomeModernIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Durban, KwaZulu-Natal</p>
                           <p className="text-xs text-gray-500">For sights like uShaka Marine World</p>
                        </div>
                     </button>
                  </div>
               </div>

               {/* Collapsed Sections: WHEN and WHO */}
               <div className="bg-white rounded-[1.5rem] shadow-sm p-5 flex items-center justify-between border border-gray-100 opacity-60">
                  <span className="text-sm font-bold text-gray-900">When</span>
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Add dates</span>
               </div>

               <div className="bg-white rounded-[1.5rem] shadow-sm p-5 flex items-center justify-between border border-gray-100 opacity-60">
                  <span className="text-sm font-bold text-gray-900">Who</span>
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Add guests</span>
               </div>
            </div>

            {/* Footer - Search Button */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 p-6 flex items-center justify-between">
               <button 
                 onClick={() => { setSearchTerm(''); }}
                 className="text-sm font-bold text-gray-900 underline underline-offset-4 hover:text-rose-600 transition-colors"
               >
                 Clear all
               </button>
               
               <button 
                 onClick={() => { handleSearch(); setShowSearch(false); }}
                 className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-[1.2rem] flex items-center gap-3 shadow-xl transition-all active:scale-95"
               >
                 <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                 <span className="text-sm font-black uppercase tracking-widest">Search</span>
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      <AnimatePresence>
        {isNavVisible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="md:hidden fixed bottom-6 left-6 right-6 z-[1000] rounded-[2.8rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible"
          >
            <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl rounded-[2.8rem] border border-white/40" />

            <div className="flex justify-around items-center h-17 px-6 relative z-10">
              {/* Active Tab Indicator Pill */}
              <div className="absolute inset-0 flex justify-around items-center px-6 pointer-events-none">
                {[0, 1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex-1 flex justify-center h-full items-center">
                    {( (i === 0 && location.pathname === '/') ||
                      (i === 1 && location.pathname === '/trips') ||
                      (i === 2 && location.pathname === '/trip') ||
                      (i === 3 && location.pathname === '/messages') ||
                      (i === 4 && (location.pathname === '/profile' || location.pathname === '/sign-in')) ) ? (
                      <motion.div
                        layoutId="navTab"
                        className="w-14 h-14 bg-rose-500/10 rounded-2xl blur-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              <Link to="/" className={`flex flex-col items-center gap-1.5 relative transition-colors duration-300 ${location.pathname === '/' ? 'text-rose-600' : 'text-gray-400'}`}>
                <motion.div whileTap={{ scale: 0.85 }}>
                  {location.pathname === '/' ? <MagnifyingGlassIconSolid className="w-6 h-6" /> : <MagnifyingGlassIcon className="w-6 h-6 stroke-[2.2px]" />}
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-widest">Explore</span>
              </Link>

              <Link to="/trips" className={`flex flex-col items-center gap-1.5 relative transition-colors duration-300 ${location.pathname === '/trips' ? 'text-rose-600' : 'text-gray-400'}`}>
                <motion.div whileTap={{ scale: 0.85 }}>
                  <MapPinIcon className={`w-6 h-6 ${location.pathname === '/trips' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-widest">Trips</span>
              </Link>

              <Link
                to="/trip"
                className="relative -mt-8 flex flex-col items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-rose-500 blur-[25px] opacity-40 animate-pulse" />
                  <div className="w-18 h-18 bg-gray-950 rounded-[1.8rem] flex items-center justify-center border-[4px] border-white shadow-2xl relative z-10 overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 inset-y-0 bg-gradient-to-tr from-rose-500/30 to-transparent"
                    />
                    <SparklesIcon className="w-8 h-8 text-white stroke-[2.5px]" />
                  </div>
                </motion.div>
                <span className="text-[9px] -mt-1 font-black uppercase tracking-[0.1em] text-gray-950 italic">Masterpiece</span>
              </Link>

              <Link to="/messages" className={`flex flex-col items-center gap-1.5 relative transition-colors duration-300 ${location.pathname === '/messages' ? 'text-rose-600' : 'text-gray-400'}`}>
                <motion.div whileTap={{ scale: 0.85 }} className="relative">
                  {location.pathname === '/messages' ? <ChatBubbleLeftRightIconSolid className="w-6 h-6" /> : <ChatBubbleLeftRightIcon className="w-6 h-6 stroke-[2.2px]" />}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[8px] min-w-[15px] h-3.5 flex items-center justify-center rounded-full border border-white font-black px-0.5">
                      {unreadCount}
                    </span>
                  )}
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-widest text-center">Inbox</span>
              </Link>

              <button
                onClick={handleMobileProfileClick}
                className={`flex flex-col items-center gap-1.5 relative transition-colors duration-300 ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'text-rose-600' : 'text-gray-400'}`}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`w-10 h-10 rounded-2xl border-2 transition-all duration-300 ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-gray-200'}`}
                >
                  <div className="w-full h-full rounded-[0.8rem] overflow-hidden">
                    {currentUser ? (
                      <img src={currentUser.avatar} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-full h-full" />
                    )}
                  </div>
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isHeaderHidden && (
        <>
          <div className="h-28 md:h-32"></div>
        </>
      )}
    </>
  );
}