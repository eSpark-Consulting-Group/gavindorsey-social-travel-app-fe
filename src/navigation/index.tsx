import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SignupScreen } from '../screens/SignupScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RootStackParamList } from './navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateTrip } from '../screens/CreateTrip';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '../redux/slices/authSlice';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    checkToken();
    GoogleSignin.configure({
      webClientId:
        '669233305873-77c212ldgvusnpvntp96coga6jcogjrj.apps.googleusercontent.com',
    });
  }, []);

  const checkToken = async () => {
    try {
      const isUserLoggedIn = await AsyncStorage.getItem('isUserLoggedIn');
      const token = await AsyncStorage.getItem('accessToken');
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (token && userDetails) {
        let user = null;
        try {
          user = JSON.parse(userDetails);
        } catch (e) {
          user = null;
        }
        dispatch(
          setUser({
            token,
            user,
          }),
        );
      }
      setInitialRoute(isUserLoggedIn ? 'Home' : 'Login');
    } catch (e) {
      setInitialRoute('Login');
    } finally {
      setCheckingAuth(false);
    }
  };

  if (checkingAuth || !initialRoute) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
        }}
      >
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={'Home'}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateTrip" component={CreateTrip} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
