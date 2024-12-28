import logo from './assets/logo.png';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import illustration from './assets/landingpageimage.png';
import { serverAPIURL } from './config';

SplashScreen.preventAutoHideAsync();
const { width, height } = Dimensions.get('window');

export default function App({ navigation }) {

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {



    try{
      const getemail = async () => {
        const email = await AsyncStorage.getItem("email");
  
        if (email) {
          navigation.navigate("HomePage");
          // SplashScreen.hideAsync();
        }
        // SplashScreen.hideAsync();
      }

      getemail();
    }catch(e){
      console.log(e)
    }finally{
      setAppIsReady(true)
    }
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={{ width: 190, height: 50 }}></Image>
        </View>
        <View style={styles.illustrationContainer}>
          {/* Placeholder for the big illustration image */}
          <Image source={illustration} style={{height:370,width:370}}></Image>
        </View>
        <Text style={{fontSize:25, fontWeight:'bold', color:'white', marginBottom:30}}>Welcome To MyTrash!</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("LoginPage")}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CreateAccount")}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011F45', // Solid blue color
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 2,
    backgroundColor: '#011F45'
  },
  illustrationContainer: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', // Placeholder background color
    backgroundColor: '#011F45'
  },
  buttonContainer: {
    width: '80%',
  },
  button: {
    backgroundColor: '#275a9c',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
