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
      console.warn('[FCM] Cannot register empty token');
      return false;
    }

    const payload = {
      deviceToken,
      platform: Platform.OS,
    };

    console.log('[FCM] Registering device token:', {
      platform: Platform.OS,
    });

    const response = await apiFetch(
      `${API_BASE_URL}/api/notifications/device-token`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
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
 * The backend gets the authenticated user's identity
 * from the JWT, so userId is only used to ensure that
 * an authenticated user is available before registration.
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

    console.log(
      '[FCM] Starting push notification registration',
    );

    // =====================================================
    // 1. Request notification permission
    // =====================================================

    console.log(
      '[FCM] Requesting notification permission...',
    );

    const authStatus = await requestPermission(
      messaging,
    );

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log(
      '[FCM] Notification authorization status:',
      authStatus,
    );

    if (!enabled) {
      console.warn(
        '[FCM] Push notification permission was not granted',
      );

      return null;
    }

    console.log(
      '[FCM] Push notification permission granted',
    );

    // =====================================================
    // 2. Get current FCM token
    // =====================================================

    console.log(
      '[FCM] Requesting FCM token...',
    );

    const token = await getToken(messaging);

    if (!token) {
      console.warn(
        '[FCM] FCM token was not available',
      );

      return null;
    }

    console.log(
      '[FCM] FCM token received successfully',
    );

    // =====================================================
    // 3. Register token with backend
    // =====================================================

    const registered =
      await registerDeviceToken(token);

    if (!registered) {
      console.error(
        '[FCM] FCM token could not be registered with backend',
      );

      return null;
    }

    console.log(
      '[FCM] Push notification registration completed',
    );

    return token;
  } catch (error) {
    console.error(
      '[FCM] Failed to register push notifications:',
      error,
    );

    return null;
  }
}