import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";

export default function SubContainerWithPhotos(props) {
  const { locationName, apiKey, photoRef, onPress } = props;
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (photoRef) {
      const url = `https://places.googleapis.com/v1/${photoRef}/media?key=${apiKey}&maxHeightPx=300&maxWidthPx=300`;
      setPhotoUrl(url);
    }
  }, [photoRef, apiKey]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {photoUrl ? (
        <>
          <Image
            source={{ uri: photoUrl }}
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
