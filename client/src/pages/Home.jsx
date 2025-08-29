/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Fade } from "react-slideshow-image";
import { useInView } from "react-intersection-observer";
import "react-slideshow-image/dist/styles.css";
import "../styles/breakpoints.scss";
import {
  FaHeart,
  FaStar,

  FaSpinner,
  FaMagic,
  FaTimes,
  FaSearch,
  FaExclamationTriangle,
  FaHome,
  FaTools,
  FaUserAlt,
  FaAngleDown,
  FaMapMarkerAlt,
  FaCalendarAlt,

  FaFire,

} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Fuse from "fuse.js";
import debounce from "lodash/debounce";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/ListingDetails.scss";
import ListingItem from "../components/ListingItem";
import ServiceItem from "../components/ServiceItem";
import HelperItem from "../components/HelperItem";
import EventItem from "../components/EventItem";

// Constants for AI and Listing Logic
const RELEVANCE_WEIGHTS = {
  textMatch: 0.4,
  priceProximity: 0.25,
  distance: 0.2,
  freshness: 0.1,
  popularity: 0.05,
};
const TRENDING_THRESHOLD = 5;
const FRESHNESS_THRESHOLD = 7; // days
const POPULARITY_BOOST = 0.15;
const INITIAL_LOAD_COUNT = 20; // Show 20 cards initially
const LOAD_MORE_COUNT = 8;
const API_RETRY_LIMIT = 3;
const API_RETRY_DELAY = 1000; // ms

// API URLs - Use Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY || "";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Property and Service types for consistent display
const PROPERTY_TYPES = {
  rent: { icon: "🔑", label: " Rent" },               // Key emoji
  sale: { icon: "🏷️", label: "Sale" },               // Price tag emoji

  over: { icon: "🏬", label: "Guest-House " },         // Department store emoji
  office: { icon: "🕒", label: "Hourly-Room" },           // Office building emoji
  land: { icon: "🌳", label: "Land" },               // Rock/land emoji
};


const SERVICE_TYPES = {
  cleaning: { icon: "🧹", label: "Cleaning" },              // Broom emoji
  maintenance: { icon: "🛠️", label: "Maintenance" },        // Hammer and wrench emoji
  moving: { icon: "🚚", label: "Moving" },                  // Moving truck emoji
  landscaping: { icon: "🌿", label: "Landscaping" },         // Herb/plant emoji
  catering: { icon: "🍽️", label: "Catering" },             // Fork and knife with plate emoji
  other: { icon: "❓", label: "Other" },                    // Question mark emoji
  daycare: { icon: "👶", label: "DayCare" },                // Baby emoji
  schoolTransport: { icon: "🚌", label: "School" }          // School bus emoji
};

// Updated helper types with Chef category
const HELPER_TYPES = {
  domestic: { icon: "👔", label: "General Help" },          // Tie emoji
  errand: { icon: "🛍️", label: "Errand Runner" },          // Shopping bag emoji
  tutor: { icon: "📚", label: "Tutor" },                   // Books emoji
  chef: { icon: "👩‍🍳", label: "Chef" },
  maid: { icon: "🧹", label: "Maid" },
  beauty: { icon: "💄", label: "Beauty" },
  barber: { icon: "💈", label: "Barber" },
  tattoo: { icon: "🖋️", label: "Tattoo Artist" },
};

const LOCAL_EVENT_TYPES = {
  music: { icon: "🎵", label: "Music" },                 // Musical note
  sports: { icon: "⚽", label: "Sports" },                // Soccer ball
  art: { icon: "🎨", label: "Art & Culture" },            // Artist palette
  community: { icon: "👥", label: "Community" },          // Group of people
  food: { icon: "🍽️", label: "Food & Drink" },           // Fork and knife with plate
  other: { icon: "❓", label: "Other Events" },           // Question mark
};

// Images for the new side slide categories
const SERVICE_IMAGES = {
  maintenance:
    "https://media.istockphoto.com/id/2154268634/photo/african-american-handyman-working.jpg?s=2048x2048&w=is&k=20&c=0-XXOSPPhbVWflT3fPoeaY717Hf0dev8L0jUuTfG778=",
  landscaping:
    "https://plus.unsplash.com/premium_photo-1661412696440-044ac49f9cf4?q=80&w=2084&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  catering:
    "https://images.unsplash.com/photo-1666951833461-71fc128b6810?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  cleaning:
    "https://images.unsplash.com/photo-1580256081112-e49377338b7f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  moving:
    "https://media.istockphoto.com/id/1437253304/photo/professional-goods-move-service-use-truck-carry-personal-belongings-door-to-door-transport.jpg?s=2048x2048&w=is&k=20&c=8z3I2_UkqshGKkc98B1ZJCX_Horw8a4-5p5qCE79vig=",
  other:
    "https://images.unsplash.com/photo-1640323240640-ee731d18dcb1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  // New service type images
  daycare:
    "https://images.unsplash.com/photo-1600041161228-519e6dd27f1b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  schoolTransport:
    "https://images.unsplash.com/photo-1610878180933-123728745d22?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
};

// Updated helper images with Chef and Maid
const HELPER_IMAGES = {
  tutor:
    "https://images.unsplash.com/photo-1716654716581-3c92ba53de10?q=80&w=2078&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  chef: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  maid: "https://plus.unsplash.com/premium_photo-1678304224645-b34a816688d8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  errand:
    "https://media.istockphoto.com/id/2148856560/photo/asian-girl-sitting-inside-of-shopping-trolley-and-holding-megaphone-and-asian-man-pushing.jpg?s=2048x2048&w=is&k=20&c=Sw13HeIzQqaMAW74zbrykj_TjULnTuLsSZoZ7D89xtc=",
  domestic:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  barber: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  tattoo: "https://images.unsplash.com/photo-1611312449408-4d7d5c1c4d3c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
};

