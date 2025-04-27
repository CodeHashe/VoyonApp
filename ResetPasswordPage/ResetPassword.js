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
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import InputFields from "../SignInPage/InputFields";
import Buttons from "../LaunchPage/Buttons";
import AnimatedBackground from "../AnimatedBackground";
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);
const { width, height } = Dimensions.get("window");

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Reset Link Sent", "Check your email for the reset link.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground style={styles.animatedBackground} />

      <View style={styles.topSection}>
        <View style={styles.topLeftContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-outline" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.vilontiBoldHeading}>Reset{"\n"}Password</Text>
        </View>
      </View>

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

            <Text style={[styles.instructionText, { color: "white" }]}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={[styles.loginButtons, { color: "#2D54EE" }]}>
                Remember your password? Log In
              </Text>
            </TouchableOpacity>

            <Buttons
              name="Reset Password"
              buttonFill="#2D54EE"
              textColor="#FFFFFF"
              onPress={handleResetPassword}
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
    overflow: "visible",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "rgba(6, 25, 63, 0.8)",
    borderTopLeftRadius: width * 0.4,
    borderTopRightRadius: width * 0.4,
  },
  topLeftContainer: {
    position: "absolute",
    top: -80,
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
    fontSize: 30,
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
  instructionText: {
    fontFamily: "Vilonti-Regular",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
});
