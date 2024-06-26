import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, View, Share, Alert } from "react-native";
import {
  GiftedChat,
  Bubble,
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
  endBefore,
  limit,
  getDocs,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useContext } from "react";
import { MessageContext } from "./MessageContext";
import { CheckBox, Icon } from "react-native-elements";

import { LogBox } from "react-native";
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

// Chat component with route & navigation props
const Chat = ({ db, route, navigation, isConnected, storage }) => {
  const [messages, setMessages] = useState([]);
  const { name, background, userID } = route.params; // extract userId and name from route params
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { deleteMessage } = useContext(MessageContext);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const fetchEarlierMessages = async (currentMessages) => {
    let q;
    const messagesCollection = collection(db, "messages");

    if (currentMessages.length === 0) {
      // If there are no current messages, fetch the latest messages
      // Query Firestore for messages that were created before the earliest message currently loaded
      q = query(
        messagesCollection,
        orderBy("createdAt", "desc"),
        limit(20) // Fetch the 20 messages before the earliest message
      );
    } else {
      // If there are current messages, fetch messages that were created before the earliest message
      // Get the timestamp of the earliest message currently loaded
      const earliestMessageTimestamp =
        currentMessages[currentMessages.length - 1].createdAt;
      q = query(
        messagesCollection,
        orderBy("createdAt", "desc"),
        endBefore(earliestMessageTimestamp),
        limit(20)
      );
    }

    // Execute the query and map the results to the message format used in the app
    const querySnapshot = await getDocs(q);
    const earlierMessages = querySnapshot.docs.map((doc) => {
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

      if (firebaseData.location) {
        data.location = firebaseData.location;
      } else {
        data.location = { latitude: 0, longitude: 0 };
      }

      return data;
    });

    // If the number of messages fetched is less than the limit, set hasMoreMessages to false
    if (earlierMessages.length < 20) {
      setHasMoreMessages(false);
    }

    return earlierMessages;
  };

  const mergeMessages = (currentMessages, earlierMessages) => {
    const messageMap = new Map();
    [...currentMessages, ...earlierMessages].forEach((message) => {
      messageMap.set(message._id, message);
    });
    return Array.from(messageMap.values());
  };

  const handleLoadEarlier = async () => {
    // if (!hasMoreMessages) {
    //   Alert.alert("No more messages", "You have loaded all messages.");
    //   return;
    // }
    setIsLoadingEarlier(true);
    const earlierMessages = await fetchEarlierMessages(messages);
    if (earlierMessages.length === 0) {
      setHasMoreMessages(false);
    } else {
      setMessages((previousMessages) =>
        mergeMessages(previousMessages, earlierMessages)
      );
    }
    setIsLoadingEarlier(false);
  };

  const handleLongPress = (context, currentMessage) => {
    if (customActionsRef.current) {
      customActionsRef.current.onLongPressMessageOptions(
        context,
        currentMessage
      );
    }
  };

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToTop = 80;
    return (
      contentSize.height - layoutMeasurement.height - paddingToTop <=
      contentOffset.y
    );
  };

  useEffect(() => {
    const fetchInitialMessages = async () => {
      const initialMessages = await fetchEarlierMessages([]);
      setMessages(initialMessages);
    };

    fetchInitialMessages();
  }, []);

  const toggleMessageSelection = (message) => {
    if (selectedMessages.has(message)) {
      selectedMessages.delete(message);
    } else {
      selectedMessages.add(message);
    }
    setSelectedMessages(new Set(selectedMessages));
  };

  const selectAllMessages = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages));
    }
  };

  const deleteSelectedMessages = () => {
    Alert.alert(
      "Delete Messages",
      "Are you sure you want to delete the selected messages?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            selectedMessages.forEach((message) => deleteMessage(message));
            setSelectedMessages(new Set());
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: "Share this message",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
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

  // Load cached messages when the component mounts
  useEffect(() => {
    loadCachedMessages();
  }, []);

  let unsubscribe;

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

  useEffect(() => {
    if (isSelectionMode) {
      navigation.setOptions({
        title: name,
        headerRight: () => (
          <Icon
            name={
              selectedMessages.size === messages.length
                ? "check-square"
                : "square-o"
            }
            type="font-awesome"
            onPress={selectAllMessages}
            color="#007AFF"
            containerStyle={{ marginRight: 10 }}
          />
        ),
      });
    } else {
      navigation.setOptions({
        title: name,
        headerRight: null,
      });
    }
  }, [
    navigation,
    selectAllMessages,
    isSelectionMode,
    selectedMessages,
    messages,
  ]);

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
        onLongPress={handleLongPress}
      />
    );
  };

  // // style the date to white
  // const renderDay = (props) => (
  //   <Day {...props} textStyle={{ color: "white" }} />
  // );

  const renderInputToolbar = (props) => {
    if (isConnected) {
      if (isSelectionMode) {
        return (
          <View style={styles.selectionContainer}>
            <Icon
              name="trash"
              type="font-awesome"
              onPress={deleteSelectedMessages}
              color="#007AFF"
            />
            <Icon
              name="share"
              type="font-awesome"
              color="#007AFF"
              onPress={onShare}
            />
            <Icon
              name="arrow-left"
              type="font-awesome"
              color="#007AFF"
              onPress={() => setIsSelectionMode(false)}
            />
          </View>
        );
      } else {
        return <InputToolbar {...props} containerStyle={styles.inputToolbar} />;
      }
    } else {
      return null;
    }
  };

  const renderMessage = (props) => {
    const isCurrentUser = props.currentMessage.user._id === userID;
    return (
      <View>
        {isSelectionMode && (
          <CheckBox
            checked={selectedMessages.has(props.currentMessage)}
            onPress={() => toggleMessageSelection(props.currentMessage)}
            checkedIcon="check-circle-o"
            uncheckedIcon="circle-o"
            iconType="font-awesome"
            checkedColor="#007AFF"
            uncheckedColor="#007AFF"
          />
        )}
        <Message
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: "#b73eeb",
              marginRight: isSelectionMode ? 10 : 0,
            },
            right: {
              backgroundColor: "#007AFF",
              marginLeft: isSelectionMode ? 10 : 0,
            },
          }}
          onLongPress={handleLongPress}
        />
      </View>
    );
  };

  const customActionsRef = useRef();
  const renderCustomActions = (props) => {
    return (
      <CustomActions
        ref={customActionsRef}
        storage={storage}
        setIsSelectionMode={setIsSelectionMode}
        toggleMessageSelection={toggleMessageSelection}
        {...props}
      />
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
        <GiftedChat
          loadEarlier={hasMoreMessages && !isLoadingEarlier} // This shows the "Load Earlier Messages" button
          onLoadEarlier={handleLoadEarlier} // This function is called when the "Load Earlier Messages" button is pressed
          isLoadingEarlier={isLoadingEarlier} // This shows a loading indicator when earlier messages are being fetched
          listViewProps={{
            scrollEventThrottle: 400,
            onScroll: ({ nativeEvent }) => {
              if (isCloseToTop(nativeEvent)) {
                handleLoadEarlier();
              }
            },
          }}
          messages={messages}
          renderBubble={renderBubble}
          // renderDay={renderDay}
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
  selectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default Chat;
