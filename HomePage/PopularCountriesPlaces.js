import { View, StyleSheet, Image, FlatList, TouchableOpacity, Text } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import fetchPopularPlacesInCountry from "../fetchData/fetchPopularPlacesInCountry";
import fetchPlaceID from "../fetchData/fetchPlaceID";

export default function PopularCountriesPlaces({ navigation, route }) {
  const { apiKey, countryName } = route.params;
  const [places, setPlaces] = useState([]);
  console.log(apiKey);

  useEffect(() => {
    async function getPopularPlaces() {
      try {
        const data = await fetchPopularPlacesInCountry(countryName, apiKey);
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching popular places:", error);
      }
    }

    getPopularPlaces();
  }, [countryName, apiKey]);

  const handlePress = async (placeName) => {
    const placeID = await fetchPlaceID(placeName, apiKey);
    navigation.navigate('PlaceDetails', { placeID, apiKey });
  };

  const renderItem = ({ item }) => {
    const photoRef = item.photos?.[0]?.name;

    if (!photoRef) return null; 

    const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${apiKey}`;

    return (
      <TouchableOpacity onPress={() => handlePress(item.displayName?.text)} style={styles.itemContainer}>
        {photoRef && (
          <Image
            source={{ uri: photoUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={styles.placeName}>{item.displayName?.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Places in {countryName}</Text>
      </View>
      <FlatList
        data={places}
        keyExtractor={(item, index) => item.displayName?.text || index.toString()}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  list: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily:"Vilonti-Bold",
    color: "#555",
  },
  itemContainer: {
    flexDirection: "column", // Ensure vertical stacking of image and name
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: "#fff", // Optional for background color
    elevation: 5, // Optional for shadow effect
    padding: 10,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  placeName: {
    marginTop: 10,
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
    textAlign: 'center',
  },
});
