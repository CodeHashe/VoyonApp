import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import fetchAirlineImage from '../fetchData/fetchAirlineImage';

export default function SearchByAirFlights({ navigation, route }) {
  const {
    apiKey,
    clientSecret,
    googleApiKey,
    city,
    destination,
    startDate,
    endDate,
    adults,
    children,
    infants
  } = route.params;

  const [srcCoords, setSrcCoords] = useState({ lat: null, long: null });
  const [destCoords, setDestCoords] = useState({ lat: null, long: null });
  const [originIATA, setOriginIATA] = useState('');
  const [destIATA, setDestIATA] = useState('');
  const [directFlights, setDirectFlights] = useState([]);
  const [connectingFlights, setConnectingFlights] = useState([]);
  const [bestOffers, setBestOffers] = useState([]);
  const [carriers, setCarriers] = useState({});
  const [airlineImages, setAirlineImages] = useState({});
  const [loading, setLoading] = useState(true);

  async function authorizeAmadeus(key, secret) {
    const body = `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`;
    const res = await fetch(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      }
    );
    return (await res.json()).access_token;
  }

  async function getNearestAirportIATA(lat, lon, token) {
    const res = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${lat}&longitude=${lon}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    return json.data?.[0]?.iataCode;
  }

  async function getCityCoordinates(name, key) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(name)}&key=${key}`
    );
    const json = await res.json();
    if (json.results?.length) return json.results[0].geometry.location;
    throw new Error(`Could not geocode city: ${name}`);
  }

  async function fetchFlights(token, origin, dest) {
    const url =
      `https://test.api.amadeus.com/v2/shopping/flight-offers` +
      `?originLocationCode=${origin}` +
      `&destinationLocationCode=${dest}` +
      `&departureDate=${startDate}` +
      `&adults=${adults}` +
      `&currencyCode=USD&max=20`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    return {
      flights: json.data || [],
      carriers: json.dictionaries?.carriers || {}
    };
  }

  function categorizeFlights(all) {
    const direct = all.filter(f => f.itineraries.every(i => i.segments.length === 1));
    const connecting = all.filter(f => f.itineraries.some(i => i.segments.length > 1));
    const best = all.slice(0, 3);
    return { direct, connecting, best };
  }

  async function loadAirlineImages(flights, carriersDict) {
    if (!flights || !carriersDict) return;
    const codes = new Set();
    flights.forEach(f =>
      f.itineraries.forEach(i =>
        i.segments.forEach(s => codes.add(s.carrierCode))
      )
    );
    const map = {};
    await Promise.all(
      [...codes].map(async code => {
        const name = carriersDict[code];
        if (!name) return;
        const url = await fetchAirlineImage(name);
        if (url) map[code] = url;
      })
    );
    setAirlineImages(map);
  }

  useEffect(() => {
    (async () => {
      try {
        // 1) Location & origin airport
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location is required.');
          navigation.navigate('ActivitiesPlanningPage');
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync();
        setSrcCoords({ lat: coords.latitude, long: coords.longitude });

        // 2) Auth & IATAs
        const token = await authorizeAmadeus(apiKey, clientSecret);
        const origin = await getNearestAirportIATA(coords.latitude, coords.longitude, token);
        setOriginIATA(origin);

        const { lat, lng } = await getCityCoordinates(destination, googleApiKey);
        setDestCoords({ lat, long: lng });
        const dest = await getNearestAirportIATA(lat, lng, token);
        console.log("Destination: ", dest);
        setDestIATA(dest);

        // 3) Fetch flights
        const { flights: allFlights, carriers: carriersDict } = await fetchFlights(token, origin, dest);

        if (allFlights.length === 0) {
          navigation.replace('ActivitiesPlanningPage', {
            apiKey: googleApiKey,
            city,
            destination,
            startDate,
            endDate,
            srcLat: coords.latitude,
            srcLong: coords.longitude,
            destLat: lat,
            destLong: lng
          });
          return;
        }

        // 4) Categorize + logos
        const { direct, connecting, best } = categorizeFlights(allFlights);
        setDirectFlights(direct);
        setConnectingFlights(connecting);
        setBestOffers(best);
        setCarriers(carriersDict);
        await loadAirlineImages(allFlights, carriersDict);
      } catch (err) {
        Alert.alert('Error', err.message, [
          { text: 'OK', onPress: () => navigation.navigate('ActivitiesPlanningPage') }
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const extractCodes = list =>
    [...new Set(list.flatMap(f => f.itineraries.flatMap(i => i.segments.map(s => s.carrierCode))))];

  const handlePress = (airlineCode, airlineName) => {
    navigation.navigate('FlightsInfo', {
      city,
      destination,
      amadeusApiKey: apiKey,
      amadeusClientSecret: clientSecret,
      airlineName,
      airlineIATACode: airlineCode,
      srcIATACode: originIATA,
      destIATACode: destIATA,
      startDate,
      endDate,
      adults,
      children,
      infants
    });
  };

  const renderCard = code => (
    <TouchableOpacity
      key={code}
      style={styles.card}
      onPress={() => handlePress(code, carriers[code])}
    >
      {airlineImages[code] && (
        <Image source={{ uri: airlineImages[code] }} style={styles.cardLogo} />
      )}
      <Text style={styles.cardText}>{carriers[code] || code}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#010F29" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { marginTop: 20 }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flights to {destination}</Text>
      </View>

      {/* Flights */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {['Direct', 'Connecting', 'Best Offers'].map((title, idx) => {
          const list = idx === 0 ? directFlights : idx === 1 ? connectingFlights : bestOffers;
          return (
            <View key={title}>
              <Text style={styles.sectionTitle}>
                {title} Flights to {destination}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {extractCodes(list).map(renderCard)}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() =>
          navigation.navigate('ActivitiesPlanningPage', {
            apiKey: googleApiKey,
            city,
            destination,
            startDate,
            endDate,
            srcLat: srcCoords.lat,
            srcLong: srcCoords.long,
            destLat: destCoords.lat,
            destLong: destCoords.long
          })
        }
      >
        <Text style={styles.skipText}>Skip to Activities Planning</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontFamily: 'Vilonti-Bold',
    color: '#333'
  },
  container: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
    color: '#010F29',
    marginTop: 16,
    marginBottom: 8
  },
  card: {
    width: 100,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3
  },
  cardLogo: { width: 60, height: 30, marginBottom: 8 },
  cardText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#010F29',
    fontFamily: 'Vilonti-Medium'
  },
  skipButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#010F29',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Vilonti-Bold'
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
