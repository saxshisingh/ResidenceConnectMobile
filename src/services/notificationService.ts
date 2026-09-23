import {
  AuthorizationStatus,
  getAPNSToken,
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';

import {Platform} from 'react-native';

import {API_BASE_URL} from '../config/api';
import {apiFetch} from '../shared/api/apiClient';

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface RegisterDeviceTokenPayload {
  deviceToken: string;
  platform: string;
  deviceId?: string;
}

/**
 * ============================================================
 * REGISTER TOKEN WITH BACKEND
 * ============================================================
 *
 * This function is responsible ONLY for sending the FCM token
 * to the backend.
 *
 * The backend gets userId from the authenticated JWT.
 */
export async function registerDeviceToken(
  deviceToken: string,
): Promise<boolean> {
  try {
    if (!deviceToken || !deviceToken.trim()) {
      console.warn(
        '[FCM] Cannot register empty FCM token',
      );

      return false;
    }

    const payload: RegisterDeviceTokenPayload = {
      deviceToken: deviceToken.trim(),
      platform: Platform.OS,
    };

    console.log(
      '[FCM] Registering device token',
      {
        platform: Platform.OS,
        tokenLength: deviceToken.length,
        tokenPreview: `${deviceToken.substring(0, 12)}...`,
      },
    );

    const url =
      `${API_BASE_URL}/api/notifications/device-token`;

    console.log(
      '[FCM] Device token API:',
      url,
    );

    const response = await apiFetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const responseText =
      await response.text();

    console.log(
      '[FCM] Device token API status:',
      response.status,
    );

    console.log(
      '[FCM] Device token API response:',
      responseText,
    );

    if (!response.ok) {
      console.error(
        '[FCM] Device token registration failed:',
        response.status,
        responseText,
      );

      return false;
    }

    console.log(
      '[FCM] Device token registered successfully',
    );

    return true;

  } catch (error) {
    console.error(
      '[FCM] Device token registration exception:',
      error,
    );

    return false;
  }
}

/**
 * ============================================================
 * WAIT FOR APNs TOKEN
 * ============================================================
 *
 * iOS needs an APNs token before FCM can reliably provide
 * the FCM registration token.
 */
async function waitForAPNSToken(
  messaging: ReturnType<typeof getMessaging>,
  timeoutMs: number = 15000,
): Promise<string | null> {

  const startedAt = Date.now();

  console.log(
    '[FCM] Waiting for APNs token...',
  );

  while (
    Date.now() - startedAt <
    timeoutMs
  ) {

    try {
      const apnsToken =
        await getAPNSToken(messaging);

      if (apnsToken) {

        console.log(
          '[FCM] APNs token received',
          {
            length: apnsToken.length,
            preview:
              `${apnsToken.substring(0, 12)}...`,
          },
        );

        return apnsToken;
      }

    } catch (error) {

      console.warn(
        '[FCM] Error while reading APNs token:',
        error,
      );
    }

    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  console.error(
    '[FCM] APNs token was not received within timeout',
  );

  return null;
}

/**
 * ============================================================
 * MAIN PUSH REGISTRATION
 * ============================================================
 *
 * This is the ONLY function AuthProvider should call.
 *
 * iOS:
 *
 * 1. Request notification permission
 * 2. Register device for APNs
 * 3. Wait for APNs token
 * 4. Get FCM token
 * 5. Register FCM token with backend
 *
 * Android:
 *
 * 1. Request permission
 * 2. Get FCM token
 * 3. Register token with backend
 */
export async function registerForPushNotifications(
  userId: string,
): Promise<string | null> {

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

    /**
     * --------------------------------------------------------
     * Validate authenticated user
     * --------------------------------------------------------
     */

    if (!userId) {

      console.warn(
        '[FCM] No authenticated user ID',
      );

      return null;
    }

    /**
     * --------------------------------------------------------
     * Get Firebase Messaging instance
     * --------------------------------------------------------
     */

    const messaging =
      getMessaging();

    /**
     * --------------------------------------------------------
     * Request notification permission
     * --------------------------------------------------------
     */

    console.log(
      '[FCM] Requesting notification permission...',
    );

    const authStatus =
      await requestPermission(
        messaging,
      );

    console.log(
      '[FCM] Authorization status:',
      authStatus,
    );

    const permissionGranted =
      authStatus ===
        AuthorizationStatus.AUTHORIZED ||
      authStatus ===
        AuthorizationStatus.PROVISIONAL;

    if (!permissionGranted) {

      console.warn(
        '[FCM] Notification permission NOT granted',
      );

      return null;
    }

    console.log(
      '[FCM] Notification permission granted',
    );

    /**
     * --------------------------------------------------------
     * iOS APNs registration
     * --------------------------------------------------------
     */

    if (Platform.OS === 'ios') {

      console.log(
        '[FCM][iOS] Checking APNs registration...',
      );

      if (
        !messaging.isDeviceRegisteredForRemoteMessages
      ) {

        console.log(
          '[FCM][iOS] Registering device for remote messages...',
        );

        await registerDeviceForRemoteMessages(
          messaging,
        );

        console.log(
          '[FCM][iOS] Device registered for remote messages',
        );

      } else {

        console.log(
          '[FCM][iOS] Device already registered for remote messages',
        );
      }

      /**
       * ------------------------------------------------------
       * Wait for APNs token
       * ------------------------------------------------------
       */

      const apnsToken =
        await waitForAPNSToken(
          messaging,
        );

      if (!apnsToken) {

        console.error(
          '[FCM][iOS] APNs token unavailable',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] APNs registration completed',
      );
    }

    /**
     * --------------------------------------------------------
     * Get FCM token
     * --------------------------------------------------------
     */

    console.log(
      '[FCM] Requesting FCM registration token...',
    );

    const fcmToken =
      await getToken(
        messaging,
      );

    if (
      !fcmToken ||
      !fcmToken.trim()
    ) {

      console.error(
        '[FCM] FCM token was not generated',
      );

      return null;
    }

    console.log(
      '[FCM] FCM token generated successfully',
      {
        length: fcmToken.length,
        preview:
          `${fcmToken.substring(0, 12)}...`,
      },
    );

    /**
     * --------------------------------------------------------
     * Register FCM token with backend
     * --------------------------------------------------------
     */

    const registered =
      await registerDeviceToken(
        fcmToken,
      );

    if (!registered) {

      console.error(
        '[FCM] FCM token generated but backend registration failed',
      );

      return null;
    }

    console.log(
      '[FCM] ========================================',
    );

    console.log(
      '[FCM] PUSH REGISTRATION COMPLETED',
    );

    console.log(
      '[FCM] Platform:',
      Platform.OS,
    );

    console.log(
      '[FCM] ========================================',
    );

    return fcmToken;

  } catch (error) {

    console.error(
      '[FCM] Push registration failed:',
      error,
    );

    return null;
  }
}