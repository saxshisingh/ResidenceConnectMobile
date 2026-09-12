import React, {
  useEffect,
  useState,
} from 'react';

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

import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
} from 'react-native-svg';

import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';

import {
  useNavigation,
} from '@react-navigation/native';

import styles from './LoginScreen.styles';

import Config from 'react-native-config';

import {
  useAppSelector,
} from '../../../../redux/hooks';

import ThemedLoader from '../../../../components/ThemedLoader';

import {
  useI18n,
} from '../../../../i18n';

import {
  useAuth,
} from '../../context/AuthProvider';

import {
  isEmail,
  normalizeEmail,
  trimValue,
} from '../../../../shared/validation/formValidation';

export default function LoginScreen() {
  const navigation =
    useNavigation<any>();

  const {
    login,
  } = useAuth();

  const {
    loading,
    error,
  } = useAppSelector(
    state => state.auth,
  );

  const [secure, setSecure] =
    useState(true);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const {t} =
    useI18n();

  const {width} =
    useWindowDimensions();

  const contentWidth =
    Math.min(
      width - 32,
      520,
    );

  /*
   * Google Sign-In configuration.
   *
   * This remains unchanged from your
   * existing implementation.
   */
  const webClientId =
    Config.GOOGLE_WEB_CLIENT_ID;

  console.log(
    'GOOGLE_WEB_CLIENT_ID:',
    webClientId,
  );

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        webClientId ||
        '779719087348-4osv1tj9qaojbdqaalees4qnjbi2cdsg.apps.googleusercontent.com',

      offlineAccess: true,
    });
  }, [webClientId]);

  /*
   * We only restore the Remember Me flag.
   *
   * Do NOT restore the password from
   * AsyncStorage.
   *
   * The authentication session is restored
   * by AuthProvider using access/refresh
   * tokens.
   */
  useEffect(() => {
    const loadRememberMe =
      async () => {
        try {
          /*
           * Remember Me is no longer used
           * to restore the user's password.
           *
           * The AuthProvider restores the
           * authenticated session using
           * tokens.
           */
          setRememberMe(false);
        } catch (error) {
          console.warn(
            'Unable to load Remember Me:',
            error,
          );
        }
      };

    loadRememberMe();
  }, []);

  /*
   * Show authentication errors.
   */
  useEffect(() => {
    if (!error) {
      return;
    }

    const message =
      error === 'WRONG_PASSWORD'
        ? t(
            'auth.mobile.wrongPassword',
            'Wrong password. Please try again.',
          )
        : error ===
            'INVALID_CREDENTIALS'
          ? t(
              'auth.mobile.invalidCredentials',
              'Invalid credentials',
            )
          : error ===
              'SESSION_EXPIRED'
            ? t(
                'auth.mobile.sessionExpired',
                'Your session expired. Please log in again.',
              )
            : error ||
              t(
                'auth.mobile.loginFailedMessage',
                'Unable to log in right now. Please try again.',
              );

    Alert.alert(
      t(
        'auth.mobile.loginFailed',
        'Login Failed',
      ),
      message,
    );
  }, [
    error,
    t,
  ]);

  /*
   * LOGIN
   */
  const handleLogin =
    async () => {
      const normalizedEmail =
        trimValue(email).toLowerCase();

      if (!normalizedEmail) {
        Alert.alert(
          t(
            'common.error',
            'Error',
          ),
          t(
            'auth.mobile.enterEmail',
            'Please enter your email',
          ),
        );

        return;
      }

      if (
        !isEmail(
          normalizedEmail,
        )
      ) {
        Alert.alert(
          t(
            'common.error',
            'Error',
          ),
          t(
            'auth.mobile.enterValidEmail',
            'Please enter a valid email address',
          ),
        );

        return;
      }

      if (
        !trimValue(password)
      ) {
        Alert.alert(
          t(
            'common.error',
            'Error',
          ),
          t(
            'auth.mobile.enterPassword',
            'Please enter your password',
          ),
        );

        return;
      }

      try {
        /*
         * AuthProvider handles:
         *
         * 1. API login
         * 2. Token storage
         * 3. User profile loading
         * 4. Redux synchronization
         * 5. Authenticated state
         */
        await login(
          normalizedEmail,
          password,
          rememberMe,
        );

        /*
         * Navigation will normally be handled
         * by AppNavigator based on auth status.
         *
         * If your current navigation structure
         * still requires manual navigation,
         * this can remain.
         */
      } catch (error: any) {
        const message =
          error?.message ||
          t(
            'auth.mobile.loginFailedMessage',
            'Unable to log in right now. Please try again.',
          );

        Alert.alert(
          t(
            'auth.mobile.loginFailed',
            'Login Failed',
          ),
          message,
        );
      }
    };

  /*
   * FORGOT PASSWORD
   */
  const handleForgotPassword =
    () => {
      const normalizedEmail =
        trimValue(email)
          ? normalizeEmail(email)
          : '';

      navigation.navigate(
        'ForgotPassword',
        {
          email:
            normalizedEmail,
        },
      );
    };

  return (
    <View
      style={
        styles.container
      }>
      <View
        pointerEvents="none"
        style={
          styles.decorLayer
        }>
        <View
          style={
            styles.topCircle1
          }
        />

        <View
          style={
            styles.topCircle2
          }
        />

        <View
          style={
            styles.topCircle3
          }
        />

        <View
          style={
            styles.bottomBlob1
          }>
          <Svg
            width={320}
            height={260}
            viewBox="0 0 320 260">
            <Ellipse
              cx="240"
              cy="200"
              rx="180"
              ry="150"
              fill="#F37E00"
              fillOpacity={0.5}
            />
          </Svg>
        </View>

        <View
          style={
            styles.bottomBlob2
          }>
          <Svg
            width={300}
            height={240}
            viewBox="0 0 300 240">
            <Ellipse
              cx="220"
              cy="180"
              rx="180"
              ry="150"
              fill="#F37E00"
              fillOpacity={0.7}
            />
          </Svg>
        </View>
      </View>

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.content,
              {
                width:
                  contentWidth,

                alignSelf:
                  'center',
              },
            ]}>
            {/* EMAIL */}

            <Text
              style={
                styles.label
              }>
              {t(
                'common.email',
                'Email',
              )}
            </Text>

            <TextInput
              style={
                styles.input
              }
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={
                setEmail
              }
              placeholder={t(
                'auth.mobile.enterEmailPlaceholder',
                'Enter your email',
              )}
              editable={
                !loading
              }
            />

            {/* PASSWORD */}

            <Text
              style={
                styles.label
              }>
              {t(
                'common.password',
                'Password',
              )}
            </Text>

            <View
              style={
                styles.passwordBox
              }>
              <TextInput
                secureTextEntry={
                  secure
                }
                style={
                  styles.passwordInput
                }
                value={
                  password
                }
                onChangeText={
                  setPassword
                }
                placeholder={t(
                  'auth.mobile.enterPasswordPlaceholder',
                  'Enter your password',
                )}
                editable={
                  !loading
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setSecure(
                    !secure,
                  )
                }>
                <Svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={
                    styles.eyeIcon
                  }>
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

            {/* REMEMBER ME */}

            <View
              style={
                styles.row
              }>
              <TouchableOpacity
                style={{
                  flexDirection:
                    'row',

                  alignItems:
                    'center',
                }}
                onPress={() =>
                  setRememberMe(
                    !rememberMe,
                  )
                }
                disabled={
                  loading
                }>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  style={{
                    marginRight:
                      8,
                  }}>
                  <Rect
                    x={1}
                    y={1}
                    width={18}
                    height={18}
                    rx={3}
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    fill={
                      rememberMe
                        ? '#F37E00'
                        : 'transparent'
                    }
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

                <Text
                  style={
                    styles.remember
                  }>
                  {t(
                    'auth.mobile.rememberMe',
                    'Remember me',
                  )}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  handleForgotPassword
                }
                disabled={
                  loading
                }>
                <Text
                  style={
                    styles.forgot
                  }>
                  {t(
                    'auth.mobile.forgotPassword',
                    'Forgot Password?',
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOGIN */}

            <TouchableOpacity
              style={[
                styles.loginBtn,

                loading && {
                  opacity: 0.6,
                },
              ]}
              onPress={
                handleLogin
              }
              disabled={
                loading
              }>
              {loading ? (
                <ThemedLoader
                  tone="onPrimary"
                />
              ) : (
                <Text
                  style={
                    styles.loginText
                  }>
                  {t(
                    'common.login',
                    'Login',
                  )}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}