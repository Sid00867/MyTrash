import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Linking, Image, Alert } from 'react-native';
import backArrow from './assets/backarrow.png';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL } from './config';

NavigationBar.setBackgroundColorAsync("#283950");

const FeedbackPage = ({navigation}) => {
  const [feedback, setFeedback] = useState('');

  const handleFeedbackChange = (text) => {
    setFeedback(text);
  };

  const handleRateApp = () => {
    // Replace 'app_id' with your actual app ID
    const appStoreUrl = 'https://itunes.apple.com/app/id<app_id>?action=write-review';
    const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.projecty.mytrash&hl=en&showAllReviews=true';

    // Check if the app is installed on the Google Play Store or Apple App Store
    Linking.canOpenURL(googlePlayUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(googlePlayUrl);
        } else {
          Linking.openURL(appStoreUrl);
        }
      })
      .catch((err) => console.log('An error occurred', err));
  };

  const sendfeedback = async () => {
    const email = await AsyncStorage.getItem('email');
    const response = await axios.post(`${serverAPIURL}/api/feedback`, {email : email, content : feedback}).then(response2 => {
        Alert.alert(
            "Feedback Alert", // Alert title
            `${response2.data.message}`, // Alert message
            [
              {
                text: "OK",
                onPress: () => console.log("OK Pressed"),
              }
            ],
            { cancelable: true }
        );
    });
  }

  return (
    <View style={styles.container}>

      <StatusBar backgroundColor="#011f45" style="light" />

      <View style={styles.topitems}>
      <TouchableOpacity onPress={()=>{navigation.goBack()}}>
      <Image source={backArrow} style={{height:50,width:50}}></Image>
      </TouchableOpacity>
      <Text style={{alignSelf:'center',color:'white',fontWeight:'bold',fontSize:30,marginStart:20}}>Feedback</Text>
      </View>


      <Text style={styles.heading}>Facing Bugs/issues? Send us a Report</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        placeholder="Enter your feedback here..."
        value={feedback}
        onChangeText={handleFeedbackChange}
        placeholderTextColor="white"
      />
      <TouchableOpacity style={styles.rateButton} onPress={sendfeedback}>
        <Text style={styles.rateButtonText}>SUBMIT</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Enjoyed using our app? Please leave us a Rating!</Text>
      <TouchableOpacity style={styles.rateButton} onPress={handleRateApp}>
        <Text style={styles.rateButtonText}>RATE US ON GOOGLE PLAY</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#011f45',
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop:20,
    color: 'white',
    textAlign: 'left'
  },
  textArea: {
    height: 150,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
    color:'white'
  },
  rateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  topitems: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginTop: 30,
    marginStart: 5,
    marginEnd: 20,
    marginBottom: 10
  },
});

export default FeedbackPage;