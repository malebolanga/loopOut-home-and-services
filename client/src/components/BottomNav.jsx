import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HomeIcon, 
  HeartIcon, 
  PlusCircleIcon,
  MapIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  HeartIcon as HeartIconSolid, 
  PlusCircleIcon as PlusCircleIconSolid,
  MapIcon as MapIconSolid,
  Squares2X2Icon as Squares2X2IconSolid
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  
  const hiddenBottomNavRoutes = [
    '/host-dashboard', 
    '/pro', 
    '/host-earnings', 
    '/host-tools', 
    '/for-business', 
    '/become', 
    '/login-required'
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

  if (isBottomNavHidden) return null;

  const navItems = [
    { id: 'home', label: '', icon: HomeIcon, activeIcon: HomeIconSolid, route: '/' },
    { id: 'wishlist', label: '', icon: HeartIcon, activeIcon: HeartIconSolid, route: '/wishlist' },
    { id: 'create', label: '', icon: PlusCircleIcon, activeIcon: PlusCircleIconSolid, route: currentUser ? `/${currentUser._id}/create-listing` : '/sign-in' },
    { id: 'planner', label: '', icon: MapIcon, activeIcon: MapIconSolid, route: '/planner' },
    { id: 'dashboard', label: '', icon: Squares2X2Icon, activeIcon: Squares2X2IconSolid, route: '/dashboard' },
  ];

  return (
    <div className="bg-white fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      {/* App-like Bottom Navigation Bar */}
      <div className="glass-bottom-nav px-6 py-1.5 pb-2 flex items-center justify-between ">
        {navItems.map((item) => {
          const isActive = item.id === 'create'
            ? location.pathname.endsWith('/create-listing')
            : location.pathname === item.route;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.8 }}
              onClick={() => navigate(item.route)}
              aria-label={item.label}
              className="flex flex-col items-center gap-1 touch-target"
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF5A5F]' : 'text-gray-600'}`} />
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
