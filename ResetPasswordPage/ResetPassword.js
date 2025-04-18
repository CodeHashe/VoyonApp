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
  
  export default function ResetPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
  
    const handleResetPassword = () => {
      if (!email) {
        Alert.alert("Error", "Please enter your email.");
        return;
      }
  
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
    );
  }
  
  const styles = StyleSheet.create({
    container: { flex: 1 },
    innerContainer: { flex: 1, backgroundColor: "white" },
    headerBackground: {
      backgroundColor: "#2D54EE",
      height: height * 0.3,
      borderBottomRightRadius: width * 0.6,
      paddingTop: 50,
      paddingLeft: 20,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
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
  