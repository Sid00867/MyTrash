import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Button,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import * as NavigationBar from 'expo-navigation-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL } from './config';



NavigationBar.setBackgroundColorAsync('#283950');

export default function CreateAccount() {
  const [name, onChangeName] = useState('');
  const [number, onChangeNum] = useState('');
  const [state, onChangeState] = useState('');
  const [houseNumber, onChangeHouseNumber] = useState('');
  const [city, onChangeCity] = useState('');
  const [pincode, onChangePincode] = useState('');
  const [dob, onChangeDob] = useState('');
  const [email, onChangeEmail] = useState('');
  const [password, onChangePass] = useState('');
  const [confirmpassword, onChangeConPass] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  // const [mapRegion, setMapRegion] = useState({
  //   latitude: DEFAULT_LATITUDE,
  //   longitude: DEFAULT_LONGITUDE,
  //   latitudeDelta: LATITUDE_DELTA,
  //   longitudeDelta: LONGITUDE_DELTA,
  // });

  const [location, setLocation] = useState(null);

  const navigation = useNavigation(); // Get the navigation object

  const geocodePincode = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${pincode}&format=json&addressdetails=1&countrycodes=IN`,
        {
          headers: {
            'User-Agent': 'MyTrash-App/1.0', // Identify your application
            'Accept-Language': 'en' // Optional but recommended
          }
        }
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      } else {
        Alert.alert('Location not found', 'Please enter a valid pincode.');
      }
    } catch (error) {
      console.error('Error geocoding pincode:', error);
      Alert.alert('Error', 'Failed to geocode pincode. Please try again.');
    }
  };

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];

  const validate = () => {
    let errors = {};
    if (!name) errors.name = 'Name is required';
    if (!number) errors.number = 'Number is required';
    else if (!/^\d{10}$/.test(number)) errors.number = 'Phone number must be 10 digits';
    if (!state) errors.state = 'State is required';
    if (!houseNumber) errors.houseNumber = 'House Number is required';
    if (!city) errors.city = 'City is required';
    if (!pincode) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(pincode)) errors.pincode = 'Pincode must be 6 digits';
    if (!dob) errors.dob = 'DOB is required';
    if (!email) errors.email = 'Email ID is required';
    if (!password) errors.password = 'Password is required';
    if (!confirmpassword) errors.confirmpassword = 'Re-enter Password';
    if (password !== confirmpassword) errors.passwordError = 'Passwords do not match';

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };


  const profilepic = "tte"
  const submit = async () => {
    if (validate()) {
      try {
        // console.log('Sending request to server...');
        const response = await axios.post(`${serverAPIURL}/api/register`, {     //change ip
          name, number, state, houseNumber, city, pincode, dob, email, password, latitude: location.latitude, 
          longitude: location.longitude, profilepic
        });
        // console.log('Response received:', response.data);
  
        if (response.status === 200) {
          Alert.alert('Registration Successful');
          AsyncStorage.setItem('email', email);
          navigation.navigate('HomePage',{ email: email });
        } else {
          Alert.alert('Registration Failed', response.data.message);
        }
      } catch (error) {
        console.error('Error during registration:', error);
        Alert.alert('Registration Failed', error.response?.data?.message || error.message);
      }
    }
  };

  const onChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const currentDate = selectedDate || new Date(dob);
    onChangeDob(currentDate.toISOString().split('T')[0]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        behavior="height"
        style={[styles.container, { flexDirection: 'column' }]}>
        <View
          style={{
            flex: 0.44,
            backgroundColor: '#011F45',
            borderBottomColor: 'white',
            borderBottomWidth: 0.75,
          }}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Please fill in your details</Text>

          <TouchableOpacity onPress={() => navigation.navigate("LoginPage")}>
          <Text style={styles.signupText}>Already have an account?
          <Text style={styles.forgotPasswordText}>  Sign in</Text>

        </Text>
        </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 2,
            backgroundColor: '#011F45',
            gap: 15,
          }}>
          <View />
          <Text style={styles.subtitle}>Name:</Text>
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/name_icon.png')}
            />

            <TextInput
              style={styles.input}
              onChangeText={onChangeName}
              value={name}
              placeholder="Enter your Name"
              placeholderTextColor="white"
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>
          {errors.name ? (
            <Text style={styles.errortext}> {errors.name}</Text>
          ) : null}
          <Text style={styles.subtitle}>Phone Number:</Text>
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/number_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangeNum}
              value={number}
              placeholder="Enter your Phone Number"
              placeholderTextColor="white"
              keyboardType="numeric"
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
              maxLength={10}
            />
          </View>
          {errors.number ? (
            <Text style={styles.errortext}> {errors.number}</Text>
          ) : null}
          
          
          <Text style={styles.subtitle}>Address:</Text>
          
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/state_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangeHouseNumber}
              value={houseNumber}
              placeholder="Enter your House Number"
              placeholderTextColor="white"
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>
          {errors.houseNumber ? (
            <Text style={styles.errortext}> {errors.houseNumber}</Text>
          ) : null}
          
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/state_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangeCity}
              value={city}
              placeholder="Enter your City"
              placeholderTextColor="white"
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>
          {errors.city ? (
            <Text style={styles.errortext}> {errors.city}</Text>
          ) : null}
          
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/state_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangePincode}
              value={pincode}
              placeholder="Enter your Pincode"
              placeholderTextColor="white"
              keyboardType="numeric"
              maxLength={6}
              onBlur={geocodePincode}
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>

          {errors.pincode ? (
            <Text style={styles.errortext}> {errors.pincode}</Text>
          ) : null}

          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/state_icon.png')}
            />

            <TextInput
              style={styles.input}
              onFocus={() => {
                setShowDatePicker(false);
              }}
              onPress={() =>setShowStatePicker(true)}
              value={state}
              placeholder="Choose your State"
              placeholderTextColor="white"
              showSoftInputOnFocus={false}
            />

          </View>
          {showStatePicker && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={state}
                onValueChange={(itemValue) => {
                  onChangeState(itemValue);
                  setShowStatePicker(false);
                }}
                style={styles.picker}>
                {indianStates.map((item, index) => (
                  <Picker.Item key={index} label={item} value={item} />
                ))}
              </Picker>
            </View>
          )}
          {errors.state ? (
            <Text style={styles.errortext}> {errors.state}</Text>
          ) : null}
          <Text style={styles.subtitle}>Date of Birth:</Text>
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/dob_icon.png')}
            />
            <TextInput
              style={styles.input}
              onFocus={() => {

                setShowStatePicker(false);
              }}
              onPress={() =>  setShowDatePicker(true)}
              value={dob}
              placeholder="Select your Date of Birth"
              placeholderTextColor="white"
              showSoftInputOnFocus={false}
            />
          </View>
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dob ? new Date(dob) : new Date()}
                mode="date"
                display="default"
                onChange={onChange}
                maximumDate={new Date()}
              />
            </View>
          )}
          {errors.dob ? (
            <Text style={styles.errortext}> {errors.dob}</Text>
          ) : null}
          <Text style={styles.subtitle}>Email ID:</Text>
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/email_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangeEmail}
              value={email}
              keyboardType="email-address"
              placeholder="Enter your Email ID"
              placeholderTextColor="white"
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>
          {errors.email ? (
            <Text style={styles.errortext}> {errors.email}</Text>
          ) : null}
          <Text style={styles.subtitle}>Password:</Text>
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/password_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangePass}
              value={password}
              placeholder="Enter your Password"
              placeholderTextColor="white"
              secureTextEntry
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>
          {errors.password ? (
            <Text style={styles.errortext}> {errors.password}</Text>
          ) : null}
          <View style={styles.textbox}>
            <Image
              style={styles.image2}
              source={require('./assets/password_icon.png')}
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangeConPass}
              value={confirmpassword}
              placeholder="Confirm Password"
              placeholderTextColor="white"
              secureTextEntry
              onFocus={() => {
                setShowDatePicker(false);
                setShowStatePicker(false);
              }}
            />
          </View>
          {errors.confirmpassword ? (
            <Text style={styles.errortext}> {errors.confirmpassword}</Text>
          ) : null}

          {passwordError ? (
            <Text style={styles.errortext}>{passwordError}</Text>
          ) : null}

          <View />
        </View>

        <View style={{ flex: 0.5 }}>
          <TouchableOpacity
        onPress={submit}
        style={{
          backgroundColor: 'rgb(30,30,200)', // Pleasant bright light blue color
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          width: '100%',
          alignSelf: 'center',
          marginBottom:30,
          marginTop:20
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>SIGN UP</Text>
      </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    fontSize: 37,
    backgroundColor: '#011F45',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#011F45',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop:20
  },
  sub: {
    fontSize: 17,
    backgroundColor: '#011F45',
    color: '#38B6FF',
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    paddingHorizontal: 5,
    fontWeight: 'bold',
  },

  image2: {
    padding: 20,
    margin: 10,
    paddingTop: 30,
    paddingBottom: 25,
    paddingLeft: 20,
    paddingRight: 35,
    width: 10,
    height: 10,
  },
  input: {
    width: '75%',
    backgroundColor: '#1e3a5f',
    color: 'white',
    padding: 15,
    marginEnd:10,
    borderRadius: 10,
    fontSize:17
  },
  textbox: {
    flex: 1,
    borderColor: 'white',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignContent: 'center',
    height:80,


    width: '100%',
    backgroundColor: '#1e3a5f',
    color: 'white',
    padding: 2,
    borderRadius: 10,
  },
  errortext: {
    color: 'red',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignContent: 'flex-start',
  },
  datePickerContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  mapbox:{
    height:300,
  },
  forgotPasswordText: {
    color: '#4a90e2',
  },
  signupText: {
    flex:1,
    color: 'rgb(220,220,220)',
    paddingHorizontal:10,
    paddingVertical: 20,
  },
});