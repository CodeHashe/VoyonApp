import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from '../Firebase/firebaseConfig';
import fetchAirlineImage from '../fetchData/fetchAirlineImage';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);
const GOOGLE_API_KEY = "AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w";

export default function RoutesAir({ navigation }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = auth.currentUser.email;

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const q = query(collection(db, 'Routes'), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        const fetchedRoutes = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();

          const [fromImg, toImg, airlineLogo] = await Promise.all([
            fetchCityPhoto(data.source),
            fetchCityPhoto(data.destination),
            fetchAirlineImage(data.airline),
          ]);

          const sanitizedSegments = Array.isArray(data.segments)
  ? data.segments
      .map((segment) => {
        if (
          !segment?.departure?.iataCode ||
          !segment?.arrival?.iataCode ||
          !segment?.carrierCode ||
          !segment?.number
        ) {
          return null;
        }

        return {
          departure: {
            iataCode: segment?.departure?.iataCode || '',
            at: segment?.departure?.at || '',
          },
          arrival: {
            iataCode: segment?.arrival?.iataCode || '',
            at: segment?.arrival?.at || '',
          },
          carrierCode: segment?.carrierCode || '',
          number: segment?.number || '',
          aircraft: {
            code: segment?.aircraft?.code || '',
          },
          duration: segment?.duration || '',
        };
      })
      .filter(Boolean) // Remove null entries
    : [];


          fetchedRoutes.push({
            ...data,
            segments: sanitizedSegments,
            fromImg,
            toImg,
            airlineLogo,
            id: docSnap.id,
          });
        }

        setRoutes(fetchedRoutes);
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const fetchCityPhoto = async (cityName) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${cityName}&inputtype=textquery&fields=photos&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.candidates.length > 0 && data.candidates[0].photos) {
        const photoReference = data.candidates[0].photos[0].photo_reference;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY};`
      }
    } catch (error) {
      console.error("Error fetching city photo:", error);
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
        <Text style={styles.headerTitle}>Saved Routes</Text>
      </View>

      {routes.map((route, idx) => (
        <View key={idx} style={styles.routeCard}>
          <View style={styles.imageRow}>
            {route.fromImg && <Image source={{ uri: route.fromImg }} style={styles.cityImage} />}
            {route.toImg && <Image source={{ uri: route.toImg }} style={styles.cityImage} />}
          </View>

          <Text style={styles.routeTitle}>{route.source} to {route.destination}</Text>

          {route.airlineLogo && <Image source={{ uri: route.airlineLogo }} style={styles.airlineLogo} />}
          <Text style={styles.airlineName}>{route.airline}</Text>
          <Text style={styles.price}>Price: {route.currency} {route.price}</Text>

          <Text style={styles.segmentTitle}>Segments:</Text>
          {Array.isArray(route.segments) && route.segments.length > 0 ? (
            route.segments.map((segment, index) => (
              <View key={index} style={styles.segmentCard}>
                <Text style={styles.segmentText}>From: {segment.departure.iataCode} at {segment.departure.at}</Text>
                <Text style={styles.segmentText}>To: {segment.arrival.iataCode} at {segment.arrival.at}</Text>
                <Text style={styles.segmentText}>Carrier Code: {segment.carrierCode}</Text>
                <Text style={styles.segmentText}>Flight Number: {segment.number}</Text>
                <Text style={styles.segmentText}>Aircraft Code: {segment.aircraft.code}</Text>
                <Text style={styles.segmentText}>Duration: {segment.duration}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.segmentText}>No segments available.</Text>
          )}
        </View>
      ))}
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
    fontFamily: "Vilonti-Bold",
    marginLeft: 10,
    color: '#091A41',
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  cityImage: {
    width: 160,
    height: 120,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  routeTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: "Vilonti-Bold",
    color: '#091A41',
    marginBottom: 10
  },
  airlineLogo: {
    width: 180,
    height: 60,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 10
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
    fontWeight: 'bold'
  },
  segmentTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#091A41',
    textAlign: 'left'
  },
  segmentCard: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#EEF2FA',
    borderRadius: 8
  },
  segmentText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#091A41'
  }
});
