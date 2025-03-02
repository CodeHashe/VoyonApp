import { 
    View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, 
    ScrollView, TouchableWithoutFeedback, Keyboard, Platform, Dimensions 
  } from "react-native";
  import Ionicons from "react-native-vector-icons/Ionicons";
  import InputFields from "../SignInPage/InputFields";
  import Buttons from "../LaunchPage/Buttons";
  import { useState, useRef } from "react";
  import AnimatedBackground from "../AnimatedBackground";
  import { getFirestore, setDoc, doc } from "firebase/firestore";
  import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
  import app from "../Firebase/firebaseConfig"; 
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { width, height } = Dimensions.get("window");  // Get screen dimensions
  
  export default function SignUpPage({ navigation }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); 
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const scrollRef = useRef(null);
  
    const handleSignUp = async () => {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        if (user) {  
          await setDoc(doc(db, "users", user.uid), {
            username, email, firstname, lastname
          });
  
          alert("Sign-up successful!");
          navigation.navigate("Accounts");
        }
      } catch (error) {
        alert(error.message);
      }
    };
  
    return (
        <View style={{ flex: 1 }}> 
        <AnimatedBackground style={styles.animatedBackground} />
        <KeyboardAvoidingView 
  behavior={(Platform.OS === "ios" || Platform.OS === "android") ? "none" : "none"} 
  style={{ flex: 1 }}
>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }} 
              keyboardShouldPersistTaps="handled" // Allows taps to dismiss keyboard
              showsVerticalScrollIndicator={false} // Optional: Hides scroll bar
              ref={scrollRef}
            >
              <View style={styles.container}>
                {/* Back Button & Title */}
                <View style={styles.topLeftContainer}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="white" />
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.vilontiBoldHeading}>Sign Up</Text>
                </View>

                <View style={styles.inputFieldsContainer} >
                    <ScrollView contentContainerStyle={{ alignItems: "center", justifyContent:"center", gap:"10" }}>
                  <InputFields InputFieldText="Enter your email" value={email} onChangeText={setEmail} />
                  <InputFields InputFieldText="Enter a valid username" value={username} onChangeText={setUsername} />
                  <InputFields InputFieldText="Enter your First Name" value={firstname} onChangeText={setFirstName} />
                  <InputFields InputFieldText="Enter your Last Name" value={lastname} onChangeText={setLastName} />
                  <InputFields InputFieldText="Enter a valid password" value={password} onChangeText={setPassword} secureTextEntry />
                  <InputFields InputFieldText="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      
                  <Buttons name="Sign Up" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={handleSignUp} />
                  <Buttons name="Sign Up with Google" buttonFill="#2D54EE" textColor="#FFFFFF" onPress={() => navigation.goBack()} />
                </ScrollView>
                </View>
                {/* Input Fields Section */}
                
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
      alignItems: "center",
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
      fontSize: width * 0.05, // Responsive text size
      marginLeft: 5,
    },
    vilontiBoldHeading: {
      fontFamily: "Vilonti-Bold",
      fontSize: width * 0.08, // Responsive heading size
      color: "#FFFFFF",
    },
    inputFieldsContainer: {
        width: width * 1.1, 
        height: height * 0.80,  // Reduce height to prevent overlap
        backgroundColor: "rgba(6, 25, 63, 0.8)",  
        position: "absolute",
        bottom: 0,
        flexDirection: "column",
        borderTopLeftRadius: width * 0.4, // Reduce curve
        borderTopRightRadius: width * 0.4, 
        overflow: "hidden",
        alignSelf: "center",
        paddingTop: height * 0.08, // Push fields downwards
        paddingBottom: height * 0.05, 
      }
      
  });
  