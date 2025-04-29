import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image 
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import app from '../Firebase/firebaseConfig';
import { AntDesign } from '@expo/vector-icons';

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

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No user is logged in.');
          return;
        }

        const snapshot = await getDocs(collection(db, 'places'));
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
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

  const handleCitySelect = (city) => {
    console.log('Sending city name: ', city);
    const user = auth.currentUser;
    navigation.navigate('PlacesSubPage', { city, userEmail: user.email, apiKey:apiKey });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
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
      <AntDesign name="arrowright" size={24} color="white" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#00214d" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('../assets/SignInLogo.png')} style={styles.appIcon} />
        <Text style={styles.headerText}>Voyon</Text>
      </View>
      <Text style={[styles.header, { color: '#010F29', textAlign: 'center' }]}>Your Visited Places</Text>
      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginBottom: 20, backgroundColor: '#f9f9f9' },
  topBar: {
    width: 203,
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#010F29',
    borderRadius: 37,
    justifyContent: 'center',
    marginRight: 10,
  },
  appIcon: { width: 32, height: 32, marginBottom: 5 },
  headerText: { fontFamily: 'Vilonti-Bold', fontSize: 23, color: 'white' },
  header: { fontFamily: 'Vilonti-Black', fontSize: 27, color: '#010F29', textAlign: 'center' },
  card: {
    width: 'auto',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#010F29',
    borderRadius: 37,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  placeImage: { width: 150, height: 100, borderRadius: 37, marginRight: 20 },
  textContainer: { flex: 1 },
  placeName: { fontSize: 18, fontFamily: 'Vilonti-Black', color: 'white', textAlign: 'center' },
  visitDate: { fontFamily: 'Vilonti-Medium', fontSize: 16, color: 'white', textAlign: 'center' },
  arrowIcon: { padding: 10 },
});
