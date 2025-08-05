import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';

import {SignupScreen} from '../screens/SignupScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {RootStackParamList } from './navigation';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={ 'Login'}
          screenOptions={{
            headerShown: false,
          }}
        >
            <Stack.Group>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
