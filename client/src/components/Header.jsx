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
          'Authorization': `Bearer ${currentUser.token}`
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

  // Mark notifications as read
  const markAsRead = async (notificationId = null) => {
    if (!currentUser) return;
    
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ notificationId })
      });
      
      if (res.ok) {
        // Update local state
        if (notificationId) {
          setNotifications(prev => prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          ));
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          // Mark all as read
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Set up WebSocket connection for real-time notifications
  useEffect(() => {
    if (!currentUser) return;

    // Fetch initial notifications
    fetchNotifications();

    // Set up WebSocket connection (simulated with setInterval for demo)
    const wsInterval = setInterval(() => {
      // Simulate receiving new notifications
      const shouldReceiveNotification = Math.random() > 0.8; // 20% chance
      if (shouldReceiveNotification) {
        const newNotification = {
          _id: Date.now().toString(),
          type: 'new_post',
          message: 'New listing available in your area!',
          data: {
            postId: '123',
            location: 'Your City',
            title: 'Amazing Beach House'
          },
          read: false,
          createdAt: new Date().toISOString()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(wsInterval);
  }, [currentUser]);

  // Function to handle user sign-out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      if (!res.ok) throw new Error('Sign out failed');
      dispatch(signOutUserSuccess());
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Function to perform a search and navigate to the results page
  const performSearch = (term, type = activeType) => {
    if (!term.trim()) return;

    // Create a new entry for the search history
    const newEntry = { term: term.trim(), type, timestamp: Date.now() };
    const updatedHistory = [
      newEntry,
      // Filter out any previous identical search to avoid duplicates
      ...searchHistory.filter(item =>
        !(item.term.toLowerCase() === term.trim().toLowerCase() && item.type === type)
      )
    ].slice(0, 10); // Keep only the 10 most recent searches

    setSearchHistory(updatedHistory);

    // Navigate to the search page with the query parameters
    navigate(`/search?searchTerm=${encodeURIComponent(term.trim())}&type=${type}`);
    setSearchTerm('');
    setShowMobileSearchBar(false);
    setShowSuggestions(false);
  };

  // Handler for submitting the search form
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  // Handler for clicking a search suggestion
  const handleSuggestionClick = (suggestion) => {
    performSearch(suggestion);
  };

  // Handler to clear the entire search history
  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  // Handler to clear the current search input
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(true);
  };

  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? '' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center hover:scale-105 transition-transform">
            <div className="flex justify-center">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold flex items-end">
                  <span className={`mr-[-2px] font-extrabold text-xl ${isScrolled
                    ? 'text-[#1877F2] bg-w'
                    : 'text-gray-900 dark:text-white'
                    }`}>
                    loop
                  </span>
                  <svg
                    className={`w-8 h-8 relative top-[1px] ${isScrolled
                      ? 'text-rose-600'
                      : 'text-rose-600 dark:text-rose-400'
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
                  <span className={`ml-[-1px] font-black text-xl ${isScrolled
                    ? 'text-rose-600'
                    : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    <strong className="font-extrabold">ut</strong>
                  </span>
                </span>
              </div>
            </div>
          </Link>

          {/* Central Search Bar (Desktop) */}
          <div className="hidden md:flex flex-grow justify-center px-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Where to?"
                className="w-full pl-5 pr-12 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors">
                <FiSearch className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Main Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon */}
            <button
              onClick={() => {
                setShowMobileSearchBar(true);
                setShowSuggestions(true);
              }}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Search"
            >
              <FiSearch className="w-6 h-6 text-gray-600 hover:text-rose-600" />
            </button>

            {/* "Become a Host" */}
            <Link
              to="/host"
              className="hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md"
            >
              <span>Become a Host</span>
            </Link>

            {/* Plan Trip Link */}
            <Link
              to="/plan-trip"
              className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              title="Plan a Trip"
            >
              <FiMap className="text-rose-600" />
              <span>Plan Trip</span>
            </Link>

            {/* AI Finder Link */}
            <Link
              to="/help-center"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              title="AI Help Center"
            >
              <FaBrain className="text-rose-600" />
              <span>Help Center</span>
            </Link>

            {/* Message Icon */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden md:block"
              title="Messages"
            >
              <FiMessageSquare className="w-5 h-5 text-gray-600 hover:text-rose-600" />
            </button>

            {/* Notification Icon with Badge */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotificationMenu(!notificationMenu);
                  if (!notificationMenu && unreadCount > 0) {
                    markAsRead(); // Mark all as read when opening
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                title="Notifications"
              >
                <FiBell className="w-5 h-5 text-gray-600 hover:text-rose-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown - Fixed for small screens */}
              {notificationMenu && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAsRead()}
                          className="text-sm text-rose-500 hover:text-rose-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2">
                    {isLoadingNotifications ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-3 rounded-lg mb-1 cursor-pointer transition-colors ${
                            notification.read 
                              ? 'bg-white hover:bg-gray-50' 
                              : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                          onClick={() => {
                            // Handle notification click based on type
                            if (notification.type === 'new_post' && notification.data?.postId) {
                              navigate(`/listing/${notification.data.postId}`);
                            }
                            if (!notification.read) {
                              markAsRead(notification._id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              notification.read ? 'bg-gray-100' : 'bg-rose-100'
                            }`}>
                              {notification.type === 'new_post' && (
                                <FiMap className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.message}
                              </p>
                              {notification.data?.title && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {notification.data.title}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <Link
                        to="/notifications"
                        className="block text-center text-sm text-rose-500 hover:text-rose-700 font-medium"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setDropdownMenu(!dropdownMenu)}
                className="flex items-center gap-2 p-1 rounded-full border border-gray-200 hover:shadow-md transition-all pl-3"
                aria-label="User menu"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>

                {currentUser && (
                  <img
                    key={currentUser.updatedAt || Date.now()}
                    className="w-8 h-8 rounded-full object-cover"
                    src={currentUser.avatar || 'https://via.placeholder.com/40'}
                    alt="Profile"
                  />
                )}

                {!currentUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">👤</span>
                  </div>
                )}
              </button>

              {/* Dropdown Menu Content - Fixed for small screens */}
              {dropdownMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {!currentUser ? (
                    <>
                      <div className="py-1">
                        <Link
                          to="/sign-in"
                          className="flex items-center px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">🔑</span>
                          Sign In
                        </Link>
                        <Link
                          to="/sign-up"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">✨</span>
                          Sign Up
                        </Link>
                      </div>
                      <div className="py-1">
                        <Link
                          to={`/${currentUser?._id}/create-listing`}
                          className="sm:hidden flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>Create listing</span>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">Welcome back</p>
                        <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">👤</span>
                          <span>Profile</span>
                        </Link>

                        <Link
                          to="/helper-home-page"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">👷</span>
                          <span>Helpers</span>
                        </Link>
                        <Link
                          to="/event-home-page"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">🎉</span>
                          <span>Events</span>
                        </Link>
                        <Link
                          to="/listing-home-page"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">🏡</span>
                          <span>Properties</span>
                        </Link>
                        <Link
                          to="/service-home-page"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">🛎️</span>
                          <span>Services</span>
                        </Link>
                      </div>

                      <div className="py-1 hidden md:block">
                        <Link
                          to={`/${currentUser?._id}/WishList`}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">❤️🔥</span>
                          <span>Wishlist</span>
                        </Link>
                        <Link
                          to="/trips"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">✈️</span>
                          <span>My Trips</span>
                        </Link>
                        <Link
                          to="/List"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">📋</span>
                          <span>My Listings</span>
                        </Link>
                        <Link
                          to={`/${currentUser?._id}/create-listing`}
                          className="flex items-center px-4 py-3 text-rose-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">✨</span>
                          <span>Create Listing</span>
                        </Link>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/users"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">👥</span>
                          <span>All Users</span>
                        </Link>
                        <Link
                          to="/help-center"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">🤖</span>
                          <span>AI Help Center</span>
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="mr-3 text-lg">🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Enhanced Mobile Search Bar */}
      {showMobileSearchBar && (
        <div
          className="absolute top-full left-0 w-full bg-white backdrop-blur-md shadow-lg md:hidden animate-fadeIn z-50"
          ref={mobileSearchRef}
        >
          <div className="p-4">
            {/* Search Input */}
            <div className="relative mb-3">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder={`Search ${activeType}...`}
                  className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  onFocus={() => setShowSuggestions(true)}
                />

                {/* Clear button */}
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={handleClearSearch}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}

                {/* Search button */}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Search Type Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-3 hide-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'listings', label: 'Listings' },
                { id: 'services', label: 'Services' },
                { id: 'helpers', label: 'Helpers' },
                { id: 'events', label: 'Events' }
              ].map((type) => (
                <button
                  key={type.id}
                  className={`flex-shrink-0 px-4 py-2 text-sm rounded-full whitespace-nowrap transition-all ${activeType === type.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  onClick={() => {
                    setActiveType(type.id);
                    setShowSuggestions(true);
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Suggestions Section */}
            {showSuggestions && (
              <div className="pt-2 border-t border-gray-100">
                {/* Search History */}
                {searchHistory.length > 0 && searchTerm === '' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <FiClock className="mr-2 text-gray-500" />
                        Recent Searches
                      </h3>
                      <button
                        onClick={handleClearHistory}
                        className="text-sm text-rose-500 hover:text-rose-700"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="space-y-2">
                      {searchHistory
                        .filter(item => activeType === 'all' || item.type === activeType)
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                            onClick={() => handleSuggestionClick(item.term)}
                          >
                            <div className="flex items-center">
                              <FiClock className="text-gray-400 mr-3 flex-shrink-0" />
                              <span className="font-medium">{item.term}</span>
                              <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">
                                {item.type}
                              </span>
                            </div>
                            <FiSearch className="text-gray-400 group-hover:text-rose-500" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}


                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {searchTerm ? 'Suggestions' : 'Popular Searches'}
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 hover:bg-rose-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-center">
                            <FiSearch className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="font-medium truncate">{suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}