import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import { getAuth } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import app from "../Firebase/firebaseConfig";
import { FontAwesome5 } from "@expo/vector-icons";


const auth = getAuth(app);
const db = getFirestore(app);

// Google API Key
const apiKey = "AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w";


const fetchPlaceID = async (placeName) => {
  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify({ textQuery: placeName }),
      }
    );

    const result = await response.json();
    if (result.places && result.places.length > 0) {
      return result.places[0].id;
    } else {
      console.error("No place found for:", placeName);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Place ID:", error);
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
    } else {
      console.error("No photos found for place ID:", placeID);
      return null;
    }
  } catch (error) {
    console.error("Error fetching location image:", error);
    return null;
  }
};

const RoutesPage = () => {
  const navigation = useNavigation(); 

  const [routes, setRoutes] = useState([]);
  const [srcroutesImages, setsrcRouteImages] = useState({});
  const [destroutesImages, setdestRouteImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRoutes = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(collection(db, "Routes"));
      const userRoutes = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((route) => route.email === user.email);

      if (isMounted) {
        setRoutes(userRoutes);
        setLoading(false);
      }

      for (const route of userRoutes) {
        if (!srcroutesImages[route.from] || !destroutesImages[route.to]) {
          const destplaceID = await fetchPlaceID(route.to || route.destination);
          const srcplaceID = await fetchPlaceID(route.from || route.source);

          if (destplaceID && srcplaceID) {
            const imageUrlsrc = await fetchLocationImage(srcplaceID);
            const imageUrldest = await fetchLocationImage(destplaceID);
            if (imageUrlsrc && imageUrldest && isMounted) {
              setsrcRouteImages((prev) => ({ ...prev, [route.from]: imageUrlsrc }));
              setdestRouteImages((prev) => ({ ...prev, [route.to]: imageUrldest }));
            }
          }
        }
      }
    };

    fetchRoutes();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.routeCard}>

      {srcroutesImages[item.from || item.source] ? (
        <Image source={{ uri: srcroutesImages[item.from || item.source] }} style={styles.cityImage} />
      ) : (
        <ActivityIndicator size="large" color="#fff" style={{ marginHorizontal: 5 }} />
      )}

  <View style={styles.routeTextContainer}>
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text style={styles.routeText}>
      {item.from || item.source} to {item.to || item.destination}
    </Text>
    <TouchableOpacity
      style={styles.transportButton}
      onPress={() => {
        if (item.mode === "air") {
          navigation.navigate('RoutesByAirPage', { origin: item.from, destination: item.to });
        } else {
          navigation.navigate('RoutesByCarPage', {
            apiKey,
            from: item.from,
            to:   item.to,   
          });
        }
      }}
    >
      <FontAwesome5
        name={item.mode === "air" ? "plane" : "car"}
        size={20}
        color="white"
        style={{ marginLeft: 5 }}
      />
    </TouchableOpacity>
  </View>
</View>


      <TouchableOpacity
        style={styles.transportButton}
        onPress={() => {
          if (item.mode === "air") {
            navigation.navigate('RoutesByAirPage', { routeId: item.id });
          } else {
            navigation.navigate('byCarPage', { routeId: item.id });
          }
        }}
      >

      </TouchableOpacity>

      {destroutesImages[item.to] ? (
        <Image source={{ uri: destroutesImages[item.to] }} style={styles.cityImage} />
      ) : (
        <ActivityIndicator size="small" color="#fff" style={{ marginHorizontal: 5 }} />
      )}

    </View>
  );


  if (loading) {
    return <ActivityIndicator size="large" color="#010F29" style={{ marginTop: 20 }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f1f1" }}>
      <View style={styles.container}>
        <Text style={styles.header}>Your Planned Routes</Text>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f1f1f1",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Vilonti-Black",
    color: "#010F29",
    marginBottom: 30,
    textAlign: "center",
  },
  routeCard: {
    flexDirection: "row",
    backgroundColor: "#010F29",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 20,
    width: "100%",
    height: 150,
  },
  cityImage: {
    width: 80,
    height: 130,
    borderRadius: 25,
    opacity: 0.8,   
  },
  routeTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  routeText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  transportButton: {
    backgroundColor: "transparent",
    marginLeft: 10,
  },
});


export default RoutesPage;