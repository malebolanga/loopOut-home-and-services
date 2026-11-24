import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Bus, 
  Maximize2, 
  Minimize2, 
  Compass,
  Layers,
  Radio,
  Map as MapIcon,
  Satellite,
  RotateCcw,
  RefreshCw,
  Locate,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';

const SA_CENTER = { lat: -26.2041, lng: 28.0473 }; // Johannesburg / central transport hub

const MAP_PROVIDERS = {
  googleRoad: {
    id: 'googleRoad',
    name: 'Road Map',
    shortName: 'Road',
    description: 'Street navigation & roads',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  googleSatellite: {
    id: 'googleSatellite',
    name: 'Satellite',
    shortName: 'Satellite',
    description: 'High-res satellite & terrain',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Google Hybrid: Satellite with road names & labels
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  voyager: {
    id: 'voyager',
    name: 'Clean View',
    shortName: 'Clean',
    description: 'Clean cartographic map',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
  },
};

const isValidCoord = (lat, lng) => {
  if (lat === null || lat === undefined || lat === '' || lng === null || lng === undefined || lng === '') return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    Number.isFinite(numLat) &&
    Number.isFinite(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
};

// City-centre route-start estimates are display-only. They are never treated as live GPS.
const SA_ROUTE_ORIGINS = [
  { names: ['johannesburg', 'joburg', 'jhb', 'sandton', 'soweto'], lat: -26.2041, lng: 28.0473 },
  { names: ['pretoria', 'tshwane', 'centurion'], lat: -25.7479, lng: 28.2293 },
  { names: ['polokwane', 'pietersburg'], lat: -23.9045, lng: 29.4689 },
  { names: ['mokopane', 'potgietersrus'], lat: -24.1944, lng: 29.0097 },
  { names: ['mbombela', 'nelspruit'], lat: -25.4753, lng: 30.9694 },
  { names: ['durban', 'ethekwini'], lat: -29.8587, lng: 31.0218 },
  { names: ['cape town'], lat: -33.9249, lng: 18.4241 },
  { names: ['gqeberha', 'port elizabeth'], lat: -33.9608, lng: 25.6022 },
  { names: ['bloemfontein'], lat: -29.0852, lng: 26.1596 },
  { names: ['kimberley'], lat: -28.7282, lng: 24.7499 },
  { names: ['rustenburg'], lat: -25.6676, lng: 27.2421 },
  { names: ['east london'], lat: -33.0153, lng: 27.9116 },
  { names: ['george'], lat: -33.963, lng: 22.461 },
  { names: ['pietermaritzburg'], lat: -29.6006, lng: 30.3794 },
  { names: ['witbank', 'emalahleni'], lat: -25.8713, lng: 29.2332 },
  { names: ['vereeniging'], lat: -26.6736, lng: 27.9261 },
];

const isFreshLiveLocation = (coords) => {
  const updatedAt = coords?.updatedAt ? new Date(coords.updatedAt).getTime() : 0;
  const ageMs = Date.now() - updatedAt;
  return coords?.isLive === true && Number.isFinite(updatedAt) && updatedAt > 0 && ageMs >= 0 && ageMs <= 60_000;
};

const getShuttleMapCoordinates = (shuttle) => {
  const coords = shuttle?.currentCoordinates;
  if (isValidCoord(coords?.lat, coords?.lng)) {
    return {
      lat: Number(coords.lat),
      lng: Number(coords.lng),
      source: isFreshLiveLocation(coords) ? 'live' : 'saved',
    };
  }

  const originPin = shuttle?.originCoordinates;
  if (isValidCoord(originPin?.lat, originPin?.lng)) {
    return { lat: Number(originPin.lat), lng: Number(originPin.lng), source: 'route-origin' };
  }

  const origin = ` ${(shuttle?.originCity || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  const city = SA_ROUTE_ORIGINS.find((entry) => entry.names.some((name) => origin.includes(` ${name} `)));
  return city ? { lat: city.lat, lng: city.lng, source: 'route-origin' } : null;
};

// Haversine geodesic distance in kilometres
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ShuttleMap = ({ 
  shuttles = [], 
  selectedShuttle, 
  onSelectShuttle, 
  onRequestPickup,
  onLiveRefresh,
  userLocation,
  onUserLocationChange,
  onProximityAlert,
  controlsVisible = true,
  heightClass = 'h-[75vh] sm:h-[82vh] lg:h-[86vh]' 
}) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const userGprsMarkerRef = useRef(null);
  const markersRef = useRef([]);
  const livePollingRef = useRef(null);

  // 2km Proximity & live motion tracking refs
  const proximityCircleRef = useRef(null);
  const routeLineRef = useRef(null);
  const routeLabelRef = useRef(null);
  const shuttleTrailsRef = useRef({});
  const trailLayersRef = useRef({});

  // Stable callback refs — updated every render but never in dep arrays.
  // This prevents infinite loops caused by callback identity changes.
  const onSelectShuttleRef = useRef(onSelectShuttle);
  useEffect(() => { onSelectShuttleRef.current = onSelectShuttle; });

  const onProximityAlertRef = useRef(onProximityAlert);
  useEffect(() => { onProximityAlertRef.current = onProximityAlert; });

  // Track which shuttle already fired a proximity alert (reset when it leaves 2km range)
  const proximityAlertSentRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(7);
  const mapZoomRef = useRef(7);
  const lastAutoFitVehicleKeyRef = useRef('');
  const [utilityControlsExpanded, setUtilityControlsExpanded] = useState(true);
  const [proximityChipVisible, setProximityChipVisible] = useState(true);
  const [mapStyle, setMapStyle] = useState('googleRoad');
  const [isLiveRadarMode, setIsLiveRadarMode] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [gprsStatus, setGprsStatus] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [liveActiveCount, setLiveActiveCount] = useState(0);

  // Initialize Leaflet map with Google Streets
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mounted || !mapContainerRef.current || leafletMapRef.current) return;

      const L = window.L || (await import('leaflet')).default;
      if (!L) return;

      const initialCoords = getShuttleMapCoordinates(selectedShuttle);
      const initialLat = initialCoords?.lat ?? SA_CENTER.lat;
      const initialLng = initialCoords?.lng ?? SA_CENTER.lng;

      try {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          minZoom: 2,
          attributionControl: false,
          scrollWheelZoom: true,
        }).setView([initialLat, initialLng], 7);

        // Default: Google Streets Tile Layer
        const provider = MAP_PROVIDERS.googleRoad;
        const tileLayer = L.tileLayer(provider.url, {
          maxZoom: provider.maxZoom,
          subdomains: provider.subdomains,
        }).addTo(map);

        activeTileLayerRef.current = tileLayer;
        leafletMapRef.current = map;
        map.on('zoomend', () => {
          mapZoomRef.current = map.getZoom();
          setMapZoom(map.getZoom());
        });

        // Clicking empty map space deselects current vehicle (returns to overview nicely)
        map.on('click', () => {
          if (onSelectShuttleRef.current) {
            onSelectShuttleRef.current(null);
          }
        });

        if (mounted) {
          setMapReady(true);
          setTimeout(() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.invalidateSize();
            }
          }, 150);
          setTimeout(() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.invalidateSize();
            }
          }, 500);
        }

        const handleResize = () => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        };
        window.addEventListener('resize', handleResize);
      } catch (err) {
        console.error('Shuttle map init error:', err);
      }
    };

    initMap();

    return () => {
      mounted = false;
      window.removeEventListener('resize', () => {});
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
      }
    };
  }, []);

  // ── Live GPS Polling: re-fetch shuttle positions every 10s (or 5s in Live Radar) ──
  useEffect(() => {
    if (!onLiveRefresh) return;

    const poll = async () => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      try {
        const res = await axios.get(resolveApiUrl('/api/shuttles/get?limit=50'));
        if (res.data?.shuttles) {
          const liveCount = res.data.shuttles.filter(
            (s) => isFreshLiveLocation(s.currentCoordinates)
          ).length;
          setLiveActiveCount(liveCount);
          onLiveRefresh(res.data.shuttles);
        }
      } catch (e) {
        // Silent fail — wait for next poll
      }
    };

    const intervalTime = isLiveRadarMode ? 5000 : 10000;
    const delay = setTimeout(() => {
      poll();
      livePollingRef.current = setInterval(poll, intervalTime);
    }, 1500);

    return () => {
      clearTimeout(delay);
      if (livePollingRef.current) clearInterval(livePollingRef.current);
    };
  }, [onLiveRefresh, isLiveRadarMode]);

  // Switch map between Road Map, Satellite, and Clean View
  const switchMapStyle = (styleId) => {
    if (!leafletMapRef.current) return;
    const L = window.L || window.leaflet;
    if (!L) return;

    const provider = MAP_PROVIDERS[styleId] || MAP_PROVIDERS.googleRoad;
    if (activeTileLayerRef.current) {
      leafletMapRef.current.removeLayer(activeTileLayerRef.current);
    }

    const newLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains,
    }).addTo(leafletMapRef.current);

    activeTileLayerRef.current = newLayer;
    setMapStyle(styleId);

    setGprsStatus(`Switched to ${provider.name}`);
    setTimeout(() => setGprsStatus(null), 2500);
  };

  // Toggle Live Radar tracking mode
  const handleToggleLiveRadar = () => {
    const nextMode = !isLiveRadarMode;
    setIsLiveRadarMode(nextMode);

    if (nextMode) {
      setGprsStatus('📡 Live Map Active • Live GPS vehicle tracking');
      handleManualLiveSync();

      // Pan/fit to live moving vehicles if any
      if (leafletMapRef.current && shuttles.length > 0) {
        const liveShuttles = shuttles.filter((s) => s.currentCoordinates?.isLive);
        const liveBounds = liveShuttles
          .map((s) => {
            const coords = getShuttleMapCoordinates(s);
            return coords ? [coords.lat, coords.lng] : null;
          })
          .filter(Boolean)
          .filter(([lat, lng]) => isValidCoord(lat, lng));

        if (liveBounds.length > 0) {
          leafletMapRef.current.fitBounds(liveBounds, { padding: [70, 70], maxZoom: 14, duration: 1 });
        }
      }
    } else {
      setGprsStatus('Standard map view restored');
    }
    setTimeout(() => setGprsStatus(null), 3000);
  };

  // Manual trigger to sync live positions immediately
  const handleManualLiveSync = async () => {
    if (isLiveSyncing) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setGprsStatus('No internet connection; live positions cannot refresh');
      setTimeout(() => setGprsStatus(null), 3000);
      return;
    }
    setIsLiveSyncing(true);
    try {
      const res = await axios.get(resolveApiUrl('/api/shuttles/get?limit=50'));
      if (res.data?.shuttles && onLiveRefresh) {
        const liveCount = res.data.shuttles.filter(
          (s) => s.currentCoordinates?.isLive
        ).length;
        setLiveActiveCount(liveCount);
        onLiveRefresh(res.data.shuttles);
        setGprsStatus(`✓ Updated (${res.data.shuttles.length} shuttles, ${liveCount} live)`);
      }
    } catch (e) {
      setGprsStatus('Sync failed — check network');
    } finally {
      setTimeout(() => setIsLiveSyncing(false), 600);
      setTimeout(() => setGprsStatus(null), 3000);
    }
  };

  // Sync shuttle markers whenever shuttles or selectedShuttle changes
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return;

    const L = window.L || window.leaflet;
    if (!L) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = [];

    // Group vehicles that would overlap at the current zoom, not just vehicles
    // whose coordinates happen to be identical.
    const markerGroups = [];
    shuttles.forEach((s) => {
      const c = getShuttleMapCoordinates(s);
      if (!c) return;
      const point = leafletMapRef.current.project([c.lat, c.lng], mapZoomRef.current);
      let group = markerGroups.find((candidate) => Math.hypot(candidate.center.x - point.x, candidate.center.y - point.y) < 64);
      if (!group) {
        group = { items: [], center: { x: point.x, y: point.y } };
        markerGroups.push(group);
      }
      group.items.push(s);
      group.center.x = group.items.reduce((sum, item) => {
        const itemCoords = getShuttleMapCoordinates(item);
        return sum + leafletMapRef.current.project([itemCoords.lat, itemCoords.lng], mapZoomRef.current).x;
      }, 0) / group.items.length;
      group.center.y = group.items.reduce((sum, item) => {
        const itemCoords = getShuttleMapCoordinates(item);
        return sum + leafletMapRef.current.project([itemCoords.lat, itemCoords.lng], mapZoomRef.current).y;
      }, 0) / group.items.length;
    });

    shuttles.forEach((shuttle) => {
      const coords = getShuttleMapCoordinates(shuttle);
      if (!coords) return;

      const cluster = markerGroups.find((group) => group.items.some((item) => String(item._id) === String(shuttle._id)))?.items || [shuttle];
      const clusterSize = cluster.length;
      const clusterIndex = cluster.findIndex((item) => String(item._id) === String(shuttle._id));

      // Calculate spread position if multiple cars share the location so none are blocked
      let markerLat = coords.lat;
      let markerLng = coords.lng;

      if (clusterSize > 1) {
        // Spread overlapping vehicle pins into a compact ring.
        const angle = (clusterIndex / clusterSize) * 2 * Math.PI - Math.PI / 2;
        const minMarkerGapPx = 128;
        const radiusPx = Math.max(64, minMarkerGapPx / (2 * Math.sin(Math.PI / clusterSize)));
        const projected = leafletMapRef.current.project([coords.lat, coords.lng], mapZoomRef.current);
        projected.x += Math.cos(angle) * radiusPx;
        projected.y += Math.sin(angle) * radiusPx;
        const spreadCoords = leafletMapRef.current.unproject(projected, mapZoomRef.current);
        markerLat = spreadCoords.lat;
        markerLng = spreadCoords.lng;
      }

      const isSelected = selectedShuttle && String(selectedShuttle._id) === String(shuttle._id);
      const isEnRoute = shuttle.currentStatus === 'en_route';
      const isBoarding = shuttle.currentStatus === 'boarding';
      const isLiveGprs = coords.source === 'live';
      const isRouteOriginPin = coords.source === 'route-origin';
      const isSavedPin = coords.source === 'saved';
      const isMovingVehicle = shuttle.vehicleCategory === 'moving';
      const isFullyBooked = !isMovingVehicle && Number(shuttle.availableSeats) <= 0;
      const isMovingBooked = isMovingVehicle && shuttle.bookingStatus === 'booked';
      const isTripInProgress = !isMovingVehicle && ['en_route', 'arrived'].includes(shuttle.currentStatus);
      const isBookedMarker = isFullyBooked || isMovingBooked;
      const isUnavailable = isBookedMarker || isTripInProgress;
      const markerEmoji = isMovingVehicle
        ? (shuttle.vehicleType === 'minivan' ? '🚐' : '🚚')
        : (/bus|quantum|sprinter|van|shuttle/i.test(String(shuttle.carType || '')) ? '🚐' : '🚗');
      const showMarkerDetails = isSelected || mapZoom >= 10 || isUnavailable;
      const movingArea = String(shuttle.currentCoordinates?.address || '').replace(/,\s*/g, ' ').replace(/\s+/g, ' ').trim();
      const departureDay = isMovingVehicle ? 'Moving help' : shuttle.departureDate
        ? new Date(shuttle.departureDate).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
        : 'Date to be confirmed';
      const departureClock = isMovingVehicle ? `${shuttle.distanceKm} km away` : shuttle.departureTime && !/when full/i.test(shuttle.departureTime)
        ? shuttle.departureTime
        : 'Time to be confirmed';
      const abbreviateCity = (city) => {
        const normalized = String(city || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const knownCodes = {
          johannesburg: 'JHB',
          pretoria: 'PTA',
          polokwane: 'PLK',
          mokopane: 'MOK',
          'cape town': 'CPT',
          durban: 'DUR',
          bloemfontein: 'BFN',
          'port elizabeth': 'GQE',
          'east london': 'ELS',
          mbombela: 'MBM',
          nelspruit: 'MBM',
        };
        if (knownCodes[normalized]) return knownCodes[normalized];
        if (!normalized) return '???';
        return normalized.split(' ').map((part) => part.slice(0, 3).toUpperCase()).join('-');
      };
      const routeLabel = isMovingVehicle
        ? movingArea || 'GPS street area unavailable'
        : `${abbreviateCity(shuttle.originCity)} → ${abbreviateCity(shuttle.destinationCity)}`;

      // Movement breadcrumb trail for live moving vehicles
      if (isLiveGprs) {
        if (!shuttleTrailsRef.current[shuttle._id]) {
          shuttleTrailsRef.current[shuttle._id] = [];
        }
        const trail = shuttleTrailsRef.current[shuttle._id];
        const lastPoint = trail[trail.length - 1];
        if (!lastPoint || Math.abs(lastPoint[0] - markerLat) > 0.0001 || Math.abs(lastPoint[1] - markerLng) > 0.0001) {
          trail.push([markerLat, markerLng]);
          if (trail.length > 20) trail.shift();
        }

        if (trail.length > 1) {
          if (trailLayersRef.current[shuttle._id]) {
            trailLayersRef.current[shuttle._id].setLatLngs(trail);
          } else {
            const poly = L.polyline(trail, {
              color: '#0d9488',
              weight: 3.5,
              opacity: 0.75,
              dashArray: '6, 6',
            }).addTo(leafletMapRef.current);
            trailLayersRef.current[shuttle._id] = poly;
          }
        }
      }

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-shuttle-marker',
        html: `
          <div class="relative flex flex-col items-center  cursor-pointer transition-all duration-300 ${
            isSelected ? 'scale-110 z-[1000]' : 'hover:scale-105 z-[100]'
          }">
            ${showMarkerDetails ? `
              <div class="mb-1 max-w-[180px] truncate rounded-full border border-amber-400/80 bg-gray-900/95 px-2 py-1 text-[9px] font-black text-amber-300 shadow-md whitespace-nowrap">
                <span>${routeLabel}</span>
              </div>
            ` : ''}

            <!-- Live GPS Satellite badge (only when driver GPRS beacon is ON) -->
            ${isLiveGprs ? `
              <div class="absolute -top-3.5 right-0 z-10 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap border border-blue-300 animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block"></span>
                <span>LIVE GPS</span>
              </div>
            ` : ''}
            ${showMarkerDetails && isRouteOriginPin ? `
              <div class="absolute -top-3.5 right-0 z-10 bg-white text-gray-700 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap border border-gray-300">ROUTE START · APPROX</div>
            ` : ''}
            ${showMarkerDetails && isSavedPin ? `
              <div class="absolute -top-3.5 right-0 z-10 bg-slate-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap border border-slate-500">${shuttle.vehicleCategory === 'moving' ? shuttle.currentCoordinates?.locationSource === 'address' ? 'ADDRESS PIN · NOT LIVE' : 'SAVED GPS · NOT LIVE' : 'SAVED PIN · NOT LIVE'}</div>
            ` : ''}

            ${showMarkerDetails ? `
              <div class="mb-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold leading-tight text-gray-900 shadow-md border border-gray-200 whitespace-nowrap">
                <span>📅 ${departureDay}</span><span class="ml-1 text-teal-700">${departureClock}</span>
              </div>
            ` : ''}

            <!-- Price and Space Badge -->
            ${showMarkerDetails ? `<div class="px-2.5 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 whitespace-nowrap border ${
              isBookedMarker
                ? 'bg-red-600 text-white border-gray-400 ring-2 ring-gray-300'
                : isTripInProgress
                ? 'bg-blue-700 text-white border-blue-400'
                : isSelected
                ? 'bg-amber-400 text-gray-900 border-amber-500 ring-2 ring-amber-300'
                : isEnRoute
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-teal-700 text-white border-teal-500'
            }">
              <span class="w-2 h-2 rounded-full ${isUnavailable ? 'bg-white' : isEnRoute || isLiveGprs ? 'bg-white animate-ping' : 'bg-amber-300'}"></span>
              ${isMovingVehicle
                ? isMovingBooked ? '<span>Booked</span>' : `<span>R${shuttle.hourlyRate}/hr</span><span class="text-[10px] opacity-90 font-normal">${shuttle.vehicleType === 'minivan' ? 'MINIVAN' : 'TRUCK'}</span>`
                : isTripInProgress
                  ? '<span>Trip in progress · finish pending</span>'
                : isFullyBooked
                  ? '<span>Fully booked</span>'
                  : `<span>R${shuttle.pricePerSeat}</span><span class="text-[10px] opacity-90 font-normal">(${shuttle.availableSeats} open)</span>`}
            </div>` : ''}

            <!-- Vehicle Pin Pointer -->
            <div class="shuttle-vehicle-pin relative w-11 h-11 -mt-1 rounded-full ${isBookedMarker ? 'bg-red-600' : isTripInProgress ? 'bg-blue-700' : 'bg-white dark:bg-gray-900'} shadow-md border-2 ${
              isBookedMarker ? 'border-gray-500 ring-2 ring-gray-300' : isTripInProgress ? 'border-blue-400' : isSelected ? 'border-amber-500' : isLiveGprs ? 'border-blue-500' : 'border-teal-600'
            } flex items-center justify-center ${isUnavailable ? 'text-white' : 'text-teal-700 dark:text-teal-300'}">
              ${isLiveGprs ? `<div class="absolute -inset-2 rounded-full ${isBookedMarker ? 'bg-red-500/30' : isTripInProgress ? 'bg-blue-500/30' : 'bg-blue-500/20'} animate-ping pointer-events-none"></div>` : ''}
              <span role="img" aria-label="${isMovingVehicle ? (shuttle.vehicleType === 'minivan' ? 'Moving minivan' : 'Moving truck') : 'Shuttle vehicle'}" class="relative z-[1] text-[30px] leading-none drop-shadow-sm">${markerEmoji}</span>
            </div>
            
            <div class="w-1.5 h-1.5 rounded-full bg-black/40 mt-0.5"></div>
          </div>
        `,
        iconSize: [240, 106],
        iconAnchor: [120, 104],
      });

      const marker = L.marker([markerLat, markerLng], { icon: customIcon });

      // Selected marker always pops on top of all others!
      marker.setZIndexOffset(isSelected ? 2000 : 100 + clusterIndex);

      marker.on('click', () => {
        // If this vehicle is already selected and there are other cars in this cluster,
        // tapping again automatically cycles to the car in the back!
        if (selectedShuttle && String(selectedShuttle._id) === String(shuttle._id) && clusterSize > 1) {
          const nextIndex = (clusterIndex + 1) % clusterSize;
          const nextShuttle = cluster[nextIndex];
          if (onSelectShuttleRef.current) onSelectShuttleRef.current(nextShuttle);
        } else {
          if (onSelectShuttleRef.current) onSelectShuttleRef.current(shuttle);
        }
      });

      marker.addTo(leafletMapRef.current);
      markersRef.current.push(marker);
      bounds.push([coords.lat, coords.lng]);
    });

    // ── 2km Proximity Trip Alert & Route Visuals ──────────────────────────────
    if (leafletMapRef.current && userLocation && isValidCoord(userLocation.lat, userLocation.lng)) {
      const uLat = Number(userLocation.lat);
      const uLng = Number(userLocation.lng);

      if (proximityCircleRef.current) {
        proximityCircleRef.current.remove();
        proximityCircleRef.current = null;
      }
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (routeLabelRef.current) {
        routeLabelRef.current.remove();
        routeLabelRef.current = null;
      }

      // Check distance for selected shuttle, or any shuttle within 2km
      const targetShuttle = selectedShuttle || shuttles.find((s) => {
        const c = s.currentCoordinates;
        if (!c || !isValidCoord(c.lat, c.lng)) return false;
        const d = calculateDistanceKm(Number(c.lat), Number(c.lng), uLat, uLng);
        return d !== null && d <= 2.0;
      });

      if (targetShuttle?.currentCoordinates) {
        const sLat = Number(targetShuttle.currentCoordinates.lat);
        const sLng = Number(targetShuttle.currentCoordinates.lng);

        if (isValidCoord(sLat, sLng)) {
          const distKm = calculateDistanceKm(sLat, sLng, uLat, uLng);

          if (distKm !== null && distKm <= 2.0) {
            // Draw 2km Proximity Circle around user pickup point
            const circle = L.circle([uLat, uLng], {
              radius: 2000,
              color: '#0d9488',
              fillColor: '#14b8a6',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '6, 8',
            }).addTo(leafletMapRef.current);
            proximityCircleRef.current = circle;

            // Draw dashed connecting route line between vehicle and user
            const line = L.polyline([[sLat, sLng], [uLat, uLng]], {
              color: '#0f766e',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '8, 8',
            }).addTo(leafletMapRef.current);
            routeLineRef.current = line;

            // Floating midpoint distance badge
            const midLat = (sLat + uLat) / 2;
            const midLng = (sLng + uLng) / 2;
            const midIcon = L.divIcon({
              className: 'proximity-midpoint-badge',
              html: proximityChipVisible ? `
                <div class="px-2.5 py-1 rounded-full bg-amber-400 text-gray-950 font-black text-[10px] shadow-xl border border-amber-500 whitespace-nowrap flex items-center gap-1 cursor-pointer" title="Click to close this distance chip">
                  <span>🚨</span>
                  <span>${distKm.toFixed(1)} km away (~${Math.max(1, Math.ceil(distKm * 2))}m)</span>
                  <span aria-hidden="true" class="ml-1 rounded-full bg-black/10 px-1.5 py-0.5">×</span>
                </div>
              ` : '',
              iconAnchor: [55, 14],
            });
            if (proximityChipVisible) {
              const label = L.marker([midLat, midLng], { icon: midIcon, zIndexOffset: 3000 }).addTo(leafletMapRef.current);
              label.on('click', () => setProximityChipVisible(false));
              routeLabelRef.current = label;
            }

            // Trigger Trip Alert callback to parent
            const alertKey = String(targetShuttle._id);
            if (proximityAlertSentRef.current !== alertKey) {
              proximityAlertSentRef.current = alertKey;
              setProximityChipVisible(true);
              if (onProximityAlertRef.current) {
                onProximityAlertRef.current({
                  shuttle: targetShuttle,
                  distanceKm: distKm,
                  userLocation,
                });
              }
            }
          }
        }
      }
    }

    // Fit only when the set of visible vehicles changes. Polling and manual
    // zoom changes must not keep snapping the map back to a close view.
    const vehicleKey = shuttles.map((shuttle) => String(shuttle._id)).sort().join('|');
    const shouldAutoFit = bounds.length > 0 && vehicleKey !== lastAutoFitVehicleKeyRef.current;
    if (shouldAutoFit) {
      lastAutoFitVehicleKeyRef.current = vehicleKey;
    }
    if (shouldAutoFit && bounds.length > 1 && !selectedShuttle && !isLiveRadarMode) {
      try {
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 9 });
      } catch (e) {}
    } else if (shouldAutoFit && bounds.length === 1 && !selectedShuttle && !isLiveRadarMode) {
      leafletMapRef.current.flyTo(bounds[0], 7, { duration: 0.8 });
    }
  }, [shuttles, selectedShuttle, userLocation, mapReady, isLiveRadarMode, proximityChipVisible, mapZoom]);

  // Fly to selected shuttle
  useEffect(() => {
    if (!leafletMapRef.current || !selectedShuttle) return;
    const coords = getShuttleMapCoordinates(selectedShuttle);
    if (coords) {
      leafletMapRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 });
    }
  }, [selectedShuttle]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation || !leafletMapRef.current) {
      setGprsStatus('Geolocation not supported by device.');
      return;
    }

    setLocatingUser(true);
    setGprsStatus('Acquiring phone GPS position...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocatingUser(false);

        if (!isValidCoord(latitude, longitude)) {
          setGprsStatus('Invalid GPS coordinates received.');
          return;
        }

        const L = window.L || (await import('leaflet')).default;
        if (!L || !leafletMapRef.current) return;

        // Remove previous GPRS marker if any
        if (userGprsMarkerRef.current) {
          userGprsMarkerRef.current.remove();
        }

        const gprsIcon = L.divIcon({
          className: 'custom-gprs-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
              <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([latitude, longitude], { icon: gprsIcon });
        marker.addTo(leafletMapRef.current);
        userGprsMarkerRef.current = marker;

        leafletMapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
        if (onUserLocationChange) {
          onUserLocationChange({ lat: latitude, lng: longitude, accuracy });
        }
        setGprsStatus(`📍 Location Locked (~${Math.round(accuracy || 10)}m accuracy)`);
        setTimeout(() => setGprsStatus(null), 4000);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setLocatingUser(false);
        setGprsStatus('Could not read phone GPS. Check permissions.');
        setTimeout(() => setGprsStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // ── "Return Map" (Recenter / Overview of all shuttles) ──────────────────────
  const handleResetView = () => {
    if (!leafletMapRef.current) return;

    // Deselect currently selected shuttle so the full card closes and view returns nicely
    if (onSelectShuttleRef.current) {
      onSelectShuttleRef.current(null);
    }

    const bounds = [];
    shuttles.forEach((s) => {
      const coords = getShuttleMapCoordinates(s);
      if (coords) bounds.push([coords.lat, coords.lng]);
    });

    if (userLocation && isValidCoord(userLocation.lat, userLocation.lng)) {
      bounds.push([Number(userLocation.lat), Number(userLocation.lng)]);
    }

    if (bounds.length > 1) {
      try {
      leafletMapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 9, duration: 1.2 });
      } catch (e) {
        leafletMapRef.current.flyTo([SA_CENTER.lat, SA_CENTER.lng], 7, { duration: 1.2 });
      }
    } else if (bounds.length === 1) {
      leafletMapRef.current.flyTo(bounds[0], 7, { duration: 1.2 });
    } else {
      leafletMapRef.current.flyTo([SA_CENTER.lat, SA_CENTER.lng], 6, { duration: 1.2 });
    }

    setGprsStatus('✓ Map returned to full overview');
    setTimeout(() => setGprsStatus(null), 3000);

    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 250);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current && leafletMapRef.current.getZoom() > 2) {
      leafletMapRef.current.zoomOut();
    }
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 250);
  };

  return (
    <div
      className={`relative w-full overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : `${heightClass} rounded-none border-x-0 border-t-0 shadow-md`
      }`}
    >
      {/* Hide native Leaflet controls to keep the UI clean and modern */}
      <style>{`
        .leaflet-div-icon.custom-shuttle-marker {
          background: transparent !important;
          border: 0 !important;
        }

        .shuttle-vehicle-pin {
          animation: shuttle-vehicle-bob 900ms ease-in-out infinite;
        }

        @keyframes shuttle-vehicle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .shuttle-vehicle-pin { animation: none; }
        }

        .leaflet-control-zoom,
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out,
        .leaflet-bar {
          display: none !important;
        }
      `}</style>

      {/* ── Bottom-Left: Compact vertical map layer controls ── */}
      {controlsVisible && <div aria-label="Map display controls" className="absolute bottom-3 left-3 z-[1000] flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 shadow-xl backdrop-blur-md dark:border-gray-700/90 dark:bg-gray-900/95">
        <button
          type="button"
          onClick={() => {
            switchMapStyle('googleRoad');
            setIsLiveRadarMode(false);
          }}
          aria-label="Road map"
          className={`flex h-10 w-10 items-center justify-center transition-all ${
            mapStyle === 'googleRoad' && !isLiveRadarMode
              ? 'bg-teal-600 text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
          title="Road Map: Street navigation and road network"
        >
          <MapIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            switchMapStyle('googleSatellite');
            setIsLiveRadarMode(false);
          }}
          aria-label="Satellite map"
          className={`flex h-10 w-10 items-center justify-center border-t border-gray-100 transition-all dark:border-gray-800 ${
            mapStyle === 'googleSatellite' && !isLiveRadarMode
              ? 'bg-teal-600 text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
          title="Satellite: Aerial photography with roads and terrain"
        >
          <Satellite className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleToggleLiveRadar}
          aria-label="Live map"
          className={`flex h-10 w-10 items-center justify-center border-t border-gray-100 transition-all dark:border-gray-800 ${
            isLiveRadarMode
              ? 'bg-emerald-600 text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
          title="Live Map: Real-time vehicle radar and tracking"
        >
          <Radio className="h-4 w-4" />
        </button>
      </div>}

      {/* ── Top-Right: Floating Utility Controls ── */}
      {controlsVisible && <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          aria-expanded={utilityControlsExpanded}
          aria-label={utilityControlsExpanded ? 'Minimize map controls' : 'Expand map controls'}
          onClick={() => setUtilityControlsExpanded((expanded) => !expanded)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/90 bg-white/95 text-gray-700 shadow-lg backdrop-blur-md transition hover:bg-white dark:border-gray-700/90 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800"
          title={utilityControlsExpanded ? 'Minimize map controls' : 'Expand map controls'}
        >
          {utilityControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Collapsible GPS, refresh, zoom and fullscreen controls */}
        {utilityControlsExpanded && <div className="flex flex-col rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border border-gray-200/90 dark:border-gray-700/90 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {/* GPS Locate Me */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition"
            title="My GPS Location"
          >
            <Locate className={`w-4 h-4 ${locatingUser ? 'animate-spin text-blue-600' : 'text-gray-700 dark:text-gray-200'}`} />
          </button>

          {/* Live Sync / Refresh */}
          <button
            type="button"
            onClick={handleManualLiveSync}
            disabled={isLiveSyncing}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition"
            title="Refresh Live Shuttle Positions"
          >
            <RefreshCw className={`w-4 h-4 ${isLiveSyncing ? 'animate-spin text-emerald-600' : 'text-gray-700 dark:text-gray-200'}`} />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={mapZoom <= 2}
            className="p-2.5 text-gray-700 transition hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>}
      </div>}

      {controlsVisible && <button
        type="button"
        onClick={handleResetView}
        aria-label="Return map to full overview of all shuttles"
        className="absolute bottom-3 right-3 z-[1000] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:bg-white hover:shadow-xl active:scale-95 dark:bg-gray-900/95 dark:text-gray-100 dark:ring-white/10 dark:hover:bg-gray-800"
        title="Return map to full overview of all shuttles"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>}

      {/* ── Status Toast (Floating at Top-Center) ── */}
      {gprsStatus && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none transition-all duration-300">
          <div className="px-4 py-1.5 rounded-full bg-gray-950/90 text-white text-xs font-bold shadow-2xl border border-gray-700 flex items-center gap-2 backdrop-blur-md">
            <span>{gprsStatus}</span>
          </div>
        </div>
      )}

      {/* ── Live Map Active Pill (when Live Map mode is ON) ── */}
      {isLiveRadarMode && (
        <div className="absolute bottom-4 left-3 z-[1000] pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{liveActiveCount > 0 ? `📡 Live GPS • ${liveActiveCount} driver${liveActiveCount === 1 ? '' : 's'} sharing` : '📡 Live mode · waiting for driver GPS'}</span>
          </div>
        </div>
      )}

      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};

export default ShuttleMap;
