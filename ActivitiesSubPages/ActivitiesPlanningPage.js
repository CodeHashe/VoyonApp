import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import fetchPopularPlacesNearby from '../fetchData/fetchPopularPlacesNearby';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ActivitiesPlanningPage({ navigation, route }) {
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [activityCount, setActivityCount] = useState(0);

  const {
    apiKey,
    city,
    destination,
    startDate,
    endDate,
    srcLat,
    srcLong,
    destLat,
    destLong
  } = route.params;

  const locationLat = destLat;
  const locationLong = destLong;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const places = await fetchPopularPlacesNearby(locationLat, locationLong, apiKey);
        setPopularPlaces(places);
      } catch (error) {
        console.error('Error fetching popular places:', error);
      }
    };
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadCount = async () => {
        try {
          const stored = await AsyncStorage.getItem(`activityCount_${destination}`);
          if (stored !== null) {
            setActivityCount(Number(stored));
          }
        } catch (error) {
          console.error('Error loading activity count:', error);
        }
      };
      loadCount();
    }, [destination])
  );

  const handlePress = (placeID) => {
    navigation.navigate('PlaceDetails', { placeID, apiKey });
  };

  const handleAddActivity = async (item, imageUrl) => {
    try {
      const newCount = activityCount + 1;
      setActivityCount(newCount);
      await AsyncStorage.setItem(`activityCount_${destination}`, String(newCount));

      const existing = await AsyncStorage.getItem(`activities_${destination}`);
      const parsed = existing ? JSON.parse(existing) : [];

      const newActivity = {
        name: item.name,
        place_id: item.place_id,
        imageUrl,
      };

      parsed.push(newActivity);
      await AsyncStorage.setItem(`activities_${destination}`, JSON.stringify(parsed));
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Activities in {destination}</Text>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          Search your heart out and allow us to help you plan your Trip!
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {popularPlaces.map((item) => {
          const imageUrl = item.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.photos[0].photo_reference}&key=${apiKey}`
            : 'https://via.placeholder.com/100';

          return (
            <View key={item.place_id} style={styles.itemContainer}>
              <Image source={{ uri: imageUrl }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.placeName}>{item.name}</Text>
                <View style={styles.cardIcons}>
                  <TouchableOpacity onPress={() => handlePress(item.place_id)}>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleAddActivity(item, imageUrl)} style={{ marginTop: 5 }}>
                    <Ionicons name="add-circle-outline" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.planButtonContainer}>
        <TouchableOpacity style={styles.planButton} onPress={() => navigation.navigate('ActivitiesPlanner',{apiKey,city,destination,startDate,endDate,srcLat,srcLong,destLat,destLong}) } >
          <Text style={styles.planText}>Plan Your Activities</Text> 
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 5 }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.countBubble}
          onPress={() => navigation.navigate('ActivitiesQueue', { destination })}
        >
          <Text style={styles.countText}>{activityCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginLeft: 10,
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "Vilonti-Bold",
    color: "#010F29",
  },
  bubble: {
    width: 294,
    backgroundColor: "#010F29",
    borderRadius: 30,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginVertical: 5,
  },
  bubbleText: {
    fontFamily: "Vilonti-Bold",
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#001F3F',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    height: 90,
  },
  cardImage: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  placeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
    flexShrink: 1,
  },
  cardIcons: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  planButton: {
    flexDirection: 'row',
    backgroundColor: '#001F3F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  planText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
  },
  planButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    alignContent: 'center',
    gap: 4,
    backgroundColor:"transparent"
  },
  countBubble: {
    backgroundColor: '#004080',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: 'white',
    fontFamily: 'Vilonti-Bold',
    fontSize: 19,
  },
});
