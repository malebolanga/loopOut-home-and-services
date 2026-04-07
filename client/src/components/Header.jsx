// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';

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
  MapPinIcon
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
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
      {/* Airbnb-style Header */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">

            <Link
              to="/"
              className="hidden md:block cursor-pointer"
              onClick={() => console.log('Logo clicked - navigating to /')}
            >
              <BrandLogo className="h-8 w-auto" />
            </Link>

            {/* Center: Simplified Search Bar */}
            <div className={`flex-1 max-w-[850px] mx-auto px-4 transition-opacity duration-200 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div
                onClick={() => {
                  console.log('Search bar clicked - opening search modal');
                  setShowSearch(true);
                }}
                className="search-trigger w-full md:w-auto md:min-w-[300px] mx-auto cursor-pointer"
              >
                <div className="border rounded-full py-2 pl-6 pr-2 shadow-sm hover:shadow-md transition cursor-pointer border-[#DDDDDD] bg-white">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-sm font-semibold px-6 flex-1 truncate text-[#222222]">
                      Start your search
                    </div>
                    <div className="p-2.5 bg-[#FF385C] rounded-full text-white flex-shrink-0">
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

              {/* Profile Dropdown - Airbnb Style (Desktop only) */}
              {showProfileDropdown && (
                <div className="absolute rounded-xl shadow-lg w-[240px] bg-white overflow-hidden right-0 top-12 text-sm border border-[#DDDDDD]">
                  <div className="flex flex-col cursor-pointer">
                    {currentUser ? (
                      <>
                        <div
                          className="px-4 py-3 font-semibold border-b border-[#DDDDDD] hover:bg-gray-100 transition text-[#222222]"
                          onClick={() => handleNavigate('/profile')}
                        >
                          {currentUser.username}
                        </div>
                        <button
                          onClick={() => handleNavigate('/trips')}
                          className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-left text-[#222222]"
                        >
                          Trips
                        </button>
                        <button
                          onClick={() => handleNavigate('/wishlist')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
                          Wishlists
                        </button>
                        <button
                          onClick={() => handleNavigate('/recently-viewed')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
                          History
                        </button>
                        <div className="border-t border-[#DDDDDD] my-1"></div>
                        <button
                          onClick={() => handleNavigate(`/${currentUser._id}/listings`)}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <QueueListIcon className="w-4 h-4" />
                          User Listings
                        </button>
                        <button
                          onClick={() => handleNavigate('/list')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <QueueListIcon className="w-4 h-4" />
                          My Listings
                        </button>
                        <button
                          onClick={() => handleNavigate('/host')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <HomeIcon className="w-4 h-4" />
                          Manage listings
                        </button>
                        <button
                          onClick={() => handleNavigate('/dashboard')}
                          className="px-4 py-3 hover:bg-rose-50 transition text-left text-rose-600 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
                        >
                          <Squares2X2Icon className="w-4 h-4" />
                          Host Dashboard
                        </button>
                        <button
                          onClick={() => handleNavigate('/messages')}
                          className="px-4 py-3 hover:bg-gray-100 transition flex items-center gap-2 text-left text-[#222222]"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>Messages</span>
                        </button>
                        <button
                          onClick={() => handleNavigate('/notifications')}
                          className="px-4 py-3 hover:bg-gray-100 transition flex justify-between items-center text-left text-[#222222]"
                        >
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#FF385C] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <div className="border-t border-[#DDDDDD] my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Log out
                        </button>
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
                </div>
              )}

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
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition group"
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

      {/* Mobile Bottom Navigation - Airbnb Style */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white  pb-safe transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            className={`flex flex-col items-center p-2 transition-colors duration-200 ${location.pathname === '/' ? 'text-[#FF385C]' : 'text-[#717171]'}`}
          >
            {location.pathname === '/' ? (
              <MagnifyingGlassIconSolid className="w-6 h-6" />
            ) : (
              <MagnifyingGlassIcon className="w-6 h-6 stroke-[2px]" />
            )}
            <span className={`text-[10px] mt-1 font-semibold ${location.pathname === '/' ? 'text-[#FF385C]' : 'text-[#717171]'}`}>Explore</span>
          </Link>
          <Link
            to="/dashboard"
            className={`flex flex-col items-center p-2 transition-colors duration-200 ${location.pathname === '/dashboard' ? 'text-[#FF385C]' : 'text-[#717171]'}`}
          >
            {location.pathname === '/dashboard' ? (
              <Squares2X2IconSolid className="w-6 h-6" />
            ) : (
              <Squares2X2Icon className="w-6 h-6 stroke-[2px]" />
            )}
            <span className={`text-[10px] mt-1 font-semibold ${location.pathname === '/dashboard' ? 'text-[#FF385C]' : 'text-[#717171]'}`}>Dashboard</span>
          </Link>
          <Link
            to={currentUser ? `/${currentUser._id}/create-listing` : '/sign-in'}
            className="flex flex-col items-center p-2 text-[#717171] "
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-full flex items-center justify-center -mt-8 border-[5px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-active:scale-90 transition-transform">
              <PlusIcon className="w-7 h-7 text-white stroke-[3px]" />
            </div>
            <span className="text-[10px] mt-1 font-semibold">Create</span>
          </Link>
          <Link
            to="/messages"
            className={`flex flex-col items-center p-2 transition-colors duration-200 ${location.pathname === '/messages' ? 'text-[#FF385C]' : 'text-[#717171]'}`}
          >
            <div className="relative">
              {location.pathname === '/messages' ? (
                <ChatBubbleLeftRightIconSolid className="w-6 h-6" />
              ) : (
                <ChatBubbleLeftRightIcon className="w-6 h-6 stroke-[2px]" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF385C] text-white text-[9px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${location.pathname === '/messages' ? 'text-[#FF385C]' : 'text-[#717171]'}`}>Inbox</span>
          </Link>
          <button
            onClick={handleMobileProfileClick}
            className={`flex flex-col items-center p-2 transition-colors duration-200 ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'text-[#FF385C]' : 'text-[#717171]'}`}
          >
            <div className={`w-7 h-7 rounded-full border-[1.5px] overflow-hidden flex items-center justify-center ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'border-[#FF385C]' : 'border-gray-200'}`}>
              {currentUser ? (
                <img 
                  src={currentUser.avatar} 
                  alt="profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                  }}
                />
              ) : (
                <UserCircleIcon className="w-full h-full text-gray-400" />
              )}
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'text-[#FF385C]' : 'text-[#717171]'}`}>Profile</span>
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
}