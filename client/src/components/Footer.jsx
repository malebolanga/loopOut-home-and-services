// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const { hideBottomNav } = useSelector((state) => state.frontend || {});
  const lastScroll = useRef(0);

  const handleProtectedClick = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/login-required');
    } else if (path === '/profile') {
      navigate('/profile');
    }
  };

  // Hide footer when bottom sheets are open or on full-bleed profile layouts.
  if (
    hideBottomNav ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/user/') ||
    location.pathname.startsWith('/user-profile/')
  ) {
    return null;
  }

  const isFoodRoute =
    location.pathname === '/food' ||
    location.pathname.startsWith('/food/') ||
    location.pathname === '/lunch' ||
    location.pathname.startsWith('/lunch/');

  return (
    <>
      {/* ── Desktop Footer Bar (Airbnb-style minimal bottom bar) ── */}
      <footer
        className={`${isFoodRoute ? 'hidden lg:flex' : 'hidden md:flex'} items-center justify-between bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 px-8 py-4 text-[13px] text-gray-500 dark:text-gray-400`}
      >
        {/* Left: copyright + nav links */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>© {new Date().getFullYear()} loopOut, Inc.</span>
          <span className="mx-1 opacity-40">·</span>
          <Link to="/privacy" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Privacy
          </Link>
          <span className="mx-1 opacity-40">·</span>
          <Link to="/terms" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Terms
          </Link>
          <span className="mx-1 opacity-40">·</span>
          <Link to="/sitemap" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Sitemap
          </Link>
        </div>

        {/* Right: language, currency, social icons */}
        <div className="flex items-center gap-4">
          {/* Language */}
          <button className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium">
            {/* Globe icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            English
          </button>

          {/* Currency */}
          <button className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium">
            R ZAR
          </button>

          {/* Facebook */}
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>

          {/* X (Twitter) */}
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </footer>

      {/* ── Mobile Footer Bar ── */}
      {!isFoodRoute && (
        <footer className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-x-4 text-[11px] font-bold text-gray-500 dark:text-gray-400">
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
