import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HomeIcon, 
  HeartIcon, 
  PlusCircleIcon,
  MapIcon,
  Squares2X2Icon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  InboxIcon,
  ChevronRightIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  HeartIcon as HeartIconSolid, 
  PlusCircleIcon as PlusCircleIconSolid,
  MapIcon as MapIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  UserIcon as UserIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import { clearPersistedSessionToken } from '../utils/authenticatedFetch';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  
  const [showProfileDropup, setShowProfileDropup] = useState(false);
  const navRef = useRef(null);
  
  const hiddenBottomNavRoutes = [
    '/host-dashboard', 
    '/pro', 
    '/host-earnings', 
    '/host-tools', 
    '/for-business', 
    '/become', 
    '/login-required',
    '/lunch'
  ];
  const hiddenBottomNavPrefixes = [
    '/user/', 
    '/user-profile/', 
    '/listing/', 
    '/rent/', 
    '/helper/', 
    '/service/', 
    '/event/', 
    '/carwash/',
    '/photography/',
    '/beauty/',
    '/barber/',
    '/tattoo/',
    '/chef/',
    '/privatetutor/',
    '/sneaker/',
    '/washingmat/',
    '/animals/',
    '/sell-item/'
  ];
  
  const isBottomNavHidden = 
    hiddenBottomNavRoutes.includes(location.pathname) || 
    hiddenBottomNavPrefixes.some(prefix => location.pathname.startsWith(prefix));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShowProfileDropup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      fetch('/api/auth/signout', { credentials: 'include' }).catch(() => {});
      clearPersistedSessionToken();
      dispatch(signOutUserSuccess());
      navigate('/sign-in');
      setShowProfileDropup(false);
    } catch (error) {
      clearPersistedSessionToken();
      dispatch(signOutUserSuccess());
      navigate('/sign-in');
    }
  };

  if (isBottomNavHidden) return null;

  const navItems = [
    { id: 'home', label: '', icon: HomeIcon, activeIcon: HomeIconSolid, route: '/' },
    { id: 'wishlist', label: '', icon: HeartIcon, activeIcon: HeartIconSolid, route: '/wishlist' },
    { id: 'create', label: '', icon: PlusCircleIcon, activeIcon: PlusCircleIconSolid, route: currentUser ? `/${currentUser._id}/create-listing` : '/sign-in' },
    { id: 'dashboard', label: '', icon: Squares2X2Icon, activeIcon: Squares2X2IconSolid, route: '/dashboard' },
    { id: 'profile', label: '', icon: UserIcon, activeIcon: UserIconSolid, route: '/profile', isProfile: true }
  ];

  return (
    <div ref={navRef} className="app-safe-bottom bg-white fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      {/* Profile Dropup Menu */}
      <AnimatePresence>
        {showProfileDropup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-16 right-4 left-4 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.12),0_10px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-4 z-[101] max-h-[80vh] overflow-y-auto scrollbar-hide"
          >
            {currentUser ? (
              <div className="flex flex-col gap-3">
                {/* User Header */}
                <div 
                  className="p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-[1.8rem] flex items-center cursor-pointer shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => {
                    navigate('/profile');
                    setShowProfileDropup(false);
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={currentUser.avatar} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#FF5A5F] p-0.5"
                      alt="Profile"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-white truncate">{currentUser.username}</p>
                      <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    </div>
                    <span className="text-[8px] text-[#FF5A5F] font-bold uppercase tracking-[0.2em]">ELITE USER</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </div>

                {/* Grid of master commands (compact version) */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Profile', route: '/profile', icon: <UserIcon className="w-5 h-5" />, color: 'bg-rose-500' },
                    { label: 'Dashboard', route: '/dashboard', icon: <Squares2X2Icon className="w-5 h-5" />, color: 'bg-indigo-500' },
                    { label: 'Create', route: `/${currentUser._id}/create-listing`, icon: <PlusCircleIcon className="w-5 h-5" />, color: 'bg-emerald-500' },
                    { label: 'Listings', route: `/${currentUser._id}/listings`, icon: <QueueListIcon className="w-5 h-5" />, color: 'bg-blue-500' },
                    { label: 'Wishlist', route: '/wishlist', icon: <HeartIcon className="w-5 h-5" />, color: 'bg-pink-500' },
                    { label: 'Inbox', route: '/messages', icon: <InboxIcon className="w-5 h-5" />, color: 'bg-cyan-500' },
                    { label: 'Planner', route: '/planner', icon: <MapIcon className="w-5 h-5" />, color: 'bg-orange-500' },
                    { label: 'Settings', route: '/settings', icon: <Cog6ToothIcon className="w-5 h-5" />, color: 'bg-gray-600' }
                  ].map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => {
                        navigate(cmd.route);
                        setShowProfileDropup(false);
                      }}
                      className="flex flex-col items-center justify-center gap-1 p-2 bg-gray-50 active:scale-95 rounded-2xl border border-slate-100 transition-all min-h-[68px]"
                    >
                      <div className={`p-1.5 ${cmd.color} text-white rounded-lg shadow-sm`}>
                        {cmd.icon}
                      </div>
                      <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest text-center leading-none">
                        {cmd.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sign Out Button */}
                <div className="border-t border-slate-100 pt-3 mt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase text-slate-600 active:scale-95 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-2xl border border-slate-100 transition-all tracking-[0.2em]"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-3">
                <p className="text-center font-black text-sm text-slate-800 uppercase tracking-wider mb-2">Welcome to loopOut</p>
                <button
                  onClick={() => {
                    navigate('/sign-in');
                    setShowProfileDropup(false);
                  }}
                  className="w-full py-3.5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/sign-up');
                    setShowProfileDropup(false);
                  }}
                  className="w-full py-3.5 border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* App-like Bottom Navigation Bar */}
      <div className="glass-bottom-nav px-6 py-1.5 pb-2 flex items-center justify-between ">
        {navItems.map((item) => {
          const isActive = item.isProfile 
            ? showProfileDropup
            : item.id === 'create'
              ? location.pathname.endsWith('/create-listing')
              : location.pathname === item.route;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          const handleClick = () => {
            if (item.isProfile) {
              setShowProfileDropup(!showProfileDropup);
            } else {
              setShowProfileDropup(false);
              navigate(item.route);
            }
          };

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.8 }}
              animate={{ opacity: item.id === 'dashboard' && !isActive ? 0.4 : 1 }}
              transition={{ duration: 0.25 }}
              onClick={handleClick}
              aria-label={item.label || item.id}
              className="flex flex-col items-center gap-1 touch-target transition-opacity"
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.isProfile && currentUser ? (
                  <img
                    src={currentUser.avatar}
                    alt="profile"
                    className={`w-7 h-7 rounded-full object-cover border-[1.5px] ${isActive ? 'border-[#FF5A5F]' : 'border-gray-400'} shadow-sm`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                    }}
                  />
                ) : (
                  <Icon className={`w-7 h-7 ${isActive ? 'text-[#FF5A5F]' : 'text-gray-600'}`} />
                )}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#FF5A5F]' : 'text-gray-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottomNavDot"
                  className="w-1 h-1 bg-[#FF5A5F] rounded-full mt-0.5" 
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
