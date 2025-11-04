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
  FaBrain,
  FaRocket,
  FaGem,
  FaHistory,
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
const INITIAL_LOAD_COUNT = 20;
const LOAD_MORE_COUNT = 8;
const API_RETRY_LIMIT = 3;
const API_RETRY_DELAY = 1000;

// API URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY || "";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Property and Service types
const PROPERTY_TYPES = {
  rent: { icon: "🔑", label: "Rent" },
  sale: { icon: "🏷️", label: "Sale" },
  over: { icon: "🏬", label: "Guest-House" },
  office: { icon: "🕒", label: "Hourly-Room" },
  land: { icon: "🌳", label: "Land" },
};

const SERVICE_TYPES = {
  cleaning: { icon: "🧹", label: "Cleaning" },
  maintenance: { icon: "🛠️", label: "Maintenance" },
  moving: { icon: "🚚", label: "Moving" },
  landscaping: { icon: "🌿", label: "Landscaping" },
  catering: { icon: "🍽️", label: "Catering" },
  other: { icon: "❓", label: "Other" },
  daycare: { icon: "👶", label: "DayCare" },
  schoolTransport: { icon: "🚌", label: "School" }
};

const HELPER_TYPES = {
  domestic: { icon: "👔", label: "General Help" },
  errand: { icon: "🛍️", label: "Errand Runner" },
  tutor: { icon: "📚", label: "Tutor" },
  chef: { icon: "👩‍🍳", label: "Chef" },
  maid: { icon: "🧹", label: "Maid" },
  beauty: { icon: "💄", label: "Beauty" },
  barber: { icon: "💈", label: "Barber" },
  tattoo: { icon: "🖋️", label: "Tattoo Artist" },
  photography: { icon: "📷", label: "Photographer" },
}

const LOCAL_EVENT_TYPES = {
  music: { icon: "🎵", label: "Music" },
  sports: { icon: "⚽", label: "Sports" },
  art: { icon: "🎨", label: "Art & Culture" },
  community: { icon: "👥", label: "Community" },
  food: { icon: "🍽️", label: "Food & Drink" },
  other: { icon: "❓", label: "Other Events" },
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
    "https://images.unsplash.com/photo-1567563614508-c4866295c54f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1031",
  daycare:
    "https://images.unsplash.com/photo-1567746455504-cb3213f8f5b8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
  schoolTransport:
    "https://images.unsplash.com/photo-1757621448452-009dc8603b33?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHNjaG9vbCUyMHRyYW5zcG9ydHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500"
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
  tattoo: "https://images.unsplash.com/photo-1724343163782-52276ca2e6c2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870"
};

