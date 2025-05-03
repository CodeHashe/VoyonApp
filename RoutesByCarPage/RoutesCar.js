import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, 
  Alert, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

import fetchWeatherForCurrentLocation from '../fetchData/fetchWeatherForCurrentLocation';
import fetchWeatherAlerts from '../fetchData/fetchWeatherAlerts';

import { getAuth } from 'firebase/auth';
import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import app from '../Firebase/firebaseConfig';

const auth = getAuth(app);
const db   = getFirestore(app);

export default function RoutesCar({ navigation, route }) {
  const { apiKey, from: fromParam, to: toParam } = route.params;

  const mapRef = useRef(null);

  const [city, setCity] = useState('');
  const [destination, setDestination] = useState('');
  const [originData, setOriginData] = useState(null);
  const [destData, setDestData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [travelTime, setTravelTime] = useState('');
  const [originWeatherData, setOriginWeatherData] = useState(null);
  const [destWeatherData, setDestWeatherData] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRouteByCities() {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }

        const routesRef = collection(db, 'Routes');
        const q = query(
          routesRef,
          where('from', '==', fromParam),
          where('to',   '==', toParam),
          where('email','==', user.email)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          Alert.alert('No route found', `No saved route from ${fromParam} to ${toParam}.`);
          return;
        }

        
        const data = snap.docs[0].data();
        setCity(data.from);
        setDestination(data.to);
        setOriginData({ latitude: data.originLat, longitude: data.originLong });
        setDestData({ latitude: data.destLat,   longitude: data.destLong });
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load route data.');
      }
    }
    loadRouteByCities();
  }, [fromParam, toParam]);

  
  useEffect(() => {
    async function loadExtras() {
      if (!originData || !destData) return;
      try {
        const [ow, dw] = await Promise.all([
          fetchWeatherForCurrentLocation(originData.latitude, originData.longitude),
          fetchWeatherForCurrentLocation(destData.latitude,   destData.longitude),
        ]);
        setOriginWeatherData(ow);
        setDestWeatherData(dw);


        const originStr = `${originData.latitude},${originData.longitude}`;
        const destStr   = `${destData.latitude},${destData.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;
        const res  = await fetch(url);
        const json = await res.json();
        if (json.routes?.length) {
          const pts = polyline
            .decode(json.routes[0].overview_polyline.points)
            .map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
          setRouteCoordinates(pts);
          setTravelTime(json.routes[0].legs[0].duration.text);
        }

        const alerts = await fetchWeatherAlerts(destData.latitude, destData.longitude);
        setWeatherAlerts(alerts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadExtras();
  }, [originData, destData, apiKey]);

  // 3️⃣ Fit map view
  useEffect(() => {
    if (routeCoordinates.length && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top:50, right:50, bottom:50, left:50 },
        animated: true,
      });
    }
  }, [routeCoordinates]);


  if (loading || !originData || !destData) {
    return (
      <ActivityIndicator
        size="large"
        color="#1E90FF"
        style={{ flex:1, justifyContent:'center' }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Route from {city} → {destination}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude:  originData.latitude,
            longitude: originData.longitude,
            latitudeDelta:  Math.abs(destData.latitude - originData.latitude)  * 1.5 || 0.05,
            longitudeDelta: Math.abs(destData.longitude - originData.longitude) * 1.5 || 0.05,
          }}
        >
          <Marker coordinate={originData} title="Origin" />
          <Marker coordinate={destData}   title="Destination" />
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
          <Text style={styles.infoText}>{travelTime}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Weather</Text>
          <WeatherCard   cityName={city}       weatherData={originWeatherData} />
          <WeatherCard   cityName={destination} weatherData={destWeatherData} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Weather Alerts</Text>
          <WeatherStatusCard alerts={weatherAlerts} />
        </View>

      </ScrollView>
    </View>
  );
}

// ─── WeatherCard & WeatherStatusCard ─────────────────────────────────────────

function WeatherCard({ cityName, weatherData }) {
  if (!weatherData) {
    return (
      <View style={styles.card}>
        <Text style={styles.cityName}>{cityName}</Text>
        <Text>Loading…</Text>
      </View>
    );
  }
  const iconCode   = weatherData.weather[0].icon;
  const iconUrl    = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const temperature = Math.round(weatherData.main.temp);
  const description = weatherData.weather[0].description;

  return (
    <View style={styles.card}>
      <Text style={styles.cityName}>{cityName}</Text>
      <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
      <Text style={styles.temperature}>{temperature}°C</Text>
      <Text style={styles.weatherDescription}>{description}</Text>
    </View>
  );
}

function WeatherStatusCard({ alerts }) {
  const hasAlerts = Array.isArray(alerts) && alerts.length > 0;
  const message   = hasAlerts
    ? alerts.map(a => a.title).join('\n\n')
    : 'No Alerts — clear between endpoints';

  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusText}>{message}</Text>
      {hasAlerts && (
        <TouchableOpacity style={styles.statusButton} onPress={() => Alert.alert('Details', alerts[0].description)}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header:    { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton:{ padding: 8, marginRight: 8 },
  headerTitle:{ fontSize: 18, fontFamily: 'Vilonti-Bold' },

  scrollContent:{ paddingBottom: 20, alignItems: 'center' },
  map:          { width: width - 32, height: 200, borderRadius: 16, marginBottom: 16 },

  infoSection: { width: '90%', marginVertical: 10, alignItems: 'center' },
  infoLabel:   { fontSize: 16, fontFamily: 'Vilonti-Bold' },
  infoText:    { fontSize: 20, fontFamily: 'Vilonti-Bold' },

  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  cityName:           { fontSize: 16, fontFamily: 'Vilonti-Bold' },
  weatherIcon:        { width: 50, height: 50, marginVertical: 4 },
  temperature:        { fontSize: 20, fontFamily: 'Vilonti-Bold' },
  weatherDescription: { fontSize: 14 },

  statusCard:   {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  statusText:   { flex: 1 },
  statusButton: {
    backgroundColor: '#091A41',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },

  saveButton:  {
    backgroundColor: '#1E90FF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  saveText:    { color: '#FFF', fontFamily: 'Vilonti-Bold' },
});
