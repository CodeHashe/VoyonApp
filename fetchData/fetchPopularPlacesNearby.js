/**
 * Fetches popular nearby places (tourist attractions + restaurants)
 * @param {number} lat           – Latitude of the center point
 * @param {number} lng           – Longitude of the center point
 * @param {string} apiKey        – Your Google Maps Web Services API key
 * @param {number} [radius=5000] – Search radius in meters (default: 5km)
 * @returns {Promise<Array>}     – Array of unique PlaceResult objects
 */
export default async function fetchPopularPlacesNearby(
  lat,
  lng,
  apiKey,
  radius = 5000
) {
  // The two types we care about
  const TYPES = ['tourist_attraction', 'restaurant'];
  const allResults = [];

  for (const type of TYPES) {
    // build the URL cleanly
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${lat},${lng}`);
    url.searchParams.append('radius', radius);
    url.searchParams.append('type', type);
    url.searchParams.append('key', apiKey);

    console.log(`Fetching ${type} near ${lat},${lng} (radius: ${radius})`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Places API error (${type}):`, errorText);
      throw new Error(`Google Places API returned ${res.status}`);
    }
    const { results = [] } = await res.json();
    console.log(`→ ${results.length} ${type.replace('_', ' ')} found`);
    allResults.push(...results);
  }

  // Dedupe by place_id
  const unique = Array.from(
    allResults.reduce((map, place) => {
      map.set(place.place_id, place);
      return map;
    }, new Map()).values()
  );

  console.log(`Total unique places: ${unique.length}`);
  return unique;
}
