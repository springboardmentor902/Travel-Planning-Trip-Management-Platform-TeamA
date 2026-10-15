const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const BASE_URL = 'https://api.mapbox.com';

// ============================================================
// GEOCODING — Address to coordinates
// ============================================================
export const geocodeAddress = async (address) => {
    try {
        const encoded = encodeURIComponent(address);
        const url = `${BASE_URL}/geocoding/v5/mapbox.places/`
            + `${encoded}.json`
            + `?access_token=${MAPBOX_TOKEN}`
            + `&country=in`
            + `&limit=5`
            + `&language=en`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.features || data.features.length === 0) {
            return [];
        }

        return data.features.map(f => ({
            placeId:  f.id,
            name:     f.text,
            address:  f.place_name,
            lat:      f.center[1],
            lng:      f.center[0],
            category: f.properties?.category || null,
            mapboxUrl: `https://www.mapbox.com/`
                + `maps/?query=${f.center[1]},${f.center[0]}`,
        }));

    } catch (err) {
        console.error('Geocoding failed:', err);
        return [];
    }
};

// ============================================================
// SEARCH PLACES — Text search
// ============================================================
export const searchPlaces = async (query, proximity = null) => {
    try {
        const encoded = encodeURIComponent(query);
        let url = `${BASE_URL}/geocoding/v5/mapbox.places/`
            + `${encoded}.json`
            + `?access_token=${MAPBOX_TOKEN}`
            + `&country=in`
            + `&limit=10`
            + `&language=en`
            + `&types=poi,place,address`;

        if (proximity) {
            url += `&proximity=${proximity.lng},${proximity.lat}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!data.features) return [];

        return data.features.map(f => ({
            placeId:  f.id,
            name:     f.text,
            address:  f.place_name,
            lat:      f.center[1],
            lng:      f.center[0],
            category: f.properties?.category || null,
            landmark: f.properties?.landmark || false,
            maki:     f.properties?.maki || 'marker',
        }));

    } catch (err) {
        console.error('Place search failed:', err);
        return [];
    }
};

// ============================================================
// CATEGORY SEARCH — Restaurants, Hotels etc
// ============================================================
export const searchByCategory = async (
    category, destination) => {
    const query = `${category} in ${destination}`;
    return searchPlaces(query);
};

// ============================================================
// STATIC MAP IMAGE URL
// ============================================================
export const getStaticMapUrl = (
    lat, lng, zoom = 14, width = 600, height = 300) => {
    return `${BASE_URL}/styles/v1/mapbox/streets-v12/static/`
        + `pin-s+ff0000(${lng},${lat})/`
        + `${lng},${lat},${zoom}/`
        + `${width}x${height}`
        + `?access_token=${MAPBOX_TOKEN}`;
};

// ============================================================
// DESTINATION THUMBNAIL
// ============================================================
export const getDestinationMapUrl = (
    destination, width = 400, height = 200) => {
    const encoded = encodeURIComponent(destination);
    return `${BASE_URL}/styles/v1/mapbox/streets-v12/static/`
        + `${encoded}/`
        + `${width}x${height}`
        + `?access_token=${MAPBOX_TOKEN}`;
};