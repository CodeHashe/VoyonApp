import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl 
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import VoyonContainer from '../VoyonContainer';
import { getAuth } from 'firebase/auth';
import app from "../Firebase/firebaseConfig";
import Ionicons from 'react-native-vector-icons/Ionicons';
import fetchPlaceID from '../fetchData/fetchPlaceID';

const auth = getAuth(app);
const db = getFirestore(app);
const apiKey = 'AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w';

export default function ActivitiesScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('2025-08-17');
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const user = auth.currentUser;
  const userEmail = user?.email;

  const fetchActivities = async () => {
    if (!userEmail) return;
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
  };

  useEffect(() => {
    fetchActivities();
  }, [userEmail]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  const isoToYMD = iso => {
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d) ? null : d.toISOString().split('T')[0];
  };

  const markedDates = useMemo(() => {
    const m = {};
    activities.forEach(act => {
      const day = isoToYMD(act.visitingDate);
      if (day) m[day] = { marked: true };
    });
    m[selectedDate] = { ...(m[selectedDate] || {}), selected: true, selectedColor: '#5D5FEF' };
    return m;
  }, [activities, selectedDate]);

  const activitiesForSelectedDate = activities.filter(
    act => isoToYMD(act.visitingDate) === selectedDate
  );

  const handleArrowPress = async (item) => {
    try {
      const placeID = await fetchPlaceID(item.name, apiKey);
      if (placeID) {
        navigation.navigate('PlaceDetails', {
          placeID,
          apiKey,
        });
      } else {
        console.warn('PlaceID not found');
      }
    } catch (error) {
      console.error('Failed to fetch PlaceID:', error);
    }
  };

  const handleDelete = async (itemToDelete) => {
    if (!userEmail) {
      console.warn('User not authenticated');
      return;
    }
    try {
      const q = query(
        collection(db, 'activitiesDetails'),
        where('email', '==', userEmail),
        where('name', '==', itemToDelete.name),
        where('visitingDate', '==', itemToDelete.visitingDate)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;

      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, 'activitiesDetails', docSnap.id));
      }

      setActivities(prev =>
        prev.filter(act =>
          !(act.name === itemToDelete.name && act.visitingDate === itemToDelete.visitingDate)
        )
      );
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  return (
    <View style={styles.container}>
      <VoyonContainer />
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

      <ScrollView
        style={styles.timeline}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activitiesForSelectedDate.length > 0 ? (
          activitiesForSelectedDate.map((item, idx) => (
            <View key={idx}>
              <Text style={styles.timeText}>
                {item.visitingTime || 'Time not set'}
              </Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardText}>{item.name}</Text>
                  <View style={styles.cardButtons}>
                    <TouchableOpacity onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleArrowPress(item)}>
                      <Ionicons name="chevron-forward-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noActivitiesText}>No activities for this date.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: {
    fontSize: 28,
    margin: 16,
    fontFamily: "Vilonti-Bold",
    alignSelf: 'center',
  },
  calendar: {
    borderRadius: 20,
    margin: 16,
  },
  timeline: { padding: 16 },
  timeText: { fontSize: 16, marginBottom: 12, fontFamily: "Vilonti-Bold" },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardButtons: {
    flexDirection: 'row',
    columnGap: 12,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontFamily: "Vilonti-Bold",
    marginTop: 20,
  },
});
