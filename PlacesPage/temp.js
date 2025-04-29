// PlacesPage.js
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text, View } from 'react-native';

const PlacesPage = () => {
  const navigation = useNavigation();

  const handleCitySelect = (city) => {
    navigation.navigate('Activities', { city: city }); // Navigate to ActivitiesPage and pass the city
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handleCitySelect('Lahore')}>
        <Text>Lahore</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleCitySelect('Paris')}>
        <Text>Paris</Text>
      </TouchableOpacity>
      {/* ... other city selections ... */}
    </View>
  );
};

export default PlacesPage;