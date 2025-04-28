import {View, TouchableOpacity, Text, StyleSheet} from 'react-native'



export default function SearchByCarRoutes({navigation, route}){

    const   {city, countryName, destination} = route.params;


    return(
                <View>
        
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Travel Details</Text>
                    </View>
        
        
        
                    <Text>You are travelling to {destination} from {city} and {countryName} with apiKey {apiKey}</Text>
        
        
                </View>
    );

}

const styles = StyleSheet.create({











});