import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Config from 'react-native-config';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//  import { loginUser } from '../../../services/authService';
import styles from './LoginScreen.styles';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { callAuthMeAndLog, login } from '../../state/authSlice';
import { AUTH_STORAGE_KEYS } from '../../services/authService';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useI18n } from '../../../../i18n';
import {
  isEmail,
  trimValue,
} from '../../../../shared/validation/formValidation';

// type RootStackParamList = {
//   ConfirmPassword: undefined;
//   Login: undefined;
// };

export default function LoginScreen() {
 const navigation = useNavigation<any>();

  const dispatch = useAppDispatch();
  const { loading, error, token, isFirstLogin } = useAppSelector(
    state => state.auth
  );

  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);


console.log('LOGIN SCREEN TOKEN:', token);

useEffect(() => {
  console.log('useEffect fired, token =', token);

  if (token) {
    console.log('Dispatching auth/me');

    dispatch(
      callAuthMeAndLog()
    );
  }
}, [dispatch, token]);


 
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true, 
      
    });
  }, []);

  useEffect(() => {
    const loadRememberedCredentials = async () => {
      const rememberMeValue = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.rememberMe);
      const shouldRemember = rememberMeValue === 'true';

      setRememberMe(shouldRemember);

      if (!shouldRemember) {
        return;
      }

      const [[, savedEmail], [, savedPassword]] = await AsyncStorage.multiGet([
        AUTH_STORAGE_KEYS.username,
        AUTH_STORAGE_KEYS.password,
      ]);

      if (savedEmail) {
        setEmail(savedEmail);
      }

      if (savedPassword) {
        setPassword(savedPassword);
      }
    };

    loadRememberedCredentials();
  }, []);

 
  useEffect(() => {
    const routeAfterLogin = async () => {
      if (!token) return;

      if (isFirstLogin) {
        navigation.replace('ConfirmPassword');
        return;
      }

      navigation.replace('MainTabs');
    };

    routeAfterLogin();
  }, [token, isFirstLogin, navigation]);


  useEffect(() => {
    if (error) {
      const message =
        error === 'WRONG_PASSWORD'
          ? t('auth.mobile.wrongPassword', 'Wrong password. Please try again.')
          : error === 'INVALID_CREDENTIALS'
            ? t('auth.mobile.invalidCredentials', 'Invalid credentials')
          : error === 'SESSION_EXPIRED'
            ? t('auth.mobile.sessionExpired', 'Your session expired. Please log in again.')
            : error || t('auth.mobile.loginFailedMessage', 'Unable to log in right now. Please try again.');

      Alert.alert(
        t('auth.mobile.loginFailed', 'Login Failed'),
        message,
      );
    }
  }, [error, t]);


const handleLogin = async () => {
  const normalizedEmail = trimValue(email).toLowerCase();

  if (!normalizedEmail) {
    Alert.alert(t('common.error', 'Error'), t('auth.mobile.enterEmail', 'Please enter your email'));
    return;
  }

  if (!isEmail(normalizedEmail)) {
    Alert.alert(
      t('common.error', 'Error'),
      t('auth.mobile.enterValidEmail', 'Please enter a valid email address'),
    );
    return;
  }

  if (!trimValue(password)) {
    Alert.alert(t('common.error', 'Error'), t('auth.mobile.enterPassword', 'Please enter your password'));
    return;
  }

  try {
    await dispatch(
      login({ username: normalizedEmail, password, rememberMe })
    ).unwrap();
  } catch {
    // The auth error state shows the user-facing alert.
  }
};

