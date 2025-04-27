const openWeatherApiKey = "ad9ea10e91ea23668766287fc992f20d";

export default async function fetchWeatherForCurrentLocation(latitude, longitude) {
  const request = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric`;

  const response = await fetch(request);
  const result = await response.json();

  console.log(result);
  return result;
}
