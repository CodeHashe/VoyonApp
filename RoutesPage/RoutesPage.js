import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import app from "../Firebase/firebaseConfig";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import VoyonContainer from "../VoyonContainer";
import fetchPlaceID from "../fetchData/fetchPlaceID";
import fetchLocationImage from "../fetchData/fetchLocationImage";

const auth = getAuth(app);
const db = getFirestore(app);

// Google API Key
const apiKey = "AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w";

export default function RoutesPage() {
  const navigation = useNavigation();

  const [routes, setRoutes] = useState([]);
  const [srcroutesImages, setsrcRouteImages] = useState({});
  const [destroutesImages, setdestRouteImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helpers to unify field names
  const getOrigin = (item) =>
    item.mode === "air" ? item.source : item.from;
  const getDestination = (item) =>
    item.mode === "air" ? item.destination : item.to;

  // Fetch routes + images
  const fetchRoutes = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const snapshot = await getDocs(collection(db, "Routes"));
      const userRoutes = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.email === user.email);

      setRoutes(userRoutes);
      setLoading(false);

      // Preload images
      for (const route of userRoutes) {
        const origin = getOrigin(route);
        const destination = getDestination(route);
        if (!srcroutesImages[origin] || !destroutesImages[destination]) {
          const srcPlaceID = await fetchPlaceID(origin, apiKey);
          const destPlaceID = await fetchPlaceID(destination, apiKey);
          if (srcPlaceID && destPlaceID) {
            const srcImg = await fetchLocationImage(srcPlaceID, apiKey);
            const destImg = await fetchLocationImage(destPlaceID, apiKey);
            if (srcImg && destImg) {
              setsrcRouteImages((p) => ({ ...p, [origin]: srcImg }));
              setdestRouteImages((p) => ({ ...p, [destination]: destImg }));
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
    }
  }, [srcroutesImages, destroutesImages]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoutes();
    setRefreshing(false);
  };

  // Delete a route both in Firestore and locally
  const handleDeleteRoute = async (item) => {
    const user = auth.currentUser;
    const userEmail = user?.email;
    if (!userEmail) return;

    const origin = getOrigin(item);
    const destination = getDestination(item);

    try {
      const q = query(
        collection(db, "Routes"),
        where("email", "==", userEmail),
        where(item.mode === "air" ? "source" : "from", "==", origin),
        where(item.mode === "air" ? "destination" : "to", "==", destination)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        console.warn("No route found to delete.");
        return;
      }
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, "Routes", docSnap.id));
      }
      // Update local state
      setRoutes((prev) =>
        prev.filter(
          (r) =>
            !(
              getOrigin(r) === origin &&
              getDestination(r) === destination &&
              r.mode === item.mode
            )
        )
      );
    } catch (err) {
      console.error("Error deleting route:", err);
    }
  };

  const renderItem = ({ item }) => {
    const origin = getOrigin(item);
    const destination = getDestination(item);

    return (
      <View style={styles.routeCard}>
        {srcroutesImages[origin] ? (
          <Image
            source={{ uri: srcroutesImages[origin] }}
            style={styles.cityImage}
          />
        ) : (
          <ActivityIndicator size="large" color="#fff" style={{ margin: 5 }} />
        )}

        <View style={styles.routeTextContainer}>
          <View style={styles.rowCenter}>
            <Text style={styles.routeText}>
              {origin} to {destination}
            </Text>
            <TouchableOpacity
              style={styles.transportButton}
              onPress={() =>
                item.mode === "air"
                  ? navigation.navigate("RoutesByAirPage", {
                      origin,
                      destination,
                    })
                  : navigation.navigate("RoutesByCarPage", {
                      apiKey,
                      from: origin,
                      to: destination,
                    })
              }
            >
              <FontAwesome5
                name={item.mode === "air" ? "plane" : "car"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.transportButton, { marginTop: 10 }]}
            onPress={() => handleDeleteRoute(item)}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {destroutesImages[destination] ? (
          <Image
            source={{ uri: destroutesImages[destination] }}
            style={styles.cityImage}
          />
        ) : (
          <ActivityIndicator size="small" color="#fff" style={{ margin: 5 }} />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#010F29"
        style={{ marginTop: 20 }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoyonContainer />
      <View style={styles.container}>
        <Text style={styles.header}>Your Planned Routes</Text>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f1f1f1",
  },
  header: {
    fontSize: 28,
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
    textAlign: "center",
    fontFamily: "Vilonti-Bold",
  },
  transportButton: {
    backgroundColor: "transparent",
    marginLeft: 10,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
});
