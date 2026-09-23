import {Alert, Platform} from 'react-native';

import {apiFetch} from '../shared/api/apiClient';
import {API_BASE_URL} from '../config/api';

import {
  getMessaging,
  requestPermission,
  getToken,
  getAPNSToken,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

/* ==============================================================
 * DEBUG HELPER
 * ============================================================== */

const showFcmDebug = (
  title: string,
  message: string,
) => {
  console.log(
    `[FCM][DEBUG] ${title}: ${message}`,
  );

  Alert.alert(
    `FCM DEBUG - ${title}`,
    message,
    [
      {
        text: 'OK',
        style: 'default',
      },
    ],
  );
};

/* ==============================================================
 * REGISTER DEVICE TOKEN WITH BACKEND
 * ============================================================== */

export const registerDeviceToken = async (
  deviceToken: string,
): Promise<boolean> => {
  try {
    console.log(
      '[FCM][Backend] Starting device token registration',
    );

    if (!deviceToken) {
      console.error(
        '[FCM][Backend] Device token is empty',
      );

      showFcmDebug(
        'Backend',
        'Device token is empty',
      );

      return false;
    }

    const payload = {
      deviceToken,
      platform: Platform.OS,
      deviceId: null,
    };

    console.log(
      '[FCM][Backend] Platform:',
      Platform.OS,
    );

    console.log(
      '[FCM][Backend] Token length:',
      deviceToken.length,
    );

    console.log(
      '[FCM][Backend] Sending token to backend...',
    );

    showFcmDebug(
      'BACKEND',
      `Sending FCM token to backend\n\nPlatform: ${Platform.OS}\nToken length: ${deviceToken.length}`,
    );

    const response = await apiFetch(
      `${API_BASE_URL}/api/notifications/device-token`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    console.log(
      '[FCM][Backend] HTTP status:',
      response.status,
    );

    const responseText =
      await response.text();

    console.log(
      '[FCM][Backend] Response:',
      responseText,
    );

    if (!response.ok) {
      console.error(
        '[FCM][Backend] Registration failed',
      );

      showFcmDebug(
        'BACKEND FAILED',
        `Backend rejected device token\n\nHTTP Status: ${response.status}\n\nResponse:\n${responseText}`,
      );

      return false;
    }

    console.log(
      '[FCM][Backend] Device token registered successfully',
    );

    showFcmDebug(
      'SUCCESS',
      `FCM token registered successfully with backend\n\nHTTP Status: ${response.status}\nPlatform: ${Platform.OS}`,
    );

    return true;
  } catch (error: any) {
    console.error(
      '[FCM][Backend] Registration exception:',
      error?.message ?? error,
    );

    console.error(
      '[FCM][Backend] Error code:',
      error?.code,
    );

    showFcmDebug(
      'BACKEND ERROR',
      `Backend registration exception\n\nMessage: ${
        error?.message ?? String(error)
      }\n\nCode: ${error?.code ?? 'N/A'}`,
    );

    return false;
  }
};

/* ==============================================================
 * REGISTER FOR PUSH NOTIFICATIONS
 * ============================================================== */

export const registerForPushNotifications = async (
  userId: string,
): Promise<string | null> => {
  try {
    console.log(
      '[FCM] ========================================',
    );

    console.log(
      '[FCM] Starting push notification registration',
    );

    console.log(
      '[FCM] Platform:',
      Platform.OS,
    );

    console.log(
      '[FCM] User ID:',
      userId,
    );

    console.log(
      '[FCM] ========================================',
    );

    /* ==========================================================
     * BASIC VALIDATION
     * ========================================================== */

    if (!userId) {
      console.warn(
        '[FCM] User ID is missing',
      );

      showFcmDebug(
        'ERROR',
        'User ID is missing.\n\nPush registration cannot continue.',
      );

      return null;
    }

    /* ==========================================================
     * FIREBASE MESSAGING INSTANCE
     * ========================================================== */

    const messaging =
      getMessaging();

    /* ==========================================================
     * ANDROID
     * ============================================================== */

    if (Platform.OS === 'android') {
      try {
        console.log(
          '[FCM][Android] Getting FCM token...',
        );

        showFcmDebug(
          'ANDROID',
          'Android detected.\n\nGetting FCM token...',
        );

        const token =
          await getToken(messaging);

        if (!token) {
          console.warn(
            '[FCM][Android] FCM token is empty',
          );

          showFcmDebug(
            'ANDROID FAILED',
            'Firebase returned an empty FCM token.',
          );

          return null;
        }

        console.log(
          '[FCM][Android] FCM token received',
        );

        console.log(
          '[FCM][Android] Token length:',
          token.length,
        );

        showFcmDebug(
          'ANDROID TOKEN',
          `FCM token received successfully.\n\nToken length: ${token.length}`,
        );

        const registered =
          await registerDeviceToken(
            token,
          );

        if (!registered) {
          return null;
        }

        return token;
      } catch (error: any) {
        console.error(
          '[FCM][Android] Registration error:',
          error,
        );

        showFcmDebug(
          'ANDROID ERROR',
          `Android FCM registration failed.\n\n${
            error?.message ?? String(error)
          }`,
        );

        return null;
      }
    }

    /* ==========================================================
     * IOS
     * ============================================================== */

    if (Platform.OS === 'ios') {
      /* ----------------------------------------------------------
       * STEP 1 - REQUEST NOTIFICATION PERMISSION
       * ---------------------------------------------------------- */

      console.log(
        '[FCM][iOS] Requesting notification permission...',
      );

      showFcmDebug(
        'iOS STEP 1',
        'Requesting notification permission...',
      );

      const authStatus =
        await requestPermission(
          messaging,
        );

      console.log(
        '[FCM][iOS] Authorization status:',
        authStatus,
      );

      const permissionGranted =
        authStatus ===
          AuthorizationStatus.AUTHORIZED ||
        authStatus ===
          AuthorizationStatus.PROVISIONAL;

      if (!permissionGranted) {
        console.warn(
          '[FCM][iOS] Notification permission was not granted',
        );

        showFcmDebug(
          'iOS PERMISSION FAILED',
          `Notification permission was not granted.\n\nAuthorization status: ${authStatus}`,
        );

        return null;
      }

      showFcmDebug(
        'iOS STEP 1 SUCCESS',
        `Notification permission granted.\n\nAuthorization status: ${authStatus}`,
      );

      /* ----------------------------------------------------------
       * STEP 2 - REGISTER DEVICE FOR REMOTE MESSAGES
       * ---------------------------------------------------------- */

      console.log(
        '[FCM][iOS] Checking remote message registration...',
      );

      let isRegistered =
        messaging.isDeviceRegisteredForRemoteMessages;

      console.log(
        '[FCM][iOS] Already registered:',
        isRegistered,
      );

      if (!isRegistered) {
        console.log(
          '[FCM][iOS] Registering device for remote messages...',
        );

        showFcmDebug(
          'iOS STEP 2',
          'Registering device with Apple APNs...',
        );

        await registerDeviceForRemoteMessages(
          messaging,
        );

        isRegistered =
          messaging.isDeviceRegisteredForRemoteMessages;

        console.log(
          '[FCM][iOS] Registration completed:',
          isRegistered,
        );
      }

      if (!isRegistered) {
        console.warn(
          '[FCM][iOS] Device is not registered for remote messages',
        );

        showFcmDebug(
          'iOS APNs REGISTRATION FAILED',
          'The iPhone could not register for remote notifications.\n\nNo APNs registration was detected.',
        );

        return null;
      }

      showFcmDebug(
        'iOS STEP 2 SUCCESS',
        'Device registered for remote messages.\n\nAPNs registration request completed.',
      );

      /* ----------------------------------------------------------
       * STEP 3 - WAIT FOR APNs TOKEN
       * ---------------------------------------------------------- */

      console.log(
        '[FCM][iOS] Waiting for APNs token...',
      );

      showFcmDebug(
        'iOS STEP 3',
        'Waiting for APNs device token...',
      );

      let apnsToken:
        | string
        | null = null;

      const maxAttempts = 15;

      for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
      ) {
        try {
          apnsToken =
            await getAPNSToken(
              messaging,
            );
        } catch (error: any) {
          console.warn(
            '[FCM][iOS] getAPNSToken error:',
            error?.message ?? error,
          );
        }

        if (apnsToken) {
          break;
        }

        console.log(
          `[FCM][iOS] APNs token not available yet. Attempt ${attempt}/${maxAttempts}`,
        );

        await new Promise<void>(
          resolve => {
            setTimeout(
              resolve,
              1000,
            );
          },
        );
      }

      /* ----------------------------------------------------------
       * APNs TOKEN CHECK
       * ---------------------------------------------------------- */

      if (!apnsToken) {
        console.error(
          '[FCM][iOS] APNs token was not received',
        );

        showFcmDebug(
          'iOS APNs TOKEN FAILED',
          'APNs token was NOT received after 15 seconds.\n\nThis means the problem is before FCM token generation.',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] APNs token received',
      );

      console.log(
        '[FCM][iOS] APNs token length:',
        apnsToken.length,
      );

      showFcmDebug(
        'iOS STEP 3 SUCCESS',
        `APNs token received successfully.\n\nToken length: ${apnsToken.length}`,
      );

      /* ----------------------------------------------------------
       * STEP 4 - GET FCM TOKEN
       * ---------------------------------------------------------- */

      console.log(
        '[FCM][iOS] Getting FCM token...',
      );

      showFcmDebug(
        'iOS STEP 4',
        'APNs token exists.\n\nNow requesting Firebase FCM token...',
      );

      const token =
        await getToken(messaging);

      if (!token) {
        console.error(
          '[FCM][iOS] FCM token is empty',
        );

        showFcmDebug(
          'iOS FCM TOKEN FAILED',
          'APNs token exists, but Firebase did not return an FCM token.',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] FCM token received',
      );

      console.log(
        '[FCM][iOS] FCM token length:',
        token.length,
      );

      showFcmDebug(
        'iOS STEP 4 SUCCESS',
        `FCM token received successfully.\n\nToken length: ${token.length}`,
      );

      /* ----------------------------------------------------------
       * STEP 5 - SEND FCM TOKEN TO BACKEND
       * ---------------------------------------------------------- */

      console.log(
        '[FCM][iOS] Registering FCM token with backend...',
      );

      const registered =
        await registerDeviceToken(
          token,
        );

      if (!registered) {
        showFcmDebug(
          'iOS STEP 5 FAILED',
          'FCM token was generated, but backend registration failed.',
        );

        return null;
      }

      /* ----------------------------------------------------------
       * COMPLETE
       * ---------------------------------------------------------- */

      console.log(
        '[FCM][iOS] ========================================',
      );

      console.log(
        '[FCM][iOS] PUSH REGISTRATION COMPLETED',
      );

      console.log(
        '[FCM][iOS] APNs token: RECEIVED',
      );

      console.log(
        '[FCM][iOS] FCM token: RECEIVED',
      );

      console.log(
        '[FCM][iOS] Backend registration: SUCCESS',
      );

      console.log(
        '[FCM][iOS] ========================================',
      );

      showFcmDebug(
        'iOS COMPLETE',
        'Push notification registration completed successfully.\n\n✓ APNs token received\n✓ FCM token received\n✓ Backend registration successful',
      );

      return token;
    }

    /* ==========================================================
     * UNSUPPORTED PLATFORM
     * ============================================================== */

    console.warn(
      '[FCM] Unsupported platform:',
      Platform.OS,
    );

    showFcmDebug(
      'UNSUPPORTED PLATFORM',
      `Push notifications are not configured for platform: ${Platform.OS}`,
    );

    return null;
  } catch (error: any) {
    console.error(
      '[FCM] ========================================',
    );

    console.error(
      '[FCM] PUSH REGISTRATION FAILED',
    );

    console.error(
      '[FCM] Error:',
      error,
    );

    console.error(
      '[FCM] Error message:',
      error?.message,
    );

    console.error(
      '[FCM] Error code:',
      error?.code,
    );

    console.error(
      '[FCM] ========================================',
    );

    showFcmDebug(
      'REGISTRATION ERROR',
      `Push notification registration failed.\n\nMessage: ${
        error?.message ?? String(error)
      }\n\nCode: ${error?.code ?? 'N/A'}`,
    );

    return null;
  }
};