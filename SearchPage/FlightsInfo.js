import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import fetchAirlineImage from '../fetchData/fetchAirlineImage';

export default function FlightsInfo({ navigation, route }) {
  const {
    city,
    destination,
    amadeusApiKey,
    amadeusClientSecret,
    airlineName,
    airlineIATACode,
    srcIATACode,
    destIATACode,
    startDate,
    endDate,
    adults,
    children,
    infants
  } = route.params;

  console.log(route.params);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airlineImage, setAirlineImage] = useState(null);

  // Load airline logo
  useEffect(() => {
    (async () => {
      console.log('FlightsInfo: fetching logo for', airlineName);
      try {
        const logo = await fetchAirlineImage(airlineName);
        console.log('FlightsInfo: logo URL:', logo);
        setAirlineImage(logo);
      } catch (err) {
        console.error('FlightsInfo: logo error:', err);
      }
    })();
  }, [airlineName]);

  useEffect(() => {
    (async () => {
      console.log(
        `FlightsInfo: searching flights from ${srcIATACode} to ${destIATACode}`,
        { startDate, endDate, adults, children, infants }
      );
      try {
        // 1️⃣ Get OAuth token
        const tokenRes = await fetch(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=client_credentials&client_id=${amadeusApiKey}&client_secret=${amadeusClientSecret}`
          }
        );
        const tokenData = await tokenRes.json();
        console.log('FlightsInfo: token response', tokenData);
        if (!tokenData.access_token) {
          throw new Error('No access_token in Amadeus response');
        }
        const token = tokenData.access_token;

        let url = `https://test.api.amadeus.com/v2/shopping/flight-offers` +
          `?originLocationCode=${srcIATACode}` +
          `&destinationLocationCode=${destIATACode}` +
          `&departureDate=${startDate}` +
          `&adults=${adults}` +
          `&children=${children}` +
          `&infants=${infants}` +
          `&max=10`;
        // if round-trip
        if (endDate) {
          url += `&returnDate=${endDate}`;
        }
        console.log('FlightsInfo: calling URL:', url);

        // 3️⃣ Fetch offers
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('FlightsInfo: offers response:', data);

        if (res.status !== 200) {
          const errDetail = data.errors?.[0]?.detail || 'Failed to fetch flights';
          throw new Error(errDetail);
        }

        // 4️⃣ Filter by airline
        const filtered =
          data.data?.filter(offer =>
            offer.itineraries.some(it =>
              it.segments.some(s => s.carrierCode === airlineIATACode)
            )
          ) || [];
        console.log(`FlightsInfo: ${filtered.length} flights after filtering`);
        setFlights(filtered);
      } catch (error) {
        console.error('FlightsInfo: fetch error:', error);
        Alert.alert('Error', error.message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [airlineIATACode, srcIATACode, destIATACode]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#010F29" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flights to {destination}</Text>
      </View>

      {/* Airline Info */}
      <View style={styles.centered}>
        <Text style={styles.airlineName}>{airlineName}</Text>
        {airlineImage && <Image source={{ uri: airlineImage }} style={styles.logo} />}
      </View>

      {/* Flights List */}
      {loading ? (
        <ActivityIndicator size="large" color="#010F29" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.flightList} contentContainerStyle={{ paddingBottom: 60 }}>
          {flights.map((flight, idx) => {
            const seg = flight.itineraries[0].segments[0];
            const time = new Date(seg.departure.at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            console.log(`Flight ${idx}: ${seg.departure.iataCode} @ ${time}`);
            return (
              <View style={styles.card} key={idx}>
                <View style={styles.cardContent}>
                  <View>
                    <Text style={styles.cardLabel}>Departure</Text>
                    <Text style={styles.cardTime}>{time} PKT</Text>
                    <Text style={styles.cardAirport}>{seg.departure.iataCode}</Text>
                  </View>
                  {airlineImage && (
                    <Image source={{ uri: airlineImage }} style={styles.cardLogo} />
                  )}
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontFamily: 'Vilonti-Bold',
    color: '#010F29'
  },
  centered: {
    alignItems: 'center',
    marginVertical: 12
  },
  airlineName: {
    fontSize: 20,
    fontFamily: 'Vilonti-Bold',
    color: '#010F29'
  },
  logo: {
    height: 80,
    resizeMode: 'contain',
    marginVertical: 8
  },
  flightList: {
    paddingHorizontal: 16
  },
  card: {
    backgroundColor: '#010F29',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLabel: {
    color: '#fff', fontSize: 12, fontFamily: 'Vilonti-Regular'
  },
  cardTime: {
    color: '#fff', fontSize: 16, fontFamily: 'Vilonti-Bold'
  },
  cardAirport: {
    color: '#fff', fontSize: 12, fontFamily: 'Vilonti-Regular'
  },
  cardLogo: {
    width: 40,
    height: 20,
    resizeMode: 'contain'
  }
});
