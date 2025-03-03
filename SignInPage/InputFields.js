import { View, Text, TextInput, StyleSheet } from "react-native";

export default function InputFields(props) {
  const { InputFieldText } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{InputFieldText}</Text>
      <TextInput
        style={styles.inputField}
        placeholder="Type here..."
        placeholderTextColor="#5A6B8C" // Lighter placeholder for better contrast
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15, // Space between input fields
  },

  text: {
    fontFamily: "Vilonti-Bold",
    fontSize: 16,
    color: "white",
    marginBottom: 5, // Space between label and input
  },

  inputField: {
    width: 311,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#132143", // Matches your design
    color: "white", // Text color inside the input
    fontFamily: "Vilonti-Bold",
    paddingLeft: 15, // Better spacing for text input
    borderWidth: 1, // Slight border for depth
    borderColor: "#5A6B8C", // Subtle border color
  },
});
