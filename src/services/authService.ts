import api from './api';

interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
export interface SocialLoginPayload {
  email: string;
  first_name: string;
  last_name: string;
}

export const login = async (payload: LoginPayload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const signup = async (payload: SignupPayload) => {
  const response = await api.post('/auth/signup', payload);
  return response.data;
};
export const socialLogin = async (payload: SocialLoginPayload) => {
          console.log('Social Login Request:', payload);
  const response = await api.post('/auth/social-login', payload);
  return response.data;
};