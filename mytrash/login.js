import React, { useState , useEffect , useRef, useCallback} from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Modal, Keyboard , BackHandler} from 'react-native';
import axios from 'axios';
import truck from './assets/truck.png'
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BaseToast } from 'react-native-toast-message';
import { useIsFocused , useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL } from './config';

NavigationBar.setBackgroundColorAsync("#0a2240");

const CustomToast = (props) => (
  <BaseToast
    {...props}
    style={{
      borderLeftColor: 'white', // Adjust border color
      backgroundColor: 'rgb(255, 255, 255)',
      height: 50, // Adjust the height of the toast
    }}
    contentContainerStyle={{ paddingHorizontal: 15 }}
    text1Style={{
      fontSize: 12,  // Adjust font size to fit
      fontWeight: 'bold',
      color: 'black',
      flexWrap: 'wrap',  // Allow text to wrap
    }}
    text2Style={{
      fontSize: 16,  // Adjust font size to fit
      color: 'gray',
      flexWrap: 'wrap',  // Allow text to wrap
    }}
  />
);

export default function LoginScreen({navigation}) {
   // NEEDS TO BE CHANGED
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailError2, setEmailError2] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleLogin = async () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (email.trim() === '') {
      setEmailError('Email is required');
      isValid = false;
    }

    if (password.trim() === '') {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (isValid) {
      try {
        const res = await axios.post(`${serverAPIURL}/api/login`, {email, password});
        if (res.data.message === 'login successful') {
          await AsyncStorage.setItem('email', email);
          // console.log("success");
          setPasswordError('');
          setEmailError('');
          navigation.navigate('HomePage');
          n
        } else if (res.data.message === 'Incorrect Username or Password') {
          Keyboard.dismiss();
          Toast.show({
            type: 'customToast',
            position: 'top',
            text1: res.data.message,
            visibilityTime: 4000,
            autoHide: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleForgotPassword = () => {
    toggleModal();
  };

  const handleMailComposer = async () => {
    let isValid2 = true;
    if (email2.trim() === '') {
      setEmailError2('Email is required');
      isValid2 = false;
    }

    if (isValid2) {
      try {
        toggleModal();
        const res = await axios.post(`${serverAPIURL}/api/send-email`, {email2});
        const message = res.data.message;
        Toast.show({
          type: 'customToast',
          position: 'top',
          text1: message,
          visibilityTime: 6000,
          autoHide: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleBackPress = useCallback(() => {
    // console.log('Back Button Pressed', 'You pressed the back button!');
    navigation.navigate("landingpage");
    // exit();
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

  const handleSignUp = () => {
    // console.log('Sign up pressed');
    navigation.navigate("CreateAccount");
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps='handled'
    >
      <Toast
        ref={(ref) => Toast.setRef(ref)}
        config={{
          customToast: (props) => <CustomToast {...props} />
        }}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.loginText, {alignSelf: 'flex-start', fontSize: 25, marginBottom: 3}]}>Enter Your Registered Email</Text>
            <Text style={{alignSelf: 'flex-start', fontSize: 14, color: 'rgb(200,200,200)', marginBottom: 10}}>We will send you a Recovery Email</Text>
            <TextInput
              style={[styles.input, {backgroundColor: 'rgba(255,255,255,0.9)', marginBottom: 10}]}
              placeholder="Enter your registered email"
              value={email2}
              onChangeText={(text) => {
                setEmail2(text);
                setEmailError2('');
              }}
              placeholderTextColor="#8b9cb5"
              color="black"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError2 ? <Text style={styles.errorText}>{emailError2}</Text> : null}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleMailComposer}
              >
                <Text style={styles.sendButtonText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={toggleModal}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar backgroundColor="#011f45" style="light" />
      <Image
        style={styles.logo}
        source={truck}
      />
      <Text style={[styles.loginText, {marginBottom: 1}]}>Welcome!</Text>
      <Text style={[styles.loginText, {fontSize: 26, fontWeight: 'light', color: 'rgba(80,180,255,1)'}]}>Please Login To Continue</Text>
      <TextInput
        style={[styles.input, {marginBottom: 10}]}
        placeholder="Enter Registered Email"
        placeholderTextColor="#8b9cb5"
        onChangeText={(text) => {
          setEmail(text.trimEnd());
          setEmailError('');
        }}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        style={[styles.input, {marginBottom: 7}]}
        placeholder="Enter Password"
        placeholderTextColor="#8b9cb5"
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError('');
        }}
        value={password}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignUp}>
        <Text style={styles.signupText}>Don't have an account?
         <Text style={styles.forgotPasswordText}>  Sign up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2240',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 20,
    opacity: 0.99,
  },
  loginText: {
    fontSize: 35,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start'
  },
  input: {
    width: '100%',
    backgroundColor: '#1e3a5f',
    color: 'white',
    padding: 15,
    marginBottom: 5,
    borderRadius: 10,
  },
  errorText: {
    color: 'rgba(230,0,0,1)',
    alignSelf: 'flex-start',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4a90e2',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    color: 'rgb(220,220,220)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'rgba(0, 55, 120,1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sendButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
