export default async function fetchPopularPlacesNearby(lat, lng, apiKey) {
    const radius = 5000; 
    const type = "tourist_attraction"; 
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    return data.results || [];
  }
  