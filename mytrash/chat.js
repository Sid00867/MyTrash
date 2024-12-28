import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, TextInput, Button, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Image, Linking , ScrollView, ActivityIndicator, BackHandler} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; //
import * as Location from 'expo-location'; //
import mapimage from './assets/map-image.png';
import send from './assets/send.png';
import attachment from './assets/attachment.png';
import cancel from './assets/cancel.png';
import imageicon from './assets/imageicon.png';
import locationicon from './assets/locationicon.png';
import { StatusBar } from 'expo-status-bar'; //
import * as NavigationBar from 'expo-navigation-bar'; //
import backarrow from './assets/backarrow.png';
import profile from './assets/profile.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import axios from 'axios';
import { serverAPIURL } from './config';

NavigationBar.setBackgroundColorAsync("#01132B");

  //----------------------------------------------------------------- works when nav is implemented
export default function ChatScreen({ route, navigation }) {

  // { item: [itemobject], isseller: true/false, buyer_email : (empty if user isnt seller) }
  const {item, isUserSeller , buyer_email, noti} = route.params;

  //-----------------------------------------------------------------


  const [buyeremail, setbuyeremail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [chatRoomId, setchatRoomId] = useState(``);
  const [emailinmobile, setemailinmobile] = useState(``);
  const [username, setusername] = useState(``);
  const [loading, setLoading] = useState(true);
  const [profilepic, setprofilepic] = useState("");

  const socket = io(serverAPIURL);





  useEffect(() => {
    const fetchData = async () => {
      // console.log('Fetching');
  
      try {
        const em = await AsyncStorage.getItem('email');
        // console.log(em);
        setemailinmobile(em);

        if (em === item.email) {
          const res = await axios.post(`${serverAPIURL}/api/getuser`, { email: buyer_email });
          setusername(res.data.name);
          setprofilepic(res.data.profilepic ? { uri: `${serverAPIURL}${res.data.profilepic}` } : profile);
        } else {
          const res = await axios.post(`${serverAPIURL}/api/getuser`, { email: item.email });
          setusername(res.data.name);
          setprofilepic(res.data.profilepic ? { uri: `${serverAPIURL}${res.data.profilepic}` } : profile);
        }

        const email = isUserSeller ? buyer_email : em;
        setbuyeremail(email);
        const chatRoomId = `${item.email}-${email}`;
        setchatRoomId(chatRoomId);

        // console.log("REACHED HERE");
        try {
          await axios.post(`${serverAPIURL}/api/getchat`, { item: item, buyer_email: email })
            .then(response => {
              setMessages(response.data.messages);
            });
        } catch (error) {
          console.log("Error fetching chat:", error);
        }

        // console.log("REACHED HERE 2");


        // console.log("REACHED HERE 3");
        socket.emit('joinRoom', { chatRoomId });

        socket.on('newMessage', async () => {
          // console.log('newMessage');

          await axios.post(`${serverAPIURL}/api/getchat`, { item: item, buyer_email: email })
            .then(response => {
              setMessages(response.data.messages);
            });
        });

        // console.log("REACHED HERE 4");

        return () => {
          // console.log("Disconnecting socket");
          socket.emit('leaveRoom', { chatRoomId });
          socket.disconnect();
          socket.off('leaveRoom');
        };

      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // This function will be called when the screen is unfocused
        // console.log('Navigating away from Screen');
        // console.log("Disconnecting socket");
        socket.emit('leaveRoom', { chatRoomId });
        socket.disconnect();
        socket.off('leaveRoom');
        // Place your cleanup code or any function you want to call here
      };
    }, [])
  );

  const handleBackPress = useCallback(() => {
    // console.log('Back Button Pressed', 'You pressed the back button!');
    exit();
    // Return true to prevent the default back action
    return true;
  }, []);

  // Add the back button event listener when the screen is focused
  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      // Clean up the event listener when the screen is unfocused
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, [handleBackPress])
  );




  const [showModal, setShowModal] = useState(false);
  // const [suremodalVisible, setsureModalVisible] = useState(false);

  // const handleConfirm = () => {
  //   setsureModalVisible(false);
  // };

  // const handleCancel = () => {
  //   setsureModalVisible(false);
  // };

  const scrollViewRef = useRef(null);

  const getFormattedTimestamp = (date) => {
    // console.log(`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
}

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {

    

    if (message.length > 0) {
      const newMessage = {
        id: Date.now().toString(),
        sender_email: emailinmobile,
        timestamp: getFormattedTimestamp(new Date()),
        type: 'text',
        content: message
      };
      // setMessages([...messages, newMessage]);
      setMessage('');
      
      try {
        const response = await axios.post(`${serverAPIURL}/api/message`, {
          message  : newMessage,
          chatRoomId : chatRoomId,
          item : item,
          buyer_email : buyeremail
        });
      } catch (error) {
        console.error('Error:', error);
      }

    }
  };

  const handleMiscellaneousSend = () => {
    setShowModal(true);
  };

  const exit = () => {
    // console.log('Exit');
    if(noti == undefined) {
      // console.log('Exit1')
      navigation.goBack();
    }else if (noti == true){
      // console.log('Exit2')
      navigation.navigate("HomePage");
    }
  }


  const handleOptionSelect = async (option) => {
    if (option === 'Image') {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 2],
        quality: 0.6,
      });

      if (pickerResult.canceled === true) {
        return;
      }

      const imageMessage = {
        // id: Date.now().toString(),
        // image: pickerResult.assets[0].uri,
        // sender: true,
        // timestamp: new Date(),
        id: Date.now().toString(),
        sender_email: emailinmobile,
        timestamp: getFormattedTimestamp(new Date()),
        type: 'image',
        content: pickerResult.assets[0].uri
      };
      // setMessages([...messages, imageMessage]);
      setShowModal(false);

        const formData = new FormData();
        formData.append('image', {
        uri: pickerResult.assets[0].uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
        });

        formData.append('id', imageMessage.id);
        formData.append('sender_email', imageMessage.sender_email);
        formData.append('timestamp', imageMessage.timestamp);
        formData.append('type', imageMessage.type);
        formData.append('content', imageMessage.content);  
        formData.append('item', JSON.stringify(item)); 
        formData.append('buyer_email', buyeremail); 
        formData.append('chatRoomId', chatRoomId);

        try {
          const response = await axios.post(`${serverAPIURL}/api/imagemessage`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 1000, // Increased timeout
          });
          // console.log('Image upload successful:', response.data);
        } catch (error) {
            const response = await axios.post(`${serverAPIURL}/api/imagemessage`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 1000, // Increased timeout
            });
          if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Server error:', error.response.status, error.response.data);
          } else if (error.request) {
            // No response received from server
            // const response = await axios.post(`${serverAPIURL}/api/imagemessage`, formData, {
            //   headers: { 'Content-Type': 'multipart/form-data' },
            //   timeout: 1000, // Increased timeout
            // });
            console.error('No response from server:', error.request);
          } else {
            // Other errors
            console.error('Error in setting up request:', error.message);
          }
        }



    } else if (option === 'Location') {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      setShowModal(false);

      let location = await Location.getCurrentPositionAsync({});
      // console.log(location);
      const locationMessage = {
        id: Date.now().toString(),
        sender_email: emailinmobile,
        timestamp: getFormattedTimestamp(new Date()),
        type: 'location',
        content: `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`
      };
      // setMessages([...messages, locationMessage]);


      try {
        const response = await axios.post(`${serverAPIURL}/api/message`, {
          message  : locationMessage,
          chatRoomId : chatRoomId,
          item : item,
          buyer_email : buyeremail
        });
      } catch (error) {
        console.error('Error:', error);
      }

    } else {
      // console.log('Selected option:', option);
      setShowModal(false);
    }
  };

  const renderMessageBubble =  ({ messagebox }) => { 
    
    let sender = false;
    let senderemail = emailinmobile
    if (senderemail === messagebox.sender_email){
      sender = true;
    }else{
      sender = false;
    }

    if (messagebox.type === 'image') {
      return (
        <View style={[styles.bubble, sender ? styles.senderBubble : styles.receiverBubble]}>
          <Image source={{ uri: `${serverAPIURL}${messagebox.content}` }} style={styles.imageBubble} />
          <Text style={styles.timestamp}>{messagebox.timestamp}</Text>
        </View>
      );
    } else if (messagebox.type === 'location') {
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(messagebox.content)}
          style={[styles.bubble, sender ? styles.senderBubble : styles.receiverBubble]}
        >
          <Image
            source={mapimage}
            style={styles.locationBubble}
          />
          <Text style={styles.boldtext}>Click To View Location</Text>
          <Text style={styles.timestamp}>{messagebox.timestamp}</Text>
        </TouchableOpacity>
      );
    } else {
      const bubbleStyle = sender ? styles.senderBubble : styles.receiverBubble;
      const bubbleTextStyle = sender ? styles.senderText : styles.receiverText;
      return (
        <View style={[styles.bubble, bubbleStyle]}>
          <Text style={bubbleTextStyle}>{messagebox.content}</Text>
          <Text style={styles.timestamp}>{messagebox.timestamp}</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , backgroundColor:"#011F45"}}>
        <View style={{ height:100, width:100, justifyContent: 'center', alignItems: 'center' , backgroundColor:"white", borderRadius:10}}>
        <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} // Adjust the offset as needed
    >

     {/* <Modal
        transparent={true}
        animationType="slide"
        visible={suremodalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles2.modalOverlay}>
          <View style={styles2.modalContainer}>
            <Text style={styles2.modalText}>Are You Sure?</Text>
            <View style={styles2.buttonContainer}>
              <TouchableOpacity style={styles2.button} onPress={handleConfirm}>
                <Text style={styles2.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles2.button, {backgroundColor:'rgba(255,0,0,0.7)'}]} onPress={handleCancel}>
                <Text style={styles2.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}


    <StatusBar backgroundColor="#01132B" style="light" />

        <View style={styles.topContainer} >
        <TouchableOpacity onPress={()=>exit()}>
        <Image source={backarrow} style={{height:50,width:50}}></Image>
        </TouchableOpacity>

        <Image source={ profilepic } style={{height:50,width:50, marginStart:5, borderRadius:30}}></Image>

        <View style={{alignContent:'flex-start', marginStart:10, justifyContent: 'space-evenly'}}>
        <Text style={styles.optionButtonText}>{username}</Text>
        <Text style={{
              fontSize: 12,
              color: '#fff',
            }}>{item.name}</Text>

        {/* <TouchableOpacity>
        <Text style={{
              fontSize: 12,
              color: 'gray',
        }}>View Profile</Text>
        </TouchableOpacity> */}

        </View>

        <View style={{flex:1}}></View>


        {/* {isUserSeller && (
          <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => setsureModalVisible(true)}
        >
          <Text style={styles.buttonText}>Confirm Deal?</Text>
          <Text style={styles.subText}>ITEM WILL BE REMOVED FROM{'\n'}THE MARKETPLACE</Text>
        </TouchableOpacity>
        )} */}

      </View>

      <ScrollView style={{  paddingTop: 10, paddingBottom: 10 , marginBottom: 10}}  ref={scrollViewRef} >
        {messages.map((messagebox) => (
          <View key={messagebox.id}>
            {renderMessageBubble({ messagebox })}
          </View>
        ))}
        <View style={{ height: 10 }} />
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message"
          placeholderTextColor="gray"
          color='white'
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Image style={{height:28,width:28}} source={send}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleMiscellaneousSend}>
            <Image style={{height:28,width:28}} source={attachment}></Image>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={[styles.optionButton, styles.lightBlueButton]} onPress={() => handleOptionSelect('Image')}>
              <Image style={{height:32,width:32}} source={imageicon}></Image>
              <Text style={styles.optionButtonText}>Send Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, styles.lightBlueButton]} onPress={() => handleOptionSelect('Location')}>
              <Image style={{height:32,width:32}} source={locationicon}></Image>
              <Text style={styles.optionButtonText}>Send Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, {backgroundColor:'rgba(255,0,0,0.7)'}]} onPress={() => handleOptionSelect('Cancel')}>
              <Image style={{height:32,width:32}} source={cancel}></Image>
              <Text style={styles.optionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#011f45'
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  senderBubble: {
    backgroundColor: 'rgba(209, 230, 211,0.9)',
    alignSelf: 'flex-end',
    marginRight: 10, // Add margin to the right for sender's bubble
  },
  receiverBubble: {
    backgroundColor: 'rgba(255, 255, 255,0.7)',
    alignSelf: 'flex-start',
    marginLeft: 10, // Add margin to the left for receiver's bubble
  },
  senderText: {
    color: '#000',
  },
  receiverText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: 'rgb(80,80,80)',
    backgroundColor:'#01132B'
  },
  topContainer: {
    paddingTop: 45,
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'rgb(80,80,80)',
    backgroundColor:'#01132B'
  },
  input: {
    flex: 1,
    height: 45,
    borderColor: 'rgb(80,80,80)',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 10,
    borderRadius: 5,
  },
  miscButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miscButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 55, 120,0.89)',
    padding: 20,
    borderRadius: 10,
  },
  optionButton: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  lightBlueButton: {
    backgroundColor: 'rgba(122,220,255,0.9)',
  },
  imageBubble: {
    width: 270,
    height: 270,
    borderRadius: 10,
  },
  locationBubble: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 10,
    color: 'grey',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  boldtext:{
    // fontFamily : 'bernoru',
    alignSelf:'center',
    fontWeight: 'bold',
    fontSize:15,
    color:'black',
    opacity:0.7,
  },
  sendButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 8,
    paddingHorizontal: 7,
    marginEnd:5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#3B89EB',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subText: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  
});

const styles2 = StyleSheet.create({

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'rgba(0, 55, 120,0.89)',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color:'white',
    fontWeight:'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(122,220,255,0.9)',
    borderRadius: 5,
  },
  buttonText:{
    fontWeight:'bold',
    color:'white',
  },
});
