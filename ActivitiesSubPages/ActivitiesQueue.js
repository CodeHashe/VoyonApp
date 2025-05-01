import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


export default function ActivitiesQueue({ navigation,route }) {
  const { destination } = route.params;
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const stored = await AsyncStorage.getItem(`activities_${destination}`);
        if (stored) {
          setActivities(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };
    loadActivities();
  }, [destination]);

  const handleDelete = async (place_id) => {
    const updated = activities.filter(act => act.place_id !== place_id);
    setActivities(updated);
    
    const storedCount = await AsyncStorage.getItem(`activityCount_${destination}`);
    let count = Number(storedCount);
    console.log(count);
    if(count>0){
      count--;
      await AsyncStorage.setItem(`activityCount_${destination}`,String(count));
    }
    await AsyncStorage.setItem(`activities_${destination}`, JSON.stringify(updated));
    await AsyncStorage.setItem(`activityCount_${destination}`, String(updated.length));
  };

  return (
    <View style={{ flex: 1, marginTop: 40, paddingHorizontal: 10 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.heading}>Your Activities Queue</Text>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>Have a look at your queue!</Text>
      </View>

      <ScrollView>
        {activities.map((item) => (
          <View key={item.place_id} style={styles.activityCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardText}>{item.name}, {destination}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.place_id)}>
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontFamily: 'Vilonti-Bold',
    marginVertical: 10,
    color: '#010F29'
  },
  bubble: {
    width: '90%',
    backgroundColor: '#010F29',
    borderRadius: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginVertical: 10,
  },
  bubbleText: {
    fontFamily: 'Vilonti-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#001F3F',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 8,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  cardTextContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cardText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Vilonti-Bold',
  },
});
