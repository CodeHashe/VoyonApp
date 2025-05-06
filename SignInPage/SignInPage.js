import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import InputFields from "./InputFields";
import Buttons from "../LaunchPage/Buttons";
import AnimatedBackground from "../AnimatedBackground";
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);
const { width, height } = Dimensions.get("window");

export default function SignInPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground style={styles.animatedBackground} />

      {/* Fixed top oval container */}
      <View style={styles.topSection}>
        <View style={styles.topLeftContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-outline" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.vilontiBoldHeading}>Log In</Text>
        </View>
      </View>

      {/* Form section with KeyboardAwareScrollView */}
      <View style={styles.bottomSection}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid={true}
          enableAutomaticScroll={Platform.OS === "ios"}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === "ios" ? 20 : 0}
          extraHeight={120}
          resetScrollToCoords={{ x: 0, y: 0 }}
        >
          <View style={styles.formContainer}>
            <InputFields
              InputFieldText="Email"
              value={email}
              onChangeText={setEmail}
            />
            <InputFields
              InputFieldText="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={[styles.loginButtons, { color: "#2D54EE" }]}>
                Forgot your Password? Click Here
              </Text>
            </TouchableOpacity>

            <View style={styles.loginButtonsContainer}>
              <Text style={[styles.loginButtons, { color: "white" }]}>
                Don't have an account?{" "}
              </Text>
              <Text
                style={[styles.loginButtons, { color: "#2D54EE" }]}
                onPress={() => navigation.navigate("SignUp")}
              >
                Sign Up
              </Text>
            </View>

            <Buttons
              name="Log In"
              buttonFill="#2D54EE"
              textColor="#FFFFFF"
              onPress={handleSignIn}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06193F",
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  topSection: {
    height: height * 0.3,
    width: width,
    position: "relative",
    overflow: "visible", // Important to allow the oval to overflow
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "rgba(6, 25, 63, 0.8)",
    borderTopLeftRadius: width * 0.4,
    borderTopRightRadius: width * 0.4,
  },
  topLeftContainer: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: "rgba(30, 60, 200, 1)",
    borderRadius: 300,
    justifyContent: "center",
    paddingLeft: 120,
    paddingTop: 80,
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
  vilontiBoldHeading: {
    fontFamily: "Vilonti-Bold",
    fontSize: 40,
    color: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
  },
  formContainer: {
    alignItems: "center",
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
    gap: 10,
  },
  loginButtons: {
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
  },
  loginButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
