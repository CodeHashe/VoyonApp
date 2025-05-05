import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from "../Firebase/firebaseConfig"
import { getAuth } from 'firebase/auth';
const auth = getAuth(app);
const db = getFirestore(app);

const ActivitiesScreen = () => {
  
  const [selectedDate, setSelectedDate] = useState('2025-08-17');
  const [activities, setActivities] = useState([]);
  const user = auth.currentUser;
 const userEmail = user.email;
  useEffect(() => {
    const fetchActivities = async () => {
      try {
      

        const q = query(
          collection(db, 'activitiesDetails'),
          where('email', '==', userEmail)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActivities(results);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [userEmail]);

  const activitiesForSelectedDate = activities.filter(
    (item) => item.visitingDate === selectedDate
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Activities</Text>

      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: '#5D5FEF' },
        }}
        theme={{
          calendarBackground: '#F5EFFD',
          selectedDayBackgroundColor: '#5D5FEF',
          selectedDayTextColor: '#fff',
        }}
        style={styles.calendar}
      />

      <ScrollView style={styles.timeline}>
        {activitiesForSelectedDate.length > 0 ? (
          activitiesForSelectedDate.map((item, index) => (
            <View key={index}>
              <Text style={styles.timeText}>{item.visitingTime || 'Time not set'}</Text>
              <View style={styles.card}>
                <Text style={styles.cardText}>{item.name}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noActivitiesText}>No activities for this date.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    color: '#010F29',
    margin: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  calendar: {
    borderRadius: 20,
    margin: 16,
  },
  timeline: {
    padding: 16,
  },
  timeText: {
    fontSize: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ActivitiesScreen;
