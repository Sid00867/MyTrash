import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator,Platform, Alert, BackHandler} from 'react-native';
import rightArrow from './assets/arrow-point-to-right.png';
import placeholderImage from './assets/placeholder-image.jpeg';
import profilepic from './assets/profile-user.png';
import * as NavigationBar from 'expo-navigation-bar';
import settingsicon from './assets/settingsicon.png';

import axios from 'axios';
import React, { useEffect, useState,useRef, useCallback   } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import cart from "./assets/cart.png";
import { useIsFocused , useFocusEffect} from '@react-navigation/native';
import logo from "./assets/logo.png"
import { serverAPIURL, Ad } from './config';
import messaging from "@react-native-firebase/messaging";
import { initializeApp } from '@react-native-firebase/app';
import * as Linking from 'expo-linking';

// Your Firebase configuration object
const firebaseConfig = {
  // Your config here
};

initializeApp(firebaseConfig);



NavigationBar.setBackgroundColorAsync("#283950");

export const deletetoken = async (tokenarg) => {
  await messaging().deleteToken(tokenarg);
}

export default function App({ navigation }) {

  const [loading, setLoading] = useState(true);
  const [listings, setlistings] = useState([]);
  const notificationListener = useRef();
  const responseListener = useRef();
  const isFocused = useIsFocused();
  const backPressCount = useRef(0);


  useEffect(() => {
    const fetchdata = async () => {

      if (Platform.OS === 'android') {
                Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });


        
      }

      try {
        // Check for the existing Expo push token in AsyncStorage
        const storedToken = await AsyncStorage.getItem('token');
        // console.log(storedToken);
        const email = await AsyncStorage.getItem('email');
        const notificationsStatus = await AsyncStorage.getItem('notifications');

        // Set default value if 'notifications' item doesn't exist
        if (notificationsStatus === null) {
          await AsyncStorage.setItem('notifications', 'enabled');
        }

        if (!storedToken) {
          // No token found, generate a new one
          if (Device.isDevice) {

            let token;
            const authStatus = await messaging().requestPermission();
            const enabled =
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
            if (enabled) {
              token = await messaging().getToken();
              console.log('FCM Token:', token);
            }
             else {
              alert('Must use physical device for Push Notifications');
            }

            console.log(token);

            // Send the token to the server for registration
            await axios.post(`${serverAPIURL}/register-token`, { token, email });

            // Store the generated token in AsyncStorage
            await AsyncStorage.setItem('token', token);
          } else {
            throw new Error('Must use physical device for push notifications');
          }
        }

        // Fetch listings from the server
        await axios.post(`${serverAPIURL}/api/getlistings`, { email: email }).then((response) => {
          setlistings(response.data);
        });

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchdata();


    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // Handle the message here
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      const data = remoteMessage.data;
      // navigation.navigate("chat",{item : data.item, isUserSeller:data.isUserSeller , buyer_email:data.buyer_email, noti : true});
      // navigation.navigate("Settings");
    });

        // Handle notification click
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification caused app to open from background state:', remoteMessage);
          // Navigate to appropriate screen based on the notification data
          const data = remoteMessage.data;
          //navigation.navigate("chat",{item : data.item, isUserSeller:data.isUserSeller , buyer_email:data.buyer_email, noti : true});
          // navigation.navigate("Settings");
        });


    return unsubscribe;
  }, []);

  // React.useLayoutEffect(() => {
  //   messaging()
  //     .getInitialNotification()
  //     .then(async (remoteMessage) => {
  //       if (remoteMessage) {
  //         console.log('Notification caused app to open from quit state:', remoteMessage);
  //         const data = remoteMessage.data;
  //         const url = Linking.createURL('chat', {
  //           item : data.item,
  //           isUserSeller:data.isUserSeller , 
  //           buyer_email:data.buyer_email, 
  //           noti : true
  //         });
  //         // const url = Linking.createURL('Settings');
          
  //         // // Open the app with the deep link
  //         // await Linking.openURL(url);
  //       }
  //     });
  // }, []);

  useEffect(() => {

    const fetchData = async () => {
      if (Platform.OS === 'android') {

        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      try {
        // Check for the existing Expo push token in AsyncStorage
        const storedToken = await AsyncStorage.getItem('token');
        const email = await AsyncStorage.getItem('email');
        const notificationsStatus = await AsyncStorage.getItem('notifications');

        // Set default value if 'notifications' item doesn't exist
        if (notificationsStatus === null) {
          await AsyncStorage.setItem('notifications', 'enabled');
        }

        if (!storedToken) {
          // No token found, generate a new one
          if (Device.isDevice) {
            let token;
            const authStatus = await messaging().requestPermission();
            const enabled =
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
            if (enabled) {
              token = await messaging().getToken();
              console.log('FCM Token:', token);
            }
             else {
              alert('Must use physical device for Push Notifications');
            }

            await axios.post(`${serverAPIURL}/register-token`, { token, email });

            // Store the generated token in AsyncStorage
            await AsyncStorage.setItem('token', token);
          } else {
            throw new Error('Must use physical device for push notifications');
          }
        }

        // Fetch listings from the server
        await axios.post(`${serverAPIURL}/api/getlistings`, { email: email }).then((response) => {
          setlistings(response.data);
        });

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchData(); // Refetch data or update state when screen is focused
    }

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // Handle the message here
    });




    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      const data = remoteMessage.data;
      // navigation.navigate("chat",{item : data.item, isUserSeller:data.isUserSeller , buyer_email:data.buyer_email, noti : true});
      // navigation.navigate("Settings");
    });

        // Handle notification click
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification caused app to open from background state:', remoteMessage);
          // Navigate to appropriate screen based on the notification data
          const data = remoteMessage.data;
          //navigation.navigate("chat",{item : data.item, isUserSeller:data.isUserSeller , buyer_email:data.buyer_email, noti : true});
          // navigation.navigate("Settings");
        });

    return unsubscribe;


  }, [isFocused]);


  const handleBackPress = useCallback(() => {
    if (backPressCount.current === 0) {
      backPressCount.current += 1;
      
      setTimeout(() => {
        backPressCount.current = 0;
      }, 2000); // Reset the count after 2 seconds

      return true; // Prevent default back action
    } else {
      BackHandler.exitApp();
      return true; // Prevent default back action
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, [handleBackPress])
  );


  const sellpage = () => {
    // navigation.navigate("ProductInfo")
  }
  const deals = () => {
    navigation.navigate("orderhistory")
  }
  const logout = () => {
    // navigation.navigate("LoginPage")
  }
  const myAccount = () => {
    navigation.navigate("MyAccount")
  }
  const buyPage = async () => {
    navigation.navigate("BuyPage");
  }
  const settingspage = () => {
    navigation.navigate("Settings")
  }

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
    <View style={styles.Background}>
         
      <StatusBar backgroundColor="#011f45" style="light" />
      <View style={styles.topbar}>
      <View style={{flex: 1}}>
      <Image source={logo} style={{width:180, height:40,  opacity:1, alignSelf:"flex-start"}}></Image>
      </View>
      <TouchableOpacity style={{}} android_ripple={{ color: '#011f45' }} onPress={deals}>
          <Image source={cart} style={styles.profilepic}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={{}} android_ripple={{ color: '#011f45' }} onPress={settingspage}>
          <Image source={settingsicon} style={styles.profilepic}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={{}} android_ripple={{ color: '#011f45' }} onPress={myAccount}>
          <Image source={profilepic} style={styles.profilepic}></Image>
        </TouchableOpacity>
      </View>
      <View style={{
        marginTop: 20,
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingEnd: 20,
        paddingStart: 20,
        gap: 20
      }}>
        <View style={{ borderRadius: 20, overflow: 'hidden', flex: 1 }}>
          <TouchableOpacity style={styles.curvebox} android_ripple={{ color: '#000f9f' }} onPress={buyPage}>
            <Text style={styles.boldtext}>BUY</Text>
            <Text style={styles.lighttext}>Buy Scrap From Over 15+ Different Categories</Text>
            <Image source={rightArrow} style={styles.rightArrow}></Image>
          </TouchableOpacity>
        </View>
        <View style={{ borderRadius: 20, overflow: 'hidden', flex: 1 }}>
          <TouchableOpacity style={styles.curvebox} android_ripple={{ color: '#000f9f' }} onPress={()=>{navigation.navigate('SellPage')}}>
            <Text style={styles.boldtext}>SELL</Text>
            <Text style={styles.lighttext}>Sell Scrap To People Nearby You For The Best Price</Text>
            <Image source={rightArrow} style={styles.rightArrow}></Image>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomView}>
        <Text style={{
          fontWeight: 'bold',
          fontSize: 35,
          color: 'rgba(255, 255, 255, 0.85)',
          paddingTop: 10
        }}>Your Listings</Text>

        <ScrollView
          style={{
            flex: 1,
            alignSelf: 'stretch',
            marginTop: 10,
          }}
          fadingEdgeLength={100}>
          <View style={styles.itemsContainer}>
            {listings.length === 0 ? (
              <Text style={[styles.lighttext, { textAlign: 'center', marginTop: 20, alignSelf: 'center' }]}>No listings yet</Text>
            ) : (
              listings.map((item, index) => (
                <View key={index} style={{ flex: 1 }}>
                  <TouchableOpacity style={styles.itemscurvebox} onPress={() => {navigation.navigate('selleritem',{
                    item: item
                  })}}>
                    <Image source={{ uri: `${serverAPIURL}/${item.imageUri[0]}` }} style={styles.itemsImage} />
                    <View style={styles.itemscurveboxTEXTBOX}>
                      <Text style={[styles.boldtext, { fontSize: 25, opacity: 1 }]}>
                      {item.name.length > 14 ? item.name.substring(0, 14) + '...' : item.name}
                      </Text>
                      <Text style={[styles.lighttext]}>
                        {item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}
                      </Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', marginEnd: 10, gap: 10, marginTop: 15 }}>
                      <Image source={rightArrow} style={[styles.rightArrow, { height: 20, width: 40 }]} />
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
      {/* <View style={{
        position:'absolute', // Position
        bottom:0
      }}>
        <Ad></Ad>
      </View> */}
    </View>
    
  );
}

const styles = StyleSheet.create({
topbar: {
  alignSelf: 'stretch',
  flexDirection: 'row',
  justifyContent: 'flex-end', // This aligns the icons to the right
  marginTop: 70,
  marginEnd: 30,
  marginStart: 10,
  marginBottom: 10,
  gap: 7,
  // backgroundColor: 'black'
},
  Background: {
    flex: 1,
    backgroundColor: '#011f45',
  },
  curvebox: {
    backgroundColor: "rgba(56, 182, 255, 0.2)",
    borderRadius: 20,
    flexShrink: 1,
    padding: 20,
    paddingBottom: 15
  },
  curvebox2: {
    backgroundColor: "#011f45",
    borderRadius: 20,
    flexShrink: 1,
    padding: 20,
    paddingBottom: 15
  },
  boldtext: {
    // fontFamily : 'bernoru',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: 40,
    color: 'rgba(255, 255, 255, 0.85)'
  },
  lighttext: {
    alignSelf: 'flex-start',
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: 'light',
    fontSize: 14,
    paddingBottom: 10
  },
  rightArrow: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    opacity: 0.5
  },
  bottomView: {
    flex: 1,
    marginTop: 30,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    paddingBottom:80
  },
  itemsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    gap: 13,
    marginBottom: 10,
    alignSelf: 'stretch',
    marginStart: 20,
    marginEnd: 20,
    marginTop: 6
  },
  itemscurvebox: {
    flex: 1,
    backgroundColor: "rgba(56, 182, 255, 0.2)",
    borderRadius: 20,
    flexShrink: 1,
    paddingLeft: 15,
    alignItems: 'center',
    flexDirection: 'row'
  },
  itemsImage: {
    height: 50,
    width: 50,
    opacity: 0.8,
    borderRadius: 15
  },
  itemscurveboxTEXTBOX: {
    paddingStart: 10,
    paddingTop: 5,
  },
  profilepic: {
    height: 40,
    width: 40
  }
});
