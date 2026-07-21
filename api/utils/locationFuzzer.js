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
 * Helper to safely convert Mongoose documents or plain objects to plain JS objects.
 */
const toPlainObject = (item) => {
    if (!item) return item;
    if (typeof item.toObject === 'function') {
        return item.toObject();
    }
    if (item._doc) {
        return { ...item._doc };
    }
    return item;
};

/**
 * Iterates through an array of items and fuzzes their location.
 */
export const fuzzItemsLocation = (items) => {
    if (!items || !Array.isArray(items)) return items;
    
    return items.map(item => {
        const itemObj = toPlainObject(item);
        if (itemObj && itemObj.latitude !== undefined && itemObj.longitude !== undefined && itemObj.latitude !== null && itemObj.longitude !== null) {
            const { latitude, longitude } = fuzzLocation(itemObj.latitude, itemObj.longitude);
            return {
                ...itemObj,
                latitude,
                longitude,
                exactLocationHidden: true
            };
        }
        return itemObj;
    });
};

/**
 * Fuzzes a single item's location.
 */
export const fuzzSingleItemLocation = (item) => {
    if (!item) return item;
    const itemObj = toPlainObject(item);
    if (itemObj && itemObj.latitude !== undefined && itemObj.longitude !== undefined && itemObj.latitude !== null && itemObj.longitude !== null) {
        const { latitude, longitude } = fuzzLocation(itemObj.latitude, itemObj.longitude);
        return {
            ...itemObj,
            latitude,
            longitude,
            exactLocationHidden: true
        };
    }
    return itemObj;
};
