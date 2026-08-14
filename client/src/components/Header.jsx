// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo, { BrandIcon } from './BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';

import { pushPhoneNotification } from './PhoneNotificationManager';

import {
  MagnifyingGlassIcon,
  HeartIcon,
  GlobeAltIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  PlusIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  CheckBadgeIcon,
  QueueListIcon,
  UserIcon,
  HomeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ChartPieIcon,
  MapPinIcon,
  UserGroupIcon,
  BriefcaseIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
  InboxIcon,
  MapIcon,
  ArrowRightIcon,
  ArrowLongRightIcon,
  MicrophoneIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline';

import {
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HeartIcon as HeartIconSolid,
  BellIcon as BellIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid';

import {
  generateSuggestions,
  extractFiltersFromQuery,
  saveSearchHistory,
  getSearchHistory
} from '../utils/searchUtils';

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

import { Sparkles } from 'lucide-react';
import { useSearchIntelligence } from '../hooks/useSearchIntelligence';

const PROPERTY_SUBTYPES = [
  { id: 'rent', label: 'Rental', icon: '🏠' },
  { id: 'sale', label: 'Hotel', icon: '🏨' },
  { id: 'over', label: 'Vacation', icon: '🌙' },
  { id: 'resort', label: 'Resort', icon: '🏖️' },
  { id: 'office', label: 'Office', icon: '🏢' }
];

const SERVICE_SUBTYPES = [
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'carwash', label: 'Car Wash', icon: '🚗' },
  { id: 'landscaping', label: 'Landscaping', icon: '🌿' },
  { id: 'electrician', label: 'Electrician', icon: '⚡' },
  { id: 'handyman', label: 'Handyman', icon: '🔧' }
];

const HELPER_SUBTYPES = [
  { id: 'maid', label: 'Maid', icon: '🧼' },
  { id: 'barber', label: 'Barber', icon: '💇' },
  { id: 'chef', label: 'Chef', icon: '👨‍🍳' },
  { id: 'tutor', label: 'Tutor', icon: '📚' },
  { id: 'domestic', label: 'Domestic', icon: '🧹' }
];

const normalizeSearchType = (type) => {
  if (type === 'helper') return 'helpers';
  if (type === 'property') return 'properties';
  return type || 'all';
};

const QUICK_DISCOVERY_MAP = {
  resort: { searchType: 'properties', subType: 'resort' },
  hotel: { searchType: 'properties', subType: 'sale' },
  guesthouse: { searchType: 'properties', subType: 'guest_house' },
  'room-rent': { searchType: 'properties', subType: 'rent' },
  'house-rent': { searchType: 'properties', subType: 'rent' },
  'self-catering': { searchType: 'properties', subType: 'land' },
  photograph: { searchType: 'helpers', subType: 'photography' },
  carwash: { searchType: 'services', subType: 'carwash' },
  electrician: { searchType: 'services', subType: 'electrician' },
  handyman: { searchType: 'services', subType: 'handyman' },
  catering: { searchType: 'services', subType: 'catering' },
  transport: { searchType: 'services', subType: 'transport' },
  maid: { searchType: 'helpers', subType: 'maid' },
  nanny: { searchType: 'helpers', subType: 'nanny' },
  barber: { searchType: 'helpers', subType: 'barber' },
  beauty: { searchType: 'helpers', subType: 'beauty' }
};

const HEADER_CATEGORY_ICONS = {
  properties: HomeIcon,
  services: BriefcaseIcon,
  helpers: UserGroupIcon,
  events: BellIcon,
  rent: HomeIcon,
  sale: BuildingOfficeIcon,
  over: Sparkles,
  resort: Sparkles,
  office: BuildingOfficeIcon,
  hotel: BuildingOfficeIcon,
  guesthouse: HomeModernIcon,
  'room-rent': HomeIcon,
  'house-rent': HomeModernIcon,
  'self-catering': BriefcaseIcon,
  photography: MagnifyingGlassIcon,
  photograph: MagnifyingGlassIcon,
  carwash: MapIcon,
  landscaping: Sparkles,
  electrician: BoltIcon,
  handyman: Cog6ToothIcon,
  catering: BriefcaseIcon,
  transport: MapPinIcon,
  maid: HomeModernIcon,
  nanny: UserIcon,
  barber: UserIcon,
  beauty: Sparkles,
  chef: BriefcaseIcon,
  tutor: QuestionMarkCircleIcon,
  domestic: HomeModernIcon
};

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCountRef = useRef(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => localStorage.getItem('loopOutSound') !== 'false');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Polokwane');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const playNotificationChime = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore browser autoplay restrictions
    }
  }, [isSoundEnabled]);

  // Currency and Language states
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('preferredCurrency') || 'ZAR';
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'English';
  });

  const profileDropdownRef = useRef(null);
  const createDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const headerRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Available currencies and languages
  const currencies = [
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  // Fetch notifications
  const fetchNotifications = useCallback(async (signal) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token') || '';
      const headers = {
        'Content-Type': 'application/json'
      };

      // Only attach if it's a real token, not 'null' string or empty
      if (token && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/notifications', {
        headers,
        credentials: 'include',
        signal
      });

      // Silently ignore auth errors, rate limit states, and server-not-ready states
      if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 503) return;

      if (res.ok) {
        const data = await res.json();
        const newUnreadCount = data.unreadCount || 0;

        // If we have new unread notifications, ring the bell and trigger phone push banner
        if (newUnreadCount > prevUnreadCountRef.current) {
          playNotificationChime();

          const latest = data.notifications?.[0];

          // Trigger iOS/Android style top phone notification banner
          if (latest) {
            pushPhoneNotification({
              title: latest.title || 'loopOut Alert',
              message: latest.message || 'You have a new update.',
              type: latest.type || 'info',
              link: '/notifications'
            });
          }

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new window.Notification(latest?.title || 'loopOut Alert', {
              body: latest?.message || 'You have a new notification',
              icon: '/favicon.ico'
            });
          }
        }

        setNotifications(data.notifications || []);
        setUnreadCount(newUnreadCount);
        prevUnreadCountRef.current = newUnreadCount;
      }
    } catch (error) {
      // Ignore AbortError — this is expected on component unmount
      if (error.name === 'AbortError') return;
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser, playNotificationChime]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal);

    const refreshNotifications = () => fetchNotifications();
    window.addEventListener('loopout:notification-created', refreshNotifications);

    // Set up polling for real-time alerts
    const interval = setInterval(() => {
      const pollController = new AbortController();
      fetchNotifications(pollController.signal);
    }, 30000); // Poll every 30s

    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener('loopout:notification-created', refreshNotifications);
    };
  }, [fetchNotifications]);

  // Sync search state with URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const term = urlParams.get('searchTerm');
    const type = normalizeSearchType(urlParams.get('type'));
    const subType = urlParams.get('subType') || urlParams.get('category');
    const address = urlParams.get('address') || urlParams.get('location');

    if (term) setSearchTerm(term);
    if (type) setSearchType(type);
    setSelectedSubCategory(subType || '');
    if (address) setCurrentLocation(address);
  }, [location.search]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }

      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setShowCreateDropdown(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }

      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target) && !e.target.closest('.currency-button')) {
        setShowCurrencyDropdown(false);
      }

      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target) && !e.target.closest('.language-button')) {
        setShowLanguageDropdown(false);
      }

      // Close search if clicking outside search area
      if (showSearch && !e.target.closest('.search-container') && !e.target.closest('.search-trigger')) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  // Toggle bottom nav visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY.current;

      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (isScrollingUp) {
        setIsNavVisible(true);
      } else {
        setIsNavVisible(false);
      }

      setScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Suggestions debouncing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const newSuggestions = generateSuggestions(searchTerm, 'all', searchHistory);
      setSuggestions(newSuggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchHistory]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSearch]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      navigate('/sign-in');
      setShowProfileDropdown(false);
      setShowMobileMenu(false);
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  // Command Center Navigation
  const MASTER_COMMANDS = [
    { label: 'DASHBOARD', route: '/dashboard', icon: <HomeModernIcon className="w-5 h-5" />, color: 'bg-indigo-500' },
    { label: 'ELITE REWARDS', route: '/rewards', icon: <Sparkles className="w-5 h-5" />, color: 'bg-purple-500' },
    { label: 'AI PLANNER', route: '/planner', icon: <MapIcon className="w-5 h-5" />, color: 'bg-pink-500' },
    { label: 'BILL SPLITTER', route: '/splitter', icon: <ChartPieIcon className="w-5 h-5" />, color: 'bg-emerald-600' },
    { label: 'CREATE LISTING', route: `/${currentUser?._id}/create-listing`, icon: <PlusCircleIcon className="w-5 h-5" />, color: 'bg-emerald-500' },
    { label: 'MY LISTINGS', route: `/${currentUser?._id}/listings`, icon: <QueueListIcon className="w-5 h-5" />, color: 'bg-blue-500' },
    { label: 'HELP CENTER', route: '/help-center', icon: <QuestionMarkCircleIcon className="w-5 h-5" />, color: 'bg-indigo-600' },
    { label: 'SIGNAL INBOX', route: '/messages', icon: <InboxIcon className="w-5 h-5" />, color: 'bg-cyan-500' },
    { label: 'VERIFY IDENTITY', route: '/verification', icon: <CheckBadgeIcon className="w-5 h-5" />, color: 'bg-rose-600' },
    { label: 'SECURITY LAB', route: '/trust', icon: <ShieldCheckIcon className="w-5 h-5" />, color: 'bg-gray-800' },
    { label: 'FOR BUSINESS', route: '/for-business', icon: <BriefcaseIcon className="w-5 h-5" />, color: 'bg-rose-500' },
    { label: 'HOST EARNINGS', route: '/host-earnings', icon: <ChartBarIcon className="w-5 h-5" />, color: 'bg-amber-500' },
    { label: 'HOST TOOLS', route: '/host-tools', icon: <Squares2X2Icon className="w-5 h-5" />, color: 'bg-indigo-500' },
    { label: 'SETTINGS', route: '/settings', icon: <Cog6ToothIcon className="w-5 h-5" />, color: 'bg-indigo-500' }
  ];

  // Handle search submission
  const { recordSearch } = useSearchIntelligence();

  const handleSearch = (eventOrOptions, maybeOptions) => {
    const hasEvent = eventOrOptions && typeof eventOrOptions.preventDefault === 'function';
    if (hasEvent) eventOrOptions.preventDefault();

    const options = hasEvent ? (maybeOptions || {}) : (eventOrOptions || {});
    const nextSearchTerm = options.searchTerm ?? searchTerm;
    const nextSearchType = normalizeSearchType(options.searchType ?? searchType);
    const nextSubCategory = options.subType ?? options.selectedSubCategory ?? selectedSubCategory;

    // Only block if absolutely no criteria is provided
    if (!nextSearchTerm.trim() && !nextSubCategory && !nextSearchType) return;

    if (nextSearchTerm.trim()) {
      recordSearch(nextSearchTerm);
      const updatedHistory = saveSearchHistory(nextSearchTerm, nextSearchType);
      setSearchHistory(updatedHistory);
    }

    const extractedFilters = nextSearchTerm.trim() ? extractFiltersFromQuery(nextSearchTerm) : {};
    const resolvedType = normalizeSearchType(options.searchType ?? extractedFilters.type ?? nextSearchType ?? 'all');
    const resolvedSubType = options.subType ?? nextSubCategory ?? extractedFilters.subType ?? '';
    const resolvedLocation = options.location ?? extractedFilters.location ?? currentLocation;
    const urlParams = new URLSearchParams();
    const isLocationOnly = extractedFilters.location && nextSearchTerm.toLowerCase().trim() === extractedFilters.location.toLowerCase().trim();

    if (nextSearchTerm.trim() && !isLocationOnly) urlParams.set('searchTerm', nextSearchTerm);
    urlParams.set('type', resolvedType);
    if (resolvedSubType) urlParams.set('subType', resolvedSubType);
    if (resolvedLocation) urlParams.set('location', resolvedLocation);

    Object.entries(extractedFilters).forEach(([key, value]) => {
      if (key !== 'type' && key !== 'subType' && key !== 'location') {
        urlParams.set(key, value);
      }
    });

    navigate(`/search?${urlParams.toString()}`);
    setShowSearch(false);
    setSearchTerm(nextSearchTerm);
    setSearchType(resolvedType);
    setSelectedSubCategory(resolvedSubType);
    setSuggestions([]);
  };

  // Handle currency change
  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('preferredCurrency', currencyCode);
    setShowCurrencyDropdown(false);

    // Dispatch currency change to Redux store if you have currency slice
    // dispatch(setCurrency(currencyCode));

  };

  // Handle language change
  const handleLanguageChange = (languageCode, languageName) => {
    setSelectedLanguage(languageName);
    localStorage.setItem('preferredLanguage', languageCode);
    setShowLanguageDropdown(false);

    // Dispatch language change to Redux store if you have language slice
    // dispatch(setLanguage(languageCode));

  };

  // Get current currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency ? currency.symbol : 'R';
  };

  // Search categories
  const searchCategories = [
    { key: 'properties', label: 'Homes', icon: '🏠' },
    { key: 'services', label: 'Services', icon: '🔧' },
    { key: 'helpers', label: 'Helpers', icon: '👨‍💼' },
    { key: 'events', label: 'Events', icon: '🎪' }
  ];

  // Handle navigation helper
  const handleNavigate = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
  };

  const handleNotificationsClick = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      await window.Notification.requestPermission();
    }
    handleNavigate('/notifications');
  };

  // Handle mobile profile click - navigate to profile page instead of showing dropdown
  const handleMobileProfileClick = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/sign-in');
    }
  };

  const hiddenRoutes = ['/profile', '/wishlist', '/search', '/dashboard', '/host-dashboard', '/planner', '/lunch'];
  const hiddenPrefixes = ['/user/', '/user-profile/', '/listing/', '/rent/', '/helper/', '/service/', '/event/', '/carwash/'];
  
  const isHeaderHidden = 
    hiddenRoutes.includes(location.pathname) || 
    hiddenPrefixes.some(prefix => location.pathname.startsWith(prefix));

  const profileMenuContent = (
    <div className="flex flex-col">
      {currentUser ? (
        <>
          {/* User Header */}
          <div
            className="p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-[2.2rem] mb-4 flex items-center cursor-pointer shadow-xl"
            onClick={() => handleNavigate('/profile')}
          >
            <div className="relative flex-shrink-0">
               <img
                 src={currentUser.avatar}
                 className="w-14 h-14 rounded-full object-cover border-2 border-rose-500 p-0.5"
                 alt="Profile"
               />
               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-black rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-white truncate">{currentUser.username}</p>
                  <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.2em]">ELITE USER</span>
               </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-500 hover:text-white transition-colors" />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {MASTER_COMMANDS.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleNavigate(cmd.route)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-rose-50/50 rounded-2xl transition-all border border-transparent hover:border-rose-100/50"
              >
                <div className={`p-2 ${cmd.color} text-white rounded-xl shadow-md transition-transform hover:scale-110`}>
                  {cmd.icon}
                </div>
                <span className="text-[8px] font-black text-gray-900 uppercase tracking-widest text-center leading-tight">
                  {cmd.label}
                </span>
              </button>
            ))}
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 border-t border-slate-100 mt-3 -mx-4 px-4 pb-3">
  <button
    onClick={handleSignOut}
    aria-label="Sign out"
    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase text-slate-600 hover:text-rose-600 transition-all tracking-[0.2em] bg-slate-50 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100 active:scale-95"
  >
    <ArrowRightOnRectangleIcon className="w-4 h-4" />
    Sign out
  </button>
