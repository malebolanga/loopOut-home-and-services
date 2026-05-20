import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

            
import { geocodeAddress } from '../utils/geocoding';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const GoogleMapComponent = ({ latitude, longitude, address, title }) => {
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
      <div className="w-full h-full bg-black flex items-center justify-center animate-pulse rounded-2xl border border-slate-800">
        <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Transmission Map...</div>
      </div>
    );
  }

  // Fallback if no API key, load error (expired key), or not loaded
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || !isLoaded || loadError) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center border border-slate-800/80 rounded-2xl p-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
        <FaMapMarkerAlt className="text-4xl text-rose-500 mb-3 animate-bounce relative z-10" />
        <h4 className="font-black uppercase tracking-widest text-sm mb-1 text-white relative z-10">{title || "Location"}</h4>
        <p className="text-xs text-slate-400 mb-4 px-4 line-clamp-2 max-w-md relative z-10">{address}</p>
        <a 
          href={googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 relative z-10 border border-rose-500/20"
        >
          View on Google Maps <FaExternalLinkAlt className="text-[10px]" />
        </a>
        {loadError && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-900/50 rounded-2xl max-w-sm relative z-10 backdrop-blur-sm">
            <p className="text-[10px] text-rose-500 italic font-black uppercase tracking-widest mb-1">
              Google Maps Protocol Failure
            </p>
            <p className="text-[10px] text-slate-300 font-medium">
              {loadError.message?.includes('ExpiredKeyMapError') 
                ? "The Google Maps API key has expired. Please rotate the VITE_GOOGLE_MAPS_API_KEY in the cloud console." 
                : loadError.message || "Invalid or Expired API Key"}
            </p>
          </div>
        )}
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && !loadError && (
          <p className="text-[10px] text-slate-500 mt-4 italic relative z-10">Interactive map requires a Google Maps API key.</p>
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
            styles: darkMapStyles,
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
        <div className="w-full h-full bg-black flex flex-col items-center justify-center border border-slate-800 rounded-2xl p-4 text-center text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-slate-500/5 to-transparent pointer-events-none" />
           <FaMapMarkerAlt className="text-3xl text-slate-500 mb-2 animate-pulse relative z-10" />
           <p className="text-sm text-slate-300 relative z-10">Coordinates not available for this address.</p>
           <a 
             href={googleMapsUrl} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-xs text-rose-500 hover:text-rose-400 font-bold uppercase tracking-wider underline mt-2 relative z-10 block transition-colors"
           >
             Try searching on Google Maps
           </a>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
