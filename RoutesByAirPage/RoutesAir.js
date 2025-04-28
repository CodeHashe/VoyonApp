import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the back arrow
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../Firebase/firebaseConfig';
import fetchAirlineImage from '../fetchData/fetchAirlineImage';

const db = getFirestore(app);
const GOOGLE_API_KEY = "AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w";

export default function RouteInformation({ navigation, route }) {
  const { routeId } = route.params;
  const [routeInfo, setRouteInfo] = useState(null);
  const [fromImageUrl, setFromImageUrl] = useState('');
  const [toImageUrl, setToImageUrl] = useState('');
  const [airlineLogoUrl, setAirlineLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteInfo = async () => {
      try {
        const docRef = doc(db, 'Routes', routeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRouteInfo(data);

          fetchCityPhoto(data.from, setFromImageUrl);
          fetchCityPhoto(data.to, setToImageUrl);

          const airlineImage = await fetchAirlineImage(data.airline);
          console.log("Image link found: ", airlineImage);
          setAirlineLogoUrl(airlineImage);
        }
        
      } catch (error) {
        console.error("Error fetching route info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteInfo();
  }, [routeId]);

  const fetchCityPhoto = async (cityName, setImageUrl) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${cityName}&inputtype=textquery&fields=photos&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.candidates.length > 0 && data.candidates[0].photos) {
        const photoReference = data.candidates[0].photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
        setImageUrl(photoUrl);
      }
    } catch (error) {
      console.error("Error fetching city photo:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#091A41" />
      </View>
    );
  }

  if (!routeInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Route not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#091A41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Information</Text>
      </View>

      <View style={styles.topBanner}>
  {fromImageUrl ? (
    <View style={styles.imageContainer}>
      <Image source={{ uri: fromImageUrl }} style={styles.cityImage} />
      <View style={styles.overlay} /> 
    </View>
  ) : null}

  {toImageUrl ? (
    <View style={styles.imageContainer}>
      <Image source={{ uri: toImageUrl }} style={styles.cityImage} />
      <View style={styles.overlay} /> 
    </View>
  ) : null}

  <Text style={styles.topTitle}>{routeInfo.from} to {routeInfo.to}</Text>
</View>

      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Route Details</Text>
      </TouchableOpacity>

      <Text style={styles.airlineName}>{routeInfo.airline}</Text>

      {airlineLogoUrl ? (
        <Image source={{ uri: airlineLogoUrl }} style={styles.airlineLogo} />
      ) : null}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Flight Details</Text>
      </TouchableOpacity>

      <View style={styles.flightCard}>
        <Text style={styles.flightRoute}>{routeInfo.flightFrom} ✈️ {routeInfo.flightTo}</Text>
        <Text style={styles.flightInfo}>Flight Code: {routeInfo.flightCode}</Text>
        <Text style={styles.flightInfo}>Departure Time: {routeInfo.DepartureTime} ({routeInfo.deptTimezone})</Text>
        <Text style={styles.flightInfo}>Arrival Time: {routeInfo.ArrivalTime} ({routeInfo.arrTimezone})</Text>
      </View>

      <View style={styles.flightCard}>
        <Text style={styles.flightRoute}>{routeInfo.flightTo} ✈️ {routeInfo.flightFrom}</Text>
        <Text style={styles.flightInfo}>Flight Code: {routeInfo.flightCode}</Text>
        <Text style={styles.flightInfo}>Departure Time: {routeInfo.DepartureTime} ({routeInfo.deptTimezone})</Text>
        <Text style={styles.flightInfo}>Arrival Time: {routeInfo.ArrivalTime} ({routeInfo.arrTimezone})</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Total Flight Time</Text>
      </TouchableOpacity>
      <Text style={styles.infoText}>{routeInfo.totalFlightTime}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Total Fare Price</Text>
      </TouchableOpacity>
      <Text style={styles.infoText}>{routeInfo.totalFarePrice}</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  errorText: { fontSize: 18, color: 'red' },

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
  imageContainer: {
    width: 200,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 5,
    opacity:0.5
  },
  
  cityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  
  topTitle: {
    position: 'absolute',
    fontSize: 20,
    fontFamily: "Vilonti-Bold",
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  button: {
    width: 180,
    height: 60,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#091A41',
    borderRadius: 37,
    paddingVertical: 10,
    alignSelf:'center',
    alignItems: 'center',
    justifyContent: "center"
  },
  buttonText: { color: 'white', fontSize: 15, fontFamily: "Vilonti-Bold" },

  airlineName: {
    marginTop: 20,
    fontSize: 20,
    fontFamily: "Vilonti-Bold",
    textAlign: 'center',
    color: '#091A41'
  },
  airlineLogo: {
    width: 250,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
    resizeMode: 'contain'
  },

  flightCard: {
    backgroundColor: '#091A41',
    marginHorizontal: 10,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    width:396,
    height:185
  },
  flightRoute: {
    fontSize: 25,
    fontFamily: "Vilonti-Bold",
    color: '#FFFFFF',
    alignItems:"center",
    justifyContent:"center",
    alignSelf:'center'


  },
  flightInfo: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 5,
    fontFamily: "Vilonti-Bold",
    justifyContent:"center",
     alignSelf:'center'
  },
  infoText: {
    textAlign: 'center',
    fontFamily: "Vilonti-Bold",
    fontSize: 24,
    color: '#004080',
    marginVertical: 10
  },
});
