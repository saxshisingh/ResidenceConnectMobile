/**
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {
  getMessaging,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {AppNavigator} from './src/navigation';
import {store} from './src/redux/store';

import AuthWatcher from './src/app/AuthWatcher';

import AppAlertHost from './src/components/AppAlert/AppAlertHost';
import {
  installAppAlertPatch,
} from './src/components/AppAlert/appAlert';

import {
  I18nProvider,
  installI18nRuntimePatch,
} from './src/i18n';

import {
  ThemeProvider,
  useAppTheme,
} from './src/theme/ThemeProvider';

import {
  AuthProvider,
} from './src/features/auth/context/AuthProvider';

import ForegroundSosAlertWatcher from './src/features/alerts/components/ForegroundSosAlertWatcher';
import ForegroundSosAlertOverlay from './src/features/alerts/components/ForegroundSosAlertOverlay';

installAppAlertPatch();
installI18nRuntimePatch();

/**
 * Request notification permission for both Android and iOS.
 */
const requestNotificationPermission = async () => {
  try {
    /**
     * ─────────────────────────────────────────
     * ANDROID
     * ─────────────────────────────────────────
     */
    if (Platform.OS === 'android') {
      console.log(
        '[FCM] Android version:',
        Platform.Version,
      );

      // Android 13 / API 33+
      if (Platform.Version >= 33) {
        const permission =
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

        const alreadyGranted =
          await PermissionsAndroid.check(permission);

        console.log(
          '[FCM] Android notification permission:',
          alreadyGranted,
        );

        if (alreadyGranted) {
          console.log(
            '[FCM] Android notification permission already granted.',
          );
        } else {
          console.log(
            '[FCM] Requesting Android notification permission...',
          );

          const result =
            await PermissionsAndroid.request(permission);

          console.log(
            '[FCM] Android notification permission result:',
            result,
          );

          if (
            result ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log(
              '[FCM] Android notification permission GRANTED.',
            );
          } else if (
            result ===
            PermissionsAndroid.RESULTS.DENIED
          ) {
            console.log(
              '[FCM] Android notification permission DENIED.',
            );
          } else if (
            result ===
            PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ) {
            console.log(
              '[FCM] Android notification permission NEVER_ASK_AGAIN.',
            );
          }
        }
      } else {
        console.log(
          '[FCM] Android < 13. Runtime notification permission not required.',
        );
      }

      return;
    }

    /**
     * ─────────────────────────────────────────
     * iOS
     * ─────────────────────────────────────────
     */
    if (Platform.OS === 'ios') {
      console.log(
        '[FCM] Requesting iOS notification permission...',
      );

      const messagingInstance = getMessaging();

      const authStatus =
        await requestPermission(messagingInstance);

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
        
      console.log(
        '[FCM] iOS notification authorization status:',
        authStatus,
      );

      console.log(
        '[FCM] iOS notifications enabled:',
        enabled,
      );

      if (enabled) {
        console.log(
          '[FCM] iOS notification permission GRANTED.',
        );
      } else {
        console.log(
          '[FCM] iOS notification permission DENIED.',
        );
      }
    }
  } catch (error) {
    console.error(
      '[FCM] Failed to request notification permission:',
      error,
    );
  }
};

function AppContent() {
  const {resolvedTheme, colors} = useAppTheme();

  const isDarkMode = resolvedTheme === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={
          isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={colors.background}
      />

      <AuthWatcher />

      <AppNavigator />

      <ForegroundSosAlertWatcher />

      <ForegroundSosAlertOverlay />

      <AppAlertHost />
    </SafeAreaProvider>
  );
}

function App() {
  useEffect(() => {
    console.log('[FCM] App started.');

    requestNotificationPermission();
  }, []);

  return (
    <Provider store={store}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </Provider>
  );
}

export default App;