import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

export type RootStackNavigationProp<
  T extends keyof RootStackParamList = 'Login',
> = NativeStackNavigationProp<RootStackParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList = 'Login'> =
  RouteProp<RootStackParamList, T>;


  export type HomeStackParamList = {
  Home: undefined;
  Article: { article: Article };
};

export type HomeStackNavigationProp<
  T extends keyof HomeStackParamList = 'Home',
> = NativeStackNavigationProp<HomeStackParamList, T>;

export type HomeStackRouteProp<T extends keyof HomeStackParamList = 'Home'> =
  RouteProp<HomeStackParamList, T>;