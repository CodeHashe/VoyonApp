import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);
const db   = getFirestore(app);

export default function ActivitiesScreen() {
  const [selectedDate, setSelectedDate] = useState('2025-08-17');
  const [activities, setActivities] = useState([]);
  const user = auth.currentUser;
  const userEmail = user?.email;

  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'activitiesDetails'),
          where('email', '==', userEmail)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setActivities(docs);
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    })();
  }, [userEmail]);

  // helper: get YYYY-MM-DD from ISO or null
  const isoToYMD = iso => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    return d.toISOString().split('T')[0];
  };

  // 1️⃣ Build a set of all dates that have at least one activity
  const markedDates = useMemo(() => {
    const m = {};
    activities.forEach(act => {
      const day = isoToYMD(act.visitingDate);
      if (!day) return;
      m[day] = { marked: true };
    });
    // ensure the selectedDate is styled as selected:
    m[selectedDate] = { ...(m[selectedDate]||{}), selected: true, selectedColor: '#5D5FEF' };
    return m;
  }, [activities, selectedDate]);

  // 2️⃣ Filter only activities whose date-only matches
  const activitiesForSelectedDate = activities.filter(act => {
    return isoToYMD(act.visitingDate) === selectedDate;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Activities</Text>

      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          calendarBackground: '#F5EFFD',
          selectedDayTextColor: '#fff',
        }}
        style={styles.calendar}
      />

      <ScrollView style={styles.timeline}>
        {activitiesForSelectedDate.length > 0 ? (
          activitiesForSelectedDate.map((item, idx) => (
            <View key={idx}>
              <Text style={styles.timeText}>
                {item.visitingTime || 'Time not set'}
              </Text>
              <View style={styles.card}>
                <Text style={styles.cardText}>{item.name}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noActivitiesText}>
            No activities for this date.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  timeline: { padding: 16 },
  timeText: { fontSize: 16, marginBottom: 12 },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },
  cardText: { color: '#fff', fontSize: 16 },
  noActivitiesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});
