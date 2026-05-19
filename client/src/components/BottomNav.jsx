import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserCircleIcon,
  PlusCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  HeartIcon as HeartIconSolid, 
  UserCircleIcon as UserCircleIconSolid,
  PlusCircleIcon as PlusCircleIconSolid
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { id: 'home', label: 'Explore', icon: HomeIcon, activeIcon: HomeIconSolid, route: '/' },
    { id: 'wishlist', label: 'Wishlist', icon: HeartIcon, activeIcon: HeartIconSolid, route: '/wishlist' },
    { id: 'create', label: 'Create', icon: PlusCircleIcon, activeIcon: PlusCircleIconSolid, route: '/create-listing' },
    { id: 'search', label: 'Search', icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid, route: '/search' },
    { id: 'profile', label: 'Profile', icon: UserCircleIcon, activeIcon: UserCircleIconSolid, route: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      {/* App-like Bottom Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-6 py-1.5 pb-5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.8 }}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF5A5F]' : 'text-gray-400'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>
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
