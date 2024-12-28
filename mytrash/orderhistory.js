import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import backArrow from './assets/backarrow.png';
import * as NavigationBar from 'expo-navigation-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rightArrow from './assets/arrow-point-to-right.png';
import placeholderImage from './assets/placeholder-image.jpeg';
import { serverAPIURL, Ad } from './config';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { TabBar } from 'react-native-tab-view';



NavigationBar.setBackgroundColorAsync("#283950");

const DealsTabs = () => {
  const [solddata, setsolddata] = useState([]);
  const [boughtdata, setboughtdata] = useState([]);
  const [dealingdata, setdealingdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const TabScreen1 = () => (
    <ScrollView style={styles.container}>
      {dealingdata.map((item, index) => (
        <View key={index} style={{ flex: 1, marginBottom: 9 }}>
          <TouchableOpacity
            style={styles.itemscurvebox}
            onPress={() => navigation.navigate('picd', { item: item })}
          >
            <Image source={{ uri: `${serverAPIURL}/${item.imageUri[0]}` }} style={styles.itemsImage} />
            <View style={styles.itemscurveboxTEXTBOX}>
              <Text style={[styles.boldtext, { fontSize: 25, opacity: 1 }]}>
              {item.name.length > 14 ? item.name.substring(0, 14) + '...' : item.name}
              </Text>
              <Text style={[styles.lighttext, {}]}>
                {item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', marginEnd: 10, gap: 10, marginTop: 15 }}>
              <Image source={rightArrow} style={[styles.rightArrow, { height: 20, width: 40 }]} />
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const TabScreen2 = () => (
    <ScrollView style={styles.container}>
      {solddata.map((item, index) => (
        <View key={index} style={{ flex: 1, marginBottom: 9 }}>
          <TouchableOpacity
            style={styles.itemscurvebox}
            onPress={() => navigation.navigate('bands', { item: item })}
          >
            <Image source={{ uri: `${serverAPIURL}/${item.imageUri[0]}` }} style={styles.itemsImage} />
            <View style={styles.itemscurveboxTEXTBOX}>
              <Text style={[styles.boldtext, { fontSize: 25, opacity: 1 }]}>                 
                   {item.name.length > 14 ? item.name.substring(0, 14) + '...' : item.name}</Text>
              <Text style={[styles.lighttext, {}]}>
                {item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', marginEnd: 10, gap: 10, marginTop: 15 }}>
              <Image source={rightArrow} style={[styles.rightArrow, { height: 20, width: 40 }]} />
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const TabScreen3 = () => (
    <ScrollView style={styles.container}>
      {boughtdata.map((item, index) => (
        <View key={index} style={{ flex: 1, marginBottom: 9 }}>
          <TouchableOpacity
            style={styles.itemscurvebox}
            onPress={() => navigation.navigate('bands', { item: item })}
          >
            <Image source={{ uri: `${serverAPIURL}/${item.imageUri[0]}` }} style={styles.itemsImage} />
            <View style={styles.itemscurveboxTEXTBOX}>
              <Text style={[styles.boldtext, { fontSize: 25, opacity: 1 }]}>
              {item.name.length > 14 ? item.name.substring(0, 14) + '...' : item.name}
              </Text>
              <Text style={[styles.lighttext, {}]}>
                {item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', marginEnd: 10, gap: 10, marginTop: 15 }}>
              <Image source={rightArrow} style={[styles.rightArrow, { height: 20, width: 40 }]} />
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const response = await axios.post(`${serverAPIURL}/api/getdeals`, { email: email });
        setdealingdata(response.data.currently_dealing);
        setboughtdata(response.data.bought_items);
        setsolddata(response.data.sold_items);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'currentlyDealing', title: 'Currently Dealing' },
    { key: 'soldItems', title: 'Items Sold' },
    { key: 'boughtItems', title: 'Items Bought' },
  ]);

  const renderScene = SceneMap({
    currentlyDealing: TabScreen1,
    soldItems: TabScreen2,
    boughtItems: TabScreen3,
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#011F45" }}>
        <View style={{ height: 100, width: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: "white", borderRadius: 10 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }


  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backArrow} style={{ height: 50, width: 50, marginLeft: 10 }} />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Deals</Text>
      </View>
      <StatusBar backgroundColor="#011f45" style="light" />
              <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: 100 }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              style={{ backgroundColor: '#011f45' }} // Red background for the tab bar
              indicatorStyle={{ backgroundColor: 'white' }} // White underline for active tab
              labelStyle={{ color: 'white' }} // White text color for labels
            />
          )}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011f45',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 9,
    paddingRight: 9,
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#011f45',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#011f45',
    marginTop: 40,
  },
  headerText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 17,
  },
  boldtext: {
    fontWeight: 'bold',
    fontSize: 40,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  lighttext: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: 'light',
    fontSize: 14,
    paddingBottom: 10,
  },
  rightArrow: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    opacity: 0.5,
  },
  itemscurvebox: {
    flex: 1,
    backgroundColor: 'rgba(56, 182, 255, 0.2)',
    borderRadius: 20,
    flexShrink: 1,
    paddingLeft: 15,
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemsImage: {
    height: 50,
    width: 50,
    opacity: 0.8,
    borderRadius: 15,
  },
  itemscurveboxTEXTBOX: {
    paddingStart: 10,
    paddingTop: 5,
  },
  tabView: {
    marginTop: 20, 
    // Add space to top of the view
  },
});

export default DealsTabs;
