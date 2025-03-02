import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {auth} from "./Firebase/firebaseConfig.js"
import * as Font from "expo-font"; 

import LaunchPage from './LaunchPage/LaunchPage.js';
import SignInScreen from "./SignInPage/SignInPage.js";
import SignUpScreen from "./SignUpPage/SignUpPage.js";
import AccountsPage from './AccountsPage/AccountsPage.js';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Vilonti-Regular": require("./assets/fonts/Vilonti-Regular.ttf"),
        "Vilonti-Bold": require("./assets/fonts/Vilonti-Bold.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();

    
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><Text>Loading Fonts...</Text></View>; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Launch"  
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Launch" component={LaunchPage} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Accounts" component={AccountsPage}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
