import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Button,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import placeholderImage from './assets/placeholder-image.jpeg';
import profilepic from './assets/profile-user.png';
import rightArrow from './assets/arrow-point-to-right.png';
import axios from 'axios';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import backArrow from './assets/backarrow.png';
import { serverAPIURL } from './config';

NavigationBar.setBackgroundColorAsync("#283950");

const windowWidth = Dimensions.get('window').width;


const BuyerSelectionModal = ({ visible, onClose, buyers, onDeleteItem, onRemoveFromMarketplace, serverurl }) => {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [error, setError] = useState('');

  const handleSelectBuyer = (buyer) => {
    setSelectedBuyer(buyer);
    setError('');
  };

  const handleDeleteItem = () => {
    if (selectedBuyer) {
      onDeleteItem(selectedBuyer);
    } else {
      setError('Please select a buyer');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles3.modalBackground}>
        <View style={styles3.modalContainer}>
          <Text style={styles3.title}>Select The Buyer You Sold / Selling this Item to</Text>
          <ScrollView style={styles3.scrollView}>
          {buyers.length === 0 ? (
              <Text style={[styles.lighttext, { textAlign: 'center', marginTop: 20 , alignSelf: 'center'}]}>No Buyers yet</Text>
            ) : (
              buyers.map((buyer, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles3.buyerContainer, selectedBuyer === buyer && styles3.selectedBuyer]}
                  onPress={() => handleSelectBuyer(buyer)}
                >

                <Image
                  source={ 
                    buyer.profilepic ? {uri :`${serverurl}${buyer.profilepic}`} : profilepic 
                  }
                  style={styles3.profilePicture} // Local fallback image
                />

                  <Text style={styles3.buyerName}>{buyer.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          {error ? <Text style={styles3.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles3.button, !selectedBuyer && styles3.disabledButton]}
            onPress={handleDeleteItem}
            disabled={!selectedBuyer}
          >
            <Text style={styles3.buttonText}>REMOVE ITEM FROM MARKETPLACE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles3.button}
            onPress={onRemoveFromMarketplace}
          >
            <Text style={styles3.buttonText}>THE ITEM IS NOT BEING SOLD TO ANYONE?{'\n'}CLICK HERE TO JUST REMOVE</Text>
          </TouchableOpacity>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};




export default function ProductInfo({ route, navigation }) { 


  const { item } = route.params; 

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(1);
  const scrollViewRef = useRef(null);



  const images = item.imageUri;
  const [buyerlist,setbuyerlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerdata, setbuyerdata] = useState([]);

  const [modalVisible2, setModalVisible2] = useState(false);


  const handleDeleteItem = async (buyer) => {
    // console.log('Item deleted for buyer:', buyer);
    setModalVisible2(false);
    const res = await axios.post(`${serverAPIURL}/api/itemsold`, {
      item : item,
      buyeremail : buyer.email,
      buyerlist : buyerlist
    }).then(() => {
      Alert.alert(
        'Item Sold And Deleted', // Title (Heading)
        'Your Item has been Removed from the Marketplace', // Message
        [
          {
            text: 'OK', // Button text
            onPress: () => console.log('OK Pressed'), // Action on button press
          },
        ],
        { cancelable: true } // Option to prevent canceling by tapping outside
      );
    });
    navigation.goBack();
  };

  const handleRemoveFromMarketplace = async () => {
    // console.log('Item removed from marketplace');
    setModalVisible2(false);
    const res = await axios.post(`${serverAPIURL}/api/deleteitem`, {
          item : item,
          buyerlist : buyerlist
        }).then(() => {
          Alert.alert(
            'Successfully Deleted', // Title (Heading)
            'Your Item has been Removed from the Marketplace', // Message
            [
              {
                text: 'OK', // Button text
                onPress: () => console.log('OK Pressed'), // Action on button press
              },
            ],
            { cancelable: true } // Option to prevent canceling by tapping outside
          );
        });
      navigation.goBack();
  };


  useEffect(() => {
    const fetchdata = async () => {
      try {
        const bl = await axios.post(`${serverAPIURL}/api/getbuyerlist`, { item: item });
        setbuyerlist(bl.data.buyer_list);
  
        if (bl.data.buyer_list.length > 0) {
          try {
            // Initialize a temporary array to accumulate data
            const newBuyerData = [];
  
            for (let index = 0; index < bl.data.buyer_list.length; index++) {
              const element = bl.data.buyer_list[index];
              const userdata = await axios.post(`${serverAPIURL}/api/getuser`, { email: element });
              let data = userdata.data;
  
              // Get chat messages for the current buyer
              let chat = await axios.post(`${serverAPIURL}/api/getchat`, { item: item, buyer_email: element });

              let lastmessage;
              if(chat.data.messages.length > 0) {
                  lastmessage = chat.data.messages[chat.data.messages.length - 1];
              }else{
                  lastmessage = {type:"text", content : ""};
              }

              // Determine the type of the last message
              let lastMessageContent = "";
              if (lastmessage.type === "image") {
                lastMessageContent = "image";
              } else if (lastmessage.type === "location") {
                lastMessageContent = "location";
              } else {
                lastMessageContent = lastmessage.content;
              }
  
              // Accumulate data in the temporary array
              newBuyerData.push({
                key: lastmessage.id,
                name: data.name,
                lastmessage: lastMessageContent,
                profilepic : data.profilepic,
                email : data.email
              });
            }
  
            // Update the state with the accumulated data
            setbuyerdata(newBuyerData);
  
          } catch (error) {
            console.log("B1 ERROR:", error);
          }
        }
      } catch (error) {
        console.log("FETCHDATA ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchdata();
  }, []);

  // const [suremodalVisible, setsureModalVisible] = useState(false);

  // const handleConfirm = async () => {
  //   // setsureModalVisible(false);
  //   const res = await axios.post(`${serverAPIURL}/api/deleteitem`, {
  //     item : item
  //   }).then(() => {
  //     Alert.alert(
  //       'Successfully Deleted', // Title (Heading)
  //       'Your Item has been Removed from the Marketplace', // Message
  //       [
  //         {
  //           text: 'OK', // Button text
  //           onPress: () => console.log('OK Pressed'), // Action on button press
  //         },
  //       ],
  //       { cancelable: true } // Option to prevent canceling by tapping outside
  //     );
  //   });
  // };

  // const handleCancel = () => {
  //   setsureModalVisible(false);
  // };


  useEffect(() => {
    if (modalVisible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: selectedImageIndex * windowWidth, animated: false });
    }
  }, [modalVisible]);




  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const handleSwipe = (gestureState) => {
    const { dx } = gestureState;
    if (Math.abs(dx) > 50) {
      if (dx > 0) {
        // Swiped right
        setSelectedImageIndex((prevIndex) =>
          prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
      } else {
        // Swiped left
        setSelectedImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }
    }
  };

  const contactNow = () => {
    // navigation.navigate("ChatPage");
  };

  const goBack = () => {
    // navigation.navigate("BuyPage");
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
          <StatusBar backgroundColor="#011f45" style="light" />
      <KeyboardAwareScrollView behavior="height" style={styles.scrollView}>


          <BuyerSelectionModal
            visible={modalVisible2}
            onClose={() => setModalVisible2(false)}
            buyers={buyerdata}
            serverurl = {serverAPIURL}
            onDeleteItem={handleDeleteItem}
            onRemoveFromMarketplace={handleRemoveFromMarketplace}
          />

        <View style={{flexDirection:'row', marginTop:50,justifyContent:'flex-start', alignItems: 'center', marginBottom:10, gap:30, marginLeft:10}}>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backArrow} style={{height : 50 , width : 50}}></Image>
        </TouchableOpacity>
        <Text style={styles.title}>{item.name}</Text>

        </View>

        <View style={styles.content2}>
          <View style={styles.primaryImageContainer}>
            <TouchableOpacity onPress={() => handleImagePress(0)}>
              <Image style={styles.primaryImage} source={{uri : `${serverAPIURL}/${images[0]}`}} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
            {images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => handleImagePress(index)}>
                <Image style={styles.thumbnailImage} source={{uri : `${serverAPIURL}/${image}`}} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View>
            <Text />
            <Text style={styles.title2}>Description</Text>
            <Text style={styles.info}>{item.description}</Text>
            <Text />
            <Text style={styles.title2}>Category</Text>
            <Text style={styles.info}>{item.category}</Text>
            <Text />
            <TouchableOpacity 
            onPress={() => {setModalVisible2(true)}}
            style={{
                backgroundColor: '#007BFF', // Blue color
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                margin: 10
            }}
        >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight:'bold'}}>REMOVE ITEM FROM MARKETPLACE </Text>
        </TouchableOpacity>
          </View>
        </View>
        <Text style={{ color: '#FFF', fontSize: 27, fontWeight:'bold' , marginBottom:10, marginTop:7}}>  Interested Buyers</Text>


        {buyerdata.length === 0 ? (
        <Text style={[styles.lighttext, { textAlign: 'center', marginTop: 20 , alignSelf: 'center'}]}>No offers made yet</Text>
      ) : (
        buyerdata.map((buyer) => (
          <View key={buyer.key} style={{ flex: 1, marginBottom: 10 }}>
            <TouchableOpacity style={styles.itemscurvebox}
            onPress={() => navigation.navigate('chat',{item : item, isUserSeller : true, buyer_email : buyer.email})}>

               <Image
                  source={ 
                    buyer.profilepic ? {uri :`${serverAPIURL}${buyer.profilepic}`} : profilepic 
                  }
                  style={styles.itemsImage} // Local fallback image
                />

              <View style={styles.itemscurveboxTEXTBOX}>
                <Text style={[styles.boldtext, { fontSize: 25, opacity: 1 }]}>{buyer.name.length > 14 ? buyer.name.substring(0, 14) + '...' : buyer.name}</Text>
                <Text style={[styles.lighttext]}>
                  {buyer.lastmessage.length > 30 ? buyer.lastmessage.substring(0, 30) + '...' : buyer.lastmessage}
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', marginEnd: 10, gap: 10, marginTop: 15 }}>
                <Image source={rightArrow} style={[styles.rightArrow, { height: 20, width: 40 }]} />
                <Text style={[styles.lighttext, { alignSelf: 'flex-end' }]}></Text>
              </View>
            </TouchableOpacity>
          </View>
        ))
      )}



     {/* <Modal
        transparent={true}
        animationType="slide"
        visible={suremodalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles2.modalOverlay}>
          <View style={styles2.modalContainer}>
            <Text style={styles2.modalText}>Are You Sure?</Text>
            <View style={styles2.buttonContainer}>
              <TouchableOpacity style={styles2.button} onPress={handleConfirm}>
                <Text style={styles2.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles2.button, {backgroundColor:'rgba(255,0,0,0.7)'}]} onPress={handleCancel}>
                <Text style={styles2.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}


        {modalVisible && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <ScrollView
                ref={scrollViewRef}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                style={styles.fullscreenScrollView}
                onLayout={() => {
                  setSelectedImageIndex(1);
                  scrollViewRef.current.scrollTo({ x: selectedImageIndex * windowWidth , animated: false });
                }}
                onScroll={(event) => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const index = Math.round(contentOffsetX / windowWidth);
                  setSelectedImageIndex(index+1);
                }}
                onScrollEndDrag={(event) => handleSwipe(event.nativeEvent)}
              >
                {images.map((image, index) => (
                  <View
                    key={index}
                    style={styles.fullscreenImageContainer}
                  >
                    <Image
                      style={styles.fullscreenImage}
                      source={{uri : `${serverAPIURL}/${image}`}}
                    />
                  </View>
                ))}
              </ScrollView>
              <View style={styles.imageNumberContainer}>
                <Text style={styles.imageNumberText}>{`${selectedImageIndex} / ${images.length}`}</Text>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011F45',
  },
  content1: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },
  content2: {
    flex: 2,
    backgroundColor: 'rgba(56, 182, 255, 0.2)',
    paddingVertical: 30,
    
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 23,
    maxWidth: 290,
    fontWeight:'bold'
},
  primaryImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryImage: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
  },
  horizontalScrollView: {
    flexDirection: 'row',
  },
  thumbnailImage: {
    height: 65,
    width: 65,
    marginHorizontal: 8,
    borderRadius : 10,
    borderColor :'white',
    borderWidth: 2
  },
  modalView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenScrollView: {
    backgroundColor: '#011F45',
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: windowWidth,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    backgroundColor :'rgb(30,30,180)',
    padding :10,
    borderRadius :10,
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  title2: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25,
    paddingHorizontal: 15
  },
  info: {
    color: "white",
    fontSize: 15,
    paddingHorizontal: 15
  },
  imageNumberContainer: {
    position: 'absolute',
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderRadius: 20,
    padding: 10,
  },
  imageNumberText: {
    color: 'white',
    fontSize: 16,
  },
  itemscurvebox:{
    flex:1,
    backgroundColor: "rgba(56, 182, 255, 0.2)",
    borderRadius: 20,
    flexShrink: 1,
    paddingLeft:15,
    alignItems:'center',
    flexDirection:'row',
    marginLeft :10,
    marginRight:10,
  },
  itemsImage:{
    height:50,
    width:50,
    opacity:0.8,
    borderRadius:15
  },
  itemscurveboxTEXTBOX:{
    paddingStart:10,
    paddingTop:5,
  },
  boldtext:{
    // fontFamily : 'bernoru',
    alignSelf:'flex-start',
    fontWeight: 'bold',
    fontSize:40,
    color:'rgba(255, 255, 255, 0.85)'
  },
  lighttext:{
    alignSelf:'flex-start',
    color:'rgba(255, 255, 255, 0.75)',
    fontWeight:'light',
    fontSize:14,
    paddingBottom:10
  },
  rightArrow:{
    height:40,
    width:40,
    resizeMode:'contain',
    alignSelf:'flex-end',
    opacity:0.5
  },
});


const styles2 = StyleSheet.create({

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'rgba(0, 55, 120,0.89)',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color:'white',
    fontWeight:'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(122,220,255,0.9)',
    borderRadius: 5,
  },
  buttonText:{
    fontWeight:'bold',
    color:'white',
  },

});


const styles3 = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1E3A8A', // Dark blue color
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  scrollView: {
    height: 200,
    width: '100%',
    marginBottom: 10,
  },
  buyerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#334155', // Darker blue for unselected
    marginBottom: 5,
  },
  selectedBuyer: {
    backgroundColor: '#2563EB', // Lighter blue for selected
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  buyerName: {
    fontSize: 16,
    color: 'white',
  },
  button: {
    backgroundColor: '#2563EB', // Lighter blue
    padding: 7,
    borderRadius: 5,
    height : 60,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#1E3A8A', // Same as modal background color
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

