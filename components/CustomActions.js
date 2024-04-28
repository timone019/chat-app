import React, { useEffect, useState, useContext } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Alert } from "react-native";
import { uploadBytes, getDownloadURL, ref as storageRef } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useActionSheet } from '@expo/react-native-action-sheet';
import { MessageContext } from "./MessageContext";
import * as Clipboard from 'expo-clipboard';

const CustomActions = React.forwardRef((props, ref) => {
  const {
    wrapperStyle,
    iconTextStyle,
    onSend,
    storage,
    userID,
  } = props; 

  const actionSheet = useActionSheet();
  const { messages, deleteMessage } = useContext(MessageContext);

  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const imageName = uri.split("/")[uri.split("/").length - 1];
    return `${userID}-${timeStamp}-${imageName}`;
  };

  const uploadAndSendImage = async (imageURI) => {
    try {
      const uniqueRefString = generateReference(imageURI);
      const newUploadRef = storageRef(storage, uniqueRefString);
      const response = await fetch(imageURI);
      const blob = await response.blob();
      uploadBytes(newUploadRef, blob).then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url) => {
            onSend({ image: url });
          })
          .catch((error) => {
            Alert.alert("An error occurred while getting the download URL.");
          });
      });
    } catch (error) {
      Alert.alert("An error occurred while uploading and sending the image.");
    }
  }

  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  }

  const takePhoto = async () => {
    try {
      let permissions = await ImagePicker.requestCameraPermissionsAsync();
      if (permissions?.granted) {
        let result = await ImagePicker.launchCameraAsync();
        if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
        else Alert.alert("Permissions haven't been granted.");
      }
    } catch (error) {
      Alert.alert("An error occurred while taking a photo.");
    }
  };


  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const prefetchLocation = () => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      let permissions = await Location.requestForegroundPermissionsAsync();
      if (permissions?.granted) {
        try {
          let loc = await Location.getCurrentPositionAsync({}).catch(
            async () => {
              // If getCurrentPositionAsync fails, use getLastKnownPositionAsync
              return await Location.getLastKnownPositionAsync({});
            }
          );
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        } catch (error) {
          console.error(error);
          setLoading(false);
          reject(error);
        }
      } else {
        setLoading(false);
        Alert.alert("Location Permissions haven't been granted.");
        reject(new Error("Location Permissions haven't been granted."));
      }
    });
  };

  const getLocation = async () => {
    if (location) {
      onSend({
        location: {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
        },
      });
    } else {
      fetchLocation();
    }
  };

  const fetchLocation = async () => {
    setLoading(true); // Set loading to true if location is null
    try {
      let loc = await prefetchLocation(onSend);
      if (loc) {
        onSend({
          location: {
            longitude: loc.coords.longitude,
            latitude: loc.coords.latitude,
          },
        });
      } else {
        Alert.alert("Error occurred while fetching location");
      }
    } catch (error) {
      // Handle error
    }
  };

  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
          default:
        }
      }
    );
  };

  useEffect(() => {
    ref.current = {
      onLongPressMessageOptions: (context, currentMessage) => {
        let options = ["Cancel"];
        let actions = [];
  
        if (currentMessage.text) {
          options.unshift("Copy Text");
          actions.unshift(() => Clipboard.setStringAsync(currentMessage.text));
        }
  
        if (currentMessage.image) {
          options.unshift("Copy Image");
          actions.unshift(() => Clipboard.setStringAsync(currentMessage.image));
        }
  
        if (currentMessage.location && currentMessage.location.latitude && currentMessage.location.longitude) {
          options.unshift("Copy Location");
          actions.unshift(() => Clipboard.setStringAsync(`Latitude: ${currentMessage.location.latitude}, Longitude: ${currentMessage.location.longitude}`));
        }
  
        options.unshift("Delete");
        actions.unshift(() => deleteMessage(currentMessage));
  
        const cancelButtonIndex = options.length - 1;
  
        actionSheet.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
          },
          (buttonIndex) => {
            if (buttonIndex !== cancelButtonIndex) {
              actions[buttonIndex]();
            }
          }
        );
      },
    };
  }, []);
      

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 10,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;
