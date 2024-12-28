import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity , Image} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import backArrow from './assets/backarrow.png';
import feedback from './assets/feedback.png';
import manageAccounts from './assets/manage_accounts.png';
import editnotification from './assets/editnotifications.png';
import help from './assets/help.png';
import { serverAPIURL, Ad } from './config';

NavigationBar.setBackgroundColorAsync("#283950");

const Settings = ({navigation}) => {
  return (
    
    <View style={styles.container}>

      <StatusBar backgroundColor="#011f45" style="light" />

      <View style={styles.topitems}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
      <Image source={backArrow} style={{height:50,width:50}}></Image>
      </TouchableOpacity>
      <Text style={{alignSelf:'center',color:'white',fontWeight:'bold',fontSize:30,marginStart:20}}>Settings</Text>
      </View>
      
      {/* <TouchableOpacity style={styles.button} onPress={() =>{navigation.navigate('PasswordPage')}}>
        <Image source={manageAccounts} style={styles.buttonimage}></Image>
        <View style={{flex:1,justifyContent: 'center'}}>
        <Text style={styles.buttonText}>Change Account Details</Text>
        </View>
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.button} onPress={() =>{navigation.navigate('notificationpref')}}>
        <Image source={editnotification} style={styles.buttonimage}></Image>
        <View style={{flex:1,justifyContent: 'center'}}>
        <Text style={styles.buttonText}>Notification Preferences</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() =>{navigation.navigate('helpnsupport')}}>
        <Image source={help} style={styles.buttonimage}></Image>
        <View style={{flex:1,justifyContent: 'center'}}>
        <Text style={styles.buttonText}>Help & Support</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() =>{navigation.navigate('Feedback')}}>
        <Image source={feedback} style={styles.buttonimage}></Image>
        <View style={{flex:1,justifyContent: 'center'}}>
        <Text style={styles.buttonText}>Feedback</Text>
        </View>
      </TouchableOpacity>
      <View style={{
        position:'absolute', // Position
        bottom:0
      }}>
        {/* <Ad></Ad> */}
        </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011f45',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '90%',
    flexDirection:'row'
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  topitems : {
    alignSelf:'stretch',
    flexDirection:'row',
    marginTop:50,
    marginStart:20,
    marginEnd:20,
    marginBottom:30
  },
  buttonimage:{
    marginEnd:15,
    marginStart:1,
    height:40,
    width:40
  }
});

export default Settings;