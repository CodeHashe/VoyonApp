import React from 'react';
import { SafeAreaView, View, StyleSheet, Image, Text, Platform, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function VoyonContainer() {
  return (
    <LinearGradient
      colors={["#0D1F44", "#010F29"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.safeArea}>
        <View style={styles.horizontalContainer}>
          <Image
            source={require('./assets/SignInLogo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Voyon</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const HEADER_HEIGHT = width * 0.20;  

const styles = StyleSheet.create({
  gradient: {
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: HEADER_HEIGHT * 0.6,
    height: HEADER_HEIGHT * 0.6,
    resizeMode: 'contain',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontFamily: 'Vilonti-Bold',
    fontSize: HEADER_HEIGHT * 0.3,
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
