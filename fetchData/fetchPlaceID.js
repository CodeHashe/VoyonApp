const fetchPlaceID = async (placeName, apiKey) => {
    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey, // ✅ Correct way to send API key
            "X-Goog-FieldMask": "places.id", // ✅ Optimize response
          },
          body: JSON.stringify({
            textQuery: placeName, // ✅ Correct request payload
          }),
        }
      );
  
      const result = await response.json();
  
      if (result.places && result.places.length > 0) {
        return result.places[0].id; // ✅ Correct way to extract Place ID
      } else {
        console.error("No place found for:", placeName);
        return null;
      }
    } catch (error) {
      console.error("Error fetching Place ID:", error);
      return null;
    }
  };