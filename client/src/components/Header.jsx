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
  FiChevronLeft
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
  
  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const headerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }

      // Close search if clicking outside search area
      if (showSearch && !e.target.closest('.search-container')) {
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
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const updatedHistory = [{ term: searchTerm, type: 'all', timestamp: new Date().toISOString() }, ...searchHistory.slice(0, 9)];
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);

    navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&type=all&address=${encodeURIComponent(currentLocation)}`);
    setShowSearch(false);
    setSearchTerm('');
  };

  // Search categories
  const searchCategories = [
    { key: 'properties', label: 'Homes', icon: '🏠' },
    { key: 'services', label: 'Services', icon: '🔧' },
    { key: 'helpers', label: 'Helpers', icon: '👨‍💼' },
    { key: 'events', label: 'Events', icon: '🎪' }
  ];

  return (
    <>
      {/* Instagram-style Header */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        {/* Main Header Bar - Enhanced for large screens */}
        <div className="px-4 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex justify-between items-center h-14 lg:h-16">
            
            {/* Left: Logo for desktop, Plus for mobile */}
            <div className="flex items-center">
              {/* Logo for large screens */}
              <Link to="/" className="hidden lg:flex items-center">
                <span className="text-2xl xl:text-3xl font-bold text-red-400 tracking-tight">
                  <span className="font-black">loop</span>
                  <span className="font-bold text-blue-500">Out</span>
                </span>
              </Link>
              
              {/* Plus button - only show on mobile */}
              {currentUser && (
                <div className="lg:hidden">
                  <Link
                    to={`/${currentUser._id}/create-listing`}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Create listing"
                  >
                    <FiPlusCircle className="w-6 h-6 text-gray-900" />
                  </Link>
                </div>
              )}
            </div>

            {/* Center: Logo for mobile, Search for desktop */}
            <div className="flex items-center justify-center flex-1 lg:justify-start lg:flex-1">
              {/* Mobile logo */}
              <Link to="/" className="lg:hidden flex items-center">
                <span className="text-xl font-bold text-red-400 tracking-tight">
                  <span className="font-black">loop</span>
                  <span className="font-bold text-blue-500">Out</span>
                </span>
              </Link>
              
              {/* Desktop search bar - Removed as per requirement */}
            </div>

            {/* Right: Desktop navigation and profile */}
            <div className="flex items-center space-x-2 lg:space-x-4" ref={profileDropdownRef}>
              {/* Desktop navigation links (hidden on mobile) */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/explore"
                  className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
                    location.pathname === '/explore' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Explore
                </Link>
                <Link
                  to="/wishlist"
                  className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
                    location.pathname === '/wishlist' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Saved
                </Link>
                {currentUser && (
                  <>
                    <Link
                      to="/trips"
                      className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
                        location.pathname === '/trips' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Trips
                    </Link>
                    <Link
                      to="/messages"
                      className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
                        location.pathname === '/messages' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Messages
                    </Link>
                  </>
                )}
                
                {/* Become a Host button - only show on desktop */}
                <Link
                 to={`/${currentUser._id}/create-listing`}
                  className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Become a Host
                </Link>
              </div>

              {/* Mobile search button */}
              <button
                onClick={() => setShowSearch(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5 text-gray-900" />
              </button>

              {/* Desktop notifications */}
              {currentUser && (
                <div className="hidden lg:block relative">
                  <Link
                    to="/notifications"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                    aria-label="Notifications"
                  >
                    <FiBell className="w-5 h-5 text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Profile avatar */}
              <div className="relative hidden lg:block">
                {currentUser ? (
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {currentUser.username?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-sm font-medium text-gray-700">
                      {currentUser.username}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiUser className="w-5 h-5 text-gray-700" />
                    <span className="hidden lg:inline text-sm font-medium text-gray-700">
                      Account
                    </span>
                  </button>
                )}

                {/* Desktop Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 lg:w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    {currentUser ? (
                      <>
                        {/* User Info */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-medium text-lg">
                                {currentUser.username?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{currentUser.username}</p>
                              <p className="text-sm text-gray-500">{currentUser.email}</p>
                            </div>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setShowProfileDropdown(false)}
                            className="mt-3 block text-center py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            View Profile
                          </Link>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiHome className="w-4 h-4 text-gray-600" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/trips"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiBriefcase className="w-4 h-4 text-gray-600" />
                            <span>Trips</span>
                          </Link>
                          <Link
                            to="/messages"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiMessageCircle className="w-4 h-4 text-gray-600" />
                            <span>Messages</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiHeart className="w-4 h-4 text-gray-600" />
                            <span>Saved</span>
                          </Link>
                          <Link
                            to={`/${currentUser._id}/create-listing`}
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiPlusCircle className="w-4 h-4 text-gray-600" />
                            <span>Become a Host</span>
                          </Link>
                        </div>

                        {/* Bottom Section */}
                        <div className="border-t border-gray-100 py-2">
                          <Link
                            to="/settings"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiSettings className="w-4 h-4 text-gray-600" />
                            <span>Settings</span>
                          </Link>
                          <Link
                            to="/help"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiHelpCircle className="w-4 h-4 text-gray-600" />
                            <span>Help Center</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm w-full text-left text-red-600"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4">
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              navigate('/sign-in');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                          >
                            Log In
                          </button>
                          <button
                            onClick={() => {
                              navigate('/sign-up');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400"
                          >
                            Sign Up
                          </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">List your property or service</p>
                          <Link
                            to={`/${currentUser._id}/create-listing`}
                            onClick={() => setShowProfileDropdown(false)}
                            className="block text-center py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            Become a Host
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Overlay - Instagram Style */}
        <div className={`search-container fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
          showSearch ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Search Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 lg:px-8 h-14 lg:h-16">
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-900" />
              </button>
              <h2 className="font-semibold text-gray-900 lg:text-lg">Search</h2>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Search Content */}
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="mb-6 lg:mb-8">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search homes, services, helpers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 lg:pl-14 pr-4 py-3 lg:py-4 bg-gray-100 rounded-xl lg:rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-base lg:text-lg"
                />
              </div>
            </form>

            {/* Search Categories */}
            <div className="mb-8 lg:mb-12">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 lg:text-lg">Browse Categories</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {searchCategories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => {
                      navigate(`/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`);
                      setShowSearch(false);
                    }}
                    className="flex flex-col items-center p-4 lg:p-6 bg-gray-50 rounded-xl lg:rounded-2xl hover:bg-gray-100 active:scale-95 transition-all duration-200"
                  >
                    <span className="text-2xl lg:text-3xl mb-2 lg:mb-3">{category.icon}</span>
                    <span className="font-medium text-gray-900 lg:text-lg">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                  <h3 className="font-semibold text-gray-900 lg:text-lg">Recent Searches</h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-sm lg:text-base text-blue-600 font-medium hover:text-blue-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2 lg:space-y-3">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(`/search?searchTerm=${encodeURIComponent(item.term)}&type=${item.type}&address=${encodeURIComponent(currentLocation)}`);
                        setShowSearch(false);
                      }}
                      className="w-full flex items-center justify-between p-3 lg:p-4 hover:bg-gray-50 rounded-lg lg:rounded-xl transition-colors"
                    >
                      <div className="flex items-center space-x-3 lg:space-x-4">
                        <FiSearch className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                        <span className="text-gray-900 lg:text-base">{item.term}</span>
                      </div>
                      <span className="text-xs lg:text-sm text-gray-500 capitalize px-2 py-1 lg:px-3 lg:py-1.5 bg-gray-100 rounded">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-2 px-4">
          <Link
            to="/"
            className={`flex flex-col items-center p-2 ${location.pathname === '/' ? 'text-black' : 'text-gray-500'}`}
          >
            <div className="p-1">
              <FiHome className="w-6 h-6" />
            </div>
          
          </Link>
          <Link
            to="/explore"
            className={`flex flex-col items-center p-2 ${location.pathname === '/explore' ? 'text-black' : 'text-gray-500'}`}
          >
            <div className="p-1">
              <FiMap className="w-6 h-6" />
            </div>
          
          </Link>
          {currentUser && (
            <Link
              to={`/${currentUser._id}/create-listing`}
              className="flex flex-col items-center p-2"
            >
              <div className="p-1">
                <FiPlusCircle className="w-6 h-6 text-gray-500" />
              </div>
          
            </Link>
          )}
          <Link
            to="/wishlist"
            className={`flex flex-col items-center p-2 ${location.pathname === '/wishlist' ? 'text-black' : 'text-gray-500'}`}
          >
            <div className="p-1">
              <FiHeart className="w-6 h-6" />
            </div>

          </Link>
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center p-2 text-gray-500 mobile-menu-button"
          >
            <div className="p-1">
              <FiMenu className="w-6 h-6" />
            </div>
         
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div ref={mobileMenuRef} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              {/* Menu Header */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* User Info */}
              {currentUser && (
                <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {currentUser.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{currentUser.username}</p>
                    <p className="text-sm text-gray-500">View profile</p>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {!currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/sign-in');
                        setShowMobileMenu(false);
                      }}
                      className="w-full p-4 text-center bg-black text-white font-medium rounded-lg mb-2"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        navigate('/sign-up');
                        setShowMobileMenu(false);
                      }}
                      className="w-full p-4 text-center border border-gray-300 text-gray-700 font-medium rounded-lg"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Profile</span>
                      <FiUser className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link
                      to="/trips"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Trips</span>
                      <FiBriefcase className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Messages</span>
                      <FiMessageCircle className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Notifications</span>
                      <FiBell className="w-5 h-5 text-gray-400" />
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to={`/${currentUser._id}/create-listing`}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Become a Host</span>
                      <FiPlusCircle className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Help</span>
                      <FiHelpCircle className="w-5 h-5 text-gray-400" />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full p-4 text-center text-red-600 font-medium border-t border-gray-200 mt-4"
                    >
                      Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-14 lg:h-16"></div>
      <div className="lg:hidden h-16"></div>
    </>
  );
}