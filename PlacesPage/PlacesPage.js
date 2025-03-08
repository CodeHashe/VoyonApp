import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image 
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

const PlacesPage = () => {
  const navigation = useRouter();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "places"));
        const placesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlaces(placesList);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.push(`/places/${item.id}`)}>
      <View style={styles.textContainer}>
        <Text style={styles.placeName}>{item.location}</Text>
        <Text style={styles.visitDate}>Visited On: {item.dateVisited}</Text>
        <Text style={styles.email}>Email: {item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#00214d" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.back()}>
          <Image source={require("../assets/icon.png")} style={styles.appIcon} />
        </TouchableOpacity>
        <Text style={styles.header}>Your Visited Places</Text>
      </View>

      {/* Places List */}
      <FlatList 
        data={places} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  appIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textContainer: {
    marginLeft: 10,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  visitDate: {
    fontSize: 14,
    color: "#555",
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
});

export default PlacesPage;
