import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialActivities = [
  { id: '1', name: 'Sky Diving', image: require('../assets/skydiving.jpg') },
  { id: '2', name: 'Water Sports', image: require('../assets/watersports.jpg') },
  { id: '3', name: 'Aquarium Safari', image: require('../assets/aquarium.jpg') },
  { id: '4', name: 'Hot Air Balloon Ride', image: require('../assets/balloon.jpg') },
  { id: '5', name: 'Desert Dune Bashing', image: require('../assets/desert.jpg') },
  { id: '6', name: 'Visiting Burj Khalifa', image: require('../assets/burj.jpg') },
  { id: '7', name: 'Skiing', image: require('../assets/skiing.jpg') },
];

const PlacesSubPage = () => {
  const [activities, setActivities] = useState(initialActivities);

  const handleDelete = (id) => {
    setActivities((prevActivities) =>
      prevActivities.filter((activity) => activity.id !== id)
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.text}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Activities in Dubai</Text>
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#010F29',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#010F29',
    borderRadius: 30,
    padding: 10,
    marginBottom: 15,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  text: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlacesSubPage;
