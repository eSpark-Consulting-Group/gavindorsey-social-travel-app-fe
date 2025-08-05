import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import {
  HomeIcon,
  MyTripsIcon,
  NewTripIcon,
  BottomFavIcon,
  ProfileIcon,
} from '../assets';

const Tab = createBottomTabNavigator();

function DummyScreen({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{label}</Text>
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          
          switch (route.name) {
            case 'Home':
              IconComponent = HomeIcon;
              break;
            case 'MyTrips':
              IconComponent = MyTripsIcon;
              break;
            case 'NewTrip':
              IconComponent = NewTripIcon;
              break;
            case 'Favourite':
              IconComponent = BottomFavIcon;
              break;
            case 'Profile':
              IconComponent = ProfileIcon;
              break;
            default:
              IconComponent = HomeIcon;
          }

          return <IconComponent width={size} height={size} />;
        },
        tabBarActiveTintColor: '#A3D43F',
        tabBarInactiveTintColor: '#A1A1A1',
        tabBarStyle: { 
          height: 60, 
          paddingBottom: 5, 
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyTrips" children={() => <DummyScreen label="My Trips" />} />
      <Tab.Screen name="NewTrip" children={() => <DummyScreen label="New Trip" />} />
      <Tab.Screen name="Favourite" children={() => <DummyScreen label="Favourite" />} />
      <Tab.Screen name="Profile" children={() => <DummyScreen label="Profile" />} />
    </Tab.Navigator>
  );
} 