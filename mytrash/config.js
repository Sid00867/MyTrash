// config.js
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
export const serverAPIURL = 'http://192.168.31.119:5000';
// export const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7889023293007161/9728035685';
import {View} from 'react-native';

export const Ad = () => (
    <View
      style={{
        width: '100%', // Full width of the screen
        alignItems: 'center', // Center align the ad horizontally
        backgroundColor: '#011F45', // Background color for the ad container
        // position:'absolute', // Position
        // bottom:0
      }}
    >
      {/* <BannerAd
        unitId={adUnitId}
        // adSize="banner"
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      /> */}
    </View>
  );
