import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import InputFields from "./InputFields";
import Buttons from "../LaunchPage/Buttons";
import { Dimensions } from "react-native";
import { useState, useEffect } from "react";
import AnimatedBackground from "../AnimatedBackground";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../Firebase/firebaseConfig"; // Ensure correct Firebase config path

const auth = getAuth(app);
const { width, height } = Dimensions.get("window");

export default function SignInPage({ navigation }) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Accounts"); // Navigate on successful login
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

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
                <Text style={styles.vilontiBoldHeading}>Log In</Text>
              </View>

              <View style={styles.inputFieldsContainer}>
                <InputFields InputFieldText="Email" value={email} onChangeText={setEmail} />
                <InputFields InputFieldText="Password" secureTextEntry value={password} onChangeText={setPassword} />

                <View style={styles.loginButtonsContainer}>
                  <Text style={[styles.loginButtons, { color: "#909AB1" }]}>Forgot your Password? </Text>
                  <Text style={[styles.loginButtons, { color: "#2D54EE" }]}>Click Here</Text>
                </View>
                <View style={styles.loginButtonsContainer}>
                  <Text style={[styles.loginButtons, { color: "#909AB1" }]}>Don't have an account? </Text>
                  <Text style={[styles.loginButtons, { color: "#2D54EE" }]}>Sign Up</Text>
                </View>

                <Buttons name="Log In" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={handleSignIn} />
                <Buttons name="Sign In with Google" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => Alert.alert("Google Sign-In not implemented yet!")} />
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
    backgroundColor: "rgba(45, 84, 238, 0.7)",
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
    width: width * 1.1,
    height: height * 0.5,
    backgroundColor: "rgba(6, 25, 63, 0.8)",
    position: "absolute",
    bottom: 0,
    flexDirection: "column",
    borderTopLeftRadius: width * 0.4,
    borderTopRightRadius: width * 0.4,
    overflow: "hidden",
    alignSelf: "center",
    paddingTop: height * 0.08,
    paddingBottom: height * 0.05,
    alignItems: "center",
    justifyContent: "center",
    gap: "10",
  },
});
