import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InfoCards = ({ openingHours }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="calendar" size={24} color="#000" />
        <View style={styles.openingHours}>
          {openingHours ? (
            openingHours.map((day, index) => (
              <Text key={index} style={styles.dayText}>
                {day}
              </Text>
            ))
          ) : (
            <Text style={styles.dayText}>No hours</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: 200, // Or whatever width you want
    elevation: 3, // Adds shadow on Android
    shadowColor: "#000", // Shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  openingHours: {
    marginTop: 10,
    alignItems: "center",
  },
  dayText: {
    fontSize: 13,
    color: "#333",
    marginVertical: 2,
    textAlign: "center",
    fontFamily:"Vilonti-Bold",
  },
});

export default InfoCards;
