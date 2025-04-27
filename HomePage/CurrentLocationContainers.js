import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import SubContainer from "./SubContainer"; 
import fetchPopularPlacesNearby from "../fetchData/fetchPopularPlacesNearby";
import { useNavigation } from "@react-navigation/native"; // 👈 to use navigation

export default function CurrentLocationContainers(props) {
  const { apiKey, locationName, locationLat, locationLong } = props;
  const navigation = useNavigation(); // 👈 get navigation object

  const [popularPlaces, setPopularPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const places = await fetchPopularPlacesNearby(locationLat, locationLong, apiKey);
      setPopularPlaces(places);
    };

    fetchData();
  }, [locationLat, locationLong, apiKey]);

  // 👇 create the function that will be passed to SubContainer
  const handlePress = (placeID) => {
    navigation.navigate('PlaceDetails', { placeID, apiKey }); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Popular Places to visit in {locationName}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {popularPlaces.map((place, index) => (
          <SubContainer
            key={index}
            placeID={place.place_id}
            locationName={place.name}
            apiKey={apiKey}
            onPress={() => handlePress(place.place_id)} // 👈 pass it properly
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: "auto"
  },
  headings: {
    fontFamily: "Vilonti-Bold",
    fontSize: 20,
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center"
  }
});
