import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image 
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import app from "../Firebase/firebaseConfig";
import { AntDesign } from "@expo/vector-icons";

const auth = getAuth(app);
const db = getFirestore(app);

const PlacesPage = () => {
  const navigation = useRouter();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("No user is logged in.");
          return;
        }

        const querySnapshot = await getDocs(collection(db, "activites"));
        const placesList = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(place => place.email === user.email);

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
    <TouchableOpacity style={styles.card}>
      <Image 
        source={require("../assets/image9.png")} 
        style={styles.placeImage} 
      />
      <Text style={styles.placeName}>{item.location}</Text>
      <AntDesign name="hearto" size={24} color="white" style={styles.heartIcon} />
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#00214d" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.header}>Your Activities in Dubai</Text>
      </View>
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
  headerCard: {
    backgroundColor: "#010F29",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#010F29",
    borderRadius: 37,
    padding: 10,
    marginBottom: 12,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  placeName: {
    flex: 1,
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  heartIcon: {
    padding: 10,
  },
});

export default ActivitesPage;
