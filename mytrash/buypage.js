import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View , Image, TouchableOpacity, ScrollView,  Dimensions, Modal,ActivityIndicator, Alert} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import backArrow from './assets/backarrow.png';
import filtericon from './assets/filter.png';
import cancel from './assets/cancel.png'
import placeholder from './assets/placeholder-image.jpeg';
import React, { useState, useEffect } from 'react';
import { Searchbar  ,IconButton } from 'react-native-paper';
// import { SelectList } from 'react-native-dropdown-select-list';
import downarrow from './assets/downarrow.png';
import search from './assets/search.png';
import close from './assets/close.png';
import CheckBox from 'expo-checkbox';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAPIURL } from './config';
import { Ad } from './config';

NavigationBar.setBackgroundColorAsync("#283950");


const ItemCard = ({ name, info , sellerName, distance , imageuri, onpress, isseller}) => (
  <TouchableOpacity style={{
    width:(Dimensions.get('window').width - 30) / 2.06,
    backgroundColor:'rgba(217,217,217,0.2)',
    borderRadius:20
  }}
  onPress = {() => {onpress(isseller)}}
  >
    <Image source={imageuri} style={{
        width: '100%',
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
        height:(Dimensions.get('window').width - 30) / 2.06
    }}/>
    <View style={{justifyContent: 'space-around',flex:1}}>
      <Text style={{color:'white', fontWeight:'bold',  marginTop:5, paddingStart:10 ,paddingEnd: 10, fontSize:20}}>{name}</Text>

      {/* {info.length > 50 ? <Text style={{color:'rgba(255,255,255,0.5)', fontWeight:'light',  marginBottom:5, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10}}>{info}</Text> 
      : <Text style={{color:'rgba(255,255,255,0.5)', fontWeight:'light',  marginBottom:5, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10}}>{info.slice(0,50)}...</Text>} */}
      

      <Text style={{color:'rgba(255,255,255,0.5)', fontWeight:'light',  marginBottom:5, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10}}>
      {info.length > 50 ? info.substring(0, 50) + '...' : info}
      </Text>

      <Text style={{color:'rgba(255,255,255,0.5)',  marginBottom:5, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10,fontSize:12}}>SOLD BY : <Text style={{color:'white', fontWeight:'bold',  marginTop:5, alignSelf: 'center',fontSize:12}}>{sellerName}</Text></Text>
      {!isseller ? <Text style={{color:'rgba(255,255,255,0.8)', fontWeight:'bold',  marginBottom:0, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10,fontSize:17}}>📍{distance} km </Text> : null}
      {!isseller ? <Text style={{color:'rgba(255,255,255,0.5)', fontWeight:'bold',  marginBottom:5, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10,fontSize:13}}>(Approximate)</Text> : null}
      {isseller ? <Text style={{color:'rgba(255,255,255,0.5)', fontWeight:'light',  marginBottom:5, alignSelf: 'flex-start',paddingStart:10,paddingEnd:10, fontSize:12}}>This is Your Item</Text> : null}
    </View>
  </TouchableOpacity>
);



