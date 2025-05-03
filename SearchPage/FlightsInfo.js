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
import { db } from '../Firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import {getAuth} from 'firebase/auth'

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
    infants,
    userEmail
  } = route.params;

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airlineImage, setAirlineImage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const logo = await fetchAirlineImage(airlineName);
        setAirlineImage(logo);
      } catch (err) {
        console.error('Logo fetch error:', err);
      }
    })();
  }, [airlineName]);

  useEffect(() => {
    (async () => {
      try {
        const tokenRes = await fetch(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=client_credentials&client_id=${amadeusApiKey}&client_secret=${amadeusClientSecret}`
          }
        );
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('No access_token in Amadeus response');
        const token = tokenData.access_token;

        let url = `https://test.api.amadeus.com/v2/shopping/flight-offers` +
          `?originLocationCode=${srcIATACode}` +
          `&destinationLocationCode=${destIATACode}` +
          `&departureDate=${startDate}` +
          `&adults=${adults}` +
          `&max=30`;

        if (children > 0) url += `&children=${children}`;
        if (infants > 0) url += `&infants=${infants}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.status !== 200) {
          const errDetail = data.errors?.[0]?.detail || 'Failed to fetch flights';
          throw new Error(errDetail);
        }

        setFlights(data.data || []);
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', error.message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [srcIATACode, destIATACode]);

  const saveFlight = async (flight) => {
    try {
      const auth = getAuth();
      const userEmail = auth.currentUser?.email;
  
      const sanitizedSegments = flight.itineraries[0].segments.map((segment) => ({
        departure: {
          iataCode: segment.departure.iataCode,
          at: segment.departure.at,
        },
        arrival: {
          iataCode: segment.arrival.iataCode,
          at: segment.arrival.at,
        },
        carrierCode: segment.carrierCode,
        number: segment.number,
        aircraft: {
          code: segment.aircraft?.code,
        },
        duration: segment.duration,
      }));
  
      await addDoc(collection(db, 'Routes'), {
        email: userEmail,
        airline: airlineName,
        source: city,
        destination: destination,
        sourceIATA: srcIATACode,
        destinationIATA: destIATACode,
        segments: sanitizedSegments,
        price: flight.price.total,
        currency: flight.price.currency,
        mode: "air"
      });
  
      Alert.alert('Saved!', 'Flight saved to your routes.');
    } catch (error) {
      console.error('Error saving flight:', error);
      Alert.alert('Error', 'Failed to save flight.');
    }
  };
  

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#010F29" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flights to {destination}</Text>
      </View>

      <View style={styles.centered}>
        <Text style={styles.airlineName}>{airlineName}</Text>
        {airlineImage && <Image source={{ uri: airlineImage }} style={styles.logo} />}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#010F29" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.flightList} contentContainerStyle={{ paddingBottom: 60 }}>
          {flights.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
              No flights found.
            </Text>
          ) : (
            flights.map((flight, idx) => {
              const segments = flight.itineraries[0].segments;

              return (
                <View style={styles.card} key={idx}>
                  <View style={[styles.cardContent, { justifyContent: 'space-between' }]}>
                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Vilonti-Bold' }}>
                      {segments.length === 1 ? 'Direct Flight' : 'Connecting Flight'}
                    </Text>
                    <TouchableOpacity onPress={() => saveFlight(flight)}>
                      <Ionicons name="add-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {segments.map((seg, segIdx) => {
                    const departure = new Date(seg.departure.at);
                    const arrival = new Date(seg.arrival.at);

                    const formatDate = (date) =>
                      date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

                    const formatTime = (date) =>
                      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                    return (
                      <View key={segIdx} style={[styles.cardContent, { marginTop: 8 }]}>
                        <View>
                          <Text style={styles.cardLabel}>From</Text>
                          <Text style={styles.cardTime}>{formatTime(departure)}</Text>
                          <Text style={styles.cardAirport}>{seg.departure.iataCode}</Text>
                          <Text style={styles.cardDate}>{formatDate(departure)}</Text>
                        </View>

                        {airlineImage && (
                          <Image source={{ uri: airlineImage }} style={styles.cardLogo} />
                        )}

                        <Ionicons name="airplane" size={20} color="white" />

                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.cardLabel}>To</Text>
                          <Text style={styles.cardTime}>{formatTime(arrival)}</Text>
                          <Text style={styles.cardAirport}>{seg.arrival.iataCode}</Text>
                          <Text style={styles.cardDate}>{formatDate(arrival)}</Text>
                        </View>
                      </View>
                    );
                  })}

                  <Text style={styles.priceTag}>
                    {flight.price.total} {flight.price.currency}
                  </Text>
                </View>
              );
            })
          )}
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
  cardDate: {
    color: '#fff', fontSize: 12, fontFamily: 'Vilonti-Regular', marginTop: 4
  },
  cardLogo: {
    width: 40,
    height: 20,
    resizeMode: 'contain'
  },
  priceTag: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
    textAlign: 'right',
    marginTop: 10
  }
});