import { useCallback, useEffect, useState } from 'react';

// Global cache & subscriber registry to prevent hammering browser geolocation or reverse geocoding
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