import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/RootNavigation';

const api = axios.create({
  baseURL: 'https://gavindorsey-social-travel-app-be.stg.esparkconsultants.com/api',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      await AsyncStorage.removeItem('accessToken');

      navigate('Login');
    }

    return Promise.reject(error);
  }
);

export default api;
