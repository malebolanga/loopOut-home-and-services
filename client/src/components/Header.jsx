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
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white ">
        {/* Main Header Bar */}
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            
            {/* Left: Plus Button (Create) */}
            <div className="flex items-center">
              {currentUser && (
                <Link
                  to={`/${currentUser._id}/create-listing`}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Create listing"
                >
                  <FiPlusCircle className="w-6 h-6 text-gray-900" />
                </Link>
              )}
            </div>

            {/* Center: Logo */}
            <div className="flex items-center justify-center flex-1">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-red-400 tracking-tight">
                  <span className="font-black">loop</span>
                  <span className="font-bold text-blue-500">Out</span>
                </span>
              </Link>
            </div>

            {/* Right: Search and Profile */}
            <div className="flex items-center space-x-2" ref={profileDropdownRef}>
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5 text-gray-900" />
              </button>

           

              {/* Profile Menu */}
              <div className="relative">
              

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    {currentUser ? (
                      <>
                        {/* User Info */}
                      

                        {/* Menu Items */}
                        <div className="py-1">
                         
                       
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
                            to="/dashboard"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiSettings className="w-4 h-4 text-gray-600" />
                            <span>Settings</span>
                          </Link>
                        </div>

                        {/* Bottom Section */}
                        <div className="border-t border-gray-100 py-1">
                          <Link
                            to="/help"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm"
                          >
                            <FiHelpCircle className="w-4 h-4 text-gray-600" />
                            <span>Help</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-sm w-full text-left"
                          >
                            <FiLogOut className="w-4 h-4 text-gray-600" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4">
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                navigate('/sign-in');
                                setShowProfileDropdown(false);
                              }}
                              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-md"
                            >
                              Log In
                            </button>
                            <button
                              onClick={() => {
                                navigate('/sign-up');
                                setShowProfileDropdown(false);
                              }}
                              className="w-full py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md"
                            >
                              Sign Up
                            </button>
                          </div>
                        </div>
                      </>
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
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-900" />
              </button>
              <h2 className="font-semibold text-gray-900">Search</h2>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Search Content */}
          <div className="p-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search homes, services, helpers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </form>

            {/* Search Categories */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Browse Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {searchCategories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => {
                      navigate(`/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`);
                      setShowSearch(false);
                    }}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-2xl mb-2">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">Recent</h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-sm text-blue-600 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(`/search?searchTerm=${encodeURIComponent(item.term)}&type=${item.type}&address=${encodeURIComponent(currentLocation)}`);
                        setShowSearch(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FiSearch className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{item.term}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
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
            className={`flex flex-col items-center p-2 ${
              location.pathname === '/' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <div className="p-1">
              <FiHome className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/explore"
            className={`flex flex-col items-center p-2 ${
              location.pathname === '/explore' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <div className="p-1">
              <FiSearch className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">Explore</span>
          </Link>
          {currentUser && (
            <Link
              to={`/${currentUser._id}/create-listing`}
              className="flex flex-col items-center p-2"
            >
              <div className="p-1">
                <FiPlusCircle className="w-6 h-6 text-gray-500" />
              </div>
              <span className="text-xs mt-1 text-gray-500">Create</span>
            </Link>
          )}
          <Link
            to="/wishlist"
            className={`flex flex-col items-center p-2 ${
              location.pathname === '/wishlist' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <div className="p-1">
              <FiHeart className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">Saved</span>
          </Link>
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center p-2 text-gray-500 mobile-menu-button"
          >
            <div className="p-1">
              <FiMenu className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div ref={mobileMenuRef} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl">
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
                      to="/settings"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">Settings</span>
                      <FiSettings className="w-5 h-5 text-gray-400" />
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
      <div className="h-14"></div>
      <div className="lg:hidden h-16"></div>
    </>
  );
}