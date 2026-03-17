// Polokwane, Limpopo center coordinates
export const POLOKWANE_COORDS = {
  latitude: -23.8962,
  longitude: 29.4486
};

/**
 * Calculates the Haversine distance between two points on the Earth's surface.
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Filters and ranks items based on distance tiers.
 * @param {Array} items - List of items (listings, services, etc.)
 * @param {Object} userCoords - User's current coordinates {latitude, longitude}
 * @param {number} radius - Maximum radius in km
 * @returns {Array} - Filtered and sorted items
 */
export const filterByDistanceTier = (items, userCoords, radius = Infinity) => {
  if (!userCoords || !userCoords.latitude || !userCoords.longitude) return items;

  return items
    .map(item => {
      // Prioritize items with exact coordinates
      if (item.latitude && item.longitude) {
        const dist = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          item.latitude,
          item.longitude
        );
        return { ...item, _distance: dist };
      }

      // Fallback for items without coordinates: 
      // check if address/description contains "Polokwane" or "Limpopo"
      const lowerAddr = (item.address || item.location || "").toLowerCase();
      const lowerDesc = (item.description || "").toLowerCase();
      const lowerNear = (item.near || "").toLowerCase();
      
      const isPolokwane = 
        lowerAddr.includes("polokwane") || 
        lowerDesc.includes("polokwane") ||
        lowerNear.includes("polokwane");

      // Give string matches a "virtual distance" to rank them near the top but after coordinate matches
      if (isPolokwane) {
        return { ...item, _distance: 5.1 }; // Just outside a typical 5km center radius
      }

      return { ...item, _distance: Infinity };
    })
    .filter(item => item._distance <= radius)
    .sort((a, b) => a._distance - b._distance);
};

export const DISTANCE_TIERS = {
  POLOKWANE: 10,  // Within Polokwane (10km)
  NEARBY: 50,     // Within 50km
  REGIONAL: 100,  // Within 100km
  EVERYWHERE: Infinity
};
