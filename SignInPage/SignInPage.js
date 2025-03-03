import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import InputFields from "./InputFields";
import Buttons from "../LaunchPage/Buttons";
import { Dimensions } from "react-native";
import { useState, useEffect } from "react";
import AnimatedBackground from "../AnimatedBackground";

const { width, height } = Dimensions.get("window");

export default function SignInPage({ navigation }) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Animated background positioned absolutely */}
      <AnimatedBackground style={styles.animatedBackground} />

      {/* Content should be on top of the animated background */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <View style={[styles.topLeftContainer, isKeyboardVisible && styles.topLeftContainerShift]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="arrow-back-outline" size={24} color="white" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.vilontiBoldHeading}>Log In</Text>
              </View>

              <View style={styles.inputFieldsContainer}>
                <InputFields InputFieldText="Email" />
                <InputFields InputFieldText="Password" />

                <View style={styles.loginButtonsContainer}>
                  <Text style={[styles.loginButtons, { color: "#909AB1" }]}>Forgot your Password? </Text>
                  <Text style={[styles.loginButtons, { color: "#2D54EE" }]}>Click Here</Text>
                </View>
                <View style={styles.loginButtonsContainer}>
                  <Text style={[styles.loginButtons, { color: "#909AB1" }]}>Don't have an account? </Text>
                  <Text style={[styles.loginButtons, { color: "#2D54EE" }]}>Sign Up</Text>
                </View>

                <Buttons name="Log In" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => navigation.goBack()} />
                <Buttons name="Sign In with Google" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => navigation.goBack()} />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent", // Make it transparent so the background is visible
  },

  animatedBackground: {
    ...StyleSheet.absoluteFillObject, // Ensures it covers the entire screen
    zIndex: -1, // Push it behind all other elements
  },

  topLeftContainer: {
    position: "absolute",
    top: -100, 
    left: -100, 
    width: 300, 
    height: 300, 
    backgroundColor: "rgba(45, 84, 238, 0.7)", // 70% opacity
    borderRadius: 300, 
    justifyContent: "center",
    paddingLeft: 120, 
    paddingTop: 80, 
    transition: "top 0.3s ease-in-out", 
  },
  

  topLeftContainerShift: {
    top: -180, 
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  backText: {
    fontFamily: "Vilonti-Bold",
    color: "white",
    fontSize: 20,
    marginLeft: 5,
  },

  loginButtons: {
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
  },

  loginButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  vilontiBoldHeading: {
    fontFamily: "Vilonti-Bold",
    fontSize: 40,
    color: "#FFFFFF",
  },

  inputFieldsContainer: {
    width: width * 1.3,
    height: height * 0.56,
    backgroundColor: "rgba(6, 25, 63, 0.8)", // 80% opacity
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    borderTopLeftRadius: width * 0.65,
    borderTopRightRadius: width * 0.65,
    overflow: "hidden",
    alignSelf: "center",
    gap: 20,
  }
  
});
