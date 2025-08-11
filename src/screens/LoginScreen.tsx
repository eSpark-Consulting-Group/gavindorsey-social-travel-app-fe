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
} from 'react-native';

import { RootStackNavigationProp } from '../navigation/navigation';
import { ArrowBack, CheckIcon, PasswordHide, PasswordShow } from '../assets';
import { LoginSuccessPopup } from './LoginSuccessPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp<'Login'>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const userStr = await AsyncStorage.getItem('isUserLoggedIn');
      if (userStr === 'true') {
        navigation.replace('Home');
      }
    };
    checkLoggedIn();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const usersStr = await AsyncStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      const user = users.find(
        (u: any) => u.email === email && u.password === password,
      );
      if (!user) {
        Alert.alert('Error', 'Invalid email or password');
        return;
      }
      if (rememberMe) {
        await AsyncStorage.setItem('isUserLoggedIn', 'true');
      }
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
      setShowSuccessPopup(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessPopup(false);
    navigation.replace('Home');
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("Google Sign In Success:", JSON.stringify(response));

      if (response.data!=null) {
              setShowSuccessPopup(true);
      }
  //  const usersStr = await AsyncStorage.getItem('users');
  //     const users = usersStr ? JSON.parse(usersStr) : [];
  //     const user = users.find(
  //       (u: any) => u.email === email && u.password === password,
  //     );
  //     if (!user) {
  //       Alert.alert('Error', 'Invalid email or password');
  //       return;
  //     }
  //     if (rememberMe) {
  //       await AsyncStorage.setItem('isUserLoggedIn', 'true');
  //     }
  //     await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));

        // const userResp = await handleSignUpUser(
        //   {
        //     firstName: response?.data?.user.givenName || "",
        //     lastName: response.data?.user.familyName || "",
        //     email: response.data?.user.email || "",
        //     role: "user",
        //     socialId: response.data?.user.id || "",
        //     profileImage: response.data?.user.photo || "",
        //   },
        //   true
        // );
        // if (userResp.status && userResp.userInfo) {
        //   api.setHeader("Authorization", `Bearer ${userResp.userInfo.token}`);
        //   fetchAllUserProfileData(userResp.userInfo, true);
        // } else {
        //   setLoading(false);
        //   showToast("Sign up failed", "error");
        // }
    } catch (error) {
      // setLoading(false);
      if (error instanceof Error) {
        console.error("Detailed error:", error.message);
        ToastAndroid.show(`Google sign-in error: ${error.message}`, ToastAndroid.SHORT);
      } else {
        console.error("Unknown error occurred");
        ToastAndroid.show("An unknown error occurred during Google sign-in", ToastAndroid.SHORT);
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
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your email password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? <PasswordHide /> : <PasswordShow />}
              </TouchableOpacity>
            </View>
          </View>

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

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Continue with Email</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or Continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.socialButtonText}>🌐 Continue with Google</Text>
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
