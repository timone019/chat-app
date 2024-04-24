import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import {
  GiftedChat,
  Bubble,
  Day,
  InputToolbar,
} from "react-native-gifted-chat";
import Background from "./Background";
import {
  onSnapshot,
  query,
  collection,
  addDoc,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

// Chat component with route & navigation props
const Chat = ({ db, route, navigation, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const { name, background, userID } = route.params; // extract userId and name from route params

  // onSend function to send messages
  const onSend = useCallback((newMessages = []) => {
    const message = {
      ...newMessages[0],
      user: {
        _id: userID, // use the userId variable
        name: route.params.name, // use the name from route params
      },
    };
    addDoc(collection(db, "messages"), message);
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
  }, [userID, route.params.name, db]);

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

          return data;
        });
        cacheMessages(messages);
        setMessages(messages);
      });
    } else {
    setTimeout(loadCachedMessages, 0); // Add a delay before calling loadCachedMessages
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

  return (
    // Background component & container wrapper
    <Background color={background}>
     
        <View style={styles.textContainer}>
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
