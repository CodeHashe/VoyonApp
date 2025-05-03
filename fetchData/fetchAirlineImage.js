const ninjaApiKey = "XFzkouJBwGwb6dtoLS2rNw==dtg2dKVq8aL2s2UI";

export default async function fetchAirlineImage(airlineName) {

  console.log("Fetching for airline: ", airlineName);

  try {
    const url = "https://api.api-ninjas.com/v1/airlines?name=" + encodeURIComponent(airlineName);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": ninjaApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text(); 
      console.error("API Error Response:", errorText);
      throw new Error(`API call failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(data[0]?.logo_url);

    if (data && data.length > 0) {
      return data[0].logo_url;
    } else {
      console.warn("API returned empty or invalid data:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching airline image:", error.message);
    return null;
  }
}
