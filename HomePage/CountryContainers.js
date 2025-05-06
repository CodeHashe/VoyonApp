import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Text, ActivityIndicator } from "react-native";
import SubContainerWithPhotos from "./SubContainerWithPhotos";
import fetchPopularPlacesInCountry from "../fetchData/fetchPopularPlacesInCountry";
import fetchPlaceID from "../fetchData/fetchPlaceID";

export default function CountryContainers({ navigation, apiKey, countryName }) {
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const places = await fetchPopularPlacesInCountry(countryName, apiKey);
        console.log("Country Data Received: ", places);
        setPopularPlaces(places);
      } catch (error) {
        console.error("Error fetching popular places:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryName, apiKey]);

  const handlePress = async (locationName) => {
    try {
      const placeID = await fetchPlaceID(locationName, apiKey);
      console.log("PlaceID being sent: ", placeID);
      navigation.navigate('PlaceDetails', { placeID, apiKey });
    } catch (error) {
      console.error("Error fetching PlaceID:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Popular Places to visit in {countryName}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {popularPlaces.map((place, index) => (
          <SubContainerWithPhotos
            key={place.displayName?.text || index}
            locationName={place.displayName?.text}
            apiKey={apiKey}
            photoRef={place.photos?.[0]?.name}
            onPress={() => handlePress(place.displayName?.text)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  headings: {
    fontSize: 20,
    fontFamily:"Vilonti-Bold",
    marginLeft: 10,
    marginBottom: 10,
    alignContent:"center",
    alignSelf:"center"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
});
