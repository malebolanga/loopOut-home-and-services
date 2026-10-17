import { useCallback, useEffect, useState } from 'react';

// ─── Session-level geocode cache ──────────────────────────────────────────────
// Persists the reverse-geocoded city name across page reloads within the same
// browser tab session. Key = "geo:<lat1dp>:<lon1dp>" (rounded to 1 d.p. ≈ 11 km).
// This eliminates repeat Nominatim calls for every app boot.
const GEO_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const geoCacheKey = (lat, lon) =>
  `geo:${Number(lat).toFixed(1)}:${Number(lon).toFixed(1)}`;

const readGeoCache = (lat, lon) => {
  try {
    const raw = sessionStorage.getItem(geoCacheKey(lat, lon));
    if (!raw) return null;
    const { city, ts } = JSON.parse(raw);
    if (Date.now() - ts > GEO_CACHE_TTL_MS) return null; // expired
    return city;
  } catch {
    return null;
  }
};

const writeGeoCache = (lat, lon, city) => {
  try {
    sessionStorage.setItem(geoCacheKey(lat, lon), JSON.stringify({ city, ts: Date.now() }));
  } catch {
    // Ignore (private browsing quota exceeded, etc.)
  }
};

// ─── Global in-memory state shared across all hook instances ─────────────────
let globalCoords = null;
let globalCity = null;
let globalError = null;
let globalLoading = false;
let hasRequested = false;
let isFetchingCity = false;
const subscribers = new Set();

const notifySubscribers = () => {
  const state = {
    coords: globalCoords,
    city: globalCity,
    error: globalError,
    loading: globalLoading,
  };
  subscribers.forEach((cb) => {
    try {
      cb(state);
    } catch {
      // Ignore unmounted callbacks
    }
  });
};

const fetchCityName = async (lat, lon) => {
  // Check sessionStorage first — skips the network entirely if we have a fresh entry
  const cached = readGeoCache(lat, lon);
  if (cached) {
    globalCity = cached;
    globalLoading = false;
    notifySubscribers();
    return;
  }

  if (isFetchingCity || (globalCity && globalCoords?.latitude === lat && globalCoords?.longitude === lon)) {
    return;
  }
  isFetchingCity = true;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: { 'Accept-Language': 'en' },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data && data.address) {
      const detectedCity =
        data.address.city ||
        data.address.town ||
        data.address.suburb ||
        data.address.village ||
        data.address.municipality ||
        data.address.state;
      globalCity = detectedCity || null;
      if (globalCity) writeGeoCache(lat, lon, globalCity);
    }
  } catch (err) {
    console.warn('Reverse geocoding unavailable:', err.message);
  } finally {
    isFetchingCity = false;
    globalLoading = false;
    notifySubscribers();
  }
};

const triggerGeolocation = (force = false) => {
  if (hasRequested && !force) return;
  hasRequested = true;

  if (typeof window === 'undefined' || !navigator.geolocation) {
    globalError = 'Geolocation is not supported by your browser';
    globalLoading = false;
    notifySubscribers();
    return;
  }

  globalLoading = true;
  globalError = null;
  notifySubscribers();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      globalCoords = { latitude, longitude };
      notifySubscribers();
      fetchCityName(latitude, longitude);
    },
    (err) => {
      globalError = err.message;
      globalLoading = false;
      notifySubscribers();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    }
  );
};

const useLocationCoords = () => {
  const [state, setState] = useState(() => ({
    coords: globalCoords,
    city: globalCity,
    error: globalError,
    loading: !globalCoords && !globalError,
  }));

  useEffect(() => {
    subscribers.add(setState);
    triggerGeolocation();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  const requestLocation = useCallback(() => {
    triggerGeolocation(true);
  }, []);

  return {
    coords: state.coords,
    city: state.city,
    error: state.error,
    loading: state.loading,
    requestLocation,
  };
};

export default useLocationCoords;