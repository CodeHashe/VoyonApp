const ninjaApiKey = "XFzkouJBwGwb6dtoLS2rNw==dtg2dKVq8aL2s2UI";

export default async function fetchAirlineImage(airlineName){
    try {
        const url = "https://api.api-ninjas.com/v1/airlines?name=" + airlineName;
        const response = await fetch(url, {
          method: "POST",
          headers: {
           "X-Api-Key": ninjaApiKey
          },
        });
    
        const data = await response.json();

        console.log(data[0].logo_url);
    
        if (data) {
          return data[0].logo_url;
        } else {
          console.warn("Api Returned an Error", data);
          return [];
        }
      } catch (error) {
        console.error("Error fetching airlineImage:", error);
        return [];
      }  
}