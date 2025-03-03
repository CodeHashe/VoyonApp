import React from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

const ICONS = ["bicycle", "car", "airplane"]; // Icons to animate
const ROWS = Math.floor(height / 80); // Rows based on screen height

export default function AnimatedBackground() {
  return (
    <View style={styles.container}>
      {Array.from({ length: ROWS }).map((_, rowIndex) => (
        <AnimatedRow key={rowIndex} delay={rowIndex * 300} />
      ))}
    </View>
  );
}

const AnimatedRow = ({ delay }) => {
  const translateX = new Animated.Value(-100);

  Animated.loop(
    Animated.timing(translateX, {
      toValue: width + 100,
      duration: 4000,
      delay,
      useNativeDriver: true,
    })
  ).start();

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
      {ICONS.map((icon, index) => (
        <Ionicons key={index} name={icon} size={50} color="#06193F" style={styles.transparentIcon} />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF", // White background
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    gap: 50,
    marginVertical: 40,
  },
  transparentIcon: {
    opacity: 0.2, // Transparent effect
  },
});