</div>
<div className="text-center text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-[0.15em]">
  <a href="/terms" className="hover:text-rose-500 transition-colors">Terms</a>
  <span className="mx-1.5 text-slate-300">&middot;</span>
  <a href="/privacy" className="hover:text-rose-500 transition-colors">Privacy</a>
  <span className="mx-1.5 text-slate-300">&middot;</span>
  <a href="/contact" className="hover:text-rose-500 transition-colors">Contact</a>
  <span className="mx-1.5 text-slate-300">&middot;</span>
  <span>&copy; 2026</span>
</div>
        </>
      ) : (
        <div className="p-4 space-y-3">
          <button
            onClick={() => handleNavigate('/sign-in')}
            className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
          >Sign In</button>
          <button
            onClick={() => handleNavigate('/sign-up')}
            className="w-full py-4 border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
          >Create Account</button>
          <div className="text-center text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-[0.15em]">
  <a href="/terms" className="hover:text-rose-500 transition-colors">Terms</a>
  <span className="mx-1.5 text-slate-300">&middot;</span>
  <a href="/privacy" className="hover:text-rose-500 transition-colors">Privacy</a>
  <span className="mx-1.5 text-slate-300">&middot;</span>
  <a href="/contact" className="hover:text-rose-500 transition-colors">Contact</a>
  <span className="mx-1.5 text-slate-300">&middot;</span>
  <span>&copy; 2026</span>
</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Native-style app bar */}
      {!isHeaderHidden && (
        <motion.header
          initial={{ y: 0 }}
          animate={{ 
            y: isNavVisible ? 0 : -120,
            opacity: isNavVisible ? 1 : 0,
            paddingTop: scrolled ? '0.5rem' : '0.75rem',
            paddingBottom: scrolled ? '0.5rem' : '0.75rem',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 120, opacity: { duration: 0.2 } }}
          ref={headerRef}
        className={`app-safe-top fixed top-0 left-0 right-0 bg-white border-b-0 backdrop-blur-xl transition-all duration-500 ${
          scrolled ? 'bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.03)]' : 'bg-transparent'
        }`}
        >
        <div className="max-w-[2520px] mx-auto xl:px-[82px] md:px-[42px] px-4 sm:px-6">
          <div className="flex flex-row items-center justify-between h-14 md:h-16">
            
            {/* Left: Branding & Home Link */}
            <div className={`transition-all duration-500 ${showSearch ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
              <Link
                to="/"
                onClick={(e) => {
                  if (window.innerWidth < 768) {
                    e.preventDefault();
                    setShowSearch(true);
                  }
                }}
                aria-label="loopOut Home"
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-orange-400 blur-xl opacity-20 hover:opacity-40 transition-opacity duration-500 rounded-full" />
                  <BrandIcon className="w-9 h-9 md:w-8 md:h-8 relative z-10 transition-transform group-hover:rotate-[15deg] duration-700 ease-out" />
                </div>
                <div className="block">
                  <h1 className="text-base md:text-xl font-black tracking-tighter text-gray-900 leading-none">loopOut</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-[1px] w-3 bg-rose-500/50" />
                    <span className="text-[8px] font-black text-rose-600 uppercase tracking-[0.2em] leading-none hidden sm:inline">Your local hub</span>
                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Search Pill (Airbnb Style) */}
            <div className={`flex-1 hidden md:flex justify-center transition-all duration-500 ${showSearch ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              <button
                onClick={() => setShowSearch(true)}
                aria-label="Open search"
                className="search-trigger flex items-center gap-0 border border-slate-200 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer bg-white overflow-hidden"
              >
                <span className="text-[11px] font-black text-slate-900 px-5 py-2.5 hover:bg-slate-50 transition-colors">Anywhere</span>
                <div className="w-[1px] h-5 bg-slate-200" />
                <span className="text-[11px] font-black text-slate-900 px-5 py-2.5 hover:bg-slate-50 transition-colors">Any type</span>
                <div className="w-[1px] h-5 bg-slate-200" />
                <span className="text-[11px] font-medium text-slate-400 px-4 py-2.5">Search loopOut</span>
                <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white mr-1.5 group-hover:from-rose-600 group-hover:to-rose-700 transition-all shadow-md shadow-rose-200">
                  <MagnifyingGlassIcon className="w-4 h-4 stroke-[2.5px]" />
                </div>
              </button>
            </div>

            {/* Right: User Menu */}
            <div className="relative md:translate-x-[20px]" ref={profileDropdownRef}>
              <div className="flex flex-row items-center gap-1.5 md:gap-3">

                <div className="relative" ref={createDropdownRef}>
                  <button
                    onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                    className="hidden xl:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] py-3.5 px-8 rounded-full bg-gray-950 text-white hover:bg-black transition-all duration-500 cursor-pointer shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] active:scale-95 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer" />
                    <PlusIcon className="w-4 h-4 stroke-[3px] text-rose-500 hover:rotate-90 transition-transform duration-500" />
                    <span>Create</span>
                  </button>

                  <AnimatePresence>
                    {showCreateDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 py-5 z-50 overflow-hidden"
                      >
                        {[
                          { label: 'Create Stay', icon: HomeIcon, tab: 'stays' },
                          { label: 'Create Helper', icon: UserGroupIcon, tab: 'online' },
                          { label: 'Create Event', icon: BellIcon, tab: 'events' },
                          { label: 'Create Service', icon: BriefcaseIcon, tab: 'experiences' }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (item.path) {
                                handleNavigate(currentUser ? item.path : '/sign-in');
                              } else {
                                handleNavigate(currentUser ? `/${currentUser._id}/create-listing?tab=${item.tab}` : '/sign-in');
                              }
                              setShowCreateDropdown(false);
                            }}
                            className="w-full px-6 py-4 hover:bg-rose-50 transition-colors flex items-center gap-4 text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#222222]">{item.label}</p>
                              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Start Now</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Globe Icon */}
                <button
                  onClick={() => {
                    setShowLanguageDropdown(!showLanguageDropdown);
                    setShowProfileDropdown(false);
                    setShowCurrencyDropdown(false);
                  }}
                  aria-label="Select language"
                  className="language-button w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md hover:border-slate-400 transition-all hidden md:flex text-slate-700 hover:text-slate-900"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                </button>

                {/* Currency Selector */}
                <button
                  onClick={() => {
                    setShowCurrencyDropdown(!showCurrencyDropdown);
                    setShowLanguageDropdown(false);
                    setShowProfileDropdown(false);
                  }}
                  aria-label={`Select currency. Current: ${selectedCurrency}`}
                  className="currency-button px-3 h-9 border border-slate-200 rounded-full flex items-center gap-1 cursor-pointer hover:shadow-md hover:border-slate-400 transition-all hidden md:flex text-slate-700 font-black text-[10px]"
                >
                  <span>{getCurrencySymbol()}</span>
                  <span>{selectedCurrency}</span>
                </button>

                {/* Home Icon - Desktop */}
                <Link
                  to="/"
                  aria-label="Home"
                  className="relative w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md hover:border-slate-400 transition-all hidden md:flex text-slate-700 hover:text-slate-900"
                >
                  <HomeIcon className="w-4 h-4 stroke-[2px]" />
                </Link>

                {/* Wishlist Icon - Desktop */}
                <button
                  onClick={() => handleNavigate('/wishlist')}
                  aria-label="Wishlist"
                  className="relative w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md hover:border-slate-400 transition-all hidden md:flex text-slate-700 hover:text-slate-900 hover:text-rose-500"
                >
                  <HeartIcon className="w-4 h-4 stroke-[2px]" />
                </button>

                {/* Notification Bell Icon - Desktop and Mobile */}
                <button
                  onClick={handleNotificationsClick}
                  aria-label={`Notifications. ${unreadCount} unread`}
                  className="relative w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md hover:border-slate-400 transition-all flex text-slate-700"
                >
                  <BellIcon className="w-4 h-4 stroke-[2px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full border-[1.5px] border-white shadow-sm z-10 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

              </div>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div
                  ref={languageDropdownRef}
                  className="absolute rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-[260px] bg-white overflow-hidden right-0 top-12 text-sm border border-gray-100 max-h-[400px] overflow-y-auto hidden md:block z-[60]"
                >
                  <div className="p-4 border-b border-[#DDDDDD] font-semibold text-[#222222]">
                    Choose a language
                  </div>
                  {languages.filter((language) => language.code === 'en').map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code, language.name)}
                      className="w-full px-4 py-3 hover:bg-gray-100 transition text-left flex items-center justify-between text-[#222222]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                      {selectedLanguage === language.name && (
                        <CheckIcon className="w-4 h-4 text-[#FF5A5F]" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Currency Dropdown Menu */}
              {showCurrencyDropdown && (
                <div
                  ref={currencyDropdownRef}
                  className="absolute rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-[260px] bg-white overflow-hidden right-12 top-12 text-sm border border-gray-100 max-h-[400px] overflow-y-auto hidden md:block z-[60]"
                >
                  <div className="p-4 border-b border-[#DDDDDD] font-semibold text-[#222222]">
                    Choose currency
                  </div>
                  {currencies.filter((currency) => currency.code === 'ZAR').map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className="w-full px-4 py-3 hover:bg-gray-100 transition text-left flex items-center justify-between text-[#222222]"
                    >
                      <span className="font-bold text-xs">{currency.code} ({currency.symbol})</span>
                      <span className="text-gray-700 text-xs">{currency.name}</span>
                      {selectedCurrency === currency.code && (
                        <CheckIcon className="w-4 h-4 text-[#FF5A5F]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>
    )}

    {/* User Profile Dropdown - Mobile Bottom Sheet */}
    <AnimatePresence>
      {/* Mobile user dropdown bottom sheet is removed */}
    </AnimatePresence>

    {/* Full Screen Elite Search Modal - Airbnb Style */}
    <AnimatePresence>
      {showSearch && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowSearch(false)} 
            aria-hidden="true"
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[1000]" 
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="search-container fixed inset-0 bg-gray-50 z-[1001] flex flex-col md:max-w-md md:left-auto md:right-0 md:shadow-2xl overflow-hidden"
          >
            <div className="app-safe-top flex-shrink-0 bg-white px-4 sm:px-6 pt-4 pb-4 flex items-center justify-between">
              <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2">
                {[
                  { id: 'all', label: 'Universe', icon: Sparkles, color: 'rose' },
                  { id: 'properties', label: 'Homes', icon: HomeIcon, color: 'rose' },
                  { id: 'events', label: 'Experiences', icon: MagnifyingGlassIcon, color: 'rose' },
                  { id: 'services', label: 'Services', icon: UserGroupIcon, color: 'rose' },
                  { id: 'helpers', label: 'Helpers', icon: BriefcaseIcon, color: 'rose' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = searchType === item.id;
                  
                  return (
                    <button 
                      key={item.id}
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                          setShowSearch(false);
                        } else {
                          setSearchType(item.id);
                        }
                      }}
                      className="flex flex-col items-center gap-2 relative outline-none"
                    >
                       <motion.div 
                         animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
                         transition={{ duration: 0.4, ease: "backOut" }}
                         className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-1'}`}
                       >
                          <Icon className="w-6 h-6" />
                       </motion.div>
                       
                       <motion.span 
                         animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1.05 : 1 }}
                         className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-600'}`}
                       >
                         {item.label}
                       </motion.span>
                       
                       {isActive && (
                         <motion.div 
                           layoutId="categoryLine" 
                           className="absolute -bottom-1 w-6 h-1 bg-rose-500 rounded-full" 
                         />
                       )}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowSearch(false)}
                aria-label="Close search"
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
              >
                <XMarkIcon className="w-5 h-5 text-slate-900" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
               {/* Section: WHERE? */}
               <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Where to?</h2>
                  
                  <div className="relative mb-8">
                     <BrandIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 grayscale opacity-40" />
                     <input 
                       ref={searchInputRef}
                       type="text"
                       placeholder="Search destinations"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none font-medium placeholder-gray-500"
                     />
                     <button 
                       aria-label="Voice search"
                       className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                     >
                        <MicrophoneIcon className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="space-y-4">
                     {searchHistory.length > 0 && (
                       <div className="mb-6">
                         <div className="flex justify-between items-center mb-4">
                           <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Recent searches</p>
                           <button onClick={clearSearchHistory} className="text-[10px] font-bold text-gray-600 hover:text-rose-500 uppercase tracking-widest">Clear</button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {searchHistory.slice(0, 5).map((item, i) => (
                             <button 
                               key={i} 
                               onClick={() => handleSearch({ searchTerm: item.term })}
                               className="px-4 py-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold text-gray-700 transition-all"
                             >
                               {item.term}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}

                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Suggested destinations</p>
                     
                     <button 
                       onClick={() => handleSearch({ searchTerm: 'Nearby' })}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                           <MapPinIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Nearby</p>
                           <p className="text-xs text-gray-700">Find what's around you</p>
                        </div>
                     </button>

                     <button 
                       onClick={() => handleSearch({ searchTerm: 'Cape Town, Western Cape', location: 'Cape Town' })}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                           <BuildingOfficeIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Cape Town, Western Cape</p>
                           <p className="text-xs text-gray-700">Popular beach destination</p>
                        </div>
                     </button>

                     <button 
                       onClick={() => handleSearch({ searchTerm: 'Durban, KwaZulu-Natal', location: 'Durban' })}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                           <HomeModernIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Durban, KwaZulu-Natal</p>
                           <p className="text-xs text-gray-700">For sights like uShaka Marine World</p>
                        </div>
                     </button>

                     <button 
                       onClick={() => handleSearch({ searchTerm: 'Tembisa, Gauteng', location: 'Tembisa' })}
                       className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-98"
                     >
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                           <MapPinIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">Tembisa, Gauteng</p>
                           <p className="text-xs text-gray-700">Popular destination in Gauteng</p>
                        </div>
                     </button>
                  </div>
               </div>

               {/* Section: CATEGORIES DISCOVERY */}
               <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
                  <h2 className="text-lg font-black text-gray-900 mb-6 tracking-tight uppercase">Quick Discovery</h2>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'helpers', label: 'Helper', icon: '👨‍💼', color: 'bg-emerald-50' },
                      { id: 'services', label: 'Services', icon: '🛠️', color: 'bg-blue-50' },
                      { id: 'properties', label: 'Homes', icon: '🏠', color: 'bg-rose-50' },
                      { id: 'events', label: 'Events', icon: '🎪', color: 'bg-amber-50' },
                      { id: 'resort', label: 'Resort', icon: '🏖️', color: 'bg-cyan-50' },
                      { id: 'hotel', label: 'Hotel', icon: '🏨', color: 'bg-indigo-50' },
                      { id: 'guesthouse', label: 'Guest House', icon: '🏡', color: 'bg-emerald-50' },
                      { id: 'room-rent', label: 'Room Rent', icon: '🛏️', color: 'bg-blue-50' },
                      { id: 'house-rent', label: 'House Rent', icon: '🏠', color: 'bg-amber-50' },
                      { id: 'self-catering', label: 'Catering', icon: '🍳', color: 'bg-orange-50' },
                      { id: 'maid', label: 'Maids', icon: '🧹', color: 'bg-purple-50' },
                      { id: 'carwash', label: 'Car Wash', icon: '🚗', color: 'bg-cyan-50' },
                      { id: 'nanny', label: 'Nanny', icon: '👶', color: 'bg-pink-50' },
                      { id: 'photograph', label: 'Photo', icon: '📸', color: 'bg-indigo-50' },
                      { id: 'transport', label: 'Transport', icon: '🚐', color: 'bg-orange-50' },
                      { id: 'electrician', label: 'Electric', icon: '⚡', color: 'bg-yellow-50' },
                      { id: 'handyman', label: 'Handyman', icon: '🔨', color: 'bg-gray-100' },
                      { id: 'catering', label: 'Catering', icon: '🍽️', color: 'bg-red-50' },
                      { id: 'barber', label: 'Barber', icon: '💈', color: 'bg-blue-100' },
                      { id: 'beauty', label: 'Beauty', icon: '💄', color: 'bg-rose-100' }
                    ].map((cat) => {
                      const CategoryIcon = HEADER_CATEGORY_ICONS[cat.id] || Sparkles;
                      return (
                        <button 
                          key={cat.id}
                          onClick={() => {
                            const isCore = ['properties', 'services', 'helpers', 'events'].includes(cat.id);
                            const discovery = QUICK_DISCOVERY_MAP[cat.id] || {
                              searchType: isCore ? cat.id : 'all',
                              subType: ''
                            };

                            setSearchType(discovery.searchType);
                            setSelectedSubCategory(discovery.subType);
                            handleSearch({
                              searchType: discovery.searchType,
                              subType: discovery.subType
                            });
                          }}
                          className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all text-left"
                        >
                          <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                            <CategoryIcon className="w-5 h-5 text-gray-800" />
                          </div>
                          <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
               </div>

               {/* Category Selection Section */}
               {(searchType === 'properties' || searchType === 'services' || searchType === 'helpers') && (
                 <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Select Category</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                       {(searchType === 'properties' ? PROPERTY_SUBTYPES : 
                         searchType === 'services' ? SERVICE_SUBTYPES : 
                         HELPER_SUBTYPES).map((sub) => {
                          const SubIcon = HEADER_CATEGORY_ICONS[sub.id] || Sparkles;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubCategory(sub.id === selectedSubCategory ? '' : sub.id)}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                                selectedSubCategory === sub.id 
                                  ? 'border-rose-500 bg-rose-50 shadow-md scale-105' 
                                  : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                              }`}
                            >
                              <SubIcon className={`w-5 h-5 ${
                                selectedSubCategory === sub.id ? 'text-rose-600' : 'text-gray-700'
                              }`} />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${
                                selectedSubCategory === sub.id ? 'text-rose-600' : 'text-gray-700'
                              }`}>
                                {sub.label}
                              </span>
                            </button>
                          );
                       })}
                    </div>
                 </div>
               )}
            </div>

            {/* Footer - Search Button */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100 px-6 py-5 flex items-center justify-between">
               <button
                 onClick={() => {
                   setSearchTerm('');
                   setSearchType('all');
                   setSelectedSubCategory('');
                   setSuggestions([]);
                 }}
                 className="text-sm font-black text-slate-700 underline underline-offset-4 hover:text-rose-600 transition-colors uppercase tracking-wide"
               >
                 Clear all
               </button>

               <button
                  onClick={() => { handleSearch(); setShowSearch(false); }}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-rose-200 transition-all active:scale-95 hover:shadow-2xl hover:shadow-rose-300"
                >
                 <BrandIcon className="w-5 h-5" color="white" />
                 <span className="text-sm font-black uppercase tracking-widest">Search</span>
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      {!isHeaderHidden && (
        <>
          <div className="h-20 md:h-24"></div>
        </>
      )}
    </>
  );
}
