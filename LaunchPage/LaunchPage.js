import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import Buttons from "./Buttons";
import AnimatedBackground from "../AnimatedBackground";

export default function LaunchPage({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground style={styles.animatedBackground} />
      <View style={styles.container}>
        <Image
          source={require("../assets/SignInLogo.png")}
          style={styles.logo}
        />
        <Text style={styles.vilontiboldHeading}>Voyon</Text>
        <Text style={styles.vilontiboldBody}>Look First, Then Leap</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Buttons
          name="Log In"
          buttonFill="#2D54EE"
          textColor="#FFFFFF"
          onPress={() => navigation.navigate("SignIn")}
        />
        <Buttons
          name="Sign Up"
          buttonFill="#06193F"
          textColor="#2D54EE"
          onPress={() => navigation.navigate("SignUp")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "transparent",
    width: "100%", // Ensure full width
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  logo: {
    height: 159,
    width: 279,
    marginBottom: 10,
  },
  vilontiboldHeading: {
    fontFamily: "Vilonti-Bold",
    fontSize: 40,
    color: "#186EA1",
    textAlign: "center",
  },
  vilontiboldBody: {
    fontFamily: "Vilonti-Bold",
    fontSize: 20,
    color: "#186EA1",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "119%", // Ensure buttons are centered properly
    height: "30%",
    backgroundColor: "#06193F",
    position: "absolute",
    bottom: 0,
    left: "-8%", // Shift slightly to the left
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    borderTopLeftRadius: 300,
    borderTopRightRadius: 310,
    overflow: "hidden",
    gap: 20,
    paddingHorizontal: 20, // Add padding to keep elements centered
  },
});
