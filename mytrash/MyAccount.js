import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import profilepicimage from "./assets/profile-user.png";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL, Ad } from './config';
import {deletetoken} from './HomePage';

NavigationBar.setBackgroundColorAsync('#283950');

const MyAccount = ({navigation}) => {
// Update with your server's IP address
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [uri, setUri] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 100, height: 100 });
  const [userDetails, setUserDetails] = useState({
    name: '',
    number: '',
    state: '',
    houseNumber: '',
    city: '',
    pincode: '',
    dob: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [data, setData] = useState(null);
  const [location, setLocation] = useState(null);

  const geocodePincode = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${userDetails.pincode}&format=json&addressdetails=1&countrycodes=IN`,
        {
          headers: {
            'User-Agent': 'MyTrash-App/1.0', // Identify your application
            'Accept-Language': 'en' // Optional but recommended
          }
        }
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        // console.log(lat, lon);
        setLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
        // console.log(location);
        return {can : true, lat: parseFloat(lat), lon: parseFloat(lon)};
      } else {
        Alert.alert('Location not found', 'Please enter a valid pincode.');
        return {can : false};
      }
    } catch (error) {
      console.error('Error geocoding pincode:', error);
      Alert.alert('Error', 'Failed to geocode pincode. Please try again.');
      return {can : false};
    }
  };

  const handleUpdate = async () => {

    let data = null;
    try{
      setLoading(true);
      data = await geocodePincode();
      if (!data.can){
        setLoading(false);
      }
    }catch{

    }finally{
      if (validate() && data.can) {
        const latitude = data.lat;
        const longitude = data.lon;
  
        
        axios.post(`${serverAPIURL}/api/updateuser`, { ...userDetails, email: userDetails.email, latitude, longitude })
          .then(response => {
            Alert.alert('Success', 'Your details have been updated');
          })
          .catch(error => {
            console.error('Error updating user details:', error);
            Alert.alert('Error', 'There was an error updating your details');
          });
      }
      setLoading(false);
    }

  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

  const validate = () => {
    let errors = {};
    if (!userDetails.name) errors.name = 'Name is required';
    if (!userDetails.number) errors.number = 'Number is required';
    else if (!/^\d{10}$/.test(userDetails.number)) errors.number = 'Phone number must be 10 digits';
    if (!userDetails.state) errors.state = 'State is required';
    if (!userDetails.houseNumber) errors.houseNumber = 'House Number is required';
    if (!userDetails.city) errors.city = 'City is required';
    if (!userDetails.pincode) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(userDetails.pincode)) errors.pincode = 'Pincode must be 6 digits';
    if (!userDetails.dob) errors.dob = 'DOB is required';
    // if (!userDetails.email) errors.email = 'Email ID is required';

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    const currentDate = selectedDate || new Date(userDetails.dob);
    setUserDetails({ ...userDetails, dob: currentDate.toISOString().split('T')[0] });
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (pickerResult.canceled === true) {
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: pickerResult.assets[0].uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    formData.append('email', userDetails.email);

    
    try {
      const response = await axios.post(`${serverAPIURL}/api/profilepic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000// Increased timeout
      }).then((res)=>{
        // console.log('Image upload successful:', response.data);
        // setUri({ uri : `${serverAPIURL}${res.data.url}`});
        setUri(profilepicimage)
        setUri({ uri : `${serverAPIURL}${res.data.url}`});
        // setUri(pickerResult.assets[0].uri);
        // console.log('up')
      });

    } catch (error) {
      // console.error('Error in setting up request:', error.message);
      setUri(profilepicimage)
      setUri(pickerResult.assets[0].uri);
      // console.log('donw')
    }
  };

  const isSmallerThanDefault = imageDimensions.width < 100 || imageDimensions.height < 100;



  const logout = () => {

    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: async () => 
          {

            let emaild = ''
            let tokend = ''
            try{
              emaild = await AsyncStorage.getItem("email");
              tokend = await AsyncStorage.getItem('token');

            }catch{

            }finally{
              try {
                await axios.post(`${serverAPIURL}/removetoken`, { email: emaild, token : tokend });
                deletetoken(tokend);
              } catch (error) {
                
              }finally{
                await AsyncStorage.removeItem("email");
                await AsyncStorage.removeItem('token');
                navigation.navigate("LoginPage")
              }
            }

          } }
      ],
      { cancelable: true }
    );
  }

  useEffect(() => {
    const fetchUser = async () => {
      const email = await AsyncStorage.getItem("email");
      try {
        const response = await axios.post(`${serverAPIURL}/api/getuser`, { email: email });
        setData(response.data);
        setUserDetails(response.data);

        if (response.data.profilepic) {
          setUri({ uri : `${serverAPIURL}${response.data.profilepic}`});
        } else {
          setUri(profilepicimage);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // console.log(uri, "URI");
  }, [uri]);



  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , backgroundColor:"#011F45"}}>
        <View style={{ height:100, width:100, justifyContent: 'center', alignItems: 'center' , backgroundColor:"white", borderRadius:10}}>
        <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

          <View style={{flexDirection: 'row', justifyContent: 'center', paddingTop:30}}>
          <TouchableOpacity  style={styles.backButton} onPress={() => {navigation.goBack()}}>
            <Image source={require('./assets/backarrow.png')} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.title}>  My Account</Text>
        </View>


      <KeyboardAwareScrollView
        behavior="height"
        style={[styles.container, { flexDirection: 'column' }]}>

        <View
          style={{
            flex: 0.44,
            backgroundColor: '#011F45',
          }}></View>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={pickImage}>
            <View>
              {profileImage ? (
                <Image
                  source={uri}
                  style={[
                    styles.profileImage,
                    isSmallerThanDefault && styles.profileImageWithBorder,
                  ]}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Image source={uri} style={styles.profileImagePlaceholder} />
                </View>
              )}
              <View style={styles.editIndicator}>
                <Image source={require('./assets/edit.png')} style={styles.editIcon} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 2,
            backgroundColor: '#011F45',
            gap: 15,
          }}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={userDetails.name}
            onChangeText={text => setUserDetails({ ...userDetails, name: text })}
            onFocus={() => {
              setShowDatePicker(false);
              setShowStatePicker(false);
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Number</Text>
          <TextInput
            style={styles.input}
            value={userDetails.number}
            onChangeText={text => setUserDetails({ ...userDetails, number: text })}
            onFocus={() => {
              setShowDatePicker(false);
              setShowStatePicker(false);
            }}
            keyboardType="numeric"
            maxLength={10}
          />
          {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}

          <Text style={styles.label}>State</Text>
          <TouchableOpacity
            onPress={() => {
              setShowStatePicker(!showStatePicker);
              setShowDatePicker(false);
            }}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>{userDetails.state || 'Select State'}</Text>
            </View>
          </TouchableOpacity>
          {showStatePicker && (
            <Picker
              selectedValue={userDetails.state}
              onValueChange={itemValue =>
                setUserDetails({ ...userDetails, state: itemValue })
              }
              mode="dropdown"
              style={styles.statePicker}>
              {indianStates.map(state => (
                <Picker.Item key={state} label={state} value={state} />
              ))}
            </Picker>
          )}
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

          <Text style={styles.label}>House Number</Text>
          <TextInput
            style={styles.input}
            value={userDetails.houseNumber}
            onChangeText={text => setUserDetails({ ...userDetails, houseNumber: text })}
            onFocus={() => {
              setShowDatePicker(false);
              setShowStatePicker(false);
            }}
          />
          {errors.houseNumber && <Text style={styles.errorText}>{errors.houseNumber}</Text>}

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={userDetails.city}
            onChangeText={text => setUserDetails({ ...userDetails, city: text })}
            onFocus={() => {
              setShowDatePicker(false);
              setShowStatePicker(false);
            }}
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={userDetails.pincode}
            onChangeText={text => {setUserDetails({ ...userDetails, pincode: text });
            }}
            keyboardType="numeric"
            onFocus={() => {
              setShowDatePicker(false);
              setShowStatePicker(false);
            }}
            maxLength={6}
            onBlur={geocodePincode}
          />
          {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}

          <Text style={styles.label}>DOB</Text>
          <TouchableOpacity
            onPress={() => {
              setShowDatePicker(!showDatePicker);
              setShowStatePicker(false);
            }}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>{userDetails.dob || 'Select DOB'}</Text>
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={userDetails.dob ? new Date(userDetails.dob) : new Date()}
              mode="date"
              display="spinner"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

          {/* <Text style={styles.label}>Email ID</Text> */}
          {/* <TextInput
            style={styles.input}
            value={userDetails.email}
            onChangeText={text => setUserDetails({ ...userDetails, email: text })}
            onFocus={() => {
              setShowDatePicker(false);
              setShowStatePicker(false);
            }}
          /> */}
          {/* {errors.email && <Text style={styles.errorText}>{errors.email}</Text>} */}


        </View>
        <TouchableOpacity
        onPress={handleUpdate}
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
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Update Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {logout()}}
        style={{
          backgroundColor: 'rgb(200,50,50)', // Pleasant bright light blue color
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          width: '100%',
          alignSelf: 'center',
          marginBottom:30,
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight:'bold' }}>LOG OUT</Text>
      </TouchableOpacity>

      </KeyboardAwareScrollView>
      {/* <Ad></Ad> */}

    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011F45',
    paddingHorizontal: 10,
    paddingTop:10,
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#283950',
    padding: 5,
    borderRadius: 15,
  },
  editIcon: {
    width: 20,
    height: 20,
  },
  profileImageWithBorder: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    color: '#fff',
    marginTop: 15,
    fontWeight:'bold',
    fontSize:15
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    color: '#fff',
    paddingBottom: 5,
  },
  pickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    color: '#fff',
    paddingBottom: 5,
  },
  pickerText: {
    color: '#fff',
  },
  statePicker: {
    color: '#fff',
    backgroundColor: '#011F45',
  },
  errorText: {
    color: 'red',
  },
  backArrow: {
    width: 50,
    height: 50,
  },
  title: {
    flex: 1,
    fontSize: 30,
    backgroundColor: '#011F45',
    color: 'white',
    fontWeight: 'bold',
    paddingTop:4
    // ...(Platform.OS === 'ios'
    //   ? { top: 17, } // iOS button position
    //   : { top: 32, }), // Android button position
  },
});

export default MyAccount;
