import { View, Text, StyleSheet } from "react-native";


export default function SearchByCar({navigation, route}){


const   {city, countryName, destination} = route.params;
    return(

        <View>

            <Text>You are travelling to {destination}</Text>

        </View>

    )
}

const styles = StyleSheet.create({


    




});