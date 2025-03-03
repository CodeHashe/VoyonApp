import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import Buttons from "./Buttons";

export default function LaunchPage({navigation}) {
  return (
    <View style={styles.container}>
        <View style = {styles.container}> 
            <Image source={require("../assets/SignInLogo.png")} style={styles.logo} />
            <Text style={styles.vilontiboldHeading}>Voyon</Text>
            <Text style={styles.vilontiboldBody}>Look First, Then Leap</Text>
        </View>

      <View style={styles.buttonContainer}>
      <Buttons name="Log In" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => navigation.navigate("SignIn")} />
      <Buttons name="Sign Up" buttonFill="#06193F" textColor="#2D54EE" onPress={() => navigation.navigate("SignUp")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  },
  vilontiboldBody: {
    fontFamily: "Vilonti-Bold",
    fontSize: 20,
    color: "#186EA1",
    marginBottom: 20,
  },
  curvedContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "45%", 
    alignItems: "center",
  },
  curvedBackground: {
    width: "140%", 
    height: "100%",
    resizeMode: "cover",
  },
  buttonContainer: {
    width: "135%", // Make it wider for the elliptical effect
    height: "30%", // Adjust height
    backgroundColor: "#06193F",
    position: "absolute",
    bottom: 0,
    alignItems: "center", // Center elements horizontally
    justifyContent: "center", // Center elements vertically
    flexDirection: "column",
    borderTopLeftRadius: 300, // Maintain elliptical shape
    borderTopRightRadius: 300,
    overflow: "hidden",
    gap:20
  },
});
