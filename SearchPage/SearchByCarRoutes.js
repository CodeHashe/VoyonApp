import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';

export default function SearchByCarRoutes({ navigation, route }) {
  const { city, countryName, destination, apiKey } = route.params;

  return (
    <View style={styles.container}>
      
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Info from {city} to {destination}</Text>
      </View>

      
      <TouchableOpacity style={styles.headerButton}>
        <Text style={styles.headerButtonText}>
          Have a look at the route you can take to get there!
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 33.6844,
            longitude: 73.0479,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Voyan Time to Destination</Text>
        </TouchableOpacity>
        <Text style={styles.infoText}>4 hrs 36 mins</Text>

         
         <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Voyon Weather Report</Text>
        </TouchableOpacity>

        
        <WeatherCard />
        <WeatherCard1 />

        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Voyon Weather Alert</Text>
        </TouchableOpacity>

        
        <WeatherStatusCard onPress={() => { }} />

      </ScrollView>
    </View>
  );
}

function WeatherCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cityName}>Islamabad</Text>
      <View style={styles.weatherRow}>
        <Ionicons name="cloud-outline" size={32} color="#091A41" />
        <Text style={styles.temperature}>18°C</Text>
      </View>
    </View>
  );
}

function WeatherCard1() {
  return (
    <View style={styles.card}>
      <Text style={styles.cityName}>Lahore</Text>
      <View style={styles.weatherRow}>
        <Ionicons name="cloud-outline" size={32} color="#091A41" />
        <Text style={styles.temperature}>20°C</Text>
      </View>
    </View>
  );
}

function WeatherStatusCard({ onPress }) {
  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusText}>
        No Warnings, Weather is Clear between locations
      </Text>
      <TouchableOpacity style={styles.statusButton} onPress={onPress}>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Vilonti-Bold",
    color: '#091A41',
    flexShrink: 1,
  },
  headerButton: {
    marginTop: 10,
    marginHorizontal: 16,
    width: '90%',
    backgroundColor: '#091A41',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: "Vilonti-Bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  map: {
    width: '150%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  button: {
    width: 220,
    height: 60,
    marginTop: 20,
    backgroundColor: '#091A41',
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: "Vilonti-Bold",
  },
  infoText: {
    textAlign: 'center',
    fontFamily: "Vilonti-Bold",
    fontSize: 24,
    color: '#004080',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: 280,
    height: 150,
    alignSelf: 'center',
    marginVertical: 20,
  },
  cityName: {
    fontSize: 24,
    fontFamily: 'Vilonti-Bold',
    color: '#000000',
    marginBottom: 15,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 24,
    fontFamily: 'Vilonti-Bold',
    color: '#091A41',
    marginLeft: 10,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Vilonti-Bold',
    color: '#091A41',
  },
  statusButton: {
    backgroundColor: '#091A41',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
