import { View, Pressable, Text, StyleSheet, TouchableOpacity} from "react-native";

export default function Buttons(props) {
  const { name, buttonFill, textColor, onPress } = props;

  return (
    <View>
      <TouchableOpacity style={[styles.button, { backgroundColor: buttonFill }] } onPress = {onPress}>
        <Text style={[styles.text, { color: textColor }]}>{name}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "Vilonti-Bold",
    fontSize: 15,
    textAlign: "center",
  },

  button: {
    width: 135,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor:"#2D54EE"
  },
});
