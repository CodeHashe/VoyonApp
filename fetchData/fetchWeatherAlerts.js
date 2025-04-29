const weatherbitApiKey = "6c3710ab00c54f9fb23a534b3530c527"; // Replace this with your real API key

export default async function fetchWeatherAlerts(latitude, longitude) {

  console.log(latitude, longitude);

  const url = `https://api.weatherbit.io/v2.0/alerts?lat=${latitude}&lon=${longitude}&key=${weatherbitApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Data from weatherbit: ", data);

    if (data.alerts && data.alerts.length > 0) {
      console.log("Weather Alerts:", data.alerts);
      return data.alerts; // Array of alert objects
    } else {
      console.log("No weather alerts found at this location.");
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch Weatherbit alerts:", error);
    return [];
  }
}
