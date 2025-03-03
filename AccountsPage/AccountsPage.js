import React, { useState, useEffect } from "react";
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, Image 
} from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import app from "../Firebase/firebaseConfig";
import Ionicons from "react-native-vector-icons/Ionicons";

const auth = getAuth(app);
const db = getFirestore(app);

export default function AccountsPage({ navigation }) {
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const getUserData = async () => {
        const user = auth.currentUser;

        if (user) {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFirstName(userData.firstname || "");
                    setLastName(userData.lastname || "");
                    setUsername(userData.username || "");
                    setEmail(userData.email || "");
                } else {
                    alert("User data not found in Firestore!");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            alert("You aren't Signed In!");
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Profile Section */}
            <Text style={styles.header}>Account</Text>
            <Image 
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} 
                style={styles.profileImage} 
            />
            <Text style={styles.changePictureText}>Change Profile Picture</Text>

            {/* Info Section */}
            <View style={styles.infoContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor="white"
                    value={firstname}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor="white"
                    value={lastname}
                    onChangeText={setLastName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="white"
                    value={email}
                    editable={false} // Email should be read-only
                />
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="white"
                    value={username}
                    onChangeText={setUsername}
                />

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit profile</Text>
                </TouchableOpacity>
            </View>

            {/* Help Section */}
            <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpText}>Help?</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        alignItems: "center",
    },
    backButton: {
        flexDirection: "row",
        alignSelf: "flex-start",
        alignItems: "center",
        marginTop: 10,
    },
    backText: {
        color: "white",
        fontSize: 16,
        marginLeft: 5,
    },
    header: {
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10,
    },
    changePictureText: {
        fontSize: 14,
        color: "gray",
        marginTop: 5,
    },
    infoContainer: {
        backgroundColor: "#3B5BFF",
        padding: 20,
        borderRadius: 20,
        width: "100%",
        marginTop: 20,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "white",
        color: "white",
        fontSize: 16,
        paddingVertical: 5,
        marginBottom: 15,
    },
    editButton: {
        backgroundColor: "black",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    editButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    helpButton: {
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: "black",
    },
    helpText: {
        fontSize: 16,
        color: "black",
    },
});

