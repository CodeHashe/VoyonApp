export default async function fetchLocationImage(placeID, apiKey){
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeID}?fields=photos&key=${apiKey}`
      );
  
      const result = await response.json();
  
      if (result.photos && result.photos.length > 0) {
        const photoRef = result.photos[0].name;
        return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${apiKey}`;
      } else {
        console.error("No photos found for place ID:", placeID);
        return null;
      }
    } catch (error) {
      console.error("Error fetching location image:", error);
      return null;
    }
  };