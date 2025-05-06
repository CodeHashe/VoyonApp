import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet } from 'react-native';

const popularCountries = [
  "France", "Japan", "Italy", "United States", "Spain", "Thailand", "Turkey", "Germany"
];

export default function PopularCountriesContainers({ navigation, apiKey }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("Api Key in PopularCountriesContainer: ",apiKey)

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const results = await Promise.all(popularCountries.map(async (country) => {
          const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.displayName,places.photos,places.id'
            },
            body: JSON.stringify({
              textQuery: country
            })
          });

          const data = await res.json();
          return data.places?.[0];
        }));

        setPlaces(results.filter(Boolean));
      } catch (err) {
        setError('Failed to fetch popular countries');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [apiKey]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  if (error) return <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>;

  function handlePress(apiKey, countryName) {
    navigation.navigate("PopularCountriesPlaces", { apiKey, countryName });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Popular Countries</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(apiKey, item.displayName?.text)}>
            {item.photos?.[0] && (
              <Image
                source={{ uri: `https://places.googleapis.com/v1/${item.photos[0].name}/media?key=${apiKey}&maxHeightPx=300&maxWidthPx=300` }}
                style={styles.image}
              />
            )}
            <Text style={styles.countryName}>{item.displayName?.text}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  heading: {
    fontFamily: "Vilonti-Bold",
    fontSize: 20,
    marginBottom: 10,
    alignContent:"center",
    alignSelf:"center",
  },
  itemContainer: {
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
    height: 120,
  },
  countryName: {
    marginTop: 5,
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
  },
});
