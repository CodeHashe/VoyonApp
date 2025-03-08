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

        const querySnapshot = await getDocs(collection(db, "places"));
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
    <TouchableOpacity style={styles.card} onPress={() => navigation.push(`/places/${item.id}`)}>
      <Image source={require("../assets/Minar-e-Pakistan.png")} style={styles.placeImage} />
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
  <Image source={require("../assets/SignInLogo.png")} style={styles.appIcon} />
  <Text style={styles.header}>Your Visited Places</Text>
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
  topBar: {
    alignItems: "center",  
    backgroundColor: "#00214d",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 15,  
  },
  appIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,  
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00214d",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  placeImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  visitDate: {
    fontSize: 14,
    color: "#ddd",
  },
  arrowIcon: {
    padding: 10,
  },
});

export default PlacesPage;
