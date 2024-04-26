import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, deleteDoc } from "firebase/firestore";

// Create a context
export const MessageContext = createContext();

// Create a provider component
export const MessageProvider = ({ children, db }) => {
  const [messages, setMessages] = useState([]);

  const deleteMessage = async (messageToDelete) => {
    try {
      // Delete message from AsyncStorage
      const storedMessages = await AsyncStorage.getItem('messages');
      let messages = storedMessages ? JSON.parse(storedMessages) : [];
      messages = messages.filter(message => message._id !== messageToDelete._id);
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
      setMessages(messages);
  
      // Delete message from Firebase
      await deleteDoc(doc(db, "messages", messageToDelete._id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MessageContext.Provider value={{ messages, deleteMessage }}>
      {children}
    </MessageContext.Provider>
  );
};