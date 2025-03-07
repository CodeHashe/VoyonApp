import React,{useEffect,useState} from "react";
import { View,Text,FlatList,TouchableOpacity,StyleSheet,ActivityIndicator } from "react-native";
import { useNavigation } from "expo-router";
import {db,collection,getdocs}from "../firebaseConfig";

const yourPlacePage=() =>{

    const navigation=useNavigation();
    const[places,setPlaces]=useState([]);
    const[loading,setLoading]=useState([true]);

    useEffect(() => {
        const fetchPlaces = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, "places"));
            const placesList = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPlaces(placesList);
          } 
          catch (error) {
            console.error("Error fetching places:", error);
          } 
          finally {
            setLoading(false);
          }
        };
    
        fetchPlaces();
      }, []);

      const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.push(`/places/${item.id}`)}>
          <View style={styles.textContainer}>
            <Text style={styles.placeName}>{item.location}</Text>
            <Text style={styles.visitDate}>Visited On: {item.dateVisited}</Text>
            <Text style={styles.email}>Email: {item.email}</Text>
          </View>
        </TouchableOpacity>
      );
    
      if (loading) {
        return <ActivityIndicator size="large" color="#00214d" style={{ marginTop: 20 }} />;
      }
    
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Your Visited Places</Text>
          <FlatList 
            data={places} 
            keyExtractor={(item) => item.id} 
            renderItem={renderItem} 
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    };

const styles = StyleSheet.create(
    container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textContainer: {
    marginLeft: 10,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  visitDate: {
    fontSize: 14,
    color: "#555",
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
);
