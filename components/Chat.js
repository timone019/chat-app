import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, View, Button } from "react-native";
import {
  GiftedChat,
  Bubble,
  Day,
  InputToolbar,
  Message,
} from "react-native-gifted-chat";
import Background from "./Background";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";
import {
  onSnapshot,
  query,
  collection,
  addDoc,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useContext } from 'react';
import { MessageContext } from './MessageContext';

import { LogBox } from "react-native";
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

// Chat component with route & navigation props
const Chat = ({ db, route, navigation, isConnected, storage }) => {
  const [messages, setMessages] = useState([]);
  const { name, background, userID } = route.params; // extract userId and name from route params
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { deleteMessage } = useContext(MessageContext);

  const toggleMessageSelection = (message) => {
    if (selectedMessages.has(message)) {
      selectedMessages.delete(message);
    } else {
      selectedMessages.add(message);
    }
    setSelectedMessages(new Set(selectedMessages));
  };

  const deleteSelectedMessages = () => {
    selectedMessages.forEach((message) => deleteMessage(message));
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  // onSend function to send messages
  const onSend = useCallback(
    (newMessages = []) => {
      const message = {
        ...newMessages[0],
        user: {
          _id: userID, // use the userId variable
          name: route.params.name, // use the name from route params
        },
      };
      // Check if the new message has an image
      if (newMessages[0].image) {
        message.image = newMessages[0].image;
      }

      addDoc(collection(db, "messages"), message);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    },
    [userID, route.params.name, db]
  );

  let unsubscribe;

  // load cached messages
  const cacheMessages = async (messagestoCache) => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(messagestoCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadCachedMessages = async () => {
    const cachedMessages = await AsyncStorage.getItem("messages");
    if (cachedMessages === null) {
      setMessages([]);
    } else {
      setMessages(JSON.parse(cachedMessages));
    }
  };

  // const loadCachedMessages = async () => {
  //   const cachedMessages = (await AsyncStorage.getItem("messages")) || [];
  //   setMessages(JSON.parse(cachedMessages));
  // };

  // Load cached messages when the component mounts
  useEffect(() => {
    loadCachedMessages();
  }, []);

  // Set the title of the screen
  useEffect(() => {
    navigation.setOptions({ title: name });

    if (isConnected) {
      // unregister current onSnapshot() listener to avoid registering multiple listeners when
      // useEffect code is re-executed.
      if (unsubscribe) unsubscribe();
      unsubscribe = null;

      const messagesCollection = collection(db, "messages");
      const q = query(messagesCollection, orderBy("createdAt", "desc"));

      // Listen for changes in the messages collection
      // and update the state with the latest messages
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => {
          const firebaseData = doc.data();

          const data = {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: new Date(firebaseData.createdAt.seconds * 1000),
            user: firebaseData.user,
          };

          if (firebaseData.image) {
            data.image = firebaseData.image;
          }

          // If the message has a location, add it to the data object
          if (firebaseData.location) {
            data.location = firebaseData.location;
          } else {
            // If the message doesn't have a location, add a placeholder location
            data.location = { latitude: 0, longitude: 0 };
          }

          return data;
        });
        cacheMessages(messages);
        setMessages(messages);
      });
    }
    // Unregister the listener when the component unmounts
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  // Render the messages in Bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#007AFF",
          },
          left: {
            backgroundColor: "#b73eeb",
          },
        }}
        textStyle={{
          left: {
            color: "#FFFFFF",
          },
        }}
        onLongPress={(context, currentMessage) => {
          customActionsRef.current.onLongPressMessageOptions(
            context,
            currentMessage
          );
        }}
      />
    );
  };

  // style the date to white
  const renderDay = (props) => (
    <Day {...props} textStyle={{ color: "white" }} />
  );

  const renderInputToolbar = (props) => {
    if (isConnected)
      return <InputToolbar {...props} containerStyle={styles.inputToolbar} />;
    else return null;
  };

  const renderMessage = (props) => {
    return (
      <Message
        {...props}
        onLongPress={(context, message) => {
          // Call the onLongPressMessageOptions function from the CustomActions component
          customActionsRef.current.onLongPressMessageOptions(
            context,
            () => {},
            message
          );
        }}
      />
    );
  };

  const customActionsRef = useRef();
  const renderCustomActions = (props) => {
    return (
      <CustomActions ref={customActionsRef} storage={storage}  setIsSelectionMode={setIsSelectionMode} toggleMessageSelection={toggleMessageSelection} {...props} />
    );
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (
      currentMessage.location &&
      currentMessage.location.latitude !== 0 &&
      currentMessage.location.longitude !== 0
    ) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    // Return null when the message doesn't have a location
    return null;
  };

  return (
    // Background component & container wrapper
    <Background color={background}>
      <View style={styles.textContainer}>
        {isSelectionMode && (
          <Button title="Delete Selected" onPress={deleteSelectedMessages} />
        )}
        <GiftedChat
          messages={messages}
          renderBubble={renderBubble}
          renderDay={renderDay}
          renderInputToolbar={renderInputToolbar}
          accessible={true}
          accessibilityLabel="send"
          accessibilityHint="Sends a message"
          accessibilityRole="button"
          onSend={isConnected ? onSend : undefined}
          renderActions={renderCustomActions}
          renderCustomView={renderCustomView}
          renderMessage={renderMessage}
          user={{
            _id: userID, // use the userID variable
            name: route.params.name, // use the name from route params
          }}
        />
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputToolbar: {
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default Chat;
