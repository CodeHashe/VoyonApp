import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function SearchByAirFlights({ navigation, route }) {
    const {
        apiKey,         // Amadeus API key
        clientSecret,   // Amadeus secret
        googleApiKey,   // Google Places API key
        destination, // Destination city (like "New York")
        startDate,
        endDate,
        adults,
        children,
        infants
    } = route.params;

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    async function authorizeAmadeus(apiKey, clientSecret) {
        const body = `grant_type=client_credentials&client_id=${apiKey}&client_secret=${clientSecret}`;

        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });

        const data = await response.json();
        return data.access_token;
    }

    async function findNearestAirport(googleApiKey, latitude, longitude) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50000&type=airport&key=${googleApiKey}`;

        const response = await fetch(url);
        const data = await response.json();
        console.log("Nearby airports:", data);

        if (data.results && data.results.length > 0) {
            return data.results[0].name;
        } else {
            throw new Error('No nearby airport found.');
        }
    }

    async function getAirportIATAFromName(airportName, accessToken) {
        const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(airportName)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        console.log("IATA from Amadeus:", data);

        if (data.data && data.data.length > 0 && data.data[0].iataCode) {
            return data.data[0].iataCode;
        } else {
            throw new Error('No IATA code found for airport: ' + airportName);
        }
    }

    async function getCityAirportIATA(cityName, accessToken) {
        const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(cityName)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        console.log("Destination IATA:", data);

        if (data.data && data.data.length > 0 && data.data[0].iataCode) {
            return data.data[0].iataCode;
        } else {
            throw new Error('Destination IATA code not found for city: ' + cityName);
        }
    }

    async function fetchFlights(accessToken, originIATA, destinationIATA) {
        const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originIATA}&destinationLocationCode=${destinationIATA}&departureDate=${startDate}&adults=${adults}&currencyCode=USD&max=10`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        console.log("Flights:", data);

        return data.data;
    }

    useEffect(() => {
        async function getFlights() {
            try {
                // Step 1: Request location permissions
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission denied', 'Location permission is required to fetch nearest airport.');
                    setLoading(false);
                    return;
                }

                // Step 2: Get user's location
                let location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                console.log("User Location:", latitude, longitude);

                // Step 3: Get Amadeus Access Token
                const token = await authorizeAmadeus(apiKey, clientSecret);

                // Step 4: Find Nearest Airport Name (Google Places API)
                const nearestAirportName = await findNearestAirport(googleApiKey, latitude, longitude);

                // Step 5: Find Origin IATA from Airport Name
                const originIATA = await getAirportIATAFromName(nearestAirportName, token);

                // Step 6: Find Destination City IATA
                const destinationIATA = await getCityAirportIATA(destination, token);

                // Step 7: Fetch Flight Offers
                const flightData = await fetchFlights(token, originIATA, destinationIATA);
                setFlights(flightData);

            } catch (error) {
                console.error("Error fetching flights:", error);
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        }

        getFlights();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={flights}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.flightItem}>
                        <Text style={styles.text}>Flight Price: {item.price.total} USD</Text>
                        <Text style={styles.text}>From: {item.itineraries[0].segments[0].departure.iataCode}</Text>
                        <Text style={styles.text}>To: {item.itineraries[0].segments[0].arrival.iataCode}</Text>
                        <Text style={styles.text}>Departure: {item.itineraries[0].segments[0].departure.at}</Text>
                        <Text style={styles.text}>Arrival: {item.itineraries[0].segments[0].arrival.at}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    flightItem: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
    },
});
