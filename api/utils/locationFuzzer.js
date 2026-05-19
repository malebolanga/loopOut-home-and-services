/**
 * Fuzzes the latitude and longitude to protect exact locations.
 * Rounds to 2 decimal places, giving a precision of ~1.1km.
 * Adds a small random offset to prevent exact reverse engineering.
 */
export const fuzzLocation = (lat, lng) => {
    if (lat === undefined || lng === undefined || lat === null || lng === null) return { lat, lng };
    
    // 0.01 degrees is approx 1.11 km
    // We add a random offset between -0.005 and 0.005 to make it non-deterministic
    const offsetLat = (Math.random() - 0.5) * 0.01;
    const offsetLng = (Math.random() - 0.5) * 0.01;
    
    const fuzzedLat = parseFloat((lat + offsetLat).toFixed(2));
    const fuzzedLng = parseFloat((lng + offsetLng).toFixed(2));
    
    return {
        latitude: fuzzedLat,
        longitude: fuzzedLng
    };
};

/**
 * Iterates through an array of items and fuzzes their location.
 */
export const fuzzItemsLocation = (items) => {
    if (!items || !Array.isArray(items)) return items;
    
    return items.map(item => {
        if (item.latitude !== undefined && item.longitude !== undefined) {
            const { latitude, longitude } = fuzzLocation(item.latitude, item.longitude);
            return {
                ...item,
                latitude,
                longitude,
                exactLocationHidden: true
            };
        }
        return item;
    });
};

/**
 * Fuzzes a single item's location.
 */
export const fuzzSingleItemLocation = (item) => {
    if (!item) return item;
    if (item.latitude !== undefined && item.longitude !== undefined) {
        const { latitude, longitude } = fuzzLocation(item.latitude, item.longitude);
        const data = item._doc ? { ...item._doc } : { ...item };
        data.latitude = latitude;
        data.longitude = longitude;
        data.exactLocationHidden = true;
        return data;
    }
    return item._doc ? item._doc : item;
};
