import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Navbar.scss";
import "../styles/breakpoints.scss";

import {
  FiSearch,
  FiMessageSquare,
  FiBell,
  FiMap,
  FiClock,
  FiX
} from "react-icons/fi";
import { FaBrain } from "react-icons/fa";

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [notificationMenu, setNotificationMenu] = useState(false);
  const menuRef = useRef();
  const notificationRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const mobileSearchRef = useRef();

  // New states for enhanced search
  const [activeType, setActiveType] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Effect to handle page scroll and change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to handle clicks outside of the dropdown menu and mobile search bar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationMenu(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target) && showMobileSearchBar) {
        setShowMobileSearchBar(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSearchBar]);

  // Effect to save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Effect to generate search suggestions based on user input
  useEffect(() => {
    if (!searchTerm.trim() || !showMobileSearchBar) {
      setSuggestions([]);
      return;
    }

    // Filter search history by the active type and search term
    const typeFiltered = searchHistory.filter(
      item => (activeType === 'all' || item.type === activeType)
    );

    // Get suggestions that match the current search term from history
    const matched = typeFiltered
      .filter(item =>
        item.term.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);

    // Define generic suggestions for different categories
    const genericSuggestions = [];
    const types = {
      listings: ['Beach house', 'Mountain cabin', 'Downtown loft', 'Luxury villa', 'Cozy apartment'],
      services: ['Cleaning service', 'Plumbing', 'Electrician', 'Catering', 'Landscaping'],
      helpers: ['Moving help', 'Event staff', 'Personal assistant', 'Tutor', 'Handyman'],
      events: ['Music festival', 'Tech conference', 'Food fair', 'Art exhibition', 'Charity gala']
    };

    // Populate generic suggestions based on the active search type
    if (activeType === 'all' || activeType === 'listings') {
      genericSuggestions.push(...types.listings);
    }
    if (activeType === 'all' || activeType === 'services') {
      genericSuggestions.push(...types.services);
    }
    if (activeType === 'all' || activeType === 'helpers') {
      genericSuggestions.push(...types.helpers);
    }
    if (activeType === 'all' || activeType === 'events') {
      genericSuggestions.push(...types.events);
    }

    // Combine matched history and generic suggestions,
    // remove duplicates with Set, and take the first 8 results.
    const allSuggestions = [...new Set([
      ...matched.map(item => item.term),
      ...genericSuggestions.filter(term =>
        term.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ])].slice(0, 8);

    setSuggestions(allSuggestions);
    setShowSuggestions(allSuggestions.length > 0);
  }, [searchTerm, activeType, searchHistory, showMobileSearchBar]);

  // Fetch notifications from the server
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
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Add to search history
    const newSearch = {
      term: searchTerm,
      type: activeType,
      timestamp: new Date().toISOString()
    };

    setSearchHistory(prev => {
      const filtered = prev.filter(item => 
        !(item.term === searchTerm && item.type === activeType)
      );
      return [newSearch, ...filtered].slice(0, 10);
    });

    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(searchTerm)}&type=${activeType}`);
    setShowMobileSearchBar(false);
    setShowSuggestions(false);
  };

  // Handle clicking on a search suggestion
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    
    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(suggestion)}&type=${activeType}`);
    setShowMobileSearchBar(false);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Toggle notification menu and fetch notifications when opened
  const toggleNotificationMenu = () => {
    if (!notificationMenu) {
      fetchNotifications();
    }
    setNotificationMenu(!notificationMenu);
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
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
    }
    setNotificationMenu(false);
  };

  // Search type options
  const searchTypes = [
    { key: 'all', label: 'All', icon: '🔍' },
    { key: 'listings', label: 'Listings', icon: '🏠' },
    { key: 'services', label: 'Services', icon: '🛠️' },
    { key: 'helpers', label: 'Helpers', icon: '👥' },
    { key: 'events', label: 'Events', icon: '🎪' }
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg  border-gray-200' 
        : 'bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-lg'
    }`}>
      {/* Mobile Search Overlay */}
      {showMobileSearchBar && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div ref={mobileSearchRef} className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setShowMobileSearchBar(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold">Search</h3>
              <div className="w-9"></div> {/* Spacer for balance */}
            </div>

            {/* Search Types */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {searchTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveType(type.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeType === type.key
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder={`Search ${searchTypes.find(t => t.key === activeType)?.label?.toLowerCase() || 'everything'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 rounded-2xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white shadow-sm"
                autoFocus
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </form>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-4">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Suggestions</span>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                    >
                      Clear history
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                    >
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {searchHistory.length > 0 && !showSuggestions && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Recent searches</span>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item.term)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                    >
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-gray-700">{item.term}</div>
                        <div className="text-xs text-gray-400 capitalize">{item.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/plan-trip')}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-700 hover:shadow-md transition-all text-left"
                >
                  <FiMap className="w-5 h-5 mb-2" />
                  <div className="text-sm font-medium">Plan Trip</div>
                </button>
                <button 
                  onClick={() => navigate('/ai-assistant')}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 text-purple-700 hover:shadow-md transition-all text-left"
                >
                  <FaBrain className="w-5 h-5 mb-2" />
                  <div className="text-sm font-medium">AI Assistant</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
        <Link 
  to="/" 
  className="inline-flex items-center hover:scale-105 transition-transform"
>
  <span className="text-2xl font-bold inline-flex items-center">
    {/* l + logo + p */}
    <span
      className={`font-extrabold text-xl inline-flex items-center  ${
        isScrolled
          ? "text-[#1877F2] bg-w"
          : "text-gray-900 dark:text-white"
      }`}
    >
      <span className="inline-flex items-center font-extrabold mr-[-8px]">l</span>
      <span className="relative w-11 h-11 inline-flex items-center justify-center mr-[-2px]">
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full relative top-[1px] mr-[-8px] ${
            isScrolled ? "text-[#1877F2]" : "text-[#1877F2]"
          }`}
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

    {/* Magnifier icon */}
    <svg
      className={`w-6 h-6 relative top-[1px] ml-[-1px] ${
        isScrolled ? "text-rose-600" : "text-rose-600 dark:text-rose-400"
      }`}
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

    {/* ut */}
    <span
      className={`ml-[-1px] font-black text-xl ${
        isScrolled ? "text-rose-600" : "text-rose-600 dark:text-rose-400"
      }`}
    >
      <strong className="font-extrabold">ut</strong>
    </span>
  </span>
</Link>

          {/* Desktop Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              {/* Search Types */}
              <div className="flex gap-1 mb-2">
                {searchTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setActiveType(type.key)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeType === type.key
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xs">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={`Search ${searchTypes.find(t => t.key === activeType)?.label?.toLowerCase() || 'everything'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full p-3 pl-12 rounded-2xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="max-h-80 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <button 
              onClick={() => setShowMobileSearchBar(true)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiSearch className="w-5 h-5 text-gray-600" />
            </button>

            {/* Create Listing Button - Hidden on mobile (shown in footer) */}
            <Link
              to={currentUser ? `/${currentUser._id}/create-listing` : "/login-required"}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all font-medium"
            >
              <span>Create</span>
            </Link>

            {/* Messages */}
            <Link
              to={currentUser ? "/messages" : "/login-required"}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <FiMessageSquare className="w-5 h-5 text-gray-600" />
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotificationMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <FiBell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAsRead()}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'message' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'booking' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.type === 'message' && <FiMessageSquare className="w-4 h-4" />}
                              {notification.type === 'booking' && <FiMap className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setDropdownMenu(!dropdownMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {currentUser ? currentUser.username?.charAt(0)?.toUpperCase() : 'U'}
                </div>
              </button>

              {dropdownMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  {currentUser ? (
                    <>
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{currentUser.username}</p>
                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          Wishlist
                        </Link>
                        <Link
                          to="/trips"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          My Trips
                        </Link>
                        <Link
                          to="/listings"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          My Listings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2">
                      <Link
                        to="/sign-in"
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/sign-up"
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}