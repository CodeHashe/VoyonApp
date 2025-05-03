import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from "firebase/auth";
import { doc, updateDoc, getFirestore, collection, setDoc, addDoc } from "firebase/firestore";
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

export default function ActivitiesPlanner({ navigation, route }) {
  const { apiKey, city, destination, startDate, endDate, srcLat, srcLong, destLat, destLong } = route.params;

  console.log(startDate);

  const [plannedActivities, setPlannedActivities] = useState([]);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const stored = await AsyncStorage.getItem(`activities_${destination}`);
        const parsed = stored ? JSON.parse(stored) : [];

        
        const unique = Array.from(new Map(parsed.map(item => [`${item.place_id}_${item.time}`, item])).values());

        setPlannedActivities(unique);
      } catch (err) {
        console.error('Failed to load activities:', err);
      }
    };

    if (destination) loadActivities();
  }, [destination]);

  useEffect(() => {
    const saveToStorage = async () => {
      try {
        await AsyncStorage.setItem(`activities_${destination}`, JSON.stringify(plannedActivities));
      } catch (err) {
        console.error('Failed to save updated activity:', err);
      }
    };

    if (destination) saveToStorage();
  }, [plannedActivities]);

  const formatSafeDate = (dateStr) => {
    const parsed = new Date(dateStr);
    return isNaN(parsed) ? 'Invalid Date' : format(parsed, 'dd-MM-yyyy');
  };



  async function handlePress() {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User not logged in");
        return;
      }
  
      const userEmail = user.email;
  
      await addDoc(collection(db, "places"), {
        DateVisited: startDate,
        email: userEmail,
        location: destination,
      });
  
      for (const activity of plannedActivities) {
        await addDoc(collection(db, "activities"), {
          email: userEmail,
          location: destination,
          name: activity.name,
        });
  
        await addDoc(collection(db, "activitiesDetails"), {
          email: userEmail,
          location: destination,
          name: activity.name,
          visitingDate: activity.date,
          visitingTime: activity.time,
        });
  
        await addDoc(collection(db, "placesActivities"), {
          DateVisited: activity.date,
          activityName: activity.name,
          email: userEmail,
          location: destination,
        });
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'AppTabs',
            state: {
              routes: [{ name: 'Home' }],
            },
          },
        ],
      });
      
      alert("Activities saved successfully!");
  
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("Failed to save activities.");
    }
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Your Activities</Text>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          Your Start Date is {formatSafeDate(startDate)} & End Date is {formatSafeDate(endDate)}
        </Text>
      </View>

      <ScrollView style={styles.activityList}>
        {plannedActivities.length === 0 ? (
          <Text style={styles.noActivities}>No activities scheduled.</Text>
        ) : (
          plannedActivities.map((item, index) => {
            const activityDate = item.date ? new Date(item.date) : new Date();
            const activityTime = item.time
              ? new Date(`1970-01-01T${item.time}`)
              : new Date();

            return (
              <View key={`${item.place_id}_${index}`} style={styles.activityCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardText}>{item.name}, {destination}</Text>
                  <View style={styles.dateTimeContainer}>
                    <TouchableOpacity
                      style={styles.pill}
                      onPress={() => {
                        setSelectedActivityIndex(index);
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={styles.pillText}>
                        {format(activityDate, 'MMM dd, yyyy')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pill}
                      onPress={() => {
                        setSelectedActivityIndex(index);
                        setShowTimePicker(true);
                      }}
                    >
                      <Text style={styles.pillText}>
                        {format(activityTime, 'h:mm a')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {showDatePicker && selectedActivityIndex !== null && (
  <DateTimePicker
    value={
      plannedActivities[selectedActivityIndex]?.date
        ? new Date(plannedActivities[selectedActivityIndex].date)
        : new Date()
    }
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowDatePicker(false);

      if (!selectedDate) return;

      const selected = new Date(selectedDate);
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (selected >= start && selected <= end) {
        const updated = [...plannedActivities];
        updated[selectedActivityIndex].date = selected.toISOString();
        setPlannedActivities(updated);
      } else {
        alert("Please make sure your dates are between your start and end date");
      }
    }}
  />
)}


      {showTimePicker && selectedActivityIndex !== null && (
        <DateTimePicker
          value={
            plannedActivities[selectedActivityIndex]?.time
              ? new Date(`1970-01-01T${plannedActivities[selectedActivityIndex].time}`)
              : new Date()
          }
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              const hours = selectedTime.getHours().toString().padStart(2, '0');
              const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
              const formattedTime = `${hours}:${minutes}`;
          
              const selectedDate = plannedActivities[selectedActivityIndex]?.date;

              console.log(selectedDate)
          
              const isConflict = plannedActivities.some((activity, idx) =>
                idx !== selectedActivityIndex &&
                activity.time === formattedTime &&
                activity.date === selectedDate
              );
          
              if (isConflict) {
                alert('Another activity is already scheduled at this time. Please pick a different time.');
                return;
              }
          
              const updated = [...plannedActivities];
              updated[selectedActivityIndex].time = formattedTime;
              setPlannedActivities(updated);
            }
          }}
          
          
        />
      )}

      <TouchableOpacity style={styles.voyonButton} onPress={() => handlePress()}>
        <Text style={styles.voyonButtonText}>Voyon IT!</Text>
        <Ionicons name="arrow-forward" size={28} color="#fff" style={{ marginLeft: 30 }} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'Vilonti-Bold',
    color: '#010F29',
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
  activityList: {
    flex: 1,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#001F3F',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 8,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
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
  dateTimeContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  pill: {
    backgroundColor: '#062B5B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pillText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Vilonti-Bold',
  },
  noActivities: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  voyonButton: {
    width: 200,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2A4D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 40,
    alignSelf: 'center',
    marginTop: 30,
  },
  voyonButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
  },
});
