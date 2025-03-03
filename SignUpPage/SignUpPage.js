import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import InputFields from "../SignInPage/InputFields";
import Buttons from "../LaunchPage/Buttons";
import { Dimensions } from "react-native";
import { useState, useEffect } from "react";
import AnimatedBackground from "../AnimatedBackground";

const { width, height } = Dimensions.get("window");

export default function SignUpPage({ navigation }) {
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
        <AnimatedBackground style={styles.animatedBackground} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={[styles.topLeftContainer, isKeyboardVisible && styles.topLeftContainerShift]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="white" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.vilontiBoldHeading}>Sign Up</Text>
            </View>

            <View style={styles.inputFieldsContainer}>
              <InputFields InputFieldText="Enter your email" />
              <InputFields InputFieldText="Enter a valid username"/>
              <InputFields InputFieldText="Enter a valid password" />
              <InputFields InputFieldText="Confirm Password"/>

              <Buttons name="Sign Up" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => navigation.goBack()} />
              <Buttons name="Sign Up with Google" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => navigation.goBack()} />
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
      backgroundColor: "transparent", 
    },
  
    animatedBackground: {
      ...StyleSheet.absoluteFillObject, 
      zIndex: -1, 
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
      height: height * 0.67,
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
  