import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Background from "./Background";
import { getAuth, signInAnonymously } from "firebase/auth";

// Start component with navigation prop
const Start = ({ navigation }) => {
  // State to hold the name input value
  const [name, setName] = useState("");
  const auth = getAuth();
  // State to hold the chosen background color
  const [background, setBackground] = useState("");

  // Color options
  const colorOptions = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  //* Color options plus function to handle button press
  const ColorButton = ({ color, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.chooseColor,
        { backgroundColor: color },
        selected && styles.selectedColor,
      ]}
      onPress={onPress}
    />
  );

  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        navigation.navigate("Chat", {
          userID: result.user.uid,
          name: name,
          background: background, // pass 'background' instead of 'selectedColor'
        });
        Alert.alert("You have successfully signed in anonymously");
      })
      .catch((error) => {
        Alert.alert("Unable to sign in, please try again");
      });
  };

  return (
    <Background color={background}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <TouchableOpacity
            title="Go to Chat"
            style={styles.button}
            accessible={true}
            accessibilityLabel="Go to Chat"
            accessibilityHint="Navigates to Chat"
            accessibilityRole="button"
            onPress={signInUser}
          >
            <Text style={styles.buttonText}>Enter Chat City</Text>
          </TouchableOpacity>

          <Text style={styles.colorSelectText}>
            Select your background color
          </Text>

          <View style={styles.colorButtonsContainer}>
            {colorOptions.map((color) => (
              <ColorButton
                key={color}
                color={color}
                selected={background === color}
                onPress={() => setBackground(color)}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setBackground(null)}
          >
            <Text style={styles.resetButtonText}>Reset Background</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
      />
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    padding: 20,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    width: 250,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 40,
    backgroundColor: "white",
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    width: "50%", // set the width to 50% of the parent container
    height: 40, // set the height to 40 pixels
    alignSelf: "center", // center the button horizontally
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  colorSelectText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  chooseColorBox: {
    width: "84%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorButtonsContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  chooseColor: {
    width: 50,
    height: 50,
    borderRadius: 20,
    border: 3,
    marginTop: 15,
    marginRight: 15,
    marginBottom: 15,
    borderColor: "white",
  },
  selectedColor: {
    borderColor: "#007BFF",
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
  resetButton: {
    backgroundColor: "#071422",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "50%", // set the width to 50% of the parent container
    height: 40, // set the height to 40 pixels
    alignSelf: "center", // center the button horizontally
  },
  resetButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default Start;
