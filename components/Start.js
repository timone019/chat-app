import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, TextInput } from "react-native";
import Background from "./Background";

const Start = ({ navigation, route }) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (route.params?.message) {
      setMessage(route.params.message);
      navigation.setOptions({ title: route.params.message });
    }
  }, [route.params?.message]);

  return (
    <Background>
      <Text>Hello Start!!</Text>
      <TextInput
        style={styles.textInput}
        value={message}
        onChangeText={setMessage}
        placeholder="Type your message here"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Chat", { message: message })}
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

export default Start;
