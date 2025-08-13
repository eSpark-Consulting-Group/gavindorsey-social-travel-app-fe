import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { RootStackNavigationProp } from '../navigation/navigation';
import { ArrowBack, PasswordHide, PasswordShow } from '../assets';
import { setUser } from '../redux/slices/authSlice';
import { signup } from '../services/authService';
import CustomInput from '../components/CustomInput';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp<'Signup'>>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState<{ firstName?:string, lastName?:string, email?: string; password?: string }>(
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
  const handleFirstNameChange = (text: string) => {
    setPassword(text);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (text) {
        delete newErrors.firstName;
      }
      return newErrors;
    });
  };
  const handleLastNameChange = (text: string) => {
    setPassword(text);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (text) {
        delete newErrors.lastName;
      }
      return newErrors;
    });
  };

  const handleSignup = async () => {
    setErrors({});

    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName) {
      newErrors.firstName = "Can't be empty";
    }
    if (!lastName) {
      newErrors.lastName = "Can't be empty";
    }

    if (!email) {
      newErrors.email = "Can't be empty";
    } else if (!email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!password) {
      newErrors.password = 'At least 8 characters';
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'At least 8 characters';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

     if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      console.log('res', res);

      if (res?.success) {
        setLoading(false);
        console.log('res', res);
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
        dispatch(setUser(user));
        await AsyncStorage.setItem('userDetails', JSON.stringify(user));
        ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);
        navigation.replace('Home');
      } else {
        setLoading(false);
        ToastAndroid.show(
          'Signup failed. Please try again.',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      setLoading(false);
      ToastAndroid.show('Signup failed. Please try again.', ToastAndroid.SHORT);
      console.error('Signup error:', error);
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
            onPress={() => navigation.replace('Login')}
          >
            <ArrowBack width={35} height={40} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.signupTitleContainer}>
            <Text style={styles.signupTitle}>Complete your account</Text>
            <Text style={styles.signupSubtitle}>
              Lorem ipsum sit amet consectetur adipisc
            </Text>
          </View>

            <CustomInput
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={handleFirstNameChange}
              keyboardType="name-phone-pad"
              autoCapitalize="none"
              error={errors.firstName}
              hasError={!!errors.firstName}
            />

            <CustomInput
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={handleLastNameChange}
              keyboardType="name-phone-pad"
              autoCapitalize="none"
              error={errors.lastName}
              hasError={!!errors.lastName}
            />

            <CustomInput
              label="Email address"
              placeholder="Enter Email address"
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
              <CustomInput
                label="Confirm Password"
                placeholder="Enter Confirm Password"
                value={password}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                error={errors.password}
                hasError={!!errors.password}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#4A90E2" size="large" />
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSignup}
              >
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 10,
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
  signupTitleContainer: {
    marginBottom: 30,
  },
  signupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  signupSubtitle: {
    fontSize: 14,
    color: '#666',
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
    color: '#000000',
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
  forgotPassword: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#7CB342',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
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
