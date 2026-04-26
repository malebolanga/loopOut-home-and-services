import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  SignalIcon,
  CpuChipIcon,
  BellIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const FooterDock = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, route: '/', label: 'Home' },
    { icon: SignalIcon, route: '/search', label: 'Explore' },
    { icon: CpuChipIcon, route: '/host-dashboard', label: 'Dashboard' },
    { icon: BanknotesIcon, route: '/host-earnings', label: 'Earnings' },
    { icon: WrenchScrewdriverIcon, route: '/host-tools', label: 'Tools' },
    { icon: BellIcon, route: '/dashboard', label: 'Alerts', badge: unreadCount },
    { icon: UserIcon, route: '/profile', label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-2 bg-[#020617]/60 backdrop-blur-3xl px-3 sm:px-6 py-2 sm:py-4 rounded-full border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[1000] max-w-[98vw] sm:max-w-none">
       {navItems.map((item, i) => {
         const isActive = location.pathname === item.route;
         return (
           <button 
             key={i} 
             onClick={() => navigate(item.route)}
             title={item.label}
             className={`p-2 sm:p-4 rounded-full transition-all flex flex-col items-center gap-1 group relative ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110 mx-0.5 sm:mx-2' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
           >
              <item.icon className={`w-4 h-4 sm:w-6 h-6 ${item.badge > 0 ? 'animate-bounce text-rose-500' : ''}`} />
              {item.badge > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-black border-2 border-[#020617] shadow-lg">
                  {item.badge}
                </span>
              )}
              <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                {item.label}
              </span>
           </button>
         );
       })}
    </div>
  );
};

export default FooterDock;
