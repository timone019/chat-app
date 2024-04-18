import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View

} from "react-native";
import Background from "./Background";
import { getAuth, signInAnonymously } from "firebase/auth";

// Start component with navigation prop
const Start = ({ navigation }) => {
  // State to hold the name input value
  const [name, setName] = useState("");
  const auth = getAuth()
  // State to hold the chosen background color
  const [background, setBackground] = useState("");

  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        navigation.navigate("Chat", {
          userID: result.user.uid,
          name: name,
          background: background,
        });
        Alert.alert("You have successfully signed in anonymously");
      })
      .catch((error) => {
        // console.error(error);
        Alert.alert("Unable to sign in, please try again");
      });
  };

  return (
    <Background>
      <Text>Hello Start!</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={setName}
        placeholder="Type here ..."
      />
    <View style={styles.chooseColorBox}>
          <Text style={styles.chooseColorText}>Choose Background Color:</Text>
          <View style={styles.colorButtonsContainer}>
            {/* Render a TouchableOpacity for each color option */}
            <TouchableOpacity
              style={[
                styles.chooseColor,
                { backgroundColor: "#090C08" },
                background === "#090C08" && styles.selectedColor,
              ]}
              // Set the function to handle button press
              onPress={() => setBackground("#090C08")}
            ></TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chooseColor,
                { backgroundColor: "#474056" },
                background === "#474056" && styles.selectedColor,
              ]}
              onPress={() => setBackground("#474056")}
            ></TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chooseColor,
                { backgroundColor: "#8A95A5" },
                background === "#8A95A5" && styles.selectedColor,
              ]}
              onPress={() => setBackground("#8A95A5")}
            ></TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chooseColor,
                { backgroundColor: "#B9C6AE" },
                background === "#B9C6AE" && styles.selectedColor,
              ]}
              onPress={() => setBackground("#B9C6AE")}
            ></TouchableOpacity>
          </View>
        </View>

      <TouchableOpacity
        title="Go to Chat"
        style={styles.button}
        accessible={true}
        accessibilityLabel="Go to Chat"
        accessibilityHint="Navigates to Chat"
        accessibilityRole="button"
        onPress={signInUser}
        // => { navigation.navigate("Chat", { name }) }
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" />
      ) : null}
      {Platform.OS === "android" ? <KeyboardAvoidingView /> : null}
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
  container: {
    width: "88%",
    height: "44%",
    backgroundColor: "white",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-evenly",
    borderRadius: 4,
  },
  chooseColorBox: {
    width: "84%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorButtonsContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  chooseColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    border: 3,
    marginRight: 15,
    borderColor: "white",
  },
  selectedColor: {
    borderColor: "#FCD95B",
    borderWidth: 3,
  },

  chooseColorText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
});

export default Start;
