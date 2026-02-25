// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Navbar.scss";
import "../styles/breakpoints.scss";

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
  FiCheck
} from "react-icons/fi";

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

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

  return (
    <>
      {/* Airbnb-style Header */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="hidden md:block cursor-pointer"
              onClick={() => console.log('Logo clicked - navigating to /')}
            >
              <div className="flex items-center gap-1">
                <span className="text-[#ff385c] text-2xl font-bold tracking-tighter">
                  loopOut
                </span>
              </div>
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
                <div className="border rounded-full py-2 pl-6 pr-2 shadow-sm hover:shadow-md transition cursor-pointer border-gray-300 bg-white">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-sm font-semibold px-6 flex-1 truncate">
                      Start your search
                    </div>
                    <div className="p-2 bg-[#ff385c] rounded-full text-white flex-shrink-0">
                      <FiSearch className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <div className="flex flex-row items-center gap-3">
                {/* Become a Host - Desktop */}
                <button
                  onClick={() => handleNavigate('/host')}
                  className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition cursor-pointer"
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
                  className="language-button p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition hidden md:flex"
                >
                  <FiGlobe className="w-4 h-4" />
                </button>

                {/* User Menu Button */}
                <button
                  onClick={() => {
                    console.log('User menu clicked - toggling profile dropdown');
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowLanguageDropdown(false);
                  }}
                  className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition bg-white"
                >
                  <FiMenu className="w-4 h-4" />
                  <div className="hidden md:block">
                    {currentUser ? (
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-semibold">
                        {currentUser.username?.charAt(0)?.toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Profile Dropdown - Airbnb Style */}
              {showProfileDropdown && (
                <div className="absolute rounded-xl shadow-md w-[240px] bg-white overflow-hidden right-0 top-12 text-sm border border-gray-200">
                  <div className="flex flex-col cursor-pointer">
                    {currentUser ? (
                      <>
                        <div 
                          className="px-4 py-3 font-semibold border-b border-gray-100 hover:bg-gray-100 transition"
                          onClick={() => handleNavigate('/profile')}
                        >
                          {currentUser.username}
                        </div>
                        <button
                          onClick={() => handleNavigate('/trips')}
                          className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-left"
                        >
                          Trips
                        </button>
                        <button
                          onClick={() => handleNavigate('/wishlist')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left"
                        >
                          Wishlists
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => handleNavigate('/host')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left"
                        >
                          Manage listings
                        </button>
                        <button
                          onClick={() => handleNavigate('/messages')}
                          className="px-4 py-3 hover:bg-gray-100 transition flex justify-between items-center text-left"
                        >
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#ff385c] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNavigate('/sign-up')}
                          className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-left"
                        >
                          Sign up
                        </button>
                        <button
                          onClick={() => handleNavigate('/sign-in')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left"
                        >
                          Log in
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => handleNavigate('/host')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left"
                        >
                          loopOut your home
                        </button>
                        <button
                          onClick={() => handleNavigate('/help')}
                          className="px-4 py-3 hover:bg-gray-100 transition text-left"
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
                  className="absolute rounded-xl shadow-md w-[240px] bg-white overflow-hidden right-0 top-12 text-sm border border-gray-200 max-h-[400px] overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-100 font-semibold">
                    Choose a language
                  </div>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code, language.name)}
                      className="w-full px-4 py-3 hover:bg-gray-100 transition text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                      {selectedLanguage === language.name && (
                        <FiCheck className="w-4 h-4 text-[#ff385c]" />
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
          <div className="search-container absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-8 animate-[fadeIn_0.2s_ease-in-out]">
            <div className="max-w-[850px] mx-auto px-4">
              <form onSubmit={handleSearch} className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center p-2">
                <div className="flex-1 px-6 py-3">
                  <div className="text-xs font-bold text-gray-800 mb-1">Where</div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search destinations"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-600 text-base"
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
                  className="bg-[#ff385c] hover:bg-[#d90b3e] text-white rounded-full p-4 transition flex items-center gap-2 min-w-[100px] justify-center"
                >
                  <FiSearch className="w-5 h-5" />
                  <span className="font-semibold">Search</span>
                </button>
              </form>

              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Recent searches</h3>
                    <button
                      onClick={clearSearchHistory}
                      className="text-sm underline font-semibold cursor-pointer hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchHistory.slice(0, 4).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const url = `/search?searchTerm=${encodeURIComponent(item.term)}&type=${item.type}&address=${encodeURIComponent(currentLocation)}`;
                          console.log('Recent search clicked - navigating to:', url);
                          navigate(url);
                          setShowSearch(false);
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition border border-gray-200 text-left"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiSearch className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{item.term}</div>
                          <div className="text-sm text-gray-500 capitalize">{item.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search by Category */}
              <div className="mt-8">
                <h3 className="font-bold text-gray-800 mb-4">Search by category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {searchCategories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => {
                        const url = `/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`;
                        console.log('Category clicked - navigating to:', url);
                        navigate(url);
                        setShowSearch(false);
                      }}
                      className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition cursor-pointer"
                    >
                      <span className="text-3xl mb-2">{category.icon}</span>
                      <span className="font-semibold text-gray-800">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            onClick={() => console.log('Mobile nav: Explore clicked')}
            className={`flex flex-col items-center p-2 ${location.pathname === '/' ? 'text-[#ff385c]' : 'text-gray-500'}`}
          >
            <FiSearch className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Explore</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={() => console.log('Mobile nav: Wishlists clicked')}
            className={`flex flex-col items-center p-2 ${location.pathname === '/wishlist' ? 'text-[#ff385c]' : 'text-gray-500'}`}
          >
            <FiHeart className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Wishlists</span>
          </Link>
          <Link
            to={currentUser ? `/${currentUser._id}/create-listing` : '/sign-in'}
            onClick={() => console.log('Mobile nav: Create clicked')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <div className="w-12 h-12 bg-[#ff385c] rounded-full flex items-center justify-center -mt-6 border-4 border-white shadow-lg">
              <FiPlusCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] mt-1 font-medium">Create</span>
          </Link>
          <Link
            to="/messages"
            onClick={() => console.log('Mobile nav: Inbox clicked')}
            className={`flex flex-col items-center p-2 ${location.pathname === '/messages' ? 'text-[#ff385c]' : 'text-gray-500'}`}
          >
            <div className="relative">
              <FiMessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff385c] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Inbox</span>
          </Link>
          <button
            onClick={() => {
              console.log('Mobile nav: Profile clicked');
              setShowProfileDropdown(!showProfileDropdown);
            }}
            className={`flex flex-col items-center p-2 ${showProfileDropdown ? 'text-[#ff385c]' : 'text-gray-500'}`}
          >
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {currentUser ? (
                <span className="text-xs font-bold text-gray-600">
                  {currentUser.username?.charAt(0)?.toUpperCase()}
                </span>
              ) : (
                <FiUser className="w-4 h-4" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Mobile Profile Menu Overlay */}
      {showProfileDropdown && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowProfileDropdown(false)}>
          <div 
            className="absolute bottom-16 left-4 right-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                      {currentUser.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{currentUser.username}</div>
                      <div className="text-sm text-gray-500">View profile</div>
                    </div>
                  </div>
                  <button onClick={() => handleNavigate('/trips')} className="w-full text-left p-3 hover:bg-gray-100 rounded-lg">Trips</button>
                  <button onClick={() => handleNavigate('/wishlist')} className="w-full text-left p-3 hover:bg-gray-100 rounded-lg">Wishlists</button>
                  <button onClick={() => handleNavigate('/host')} className="w-full text-left p-3 hover:bg-gray-100 rounded-lg">Manage listings</button>
                  <div className="border-t my-2"></div>
                  <button onClick={handleSignOut} className="w-full text-left p-3 text-red-600 hover:bg-gray-100 rounded-lg">Log out</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNavigate('/sign-up')} className="w-full text-left p-3 hover:bg-gray-100 rounded-lg font-semibold">Sign up</button>
                  <button onClick={() => handleNavigate('/sign-in')} className="w-full text-left p-3 hover:bg-gray-100 rounded-lg">Log in</button>
                  <div className="border-t my-2"></div>
                  <button onClick={() => handleNavigate('/host')} className="w-full text-left p-3 hover:bg-gray-100 rounded-lg">loopOut your home</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
}