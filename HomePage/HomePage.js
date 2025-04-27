import {
  View,
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import fetchWeatherForCurrentLocation from "../fetchData/fetchWeatherForCurrentLocation";
import fetchLocationImage from "../fetchData/fetchLocationImage";
import fetchPlaceID from '../fetchData/fetchPlaceID';
import CurrentLocationContainers from './CurrentLocationContainers';
import CountryContainers from './CountryContainers';
import PopularCountriesContainers from './PopularCountriesContainers';

const apiKey = "AIzaSyDfnOoS_Dk6JuEK7KeoqpKg-2XSudJ0mZo";

export default function HomePage({ navigation }) {
  const [locationName, setLocationName] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [currentlocImage, setcurrentlocImage] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [destination, setDestination] = useState('');
  const [travelMode, setTravelMode] = useState('driving'); // "driving" or "transit"
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      let [geo] = await Location.reverseGeocodeAsync(loc.coords);
      setLocationName(geo);
      setWeatherData(
        await fetchWeatherForCurrentLocation(loc.coords.latitude, loc.coords.longitude)
      );
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!locationName?.city) return;
      const placeID = await fetchPlaceID(locationName.city, apiKey);
      setcurrentlocImage(await fetchLocationImage(placeID, apiKey));
    })();
  }, [locationName]);

  async function handleSearch() {
    console.log("🔍 handleSearch fired", { destination, travelMode });
    // Debug; remove once it's working
    // Alert.alert('Debug', `Searching for "${destination}" by ${travelMode}`);

    try {
      if (!destination.trim() || !coords.latitude) return;

      // 1) Geocode the user-entered destination
      const destEnc = encodeURIComponent(destination);
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${destEnc}&key=${apiKey}`
      );
      const geoJson = await geoRes.json();
      if (!geoRes.ok || geoJson.status !== 'OK' || !geoJson.results.length) {
        console.error("Geocode error:", geoJson);
        Alert.alert('Error', 'Unable to locate destination.');
        return;
      }
      const { lat, lng } = geoJson.results[0].geometry.location;

      // 2) ComputeRouteMatrix call
      const matrixRes = await fetch(
        'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,status'
          },
          body: JSON.stringify({
            origins: [
              {
                waypoint: {
                  location: {
                    latLng: {
                      latitude: coords.latitude,
                      longitude: coords.longitude
                    }
                  }
                }
              }
            ],
            destinations: [
              {
                waypoint: {
                  location: {
                    latLng: { latitude: lat, longitude: lng }
                  }
                }
              }
            ],
            travelMode: travelMode === 'driving' ? 'DRIVE' : 'TRANSIT'
          })
        }
      );

      if (!matrixRes.ok) {
        const errorText = await matrixRes.text();
        console.error("Matrix HTTP error:", matrixRes.status, errorText);
        Alert.alert('Error', `Routing failed (${matrixRes.status})`);
        return;
      }

      const matrixJson = await matrixRes.json();
      // Your last console.log showed an array of elements:
      // [ { originIndex:0, destinationIndex:0, distanceMeters:..., duration:"...", status:{} } ]

      console.log(matrixJson);

      if (!Array.isArray(matrixJson) || matrixJson.length === 0) {
        console.error("Unexpected matrix response:", matrixJson);
        Alert.alert('Error', 'No route returned.');
        return;
      }

      const element = matrixJson[0];
      // Treat an empty status object (no code field) as OK (code 0)
      const statusObj = element.status || {};
      const statusCode = typeof statusObj.code === 'number' ? statusObj.code : 0;

      if (statusCode === 0) {
        if (element.distanceMeters === 0) {
          Alert.alert('Info', 'You are already at this location.');
        } else {
          navigation.navigate('SearchPage', { destination, travelMode });
        }
      } else {
        Alert.alert('Travel Mode', 'This location may be better reached by air.');
      }
    } catch (err) {
      console.error("❌ handleSearch outer error:", err);
      Alert.alert('Error', err.message || 'Unknown error');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        {locationName && weatherData && currentlocImage ? (
          <ImageBackground
            source={{ uri: currentlocImage }}
            style={styles.headerCard}
            imageStyle={styles.headerImage}
          >
            <View style={styles.overlay} />

            {/* Top row: sign-in icon + travel-mode dropdown */}
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.iconButton}>
                <Image
                  source={require("../assets/SignInLogo.png")}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setDropdownOpen(o => !o)}
                >
                  <FontAwesome5
                    name={travelMode === 'driving' ? 'car' : 'plane'}
                    size={16}
                    color="#fff"
                  />
                  <FontAwesome5
                    name="caret-down"
                    size={16}
                    color="#fff"
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
                {dropdownOpen && (
                  <View style={styles.dropdownOptions}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setTravelMode('driving');
                        setDropdownOpen(false);
                      }}
                    >
                      <FontAwesome5 name="car" size={18} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setTravelMode('transit');
                        setDropdownOpen(false);
                      }}
                    >
                      <FontAwesome5 name="plane" size={18} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Weather and location info */}
            <View style={styles.weatherInfo}>
              <Text style={styles.cityText}>
                {locationName.city}, {locationName.country}
              </Text>
              <View style={styles.weatherRow}>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
                  }}
                  style={styles.weatherIcon}
                />
                <Text style={styles.tempText}>
                  {Math.round(weatherData.main.temp)}°C
                </Text>
              </View>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Ionicons name="location-outline" size={18} color="#444" />
              <TextInput
                style={styles.input}
                placeholder="Where would you like to go?"
                placeholderTextColor="#444"
                value={destination}
                onChangeText={setDestination}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                blurOnSubmit
              />
              <TouchableOpacity
                onPress={handleSearch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="search" size={18} color="#444" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        ) : (
          <Text>Loading...</Text>
        )}

        {/* The rest of your containers */}
        <View style={styles.stackContainer}>
          {locationName?.city && coords.latitude && (
            <CurrentLocationContainers
              apiKey={apiKey}
              locationName={locationName.city}
              locationLat={coords.latitude}
              locationLong={coords.longitude}
            />
          )}
          {locationName?.country && (
            <CountryContainers
              apiKey={apiKey}
              countryName={locationName.country}
              navigation={navigation}
            />
          )}
          <PopularCountriesContainers apiKey={apiKey} navigation={navigation} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
    marginBottom: 110,
  },
  headerCard: {
    width: '90%',
    height: 250,
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    borderRadius: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  dropdownOptions: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    zIndex: 10,
  },
  dropdownOption: {
    padding: 8,
    alignItems: 'center',
  },
  weatherInfo: {
    alignItems: 'center',
    zIndex: 1,
  },
  cityText: {
    color: '#fff',
    fontFamily: 'Vilonti-Bold',
    fontSize: 20,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  weatherIcon: {
    width: 40,
    height: 40,
  },
  tempText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Vilonti-Bold',
    marginLeft: 5,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Vilonti-Bold',
  },
  stackContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 40,
    flexDirection: 'column',
    gap: 15,
  },
});
