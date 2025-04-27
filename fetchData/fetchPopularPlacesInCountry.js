const fetchPopularPlacesInCountry = async (countryName, apiKey) => {

    console.log("Received Country Name: ", countryName);

    try {
      const url = "https://places.googleapis.com/v1/places:searchText";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.photos,places.location",
        },
        body: JSON.stringify({
          textQuery: `city landmarks in ${countryName}`,
          maxResultCount: 20,
        }),
      });
  
      const data = await response.json();

      console.log("Data Received: ", data);
  
      if (data?.places) {
        return data.places;
      } else {
        console.warn("Places API Error or empty response:", data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching popular places:", error);
      return [];
    }
  };
  
  export default fetchPopularPlacesInCountry;
  