export default function App ({navigation}) {


  const [loadingstart, setLoadingstart] = useState(true);
  const [emailinmobile, setemailinmobile] = useState("");

  useEffect(() => { 
    
    const fetchusermail = async () => {

      try {

        const em = await AsyncStorage.getItem('email');
        setemailinmobile(em);

      } catch (error) {
        console.error("An error occurred:", error);
      }   finally {
        setLoadingstart(false);
        const em = await AsyncStorage.getItem('email');
        firstsearchup(em);
      }
    };

    fetchusermail();
},[]);



  const searchup = async () => {
    try {

        setLoading(true);

        ////////////////////////BELOW CODE MIGHT CAUSE PROBLEMS AS VARIABLES MIGHT BE REFERENCED BEFORE THEY ARE DEFINE

        let user = await axios.post(`${serverAPIURL}/api/getuser`, {email: emailinmobile});
        let latitude  = user.data.latitude;
        let longitude = user.data.longitude;
        
        const response = await axios.post(`${serverAPIURL}/api/getitem`, {categories: checkBoxData, 
        distances : checkBoxData2,searchbox :
        searchQuery,latitude : latitude,longitude : longitude}).then((response) => {

            setLoading(false);
            let Items = response.data.Items;
            let Radius = response.data.Radius;
            setradius(Radius);
            setsearchedItems(Items);
            setFirstLoad(false);
            
            });
       ////////////////////////////////////////////////////////////////

      } catch (error) {
        console.error(error);
      }
  };


  const firstsearchup = async (em) => {
    try {

        setLoading(true);

        ////////////////////////BELOW CODE MIGHT CAUSE PROBLEMS AS VARIABLES MIGHT BE REFERENCED BEFORE THEY ARE DEFINE


        let user = await axios.post(`${serverAPIURL}/api/getuser`, {email: em});
        let latitude  = user.data.latitude;
        let longitude = user.data.longitude;
        
        const response = await axios.post(`${serverAPIURL}/api/getfirstitems`, {
        latitude : latitude,longitude : longitude}).then((response) => {

            setLoading(false);
            let Items = response.data.Items;
            let Radius = response.data.Radius;
            setradius(Radius);
            setsearchedItems(Items);
            setFirstLoad(false);
            });
       ////////////////////////////////////////////////////////////////

      } catch (error) {
        console.error(error);
      }
  };

//   const itemData = [
//     { key: '1', name: 'Aluminium', info: 'Lightweight and resistant to corrosion', sellerName: 'Eco Metals', distance: 10, category: 'Aluminium' },
//     { key: '2', name: 'Cardboard', info: 'Recyclable material often used for packaging', sellerName: 'GreenBox Recycling', distance: 20, category: 'Cardboard' },
//     { key: '3', name: 'Iron', info: 'Strong metal used in construction and manufacturing', sellerName: 'Iron Giant Inc.', distance: 15, category: 'Iron' },
//     { key: '4', name: 'Paper', info: 'Widely recycled material made from wood pulp', sellerName: 'PaperWorks Corp', distance: 25, category: 'Paper' },
//     { key: '5', name: 'Plastic', info: 'Versatile material used in various products', sellerName: 'PolyPlast Industries', distance: 5, category: 'Plastic' },
//     { key: '6', name: 'Copper', info: 'Conductive metal used in electrical wiring', sellerName: 'CopperCraft', distance: 30, category: 'Copper' },
//     { key: '7', name: 'Glass', info: 'Recyclable material used in bottles and windows', sellerName: 'ClearView Glass', distance: 12, category: 'Glass' },
//     { key: '8', name: 'Steel', info: 'Durable metal alloy used in construction', sellerName: 'SteelTech Solutions', distance: 18, category: 'Steel' },
//     { key: '9', name: 'Wood', info: 'Organic material used in furniture and building', sellerName: 'TimberWorks', distance: 8, category: 'Wood' },
//     { key: '10', name: 'Textiles', info: 'Fabric materials used in clothing and upholstery', sellerName: 'FabricCraft', distance: 22, category: 'Textiles' },
//     { key: '11', name: 'Electronics', info: 'Devices containing valuable metals like gold and silver', sellerName: 'TechRecycle', distance: 35, category: 'Electronics' },
//     { key: '12', name: 'Rubber', info: 'Flexible material used in tires and seals', sellerName: 'RubberTech', distance: 28, category: 'Rubber' },
//     { key: '13', name: 'Tin', info: 'Soft metal used in coatings and alloys', sellerName: 'TinWorks', distance: 17, category: 'Tin' },
//     { key: '14', name: 'Brass', info: 'Alloy of copper and zinc, used in musical instruments', sellerName: 'BrassCraft', distance: 14, category: 'Brass' },
//     { key: '15', name: 'Lead', info: 'Heavy metal used in batteries and shielding', sellerName: 'LeadTech', distance: 40, category: 'Lead' }
// ];


const [searchedItems,setsearchedItems] = useState([]);
const [radius,setradius] = useState([]);
const [loading, setLoading] = useState(false);

const categoryData = [
  { key: '1', value: 'Aluminium', checked: false },
  { key: '2', value: 'Cardboard', checked: false },
  { key: '3', value: 'Iron', checked: false },
  { key: '4', value: 'Paper', checked: false },
  { key: '5', value: 'Plastic', checked: false },
  { key: '6', value: 'Copper', checked: false },
  { key: '7', value: 'Glass', checked: false },
  { key: '8', value: 'Steel', checked: false },
  { key: '9', value: 'Wood', checked: false },
  { key: '10', value: 'Textiles', checked: false },
  { key: '11', value: 'Electronics', checked: false },
  { key: '12', value: 'Rubber', checked: false },
  { key: '13', value: 'Tin', checked: false },
  { key: '14', value: 'Brass', checked: false },
  { key: '15', value: 'Lead', checked: false },
  { key: '16', value: 'Others', checked: false }
];
  
  
  const distanceData = [
    { key: '1', value: '<3km ', checked: false },
    { key: '2', value: '3-10km' , checked: false },
    { key: '3', value: '10-20km' , checked: false },
    { key: '4', value: '20-40km' , checked: false},
    { key: '5', value: '>40km', checked: false }
  ];

  const [checkBoxData, setCheckBoxData] = useState(categoryData);
  const [checkBoxData2, setCheckBoxData2] = useState(distanceData);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [firstLoad, setFirstLoad] = useState(true);
  const [searchtext, setsearchtext] = useState('');
  
  
  const checkSearch = () => {
    isanythingchecked = false;
    for (let index = 0; index < checkBoxData.length; index++) {
        const element = checkBoxData[index];
        if(element.checked){
            isanythingchecked = true;
        }
    }
    for (let index = 0; index < checkBoxData2.length; index++) {
        const element = checkBoxData2[index];
        if(element.checked){
            isanythingchecked = true;
        }
    }
    if (!(searchQuery.trim() === '' || searchQuery == null)){
        isanythingchecked = true;
    }
    return isanythingchecked;
  }





  useEffect(() => {
    // This will run every time `checkBoxData` changes
    if (checkSearch()){
        searchup();
    }
  }, [checkBoxData]);

  useEffect(() => {
    // This will run every time `checkBoxData2` changes
    if (checkSearch()){
        searchup();
    }
  }, [checkBoxData2]);

  useEffect(() => {
    // This will run every time `searchQuery` changes
    // console.log(searchQuery)
    if (checkSearch()){
        searchup();
    }
  }, [searchtext]);

  useEffect(() => {
    //something here
  }, [loading]);

  const changesearch = () => {
    // console.log(searchQuery);
    setsearchtext(searchQuery.trimEnd());
  };



  const handleCheckboxChange = (key) => {
    setCheckBoxData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, checked: !item.checked } : item
      )
    );
    // console.log(checkBoxData);
  };

  const handleCheckboxChange2 = (key) => {
    setCheckBoxData2((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, checked: !item.checked } : item
      )
    );
  };
  const [isModalVisible,setIsModalVisible] = useState(false);
  
 
  const Filtercard = ({name,item2,data}) => (

    <View style={{
      borderRadius:20,
      height:40,
      width:'auto',
      backgroundColor:'rgba(217,217,217,0.3)',
      flexDirection: 'row',
      justifyContent:'space-evenly',
      alignItems:'center'
    }}>
      <Text style={{color:'white', fontWeight:'bold', marginStart:10}}>{name}</Text>
        <TouchableOpacity onPress={()=>{
                  // console.log("pressed")
                  if(data == "checkBoxData"){
                    handleCheckboxChange(item2.key);
                  }
                  if(data == "checkBoxData2"){
                    handleCheckboxChange2(item2.key);
                  }


      }}>
      <Image source={cancel} style={{height:30,width:30,marginEnd:10, marginStart:5, opacity:0.5}}></Image>
      </TouchableOpacity>
    </View>
  );

  if (loadingstart) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , backgroundColor:"#011F45"}}>
        <View style={{ height:100, width:100, justifyContent: 'center', alignItems: 'center' , backgroundColor:"white", borderRadius:10}}>
        <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#011f45" style="light" />

      
      

      <Modal visible={isModalVisible} transparent={true} animationType='slide'>
    <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'}}>
      <View style={{
            width: 300,
            height: 700,
            borderRadius:20,
            backgroundColor: 'rgba(0, 55, 120,0.99)',
            shadowColor:'blue',
            shadowOpacity: 0.5,
            shadowRadius:20,
            shadowOffset:{
              width:6,
              height:6
            },
            elevation:30
            }}>
      <Text style={{alignSelf:'center',color:'white',fontWeight:'bold',fontSize:30,alignSelf:"center",marginTop:10}}>Filter</Text>

      <View style={{
          flex:1,
          marginEnd:25,
          marginStart:25,
          marginTop:10,
          marginBottom:15
      }}>

      <Text style={{color:'white',fontWeight:'bold',fontSize:18,alignSelf:'flex-start', marginBottom:10}}>Choose Category:</Text>

      <View style={{height:230}}>
      <ScrollView style={{flex:1}} fadingEdgeLength={100}>
      {checkBoxData.map((item) => {


          return (
            
          <TouchableOpacity onPress={() => handleCheckboxChange(item.key)} key={item.key} style={{flexDirection:'row',marginBottom:10,backgroundColor:'rgba(255,255,255,0.2)',borderRadius:10,alignItems:'center',padding:10}}>
            <CheckBox value={item.checked} onValueChange={() => {handleCheckboxChange(item.key);}} color="lightblue" style={{height:25,width:25}}/> 
            <Text style={{color:'white',fontWeight:'bold',fontSize:16, marginBottom:10, marginStart:10}} >{item.value}</Text>
          </TouchableOpacity>


          );
        })}
      </ScrollView>
      </View>

      <Text style={{color:'white',fontWeight:'bold',fontSize:18,alignSelf:'flex-start', marginBottom:10, marginTop:10}}>Choose Seller Radius From You:</Text>

      <View style={{height:230}}>
      <ScrollView style={{flex:1}} fadingEdgeLength={100}>

      {checkBoxData2.map((item) => {


          return (
            
          <TouchableOpacity onPress={() => handleCheckboxChange2(item.key)} key={item.key} style={{flexDirection:'row',marginBottom:10,backgroundColor:'rgba(255,255,255,0.2)',borderRadius:10,alignItems:'center',padding:10}}>
            <CheckBox value={item.checked} onValueChange={() => {handleCheckboxChange2(item.key)}} color="lightblue" style={{height:25,width:25}}/> 
            <Text style={{color:'white',fontWeight:'bold',fontSize:16, marginBottom:10, marginStart:10}} >{item.value}</Text>
          </TouchableOpacity>


          );
        })}
      </ScrollView>

      </View>
      <TouchableOpacity  style={{backgroundColor:'rgba(0,100,200,1)',alignItems:'center',justifyContent: 'center',borderRadius:20,marginTop:15}}
      onPress={()=>{setIsModalVisible(false);}}>
        <Text style={{color:'white',fontWeight:'bold',fontSize:16,marginTop:10,marginBottom:10}} >APPLY</Text>
      </TouchableOpacity>



      </View>
      </View>
      </View>
      </Modal>
      
      <View style={styles.topitems}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
      <Image source={backArrow} style={{height:50,width:50}}></Image>
      </TouchableOpacity>
      <Text style={{alignSelf:'center',color:'white',fontWeight:'bold',fontSize:30,marginStart:20}}>Buy Scrap</Text>
      </View>
      <View style={{alignSelf:'stretch',flexDirection:'row',marginTop:20,marginStart:20,marginEnd:20}}>
      <Searchbar
        placeholder="Search For Items, Sellers"
        placeholderTextColor="white"
        style={styles.searchbar}
        iconColor='white'
        inputStyle={{color:'white'}}
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => changesearch()}
      />


      <TouchableOpacity style={{alignSelf:'center',marginStart:10}}
      onPress={() => {
        setIsModalVisible(true);
      }}
      >
      <Image source={filtericon} style={{height:50,width:50}}></Image>
      </TouchableOpacity>


      </View>



      <View>

      <View style={{alignItems:'flex-start',alignSelf:'flex-start',marginTop:20,marginStart:10,marginEnd:10}}>
      <Text style={{color:'white',fontWeight:'bold',fontSize:20,marginStart:20}}>Search Results</Text>
      <View style={{flexDirection:'row',gap:5,marginStart:20,marginTop:10,flexWrap:"wrap"}}>
      {checkBoxData.map((item) => {
        if(item.checked){
          return (
          <Filtercard key= {item.key} name={item.value} item2={item} data="checkBoxData"></Filtercard>
        );
        }
        else{
          return null;
        }
      })}

      {checkBoxData2.map((item) => {
        if(item.checked){
          return (
          <Filtercard key= {item.key} name={item.value} item2={item} data="checkBoxData2"></Filtercard>
        );
        }
        else{
          return null;
        }
      })}
      </View>
      </View>

      </View>  
      {loading ? (
        <View style={{height: 400,width: 400,alignItems: 'center',justifyContent: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : firstLoad ? (
        <ScrollView style={styles.scrollcontainer} fadingEdgeLength={100}>
          <View style={styles.scrollchildcontainer}>
            {searchedItems.map((item) => {
              return (
                <ItemCard
                  key = {searchedItems.indexOf(item).toString()}
                  // Add a unique key for each item
                  name={item.name}
                  info={item.description}
                  sellerName={item.sellername}
                  distance={radius[searchedItems.indexOf(item)]}
                  imageuri={{ uri: `${serverAPIURL}/${item.imageUri[0]}` }}
                  isseller={emailinmobile === item.email}
                  onpress={
                    (issellbool) => {
                    if (issellbool) {
                      navigation.navigate('bands', { item: item});
                    } else {
                      navigation.navigate('ProductInfo', { item: item, distance: radius[searchedItems.indexOf(item)] });
                    }
                  }
                  }
                />
              );
            })}
          </View>
        </ScrollView>
      ) : searchedItems.length === 0 ? (
        <Text style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center', marginTop: 200 }}>No Items or sellers found</Text>
      ) : (
        <ScrollView style={styles.scrollcontainer} fadingEdgeLength={100}>
          <View style={styles.scrollchildcontainer}>
            {searchedItems.map((item) => {
              return (
                <ItemCard
                  key = {searchedItems.indexOf(item).toString()}
                  // Add a unique key for each item
                  name={item.name}
                  info={item.description}
                  sellerName={item.sellername}
                  distance={radius[searchedItems.indexOf(item)]}
                  imageuri={{ uri: `${serverAPIURL}/${item.imageUri[0]}` }}
                  isseller={emailinmobile === item.email}
                  onpress={
                    (issellbool) => {
                    if (issellbool) {
                      navigation.navigate('bands', { item: item});
                    } else {
                      navigation.navigate('ProductInfo', { item: item, distance: radius[searchedItems.indexOf(item)] });
                    }
                  }
                  }
                />
              );
            })}
          </View>
        </ScrollView>
      )}
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
  container: {
    flex: 1,
    backgroundColor: '#011f45',
    paddingBottom: 0
  },
  topitems : {
    alignSelf:'stretch',
    flexDirection:'row',
    marginTop:50,
    marginStart:20,
    marginEnd:20,
  },
  searchbar: {
    backgroundColor:'rgba(255,255,255,0.2)',
    flex:1
  },
  scrollcontainer: {
    flex:1,
    marginTop:20,
    marginBottom:10
  },
  scrollchildcontainer: {
    marginStart: 15,
    marginEnd:15,
    flexDirection:'row',
    flexWrap:'wrap',
    rowGap:15,
    columnGap:9.6
  }
});
