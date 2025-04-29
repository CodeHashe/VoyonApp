import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

// Dummy data for activities (replace with your actual data source)
const activitiesData = {
  Lahore: [
    { id: '1', name: 'Visit Badshahi Mosque', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Badshahi_Mosque_Lahore_Pakistan.jpg/800px-Badshahi_Mosque_Lahore_Pakistan.jpg' },
    { id: '2', name: 'Explore Lahore Fort', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Lahore_Fort_Alamgiri_Gate_and_Hazuri_Bagh.jpg/800px-Lahore_Fort_Alamgiri_Gate_and_Hazuri_Bagh.jpg' },
    { id: '3', name: 'Wander in Shalimar Bagh', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Shalimar_Bagh_Lahore_Pakistan.jpg/800px-Shalimar_Bagh_Lahore_Pakistan.jpg' },
    { id: '4', name: 'Food Street Tour', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Food_Street_Lahore_Pakistan.jpg/800px-Food_Street_Lahore_Pakistan.jpg' },
  ],
  Paris: [
    { id: '5', name: 'Visit Eiffel Tower', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_Passy.jpg/800px-La_Tour_Eiffel_vue_de_Passy.jpg' },
    { id: '6', name: 'Explore Louvre Museum', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/The_Louvre_Museum_in_Paris.jpg/800px-The_Louvre_Museum_in_Paris.jpg' },
    { id: '7', name: 'Walk along the Seine', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Seine_at_Paris_France.jpg/800px-Seine_at_Paris_France.jpg' },
  ],
  Skardu: [
    { id: '8', name: 'Visit Shangrila Resort', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Shangrila_Resort_Skardu.jpg/800px-Shangrila_Resort_Skardu.jpg' },
    { id: '9', name: 'Explore Deosai Plains', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Deosai_National_Park_View.jpg/800px-Deosai_National_Park_View.jpg' },
    { id: '10', name: 'Hike to Katpana Desert', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Katpana_Cold_Desert_Skardu.jpg/800px-Katpana_Cold_Desert_Skardu.jpg' },
  ],
  'New York': [
    { id: '11', name: 'Visit Statue of Liberty', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Statue_of_Liberty_from_Below.jpg/800px-Statue_of_Liberty_from_Below.jpg' },
    { id: '12', name: 'Explore Central Park', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Central_Park_NYC.jpg/800px-Central_Park_NYC.jpg' },
    { id: '13', name: 'See Times Square', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Times_Square_New_York_City_2010.jpg/800px-Times_Square_New_York_City_2010.jpg' },
  ],
  Shizuoka: [
    { id: '14', name: 'View Mount Fuji', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Miho_no_Matsubara_and_Mount_Fuji.jpg/800px-Miho_no_Matsubara_and_Mount_Fuji.jpg' },
    { id: '15', name: 'Visit Kunozan Toshogu Shrine', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Kuno-zan_Toshogu_Shrine_Main_Hall.jpg/800px-Kuno-zan_Toshogu_Shrine_Main_Hall.jpg' },
    { id: '16', name: 'Explore Miho no Matsubara', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Miho_no_Matsubara_and_Mount_Fuji.jpg/800px-Miho_no_Matsubara_and_Mount_Fuji.jpg' },
  ],
  Madrid: [
    { id: '17', name: 'Visit Royal Palace of Madrid', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Palacio_Real_de_Madrid_01.jpg/800px-Palacio_Real_de_Madrid_01.jpg' },
    { id: '18', name: 'Explore El Retiro Park', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Parque_del_Retiro_Madrid_Spain.jpg/800px-Parque_del_Retiro_Madrid_Spain.jpg' },
    { id: '19', name: 'See Plaza Mayor', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Plaza_Mayor_Madrid_1.jpg/800px-Plaza_Mayor_Madrid_1.jpg' },
  ],
  Dubai: [
    { id: '20', name: 'Sky Diving', imageUrl: 'https://cdn.pixabay.com/photo/2014/04/02/10/44/skydiving-304956_1280.jpg' },
    { id: '21', name: 'Water Sports', imageUrl: 'https://cdn.pixabay.com/photo/2016/11/19/16/01/athlete-1840072_1280.jpg' },
    { id: '22', name: 'Aquarium Safari', imageUrl: 'https://cdn.pixabay.com/photo/2010/12/13/10/22/dubai-3963_1280.jpg' },
    { id: '23', name: 'Hot Air Balloon Ride', imageUrl: 'https://cdn.pixabay.com/photo/2015/11/12/16/37/hot-air-balloon-1040422_1280.jpg' },
    { id: '24', name: 'Desert Dune Bashing', imageUrl: 'https://cdn.pixabay.com/photo/2017/02/27/17/04/dune-2104309_1280.jpg' },
    { id: '25', name: 'Visiting Burj Khalifa', imageUrl: 'https://cdn.pixabay.com/photo/2012/08/10/08/27/dubai-54525_1280.jpg' },
    { id: '26', name: 'Skiing', imageUrl: 'https://cdn.pixabay.com/photo/2017/01/07/20/51/skiing-1961557_1280.jpg' },
  ],
};

const ActivitiesPage = () => {
  const route = useRoute();
  const { city } = route.params;
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (activitiesData[city]) {
      setActivities(activitiesData[city]);
    } else {
      setActivities([]);
    }
  }, [city]);

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.activityImage} />
      <Text style={styles.activityName}>{item.name}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteActivity(item.id)}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDeleteActivity = (id) => {
    setActivities(prevActivities => prevActivities.filter(activity => activity.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.voyonLogo}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voyon</Text>
        </View>
        <Text style={styles.title}>{`Your Activities in ${city}`}</Text>
      </View>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        style={styles.activitiesList}
      />
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navText}>Routes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>...</Text>
          <Text style={styles.navText}>Activities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navIcon}>📍</Text>
          <Text style={styles.navText}>Places</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  voyonLogo: {
    backgroundColor: '#384A61',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  activitiesList: {
    paddingHorizontal: 20,
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  activityName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    borderRadius: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -20
  },
  deleteText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#1A2431',
    borderTopWidth: 1,
    borderTopColor: '#384A61',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    color: '#9AA5B1',
    fontSize: 24,
    marginBottom: 5,
  },
  navText: {
    color: '#9AA5B1',
    fontSize: 12,
  },
  activeNavItem: {},
});

export default ActivitiesPage;
