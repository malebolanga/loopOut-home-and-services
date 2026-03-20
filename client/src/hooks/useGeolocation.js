import { useState, useEffect } from 'react';

const useLocationCoords = () => {
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const fetchCityName = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            headers: {
              'Accept-Language': 'en'
            }
          }
        );
        const data = await response.json();
        const detectedCity = data.address.city || data.address.town || data.address.suburb || data.address.village || data.address.municipality;
        setCity(detectedCity);
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
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
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return { coords, city, error, loading };
};

export default useLocationCoords;
