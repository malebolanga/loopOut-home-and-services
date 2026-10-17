import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  SignalIcon,
  CalendarDaysIcon,
  BellIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const FooterDock = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, route: '/', label: 'Home' },
    { icon: SignalIcon, route: '/search', label: 'Explore' },
    { icon: CalendarDaysIcon, route: '/calendar', label: 'Calendar' },
    { icon: BellIcon, route: '/dashboard', label: 'Alerts', badge: unreadCount },
    { icon: UserIcon, route: '/profile', label: 'Profile' }
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 sm:bottom-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 flex items-center justify-around sm:justify-center gap-1 sm:gap-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl px-2 sm:px-5 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] sm:py-2 border-t border-slate-200/80 dark:border-white/10 sm:rounded-full sm:border sm:shadow-[0_20px_50px_rgba(15,23,42,0.22)] z-[1000] w-full sm:w-auto max-w-lg"
    >
       {navItems.map((item, i) => {
         const isActive = location.pathname === item.route;
         return (
            <button
             key={i} 
             onClick={() => navigate(item.route)}
             title={item.label}
             aria-current={isActive ? 'page' : undefined}
             className={`relative min-w-[56px] min-h-[48px] px-2 py-1 rounded-2xl transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
           >
              <item.icon className={`w-5 h-5 ${item.badge > 0 && !isActive ? 'text-rose-500' : ''}`} />
              {item.badge > 0 && (
                <span className="absolute top-0.5 right-2 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white dark:border-slate-950 shadow-sm">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              <span className="text-[10px] font-bold leading-none">
                {item.label}
              </span>
           </button>
         );
       })}
    </nav>
  );
};

export default FooterDock;
