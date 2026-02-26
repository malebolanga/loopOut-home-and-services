// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  FiSearch,
  FiBell,
  FiHeart,
  FiUser,
  FiPlusCircle,
  FiLogOut,
  FiSettings,
  FiHelpCircle,
  FiMenu,
  FiMap,
  FiX,
  FiMessageCircle,
  FiGlobe,
  FiHome,
  FiBriefcase,
  FiCalendar,
  FiUsers,
  FiChevronLeft,
  FiChevronDown,
  FiDollarSign,
  FiCheck,
  FiList
} from "react-icons/fi";

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

// Reusable AirbnbLogo Component
function AirbnbLogo({ className = "h-8 w-auto" }) {
  return (
    <svg 
      className={`${className} text-[#FF5A5F]`} 
      viewBox="0 0 102 32" 
      fill="currentColor"
      aria-label="Airbnb logo"
    >
      <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.4 5.4 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1.03-.76 1.5l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.83 6.83 0 007.2 9.23 8.38 8.38 0 003.18-.76c1.27-.57 2.4-1.37 3.34-2.37 1.02-1.07 1.93-2.3 2.86-3.55l.06-.06c1.16-1.56 2.3-3.2 3.43-4.82l.06-.06c1.1-1.53 2.18-3.05 3.28-4.56l.06-.06c.03-.03.06-.06.06-.06.03-.03.06-.06.06-.06 1.1 1.5 2.18 3.03 3.28 4.56l.06.06c1.13 1.62 2.27 3.26 3.43 4.82l.06.06c.93 1.25 1.84 2.48 2.86 3.55.94.99 2.07 1.8 3.34 2.37 1.02.47 2.1.73 3.18.76a6.83 6.83 0 007.2-9.23zM7.96 21.17c-.48.75-1.03 1.5-1.63 2.18-1.04 1.17-2.4 1.97-3.8 2.2-1.03.17-2.07-.03-2.93-.58a3.8 3.8 0 01-1.5-1.9c-.2-.52-.2-1.1-.03-1.63.16-.52.46-.99.85-1.37.73-.73 1.63-1.27 2.56-1.63.99-.39 2.03-.61 3.07-.73h.06c.16 0 .32.03.48.06-.03.32-.06.64-.06.99 0 1.14.14 2.27.42 3.37.06.23.13.45.2.67.03.06.06.13.09.2-.13.03-.26.06-.42.06zM50.96 9.51c-.26-1.23-.99-2.27-1.93-2.93-.99-.67-2.2-.99-3.46-.85-1.2.14-2.27.67-3.07 1.5-.76.82-1.23 1.9-1.37 3.07-.14 1.14.06 2.27.52 3.2.52.99 1.3 1.76 2.3 2.27.99.52 2.14.73 3.28.58 1.14-.14 2.2-.64 3.01-1.4.82-.79 1.37-1.84 1.5-3.01.06-.52.03-1.07-.06-1.6zm-1.63 1.4c-.1.64-.39 1.23-.82 1.7-.46.49-1.07.82-1.76.91-.67.1-1.37-.03-1.93-.36-.58-.32-1.04-.82-1.3-1.43-.26-.61-.32-1.3-.2-1.96.13-.64.46-1.2.91-1.63.49-.46 1.1-.76 1.76-.85.67-.1 1.34.03 1.9.36.58.32 1.04.79 1.3 1.4.29.58.35 1.24.24 1.9zM62.87 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07a4.1 4.1 0 00-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03-.03-.03 0-.03 0-.03zM73.73 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07-.1-.16-.2-.35-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03zM84.6 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07-.1-.16-.2-.35-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03zM95.46 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07-.1-.16-.2-.35-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03z"/>
    </svg>
  );
}

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('San Francisco');
  
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
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
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

    const updatedHistory = [{ term: searchTerm, type: 'all', timestamp: new Date().toISOString() }, ...searchHistory.slice(0, 9)];
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);

    const url = `/search?searchTerm=${encodeURIComponent(searchTerm)}&type=all&address=${encodeURIComponent(currentLocation)}`;
    console.log('Navigating to:', url);
    navigate(url);
    setShowSearch(false);
    setSearchTerm('');
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

  return (
    <>
      {/* Airbnb-style Header */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
            
            {/* Logo - Airbnb Style */}
            <Link 
              to="/" 
              className="hidden md:block cursor-pointer"
              onClick={() => console.log('Logo clicked - navigating to /')}
            >
              <AirbnbLogo className="h-8 w-auto" />
            </Link>

            {/* Center: Simplified Search Bar */}
            <div className="flex-1 max-w-[850px] mx-auto px-4">
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
                    <div className="p-2 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-full text-white flex-shrink-0">
                      <FiSearch className="w-4 h-4" />
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
                  <FiGlobe className="w-4 h-4" />
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
                  <FiMenu className="w-4 h-4" />
                  <div className="hidden md:block">
                    {currentUser ? (
                      <div className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center text-white text-sm font-semibold">
                        {currentUser.username?.charAt(0)?.toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#717171] flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-white" />
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
                        <div className="border-t border-[#DDDDDD] my-1"></div>
                        <button
                          onClick={() => handleNavigate('/list')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222] flex items-center gap-2"
                        >
                          <FiList className="w-4 h-4" />
                          My Listings
                        </button>
                        <button
                          onClick={() => handleNavigate('/host')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
                          Manage listings
                        </button>
                        <button
                          onClick={() => handleNavigate('/messages')}
                          className="px-4 py-3 hover:bg-gray-100 transition flex justify-between items-center text-left text-[#222222]"
                        >
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#FF5A5F] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <div className="border-t border-[#DDDDDD] my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNavigate('/sign-up')}
                          className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-left text-[#222222]"
                        >
                          Sign up
                        </button>
                        <button
                          onClick={() => handleNavigate('/sign-in')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
                          Log in
                        </button>
                        <div className="border-t border-[#DDDDDD] my-1"></div>
                        <button
                          onClick={() => handleNavigate('/host')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
                          loopOut your home
                        </button>
                        <button
                          onClick={() => handleNavigate('/help')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left text-[#222222]"
                        >
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
                        <FiCheck className="w-4 h-4 text-[#FF5A5F]" />
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
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center p-2 hover:shadow-xl transition-shadow">
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
        onClick={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl p-2 transition-all flex items-center justify-center min-w-[50px] h-[50px] shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
      >
        <FiSearch className="w-5 h-5" />
      </button>
    </form>

    {/* Recent Searches - Compact Pills */}
    {searchHistory.length > 0 && (
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
              <FiSearch className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
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
  </div>
</div>
        )}
      </header>

      {/* Mobile Bottom Navigation - Airbnb Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DDDDDD] pb-safe">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            onClick={() => console.log('Mobile nav: Explore clicked')}
            className={`flex flex-col items-center p-2 ${location.pathname === '/' ? 'text-[#FF5A5F]' : 'text-[#717171]'}`}
          >
            <FiSearch className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Explore</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={() => console.log('Mobile nav: Wishlists clicked')}
            className={`flex flex-col items-center p-2 ${location.pathname === '/wishlist' ? 'text-[#FF5A5F]' : 'text-[#717171]'}`}
          >
            <FiHeart className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Wishlists</span>
          </Link>
          <Link
            to={currentUser ? `/${currentUser._id}/create-listing` : '/sign-in'}
            onClick={() => console.log('Mobile nav: Create clicked')}
            className="flex flex-col items-center p-2 text-[#717171]"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-full flex items-center justify-center -mt-6 border-4 border-white shadow-lg">
              <FiPlusCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] mt-1 font-medium">Create</span>
          </Link>
          <Link
            to="/messages"
            onClick={() => console.log('Mobile nav: Inbox clicked')}
            className={`flex flex-col items-center p-2 ${location.pathname === '/messages' ? 'text-[#FF5A5F]' : 'text-[#717171]'}`}
          >
            <div className="relative">
              <FiMessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5A5F] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Inbox</span>
          </Link>
          <button
            onClick={handleMobileProfileClick}
            className={`flex flex-col items-center p-2 ${location.pathname === '/profile' || location.pathname === '/sign-in' ? 'text-[#FF5A5F]' : 'text-[#717171]'}`}
          >
            <div className="w-6 h-6 rounded-full bg-[#DDDDDD] flex items-center justify-center overflow-hidden">
              {currentUser ? (
                <span className="text-xs font-bold text-[#222222]">
                  {currentUser.username?.charAt(0)?.toUpperCase()}
                </span>
              ) : (
                <FiUser className="w-4 h-4 text-[#717171]" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
}