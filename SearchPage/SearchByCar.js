import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useRef } from 'react';

const apiKey = "AIzaSyBWZnkXjy-CQOj5rjRxTolNWw4uQQcbd4w";

export default function SearchByCar({ navigation, route }) {
    const { city, countryName, destination } = route.params;

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [adults, setAdults] = useState('');
    const [children, setChildren] = useState('');
    const [infants, setInfants] = useState('');

    const [step, setStep] = useState(0); 

    const adultsRef = useRef(null);
    const childrenRef = useRef(null);
    const infantsRef = useRef(null);

    const onChangeStart = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        setShowStartPicker(false);
        setStartDate(currentDate);
    };

    const onChangeEnd = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        setShowEndPicker(false);
        setEndDate(currentDate);
    };

    const handleNext = () => {
        if (step === 0) {
            setShowStartPicker(true);
        } else if (step === 1) {
            setShowEndPicker(true);
        } 

        if (step < 2) {
            setStep(prev => prev + 1);
        } else {
                Keyboard.dismiss();
                navigation.navigate('SearchByCarRoutes', {
                    apiKey,
                    city,
                    destination,
                    startDate: startDate.toISOString().split('T')[0],  
                    endDate: endDate.toISOString().split('T')[0], 
                });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Travel Details</Text>
            </View>

            <View style={styles.bubble}>
                <Text style={styles.bubbleText}>
                    Choose your dates of travel
                </Text>
            </View>

            <View style={[styles.bubble, { height: 50, width: 100 }]}>
                <Text style={styles.bubbleText}>
                    Dates
                </Text>
            </View>

            {/* Start Date Field */}
            <View style={[styles.bubble, { height: 120, width: 300 }]}>
                <Text style={styles.bubbleText}>Journey Start Date:</Text>
                <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>{startDate.toDateString()}</Text>
                </TouchableOpacity>

                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={onChangeStart}
                        minimumDate={new Date()}
                    />
                )}
            </View>

            {/* End Date Field */}
            <View style={[styles.bubble, { height: 120, width: 300 }]}>
                <Text style={styles.bubbleText}>Journey End Date:</Text>
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>{endDate.toDateString()}</Text>
                </TouchableOpacity>

                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={onChangeEnd}
                        minimumDate={startDate}
                    />
                )}
            </View>

            {/* Floating Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginLeft: 10,
        flex: 1,
        flexDirection: "column",
        gap: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "Vilonti-Bold",
        color: "#010F29",
    },
    bubble: {
        width: 294,
        backgroundColor: "#010F29",
        borderRadius: 30,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        marginVertical: 5,
    },
    bubbleText: {
        fontFamily: "Vilonti-Bold",
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 5,
    },
    dateButton: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    dateButtonText: {
        color: "#010F29",
        fontFamily: "Vilonti-Bold",
    },
    input: {
        backgroundColor: "#ffffff",
        width: 200,
        height: 40,
        borderRadius: 10,
        marginTop: 8,
        paddingHorizontal: 10,
        fontFamily: "Vilonti-Bold",
        color: "#010F29",
        textAlign: "center",
    },
    ageNote: {
        color: "#FFFFFF",
        fontFamily: "Vilonti-Bold",
        textAlign: "center",
        fontSize: 14,
        lineHeight: 22,
    },
    nextButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#010F29',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
});
