// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { 
  HomeIcon, 
  MapIcon, 
  HeartIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

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
  }, [currentUser]);

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
      
      // Show nav when at top, hide when scrolling up, show when scrolling down
      if (currentScrollY < 100) {
        setIsNavVisible(true); // Always show at top
      } else if (isScrollingUp) {
        setIsNavVisible(false); // Hide when scrolling up
      } else {
        setIsNavVisible(true); // Show when scrolling down
      }
      
      lastScroll.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hide footer on specific detail pages
  if (
    location.pathname.startsWith('/listing/') ||
    location.pathname.startsWith('/helper/') ||
    location.pathname.startsWith('/service/') ||
    location.pathname.startsWith('/event/')
  ) {
    return null;
  }

  return (
    <>
  

      {/* Main Footer - Hidden on small screens, visible on medium and above */}
      <footer className="hidden md:block bg-[#F0F2F5] text-gray-600 pt-16 pb-8 mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-6 pr-8">
              <h3 className="text-2xl font-black tracking-tight"><span className="text-rose-500">loop</span><span className="text-gray-900">Out</span></h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Your ultimate platform for extraordinary stays, vetted professionals, and premium services. We bring the best right to your doorstep.
              </p>
              <div className="flex space-x-4 pt-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:shadow-md transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-[#E1306C] hover:shadow-md transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-2 space-y-4 md:ml-auto">
              <h5 className="text-gray-900 font-bold text-[11px] uppercase tracking-widest">Company</h5>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">About loopOut</Link></li>
                <li><Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Pricing Options</Link></li>
                <li><Link to="/careers" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Careers</Link></li>
                <li><Link to="/press" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Press</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-4 md:ml-auto">
              <h5 className="text-gray-900 font-bold text-[11px] uppercase tracking-widest">Support</h5>
              <ul className="space-y-3">
                <li><Link to="/help-center" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Help Center</Link></li>
                <li><Link to="/message" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Message Us</Link></li>
                <li><Link to="/trust" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Trust & Safety</Link></li>
                <li><Link to="/cancellations" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Cancellations</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-4 md:ml-auto">
              <h5 className="text-gray-900 font-bold text-[11px] uppercase tracking-widest">Legal</h5>
              <ul className="space-y-3">
                <li><Link to="/terms" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Cookie Policy</Link></li>
                <li><Link to="/sitemap" className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors">Sitemap</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">© {new Date().getFullYear()} loopOut, Inc. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-sm font-bold text-gray-600">
              <span className="flex items-center gap-1 cursor-pointer hover:text-rose-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                English (SA)
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-rose-500 transition-colors">
                R ZAR
              </span>
            </div>
          </div>
        </div>
      </footer>


    </>
  );
};

export default Footer;