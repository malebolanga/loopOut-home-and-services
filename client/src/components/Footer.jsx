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

  return (
    <>
      {/* Scroll to top button */}
      {!isAtTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all z-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Main Footer - Hidden on small screens, visible on medium and above */}
      <footer className="hidden md:block bg-gray-50 text-gray-300 pt-16 pb-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h5 className="text-gray-900 font-medium text-sm uppercase">Company</h5>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link to="/careers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Careers</Link></li>
                <li><Link to="/press" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Press</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-gray-900 font-medium text-sm uppercase">Support</h5>
              <ul className="space-y-3">
                <li><Link to="/help" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Help Center</Link></li>
                <li><Link to="/message" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Message Us</Link></li>
                <li><Link to="/safety" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Safety</Link></li>
                <li><Link to="/cancellations" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancellations</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-gray-900 font-medium text-sm uppercase">Legal</h5>
              <ul className="space-y-3">
                <li><Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link></li>
                <li><Link to="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cookies</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-gray-900 font-medium text-sm uppercase">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="X"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#E1306C] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-600">© 2025 loopOut, Inc.</span>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <Link to="/terms" className="hover:text-gray-900 transition-colors hover:underline">Terms</Link>
                  <Link to="/privacy" className="hover:text-gray-900 transition-colors hover:underline">Privacy</Link>
                  <Link to="/cookies" className="hover:text-gray-900 transition-colors hover:underline">Cookies</Link>
                </div>
              </div>

              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="X"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#E1306C] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation Bar - Always visible on all screen sizes */}
     
    </>
  );
};

export default Footer;