const EVENT_IMAGES = {
  music:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  sports:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  art: "https://images.unsplash.com/photo-1531986392543-366531630134?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  community:
    "https://images.unsplash.com/photo-1538688423619-a8342f98a586?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  other:
    "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Utility function for fetching data with retry logic.
 */
const fetchWithRetry = async (url, options = {}, retries = API_RETRY_LIMIT) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, API_RETRY_DELAY));
      console.warn(`Retrying fetch for ${url}. Attempts left: ${retries - 1}`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

/**
 * PropertySearchAI Class: Handles intelligent search, relevance scoring,
 * sentiment analysis, and image quality assessment for listings.
 */
class PropertySearchAI {
  constructor(listings) {
    this.listings = listings;
    this.fuse = new Fuse(listings, {
      keys: ["name", "description", "address", "type"],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 3,
      ignoreLocation: true,
    });
    this.cache = new Map();
  }

  calculateRelevance(listing, query, userLocation, maxPrice) {
    const textMatch = query.trim()
      ? 1 -
      (this.fuse.search(query).find((r) => r.item._id === listing._id)
        ?.score || 1)
      : 0.5;

    const priceProximity =
      maxPrice > 0
        ? 1 - Math.min(Math.abs(listing.priceNumber - maxPrice) / maxPrice, 1)
        : 0.5;

    const distance = userLocation
      ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        listing.latitude,
        listing.longitude
      )
      : 0;
    const distanceScore = distance > 0 ? 1 / (1 + distance) : 0.5;

    const daysOld =
      (new Date() - new Date(listing.createdAt)) / (1000 * 3600 * 24);
    const freshness = Math.max(0, 1 - daysOld / FRESHNESS_THRESHOLD);

    const popularity = Math.min((listing.viewCount || 0) / 100, 1);

    return (
      textMatch * RELEVANCE_WEIGHTS.textMatch +
      priceProximity * RELEVANCE_WEIGHTS.priceProximity +
      distanceScore * RELEVANCE_WEIGHTS.distance +
      freshness * RELEVANCE_WEIGHTS.freshness +
      popularity * RELEVANCE_WEIGHTS.popularity
    );
  }

  async calculateEnhancedRelevance(listing, query, userLocation, maxPrice) {
    const cacheKey = `${listing._id}-${query}-${maxPrice}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const baseRelevance = this.calculateRelevance(
      listing,
      query,
      userLocation,
      maxPrice
    );
    const [sentimentScore, imageQualityScore] = await Promise.all([
      this.analyzeSentiment(listing.description),
      listing.imageUrls?.length
        ? this.assessImageQuality(listing.imageUrls[0])
        : 0.5,
    ]);

    const relevance =
      baseRelevance + sentimentScore * 0.1 + imageQualityScore * 0.1;
    this.cache.set(cacheKey, relevance);
    return relevance;
  }

  async analyzeSentiment(text) {
    if (!text || text.length < 10) return 0.5;

    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/analyze-sentiment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({ text: text.substring(0, 1000) }),
        }
      );

      const data = response;
      return Math.min(Math.max(data.score || 0.5, 0), 1);
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      return 0.5;
    }
  }

  async assessImageQuality(imageUrl) {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/assess-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      const data = response;
      return data.score || 0.5;
    } catch (error) {
      console.error("Image assessment failed:", error);
      return 0.5;
    }
  }

  async generateSearchSuggestions(query) {
    if (!query.trim()) return [];

    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/search-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({ query }),
        }
      );

      return response.suggestions || [];
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      return [];
    }
  }
}

/**
 * Formats a number as a South African Rand currency string.
 */
const formatPrice = (price) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(price);

/**
 * ErrorMessage Component: Displays a styled error message with an optional retry button.
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
    <div className="flex items-center">
      <FaExclamationTriangle className="text-red-500 mr-3 text-xl" />
      <div>
        <p className="text-red-800 font-semibold">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

/** 
 * ServiceCategoriesSlide Component: Displays a horizontal slider for service or helper categories.
 */
const ServiceCategoriesSlide = ({ type, onSelectCategory }) => {
  const categories =
    type === "services"
      ? SERVICE_TYPES
      : type === "helpers"
        ? HELPER_TYPES
        : type === "events"
          ? LOCAL_EVENT_TYPES
          : {};
  const categoryImages =
    type === "services"
      ? SERVICE_IMAGES
      : type === "helpers"
        ? HELPER_IMAGES
        : type === "events"
          ? EVENT_IMAGES
          : {};

  const title =
    type === "services"
      ? "Explore Services"
      : type === "helpers"
        ? "Find Personal Helpers"
        : "Discover Local Events";

  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
        {title}
      </h2>
      <Swiper
        slidesPerView={3}
        spaceBetween={10}
        navigation={false}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mySwiper !pb-8"
        breakpoints={{
          640: {
            slidesPerView: 4,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 25,
          },
          1280: {
            slidesPerView: 7,
            spaceBetween: 25,
          },
        }}
      >
        {Object.entries(categories).map(([key, { label, icon }]) => (
          <SwiperSlide key={key} className="flex justify-center">
            <button
              onClick={() => onSelectCategory(key)}
              className="flex flex-col items-center justify-center w-24 sm:w-28 focus:outline-none group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-blue-500 transition-colors duration-200 flex items-center justify-center relative">
                {categoryImages[key] ? (
                  <img
                    src={categoryImages[key]}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                    {icon}
                  </span>
                )}
                <div className="absolute inset-0 rounded-full group-hover:bg-black/10 transition-colors"></div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mt-2 text-center group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {label}
              </p>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

// TabButton component for 3D icon effect
const TabButton = ({ activeTab, tabName, onClick, Icon, rotation, id }) => {
  return (
    <button
      onClick={() => onClick(tabName)}
      className={`tab-button relative flex flex-col items-center ${activeTab === tabName ? 'active' : ''
        }`}
    >
      {typeof Icon === 'string' ? (
        <span
          className={`
        text-3xl md:text-4xl mb-1 transition-all duration-300
        ${activeTab === tabName ?
              'transform scale-125 z-10' :
              'hover:scale-110'
            }
      `}
          id={id}
          aria-label={tabName}
          style={{
            textShadow: activeTab === tabName ?
              '0 2px 4px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.05)' : 'none',
            filter: activeTab === tabName ?
              'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none',
            transform: activeTab === tabName ?
              `rotate(${rotation}deg) scale(1.25) translateZ(10px)` :
              'none',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            willChange: 'transform, filter',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
          }}
        >
          {Icon}
        </span>
      ) : (
        <Icon
          className={`text-xl md:text-2xl ${activeTab === tabName ? `rotate-${rotation}` : ''}`}
          id={id}
        />
      )}
      <div
        className={`absolute bottom-0 h-1 w-full bg-blue-600 transition-all duration-300 ease-out ${activeTab === tabName ? "scale-x-100" : "scale-x-0"
          }`}
      ></div>
    </button>
  );
};

/** 
 * Home Component: Main page for displaying listings, search, and filtering.
 */
export default function Home() {
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(1000000);
  const [propertyType, setPropertyType] = useState("all");
  const [serviceType, setServiceType] = useState("all");
  const [helperType, setHelperType] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [visibleListings, setVisibleListings] = useState(INITIAL_LOAD_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchAI, setSearchAI] = useState(() => new PropertySearchAI([]));
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState({
    properties: [],
    services: [],
    helper: [],
    events: [],
    all: []
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [interactionCounts, setInteractionCounts] = useState({});
  const [trendingItems, setTrendingItems] = useState([]);

  // Rotation states for 3D effect
  const [propertiesRotation, setPropertiesRotation] = useState({ x: 0, y: 0 });
  const [servicesRotation, setServicesRotation] = useState({ x: 0, y: 0 });
  const [helperRotation, setHelperRotation] = useState({ x: 0, y: 0 });
  const [eventsRotation, setEventsRotation] = useState({ x: 0, y: 0 });
  const [allRotation, setAllRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const { ref: scrollRef, inView } = useInView({ threshold: 0.1 });

  const [rotatingPlaceholder, setRotatingPlaceholder] = useState('');
  const [displayedCities, setDisplayedCities] = useState([]);
  const rotationInterval = useRef(null);
  const placeholderIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);

  useEffect(() => {
    startPlaceholderRotation();
    return () => clearInterval(rotationInterval.current);
  }, []);
  // Fixed hook order - all hooks declared before conditional return
  useEffect(() => {
    document.body.classList.add("home-page");
    return () => document.body.classList.remove("home-page");
  }, []);

  // Function to increment interaction count
  const incrementInteraction = (id) => {
    setInteractionCounts(prev => {
      const newCount = (prev[id] || 0) + 1;
      const newCounts = { ...prev, [id]: newCount };

      if (newCount === TRENDING_THRESHOLD) {
        const trendingItem = allListings.find(item => item._id === id);
        if (trendingItem) {
          setTrendingItems(prev => [...prev, trendingItem]);
        }
      }

      return newCounts;
    });
  };

  // Updated handleItemNavigation function
  const handleItemNavigation = useCallback((item) => {
    incrementInteraction(item._id);

    if (Object.keys(PROPERTY_TYPES).includes(item.type)) {
      navigate(`/listing/${item._id}`);
    } else if (Object.keys(SERVICE_TYPES).includes(item.type)) {
      navigate(`/service/${item._id}`);
    } else if (Object.keys(HELPER_TYPES).includes(item.type)) {
      navigate(`/helper/${item._id}`);
    } else if (Object.keys(LOCAL_EVENT_TYPES).includes(item.type)) {
      navigate(`/event/${item._id}`);
    }
  }, [navigate]);

  // Mouse tracking for 3D effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const relX = (e.clientX - centerX) / (rect.width / 2);
      const relY = (e.clientY - centerY) / (rect.height / 2);

      const calculateRotation = (elementId, sensitivity) => {
        const element = document.getElementById(elementId);
        if (!element) return { x: 0, y: 0 };

        const elementRect = element.getBoundingClientRect();
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;



        return {

        };
      };

      setPropertiesRotation(calculateRotation('properties-icon', 8));
      setServicesRotation(calculateRotation('services-icon', 8));
      setHelperRotation(calculateRotation('helper-icon', 8));
      setEventsRotation(calculateRotation('events-icon', 8));
      setAllRotation(calculateRotation('all-icon', 8));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );



  const fetchSearchSuggestions = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchSuggestions([]);
        return;
      }

      try {
        const suggestions = await searchAI.generateSearchSuggestions(query);
        setSearchSuggestions(suggestions.slice(0, 5));
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSearchSuggestions([]);
      }
    },
    [searchAI]
  );





  // Add this near the top of your component, before the startPlaceholderRotation function
  const cities = [
    "Polokwane",
    "Mokopane",
    "Seshego",
    "Pretoria",
    "Tembisa",
    "Soweto",
    "Bakenburg",
    "Springs",
    "Ivory Park",
    "Benoni",
    "Mmamelodi",
    "Cape Town",
    "Kempton Park",
    "Randburg",
    "Durban",
     "Makweng",
      "Phomolong",
       "Davetony",
        "Mafikeng",
         "Nelsprit",
          "Secunda",

    // Add more cities as needed
  ];

  const startPlaceholderRotation = () => {
    rotationInterval.current = setInterval(() => {
      const currentCity = cities[placeholderIndex.current];

      if (!isDeleting.current && charIndex.current <= currentCity.length) {
        setRotatingPlaceholder(currentCity.substring(0, charIndex.current));
        charIndex.current++;
      } else if (isDeleting.current && charIndex.current >= 0) {
        setRotatingPlaceholder(currentCity.substring(0, charIndex.current));
        charIndex.current--;
      } else {
        isDeleting.current = !isDeleting.current;
        if (!isDeleting.current) {
          placeholderIndex.current = (placeholderIndex.current + 1) % cities.length;
        }
      }
    }, 220); // Adjust speed as needed
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      clearInterval(rotationInterval.current);
      setRotatingPlaceholder('');
      setDisplayedCities(
        cities.filter(city =>
          city.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      startPlaceholderRotation();
      setDisplayedCities([]);
    }
  };

  const handleSearchSubmit = (city = searchQuery) => {
    // Your search submit logic here
    console.log("Searching for:", city);
  };



  const heroImages = useMemo(() => {
    const fallbackImages = [
      "https://media.istockphoto.com/id/2170147704/photo/high-angle-view-of-townscape-against-sky.jpg?s=2048x2048&w=is&k=20&c=nGGTw_gsp48zl09VvGO51ULcDpX7RpY72cw4Emtdr0=",
      "https://media.istockphoto.com/id/2194248291/photo/wild-coast-south-africa-quaint-villages-with-colorful-rondavel-huts.jpg?s=2048x2048&w=is&k=20&c=Lv0B0ES7W2sxdbox9tSwUJj2ihkuZE6tTy82-b1WS64=",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];

    if (!allListings || allListings.length === 0) {
      return fallbackImages.sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    const listingImages = allListings
      .flatMap((listing) => listing.imageUrls)
      .filter(Boolean);

    if (listingImages.length < 6) {
      const combined = [...new Set([...listingImages, ...fallbackImages])];
      return combined.sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    const shuffled = listingImages.sort(() => 0.5 - Math.random());
    return [...new Set(shuffled)].slice(0, 6);
  }, [allListings]);

  const filteredListingsFull = useMemo(() => {
    if (!allListings?.length) return [];

    try {
      return allListings
        .filter((listing) => {
          if (activeTab === "all") {
            return listing.priceNumber <= priceRange;
          } else if (activeTab === "properties") {
            const isProperty = Object.keys(PROPERTY_TYPES).includes(listing.type);
            if (!isProperty) return false;
            return (propertyType === "all" || listing.type === propertyType) &&
              (listing.priceNumber <= priceRange);
          } else if (activeTab === "services") {
            const isService = Object.keys(SERVICE_TYPES).includes(listing.type);
            if (!isService) return false;
            return (serviceType === "all" || listing.type === serviceType) &&
              (listing.priceNumber <= priceRange);
          } else if (activeTab === "helper") {
            const isHelper = Object.keys(HELPER_TYPES).includes(listing.type);
            if (!isHelper) return false;
            return (helperType === "all" || listing.type === helperType) &&
              (listing.priceNumber <= priceRange);
          } else if (activeTab === "events") {
            const isEvent = Object.keys(LOCAL_EVENT_TYPES).includes(listing.type);
            if (!isEvent) return false;
            return (eventType === 'all' || listing.type === eventType) &&
              (listing.priceNumber <= priceRange);
          }
          return false;
        })
        .map((listing) => ({
          ...listing,
          relevance: searchAI.calculateRelevance(
            listing,
            searchQuery,
            userLocation,
            priceRange
          ),
        }))
        .sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error("Error calculating relevance:", error);
      return [];
    }
  }, [
    allListings,
    searchQuery,
    priceRange,
    propertyType,
    serviceType,
    helperType,
    eventType,
    userLocation,
    searchAI,
    activeTab,
  ]);

  const categorizedListings = useMemo(() => {
    const categories = {
      properties: [],
      services: [],
      helper: [],
      events: [],
    };

    if (activeTab === "all" && filteredListingsFull) {
      filteredListingsFull.forEach(item => {
        if (Object.keys(PROPERTY_TYPES).includes(item.type)) {
          categories.properties.push(item);
        } else if (Object.keys(SERVICE_TYPES).includes(item.type)) {
          categories.services.push(item);
        } else if (Object.keys(HELPER_TYPES).includes(item.type)) {
          categories.helper.push(item);
        } else if (Object.keys(LOCAL_EVENT_TYPES).includes(item.type)) {
          categories.events.push(item);
        }
      });
    }

    return categories;
  }, [activeTab, filteredListingsFull]);

  useEffect(() => {
    if (inView && !isLoading && filteredListingsFull?.length > visibleListings) {
      const debouncedLoad = debounce(() => {
        setVisibleListings((prev) => prev + LOAD_MORE_COUNT);
      }, 300);
      debouncedLoad();
      return () => debouncedLoad.cancel();
    }
  }, [inView, isLoading, visibleListings, filteredListingsFull]);

  useEffect(() => {
    setVisibleListings(INITIAL_LOAD_COUNT);
  }, [
    searchQuery,
    priceRange,
    propertyType,
    serviceType,
    helperType,
    eventType,
    userLocation,
    activeTab,
  ]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchWithFallback = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } catch (err) {
          console.error(`Error fetching ${url}:`, err);
          return [];
        }
      };

      const [properties, services, helpers, events] = await Promise.all([
        fetchWithFallback('/api/listing/get?limit=100'),
        fetchWithFallback('/api/service/get?limit=100'),
        fetchWithFallback('/api/helper/get?limit=100'),
        fetchWithFallback('/api/event/get?limit=100'),
      ]);

      const combinedListings = [
        ...(Array.isArray(properties) ? properties : []),
        ...(Array.isArray(services) ? services : []),
        ...(Array.isArray(helpers) ? helpers : []),
        ...(Array.isArray(events) ? events : []),
      ];

      const processedListings = combinedListings.map((item) => ({
        ...item,
        priceNumber: item.price || item.regularPrice || 0,
        price: formatPrice(item.price || item.regularPrice || 0),
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        viewCount: parseInt(localStorage.getItem(`views-${item._id}`)) || 0,
      }));

      setAllListings(processedListings);
      setSearchAI(new PropertySearchAI(processedListings));
      generateRecommendations(processedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Some features might be limited.");
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  const generateRecommendations = useCallback((listings) => {
    const userPreferences = {
      preferredTypes: JSON.parse(localStorage.getItem("preferredTypes")) || [],
      priceRange: JSON.parse(localStorage.getItem("preferredPriceRange")) || [0, 1000000],
      locations: JSON.parse(localStorage.getItem("viewedLocations")) || [],
    };

    const recommendations = {
      properties: [],
      services: [],
      helper: [],
      events: [],
      all: []
    };

    listings.forEach(listing => {
      if (Object.keys(PROPERTY_TYPES).includes(listing.type)) {
        recommendations.properties.push(listing);
      } else if (Object.keys(SERVICE_TYPES).includes(listing.type)) {
        recommendations.services.push(listing);
      } else if (Object.keys(HELPER_TYPES).includes(listing.type)) {
        recommendations.helper.push(listing);
      } else if (Object.keys(LOCAL_EVENT_TYPES).includes(listing.type)) {
        recommendations.events.push(listing);
      }
    });

    Object.keys(recommendations).forEach(category => {
      if (category !== "all") {
        recommendations[category] = recommendations[category]
          .filter(item => {
            const typeMatch = userPreferences.preferredTypes.length === 0 ||
              userPreferences.preferredTypes.includes(item.type);
            const priceMatch = item.priceNumber >= userPreferences.priceRange[0] &&
              item.priceNumber <= userPreferences.priceRange[1];
            return typeMatch && priceMatch;
          })
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 8);
      }
    });

    recommendations.all = [
      ...recommendations.properties.slice(0, 2),
      ...recommendations.services.slice(0, 2),
      ...recommendations.helper.slice(0, 2),
      ...recommendations.events.slice(0, 2)
    ].sort(() => 0.5 - Math.random());

    setRecommendations(recommendations);
  }, []);

  const enhanceListingDescription = async (description) => {
    if (!description || description.length < 20) return description;

    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/enhance-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({ description: description.substring(0, 1000) }),
        }
      );

      return response.enhancedDescription || description;
    } catch (error) {
      console.error("Description enhancement failed:", error);
      return description;
    }
  };

  const handleLocationDetection = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            setUserLocation({
              lat: latitude,
              lng: longitude,
              address: data.features[0]?.place_name || "Current Location",
            });
          } catch (err) {
            console.error("Error fetching location details:", err);
            setError("Location details unavailable. Please try again.");
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(
            "Location access denied or failed. Please enable location services."
          );
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const enhanceAllDescriptions = async () => {
    if (!allListings.length || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const enhanced = [];
      const nonEnhanced = [];

      allListings.forEach(listing => {
        if (listing.isDescriptionEnhanced) {
          enhanced.push(listing);
        } else {
          nonEnhanced.push(listing);
        }
      });

      let enhancedNonEnhanced = nonEnhanced;
      if (nonEnhanced.length > 0) {
        enhancedNonEnhanced = await Promise.all(
          nonEnhanced.map(async (listing) => {
            const enhancedDescription = await enhanceListingDescription(listing.description);
            return {
              ...listing,
              description: enhancedDescription,
              isDescriptionEnhanced: true,
            };
          })
        );
      }

      setAllListings([...enhanced, ...enhancedNonEnhanced]);

    } catch (err) {
      console.error("Failed to enhance descriptions:", err);
      setError("Failed to enhance descriptions. Please try again later.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSelectServiceCategory = useCallback((category) => {
    setServiceType(category);
  }, []);

  const handleSelectHelperCategory = useCallback((category) => {
    setHelperType(category);
  }, []);

  const handleSelectEventCategory = useCallback((category) => {
    setEventType(category);
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Conditional return must be AFTER all hooks
  if (isInitialLoading) {
    return <LoadingSpinner message="Loading listings..." />;
  }

  let currentTypes = {};
  if (activeTab === "properties") {
    currentTypes = PROPERTY_TYPES;
  } else if (activeTab === "services") {
    currentTypes = SERVICE_TYPES;
  } else if (activeTab === "helper") {
    currentTypes = HELPER_TYPES;
  } else if (activeTab === "events") {
    currentTypes = LOCAL_EVENT_TYPES;
  }

  // Define emoji mappings for each category
  const PROPERTY_EMOJIS = {
    all: "🏠",
    // Add other property types here with their emojis
  };

  const SERVICE_EMOJIS = {
    all: "🔧",
    // Add other service types here with their emojis
  };

  const HELPER_EMOJIS = {
    all: "👷",
    // Add other helper types here with their emojis
  };

  const EVENT_EMOJIS = {
    all: "🎪",
    // Add other event types here with their emojis
  };

  let currentSelectedType = { label: "Select Type", icon: null };

  if (activeTab === "properties") {
    currentSelectedType = propertyType === "all"
      ? { label: "Property Type", icon: "🏠" }
      : PROPERTY_TYPES[propertyType]
        ? { ...PROPERTY_TYPES[propertyType], icon: PROPERTY_EMOJIS[propertyType] || "🏠" }
        : { label: "Property Type", icon: "🏠" };
  } else if (activeTab === "services") {
    currentSelectedType = serviceType === "all"
      ? { label: "Service Type", icon: "🛎️" }
      : SERVICE_TYPES[serviceType]
        ? { ...SERVICE_TYPES[serviceType], icon: SERVICE_EMOJIS[serviceType] || "🔧" }
        : { label: "Service Type", icon: "🛎️" };
  } else if (activeTab === "helper") {
    currentSelectedType = helperType === "all"
      ? { label: "Helper Type", icon: "👷" }
      : HELPER_TYPES[helperType]
        ? { ...HELPER_TYPES[helperType], icon: HELPER_EMOJIS[helperType] || "👷" }
        : { label: "Helper Type", icon: "👷" };
  } else if (activeTab === "events") {
    currentSelectedType = eventType === "all"
      ? { label: "Event Type", icon: "🎪" }
      : LOCAL_EVENT_TYPES[eventType]
        ? { ...LOCAL_EVENT_TYPES[eventType], icon: EVENT_EMOJIS[eventType] || "🎪" }
        : { label: "Event Type", icon: "🎪" };
  }

  return (
    <div className="min-h-screen relative font-sans">
      {/* Hero Section */}
      <div className="relative h-[560px] md:h-[650px] overflow-hidden rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-10 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-6xl mx-auto text-white">
            <h1 className="text-3xl md:text-6xl font-extrabold mb-4 animate-fade-in-down drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-red-600">
                {activeTab === "all"
                  ? "Discover Everything Nearby"
                  : activeTab === "properties"
                    ? "Find Your Dream Property"
                    : activeTab === "services"
                      ? "Discover Quality Services"
                      : activeTab === "events"
                        ? "Explore Local Events"
                        : "Find Trusted Personal Helpers"}
              </span>
            </h1>
            <p className="text-lg md:text-2xl mb-8 opacity-90 animate-fade-in-up drop-shadow-md">
              {activeTab === "all"
                ? "Properties • Services • Helpers • Events"
                : activeTab === "properties"
                  ? "Smart recommendations • Enhanced listings • Intelligent search"
                  : activeTab === "services"
                    ? "Professional services • Verified providers • Easy booking"
                    : activeTab === "events"
                      ? "Live music • Community gatherings • Sporting events"
                      : "Trusted helpers • Verified backgrounds • Easy scheduling"}
            </p>
            <button
              onClick={enhanceAllDescriptions}
              disabled={isEnhancing}
              className="flex items-center justify-center mx-auto px-6 py-3 bg-rose-600 rounded-full text-white font-semibold text-lg shadow-lg hover:bg-rose-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaMagic className="mr-3 text-xl" />
              {isEnhancing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Enhancing...
                </>
              ) : (
                "Enhance Listings with AI"
              )}
            </button>
          </div>
        </div>
        <Fade arrows={false} indicators={false} duration={4000} transitionDuration={800}>
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="h-[560px] md:h-[650px] bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </Fade>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-0">
        {error && <ErrorMessage message={error} onRetry={fetchListings} />}

        {/* Tab Navigation with 3D effect */}

        {/* Tab Navigation with 3D effect */}
        <div
          ref={containerRef}
          className="rounded-3xl shadow-xl p-4 mb-0 transform -translate-y-24 relative z-20 bg-gray-50 bg-opacity-90 backdrop-blur-md"
        >
          {/* Responsive Tab Bar */}
          <div className="flex mb-4 w-full justify-center">
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-4xl mx-auto">
              {[
                { id: "all", name: "all", icon: "🌎", label: "All" },
                { id: "properties", name: "properties", icon: "🏠", label: "Properties" },
                { id: "services", name: "services", icon: "🛎️", label: "Services" },
                { id: "helper", name: "helper", icon: "👷", label: "Helpers" },
                { id: "events", name: "events", icon: "📅", label: "Events" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.name)}
                  className={`
            flex flex-col items-center justify-center p-1 sm:p-2
            transition-all duration-300 
            ${activeTab === tab.name
                      ? "text-red-600 transform scale-105 sm:scale-110"
                      : "text-gray-700"
                    }
          `}
                >
                  <div
                    className={`
            ${tab.name === 'all' ? allRotation :
                        tab.name === 'properties' ? propertiesRotation :
                          tab.name === 'services' ? servicesRotation :
                            tab.name === 'helper' ? helperRotation :
                              eventsRotation
                      } 
            transition-transform duration-300 
            text-4xl sm:text-4xl
            w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
          `}
                  >
                    <span className="
            scale-110 
            drop-shadow-[0_2px_1px_rgba(0,0,0,0.3)]
            hover:drop-shadow-[0_3px_2px_rgba(0,0,0,0.4)]
            active:scale-100
            transition-all duration-200
            ${activeTab === tab.name ? 
             
            }
          ">
                      {tab.icon}
                    </span>



                  </div>
                  <span className="mt-1 text-xs font-semibold capitalize truncate w-full max-w-[80px]">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>



          {/* Improved Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Search Input */}
            <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
              <label htmlFor="search-input" className="sr-only">Search by keyword, location...</label>
              <input
                id="search-input"
                type="text"
                placeholder={rotatingPlaceholder || "Search by keyword, location..."}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm text-gray-800 placeholder-gray-400"
                onChange={handleSearchInput}
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

              {displayedCities.length > 0 && (
                <ul className="absolute z-30 border border-gray-200 w-full rounded-b-lg shadow-lg mt-1 max-h-60 overflow-y-auto bg-gray-50 bg-opacity-90 backdrop-blur-sm">
                  {displayedCities.map((city, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800 flex items-center"
                      onClick={() => {
                        setSearchQuery(city);
                        handleSearchSubmit(city);
                        setDisplayedCities([]);
                      }}
                    >
                      <FaMapMarkerAlt className="text-gray-400 mr-2" />
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price Range */}
            <div className="w-full">
              <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price: {formatPrice(priceRange)}
              </label>
              <input
                id="price-range"
                type="range"
                min="10"
                max="10000000"
                step="50000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Type Dropdown (hidden for "all" tab) */}
            {activeTab !== "all" && (
              <div className="relative w-full">
                <label htmlFor="type-dropdown" className="sr-only">Select Type</label>
                <button
                  id="type-dropdown"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <span className="flex items-center">
                    {currentSelectedType.icon && (
                      <span className="mr-2 text-xl">
                        {currentSelectedType.icon}
                      </span>
                    )}
                    {currentSelectedType.label}
                  </span>
                  <FaAngleDown
                    className={`ml-2 transform transition-transform ${isTypeOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>
                {isTypeOpen && (
                  <div className="absolute z-30 w-full border border-gray-200 rounded-lg shadow-lg mt-2 bg-gray-50 bg-opacity-90 backdrop-blur-sm max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center"
                        onClick={() => {
                          if (activeTab === "properties") setPropertyType("all");
                          else if (activeTab === "services") setServiceType("all");
                          else if (activeTab === "helper") setHelperType("all");
                          else if (activeTab === "events") setEventType("all");
                          setIsTypeOpen(false);
                        }}
                      >
                        <span className="mr-2 text-xl">
                          {activeTab === "properties" ? <FaHome /> : activeTab === "services" ? <FaTools /> : activeTab === "helper" ? <FaUserAlt /> : <FaCalendarAlt />}
                        </span>
                        All{" "}
                        {activeTab === "properties"
                          ? "Properties"
                          : activeTab === "services"
                            ? "Services"
                            : activeTab === "helper"
                              ? "Helpers"
                              : "Events"}
                      </li>
                      {Object.entries(currentTypes).map(([key, { label, icon }]) => (
                        <li
                          key={key}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center"
                          onClick={() => {
                            if (activeTab === "properties") setPropertyType(key);
                            else if (activeTab === "services") setServiceType(key);
                            else if (activeTab === "helper") setHelperType(key);
                            else if (activeTab === "events") setEventType(key);
                            setIsTypeOpen(false);
                          }}
                        >
                          <span className="mr-2 text-xl">{icon}</span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 ">
          {error && <ErrorMessage message={error} onRetry={fetchListings} />}

          {/* AI Recommendations Section for all tabs */}
          {/* AI Recommendations Section for all tabs */}
          {/* AI Recommendations Section for all tabs */}
          {recommendations[activeTab]?.length > 0 && (
            <div className="mt-0 mb-8 relative">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <FaMagic className="mr-2 text-purple-600" />
                AI Recommended for You
              </h2>

              <div className="relative ">
                <Swiper
                  slidesPerView={1.9}
                  spaceBetween={16}
                  navigation={{
                    nextEl: '.recommendations-swiper-button-next',
                    prevEl: '.recommendations-swiper-button-prev',
                  }}
                  modules={[Navigation]}
                  className="mySwiper"
                  breakpoints={{
                    480: { slidesPerView: 2.5 },
                    640: { slidesPerView: 3.3 },
                    768: { slidesPerView: 4.3 },
                    1024: { slidesPerView: 5.3 },
                    1280: { slidesPerView: 6.3 },
                  }}
                >
                  {recommendations[activeTab].map((item) => {
                    // Airbnb-style medium card
                    return (
                      <SwiperSlide key={item._id}>
                        <div className=" rounded-xl  hover:shadow-sm transition-all overflow-hidden  h-full flex flex-col">
                          {/* Image container */}
                          <div className="relative pb-[75%]"> {/* 4:3 aspect ratio */}
                            {item.imageUrls?.[0] ? (
                              <img
                                src={item.imageUrls[0]}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/300x225?text=Image+Not+Available'}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                                <FaHome className="text-gray-400 text-3xl" />
                              </div>
                            )}
                            {/* Favorite button */}
                            <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                              <FaHeart className="text-gray-500 hover:text-red-500" />
                            </button>
                          </div>

                          {/* Card content - medium size */}
                          <div className="p-3 flex-grow flex flex-col">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-800 text-base truncate">{item.name}</h3>
                              <div className="flex items-center">
                                <FaStar className="text-yellow-400 mr-1 text-sm" />
                                <span className="font-medium text-sm">5.0</span>
                              </div>
                            </div>

                            <p className="text-gray-500 text-xs mt-1 line-clamp-2 h-8">
                              {item.description?.substring(0, 80) || 'No description available'}
                            </p>

                            <div className="mt-auto pt-2">
                              <div className="flex justify-between items-center">
                                <p className="text-base font-semibold">
                                  <span className="text-gray-800">{formatPrice(item.priceNumber || item.regularPrice || 0)}</span>
                                  {item.type === 'rent' && <span className="text-gray-600 text-xs font-normal"> / mo</span>}
                                </p>
                                {item.type && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                                    {PROPERTY_TYPES[item.type]?.label ||
                                      SERVICE_TYPES[item.type]?.label ||
                                      HELPER_TYPES[item.type]?.label ||
                                      LOCAL_EVENT_TYPES[item.type]?.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <div className="recommendations-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="recommendations-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          {/* Trending Section */}
          {trendingItems.length > 0 && (
            <div className="mt-0 mb-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <FaFire className="mr-2 text-orange-600" />
                Trending Now
              </h2>
              <Swiper
                slidesPerView={1.6}
                spaceBetween={14}
                pagination={{ clickable: true }}
                modules={[Navigation, Pagination]}
                className="mySwiper !pb-8"
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  768: { slidesPerView: 4, spaceBetween: 24 },
                  1024: { slidesPerView: 5, spaceBetween: 28 },
                }}
              >
                {trendingItems.map((item) => {
                  if (Object.keys(PROPERTY_TYPES).includes(item.type)) {
                    return (
                      <SwiperSlide key={item._id} className="!h-auto bg-slate-150 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                        <ListingItem
                          listing={item}
                          onClick={() => handleItemNavigation(item)}
                          compactMode={true}
                        />
                      </SwiperSlide>
                    );
                  } else if (Object.keys(SERVICE_TYPES).includes(item.type)) {
                    return (
                      <SwiperSlide key={item._id} className="!h-auto bg-slate-150 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                        <ServiceItem
                          service={item}
                          onClick={() => handleItemNavigation(item)}
                          compactMode={true}
                        />
                      </SwiperSlide>
                    );
                  } else if (Object.keys(HELPER_TYPES).includes(item.type)) {
                    return (
                      <SwiperSlide key={item._id} className="!h-auto bg-slate-150 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                        <HelperItem
                          helper={item}
                          onClick={() => handleItemNavigation(item)}
                          compactMode={true}
                        />
                      </SwiperSlide>
                    );
                  } else if (Object.keys(LOCAL_EVENT_TYPES).includes(item.type)) {
                    return (
                      <SwiperSlide key={item._id} className="!h-auto bg-slate-150 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                        <EventItem
                          event={{
                            ...item,
                            address: item.location || "",
                            dateTime: item.date || new Date(),
                            regularPrice: item.priceNumber || 0
                          }}
                          onClick={() => handleItemNavigation(item)}
                          compactMode={true}
                        />
                      </SwiperSlide>
                    );
                  }
                  return null;
                })}
              </Swiper>
            </div>
          )}

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="mt-8 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                Your Recent Searches
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {recentSearches.map((search, index) => (
                  <span
                    key={index}
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearchSubmit(search);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full cursor-pointer hover:bg-blue-200 transition-colors text-sm flex items-center"
                  >
                    {search}
                    <FaTimes
                      className="ml-2 text-blue-600 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecentSearches((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All Listings Display */}
          {/* All Listings Display */}
          {/* All Listings Display */}
          <div className="mt-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              {activeTab === "all" && ""}
              {activeTab === "properties" && ""}
              {activeTab === "services" && " "}
              {activeTab === "helper" && ""}
              {activeTab === "events" && ""}
            </h2>

            {filteredListingsFull.length === 0 && !isLoading && (
              <p className="text-center text-gray-600 text-lg">
                No {activeTab === "all" ? "listings" : activeTab === "properties" ? "properties" : activeTab === "services" ? "services" : activeTab === "helper" ? "helpers" : "events"} found for your criteria.
              </p>
            )}

            {/* Special layout for "All" tab with separate sections */}
            {activeTab === "all" && categorizedListings && (
              <div>
                {/* Properties Section */}
                {categorizedListings.properties.length > 0 && (
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-md md:text-2xl font-bold text-gray-800 flex items-center">
                        <FaHome className="mr-2 text-blue-600" />
                        Properties for You
                      </h3>
                      <button
                        onClick={() => setActiveTab("properties")}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <Swiper
                      slidesPerView={1.3}
                      spaceBetween={16}
                      modules={[Navigation]}
                      className="mySwiper"
                      breakpoints={{
                        640: { slidesPerView: 2.3, spaceBetween: 20 },
                        768: { slidesPerView: 3.3, spaceBetween: 24 },
                        1024: { slidesPerView: 4.3, spaceBetween: 28 },
                        1280: { slidesPerView: 5.3, spaceBetween: 32 },
                      }}
                    >
                      {categorizedListings.properties
                        .slice(0, 20)
                        .map((item) => (
                          <SwiperSlide key={item._id} className="!h-auto">
                            <ListingItem
                              listing={item}
                              onClick={() => handleItemNavigation(item)}
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                )}

                {/* Services Section */}
                {categorizedListings.services.length > 0 && (
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-md md:text-2xl font-bold text-gray-800 flex items-center">
                        <FaTools className="mr-2 text-green-600" />
                        Recommended Services
                      </h3>
                      <button
                        onClick={() => setActiveTab("services")}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <Swiper
                      slidesPerView={1.3}
                      spaceBetween={16}
                      modules={[Navigation]}
                      className="mySwiper"
                      breakpoints={{
                        640: { slidesPerView: 2.3, spaceBetween: 20 },
                        768: { slidesPerView: 3.3, spaceBetween: 24 },
                        1024: { slidesPerView: 4.3, spaceBetween: 28 },
                        1280: { slidesPerView: 5.3, spaceBetween: 32 },
                      }}
                    >
                      {categorizedListings.services
                        .slice(0, 20)
                        .map((item) => (
                          <SwiperSlide key={item._id} className="!h-auto">
                            <ServiceItem
                              service={item}
                              onClick={() => handleItemNavigation(item)}
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                )}

                {/* Helpers Section */}
                {categorizedListings.helper.length > 0 && (
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-md md:text-2xl font-bold text-gray-800 flex items-center">
                        <FaUserAlt className="mr-2 text-purple-600" />
                        Trusted Helpers Nearby
                      </h3>
                      <button
                        onClick={() => setActiveTab("helper")}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <Swiper
                      slidesPerView={1.3}
                      spaceBetween={16}
                      modules={[Navigation]}
                      className="mySwiper"
                      breakpoints={{
                        640: { slidesPerView: 2.3, spaceBetween: 20 },
                        768: { slidesPerView: 3.3, spaceBetween: 24 },
                        1024: { slidesPerView: 4.3, spaceBetween: 28 },
                        1280: { slidesPerView: 5.3, spaceBetween: 32 },
                      }}
                    >
                      {categorizedListings.helper
                        .slice(0, 20)
                        .map((item) => (
                          <SwiperSlide key={item._id} className="!h-auto">
                            <HelperItem
                              helper={item}
                              onClick={() => handleItemNavigation(item)}
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                )}

                {/* Events Section */}
                {categorizedListings.events.length > 0 && (
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-md md:text-2xl font-bold text-gray-800 flex items-center">
                        <FaCalendarAlt className="mr-2 text-red-600" />
                        Local Events Happening Soon
                      </h3>
                      <button
                        onClick={() => setActiveTab("events")}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <Swiper
                      slidesPerView={1.3}
                      spaceBetween={16}
                      modules={[Navigation]}
                      className="mySwiper"
                      breakpoints={{
                        640: { slidesPerView: 2.3, spaceBetween: 20 },
                        768: { slidesPerView: 3.3, spaceBetween: 24 },
                        1024: { slidesPerView: 4.3, spaceBetween: 28 },
                        1280: { slidesPerView: 5.3, spaceBetween: 32 },
                      }}
                    >
                      {categorizedListings.events
                        .slice(0, 20)
                        .map((item) => (
                          <SwiperSlide key={item._id} className="!h-auto">
                            <EventItem
                              event={{
                                ...item,
                                address: item.location || "",
                                dateTime: item.date || new Date(),
                                regularPrice: item.priceNumber || 0
                              }}
                              onClick={() => handleItemNavigation(item)}
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                )}
              </div>
            )}

            {/* Grid layout for other tabs */}
            {activeTab !== "all" && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredListingsFull
                  .slice(0, visibleListings)
                  .map((item) => {
                    if (activeTab === "services") {
                      return (
                        <ServiceItem
                          key={item._id}
                          service={item}
                          onClick={() => handleItemNavigation(item)}
                        />
                      );
                    } else if (activeTab === "helper") {
                      return (
                        <HelperItem
                          key={item._id}
                          helper={item}
                          onClick={() => handleItemNavigation(item)}
                        />
                      );
                    } else if (activeTab === "events") {
                      return (
                        <EventItem
                          key={item._id}
                          event={item}
                          onClick={() => handleItemNavigation(item)}
                        />
                      );
                    } else {
                      return (
                        <ListingItem
                          key={item._id}
                          listing={item}
                          onClick={() => handleItemNavigation(item)}
                        />
                      );
                    }
                  })}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-6">
                <LoadingSpinner message="Loading more..." />
              </div>
            )}

            {activeTab !== "all" && filteredListingsFull.length > visibleListings && !isLoading && (
              <div
                className="flex justify-center mt-8 cursor-pointer"
                ref={scrollRef}
                onClick={() => setVisibleListings((prev) => prev + LOAD_MORE_COUNT)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setVisibleListings((prev) => prev + LOAD_MORE_COUNT);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Load more items"
              >
                <span className="text-7xl font-bold text-red-400 hover:text-blue-500 transition-colors transform hover:scale-110 duration-300">
                  ....
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}