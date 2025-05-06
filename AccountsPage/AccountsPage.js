import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../Firebase/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AnimatedBackground from "../AnimatedBackground";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";

const { width, height } = Dimensions.get("window");

export default function AccountsPage({ navigation }) {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getUserData = async () => {
    setIsLoading(true);
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
          setEmail(userData.email || user.email || "");
          if (userData.profileImage) {
            setProfileImage(userData.profileImage);
          }
        } else {
          const newUserData = {
            firstname: "",
            lastname: "",
            username: "",
            email: user.email,
            createdAt: new Date(),
          };
          await setDoc(userDocRef, newUserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data. Please try again.");
      }
    } else {
      Alert.alert("Not Signed In", "Please sign in to view your account.");
      navigation.navigate("SignIn");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getUserData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload a profile picture."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressedImage = await compressImage(result.assets[0].uri);
        uploadImage(compressedImage);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };
  const compressImage = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log("Original image size:", fileInfo.size);
      if (fileInfo.size < 300000) {
        return uri;
      }

      let quality = 0.7;
      if (fileInfo.size > 1000000) {
        quality = 0.5;
      }
      if (fileInfo.size > 2000000) {
        quality = 0.3;
      }

      
      const newUri =
        FileSystem.cacheDirectory +
        "compressed_" +
        new Date().getTime() +
        ".jpg";

      
      await FileSystem.manipulateAsync(uri, [], {
        compress: quality,
        format: FileSystem.ManipulateFormat.JPEG,
        saveToPhotoLibrary: false,
      }).then((result) => {
        uri = result.uri;
      });

      const compressedFileInfo = await FileSystem.getInfoAsync(uri);
      console.log("Compressed image size:", compressedFileInfo.size);

      return uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      return uri;
    }
  };

  const uploadImage = async (uri) => {
    setIsUploading(true);
    setUploadProgress(0);
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Error",
        "You must be signed in to upload a profile picture."
      );
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const timestamp = new Date().getTime();
      const filename = `profile_${user.uid}_${timestamp}.jpg`;

      const storageRef = ref(storage, `profileImages/${filename}`);

      console.log("Uploading image to:", `profileImages/${filename}`);
      console.log("Image size:", blob.size, "bytes");

    
      const uploadTask = uploadBytesResumable(storageRef, blob);

      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          
          console.error("Upload error:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Error server response:", error.serverResponse);

          let errorMessage = "Failed to upload image. ";

          if (error.code) {
            errorMessage += `Error code: ${error.code}. `;
          }

          if (error.message) {
            errorMessage += error.message;
          }

          Alert.alert("Error", errorMessage);
          setIsUploading(false);
        },
        async () => {
          
          console.log("Upload completed successfully");

          try {
            
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL:", downloadURL);

            
            const userDocRef = doc(db, "users", user.uid);

           
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
              await updateDoc(userDocRef, {
                profileImage: downloadURL,
                updatedAt: new Date(),
              });
            } else {
              
              await setDoc(userDocRef, {
                profileImage: downloadURL,
                email: user.email,
                createdAt: new Date(),
              });
            }

            
            setProfileImage(downloadURL);
            Alert.alert("Success", "Profile picture updated successfully!");
          } catch (error) {
            console.error(
              "Error getting download URL or updating profile:",
              error
            );
            Alert.alert(
              "Error",
              "Failed to complete the upload process. Please try again."
            );
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Error preparing upload:", error);
      Alert.alert(
        "Error",
        "Failed to prepare the image for upload. Please try again."
      );
      setIsUploading(false);
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be signed in to update your profile.");
      setIsLoading(false);
      return;
    }

    // Validate inputs
    if (!firstname.trim() || !lastname.trim() || !username.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Check if document exists first
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          firstname,
          lastname,
          username,
          updatedAt: new Date(),
        });
      } else {
        // Create the document if it doesn't exist
        await setDoc(userDocRef, {
          firstname,
          lastname,
          username,
          email: user.email,
          createdAt: new Date(),
        });
      }

      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({
              index: 0,
              routes: [{ name: "SignIn" }],
            });
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground style={styles.animatedBackground} />

      {/* Top Section with Blue Oval */}
      <View style={styles.topSection}>
        <View style={styles.topLeftContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-outline" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.vilontiBoldHeading}>Account</Text>
        </View>
      </View>

      {/* Main Content */}
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
            {/* Profile Image Section */}
            <View style={styles.profileImageContainer}>
              {isUploading ? (
                <View style={styles.profileImagePlaceholder}>
                  <ActivityIndicator size="large" color="#2D54EE" />
                  {uploadProgress > 0 && (
                    <Text style={styles.uploadProgressText}>
                      {Math.round(uploadProgress)}%
                    </Text>
                  )}
                </View>
              ) : (
                <TouchableOpacity onPress={pickImage} disabled={isUploading}>
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                  <View style={styles.editImageIconContainer}>
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isUploading}
              >
                <Text style={styles.changeImageText}>
                  {isUploading ? "Uploading..." : "Change Profile Picture"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#7A8CA8"
                value={firstname}
                onChangeText={setFirstName}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                placeholderTextColor="#7A8CA8"
                value={lastname}
                onChangeText={setLastName}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#7A8CA8"
                value={username}
                onChangeText={setUsername}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, { opacity: 0.7 }]}
                placeholder="Your email address"
                placeholderTextColor="#7A8CA8"
                value={email}
                editable={false}
              />
            </View>

            {/* Action Buttons */}
            {isEditing ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    getUserData();
                    setIsEditing(false);
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={updateProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Help Button */}
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpText}>Need Help?</Text>
            </TouchableOpacity>
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
    top: -100,
    left: -90,
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
    fontSize: 35,
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
    gap: 15,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2D54EE",
  },
  editImageIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2D54EE",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(45, 84, 238, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#2D54EE",
  },
  uploadProgressText: {
    color: "white",
    fontFamily: "Vilonti-Bold",
    fontSize: 16,
    marginTop: 5,
  },
  changeImageButton: {
    marginTop: 10,
  },
  changeImageText: {
    color: "#2D54EE",
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
  },
  inputContainer: {
    width: "80%",
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: "Vilonti-Bold",
    fontSize: 16,
    color: "white",
    marginBottom: 5,
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#132143",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: "white",
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#5A6B8C",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#2D54EE",
    width: "80%",
  },
  saveButton: {
    backgroundColor: "#2D54EE",
    width: "48%",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2D54EE",
    width: "48%",
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF3B30",
    width: "80%",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontFamily: "Vilonti-Bold",
    fontSize: 16,
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontFamily: "Vilonti-Bold",
    fontSize: 16,
  },
  helpButton: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2D54EE",
  },
  helpText: {
    fontFamily: "Vilonti-Regular",
    fontSize: 16,
    color: "#2D54EE",
  },
});
