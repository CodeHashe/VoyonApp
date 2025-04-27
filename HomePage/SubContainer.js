import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import fetchLocationImage from "../fetchData/fetchLocationImage";
import { TouchableOpacity } from "react-native";

export default function SubContainer(props) {

  const placeID = props.placeID;
  const locationName = props.locationName;
  const apiKey = props.apiKey;


  const [locationImage, setLocationImage] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      const imageData = await fetchLocationImage(placeID, apiKey);
      setLocationImage(imageData);
    };

    loadImage();
  }, [placeID, apiKey]);

  return (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
      {locationImage ? (
        <>
          <Image
            source={{ uri: locationImage }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.text}>{locationName}</Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>{locationName}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 170,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
    justifyContent: "flex-start",
    margin: 10,
  },
  image: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  text: {
    paddingTop: 8,
    fontSize: 16,
    fontFamily: "Vilonti-Regular", 
    color: "#010F29",
  },
});
