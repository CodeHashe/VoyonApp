import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { auth } from "./Firebase/firebaseConfig";
import * as Font from "expo-font"; 
import { SvgUri } from "react-native-svg";


import HomeIcon from "./assets/Home.svg"; 
import RoutesIcon from "./assets/Route.svg";
import ActivitiesIcon from "./assets/Activities.svg";
import PlacesIcon from "./assets/Places.svg";
import AccountIcon from "./assets/Accounts.svg";


// Import Authentication Screens
import LaunchPage from './LaunchPage/LaunchPage';
import SignInScreen from "./SignInPage/SignInPage";
import SignUpScreen from "./SignUpPage/SignUpPage";
import VerificationPage from './SignUpPage/VerificationPage';

// Import Main Screens
import HomeScreen from "./HomePage/HomePage";
import RoutesScreen from "./RoutesPage/RoutesPage";
import ActivitiesScreen from "./ActivitiesPage/ActivitiesPage";
import PlacesPage from "./PlacesPage/PlacesPage";
import AccountsPage from './AccountsPage/AccountsPage';

// Create Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ **Custom Bottom Tab Navigator**
function CustomTabBar({ state, descriptors, navigation }) {
  const icons = {
    Home: <HomeIcon width={24} height={24} />,
    Routes: <RoutesIcon width={24} height={24} />,
    Activities: <ActivitiesIcon width={24} height={24} />,
    Places: <PlacesIcon width={24} height={24} />,
    Account: <AccountIcon width={24} height={24} />,
  };

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const label = route.name;
        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity key={index} style={styles.tabItem} onPress={onPress}>
            <View style={{ alignItems: "center" }}>{icons[label]}</View>
            <Text style={[styles.tabText, isFocused && styles.activeText]}>{label}</Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


// ✅ **Bottom Tabs for After Login**
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: styles.tabBar }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Routes" component={RoutesScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Places" component={PlacesPage} />
      <Tab.Screen name="Account" component={AccountsPage} />
    </Tab.Navigator>
  );
}

// ✅ **Main Stack Navigator (Handles Auth + Tabs)**
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState(null); // Track user authentication

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Vilonti-Regular": require("./assets/fonts/Vilonti-Regular.ttf"),
        "Vilonti-Bold": require("./assets/fonts/Vilonti-Bold.ttf"),
        "Vilonti-Black": require("./assets/fonts/Vilonti-ExtraBlack.ttf"),
        "Vilonti-Medium": require("./assets/fonts/Vilonti-Medium.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();

    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((authenticatedUser) => {
      console.log("Auth State Changed:", authenticatedUser);
      setUser(authenticatedUser);
    });

    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><Text>Loading Fonts...</Text></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // If user is logged in, show the bottom tabs
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          // Otherwise, show authentication screens
          <>
            <Stack.Screen name="Launch" component={LaunchPage} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Verification" component={VerificationPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// ✅ **Styles**
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#010F29",
    borderRadius: 30,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabText: { fontFamily: "Vilonti-Bold", fontSize: 12, color: "#FFFFFF", marginTop: 5 },
  activeText: { color: "#FFFFFF" },
  activeIndicator: { position: "absolute", width: 80, height: 70, backgroundColor: "#234F9B", borderRadius: 30, zIndex:-1 },
});