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

const ShuttleMap = ({ 
  shuttles = [], 
  selectedShuttle, 
  onSelectShuttle, 
  onRequestPickup,
  onLiveRefresh,
  heightClass = 'h-[75vh] sm:h-[82vh] lg:h-[86vh]' 
}) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const userGprsMarkerRef = useRef(null);
  const markersRef = useRef([]);
  const livePollingRef = useRef(null);
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

        // Add standard zoom control at bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

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

    shuttles.forEach((shuttle) => {
      const coords = shuttle.currentCoordinates;
      if (!coords || !isValidCoord(coords.lat, coords.lng)) return;

      const isSelected = selectedShuttle && String(selectedShuttle._id) === String(shuttle._id);
      const isEnRoute = shuttle.currentStatus === 'en_route';
      const isBoarding = shuttle.currentStatus === 'boarding';
      const isLiveGprs = shuttle.currentCoordinates?.isLive === true;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-shuttle-marker',
        html: `
          <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-300 ${
            isSelected ? 'scale-110 z-[1000]' : 'hover:scale-105 z-[100]'
          }">
            <!-- Live GPS Satellite badge (only when driver GPRS beacon is ON) -->
            ${isLiveGprs ? `
              <div class="absolute -top-3 right-0 z-10 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5 whitespace-nowrap">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block"></span>
                <span>LIVE GPS</span>
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
            <div class="w-8 h-8 -mt-1 rounded-full bg-white dark:bg-gray-900 shadow-md border-2 ${
              isSelected ? 'border-amber-500' : isLiveGprs ? 'border-blue-500' : 'border-teal-600'
            } flex items-center justify-center text-teal-700 dark:text-teal-300">
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

      const marker = L.marker([Number(coords.lat), Number(coords.lng)], { icon: customIcon });

      // Popup with trip snapshot
      const popupHtml = `
        <div class="p-2 text-gray-900 min-w-[210px]">
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="text-[10px] font-bold text-teal-600 uppercase tracking-wide">
              ${shuttle.serviceType === 'interprovincial' ? '🛣️ Inter-Provincial' : '📍 Local Transit'}
            </span>
            ${shuttle.isHouseToHouse !== false ? '<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">🏠 House-to-House</span>' : ''}
          </div>
          <div class="font-black text-sm mb-1">${shuttle.originCity} ➔ ${shuttle.destinationCity}</div>
          <div class="text-xs text-gray-600 mb-1">
            ${shuttle.carType} • <span class="font-mono font-semibold">${shuttle.plateNumber}</span>
          </div>
          <div class="text-[11px] text-teal-700 font-medium mb-2">
            ${shuttle.leavesWhenFull !== false ? '⚡ Leaves when full / almost full' : 'Departure: ' + (shuttle.departureTime || 'Scheduled')}
          </div>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
            <span class="font-bold text-emerald-600">${shuttle.availableSeats} of ${shuttle.totalSeats} seats open</span>
            <span class="font-black text-amber-600">R${shuttle.pricePerSeat}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectShuttle) onSelectShuttle(shuttle);
      });

      marker.addTo(leafletMapRef.current);
      markersRef.current.push(marker);
      bounds.push([Number(coords.lat), Number(coords.lng)]);
    });

    // Fit map bounds if multiple markers exist
    if (bounds.length > 1 && !selectedShuttle) {
      try {
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch (e) {}
    }
  }, [shuttles, selectedShuttle, mapReady, onSelectShuttle]);

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
        marker.bindPopup(`
          <div class="p-2 text-xs text-gray-900 font-sans">
            <div class="font-black text-blue-600 flex items-center gap-1 mb-1">
              <span>📍 Your Phone GPRS Location</span>
            </div>
            <div class="text-[11px] text-gray-600 font-mono">
              ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </div>
            <div class="text-[10px] text-emerald-600 mt-1 font-semibold">
              Accuracy: ~${Math.round(accuracy || 10)}m
            </div>
          </div>
        `);

        marker.addTo(leafletMapRef.current);
        userGprsMarkerRef.current = marker;

        leafletMapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
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
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Floating Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 flex-wrap gap-2">
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200/80 dark:border-gray-700 shadow-md flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
            <Bus className="w-4 h-4 text-teal-600" />
            <span className="hidden xs:inline">Live Radar</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400 font-normal">({shuttles.length})</span>
          </div>

          {/* Live GPS drivers badge */}
          {liveActiveCount > 0 && (
            <div className="bg-blue-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
              <Wifi className="w-3 h-3" />
              <span>{liveActiveCount} Live GPS</span>
            </div>
          )}

          {/* Free Google Map Layer Selector */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-0.5 rounded-full border border-gray-200/80 dark:border-gray-700 shadow-md flex items-center gap-1">
            {Object.values(MAP_PROVIDERS).map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => switchMapStyle(prov.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                  mapStyle === prov.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={prov.name}
              >
                <span>{prov.icon}</span>
                <span className="hidden sm:inline text-[11px]">{prov.name}</span>
              </button>
            ))}
          </div>

          {gprsStatus && (
            <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-in fade-in flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-ping" />
              <span>{gprsStatus}</span>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="p-2.5 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-50 border border-gray-200 dark:border-gray-700 transition-transform active:scale-95 flex items-center gap-1.5"
            title="Allocate phone GPRS position on Google Map"
          >
            <Navigation className={`w-4 h-4 text-blue-600 ${locatingUser ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-xs font-bold text-blue-600">
              {locatingUser ? 'GPRS...' : 'Phone GPRS'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="p-2.5 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-50 border border-gray-200 dark:border-gray-700 transition-transform active:scale-95"
            title="Reset South Africa View"
          >
            <Compass className="w-4 h-4 text-amber-500" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-50 border border-gray-200 dark:border-gray-700 transition-transform active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Selected Shuttle mini popup strip at bottom of map */}
      {selectedShuttle && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xl z-10 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
          <div>
            <div className="text-[11px] font-bold text-teal-600 uppercase">
              {selectedShuttle.originCity} ➔ {selectedShuttle.destinationCity}
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {selectedShuttle.carType}
            </div>
            <div className="text-xs text-gray-500">
              {selectedShuttle.availableSeats} of {selectedShuttle.totalSeats} seats open •{' '}
              {selectedShuttle.leavesWhenFull !== false
                ? '⚡ Leaves when full'
                : `Departure: ${selectedShuttle.departureTime}`}
              {selectedShuttle.isHouseToHouse !== false && ' • 🏠 House-to-House'}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-black text-amber-500">
              R{selectedShuttle.pricePerSeat}
            </div>
            <button
              type="button"
              onClick={() => {
                if (onRequestPickup) onRequestPickup(selectedShuttle);
                else if (onSelectShuttle) onSelectShuttle(selectedShuttle);
              }}
              className="mt-1 px-3 py-1 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
            >
              Request Pickup ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShuttleMap;
