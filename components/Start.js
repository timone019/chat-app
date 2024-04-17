import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import Background from "./Background";
import { getAuth, signInAnonymously} from "firebase/auth";

// Start component with navigation prop
const Start = ({ navigation }) => {
  const [name, setName] = useState("");
  const auth = getAuth();

  const signInUser = () => {
    signInAnonymously(auth)
    .then(result => {
      navigation.navigate("Chat", { userID: result.user.uid, name:name});
      Alert.alert("You have successfully signed in anonymously");
    })
    .catch(error => {
      Alert.alert("Unable to sign in, please try again");
    })
  }


  return (
    <Background>
      <Text>Hello Start!</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={setName}
        placeholder="Type here ..."
      />
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
      {Platform.OS === "ios"?<KeyboardAvoidingView behavior="padding" />: null}
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
});

export default Start;