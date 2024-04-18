import React, { useEffect, useState } from "react";
import { StyleSheet, Platform, KeyboardAvoidingView, View } from "react-native";
import {
  GiftedChat,
  Bubble,
  Day,
  SystemMessage,
} from "react-native-gifted-chat";
import Background from "./Background";
import { onSnapshot, query, collection, addDoc, orderBy } from "firebase/firestore";

// Chat component with route & navigation props
const Chat = ({ db, route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const { name, background, userID } = route.params; // extract userId and name from route params

  const onSend = (newMessages) => {
    const message = {
   ...newMessages[0],
   user: {
     _id: userID, // use the userId variable
     name: route.params.name, // use the name from route params
   },
 };
     addDoc(collection(db, "messages"), message);
   }
  

  // Set the title of the screen 
  useEffect(() => {
    navigation.setOptions({ title: name });

    const messagesCollection = collection(db, "messages");
    const q = query(messagesCollection, orderBy("createdAt", "desc"));

    // Listen for changes in the messages collection
    // and update the state with the latest messages
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const firebaseData = doc.data();

        const data = {
          _id: doc.id,
          text: firebaseData.text,
          createdAt: new Date(firebaseData.createdAt.seconds * 1000),
          user: firebaseData.user,
        };

        return data;
      });

      setMessages(messages);
    });

    return unsubscribe;
  }, []);



  // Function to send messages
  // const onSend = (newMessages) => {
  //   addDoc(collection(db, "messages"), newMessages[0])
    // setMessages((previousMessages) =>
    //   GiftedChat.append(previousMessages, newMessages)
  // };

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

// style the system message to white
  const renderSystemMessage = (props) => (
    <SystemMessage {...props} textStyle={{ color: "white" }} />
  );

  return (

    // Background component & container wrapper
    <Background
    source={background ? null : image}
    resizeMode="cover"
    color={background}>
    

      <View style={styles.textContainer}>
        <GiftedChat
          messages={messages}
          renderBubble={renderBubble}
          renderDay={renderDay}
          renderSystemMessage={renderSystemMessage}
          accessible={true}
          accessibilityLabel="send"
          accessibilityHint="Sends a message"
          accessibilityRole="button"
          onSend={(messages) => onSend(messages)}
          user={{
            _id: userID, // use the userID variable
            name: route.params.name, // use the name from route params
          }}
        />
      </View>
      {Platform.OS === "ios"?<KeyboardAvoidingView behavior="padding" />: null}
      {Platform.OS === "android" ? <KeyboardAvoidingView /> : null}
    </Background>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  }

});

export default Chat;
