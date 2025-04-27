"use client";

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
import { getFirestore, setDoc, doc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import InputFields from "../SignInPage/InputFields";
import Buttons from "../LaunchPage/Buttons";
import AnimatedBackground from "../AnimatedBackground";
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);
const { width, height } = Dimensions.get("window");

export default function SignUpPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        firstname,
        lastname,
      });

      await sendEmailVerification(user);
      Alert.alert("Success", "Sign-up successful! Please verify your email.");
      navigation.navigate("Places");
    } catch (error) {
      Alert.alert("Error", error.message);
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
          <Text style={styles.vilontiBoldHeading}>Sign Up</Text>
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
              InputFieldText="Enter your email"
              value={email}
              onChangeText={setEmail}
            />
            <InputFields
              InputFieldText="Enter a valid username"
              value={username}
              onChangeText={setUsername}
            />
            <InputFields
              InputFieldText="Enter your First Name"
              value={firstname}
              onChangeText={setFirstName}
            />
            <InputFields
              InputFieldText="Enter your Last Name"
              value={lastname}
              onChangeText={setLastName}
            />
            <InputFields
              InputFieldText="Enter a valid password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <InputFields
              InputFieldText="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Buttons
              name="Sign Up"
              buttonFill="#2D54EE"
              textColor="#FFFFFF"
              onPress={handleSignUp}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}
// Only the styles section needs to be updated
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
    backgroundColor: "rgba(45, 84, 238, 1)",
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
    fontSize: width * 0.05,
    marginLeft: 5,
  },
  vilontiBoldHeading: {
    fontFamily: "Vilonti-Bold",
    fontSize: width * 0.08,
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
});
