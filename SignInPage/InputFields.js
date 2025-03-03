import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window"); // Get screen size

export default function InputFields(props) {
  const { InputFieldText, value, onChangeText, onFocus } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{InputFieldText}</Text>
      <TextInput
        style={styles.inputField}
        placeholder="Type here..."
        placeholderTextColor="#7A8CA8"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: height * 0.02, // Increased margin for better spacing
    width: "85%", // Make the input field wider
    alignSelf: "center",
  },
  text: {
    fontFamily: "Vilonti-Bold",
    fontSize: width * 0.04, // Slightly increased text size
    color: "white",
    marginBottom: height * 0.007, // Adjusted spacing
  },
  inputField: {
    width: "90%", // Full width of container
    height: height * 0.04, // Significantly increased height for better touch experience
    borderRadius: width * 0.035, // More rounded corners
    backgroundColor: "#132143",
    color: "white",
    fontFamily: "Vilonti-Bold",
    paddingHorizontal: width * 0.05, // More padding inside the input
    borderWidth: 1.5, // Slightly thicker border
    borderColor: "#5A6B8C",
    fontSize: width * 0.04, // Slightly larger font size
  },
});
