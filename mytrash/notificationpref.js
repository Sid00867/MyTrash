import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet , TouchableOpacity, Image} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import backArrow from './assets/backarrow.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { serverAPIURL } from './config';


NavigationBar.setBackgroundColorAsync("#283950");

const NotificationSettings = ({navigation}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [chatNotificationsEnabled, setChatNotificationsEnabled] = useState(true);
  const [buyAlertsEnabled, setBuyAlertsEnabled] = useState(true);

  useEffect(() => {


    const set = async () => {
      const not = await AsyncStorage.getItem("notifications");
      const email = await AsyncStorage.getItem('email');
      if(not){
        if (not === "disabled"){
          setNotificationsEnabled(false);
          await AsyncStorage.setItem("notifications", false);
          await axios.post(`${serverAPIURL}/update-enabled`, {email : email, enabled : false});
        }
      }
    }
    set();

  }, [])



  useEffect(() => {
    const set = async () => {
    let preference = "";
    const email = await AsyncStorage.getItem('email');
    if(notificationsEnabled) {
      preference = "enabled";
      await axios.post(`${serverAPIURL}/update-enabled`, {email : email, enabled : true});
    }else{
      preference = "disabled";
      await axios.post(`${serverAPIURL}/update-enabled`, {email : email, enabled : false});
    }
    await AsyncStorage.setItem("notifications", preference);
  }
  set();
  }, [notificationsEnabled])


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#011f45" style="light" />
      <View style={styles.topitems}>
      <TouchableOpacity onPress={()=>{navigation.goBack()}}>
      <Image source={backArrow} style={{height:50,width:50}}></Image>
      </TouchableOpacity>
      <Text style={{alignSelf:'center',color:'white',fontWeight:'bold',fontSize:21,marginStart:15}}>Notification Preferences</Text>
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingText}>Turn On/Off Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#011f45',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    color: 'white'
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
    color:'white',
    fontWeight: 'bold'
  },
  topitems : {
    alignSelf:'stretch',
    flexDirection:'row',
    marginTop:50,
    marginStart:1,
    marginEnd:20,
    marginBottom:30
  },
});

export default NotificationSettings;
