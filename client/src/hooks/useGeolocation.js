import { useCallback, useEffect, useState } from 'react';
import { calculateDistance, POLOKWANE_COORDS } from '../utils/locationUtils';

const useLocationCoords = () => {
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const fetchCityName = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (response.ok) {
          const data = await response.json();
          const detectedCity = data.city || data.locality || data.principalSubdivision || data.localityInfo?.administrative?.[2]?.name;
          if (detectedCity) {
            setCity(detectedCity);
            return;
          }
        }
      } catch {
        // Silently proceed to proximity fallback
      }

      // Proximity fallback: check if coordinates are within Limpopo / Polokwane area
      const distToPolokwane = calculateDistance(lat, lon, POLOKWANE_COORDS.latitude, POLOKWANE_COORDS.longitude);
      if (distToPolokwane <= 60) {
        setCity('Polokwane');
      } else {
        setCity('Current Area');
      }
    };

    const onSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });
      fetchCityName(latitude, longitude).finally(() => setLoading(false));
    };

    const onError = (error) => {
      setError(error.message);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { coords, city, error, loading, requestLocation };
};

export default useLocationCoords;
