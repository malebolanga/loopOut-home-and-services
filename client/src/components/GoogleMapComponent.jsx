import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { geocodeAddress } from '../utils/geocoding';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const MapComponent = ({ latitude, longitude, address, title }) => {
  const [map, setMap] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  // Load Google Maps API
  // Using an environment variable or a default placeholder
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  useEffect(() => {
    const getCoords = async () => {
      if (latitude && longitude) {
        setCoords({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
        setLoading(false);
      } else if (address) {
        const result = await geocodeAddress(address);
        if (result) {
          setCoords(result);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    getCoords();
  }, [latitude, longitude, address]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const googleMapsUrl = coords 
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`;

  if (!isLoaded && !loadError && (import.meta.env.VITE_GOOGLE_MAPS_API_KEY)) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse rounded-xl">
        <div className="text-gray-400">Loading Map...</div>
      </div>
    );
  }

  // Fallback if no API key, load error (expired key), or not loaded
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || !isLoaded || loadError) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center border border-gray-200 rounded-xl p-6 text-center">
        <FaMapMarkerAlt className="text-4xl text-rose-500 mb-3 opacity-50" />
        <h4 className="font-semibold text-gray-900 mb-1">{title || "Location"}</h4>
        <p className="text-sm text-gray-600 mb-4 px-4 line-clamp-2">{address}</p>
        <a 
          href={googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          View on Google Maps <FaExternalLinkAlt className="text-xs" />
        </a>
        {loadError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg">
            <p className="text-[10px] text-rose-600 italic font-black uppercase tracking-widest mb-1">
              Google Maps Protocol Failure
            </p>
            <p className="text-[11px] text-gray-700 font-medium">
              {loadError.message?.includes('ExpiredKeyMapError') 
                ? "The Google Maps API key has expired. Please rotate the VITE_GOOGLE_MAPS_API_KEY in the cloud console." 
                : loadError.message || "Invalid or Expired API Key"}
            </p>
          </div>
        )}
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && !loadError && (
          <p className="text-[10px] text-gray-400 mt-4 italic">Interactive map requires a Google Maps API key.</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      {coords ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={coords}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker 
            position={coords} 
            title={title}
            onClick={() => setShowInfoWindow(true)}
          />

          {showInfoWindow && (
            <InfoWindow position={coords} onCloseClick={() => setShowInfoWindow(false)}>
              <div className="p-2 max-w-[200px]">
                <h4 className="font-bold text-sm mb-1">{title}</h4>
                <p className="text-xs text-gray-600 mb-2">{address}</p>
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Get Directions <FaExternalLinkAlt className="text-[10px]" />
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-xl p-4 text-center">
           <FaMapMarkerAlt className="text-3xl text-gray-300 mb-2" />
           <p className="text-sm text-gray-500">Coordinates not available for this address.</p>
           <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-2">
             Try searching on Google Maps
           </a>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
