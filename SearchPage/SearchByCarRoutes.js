import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import fetchPlaceID from "../fetchData/fetchPlaceID";
import fetchWeatherForCurrentLocation from "../fetchData/fetchWeatherForCurrentLocation";
import getCoordinatesFromPlaceId from "../fetchData/getCoordinatesFromPlaceId";

export default function SearchByCarRoutes({ navigation, route }) {
  const { city, destination, apiKey } = route.params;

  const mapRef = useRef(null);
  const [destWeatherData, setDestWeatherData] = useState(null);
  const [originWeatherData, setOriginWeatherData] = useState(null);
  const [originData, setOriginData] = useState(null);
  const [destData, setDestData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [travelTime, setTravelTime] = useState('');

  useEffect(() => {
    async function fetchOriginWeatherData() {
      try {
        const placeID = await fetchPlaceID(city, apiKey);
        const { latitude, longitude } = await getCoordinatesFromPlaceId(placeID, apiKey);

        const weatherData = await fetchWeatherForCurrentLocation(latitude, longitude);
        setOriginWeatherData(weatherData);
        setOriginData({ latitude, longitude });
      } catch (err) {
        console.error("Origin weather fetch error:", err);
      }
    }
    fetchOriginWeatherData();
  }, [city, apiKey]);

  useEffect(() => {
    async function fetchDestWeatherData() {
      try {
        const placeID = await fetchPlaceID(destination, apiKey);
        const { latitude, longitude } = await getCoordinatesFromPlaceId(placeID, apiKey);

        const weatherData = await fetchWeatherForCurrentLocation(latitude, longitude);
        setDestWeatherData(weatherData);
        setDestData({ latitude, longitude });
      } catch (err) {
        console.error("Destination weather fetch error:", err);
      }
    }
    fetchDestWeatherData();
  }, [destination, apiKey]);

  useEffect(() => {
    async function fetchRoutePolyline() {
      if (!originData || !destData) return;

      try {
        const originStr = `${originData.latitude},${originData.longitude}`;
        const destStr = `${destData.latitude},${destData.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes.length) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoordinates(points);

          // Set dynamic travel time
          const durationText = data.routes[0].legs[0].duration.text;
          setTravelTime(durationText);
        } else {
          Alert.alert("No route found.");
        }
      } catch (err) {
        console.error("Route polyline error:", err);
      }
    }
    fetchRoutePolyline();
  }, [originData, destData, apiKey]);

  // Fit map to route when coordinates update
  useEffect(() => {
    if (routeCoordinates.length && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [routeCoordinates]);

  function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Info from {city} to {destination}</Text>
      </View>

      <Text style={styles.headerButton}>
        <Text style={styles.headerButtonText}>
          Have a look at the route you can take to get there!
        </Text>
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: originData?.latitude || 33.6844,
            longitude: originData?.longitude || 73.0479,
            latitudeDelta: 3,
            longitudeDelta: 3,
          }}
        >
          {originData && <Marker coordinate={originData} title="Origin" />}
          {destData && <Marker coordinate={destData} title="Destination" />}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#1E90FF"
              strokeWidth={4}
            />
          )}
        </MapView>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Voyon Time to Destination</Text>
        </View>
        <Text style={styles.infoText}>{travelTime || 'Calculating...'}</Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Voyon Weather Report</Text>
        </View>

        <WeatherCard cityName={city} weatherData={originWeatherData} />
        <WeatherCard cityName={destination} weatherData={destWeatherData} />

        <View style={styles.button}>
          <Text style={styles.buttonText}>Voyon Weather Alert</Text>
        </View>

        <WeatherStatusCard onPress={() => {}} />
      </ScrollView>
    </View>
  );
}

function WeatherCard({ cityName, weatherData }) {
  if (!weatherData) {
    return (
      <View style={styles.card}>
        <Text style={styles.cityName}>{cityName}</Text>
        <Text style={styles.temperature}>Loading...</Text>
      </View>
    );
  }

  const iconCode = weatherData.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const temperature = Math.round(weatherData.main.temp);
  const description = weatherData.weather[0].description;

  return (
    <View style={styles.card}>
      <Text style={styles.cityName}>{cityName}</Text>
      <View style={styles.weatherRow}>
        <Image source={{ uri: iconUrl }} style={{ width: 50, height: 50 }} />
        <Text style={styles.temperature}>{temperature}°C</Text>
      </View>
      <Text style={styles.weatherDescription}>{description}</Text>
    </View>
  );
}

function WeatherStatusCard({ onPress }) {
  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusText}>No Warnings, Weather is Clear between locations</Text>
      <TouchableOpacity style={styles.statusButton} onPress={onPress}>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Vilonti-Bold",
    color: '#091A41',
    flexShrink: 1,
  },
  headerButton: {
    marginTop: 10,
    marginHorizontal: 16,
    width: '90%',
    backgroundColor: '#091A41',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: "Vilonti-Bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  map: {
    width: '150%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  button: {
    width: 220,
    height: 60,
    marginTop: 20,
    backgroundColor: '#091A41',
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: "Vilonti-Bold",
  },
  infoText: {
    textAlign: 'center',
    fontFamily: "Vilonti-Bold",
    fontSize: 24,
    color: '#004080',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: 280,
    height: 150,
    alignSelf: 'center',
    marginVertical: 20,
  },
  cityName: {
    fontSize: 24,
    fontFamily: 'Vilonti-Bold',
    color: '#000000',
    marginBottom: 15,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 24,
    fontFamily: 'Vilonti-Bold',
    color: '#091A41',
    marginLeft: 10,
  },
  weatherDescription: {
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
    color: '#091A41',
    marginTop: 10,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
    color: '#091A41',
  },
  statusButton: {
    backgroundColor: '#091A41',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
