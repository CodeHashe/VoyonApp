import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import app from "../Firebase/firebaseConfig";

const auth = getAuth(app);

export default function VerificationPage({ navigation }) {
    const [loading, setLoading] = useState(false);

    const checkVerificationStatus = async () => {
        setLoading(true);
        const user = auth.currentUser;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            await user.reload();
            const updatedUser = auth.currentUser;

            console.log("Email Verified Status:", updatedUser.emailVerified);

            if (updatedUser.emailVerified) {
                alert("✅ Email verified! Redirecting...");
                navigation.replace("Accounts");
            } else {
                alert("❌ Email not verified yet. Please check your inbox.");
                setLoading(false);
                return; 
            }
        } catch (error) {
            alert("⚠️ Error checking verification status: " + error.message);
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Please verify your email and then click the button below to continue.
            </Text>

            <TouchableOpacity onPress={checkVerificationStatus} style={styles.button}>
                <Text style={styles.buttonText}>Check Verification Status</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    text: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center"
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    }
});
