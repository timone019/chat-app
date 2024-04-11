import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import Background from "./Background";

const Chat = ({ route, navigation }) => {
  const { message } = route.params;
  const [text, setText] = useState(message);

  useEffect(() => {
    if (route.params?.message) {
      setText(route.params.message);
      navigation.setOptions({ title: route.params.message });
    }
  }, [route.params?.message]);

  return (
    <Background>
      <Text>Hello Chat!</Text>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Type your message here"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => 
          // navigation.setOptions({ title: message });
          navigation.navigate("Start", { message: text })}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </Background>
  );
};

const styles = StyleSheet.create({
  textInput: {
    width: "88%",
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default Chat;
