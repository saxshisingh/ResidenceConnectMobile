import {
  getMessaging,
  requestPermission,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {Platform} from 'react-native';

import {API_BASE_URL} from '../config/api';
import {apiFetch} from '../shared/api/apiClient';

/**
 * Register an FCM device token with the backend.
 *
 * The backend identifies the authenticated user
 * from the JWT attached by apiFetch().
 */
export async function registerDeviceToken(
  deviceToken: string,
): Promise<boolean> {
  try {
    if (!deviceToken) {
      console.warn(
        '[FCM] Cannot register empty token',
      );

      return false;
    }

    const response = await apiFetch(
      `${API_BASE_URL}/api/notifications/device-token`,
      {
        method: 'POST',
        body: JSON.stringify({
          deviceToken,
          platform: Platform.OS,
          deviceId: undefined,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Device token registration failed: ${response.status} ${errorText}`,
      );
    }

    console.log(
      '[FCM] Device token registered successfully',
    );

    return true;
  } catch (error) {
    console.error(
      '[FCM] Failed to register device token:',
      error,
    );

    return false;
  }
}

/**
 * Request notification permission, obtain the
 * current FCM token and register it with backend.
 *
 * userId is kept as an argument because the caller
 * already has the authenticated user, but the backend
 * gets the actual user identity from the JWT.
 */
export async function registerForPushNotifications(
  userId: string,
): Promise<string | null> {
  try {
    if (!userId) {
      console.warn(
        '[FCM] Cannot register push notifications without user ID',
      );

      return null;
    }

    const messaging = getMessaging();

    /*
     * 1. Request notification permission
     */
    const authStatus =
      await requestPermission(messaging);

    const enabled =
      authStatus ===
        AuthorizationStatus.AUTHORIZED ||
      authStatus ===
        AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log(
        '[FCM] Push notification permission not granted',
      );

      return null;
    }

    /*
     * 2. Get the current FCM token
     */
    const token =
      await getToken(messaging);

    if (!token) {
      console.log(
        '[FCM] FCM token not available',
      );

      return null;
    }

    console.log(
      '[FCM] FCM TOKEN:',
      token,
    );

    /*
     * 3. Register token with backend
     */
    const registered =
      await registerDeviceToken(token);

    if (!registered) {
      return null;
    }

    return token;
  } catch (error) {
    console.error(
      '[FCM] Failed to register push notifications:',
      error,
    );

    return null;
  }
}