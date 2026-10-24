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
  QueueListIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  HeartIcon as HeartIconSolid, 
  UserIcon as UserIconSolid,
  InboxIcon as InboxIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import { clearPersistedSessionToken, authenticatedFetch } from '../utils/authenticatedFetch';
import { Sparkles } from 'lucide-react';
import { canCreateListings, getCreationRoute } from '../utils/offeringPermissions';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { hideBottomNav } = useSelector((state) => state.frontend || {});
  
  const [showProfileDropup, setShowProfileDropup] = useState(false);
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);
  const navRef = useRef(null);

  useEffect(() => {
    if (hideBottomNav) {
      setShowProfileDropup(false);
    }
  }, [hideBottomNav]);
  
  const hiddenBottomNavRoutes = [
    '/wishlist',
    '/profile',
    '/dashboard',
    '/calendar',
    '/planner',
    '/settings',
    '/listings',
    '/create-listing',
    '/host-dashboard', 
    '/pro', 
    '/host-earnings', 
    '/host-tools', 
    '/for-business', 
    '/become', 
    '/login-required',
    '/lunch',
    '/food',
    '/notifications',
    '/my-orders',
    '/food-orders',
    '/my-loopout'
  ];
  const hiddenBottomNavPrefixes = [
    '/food',
    '/lunch',
    '/listings/',
    '/messages/',
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
    hiddenBottomNavPrefixes.some(prefix => location.pathname.startsWith(prefix)) ||
    // User-specific workspace routes: /:userId/create-listing and /:userId/listings.
    /^\/[^/]+\/(?:create-listing|listings)(?:\/|$)/.test(location.pathname);

  useEffect(() => {
    if (!currentUser?._id) {
      setUnreadInboxCount(0);
      return;
    }

    let isMounted = true;
    let failCount = 0;
    let timeoutId = null;
    let lastFetchAt = 0;

    const fetchUnreadCount = async () => {
      lastFetchAt = Date.now();
      try {
        const res = await authenticatedFetch('/api/messages/unread-count');
        if (!isMounted) return;
        if (res.ok) {
          failCount = 0;
          const data = await res.json();
          if (isMounted) {
            setUnreadInboxCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0);
          }
        } else if (res.status >= 500) {
          // Endpoint not yet live on deployed server — back off silently
          failCount = Math.min(failCount + 1, 10); // cap at 10 (~85 min interval)
        }
        // 4xx errors (auth issues etc.) — don't increment failCount, just skip
      } catch (_err) {
        // Network error – silently ignore
      }
    };

    const scheduleNext = () => {
      clearTimeout(timeoutId);
      // Base 15 s, doubles each failure: 15s → 30s → 60s → 120s → … → max 5 min
      const delay = Math.min(15000 * Math.pow(2, failCount), 5 * 60 * 1000);
      timeoutId = setTimeout(async () => {
        if (!isMounted) return;
        await fetchUnreadCount();
        if (isMounted) scheduleNext();
      }, delay);
    };

    // Initial fetch, then start the scheduled loop
    fetchUnreadCount().then(() => { if (isMounted) scheduleNext(); });

    // On window focus: only re-fetch if it has been >15 s since the last fetch
    // AND only if we're not already in a heavy back-off state (failCount < 5)
    const handleFocus = () => {
      if (!isMounted) return;
      const sinceLast = Date.now() - lastFetchAt;
      if (sinceLast >= 15000 && failCount < 5) {
        clearTimeout(timeoutId);
        fetchUnreadCount().then(() => { if (isMounted) scheduleNext(); });
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser?._id]);

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

  const isProvider = currentUser && canCreateListings(currentUser) && currentUser.offeringType !== 'viewer';

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, activeIcon: HomeIconSolid, route: '/' },
    { id: 'wishlist', label: 'Saved', icon: HeartIcon, activeIcon: HeartIconSolid, route: '/wishlist' },
    ...(isProvider
      ? [{ id: 'create', label: 'Create', icon: PlusCircleIcon, activeIcon: PlusCircleIcon, route: getCreationRoute(currentUser) }]
      : [{ id: 'become', label: 'Become', icon: Sparkles, activeIcon: Sparkles, route: '/become' }]),
    { 
      id: 'inbox', 
      label: 'Inbox', 
      icon: InboxIcon, 
      activeIcon: InboxIconSolid, 
      route: '/messages',
      badge: unreadInboxCount
    },
    { id: 'profile', label: 'Profile', icon: UserIcon, activeIcon: UserIconSolid, route: '/profile', isProfile: true }
  ];

  return (
    <motion.div
      ref={navRef}
      initial={false}
      animate={{
        y: hideBottomNav ? 120 : 0,
        opacity: hideBottomNav ? 0 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 26,
        stiffness: 240,
        mass: 0.8
      }}
      className={`app-safe-bottom bg-white dark:bg-gray-950 fixed bottom-0 left-0 right-0 z-[100] md:hidden ${
        hideBottomNav ? 'pointer-events-none' : ''
      }`}
    >
      {/* Profile Dropup Menu */}
      <AnimatePresence>
        {showProfileDropup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-16 right-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.12),0_10px_20px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-gray-800 p-4 z-[101] max-h-[80vh] overflow-y-auto scrollbar-hide"
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'LoopBot AI', route: '/loopbot', icon: <Sparkles className="w-5 h-5" />, color: 'bg-gradient-to-tr from-rose-500 to-amber-500' },
                    { label: 'Profile', route: '/profile', icon: <UserIcon className="w-5 h-5" />, color: 'bg-rose-500' },
                    { label: 'Dashboard', route: '/dashboard', icon: <Squares2X2Icon className="w-5 h-5" />, color: 'bg-indigo-500' },
                    { label: 'Calendar', route: '/calendar', icon: <CalendarIcon className="w-5 h-5" />, color: 'bg-gradient-to-tr from-purple-600 to-violet-500' },
                    { label: 'Listings', route: `/${currentUser._id}/listings`, icon: <QueueListIcon className="w-5 h-5" />, color: 'bg-blue-500' },
                    { label: 'Wishlist', route: '/wishlist', icon: <HeartIcon className="w-5 h-5" />, color: 'bg-pink-500' },
                    { label: 'Activity', route: '/my-loopout', icon: <CalendarIcon className="w-5 h-5" />, color: 'bg-gradient-to-tr from-rose-500 to-purple-500' },
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
                      className="flex flex-col items-center justify-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/60 active:scale-95 rounded-2xl border border-slate-100 dark:border-gray-800 transition-all min-h-[68px]"
                    >
                      <div className={`p-1.5 ${cmd.color} text-white rounded-lg shadow-sm`}>
                        {cmd.icon}
                      </div>
                      <span className="text-[8px] font-black text-gray-800 dark:text-gray-300 uppercase tracking-widest text-center leading-none">
                        {cmd.label}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    navigate('/become');
                    setShowProfileDropup(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-3 text-left transition active:scale-[0.98] dark:border-rose-900/40 dark:bg-rose-950/20"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-black text-slate-900 dark:text-white">Become a host or provider</span>
                    <span className="mt-0.5 block text-[10px] text-slate-600 dark:text-gray-400">Choose property, services, food, or goods</span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-rose-500" />
                </button>

                {/* Sign Out Button */}
                <div className="border-t border-slate-100 dark:border-gray-800 pt-3 mt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase text-slate-600 dark:text-gray-400 active:scale-95 bg-slate-50 dark:bg-gray-800/60 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 rounded-2xl border border-slate-100 dark:border-gray-800 transition-all tracking-[0.2em]"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-3">
                <p className="text-center font-black text-sm text-slate-800 dark:text-gray-200 uppercase tracking-wider mb-2">Welcome to loopOut</p>
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
                  className="w-full py-3.5 border-2 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* App-like Bottom Navigation Bar */}
      <div className="glass-bottom-nav px-4 py-1.5 pb-2 flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const isActive = item.isProfile 
            ? showProfileDropup
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
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              onClick={handleClick}
              aria-label={item.label || item.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 touch-target transition-opacity"
            >
              <div className={`p-1 rounded-xl relative transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
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
                  <Icon className={`w-7 h-7 ${isActive ? 'text-[#FF5A5F]' : 'text-gray-600 dark:text-gray-400'}`} />
                )}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-950 shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`max-w-full truncate text-[9px] font-black uppercase tracking-wide ${isActive ? 'text-[#FF5A5F]' : 'text-gray-600 dark:text-gray-400'}`}>
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
    </motion.div>
  );
};

export default BottomNav;
