// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Navbar.scss";
import "../styles/breakpoints.scss";

import {
  FiSearch,
  FiMessageSquare,
  FiBell,
  FiMap,
  FiClock,
  FiHome,
  FiUser,
  FiFileText,
  FiPlusCircle,
  FiHeart,
  FiLogOut,
  FiSettings,
  FiGlobe,
  FiHelpCircle,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCompass,
  FiMessageCircle
} from "react-icons/fi";

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('San Francisco');
  
  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications - wrapped in useCallback
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingNotifications(true);
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
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [currentUser]);

  // Use the fetchNotifications function
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close profile dropdown when clicking outside
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      
      // Close suggestions when clicking outside
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when search becomes visible
  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchVisible]);

  // Generate search suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = () => {
      const suggestions = [];
      
      // Add search history suggestions
      searchHistory.forEach(item => {
        if (item.term.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.push({
            term: item.term,
            type: item.type,
            isHistory: true
          });
        }
      });

      // Add type-based suggestions
      const typeSuggestions = {
        properties: ['apartment', 'house', 'villa', 'studio', 'condo'],
        services: ['cleaning', 'moving', 'repair', 'maintenance'],
        helpers: ['tutor', 'cleaner', 'chef', 'handyman'],
        events: ['concert', 'festival', 'workshop', 'party']
      };

      Object.entries(typeSuggestions).forEach(([type, terms]) => {
        terms.forEach(term => {
          if (term.includes(searchTerm.toLowerCase())) {
            suggestions.push({
              term: term.charAt(0).toUpperCase() + term.slice(1),
              type: type,
              isHistory: false
            });
          }
        });
      });

      // Remove duplicates
      const uniqueSuggestions = suggestions.filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.term === suggestion.term && s.type === suggestion.type)
      );

      return uniqueSuggestions.slice(0, 10);
    };

    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  }, [searchTerm, searchHistory]);

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
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Handle sign in
  const handleSignIn = () => {
    navigate('/sign-in');
    setShowProfileDropdown(false);
  };

  // Handle sign up
  const handleSignUp = () => {
    navigate('/sign-up');
    setShowProfileDropdown(false);
  };

  // Save search history
  const saveSearchHistory = (term, type, filters = {}) => {
    try {
      const searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
      const newSearch = { term, type, filters, timestamp: new Date().toISOString() };
      
      // Remove duplicates
      const filtered = searches.filter(item => 
        item.term !== term || item.type !== type
      );
      
      const updated = [newSearch, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to save search history:', error);
      return [];
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
    setSuggestions([]);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const searchType = activeType === 'all' ? 'all' : activeType;
    const updatedHistory = saveSearchHistory(searchTerm, searchType);
    setSearchHistory(updatedHistory);

    // Navigate to search page with parameters
    navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&type=${searchType}&address=${encodeURIComponent(currentLocation)}`);
    setShowSuggestions(false);
    setSearchVisible(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.term);
    setShowSuggestions(false);
    
    const updatedHistory = saveSearchHistory(suggestion.term, suggestion.type);
    setSearchHistory(updatedHistory);

    navigate(`/search?searchTerm=${encodeURIComponent(suggestion.term)}&type=${suggestion.type}&address=${encodeURIComponent(currentLocation)}`);
    setSearchVisible(false);
  };

  // Handle search submit from mobile search
  const handleSearchSubmit = (value) => {
    if (!value.trim()) return;
    
    setSearchTerm(value);
    const searchType = activeType === 'all' ? 'all' : activeType;
    const updatedHistory = saveSearchHistory(value, searchType);
    setSearchHistory(updatedHistory);

    navigate(`/search?searchTerm=${encodeURIComponent(value)}&type=${searchType}&address=${encodeURIComponent(currentLocation)}`);
    setSearchVisible(false);
  };

  // Handle search click for mobile
  const handleSearchClick = () => {
    setSearchVisible(true);
  };

  // Mark notifications as read
  const markAsRead = async (notificationId = null) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notificationId })
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Navigation menu items
  const mainMenuItems = [
    { icon: <FiHome className="w-5 h-5" />, label: 'Home', path: '/', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: <FiCompass className="w-5 h-5" />, label: 'Explore', path: '/explore', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { icon: <FiHeart className="w-5 h-5" />, label: 'Wishlist', path: '/wishlist', requiresAuth: true, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { icon: <FiMap className="w-5 h-5" />, label: 'Trips', path: '/trips', requiresAuth: true, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: <FiMessageCircle className="w-5 h-5" />, label: 'Messages', path: '/messages', requiresAuth: true, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { icon: <FiBell className="w-5 h-5" />, label: 'Notifications', path: '/notifications', requiresAuth: true, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { icon: <FiUser className="w-5 h-5" />, label: 'Profile', path: '/profile', requiresAuth: true, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  ];

  const hostMenuItems = currentUser ? [
    { icon: <FiPlusCircle className="w-5 h-5" />, label: 'Create Listing', path: `/${currentUser._id}/create-listing`, color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: <FiFileText className="w-5 h-5" />, label: 'My Listings', path: '/list', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  ] : [];

  const searchTypes = [
    { key: 'all', label: 'All', icon: '🔍' },
    { key: 'properties', label: 'Properties', icon: <FiHome className="w-4 h-4" /> },
    { key: 'services', label: 'Services', icon: <FiFileText className="w-4 h-4" /> },
    { key: 'helpers', label: 'Helpers', icon: <FiUser className="w-4 h-4" /> },
    { key: 'events', label: 'Events', icon: <FiClock className="w-4 h-4" /> }
  ];

  const SEARCH_TYPE_CONFIG = {
    properties: { icon: '🏠' },
    services: { icon: '🔧' },
    helpers: { icon: '👨‍💼' },
    events: { icon: '🎪' },
    all: { icon: '🔍' }
  };

  return (
    <>
      {/* Mobile Header - Visible only on small screens */}
      <header className="bg-gray-50 md:hidden">
        <div className="px-4 py-3">
          {searchVisible ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSearchVisible(false)}
                className="p-2"
              >
                <FiChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
              </button>
              <div className="flex-1 relative">
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search in ${currentLocation}...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                    <Link
            to="/"
            className="inline-flex items-center hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl font-bold inline-flex items-center">
              <span className="font-extrabold text-xl inline-flex items-center text-[#1877F2]">
                <span className="inline-flex items-center font-extrabold mr-[-8px]">l</span>
                <span className="relative w-11 h-11 inline-flex items-center justify-center mr-[-2px]">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full relative top-[1px] mr-[-8px] text-[#1877F2]"
                  >
                    <path
                      fill="currentColor"
                      d="M30,50 C30,30 50,30 50,50 C50,70 70,70 70,50 C70,30 50,30 50,50"
                      stroke="currentColor"
                      strokeWidth="9"
                    />
                    <circle cx="30" cy="50" r="8" fill="currentColor" />
                    <circle cx="70" cy="50" r="8" fill="currentColor" />
                  </svg>
                </span>
                <span className="inline-flex items-center mr-[-4px]">p</span>
              </span>

              <svg
                className="w-6 h-6 relative top-[1px] ml-[-1px] text-rose-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l5.2 5.2m0 0a8.5 8.5 0 1012 12 8.5 8.5 0 00-12-12z"
                />
              </svg>

              <span className="ml-[-1px] font-black text-xl text-rose-600">
                <strong className="font-extrabold">ut</strong>
              </span>
            </span>
          </Link>
              </div>
              <div className="flex items-center gap-3">
                {/* Create Listing Button - Only for logged in users */}
                {currentUser && (
                  <Link 
                    to={`/${currentUser._id}/create-listing`}
                    className="p-2"
                  >
                    <FiPlusCircle className="w-5 h-5 text-gray-600" />
                  </Link>
                )}
                <button 
                  onClick={handleSearchClick}
                  className="p-2"
                >
                  <FiSearch className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Header - Visible only on md screens and above */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4 justify-between items-center shadow-sm">
        {/* Left side: Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl font-bold inline-flex items-center">
              <span className="font-extrabold text-xl inline-flex items-center text-[#1877F2]">
                <span className="inline-flex items-center font-extrabold mr-[-8px]">l</span>
                <span className="relative w-11 h-11 inline-flex items-center justify-center mr-[-2px]">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full relative top-[1px] mr-[-8px] text-[#1877F2]"
                  >
                    <path
                      fill="currentColor"
                      d="M30,50 C30,30 50,30 50,50 C50,70 70,70 70,50 C70,30 50,30 50,50"
                      stroke="currentColor"
                      strokeWidth="9"
                    />
                    <circle cx="30" cy="50" r="8" fill="currentColor" />
                    <circle cx="70" cy="50" r="8" fill="currentColor" />
                  </svg>
                </span>
                <span className="inline-flex items-center mr-[-4px]">p</span>
              </span>

              <svg
                className="w-6 h-6 relative top-[1px] ml-[-1px] text-rose-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l5.2 5.2m0 0a8.5 8.5 0 1012 12 8.5 8.5 0 00-12-12z"
                />
              </svg>

              <span className="ml-[-1px] font-black text-xl text-rose-600">
                <strong className="font-extrabold">ut</strong>
              </span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8" ref={searchInputRef}>
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search properties, services, helpers, events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                className="w-full p-3 pl-12 rounded-full border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white shadow-sm"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </form>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                  <span className="text-sm font-medium text-gray-700">Suggestions</span>
                  {searchHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                    >
                      Clear history
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                    >
                      {suggestion.isHistory ? (
                        <FiClock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-lg">{SEARCH_TYPE_CONFIG[suggestion.type]?.icon || '🔍'}</span>
                      )}
                      <div className="flex-1">
                        <span className="text-gray-700">{suggestion.term}</span>
                        {suggestion.type !== 'all' && (
                          <div className="text-xs text-gray-400 capitalize">{suggestion.type}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Navigation Icons + Profile Dropdown */}
        <div className="flex items-center gap-6" ref={profileDropdownRef}>
          {/* Explore */}
          <Link
            to="/explore"
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              location.pathname === '/explore'
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
            title="Explore"
          >
            <FiCompass className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Explore</span>
          </Link>

          {/* Trips - Only for logged in users */}
          {currentUser && (
            <Link
              to="/trips"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/trips' 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
              title="Trips"
            >
              <FiMap className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">Trips</span>
            </Link>
          )}

          {/* Wishlist - Only for logged in users */}
          {currentUser && (
            <Link
              to="/wishlist"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/wishlist' 
                  ? 'text-rose-600 bg-rose-50' 
                  : 'text-gray-600 hover:text-rose-600 hover:bg-gray-50'
              }`}
              title="Wishlist"
            >
              <FiHeart className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">Wishlist</span>
            </Link>
          )}

          {/* Notifications - Only for logged in users */}
          {currentUser && (
            <Link
              to="/notifications"
              className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/notifications' 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-gray-600 hover:text-amber-600 hover:bg-gray-50'
              }`}
              title="Notifications"
              onClick={() => markAsRead()}
            >
              <FiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className="text-xs mt-1 font-medium">Notifications</span>
            </Link>
          )}

          {/* Become a Host Button - Only for logged in users */}
          {currentUser && (
            <Link
              to={`/${currentUser._id}/create-listing`}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all font-medium text-sm"
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>Become a Host</span>
            </Link>
          )}

          {/* Profile Dropdown Button */}
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Profile menu"
          >
            {currentUser ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {showProfileDropdown ? (
                  <FiChevronUp className="w-5 h-5 text-gray-700" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-700" />
                )}
              </>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute top-full right-6 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
              {currentUser ? (
                <>
                  {/* User Info */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                        {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 truncate">{currentUser.username}</p>
                        <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="p-2 border-b border-gray-100">
                    <Link
                      to="/profile"
                      onClick={() => {
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => {
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <FiSettings className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  </div>
                  
                  {/* Host Actions */}
                  {currentUser && hostMenuItems.length > 0 && (
                    <div className="p-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                        Host
                      </p>
                      {hostMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => {
                            setShowProfileDropdown(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <span className="text-gray-600">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="p-2 border-b border-gray-100">
                    <Link
                      to="/help"
                      onClick={() => {
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <FiHelpCircle className="w-5 h-5" />
                      <span>Help Center</span>
                    </Link>
                    
                    <Link
                      to="/language"
                      onClick={() => {
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <FiGlobe className="w-5 h-5" />
                      <span>Language</span>
                    </Link>
                  </div>
                  
                  {/* Sign Out Button */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        handleSignOut();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all font-medium"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                /* For non-logged in users */
                <div className="p-4">
                  <p className="text-gray-600 text-center mb-4">Welcome to loopOut</p>
                  
                  <button
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium mb-3"
                  >
                    <FiUser className="w-5 h-5" />
                    Sign In
                  </button>
                  
                  <button
                    onClick={handleSignUp}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Create Account
                  </button>
                  
                  {/* Quick Links for non-logged in */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to="/help"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
                    >
                      <FiHelpCircle className="w-4 h-4" />
                      Help Center
                    </Link>
                    <Link
                      to="/language"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
                    >
                      <FiGlobe className="w-4 h-4" />
                      Language
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}