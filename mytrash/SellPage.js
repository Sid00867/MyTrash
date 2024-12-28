//SellPage.js

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  SafeAreaView,
  Button,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL } from './config';
import { Ad } from './config';

export default function CreateAccount({navigation}) {

  const [name, onChangeName] = useState('');
  const [description, onChangeDescription] = useState('');
  const [category, onChangeCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [images, setImages] = useState([]);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imguiload, setimguiload] = useState(false);



  const categories = [
    'Aluminium', 'Cardboard', 'Iron', 'Paper', 'Plastic', 'Copper', 'Glass', 'Steel', 'Wood', 'Textiles', 'Electronics', 'Rubber', 'Tin', 'Brass', 'Lead','Others'
  ];



  const validate = () => {
    let errors = {};
    if (!name) errors.name = 'Name is required';
    if (!description) errors.description = 'Description is required';
    else if (description.length > 300)
      errors.description = 'Description must be within 300 characters';
    if (!category) errors.category = 'Category is required';
    if (images.length === 0) errors.images = 'At least one image is required';

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const submit = async () => {
    if (validate()) {
      try {
        const formData = new FormData();
      
      const responsedata  =  await axios.post(`${serverAPIURL}/api/getuser`,{email : await AsyncStorage.getItem('email')}).then(async(response) => {

      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', String(response.data.latitude));
      formData.append('longitude', String(response.data.longitude));
      formData.append('sellername', response.data.name);
      formData.append('phone', response.data.number);                      
      formData.append('email', response.data.email);    


      images.forEach((images, index) => {
        formData.append('images', {
          uri: images, // this prop name was supposd to be uri
          name: `photo${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      setLoading(true);

      const res = await axios.post(`${serverAPIURL}/api/upload`, formData, { // IP seems to change everytime
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(() => setLoading(false));

      Alert.alert('Submitted');
      // console.log('Uploaded', name, description, category);
      
      navigation.goBack();

    });
      
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'There was an error uploading your data.');
      }
    }
  };

  const pickImages = async () => {

    setimguiload(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Allow multiple selection
      quality: 0.6,
    });
    setimguiload(false);

    // console.log("done")

    if (!result.canceled) {
      setImages(prevImages => [...prevImages, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const deleteImage = (uri) => {
    setImages(images.filter(image => image !== uri));
  };

  const openModal = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        behavior="padding"
        style={[styles.container, { flexDirection: 'column' }]}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity  style={styles.backButton} onPress={() => {navigation.goBack()}}>
            <Image source={require('./assets/backarrow.png')} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.title}>  Sell Scrap</Text>
        </View>

        <View
          style={{
            flex: 0.44,
            backgroundColor: '#011F45',
            borderBottomColor: 'white',
            borderBottomWidth: 0.75,
          }}>
          <Text />
        </View>
        <View
          style={{
            flex: 2,
            backgroundColor: '#011F45',
            gap: 15,
            marginBottom:15
          }}>
          <View />
          <Text style={styles.text}>Item Name:</Text>
          <View style={styles.textbox}>
            <TextInput
              style={styles.input}
              onChangeText={onChangeName}
              value={name}
              placeholder="Name"
              placeholderTextColor="white"
            />
          </View>
          {errors.name && <Text style={styles.errortext}>{errors.name}</Text>}
          <Text style={styles.text}>Description:</Text>
          <View
            style={[
              styles.textbox,
              { height: Math.max(80, descriptionHeight) },
            ]}>
            <TextInput
              style={[
                styles.input,
                { height: Math.max(80, descriptionHeight) },
              ]}
              onChangeText={onChangeDescription}
              value={description}
              multiline={true}
              placeholder={"Describe the product in 300 characters or less"}
              placeholderTextColor="white"
              onFocus={() => setShowCategoryPicker(false)}
              onContentSizeChange={(event) => {
                const { height } = event.nativeEvent.contentSize;
                setDescriptionHeight(height + 25); // Add some padding
              }}
            />
          </View>
          {errors.description && (
            <Text style={styles.errortext}>{errors.description}</Text>
          )}
          <Text style={styles.text}>Category:</Text>
          <View style={styles.textbox}>
            <TextInput
              style={styles.input}
              onFocus={() => setShowCategoryPicker(true)}
              value={category}
              placeholder="Choose the Category"
              placeholderTextColor="white"
              showSoftInputOnFocus={false}
            />
          </View>
          {showCategoryPicker && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => {
                  onChangeCategory(itemValue);
                  setShowCategoryPicker(false);
                }}
                style={styles.picker}>
                {categories.map((item, index) => (
                  <Picker.Item key={index} label={item} value={item} />
                ))}
              </Picker>
            </View>
          )}
          {errors.category && (
            <Text style={styles.errortext}>{errors.category}</Text>
          )}
          <Text style={styles.text}>Upload Images:</Text>
          <TouchableOpacity onPress={pickImages} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Pick images from gallery</Text>
          </TouchableOpacity>
          <ScrollView horizontal style={styles.imageContainer}>
          {imguiload ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <TouchableOpacity onPress={() => openModal(uri)}>
                <Image source={{ uri }} style={styles.image} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteImage(uri)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
          </ScrollView>
          {errors.images && (
            <Text style={styles.errortext}>{errors.images}</Text>
          )}
          <View />
        </View>



      </KeyboardAwareScrollView>

      {selectedImage && (
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={closeModal}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />
          </View>
        </Modal>
      )}
            <TouchableOpacity
        onPress={submit}
        style={{
          backgroundColor: 'rgb(30,30,200)', // Pleasant bright light blue color
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          position: 'absolute',
          bottom: 0,
          width: '100%',
          alignSelf: 'center'
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Upload</Text>

      </TouchableOpacity>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#011F45',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop:20,
    paddingBottom:60
  },
  text: {
    color: 'white',
    fontSize: 20,
    paddingLeft: 5,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#1e3a5f',
    color: 'white',
    padding: 15,
    marginBottom: 5,
    borderRadius: 10,
  },
  textbox: {
    flex: 1,
    borderColor: 'white',
    borderRadius: 25,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignContent: 'center',
    height: 80,
  },
  errortext: {
    color: 'red',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignContent: 'flex-start',
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
  backButton: {
    // position: 'absolute',
    // ...(Platform.OS === 'ios'
    //   ? { top: -10, left: 10 } // iOS button position
    //   : { top: 10, left: 10 }), // Android button position
    // zIndex: 1,
  },
  backArrow: {
    width: 50,
    height: 50,
  },
  uploadButton: {
    backgroundColor: '#283950',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  imageContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 33,
    right: 30,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: '#011F45',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullscreenImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});