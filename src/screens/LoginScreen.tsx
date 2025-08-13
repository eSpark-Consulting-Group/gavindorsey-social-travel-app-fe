import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  BackHandler,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';

import { RootStackNavigationProp } from '../navigation/navigation';
import {
  ArrowBack,
  CheckIcon,
  Google,
  PasswordHide,
  PasswordShow,
} from '../assets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { LoginSuccessPopup } from './LoginSuccessPopup';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login, signup, socialLogin } from '../services/authService';
import { setIsLoggedIn, setUser } from '../redux/slices/authSlice';
import CustomInput from '../components/CustomInput';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp<'Login'>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (text && text.includes('@')) {
        delete newErrors.email;
      }
      return newErrors;
    });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (text) {
        delete newErrors.password;
      }
      return newErrors;
    });
  };

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Can't be empty";
    } else if (!email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await login({
        email: email,
        password: password,
      });
      console.log('res', res);

      if (res?.success) {
        setLoading(false);
        console.log('res', res);
        dispatch(setUser(res.data));
        await AsyncStorage.setItem('accessToken', res?.data?.token);
        const user = {
          userID: res?.data?.user_id,
          firstName: res?.data?.first_name,
          lastName: res?.data?.last_name,
          email: res?.data?.email,
          lastLoginAt: res?.data?.lastLoginAt,
          isSocialLogin: res?.data?.isSocialLogin,
          profile: null,
        };
        if (rememberMe) {
          await AsyncStorage.setItem('isUserLoggedIn', 'true');
          dispatch(setIsLoggedIn(true));
        }
        dispatch(setUser(user));
        await AsyncStorage.setItem('userDetails', JSON.stringify(user));
        setShowSuccessPopup(true);
      } else {
        setLoading(false);
        console.error('Login failed:', res?.message);
        ToastAndroid.show(
          res?.message || 'Login failed. Please try again.',
          ToastAndroid.SHORT,
        );
      }
    } catch (err) {
      setLoading(false);
      console.log('Login error:', err);
      ToastAndroid.show('Login failed. Please try again.', ToastAndroid.SHORT);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessPopup(false);
    navigation.replace('Home');
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('Google Sign In Success:', JSON.stringify(response));

      if (response.data != null) {
        const res = await socialLogin({
          email: response.data?.user.email || '',
          firstName: response.data?.user.givenName || '',
          lastName: response.data?.user.familyName || '',
        });
        if (res?.success) {
          setLoading(false);
          console.log('res', res);
          dispatch(setUser(res.data));
          await AsyncStorage.setItem('accessToken', res?.data?.token);
          const user = {
            userID: res?.data?.user_id,
            firstName: res?.data?.first_name,
            lastName: res?.data?.last_name,
            email: res?.data?.email,
            lastLoginAt: res?.data?.lastLoginAt,
            isSocialLogin: res?.data?.isSocialLogin,
            profile: null,
          };
          if (rememberMe) {
            await AsyncStorage.setItem('isUserLoggedIn', 'true');
            dispatch(setIsLoggedIn(true));
          }
          dispatch(setUser(user));
          await AsyncStorage.setItem('userDetails', JSON.stringify(user));
          setShowSuccessPopup(true);
        } else {
          setLoading(false);
          ToastAndroid.show('Login failed!', ToastAndroid.SHORT);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        console.error('Detailed error:', error.message);
        ToastAndroid.show(
          `Google sign-in error: ${error.message}`,
          ToastAndroid.SHORT,
        );
      } else {
        console.error('Unknown error occurred');
        ToastAndroid.show(
          'An unknown error occurred during Google sign-in',
          ToastAndroid.SHORT,
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => BackHandler.exitApp()}
          >
            <ArrowBack width={35} height={40} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="Email address"
            placeholder="Enter your email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            hasError={!!errors.email}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={true}
            error={errors.password}
            hasError={!!errors.password}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <CheckIcon width={10} />}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" />
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.primaryButtonText}>Continue with Email</Text>
            </TouchableOpacity>
          )}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or Continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
          >
            <Google />
            <Text style={styles.socialButtonText}> Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <LoginSuccessPopup
        visible={showSuccessPopup}
        onContinue={handleSuccessContinue}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    marginEnd: 70,
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#f9f9f9',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7CB342',
    borderColor: '#7CB342',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#85CC16',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#7CB342',
    fontWeight: '600',
  },
});
