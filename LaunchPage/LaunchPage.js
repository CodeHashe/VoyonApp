import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import Buttons from "./Buttons";
import  Ellipse  from "./Ellipse";

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
      <Buttons name="Sign Up" buttonFill="#06193F" textColor="#FFFFFF" onPress={() => navigation.navigate("SignUp")} />
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
    height: 100,
    width: 100,
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
    height: "45%", // Increased size
    alignItems: "center",
  },
  curvedBackground: {
    width: "140%", // Extending it beyond screen width
    height: "100%",
    resizeMode: "cover",
  },
  buttonContainer: {
    position: "absolute",
    flexDirection: "column",  // Ensures buttons are stacked vertically
    bottom:60,
    alignItems: "center",     // Centers buttons horizontally
    gap: 15,
  },
});
