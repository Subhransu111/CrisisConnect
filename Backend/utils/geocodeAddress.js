const axios = require('axios')

const geocodeAddress = async (address) => {
    try {
        if (!address) {
            throw new Error('Address is required for geocoding');
        }
        const res = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: address,
                format: "json",
                limit: 1,
            },
            headers: {
                "User-Agent": "CrisisConnect/1.0",
            },
            timeout: 5000,
        });

        if (!res.data || res.data.length === 0) {
            console.log("❌ [GEOCODE] Address not found:", address);
            throw new Error('Address not found. Please provide a valid address.');
        }

        const place = res.data[0];
        const coordinates = [Number(place.lon), Number(place.lat)]; // GeoJSON format: [longitude, latitude]

        console.log("✅ [GEOCODE] Address geocoded successfully:", {
            address,
            coordinates,
            displayName: place.display_name,
        });

        return coordinates;
    } catch (error) {
        console.error("❌ [GEOCODE] Geocoding error:", error.message);
        throw new Error(`Geocoding failed: ${error.message}`);
    }
};

module.exports= geocodeAddress;

