import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, SafeAreaView
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, collection, query, where, deleteDoc, doc} from 'firebase/firestore';
import app from "../Firebase/firebaseConfig";

import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import VoyonContainer from '../VoyonContainer';

const auth = getAuth(app);
const db = getFirestore(app);
const apiKey = 'AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w';

const fetchPlaceID = async (placeName) => {
  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id',
        },
        body: JSON.stringify({ textQuery: placeName }),
      }
    );

    const result = await response.json();
    if (result.places && result.places.length > 0) {
      return result.places[0].id;
    }
    console.error('No place found for:', placeName);
    return null;
  } catch (error) {
    console.error('Error fetching Place ID:', error);
    return null;
  }
};

const fetchLocationImage = async (placeID) => {
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeID}?fields=photos&key=${apiKey}`
    );
    const result = await response.json();
    if (result.photos && result.photos.length > 0) {
      const photoRef = result.photos[0].name;
      return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${apiKey}`;
    }
    console.error('No photos found for place ID:', placeID);
    return null;
  } catch (error) {
    console.error('Error fetching location image:', error);
    return null;
  }
};

export default function PlacesPage({ navigation }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});

  // Fetch user’s saved places
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No user is logged in.');
          setLoading(false);
          return;
        }

        const snapshot = await getDocs(collection(db, 'places'));
        const list = snapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(place => place.email === user.email);

        setPlaces(list);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Preload images for each place
  useEffect(() => {
    const loadImages = async () => {
      const cache = { ...imageCache };
      for (const place of places) {
        if (!cache[place.location]) {
          const id = await fetchPlaceID(place.location);
          if (id) {
            const url = await fetchLocationImage(id);
            if (url) cache[place.location] = url;
          }
        }
      }
      setImageCache(cache);
    };
    if (places.length) loadImages();
  }, [places]);

  // Deletes all place docs and matching activities by city+email
  const deletePlaceAndActivities = async (placeLocation, userEmail) => {
    try {
      // 1. Delete matching place docs
      const placesQuery = query(
        collection(db, 'places'),
        where('location', '==', placeLocation),
        where('email', '==', userEmail)
      );
      const placesSnap = await getDocs(placesQuery);
      const placeDeletes = placesSnap.docs.map(d => deleteDoc(doc(db, 'places', d.id)));
      
      // 2. Delete matching activities in placesActivities
      const actQuery = query(
        collection(db, 'placesActivities'),
        where('location', '==', placeLocation),
        where('email', '==', userEmail)
      );
      const actSnap = await getDocs(actQuery);
      const actDeletes = actSnap.docs.map(d => deleteDoc(doc(db, 'placesActivities', d.id)));

      // wait for all deletions
      await Promise.all([...placeDeletes, ...actDeletes]);

      // 3. Update UI state
      setPlaces(prev => prev.filter(p => p.location !== placeLocation));
      console.log(`Deleted all records for ${placeLocation}`);
    } catch (error) {
      console.error('Error deleting place or activities:', error);
      alert('Failed to delete place. Please try again.');
    }
  };

  const handleCitySelect = (city) => {
    const user = auth.currentUser;
    navigation.navigate('PlacesSubPage', {
      city,
      userEmail: user.email,
      apiKey
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleCitySelect(item.location)}
      >
        <Image
          source={
            imageCache[item.location]
              ? { uri: imageCache[item.location] }
              : require('../assets/Minar-e-Pakistan.png')
          }
          style={styles.placeImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.placeName}>{item.location}</Text>
          <Text style={styles.visitDate}>Visited On: {item.DateVisited}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deletePlaceAndActivities(item.location, auth.currentUser.email)}
      >
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
      <AntDesign name="arrowright" size={24} color="white" style={styles.arrowIcon} />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#00214d" style={{ marginTop: 20 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <VoyonContainer/>
      <Text style={[styles.header, { color: '#010F29', textAlign: 'center' }]}>
        Your Visited Places
      </Text>
      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 20, backgroundColor: '#f9f9f9' },
  topBar: {
    width: 203,
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#010F29',
    borderRadius: 37,
    justifyContent: 'center',
    marginBottom: 10,
  },
  appIcon: { width: 32, height: 32, marginBottom: 5 },
  headerText: { fontFamily: 'Vilonti-Bold', fontSize: 23, color: 'white' },
  header: { fontFamily: 'Vilonti-Black', fontSize: 27, marginVertical: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#010F29',
    borderRadius: 37,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  placeImage: { width: 80, height: 80, borderRadius: 37, marginRight: 20 },
  textContainer: { flex: 1 },
  placeName: { fontSize: 18, fontFamily: 'Vilonti-Black', color: 'white' },
  visitDate: { fontFamily: 'Vilonti-Medium', fontSize: 16, color: 'white' },
  deleteButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#BF2C2C',
    borderRadius: 20,
  },
  arrowIcon: { marginRight: 8 },
});
