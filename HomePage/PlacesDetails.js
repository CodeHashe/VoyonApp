import { View, StyleSheet, Image, Text, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import fetchPlacesDetails from "../fetchData/fetchPlacesDetails"; 
import fetchWeatherForCurrentLocation from "../fetchData/fetchWeatherForCurrentLocation";
import fetchWikiSummary from "../fetchData/fetchWikiSummary";
import InfoCards from "./InfoCards"; 

export default function PlaceDetails({ route, navigation }) {
  const { placeID, apiKey } = route.params;
  const [placeDetails, setPlaceDetails] = useState(null);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [description, setDescription] = useState(""); 

  useEffect(() => {
    async function getPlaceDetails() {
      const data = await fetchPlacesDetails(placeID, apiKey);
      setPlaceDetails(data);
    }
    getPlaceDetails();
  }, [placeID, apiKey]);

  useEffect(() => {
    async function getWeatherDetails() {
      if (placeDetails?.location?.latitude && placeDetails?.location?.longitude) {
        const weatherData = await fetchWeatherForCurrentLocation(
          placeDetails.location.latitude,
          placeDetails.location.longitude
        );
        setWeatherDetails(weatherData);
      }
    }
    getWeatherDetails();
  }, [placeDetails]);

  useEffect(() => {
    async function getWikiSummary() {
      if (placeDetails?.displayName?.text) {
        let summary = await fetchWikiSummary(placeDetails.displayName.text);
  
        if (!summary) {
          const city = placeDetails?.formattedAddress?.split(",")[1]?.trim();
          summary = `${placeDetails.displayName.text} is a place located in ${city ? city : "this area"}.`;
        }
  
        setDescription(summary);
      }
    }
    getWikiSummary();
  }, [placeDetails]);

  if (!placeDetails) {
    return <Text>Loading...</Text>;
  }

  const name = placeDetails.displayName?.text;
  const imageReference = placeDetails.photos?.[0]?.name;
  const latitude = placeDetails.location?.latitude;
  const longitude = placeDetails.location?.longitude;
  const openingHours = placeDetails.regularOpeningHours?.weekdayDescriptions;
  const imageUrl = imageReference
    ? `https://places.googleapis.com/v1/${imageReference}/media?maxWidthPx=400&key=${apiKey}`
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Overview</Text>
      </View>

      <Text style={styles.placeName}>{name}</Text>

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{description || "No description available."}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        {latitude && longitude && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude, longitude }} title={name} />
          </MapView>
        )}
      </View>

      <View style={styles.infoCards}>
        <InfoCards openingHours={openingHours} />

        {weatherDetails && (
          <View style={styles.weatherCard}>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${weatherDetails.weather[0].icon}@2x.png` }}
              style={styles.weatherIcon}
            />
            <Text style={styles.tempText}>
              {Math.round(weatherDetails.main.temp)}°C
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    marginTop:40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily:"Vilonti-Bold",
    color: "#555",
  },
  placeName: {
    fontSize: 28,
    fontFamily: "Vilonti-Bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#111",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    backgroundColor: "#001F54",
    color: "#fff",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    fontSize: 18,
    fontFamily:"Vilonti-Bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
    fontFamily:"Vilonti-Bold"
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 30,
    marginTop: 10,
  },
  infoCards: {
    flexDirection: "row",
    fontFamily:"Vilonti-Bold",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 90,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardText: {
    fontSize: 14,
    fontFamily: "Vilonti-Bold",
    textAlign: "center",
    marginTop: 5,
  },

  weatherCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    alignItems: "center",
    width: 90,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  weatherIcon: {
    width: 40,
    height: 40,
  },
  tempText: {
    color: '#333',
    fontSize: 18,
    fontFamily:"Vilonti-Bold",
    marginTop: 5,
  },
});
