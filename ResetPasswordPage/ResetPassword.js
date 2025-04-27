<<<<<<< HEAD
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  Dimensions
} from "react-native";
import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from "../Firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");
const auth = getAuth(app);
=======
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
>>>>>>> 01b4d43ff8bb0fe5132fb7e0745d724734a62cb2

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

<<<<<<< HEAD
  const handleResetPassword = () => {
=======
  const handleResetPassword = async () => {
>>>>>>> 01b4d43ff8bb0fe5132fb7e0745d724734a62cb2
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

<<<<<<< HEAD
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Reset Link Sent", "Check your email for the reset link.");
        navigation.goBack();
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          
          <View style={styles.headerBackground}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={24} color="white" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Reset{"\n"}Password</Text>
          </View>

          
          <View style={styles.illustration} />

          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Please enter your email</Text>
            <TextInput
              style={styles.input}
              placeholder="Type here..."
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
              <Text style={styles.resetButtonText}>Reset Password</Text>
            </TouchableOpacity>

            
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
=======
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
>>>>>>> 01b4d43ff8bb0fe5132fb7e0745d724734a62cb2
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  innerContainer: { flex: 1, backgroundColor: "white" },
  headerBackground: {
    backgroundColor: "#2D54EE",
    height: height * 0.3,
    borderBottomRightRadius: width * 0.6,
    paddingTop: 50,
    paddingLeft: 20,
=======
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
>>>>>>> 01b4d43ff8bb0fe5132fb7e0745d724734a62cb2
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
<<<<<<< HEAD
  },
  backText: {
    color: "white",
    fontSize: 18,
    marginLeft: 5,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
  },
  illustration: {
    height: height * 0.2,
    backgroundColor: "#eee", 
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#06193F",
    borderTopLeftRadius: width * 0.6,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: "90%",
    backgroundColor: "#122347",
    padding: 12,
    borderRadius: 10,
    color: "white",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#2D54EE",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
  },
});
=======
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
>>>>>>> 01b4d43ff8bb0fe5132fb7e0745d724734a62cb2
