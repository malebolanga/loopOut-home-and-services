import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  Bus, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Users,
  Compass,
  Layers,
  Radio,
  Wifi
} from 'lucide-react';
import axios from 'axios';

const SA_CENTER = { lat: -26.2041, lng: 28.0473 }; // Johannesburg / central transport hub

const MAP_PROVIDERS = {
  googleRoad: {
    id: 'googleRoad',
    name: 'Google Map',
    icon: '🗺️',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  googleSatellite: {
    id: 'googleSatellite',
    name: 'Google Satellite',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
  voyager: {
    id: 'voyager',
    name: 'Clean View',
    icon: '🧭',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
  },
};

const isValidCoord = (lat, lng) => {
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
  const [mapStyle, setMapStyle] = useState('googleRoad');
  const [gprsStatus, setGprsStatus] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [liveActiveCount, setLiveActiveCount] = useState(0);

  // Initialize Leaflet map with Free Google Maps
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mounted || !mapContainerRef.current || leafletMapRef.current) return;

      const L = window.L || (await import('leaflet')).default;
      if (!L) return;

      const initialLat = selectedShuttle?.currentCoordinates?.lat || SA_CENTER.lat;
      const initialLng = selectedShuttle?.currentCoordinates?.lng || SA_CENTER.lng;

      try {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
        }).setView([initialLat, initialLng], 7);

        // Default: Free Google Streets Tile Layer (no API key required)
        const provider = MAP_PROVIDERS.googleRoad;
        const tileLayer = L.tileLayer(provider.url, {
          maxZoom: provider.maxZoom,
          subdomains: provider.subdomains,
        }).addTo(map);

        activeTileLayerRef.current = tileLayer;
        leafletMapRef.current = map;
        if (mounted) {
          setMapReady(true);
          setTimeout(() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.invalidateSize();
            }
          }, 150);
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

  // ── Live GPS Polling: re-fetch shuttle positions every 10s ──────
  // When any driver has GPRS broadcast active, their coords update in DB.
  // This poll ensures the passenger map stays in sync without a page refresh.
  useEffect(() => {
    if (!onLiveRefresh) return;

    const poll = async () => {
      try {
        const res = await axios.get('/api/shuttles/get?limit=50');
        if (res.data?.shuttles) {
          const liveCount = res.data.shuttles.filter(
            (s) => s.currentCoordinates?.isLive
          ).length;
          setLiveActiveCount(liveCount);
          onLiveRefresh(res.data.shuttles);
        }
      } catch (e) {
        // Silent fail — just wait for next poll
      }
    };

    // Initial poll after 2 seconds, then every 10 seconds
    const delay = setTimeout(() => {
      poll();
      livePollingRef.current = setInterval(poll, 10000);
    }, 2000);

    return () => {
      clearTimeout(delay);
      if (livePollingRef.current) clearInterval(livePollingRef.current);
    };
  }, [onLiveRefresh]);

  // Switch map between Google Streets, Google Satellite, and Clean view
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

    // Group shuttles that are collocated (within ~150m of each other)
    const clusterMap = {};
    shuttles.forEach((s) => {
      const c = s.currentCoordinates;
      if (!c || !isValidCoord(c.lat, c.lng)) return;
      const key = `${Number(c.lat).toFixed(3)}_${Number(c.lng).toFixed(3)}`;
      if (!clusterMap[key]) clusterMap[key] = [];
      clusterMap[key].push(s);
    });

    shuttles.forEach((shuttle) => {
      const coords = shuttle.currentCoordinates;
      if (!coords || !isValidCoord(coords.lat, coords.lng)) return;

      const clusterKey = `${Number(coords.lat).toFixed(3)}_${Number(coords.lng).toFixed(3)}`;
      const cluster = clusterMap[clusterKey] || [shuttle];
      const clusterSize = cluster.length;
      const clusterIndex = cluster.findIndex((item) => String(item._id) === String(shuttle._id));

      // Calculate spread position if multiple cars share the location so none are blocked
      let markerLat = Number(coords.lat);
      let markerLng = Number(coords.lng);

      if (clusterSize > 1) {
        // Disperse overlapping vehicles into a neat fan circle (~35m radius)
        const angle = (clusterIndex / clusterSize) * 2 * Math.PI - Math.PI / 2;
        const radiusLat = 0.00035; // ~38m
        const radiusLng = radiusLat / Math.cos((markerLat * Math.PI) / 180);
        markerLat += Math.sin(angle) * radiusLat;
        markerLng += Math.cos(angle) * radiusLng;
      }

      const isSelected = selectedShuttle && String(selectedShuttle._id) === String(shuttle._id);
      const isEnRoute = shuttle.currentStatus === 'en_route';
      const isBoarding = shuttle.currentStatus === 'boarding';
      const isLiveGprs = shuttle.currentCoordinates?.isLive === true;

      // Movement breadcrumb trail for live moving vehicles
      if (isLiveGprs || isEnRoute) {
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
          <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-300 ${
            isSelected ? 'scale-110 z-[1000]' : 'hover:scale-105 z-[100]'
          }">
            <!-- Multi-car cluster indicator (e.g. Car 1/3 at this station) -->
            ${clusterSize > 1 ? `
              <div class="absolute -top-3.5 -left-3 z-20 bg-gray-900/95 text-amber-400 text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-amber-400/80 flex items-center gap-0.5 whitespace-nowrap">
                <span>Car ${clusterIndex + 1}/${clusterSize}</span>
              </div>
            ` : ''}

            <!-- Live GPS Satellite badge (only when driver GPRS beacon is ON) -->
            ${isLiveGprs ? `
              <div class="absolute -top-3.5 right-0 z-10 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap border border-blue-300 animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block"></span>
                <span>LIVE GPS • MOVING</span>
              </div>
            ` : ''}

            <!-- Price and Space Badge -->
            <div class="px-2.5 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 whitespace-nowrap border ${
              isSelected
                ? 'bg-amber-400 text-gray-900 border-amber-500 ring-2 ring-amber-300'
                : isEnRoute
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-teal-700 text-white border-teal-500'
            }">
              <span class="w-2 h-2 rounded-full ${isEnRoute || isLiveGprs ? 'bg-white animate-ping' : 'bg-amber-300'}"></span>
              <span>R${shuttle.pricePerSeat}</span>
              <span class="text-[10px] opacity-90 font-normal">(${shuttle.availableSeats} open)</span>
            </div>

            <!-- Vehicle Pin Pointer -->
            <div class="relative w-8 h-8 -mt-1 rounded-full bg-white dark:bg-gray-900 shadow-md border-2 ${
              isSelected ? 'border-amber-500' : isLiveGprs ? 'border-blue-500' : 'border-teal-600'
            } flex items-center justify-center text-teal-700 dark:text-teal-300">
              ${isLiveGprs ? '<div class="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping pointer-events-none"></div>' : ''}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C18.1 6.8 17.2 6 16.1 6H7.9C6.8 6 5.9 6.8 5.6 7.8L4.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
              </svg>
            </div>
            
            <div class="w-1.5 h-1.5 rounded-full bg-black/40 mt-0.5"></div>
          </div>
        `,
        iconSize: [80, 60],
        iconAnchor: [40, 58],
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
      bounds.push([markerLat, markerLng]);
    });

    // ── 2km Proximity Trip Alert & Route Visuals ─────────────────
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

          // If within 2km, draw 2km boundary circle and live connecting line
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
              html: `
                <div class="px-2.5 py-1 rounded-full bg-amber-400 text-gray-950 font-black text-[10px] shadow-xl border border-amber-500 whitespace-nowrap animate-pulse flex items-center gap-1">
                  <span>🚨</span>
                  <span>${distKm.toFixed(1)} km away (~${Math.max(1, Math.ceil(distKm * 2))}m)</span>
                </div>
              `,
              iconAnchor: [55, 14],
            });
            const label = L.marker([midLat, midLng], { icon: midIcon, zIndexOffset: 3000 }).addTo(leafletMapRef.current);
            routeLabelRef.current = label;

            // Trigger Trip Alert callback to parent — gate by ref to avoid identity loop
            const alertKey = String(targetShuttle._id);
            if (proximityAlertSentRef.current !== alertKey) {
              proximityAlertSentRef.current = alertKey;
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

    // Fit map bounds if multiple markers exist
    if (bounds.length > 1 && !selectedShuttle) {
      try {
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch (e) {}
    }
  // ⚠️ onSelectShuttle & onProximityAlert intentionally omitted — stored in refs above
  // to prevent their identity changes from triggering an infinite re-render loop.
  }, [shuttles, selectedShuttle, userLocation, mapReady]);

  // Fly to selected shuttle
  useEffect(() => {
    if (!leafletMapRef.current || !selectedShuttle?.currentCoordinates) return;
    const { lat, lng } = selectedShuttle.currentCoordinates;
    if (isValidCoord(lat, lng)) {
      leafletMapRef.current.flyTo([Number(lat), Number(lng)], 13, { duration: 1.2 });
    }
  }, [selectedShuttle]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !leafletMapRef.current) {
      setGprsStatus('Geolocation not supported by device.');
      return;
    }

    setLocatingUser(true);
    setGprsStatus('Allocating phone GPRS...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocatingUser(false);

        if (!isValidCoord(latitude, longitude)) {
          setGprsStatus('Invalid coordinates received.');
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
        setGprsStatus(`📍 GPRS Allocated (~${Math.round(accuracy || 10)}m accuracy)`);
        setTimeout(() => setGprsStatus(null), 5000);
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

  const handleResetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([SA_CENTER.lat, SA_CENTER.lng], 6, { duration: 1 });
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : `${heightClass} rounded-none border-x-0 border-t-0 shadow-md`
      }`}
    >
      {/* Hide map zoom / scrolling buttons & controls */}
      <style>{`
        .leaflet-control-zoom,
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out,
        .leaflet-bar {
          display: none !important;
        }
      `}</style>

      {/* Map Leaflet Container - Clean edge-to-edge view with no belt menu */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};

export default ShuttleMap;
