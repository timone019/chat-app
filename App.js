// import the screens
import Start from "./components/Start";
import Chat from "./components/Chat";

import React, { useState, useEffect } from "react";
// import react Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { getApps, initializeApp } from "firebase/app";
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { LogBox, Alert } from "react-native";
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

// Create the navigator
const Stack = createNativeStackNavigator();
const App = () => {
  const [db, setDb] = useState(null);
  const [storage, setStorage] = useState(null);
  // define new state of connection status
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if (db) {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
    }
  }, [connectionStatus.isConnected, db]);

  useEffect(() => {
    // Check if Firebase has already been initialized
    if (!getApps().length) {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      // Initialize Cloud Firestore and get a reference to the service
      const firestoreDb = getFirestore(app);
      // const storage = getStorage(app);
      setDb(firestoreDb);

      const firebaseStorage = getStorage(app);
      setStorage(firebaseStorage);


      // Initialize Firebase Auth with AsyncStorage
      const auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  }, []);

  if (!db) {
    return null; // or a loading indicator
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Welcome" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              {...props}
              isConnected={connectionStatus.isConnected}
              db={db}
              storage={storage}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
