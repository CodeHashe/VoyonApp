// App.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from "./Firebase/firebaseConfig";
import * as Font from "expo-font"; 
import * as Location from 'expo-location';

import HomeIcon from "./assets/Home.svg"; 
import RoutesIcon from "./assets/Route.svg";
import ActivitiesIcon from "./assets/Activities.svg";
import PlacesIcon from "./assets/Places.svg";
import AccountIcon from "./assets/Accounts.svg";

import LaunchPage from './LaunchPage/LaunchPage';
import SignInScreen from "./SignInPage/SignInPage";
import SignUpScreen from "./SignUpPage/SignUpPage";
import VerificationPage from './SignUpPage/VerificationPage';
import ResetPasswordPage from './ResetPasswordPage/ResetPassword';

import HomeScreen from "./HomePage/HomePage";
import RoutesScreen from "./RoutesPage/RoutesPage";
import PlacesPage from "./PlacesPage/PlacesPage";
import AccountsPage from './AccountsPage/AccountsPage';
import ActivitiesPage from './ActivitiesPage/ActivitiesPage';

import PlaceDetails from './HomePage/PlacesDetails';
import CountryContainers from './HomePage/CountryContainers';
import PopularCountriesPlaces from './HomePage/PopularCountriesPlaces';

import RoutesByAirPage from './RoutesByAirPage/RoutesAir';
import SearchByAir from './SearchPage/SearchByAir';
import SearchByCar from './SearchPage/SearchByCar';
import SearchByCarRoutes from './SearchPage/SearchByCarRoutes';
import SearchByAirFlights from './SearchPage/SearchByAirFlights';
import PlacesSubPage from './PlacesPage/PlacesSubPage';
import ActivitiesPlanningPage from './ActivitiesSubPages/ActivitiesPlanningPage';
import ActivitiesQueue from './ActivitiesSubPages/ActivitiesQueue';
import ActivitiesPlanner from './ActivitiesSubPages/ActivitiesPlanner';
import FlightsInfo from './SearchPage/FlightsInfo';
import RoutesCar from './RoutesByCarPage/RoutesCar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
        const onPress = () => {
          if (!isFocused) {
            navigation.dispatch(TabActions.jumpTo(route.name));
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
          >
            {icons[route.name]}
            <Text style={[styles.tabText, isFocused && styles.activeText]}>
              {route.name}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, tabBarShowLabel: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Routes" component={RoutesScreen} />
      <Tab.Screen name="Activities" component={ActivitiesPage} />
      <Tab.Screen name="Places" component={PlacesPage} />
      <Tab.Screen name="Account" component={AccountsPage} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState(null);

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

    const unsubscribe = auth.onAuthStateChanged((authenticatedUser) => {
      console.log("Auth State Changed:", authenticatedUser);
      setUser(authenticatedUser);
    });
    return unsubscribe;
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Fonts...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} />
            <Stack.Screen name="RoutesByAirPage" component={RoutesByAirPage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Launch" component={LaunchPage} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Verification" component={VerificationPage} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
          </>
        )}
        <Stack.Screen name="CountryContainers" component={CountryContainers} />
        <Stack.Screen name = "FlightsInfo" component={FlightsInfo}/>
        <Stack.Screen name ="ActivitiesPlanningPage" component={ActivitiesPlanningPage}/>
        <Stack.Screen name ="ActivitiesQueue" component={ActivitiesQueue}/>
        <Stack.Screen name ="ActivitiesPlanner" component={ActivitiesPlanner}/>
        <Stack.Screen name="PlaceDetails" component={PlaceDetails}/>
        <Stack.Screen name ="PopularCountriesPlaces" component={PopularCountriesPlaces}/>
        <Stack.Screen name="SearchByAir" component={SearchByAir}/>
        <Stack.Screen name="SearchByCar" component={SearchByCar}/>
        <Stack.Screen name ="SearchByCarRoutes" component={SearchByCarRoutes}/>
        <Stack.Screen name = "SearchByAirFlights" component={SearchByAirFlights}/>
        <Stack.Screen name ="PlacesSubPage" component={PlacesSubPage}/>
        <Stack.Screen name ="RoutesByCarPage" component={RoutesCar}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
    shadowRadius: 10
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  tabText: {
    fontFamily: "Vilonti-Bold",
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 5
  },
  activeText: {
    color: "#FFFFFF"
  },
  activeIndicator: {
    position: "absolute",
    width: 80,
    height: 70,
    backgroundColor: "#234F9B",
    borderRadius: 30,
    zIndex: -1
  }
});
