/**
 * Geocoding utility for converting addresses to coordinates.
 * Falls back to OpenStreetMap (Nominatim) if Google Maps API key is unavailable.
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode an address string to { lat, lng } coordinates.
 * @param {string} address - The address to geocode.
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (address) => {
  if (!address) return null;

  try {
    // Attempt Nominatim (OpenStreetMap) - Free and no key required for low volume
    const response = await fetch(
      `${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
        throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to an address string.
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<string | null>}
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};
