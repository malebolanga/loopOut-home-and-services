// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { HomeIcon, MapIcon, HeartIcon, UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { BrandIcon } from './BrandLogo';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScroll = useRef(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const favorites = JSON.parse(localStorage.getItem(`favorites-${currentUser._id}`)) || [];
      setIsFavorite(favorites.length > 0);
    }
  }, [currentUser?._id]);

  const handleProtectedClick = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/login-required');
    } else if (path === '/profile') {
      // Already logged in, allow navigation to profile
      navigate('/profile');
    }
  };

  // 新增：处理 Profile 点击事件
  const handleProfileClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/login-required'); // 导航到登录页面
    }
    // 如果已登录，Link 组件会正常导航到 /profile
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 100);
      
      const isScrollingUp = currentScrollY < lastScroll.current;
      
      // Elite Behavior: Hide when scrolling down, show when scrolling up
      if (currentScrollY < 50) {
        setIsNavVisible(true); 
      } else if (isScrollingUp) {
        setIsNavVisible(true); // Show when user wants to navigate
      } else {
        setIsNavVisible(false); // Hide when user is consuming content (scrolling down)
      }
      
      lastScroll.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hide footer only on full-bleed profile layouts. Listing/helper/service/
  // event detail pages keep the footer so Privacy/Terms links stay reachable.
  if (
    location.pathname === '/profile' ||
    location.pathname.startsWith('/user/') ||
    location.pathname.startsWith('/user-profile/')
  ) {
    return null;
  }

  return (
    <>
  

      {/* Main Footer - Hidden on mobile, visible on desktop */}
      <footer className="hidden md:block bg-gray-50 text-gray-600 pt-20 pb-12 mt-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-5 space-y-6 md:space-y-8">
              <div className="flex items-center gap-3">
                     <BrandIcon className="w-8 h-8" />
                 <h3 className="text-2xl font-black tracking-tighter text-gray-900">loopOut</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium max-w-sm">
                The ultimate neural ecosystem for high-fidelity stays, vetted local professionals, and premium lifestyle services.
              </p>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-2 space-y-6">
              <h5 className="text-gray-950 font-black text-[10px] uppercase tracking-[0.2em]">Company</h5>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">About</Link></li>
                <li><Link to="/pricing" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">Pricing</Link></li>
                <li><Link to="/become" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">List with loopOut</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h5 className="text-gray-950 font-black text-[10px] uppercase tracking-[0.2em]">Support</h5>
              <ul className="space-y-4">
                <li><Link to="/help-center" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">Help Center</Link></li>
                <li><Link to="/trust" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">Trust & Safety</Link></li>
                <li><Link to="/contact" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">Contact us</Link></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-3 space-y-6">
              <h5 className="text-gray-950 font-black text-[10px] uppercase tracking-[0.2em]">Protocols</h5>
              <ul className="space-y-4">
                <li><Link to="/terms" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-all">Privacy Policy</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-xs font-bold text-gray-400">© {new Date().getFullYear()} loopOut Neural Hub. All rights reserved.</span>
            <div className="flex items-center gap-10">
               <span className="text-xs font-black text-gray-900 border-b border-rose-500/30">ENGLISH (SA)</span>
               <span className="text-xs font-black text-gray-900 border-b border-rose-500/30">ZAR (R)</span>
            </div>
          </div>
        </div>
      </footer>      
      <footer className="md:hidden mt-12 border-t border-gray-100 bg-gray-50 px-6 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-gray-500">
          <Link to="/help-center">Help</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/trust">Trust &amp; Safety</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        <p className="mt-5 text-[11px] font-medium text-gray-400">&copy; {new Date().getFullYear()} loopOut. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Footer;
