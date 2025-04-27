export default async function fetchPlacesDetails(placeID, apiKey) {
    try {
      const url = "https://places.googleapis.com/v1/places/" + placeID;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
         "X-Goog-FieldMask": "id,displayName,photos,location,regularOpeningHours,shortFormattedAddress"
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return data; // returning full place object
      } else {
        console.warn("Places API Error:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }
  