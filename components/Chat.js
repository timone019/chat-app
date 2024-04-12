import { useEffect, useState } from "react";
import { StyleSheet, Platform, KeyboardAvoidingView, View } from "react-native";
import {
  GiftedChat,
  Bubble,
  Day,
  SystemMessage,
} from "react-native-gifted-chat";
import Background from "./Background";

// Chat component with route & navigation props
const Chat = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const { name } = route.params;

  // Set the title of the screen 
  useEffect(() => {
    navigation.setOptions({ title: name });

    // Set the initial messages
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },

      {
        _id: 2,
        text: "This is a system message",
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  // Function to send messages
  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

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
    <Background> 

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
            _id: 1,
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
});

export default Chat;
