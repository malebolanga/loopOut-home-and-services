// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
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

// Import search utilities - Use correct path
import {
  getSearchUrl,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory as clearSearchHistoryUtil,
  generateSuggestions,
  SEARCH_TYPE_CONFIG
} from "../utils/searchUtils";

export default function Sidebar() {
  const { currentUser } = useSelector((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  
  const sidebarRef = useRef();
  const profileDropdownRef = useRef();
  const searchInputRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  // Close sidebar and dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close sidebar when clicking outside (mobile only)
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
      
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
  }, [isSidebarOpen]);

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    };
  }, [isSidebarOpen]);

  // Generate search suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const newSuggestions = generateSuggestions(searchTerm, activeType, searchHistory);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  }, [searchTerm, activeType, searchHistory]);

  // Fetch notifications
  const fetchNotifications = async () => {
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
  };

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
      setIsSidebarOpen(false);
      setShowProfileDropdown(false);
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Handle sign in
  const handleSignIn = () => {
    navigate('/sign-in');
    setShowProfileDropdown(false);
    setIsSidebarOpen(false);
  };

  // Handle sign up
  const handleSignUp = () => {
    navigate('/sign-up');
    setShowProfileDropdown(false);
    setIsSidebarOpen(false);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const searchType = activeType === 'all' ? 'properties' : activeType;
    const updatedHistory = saveSearchHistory(searchTerm, searchType, {
      address: searchTerm,
      name: searchTerm
    });
    setSearchHistory(updatedHistory);

    const searchUrl = getSearchUrl({
      searchTerm,
      searchType,
      address: searchTerm,
      name: searchTerm
    });

    navigate(searchUrl);
    setShowSuggestions(false);
    setIsSidebarOpen(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.term);
    setShowSuggestions(false);
    
    const searchType = suggestion.type;
    const updatedHistory = saveSearchHistory(suggestion.term, searchType, {
      address: suggestion.term,
      name: suggestion.term
    });
    setSearchHistory(updatedHistory);

    const searchUrl = getSearchUrl({
      searchTerm: suggestion.term,
      searchType,
      address: suggestion.term,
      name: suggestion.term
    });

    navigate(searchUrl);
    setIsSidebarOpen(false);
  };

  // Clear search history
  const clearSearchHistory = () => {
    const clearedHistory = clearSearchHistoryUtil();
    setSearchHistory(clearedHistory);
    setSuggestions([]);
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

  // Navigation menu items with enhanced icons and spacing
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

  return (
    <>
      {/* Desktop Header - Visible only on md screens and above */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4 justify-between items-center">
        {/* Left side: Logo only */}
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
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                        <span className="text-lg">{SEARCH_TYPE_CONFIG[suggestion.type]?.icon}</span>
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
          {/* Explore - For all users */}
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

          {/* Messages - Only for logged in users */}
          {currentUser && (
            <Link
              to="/messages"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/messages' 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
              title="Messages"
            >
              <FiMessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">Messages</span>
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

      {/* Mobile Menu Button - Only on mobile */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow md:hidden"
        aria-label="Open menu"
      >
        <FiMenu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Profile Picture on Top Right - Only on mobile */}
      <div className="fixed top-4 right-4 z-50 md:hidden" ref={profileDropdownRef}>
        <button
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="flex items-center gap-2 p-2 rounded-full"
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

        {/* Mobile Profile Dropdown Menu */}
        {showProfileDropdown && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
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
                      setIsSidebarOpen(false);
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
                      setIsSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <FiSettings className="w-5 h-5" />
                    <span>Dashboard</span>
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Overlay - Mobile Only */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Hidden on large screens, only for mobile */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-full bg-white z-50 transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Close Button (Mobile Only) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-10"
          aria-label="Close menu"
        >
          <FiX className="w-6 h-6 text-gray-700" />
        </button>

        {/* Logo Section */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <Link
            to="/"
            className="inline-flex items-center hover:opacity-90 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
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

        {/* Search Section - Mobile Only */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200" ref={searchInputRef}>
          <div className="space-y-3">
            {/* Search Types */}
            <div className="flex gap-1 overflow-x-auto pb-2 hide-scrollbar">
              {searchTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveType(type.key)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeType === type.key
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder={`Search ${activeType === 'all' ? 'everything' : activeType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white shadow-sm"
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              
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
                          <span className="text-lg">{SEARCH_TYPE_CONFIG[suggestion.type]?.icon}</span>
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
            </form>
          </div>
        </div>

        {/* Main Navigation - Mobile Only */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Main Menu */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
                Main Navigation
              </h3>
              <div className="space-y-2">
                {mainMenuItems.map((item) => {
                  if (item.requiresAuth && !currentUser) return null;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                        isActive
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg ${isActive ? 'bg-white/80' : 'bg-gray-100'}`}>
                        <span className={isActive ? item.color : 'text-gray-600'}>{item.icon}</span>
                      </div>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.label === 'Notifications' && unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center min-w-[24px]">
                          {unreadCount}
                        </span>
                      )}
                      {isActive && (
                        <div className="w-1.5 h-6 bg-current rounded-full ml-2"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Host Section */}
            {currentUser && hostMenuItems.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
                  Host Dashboard
                </h3>
                <div className="space-y-2">
                  {hostMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                          isActive
                            ? `${item.bgColor} ${item.color} shadow-sm`
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg ${isActive ? 'bg-white/80' : 'bg-gray-100'}`}>
                          <span className={isActive ? item.color : 'text-gray-600'}>{item.icon}</span>
                        </div>
                        <span className="font-medium flex-1">{item.label}</span>
                        {isActive && (
                          <div className="w-1.5 h-6 bg-current rounded-full ml-2"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/help"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 text-center border border-gray-200"
                >
                  <FiHelpCircle className="w-5 h-5 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Help</span>
                </Link>
                <Link
                  to="/language"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 text-center border border-gray-200"
                >
                  <FiGlobe className="w-5 h-5 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Language</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200">
          {currentUser ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700">{currentUser.username}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleSignIn}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Sign in
              </button>
              <button
                onClick={handleSignUp}
                className="block w-full text-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for hide scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}