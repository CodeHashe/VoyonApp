import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";



const apiKey = "lfTJq6SXlQcxxoKq5EOzelOKwYpinL1b";


export default function SearchByAir({navigation, route}){
    const{city, countryName, destination} = route.params;



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



    )



}


const styles = StyleSheet.create({

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
      },
      headerTitle: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily:"Vilonti-Bold",
        color: "#555",
      },

    










});


