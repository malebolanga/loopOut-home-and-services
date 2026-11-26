import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setHideBottomNav, setHideHeader } from "../redux/frontendSlice";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PhoneIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid
} from "@heroicons/react/24/solid";
import { Sparkles, BookOpen, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal, X, MapPin, Loader2, UtensilsCrossed, Store, House, Wrench, HandHeart, CalendarDays, Tags, Megaphone, Car, ChefHat, Camera, Dog, Music2, Trophy, Palette, UsersRound, Trees, Truck, Package, Hammer, GraduationCap, Shirt, Sofa, Laptop, BedDouble, Building2, Scissors, HeartHandshake, Navigation, Play, Flame, ArrowRight, Clock, Plus, PlusCircle, ShoppingBag, Phone, Bus } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import {
  FaApple,
  FaGooglePlay,
  FaWhatsapp,
  FaPhone,
  FaMapMarkerAlt,
  FaTimes
} from "react-icons/fa";
import ImageGallery from "../components/ImageGallery";
import useLocationCoords from "../hooks/useGeolocation";
import { useWishlist } from "../hooks/useWishlist";
import LookingForItem from "../components/LookingForItem";
import HelperItem from "../components/HelperItem";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { resolveApiUrl } from "../utils/apiBaseUrl";
import { isNativeApp, isAndroidApp } from "../utils/nativeApp";
import { subscribeToOrders } from "../services/lunchService";
import {
  NeuralPicksSection,
  SellItemsSection,
  SmartRecommendations,
  ServicesToYourDoor,
  WeeklySpecialsSection,
  CompareRecommendedSection
} from "../components/home/HomeSections";
import ContinueSearchingCard from "../components/home/ContinueSearchingCard";
import FoodCollectionReadyBanner from "../components/home/FoodCollectionReadyBanner";
import CaughtUpHub from "../components/home/CaughtUpHub";
import { TOP_CATEGORIES } from "../data/categories";
import ImageWithFallback from "../components/ImageWithFallback";
import { CategoriesSlider } from "../components/home/CategoriesSlider";
import { HomeHero } from "../components/home/HomeHero";
import DownloadAppSection from "../components/home/DownloadAppSection";
import CategoriesBottomSheet from "../components/home/CategoriesBottomSheet";
import RecentPopoutMenu from "../components/home/RecentPopoutMenu";
import { AirbnbCard, AirbnbCardSkeleton } from "../components/home/AirbnbCard";
import {
  DISTANCE_TIERS,
  filterByDistanceTier,
  calculateDistance
} from "../utils/locationUtils";
const RECENTLY_VIEWED_KEY = "recentlyViewed";
const MAX_RECENTLY_VIEWED = 12;
const DATA_FETCH_LIMIT = 24;
const AI_RECOMMENDATION_LIMIT = 6;
const USER_PREFERENCE_KEY = "userPreferences";
const API_TIMEOUT = 45e3;
const CATEGORY_ICON_BY_ID = {
  all: Sparkles,
  property: House,
  rooms: BedDouble,
  guesthouse: House,
  hotel: Building2,
  lodge: House,
  apartment: Building2,
  self_catering: UtensilsCrossed,
  resort: House,
  hourly_room: BedDouble,
  service: Wrench,
  transport: Car,
  carwash: Car,
  catering: ChefHat,
  landscaping: Trees,
  moving: Truck,
  storage: Package,
  handyman: Hammer,
  others: Sparkles,
  helper: HandHeart,
  domestic: HandHeart,
  tutor: GraduationCap,
  chef: ChefHat,
  beauty: HeartHandshake,
  tattoo: Palette,
  barber: Scissors,
  photography: Camera,
  sneakers: Shirt,
  marquees: Store,
  marquee: Store,
  animals: Dog,
  event: CalendarDays,
  music: Music2,
  sports: Trophy,
  arts: Palette,
  community: UsersRound,
  food: UtensilsCrossed,
  outdoors: Trees,
  selling: Tags,
  furniture: Sofa,
  electronics: Laptop,
  clothes: Shirt,
  universities: GraduationCap,
  books: BookOpen,
  other: Tags,
  "looking-for": Megaphone,
  lookingfor: Megaphone,
  needs: Megaphone,
  shuttle: Bus,
  "shuttle-interprovincial": Bus,
  "shuttle-local": Bus
};
const CategoryNavIcon = ({ id, className = "h-4 w-4" }) => {
  const Icon = CATEGORY_ICON_BY_ID[id] || Tags;
  return /* @__PURE__ */ React.createElement(Icon, { className, "aria-hidden": "true" });
};
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};
const CATEGORY_ICON_DETAILS = {
  Universe: {
    main: "\u{1FA90}",
    details: ["\u2728", "\u{1F319}", "\u{1F680}"],
    bg: "from-slate-950 via-indigo-950 to-fuchsia-900"
  },
  Homes: {
    main: "\u{1F3E1}",
    details: ["\u{1F511}", "\u{1FAB4}", "\u{1F4CD}"],
    bg: "from-emerald-600 via-teal-500 to-sky-500"
  },
  Services: {
    main: "\u{1F6E0}\uFE0F",
    details: ["\u26A1", "\u{1F9FD}", "\u{1F527}"],
    bg: "from-amber-500 via-orange-500 to-rose-500"
  },
  Helper: {
    main: "\u{1F9F9}",
    details: ["\u{1F485}", "\u{1F488}", "\u{1F373}"],
    bg: "from-sky-500 via-blue-600 to-violet-600"
  },
  Events: {
    main: "\u{1F39F}\uFE0F",
    details: ["\u{1F3AA}", "\u{1F3AD}", "\u{1F389}"],
    bg: "from-purple-600 via-fuchsia-600 to-rose-500"
  }
};
const HomeDataErrorNotice = ({ onRetry }) => /* @__PURE__ */ React.createElement("div", { className: "mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold" }, "Some listings could not be refreshed."), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-xs text-amber-800 dark:text-amber-200" }, "Check your connection and try again. Listings already on screen are still available.")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onRetry, className: "shrink-0 rounded-xl bg-amber-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-800 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300" }, "Try again"));
const WelcomeChoices = ({ onChoose, navigate }) => {
  const [pickupInput, setPickupInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const handleQuickPlan = (event) => {
    event.preventDefault();
    const combined = [pickupInput.trim(), destinationInput.trim()].filter(Boolean).join(" ");
    navigate(combined ? `/shuttles?q=${encodeURIComponent(combined)}` : "/shuttles");
  };
  const suggestions = [
    {
      id: "Shuttle",
      title: "Shuttles",
      description: "Go anywhere with live-tracked shuttle seats across South Africa.",
      cta: "Book seat",
      emoji: "\u{1F690}",
      action: () => navigate("/shuttles")
    },
    {
      id: "Moving",
      title: "Moving Trucks",
      description: "Hire verified mini-trucks and large trucks for local or long moves.",
      cta: "Hire truck",
      emoji: "\u{1F69A}",
      badge: "New",
      action: () => navigate("/shuttles?tab=moving")
    },
    {
      id: "Service",
      title: "Local Services",
      description: "Book trusted helpers, barbers, cleaners, and pros near you.",
      cta: "Explore",
      emoji: "\u{1F6E0}\uFE0F",
      action: () => onChoose("Helper")
    },
    {
      id: "Property",
      title: "Stays & Rooms",
      description: "Find verified rooms, rentals, and guesthouses in your area.",
      cta: "Browse",
      emoji: "\u{1F3E0}",
      action: () => onChoose("Property")
    },
    {
      id: "Lunch",
      title: "Food & Lunch",
      description: "Order fresh local meals ready for collection or delivery.",
      cta: "Order",
      emoji: "\u{1F355}",
      action: () => onChoose("Lunch")
    },
    {
      id: "Selling",
      title: "Marketplace & Events",
      description: "Buy, sell locally, and discover upcoming events nearby.",
      cta: "See more",
      emoji: "\u{1F6CD}\uFE0F",
      action: () => onChoose("Selling")
    }
  ];
  return /* @__PURE__ */ React.createElement(
    "section",
    {
      "aria-labelledby": "welcome-choices-title",
      className: "w-full bg-white px-4 pb-6 pt-3 dark:bg-gray-950 sm:px-8 sm:pt-6"
    },
    /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl" }, /* @__PURE__ */ React.createElement("div", { className: "grid items-center gap-8 lg:grid-cols-12" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-6" }, /* @__PURE__ */ React.createElement(
      "h1",
      {
        id: "welcome-choices-title",
        className: "text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl sm:leading-[1.08]"
      },
      "Go anywhere with LoopOut"
    ), /* @__PURE__ */ React.createElement("p", { className: "mt-3 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base" }, "Book a shuttle seat, hire a moving truck, order local food, or find trusted services and stays across South Africa."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleQuickPlan, className: "mt-6 max-w-md space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "relative space-y-2.5" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        "aria-hidden": "true",
        className: "pointer-events-none absolute left-[19px] top-[24px] bottom-[24px] w-[1.5px] bg-slate-900 dark:bg-slate-400"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "relative flex items-center rounded-xl bg-slate-100 px-3.5 py-3 focus-within:ring-2 focus-within:ring-slate-950 dark:bg-slate-800 dark:focus-within:ring-white" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", className: "mr-3 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-950 dark:bg-white" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: pickupInput,
        onChange: (event) => setPickupInput(event.target.value),
        placeholder: "Pickup city or area",
        "aria-label": "Pickup city or area",
        className: "w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "relative flex items-center rounded-xl bg-slate-100 px-3.5 py-3 focus-within:ring-2 focus-within:ring-slate-950 dark:bg-slate-800 dark:focus-within:ring-white" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", className: "mr-3 h-2.5 w-2.5 shrink-0 bg-slate-950 dark:bg-white" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: destinationInput,
        onChange: (event) => setDestinationInput(event.target.value),
        placeholder: "Drop-off city or service",
        "aria-label": "Drop-off city or service",
        className: "w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3 pt-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      },
      "See shuttles"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => navigate("/shuttles?tab=moving"),
        className: "rounded-lg bg-slate-100 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
      },
      "Hire a truck"
    )))), /* @__PURE__ */ React.createElement("div", { className: "hidden lg:col-span-6 lg:block" }, /* @__PURE__ */ React.createElement("div", { className: "relative overflow-hidden rounded-2xl bg-slate-950 shadow-xl" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "/loopout_for_everyone.png",
        alt: "LoopOut transport, services, and stays",
        className: "h-[340px] w-full object-cover opacity-90"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4 text-white" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-[0.18em] text-rose-400" }, "Live across South Africa"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-lg font-extrabold" }, "Shuttles, moving trucks, food & local pros in one place.")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => navigate("/shuttles"),
        className: "shrink-0 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-slate-100"
      },
      "Open radar"
    ))))), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement("h2", { className: "mb-3.5 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl" }, "Suggestions"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3" }, suggestions.map((item) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: item.id,
        onClick: item.action,
        role: "button",
        tabIndex: 0,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            item.action();
          }
        },
        className: "group relative flex w-[270px] shrink-0 snap-start cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#F3F3F3] p-4 text-left transition-colors hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 sm:w-auto"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-1 flex-col items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-slate-950 dark:text-white" }, item.title), item.badge && /* @__PURE__ */ React.createElement("span", { className: "rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white" }, item.badge)), /* @__PURE__ */ React.createElement("p", { className: "mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300" }, item.description), /* @__PURE__ */ React.createElement("span", { className: "mt-3 inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition group-hover:bg-slate-950 group-hover:text-white dark:bg-slate-800 dark:text-white dark:group-hover:bg-white dark:group-hover:text-slate-950" }, item.cta)),
      /* @__PURE__ */ React.createElement("span", { className: "shrink-0 text-4xl leading-none transition-transform group-hover:scale-105", "aria-hidden": "true" }, item.emoji)
    )))))
  );
};
const FALLBACK_HELPERS = [
  {
    _id: "helper-spotted-1",
    name: "Thandi Cleaning & Domestic Helper",
    title: "Thandi Cleaning & Domestic Helper",
    type: "domestic",
    itemType: "helper",
    regularPrice: 280,
    pricePeriod: "day",
    address: "Sandton, Johannesburg",
    city: "Johannesburg",
    rating: 4.9,
    imageUrls: ["/domestic.jpg"],
    description: "Trusted, police-cleared domestic helper for house cleaning, laundry, ironing, and deep cleaning.",
    host: "Thandi M.",
    userRef: { username: "Thandi M.", avatar: "/avatar-default.png", kycStatus: "verified" }
  },
  {
    _id: "helper-spotted-2",
    name: "Gentlemen Cut & Fade Barbershop",
    title: "Gentlemen Cut & Fade Barbershop",
    type: "barber",
    itemType: "helper",
    regularPrice: 150,
    pricePeriod: "day",
    address: "Rosebank, Johannesburg",
    city: "Johannesburg",
    rating: 4.8,
    imageUrls: ["/barber.jpg"],
    description: "Top rated mobile and studio barber for clean fades, beard trims, and styling.",
    host: "David K.",
    userRef: { username: "David K.", avatar: "/avatar-default.png", kycStatus: "verified" }
  },
  {
    _id: "helper-spotted-3",
    name: "Luxe Mobile Beauty & Nail Specialist",
    title: "Luxe Mobile Beauty & Nail Specialist",
    type: "beauty",
    itemType: "helper",
    regularPrice: 320,
    pricePeriod: "day",
    address: "Centurion, Pretoria",
    city: "Pretoria",
    rating: 5,
    imageUrls: ["/beauty.jpg"],
    description: "Certified beauty specialist providing gel nails, lash extensions, makeup, and skin pampering.",
    host: "Lerato S.",
    userRef: { username: "Lerato S.", avatar: "/avatar-default.png", kycStatus: "verified" }
  },
  {
    _id: "helper-spotted-4",
    name: "Chef Sipho Gourmet Dining & Catering",
    title: "Chef Sipho Gourmet Dining & Catering",
    type: "chef",
    itemType: "helper",
    regularPrice: 450,
    pricePeriod: "day",
    address: "Hatfield, Pretoria",
    city: "Pretoria",
    rating: 4.9,
    imageUrls: ["/chef.jpg"],
    description: "Private chef for private dining, braais, traditional meals, and corporate catering.",
    host: "Sipho N.",
    userRef: { username: "Sipho N.", avatar: "/avatar-default.png", kycStatus: "verified" }
  },
  {
    _id: "helper-spotted-5",
    name: "TopGrade STEM & English Private Tutor",
    title: "TopGrade STEM & English Private Tutor",
    type: "tutor",
    itemType: "helper",
    regularPrice: 180,
    pricePeriod: "hour",
    address: "Polokwane Central",
    city: "Polokwane",
    rating: 4.9,
    imageUrls: ["/tutor.jpg"],
    description: "Patient and qualified private tutor for Maths, Science, and English for primary and high school students.",
    host: "Naledi M.",
    userRef: { username: "Naledi M.", avatar: "/avatar-default.png", kycStatus: "verified" }
  },
  {
    _id: "helper-spotted-6",
    name: "Studio Vision Portrait & Event Photographer",
    title: "Studio Vision Portrait & Event Photographer",
    type: "photography",
    itemType: "helper",
    regularPrice: 550,
    pricePeriod: "day",
    address: "Mokopane Central",
    city: "Mokopane",
    rating: 4.8,
    imageUrls: ["/photography.jpg"],
    description: "High-res photography for weddings, portraits, graduations, and outdoor events.",
    host: "Kagiso T.",
    userRef: { username: "Kagiso T.", avatar: "/avatar-default.png", kycStatus: "verified" }
  }
];
const CategoryIcon = ({ type, size = "w-6 h-6" }) => {
  const icon = CATEGORY_ICON_DETAILS[type] || {
    main: "\u2728",
    details: ["\u2022", "\u2022", "\u2022"]
  };
  return /* @__PURE__ */ React.createElement("div", { className: `${size} relative flex items-center justify-center` }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      animate: { y: [0, -1, 0] },
      transition: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
      className: "relative w-full h-full flex items-center justify-center"
    },
    /* @__PURE__ */ React.createElement("span", { className: "relative z-10 text-[1.25rem] leading-none select-none" }, icon.main),
    /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1.5 -right-1.5 text-[0.45rem] leading-none rounded-full bg-white shadow-sm p-0.5 border border-gray-100 select-none" }, icon.details[0]),
    /* @__PURE__ */ React.createElement("span", { className: "absolute -bottom-1.5 -left-1.5 text-[0.45rem] leading-none rounded-full bg-white shadow-sm p-0.5 border border-gray-100 select-none" }, icon.details[1])
  ));
};
class AIRecommendationEngine {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
  }
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_KEY);
      return stored ? JSON.parse(stored) : {
        viewedCategories: [],
        likedItems: [],
        priceRange: { min: 0, max: 1e4 },
        preferredLocations: [],
        interests: [],
        searchHistory: []
      };
    } catch (error) {
      return { viewedCategories: [], likedItems: [], priceRange: { min: 0, max: 1e4 }, preferredLocations: [], interests: [], searchHistory: [] };
    }
  }
  saveUserPreferences() {
    try {
      localStorage.setItem(USER_PREFERENCE_KEY, JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  }
  updatePreferences(item, action) {
    switch (action) {
      case "view":
        this.userPreferences.viewedCategories.push(item.type || item.category);
        break;
      case "like":
        this.userPreferences.likedItems.push(item._id);
        break;
      case "search":
        this.userPreferences.searchHistory.push(item);
        break;
    }
    this.saveUserPreferences();
  }
  smartFilterItems(items, userContext = {}) {
    if (!items.length) return items;
    const scores = items.map((item) => ({ item, score: this.calculateRelevanceScore(item, userContext) }));
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, AI_RECOMMENDATION_LIMIT).map((s) => s.item);
  }
  calculateRelevanceScore(item, userContext) {
    let score = 0;
    const preferences = this.userPreferences;
    if (item.price) {
      const price = Number(item.price) || Number(item.regularPrice) || 0;
      const { min, max } = preferences.priceRange;
      if (price >= min && price <= max) score += 30;
      else score -= Math.abs(price - (min + max) / 2) / 100;
    }
    if (item.address && preferences.preferredLocations.length > 0) {
      const locationMatch = preferences.preferredLocations.some((loc) => item.address.toLowerCase().includes(loc.toLowerCase()));
      if (locationMatch) score += 25;
    }
    const itemCategory = item.type || item.category;
    if (preferences.viewedCategories.includes(itemCategory)) score += 20;
    if (preferences.likedItems.includes(item._id)) score += 15;
    if (item.createdAt) {
      const daysOld = (/* @__PURE__ */ new Date() - new Date(item.createdAt)) / (1e3 * 60 * 60 * 24);
      if (daysOld < 7) score += 10 * (1 - daysOld / 7);
    }
    if (item.rating && item.rating >= 4.5) score += 5;
    return Math.max(0, score);
  }
  analyzeTrends(items) {
    const trends = { popularCategories: {}, priceTrends: {}, locationDistribution: {} };
    items.forEach((item) => {
      const category = item.type || item.category || "general";
      trends.popularCategories[category] = (trends.popularCategories[category] || 0) + 1;
      if (item.address) {
        const location = item.address.split(",")[0]?.trim();
        if (location) trends.locationDistribution[location] = (trends.locationDistribution[location] || 0) + 1;
      }
      if (item.price) {
        const priceRange = Math.floor(item.price / 1e3) * 1e3;
        trends.priceTrends[priceRange] = (trends.priceTrends[priceRange] || 0) + 1;
      }
    });
    return trends;
  }
  generatePersonalizedRecommendations(items, userContext) {
    const filtered = this.smartFilterItems(items, userContext);
    const trends = this.analyzeTrends(items);
    return { recommendations: filtered, insights: this.generateInsights(trends), suggestedCategories: this.suggestCategories(trends) };
  }
  generateInsights(trends) {
    const insights = [];
    const mostPopularCategory = Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1])[0];
    if (mostPopularCategory) insights.push({ type: "popular", text: `${mostPopularCategory[0]} properties are trending in your area`, icon: "\u{1F525}" });
    const priceRanges = Object.keys(trends.priceTrends).map(Number);
    if (priceRanges.length > 0) {
      const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;
      insights.push({ type: "price", text: `Average price in your area: R${Math.round(avgPrice).toLocaleString()}`, icon: "\u{1F4B0}" });
    }
    return insights;
  }
  suggestCategories(trends) {
    return Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category]) => category);
  }
}
const FreshaCategoryCard = ({ category, onClick, index }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRectRef = useRef(null);
  const rafRef = useRef(null);
  const onMouseEnter = (e) => {
    cardRectRef.current = e.currentTarget.getBoundingClientRect();
  };
  const onMouseMove = (e) => {
    if (!cardRectRef.current) {
      cardRectRef.current = e.currentTarget.getBoundingClientRect();
    }
    const card = cardRectRef.current;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const x = (clientX - card.left) / card.width;
      const y = (clientY - card.top) / card.height;
      setRotate({ x: (y - 0.5) * 30, y: (x - 0.5) * -30 });
    });
  };
  const onMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cardRectRef.current = null;
    setRotate({ x: 0, y: 0 });
  };
  return /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.05, duration: 0.5 },
      whileHover: {
        y: -20,
        scale: 1.08,
        rotate: [0, -1, 1, 0],
        transition: { duration: 0.3 }
      },
      whileTap: { scale: 0.94 },
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      onClick: () => onClick(category),
      style: {
        perspective: 1500,
        rotateX: rotate.x,
        rotateY: rotate.y,
        transformStyle: "preserve-3d"
      },
      className: "cursor-pointer relative overflow-hidden rounded-[3.5rem] shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.18)] transition-all duration-500 border border-gray-100"
    },
    /* @__PURE__ */ React.createElement("div", { className: "relative aspect-[4/5] overflow-hidden p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: `absolute -inset-10 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-30 blur-[4rem] transition-opacity duration-700 -z-10 animate-pulse-slow` }), /* @__PURE__ */ React.createElement(
      motion.div,
      {
        animate: {
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0]
        },
        transition: {
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut"
        },
        className: "relative z-10 w-40 h-40 flex items-center justify-center",
        style: { transform: "translateZ(100px)" }
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-white/50 backdrop-blur-xl rounded-full border border-white/80 shadow-[inset_0_0_20px_white] group-hover:scale-110 group-hover:bg-white/70 transition-all duration-700" }),
      /* @__PURE__ */ React.createElement("div", { className: "relative z-20 text-7xl drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700" }, category.emoji || "\u2728"),
      category.image.startsWith("/") && /* @__PURE__ */ React.createElement(
        "img",
        {
          loading: "lazy",
          src: category.image,
          alt: category.name,
          className: "absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
        }
      )
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-x-0 bottom-0 p-8 text-center bg-gradient-to-t from-white via-white/90 to-transparent z-40" }, /* @__PURE__ */ React.createElement("h3", { className: "text-gray-900 font-black text-xl mb-1 tracking-tight uppercase group-hover:text-rose-600 transition-colors" }, category.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-black text-gray-500 uppercase tracking-widest" }, category.count, " active"))), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" }))
  );
};
const CategoryFilter = ({ icon, label, onClick, isActive }) => /* @__PURE__ */ React.createElement(
  motion.button,
  {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    onClick,
    className: `flex flex-col items-center gap-2 min-w-[64px] pb-3 border-b-2 transition-all duration-200 ${isActive ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"}`
  },
  /* @__PURE__ */ React.createElement("span", { className: "text-2xl filter grayscale hover:grayscale-0 transition-all" }, icon),
  /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium whitespace-nowrap" }, label)
);
const SectionTitle = ({ title, actionText, onAction }) => /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-end mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-[22px] font-semibold text-gray-900 tracking-tight" }, title), actionText && /* @__PURE__ */ React.createElement("button", { onClick: onAction, className: "text-sm font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors" }, actionText));
const EliteHelperCard = ({ helper, onClick }) => {
  const formatPrice = () => {
    return `R${helper.regularPrice}`;
  };
  return /* @__PURE__ */ React.createElement(
    motion.div,
    {
      whileHover: { y: -4 },
      onClick,
      className: "cursor-pointer flex flex-col gap-2 "
    },
    /* @__PURE__ */ React.createElement("div", { className: "home-image-card relative aspect-[4/3] overflow-hidden rounded-2xl mx-0 bg-gray-100 ring-1 ring-black/5" }, /* @__PURE__ */ React.createElement(
      ImageGallery,
      {
        imageUrls: helper.imageUrls || [],
        alt: helper.name,
        type: "avatar",
        className: "home-media-gallery"
      }
    ), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 z-[15] bg-gradient-to-t from-slate-950/50 via-slate-950/12 to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-3 left-3 bg-white/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/30 z-20" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-white uppercase tracking-widest" }, helper.type || "Helper"))),
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-col pt-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-[15px] text-gray-900 truncate" }, helper.address || "South Africa")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 shrink-0" }, /* @__PURE__ */ React.createElement(StarIconSolid, { className: "w-3.5 h-3.5 text-gray-950" }), /* @__PURE__ */ React.createElement("span", { className: "text-[14px] font-medium text-gray-950 flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, (helper.rating || 0).toFixed(1)), /* @__PURE__ */ React.createElement("span", { className: "text-gray-500 font-normal text-[12px]" }, "(", helper.comments?.length || 0, ")")))), /* @__PURE__ */ React.createElement("p", { className: "text-[14px] text-gray-500 truncate" }, helper.name), /* @__PURE__ */ React.createElement("div", { className: "mt-1 flex items-baseline gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[15px] font-bold text-gray-900" }, formatPrice())))
  );
};
const EliteCard = ({ item, onClick, type = "property", reducedSize = false }) => {
  const formatPrice = () => {
    const price = item.price || item.regularPrice;
    if (type === "property" && (item.type === "sale" || item.type === "land")) {
      return `R${price?.toLocaleString()}`;
    }
    return `R${price}`;
  };
  const getPriceSuffix = () => {
    if (type !== "property") return "";
    if (item?.pricePeriod === "night") return "/ night";
    if (item?.pricePeriod === "day") return "/ day";
    if (item?.pricePeriod === "hour") return "/ hour";
    if (item?.pricePeriod === "month") return "/ month";
    if (item?.kind === "house" || item?.kind === "apartment") return "/ day";
    switch (item.type) {
      case "rent":
        return "/ month";
      case "over":
        return "/ night";
      case "sale":
        return "";
      case "office":
        return "/ hour";
      case "land":
        return "";
      default:
        return item.type?.includes("rent") ? "/ month" : "";
    }
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => onClick(item._id ? `/${type}/${item._id}` : "#"),
      className: "cursor-pointer flex flex-col bg-white w-full rounded-[2rem] overflow-hidden shadow-lg relative border border-gray-200/80 hover:border-rose-500/50 transition-all"
    },
    /* @__PURE__ */ React.createElement("div", { className: "home-image-card relative aspect-[4/3] overflow-hidden bg-gray-50" }, /* @__PURE__ */ React.createElement(
      ImageGallery,
      {
        imageUrls: [...Array.isArray(item.imageUrls) ? item.imageUrls : [], item.image, item.images?.[0]].filter(Boolean),
        alt: item.name || "Marketplace listing",
        type: type === "property" ? item.type?.includes("rent") ? "rent" : item.type?.includes("sale") ? "sale" : "property" : type,
        className: "brightness-90 saturate-90"
      }
    ), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 right-4 flex justify-between items-start z-20" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-white uppercase tracking-widest" }, type)), /* @__PURE__ */ React.createElement("button", { className: "p-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 hover:bg-rose-500 hover:border-rose-500 transition-colors group/heart shadow-sm" }, /* @__PURE__ */ React.createElement(HeartIcon, { className: "w-4 h-4 text-gray-700 group-hover:text-white" })))),
    /* @__PURE__ */ React.createElement("div", { className: "p-5 flex flex-col justify-end bg-white border-t border-gray-50" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-end gap-2 mb-1" }, /* @__PURE__ */ React.createElement("h3", { className: "font-black text-gray-950 text-base leading-tight line-clamp-1" }, item.address || "South Africa"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 shrink-0 bg-gray-100 px-2 py-0.5 rounded-md" }, /* @__PURE__ */ React.createElement(StarIconSolid, { className: "w-3 h-3 text-amber-500" }), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-black text-gray-700" }, (item.rating || 0).toFixed(1)))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 font-medium line-clamp-1 mb-2" }, item.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-1 mt-1 bg-rose-50/50 w-fit px-3 py-1 rounded-lg border border-rose-100/30" }, /* @__PURE__ */ React.createElement("span", { className: "text-base font-black text-rose-600" }, formatPrice()), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-500 font-bold uppercase tracking-wider" }, getPriceSuffix())))
  );
};
const AirbnbDiscoverSection = ({ title, items, type, navigate, actionText, onAction }) => {
  return /* @__PURE__ */ React.createElement("section", { className: "mb-20" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-end mb-8" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase" }, "Discovery Engine")), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-black text-gray-950 tracking-tighter leading-none" }, title)), actionText && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onAction,
      className: "text-xs font-black text-rose-500 uppercase tracking-widest border-b border-rose-500/20 hover:border-rose-500 transition-all text-[11px]"
    },
    actionText
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0" }, items.map((item, idx) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: item._id || idx,
      initial: { opacity: 0, x: 50 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, amount: 0.1 },
      transition: { delay: idx * 0.1, duration: 0.8, ease: "easeOut" },
      className: "snap-start shrink-0 w-[160px] md:w-[200px]"
    },
    /* @__PURE__ */ React.createElement(
      AirbnbCard,
      {
        item,
        type,
        onClick: (path) => navigate(path),
        reducedSize: true
      }
    )
  ))));
};
const StatusCard = ({ request, onLike, onDislike, currentUser, navigate }) => {
  const isLiked = currentUser && request.likes?.includes(currentUser._id);
  const isDisliked = currentUser && request.dislikes?.includes(currentUser._id);
  return /* @__PURE__ */ React.createElement(
    motion.div,
    {
      whileHover: { y: -5 },
      whileTap: { scale: 0.98 },
      onClick: () => navigate(`/looking-for?id=${request._id}`),
      className: "p-6 flex flex-col gap-5 h-full cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 p-0.5 shadow-sm" }, /* @__PURE__ */ React.createElement(
      ImageWithFallback,
      {
        src: request.userRef?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        alt: "user",
        type: "avatar",
        className: "w-full h-full rounded-lg"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-black text-gray-900 text-[13px] leading-tight truncate w-32" }, request.userRef?.username || "Neighbor"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mt-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-[9px] text-gray-400 font-black uppercase tracking-widest" }, request.category)))), /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100" }, request.category === "roommate" ? "\u{1F464}" : request.category === "nanny" ? "\u{1F37C}" : request.category === "pampering" ? "\u{1F484}" : "\u2728")),
    /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("h4", { className: "font-black text-gray-900 text-sm leading-tight" }, request.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 opacity-60" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400 font-black uppercase tracking-widest" }, request.location))),
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-[13px] leading-relaxed line-clamp-3 flex-grow font-medium" }, request.description),
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3 pt-4 border-t border-gray-50 mt-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm" }, /* @__PURE__ */ React.createElement(PhoneIcon, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-black tracking-widest" }, request.contact || "Not provided")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-end" }, /* @__PURE__ */ React.createElement("span", { className: "text-[9px] text-rose-400 font-black uppercase tracking-widest mb-0.5" }, "Bid Price"), /* @__PURE__ */ React.createElement("div", { className: "text-[12px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100 shadow-sm" }, request.budget ? `R${request.budget.toLocaleString()}` : "OPEN BID"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pt-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(
      motion.button,
      {
        whileTap: { scale: 0.8 },
        onClick: (e) => {
          e.stopPropagation();
          onLike(request._id);
        },
        className: `flex items-center gap-1.5 transition-all ${isLiked ? "text-rose-500" : "text-gray-400 hover:text-gray-900"}`
      },
      isLiked ? /* @__PURE__ */ React.createElement(HandThumbUpIconSolid, { className: "w-5 h-5" }) : /* @__PURE__ */ React.createElement(HandThumbUpIcon, { className: "w-5 h-5" }),
      /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black" }, request.likes?.length || 0)
    ), /* @__PURE__ */ React.createElement(
      motion.button,
      {
        whileTap: { scale: 0.8 },
        onClick: (e) => {
          e.stopPropagation();
          onDislike(request._id);
        },
        className: `flex items-center gap-1.5 transition-all ${isDisliked ? "text-gray-900" : "text-gray-400 hover:text-gray-900"}`
      },
      isDisliked ? /* @__PURE__ */ React.createElement(HandThumbDownIconSolid, { className: "w-5 h-5" }) : /* @__PURE__ */ React.createElement(HandThumbDownIcon, { className: "w-5 h-5" }),
      /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black" }, request.dislikes?.length || 0)
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          window.open(`https://wa.me/${request.contact}`);
        },
        className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 "
      },
      /* @__PURE__ */ React.createElement(ChatBubbleOvalLeftEllipsisIcon, { className: "w-5 h-5 group-hover:scale-110 transition-transform" }),
      /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black uppercase tracking-widest" }, "Chat")
    )))
  );
};
const CommunityNeedsSection = () => null;
const FOOD_INGREDIENT_ICONS = {
  "sweet potato": "\u{1F360}",
  "sweet potatoes": "\u{1F360}",
  sweetpotato: "\u{1F360}",
  sweetpotatoes: "\u{1F360}",
  potato: "\u{1F954}",
  potatoes: "\u{1F954}",
  spud: "\u{1F954}",
  spuds: "\u{1F954}",
  spinach: "\u{1F96C}",
  morogo: "\u{1F96C}",
  marog: "\u{1F96C}",
  beets: "\u{1F957}",
  beetroot: "\u{1F957}",
  beet: "\u{1F957}",
  cabbage: "\u{1F96C}",
  pumpkin: "\u{1F383}",
  butternut: "\u{1F383}",
  squash: "\u{1F383}",
  chakalaka: "\u{1F336}\uFE0F",
  chaka: "\u{1F336}\uFE0F",
  chips: "\u{1F35F}",
  fries: "\u{1F35F}",
  cheese: "\u{1F9C0}",
  egg: "\u{1F95A}",
  eggs: "\u{1F95A}",
  vienna: "\u{1F32D}",
  russian: "\u{1F32D}",
  sausage: "\u{1F32D}",
  wors: "\u{1F32D}",
  boerewors: "\u{1F32D}",
  polony: "\u{1F953}",
  chicken: "\u{1F357}",
  beef: "\u{1F969}",
  steak: "\u{1F969}",
  ribs: "\u{1F356}",
  pork: "\u{1F356}",
  lamb: "\u{1F356}",
  mince: "\u{1F969}",
  bread: "\u{1F35E}",
  loaf: "\u{1F35E}",
  roll: "\u{1F35E}",
  pap: "\u{1F35A}",
  rice: "\u{1F35A}",
  corn: "\u{1F33D}",
  tomato: "\u{1F345}",
  onion: "\u{1F9C5}",
  atchar: "\u{1F96D}",
  chutney: "\u{1F96D}",
  sauce: "\u{1F96B}",
  gravy: "\u{1F372}",
  coleslaw: "\u{1F957}",
  salad: "\u{1F957}",
  lettuce: "\u{1F96C}",
  bbq: "\u{1F525}",
  spice: "\u{1F336}\uFE0F",
  herb: "\u{1F33F}",
  oil: "\u{1FAD9}",
  butter: "\u{1F9C8}",
  cream: "\u{1F95B}",
  dressing: "\u{1FAD9}",
  croutons: "\u{1F35E}",
  parmesan: "\u{1F9C0}"
};
const FOOD_INGREDIENT_ITEMS = [
  { id: "sweet_potato", words: ["sweet potato", "sweet potatoes", "sweetpotato", "sweetpotatoes"], name: "Sweet Potato", icon: "\u{1F360}", bg: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200 border-orange-200 dark:border-orange-800" },
  { id: "potato", words: ["potato", "potatoes", "spud", "spuds"], name: "Potatoes", icon: "\u{1F954}", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200 dark:border-amber-800" },
  { id: "spinach", words: ["spinach", "morogo", "marog"], name: "Spinach", icon: "\u{1F96C}", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800" },
  { id: "beets", words: ["beet", "beets", "beetroot", "beetroots"], name: "Beets", icon: "\u{1F957}", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border-rose-200 dark:border-rose-800" },
  { id: "cabbage", words: ["cabbage"], name: "Cabbage", icon: "\u{1F96C}", bg: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200 border-green-200 dark:border-green-800" },
  { id: "pumpkin", words: ["pumpkin", "butternut", "squash"], name: "Pumpkin", icon: "\u{1F383}", bg: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-800" },
  { id: "chakalaka", words: ["chakalaka", "chaka", "chakalac"], name: "Chakalaka", icon: "\u{1F336}\uFE0F", bg: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 border-red-200 dark:border-red-800" },
  { id: "pap", words: ["pap", "sadza", "phutu"], name: "Pap", icon: "\u{1F35A}", bg: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700" },
  { id: "beef", words: ["beef", "steak", "mince"], name: "Beef", icon: "\u{1F969}", bg: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 border-red-200 dark:border-red-800" },
  { id: "chicken", words: ["chicken", "wings"], name: "Chicken", icon: "\u{1F357}", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200 dark:border-amber-800" },
  { id: "wors", words: ["wors", "boerewors", "sausage", "russian", "vienna"], name: "Wors / Sausage", icon: "\u{1F32D}", bg: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200 border-orange-200 dark:border-orange-800" },
  { id: "cheese", words: ["cheese"], name: "Cheese", icon: "\u{1F9C0}", bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800" },
  { id: "egg", words: ["egg", "eggs"], name: "Egg", icon: "\u{1F95A}", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200 dark:border-amber-800" },
  { id: "chips", words: ["chips", "fries"], name: "Chips", icon: "\u{1F35F}", bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800" },
  { id: "atchar", words: ["atchar", "achar"], name: "Atchar", icon: "\u{1F96D}", bg: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200 border-orange-200 dark:border-orange-800" },
  { id: "gravy", words: ["gravy", "sauce"], name: "Gravy / Sauce", icon: "\u{1F372}", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200 dark:border-amber-800" },
  { id: "salad", words: ["salad", "lettuce"], name: "Salad", icon: "\u{1F957}", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800" }
];
export const HOMEPAGE_FOOD_SIDES = [
  { id: "chakalaka", name: "Chakalaka", icon: "\u{1F336}\uFE0F", desc: "Spicy veg relish" },
  { id: "potato", name: "Potatoes", icon: "\u{1F954}", desc: "Seasoned / Mashed" },
  { id: "spinach", name: "Spinach", icon: "\u{1F96C}", desc: "Braised morogo" },
  { id: "sweet_potato", name: "Sweet Potato", icon: "\u{1F360}", desc: "Roasted sweet spud" },
  { id: "beets", name: "Beets", icon: "\u{1F957}", desc: "Pickled beetroot" },
  { id: "cabbage", name: "Cabbage", icon: "\u{1F96C}", desc: "Steamed cabbage" },
  { id: "pumpkin", name: "Pumpkin", icon: "\u{1F383}", desc: "Braised pumpkin" },
  { id: "atchar", name: "Atchar", icon: "\u{1F96D}", desc: "Spicy mango atchar" },
  { id: "pap", name: "Pap", icon: "\u{1F35A}", desc: "Fluffy white pap" },
  { id: "salad", name: "Green Salad", icon: "\u{1F957}", desc: "Crisp green salad" }
];
const POPULAR_REQUEST_SUGGESTIONS = [
  { id: "potato", name: "Potatoes", icon: "\u{1F954}" },
  { id: "sweet_potato", name: "Sweet Potato", icon: "\u{1F360}" },
  { id: "spinach", name: "Spinach", icon: "\u{1F96C}" },
  { id: "beets", name: "Beets", icon: "\u{1F957}" },
  { id: "cabbage", name: "Cabbage", icon: "\u{1F96C}" },
  { id: "pumpkin", name: "Pumpkin", icon: "\u{1F383}" },
  { id: "chakalaka", name: "Chakalaka", icon: "\u{1F336}\uFE0F" }
];
export const isFoodImageUrl = (val) => {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (/OIP(?:[_-][^/?#.]*)?\.(?:png|jpe?g|webp)(?:[?#]|$)/i.test(trimmed) || /close-up-traditional-african-bread-based-street-food-called-bunny-chow/i.test(trimmed)) return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/uploads/") || trimmed.startsWith("/") || trimmed.startsWith("data:image/");
};
export const resolveSmartFoodEmoji = (name = "", fallback = "\u{1F371}") => {
  const n = String(name || "").toLowerCase();
  if (n.includes("kota") || n.includes("kots") || n.includes("quarter") || n.includes("sphatlo") || n.includes("sandwich") || n.includes("dagwood")) return "\u{1F96A}";
  if (n.includes("burger") || n.includes("patty") || n.includes("cheeseburger")) return "\u{1F354}";
  if (n.includes("pizza") || n.includes("slice")) return "\u{1F355}";
  if (n.includes("wing") || n.includes("chicken") || n.includes("drumstick")) return "\u{1F357}";
  if (n.includes("chip") || n.includes("fries") || n.includes("slap chips")) return "\u{1F35F}";
  if (n.includes("wrap") || n.includes("shawarma") || n.includes("burrito")) return "\u{1F32F}";
  if (n.includes("drink") || n.includes("coke") || n.includes("soda") || n.includes("juice") || n.includes("beverage")) return "\u{1F964}";
  if (n.includes("steak") || n.includes("beef") || n.includes("ribs") || n.includes("pork") || n.includes("wors") || n.includes("braai")) return "\u{1F969}";
  if (n.includes("fish") || n.includes("hake") || n.includes("seafood")) return "\u{1F41F}";
  if (n.includes("pap") || n.includes("stew") || n.includes("curry") || n.includes("mogodu") || n.includes("mala") || n.includes("samp")) return "\u{1F372}";
  if (n.includes("salad") || n.includes("greens") || n.includes("veg")) return "\u{1F957}";
  if (n.includes("cake") || n.includes("dessert") || n.includes("ice cream") || n.includes("waffle")) return "\u{1F370}";
  return typeof fallback === "string" && fallback.length <= 4 && !fallback.startsWith("/") && !fallback.startsWith("http") ? fallback : "\u{1F371}";
};
export const resolveFoodPhoto = (name = "", fallbackUrl = "") => {
  const n = String(name || "").toLowerCase();
  if (n.includes("rib") || n.includes("pork") || n.includes("bbq") || n.includes("flame")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("kota") || n.includes("kots") || n.includes("quarter") || n.includes("sphatlo") || n.includes("sandwich") || n.includes("dagwood") || n.includes("bunny")) {
    return "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("burger") || n.includes("patty") || n.includes("cheeseburger") || n.includes("smash")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("steak") || n.includes("beef") || n.includes("braai") || n.includes("t-bone") || n.includes("wors") || n.includes("boerewors") || n.includes("meat")) {
    return "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("chicken") || n.includes("wing") || n.includes("drumstick") || n.includes("poultry")) {
    return "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("chip") || n.includes("fries") || n.includes("slap chips") || n.includes("potato")) {
    return "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("pap") || n.includes("stew") || n.includes("curry") || n.includes("mogodu") || n.includes("mala") || n.includes("samp") || n.includes("soup")) {
    return "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("salad") || n.includes("greens") || n.includes("veg") || n.includes("caesar")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("wrap") || n.includes("shawarma") || n.includes("burrito") || n.includes("roll") || n.includes("taco")) {
    return "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("pizza") || n.includes("slice")) {
    return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("fish") || n.includes("hake") || n.includes("seafood") || n.includes("calamari")) {
    return "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("drink") || n.includes("coke") || n.includes("soda") || n.includes("juice") || n.includes("smoothie") || n.includes("beverage")) {
    return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80";
  }
  if (n.includes("cake") || n.includes("dessert") || n.includes("ice cream") || n.includes("waffle") || n.includes("pastry")) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80";
  }
  return fallbackUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
};
export const resolveShopPhoto = (name = "") => {
  const n = String(name || "").toLowerCase();
  if (n.includes("grill") || n.includes("bbq") || n.includes("braai")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("green") || n.includes("salad") || n.includes("table")) {
    return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80";
  }
  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80";
};
export const FoodMedia = ({ src, alt = "Food", fallback = "\u{1F371}", className = "", imgClassName = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  useEffect(() => {
    setHasError(false);
    setFallbackFailed(false);
  }, [src]);
  const isShop = fallback === "\u{1F3EA}" || String(alt || "").toLowerCase().includes("shop");
  const effectiveSrc = !hasError && isFoodImageUrl(src) ? src.trim() : "";
  if (fallbackFailed || !effectiveSrc) {
    return /* @__PURE__ */ React.createElement("div", { role: "img", "aria-label": alt || "Image unavailable", className: `flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl dark:from-slate-800 dark:to-slate-900 ${className}` }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, isShop ? "\u{1F3EA}" : resolveSmartFoodEmoji(alt, fallback)));
  }
  return /* @__PURE__ */ React.createElement(
    "img",
    {
      src: resolveApiUrl(effectiveSrc),
      alt: alt || "Food",
      onError: () => {
        if (!hasError) setHasError(true);
        else setFallbackFailed(true);
      },
      className: `w-full h-full object-cover ${imgClassName}`,
      loading: "lazy"
    }
  );
};
const detectFoodItemsInText = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const normalized = ` ${text.toLowerCase()} `;
  const detected = [];
  const hasSweetPotato = /\bsweet\s*potato(es)?\b/i.test(normalized);
  if (hasSweetPotato) {
    const sp = FOOD_INGREDIENT_ITEMS.find((it) => it.id === "sweet_potato");
    if (sp) detected.push(sp);
  }
  const textWithoutSweetPotato = normalized.replace(/\bsweet\s*potato(es)?\b/gi, " ");
  const hasPotato = /\b(potato|potatoes|spud|spuds)\b/i.test(textWithoutSweetPotato);
  if (hasPotato) {
    const pot = FOOD_INGREDIENT_ITEMS.find((it) => it.id === "potato");
    if (pot) detected.push(pot);
  }
  FOOD_INGREDIENT_ITEMS.forEach((item) => {
    if (item.id === "sweet_potato" || item.id === "potato") return;
    const matched = item.words.some((w) => {
      const regex = new RegExp(`\\b${w}\\b`, "i");
      return regex.test(normalized);
    });
    if (matched) detected.push(item);
  });
  return detected;
};
const foodIngredientIcon = (ingredient = "") => {
  const normalized = ingredient.toLowerCase();
  const entry = Object.entries(FOOD_INGREDIENT_ICONS).sort(([a], [b]) => b.length - a.length).find(([word]) => normalized.includes(word));
  return entry?.[1] || "\u{1F37D}\uFE0F";
};
const resolveShopCoords = (item = {}) => {
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 ? { latitude, longitude } : null;
};
const getAccurateDistanceLabel = (item, userCoords) => {
  if (!item) return null;
  const shopCoords = resolveShopCoords(item);
  if (!shopCoords) return null;
  if (userCoords && typeof userCoords.latitude === "number" && typeof userCoords.longitude === "number") {
    const dist = calculateDistance(userCoords.latitude, userCoords.longitude, shopCoords.latitude, shopCoords.longitude);
    if (Number.isFinite(dist)) {
      if (dist < 0.1) return "Under 100 m";
      if (dist < 1) return `${Math.round(dist * 1e3)} m away`;
      return `${dist.toFixed(1)} km away`;
    }
  }
  return null;
};
const FoodDetailModal = ({ item, onClose, navigate, cart = [], cartMeta, onAddToCart, onUpdateCartMeta, shopSiblings = [], onSiblingSelect }) => {
  const [modalStep, setModalStep] = useState("order");
  const [orderForm, setOrderForm] = useState(() => ({
    name: cartMeta?.name || "",
    phone: cartMeta?.phone || "",
    qty: 1,
    notes: "",
    fulfilment: cartMeta?.fulfilment || "pickup",
    deliveryAddress: cartMeta?.deliveryAddress || ""
  }));
  const [orderStatus, setOrderStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  const [gpsRequested, setGpsRequested] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const { coords, city: gpsCity, error: gpsError, loading: gpsLoading, requestLocation } = useLocationCoords();
  const [selectedDrinks, setSelectedDrinks] = useState({});
  const accurateDistance = useMemo(() => getAccurateDistanceLabel(item, coords), [item, coords]);
  const detectedDescFoods = useMemo(() => detectFoodItemsInText(item?.description), [item?.description]);
  const detectedNotesFoods = useMemo(() => detectFoodItemsInText(orderForm.notes), [orderForm.notes]);
  const availableSides = useMemo(() => {
    return [...new Set((Array.isArray(item?.sides) ? item.sides : []).map((side) => String(side).trim()).filter(Boolean))].map((side) => ({ id: side.toLowerCase().replace(/\s+/g, "_"), name: side, icon: "\u{1F957}" }));
  }, [item?.sides]);
  const requiredSidesCount = Math.min(3, availableSides.length);
  const availableDrinks = useMemo(() => (Array.isArray(item?.addOns) ? item.addOns : []).filter((addOn) => addOn?.name && Number.isFinite(Number(addOn.price)) && Number(addOn.price) >= 0).map((addOn, index) => ({ id: `${addOn.name}-${index}`, name: addOn.name, price: Number(addOn.price), icon: "\u{1F964}" })), [item?.addOns]);
  const [selectedSides, setSelectedSides] = useState(() => {
    return (Array.isArray(item?.sides) ? item.sides : []).slice(0, 3).map((side) => String(side).toLowerCase().replace(/\s+/g, "_"));
  });
  const [validationNotice, setValidationNotice] = useState("");
  useEffect(() => {
    setSelectedSides(availableSides.slice(0, 3).map((side) => side.id));
    setSelectedDrinks({});
    setValidationNotice("");
  }, [item?.id, availableSides]);
  const handleToggleSide = (sideId) => {
    setSelectedSides((prev) => {
      if (prev.includes(sideId)) {
        setValidationNotice("");
        return prev.filter((id) => id !== sideId);
      }
      if (prev.length >= requiredSidesCount) {
        setValidationNotice(`This meal includes ${requiredSidesCount} side${requiredSidesCount === 1 ? "" : "s"}. Tap a selected side to change it.`);
        return prev;
      }
      setValidationNotice("");
      return [...prev, sideId];
    });
  };
  const selectedSideObjects = useMemo(() => {
    return selectedSides.map((id) => availableSides.find((side) => side.id === id)).filter(Boolean);
  }, [selectedSides, availableSides]);
  const selectedSideNames = useMemo(() => {
    return selectedSideObjects.map((s) => s.name);
  }, [selectedSideObjects]);
  const handleToggleDrink = (drinkId) => {
    setSelectedDrinks((prev) => {
      const current = prev[drinkId] || 0;
      return { ...prev, [drinkId]: current > 0 ? 0 : 1 };
    });
  };
  const handleUpdateDrinkQty = (drinkId, delta) => {
    setSelectedDrinks((prev) => {
      const current = prev[drinkId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [drinkId]: next };
    });
  };
  const drinksList = useMemo(() => {
    return Object.entries(selectedDrinks).filter(([_, qty]) => qty > 0).map(([id, qty]) => {
      const found = availableDrinks.find((drink) => drink.id === id);
      return found ? { ...found, qty } : null;
    }).filter(Boolean);
  }, [selectedDrinks, availableDrinks]);
  const drinksTotal = useMemo(() => {
    return drinksList.reduce((sum, d) => sum + d.price * d.qty, 0);
  }, [drinksList]);
  const itemTotal = item ? item.price * orderForm.qty : 0;
  const currentItemGrandTotal = itemTotal + drinksTotal;
  const cartItemsGrandTotal = useMemo(() => {
    return cart.reduce((sum, ci) => {
      const foodPrice = ci.item.price * ci.qty;
      const drinksPrice = ci.drinks ? ci.drinks.reduce((ds, d) => ds + d.price * (d.qty || 1), 0) : 0;
      return sum + foodPrice + drinksPrice;
    }, 0);
  }, [cart]);
  const allOrdersGrandTotal = cartItemsGrandTotal + currentItemGrandTotal;
  const collectionEstimate = useMemo(() => {
    let baseMins = 15;
    if (item?.prepTime) {
      const parsed = parseInt(String(item.prepTime).replace(/\D+/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0) baseMins = parsed;
    }
    if (orderForm.fulfilment === "delivery") {
      const minMins2 = baseMins + 15;
      const maxMins2 = baseMins + 30;
      return {
        label: "Estimated Delivery Time",
        durationText: `${minMins2}\u2013${maxMins2} mins`,
        minMins: minMins2,
        maxMins: maxMins2,
        isDelivery: true
      };
    }
    const minMins = Math.max(10, baseMins);
    const maxMins = minMins + 10;
    return {
      label: "Estimated Collection Time",
      durationText: `${minMins}\u2013${maxMins} mins`,
      minMins,
      maxMins,
      isDelivery: false
    };
  }, [item?.prepTime, orderForm.fulfilment]);
  const estimatedWindow = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const tMin = new Date(now.getTime() + collectionEstimate.minMins * 6e4);
    const tMax = new Date(now.getTime() + collectionEstimate.maxMins * 6e4);
    const formatTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${formatTime(tMin)} \u2013 ${formatTime(tMax)}`;
  }, [collectionEstimate]);
  useEffect(() => {
    if (!gpsRequested || !coords) return;
    const coordinates = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    setOrderForm((form) => ({
      ...form,
      deliveryAddress: form.deliveryAddress || `${gpsCity || "Current GPS location"} (${coordinates})`
    }));
  }, [coords, gpsCity, gpsRequested]);
  if (!item) return null;
  const emoji = !item.image || item.image.startsWith("http") || item.image.startsWith("/") ? "\u{1F371}" : item.image;
  const validateForm = () => {
    if (!orderForm.name.trim()) {
      setValidationNotice("\u26A0\uFE0F Please enter your full name.");
      return false;
    }
    if (!orderForm.phone.trim()) {
      setValidationNotice("\u26A0\uFE0F Please enter your contact phone number.");
      return false;
    }
    if (orderForm.fulfilment === "delivery" && !orderForm.deliveryAddress.trim()) {
      setValidationNotice("\u26A0\uFE0F Please enter your delivery address.");
      return false;
    }
    if (selectedSides.length !== requiredSidesCount) {
      setValidationNotice(`Please select ${requiredSidesCount} side${requiredSidesCount === 1 ? "" : "s"} offered with this meal.`);
      return false;
    }
    setValidationNotice("");
    return true;
  };
  const handleProceedToViewOrder = () => {
    if (!validateForm()) return;
    onUpdateCartMeta?.({
      name: orderForm.name.trim(),
      phone: orderForm.phone.trim(),
      fulfilment: orderForm.fulfilment,
      deliveryAddress: orderForm.deliveryAddress.trim()
    });
    setModalStep("review");
  };
  const handleAddMore = () => {
    if (!validateForm()) return;
    onUpdateCartMeta?.({
      name: orderForm.name.trim(),
      phone: orderForm.phone.trim(),
      fulfilment: orderForm.fulfilment,
      deliveryAddress: orderForm.deliveryAddress.trim()
    });
    onAddToCart?.({
      item,
      qty: orderForm.qty,
      sideNames: selectedSideNames,
      drinks: drinksList
    });
    onClose();
  };
  const handleFinalOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      setModalStep("order");
      return;
    }
    setOrderStatus("submitting");
    setErrorMsg("");
    const recordLocalOrder = (finalCode, orderData) => {
      try {
        const newOrderRecord = {
          id: finalCode,
          _id: finalCode,
          orderCode: finalCode,
          shopId: item.shopId,
          shopName: item.shopName || "Local Kitchen",
          shopImage: item.shopImage || "\u{1F372}",
          shopPhone: item.shopPhone || "",
          items: (orderData.items || []).map((orderedItem) => ({
            name: orderedItem.name,
            qty: orderedItem.quantity,
            price: orderedItem.price * orderedItem.quantity,
            sides: orderedItem.sides || [],
            drinks: orderedItem.addOns || []
          })),
          fulfilment: orderForm.fulfilment,
          deliveryAddress: orderForm.deliveryAddress.trim(),
          totalAmount: Number(orderData.total),
          status: "received",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const existing = JSON.parse(localStorage.getItem("loopout_food_orders") || "[]");
        localStorage.setItem("loopout_food_orders", JSON.stringify([newOrderRecord, ...existing.slice(0, 49)]));
      } catch {
      }
    };
    try {
      const allItems = [
        ...cart.map((ci) => ({ id: ci.item.id, quantity: ci.qty, sides: ci.sideNames || [], addOns: (ci.drinks || []).map((drink) => ({ name: drink.name, quantity: drink.qty || 1 })) })),
        { id: item.id, quantity: orderForm.qty, sides: selectedSideNames, addOns: drinksList.map((drink) => ({ name: drink.name, quantity: drink.qty || 1 })) }
      ];
      const allDrinks = [
        ...cart.flatMap((ci) => ci.drinks || []),
        ...drinksList
      ];
      const drinksSummary = allDrinks.length > 0 ? `Drinks: ${allDrinks.map((d) => `${d.name} x${d.qty}`).join(", ")}` : "";
      const allSides = [.../* @__PURE__ */ new Set([...cart.flatMap((ci) => ci.sideNames || []), ...selectedSideNames])];
      const sidesSummary = selectedSideNames.length ? `Sides: ${selectedSideNames.join(", ")}` : "";
      const combinedNotes = [
        sidesSummary,
        drinksSummary,
        orderForm.notes.trim() ? `Notes: ${orderForm.notes.trim()}` : ""
      ].filter(Boolean).join(" | ");
      const res = await authenticatedFetch("/api/lunch/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: item.shopId,
          items: allItems,
          customerName: orderForm.name.trim(),
          customerPhone: orderForm.phone.trim(),
          fulfilment: orderForm.fulfilment,
          deliveryAddress: orderForm.deliveryAddress.trim(),
          deliveryNotes: combinedNotes,
          orderComments: combinedNotes,
          selectedSides: allSides
        })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (!data.orderCode) throw new Error("The server did not confirm this food order. Please try again.");
        const code = data.orderCode;
        setOrderId(code);
        recordLocalOrder(code, data);
        setOrderStatus("success");
        setModalStep("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || "Could not place order. Please try again.");
        setOrderStatus("error");
      }
    } catch (error) {
      setErrorMsg(error.message || "Could not connect to food ordering. Your order was not submitted.");
      setOrderStatus("error");
    }
  };
  return /* @__PURE__ */ React.createElement(AnimatePresence, null, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: "food-modal-backdrop",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[200] flex items-end sm:items-center justify-center",
      onClick: orderStatus !== "submitting" ? onClose : void 0
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }),
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: "food-modal-sheet",
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
        transition: { type: "spring", damping: 28, stiffness: 300 },
        onClick: (e) => e.stopPropagation(),
        className: "app-bottom-sheet relative z-10 w-full max-w-md mx-0 sm:mx-4 bg-white dark:bg-gray-950 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-center pt-2.5 pb-1 sm:hidden shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" })),
      modalStep === "success" ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-5 px-6 py-10 text-center overflow-y-auto" }, /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { scale: 0, rotate: -20 },
          animate: { scale: 1, rotate: 0 },
          transition: { type: "spring", damping: 12, stiffness: 220 },
          className: "w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30"
        },
        "\u{1F389}"
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1" }, "Order Confirmed"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-black text-gray-900 dark:text-white leading-tight" }, "Order Placed!"), orderId && /* @__PURE__ */ React.createElement("div", { className: "inline-block mt-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-mono font-black text-amber-800 dark:text-amber-300" }, "#", orderId), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3 max-w-xs mx-auto" }, /* @__PURE__ */ React.createElement("strong", { className: "text-gray-800 dark:text-gray-200" }, item.shopName), " has received your order. They will contact you on ", /* @__PURE__ */ React.createElement("strong", { className: "text-gray-800 dark:text-gray-200" }, orderForm.phone), " when ready.")), /* @__PURE__ */ React.createElement("div", { className: "w-full p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/80 flex items-center gap-3 text-left shadow-xs" }, /* @__PURE__ */ React.createElement("div", { className: "w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0 select-none" }, "\u23F1\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300" }, collectionEstimate.label), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-black text-gray-900 dark:text-white truncate" }, "Ready in ~", collectionEstimate.durationText), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-600 dark:text-gray-400 mt-0.5" }, orderForm.fulfilment === "delivery" ? `Delivery expected around ${estimatedWindow}.` : `Please collect your fresh order at ${item.shopName} between ${estimatedWindow}.`))), /* @__PURE__ */ React.createElement("div", { className: "w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-left flex flex-col gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs font-black" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-900 dark:text-white" }, item.name, " \xD7 ", orderForm.qty), /* @__PURE__ */ React.createElement("span", { className: "text-gray-900 dark:text-white" }, "R", itemTotal.toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-gray-500 flex flex-wrap gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-amber-700 dark:text-amber-400" }, "Sides:"), " ", selectedSideNames.join(", ")), drinksList.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-gray-500 flex flex-wrap gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-rose-600 dark:text-rose-400" }, "Drinks:"), " ", drinksList.map((d) => `${d.name} x${d.qty}`).join(", ")), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-black" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-500 uppercase" }, "Fulfilment"), /* @__PURE__ */ React.createElement("span", { className: "text-emerald-600 dark:text-emerald-400" }, orderForm.fulfilment === "delivery" ? "\u{1F6F5} Delivery" : "\u{1F3EA} Counter Collection")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-sm font-black pt-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-900 dark:text-white" }, "Total Amount"), /* @__PURE__ */ React.createElement("span", { className: "text-amber-600 dark:text-amber-400" }, "R", allOrdersGrandTotal.toFixed(2)))), /* @__PURE__ */ React.createElement("div", { className: "w-full flex flex-col gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            onClose();
            navigate("/my-orders");
          },
          className: "w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        },
        /* @__PURE__ */ React.createElement("span", null, "Track Live Order & Receipt \u{1F4CB}")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black rounded-2xl text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
        },
        "Done \u2713"
      ))) : modalStep === "review" ? (
        /* ════════════════════════════════════════════════════════════════════════
            STAGE 2: "VIEW YOUR ORDER" SECTION (REQUESTED BY USER)
           ════════════════════════════════════════════════════════════════════════ */
        /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "shrink-0 flex items-center justify-between px-5 pt-3 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setModalStep("order"),
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-black uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
          },
          /* @__PURE__ */ React.createElement("span", null, "\u2190"),
          /* @__PURE__ */ React.createElement("span", null, "Edit Order")
        ), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-gray-900 dark:text-white tracking-tight" }, "View Your Order"), /* @__PURE__ */ React.createElement("p", { className: "text-[9.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest" }, "Step 2 of 2 \xB7 Final Review")), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          },
          /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
        )), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60" }, /* @__PURE__ */ React.createElement("div", { className: "w-11 h-11 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden text-2xl shadow-xs shrink-0 border border-amber-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: item.shopImage, alt: item.shopName, fallback: "\u{1F3EA}", className: "text-2xl", imgClassName: "rounded-xl" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400" }, "Ordering From"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-black text-gray-900 dark:text-white truncate" }, item.shopName), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 truncate" }, item.shopAddress || "Polokwane", " ", accurateDistance ? `\xB7 \u{1F4CD} ${accurateDistance}` : ""))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500" }, "Ordered Meal & Items"), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setModalStep("order"),
            className: "text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline"
          },
          "Change items"
        )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 select-none" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: item.image, alt: item.name, fallback: "\u{1F371}", className: "text-2xl", imgClassName: "rounded-xl" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black text-gray-900 dark:text-white truncate" }, item.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-semibold" }, "R", item.price, " each \xD7 ", orderForm.qty))), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-gray-900 dark:text-white shrink-0" }, "R", itemTotal.toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-gray-100 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9.5px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F957}"), " Your 3 Included Sides:"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1" }, selectedSideObjects.map((side) => /* @__PURE__ */ React.createElement(
          "span",
          {
            key: side.id,
            className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 shadow-2xs"
          },
          /* @__PURE__ */ React.createElement("span", null, side.icon),
          /* @__PURE__ */ React.createElement("span", null, side.name)
        )))), drinksList.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-gray-100 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9.5px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F964}"), " Cold Drinks Selected:"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1" }, drinksList.map((d) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: d.id,
            className: "flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 font-bold"
          },
          /* @__PURE__ */ React.createElement("span", { className: "text-gray-800 dark:text-gray-200 flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, d.icon), " ", d.name, " \xD7 ", d.qty),
          /* @__PURE__ */ React.createElement("span", { className: "text-rose-600 dark:text-rose-400 font-black" }, "+R", (d.price * d.qty).toFixed(2))
        ))))), cart.map((ci, idx) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: `cart-review-${ci.item.id}-${idx}`,
            className: "p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col gap-1.5"
          },
          /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 select-none" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: ci.item.image, alt: ci.item.name, fallback: "\u{1F371}", className: "text-xl", imgClassName: "rounded-lg" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black text-gray-900 dark:text-white truncate" }, ci.item.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-semibold" }, "R", ci.item.price, " \xD7 ", ci.qty))), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-gray-900 dark:text-white" }, "R", (ci.item.price * ci.qty).toFixed(2))),
          ci.sideNames && ci.sideNames.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-[9.5px] text-gray-500 font-semibold" }, "Sides: ", ci.sideNames.join(", ")),
          ci.drinks && ci.drinks.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-[9.5px] text-rose-500 font-semibold" }, "Drinks: ", ci.drinks.map((d) => `${d.name} x${d.qty}`).join(", "))
        )))), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400" }, "Collection & Contact"), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setModalStep("order"),
            className: "text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline"
          },
          "Edit contact"
        )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-black uppercase text-gray-400" }, "Your Name"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white truncate" }, orderForm.name)), /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-black uppercase text-gray-400" }, "Phone"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white truncate" }, orderForm.phone))), /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-400 dark:border-amber-600 shadow-xs flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs shrink-0 select-none" }, "\u23F1\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300" }, collectionEstimate.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black text-gray-900 dark:text-white truncate" }, "Ready in ~", collectionEstimate.durationText), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 font-semibold truncate" }, "Estimated time window: ", /* @__PURE__ */ React.createElement("strong", { className: "text-gray-800 dark:text-gray-200" }, estimatedWindow)))), /* @__PURE__ */ React.createElement("span", { className: "text-[10.5px] font-black px-2.5 py-1 rounded-xl bg-amber-500 text-white shadow-xs shrink-0" }, "~", collectionEstimate.durationText)), /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-black uppercase text-gray-400 mb-0.5" }, "Fulfilment Method"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white flex items-center gap-1.5" }, orderForm.fulfilment === "delivery" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", null, "\u{1F6F5} Delivery to address:"), /* @__PURE__ */ React.createElement("span", { className: "font-normal truncate" }, orderForm.deliveryAddress)) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", null, "\u{1F3EA} Pick Up at Counter"), /* @__PURE__ */ React.createElement("span", { className: "font-normal text-gray-500" }, "(", item.shopName, ")")))), orderForm.notes.trim() && /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-black uppercase text-gray-400 mb-0.5" }, "Special Requests"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-700 dark:text-gray-300 font-semibold italic" }, '"', orderForm.notes.trim(), '"'))), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/80 dark:from-amber-950/30 dark:to-gray-900 border border-amber-200 dark:border-amber-800/60 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400" }, "Payment Breakdown"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold" }, /* @__PURE__ */ React.createElement("span", null, "Food Items (", cart.length + 1, ")"), /* @__PURE__ */ React.createElement("span", null, "R", (cartItemsGrandTotal + itemTotal).toFixed(2))), drinksTotal > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold" }, /* @__PURE__ */ React.createElement("span", null, "Cold Drinks & Extras"), /* @__PURE__ */ React.createElement("span", null, "+R", drinksTotal.toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold" }, /* @__PURE__ */ React.createElement("span", null, "Fulfilment"), /* @__PURE__ */ React.createElement("span", { className: "text-emerald-600 dark:text-emerald-400 font-bold" }, orderForm.fulfilment === "delivery" ? "Free Delivery" : "Free Collection")), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider" }, "Total To Pay"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-semibold" }, "Pay at counter upon collection")), /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-gray-900 dark:text-white" }, "R", allOrdersGrandTotal.toFixed(2)))), (orderStatus === "error" || errorMsg) && /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold text-center" }, errorMsg || "Could not place order. Please try again.")), /* @__PURE__ */ React.createElement("div", { className: "shrink-0 px-5 pt-3 pb-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            disabled: orderStatus === "submitting",
            onClick: handleFinalOrderSubmit,
            className: "w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          },
          orderStatus === "submitting" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Loader2, { className: "w-4 h-4 animate-spin" }), /* @__PURE__ */ React.createElement("span", null, "Placing Order\u2026")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", null, "\u2705 Confirm & Place Order"), /* @__PURE__ */ React.createElement("span", { className: "opacity-90" }, "\xB7 R", allOrdersGrandTotal.toFixed(2)))
        ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-1" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setModalStep("order"),
            className: "text-[11px] font-black text-gray-500 hover:text-gray-800 dark:hover:text-white"
          },
          "\u2190 Back to edit"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: handleAddMore,
            className: "text-[11px] font-black text-amber-600 dark:text-amber-400 hover:underline"
          },
          "\u2795 Add more meals first"
        ))))
      ) : (
        /* ════════════════════════════════════════════════════════════════════════
            STAGE 1: ORDER WHAT YOU CLICK (CUSTOMIZE MEAL, SIDES & COKE)
           ════════════════════════════════════════════════════════════════════════ */
        /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "shrink-0 flex items-center justify-between px-5 pt-3 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "Order Your Food"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800" }, "Step 1 of 2")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-semibold truncate max-w-[240px]" }, item.shopName)), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          },
          /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
        )), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-rose-50/40 dark:from-gray-900 dark:to-gray-900 border border-amber-200/70 dark:border-gray-800 shadow-xs flex flex-col gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden text-4xl shadow-sm shrink-0 border border-amber-100 dark:border-gray-700 select-none" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: item.image, alt: item.name, fallback: "\u{1F371}", className: "text-4xl", imgClassName: "rounded-2xl" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mb-0.5" }, item.tag && /* @__PURE__ */ React.createElement("span", { className: "text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-2xs" }, item.tag), accurateDistance && /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800" }, "\u{1F4CD} ", accurateDistance)), /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-black text-gray-900 dark:text-white leading-tight truncate" }, item.name), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-500 dark:text-gray-400 font-semibold truncate" }, item.shopName, " \xB7 ", /* @__PURE__ */ React.createElement("strong", { className: "text-gray-900 dark:text-white font-black" }, "R", item.price)))), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-amber-200/60 dark:border-gray-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400" }, "Quantity"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black text-amber-700 dark:text-amber-400" }, "R", (item.price * orderForm.qty).toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setOrderForm((f) => ({ ...f, qty: Math.max(1, f.qty - 1) })),
            className: "w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-all active:scale-95 shadow-xs"
          },
          "\u2212"
        ), /* @__PURE__ */ React.createElement("span", { className: "w-8 text-center font-black text-base text-gray-900 dark:text-white" }, orderForm.qty), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setOrderForm((f) => ({ ...f, qty: f.qty + 1 })),
            className: "w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-all active:scale-95 shadow-xs"
          },
          "+"
        ))), item.description && /* @__PURE__ */ React.createElement("div", { className: "pt-1" }, /* @__PURE__ */ React.createElement("p", { className: `text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed ${showFullDesc ? "" : "line-clamp-2"}` }, item.description), item.description.length > 90 && /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setShowFullDesc(!showFullDesc),
            className: "text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline mt-0.5"
          },
          showFullDesc ? "Show less" : "Read more details"
        ))), /* @__PURE__ */ React.createElement(AnimatePresence, null, validationNotice && /* @__PURE__ */ React.createElement(
          motion.div,
          {
            initial: { opacity: 0, y: -6 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -6 },
            className: "p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between gap-2 shadow-xs"
          },
          /* @__PURE__ */ React.createElement("span", null, validationNotice),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setValidationNotice(""),
              className: "text-sm font-black p-0.5 hover:opacity-75"
            },
            "\u2715"
          )
        )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "\u{1F464}"), /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400" }, "Your Details")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            required: true,
            placeholder: "Full Name *",
            value: orderForm.name,
            onChange: (e) => setOrderForm((f) => ({ ...f, name: e.target.value })),
            className: "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          }
        )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "tel",
            required: true,
            placeholder: "Phone Number *",
            value: orderForm.phone,
            onChange: (e) => setOrderForm((f) => ({ ...f, phone: e.target.value })),
            className: "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          }
        )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5" }, "How would you like your food?"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, [
          { value: "pickup", icon: "\u{1F3EA}", label: "Pick up at Counter" },
          { value: "delivery", icon: "\u{1F6F5}", label: "Delivery" }
        ].map((opt) => /* @__PURE__ */ React.createElement(
          "button",
          {
            key: opt.value,
            type: "button",
            onClick: () => setOrderForm((f) => ({ ...f, fulfilment: opt.value })),
            className: `py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${orderForm.fulfilment === opt.value ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 shadow-2xs" : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"}`
          },
          opt.icon,
          " ",
          opt.label
        ))), /* @__PURE__ */ React.createElement("div", { className: "mt-2.5 flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs shrink-0 select-none" }, "\u23F1\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300" }, collectionEstimate.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-gray-900 dark:text-white truncate" }, "Ready in ~", collectionEstimate.durationText, " ", /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 font-normal" }, "(", estimatedWindow, ")")))), /* @__PURE__ */ React.createElement("span", { className: "text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0" }, orderForm.fulfilment === "delivery" ? "Delivery" : "Counter Pick Up")), orderForm.fulfilment === "delivery" && /* @__PURE__ */ React.createElement("div", { className: "mt-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2 mb-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-gray-400 uppercase tracking-wider" }, "Delivery address"), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => {
              setGpsRequested(true);
              requestLocation();
            },
            className: "inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 hover:underline"
          },
          gpsLoading ? /* @__PURE__ */ React.createElement(Loader2, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ React.createElement(MapPin, { className: "w-3 h-3" }),
          "Use my GPS"
        )), /* @__PURE__ */ React.createElement(
          "textarea",
          {
            required: true,
            rows: 2,
            placeholder: "Street address, suburb, town",
            value: orderForm.deliveryAddress,
            onChange: (e) => setOrderForm((f) => ({ ...f, deliveryAddress: e.target.value })),
            className: "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
          }
        ))), availableSides.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-2 border-amber-200 dark:border-amber-700/60 shadow-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2 mb-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F957}"), /* @__PURE__ */ React.createElement("label", { className: "text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block" }, "Choose Your Sides")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5" }, "Choose up to ", requiredSidesCount, " shop-listed side", requiredSidesCount === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("span", { className: `px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs flex items-center gap-1 ${selectedSides.length === requiredSidesCount ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700"}` }, selectedSides.length === requiredSidesCount ? `\u2713 ${requiredSidesCount}/${requiredSidesCount} Selected` : `${selectedSides.length}/${requiredSidesCount} Selected`)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-1.5" }, availableSides.map((side) => {
          const isSelected = selectedSides.includes(side.id);
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: side.id,
              type: "button",
              onClick: () => handleToggleSide(side.id),
              className: `flex items-center justify-between p-2 rounded-xl text-left border transition-all active:scale-95 cursor-pointer ${isSelected ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-sm ring-1 ring-amber-400" : "bg-white dark:bg-gray-800 hover:bg-amber-50/50 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"}`
            },
            /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 min-w-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-base select-none shrink-0" }, side.icon), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { className: `text-xs font-black block truncate ${isSelected ? "text-white" : "text-gray-900 dark:text-white"}` }, side.name), side.desc && /* @__PURE__ */ React.createElement("span", { className: `text-[9px] block truncate ${isSelected ? "text-amber-100" : "text-gray-400 dark:text-gray-500"}` }, side.desc))),
            /* @__PURE__ */ React.createElement("span", { className: `shrink-0 ml-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isSelected ? "bg-white text-amber-600 shadow-xs" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}` }, isSelected ? "\u2713" : "+")
          );
        })), /* @__PURE__ */ React.createElement("div", { className: "mt-2.5 pt-2 border-t border-amber-200/60 dark:border-gray-800 flex flex-wrap items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black uppercase text-amber-900 dark:text-amber-300" }, "Your Sides:"), selectedSides.length === 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-rose-500 italic" }, "No sides selected yet.") : selectedSideObjects.map((s) => /* @__PURE__ */ React.createElement(
          "span",
          {
            key: s.id,
            className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs"
          },
          /* @__PURE__ */ React.createElement("span", null, s.icon),
          /* @__PURE__ */ React.createElement("span", null, s.name),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                handleToggleSide(s.id);
              },
              className: "ml-1 text-amber-700 hover:text-rose-600 font-bold",
              title: `Remove ${s.name}`
            },
            "\xD7"
          )
        )))), availableDrinks.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-red-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-2 border-rose-200 dark:border-rose-900/60 shadow-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2 mb-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F964}"), /* @__PURE__ */ React.createElement("label", { className: "text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block" }, "Add a Cold Drink")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5" }, "Select Coke or cold beverages to complete your meal")), drinksList.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800" }, drinksList.reduce((s, d) => s + d.qty, 0), " added (+R", drinksTotal, ")")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-1.5" }, availableDrinks.map((drink) => {
          const qty = selectedDrinks[drink.id] || 0;
          const isSelected = qty > 0;
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              key: drink.id,
              className: `flex items-center justify-between p-2 rounded-xl border transition-all ${isSelected ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 ring-1 ring-rose-300 dark:ring-rose-800" : "bg-white dark:bg-gray-800 hover:bg-rose-50/40 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700"}`
            },
            /* @__PURE__ */ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => handleToggleDrink(drink.id),
                className: "flex items-center gap-1.5 min-w-0 text-left flex-1 cursor-pointer"
              },
              /* @__PURE__ */ React.createElement("span", { className: "text-base select-none shrink-0" }, drink.icon),
              /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-gray-900 dark:text-white truncate" }, drink.name)), /* @__PURE__ */ React.createElement("span", { className: "text-[9.5px] font-bold text-rose-600 dark:text-rose-400 block" }, "+R", drink.price.toFixed(2)))
            ),
            isSelected ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 shrink-0 ml-1" }, /* @__PURE__ */ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => handleUpdateDrinkQty(drink.id, -1),
                className: "w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-gray-300"
              },
              "\u2212"
            ), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black text-rose-600 dark:text-rose-400 w-3 text-center" }, qty), /* @__PURE__ */ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => handleUpdateDrinkQty(drink.id, 1),
                className: "w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center text-xs font-black hover:bg-rose-700"
              },
              "+"
            )) : /* @__PURE__ */ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => handleToggleDrink(drink.id),
                className: "shrink-0 ml-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-[10px] font-black text-gray-600 dark:text-gray-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
              },
              "+ Add"
            )
          );
        })), drinksList.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-2 pt-2 border-t border-rose-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-black text-rose-700 dark:text-rose-300" }, /* @__PURE__ */ React.createElement("span", null, "Drinks Total:"), /* @__PURE__ */ React.createElement("span", null, "+R", drinksTotal.toFixed(2))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1" }, "Special Requests ", /* @__PURE__ */ React.createElement("span", { className: "normal-case font-normal" }, "(optional)")), /* @__PURE__ */ React.createElement(
          "textarea",
          {
            rows: 2,
            placeholder: "e.g. Extra spicy, sauce on the side, well done...",
            value: orderForm.notes,
            onChange: (e) => setOrderForm((f) => ({ ...f, notes: e.target.value })),
            className: "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
          }
        ), detectedNotesFoods.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1 mt-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-bold text-amber-700 uppercase" }, "Detected:"), detectedNotesFoods.map((f) => /* @__PURE__ */ React.createElement("span", { key: f.id, className: "text-[9.5px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200" }, f.icon, " ", f.name)))), shopSiblings.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl overflow-hidden border border-violet-200 dark:border-violet-900/60 shadow-xs" }, /* @__PURE__ */ React.createElement("div", { className: "px-3.5 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/8 to-fuchsia-500/10 dark:from-violet-950/60 dark:to-fuchsia-950/40 border-b border-violet-200 dark:border-violet-900/60 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-xs shrink-0" }, "\u2728"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-violet-800 dark:text-violet-300" }, "You Might Also Like"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-violet-600/70 dark:text-violet-400/70 font-semibold" }, "Pairs well \xB7 From ", item.shopName))), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800" }, shopSiblings.length, " items")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 overflow-x-auto scrollbar-hide p-3 bg-white/60 dark:bg-gray-900/60" }, shopSiblings.map((sib, idx) => {
          const pairingLabel = sib.tag || "";
          const isInCart = cart.some((ci) => ci.item.id === sib.id);
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              key: sib.id,
              className: "shrink-0 w-[130px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:border-violet-400 dark:hover:border-violet-700 hover:shadow-md transition-all group"
            },
            /* @__PURE__ */ React.createElement("div", { className: "relative h-[52px] bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 flex items-center justify-center overflow-hidden" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: sib.image, alt: sib.name, fallback: "\u{1F371}", className: "text-3xl select-none" }), pairingLabel && /* @__PURE__ */ React.createElement("div", { className: "absolute top-1 left-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[7.5px] font-black px-1.5 py-0.5 rounded-md bg-violet-600 text-white uppercase tracking-wider shadow-xs leading-none" }, pairingLabel)), isInCart && /* @__PURE__ */ React.createElement("div", { className: "absolute top-1 right-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[7px] font-black px-1 py-0.5 rounded bg-emerald-500 text-white" }, "\u2713 In cart"))),
            /* @__PURE__ */ React.createElement("div", { className: "p-2 flex flex-col gap-1.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[10.5px] font-black text-gray-900 dark:text-white leading-tight line-clamp-2" }, sib.name), sib.description && /* @__PURE__ */ React.createElement("p", { className: "text-[8.5px] text-gray-400 font-normal mt-0.5 line-clamp-1 leading-snug" }, sib.description)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-black text-amber-600 dark:text-amber-400" }, "R", sib.price), sib.prepTime && /* @__PURE__ */ React.createElement("span", { className: "text-[8px] text-gray-400 font-semibold" }, "\u23F1 ", sib.prepTime)), /* @__PURE__ */ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (onSiblingSelect) onSiblingSelect(sib);
                },
                className: "w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-800 hover:bg-violet-600 hover:text-white hover:border-violet-600 dark:hover:bg-violet-600 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              },
              "+ Add to Order"
            ))
          );
        })), /* @__PURE__ */ React.createElement("div", { className: "px-3.5 py-2 bg-violet-50/60 dark:bg-violet-950/20 border-t border-violet-100 dark:border-violet-900/40" }, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-violet-600 dark:text-violet-400 font-semibold text-center" }, "\u{1F4A1} Tap ", /* @__PURE__ */ React.createElement("strong", null, '"+ Add to Order"'), " to open that meal and add it to your order"))), cart.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F6D2}"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black text-emerald-800 dark:text-emerald-300" }, cart.length, " item", cart.length !== 1 ? "s" : "", " already in your order"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate" }, cart.map((ci) => `${ci.item.name} \xD7${ci.qty}`).join(" \xB7 "))))), /* @__PURE__ */ React.createElement("div", { className: "shrink-0 px-5 pt-3 pb-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs font-black mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 uppercase tracking-wider" }, "Subtotal:"), /* @__PURE__ */ React.createElement("span", { className: "text-lg text-gray-900 dark:text-white" }, "R", allOrdersGrandTotal.toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: handleAddMore,
            className: "py-3.5 px-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-black uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
          },
          /* @__PURE__ */ React.createElement("span", null, "\u2795 Add More"),
          /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-normal lowercase opacity-70" }, "from this shop")
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: handleProceedToViewOrder,
            className: "py-3.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
          },
          /* @__PURE__ */ React.createElement("span", null, "View Your Order \u2192"),
          /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-normal lowercase opacity-90" }, "review & confirm")
        ))))
      )
    )
  ));
};
const OrderReviewSheet = ({ cart, cartMeta, onClose, onClearCart, onUpdateCartMeta, onRemoveItem }) => {
  const [contact, setContact] = useState({
    name: cartMeta?.name || "",
    phone: cartMeta?.phone || "",
    fulfilment: cartMeta?.fulfilment || "pickup",
    deliveryAddress: cartMeta?.deliveryAddress || ""
  });
  const [orderStatus, setOrderStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  const shopName = cart[0]?.item.shopName || "Shop";
  const shopImage = cart[0]?.item.shopImage || "\u{1F3EA}";
  const shopId = cart[0]?.item.shopId;
  const total = cart.reduce((s, ci) => {
    const food = ci.item.price * ci.qty;
    const drinks = ci.drinks ? ci.drinks.reduce((ds, d) => ds + d.price * (d.qty || 1), 0) : 0;
    return s + food + drinks;
  }, 0);
  const sheetEstimate = useMemo(() => {
    let baseMins = 15;
    const prep = cart[0]?.item.prepTime;
    if (prep) {
      const parsed = parseInt(String(prep).replace(/\D+/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0) baseMins = parsed;
    }
    if (contact.fulfilment === "delivery") {
      const minMins2 = baseMins + 15;
      const maxMins2 = baseMins + 30;
      return {
        label: "Estimated Delivery Time",
        durationText: `${minMins2}\u2013${maxMins2} mins`,
        minMins: minMins2,
        maxMins: maxMins2
      };
    }
    const minMins = Math.max(10, baseMins);
    const maxMins = minMins + 10;
    return {
      label: "Estimated Collection Time",
      durationText: `${minMins}\u2013${maxMins} mins`,
      minMins,
      maxMins
    };
  }, [cart, contact.fulfilment]);
  const sheetWindow = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const tMin = new Date(now.getTime() + sheetEstimate.minMins * 6e4);
    const tMax = new Date(now.getTime() + sheetEstimate.maxMins * 6e4);
    const formatTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${formatTime(tMin)} \u2013 ${formatTime(tMax)}`;
  }, [sheetEstimate]);
  if (!cart.length) return null;
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }
    if (contact.fulfilment === "delivery" && !contact.deliveryAddress.trim()) {
      setErrorMsg("Please enter a delivery address.");
      return;
    }
    setErrorMsg("");
    setOrderStatus("submitting");
    try {
      const allItems = cart.map((ci) => ({
        id: ci.item.id,
        quantity: ci.qty,
        sides: ci.sideNames || [],
        addOns: (ci.drinks || []).map((drink) => ({ name: drink.name, quantity: drink.qty || 1 }))
      }));
      const allSides = [...new Set(cart.flatMap((ci) => ci.sideNames || []))];
      const sidesText = allSides.length ? `Sides: ${allSides.join(", ")}` : "";
      const allDrinks = cart.flatMap((ci) => ci.drinks || []);
      const drinksText = allDrinks.length ? `Drinks: ${allDrinks.map((d) => `${d.name} x${d.qty}`).join(", ")}` : "";
      const combinedNotes = [sidesText, drinksText].filter(Boolean).join(" | ");
      const res = await authenticatedFetch("/api/lunch/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          items: allItems,
          customerName: contact.name.trim(),
          customerPhone: contact.phone.trim(),
          fulfilment: contact.fulfilment,
          deliveryAddress: contact.deliveryAddress.trim(),
          deliveryNotes: combinedNotes,
          orderComments: combinedNotes,
          selectedSides: allSides
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.orderCode) throw new Error("The server did not confirm this food order. Please try again.");
        setOrderId(data.orderCode);
        onUpdateCartMeta?.(contact);
        setOrderStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || "Could not place order. Please try again.");
        setOrderStatus("error");
      }
    } catch (error) {
      setErrorMsg(error.message || "Could not connect to food ordering. Your order was not submitted.");
      setOrderStatus("error");
    }
  };
  return /* @__PURE__ */ React.createElement(AnimatePresence, null, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: "order-review-backdrop",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[250] flex items-end sm:items-center justify-center",
      onClick: orderStatus !== "submitting" ? onClose : void 0
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }),
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: "order-review-sheet",
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
        transition: { type: "spring", damping: 30, stiffness: 320 },
        onClick: (e) => e.stopPropagation(),
        className: "relative z-10 w-full max-w-md mx-0 sm:mx-4 bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-center pt-3 pb-1 sm:hidden shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" })),
      orderStatus === "success" ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-5 px-8 py-12 text-center" }, /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { scale: 0, rotate: -15 },
          animate: { scale: 1, rotate: 0 },
          transition: { type: "spring", damping: 14, stiffness: 200 },
          className: "text-7xl select-none"
        },
        "\u{1F389}"
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white text-xl mb-1" }, "Order Placed!"), orderId && /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2" }, "#", orderId), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 leading-relaxed" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-700 dark:text-gray-300" }, shopName), " will contact you on", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-700 dark:text-gray-300" }, contact.phone), " shortly.")), /* @__PURE__ */ React.createElement("div", { className: "w-full p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/80 flex items-center gap-3 text-left shadow-xs" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs shrink-0 select-none" }, "\u23F1\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300" }, sheetEstimate.label), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-black text-gray-900 dark:text-white truncate" }, "Ready in ~", sheetEstimate.durationText), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-600 dark:text-gray-400 mt-0.5" }, contact.fulfilment === "delivery" ? `Delivery expected around ${sheetWindow}.` : `Please collect your fresh order at ${shopName} between ${sheetWindow}.`))), /* @__PURE__ */ React.createElement("div", { className: "w-full flex flex-col gap-2 mt-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            onClearCart();
            onClose();
          },
          className: "w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
        },
        "Done \u2713"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => window.location.href = "/food",
          className: "w-full py-3 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider hover:underline"
        },
        "View full menu \u2192"
      ))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "shrink-0 flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-2xl bg-amber-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden text-xl shrink-0 border border-amber-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: shopImage, alt: shopName, fallback: "\u{1F3EA}", className: "text-xl", imgClassName: "rounded-2xl" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400" }, "Review Your Order"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white text-sm truncate" }, shopName)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 shrink-0" }, onClearCart && /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            onClearCart();
            onClose();
          },
          className: "text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        },
        "Clear"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: onClose,
          className: "w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
        },
        /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4 text-gray-600 dark:text-gray-300" })
      ))), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto flex-1 px-5 py-4" }, /* @__PURE__ */ React.createElement("form", { id: "order-review-form", onSubmit: handlePlaceOrder, className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3" }, "Your Items (", cart.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3" }, cart.map((ci, idx) => {
        return /* @__PURE__ */ React.createElement(
          motion.div,
          {
            key: `${ci.item.id}-${idx}`,
            initial: { opacity: 0, x: -12 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: idx * 0.06 },
            className: "flex gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          },
          /* @__PURE__ */ React.createElement("div", { className: "w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden text-2xl shrink-0 shadow-xs" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: ci.item.image, alt: ci.item.name, fallback: "\u{1F371}", className: "text-2xl", imgClassName: "rounded-xl" })),
          /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white text-sm leading-tight truncate" }, ci.item.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ React.createElement("p", { className: "font-black text-gray-900 dark:text-white text-sm" }, "R", (ci.item.price * ci.qty).toFixed(2)), onRemoveItem && /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: () => onRemoveItem(idx),
              "aria-label": `Remove ${ci.item.name}`,
              title: "Remove item",
              className: "text-gray-400 hover:text-rose-500 p-0.5 rounded transition-colors"
            },
            /* @__PURE__ */ React.createElement(X, { className: "w-3.5 h-3.5" })
          ))), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 dark:text-gray-400 mt-0.5" }, "R", ci.item.price, " \xD7 ", ci.qty), ci.sideNames && ci.sideNames.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1 mt-1.5" }, ci.sideNames.map((side) => /* @__PURE__ */ React.createElement(
            "span",
            {
              key: side,
              className: "inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            },
            side
          ))), ci.drinks && ci.drinks.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1 mt-1" }, ci.drinks.map((d) => /* @__PURE__ */ React.createElement(
            "span",
            {
              key: d.id,
              className: "inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            },
            d.icon,
            " ",
            d.name,
            " \xD7",
            d.qty,
            " (+R",
            (d.price * d.qty).toFixed(2),
            ")"
          ))))
        );
      }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400" }, "Order Total"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-amber-600 dark:text-amber-500 font-semibold" }, cart.length, " item", cart.length !== 1 ? "s" : "", " \xB7 Pay at counter")), /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-gray-900 dark:text-white tracking-tight" }, "R", total.toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-gray-100 dark:bg-gray-800" }), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black uppercase text-gray-400 tracking-widest" }, "Contact Details"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-gray-100 dark:bg-gray-800" })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5" }, "Your Name"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          required: true,
          placeholder: "Full name",
          value: contact.name,
          onChange: (e) => setContact((c) => ({ ...c, name: e.target.value })),
          className: "w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
        }
      )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5" }, "Phone Number"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "tel",
          required: true,
          placeholder: "e.g. 082 000 0000",
          value: contact.phone,
          onChange: (e) => setContact((c) => ({ ...c, phone: e.target.value })),
          className: "w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
        }
      ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5" }, "How would you like it?"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, [
        { value: "pickup", icon: "\u{1F3EA}", label: "Pick Up" },
        { value: "delivery", icon: "\u{1F6F5}", label: "Delivery" }
      ].map((opt) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: opt.value,
          type: "button",
          onClick: () => setContact((c) => ({ ...c, fulfilment: opt.value })),
          className: `py-3 rounded-xl border text-xs font-black transition-all ${contact.fulfilment === opt.value ? "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"}`
        },
        opt.icon,
        " ",
        opt.label
      ))), contact.fulfilment === "delivery" && /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React.createElement(
        "textarea",
        {
          required: true,
          rows: 2,
          placeholder: "Street address, suburb and city",
          value: contact.deliveryAddress,
          onChange: (e) => setContact((c) => ({ ...c, deliveryAddress: e.target.value })),
          className: "w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none mt-1"
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl select-none" }, "\u23F1\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black uppercase text-amber-800 dark:text-amber-300" }, sheetEstimate.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-gray-900 dark:text-white truncate" }, "Ready in ~", sheetEstimate.durationText, " ", /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 font-normal" }, "(", sheetWindow, ")")))), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase shrink-0" }, "~", sheetEstimate.durationText))), (orderStatus === "error" || errorMsg) && /* @__PURE__ */ React.createElement(
        motion.p,
        {
          initial: { opacity: 0, y: -6 },
          animate: { opacity: 1, y: 0 },
          className: "text-[11px] text-rose-500 font-bold text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2"
        },
        errorMsg || "Failed to place order. Please try again."
      ))), /* @__PURE__ */ React.createElement("div", { className: "shrink-0 px-5 pt-3 pb-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          form: "order-review-form",
          type: "submit",
          disabled: orderStatus === "submitting",
          className: "w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg shadow-amber-200 dark:shadow-rose-900/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        },
        orderStatus === "submitting" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Loader2, { className: "w-4 h-4 animate-spin" }), "Placing Order\u2026") : /* @__PURE__ */ React.createElement(React.Fragment, null, "\u2705 Place Order \xB7 R", total.toFixed(2))
      ), /* @__PURE__ */ React.createElement("p", { className: "text-center text-[10px] text-gray-400 dark:text-gray-600 font-semibold mt-2" }, "Pay at the counter upon collection")))
    )
  ));
};
const FoodSpecialsStrip = ({ navigate, className = "", browseMode = false }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [foodItems, setFoodItems] = useState([]);
  const [foodRetry, setFoodRetry] = useState(0);
  const [foodLoadError, setFoodLoadError] = useState(false);
  const [activeFoodShortcut, setActiveFoodShortcut] = useState("all");
  const [activeFoodOrders, setActiveFoodOrders] = useState([]);
  const [shopsData, setShopsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [previewFood, setPreviewFood] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("loopout_food_basket");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartMeta, setCartMeta] = useState(() => {
    try {
      const saved = localStorage.getItem("loopout_food_basket_meta");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showOrderReview, setShowOrderReview] = useState(false);
  const displayedFoodItems = useMemo(() => {
    if (activeFoodShortcut === "offers") {
      return foodItems.filter(
        (item) => Number(item.originalPrice) > Number(item.price) || /special|deal|offer|discount/i.test(item.tag || "")
      );
    }
    return foodItems;
  }, [foodItems, activeFoodShortcut]);
  useEffect(() => {
    if (!currentUser) {
      setActiveFoodOrders([]);
      return void 0;
    }
    let localOrders = [];
    try {
      const stored = localStorage.getItem("loopout_food_orders");
      if (stored) localOrders = JSON.parse(stored);
    } catch {
      localOrders = [];
    }
    const customerId = String(currentUser._id || currentUser.id || "");
    const customerPhone = String(currentUser.phone || "");
    const updateActiveOrders = (serverOrders = []) => {
      const byId = /* @__PURE__ */ new Map();
      [...localOrders, ...Array.isArray(serverOrders) ? serverOrders : []].forEach((order) => {
        const orderId = order._id || order.id || order.orderId;
        if (orderId) byId.set(String(orderId), order);
      });
      setActiveFoodOrders([...byId.values()].filter((order) => {
        const belongsToUser = customerId && String(order.customerId || order.customer?._id || order.userId || "") === customerId || customerPhone && String(order.customerPhone || "") === customerPhone;
        const status = String(order.status || "").toLowerCase();
        return belongsToUser && !["completed", "complete", "done", "delivered", "collected", "cancelled", "canceled"].some((endStatus) => status.includes(endStatus));
      }).sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)));
    };
    updateActiveOrders();
    return subscribeToOrders((serverOrders) => updateActiveOrders(serverOrders));
  }, [currentUser?._id, currentUser?.id, currentUser?.phone]);
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem("loopout_food_basket", JSON.stringify(cart));
      } else {
        localStorage.removeItem("loopout_food_basket");
      }
    } catch (e) {
      console.error(e);
    }
  }, [cart]);
  useEffect(() => {
    try {
      if (cartMeta) {
        localStorage.setItem("loopout_food_basket_meta", JSON.stringify(cartMeta));
      } else {
        localStorage.removeItem("loopout_food_basket_meta");
      }
    } catch (e) {
      console.error(e);
    }
  }, [cartMeta]);
  const totalCartItems = useMemo(() => {
    return cart.reduce((sum, ci) => sum + (Number(ci.qty) || 1), 0);
  }, [cart]);
  const [crossShopCandidate, setCrossShopCandidate] = useState(null);
  const activeCartShopId = cart.length > 0 ? cart[0].item.shopId : null;
  const handleAddToCart = (entry) => setCart((prev) => [...prev, entry]);
  const handleUpdateCartMeta = (meta) => setCartMeta(meta);
  const handleClearCart = () => {
    setCart([]);
    setCartMeta(null);
    try {
      localStorage.removeItem("loopout_food_basket");
      localStorage.removeItem("loopout_food_basket_meta");
    } catch (e) {
      console.error(e);
    }
  };
  const handleRemoveItem = (index) => {
    setCart((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setShowOrderReview(false);
      }
      return next;
    });
  };
  const handleFoodSelect = (item) => {
    if (activeCartShopId && item.shopId !== activeCartShopId) {
      setCrossShopCandidate(item);
    } else {
      setSelectedFood(item);
    }
  };
  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    if (activeCartShopId && item.shopId !== activeCartShopId) {
      setCrossShopCandidate(item);
      return;
    }
    const existing = cart.findIndex((ci) => ci.item.id === item.id);
    if (existing >= 0) {
      setCart(
        (prev) => prev.map(
          (ci, idx) => idx === existing ? { ...ci, qty: ci.qty + 1 } : ci
        )
      );
    } else {
      handleAddToCart({ item, qty: 1, sideNames: [], drinks: [] });
    }
    setShowOrderReview(true);
  };
  const handleReplaceCart = () => {
    setCart([]);
    setCartMeta(null);
    setSelectedFood(crossShopCandidate);
    setCrossShopCandidate(null);
  };
  const shopSiblings = useMemo(() => {
    if (!selectedFood) return [];
    const shop = shopsData.find((s) => (s.id || s._id) === selectedFood.shopId);
    if (!shop || !Array.isArray(shop.meals)) return [];
    return shop.meals.filter((m) => m.isAvailable !== false && m.id !== selectedFood.id).map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      image: m.image || "\u{1F371}",
      tag: String(m.tag || "").trim().toLowerCase() === "popular" ? "" : m.tag || "",
      description: m.description || "",
      shopId: selectedFood.shopId,
      shopName: selectedFood.shopName,
      shopImage: selectedFood.shopImage,
      shopCuisine: selectedFood.shopCuisine,
      shopAddress: selectedFood.shopAddress,
      shopDistance: selectedFood.shopDistance,
      latitude: selectedFood.latitude,
      longitude: selectedFood.longitude,
      sides: m.sides || [],
      addOns: m.addOns || [],
      ingredients: m.ingredients || [],
      prepTime: m.prepTime || null,
      calories: m.calories || null,
      originalPrice: m.originalPrice || null
    })).slice(0, 8);
  }, [selectedFood, shopsData]);
  useEffect(() => {
    let isMounted = true;
    const fetchShops = async () => {
      try {
        setFoodLoadError(false);
        const res = await fetch("/api/lunch/shops");
        if (!res.ok) throw new Error(`Food shops request failed (${res.status}).`);
        const shops = await res.json();
        if (!Array.isArray(shops) || shops.length === 0) return;
        if (isMounted) setShopsData(shops);
        const collected = [];
        shops.forEach((shop) => {
          if (shop.isOpen === false) return;
          if (!shop.meals || !shop.meals.length) return;
          const available = shop.meals.filter((m) => m.isAvailable !== false && Number.isFinite(Number(m.price)) && Number(m.price) >= 0);
          if (!available.length) return;
          const sorted = [...available].sort((a, b) => {
            const aHasImg = isFoodImageUrl(a.image) ? 0 : 1;
            const bHasImg = isFoodImageUrl(b.image) ? 0 : 1;
            if (aHasImg !== bHasImg) return aHasImg - bHasImg;
            return String(a.name || "").localeCompare(String(b.name || ""));
          });
          sorted.slice(0, 2).forEach((meal) => {
            const resolvedImg = isFoodImageUrl(meal.image) ? meal.image : "";
            collected.push({
              id: meal.id,
              name: meal.name,
              price: meal.price,
              originalPrice: meal.originalPrice,
              tag: String(meal.tag || "").trim().toLowerCase() === "popular" ? "" : meal.tag || "",
              image: resolvedImg,
              description: meal.description || "",
              prepTime: meal.prepTime || null,
              calories: meal.calories || null,
              ingredients: meal.ingredients || [],
              sides: meal.sides || [],
              addOns: meal.addOns || [],
              shopId: shop.id || shop._id,
              shopName: shop.name,
              shopImage: isFoodImageUrl(shop.image) ? shop.image : "",
              shopCuisine: shop.cuisine || "Local",
              shopAddress: shop.address || shop.location || "",
              shopDistance: shop.distance || "",
              shopPhone: shop.phone || shop.whatsapp || "",
              isSponsored: shop.isPromoted === true && shop.isOpen !== false,
              latitude: shop.latitude || null,
              longitude: shop.longitude || null
            });
          });
        });
        collected.sort((a, b) => {
          if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1;
          const aHasImg = isFoodImageUrl(a.image) ? 0 : 1;
          const bHasImg = isFoodImageUrl(b.image) ? 0 : 1;
          if (aHasImg !== bHasImg) return aHasImg - bHasImg;
          return String(a.name || "").localeCompare(String(b.name || ""));
        });
        if (isMounted) setFoodItems(collected);
      } catch (err) {
        if (isMounted) {
          setFoodItems([]);
          setFoodLoadError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchShops();
    return () => {
      isMounted = false;
    };
  }, [foodRetry]);
  return /* @__PURE__ */ React.createElement("section", { className: `mb-6 bg-white transition-[margin] duration-300 dark:bg-gray-950 ${className}` }, /* @__PURE__ */ React.createElement("div", { className: "mb-5 flex items-center justify-between gap-2 px-0.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => cart.length > 0 && setShowOrderReview(true),
      "aria-label": `View basket${totalCartItems ? `, ${totalCartItems} items` : ""}`,
      className: "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-inset ring-rose-100 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:ring-rose-900/50 dark:hover:bg-rose-900/50",
      title: "View basket"
    },
    /* @__PURE__ */ React.createElement(Flame, { className: "h-4 w-4 text-rose-600 dark:text-rose-300" }),
    totalCartItems > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[8px] font-black min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center border border-white shadow-sm" }, totalCartItems)
  ), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "truncate text-sm font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg" }, browseMode ? "Explore Food" : "Food shops"), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 truncate text-[10px] font-medium text-gray-500 dark:text-gray-400 sm:text-xs" }, "Meals and prices shown from current shop listings"))), /* @__PURE__ */ React.createElement("div", { className: "flex shrink-0 items-center gap-1.5 sm:gap-2" }, /* @__PURE__ */ React.createElement(
    motion.button,
    {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      onClick: () => navigate("/my-orders"),
      className: "flex min-h-11 items-center gap-1 rounded-full bg-amber-400 px-3 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-300 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(ShoppingBag, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", null, "My Orders")
  ))), !browseMode && /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "group",
      "aria-label": "Food recommendations",
      className: "-mx-4 mb-2 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide"
    },
    [
      { id: "orders", label: "Order again" },
      { id: "active-orders", label: "Active orders" },
      { id: "all", label: "All dishes" },
      { id: "offers", label: "Offers" }
    ].map((shortcut) => {
      const isActive = activeFoodShortcut === shortcut.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: shortcut.id,
          type: "button",
          onClick: () => {
            if (shortcut.id === "orders") {
              navigate("/my-orders");
              return;
            }
            if (shortcut.id === "active-orders") {
              setActiveFoodShortcut("active-orders");
              return;
            }
            setActiveFoodShortcut(shortcut.id);
          },
          "aria-pressed": shortcut.id === "orders" ? void 0 : isActive,
          className: `snap-start flex min-h-11 shrink-0 items-center rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${isActive ? "bg-[#06C167] text-slate-950" : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"}`
        },
        shortcut.label
      );
    })
  ), !browseMode && activeFoodShortcut === "active-orders" && /* @__PURE__ */ React.createElement("section", { "aria-label": "Your active food orders", className: "mb-3 space-y-3" }, activeFoodOrders.length ? activeFoodOrders.map((order) => {
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const orderId = order._id || order.id || order.orderId;
    const orderTotal = Number(order.total ?? order.totalAmount ?? order.grandTotal ?? order.price);
    const orderShop = shopsData.find((shop) => String(shop._id || shop.id) === String(order.shopId));
    const firstOrderedItem = orderItems[0];
    const firstMeal = orderShop?.meals?.find(
      (meal) => String(meal.id) === String(firstOrderedItem?.id) || meal.name === firstOrderedItem?.name
    );
    const foodImage = firstOrderedItem?.image || firstMeal?.image || order.shopImage;
    const orderStart = new Date(order.createdAt || order.date || Date.now());
    const prepMinutes = Math.max(10, ...orderItems.map((orderedItem) => {
      const matchingMeal = orderShop?.meals?.find(
        (meal) => String(meal.id) === String(orderedItem.id) || meal.name === orderedItem.name
      );
      const minutes = parseInt(String(matchingMeal?.prepTime || "").replace(/\D+/g, ""), 10);
      return Number.isFinite(minutes) && minutes > 0 ? minutes : 15;
    }));
    const isDelivery = (order.fulfilment || order.type) === "delivery";
    const etaStart = new Date(orderStart.getTime() + (prepMinutes + (isDelivery ? 15 : 0)) * 6e4);
    const etaEnd = new Date(orderStart.getTime() + (prepMinutes + (isDelivery ? 30 : 10)) * 6e4);
    const formatOrderTime = (value) => new Date(value).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    const scheduledCollection = order.scheduledFor || order.collectionTime || order.pickupTime;
    const collectionLabel = scheduledCollection ? `Collection time: ${formatOrderTime(scheduledCollection)}` : order.pickupReadyAt ? `Ready since ${formatOrderTime(order.pickupReadyAt)}` : `${isDelivery ? "Est. delivery" : "Est. collection"}: ${formatOrderTime(etaStart)}\u2013${formatOrderTime(etaEnd)}`;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: orderId,
        type: "button",
        onClick: () => navigate("/my-orders?filter=active"),
        className: "flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-left transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50",
        "aria-label": `Open active order from ${order.shopName || order.shop?.name || "food shop"}`
      },
      /* @__PURE__ */ React.createElement("span", { className: "flex min-w-0 items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-gray-800" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: foodImage, alt: firstOrderedItem?.name || "Food ordered", fallback: "\u{1F371}", className: "h-full w-full text-2xl", imgClassName: "rounded-xl" })), /* @__PURE__ */ React.createElement("span", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { className: "block truncate text-sm font-bold text-slate-900 dark:text-white" }, order.shopName || order.shop?.name || "Food order"), /* @__PURE__ */ React.createElement("span", { className: "mt-0.5 block truncate text-xs text-slate-700 dark:text-slate-300" }, orderItems.length ? orderItems.map((item) => `${item.quantity || item.qty || 1} \xD7 ${item.name || item.title || "Item"}`).join(", ") : order.mealName || "Order in progress"), /* @__PURE__ */ React.createElement("span", { className: "mt-1 block text-xs font-semibold capitalize text-emerald-800 dark:text-emerald-300" }, String(order.status || "Pending").replace(/[_-]+/g, " ")), /* @__PURE__ */ React.createElement("span", { className: "mt-1 block text-xs font-semibold text-slate-700 dark:text-slate-300" }, collectionLabel))),
      /* @__PURE__ */ React.createElement("span", { className: "shrink-0 text-right" }, Number.isFinite(orderTotal) && orderTotal > 0 && /* @__PURE__ */ React.createElement("span", { className: "block text-sm font-bold text-slate-900 dark:text-white" }, "R", orderTotal.toFixed(2)), /* @__PURE__ */ React.createElement("span", { className: "mt-1 inline-block text-xs font-bold text-emerald-800 dark:text-emerald-300" }, "View order \u2192"))
    );
  }) : /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-50 px-4 py-5 text-center dark:bg-gray-900" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-slate-800 dark:text-gray-100" }, "No active food orders"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-slate-600 dark:text-gray-300" }, "Your order updates will appear here."))), !browseMode && activeFoodShortcut !== "active-orders" && /* @__PURE__ */ React.createElement("div", { className: "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide sm:gap-4" }, displayedFoodItems.map((item, i) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: `carousel-${item.shopId}-${item.id || i}`,
      whileHover: { y: -3 },
      whileTap: { scale: 0.97 },
      onClick: () => handleFoodSelect(item),
      className: "relative flex w-[112px] shrink-0 snap-start flex-col rounded-2xl bg-transparent p-1.5 transition-all duration-200 cursor-pointer sm:w-[136px] sm:p-2"
    },
    /* @__PURE__ */ React.createElement("div", { className: "relative mb-1.5 flex aspect-[1.12/1] w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: (event) => {
          event.stopPropagation();
          setPreviewFood(item);
        },
        "aria-label": `Zoom in on ${item.name} photo`,
        className: "absolute inset-0 z-0 h-full w-full cursor-zoom-in"
      },
      /* @__PURE__ */ React.createElement(
        FoodMedia,
        {
          src: item.image,
          alt: item.name,
          fallback: "\u{1F371}",
          className: "text-xl select-none",
          imgClassName: "rounded-lg transition-transform duration-300 hover:scale-105"
        }
      )
    ), item.tag && /* @__PURE__ */ React.createElement("span", { className: `absolute left-1.5 top-1.5 z-10 rounded-md px-1.5 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${/hot/i.test(item.tag || "") ? "bg-rose-600 text-white" : /popular/i.test(item.tag || "") ? "bg-amber-500 text-white" : /fav/i.test(item.tag || "") ? "bg-pink-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}` }, /hot/i.test(item.tag || "") ? "\u{1F525} Hot" : /popular/i.test(item.tag || "") ? "\u2B50 Top" : /fav/i.test(item.tag || "") ? "\u2764\uFE0F Fav" : item.tag), item.isSponsored && /* @__PURE__ */ React.createElement("span", { className: "absolute right-1.5 top-1.5 z-10 rounded-md bg-slate-900/90 px-1.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm" }, "Sponsored"), /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-1.5 left-1.5 z-10 rounded-full bg-white/95 px-2 py-1 text-xs font-extrabold text-slate-900 shadow-sm backdrop-blur-sm dark:bg-gray-950/90 dark:text-white" }, "R", item.price), (() => {
      const cartEntry = cart.find((ci) => ci.item.id === item.id);
      const qty = cartEntry?.qty ?? 0;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: (e) => handleQuickAdd(e, item),
          className: "absolute bottom-1 right-1 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-transparent shadow-none transition-all duration-200 active:scale-90",
          title: `Add ${item.name} to basket`,
          "aria-label": `Add ${item.name} to basket`
        },
        qty > 1 ? /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black leading-none", style: { color: "#1ed760" } }, qty) : /* @__PURE__ */ React.createElement(
          ShoppingBag,
          {
            className: "h-5 w-5",
            style: { color: qty === 1 ? "#ef4444" : "#1ed760" }
          }
        )
      );
    })()),
    /* @__PURE__ */ React.createElement("p", { className: "truncate text-xs font-semibold leading-tight text-gray-900 dark:text-white" }, item.name),
    /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 truncate text-xs leading-tight text-gray-600 dark:text-gray-300" }, item.shopName)
  ))), !loading && activeFoodShortcut !== "active-orders" && displayedFoodItems.length === 0 && /* @__PURE__ */ React.createElement("div", { role: "status", className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-900" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-slate-800 dark:text-slate-100" }, foodLoadError ? "Food shops could not load." : foodItems.length ? "No current offers are listed." : "No open food shops have menu items available right now."), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-slate-500 dark:text-gray-400" }, foodLoadError ? "Check your connection and try again." : "Available menus and prices will appear here."), foodLoadError && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    setLoading(true);
    setFoodRetry((attempt) => attempt + 1);
  }, className: "mt-3 min-h-10 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" }, "Try again")), activeFoodShortcut !== "active-orders" && /* @__PURE__ */ React.createElement("div", { className: "mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" }, displayedFoodItems.map((item, index) => /* @__PURE__ */ React.createElement(
    motion.button,
    {
      key: `food-list-${item.shopId}-${item.id || index}`,
      type: "button",
      whileTap: { scale: 0.99 },
      onClick: () => handleFoodSelect(item),
      className: "group w-full overflow-hidden rounded-2xl border-0 bg-transparent p-0 text-left shadow-none transition"
    },
    /* @__PURE__ */ React.createElement("span", { className: "relative block aspect-[1.45/1] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800" }, /* @__PURE__ */ React.createElement(
      FoodMedia,
      {
        src: item.image,
        alt: item.name,
        fallback: "\u{1F371}",
        className: "h-full w-full text-3xl",
        imgClassName: "transition-transform duration-300 group-hover:scale-105"
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-2 right-2 rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-gray-900 shadow-sm dark:bg-gray-950 dark:text-white" }, "R", item.price)),
    /* @__PURE__ */ React.createElement("span", { className: "block min-w-0 p-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "block truncate text-xs font-bold text-gray-900 dark:text-white sm:text-sm" }, item.name), /* @__PURE__ */ React.createElement("span", { className: "mt-1 block truncate text-[10px] font-medium text-gray-600 dark:text-gray-300 sm:text-xs" }, item.shopName), (item.shopCuisine || item.shopDistance) && /* @__PURE__ */ React.createElement("span", { className: "mt-0.5 block truncate text-xs text-gray-600 dark:text-gray-300" }, [item.shopCuisine, item.shopDistance].filter(Boolean).join(" \xB7 ")))
  ))), /* @__PURE__ */ React.createElement(AnimatePresence, null, previewFood && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[500] flex items-center justify-center bg-black/90 p-4 sm:p-8",
      onClick: () => setPreviewFood(null),
      role: "dialog",
      "aria-modal": "true",
      "aria-label": `${previewFood.name} photo`
    },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setPreviewFood(null),
        "aria-label": "Close food photo",
        className: "absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white backdrop-blur hover:bg-white/25 sm:right-6 sm:top-6"
      },
      "\xD7"
    ),
    /* @__PURE__ */ React.createElement("div", { className: "flex max-h-full w-full max-w-3xl flex-col items-center gap-3", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "h-[min(72dvh,680px)] w-full overflow-hidden rounded-2xl bg-black/20 sm:rounded-3xl" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: previewFood.image, alt: previewFood.name, fallback: "\u{1F371}", className: "text-7xl", imgClassName: "!object-contain" })), /* @__PURE__ */ React.createElement("p", { className: "max-w-full truncate text-center text-sm font-semibold text-white sm:text-base" }, previewFood.name))
  )), /* @__PURE__ */ React.createElement(AnimatePresence, null, crossShopCandidate && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: "cross-shop-dialog",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[300] flex items-end sm:items-center justify-center",
      onClick: () => setCrossShopCandidate(null)
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }),
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { y: 60, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 60, opacity: 0 },
        transition: { type: "spring", damping: 26, stiffness: 280 },
        onClick: (e) => e.stopPropagation(),
        className: "relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden"
      },
      /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-r from-amber-500 to-rose-500 px-6 pt-6 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-white text-base leading-tight" }, "Different Shop"), /* @__PURE__ */ React.createElement("p", { className: "text-amber-100 text-[11px] font-semibold" }, "Your cart is from another place")))),
      /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: cart[0]?.item.shopImage, alt: cart[0]?.item.shopName, fallback: "\u{1F3EA}", className: "text-lg", imgClassName: "rounded-xl" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black text-gray-400 uppercase tracking-wider" }, "Current cart"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-black text-gray-900 dark:text-white truncate" }, cart[0]?.item.shopName), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500" }, cart.length, " item", cart.length !== 1 ? "s" : "", " \xB7 R", cart.reduce((s, ci) => s + ci.item.price * ci.qty, 0).toFixed(2)))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-gray-200 dark:bg-gray-700" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-gray-400 uppercase" }, "you tapped"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 h-px bg-gray-200 dark:bg-gray-700" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-amber-200 dark:border-amber-700" }, /* @__PURE__ */ React.createElement(FoodMedia, { src: crossShopCandidate.shopImage, alt: crossShopCandidate.shopName, fallback: "\u{1F3EA}", className: "text-lg", imgClassName: "rounded-xl" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-black text-amber-600 uppercase tracking-wider" }, "New shop"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-black text-gray-900 dark:text-white truncate" }, crossShopCandidate.shopName), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 truncate" }, crossShopCandidate.name, " \xB7 R", crossShopCandidate.price))), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-500 dark:text-gray-400 text-center leading-relaxed" }, "You can only order from one shop at a time. Start a new cart from ", /* @__PURE__ */ React.createElement("strong", { className: "text-gray-800 dark:text-gray-200" }, crossShopCandidate.shopName), "?"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 mt-1" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setCrossShopCandidate(null),
          className: "py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
        },
        "Keep Current"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: handleReplaceCart,
          className: "py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
        },
        "Start Fresh \u{1F504}"
      )))
    )
  )), selectedFood && /* @__PURE__ */ React.createElement(
    FoodDetailModal,
    {
      item: selectedFood,
      onClose: () => setSelectedFood(null),
      navigate,
      cart,
      cartMeta,
      onAddToCart: handleAddToCart,
      onUpdateCartMeta: handleUpdateCartMeta,
      shopSiblings,
      onSiblingSelect: (sib) => setSelectedFood(sib)
    }
  ), showOrderReview && cart.length > 0 && /* @__PURE__ */ React.createElement(
    OrderReviewSheet,
    {
      cart,
      cartMeta,
      onClose: () => setShowOrderReview(false),
      onClearCart: handleClearCart,
      onUpdateCartMeta: handleUpdateCartMeta,
      onRemoveItem: handleRemoveItem
    }
  ), /* @__PURE__ */ React.createElement(AnimatePresence, null, cart.length > 0 && !selectedFood && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { scale: 0, opacity: 0, y: 20 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0, opacity: 0, y: 20 },
      transition: { type: "spring", stiffness: 280, damping: 20 },
      className: `fixed ${isNativeApp() ? "bottom-[14.75rem]" : "bottom-[9.75rem]"} right-4 sm:bottom-24 sm:right-8 z-50`
    },
    /* @__PURE__ */ React.createElement(
      motion.button,
      {
        type: "button",
        whileHover: { scale: 1.08 },
        whileTap: { scale: 0.94 },
        onClick: () => setShowOrderReview(true),
        "aria-label": `Open Food Basket (${totalCartItems} item${totalCartItems === 1 ? "" : "s"})`,
        title: `Food Basket: ${totalCartItems} item${totalCartItems === 1 ? "" : "s"}`,
        className: "relative h-[3.25rem] w-[3.25rem] rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-[2px] shadow-[0_8px_24px_rgba(245,158,11,0.45)] flex items-center justify-center group focus:outline-none sm:h-14 sm:w-14 cursor-pointer"
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-full h-full bg-slate-950 rounded-full flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-95" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" }), /* @__PURE__ */ React.createElement(ShoppingBag, { className: "h-6 w-6 text-amber-400 stroke-[2.2] transition-transform duration-300 group-hover:rotate-6 sm:h-7 sm:w-7" }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 right-2 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" })),
      /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] sm:text-[11px] font-black min-w-[1.35rem] h-[1.35rem] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse" }, totalCartItems)
    )
  )));
};
const matchItemToSubcategory = (item, tab, subId) => {
  if (!item) return false;
  if (subId === "all") return true;
  const text = `${item.name || ""} ${item.title || ""} ${item.description || ""} ${item.type || ""} ${item.kind || ""} ${item.propertyType || ""} ${item.category || ""} ${item.skills || ""}`.toLowerCase();
  const kind = String(item.kind || item.propertyType || "").toLowerCase().replace(/[\s-]+/g, "_");
  const pricePeriod = String(item.pricePeriod || item.period || (item.type === "rent" ? "month" : item.type === "office" ? "hour" : ["over", "hotel", "land"].includes(item.type) ? "night" : ["house", "apartment"].includes(kind) ? "day" : item.type === "resort" ? "day" : "")).toLowerCase().replace(/[\s-]+/g, "_");
  if (tab === "Property") {
    switch (subId) {
      case "rooms":
        return item.type === "rent" || item.type === "room" || item.kind === "room" || item.kind === "house" || item.kind === "studio" || item.kind === "cottage" || item.kind === "townhouse" || item.kind === "villa" || /room|house to rent|home to rent|cottage|flat|studio|townhouse|villa/i.test(text);
      case "guesthouse":
        return item.type === "over" || item.type === "guesthouse" || item.type === "guest_house" || item.kind === "guest_house" || item.kind === "guesthouse" || /guest\s*house|guesthouse|b&b|bed and breakfast/i.test(text);
      case "hotel":
        return item.type === "hotel" || item.kind === "hotel" || /hotel|motel/i.test(text);
      case "lodge":
        return item.type === "lodge" || item.kind === "lodge" || /lodge/i.test(text);
      case "apartment":
        return item.type === "apartment" || ["apartment", "complex"].includes(kind) || Number(item.numberOfApartments) > 0 || /apartment|complex|flat/i.test(text);
      case "full_house":
        return ["house", "full_house"].includes(kind) || /full house|entire house|whole house|standalone house/i.test(text);
      case "single_room":
        return ["room", "single_room"].includes(kind) || /single room|room to rent|room for rent|private room/i.test(text);
      case "studio":
        return kind === "studio" || /studio|bachelor apartment/i.test(text);
      case "townhouse":
        return ["townhouse", "town_house"].includes(kind) || /town\s?house/i.test(text);
      case "loft":
        return kind === "loft" || /\bloft\b/i.test(text);
      case "penthouse":
        return kind === "penthouse" || /penthouse/i.test(text);
      case "per_day":
        return pricePeriod === "day";
      case "per_month":
        return pricePeriod === "month";
      case "per_hour":
        return pricePeriod === "hour";
      case "self_catering":
        return item.type === "land" || item.type === "self_catering" || item.kind === "Self Catering" || item.kind === "self_catering" || item.kind === "chalet" || /self[-\s]?catering|chalet/i.test(text);
      case "resort":
        return item.type === "resort" || item.kind === "resort" || /resort|holiday park/i.test(text);
      case "hourly_room":
        return item.type === "office" || item.type === "hourly_room" || item.type === "room_hourly" || item.kind === "office" || item.kind === "hourly_room" || /hourly|room per hour|day room|short stay|workspace/i.test(text);
      default:
        return true;
    }
  }
  if (tab === "Services" || tab === "Service" || tab === "Helper" || tab === "Helpers") {
    switch (subId) {
      case "domestic":
        return item.type === "domestic" || item.type === "maid" || item.type === "cleaner" || item.type === "nanny" || /domestic|clean|maid|housekeep|nanny/i.test(text);
      case "chef":
        return item.type === "chef" || item.type === "baker" || item.type === "catering" || /chef|cook|culinary|catering|food/i.test(text);
      case "beauty":
        return item.type === "beauty" || item.type === "beauty_specialist" || item.type === "nails" || item.type === "hair" || item.type === "massage" || /beauty|skin|lash|nail|facial|hair|makeup|massage/i.test(text);
      case "barber":
        return item.type === "barber" || /barber|haircut|fade|beard|groom/i.test(text);
      case "photography":
        return item.type === "photograph" || item.type === "photography" || /photo|photograph|camera|videograph|portrait/i.test(text);
      case "sneakers":
      case "sneaker":
        return item.type === "sneaker" || item.type === "sneakers" || /sneaker|kicks|shoe clean/i.test(text);
      case "carwash":
        return item.type === "carwash" || /car\s*wash|carwash|valet|auto detail/i.test(text);
      case "moving":
        return item.type === "moving" || /moving|relocation|logistics|hauling|bakkie|transport/i.test(text);
      case "transport":
        return item.type === "transport" || item.type === "schoolTransport" || /transport|shuttle|taxi|driver|ride/i.test(text);
      case "storage":
        return item.type === "storage" || /storage|self storage|vault|container/i.test(text);
      case "handyman":
        return item.type === "handyman" || item.type === "electrician" || item.type === "plumber" || /handyman|electric|plumb|pipe|repair|install/i.test(text);
      case "other":
      case "others":
        return true;
      default:
        return true;
    }
  }
  if (tab === "Events") {
    switch (subId) {
      case "music":
        return item.category === "music" || item.type === "music" || /music|concert|dj|festival|live band|party/i.test(text);
      case "sports":
        return item.category === "sports" || item.category === "sport" || item.type === "sports" || item.type === "sport" || /sport|tournament|match|soccer|football|rugby|marathon/i.test(text);
      case "arts":
      case "art":
        return item.category === "arts" || item.category === "art" || item.type === "arts" || item.type === "art" || /art|theatre|theater|gallery|exhibition|expo/i.test(text);
      case "community":
        return item.category === "community" || item.type === "community" || /community|networking|workshop|meetup|church/i.test(text);
      case "food":
        return item.category === "food" || item.type === "food" || /food|wine|tasting|braai|market|cookout/i.test(text);
      case "outdoors":
      case "hiking":
        return item.category === "outdoors" || item.category === "hiking" || item.type === "hiking" || item.type === "outdoors" || /hike|hiking|outdoor|trail|camping|safari/i.test(text);
      default:
        return true;
    }
  }
  if (tab === "Selling" || tab === "Sell" || tab === "Marketplace") {
    switch (subId) {
      case "furniture":
        return item.category === "furniture" || item.type === "furniture" || /furniture|sofa|bed|table|couch|chair/i.test(text);
      case "electronics":
        return item.category === "electronics" || item.type === "electronics" || /electronic|phone|laptop|tv|computer|gadget/i.test(text);
      case "clothes":
        return item.category === "clothes" || item.type === "clothes" || /cloth|shoe|dress|shirt|jacket|wear/i.test(text);
      case "universities":
        return item.category === "universities" || item.type === "universities" || /uni|university|student|campus/i.test(text);
      case "books":
        return item.category === "books" || item.type === "books" || /book|textbook|novel|study/i.test(text);
      case "other":
        return item.category === "other" || item.type === "other";
      default:
        return true;
    }
  }
  if (tab === "LookingFor" || tab === "Needs") {
    switch (subId) {
      case "urgent":
        return item.urgency === "immediate" || item.urgency === "urgent" || Number(item.budget || 0) >= 300 || /urgent|asap|immediate|emergency/i.test(text);
      case "highpay":
        return Number(item.budget || item.price || 0) >= 300;
      case "roommate":
        return item.category === "roommate" || /roommate|sharing|flatmate|room share/i.test(text);
      case "room":
        return item.category === "room" || /room|accommodation|place to stay/i.test(text);
      case "nanny":
        return item.category === "nanny" || item.category === "household" || /nanny|helper|cleaner|maid|babysit/i.test(text);
      case "errand":
        return item.category === "errand" || /errand|delivery|pickup|groceries|driver/i.test(text);
      case "dog":
      case "pets":
        return item.category === "dog" || item.category === "pet" || /dog|cat|pet|walk/i.test(text);
      case "other":
        return item.category === "other" || item.category === "pampering" || item.category === "general";
      default:
        return true;
    }
  }
  return true;
};
const LookingForFeedCard = ({ item, navigate }) => {
  const user = typeof item.userRef === "object" ? item.userRef : null;
  const username = user?.username || item.name || "Neighbor";
  const avatar = user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";
  const isUrgent = item.urgency === "immediate" || item.urgency === "urgent";
  const budget = Number(item.budget || item.price || 0);
  const phone = user?.phone || item.contactPhone || item.contact;
  const getRemainingTime = (createdAt) => {
    if (!createdAt) return "24h Broadcast";
    const created = new Date(createdAt).getTime();
    const remainingMs = 24 * 60 * 60 * 1e3 - (Date.now() - created);
    if (remainingMs <= 0) return "Expiring soon";
    const hours = Math.floor(remainingMs / (1e3 * 60 * 60));
    const mins = Math.floor(remainingMs % (1e3 * 60 * 60) / (1e3 * 60));
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };
  const remaining = getRemainingTime(item.createdAt);
  return /* @__PURE__ */ React.createElement(
    motion.div,
    {
      whileHover: { y: -4 },
      onClick: () => navigate("/micro-gigs"),
      className: "cursor-pointer h-full flex flex-col justify-between rounded-[1.75rem] bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 p-5 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(15,23,42,0.12)] transition-all duration-300 group relative"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "relative shrink-0" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: avatar,
        alt: username,
        className: "w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-gray-700",
        onError: (e) => {
          e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(username);
        }
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-black text-slate-900 dark:text-white truncate" }, username), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-400 dark:text-slate-500 block truncate" }, item.location || "Local Neighbor"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 shrink-0" }, isUrgent && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-[9px] font-black border border-rose-200 dark:border-rose-900/60" }, /* @__PURE__ */ React.createElement(Flame, { className: "w-2.5 h-2.5 fill-rose-500" }), " Urgent"), /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-black border border-amber-200/60 dark:border-amber-900/40" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-2.5 h-2.5" }), " ", remaining))), /* @__PURE__ */ React.createElement("h3", { className: "text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2" }, item.title), item.description && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed" }, item.description), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-1.5 mt-3" }, /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider" }, item.category || "General Need"), item.location && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 truncate max-w-[130px]" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-2.5 h-2.5 text-rose-500 shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "truncate" }, item.location)))),
    /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-3.5 border-t border-slate-100 dark:border-gray-800/80 flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-left" }, /* @__PURE__ */ React.createElement("span", { className: "text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-tight" }, "Payout Offer"), /* @__PURE__ */ React.createElement("span", { className: "text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400" }, budget > 0 ? `R${budget.toLocaleString()}` : "Open Bid")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, phone && /* @__PURE__ */ React.createElement(
      "a",
      {
        href: `https://wa.me/${String(phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${username}, I saw your request on LoopOut: "${item.title}". I'm available to help!`)}`,
        target: "_blank",
        rel: "noreferrer",
        onClick: (e) => e.stopPropagation(),
        className: "p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-500 hover:text-white transition-colors",
        title: "Quick WhatsApp message"
      },
      /* @__PURE__ */ React.createElement(FaWhatsapp, { className: "w-3.5 h-3.5" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          navigate("/micro-gigs");
        },
        className: "px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-600 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-rose-500 dark:hover:text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
      },
      /* @__PURE__ */ React.createElement("span", null, "Offer Help"),
      /* @__PURE__ */ React.createElement(ArrowRight, { className: "w-3 h-3" })
    )))
  );
};
const RecentlyViewedStrip = ({ items = [], navigate }) => {
  const stripRef = useRef(null);
  if (!items.length) return null;
  const scrollStrip = (direction) => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ left: direction * Math.max(260, stripRef.current.clientWidth * 0.75), behavior: "smooth" });
  };
  return /* @__PURE__ */ React.createElement("section", { "aria-label": "Recently viewed listings", className: "mb-7" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex items-end justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400" }, "Your activity"), /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold tracking-tight text-slate-900 dark:text-white" }, "Continue exploring")), /* @__PURE__ */ React.createElement("div", { className: "flex shrink-0 items-center gap-1.5" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => scrollStrip(-1), "aria-label": "Scroll recently viewed left", className: "flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-900 hover:text-white dark:bg-slate-800 dark:text-gray-200 dark:ring-slate-700" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => scrollStrip(1), "aria-label": "Scroll recently viewed right", className: "flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-900 hover:text-white dark:bg-slate-800 dark:text-gray-200 dark:ring-slate-700" }, /* @__PURE__ */ React.createElement(ChevronRight, { className: "h-4 w-4" })))), /* @__PURE__ */ React.createElement("div", { ref: stripRef, className: "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-hide sm:gap-4" }, items.slice(0, 12).map((item, index) => /* @__PURE__ */ React.createElement("div", { key: `recently-viewed-${item._id || item.id || index}`, className: "w-[145px] shrink-0 snap-start sm:w-[180px]" }, /* @__PURE__ */ React.createElement(
    AirbnbCard,
    {
      item,
      type: item.itemType === "listing" ? "property" : item.itemType || "service",
      reducedSize: true,
      showOwner: false,
      showCategory: false,
      showAccountOwner: false,
      onClick: (path) => navigate(path)
    }
  )))));
};
const getActiveBookingCount = (activeTab, bookings = []) => {
  const isPropertyTab = ["Property", "Properties"].includes(activeTab);
  const isServiceTab = ["Helper", "Helpers", "Services"].includes(activeTab);
  if (!isPropertyTab && !isServiceTab) return 0;
  return bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    if (["completed", "cancelled", "canceled", "declined", "rejected"].includes(status)) return false;
    const isPropertyBooking = Boolean(booking.listing) || ["listing", "property", "stay"].includes(String(booking.itemType || booking.type || "").toLowerCase());
    const isServiceBooking = Boolean(booking.helper || booking.service) || ["helper", "service"].includes(String(booking.itemType || booking.type || "").toLowerCase());
    return isPropertyTab ? isPropertyBooking : isServiceBooking;
  }).length;
};
const ActiveBookingsChip = ({ activeTab, bookings, isBookingsOpen, setIsBookingsOpen }) => {
  const isPropertyTab = ["Property", "Properties"].includes(activeTab);
  const isServiceTab = ["Helper", "Helpers", "Services"].includes(activeTab);
  if (!isPropertyTab && !isServiceTab) return null;
  const count = getActiveBookingCount(activeTab, bookings);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    motion.button,
    {
      type: "button",
      whileTap: { scale: 0.96 },
      onClick: () => setIsBookingsOpen(true),
      "aria-label": `Open active bookings, ${count} ${count === 1 ? "booking" : "bookings"}`,
      className: "flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/50"
    },
    /* @__PURE__ */ React.createElement(CalendarDays, { className: "h-4 w-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Bookings"),
    /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-white px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-gray-900 dark:text-rose-200" }, count)
  ), isBookingsOpen && /* @__PURE__ */ React.createElement(ActiveBookingsPopover, { activeTab, bookings, onClose: () => setIsBookingsOpen(false) }));
};
const ActiveBookingsPopover = ({ activeTab, bookings, onClose }) => {
  const isPropertyTab = ["Property", "Properties"].includes(activeTab);
  const activeItems = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    if (["completed", "cancelled", "canceled", "declined", "rejected"].includes(status)) return false;
    const isPropertyBooking = Boolean(booking.listing) || ["listing", "property", "stay"].includes(String(booking.itemType || booking.type || "").toLowerCase());
    const isServiceBooking = Boolean(booking.helper || booking.service) || ["helper", "service"].includes(String(booking.itemType || booking.type || "").toLowerCase());
    return isPropertyTab ? isPropertyBooking : isServiceBooking;
  });
  return createPortal(
    /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[1400] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4", onClick: onClose }, /* @__PURE__ */ React.createElement("section", { role: "dialog", "aria-modal": "true", "aria-labelledby": "home-active-bookings-title", className: "max-h-[82dvh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-gray-900 sm:rounded-3xl", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("header", { className: "flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { id: "home-active-bookings-title", className: "text-lg font-extrabold text-slate-900 dark:text-white" }, "Your bookings"), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-sm text-slate-500 dark:text-gray-400" }, isPropertyTab ? "Property" : "Service", " bookings \xB7 ", activeItems.length)), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onClose, "aria-label": "Close bookings", className: "grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { className: "max-h-[65dvh] space-y-3 overflow-y-auto p-4" }, activeItems.length ? activeItems.map((booking) => {
      const item = booking.listing || booking.helper || booking.service || booking.event || {};
      const bookingDate = new Date(booking.startDate || booking.date || booking.createdAt);
      const dateLabel = Number.isNaN(bookingDate.getTime()) ? "Date to be confirmed" : bookingDate.toLocaleString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const title = item.name || item.title || booking.serviceName || booking.title || "Booking request";
      const status = String(booking.status || "pending").replace(/[_-]/g, " ");
      const serviceDetails = [
        booking.subtype,
        booking.functionType,
        booking.selectedHaircut && `Haircut: ${booking.selectedHaircut}`,
        booking.beardGrooming && `Beard grooming: ${booking.beardGrooming}`,
        booking.serviceDuration && `Duration: ${booking.serviceDuration}`,
        booking.specialRequirements && `Request: ${booking.specialRequirements}`
      ].filter(Boolean).join(" \xB7 ");
      const rawAddress = booking.requestLocation || booking.address || item.businessAddress || item.address || item.location;
      const address = typeof rawAddress === "string" ? rawAddress : rawAddress?.formattedAddress || rawAddress?.address || "";
      const contact = item.contact || item.phone || item.userRef?.phone || item.creator?.phone || booking.phone;
      return /* @__PURE__ */ React.createElement("article", { key: booking._id || booking.id || `${title}-${dateLabel}`, className: "rounded-2xl border border-slate-200 p-4 dark:border-gray-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "truncate font-bold text-slate-900 dark:text-white" }, title), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-slate-600 dark:text-gray-300" }, dateLabel)), /* @__PURE__ */ React.createElement("span", { className: "shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" }, status)), (booking.selectedPerformer || booking.totalPrice || booking.totalAmount) && /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-gray-400" }, booking.selectedPerformer && /* @__PURE__ */ React.createElement("span", null, "Provider: ", booking.selectedPerformer), (booking.totalPrice || booking.totalAmount) && /* @__PURE__ */ React.createElement("span", null, "Total: R", booking.totalPrice || booking.totalAmount)), /* @__PURE__ */ React.createElement("div", { className: "mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm dark:border-gray-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2 text-slate-700 dark:text-gray-300" }, /* @__PURE__ */ React.createElement(Wrench, { className: "mt-0.5 h-4 w-4 shrink-0 text-slate-500" }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", { className: "font-semibold" }, "Service:"), " ", serviceDetails || booking.serviceName || item.type || title)), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2 text-slate-700 dark:text-gray-300" }, /* @__PURE__ */ React.createElement(MapPin, { className: "mt-0.5 h-4 w-4 shrink-0 text-slate-500" }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", { className: "font-semibold" }, "Address:"), " ", address || "Not provided")), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2 text-slate-700 dark:text-gray-300" }, /* @__PURE__ */ React.createElement(Phone, { className: "mt-0.5 h-4 w-4 shrink-0 text-slate-500" }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", { className: "font-semibold" }, "Contact:"), " ", contact ? /* @__PURE__ */ React.createElement("a", { href: `tel:${String(contact).replace(/[^\d+]/g, "")}`, className: "underline underline-offset-2" }, contact) : "Not provided"))));
    }) : /* @__PURE__ */ React.createElement("div", { className: "py-10 text-center" }, /* @__PURE__ */ React.createElement(CalendarDays, { className: "mx-auto h-8 w-8 text-slate-400" }), /* @__PURE__ */ React.createElement("p", { className: "mt-3 font-semibold text-slate-800 dark:text-gray-200" }, "No active bookings here yet"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-slate-500 dark:text-gray-400" }, "Your booking requests will appear here."))))),
    document.body
  );
};
function MobileAppHomepage({
  featuredProperties,
  featuredServices,
  featuredHelpers,
  featuredEvents,
  featuredSellItems,
  featuredLookingFor = [],
  loadingProperties,
  loadingServices,
  loadingHelpers,
  loadingEvents,
  loadingSellItems,
  loadingLookingFor = false,
  stats,
  onItemClick,
  recentlyViewedItems,
  onRecentlyViewedLike,
  currentLocation = "South Africa",
  navigate,
  aiRecommendations,
  aiInsights,
  aiTrendData,
  onAISuggestionClick,
  recentlyAddedItems,
  locationStatus,
  requestCount = 0,
  activeBookings = [],
  geoCity,
  geoLoading,
  geoError,
  onRequestLocation,
  currentUser,
  homeLoadError,
  onRetryHomeData
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Homes");
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [activeFeaturedTab, setActiveFeaturedTab] = useState("Properties");
  const locationLabel = geoCity || currentLocation || "your area";
  const [showLocationToast, setShowLocationToast] = useState(true);
  useEffect(() => {
    if (geoLoading) {
      setShowLocationToast(true);
      return;
    }
    const timer = setTimeout(() => setShowLocationToast(false), 4e3);
    return () => clearTimeout(timer);
  }, [geoLoading, geoCity, geoError]);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastHeaderDirectionYRef = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;
      if (currentScrollY < 50) {
        setIsHeaderVisible(true);
        lastHeaderDirectionYRef.current = currentScrollY;
      } else if (Math.abs(currentScrollY - lastHeaderDirectionYRef.current) >= 8) {
        setIsHeaderVisible(isScrollingUp);
        lastHeaderDirectionYRef.current = currentScrollY;
      }
      setIsScrolled(currentScrollY > 60);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      const isShuttle = activeTab === "Shuttle" || activeTab === "Shuttles" || /(shuttle|ride|taxi|bus|transport|moving truck|mokopane|muko pane)/i.test(query);
      if (isShuttle) {
        navigate(`/shuttles?q=${encodeURIComponent(query)}`);
      } else {
        navigate(`/search?searchTerm=${encodeURIComponent(query)}&type=all&address=${encodeURIComponent(currentLocation)}`);
      }
      setSearchTerm("");
    }
  };
  const [activeTab, setActiveTab] = useState("RecentAdded");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isCategoriesSheetOpen, setIsCategoriesSheetOpen] = useState(false);
  const [isRecentPopoutOpen, setIsRecentPopoutOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const isSheetOpen = Boolean(isRecentPopoutOpen || isCategoriesSheetOpen);
    dispatch(setHideBottomNav(isSheetOpen));
    dispatch(setHideHeader(isSheetOpen));
    if (isSheetOpen) {
      document.body.classList.add("hide-bottom-nav");
    } else {
      document.body.classList.remove("hide-bottom-nav");
    }
    return () => {
      dispatch(setHideBottomNav(false));
      dispatch(setHideHeader(false));
      document.body.classList.remove("hide-bottom-nav");
    };
  }, [isRecentPopoutOpen, isCategoriesSheetOpen, dispatch]);
  useEffect(() => {
    setVisibleCount(8);
  }, [activeTab, activeSubcategory]);
  const tabs = [
    {
      id: "RecentAdded",
      label: "Recent",
      emoji: "\u2728",
      icon: Sparkles,
      desc: "New listings",
      textColor: "text-rose-600",
      bgColor: "bg-rose-500",
      subcategories: [
        { id: "all", label: "All Recent", emoji: "\u2728", desc: "All new additions" },
        { id: "property", label: "Property", emoji: "\u{1F3E1}", desc: "Recent properties & stays" },
        { id: "service", label: "Services", emoji: "\u{1F6E0}\uFE0F", desc: "Recent services & pros" },
        { id: "helper", label: "Helper", emoji: "\u{1F9F9}", desc: "Recent helpers & bookings" },
        { id: "selling", label: "Item for Sale", emoji: "\u{1F3F7}\uFE0F", desc: "Recent marketplace items" }
      ]
    },
    {
      id: "Property",
      label: "Properties",
      emoji: "\u{1F3E1}",
      icon: House,
      desc: "Rooms & stays",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-500",
      subcategories: [
        { id: "all", label: "All Properties", emoji: "\u{1F3E1}", desc: "Explore all properties" },
        { id: "rooms", label: "Rooms & Rent", emoji: "\u{1F3E0}", desc: "Rooms, homes & apartments for rent" },
        { id: "full_house", label: "Full House", emoji: "\u{1F3E1}", desc: "Entire houses and homes" },
        { id: "single_room", label: "Single Room", emoji: "\u{1F6CF}\uFE0F", desc: "Private rooms for rent" },
        { id: "studio", label: "Studio", emoji: "\u{1FAB4}", desc: "Studio and bachelor apartments" },
        { id: "townhouse", label: "Townhouse", emoji: "\u{1F3D8}\uFE0F", desc: "Townhouses and cluster homes" },
        { id: "loft", label: "Loft", emoji: "\u{1F3D9}\uFE0F", desc: "Loft apartments" },
        { id: "penthouse", label: "Penthouse", emoji: "\u{1F307}", desc: "Penthouses and top-floor homes" },
        { id: "guesthouse", label: "Guest House & B&B", emoji: "\u{1F6CC}", desc: "B&B and guest houses" },
        { id: "hotel", label: "Hotels", emoji: "\u{1F3E8}", desc: "Hotels & luxury suites" },
        { id: "lodge", label: "Lodges", emoji: "\u{1F3E1}", desc: "Safari & nature lodges" },
        { id: "apartment", label: "Apartment & Complex", emoji: "\u{1F3E2}", desc: "Apartment complexes & flats" },
        { id: "per_day", label: "Per Day", emoji: "\u2600\uFE0F", desc: "Properties priced per day" },
        { id: "per_month", label: "Per Month", emoji: "\u{1F4C5}", desc: "Properties priced per month" },
        { id: "per_hour", label: "Per Hour", emoji: "\u23F1\uFE0F", desc: "Rooms and stays priced per hour" },
        { id: "self_catering", label: "Self Catering", emoji: "\u{1F373}", desc: "Self catering stays & chalets" },
        { id: "resort", label: "Holiday Park & Resort", emoji: "\u{1F3D6}\uFE0F", desc: "Holiday parks & resorts" },
        { id: "hourly_room", label: "Room Per Hour", emoji: "\u{1F6AA}", desc: "Short stay & hourly rooms" }
      ]
    },
    {
      id: "Helper",
      label: "Local Services",
      emoji: "\u{1F6E0}\uFE0F",
      icon: Wrench,
      desc: "Local services & helpers",
      textColor: "text-amber-600",
      bgColor: "bg-amber-500",
      subcategories: [
        { id: "all", label: "All Local Services", emoji: "\u{1F6E0}\uFE0F", desc: "Explore all helpers & services" },
        { id: "barber", label: "Barber", emoji: "\u2702\uFE0F", desc: "Haircuts & grooming" },
        { id: "beauty", label: "Beauty Specialist", emoji: "\u{1F485}", desc: "Hair, nails & makeup" },
        { id: "domestic", label: "Domestic Helper", emoji: "\u{1F9F9}", desc: "Cleaning, laundry, chores" },
        { id: "chef", label: "Private Chef", emoji: "\u{1F468}\u200D\u{1F373}", desc: "Meal preparation" },
        { id: "photography", label: "Photographer", emoji: "\u{1F4F8}", desc: "Photography, shoots & events" },
        { id: "sneaker", label: "Sneaker Cleaner", emoji: "\u{1F45F}", desc: "Sneaker cleaning & restoration" },
        { id: "carwash", label: "Car Wash", emoji: "\u{1F697}\u{1F4A6}", desc: "Car cleaning & detailing" },
        { id: "moving", label: "Moving", emoji: "\u{1F69A}", desc: "Home and office relocation" },
        { id: "other", label: "Other Services", emoji: "\u2728", desc: "Other skills and services" }
      ]
    },
    {
      id: "Selling",
      label: "Marketplace",
      emoji: "\u{1F3F7}\uFE0F",
      icon: Tags,
      desc: "Buy & sell",
      textColor: "text-teal-600",
      bgColor: "bg-teal-500",
      subcategories: [
        { id: "all", label: "All Items", emoji: "\u{1F3F7}\uFE0F" },
        { id: "furniture", label: "Furniture", emoji: "\u{1F6CB}\uFE0F" },
        { id: "electronics", label: "Electronics", emoji: "\u{1F4BB}" },
        { id: "clothes", label: "Clothes", emoji: "\u{1F455}" },
        { id: "universities", label: "Universities", emoji: "\u{1F393}" },
        { id: "books", label: "Books", emoji: "\u{1F4DA}" },
        { id: "other", label: "Other Items", emoji: "\u{1F3F7}\uFE0F" }
      ]
    },
    {
      id: "Lunch",
      label: "Food & Lunch",
      emoji: "\u{1F371}",
      icon: UtensilsCrossed,
      desc: "Food & eats",
      textColor: "text-orange-600",
      bgColor: "bg-orange-500"
    },
    {
      id: "Shuttle",
      label: "Shuttles",
      emoji: "\u{1F690}",
      icon: Bus,
      desc: "Inter-provincial & Local",
      textColor: "text-teal-600",
      bgColor: "bg-teal-500",
      route: "/shuttles",
      subcategories: [
        { id: "all", label: "All Shuttles", emoji: "\u{1F690}", desc: "All available routes" },
        { id: "interprovincial", label: "Inter-Provincial", emoji: "\u{1F6E3}\uFE0F", desc: "Province to Province" },
        { id: "local", label: "Local Transit", emoji: "\u{1F4CD}", desc: "Town & campus routes" },
        { id: "urgent", label: "Boarding Soon", emoji: "\u26A1", desc: "Departing within 2 hours" }
      ]
    }
  ];
  const visibleTabs = useMemo(() => {
    const pinnedIds = ["Property", "Helper", "Lunch", "Shuttle"];
    const pinnedTabs = pinnedIds.map((id) => tabs.find((tab) => tab.id === id)).filter(Boolean);
    const currentTab = tabs.find((t) => t.id === activeTab);
    const hideFromTopBar = ["RecentAdded", "Property", "Helper", "Lunch", "Selling", "Shuttle"].includes(currentTab?.id);
    return currentTab && !pinnedIds.includes(currentTab.id) && !hideFromTopBar ? [...pinnedTabs, currentTab] : pinnedTabs;
  }, [tabs, activeTab]);
  const currentTabLabel = useMemo(() => {
    if (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") return "Recent";
    const found = tabs.find((t) => t.id === activeTab);
    return found?.label || activeTab;
  }, [activeTab, tabs]);
  const getSourceForTab = useCallback((tab) => {
    if (tab === "RecentAdded" || tab === "Recent Added" || tab === "Recent") return recentlyAddedItems || [];
    if (tab === "Property" || tab === "Properties") return featuredProperties || [];
    if (tab === "Helper" || tab === "Helpers" || tab === "Services" || tab === "Service" || tab === "Local Services") {
      const helpers = (featuredHelpers || []).map((h) => ({ ...h, itemType: "helper" }));
      const services = (featuredServices || []).map((s) => ({ ...s, itemType: "service" }));
      return [...helpers, ...services];
    }
    if (tab === "Events") return featuredEvents || [];
    if (tab === "Selling" || tab === "Sell" || tab === "Marketplace") return featuredSellItems || [];
    if (tab === "LookingFor" || tab === "Needs") return featuredLookingFor || [];
    if (tab === "Shuttle" || tab === "Shuttles") return [];
    return [];
  }, [recentlyAddedItems, featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems, featuredLookingFor]);
  const filteredItems = useMemo(() => {
    const source = getSourceForTab(activeTab);
    if (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") {
      if (activeSubcategory === "all") return source;
      return source.filter((item) => {
        const type = item.itemType === "listing" ? "property" : item.itemType || "";
        return type === activeSubcategory;
      });
    }
    return source.filter((item) => matchItemToSubcategory(item, activeTab, activeSubcategory));
  }, [activeTab, activeSubcategory, getSourceForTab]);
  const loadMoreSentinelRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  useEffect(() => {
    if (visibleCount >= filteredItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 8, filteredItems.length));
            setIsLoadingMore(false);
          }, 200);
        }
      },
      { rootMargin: "350px" }
    );
    const el = loadMoreSentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [visibleCount, filteredItems.length, isLoadingMore]);
  const getSubcategoryCount = useCallback((tab, subId) => {
    const source = getSourceForTab(tab);
    if (tab === "RecentAdded" || tab === "Recent Added" || tab === "Recent") {
      if (subId === "all") return source.length;
      return source.filter((item) => {
        const type = item.itemType === "listing" ? "property" : item.itemType || "";
        return type === subId;
      }).length;
    }
    return source.filter((item) => matchItemToSubcategory(item, tab, subId)).length;
  }, [getSourceForTab]);
  const currentCategoryObj = useMemo(() => tabs.find((t) => t.id === activeTab) || tabs[0], [activeTab, tabs]);
  const isLoadingCurrentTab = useMemo(() => {
    if (activeTab === "Property" || activeTab === "Properties") return loadingProperties;
    if (activeTab === "Helper" || activeTab === "Helpers" || activeTab === "Services" || activeTab === "Service" || activeTab === "Local Services") return loadingHelpers && loadingServices;
    if (activeTab === "Events") return loadingEvents;
    if (activeTab === "Selling" || activeTab === "Sell" || activeTab === "Marketplace") return loadingSellItems;
    if (activeTab === "Shuttle" || activeTab === "Shuttles") return false;
    if (activeTab === "LookingFor" || activeTab === "Needs") return loadingLookingFor;
    if (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") {
      return loadingProperties || loadingServices || loadingHelpers || loadingEvents || loadingSellItems || loadingLookingFor;
    }
    return false;
  }, [activeTab, loadingProperties, loadingServices, loadingHelpers, loadingEvents, loadingSellItems, loadingLookingFor]);
  const getTabColor = (id) => {
    switch (id) {
      case "RecentAdded":
      case "Recent Added":
      case "Recent":
        return "bg-rose-500";
      case "Property":
      case "Properties":
        return "bg-emerald-500";
      case "Services":
        return "bg-amber-500";
      case "Helper":
      case "Helpers":
        return "bg-amber-500";
      case "Events":
        return "bg-purple-500";
      case "Selling":
      case "Sell":
      case "Marketplace":
        return "bg-teal-500";
      case "LookingFor":
      case "Needs":
        return "bg-rose-500";
      default:
        return "bg-gray-900";
    }
  };
  if (isDesktop) {
    return /* @__PURE__ */ React.createElement(
      DesktopHomepage,
      {
        tabs,
        visibleTabs,
        activeTab,
        setActiveTab,
        activeSubcategory,
        setActiveSubcategory,
        showAllCategories,
        setShowAllCategories,
        isCategoriesSheetOpen,
        setIsCategoriesSheetOpen,
        currentCategoryObj,
        getSubcategoryCount,
        featuredProperties,
        featuredServices,
        featuredHelpers,
        featuredEvents,
        featuredSellItems,
        featuredLookingFor,
        loadingProperties,
        loadingServices,
        loadingHelpers,
        loadingEvents,
        loadingSellItems,
        loadingLookingFor,
        recentlyAddedItems,
        recentlyViewedItems,
        navigate,
        currentUser,
        isBookingsOpen,
        setIsBookingsOpen,
        requestCount,
        activeBookings,
        stats,
        homeLoadError,
        onRetryHomeData,
        isHeaderVisible,
        isScrolled
      }
    );
  }
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-white dark:bg-gray-950 pb-32 relative w-full" }, /* @__PURE__ */ React.createElement(Helmet, null, /* @__PURE__ */ React.createElement("title", null, "loopOut | Find Homes, Services & Helpers Near You"), /* @__PURE__ */ React.createElement("meta", { name: "description", content: "Discover verified helpers, book top services, and explore properties in your area with loopOut." })), /* @__PURE__ */ React.createElement("style", null, `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `), /* @__PURE__ */ React.createElement(
    WelcomeChoices,
    {
      navigate,
      onChoose: (choice) => {
        if (choice === "Shuttle") {
          navigate("/shuttles");
          return;
        }
        setActiveTab(choice);
        setActiveSubcategory("all");
      }
    }
  ), /* @__PURE__ */ React.createElement("main", { className: "w-full bg-white px-4 pb-4 pt-2 dark:bg-gray-950" }, homeLoadError && /* @__PURE__ */ React.createElement(HomeDataErrorNotice, { onRetry: onRetryHomeData }), activeTab === "Lunch" && /* @__PURE__ */ React.createElement(FoodSpecialsStrip, { navigate, className: "mt-7" }), /* @__PURE__ */ React.createElement(AnimatePresence, null, showLocationToast && /* @__PURE__ */ React.createElement(
    motion.button,
    {
      initial: { opacity: 0, y: -8, height: 0, marginBottom: 0 },
      animate: { opacity: 1, y: 0, height: "auto", marginBottom: 12 },
      exit: { opacity: 0, y: -8, height: 0, marginBottom: 0 },
      transition: { duration: 0.3 },
      onClick: onRequestLocation,
      className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 active:scale-95 overflow-hidden mb-3"
    },
    geoLoading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Loader2, { className: "w-3.5 h-3.5 animate-spin text-gray-400 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Finding your location\u2026")) : geoCity ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(MapPin, { className: "w-3.5 h-3.5 text-rose-500 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Showing results near ", /* @__PURE__ */ React.createElement("span", { className: "text-gray-900" }, geoCity))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(MapPin, { className: "w-3.5 h-3.5 text-gray-400 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, geoError ? "Enable location for results near you" : "Set your location"))
  )), activeTab !== "Lunch" && /* @__PURE__ */ React.createElement("section", { id: "explore-section", className: "mb-8" }, currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && activeTab !== "RecentAdded" && activeTab !== "Recent Added" && activeTab !== "Recent" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5 mb-5 -mx-4 px-4 snap-x" }, currentCategoryObj.subcategories.map((sub, index) => {
    const isSubActive = activeSubcategory === sub.id;
    const count = getSubcategoryCount(activeTab, sub.id);
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: sub.id }, /* @__PURE__ */ React.createElement(
      motion.button,
      {
        whileTap: { scale: 0.95 },
        onClick: () => setActiveSubcategory(sub.id),
        className: `snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${isSubActive ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900" : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"}`
      },
      /* @__PURE__ */ React.createElement(CategoryNavIcon, { id: sub.id, className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ React.createElement("span", { className: "whitespace-nowrap tracking-tight" }, sub.label),
      /* @__PURE__ */ React.createElement("span", { className: `text-[9px] px-1.5 py-0.5 rounded-full font-black ${isSubActive ? "bg-rose-500 text-white" : "bg-white text-slate-500 border border-slate-200"}` }, isLoadingCurrentTab ? "..." : count)
    ), index === 0 && /* @__PURE__ */ React.createElement(ActiveBookingsChip, { activeTab, bookings: activeBookings, isBookingsOpen, setIsBookingsOpen }));
  })), (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") && activeSubcategory !== "all" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "\u2728"), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-rose-700 dark:text-rose-300" }, "Showing recent ", /* @__PURE__ */ React.createElement("span", { className: "capitalize font-black" }, activeSubcategory === "selling" ? "item for sale" : activeSubcategory))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveSubcategory("all"),
      className: "flex items-center gap-1 text-[11px] font-black text-rose-600 hover:text-rose-700 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("span", null, "Clear filter"),
    /* @__PURE__ */ React.createElement(X, { className: "w-3.5 h-3.5 stroke-[2.5]" })
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "font-black text-base text-gray-950 dark:text-white tracking-tight" }, activeTab === "Property" || activeTab === "Properties" ? "Properties near you" : activeTab === "Helper" || activeTab === "Helpers" || activeTab === "Services" || activeTab === "Service" || activeTab === "Local Services" ? "Local Services" : activeTab === "Lunch" ? "Food near you" : activeTab === "LookingFor" || activeTab === "Needs" ? "Community Needs & Requests" : activeTab === "Shuttle" || activeTab === "Shuttles" ? "Book a Shuttle Seat" : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", null, "Recent listings"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black uppercase tracking-wider text-slate-600" }, isLoadingCurrentTab ? "Loading listings" : `Live \xB7 ${filteredItems.length}`))), (activeTab === "Shuttle" || activeTab === "Shuttles") && /* @__PURE__ */ React.createElement("div", { className: "mb-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 p-4 text-white shadow-md border border-teal-800/40" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "relative flex h-2 w-2" }, /* @__PURE__ */ React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black uppercase tracking-[0.2em] text-teal-400" }, "Live Shuttle Radar")), /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-white leading-tight" }, "Book seats. Track live. Travel safe."), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-teal-100/70 mt-0.5 line-clamp-1" }, "Province-to-province & local routes, verified drivers.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/shuttles"),
      className: "shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-teal-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement(Bus, { className: "w-3.5 h-3.5 stroke-[3]" }),
    /* @__PURE__ */ React.createElement("span", null, "Book Seat")
  ))), activeTab === "LookingFor" && /* @__PURE__ */ React.createElement("div", { className: "mb-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-4 text-white shadow-md border border-rose-900/40" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "relative flex h-2 w-2" }, /* @__PURE__ */ React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black uppercase tracking-[0.2em] text-rose-400" }, "Live 24h Radar")), /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-black text-white leading-tight" }, "Need community help or an extra hand?"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-300 mt-0.5 line-clamp-1" }, "Broadcast what you need to local neighbors in your area.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/micro-gigs"),
      className: "shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-3.5 h-3.5 stroke-[3]" }),
    /* @__PURE__ */ React.createElement("span", null, "Post Need")
  ))), /* @__PURE__ */ React.createElement("div", { className: `grid ${activeTab === "LookingFor" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"} gap-3 sm:gap-4` }, isLoadingCurrentTab ? Array.from({ length: 6 }).map((_, idx) => /* @__PURE__ */ React.createElement(AirbnbCardSkeleton, { key: `skeleton-${idx}` })) : activeTab === "Shuttle" || activeTab === "Shuttles" ? null : filteredItems.slice(0, 6).map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item._id || idx }, activeTab === "LookingFor" ? /* @__PURE__ */ React.createElement(LookingForFeedCard, { item, navigate }) : /* @__PURE__ */ React.createElement(
    AirbnbCard,
    {
      item,
      type: item.itemType === "helper" || activeTab === "Helper" || activeTab === "Helpers" || item.type === "domestic" || item.type === "chef" || item.type === "beauty" || item.type === "barber" || item.type === "photography" || item.type === "tutor" || item.type === "sneaker" ? "helper" : item.itemType === "service" || activeTab === "Services" || activeTab === "Service" ? "service" : activeTab === "Events" ? "event" : activeTab === "Selling" || activeTab === "Marketplace" ? "selling" : (item.itemType === "listing" ? "property" : item.itemType) || "property",
      onClick: (path) => navigate(path)
    }
  )))), !isLoadingCurrentTab && filteredItems.length === 0 && activeTab !== "Shuttle" && activeTab !== "Shuttles" && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700 p-8 my-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-4xl mb-3" }, currentCategoryObj?.emoji || "\u{1F50D}"), /* @__PURE__ */ React.createElement("h3", { className: "text-base font-black text-slate-800 dark:text-gray-200 mb-1" }, "No ", activeSubcategory !== "all" ? activeSubcategory.replace("_", " ") : activeTab === "Helper" || activeTab === "Helpers" || activeTab === "Services" || activeTab === "Service" ? "Local Services" : activeTab === "LookingFor" ? "Needs" : activeTab, " found"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 dark:text-gray-500 max-w-xs mb-4" }, activeTab === "LookingFor" ? "Be the first to post a community request in your area." : "Be the first to list in this category."), activeTab === "LookingFor" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/micro-gigs"),
      className: "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
    },
    "Broadcast a Need"
  ) : activeSubcategory !== "all" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveSubcategory("all"),
      className: "px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider"
    },
    "Show All ",
    activeTab
  )), filteredItems.length > 6 && /* @__PURE__ */ React.createElement("div", { className: "mt-5 flex justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigate("/search"),
      className: "rounded-lg bg-slate-950 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-950"
    },
    "See all ",
    filteredItems.length,
    " listings"
  ))), /* @__PURE__ */ React.createElement(SellItemsSection, { navigate }), /* @__PURE__ */ React.createElement("div", { className: "-mx-4" }, /* @__PURE__ */ React.createElement(DownloadAppSection, null)), !isAndroidApp() && /* @__PURE__ */ React.createElement(CaughtUpHub, { stats, navigate }), /* @__PURE__ */ React.createElement(
    RecentPopoutMenu,
    {
      isOpen: isRecentPopoutOpen,
      onClose: () => setIsRecentPopoutOpen(false),
      activeSubcategory,
      onSelect: (subId) => {
        setActiveTab("RecentAdded");
        setActiveSubcategory(subId);
      },
      recentlyAddedItems
    }
  ), /* @__PURE__ */ React.createElement(
    CategoriesBottomSheet,
    {
      isOpen: isCategoriesSheetOpen,
      onClose: () => setIsCategoriesSheetOpen(false),
      tabs,
      activeTab,
      activeSubcategory,
      onSelectCategory: (tabId, subId = "all") => {
        setActiveTab(tabId);
        setActiveSubcategory(subId);
      },
      navigate
    }
  )));
}
function DesktopHomepage({
  tabs,
  visibleTabs,
  activeTab,
  setActiveTab,
  activeSubcategory,
  setActiveSubcategory,
  showAllCategories,
  setShowAllCategories,
  isCategoriesSheetOpen,
  setIsCategoriesSheetOpen,
  currentCategoryObj,
  getSubcategoryCount,
  featuredProperties,
  featuredServices,
  featuredHelpers,
  featuredEvents,
  featuredSellItems,
  featuredLookingFor = [],
  loadingProperties,
  loadingServices,
  loadingHelpers,
  loadingEvents,
  loadingSellItems,
  loadingLookingFor = false,
  recentlyAddedItems,
  recentlyViewedItems = [],
  navigate,
  isBookingsOpen,
  setIsBookingsOpen,
  requestCount,
  activeBookings = [],
  stats,
  homeLoadError,
  onRetryHomeData,
  isHeaderVisible = true,
  isScrolled = false,
  currentUser
}) {
  const [isRecentPopoutOpen, setIsRecentPopoutOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const isSheetOpen = Boolean(isRecentPopoutOpen || isCategoriesSheetOpen);
    dispatch(setHideBottomNav(isSheetOpen));
    dispatch(setHideHeader(isSheetOpen));
    if (isSheetOpen) {
      document.body.classList.add("hide-bottom-nav");
    } else {
      document.body.classList.remove("hide-bottom-nav");
    }
    return () => {
      dispatch(setHideBottomNav(false));
      dispatch(setHideHeader(false));
      document.body.classList.remove("hide-bottom-nav");
    };
  }, [isRecentPopoutOpen, isCategoriesSheetOpen, dispatch]);
  const isLoadingCurrentTab = useMemo(() => {
    if (activeTab === "Property" || activeTab === "Properties") return loadingProperties;
    if (activeTab === "Helper" || activeTab === "Helpers" || activeTab === "Services" || activeTab === "Service" || activeTab === "Local Services") return loadingHelpers && loadingServices;
    if (activeTab === "Events") return loadingEvents;
    if (activeTab === "Selling" || activeTab === "Sell" || activeTab === "Marketplace") return loadingSellItems;
    if (activeTab === "Shuttle" || activeTab === "Shuttles") return false;
    if (activeTab === "LookingFor" || activeTab === "Needs") return loadingLookingFor;
    if (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") {
      return loadingProperties || loadingServices || loadingHelpers || loadingEvents || loadingSellItems || loadingLookingFor;
    }
    return false;
  }, [activeTab, loadingProperties, loadingServices, loadingHelpers, loadingEvents, loadingSellItems, loadingLookingFor]);
  const getSourceForTabDesktop = useCallback((tab) => {
    if (tab === "RecentAdded" || tab === "Recent Added" || tab === "Recent") return recentlyAddedItems || [];
    if (tab === "Property" || tab === "Properties") return featuredProperties || [];
    if (tab === "Helper" || tab === "Helpers" || tab === "Services" || tab === "Service" || tab === "Local Services") {
      const helpers = (featuredHelpers || []).map((h) => ({ ...h, itemType: "helper" }));
      const services = (featuredServices || []).map((s) => ({ ...s, itemType: "service" }));
      return [...helpers, ...services];
    }
    if (tab === "Events") return featuredEvents || [];
    if (tab === "Selling" || tab === "Sell" || tab === "Marketplace") return featuredSellItems || [];
    if (tab === "LookingFor" || tab === "Needs") return featuredLookingFor || [];
    if (tab === "Shuttle" || tab === "Shuttles") return [];
    return [];
  }, [recentlyAddedItems, featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems, featuredLookingFor]);
  const getFilteredItems = useCallback(() => {
    const source = getSourceForTabDesktop(activeTab);
    if (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") {
      if (activeSubcategory === "all") return source;
      return source.filter((item) => {
        const type = item.itemType === "listing" ? "property" : item.itemType || "";
        return type === activeSubcategory;
      });
    }
    return source.filter((item) => matchItemToSubcategory(item, activeTab, activeSubcategory));
  }, [activeTab, activeSubcategory, getSourceForTabDesktop]);
  const [visibleCount, setVisibleCount] = useState(8);
  useEffect(() => {
    setVisibleCount(8);
  }, [activeTab, activeSubcategory]);
  const currentTabLabel = useMemo(() => {
    if (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") return "Recent";
    const found = tabs?.find((t) => t.id === activeTab);
    return found?.label || activeTab;
  }, [activeTab, tabs]);
  const filteredDesktopItems = getFilteredItems();
  const loadMoreDesktopSentinelRef = useRef(null);
  const [isLoadingMoreDesktop, setIsLoadingMoreDesktop] = useState(false);
  useEffect(() => {
    if (visibleCount >= filteredDesktopItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !isLoadingMoreDesktop) {
          setIsLoadingMoreDesktop(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 12, filteredDesktopItems.length));
            setIsLoadingMoreDesktop(false);
          }, 200);
        }
      },
      { rootMargin: "350px" }
    );
    const el = loadMoreDesktopSentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [visibleCount, filteredDesktopItems.length, isLoadingMoreDesktop]);
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-white dark:bg-gray-950" }, /* @__PURE__ */ React.createElement(Helmet, null, /* @__PURE__ */ React.createElement("title", null, "loopOut | Premium Marketplace for Properties, Services & Helpers"), /* @__PURE__ */ React.createElement("meta", { name: "description", content: "Discover verified helpers, book top services, and explore exclusive properties in your area with loopOut." })), /* @__PURE__ */ React.createElement("style", null, `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `), /* @__PURE__ */ React.createElement(
    WelcomeChoices,
    {
      navigate,
      onChoose: (choice) => {
        if (choice === "Shuttle") {
          navigate("/shuttles");
          return;
        }
        setActiveTab(choice);
        setActiveSubcategory("all");
      }
    }
  ), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto px-8 py-6" }, homeLoadError && /* @__PURE__ */ React.createElement(HomeDataErrorNotice, { onRetry: onRetryHomeData }), currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && activeTab !== "RecentAdded" && activeTab !== "Recent Added" && activeTab !== "Recent" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-6 mb-6 border-b border-gray-100" }, currentCategoryObj.subcategories.map((sub, index) => {
    const isSubActive = activeSubcategory === sub.id;
    const count = getSubcategoryCount(activeTab, sub.id);
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: sub.id }, /* @__PURE__ */ React.createElement(
      motion.button,
      {
        whileTap: { scale: 0.95 },
        onClick: () => setActiveSubcategory(sub.id),
        className: `shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer shadow-xs ${isSubActive ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900 scale-[1.02]" : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"}`
      },
      /* @__PURE__ */ React.createElement(CategoryNavIcon, { id: sub.id, className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ React.createElement("span", { className: "whitespace-nowrap tracking-tight" }, sub.label),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: `text-[10px] px-2 py-0.5 rounded-full font-black ml-0.5 ${isSubActive ? "bg-rose-500 text-white" : "bg-white text-slate-500 border border-slate-200 shadow-2xs"}`
        },
        isLoadingCurrentTab ? "..." : count
      )
    ), index === 0 && /* @__PURE__ */ React.createElement(ActiveBookingsChip, { activeTab, bookings: activeBookings, isBookingsOpen, setIsBookingsOpen }));
  })), (activeTab === "RecentAdded" || activeTab === "Recent Added" || activeTab === "Recent") && activeSubcategory !== "all" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-6 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm" }, "\u2728"), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-rose-700 dark:text-rose-300" }, "Showing recent ", /* @__PURE__ */ React.createElement("span", { className: "capitalize font-black" }, activeSubcategory === "selling" ? "item for sale" : activeSubcategory))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveSubcategory("all"),
      className: "flex items-center gap-1 text-[11px] font-black text-rose-600 hover:text-rose-700 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("span", null, "Clear filter"),
    /* @__PURE__ */ React.createElement(X, { className: "w-3.5 h-3.5 stroke-[2.5]" })
  )), activeTab === "Lunch" && /* @__PURE__ */ React.createElement("div", { className: "mt-7 mb-6" }, /* @__PURE__ */ React.createElement(FoodSpecialsStrip, { navigate })), activeTab !== "Lunch" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-8" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-black tracking-tighter leading-none" }, activeTab === "Property" || activeTab === "Properties" ? /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent" }, "Properties near you") : activeTab === "Helper" || activeTab === "Helpers" ? /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent" }, "Services near you") : activeTab === "Services" ? /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent" }, "Services near you") : activeTab === "Lunch" ? /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent" }, "Food near you") : activeTab === "LookingFor" || activeTab === "Needs" ? /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent" }, "Community Needs & Requests") : /* @__PURE__ */ React.createElement("span", { className: "text-slate-900 dark:text-white" }, "Recent listings")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-[0.2em]" }, "Curated \xB7 South Africa & Beyond")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] text-slate-500 font-black uppercase tracking-widest" }, isLoadingCurrentTab ? "Loading listings" : `Live \xB7 ${getFilteredItems().length}`))), activeTab === "LookingFor" && /* @__PURE__ */ React.createElement("div", { className: "mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-6 text-white shadow-xl border border-rose-900/40" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 flex items-center justify-between gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "relative flex h-2.5 w-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" })), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black uppercase tracking-[0.25em] text-rose-400" }, "Live 24h Community Radar")), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-black text-white tracking-tight leading-snug" }, "Need an urgent hand or looking for community help?"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-300 mt-1 leading-relaxed font-medium" }, "Broadcast your request to local neighbors and verified helpers. Every broadcast stays fresh for 24 hours.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 shrink-0" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/micro-gigs"),
      className: "px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4 stroke-[3]" }),
    /* @__PURE__ */ React.createElement("span", null, "Broadcast a Need")
  )))), (activeTab === "Shuttle" || activeTab === "Shuttles") && /* @__PURE__ */ React.createElement("div", { className: "mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 p-6 text-white shadow-xl border border-teal-800/40" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 flex items-center justify-between gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "relative flex h-2.5 w-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" })), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black uppercase tracking-[0.25em] text-teal-400" }, "Live Shuttle Radar \u2022 24-Hour Approval")), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-black text-white tracking-tight leading-snug" }, "Book shuttle seats. Track live. Travel safe."), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-teal-100/70 mt-1 leading-relaxed font-medium" }, "Province-to-province & local routes. Verified drivers, bus-style seat selection, 24h payment window.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 shrink-0" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/shuttles"),
      className: "px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-teal-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement(Bus, { className: "w-4 h-4 stroke-[3]" }),
    /* @__PURE__ */ React.createElement("span", null, "Book a Shuttle Seat")
  )))), activeTab === "Shuttle" || activeTab === "Shuttles" ? null : isLoadingCurrentTab ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10" }, Array.from({ length: 8 }).map((_, idx) => /* @__PURE__ */ React.createElement(AirbnbCardSkeleton, { key: `skeleton-${idx}` }))) : filteredDesktopItems.length > 0 ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-black tracking-tight text-slate-950 dark:text-white" }, activeTab === "Property" || activeTab === "Properties" ? "Stays near you" : activeTab === "Helper" || activeTab === "Helpers" || activeTab === "Services" || activeTab === "Service" || activeTab === "Local Services" ? "Local Services" : activeTab === "Lunch" ? "Food near you" : "Recent listings"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigate("/search"),
      className: "rounded-full bg-[#F3F3F3] px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-slate-950 hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
    },
    "See all \u2192"
  )), /* @__PURE__ */ React.createElement("div", { className: `grid ${activeTab === "LookingFor" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} gap-4` }, filteredDesktopItems.slice(0, 12).map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item._id || idx }, activeTab === "LookingFor" ? /* @__PURE__ */ React.createElement(LookingForFeedCard, { item, navigate }) : /* @__PURE__ */ React.createElement(
    AirbnbCard,
    {
      item,
      type: item.itemType === "helper" || activeTab === "Helper" || activeTab === "Helpers" || item.type === "domestic" || item.type === "chef" || item.type === "beauty" || item.type === "barber" || item.type === "photography" || item.type === "tutor" || item.type === "sneaker" ? "helper" : item.itemType === "service" || activeTab === "Services" || activeTab === "Service" ? "service" : activeTab === "Events" ? "event" : (item.itemType === "listing" ? "property" : item.itemType) || "property",
      onClick: (path) => navigate(path)
    }
  )))), filteredDesktopItems.length > 12 && /* @__PURE__ */ React.createElement("div", { className: "mt-8 flex justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigate("/search"),
      className: "rounded-lg bg-slate-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-950"
    },
    "See all ",
    filteredDesktopItems.length,
    " listings"
  ))) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-28 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 my-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-60" }), /* @__PURE__ */ React.createElement("div", { className: "relative w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center border border-slate-200 dark:border-gray-700 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl" }, currentCategoryObj?.emoji || "\u{1F50D}"))), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-black text-slate-800 dark:text-gray-200 mb-2 tracking-tight" }, "No ", activeSubcategory !== "all" ? activeSubcategory.replace("_", " ") : activeTab === "Helper" || activeTab === "Helpers" || activeTab === "Services" || activeTab === "Service" ? "Local Services" : activeTab === "LookingFor" ? "Needs" : activeTab, " available"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 dark:text-gray-500 max-w-xs leading-relaxed mb-6" }, activeTab === "LookingFor" ? "Be the first neighbor to broadcast a need or task in your area." : activeSubcategory !== "all" ? `No listings found in ${activeSubcategory.replace("_", " ")} yet. Try viewing all ${activeTab}.` : `Try exploring other categories or expanding your search.`), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-center gap-3" }, activeTab === "LookingFor" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/micro-gigs"),
      className: "px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
    },
    "Broadcast a Need"
  ) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => window.dispatchEvent(new CustomEvent("open-loopbot", { detail: { initialPrompt: `Find available ${activeSubcategory !== "all" ? activeSubcategory : activeTab} near me` } })),
      className: "px-6 py-3.5 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement(Sparkles, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", null, "Find with LoopBot")
  ), activeSubcategory !== "all" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveSubcategory("all"),
      className: "px-6 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
    },
    "Show All ",
    activeTab
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/search"),
      className: "px-6 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
    },
    "Browse All Listings"
  ))))), /* @__PURE__ */ React.createElement("div", { className: "mt-16" }, /* @__PURE__ */ React.createElement(SellItemsSection, { navigate })), /* @__PURE__ */ React.createElement("div", { className: "mt-20 -mx-8" }, /* @__PURE__ */ React.createElement(DownloadAppSection, null)), !isAndroidApp() && /* @__PURE__ */ React.createElement("div", { className: "mt-20" }, /* @__PURE__ */ React.createElement(CaughtUpHub, { stats, navigate })), /* @__PURE__ */ React.createElement(
    RecentPopoutMenu,
    {
      isOpen: isRecentPopoutOpen,
      onClose: () => setIsRecentPopoutOpen(false),
      activeSubcategory,
      onSelect: (subId) => {
        setActiveTab("RecentAdded");
        setActiveSubcategory(subId);
      },
      recentlyAddedItems,
      isDesktop: true
    }
  ), /* @__PURE__ */ React.createElement(
    CategoriesBottomSheet,
    {
      isOpen: isCategoriesSheetOpen,
      onClose: () => setIsCategoriesSheetOpen(false),
      tabs,
      activeTab,
      activeSubcategory,
      onSelectCategory: (tabId, subId = "all") => {
        setActiveTab(tabId);
        setActiveSubcategory(subId);
      },
      navigate
    }
  )));
}
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiEngine = useRef(new AIRecommendationEngine());
  const { currentUser } = useSelector((state) => state.user);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredHelpers, setFeaturedHelpers] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [featuredSellItems, setFeaturedSellItems] = useState([]);
  const [featuredLookingFor, setFeaturedLookingFor] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingHelpers, setLoadingHelpers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSellItems, setLoadingSellItems] = useState(true);
  const [loadingLookingFor, setLoadingLookingFor] = useState(true);
  const [homeLoadError, setHomeLoadError] = useState(null);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [stats] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("South Africa");
  const [activeBookings, setActiveBookings] = useState([]);
  const requestCount = activeBookings.length;
  useEffect(() => {
    const controller = new AbortController();
    const fetchBookingCount = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, {
          signal: controller.signal
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const currentBookings = data.filter((b) => !["completed", "cancelled", "canceled", "declined", "rejected"].includes(String(b.status || "").toLowerCase()));
          setActiveBookings(currentBookings);
        }
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    };
    fetchBookingCount();
    const interval = setInterval(fetchBookingCount, 6e4);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [currentUser?._id]);
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const items = JSON.parse(stored);
          const enhancedItems = items.map((item) => ({ ...item, aiScore: Math.floor(Math.random() * 30) + 70 }));
          setRecentlyViewedItems(enhancedItems);
        }
      } catch (error) {
        console.error("Failed to load recently viewed items:", error);
      }
    };
    loadRecentlyViewed();
  }, []);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addressFromUrl = urlParams.get("address");
    if (addressFromUrl) setCurrentLocation(decodeURIComponent(addressFromUrl));
  }, [location.search]);
  const addToRecentlyViewed = (item, itemType) => {
    try {
      aiEngine.current.updatePreferences(item, "view");
      const viewedItem = {
        ...item,
        itemType,
        viewedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isLiked: false,
        aiScore: Math.floor(Math.random() * 30) + 70
      };
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter((i) => i._id !== item._id || i.itemType !== itemType);
      items.unshift(viewedItem);
      items = items.slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
      setRecentlyViewedItems(items);
      navigate(`/${itemType}/${item._id}`);
    } catch (error) {
      console.error("Failed to save to recently viewed:", error);
    }
  };
  const updateRecentlyViewedLike = (itemId, isLiked) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.map((item) => item._id === itemId ? { ...item, isLiked } : item);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setRecentlyViewedItems(items);
        if (isLiked) {
          const likedItem = items.find((item) => item._id === itemId);
          if (likedItem) aiEngine.current.updatePreferences(likedItem, "like");
        }
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
    }
  };
  const generateAIRecommendations = (properties, services, helpers, events) => {
    const allItems = [
      ...properties.map((p) => ({ ...p, routeType: "listing" })),
      ...services.map((s) => ({ ...s, routeType: "service" })),
      ...helpers.map((h) => ({ ...h, routeType: "helper" })),
      ...events.map((e) => ({ ...e, routeType: "event" }))
    ].filter(Boolean);
    return aiEngine.current.generatePersonalizedRecommendations(allItems, {
      recentSearch: location.search
    });
  };
  const { coords, city, error: geoError, loading: geoLoading, requestLocation } = useLocationCoords();
  const [locationStatus, setLocationStatus] = useState(null);
  const retryHomepageData = useCallback(() => {
    setHomeLoadError(null);
    setLoadingProperties(true);
    setLoadingServices(true);
    setLoadingHelpers(true);
    setLoadingEvents(true);
    setLoadingSellItems(true);
    setLoadingLookingFor(true);
    setDataRefreshKey((key) => key + 1);
  }, []);
  const rawPropertiesRef = useRef([]);
  const rawServicesRef = useRef([]);
  const rawHelpersRef = useRef([]);
  const rawEventsRef = useRef([]);
  const applyLocationSorting = useCallback((searchCoords, detectedCity) => {
    const hasPreciseLocation = Boolean(searchCoords?.latitude && searchCoords?.longitude);
    const propertiesData = rawPropertiesRef.current;
    if (propertiesData && propertiesData.length > 0) {
      if (hasPreciseLocation) {
        const localMatches = filterByDistanceTier(propertiesData, searchCoords, DISTANCE_TIERS.POLOKWANE, detectedCity);
        if (localMatches.length > 0) {
          setFeaturedProperties(localMatches.slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "property" })));
          setLocationStatus({
            title: `Top Properties in ${detectedCity || "your area"}`,
            description: "Showing the best properties within your immediate area."
          });
        } else {
          const nearby = filterByDistanceTier(propertiesData, searchCoords, DISTANCE_TIERS.NEARBY, detectedCity);
          if (nearby.length > 0) {
            setFeaturedProperties(nearby.slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "property" })));
            setLocationStatus({
              title: `Properties near ${detectedCity || "your area"}`,
              description: "No direct matches in your city, showing nearby neighborhoods."
            });
          } else {
            const regional = filterByDistanceTier(propertiesData, searchCoords, DISTANCE_TIERS.REGIONAL, detectedCity);
            if (regional.length > 0) {
              setFeaturedProperties(regional.slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "property" })));
              setLocationStatus({
                title: "Properties in South Africa",
                description: "Showing trending properties nationwide."
              });
            } else {
              setFeaturedProperties(propertiesData.slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "property" })));
            }
          }
        }
      } else {
        setFeaturedProperties(propertiesData.slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "property" })));
      }
    } else {
      setFeaturedProperties([]);
    }
    const servicesData = rawServicesRef.current;
    if (servicesData && servicesData.length > 0) {
      const sorted = hasPreciseLocation ? filterByDistanceTier(servicesData, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity) : servicesData;
      setFeaturedServices((sorted.length > 0 ? sorted : servicesData).slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "service" })));
    } else {
      setFeaturedServices([]);
    }
    const helpersData = rawHelpersRef.current && rawHelpersRef.current.length > 0 ? rawHelpersRef.current : FALLBACK_HELPERS;
    if (helpersData && helpersData.length > 0) {
      const sorted = hasPreciseLocation ? filterByDistanceTier(helpersData, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity) : helpersData;
      setFeaturedHelpers((sorted.length > 0 ? sorted : helpersData).slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "helper" })));
    } else {
      setFeaturedHelpers(FALLBACK_HELPERS);
    }
    const eventsData = rawEventsRef.current;
    if (eventsData && eventsData.length > 0) {
      const sorted = hasPreciseLocation ? filterByDistanceTier(eventsData, searchCoords, DISTANCE_TIERS.EVERYWHERE, detectedCity) : eventsData;
      setFeaturedEvents((sorted.length > 0 ? sorted : eventsData).slice(0, DATA_FETCH_LIMIT).map((i) => ({ ...i, itemType: "event" })));
    } else {
      setFeaturedEvents([]);
    }
  }, []);
  useEffect(() => {
    if (rawPropertiesRef.current.length > 0 || rawServicesRef.current.length > 0) {
      applyLocationSorting(coords, city);
    }
  }, [coords, city, applyLocationSorting]);
  useEffect(() => {
    let cancelled = false;
    const controllers = {
      properties: new AbortController(),
      services: new AbortController(),
      helpers: new AbortController(),
      events: new AbortController(),
      sell: new AbortController(),
      lookingFor: new AbortController()
    };
    const timeoutId = setTimeout(() => {
      Object.values(controllers).forEach((controller) => controller.abort());
    }, API_TIMEOUT);
    const fetchHomepageData = async () => {
      setHomeLoadError(null);
      let searchCoords = coords || null;
      let detectedCity = city || null;
      const handleFetchFailure = (error) => {
        if (!cancelled && error?.name !== "AbortError") {
          setHomeLoadError("Unable to refresh all homepage listings.");
        }
      };
      if (!coords && !city) {
        try {
          const storedSearches = localStorage.getItem("recentPropertySearches");
          if (storedSearches) {
            const searches = JSON.parse(storedSearches);
            if (searches && searches.length > 0) {
              detectedCity = searches[0];
            }
          }
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }
      const fetchPromises = [
        fetch(`/api/listing/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.properties.signal
        }).then((res) => res.ok ? res.json() : Promise.reject("Failed")).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          rawPropertiesRef.current = list;
          applyLocationSorting(searchCoords, detectedCity);
        }).catch(handleFetchFailure).finally(() => {
          if (!cancelled) setLoadingProperties(false);
        }),
        fetch(`/api/service/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.services.signal
        }).then((res) => res.ok ? res.json() : Promise.reject("Failed")).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          rawServicesRef.current = list;
          applyLocationSorting(searchCoords, detectedCity);
        }).catch(handleFetchFailure).finally(() => {
          if (!cancelled) setLoadingServices(false);
        }),
        fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.helpers.signal
        }).then((res) => res.ok ? res.json() : Promise.reject("Failed")).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          rawHelpersRef.current = list.length > 0 ? list : FALLBACK_HELPERS;
          applyLocationSorting(searchCoords, detectedCity);
        }).catch(() => {
          rawHelpersRef.current = FALLBACK_HELPERS;
          applyLocationSorting(searchCoords, detectedCity);
        }).finally(() => {
          if (!cancelled) setLoadingHelpers(false);
        }),
        fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc`, {
          signal: controllers.events.signal
        }).then((res) => res.ok ? res.json() : Promise.reject("Failed")).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          rawEventsRef.current = list;
          applyLocationSorting(searchCoords, detectedCity);
        }).catch(handleFetchFailure).finally(() => {
          if (!cancelled) setLoadingEvents(false);
        }),
        fetch(`/api/sell?limit=${DATA_FETCH_LIMIT}`, {
          signal: controllers.sell.signal
        }).then((res) => res.ok ? res.json() : Promise.reject("Failed")).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          if (list?.length > 0) {
            setFeaturedSellItems(list.slice(0, DATA_FETCH_LIMIT).map((i) => ({
              ...i,
              itemType: "selling",
              name: i.title || i.name,
              regularPrice: i.price || i.regularPrice
            })));
          } else {
            setFeaturedSellItems([]);
          }
        }).catch(handleFetchFailure).finally(() => {
          if (!cancelled) setLoadingSellItems(false);
        }),
        fetch(`/api/looking-for/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc`, {
          signal: controllers.lookingFor.signal
        }).then((res) => res.ok ? res.json() : Promise.reject("Failed")).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setFeaturedLookingFor(list.map((i) => ({
            ...i,
            itemType: "lookingFor",
            name: i.title,
            regularPrice: i.budget
          })));
        }).catch(handleFetchFailure).finally(() => {
          if (!cancelled) setLoadingLookingFor(false);
        })
      ];
      try {
        await Promise.all(fetchPromises);
        clearTimeout(timeoutId);
      } catch (err) {
      }
    };
    fetchHomepageData();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      Object.values(controllers).forEach((controller) => controller.abort());
    };
  }, [dataRefreshKey, applyLocationSorting]);
  const recentlyAddedItems = useMemo(() => {
    const combined = [
      ...(featuredProperties || []).map((p) => ({ ...p, itemType: "listing" })),
      ...(featuredServices || []).map((s) => ({ ...s, itemType: "service" })),
      ...(featuredHelpers || []).map((h) => ({ ...h, itemType: "helper" })),
      ...(featuredEvents || []).map((e) => ({ ...e, itemType: "event" })),
      ...(featuredSellItems || []).map((item) => ({
        ...item,
        itemType: "selling",
        name: item.title || item.name,
        regularPrice: item.price || item.regularPrice
      })),
      ...(featuredLookingFor || []).map((item) => ({
        ...item,
        itemType: "lookingFor",
        name: item.title,
        regularPrice: item.budget
      }))
    ];
    return combined.filter((item) => item && (item.createdAt || item._id)).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents, featuredSellItems, featuredLookingFor]);
  useEffect(() => {
    if (featuredProperties && featuredServices && featuredHelpers && featuredEvents) {
      const aiResults = generateAIRecommendations(featuredProperties, featuredServices, featuredHelpers, featuredEvents);
      setAiRecommendations(aiResults.recommendations || []);
      setAiInsights(aiResults.insights || []);
    }
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents]);
  return /* @__PURE__ */ React.createElement(
    MobileAppHomepage,
    {
      featuredProperties,
      featuredServices,
      featuredHelpers,
      featuredEvents,
      featuredSellItems,
      featuredLookingFor,
      loadingProperties,
      loadingServices,
      loadingHelpers,
      loadingEvents,
      loadingSellItems,
      loadingLookingFor,
      stats,
      onItemClick: addToRecentlyViewed,
      recentlyViewedItems,
      recentlyAddedItems,
      onRecentlyViewedLike: updateRecentlyViewedLike,
      currentLocation,
      navigate,
      aiRecommendations,
      aiInsights,
      aiTrendData: null,
      onAISuggestionClick: (suggestion) => {
        navigate(`/search?searchTerm=${encodeURIComponent(suggestion)}&type=all&ai=1`);
      },
      locationStatus,
      requestCount,
      activeBookings,
      geoCity: city,
      geoLoading,
      geoError,
      onRequestLocation: requestLocation,
      currentUser,
      homeLoadError,
      onRetryHomeData: retryHomepageData
    }
  );
};
export default Home;
