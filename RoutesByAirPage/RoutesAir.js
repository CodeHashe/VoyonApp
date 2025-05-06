import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import app from '../Firebase/firebaseConfig';
import fetchAirlineImage from '../fetchData/fetchAirlineImage';

const db = getFirestore(app);
const auth = getAuth(app);
const GOOGLE_API_KEY = "AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w";

export default function RoutesAir({ navigation, route }) {
  const { origin, destination } = route.params;
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = auth.currentUser.email;

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const q = query(
          collection(db, 'Routes'),
          where('email', '==', userEmail),
          where('source', '==', origin),
          where('destination', '==', destination)
        );
        const snap = await getDocs(q);

        const results = await Promise.all(
          snap.docs.map(async docSnap => {
            const data = docSnap.data();
            // fetch images
            const [fromImg, toImg, airlineLogo] = await Promise.all([
              fetchCityPhoto(data.source),
              fetchCityPhoto(data.destination),
              fetchAirlineImage(data.airline),
            ]);
            // sanitize segments as before...
            const segments = Array.isArray(data.segments)
              ? data.segments
                  .map(seg => {
                    if (
                      !seg?.departure?.iataCode ||
                      !seg?.arrival?.iataCode ||
                      !seg?.carrierCode ||
                      !seg?.number
                    ) return null;
                    return {
                      departure: {
                        iataCode: seg.departure.iataCode,
                        at: seg.departure.at || '',
                      },
                      arrival: {
                        iataCode: seg.arrival.iataCode,
                        at: seg.arrival.at || '',
                      },
                      carrierCode: seg.carrierCode,
                      number: seg.number,
                      aircraft: { code: seg.aircraft?.code || '' },
                      duration: seg.duration || '',
                    };
                  })
                  .filter(Boolean)
              : [];

            return {
              id: docSnap.id,
              source: data.source,
              destination: data.destination,
              airline: data.airline,
              currency: data.currency,
              price: data.price,
              segments,
              fromImg,
              toImg,
              airlineLogo,
            };
          })
        );

        setRoutes(results);
      } catch (err) {
        console.error('Error fetching routes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [userEmail, origin, destination]);

  const fetchCityPhoto = async cityName => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${cityName}&inputtype=textquery&fields=photos&key=${GOOGLE_API_KEY}`
      );
      const json = await res.json();
      const cand = json.candidates?.[0];
      if (cand?.photos?.length) {
        const ref = cand.photos[0].photo_reference;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${GOOGLE_API_KEY}`;
      }
    } catch (e) {
      console.error('City photo error:', e);
    }
    return '';
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#091A41" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#091A41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {origin} → {destination}
        </Text>
      </View>

      {routes.length === 0 ? (
        <Text style={styles.noRoutes}>No saved air routes.</Text>
      ) : (
        routes.map((route, idx) => (
          <View key={route.id} style={styles.routeCard}>
            <View style={styles.imageRow}>
              {route.fromImg ? (
                <Image source={{ uri: route.fromImg }} style={styles.cityImage} />
              ) : null}
              {route.toImg ? (
                <Image source={{ uri: route.toImg }} style={styles.cityImage} />
              ) : null}
            </View>

            <Text style={styles.routeTitle}>
              {route.source} to {route.destination}
            </Text>

            {route.airlineLogo && (
              <Image source={{ uri: route.airlineLogo }} style={styles.airlineLogo} />
            )}
            <Text style={styles.airlineName}>{route.airline}</Text>
            <Text style={styles.price}>
              Price: {route.currency} {route.price}
            </Text>

            <Text style={styles.segmentTitle}>Segments:</Text>
            {route.segments.length > 0 ? (
              route.segments.map((seg, i) => (
                <View key={i} style={styles.segmentCard}>
                  <Text style={styles.segmentText}>
                    From: {seg.departure.iataCode} at {seg.departure.at}
                  </Text>
                  <Text style={styles.segmentText}>
                    To: {seg.arrival.iataCode} at {seg.arrival.at}
                  </Text>
                  <Text style={styles.segmentText}>
                    Carrier: {seg.carrierCode} #{seg.number}
                  </Text>
                  <Text style={styles.segmentText}>
                    Aircraft: {seg.aircraft.code}
                  </Text>
                  <Text style={styles.segmentText}>
                    Duration: {seg.duration}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.segmentText}>No segments available.</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F7F8FC',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Vilonti-Bold',
    marginLeft: 10,
    color: '#091A41',
  },
  noRoutes: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cityImage: {
    width: 140,
    height: 100,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  routeTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Vilonti-Bold',
    color: '#091A41',
    marginBottom: 10,
  },
  airlineLogo: {
    width: 180,
    height: 60,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  airlineName: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontFamily: 'Vilonti-Regular',
  },
  price: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    color: '#004080',
    fontWeight: 'bold',
  },
  segmentTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#091A41',
    textAlign: 'left',
  },
  segmentCard: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#EEF2FA',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#091A41',
  },
});
