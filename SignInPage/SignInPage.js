import {View,Text, StyleSheet,TouchableOpacity, ScrollView, Alert, Dimensions} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

import InputFields from "./InputFields";
import Buttons from "../LaunchPage/Buttons";
import AnimatedBackground from "../AnimatedBackground";
import app from "../Firebase/firebaseConfig"; 
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });

console.log(redirectUri);

const auth = getAuth(app);
const { width, height } = Dimensions.get("window");

export default function SignInPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [request, response, promptasync] = Google.useAuthRequest({
    expoClientId: '681290823433-388l3jr5u5sp53hj19v4j24m5qk4gjdq.apps.googleusercontent.com',
    webClientId: '681290823433-enrei6ai0ctqj1o70tti2pk2ferru5ek.apps.googleusercontent.com',
    androidClientId: '681290823433-n00q8lt67ebe6mlf9qvto2pdopfm0m2f.apps.googleusercontent.com',
    iosClientId: '681290823433-fubkf2oj7hjc3hnvn86gt239olbel44q.apps.googleusercontent.com',
    redirectUri, 
  });


  useEffect(()=>{
      if (response?.type === 'success'){
        const {id_token} = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential);
      }
  }, [response]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Places");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };



  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground style={styles.animatedBackground} />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.container}>
              <View
                style={[
                  styles.topLeftContainer
                ]}
              >
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="white" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.vilontiBoldHeading}>Log In</Text>
              </View>

              {/* Form Section */}
              <View style={styles.inputFieldsContainer}>
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

                <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
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
                <Buttons
                  name="Sign In with Google"
                  buttonFill="#2D54EE"
                  textColor="#FFFFFF"
                  onPress={() => promptasync({ useProxy: true })}
                />
              </View>
            </View>
          </ScrollView>
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
    backgroundColor: "rgba(30, 60, 200, 1)",
    borderRadius: 300,
    justifyContent: "center",
    paddingLeft: 120,
    paddingTop: 80,
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