const EVENT_IMAGES = {
  music:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  sports:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  art: "https://plus.unsplash.com/premium_photo-1722945698272-237c4180e1cd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=878",
  community:
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
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
 * Formats a number as a South African Rand currency string.
 */
const formatPrice = (price) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(price);

/**
 * Enhanced ErrorMessage Component
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-2xl mb-6 shadow-lg">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
          <FaExclamationTriangle className="text-white text-xl" />
        </div>
      </div>
      <div className="ml-4">
        <p className="text-red-800 font-semibold text-lg">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

/** 
 * Enhanced ServiceCategoriesSlide Component
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
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        {title}
      </h2>
      <Swiper
        slidesPerView={3}
        spaceBetween={20}
        navigation={false}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mySwiper !pb-10"
        breakpoints={{
          640: {
            slidesPerView: 4,
            spaceBetween: 25,
          },
          768: {
            slidesPerView: 5,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 35,
          },
          1280: {
            slidesPerView: 7,
            spaceBetween: 40,
          },
        }}
      >
        {Object.entries(categories).map(([key, { label, icon }]) => (
          <SwiperSlide key={key} className="flex justify-center">
            <button
              onClick={() => onSelectCategory(key)}
              className="flex flex-col items-center justify-center w-28 sm:w-32 focus:outline-none  transform transition-all duration-500 hover:scale-110"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-2xl group-hover:shadow-3xl transition-all duration-500 flex items-center justify-center relative bg-gradient-to-br from-white to-gray-50">
                {categoryImages[key] ? (
                  <img
                    src={categoryImages[key]}
                    alt={label}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-4xl text-gray-600 group-hover:text-purple-600 transition-colors duration-300">
                    {icon}
                  </span>
                )}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-semibold text-center">{label}</p>
                </div>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
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
 * Enhanced Home Component
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
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Enhanced tab configuration with AI icons
  const tabs = [
    { id: "all", name: "all", icon: "🌐", label: "", gradient: "from-purple-500 to-pink-500" },
    { id: "properties", name: "properties", icon: "🏠", label: "", gradient: "from-blue-500 to-cyan-500" },
    { id: "services", name: "services", icon: "🛎️", label: "", gradient: "from-green-500 to-emerald-500" },
    { id: "helper", name: "helper", icon: "👷", label: " ", gradient: "from-orange-500 to-red-500" },
    { id: "events", name: "events", icon: "🎪", label: "", gradient: "from-indigo-500 to-purple-500" }
  ];

  // Enhanced hero images with AI-themed visuals
  const heroImages = useMemo(() => [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  ], []);

  // Cities for placeholder rotation
  const cities = [
    "Polokwane", "Mokopane", "Seshego", "Pretoria", "Tembisa", "Soweto", 
    "Bakenburg", "Springs", "Ivory Park", "Benoni", "Mmamelodi", "Cape Town", 
    "Kempton Park", "Randburg", "Durban", "Makweng", "Phomolong", "Davetony", 
    "Mafikeng", "Nelsprit", "Secunda"
  ];

  const [rotatingPlaceholder, setRotatingPlaceholder] = useState('');
  const [displayedCities, setDisplayedCities] = useState([]);
  const rotationInterval = useRef(null);
  const placeholderIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);

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

  // Handle item navigation
  const handleItemNavigation = useCallback((item) => {
    incrementInteraction(item._id);

    // Save to recently viewed
    try {
      const viewedItems = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      // Remove if already exists (to avoid duplicates)
      const filteredItems = viewedItems.filter(viewedItem => viewedItem._id !== item._id);
      
      // Add to beginning and limit to 10 items
      const updatedItems = [item, ...filteredItems].slice(0, 10);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedItems));
      setRecentlyViewed(updatedItems);
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving to recently viewed:', error);
    }

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

  // Handle favorite clicks
  const handleFavoriteClick = (item) => {
    console.log('Favorite clicked for:', item.name);
  };

  // Handle view all recommendations
  const handleViewAllRecommendations = async () => {
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setIsLoading(true);
          
          try {
            // Simulate API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockRecommendations = allListings
              .filter(item => item.latitude && item.longitude)
              .slice(0, 10);
            
            navigate('/recommendations', {
              state: {
                recommendations: mockRecommendations,
                userLocation: { latitude, longitude },
                title: 'Recommended Near You'
              }
            });
          } catch (error) {
            console.error('Error fetching location-based recommendations:', error);
            alert('Unable to get recommendations for your location');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to access your location. Please enable location services.');
        }
      );
    } catch (error) {
      console.error('Error in handleViewAllRecommendations:', error);
    }
  };

  // Load recently viewed items
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const viewedItems = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        // Filter out any invalid items and limit to last 10
        const validItems = viewedItems
          .filter(item => item && item._id && item.name)
          .slice(0, 10);
        setRecentlyViewed(validItems);
      } catch (error) {
        console.error('Error loading recently viewed:', error);
        setRecentlyViewed([]);
      }
    };

    loadRecentlyViewed();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadRecentlyViewed();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Placeholder rotation function
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
    }, 220);
  };

  // Handle search input
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

  // Handle search submit
  const handleSearchSubmit = (city = searchQuery) => {
    console.log("Searching for:", city);
    if (city.trim()) {
      setRecentSearches(prev => {
        const newSearches = [city, ...prev.filter(s => s !== city)].slice(0, 5);
        return newSearches;
      });
    }
  };

  // Fetch listings function
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

  // Generate recommendations
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

  // Enhance listing description
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

  // Enhance all descriptions function
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

  // Handle category selections
  const handleSelectServiceCategory = useCallback((category) => {
    setServiceType(category);
  }, []);

  const handleSelectHelperCategory = useCallback((category) => {
    setHelperType(category);
  }, []);

  const handleSelectEventCategory = useCallback((category) => {
    setEventType(category);
  }, []);

  // Filtered listings
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

  // Categorized listings for "all" tab
  const categorizedListings = useMemo(() => {
    const categories = {
      helper: [],
      properties: [],
      services: [],
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

  // Current listings based on active tab
  const currentListings = useMemo(() => {
    return activeTab === "all" ? filteredListingsFull : filteredListingsFull;
  }, [activeTab, filteredListingsFull]);

  // Effects
  useEffect(() => {
    startPlaceholderRotation();
    return () => clearInterval(rotationInterval.current);
  }, []);

  useEffect(() => {
    document.body.classList.add("home-page");
    return () => document.body.classList.remove("home-page");
  }, []);

  const { ref: scrollRef, inView } = useInView({ threshold: 0.1 });

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

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Determine current types and selected type
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

  let currentSelectedType = { label: "Select Type", icon: null };

  if (activeTab === "properties") {
    currentSelectedType = propertyType === "all"
      ? { label: "Property Type", icon: "🏠" }
      : PROPERTY_TYPES[propertyType]
        ? { ...PROPERTY_TYPES[propertyType], icon: PROPERTY_TYPES[propertyType].icon }
        : { label: "Property Type", icon: "🏠" };
  } else if (activeTab === "services") {
    currentSelectedType = serviceType === "all"
      ? { label: "Service Type", icon: "🛎️" }
      : SERVICE_TYPES[serviceType]
        ? { ...SERVICE_TYPES[serviceType], icon: SERVICE_TYPES[serviceType].icon }
        : { label: "Service Type", icon: "🛎️" };
  } else if (activeTab === "helper") {
    currentSelectedType = helperType === "all"
      ? { label: "Helper Type", icon: "👷" }
      : HELPER_TYPES[helperType]
        ? { ...HELPER_TYPES[helperType], icon: HELPER_TYPES[helperType].icon }
        : { label: "Helper Type", icon: "👷" };
  } else if (activeTab === "events") {
    currentSelectedType = eventType === "all"
      ? { label: "Event Type", icon: "🎪" }
      : LOCAL_EVENT_TYPES[eventType]
        ? { ...LOCAL_EVENT_TYPES[eventType], icon: LOCAL_EVENT_TYPES[eventType].icon }
        : { label: "Event Type", icon: "🎪" };
  }

  if (isInitialLoading) {
    return <LoadingSpinner message="Loading listings..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative font-sans overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Hero Section */}
      <div className="relative h-[600px] md:h-[700px] overflow-hidden rounded-b-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-6xl mx-auto text-white">
            <h1 className="text-4xl md:text-7xl font-black mb-6 animate-fade-in-down">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-2xl">
                {activeTab === "all" && ""}
                {activeTab === "properties" && "Properties"}
                {activeTab === "services" && "AI Services"}
                {activeTab === "helper" && "Smart Helpers"}
                {activeTab === "events" && "Live Events"}
              </span>
            </h1>
            
            <p className="text-xl md:text-3xl mb-8 opacity-90 font-light animate-fade-in-up">
              {activeTab === "all" && "Intelligent recommendations • Real-time insights • Personalized results"}
              {activeTab === "properties" && "AI-curated listings • Smart pricing • Virtual tours"}
              {activeTab === "services" && "Verified providers • Instant booking • Quality guaranteed"}
              {activeTab === "helper" && "Background checked • Rated & reviewed • Available now"}
              {activeTab === "events" && "Local happenings • Live updates • Easy booking"}
            </p>

            {/* Enhanced AI Button */}
            <button
              onClick={enhanceAllDescriptions}
              disabled={isEnhancing}
              className="relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center">
                {isEnhancing ? (
                  <>
                    <FaSpinner className="animate-spin mr-3 text-xl" />
                    AI Processing...
                  </>
                ) : (
                  <>
                    <FaGem className="mr-3 text-xl" />
                    Enhance with AI Magic
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
        
        <Fade arrows={false} indicators={false} duration={5000} transitionDuration={1000}>
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="h-[600px] md:h-[700px] bg-cover bg-center transform hover:scale-105 transition-transform duration-10000"
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </Fade>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-0 relative z-10">
        {error && <ErrorMessage message={error} onRetry={fetchListings} />}

        {/* Enhanced Tab Navigation */}
        <div className="rounded-3xl shadow-2xl p-6 transform -translate-y-24 relative z-20 bg-white/90 backdrop-blur-xl border border-white/20">
          {/* AI Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
              <FaRocket className="text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">SMART CATEGORIES</span>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.name)}
                className={`
                   relative flex flex-col items-center justify-center
                  px-6 py-4 rounded-2xl transition-all duration-500
                  ${activeTab === tab.name
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-105`
                    : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl"
                  }
                `}
              >
                {/* Animated Background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tab.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <span className="text-3xl mb-2 drop-shadow-sm">
                    {tab.icon}
                  </span>
                  <span className="text-sm font-semibold capitalize whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>

                {/* Active Indicator */}
                {activeTab === tab.name && (
                  <div className="absolute -bottom-2 w-12 h-1 bg-white rounded-full shadow-lg"></div>
                )}
              </button>
            ))}
          </div>

          {/* Enhanced Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end mt-8">
            {/* Enhanced Search Input */}
            <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={rotatingPlaceholder || "Ask AI to find anything..."}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 shadow-lg text-gray-800 placeholder-gray-400 font-medium"
                  onChange={handleSearchInput}
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                />
                {/* AI Search Badge */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    <FaBrain className="text-white text-xs mr-1" />
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                </div>
              </div>

              {displayedCities.length > 0 && (
                <ul className="absolute z-30 border-2 border-gray-200 w-full rounded-2xl shadow-2xl mt-2 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-xl">
                  {displayedCities.map((city, index) => (
                    <li
                      key={index}
                      className="px-6 py-4 cursor-pointer hover:bg-purple-50 text-gray-800 flex items-center border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery(city);
                        handleSearchSubmit(city);
                        setDisplayedCities([]);
                      }}
                    >
                      <FaMapMarkerAlt className="text-purple-500 mr-3" />
                      <div>
                        <div className="font-semibold">{city}</div>
                        <div className="text-sm text-gray-500">Search in {city}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Enhanced Price Range */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💰 Max Price: <span className="text-purple-600 font-bold">{formatPrice(priceRange)}</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="10000000"
                  step="50000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl appearance-none cursor-pointer shadow-inner"
                />
                <div 
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl pointer-events-none"
                  style={{ width: `${(priceRange / 10000000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Enhanced Type Dropdown */}
         {activeTab !== "all" && (
  <div className="relative w-full">
    <button
      onClick={() => setIsTypeOpen(!isTypeOpen)}
      className="w-full flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold hover:bg-white hover:border-purple-500 transition-all duration-300 shadow-lg focus:ring-4 focus:ring-purple-500/20"
    >
      <span className="flex items-center">
        <span className="mr-3 text-2xl">{currentSelectedType.icon}</span>
        {currentSelectedType.label}
      </span>
      <FaAngleDown className={`ml-2 transform transition-transform duration-300 ${isTypeOpen ? "rotate-180" : "rotate-0"}`} />
    </button>
    
    {isTypeOpen && (
      <div className="absolute z-30 w-full border-2 border-gray-200 rounded-2xl shadow-2xl mt-3 bg-white/95 backdrop-blur-xl max-h-80 overflow-y-auto">
        <ul className="py-3">
          <li
            className="px-6 py-4 hover:bg-purple-50 cursor-pointer text-gray-700 flex items-center border-b border-gray-100"
            onClick={() => {
              if (activeTab === "properties") setPropertyType("all");
              else if (activeTab === "services") setServiceType("all");
              else if (activeTab === "helper") setHelperType("all");
              else if (activeTab === "events") setEventType("all");
              setIsTypeOpen(false);
            }}
          >
            <span className="mr-4 text-2xl">
              {activeTab === "properties" ? "🏠" : activeTab === "services" ? "🛎️" : activeTab === "helper" ? "👷" : "🎪"}
            </span>
            <div>
              <div className="font-semibold">All {activeTab}</div>
              <div className="text-sm text-gray-500">Browse everything</div>
            </div>
          </li>
          {Object.entries(currentTypes).map(([key, { label, icon }]) => (
            <li
              key={key}
              className="px-6 py-4 hover:bg-purple-50 cursor-pointer text-gray-700 flex items-center border-b border-gray-100 last:border-b-0"
              onClick={() => {
                if (activeTab === "properties") setPropertyType(key);
                else if (activeTab === "services") setServiceType(key);
                else if (activeTab === "helper") setHelperType(key);
                else if (activeTab === "events") setEventType(key);
                setIsTypeOpen(false);
              }}
            >
              <span className="mr-4 text-2xl">{icon}</span>
              <div>
                <div className="font-semibold">{label}</div>
                <div className="text-sm text-gray-500">Explore {label.toLowerCase()}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 -translate-y-16">
          {/* Enhanced AI Recommendations Section */}
          {recommendations[activeTab]?.length > 0 && (
            <div className="mt-0 mb-16 relative">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      AI Recommendations
                    </h2>
                    <p className="text-gray-600 text-sm">Personalized just for you</p>
                  </div>
                </div>
                <button 
                  onClick={handleViewAllRecommendations}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center"
                >
                  View all
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Swiper */}
              <div className="relative px-2">
                <Swiper
                  slidesPerView={1.8}
                  spaceBetween={20}
                  navigation={{
                    nextEl: '.recommendations-swiper-button-next',
                    prevEl: '.recommendations-swiper-button-prev',
                  }}
                  modules={[Navigation]}
                  className="recommendations-swiper"
                  breakpoints={{
                    480: { slidesPerView: 2.3 },
                    640: { slidesPerView: 2.8 },
                    768: { slidesPerView: 3.3 },
                    1024: { slidesPerView: 4.3 },
                    1280: { slidesPerView: 5.3 },
                    1536: { slidesPerView: 6.3 },
                  }}
                >
                  {recommendations[activeTab].map((item) => {
                    const getItemRoute = (item) => {
                      switch (item.type) {
                        case 'helper':
                          return `/helper/${item._id}`;
                        case 'event':
                          return `/event/${item._id}`;
                        case 'service':
                          return `/service/${item._id}`;
                        case 'rent':
                        case 'sale':
                          return `/listing/${item._id}`;
                        default:
                          return `/listing/${item._id}`;
                      }
                    };

                    const itemRoute = getItemRoute(item);

                    return (
                      <SwiperSlide key={item._id}>
                        <Link 
                          to={itemRoute}
                          className="block bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-purple-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer "
                        >
                          {/* Enhanced Image Section */}
                          <div className="relative pb-[75%] overflow-hidden">
                            {item.imageUrls?.[0] ? (
                              <img
                                src={item.imageUrls[0]}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=210&fit=crop';
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <div className="text-4xl text-gray-400">
                                  {PROPERTY_TYPES[item.type]?.icon || SERVICE_TYPES[item.type]?.icon || HELPER_TYPES[item.type]?.icon || LOCAL_EVENT_TYPES[item.type]?.icon}
                                </div>
                              </div>
                            )}
                            
                            {/* Enhanced Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Enhanced Badges */}
                            <div className="absolute top-3 left-3">
                          
                            </div>
                            
                            <div className="absolute bottom-3 left-3">
                              <span className="px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                                {formatPrice(item.priceNumber)}
                              </span>
                            </div>

                            {/* Favorite Button */}
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFavoriteClick(item);
                              }}
                              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            >
                              <FaHeart className="text-gray-600 hover:text-red-500 text-sm transition-colors duration-300" />
                            </button>
                          </div>

                          {/* Enhanced Content Section */}
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors duration-300">
                              {item.name}
                            </h3>
                      
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-gray-500 text-xs">
                                <FaMapMarkerAlt className="mr-1" />
                                <span className="line-clamp-1">{item.address}</span>
                              </div>
                              <div className="flex items-center text-yellow-500 text-xs">
                                <FaStar className="mr-1" />
                                <span>5.0</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                {/* Enhanced Navigation Buttons */}
                <button className="recommendations-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                  <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="recommendations-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Category Slides */}
          {activeTab === "services" && (
            <ServiceCategoriesSlide type="services" onSelectCategory={handleSelectServiceCategory} />
          )}
          {activeTab === "helper" && (
            <ServiceCategoriesSlide type="helpers" onSelectCategory={handleSelectHelperCategory} />
          )}
          {activeTab === "events" && (
            <ServiceCategoriesSlide type="events" onSelectCategory={handleSelectEventCategory} />
          )}

          {/* Enhanced Main Content Area for ALL Tab */}
          {activeTab === "all" && (
            <div className="mt-8 space-y-16">
              {/* Helper Section - First Row */}
              {categorizedListings.helper.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4">
                        <span className="text-2xl text-white">👷</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Personal Helpers</h2>
                        <p className="text-gray-600 text-sm">Find trusted helpers for your needs</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab("helper")}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center"
                    >
                      View all
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative px-2">
                    <Swiper
                      slidesPerView={1.8}
                      spaceBetween={20}
                      navigation={{
                        nextEl: '.helper-swiper-button-next',
                        prevEl: '.helper-swiper-button-prev',
                      }}
                      modules={[Navigation]}
                      className="helper-swiper"
                      breakpoints={{
                        480: { slidesPerView: 2.3 },
                        640: { slidesPerView: 2.8 },
                        768: { slidesPerView: 3.3 },
                        1024: { slidesPerView: 4.3 },
                        1280: { slidesPerView: 5.3 },
                        1536: { slidesPerView: 6.3 },
                      }}
                    >
                      {categorizedListings.helper.slice(0, 8).map((item) => (
                        <SwiperSlide key={item._id}>
                          <HelperItem 
                            helper={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className="helper-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="helper-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Properties Section - Second Row */}
              {categorizedListings.properties.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                        <span className="text-2xl text-white">🏠</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
                        <p className="text-gray-600 text-sm">Find your perfect home or investment</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab("properties")}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center"
                    >
                      View all
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative px-2">
                    <Swiper
                      slidesPerView={1.8}
                      spaceBetween={20}
                      navigation={{
                        nextEl: '.properties-swiper-button-next',
                        prevEl: '.properties-swiper-button-prev',
                      }}
                      modules={[Navigation]}
                      className="properties-swiper"
                      breakpoints={{
                        480: { slidesPerView: 2.3 },
                        640: { slidesPerView: 2.8 },
                        768: { slidesPerView: 3.3 },
                        1024: { slidesPerView: 4.3 },
                        1280: { slidesPerView: 5.3 },
                        1536: { slidesPerView: 6.3 },
                      }}
                    >
                      {categorizedListings.properties.slice(0, 8).map((item) => (
                        <SwiperSlide key={item._id}>
                          <ListingItem 
                            listing={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className="properties-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="properties-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Services Section - Third Row */}
              {categorizedListings.services.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                        <span className="text-2xl text-white">🛎️</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
                        <p className="text-gray-600 text-sm">Professional services for your needs</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab("services")}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center"
                    >
                      View all
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative px-2">
                    <Swiper
                      slidesPerView={1.8}
                      spaceBetween={20}
                      navigation={{
                        nextEl: '.services-swiper-button-next',
                        prevEl: '.services-swiper-button-prev',
                      }}
                      modules={[Navigation]}
                      className="services-swiper"
                      breakpoints={{
                        480: { slidesPerView: 2.3 },
                        640: { slidesPerView: 2.8 },
                        768: { slidesPerView: 3.3 },
                        1024: { slidesPerView: 4.3 },
                        1280: { slidesPerView: 5.3 },
                        1536: { slidesPerView: 6.3 },
                      }}
                    >
                      {categorizedListings.services.slice(0, 8).map((item) => (
                        <SwiperSlide key={item._id}>
                          <ServiceItem 
                            service={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className="services-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="services-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Events Section - Fourth Row */}
              {categorizedListings.events.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                        <span className="text-2xl text-white">🎪</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                        <p className="text-gray-600 text-sm">Discover local happenings and activities</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab("events")}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center"
                    >
                      View all
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative px-2">
                    <Swiper
                      slidesPerView={1.8}
                      spaceBetween={20}
                      navigation={{
                        nextEl: '.events-swiper-button-next',
                        prevEl: '.events-swiper-button-prev',
                      }}
                      modules={[Navigation]}
                      className="events-swiper"
                      breakpoints={{
                        480: { slidesPerView: 2.3 },
                        640: { slidesPerView: 2.8 },
                        768: { slidesPerView: 3.3 },
                        1024: { slidesPerView: 4.3 },
                        1280: { slidesPerView: 5.3 },
                        1536: { slidesPerView: 6.3 },
                      }}
                    >
                      {categorizedListings.events.slice(0, 8).map((item) => (
                        <SwiperSlide key={item._id}>
                          <EventItem 
                            event={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className="events-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="events-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Main Content Area for Other Tabs */}
          {activeTab !== "all" && (
            <div className="mt-8">
              {/* Enhanced Results Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentListings.slice(0, visibleListings).map((listing) => (
                  <div key={listing._id} className="">
                    {activeTab === "properties" && (
                      <ListingItem 
                        listing={listing} 
                        onClick={() => handleItemNavigation(listing)}
                        className="transform transition-all duration-500 hover:scale-105" 
                      />
                    )}
                    {activeTab === "services" && (
                      <ServiceItem 
                        service={listing} 
                        onClick={() => handleItemNavigation(listing)}
                        className="transform transition-all duration-500 hover:scale-105" 
                      />
                    )}
                    {activeTab === "helper" && (
                      <HelperItem 
                        helper={listing} 
                        onClick={() => handleItemNavigation(listing)}
                        className="transform transition-all duration-500 hover:scale-105" 
                      />
                    )}
                    {activeTab === "events" && (
                      <EventItem 
                        event={listing} 
                        onClick={() => handleItemNavigation(listing)}
                        className="transform transition-all duration-500 hover:scale-105" 
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Enhanced Load More Button */}
              {visibleListings < currentListings.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleListings(prev => prev + LOAD_MORE_COUNT)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 flex items-center "
                  >
                    <span>Load More</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7-7V3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Enhanced Empty State */}
              {currentListings.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaSearch className="text-gray-400 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">No results found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or explore different categories to find what you re looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange(1000000);
                      setPropertyType("all");
                      setServiceType("all");
                      setHelperType("all");
                      setEventType("all");
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="max-w-8xl mx-auto px-1 py-0 mt-4">
            <div className=" rounded-1xl shadow-1xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                    <FaHistory className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
                    <p className="text-gray-600 text-sm">Your browsing history</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('recentlyViewed');
                    setRecentlyViewed([]);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center"
                >
                  Clear History
                </button>
              </div>

              <div className="relative">
                <Swiper
                  slidesPerView={1.8}
                  spaceBetween={20}
                  navigation={{
                    nextEl: '.recently-viewed-swiper-button-next',
                    prevEl: '.recently-viewed-swiper-button-prev',
                  }}
                  modules={[Navigation]}
                  className="recently-viewed-swiper"
                  breakpoints={{
                    480: { slidesPerView: 2.3 },
                    640: { slidesPerView: 2.8 },
                    768: { slidesPerView: 3.3 },
                    1024: { slidesPerView: 4.3 },
                    1280: { slidesPerView: 5.3 },
                    1536: { slidesPerView: 6.3 },
                  }}
                >
                  {recentlyViewed.map((item) => {
                    const getItemComponent = (item) => {
                      if (Object.keys(PROPERTY_TYPES).includes(item.type)) {
                        return (
                          <ListingItem 
                            listing={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        );
                      } else if (Object.keys(SERVICE_TYPES).includes(item.type)) {
                        return (
                          <ServiceItem 
                            service={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        );
                      } else if (Object.keys(HELPER_TYPES).includes(item.type)) {
                        return (
                          <HelperItem 
                            helper={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        );
                      } else if (Object.keys(LOCAL_EVENT_TYPES).includes(item.type)) {
                        return (
                          <EventItem 
                            event={item} 
                            onClick={() => handleItemNavigation(item)}
                            className="transform transition-all duration-500 hover:scale-105" 
                          />
                        );
                      }
                      return null;
                    };

                    return (
                      <SwiperSlide key={item._id}>
                        {getItemComponent(item)}
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                {/* Navigation Buttons */}
                <button className="recently-viewed-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                  <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="recently-viewed-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-2xl flex items-center justify-center text-gray-700 hover:text-purple-600 hover:border-purple-500 transition-all duration-300">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {recentlyViewed.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaHistory className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Recent Views</h3>
                  <p className="text-gray-500 text-sm">Items you view will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}