export default async function getCoordinatesFromPlaceId(placeId, googleApiKey) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${googleApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("Data fetched: ", data);

    if (data.result && data.result.geometry && data.result.geometry.location) {
        const { lat, lng } = data.result.geometry.location;
        return { latitude: lat, longitude: lng };
    } else {
        throw new Error('No geometry data found for place ID.');
    }
}