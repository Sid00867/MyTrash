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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import backArrow from './assets/backarrow.png';
import { serverAPIURL } from './config';

const windowWidth = Dimensions.get('window').width;

export default function ProductInfo({ route, navigation }) {

  const { item, distance } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const images = item.imageUri;

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
    navigation.navigate('chat', {
      item : item,
      isUserSeller : false,
      buyer_email : ""
    });
  };

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (modalVisible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: selectedImageIndex * windowWidth,
        animated: false,
      });
    }
  }, [modalVisible]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView behavior="height" style={styles.scrollView}>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 50,
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 10,
            gap: 30,
            marginLeft: 10,
          }}
        >
          <TouchableOpacity onPress={goBack}>
            <Image source={backArrow} style={{ height: 50, width: 50 }} />
          </TouchableOpacity>
          <Text style={styles.title}>{item.name}</Text>
        </View>

        <View style={styles.content2}>
          <View style={styles.primaryImageContainer}>
            <TouchableOpacity onPress={() => handleImagePress(0)}>
              <Image
                style={styles.primaryImage}
                source={{ uri: `${serverAPIURL}/${images[0]}` }}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScrollView}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)}
              >
                <Image
                  style={styles.thumbnailImage}
                  source={{ uri: `${serverAPIURL}/${image}` }}
                />
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
            <Text style={styles.title2}>Seller Details</Text>
            <Text style={styles.info}>Name: {item.sellername}</Text>
            <Text style={styles.info}>Number: {item.phone}</Text>
            <Text style={styles.info}>Distance: {distance} km</Text>
            <Text />
          </View>
        </View>

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
                  scrollViewRef.current.scrollTo({
                    x: selectedImageIndex * windowWidth,
                    animated: false,
                  });
                }}
                onScroll={(event) => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const index = Math.round(contentOffsetX / windowWidth);
                  setSelectedImageIndex(index + 1);
                }}
                onScrollEndDrag={(event) => handleSwipe(event.nativeEvent)}
              >
                {images.map((image, index) => (
                  <View key={index} style={styles.fullscreenImageContainer}>
                    <Image
                      style={styles.fullscreenImage}
                      source={{ uri: `${serverAPIURL}/${image}` }}
                    />
                  </View>
                ))}
              </ScrollView>
              <View style={styles.imageNumberContainer}>
                <Text
                  style={styles.imageNumberText}
                >{`${selectedImageIndex} / ${images.length}`}</Text>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAwareScrollView>
      <Text />
      <TouchableOpacity style={styles.contactButton} onPress={contactNow}>
        <Text style={styles.contactButtonText}>Contact Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011F45',
  },
  scrollView: {
    marginBottom: 60, // Ensures space for the fixed button
  },
  content1: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: 'bold',
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
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
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
    backgroundColor: 'rgb(30,30,180)',
    padding: 10,
    borderRadius: 10,
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  title2: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
    paddingHorizontal: 15,
  },
  info: {
    color: 'white',
    fontSize: 15,
    paddingHorizontal: 15,
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
  itemscurvebox: {
    flex: 1,
    backgroundColor: 'rgba(56, 182, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 20,
  },
  contactButton: {
    backgroundColor: 'rgb(20,20,200)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