const handleForgotPassword = async () => {
  const storedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);
  const normalizedEmail = trimValue(email).toLowerCase();

  if (token || storedToken) {
    navigation.navigate('ConfirmPassword');
    return;
  }

  Alert.alert(
    t('common.oops', 'Oops'),
    normalizedEmail
      ? t(
          'auth.mobile.forgotPasswordNeedsSession',
          'Password reset from this app needs an active session. Please contact support or sign in on a device where you are already logged in.',
        )
      : t(
          'auth.mobile.forgotPasswordEnterEmail',
          'Enter your email first, then continue with your password reset support flow.',
        ),
  );
};


 
  // const handleGoogleSignIn = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     console.log('Google user:', userInfo);
  //   } catch (error: any) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       Alert.alert(t('common.cancel', 'Cancelled'), t('auth.mobile.signInCancelled', 'Sign in was cancelled'));
  //     } else {
  //       Alert.alert(t('common.error', 'Error'), error.message);
  //     }
  //   }
  // };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.decorLayer}>
        <View style={styles.topCircle1} />
        <View style={styles.topCircle2} />
        <View style={styles.topCircle3} />

        <View style={styles.bottomBlob1}>
          <Svg width={320} height={260} viewBox="0 0 320 260">
            <Ellipse cx="240" cy="200" rx="180" ry="150" fill="#F37E00" fillOpacity={0.5} />
          </Svg>
        </View>

        <View style={styles.bottomBlob2}>
          <Svg width={300} height={240} viewBox="0 0 300 240">
            <Ellipse cx="220" cy="180" rx="180" ry="150" fill="#F37E00" fillOpacity={0.7} />
          </Svg>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
       
        <Text style={styles.label}>{t('common.email', 'Email')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.mobile.enterEmailPlaceholder', 'Enter your email')}
          editable={!loading}
        />

        <Text style={styles.label}>{t('common.password', 'Password')}</Text>
        <View style={styles.passwordBox}>
          <TextInput
            secureTextEntry={secure}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.mobile.enterPasswordPlaceholder', 'Enter your password')}
            editable={!loading}
          />

          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.eyeIcon}>
              {secure ? (
                <>
                  <Path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.498 18.498 0 01-2.16 3.19"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M14.12 14.12a3 3 0 11-4.24-4.24"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M1 1l22 22"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <Path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle
                    cx={12}
                    cy={12}
                    r={3}
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </Svg>
          </TouchableOpacity>
        </View>

        
        <View style={styles.row}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" style={{ marginRight: 8 }}>
              <Rect
                x={1}
                y={1}
                width={18}
                height={18}
                rx={3}
                stroke="#9CA3AF"
                strokeWidth={2}
                fill={rememberMe ? "#F37E00" : "transparent"}
              />
              {rememberMe && (
                <Path
                  d="M5 10l3 3 7-7"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
            <Text style={styles.remember}>{t('auth.mobile.rememberMe', 'Remember me')}</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={styles.forgot}>{t('auth.mobile.forgotPassword', 'Forgot Password?')}</Text>
          </TouchableOpacity> */}
        </View>

        
        <TouchableOpacity 
          style={[styles.loginBtn, loading && { opacity: 0.6 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ThemedLoader tone="onPrimary" />
          ) : (
            <Text style={styles.loginText}>{t('common.login', 'Login')}</Text>
          )}
        </TouchableOpacity>

       
      {/* <Text style={styles.orText}>{t('common.or', 'or')}</Text> */}

        
        {/* <TouchableOpacity 
          style={styles.socialBtn} 
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.socialIcon}>
            <Path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <Path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <Path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <Path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </Svg>
          <Text style={styles.socialText}>{t('auth.mobile.continueGoogle', 'Continue with Google')}</Text>
        </TouchableOpacity>

        
        <TouchableOpacity style={styles.socialBtn} disabled={loading}>
          <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.socialIcon}>
            <Circle cx={12} cy={12} r={11} fill="#1877F2" />
            <Path
              d="M15.5 12.5h-2.5v8h-3v-8H8v-2.5h2v-1.5c0-2.5 1-4 4-4h2.5v2.5H15c-.5 0-1 .5-1 1v2h2.5l-.5 2.5z"
              fill="#FFFFFF"
            />
          </Svg>
          <Text style={styles.socialText}>{t('auth.mobile.continueFacebook', 'Continue with Facebook')}</Text>
        </TouchableOpacity> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
  );
}

