import React, { useState, useEffect, useRef } from 'react';
import { geocodeAddress } from '../utils/geocoding';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaCompass } from 'react-icons/fa';

const GoogleMapComponent = ({ latitude, longitude, address, title }) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Resolve coordinates from lat/lng or address geocoding
  useEffect(() => {
    let isMounted = true;
    const resolveLocation = async () => {
      setLoading(true);
      if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
        if (isMounted) {
          setCoords({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
          setLoading(false);
        }
      } else if (address) {
        try {
          const result = await geocodeAddress(address);
          if (isMounted && result && !isNaN(result.lat) && !isNaN(result.lng)) {
            setCoords(result);
          }
        } catch (e) {
          console.warn('Geocoding fallback failed:', e);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    resolveLocation();
    return () => { isMounted = false; };
  }, [latitude, longitude, address]);

  // Initialize or update Leaflet map when coords are available
  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;
    let mounted = true;

    const setupMap = () => {
      const L = window.L;
      if (!L || !mapContainerRef.current || !mounted) return;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: false,
        }).setView([coords.lat, coords.lng], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
        }).addTo(map);

        const customPin = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center">
              <div style="background: linear-gradient(135deg, #FF385C, #E61E4D); box-shadow: 0 4px 14px rgba(230,30,77,0.5);" class="px-3 py-1.5 rounded-full text-white text-xs font-bold whitespace-nowrap border-2 border-white flex items-center gap-1.5 animate-bounce">
                <span>📍</span>
                <span>${(title || 'Location').slice(0, 20)}</span>
              </div>
              <div style="width: 2px; height: 10px; background: #E61E4D;"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: customPin }).addTo(map);
        if (address || title) {
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; padding: 4px;">
              <strong style="color: #111;">${title || 'Location'}</strong><br/>
              <span style="color: #666; font-size: 11px;">${address || ''}</span>
            </div>
          `);
        }

        leafletMapRef.current = map;
        markerRef.current = marker;
      } else {
        leafletMapRef.current.setView([coords.lat, coords.lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        }
      }
    };

    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => { if (mounted) setupMap(); };
      document.head.appendChild(script);
    } else {
      setupMap();
    }

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [coords, title, address]);

  const googleMapsUrl = coords 
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "South Africa")}`;

  if (loading) {
    return (
      <div className="w-full h-full min-h-[220px] bg-slate-900 flex flex-col items-center justify-center rounded-2xl border border-slate-800 p-6 text-center animate-pulse">
        <FaCompass className="text-3xl text-rose-500 animate-spin mb-3" />
        <div className="text-slate-300 font-bold text-xs uppercase tracking-widest">Pinpointing Location...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[260px] relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
      {coords ? (
        <>
          <div ref={mapContainerRef} className="w-full h-full min-h-[260px] z-0" />
          <div className="absolute bottom-3 right-3 z-[400]">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md border border-gray-200 transition-all hover:scale-105 active:scale-95"
            >
              <span>Directions</span>
              <FaExternalLinkAlt className="text-[10px] text-rose-500" />
            </a>
          </div>
        </>
      ) : (
        <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 flex flex-col items-center justify-center p-6 text-center text-white relative">
          <FaMapMarkerAlt className="text-4xl text-rose-500 mb-3 animate-bounce" />
          <h4 className="font-bold text-sm mb-1 text-white">{title || "Property / Service Location"}</h4>
          <p className="text-xs text-slate-300 mb-4 px-4 max-w-sm line-clamp-2">{address || "Location specified by host"}</p>
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
          >
            Open in Google Maps <FaExternalLinkAlt className="text-[10px]" />
          </a>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
