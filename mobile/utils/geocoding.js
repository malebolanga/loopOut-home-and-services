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
export const geocodeAddress = async (address, signal) => {
  if (!address) return null;

  try {
    // Attempt Nominatim (OpenStreetMap) - Free and no key required for low volume
    const response = await fetch(
      `${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { signal }
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

// Return the street and city/town in a compact, map-label-friendly format.
export const reverseGeocodeArea = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
    );
    if (!response.ok) return '';
    const data = await response.json();
    const address = data?.address || {};
    const city = address.city || address.town || address.village || address.municipality
      || address.city_district || address.county || address.state_district || '';
    const street = address.road || address.pedestrian || address.residential || '';
    const suburb = address.suburb || address.neighbourhood || address.quarter || '';
    const location = street ? [city, street] : [city, suburb || data.name || ''];
    const label = [...new Set(location.map((part) => String(part || '').trim()).filter(Boolean))].join(' ');
    if (label) return label;
    return String(data.display_name || '').split(',').map((part) => part.trim()).filter(Boolean).slice(0, 2).reverse().join(' ');
  } catch (error) {
    console.warn('Could not resolve GPS street and city:', error);
    return '';
  }
};
