import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import backArrow from './assets/backarrow.png';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL } from './config';

NavigationBar.setBackgroundColorAsync("#283950");


const FAQs = [
  {
    question: 'How do I look for Specific Categories of Items / Look for items in specific distance?',
    answer: 'Use the Filter button situated in the buy section and there you can select your desired category or seller distance from you',
  },
  {
    question: 'How do I update my profile information?',
    answer: 'Press the Account icon on the top right in home page, and update your details there.',
  },
  {
    question: 'Where To Find Items that i am Currently Dealing / Sold before / bought before?',
    answer: 'Navigate to the home page, select the shopping cart icon on the top right and select your desired option from the tabs',
  },
  {
    question: 'How to contact a seller?',
    answer: 'select your desired item and press contact now. You can now chat with the seller. this item will be added to currently dealing section of MyDeals Page',
  },
  {
    question: 'How to talk with my buyers?',
    answer: 'select your listed item from My Listings in home page. you will see a list of offers made by buyers under "Interested Buyers".',
  },
  {
    question: 'How do i remove an item from market after i have sold it?',
    answer: 'select your listed item from My Listings in home page. select "REMOVE ITEM FROM MARKETPLACE" and choose the buyer and select remove item. Or if you just want to remove without selling, press the button below it',
  },
];

const HelpAndSupportPage = ({navigation}) => {
  const [showAnswers, setShowAnswers] = useState({});
  const [query, setQuery] = useState('');


  const toggleAnswer = (question) => {
    setShowAnswers((prevState) => ({
      ...prevState,
      [question]: !prevState[question],
    }));
  };

  const handleQueryChange = (text) => {
    setQuery(text);
  };

  const handleSubmitQuery = async () => {
    // Handle query submission logic here
    const email = await AsyncStorage.getItem('email');
    const response = await axios.post(`${serverAPIURL}/api/helpandsupport`, {email : email, content : query}).then(response2 => {
        Alert.alert(
            "Query Alert", // Alert title
            `${response2.data.message}`, // Alert message
            [
              {
                text: "OK",
                onPress: () => console.log("OK Pressed"),
              }
            ],
            { cancelable: true }
        );
        console.log('Query:', query);
        setQuery('');
    });
  };

  return (
    <ScrollView style={styles.container}>
          <StatusBar backgroundColor="#011f45" style="light" />

      <View style={styles.topitems}>
      <TouchableOpacity onPress={()=>{navigation.goBack()}}>
      <Image source={backArrow} style={{height:50,width:50}}></Image>
      </TouchableOpacity>
      <Text style={{alignSelf:'center',color:'white',fontWeight:'bold',fontSize:30,marginStart:20}}>Help & Support</Text>
      </View>


      <Text style={styles.heading}>FAQs</Text>
      {FAQs.map((faq, index) => (
        <View key={index}>
          <TouchableOpacity style={styles.question} onPress={() => toggleAnswer(faq.question)}>
            <Text style={styles.questionText}>{faq.question}</Text>
          </TouchableOpacity>
          {showAnswers[faq.question] && <Text style={styles.answer}>{faq.answer}</Text>}
        </View>
      ))}

      <Text style={styles.heading}>Raise any Query Regarding the App</Text>
      <TextInput
        style={styles.queryInput}
        multiline
        numberOfLines={5}
        placeholder="Enter your query here..."
        value={query}
        onChangeText={handleQueryChange}
        placeholderTextColor='white'
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuery}>
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>
      <Text/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#011f45'
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    color:'white'
  },
  question: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'white'
  },
  answer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    color:'white',
  },
  queryInput: {
    height: 150,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
    color:'white'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
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

export default HelpAndSupportPage;