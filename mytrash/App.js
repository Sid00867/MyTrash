// App.js
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, SafeAreaView, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './HomePage';
import CreateAccount from './CreateAccount';
import LoginPage from './login'; 
import ProductInfo from './ProductInfo';
import MyAccount from './MyAccount'; 
import BuyPage from './buypage';
import SellPage from './SellPage';
import chatpage from './chat';
import FeedbackPage from './Feedback';
import helpnsupport from './helpnsupport';
import notificationpref from './notificationpref';
import orderhistory from './orderhistory';
import selleritem from './selleritem';
import Settings from './settings';
import picd from './ProductInfoCurrentlyDealing';
import bands from './ProductInfoBANDS';
import landingpage from './landingpage';
import 'expo-dev-client';
import * as Linking from 'expo-linking';
import messaging from "@react-native-firebase/messaging";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {

  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        chat: 'chat/:item/:isUserSeller/:buyer_email/:noti', // Define params for your chat screen
        Settings : 'Settings'
        // Other screens...
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="landingpage" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BuyPage" component={BuyPage} />
        <Stack.Screen name="ProductInfo" component={ProductInfo} />
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="LoginPage" component={LoginPage} /> 
        <Stack.Screen name="SellPage" component={SellPage} />
        <Stack.Screen name="chat" component={chatpage} />
        <Stack.Screen name="MyAccount" component={MyAccount} />
        <Stack.Screen name="Feedback" component={FeedbackPage} />
        <Stack.Screen name="helpnsupport" component={helpnsupport} />
        <Stack.Screen name="notificationpref" component={notificationpref} />
        <Stack.Screen name="orderhistory" component={orderhistory} />
        <Stack.Screen name="Settings" component={Settings}/>
        <Stack.Screen name="selleritem" component={selleritem}/>
        <Stack.Screen name="picd" component={picd}/>
        <Stack.Screen name="bands" component={bands}/>
        <Stack.Screen name="landingpage" component={landingpage}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
