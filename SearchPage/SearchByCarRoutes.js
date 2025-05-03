import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

import fetchPlaceID from '../fetchData/fetchPlaceID';
import getCoordinatesFromPlaceId from '../fetchData/getCoordinatesFromPlaceId';
import fetchWeatherForCurrentLocation from '../fetchData/fetchWeatherForCurrentLocation';
import fetchWeatherAlerts from '../fetchData/fetchWeatherAlerts';

export default function SearchByCarRoutes({ navigation, route }) {
  const { apiKey,
    city,
    destination,
    startDate,  
    endDate} = route.params;
  const mapRef = useRef(null);

  const [originData, setOriginData] = useState(null);
  const [destData, setDestData] = useState(null);
  const [originWeatherData, setOriginWeatherData] = useState(null);
  const [destWeatherData, setDestWeatherData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [travelTime, setTravelTime] = useState('');
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  useEffect(() => {
    async function loadOrigin() {
      try {
        const placeID = await fetchPlaceID(city, apiKey);
        const { latitude, longitude } = await getCoordinatesFromPlaceId(placeID, apiKey);
        setOriginData({ latitude, longitude });
        const weather = await fetchWeatherForCurrentLocation(latitude, longitude);
        setOriginWeatherData(weather);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', `Could not load data for ${city}`);
      }
    }
    loadOrigin();
  }, [city, apiKey]);

  useEffect(() => {
    async function loadDest() {
      try {
        const placeID = await fetchPlaceID(destination, apiKey);
        const { latitude, longitude } = await getCoordinatesFromPlaceId(placeID, apiKey);
        setDestData({ latitude, longitude });
        const weather = await fetchWeatherForCurrentLocation(latitude, longitude);
        setDestWeatherData(weather);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', `Could not load data for ${destination}`);
      }
    }
    loadDest();
  }, [destination, apiKey]);

  useEffect(() => {
    async function loadRoute() {
      if (!originData || !destData) return;
      try {
        const originStr = `${originData.latitude},${originData.longitude}`;
        const destStr = `${destData.latitude},${destData.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes.length > 0) {
          const decoded = polyline.decode(data.routes[0].overview_polyline.points);
          setRouteCoordinates(decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng })));
          setTravelTime(data.routes[0].legs[0].duration.text);
        } else {
          Alert.alert('No Route', 'Could not find a route between these locations.');
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load route information.');
      }
    }
    loadRoute();
  }, [originData, destData, apiKey]);

  
  useEffect(() => {
    async function loadAlerts() {
      if (!originData) return;
      try {
        const alerts = await fetchWeatherAlerts(destData.latitude, destData.longitude);
        console.log(alerts);
        setWeatherAlerts(alerts || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadAlerts();
  }, [originData]);

  
  useEffect(() => {
    if (routeCoordinates.length && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [routeCoordinates]);

   const handleNext = () => {
                  navigation.navigate('ActivitiesPlanningPage', {
                      apiKey,
                      city,
                      destination,
                      startDate,  
                      endDate,
                      srcLat: originData.latitude,
                      srcLong: originData.longitude,
                      destLat: destData.latitude,
                      destLong: destData.longitude
                  });

  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route from {city} to {destination}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: originData?.latitude ?? 33.6844,
            longitude: originData?.longitude ?? 73.0479,
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

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Travel Time</Text>
          <Text style={styles.infoText}>{travelTime || 'Calculating...'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Weather Report</Text>
          <WeatherCard cityName={city} weatherData={originWeatherData} />
          <WeatherCard cityName={destination} weatherData={destWeatherData} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Weather Alerts</Text>
          <WeatherStatusCard alerts={weatherAlerts} />
        </View>
      </ScrollView>

           <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>

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
        <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
        <Text style={styles.temperature}>{temperature}°C</Text>
      </View>
      <Text style={styles.weatherDescription}>{description}</Text>
    </View>
  );
}

function WeatherStatusCard({ alerts }) {
  const hasAlerts = Array.isArray(alerts) && alerts.length > 0;
  const message = hasAlerts
    ? alerts.map(a => a.title).join('\n\n')
    : 'No Warnings — weather is clear between locations';

  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusText}>{message}</Text>
      {hasAlerts && (
        <TouchableOpacity style={styles.statusButton} onPress={() => Alert.alert('Alert Details', alerts[0].description)}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}


const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF'},
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontFamily: 'Vilonti-Bold', color: '#091A41', flexShrink: 1 },
  scrollContent: { paddingBottom: 20, alignItems: 'center' },
  map: {
    width: width - 32,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  infoSection: { width: '90%', marginVertical: 10, alignItems: 'center' },
  
  infoLabel: { fontSize: 18, fontFamily: 'Vilonti-Bold', color: '#091A41', marginBottom: 8 },
  infoText: { fontSize: 24, fontFamily: 'Vilonti-Bold', color: '#004080' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
    marginBottom: 16,
  },
  cityName: { fontSize: 24, fontFamily: 'Vilonti-Bold', color: '#000' },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  weatherIcon: { width: 50, height: 50 },
  temperature: { fontSize: 24, fontFamily: 'Vilonti-Bold', marginLeft: 10, color: '#091A41' },
  weatherDescription: { fontSize: 16, fontFamily: 'Vilonti-Bold', color: '#091A41', marginTop: 8 },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  statusText: { flex: 1, fontSize: 16, fontFamily: 'Vilonti-Bold', color: '#091A41' },
  statusButton: {
    backgroundColor: '#091A41',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  nextButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#010F29',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
},
});
