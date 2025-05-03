import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground
} from 'react-native';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 100;
const IMAGE_SIZE = 80;

export default function PlacesSubPage({ navigation, route }) {
  const { city, userEmail, apiKey } = route.params;
  const auth = getAuth();
  const currentUserEmail = userEmail || auth.currentUser?.email;

  const [activities, setActivities] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [cityImage, setCityImage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchPlaceID(placeName) {
    try {
      const res = await fetch(
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
      const json = await res.json();
      return json.places?.[0]?.id || null;
    } catch (e) {
      console.error('fetchPlaceID error:', e);
      return null;
    }
  }

  async function fetchLocationImage(placeID) {
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeID}?fields=photos&key=${apiKey}`
      );
      const json = await res.json();
      if (json.photos?.length) {
        const photoRef = json.photos[0].name;
        return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${apiKey}`;
      }
    } catch (e) {
      console.error('fetchLocationImage error:', e);
    }
    return null;
  }

  
  useEffect(() => {
    if (!apiKey || !city) return;
    (async () => {
      const pid = await fetchPlaceID(city);
      if (pid) {
        const uri = await fetchLocationImage(pid);
        setCityImage(uri);
      }
    })();
  }, [city, apiKey]);

  
  useEffect(() => {
    if (!currentUserEmail || !city) return;
    (async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const q = query(
          collection(db, 'placesActivities'),
          where('email', '==', currentUserEmail),
          where('location', '==', city)
        );
        const snap = await getDocs(q);
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [city, currentUserEmail]);

  
  useEffect(() => {
    if (!apiKey || activities.length === 0) return;
    (async () => {
      const cache = { ...imageCache };
      for (const act of activities) {
        if (!cache[act.id]) {
          const pid = await fetchPlaceID(act.activityName);
          if (pid) {
            const uri = await fetchLocationImage(pid);
            if (uri) cache[act.id] = uri;
          }
        }
      }
      setImageCache(cache);
    })();
  }, [activities, apiKey]);

  const handleDelete = async (id) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'placesActivities', id));
      setActivities(a => a.filter(x => x.id !== id));
      setImageCache(c => { const copy = { ...c }; delete copy[id]; return copy; });
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={ imageCache[item.id] ? { uri: imageCache[item.id] } : null }
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.activityName}</Text>
        <Text style={styles.cardDate}>{item.DateVisited}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {cityImage && (
          <ImageBackground
            source={{ uri: cityImage }}
            style={styles.headerBg}
            blurRadius={1}
          />
        )}
        <View style={styles.headerOverlay} />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {`Your Activities in ${city}`}
        </Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
    marginTop: 30,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    color: '#fff',
    fontSize: 16,
    fontFamily: "Vilonti-Regular",
  },

  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E293B',
    opacity: 0.3,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 60,            // ← aligned with headerTitle
    zIndex: 2,
  },
  headerTitle: {
    position: 'absolute',
    top: 60,            // ← same as backBtn
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontFamily: "Vilonti-Black",
    zIndex: 2,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 30,
    height: CARD_HEIGHT,
    marginBottom: 15,
    paddingHorizontal: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 20,
    resizeMode: 'cover',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: "Vilonti-Black",
  },
  cardDate: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Vilont-Black",
  },
  deleteBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
