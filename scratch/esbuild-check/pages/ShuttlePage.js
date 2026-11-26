import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bus,
  MapPin,
  Calendar,
  Plus,
  Search,
  Navigation,
  Ticket,
  ShieldCheck,
  Car,
  Users,
  ArrowRightLeft,
  Home,
  X,
  Sparkles,
  CheckCircle2,
  Phone,
  Truck
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { resolveApiUrl } from "../utils/apiBaseUrl";
import ShuttleMap from "../components/shuttle/ShuttleMap";
import UberDriverCard from "../components/shuttle/UberDriverCard";
import PickupRequestSheet from "../components/shuttle/PickupRequestSheet";
import DriverShuttleUploadModal from "../components/shuttle/DriverShuttleUploadModal";
import DriverVerificationGate from "../components/shuttle/DriverVerificationGate";
import DriverAddRouteModal from "../components/shuttle/DriverAddRouteModal";
import DriverScheduleModal from "../components/shuttle/DriverScheduleModal";
import ShuttleBookingsList from "../components/shuttle/ShuttleBookingsList";
import DriverPickupList from "../components/shuttle/DriverPickupList";
import MovingVehicleUploadModal from "../components/shuttle/MovingVehicleUploadModal";
import MovingVehicleCard from "../components/shuttle/MovingVehicleCard";
import MovingRequestSheet from "../components/shuttle/MovingRequestSheet";
import MovingRequestsPanel from "../components/shuttle/MovingRequestsPanel";
const POPULAR_CORRIDORS = [
  { label: "All South Africa", serviceType: "all", origin: "", dest: "" },
  { label: "JHB \u2794 Polokwane", serviceType: "interprovincial", origin: "Johannesburg", dest: "Polokwane" },
  { label: "Pretoria \u2794 Durban", serviceType: "interprovincial", origin: "Pretoria", dest: "Durban" },
  { label: "JHB \u2794 Nelspruit", serviceType: "interprovincial", origin: "Johannesburg", dest: "Mbombela" },
  { label: "Polokwane Local", serviceType: "local", origin: "Polokwane", dest: "" }
];
const hasExplicitShuttleSchedule = (shuttle) => {
  if (!shuttle?.departureDate) return false;
  const departureDate = new Date(shuttle.departureDate);
  if (!Number.isFinite(departureDate.getTime())) return false;
  const timeLabel = String(shuttle.departureTime || "").trim();
  const match = timeLabel.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.?M\.?|P\.?M\.?)?/i);
  if (!match || !match[2] && !match[3]) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3]?.replace(/\./g, "").toUpperCase();
  return minutes <= 59 && hours <= (meridiem ? 12 : 23) && !(meridiem && hours === 0);
};
const hasShuttleDeparturePassed = (shuttle, now = /* @__PURE__ */ new Date()) => {
  if (!hasExplicitShuttleSchedule(shuttle)) return false;
  const departureDate = new Date(shuttle.departureDate);
  const localDate = `${departureDate.getFullYear()}-${String(departureDate.getMonth() + 1).padStart(2, "0")}-${String(departureDate.getDate()).padStart(2, "0")}`;
  const timeLabel = String(shuttle.departureTime || "").trim();
  const match = timeLabel.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.?M\.?|P\.?M\.?)?/i);
  let departureAt;
  if (!match) {
    departureAt = /* @__PURE__ */ new Date(`${localDate}T23:59:59`);
  } else {
    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const meridiem = match[3]?.replace(/\./g, "").toUpperCase();
    if (minutes > 59 || hours > (meridiem ? 12 : 23) || meridiem && hours === 0) {
      departureAt = /* @__PURE__ */ new Date(`${localDate}T23:59:59`);
    } else {
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      departureAt = /* @__PURE__ */ new Date(`${localDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
    }
  }
  return Number.isFinite(departureAt.getTime()) && departureAt <= now;
};
const movingDistanceKm = (first, second) => {
  if (!first || !second || !Number.isFinite(Number(first.lat)) || !Number.isFinite(Number(first.lng)) || !Number.isFinite(Number(second.lat)) || !Number.isFinite(Number(second.lng))) return null;
  const dLat = (Number(second.lat) - Number(first.lat)) * Math.PI / 180;
  const dLng = (Number(second.lng) - Number(first.lng)) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(Number(first.lat) * Math.PI / 180) * Math.cos(Number(second.lat) * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const SPOTTED_MOKOPANE_SHUTTLES = [
  {
    _id: "spotted-mok-pta",
    title: "Mokopane \u21C4 Pretoria Live Shuttle",
    originCity: "Mokopane",
    destinationCity: "Pretoria",
    departureDate: (/* @__PURE__ */ new Date()).toISOString(),
    departureTime: "14:30",
    currentCoordinates: { lat: -24.1944, lng: 29.0097, isLive: true, address: "Mokopane Taxi Rank" },
    pricePerSeat: 180,
    availableSeats: 5,
    totalSeats: 14,
    currentStatus: "boarding",
    isSpotted: true,
    carType: "Toyota Quantum",
    driverName: "Sello M."
  },
  {
    _id: "spotted-mok-plk",
    title: "Mokopane \u21C4 Polokwane Express",
    originCity: "Mokopane",
    destinationCity: "Polokwane",
    departureDate: (/* @__PURE__ */ new Date()).toISOString(),
    departureTime: "15:15",
    currentCoordinates: { lat: -24.178, lng: 29.022, isLive: true, address: "N1 Northbound Mokopane" },
    pricePerSeat: 65,
    availableSeats: 3,
    totalSeats: 14,
    currentStatus: "en_route",
    isSpotted: true,
    carType: "Toyota Quantum",
    driverName: "Kagiso T."
  },
  {
    _id: "spotted-mok-jhb",
    title: "Mokopane \u21C4 Johannesburg Direct",
    originCity: "Mokopane",
    destinationCity: "Johannesburg",
    departureDate: (/* @__PURE__ */ new Date()).toISOString(),
    departureTime: "16:00",
    currentCoordinates: { lat: -24.208, lng: 28.998, isLive: true, address: "Mokopane Central" },
    pricePerSeat: 220,
    availableSeats: 7,
    totalSeats: 15,
    currentStatus: "boarding",
    isSpotted: true,
    carType: "Mercedes Sprinter",
    driverName: "Thabo N."
  }
];
const SPOTTED_GENERAL_SHUTTLES = [
  {
    _id: "spotted-jhb-pta",
    title: "Johannesburg \u21C4 Pretoria Express",
    originCity: "Johannesburg",
    destinationCity: "Pretoria",
    departureDate: (/* @__PURE__ */ new Date()).toISOString(),
    departureTime: "14:00",
    currentCoordinates: { lat: -26.2041, lng: 28.0473, isLive: true, address: "Park Station" },
    pricePerSeat: 95,
    availableSeats: 4,
    totalSeats: 14,
    currentStatus: "boarding",
    isSpotted: true,
    carType: "Toyota Quantum",
    driverName: "Johannesburg Shuttle"
  },
  {
    _id: "spotted-pta-plk",
    title: "Pretoria \u21C4 Polokwane via Mokopane",
    originCity: "Pretoria",
    destinationCity: "Polokwane",
    departureDate: (/* @__PURE__ */ new Date()).toISOString(),
    departureTime: "15:00",
    currentCoordinates: { lat: -25.7479, lng: 28.2293, isLive: true, address: "Bosman Station" },
    pricePerSeat: 210,
    availableSeats: 6,
    totalSeats: 14,
    currentStatus: "en_route",
    isSpotted: true,
    carType: "Toyota Quantum",
    driverName: "Limpopo Liner"
  }
];
const normalizeCityQuery = (raw) => {
  const val = String(raw || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!val) return "";
  if (/mokopane|muko\s*pane|mukopane|mkwapane|potgietersrus|^muko$/i.test(val)) return "mokopane";
  if (/^(pta|tshwane)$/i.test(val)) return "pretoria";
  if (/^(jhb|joburg)$/i.test(val)) return "johannesburg";
  if (/^(plk|pietersburg)$/i.test(val)) return "polokwane";
  if (/^(dbn|ethekwini)$/i.test(val)) return "durban";
  if (/^cpt$/i.test(val)) return "cape town";
  if (/^nelspruit$/i.test(val)) return "mbombela";
  return val;
};
const parseShuttleSearchQuery = (qParam) => {
  const raw = String(qParam || "").trim();
  if (!raw) return { origin: "", dest: "", search: "" };
  const routeMatch = raw.match(/^(.+?)\s+(?:to|->|→|⇄|-)\s+(.+)$/i);
  if (routeMatch) {
    return {
      origin: routeMatch[1].trim(),
      dest: routeMatch[2].trim(),
      search: raw
    };
  }
  return { origin: "", dest: "", search: raw };
};
const ShuttlePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || searchParams.get("searchTerm") || "";
  const parsedInit = parseShuttleSearchQuery(initialQ);
  const initialOrigin = searchParams.get("origin") || searchParams.get("originCity") || parsedInit.origin;
  const initialDest = searchParams.get("destination") || searchParams.get("destinationCity") || parsedInit.dest;
  const [serviceType, setServiceType] = useState("all");
  const [originFilter, setOriginFilter] = useState(initialOrigin);
  const [destFilter, setDestFilter] = useState(initialDest);
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [showDriverDeskModal, setShowDriverDeskModal] = useState(false);
  const [driverDeskTab, setDriverDeskTab] = useState("requests");
  const [showDriverUploadModal, setShowDriverUploadModal] = useState(false);
  const [showDriverVerificationGate, setShowDriverVerificationGate] = useState(false);
  const [showMovingUploadModal, setShowMovingUploadModal] = useState(false);
  const [showMovingRequestsPanel, setShowMovingRequestsPanel] = useState(false);
  const [movingRequestsRole, setMovingRequestsRole] = useState("requester");
  const [providerIntent, setProviderIntent] = useState("shuttle");
  const [shuttleForRouteModal, setShuttleForRouteModal] = useState(null);
  const [selectedShuttleForBooking, setSelectedShuttleForBooking] = useState(null);
  const [shuttleForScheduleModal, setShuttleForScheduleModal] = useState(null);
  const [highlightedShuttle, setHighlightedShuttle] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [selectedMapVehicleType, setSelectedMapVehicleType] = useState(() => searchParams.get("vehicleType") === "moving" ? "moving" : "shuttle");
  const canOfferTransport = currentUser?.offeringType === "shuttle";
  const mapControlsVisible = !(isCardOpen || showSearchModal || showTicketsModal || showDriverDeskModal || showDriverUploadModal || showDriverVerificationGate || showMovingUploadModal || showMovingRequestsPanel || shuttleForRouteModal || selectedShuttleForBooking || shuttleForScheduleModal);
  const [userLocation, setUserLocation] = useState(null);
  const [tripAlert, setTripAlert] = useState(null);
  const dismissedAlertsRef = useRef({});
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (latitude && longitude) {
            setUserLocation({ lat: latitude, lng: longitude });
          }
        },
        () => {
        },
        { enableHighAccuracy: true, timeout: 8e3, maximumAge: 6e4 }
      );
    }
  }, []);
  const [shuttles, setShuttles] = useState([]);
  const [movingVehicles, setMovingVehicles] = useState([]);
  const [movingTracking, setMovingTracking] = useState(null);
  const [movingArrival, setMovingArrival] = useState(null);
  const [movingEtaMinutes, setMovingEtaMinutes] = useState(void 0);
  const [movingEtaEstimated, setMovingEtaEstimated] = useState(false);
  const movingArrivalAlertedRef = useRef("");
  const [mapClock, setMapClock] = useState(() => /* @__PURE__ */ new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setMapClock(/* @__PURE__ */ new Date()), 1e4);
    return () => window.clearInterval(timer);
  }, []);
  const availableShuttles = shuttles.filter((shuttle) => hasExplicitShuttleSchedule(shuttle) && !hasShuttleDeparturePassed(shuttle, mapClock));
  const effectiveAvailableShuttles = useMemo(() => {
    if (availableShuttles.length > 0) return availableShuttles;
    const isMokopaneQuery = /mokopane|muko\s*pane|mukopane|mkwapane|muko/i.test(`${searchTerm} ${originFilter} ${destFilter}`);
    return isMokopaneQuery ? SPOTTED_MOKOPANE_SHUTTLES : SPOTTED_GENERAL_SHUTTLES;
  }, [availableShuttles, searchTerm, originFilter, destFilter]);
  const mapMovingVehicles = movingVehicles.map((vehicle) => {
    const trackedVehicle2 = movingTracking?.request?.vehicleRef;
    if (!movingTracking?.liveCoordinates || String(trackedVehicle2?._id || trackedVehicle2) !== String(vehicle._id)) return vehicle;
    return { ...vehicle, currentCoordinates: movingTracking.liveCoordinates };
  });
  const trackedVehicle = movingTracking?.request?.vehicleRef;
  if (trackedVehicle && !mapMovingVehicles.some((vehicle) => String(vehicle._id) === String(trackedVehicle._id))) {
    mapMovingVehicles.push({ ...trackedVehicle, vehicleCategory: "moving", bookingStatus: "booked", ...movingTracking.liveCoordinates ? { currentCoordinates: movingTracking.liveCoordinates } : {} });
  }
  const mapVehicles = [...effectiveAvailableShuttles, ...mapMovingVehicles];
  const visibleMapVehicles = mapVehicles.filter((vehicle) => vehicle.vehicleCategory === "moving" ? selectedMapVehicleType === "moving" : selectedMapVehicleType === "shuttle");
  const hasActiveRouteSearch = Boolean(originFilter.trim() || destFilter.trim() || searchTerm.trim());
  const matchedShuttles = useMemo(() => {
    if (!hasActiveRouteSearch) return [];
    const parsedSearch = parseShuttleSearchQuery(searchTerm);
    const normOrigin = normalizeCityQuery(originFilter || parsedSearch.origin);
    const normDest = normalizeCityQuery(destFilter || parsedSearch.dest);
    const normSearch = normalizeCityQuery(searchTerm);
    return visibleMapVehicles.filter((vehicle) => {
      const vOrigin = normalizeCityQuery(vehicle.originCity);
      const vDest = normalizeCityQuery(vehicle.destinationCity);
      const vText = [
        vOrigin,
        vDest,
        String(vehicle.title || "").toLowerCase(),
        String(vehicle.currentCoordinates?.address || "").toLowerCase()
      ].join(" ");
      if (normOrigin && normDest) {
        return vOrigin.includes(normOrigin) && vDest.includes(normDest) || vOrigin.includes(normDest) && vDest.includes(normOrigin);
      }
      if (normOrigin) {
        return vOrigin.includes(normOrigin) || vDest.includes(normOrigin) || vText.includes(normOrigin);
      }
      if (normDest) {
        return vDest.includes(normDest) || vOrigin.includes(normDest) || vText.includes(normDest);
      }
      if (normSearch) {
        const tokens = normSearch.split(/\s+/).map((t) => normalizeCityQuery(t)).filter((t) => t && !["to", "shuttle", "ride", "taxi", "bus", "car", "from"].includes(t));
        if (tokens.length > 0) {
          return tokens.every((tok) => vText.includes(tok));
        }
        return vText.includes(normSearch);
      }
      return false;
    });
  }, [hasActiveRouteSearch, visibleMapVehicles, originFilter, destFilter, searchTerm]);
  const matchedShuttleIds = useMemo(
    () => matchedShuttles.map((shuttle) => String(shuttle._id)),
    [matchedShuttles]
  );
  useEffect(() => {
    if (!hasActiveRouteSearch) return;
    if (matchedShuttles.length === 1) {
      setHighlightedShuttle(matchedShuttles[0]);
      setIsCardOpen(true);
    }
  }, [hasActiveRouteSearch, matchedShuttles]);
  useEffect(() => {
    if (!highlightedShuttle) return;
    const stillAvailable = mapVehicles.some((vehicle) => String(vehicle._id) === String(highlightedShuttle._id));
    if (!stillAvailable) {
      setHighlightedShuttle(null);
      setIsCardOpen(false);
    }
  }, [mapVehicles, highlightedShuttle]);
  useEffect(() => {
    if (!highlightedShuttle) return;
    const isVisible = highlightedShuttle.vehicleCategory === "moving" ? selectedMapVehicleType === "moving" : selectedMapVehicleType === "shuttle";
    if (!isVisible) {
      setIsCardOpen(false);
      setHighlightedShuttle(null);
    }
  }, [highlightedShuttle, selectedMapVehicleType]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);
  const [myDriverShuttles, setMyDriverShuttles] = useState([]);
  const [driverMovingRequests, setDriverMovingRequests] = useState([]);
  const [driverGpsStatus, setDriverGpsStatus] = useState("");
  const driverMovingVehicleIds = [...new Set(driverMovingRequests.filter((request) => ["accepted", "in_progress"].includes(request.status)).map((request) => String(request.vehicleRef?._id || request.vehicleRef)).filter(Boolean))];
  const driverMovingVehicleKey = driverMovingVehicleIds.join("|");
  const driverActiveShuttleKey = myDriverShuttles.filter((shuttle) => shuttle.currentStatus === "en_route" && shuttle.vehicleCategory !== "moving").map((shuttle) => String(shuttle._id)).filter(Boolean).join("|");
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  useEffect(() => {
    if (selectedMapVehicleType !== "moving") return;
    if (!userLocation || !Number.isFinite(Number(userLocation.lat)) || !Number.isFinite(Number(userLocation.lng))) return;
    let cancelled = false;
    let endpointSupported = true;
    const loadNearbyMovingVehicles = () => {
      if (!endpointSupported) return;
      axios.get(resolveApiUrl("/api/shuttles/moving/nearby"), { params: { lat: userLocation.lat, lng: userLocation.lng, radiusKm: 300 } }).then((response) => {
        if (!cancelled) setMovingVehicles(response.data?.vehicles || []);
      }).catch((err) => {
        if (err?.response?.status === 404) {
          endpointSupported = false;
        }
        if (!cancelled) setMovingVehicles([]);
      });
    };
    loadNearbyMovingVehicles();
    const refreshInterval = window.setInterval(loadNearbyMovingVehicles, 3e4);
    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
    };
  }, [selectedMapVehicleType, userLocation?.lat, userLocation?.lng]);
  useEffect(() => {
    if (!currentUser) {
      setMovingTracking(null);
      return void 0;
    }
    let cancelled = false;
    const refreshTracking = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
        const requestsResponse = await axios.get(resolveApiUrl("/api/shuttles/moving/requests/mine?role=requester"), { headers });
        const request = (requestsResponse.data?.requests || []).find((item) => ["accepted", "in_progress"].includes(item.status));
        if (!request) {
          if (!cancelled) setMovingTracking(null);
          return;
        }
        const locationResponse = await axios.get(resolveApiUrl(`/api/shuttles/moving/requests/${request._id}/live-location`), { headers });
        if (cancelled) return;
        const liveCoordinates = locationResponse.data?.isTracking ? locationResponse.data.liveCoordinates : null;
        const pickupCoordinates = locationResponse.data?.livePickupCoordinates || locationResponse.data?.pickupCoordinates || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null);
        setMovingTracking({ request, liveCoordinates, pickupCoordinates, pickupAddress: locationResponse.data?.pickupAddress || request.pickupAddress });
      } catch {
        if (!cancelled) setMovingTracking(null);
      }
    };
    refreshTracking();
    const timer = window.setInterval(refreshTracking, 5e3);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [currentUser?._id, userLocation?.lat, userLocation?.lng]);
  useEffect(() => {
    const requestId = movingTracking?.request?._id;
    if (!requestId) return;
    setSelectedMapVehicleType("moving");
    setShowMovingRequestsPanel(false);
    setIsCardOpen(false);
  }, [movingTracking?.request?._id]);
  useEffect(() => {
    const driver = movingTracking?.liveCoordinates;
    const pickup = movingTracking?.pickupCoordinates;
    if (!driver || !pickup || !Number.isFinite(Number(driver.lat)) || !Number.isFinite(Number(driver.lng)) || !Number.isFinite(Number(pickup.lat)) || !Number.isFinite(Number(pickup.lng))) {
      setMovingEtaMinutes(void 0);
      setMovingEtaEstimated(false);
      return void 0;
    }
    const fallbackMinutes = () => {
      const distKm = movingDistanceKm(driver, pickup);
      if (distKm === null) return void 0;
      return Math.max(1, Math.ceil(distKm / 40 * 60));
    };
    const controller = new AbortController();
    setMovingEtaMinutes(null);
    setMovingEtaEstimated(false);
    fetch(`https://router.project-osrm.org/route/v1/driving/${Number(driver.lng)},${Number(driver.lat)};${Number(pickup.lng)},${Number(pickup.lat)}?overview=false`, { signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject(new Error("Route unavailable"))).then((data) => {
      const seconds = Number(data?.routes?.[0]?.duration);
      if (Number.isFinite(seconds) && seconds >= 0) {
        setMovingEtaMinutes(Math.max(1, Math.ceil(seconds / 60)));
        setMovingEtaEstimated(false);
      } else {
        setMovingEtaMinutes(fallbackMinutes());
        setMovingEtaEstimated(true);
      }
    }).catch((error2) => {
      if (error2.name !== "AbortError") {
        setMovingEtaMinutes(fallbackMinutes());
        setMovingEtaEstimated(true);
      }
    });
    return () => controller.abort();
  }, [movingTracking?.request?._id, movingTracking?.liveCoordinates?.lat, movingTracking?.liveCoordinates?.lng, movingTracking?.pickupCoordinates?.lat, movingTracking?.pickupCoordinates?.lng]);
  useEffect(() => {
    const requestId = movingTracking?.request?._id;
    const distance = movingDistanceKm(movingTracking?.liveCoordinates, movingTracking?.pickupCoordinates);
    if (!requestId || distance === null || distance > 0.15 || movingArrivalAlertedRef.current === String(requestId)) return;
    movingArrivalAlertedRef.current = String(requestId);
    setMovingArrival({ requestId, driver: movingTracking.request.vehicleRef?.driverName || "Your driver" });
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const context = new AudioCtx();
        [0, 0.28, 0.56].forEach((offset) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(1568, context.currentTime + offset);
          gain.gain.setValueAtTime(1e-3, context.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.28, context.currentTime + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(1e-3, context.currentTime + offset + 0.18);
          oscillator.start(context.currentTime + offset);
          oscillator.stop(context.currentTime + offset + 0.2);
        });
      }
      if (navigator.vibrate) navigator.vibrate([180, 90, 180, 90, 260]);
    } catch {
    }
  }, [movingTracking?.request?._id, movingTracking?.liveCoordinates?.lat, movingTracking?.liveCoordinates?.lng, movingTracking?.pickupCoordinates?.lat, movingTracking?.pickupCoordinates?.lng]);
  useEffect(() => {
    const requestId = movingTracking?.request?._id;
    if (!requestId || !navigator.geolocation) return void 0;
    let lastSentAt = 0;
    const watchId = navigator.geolocation.watchPosition(async ({ coords }) => {
      if (Date.now() - lastSentAt < 5e3 || navigator.onLine === false) return;
      if (!Number.isFinite(coords.accuracy) || coords.accuracy > 100) return;
      lastSentAt = Date.now();
      try {
        await axios.put(resolveApiUrl(`/api/shuttles/moving/requests/${requestId}/live-pickup`), {
          coordinates: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }
        }, { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
      } catch {
      }
    }, () => {
    }, { enableHighAccuracy: true, maximumAge: 3e3, timeout: 2e4 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [movingTracking?.request?._id]);
  const handleDriverVerificationApproved = useCallback(() => {
    setShowDriverVerificationGate(false);
    if (providerIntent === "moving") setShowMovingUploadModal(true);
    else setShowDriverUploadModal(true);
  }, [providerIntent]);
  useEffect(() => {
    if (searchParams.get("register") === "true" && canOfferTransport) {
      setShowDriverVerificationGate(true);
    }
    if (searchParams.get("tab") === "driver-desk" && canOfferTransport) {
      setDriverDeskTab(searchParams.get("deskTab") === "pickups" ? "pickups" : "requests");
      setShowDriverDeskModal(true);
    }
    if (searchParams.get("tab") === "my-tickets") setShowTicketsModal(true);
    if (searchParams.get("tab") === "moving-requests") setShowMovingRequestsPanel(true);
    const qParam = searchParams.get("q") || searchParams.get("searchTerm") || "";
    const parsed = parseShuttleSearchQuery(qParam);
    const oParam = searchParams.get("origin") || searchParams.get("originCity") || parsed.origin;
    const dParam = searchParams.get("destination") || searchParams.get("destinationCity") || parsed.dest;
    if (qParam || oParam || dParam) {
      if (qParam) setSearchTerm(qParam);
      if (oParam) setOriginFilter(oParam);
      if (dParam) setDestFilter(dParam);
    }
  }, [searchParams, canOfferTransport]);
  const fetchMyDriverShuttles = async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    try {
      const res = await axios.get(resolveApiUrl("/api/shuttles/my-shuttles"), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
      });
      if (res.data?.success) {
        setMyDriverShuttles(res.data.shuttles || []);
      }
    } catch (err) {
    }
  };
  useEffect(() => {
    if (!canOfferTransport) return void 0;
    fetchMyDriverShuttles();
    const refreshId = window.setInterval(fetchMyDriverShuttles, 3e4);
    return () => window.clearInterval(refreshId);
  }, [canOfferTransport]);
  useEffect(() => {
    const activeTrips = myDriverShuttles.filter((shuttle) => shuttle.currentStatus === "en_route" && shuttle.vehicleCategory !== "moving");
    if (!activeTrips.length) {
      setDriverGpsStatus("");
      return void 0;
    }
    if (!navigator.geolocation) {
      setDriverGpsStatus("Phone GPS is unavailable");
      return void 0;
    }
    setDriverGpsStatus("Waiting for phone GPS\u2026");
    let lastSentAt = 0;
    const watchId = navigator.geolocation.watchPosition(async (position) => {
      const now = Date.now();
      if (now - lastSentAt < 1e4) return;
      lastSentAt = now;
      const { latitude, longitude, accuracy } = position.coords;
      if (navigator.onLine === false) {
        setDriverGpsStatus("GPS captured; waiting for internet connection");
        return;
      }
      const results = await Promise.allSettled(activeTrips.map((shuttle) => axios.put(
        resolveApiUrl(`/api/shuttles/update-location/${shuttle._id}`),
        { lat: latitude, lng: longitude, accuracy: Math.round(accuracy || 0), isLive: true, currentStatus: "en_route" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      )));
      setDriverGpsStatus(results.some((result) => result.status === "rejected") ? "GPS found, but a location update failed" : "Sharing live GPS during this trip");
    }, (gpsError) => {
      setDriverGpsStatus(gpsError.code === 1 ? "Allow location access to share GPS" : "Phone GPS signal unavailable");
    }, { enableHighAccuracy: true, maximumAge: 5e3, timeout: 2e4 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [myDriverShuttles]);
  useEffect(() => {
    if (!canOfferTransport) {
      setDriverMovingRequests([]);
      return void 0;
    }
    let cancelled = false;
    const refreshMovingRequests = async () => {
      try {
        const response = await axios.get(resolveApiUrl("/api/shuttles/moving/requests/mine?role=driver"), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
        });
        if (!cancelled) setDriverMovingRequests(response.data?.requests || []);
      } catch {
        if (!cancelled) setDriverMovingRequests([]);
      }
    };
    refreshMovingRequests();
    const timer = window.setInterval(refreshMovingRequests, 1e4);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [canOfferTransport]);
  useEffect(() => {
    const vehicleIds = driverMovingVehicleKey.split("|").filter(Boolean);
    if (!vehicleIds.length) return void 0;
    if (!navigator.geolocation) {
      setDriverGpsStatus("This device cannot share truck GPS");
      return void 0;
    }
    let lastSentAt = 0;
    const watchId = navigator.geolocation.watchPosition(async ({ coords }) => {
      if (Date.now() - lastSentAt < 5e3 || navigator.onLine === false) return;
      if (!Number.isFinite(coords.accuracy) || coords.accuracy > 100) {
        setDriverGpsStatus("Moving GPS is too imprecise to share yet");
        return;
      }
      lastSentAt = Date.now();
      const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
      const results = await Promise.allSettled(vehicleIds.map((vehicleId) => axios.put(
        resolveApiUrl(`/api/shuttles/moving/vehicles/${vehicleId}/live-location`),
        { currentCoordinates: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, locationSource: "gps" } },
        { headers }
      )));
      setDriverGpsStatus(results.some((result) => result.status === "rejected") ? "Moving live GPS update failed" : "Sharing live truck location with the customer");
    }, (gpsError) => {
      setDriverGpsStatus(gpsError.code === 1 ? "Allow GPS access to share truck location" : "Waiting for a clear phone GPS signal");
    }, { enableHighAccuracy: true, maximumAge: 3e3, timeout: 2e4 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverMovingVehicleKey]);
  useEffect(() => {
    const nativeLocation = window.Capacitor?.Plugins?.DriverLocation;
    if (!nativeLocation) return void 0;
    const token = localStorage.getItem("token") || "";
    const active = Boolean(token && (driverActiveShuttleKey || driverMovingVehicleKey));
    if (!active) {
      nativeLocation.stop().catch(() => {
      });
      return void 0;
    }
    nativeLocation.start({
      token,
      shuttleBaseUrl: resolveApiUrl("/api/shuttles"),
      movingBaseUrl: resolveApiUrl("/api/shuttles/moving/vehicles"),
      shuttleIds: driverActiveShuttleKey,
      movingVehicleIds: driverMovingVehicleKey
    }).then(() => setDriverGpsStatus("Sharing live GPS in the background during this trip")).catch((nativeError) => {
      setDriverGpsStatus(nativeError?.message || "Allow location access to share GPS in the background");
    });
    return () => {
      nativeLocation.stop().catch(() => {
      });
    };
  }, [driverActiveShuttleKey, driverMovingVehicleKey]);
  useEffect(() => {
    if (showDriverDeskModal) {
      fetchMyDriverShuttles();
    }
  }, [showDriverDeskModal]);
  const fetchShuttles = async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("No internet connection. Connect to load current shuttle listings.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (serviceType !== "all") params.serviceType = serviceType;
      if (originFilter.trim()) params.originCity = originFilter.trim();
      if (destFilter.trim()) params.destinationCity = destFilter.trim();
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
      const res = await axios.get(resolveApiUrl("/api/shuttles/get"), { params });
      if (!res.data?.success) throw new Error(res.data?.message || "Could not load shuttle listings.");
      const list = res.data.shuttles || [];
      setShuttles(list);
      const paramId = searchParams.get("shuttleId");
      if (paramId) {
        const match = list.find((s) => String(s._id) === String(paramId));
        setHighlightedShuttle(match || null);
        setIsCardOpen(Boolean(match));
      } else {
        setHighlightedShuttle((prev) => list.find((s) => String(s._id) === String(prev?._id)) || list[0] || null);
        if (!list.length) setIsCardOpen(false);
      }
    } catch (err) {
      console.error("Error fetching shuttles:", err);
      const offline = navigator.onLine === false || err?.code === "ERR_NETWORK";
      setError(offline ? "No internet connection. Showing any shuttle listings already loaded." : "Shuttle service is temporarily unavailable. Showing any listings already loaded.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchShuttles();
  }, [serviceType, isOnline]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchModal(false);
    fetchShuttles();
  };
  const handleSwapRoute = () => {
    const temp = originFilter;
    setOriginFilter(destFilter);
    setDestFilter(temp);
  };
  const handleSelectCorridor = (corridor) => {
    setServiceType(corridor.serviceType);
    setOriginFilter(corridor.origin);
    setDestFilter(corridor.dest);
    setSearchTerm("");
    setShowSearchModal(false);
    setTimeout(() => {
      fetchShuttles();
    }, 50);
  };
  const handleLiveRefresh = useCallback((freshShuttles) => {
    setShuttles(freshShuttles);
    setHighlightedShuttle((prev) => {
      if (!prev) return prev;
      const updated = freshShuttles.find((s) => String(s._id) === String(prev._id));
      return updated || prev;
    });
  }, []);
  const handleSelectShuttle = (shuttle) => {
    if (!shuttle) {
      setIsCardOpen(false);
      return;
    }
    if (isCardOpen && highlightedShuttle && String(highlightedShuttle._id) === String(shuttle._id)) {
      setIsCardOpen(false);
    } else {
      setHighlightedShuttle(shuttle);
      setIsCardOpen(true);
    }
  };
  const playTripAlertChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      if (navigator.vibrate) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch (e) {
    }
  }, []);
  const handleProximityAlert = useCallback((alertData) => {
    const { shuttle, distanceKm } = alertData;
    if (!shuttle?._id) return;
    const dismissedAt = dismissedAlertsRef.current[shuttle._id];
    if (dismissedAt && Date.now() - dismissedAt < 1e3 * 60 * 10) {
      return;
    }
    setTripAlert((prev) => {
      if (!prev || String(prev.shuttle?._id) !== String(shuttle._id)) {
        playTripAlertChime();
      }
      return { shuttle, distanceKm };
    });
  }, [playTripAlertChime]);
  const handleDismissAlert = (shuttleId) => {
    setTripAlert(null);
    if (shuttleId) {
      dismissedAlertsRef.current[shuttleId] = Date.now();
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col relative" }, /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-3 sm:px-6 py-2.5 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto flex w-full max-w-7xl min-w-0 items-center" }, /* @__PURE__ */ React.createElement("div", { role: "toolbar", "aria-label": "Shuttle navigation and actions. Swipe left or right to see all options", className: "flex w-full min-w-0 snap-x snap-mandatory items-center gap-2 overflow-x-auto overscroll-x-contain scroll-smooth whitespace-nowrap scrollbar-hide touch-pan-x" }, /* @__PURE__ */ React.createElement(
    Link,
    {
      to: "/",
      "aria-label": "Home",
      className: "flex h-12 w-12 shrink-0 snap-start items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-2 text-xs font-bold text-gray-800 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:h-auto sm:w-auto sm:rounded-full sm:px-3 sm:py-1.5",
      title: "Home"
    },
    /* @__PURE__ */ React.createElement(Home, { className: "h-6 w-6 shrink-0" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Home")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowSearchModal(true),
      className: "flex h-12 w-12 shrink-0 snap-start items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-2 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60 sm:h-auto sm:w-auto sm:rounded-full sm:px-3 sm:py-1.5",
      title: "Search Shuttle Route"
    },
    /* @__PURE__ */ React.createElement(Search, { className: "h-6 w-6 shrink-0" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Search Route")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowTicketsModal(true),
      className: "flex h-12 w-12 shrink-0 snap-start items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:h-auto sm:w-auto sm:rounded-full sm:px-3 sm:py-1.5",
      title: "My Boarding Passes"
    },
    /* @__PURE__ */ React.createElement(Ticket, { className: "h-6 w-6 shrink-0 text-teal-600" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline" }, "My Passes")
  ), canOfferTransport && (myDriverShuttles.some((shuttle) => shuttle.currentStatus === "en_route" && shuttle.vehicleCategory !== "moving") || driverMovingRequests.some((request) => ["accepted", "in_progress"].includes(request.status))) && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-200", title: "Location updates require this page to stay open and phone location permission" }, /* @__PURE__ */ React.createElement(MapPin, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline" }, driverGpsStatus || "Starting GPS\u2026")), canOfferTransport && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowDriverDeskModal(true),
      className: "flex h-12 w-12 shrink-0 snap-start items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:h-auto sm:w-auto sm:rounded-full sm:px-3 sm:py-1.5",
      title: "Open Driver Workspace"
    },
    /* @__PURE__ */ React.createElement(ShieldCheck, { className: "h-6 w-6 shrink-0 text-amber-500" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline" }, "Driver workspace")
  ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    setMovingRequestsRole("requester");
    setShowMovingRequestsPanel(true);
  }, className: "flex h-12 w-12 shrink-0 snap-start items-center justify-center gap-1.5 rounded-xl bg-teal-50 px-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-200 sm:h-auto sm:w-auto sm:rounded-full sm:px-2.5 sm:py-1.5", title: "My moving requests" }, /* @__PURE__ */ React.createElement(Truck, { className: "h-6 w-6 shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline" }, "My moving requests"))))), /* @__PURE__ */ React.createElement("main", { className: "flex-1 w-full h-full relative overflow-hidden flex flex-col" }, mapControlsVisible && /* @__PURE__ */ React.createElement("div", { "aria-label": "Filter map vehicles", className: "absolute bottom-[5.25rem] left-1/2 z-[1100] flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-gray-200 bg-white/95 p-0.5 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95" }, /* @__PURE__ */ React.createElement("span", { className: "hidden px-1.5 text-[9px] font-semibold text-gray-500 sm:inline" }, "Show"), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": selectedMapVehicleType === "shuttle", onClick: () => setSelectedMapVehicleType("shuttle"), className: `rounded-lg px-2 py-1 text-[10px] font-bold transition ${selectedMapVehicleType === "shuttle" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}` }, /* @__PURE__ */ React.createElement(Bus, { className: "mr-1 inline h-3 w-3" }), "Shuttle"), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": selectedMapVehicleType === "moving", onClick: () => setSelectedMapVehicleType("moving"), className: `rounded-lg px-2 py-1 text-[10px] font-bold transition ${selectedMapVehicleType === "moving" ? "bg-amber-500 text-gray-950" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}` }, /* @__PURE__ */ React.createElement(Truck, { className: "mr-1 inline h-3 w-3" }), "Moving delivery")), (loading || error || !visibleMapVehicles.length && !loading) && /* @__PURE__ */ React.createElement("div", { className: "pointer-events-none absolute left-3 right-20 top-3 z-20 flex justify-center sm:left-3 sm:right-20 sm:top-16" }, /* @__PURE__ */ React.createElement("div", { role: error ? "alert" : "status", className: "pointer-events-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-center shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95" }, loading ? /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Loading available transport\u2026") : error ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-rose-700 dark:text-rose-300" }, error), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: fetchShuttles, className: "mt-2 text-xs font-bold text-teal-700 underline dark:text-teal-300" }, "Try again")) : selectedMapVehicleType === "moving" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-slate-800 dark:text-slate-200" }, "No approved moving vehicles within 300 km."), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400" }, "Allow location access and make sure your phone GPS is on, or check again later.")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-slate-800 dark:text-slate-200" }, "No upcoming shuttle departures are available."), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400" }, "Only routes with a departure date and time appear here."), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowSearchModal(true), className: "rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800" }, "Search routes"), canOfferTransport && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    setProviderIntent("shuttle");
    setShowDriverVerificationGate(true);
  }, className: "rounded-full bg-amber-400 px-3 py-2 text-xs font-bold text-gray-950 transition hover:bg-amber-300" }, "Add a shuttle route"))))), tripAlert && /* @__PURE__ */ React.createElement("div", { className: "fixed top-14 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xl z-50 animate-slide-up-fade" }, /* @__PURE__ */ React.createElement("div", { className: "relative bg-gradient-to-r from-gray-950 via-teal-950 to-gray-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-teal-400 flex items-center justify-between gap-3 backdrop-blur-md" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleDismissAlert(tripAlert.shuttle?._id),
      className: "absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-950 shadow-lg ring-2 ring-teal-300 transition hover:bg-teal-50 active:scale-95",
      "aria-label": "Close 2 kilometer shuttle alert",
      title: "Close alert"
    },
    /* @__PURE__ */ React.createElement(X, { className: "h-5 w-5" })
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400 text-teal-300 flex items-center justify-center shrink-0 relative" }, /* @__PURE__ */ React.createElement("span", { className: "w-3.5 h-3.5 rounded-full bg-teal-400 animate-ping absolute -top-1 -right-1" }), /* @__PURE__ */ React.createElement(Navigation, { className: "w-6 h-6 animate-pulse" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-400 text-gray-950" }, "\u{1F6A8} 2 KM TRIP ALERT"), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-amber-300 animate-pulse" }, "~", tripAlert.distanceKm.toFixed(1), " km away (", Math.max(1, Math.ceil(tripAlert.distanceKm * 2)), " mins)")), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-extrabold truncate text-white mt-1" }, tripAlert.shuttle?.plateNumber, " \u2022 ", tripAlert.shuttle?.driverName), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-300 truncate" }, "Shuttle is approaching your pickup point. Please get ready to board!"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 shrink-0" }, tripAlert.shuttle?.driverPhone && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `tel:${tripAlert.shuttle.driverPhone}`,
      className: "px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow active:scale-95"
    },
    /* @__PURE__ */ React.createElement(Phone, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Call")
  )))), movingTracking?.request && movingTracking?.liveCoordinates && !movingArrival && /* @__PURE__ */ React.createElement("div", { className: "fixed left-3 right-3 top-20 z-[1200] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-white/95 px-4 py-3 text-slate-900 shadow-xl backdrop-blur dark:border-blue-900 dark:bg-gray-900/95 dark:text-white" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "font-extrabold" }, "Driver live location"), /* @__PURE__ */ React.createElement("p", { className: "truncate text-xs text-slate-600 dark:text-slate-300" }, movingEtaMinutes === null ? "Calculating the road route\u2026" : Number.isFinite(movingEtaMinutes) ? `Driver is on the way \xB7 ${movingEtaEstimated ? "~" : "about "}${movingEtaMinutes} min${movingEtaEstimated ? " (est.)" : ""}` : "Location is live.")), /* @__PURE__ */ React.createElement("span", { className: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white" }, /* @__PURE__ */ React.createElement(Navigation, { className: "h-4 w-4" }))), movingArrival && /* @__PURE__ */ React.createElement("div", { className: "fixed left-3 right-3 top-20 z-[1300] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-emerald-700 px-4 py-3 text-white shadow-2xl" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-extrabold" }, "Your driver has arrived"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-emerald-100" }, movingArrival.driver, " is at your pickup point.")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setMovingArrival(null), "aria-label": "Close arrival notification", className: "rounded-full p-1 hover:bg-white/15" }, /* @__PURE__ */ React.createElement(X, { className: "h-5 w-5" }))), /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex-1" }, /* @__PURE__ */ React.createElement(
    ShuttleMap,
    {
      shuttles: visibleMapVehicles,
      matchedShuttleIds,
      selectedShuttle: isCardOpen ? highlightedShuttle : null,
      onSelectShuttle: handleSelectShuttle,
      onRequestPickup: (shuttle) => {
        setHighlightedShuttle(shuttle);
        setIsCardOpen(true);
        if (!shuttle?.vehicleCategory) setSelectedShuttleForBooking(shuttle);
      },
      onLiveRefresh: handleLiveRefresh,
      userLocation,
      movingTracking,
      onUserLocationChange: (loc) => setUserLocation(loc),
      onProximityAlert: handleProximityAlert,
      controlsVisible: mapControlsVisible,
      heightClass: "h-full"
    }
  )), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `fixed bottom-0 left-0 right-0 z-30 w-full transition-all duration-300 ease-out ${isCardOpen && highlightedShuttle ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-full" }, highlightedShuttle?.vehicleCategory === "moving" ? /* @__PURE__ */ React.createElement(
      MovingVehicleCard,
      {
        key: highlightedShuttle._id,
        vehicle: highlightedShuttle,
        currentUser,
        onRequest: (vehicle) => setSelectedShuttleForBooking(vehicle),
        onClose: () => setIsCardOpen(false)
      }
    ) : highlightedShuttle && /* @__PURE__ */ React.createElement(
      UberDriverCard,
      {
        key: highlightedShuttle._id,
        shuttle: highlightedShuttle,
        allShuttles: matchedShuttles.length > 0 ? matchedShuttles : visibleMapVehicles,
        onSelectShuttle: handleSelectShuttle,
        onRequestPickup: (s) => setSelectedShuttleForBooking(s),
        currentUser,
        userLocation,
        onUpdateSchedule: (shuttle) => {
          setShuttleForScheduleModal(shuttle);
          setIsCardOpen(false);
        },
        onTripFinished: () => {
          fetchShuttles();
          fetchMyDriverShuttles();
        },
        onClose: () => setIsCardOpen(false)
      }
    ))
  ), visibleMapVehicles.length > 0 && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `fixed bottom-3 left-0 right-0 z-20 flex justify-center pointer-events-none transition-all duration-300 ease-out ${!isCardOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "pointer-events-auto" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          if (highlightedShuttle) {
            setIsCardOpen(true);
          } else if (matchedShuttles.length > 0) {
            setHighlightedShuttle(matchedShuttles[0]);
            setIsCardOpen(true);
          } else if (visibleMapVehicles.length > 0) {
            setHighlightedShuttle(visibleMapVehicles[0]);
            setIsCardOpen(true);
          }
        },
        className: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-center shadow-xl flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 hover:scale-105 active:scale-95 transition"
      },
      /* @__PURE__ */ React.createElement(Bus, { className: "w-4 h-4 text-teal-600 animate-pulse" }),
      /* @__PURE__ */ React.createElement("span", null, "Tap a shuttle, truck, or minivan on the map")
    ))
  )), showSearchModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col",
      onClick: (e) => e.stopPropagation()
    },
    /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 text-teal-600" }), /* @__PURE__ */ React.createElement("span", null, "Search Shuttle Routes")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowSearchModal(false),
        className: "p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
      },
      /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
    )),
    /* @__PURE__ */ React.createElement("form", { onSubmit: handleSearchSubmit, className: "p-5 space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1" }, "From (Origin City)"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-4 h-4 text-teal-600 absolute left-3 top-3" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "e.g. Johannesburg, Pretoria...",
        value: originFilter,
        onChange: (e) => setOriginFilter(e.target.value),
        className: "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
      }
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300" }, "To (Destination City)"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: handleSwapRoute,
        className: "text-xs text-teal-600 hover:underline flex items-center gap-1"
      },
      /* @__PURE__ */ React.createElement(ArrowRightLeft, { className: "w-3 h-3" }),
      /* @__PURE__ */ React.createElement("span", null, "Swap")
    )), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-4 h-4 text-amber-500 absolute left-3 top-3" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "e.g. Polokwane, Durban, Mbombela...",
        value: destFilter,
        onChange: (e) => setDestFilter(e.target.value),
        className: "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
      }
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1" }, "Transit Scope"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: serviceType,
        onChange: (e) => setServiceType(e.target.value),
        className: "w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Transit Types"),
      /* @__PURE__ */ React.createElement("option", { value: "interprovincial" }, "\u{1F6E3}\uFE0F Inter-Provincial"),
      /* @__PURE__ */ React.createElement("option", { value: "local" }, "\u{1F4CD} Local Express / Town")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" }, "Popular Corridors:"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5" }, POPULAR_CORRIDORS.map((c) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: c.label,
        type: "button",
        onClick: () => handleSelectCorridor(c),
        className: "px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition"
      },
      c.label
    )))), /* @__PURE__ */ React.createElement("div", { className: "pt-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition"
      },
      "Filter Map Vehicles"
    )))
  )), showTicketsModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]",
      onClick: (e) => e.stopPropagation()
    },
    /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100" }, /* @__PURE__ */ React.createElement(Ticket, { className: "w-4 h-4 text-teal-600" }), /* @__PURE__ */ React.createElement("span", null, "My Shuttle Boarding Passes")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowTicketsModal(false),
        className: "p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
      },
      /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
    )),
    /* @__PURE__ */ React.createElement("div", { className: "p-5 overflow-y-auto" }, /* @__PURE__ */ React.createElement(ShuttleBookingsList, { role: "passenger", currentUser }))
  )), showDriverDeskModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]",
      onClick: (e) => e.stopPropagation()
    },
    /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100" }, /* @__PURE__ */ React.createElement(ShieldCheck, { className: "w-4 h-4 text-amber-500" }), /* @__PURE__ */ React.createElement("span", null, "Driver Workspace")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowDriverDeskModal(false),
        className: "p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
      },
      /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
    )),
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 border-b border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-4" }, /* @__PURE__ */ React.createElement(Link, { to: "/shuttles/vehicles", className: "rounded-xl bg-teal-50 px-3 py-3 text-center text-xs font-bold text-teal-800 transition hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-200" }, "My vehicles & routes"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setShowDriverDeskModal(false);
      setProviderIntent("shuttle");
      setShowDriverVerificationGate(true);
    }, className: "rounded-xl bg-amber-400 px-3 py-3 text-xs font-bold text-gray-950 transition hover:bg-amber-300" }, "Add shuttle"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setShowDriverDeskModal(false);
      setProviderIntent("moving");
      setShowDriverVerificationGate(true);
    }, className: "rounded-xl bg-teal-700 px-3 py-3 text-xs font-bold text-white transition hover:bg-teal-800" }, "Add truck"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setShowDriverDeskModal(false);
      setMovingRequestsRole("driver");
      setShowMovingRequestsPanel(true);
    }, className: "rounded-xl bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" }, "Moving jobs")),
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 border-b border-gray-100 p-3 dark:border-gray-800" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setDriverDeskTab("requests"), "aria-pressed": driverDeskTab === "requests", className: `rounded-xl px-3 py-2.5 text-xs font-bold transition ${driverDeskTab === "requests" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}` }, "Requests"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setDriverDeskTab("pickups"), "aria-pressed": driverDeskTab === "pickups", className: `rounded-xl px-3 py-2.5 text-xs font-bold transition ${driverDeskTab === "pickups" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}` }, "Pickups")),
    /* @__PURE__ */ React.createElement("div", { className: "p-5 overflow-y-auto space-y-5" }, driverDeskTab === "requests" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(ShuttleBookingsList, { role: "driver", currentUser, focusBookingId: searchParams.get("bookingId") })) : /* @__PURE__ */ React.createElement(DriverPickupList, null))
  )), selectedShuttleForBooking && (selectedShuttleForBooking.vehicleCategory === "moving" ? /* @__PURE__ */ React.createElement(
    MovingRequestSheet,
    {
      vehicle: selectedShuttleForBooking,
      currentUser,
      userLocation,
      onClose: () => setSelectedShuttleForBooking(null),
      onSuccess: () => {
        setMovingRequestsRole("requester");
        setShowMovingRequestsPanel(true);
      }
    }
  ) : /* @__PURE__ */ React.createElement(
    PickupRequestSheet,
    {
      shuttle: selectedShuttleForBooking,
      isOpen: !!selectedShuttleForBooking,
      onClose: () => setSelectedShuttleForBooking(null),
      currentUser,
      onSuccess: () => {
        fetchShuttles();
      }
    }
  )), showMovingRequestsPanel && /* @__PURE__ */ React.createElement(
    MovingRequestsPanel,
    {
      initialRole: movingRequestsRole,
      allowDriverWorkspace: canOfferTransport && movingRequestsRole === "driver",
      onClose: () => {
        setShowMovingRequestsPanel(false);
        if (userLocation) {
          axios.get(resolveApiUrl("/api/shuttles/moving/nearby"), { params: { lat: userLocation.lat, lng: userLocation.lng, radiusKm: 300 } }).then((response) => setMovingVehicles(response.data?.vehicles || [])).catch(() => setMovingVehicles([]));
        }
      },
      onUpdated: () => {
        if (userLocation) {
          axios.get(resolveApiUrl("/api/shuttles/moving/nearby"), { params: { lat: userLocation.lat, lng: userLocation.lng, radiusKm: 300 } }).then((response) => setMovingVehicles(response.data?.vehicles || [])).catch(() => setMovingVehicles([]));
        }
      }
    }
  ), showMovingUploadModal && /* @__PURE__ */ React.createElement(MovingVehicleUploadModal, { currentUser, onClose: () => setShowMovingUploadModal(false), onSuccess: () => {
    setMovingRequestsRole("driver");
    setShowMovingRequestsPanel(true);
    if (!userLocation) return;
    axios.get(resolveApiUrl("/api/shuttles/moving/nearby"), { params: { lat: userLocation.lat, lng: userLocation.lng, radiusKm: 300 } }).then((response) => setMovingVehicles(response.data?.vehicles || [])).catch(() => setMovingVehicles([]));
  } }), shuttleForScheduleModal && /* @__PURE__ */ React.createElement(
    DriverScheduleModal,
    {
      shuttle: shuttleForScheduleModal,
      isOpen: !!shuttleForScheduleModal,
      onClose: () => setShuttleForScheduleModal(null),
      onUpdated: () => {
        fetchShuttles();
        fetchMyDriverShuttles();
      }
    }
  ), shuttleForRouteModal && /* @__PURE__ */ React.createElement(
    DriverAddRouteModal,
    {
      key: `${shuttleForRouteModal._id}-route`,
      shuttle: shuttleForRouteModal,
      onClose: () => setShuttleForRouteModal(null),
      onSuccess: (newRoute) => {
        setShuttleForRouteModal(null);
        setMyDriverShuttles((current) => [newRoute, ...current]);
        fetchShuttles();
        fetchMyDriverShuttles();
      }
    }
  ), /* @__PURE__ */ React.createElement(
    DriverVerificationGate,
    {
      isOpen: showDriverVerificationGate,
      onClose: () => setShowDriverVerificationGate(false),
      onApproved: handleDriverVerificationApproved
    }
  ), showDriverUploadModal && /* @__PURE__ */ React.createElement(
    DriverShuttleUploadModal,
    {
      isOpen: showDriverUploadModal,
      onClose: () => setShowDriverUploadModal(false),
      currentUser,
      onSuccess: () => {
        alert("\u{1F690} Shuttle route published successfully! It is now live on the map.");
        setShowDriverUploadModal(false);
        fetchShuttles();
      }
    }
  ));
};
export default ShuttlePage;
